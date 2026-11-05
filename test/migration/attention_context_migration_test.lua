local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")

-- A disposable database: the shared test database already has every migration
-- applied, so it cannot show what an upgrade does to existing rows.
local PROBE_DB = "app:migration_probe_db"
local MIGRATION = "wippy.session.migration:13_add_attention_context"

local function reset()
    local db, err = sql.get(PROBE_DB)
    if not db then error(err) end
    local _, drop_err = db:execute("DROP TABLE IF EXISTS sessions")
    db:release()
    if drop_err then error(drop_err) end
end

local function run_migration(direction, id)
    return funcs.new():call(MIGRATION, { database_id = PROBE_DB, direction = direction, id = id })
end

local function define_tests()
    describe("Attention context migration", function()
        before_each(reset)
        after_all(reset)

        it("upgrades a sessions table that already has rows", function()
            local db = assert(sql.get(PROBE_DB))
            assert(db:execute("CREATE TABLE sessions (session_id TEXT PRIMARY KEY, user_id TEXT NOT NULL)"))
            assert(db:execute("INSERT INTO sessions (session_id, user_id) VALUES ($1, $2)", { "existing", "user-1" }))
            db:release()

            local id = "attention-context-probe-" .. uuid.v7()
            local applied, apply_err = run_migration("up", id)
            test.is_nil(apply_err)
            test.eq(applied.status, "complete", tostring(applied.error))
            test.eq(applied.applied, 1)

            db = assert(sql.get(PROBE_DB))
            local rows, query_err = db:query([[SELECT attention_enabled, attention_revision,
                attention_updated_at, attention_updated_by FROM sessions WHERE session_id = $1]], { "existing" })
            db:release()
            test.is_nil(query_err)
            test.eq(#rows, 1)
            local row = rows[1]
            test.is_true(row.attention_enabled == 0 or row.attention_enabled == false)
            test.eq(tonumber(row.attention_revision), 0)
            -- Existing rows have no change time; session_repo reports it as absent.
            test.eq(row.attention_updated_at, "")
            test.eq(row.attention_updated_by, "system")

            local reverted, revert_err = run_migration("down", id)
            test.is_nil(revert_err)
            test.eq(reverted.status, "complete", tostring(reverted.error))
        end)
    end)
end

return test.run_cases(define_tests)
