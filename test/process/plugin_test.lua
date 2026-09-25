local test = require("test")
local plugin = require("plugin")
local session = require("session")
local uuid = require("uuid")
local json = require("json")
local security = require("security")
local consts = require("consts")
local context_repo = require("context_repo")
local session_repo = require("session_repo")
local message_repo = require("message_repo")
local wait_for_boot = require("wait_for_boot")

local function plugin_message(topic, data)
    return {
        topic = function() return topic end,
        payload = function() return { data = function() return data end } end
    }
end

local function run_plugin_lifecycle(actor, session_id, hub_pid, messages, exit_result, options)
    options = options or {}
    local session_pid = options.session_pid or "plugin-lifecycle-session"
    local sent = {}
    local scheduled = {}
    local spawned_init = nil :: table?
    local cancelled = 0
    local terminated = 0

    mock("process.with_context", function()
        return { spawn_linked_monitored = function(_self, _id, _host, init)
            spawned_init = init
            return session_pid, nil
        end }
    end)
    mock("process.send", function(pid, topic, payload)
        table.insert(sent, { pid = pid, topic = topic, payload = payload })
        return true, nil
    end)
    mock("process.cancel", function() cancelled = cancelled + 1; return true, nil end)
    mock("process.terminate", function() terminated = terminated + 1; return true, nil end)
    mock("coroutine.spawn", function(fn) table.insert(scheduled, fn) end)
    local inbox = process.inbox()
    local events = process.events()
    local inputs = {}
    if options.open ~= false then
        table.insert(inputs, { topic = consts.PLUGIN_TOPICS.OPEN,
            data = { session_id = session_id } })
    end
    for _, input in ipairs(messages or {}) do table.insert(inputs, input) end
    local step = 0
    mock("channel.select", function()
        step = step + 1
        if step <= #inputs then
            local input = inputs[step]
            return { ok = true, channel = inbox,
                value = plugin_message(input.topic, input.data) }
        end
        local event = { kind = process.event.EXIT, from = session_pid }
        event.result = exit_result
        return { ok = true, channel = events, value = event }
    end)

    local result, run_err = plugin.run({ user_id = actor:id(), user_hub_pid = hub_pid })
    return {
        result = result, error = run_err, sent = sent, scheduled = scheduled,
        spawned_init = spawned_init, cancelled = cancelled, terminated = terminated,
        session_pid = session_pid
    }
end

local function create_session_fixture(actor, title, status)
    wait_for_boot.run()
    local session_id = uuid.v7()
    local context_id = uuid.v7()
    context_repo.create(context_id, "primary", "{}")
    session_repo.create(session_id, actor:id(), context_id, title, "test")
    if status then session_repo.update_session_meta(session_id, { status = status }) end
    return session_id, context_id
end

local function cleanup_session_fixture(session_id, context_id)
    session_repo.delete(session_id)
    context_repo.delete(context_id)
end

local function add_pending_call(session_id)
    local assistant_id = uuid.v7()
    local call_id = uuid.v7()
    local created, err = message_repo.create_batch(session_id, {
        { message_id = assistant_id, type = consts.MSG_TYPE.ASSISTANT, data = "", metadata = {} },
        { message_id = call_id, type = consts.MSG_TYPE.FUNCTION, data = "{}", metadata = {
            call_id = "lookup", function_name = "lookup", status = consts.FUNC_STATUS.PENDING
        } }
    })
    test.is_nil(err)
    test.is_true(created)
    return call_id
end

local function upstream_error(run, hub_pid)
    for _, sent in ipairs(run.sent) do
        if sent.pid == hub_pid and sent.payload.type == consts.UPSTREAM_TYPES.ERROR then
            return sent.payload
        end
    end
    return nil
