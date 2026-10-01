local test = require("test")
local writer = require("writer")

local function define_tests()
    describe("session writer metadata lock", function()
        it("serializes pending apply with Stop rollback", function()
            local original_repo = writer._message_repo
            local apply_started = channel.new(1)
            local release_apply = channel.new(1)
            local done = channel.new(2)
            local applying = false
            local overlapped = false

            writer._message_repo = {
                apply_inputs = function(_session_id, _updates, _revision)
                    applying = true
                    apply_started:send(true)
                    release_apply:receive()
                    applying = false
                    return true
                end,
                stop_with_input_rollback = function(_session_id, _updates, _session_updates)
                    if applying then overlapped = true end
                    return true
                end,
            }

            local instance = {
                session_id = "session-1",
                _meta_lock = channel.new(1),
            }
            instance._meta_lock:send(true)

            coroutine.spawn(function()
                local ok, err = writer.apply_inputs(instance, {}, 0)
                done:send({ kind = "apply", ok = ok, err = err })
            end)
            apply_started:receive()

            coroutine.spawn(function()
                local ok, err = writer.stop_with_input_rollback(instance, {}, {})
                done:send({ kind = "stop", ok = ok, err = err })
            end)

            release_apply:send(true)
            local first = done:receive()
            local second = done:receive()
            writer._message_repo = original_repo

            test.is_false(overlapped, "Stop must wait until input application releases the writer lock")
            test.is_true(first.ok)
            test.is_true(second.ok)
            test.eq(first.kind, "apply")
            test.eq(second.kind, "stop")
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
