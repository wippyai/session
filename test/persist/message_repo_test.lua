local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local json = require("json")
local message_repo = require("message_repo")
local message_date = require("message_date")
local tx = require("tx")
local writer = require("writer")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local artifact_repo = require("artifact_repo")
local form_recovery = require("form_recovery")
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
            tx:execute("DELETE FROM artifacts WHERE session_id = $1", { test_data.session_id })
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

        it("hands back the stored dates of a response and of a batch", function()
            local context_id = uuid.v7()
            local session_id = uuid.v7()
            context_repo.create(context_id, "primary", "{}")
            session_repo.create(session_id, test_data.user_id, context_id, "Response dates", "test")
            local session_writer, writer_err = writer.new(session_id)
            test.is_nil(writer_err)
            test.not_nil(session_writer)
            local assistant_id, call_ids: any, response_err, date = session_writer:add_response("answer", {}, {
                { id = "call-1", name = "lookup", arguments = "{}", type = consts.MSG_TYPE.FUNCTION }
            })
            test.is_nil(response_err)
            local stored: any = message_repo.get(assistant_id)
            test.not_nil(date)
            test.eq(date, stored.date, "the assistant row's own date")

            local row_id = uuid.v7()
            local created, create_err, dates: any = message_repo.create_batch(session_id, {
                { message_id = row_id, type = consts.MSG_TYPE.USER, data = "later", metadata = {} },
            })
            test.is_nil(create_err)
            test.is_true(created)
            test.eq(dates[row_id], (message_repo.get(row_id) :: any).date)

            for _, id in ipairs({ assistant_id, call_ids["call-1"], row_id }) do message_repo.delete(id) end
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
            -- Give the held write a later timestamp explicitly. Fast Windows writes
            -- can share a clock tick, where the documented ID tiebreaker applies.
            local resource = consts.get_db_resource()
            local db, db_err = sql.get(resource)
            if not db then error(db_err) end
            local _, date_err = db:execute(
                "UPDATE messages SET date = $1 WHERE message_id = $2 OR message_id = $3",
                { "2100-01-01T00:00:00Z", assistant_id, call_id })
            local _, held_date_err = db:execute("UPDATE messages SET date = $1 WHERE message_id = $2",
                { "2100-01-01T00:00:01Z", held_id })
            db:release()
            test.is_nil(date_err)
            test.is_nil(held_date_err)
            local window, window_err = message_repo.list_after_message(test_data.session_id, assistant_id)
            message_repo.delete(assistant_id)
            message_repo.delete(call_id)
            message_repo.delete(held_id)
            test.is_nil(window_err)
            test.eq(window[#window - 2].message_id, assistant_id)
            test.eq(window[#window - 1].message_id, call_id)
            test.eq(window[#window].message_id, held_id)
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

        it("formats message_date.now() with a 9-digit fraction", function()
            local fixed_pattern = "^%d%d%d%d%-%d%d%-%d%dT%d%d:%d%d:%d%d%.%d%d%d%d%d%d%d%d%d[Z%+%-]"
            test.not_nil(message_date.now():match(fixed_pattern))
            local earlier = time.date(2026, 1, 1, 0, 0, 0, 100000000, time.utc):format(message_date.LAYOUT)
            local later = time.date(2026, 1, 1, 0, 0, 0, 150000000, time.utc):format(message_date.LAYOUT)
            test.is_true(earlier < later)
        end)

        it("keeps 100 rapid create() calls in one session in strict insertion order", function()
            local context_id = uuid.v7()
            local session_id = uuid.v7()
            context_repo.create(context_id, "primary", "{}")
            session_repo.create(session_id, test_data.user_id, context_id, "Rapid create order", "test")

            local ids = {}
            for i = 1, 100 do
                local message_id = uuid.v7()
                table.insert(ids, message_id)
                local created, create_err = message_repo.create(
                    message_id, session_id, consts.MSG_TYPE.USER, "row " .. tostring(i))
                test.is_nil(create_err)
                test.not_nil(created)
            end

            local listed, list_err = message_repo.list_by_session(session_id, 200)
            test.is_nil(list_err)
            test.eq(#listed.messages, 100)
            for i, id in ipairs(ids) do
                test.eq(listed.messages[i].message_id, id)
            end

            -- Dates must be strictly increasing, not just tied and saved by
            -- message_id ordering.
            for i = 2, #listed.messages do
                test.is_true(listed.messages[i].date > listed.messages[i - 1].date)
            end

            for _, id in ipairs(ids) do message_repo.delete(id) end
            session_repo.delete(session_id)
            context_repo.delete(context_id)
        end)

        it("lists create_batch rows in array order, and after an earlier row written in the same tick", function()
            local context_id = uuid.v7()
            local session_id = uuid.v7()
            context_repo.create(context_id, "primary", "{}")
            session_repo.create(session_id, test_data.user_id, context_id, "Batch order", "test")

            local first_id = uuid.v7()
            local created, create_err = message_repo.create(
                first_id, session_id, consts.MSG_TYPE.USER, "written first")
            test.is_nil(create_err)
            test.not_nil(created)

            local batch_ids = {}
            local rows = {}
            for i = 1, 20 do
                local message_id = uuid.v7()
                table.insert(batch_ids, message_id)
                table.insert(rows, { message_id = message_id, type = consts.MSG_TYPE.USER,
                    data = "batch row " .. tostring(i), metadata = {} })
            end
            local batch_ok, batch_err = message_repo.create_batch(session_id, rows)
            test.is_nil(batch_err)
            test.is_true(batch_ok)

            local listed, list_err = message_repo.list_by_session(session_id, 200)
            test.is_nil(list_err)
            test.eq(#listed.messages, 21)
            test.eq(listed.messages[1].message_id, first_id)
            for i, id in ipairs(batch_ids) do
                test.eq(listed.messages[i + 1].message_id, id)
            end
            for i = 2, #listed.messages do
                test.is_true(listed.messages[i].date > listed.messages[i - 1].date)
            end

            message_repo.delete(first_id)
            for _, id in ipairs(batch_ids) do message_repo.delete(id) end
            session_repo.delete(session_id)
            context_repo.delete(context_id)
        end)

        describe("dates, anchors and form answers", function()
            local owned = {}
            local PENDING_META = '{"session_form":{"artifact_id":"%s","pending":true,"submission_id":"r"}}'
            -- A typed message whose client data (file_uuids) carries a
            -- session_form object: it must never pass for a server answer.
            local LOOKALIKE_META = '{"file_uuids":{"session_form":{"artifact_id":"x","pending":true}}}'

            after_all(function()
                for _, item in ipairs(owned) do
                    session_repo.delete(item.session_id)
                    context_repo.delete(item.context_id)
                end
            end)

            local function new_session(title)
                local context_id, session_id = uuid.v7(), uuid.v7()
                local _, context_err = context_repo.create(context_id, "primary", "{}")
                test.is_nil(context_err)
                local _, session_err = session_repo.create(session_id, test_data.user_id, context_id, title, "test")
                test.is_nil(session_err)
                table.insert(owned, { session_id = session_id, context_id = context_id })
                return session_id
            end

            local function exec(query, params)
                local db, db_err = sql.get(consts.get_db_resource())
                if not db then error(db_err) end
                local _, exec_err = db:execute(query, params)
                db:release()
                test.is_nil(exec_err)
            end

            local function insert_row(session_id, message_id, msg_type, date, metadata: string?)
                exec("INSERT INTO messages (message_id, session_id, date, type, data, metadata) VALUES ($1, $2, $3, $4, $5, $6)",
                    { message_id, session_id, date, msg_type, message_id, metadata or "{}" })
            end

            local function insert_artifact(session_id, artifact_id, meta)
                local now = time.now():format(time.RFC3339)
                exec("INSERT INTO artifacts (artifact_id, session_id, user_id, kind, title, content, meta, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                    { artifact_id, session_id, test_data.user_id, "inline", "Form " .. artifact_id, "{}", meta, now, now })
            end

            local function ids_in_order(session_id)
                local page, err = message_repo.list_by_session(session_id, 500)
                test.is_nil(err)
                local out = {}
                for _, row in ipairs((page :: any).messages) do table.insert(out, row.message_id) end
                return out
            end

            -- Two days ahead of the clock, so neither the clock nor a later
            -- calendar day in the host offset orders a new row after it;
            -- only the stored values can.
            local function ahead_of_clock()
                return time.now():add(48 * 3600 * time.SECOND)
            end

            it("orders a new message after a trimmed UTC date that is ahead of the clock", function()
                local session_id = new_session("Trimmed legacy date")
                local ahead = ahead_of_clock():utc()
                local y, mo, d = ahead:date()
                local h, mi, s = ahead:clock()
                -- The trimmed layout older rows hold: "...:SS.15Z". A fixed
                -- 9-digit value of the same second ("...:SS.150000001Z")
                -- sorts before it as text.
                local legacy = time.date(y, mo, d, h, mi, s, 150000000, time.utc):format(time.RFC3339NANO)
                local legacy_id = uuid.v7()
                insert_row(session_id, legacy_id, consts.MSG_TYPE.ASSISTANT, legacy, nil)
                exec("UPDATE sessions SET last_message_date = $1 WHERE session_id = $2", { legacy, session_id })

                local new_id = uuid.v7()
                local created, create_err = message_repo.create(new_id, session_id, consts.MSG_TYPE.USER, "after legacy")
                test.is_nil(create_err)
                test.not_nil(created)

                local ids = ids_in_order(session_id)
                test.eq(ids[#ids - 1], legacy_id)
                test.eq(ids[#ids], new_id)
                local moved_on, moved_err = message_repo.has_user_input_after(session_id, legacy, nil)
                test.is_nil(moved_err)
                test.is_true(moved_on, "the typed row written after the legacy row counts as later input")
            end)

            it("orders new and admitted rows after the latest row when last_message_date was moved back", function()
                local session_id = new_session("Anchor moved back")
                local ahead_id = uuid.v7()
                insert_row(session_id, ahead_id, consts.MSG_TYPE.ASSISTANT, ahead_of_clock():format(message_date.LAYOUT), nil)
                -- What writer:update_status does: a second-resolution "now",
                -- below the row above.
                local _, meta_err = session_repo.update_session_meta(session_id, { last_message_date = os.time() })
                test.is_nil(meta_err)

                local typed_id = uuid.v7()
                local _, create_err = message_repo.create(typed_id, session_id, consts.MSG_TYPE.USER, "typed")
                test.is_nil(create_err)
                local ids = ids_in_order(session_id)
                test.eq(ids[#ids - 1], ahead_id)
                test.eq(ids[#ids], typed_id)

                local _, lower_err = session_repo.update_session_meta(session_id, { last_message_date = os.time() })
                test.is_nil(lower_err)
                local answer_id = uuid.v7()
                insert_row(session_id, answer_id, consts.MSG_TYPE.USER, message_date.now(),
                    string.format(PENDING_META, uuid.v7()))
                local admitted, admit_err = message_repo.admit_pending_answer(session_id, answer_id)
                test.is_nil(admit_err)
                test.not_nil(admitted)
                ids = ids_in_order(session_id)
                test.eq(ids[#ids], answer_id)
            end)

            it("dates an admitted first message after a row that is ahead of the clock", function()
                local session_id = new_session("Admission after a future row")
                local ahead_id = uuid.v7()
                insert_row(session_id, ahead_id, consts.MSG_TYPE.ASSISTANT, ahead_of_clock():format(message_date.LAYOUT), nil)

                -- The steering admission of an idle message (message_repo.admit)
                -- takes its date from message_date like every other writer.
                local admitted_id = uuid.v7()
                local row, admit_err = message_repo.admit(admitted_id, session_id, consts.MSG_TYPE.USER, "new turn", {},
                    { status = "running", meta = { interaction = { can_send = false, revision = 1 } } })
                test.is_nil(admit_err)
                test.not_nil(row)
                local ids = ids_in_order(session_id)
                test.eq(ids[#ids - 1], ahead_id)
                test.eq(ids[#ids], admitted_id)
                local stored: any = session_repo.get(session_id, test_data.user_id)
                test.eq(stored.status, "running")
                test.eq(stored.meta.interaction.revision, 1)
            end)

            it("refuses steering writes inside tx.run that do not pass the transaction", function()
                local session_id = new_session("Steering under a transaction")
                local _, run_err = tx.run(function()
                    local applied, apply_err = message_repo.apply_inputs(session_id, {}, 0)
                    if apply_err then return nil, apply_err end
                    return applied
                end)
                test.contains(tostring(run_err), "Nested tx.run")
            end)

            it("counts a later typed message whose client data mentions session_form", function()
                local session_id = new_session("Lookalike typed row")
                local after = "2001-01-01T00:00:00.000000000Z"
                insert_row(session_id, uuid.v7(), consts.MSG_TYPE.USER, "2001-01-01T00:00:01.000000000Z", LOOKALIKE_META)
                local moved_on, err = message_repo.has_user_input_after(session_id, after, nil)
                test.is_nil(err)
                test.is_true(moved_on)
            end)

            it("compares answer acceptance times as instants, not as text", function()
                local later_session = new_session("Accepted later, other offset")
                -- 10:00Z written with a +02:00 offset; the answer was
                -- accepted at 10:30Z, which sorts before it as text.
                local created = "2001-03-01T12:00:00.000000000+02:00"
                insert_artifact(later_session, uuid.v7(),
                    '{"session_form":{"submission":{"submitted_at":"2001-03-01T10:30:00.000000000Z"}}}')
                local moved_on, err = message_repo.has_user_input_after(later_session, created, nil)
                test.is_nil(err)
                test.is_true(moved_on, "accepted 30 minutes after the form was created")

                local earlier_session = new_session("Accepted earlier, other offset")
                insert_artifact(earlier_session, uuid.v7(),
                    '{"session_form":{"submission":{"submitted_at":"2001-03-01T09:30:00.000000000Z"}}}')
                local before, before_err = message_repo.has_user_input_after(earlier_session, created, nil)
                test.is_nil(before_err)
                test.is_false(before, "accepted 30 minutes before the form was created")
            end)

            it("does not let a lookalike row hide a real pending answer", function()
                local session_id = new_session("Pending behind a lookalike")
                insert_row(session_id, uuid.v7(), consts.MSG_TYPE.USER, "2001-01-01T00:00:01.000000000Z", LOOKALIKE_META)
                local real_id = uuid.v7()
                insert_row(session_id, real_id, consts.MSG_TYPE.USER, "2001-01-01T00:00:02.000000000Z",
                    string.format(PENDING_META, uuid.v7()))
                local pending, err = message_repo.list_pending_answers(session_id, 1)
                -- Pending rows of this user are visible to every resume scan.
                session_repo.delete(session_id)
                test.is_nil(err)
                test.eq(#(pending :: any), 1)
                test.eq((pending :: any)[1].message_id, real_id)
            end)

            it("lists sessions with pending answers oldest first, skipping lookalikes and excluded ids", function()
                -- Dated far in the past so no other suite's rows come first.
                local lookalike = new_session("Only a lookalike")
                insert_row(lookalike, uuid.v7(), consts.MSG_TYPE.USER, "2000-01-01T00:00:01.000000000Z", LOOKALIKE_META)
                local first, second, third = new_session("Pending 1"), new_session("Pending 2"), new_session("Pending 3")
                insert_row(third, uuid.v7(), consts.MSG_TYPE.USER, "2000-01-01T00:00:04.000000000Z",
                    string.format(PENDING_META, uuid.v7()))
                insert_row(first, uuid.v7(), consts.MSG_TYPE.USER, "2000-01-01T00:00:02.000000000Z",
                    string.format(PENDING_META, uuid.v7()))
                insert_row(second, uuid.v7(), consts.MSG_TYPE.USER, "2000-01-01T00:00:03.000000000Z",
                    string.format(PENDING_META, uuid.v7()))

                local ids, err = message_repo.list_sessions_with_pending_answers(test_data.user_id, 2)
                test.is_nil(err)
                test.eq(#(ids :: any), 2)
                test.eq((ids :: any)[1], first)
                test.eq((ids :: any)[2], second)

                local rest, rest_err = message_repo.list_sessions_with_pending_answers(test_data.user_id, 2,
                    { exclude = { first } })
                for _, id in ipairs({ lookalike, first, second, third }) do session_repo.delete(id) end
                test.is_nil(rest_err)
                test.eq((rest :: any)[1], second)
                test.eq((rest :: any)[2], third)
            end)

            -- Recovery with the forms step the session process passes
            -- (form_recovery.settle_call).
            describe("recover_pending and committed forms", function()
                local function pending_form_call(session_id, artifact_id)
                    local session_writer: any = writer.new(session_id)
                    local call_id = "call-" .. uuid.v7()
                    local _, ids: any, err = session_writer:add_response("", {}, {
                        { id = call_id, name = "ask_user", arguments = "{}", type = consts.MSG_TYPE.FUNCTION },
                    })
                    test.is_nil(err)
                    local message_id = ids[call_id]
                    session_writer:update_message_meta(message_id,
                        { control_operations = { forms = { { artifact_id = artifact_id } } } })
                    return message_id, call_id
                end

                local function form_meta(call_id, tool_message_id)
                    return json.encode({ status = "active", session_form = { version = 1,
                        origin = { call_id = call_id, tool_message_id = tool_message_id } } })
                end

                it("settles a call whose form names it as origin", function()
                    local session_id = new_session("Committed form")
                    local artifact_id = uuid.v7()
                    local message_id, call_id = pending_form_call(session_id, artifact_id)
                    insert_artifact(session_id, artifact_id, form_meta(call_id, message_id))

                    local recovered, err = message_repo.recover_pending(session_id, nil, form_recovery.settle_call)
                    test.is_nil(err)
                    test.eq(recovered, 1)
                    local row: any = message_repo.get(message_id)
                    test.eq(row.metadata.status, consts.FUNC_STATUS.SUCCESS)
                    test.contains(tostring(row.metadata.result.message), artifact_id)
                end)

                it("does not settle a call with a form whose origin is another call", function()
                    local session_id = new_session("Foreign form")
                    local artifact_id = uuid.v7()
                    local message_id = pending_form_call(session_id, artifact_id)
                    insert_artifact(session_id, artifact_id, form_meta("call-other", uuid.v7()))

                    local recovered, err = message_repo.recover_pending(session_id, nil, form_recovery.settle_call)
                    test.is_nil(err)
                    test.eq(recovered, 1)
                    local row: any = message_repo.get(message_id)
                    test.eq(row.metadata.status, consts.FUNC_STATUS.ERROR)
                    test.eq(row.metadata.result, "interrupted, outcome unknown")
                end)

                it("returns a failed form lookup instead of marking the call interrupted", function()
                    local session_id = new_session("Lookup failure")
                    local artifact_id = uuid.v7()
                    local message_id, call_id = pending_form_call(session_id, artifact_id)
                    insert_artifact(session_id, artifact_id, form_meta(call_id, message_id))

                    local original = artifact_repo.find
                    artifact_repo.find = function() return nil, "database unavailable" end
                    local recovered, err = message_repo.recover_pending(session_id, nil, form_recovery.settle_call)
                    artifact_repo.find = original

                    test.is_nil(recovered)
                    test.contains(tostring(err), "database unavailable")
                    local row: any = message_repo.get(message_id)
                    test.eq(row.metadata.status, consts.FUNC_STATUS.PENDING)
                end)
            end)
        end)
    end)
end

return test.run_cases(define_tests)
