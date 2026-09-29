-- Product-level replacement for test/probes/sql_transaction_probe_test.lua
-- (P0-11). Exercises the real call paths that share a transaction: an
-- artifact_repo.update(..., { tx = ... }) and a message_repo.create(...,
-- { tx = ... }) run on the same tx.run(fn) transaction, committing or
-- rolling back together.

local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local time = require("time")
local security = require("security")
local consts = require("consts")
local tx = require("tx")
local context_repo = require("context_repo")
local session_repo = require("session_repo")
local artifact_repo = require("artifact_repo")
local message_repo = require("message_repo")
local wait_for_boot = require("wait_for_boot")

local function define_tests()
    describe("Shared transaction: artifact update + message create", function()
        local test_data = {
            user_id = uuid.v7(),
            context_id = uuid.v7(),
            session_id = uuid.v7(),
        }

        before_all(function()
            wait_for_boot.run()

            local actor = security.actor()
            if actor then
                test_data.user_id = actor:id()
            end

            local _, context_err = context_repo.create(test_data.context_id, "primary", "Shared tx context")
            test.is_nil(context_err)

            local _, session_err = session_repo.create(
                test_data.session_id, test_data.user_id, test_data.context_id, "Shared tx session", "test"
            )
            test.is_nil(session_err)
        end)

        after_all(function()
            local db_resource, _ = consts.get_db_resource()
            local db, err = sql.get(db_resource)
            if err then error("Failed to connect to database: " .. err) end
            db:execute("DELETE FROM artifacts WHERE session_id = $1", { test_data.session_id })
            db:execute("DELETE FROM messages WHERE session_id = $1", { test_data.session_id })
            db:execute("DELETE FROM session_contexts WHERE session_id = $1", { test_data.session_id })
            db:execute("DELETE FROM sessions WHERE session_id = $1", { test_data.session_id })
            db:execute("DELETE FROM contexts WHERE context_id = $1", { test_data.context_id })
            db:release()
        end)

        local function fresh_artifact(content)
            local artifact_id = uuid.v7()
            local db_resource, _ = consts.get_db_resource()
            local db, db_err = sql.get(db_resource)
            test.is_nil(db_err)
            local now = time.now():format(time.RFC3339)
            db:execute(
                "INSERT INTO artifacts (artifact_id, session_id, user_id, kind, title, content, meta, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                { artifact_id, test_data.session_id, test_data.user_id, "static", "Shared tx artifact", content, nil, now, now }
            )
            db:release()
            return artifact_id
        end

        it("commits the artifact update and the message insert together", function()
            local artifact_id = fresh_artifact("before-commit")
            local message_id = uuid.v7()

            local result, run_err = tx.run(function(dbtx)
                local artifact_result, artifact_err = artifact_repo.update(
                    artifact_id, { content = "after-commit" }, { tx = dbtx })
                if artifact_err then return nil, artifact_err end

                local message_result, message_err = message_repo.create(
                    message_id, test_data.session_id, "user", "shared-tx-commit", {}, { tx = dbtx })
                if message_err then return nil, message_err end

                return { artifact = artifact_result, message = message_result }
            end)

            test.is_nil(run_err)
            test.not_nil(result)

            local artifact, get_err = artifact_repo.get(artifact_id)
            test.is_nil(get_err)
            test.eq(artifact.content, "after-commit")
            test.eq(artifact.content_version, 2)

            local message, message_get_err = message_repo.get(message_id)
            test.is_nil(message_get_err)
            test.eq(message.data, "shared-tx-commit")
        end)

        it("rolls both back when the transaction body fails", function()
            local artifact_id = fresh_artifact("before-rollback")
            local message_id = uuid.v7()

            local result, run_err = tx.run(function(dbtx)
                local artifact_result, artifact_err = artifact_repo.update(
                    artifact_id, { content = "should-not-persist" }, { tx = dbtx })
                if artifact_err then return nil, artifact_err end

                local message_result, message_err = message_repo.create(
                    message_id, test_data.session_id, "user", "shared-tx-rollback", {}, { tx = dbtx })
                if message_err then return nil, message_err end

                return nil, "forced failure after both writes"
            end)

            test.is_nil(result)
            test.contains(tostring(run_err), "forced failure")

            local artifact, get_err = artifact_repo.get(artifact_id)
            test.is_nil(get_err)
            test.eq(artifact.content, "before-rollback")
            test.eq(artifact.content_version, 1)

            local message, message_get_err = message_repo.get(message_id)
            test.is_nil(message)
            test.contains(tostring(message_get_err), "not found")
        end)

        it("a failure after the artifact update (duplicate message id) rolls back the artifact", function()
            local artifact_id = fresh_artifact("before-failure")

            -- Pre-commit a message row outside the transaction so the tx's insert of
            -- the same message_id is guaranteed to collide with an existing primary key.
            local dup_message_id = uuid.v7()
            local pre_created, pre_err = message_repo.create(
                dup_message_id, test_data.session_id, "user", "original", {})
            test.is_nil(pre_err)
            test.not_nil(pre_created)

            local result, run_err = tx.run(function(dbtx)
                local artifact_result, artifact_err = artifact_repo.update(
                    artifact_id, { content = "should-not-persist-either" }, { tx = dbtx })
                if artifact_err then return nil, artifact_err end

                -- Same id as the pre-committed row: the insert must fail on the
                -- primary key, taking the artifact update down with it.
                local message_result, message_err = message_repo.create(
                    dup_message_id, test_data.session_id, "user", "duplicate", {}, { tx = dbtx })
                if message_err then return nil, message_err end

                return { artifact = artifact_result, message = message_result }
            end)

            test.is_nil(result)
            test.not_nil(run_err)

            local artifact, get_err = artifact_repo.get(artifact_id)
            test.is_nil(get_err)
            test.eq(artifact.content, "before-failure")
            test.eq(artifact.content_version, 1)

            -- The pre-committed row survives untouched.
            local message, message_get_err = message_repo.get(dup_message_id)
            test.is_nil(message_get_err)
            test.eq(message.data, "original")
        end)
    end)
end

return test.run_cases(define_tests)
