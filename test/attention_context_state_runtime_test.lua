local test = require('test')
local time = require('time')
local uuid = require('uuid')
local security = require('security')
local contexts = require('context_repo')
local sessions = require('session_repo')
local boot = require('wait_for_boot')

local function define_tests()
    describe('Persisted per-session Attention context state', function()
        local workers, fixtures = {}, {}

        local function receive_result()
            local inbox, events = process.inbox(), process.events()
            local deadline = time.after('3s')
            while true do
                local selected = channel.select({ inbox:case_receive(), events:case_receive(), deadline:case_receive() })
                assert(selected.channel ~= deadline and selected.ok, 'attention state worker response timed out')
                if selected.channel == events then
                    workers[selected.value.from] = nil
                    error('attention state worker exited before response: ' .. tostring(selected.value.result and selected.value.result.error or 'normal exit'))
                end
                if selected.value:topic() == 'attention_state_result' then
                    return selected.value:payload():data()
                end
            end
        end

        local function spawn_worker(writer, session)
            local policy, policy_err = security.policy('app:context_transport_session_policy')
            assert(policy, tostring(policy_err or 'test session policy unavailable'))
            local scope = (security.scope() or security.new_scope()):with(policy)
            for _, policy_id in ipairs({ 'app:context_transport_env_policy', 'app:context_transport_db_policy',
                'app:context_transport_reply_policy' }) do
                local fixture_policy, fixture_policy_err = security.policy(policy_id)
                assert(fixture_policy, tostring(fixture_policy_err or 'test infrastructure policy unavailable'))
                scope = scope:with(fixture_policy)
            end
            local pid, err = process.with_context({}):with_actor(security.new_actor(uuid.v7(), {
                context_transport_reply_pid = process.pid(),
            })):with_scope(scope):spawn_monitored('app:attention_context_state_worker', 'app:processes', {
                writer = writer,
                session_id = session,
                reply_pid = process.pid(),
            })
            assert(pid, tostring(err or 'attention state worker spawn failed'))
            workers[pid] = true
            return pid
        end

        local function fixture()
            local actor, context_id, session = uuid.v7(), uuid.v7(), uuid.v7()
            assert(contexts.create(context_id, 'primary', 'Attention state lifecycle'))
            assert(sessions.create(session, actor, context_id, 'Attention state', 'test'))
            table.insert(fixtures, { context_id = context_id, session = session })
            return session
        end

        before_all(function() boot.run() end)

        after_each(function()
            for pid in pairs(workers) do process.send(pid, 'attention_state_stop', {}) end
            local deadline = time.after('3s')
            while next(workers) do
                local selected = channel.select({ process.events():case_receive(), deadline:case_receive() })
                assert(selected.channel ~= deadline and selected.ok, 'attention state worker cleanup timed out')
                workers[selected.value.from] = nil
            end
            for _, fixture_data in ipairs(fixtures) do
                sessions.delete(fixture_data.session)
                contexts.delete(fixture_data.context_id)
            end
            fixtures = {}
        end)

        it('commits one revision and returns current state for the stale concurrent writer', function()
            local session = fixture()
            local initial = assert(sessions.get(session))
            test.eq(initial.attention_context.revision, 0)
            test.is_false(initial.attention_context.enabled)

            local first_pid = spawn_worker('writer-a', session)
            local second_pid = spawn_worker('writer-b', session)
            local request = {
                session_id = session,
                enabled = true,
                expected_revision = initial.attention_context.revision,
                updated_by = 'runtime-test',
            }
            request.writer = 'writer-a'
            assert(process.send(first_pid, 'attention_state_request', request))
            request.writer = 'writer-b'
            assert(process.send(second_pid, 'attention_state_request', request))

            local results = { receive_result(), receive_result() }
            local committed, conflicts = 0, 0
            for _, result in ipairs(results) do
                if result.state then
                    committed = committed + 1
                    test.eq(result.state.revision, 1)
                    test.is_true(result.state.enabled)
                else
                    conflicts = conflicts + 1
                    test.eq(result.error, 'ATTENTION_CONTEXT_REVISION_CONFLICT')
                    test.eq(result.current.revision, 1)
                    test.is_true(result.current.enabled)
                end
            end
            test.eq(committed, 1)
            test.eq(conflicts, 1)

            local final = assert(sessions.get(session))
            test.eq(final.attention_context.revision, 1)
            test.is_true(final.attention_context.enabled)
            test.eq(final.attention_context.updated_by, 'runtime-test')
        end)
    end)
end

return test.run_cases(define_tests)
