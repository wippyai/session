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

local function mock_ctx(agent: any): (any, any)
    local captured = {
        stored = {} :: { any },
        assistant_ids = {} :: { string },
    }

    local empty_query = {
        from_checkpoint = function(self) return self end,
        all = function(_self) return {}, nil end,
        count = function(_self) return 0, nil end,
    }

    local ctx = {
        session_id = "sess-1",
        user_id = "user-1",
        lifecycle_state = {},
        config = {
            agent_id = agent.id,
            model = agent.model,
            token_checkpoint_threshold = THRESHOLD,
            checkpoint_function_id = "wippy.session.funcs:checkpoint",
            title_function_id = nil,
        },
        reader = {
            messages = function(_self) return empty_query end,
            contexts = function(_self) return empty_query end,
            state = function(_self) return { title = "t", meta = {}, config = {} } end,
            get_full_context = function(_self) return {}, nil end,
            get_context = function(_self, _key) return nil end,
            reset = function(_self) return true end,
        },
        writer = {
            add_message = function(_self, msg_type, _content, _metadata)
                local id = "stored-" .. tostring(msg_type) .. "-" .. tostring(#captured.stored + 1)
                table.insert(captured.stored, { id = id, type = msg_type })
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

local function define_tests()
    describe("checkpoint trigger inside a tool loop", function()
        it("queues the background trigger check on the first step of a user turn, anchored on the user's message", function()
            local ctx = mock_ctx(fake_agent(PROMPT_TOKENS_OVER_THRESHOLD))

            local result, err = message_handlers.agent_step(ctx, {
                message_id = "msg-user",
                request_id = "req-1",
                from_user = true
            })

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
            local result, err = message_handlers.agent_continue(ctx, {
                message_id = "msg-user",
                request_id = "req-1"
            })

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

            local result, err = message_handlers.agent_continue(ctx, {
                message_id = "msg-user",
                request_id = "req-1"
            })
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

            local result, err = message_handlers.agent_continue(ctx, {
                message_id = "msg-user",
                request_id = "req-1"
            })
            test.is_nil(err)
            test.is_nil(find_op(result.next_ops, consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS))
            test.not_nil(find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS))
        end)

        it("leads to a checkpoint anchored on the continuation step once it crosses the token threshold", function()
            local ctx, captured = mock_ctx(fake_agent(PROMPT_TOKENS_OVER_THRESHOLD))

            local step_result, step_err = message_handlers.agent_continue(ctx, {
                message_id = "msg-user",
                request_id = "req-1"
            })
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
end

return { run_tests = test.run_cases(define_tests) }
