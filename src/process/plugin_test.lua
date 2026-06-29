local test = require("test")
local plugin = require("plugin")

local function define_tests()
    describe("plugin on_session_end hook", function()
        it("schedules the hook with provenance params when configured", function()
            local spawned = nil
            local called = nil :: table?

            local scheduled = plugin.fire_session_end_hook(
                "app:on_end",
                {
                    session_id = "sess-1",
                    user_id = "user-1",
                    status = "idle",
                    reason = "terminated",
                },
                function(fn)
                    spawned = fn
                end,
                function(func_id, params)
                    called = { func_id = func_id, params = params }
                end
            )

            test.is_true(scheduled)
            test.not_nil(spawned)
            test.is_nil(called)

            -- The hook runs only when the spawned coroutine body executes.
            spawned()

            test.not_nil(called)
            test.eq((called or {}).func_id, "app:on_end")
            test.eq(((called or {}).params or {}).session_id, "sess-1")
            test.eq(((called or {}).params or {}).user_id, "user-1")
            test.eq(((called or {}).params or {}).status, "idle")
            test.eq(((called or {}).params or {}).reason, "terminated")
        end)

        it("does not schedule when func_id is nil", function()
            local spawn_count = 0

            local scheduled = plugin.fire_session_end_hook(
                (nil :: any),
                {
                    session_id = "sess-1",
                    user_id = "user-1",
                    status = "idle",
                    reason = "disabled",
                },
                function(_fn)
                    spawn_count = spawn_count + 1
                end,
                function(_name, ...): any
                    return nil
                end
            )

            test.is_false(scheduled)
            test.eq(spawn_count, 0)
        end)

        it("does not schedule when func_id is empty string", function()
            local spawn_count = 0

            local scheduled = plugin.fire_session_end_hook(
                "",
                {
                    session_id = "sess-1",
                    user_id = "user-1",
                    status = "idle",
                    reason = "disabled",
                },
                function(_fn)
                    spawn_count = spawn_count + 1
                end,
                function(_name, ...): any
                    return nil
                end
            )

            test.is_false(scheduled)
            test.eq(spawn_count, 0)
        end)
    end)
end

return test.run_cases(define_tests)
