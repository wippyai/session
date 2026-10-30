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
        local context_id, session_id, created_before, other_sessions
        test.before_all(function() wait_for_boot.run() end)
        test.before_each(function()
            context_id, session_id = uuid.v7(), uuid.v7()
            other_sessions = {}
            assert(context_repo.create(context_id, "primary", "{}"))
            created_before = time.now():unix()
            assert(session_repo.create(session_id, security.actor():id(), context_id, "UTC persistence", "test"))
        end)
        test.after_each(function()
            for _, id in ipairs(other_sessions) do test.not_nil((session_repo.delete(id))) end
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

        test.it("orders existing offset session dates alongside UTC writes by instant", function()
            local newer = uuid.v7()
            assert(session_repo.create(newer, security.actor():id(), context_id, "Newer session", "test"))
            other_sessions[#other_sessions + 1] = newer
            local db = assert(sql.get(consts.get_db_resource()))
            local old = db:type() == sql.type.POSTGRES and "2026-01-01T00:00:00Z" or "2026-01-01T05:30:00+05:30"
            assert(db:execute("UPDATE sessions SET last_message_date = $1 WHERE session_id = $2", {old, session_id}))
            assert(db:execute("UPDATE sessions SET last_message_date = $1 WHERE session_id = $2", {"2026-01-01T00:01:00Z", newer}))
            db:release()
            local rows = assert(session_repo.list_by_user(security.actor():id(), 1000, 0))
            local positions = {}
            for index, row in ipairs(rows) do positions[row.session_id] = index end
            test.not_nil(positions[newer])
            test.not_nil(positions[session_id])
            test.is_true(positions[newer] < positions[session_id], "Session ordering compares wall time instead of instants")
        end)

        test.it("orders and paginates artifacts across existing offset and UTC dates", function()
            local old, middle, newest = uuid.v7(), uuid.v7(), uuid.v7()
            for _, id in ipairs({old, middle, newest}) do
                assert(artifact_repo.create(id, session_id, "static", "Ordered artifact", "content", {}))
            end
            local db = assert(sql.get(consts.get_db_resource()))
            local old_date = db:type() == sql.type.POSTGRES and "2026-01-01T00:00:00Z" or "2026-01-01T05:30:00+05:30"
            for _, pair in ipairs({{old, old_date}, {middle, "2026-01-01T00:01:00Z"}, {newest, "2026-01-01T00:02:00Z"}}) do
                assert(db:execute("UPDATE artifacts SET created_at = $1 WHERE artifact_id = $2", {pair[2], pair[1]}))
            end
            db:release()
            local all = assert(artifact_repo.list_by_session(session_id))
            test.eq(all[1].artifact_id, newest)
            test.eq(all[3].artifact_id, old)
            local kind = assert(artifact_repo.list_by_kind(session_id, "static"))
            test.eq(kind[1].artifact_id, newest)
            local cursor
            for index, id in ipairs({newest, middle, old}) do
                local page = assert(artifact_repo.list_by_user(security.actor():id(), session_id, 1, cursor))
                test.eq(#page.artifacts, 1)
                test.eq(page.artifacts[1].artifact_id, id)
                test.eq(page.has_more, index < 3)
                cursor = id
            end
        end)
    end)
end

return {run = test.run_cases(define_tests)}
