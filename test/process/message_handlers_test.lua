local test = require("test")
local consts = require("consts")
local message_handlers = require("message_handlers")
local default_lifecycle_error_report = message_handlers._report_lifecycle_errors
local session_handlers = require("session_handlers")
local session = require("session")
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
        outcome: string?,
        status: string?,
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
        message_updates = {} :: { any },
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
            send_message_update = function(_self, id, event_type, payload)
                table.insert(captured.message_updates, { id = id, type = event_type, payload = payload })
            end,
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

    describe("reported cancelled tool event regression", function()
        it("settles public cancellation without publishing private or delegation intents", function()
            local ctx, captured = mock_ctx(fake_agent(nil))
            local calls, ids, types = {}, {}, {}
            for index, kind in ipairs({consts.MSG_TYPE.FUNCTION,
                consts.MSG_TYPE.PRIVATE_FUNCTION, consts.MSG_TYPE.DELEGATION}) do
                local id = "cancel-" .. tostring(index)
                calls[#calls + 1] = { id = id, name = "tool", arguments = "{}" }
                ids[id] = ctx.writer:add_message(kind, "{}", { call_id = id, status = consts.FUNC_STATUS.PENDING })
                types[id] = kind
            end
            local terminal = {}
            ctx.upstream.send_message_update = function(_, id, kind, payload)
                if kind == consts.UPSTREAM_TYPES.FUNCTION_ERROR then terminal[#terminal + 1] = payload end
            end
            local settled, err = message_handlers.process_tools(ctx, {
                cancel_only = true, tool_calls = calls, call_message_ids = ids, call_message_types = types,
            })
            test.is_nil(err)
            test.is_true(settled.completed)
            for _, row in ipairs(captured.stored) do test.eq(row.metadata.status, consts.FUNC_STATUS.CANCELLED) end
            test.eq(#terminal, 1)
            test.eq(terminal[1].call_id, "cancel-1")
            test.eq(terminal[1].message_id, ids["cancel-1"])
            test.eq(terminal[1].outcome, consts.FUNC_STATUS.CANCELLED, "live event uses the history field")
            test.is_nil(terminal[1].status, "the live event carries only outcome")
        end)
        it("emits no terminal cancellation event when durable settlement fails", function()
            local ctx = mock_ctx(fake_agent(nil))
            local terminal = 0
            ctx.writer.update_message_meta = function() return nil, "storage unavailable" end
            ctx.upstream.send_message_update = function() terminal = terminal + 1 end
            local _, err = message_handlers.process_tools(ctx, {
                cancel_only = true, tool_calls = {{id = "call", name = "tool", arguments = "{}"}},
                call_message_ids = {call = "message"},
            })
            test.eq(err, "storage unavailable")
            test.eq(terminal, 0, "events must follow a committed terminal outcome")
        end)
        it("settles a tool cancelled after provider generation in the live event stream", function()
            local agent = fake_agent(nil)
            local stopped = false
            local original_step = agent.step
            agent.step = function(...)
                local result = original_step(...)
                stopped = true
                return result
            end
            local ctx, captured = mock_ctx(agent)
            local terminal = {}
            ctx.upstream.send_message_update = function(_, id, kind, payload)
                if kind == consts.UPSTREAM_TYPES.FUNCTION_ERROR then
                    terminal[#terminal + 1] = { id = id, payload = payload }
                end
            end
            ctx.coordinator = { stop_requested = function() return stopped end }
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.is_true(result.completed)
            local calls = stored_of_type(captured, consts.MSG_TYPE.FUNCTION)
            test.eq(#calls, 1)
            test.eq(calls[1].metadata.status, consts.FUNC_STATUS.CANCELLED)
            test.eq(#terminal, 1, "durably cancelled public tool needs a terminal live event")
        end)

        it("settles a persisted intent cancelled before tool dispatch in the live event stream", function()
            local ctx, captured = mock_ctx(fake_agent(nil))
            local id = ctx.writer:add_message(consts.MSG_TYPE.FUNCTION, "{}", {
                call_id = "call-1", function_name = "pack_document", status = consts.FUNC_STATUS.PENDING,
            })
            local terminal = {}
            ctx.upstream.send_message_update = function(_, message_id, kind, payload)
                if kind == consts.UPSTREAM_TYPES.FUNCTION_ERROR then
                    terminal[#terminal + 1] = { id = message_id, payload = payload }
                end
            end
            local result, err = message_handlers.process_tools(ctx, {
                cancel_only = true,
                tool_calls = {{ id = "call-1", name = "pack_document", arguments = "{}" }},
                call_message_ids = { ["call-1"] = id },
            })
            test.is_nil(err)
            test.is_true(result.completed)
            test.eq(captured.stored[1].metadata.status, consts.FUNC_STATUS.CANCELLED)
            test.eq(#terminal, 1, "cancellation before dispatch needs a terminal live event")
        end)
    end)
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
            test.is_nil(err)
            test.is_true(result.completed)
            test.contains(tostring(result.failed), "Duplicate tool call ID")
            test.eq(#result.next_ops, 0)
            test.eq(#captured.response_batches, 0)
            test.eq(#captured.assistant_ids, 0)
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.FUNCTION), 0)
            test.eq(#captured.message_errors, 1)
            test.eq(captured.message_errors[1].id, result.response_id)
            test.eq(captured.message_errors[1].code, consts.ERROR_CODES.AGENT_ERROR)
            test.contains(captured.message_errors[1].message, "Duplicate tool call ID")
            test.eq(#captured.session_errors, 0)
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
            local agent = fake_agent(1000)
            agent.tool_wrappers = {{ id = "strict-wrapper" }}
            local ctx, captured = mock_ctx(agent)
            local token_updates = {} :: {any}
            ctx.writer.update_meta = function(_self, updates)
                table.insert(token_updates, updates)
                return true
            end
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
            test.is_nil(err)
            test.is_true(result.completed)
            test.contains(tostring(result.failed), "strict wrapper rejected call")
            test.eq(#captured.message_errors, 1)
            test.eq(captured.message_errors[1].id, result.response_id)
            test.eq(captured.message_errors[1].code, consts.ERROR_CODES.AGENT_ERROR)
            test.contains(captured.message_errors[1].message, "strict wrapper rejected call")
            test.eq(#captured.response_batches, 0)
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.FUNCTION), 0)
            test.eq(#captured.assistant_ids, 0)
            test.eq(#token_updates, 1, "the step ran, so its usage is recorded")
            test.eq(token_updates[1].meta.tokens.total_tokens, 1084)
        end)
    end)

    describe("turn failures", function()
        it("returns token storage error text without persisting a failed response", function()
            local agent = fake_agent(nil)
            agent.step = function()
                return { tokens = { total_tokens = 1 } }, "provider failed"
            end
            local ctx, captured = mock_ctx(agent)
            ctx.writer.update_meta = function()
                return nil, { message = "token storage failed" }
            end

            local result, err = user_step(ctx)

            test.is_nil(result)
            test.eq(err, "token storage failed")
            test.eq(#captured.response_batches, 0)
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.FUNCTION), 0)
            test.eq(#captured.message_errors, 0)
        end)

        it("ends only the turn on a provider failure and returns to idle at the queue boundary", function()
            local agent = fake_agent(nil)
            agent.step = function() return nil, { message = "provider rate limited", code = 429 } end
            local ctx, captured = mock_ctx(agent)
            ctx.turn_state = { active = true, message_id = "msg-user", steps = 0, repeated_calls = 0,
                input_policy = { while_running = "block" } }
            ctx.status = consts.STATUS.RUNNING
            local persisted = nil :: any
            ctx.writer.update_meta = function(_self, updates)
                persisted = updates
                return true
            end

            local result, err = user_step(ctx)

            test.is_nil(err)
            test.is_true(result.completed)
            test.eq(result.failed, "provider rate limited")
            test.eq(#result.next_ops, 0)
            test.eq(#captured.message_errors, 1)
            test.eq(captured.message_errors[1].id, result.response_id)
            test.eq(captured.message_errors[1].code, consts.ERROR_CODES.AGENT_ERROR)
            test.eq(captured.message_errors[1].message, "provider rate limited")
            test.eq(#captured.session_errors, 0)
            local notices = stored_of_type(captured, consts.MSG_TYPE.SYSTEM)
            test.eq(#notices, 1)
            test.eq(notices[1].metadata.system_action, consts.SYSTEM_ACTIONS.TURN_FAILED)
            test.eq(notices[1].metadata.response_id, result.response_id)
            test.is_true((ctx.turn_state :: any).failed)
            test.is_nil((ctx.turn_state :: any).input_policy)

            local finished, finish_err = message_handlers.finish_turn(ctx)

            test.is_nil(finish_err)
            test.is_true(finished.completed)
            test.eq(ctx.status, consts.STATUS.IDLE)
            test.is_nil((ctx.turn_state :: any).failed)
            test.eq(persisted.status, consts.STATUS.IDLE)
            test.is_true(persisted.meta.interaction.can_send)
        end)

        it("reports a missing agent on the response without failing the session", function()
            local ctx, captured = mock_ctx(fake_agent(nil), { agent_id = "" })

            local result, err = user_step(ctx)

            test.is_nil(err)
            test.is_true(result.completed)
            test.contains(result.failed, "No agent configured")
            test.eq(#captured.message_errors, 1)
            test.eq(captured.message_errors[1].id, result.response_id)
        end)

        for _, partial in ipairs({ "", "Partial answer" }) do
            it("closes a stopped provider step exactly once: " .. partial, function()
                local agent = fake_agent(nil)
                agent.bindings = { lifecycle = { { binding = "app:lifecycle" } } }
                agent.step = function() return { stopped = true, result = partial, finish_reason = "cancelled" } end
                local phases = {}
                local original = message_handlers._lifecycle_runtime
                message_handlers._lifecycle_runtime = { apply = function(_, payload)
                    table.insert(phases, payload)
                    return { applied = 1, skipped = 0 }
                end }
                local ctx = mock_ctx(agent)
                local ok, result, err = pcall(user_step, ctx)
                message_handlers._lifecycle_runtime = original
                test.is_true(ok, tostring(result))
                test.is_nil(err)
                test.is_true(result.completed)
                test.eq(#result.next_ops, 0)
                test.eq(#phases, 3)
                test.eq(phases[2].phase, "before_step")
                test.eq(phases[3].phase, "after_step")
                test.eq(phases[3].outcome.state, "completed")
                test.eq(phases[3].outcome.reason, "stop_requested")
                test.eq(phases[3].refs.response_id, result.response_id)
            end)
        end

        it("does not repeat a stopped step's failing AFTER_STEP hook", function()
            local agent = fake_agent(nil)
            agent.bindings = { lifecycle = { { binding = "app:lifecycle" } } }
            agent.step = function() return { stopped = true, finish_reason = "cancelled" } end
            local after_calls = 0
            local original = message_handlers._lifecycle_runtime
            message_handlers._lifecycle_runtime = { apply = function(_, payload)
                if payload.phase == "after_step" then
                    after_calls = after_calls + 1
                    return nil, "stop cleanup failed"
                end
                return { applied = 1, skipped = 0 }
            end }
            local ctx, captured = mock_ctx(agent)
            local ok, result, err = pcall(user_step, ctx)
            message_handlers._lifecycle_runtime = original
            test.is_true(ok, tostring(result))
            test.is_nil(err)
            test.eq(after_calls, 1)
            test.eq(result.failed, "stop cleanup failed")
            test.eq(#captured.message_errors, 1)
        end)

        it("closes a failed step with a failed AFTER_STEP, but not a failed lifecycle phase", function()
            local agent = fake_agent(nil)
            agent.bindings = { lifecycle = { { binding = "app:lifecycle" } } }
            agent.step = function() return nil, "provider failed" end
            local phases: {{[string]: any}} = {}
            local failing_phase = nil :: string?
            local original_lifecycle = message_handlers._lifecycle_runtime
            message_handlers._lifecycle_runtime = { apply = function(_bindings, payload)
                table.insert(phases, payload)
                if payload.phase == failing_phase then return nil, "lifecycle unavailable" end
                return { applied = 1, skipped = 0 }, nil
            end }

            local ctx, captured = mock_ctx(agent)
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.is_true(result.completed)
            test.eq(#phases, 3)
            local after_step = test.not_nil(phases[3]) :: {phase: string, outcome: {state: string}, refs: {response_id: string}}
            test.eq(after_step.phase, "after_step")
            test.eq(after_step.outcome.state, "failed")
            test.eq(after_step.refs.response_id, result.response_id)
            test.eq(#captured.message_errors, 1)

            phases = {}
            failing_phase = "before_step"
            local lifecycle_ctx, lifecycle_captured = mock_ctx(agent)
            local lifecycle_result, lifecycle_err = user_step(lifecycle_ctx)
            message_handlers._lifecycle_runtime = original_lifecycle

            test.is_nil(lifecycle_err)
            test.is_true(lifecycle_result.completed)
            test.eq(lifecycle_result.failed, "lifecycle unavailable")
            test.eq(#phases, 2)
            local before_step = test.not_nil(phases[2]) :: {phase: string}
            test.eq(before_step.phase, "before_step")
            test.eq(#lifecycle_captured.message_errors, 1)
            test.eq(lifecycle_captured.message_errors[1].id, lifecycle_result.response_id)
        end)
    end)

    describe("persisted step lifecycle", function()
        local original_lifecycle

        -- Records each phase with a snapshot of the rows stored when it ran.
        local function record_phases(captured: any, failing: {[string]: string}?): {any}
            local phases = {}
            original_lifecycle = message_handlers._lifecycle_runtime
            message_handlers._lifecycle_runtime = { apply = function(_bindings, payload)
                local stored_ids = {}
                for _, row in ipairs(captured.stored) do stored_ids[row.id] = row end
                table.insert(phases, { payload = payload, stored = stored_ids })
                local failure = failing and failing[payload.phase]
                if failure then return { applied = 0, skipped = 0, errors = {} }, failure end
                return { applied = 1, skipped = 0, messages = {}, controls = {}, errors = {} }, nil
            end }
            return phases
        end

        after_each(function()
            message_handlers._lifecycle_runtime = original_lifecycle
        end)

        local function phase_named(phases: {any}, name: string): any
            for _, entry in ipairs(phases) do
                if entry.payload.phase == name then return entry end
            end
            return nil
        end

        local function lifecycle_agent(step_result: any, step_err: any?): any
            local agent = fake_agent(nil)
            agent.bindings = { lifecycle = { { binding = "app:lifecycle", phases = { "after_persist" } } } }
            agent.step = function() return step_result, step_err end
            return agent
        end

        it("dispatches after_persist with the committed assistant record id", function()
            local ctx, captured = mock_ctx(lifecycle_agent({ result = "Final answer",
                tokens = { prompt_tokens = 10, completion_tokens = 2, total_tokens = 12 } }))
            local phases = record_phases(captured)

            local result, err = user_step(ctx)

            test.is_nil(err)
            test.is_true(result.completed)
            local persisted = test.not_nil(phase_named(phases, "after_persist")) :: any
            local assistant = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1]
            test.eq(persisted.payload.refs.event_id, assistant.id)
            test.not_nil(persisted.stored[assistant.id], "record is stored before the hook runs")
            test.eq(persisted.stored[assistant.id].content, "Final answer")
            test.eq(persisted.payload.refs.message_id, "msg-user")
            test.eq(persisted.payload.refs.request_id, "req-1")
            test.eq(persisted.payload.refs.response_id, result.response_id)
            test.eq(persisted.payload.outcome.state, "completed")
            test.eq(phases[#phases].payload.phase, "after_persist")
            local after_step = test.not_nil(phase_named(phases, "after_step")) :: any
            test.is_nil(after_step.payload.refs.event_id, "after_step keeps its original refs")
        end)

        it("dispatches after_persist for a tool step before the tool round runs", function()
            local ctx, captured = mock_ctx(lifecycle_agent({ result = "", tool_calls = {
                { id = "call-1", name = "pack_document", arguments = "{}", registry_id = "app:pack_document" },
            } }))
            local phases = record_phases(captured)

            local result, err = user_step(ctx)

            test.is_nil(err)
            test.not_nil((find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS)))
            local persisted = test.not_nil(phase_named(phases, "after_persist")) :: any
            local assistant = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1]
            test.eq(persisted.payload.refs.event_id, assistant.id)
            test.eq(persisted.payload.outcome.state, "continues")
            local call = stored_of_type(captured, consts.MSG_TYPE.FUNCTION)[1]
            test.eq(persisted.stored[call.id].metadata.status, consts.FUNC_STATUS.PENDING,
                "the hook sees the stored intent, not a tool result")
        end)

        it("dispatches after_persist for a stored truncated response", function()
            local ctx, captured = mock_ctx(lifecycle_agent({ result = "partial reasoning", truncated = true,
                truncation_reason = "tool_calls" }))
            ctx.turn_state = {
                active = true,
                steps = 0,
                repeated_calls = 0,
                pending_inline_artifacts = {{ artifact_id = "pending-artifact" }},
            }
            local phases = record_phases(captured)

            local result, err = continue_step(ctx)

            test.is_nil(err)
            test.is_false(result.completed)
            local persisted = test.not_nil(phase_named(phases, "after_persist")) :: any
            local assistant = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1]
            test.eq(persisted.payload.refs.event_id, assistant.id)
            test.not_nil(persisted.stored[assistant.id])
            test.eq(persisted.payload.outcome.state, "continues")
            test.is_nil(assistant.metadata.presentation)
            test.eq(ctx.turn_state.pending_inline_artifacts[1].artifact_id, "pending-artifact")
        end)

        it("dispatches after_persist for retained text from a stopped response", function()
            local ctx, captured = mock_ctx(lifecycle_agent({result = "partial answer", stopped = true}))
            local phases = record_phases(captured)
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.is_true(result.completed)
            local assistant = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1]
            test.not_nil(assistant)
            local persisted = test.not_nil(phase_named(phases, "after_persist")) :: any
            test.eq(persisted.payload.refs.event_id, assistant.id)
            test.not_nil(persisted.stored[assistant.id])
            test.eq(persisted.payload.outcome.state, "completed")
            test.eq(persisted.payload.outcome.reason, "stop_requested")
        end)

        it("does not dispatch after_persist when nothing is stored", function()
            local failures = {
                { label = "provider failure", result = nil, err = "provider failed" },
                { label = "empty response", result = { result = "" } },
                { label = "stopped without text", result = { stopped = true, result = "" } },
                { label = "truncated without text", result = { result = "", truncated = true,
                    truncation_reason = "tool_calls" } },
            }
            for _, case in ipairs(failures) do
                local ctx, captured = mock_ctx(lifecycle_agent(case.result, case.err))
                local phases = record_phases(captured)
                user_step(ctx)
                message_handlers._lifecycle_runtime = original_lifecycle
                test.is_nil(phase_named(phases, "after_persist"), case.label)
            end

            local ctx, captured = mock_ctx(lifecycle_agent({ result = "Final answer" }))
            ctx.writer.add_response = function() return nil, nil, "disk full" end
            local phases = record_phases(captured)
            local result, err = user_step(ctx)
            test.is_nil(result)
            test.eq(err, "disk full")
            test.is_nil(phase_named(phases, "after_persist"), "failed persistence")
        end)

        it("keeps the stored record and fails through the fatal path on a strict after_persist error", function()
            local ctx, captured = mock_ctx(lifecycle_agent({ result = "Final answer" }))
            record_phases(captured, { after_persist = "index unavailable" })

            local result, err = user_step(ctx)

            test.is_nil(result)
            test.eq(err, "index unavailable")
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.ASSISTANT), 1)
            test.eq(captured.message_errors[1].message, "index unavailable")
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.SYSTEM), 0, "the turn is not settled as an agent failure")
        end)

        it("keeps retained stopped text when its strict after_persist hook fails", function()
            local ctx, captured = mock_ctx(lifecycle_agent({result = "partial answer", stopped = true}))
            record_phases(captured, {after_persist = "index unavailable"})
            local result, err = user_step(ctx)
            test.is_nil(result)
            test.eq(err, "index unavailable")
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.ASSISTANT), 1)
            test.eq(captured.message_errors[1].message, "index unavailable")
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.SYSTEM), 0)
        end)

        it("reports a recall failure to lifecycle handlers and in the stored record", function()
            local ctx, captured = mock_ctx(lifecycle_agent({ result = "Final answer",
                memory_recall_error = "Memory recall failed: vector store offline" }))
            local phases = record_phases(captured)

            local _, err = user_step(ctx)

            test.is_nil(err)
            local assistant = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1]
            test.eq(assistant.metadata.memory_recall_error, "Memory recall failed: vector store offline")
            test.eq(phase_named(phases, "after_step").payload.outcome.memory_recall_error,
                "Memory recall failed: vector store offline")
            test.eq(phase_named(phases, "after_persist").payload.outcome.memory_recall_error,
                "Memory recall failed: vector store offline")
        end)

        it("keeps a recall failure on truncated and failed steps", function()
            local ctx, captured = mock_ctx(lifecycle_agent({ result = "partial", truncated = true,
                truncation_reason = "tool_calls", memory_recall_error = "Memory recall failed: offline" }))
            record_phases(captured)
            user_step(ctx)
            message_handlers._lifecycle_runtime = original_lifecycle
            test.eq(stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1].metadata.memory_recall_error,
                "Memory recall failed: offline")

            local failed_ctx, failed_captured = mock_ctx(lifecycle_agent(
                { memory_recall_error = "Memory recall failed: offline" }, "provider failed"))
            local phases = record_phases(failed_captured)
            local result, err = user_step(failed_ctx)
            test.is_nil(err)
            test.eq(result.failed, "provider failed")
            test.eq(phase_named(phases, "after_step").payload.outcome.memory_recall_error,
                "Memory recall failed: offline")
            test.eq(stored_of_type(failed_captured, consts.MSG_TYPE.SYSTEM)[1].metadata.memory_recall_error,
                "Memory recall failed: offline")
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
    describe("behavior control settlement", function()
        it("finishes a queued cancellation without leaving a pending proposal", function()
            local agent = fake_agent()
            agent.bindings = { lifecycle = {} }
            message_handlers._lifecycle_runtime = { apply = function(_, payload)
                if payload.phase == "after_step" then
                    return { controls = {{ context = { session = { set = { must_not_apply = true } } } }} }
                end
                return {}
            end }
            local ctx, captured = mock_ctx(agent)
            local updates
            ctx.writer.update_meta = function(_, value) updates = value; return true end
            ctx.writer.set_context = function() error("cancelled proposals applied") end
            local step = user_step(ctx)
            local op = find_op(step.next_ops, consts.OP_TYPE.PROCESS_TOOLS)
            op.cancel_only = true
            local result, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.not_nil(result)
            test.eq(stored_of_type(captured, consts.MSG_TYPE.FUNCTION)[1].metadata.status, consts.FUNC_STATUS.CANCELLED)
            test.eq(stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1].metadata.behavior_control_state, "cancelled")
            test.is_false(updates.meta.behavior_controls_pending)
        end)

        it("treats a cancelled call consistently live and after recovery", function()
            local agent = fake_agent()
            agent.bindings = { lifecycle = {} }
            message_handlers._lifecycle_runtime = { apply = function(_, payload)
                if payload.phase == "after_step" then
                    return { controls = {{ context = { session = { set = { must_not_apply = true } } } }} }
                end
                return {}
            end }
            local ctx, captured = mock_ctx(agent)
            local writes = 0
            ctx.writer.set_context = function() writes = writes + 1; return true end
            local step, step_err = user_step(ctx)
            test.is_nil(step_err)
            local op = find_op(step.next_ops, consts.OP_TYPE.PROCESS_TOOLS)
            op.caller = { set_strategy = function() end, execute = function()
                return { ["call-1"] = { cancelled = true, tool_call = {
                    name = "pack_document", registry_id = "app:pack_document", meta = {},
                } } }
            end }
            local result, err = message_handlers.process_tools(ctx, op)
            message_handlers._lifecycle_runtime = nil
            test.is_nil(err)
            test.not_nil(result)
            test.eq(stored_of_type(captured, consts.MSG_TYPE.FUNCTION)[1].metadata.status, consts.FUNC_STATUS.CANCELLED)
            test.eq(writes, 0, "cancelled rounds cannot apply proposals live either")
        end)

        after_each(function() message_handlers._lifecycle_runtime = nil end)

        it("replays stored policies after settled outcomes without executing tools or taking another model step", function()
            local ctx = mock_ctx(fake_agent())
            local pending = true
            local round = { message_id = "round", metadata = {
                behavior_control_state = "pending", behavior_call_message_ids = { call = "tool-message" },
                behavior_controls = {{ context = { session = { set = { project = "persisted" } } } }},
            } }
            local status = consts.FUNC_STATUS.PENDING
            local writes, attempts = 0, 0
            ctx.reader.state = function() return { meta = { behavior_controls_pending = pending } } end
            ctx.reader.list_behavior_rounds = function()
                return round.metadata.behavior_control_state == "pending" and { round } or {}
            end
            ctx.reader.get_behavior_call = function() return { metadata = { status = status } } end
            ctx.writer.set_context = function(_, key, value)
                test.eq(key, "project")
                test.eq(value, "persisted")
                writes = writes + 1
                return true
            end
            ctx.writer.update_message_meta = function(_, _, metadata)
                attempts = attempts + 1
                if attempts == 1 then return nil, "completion write interrupted" end
                round.metadata.behavior_control_state = metadata.behavior_control_state
                return true
            end
            ctx.writer.update_meta = function() pending = false; return true end
            local recovered, err = message_handlers.recover_behavior_controls(ctx)
            test.is_nil(recovered)
            test.contains(tostring(err), "unsettled")
            test.eq(writes, 0)
            status = consts.FUNC_STATUS.ERROR
            recovered, err = message_handlers.recover_behavior_controls(ctx)
            test.is_nil(recovered)
            test.eq(err, "completion write interrupted")
            test.is_true(pending)
            recovered, err = message_handlers.recover_behavior_controls(ctx)
            test.is_nil(err)
            test.is_true(recovered)
            test.eq(writes, 2, "an interrupted completion marker permits idempotent replay")
            test.eq(round.metadata.behavior_control_state, "applied")
            test.is_false(pending)
            message_handlers.recover_behavior_controls(ctx)
            test.eq(writes, 2, "completed controls are not replayed again")
        end)

        it("does not replay proposals for an explicitly cancelled tool round", function()
            local ctx = mock_ctx(fake_agent())
            ctx.reader.state = function() return { meta = { behavior_controls_pending = true } } end
            ctx.reader.list_behavior_rounds = function()
                return {{ message_id = "round", metadata = {
                    behavior_call_message_ids = { call = "cancelled-call" },
                    behavior_controls = {{ context = { session = { set = { must_not_run = true } } } }},
                } }}
            end
            ctx.reader.get_behavior_call = function() return { metadata = { status = consts.FUNC_STATUS.CANCELLED } } end
            ctx.writer.set_context = function() error("cancelled policy applied") end
            local state
            ctx.writer.update_message_meta = function(_, _, metadata) state = metadata.behavior_control_state; return true end
            local recovered, err = message_handlers.recover_behavior_controls(ctx)
            test.is_nil(err)
            test.is_true(recovered)
            test.eq(state, "cancelled")
        end)

        it("refuses recovery when a persisted call has no recognized settlement status", function()
            for _, metadata in ipairs({ {}, { status = "running" }, { status = "unknown" } }) do
                local ctx = mock_ctx(fake_agent())
                ctx.reader.state = function() return { meta = { behavior_controls_pending = true } } end
                ctx.reader.list_behavior_rounds = function()
                    return {{ message_id = "round", metadata = {
                        behavior_call_message_ids = { call = "tool-message" },
                        behavior_controls = {{ context = { session = { set = { must_not_run = true } } } }},
                    } }}
                end
                ctx.reader.get_behavior_call = function() return { metadata = metadata } end
                ctx.writer.set_context = function() error("unsettled policy applied") end
                ctx.writer.update_message_meta = function() error("unsettled policy completed") end
                local recovered, err = message_handlers.recover_behavior_controls(ctx)
                test.is_nil(recovered)
                test.contains(tostring(err), "unsettled")
            end
        end)

        it("applies policy context only after every tool outcome is recorded", function()
            local agent = fake_agent()
            agent.bindings = { lifecycle = {} }
            message_handlers._lifecycle_runtime = {
                apply = function(_bindings, payload)
                    if payload.phase == "after_step" then
                        return { controls = {{ context = { session = { set = { policy_seen = true } } } }} }
                    end
                    return {}
                end,
            }
            local ctx, captured = mock_ctx(agent)
            local context_writes = 0
            ctx.writer.set_context = function(_self, key, value)
                local calls = stored_of_type(captured, consts.MSG_TYPE.FUNCTION)
                test.eq(#calls, 1)
                test.eq(calls[1].metadata.status, consts.FUNC_STATUS.ERROR)
                test.eq(key, "policy_seen")
                test.is_true(value)
                context_writes = context_writes + 1
                return true
            end
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.eq(context_writes, 0)
            local op = find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS)
            op.caller = {
                set_strategy = function() end,
                execute = function()
                    return { ["call-1"] = { error = "expected failure", tool_call = {
                        name = "pack_document", registry_id = "app:pack_document", meta = {},
                    } } }
                end,
            }
            local processed, process_err = message_handlers.process_tools(ctx, op)
            test.is_nil(process_err)
            test.not_nil(processed)
            test.eq(context_writes, 1)
        end)

        it("records a text answer before controls and does not schedule another model step", function()
            local agent = fake_agent()
            agent.bindings = { lifecycle = {} }
            agent.step = function() return { result = "done" } end
            message_handlers._lifecycle_runtime = {
                apply = function(_bindings, payload)
                    if payload.phase == "after_step" then
                        return { controls = {{ context = { session = { set = { policy_seen = true } } } }} }
                    end
                    return {}
                end,
            }
            local ctx, captured = mock_ctx(agent)
            local writes = 0
            ctx.writer.set_context = function()
                test.eq(#captured.assistant_ids, 1)
                writes = writes + 1
                return true
            end
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.eq(writes, 1)
            test.is_nil((find_op(result.next_ops, consts.OP_TYPE.AGENT_CONTINUE)))
            test.is_nil((find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS)))
        end)

        it("captures the post-control provider for compaction after a final text answer", function()
            local agent = fake_agent()
            agent.bindings = { lifecycle = {} }
            agent.agent_options.checkpoint = { enabled = false }
            agent.step = function() return { result = "done" } end
            local next_agent = fake_agent()
            next_agent.model = "model:next"
            next_agent.agent_options.checkpoint = { function_id = "app:next_checkpoint" }
            message_handlers._lifecycle_runtime = {
                apply = function(_bindings, payload)
                    if payload.phase == "after_step" then
                        return { controls = {{ config = { model = "model:next" }, memory = { compact = true } }} }
                    end
                    return {}
                end,
            }
            local ctx, captured = mock_ctx(agent)
            local active, requested = agent, false
            ctx.agent_ctx.get_current_agent = function() return active end
            ctx.agent_ctx.switch_to_model = function() active = next_agent; return true end
            ctx.writer.set_context = function(_, key)
                test.eq(#captured.assistant_ids, 1)
                test.eq(key, consts.CONTEXT_KEYS.CHECKPOINT_REQUESTED)
                requested = true
                return true
            end
            ctx.reader.get_context = function(_, key)
                return key == consts.CONTEXT_KEYS.CHECKPOINT_REQUESTED and requested or nil
            end
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.is_nil((find_op(result.next_ops, consts.OP_TYPE.AGENT_CONTINUE)))
            local check = find_op(result.next_ops, consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS)
            test.not_nil(check)
            test.eq(check.agent.model, "model:next")
            test.eq(check.agent_options.checkpoint.function_id, "app:next_checkpoint")
            local triggered, trigger_err = session_handlers.check_background_triggers(ctx, check)
            test.is_nil(trigger_err)
            test.is_true(triggered.checkpoint_triggered)
        end)
    end)

    describe("inline artifact presentation", function()
        it("does not accept presentation refs supplied in agent metadata", function()
            local agent = fake_agent(nil)
            agent.step = function()
                return {
                    result = "An ordinary answer.",
                    metadata = {
                        presentation = { artifact_refs = {{ artifact_id = "foreign-artifact" }} },
                        provider_marker = "retained",
                    },
                }
            end
            local ctx, captured = mock_ctx(agent)

            local result, err = user_step(ctx)

            test.is_nil(err)
            test.is_true(result.completed)
            local answer = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1]
            test.is_nil(answer.metadata.presentation)
            test.eq(answer.metadata.provider_marker, "retained")
            test.is_nil(captured.message_updates[#captured.message_updates].payload.presentation)
        end)

        it("persists and publishes server-owned refs when the model omits its inline tag", function()
            local agent = fake_agent(nil)
            local steps = 0
            local ctx, captured = mock_ctx(agent)
            local expected_tag = nil
            ctx.writer.create_artifact = function() return true end
            local function stored_rows()
                local rows = {}
                for _, row in ipairs(captured.stored) do
                    table.insert(rows, {
                        message_id = row.id,
                        type = row.type,
                        data = row.content,
                        metadata = row.metadata,
                    })
                end
                return rows, nil
            end
            ctx.reader.messages = function()
                return { from_checkpoint = function(self) return self end, all = stored_rows }
            end

            agent.step = function(_self, builder)
                steps = steps + 1
                if steps == 1 then
                    return { result = "", tool_calls = {{
                        id = "create-chart", name = "CreateArtifact", arguments = "{}",
                        registry_id = "kickside.agents.traits:create_artifact",
                    }} }
                end
                local found_instruction = false
                for _, message in ipairs(builder:get_messages()) do
                    if message.role == "developer" and message.content and message.content[1]
                        and message.content[1].text and message.content[1].text:find(expected_tag, 1, true) then
                        found_instruction = true
                    end
                end
                test.is_true(found_instruction,
                    "the next same-turn model request must include the generated artifact tag instruction")
                return { result = "Here are the observations." }
            end

            local original_new = tool_caller.new
            tool_caller.new = function()
                return {
                    set_tool_wrappers = function() end,
                    set_wrapper_context = function() end,
                    set_strategy = function() end,
                    validate = function(_self, calls)
                        return { [calls[1].id] = {
                            valid = true, name = calls[1].name, args = {}, registry_id = calls[1].registry_id,
                        } }, nil
                    end,
                    execute = function(_self, _context, tools)
                        local call = tools["create-chart"]
                        return { ["create-chart"] = { tool_call = call, result = {
                            success = true,
                            _control = { artifacts = {{
                                title = "Quarterly chart", content = "<svg></svg>", instructions = true,
                            }} },
                        } } }
                    end,
                }
            end

            local ok, failure = pcall(function()
                local first, first_err = user_step(ctx)
                test.is_nil(first_err)
                local tool_op = find_op(first.next_ops, consts.OP_TYPE.PROCESS_TOOLS)
                test.not_nil(tool_op)

                local settled, settle_err = message_handlers.process_tools(ctx, tool_op)
                test.is_nil(settle_err)
                expected_tag = '<artifact id="' .. ctx.turn_state.pending_inline_artifacts[1].artifact_id .. '"/>'

                -- A concurrently announced standalone artifact must not consume
                -- or duplicate the inline references owned by this tool round.
                local pending = ctx.turn_state.pending_inline_artifacts
                session.reference_artifact(ctx, { artifact_id = "live-standalone", request_id = "live-ref" })
                test.eq(ctx.turn_state.pending_inline_artifacts, pending)
                local standalone = stored_of_type(captured, consts.MSG_TYPE.ARTIFACT)
                test.eq(#standalone, 1)
                test.eq(standalone[1].metadata.artifact_id, "live-standalone")

                local continuation = find_op(settled.next_ops, consts.OP_TYPE.AGENT_CONTINUE)
                test.not_nil(continuation)
                local final, final_err = message_handlers.agent_continue(ctx, continuation)
                test.is_nil(final_err)
                test.is_true(final.completed)
                test.eq(captured.response_batches[2].content, "Here are the observations.")
                local answer = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[2]
                test.eq(#answer.metadata.presentation.artifact_refs, 1)
                test.eq(answer.metadata.presentation.artifact_refs[1].artifact_id,
                    expected_tag:match('id="([^"]+)"'))
                test.is_nil(ctx.turn_state.pending_inline_artifacts)
                local last_update = captured.message_updates[#captured.message_updates]
                test.eq(last_update.type, consts.UPSTREAM_TYPES.CONTENT)
                test.eq(last_update.payload.content, captured.response_batches[2].content)
                test.eq(last_update.payload.presentation, answer.metadata.presentation)
            end)
            tool_caller.new = original_new
            test.is_true(ok, tostring(failure))
        end)

        it("keeps authored placement in the model body and supplies the same ref for renderer deduplication", function()
            local agent = fake_agent(nil)
            local ctx, captured = mock_ctx(agent)
            local tag = '<artifact id="artifact-1"/>'
            ctx.turn_state = {
                active = true,
                steps = 0,
                repeated_calls = 0,
                pending_inline_artifacts = {{ artifact_id = "artifact-1" }},
            }
            agent.step = function()
                return {
                    result = "The chart is below.\n\n" .. tag,
                    metadata = { presentation = { artifact_refs = {{ artifact_id = "foreign-artifact" }} } },
                }
            end

            local result, err = continue_step(ctx)

            test.is_nil(err)
            test.is_true(result.completed)
            test.eq(captured.response_batches[1].content, "The chart is below.\n\n" .. tag)
            test.eq(captured.response_batches[1].calls[1], nil)
            local answer = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1]
            test.eq(answer.metadata.presentation.artifact_refs[1].artifact_id, "artifact-1")
            test.eq(captured.message_updates[#captured.message_updates].payload.presentation,
                answer.metadata.presentation)
            test.is_nil(ctx.turn_state.pending_inline_artifacts)
        end)

        it("does not put fallback markup inside an unterminated Markdown fence", function()
            local agent = fake_agent(nil)
            local ctx, captured = mock_ctx(agent)
            -- Markdown parsers render every later line as code until a closing
            -- fence. A text-appended tag would therefore be escaped and hidden.
            local body = "```html\n<artifact id=\"artifact-1\"/>\nmodel stopped here"
            ctx.turn_state = {
                active = true, steps = 0, repeated_calls = 0,
                pending_inline_artifacts = {{ artifact_id = "artifact-1" }},
            }
            agent.step = function() return { result = body, finish_reason = "stop" } end

            local result, err = continue_step(ctx)

            test.is_nil(err)
            test.is_true(result.completed)
            -- The presentation owner receives the reference separately and can
            -- mount it after Markdown, outside this still-open fence.
            test.eq(captured.response_batches[1].content, body)
            local answer = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1]
            test.eq(answer.metadata.presentation.artifact_refs[1].artifact_id, "artifact-1")
            test.is_nil(ctx.turn_state.pending_inline_artifacts)
        end)

        it("publishes each pending artifact once in creation order", function()
            local agent = fake_agent(nil)
            local ctx, captured = mock_ctx(agent)
            ctx.turn_state = {
                active = true,
                steps = 0,
                repeated_calls = 0,
                pending_inline_artifacts = {{ artifact_id = "artifact-1" }, { artifact_id = "artifact-2" }},
            }
            agent.step = function() return { result = "Both charts are ready." } end

            local result, err = continue_step(ctx)

            test.is_nil(err)
            test.is_true(result.completed)
            test.eq(captured.response_batches[1].content, "Both charts are ready.")
            local refs = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1].metadata.presentation.artifact_refs
            test.eq(refs[1].artifact_id, "artifact-1")
            test.eq(refs[2].artifact_id, "artifact-2")
            test.is_nil(ctx.turn_state.pending_inline_artifacts)
        end)

        it("delivers refs even when a terminal model reply has no body", function()
            local agent = fake_agent(nil)
            local ctx, captured = mock_ctx(agent)
            ctx.turn_state = {
                active = true, steps = 0, repeated_calls = 0,
                pending_inline_artifacts = {{ artifact_id = "artifact-1" }},
            }
            agent.step = function() return { result = "" } end

            local result, err = continue_step(ctx)

            test.is_nil(err)
            test.is_true(result.completed)
            local answer = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1]
            test.eq(answer.content, "")
            test.eq(answer.metadata.presentation.artifact_refs[1].artifact_id, "artifact-1")
            local update = captured.message_updates[#captured.message_updates]
            test.eq(update.type, consts.UPSTREAM_TYPES.CONTENT)
            test.eq(update.payload.content, "")
            test.eq(update.payload.presentation, answer.metadata.presentation)
        end)

        it("holds fallback delivery until the terminal response after a tool round", function()
            local agent = fake_agent(nil)
            local ctx, captured = mock_ctx(agent)
            local tag = '<artifact id="artifact-1"/>'
            ctx.turn_state = {
                active = true,
                steps = 0,
                repeated_calls = 0,
                pending_inline_artifacts = {{ artifact_id = "artifact-1" }},
            }
            local steps = 0
            agent.step = function()
                steps = steps + 1
                if steps == 1 then
                    return { result = "I created it here: " .. tag, tool_calls = {{
                        id = "follow-up", name = "Lookup", arguments = "{}", registry_id = "app:lookup",
                    }} }
                end
                return { result = "The follow-up is complete." }
            end

            local original_new = tool_caller.new
            tool_caller.new = function()
                return {
                    set_tool_wrappers = function() end,
                    set_wrapper_context = function() end,
                    set_strategy = function() end,
                    validate = function(_self, calls)
                        return { [calls[1].id] = {
                            valid = true, name = calls[1].name, args = {}, registry_id = calls[1].registry_id,
                        } }, nil
                    end,
                    execute = function(_self, _context, tools)
                        return { ["follow-up"] = { tool_call = tools["follow-up"], result = "done" } }
                    end,
                }
            end

            local ok, failure = pcall(function()
                local first, first_err = continue_step(ctx)
                test.is_nil(first_err)
                test.eq(captured.response_batches[1].content, "I created it here: " .. tag)
                test.not_nil(ctx.turn_state.pending_inline_artifacts)

                local tool_op = find_op(first.next_ops, consts.OP_TYPE.PROCESS_TOOLS)
                local settled, settle_err = message_handlers.process_tools(ctx, tool_op)
                test.is_nil(settle_err)
                local continuation = find_op(settled.next_ops, consts.OP_TYPE.AGENT_CONTINUE)
                local final, final_err = message_handlers.agent_continue(ctx, continuation)
                test.is_nil(final_err)
                test.is_true(final.completed)
                test.eq(captured.response_batches[2].content, "The follow-up is complete.")
                local answers = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)
                test.is_nil(answers[1].metadata.presentation)
                test.eq(answers[2].metadata.presentation.artifact_refs[1].artifact_id, "artifact-1")
            end)
            tool_caller.new = original_new
            test.is_true(ok, tostring(failure))
        end)

        it("does not carry an interrupted turn's artifact into a new user turn", function()
            local agent = fake_agent(nil)
            local ctx, captured = mock_ctx(agent)
            ctx.turn_state = {
                active = true,
                steps = 1,
                repeated_calls = 0,
                pending_inline_artifacts = {{ artifact_id = "old-artifact" }},
            }
            agent.step = function() return { result = "A new answer." } end

            ctx.stop_requested = true
            local finished, finish_err = message_handlers.finish_turn(ctx)
            test.is_nil(finish_err)
            test.is_true(finished.completed)
            ctx.stop_requested = false

            local result, err = message_handlers.agent_step(ctx, {
                message_id = "new-user-message", request_id = "new-request", from_user = true,
            })

            test.is_nil(err)
            test.is_true(result.completed)
            test.eq(captured.response_batches[1].content, "A new answer.")
            test.is_nil(ctx.turn_state.pending_inline_artifacts)
        end)

        it("holds presentation refs across a truncated response", function()
            local agent = fake_agent(nil)
            local ctx, captured = mock_ctx(agent)
            local tag = '<artifact id="artifact-1"/>'
            ctx.turn_state = {
                active = true,
                steps = 0,
                repeated_calls = 0,
                pending_inline_artifacts = {{ artifact_id = "artifact-1" }},
            }
            local steps = 0
            agent.step = function()
                steps = steps + 1
                if steps == 1 then return { result = "Partial: " .. tag, truncated = true } end
                return { result = "Completed after retry." }
            end

            local partial, partial_err = continue_step(ctx)
            test.is_nil(partial_err)
            test.not_nil(ctx.turn_state.pending_inline_artifacts)
            test.eq(stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1].content, "Partial: " .. tag)

            local retry = find_op(partial.next_ops, consts.OP_TYPE.AGENT_STEP)
            local final, final_err = message_handlers.agent_step(ctx, retry)
            test.is_nil(final_err)
            test.is_true(final.completed)
            test.eq(captured.response_batches[1].content, "Completed after retry.")
            local answers = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)
            test.is_nil(answers[1].metadata.presentation)
            test.eq(answers[2].metadata.presentation.artifact_refs[1].artifact_id, "artifact-1")
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
            local checkpoints: {{trigger_tokens: number, checkpoint_id: string, message_id: string}} = {}
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
        it("keeps the existing default repeat limit instead of stopping after three failures", function()
            local ctx = mock_ctx(fake_agent(nil))
            user_step(ctx)
            for index = 1, consts.DEFAULTS.MAX_REPEATED_TOOL_CALLS do
                message_handlers.note_tool_round(ctx, { ["call-" .. index] = {
                    error = "temporarily unavailable", tool_call = { name = "lookup", args = {} },
                } })
                if index < consts.DEFAULTS.MAX_REPEATED_TOOL_CALLS then
                    test.is_nil(continue_step(ctx).stopped)
                end
            end
            test.eq(continue_step(ctx).stopped, "repeated_tool_calls")
            test.eq(consts.DEFAULTS.MAX_REPEATED_TOOL_CALLS, 50)
        end)

        it("retains bounded-size failure fingerprints instead of large argument payloads", function()
            local ctx = mock_ctx(fake_agent(nil))
            user_step(ctx)
            local payload = string.rep("large argument ", 1000)
            for index = 1, 4 do
                message_handlers.note_tool_round(ctx, { failed = {
                    error = "failed", tool_call = { name = "lookup", args = { payload = payload, item = index } },
                } })
            end
            local actions = 0
            for fingerprint in pairs(ctx.turn_state.failed_actions) do
                actions = actions + 1
                test.eq(#fingerprint, 64)
            end
            test.eq(actions, 4)
        end)

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
            test.eq(#captured.message_updates, 2)
            for index, update in ipairs(captured.message_updates) do
                test.eq(update.type, consts.UPSTREAM_TYPES.FUNCTION_ERROR)
                test.is_nil(update.payload.status)
                test.eq(update.payload.outcome, consts.FUNC_STATUS.CANCELLED)
                test.eq(update.payload.message_id, calls[index].id)
                test.eq(update.payload.call_id, calls[index].metadata.call_id)
                test.eq(update.id, calls[index].metadata.call_id)
            end
        end)

        it("settles queued cancelled calls durably before public upstream events", function()
            local ctx, captured = mock_ctx(fake_agent(nil))
            local result = assert(user_step(ctx))
            local op = assert((find_op(result.next_ops, consts.OP_TYPE.PROCESS_TOOLS)))
            op.cancel_only = true
            ctx.upstream.send_message_update = function(_self, id, event_type, payload)
                local row = stored_of_type(captured, consts.MSG_TYPE.FUNCTION)[1]
                test.eq(row.metadata.status, consts.FUNC_STATUS.CANCELLED)
                test.eq(payload.message_id, row.id)
                test.is_nil(payload.status)
                test.eq(payload.outcome, consts.FUNC_STATUS.CANCELLED)
                table.insert(captured.message_updates, { id = id, type = event_type, payload = payload })
            end
            local settled, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.is_true(settled.completed)
            test.eq(#captured.message_updates, 1)
            test.eq(captured.message_updates[1].type, consts.UPSTREAM_TYPES.FUNCTION_ERROR)
        end)

        it("keeps classified and validated private cancellations off the public upstream", function()
            local ctx, captured = mock_ctx(fake_agent(nil))
            local stored = {}
            ctx.writer.update_message_meta = function(_self, id, metadata)
                stored[id] = metadata
                return true
            end
            local calls = {
                { id = "public", name = "public" },
                { id = "private", name = "private", type = consts.MSG_TYPE.PRIVATE_FUNCTION },
                { id = "delegation", name = "delegation", type = consts.MSG_TYPE.DELEGATION },
                { id = "validated-private", name = "validated-private" },
            }
            local ids = {}
            for _, call in ipairs(calls) do ids[call.id] = "stored-" .. call.id end
            local result, err = message_handlers.process_tools(ctx, {
                cancel_only = true, tool_calls = calls, call_message_ids = ids,
                validated_tools = { ["validated-private"] = { meta = { private = true } } },
            })
            test.is_nil(err)
            test.is_true(result.completed)
            for _, call in ipairs(calls) do test.eq(stored[ids[call.id]].status, consts.FUNC_STATUS.CANCELLED) end
            test.eq(#captured.message_updates, 1)
            test.eq(captured.message_updates[1].id, "public")
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

    describe("agent lifecycle transitions", function()
        after_each(function()
            message_handlers._lifecycle_runtime = nil
            message_handlers._report_lifecycle_errors = nil
        end)

        local function lifecycle_agent(id: string, binding: string): any
            local agent = fake_agent(nil)
            agent.id = id
            agent.bindings = { lifecycle = { { binding = binding } } }
            return agent
        end

        local function lifecycle_context(first: any): (any, {any}, any)
            local ctx = mock_ctx(first)
            local active = first
            local transitions = {}
            local rejected_phase = nil
            local non_strict_rejected_phase = nil

            ctx.agent_ctx.load_agent = function() return active, nil end
            ctx.agent_ctx.get_current_agent = function() return active end
            message_handlers._lifecycle_runtime = {
                apply = function(bindings, payload)
                    if payload.phase == "activate" or payload.phase == "deactivate" then
                        transitions[#transitions + 1] = {
                            phase = payload.phase,
                            agent_id = payload.agent.id,
                            binding = bindings.lifecycle[1].binding,
                            reason = payload.reason,
                            refs = payload.refs,
                        }
                    end
                    if payload.phase == rejected_phase then
                        return nil, "strict lifecycle failure"
                    end
                    if payload.phase == non_strict_rejected_phase then
                        return { applied = 0, messages = {}, errors = {
                            { error = "non-strict lifecycle failure", strict = false }
                        } }, nil
                    end
                    return { applied = 1, messages = {} }, nil
                end
            }

            return ctx, transitions, {
                set_agent = function(agent) active = agent end,
                reject = function(phase) rejected_phase = phase end,
                reject_non_strict = function(phase) non_strict_rejected_phase = phase end,
            }
        end

        it("refreshes an unchanged agent and deactivates once when the session finishes", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local ctx, transitions = lifecycle_context(first)
            local finish: any = (message_handlers :: any).deactivate_current_agent

            test.is_nil(select(2, user_step(ctx)))
            test.is_nil(select(2, user_step(ctx)))
            test.eq(#transitions, 1)
            test.eq(transitions[1].phase, "activate")

            local _, finish_err = finish(ctx, "session_finished")
            test.is_nil(finish_err)
            test.eq(#transitions, 2)
            test.eq(transitions[2].phase, "deactivate")
            test.eq(transitions[2].reason, "session_finished")
            finish(ctx, "session_finished")
            test.eq(#transitions, 2)
        end)

        it("deactivates the old agent before activating a switched agent", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local second = lifecycle_agent("agent:two", "binding:two")
            local ctx, transitions, controls = lifecycle_context(first)

            test.is_nil(select(2, user_step(ctx)))
            controls.set_agent(second)
            ctx.config.agent_id = second.id
            test.is_nil(select(2, user_step(ctx)))

            test.eq(#transitions, 3)
            test.eq(transitions[1].binding, "binding:one")
            test.eq(transitions[2].phase, "deactivate")
            test.eq(transitions[2].binding, "binding:one")
            test.eq(transitions[2].reason, "agent_switch")
            test.eq(transitions[3].phase, "activate")
            test.eq(transitions[3].binding, "binding:two")
        end)

        it("passes only the completed outgoing history span when a later real turn switches agents", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local second = lifecycle_agent("agent:two", "binding:two")
            local ctx, transitions, controls = lifecycle_context(first)
            local last_limit = nil
            local default_messages = ctx.reader.messages

            test.is_nil(select(2, user_step(ctx)))
            ctx.reader.messages = function()
                return {
                    all = function() return {}, nil end,
                    last = function(_, limit)
                        last_limit = limit
                        return {
                            all = function()
                                -- This models a long conversation without an all-history read.
                                return { { message_id = "outgoing-final" } }, nil
                            end,
                        }
                    end,
                }
            end

            ctx.turn_state.span_anchor_known = true
            ctx.turn_state.span_from_id = "outgoing-predecessor"
            local finished, finish_err = message_handlers.finish_turn(ctx)
            test.is_nil(finish_err)
            test.is_true(finished.completed)
            test.eq(last_limit, 1, "completed-span lookup must remain bounded")
            ctx.reader.messages = default_messages

            controls.set_agent(second)
            ctx.config.agent_id = second.id
            test.is_nil(select(2, user_step(ctx)))

            test.eq(transitions[2].phase, "deactivate")
            test.eq(transitions[2].refs.deactivation_range.from_id, "outgoing-predecessor")
            test.eq(transitions[2].refs.deactivation_range.to_id, "outgoing-final")
            test.eq(transitions[3].phase, "activate")
            test.is_nil(transitions[3].refs.deactivation_range,
                "the successor must not inherit the outgoing range")
        end)

        it("uses an open start only for a first completed turn", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local second = lifecycle_agent("agent:two", "binding:two")
            local ctx, transitions, controls = lifecycle_context(first)
            local default_messages = ctx.reader.messages

            test.is_nil(select(2, user_step(ctx)))
            ctx.reader.messages = function()
                return {
                    all = function() return {}, nil end,
                    last = function()
                        return { all = function() return { { message_id = "first-final" } }, nil end }
                    end,
                }
            end

            ctx.turn_state.span_anchor_known = true
            ctx.turn_state.span_from_id = nil
            ctx.turn_state.span_open_start = true
            test.is_nil(select(2, message_handlers.finish_turn(ctx)))
            ctx.reader.messages = default_messages
            controls.set_agent(second)
            ctx.config.agent_id = second.id
            test.is_nil(select(2, user_step(ctx)))

            local range = transitions[2].refs.deactivation_range
            test.eq(range.to_id, "first-final")
            test.is_nil(range.from_id, "first turn has no exclusive predecessor")
        end)

        for _, lookup in ipairs({ "malformed", "unavailable" }) do
            it("does not reuse an earlier completed end when the current lookup is " .. lookup, function()
                local first = lifecycle_agent("agent:one", "binding:one")
                local second = lifecycle_agent("agent:two", "binding:two")
                local ctx, transitions, controls = lifecycle_context(first)
                test.is_nil(select(2, user_step(ctx)))
                local default_messages = ctx.reader.messages
                ctx.lifecycle_state.completed_turn_span = {
                    agent_id = ctx.lifecycle_state.active_agent_id, model = ctx.lifecycle_state.active_model,
                    revision = ctx.lifecycle_state.active_revision,
                    from_id = "original-predecessor", to_id = "earlier-final",
                }
                ctx.turn_state.span_anchor_known = true
                ctx.turn_state.span_from_id = "later-predecessor"
                ctx.reader.messages = function()
                    return { all = function() return {}, nil end, last = function()
                        return { all = function()
                            if lookup == "unavailable" then return nil, "history unavailable" end
                            return { {} }, nil
                        end }
                    end }
                end
                test.is_nil(select(2, message_handlers.finish_turn(ctx)))
                test.is_nil(ctx.lifecycle_state.completed_turn_span.to_id)
                test.eq(ctx.lifecycle_state.completed_turn_span.from_id, "original-predecessor")
                ctx.reader.messages = default_messages
                controls.set_agent(second)
                ctx.config.agent_id = second.id
                test.is_nil(select(2, user_step(ctx)))
                test.is_nil(transitions[2].refs, "the outgoing agent has no known complete end")
            end)
        end

        it("recovers the original anchor after a completion with an unknown end", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local ctx = lifecycle_context(first)
            test.is_nil(select(2, user_step(ctx)))
            ctx.lifecycle_state.completed_turn_span = {
                agent_id = ctx.lifecycle_state.active_agent_id, model = ctx.lifecycle_state.active_model,
                revision = ctx.lifecycle_state.active_revision,
                from_id = "original-predecessor", to_id = "earlier-final",
            }
            ctx.turn_state.span_anchor_known = true
            ctx.reader.messages = function()
                return { all = function() return {}, nil end,
                    last = function() return { all = function() return { {} }, nil end } end }
            end
            test.is_nil(select(2, message_handlers.finish_turn(ctx)))
            test.is_nil(ctx.lifecycle_state.completed_turn_span.to_id)
            ctx.turn_state = { active = true, span_anchor_known = false }
            ctx.reader.messages = function()
                return { all = function() return {}, nil end,
                    last = function() return { all = function() return { { message_id = "recovered-final" } }, nil end } end }
            end
            test.is_nil(select(2, message_handlers.finish_turn(ctx)))
            local span = ctx.lifecycle_state.completed_turn_span
            test.eq(span.from_id, "original-predecessor", "a failed lookup must not lose the activation anchor")
            test.eq(span.to_id, "recovered-final")
        end)

        it("does not expose a range when the bounded history lookup is malformed", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local second = lifecycle_agent("agent:two", "binding:two")
            local ctx, transitions, controls = lifecycle_context(first)
            local default_messages = ctx.reader.messages

            test.is_nil(select(2, user_step(ctx)))
            ctx.reader.messages = function()
                return {
                    all = function() return {}, nil end,
                    last = function() return { all = function() return { {} }, nil end } end,
                }
            end
            ctx.turn_state.span_anchor_known = true
            ctx.turn_state.span_from_id = "known-predecessor"
            test.is_nil(select(2, message_handlers.finish_turn(ctx)))
            test.is_nil(ctx.lifecycle_state.completed_turn_span)
            ctx.reader.messages = default_messages

            controls.set_agent(second)
            ctx.config.agent_id = second.id
            test.is_nil(select(2, user_step(ctx)))
            test.is_nil(transitions[2].refs,
                "an invalid final row must not be treated as an open-history anchor")
        end)

        it("retains the first admitted user span across consecutive completed turns", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local ctx = lifecycle_context(first)
            ctx.lifecycle_state = { active_agent_id = first.id, active_model = first.model }
            local history = { { message_id = "before-facts" } }
            local admitted = 0
            ctx.reader.messages = function()
                return {
                    last = function()
                        return { all = function() return { history[#history] }, nil end }
                    end,
                    all = function() return history, nil end,
                    from_checkpoint = function(self) return self end,
                    count = function() return #history, nil end,
                }
            end
            ctx.writer.admit_message = function()
                admitted = admitted + 1
                local id = "source-user-" .. tostring(admitted)
                history[#history + 1] = { message_id = id }
                return id, nil, false
            end
            ctx.upstream.message_received = function() end

            local first_input, first_err = message_handlers.handle_message(ctx, {
                data = { text = "fact: keep the migration key" }, request_id = "source-request-1",
            })
            test.is_nil(first_err)
            test.eq(first_input.message_id, "source-user-1")
            history[#history + 1] = { message_id = "first-answer" }
            test.is_nil(select(2, message_handlers.finish_turn(ctx)))

            local second_input, second_err = message_handlers.handle_message(ctx, {
                data = { text = "brief handoff" }, request_id = "source-request-2",
            })
            test.is_nil(second_err)
            test.eq(second_input.message_id, "source-user-2")
            history[#history + 1] = { message_id = "second-answer" }
            test.is_nil(select(2, message_handlers.finish_turn(ctx)))

            local span = ctx.lifecycle_state.completed_turn_span
            test.eq(span.from_id, "before-facts")
            test.eq(span.to_id, "second-answer")
        end)

        it("retains an open first-history anchor across consecutive admitted turns", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local ctx = lifecycle_context(first)
            ctx.lifecycle_state = { active_agent_id = first.id, active_model = first.model }
            local history = {}
            local admitted = 0
            ctx.reader.messages = function()
                return {
                    last = function()
                        return { all = function()
                            local last = history[#history]
                            return last and { last } or {}, nil
                        end }
                    end,
                    all = function() return history, nil end,
                    from_checkpoint = function(self) return self end,
                    count = function() return #history, nil end,
                }
            end
            ctx.writer.admit_message = function()
                admitted = admitted + 1
                local id = "first-history-user-" .. tostring(admitted)
                history[#history + 1] = { message_id = id }
                return id, nil, false
            end
            ctx.upstream.message_received = function() end

            test.is_nil(select(2, message_handlers.handle_message(ctx, {
                data = { text = "fact: first history key" }, request_id = "first-history-request-1",
            })))
            history[#history + 1] = { message_id = "first-history-answer" }
            test.is_nil(select(2, message_handlers.finish_turn(ctx)))
            test.is_nil(ctx.lifecycle_state.completed_turn_span.from_id)

            test.is_nil(select(2, message_handlers.handle_message(ctx, {
                data = { text = "brief handoff" }, request_id = "first-history-request-2",
            })))
            history[#history + 1] = { message_id = "second-history-answer" }
            test.is_nil(select(2, message_handlers.finish_turn(ctx)))

            local span = ctx.lifecycle_state.completed_turn_span
            test.is_nil(span.from_id, "first-history range must remain open")
            test.eq(span.to_id, "second-history-answer")
        end)

        it("recovers the active agent for a switch when only its ID was retained", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local second = lifecycle_agent("agent:two", "binding:two")
            local ctx, transitions, controls = lifecycle_context(first)

            test.is_nil(select(2, user_step(ctx)))
            ctx.lifecycle_state.active_agent = nil
            ctx.agent_ctx.get_current_agent = function() return first end
            controls.set_agent(second)
            ctx.config.agent_id = second.id
            test.is_nil(select(2, user_step(ctx)))

            test.eq(#transitions, 3)
            test.eq(transitions[2].phase, "deactivate")
            test.eq(transitions[2].binding, "binding:one")
            test.eq(transitions[3].phase, "activate")
            test.eq(transitions[3].binding, "binding:two")
        end)

        it("refreshes the same agent when its stored object is missing and lookup is unavailable", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local ctx, transitions = lifecycle_context(first)

            test.is_nil(select(2, user_step(ctx)))
            ctx.lifecycle_state.active_agent = nil
            ctx.agent_ctx.get_current_agent = function() return nil end
            local loads = 0
            ctx.agent_ctx.load_agent = function()
                loads = loads + 1
                if loads == 1 then return first, nil end
                return nil, "old agent unavailable"
            end

            test.is_nil(select(2, user_step(ctx)))
            test.eq(#transitions, 1)
            test.eq(ctx.lifecycle_state.active_agent, first)
        end)

        it("does not deactivate a new agent as the lost previous agent", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local second = lifecycle_agent("agent:two", "binding:two")
            local ctx, transitions, controls = lifecycle_context(first)
            test.is_nil(select(2, user_step(ctx)))
            ctx.lifecycle_state.active_agent = nil
            controls.set_agent(second)
            ctx.config.agent_id = second.id

            local result, err = user_step(ctx)
            test.is_nil(err)
            test.is_true(result.completed)
            test.not_nil(result.failed)
            test.eq(#transitions, 1, "wrong agent receives neither lifecycle phase")
            test.eq(ctx.lifecycle_state.active_agent_id, first.id, "missing old state is not silently cleared")

            local finish: any = (message_handlers :: any).deactivate_current_agent
            local _, finish_err = finish(ctx, "session_finished")
            test.not_nil(finish_err)
            test.eq(#transitions, 1)
            test.eq(ctx.lifecycle_state.active_agent_id, first.id)
        end)

        it("keeps active state when a missing previous object cannot be recovered", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local ctx, transitions = lifecycle_context(first)
            test.is_nil(select(2, user_step(ctx)))
            ctx.lifecycle_state.active_agent = nil
            ctx.agent_ctx.get_current_agent = function() return nil end
            ctx.agent_ctx.load_agent = function() return nil, "agent unavailable" end

            local finish: any = (message_handlers :: any).deactivate_current_agent
            local _, err = finish(ctx, "session_finished")
            test.not_nil(err)
            test.eq(ctx.lifecycle_state.active_agent_id, first.id)
            test.eq(#transitions, 1)
        end)

        it("switches lifecycle bindings when the trait overlay changes under the same agent", function()
            local first = lifecycle_agent("agent:one", "binding:first_trait")
            local second = lifecycle_agent("agent:one", "binding:second_trait")
            local ctx, transitions, controls = lifecycle_context(first)
            ctx.agent_ctx.active_traits = { "trait:first" }

            test.is_nil(select(2, user_step(ctx)))
            controls.set_agent(second)
            ctx.agent_ctx.active_traits = { "trait:second" }
            test.is_nil(select(2, user_step(ctx)))

            test.eq(#transitions, 3)
            test.eq(transitions[2].phase, "deactivate")
            test.eq(transitions[2].binding, "binding:first_trait")
            test.eq(transitions[3].phase, "activate")
            test.eq(transitions[3].binding, "binding:second_trait")

            ctx.agent_ctx.active_traits = { "trait:second" }
            test.is_nil(select(2, user_step(ctx)))
            test.eq(#transitions, 3)
        end)

        it("keeps the old agent active when strict deactivation fails", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local second = lifecycle_agent("agent:two", "binding:two")
            local ctx, transitions, controls = lifecycle_context(first)

            test.is_nil(select(2, user_step(ctx)))
            controls.set_agent(second)
            controls.reject("deactivate")
            ctx.config.agent_id = second.id

            local result, err = user_step(ctx)
            test.is_nil(err)
            test.is_true(result.completed)
            test.eq(result.failed, "strict lifecycle failure")
            test.eq(#transitions, 2)
            test.eq(ctx.lifecycle_state.active_agent_id, first.id)
            test.eq(ctx.lifecycle_state.active_agent, first)
        end)

        it("receipts a reported non-strict deactivation failure without blocking the switch", function()
            local first = lifecycle_agent("agent:one", "binding:one")
            local second = lifecycle_agent("agent:two", "binding:two")
            local ctx, transitions, controls = lifecycle_context(first)
            local receipts = {}
            message_handlers._report_lifecycle_errors = function(receipt_ctx, phase, agent, lifecycle_errors)
                receipts[#receipts + 1] = {
                    session_id = receipt_ctx.session_id,
                    phase = phase,
                    agent_id = agent.id,
                    error = lifecycle_errors[1].error,
                }
            end

            test.is_nil(select(2, user_step(ctx)))
            controls.set_agent(second)
            controls.reject_non_strict("deactivate")
            ctx.config.agent_id = second.id

            local result, err = user_step(ctx)
            test.is_nil(err)
            test.is_nil(result.failed)
            test.eq(#transitions, 3)
            test.eq(ctx.lifecycle_state.active_agent_id, second.id)
            test.eq(#receipts, 1)
            test.eq(receipts[1].session_id, ctx.session_id)
            test.eq(receipts[1].phase, "deactivate")
            test.eq(receipts[1].agent_id, first.id)
            test.eq(receipts[1].error, "non-strict lifecycle failure")
        end)

        local function native_failure_switch(strict: boolean): (any, any, any, any)
            local first = lifecycle_agent("agent:one", "app.lifecycle_receipts:binding")
            first.bindings.lifecycle[1].id = "receipt-binding"
            first.bindings.lifecycle[1].trait_id = "trait:receipt"
            first.bindings.lifecycle[1].phases = { "deactivate" }
            first.bindings.lifecycle[1].strict = strict
            local second = fake_agent(nil)
            second.id = "agent:two"
            local ctx, _, controls = lifecycle_context(first)
            local receipts = {}
            -- Exercise the published Agent lifecycle runtime and a native
            -- contract binding rather than the lifecycle_context double.
            message_handlers._lifecycle_runtime = nil
            message_handlers._report_lifecycle_errors = function(receipt_ctx, phase, agent, lifecycle_errors)
                receipts[#receipts + 1] = {
                    session_id = receipt_ctx.session_id,
                    phase = phase,
                    agent_id = agent.id,
                    errors = lifecycle_errors,
                }
                if default_lifecycle_error_report then
                    default_lifecycle_error_report(receipt_ctx, phase, agent, lifecycle_errors)
                end
            end
            test.is_nil(select(2, user_step(ctx)))
            controls.set_agent(second)
            ctx.config.agent_id = second.id
            local result, err = user_step(ctx)
            test.is_nil(err)
            return ctx, result, receipts, first
        end

        it("reports a real non-strict lifecycle binding error and completes the switch", function()
            local ctx, result, receipts = native_failure_switch(false)
            test.is_nil(result.failed)
            test.eq(ctx.lifecycle_state.active_agent_id, "agent:two")
            test.eq(#receipts, 1)
            test.eq(receipts[1].session_id, ctx.session_id)
            test.eq(receipts[1].phase, "deactivate")
            test.eq(receipts[1].agent_id, "agent:one")
            test.eq(#receipts[1].errors, 1)
            test.eq(receipts[1].errors[1].binding_id, "receipt-binding")
            test.eq(receipts[1].errors[1].trait_id, "trait:receipt")
            test.eq(receipts[1].errors[1].strict, false)
            test.contains(receipts[1].errors[1].error, "lifecycle receipt failure")
        end)

        it("keeps a real strict lifecycle binding error fatal to the switch", function()
            local ctx, result, receipts, first = native_failure_switch(true)
            test.contains(result.failed, "lifecycle receipt failure")
            test.eq(ctx.lifecycle_state.active_agent_id, first.id)
            test.eq(ctx.lifecycle_state.active_agent, first)
            test.eq(#receipts, 0, "a strict failure retains its existing fatal path")
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

    describe("outgoing context checkpoint", function()
        local original_checkpoint, original_context_type
        before_each(function()
            original_checkpoint = session_handlers.create_checkpoint
            original_context_type = output.ERROR_TYPE.CONTEXT_WINDOW
        end)
        after_each(function()
            session_handlers.create_checkpoint = original_checkpoint
            output.ERROR_TYPE.CONTEXT_WINDOW = original_context_type
        end)

        it("runs the existing checkpoint and rebuilds the prompt before provider dispatch", function()
            local agent = fake_agent(nil)
            local ctx = mock_ctx(agent)
            local checkpoints, builds = 0, 0
            ctx.prepare_attention_prompt = function()
                builds = builds + 1
                return { get_messages = function() return { { role = "user", content = checkpoints == 0 and "large tool result" or "task and summary" } } end }
            end
            session_handlers.create_checkpoint = function(context, op)
                test.eq(context, ctx)
                test.eq(op.checkpoint_function_id, "wippy.session.funcs:checkpoint")
                test.eq(op.trigger_tokens, 150000)
                test.eq(op.checkpoint_id, "msg-user")
                checkpoints = checkpoints + 1
                return { completed = true }
            end
            agent.step = function(_self, _builder, options)
                test.not_nil(options.checkpoint)
                test.eq(options.checkpoint.token_threshold, THRESHOLD)
                local replacement, err = options.checkpoint.compact({ estimated_prompt_tokens = 150000, context_window = 200000 })
                test.is_nil(err)
                test.eq(replacement:get_messages()[1].content, "task and summary")
                test.eq(checkpoints, 1)
                return { result = "done" }
            end
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.is_true(result.completed)
            test.eq(builds, 2)
        end)

        it("keeps pending steering outside the summarized boundary", function()
            local agent = fake_agent(nil)
            local ctx = mock_ctx(agent)
            local arrived = false
            ctx.reader.messages = function() return {
                from_checkpoint = function(self) return self end,
                all = function()
                    local rows = {{message_id = "completed-tool", type = consts.MSG_TYPE.FUNCTION,
                        metadata = {status = consts.FUNC_STATUS.SUCCESS}}}
                    if arrived then rows[#rows + 1] = {message_id = "pending-steering", type = consts.MSG_TYPE.USER,
                        metadata = {input = {state = "pending"}}} end
                    return rows
                end,
            } end
            ctx.prepare_attention_prompt = function() return {get_messages = function() return {} end} end
            session_handlers.create_checkpoint = function(_, op)
                test.eq(op.checkpoint_id, "completed-tool")
                test.eq(op.source_id, "msg-user")
                test.is_true(op.exclusive)
                return {completed = true}
            end
            agent.step = function(_, _, options)
                arrived = true
                local replacement, err = options.checkpoint.compact({estimated_prompt_tokens = 150000})
                test.is_nil(err)
                test.not_nil(replacement)
                return {result = "done"}
            end
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.is_true(result.completed)
        end)

        it("does not summarize an unsettled tool round", function()
            local agent = fake_agent(nil)
            local ctx = mock_ctx(agent)
            ctx.reader.messages = function() return {
                from_checkpoint = function(self) return self end,
                all = function() return {{message_id = "pending-tool", type = consts.MSG_TYPE.FUNCTION,
                    metadata = {status = consts.FUNC_STATUS.PENDING}}} end,
            } end
            ctx.prepare_attention_prompt = function() return {get_messages = function() return {} end} end
            session_handlers.create_checkpoint = function() error("must not summarize pending tools") end
            agent.step = function(_, _, options)
                local replacement, err = options.checkpoint.compact({estimated_prompt_tokens = 150000})
                test.is_nil(replacement)
                test.eq(err, "Cannot checkpoint an unsettled tool round")
                return nil, err
            end
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.contains(result.failed, "Cannot checkpoint an unsettled tool round")
        end)

        it("preserves explicit disabled checkpoint policy", function()
            local agent = fake_agent(nil)
            local ctx = mock_ctx(agent, { checkpoint = { enabled = false } })
            agent.step = function(_self, _builder, options)
                test.is_nil(options.checkpoint)
                return { result = "done" }
            end
            session_handlers.create_checkpoint = function() error("disabled checkpoint") end
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.is_true(result.completed)
        end)

        it("preserves typed context admission details in the failed turn", function()
            local agent = fake_agent(nil)
            local details = { error_type = "context_window", estimated_prompt_tokens = 300, context_window = 200 }
            agent.step = function() return nil, "Prompt exceeds the model context window", details end
            local ctx, captured = mock_ctx(agent)
            output.ERROR_TYPE.CONTEXT_WINDOW = nil
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.not_nil(result.failed)
            test.eq(captured.message_errors[1].code, "context_window")
            local system = stored_of_type(captured, consts.MSG_TYPE.SYSTEM)
            test.eq(system[1].metadata.error_details, details)
        end)

        it("propagates checkpoint errors before dispatch", function()
            local agent = fake_agent(nil)
            local ctx = mock_ctx(agent)
            session_handlers.create_checkpoint = function() return nil, "checkpoint failed" end
            agent.step = function(_self, _builder, options)
                local replacement, err = options.checkpoint.compact({ estimated_prompt_tokens = 150000 })
                test.is_nil(replacement)
                test.eq(err, "checkpoint failed")
                return nil, err
            end
            local result, err = user_step(ctx)
            test.is_nil(err)
            test.contains(result.failed, "checkpoint failed")
        end)
    end)

    describe("usage context", function()
        it("passes the session identifier on initial and continued steps", function()
            local agent = fake_agent(nil)
            local original_step = agent.step
            local seen = {}
            agent.step = function(self, builder, options)
                seen[#seen + 1] = options
                return original_step(self, builder, options)
            end
            local ctx = mock_ctx(agent)
            test.is_nil(select(2, user_step(ctx)))
            test.is_nil(select(2, continue_step(ctx)))
            test.eq(#seen, 2)
            test.eq(seen[1].context_id, ctx.session_id)
            test.eq(seen[2].context_id, ctx.session_id)
        end)
    end)

    describe("step stop check", function()
        it("uses the current turn after replacing a failed turn", function()
            local agent = fake_agent(nil)
            local check: any = nil
            agent.step = function(_self, _builder, options)
                check = options.stop_check
                return {result = "done", tool_calls = {}}
            end
            local ctx = mock_ctx(agent)
            test.is_nil(select(2, user_step(ctx)))
            ctx.turn_state = {failed = true}
            test.is_true(check())
            ctx.turn_state = {active = true, failed = false}
            test.is_false(check(), "a cached stop check must not retain the previous failed turn")
        end)
        it("passes one cached stop check that reports a later stop request", function()
            local agent = fake_agent(nil)
            local seen = {} :: { any }
            agent.step = function(_self, _builder, runtime_options)
                table.insert(seen, runtime_options.stop_check)
                return { result = "done", tool_calls = {} }
            end
            local ctx = mock_ctx(agent)

            test.is_nil(select(2, user_step(ctx)))
            test.is_nil(select(2, user_step(ctx)))

            test.eq(#seen, 2)
            test.eq(type(seen[1]), "function")
            test.is_true(rawequal(seen[1], seen[2]))
            test.is_false(seen[1]())
            ctx.stop_requested = true
            test.is_true(seen[1]())
        end)

        it("invalidates the response and schedules nothing when the step stops before generation", function()
            local agent = fake_agent(nil)
            agent.step = function() return { stopped = true } end
            local ctx, captured = mock_ctx(agent)
            local began, invalidated = {} :: { any }, {} :: { any }
            ctx.upstream.response_beginning = function(_self, id) table.insert(began, id) end
            ctx.upstream.invalidate_message = function(_self, id) table.insert(invalidated, id) end

            local result, err = user_step(ctx)

            test.is_nil(err)
            test.is_true(result.completed)
            test.eq(#result.next_ops, 0)
            test.eq(result.message_id, "msg-user")
            test.eq(#began, 1)
            test.eq(#invalidated, 1)
            test.eq(invalidated[1], began[1])
            test.eq(result.response_id, began[1])
            test.eq(#stored_of_type(captured, consts.MSG_TYPE.ASSISTANT), 0)
            test.eq(#captured.message_errors, 0)
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
            test.eq(events[2].payload.error, "tool failed")
            test.is_nil(events[2].payload.outcome, "an ordinary error is not a cancellation")
            test.is_nil(events[2].payload.status)
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

        it("reports settled omitted and thrown public errors without exposing private or delegation calls", function()
            for _, throws in ipairs({ false, true }) do
                local ctx, captured, calls, ids, validated = call_fixture()
                local events: { PublicToolEvent } = {}
                ctx.upstream.send_message_update = function(_self, topic_id, event_type, payload)
                    if event_type == consts.UPSTREAM_TYPES.FUNCTION_ERROR then
                        for _, row in ipairs(captured.stored) do
                            if row.id == payload.message_id then
                                test.eq(row.metadata.status, consts.FUNC_STATUS.ERROR)
                                test.eq(row.metadata.result, payload.error)
                            end
                        end
                    end
                    events[#events + 1] = { topic_id = topic_id, type = event_type, payload = payload }
                end
                local result, err = message_handlers.process_tools(ctx, {
                    tool_calls = calls, call_message_ids = ids, validated_tools = validated,
                    caller = { set_strategy = function() end, execute = function()
                        if throws then error("tool runner failed") end
                        return {}
                    end },
                    message_id = "user", agent = { id = "agent:documents" },
                })
                test.is_nil(err)
                test.not_nil(result)
                test.eq(#events, 2)
                test.eq(events[1].type, consts.UPSTREAM_TYPES.FUNCTION_CALL)
                test.eq(events[2].type, consts.UPSTREAM_TYPES.FUNCTION_ERROR)
                test.eq(events[2].topic_id, "function")
                test.eq(events[2].payload.message_id, ids["function"])
                test.eq(events[2].payload.call_id, "function")
                test.contains(events[2].payload.error, throws and "tool runner failed" or "Call outcome unknown")
                for _, row in ipairs(captured.stored) do
                    test.eq(row.metadata.status, consts.FUNC_STATUS.ERROR)
                end
            end
        end)

        it("hides omitted private and delegation errors even without validated call metadata", function()
            local ctx, captured, calls, ids = call_fixture()
            calls[1].type = consts.MSG_TYPE.FUNCTION
            calls[2].type = consts.MSG_TYPE.PRIVATE_FUNCTION
            calls[3].type = consts.MSG_TYPE.DELEGATION
            local events: { PublicToolEvent } = {}
            ctx.upstream.send_message_update = function(_self, topic_id, event_type, payload)
                events[#events + 1] = { topic_id = topic_id, type = event_type, payload = payload }
            end
            local result, err = message_handlers.process_tools(ctx, {
                tool_calls = calls, call_message_ids = ids,
                caller = { set_strategy = function() end, execute = function() return {} end },
                message_id = "user", agent = { id = "agent:documents" },
            })
            test.is_nil(err)
            test.not_nil(result)
            test.eq(#events, 1)
            test.eq(events[1].type, consts.UPSTREAM_TYPES.FUNCTION_ERROR)
            test.eq(events[1].topic_id, "function")
            test.eq(events[1].payload.error, "Call outcome unknown")
            for _, row in ipairs(captured.stored) do
                test.eq(row.metadata.status, consts.FUNC_STATUS.ERROR)
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

        it("fails the turn when the state refresh after a durable control write fails", function()
            local ctx, _captured, calls, ids, validated = call_fixture()
            local persisted = 0
            ctx.writer.update_meta = function() persisted = persisted + 1; return true end
            ctx.reader.reset = function() return nil, "Session not found during reset" end
            ctx.agent_ctx.set_active_tools = function() return true end

            local continued = 0
            local bus = command_bus.new(ctx)
            ctx.queue_empty_callback = function() bus:stop(); return true end
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, message_handlers.process_tools)
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

            test.eq(persisted, 1)
            test.eq(continued, 0)
            test.is_nil(ok)
            test.contains(tostring(err), "Session not found during reset")
        end)

        it("rejects malformed tool controls without applying their effects", function()
            local malformed = {
                { control = "stop", message = "Invalid tool control: expected a table" },
                { control = { artifacts = "a" }, message = "Invalid tool control: artifacts must be a table" },
                { control = { context = 1 }, message = "Invalid tool control: context must be a table" },
                { control = { memory = true }, message = "Invalid tool control: memory must be a table" },
                { control = { config = "c" }, message = "Invalid tool control: config must be a table" },
            }
            for _, case in ipairs(malformed) do
                local ctx, captured, calls, ids, validated = call_fixture()
                local persisted = 0
                ctx.writer.update_meta = function() persisted = persisted + 1; return true end
                ctx.agent_ctx.set_active_tools = function() return true end

                local bus = command_bus.new(ctx)
                ctx.queue_empty_callback = function() bus:stop(); return true end
                bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, message_handlers.process_tools)
                bus:mount_op_handler(consts.OP_TYPE.CONTROL_CONFIG, control_handlers.control_config)
                bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function() return { completed = true } end)
                local caller = {
                    set_strategy = function() end,
                    execute = function(_self, _context, tools)
                        return { ["function"] = {
                            result = { value = "written", _control = case.control },
                            tool_call = tools["function"]
                        } }
                    end
                }
                bus:queue_op({ type = consts.OP_TYPE.PROCESS_TOOLS,
                    tool_calls = { calls[1] }, call_message_ids = ids, caller = caller,
                    validated_tools = validated, message_id = "user", agent = { id = "agent:documents" } })

                bus:run()

                test.eq(persisted, 0)
                local function_row = nil
                for _, row in ipairs(captured.stored) do
                    if row.id == ids["function"] then function_row = row end
                end
                test.not_nil(function_row)
                test.eq((function_row or {}).metadata.status, consts.FUNC_STATUS.ERROR)
                test.contains(tostring((function_row or {}).metadata.result), case.message)
                test.is_nil((function_row or {}).metadata.control_operations)
            end
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

    describe("agent handoff", function()
        local function handoff_fixture(admit_first_user)
            local steps = { router = 0, help = 0 }
            local router = fake_agent(nil)
            router.id = "agent:router"
            router.step = function()
                steps.router = steps.router + 1
                return { result = "", tool_calls = { { id = "call-1", name = "switch_agent",
                    arguments = "{}", registry_id = "app:switch_agent" } } }
            end
            local help = {
                id = "agent:help", model = "model:help", tool_wrappers = {}, bindings = nil,
                agent_options = { session_input = { while_running = "steer" } },
                step = function()
                    steps.help = steps.help + 1
                    return { result = "Here is the answer from the help agent.", tool_calls = {} }
                end,
            }
            local ctx, captured = mock_ctx(router)
            local current = router
            ctx.agent_ctx = {
                current_model = router.model,
                load_agent = function() return current, nil end,
                get_current_agent = function() return current end,
                switch_to_agent = function(self, agent_id)
                    if agent_id ~= help.id then return nil, "unknown agent " .. tostring(agent_id) end
                    current = help
                    self.current_model = help.model
                    return true
                end,
            }
            local interactions = {} :: {any}
            ctx.writer.update_meta = function(_self, updates)
                if updates.meta and updates.meta.interaction then
                    table.insert(interactions, updates.meta.interaction)
                end
                return true
            end
            local announced = {} :: {string}
            ctx.upstream.update_session = function(_self, update)
                if update.agent then table.insert(announced, update.agent) end
            end
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
                        return { [call.id] = { valid = true, name = call.name, args = {},
                            registry_id = call.registry_id } }, nil
                    end,
                    execute = function(_self, _context, tools)
                        if ctx.stop_in_handoff then bus:request_stop() end
                        ctx.handoff_settled = true
                        return { ["call-1"] = { result = { _control = { config = { agent = help.id } } },
                            tool_call = tools["call-1"] } }
                    end,
                }
            end
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, message_handlers.agent_step)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, message_handlers.process_tools)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, message_handlers.agent_continue)
            if admit_first_user then
                local history = {}
                ctx.reader.messages = function()
                    return {
                        from_checkpoint = function(self) return self end,
                        all = function() return history, nil end,
                        last = function()
                            return { all = function()
                                if ctx.handoff_settled then
                                    -- The settled tool result is the final outgoing row.
                                    return { { message_id = "handoff-tool-result" } }, nil
                                end
                                local last = history[#history]
                                return last and { last } or {}, nil
                            end }
                        end,
                        count = function() return #history, nil end,
                    }
                end
                ctx.writer.admit_message = function()
                    history[#history + 1] = { message_id = "msg-user", type = consts.MSG_TYPE.USER,
                        data = "fact from the first routed user turn" }
                    return "msg-user", nil, false
                end
                ctx.upstream.message_received = function() end
                local accepted, accept_err = message_handlers.handle_message(ctx, {
                    data = { text = "fact from the first routed user turn" }, request_id = "req-1",
                })
                assert(not accept_err)
                assert(bus:queue_op(accepted.next_ops[1]))
            else
                bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP,
                    message_id = "msg-user", request_id = "req-1", from_user = true })
            end
            return ctx, captured, bus, steps, interactions, announced,
                function() tool_caller.new = original_new end
        end

        it("keeps settled behavior proposals when a successful tool hands off", function()
            local ctx, captured, bus, steps, _, _, restore = handoff_fixture()
            local router = ctx.agent_ctx:get_current_agent()
            router.bindings = { lifecycle = {} }
            local writes = 0
            ctx.writer.set_context = function() writes = writes + 1; return true end
            message_handlers._lifecycle_runtime = { apply = function(_, payload)
                if payload.phase == "after_step" then
                    return { controls = {{ context = { session = { set = { retained = true } } } }} }
                end
                return {}
            end }
            local ok, err = bus:run()
            restore()
            message_handlers._lifecycle_runtime = nil
            test.is_nil(err)
            test.is_true(ok)
            test.eq(steps.help, 1, "the accepted handoff completed")
            test.eq(writes, 1, "a handoff must not discard the settled round's proposal")
            test.eq(stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1].metadata.behavior_control_state, "applied")
        end)

        it("suppresses behavior proposals when Stop arrives during a tool-driven handoff", function()
            local ctx, captured, bus, steps, _, _, restore = handoff_fixture()
            ctx.stop_in_handoff = true
            ctx.agent_ctx:get_current_agent().bindings = { lifecycle = {} }
            local writes = 0
            ctx.writer.set_context = function() writes = writes + 1; return true end
            message_handlers._lifecycle_runtime = { apply = function(_, payload)
                if payload.phase == "after_step" then
                    return { controls = {{ context = { session = { set = { must_not_apply = true } } } }} }
                end
                return {}
            end }
            local ok, err = bus:run()
            restore()
            message_handlers._lifecycle_runtime = nil
            test.is_nil(err)
            test.is_true(ok)
            test.eq(writes, 0)
            test.eq(steps.help, 0)
            test.eq(stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)[1].metadata.behavior_control_state, "cancelled")
        end)

        it("continues the turn with the new agent after a tool-driven agent switch", function()
            local ctx, captured, bus, steps, interactions, announced, restore = handoff_fixture()
            local ok, err = bus:run()
            restore()
            test.is_nil(err)
            test.is_true(ok)
            test.eq(steps.router, 1)
            test.eq(steps.help, 1)
            test.eq(ctx.config.agent_id, "agent:help")
            test.eq(ctx.config.model, "model:help")
            test.eq(announced[1], "agent:help")
            test.is_nil(ctx.turn_state.handoff)
            test.is_nil(ctx.turn_state.failed)
            local calls = stored_of_type(captured, consts.MSG_TYPE.FUNCTION)
            test.eq(#calls, 1)
            test.eq(calls[1].metadata.status, consts.FUNC_STATUS.SUCCESS)
            local answers = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)
            test.eq(answers[#answers].content, "Here is the answer from the help agent.")
            test.is_false(interactions[1].can_send)
            test.is_true(interactions[#interactions].can_send)
        end)

        it("bounds deferred deactivation after a first-turn tool handoff", function()
            local ctx, _captured, bus, steps, _interactions, _announced, restore = handoff_fixture(true)
            local router = ctx.agent_ctx:get_current_agent()
            router.bindings = { lifecycle = { { binding = "binding:router" } } }
            local transitions = {}
            message_handlers._lifecycle_runtime = {
                apply = function(_bindings, payload)
                    if payload.phase == "deactivate" then transitions[#transitions + 1] = payload end
                    return { applied = 1, messages = {} }, nil
                end,
            }

            local ok, err = bus:run()
            restore()
            message_handlers._lifecycle_runtime = nil
            test.is_nil(err)
            test.is_true(ok)
            test.eq(steps.router, 1)
            test.eq(steps.help, 1)
            test.eq(#transitions, 1)
            test.eq(transitions[1].agent.id, "agent:router")
            test.eq(transitions[1].refs.deactivation_range.to_id, "handoff-tool-result")
            test.is_nil(transitions[1].refs.deactivation_range.from_id,
                "the first admitted source turn has a valid open history start")
        end)

        it("does not attribute the retired agent history to its mid-turn successor", function()
            local ctx, _captured, bus, _steps, _interactions, _announced, restore = handoff_fixture(true)
            local router = ctx.agent_ctx:get_current_agent()
            router.bindings = { lifecycle = { { binding = "binding:router" } } }
            local switch = ctx.agent_ctx.switch_to_agent
            local latest = nil
            ctx.agent_ctx.switch_to_agent = function(self, id)
                local ok, err = switch(self, id)
                local successor = self:get_current_agent()
                successor.bindings = { lifecycle = { { binding = "binding:help" } } }
                local step = successor.step
                successor.step = function(...)
                    local result = step(...)
                    latest = "help-final"
                    return result
                end
                return ok, err
            end
            local messages = ctx.reader.messages
            ctx.reader.messages = function(...)
                local query = messages(...)
                query.last = function()
                    return { all = function()
                        return { { message_id = latest or (ctx.handoff_settled and "handoff-tool-result" or "msg-user") } }, nil
                    end }
                end
                return query
            end
            local transitions = {}
            message_handlers._lifecycle_runtime = {
                apply = function(_bindings, payload)
                    if payload.phase == "deactivate" then transitions[#transitions + 1] = payload end
                    return { applied = 1, messages = {} }, nil
                end,
            }
            local ok, err = bus:run()
            restore()
            test.is_nil(err)
            test.is_true(ok)
            test.is_nil(select(2, message_handlers.finish_turn(ctx)))
            test.is_nil(select(2, message_handlers.deactivate_current_agent(ctx, "session_finished")))
            message_handlers._lifecycle_runtime = nil
            test.eq(#transitions, 2)
            test.eq(transitions[2].agent.id, "agent:help")
            test.eq(transitions[2].refs.deactivation_range.to_id, "help-final")
            test.eq(transitions[2].refs.deactivation_range.from_id, "handoff-tool-result",
                "the successor range starts after the predecessor's settled tool result")
        end)

        it("does not start the new agent when Stop lands in the handoff round", function()
            local ctx, captured, bus, steps, _interactions, _announced, restore = handoff_fixture()
            ctx.stop_in_handoff = true
            local ok, err = bus:run()
            restore()
            test.is_nil(err)
            test.is_true(ok)
            test.eq(steps.router, 1)
            test.eq(steps.help, 0)
            test.eq(ctx.config.agent_id, "agent:help")
            local calls = stored_of_type(captured, consts.MSG_TYPE.FUNCTION)
            test.eq(calls[1].metadata.status, consts.FUNC_STATUS.SUCCESS)
        end)

        it("does not carry the pinned route over to the agent that takes over", function()
            local ctx, captured, bus, steps, _interactions, _announced, restore = handoff_fixture()
            local pin = { model = "backup", provider_id = "p.b", provider_model = "b-1" }
            local router = ctx.agent_ctx:load_agent()
            local original_router_step = assert(router.step)
            router.step = function(self, builder, runtime_options)
                local response = original_router_step(self, builder, runtime_options)
                response.route_pin = pin
                response.metadata = { route = pin, fallbacks = { { model = "primary", error_type = "server_error" } } }
                return response
            end
            local help_route = "unset"
            local original_switch = ctx.agent_ctx.switch_to_agent
            ctx.agent_ctx.switch_to_agent = function(self, agent_id)
                local ok, err = original_switch(self, agent_id)
                if ok then
                    local help = self:get_current_agent()
                    local original_help_step = help.step
                    help.step = function(hself, builder, runtime_options)
                        help_route = runtime_options.route
                        return original_help_step(hself, builder, runtime_options)
                    end
                end
                return ok, err
            end

            local ok, err = bus:run()
            restore()
            test.is_nil(err)
            test.is_true(ok)
            test.eq(steps.router, 1)
            test.eq(steps.help, 1)
            local answers = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)
            test.eq(answers[1].metadata.route.model, "backup", "the router's step was recorded with its route")
            test.is_nil(help_route)
            test.is_nil(ctx.turn_state.route)
        end)
    end)

    describe("route pinning", function()
        local pin = { model = "backup", provider_id = "p.b", provider_model = "b-1" }

        -- Falls back on its first step of a turn, then keeps answering with tool calls.
        local function pinning_agent(): (any, { any })
            local seen = {} :: { any }
            local agent = fake_agent(1000)
            agent.step = function(_self, _builder, runtime_options)
                table.insert(seen, { route = runtime_options.route })
                local response = {
                    result = "",
                    tokens = { prompt_tokens = 10, completion_tokens = 5, total_tokens = 15 },
                    tool_calls = { { id = "call-" .. tostring(#seen), name = "pack_document",
                        arguments = "{}", registry_id = "app:pack_document" } }
                }
                if runtime_options.route ~= nil then
                    response.route_pin = runtime_options.route
                    response.metadata = { route = runtime_options.route }
                else
                    response.route_pin = pin
                    response.metadata = { route = pin, fallbacks = { { model = "primary", provider_id = "p.a",
                        error_type = "server_error" } } }
                end
                return response
            end
            return agent, seen
        end

        it("passes the route pinned by an earlier step to the rest of the turn", function()
            local agent, seen = pinning_agent()
            local ctx, captured = mock_ctx(agent, { max_turn_iterations = 0, max_repeated_tool_calls = 0 })

            user_step(ctx)
            continue_step(ctx)
            continue_step(ctx)

            test.eq(#seen, 3)
            test.is_nil(seen[1].route)
            test.eq(seen[2].route, pin)
            test.eq(seen[3].route, pin)
            test.eq(ctx.turn_state.route, pin)

            local answers = stored_of_type(captured, consts.MSG_TYPE.ASSISTANT)
            test.eq(answers[1].metadata.route.model, "backup")
            test.eq(answers[1].metadata.fallbacks[1].error_type, "server_error")
        end)

        it("drops the fallback pin when the selected model changes in the same turn", function()
            local agent, seen = pinning_agent()
            local ctx = mock_ctx(agent, { max_turn_iterations = 0, max_repeated_tool_calls = 0 })
            user_step(ctx)
            ctx.agent_ctx.switch_to_model = function(_, model) agent.model = model; return true end
            local applied, err = control_handlers.control_config(ctx, { config_changes = { model = "model:new" } })
            test.is_nil(err)
            test.not_nil(applied)
            test.eq(ctx.config.model, "model:new")
            continue_step(ctx)
            test.is_nil(seen[2].route, "an old fallback route must not override an explicit model switch")
        end)

        it("drops the pin when a new user turn starts", function()
            local agent, seen = pinning_agent()
            local ctx = mock_ctx(agent, { max_turn_iterations = 0, max_repeated_tool_calls = 0 })

            user_step(ctx)
            continue_step(ctx)
            local finished, finish_err = message_handlers.finish_turn(ctx)
            test.is_nil(finish_err)
            test.is_true(finished.completed)
            test.eq(ctx.turn_state.route, pin, "the finished turn keeps its state until a new turn begins")

            message_handlers.agent_step(ctx, { message_id = "msg-user-2", request_id = "req-2", from_user = true })

            test.eq(#seen, 3)
            test.eq(seen[2].route, pin)
            test.is_nil(seen[3].route)
        end)

        it("keeps the pin when a later step reports none", function()
            local seen = {} :: { any }
            local agent = fake_agent(1000)
            agent.step = function(_self, _builder, runtime_options)
                table.insert(seen, { route = runtime_options.route })
                local response = {
                    result = "",
                    tokens = { prompt_tokens = 10, completion_tokens = 5, total_tokens = 15 },
                    tool_calls = { { id = "call-" .. tostring(#seen), name = "pack_document",
                        arguments = "{}", registry_id = "app:pack_document" } }
                }
                if #seen == 1 then response.route_pin = pin end
                return response
            end
            local ctx = mock_ctx(agent, { max_turn_iterations = 0, max_repeated_tool_calls = 0 })

            user_step(ctx)
            continue_step(ctx)
            continue_step(ctx)

            test.eq(seen[2].route, pin)
            test.eq(seen[3].route, pin)
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
