local contract = require("contract")
local consts = require("consts")
local context_repo = require("context_repo")
local json = require("json")
local security = require("security")
local service = require("service")
local session_repo = require("session_repo")
local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local wait_for_boot = require("wait_for_boot")

local CONTRACT_ID = "wippy.session:session_service"
local BINDING_ID = "wippy.session:service_binding"
local TEST_ACTOR_ID = "session-service-test@wippy.local"

local tracked_sessions = {}
local tracked_contexts = {}

local function track_session(id)
    tracked_sessions[#tracked_sessions + 1] = id
    return id
end

local function track_context(id)
    tracked_contexts[#tracked_contexts + 1] = id
    return id
end

local function next_pair()
    return track_session(uuid.v7()), track_context(uuid.v7())
end

local function cleanup()
    local db_resource = consts.get_db_resource()
    local db, err = sql.get(db_resource)
    if err then
        return
    end

    local tx, tx_err = db:begin()
    if tx_err then
        db:release()
        return
    end

    for _, session_id in ipairs(tracked_sessions) do
        tx:execute("DELETE FROM artifacts WHERE session_id = $1", { session_id })
        tx:execute("DELETE FROM session_contexts WHERE session_id = $1", { session_id })
        tx:execute("DELETE FROM messages WHERE session_id = $1", { session_id })
        tx:execute("DELETE FROM sessions WHERE session_id = $1", { session_id })
    end

    for _, context_id in ipairs(tracked_contexts) do
        tx:execute("DELETE FROM contexts WHERE context_id = $1", { context_id })
    end

    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback()
    end
    db:release()

    tracked_sessions = {}
    tracked_contexts = {}
end

local function open_binding()
    local def, def_err = contract.get(CONTRACT_ID)
    test.is_nil(def_err, "contract.get: " .. tostring(def_err))
    test.not_nil(def)

    local actor = security.new_actor(TEST_ACTOR_ID, { source = "session_service_test" })
    local scope, scope_err = security.named_scope("wippy.session:test_group")
    test.is_nil(scope_err, "security.named_scope: " .. tostring(scope_err))
    test.not_nil(scope)

    local instance, open_err = def
        :with_actor(actor)
        :with_scope(scope)
        :open(BINDING_ID)
    test.is_nil(open_err, "contract.open: " .. tostring(open_err))
    test.not_nil(instance)
    return instance
end

local function define_tests()
    test.describe("session service", function()
        before_all(function()
            wait_for_boot.run()
            cleanup()
        end)

        after_all(cleanup)

        test.it("creates a session and owns the primary context", function()
            local session_id, context_id = next_pair()

            local result, err = service.ensure({
                session_id = session_id,
                user_id = TEST_ACTOR_ID,
                primary_context_id = context_id,
                title = "Service session",
                kind = "channel",
                meta = { source = "service_test" },
                config = { model = "test-model" },
                primary_context_data = { topic = "owned-context" }
            })

            test.is_nil(err, "ensure: " .. tostring(err))
            test.not_nil(result)
            test.is_true(result.created)
            test.is_false(result.recovered)
            test.eq(result.primary_context_id, context_id)
            test.eq(result.session.session_id, session_id)
            test.eq(result.session.status, consts.STATUS.IDLE)
            test.eq(result.session.kind, "channel")
            test.eq(result.session.meta.source, "service_test")

            local context_row, context_err = context_repo.get(context_id)
            test.is_nil(context_err, "context get: " .. tostring(context_err))
            test.eq(context_row.type, consts.CONTEXT_TYPES.SESSION)

            local decoded, decode_err = json.decode(context_row.data)
            test.is_nil(decode_err, "context decode: " .. tostring(decode_err))
            test.eq(decoded.topic, "owned-context")
        end)

        test.it("rehydrates an existing running session and resets it to idle", function()
            local session_id, context_id = next_pair()
            local created, create_err = service.ensure({
                session_id = session_id,
                user_id = TEST_ACTOR_ID,
                primary_context_id = context_id
            })
            test.is_nil(create_err, "initial ensure: " .. tostring(create_err))
            test.is_true(created.created)

            local updated, update_err = service.update({
                session_id = session_id,
                updates = { status = consts.STATUS.RUNNING }
            })
            test.is_nil(update_err, "status update: " .. tostring(update_err))
            test.eq(updated.status, consts.STATUS.RUNNING)

            local result, err = service.ensure({
                session_id = session_id,
                user_id = TEST_ACTOR_ID,
                primary_context_id = uuid.v7()
            })

            test.is_nil(err, "rehydrate ensure: " .. tostring(err))
            test.is_false(result.created)
            test.is_true(result.recovered)
            test.eq(result.primary_context_id, context_id)
            test.eq(result.session.status, consts.STATUS.IDLE)

            local row, get_err = session_repo.get(session_id, TEST_ACTOR_ID)
            test.is_nil(get_err, "session get: " .. tostring(get_err))
            test.eq(row.status, consts.STATUS.IDLE)
        end)

        test.it("can preserve running status when reset_status is disabled", function()
            local session_id, context_id = next_pair()
            local created, create_err = service.ensure({
                session_id = session_id,
                user_id = TEST_ACTOR_ID,
                primary_context_id = context_id
            })
            test.is_nil(create_err, "initial ensure: " .. tostring(create_err))
            test.is_true(created.created)

            local _, update_err = service.update({
                session_id = session_id,
                updates = { status = consts.STATUS.RUNNING }
            })
            test.is_nil(update_err, "status update: " .. tostring(update_err))

            local result, err = service.ensure({
                session_id = session_id,
                user_id = TEST_ACTOR_ID,
                reset_status = false
            })

            test.is_nil(err, "ensure reset disabled: " .. tostring(err))
            test.is_false(result.created)
            test.eq(result.session.status, consts.STATUS.RUNNING)
        end)

        test.it("deletes the session and its service-owned primary context", function()
            local session_id, context_id = next_pair()
            local created, create_err = service.ensure({
                session_id = session_id,
                user_id = TEST_ACTOR_ID,
                primary_context_id = context_id
            })
            test.is_nil(create_err, "initial ensure: " .. tostring(create_err))
            test.is_true(created.created)

            local deleted, delete_err = service.delete({
                session_id = session_id,
                user_id = TEST_ACTOR_ID
            })
            test.is_nil(delete_err, "delete: " .. tostring(delete_err))
            test.is_true(deleted.deleted)
            test.is_true(deleted.primary_context_deleted)

            local missing_session, session_err = service.get({
                session_id = session_id,
                user_id = TEST_ACTOR_ID
            })
            test.is_nil(missing_session)
            test.contains(tostring(session_err), "Session not found")

            local missing_context, context_err = context_repo.get(context_id)
            test.is_nil(missing_context)
            test.contains(tostring(context_err), "Context not found")
        end)

        test.it("routes service methods through the contract binding", function()
            local session_id, context_id = next_pair()
            local binding = open_binding()

            local result, err = binding:ensure({
                session_id = session_id,
                user_id = TEST_ACTOR_ID,
                primary_context_id = context_id,
                title = "Contract session"
            })
            test.is_nil(err, "binding ensure: " .. tostring(err))
            test.is_true(result.created)

            local update, update_err = binding:update({
                session_id = session_id,
                updates = { title = "Updated by binding", status = consts.STATUS.RUNNING }
            })
            test.is_nil(update_err, "binding update: " .. tostring(update_err))
            test.eq(update.title, "Updated by binding")

            local row, get_err = binding:get({
                session_id = session_id,
                user_id = TEST_ACTOR_ID
            })
            test.is_nil(get_err, "binding get: " .. tostring(get_err))
            test.eq(row.title, "Updated by binding")
            test.eq(row.status, consts.STATUS.RUNNING)

            local deleted, delete_err = binding:delete({
                session_id = session_id,
                user_id = TEST_ACTOR_ID
            })
            test.is_nil(delete_err, "binding delete: " .. tostring(delete_err))
            test.is_true(deleted.deleted)
        end)

        test.it("returns validation errors before touching storage", function()
            local result, err = service.ensure({ session_id = uuid.v7() })
            test.is_nil(result)
            test.contains(tostring(err), "user_id is required")

            result, err = service.ensure({
                session_id = uuid.v7(),
                user_id = TEST_ACTOR_ID,
                primary_context_data = 42
            })
            test.is_nil(result)
            test.contains(tostring(err), "primary_context_data must be a string or table")
        end)
    end)
end

return test.run_cases(define_tests)
