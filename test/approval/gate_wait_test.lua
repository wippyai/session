local test = require("test")
local time = require("time")
local json = require("json")
local consts = require("consts")
local approval_gate = require("approval_gate")
local approval_events = require("approval_events")
local approval_repo = require("approval_repo")
local message_repo = require("message_repo")
local message_handlers = require("message_handlers")
local session = require("session")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local reader = require("reader")
local registry = require("registry")
local tool_caller = require("tool_caller")
local activation = require("activation")
local tool_meta = require("tool_meta")
local wait_for_boot = require("wait_for_boot")
local prompt_builder = require("prompt_builder")
local fx = require("gate_fixtures")

-- The approval gate's wait, release and end of turn. process_tools runs in
-- its own coroutine, as the command bus runs it; the test plays the session
-- inbox: it commits decisions through approval_repo, and Stop, finish,
-- steering, exit and deletion the way session.lua does, then wakes the gate
-- through the hub.

local MARKED, PLAIN, PRIVATE = fx.MARKED, fx.PLAIN, fx.PRIVATE
local new_ctx, round, row = fx.new_ctx, fx.round, fx.row
local updates_of, has_continue, launches = fx.updates_of, fx.has_continue, fx.launches
local records_by_call = fx.records_by_call
local start, finish, pending = fx.start, fx.finish, fx.pending
local UI_ACTION = "wippy.agent.tools:ui_action_highlight"

-- Commits a decision in one locked transaction; a stop denial closes the
-- batch in it. Wakes the gate unless
-- opts.quiet. Returns the committed record, or nil, the error and the record.
local function decide(ctx: any, batch_id: string, call_id: string, decision: any, opts: any?): (any, any, any)
    local record = fx.records_by_call(ctx.session_id, batch_id)[call_id]
    local committed, err, current = approval_repo.transact(ctx.session_id, function(dbtx)
        local decided, decide_err, latest = approval_repo.decide(dbtx, ctx.session_id, record.approval_id,
            record.revision, {
                state = decision.state, decided_via = "user", ["then"] = decision["then"],
                reason = decision.reason, decided_by = ctx.user_id,
            })
        if not decided then return nil, decide_err, latest end
        if decision.state == "denied" and decision["then"] == "stop" then
            local closed, close_err = approval_repo.close_batch(dbtx, batch_id, "stop_denial")
            if not closed then return nil, close_err end
        end
        return decided
    end)
    if committed and not (opts and opts.quiet) then ctx.approval_wake:notify("decision") end
    return committed, err, current
end

local function approve(ctx: any, batch_id: string, call_id: string, opts: any?): (any, any, any)
    return decide(ctx, batch_id, call_id, { state = "approved" }, opts)
end

local stop, steer = fx.stop, fx.steer

