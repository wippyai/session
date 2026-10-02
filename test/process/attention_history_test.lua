local test = require('test')
local history = require('attention_history')

local function define_tests()
    describe('Attention observation lifetime', function()
        local now = 1789732800 -- 2026-09-18T12:00:00Z
        local function user(id, attachments)
            return { message_id = id, type = 'user', data = 'Keep user text', metadata = {
                file_uuids = { 'ordinary-file' }, context_attachments = attachments,
            } }
        end
        local function observation(id, revision, args)
            return { message_id = id, type = 'private_function', data = args or '{"name":"Save"}', metadata = {
                registry_id = 'wippy.agent.tools:attention_find_semantic', function_name = 'attention_find_semantic',
                call_id = 'call-' .. id, status = 'success', provider_metadata = { retained = true },
                result = { schema = 'wippy.attention.model.v1', status = 'inspected', outcome = 'ok',
                    host = 'host', measured_at = '2026-09-18T12:00:00Z', revisions = { tree = revision or 1 },
                    nodes = { { 'canonical-node' } },
                },
            } }
        end
        it('retains active observations and replaces only prior-turn results while preserving audit bytes and pairing', function()
            local current = observation('tool')
            local rows = { user('first'), current }
            local projected, updates = history.prepare(rows, now + 1)
            test.eq(#updates, 0)
            test.eq(projected[2], current)
            rows[3] = user('next')
            projected, updates = history.prepare(rows, now + 2)
            test.eq(#updates, 1)
            test.eq(updates[1].message_id, 'tool')
            test.not_nil(projected[2].metadata.stale)
            test.eq(projected[2].metadata.call_id, current.metadata.call_id)
            test.eq(projected[2].metadata.result, current.metadata.result)
            test.eq(projected[2].metadata.provider_metadata, current.metadata.provider_metadata)
            test.is_nil((current.metadata :: any).stale)
        end)
        it('expires observations at the exact lifetime boundary without changing unrelated results', function()
            local current = observation('tool')
            local unrelated = observation('other')
            unrelated.metadata.registry_id = 'example.tools:find'
            local rows = { user('first'), current, unrelated }
            local _, updates = history.prepare(rows, now + 29)
            test.eq(#updates, 0)
            local projected
            projected, updates = history.prepare(rows, now + 30)
            test.eq(#updates, 1)
            test.eq(projected[3], unrelated)
            test.is_nil(projected[3].metadata.stale)
        end)
        it('withdraws replaced queries and changed revisions but keeps distinct pages at one revision', function()
            local rows = { user('first'), observation('old'), observation('replacement'), observation('page', 1, '{"name":"Save","continuation":"next"}') }
            local _, updates = history.prepare(rows, now + 1)
            test.eq(#updates, 1)
            test.eq(updates[1].message_id, 'old')
            rows[5] = observation('changed', 2, '{"name":"Cancel"}')
            _, updates = history.prepare(rows, now + 1)
            test.eq(#updates, 3)
        end)
        it('omits only known expired or prior-turn automatic context from the model view', function()
            local known = { kind = 'wippy.attention', version = 4, attachment_id = 'attention', created_at = '2026-09-18T12:00:00Z', content = 'immutable bytes' }
            local future = { kind = 'wippy.attention', version = 99, attachment_id = 'future' }
            local unrelated = { kind = 'example.context', version = 1, attachment_id = 'other' }
            local original = user('first', { known, future, unrelated })
            local projected = history.prepare({ original }, now + 29)
            test.eq(projected[1], original)
            projected = history.prepare({ original }, now + 30)
            test.eq(#projected[1].metadata.context_attachments, 2)
            test.eq(#original.metadata.context_attachments, 3)
            test.eq(projected[1].data, original.data)
            test.eq(projected[1].metadata.file_uuids, original.metadata.file_uuids)
            projected = history.prepare({ original, user('next') }, now + 1)
            test.eq(#projected[1].metadata.context_attachments, 2)
            projected = history.prepare({ original, observation('read') }, now + 1)
            test.eq(#projected[1].metadata.context_attachments, 2)
        end)
        it('preserves unrecognized result schemas and already withdrawn results', function()
            local unknown = observation('unknown')
            unknown.metadata.result.schema = 'wippy.attention.model.v99'
            local withdrawn = observation('withdrawn')
            withdrawn.metadata.stale = 'Already withdrawn'
            local projected, updates = history.prepare({ user('first'), unknown, withdrawn, user('next') }, now + 60)
            test.eq(#updates, 0)
            test.eq(projected[2], unknown)
            test.eq(projected[3], withdrawn)
        end)
        it('withdraws observations after browser interactions or any reported revision change', function()
            local first, changed = observation('first'), observation('changed', 1, '{"name":"Cancel"}')
            changed.metadata.result.revisions = { tree = 1, geometry = 2 }
            local _, updates = history.prepare({ user('first'), first, changed }, now + 1)
            test.eq(#updates, 1)
            test.eq(updates[1].message_id, 'first')
            local action = { type = 'private_function', message_id = 'action', metadata = {
                registry_id = 'wippy.agent.tools:ui_action_highlight', status = 'success', result = { status = 'confirmed' },
            } }
            _, updates = history.prepare({ user('first'), first, action }, now + 1)
            test.eq(#updates, 1)
            test.eq(updates[1].message_id, 'first')
        end)
    end)
end

return test.run_cases(define_tests)
