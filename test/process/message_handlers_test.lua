local test = require("test")
local consts = require("consts")
local message_handlers = require("message_handlers")
local session_handlers = require("session_handlers")
local command_bus = require("command_bus")
local tool_caller = require("tool_caller")
local control_handlers = require("control_handlers")

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
        response_batches = {} :: { any },
        message_errors = {} :: { any },
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
            add_response = function(self, content, metadata, calls)
                table.insert(captured.response_batches, {content = content, calls = calls})
                local assistant_id = self:add_message(consts.MSG_TYPE.ASSISTANT, content, metadata)
                local ids = {}
                for _, call in ipairs(calls) do
                    ids[call.id] = self:add_message(consts.MSG_TYPE.FUNCTION, call.arguments, {
                        call_id = call.id,
                        function_name = call.name,
                        status = consts.FUNC_STATUS.PENDING
                    })
                end
                return assistant_id, ids, nil
            end,
            update_meta = function(_self, _updates) return true end,
            update_message_meta = function(_self, id, meta)
                for _, row in ipairs(captured.stored) do
                    if row.id == id then
                        for key, value in pairs(meta) do row.metadata[key] = value end
                        return true
                    end
                end
                return nil, "message not found"
            end,
        },
        upstream = {
            response_beginning = function() end,
            send_message_update = function() end,
            invalidate_message = function() end,
            message_error = function(_self, id, code, message)
                table.insert(captured.message_errors, { id = id, code = code, message = message })
            end,
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
    describe("duplicate model call ids", function()
        local function rejects_response(agent, expanded_calls)
            local ctx, captured = mock_ctx(agent)
            local original_new = tool_caller.new
            tool_caller.new = function()
                return {
                    set_tool_wrappers = function() end,
                    set_wrapper_context = function() end,
                    validate = function(self, calls)
                        self.last_tool_calls = expanded_calls or calls
                        local first = self.last_tool_calls[1]
                        return { [first.id] = {valid = true, name = first.name, args = {},
                            registry_id = first.registry_id} }, nil
                    end
                }
            end
            local ok, result, err = pcall(user_step, ctx)
            tool_caller.new = original_new

            test.is_true(ok, tostring(result))
            test.is_nil(result)
            test.contains(tostring(err), "Duplicate tool call ID")
            test.eq(#captured.response_batches, 0)
            test.eq(#captured.assistant_ids, 0)
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.FUNCTION), 0)
            test.eq(#captured.message_errors, 1)
            test.eq(captured.message_errors[1].code, consts.ERROR_CODES.AGENT_ERROR)
            test.contains(captured.message_errors[1].message, "Duplicate tool call ID")
        end

        it("rejects duplicate ids returned by the model before persistence", function()
            local agent = fake_agent(nil)
            agent.step = function()
                return { result = "answer", tool_calls = {
                    { id = "same-id", name = "first", arguments = "{}", registry_id = "app:first" },
                    { id = "same-id", name = "second", arguments = "{}", registry_id = "app:second" }
                } }
            end
            rejects_response(agent)
        end)

        it("rejects a wrapper expansion that reuses a model call id", function()
            local agent = fake_agent(nil)
            agent.tool_wrappers = {{ id = "test-wrapper" }}
            local original = agent.step
            agent.step = function(self, builder, options)
                local result = original(self, builder, options)
                result.tool_calls[1].id = "same-id"
                return result
            end
            rejects_response(agent, {
                { id = "same-id", name = "pack_document", arguments = "{}", registry_id = "app:pack_document" },
                { id = "same-id", name = "wrapped_tool", arguments = "{}", registry_id = "app:wrapped_tool" }
            })
        end)

        it("surfaces strict wrapper validation errors without storing pending intents", function()
            local agent = fake_agent(nil)
            agent.tool_wrappers = {{ id = "strict-wrapper" }}
            local ctx, captured = mock_ctx(agent)
            local original_new = tool_caller.new
            tool_caller.new = function()
                return {
                    set_tool_wrappers = function() end,
                    set_wrapper_context = function() end,
                    validate = function(self)
                        self.last_tool_calls = {}
                        return nil, "strict wrapper rejected call"
                    end
                }
            end

            local result, err = user_step(ctx)

            tool_caller.new = original_new
            test.is_nil(result)
            test.contains(tostring(err), "strict wrapper rejected call")
            test.eq(#captured.message_errors, 1)
            test.eq(captured.message_errors[1].code, consts.ERROR_CODES.AGENT_ERROR)
            test.contains(captured.message_errors[1].message, "strict wrapper rejected call")
            test.eq(#captured.response_batches, 0)
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.FUNCTION), 0)
            test.eq(#captured.assistant_ids, 0)
        end)
    end)

    describe("wrapped tool call persistence", function()
        it("classifies function, private, and delegation intents before execution", function()
            local agent = fake_agent(nil)
            agent.step = function()
                return { result = "", tool_calls = {
                    { id = "public", name = "one", arguments = "{}", registry_id = "app:one" },
                    { id = "private", name = "two", arguments = "{}", registry_id = "app:two" },
                    { id = "delegation", name = "three", arguments = "{}", registry_id = "app:delegate" }
                } }
            end
            local ctx, captured = mock_ctx(agent, { delegation_func_id = "app:delegate" })
            local original_new = tool_caller.new
            tool_caller.new = function()
                return {
                    set_tool_wrappers = function() end,
                    set_wrapper_context = function() end,
                    validate = function(_self, calls)
                        return {
                            public = { valid = true, registry_id = calls[1].registry_id },
                            private = { valid = true, registry_id = calls[2].registry_id,
                                meta = { private = true } },
                            delegation = { valid = true, registry_id = calls[3].registry_id }
                        }, nil
                    end
                }
            end
            local step, step_err = user_step(ctx)
            tool_caller.new = original_new
            test.is_nil(step_err)
            test.not_nil(step)
            local calls = captured.response_batches[1].calls
            test.eq(calls[1].type, consts.MSG_TYPE.FUNCTION)
            test.eq(calls[2].type, consts.MSG_TYPE.PRIVATE_FUNCTION)
            test.eq(calls[3].type, consts.MSG_TYPE.DELEGATION)
        end)

        it("stores every wrapped call with the assistant before execution", function()
            local agent = fake_agent(nil)
            agent.tool_wrappers = {{id = "test-wrapper"}}
            local ctx, captured = mock_ctx(agent)
            local original_new = tool_caller.new
            tool_caller.new = function()
                return {
                    set_strategy = function() end,
                    set_tool_wrappers = function() end,
                    set_wrapper_context = function() end,
                    validate = function(self, calls)
                        self.last_tool_calls = {calls[1], {
                            id = "wrapped-call", name = "wrapped_tool", arguments = "{}",
                            registry_id = "app:wrapped_tool"
                        }}
                        return {
                            ["call-1"] = {valid = true, name = calls[1].name, args = {},
                                registry_id = calls[1].registry_id},
                            ["wrapped-call"] = {valid = true, name = "wrapped_tool", args = {},
                                registry_id = "app:wrapped_tool"}
                        }, nil
                    end,
                    execute = function(_self, _context, validated)
                        return {
                            ["call-1"] = {result = "first", tool_call = validated["call-1"]},
                            ["wrapped-call"] = {result = "second", tool_call = validated["wrapped-call"]}
                        }
                    end
                }
            end
            local step, step_err = user_step(ctx)
            test.is_nil(step_err)
            test.eq(#captured.response_batches, 1)
            test.eq(#captured.response_batches[1].calls, 2)
            local op = find_op(step.next_ops, consts.OP_TYPE.PROCESS_TOOLS)
            test.not_nil(op)
            local processed, process_err = message_handlers.process_tools(ctx, op)
            tool_caller.new = original_new
            test.is_nil(process_err)
            test.not_nil(processed)
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.FUNCTION), 2)
        end)
    end)
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
        it("fails when either turn-limit notice cannot be stored", function()
            for _, failed_type in ipairs({ consts.MSG_TYPE.SYSTEM, consts.MSG_TYPE.DEVELOPER }) do
                local ctx = mock_ctx(fake_agent(1000), { max_turn_iterations = 1 })
                local original_add = ctx.writer.add_message
                user_step(ctx)
                ctx.writer.add_message = function(self, kind, content, metadata)
                    if kind == failed_type then return nil, "turn notice disk unavailable" end
                    return original_add(self, kind, content, metadata)
                end
                local result, err = continue_step(ctx)
                test.is_nil(result)
                test.contains(tostring(err), "turn notice disk unavailable")
            end
        end)

        it("fails when a truncation notice cannot be stored", function()
            local agent = fake_agent(nil)
            agent.step = function() return { result = "", truncated = true, tool_calls = {} } end
            local ctx = mock_ctx(agent)
            ctx.writer.add_message = function() return nil, "truncation disk unavailable" end

            local result, err = user_step(ctx)

            test.is_nil(result)
            test.contains(tostring(err), "truncation disk unavailable")
        end)

        it("fails when a memory prompt cannot be stored", function()
            local agent = fake_agent(nil)
            agent.step = function()
                return { result = "", tool_calls = {},
                    memory_prompt = { content = "remember this" } }
            end
            local ctx = mock_ctx(agent)
            ctx.writer.add_message = function() return nil, "memory disk unavailable" end

            local result, err = user_step(ctx)

            test.is_nil(result)
            test.contains(tostring(err), "memory disk unavailable")
        end)

        it("records cancellation for every call when stop arrives during the model step", function()
            local agent = fake_agent(nil)
            agent.step = function()
                return { result = "", tool_calls = {
                    { id = "call-1", name = "one", arguments = "{}", registry_id = "app:one" },
                    { id = "call-2", name = "two", arguments = "{}", registry_id = "app:two" }
                } }
            end
            local ctx, captured = mock_ctx(agent)
            ctx.coordinator = { stop_requested = function() return true end }
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.is_true(result.completed)
            test.is_nil(find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS))
            local calls = stored_of_type(captured, consts.MSG_TYPE.FUNCTION)
            test.eq(#calls, 2)
            for _, call in ipairs(calls) do
                test.eq(call.metadata.status, consts.FUNC_STATUS.CANCELLED)
            end
        end)

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

    describe("stop during tool execution", function()
        it("records the returned result and ends the turn before another agent step", function()
            local steps = 0
            local agent = fake_agent(nil)
            local original_step = agent.step
            agent.step = function(self, builder, options)
                steps = steps + 1
                return original_step(self, builder, options)
            end
            local ctx, captured = mock_ctx(agent)
            local bus = command_bus.new(ctx)
            ctx.queue_empty_callback = function() bus:stop() end
            local original_new = tool_caller.new
            tool_caller.new = function()
                return {
                    set_strategy = function() end,
                    set_tool_wrappers = function() end,
                    set_wrapper_context = function() end,
                    validate = function(_self, calls)
                        return { [calls[1].id] = {
                            valid = true, name = calls[1].name, args = {},
                            registry_id = calls[1].registry_id
                        } }, nil
                    end,
                    execute = function(_self, _context, validated)
                        bus:request_stop()
                        return { ["call-1"] = { result = "done", tool_call = validated["call-1"] } }
                    end
                }
            end
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, message_handlers.agent_step)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, message_handlers.process_tools)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, message_handlers.agent_continue)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP,
                message_id = "msg-user", request_id = "req-1", from_user = true })
            local ok, err = bus:run()
            tool_caller.new = original_new
            test.is_nil(err)
            test.is_true(ok)
            test.eq(steps, 1)
            local calls = stored_of_type(captured, consts.MSG_TYPE.FUNCTION)
            test.eq(#calls, 1)
            test.eq(calls[1].metadata.status, consts.FUNC_STATUS.SUCCESS)
            test.eq(calls[1].metadata.result, "done")
        end)
    end)

    describe("committed call outcomes", function()
        local function call_fixture()
            local ctx, captured = mock_ctx(fake_agent(nil), {
                delegation_func_id = "app:delegate"
            })
            local calls = {
                { id = "function", name = "one", registry_id = "app:one", arguments = "{}" },
                { id = "private", name = "two", registry_id = "app:two", arguments = "{}" },
                { id = "delegation", name = "three", registry_id = "app:delegate", arguments = "{}" }
            }
            local ids = {}
            ids.function_call = ctx.writer:add_message(consts.MSG_TYPE.FUNCTION, "{}", {
                status = consts.FUNC_STATUS.PENDING })
            ids.private_call = ctx.writer:add_message(consts.MSG_TYPE.PRIVATE_FUNCTION, "{}", {
                status = consts.FUNC_STATUS.PENDING })
            ids.delegation_call = ctx.writer:add_message(consts.MSG_TYPE.DELEGATION, "{}", {
                status = consts.FUNC_STATUS.PENDING })
            local mapped = { ["function"] = ids.function_call,
                ["private"] = ids.private_call, ["delegation"] = ids.delegation_call }
            local validated = {
                ["function"] = { valid = true, name = "one", args = {}, registry_id = "app:one" },
                ["private"] = { valid = true, name = "two", args = {}, registry_id = "app:two",
                    meta = { private = true } },
                ["delegation"] = { valid = true, name = "three", args = {}, registry_id = "app:delegate" }
            }
            return ctx, captured, calls, mapped, validated
        end

        it("marks omitted private and delegation results as errors", function()
            local ctx, captured, calls, ids, validated = call_fixture()
            local caller = {
                set_strategy = function() end,
                execute = function(_self, _context, tools)
                    return { ["function"] = { result = "done", tool_call = tools["function"] } }
                end
            }
            local result, err = message_handlers.process_tools(ctx, {
                tool_calls = calls, call_message_ids = ids,
                caller = caller, validated_tools = validated,
                message_id = "user", agent = { id = "agent:documents" }
            })
            test.is_nil(err)
            test.not_nil(result)
            test.eq((captured.stored[1] :: any).metadata.status, consts.FUNC_STATUS.SUCCESS)
            test.eq((captured.stored[2] :: any).metadata.status, consts.FUNC_STATUS.ERROR)
            test.eq((captured.stored[3] :: any).metadata.status, consts.FUNC_STATUS.ERROR)
        end)

        it("marks every intent as error when execution throws", function()
            local ctx, captured, calls, ids, validated = call_fixture()
            local caller = {
                set_strategy = function() end,
                execute = function() error("tool runner failed") end
            }
            local result, err = message_handlers.process_tools(ctx, {
                tool_calls = calls, call_message_ids = ids,
                caller = caller, validated_tools = validated,
                message_id = "user", agent = { id = "agent:documents" }
            })
            test.is_nil(err)
            test.not_nil(result)
            for _, row in ipairs(captured.stored) do
                test.eq(row.metadata.status, consts.FUNC_STATUS.ERROR)
                test.contains(tostring(row.metadata.result), "tool runner failed")
            end
        end)

        it("fails the turn when persisting successful tool control effects fails", function()
            local ctx, captured, calls, ids, validated = call_fixture()
            ctx.writer.update_meta = function() return nil, "config store unavailable" end
            ctx.agent_ctx.set_active_tools = function() end

            local continued = 0
            local bus = command_bus.new(ctx)
            ctx.queue_empty_callback = function() bus:stop(); return true end
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, message_handlers.process_tools)
            bus:mount_op_handler(consts.OP_TYPE.CONTROL_CONFIG, control_handlers.control_config)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                continued = continued + 1
                return { completed = true }
            end)
            local caller = {
                set_strategy = function() end,
                execute = function(_self, _context, tools)
                    return { ["function"] = {
                        result = { value = "written", _control = { config = { tools = { "app:tool" } } } },
                        tool_call = tools["function"]
                    } }
                end
            }
            bus:queue_op({ type = consts.OP_TYPE.PROCESS_TOOLS,
                tool_calls = { calls[1] }, call_message_ids = ids, caller = caller,
                validated_tools = validated, message_id = "user", agent = { id = "agent:documents" } })

            local ok, err = bus:run()

            test.eq(continued, 0)
            test.is_nil(ok)
            test.contains(tostring(err), "config store unavailable")
            local function_row = nil
            for _, row in ipairs(captured.stored) do
                if row.id == ids["function"] then function_row = row end
            end
            test.not_nil(function_row)
            test.eq((function_row or {}).metadata.status, consts.FUNC_STATUS.SUCCESS)
            test.eq(((function_row or {}).metadata.result or {}).value, "written")
            test.eq(((function_row or {}).metadata.control_operations or {}).config.tools[1], "app:tool")
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
