local test = require("test")
local sql = require("sql")
local consts = require("consts")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local message_repo = require("message_repo")
local reader = require("reader")
local writer = require("writer")
local json = require("json")
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

        it("commits interruption history with Stop and rolls it back on failure", function()
            local boundary = {
                message_id = uuid.v7(), data = "Do not resume interrupted work.",
                metadata = { interruption = { reason = "stop" } },
            }
            local ok, err = message_repo.stop_with_input_rollback(session_b, {}, {
                status = "running", meta = { interaction = { can_send = false, revision = 4 } },
            }, boundary)
            test.is_nil(err)
            test.is_true(ok)
            local stored = message_repo.get(boundary.message_id)
            test.not_nil(stored, "Stop commits a durable developer boundary")
            test.eq(stored.type, "developer")
            test.eq(stored.metadata.interruption.reason, "stop")
            test.eq(session_repo.get(session_b, user_id).meta.interaction.revision, 4)

            local duplicate = { message_id = uuid.v7(), data = boundary.data, metadata = boundary.metadata }
            test.is_true(message_repo.stop_with_input_rollback(session_b, {}, {}, duplicate))
            local missing = message_repo.get(duplicate.message_id)
            test.is_nil(missing, "recovery preserves the existing boundary")

            test.not_nil(message_repo.create(uuid.v7(), session_b, "user", "next turn", {}))
            local failed_boundary = { message_id = uuid.v7(), data = boundary.data, metadata = boundary.metadata }
            ok, err = message_repo.stop_with_input_rollback(session_b, {
                { message_id = first, metadata = { input = { state = "applied", after_message_id = "missing" } } },
            }, { status = "failed" }, failed_boundary)
            test.is_nil(ok)
            test.not_nil(err)
            test.is_nil(message_repo.get(failed_boundary.message_id))
            test.eq(session_repo.get(session_b, user_id).status, "running")
        end)

        it("ignores legacy metadata but rejects an explicit false input", function()
            local resource = consts.get_db_resource()
            local function set_raw_metadata(id, raw_metadata)
                local db, db_err = sql.get(resource)
                test.is_nil(db_err)
                local result, write_err = sql.builder.update("messages")
                    :set("metadata", raw_metadata):where("message_id = ?", id):run_with(db):exec()
                db:release()
                test.is_nil(write_err)
                test.eq(result.rows_affected, 1)
            end
            for _, raw_metadata in ipairs({ "", "null", "false" }) do
                local id = uuid.v7()
                test.not_nil(message_repo.create(id, session_a, "assistant", "legacy", {}))
                set_raw_metadata(id, raw_metadata)
            end
            local pending, err = message_repo.list_pending_inputs(session_a)
            test.is_nil(err)
            test.eq(#pending, 1)
            test.eq(pending[1].message_id, first)
            local invalid_id = uuid.v7()
            test.not_nil(message_repo.create(invalid_id, session_a, "user", "invalid input", {}))
            set_raw_metadata(invalid_id, '{"input":false}')
            local rejected, invalid_err = message_repo.list_pending_inputs(session_a)
            set_raw_metadata(invalid_id, '{}')
            test.is_nil(rejected)
            test.contains(invalid_err, "Malformed steering metadata")
        end)

        it("merges steering after a checkpoint without loading the archive", function()
            local context_id, session_id = uuid.v7(), uuid.v7()
            test.not_nil(context_repo.create(context_id, "primary", "archive test"))
            test.not_nil(session_repo.create(session_id, user_id, context_id, "Archive", "test"))
            local function add(kind, text, metadata)
                local id = uuid.v7()
                test.not_nil(message_repo.create(id, session_id, kind, text, metadata or {}))
                return id
            end
            local archived = add("assistant", "Archived output.")
            local anchored_in_archive = add("user", "Steering anchored in the archive.", {
                input = { state = "applied", after_message_id = archived } })
            local missing_anchor = add("user", "Steering whose anchor is gone.", {
                input = { state = "applied", after_message_id = "gone" } })
            local no_anchor = add("user", "Steering with no anchor.", { input = { state = "applied" } })
            local archived_pending = add("user", "Pending from before the checkpoint.", { input = { state = "pending" } })
            add("user", "An archived request.")
            local tool_row = add("function", "{}", { function_name = "t", status = "success",
                result = { input = { state = "pending" } } })
            local checkpoint = add("assistant", "The checkpoint anchor.")
            local at_checkpoint = add("user", "Steering at the anchor.", {
                input = { state = "applied", after_message_id = checkpoint } })
            local inside = add("assistant", "Inside the window.")
            local at_inside = add("user", "Steering inside the window.", {
                input = { state = "applied", after_message_id = inside } })
            local session_writer = assert(writer.new(session_id))
            assert(session_writer:set_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID, checkpoint))

            local list_all = message_repo.list_all_by_session
            local loaded = 0
            message_repo.list_all_by_session = function(...)
                loaded = loaded + 1
                return list_all(...)
            end
            local session_reader = assert(reader.open(session_id))
            local rows, err = session_reader:messages():from_checkpoint():all()
            local pending, pending_err = message_repo.list_pending_inputs(session_id)
            message_repo.list_all_by_session = list_all

            test.is_nil(err)
            test.is_nil(pending_err)
            test.eq(loaded, 0, "a prompt query does not read the archived rows")
            local ids = {}
            for _, row in ipairs(rows) do ids[row.message_id] = true end
            for _, expected in ipairs({ missing_anchor, no_anchor, archived_pending, checkpoint, at_checkpoint, inside, at_inside }) do
                test.is_true(ids[expected], "the window keeps " .. tostring(expected))
            end
            test.is_nil(ids[anchored_in_archive], "steering anchored in the archive stays there")
            test.is_nil(ids[archived])
            test.is_nil(ids[tool_row])
            test.eq(#rows, 7)
            test.eq(#pending, 1)
            test.eq(pending[1].message_id, archived_pending)

            -- The steering query reaches its rows through a session index on this database.
            local db = assert(sql.get(consts.get_db_resource()))
            local statement = "SELECT message_id, metadata FROM messages WHERE session_id = '" .. session_id
                .. "' AND metadata LIKE '%\"input\"%'"
            local plan
            if db:type() == sql.type.POSTGRES then
                local tx = assert(db:begin())
                assert(tx:execute("SET LOCAL enable_seqscan = off"))
                plan = assert(tx:query("EXPLAIN " .. statement))
                tx:rollback()
            else
                plan = assert(db:query("EXPLAIN QUERY PLAN " .. statement))
            end
            db:release()
            session_repo.delete(session_id)
            context_repo.delete(context_id)
            test.contains(json.encode(plan), "idx_messages_session_date")
        end)

        it("preserves malformed steering rows and fails the scan visibly", function()
            local id = uuid.v7()
            local rejected, validation_err = message_repo.create(id, session_b, "user", "bad metadata", {
                input = { state = "unknown" },
            })
            test.is_nil(rejected)
            test.not_nil(validation_err)
            test.not_nil(message_repo.create(id, session_b, "user", "bad metadata", {}))
            -- Simulate an existing corrupt row without passing through admission.
            local resource = consts.get_db_resource()
            local db, db_err = sql.get(resource)
            test.is_nil(db_err)
            local result, write_err = sql.builder.update("messages")
                :set("metadata", '{"input":{"state":"unknown"}}')
                :where("message_id = ?", id):run_with(db):exec()
            db:release()
            test.is_nil(write_err)
            test.eq(result.rows_affected, 1)
            local pending, err = message_repo.list_pending_inputs(session_b)
            test.is_nil(pending)
            test.contains(err, "Malformed steering metadata")
            test.eq(message_repo.get(id).metadata.input.state, "unknown")
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
