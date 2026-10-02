local test = require('test')
local time = require('time')
local uuid = require('uuid')
local hash = require('hash')
local sql = require('sql')
local security = require('security')
local contexts = require('context_repo')
local sessions = require('session_repo')
local messages = require('message_repo')
local attachments = require('context_attachments')
local staging = require('context_staging_repo')
local consts = require('consts')
local boot = require('wait_for_boot')

local function define_tests()
    describe('Context transport real process and SQL lifecycle', function()
        local workers, fixtures = {}, {}
        local function receive(topic, from, request_id)
            local deadline = time.after('3s')
            local inbox, events = process.inbox(), process.events()
            while true do
                local selected = channel.select({ inbox:case_receive(), events:case_receive(), deadline:case_receive() })
                assert(selected.channel ~= deadline and selected.ok, 'context process response timed out')
                if selected.channel == events then
                    workers[selected.value.from] = nil
                    error('worker exited before response: ' .. tostring(selected.value.result and selected.value.result.error or 'normal exit'))
                end
                local msg = selected.value
                local data = msg:payload():data()
                if msg:topic() == topic and (not from or msg:from() == from) and (not request_id or data.request_id == request_id) then return data, msg:from() end
            end
        end
        local function fixture()
            local actor, context_id, session = uuid.v7(), uuid.v7(), uuid.v7()
            assert(contexts.create(context_id, 'primary', 'Context transport lifecycle'))
            assert(sessions.create(session, actor, context_id, 'Transport lifecycle', 'test'))
            table.insert(fixtures, { session = session, context_id = context_id })
            return actor, session
        end
        local function worker(actor, session, entry)
            local policy, policy_err = security.policy('app:context_transport_session_policy')
            assert(policy, tostring(policy_err or 'test session policy unavailable'))
            local scope = (security.scope() or security.new_scope()):with(policy)
            for _, policy_id in ipairs({ 'app:context_transport_env_policy', 'app:context_transport_db_policy',
                'app:context_transport_reply_policy', 'app:context_transport_name_policy' }) do
                local fixture_policy, policy_err = security.policy(policy_id)
                assert(fixture_policy, tostring(policy_err or 'test infrastructure policy unavailable'))
                scope = scope:with(fixture_policy)
            end
            local pid, err = process.with_context({}):with_actor(security.new_actor(actor, { context_transport_reply_pid = process.pid() }))
                :with_scope(scope)
                :spawn_monitored(entry or 'app:context_transport_worker', 'app:processes', {
                    user_id = actor, session_id = session, reply_pid = process.pid(), parent_pid = process.pid(), conn_pid = process.pid(),
                })
            assert(pid, tostring(err or 'worker spawn failed'))
            workers[pid] = entry or 'app:context_transport_worker'
            if not entry then
                local ready = receive('context_worker_ready', pid)
                assert(ready.authorized, ready.reason or 'worker authorization missing')
            end
            return pid
        end
        local function stop(pid)
            assert(process.send(pid, 'context_worker_stop', {}))
            local deadline = time.after('3s')
            while true do
                local selected = channel.select({ process.events():case_receive(), deadline:case_receive() })
                assert(selected.channel ~= deadline and selected.ok, 'worker exit timed out')
                if selected.value.from == pid then test.is_nil(selected.value.result.error); break end
            end
            workers[pid] = nil
        end
        local function send(pid, request)
            assert(process.send(pid, 'context_worker_request', request))
            return receive('context_worker_result', pid)
        end
        local function context_array(target_bytes)
            local padding = 0
            for _ = 1, 5 do
                local content = attachments.canonical_json({ subject = 'target', text = string.char(34, 10, 92, 197, 188) .. string.rep('a', padding) })
                local array = { { attachment_id = 'runtime-context', kind = 'example.context', version = 1,
                    created_at = time.now():utc():format_rfc3339(), content_type = 'application/json', content = content,
                    content_bytes = #content, content_hash = 'sha256:' .. hash.sha256(content) } }
                local bytes = #attachments.canonical_json(array)
                if not target_bytes or bytes == target_bytes then return array end
                padding = padding + target_bytes - bytes
            end
            error('full envelope fixture did not converge')
        end
        before_all(function() boot.run() end)
        after_each(function()
            for pid, entry in pairs(workers) do
                process.send(pid, entry == 'app:context_transport_worker' and 'context_worker_stop' or consts.TOPICS.FINISH_AND_EXIT, {})
            end
            local deadline = time.after('3s')
            while next(workers) do
                local selected = channel.select({ process.events():case_receive(), deadline:case_receive() })
                assert(selected.channel ~= deadline and selected.ok, 'fixture worker cleanup timed out')
                workers[selected.value.from] = nil
            end
            for _, fixture in ipairs(fixtures) do sessions.delete(fixture.session); contexts.delete(fixture.context_id) end
            fixtures = {}
        end)
        it('answers capability probe from the actual Session receiver without persisting a message', function()
            local actor, session = fixture()
            local pid = worker(actor, session, 'wippy.session.process:session')
            local req_id = uuid.v7()
            assert(process.send(pid, consts.TOPICS.COMMAND, { command = 'context_transport_capabilities', request_id = req_id, conn_pid = process.pid() }))
            local response = receive(consts.TOPIC_PREFIXES.SESSION .. session, pid, req_id)
            test.is_true(response.success)
            test.eq(response.context_attachments_transport.version, 1)
            test.eq(response.context_attachments_transport.max_context_bytes, 32768)
            test.eq(select(2, messages.get_by_request_id(session, req_id)), 'Message request not found')
        end)
        it('validates context capability versions without persisting messages', function()
            local actor, session = fixture()
            local pid = worker(actor, session, 'wippy.session.process:session')
            for _, version in ipairs({ 1, 2, '1' }) do
                local req_id = uuid.v7()
                assert(process.send(pid, consts.TOPICS.COMMAND, { command = 'context_transport_capabilities',
                    capabilities_version = version, request_id = req_id, conn_pid = process.pid() }))
                local response = receive(consts.TOPIC_PREFIXES.SESSION .. session, pid, req_id)
                test.eq(response.success, version == 1)
                if version == 1 then
                    test.eq(attachments.canonical_json(response.context_attachments_capabilities), attachments.canonical_json(attachments.capabilities()))
                else test.eq(response.code, 'INVALID_CAPABILITIES_VERSION') end
            end
            test.eq(#assert(messages.list_by_session(session)).messages, 0)
        end)
        it('opens with existing session updates and no dispatch extension', function()
            local actor, session = fixture()
            local pid = worker(actor, session, 'wippy.session.process:session')
            local topic = consts.TOPIC_PREFIXES.SESSION .. session
            local initial = receive(topic, pid)
            test.is_nil(initial.dispatch_protocol)
            test.is_nil(initial.dispatch_snapshot)
            test.eq(#assert(messages.list_by_session(session)).messages, 0)
        end)
        it('hydrates once and acknowledges the original server message after worker restart and stage cleanup', function()
            for _, referenced in ipairs({ false, true }) do
                local actor, session = fixture()
                local req_id = uuid.v7()
                local payload = { schema = 'wippy.attention.v2', snapshot_id = 'runtime-v2', host_instance_id = 'runtime-host', mount_generation = 1,
                    created_at = '2026-09-04T12:00:00Z', coordinate_space = { kind = 'host-viewport', width = 800, height = 600, device_pixel_ratio = 1 },
                    capture = { radius_css_px = 20, grid_step_css_px = 5, sampled_points = 0, points = {}, duration_ms = 0, complete = true },
                    path_dictionary = {}, candidates = {}, recent_events = {}, omissions = {} }
                local content = attachments.canonical_json(payload)
                local array = { { attachment_id = 'runtime-compact', kind = 'wippy.attention', version = 2,
                    created_at = payload.created_at, content_type = 'application/json', content = content,
                    content_bytes = #content, content_hash = 'sha256:' .. hash.sha256(content) } }
                local canonical = attachments.canonical_json(array)
                local data = { text = 'Compact context', file_uuids = {}, context_attachments = array }
                if referenced then
                    local staged = assert(staging.create(actor, session, req_id, canonical, time.now():unix() + 60))
                    data.context_attachments, data.context_attachments_ref = nil, staged.context_attachments_ref
                end
                local pid = worker(actor, session)
                local bad_request = uuid.v7()
                local bad_content = assert(content):gsub('wippy.attention.v2', 'wippy.attention.v1')
                local bad_array = { { attachment_id = 'runtime-invalid-compact', kind = 'wippy.attention', version = 2,
                    created_at = payload.created_at, content_type = 'application/json', content = bad_content,
                    content_bytes = #bad_content, content_hash = 'sha256:' .. hash.sha256(bad_content) } }
                local bad_data = { text = 'Invalid compact context', file_uuids = {}, context_attachments = bad_array }
                if referenced then
                    local bad_stage = assert(staging.create(actor, session, bad_request, attachments.canonical_json(bad_array), time.now():unix() + 60))
                    bad_data.context_attachments, bad_data.context_attachments_ref = nil, bad_stage.context_attachments_ref
                end
                local rejected = send(pid, { request_id = bad_request, data = bad_data })
                test.is_true(rejected.value.rejected)
                test.eq(select(2, messages.get_by_request_id(session, bad_request)), 'Message request not found')
                local first = send(pid, { request_id = req_id, data = data })
                test.is_nil(first.error)
                test.eq(#first.value.next_ops, 1)
                test.eq(attachments.canonical_json(messages.get(first.value.message_id).metadata.context_attachments), canonical)
                stop(pid)
                if referenced then
                    local db = assert(sql.get(consts.get_db_resource()))
                    assert(db:execute('UPDATE context_stages SET expires_at = 0 WHERE session_id = $1', { session }))
                    db:release(); assert(staging.cleanup())
                end
                pid = worker(actor, session)
                local retry = send(pid, { request_id = req_id, data = data })
                test.is_true(retry.value.duplicate)
                test.eq(retry.value.message_id, first.value.message_id)
                test.is_nil(retry.value.next_ops)
                test.eq(#retry.echoes, 1)
                test.eq(retry.echoes[1].message_id, first.value.message_id)
                test.eq(#retry.acknowledgements, 0)
            end
        end)
        it('hydrates generic full-quota context once after worker restart and stage cleanup', function()
            local actor, session = fixture()
            local req_id = uuid.v7()
            local array = context_array(32768)
            local staged = assert(staging.create(actor, session, req_id, attachments.canonical_json(array), time.now():unix() + 60))
            local request = { request_id = req_id, data = { text = 'What is this?', file_uuids = {}, context_attachments_ref = staged.context_attachments_ref } }
            local first_pid = worker(actor, session)
            local first = send(first_pid, request)
            test.is_nil(first.error)
            test.eq(#first.value.next_ops, 1)
            test.eq(#first.echoes, 1)
            local original_id = first.value.message_id
            test.eq(#attachments.canonical_json(messages.get(original_id).metadata.context_attachments), 32768)
            test.eq(#first.acknowledgements, 0)
            test.eq(first.echoes[1].message_id, original_id)
            stop(first_pid)
            local db = assert(sql.get(consts.get_db_resource()))
            assert(db:execute('UPDATE context_stages SET expires_at = 0 WHERE session_id = $1', { session }))
            db:release()
            assert(staging.cleanup())
            local second_pid = worker(actor, session)
            local retry = send(second_pid, request)
            test.is_nil(retry.error)
            test.is_true(retry.value.duplicate)
            test.eq(retry.value.message_id, original_id)
            test.is_nil(retry.value.next_ops)
            test.eq(#retry.echoes, 1)
            test.eq(#retry.acknowledgements, 0)
            test.eq(retry.echoes[1].message_id, original_id)
            test.eq(retry.echoes[1].attachments[1].content_hash, array[1].content_hash)
            test.is_nil(messages.get(original_id).context_receipt)
            local history = assert(messages.list_by_session(session))
            local public_json = attachments.canonical_json(history)
            test.is_nil(string.find(public_json, 'context_receipt', 1, true))
            test.is_nil(string.find(public_json, staged.context_attachments_ref.id, 1, true))
            request.data.text = 'Changed retry'
            local changed = send(second_pid, request)
            test.is_true(changed.value.rejected)
            test.eq(changed.acknowledgements[1].code, consts.ERROR_CODES.REQUEST_CONFLICT)
            test.eq(#changed.echoes, 0)
        end)
        it('rejects dual carriers tampered references expiry and foreign actor or request without a turn', function()
            local actor, session = fixture()
            local req_id = uuid.v7()
            local array = context_array()
            local staged = assert(staging.create(actor, session, req_id, attachments.canonical_json(array), time.now():unix() + 60))
            local pid = worker(actor, session)
            local dual = send(pid, { request_id = req_id, data = { text = 'No turn', context_attachments = array, context_attachments_ref = staged.context_attachments_ref } })
            test.is_true(dual.value.rejected)
            test.eq(dual.acknowledgements[1].code, 'INVALID_CONTEXT_REFERENCE')
            local ref = staged.context_attachments_ref
            local original_hash = ref.content_hash
            ref.content_hash = 'sha256:' .. string.rep('a', 64)
            test.is_true(send(pid, { request_id = req_id, data = { context_attachments_ref = ref } }).value.rejected)
            ref.content_hash = original_hash
            test.is_true(send(pid, { request_id = uuid.v7(), data = { context_attachments_ref = ref } }).value.rejected)
            local other_actor, other_session = fixture()
            local other = worker(other_actor, other_session)
            test.is_true(send(other, { request_id = req_id, data = { context_attachments_ref = ref } }).value.rejected)
            local db = assert(sql.get(consts.get_db_resource()))
            assert(db:execute('UPDATE context_stages SET expires_at = 0 WHERE id = $1', { ref.id }))
            db:release()
            test.is_true(send(pid, { request_id = req_id, data = { context_attachments_ref = ref } }).value.rejected)
            test.eq(select(2, messages.get_by_request_id(session, req_id)), 'Message request not found')
        end)
        it('serializes concurrent contenders for the last available session quota slot', function()
            local actor, session = fixture()
            for i = 1, staging.MAX_SESSION - 1 do assert(staging.create(actor, session, 'prefill-' .. i, '[]', time.now():unix() + 60)) end
            local pids = {}
            for i = 1, 4 do pids[i] = worker(actor, session) end
            for i, pid in ipairs(pids) do
                assert(process.send(pid, 'context_worker_request', { action = 'create', request_id = 'race-' .. i, canonical = '[]', expiry = time.now():unix() + 60 }))
            end
            local accepted, rejected = 0, 0
            for _ = 1, 4 do
                local result = receive('context_worker_result')
                if result.value then accepted = accepted + 1 else test.eq(result.error, 'CONTEXT_STAGE_QUOTA'); rejected = rejected + 1 end
            end
            test.eq(accepted, 1)
            test.eq(rejected, 3)
        end)
        it('does not charge retained committed rows against pending staging capacity', function()
            local actor, session = fixture()
            for i = 1, staging.MAX_SESSION do
                local request_id = 'committed-capacity-' .. i
                local staged = assert(staging.create(actor, session, request_id, '[]', time.now():unix() + 60))
                local fingerprint = 'sha256:' .. hash.sha256(request_id)
                local receipt = { actor_id = actor, reference = staged.context_attachments_ref }
                assert(messages.create(uuid.v7(), session, 'user', request_id, { context_attachments = {} },
                    request_id, fingerprint, receipt))
            end
            local next_stage, err = staging.create(actor, session, 'next-pending', '[]', time.now():unix() + 60)
            test.is_nil(err)
            test.not_nil(next_stage)
        end)
        it('accepts concurrent identical sends once with one agent step and one stable server message ID', function()
            local actor, session = fixture()
            local request_id = uuid.v7()
            local stage = assert(staging.create(actor, session, request_id, attachments.canonical_json(context_array()), time.now():unix() + 60))
            local a, b = worker(actor, session), worker(actor, session)
            local request = { request_id = request_id, data = { text = 'Concurrent send', context_attachments_ref = stage.context_attachments_ref } }
            assert(process.send(a, 'context_worker_request', request))
            assert(process.send(b, 'context_worker_request', request))
            local first, second = receive('context_worker_result'), receive('context_worker_result')
            test.is_nil(first.error); test.is_nil(second.error)
            test.eq(first.value.message_id, second.value.message_id)
            test.eq(#(first.value.next_ops or {}) + #(second.value.next_ops or {}), 1)
            test.eq(#first.echoes, 1)
            test.eq(#second.echoes, 1)
            test.eq(first.echoes[1].message_id, second.echoes[1].message_id)
            test.eq(first.echoes[1].request_id, request_id)
            test.eq(#first.acknowledgements + #second.acknowledgements, 0)
        end)
        it('cancellation concurrent with acceptance never loses accepted context or produces a partial message', function()
            local actor, session = fixture()
            local request_id = uuid.v7()
            local stage = assert(staging.create(actor, session, request_id, attachments.canonical_json(context_array()), time.now():unix() + 60))
            local a, b = worker(actor, session), worker(actor, session)
            assert(process.send(a, 'context_worker_request', { sequence = 'accept', request_id = request_id, data = { text = 'Cancel race', context_attachments_ref = stage.context_attachments_ref } }))
            assert(process.send(b, 'context_worker_request', { sequence = 'cancel', action = 'cancel', request_id = request_id, id = stage.context_attachments_ref.id }))
            local responses = {}
            for _ = 1, 2 do local response = receive('context_worker_result'); responses[response.sequence] = response end
            test.is_true(responses.cancel.value)
            local stored, lookup_err = messages.get_by_request_id(session, request_id)
            if stored then
                test.eq(responses.accept.value.message_id, stored.message_id)
                test.is_true(type(stored.metadata.context_attachments) == 'table')
                test.eq(stored.context_receipt.reference.id, stage.context_attachments_ref.id)
            else
                test.eq(lookup_err, 'Message request not found')
                test.is_true(responses.accept.value and responses.accept.value.rejected or responses.accept.error ~= nil)
            end
            local next_turn = send(a, { request_id = uuid.v7(), data = { text = 'Session still usable' } })
            test.is_nil(next_turn.error)
            test.eq(#next_turn.value.next_ops, 1)
        end)
        it('committed receipt wins cancellation or expiry but not deletion after a second request has hydrated', function()
            for _, mutation in ipairs({ 'cancel', 'expire', 'delete' }) do
                local actor, session = fixture()
                local request_id = uuid.v7()
                local stage = assert(staging.create(actor, session, request_id, attachments.canonical_json(context_array()), time.now():unix() + 60))
                local a, b = worker(actor, session), worker(actor, session)
                local data = { text = 'Barrier duplicate', context_attachments_ref = stage.context_attachments_ref }
                assert(process.send(a, 'context_worker_request', { request_id = request_id, data = data, pause_before_commit = true }))
                receive('context_worker_before_commit', a)
                local committed = send(b, { request_id = request_id, data = data })
                test.is_nil(committed.error)
                test.eq(#committed.value.next_ops, 1)
                if mutation == 'cancel' then
                    assert(staging.cancel(actor, session, request_id, stage.context_attachments_ref.id))
                elseif mutation == 'delete' then
                    assert(sessions.delete(session))
                else
                    local db = assert(sql.get(consts.get_db_resource()))
                    assert(db:execute('UPDATE context_stages SET expires_at = 0 WHERE id = $1', { stage.context_attachments_ref.id }))
                    db:release()
                    assert(staging.cleanup())
                end
                assert(process.send(a, 'context_worker_continue', {}))
                local duplicate = receive('context_worker_result', a)
                test.is_nil(duplicate.error)
                if mutation == 'delete' then
                    test.is_true(duplicate.value.rejected)
                    test.eq(duplicate.acknowledgements[1].code, 'CONTEXT_SESSION_UNAVAILABLE')
                    test.eq(select(2, messages.get_by_request_id(session, request_id)), 'Message request not found')
                else
                    test.is_true(duplicate.value.duplicate)
                    test.eq(duplicate.value.message_id, committed.value.message_id)
                end
                test.is_nil(duplicate.value.next_ops)
                test.eq(#duplicate.echoes, mutation == 'delete' and 0 or 1)
                stop(a); stop(b)
            end
        end)
        it('cancellation expiry and deletion before the first commit never revive a hydrated request', function()
            for _, mutation in ipairs({ 'cancel', 'expire', 'delete' }) do
                local actor, session = fixture()
                local request_id = uuid.v7()
                local stage = assert(staging.create(actor, session, request_id, attachments.canonical_json(context_array()), time.now():unix() + 60))
                local a = worker(actor, session)
                assert(process.send(a, 'context_worker_request', { request_id = request_id,
                    data = { text = 'Barrier rejection', context_attachments_ref = stage.context_attachments_ref }, pause_before_commit = true }))
                receive('context_worker_before_commit', a)
                if mutation == 'cancel' then assert(staging.cancel(actor, session, request_id, stage.context_attachments_ref.id))
                elseif mutation == 'delete' then assert(sessions.delete(session))
                else
                    local db = assert(sql.get(consts.get_db_resource()))
                    assert(db:execute('UPDATE context_stages SET expires_at = 0 WHERE id = $1', { stage.context_attachments_ref.id }))
                    db:release()
                end
                assert(process.send(a, 'context_worker_continue', {}))
                local rejected = receive('context_worker_result', a)
                test.is_nil(rejected.error)
                test.is_true(rejected.value.rejected)
                test.is_nil(rejected.value.next_ops)
                test.eq(select(2, messages.get_by_request_id(session, request_id)), 'Message request not found')
                stop(a)
            end
        end)
        it('session deletion concurrent with staging leaves no stage or accepted retry authority', function()
            local actor, session = fixture()
            local a, b = worker(actor, session), worker(actor, session)
            assert(process.send(a, 'context_worker_request', { sequence = 'stage', action = 'create', request_id = 'delete-race', canonical = '[]', expiry = time.now():unix() + 60 }))
            assert(process.send(b, 'context_worker_request', { sequence = 'delete', action = 'delete' }))
            local responses = {}
            for _ = 1, 2 do local response = receive('context_worker_result'); responses[response.sequence] = response end
            test.is_true(responses.delete.value.deleted)
            local db = assert(sql.get(consts.get_db_resource()))
            local rows = assert(sql.builder.select('id'):from('context_stages'):where('session_id = ?', session):run_with(db):query())
            db:release()
            test.eq(#rows, 0)
            test.eq(select(2, staging.create(actor, session, 'after-delete', '[]', time.now():unix() + 60)), 'CONTEXT_SESSION_UNAVAILABLE')
        end)
    end)
end

return test.run_cases(define_tests)
