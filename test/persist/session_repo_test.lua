local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local time = require("time")
local security = require("security")
local consts = require("consts")
local tx = require("tx")
local json = require("json")
local wait_for_boot = require("wait_for_boot")

local function define_tests()
    describe("Session Repository", function()
        -- Test data
        local test_data = {
            user_id = uuid.v7(),
            context_id = uuid.v7(),
            context_id2 = uuid.v7(),
            session_id = uuid.v7()
        }
        local actor = security.actor()
        if actor then
            test_data.user_id = actor:id()
        end

        -- Setup test context before all tests
        before_all(function()
            wait_for_boot.run()

            -- Create primary context for sessions
            local context, err = context_repo.create(
                test_data.context_id,
                "primary",
                "Primary context data"
            )

            if err then
                error("Failed to create primary test context: " .. err)
            end

            -- Create secondary context for testing relationships
            context, err = context_repo.create(
                test_data.context_id2,
                "secondary",
                "Secondary context data"
            )

            if err then
                error("Failed to create secondary test context: " .. err)
            end
        end)

        -- Clean up test data after all tests
        after_all(function()
            local db_resource, _ = consts.get_db_resource()
            local db, err = sql.get(db_resource)
            if err then
                error("Failed to connect to database: " .. err)
            end

            local tx, err = db:begin()
            if err then
                db:release()
                error("Failed to begin transaction: " .. err)
            end

            tx:execute("DELETE FROM messages WHERE session_id = $1", { test_data.session_id })
            tx:execute("DELETE FROM session_contexts WHERE session_id = $1", { test_data.session_id })
            tx:execute("DELETE FROM sessions WHERE session_id = $1", { test_data.session_id })
            tx:execute("DELETE FROM contexts WHERE context_id IN ($1, $2)",
                { test_data.context_id, test_data.context_id2 })

            local success, err = tx:commit()
            if err then
                tx:rollback()
                db:release()
                error("Failed to commit cleanup transaction: " .. err)
            end

            db:release()
        end)

        it("should create a new session", function()
            local session, err = session_repo.create(
                test_data.session_id,
                test_data.user_id,
                test_data.context_id,
                "Test Session",
                "test",
                { model = "test-model" },
                { max_tokens = 1000 }
            )

            test.is_nil(err)
            test.not_nil(session)
            test.eq(session.session_id, test_data.session_id)
            test.eq(session.user_id, test_data.user_id)
            test.eq(session.primary_context_id, test_data.context_id)
            test.eq(session.title, "Test Session")
            test.eq(session.kind, "test")
            test.is_table(session.meta)
            test.eq(session.meta.model, "test-model")
            test.is_table(session.config)
            test.eq(session.config.max_tokens, 1000)
            test.not_nil(session.start_date)
            test.not_nil(session.last_message_date)
        end)

        it("matches the documented Attention session-state output", function()
            -- ATTENTION:SESSION-STATE-EXAMPLE:BEGIN
            local expected = json.decode([[{"schema":"wippy.attention.session.v1","enabled":true,"revision":4,"updated_at":"2026-09-15T12:00:00.000Z","updated_by":"user"}]])
            -- ATTENTION:SESSION-STATE-EXAMPLE:END
            local session_id = uuid.v7()
            local created, create_err = session_repo.create(session_id, test_data.user_id,
                test_data.context_id, "Documented Attention state", "test")
            test.is_nil(create_err)
            test.not_nil(created)
            local db_resource = consts.get_db_resource()
            local db, db_err = sql.get(db_resource)
            test.is_nil(db_err)
            local updated, update_err = db:execute(
                "UPDATE sessions SET attention_enabled = $1, attention_revision = $2, attention_updated_at = $3, attention_updated_by = $4 WHERE session_id = $5",
                {1, expected.revision, expected.updated_at, expected.updated_by, session_id})
            db:release()
            test.is_nil(update_err)
            test.not_nil(updated)
            local current, read_err = session_repo.get(session_id)
            local removed, remove_err = session_repo.delete(session_id)
            test.is_nil(remove_err)
            test.not_nil(removed)
            test.is_nil(read_err)
            test.not_nil(current)
            local fields = 0
            for key, value in pairs(current.attention_context) do
                fields = fields + 1
                test.eq(value, expected[key])
            end
            test.eq(fields, 5)
        end)

        it("should get a session by ID", function()
            local session, err = session_repo.get(test_data.session_id)

            test.is_nil(err)
            test.not_nil(session)
            test.eq(session.session_id, test_data.session_id)
            test.eq(session.user_id, test_data.user_id)
            test.eq(session.primary_context_id, test_data.context_id)
            test.eq(session.title, "Test Session")
            test.eq(session.kind, "test")
            test.is_table(session.meta)
            test.eq(session.meta.model, "test-model")
            test.is_table(session.config)
            test.eq(session.config.max_tokens, 1000)
        end)

        it("should persist the default disabled Attention state", function()
            local session, err = session_repo.get(test_data.session_id)

            test.is_nil(err)
            test.not_nil(session)
            test.not_nil(session.attention_context)
            test.is_false(session.attention_context.enabled)
            test.eq(session.attention_context.revision, 0)
            test.eq(session.attention_context.updated_by, "system")
            test.not_nil(session.attention_context.updated_at)
        end)

        it("should report no change time for a session that predates the Attention columns", function()
            local session_id = uuid.v7()
            local created, create_err = session_repo.create(session_id, test_data.user_id,
                test_data.context_id, "Migrated session", "test")
            test.is_nil(create_err)
            test.not_nil(created)
            local db = assert(sql.get(consts.get_db_resource()))
            assert(db:execute("UPDATE sessions SET attention_updated_at = '' WHERE session_id = $1", { session_id }))
            db:release()

            local session, err = session_repo.get(session_id)
            test.is_nil(err)
            test.is_false(session.attention_context.enabled)
            test.eq(session.attention_context.revision, 0)
            test.is_nil(session.attention_context.updated_at)
            session_repo.delete(session_id)
        end)

        it("should not change another user's Attention state", function()
            local session_id = uuid.v7()
            local created, create_err = session_repo.create(session_id, test_data.user_id,
                test_data.context_id, "Owned session", "test")
            test.is_nil(create_err)
            test.not_nil(created)

            local state, err = session_repo.update_attention_context(session_id, true, 0, "user", "someone-else")
            test.is_nil(state)
            test.eq(err, "SESSION_NOT_FOUND")
            local unchanged = session_repo.get(session_id)
            test.is_false(unchanged.attention_context.enabled)
            test.eq(unchanged.attention_context.revision, 0)

            state, err = session_repo.update_attention_context(session_id, true, 0, "user", test_data.user_id)
            test.is_nil(err)
            test.is_true(state.enabled)
            session_repo.delete(session_id)
        end)

        it("should create and read back an enabled Attention state", function()
            local session_id = uuid.v7()
            local session, err = session_repo.create(
                session_id,
                test_data.user_id,
                test_data.context_id,
                "Attention Enabled Session",
                "test",
                {},
                { attention_context = { enabled = true } }
            )

            test.is_nil(err)
            test.not_nil(session)
            test.is_true(session.attention_context.enabled)
            test.eq(session.attention_context.revision, 1)
            test.eq(session.attention_context.updated_by, "application")

            local stored, stored_err = session_repo.get(session_id, test_data.user_id)
            test.is_nil(stored_err)
            test.not_nil(stored)
            test.is_true(stored.attention_context.enabled)
            test.eq(stored.attention_context.revision, 1)
            test.eq(stored.attention_context.updated_by, "application")

            local deleted, delete_err = session_repo.delete(session_id)
            test.is_nil(delete_err)
            test.is_true(deleted.deleted)
        end)

        it("should update Attention state with revisions and preserve idempotence", function()
            local session_id = uuid.v7()
            local created, create_err = session_repo.create(
                session_id, test_data.user_id, test_data.context_id, "Attention Revision Session"
            )
            test.is_nil(create_err)
            test.not_nil(created)

            local enabled, update_err = session_repo.update_attention_context(
                session_id, true, 0, test_data.user_id
            )

            test.is_nil(update_err)
            test.not_nil(enabled)
            test.is_true(enabled.enabled)
            test.eq(enabled.revision, 1)
            test.eq(enabled.updated_by, test_data.user_id)

            local repeated, repeated_err = session_repo.update_attention_context(
                session_id, true, 1, test_data.user_id
            )

            test.is_nil(repeated_err)
            test.not_nil(repeated)
            test.is_true(repeated.enabled)
            test.eq(repeated.revision, 1)
            test.eq(repeated.updated_at, enabled.updated_at)
            test.eq(repeated.updated_by, enabled.updated_by)

            local disabled, disabled_err = session_repo.update_attention_context(
                session_id, false, 1, test_data.user_id
            )

            test.is_nil(disabled_err)
            test.not_nil(disabled)
            test.is_false(disabled.enabled)
            test.eq(disabled.revision, 2)

            local stored, stored_err = session_repo.get(session_id)
            test.is_nil(stored_err)
            test.is_false(stored.attention_context.enabled)
            test.eq(stored.attention_context.revision, 2)
            test.eq(stored.attention_context.updated_by, test_data.user_id)

            local deleted, delete_err = session_repo.delete(session_id)
            test.is_nil(delete_err)
            test.is_true(deleted.deleted)
        end)

        it("should return the current state for a stale Attention revision", function()
            local session_id = uuid.v7()
            local created, create_err = session_repo.create(
                session_id, test_data.user_id, test_data.context_id, "Attention Conflict Session"
            )
            test.is_nil(create_err)
            test.not_nil(created)

            local current, current_err = session_repo.update_attention_context(
                session_id, true, 0, test_data.user_id
            )
            test.is_nil(current_err)
            test.not_nil(current)
            test.eq(current.revision, 1)

            local rejected, rejected_err, conflict_state = session_repo.update_attention_context(
                session_id, false, 0, test_data.user_id
            )

            test.is_nil(rejected)
            test.eq(rejected_err, "ATTENTION_CONTEXT_REVISION_CONFLICT")
            test.not_nil(conflict_state)
            test.is_true(conflict_state.enabled)
            test.eq(conflict_state.revision, 1)

            local deleted, delete_err = session_repo.delete(session_id)
            test.is_nil(delete_err)
            test.is_true(deleted.deleted)
        end)

        it("should get a session by ID with user filter", function()
            local session, err = session_repo.get(test_data.session_id, test_data.user_id)
            test.is_nil(err)
            test.not_nil(session)
            test.eq(session.session_id, test_data.session_id)

            -- Different user should not find the session
            session, err = session_repo.get(test_data.session_id, uuid.v7())
            test.is_nil(session)
            test.contains(tostring(err), "not found")
        end)

        it("should list sessions by user ID", function()
            local sessions, err = session_repo.list_by_user(test_data.user_id)

            test.is_nil(err)
            test.not_nil(sessions)
            test.is_true(#sessions >= 1)

            local found = false
            for _, session in ipairs(sessions) do
                if session.session_id == test_data.session_id then
                    found = true
                    break
                end
            end

            test.is_true(found)
        end)

        it("should update session title via update_session_meta", function()
            local result, err = session_repo.update_session_meta(
                test_data.session_id,
                { title = "Updated Session Title" }
            )

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.session_id, test_data.session_id)
            test.eq(result.title, "Updated Session Title")
            test.is_true(result.updated)

            -- Verify the update
            local session, err = session_repo.get(test_data.session_id)
            test.eq(session.title, "Updated Session Title")
        end)

        it("should update last message date", function()
            local timestamp = os.time() - 3600
            local result, err = session_repo.update_session_meta(
                test_data.session_id,
                { last_message_date = timestamp }
            )

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.session_id, test_data.session_id)
            test.eq(result.last_message_date, time.unix(timestamp, 0):format(time.RFC3339))
            test.is_true(result.updated)

            -- Verify the update
            local session, err = session_repo.get(test_data.session_id)
            test.eq(session.last_message_date, time.unix(timestamp, 0):format(time.RFC3339))
        end)

        it("should update multiple session fields at once", function()
            local updates = {
                title = "Multi Updated Title",
                status = "active",
                kind = "updated_kind",
                meta = { model = "new-model", temperature = 0.7 },
                config = { max_tokens = 2000 },
                public_meta = { theme = "dark" },
                last_message_date = os.time()
            }

            local result, err = session_repo.update_session_meta(
                test_data.session_id,
                updates
            )

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.session_id, test_data.session_id)
            test.eq(result.title, updates.title)
            test.eq(result.status, updates.status)
            test.eq(result.kind, updates.kind)
            test.is_true(result.updated)

            -- Verify the update
            local session, err = session_repo.get(test_data.session_id)
            test.eq(session.title, updates.title)
            test.eq(session.kind, updates.kind)
            test.is_table(session.meta)
            test.eq(session.meta.model, "new-model")
            test.eq(session.meta.temperature, 0.7)
            test.is_table(session.config)
            test.eq(session.config.max_tokens, 2000)
            test.is_table(session.public_meta)
            test.eq(session.public_meta.theme, "dark")
        end)

        it("should count sessions by user", function()
            local count, err = session_repo.count_by_user(test_data.user_id)

            test.is_nil(err)
            test.is_true(count >= 1)
        end)

        it("should handle validation errors", function()
            -- Invalid session creation
            local session, err = session_repo.create(nil, test_data.user_id, test_data.context_id)
            test.is_nil(session)
            test.contains(tostring(err), "Session ID is required")

            session, err = session_repo.create(uuid.v7(), "", test_data.context_id)
            test.is_nil(session)
            test.contains(tostring(err), "User ID is required")

            session, err = session_repo.create(uuid.v7(), test_data.user_id, "")
            test.is_nil(session)
            test.contains(tostring(err), "Primary context ID is required")

            -- Get with invalid ID
            session, err = session_repo.get("")
            test.is_nil(session)
            test.contains(tostring(err), "Session ID is required")

            -- List with invalid user ID
            local sessions, err = session_repo.list_by_user("")
            test.is_nil(sessions)
            test.contains(tostring(err), "User ID is required")

            -- Update with invalid session ID
            local result, err = session_repo.update_session_meta("", { title = "x" })
            test.is_nil(result)
            test.contains(tostring(err), "Session ID is required")

            -- Update non-existent session
            result, err = session_repo.update_session_meta(uuid.v7(), { title = "x" })
            test.is_nil(result)
            test.contains(tostring(err), "Session not found")

            local state, attention_err = session_repo.update_attention_context(
                "", true, 0, test_data.user_id
            )
            test.is_nil(state)
            test.eq(attention_err, "INVALID_SESSION_ID")

            state, attention_err = session_repo.update_attention_context(
                test_data.session_id, "true", 0, test_data.user_id
            )
            test.is_nil(state)
            test.eq(attention_err, "INVALID_ATTENTION_CONTEXT_ENABLED")

            state, attention_err = session_repo.update_attention_context(
                test_data.session_id, true, 1.5, test_data.user_id
            )
            test.is_nil(state)
            test.eq(attention_err, "INVALID_ATTENTION_CONTEXT_REVISION")

            state, attention_err = session_repo.update_attention_context(
                test_data.session_id, true, 0, ""
            )
            test.is_nil(state)
            test.eq(attention_err, "INVALID_ATTENTION_CONTEXT_UPDATED_BY")

            -- Count with invalid user ID
            local count, err_count = session_repo.count_by_user("")
            test.is_nil(count)
            test.contains(tostring(err_count), "User ID is required")
        end)

        it("rejects a metadata update when the session disappears before the write", function()
            local id = uuid.v7()
            assert(session_repo.create(id, test_data.user_id, test_data.context_id, "Disappearing session", "test"))
            local db_resource = consts.get_db_resource()
            local db = assert(sql.get(db_resource))
            local trigger = "delete_before_update_" .. id:gsub("-", "")
            local postgres = db:type() == "postgres"
            if postgres then
                assert(db:execute("CREATE FUNCTION " .. trigger .. "() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN " ..
                    "IF OLD.session_id = '" .. id .. "' THEN DELETE FROM sessions WHERE session_id = OLD.session_id; " ..
                    "RETURN NULL; END IF; RETURN NEW; END $$"))
                assert(db:execute("CREATE TRIGGER " .. trigger .. " BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION " .. trigger .. "()"))
            else
                assert(db:execute("CREATE TRIGGER " .. trigger .. " BEFORE UPDATE ON sessions WHEN OLD.session_id = '" .. id ..
                    "' BEGIN DELETE FROM sessions WHERE session_id = OLD.session_id; SELECT RAISE(IGNORE); END"))
            end
            local ok, result, err = pcall(session_repo.update_session_meta, id, {title = "Not persisted"})
            assert(db:execute("DROP TRIGGER " .. trigger .. (postgres and " ON sessions" or "")))
            if postgres then assert(db:execute("DROP FUNCTION " .. trigger .. "()")) end
            db:release()
            session_repo.delete(id)
            test.is_true(ok)
            test.is_nil(result)
            test.eq(err, "Session not found")
        end)

        it("should delete a session", function()
            -- Create a session to delete
            local temp_session_id = uuid.v7()
            local session, err = session_repo.create(
                temp_session_id,
                test_data.user_id,
                test_data.context_id,
                "Temporary Session"
            )

            test.is_nil(err)

            -- Delete it
            local result, err = session_repo.delete(temp_session_id)

            test.is_nil(err)
            test.not_nil(result)
            test.is_true(result.deleted)

            -- Verify the deletion
            session, err = session_repo.get(temp_session_id)
            test.is_nil(session)
            test.contains(tostring(err), "not found")

            -- Delete non-existent session
            result, err = session_repo.delete(uuid.v7())
            test.is_nil(result)
            test.contains(tostring(err), "Session not found")
        end)

        -- session_repo.delete removes the session's artifacts, session
        -- contexts and messages, then the session row, in one tx.run. The
        -- helpers below write those rows directly, so a test can also place
        -- them under a session id that has no session row (the SQLite test
        -- database does not enforce the foreign keys).
        local function add_dependents(session_id)
            local db, db_err = sql.get(consts.get_db_resource())
            test.is_nil(db_err)
            local now = os.time()
            local stamp = time.now():format(time.RFC3339)
            local _, artifact_err = db:execute(
                "INSERT INTO artifacts (artifact_id, session_id, user_id, kind, title, content, meta, created_at, updated_at)"
                    .. " VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                { uuid.v7(), session_id, test_data.user_id, "static", "Delete test", "content", nil, stamp, stamp })
            local _, context_err = db:execute(
                "INSERT INTO session_contexts (id, session_id, type, text, time) VALUES ($1, $2, $3, $4, $5)",
                { uuid.v7(), session_id, "note", "Delete test", now })
            local _, message_err = db:execute(
                "INSERT INTO messages (message_id, session_id, date, type, data, metadata) VALUES ($1, $2, $3, $4, $5, $6)",
                { uuid.v7(), session_id, now, "user", "Delete test", "{}" })
            db:release()
            test.is_nil(artifact_err)
            test.is_nil(context_err)
            test.is_nil(message_err)
        end

        local function rows_of(session_id)
            local db, db_err = sql.get(consts.get_db_resource())
            test.is_nil(db_err)
            local counts = {}
            for _, table_name in ipairs({ "artifacts", "session_contexts", "messages", "sessions" }) do
                local rows, query_err = db:query(
                    "SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE session_id = $1", { session_id })
                test.is_nil(query_err)
                counts[table_name] = tonumber(rows and rows[1] and rows[1].n) or -1
            end
            db:release()
            return counts
        end

        local function remove_rows(session_id)
            local db, db_err = sql.get(consts.get_db_resource())
            test.is_nil(db_err)
            for _, table_name in ipairs({ "artifacts", "session_contexts", "messages", "sessions" }) do
                db:execute("DELETE FROM " .. table_name .. " WHERE session_id = $1", { session_id })
            end
            db:release()
        end

        it("deletes a session with its artifacts, session contexts and messages", function()
            local session_id = uuid.v7()
            test.is_nil(select(2, session_repo.create(session_id, test_data.user_id, test_data.context_id,
                "Delete with dependents", "test")))
            add_dependents(session_id)

            local result, err = session_repo.delete(session_id)
            local after = rows_of(session_id)
            remove_rows(session_id)

            test.is_nil(err)
            test.is_true(result and result.deleted)
            test.eq(after.artifacts, 0)
            test.eq(after.session_contexts, 0)
            test.eq(after.messages, 0)
            test.eq(after.sessions, 0)
        end)

        it("rolls back the dependent deletes when the session row is missing", function()
            local session_id = uuid.v7()
            add_dependents(session_id)

            local result, err = session_repo.delete(session_id)
            local after = rows_of(session_id)
            remove_rows(session_id)

            test.is_nil(result)
            test.contains(tostring(err), "Session not found")
            test.eq(after.artifacts, 1, "the artifact delete was rolled back")
            test.eq(after.session_contexts, 1, "the session context delete was rolled back")
            test.eq(after.messages, 1, "the message delete was rolled back")
        end)

        it("refuses to run inside another transaction and deletes nothing", function()
            local session_id = uuid.v7()
            test.is_nil(select(2, session_repo.create(session_id, test_data.user_id, test_data.context_id,
                "Delete inside a transaction", "test")))
            add_dependents(session_id)

            local inner_result, inner_err = nil, nil
            local outer, outer_err = tx.run(function()
                inner_result, inner_err = session_repo.delete(session_id)
                return true
            end)
            local after = rows_of(session_id)
            local deleted, delete_err = session_repo.delete(session_id)
            remove_rows(session_id)

            test.is_nil(outer_err)
            test.is_true(outer)
            test.is_nil(inner_result)
            test.contains(tostring(inner_err), "Nested tx.run")
            test.eq(after.artifacts, 1)
            test.eq(after.session_contexts, 1)
            test.eq(after.messages, 1)
            test.eq(after.sessions, 1)
            test.is_nil(delete_err, "outside a transaction the same delete succeeds")
            test.is_true(deleted and deleted.deleted)
        end)

        it("should only update the target session without affecting others", function()
            local user_id = test_data.user_id
            local session_ids = {
                id1 = uuid.v7(),
                id2 = uuid.v7(),
                id3 = uuid.v7()
            }

            local initial_titles = {
                id1 = "First Test Session",
                id2 = "Second Test Session",
                id3 = "Third Test Session"
            }

            -- Create the sessions
            for id_key, id in pairs(session_ids) do
                local session, err = session_repo.create(
                    id,
                    user_id,
                    test_data.context_id,
                    initial_titles[id_key],
                    "isolation_test"
                )
                test.is_nil(err)
                test.not_nil(session)
                test.eq(session.title, initial_titles[id_key])
            end

            -- Verify all three sessions exist
            local all_sessions, err = session_repo.list_by_user(user_id)
            test.is_nil(err)

            local found_sessions = {}
            for _, session in ipairs(all_sessions) do
                for id_key, id in pairs(session_ids) do
                    if session.session_id == id then
                        found_sessions[id_key] = session
                        test.eq(session.title, initial_titles[id_key])
                    end
                end
            end

            test.not_nil(found_sessions.id1)
            test.not_nil(found_sessions.id2)
            test.not_nil(found_sessions.id3)

            -- Update just the second session's title
            local updated_title = "UPDATED Second Session"
            local result, err = session_repo.update_session_meta(
                session_ids.id2,
                { title = updated_title }
            )
            test.is_nil(err)
            test.not_nil(result)
            test.is_true(result.updated)

            -- Verify only the second session's title changed
            local updated_sessions, err = session_repo.list_by_user(user_id)
            test.is_nil(err)

            for _, session in ipairs(updated_sessions) do
                if session.session_id == session_ids.id1 then
                    test.eq(session.title, initial_titles.id1)
                elseif session.session_id == session_ids.id2 then
                    test.eq(session.title, updated_title)
                elseif session.session_id == session_ids.id3 then
                    test.eq(session.title, initial_titles.id3)
                end
            end

            -- Update metadata of just the first session
            local metadata_updates = {
                title = "META First Session",
                public_meta = { key = "value" }
            }

            result, err = session_repo.update_session_meta(session_ids.id1, metadata_updates)
            test.is_nil(err)
            test.not_nil(result)

            -- Verify isolation: only first session has updated metadata
            local final_sessions = {}
            for id_key, id in pairs(session_ids) do
                local session, err = session_repo.get(id)
                test.is_nil(err)
                final_sessions[id_key] = session
            end

            test.eq(final_sessions.id1.title, metadata_updates.title)
            test.eq(final_sessions.id1.public_meta.key, "value")

            test.eq(final_sessions.id2.title, updated_title)
            test.is_nil(final_sessions.id2.public_meta.key)

            test.eq(final_sessions.id3.title, initial_titles.id3)
            test.is_nil(final_sessions.id3.public_meta.key)

            -- Delete the second session
            result, err = session_repo.delete(session_ids.id2)
            test.is_nil(err)
            test.is_true(result.deleted)

            -- Verify deletion isolation
            local session, err = session_repo.get(session_ids.id2)
            test.is_nil(session)
            test.contains(tostring(err), "not found")

            session, err = session_repo.get(session_ids.id1)
            test.is_nil(err)
            test.not_nil(session)

            session, err = session_repo.get(session_ids.id3)
            test.is_nil(err)
            test.not_nil(session)

            -- Clean up
            session_repo.delete(session_ids.id1)
            session_repo.delete(session_ids.id3)
        end)

        it("lists every session of a user in a status, page by page in session_id order", function()
            -- A status no other suite uses, so only these sessions match.
            local status = "status-test-" .. uuid.v7()
            local matching = {}
            for i = 1, 3 do
                local session_id = uuid.v7()
                test.is_nil(select(2, session_repo.create(session_id, test_data.user_id, test_data.context_id,
                    "Status " .. i, "test")))
                test.is_nil(select(2, session_repo.update_session_meta(session_id, { status = status })))
                table.insert(matching, session_id)
            end
            table.sort(matching)
            local other_status = uuid.v7()
            session_repo.create(other_status, test_data.user_id, test_data.context_id, "Other status", "test")
            session_repo.update_session_meta(other_status, { status = "idle" })
            local other_user = uuid.v7()
            session_repo.create(other_user, uuid.v7(), test_data.context_id, "Other user", "test")
            session_repo.update_session_meta(other_user, { status = status })

            local first, first_err = session_repo.list_by_user_status(test_data.user_id, status, 2)
            local rest, rest_err = session_repo.list_by_user_status(test_data.user_id, status, 2,
                { after = first and first.next_cursor })
            local missing_status, status_err = session_repo.list_by_user_status(test_data.user_id, "", 2)
            for _, id in ipairs(matching) do session_repo.delete(id) end
            session_repo.delete(other_status)
            session_repo.delete(other_user)

            test.is_nil(first_err)
            assert(first)
            test.eq(#first.sessions, 2)
            test.eq(first.sessions[1].session_id, matching[1])
            test.eq(first.sessions[2].session_id, matching[2])
            test.eq(first.sessions[1].status, status)
            test.is_table(first.sessions[1].meta)
            test.is_true(first.has_more)
            test.eq(first.next_cursor, matching[2])

            test.is_nil(rest_err)
            assert(rest)
            test.eq(#rest.sessions, 1)
            test.eq(rest.sessions[1].session_id, matching[3])
            test.is_false(rest.has_more)
            test.is_nil(rest.next_cursor)

            test.is_nil(missing_status)
            test.contains(tostring(status_err), "Status is required")
        end)
    end)
end

return test.run_cases(define_tests)
