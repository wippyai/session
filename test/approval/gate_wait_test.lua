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
local wait_for_boot = require("wait_for_boot")
local fx = require("gate_fixtures")

-- The approval gate's wait, release and end of turn (EE2-2710 slice S7b).
-- process_tools runs in its own coroutine, as the command bus runs it; the
-- test plays the session inbox: it commits decisions through approval_repo
-- (the way the S8 decision command will) and Stop, finish, steering, exit and
-- deletion the way session.lua does, then wakes the gate through the hub.

local MARKED, PLAIN, PRIVATE = fx.MARKED, fx.PLAIN, fx.PRIVATE
local new_ctx, round, row = fx.new_ctx, fx.round, fx.row
local updates_of, has_continue, launches = fx.updates_of, fx.has_continue, fx.launches
local records_by_call = fx.records_by_call
local UI_ACTION = "wippy.agent.tools:ui_action_highlight"

-- Starts process_tools in its own coroutine. Returns a handle for finish().
local function start(ctx: any, op: any): any
    local handle = { done = channel.new(1), started = time.now():unix() }
    coroutine.spawn(function()
        local ok, result, err = pcall(message_handlers.process_tools, ctx, op)
        handle.done:send({ ok = ok, result = result, err = err })
    end)
    return handle
end

-- Waits for process_tools to return (at most `seconds`). Returns its result,
-- its error and the seconds it took.
local function finish(handle: any, seconds: number?): (any, any, number)
    local selected = channel.select({ handle.done:case_receive(), time.after(tostring(seconds or 10) .. "s"):case_receive() })
    test.is_true(selected.channel == handle.done, "process_tools returned in time")
    local outcome = selected.value
    test.is_true(outcome.ok, tostring(outcome.result))
    return outcome.result, outcome.err, time.now():unix() - handle.started
end

-- Yields until the batch has `n` pending requests (the gate waits then).
local function pending(ctx: any, batch_id: string, n: number)
    for _ = 1, 200 do
        local records = approval_repo.list_by_batch(nil, ctx.session_id, batch_id) or {}
        local count = 0
        for _, record in ipairs(records) do
            if record.state == "pending" then count = count + 1 end
        end
        if count >= n then return end
        time.sleep("20ms")
    end
    error("the gate did not create its requests")
end

-- Commits a decision the way the S8 decision command will: one locked
-- transaction; a stop denial closes the batch in it. Wakes the gate unless
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

-- The inbox's Stop: the Stop transaction (with the approval fence), then the
-- synchronous close of the batch cancellation channel (route_input).
local function stop(ctx: any)
    local committed, err = session._commit_stop(ctx, ctx.upstream, nil)
    test.is_true(committed == true, "Stop committed: " .. tostring(err))
    ctx.approval_wake:accept_stop(approval_gate.turn_id(ctx))
end

-- A committed steering message: a pending input row, then the wake signal.
local function steer(ctx: any, quiet: boolean?)
    assert(ctx.writer:add_message(consts.MSG_TYPE.USER, "Use c_10 instead", { input = { state = "pending" } }))
    if not quiet then ctx.approval_wake:notify("steering") end
end

