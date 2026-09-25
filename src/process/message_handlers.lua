local json = require("json")
local uuid = require("uuid")
local consts = require("consts")
local prompt_builder = require("prompt_builder")
local tool_caller = require("tool_caller")
local output = require("output")
local lifecycle_runtime = require("lifecycle_runtime")
local tools = require("tools")
local control_handlers = require("control_handlers")

type SessionContext = {
    session_id: string,
    user_id: string,
    reader: any,
    writer: any,
    upstream: any,
    config: {[string]: any},
    agent_ctx: any,
    queue_empty_callback: any?,
    lifecycle_state: table?,
    turn_state: table?,
}

type ToolWrapperHostRef = {
    kind: string,
    session_id: string,
}

type ToolWrapperAgentRef = {
    id: string?,
    model: string?,
}

type ToolWrapperExecutionContext = {
    host: ToolWrapperHostRef,
    agent: ToolWrapperAgentRef,
    run_context: table?,
}

local message_handlers = {}

local RUN_CONTEXT_CONTRACT = "wippy.agent:run_context"
local DEFAULT_RUN_CONTEXT_BINDING = "wippy.session.run_context:binding"

local OUTCOME = {
    CONTINUES = "continues",
    COMPLETED = "completed",
    FAILED = "failed",
}

local REASON = {
    NO_TOOLS_REQUIRED = "no_tools_required",
    TOOL_RESULTS_RECORDED = "tool_results_recorded",
    CONTEXT_LIMIT_REACHED = "context_limit_reached",
    MAX_ITERATIONS_REACHED = "max_iterations_reached",
    HOST_FAILED = "host_failed",
    AGENT_SWITCH = "agent_switch",
    SESSION_FINISHED = "session_finished",
}

local function copy_context(context: any): table
    local copied = {}
    if type(context) == "table" then
        for k, v in pairs(context) do
            copied[k] = v
        end
    end
    return copied
end

local function with_agent_run_context(ctx: SessionContext, context: any, agent_ref: ToolWrapperAgentRef?): table
    local next_context = copy_context(context)
    local host = {
        kind = "session",
        session_id = ctx.session_id
    }
    local agent_info = agent_ref or {
        id = ctx.config and ctx.config.agent_id,
        model = ctx.config and ctx.config.model
    }

    next_context.agent_run = {
        host = host,
        agent = agent_info,
        run_context = {
            contract = RUN_CONTEXT_CONTRACT,
            binding = (ctx.config and ctx.config.run_context_binding) or DEFAULT_RUN_CONTEXT_BINDING,
            host = host,
            agent = agent_info
        }
    }

    return next_context
end

local function host_ref(ctx: SessionContext): table
    return {
        kind = "session",
        session_id = ctx.session_id
    }
end

local function string_or_nil(value: any): string?
    if type(value) == "string" and value ~= "" then
        return value
    end
    return nil
end

local function agent_ref_from(ctx: SessionContext, agent: any?): ToolWrapperAgentRef
    return {
        id = string_or_nil(agent and agent.id or (ctx.config and ctx.config.agent_id)),
        model = string_or_nil(agent and agent.model or (ctx.config and ctx.config.model))
    }
end

local function persist_token_usage(ctx: any, tokens: any)
    if type(tokens) ~= "table" then return true end
    local session_data = ctx.reader:state()
    local current_meta = session_data.meta or {}
    if type(current_meta.tokens) ~= "table" then current_meta.tokens = {} end
    for token_key, token_value in pairs(tokens) do
        if type(token_value) == "number" then
            current_meta.tokens[token_key] = (current_meta.tokens[token_key] or 0) + token_value
        end
    end
    local _, err = ctx.writer:update_meta({ meta = current_meta })
    if err then return nil, err end
    return true
end

local function run_context_ref(ctx: SessionContext, agent_ref: ToolWrapperAgentRef, host: table): table
    return {
        contract = RUN_CONTEXT_CONTRACT,
        binding = (ctx.config and ctx.config.run_context_binding) or DEFAULT_RUN_CONTEXT_BINDING,
        host = host,
        agent = agent_ref
    }
end

