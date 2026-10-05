local test = require("test")
local consts = require("consts")
local session = require("session")
local context_repo = require("context_repo")
local session_repo = require("session_repo")
local message_repo = require("message_repo")
local security = require("security")
local uuid = require("uuid")
local wait_for_boot = require("wait_for_boot")

local function counted_channel()
    local ch = { case_calls = 0 }
    function ch:case_receive()
        self.case_calls = self.case_calls + 1
        return { channel = self }
    end
    return ch
end

local function message(topic, data)
    return {
        topic = function() return topic end,
        payload = function() return { data = function() return data end } end,
    }
end

-- Run the real session ingress and persistence with scripted arrivals. The
-- command bus is deliberately not scheduled, keeping the first turn active
-- while subsequent user input is admitted as steering.
local function run_session(arrivals)
    wait_for_boot.run()
    local actor = security.actor()
    local session_id, context_id = uuid.v7(), uuid.v7()
    local _, context_err = context_repo.create(context_id, "primary", "{}")
    test.is_nil(context_err)
    local _, create_err = session_repo.create(session_id, actor:id(), context_id, "Select cases", "test")
    test.is_nil(create_err)
    local _, config_err = session_repo.update_session_meta(session_id, {
        config = { input_policy = { while_running = "steer" } },
    })
    test.is_nil(config_err)

    local fixture = {
        inbox = counted_channel(), events = counted_channel(),
        done = counted_channel(), policy = counted_channel(),
        selections = {}, replies = {}, sent = {},
    }
    local original_new = channel.new
    mock("process.registry", { register = function() return true end })
    mock("process.inbox", function() return fixture.inbox end)
    mock("process.events", function() return fixture.events end)
    mock("process.send", function(_, topic, payload)
        table.insert(fixture.sent, { topic = topic, payload = payload })
        return true
    end)
    mock("coroutine.spawn", function() end)
    mock("channel.new", function(capacity)
        if capacity == nil then return fixture.done end
        if capacity == 16 then return fixture.policy end
        return original_new(capacity)
    end)
    mock("channel.select", function(cases)
        table.insert(fixture.selections, cases)
        local arrival = arrivals[#fixture.selections]
        if not arrival then error("Unexpected select after scripted arrivals") end
        return arrival(fixture)
    end)

    local ok, result = pcall(session.run, {
        session_id = session_id, user_id = actor:id(), create = true,
        parent_pid = "select-test-parent",
    })
    restore_mock("channel.select")
    restore_mock("channel.new")
    restore_mock("coroutine.spawn")
    restore_mock("process.send")
    restore_mock("process.events")
    restore_mock("process.inbox")
    restore_mock("process.registry")

    local page, history_err = message_repo.list_by_session(session_id)
    session_repo.delete(session_id)
    context_repo.delete(context_id)
    test.is_true(ok, tostring(result))
    test.is_nil(history_err)
    fixture.result = result
    fixture.history = page.messages
    return fixture
end

local function user_input(text)
    return function(fixture)
        return { ok = true, channel = fixture.inbox,
            value = message(consts.TOPICS.MESSAGE, { data = { text = text }, request_id = text }) }
    end
end

local function cancelled(fixture)
    return { ok = true, channel = fixture.events, value = { kind = process.event.CANCEL } }
end

local function bus_finished(fixture)
    return { ok = true, channel = fixture.done, value = {} }
end

local function closing_policy(fixture)
    return { ok = true, channel = fixture.policy, value = {
        reply = { send = function(_, value) table.insert(fixture.replies, value); return true end },
    } }
end

local function define_tests()
    describe("session receive-case lifetime", function()
        it("reuses cases through steering and shutdown without changing their priority", function()
            local fixture = run_session({
                user_input("first"), user_input("steer-one"), user_input("steer-two"), cancelled,
                closing_policy, user_input("late"), closing_policy, bus_finished,
            })
            local ingress, closing = fixture.selections[1], fixture.selections[5]
            test.eq(#fixture.selections, 8)
            for index = 1, 4 do
                test.is_true(fixture.selections[index] == ingress, "ingress must reuse its case array")
            end
            for index = 5, 8 do
                test.is_true(fixture.selections[index] == closing, "shutdown must reuse its case array")
            end
            test.is_false(ingress == closing)
            test.eq(#ingress, 4)
            test.is_true(ingress[1].channel == fixture.inbox)
            test.is_true(ingress[2].channel == fixture.events)
            test.is_true(ingress[3].channel == fixture.done)
            test.is_true(ingress[4].channel == fixture.policy)
            test.eq(#closing, 3)
            test.is_true(closing[1].channel == fixture.done)
            test.is_true(closing[2].channel == fixture.policy)
            test.is_true(closing[3].channel == fixture.inbox)
            test.eq(fixture.inbox.case_calls, 2)
            test.eq(fixture.events.case_calls, 1)
            test.eq(fixture.done.case_calls, 2)
            test.eq(fixture.policy.case_calls, 2)
            test.eq(fixture.result.status, "shutdown")
            test.is_true(fixture.result.interrupted)
            test.eq(#fixture.history, 3, "late input must not be admitted during shutdown")
            test.eq(fixture.history[1].data, "first")
            test.eq(fixture.history[2].data, "steer-one")
            test.eq(fixture.history[3].data, "steer-two")
            test.eq(fixture.history[2].metadata.input.state, "pending")
            test.eq(fixture.history[3].metadata.input.state, "pending")
            test.eq(#fixture.replies, 2)
            test.eq(fixture.replies[1].error, "Session is closing")
            test.eq(fixture.replies[2].error, "Session is closing")
            local rejected = 0
            for _, event in ipairs(fixture.sent) do
                if event.payload.request_id == "late" then
                    rejected = rejected + 1
                    test.eq(event.payload.type, consts.UPSTREAM_TYPES.ERROR)
                    test.eq(event.payload.code, "SESSION_FINISHING")
                end
            end
            test.eq(rejected, 1, "late input must receive one rejection")
        end)

        it("keeps cases private to each run and skips unused shutdown cases", function()
            local function finish(fixture)
                return { ok = true, channel = fixture.inbox, value = message(consts.TOPICS.FINISH_AND_EXIT, {}) }
            end
            local first = run_session({ finish, bus_finished })
            local second = run_session({ finish, bus_finished })
            for _, fixture in ipairs({ first, second }) do
                test.is_true(fixture.selections[1] == fixture.selections[2])
                test.eq(fixture.inbox.case_calls, 1)
                test.eq(fixture.events.case_calls, 1)
                test.eq(fixture.done.case_calls, 1)
                test.eq(fixture.policy.case_calls, 1)
                test.is_true(fixture.result.intentional_exit)
            end
            local first_cases, second_cases = first.selections[1], second.selections[1]
            if not first_cases or not second_cases then error("Expected ingress cases in both runs") end
            test.is_false(first_cases == second_cases)
            for index = 1, 4 do
                test.is_false(first_cases[index] == second_cases[index])
            end
        end)

        it("keeps concurrent waiters and retained results independent with reused descriptors", function()
            local work, stop, done = channel.new(), channel.new(), channel.new()
            local cases = { work:case_receive(), stop:case_receive() }
            for _ = 1, 2 do
                coroutine.spawn(function()
                    local first = channel.select(cases)
                    local second = channel.select(cases)
                    done:send({ first, second })
                end)
            end
            for value = 1, 4 do work:send(value) end
            local a = done:receive()
            local b = done:receive()
            local seen = {}
            for _, result in ipairs({ a[1], a[2], b[1], b[2] }) do
                test.is_true(result.ok)
                test.is_true(result.channel == work)
                test.is_nil(seen[result.value], "each value must be delivered exactly once")
                seen[result.value] = true
            end
            test.is_false(a[1] == a[2])
            test.is_false(a[1] == b[1])
            test.is_false(b[1] == b[2])
            work:close()
            local closed = channel.select(cases)
            test.is_false(closed.ok)
            test.is_nil(closed.value)
            for _, result in ipairs({ a[1], a[2], b[1], b[2] }) do
                test.is_true(result.ok, "a later select must not mutate a retained result")
                test.is_true(result.channel == work)
                test.is_true(seen[result.value])
            end
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
