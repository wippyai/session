local sql = require("sql")
local uuid = require("uuid")
local registry = require("registry")
local security = require("security")
local consts = require("consts")
local tx = require("tx")
local approval_gate = require("approval_gate")
local approval_repo = require("approval_repo")
local message_repo = require("message_repo")
local fingerprint = require("fingerprint")
local wake = require("wake")
local writer = require("writer")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local trait_config = require("trait_config")
local activation = require("activation")

-- Shared fixtures of the tool approval suites: sessions that are deleted
-- after the suite, a process_tools context on a session owned by the test
-- actor, a fake tool caller that records every launch, a stored model
-- response with its PROCESS_TOOLS operation, and readers for rows, events
-- and records.
local AGENT = "app.approval:test_agent"
local MARKED = "app.approval:marked_tool"
local GRANTED = "app.approval:granted_tool"
local PLAIN = "app.approval:plain_tool"
local PRIVATE = "app.approval:private_tool"
local DELEGATE = "app.approval:delegate_tool"
local TARGET = "app.approval:target_agent"
local TABLES = { "session_tool_approvals", "session_tool_approval_batches",
    "session_tool_approval_grants", "session_command_receipts" }

local function count(table_name: string, session_id: string): number
    local db = assert(sql.get(consts.get_db_resource()))
    local rows, err = db:query("SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE session_id = $1", { session_id })
    db:release()
    if err then error(err) end
    return tonumber(rows[1].n) or 0
end

local fixtures = {}

-- Creates a session (opts.user_id, default the test actor; opts.config) with
-- its primary context; cleanup() deletes both. Returns the session ID.
local function new_session(opts: any?): string
    opts = opts or {}
    local context_id, session_id = uuid.v7(), uuid.v7()
    assert(context_repo.create(context_id, "primary", "{}"))
    assert(session_repo.create(session_id, opts.user_id or assert(security.actor()):id(), context_id, "Approval",
        "test", {}, opts.config or {}))
    table.insert(fixtures, { session_id = session_id, context_id = context_id })
    return session_id
end

-- A session owned by the test actor, and a process_tools context on it.
--   opts.protected   false: no stored activation and no policy
--   opts.policy      trait settings, plus enforcement = "off" and
--                    agent_opted_in = false (an agent without the trait)
--   opts.live        live approval UI surfaces
--   opts.declared    ui_declared_at of the stored activation
local function new_ctx(opts: any?): (any, any)
    opts = opts or {}
    local owner = assert(security.actor(), "the test needs a security actor"):id()
    local session_id = new_session({ config = { agent_id = AGENT } })
    local captured = { updates = {}, session_updates = {}, notices = {} }
    local config: any = { agent_id = AGENT, delegation_func_id = DELEGATE }
    local ctx: any = {
        session_id = session_id,
        user_id = owner,
        config = config,
        writer = assert(writer.new(session_id)),
        reader = {
            get_full_context = function() return {}, nil end,
            get_context = function() return nil end,
            reset = function() return true end,
            state = function() return { meta = {}, config = {} } end,
        },
        upstream = {
            send_message_update = function(_self, id, kind, payload)
                table.insert(captured.updates, { id = id, type = kind, payload = payload })
            end,
            update_session = function(_self, changes) table.insert(captured.session_updates, changes) end,
            session_error = function(_self, code, message)
                table.insert(captured.notices, { code = code, message = message })
            end,
        },
        turn_state = { message_id = "turn-" .. uuid.v7(), active = true, steps = 1, repeated_calls = 0 },
        approval_wake = wake.new(),
        approval_surfaces = opts.live and { live = opts.live, revision = 1 } or nil,
        -- The command bus fields the gate and process_tools read; stop()
        -- does what bus:request_stop does.
        coordinator = { state = "running", cancel = channel.new(),
            stop_requested = function(self) return self.state == "draining_stop" end },
        current_agent = { id = AGENT, tools = {} },
    }
    if opts.protected ~= false then
        local policy = opts.policy or {}
        local context = {}
        for _, key in ipairs(trait_config.SETTING_KEYS) do context[key] = policy[key] end
        local settings = assert(trait_config.normalize(context))
        config.tool_approval = activation.merge(nil, settings, opts.declared)
        ctx.tool_approval_policy = assert(trait_config.effective(config.tool_approval,
            policy.agent_opted_in ~= false and settings or nil, policy.enforcement or "enforce"))
    end
    return ctx, captured
end

