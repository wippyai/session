local test = require("test")
local time = require("time")
local consts = require("consts")
local approval_repo = require("approval_repo")
local approval_recovery = require("approval_recovery")
local message_repo = require("message_repo")
local message_handlers = require("message_handlers")
local control_handlers = require("control_handlers")
local command_bus = require("command_bus")
local session = require("session")
local reader = require("reader")
local wait_for_boot = require("wait_for_boot")
local fx = require("gate_fixtures")

-- Recovery of an interrupted tool round of a protected session: batch
-- reconciliation before any call row is settled, one terminal result per
-- call, the batch's controls, and the exit order of the command bus. The
-- entry points of the session plugin and the session start are in
-- plugin_test ("recovers an interrupted approval batch ...").

local PLAIN = fx.PLAIN
local row, crashed_batch, recovery_summary = fx.row, fx.crashed_batch, fx.recovery_summary

local CRASHED = "call-a=interrupted/error/not_run:interrupted call-b=approved/error/unknown"
    .. " call-c=-/error/not_run:interrupted batch=closed:exit:cancelled activity=nil"

-- Receives from `ch` within `seconds` (default 10), so a step that never
-- happens fails the test instead of hanging the suite.
local function receive_within(ch: any, what: string, seconds: number?): any
    local selected = channel.select({ ch:case_receive(), time.after(tostring(seconds or 10) .. "s"):case_receive() })
    if selected.channel ~= ch then error(what .. " did not happen in time") end
    return selected.value
end

-- Releases the batch as the gate's release transaction does: the
-- dispositions (approved: dispatched, denied: not_run), then the batch.
local function release(ctx: any, batch: any)
    assert(approval_repo.transact(ctx.session_id, function(dbtx)
        for _, record in ipairs(assert(approval_repo.list_by_batch(dbtx, ctx.session_id, batch.batch_id))) do
            local dispatched = record.state == approval_repo.STATE.APPROVED
            local written, err = approval_repo.set_disposition(dbtx, ctx.session_id, record.approval_id,
                dispatched and "dispatched" or "not_run", not dispatched and "denied" or nil, record.revision)
            if not written then return nil, err end
        end
        return approval_repo.release_batch(dbtx, batch.batch_id)
    end))
end

local function settle(op: any, call_id: string, metadata: any)
    assert(message_repo.update_metadata(op.call_message_ids[call_id], metadata))
end

