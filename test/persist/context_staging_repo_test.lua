local test = require('test')
local uuid = require('uuid')
local time = require('time')
local hash = require('hash')
local staging = require('context_staging_repo')
local attachments = require('context_attachments')
local contexts = require('context_repo')
local sessions = require('session_repo')
local messages = require('message_repo')
local boot = require('wait_for_boot')
local sql = require('sql')
local consts = require('consts')

local function define_tests()
    describe('Private context staging SQL', function()
        local fixtures = {}
        local original_now = staging._now
        local function fixture()
            local actor, context_id, session = uuid.v7(), uuid.v7(), uuid.v7()
            test.is_nil(select(2, contexts.create(context_id, 'primary', 'staging test')))
            test.is_nil(select(2, sessions.create(session, actor, context_id, 'Staging test', 'test')))
            table.insert(fixtures, { session = session, context_id = context_id })
            return actor, session
        end
        before_all(function() boot.run() end)
        after_each(function() staging._now = original_now end)
        after_all(function()
            for _, fixture in ipairs(fixtures) do
                test.is_nil(select(2, sessions.delete(fixture.session)))
                test.is_nil(select(2, contexts.delete(fixture.context_id)))
            end
        end)
        it('stages full quota bytes and deduplicates the same bound request', function()
            local actor, session = fixture()
            local canonical = '[' .. string.char(34) .. string.rep('a', 32764) .. string.char(34) .. ']'
            local staged, err = staging.create(actor, session, 'request-full', canonical, time.now():unix() + 60)
            test.is_nil(err)
            test.eq(staged.context_attachments_ref.content_bytes, 32768)
            local same = staging.create(actor, session, 'request-full', canonical, time.now():unix() + 60)
            test.eq(same.context_attachments_ref.id, staged.context_attachments_ref.id)
            local resolved = staging.resolve(actor, session, 'request-full', staged.context_attachments_ref)
            test.eq(#resolved[1], 32764)
        end)
        it('checks committed receipt identity and fingerprint before expired stage freshness under the lock', function()
            local actor, session = fixture()
            local request_id, fingerprint = 'receipt-order', 'sha256:' .. hash.sha256('receipt-order')
            local stage = assert(staging.create(actor, session, request_id, '[]', time.now():unix() + 60))
            local receipt = { actor_id = actor, reference = stage.context_attachments_ref }
            local committed = assert(messages.create(uuid.v7(), session, 'user', 'Stored once', {}, request_id, fingerprint, receipt))
            assert(staging.cancel(actor, session, request_id, receipt.reference.id))
            local duplicate = assert(messages.create(uuid.v7(), session, 'user', 'Stored once', {}, request_id, fingerprint, receipt))
            test.is_true(duplicate.duplicate)
            test.eq(duplicate.message_id, committed.message_id)
            test.eq(select(2, messages.create(uuid.v7(), session, 'user', 'Changed', {}, request_id, 'sha256:' .. hash.sha256('changed'), receipt)), 'Request ID conflict')
            local original_id = receipt.reference.id
            receipt.reference.id = uuid.v7()
            test.eq(select(2, messages.create(uuid.v7(), session, 'user', 'Stored once', {}, request_id, fingerprint, receipt)), 'INVALID_CONTEXT_REFERENCE')
            receipt.reference.id = original_id
            receipt.actor_id = uuid.v7()
            test.eq(select(2, messages.create(uuid.v7(), session, 'user', 'Stored once', {}, request_id, fingerprint, receipt)), 'CONTEXT_SESSION_UNAVAILABLE')
        end)
        it('rejects oversize content and changed request content', function()
            local actor, session = fixture()
            local staged = staging.create(actor, session, 'request-1', '[]', time.now():unix() + 60)
            test.is_true(staged ~= nil)
            test.eq(select(2, staging.create(actor, session, 'request-1', '[1]', time.now():unix() + 60)), 'CONTEXT_STAGE_CONFLICT')
            test.eq(select(2, staging.create(actor, session, 'request-2', string.rep('a', 32769), time.now():unix() + 60)), 'INVALID_CONTEXT_STAGE')
        end)
        it('binds references to actor session request hash and bytes', function()
            local actor, session = fixture()
            local staged = staging.create(actor, session, 'request-1', '[]', time.now():unix() + 60)
            local ref = staged.context_attachments_ref
            test.eq(select(2, staging.resolve('other', session, 'request-1', ref)), 'CONTEXT_REFERENCE_UNAVAILABLE')
            test.eq(select(2, staging.resolve(actor, 'other', 'request-1', ref)), 'CONTEXT_REFERENCE_UNAVAILABLE')
            test.eq(select(2, staging.resolve(actor, session, 'other', ref)), 'CONTEXT_REFERENCE_UNAVAILABLE')
            ref.content_bytes = 3
            test.eq(select(2, staging.resolve(actor, session, 'request-1', ref)), 'INVALID_CONTEXT_REFERENCE')
        end)
        it('cancels privately and retains quota tombstones until expiry', function()
            local actor, session = fixture()
            for i = 1, staging.MAX_SESSION do
                local staged = staging.create(actor, session, 'request-' .. i, '[]', time.now():unix() + 60)
                test.is_true(staging.cancel(actor, session, 'request-' .. i, staged.context_attachments_ref.id))
                test.eq(select(2, staging.resolve(actor, session, 'request-' .. i, staged.context_attachments_ref)), 'CONTEXT_REFERENCE_UNAVAILABLE')
            end
            test.eq(select(2, staging.create(actor, session, 'excess', '[]', time.now():unix() + 60)), 'CONTEXT_STAGE_QUOTA')
            staging._now = function() return original_now() + 61 end
            local swept, err = staging.cleanup()
            test.is_nil(err)
            test.is_true(swept >= staging.MAX_SESSION and swept <= staging.CLEANUP_BATCH)
        end)
        it('persists private receipt atomically and does not expose it through ordinary get', function()
            local actor, session = fixture()
            local staged = staging.create(actor, session, 'request-1', '[]', time.now():unix() + 60)
            local receipt = { actor_id = actor, reference = staged.context_attachments_ref }
            local msg_id = uuid.v7()
            local result, err = messages.create(msg_id, session, 'user', 'question', { context_attachments = {} }, 'request-1', 'sha256:' .. hash.sha256('fingerprint'), receipt)
            test.is_nil(err)
            if type(result) ~= 'table' then error('Expected a committed message') end
            local committed = test.not_nil(result) :: {message_id: string}
            test.eq(committed.message_id, msg_id)
            test.is_nil(messages.get(msg_id).context_receipt)
            staging._now = function() return original_now() + 61 end
            staging.cleanup()
            local stored = messages.get_by_request_id(session, 'request-1')
            test.eq(stored.context_receipt.reference.id, receipt.reference.id)
            test.eq(stored.context_receipt.actor_id, actor)
        end)
        it('rechecks cancellation inside message transaction before any insert', function()
            local actor, session = fixture()
            local staged = staging.create(actor, session, 'request-1', '[]', time.now():unix() + 60)
            staging.cancel(actor, session, 'request-1', staged.context_attachments_ref.id)
            local result, err = messages.create(uuid.v7(), session, 'user', 'question', {}, 'request-1', 'sha256:' .. hash.sha256('fingerprint'), { actor_id = actor, reference = staged.context_attachments_ref })
            test.is_nil(result)
            test.eq(err, 'CONTEXT_REFERENCE_UNAVAILABLE')
            test.eq(select(2, messages.get_by_request_id(session, 'request-1')), 'Message request not found')
        end)
        it('reuses the original live stage but never recreates a locator after committed request stage expiry', function()
            local actor, session = fixture()
            local staged = assert(staging.create(actor, session, 'committed-request', '[]', time.now():unix() + 60))
            local receipt = { actor_id = actor, reference = staged.context_attachments_ref }
            assert(messages.create(uuid.v7(), session, 'user', 'committed', { context_attachments = {} },
                'committed-request', 'sha256:' .. hash.sha256('fingerprint'), receipt))
            local live = assert(staging.create(actor, session, 'committed-request', '[]', time.now():unix() + 60))
            test.eq(live.context_attachments_ref.id, staged.context_attachments_ref.id)
            staging._now = function() return original_now() + 61 end
            assert(staging.cleanup())
            local recreated, err = staging.create(actor, session, 'committed-request', '[]', staging._now() + 60)
            test.is_nil(recreated)
            test.eq(err, 'CONTEXT_STAGE_CONFLICT')
            local stored = assert(messages.get_by_request_id(session, 'committed-request'))
            test.eq(stored.context_receipt.reference.id, staged.context_attachments_ref.id)
            test.is_true(staging.create(actor, session, 'new-request', '[]', staging._now() + 60) ~= nil)
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
        it('stores plain user messages without the staging lock and keeps it for receipts', function()
            local actor, session = fixture()
            local staged = assert(staging.create(actor, session, 'guarded', '[]', time.now():unix() + 60))
            local receipt = { actor_id = actor, reference = staged.context_attachments_ref }
            local db = assert(sql.get(consts.get_db_resource()))
            assert(db:execute('UPDATE context_stage_guard SET id = 2 WHERE id = 1'))
            local ok, failure = pcall(function()
                local created, create_err = messages.create(uuid.v7(), session, 'user', 'plain create', {},
                    'plain-create', 'sha256:' .. hash.sha256('plain-create'))
                test.is_nil(create_err)
                test.not_nil(created)
                local admitted, admit_err = messages.admit(uuid.v7(), session, 'user', 'plain admit', {},
                    { status = consts.STATUS.RUNNING, meta = {} })
                test.is_nil(admit_err)
                test.not_nil(admitted)
                local guarded, guarded_err = messages.create(uuid.v7(), session, 'user', 'guarded', {},
                    'guarded', 'sha256:' .. hash.sha256('guarded'), receipt)
                test.is_nil(guarded)
                test.eq(guarded_err, 'CONTEXT_STAGING_UNAVAILABLE')
            end)
            local _, restore_err = db:execute('UPDATE context_stage_guard SET id = 1 WHERE id = 2')
            db:release()
            test.is_nil(restore_err)
            if not ok then error(failure, 0) end
        end)
        it('rejects unknown reference versions and extra fields', function()
            local ref = { version = 2, id = 'id', content_hash = 'sha256:' .. string.rep('a', 64), content_bytes = 2 }
            test.is_false(staging.valid_reference(ref))
            ref.version = 1
            ref.url = 'forbidden'
            test.is_false(staging.valid_reference(ref))
        end)
        it('never returns an expired same-request descriptor beyond the bounded cleanup batch', function()
            local clock = original_now()
            staging._now = function() return clock end
            local actor, session = fixture()
            local committed_actor, committed_session = fixture()
            local pending = assert(staging.create(actor, session, 'pending', '[]', clock + 60))
            local committed = assert(staging.create(committed_actor, committed_session, 'committed', '[]', clock + 60))
            assert(messages.create(uuid.v7(), committed_session, 'user', 'accepted', { context_attachments = {} },
                'committed', 'sha256:' .. hash.sha256('fingerprint'), { actor_id = committed_actor, reference = committed.context_attachments_ref }))
            -- Create more than one cleanup batch using legitimate per-session/per-actor quotas.
            local older_count = 0
            while older_count <= staging.CLEANUP_BATCH do
                local older_actor, older_session = fixture()
                for i = 1, staging.MAX_SESSION :: number do
                    assert(staging.create(older_actor, older_session, 'older-' .. i, '[]', clock + 10))
                    older_count = older_count + 1
                end
            end
            clock = clock + 61
            local reissued, committed_err = staging.create(committed_actor, committed_session, 'committed', '[]', clock + 60)
            test.is_nil(reissued)
            test.eq(committed_err, 'CONTEXT_STAGE_CONFLICT')
            local renewed, renew_err = staging.create(actor, session, 'pending', '[]', clock + 60)
            test.is_nil(renew_err)
            test.is_true(renewed.context_attachments_ref.id ~= pending.context_attachments_ref.id)
            test.is_true(time.parse(time.RFC3339, renewed.expires_at):unix() > clock)
            test.is_true(staging.resolve(actor, session, 'pending', renewed.context_attachments_ref) ~= nil)
            test.eq(select(2, staging.resolve(actor, session, 'pending', pending.context_attachments_ref)), 'CONTEXT_REFERENCE_UNAVAILABLE')
        end)
        it('keeps cancellation terminal while its tombstone is live and never revives the cancelled locator', function()
            local actor, session = fixture()
            local clock = original_now()
            staging._now = function() return clock end
            local staged = assert(staging.create(actor, session, 'cancelled', '[]', clock + 60))
            assert(staging.cancel(actor, session, 'cancelled', staged.context_attachments_ref.id))
            test.eq(select(2, staging.create(actor, session, 'cancelled', '[]', clock + 60)), 'CONTEXT_STAGE_CONFLICT')
            clock = clock + 61
            local fresh = assert(staging.create(actor, session, 'cancelled', '[]', clock + 60))
            test.is_true(fresh.context_attachments_ref.id ~= staged.context_attachments_ref.id)
            test.eq(select(2, staging.resolve(actor, session, 'cancelled', staged.context_attachments_ref)), 'CONTEXT_REFERENCE_UNAVAILABLE')
        end)
    end)
end

return test.run_cases(define_tests)
