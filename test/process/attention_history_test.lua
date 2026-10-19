local test = require('test')
local time = require('time')
local history = require('attention_history')
local message_repo = require('message_repo')
local message_date = require('message_date')
local session_repo = require('session_repo')
local context_repo = require('context_repo')
local uuid = require('uuid')
local security = require('security')
local wait_for_boot = require('wait_for_boot')
local prompt_builder = require('prompt_builder')

local function define_tests()
    describe('Attention observation lifetime', function()
        local now = 1789732800 -- 2026-09-18T12:00:00Z
        -- Row dates as Session writes them: UTC with a Z suffix and a nine digit
        -- fraction (message_date.LAYOUT), whatever zone the server runs in.
        local function row_date(at) return time.unix(at, 0):utc():format(message_date.LAYOUT) end
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
        it('does not count an accepted form answer that is not admitted yet as the latest user turn', function()
            local known = { kind = 'wippy.attention', version = 4, attachment_id = 'attention', created_at = '2026-09-18T12:00:00Z', content = 'immutable bytes' }
            local typed = user('typed', { known })
            local current = observation('tool')
            local function answer(pending)
                return { message_id = 'answer', type = 'user', date = server_date, data = 'Answered: Courier', metadata = {
                    session_form = { artifact_id = 'form-1', pending = pending },
                } }
            end
            -- The read of the real turn stays valid while the answer waits.
            local projected, updates = history.prepare({ typed, current, answer(true) }, now + 1)
            test.eq(#updates, 0)
            test.eq(projected[2], current)
            -- The typed message keeps its Attention context.
            projected, updates = history.prepare({ typed, answer(true) }, now + 1)
            test.eq(#updates, 0)
            test.eq(#projected[1].metadata.context_attachments, 1)
            test.eq(projected[1], typed)
            -- Admitted, the answer is a user turn like any other.
            projected, updates = history.prepare({ typed, current, answer(false) }, now + 1)
            test.eq(#updates, 1)
            test.eq(updates[1].message_id, 'tool')
            projected = history.prepare({ typed, answer(false) }, now + 1)
            test.eq(#projected[1].metadata.context_attachments, 0)
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
        -- Literal dates, not dates built from the clock: the instant a row names
        -- is fixed text, so the test does not depend on the zone of the host.
        it('reads a Z row date as the UTC instant it names, in every layout a row comes back in', function()
            test.eq(time.parse(time.RFC3339NANO, '2026-09-18T12:00:00.000000000Z'):unix(), now)
            local layouts = {
                '2026-09-18T11:59:59.000000000Z', -- written by Session, SQLite and PostgreSQL
                '2026-09-18T11:59:59Z',           -- an older SQLite row without a fraction
                '2026-09-18T11:59:59.000000Z',    -- a trimmed fraction
            }
            for _, date in ipairs(layouts) do
                local fresh, old = observation('fresh'), observation('old', 1, '{"name":"Cancel"}')
                fresh.date = date
                old.date = '2026-09-18T11:59:29.000000000Z'
                local _, updates = history.prepare({ user('first'), fresh, old }, now)
                test.eq(#updates, 1, date)
                test.eq(updates[1].message_id, 'old', date)
                test.eq(updates[1].stale, 'Attention observation expired.')
            end
        end)
        it('reads an offset row date by its instant too', function()
            local fresh, old = observation('fresh'), observation('old', 1, '{"name":"Cancel"}')
            fresh.date = '2026-09-18T14:59:59.000000000+03:00'
            old.date = '2026-09-18T05:59:29.000000000-06:00'
            local _, updates = history.prepare({ user('first'), fresh, old }, now)
            test.eq(#updates, 1)
            test.eq(updates[1].message_id, 'old')
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

    describe('Attention observation lifetime on stored dates', function()
        local ids = { session = uuid.v7(), context = uuid.v7(), user = uuid.v7() }
        before_all(function()
            wait_for_boot.run()
            local actor = security.actor()
            if actor then ids.user = actor:id() end
            local _, context_err = context_repo.create(ids.context, 'primary', 'Attention history context')
            test.is_nil(context_err)
            local _, session_err = session_repo.create(ids.session, ids.user, ids.context, 'Attention history', 'test')
            test.is_nil(session_err)
        end)
        after_all(function()
            session_repo.delete(ids.session)
            context_repo.delete(ids.context)
        end)

        it('times a row written through message_repo.create from the instant its date names', function()
            local created, create_err = message_repo.create(uuid.v7(), ids.session, 'private_function', '{"name":"Save"}', {
                registry_id = 'wippy.agent.tools:attention_find_semantic', function_name = 'attention_find_semantic',
                call_id = 'call-stored', status = 'success',
                result = { schema = 'wippy.attention.model.v1', status = 'inspected', outcome = 'ok',
                    host = 'host', revisions = { tree = 1 }, nodes = { { 'canonical-node' } } },
            })
            test.is_nil(create_err)
            local stored = message_repo.get(created.message_id)
            local start = message_date.parse_stored(stored.date)
            test.not_nil(start, 'the stored date is a date')
            local started = start:unix()
            test.is_true(math.abs(started - time.now():unix()) < 300, 'the date names the current instant: ' .. stored.date)
            local user_row = { message_id = 'user', type = 'user', date = '2000-01-01T00:00:00.000000000Z', data = 'Keep', metadata = {} }
            local rows = { user_row, stored }
            local _, updates = history.prepare(rows, started + 29)
            test.eq(#updates, 0, 'a row written now is fresh 29 seconds later, in any server zone')
            _, updates = history.prepare(rows, started + 30)
            test.eq(#updates, 1, 'and expires at the lifetime, measured from the instant it names')
            test.eq(updates[1].stale, 'Attention observation expired.')
        end)
    end)

    describe('Attention prompt build', function()
        it('keeps the forms index, with its pending answers, in the prompt of an Attention session', function()
            local form = {
                artifact_id = 'form-1', title = 'Pick one',
                meta = { session_form = { version = 1, origin = { created_cursor = '2026-09-18T10:00' },
                    submission = { submitted_at = '2026-09-18T11:00', late = false, message_id = 'answer-1' } } },
            }
            local original = message_repo.list_pending_answers
            local asked_for = nil
            message_repo.list_pending_answers = function(session_id)
                asked_for = session_id
                return { { type = 'user', metadata = { session_form = { artifact_id = 'form-1', pending = true } } } }
            end
            local function query(rows: any)
                local result = {}
                function result:from_checkpoint() return self end
                function result:all() return rows, nil end
                return result
            end
            local reader = {
                session_id = 'session-with-form',
                messages = function() return query({ { message_id = 'u1', type = 'user', date = '2026-09-18T12:00:00Z', data = 'Hello', metadata = {} } }) end,
                contexts = function() return query({}) end,
                artifacts = function() return query({ form }) end,
                state = function() return { session_id = 'session-with-form', meta = {} } end,
                get_context = function() return nil end,
            }
            local ok, built, err = pcall(history.build, { reader = reader, writer = {} }, {})
            message_repo.list_pending_answers = original
            test.is_true(ok, tostring(built))
            test.is_nil(err)
            test.eq(asked_for, 'session-with-form', 'the pending answers of the session are read')
            local found = false
            for _, message in ipairs((built :: any):get_messages()) do
                for _, part in ipairs(message.content or {}) do
                    if type(part.text) == 'string' and part.text:find('answer pending', 1, true)
                        and part.text:find('form_id=form-1', 1, true) then found = true end
                end
            end
            test.is_true(found, 'the forms index lists the pending answer in the prompt')
        end)

        -- The builder reads the reader's data fields (session_id for the forms
        -- index) and calls its methods. A field the hook's stand-in turned into
        -- a function, as it did for session_id, silently disables whatever
        -- reads it.
        it('hands the builder the reader data fields as data and its methods as methods', function()
            local captured: any = nil
            local original = prompt_builder.from_session
            prompt_builder.from_session = function(session) captured = session; return nil, 'stop here' end
            local function query(rows: any)
                local result = {}
                function result:from_checkpoint() return self end
                function result:all() return rows, nil end
                return result
            end
            local reader = {
                session_id = 'session-1', user_id = 'user-1',
                messages = function() return query({}) end,
                state = function() return { meta = {} } end,
            }
            history.build({ reader = reader, writer = {} }, {})
            prompt_builder.from_session = original
            test.not_nil(captured)
            test.eq(captured.session_id, 'session-1')
            test.eq(captured.user_id, 'user-1')
            test.eq(type(captured.messages), 'function')
            test.eq(type(captured.state), 'function')
            test.eq(captured:state().meta ~= nil, true, 'methods still run on the reader')
            test.is_nil(captured.no_such_field, 'a name the reader lacks is absent, not a function')
        end)

        -- The hook hands the builder its own message list. A form answer the
        -- session has not admitted is in that list and must stay out of the
        -- prompt, as in a session without Attention.
        it('keeps an unadmitted form answer out of the prompt of an Attention session', function()
            local original = message_repo.list_pending_answers
            message_repo.list_pending_answers = function() return {} end
            local function query(rows: any)
                local result = {}
                function result:from_checkpoint() return self end
                function result:all() return rows, nil end
                return result
            end
            local rows = {
                { message_id = 'u1', type = 'user', date = '2026-09-18T12:00:00Z', data = 'Hello', metadata = {} },
                { message_id = 'a1', type = 'user', date = '2026-09-18T12:00:01Z',
                    data = 'Answered pick-one. SECRET-ANSWER-TEXT', metadata = {
                        session_form = { artifact_id = 'form-1', pending = true } } },
            }
            local reader = {
                session_id = 'session-with-form',
                messages = function() return query(rows) end,
                contexts = function() return query({}) end,
                artifacts = function() return query({}) end,
                state = function() return { session_id = 'session-with-form', meta = {} } end,
                get_context = function() return nil end,
            }
            local ok, built, err = pcall(history.build, { reader = reader, writer = {} }, {})
            message_repo.list_pending_answers = original
            test.is_true(ok, tostring(built))
            test.is_nil(err)
            local hello, secret = false, false
            for _, message in ipairs((built :: any):get_messages()) do
                for _, part in ipairs(message.content or {}) do
                    if type(part.text) == 'string' then
                        if part.text:find('Hello', 1, true) then hello = true end
                        if part.text:find('SECRET-ANSWER-TEXT', 1, true) then secret = true end
                    end
                end
            end
            test.is_true(hello, 'the typed message is in the prompt')
            test.is_false(secret, 'the unadmitted answer is not')
        end)
    end)
end

return test.run_cases(define_tests)
