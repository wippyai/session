local test = require("test")
local uuid = require("uuid")
local json = require("json")
local security = require("security")
local checkpoint_repo = require("checkpoint_repo")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local message_repo = require("message_repo")
local session_contexts_repo = require("session_contexts_repo")
local consts = require("consts")
local wait_for_boot = require("wait_for_boot")
local writer = require("writer")
local reader = require("reader")
local message_handlers = require("message_handlers")
local session_handlers = require("session_handlers")
local agent_library = require("agent_library")
local llm = require("llm")
local env = require("env")
local sql = require("sql")
local time = require("time")

local function define_tests()
    describe("atomic session checkpoints", function()
        local session_id, context_id, message_id, note_id, user_id
        before_all(function() wait_for_boot.run() end)
        before_each(function()
            session_id, context_id, message_id, note_id = uuid.v7(), uuid.v7(), uuid.v7(), uuid.v7()
            local actor = security.actor()
            if not actor then error("checkpoint test requires an actor") end
            user_id = actor:id()
            local _, context_err = context_repo.create(context_id, "primary",
                json.encode({ current_checkpoint_id = "old-anchor", checkpoint_requested = true, project = "kept" }))
            test.is_nil(context_err)
            local _, session_err = session_repo.create(session_id, user_id, context_id, "checkpoint test", "test")
            test.is_nil(session_err)
            local _, message_err = message_repo.create(message_id, session_id, consts.MSG_TYPE.ASSISTANT,
                "settled response", { retained = true })
            test.is_nil(message_err)
            local _, note_err = session_contexts_repo.create(note_id, session_id, "note", "keep this note")
            test.is_nil(note_err)
            local _, summary_err = session_contexts_repo.create(uuid.v7(), session_id,
                consts.CONTEXT_TYPES.CONVERSATION_SUMMARY, "old summary")
            test.is_nil(summary_err)
        end)
        after_each(function()
            session_repo.delete(session_id)
            context_repo.delete(context_id)
        end)

        it("commits summary, anchor, metadata and request together, without duplicate audit entries on retry", function()
            local op = { message_id = message_id, checkpoint_id = message_id, clear_request = true }
            for _ = 1, 2 do
                local ok, err = checkpoint_repo.commit(session_id, user_id, op, "new summary",
                    { checkpoint_summary = "new summary", checkpoint_reason = "compaction_requested" }, uuid.v7())
                test.is_nil(err)
                test.is_true(ok)
            end
            local context = context_repo.get(context_id)
            local data = json.decode(context.data)
            test.eq(data.current_checkpoint_id, message_id)
            test.is_nil(data.checkpoint_requested)
            test.eq(data.project, "kept")
            local session = session_repo.get(session_id, user_id)
            test.eq(#session.meta.checkpoints, 1)
            local message = message_repo.get(message_id)
            test.is_true(message.metadata.retained)
            test.eq(message.metadata.checkpoint_reason, "compaction_requested")
            local contexts = session_contexts_repo.list_by_session(session_id)
            test.eq(#contexts, 2)
            for _, row in ipairs(contexts) do
                if row.type == consts.CONTEXT_TYPES.CONVERSATION_SUMMARY then test.eq(row.text, "new summary") end
            end
        end)

        it("persists fallback binding diagnostics through the checkpoint handler and a fresh message read", function()
            local saved_runtime, saved_funcs = session_handlers._checkpoint_runtime, session_handlers._funcs
            session_handlers._checkpoint_runtime = { create = function()
                return { applied = 0, errors = { {
                    binding_id = "custom", trait_id = "memory", error = "binding unavailable", strict = false,
                } } }
            end }
            session_handlers._funcs = { new = function()
                return { with_context = function(self) return self end,
                    call = function() return { summary = "fallback summary" } end }
            end }
            local ok, result, err = pcall(function()
                return session_handlers.create_checkpoint({
                    session_id = session_id,
                    config = { checkpoint_function_id = "fallback:checkpoint" },
                    reader = assert(reader.open(session_id)), writer = assert(writer.new(session_id)),
                }, {
                    checkpoint_id = message_id, message_id = message_id,
                    checkpoint_bindings = { { binding = "custom:checkpoint" } },
                })
            end)
            session_handlers._checkpoint_runtime, session_handlers._funcs = saved_runtime, saved_funcs

            test.is_true(ok, tostring(result))
            test.is_nil(err)
            test.is_true(result.completed)
            local message = assert(message_repo.get(message_id))
            test.eq(message.metadata.checkpoint_source, "function")
            test.eq(message.metadata.checkpoint_summary, "fallback summary")
            local failure = message.metadata.checkpoint_binding_errors[1]
            test.eq(failure.binding_id, "custom")
            test.eq(failure.trait_id, "memory")
            test.eq(failure.error, "binding unavailable")
            test.is_false(failure.strict)
        end)

        it("rolls back a summary insertion failure without losing old history or the compact request", function()
            -- Reuse the note's primary key to force an insertion failure after
            -- the old summary has been deleted inside the transaction.
            local ok, err = checkpoint_repo.commit(session_id, user_id,
                { message_id = message_id, checkpoint_id = message_id, clear_request = true },
                "must not survive", { checkpoint_summary = "must not survive" }, note_id)
            test.is_nil(ok)
            test.not_nil(err)
            local data = json.decode(context_repo.get(context_id).data)
            test.eq(data.current_checkpoint_id, "old-anchor")
            test.is_true(data.checkpoint_requested)
            test.is_nil(message_repo.get(message_id).metadata.checkpoint_summary)
            local contexts = session_contexts_repo.list_by_session(session_id)
            test.eq(#contexts, 2)
            for _, row in ipairs(contexts) do
                if row.type == consts.CONTEXT_TYPES.CONVERSATION_SUMMARY then test.eq(row.text, "old summary") end
            end
        end)

        local dialect_db = assert(sql.get(consts.get_db_resource()))
        local postgres = dialect_db:type() == "postgres"
        dialect_db:release()
        for _, target in ipairs({ "session", "context", "message" }) do
            local pg_it = postgres and it or test.it_skip
            pg_it("preserves an interleaved " .. target .. " update during checkpoint commit (PostgreSQL)", function()
                local db = assert(sql.get(consts.get_db_resource()))
                local blocker = assert(db:begin())
                local pid = assert(blocker:query("SELECT pg_backend_pid() AS pid"))[1].pid
                -- Hold the old summary so checkpoint commit waits only after
                -- reading the JSON fields it is about to replace.
                assert(blocker:query("SELECT id FROM session_contexts WHERE session_id = $1 FOR UPDATE", { session_id }))
                local done = channel.new(1)
                coroutine.spawn(function()
                    local ran, result, err = pcall(checkpoint_repo.commit, session_id, user_id,
                        { message_id = message_id, checkpoint_id = message_id, clear_request = true },
                        "new summary", { checkpoint_summary = "new summary" }, uuid.v7())
                    done:send({ ran = ran, result = result, err = err })
                end)
                local interleaved, interleave_err = pcall(function()
                    local blocked = false
                    for _ = 1, 100 do
                        local waiting = assert(db:query("SELECT pid FROM pg_stat_activity WHERE $1::int = ANY(pg_blocking_pids(pid))",
                            { pid }))
                        if #waiting > 0 then blocked = true; break end
                        time.sleep("50ms")
                    end
                    assert(blocked, "checkpoint did not reach the controlled write boundary")
                    if target == "session" then
                        assert(session_repo.update_session_meta(session_id, { meta = { external_update = true } }))
                    elseif target == "context" then
                        assert(context_repo.update(context_id, json.encode({ current_checkpoint_id = "old-anchor",
                            checkpoint_requested = true, external_update = true })))
                    else
                        assert(message_repo.update_metadata(message_id, { external_update = true }))
                    end
                end)
                blocker:rollback()
                db:release()
                local outcome = done:receive()
                test.is_true(interleaved, tostring(interleave_err))
                test.is_true(outcome.ran, tostring(outcome.result))
                test.is_nil(outcome.result, "checkpoint must reject a stale JSON snapshot")
                test.contains(tostring(outcome.err), "changed during checkpoint")
                local session = session_repo.get(session_id, user_id)
                local context = json.decode(context_repo.get(context_id).data)
                local message = message_repo.get(message_id)
                if target == "session" then test.is_true(session.meta.external_update)
                elseif target == "context" then test.is_true(context.external_update)
                else test.is_true(message.metadata.external_update) end
                test.eq(context.current_checkpoint_id, "old-anchor")
                test.is_true(context.checkpoint_requested)
                test.is_nil(message.metadata.checkpoint_summary)
                for _, row in ipairs(session_contexts_repo.list_by_session(session_id)) do
                    if row.type == consts.CONTEXT_TYPES.CONVERSATION_SUMMARY then test.eq(row.text, "old summary") end
                end
            end)
        end

        it("keeps plain response writes valid without behavior metadata", function()
            local plain_writer, writer_err = writer.new(session_id)
            test.is_nil(writer_err)
            local response_id, _, response_err = plain_writer:add_response("plain response")
            test.is_nil(response_err)
            test.not_nil(response_id)
            test.eq(message_repo.get(response_id).data, "plain response")
            test.eq(#message_repo.list_behavior_rounds(session_id), 0)
        end)

        it("recovers a policy from database-backed round metadata using fresh host objects", function()
            local first_writer, writer_err = writer.new(session_id)
            test.is_nil(writer_err)
            local action_id, call_ids, response_err = first_writer:add_response("tool round", {
                behavior_control_state = "pending",
                behavior_controls = {{ context = { session = { set = { recovered_project = "project-1" } } } }},
            }, {{ id = "call-1", name = "read", arguments = {}, type = consts.MSG_TYPE.FUNCTION }})
            test.is_nil(response_err)
            if not call_ids then error("response must return persisted call IDs") end
            local session = session_repo.get(session_id, user_id)
            test.is_true(session.meta.behavior_controls_pending, "round and recovery flag commit together")
            local rounds = message_repo.list_behavior_rounds(session_id)
            test.eq(#rounds, 1)
            test.eq(rounds[1].metadata.behavior_call_message_ids["call-1"], call_ids["call-1"])
            local recovered, recovery_err = message_repo.recover_pending(session_id)
            test.is_nil(recovery_err)
            test.eq(recovered, 1)

            local fresh_reader, reader_err = reader.open(session_id)
            test.is_nil(reader_err)
            local fresh_writer, fresh_writer_err = writer.new(session_id)
            test.is_nil(fresh_writer_err)
            local ok, err = message_handlers.recover_behavior_controls({ reader = fresh_reader, writer = fresh_writer })
            test.is_nil(err)
            test.is_true(ok)
            local data = json.decode(context_repo.get(context_id).data)
            test.eq(data.recovered_project, "project-1")
            test.eq(message_repo.get(action_id).metadata.behavior_control_state, "applied")
            test.eq(#message_repo.list_behavior_rounds(session_id), 0)
            test.eq(session_repo.get(session_id, user_id).meta.behavior_controls_pending, false)
        end)
        for _, expectation in ipairs({"raw result", "user request"}) do
            it("pre-dispatch compaction preserves the task and replaces the " .. expectation, function()
                assert(context_repo.update(context_id, json.encode({project = "kept"})))
                local request_id = uuid.v7()
                assert(message_repo.create(request_id, session_id, consts.MSG_TYPE.USER,
                    "Keep the original task verbatim.", {}))
                local host_writer = assert(writer.new(session_id))
                local _, ids, response_err = host_writer:add_response("Reading", {source_id = request_id},
                    {{id = "read-1", name = "read", arguments = {}, type = consts.MSG_TYPE.FUNCTION}})
                test.is_nil(response_err)
                if not ids then error("response must return persisted call IDs") end
                local large = string.rep("large-result-data ", 10000)
                assert(host_writer:update_message_meta(ids["read-1"], {status = consts.FUNC_STATUS.SUCCESS, result = large}))
                local replacement = nil
                local agent = {id = "test:agent", model = "test-model", agent_options = {}, tool_wrappers = {}}
                agent.step = function(_, _, runtime)
                    local compacted, err = runtime.checkpoint.compact({estimated_prompt_tokens = 50000})
                    assert(compacted, tostring(err))
                    replacement = compacted:get_messages()
                    return {result = "done"}
                end
                local ctx = {session_id = session_id, user_id = user_id,
                    config = {agent_id = agent.id, model = agent.model, checkpoint_function_id = "test:summary"},
                    reader = assert(reader.open(session_id)), writer = host_writer, lifecycle_state = {},
                    agent_ctx = {load_agent = function() return agent end, get_current_agent = function() return agent end},
                    upstream = {response_beginning = function() end, send_message_update = function() end,
                        invalidate_message = function() end, message_error = function() end,
                        update_session = function() end, session_error = function() end}}
                local saved_funcs = session_handlers._funcs
                session_handlers._funcs = {new = function() return {
                    with_context = function(self) return self end,
                    call = function() return {summary = "The tool found useful information."} end,
                } end}
                local ran, result, err = pcall(message_handlers.agent_step, ctx, {message_id = request_id, request_id = "review"})
                session_handlers._funcs = saved_funcs
                test.is_true(ran, tostring(result))
                test.is_nil(err)
                test.not_nil(replacement)
                test.eq(message_repo.get(ids["read-1"]).metadata.result, large, "compaction must preserve durable tool history")
                local encoded = json.encode(replacement)
                if expectation == "raw result" then
                    test.is_nil(string.find(encoded, large, 1, true), "checkpoint must remove the oversized tool result")
                else
                    local found = false
                    for _, message in ipairs(replacement) do
                        if message.role == "user" and message.content[1].text == "Keep the original task verbatim." then
                            found = true
                        end
                    end
                    test.is_true(found, "checkpoint must restore the current request at user authority")
                end
            end)
        end

        local admission_supported = llm.ERROR_TYPE.CONTEXT_WINDOW ~= nil
        if env.get("WIPPY_TEST_REQUIRE_ADMISSION") == "1" and not admission_supported then
            error("Outgoing checkpoint integration requires Framework admission support")
        end
        local admission_it = admission_supported and it or test.it_skip
        admission_it("compacts through real Agent and LLM admission before dispatching a fitting prompt", function()
            assert(context_repo.update(context_id, "{}"))
            local request_id = uuid.v7()
            assert(message_repo.create(request_id, session_id, consts.MSG_TYPE.USER, "Finish the document task.", {}))
            local host_writer = assert(writer.new(session_id))
            local _, ids, response_err = host_writer:add_response("Reading", {source_id = request_id},
                {{id = "read-1", name = "read", arguments = {}, type = consts.MSG_TYPE.FUNCTION}})
            test.is_nil(response_err)
            if not ids then error("response must return persisted call IDs") end
            local large = string.rep("large-result-data ", 10000)
            assert(host_writer:update_message_meta(ids["read-1"], {status = consts.FUNC_STATUS.SUCCESS, result = large}))
            local runner = agent_library.new({id = "test:admission", name = "Admission integration",
                description = "Test fixture", model = "test-model", prompt = "Complete the current task."})
            local generated, summarized = 0, 0
            local saved = {agent_llm = agent_library._llm, models = llm._models, providers = llm._providers,
                resolver = llm._model_resolver, usage = llm._usage_tracker, funcs = session_handlers._funcs}
            agent_library._llm = llm
            llm._model_resolver = {resolve = function() return {
                name = "test-model", max_tokens = 2000, capabilities = {"generate"},
                providers = {{id = "test:provider", provider_model = "wire"}},
            } end}
            llm._usage_tracker = false
            llm._providers = {
                driver_declares_legacy_reasoning_flag = function() return false end,
                open = function() return {generate = function(_, args)
                    generated = generated + 1
                    local encoded = json.encode(args.messages)
                    test.is_nil((string.find(encoded, large, 1, true)))
                    test.not_nil((string.find(encoded, "Finish the document task.", 1, true)))
                    test.not_nil((string.find(encoded, "The document data was summarized.", 1, true)))
                    return {result = "Done.", tokens = {prompt_tokens = 100, completion_tokens = 2}, metadata = {}}
                end} end,
            }
            session_handlers._funcs = {new = function() return {
                with_context = function(self) return self end,
                call = function()
                    summarized = summarized + 1
                    return {summary = "The document data was summarized."}
                end,
            } end}
            local ctx = {session_id = session_id, user_id = user_id,
                config = {agent_id = runner.id, model = runner.model, checkpoint_function_id = "test:summary"},
                reader = assert(reader.open(session_id)), writer = host_writer, lifecycle_state = {},
                agent_ctx = {load_agent = function() return runner end, get_current_agent = function() return runner end},
                upstream = {response_beginning = function() end, send_message_update = function() end,
                    invalidate_message = function() end, message_error = function() end,
                    update_session = function() end, session_error = function() end}}
            local ran, result, err = pcall(message_handlers.agent_step, ctx, {message_id = request_id, request_id = "admission"})
            agent_library._llm, llm._models, llm._providers = saved.agent_llm, saved.models, saved.providers
            llm._model_resolver, llm._usage_tracker, session_handlers._funcs = saved.resolver, saved.usage, saved.funcs
            test.is_true(ran, tostring(result))
            test.is_nil(err)
            test.is_true(result.completed)
            test.eq(summarized, 1)
            test.eq(generated, 1)
            test.eq(message_repo.get(ids["read-1"]).metadata.result, large)
        end)

        it("persists an exclusive boundary across reopening and clears it for an ordinary checkpoint", function()
            local request_id = uuid.v7()
            assert(message_repo.create(request_id, session_id, consts.MSG_TYPE.USER, "Keep this task.", {}))
            local anchor_id = uuid.v7()
            assert(message_repo.create(anchor_id, session_id, consts.MSG_TYPE.ASSISTANT, "Summarized.", {source_id = request_id}))
            local later_id = uuid.v7()
            assert(message_repo.create(later_id, session_id, consts.MSG_TYPE.ASSISTANT, "Continue.", {source_id = request_id}))
            assert(checkpoint_repo.commit(session_id, user_id,
                {checkpoint_id = anchor_id, message_id = anchor_id, exclusive = true, source_id = request_id},
                "summary", {}, uuid.v7()))
            local reopened = assert(reader.open(session_id))
            local rows = assert(reopened:messages():from_checkpoint():last(1):all())
            test.eq(#rows, 1)
            test.eq(rows[1].message_id, later_id)
            rows = assert(reopened:messages():after(anchor_id):all())
            test.eq(#rows, 2, "explicit after() retains its inclusive public behavior")
            test.eq(rows[1].message_id, anchor_id)
            assert(checkpoint_repo.commit(session_id, user_id,
                {checkpoint_id = anchor_id, message_id = anchor_id}, "ordinary summary", {}, uuid.v7()))
            reopened = assert(reader.open(session_id))
            test.is_nil(reopened:get_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_BOUNDARY))
            rows = assert(reopened:messages():from_checkpoint():all())
            test.eq(rows[1].message_id, anchor_id)
        end)

        it("rolls back an exclusive boundary when summary insertion fails", function()
            local request_id = uuid.v7()
            assert(message_repo.create(request_id, session_id, consts.MSG_TYPE.USER, "Keep this task.", {}))
            local ok, err = checkpoint_repo.commit(session_id, user_id,
                {checkpoint_id = message_id, message_id = message_id, exclusive = true, source_id = request_id},
                "must roll back", {}, note_id)
            test.is_nil(ok)
            test.not_nil(err)
            local context = json.decode(context_repo.get(context_id).data)
            test.eq(context.current_checkpoint_id, "old-anchor")
            test.is_nil(context.current_checkpoint_boundary)
            test.is_true(context.checkpoint_requested)
        end)

        it("rejects a foreign resume request before moving the checkpoint", function()
            local foreign_session, foreign_context, request_id = uuid.v7(), uuid.v7(), uuid.v7()
            assert(context_repo.create(foreign_context, "primary", "{}"))
            assert(session_repo.create(foreign_session, user_id, foreign_context, "foreign request", "test"))
            assert(message_repo.create(request_id, foreign_session, consts.MSG_TYPE.USER, "Foreign task.", {}))
            local ok, err = checkpoint_repo.commit(session_id, user_id,
                {checkpoint_id = message_id, message_id = message_id, exclusive = true, source_id = request_id},
                "summary", {}, uuid.v7())
            session_repo.delete(foreign_session)
            context_repo.delete(foreign_context)
            test.is_nil(ok)
            test.eq(err, "Checkpoint request not found in session")
            test.eq(json.decode(context_repo.get(context_id).data).current_checkpoint_id, "old-anchor")
        end)

        it("rejects a different owner without changing the checkpoint", function()
            local ok, err = checkpoint_repo.commit(session_id, "other-owner",
                { message_id = message_id, checkpoint_id = message_id }, "new summary", {}, uuid.v7())
            test.is_nil(ok)
            test.eq(err, "Session not found")
            test.eq(json.decode(context_repo.get(context_id).data).current_checkpoint_id, "old-anchor")
        end)

        it("rejects an anchor outside the session without changing its summary", function()
            local ok, err = checkpoint_repo.commit(session_id, user_id,
                { message_id = uuid.v7(), checkpoint_id = message_id }, "new summary", {}, uuid.v7())
            test.is_nil(ok)
            test.eq(err, "Checkpoint message not found in session")
            local contexts = session_contexts_repo.list_by_session(session_id)
            for _, row in ipairs(contexts) do
                if row.type == consts.CONTEXT_TYPES.CONVERSATION_SUMMARY then test.eq(row.text, "old summary") end
            end
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
