local test = require("test")
local plugin = require("plugin")
local session = require("session")
local message_handlers = require("message_handlers")
local writer = require("writer")
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
    local trace = {}
    local scheduled = {}
    local spawned_init = nil :: table?
    local cancelled = 0
    local terminated = 0
    local inputs = {}
    if options.open ~= false then
        table.insert(inputs, { topic = consts.PLUGIN_TOPICS.OPEN,
            data = options.open_data or { session_id = session_id } })
    end
    for _, input in ipairs(messages or {}) do table.insert(inputs, input) end
    mock("process.with_context", function()
        return { spawn_linked_monitored = function(_self, _id, _host, init)
            spawned_init = init
            if options.confirm_start ~= false then
                table.insert(inputs, { topic = consts.TOPICS.SESSION_OPENED,
                    data = { session_id = init.session_id, from_pid = session_pid } })
            end
            return session_pid, nil
        end }
    end)
    mock("process.send", function(pid, topic, payload)
        local sent_item = { pid = pid, topic = topic, payload = payload }
        table.insert(sent, sent_item)
        table.insert(trace, { kind = "send", item = sent_item })
        return true, nil
    end)
    mock("process.cancel", function() cancelled = cancelled + 1; return true, nil end)
    mock("process.terminate", function() terminated = terminated + 1; return true, nil end)
    mock("coroutine.spawn", function(fn) table.insert(scheduled, fn) end)
    local inbox = process.inbox()
    local events = process.events()
    local step = 0
    mock("channel.select", function()
        step = step + 1
        if step <= #inputs then
            local input = inputs[step]
            table.insert(trace, { kind = "input", topic = input.topic })
            return { ok = true, channel = inbox,
                value = plugin_message(input.topic, input.data) }
        end
        local event = { kind = options.cancel_plugin and process.event.CANCEL or process.event.EXIT,
            from = session_pid }
        event.result = exit_result
        return { ok = true, channel = events, value = event }
    end)

    local result, run_err = plugin.run({ user_id = actor:id(), user_hub_pid = hub_pid })
    restore_mock("channel.select")
    restore_mock("coroutine.spawn")
    restore_mock("process.terminate")
    restore_mock("process.cancel")
    restore_mock("process.send")
    restore_mock("process.with_context")

    return {
        result = result, error = run_err, sent = sent, trace = trace, scheduled = scheduled,
        spawned_init = spawned_init, cancelled = cancelled, terminated = terminated,
        session_pid = session_pid
    }
end

