local test = require("test")
local consts = require("consts")
local message_handlers = require("message_handlers")
local session_handlers = require("session_handlers")

-- A turn is a chain of agent_step -> process_tools -> agent_continue -> agent_step ... that
-- runs for as long as the model keeps calling tools. The token-threshold checkpoint is the
-- only mechanism that compacts the conversation, so its trigger check has to run on EVERY
-- step that reports usage, including the continuation steps. If it only runs on the step
-- that answers the user's message, a long tool loop never checkpoints no matter how far
-- past the threshold the prompt grows (observed 2026-09-21: prompt at 176k tokens against a
-- 100k threshold for 10.5 hours, zero checkpoints, because every step was an agent_continue).
--
-- The check has to be queued ahead of the tool round, so that the checkpoint it schedules
-- lands before the next agent step reads the prompt, and a mid-turn checkpoint has to anchor
-- on the step's own assistant message rather than on the turn's user message, otherwise the
-- whole (long) turn stays in the window and nothing is compacted.

local THRESHOLD = 100000
local PROMPT_TOKENS_OVER_THRESHOLD = 150000

local function fake_agent(prompt_tokens: number?): any
    return {
        id = "agent:documents",
        model = "model:test",
        tool_wrappers = {},
        agent_options = {},
        bindings = nil,
        step = function(_self, _builder, _runtime_options)
            local tokens = nil
            if prompt_tokens ~= nil then
                tokens = {
                    prompt_tokens = prompt_tokens,
                    completion_tokens = 84,
                    total_tokens = prompt_tokens + 84
                }
            end
            return {
                result = "",
                tokens = tokens,
                tool_calls = {
                    {
                        id = "call-1",
                        name = "pack_document",
                        arguments = "{}",
                        registry_id = "app:pack_document"
                    }
                }
            }
        end
    }
end

