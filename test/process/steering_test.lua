local test = require("test")
local consts = require("consts")
local policy = require("input_policy")
local handlers = require("message_handlers")
local prompt_builder = require("prompt_builder")

local function fixture(rows)
    rows = rows or {}
    local events, applied = {}, {}
    local ctx: any
    local agent = { id = "agent:test", model = "model:test", agent_options = {
        session_input = { while_running = "steer", can_manage = true },
    } }
    agent.step = function(_, builder)
        events[#events + 1] = "model"
        ctx.prompt = builder:get_messages()
        return { result = "answer", tool_calls = {} }
    end
    local query = { from_checkpoint = function(self) return self end, all = function() return rows end }
    ctx = {
        session_id = "s1", user_id = "u1", status = "idle", current_agent = agent,
        config = { agent_id = agent.id, model = agent.model }, lifecycle_state = {},
        reader = {
            list_all_messages = function() if ctx.read_error then return nil, ctx.read_error end; return rows end,
            list_pending_inputs = function()
                if ctx.read_error then return nil, ctx.read_error end
                local pending = {}
                for _, row in ipairs(rows) do if row.metadata.input and row.metadata.input.state == "pending" then pending[#pending + 1] = row end end
                return pending
            end,
            find_by_client_message_id = function(_, id)
                for _, row in ipairs(rows) do if row.metadata.client_message_id == id then return row end end
            end,
            messages = function() return query end,
            contexts = function() return { all = function() return {} end } end,
            state = function() return { meta = {}, config = ctx.config } end,
            get_context = function() return nil end,
            get_full_context = function() return {} end,
            reset = function() return true end,
        },
        agent_ctx = { load_agent = function() if ctx.load_error then return nil, ctx.load_error end; return agent end },
        writer = {
            add_message = function(_, kind, text, meta)
                if ctx.write_error then return nil, ctx.write_error end
                local id = "server-" .. tostring(#rows + 1)
                rows[#rows + 1] = { message_id = id, type = kind, data = text, metadata = meta or {} }
                events[#events + 1] = "write"
                return id
            end,
            update_meta = function() return true end,
            apply_inputs = function(_, updates)
                if ctx.apply_error then return nil, ctx.apply_error end
                for _, update in ipairs(updates) do
                    applied[#applied + 1] = update.message_id
                    for _, row in ipairs(rows) do
                        if row.message_id == update.message_id then
                            for k, v in pairs(update.metadata) do row.metadata[k] = v end
                        end
                    end
                end
                return true
            end,
            update_message_meta = function(_, id, meta)
                for _, row in ipairs(rows) do
                    if row.message_id == id then for k, v in pairs(meta) do row.metadata[k] = v end; return true end
                end
                return nil, "Missing row"
            end,
        },
        upstream = {
            message_received = function() events[#events + 1] = "received" end,
            command_success = function(_, _, data) ctx.receipt = data; events[#events + 1] = "ack" end,
            command_error = function(_, _, code) ctx.rejection = code end,
            send_message_update = function(_, _, kind) events[#events + 1] = kind end,
            update_session = function() end, session_error = function() end, message_error = function() end,
            response_beginning = function() end, invalidate_message = function() end,
        },
    }
    return ctx, rows, events, applied
end

local function send(ctx, text, id)
    return handlers.handle_message(ctx, { data = { text = text, message_id = id }, request_id = "request-" .. id })
end

local function pending(id, sequence)
    return { message_id = id, type = consts.MSG_TYPE.USER, data = id, metadata = {
        accepted_sequence = sequence, file_uuids = { "file-" .. id }, input = { state = "pending", steering = true },
    } }
end

local function define_tests()
    describe("steering lifecycle", function()
        it("persists and reserves one turn before the receipt", function()
            local ctx, rows, events = fixture()
            local first = send(ctx, "start", "client-1")
            test.eq(events[1], "write")
            test.eq(events[2], "received")
            test.eq(events[3], "ack")
            test.eq(#first.next_ops, 1)
            local second = send(ctx, "steer", "client-2")
            test.eq(#second.next_ops, 0)
            test.eq(rows[2].metadata.input.state, "pending")
            test.eq(ctx.turn_state.message_id, first.message_id)
            test.eq(ctx.receipt.client_message_id, "client-2")
        end)

        it("deduplicates durable IDs while blocked and rejects changed content", function()
            local ctx, rows = fixture()
            local first = send(ctx, "start", "client")
            ctx.config.input_policy = { while_running = "block" }
            ctx.stop_requested = true
            local retry = send(ctx, "start", "client")
            test.eq(retry.message_id, first.message_id)
            test.eq(#rows, 1)
            send(ctx, "changed", "client")
            test.eq(ctx.rejection, "DUPLICATE_MESSAGE_ID")
            test.eq(#rows, 1)
        end)

        it("does not acknowledge or retain a new turn after a failed write", function()
            local ctx, rows, events = fixture()
            ctx.write_error = "disk failure"
            local result, err = send(ctx, "start", "client")
            test.is_nil(result)
            test.eq(err, "disk failure")
            test.is_nil(ctx.turn_state)
            test.eq(#rows, 0)
            test.eq(#events, 0)
        end)

        it("orders steering by acceptance after completed tool results", function()
            local ctx, rows, _, applied = fixture({ pending("z-first", 1), pending("a-second", 2),
                { message_id = "tool", type = consts.MSG_TYPE.FUNCTION, data = "{}", metadata = {
                    function_name = "lookup", call_id = "call", status = "success", result = "done",
                } },
            })
            local count, err = handlers.apply_pending_inputs(ctx, "turn")
            test.is_nil(err)
            test.eq(count, 2)
            test.eq(applied[1], "z-first")
            test.eq(applied[2], "a-second")
            test.eq(rows[1].metadata.input.after_message_id, "tool")
            local builder = prompt_builder.build(rows, {}, {}, { cache_markers = false })
            local messages = builder:get_messages()
            test.eq(messages[1].role, "function_call")
            test.eq(messages[2].role, "function_result")
            test.eq(messages[3].role, "user")
            test.eq(messages[5].role, "user")
            test.eq(messages[3].content[1].text, "z-first")
            test.contains(messages[4].content[1].text, "file-z-first")
        end)

        it("does not consume or announce a failed pending batch", function()
            local ctx, rows, events = fixture({ pending("p1", 1), pending("p2", 2) })
            ctx.apply_error = "transaction failure"
            local count, err = handlers.apply_pending_inputs(ctx, "turn")
            test.is_nil(count)
            test.eq(err, "transaction failure")
            test.eq(rows[1].metadata.input.state, "pending")
            test.eq(rows[2].metadata.input.state, "pending")
            test.eq(#events, 0)
        end)

        it("keeps the active turn at the final-response boundary when input remains", function()
            local ctx = fixture({ pending("p", 1) })
            ctx.turn_state = { active = true, message_id = "original", request_id = "r" }
            ctx.status = "running"
            local result = handlers.finish_turn(ctx)
            test.eq(#result.next_ops, 1)
            test.eq(result.next_ops[1].message_id, "original")
            test.is_false(result.next_ops[1].from_user)
            test.is_true(ctx.turn_state.active)
        end)

        it("retains unused input after Stop and applies it before the next user", function()
            local ctx, rows, events = fixture({ pending("retained", 1) })
            ctx.turn_state = { active = true, message_id = "old", input_policy = { while_running = "block" } }
            ctx.stop_requested, ctx.status = true, "running"
            local result = handlers.finish_turn(ctx)
            test.eq(#result.next_ops, 0)
            test.is_nil(ctx.turn_state.input_policy)
            test.eq(rows[1].metadata.input.state, "pending")
            local next_turn = send(ctx, "new user", "next")
            test.is_false(ctx.stop_requested)
            local stepped, err = handlers.agent_step(ctx, (next_turn :: any).next_ops[1])
            test.is_nil(err)
            test.not_nil(stepped)
            test.eq(rows[1].metadata.input.state, "applied")
            test.eq(ctx.prompt[1].content[1].text, "retained")
            test.eq(ctx.prompt[3].content[1].text, "new user")
        end)

        it("keeps pending input on agent load and prompt-build failures", function()
            local ctx, rows = fixture({ pending("p", 1) })
            ctx.load_error = "missing agent"
            local result, err = handlers.agent_step(ctx, { message_id = "turn", from_user = true })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(rows[1].metadata.input.state, "pending")
            ctx.load_error = nil
            local original = handlers._prompt_builder
            handlers._prompt_builder = { from_session = function() return nil, "prompt failure" end }
            result, err = handlers.agent_step(ctx, { message_id = "turn", from_user = true })
            handlers._prompt_builder = original
            test.is_nil(result)
            test.not_nil(err)
            test.eq(rows[1].metadata.input.state, "pending")
        end)

        it("applies management controls in original call order before tool success", function()
            local ctx, rows, events = fixture()
            ctx.status = "running"
            ctx.turn_state = { active = true, steps = 0, repeated_calls = 0, input_policy = nil :: any }
            local calls = {
                z = { valid = true, name = "set_session_input_policy", registry_id = "policy", args = { mode = "block" } },
                a = { valid = true, name = "set_session_input_policy", registry_id = "policy", args = { mode = "steer" } },
            }
            local order = {}
            ctx.request_input_policy = function(request, caller)
                order[#order + 1] = request.mode
                return policy.apply_request(ctx, request, caller)
            end
            local original = handlers._tool_caller
            handlers._tool_caller = { new = function() return {
                set_strategy = function() end,
                validate = function() return calls end,
                execute = function()
                    return {
                        a = { tool_call = calls.a, result = { _control = { config = { input_policy = { mode = "steer" } } } } },
                        z = { tool_call = calls.z, result = { _control = { config = { input_policy = { mode = "block" } } } } },
                    }
                end,
            } end }
            local result, err = handlers.process_tools(ctx :: any, { tool_calls = { { id = "z" }, { id = "a" } },
                agent = ctx.current_agent, message_id = "turn" })
            handlers._tool_caller = original
            test.is_nil(err)
            test.eq(order[1], "block")
            test.eq(order[2], "steer")
            test.eq(rows[1].metadata.call_id, "z")
            test.eq(rows[2].metadata.call_id, "a")
            test.eq(rows[1].metadata.status, "success")
            test.eq(ctx.turn_state.input_policy.while_running, "steer")
            test.eq(#result.next_ops, 1)
            test.eq(result.next_ops[1].type, consts.OP_TYPE.AGENT_CONTINUE)
        end)

        it("reports denied management as a tool error without changing the policy", function()
            local ctx, rows = fixture()
            ctx.status = "running"
            ctx.turn_state = { active = true, steps = 0, repeated_calls = 0, input_policy = nil :: any }
            ctx.config.input_policy = { allow_agent_changes = false }
            local call = { valid = true, name = "set_session_input_policy", registry_id = "policy", args = {} }
            local original = handlers._tool_caller
            handlers._tool_caller = { new = function() return {
                set_strategy = function() end,
                validate = function() return { x = call } end,
                execute = function() return { x = { tool_call = call, result = {
                    _control = { config = { input_policy = { mode = "block" } } },
                } } } end,
            } end }
            local result, err = handlers.process_tools(ctx :: any, { tool_calls = { { id = "x" } },
                agent = ctx.current_agent, message_id = "turn" })
            handlers._tool_caller = original
            test.is_nil(err)
            test.not_nil(result)
            test.eq(rows[1].metadata.status, "error")
            test.is_nil(ctx.turn_state.input_policy)
        end)

        it("records a completed tool batch after Stop but queues no continuation", function()
            local ctx, rows = fixture({ pending("retained", 1) })
            ctx.status = "running"
            ctx.turn_state = { active = true, steps = 0, repeated_calls = 0, input_policy = nil :: any }
            local call = { valid = true, name = "lookup", registry_id = "lookup", args = {} }
            local original = handlers._tool_caller
            handlers._tool_caller = { new = function() return {
                set_strategy = function() end,
                validate = function() return { x = call } end,
                execute = function()
                    ctx.stop_requested = true
                    return { x = { tool_call = call, result = "done" } }
                end,
            } end }
            local result, err = handlers.process_tools(ctx :: any, { tool_calls = { { id = "x" } },
                agent = ctx.current_agent, message_id = "turn" })
            handlers._tool_caller = original
            test.is_nil(err)
            test.eq(#result.next_ops, 0)
            test.eq(rows[1].metadata.input.state, "pending")
            test.eq(rows[2].metadata.status, "success")
        end)

        it("records cancelled calls when Stop arrives during a provider response", function()
            local ctx, rows = fixture()
            ctx.current_agent.step = function()
                ctx.stop_requested = true
                return { result = "", tool_calls = { { id = "cancelled", name = "lookup", arguments = "{}" } } }
            end
            local result, err = handlers.agent_step(ctx, { message_id = "turn", from_user = true })
            test.is_nil(err)
            test.eq(#result.next_ops, 0)
            local cancelled = rows[#rows]
            test.eq(cancelled.type, consts.MSG_TYPE.PRIVATE_FUNCTION)
            test.eq(cancelled.metadata.call_id, "cancelled")
            test.eq(cancelled.metadata.status, "error")
            test.contains(cancelled.metadata.result, "Cancelled before execution")
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