-- A tool caller that records every call it is given and every launch.
local function fake_caller(): any
    local caller: any = { executed = {}, launches = {}, runs = 0 }
    function caller:set_strategy() end
    function caller:set_runtime_context_resolver() end
    function caller:execute(_context, tools, _cancel)
        self.runs = self.runs + 1
        local results = {}
        for call_id, tool in pairs(tools or {}) do
            self.executed[call_id] = true
            if tool.valid then
                self.launches[call_id] = true
                results[call_id] = { result = { ok = true }, tool_call = tool }
            else
                results[call_id] = { error = tool.error, tool_call = tool }
            end
        end
        return results
    end
    return caller
end

local function entry_meta(registry_id: string): any
    local entry = registry.get(registry_id)
    return entry and entry.meta or {}
end

-- Stores a model response with `calls` through the real writer (with the
-- batch record when the gate enforces) and builds the PROCESS_TOOLS op.
-- A call: { id, registry_id, name?, args?, type?, valid?, error?, raw_args?,
-- context?, stored_args? }.
local function round(ctx: any, calls: {any}, caller: any?): (any, any)
    local intents = {}
    for _, call in ipairs(calls) do
        intents[#intents + 1] = {
            id = call.id, name = call.name or call.id, registry_id = call.registry_id,
            arguments = call.stored_args or call.args or {}, type = call.type or consts.MSG_TYPE.FUNCTION,
        }
    end
    local assistant_id, ids, store_err, _date, batch = ctx.writer:add_response("", {}, intents, nil, nil,
        approval_gate.response_options(ctx))
    assert(assistant_id, store_err)
    local validated, types, tool_calls = {}, {}, {}
    for index, call in ipairs(calls) do
        types[call.id] = intents[index].type
        tool_calls[#tool_calls + 1] = { id = call.id, name = intents[index].name,
            arguments = intents[index].arguments, registry_id = call.registry_id }
        local args = call.raw_args
        if args == nil then args = call.args or {} end
        validated[call.id] = {
            call_id = call.id, name = intents[index].name, args = args, registry_id = call.registry_id,
            meta = entry_meta(call.registry_id), context = call.context,
            valid = call.valid ~= false, error = call.error,
        }
    end
    local op = {
        tool_calls = tool_calls, call_message_ids = ids, call_message_types = types,
        caller = caller or fake_caller(), validated_tools = validated,
        agent = { id = AGENT }, message_id = ctx.turn_state.message_id,
        checkpoint_anchor_id = assistant_id, approval = approval_gate.op_binding(ctx, batch),
    }
    return op, batch
end

local function row(message_id: string): any
    return assert(message_repo.get(message_id))
end

local function updates_of(captured: any, kind: string): {any}
    local out = {}
    for _, update in ipairs(captured.updates) do
        if update.type == kind then out[#out + 1] = update end
    end
    return out
end

local function has_continue(result: any): boolean
    for _, next_op in ipairs(result.next_ops or {}) do
        if next_op.type == consts.OP_TYPE.AGENT_CONTINUE then return true end
    end
    return false
end

local function launches(caller: any): number
    local n = 0
    for _ in pairs(caller.launches) do n = n + 1 end
    return n
end

local function records_by_call(session_id: string, batch_id: string): any
    local out = {}
    for _, record in ipairs(assert(approval_repo.list_by_batch(nil, session_id, batch_id))) do
        out[record.call_id] = record
    end
    return out
end

local function create_tool_grant(ctx: any, registry_id: string): any
    local tool_fingerprint = assert(fingerprint.of_entry(registry.get(registry_id)))
    return assert(tx.run(function(dbtx)
        return approval_repo.create_grant(dbtx, {
            grant_id = uuid.v7(), session_id = ctx.session_id, owner_id = ctx.user_id, epoch = ctx.session_id,
            scope = "tool", registry_id = registry_id, fingerprint = tool_fingerprint, created_by = ctx.user_id,
        })
    end))
end

-- Deletes every session the fixtures created.
local function cleanup()
    for _, fixture in ipairs(fixtures) do
        session_repo.delete(fixture.session_id)
        context_repo.delete(fixture.context_id)
    end
    fixtures = {}
end

return {
    AGENT = AGENT, MARKED = MARKED, GRANTED = GRANTED, PLAIN = PLAIN, PRIVATE = PRIVATE,
    DELEGATE = DELEGATE, TARGET = TARGET, TABLES = TABLES,
    count = count, new_session = new_session, new_ctx = new_ctx, fake_caller = fake_caller,
    entry_meta = entry_meta, round = round, row = row, updates_of = updates_of,
    has_continue = has_continue, launches = launches, records_by_call = records_by_call,
    create_tool_grant = create_tool_grant, cleanup = cleanup,
}