local function run_start_through_session(actor, session_id, registry, session_pid, session_behavior)
    local sent = {}
    local scheduled = {}
    local spawned_init = nil :: table?
    local session_result = nil :: any
    local plugin_step = 0
    local session_step = 0
    local in_session = false
    local plugin_inbox = { case_receive = function(self) return self end }
    local plugin_events = { case_receive = function(self) return self end }
    local session_inbox = { case_receive = function(self) return self end }
    local session_events = { case_receive = function(self) return self end }
    local bus_done = {
        case_receive = function(self) return self end,
        send = function() return true end,
        receive = function() return nil end
    }

    local original_channel_new = channel.new

    mock("process.with_context", function()
        return { spawn_linked_monitored = function(_self, _id, _host, init)
            spawned_init = init
            in_session = true
            local ok, result = pcall(session.run, init)
            in_session = false
            session_result = ok and result or { error = tostring(result) }
            return session_pid, nil
        end }
    end)
    mock("process.send", function(pid, topic, payload)
        table.insert(sent, { pid = pid, topic = topic, payload = payload })
        return true, nil
    end)
    mock("process.registry", {
        register = function(name)
            test.eq(name, "session." .. session_id)
            if registry.owner then return nil, registry.duplicate_error end
            registry.owner = session_pid
            return true, nil
        end
    })
    mock("process.inbox", function() return in_session and session_inbox or plugin_inbox end)
    mock("process.events", function() return in_session and session_events or plugin_events end)
    mock("channel.new", function(capacity)
        if capacity == nil then return bus_done end
        return original_channel_new(capacity)
    end)
    mock("coroutine.spawn", function(fn)
        if not in_session then table.insert(scheduled, fn) end
    end)
    mock("channel.select", function()
        if in_session then
            session_step = session_step + 1
            if session_behavior == "finish" then
                if session_step == 1 then
                    return { ok = true, channel = session_inbox,
                        value = plugin_message(consts.TOPICS.FINISH_AND_EXIT, {}) }
                end
                return { ok = true, channel = bus_done, value = { error = nil } }
            end
            return { ok = true, channel = session_events, value = { kind = process.event.CANCEL } }
        end

        plugin_step = plugin_step + 1
        if plugin_step == 1 then
            return { ok = true, channel = plugin_inbox, value = plugin_message(consts.PLUGIN_TOPICS.OPEN, {
                session_id = session_id, conn_pid = "start-caller", request_id = "start-request"
            }) }
        end
        return { ok = true, channel = plugin_events, value = {
            kind = process.event.EXIT, from = session_pid, result = session_result
        } }
    end)

    local result, run_err = plugin.run({ user_id = actor:id(), user_hub_pid = "start-hub" })

    restore_mock("channel.select")
    restore_mock("coroutine.spawn")
    restore_mock("channel.new")
    restore_mock("process.events")
    restore_mock("process.inbox")
    restore_mock("process.registry")
    restore_mock("process.send")
    restore_mock("process.with_context")

    return {
        result = result, error = run_err, sent = sent, scheduled = scheduled,
        spawned_init = spawned_init, session_result = session_result
    }
end

