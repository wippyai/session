local test = require("test")
local command_bus = require("command_bus")

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
end

return { run_tests = test.run_cases(define_tests) }