local function reasons(op: any, call_ids: {string}): string
    local out = {}
    for _, call_id in ipairs(call_ids) do
        local result = row(op.call_message_ids[call_id]).metadata.result
        out[#out + 1] = call_id .. "=" .. tostring(type(result) == "table" and result.reason or result)
    end
    return table.concat(out, " ")
end

-- A sequential tool caller, in call ID order, as the framework runs one: the
-- first call finishes at once, the second waits for the cancellation
-- channel, and a later call is not launched once the channel is closed.
local function slow_caller(): any
    local caller: any = { launches = {}, executed = {}, runs = 0, launched = channel.new(1), cancel = nil }
    function caller:set_strategy() end
    function caller:set_runtime_context_resolver() end
    function caller:execute(_context, tools, cancel)
        self.runs = self.runs + 1
        self.cancel = cancel
        local ids = {}
        for call_id in pairs(tools or {}) do ids[#ids + 1] = call_id end
        table.sort(ids)
        local results = {}
        for index, call_id in ipairs(ids) do
            local tool = tools[call_id]
            self.executed[call_id] = true
            local closed = cancel ~= nil and not channel.select({ cancel:case_receive(), default = true }).default
            if closed then
                results[call_id] = { error = "Tool call was cancelled", cancelled = true, tool_call = tool }
            elseif index == 1 then
                self.launches[call_id] = true
                results[call_id] = { result = { ok = true }, tool_call = tool }
            else
                self.launches[call_id] = true
                self.launched:send(true)
                local selected = channel.select({ cancel:case_receive(), time.after("3s"):case_receive() })
                if selected.channel == cancel then
                    results[call_id] = { error = "Tool call was cancelled", cancelled = true, tool_call = tool }
                else
                    results[call_id] = { result = { ok = true }, tool_call = tool }
                end
            end
        end
        return results
    end
    return caller
end

local function define_tests()
    describe("Tool approval gate wait, release and end of turn", function()
        local saved = {}
        before_all(function()
            wait_for_boot.run()
            saved.now = activation._now
            saved.grace = approval_gate.GRACE_SECONDS
            saved.registry_get = tool_meta._registry_get
        end)
        after_each(function()
            activation._now = saved.now
            approval_gate.GRACE_SECONDS = saved.grace
            tool_meta._registry_get = saved.registry_get
        end)
        after_all(function() fx.cleanup() end)

        it("runs nothing of the batch after a stop denial, ends the turn and cancels its controls", function()
            local ctx, captured = new_ctx({ live = 1 })
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-b", registry_id = MARKED, args = { n = 2 } },
                { id = "call-c", registry_id = PLAIN, args = {} },
            })
            op.behavior_round = true
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 2)
            approve(ctx, batch.batch_id, "call-b", { quiet = true })
            assert(decide(ctx, batch.batch_id, "call-a", { state = "denied", ["then"] = "stop" }))
            local result, err = finish(handle)
            test.is_nil(err)
            test.eq(launches(op.caller), 0, "no call runs, not the approved peer and not the unmarked call")
            test.eq(reasons(op, { "call-a", "call-b", "call-c" }),
                "call-a=stopped_by_user call-b=not_run_batch_stopped call-c=not_run_batch_stopped")
            test.is_false(has_continue(result), "no further model call")
            test.is_true(message_handlers.ended_by_approval(ctx))
            local stored = assert(approval_repo.get_batch(nil, batch.batch_id))
            test.eq(stored.state, "closed")
            test.eq(stored.close_reason, "stop_denial")
            test.eq(stored.controls, "cancelled", "the batch's controls are cancelled")
            test.eq(row(op.checkpoint_anchor_id).metadata.behavior_control_state, "cancelled",
                "the model-phase controls on the assistant row are cancelled")
            for _, update in ipairs(updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_ERROR)) do
                test.eq(update.payload.outcome, "not_approved")
            end
        end)

        it("runs the approved peers and the unmarked call after a continue denial and continues the turn", function()
            local ctx = new_ctx({ live = 1 })
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-b", registry_id = MARKED, args = { n = 2 } },
                { id = "call-c", registry_id = PLAIN, args = {} },
            })
            op.behavior_round = true
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 2)
            approve(ctx, batch.batch_id, "call-b", { quiet = true })
            assert(decide(ctx, batch.batch_id, "call-a",
                { state = "denied", ["then"] = "continue", reason = "Use the staging customer instead." }))
            local result, err = finish(handle)
            test.is_nil(err)
            test.is_nil(op.caller.launches["call-a"], "the denied call never runs")
            test.is_true(op.caller.launches["call-b"])
            test.is_true(op.caller.launches["call-c"])
            local denied = row(op.call_message_ids["call-a"]).metadata
            test.eq(denied.result.reason, "denied_by_user")
            test.eq(denied.result.user_feedback, "Use the staging customer instead.")
            test.eq(row(op.call_message_ids["call-b"]).metadata.status, consts.FUNC_STATUS.SUCCESS)
            test.is_true(has_continue(result), "one more model step")
            test.is_false(message_handlers.ended_by_approval(ctx))
            local records = records_by_call(ctx.session_id, batch.batch_id)
            test.eq(records["call-a"].disposition, "not_run")
            test.eq(records["call-b"].disposition, "dispatched")
            local stored = assert(approval_repo.get_batch(nil, batch.batch_id))
            test.eq(stored.state, "released")
            test.eq(stored.controls, "kept", "a continue denial keeps the normal control behavior")
            test.eq(row(op.checkpoint_anchor_id).metadata.behavior_control_state, "applied")
        end)

        it("expires the batch at the deadline, runs nothing and ends the turn", function()
            local ctx, captured = new_ctx({ live = 1, policy = { timeout_seconds = 30 } })
            local base = time.now():unix()
            local calls = 0
            activation._now = function()
                calls = calls + 1
                if calls == 1 then return base end
                return base + 31
            end
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-c", registry_id = PLAIN, args = {} },
            })
            local result, err = finish(start(ctx, op))
            test.is_nil(err)
            test.eq(launches(op.caller), 0)
            test.eq(reasons(op, { "call-a", "call-c" }), "call-a=expired call-c=not_run_batch_stopped")
            test.eq(records_by_call(ctx.session_id, batch.batch_id)["call-a"].state, "expired")
            test.is_false(has_continue(result))
            test.is_true(message_handlers.ended_by_approval(ctx))
            test.eq(captured.session_updates[#captured.session_updates].activity, json.null, "the activity is cleared")
        end)

        it("releases a decision that commits during the wait's state read although the deadline passes then", function()
            -- The gate's first read of the batch returns the request still
            -- pending; during that read the decision commits (in time), the
            -- clock moves past the deadline and the waiter is woken. The
            -- decision wins: the clock was read before the state.
            local ctx = new_ctx({ live = 1, policy = { timeout_seconds = 30 } })
            local base, offset = time.now():unix(), 0
            activation._now = function() return base + offset end
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-c", registry_id = PLAIN, args = {} },
            })
            local saved_list = approval_repo.list_by_batch
            local raced = false
            approval_repo.list_by_batch = function(conn, session_id, batch_id)
                local rows, err = saved_list(conn, session_id, batch_id)
                local waiting = false
                for _, record in ipairs(rows or {}) do
                    if record.state == "pending" then waiting = true end
                end
                if conn == nil and waiting and not raced then
                    raced = true
                    assert(approve(ctx, batch.batch_id, "call-a", { quiet = true }))
                    offset = 31
                    ctx.approval_wake:notify("decision")
                end
                return rows, err
            end
            local ok, result, err = pcall(function() return finish(start(ctx, op)) end)
            approval_repo.list_by_batch = saved_list
            if not ok then error(result) end
            test.is_nil(err)
            test.is_true(raced, "the race ran in the gate's read")
            test.is_true(op.caller.launches["call-a"], "the approved call runs")
            test.is_true(op.caller.launches["call-c"])
            local stored = assert(approval_repo.get_batch(nil, batch.batch_id))
            test.eq(stored.state, "released", "not closed as deadline")
            test.eq(records_by_call(ctx.session_id, batch.batch_id)["call-a"].disposition, "dispatched")
            test.is_true(has_continue(result))
        end)

        it("starts the grace period when the gate sees no surface, not when its state read began", function()
            -- During the gate's first state read the clock moves past the
            -- grace period and the last surface goes away. The grace period
            -- starts after that read; a decision that commits during the
            -- second read then releases the batch on the third pass.
            approval_gate.GRACE_SECONDS = 5
            local ctx = new_ctx({ live = 1 })
            local base, offset = time.now():unix(), 0
            activation._now = function() return base + offset end
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-c", registry_id = PLAIN, args = {} },
            })
            local saved_list = approval_repo.list_by_batch
            local reads = 0
            approval_repo.list_by_batch = function(conn, session_id, batch_id)
                local rows, err = saved_list(conn, session_id, batch_id)
                local waiting = false
                for _, record in ipairs(rows or {}) do
                    if record.state == "pending" then waiting = true end
                end
                if conn == nil and waiting and reads < 2 then
                    reads = reads + 1
                    if reads == 1 then
                        offset = 6
                        ctx.approval_surfaces = { live = 0, revision = 2 }
                        ctx.approval_wake:notify("surfaces")
                    else
                        assert(approve(ctx, batch.batch_id, "call-a", { quiet = true }))
                        ctx.approval_wake:notify("decision")
                    end
                end
                return rows, err
            end
            local ok, result, err = pcall(function() return finish(start(ctx, op)) end)
            approval_repo.list_by_batch = saved_list
            if not ok then error(result) end
            test.is_nil(err)
            test.eq(reads, 2, "both reads ran in the gate")
            local stored = assert(approval_repo.get_batch(nil, batch.batch_id))
            test.eq(stored.state, "released", "the grace period had not ended")
            test.is_true(op.caller.launches["call-a"], "the approved call runs")
            test.is_true(has_continue(result))
        end)

        it("ends the wait on Stop within 10 s when Stop commits first, and refuses a later decision", function()
            local ctx, captured = new_ctx({ live = 1 })
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            stop(ctx)
            local result, err, seconds = finish(handle)
            test.is_nil(err)
            test.is_true(seconds < 10)
            test.eq(launches(op.caller), 0)
            local stored = row(op.call_message_ids["call-a"]).metadata
            test.eq(stored.status, consts.FUNC_STATUS.CANCELLED)
            test.eq(stored.result.reason, "stopped")
            test.eq(assert(approval_repo.get_batch(nil, batch.batch_id)).close_reason, "stop",
                "the Stop transaction closed the batch")
            local fence = approval_repo.read_turn_fence(nil, ctx.session_id)
            test.eq(fence and fence.turn_id, approval_gate.turn_id(ctx), "the Stop wrote the turn fence")
            test.eq(fence and fence.reason, "stop")
            local late, late_err, current = approve(ctx, batch.batch_id, "call-a")
            test.is_nil(late)
            test.eq(approval_repo.conflict_code(late_err), "not_pending")
            test.eq(current.state, "cancelled")
            test.eq(#(result.next_ops or {}), 0)
            local errors = updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_ERROR)
            test.eq(errors[#errors].payload.outcome, "cancelled")
        end)

        it("runs nothing when a decision commits first and Stop commits before the gate releases", function()
            local ctx = new_ctx({ live = 1 })
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            approve(ctx, batch.batch_id, "call-a", { quiet = true })
            stop(ctx)
            local _, err, seconds = finish(handle)
            test.is_nil(err)
            test.is_true(seconds < 10)
            test.eq(launches(op.caller), 0)
            local record = records_by_call(ctx.session_id, batch.batch_id)["call-a"]
            test.eq(record.state, "approved", "the decision receipt stays")
            test.eq(record.disposition, "not_run")
        end)

        it("ends the wait on finish, exit and deletion within 10 s with no tool run", function()
            for _, case in ipairs({ "finish", "exit", "deleted" }) do
                local ctx = new_ctx({ live = 1 })
                local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
                local handle = start(ctx, op)
                pending(ctx, batch.batch_id, 1)
                if case == "finish" then
                    session._close_approvals_for_finish(ctx)
                    ctx.approval_wake:notify("finish")
                elseif case == "exit" then
                    ctx.approval_wake:notify("exiting")
                else
                    assert(session_repo.delete(ctx.session_id))
                    ctx.approval_wake:notify("deleted")
                end
                local result, err, seconds = finish(handle)
                test.is_nil(err, case)
                test.is_true(seconds < 10, case)
                test.eq(launches(op.caller), 0, case)
                test.eq(#(result.next_ops or {}), 0, case .. ": no checkpoint and no model step")
                if case == "deleted" then
                    test.is_nil(message_repo.get(op.call_message_ids["call-a"]), "the rows are gone")
                else
                    test.eq(row(op.call_message_ids["call-a"]).metadata.result.reason, "interrupted", case)
                    test.eq(records_by_call(ctx.session_id, batch.batch_id)["call-a"].state, "interrupted", case)
                end
            end
        end)

        it("keeps a Stop fence when a finish of the same turn is taken back", function()
            local ctx = new_ctx({ live = 1 })
            session._close_approvals_for_finish(ctx)
            stop(ctx)
            session._cancel_approvals_finish(ctx)
            local fence = approval_repo.read_turn_fence(nil, ctx.session_id)
            test.eq(fence and fence.turn_id, approval_gate.turn_id(ctx))
            test.eq(fence and fence.reason, "stop")
        end)

        it("opens later batches of the turn again when a finish is taken back", function()
            local ctx = new_ctx({ live = 1 })
            session._close_approvals_for_finish(ctx)
            session._cancel_approvals_finish(ctx)
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            test.eq(batch.state, "open", "the finish fence of the turn is cleared")
            test.is_nil(approval_repo.read_turn_fence(nil, ctx.session_id))
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            approve(ctx, batch.batch_id, "call-a")
            finish(handle)
            test.is_true(op.caller.launches["call-a"])
        end)

        it("supersedes the batch on steering that commits after a peer's approval", function()
            local ctx = new_ctx({ live = 1 })
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-b", registry_id = MARKED, args = { n = 2 } },
            })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 2)
            approve(ctx, batch.batch_id, "call-b", { quiet = true })
            steer(ctx)
            local result, err = finish(handle)
            test.is_nil(err)
            test.eq(launches(op.caller), 0)
            test.eq(reasons(op, { "call-a", "call-b" }),
                "call-a=superseded_by_user_message call-b=superseded_by_user_message")
            test.eq(records_by_call(ctx.session_id, batch.batch_id)["call-b"].state, "approved")
            test.is_true(has_continue(result), "the next model step applies the steering message")
            test.is_false(message_handlers.ended_by_approval(ctx))
            for _, call_id in ipairs({ "call-a", "call-b" }) do
                test.is_true(row(op.call_message_ids[call_id]).metadata.status ~= consts.FUNC_STATUS.PENDING,
                    "every result is stored before the next step")
            end
        end)

        it("supersedes the batch on steering that commits first, and refuses a later approval", function()
            local ctx = new_ctx({ live = 1 })
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            steer(ctx)
            local result = finish(handle)
            test.eq(launches(op.caller), 0)
            test.eq(reasons(op, { "call-a" }), "call-a=superseded_by_user_message")
            test.is_true(has_continue(result))
            local late, late_err = approve(ctx, batch.batch_id, "call-a")
            test.is_nil(late)
            test.eq(approval_repo.conflict_code(late_err), "not_pending")
        end)

        it("refuses the release when steering committed before it, with every request approved", function()
            local ctx = new_ctx({ live = 1 })
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            approve(ctx, batch.batch_id, "call-a", { quiet = true })
            steer(ctx, true)
            ctx.approval_wake:notify("decision")
            finish(handle)
            test.eq(launches(op.caller), 0)
            test.eq(assert(approval_repo.get_batch(nil, batch.batch_id)).close_reason, "steering")
        end)

        it("stops the remaining launches on Stop after the release and keeps finished results", function()
            local ctx = new_ctx({ live = 1 })
            local caller = slow_caller()
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-b", registry_id = MARKED, args = { n = 2 } },
                { id = "call-c", registry_id = MARKED, args = { n = 3 } },
            }, caller)
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 3)
            approve(ctx, batch.batch_id, "call-a", { quiet = true })
            approve(ctx, batch.batch_id, "call-b", { quiet = true })
            approve(ctx, batch.batch_id, "call-c")
            caller.launched:receive()
            stop(ctx)
            local _, err, seconds = finish(handle)
            test.is_nil(err)
            test.is_true(seconds < 10)
            test.eq(caller.cancel, ctx.coordinator.cancel, "the caller got the turn's cancellation channel")
            local first = row(op.call_message_ids["call-a"]).metadata
            test.eq(first.status, consts.FUNC_STATUS.SUCCESS, "the finished result is kept")
            local second = row(op.call_message_ids["call-b"]).metadata
            test.eq(second.status, consts.FUNC_STATUS.CANCELLED)
            test.eq(second.result, "Session stopped while the call was running",
                "the caller's cancellation result, never 'not run'")
            test.is_nil(caller.launches["call-c"], "a call not launched before Stop never launches")
            test.eq(row(op.call_message_ids["call-c"]).metadata.status, consts.FUNC_STATUS.CANCELLED)
            local records = records_by_call(ctx.session_id, batch.batch_id)
            test.eq(records["call-b"].disposition, "dispatched")
            test.eq(assert(approval_repo.get_batch(nil, batch.batch_id)).controls, "cancelled",
                "Stop after release cancels the batch's controls")
        end)

        it("does not stop released calls for steering or finish", function()
            local ctx = new_ctx({ live = 1 })
            local caller = slow_caller()
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-b", registry_id = MARKED, args = { n = 2 } },
            }, caller)
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 2)
            approve(ctx, batch.batch_id, "call-a", { quiet = true })
            approve(ctx, batch.batch_id, "call-b")
            caller.launched:receive()
            steer(ctx)
            session._close_approvals_for_finish(ctx)
            ctx.approval_wake:notify("finish")
            local _, err = finish(handle)
            test.is_nil(err)
            test.eq(row(op.call_message_ids["call-b"]).metadata.status, consts.FUNC_STATUS.SUCCESS)
            local stored = assert(approval_repo.get_batch(nil, batch.batch_id))
            test.eq(stored.state, "released")
            test.eq(stored.controls, "kept")
        end)

        it("settles an approved call as changed_before_run when its context or entry changes before release", function()
            for _, case in ipairs({ "context", "entry" }) do
                local ctx = new_ctx({ live = 1 })
                -- The real reader caches the primary context after the first read.
                ctx.reader = assert(reader.open(ctx.session_id))
                local op, batch = round(ctx, {
                    { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                    { id = "call-c", registry_id = PLAIN, args = {} },
                })
                local handle = start(ctx, op)
                pending(ctx, batch.batch_id, 1)
                if case == "context" then
                    assert(context_repo.update(ctx.reader:primary_context_id(), '{"project":"other"}'))
                else
                    tool_meta._registry_get = function(id)
                        local entry = require("registry").get(id)
                        if id == MARKED and entry then
                            local changed = { id = entry.id, kind = entry.kind, data = entry.data, meta = {} }
                            for key, value in pairs(entry.meta or {}) do changed.meta[key] = value end
                            changed.meta.description = "Deletes a customer and every invoice."
                            return changed
                        end
                        return entry
                    end
                end
                approve(ctx, batch.batch_id, "call-a")
                local result, err = finish(handle)
                test.is_nil(err, case)
                test.is_nil(op.caller.launches["call-a"], case .. ": the changed call never runs")
                test.is_true(op.caller.launches["call-c"], case .. ": its peer runs")
                local stored = row(op.call_message_ids["call-a"]).metadata
                test.eq(stored.result.reason, "changed_before_run", case)
                test.is_nil(stored.stale, case .. ": no top-level stale")
                local record = records_by_call(ctx.session_id, batch.batch_id)["call-a"]
                test.eq(record.disposition, "not_run", case)
                test.eq(record.disposition_reason, "intent_changed", case)
                test.is_true(has_continue(result), case .. ": the turn continues")
                tool_meta._registry_get = saved.registry_get
            end
        end)

        it("settles a call that needed no approval as changed_before_run when its tool entry changes during the wait", function()
            for _, case in ipairs({ "unchanged", "newly marked", "entry changed" }) do
                local ctx = new_ctx({ live = 1 })
                local op, batch = round(ctx, {
                    { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                    { id = "call-c", registry_id = PLAIN, args = {} },
                })
                local handle = start(ctx, op)
                pending(ctx, batch.batch_id, 1)
                if case ~= "unchanged" then
                    tool_meta._registry_get = function(id)
                        local entry = registry.get(id)
                        if id ~= PLAIN or not entry then return entry end
                        local changed = { id = entry.id, kind = entry.kind, data = entry.data, meta = {} }
                        for key, value in pairs(entry.meta or {}) do changed.meta[key] = value end
                        if case == "newly marked" then
                            changed.meta.approval = "required"
                        else
                            changed.meta.description = "Looks up a customer and deletes their orders."
                        end
                        return changed
                    end
                end
                approve(ctx, batch.batch_id, "call-a")
                local result, err = finish(handle)
                tool_meta._registry_get = saved.registry_get
                test.is_nil(err, case)
                test.is_true(op.caller.launches["call-a"], case .. ": the approved call runs")
                test.is_true(has_continue(result), case .. ": the turn continues")
                test.is_nil(records_by_call(ctx.session_id, batch.batch_id)["call-c"],
                    case .. ": the call has no approval record")
                if case == "unchanged" then
                    test.is_true(op.caller.launches["call-c"], "positive control: the unchanged call runs")
                else
                    test.is_nil(op.caller.launches["call-c"], case .. ": the changed call never runs")
                    local stored = row(op.call_message_ids["call-c"]).metadata
                    test.eq(stored.result.reason, "changed_before_run", case)
                    test.eq(stored.status, consts.FUNC_STATUS.ERROR, case)
                end
            end
        end)

        it("settles an approved delegation call as changed_before_run when its target agent changes during the wait", function()
            for _, case in ipairs({ "replaced", "removed" }) do
                local ctx = new_ctx({ live = 1, policy = { require = "all" } })
                local op, batch = round(ctx, { { id = "call-d", registry_id = fx.DELEGATE,
                    type = consts.MSG_TYPE.DELEGATION, args = { task = "Refund order 7" },
                    context = { to_agent_id = fx.TARGET } } })
                local handle = start(ctx, op)
                pending(ctx, batch.batch_id, 1)
                tool_meta._registry_get = function(id)
                    local entry = registry.get(id)
                    if id ~= fx.TARGET then return entry end
                    if case == "removed" then return nil end
                    return { id = entry.id, kind = entry.kind, meta = entry.meta, data = { prompt = "Refund everything." } }
                end
                approve(ctx, batch.batch_id, "call-d")
                finish(handle)
                tool_meta._registry_get = saved.registry_get
                test.is_nil(op.caller.launches["call-d"], case .. ": the call never runs")
                local record = records_by_call(ctx.session_id, batch.batch_id)["call-d"]
                test.eq(record.disposition, "not_run", case)
                test.eq(record.disposition_reason, "intent_changed", case)
            end
        end)

        it("settles a gated UI action whose browser binding expired as changed_before_run", function()
            -- The broker's binding lifetime is a setting (ui_action_ttl_seconds,
            -- here 30 s): bound 40 s ago, it expired 10 s ago.
            local now = time.now():unix()
            for _, case in ipairs({
                { bound_at = now - 40, expires_at = now - 10, runs = false },
                { expires_at = now, runs = false },
                { expires_at = now + 100, runs = true },
            }) do
                local ctx = new_ctx({ live = 1, policy = { require = "all" } })
                local op, batch = round(ctx, { { id = "call-ui", registry_id = UI_ACTION, args = { selector = "#x" } } })
                op.ui_action_runtime = { session_id = ctx.session_id, host_instance_id = "host-1",
                    delivery_handle = "handle-1", agent_actions_authorized = true,
                    bound_at = case.bound_at, expires_at = case.expires_at }
                local handle = start(ctx, op)
                pending(ctx, batch.batch_id, 1)
                approve(ctx, batch.batch_id, "call-ui")
                finish(handle)
                local record = records_by_call(ctx.session_id, batch.batch_id)["call-ui"]
                if case.runs then
                    test.eq(record.disposition, "dispatched", "positive control: a fresh binding runs")
                    test.is_true(op.caller.launches["call-ui"])
                else
                    test.eq(record.disposition_reason, "intent_changed")
                    test.is_nil(op.caller.launches["call-ui"], "never sent to a Host")
                    test.eq(row(op.call_message_ids["call-ui"]).metadata.result.reason, "changed_before_run")
                end
            end
        end)

        it("gives after-execute wrappers every call, the not-run ones with their not-run text", function()
            local ctx = new_ctx({ live = 1 })
            local wrapper_calls = {}
            local saved_funcs, saved_contract = tool_caller._funcs, tool_caller._contract
            local launched = {}
            tool_caller._funcs = { new = function()
                return { with_context = function(_self, _context)
                    return {
                        call = function(_s, registry_id) launched[#launched + 1] = registry_id; return { ok = true }, nil end,
                        async = function(_s, registry_id)
                            launched[#launched + 1] = registry_id
                            local response = channel.new(1)
                            response:send(true)
                            return {
                                response = function() return response end,
                                cancel = function() end,
                                is_canceled = function() return false end,
                                result = function() return { data = function() return { ok = true } end }, nil end,
                            }, nil
                        end,
                    }
                end }
            end }
            tool_caller._contract = { get = function()
                local opened = { apply = function(_self, payload)
                    wrapper_calls[#wrapper_calls + 1] = payload
                    return {}, nil
                end }
                local def = { open = function() return opened, nil end }
                function def:with_context() return { open = function() return opened, nil end } end
                return def, nil
            end }
            local ok, failure = pcall(function()
                local caller = tool_caller.new()
                caller:set_wrapper_context({ host = { kind = "session", session_id = ctx.session_id } })
                caller:set_tool_wrappers({ { id = "audit", phases = { tool_caller.PHASE.AFTER_EXECUTE },
                    binding = "test.wrapper:audit" } })
                local op, batch = round(ctx, {
                    { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                    { id = "call-b", registry_id = MARKED, args = { n = 2 } },
                    { id = "call-c", registry_id = PLAIN, args = {} },
                }, caller)
                caller.last_tool_calls = op.tool_calls
                local handle = start(ctx, op)
                pending(ctx, batch.batch_id, 2)
                approve(ctx, batch.batch_id, "call-b", { quiet = true })
                assert(decide(ctx, batch.batch_id, "call-a", { state = "denied", ["then"] = "continue", reason = "No" }))
                local _, err = finish(handle)
                test.is_nil(err)
                test.eq(#launched, 2, "only the released calls launch")
                test.eq(#wrapper_calls, 1)
                local results = wrapper_calls[1].tool_results or {}
                test.not_nil(results["call-b"])
                test.not_nil(results["call-c"])
                test.not_nil(results["call-a"], "the denied call reaches the wrappers")
                test.eq(results["call-a"].error, "Not run: you denied this call.")
                test.eq(row(op.call_message_ids["call-a"]).metadata.result.reason, "denied_by_user")
            end)
            tool_caller._funcs, tool_caller._contract = saved_funcs, saved_contract
            if not ok then error(failure) end
        end)

        it("keeps a requested checkpoint after a fence unless finish ends the batch, with no dispatch while waiting", function()
            for _, case in ipairs({ { signal = "deadline", checkpoint = true }, { signal = "finish", checkpoint = false } }) do
                local ctx = new_ctx({ live = 1, policy = { timeout_seconds = 30 } })
                ctx.reader.get_context = function(_self, key)
                    return key == consts.CONTEXT_KEYS.CHECKPOINT_REQUESTED or nil
                end
                ctx.agent_ctx = { get_current_agent = function() return { id = fx.AGENT, model = "m",
                    bindings = { checkpoint = { binding = "app:checkpoint" } }, agent_options = {} } end }
                local op, batch = round(ctx, {
                    { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                    { id = "call-c", registry_id = PLAIN, args = {} },
                })
                op.checkpoint_bindings = { binding = "app:checkpoint" }
                local handle
                if case.signal == "deadline" then
                    local base, calls = time.now():unix(), 0
                    activation._now = function()
                        calls = calls + 1
                        return calls == 1 and base or base + 31
                    end
                    handle = start(ctx, op)
                else
                    handle = start(ctx, op)
                    pending(ctx, batch.batch_id, 1)
                    test.eq(op.caller.runs, 0, "nothing is dispatched while the request waits")
                    session._close_approvals_for_finish(ctx)
                    ctx.approval_wake:notify("finish")
                end
                local result, err = finish(handle)
                test.is_nil(err)
                activation._now = saved.now
                test.eq(op.caller.runs, 0)
                for _, call_id in ipairs({ "call-a", "call-c" }) do
                    test.is_true(row(op.call_message_ids[call_id]).metadata.status ~= consts.FUNC_STATUS.PENDING,
                        case.signal .. ": every call has its result")
                end
                local checkpoint = nil
                for _, next_op in ipairs(result.next_ops or {}) do
                    if next_op.type == consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS then checkpoint = next_op end
                end
                if case.checkpoint then
                    test.not_nil(checkpoint, "the requested checkpoint still runs")
                    test.eq(checkpoint.checkpoint_bindings.binding, "app:checkpoint")
                else
                    test.is_nil(checkpoint, "finish skips the checkpoint")
                end
            end
        end)

        it("ends the wait after the grace period when a declared surface does not come back", function()
            approval_gate.GRACE_SECONDS = 1
            local ctx, captured = new_ctx({ declared = "2026-11-19T10:00:00Z" })
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local result, err, seconds = finish(start(ctx, op))
            test.is_nil(err)
            test.is_true(seconds <= 5)
            test.eq(launches(op.caller), 0)
            test.eq(assert(approval_repo.get_batch(nil, batch.batch_id)).close_reason, "grace")
            test.eq(reasons(op, { "call-a" }), "call-a=approval_ui_unavailable")
            test.is_false(has_continue(result))
            test.eq(#captured.notices, 1, "the same notice as a session that never declared a surface")
            test.eq(captured.notices[1].code, "tool_approval_unavailable")
        end)

        it("keeps waiting while a surface is live and releases when the decision arrives", function()
            approval_gate.GRACE_SECONDS = 1
            local ctx = new_ctx({ live = 1 })
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            time.sleep("1500ms")
            test.eq(records_by_call(ctx.session_id, batch.batch_id)["call-a"].state, "pending",
                "no grace period runs while a surface is live")
            approve(ctx, batch.batch_id, "call-a")
            local result = finish(handle)
            test.is_true(op.caller.launches["call-a"])
            test.is_true(has_continue(result))
        end)

        -- A client learns a private call's row type from its tool_approval
        -- event, so that event comes before the function_error.
        it("publishes a private call's tool_approval event before its function_error", function()
            local ctx, captured = new_ctx({ live = 1, policy = { require = "all" } })
            local op, batch = round(ctx, {
                { id = "call-p", registry_id = PRIVATE, type = consts.MSG_TYPE.PRIVATE_FUNCTION, args = { q = 1 } },
            })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            assert(decide(ctx, batch.batch_id, "call-p", { state = "denied", ["then"] = "continue", reason = "No" }))
            finish(handle)
            local decided_at, error_at = nil, nil
            for index, update in ipairs(captured.updates) do
                if update.id == "call-p" and update.type == approval_events.TOOL_APPROVAL
                    and update.payload.approval.disposition == "not_run" then decided_at = index end
                if update.id == "call-p" and update.type == consts.UPSTREAM_TYPES.FUNCTION_ERROR then error_at = index end
            end
            test.not_nil(decided_at)
            test.not_nil(error_at)
            test.is_true(decided_at < error_at, "tool_approval first")
            test.eq(captured.updates[decided_at].payload.row_type, "private_function")
        end)

        it("releases a batch that needs no decision and closes nothing else", function()
            local ctx = new_ctx({ live = 1 })
            local op, batch = round(ctx, { { id = "call-c", registry_id = PLAIN, args = {} } })
            local result = finish(start(ctx, op))
            test.is_true(op.caller.launches["call-c"])
            test.is_true(has_continue(result))
            test.eq(assert(approval_repo.get_batch(nil, batch.batch_id)).state, "released")
        end)

        -- AC 4: approved private and delegation calls run without a
        -- function_call or function_success event; the public peer gets both.
        it("emits no function_call or function_success for a user-approved private or delegation call", function()
            local ctx, captured = new_ctx({ live = 1, policy = { require = "all" } })
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-p", registry_id = PRIVATE, type = consts.MSG_TYPE.PRIVATE_FUNCTION, args = { q = 1 } },
                { id = "call-d", registry_id = fx.DELEGATE, type = consts.MSG_TYPE.DELEGATION,
                    args = { task = "Refund order 7" }, context = { to_agent_id = fx.TARGET } },
            })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 3)
            approve(ctx, batch.batch_id, "call-a", { quiet = true })
            approve(ctx, batch.batch_id, "call-p", { quiet = true })
            approve(ctx, batch.batch_id, "call-d")
            local _, err = finish(handle)
            test.is_nil(err)
            local function count(call_id: string, kind: string): number
                local n = 0
                for _, update in ipairs(captured.updates) do
                    if update.id == call_id and update.type == kind then n = n + 1 end
                end
                return n
            end
            test.is_true(op.caller.launches["call-a"])
            test.eq(count("call-a", consts.UPSTREAM_TYPES.FUNCTION_CALL), 1, "positive control: the public call")
            test.eq(count("call-a", consts.UPSTREAM_TYPES.FUNCTION_SUCCESS), 1, "positive control: the public call")
            for _, call_id in ipairs({ "call-p", "call-d" }) do
                test.is_true(op.caller.launches[call_id], call_id .. " ran")
                test.eq(records_by_call(ctx.session_id, batch.batch_id)[call_id].decided_via, "user", call_id)
                test.eq(count(call_id, consts.UPSTREAM_TYPES.FUNCTION_CALL), 0, call_id .. ": no function_call")
                test.eq(count(call_id, consts.UPSTREAM_TYPES.FUNCTION_SUCCESS), 0, call_id .. ": no function_success")
            end
        end)

        -- AC 35: a checkpoint forced before the requests are created, or after
        -- the release settled the batch (while the calls run).
        it("keeps every call paired with one result and the checkpoint binding when a checkpoint is forced around the wait", function()
            for _, case in ipairs({ "before requests", "after settlement" }) do
                local ctx = new_ctx({ live = 1 })
                local requested = case == "before requests"
                ctx.reader.get_context = function(_self, key)
                    return key == consts.CONTEXT_KEYS.CHECKPOINT_REQUESTED and requested or nil
                end
                ctx.agent_ctx = { get_current_agent = function() return { id = fx.AGENT, model = "m",
                    bindings = { checkpoint = { binding = "app:checkpoint" } }, agent_options = {} } end }
                local caller = fx.fake_caller()
                local execute = caller.execute
                caller.execute = function(self, context, tools, cancel)
                    if case == "after settlement" then requested = true end
                    return execute(self, context, tools, cancel)
                end
                local op, batch = round(ctx, {
                    { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                    { id = "call-c", registry_id = PLAIN, args = {} },
                }, caller)
                local handle = start(ctx, op)
                pending(ctx, batch.batch_id, 1)
                test.eq(caller.runs, 0, case .. ": nothing is dispatched while the request waits")
                approve(ctx, batch.batch_id, "call-a")
                local result, err = finish(handle)
                test.is_nil(err, case)
                test.eq(caller.runs, 1, case)
                local checkpoint = nil
                for _, next_op in ipairs(result.next_ops or {}) do
                    if next_op.type == consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS then checkpoint = next_op end
                end
                test.not_nil(checkpoint, case .. ": the requested checkpoint runs")
                test.eq(checkpoint and checkpoint.checkpoint_bindings.binding, "app:checkpoint", case)
                test.eq(checkpoint and checkpoint.checkpoint_anchor_id, op.checkpoint_anchor_id, case)
                -- The prompt the next step builds: each call once, then its one result.
                local builder = assert(prompt_builder.from_session(assert(reader.open(ctx.session_id)),
                    { include_contexts = false, include_files = false, cache_markers = false }))
                local messages = builder:get_messages()
                for _, call_id in ipairs({ "call-a", "call-c" }) do
                    local calls, results = {}, {}
                    for index, message in ipairs(messages) do
                        if type(message.function_call) == "table" and message.function_call.id == call_id then
                            calls[#calls + 1] = index
                        elseif message.function_call_id == call_id then
                            results[#results + 1] = index
                        end
                    end
                    test.eq(#calls, 1, case .. ": one call " .. call_id)
                    test.eq(#results, 1, case .. ": one result for " .. call_id)
                    test.is_true((calls[1] or 0) < (results[1] or 0), case .. ": " .. call_id .. " result after its call")
                end
            end
        end)

        -- AC 41: a closure committed after the atomic call-and-batch write and
        -- before the gate's first transaction.
        it("runs and asks nothing when Stop, finish or steering commits after the batch write and before the gate", function()
            for _, case in ipairs({ "stop", "finish", "steering" }) do
                local ctx = new_ctx({ live = 1 })
                local op, batch = round(ctx, {
                    { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                    { id = "call-c", registry_id = PLAIN, args = {} },
                })
                test.eq(batch.state, "open", case .. ": the write stored the batch open")
                if case == "stop" then
                    stop(ctx)
                elseif case == "finish" then
                    session._close_approvals_for_finish(ctx)
                    ctx.approval_wake:notify("finish")
                else
                    steer(ctx)
                end
                local _, err = finish(start(ctx, op))
                test.is_nil(err, case)
                test.eq(op.caller.runs, 0, case .. ": nothing is dispatched")
                test.eq(launches(op.caller), 0, case)
                for _, call_id in ipairs({ "call-a", "call-c" }) do
                    test.is_true(row(op.call_message_ids[call_id]).metadata.status ~= consts.FUNC_STATUS.PENDING,
                        case .. ": " .. call_id .. " has its result")
                end
                local stored = assert(approval_repo.get_batch(nil, batch.batch_id))
                test.eq(stored.state, "closed", case)
                if case ~= "steering" then
                    test.eq(next(records_by_call(ctx.session_id, batch.batch_id)), nil,
                        case .. ": no request for a batch closed before the gate")
                end
            end
        end)

        -- AC 41: Stop waits for the session lock that the release holds; the
        -- release commits, then Stop completes before caller:execute.
        it("runs nothing when Stop waits on the release lock and commits after the release, before dispatch", function()
            local ctx = new_ctx({ live = 1 })
            local caller = slow_caller()
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-b", registry_id = MARKED, args = { n = 2 } },
            }, caller)
            local order, stopped = {}, channel.new(1)
            local stop_outcome: any = nil
            local saved_release = approval_repo.release_batch
            approval_repo.release_batch = function(...)
                order[#order + 1] = "release:start"
                -- Inside the release transaction: Stop starts now and waits
                -- for the session lock.
                coroutine.spawn(function()
                    local ok, failure = pcall(stop, ctx)
                    order[#order + 1] = "stop:committed"
                    stopped:send({ ok = ok, failure = failure })
                end)
                local released, release_err, latest = saved_release(...)
                order[#order + 1] = "release:written"
                return released, release_err, latest
            end
            local slow_execute = caller.execute
            caller.execute = function(self, context, tools, cancel)
                local selected = channel.select({ stopped:case_receive(), time.after("10s"):case_receive() })
                stop_outcome = selected.value
                order[#order + 1] = "execute"
                return slow_execute(self, context, tools, cancel)
            end
            local ok, failure = pcall(function()
                local handle = start(ctx, op)
                pending(ctx, batch.batch_id, 2)
                approve(ctx, batch.batch_id, "call-a", { quiet = true })
                approve(ctx, batch.batch_id, "call-b")
                local _, err = finish(handle)
                test.is_nil(err)
            end)
            approval_repo.release_batch = saved_release
            if not ok then error(failure) end
            test.is_true(stop_outcome ~= nil and stop_outcome.ok == true, "Stop committed: " .. tostring(stop_outcome
                and stop_outcome.failure))
            test.eq(table.concat(order, " "), "release:start release:written stop:committed execute")
            test.eq(launches(caller), 0, "no call launches")
            test.eq(caller.cancel, ctx.coordinator.cancel, "the caller got the closed cancellation channel")
            local records = records_by_call(ctx.session_id, batch.batch_id)
            test.eq(records["call-a"].disposition, "dispatched", "the release committed")
            for _, call_id in ipairs({ "call-a", "call-b" }) do
                test.eq(row(op.call_message_ids[call_id]).metadata.status, consts.FUNC_STATUS.CANCELLED, call_id)
            end
        end)

        -- AC 41: a protected response with notes and no calls stores no batch.
        it("stores no batch for a protected response that has only notes", function()
            local ctx = new_ctx({ live = 1 })
            local options = approval_gate.response_options(ctx)
            test.not_nil(options, "the session enforces approvals")
            local assistant_id, _ids, err, _date, batch = ctx.writer:add_response("Noted.", {}, {},
                { { type = consts.MSG_TYPE.DEVELOPER, content = "A note for the next step.", metadata = {} } },
                nil, options)
            test.is_nil(err)
            test.not_nil(assistant_id)
            test.is_nil(batch)
            test.eq(fx.count("session_tool_approval_batches", ctx.session_id), 0)
            -- Positive control: a response with a call stores its batch.
            round(ctx, { { id = "call-c", registry_id = PLAIN, args = {} } })
            test.eq(fx.count("session_tool_approval_batches", ctx.session_id), 1)
        end)

        -- AC 41: every request approved, then finish commits between the
        -- gate's wake-up and its release transaction.
        it("refuses the release when finish commits after every request was approved", function()
            local ctx = new_ctx({ live = 1 })
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-c", registry_id = PLAIN, args = {} },
            })
            local saved_wait = approval_gate._wait
            local woke = false
            approval_gate._wait = function(wait_ctx, run, waiting)
                local outcome, wait_err = saved_wait(wait_ctx, run, waiting)
                if type(outcome) == "table" and outcome.release then
                    woke = true
                    -- Committed, but the hub is not told: only the release
                    -- transaction can see it.
                    session._close_approvals_for_finish(wait_ctx)
                end
                return outcome, wait_err
            end
            local ok, failure = pcall(function()
                local handle = start(ctx, op)
                pending(ctx, batch.batch_id, 1)
                approve(ctx, batch.batch_id, "call-a")
                local _, err = finish(handle)
                test.is_nil(err)
            end)
            approval_gate._wait = saved_wait
            if not ok then error(failure) end
            test.is_true(woke, "the gate woke to every request approved")
            test.eq(launches(op.caller), 0)
            local stored = assert(approval_repo.get_batch(nil, batch.batch_id))
            test.eq(stored.state .. ":" .. tostring(stored.close_reason), "closed:finish")
            local record = records_by_call(ctx.session_id, batch.batch_id)["call-a"]
            test.eq(record.state, "approved")
            test.eq(record.disposition, "not_run")
            test.eq(row(op.call_message_ids["call-a"]).metadata.result.reason, "interrupted")
        end)

        -- AC 43: the merged session context names another agent than the
        -- validated delegation target.
        it("settles a delegation call whose session context names another agent as changed_before_run", function()
            for _, case in ipairs({ "same target", "other target" }) do
                local ctx = new_ctx({ live = 1 })
                local named = case == "same target" and fx.TARGET or fx.AGENT
                ctx.reader.get_full_context = function() return { to_agent_id = named }, nil end
                local op, batch = round(ctx, {
                    { id = "call-d", registry_id = fx.DELEGATE, type = consts.MSG_TYPE.DELEGATION,
                        args = { task = "Refund order 7" }, context = { to_agent_id = fx.TARGET } },
                })
                local result, err = finish(start(ctx, op))
                test.is_nil(err, case)
                test.is_nil(records_by_call(ctx.session_id, batch.batch_id)["call-d"], case .. ": no request")
                if case == "same target" then
                    test.is_true(op.caller.launches["call-d"], "positive control: the delegation runs")
                else
                    test.is_nil(op.caller.launches["call-d"], "nothing is dispatched to either agent")
                    test.eq(row(op.call_message_ids["call-d"]).metadata.result.reason, "changed_before_run")
                    test.is_true(has_continue(result), "the turn continues")
                end
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
