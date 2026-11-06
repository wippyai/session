local test = require("test")
local consts = require("consts")
local session = require("session")
local command_bus = require("command_bus")
local context_repo = require("context_repo")
local session_repo = require("session_repo")
local security = require("security")
local uuid = require("uuid")
local wait_for_boot = require("wait_for_boot")

-- The callback the command bus calls once its queue is empty is installed by
-- session.run. Two things depend on it: the finish check of a pending
-- retirement, and the announcement of answers admitted with no turn (after a
-- Stop), which open form cards wait for to show them as delivered. Installing
-- one must not drop the other.

local function define_tests()
    describe("session queue-empty callback", function()
        it("announces deferred answer admissions and still checks a pending finish", function()
            wait_for_boot.run()
            local actor = security.actor()
            local session_id, context_id = uuid.v7(), uuid.v7()
            local _, context_err = context_repo.create(context_id, "primary", "{}")
            test.is_nil(context_err)
            local _, create_err = session_repo.create(session_id, actor:id(), context_id, "Queue empty", "test")
            test.is_nil(create_err)

            local captured: any = nil
            local done: any = nil
            local inbox = { case_receive = function(self) return self end }
            local events = { case_receive = function(self) return self end }
            local bus_done = {
                case_receive = function(self) return self end,
                send = function(_, value) done = value; return true end,
                receive = function() return done end,
            }
            local original_new = command_bus.new
            local original_channel_new = channel.new
            command_bus.new = function(ctx)
                captured = ctx
                return original_new(ctx)
            end
            mock("process.registry", { register = function() return true end })
            mock("process.inbox", function() return inbox end)
            mock("process.events", function() return events end)
            mock("process.send", function() return true end)
            mock("channel.new", function(capacity)
                if capacity == nil then return bus_done end
                return original_channel_new(capacity)
            end)
            mock("coroutine.spawn", function() end)
            local selection = 0
            mock("channel.select", function()
                selection = selection + 1
                if selection == 1 then
                    return { ok = true, channel = events, value = { kind = process.event.CANCEL } }
                end
                return { ok = true, channel = bus_done, value = done }
            end)

            local ok, result = pcall(session.run, {
                session_id = session_id, user_id = actor:id(), parent_pid = "queue-empty-parent", create = true,
            })
            restore_mock("channel.select")
            restore_mock("coroutine.spawn")
            restore_mock("channel.new")
            restore_mock("process.send")
            restore_mock("process.events")
            restore_mock("process.inbox")
            restore_mock("process.registry")
            command_bus.new = original_new
            session_repo.delete(session_id)
            context_repo.delete(context_id)

            test.is_true(ok, tostring(result))
            test.not_nil(captured)
            local ctx: any = captured
            test.eq(type(ctx.queue_empty_callback), "function")

            -- A form answer admitted with no turn waits to be announced.
            ctx.deferred_admissions = {
                { message_id = uuid.v7(), type = consts.MSG_TYPE.USER, metadata = {
                    session_form = { artifact_id = uuid.v7() },
                } },
            }
            local called, callback_err = ctx.queue_empty_callback()
            test.is_nil(callback_err)
            test.is_true(called)
            test.is_nil(ctx.deferred_admissions, "the queue-empty callback must announce deferred admissions")
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
