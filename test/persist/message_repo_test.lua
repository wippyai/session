local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local json = require("json")
local message_repo = require("message_repo")
local writer = require("writer")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local time = require("time")
local security = require("security")
local consts = require("consts")
local wait_for_boot = require("wait_for_boot")

local function define_tests()
    describe("Message Repository", function()
        -- Test data
        local test_data = {
            user_id = uuid.v7(),
            context_id = uuid.v7(),
            session_id = uuid.v7(),
            message_id = uuid.v7(),
            message_id2 = uuid.v7()
        }
        local actor = security.actor()
        if actor then
            test_data.user_id = actor:id()
        end

        local function recover_after_written_result(call_type)
            local session_writer, writer_err = writer.new(test_data.session_id)
            test.is_nil(writer_err)
            local assistant_id, call_ids, response_err = session_writer:add_response("thinking", {}, {
                { id = "written", name = "first", arguments = "{}", type = call_type },
                { id = "unfinished", name = "second", arguments = "{}", type = call_type }
            })
            test.is_nil(response_err)
            test.not_nil(assistant_id)
            test.not_nil(call_ids)
            local _, result_err = session_writer:update_message_meta(call_ids.written, {
                status = consts.FUNC_STATUS.SUCCESS, result = "written result"
            })
            test.is_nil(result_err)

            local recovered, recovery_err = message_repo.recover_pending(test_data.session_id)
            test.is_nil(recovery_err)
            test.eq(recovered, 1)
            local written = message_repo.get(call_ids.written)
            test.eq(written.metadata.status, consts.FUNC_STATUS.SUCCESS)
            test.eq(written.metadata.result, "written result")
            local unfinished = message_repo.get(call_ids.unfinished)
            test.eq(unfinished.metadata.status, consts.FUNC_STATUS.ERROR)
            test.eq(unfinished.metadata.result, "interrupted, outcome unknown")

            message_repo.delete(assistant_id)
            message_repo.delete(call_ids.written)
            message_repo.delete(call_ids.unfinished)
        end

        -- Setup test environment before all tests
        before_all(function()
            wait_for_boot.run()

            -- Create a test context
            local context, err = context_repo.create(
                test_data.context_id,
                "primary",
                "Test context data"
            )

            if err then
                error("Failed to create test context: " .. err)
            end

            -- Create a test session
            local session, err = session_repo.create(
                test_data.session_id,
                test_data.user_id,
                test_data.context_id,
                "Test Session",
                "test"
            )

            if err then
                error("Failed to create test session: " .. err)
            end
        end)

        -- Clean up test data after all tests
        after_all(function()
            -- Get a database connection for cleanup
            local db_resource, _ = consts.get_db_resource()
            local db, err = sql.get(db_resource)
            if err then
                error("Failed to connect to database: " .. err)
            end

            -- Begin transaction for cleanup
            local tx, err = db:begin()
            if err then
                db:release()
                error("Failed to begin transaction: " .. err)
            end

            -- Delete test data in proper order (respecting foreign key constraints)
            tx:execute("DELETE FROM messages WHERE session_id = $1", { test_data.session_id })
            tx:execute("DELETE FROM session_contexts WHERE session_id = $1", { test_data.session_id })
            tx:execute("DELETE FROM sessions WHERE session_id = $1", { test_data.session_id })
            tx:execute("DELETE FROM contexts WHERE context_id = $1", { test_data.context_id })

            -- Commit transaction
            local success, err = tx:commit()
            if err then
                tx:rollback()
                db:release()
                error("Failed to commit cleanup transaction: " .. err)
            end

            db:release()
        end)

        it("should create a message with string data", function()
            local message, err = message_repo.create(
                test_data.message_id,
                test_data.session_id,
                "user",
                "This is a test message"
            )

            test.is_nil(err)
            test.not_nil(message)
            test.eq(message.message_id, test_data.message_id)
            test.eq(message.session_id, test_data.session_id)
            test.eq(message.type, "user")
            test.not_nil(message.date)
        end)

        it("commits an assistant and all pending calls together and resolves them on recovery", function()
            local assistant_id = uuid.v7()
            local first_id = uuid.v7()
            local second_id = uuid.v7()
            local ok, err = message_repo.create_batch(test_data.session_id, {
                { message_id = assistant_id, type = consts.MSG_TYPE.ASSISTANT, data = "",
                    metadata = { thinking_blocks = {{ type = "thinking", thinking = "work", signature = "sig" }} } },
                { message_id = first_id, type = consts.MSG_TYPE.FUNCTION, data = "{}",
                    metadata = { call_id = "first", function_name = "one", status = consts.FUNC_STATUS.PENDING } },
                { message_id = second_id, type = consts.MSG_TYPE.FUNCTION, data = "{}",
                    metadata = { call_id = "second", function_name = "two", status = consts.FUNC_STATUS.PENDING } }
            })
            test.is_nil(err)
            test.is_true(ok)
            local recovered, recovery_err = message_repo.recover_pending(test_data.session_id)
            test.is_nil(recovery_err)
            test.eq(recovered, 2)
            local first = message_repo.get(first_id)
            local second = message_repo.get(second_id)
            test.eq(first.metadata.status, consts.FUNC_STATUS.ERROR)
            test.eq(second.metadata.status, consts.FUNC_STATUS.ERROR)
            test.eq(first.metadata.result, "interrupted, outcome unknown")
            local rows = message_repo.list_by_session(test_data.session_id, 500)
            local positions = {}
            for index, row in ipairs(rows.messages) do positions[row.message_id] = index end
            test.lt(positions[assistant_id] :: number, positions[first_id] :: number)
            test.lt(positions[first_id] :: number, positions[second_id] :: number)
            message_repo.delete(assistant_id)
            message_repo.delete(first_id)
            message_repo.delete(second_id)
        end)

        it("keeps a written function result when recovery interrupts unfinished calls", function()
            recover_after_written_result(consts.MSG_TYPE.FUNCTION)
        end)

        it("keeps a written private function result when recovery interrupts unfinished calls", function()
            recover_after_written_result(consts.MSG_TYPE.PRIVATE_FUNCTION)
        end)

        it("keeps a written delegation result when recovery interrupts unfinished calls", function()
            recover_after_written_result(consts.MSG_TYPE.DELEGATION)
        end)

        it("rejects duplicate response call ids before writing any response rows", function()
            local context_id = uuid.v7()
            local session_id = uuid.v7()
            context_repo.create(context_id, "primary", "{}")
            session_repo.create(session_id, test_data.user_id, context_id, "Duplicate calls", "test")
            local session_writer, writer_err = writer.new(session_id)
            test.is_nil(writer_err)
            test.not_nil(session_writer)
            local assistant_id, call_ids, response_err = session_writer:add_response("answer", {}, {
                { id = "duplicate", name = "first", arguments = "{}", type = consts.MSG_TYPE.FUNCTION },
                { id = "duplicate", name = "second", arguments = "{}", type = consts.MSG_TYPE.FUNCTION }
            })

            test.is_nil(assistant_id)
            test.is_nil(call_ids)
            test.contains(tostring(response_err), "Duplicate tool call ID")
            local after = message_repo.list_by_session(session_id, 500)
            test.eq(#after.messages, 0)
            local pending_after = 0
            for _, message in ipairs(after.messages) do
                if message.metadata and message.metadata.status == consts.FUNC_STATUS.PENDING then
                    pending_after = pending_after + 1
                end
            end
            test.eq(pending_after, 0)
            local empty_id, _, empty_err = session_writer:add_response("answer", {}, {
                { id = "", name = "first", arguments = "{}", type = consts.MSG_TYPE.FUNCTION }
            })
            test.is_nil(empty_id)
            test.contains(tostring(empty_err), "Tool call ID")
            local blank_id, _, blank_err = session_writer:add_response("answer", {}, {
                { id = "   ", name = "first", arguments = "{}", type = consts.MSG_TYPE.FUNCTION }
            })
            test.is_nil(blank_id)
            test.contains(tostring(blank_err), "Tool call ID")
            test.eq(#message_repo.list_by_session(session_id, 500).messages, 0)
            session_repo.delete(session_id)
            context_repo.delete(context_id)
        end)

        it("recovers pending calls without decoding unrelated history", function()
            local unrelated_id = uuid.v7()
            local resource = consts.get_db_resource()
            local db, db_err = sql.get(resource)
            if not db then error(db_err) end
            local _, insert_err = db:execute(
                "INSERT INTO messages (message_id, session_id, date, type, data, metadata) VALUES ($1, $2, $3, $4, $5, $6)",
                { unrelated_id, test_data.session_id, time.now():format(time.RFC3339NANO),
                    consts.MSG_TYPE.USER, "unrelated", "{malformed" })
            db:release()
            test.is_nil(insert_err)
            local recovered, recovery_err = message_repo.recover_pending(test_data.session_id)
            message_repo.delete(unrelated_id)
            test.is_nil(recovery_err)
            test.eq(recovered, 0)
        end)

        it("recovers all pending calls in the prompt window", function()
            local rows = {}
            local ids = {}
            for index = 1, 130 do
                local id = uuid.v7()
                table.insert(ids, id)
                table.insert(rows, { message_id = id, type = consts.MSG_TYPE.FUNCTION,
                    data = "{}", metadata = { call_id = "page-" .. tostring(index),
                        status = consts.FUNC_STATUS.PENDING } })
            end
            local created, create_err = message_repo.create_batch(test_data.session_id, rows)
            test.is_nil(create_err)
            test.is_true(created)
            local recovered, recovery_err = message_repo.recover_pending(test_data.session_id)
            for _, id in ipairs(ids) do message_repo.delete(id) end
            test.is_nil(recovery_err)
            test.eq(recovered, 130)
        end)

        it("recovers a pending call older than the first 500 rows without a checkpoint", function()
            local rows = {}
            local pending_id = uuid.v7()
            table.insert(rows, { message_id = pending_id, type = consts.MSG_TYPE.FUNCTION,
                data = "{}", metadata = { status = consts.FUNC_STATUS.PENDING } })
            for index = 1, 510 do
                table.insert(rows, { message_id = uuid.v7(), type = consts.MSG_TYPE.USER,
                    data = "row " .. tostring(index), metadata = {} })
            end
            local created, create_err = message_repo.create_batch(test_data.session_id, rows)
            test.is_nil(create_err)
            test.is_true(created)
            local recovered, recovery_err = message_repo.recover_pending(test_data.session_id)
            local pending = message_repo.get(pending_id)
            for _, row in ipairs(rows) do message_repo.delete(row.message_id) end
            test.is_nil(recovery_err)
            test.eq(recovered, 1)
            test.eq(pending.metadata.status, consts.FUNC_STATUS.ERROR)
        end)

        it("recovers only pending calls in the inclusive checkpoint window", function()
            local before_id = uuid.v7()
            local anchor_id = uuid.v7()
            local rows = {
                { message_id = before_id, type = consts.MSG_TYPE.FUNCTION, data = "{}",
                    metadata = { status = consts.FUNC_STATUS.PENDING } },
                { message_id = anchor_id, type = consts.MSG_TYPE.ASSISTANT, data = "anchor", metadata = {} }
            }
            local pending = {}
            local completed = {}
            for _, msg_type in ipairs({ consts.MSG_TYPE.FUNCTION,
                consts.MSG_TYPE.PRIVATE_FUNCTION, consts.MSG_TYPE.DELEGATION }) do
                local pending_id = uuid.v7()
                local completed_id = uuid.v7()
                table.insert(pending, pending_id)
                table.insert(completed, completed_id)
                table.insert(rows, { message_id = pending_id, type = msg_type,
                    data = "{}", metadata = { status = consts.FUNC_STATUS.PENDING } })
                table.insert(rows, { message_id = completed_id, type = msg_type,
                    data = "{}", metadata = { status = consts.FUNC_STATUS.SUCCESS, result = "done" } })
            end
            local created, create_err = message_repo.create_batch(test_data.session_id, rows)
            test.is_nil(create_err)
            test.is_true(created)
            local recovered, recover_err = message_repo.recover_pending(test_data.session_id, anchor_id)
            test.is_nil(recover_err)
            test.eq(recovered, 3)
            test.eq(message_repo.get(before_id).metadata.status, consts.FUNC_STATUS.PENDING)
            for _, id in ipairs(pending) do
                local row = message_repo.get(id)
                test.eq(row.metadata.status, consts.FUNC_STATUS.ERROR)
                test.eq(row.metadata.result, "interrupted, outcome unknown")
            end
            for _, id in ipairs(completed) do
                test.eq(message_repo.get(id).metadata.status, consts.FUNC_STATUS.SUCCESS)
            end
            for _, row in ipairs(rows) do message_repo.delete(row.message_id) end
        end)

        it("rolls back the assistant if any call intent cannot be stored", function()
            local assistant_id = uuid.v7()
            local _, err = message_repo.create_batch(test_data.session_id, {
                { message_id = assistant_id, type = consts.MSG_TYPE.ASSISTANT, data = "", metadata = {} },
                { message_id = assistant_id, type = consts.MSG_TYPE.FUNCTION, data = "{}",
                    metadata = { call_id = "duplicate", function_name = "lookup", status = consts.FUNC_STATUS.PENDING } }
            })
            test.not_nil(err)
            local row = message_repo.get(assistant_id)
            test.is_nil(row)
        end)

        it("orders a held id minted before the round after its call results when written later", function()
            local held_id = uuid.v7()
            local assistant_id = uuid.v7()
            local call_id = uuid.v7()
            local created, create_err = message_repo.create_batch(test_data.session_id, {
                { message_id = assistant_id, type = consts.MSG_TYPE.ASSISTANT,
                    data = "answer", metadata = {} },
                { message_id = call_id, type = consts.MSG_TYPE.FUNCTION,
                    data = "{}", metadata = { status = consts.FUNC_STATUS.SUCCESS,
                        result = "done", call_id = "call" } }
            })
            test.is_nil(create_err)
            test.is_true(created)
            local session_writer, writer_err = writer.new(test_data.session_id)
            test.is_nil(writer_err)
            local stored_id, held_err = session_writer:add_message(consts.MSG_TYPE.USER,
                "held", { message_id = held_id })
            test.is_nil(held_err)
            test.eq(stored_id, held_id)
            local window, window_err = message_repo.list_after_message(test_data.session_id, assistant_id)
            test.is_nil(window_err)
            test.eq(window[#window - 2].message_id, assistant_id)
            test.eq(window[#window - 1].message_id, call_id)
            test.eq(window[#window].message_id, held_id)
            message_repo.delete(assistant_id)
            message_repo.delete(call_id)
            message_repo.delete(held_id)
        end)

        it("should create a message with binary data and metadata", function()
            local metadata = {
                model = "test-model",
                tokens = {
                    prompt = 10,
                    completion = 5
                }
            }

            local message, err = message_repo.create(
                test_data.message_id2,
                test_data.session_id,
                "assistant",
                "This is a response message",
                metadata
            )

            test.is_nil(err)
            test.not_nil(message)
            test.eq(message.message_id, test_data.message_id2)
            test.eq(message.session_id, test_data.session_id)
            test.eq(message.type, "assistant")
        end)

        it("should get a message by ID", function()
            local message, err = message_repo.get(test_data.message_id)

            test.is_nil(err)
            test.not_nil(message)
            test.eq(message.message_id, test_data.message_id)
            test.eq(message.session_id, test_data.session_id)
            test.eq(message.type, "user")
            test.eq(message.data, "This is a test message")
        end)

        it("should parse metadata JSON when retrieving", function()
            local message, err = message_repo.get(test_data.message_id2)

            test.is_nil(err)
            test.not_nil(message)
            test.not_nil(message.metadata)
            test.eq(message.metadata.model, "test-model")
            test.eq(message.metadata.tokens.prompt, 10)
            test.eq(message.metadata.tokens.completion, 5)
        end)

        it("should list messages by session ID", function()
            local messages, err = message_repo.list_by_session(test_data.session_id)

            test.is_nil(err)
            test.not_nil(messages.messages)
            test.eq(#messages.messages, 2)
        end)

        it("should list messages by session ID with cursor pagination", function()
            -- Create additional messages to test pagination
            local message_ids = {}
            for i = 1, 5 do
                local message_id = uuid.v7()
                table.insert(message_ids, message_id)

                local result, err = message_repo.create(
                    message_id,
                    test_data.session_id,
                    "test_pagination",
                    "Message " .. i
                )
                test.is_nil(err)
                test.not_nil(result)
            end

            -- Test default pagination (no cursor)
            local result, err = message_repo.list_by_session(test_data.session_id)

            test.is_nil(err)
            test.not_nil(result)
            test.not_nil(result.messages)
            test.ok(#result.messages > 3)

            -- Extract cursor from first result
            assert(result.messages)
            local cursor = result.messages[3].message_id

            -- Test "before" pagination (older messages)
            local before_result, err = message_repo.list_by_session(test_data.session_id, 2, cursor, "before")
            test.is_nil(err)
            test.not_nil(before_result)
            test.not_nil(before_result.messages)
            test.eq(#before_result.messages, 2)
            test.not_nil(before_result.next_cursor)

            -- Test "after" pagination (newer messages)
            local after_result, err = message_repo.list_by_session(test_data.session_id, 2, cursor, "after")
            test.is_nil(err)
            test.not_nil(after_result)
            test.not_nil(after_result.messages)

            -- Test pagination with limit
            local limit_result, err = message_repo.list_by_session(test_data.session_id, 3)
            test.is_nil(err)
            test.not_nil(limit_result)
            test.eq(#limit_result.messages, 3)

            -- Clean up the test messages
            for _, message_id in ipairs(message_ids) do
                message_repo.delete(message_id)
            end
        end)

        it("should keep list_after_message inclusive for backward compatibility", function()
            local messages, err = message_repo.list_after_message(test_data.session_id, test_data.message_id, 10)

            test.is_nil(err)
            test.not_nil(messages)
            test.ok(#messages >= 1)
            test.eq(messages[1].message_id, test_data.message_id)
        end)

        it("uses date then id for checkpoint windows and both cursor directions", function()
            local ids = { "z-order-anchor", "a-order-later", "b-order-tie" }
            local dates = { "2026-01-01T00:00:00Z", "2026-01-01T00:00:02Z",
                "2026-01-01T00:00:02Z" }
            local resource = consts.get_db_resource()
            local db, db_err = sql.get(resource)
            if not db then error(db_err) end
            for index, id in ipairs(ids) do
                local _, insert_err = db:execute(
                    "INSERT INTO messages (message_id, session_id, date, type, data) VALUES ($1, $2, $3, $4, $5)",
                    { id, test_data.session_id, dates[index], consts.MSG_TYPE.USER, id })
                test.is_nil(insert_err)
            end
            db:release()

            local window, window_err = message_repo.list_after_message(test_data.session_id, ids[1])
            local found = {}
            for _, row in ipairs(window or {}) do found[row.message_id] = true end

            local after, after_err = message_repo.list_by_session(test_data.session_id, 10, ids[1], "after")
            local before, before_err = message_repo.list_by_session(test_data.session_id, 10, ids[3], "before")
            local missing, missing_err = message_repo.list_after_message(test_data.session_id, "missing-anchor")
            local missing_page, page_err = message_repo.list_by_session(test_data.session_id, 10,
                "missing-cursor", "after")
            for _, id in ipairs(ids) do message_repo.delete(id) end
            test.is_nil(window_err)
            test.is_true(found[ids[1]])
            test.is_true(found[ids[2]])
            test.is_true(found[ids[3]])
            test.is_nil(after_err)
            test.eq(after.messages[1].message_id, ids[2])
            test.eq(after.messages[2].message_id, ids[3])
            test.is_nil(before_err)
            test.eq(before.messages[#before.messages].message_id, ids[2])
            test.is_nil(missing)
            test.contains(tostring(missing_err), "not found")
            test.is_nil(missing_page)
            test.contains(tostring(page_err), "not found")
        end)

        it("should list messages by type", function()
            local messages, err = message_repo.list_by_type(test_data.session_id, "user")

            test.is_nil(err)
            test.not_nil(messages)
            assert(messages)
            test.eq(#messages, 1)
            test.eq(messages[1].type, "user")

            messages, err = message_repo.list_by_type(test_data.session_id, "assistant")
            test.is_nil(err)
            test.not_nil(messages)
            assert(messages)
            test.eq(#messages, 1)
            test.eq(messages[1].type, "assistant")
        end)

        it("should get the latest message", function()
            local message, err = message_repo.get_latest(test_data.session_id)
            test.is_nil(err)
            test.not_nil(message)
            -- The most recent message should be the assistant message (the second one created)
            test.eq(message.message_id, test_data.message_id2)
            test.eq(message.type, "assistant")
        end)

        it("should count messages in a session", function()
            local count, err = message_repo.count_by_session(test_data.session_id)

            test.is_nil(err)
            test.eq(count, 2)
        end)

        it("should count messages by type", function()
            local count, err = message_repo.count_by_type(test_data.session_id, "user")

            test.is_nil(err)
            test.eq(count, 1)

            count, err = message_repo.count_by_type(test_data.session_id, "assistant")
            test.is_nil(err)
            test.eq(count, 1)

            count, err = message_repo.count_by_type(test_data.session_id, "system")
            test.is_nil(err)
            test.eq(count, 0)
        end)

        it("should merge metadata when updating with existing metadata", function()
            -- message_id2 already has metadata: {model = "test-model", tokens = {prompt = 10, completion = 5}}
            local result, err = message_repo.update_metadata(test_data.message_id2, {
                status = "completed",
                score = 42
            })

            test.is_nil(err)
            test.not_nil(result)
            test.is_true(result.updated)

            -- Verify the metadata was merged, not replaced
            local message, err = message_repo.get(test_data.message_id2)
            test.is_nil(err)
            test.not_nil(message)
            test.not_nil(message.metadata)

            -- Original fields should still be present
            test.eq(message.metadata.model, "test-model")
            test.not_nil(message.metadata.tokens)
            test.eq(message.metadata.tokens.prompt, 10)
            test.eq(message.metadata.tokens.completion, 5)

            -- New fields should be added
            test.eq(message.metadata.status, "completed")
            test.eq(message.metadata.score, 42)
        end)

        it("should overwrite existing keys when merging metadata", function()
            -- message_id2 now has merged metadata from previous test
            local result, err = message_repo.update_metadata(test_data.message_id2, {
                model = "updated-model"
            })

            test.is_nil(err)
            test.not_nil(result)

            local message, err = message_repo.get(test_data.message_id2)
            test.is_nil(err)

            -- Overwritten key
            test.eq(message.metadata.model, "updated-model")
            -- Other keys preserved
            test.eq(message.metadata.status, "completed")
            test.not_nil(message.metadata.tokens)
        end)

        it("should set metadata on message without existing metadata", function()
            -- message_id has no metadata (created as plain user message)
            local result, err = message_repo.update_metadata(test_data.message_id, {
                custom_key = "custom_value"
            })

            test.is_nil(err)
            test.not_nil(result)

            local message, err = message_repo.get(test_data.message_id)
            test.is_nil(err)
            test.not_nil(message.metadata)
            test.eq(message.metadata.custom_key, "custom_value")
        end)

        it("should handle update_metadata validation errors", function()
            -- Missing message_id
            local result, err = message_repo.update_metadata("", { key = "value" })
            test.is_nil(result)
            test.contains(tostring(err), "Message ID is required")

            -- Missing metadata
            result, err = message_repo.update_metadata(test_data.message_id2, nil)
            test.is_nil(result)
            test.contains(tostring(err), "Metadata is required")

            -- Non-existent message
            result, err = message_repo.update_metadata(uuid.v7(), { key = "value" })
            test.is_nil(result)
            test.contains(tostring(err), "not found")
        end)

        it("should delete a message", function()
            -- First verify we can get the message
            local message, err = message_repo.get(test_data.message_id)
            test.is_nil(err)
            test.not_nil(message)

            -- Now delete it
            local result, err = message_repo.delete(test_data.message_id)

            test.is_nil(err)
            test.not_nil(result)
            test.is_true(result.deleted)

            -- Verify the deletion
            message, err = message_repo.get(test_data.message_id)
            test.is_nil(message)
            test.contains(tostring(err), "not found")

            -- Count should now be 1
            local count, err = message_repo.count_by_session(test_data.session_id)
            test.is_nil(err)
            test.eq(count, 1)
        end)

        it("should handle validation errors", function()
            -- Missing message_id
            local message, err = message_repo.create(nil, test_data.session_id, "user", "data")
            test.is_nil(message)
            test.contains(tostring(err), "Message ID is required")

            -- Missing session_id
            message, err = message_repo.create(uuid.v7(), "", "user", "data")
            test.is_nil(message)
            test.contains(tostring(err), "Session ID is required")

            -- Missing type
            message, err = message_repo.create(uuid.v7(), test_data.session_id, "", "data")
            test.is_nil(message)
            test.contains(tostring(err), "Message type is required")

            -- Missing data
            message, err = message_repo.create(uuid.v7(), test_data.session_id, "user", nil)
            test.is_nil(message)
            test.contains(tostring(err), "Message data is required")

            -- Non-existent session
            message, err = message_repo.create(uuid.v7(), uuid.v7(), "user", "data")
            test.is_nil(message)
            test.not_nil(err)

            -- Get with invalid ID
            message, err = message_repo.get("")
            test.is_nil(message)
            test.contains(tostring(err), "Message ID is required")

            -- List by invalid session ID
            local messages, err = message_repo.list_by_session("")
            test.is_nil(messages)
            test.contains(tostring(err), "Session ID is required")

            -- Delete with invalid ID
            local result, err = message_repo.delete("")
            test.is_nil(result)
            test.contains(tostring(err), "Message ID is required")
        end)
    end)
end

return test.run_cases(define_tests)