local function define_tests()
    describe("Tool approval recovery", function()
        before_all(function() wait_for_boot.run() end)
        after_all(function() fx.cleanup() end)

        it("interrupts the waiting batch, reports its calls as not run and keeps outcome unknown for an approved one", function()
            local ctx, op, batch = crashed_batch()
            local settled, err = approval_recovery.recover_calls(ctx.session_id, nil, true)
            test.is_nil(err)
            test.eq(settled, 3)
            test.eq(recovery_summary(ctx, op, batch), CRASHED)
            local records = fx.records_by_call(ctx.session_id, batch.batch_id)
            test.eq(records["call-b"].disposition, "not_run", "the record says the approved call never ran")
            test.eq(row(op.call_message_ids["call-a"]).metadata.approval.state, "interrupted",
                "the row projection shows the interrupted request")
            -- A second recovery finds nothing left.
            test.eq(approval_recovery.recover_calls(ctx.session_id, nil, true), 0)
        end)

        it("closes the batch before it settles any call row", function()
            local ctx, op, batch = crashed_batch()
            local saved_close, saved_update = approval_repo.close_batch, message_repo.update_metadata
            local events = {}
            approval_repo.close_batch = function(dbtx, batch_id, reason)
                events[#events + 1] = "close:" .. reason
                return saved_close(dbtx, batch_id, reason)
            end
            message_repo.update_metadata = function(message_id, metadata, ...)
                if type(metadata) == "table" and metadata.status ~= nil then events[#events + 1] = "row" end
                return saved_update(message_id, metadata, ...)
            end
            local ok, failure = pcall(approval_recovery.recover_calls, ctx.session_id, nil, true)
            approval_repo.close_batch, message_repo.update_metadata = saved_close, saved_update
            if not ok then error(failure) end
            test.eq(table.concat(events, ","), "close:exit,row,row,row")
            test.eq(recovery_summary(ctx, op, batch), CRASHED)
        end)

        it("reconciles the requests when the call rows are already terminal or deleted", function()
            local ctx, op, batch = crashed_batch()
            -- No call row is pending: the open batch is found from its record.
            settle(op, "call-a", { status = "error", result = "failed elsewhere" })
            settle(op, "call-c", { status = "error", result = "failed elsewhere" })
            assert(message_repo.delete(op.call_message_ids["call-b"]))
            test.eq(approval_recovery.recover_calls(ctx.session_id, nil, true), 0)
            local records = fx.records_by_call(ctx.session_id, batch.batch_id)
            test.eq(records["call-a"].state, "interrupted", "a pending request of a terminal row")
            test.eq(records["call-b"].disposition, "not_run", "the record of a deleted row")
            test.eq(row(op.call_message_ids["call-a"]).metadata.result, "failed elsewhere", "a terminal row keeps its one result")
            local stored = assert(approval_repo.get_batch(nil, batch.batch_id))
            test.eq(stored.state .. ":" .. stored.controls, "closed:cancelled")
        end)

        it("leaves an unprotected session's approval tables alone", function()
            local ctx, op, batch = crashed_batch()
            test.eq(approval_recovery.recover_calls(ctx.session_id, nil, false), 3)
            local stored = assert(approval_repo.get_batch(nil, batch.batch_id))
            test.eq(stored.state, "open", "no reconciliation without a stored activation")
            test.eq(fx.records_by_call(ctx.session_id, batch.batch_id)["call-a"].state, "pending")
        end)

        it("cancels the controls of a batch interrupted after release and never replays them", function()
            local ctx, op, batch = crashed_batch({ requests = { ["call-a"] = "approved", ["call-b"] = "approved" } })
            release(ctx, batch)
            settle(op, "call-a", { status = "success", result = { ok = true } })
            test.eq(approval_recovery.recover_calls(ctx.session_id, nil, true), 2)
            local stored = assert(approval_repo.get_batch(nil, batch.batch_id))
            test.eq(stored.state .. ":" .. stored.controls, "released:cancelled")
            test.eq(row(op.call_message_ids["call-b"]).metadata.result, message_repo.INTERRUPTED_RESULT,
                "a dispatched call keeps outcome unknown")
            test.eq(row(op.call_message_ids["call-c"]).metadata.result, message_repo.INTERRUPTED_RESULT)
            test.eq(fx.round_controls(ctx, op, true), "cancelled replayed=nil",
                "the batch's controls are not replayed")
        end)

        it("does not replay the controls of a fenced batch whose calls ended with errors", function()
            local ctx, op, batch = crashed_batch({ requests = { ["call-a"] = { state = "denied", ["then"] = "stop" } } })
            assert(approval_repo.transact(ctx.session_id, function(dbtx)
                return approval_repo.close_batch(dbtx, batch.batch_id, "stop_denial")
            end))
            -- The gate settled every call; the process stopped before the
            -- round's controls were marked.
            for _, call_id in ipairs({ "call-a", "call-b", "call-c" }) do
                settle(op, call_id, { status = "error", result = { executed = false, reason = "not_run_batch_stopped" } })
            end
            test.eq(approval_recovery.recover_calls(ctx.session_id, nil, true), 0)
            test.eq(assert(approval_repo.get_batch(nil, batch.batch_id)).controls, "cancelled")
            test.eq(fx.round_controls(ctx, op, true), "cancelled replayed=nil",
                "a fenced batch's controls are not replayed")
        end)

        it("keeps the normal control behavior after a continue denial in a batch that was not fenced", function()
            local ctx, op, batch = crashed_batch({ requests = {
                ["call-a"] = { state = "denied", ["then"] = "continue", reason = "not this one" },
                ["call-b"] = "approved" } })
            release(ctx, batch)
            settle(op, "call-a", { status = "error", result = { executed = false, reason = "denied_by_user" } })
            settle(op, "call-b", { status = "success", result = { ok = true } })
            settle(op, "call-c", { status = "success", result = { ok = true } })
            test.eq(approval_recovery.recover_calls(ctx.session_id, nil, true), 0)
            test.eq(assert(approval_repo.get_batch(nil, batch.batch_id)).controls, "kept")
            test.eq(fx.round_controls(ctx, op, true), "applied replayed=yes",
                "the round's controls apply as they would without approval")
        end)

        it("cancels the controls of a released batch whose round fails after the release; a restart does not replay them", function()
            local ctx = fx.new_ctx({ live = 1 })
            assert(approval_repo.update_tool_approval(ctx.session_id, function() return ctx.config.tool_approval end))
            -- The released call returns a context control; storing it fails.
            local caller = fx.fake_caller()
            function caller:execute(_context, tools, _cancel)
                local results = {}
                for call_id, tool in pairs(tools or {}) do
                    self.launches[call_id] = true
                    results[call_id] = { tool_call = tool,
                        result = { ok = true, _control = { context = { session = { set = { from_tool = "x" } } } } } }
                end
                return results
            end
            local op, batch = fx.round(ctx, { { id = "call-c", registry_id = PLAIN, args = {} } }, caller)
            assert(ctx.writer:update_message_meta(op.checkpoint_anchor_id, {
                behavior_controls = { { context = { session = { set = { replayed = "yes" } } } } },
                behavior_control_state = "pending",
                behavior_call_message_ids = op.call_message_ids,
            }))
            assert(ctx.writer:update_meta({ status = consts.STATUS.RUNNING, meta = { behavior_controls_pending = true } }))
            local saved = control_handlers.control_context
            control_handlers.control_context = function() return nil, "context store failed" end
            local ok, result, err = pcall(message_handlers.process_tools, ctx, op)
            control_handlers.control_context = saved
            if not ok then error(result) end
            test.contains(tostring(err), "context store failed", "the round fails after the release")
            test.is_true(caller.launches["call-c"], "the call ran")
            local stored = assert(approval_repo.get_batch(nil, batch.batch_id))
            test.eq(stored.state .. ":" .. stored.controls, "released:cancelled")
            -- The restart: recovery, then behavior control recovery.
            assert(approval_recovery.recover_calls(ctx.session_id, nil, true))
            test.eq(fx.round_controls(ctx, op, true), "cancelled replayed=nil")
        end)

        it("writes a batch row only while it is pending, so a running round never overwrites recovery", function()
            local ctx = fx.new_ctx({ live = 1 })
            assert(approval_repo.update_tool_approval(ctx.session_id, function() return ctx.config.tool_approval end))
            -- A caller that lets a recovery settle the batch's rows while the
            -- released calls run, as a second writer would.
            local caller = fx.fake_caller()
            local run_calls = caller.execute
            function caller:execute(context, tools, cancel)
                assert(approval_recovery.recover_calls(ctx.session_id, nil, true))
                return run_calls(self, context, tools, cancel)
            end
            local op = fx.round(ctx, { { id = "call-c", registry_id = PLAIN, args = {} } }, caller)
            local _, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.is_true(caller.launches["call-c"], "the call ran")
            test.eq(row(op.call_message_ids["call-c"]).metadata.result, message_repo.INTERRUPTED_RESULT,
                "the first terminal result stays; the round's later write is refused")
        end)

        it("settles exit only after the active round returned, reconciling batches before queued rounds", function()
            local order = {}
            local entered, release_op = channel.new(1), channel.new(1)
            local context: any = {
                reconcile_batches = function() order[#order + 1] = "reconcile"; return true end,
                settle_intents = function() order[#order + 1] = "recover"; return 0 end,
            }
            local bus = command_bus.new(context)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, function(_ctx, op)
                if op.cancel_only then
                    order[#order + 1] = "cancel_only:" .. op.name
                    return { completed = true }
                end
                entered:send(true)
                receive_within(release_op, "the test's release")
                order[#order + 1] = "active returned"
                return { completed = false, next_ops = { { type = consts.OP_TYPE.PROCESS_TOOLS, name = "next" } } }
            end)
            assert(bus:queue_op({ type = consts.OP_TYPE.PROCESS_TOOLS, name = "active" }))
            local bus_done = channel.new(1)
            coroutine.spawn(function()
                local ok, err = bus:run()
                bus_done:send({ ok = ok, error = err })
            end)
            receive_within(entered, "the active round")
            local exited = channel.new(1)
            coroutine.spawn(function()
                local _, err = session.settle_exit(bus, nil, function()
                    local done = receive_within(bus_done, "the end of the bus")
                    return done.error
                end)
                exited:send({ error = err })
            end)
            time.sleep("50ms")
            test.eq(#order, 0, "nothing is settled while the round runs")
            release_op:send(true)
            local result = receive_within(exited, "exit settlement")
            test.is_nil(result.error)
            test.eq(table.concat(order, ","), "active returned,reconcile,cancel_only:next,recover")
            test.eq(bus.state, "closed")
        end)

        it("recovers a failed command bus through the session's recovery hooks", function()
            local ctx, op, batch = crashed_batch()
            local hooks = session._recovery_hooks(ctx.session_id, assert(reader.open(ctx.session_id)),
                function() return true end)
            local context: any = { reconcile_batches = hooks.reconcile_batches, settle_intents = hooks.recover_calls }
            local bus = command_bus.new(context)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function() return nil, "model call failed" end)
            assert(bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP, message_id = "turn" }))
            local _, err = bus:run()
            test.contains(tostring(err), "model call failed")
            test.eq(recovery_summary(ctx, op, batch), CRASHED)
        end)
    end)
end

return test.run_cases(define_tests)
