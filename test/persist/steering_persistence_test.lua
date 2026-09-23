local test = require("test")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local message_repo = require("message_repo")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local wait_for_boot = require("wait_for_boot")

local function define_tests()
    describe("durable steering inputs", function()
        local session_a, session_b, first, other
        local user_id
        before_all(function()
            wait_for_boot.run()
            local context_id = uuid.v7()
            local actor = security.actor()
            user_id = actor and actor:id() or uuid.v7()
            test.not_nil(context_repo.create(context_id, "primary", "steering test"))
            session_a, session_b = uuid.v7(), uuid.v7()
            test.not_nil(session_repo.create(session_a, user_id, context_id, "A", "test"))
            test.not_nil(session_repo.create(session_b, user_id, context_id, "B", "test"))
            first, other = uuid.v7(), uuid.v7()
            test.not_nil(message_repo.create(first, session_a, "user", "first", {
                client_message_id = "same-client", accepted_sequence = 1, file_uuids = { "file-1" },
                input = { state = "pending", steering = true },
            }))
            test.not_nil(message_repo.create(other, session_b, "user", "other", {
                client_message_id = "same-client", input = { state = "pending", steering = true },
            }))
            for index = 1, 501 do
                local row, err = message_repo.create(uuid.v7(), session_a, "assistant", tostring(index), {})
                test.is_nil(err)
                test.not_nil(row)
            end
        end)

        it("finds old receipts and pending input beyond the message page, scoped by session", function()
            local found, err = message_repo.find_by_client_message_id(session_a, "same-client")
            test.is_nil(err)
            test.eq(found.message_id, first)
            test.eq(message_repo.find_by_client_message_id(session_b, "same-client").message_id, other)
            local pending = message_repo.list_pending_inputs(session_a)
            test.eq(#pending, 1)
            test.eq((pending :: any)[1].message_id, first)
        end)

        it("retains pending input outside the prompt window without a checkpoint", function()
            local definition = contract.get("wippy.agent:run_context")
            local actor = security.new_actor(user_id, { source = "steering_test" })
            local scope = security.named_scope("app:test_group")
            local binding, open_err = definition:with_actor(actor):with_scope(scope):open("wippy.session.run_context:binding")
            test.is_nil(open_err)
            local result, err = binding:get_history({
                host = { kind = "session", session_id = session_a },
                selector = { mode = "since_checkpoint" },
            })
            test.is_nil(err)
            local retained = false
            for _, event in ipairs(result.events) do
                if event.id == first then
                    retained = true
                    test.eq(event.metadata.input.state, "pending")
                end
            end
            test.is_true(retained)
        end)

        it("rolls back the whole batch when a later row belongs to another session", function()
            local updates = {
                { message_id = first, metadata = { input = { state = "applied", steering = true, turn_id = "turn" } } },
                { message_id = other, metadata = { input = { state = "applied", steering = true, turn_id = "turn" } } },
            }
            local ok, err = message_repo.apply_inputs(session_a, updates)
            test.is_nil(ok)
            test.not_nil(err)
            test.eq(message_repo.get(first).metadata.input.state, "pending")
            test.eq(message_repo.get(other).metadata.input.state, "pending")
            ok, err = message_repo.apply_inputs(session_a, { updates[1] })
            test.is_nil(err)
            test.is_true(ok)
            local saved = message_repo.get(first)
            test.eq(saved.metadata.input.state, "applied")
            test.eq(saved.metadata.input.turn_id, "turn")
            test.eq(saved.metadata.file_uuids[1], "file-1")
            test.eq(#message_repo.list_pending_inputs(session_a), 0)
        end)

        it("fails closed when metadata needed for durable deduplication is unreadable", function()
            test.not_nil(message_repo.create(uuid.v7(), session_b, "user", "bad metadata", "{"))
            local rows, err = message_repo.list_all_by_session(session_b)
            test.is_nil(rows)
            test.not_nil(err)
            local found, find_err = message_repo.find_by_client_message_id(session_b, "same-client")
            test.is_nil(found)
            test.not_nil(find_err)
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
