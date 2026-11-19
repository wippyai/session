local test = require("test")
local uuid = require("uuid")
local json = require("json")
local consts = require("consts")
local tx = require("tx")
local approval_gate = require("approval_gate")
local approval_events = require("approval_events")
local approval_repo = require("approval_repo")
local message_handlers = require("message_handlers")
local policy = require("policy")
local tool_caller = require("tool_caller")
local activation = require("activation")
local wait_for_boot = require("wait_for_boot")
local fx = require("gate_fixtures")

-- The approval gate up to the wait: process_tools with the real gate, the
-- real store and a fake tool caller that records every launch. The wait is
-- replaced by a closure as finish; gate_wait_test covers the wait itself.

local MARKED, GRANTED, PLAIN, PRIVATE = fx.MARKED, fx.GRANTED, fx.PLAIN, fx.PRIVATE
local DELEGATE, TARGET, TABLES = fx.DELEGATE, fx.TARGET, fx.TABLES
local count, new_ctx, round, row = fx.count, fx.new_ctx, fx.round, fx.row
local updates_of, has_continue, launches = fx.updates_of, fx.has_continue, fx.launches
local records_by_call, create_tool_grant, entry_meta = fx.records_by_call, fx.create_tool_grant, fx.entry_meta
local function define_tests()
    describe("Tool approval gate up to the wait", function()
        local saved_wait = nil
        before_all(function()
            wait_for_boot.run()
            saved_wait = approval_gate._wait
        end)
        before_each(function()
            approval_gate._wait = function() return { close_reason = "finish" } end
        end)
        after_each(function()
            approval_gate._wait = saved_wait
        end)
        after_all(function()
            fx.cleanup()
        end)

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
            local unprotected: any, control: any = nil, nil
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
                unprotected = { evaluate = calls.evaluate, evaluate_batch = calls.evaluate_batch,
                    repo = table.concat(calls.repo, ", ") }
                -- Positive control: the same spies see a protected round.
                local protected_ctx = new_ctx({ live = 1 })
                local protected_op = round(protected_ctx, { { id = "call-1", registry_id = PLAIN, args = {} } })
                assert(message_handlers.process_tools(protected_ctx, protected_op))
                control = { evaluate = calls.evaluate - unprotected.evaluate, repo = #calls.repo }
            end)
            policy.evaluate, policy.evaluate_batch = saved_policy.evaluate, saved_policy.evaluate_batch
            for name, fn in pairs(saved_repo) do approval_repo[name] = fn end
            if not ok then error(err) end
            test.is_true(control.evaluate > 0, "positive control: the spy sees the evaluator")
            test.is_true(control.repo > 0, "positive control: the spy sees the store")
            test.eq(unprotected.evaluate, 0, "the evaluator is not called")
            test.eq(unprotected.evaluate_batch, 0, "the evaluator is not called")
            test.eq(unprotected.repo, "", "no approval store call")
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
            test.eq(captured.session_updates[2].activity, json.null, "cleared with an explicit null")
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

        it("runs a call a grant allows only through the release transaction, with an audit record", function()
            local ctx, captured = new_ctx({ live = 1 })
            local grant = create_tool_grant(ctx, GRANTED)
            local op, batch = round(ctx, {
                { id = "call-1", registry_id = GRANTED, name = "send_invoice", args = { invoice = 7 } },
                { id = "call-2", registry_id = PLAIN, name = "lookup_customer", args = {} },
            })
            local result, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(launches(op.caller), 2)
            test.is_true(has_continue(result))
            local record = records_by_call(ctx.session_id, batch.batch_id)["call-1"]
            test.eq(record.state, "approved")
            test.eq(record.decided_via, "grant")
            test.eq(record.grant_id, grant.grant_id)
            test.eq(record.disposition, "dispatched")
            test.is_nil(record.expires_at, "an audit record is never pending")
            test.eq(assert(approval_repo.get_batch(nil, batch.batch_id)).state, "released")
            test.eq(#updates_of(captured, approval_events.TOOL_APPROVAL), 0,
                "a public call a grant allows gets no tool_approval event")
            local started = {}
            for _, update in ipairs(updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_CALL)) do
                started[update.id] = update.payload
            end
            test.eq(started["call-1"].approval.decided_via, "grant")
            test.eq(started["call-1"].approval.grant_id, grant.grant_id)
            test.is_nil(started["call-2"].approval)
        end)

        it("settles a grant-allowed call as revoked when the grant is revoked before the release", function()
            local ctx = new_ctx({ live = 1 })
            local grant = create_tool_grant(ctx, GRANTED)
            -- process_tools reads the context once before the gate; the
            -- release reads it again, after evaluation and before its
            -- transaction: the revocation commits there.
            local reads = 0
            ctx.reader.get_full_context = function()
                reads = reads + 1
                if reads == 2 then
                    assert(tx.run(function(dbtx)
                        return approval_repo.revoke_grant(dbtx, ctx.session_id, grant.grant_id, nil, ctx.user_id)
                    end))
                end
                return {}, nil
            end
            local op, batch = round(ctx, { { id = "call-1", registry_id = GRANTED, args = { invoice = 7 } } })
            local result, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(reads, 2)
            test.eq(launches(op.caller), 0)
            local record = records_by_call(ctx.session_id, batch.batch_id)["call-1"]
            test.eq(record.disposition, "not_run")
            test.eq(record.disposition_reason, "revoked")
            test.eq(row(op.call_message_ids["call-1"]).metadata.result.reason, "revoked")
            test.is_true(has_continue(result), "the turn continues")
        end)

        it("settles a repeated denial at once, creates no request and checks it before grants", function()
            local ctx, captured = new_ctx({ live = 1 })
            local args = { customer_id = "c_9" }
            -- First batch of the turn: the user denies the call while it waits.
            approval_gate._wait = function(gate_ctx, run)
                local record = assert(approval_repo.list_by_batch(nil, gate_ctx.session_id, run.binding.batch_id))[1]
                assert(approval_repo.transact(gate_ctx.session_id, function(dbtx)
                    return approval_repo.decide(dbtx, gate_ctx.session_id, record.approval_id, record.revision,
                        { state = "denied", decided_via = "user", ["then"] = "continue", reason = "Use c_10" })
                end))
                return { close_reason = "finish" }
            end
            local first = round(ctx, { { id = "call-a", registry_id = MARKED, args = args } })
            assert(message_handlers.process_tools(ctx, first))
            approval_gate._wait = function() return { close_reason = "finish" } end
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
            test.is_nil(op.caller.launches["call-odd"])
            test.is_true(op.caller.executed["call-odd"], "given to the caller as an entry that does not run")
            test.is_nil(op.caller.executed["call-extra"], "a call outside the round never reaches the caller")
            test.eq(row(op.call_message_ids["call-odd"]).metadata.result.reason, "approval_check_failed")
        end)

        it("creates the requests when a surface was declared before but none is live", function()
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
            local records = assert(approval_repo.list_by_batch(nil, fenced_ctx.session_id, fenced.approval.batch_id))
            test.eq(#records, 1)
            test.eq(records[1].call_id, "call-ok")
            test.eq(records[1].state, "interrupted")
            local texts = {}
            for _, update in ipairs(updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_ERROR)) do
                texts[update.id] = update.payload
            end
            test.eq(texts["call-args"].error, expected["call-args"])
            test.is_nil(texts["call-args"].outcome, "today's event shape")
        end)

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
            test.is_nil(op.caller.launches["call-deep"], "never runs")
            test.is_true(op.caller.launches["call-ok"])
            test.is_true(has_continue(result))
            test.eq(count("session_tool_approvals", ctx.session_id), 0)
            local errors = updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_ERROR)
            test.eq(errors[1].payload.error, "Not run: the call could not be checked for approval.")
        end)

        it("suspends a grant that an agent switch no longer permits, before any call is evaluated", function()
            -- Switch away from the agent with the trait, take a step without
            -- calls, switch back: the old grant must not match again.
            local ctx = new_ctx({ live = 1, declared = "2026-11-19T10:00:00Z" })
            local grant = create_tool_grant(ctx, GRANTED)
            ctx.agent_ctx = { active_traits = { "other:trait" } }
            assert(activation.apply(ctx, { id = fx.AGENT, agent_options = {} }))
            test.is_false(ctx.tool_approval_policy.agent_opted_in)
            ctx.agent_ctx = { active_traits = { activation.TRAIT_ID } }
            assert(activation.apply(ctx, { id = fx.AGENT, agent_options = { tool_approval = { schema = 1 } } }))
            test.is_true(ctx.tool_approval_policy.agent_opted_in)
            local stored = assert(approval_repo.get_grant(nil, grant.grant_id))
            test.eq(stored.status, "suspended")
            test.eq(stored.suspension_reason, "agent_without_trait")
            local op, batch = round(ctx, { { id = "call-1", registry_id = GRANTED, args = { invoice = 7 } } })
            assert(message_handlers.process_tools(ctx, op))
            test.eq(launches(op.caller), 0, "the call asks again instead of running on the old grant")
            test.eq(records_by_call(ctx.session_id, batch.batch_id)["call-1"].state, "interrupted")
        end)

        it("stores the grant suspensions of the evaluation when the batch was already closed", function()
            local ctx = new_ctx({ live = 1, policy = { agent_opted_in = false } })
            local grant = create_tool_grant(ctx, GRANTED)
            assert(ctx.writer:add_message(consts.MSG_TYPE.USER, "Use c_10 instead", { input = { state = "pending" } }))
            local op, batch = round(ctx, { { id = "call-1", registry_id = GRANTED, args = { invoice = 7 } } })
            test.eq(batch.state, "closed")
            assert(message_handlers.process_tools(ctx, op))
            test.eq(launches(op.caller), 0)
            local stored = assert(approval_repo.get_grant(nil, grant.grant_id))
            test.eq(stored.status, "suspended")
            test.eq(stored.suspension_reason, "agent_without_trait")
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
