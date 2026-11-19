local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local registry = require("registry")
local security = require("security")
local consts = require("consts")
local tx = require("tx")
local approval_gate = require("approval_gate")
local approval_events = require("approval_events")
local approval_repo = require("approval_repo")
local message_repo = require("message_repo")
local message_handlers = require("message_handlers")
local policy = require("policy")
local fingerprint = require("fingerprint")
local tool_caller = require("tool_caller")
local wake = require("wake")
local writer = require("writer")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local wait_for_boot = require("wait_for_boot")

-- The approval gate up to the wait (EE2-2710 slice S7a): process_tools with
-- the real gate, the real store and a fake tool caller that records every
-- launch. Until slice S7b builds the wait and the release, a call that needs
-- approval (or that a grant allows) must end as not run, never run.

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

local function effective(overrides: any?): any
    local value = {
        active = true, enforcement = "enforce", require = "marked", approve_all = "off",
        timeout_seconds = 900, max_requests_per_turn = 10, agent_opted_in = true,
    }
    for key, item in pairs(overrides or {}) do value[key] = item end
    return value
end

local fixtures = {}

-- A session owned by the test actor, and a process_tools context on it.
--   opts.protected   false: no stored activation and no policy
--   opts.policy      overrides of the effective policy
--   opts.live        live approval UI surfaces
--   opts.declared    ui_declared_at of the stored activation
local function new_ctx(opts: any?): (any, any)
    opts = opts or {}
    local actor = assert(security.actor(), "the test needs a security actor")
    local owner = actor:id()
    local context_id, session_id = uuid.v7(), uuid.v7()
    assert(context_repo.create(context_id, "primary", "{}"))
    assert(session_repo.create(session_id, owner, context_id, "Gate", "test", {}, { agent_id = AGENT }))
    table.insert(fixtures, { session_id = session_id, context_id = context_id })
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
        current_agent = { id = AGENT, tools = {} },
    }
    if opts.protected ~= false then
        local stored = effective(opts.policy)
        config.tool_approval = {
            active = true, require = stored.require, approve_all = stored.approve_all,
            timeout_seconds = stored.timeout_seconds, max_requests_per_turn = stored.max_requests_per_turn,
            revision = 1, ui_declared_at = opts.declared,
        }
        ctx.tool_approval_policy = stored
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

