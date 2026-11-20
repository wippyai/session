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
local reader = require("reader")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local trait_config = require("trait_config")
local activation = require("activation")
local message_handlers = require("message_handlers")
local session = require("session")
local time = require("time")

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
local FORBIDDEN = "app.approval:forbidden_tool"
local TABLES = { "session_tool_approvals", "session_tool_approval_batches",
    "session_tool_approval_grants", "session_command_receipts" }
local PLUGIN_PID = "session-plugin-pid"

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
--   opts.session_id  an existing session: a new process of it (fresh wake
--                    hub and turn)
--   opts.user_id     the user the process runs for (default the test actor)
local function new_ctx(opts: any?): (any, any)
    opts = opts or {}
    local owner = opts.user_id or assert(security.actor(), "the test needs a security actor"):id()
    local session_id = opts.session_id or new_session({ config = { agent_id = AGENT } })
    local captured = { updates = {}, session_updates = {}, notices = {}, replies = {} }
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
            update_session = function(_self, changes)
                table.insert(captured.session_updates, changes)
                return true
            end,
            session_error = function(_self, code, message)
                table.insert(captured.notices, { code = code, message = message })
            end,
            command_success = function(_self, request_id, details)
                table.insert(captured.replies, { request_id = request_id, success = true, details = details })
            end,
            command_error = function(_self, request_id, code, message, payload)
                table.insert(captured.replies, { request_id = request_id, success = false, code = code,
                    message = message, details = payload })
            end,
        },
        -- The session plugin that started the process (approval commands
        -- are accepted only from it).
        parent_pid = PLUGIN_PID,
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
        -- A running process announced this activation when it opened.
        ctx.tool_approval_published_revision = config.tool_approval.revision
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

-- Starts process_tools in its own coroutine, as the command bus runs it.
-- Returns a handle for finish().
local function start(ctx: any, op: any): any
    local handle = { done = channel.new(1), started = time.now():unix() }
    coroutine.spawn(function()
        local ok, result, err = pcall(message_handlers.process_tools, ctx, op)
        handle.done:send({ ok = ok, result = result, err = err })
    end)
    return handle
end

-- Waits for process_tools to return (at most `seconds`, default 10). Returns
-- its result, its error and the seconds it took; raises when it did not
-- return in time or raised itself.
local function finish(handle: any, seconds: number?): (any, any, number)
    local selected = channel.select({ handle.done:case_receive(),
        time.after(tostring(seconds or 10) .. "s"):case_receive() })
    if selected.channel ~= handle.done then error("process_tools did not return in time") end
    local outcome = selected.value
    if not outcome.ok then error(tostring(outcome.result)) end
    return outcome.result, outcome.err, time.now():unix() - handle.started
end

-- Yields until the batch has `n` pending requests (the gate waits then).
local function pending(ctx: any, batch_id: string, n: number)
    for _ = 1, 200 do
        local records = approval_repo.list_by_batch(nil, ctx.session_id, batch_id) or {}
        local found = 0
        for _, record in ipairs(records) do
            if record.state == "pending" then found = found + 1 end
        end
        if found >= n then return end
        time.sleep("20ms")
    end
    error("the gate did not create its requests")
end

-- The inbox's Stop (route_input): the Stop transaction with the approval
-- fence, the wake signal, then what bus:request_stop does.
local function stop(ctx: any)
    local committed, err = session._commit_stop(ctx, ctx.upstream, nil)
    if committed ~= true then error("Stop was not committed: " .. tostring(err)) end
    ctx.approval_wake:notify("stop")
    ctx.coordinator.state = "draining_stop"
    ctx.coordinator.cancel:close()
end

-- A committed steering message: a pending input row, then the wake signal
-- unless `quiet`.
local function steer(ctx: any, quiet: boolean?)
    assert(ctx.writer:add_message(consts.MSG_TYPE.USER, "Use c_10 instead", { input = { state = "pending" } }))
    if not quiet then ctx.approval_wake:notify("steering") end
end