local function reasons(op: any, call_ids: {string}): string
    local out = {}
    for _, call_id in ipairs(call_ids) do
        local result = row(op.call_message_ids[call_id]).metadata.result
        out[#out + 1] = call_id .. "=" .. tostring(type(result) == "table" and result.reason or result)
    end
    return table.concat(out, " ")
end

-- A tool caller whose second call (in call ID order) waits for the
-- cancellation channel, as the framework caller does for a slow launch.
local function slow_caller(): any
    local caller: any = { launches = {}, executed = {}, runs = 0, launched = channel.new(1), cancel = nil }
    function caller:set_strategy() end
    function caller:set_runtime_context_resolver() end
    function caller:execute(_context, tools, cancel, _options)
        self.runs = self.runs + 1
        self.cancel = cancel
        local ids = {}
        for call_id in pairs(tools or {}) do ids[#ids + 1] = call_id end
        table.sort(ids)
        local results = {}
        for index, call_id in ipairs(ids) do
            local tool = tools[call_id]
            self.executed[call_id] = true
            self.launches[call_id] = true
            if index == 1 then
                results[call_id] = { result = { ok = true }, tool_call = tool }
            else
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
    describe("Tool approval gate wait, release and end of turn (EE2-2710 S7b)", function()
        local saved = {}
        before_all(function()
            wait_for_boot.run()
            saved.now = approval_gate._now
            saved.grace = approval_gate.GRACE_SECONDS
            saved.registry_get = approval_gate._registry_get
        end)
        after_each(function()
            approval_gate._now = saved.now
            approval_gate.GRACE_SECONDS = saved.grace
            approval_gate._registry_get = saved.registry_get
        end)
        after_all(function() fx.cleanup() end)

        -- AC 5
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

        -- AC 6
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
            test.is_nil(op.caller.executed["call-a"], "the denied call never reaches the caller")
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

        -- AC 20
        it("expires the batch at the deadline, runs nothing and ends the turn", function()
            local ctx, captured = new_ctx({ live = 1, policy = { timeout_seconds = 30 } })
            local base = time.now():unix()
            local calls = 0
            approval_gate._now = function()
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

        -- AC 21 (Stop, both orders with a decision)
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

        -- AC 21 (finish, supervisor cancel, deletion)
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
                    ctx.approval_wake:notify("finish")
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

        -- AC 22 (both orders, one peer already approved)
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

        -- AC 41 (the locked check in the release transaction)
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

        -- AC 23
        it("stops the remaining launches on Stop after the release and keeps finished results", function()
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
            stop(ctx)
            local _, err, seconds = finish(handle)
            test.is_nil(err)
            test.is_true(seconds < 10)
            test.not_nil(caller.cancel, "the gate passed the batch cancellation channel")
            local first = row(op.call_message_ids["call-a"]).metadata
            test.eq(first.status, consts.FUNC_STATUS.SUCCESS, "the finished result is kept")
            local second = row(op.call_message_ids["call-b"]).metadata
            test.eq(second.status, consts.FUNC_STATUS.CANCELLED)
            test.eq(second.result, "Session stopped while the call was running",
                "the caller's cancellation result, never 'not run'")
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

        -- AC 28
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
                    approval_gate._registry_get = function(id)
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
                approval_gate._registry_get = saved.registry_get
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
                approval_gate._registry_get = function(id)
                    local entry = registry.get(id)
                    if id ~= fx.TARGET then return entry end
                    if case == "removed" then return nil end
                    return { id = entry.id, kind = entry.kind, meta = entry.meta, data = { prompt = "Refund everything." } }
                end
                approve(ctx, batch.batch_id, "call-d")
                finish(handle)
                approval_gate._registry_get = saved.registry_get
                test.is_nil(op.caller.launches["call-d"], case .. ": the call never runs")
                local record = records_by_call(ctx.session_id, batch.batch_id)["call-d"]
                test.eq(record.disposition, "not_run", case)
                test.eq(record.disposition_reason, "intent_changed", case)
            end
        end)

        -- AC 34
        it("settles a gated UI action whose browser binding expired as changed_before_run", function()
            -- The broker's binding lifetime is a setting (ui_action_ttl_seconds,
            -- here 30 s): bound 40 s ago, it expired 10 s ago.
            local now = time.now():unix()
            for _, case in ipairs({
                { bound_at = now - 40, expires_at = now - 10, runs = false },
                { expires_at = now + 2, runs = false },
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

        -- AC 33
        it("gives after-execute wrappers every call with its real or precomputed result", function()
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
                if tool_caller.FEATURES and tool_caller.FEATURES.precomputed_results then
                    test.not_nil(results["call-a"], "the not-run call reaches the wrappers as a precomputed result")
                    test.eq(results["call-a"].error, "Not run: you denied this call.")
                else
                    test.is_nil(results["call-a"], "without the caller feature the Session settles it itself")
                end
                test.eq(row(op.call_message_ids["call-a"]).metadata.result.reason, "denied_by_user")
            end)
            tool_caller._funcs, tool_caller._contract = saved_funcs, saved_contract
            if not ok then error(failure) end
        end)

        -- AC 35
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
                    approval_gate._now = function()
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
                approval_gate._now = saved.now
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

        -- Host EE2-2711: a client learns a private call's row type from its
        -- tool_approval event, so that event comes before the function_error.
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
    end)
end

return { run = test.run_cases(define_tests) }