local function define_tests()
    describe("Tool approval gate up to the wait (EE2-2710 S7a)", function()
        local saved_await = nil
        before_all(function()
            wait_for_boot.run()
            saved_await = approval_gate._await_release
        end)
        after_each(function()
            approval_gate._await_release = saved_await
        end)
        after_all(function()
            for _, fixture in ipairs(fixtures) do
                session_repo.delete(fixture.session_id)
                context_repo.delete(fixture.context_id)
            end
        end)

        -- AC 1
        it("does not call the evaluator or touch the approval tables for an unprotected session", function()
            local ctx, captured = new_ctx({ protected = false })
            local calls = { evaluate = 0, evaluate_batch = 0, repo = {} }
            local saved_policy = { evaluate = policy.evaluate, evaluate_batch = policy.evaluate_batch }
            local saved_repo = {}
            policy.evaluate = function(...) calls.evaluate = calls.evaluate + 1; return saved_policy.evaluate(...) end
            policy.evaluate_batch = function(...)
                calls.evaluate_batch = calls.evaluate_batch + 1
                return saved_policy.evaluate_batch(...)
            end
            for name, fn in pairs(approval_repo) do
                if type(fn) == "function" then
                    saved_repo[name] = fn
                    approval_repo[name] = function(...)
                        calls.repo[#calls.repo + 1] = name
                        return fn(...)
                    end
                end
            end
            local control = { evaluate_batch = 0, repo = 0 }
            local ok, err = pcall(function()
                local op = round(ctx, {
                    { id = "call-1", registry_id = MARKED, args = { customer_id = "c_1" } },
                    { id = "call-2", registry_id = PLAIN, args = {} },
                })
                test.is_nil(op.approval, "an unprotected round carries no approval binding")
                local result, process_err = message_handlers.process_tools(ctx, op)
                test.is_nil(process_err)
                test.eq(launches(op.caller), 2, "both calls run as before")
                test.eq(row(op.call_message_ids["call-1"]).metadata.status, consts.FUNC_STATUS.SUCCESS)
                test.is_nil(row(op.call_message_ids["call-1"]).metadata.approval)
                test.is_nil(row(op.call_message_ids["call-1"]).metadata.batch_id)
                test.is_true(has_continue(result))
                -- Positive control: the same spies see a protected round.
                local before_eval, before_repo = calls.evaluate_batch, #calls.repo
                local protected_ctx = new_ctx({ live = 1 })
                local protected_op = round(protected_ctx, { { id = "call-1", registry_id = PLAIN, args = {} } })
                assert(message_handlers.process_tools(protected_ctx, protected_op))
                control.evaluate_batch = calls.evaluate_batch - before_eval
                control.repo = #calls.repo - before_repo
                calls.evaluate_batch, calls.evaluate = before_eval, 0
                while #calls.repo > before_repo do table.remove(calls.repo) end
            end)
            policy.evaluate, policy.evaluate_batch = saved_policy.evaluate, saved_policy.evaluate_batch
            for name, fn in pairs(saved_repo) do approval_repo[name] = fn end
            if not ok then error(err) end
            test.is_true(control.evaluate_batch > 0, "positive control: the spy sees the evaluator")
            test.is_true(control.repo > 0, "positive control: the spy sees the store")
            test.eq(calls.evaluate, 0, "the evaluator is not called")
            test.eq(calls.evaluate_batch, 0, "the evaluator is not called")
            test.eq(#calls.repo, 0, "approval store calls: " .. table.concat(calls.repo, ", "))
            for _, table_name in ipairs(TABLES) do test.eq(count(table_name, ctx.session_id), 0, table_name) end
            test.eq(#updates_of(captured, approval_events.TOOL_APPROVAL), 0)
        end)

        it("runs the round as before with the operator switch off and writes no batch", function()
            local ctx = new_ctx({ policy = { enforcement = "off" } })
            local op = round(ctx, { { id = "call-1", registry_id = MARKED, args = { customer_id = "c_1" } } })
            test.not_nil(op.approval)
            test.is_nil(op.approval.batch_id, "no batch while enforcement is off")
            local _, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(launches(op.caller), 1)
            for _, table_name in ipairs(TABLES) do test.eq(count(table_name, ctx.session_id), 0, table_name) end
        end)

        -- AC 2
        it("require marked: asks for a marked call and never runs it or its peers", function()
            local ctx, captured = new_ctx({ live = 1 })
            local op, batch = round(ctx, {
                { id = "call-1", registry_id = MARKED, name = "delete_customer", args = { customer_id = "c_1042", hard = true } },
                { id = "call-2", registry_id = PLAIN, name = "lookup_customer", args = { customer_id = "c_1042" } },
            })
            test.eq(batch.state, "open")
            test.eq(row(op.call_message_ids["call-1"]).metadata.batch_id, batch.batch_id)
            local result, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(op.caller.runs, 0, "caller:execute is never called")
            test.eq(launches(op.caller), 0, "no call runs")
            test.is_false(has_continue(result), "the turn ends without another model call")
            test.eq(#updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_CALL), 0, "no call is announced as running")

            local approvals = updates_of(captured, approval_events.TOOL_APPROVAL)
            test.eq(#approvals, 2, "one pending event and one state event")
            local pending = approvals[1]
            test.eq(pending.id, "call-1", "the per-call topic")
            test.eq(pending.payload.message_id, op.call_message_ids["call-1"])
            test.eq(pending.payload.row_type, "function")
            test.eq(pending.payload.function_name, "delete_customer")
            test.not_nil(pending.payload.server_now)
            test.is_nil(pending.payload.request_id)
            test.eq(pending.payload.approval.state, "pending")
            test.eq(pending.payload.approval.revision, 1)
            test.eq(pending.payload.approval.batch_id, batch.batch_id)
            test.eq(table.concat(pending.payload.approval.offered.decisions, ","), "approve,deny")
            test.eq(pending.payload.approval.display.title, "Delete customer")
            test.eq(pending.payload.approval.display.agent, "Ops assistant")
            test.eq(pending.payload.approval.display.batch_peers[1], "lookup_customer")
            test.not_nil(pending.payload.approval.expires_at)
            test.eq(approvals[2].payload.approval.state, "interrupted")
            test.eq(approvals[2].payload.approval.disposition, "not_run")

            local records = records_by_call(ctx.session_id, batch.batch_id)
            test.eq(records["call-1"].state, "interrupted")
            test.eq(records["call-1"].disposition, "not_run")
            test.is_nil(records["call-2"], "an unmarked call gets no request")
            for _, call_id in ipairs({ "call-1", "call-2" }) do
                local stored = row(op.call_message_ids[call_id]).metadata
                test.eq(stored.status, consts.FUNC_STATUS.ERROR, call_id)
                test.is_false(stored.result.executed, call_id)
                test.eq(stored.result.reason, "interrupted", call_id)
                test.is_nil(stored.stale, "no top-level stale")
            end
            test.eq(row(op.call_message_ids["call-1"]).metadata.approval.state, "interrupted")
            local errors = updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_ERROR)
            test.eq(#errors, 2)
            test.eq(errors[1].payload.outcome, "not_approved")
            test.eq(errors[1].payload.approval.disposition, "not_run")
            local stored_batch = assert(approval_repo.get_batch(nil, batch.batch_id))
            test.eq(stored_batch.state, "closed")
            test.eq(stored_batch.controls, "cancelled")
            -- The activity is set while the request waits, then cleared.
            test.eq(#captured.session_updates, 2)
            test.eq(captured.session_updates[1].activity.kind, "awaiting_tool_approval")
            test.is_nil(captured.session_updates[2].activity)
            test.is_true(captured.session_updates[2].activity_revision > captured.session_updates[1].activity_revision)
        end)

        it("require marked: a batch without marked calls runs as today", function()
            local ctx, captured = new_ctx({ live = 1 })
            local op = round(ctx, {
                { id = "call-1", registry_id = PLAIN, name = "lookup_customer", args = { customer_id = "c_1" } },
                { id = "call-2", registry_id = PRIVATE, type = consts.MSG_TYPE.PRIVATE_FUNCTION, args = {} },
            })
            local result, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(launches(op.caller), 2)
            test.is_true(has_continue(result))
            test.eq(row(op.call_message_ids["call-1"]).metadata.status, consts.FUNC_STATUS.SUCCESS)
            test.eq(row(op.call_message_ids["call-2"]).metadata.status, consts.FUNC_STATUS.SUCCESS)
            test.eq(#updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_CALL), 1, "the public call is announced")
            test.eq(#updates_of(captured, approval_events.TOOL_APPROVAL), 0)
            test.eq(count("session_tool_approvals", ctx.session_id), 0)
        end)

        -- AC 3
        it("require all: every call asks, including private and delegation calls, each with an event", function()
            local ctx, captured = new_ctx({ live = 1, policy = { require = "all" } })
            local op, batch = round(ctx, {
                { id = "call-1", registry_id = PLAIN, name = "lookup_customer", args = { customer_id = "c_1" } },
                { id = "call-2", registry_id = PRIVATE, name = "private_lookup", type = consts.MSG_TYPE.PRIVATE_FUNCTION,
                    args = { q = 1 } },
                { id = "call-3", registry_id = DELEGATE, name = "delegate", type = consts.MSG_TYPE.DELEGATION,
                    args = { task = "Refund order 7" }, context = { to_agent_id = TARGET } },
            })
            local _, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(launches(op.caller), 0, "nothing runs")
            local pending = {}
            for _, update in ipairs(updates_of(captured, approval_events.TOOL_APPROVAL)) do
                if update.payload.approval.state == "pending" then pending[update.id] = update.payload end
            end
            test.eq(pending["call-1"].row_type, "function")
            test.eq(pending["call-2"].row_type, "private_function")
            test.eq(pending["call-3"].row_type, "delegation")
            test.eq(pending["call-3"].approval.display.target_agent, "Billing agent")
            local records = records_by_call(ctx.session_id, batch.batch_id)
            test.eq(records["call-3"].target_agent_id, TARGET)
            for _, call_id in ipairs({ "call-1", "call-2", "call-3" }) do
                test.eq(records[call_id].state, "interrupted", call_id)
                test.eq(records[call_id].disposition, "not_run", call_id)
            end
            -- Not-run settlements reach private and delegation calls too.
            test.eq(#updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_ERROR), 3)
        end)

        it("never dispatches a call that a grant allows before the release (S7b)", function()
            local ctx, captured = new_ctx({ live = 1 })
            local grant = create_tool_grant(ctx, GRANTED)
            local op, batch = round(ctx, {
                { id = "call-1", registry_id = GRANTED, name = "send_invoice", args = { invoice = 7 } },
                { id = "call-2", registry_id = PLAIN, name = "lookup_customer", args = {} },
            })
            local result, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(launches(op.caller), 0)
            test.is_false(has_continue(result))
            local record = records_by_call(ctx.session_id, batch.batch_id)["call-1"]
            test.eq(record.state, "approved")
            test.eq(record.decided_via, "grant")
            test.eq(record.grant_id, grant.grant_id)
            test.eq(record.disposition, "not_run")
            test.is_nil(record.expires_at, "an audit record is never pending")
            test.eq(#updates_of(captured, approval_events.TOOL_APPROVAL), 0,
                "a public call a grant allows gets no tool_approval event")
        end)

        -- AC 19
        it("settles a repeated denial at once, creates no request and checks it before grants", function()
            local ctx, captured = new_ctx({ live = 1 })
            local args = { customer_id = "c_9" }
            -- First batch of the turn: the user denies the call (the decision
            -- command is slice S8, so the test commits it in the wait seam).
            approval_gate._await_release = function(gate_ctx, pending)
                local record = pending.records[1]
                assert(approval_repo.transact(gate_ctx.session_id, function(dbtx)
                    return approval_repo.decide(dbtx, gate_ctx.session_id, record.approval_id, record.revision,
                        { state = "denied", decided_via = "user", ["then"] = "continue", reason = "Use c_10" })
                end))
                return { close_reason = "finish" }
            end
            local first = round(ctx, { { id = "call-a", registry_id = MARKED, args = args } })
            assert(message_handlers.process_tools(ctx, first))
            approval_gate._await_release = saved_await
            -- A grant for the same tool exists now; the denial still wins.
            local grant = create_tool_grant(ctx, MARKED)
            local before = count("session_tool_approvals", ctx.session_id)
            local op, batch = round(ctx, {
                { id = "call-b", registry_id = MARKED, args = { customer_id = "c_9" } },
                { id = "call-c", registry_id = PLAIN, args = {} },
            })
            local result, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(count("session_tool_approvals", ctx.session_id), before, "no request and no grant audit")
            local stored = row(op.call_message_ids["call-b"]).metadata
            test.eq(stored.status, consts.FUNC_STATUS.ERROR)
            test.eq(stored.result.reason, "repeated_denied_call")
            test.is_nil(stored.approval)
            test.is_nil(op.caller.launches["call-b"], "the repeated call never runs")
            test.is_true(op.caller.launches["call-c"], "its peer runs")
            test.is_true(has_continue(result), "the turn continues")
            test.eq(assert(approval_repo.get_grant(nil, grant.grant_id)).status, "active")
            test.eq(#assert(approval_repo.list_by_batch(nil, ctx.session_id, batch.batch_id)), 0)
            local errors = updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_ERROR)
            test.eq(errors[#errors].id, "call-b")
            test.eq(errors[#errors].payload.outcome, "not_approved")
        end)

        -- AC 26
        it("settles every member as limit, publishes one notice per turn and ends the turn", function()
            local ctx, captured = new_ctx({ live = 1, policy = { max_requests_per_turn = 2 } })
            local op, batch = round(ctx, {
                { id = "call-1", registry_id = MARKED, args = { n = 1 } },
                { id = "call-2", registry_id = MARKED, args = { n = 2 } },
                { id = "call-3", registry_id = MARKED, args = { n = 3 } },
                { id = "call-4", registry_id = PLAIN, args = {} },
            })
            local result, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(launches(op.caller), 0)
            test.is_false(has_continue(result))
            local records = records_by_call(ctx.session_id, batch.batch_id)
            for _, call_id in ipairs({ "call-1", "call-2", "call-3" }) do
                test.eq(records[call_id].state, "limited", call_id)
                test.is_nil(records[call_id].expires_at, call_id)
                test.eq(records[call_id].disposition, "not_run", call_id)
            end
            for _, call_id in ipairs({ "call-1", "call-2", "call-3", "call-4" }) do
                test.eq(row(op.call_message_ids[call_id]).metadata.result.reason, "limit", call_id)
            end
            test.eq(assert(approval_repo.get_batch(nil, batch.batch_id)).close_reason, "limit")
            test.eq(#captured.notices, 1)
            test.eq(captured.notices[1].code, "tool_approval_limit")
            for _, update in ipairs(updates_of(captured, approval_events.TOOL_APPROVAL)) do
                test.eq(update.payload.approval.state, "limited", "no request is ever pending")
            end
            -- A second capped batch in the same turn sends no second notice.
            local again = round(ctx, {
                { id = "call-5", registry_id = MARKED, args = { n = 5 } },
                { id = "call-6", registry_id = MARKED, args = { n = 6 } },
                { id = "call-7", registry_id = MARKED, args = { n = 7 } },
            })
            assert(message_handlers.process_tools(ctx, again))
            test.eq(#captured.notices, 1, "one notice per turn")
        end)

        it("counts only new pending requests toward the cap, not grant audit records", function()
            local ctx = new_ctx({ live = 1, policy = { max_requests_per_turn = 3 } })
            create_tool_grant(ctx, GRANTED)
            -- One request earlier in the turn.
            assert(message_handlers.process_tools(ctx, round(ctx, { { id = "call-1", registry_id = MARKED, args = { n = 1 } } })))
            -- One more request and two grant audit records: within the cap.
            local op, batch = round(ctx, {
                { id = "call-2", registry_id = MARKED, args = { n = 2 } },
                { id = "call-3", registry_id = GRANTED, args = { n = 3 } },
                { id = "call-4", registry_id = GRANTED, args = { n = 4 } },
            })
            assert(message_handlers.process_tools(ctx, op))
            local records = records_by_call(ctx.session_id, batch.batch_id)
            test.not_nil(records["call-2"].expires_at, "created pending")
            test.eq(records["call-2"].state, "interrupted")
            test.eq(records["call-3"].decided_via, "grant")
            test.eq(records["call-4"].decided_via, "grant")
            -- The third request still fits: the two audit records don't count.
            local third, third_batch = round(ctx, { { id = "call-5", registry_id = MARKED, args = { n = 5 } } })
            assert(message_handlers.process_tools(ctx, third))
            test.eq(records_by_call(ctx.session_id, third_batch.batch_id)["call-5"].state, "interrupted")
            -- A fourth request passes the cap.
            local over, over_batch = round(ctx, { { id = "call-7", registry_id = MARKED, args = { n = 7 } } })
            assert(message_handlers.process_tools(ctx, over))
            test.eq(records_by_call(ctx.session_id, over_batch.batch_id)["call-7"].state, "limited")
            -- A new turn starts a new count.
            ctx.turn_state = { message_id = "turn-" .. uuid.v7(), active = true, steps = 1, repeated_calls = 0 }
            local fresh, fresh_batch = round(ctx, { { id = "call-6", registry_id = MARKED, args = { n = 6 } } })
            assert(message_handlers.process_tools(ctx, fresh))
            test.eq(records_by_call(ctx.session_id, fresh_batch.batch_id)["call-6"].state, "interrupted")
        end)

        it("settles at once as approval_ui_unavailable when no client ever declared a surface", function()
            local ctx, captured = new_ctx()
            local op, batch = round(ctx, {
                { id = "call-1", registry_id = MARKED, args = { n = 1 } },
                { id = "call-2", registry_id = PLAIN, args = {} },
            })
            local result, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(launches(op.caller), 0)
            test.is_false(has_continue(result))
            local record = records_by_call(ctx.session_id, batch.batch_id)["call-1"]
            test.eq(record.state, "unavailable")
            test.is_nil(record.expires_at)
            test.eq(row(op.call_message_ids["call-1"]).metadata.result.reason, "approval_ui_unavailable")
            test.eq(row(op.call_message_ids["call-2"]).metadata.result.reason, "not_run_batch_stopped")
            test.eq(#captured.notices, 1)
            test.eq(captured.notices[1].code, "tool_approval_unavailable")
            test.eq(#captured.session_updates, 0, "no activity: nothing waited")
            assert(message_handlers.process_tools(ctx, round(ctx, { { id = "call-3", registry_id = MARKED, args = {} } })))
            test.eq(#captured.notices, 1, "one notice per turn")
            -- begin_turn keeps the turn state table and moves its message_id.
            ctx.turn_state.message_id = "turn-" .. uuid.v7()
            assert(message_handlers.process_tools(ctx, round(ctx, { { id = "call-4", registry_id = MARKED, args = {} } })))
            test.eq(#captured.notices, 2, "the next turn gets its own notice")
        end)

        it("gives the caller only the calls the gate released", function()
            local ctx = new_ctx({ live = 1 })
            local op = round(ctx, {
                { id = "call-1", registry_id = PLAIN, args = {} },
                { id = "call-odd", registry_id = PLAIN, args = {} },
            })
            -- A truthy `valid` that is not true would run in the caller; and an
            -- entry that is not a call of the round was never checked.
            op.validated_tools["call-odd"].valid = "yes"
            op.validated_tools["call-extra"] = { call_id = "call-extra", name = "extra", args = {},
                registry_id = MARKED, meta = entry_meta(MARKED), valid = true }
            op.call_message_ids["call-extra"] = assert(ctx.writer:add_message(consts.MSG_TYPE.FUNCTION, "{}",
                { call_id = "call-extra", status = consts.FUNC_STATUS.PENDING }))
            local _, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.is_true(op.caller.launches["call-1"])
            test.is_nil(op.caller.executed["call-odd"])
            test.is_nil(op.caller.executed["call-extra"])
            test.eq(row(op.call_message_ids["call-odd"]).metadata.result.reason, "approval_check_failed")
        end)

        it("creates the requests when a surface was declared before but none is live (grace period is S7b)", function()
            local ctx, captured = new_ctx({ declared = "2026-11-19T10:00:00Z" })
            local op, batch = round(ctx, { { id = "call-1", registry_id = MARKED, args = { n = 1 } } })
            assert(message_handlers.process_tools(ctx, op))
            test.eq(launches(op.caller), 0)
            test.eq(updates_of(captured, approval_events.TOOL_APPROVAL)[1].payload.approval.state, "pending")
            test.eq(records_by_call(ctx.session_id, batch.batch_id)["call-1"].state, "interrupted")
            test.eq(#captured.notices, 0)
        end)

        it("runs nothing and asks nothing when the batch was stored closed by a pending steering message", function()
            local ctx = new_ctx({ live = 1 })
            assert(ctx.writer:add_message(consts.MSG_TYPE.USER, "Use c_10 instead",
                { input = { state = "pending" } }))
            local op, batch = round(ctx, {
                { id = "call-1", registry_id = MARKED, args = { n = 1 } },
                { id = "call-2", registry_id = PLAIN, args = {} },
            })
            test.eq(batch.state, "closed")
            local result, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(launches(op.caller), 0)
            test.eq(count("session_tool_approvals", ctx.session_id), 0)
            test.eq(row(op.call_message_ids["call-1"]).metadata.result.reason, "superseded_by_user_message")
            test.is_true(has_continue(result), "steering continues the turn")
        end)

        -- AC 32 (the gate part): invalid calls and arguments that don't decode.
        it("keeps the caller's error text for invalid calls and undecodable arguments, with no request", function()
            local invalid = { id = "call-bad", registry_id = MARKED, valid = false,
                error = "Failed to get tool schema: gone" }
            local undecodable = { id = "call-args", registry_id = MARKED, raw_args = "{\"customer_id\": ", stored_args = "{}" }
            local function expected_texts(op: any): any
                local reference = tool_caller.new()
                local copies = {}
                for call_id, tool in pairs(op.validated_tools) do
                    if call_id == "call-bad" or call_id == "call-args" then
                        local copy = {}
                        for key, value in pairs(tool) do copy[key] = value end
                        copies[call_id] = copy
                    end
                end
                local results = assert(reference:execute({}, copies))
                return { ["call-bad"] = results["call-bad"].error, ["call-args"] = results["call-args"].error }
            end

            -- A batch that runs: the real caller reports both errors.
            local ctx = new_ctx({ live = 1 })
            local op = round(ctx, { invalid, undecodable }, tool_caller.new())
            local expected = expected_texts(op)
            test.contains(expected["call-args"], "Failed to parse arguments")
            assert(message_handlers.process_tools(ctx, op))
            test.eq(row(op.call_message_ids["call-bad"]).metadata.result, expected["call-bad"])
            test.eq(row(op.call_message_ids["call-args"]).metadata.result, expected["call-args"])
            test.eq(count("session_tool_approvals", ctx.session_id), 0)

            -- A batch the gate fences: the same texts, still no request for them.
            local fenced_ctx, captured = new_ctx({ live = 1 })
            local fenced = round(fenced_ctx, { invalid, undecodable,
                { id = "call-ok", registry_id = MARKED, args = { n = 1 } } })
            assert(message_handlers.process_tools(fenced_ctx, fenced))
            test.eq(launches(fenced.caller), 0)
            for _, call_id in ipairs({ "call-bad", "call-args" }) do
                local stored = row(fenced.call_message_ids[call_id]).metadata
                test.eq(stored.status, consts.FUNC_STATUS.ERROR, call_id)
                test.eq(stored.result, expected[call_id], call_id)
                test.is_nil(stored.approval, call_id)
            end
            local records = assert(approval_repo.list_by_state(nil, fenced_ctx.session_id, "interrupted"))
            test.eq(#records, 1)
            test.eq(records[1].call_id, "call-ok")
            local texts = {}
            for _, update in ipairs(updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_ERROR)) do
                texts[update.id] = update.payload
            end
            test.eq(texts["call-args"].error, expected["call-args"])
            test.is_nil(texts["call-args"].outcome, "today's event shape")
        end)

        -- The freeze outcome freeze_failed (S4 left the model reason open).
        it("settles a call that can't be frozen as approval_check_failed and runs its peers", function()
            local ctx, captured = new_ctx({ live = 1 })
            local deep: any = {}
            local cursor = deep
            for _ = 1, 70 do
                cursor.next = {}
                cursor = cursor.next
            end
            local op = round(ctx, {
                { id = "call-deep", registry_id = PLAIN, raw_args = deep, stored_args = "{}" },
                { id = "call-ok", registry_id = PLAIN, args = {} },
            })
            local result, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            local stored = row(op.call_message_ids["call-deep"]).metadata
            test.eq(stored.status, consts.FUNC_STATUS.ERROR)
            test.is_false(stored.result.executed)
            test.eq(stored.result.reason, "approval_check_failed")
            test.eq(stored.result.instruction, approval_events.model_result("approval_check_failed").instruction)
            test.eq(stored.result.instruction, "The tool did not run. Do not call it again with the same arguments."
                .. " The call could not be prepared for the approval check.")
            test.is_nil(op.caller.executed["call-deep"], "never given to the caller")
            test.is_true(op.caller.launches["call-ok"])
            test.is_true(has_continue(result))
            test.eq(count("session_tool_approvals", ctx.session_id), 0)
            local errors = updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_ERROR)
            test.eq(errors[1].payload.error, "Not run: the call could not be checked for approval.")
        end)

        it("fails closed when a protected round has no approval binding", function()
            local ctx = new_ctx({ live = 1 })
            local op = round(ctx, { { id = "call-1", registry_id = PLAIN, args = {} } })
            op.approval = nil
            local _, err = message_handlers.process_tools(ctx, op)
            test.contains(tostring(err), "Tool approval check failed")
            test.eq(launches(op.caller), 0)
            test.eq(op.caller.runs, 0)
            test.contains(tostring(row(op.call_message_ids["call-1"]).metadata.result), "no approval binding")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
