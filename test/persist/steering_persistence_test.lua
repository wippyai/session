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
local message_handlers = require("message_handlers")
local message_order = require("message_order")
local session_handlers = require("session_handlers")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local wait_for_boot = require("wait_for_boot")

local function owner_id()
    local actor = security.actor()
    return actor and actor:id() or "owner"
end

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
                .. "' AND type = 'user' AND metadata LIKE '%\"input\"%' ORDER BY "
                .. message_order.date(db:type()) .. " ASC, message_id ASC"
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
            test.contains(json.encode(plan), "idx_messages_")
            test.is_nil((json.encode(plan):find("idx_messages_type (type=?)", 1, true)),
                "the session index narrows the read")
        end)

        describe("newest non-input row", function()
            local context_id, session_id
            before_each(function()
                context_id, session_id = uuid.v7(), uuid.v7()
                test.not_nil(context_repo.create(context_id, "primary", "anchor test"))
                test.not_nil(session_repo.create(session_id, user_id, context_id, "Anchor", "test"))
            end)
            after_each(function()
                session_repo.delete(session_id)
                context_repo.delete(context_id)
            end)

            local function add(kind, text, metadata)
                local id = uuid.v7()
                test.not_nil(message_repo.create(id, session_id, kind, text, metadata or {}))
                return id
            end

            -- The definition the query replaces: the last row without steering metadata.
            local function by_full_read(excluded)
                local anchor = nil
                for _, row in ipairs(assert(message_repo.list_all_by_session(session_id))) do
                    local metadata = type(row.metadata) == "table" and row.metadata or nil
                    if not (metadata and metadata.input ~= nil) and row.message_id ~= excluded then
                        anchor = row.message_id
                    end
                end
                return anchor
            end

            local function assert_matches(excluded, expected)
                local found, err = assert(reader.open(session_id)):newest_non_input_id(excluded)
                test.is_nil(err)
                test.eq(found, expected)
                test.eq(found, by_full_read(excluded))
            end

            it("is empty without a qualifying row", function()
                assert_matches(nil, nil)
                local only = add("user", "Only.")
                assert_matches(only, nil)
                add("user", "Steering.", { input = { state = "pending" } })
                assert_matches(only, nil)
            end)

            it("skips steering and the new user row, and keeps rows with a nested input key", function()
                local tool = add("function", "{}", { function_name = "t", status = "success",
                    result = { input = { state = "pending" } } })
                assert_matches(nil, tool)
                local steering = add("user", "Steering.", { input = { state = "pending" } })
                assert_matches(nil, tool)
                local request = add("user", "Request.")
                assert_matches(nil, request)
                assert_matches(request, tool)
                test.not_nil(steering)
            end)

            it("pages past a tail of steering rows longer than one page", function()
                local answer = add("assistant", "Answer.")
                for index = 1, 45 do add("user", "Steering " .. index, { input = { state = "pending" } }) end
                assert_matches(nil, answer)
            end)

            it("orders rows that share one date by id", function()
                local rows = {}
                for index = 1, 3 do
                    rows[index] = { message_id = uuid.v7(), type = "assistant", data = "Row " .. index, metadata = {} }
                end
                assert(message_repo.create_batch(session_id, rows))
                assert_matches(nil, rows[3].message_id)
                assert_matches(rows[3].message_id, rows[2].message_id)
            end)

            -- The merge rule applied to a full read, the reference the targeted query must match.
            local function reference_window(window_ids, after_id)
                local all = assert(message_repo.list_all_by_session(session_id))
                local exists, expected = {}, {}
                for _, row in ipairs(all) do exists[row.message_id] = true end
                for id in pairs(window_ids) do expected[id] = true end
                for _, row in ipairs(all) do
                    local input = type(row.metadata) == "table" and row.metadata.input or nil
                    if type(input) == "table" then
                        local anchor = input.after_message_id
                        if input.state == "pending" or (input.state == "applied" and (not anchor or not exists[anchor]
                            or window_ids[anchor] or anchor == after_id)) then
                            expected[row.message_id] = true
                        end
                    end
                end
                return expected
            end

            it("selects steering without loading rows that only nest an input key", function()
                local nested = {}
                for index = 1, 30 do
                    nested[index] = add("function", string.rep("p", 2000), { function_name = "t", status = "success",
                        result = { input = { state = "pending" }, index = index } })
                end
                local archived = add("assistant", "Archived.")
                local archived_steering = add("user", "Anchored in the archive.", {
                    input = { state = "applied", after_message_id = archived } })
                local user_nested = add("user", "Only nests the key.", {
                    context_attachments = {{ attachment_id = "c1", input = "value" }} })
                local missing = add("user", "Anchor gone.", { input = { state = "applied", after_message_id = "gone" } })
                local bare = add("user", "No anchor.", { input = { state = "applied" } })
                local pending = add("user", "Pending.", { input = { state = "pending" } })
                local checkpoint = add("assistant", "Anchor.")
                local at_checkpoint = add("user", "At the anchor.", {
                    input = { state = "applied", after_message_id = checkpoint } })
                local inside = add("assistant", "Inside.")
                local at_inside = add("user", "Inside the window.", {
                    input = { state = "applied", after_message_id = inside } })
                assert(assert(writer.new(session_id)):set_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID, checkpoint))

                local candidates = assert(message_repo.list_steering_candidates(session_id))
                local candidate_ids = {}
                for _, row in ipairs(candidates) do
                    candidate_ids[row.message_id] = true
                    test.is_nil(row.data, "candidates carry no payload")
                end
                for _, id in ipairs(nested) do test.is_nil(candidate_ids[id], "a tool row is never selected") end
                test.is_nil(candidate_ids[user_nested], "a nested key on a user row is not steering")
                test.eq(#candidates, 6)

                local rows = assert(assert(reader.open(session_id)):messages():from_checkpoint():all())
                local got = {}
                for _, row in ipairs(rows) do
                    got[row.message_id] = true
                    test.not_nil(row.data, "rows the prompt uses carry their text")
                end
                local expected = reference_window({ [checkpoint] = true, [at_checkpoint] = true, [inside] = true, [at_inside] = true }, checkpoint)
                for id in pairs(expected) do test.is_true(got[id], "reference row " .. id) end
                for id in pairs(got) do test.is_true(expected[id], "extra row " .. id) end
                test.is_nil(got[archived_steering], "archived steering stays out")
                test.is_true(got[missing] and got[bare] and got[pending])

                local pending_rows = assert(message_repo.list_pending_inputs(session_id))
                test.eq(#pending_rows, 1)
                test.eq(pending_rows[1].message_id, pending)
                test.eq(pending_rows[1].data, "Pending.")
            end)

            it("writes the steering key in the form the query selects", function()
                local id = add("user", "Pending.", { input = { state = "pending" } })
                local db = assert(sql.get(consts.get_db_resource()))
                local rows = assert(db:query("SELECT metadata FROM messages WHERE message_id = $1", { id }))
                db:release()
                test.contains(rows[1].metadata, '"input"')
                test.eq(#assert(message_repo.list_steering_candidates(session_id)), 1)
            end)

            it("keeps steering sent during a tool when the next step compacts", function()
                local request = add("user", "The request.")
                local assistant = add("assistant", "Working.", { source_id = request })
                local tool = add("function", "{}", { function_name = "t", call_id = "c1",
                    status = "success", result = "Tool result." })
                local steering = add("user", "STEERTEXT do the other thing.", { input = { state = "pending" } })
                local session_writer = assert(writer.new(session_id))
                local session_reader = assert(reader.open(session_id))
                local cut, sent = nil, {}
                local agent = { id = "agent:steps", model = "model:test", tool_wrappers = {}, agent_options = {},
                    step = function(_self, _builder, options)
                        local replacement, compact_err = options.checkpoint.compact({ estimated_prompt_tokens = 5000 })
                        test.is_nil(compact_err)
                        for _, message in ipairs(replacement:get_messages()) do
                            for _, part in ipairs(message.content or {}) do sent[#sent + 1] = part.text or "" end
                        end
                        return { result = "Done." }
                    end }
                local ctx = {
                    session_id = session_id, user_id = owner_id(), lifecycle_state = {},
                    config = { agent_id = agent.id, model = agent.model, token_checkpoint_threshold = 1000,
                        checkpoint_function_id = "app:summary" },
                    reader = session_reader, writer = session_writer,
                    turn_state = { active = true, steps = 1, repeated_calls = 0, message_id = request },
                    upstream = {
                        response_beginning = function() end, send_message_update = function() end,
                        invalidate_message = function() end, message_error = function() end,
                        update_session = function() end, session_error = function() end,
                    },
                    agent_ctx = { load_agent = function() return agent, nil end,
                        get_current_agent = function() return agent end },
                }
                local create_checkpoint = session_handlers.create_checkpoint
                session_handlers.create_checkpoint = function(_, op)
                    cut = op.checkpoint_id
                    local committed, commit_err = session_writer:commit_checkpoint(op, "Summary of the turn.", {})
                    if not committed then return nil, commit_err end
                    assert(session_reader:reset())
                    return { completed = true }
                end
                local ok, result, err = pcall(message_handlers.agent_step, ctx,
                    { message_id = request, request_id = "req-steer", from_user = false })
                session_handlers.create_checkpoint = create_checkpoint

                test.is_true(ok, tostring(result))
                test.is_nil(err)
                test.eq(result.completed, true)
                test.eq(cut, tool, "the cut stays on the last settled row")
                test.not_nil(assistant)
                test.contains(table.concat(sent, "\n"), "STEERTEXT do the other thing.")
                test.eq(assert(message_repo.get(steering)).metadata.input.after_message_id, tool)
            end)

            it("reaches the newest rows through a session index", function()
                local db = assert(sql.get(consts.get_db_resource()))
                local statement = "SELECT message_id, metadata FROM messages WHERE session_id = '" .. session_id
                    .. "' ORDER BY " .. message_order.date(db:type()) .. " DESC, message_id DESC LIMIT 21"
                local plan, expected
                if db:type() == sql.type.POSTGRES then
                    local tx = assert(db:begin())
                    assert(tx:execute("SET LOCAL enable_seqscan = off"))
                    plan = assert(tx:query("EXPLAIN " .. statement))
                    tx:rollback()
                    expected = "idx_messages_session_date"
                else
                    plan = assert(db:query("EXPLAIN QUERY PLAN " .. statement))
                    expected = "idx_messages_chronology"
                end
                db:release()
                test.contains(json.encode(plan), expected)
            end)

            it("runs a full agent step after a checkpoint without reading the archive", function()
                for index = 1, 30 do add("assistant", "Archived " .. index) end
                local checkpoint = add("assistant", "The checkpoint anchor.")
                local newest = add("assistant", "Inside the window.")
                local steering = add("user", "Steer now.", { input = { state = "pending" } })
                local request = add("user", "The next request.")
                local session_writer = assert(writer.new(session_id))
                assert(session_writer:set_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID, checkpoint))
                local session_reader = assert(reader.open(session_id))

                local sent = {}
                local agent = { id = "agent:steps", model = "model:test", tool_wrappers = {}, agent_options = {},
                    step = function(_self, builder)
                        for _, message in ipairs(builder:get_messages()) do
                            for _, part in ipairs(message.content or {}) do sent[#sent + 1] = part.text end
                        end
                        return { result = "Answer." }
                    end }
                local ctx = {
                    session_id = session_id, user_id = user_id, lifecycle_state = {},
                    config = { agent_id = agent.id, model = agent.model },
                    reader = session_reader, writer = session_writer,
                    upstream = {
                        response_beginning = function() end, send_message_update = function() end,
                        invalidate_message = function() end, message_error = function() end,
                        update_session = function() end, session_error = function() end,
                    },
                    agent_ctx = { load_agent = function() return agent, nil end,
                        get_current_agent = function() return agent end },
                }

                local list_all = message_repo.list_all_by_session
                local loaded = 0
                message_repo.list_all_by_session = function(...)
                    loaded = loaded + 1
                    return list_all(...)
                end
                local ok, result, err = pcall(message_handlers.agent_step, ctx,
                    { message_id = request, request_id = "req-anchor", from_user = true })
                message_repo.list_all_by_session = list_all

                test.is_true(ok, tostring(result))
                test.is_nil(err)
                test.is_true(result.completed)
                test.eq(loaded, 0, "an agent step after a checkpoint does not read the archive")
                local stored = assert(message_repo.get(steering))
                test.eq(stored.metadata.input.state, "applied")
                test.eq(stored.metadata.input.after_message_id, newest, "steering anchors after the newest row")
                local text = table.concat(sent, "\n")
                test.contains(text, "Steer now.")
                test.contains(text, "The next request.")
                test.is_nil((text:find("Archived 1", 1, true)))
            end)
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
