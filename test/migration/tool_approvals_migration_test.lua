local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")

-- A disposable database: the shared test database already has every migration
-- applied, so it cannot show what an upgrade does to existing rows.
local PROBE_DB = "app:migration_probe_approvals_db"
local MIGRATION = "wippy.session.migration:14_add_tool_approvals"
local TABLES = {
    "session_tool_approvals", "session_tool_approval_batches",
    "session_tool_approval_grants", "session_command_receipts",
}

local function reset()
    local db, err = sql.get(PROBE_DB)
    if not db then error(err) end
    for _, name in ipairs(TABLES) do
        local _, drop_err = db:execute("DROP TABLE IF EXISTS " .. name)
        if drop_err then db:release(); error(drop_err) end
    end
    local _, drop_err = db:execute("DROP TABLE IF EXISTS sessions")
    db:release()
    if drop_err then error(drop_err) end
end

local function run_migration(direction, id)
    return funcs.new():call(MIGRATION, { database_id = PROBE_DB, direction = direction, id = id })
end

local function table_exists(db, name)
    local rows, err = db:query("SELECT name FROM sqlite_master WHERE type = 'table' AND name = $1", { name })
    if err then error(err) end
    return #rows == 1
end

local function define_tests()
    describe("Tool approval migration", function()
        before_each(reset)
        after_all(reset)

        it("adds the store to a database that already has sessions, leaving them untouched", function()
            local db = assert(sql.get(PROBE_DB))
            assert(db:execute([[CREATE TABLE sessions (session_id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
                title TEXT NOT NULL DEFAULT '', meta TEXT)]]))
            assert(db:execute("INSERT INTO sessions (session_id, user_id, title, meta) VALUES ($1, $2, $3, $4)",
                { "existing", "user-1", "Kept title", '{"interaction":{"can_send":true,"revision":3}}' }))
            db:release()

            local id = "tool-approvals-probe-" .. uuid.v7()
            local applied, apply_err = run_migration("up", id)
            test.is_nil(apply_err)
            test.eq(applied.status, "complete", tostring(applied.error))
            test.eq(applied.applied, 1)

            db = assert(sql.get(PROBE_DB))
            local rows, query_err = db:query([[SELECT session_id, user_id, title, meta, activity, activity_revision,
                approval_turn_fence FROM sessions WHERE session_id = $1]], { "existing" })
            test.is_nil(query_err)
            test.eq(#rows, 1)
            local row = rows[1]
            test.eq(row.user_id, "user-1")
            test.eq(row.title, "Kept title")
            test.eq(row.meta, '{"interaction":{"can_send":true,"revision":3}}')
            test.is_nil(row.activity)
            test.eq(tonumber(row.activity_revision), 0)
            test.is_nil(row.approval_turn_fence)

            for _, name in ipairs(TABLES) do
                test.is_true(table_exists(db, name), name)
            end
            -- One approval record per call row.
            local insert = [[INSERT INTO session_tool_approvals (approval_id, session_id, batch_id, tool_message_id,
                row_type, call_id, registry_id, intent_digest, display, state, requested_at)
                VALUES ($1, 's', 'b', 'm', 'function', 'c', 'r', 'd', '{}', 'pending', 'now')]]
            assert(db:execute(insert, { "a-1" }))
            local _, duplicate_err = db:execute(insert, { "a-2" })
            test.not_nil(duplicate_err)
            local revision_rows = assert(db:query("SELECT revision FROM session_tool_approvals WHERE approval_id = 'a-1'"))
            test.eq(tonumber(revision_rows[1].revision), 1)
            -- Receipts are keyed by owner, session and request.
            local receipt = [[INSERT INTO session_command_receipts (owner_id, session_id, request_id, body_hash, response,
                created_at) VALUES ($1, 's', 'req', 'h', '{}', 'now')]]
            assert(db:execute(receipt, { "owner-1" }))
            assert(db:execute(receipt, { "owner-2" }))
            local _, receipt_err = db:execute(receipt, { "owner-1" })
            test.not_nil(receipt_err)
            db:release()

            local reverted, revert_err = run_migration("down", id)
            test.is_nil(revert_err)
            test.eq(reverted.status, "complete", tostring(reverted.error))
            db = assert(sql.get(PROBE_DB))
            for _, name in ipairs(TABLES) do
                test.is_false(table_exists(db, name), name)
            end
            local kept = assert(db:query("SELECT session_id, title FROM sessions"))
            db:release()
            test.eq(#kept, 1)
            test.eq(kept[1].title, "Kept title")
        end)
    end)
end

return test.run_cases(define_tests)