end

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
                (nil :: string),
                {
                    session_id = "sess-1",
                    user_id = "user-1",
                    status = "idle",
                    reason = "disabled",
                },
                function(_fn)
                    spawn_count = spawn_count + 1
                end,
                function(_name, ...)
                    return nil, nil
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
                function(_name, ...)
                    return nil, nil
                end
            )

            test.is_false(scheduled)
            test.eq(spawn_count, 0)
        end)
    end)
    describe("plugin exit and recovery", function()
        it("sends the initial idle update before receipt and running", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Startup order")
            local hub_pid = "startup-order-hub"
            local sent = {}
            local inbox = { case_receive = function(self) return self end }
            local events = { case_receive = function(self) return self end }
            local bus_done = {
                case_receive = function(self) return self end,
                send = function() return true end,
                receive = function() return nil end
            }
            local original_inbox = process.inbox
            local original_events = process.events
            local original_send = process.send
            local original_channel_new = channel.new
            local original_channel_select = channel.select
            local original_spawn = coroutine.spawn
            local selection = 0

            mock("process.inbox", function() return inbox end)
            mock("process.events", function() return events end)
            mock("channel.new", function(capacity)
                if capacity == nil then return bus_done end
                return original_channel_new(capacity)
            end)
            mock("coroutine.spawn", function(_fn) end)
            mock("process.send", function(pid, topic, payload)
                if pid == hub_pid then table.insert(sent, { topic = topic, payload = payload }) end
                return true, nil
            end)
            mock("channel.select", function()
                selection = selection + 1
                if selection == 1 then
                    return { ok = true, channel = inbox, value = plugin_message(consts.TOPICS.MESSAGE, {
                        data = { text = "first" }, request_id = "first"
                    }) }
                end
                return { ok = true, channel = events, value = { kind = process.event.CANCEL } }
            end)

            local ok, result = pcall(session.run, { session_id = session_id, user_id = actor:id(),
                parent_pid = hub_pid, create = true })
            mock("process.inbox", original_inbox)
            mock("process.events", original_events)
            mock("process.send", original_send)
            mock("channel.new", original_channel_new)
            mock("channel.select", original_channel_select)
            mock("coroutine.spawn", original_spawn)

            test.is_true(ok, tostring(result))
            test.eq(result.status, "shutdown")
            local session_topic = consts.TOPIC_PREFIXES.SESSION .. session_id
            local order = {}
            for _, event in ipairs(sent) do
                if event.topic == session_topic and event.payload.status then
                    table.insert(order, event.payload.status)
                elseif event.payload.type == consts.UPSTREAM_TYPES.RECEIVED then
                    table.insert(order, "received")
                end
            end
            test.eq(table.concat(order, ","), "idle,received,running")
            cleanup_session_fixture(session_id, context_id)
        end)

        it("forwards the first input after creating a new session", function()
            local actor = security.actor()
            local first_id, first_context = create_session_fixture(actor, "Initial input")
            local initial = run_plugin_lifecycle(actor, first_id, nil, {
                { topic = consts.PLUGIN_TOPICS.MESSAGE,
                    data = { session_id = first_id, data = { text = "first" }, request_id = "first" } }
            }, { status = "shutdown", intentional_exit = true }, { open = false })
            test.is_nil(initial.error)
            test.is_nil(initial.spawned_init.initial_message)
            local first_message = nil :: any
            for _, sent in ipairs(initial.sent) do
                if sent.pid == initial.session_pid and sent.topic == consts.TOPICS.MESSAGE then
                    first_message = sent.payload
                end
            end
            test.not_nil(first_message)
            test.eq(first_message.data.text, "first")
            test.eq(first_message.request_id, "first")

            local second_id, second_context = create_session_fixture(actor, "Later input")
            local forwarded = run_plugin_lifecycle(actor, second_id, nil, {
                { topic = consts.PLUGIN_TOPICS.MESSAGE,
                    data = { session_id = second_id, data = { text = "second" }, request_id = "second" } }
            }, { status = "shutdown", intentional_exit = true })
            local message = nil :: any
            for _, sent in ipairs(forwarded.sent) do
                if sent.topic == consts.TOPICS.MESSAGE then message = sent.payload end
            end
            test.not_nil(message)
            test.eq(message.data.text, "second")
            test.eq(message.request_id, "second")
            cleanup_session_fixture(first_id, first_context)
            cleanup_session_fixture(second_id, second_context)
        end)

        it("surfaces cancellation as failure and permits restart", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Cancelled", "running")
            local stop_messages = {
                { topic = consts.TOPICS.STOP_ESCALATION, data = { session_id = session_id,
                    from_pid = "plugin-lifecycle-session", stop_request_id = "cancel-stop" } },
                { topic = consts.TOPICS.STOP_ESCALATION, data = { session_id = session_id,
                    from_pid = "plugin-lifecycle-session", stop_request_id = "cancel-stop" } }
            }
            local run = run_plugin_lifecycle(actor, session_id, "test-hub", stop_messages,
                { error = "cancelled" })
            test.is_nil(run.error)
            test.eq(session_repo.get(session_id, actor:id()).status, consts.STATUS.FAILED)
            test.eq(run.cancelled, 0)
            test.not_nil(upstream_error(run, "test-hub"))

            local restarted = run_plugin_lifecycle(actor, session_id, "test-hub", {},
                { status = "shutdown", intentional_exit = true })
            test.is_nil(restarted.error)
            test.not_nil(restarted.spawned_init)
            cleanup_session_fixture(session_id, context_id)
        end)

        it("uses the persisted status column when resetting an inactive session", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Persisted status", "running")
            local run = run_plugin_lifecycle(actor, session_id, nil, {}, { status = "shutdown", intentional_exit = true })
            test.is_nil(run.error)
            test.not_nil(run.spawned_init.recovery_notice)
            test.eq(session_repo.get(session_id, actor:id()).status, consts.STATUS.IDLE)
            cleanup_session_fixture(session_id, context_id)
        end)

        it("escalates repeated stops only when their deadlines fire", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Escalation", "running")
            local stop_messages = {}
            for _ = 1, 3 do
                table.insert(stop_messages, { topic = consts.TOPICS.STOP_ESCALATION,
                    data = { session_id = session_id, from_pid = "plugin-lifecycle-session",
                        stop_request_id = "blocked-stop" } })
            end
            table.insert(stop_messages, { topic = consts.TOPICS.STOP_DEADLINE,
                data = { session_id = session_id, session_pid = "plugin-lifecycle-session",
                    stop_request_id = "blocked-stop", level = 1 } })
            table.insert(stop_messages, { topic = consts.TOPICS.STOP_DEADLINE,
                data = { session_id = session_id, session_pid = "plugin-lifecycle-session",
                    stop_request_id = "blocked-stop", level = 2 } })
            local run = run_plugin_lifecycle(actor, session_id, nil, stop_messages,
                { error = "terminated" })
            test.is_nil(run.error)
            test.eq(run.cancelled, 1)
            test.eq(run.terminated, 1)
            test.eq(session_repo.get(session_id, actor:id()).status, consts.STATUS.FAILED)
            cleanup_session_fixture(session_id, context_id)
        end)

        it("invalidates resolved and superseded stop deadlines by request identity", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Stop identity", "running")
            local stop_messages = {
                { topic = consts.TOPICS.STOP_ESCALATION, data = { session_id = session_id,
                    from_pid = "plugin-lifecycle-session", stop_request_id = "stop-1" } },
                { topic = consts.TOPICS.STOP_ESCALATION, data = { session_id = session_id,
                    from_pid = "plugin-lifecycle-session", stop_request_id = "stop-2" } },
                { topic = consts.TOPICS.STOP_RESOLVED, data = { session_id = session_id,
                    from_pid = "plugin-lifecycle-session", stop_request_id = "stop-2" } },
                { topic = consts.TOPICS.STOP_DEADLINE, data = { session_id = session_id,
                    session_pid = "plugin-lifecycle-session", stop_request_id = "stop-1", level = 1 } }
            }
            local run = run_plugin_lifecycle(actor, session_id, nil, stop_messages,
                { status = "shutdown", intentional_exit = true })
            test.is_nil(run.error)
            test.eq(run.cancelled, 0)
            test.eq(run.terminated, 0)
            cleanup_session_fixture(session_id, context_id)
        end)

        it("emits an error only for failed exits", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Failed exit", "running")
            local run = run_plugin_lifecycle(actor, session_id, "test-hub", {},
                { error = "tool crashed" })
            test.is_nil(run.error)
            local update = upstream_error(run, "test-hub")
            test.not_nil(update)
            test.eq(update.session_id, session_id)
            test.eq(update.code, "recovery_incomplete")
            test.not_nil(update.message)
            test.eq(session_repo.get(session_id, actor:id()).status, consts.STATUS.FAILED)
            cleanup_session_fixture(session_id, context_id)
        end)

        it("repairs calls on abnormal exit but skips a clean shutdown", function()
            local actor = security.actor()
            local clean_id, clean_context = create_session_fixture(actor, "Clean exit", "running")
            local clean_call = add_pending_call(clean_id)
            run_plugin_lifecycle(actor, clean_id, nil, {}, { status = "shutdown", intentional_exit = true })
            test.eq(message_repo.get(clean_call).metadata.status, consts.FUNC_STATUS.PENDING)

            local crashed_id, crashed_context = create_session_fixture(actor, "Abnormal exit", "running")
            local crashed_call = add_pending_call(crashed_id)
            run_plugin_lifecycle(actor, crashed_id, "test-hub", {}, nil)
            test.eq(message_repo.get(crashed_call).metadata.status, consts.FUNC_STATUS.ERROR)
            cleanup_session_fixture(clean_id, clean_context)
            cleanup_session_fixture(crashed_id, crashed_context)
        end)

        it("repairs pending calls before reopening without starting agent work", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Startup recovery", "running")
            local call_id = add_pending_call(session_id)
            local before = message_repo.count_by_session(session_id)
            local cancel_events = channel.new(1)
            cancel_events:send({ kind = process.event.CANCEL })
            mock("process.events", function() return cancel_events end)
            local result = session.run({ session_id = session_id, user_id = actor:id() })
            test.eq(result.status, "shutdown")
            test.is_true(result.interrupted)
            test.eq(message_repo.count_by_session(session_id), before)
            test.eq(message_repo.get(call_id).metadata.status, consts.FUNC_STATUS.ERROR)
            cleanup_session_fixture(session_id, context_id)
        end)

        it("surfaces a resultless crash and keeps the session recoverable", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Crash", "running")
            local run = run_plugin_lifecycle(actor, session_id, "test-hub", {}, nil)
            test.is_nil(run.error)
            test.eq(session_repo.get(session_id, actor:id()).status, consts.STATUS.FAILED)
            local error_update = upstream_error(run, "test-hub")
            test.not_nil(error_update)
            test.eq(error_update.session_id, session_id)
            local restarted = run_plugin_lifecycle(actor, session_id, nil, {
                { topic = consts.PLUGIN_TOPICS.MESSAGE,
                    data = { session_id = session_id, data = { text = "continue" },
                        request_id = "next-message" } }
            }, { status = "shutdown", intentional_exit = true }, { open = false })
            test.is_nil(restarted.error)
            test.not_nil(restarted.spawned_init.recovery_notice)
            test.is_nil(restarted.spawned_init.initial_message)
            local forwarded = nil :: any
            for _, sent in ipairs(restarted.sent) do
                if sent.pid == restarted.session_pid and sent.topic == consts.TOPICS.MESSAGE then
                    forwarded = sent.payload
                end
            end
            test.not_nil(forwarded)
            test.eq(forwarded.data.text, "continue")
            cleanup_session_fixture(session_id, context_id)
        end)

        it("leaves an intentional finish idle without an error", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Intentional finish", "running")
            local run = run_plugin_lifecycle(actor, session_id, "test-hub", {},
                { status = "shutdown", intentional_exit = true })
            test.is_nil(run.error)
            test.eq(session_repo.get(session_id, actor:id()).status, consts.STATUS.IDLE)
            test.is_nil(upstream_error(run, "test-hub"))
            cleanup_session_fixture(session_id, context_id)
        end)

    end)
    describe("plugin on_session_end hook", function()
        it("schedules the hook with provenance params when configured", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "End hook")
            local run = run_plugin_lifecycle(actor, session_id, nil, {},
                { status = "shutdown", intentional_exit = true })

            test.is_nil(run.error)
            test.eq(#run.scheduled, 1)
            local hook_task = run.scheduled[1]
            if type(hook_task) ~= "function" then error("session end hook was not scheduled") end
            hook_task()
            local history = message_repo.list_by_session(session_id, 10)
            local hook_payload = nil :: any
            for _, message in ipairs(history.messages) do
                if message.metadata and message.metadata.test_end_hook then
                    hook_payload = json.decode(message.data :: string)
                end
            end
            test.not_nil(hook_payload)
            test.eq(hook_payload.session_id, session_id)
            test.eq(hook_payload.user_id, actor:id())
            test.eq(hook_payload.status, consts.STATUS.IDLE)
            test.eq(hook_payload.reason, "completed")
            cleanup_session_fixture(session_id, context_id)
        end)

        it("sends the final status before the closed event", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Closed event")
            local run = run_plugin_lifecycle(actor, session_id, "test-hub", {},
                { status = "shutdown", intentional_exit = true })
            test.is_nil(run.error)
            local status_index = nil
            local closed_index = nil
            for index, sent in ipairs(run.sent) do
                if sent.pid == "test-hub" and sent.topic == consts.TOPIC_PREFIXES.SESSION .. session_id then
                    status_index = index
                    test.eq(sent.payload.status, consts.STATUS.IDLE)
                elseif sent.pid == "test-hub" and sent.topic == consts.TOPICS.SESSION_CLOSED then
                    closed_index = index
                end
            end
            test.not_nil(status_index)
            test.not_nil(closed_index)
            test.lt(status_index, closed_index)
            cleanup_session_fixture(session_id, context_id)
        end)

        it("repairs pending calls before reporting an unintentional exit", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Failed hook exit", "running")
            local call_id = add_pending_call(session_id)
            local run = run_plugin_lifecycle(actor, session_id, nil, {},
                nil)
            test.is_nil(run.error)
            test.eq(message_repo.get(call_id).metadata.status, consts.FUNC_STATUS.ERROR)
            test.eq(session_repo.get(session_id, actor:id()).status, consts.STATUS.FAILED)
            cleanup_session_fixture(session_id, context_id)
        end)
    end)
end

return test.run_cases(define_tests)
