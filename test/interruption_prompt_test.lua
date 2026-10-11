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

local function define_tests(blocked_only)
    describe('Persisted interruption in the provider prompt', function()
        local session_id, context_id, plugin_pid, actor_id, label
        local exited = {}
        local function receive(predicate, timeout)
            local inbox, events, deadline = process.inbox(), process.events(), time.after(timeout)
            while true do
                local selected = channel.select({ inbox:case_receive(), events:case_receive(), deadline:case_receive() })
                assert(selected.ok and selected.channel ~= deadline, 'interruption event deadline')
                if selected.channel == events then
                    exited[selected.value.from] = selected.value
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
            receive(function(topic, event) return topic == 'exit' and event.from == plugin_pid end, '3s')
        end
        local function start(interrupt)
            local actor = security.new_actor(actor_id, {})
            local scope = security.new_scope():with(assert(security.policy('wippy.security:general')) :: security.Policy)
            plugin_pid = assert(process.with_context({}):with_actor(actor):with_scope(scope)
                :spawn_monitored('app:interruption_plugin_worker', 'app:processes', {
                    user_id = actor_id, user_hub_pid = process.pid(),
                    user_metadata = { reply_pid = process.pid(), interrupt = interrupt },
                }))
            assert(process.send(plugin_pid, consts.PLUGIN_TOPICS.OPEN, { session_id = session_id, conn_pid = process.pid() }))
            receive(function(topic) return topic == consts.TOPICS.SESSION_OPENED end, '3s')
        end
        local function send(text, request_id)
            assert(process.send(plugin_pid, consts.PLUGIN_TOPICS.MESSAGE, {
                session_id = session_id, conn_pid = process.pid(), data = { text = text }, request_id = request_id,
            }))
            local request = receive(function(topic) return topic == 'provider_prompt' end, '3s')
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
            plugin_pid = nil
            local db = assert(sql.get('app:db'))
            local _, err = db:execute('INSERT INTO app_users (user_id) VALUES ($1)', {actor_id})
            db:release()
            assert(not err, tostring(err))
            assert(contexts.create(context_id, 'primary', '{}'))
            assert(sessions.create(session_id, actor_id, context_id, 'Interruption prompt', 'test', {}, {
                agent_id = 'app.process:initial_agent',
            }))
        end)
        after_each(function()
            if plugin_pid and not exited[plugin_pid] then shutdown() end
            assert(sessions.delete(session_id))
            assert(contexts.delete(context_id))
            local db = assert(sql.get('app:db'))
            local _, err = db:execute('DELETE FROM app_users WHERE user_id = $1', {actor_id})
            db:release()
            assert(not err, tostring(err))
        end)
        local function continuation(interrupt, restart)
            label = interrupt .. (restart and '-restart' or '-continue')
            start(interrupt)
            send('Perform the earlier request.', 'earlier')
            if interrupt ~= 'crash' then
                assert(process.send(plugin_pid, consts.PLUGIN_TOPICS.COMMAND, {
                    session_id = session_id, conn_pid = process.pid(),
                    data = { command = consts.COMMANDS.STOP }, request_id = 'stop',
                }))
                receive(function(_, data) return data.request_id == 'stop' end, '3s')
            end
            if interrupt == 'blocked' or interrupt == 'crash' then
                receive(function(topic, event) return topic == 'exit' and event.from == plugin_pid end,
                    interrupt == 'blocked' and '23s' or '3s')
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
                    if message.role == 'developer' and part.text and part.text:find('Do not resume', 1, true) then
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
                    if message.role == 'developer' and part.text and part.text:find('Do not resume', 1, true) then
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
        if not blocked_only then
        it('preserves Stop on continuation without restarting', function() continuation('cooperative', false) end)
        it('preserves Stop when the plugin reopens the session', function() continuation('cooperative', true) end)
        it('persists recovery when interruption precedes an assistant row', function() continuation('crash', true) end)
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
            it('preserves Stop when termination precedes an assistant row', function() continuation('blocked', true) end)
        end
    end)
end

return {
    run_tests = test.run_cases(function() define_tests(false) end),
    run_blocked = test.run_cases(function() define_tests(true) end),
}
