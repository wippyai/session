local test = require("test")
local uuid = require("uuid")
local security = require("security")
local tx = require("tx")
local writer = require("writer")
local artifact_repo = require("artifact_repo")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local wait_for_boot = require("wait_for_boot")

local function define_tests()
    describe("Session writer: artifact updates", function()
        local test_data = {
            user_id = uuid.v7(),
            context_id = uuid.v7(),
            session_id = uuid.v7(),
            other_context_id = uuid.v7(),
            other_session_id = uuid.v7(),
        }

        before_all(function()
            wait_for_boot.run()
            local actor = security.actor()
            if actor then test_data.user_id = actor:id() end
            test.is_nil(select(2, context_repo.create(test_data.context_id, "primary", "{}")))
            test.is_nil(select(2, session_repo.create(test_data.session_id, test_data.user_id,
                test_data.context_id, "Writer artifacts", "test")))
            test.is_nil(select(2, context_repo.create(test_data.other_context_id, "primary", "{}")))
            test.is_nil(select(2, session_repo.create(test_data.other_session_id, test_data.user_id,
                test_data.other_context_id, "Other session", "test")))
        end)

        after_all(function()
            session_repo.delete(test_data.session_id)
            session_repo.delete(test_data.other_session_id)
            context_repo.delete(test_data.context_id)
            context_repo.delete(test_data.other_context_id)
        end)

        local function new_writer(session_id)
            local session_writer, err = writer.new(session_id or test_data.session_id)
            test.is_nil(err)
            return session_writer :: any
        end

        it("checks ownership on the caller's transaction when opts.tx is given", function()
            local session_writer = new_writer()
            local artifact_id = uuid.v7()
            local result, err = tx.run(function(dbtx)
                local created, create_err = session_writer:create_artifact(artifact_id, "inline", "Made in tx",
                    "v1", { status = "active" }, { tx = dbtx })
                if not created then return nil, create_err end
                -- The artifact exists only inside this transaction so far.
                return session_writer:update_artifact(artifact_id, { title = "Renamed in tx" }, { tx = dbtx })
            end)
            test.is_nil(err)
            test.not_nil(result)
            test.is_true((result :: any).updated)
            local artifact: any = artifact_repo.get(artifact_id)
            test.eq(artifact.title, "Renamed in tx")
        end)

        it("refuses another session's artifact inside a transaction as well", function()
            local other_id = uuid.v7()
            test.not_nil(new_writer(test_data.other_session_id):create_artifact(other_id, "inline", "Other", "v1", {}))
            local session_writer = new_writer()
            local result, err = tx.run(function(dbtx)
                return session_writer:update_artifact(other_id, { title = "Taken" }, { tx = dbtx })
            end)
            test.is_nil(result)
            test.contains(tostring(err), "different session")
            test.eq((artifact_repo.get(other_id) :: any).title, "Other")
        end)

        it("keeps the kind of a conflict error and returns the update result", function()
            local session_writer = new_writer()
            local artifact_id = uuid.v7()
            test.not_nil(session_writer:create_artifact(artifact_id, "inline", "Versioned", "v1", {}))

            local bumped, bump_err = session_writer:update_artifact(artifact_id, { content = "v2" })
            test.is_nil(bump_err)
            test.eq((bumped :: any).content_version, 2)

            local stale, stale_err = session_writer:update_artifact(artifact_id, { content = "v3" },
                { expected_version = 1 })
            test.is_nil(stale)
            local ok, kind = pcall(function() return (stale_err :: any):kind() end)
            test.is_true(ok, "the error is structured, not a flattened string")
            test.eq(kind, errors.CONFLICT)
            test.contains(tostring(stale_err), "modified")

            local missing, missing_err = session_writer:update_artifact(uuid.v7(), { title = "x" })
            test.is_nil(missing)
            test.contains(tostring(missing_err), "not found")
        end)
    end)
end

return test.run_cases(define_tests)
