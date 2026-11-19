local test = require("test")
local wake = require("wake")

-- Takes the token from a channel without blocking: "token" or "empty".
local function poll(ch: any): string
    local result = channel.select({ ch:case_receive(), default = true })
    if result.default then return "empty" end
    return "token"
end

local function define_tests()
    describe("Tool approval wake hub", function()
        it("does nothing for a non-sticky signal without an armed waiter", function()
            local hub = wake.new()
            test.is_false(hub:notify(wake.KIND.STEERING))
            local waiter = hub:arm("batch-1")
            test.eq(poll(waiter.channel), "empty", "an earlier steering signal is not replayed")
        end)

        it("never blocks: repeated signals leave one token", function()
            local hub = wake.new()
            local waiter = hub:arm("batch-1")
            for _ = 1, 5 do test.is_true(hub:notify(wake.KIND.DECISION)) end
            test.is_true(hub:notify(wake.KIND.SURFACES))
            test.is_true(hub:notify(wake.KIND.STOP))
            test.eq(poll(waiter.channel), "token")
            test.eq(poll(waiter.channel), "empty", "a full channel drops the extra tokens")
        end)

        it("keeps finish, deleted and exiting set for a waiter armed later", function()
            for _, kind in ipairs({ wake.KIND.FINISH, wake.KIND.DELETED, wake.KIND.EXITING }) do
                local hub = wake.new()
                test.is_false(hub:notify(kind))
                test.is_true(hub:is_set(kind))
                local waiter = hub:arm("batch-late")
                test.eq(poll(waiter.channel), "token", kind .. " wakes a waiter armed after it")
            end
        end)

        it("drops a finish that was taken back", function()
            local hub = wake.new()
            hub:notify(wake.KIND.FINISH)
            hub:cancel_finish()
            test.is_false(hub:is_set(wake.KIND.FINISH))
            local waiter = hub:arm("batch-2")
            test.eq(poll(waiter.channel), "empty")
        end)

        it("disarms only the waiter that is still armed", function()
            local hub = wake.new()
            local first = hub:arm("batch-1")
            local second = hub:arm("batch-2")
            hub:disarm(first)
            test.is_true(hub:notify(wake.KIND.DECISION), "the second waiter stays armed")
            test.eq(poll(second.channel), "token")
            hub:disarm(second)
            test.is_false(hub:notify(wake.KIND.DECISION))
        end)

        it("refuses an unknown signal", function()
            local hub = wake.new()
            local ok = pcall(function() hub:notify("decided") end)
            test.is_false(ok)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
