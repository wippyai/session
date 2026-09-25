local test = require("test")
local command_bus = require("command_bus")
local consts = require("consts")

-- The session asks the bus to finish (FINISH_AND_EXIT: the client disconnected, the plugin
-- is shutting down, the session went inactive) expecting the in-flight work to wind down and
-- the process to exit. An agent turn is a self-perpetuating chain of operations: every
-- handler result carries the next op. finish() only stops the bus once the queue is empty,
-- so if the chain keeps re-feeding itself through next_ops the queue never empties and the
-- "finishing" session runs forever (observed 2026-09-21: a tool loop survived every
-- graceful-termination signal for 10.5 hours and was only killed by a redeploy).
--
-- A handler that returns next_ops is a continuation of the SAME turn, not new work, so a
-- finishing bus must stop feeding it, exactly the way an intercept (STOP) already does.

local SAFETY_VALVE = 5

-- Runs a "loop" op that re-queues itself through next_ops on a fresh bus. `on_call(n, bus)`
-- runs before each op's result is produced and returns true once it has signalled the bus.
-- The handler cuts the chain by itself after `max_calls`, or SAFETY_VALVE calls after the
-- signal, so a defective bus cannot hang the suite; whoever cuts the chain also stops the
-- bus, because an idle bus blocks in run() waiting for more work (that is its job in the
-- session process). The assertions look at how many calls slipped through after the signal.
local function run_loop(max_calls: number, on_call: ((number, any) -> boolean)?): (number, number?, any)
    local bus = command_bus.new({})
    local calls = 0
    local signalled_at: number? = nil

    bus:mount_op_handler("loop", function(_ctx, _op)
        calls = calls + 1
        if signalled_at == nil and on_call ~= nil and on_call(calls, bus) then
            signalled_at = calls
        end
        if calls >= max_calls or (signalled_at ~= nil and calls - signalled_at >= SAFETY_VALVE) then
            bus:stop()
            return { completed = true }
        end
        return { completed = false, next_ops = { { type = "loop" } } }
    end)

    bus:queue_op({ type = "loop" })
    local ok, err = bus:run()
    test.is_nil(err)
    test.is_true(ok == true)

    return calls, signalled_at, bus
end

