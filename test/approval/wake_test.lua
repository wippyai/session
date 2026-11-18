local test = require("test")
local wake = require("wake")

-- Takes the token from a channel without blocking: "token", "empty" or "closed".
local function poll(ch: any): string
    local result = channel.select({ ch:case_receive(), default = true })
    if result.default then return "empty" end
    if not result.ok then return "closed" end
    return "token"
end

local function define_tests()
    describe("Tool approval wake hub", function()
        it("does nothing for a non-sticky signal without an armed waiter", function()
            local hub = wake.new()
            test.is_false(hub:notify(wake.KIND.STEERING))
            local waiter = hub:arm("batch-1")
            test.eq(poll(waiter.channel), "empty", "an earlier steering signal is not replayed")
            test.is_nil(waiter.flags.steering)
        end)

        it("never blocks: repeated signals leave one token and every flag", function()
            local hub = wake.new()
            local waiter = hub:arm("batch-1")
            for _ = 1, 5 do test.is_true(hub:notify(wake.KIND.DECISION)) end
            test.is_true(hub:notify(wake.KIND.SURFACES))
            test.is_true(hub:notify(wake.KIND.STEERING))
            test.eq(poll(waiter.channel), "token")
            test.eq(poll(waiter.channel), "empty", "a full channel drops the extra tokens")
            local flags = wake.take(waiter)
            test.is_true(flags.decision)
            test.is_true(flags.surfaces)
            test.is_true(flags.steering)
            test.is_nil(next(waiter.flags), "take clears the flags")
        end)

        it("keeps finish, deleted and exiting set for a waiter armed later", function()
            for _, kind in ipairs({ wake.KIND.FINISH, wake.KIND.DELETED, wake.KIND.EXITING }) do
                local hub = wake.new()
                test.is_false(hub:notify(kind))
                test.is_true(hub:is_set(kind))
                local waiter = hub:arm("batch-late")
                test.eq(poll(waiter.channel), "token", kind .. " wakes a waiter armed after it")
                test.is_true(waiter.flags[kind])
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

    describe("Tool approval batch cancellation channel", function()
        it("is open after registration and closes synchronously when Stop is accepted", function()
            local hub = wake.new()
            local waiter = hub:arm("batch-1")
            local cancel = hub:register_batch_cancel("batch-1", "turn-1")
            test.eq(poll(cancel), "empty")
            hub:accept_stop("turn-1")
            test.eq(poll(cancel), "closed", "closed before accept_stop returns")
            test.is_true(hub:batch_cancelled("batch-1"))
            test.is_true(waiter.flags.stop)
        end)

        it("starts closed when the Stop of its turn was accepted before registration", function()
            local hub = wake.new()
            hub:accept_stop("turn-1")
            local same_turn = hub:register_batch_cancel("batch-1", "turn-1")
            test.eq(poll(same_turn), "closed")
            local next_turn = hub:register_batch_cancel("batch-2", "turn-2")
            test.eq(poll(next_turn), "empty", "a Stop of an earlier turn does not cancel a later batch")
        end)

        it("closes for deletion and exit, also when registered afterwards", function()
            for _, kind in ipairs({ wake.KIND.DELETED, wake.KIND.EXITING }) do
                local hub = wake.new()
                local cancel = hub:register_batch_cancel("batch-1", "turn-1")
                hub:notify(kind)
                test.eq(poll(cancel), "closed", kind .. " closes the registered channel")
                local later = hub:register_batch_cancel("batch-2", "turn-2")
                test.eq(poll(later), "closed", kind .. " closes a channel registered later")
            end
        end)

        it("does not close for steering, finish, decisions or surfaces", function()
            local hub = wake.new()
            local cancel = hub:register_batch_cancel("batch-1", "turn-1")
            for _, kind in ipairs({ wake.KIND.STEERING, wake.KIND.FINISH, wake.KIND.DECISION,
                wake.KIND.REVOKED, wake.KIND.SURFACES }) do
                hub:notify(kind)
            end
            test.eq(poll(cancel), "empty", "release is the point after which only Stop, exit and deletion cancel")
        end)

        it("forgets the registration of a settled batch only", function()
            local hub = wake.new()
            local cancel = hub:register_batch_cancel("batch-1", "turn-1")
            hub:unregister_batch_cancel("other")
            hub:accept_stop("turn-1")
            test.eq(poll(cancel), "closed")
            hub:unregister_batch_cancel("batch-1")
            test.is_false(hub:batch_cancelled("batch-1"))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