local function mock_ctx(agent: any, config_overrides: any?): (any, any)
    local captured = {
        stored = {} :: { any },
        assistant_ids = {} :: { string },
        session_errors = {} :: { any },
    }

    local empty_query = {
        from_checkpoint = function(self) return self end,
        all = function(_self) return {}, nil end,
        count = function(_self) return 0, nil end,
    }

    local config = {
        agent_id = agent.id,
        model = agent.model,
        token_checkpoint_threshold = THRESHOLD,
        checkpoint_function_id = "wippy.session.funcs:checkpoint",
        title_function_id = nil,
    }
    for key, value in pairs(config_overrides or {}) do
        config[key] = value
    end

    local ctx = {
        session_id = "sess-1",
        user_id = "user-1",
        lifecycle_state = {},
        config = config,
        reader = {
            messages = function(_self) return empty_query end,
            contexts = function(_self) return empty_query end,
            state = function(_self) return { title = "t", meta = {}, config = {} } end,
            get_full_context = function(_self) return {}, nil end,
            get_context = function(_self, _key) return nil end,
            reset = function(_self) return true end,
        },
        writer = {
            add_message = function(_self, msg_type, content, metadata)
                local id = "stored-" .. tostring(msg_type) .. "-" .. tostring(#captured.stored + 1)
                table.insert(captured.stored, { id = id, type = msg_type, content = content, metadata = metadata or {} })
                if msg_type == consts.MSG_TYPE.ASSISTANT then
                    table.insert(captured.assistant_ids, id)
                end
                return id, nil
            end,
            update_meta = function(_self, _updates) return true end,
            update_message_meta = function(_self, _id, _meta) return true end,
        },
        upstream = {
            response_beginning = function() end,
            send_message_update = function() end,
            invalidate_message = function() end,
            message_error = function() end,
            update_session = function() end,
            session_error = function(_self, code, message)
                table.insert(captured.session_errors, { code = code, message = message })
            end,
        },
        agent_ctx = {
            load_agent = function(_self, _agent_id, _opts) return agent, nil end,
            get_current_agent = function(_self) return agent end,
        },
    }

    return ctx, captured
end

local function find_op(ops: any, op_type: string): (any, number?)
    for index, op in ipairs(ops or {}) do
        if op.type == op_type then
            return op, index
        end
    end
    return nil, nil
end

local function stored_of_type(captured: any, msg_type: string): { any }
    local out = {}
    for _, row in ipairs(captured.stored) do
        if row.type == msg_type then
            table.insert(out, row)
        end
    end
    return out
end

local function user_step(ctx: any): (any, string?)
    return message_handlers.agent_step(ctx, { message_id = "msg-user", request_id = "req-1", from_user = true })
end

local function continue_step(ctx: any): (any, string?)
    return message_handlers.agent_continue(ctx, { message_id = "msg-user", request_id = "req-1" })
end

-- A tool round as the tool_caller reports it: results keyed by call id.
local function round(report: any, args: any?): any
    return {
        ["call-1"] = {
            result = report,
            tool_call = { name = "pack_document", args = args or { title = "Caywood", acknowledge_placeholders = 24 } }
        }
    }
end

local function define_tests()
    describe("checkpoint trigger inside a tool loop", function()
        it("queues the background trigger check on the first step of a user turn, anchored on the user's message", function()
            local ctx = mock_ctx(fake_agent(PROMPT_TOKENS_OVER_THRESHOLD))

            local result, err = user_step(ctx)

            test.is_nil(err)
            test.not_nil(result)
            test.not_nil(find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS))

            local trigger = find_op(result.next_ops, consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS)
            test.not_nil(trigger, "first step of a user turn must schedule the background trigger check")
            test.eq(trigger.tokens.prompt_tokens, PROMPT_TOKENS_OVER_THRESHOLD)
            test.eq(trigger.message_id, "msg-user")
            test.eq(trigger.checkpoint_anchor_id, "msg-user",
                "a checkpoint taken on the user's step keeps the user's message verbatim in the window")
        end)

        it("queues the background trigger check on a continuation step, anchored on that step's assistant message", function()
            local ctx, captured = mock_ctx(fake_agent(PROMPT_TOKENS_OVER_THRESHOLD))

            -- This is the op process_tools queues after every tool round.
            local result, err = continue_step(ctx)

            test.is_nil(err)
            test.not_nil(result)
            test.not_nil(find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS),
                "the model asked for another tool, so the loop continues")

            local trigger = find_op(result.next_ops, consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS)
            test.not_nil(trigger,
                "a continuation step reported " .. tostring(PROMPT_TOKENS_OVER_THRESHOLD)
                    .. " prompt tokens against a threshold of " .. tostring(THRESHOLD)
                    .. " and scheduled no background trigger check; a tool loop can never checkpoint")
            test.eq(trigger.message_id, "msg-user")
            test.eq(trigger.tokens.prompt_tokens, PROMPT_TOKENS_OVER_THRESHOLD)

            test.eq(#captured.assistant_ids, 1)
            test.eq(trigger.checkpoint_anchor_id, captured.assistant_ids[1],
                "a mid-turn checkpoint anchors on the step's own assistant message, so the window after it holds only the latest action")
        end)

        it("queues the trigger check ahead of the tool round so the checkpoint lands before the next step", function()
            local ctx = mock_ctx(fake_agent(PROMPT_TOKENS_OVER_THRESHOLD))

            local result, err = continue_step(ctx)
            test.is_nil(err)

            local _, check_index = find_op(result.next_ops, consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS)
            local _, tools_index = find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS)
            test.not_nil(check_index)
            test.not_nil(tools_index)
            test.lt(check_index, tools_index,
                "queued after the tool round, the checkpoint would run after the next agent step and that step would trigger another one")
        end)

        it("does not queue the trigger check when the step reports no usage", function()
            local ctx = mock_ctx(fake_agent(nil))

            local result, err = continue_step(ctx)
            test.is_nil(err)
            test.is_nil(find_op(result.next_ops, consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS))
            test.not_nil(find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS))
        end)

        it("leads to a checkpoint anchored on the continuation step once it crosses the token threshold", function()
            local ctx, captured = mock_ctx(fake_agent(PROMPT_TOKENS_OVER_THRESHOLD))

            local step_result, step_err = continue_step(ctx)
            test.is_nil(step_err)

            local trigger = find_op(step_result.next_ops, consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS)
            test.not_nil(trigger, "continuation step must schedule the background trigger check")

            local check_result, check_err = session_handlers.check_background_triggers(ctx, trigger)
            test.is_nil(check_err)
            test.not_nil(check_result)
            test.is_true(check_result.checkpoint_triggered == true,
                "prompt tokens above the threshold must schedule CREATE_CHECKPOINT")

            local checkpoint = find_op(check_result.next_ops, consts.OP_TYPE.CREATE_CHECKPOINT)
            test.not_nil(checkpoint)
            test.eq(checkpoint.checkpoint_id, captured.assistant_ids[1])
            test.eq(checkpoint.message_id, captured.assistant_ids[1])
            test.eq(checkpoint.trigger_tokens, PROMPT_TOKENS_OVER_THRESHOLD)
        end)
    end)

    describe("turn loop guards", function()
        it("stops the turn once the agent steps exceed max_turn_iterations", function()
            local ctx, captured = mock_ctx(fake_agent(1000), { max_turn_iterations = 3 })

            local first = user_step(ctx)
            test.not_nil(find_op(first.next_ops, consts.OP_TYPE.PROCESS_TOOLS))
            for _ = 1, 2 do
                local more = continue_step(ctx)
                test.not_nil(find_op(more.next_ops, consts.OP_TYPE.PROCESS_TOOLS), "steps within the limit run normally")
            end

            local stopped, err = continue_step(ctx)
            test.is_nil(err)
            test.eq(stopped.stopped, "max_iterations")
            test.is_true(stopped.completed)
            test.eq(#stopped.next_ops, 0, "a stopped turn queues nothing, so the session goes idle")

            local system_rows = stored_of_type(captured, consts.MSG_TYPE.SYSTEM)
            test.eq(#system_rows, 1)
            test.eq(system_rows[1].metadata.system_action, consts.SYSTEM_ACTIONS.TURN_LIMIT)
            test.eq(system_rows[1].metadata.reason, "max_iterations")
            test.eq(system_rows[1].metadata.steps, 3)
            test.contains(system_rows[1].content, "3 agent steps")

            local developer_rows = stored_of_type(captured, consts.MSG_TYPE.DEVELOPER)
            test.eq(#developer_rows, 1)
            test.contains(developer_rows[1].content, "Do not resume that loop")

            test.eq(#captured.session_errors, 1)
            test.eq(captured.session_errors[1].code, "turn_limit_reached")
        end)

        it("a new user message starts a fresh count", function()
            local ctx = mock_ctx(fake_agent(1000), { max_turn_iterations = 1 })

            test.not_nil(find_op(user_step(ctx).next_ops, consts.OP_TYPE.PROCESS_TOOLS))
            test.eq(continue_step(ctx).stopped, "max_iterations")

            local next_turn = user_step(ctx)
            test.is_nil(next_turn.stopped)
            test.not_nil(find_op(next_turn.next_ops, consts.OP_TYPE.PROCESS_TOOLS))
        end)

        it("agent_options.loop.max_iterations overrides the session limit", function()
            local agent = fake_agent(1000)
            agent.agent_options = { loop = { max_iterations = 2 } }
            local ctx = mock_ctx(agent, { max_turn_iterations = 250 })

            user_step(ctx)
            test.not_nil(find_op(continue_step(ctx).next_ops, consts.OP_TYPE.PROCESS_TOOLS))
            test.eq(continue_step(ctx).stopped, "max_iterations")
        end)

        it("a limit of 0 disables the step cap", function()
            local ctx = mock_ctx(fake_agent(1000), { max_turn_iterations = 0, max_repeated_tool_calls = 0 })

            user_step(ctx)
            for _ = 1, 20 do
                local result = continue_step(ctx)
                test.is_nil(result.stopped)
                test.not_nil(find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS))
            end
        end)

        it("stops the turn when the same tool round repeats with identical arguments, whatever it returns", function()
            local ctx, captured = mock_ctx(fake_agent(1000), { max_repeated_tool_calls = 3 })
            user_step(ctx)

            -- Every response differs (a fresh id, a timestamp, generated text): a loop through
            -- such a tool never repeats a result, so results must not be part of the comparison.
            test.eq(message_handlers.note_tool_round(ctx, round({ document_id = "doc-1", generated_at = "10:00:01" })), 1)
            test.is_nil(continue_step(ctx).stopped)
            test.eq(message_handlers.note_tool_round(ctx, round({ document_id = "doc-2", generated_at = "10:00:09" })), 2)
            test.is_nil(continue_step(ctx).stopped)
            test.eq(message_handlers.note_tool_round(ctx, round({ document_id = "doc-3", generated_at = "10:00:17" })), 3)

            local stopped, err = continue_step(ctx)
            test.is_nil(err)
            test.eq(stopped.stopped, "repeated_tool_calls")
            test.eq(#stopped.next_ops, 0)

            local system_rows = stored_of_type(captured, consts.MSG_TYPE.SYSTEM)
            test.eq(#system_rows, 1)
            test.eq(system_rows[1].metadata.reason, "repeated_tool_calls")
            test.eq(system_rows[1].metadata.repeated_calls, 3)
            test.contains(system_rows[1].content, "pack_document")
            test.contains(system_rows[1].content, "3 times in a row")
            test.contains(system_rows[1].content, "identical arguments")
        end)

        it("different arguments reset the repeat count", function()
            local ctx = mock_ctx(fake_agent(1000), { max_repeated_tool_calls = 2 })
            user_step(ctx)

            test.eq(message_handlers.note_tool_round(ctx, round({ ok = true }, { title = "Note" })), 1)
            test.eq(message_handlers.note_tool_round(ctx, round({ ok = true }, { title = "Deed" })), 1)
            test.eq(message_handlers.note_tool_round(ctx, round({ ok = true }, { title = "Note" })), 1)
            test.is_nil(continue_step(ctx).stopped)
        end)

        it("compares arguments regardless of table key order, and a failed call counts like any other", function()
            local ctx = mock_ctx(fake_agent(1000), { max_repeated_tool_calls = 3 })
            user_step(ctx)

            local a = { ["call-1"] = { result = { b = 2 }, tool_call = { name = "t", args = { y = 1, x = 2 } } } }
            local b = { ["call-1"] = { result = { a = 1 }, tool_call = { name = "t", args = { x = 2, y = 1 } } } }
            local failing = { ["call-1"] = { error = "tracked-replace failed (status 500)", tool_call = { name = "t", args = { x = 2, y = 1 } } } }
            test.eq(message_handlers.note_tool_round(ctx, a), 1)
            test.eq(message_handlers.note_tool_round(ctx, b), 2, "the same call must match whatever the key order")
            test.eq(message_handlers.note_tool_round(ctx, failing), 3)
            test.eq(continue_step(ctx).stopped, "repeated_tool_calls")
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