local function define_tests()
    describe("command bus termination of a self-perpetuating chain", function()
        it("runs a chain to its natural end", function()
            local calls, _, bus = run_loop(3)
            test.eq(calls, 3)
            test.eq(bus.pending_ops, 0)
        end)

        it("finish() on an idle bus stops it immediately", function()
            local bus = command_bus.new({})
            bus:finish()
            local ok, err = bus:run()
            test.is_nil(err)
            test.is_true(ok == true)
        end)

        it("intercept (STOP) drops the in-flight operation's next_ops", function()
            local calls, signalled_at, bus = run_loop(100, function(n, current_bus)
                if n == 2 then
                    current_bus:intercept(function(_ctx, _op)
                        -- In the session process STOP leaves the bus idle for the next user
                        -- message; here nothing else will arrive, so stop it once intercepted.
                        current_bus:stop()
                        return { completed = true, intercepted = true }
                    end)
                    return true
                end
                return false
            end)

            test.eq(signalled_at, 2)
            test.eq(calls, 2, "no operation may run after the intercepted one")
            test.eq(bus.pending_ops, 0, "an intercepted operation's next_ops must not be enqueued")
        end)
    end)
    describe("turn boundaries", function()
        it("keeps call intents and outcomes before held input and runs one guarded continuation", function()
            local order = {}
            local ctx = { held = { "user-2" } }
            local bus = command_bus.new(ctx)
            ctx.flush_held = function(run_agent)
                for _, id in ipairs(ctx.held) do table.insert(order, id) end
                ctx.held = {}
                return run_agent and "user-2" or nil
            end
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                bus.turn_state.steps = bus.turn_state.steps + 1
                table.insert(order, "assistant")
                table.insert(order, "call-1")
                table.insert(order, "call-2")
                return { next_ops = {{ type = consts.OP_TYPE.PROCESS_TOOLS }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, function()
                table.insert(order, "result-1")
                table.insert(order, "result-2")
                return { next_ops = {
                    { type = consts.OP_TYPE.CONTROL_CONTEXT },
                    { type = consts.OP_TYPE.AGENT_CONTINUE }
                } }
            end)
            bus:mount_op_handler(consts.OP_TYPE.CONTROL_CONTEXT, function()
                table.insert(order, "control")
                return { completed = true }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                table.insert(order, "continue-" .. tostring(bus.turn_state.steps))
                bus:stop()
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP,
                from_user = true, message_id = "user-1" })
            local _, err = bus:run()
            test.is_nil(err)
            test.eq(table.concat(order, ","),
                "assistant,call-1,call-2,result-1,result-2,control,user-2,continue-1")
        end)

        it("terminalizes unstarted calls when STOP arrives during the agent step", function()
            local order = {}
            local state_at_end = nil
            local ctx = { held = { "held" } }
            local bus = command_bus.new(ctx)
            ctx.on_turn_end = function() state_at_end = bus.state end
            ctx.flush_held = function(run_agent)
                table.insert(order, run_agent and "held-and-run" or "held-only")
                ctx.held = {}
            end
            ctx.queue_empty_callback = function() bus:stop(); return true end
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                bus:request_stop()
                return { next_ops = {
                    { type = consts.OP_TYPE.PROCESS_TOOLS },
                    { type = consts.OP_TYPE.AGENT_CONTINUE }
                } }
            end)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, function(_ctx, op)
                table.insert(order, op.cancel_only and "cancel-intents" or "execute-intents")
                return { completed = true }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                table.insert(order, "continued")
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP, from_user = true, message_id = "first" })
            local _, err = bus:run()
            test.is_nil(err)
            test.eq(table.concat(order, ","), "cancel-intents,held-only")
            test.eq(state_at_end, "idle")
            test.eq(bus.state, "closed")
        end)

        it("records an accepted user message when STOP precedes its dispatch", function()
            local recorded = 0
            local steps = 0
            local ctx = {}
            local bus = command_bus.new(ctx)
            ctx.queue_empty_callback = function() bus:stop(); return true end
            bus:mount_op_handler(consts.OP_TYPE.HANDLE_MESSAGE, function()
                recorded = recorded + 1
                return { next_ops = {{ type = consts.OP_TYPE.AGENT_STEP,
                    from_user = true, message_id = "user" }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                steps = steps + 1
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.HANDLE_MESSAGE, starts_turn = true })
            bus:request_stop()
            local _, err = bus:run()
            test.is_nil(err)
            test.eq(recorded, 1)
            test.eq(steps, 0)
        end)

        it("applies tool outcomes and control before draining STOP", function()
            local order = {}
            local ctx = { held = { "held" } }
            local bus = command_bus.new(ctx)
            ctx.flush_held = function(run_agent)
                table.insert(order, run_agent and "held-and-run" or "held-only")
                ctx.held = {}
            end
            ctx.queue_empty_callback = function() bus:stop(); return true end
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                return { next_ops = {{ type = consts.OP_TYPE.PROCESS_TOOLS }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, function()
                bus:request_stop()
                table.insert(order, "result-written")
                return { next_ops = {
                    { type = consts.OP_TYPE.CONTROL_CONTEXT },
                    { type = consts.OP_TYPE.AGENT_CONTINUE }
                } }
            end)
            bus:mount_op_handler(consts.OP_TYPE.CONTROL_CONTEXT, function()
                table.insert(order, "control")
                return { completed = true }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                table.insert(order, "continued")
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP, from_user = true, message_id = "first" })
            local _, err = bus:run()
            test.is_nil(err)
            test.eq(table.concat(order, ","), "result-written,control,held-only")
        end)

        it("finishes after writing held input without an agent step", function()
            local order = {}
            local ctx = { held = { "held" } }
            local bus = command_bus.new(ctx)
            ctx.flush_held = function(run_agent)
                table.insert(order, run_agent and "held-and-run" or "held-only")
                ctx.held = {}
            end
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                bus:finish()
                return { next_ops = {{ type = consts.OP_TYPE.AGENT_CONTINUE }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                table.insert(order, "continued")
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP, from_user = true, message_id = "first" })
            local _, err = bus:run()
            test.is_nil(err)
            test.eq(table.concat(order, ","), "held-only")
            test.eq(bus.state, "closed")
        end)
    end)

end

return { run_tests = test.run_cases(define_tests) }
