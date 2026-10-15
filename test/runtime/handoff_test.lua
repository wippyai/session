local test = require("test")
local consts = require("consts")
local reader = require("reader")
local writer = require("writer")
local context_repo = require("context_repo")
local session_repo = require("session_repo")
local message_repo = require("message_repo")
local wait_for_boot = require("wait_for_boot")
local security = require("security")
local uuid = require("uuid")
local store = require("store")
local time = require("time")
local json = require("json")
local env = require("env")
local benchmark_report = require("benchmark_report")
local agent = require("agent")
local prompt = require("prompt")
local response_mapper = require("response_mapper")
local active_pid = nil
local active_exit = nil

local function receive_until(predicate, description)
    local inbox, events, timer = process.inbox(), process.events(), time.timer("5s")
    local deadline = timer:channel()
    while true do
        local selected = channel.select({ inbox:case_receive(), events:case_receive(), deadline:case_receive() })
        if selected.channel == deadline then
            timer:stop()
            error("Deadline waiting for " .. description)
        end
        if selected.channel == events then
            if selected.value.from == active_pid then
                timer:stop()
                if selected.value.kind == process.event.EXIT then active_exit = selected.value end
                error("Session exited while waiting for " .. description .. ": " .. tostring(json.encode(selected.value)))
            end
        else
            local message = selected.value
            local payload = message:payload():data()
            if payload.type == consts.UPSTREAM_TYPES.ERROR then
                timer:stop()
                error("Session error: " .. tostring(payload.message or payload.code))
            end
            if predicate(message:topic(), payload) then
                timer:stop()
                return payload
            end
        end
    end
end

local function open_process(session_id, user_id, create)
    local pid, err = process.spawn_monitored(consts.PROCESS.SESSION_ID, "app:processes", {
        session_id = session_id, user_id = user_id, parent_pid = process.pid(), create = create,
    })
    test.is_nil(err)
    test.not_nil(pid)
    active_pid, active_exit = pid, nil
    receive_until(function(topic, payload)
        return topic == "session:" .. session_id and payload.status == "idle" and payload.interaction ~= nil
    end, "session readiness")
    return pid
end

local function wait_for_exit(pid, session_id)
    local events, timer = process.events(), time.timer("5s")
    local deadline = timer:channel()
    while true do
        local selected = channel.select({ events:case_receive(), deadline:case_receive() })
        if selected.channel == deadline then
            timer:stop()
            error("Deadline waiting for session shutdown")
        end
        if selected.value.from == pid then
            timer:stop()
            active_exit = selected.value
            test.is_nil(selected.value.result and selected.value.result.error)
            break
        end
    end
    local registered = process.registry.lookup("session." .. session_id)
    test.is_nil(registered, "Session registry entry leaked after shutdown")
    active_pid = nil
end

local function close_process(pid, session_id)
    local sent, err = process.send(pid, consts.TOPICS.FINISH_AND_EXIT, {})
    test.is_nil(err)
    test.is_true(sent)
    wait_for_exit(pid, session_id)
end

local function stop_active_process()
    if not active_pid then return active_exit end
    local pid = active_pid
    if not active_exit then
        local _, terminate_err = process.terminate(pid)
        local events, timer = process.events(), time.timer("5s")
        local deadline = timer:channel()
        while not active_exit do
            local selected = channel.select({ events:case_receive(), deadline:case_receive() })
            if selected.channel == deadline then
                return nil, "Deadline waiting for session termination: " .. tostring(terminate_err)
            end
            if selected.value.from == pid and selected.value.kind == process.event.EXIT then
                timer:stop()
                active_exit = selected.value
            end
        end
    end
    active_pid = nil
    return active_exit
end

local function assert_history(messages, mixed)
    local encoded = json.encode(messages)
    test.not_nil(encoded)
    local cursor = 0
    for _, text in ipairs({ "Earlier question.", "Earlier answer.", "Please hand off this request.",
        "Transferring the request.", "Handoff accepted." }) do
        local position = encoded:find(text, cursor + 1, true)
        test.not_nil(position, "Missing chronological history: " .. text)
        cursor = position
    end
    test.is_nil(encoded:find("_control", 1, true), "Internal controls leaked into the prompt")
    if mixed then test.contains(encoded, "Expected mixed-result failure") end