-- The stored state of a protected session whose process stopped while a
-- tool round of the approval gate was under way: the activation stored, the
-- status running, the batch and its call rows, one approval record per entry
-- of opts.requests ({ [call_id] = "pending" | "approved" | { state, then,
-- reason } }, default call-a pending and call-b approved), the activity of a
-- waiting batch and, unless opts.no_controls, a pending behavior round on
-- the assistant row whose control would set the session context key
-- `replayed`. opts.calls replaces the default calls (call-a and call-b
-- marked, call-c plain). opts.offered is the offer of every request. Returns ctx, op, the batch
-- record and what ctx's upstream captured.
local function crashed_batch(opts: any?): (any, any, any)
    opts = opts or {}
    local ctx, captured = new_ctx({ live = 1, session_id = opts.session_id })
    assert(approval_repo.update_tool_approval(ctx.session_id, function() return ctx.config.tool_approval end))
    local op, batch = round(ctx, opts.calls or {
        { id = "call-a", registry_id = MARKED, args = { n = 1 } },
        { id = "call-b", registry_id = MARKED, args = { n = 2 } },
        { id = "call-c", registry_id = PLAIN, args = {} },
    })
    local requests = opts.requests or { ["call-a"] = "pending", ["call-b"] = "approved" }
    local expires_at = approval_repo.timestamp(time.now():unix() + 900)
    assert(approval_repo.transact(ctx.session_id, function(dbtx)
        local pending_ids = {}
        for _, call in ipairs(op.tool_calls) do
            local wanted = requests[call.id]
            if wanted then
                local record, create_err = approval_repo.create_request(dbtx, {
                    approval_id = uuid.v7(), session_id = ctx.session_id, batch_id = batch.batch_id,
                    tool_message_id = op.call_message_ids[call.id], row_type = consts.MSG_TYPE.FUNCTION,
                    call_id = call.id, registry_id = call.registry_id,
                    intent_digest = "sha256:" .. string.rep("0", 64), display = { title = call.id },
                    expires_at = expires_at, offered = opts.offered,
                })
                if not record then return nil, create_err end
                local decision = type(wanted) == "table" and wanted or nil
                if wanted == "approved" then decision = { state = "approved" } end
                if decision then
                    local decided, decide_err = approval_repo.decide(dbtx, ctx.session_id, record.approval_id,
                        record.revision, { state = decision.state, decided_via = "user",
                            ["then"] = decision["then"], reason = decision.reason, decided_by = ctx.user_id })
                    if not decided then return nil, decide_err end
                    record = decided
                else
                    pending_ids[#pending_ids + 1] = record.approval_id
                end
                local _, projection_err = message_repo.update_metadata(record.tool_message_id,
                    { approval = approval_repo.projection(record) }, ctx.session_id, { tx = dbtx })
                if projection_err then return nil, projection_err end
            end
        end
        if #pending_ids > 0 then
            local written, activity_err = approval_repo.write_activity(dbtx, ctx.session_id,
                { kind = "awaiting_tool_approval", approval_ids = pending_ids })
            if not written then return nil, activity_err end
        end
        return true
    end))
    if not opts.no_controls then
        assert(ctx.writer:update_message_meta(op.checkpoint_anchor_id, {
            behavior_controls = { { context = { session = { set = { replayed = "yes" } } } } },
            behavior_control_state = "pending",
            behavior_call_message_ids = op.call_message_ids,
        }))
    end
    assert(ctx.writer:update_meta({ status = consts.STATUS.RUNNING,
        meta = { behavior_controls_pending = not opts.no_controls } }))
    return ctx, op, batch, captured
end

-- One line that describes what recovery left of a crashed_batch: per call
-- "<call>=<record state or ->/<row status>/<outcome>" (outcome
-- not_run:<reason>, unknown for "interrupted, outcome unknown", or the
-- result text), then the batch "state:close_reason:controls" and the
-- activity kind.
local function recovery_summary(ctx: any, op: any, batch: any): string
    local records = records_by_call(ctx.session_id, batch.batch_id)
    local parts = {}
    for _, call in ipairs(op.tool_calls) do
        local record = records[call.id]
        local metadata = row(op.call_message_ids[call.id]).metadata
        local result = metadata.result
        local outcome = tostring(result)
        if type(result) == "table" then
            outcome = result.executed == false and ("not_run:" .. tostring(result.reason)) or "result"
        elseif result == message_repo.INTERRUPTED_RESULT then
            outcome = "unknown"
        end
        parts[#parts + 1] = string.format("%s=%s/%s/%s", call.id, record and record.state or "-",
            tostring(metadata.status), outcome)
    end
    local stored = assert(approval_repo.get_batch(nil, batch.batch_id))
    parts[#parts + 1] = string.format("batch=%s:%s:%s", stored.state, tostring(stored.close_reason), stored.controls)
    local activity = assert(approval_repo.read_activity(nil, ctx.session_id))
    parts[#parts + 1] = "activity=" .. tostring(type(activity.activity) == "table" and activity.activity.kind or nil)
    return table.concat(parts, " ")
end

-- The behavior round of a crashed_batch as stored: "<round state>
-- replayed=<session context value>". With `recover`, the next session
-- start's behavior control recovery runs first, on the stored session.
local function round_controls(ctx: any, op: any, recover: boolean?): string
    if recover then
        assert(message_handlers.recover_behavior_controls({
            session_id = ctx.session_id, config = ctx.config, upstream = ctx.upstream,
            reader = assert(reader.open(ctx.session_id)), writer = assert(writer.new(ctx.session_id)),
        }))
    end
    local state = row(op.checkpoint_anchor_id).metadata.behavior_control_state
    local replayed = assert(reader.open(ctx.session_id)):get_context("replayed")
    return tostring(state) .. " replayed=" .. tostring(replayed)
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
    DELEGATE = DELEGATE, TARGET = TARGET, FORBIDDEN = FORBIDDEN, TABLES = TABLES, PLUGIN_PID = PLUGIN_PID,
    count = count, new_session = new_session, new_ctx = new_ctx, fake_caller = fake_caller,
    entry_meta = entry_meta, round = round, row = row, updates_of = updates_of,
    has_continue = has_continue, launches = launches, records_by_call = records_by_call,
    create_tool_grant = create_tool_grant, start = start, finish = finish, pending = pending,
    stop = stop, steer = steer, cleanup = cleanup,
    crashed_batch = crashed_batch, recovery_summary = recovery_summary, round_controls = round_controls,
}