local function apply_lifecycle(ctx: SessionContext, phase: string, agent: any?, opts: table?): (table?, string?)
    if not agent or type(agent.bindings) ~= "table" then
        return { applied = 0, skipped = 0 }, nil
    end

    local host = host_ref(ctx)
    local agent_ref = agent_ref_from(ctx, agent)
    local payload = {
        phase = phase,
        host = host,
        agent = agent_ref,
        reason = opts and opts.reason,
        outcome = opts and opts.outcome,
        refs = opts and opts.refs,
        run_context = run_context_ref(ctx, agent_ref, host),
    } :: LifecyclePayload

    return lifecycle_runtime.apply(agent.bindings, payload)
end

local function append_lifecycle_messages(builder: any, result: table?)
    if not builder or type(result) ~= "table" or type(result.messages) ~= "table" then
        return
    end

    for _, message in ipairs(result.messages) do
        if type(message) == "table" then
            local content = message.content or message.text or message.data
            if type(content) == "string" and content ~= "" then
                local role = message.role or message.type or "developer"
                if role == "system" and type(builder.add_system) == "function" then
                    builder:add_system(content)
                elseif role == "user" and type(builder.add_user) == "function" then
                    builder:add_user(content)
                elseif role == "assistant" and type(builder.add_assistant) == "function" then
                    builder:add_assistant(content, message.metadata)
                elseif type(builder.add_developer) == "function" then
                    builder:add_developer(content, message.metadata)
                end
            end
        end
    end
end

local function current_agent(ctx: SessionContext): any?
    if ctx.agent_ctx and type(ctx.agent_ctx.get_current_agent) == "function" then
        local agent = ctx.agent_ctx:get_current_agent()
        if agent then
            return agent
        end
    end

    if ctx.config and ctx.config.agent_id and ctx.config.agent_id ~= "" and ctx.agent_ctx and type(ctx.agent_ctx.load_agent) == "function" then
        local agent = ctx.agent_ctx:load_agent(ctx.config.agent_id, {
            model = ctx.config.model
        })
        return agent
    end

    return nil
end

function message_handlers.deactivate_current_agent(ctx: SessionContext, reason: string?, outcome: table?): (table?, string?)
    ctx.lifecycle_state = ctx.lifecycle_state or {}
    local state = ctx.lifecycle_state
    if not state.active_agent_id then
        return { applied = 0, skipped = 0 }, nil
    end

    local agent = state.active_agent or current_agent(ctx)
    if not agent then
        state.active_agent_id = nil
        state.active_model = nil
        state.active_agent = nil
        return { applied = 0, skipped = 0 }, nil
    end

    local result, err = apply_lifecycle(ctx, lifecycle_runtime.PHASE.DEACTIVATE, agent, {
        reason = reason or REASON.SESSION_FINISHED,
        outcome = outcome or {
            state = OUTCOME.COMPLETED,
            reason = reason or REASON.SESSION_FINISHED
        }
    })

    if not err then
        state.active_agent_id = nil
        state.active_model = nil
        state.active_agent = nil
    end

    return result, err
end

local function ensure_agent_activated(ctx: SessionContext, agent: any, refs: table?): (table?, string?)
    ctx.lifecycle_state = ctx.lifecycle_state or {}
    local state = ctx.lifecycle_state
    local agent_ref = agent_ref_from(ctx, agent)
    local same_agent = state.active_agent_id == agent_ref.id and state.active_model == agent_ref.model

    if same_agent then
        state.active_agent = agent
        return { applied = 0, skipped = 0 }, nil
    end

    if state.active_agent_id then
        local _, deactivate_err = message_handlers.deactivate_current_agent(ctx, REASON.AGENT_SWITCH, {
            state = OUTCOME.CONTINUES,
            reason = REASON.AGENT_SWITCH
        })
        if deactivate_err then
            return nil, deactivate_err
        end
    end

    local result, err = apply_lifecycle(ctx, lifecycle_runtime.PHASE.ACTIVATE, agent, {
        reason = "agent_loaded",
        refs = refs,
        outcome = {
            state = OUTCOME.CONTINUES,
            reason = "agent_loaded"
        }
    })
    if err then
        return result, err
    end

    state.active_agent_id = agent_ref.id
    state.active_model = agent_ref.model
    state.active_agent = agent
    return result, nil
end