local function run_live_owner_through_plugin(actor, session_id, owner_pid)
    local sent = {}
    local plugin_pid = "live-owner-plugin"
    local current_pid = plugin_pid
    local plugin_step = 0
    local owner_inbox = {}
    local plugin_inbox = {}
    local owner_result = nil :: any
    local owner_process = nil :: any
    local owner_registry = {
        owner = nil :: string?,
        duplicate_error = setmetatable({ kind = function() return "AlreadyExists" end }, {
            __tostring = function() return "name already registered" end
        })
    }
    local original_channel_new = channel.new
    local plugin_inbox_channel = { case_receive = function(self) return self end }
    local plugin_events_channel = { case_receive = function(self) return self end }
    local owner_inbox_channel = { case_receive = function(self) return self end }
    local owner_events_channel = { case_receive = function(self) return self end }
    local bus_done = {
        case_receive = function(self) return self end,
        send = function() return true end,
        receive = function() return nil end
    }

    mock("process.pid", function() return current_pid end)
    mock("process.inbox", function()
        return current_pid == owner_pid and owner_inbox_channel or plugin_inbox_channel
    end)
    mock("process.events", function()
        return current_pid == owner_pid and owner_events_channel or plugin_events_channel
    end)
    mock("process.registry", {
        register = function(name)
            test.eq(name, "session." .. session_id)
            if owner_registry.owner then
                return nil, setmetatable({ kind = function() return "AlreadyExists" end }, {
                    __tostring = function() return "name already registered" end
                })
            end
            owner_registry.owner = owner_pid
            return true, nil
        end
    })
    mock("process.send", function(pid, topic, payload)
        table.insert(sent, { pid = pid, topic = topic, payload = payload })
        if pid == plugin_pid and topic == consts.TOPICS.SESSION_OPENED then
            table.insert(plugin_inbox, plugin_message(topic, payload))
        elseif pid == owner_pid then
            table.insert(owner_inbox, plugin_message(topic, payload))
        end
        return true, nil
    end)
    mock("process.with_context", function()
        return { spawn_linked_monitored = function(_self, _id, _host, init)
            owner_process = {
                coroutine = coroutine.create(function()
                    current_pid = owner_pid
                    local ok, result = pcall(session.run, init)
                    owner_result = ok and result or { error = tostring(result) }
                    if owner_registry.owner == owner_pid then owner_registry.owner = nil end
                    current_pid = plugin_pid
                end)
            }
            current_pid = owner_pid
            local ok, resume_err = coroutine.resume(owner_process.coroutine)
            current_pid = plugin_pid
            if not ok then error(resume_err) end
            return owner_pid, nil
        end }
    end)
    mock("channel.new", function(capacity)
        if capacity == nil then return bus_done end
        return original_channel_new(capacity)
    end)
    mock("coroutine.spawn", function() end)
    mock("channel.select", function()
        if current_pid == owner_pid then
            local value = table.remove(owner_inbox, 1)
            if value then
                return { ok = true, channel = owner_inbox_channel, value = value }
            end
            return coroutine.yield()
        end

        plugin_step = plugin_step + 1
        if plugin_step == 1 then
            return { ok = true, channel = plugin_inbox_channel,
                value = plugin_message(consts.PLUGIN_TOPICS.OPEN, {
                    session_id = session_id, conn_pid = "owner-caller", request_id = "owner-open"
                }) }
        elseif #plugin_inbox > 0 then
            return { ok = true, channel = plugin_inbox_channel, value = table.remove(plugin_inbox, 1) }
        elseif plugin_step == 3 then
            return { ok = true, channel = plugin_inbox_channel,
                value = plugin_message(consts.PLUGIN_TOPICS.MESSAGE, {
                    session_id = session_id, conn_pid = "owner-message-caller",
                    data = { text = "owner keeps working" }, request_id = "owner-message"
                }) }
        end

        if owner_process and coroutine.status(owner_process.coroutine) == "suspended" and #owner_inbox > 0 then
            local input = table.remove(owner_inbox, 1)
            current_pid = owner_pid
            local ok, resume_err = coroutine.resume(owner_process.coroutine, {
                ok = true, channel = owner_inbox_channel, value = input
            })
            current_pid = plugin_pid
            if not ok then error(resume_err) end
        end
        return { ok = true, channel = plugin_events_channel, value = { kind = process.event.CANCEL } }
    end)

    local result, run_err = plugin.run({ user_id = actor:id(), user_hub_pid = "owner-hub" })

    local function exit_owner()
        current_pid = owner_pid
        local ok, resume_err = coroutine.resume(owner_process.coroutine, {
            ok = true, channel = owner_events_channel, value = { kind = process.event.CANCEL }
        })
        current_pid = plugin_pid
        if not ok then error(resume_err) end
    end

    local function restore()
        restore_mock("channel.select")
        restore_mock("coroutine.spawn")
        restore_mock("channel.new")
        restore_mock("process.with_context")
        restore_mock("process.send")
        restore_mock("process.registry")
        restore_mock("process.events")
        restore_mock("process.inbox")
        restore_mock("process.pid")
    end

    return {
        result = result, error = run_err, sent = sent, registry = owner_registry,
        owner_process = owner_process, owner_result = function() return owner_result end,
        exit_owner = exit_owner, restore = restore
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
        it("answers every request queued before a refused start and never forwards to that pid", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Refused start", consts.STATUS.IDLE)
            local loser_pid = "refused-window-loser"
            local run = run_plugin_lifecycle(actor, session_id, "refused-window-hub", {
                { topic = consts.PLUGIN_TOPICS.OPEN, data = { session_id = session_id,
                    conn_pid = "second-open-caller", request_id = "second-open" } },
                { topic = consts.PLUGIN_TOPICS.MESSAGE, data = { session_id = session_id,
                    conn_pid = "message-caller", data = { text = "waiting" }, request_id = "waiting-message" } }
            }, { status = "refused", error = "duplicate session" }, {
                session_pid = loser_pid,
                confirm_start = false,
                open_data = { session_id = session_id, conn_pid = "first-open-caller", request_id = "first-open" }
            })

            local errors = {}
            local forwarded = {}
            for _, sent in ipairs(run.sent) do
                if sent.topic == consts.TOPICS.ERROR then
                    errors[sent.payload.request_id] = sent
                elseif sent.pid == loser_pid then
                    table.insert(forwarded, sent)
                end
            end
            test.not_nil(errors["first-open"])
            test.not_nil(errors["second-open"])
            test.not_nil(errors["waiting-message"])
            test.eq(errors["first-open"].pid, "first-open-caller")
            test.eq(errors["second-open"].pid, "second-open-caller")
            test.eq(errors["waiting-message"].pid, "message-caller")
            test.eq(#forwarded, 0)
            cleanup_session_fixture(session_id, context_id)
        end)

        it("routes requests queued during startup in arrival order after confirmation", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Queued start", consts.STATUS.IDLE)
            local session_pid = "queued-start-session"
            local run = run_plugin_lifecycle(actor, session_id, "queued-start-hub", {
                { topic = consts.PLUGIN_TOPICS.OPEN, data = { session_id = session_id,
                    conn_pid = "second-open-caller", request_id = "second-open" } },
                { topic = consts.PLUGIN_TOPICS.MESSAGE, data = { session_id = session_id,
                    conn_pid = "first-caller", data = { text = "first" }, request_id = "first-message" } },
                { topic = consts.PLUGIN_TOPICS.MESSAGE, data = { session_id = session_id,
                    conn_pid = "second-caller", data = { text = "second" }, request_id = "second-message" } },
                { topic = consts.TOPICS.SESSION_OPENED, data = { session_id = session_id, from_pid = session_pid } }
            }, { status = "shutdown", intentional_exit = true }, {
                session_pid = session_pid, confirm_start = false
            })

            local routed = {}
            for _, sent in ipairs(run.sent) do
                if sent.pid == session_pid and sent.topic == consts.TOPICS.MESSAGE then
                    table.insert(routed, sent.payload.data.text)
                end
            end
            test.eq(#routed, 2)
            test.eq(routed[1], "first")
            test.eq(routed[2], "second")
            local second_open_ack = nil :: any
            for _, sent in ipairs(run.sent) do
                if sent.pid == "queued-start-hub" and sent.topic == consts.TOPICS.SESSION_OPENED
                    and sent.payload.request_id == "second-open" then
                    second_open_ack = sent
                end
            end
            test.not_nil(second_open_ack)
            local confirmation_index = nil
            local first_route_index = nil
            for index, event in ipairs(run.trace) do
                if event.kind == "input" and event.topic == consts.TOPICS.SESSION_OPENED then
                    confirmation_index = index
                elseif event.kind == "send" and event.item.pid == session_pid
                    and event.item.topic == consts.TOPICS.MESSAGE and not first_route_index then
                    first_route_index = index
                end
            end
            test.not_nil(confirmation_index)
            test.not_nil(first_route_index)
            test.is_true((first_route_index or 0) > (confirmation_index or 0))
            cleanup_session_fixture(session_id, context_id)
        end)

        it("routes input to the active session process", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Single process", consts.STATUS.IDLE)
            local owner_pid = "single-session-owner"
            local owner = run_plugin_lifecycle(actor, session_id, "owner-hub", {
                { topic = consts.PLUGIN_TOPICS.MESSAGE, data = { session_id = session_id,
                    data = { text = "owner input" }, request_id = "owner-input" } }
            }, nil, { session_pid = owner_pid, cancel_plugin = true })
            test.is_nil(owner.error)
            local owner_input = nil :: any
            for _, sent in ipairs(owner.sent) do
                if sent.pid == owner_pid and sent.topic == consts.TOPICS.MESSAGE then
                    owner_input = sent.payload
                end
            end
            test.not_nil(owner_input)
            test.eq(owner_input.data.text, "owner input")
            cleanup_session_fixture(session_id, context_id)
        end)

        it("refuses a duplicate real start while its owner runs and restarts after owner exit", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Single process", consts.STATUS.IDLE)
            local owner_pid = "live-session-owner"
            local live_owner = run_live_owner_through_plugin(actor, session_id, owner_pid)
            local status_before_loser = session_repo.get(session_id, actor:id()).status
            local owner_registered_before_loser = live_owner.registry.owner
            local owner_state_before_loser = coroutine.status(live_owner.owner_process.coroutine)
            local loser = run_start_through_session(actor, session_id, live_owner.registry,
                "single-session-loser", "cancel")
            local loser_status = loser.session_result and loser.session_result.status
            local owner_registered_after_loser = live_owner.registry.owner
            local owner_state_after_loser = coroutine.status(live_owner.owner_process.coroutine)
            local status_after_loser = session_repo.get(session_id, actor:id()).status

            local start_error = nil :: any
            local closed_event = false
            local opened_event = false
            local owner_touched = false
            for _, sent in ipairs(loser.sent) do
                if sent.pid == "start-caller" and sent.topic == consts.TOPICS.ERROR then
                    start_error = sent.payload
                elseif sent.pid == "start-hub" and sent.topic == consts.TOPICS.SESSION_OPENED then
                    opened_event = true
                elseif sent.pid == "start-hub" and sent.topic == consts.TOPICS.SESSION_CLOSED then
                    closed_event = true
                elseif sent.pid == owner_pid then
                    owner_touched = true
                end
            end
            local owner_received_input = false
            for _, sent in ipairs(live_owner.sent) do
                if sent.pid == owner_pid and sent.topic == consts.TOPICS.MESSAGE
                    and sent.payload.data.text == "owner keeps working" then
                    owner_received_input = true
                end
            end
            local owner_exit_ok = false
            if live_owner.owner_process and coroutine.status(live_owner.owner_process.coroutine) == "suspended" then
                owner_exit_ok = pcall(live_owner.exit_owner)
            end
            local owner_result = live_owner.owner_result()
            local owner_registry_after_exit = live_owner.registry.owner

            local restarted = run_start_through_session(actor, session_id, live_owner.registry,
                "single-session-restart", "finish")
            local restarted_status = restarted.session_result and restarted.session_result.status
            local restarted_intentional = restarted.session_result
                and restarted.session_result.intentional_exit
            live_owner.registry.owner = nil
            live_owner.restore()
            cleanup_session_fixture(session_id, context_id)

            test.eq(owner_registered_before_loser, owner_pid)
            test.eq(owner_state_before_loser, "suspended")
            test.eq(status_before_loser, consts.STATUS.RUNNING)
            test.eq(loser_status, "refused")
            test.eq(owner_registered_after_loser, owner_pid)
            test.eq(owner_state_after_loser, "suspended")
            test.eq(status_after_loser, status_before_loser)
            test.not_nil(start_error)
            test.eq(start_error.error, consts.ERROR_CODES.SESSION_SPAWN)
            test.eq(start_error.request_id, "start-request")
            test.contains(start_error.message, "already registered")
            test.is_false(opened_event)
            test.is_false(closed_event)
            test.is_false(owner_touched)
            test.eq(#loser.scheduled, 0)
            test.is_true(owner_received_input)
            test.is_true(owner_exit_ok)
            test.eq((owner_result or {}).status, "shutdown")
            test.is_true((owner_result or {}).interrupted)
            test.is_nil(owner_registry_after_exit)
            test.is_nil(restarted.error)
            test.eq(restarted_status, "shutdown")
            test.is_true(restarted_intentional)
        end)

        it("reports non-duplicate registry failures with their actual error", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Registry error", consts.STATUS.IDLE)
            for _, failure in ipairs({
                { kind = "Internal", message = "registry unavailable" },
                { kind = "AlreadyExists", message = "pid already registered" }
            }) do
                local registry_error = setmetatable({
                    kind = function() return failure.kind end
                }, { __tostring = function() return failure.message end })
                mock("process.registry", {
                    register = function() return nil, registry_error end
                })
                local ok, err = pcall(session.run, { session_id = session_id, user_id = actor:id() })
                restore_mock("process.registry")
                test.is_false(ok)
                test.contains(tostring(err), failure.message)
                test.is_false(string.find(tostring(err), "already running", 1, true) ~= nil)
            end
            cleanup_session_fixture(session_id, context_id)
        end)

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

        it("recovers the unfinished tool call after a crash between persisted results", function()
            local actor = security.actor()
            local session_id, context_id = create_session_fixture(actor, "Tool result crash", consts.STATUS.IDLE)
            local session_writer, writer_err = writer.new(session_id)
            test.is_nil(writer_err)
            local calls = {
                { id = "crash-call-one", type = consts.MSG_TYPE.FUNCTION, name = "one",
                    registry_id = "app:one", arguments = "{}" },
                { id = "crash-call-two", type = consts.MSG_TYPE.FUNCTION, name = "two",
                    registry_id = "app:two", arguments = "{}" }
            }
            local _, call_ids, add_err = session_writer:add_response("", {}, calls)
            test.is_nil(add_err)
            local ids = call_ids or {}
            local validated = {
                ["crash-call-one"] = { valid = true, name = "one", args = {}, registry_id = "app:one" },
                ["crash-call-two"] = { valid = true, name = "two", args = {}, registry_id = "app:two" }
            }
            local caller = {
                set_strategy = function() end,
                execute = function(_self, _context, tools)
                    return {
                        ["crash-call-one"] = { result = "first result", tool_call = tools["crash-call-one"] },
                        ["crash-call-two"] = { result = "second result", tool_call = tools["crash-call-two"] }
                    }
                end
            }
            local original_update = session_writer.update_message_meta :: any
            local result_updates = 0
            session_writer.update_message_meta = function(self, message_id, metadata)
                if metadata.status == consts.FUNC_STATUS.SUCCESS then
                    result_updates = result_updates + 1
                    if result_updates == 2 then error("simulated process crash") end
                end
                return original_update(self, message_id, metadata)
            end

            local ok, crash = pcall(message_handlers.process_tools, {
                session_id = session_id,
                config = {},
                writer = session_writer,
                reader = { get_full_context = function() return {}, nil end },
                upstream = { send_message_update = function() end }
            }, {
                tool_calls = calls,
                call_message_ids = ids,
                caller = caller,
                validated_tools = validated,
                message_id = "crash-user",
                agent = { id = "agent:test" }
            })

            test.is_false(ok)
            test.contains(tostring(crash), "simulated process crash")
            local first_before = message_repo.get(ids["crash-call-one"]).metadata.status
            local second_before = message_repo.get(ids["crash-call-two"]).metadata.status
            test.is_true((first_before == consts.FUNC_STATUS.SUCCESS
                and second_before == consts.FUNC_STATUS.PENDING)
                or (second_before == consts.FUNC_STATUS.SUCCESS
                and first_before == consts.FUNC_STATUS.PENDING))

            local restarted = run_start_through_session(actor, session_id, {}, "tool-crash-recovery", "cancel")
            test.is_nil(restarted.error)
            local first_after = message_repo.get(ids["crash-call-one"]).metadata
            local second_after = message_repo.get(ids["crash-call-two"]).metadata
            local outcomes = { first_after.status, second_after.status }
            test.is_true((outcomes[1] == consts.FUNC_STATUS.SUCCESS and outcomes[2] == consts.FUNC_STATUS.ERROR)
                or (outcomes[2] == consts.FUNC_STATUS.SUCCESS and outcomes[1] == consts.FUNC_STATUS.ERROR))
            local kept = first_after.status == consts.FUNC_STATUS.SUCCESS and first_after or second_after
            local recovered = first_after.status == consts.FUNC_STATUS.ERROR and first_after or second_after
            test.is_true(kept.result == "first result" or kept.result == "second result")
            test.eq(recovered.result, "interrupted, outcome unknown")
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
