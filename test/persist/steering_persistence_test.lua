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
        local session_a, session_b, first, other, user_id
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
                file_uuids = { "file-1" }, input = { state = "pending" },
            }))
            test.not_nil(message_repo.create(other, session_b, "user", "other", {
                input = { state = "pending" },
            }))
            for index = 1, 501 do
                local row, err = message_repo.create(uuid.v7(), session_a, "assistant", tostring(index), {})
                test.is_nil(err)
                test.not_nil(row)
            end
        end)

        it("finds pending input beyond the normal history page", function()
            local started = os.clock()
            local pending, err = message_repo.list_pending_inputs(session_a)
            local elapsed = os.clock() - started
            test.is_nil(err)
            test.eq(#pending, 1)
            test.eq((pending :: any)[1].message_id, first)
            test.is_true(elapsed >= 0)
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
                { message_id = first, metadata = { input = { state = "applied", after_message_id = "anchor" } } },
                { message_id = other, metadata = { input = { state = "applied", after_message_id = "anchor" } } },
            }
            local ok, err = message_repo.apply_inputs(session_a, updates, 0)
            test.is_nil(ok)
            test.not_nil(err)
            test.eq(message_repo.get(first).metadata.input.state, "pending")
            test.eq(message_repo.get(other).metadata.input.state, "pending")
            ok, err = message_repo.apply_inputs(session_a, { updates[1] }, 0)
            test.is_nil(err)
            test.is_true(ok)
            local saved = message_repo.get(first)
            test.eq(saved.metadata.input.state, "applied")
            test.eq(saved.metadata.input.after_message_id, "anchor")
            test.eq(saved.metadata.file_uuids[1], "file-1")
            test.eq(#message_repo.list_pending_inputs(session_a), 0)
            ok, err = message_repo.stop_with_input_rollback(session_a, { updates[1] }, {
                status = "running",
                meta = { interaction = { can_send = false, revision = 1 } },
            })
            test.is_nil(err)
            test.is_true(ok)
            saved = message_repo.get(first)
            test.eq(saved.metadata.input.state, "pending")
            test.is_nil(saved.metadata.input.after_message_id)
            test.eq(saved.metadata.file_uuids[1], "file-1")
            local stored = session_repo.get(session_a, user_id)
            test.is_false(stored.meta.interaction.can_send)
            test.eq(stored.meta.interaction.revision, 1)

            ok, err = message_repo.apply_inputs(session_a, { updates[1] }, 0)
            test.is_nil(ok)
            test.contains(err, "revision changed")
            test.eq(message_repo.get(first).metadata.input.state, "pending")
        end)

        it("commits a first message and running interaction together", function()
            local id = uuid.v7()
            local row, err = message_repo.admit(id, session_b, "user", "new turn", {}, {
                status = "running", meta = { interaction = { can_send = false, revision = 3 } },
            })
            test.is_nil(err)
            test.not_nil(row)
            local stored = session_repo.get(session_b, user_id)
            test.eq(stored.status, "running")
            test.is_false(stored.meta.interaction.can_send)
            test.eq(stored.meta.interaction.revision, 3)
            test.eq(message_repo.get(id).data, "new turn")
        end)

        it("preserves malformed steering rows and fails the scan visibly", function()
            local id = uuid.v7()
            test.not_nil(message_repo.create(id, session_b, "user", "bad metadata", {
                input = { state = "unknown" },
            }))
            local pending, err = message_repo.list_pending_inputs(session_b)
            test.is_nil(pending)
            test.contains(err, "Malformed steering metadata")
            test.eq(message_repo.get(id).metadata.input.state, "unknown")
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
