local test = require('test')
local time = require('time')
local uuid = require('uuid')
local sql = require('sql')
local security = require('security')
local contexts = require('context_repo')
local sessions = require('session_repo')
local staging = require('context_staging_repo')
local cleanup = require('context_cleanup')
local consts = require('consts')
local boot = require('wait_for_boot')

local function define_tests()
    describe('Session context cleanup without active user sessions', function()
        local fixtures, worker_pid = {}, nil
        local original_sweep = cleanup._sweep
        local function stages(count)
            local actor, context_id, session
            for i = 1, count do
                if (i - 1) % staging.MAX_SESSION == 0 then
                    actor, context_id, session = uuid.v7(), uuid.v7(), uuid.v7()
                    assert(contexts.create(context_id, 'primary', 'Cleanup lifecycle'))
                    assert(sessions.create(session, actor, context_id, 'Cleanup lifecycle', 'test'))
                    table.insert(fixtures, { session = session, context_id = context_id })
                end
                assert(staging.create(actor, session, 'idle-' .. i, '[]', time.now():unix() + 60))
            end
        end
        local function expire()
            local db = assert(sql.get(consts.get_db_resource()))
            for _, fixture in ipairs(fixtures) do
                assert(db:execute('UPDATE context_stages SET expires_at = 0 WHERE session_id = $1', { fixture.session }))
            end
            db:release()
        end
        local function remaining()
            local db = assert(sql.get(consts.get_db_resource()))
            local count = 0
            for _, fixture in ipairs(fixtures) do
                local rows = assert(sql.builder.select('id'):from('context_stages'):where('session_id = ?', fixture.session):run_with(db):query())
                count = count + #rows
            end
            db:release()
            return count
        end
        local function start(fail_first)
            local scope = security.new_scope()
            for _, policy_id in ipairs({ 'wippy.session.process:context_cleanup_env_policy',
                'wippy.session.process:context_cleanup_db_policy', 'app:context_transport_reply_policy' }) do
                scope = scope:with(assert(security.policy(policy_id)))
            end
            local pid, err = process.with_context({}):with_actor(security.new_actor('session.context_cleanup', { context_transport_reply_pid = process.pid() }))
                :with_scope(scope):spawn_monitored('app:context_cleanup_worker', 'app:processes', { reply_pid = process.pid(), fail_first = fail_first })
            assert(pid, err or 'cleanup spawn failed')
            worker_pid = pid
        end
        local function sweep_result()
            local inbox, events, deadline = process.inbox(), process.events(), time.after('3s')
            while true do
                local selected = channel.select({ inbox:case_receive(), events:case_receive(), deadline:case_receive() })
                assert(selected.ok and selected.channel ~= deadline, 'cleanup sweep timed out')
                assert(selected.channel ~= events, 'cleanup exited before sweep')
                if selected.value:from() == worker_pid and selected.value:topic() == 'cleanup_sweep' then
                    local result = selected.value:payload():data()
                    if result.diagnostics then
                        test.is_true(result.diagnostics.env_allowed)
                        test.is_true(result.diagnostics.db_allowed)
                        test.is_true(result.diagnostics.resource_present)
                        test.is_false(result.diagnostics.env_error)
                        test.is_false(result.diagnostics.db_error)
                        test.is_false(result.diagnostics.foreign_db_allowed)
                        test.is_false(result.diagnostics.session_write_allowed)
                    end
                    return result
                end
            end
        end
        local function stop()
            assert(process.cancel(worker_pid, '1s'))
            local events, deadline = process.events(), time.after('2s')
            while true do
                local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                assert(selected.ok and selected.channel ~= deadline, 'cleanup cancellation timed out')
                if selected.value.from == worker_pid then
                    test.is_nil(selected.value.result.error)
                    worker_pid = nil
                    break
                end
            end
        end
        before_all(function() boot.run() end)
        after_each(function()
            cleanup._sweep = original_sweep
            if worker_pid then stop() end
            for _, fixture in ipairs(fixtures) do sessions.delete(fixture.session); contexts.delete(fixture.context_id) end
            fixtures = {}
        end)
        it('limits one maintenance pass to the fixed global-cap batch budget', function()
            local calls = 0
            cleanup._sweep = function() calls = calls + 1; return staging.CLEANUP_BATCH end
            test.eq(cleanup.sweep(), cleanup.MAX_BATCHES * staging.CLEANUP_BATCH)
            test.eq(calls, 11)
            cleanup._sweep = function() return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
            test.eq(select(2, cleanup.sweep()), 'CONTEXT_STAGING_UNAVAILABLE')
        end)
        it('removes more than one batch immediately and later idle expirations without a user plugin', function()
            stages(104); expire(); start(false)
            local removed = 0
            for _ = 1, 2 do local result = sweep_result(); test.is_false(result.unavailable); removed = removed + result.count end
            test.eq(removed, 104)
            test.eq(remaining(), 0)
            stages(1); expire()
            local result = sweep_result()
            test.is_false(result.unavailable)
            test.eq(result.count, 1)
            test.eq(remaining(), 0)
            stop()
        end)
        it('retries migration-not-ready and removes expired rows after maintenance process restart', function()
            stages(1); expire(); start(true)
            test.is_true(sweep_result().unavailable)
            local recovered = sweep_result()
            test.is_false(recovered.unavailable)
            test.eq(recovered.count, 1)
            stop()
            stages(1); expire(); start(false)
            local restarted = sweep_result()
            test.is_false(restarted.unavailable)
            test.eq(restarted.count, 1)
            test.eq(remaining(), 0)
            stop()
        end)
    end)
end

return test.run_cases(define_tests)
