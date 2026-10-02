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
    end)
end

return { run_tests = test.run_cases(define_tests) }
