local test = require("test")
local consts = require("consts")
local contexts = require("context_repo")
local sessions = require("session_repo")
local messages = require("message_repo")
local uuid = require("uuid")
local time = require("time")
local security = require("security")
local store = require("store")
local sql = require("sql")
local boot = require("boot")
local framework_capabilities = require("framework_capabilities")
local env = require("env")

local function scenario(reason: string, reconnect: boolean?, cancels_in_flight: boolean?)
    local explicit_stop = reason == "stop"
    -- Stop cancels the in-flight provider call, so no tool intent is produced.
    local cancelled = explicit_stop and cancels_in_flight == true
    local finish_after_turn = reconnect or reason == "foreign_finish"
    boot.run()
    local id, context_id = uuid.v7(), uuid.v7()
    local actor = assert(security.actor())
    assert(contexts.create(context_id, "primary", "{}"))
    assert(sessions.create(id, actor:id(), context_id, "Session lifecycle regression", "test", {}, {
        agent_id = "app.lifecycle:agent", model = "session-lifecycle-model", max_turn_iterations = 4,
    }))
    local storage = assert(store.get("app.lifecycle:state"))
    assert(storage:set("count", 0))
    assert(storage:set("scenario", { parent = process.pid(), id = id }))
    storage:release()
    local db = assert(sql.get("app:db"))
    assert(db:execute("CREATE TABLE IF NOT EXISTS session_lifecycle_effects (id TEXT PRIMARY KEY)"))
    db:release()
    local pid, spawn_err = process.spawn_monitored(consts.PROCESS.SESSION_ID, "app:processes", {
        session_id = id, user_id = actor:id(), parent_pid = process.pid(), create = true,
    })
    assert(pid, tostring(spawn_err))
    local exit: any = nil
    local terminal = {} :: {any}
    local function receive_until(predicate: any): any
        local inbox, events, deadline = process.inbox(), process.events(), time.timer("12s")
        local ok, value = pcall(function()
            while true do
                local selected = channel.select({ inbox:case_receive(), events:case_receive(), deadline:channel():case_receive() })
                assert(selected.ok and selected.channel ~= deadline:channel(), "native lifecycle response deadline")
                if selected.channel == events then
                    if selected.value.from == pid then
                        exit = selected.value
                        if predicate("exit", exit) then return exit end
                        error("session exited before expected response")
                    end
                else
                    local message: any = assert(selected.value)
                    local topic = message:topic()
                    local payload = message:payload():data()
                    if payload.type == consts.UPSTREAM_TYPES.FUNCTION_ERROR then terminal[#terminal + 1] = payload end
                    if predicate(topic, payload) then return payload end
                    if payload.type == consts.UPSTREAM_TYPES.ERROR then
                        error("session error: " .. tostring(payload.message or payload.code))
                    end
                end
            end
        end)
        deadline:stop()
        if not ok then error(value) end
        return value
    end
    local ok, failure = pcall(function()
        receive_until(function(_, data) return data.status == "idle" end)
        assert(process.send(pid, consts.TOPICS.MESSAGE, {
            request_id = "native-user", data = { text = "Edit the document." },
        }))
        local generating = receive_until(function(topic) return topic == "lifecycle:model_ready" end)
        if explicit_stop then
            assert(process.send(pid, consts.TOPICS.STOP, { request_id = "native-stop" }))
        else
            if reason ~= "foreign_finish" then
                assert(process.send(pid, consts.TOPICS.FINISH_AND_EXIT, { reason = reason }))
            end
            if reason == "foreign_finish" or reason == "foreign_cancel" then
                assert(process.send(generating.pid, "lifecycle:control", {
                    pid = pid, topic = reason == "foreign_finish" and consts.TOPICS.FINISH_AND_EXIT or "cancel_finish",
                }))
                receive_until(function(topic) return topic == "lifecycle:control_done" end)
            end
            if reconnect then
                assert(process.send(pid, "cancel_finish", {}))
                -- A stale token is never accepted as an external finish.
                assert(process.send(pid, consts.TOPICS.FINISH_AND_EXIT, { finish_generation = 1 }))
            end
        end
        -- A roundtrip through the same receiver proves the lifecycle control
        -- has been processed while the real provider call is still suspended.
        assert(process.send(pid, consts.TOPICS.COMMAND, {
            command = "context_transport_capabilities", capabilities_version = 1,
            request_id = "native-barrier",
        }))
        receive_until(function(_, data) return data.request_id == "native-barrier" end)
        if not cancelled then assert(process.send(generating.pid, "lifecycle:release", {})) end
        if explicit_stop or finish_after_turn then
            local started = time.now()
            receive_until(function(_, data) return data.status == "idle" end)
            if cancelled then
                test.is_true(time.now():sub(started):seconds() < 2, "Stop must cancel the provider call promptly")
            end
            assert(process.send(pid, consts.TOPICS.FINISH_AND_EXIT, {}))
        end
        local completion = receive_until(function(topic) return topic == "exit" end)
        test.is_nil(completion.result and completion.result.error)
        local page = assert(messages.list_by_session(id, 100))
        local call = nil
        for _, message in ipairs(page.messages) do
            if message.type == consts.MSG_TYPE.FUNCTION then call = message end
        end
        local check_db = assert(sql.get("app:db"))
        local rows = assert(check_db:query("SELECT COUNT(*) AS count FROM session_lifecycle_effects WHERE id = $1", {id}))
        check_db:release()
        if cancelled then
            test.is_nil(call, "a cancelled provider call stores no tool intent")
            test.eq(rows[1].count, 0)
            test.eq(#terminal, 0)
            local state = assert(store.get("app.lifecycle:state"))
            test.eq(state:get("count"), 1, "the cancelled provider call must not be repeated")
            state:release()
            return
        end
        test.not_nil(call, "provider tool intent must be stored")
        if explicit_stop then
            test.eq(rows[1].count, 0)
            test.eq(call.metadata.status, consts.FUNC_STATUS.CANCELLED)
            test.eq(#terminal, 1, "Stop must settle the cancelled live chip")
        else
            test.eq(call.metadata.status, consts.FUNC_STATUS.SUCCESS, tostring(call.metadata.result))
            test.eq(rows[1].count, 1, "disconnect finish must allow the edit to commit")
            test.eq(call.metadata.result, "Stored edit.")
        end
    end)
    if not exit then process.terminate(pid) end
    sessions.delete(id)
    contexts.delete(context_id)
    local cleanup_db = assert(sql.get("app:db"))
    cleanup_db:execute("DELETE FROM session_lifecycle_effects WHERE id = $1", {id})
    cleanup_db:release()
    if not ok then error(failure) end
end

local function define_tests()
    describe("native in-flight model lifecycle", function()
        for _, reason in ipairs({ "shutdown", "user_closed", "inactivity", "limit_exceeded" }) do
            it("commits tool results after " .. reason .. " during provider generation", function() scenario(reason) end)
        end
        it("invalidates a pending finish on reconnect and stays usable", function() scenario("shutdown", true) end)
        it("ignores retirement requested by a foreign process", function() scenario("foreign_finish") end)
        it("ignores cancellation of retirement by a foreign process", function() scenario("foreign_cancel") end)
        if env.get("WIPPY_TEST_REQUIRE_CASES") == "1" or framework_capabilities.cancels_in_flight() then
            it("cancels the in-flight provider call on Stop", function() scenario("stop", false, true) end)
        else
            it("cancels explicitly stopped work and settles its live event", function() scenario("stop") end)
        end
    end)
end

return test.run_cases(define_tests)
