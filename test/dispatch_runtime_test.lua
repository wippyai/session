local test = require('test')
local time = require('time')
local uuid = require('uuid')
local sql = require('sql')
local json = require('json')
local security = require('security')
local contexts = require('context_repo')
local sessions = require('session_repo')
local messages = require('message_repo')
local consts = require('consts')
local boot = require('wait_for_boot')
local attachments = require('context_attachments')
local hash = require('hash')

local function define_tests()
    describe('Durable authenticated dispatch with real SQL and process host', function()
        local workers, fixtures, sequence, wire_packets = {}, {}, 0, {}
        local function receive(topic, pid, wanted_sequence)
            local inbox, events, deadline = process.inbox(), process.events(), time.after('3s')
            while true do
                local selected = channel.select({ inbox:case_receive(), events:case_receive(), deadline:case_receive() })
                assert(selected.ok and selected.channel ~= deadline, 'dispatch fixture response timed out')
                if selected.channel == events then
                    workers[selected.value.from] = nil
                    error('dispatch worker exited: ' .. tostring(selected.value.result and selected.value.result.error or 'normal exit'))
                end
                local msg, data = selected.value, selected.value:payload():data()
                if msg:from() == pid and msg:topic() == topic and (not wanted_sequence or data.sequence == wanted_sequence) then return data end
                if msg:from() == pid then wire_packets[#wire_packets + 1] = { topic = msg:topic(), data = data } end
            end
        end
        local function fixture()
            local actor, context_id, session_id = uuid.v7(), uuid.v7(), uuid.v7()
            assert(contexts.create(context_id, 'primary', 'Dispatch fixture'))
            assert(sessions.create(session_id, actor, context_id, 'Dispatch fixture', 'test', {}, { agent_id = 'fixture:accepted', model = 'fixture-model' }))
            table.insert(fixtures, { session_id = session_id, context_id = context_id })
            return actor, session_id
        end
        local function worker(actor, session_id, options)
            local scope = security.new_scope()
            for _, id in ipairs({ 'app:context_transport_session_policy', 'app:context_transport_env_policy',
                'app:context_transport_db_policy', 'app:context_transport_reply_policy',
                'app:dispatch_fixture_tool_policy', 'app:dispatch_fixture_context_policy' }) do
                scope = scope:with(assert(security.policy(id)) :: security.Policy)
            end
            options = options or {}
            options.user_id, options.session_id, options.reply_pid = actor, session_id, process.pid()
            local pid, err = process.with_context({}):with_actor(security.new_actor(actor, { context_transport_reply_pid = process.pid() }))
                :with_scope(scope):spawn_monitored('app:dispatch_worker', 'app:processes', options)
            assert(pid, tostring(err or 'dispatch worker unavailable'))
            workers[pid] = true
            receive('dispatch_test_ready', pid)
            return pid
        end
        local function request(pid, data)
            sequence = sequence + 1
            data.sequence = sequence
            assert(process.send(pid, 'dispatch_test_request', data))
            return receive('dispatch_test_result', pid, sequence)
        end
        local function stop(pid, crash)
            assert(process.send(pid, crash and 'dispatch_test_crash' or 'dispatch_test_stop', {}))
            local events, deadline = process.events(), time.after('3s')
            while true do
                local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                assert(selected.ok and selected.channel ~= deadline, 'dispatch worker exit timed out')
                if selected.value.from == pid then test.is_nil(selected.value.result.error); workers[pid] = nil; return end
            end
        end
        local function accepted(pid, text, request_id)
            local result = request(pid, { action = 'accept', request_id = request_id or uuid.v7(), data = { text = text } })
            test.is_nil(result.error)
            return result.value
        end
        before_all(function() boot.run() end)
        after_each(function()
            for pid in pairs(workers) do stop(pid) end
            for _, fixture in ipairs(fixtures) do sessions.delete(fixture.session_id); contexts.delete(fixture.context_id) end
            fixtures = {}
            wire_packets = {}
        end)
        it('rolls message and dispatch back together and recovers committed queued work after authenticated worker restart', function()
            local actor, session_id = fixture()
            local a = worker(actor, session_id)
            local rolled_id = uuid.v7()
            test.eq(request(a, { action = 'rollback', message_id = rolled_id, request_id = uuid.v7() }).error, 'FIXTURE_ROLLBACK')
            test.is_nil(messages.get(rolled_id))
            local accepted_id = accepted(a, 'root before crash').message_id
            local before = request(a, { action = 'stats' }).value
            test.eq(before.snapshot.dispatches[1].state, 'queued')
            test.eq(before.calls, 0)
            stop(a, true)
            local b = worker(actor, session_id)
            test.is_true(request(b, { action = 'open' }).value)
            test.is_true(request(b, { action = 'run' }).value)
            local done = request(b, { action = 'idle' }).value
            test.eq(done.calls, 1)
            test.eq(done.snapshot.dispatches[1].state, 'completed')
            test.eq(done.snapshot.dispatches[1].message_id, accepted_id)
            test.eq(messages.get(done.snapshot.dispatches[1].response_id).type, 'assistant')
            test.is_nil(done.snapshot.dispatches[1].actor_id)
        end)
        it('serializes roots using accepted config and excludes later roots from earlier prompts', function()
            local actor, session_id = fixture()
            local a = worker(actor, session_id)
            accepted(a, 'root A')
            accepted(a, 'root B')
            assert(sessions.update_session_meta(session_id, { config = { agent_id = 'fixture:changed', model = 'changed-model' } }))
            assert(request(a, { action = 'open' }).value)
            assert(request(a, { action = 'run' }).value)
            local done = request(a, { action = 'idle' }).value
            test.eq(done.calls, 2)
            test.eq(#done.histories[1], 1)
            test.eq(done.histories[1][1], 'root A')
            test.eq(#done.histories[2], 3)
            test.eq(done.histories[2][1], 'root A')
            test.eq(done.histories[2][2], 'dispatch answer 1')
            test.eq(done.histories[2][3], 'root B')
            test.eq(done.agent_ids[1].agent_id, 'fixture:accepted')
            test.eq(done.agent_ids[2].model, 'fixture-model')
        end)
        it('preserves inclusive checkpoint lower bound and accepted-root upper bound for all and count', function()
            local actor, session_id = fixture()
            local a = worker(actor, session_id)
            local before = accepted(a, 'before checkpoint').message_id
            local checkpoint = accepted(a, 'checkpoint boundary').message_id
            local current = accepted(a, 'current accepted root').message_id
            accepted(a, 'future accepted root')
            local snapshot = request(a, { action = 'stats' }).value.snapshot
            for _, descriptor in ipairs(snapshot.dispatches) do
                if descriptor.message_id == before or descriptor.message_id == checkpoint then
                    assert(request(a, { action = 'cancel', dispatch_id = descriptor.dispatch_id }).value)
                end
            end
            assert(request(a, { action = 'open' }).value)
            local claimed = request(a, { action = 'claim' }).value
            test.eq(claimed.message_id, current)
            local window = request(a, { action = 'checkpoint_window', checkpoint_id = checkpoint }).value
            test.eq(window.count, 2)
            test.eq(#window.messages, 2)
            test.eq(window.messages[1].message_id, checkpoint)
            test.eq(window.messages[2].message_id, current)
        end)
        it('runs real background triggers with an unbounded fenced count while excluding later accepted roots', function()
            local actor, session_id = fixture()
            assert(sessions.update_session_meta(session_id, { title = '', config = { agent_id = 'fixture:accepted', model = 'fixture-model',
                checkpoint_function_id = 'fixture:checkpoint', token_checkpoint_threshold = 100, title_function_id = 'fixture:title' } }))
            local a = worker(actor, session_id, { background = true })
            accepted(a, 'background A')
            accepted(a, 'background B')
            assert(request(a, { action = 'open' }).value)
            assert(request(a, { action = 'run' }).value)
            local done = request(a, { action = 'idle' }).value
            test.eq(done.calls, 2)
            test.eq(#done.background_counts, 2)
            test.eq(done.background_counts[1], 2)
            test.eq(done.background_counts[2], 4)
            for _, descriptor in ipairs(done.snapshot.dispatches) do test.eq(descriptor.state, 'completed') end
        end)
        it('keeps background handler failures outside the accepted user dispatch', function()
            local actor, session_id = fixture()
            assert(sessions.update_session_meta(session_id, { title = '', config = { agent_id = 'fixture:accepted', model = 'fixture-model',
                checkpoint_function_id = 'fixture:checkpoint', token_checkpoint_threshold = 100, title_function_id = 'fixture:title' } }))
            local a = worker(actor, session_id, { background = true, background_failure = true })
            local root = accepted(a, 'background failure isolation')
            assert(request(a, { action = 'open' }).value)
            assert(request(a, { action = 'run' }).value)
            local done = request(a, { action = 'idle' }).value
            test.eq(done.calls, 1)
            for _, descriptor in ipairs(done.snapshot.dispatches) do
                if descriptor.message_id == root.message_id then
                    test.eq(descriptor.state, 'completed')
                    test.eq(descriptor.terminal_code, 'DISPATCH_COMPLETED')
                end
            end
        end)
        it('isolates child config mutation from accepted continuation while persisting it for future roots', function()
            local actor, session_id = fixture()
            local a = worker(actor, session_id, { config_mutation = true })
            accepted(a, 'immutable config root')
            assert(request(a, { action = 'open' }).value)
            assert(request(a, { action = 'run' }).value)
            local done = request(a, { action = 'idle' }).value
            test.eq(done.calls, 2)
            test.eq(done.agent_ids[1].agent_id, 'fixture:accepted')
            test.eq(done.agent_ids[2].agent_id, 'fixture:accepted')
            test.eq(done.agent_ids[2].model, 'fixture-model')
            accepted(a, 'future config root')
            assert(request(a, { action = 'run' }).value)
            local future = request(a, { action = 'idle' }).value
            test.eq(future.agent_ids[3].agent_id, 'fixture:future')
            test.eq(future.agent_ids[3].model, 'future-model')
        end)
        it('never replays started work after expired ownership and fences stale business writes', function()
            local actor, session_id = fixture()
            local now = time.now():unix()
            local a = worker(actor, session_id, { now = now })
            accepted(a, 'started but no model')
            assert(request(a, { action = 'open' }).value)
            local claimed = request(a, { action = 'claim' }).value
            test.eq(claimed.state, 'started')
            test.is_true(request(a, { action = 'fenced_write', method = 'set_context', arguments = { 'fixture', 'before' } }).value)
            assert(request(a, { action = 'clock', now = now + 31 }).value)
            test.eq(request(a, { action = 'fenced_write', method = 'set_context', arguments = { 'fixture', 'after' } }).error, 'DISPATCH_FENCE_LOST')
            stop(a, true)
            local b = worker(actor, session_id, { now = now + 31 })
            assert(request(b, { action = 'open' }).value)
            assert(request(b, { action = 'run' }).value)
            local after = request(b, { action = 'idle' }).value
            test.eq(after.calls, 0)
            test.eq(after.snapshot.dispatches[1].state, 'interrupted')
            test.eq(after.snapshot.dispatches[1].terminal_code, 'DISPATCH_OWNER_LOST')
        end)
        it('tags production relay packets and suppresses wrong nonce unknown operation and stale generations', function()
            local actor, session_id = fixture()
            local now = time.now():unix()
            local a = worker(actor, session_id, { now = now })
            local root_message = accepted(a, 'stream root').message_id
            assert(request(a, { action = 'open' }).value)
            local claimed = request(a, { action = 'claim' }).value
            local function relay(suffix)
                return request(a, { action = 'relay', topic = 'session_dispatch_stream:' .. suffix,
                    payload = { type = 'chunk', content = 'fixture stream' } })
            end
            test.is_false(relay('wrong-stream:root').value)
            test.is_false(relay('fixture-stream:unknown').value)
            test.eq(#wire_packets, 0)
            test.is_true(relay('fixture-stream:root').value)
            test.eq(request(a, { action = 'stats' }).value.last_relay_validations, 1)
            test.eq(#wire_packets, 1)
            local first = assert(wire_packets[1])
            local first_data = assert(first.data)
            local first_dispatch = assert(first_data.dispatch)
            test.eq(first_data.root_message_id, root_message)
            test.eq(first_dispatch.dispatch_id, claimed.dispatch_id)
            test.eq(first_dispatch.response_id, claimed.response_id)
            test.eq(first_dispatch.generation, claimed.generation)
            test.eq(first_dispatch.revision, claimed.revision)
            test.eq(string.sub(first.topic, -#claimed.response_id), claimed.response_id)
            test.is_true(relay('fixture-stream:root.1').value)
            test.eq(#wire_packets, 2)
            local second_data = assert(wire_packets[2]).data
            test.eq(assert(second_data).dispatch.response_id, claimed.response_id)
            assert(request(a, { action = 'finish_operation', operation_key = 'root' }).value)
            test.is_false(relay('fixture-stream:root').value)
            test.eq(request(a, { action = 'stats' }).value.last_relay_validations, 0)
            test.eq(#wire_packets, 2)
            assert(request(a, { action = 'clock', now = now + 31 }).value)
            test.is_false(relay('fixture-stream:root.1').value)
            test.eq(request(a, { action = 'stats' }).value.last_relay_validations, 1)
            test.eq(#wire_packets, 2)
        end)
        it('rechecks operation retirement after a yielding fence query without forwarding a late chunk', function()
            local actor, session_id = fixture()
            local a = worker(actor, session_id)
            accepted(a, 'stream retirement race')
            assert(request(a, { action = 'open' }).value)
            assert(request(a, { action = 'claim' }).value)
            local result = request(a, { action = 'relay', topic = 'session_dispatch_stream:fixture-stream:root',
                retire_during_validation = true, payload = { type = 'chunk', content = 'late fixture stream' } })
            test.is_false(result.value)
            test.eq(request(a, { action = 'stats' }).value.last_relay_validations, 1)
            test.eq(#wire_packets, 0)
        end)
        it('rejects sparse descendants atomically and keeps the session usable for the next root', function()
            local actor, session_id = fixture()
            local a = worker(actor, session_id, { sparse_once = true })
            local rejected = accepted(a, 'sparse descendants')
            assert(request(a, { action = 'open' }).value)
            assert(request(a, { action = 'run' }).value)
            local first = request(a, { action = 'idle' }).value
            local first_snapshot = assert(first.snapshot)
            local first_dispatches = assert(first_snapshot.dispatches)
            test.eq(first.child_effects, 0)
            test.eq(first_dispatches[1].terminal_code, 'DISPATCH_ENQUEUE_FAILED')
            test.eq(first_dispatches[1].message_id, rejected.message_id)
            local next_root = accepted(a, 'usable after sparse descendants')
            assert(request(a, { action = 'run' }).value)
            local second = request(a, { action = 'idle' }).value
            test.eq(second.calls, 2)
            test.eq(second.child_effects, 0)
            local completed = false
            for _, row in ipairs(second.snapshot.dispatches) do
                if row.message_id == next_root.message_id then completed = row.state == 'completed' end
            end
            test.is_true(completed)
        end)
        it('rejects full external queue admission explicitly without blocking or persisting the request', function()
            local actor, session_id = fixture()
            local a = worker(actor, session_id)
            local result = request(a, { action = 'queue_capacity' }).value
            test.eq(result.accepted, 256)
            test.eq(result.pending, 256)
            test.is_false(result.overflow)
            test.eq(result.rejection, 'SESSION_BUSY')
            test.eq(#assert(messages.list_by_session(session_id)).messages, 0)
        end)
        it('bounds atomic descendant fanout pending work and total operations without deadlock or partial descendants', function()
            local cases = {
                { fanout = 257, expected = 0, terminal = 'interrupted' },
                { fanout = 128, expected = 128, terminal = 'completed' },
                { fanout = 129, expected = 0, terminal = 'interrupted' },
                { fanout = 128, child_fanout = 2, expected = 1, terminal = 'interrupted' },
                { chain = true, expected = 255, terminal = 'interrupted' },
            }
            for _, options in ipairs(cases) do
                local actor, session_id = fixture()
                local a = worker(actor, session_id, options)
                accepted(a, 'bounded operations')
                assert(request(a, { action = 'open' }).value)
                assert(request(a, { action = 'run' }).value)
                local done = request(a, { action = 'idle' }).value
                local done_snapshot = assert(done.snapshot)
                local done_dispatches = assert(done_snapshot.dispatches)
                test.eq(done.child_effects, options.expected)
                test.eq(done_dispatches[1].state, options.terminal)
                if options.terminal == 'interrupted' then test.eq(done_dispatches[1].terminal_code, 'DISPATCH_ENQUEUE_FAILED') end
                stop(a)
            end
        end)
        it('uses persisted UUID topics for real non-UUID provider tool call success and error packets', function()
            for _, mode in ipairs({ 'success', 'error' }) do
                wire_packets = {}
                local actor, session_id = fixture()
                local a = worker(actor, session_id, { tool_mode = mode })
                local root_id = accepted(a, 'tool lifecycle').message_id
                assert(request(a, { action = 'open' }).value)
                assert(request(a, { action = 'run' }).value)
                local done = request(a, { action = 'idle' }).value
                local tool
                for _, message in ipairs(assert(messages.list_by_session(session_id)).messages) do
                    if message.type == 'function' then tool = message end
                end
                assert(tool ~= nil, 'Missing persisted tool; failure=' .. done.tool_failure .. '; schema=' .. done.tool_schema .. '; state=' .. done.snapshot.dispatches[1].state)
                test.eq(tool.metadata.call_id, 'call_123')
                test.eq(tool.metadata.status, mode)
                local events = {}
                for _, packet in ipairs(wire_packets) do
                    local data = packet.data
                    if data.type == 'function_call' or data.type == 'function_success' or data.type == 'function_error' then
                        test.eq(packet.topic, consts.TOPIC_PREFIXES.SESSION .. session_id .. consts.TOPIC_PREFIXES.MESSAGE .. tool.message_id)
                        test.eq(#tool.message_id, 36)
                        test.eq(data.call_id, 'call_123')
                        test.eq(data.root_message_id, root_id)
                        test.eq(data.dispatch.message_id, root_id)
                        events[data.type] = true
                    end
                end
                assert(events.function_call, 'Missing function_call packet; retained=' .. #wire_packets)
                assert(events[mode == 'success' and 'function_success' or 'function_error'], 'Missing tool terminal packet; retained=' .. #wire_packets)
                stop(a)
            end
        end)
        it('rejects prior-root metadata writes under a live fence while allowing current checkpoint and tool results', function()
            local actor, session_id = fixture()
            local a = worker(actor, session_id)
            local previous = accepted(a, 'previous root').message_id
            local previous_dispatch = request(a, { action = 'stats' }).value.snapshot.dispatches[1]
            assert(request(a, { action = 'cancel', dispatch_id = previous_dispatch.dispatch_id }).value)
            local current = accepted(a, 'current root').message_id
            assert(request(a, { action = 'open' }).value)
            test.eq(request(a, { action = 'claim' }).value.message_id, current)
            local rejected = request(a, { action = 'fenced_write', method = 'update_message_meta',
                arguments = { previous, { overwritten = true } } })
            test.eq(rejected.error, 'DISPATCH_OUTPUT_UNAVAILABLE')
            test.is_nil(messages.get(previous).metadata.overwritten)
            test.is_true(request(a, { action = 'fenced_write', method = 'update_message_meta',
                arguments = { current, { checkpoint_summary = 'current checkpoint' } } }).value)
            test.eq(messages.get(current).metadata.checkpoint_summary, 'current checkpoint')
            local function_id = assert(request(a, { action = 'fenced_write', method = 'add_function_call',
                arguments = { 'fixture_tool', {}, { call_id = 'current-call' } } }).value)
            test.is_true(request(a, { action = 'fenced_write', method = 'update_function_result',
                arguments = { function_id, 'current result', true } }).value)
            local tool = messages.get(function_id)
            test.eq(tool.metadata.status, 'success')
            test.eq(tool.metadata.result, 'current result')
        end)
        it('fences every business writer family after lease expiry', function()
            local actor, session_id = fixture()
            local now = time.now():unix()
            local a = worker(actor, session_id, { now = now })
            local root_message = accepted(a, 'fenced root').message_id
            assert(request(a, { action = 'open' }).value)
            assert(request(a, { action = 'claim' }).value)
            assert(request(a, { action = 'clock', now = now + 31 }).value)
            local operations = {
                { 'add_message', { 'assistant', 'late content' } },
                { 'update_message_meta', { root_message, { late = true } } },
                { 'add_function_call', { 'fixture', {} } },
                { 'update_function_result', { root_message, 'late result', true } },
                { 'update_meta', { { public_meta = { late = true } } } },
                { 'update_title', { 'late title' } },
                { 'update_status', { 'failed' } },
                { 'create_artifact', { uuid.v7(), 'text', 'late', 'late' } },
                { 'update_artifact', { uuid.v7(), { title = 'late' } } },
                { 'set_context', { 'late', true } },
                { 'delete_context', { 'late' } },
                { 'add_session_context', { 'fixture', 'late' } },
                { 'delete_session_context', { uuid.v7() } },
                { 'delete_session_contexts_by_type', { 'fixture' } },
            }
            for _, operation in ipairs(operations) do
                local result = request(a, { action = 'fenced_write', method = operation[1], arguments = operation[2] })
                test.eq(result.error, 'DISPATCH_FENCE_LOST', operation[1])
            end
            test.eq(#assert(messages.list_by_session(session_id)).messages, 1)
            test.is_nil(messages.get(root_message).metadata.late)
        end)
        it('keeps one live owner and renews only an unexpired lease without replaying completed duplicates', function()
            local actor, session_id = fixture()
            local now, request_id = time.now():unix(), uuid.v7()
            local a = worker(actor, session_id, { now = now })
            local initial = accepted(a, 'one accepted request', request_id)
            assert(request(a, { action = 'open' }).value)
            assert(request(a, { action = 'open' }).value)
            local b = worker(actor, session_id, { now = now })
            test.eq(request(b, { action = 'open' }).error, 'DISPATCH_OWNER_BUSY')
            assert(request(a, { action = 'clock', now = now + 20 }).value)
            assert(request(a, { action = 'heartbeat' }).value)
            assert(request(a, { action = 'clock', now = now + 35 }).value)
            assert(request(a, { action = 'run' }).value)
            local done = request(a, { action = 'idle' }).value
            test.eq(done.calls, 1)
            local duplicate = accepted(a, 'one accepted request', request_id)
            test.eq(duplicate.message_id, initial.message_id)
            assert(request(a, { action = 'run' }).value)
            test.eq(request(a, { action = 'idle' }).value.calls, 1)
            assert(request(a, { action = 'clock', now = now + 51 }).value)
            test.eq(request(a, { action = 'heartbeat' }).error, 'DISPATCH_FENCE_LOST')
        end)
        it('terminalizes queued cancellation root and descendant enqueue failures and interception without replay', function()
            local modes = {
                { enqueue_failure = 'root' },
                { enqueue_failure = 'child', descendant_failure = true },
                { missing_handler = true },
                { intercept = true },
                { queued_cancel = true },
            }
            for _, mode in ipairs(modes) do
                local actor, session_id = fixture()
                local a = worker(actor, session_id, mode)
                accepted(a, 'terminal fixture')
                local queued = request(a, { action = 'stats' }).value.snapshot.dispatches[1]
                if mode.queued_cancel then
                    local cancelled = request(a, { action = 'cancel', dispatch_id = queued.dispatch_id }).value
                    test.eq(cancelled.state, 'cancelled')
                    test.eq(cancelled.generation, 1)
                    local duplicate = request(a, { action = 'cancel', dispatch_id = queued.dispatch_id }).value
                    test.eq(duplicate.revision, cancelled.revision)
                end
                assert(request(a, { action = 'open' }).value)
                local started = request(a, { action = 'run' })
                if mode.enqueue_failure == 'root' then test.eq(started.error, 'FIXTURE_ENQUEUE_FAILED') else test.is_true(started.value) end
                local done = request(a, { action = 'idle' }).value
                local descriptor = done.snapshot.dispatches[1]
                test.eq(descriptor.state, mode.queued_cancel and 'cancelled' or 'interrupted')
                test.eq(descriptor.terminal_code, mode.enqueue_failure and 'DISPATCH_ENQUEUE_FAILED'
                    or (mode.intercept or mode.queued_cancel) and 'DISPATCH_CANCELLED' or 'DISPATCH_HANDLER_FAILED')
                if mode.enqueue_failure == 'root' or mode.queued_cancel then test.eq(done.calls, 0) end
                assert(request(a, { action = 'run' }).value)
                test.eq(request(a, { action = 'idle' }).value.calls, done.calls)
                stop(a)
            end
        end)
        it('marks prompt model and descendant failures interrupted and terminalizes pending tool history', function()
            for _, mode in ipairs({ 'unsupported', 'render_failed', 'thrown', 'valid' }) do
                local actor, session_id = fixture()
                local a = worker(actor, session_id, { context_renderer_failure = mode ~= 'valid' and mode or nil })
                local payload = { schema = 'wippy.attention.v2', snapshot_id = 'stored-v2', host_instance_id = 'host-v2', mount_generation = 1,
                    created_at = '2026-09-04T12:00:00Z', coordinate_space = { kind = 'host-viewport', width = 800, height = 600, device_pixel_ratio = 1 },
                    capture = { radius_css_px = 20, grid_step_css_px = 5, sampled_points = 0, points = {}, duration_ms = 0, complete = true },
                    path_dictionary = {}, candidates = {}, recent_events = {}, omissions = {} }
                local content = attachments.canonical_json(payload)
                local array = { { attachment_id = 'stored-context', kind = 'wippy.attention', version = 2,
                    created_at = payload.created_at, content_type = 'application/json', content = content,
                    content_bytes = #content, content_hash = 'sha256:' .. hash.sha256(content) } }
                local request_id = uuid.v7()
                local data = { text = 'Required stored context', context_attachments = array }
                local accepted = request(a, { action = 'accept', request_id = request_id, data = data })
                test.is_nil(accepted.error)
                assert(request(a, { action = 'open' }).value)
                assert(request(a, { action = 'run' }).value)
                local done = request(a, { action = 'idle' }).value
                test.eq(done.calls, mode == 'valid' and 1 or 0)
                test.eq(done.snapshot.dispatches[1].state, mode == 'valid' and 'completed' or 'interrupted')
                if mode ~= 'valid' then test.eq(done.snapshot.dispatches[1].terminal_code, 'DISPATCH_HANDLER_FAILED') end
                local retry = request(a, { action = 'accept', request_id = request_id, data = data })
                test.is_true(retry.value.duplicate)
                test.eq(retry.value.message_id, accepted.value.message_id)
                test.eq(request(a, { action = 'stats' }).value.calls, done.calls)
                stop(a)
            end
        end)
        it('preserves terminal behavior for prompt model and descendant errors', function()
            for _, mode in ipairs({ 'prompt_failure', 'model_failure', 'descendant_failure' }) do
                local actor, session_id = fixture()
                local a = worker(actor, session_id, { [mode] = true })
                accepted(a, 'failure ' .. mode)
                assert(request(a, { action = 'open' }).value)
                assert(request(a, { action = 'run' }).value)
                local done = request(a, { action = 'idle' }).value
                test.eq(done.snapshot.dispatches[1].state, 'interrupted')
                if mode == 'prompt_failure' then test.eq(done.calls, 0) end
                if mode == 'descendant_failure' then
                    local history = assert(messages.list_by_session(session_id))
                    local found = false
                    for _, message in ipairs(history.messages) do
                        if message.type == 'function' then found = true; test.eq(message.metadata.status, 'error') end
                    end
                    test.is_true(found)
                end
                stop(a)
            end
        end)
    end)
end

return test.run_cases(define_tests)
