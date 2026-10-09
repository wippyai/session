local test = require('test')
local time = require('time')
local history = require('attention_history')

local function define_tests()
    describe('Attention observation lifetime', function()
        local now = 1789732800 -- 2026-09-18T12:00:00Z
        -- Row dates as Session writes them: server-local time with its offset.
        local function row_date(at) return time.unix(at, 0):format(time.RFC3339NANO) end
        local server_date = row_date(now)
        local function user(id, attachments)
            return { message_id = id, type = 'user', date = server_date, data = 'Keep user text', metadata = {
                file_uuids = { 'ordinary-file' }, context_attachments = attachments,
            } }
        end
        local function observation(id, revision, args)
            return { message_id = id, type = 'private_function', date = server_date, data = args or '{"name":"Save"}', metadata = {
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
        it('withdraws an observation with an invalid row date while retaining a fresh observation', function()
            local invalid, fresh = observation('invalid'), observation('fresh', 1, '{"name":"Cancel"}')
            invalid.date = 'not-a-timestamp'
            local projected, updates = history.prepare({ user('first'), invalid, fresh }, now + 1)
            test.eq(#updates, 1)
            test.eq(updates[1].message_id, 'invalid')
            test.eq(updates[1].stale, 'Attention observation expired.')
            test.eq(projected[3], fresh)
            test.eq(projected[2].metadata.call_id, invalid.metadata.call_id)
            test.eq(projected[2].metadata.result, invalid.metadata.result)
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
        it('keeps a find read across observation and geometry changes but withdraws it after browser interactions', function()
            local first, changed = observation('first'), observation('changed', 1, '{"name":"Cancel"}')
            first.metadata.result.revisions = { tree = 1, observation = 1, geometry = 1 }
            changed.metadata.result.revisions = { tree = 1, observation = 2, geometry = 2 }
            local _, updates = history.prepare({ user('first'), first, changed }, now + 1)
            test.eq(#updates, 0)
            local action = { type = 'private_function', message_id = 'action', metadata = {
                registry_id = 'wippy.agent.tools:ui_action_highlight', status = 'success', result = { status = 'confirmed' },
            } }
            _, updates = history.prepare({ user('first'), first, action }, now + 1)
            test.eq(#updates, 1)
            test.eq(updates[1].message_id, 'first')
        end)
        local function read_of(id, tool, revisions, args)
            local row = observation(id, 1, args or '{}')
            row.metadata.registry_id = 'wippy.agent.tools:' .. tool
            row.metadata.function_name = tool
            row.metadata.result.revisions = revisions
            return row
        end
        it('withdraws geometry and point reads when geometry changes', function()
            local geometry = read_of('geometry', 'attention_get_geometry', { tree = 1, observation = 1, geometry = 1 })
            local point = read_of('point', 'attention_hit_test', { tree = 1, observation = 1, geometry = 1 })
            local find = read_of('find', 'attention_find_semantic', { tree = 1, observation = 2, geometry = 2 })
            local _, updates = history.prepare({ user('first'), geometry, point, find }, now + 1)
            test.eq(#updates, 2)
            test.eq(updates[1].message_id, 'geometry')
            test.eq(updates[2].message_id, 'point')
        end)
        it('never withdraws cursor, focus, or selection reads by revision', function()
            local cursor = read_of('cursor', 'attention_get_cursor', { tree = 1, observation = 1, geometry = 1 })
            local focus = read_of('focus', 'attention_get_focus', { tree = 1, observation = 1, geometry = 1 })
            local find = read_of('find', 'attention_find_semantic', { tree = 2, observation = 2, geometry = 2 })
            local _, updates = history.prepare({ user('first'), cursor, focus, find }, now + 1)
            test.eq(#updates, 0)
            local newer = read_of('newer-cursor', 'attention_get_cursor', { tree = 2, observation = 2, geometry = 2 })
            _, updates = history.prepare({ user('first'), cursor, focus, find, newer }, now + 1)
            test.eq(#updates, 1)
            test.eq(updates[1].message_id, 'cursor')
        end)
        it('takes the kind of a stored legacy attention_inspect read from its operation', function()
            local function legacy(id, operation)
                return { message_id = id, type = 'private_function', date = server_date,
                    data = '{"operation":"' .. operation .. '"}', metadata = {
                    registry_id = 'wippy.agent.tools:attention_inspect', status = 'success',
                    result = { schema = 'wippy.ui-action.v1', host_instance_id = 'host', inspection = {
                        outcome = 'ok', measured_at = '2026-09-18T12:00:00Z', revisions = { tree = 1, geometry = 1 },
                    } },
                } }
            end
            local find = read_of('find', 'attention_find_semantic', { tree = 1, geometry = 2 })
            local _, updates = history.prepare({ user('first'), legacy('geometry', 'geometry'), legacy('focus', 'focus'), find }, now + 1)
            test.eq(#updates, 1)
            test.eq(updates[1].message_id, 'geometry')
        end)
        it('times reads from the server row date whatever the Host clock reports', function()
            local behind, ahead = observation('behind'), observation('ahead', 1, '{"name":"Cancel"}')
            behind.metadata.result.measured_at = '2026-09-18T11:00:00Z'
            ahead.metadata.result.measured_at = '2026-09-18T13:00:00Z'
            local _, updates = history.prepare({ user('first'), behind, ahead }, now + 1)
            test.eq(#updates, 0, 'a Host clock an hour off does not expire a fresh read')
            ahead.date = row_date(now - 30)
            _, updates = history.prepare({ user('first'), behind, ahead }, now)
            test.eq(#updates, 1, 'a row older than the lifetime expires although the Host clock is ahead')
            test.eq(updates[1].message_id, 'ahead')
            test.eq(updates[1].stale, 'Attention observation expired.')
        end)
        it('reads a Postgres row date, the server wall clock with a Z suffix, as server-local time', function()
            local function postgres_date(at) return time.unix(at, 0):format('2006-01-02T15:04:05') .. 'Z' end
            local fresh, old = observation('fresh'), observation('old', 1, '{"name":"Cancel"}')
            fresh.date = postgres_date(now - 1)
            old.date = postgres_date(now - 31)
            local _, updates = history.prepare({ user('first'), fresh, old }, now)
            test.eq(#updates, 1)
            test.eq(updates[1].message_id, 'old')
            test.eq(updates[1].stale, 'Attention observation expired.')
        end)
        it('times context attachments from the server row date and honors a shorter declared lifetime', function()
            local skewed = { kind = 'wippy.attention', version = 4, attachment_id = 'skewed',
                created_at = '2026-09-18T13:00:00Z', expires_at = '2026-09-18T13:05:00Z' }
            local short = { kind = 'wippy.attention', version = 4, attachment_id = 'short',
                created_at = '2026-09-18T11:00:00Z', expires_at = '2026-09-18T11:00:10Z' }
            local row = user('first', { skewed, short })
            local projected = history.prepare({ row }, now + 9)
            test.eq(#projected[1].metadata.context_attachments, 2,
                'a client clock an hour off does not expire context on a fresh row')
            projected = history.prepare({ row }, now + 10)
            test.eq(#projected[1].metadata.context_attachments, 1)
            test.eq(projected[1].metadata.context_attachments[1].attachment_id, 'skewed')
            projected = history.prepare({ row }, now + 30)
            test.eq(#projected[1].metadata.context_attachments, 0)
            local old = user('old', { skewed })
            old.date = row_date(now - 30)
            projected = history.prepare({ old }, now)
            test.eq(#projected[1].metadata.context_attachments, 0,
                'a row older than the lifetime drops context although the client clock is ahead')
        end)
    end)
end

return test.run_cases(define_tests)
