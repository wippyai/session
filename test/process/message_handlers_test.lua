local test = require("test")
local consts = require("consts")
local message_handlers = require("message_handlers")
local session_handlers = require("session_handlers")
local command_bus = require("command_bus")
local tool_caller = require("tool_caller")
local control_handlers = require("control_handlers")
local output = require("output")
local uuid = require("uuid")
local json = require("json")
local google_mapper = require("google_mapper")

local THRESHOLD = 100000
local PROMPT_TOKENS_OVER_THRESHOLD = 150000

type PublicToolEvent = {
    topic_id: string,
    type: string,
    payload: {
        message_id: string?,
        call_id: string?,
        function_name: string?,
        error: string?,
    },
}

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
                    total_tokens = prompt_tokens + 84,
                    context_tokens = prompt_tokens
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
            list_pending_inputs = function(_self) return {}, nil end,
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
            test.not_nil((find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS)))

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
            test.is_nil((find_op(result.next_ops, consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS)))
            test.not_nil((find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS)))
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

        it("checks cached context throughout a long tool loop before admitting the next step", function()
            local steps = 0
            local checks = 0
            local checkpoints = {}
            local events = {}
            local agent = fake_agent(nil)
            agent.step = function()
                steps = steps + 1
                table.insert(events, "step:" .. tostring(steps))
                if steps == 23 then return { result = "done" } end
                local context_tokens = 58000 + steps * 2000
                return {
                    result = "",
                    tokens = {
                        prompt_tokens = 20,
                        cache_read_tokens = context_tokens - 40,
                        cache_write_tokens = 20,
                        context_tokens = context_tokens,
                    },
                    tool_calls = {{ id = "call-" .. tostring(steps), name = "pack_document",
                        arguments = { round = steps }, registry_id = "app:pack_document" }},
                }
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
                        local call = calls[1]
                        return { [call.id] = { valid = true, name = call.name,
                            args = call.arguments, registry_id = call.registry_id } }, nil
                    end,
                    execute = function(_self, _context, tools)
                        table.insert(events, "tools:" .. tostring(steps))
                        local id = "call-" .. tostring(steps)
                        return { [id] = { result = "done", tool_call = tools[id] } }
                    end,
                }
            end
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, message_handlers.agent_step)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, message_handlers.agent_continue)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, message_handlers.process_tools)
            bus:mount_op_handler(consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS, function(context, op)
                checks = checks + 1
                return session_handlers.check_background_triggers(context, op)
            end)
            bus:mount_op_handler(consts.OP_TYPE.CREATE_CHECKPOINT, function(_context, op)
                table.insert(checkpoints, op)
                table.insert(events, "checkpoint:" .. tostring(steps))
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP,
                message_id = "msg-user", request_id = "req-1", from_user = true })
            local ok, err = bus:run()
            tool_caller.new = original_new

            test.is_nil(err)
            test.is_true(ok)
            test.eq(steps, 23)
            test.eq(checks, 22)
            test.eq(#checkpoints, 1, "uncached input stays at 20 while context crosses the threshold")
            test.eq(checkpoints[1].trigger_tokens, 102000)
            test.eq(checkpoints[1].checkpoint_id, captured.assistant_ids[22])
            test.eq(checkpoints[1].message_id, captured.assistant_ids[22])
            test.eq(events[#events - 3], "step:22")
            test.eq(events[#events - 2], "checkpoint:22")
            test.eq(events[#events - 1], "tools:22")
            test.eq(events[#events], "step:23")
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.FUNCTION), 22)
        end)
    end)

    describe("turn loop guards", function()
        it("feeds every parallel failure to the model, allows correction, and stops after final text", function()
            local agent = fake_agent(nil)
            local ctx, captured = mock_ctx(agent)
            local first_id, second_id, corrected_id = uuid.v7(), uuid.v7(), uuid.v7()
            local steps, executions = 0, 0
            local function read_rows()
                local rows = {{ message_id = "msg-user", type = consts.MSG_TYPE.USER, data = "Read the configuration", metadata = {} }}
                for _, row in ipairs(captured.stored) do
                    rows[#rows + 1] = { message_id = row.id, type = row.type,
                        data = row.content, metadata = row.metadata }
                end
                return rows, nil
            end
            ctx.reader.list_all_messages = read_rows
            ctx.reader.messages = function()
                return { from_checkpoint = function(self) return self end, all = read_rows }
            end
            agent.step = function(_self, builder)
                steps = steps + 1
                if steps == 1 then
                    return { result = "Checking", tool_calls = {
                        { id = first_id, name = "AutomationsRead", arguments = '{"id":"missing"}' },
                        { id = second_id, name = "Platform", arguments = '{"id":"denied"}' },
                    } }
                end
                local messages = builder:get_messages()
                local paired = {}
                for _, message in ipairs(messages) do
                    if message.role == "function_result" then
                        test.is_nil(paired[message.function_call_id], "exactly one result per call")
                        paired[message.function_call_id] = message
                    end
                end
                test.eq(paired[first_id].content[1].text, "automation missing")
                test.eq(paired[second_id].content[1].text, "permission denied")
                test.is_true(paired[first_id].is_error)
                test.is_true(paired[second_id].is_error)
                local wire = google_mapper.map_messages(messages)
                if steps == 2 then
                    test.eq(#wire[#wire].parts, 2, "both failures must reach the next provider request")
                    test.eq(wire[#wire].parts[1].functionResponse.response.error, "automation missing")
                    test.eq(wire[#wire].parts[2].functionResponse.response.error, "permission denied")
                    return { result = "Using the corrected identifier", tool_calls = {
                        { id = corrected_id, name = "AutomationsRead", arguments = '{"id":"existing"}' },
                    } }
                end
                test.eq(steps, 3)
                test.eq(paired[corrected_id].content[1].text, "configuration found")
                test.is_nil(paired[corrected_id].is_error)
                return { result = "Here is the configuration", tool_calls = {} }
            end

            local original_new = tool_caller.new
            tool_caller.new = function()
                return {
                    set_tool_wrappers = function() end,
                    set_wrapper_context = function() end,
                    set_strategy = function() end,
                    validate = function(_self, calls)
                        local validated = {}
                        for _, call in ipairs(calls) do
                            validated[call.id] = { valid = true, name = call.name,
                                args = json.decode(call.arguments) }
                        end
                        return validated, nil
                    end,
                    execute = function(_self, _context, tools)
                        executions = executions + 1
                        local results = {}
                        for id, call in pairs(tools) do
                            if id == corrected_id then
                                results[id] = { result = "configuration found", tool_call = call }
                            else
                                results[id] = { error = id == first_id and "automation missing" or "permission denied", tool_call = call }
                            end
                        end
                        return results, nil
                    end,
                }
            end
            local ok, failure = pcall(function()
                local step, step_err = user_step(ctx)
                test.is_nil(step_err)
                for _ = 1, 2 do
                    local tool_op = find_op(step.next_ops, consts.OP_TYPE.PROCESS_TOOLS)
                    test.not_nil(tool_op)
                    local processed, process_err = message_handlers.process_tools(ctx, tool_op)
                    test.is_nil(process_err)
                    local continuation = find_op(processed.next_ops, consts.OP_TYPE.AGENT_CONTINUE)
                    test.not_nil(continuation)
                    step, step_err = message_handlers.agent_continue(ctx, continuation)
                    test.is_nil(step_err)
                end
                test.eq(step.completed, true)
                test.eq(#step.next_ops, 0)
                test.eq(steps, 3)
                test.eq(executions, 2)
                test.eq(#stored_of_type(captured, consts.MSG_TYPE.FUNCTION), 3)
                test.eq(#captured.message_errors, 0)
            end)
            tool_caller.new = original_new
            test.is_true(ok, tostring(failure))
        end)

        it("does not let unrelated successes in changing batches erase repeated failures", function()
            local ctx = mock_ctx(fake_agent(1000), { max_repeated_tool_calls = 3 })
            user_step(ctx)
            for round = 1, 3 do
                test.eq(message_handlers.note_tool_round(ctx, {
                    failed = { error = "not found", tool_call = { name = "AutomationsRead", args = {id = "missing"} } },
                    successful = { result = "pong", tool_call = { name = "Ping", args = {nonce = round} } },
                }), round)
            end
            test.eq(continue_step(ctx).stopped, "repeated_tool_calls")
        end)

        it("counts a partly failed action once even if a parallel duplicate succeeds", function()
            local ctx = mock_ctx(fake_agent(1000), { max_repeated_tool_calls = 3 })
            user_step(ctx)
            for round = 1, 3 do
                test.eq(message_handlers.note_tool_round(ctx, {
                    failed = { error = "not found", tool_call = { name = "lookup", args = {id = "same"} } },
                    successful = { result = "found", tool_call = { name = "lookup", args = {id = "same"} } },
                    noise = { result = "pong", tool_call = { name = "Ping", args = {nonce = round} } },
                }), round)
            end
            test.eq(continue_step(ctx).stopped, "repeated_tool_calls")
        end)

        it("allows a recovered same action to reach the next model step before the repeat limit", function()
            local agent = fake_agent(1000)
            local ctx = mock_ctx(agent, { max_repeated_tool_calls = 3 })
            user_step(ctx)
            local call = { name = "lookup", args = { id = "same" } }
            test.eq(message_handlers.note_tool_round(ctx, { a = { error = "temporarily unavailable", tool_call = call } }), 1)
            test.eq(message_handlers.note_tool_round(ctx, { b = { error = "temporarily unavailable", tool_call = call } }), 2)
            test.eq(message_handlers.note_tool_round(ctx, { c = { result = "found", tool_call = call } }), 1)
            agent.step = function() return { result = "Recovered", tool_calls = {} } end
            local result, err = continue_step(ctx)
            test.is_nil(err)
            test.eq(result.completed, true)
            test.eq(#result.next_ops, 0)
        end)

        it("applies pending steering in chronological order without changing its stored timestamp", function()
            local ctx = mock_ctx(fake_agent(nil))
            local rows = {
                { message_id = "anchor", type = consts.MSG_TYPE.ASSISTANT, data = "working", metadata = {} },
                { message_id = "new", date = "2099-01-01T00:00:00.11Z", type = consts.MSG_TYPE.USER,
                    data = "latest instruction", metadata = { input = {state = "pending"} } },
                { message_id = "old", date = "2099-01-01T00:00:00.1Z", type = consts.MSG_TYPE.USER,
                    data = "earlier instruction", metadata = { input = {state = "pending"} } },
            }
            local applied = nil
            ctx.reader.list_all_messages = function() return rows, nil end
            ctx.writer.apply_inputs = function(_self, updates)
                applied = updates
                return true
            end
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.not_nil(result)
            assert(applied)
            test.eq(applied[1].message_id, "old")
            test.eq(applied[2].message_id, "new")
            test.eq(applied[1].metadata.input.after_message_id, "anchor")
            test.eq(rows[3].date, "2099-01-01T00:00:00.1Z")
        end)

        it("diagnostic: repeated paragraphs in one text-only response do not schedule another model step", function()
            local agent = fake_agent(nil)
            local calls = 0
            local paragraph = "Let us check the existing connections through Platform Manager."
            local content = paragraph .. "\n\n" .. paragraph .. "\n\n" .. paragraph
            agent.step = function()
                calls = calls + 1
                return { result = content, tool_calls = {}, finish_reason = "stop" }
            end
            local ctx, captured = mock_ctx(agent)

            local result, err = user_step(ctx)

            test.is_nil(err)
            test.eq(calls, 1)
            test.eq(result.completed, true)
            test.eq(#result.next_ops, 0)
            test.eq(#captured.response_batches, 1)
            test.eq(captured.response_batches[1].content, content)
            test.eq(#captured.response_batches[1].calls, 0)
        end)

        it("surfaces an empty token-limit response without scheduling a no-tool continuation", function()
            local agent = fake_agent(nil)
            local calls = 0
            local provider_result = { content = "", tool_calls = {}, finish_reason = output.FINISH_REASON.LENGTH }
            test.is_true(output.detect_truncation(provider_result))
            agent.step = function()
                calls = calls + 1
                return { result = provider_result.content, truncated = output.detect_truncation(provider_result),
                    truncation_reason = "empty_output",
                    tool_calls = provider_result.tool_calls, finish_reason = provider_result.finish_reason }
            end
            local ctx, captured = mock_ctx(agent)

            local result, err = user_step(ctx)
            test.is_nil(result)
            test.not_nil(err)
            test.eq(calls, 1)
            test.eq(ctx.turn_state.repeated_calls, 0)
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.ASSISTANT), 0)
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.DEVELOPER), 0)
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.FUNCTION), 0)
        end)

        it("foundation: a token-limit response with usable text and no tools ends the turn", function()
            local provider_result = { content = "a partial answer", tool_calls = {}, finish_reason = output.FINISH_REASON.LENGTH }
            test.is_false(output.detect_truncation(provider_result))
            local agent = fake_agent(nil)
            agent.step = function()
                return { result = provider_result.content, truncated = output.detect_truncation(provider_result),
                    tool_calls = provider_result.tool_calls, finish_reason = provider_result.finish_reason }
            end
            local ctx = mock_ctx(agent)
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.eq(result.completed, true)
            test.eq(#result.next_ops, 0)
        end)

        it("counts the same failed action once per round across changing batch sizes", function()
            local ctx = mock_ctx(fake_agent(1000), { max_repeated_tool_calls = 3 })
            user_step(ctx)
            local failures = 0
            for round_index, batch_size in ipairs({ 4, 2, 6, 2, 10 }) do
                local results = {}
                for call_index = 1, batch_size do
                    results["call-" .. round_index .. "-" .. call_index] = {
                        error = "automation not found",
                        tool_call = { name = "AutomationsRead", args = { action = "read_config", id = "missing" } }
                    }
                    failures = failures + 1
                end
                test.eq(message_handlers.note_tool_round(ctx, results), round_index)
                if round_index < 3 then test.is_nil(continue_step(ctx).stopped) end
            end
            test.eq(failures, 24)
            test.eq(continue_step(ctx).stopped, "repeated_tool_calls")
        end)

        it("alternating failed actions cannot evade the existing repeat limit", function()
            local ctx = mock_ctx(fake_agent(1000), { max_repeated_tool_calls = 3 })
            user_step(ctx)
            for index = 1, 5 do
                local name = index % 2 == 0 and "AutomationsRead" or "Platform"
                local results = {
                    ["call-" .. index] = { error = "unchanged failure", tool_call = { name = name, args = {} } }
                }
                test.eq(message_handlers.note_tool_round(ctx, results), math.ceil(index / 2))
                if index < 5 then test.is_nil(continue_step(ctx).stopped) end
            end
            test.eq(continue_step(ctx).stopped, "repeated_tool_calls")
        end)

        it("equivalent JSON arguments cannot evade the repeat limit by changing key order", function()
            local ctx = mock_ctx(fake_agent(1000), { max_repeated_tool_calls = 3 })
            user_step(ctx)
            for index = 1, 3 do
                local args = index % 2 == 0 and '{"id":"missing","action":"read_config"}'
                    or '{"action":"read_config","id":"missing"}'
                local results = {
                    ["call-" .. index] = { error = "automation not found",
                        tool_call = { name = "AutomationsRead", args = args } }
                }
                test.eq(message_handlers.note_tool_round(ctx, results), index)
                if index < 3 then test.is_nil(continue_step(ctx).stopped) end
            end
            test.eq(continue_step(ctx).stopped, "repeated_tool_calls")
        end)

        it("settles and counts an absent tool result as a failed action", function()
            local ctx = mock_ctx(fake_agent(1000))
            local settled = nil
            ctx.writer.update_message_meta = function(_self, _id, metadata)
                settled = metadata
                return true
            end
            local result, err = message_handlers.process_tools(ctx, {
                tool_calls = {{ id = "call-1", name = "AutomationsRead", arguments = "{}" }},
                call_message_ids = { ["call-1"] = "message-1" },
                message_id = "msg-user",
                caller = {
                    set_strategy = function() end,
                    execute = function() return {} end,
                },
            })
            test.is_nil(err)
            assert(settled)
            test.eq(settled.status, consts.FUNC_STATUS.ERROR)
            test.eq(settled.result, "Call outcome unknown")
            test.eq(ctx.turn_state.repeated_calls, 1)
            test.eq(result.next_ops[1].type, consts.OP_TYPE.AGENT_CONTINUE)
        end)

        it("allows corrected actions and resets that action's failure history after recovery and new input", function()
            local ctx = mock_ctx(fake_agent(1000), { max_repeated_tool_calls = 3 })
            user_step(ctx)
            local function failed(id)
                return { error = "not found", tool_call = { name = "lookup", args = { id = id } } }
            end
            test.eq(message_handlers.note_tool_round(ctx, { a = failed("old") }), 1)
            test.eq(message_handlers.note_tool_round(ctx, { b = failed("old"), c = failed("other") }), 2)
            test.is_nil(continue_step(ctx).stopped)
            test.eq(message_handlers.note_tool_round(ctx, { a = failed("corrected") }), 1)
            test.is_nil(continue_step(ctx).stopped)
            test.eq(message_handlers.note_tool_round(ctx, { a = { result = "found", tool_call = { name = "lookup", args = { id = "old" } } } }), 1)
            test.eq(message_handlers.note_tool_round(ctx, { a = failed("old") }), 2)
            test.eq(ctx.turn_state.failed_repeats, 1)
            test.is_nil(continue_step(ctx).stopped)
            message_handlers.agent_step(ctx, { message_id = "new-user-input", from_user = true })
            test.eq(message_handlers.note_tool_round(ctx, { a = failed("old") }), 1)
        end)

        it("does not conflate typed keys or delimiter-like strings in action arguments", function()
            local ctx = mock_ctx(fake_agent(1000))
            user_step(ctx)
            test.eq(message_handlers.note_tool_round(ctx, { a = { error = "failed", tool_call = {
                name = "lookup", args = {a = "x,string:b=y"} } } }), 1)
            test.eq(message_handlers.note_tool_round(ctx, { a = { error = "failed", tool_call = {
                name = "lookup", args = {a = "x", b = "y"} } } }), 1)
            test.eq(message_handlers.note_tool_round(ctx, { a = { error = "failed", tool_call = {
                name = "lookup", args = {[1] = "y"} } } }), 1)
            test.eq(message_handlers.note_tool_round(ctx, { a = { error = "failed", tool_call = {
                name = "lookup", args = {["1"] = "y"} } } }), 1)
        end)

        it("preserves incomplete-tool and legacy truncation retries without executing discarded calls", function()
            for _, reason in ipairs({ "tool_calls", "legacy" }) do
                local agent = fake_agent(nil)
                agent.step = function()
                    return { result = "partial reasoning", truncated = true,
                        truncation_reason = reason == "tool_calls" and reason or nil }
                end
                local ctx, captured = mock_ctx(agent)
                local result, err = user_step(ctx)
                test.is_nil(err)
                test.is_false(result.completed)
                test.eq(result.next_ops[1].type, consts.OP_TYPE.AGENT_STEP)
                test.eq(#stored_of_type(captured, consts.MSG_TYPE.FUNCTION), 0)
                test.eq(#stored_of_type(captured, consts.MSG_TYPE.DEVELOPER), 1)
            end
        end)

        it("sends the turn-limit event when either notice write fails", function()
            for _, failed_type in ipairs({ consts.MSG_TYPE.SYSTEM, consts.MSG_TYPE.DEVELOPER }) do
                local ctx, captured = mock_ctx(fake_agent(1000), { max_turn_iterations = 1 })
                local original_add = ctx.writer.add_message
                user_step(ctx)
                ctx.writer.add_message = function(self, kind, content, metadata)
                    if kind == failed_type then return nil, "turn notice disk unavailable" end
                    return original_add(self, kind, content, metadata)
                end
                local result, err = continue_step(ctx)
                test.is_nil(err)
                test.eq(result.stopped, "max_iterations")
                test.eq(captured.session_errors[1].code, "turn_limit_reached")
            end
        end)

        it("continues after a truncation notice write fails", function()
            local agent = fake_agent(nil)
            agent.step = function() return { result = "", truncated = true,
                truncation_reason = "tool_calls" } end
            local ctx = mock_ctx(agent)
            ctx.writer.add_message = function() return nil, "truncation disk unavailable" end

            local result, err = user_step(ctx)

            test.is_nil(err)
            test.eq(result.next_ops[1].type, consts.OP_TYPE.AGENT_STEP)
        end)

        it("continues tool work when a memory prompt cannot be stored", function()
            local agent = fake_agent(nil)
            agent.step = function()
                return { result = "", tool_calls = {{ id = "call-1", name = "pack_document",
                    arguments = "{}", registry_id = "app:pack_document" }},
                    memory_prompt = { content = "remember this" } }
            end
            local ctx, captured = mock_ctx(agent)
            local original_add = ctx.writer.add_message
            ctx.writer.add_message = function(self, kind, content, metadata)
                if kind == consts.MSG_TYPE.DEVELOPER then return nil, "memory disk unavailable" end
                return original_add(self, kind, content, metadata)
            end

            local result, err = user_step(ctx)

            test.is_nil(err)
            test.not_nil((find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS)))
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.FUNCTION), 1)
        end)

        it("records cancellation for every call when stop arrives during the model step", function()
            local agent = fake_agent(nil)
            local stopped = false
            agent.step = function()
                stopped = true
                return { result = "", tool_calls = {
                    { id = "call-1", name = "one", arguments = "{}", registry_id = "app:one" },
                    { id = "call-2", name = "two", arguments = "{}", registry_id = "app:two" }
                } }
            end
            local ctx, captured = mock_ctx(agent)
            ctx.coordinator = { stop_requested = function() return stopped end }
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.is_true(result.completed)
            test.is_nil((find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS)))
            local calls = stored_of_type(captured, consts.MSG_TYPE.FUNCTION)
            test.eq(#calls, 2)
            for _, call in ipairs(calls) do
                test.eq(call.metadata.status, consts.FUNC_STATUS.CANCELLED)
            end
        end)

        it("stops the turn once the agent steps exceed max_turn_iterations", function()
            local ctx, captured = mock_ctx(fake_agent(1000), { max_turn_iterations = 3 })

            local first = user_step(ctx)
            test.not_nil((find_op(first.next_ops, consts.OP_TYPE.PROCESS_TOOLS)))
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

            test.not_nil((find_op(user_step(ctx).next_ops, consts.OP_TYPE.PROCESS_TOOLS)))
            test.eq(continue_step(ctx).stopped, "max_iterations")

            local finished, finish_err = message_handlers.finish_turn(ctx)
            test.is_nil(finish_err)
            test.is_true(finished.completed)
            local next_turn = user_step(ctx)
            test.is_nil(next_turn.stopped)
            test.not_nil((find_op(next_turn.next_ops, consts.OP_TYPE.PROCESS_TOOLS)))
        end)

        it("agent_options.loop.max_iterations overrides the session limit", function()
            local agent = fake_agent(1000)
            agent.agent_options = { loop = { max_iterations = 2 } }
            local ctx = mock_ctx(agent, { max_turn_iterations = 250 })

            user_step(ctx)
            test.not_nil((find_op(continue_step(ctx).next_ops, consts.OP_TYPE.PROCESS_TOOLS)))
            test.eq(continue_step(ctx).stopped, "max_iterations")
        end)

        it("a limit of 0 disables the step cap", function()
            local ctx = mock_ctx(fake_agent(1000), { max_turn_iterations = 0, max_repeated_tool_calls = 0 })

            user_step(ctx)
            for _ = 1, 20 do
                local result = continue_step(ctx)
                test.is_nil(result.stopped)
                test.not_nil((find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS)))
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

    describe("failed queue boundary", function()
        it("persists failed status instead of returning a failed turn to idle", function()
            local ctx = mock_ctx(fake_agent(1000))
            ctx.status = consts.STATUS.FAILED
            ctx.turn_state = {
                active = false,
                failed = true,
                input_policy = { while_running = "steer" },
            }
            local persisted = nil
            ctx.writer.update_meta = function(_self, updates)
                persisted = updates
                return true
            end

            local finished, err = message_handlers.finish_turn(ctx)

            test.is_nil(err)
            test.is_true(finished.completed)
            test.eq(ctx.status, consts.STATUS.FAILED)
            test.is_true((ctx.turn_state :: any).failed)
            test.eq((persisted :: any).status, consts.STATUS.FAILED)
            test.is_false((persisted :: any).meta.interaction.can_send)
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

        it("correlates public tool events with the committed message without changing their call topic", function()
            local ctx, captured, calls, ids, validated = call_fixture()
            local events = {} :: { any }
            ctx.upstream.send_message_update = function(_self, topic_id, event_type, payload)
                if event_type == consts.UPSTREAM_TYPES.FUNCTION_SUCCESS then
                    test.eq((captured.stored[1] :: any).metadata.status, consts.FUNC_STATUS.SUCCESS)
                end
                table.insert(events, { topic_id = topic_id, type = event_type, payload = payload })
            end
            local caller = {
                set_strategy = function() end,
                execute = function(_self, _context, tools)
                    return { ["function"] = { result = "done", tool_call = tools["function"] } }
                end
            }
            local result, err = message_handlers.process_tools(ctx, {
                tool_calls = { calls[1] }, call_message_ids = ids,
                caller = caller, validated_tools = { ["function"] = validated["function"] },
                message_id = "user", agent = { id = "agent:documents" }
            })
            test.is_nil(err)
            test.not_nil(result)
            test.eq(#events, 2)
            test.eq(events[1].type, consts.UPSTREAM_TYPES.FUNCTION_CALL)
            test.eq(events[2].type, consts.UPSTREAM_TYPES.FUNCTION_SUCCESS)
            for _, event in ipairs(events) do
                test.eq(event.topic_id, "function")
                test.eq(event.payload.message_id, ids["function"])
                test.eq(event.payload.function_name, "one")
            end
            test.eq(events[2].payload.call_id, "function")
        end)

        it("correlates public tool errors after persistence without exposing private or delegation calls", function()
            local ctx, captured, calls, ids, validated = call_fixture()
            local events: { PublicToolEvent } = {}
            ctx.upstream.send_message_update = function(_self, topic_id, event_type, payload)
                if event_type == consts.UPSTREAM_TYPES.FUNCTION_ERROR then
                    local persisted = false
                    for _, row in ipairs(captured.stored) do
                        if row.id == ids["function"] then
                            test.eq(row.metadata.status, consts.FUNC_STATUS.ERROR)
                            test.eq(row.metadata.result, "tool failed")
                            persisted = true
                        end
                    end
                    test.is_true(persisted)
                end
                table.insert(events, { topic_id = topic_id, type = event_type, payload = payload })
            end
            local caller = {
                set_strategy = function() end,
                execute = function(_self, _context, tools)
                    return {
                        ["function"] = { error = "tool failed", tool_call = tools["function"] },
                        ["private"] = { error = "private failure", tool_call = tools["private"] },
                        ["delegation"] = { error = "delegation failure", tool_call = tools["delegation"] }
                    }
                end
            }
            local result, err = message_handlers.process_tools(ctx, {
                tool_calls = calls, call_message_ids = ids,
                caller = caller, validated_tools = validated,
                message_id = "user", agent = { id = "agent:documents" }
            })
            test.is_nil(err)
            test.not_nil(result)
            test.eq(#events, 2)
            test.eq(events[1].type, consts.UPSTREAM_TYPES.FUNCTION_CALL)
            test.eq(events[2].type, consts.UPSTREAM_TYPES.FUNCTION_ERROR)
            for _, event in ipairs(events) do
                test.eq(event.topic_id, "function")
                test.eq(event.payload.message_id, ids["function"])
                test.eq(event.payload.function_name, "one")
            end
            test.eq(events[2].payload.call_id, "function")
            test.eq(events[2].payload.error, "Function execution failed")
            for _, row in ipairs(captured.stored) do
                test.eq(row.metadata.status, consts.FUNC_STATUS.ERROR)
            end
        end)

        it("does not announce a tool error when persisting its outcome fails", function()
            local ctx, captured, calls, ids, validated = call_fixture()
            local events = {}
            ctx.upstream.send_message_update = function(_self, _topic_id, event_type)
                table.insert(events, event_type)
            end
            ctx.writer.update_message_meta = function() return nil, "message store unavailable" end
            local caller = {
                set_strategy = function() end,
                execute = function(_self, _context, tools)
                    return { ["function"] = { error = "tool failed", tool_call = tools["function"] } }
                end
            }
            local result, err = message_handlers.process_tools(ctx, {
                tool_calls = { calls[1] }, call_message_ids = ids,
                caller = caller, validated_tools = { ["function"] = validated["function"] },
                message_id = "user", agent = { id = "agent:documents" }
            })
            test.is_nil(result)
            test.contains(err, "message store unavailable")
            test.eq(#events, 1)
            test.eq(events[1], consts.UPSTREAM_TYPES.FUNCTION_CALL)
            for _, row in ipairs(captured.stored) do
                test.eq(row.metadata.status, consts.FUNC_STATUS.PENDING)
            end
        end)

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
            test.eq((function_row or {}).metadata.status, consts.FUNC_STATUS.ERROR)
            test.contains(tostring((function_row or {}).metadata.result), "config store unavailable")
            test.eq(((function_row or {}).metadata.control_operations or {}).config.tools[1], "app:tool")
        end)

        it("applies the first call's effect before a later result write fails", function()
            local ctx, captured, calls, ids, validated = call_fixture()
            local applied = nil :: any
            local continued = 0
            ctx.agent_ctx.set_active_tools = function() end
            ctx.writer.update_meta = function(_self, updates)
                applied = updates.config
                return true
            end
            local original_update = ctx.writer.update_message_meta
            ctx.writer.update_message_meta = function(self, id, meta)
                if id == ids["private"] and meta.status == consts.FUNC_STATUS.SUCCESS then
                    return nil, "second result write failed"
                end
                return original_update(self, id, meta)
            end
            local bus = command_bus.new(ctx)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, message_handlers.process_tools)
            bus:mount_op_handler(consts.OP_TYPE.CONTROL_CONFIG, control_handlers.control_config)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                continued = continued + 1
                return { completed = true }
            end)
            local caller = {
                set_strategy = function() end,
                execute = function(_self, _context, tools)
                    return {
                        ["function"] = { result = { value = "first",
                            _control = { config = { tools = { "app:tool" } } } },
                            tool_call = tools["function"] },
                        ["private"] = { result = "second", tool_call = tools["private"] }
                    }
                end
            }
            bus:queue_op({ type = consts.OP_TYPE.PROCESS_TOOLS,
                tool_calls = { calls[1], calls[2] }, call_message_ids = ids, caller = caller,
                validated_tools = validated, message_id = "user", agent = { id = "agent:documents" } })

            local ok, err = bus:run()

            test.is_nil(ok)
            test.contains(tostring(err), "second result write failed")
            test.eq((captured.stored[1] :: any).metadata.status, consts.FUNC_STATUS.SUCCESS)
            test.eq(((captured.stored[1] :: any).metadata.result or {}).value, "first")
            test.eq((applied or {}).active_tools[1], "app:tool")
            test.eq((captured.stored[2] :: any).metadata.status, consts.FUNC_STATUS.ERROR)
            test.eq(continued, 0)
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
