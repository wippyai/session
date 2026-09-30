-- Product-level replacement for test/probes/sql_transaction_probe_test.lua
-- (P0-11). Exercises the real call paths that share a transaction: an
-- artifact_repo.update(..., { tx = ... }) and a message_repo.create(...,
-- { tx = ... }) run on the same tx.run(fn) transaction, committing or
-- rolling back together. The tx.run block covers fn raising, a nested
-- tx.run, and repository calls that omit opts.tx inside a transaction.

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

    describe("tx.run", function()
        local test_data = { context_id = uuid.v7(), session_id = uuid.v7() }

        before_all(function()
            wait_for_boot.run()
            local actor = security.actor()
            local user_id = actor and actor:id() or uuid.v7()
            test.is_nil(select(2, context_repo.create(test_data.context_id, "primary", "tx.run context")))
            test.is_nil(select(2, session_repo.create(test_data.session_id, user_id, test_data.context_id,
                "tx.run session", "test")))
        end)

        after_all(function()
            session_repo.delete(test_data.session_id)
            context_repo.delete(test_data.context_id)
        end)

        local function connections_in_use()
            local db, err = sql.get(consts.get_db_resource())
            if not db then error(err) end
            local stats = db:stats()
            db:release()
            return stats.in_use
        end

        it("rolls back, re-raises the error and releases the connection when fn raises", function()
            local runs = 20
            local ids = {}
            local before = connections_in_use()
            for _ = 1, runs do
                local message_id = uuid.v7()
                table.insert(ids, message_id)
                local ok, raised = pcall(tx.run, function(dbtx)
                    local _, create_err = message_repo.create(message_id, test_data.session_id, "user",
                        "written before the raise", {}, { tx = dbtx })
                    if create_err then return nil, create_err end
                    error("fn raised on purpose", 0)
                end)
                test.is_false(ok)
                test.eq(raised, "fn raised on purpose")
            end
            -- Leaked connections would add one per run; other suites may
            -- hold a few at the same time.
            test.ok(connections_in_use() - before < runs, "connections are released after a raise")
            for _, id in ipairs(ids) do
                test.is_nil(message_repo.get(id), "the write before the raise was rolled back")
            end
            -- Nothing is left marked as inside a transaction.
            local after, after_err = tx.run(function(dbtx)
                return message_repo.create(uuid.v7(), test_data.session_id, "user", "after the raises", {}, { tx = dbtx })
            end)
            test.is_nil(after_err)
            test.not_nil(after)
        end)

        it("returns fn's error without raising when fn returns one", function()
            local result, err = tx.run(function() return nil, "stopped by fn" end)
            test.is_nil(result)
            test.eq(err, "stopped by fn")
        end)

        it("refuses a nested tx.run instead of opening a second transaction", function()
            local inner, inner_err
            local outer, outer_err = tx.run(function()
                inner, inner_err = tx.run(function() return "inner" end)
                return "outer"
            end)
            test.is_nil(outer_err)
            test.eq(outer, "outer")
            test.is_nil(inner)
            test.contains(tostring(inner_err), "opts.tx")
        end)

        it("refuses repository calls without opts.tx inside tx.run, and allows them again after", function()
            local message_id = uuid.v7()
            test.not_nil(message_repo.create(message_id, test_data.session_id, "user", "outside", {}))
            local inside, inside_err, session_inside, session_err, create_inside, create_err
            local _, run_err = tx.run(function()
                inside, inside_err = message_repo.get(message_id)
                session_inside, session_err = session_repo.get(test_data.session_id)
                create_inside, create_err = message_repo.create(uuid.v7(), test_data.session_id, "user", "nested", {})
                return true
            end)
            test.is_nil(run_err)
            test.is_nil(inside)
            test.contains(tostring(inside_err), "opts.tx")
            test.is_nil(session_inside)
            test.contains(tostring(session_err), "opts.tx")
            test.is_nil(create_inside)
            test.contains(tostring(create_err), "opts.tx")

            local outside, outside_err = message_repo.get(message_id)
            test.is_nil(outside_err)
            test.eq((outside :: any).data, "outside")
        end)
    end)
end

return test.run_cases(define_tests)
