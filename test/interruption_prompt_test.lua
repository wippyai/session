local test = require('test')
local sql = require('sql')
local time = require('time')
local uuid = require('uuid')
local json = require('json')
local security = require('security')
local contexts = require('context_repo')
local sessions = require('session_repo')
local messages = require('message_repo')
local consts = require('consts')
local boot = require('wait_for_boot')
local session_service = require('session_service')
local relay_consts = require('relay_consts')

local function define_tests(blocked_only, lifecycle_only)
    describe('Persisted interruption in the provider prompt', function()
        local session_id, context_id, plugin_pid, actor_id, label, hub_pid
        local exited = {}
        local function receive(predicate, timeout, description): any
            local inbox, events, deadline = process.inbox(), process.events(), time.after(timeout)
            while true do
                local selected = channel.select({ inbox:case_receive(), events:case_receive(), deadline:case_receive() })
                assert(selected.ok and selected.channel ~= deadline,
                    'interruption event deadline: ' .. tostring(description or label))
                if selected.channel == events then
                    exited[selected.value.from] = selected.value
                    if selected.value.from == hub_pid and selected.value.result and selected.value.result.error then
                        error(selected.value.result.error)
                    end
                    if predicate('exit', selected.value) then return selected.value end
                else
                    local message = selected.value
                    local data = message:payload():data()
                    if predicate(message:topic(), data) then return data end
                end
            end
        end
        local function idle()
            receive(function(topic, data)
                return topic == 'session:' .. session_id and data.status == consts.STATUS.IDLE
            end, '3s')
        end
        local function shutdown()
            assert(process.send(plugin_pid, consts.PLUGIN_TOPICS.SHUTDOWN, {}))
            receive(function(topic, event) return topic == 'exit' and event.from == plugin_pid end, '3s', 'plugin shutdown')
        end
        local function start(interrupt)
            local actor = security.new_actor(actor_id, {})
            local scope = security.new_scope():with(assert(security.policy('wippy.security:general')) :: security.Policy)
            plugin_pid = assert(process.with_context({}):with_actor(actor):with_scope(scope)
                :spawn_monitored('app:interruption_plugin_worker', 'app:processes', {
                    user_id = actor_id, user_hub_pid = process.pid(),
                    user_metadata = { reply_pid = process.pid(), interrupt = interrupt, lifecycle = lifecycle_only,
                        cancel_before_tools = label == 'cancelled-call-settlement' },
                }))
            assert(process.send(plugin_pid, consts.PLUGIN_TOPICS.OPEN, { session_id = session_id, conn_pid = process.pid() }))
            receive(function(topic) return topic == consts.TOPICS.SESSION_OPENED end, '3s', 'session opened')
        end
        local function send(text, request_id)
            assert(process.send(plugin_pid, consts.PLUGIN_TOPICS.MESSAGE, {
                session_id = session_id, conn_pid = process.pid(), data = { text = text }, request_id = request_id,
            }))
            local request = receive(function(topic) return topic == 'provider_prompt' end, '3s', 'provider prompt')
            local db = assert(sql.get('app:db'))
            local _, err = db:execute('INSERT INTO interruption_prompt_captures (label, request_id, payload) VALUES ($1, $2, $3)',
                {label, request_id, assert(json.encode(request))})
            db:release()
            assert(not err, tostring(err))
            return request
        end
        before_all(function() boot.run() end)
        before_each(function()
            actor_id, session_id, context_id = uuid.v7(), uuid.v7(), uuid.v7()
            plugin_pid, hub_pid = nil, nil
            local db = assert(sql.get('app:db'))
            local _, err = db:execute('INSERT INTO app_users (user_id) VALUES ($1)', {actor_id})
            db:release()
            assert(not err, tostring(err))
            assert(contexts.create(context_id, 'primary', '{}'))
            assert(sessions.create(session_id, actor_id, context_id, 'Interruption prompt', 'test', {}, {
                agent_id = lifecycle_only and 'app:lifecycle_agent' or 'app.process:initial_agent',
            }))
        end)
        after_each(function()
            if plugin_pid and not exited[plugin_pid] then shutdown() end
            if hub_pid and not exited[hub_pid] then assert(process.cancel(hub_pid, '2s')) end
            local _, delete_err = sessions.delete(session_id)
            assert(not delete_err or delete_err == 'Session not found', tostring(delete_err))
            local _, context_err = contexts.delete(context_id)
            assert(not context_err or context_err == 'Context not found', tostring(context_err))
            local db = assert(sql.get('app:db'))
            local _, err = db:execute('DELETE FROM app_users WHERE user_id = $1', {actor_id})
            db:release()
            assert(not err, tostring(err))
        end)
        local function continuation(interrupt, restart)
            label = interrupt .. (restart and '-restart' or '-continue')
            start(interrupt)
            local first_request = send('Perform the earlier request.', 'earlier')
            if interrupt == 'crash' then
                assert(process.terminate(first_request.worker_pid))
            end
            if interrupt ~= 'crash' then
                assert(process.send(plugin_pid, consts.PLUGIN_TOPICS.COMMAND, {
                    session_id = session_id, conn_pid = process.pid(),
                    data = { command = consts.COMMANDS.STOP }, request_id = 'stop',
                }))
                receive(function(_, data) return data.request_id == 'stop' end, '3s')
            end
            if interrupt == 'crash' then
                receive(function(topic, event) return topic == 'exit' and event.from == plugin_pid end,
                    '3s', 'plugin exit after owner crash')
                start(nil)
            else
                idle()
                if restart then shutdown(); start(nil) end
            end
            local request = send('Perform only the new request.', 'followup')
            idle()
            local earlier, boundary, followup, boundaries = nil, nil, nil, 0
            for index, message in ipairs(request.messages) do
                for _, part in ipairs(message.content or {}) do
                    if part.text == 'Perform the earlier request.' then earlier = index end
                    if part.text == 'Perform only the new request.' then followup = index end
                    if message.role == 'developer' and part.text and part.text:find('Do not automatically resume', 1, true) then
                        boundary = index
                        boundaries = boundaries + 1
                    end
                end
            end
            test.not_nil(earlier, 'earlier request remains a separate historical instruction')
            test.not_nil(boundary, 'provider receives the persisted interruption boundary')
            test.not_nil(followup, 'follow-up remains its own user instruction')
            test.eq(boundaries, 1, 'recovery does not duplicate Stop')
            test.is_true(earlier < boundary and boundary < followup)
            local wire_earlier, wire_boundary, wire_followup
            for index, message in ipairs(request.responses_input) do
                for _, part in ipairs(message.content or {}) do
                    if part.text == 'Perform the earlier request.' then wire_earlier = index end
                    if part.text == 'Perform only the new request.' then wire_followup = index end
                    if message.role == 'developer' and part.text and part.text:find('Do not automatically resume', 1, true) then
                        wire_boundary = index
                    end
                end
            end
            test.not_nil(wire_boundary, 'Responses preserves the boundary in its chronological input')
            test.is_true(wire_earlier < wire_boundary and wire_boundary < wire_followup)
            local page = assert(messages.list_by_session(session_id))
            local durable = 0
            for _, message in ipairs(page.messages) do
                if message.type == consts.MSG_TYPE.DEVELOPER and message.metadata.interruption then durable = durable + 1 end
            end
            test.eq(durable, 1, 'boundary persists in the native history')
        end
        if lifecycle_only then
            it('retires an owner deleted mid-call without a recovery warning or a replacement owner', function()
                label = 'delete-during-turn'
                start(nil)
                send('Perform the tool.', 'work')
                assert(session_service.delete({ session_id = session_id, user_id = actor_id }))
                receive(function(_, event) return event.deleted == true end, '3s')
                local closed = receive(function(topic, event)
                    test.is_true(event.code ~= 'recovery_incomplete', 'deletion must not look like a failed live session')
                    return topic == consts.TOPICS.SESSION_CLOSED
                end, '3s')
                test.eq(closed.reason, 'deleted')
                test.eq(#closed.active_session_ids, 0)
                test.is_nil((process.registry.lookup('session.' .. session_id)))
                test.eq(select(2, sessions.get(session_id)), 'Session not found')
                local exit = receive(function(topic, event)
                    return topic == 'exit' and event.from == plugin_pid
                end, '3s')
                test.is_nil(exit.result and exit.result.error)
                test.eq(exit.result.value.reason, 'no_active_sessions')
            end)
            it('settles a Stop-cancelled call live and in durable history', function()
                label = 'cancelled-call-settlement'
                start(nil)
                send('Perform the tool.', 'work')
                receive(function(topic) return topic == 'tool_intent_persisted' end, '3s')
                assert(process.send(plugin_pid, consts.PLUGIN_TOPICS.COMMAND, {
                    session_id = session_id, conn_pid = process.pid(),
                    data = { command = consts.COMMANDS.STOP }, request_id = 'stop',
                }))
                receive(function(_, data) return data.request_id == 'stop' end, '3s')
                local event = receive(function(_, data)
                    return data.type == consts.UPSTREAM_TYPES.FUNCTION_ERROR and data.outcome == consts.FUNC_STATUS.CANCELLED
                end, '3s')
                idle()
                test.is_nil(event.status, 'the live event carries only outcome')
                local row = assert(messages.get(event.message_id))
                test.eq(row.metadata.status, consts.FUNC_STATUS.CANCELLED)
                test.eq(row.metadata.call_id, event.call_id)
                test.eq(row.metadata.function_name, event.function_name)
                test.eq(row.metadata.result, event.error)
            end)
            it('resumes a pending shutdown with the same session process', function()
                label = 'resume-pending-finish'
                start(nil)
                local first = send('Perform the tool.', 'work')
                assert(process.send(plugin_pid, consts.PLUGIN_TOPICS.SHUTDOWN, {}))
                assert(process.send(plugin_pid, consts.PLUGIN_TOPICS.RESUME, {}))
                receive(function(topic) return topic == 'provider_prompt' end, '3s')
                idle()
                local next_request = send('Perform only the new request.', 'followup')
                test.eq(next_request.worker_pid, first.worker_pid)
                idle()
                local page = assert(messages.list_by_session(session_id))
                for _, message in ipairs(page.messages) do test.is_nil(message.metadata.interruption) end
            end)
            it('disconnects mid-turn and stores completed tools and the final answer', function()
                label = 'disconnect-turn-completion'
                local actor = security.new_actor(actor_id, {})
                local scope = security.new_scope():with(assert(security.policy('wippy.security:general')) :: security.Policy)
                hub_pid = assert(process.with_context({}):with_actor(actor):with_scope(scope)
                    :spawn_monitored(relay_consts.USER_HUB_PROCESS_ID, 'app:processes', {
                        user_id = actor_id, user_metadata = { reply_pid = process.pid(), lifecycle = true },
                        plugins = { session_ = { prefix = 'session_', process_id = 'app:interruption_plugin_worker',
                            host = 'app:processes', auto_start = true } },
                        config = { user_hub_host = 'app:processes' },
                    }))
                assert(process.send(hub_pid, relay_consts.WS_TOPICS.JOIN, { client_pid = process.pid() }))
                receive(function(topic) return topic == relay_consts.CLIENT_TOPICS.WELCOME end, '3s')
                assert(process.send(hub_pid, relay_consts.WS_TOPICS.MESSAGE, (assert(json.encode({
                    type = 'session_open', session_id = session_id, request_id = 'open',
                })))))
                receive(function(topic) return topic == consts.TOPICS.SESSION_OPENED end, '3s')
                assert(process.send(hub_pid, relay_consts.WS_TOPICS.MESSAGE, (assert(json.encode({
                    type = 'session_message', session_id = session_id, request_id = 'work', data = { text = 'Perform the tool.' },
                })))))
                receive(function(topic) return topic == 'provider_prompt' end, '3s')
                assert(process.send(hub_pid, relay_consts.WS_TOPICS.LEAVE, { client_pid = process.pid() }))
                receive(function(topic) return topic == 'provider_prompt' end, '3s')
                local deadline = time.after('3s')
                while true do
                    local page = assert(messages.list_by_session(session_id))
                    local tool, answer
                    for _, message in ipairs(page.messages) do
                        if message.type == consts.MSG_TYPE.FUNCTION then tool = message end
                        if message.type == consts.MSG_TYPE.ASSISTANT and message.data == 'Scripted answer' then answer = message end
                        test.is_nil(message.metadata.interruption, 'disconnect does not persist a Stop boundary')
                    end
                    if answer then
                        test.not_nil(tool)
                        test.eq(tool.metadata.status, consts.FUNC_STATUS.SUCCESS)
                        test.eq(tool.metadata.result.marker, 'stored-tool-result')
                        break
                    end
                    local selected = channel.select({ time.after('10ms'):case_receive(), deadline:case_receive() })
                    assert(selected.channel ~= deadline, 'completed turn storage deadline')
                end
            end)
        elseif not blocked_only then
        it('preserves Stop on continuation without restarting', function() continuation('cooperative', false) end)
        it('preserves Stop when the plugin reopens the session', function() continuation('cooperative', true) end)
        it('persists recovery after the owner exits during a provider call', function() continuation('crash', true) end)
        it('keeps a completed turn when a finished session reopens', function()
            label = 'completed-reopen'
            start(nil)
            send('Perform the earlier request.', 'earlier')
            idle()
            shutdown()
            assert(sessions.update_session_meta(session_id, { status = consts.STATUS.COMPLETED }))
            start(nil)
            local request = send('Perform only the new request.', 'followup')
            idle()
            for _, message in ipairs(request.messages) do
                test.is_false(message.role == 'developer' and message.metadata and message.metadata.interruption ~= nil,
                    'completed work does not become interrupted history')
            end
        end)
        else
            it('cancels a blocked provider and preserves Stop after reopening', function() continuation('blocked', true) end)
        end
    end)
end

return {
    run_tests = test.run_cases(function() define_tests(false) end),
    run_blocked = test.run_cases(function() define_tests(true) end),
    run_lifecycle = test.run_cases(function() define_tests(false, true) end),
}
