-- SPDX-License-Identifier: MIT
local test = require("test")
local sql = require("sql")
local time = require("time")
local uuid = require("uuid")
local security = require("security")
local consts = require("consts")
local context_repo = require("context_repo")
local session_repo = require("session_repo")
local message_repo = require("message_repo")
local artifact_repo = require("artifact_repo")
local session_contexts_repo = require("session_contexts_repo")
local wait_for_boot = require("wait_for_boot")

-- PostgreSQL timestamp columns carry UTC wall time without an offset. Read
-- their epoch explicitly so the client's time zone cannot hide a shifted write.
local function stored_epoch(table_name, column, key, id)
    local db = assert(sql.get(consts.get_db_resource()))
    local postgres = db:type() == sql.type.POSTGRES
    local value = postgres and ("FLOOR(EXTRACT(EPOCH FROM " .. column .. " AT TIME ZONE 'UTC'))") or column
    local rows, err = db:query("SELECT " .. value .. " AS value FROM " .. table_name .. " WHERE " .. key .. " = $1", {id})
    db:release()
    test.is_nil(err)
    test.eq(#rows, 1)
    if postgres then return assert(tonumber(rows[1].value)) end
    local parsed, parse_err = time.parse(time.RFC3339NANO, rows[1].value)
    test.is_nil(parse_err)
    return parsed:unix()
end

local function is_current(table_name, column, key, id, before)
    local epoch = stored_epoch(table_name, column, key, id)
    local after = time.now():unix()
    test.is_true(epoch >= before and epoch <= after, table_name .. "." .. column .. " expected " .. before .. ".." .. after .. ", got " .. epoch)
end

local function define_tests()
    test.describe("UTC persistence", function()
        local context_id, session_id, created_before
        test.before_all(function() wait_for_boot.run() end)
        test.before_each(function()
            context_id, session_id = uuid.v7(), uuid.v7()
            assert(context_repo.create(context_id, "primary", "{}"))
            created_before = time.now():unix()
            assert(session_repo.create(session_id, security.actor():id(), context_id, "UTC persistence", "test"))
        end)
        test.after_each(function()
            test.not_nil((session_repo.delete(session_id)))
            test.not_nil((context_repo.delete(context_id)))
        end)

        test.it("stores a new session at the current UTC instant", function()
            is_current("sessions", "start_date", "session_id", session_id, created_before)
            is_current("sessions", "last_message_date", "session_id", session_id, created_before)
        end)

        test.it("preserves an explicitly supplied session epoch", function()
            local epoch = 1720000000
            assert(session_repo.update_session_meta(session_id, {last_message_date = epoch}))
            test.eq(stored_epoch("sessions", "last_message_date", "session_id", session_id), epoch)
        end)

        test.it("stores messages and batch activity at their UTC instant", function()
            local first, second = uuid.v7(), uuid.v7()
            local before = time.now():unix()
            assert(message_repo.create(first, session_id, "user", "first", {}))
            is_current("messages", "date", "message_id", first, before)
            is_current("sessions", "last_message_date", "session_id", session_id, before)
            assert(message_repo.create_batch(session_id, {{message_id = second, type = "user", data = "second", metadata = {}}}))
            is_current("messages", "date", "message_id", second, before)
            is_current("sessions", "last_message_date", "session_id", session_id, before)
        end)

        test.it("stores artifact creation and both updates at the current UTC instant", function()
            local id, before = uuid.v7(), time.now():unix()
            assert(artifact_repo.create(id, session_id, "static", "UTC artifact", "content", {}))
            is_current("artifacts", "created_at", "artifact_id", id, before)
            is_current("artifacts", "updated_at", "artifact_id", id, before)
            local function reset()
                local db = assert(sql.get(consts.get_db_resource()))
                assert(db:execute("UPDATE artifacts SET updated_at = $1 WHERE artifact_id = $2", {"2000-01-01T00:00:00Z", id}))
                db:release()
            end
            reset()
            assert(artifact_repo.update(id, {title = "Updated"}))
            is_current("artifacts", "updated_at", "artifact_id", id, before)
            reset()
            assert(artifact_repo.update_content(id, "updated content"))
            is_current("artifacts", "updated_at", "artifact_id", id, before)
        end)

        test.it("preserves an explicitly supplied session context epoch", function()
            local id, epoch = uuid.v7(), 1720000000
            assert(session_contexts_repo.create(id, session_id, "note", "UTC context", epoch))
            test.eq(stored_epoch("session_contexts", "time", "id", id), epoch)
        end)
    end)
end

return {run = test.run_cases(define_tests)}