end

local function run_scenario(options)
    options = options or {}
    local storage = store.get("app.runtime:state")
    storage:set("requests", {})
    storage:set("scenario", { mixed = options.mixed == true, stop = options.stop == true,
        malformed = options.malformed,
        hold_handoff = options.retire_at == "handoff",
        hold_prompt = options.hold_prompt == true or options.retire_at == "prompt", parent = process.pid() })
    local stopped = options.stop or (options.hold_prompt and not options.retire_at) or options.stop_after_retire
    local actor = security.actor()
    local session_id, context_id = uuid.v7(), uuid.v7()
    local _, context_err = context_repo.create(context_id, "primary", "{}")
    test.is_nil(context_err)
    local _, create_err = session_repo.create(session_id, actor:id(), context_id, "Runtime handoff", "test", {}, {
        agent_id = "app.runtime:router", model = "session-runtime-router",
        max_turn_iterations = 4, max_repeated_tool_calls = 2,
    })
    test.is_nil(create_err)
    local persistence, writer_err = writer.new(session_id)
    test.is_nil(writer_err)
    test.not_nil(persistence)
    local _, question_err = persistence:add_message(consts.MSG_TYPE.USER, "Earlier question.")
    test.is_nil(question_err)
    local _, answer_err = persistence:add_message(consts.MSG_TYPE.ASSISTANT, "Earlier answer.")
    test.is_nil(answer_err)
    local pid
    local function retire()
        assert(process.send(pid, consts.TOPICS.FINISH_AND_EXIT, {reason = "shutdown"}))
        if options.cancel_retire then
            assert(process.send(pid, "cancel_finish", {}))
            assert(process.send(pid, consts.TOPICS.FINISH_AND_EXIT, {finish_generation = 1}))
        end
        if options.stop_after_retire then
            assert(process.send(pid, consts.TOPICS.STOP, {request_id = "runtime-stop"}))
            receive_until(function(_, payload) return payload.request_id == "runtime-stop" end, "committed Stop")
        end
        -- Same-sender FIFO plus a reply proves the lifecycle request was
        -- processed while handoff/prompt construction is still suspended.
        assert(process.send(pid, consts.TOPICS.COMMAND, {
            command = "context_transport_capabilities", capabilities_version = 1,
            request_id = "retirement-barrier",
        }))
        receive_until(function(_, payload) return payload.request_id == "retirement-barrier" end, "retirement barrier")
    end
    local ok, failure = pcall(function()
        pid = open_process(session_id, actor:id(), true)
        if options.fail_after_open then error("Injected handoff fixture failure") end
        local sent, send_err = process.send(pid, consts.TOPICS.MESSAGE, {
            request_id = "runtime-input", data = { text = "Please hand off this request." },
        })
        test.is_nil(send_err)
        test.is_true(sent)
        receive_until(function(_, payload)
            return payload.type == consts.UPSTREAM_TYPES.RECEIVED and payload.request_id == "runtime-input"
        end, "accepted user message")
        if options.stop or options.retire_at == "handoff" then
            local ready = receive_until(function(topic) return topic == "fixture:handoff_ready" end, "handoff barrier")
            if options.retire_at then retire() else
                process.send(pid, consts.TOPICS.STOP, { request_id = "runtime-stop" })
                receive_until(function(_, payload) return payload.request_id == "runtime-stop" end, "committed Stop")
            end
            process.send(ready.pid, "fixture:release", true)
        end
        if options.hold_prompt or options.retire_at == "prompt" then
            local ready = receive_until(function(topic) return topic == "fixture:prompt_ready" end, "prompt barrier")
            if options.retire_at then retire() else
                process.send(pid, consts.TOPICS.STOP, { request_id = "runtime-stop" })
                receive_until(function(_, payload) return payload.request_id == "runtime-stop" end, "committed Stop")
            end
            process.send(ready.pid, "fixture:prompt_release", true)
        end
        if options.retire_at and not options.cancel_retire then
            wait_for_exit(pid, session_id)
        else
            receive_until(function(topic, payload)
                return topic == "session:" .. session_id and payload.status == "idle"
            end, "completed turn")
            if options.cancel_retire then
                test.eq(process.registry.lookup("session." .. session_id), pid, "reconnect must retain the same process")
            end
            close_process(pid, session_id)
        end
        local requests = storage:get("requests")
        test.eq(#requests, stopped and 1 or 2, "Expected exactly one handoff continuation unless stopped")
        test.eq(requests[1].model, "router")
        if not stopped then
            test.eq(requests[2].model, "help")
            assert_history(requests[2].messages, options.mixed or options.malformed ~= nil)
        end
        pid = nil
        local reopened, reopen_err = reader.open(session_id)
        test.is_nil(reopen_err)
        test.not_nil(reopened)
        test.eq(reopened:state().config.agent_id, "app.runtime:help")
        test.eq(reopened:state().config.model, "session-runtime-help")
        test.eq(reopened:get_context("handoff_note"), "Keep the earlier conversation.")
        local messages, history_err = message_repo.list_all_by_session(session_id)
        test.is_nil(history_err)
        local handoffs, failures, answers, malformed = 0, 0, 0, 0
        for _, message in ipairs(messages) do
            if message.type == consts.MSG_TYPE.FUNCTION and message.metadata.call_id == "call-handoff" then
                handoffs = handoffs + 1
                test.eq(message.metadata.status, consts.FUNC_STATUS.SUCCESS)
                test.eq(message.metadata.control_operations.config.agent, "app.runtime:help")
                test.eq(message.metadata.result.message, "Handoff accepted.")
                test.is_nil(message.metadata.result._control)
            elseif message.type == consts.MSG_TYPE.FUNCTION and message.metadata.call_id == "call-failure" then
                failures = failures + 1
                test.eq(message.metadata.status, consts.FUNC_STATUS.ERROR)
                test.contains(message.metadata.result, "Expected mixed-result failure")
            elseif message.type == consts.MSG_TYPE.FUNCTION and message.metadata.call_id == "call-malformed" then
                malformed = malformed + 1
                test.eq(message.metadata.status, consts.FUNC_STATUS.ERROR)
                test.contains(message.metadata.result, "Invalid tool control")
                test.is_nil(message.metadata.control_operations)
            end
            if message.type == consts.MSG_TYPE.ASSISTANT and message.data == "The help agent completed the handoff." then
                answers = answers + 1
            end
        end
        test.eq(handoffs, 1)
        test.eq(failures, (options.mixed or options.malformed) and 1 or 0)
        test.eq(malformed, options.malformed and 1 or 0)
        test.eq(answers, stopped and 0 or 1)
        if options.reopen then
            pid = open_process(session_id, actor:id(), false)
            test.eq(#storage:get("requests"), stopped and 1 or 2, "Reopening must not resume a finished turn")
            close_process(pid, session_id)
            pid = nil
        end
    end)
    local exit, cleanup_err = stop_active_process()
    if options.observe_cleanup then options.observe_cleanup(exit, session_id) end
    if cleanup_err then
        storage:release()
        error(ok and cleanup_err or tostring(failure) .. "; cleanup failed: " .. cleanup_err)
    end
    session_repo.delete(session_id)
    context_repo.delete(context_id)
    storage:release()
    if not ok then error(failure) end
end

local function run_stop_history_scenario(reopen)
    local storage = assert(store.get("app.runtime:state"))
    storage:set("requests", {})
    storage:set("scenario", { hold_prompt = true, parent = process.pid() })
    local actor = security.actor()
    local session_id, context_id = uuid.v7(), uuid.v7()
    assert(context_repo.create(context_id, "primary", "{}"))
    assert(session_repo.create(session_id, actor:id(), context_id, "Stop history", "test", {}, {
        agent_id = "app.runtime:help", model = "session-runtime-help",
    }))
    local old_request = "Rebuild the document."
    local followups = { "Continue rebuilding the document.", "Now answer a different question." }
    local ok, failure = pcall(function()
        local pid = open_process(session_id, actor:id(), true)
        assert(process.send(pid, consts.TOPICS.MESSAGE, {
            request_id = "old-request", data = { text = old_request },
        }))
        local ready = receive_until(function(topic) return topic == "fixture:prompt_ready" end, "held prompt")
        for _, request_id in ipairs({ "stop", "stop-again" }) do
            assert(process.send(pid, consts.TOPICS.STOP, { request_id = request_id }))
            receive_until(function(_, data) return data.request_id == request_id end, "committed Stop")
        end
        assert(process.send(ready.pid, "fixture:prompt_release", true))
        receive_until(function(topic, data)
            return topic == "session:" .. session_id and data.status == "idle"
        end, "stopped turn")
        test.eq(#storage:get("requests"), 0, "Stop must suppress the held provider request")
        if reopen then
            close_process(pid, session_id)
            pid = open_process(session_id, actor:id(), false)
        end
        local history = assert(message_repo.list_all_by_session(session_id))
        local boundary, boundaries = nil, 0
        for _, message in ipairs(history) do
            if message.type == consts.MSG_TYPE.DEVELOPER and message.metadata.interruption then
                boundary, boundaries = message.data, boundaries + 1
                test.eq(message.metadata.interruption.reason, "stop")
                test.is_true(message.metadata.preserve_position)
            end
        end
        test.eq(boundaries, 1, "repeated Stop and reopen must not duplicate history")
        test.contains(boundary, "does not resume automatically")
        test.contains(boundary, "Later user messages are active requests")
        test.contains(boundary, "including requests to continue the stopped work")
        storage:set("scenario", {})
        for index, text in ipairs(followups) do
            assert(process.send(pid, consts.TOPICS.MESSAGE, {
                request_id = "followup-" .. index, data = { text = text },
            }))
            local settled = receive_until(function(topic, data)
                return topic == "session:" .. session_id and data.status == "idle"
            end, "follow-up completion")
            test.is_true(settled.interaction.can_send, "Stop must not disable later turns")
            local requests = storage:get("requests")
            test.eq(#requests, index, "each later request must reach the provider normally")
            local messages = requests[index].messages
            for _, input in ipairs({ messages, response_mapper.map_messages(messages) }) do
                local old_position, boundary_position, current_position, count = nil, nil, nil, 0
                for position, message in ipairs(input) do
                    for _, part in ipairs(message.content or {}) do
                        if part.text == old_request then old_position = position end
                        if part.text == boundary then boundary_position, count = position, count + 1 end
                        if part.text == text then current_position = position end
                    end
                end
                test.eq(count, 1, "Stop must remain one historical event")
                test.not_nil(old_position)
                test.not_nil(boundary_position)
                test.not_nil(current_position)
                test.is_true(old_position < boundary_position and boundary_position < current_position,
                    "Stop must precede the active request in provider input")
            end
            local instructions = response_mapper.extract_instructions(messages)
            test.is_nil(instructions and instructions:find(boundary, 1, true),
                "historical Stop must not become a global provider instruction")
        end
        close_process(pid, session_id)
    end)
    local _, cleanup_err = stop_active_process()
    if not cleanup_err then
        session_repo.delete(session_id)
        context_repo.delete(context_id)
    end
    storage:release()
    if cleanup_err then error(tostring(failure) .. "; cleanup failed: " .. cleanup_err) end
    if not ok then error(failure) end
end

local function framework_stops_before_generation()
    local probe = agent.new({ id = "stop-check-probe", name = "Stop check probe",
        description = "Detects step stop_check support", prompt = "Probe." })
    local previous = agent._llm
    local seen = { generated = false }
    agent._llm = { generate = function()
        seen.generated = true
        return { result = "", tokens = {} }
    end }
    local ok, result = pcall(probe.step, probe, prompt.new(), { stop_check = function() return true end })
    agent._llm = previous
    return ok and type(result) == "table" and result.stopped == true and not seen.generated
end

local function define_tests()
    test.describe("Session handoff through the runtime", function()
        test.before_all(function() wait_for_boot.run() end)
        test.it("persists tool controls and continues with chronological history after handoff", function()
            run_scenario({ reopen = true })
        end)
        test.it("retains the successful handoff alongside a failed tool result", function()
            run_scenario({ mixed = true })
        end)
        for _, phase in ipairs({"handoff", "prompt"}) do
            test.it("finishes the persisted handoff when retirement arrives during " .. phase, function()
                run_scenario({retire_at = phase, reopen = true})
            end)
        end
        test.it("cancels pending retirement during prompt construction and keeps the same session", function()
            run_scenario({retire_at = "prompt", cancel_retire = true, reopen = true})
        end)
        test.it("commits a handoff but suppresses its continuation after Stop", function()
            run_scenario({ stop = true, reopen = true })
        end)
        for _, reopen in ipairs({ false, true }) do
            test.it("scopes Stop to earlier work and executes later requests" .. (reopen and " after reopen" or ""), function()
                run_stop_history_scenario(reopen)
            end)
        end
        local stop_boundary = "suppresses provider generation when Stop commits while the next prompt is built"
        if env.get("WIPPY_TEST_REQUIRE_CASES") == "1" or framework_stops_before_generation() then
            test.it("honors Stop during prompt construction even after retirement is pending", function()
                run_scenario({retire_at = "prompt", stop_after_retire = true, reopen = true})
            end)
            test.it(stop_boundary, function()
                run_scenario({ hold_prompt = true, reopen = true })
            end)
        else
            test.it_skip("Stop after pending retirement (requires Framework step stop_check)", function() end)
            test.it_skip(stop_boundary .. " (requires Framework step stop_check)", function() end)
        end
        test.it("settles every call when a malformed control result precedes its peers", function()
            run_scenario({ malformed = "boolean" })
        end)
        test.it("keeps committed handoff effects when a later control result is malformed", function()
            run_scenario({ malformed = "artifacts", reopen = true })
        end)
        test.it("confirms failed session exit before deleting its database rows", function()
            -- go-lua drops closure writes to outer locals after a caught error; table fields keep them.
            local observed = {}
            local ok, err = pcall(function()
                run_scenario({ fail_after_open = true, observe_cleanup = function(exit, session_id)
                    observed.exit = exit
                    observed.row_present = session_repo.get(session_id, security.actor():id()) ~= nil
                end })
            end)
            test.is_false(ok)
            test.contains(tostring(err), "Injected handoff fixture failure")
            test.not_nil(observed.exit, "Failed session termination must be confirmed before database cleanup")
            test.not_nil(observed.exit.from)
            test.is_true(observed.row_present)
        end)
    end)
end

local function define_benchmark()
    test.describe("Session handoff benchmark", function()
        if not env.get("WIPPY_BENCH_SAMPLES") then
            test.it_skip("requires benchmark settings", function() end)
            return
        end
        test.it("measures complete handoff batches with persisted outcomes", function()
            wait_for_boot.run()
            local warmup = tonumber((env.get("WIPPY_BENCH_WARMUP"))) or 100
            local samples = tonumber((env.get("WIPPY_BENCH_SAMPLES"))) or 100
            local size = tonumber((env.get("WIPPY_BENCH_SIZE"))) or 1
            local measured = {}
            for iteration = 1, warmup + samples do
                local start = time.now()
                for _ = 1, size do run_scenario() end
                local elapsed = time.now():sub(start):microseconds() / 1000
                if iteration > warmup then measured[#measured + 1] = elapsed end
            end
            local memory
            local memory_operations = tonumber((env.get("WIPPY_BENCH_MEMORY_OPERATIONS")))
            if memory_operations then
                local memory_err
                memory, memory_err = benchmark_report.measure_memory(function()
                    for _ = 1, memory_operations do run_scenario() end
                end, memory_operations)
                test.not_nil(memory, tostring(memory_err))
            end
            local report, report_err = benchmark_report.report({ name = "session_handoff", size = size,
                operations_per_sample = size, samples_ms = measured, memory = memory })
            test.not_nil(report, tostring(report_err))
        end)
    end)
end

return { run = test.run_cases(define_tests), benchmark = test.run_cases(define_benchmark) }