local function outcome_from_agent_result(result: any): table
    if result and result.truncated then
        return {
            state = OUTCOME.CONTINUES,
            reason = REASON.CONTEXT_LIMIT_REACHED
        }
    end

    local has_tools = result and (
        (type(result.tool_calls) == "table" and #result.tool_calls > 0) or
        (type(result.delegate_calls) == "table" and #result.delegate_calls > 0)
    )
    if has_tools then
        return {
            state = OUTCOME.CONTINUES,
            reason = REASON.TOOL_RESULTS_RECORDED
        }
    end

    return {
        state = OUTCOME.COMPLETED,
        reason = REASON.NO_TOOLS_REQUIRED
    }
end

-- LOOP GUARDS. One turn is one user message and the chain of agent steps it triggers
-- (agent_step -> process_tools -> agent_continue -> agent_step ...).
local function non_negative(value: any): number?
    local n = tonumber(value)
    if n == nil or n < 0 then
        return nil
    end
    return n
end

local function loop_limits(ctx: SessionContext, agent: any): (number, number)
    local options = nil
    if agent and type(agent.agent_options) == "table" then
        options = agent.agent_options.loop
    end
    if type(options) ~= "table" then
        options = {}
    end

    local max_steps = non_negative(options.max_iterations)
        or non_negative(ctx.config and ctx.config.max_turn_iterations)
        or consts.DEFAULTS.MAX_TURN_ITERATIONS
    local max_repeats = non_negative(options.max_repeated_calls)
        or non_negative(ctx.config and ctx.config.max_repeated_tool_calls)
        or consts.DEFAULTS.MAX_REPEATED_TOOL_CALLS

    return max_steps, max_repeats
end

local function turn_state(ctx: SessionContext): table
    if type(ctx.turn_state) ~= "table" then
        ctx.turn_state = { steps = 0, repeated_calls = 0 }
    end
    return ctx.turn_state :: table
end

local function begin_turn(ctx: SessionContext, message_id: any): table
    local state = turn_state(ctx)
    state.message_id = message_id
    state.steps = 0
    state.repeated_calls = 0
    state.last_round = nil
    state.last_round_tools = nil
    return state
end

-- Deterministic rendering of a tool call's arguments, so two rounds compare equal regardless
-- of table iteration order.
local function canonical(value: any): string
    if type(value) ~= "table" then
        return type(value) .. ":" .. tostring(value)
    end
    local keys = {}
    for key in pairs(value) do
        keys[#keys + 1] = key
    end
    table.sort(keys, function(a, b)
        return tostring(a) < tostring(b)
    end)
    local parts = {}
    for _, key in ipairs(keys) do
        parts[#parts + 1] = tostring(key) .. "=" .. canonical(value[key])
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

-- Records one executed tool round (the tool_caller results map; only each entry's tool_call
-- is read) against the current turn and returns how many times in a row a round with these
-- exact tools and arguments has now occurred.
function message_handlers.note_tool_round(ctx: SessionContext, results: any): number
    local state = turn_state(ctx)
    local parts = {}
    local tools = {}
    for _, entry in pairs(results or {}) do
        local call = (type(entry) == "table" and entry.tool_call) or {}
        parts[#parts + 1] = tostring(call.name) .. "(" .. canonical(call.args) .. ")"
        tools[tostring(call.name)] = true
    end
    local count: number = tonumber(state.repeated_calls) or 0
    if #parts == 0 then
        return count
    end

    table.sort(parts)
    local fingerprint = table.concat(parts, "|")
    if fingerprint == state.last_round then
        count = count + 1
    else
        count = 1
    end
    state.repeated_calls = count
    state.last_round = fingerprint

    local names = {}
    for name in pairs(tools) do
        names[#names + 1] = name
    end
    table.sort(names)
    state.last_round_tools = table.concat(names, ", ")

    return count
end

local function stop_turn(ctx: SessionContext, op: any, agent: any, state: table, reason: string, detail: string): table
    local notice = "Turn stopped: " .. detail
    ctx.writer:add_message(consts.MSG_TYPE.SYSTEM, notice, {
        system_action = consts.SYSTEM_ACTIONS.TURN_LIMIT,
        reason = reason,
        steps = state.steps - 1,
        repeated_calls = state.repeated_calls,
        source_id = op.message_id
    })
    ctx.writer:add_message(consts.MSG_TYPE.DEVELOPER,
        "The previous turn was stopped by the session: " .. detail
            .. " Do not resume that loop when the conversation continues. Report what was done, "
            .. "what failed and why, and ask the user how to proceed.",
        { system_action = consts.SYSTEM_ACTIONS.TURN_LIMIT })
    ctx.upstream:session_error("turn_limit_reached", notice)

    local _, lifecycle_err = apply_lifecycle(ctx, lifecycle_runtime.PHASE.AFTER_STEP, agent, {
        reason = reason,
        refs = {
            message_id = op.message_id,
            request_id = op.request_id
        },
        outcome = {
            state = OUTCOME.COMPLETED,
            reason = REASON.MAX_ITERATIONS_REACHED
        }
    })
    if lifecycle_err then
        ctx.upstream:message_error(op.message_id, consts.ERROR_CODES.AGENT_ERROR, lifecycle_err)
    end

    return {
        message_id = op.message_id,
        completed = true,
        stopped = reason,
        next_ops = {}
    }
end

function message_handlers.handle_message(ctx, op)
    local data = type(op.data) == "table" and op.data or {}
    local msg_type = data.type
    if msg_type ~= consts.MSG_TYPE.DEVELOPER and msg_type ~= consts.MSG_TYPE.SYSTEM then
        msg_type = consts.MSG_TYPE.USER
    end
    local message_id, err = ctx.writer:add_message(msg_type, data.text or "", {
        message_id = op.message_id, file_uuids = data.file_uuids
    })
    if err then return nil, err end
    if msg_type == consts.MSG_TYPE.USER then
        return { message_id = message_id, next_ops = {{
            type = consts.OP_TYPE.AGENT_STEP, message_id = message_id,
            request_id = op.request_id, from_user = true
        }} }
    end
    return { message_id = message_id, completed = true }
end

function message_handlers.agent_step(ctx, op)
    local builder, err = prompt_builder.from_session(ctx.reader)
    if not builder then
        return nil, "Failed to build prompt: " .. err
    end

    if not ctx.config.agent_id or ctx.config.agent_id == "" then
        return nil, "No agent configured for this session"
    end

    local agent, agent_err = ctx.agent_ctx:load_agent(ctx.config.agent_id, {
        model = ctx.config.model
    })
    if not agent then
        return nil, "Failed to load agent: " .. (agent_err or "unknown error")
    end

    -- Loop guards (see above). Every step of the turn is counted, including the one that
    -- answers the user's message, which also starts a fresh count.
    local state = op.from_user and begin_turn(ctx, op.message_id) or turn_state(ctx)
    state.steps = state.steps + 1
    local max_steps, max_repeats = loop_limits(ctx, agent)
    if max_steps > 0 and state.steps > max_steps then
        return stop_turn(ctx, op, agent, state, "max_iterations", string.format(
            "%d agent steps without a final answer (limit %d).", state.steps - 1, max_steps))
    end
    if max_repeats > 0 and state.repeated_calls >= max_repeats then
        return stop_turn(ctx, op, agent, state, "repeated_tool_calls", string.format(
            "the same tool round (%s) repeated %d times in a row with identical arguments (limit %d).",
            tostring(state.last_round_tools), state.repeated_calls, max_repeats))
    end

    local response_id, err = uuid.v7()
    if err then
        return nil, "Failed to generate response ID: " .. err
    end

    local session_context, ctx_err = ctx.reader:get_full_context()
    if ctx_err then
        session_context = {}
    end
    session_context = with_agent_run_context(ctx, session_context, agent_ref_from(ctx, agent))

    local activate_result, activate_err = ensure_agent_activated(ctx, agent, {
        message_id = op.message_id,
        request_id = op.request_id
    })
    if activate_err then
        return nil, activate_err
    end
    append_lifecycle_messages(builder, activate_result)

    local before_result, before_err = apply_lifecycle(ctx, lifecycle_runtime.PHASE.BEFORE_STEP, agent, {
        reason = "agent_step",
        refs = {
            message_id = op.message_id,
            request_id = op.request_id
        },
        outcome = {
            state = OUTCOME.CONTINUES,
            reason = "agent_step"
        }
    })
    if before_err then
        return nil, before_err
    end
    append_lifecycle_messages(builder, before_result)

    ctx.upstream:response_beginning(response_id, op.message_id)

    local runtime_options = {
        context = session_context
    }
    if ctx.upstream.conn_pid then
        runtime_options.stream_target = {
            reply_to = ctx.upstream.conn_pid,
            topic = ctx.upstream:get_message_topic(response_id)
        }
    end

    local result, exec_err = agent:step(builder, runtime_options)
    if exec_err then
        ctx.upstream:message_error(response_id, consts.ERROR_CODES.AGENT_ERROR, exec_err)
        return nil, exec_err
    end

    local _, after_err = apply_lifecycle(ctx, lifecycle_runtime.PHASE.AFTER_STEP, agent, {
        reason = "agent_step",
        refs = {
            message_id = op.message_id,
            response_id = response_id,
            request_id = op.request_id
        },
        outcome = outcome_from_agent_result(result)
    })
    if after_err then
        ctx.upstream:message_error(response_id, consts.ERROR_CODES.AGENT_ERROR, after_err)
        return nil, after_err
    end

    if result.truncated then
        local _, token_err = persist_token_usage(ctx, result.tokens)
        if token_err then return nil, token_err end
        if result.result and result.result ~= "" then
            local _, store_err = ctx.writer:add_message(consts.MSG_TYPE.ASSISTANT, result.result, {
                source_id = op.message_id,
                agent_id = ctx.config.agent_id,
                model = ctx.config.model,
                tokens = result.tokens,
                truncated = true
            })
            if store_err then
                return nil, store_err
            end

            ctx.upstream:send_message_update(response_id, consts.UPSTREAM_TYPES.CONTENT, {
                content = result.result,
                using_tools = false
            })
        end

        ctx.writer:add_message(consts.MSG_TYPE.DEVELOPER, (output :: any).TRUNCATION_MSG, {})

        return {
            message_id = op.message_id,
            response_id = response_id,
            completed = false,
            next_ops = {
                {
                    type = consts.OP_TYPE.AGENT_STEP,
                    message_id = op.message_id,
                    request_id = op.request_id,
                    from_user = false
                }
            }
        }
    end

    local unified_tool_calls = {}
    if result.tool_calls and #result.tool_calls > 0 then
        for _, tool_call in ipairs(result.tool_calls) do
            table.insert(unified_tool_calls, tool_call)
        end
    end
    if result.delegate_calls and #result.delegate_calls > 0 then
        for _, delegate_call in ipairs(result.delegate_calls) do
            if ctx.config.delegation_func_id then
                delegate_call.registry_id = ctx.config.delegation_func_id
                table.insert(unified_tool_calls, delegate_call)
            end
        end
    end

    local prepared_caller = nil
    local validated_tools = nil
    local validate_err = nil
    if #unified_tool_calls > 0 then
        prepared_caller = tool_caller.new()
        local agent_ref = agent_ref_from(ctx, agent)
        local host: ToolWrapperHostRef = {
            kind = "session",
            session_id = ctx.session_id
        }
        local wrapper_context: ToolWrapperExecutionContext = {
            host = host,
            agent = agent_ref,
            run_context = {
                contract = RUN_CONTEXT_CONTRACT,
                binding = (ctx.config and ctx.config.run_context_binding) or DEFAULT_RUN_CONTEXT_BINDING,
                host = host,
                agent = agent_ref
            }
        }
        prepared_caller:set_tool_wrappers(agent.tool_wrappers or {})
        prepared_caller:set_wrapper_context(wrapper_context)
        validated_tools, validate_err = prepared_caller:validate(unified_tool_calls)
        if validate_err then
            ctx.upstream:message_error(response_id, consts.ERROR_CODES.AGENT_ERROR, validate_err)
            return nil, validate_err
        end
        unified_tool_calls = prepared_caller.last_tool_calls or unified_tool_calls
    end

    local seen_call_ids = {}
    for _, call in ipairs(unified_tool_calls) do
        if type(call.id) ~= "string" or not string.find(call.id, "%S") then
            local id_err = "Tool call ID must be a non-empty string"
            ctx.upstream:message_error(response_id, consts.ERROR_CODES.AGENT_ERROR, id_err)
            return nil, id_err
        end
        if seen_call_ids[call.id] then
            local duplicate_err = "Duplicate tool call ID: " .. tostring(call.id)
            ctx.upstream:message_error(response_id, consts.ERROR_CODES.AGENT_ERROR, duplicate_err)
            return nil, duplicate_err
        end
        seen_call_ids[call.id] = true
    end
    for call_id in pairs(validated_tools or {}) do
        if not seen_call_ids[call_id] then
            local id_err = "Validated tool call ID is missing from wrapper output: " .. tostring(call_id)
            ctx.upstream:message_error(response_id, consts.ERROR_CODES.AGENT_ERROR, id_err)
            return nil, id_err
        end
    end

    local _, token_err = persist_token_usage(ctx, result.tokens)
    if token_err then return nil, token_err end

    local assistant_message_id: any = nil

    if (result.result and result.result ~= "") or (#unified_tool_calls > 0) or result.memory_recall then
        local current_checkpoint_id = ctx.reader:get_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID)

        local metadata = {
            source_id = op.message_id,
            agent_id = ctx.config.agent_id,
            model = ctx.config.model,
            tokens = result.tokens,
            checkpoint_id = current_checkpoint_id
        }

        if result.memory_recall then
            metadata.memory_ids = result.memory_recall.memory_ids
            metadata.memory_count = result.memory_recall.count
        end

        if result.metadata then
            for k, v in pairs(result.metadata) do
                metadata[k] = v
            end
        end

        local intents = {}
        for _, call in ipairs(unified_tool_calls) do
            local call_type = consts.MSG_TYPE.FUNCTION
            if ctx.config.delegation_func_id
                and call.registry_id == ctx.config.delegation_func_id then
                call_type = consts.MSG_TYPE.DELEGATION
            elseif type(call.registry_id) == "string" then
                local validated = validated_tools and validated_tools[call.id]
                local schema = tools.get_tool_schema(call.registry_id :: string)
                if (call.meta and call.meta.private)
                    or (validated and validated.meta and validated.meta.private)
                    or (schema and schema.meta and schema.meta.private) then
                    call_type = consts.MSG_TYPE.PRIVATE_FUNCTION
                end
            end
            table.insert(intents, {
                id = call.id, name = call.name, arguments = call.arguments,
                registry_id = call.registry_id, provider_metadata = call.provider_metadata,
                type = call_type
            })
        end
        local stored_id, call_message_ids, store_err = ctx.writer:add_response(result.result or "", metadata, intents)
        if store_err then
            ctx.upstream:message_error(response_id, consts.ERROR_CODES.STORAGE_ERROR, store_err)
            return nil, store_err
        end
        assistant_message_id = stored_id
        result.call_message_ids = call_message_ids

        if ctx.coordinator and ctx.coordinator:stop_requested() then
            for _, call in ipairs(unified_tool_calls) do
                local _, cancel_err = ctx.writer:update_message_meta((call_message_ids :: table)[call.id], {
                    status = consts.FUNC_STATUS.CANCELLED,
                    result = "Session stopped before the call executed"
                })
                if cancel_err then return nil, cancel_err end
            end
            return { message_id = op.message_id, response_id = response_id,
                completed = true, next_ops = {} }
        end

        if result.result and result.result ~= "" then
            ctx.upstream:send_message_update(response_id, consts.UPSTREAM_TYPES.CONTENT, {
                content = result.result,
                using_tools = (#unified_tool_calls > 0)
            })
        end
    else
        ctx.upstream:invalidate_message(response_id)
    end

    if result.memory_prompt then
        local memory_metadata = {}
        if result.memory_prompt.metadata and result.memory_prompt.metadata.memory_ids then
            memory_metadata.memory_ids = result.memory_prompt.metadata.memory_ids
        end
        ctx.writer:add_message(consts.MSG_TYPE.DEVELOPER, result.memory_prompt.content, memory_metadata)
    end

    -- Separate user-facing operations from background operations
    local user_facing_ops = {}
    local background_ops = {}

    if #unified_tool_calls > 0 then
        table.insert(user_facing_ops, {
            type = consts.OP_TYPE.PROCESS_TOOLS,
            tool_calls = unified_tool_calls,
            call_message_ids = result.call_message_ids,
            tool_wrappers = agent.tool_wrappers or {},
            caller = prepared_caller,
            validated_tools = validated_tools,
            validation_error = validate_err,
            agent = {
                id = agent.id,
                model = agent.model
            },
            message_id = op.message_id,
            response_id = response_id,
            request_id = op.request_id,
            has_text_response = (result.result and result.result ~= "")
        })
    end

    if result.tokens then
        local checkpoint_anchor_id = op.message_id
        if not op.from_user and assistant_message_id then
            checkpoint_anchor_id = assistant_message_id
        end

        table.insert(background_ops, {
            type = consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS,
            tokens = result.tokens,
            agent_options = agent.agent_options or {},
            checkpoint_bindings = agent.bindings and agent.bindings.checkpoint,
            agent = {
                id = agent.id,
                model = agent.model
            },
            run_context_binding = (ctx.config and ctx.config.run_context_binding) or DEFAULT_RUN_CONTEXT_BINDING,
            message_id = op.message_id,
            checkpoint_anchor_id = checkpoint_anchor_id
        })
    end

    -- Background operations first (see above), then the user-facing tool round.
    local all_ops = {}
    for _, op_item in ipairs(background_ops) do
        table.insert(all_ops, op_item)
    end
    for _, op_item in ipairs(user_facing_ops) do
        table.insert(all_ops, op_item)
    end

    return {
        message_id = op.message_id,
        response_id = response_id,
        completed = (#user_facing_ops == 0),
        next_ops = all_ops
    }
end

function message_handlers.process_tools(ctx, op)
    if not op.tool_calls or #op.tool_calls == 0 then
        return { completed = true }
    end

    if op.cancel_only then
        for _, call in ipairs(op.tool_calls) do
            local _, err = ctx.writer:update_message_meta(op.call_message_ids[call.id], {
                status = consts.FUNC_STATUS.CANCELLED,
                result = "Session stopped before the call executed"
            })
            if err then return nil, err end
        end
        return { completed = true, next_ops = {} }
    end

    local caller = op.caller
    if not caller then
        for _, call in ipairs(op.tool_calls) do
            local _, err = ctx.writer:update_message_meta(op.call_message_ids[call.id], {
                status = consts.FUNC_STATUS.ERROR, result = "Prepared tool caller missing"
            })
            if err then return nil, err end
        end
        return { completed = true }
    end
    caller:set_strategy(tool_caller.STRATEGY.PARALLEL)

    local op_agent = op.agent
    if type(op_agent) ~= "table" then
        op_agent = nil
    end
    local fallback_agent = {
        id = string_or_nil(ctx.config and ctx.config.agent_id),
        model = string_or_nil(ctx.config and ctx.config.model)
    } :: ToolWrapperAgentRef
    local active_agent = (op_agent or fallback_agent) :: ToolWrapperAgentRef

    local validated_tools, validate_err = op.validated_tools, op.validation_error
    if validate_err and (not validated_tools or next(validated_tools) == nil) then
        for _, call in ipairs(op.tool_calls) do
            local _, update_err = ctx.writer:update_message_meta(op.call_message_ids[call.id], {
                status = consts.FUNC_STATUS.ERROR, result = "Tool validation failed: " .. validate_err
            })
            if update_err then return nil, update_err end
        end
        return { completed = true, next_ops = {} }
    end

    for call_id, tool_call in pairs(validated_tools or {}) do
        if not op.call_message_ids[call_id] then
            return nil, "Tool call intent was not stored with the assistant response: " .. call_id
        end
        tool_call.message_id = op.call_message_ids[call_id]
        if tool_call.valid and (not ctx.config.delegation_func_id
            or tool_call.registry_id ~= ctx.config.delegation_func_id)
            and not (tool_call.meta and tool_call.meta.private) then
            ctx.upstream:send_message_update(call_id, consts.UPSTREAM_TYPES.FUNCTION_CALL, {
                function_name = tool_call.name
            })
            end
    end

    local session_context, err = ctx.reader:get_full_context()
    if err then
        session_context = {}
    end
    session_context = with_agent_run_context(ctx, session_context, active_agent)

    local executed, results, execute_err = pcall(function()
        return caller:execute(session_context, validated_tools)
    end)
    if not executed then
        execute_err = tostring(results)
        results = nil
    end
    local reported_results = type(results) == "table" and results or {}
    results = {}
    for call_id, result_data in pairs(reported_results) do
        if op.call_message_ids[call_id] and type(result_data) == "table"
            and type(result_data.tool_call) == "table" then
            result_data.tool_call.message_id = op.call_message_ids[call_id]
            results[call_id] = result_data
        end
    end

    local next_ops = {}
    local function fail_remaining(start_index, reason)
        local failure = tostring(reason)
        for index = start_index, #op.tool_calls do
            local call = op.tool_calls[index]
            local _, mark_err = ctx.writer:update_message_meta(op.call_message_ids[call.id], {
                status = consts.FUNC_STATUS.ERROR,
                result = failure
            })
            if mark_err then failure = failure .. "; settlement failed: " .. tostring(mark_err) end
        end
        return nil, failure
    end

    for index, call in ipairs(op.tool_calls) do
        local call_id = call.id
        local result_data = results[call_id]
        if not result_data then
            local _, skipped_err = ctx.writer:update_message_meta(op.call_message_ids[call_id], {
                status = consts.FUNC_STATUS.ERROR,
                result = execute_err and tostring(execute_err) or "Call outcome unknown"
            })
            if skipped_err then return fail_remaining(index, skipped_err) end
        else
            local message_id = result_data.tool_call.message_id
            local is_delegation = ctx.config.delegation_func_id
                and result_data.tool_call.registry_id == ctx.config.delegation_func_id
            local is_private = result_data.tool_call.meta and result_data.tool_call.meta.private

            if result_data.error then
                local _, update_err = ctx.writer:update_message_meta(message_id, {
                    result = tostring(result_data.error),
                    status = consts.FUNC_STATUS.ERROR,
                    function_name = result_data.tool_call.name,
                    call_id = call_id,
                    registry_id = result_data.tool_call.registry_id
                })
                if update_err then return fail_remaining(index, update_err) end

                if not is_delegation and not is_private then
                    ctx.upstream:send_message_update(call_id, consts.UPSTREAM_TYPES.FUNCTION_ERROR, {
                        call_id = call_id,
                        function_name = result_data.tool_call.name,
                        error = "Function execution failed"
                    })
                end
            else
                local tool_result = result_data.result

                local control = not is_delegation and type(tool_result) == "table"
                    and tool_result._control or nil
                if control then
                    local _, control_err = ctx.writer:update_message_meta(message_id, {
                        control_operations = control
                    })
                    if control_err then return fail_remaining(index, control_err) end
                    tool_result._control = nil
                end

                local _, update_err = ctx.writer:update_message_meta(message_id, {
                    result = tool_result,
                    status = consts.FUNC_STATUS.SUCCESS,
                    function_name = result_data.tool_call.name,
                    call_id = call_id,
                    registry_id = result_data.tool_call.registry_id
                })
                if update_err then return fail_remaining(index, update_err) end

                if control then
                    local effects = {}
                    if control.artifacts and #control.artifacts > 0 then
                        table.insert(effects, { control_handlers.control_artifacts,
                            { artifacts = control.artifacts } })
                    end
                    if control.context then
                        table.insert(effects, { control_handlers.control_context,
                            { context_operations = control.context } })
                    end
                    if control.memory then
                        table.insert(effects, { control_handlers.control_memory,
                            { memory_operations = control.memory } })
                    end
                    if control.config then
                        table.insert(effects, { control_handlers.control_config,
                            { config_changes = control.config } })
                    end
                    for _, effect in ipairs(effects) do
                        local ran, applied, effect_err = pcall(effect[1], ctx, effect[2])
                        if not ran or effect_err or not applied then
                            local reason = ran and (effect_err or "Control effect failed") or applied
                            return fail_remaining(index, reason)
                        end
                    end
                end

                if not is_delegation and not is_private then
                    ctx.upstream:send_message_update(call_id, consts.UPSTREAM_TYPES.FUNCTION_SUCCESS, {
                        call_id = call_id,
                        function_name = result_data.tool_call.name
                    })
                end
            end
        end
    end

    message_handlers.note_tool_round(ctx, results)

    if #op.tool_calls > 0 then
        table.insert(next_ops, {
            type = consts.OP_TYPE.AGENT_CONTINUE,
            message_id = op.message_id,
            request_id = op.request_id
        })
    end

    return {
        completed = (#next_ops == 0),
        next_ops = next_ops
    }
end

function message_handlers.agent_continue(ctx, op)
    return message_handlers.agent_step(ctx, {
        message_id = op.message_id,
        request_id = op.request_id,
        from_user = false
    })
end

return message_handlers
