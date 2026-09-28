local json = require("json")
local uuid = require("uuid")
local consts = require("consts")
local input_metadata = require("input_metadata")
local prompt_builder = require("prompt_builder")
local tool_caller = require("tool_caller")
local output = require("output")
local lifecycle_runtime = require("lifecycle_runtime")
local input_policy = require("input_policy")

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
    stop_requested: boolean?,
    status: string?,
    current_agent: any?,
    request_input_policy: any?,
    turn_generation: number?,
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

local message_handlers = {
    _prompt_builder = nil :: any,
    _tool_caller = nil :: any,
    _lifecycle_runtime = nil :: any,
}

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

    return (message_handlers._lifecycle_runtime or lifecycle_runtime).apply(agent.bindings, payload)
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
    if ctx.current_agent then return ctx.current_agent end
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
    ctx.turn_state = { message_id = message_id, steps = 0, repeated_calls = 0, active = true }
    return ctx.turn_state :: table
end

local function all_messages(ctx)
    if type(ctx.reader.list_all_messages) == "function" then return ctx.reader:list_all_messages() end
    return ctx.reader:messages():all()
end

local function prepare_pending_inputs(ctx, new_user_id)
    local messages, read_err = all_messages(ctx)
    if not messages then return nil, read_err or "Failed to read pending inputs" end
    local pending, anchor_id = {}, nil
    for _, message in ipairs(messages) do
        local input = message.metadata and message.metadata.input
        if input ~= nil then
            if not input_metadata.validate(message) then
                return nil, "Malformed steering metadata on message " .. tostring(message.message_id)
            end
            if input.state == "pending" then pending[#pending + 1] = message end
        elseif message.message_id ~= new_user_id then
            anchor_id = message.message_id
        end
    end
    table.sort(pending, function(a, b)
        if a.date ~= b.date then return tostring(a.date or "") < tostring(b.date or "") end
        return tostring(a.message_id) < tostring(b.message_id)
    end)
    local updates = {}
    for _, message in ipairs(pending) do
        updates[#updates + 1] = {
            message_id = message.message_id,
            metadata = { input = { state = "applied", after_message_id = anchor_id } },
        }
    end
    return updates
end

local function persist_pending_inputs(ctx, updates, expected_revision)
    if #updates == 0 then return 0 end
    if type(ctx.writer.apply_inputs) ~= "function" then
        return nil, "Session writer does not support atomic input application"
    end
    local ok, err = ctx.writer:apply_inputs(updates, expected_revision)
    if not ok then return nil, err end
    return #updates
end

local function publish_applied_inputs(ctx, updates)
    for _, update in ipairs(updates) do
        ctx.upstream:send_message_update(update.message_id, consts.UPSTREAM_TYPES.UPDATE, {
            message_id = update.message_id, input = update.metadata.input,
        })
    end
    return #updates
end

local function commit_pending_inputs(ctx, updates)
    local expected_revision = tonumber(ctx.interaction and ctx.interaction.revision) or 0
    local count, err = persist_pending_inputs(ctx, updates, expected_revision)
    if not count then return nil, err end
    publish_applied_inputs(ctx, updates)
    return count
end

function message_handlers.apply_pending_inputs(ctx, new_user_id)
    local updates, err = prepare_pending_inputs(ctx, new_user_id)
    if not updates then return nil, err end
    return commit_pending_inputs(ctx, updates)
end

-- Called only by the session inbox after its command bus becomes empty.
function message_handlers.finish_turn(ctx)
    local state = ctx.turn_state
    if state and state.active and not ctx.stop_requested and not state.failed then
        local pending, err = ctx.reader:list_pending_inputs()
        if not pending then return nil, err or "Failed to read pending input" end
        if #pending > 0 then
            return { completed = false, next_ops = { {
                type = consts.OP_TYPE.AGENT_STEP, message_id = state.message_id,
                request_id = state.request_id, from_user = false,
            } } }
        end
    end
    local candidate_state = nil
    if state then
        candidate_state = {}
        for key, value in pairs(state) do candidate_state[key] = value end
        candidate_state.active = false
        candidate_state.input_policy = nil
        -- A failed runtime must remain failed at the queue-empty boundary. The
        -- previous code cleared this marker and persisted idle, allowing a
        -- failed control operation to look recoverable without an explicit
        -- recovery path.
        local failed = ctx.status == consts.STATUS.FAILED
        candidate_state.failed = failed and true or nil
        candidate_state.handoff = nil
        candidate_state.stopped = nil
    end
    local target_status
    if ctx.status == consts.STATUS.FAILED then
        target_status = consts.STATUS.FAILED
    else
        target_status = ctx.status ~= "finishing" and consts.STATUS.IDLE or ctx.status
    end
    local candidate = {
        config = ctx.config,
        turn_state = candidate_state,
        status = target_status,
        stop_requested = ctx.stop_requested,
        current_agent = current_agent(ctx),
        input_policy_revision = ctx.input_policy_revision,
        interaction = ctx.interaction,
    }
    local interaction = input_policy.snapshot(ctx, candidate, candidate.current_agent)
    local ok, err = ctx.writer:update_meta({ status = target_status, meta = { interaction = interaction } })
    if not ok then
        return nil, err or "Failed to persist turn completion"
    end
    ctx.turn_state = candidate_state
    ctx.status = target_status
    input_policy.accept_committed(ctx, interaction)
    return { completed = true, next_ops = {} }
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
    state.failed = true
    input_policy.clear_turn(ctx)
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
    local active = ctx.turn_state and ctx.turn_state.active == true or false
    local interaction = input_policy.resolve(ctx, current_agent(ctx))
    if not interaction.can_send then
        if op.request_id then ctx.upstream:command_error(op.request_id, "INPUT_BLOCKED",
            "Session is not accepting messages right now") end
        return { completed = true }
    end

    local input = active and { state = "pending" } or nil
    local metadata = { file_uuids = data.file_uuids }
    if input then metadata.input = input end
    local message_id, err
    if active then
        message_id, err = ctx.writer:add_message(consts.MSG_TYPE.USER, data.text or "", metadata)
    else
        if type(ctx.writer.admit_message) ~= "function" then
            return nil, "Session writer does not support atomic admission"
        end
        local next_turn = { active = true, steps = 0, repeated_calls = 0 }
        local candidate = {
            config = ctx.config,
            turn_state = next_turn,
            status = consts.STATUS.RUNNING,
            stop_requested = false,
            current_agent = current_agent(ctx),
            input_policy_revision = ctx.input_policy_revision,
            interaction = ctx.interaction,
        }
        local next_interaction = input_policy.snapshot(ctx, candidate, candidate.current_agent)
        message_id, err = ctx.writer:admit_message(consts.MSG_TYPE.USER, data.text or "", metadata, {
            status = consts.STATUS.RUNNING,
            meta = { interaction = next_interaction },
        })
        if message_id then
            next_turn.message_id = message_id
            ctx.turn_generation = (tonumber(ctx.turn_generation) or 0) + 1
            ctx.turn_state = next_turn
            ctx.stop_requested = false
            ctx.status = consts.STATUS.RUNNING
            input_policy.accept_committed(ctx, next_interaction)
        end
    end
    if not message_id then
        return nil, err or "Failed to persist input"
    end

    ctx.upstream:message_received(message_id, data.text or "", data.file_uuids, input, op.request_id)
    return {
        message_id = message_id, completed = active,
        next_ops = active and {} or { { type = consts.OP_TYPE.AGENT_STEP, message_id = message_id,
            from_user = true } },
    }
end

local function record_cancelled_tools(ctx, calls)
    for _, call in ipairs(calls or {}) do
        local arguments = call.arguments or call.args or {}
        if type(arguments) ~= "string" then
            local encoded, err = json.encode(arguments)
            if not encoded then return nil, err end
            arguments = encoded
        end
        -- Preserve the call/result pair in prompt history without announcing
        -- execution or exposing a possibly private tool in the chat.
        local id, err = ctx.writer:add_message(consts.MSG_TYPE.PRIVATE_FUNCTION, arguments, {
            call_id = call.id, function_name = call.name, registry_id = call.registry_id,
            provider_metadata = call.provider_metadata, status = consts.FUNC_STATUS.ERROR,
            result = "Cancelled before execution because the user stopped the turn.",
        })
        if not id then return nil, err or "Failed to record cancelled tool" end
    end
    return true
end

function message_handlers.agent_step(ctx: any, op: any)
    if ctx.stop_requested or (ctx.turn_state and (ctx.turn_state.failed or ctx.turn_state.handoff)) then
        if ctx.turn_state then
            ctx.turn_state.stopped = true
            ctx.turn_state.input_policy = nil
        end
        return { completed = true, next_ops = {} }
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
    local state = ctx.turn_state
    if not state or state.active == false or (op.from_user and state.message_id ~= op.message_id) then
        state = begin_turn((ctx :: SessionContext), op.message_id)
    end
    ctx.current_agent = agent
    state.steps = state.steps + 1
    local max_steps, max_repeats = loop_limits((ctx :: SessionContext), agent)
    if max_steps > 0 and state.steps > max_steps then
        return stop_turn((ctx :: SessionContext), op, agent, state, "max_iterations", string.format(
            "%d agent steps without a final answer (limit %d).", state.steps - 1, max_steps))
    end
    if max_repeats > 0 and state.repeated_calls >= max_repeats then
        return stop_turn((ctx :: SessionContext), op, agent, state, "repeated_tool_calls", string.format(
            "the same tool round (%s) repeated %d times in a row with identical arguments (limit %d).",
            tostring(state.last_round_tools), state.repeated_calls, max_repeats))
    end

    -- Prepare the next prompt without consuming input. Load/build/lifecycle
    -- failures leave the durable pending rows available for a later user turn.
    local input_updates, input_err = prepare_pending_inputs(ctx, op.from_user and op.message_id or nil)
    if not input_updates then return nil, input_err end
    local builder, build_err = (message_handlers._prompt_builder or prompt_builder).from_session(ctx.reader, {
        input_overrides = input_updates,
    })
    if not builder then return nil, "Failed to build prompt: " .. tostring(build_err) end

    local response_id, err = uuid.v7()
    if err then
        return nil, "Failed to generate response ID: " .. err
    end

    local session_context, ctx_err = ctx.reader:get_full_context()
    if ctx_err then
        return nil, "Failed to load session context: " .. tostring(ctx_err)
    end
    session_context = with_agent_run_context((ctx :: SessionContext), session_context, agent_ref_from(ctx, agent))

    local activate_result, activate_err = ensure_agent_activated((ctx :: SessionContext), agent, {
        message_id = op.message_id,
        request_id = op.request_id
    })
    if activate_err then
        return nil, activate_err
    end
    append_lifecycle_messages(builder, activate_result)

    local before_result, before_err = apply_lifecycle((ctx :: SessionContext), lifecycle_runtime.PHASE.BEFORE_STEP, agent, {
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

    -- Stop may race this database transaction. It either commits first and
    -- invalidates the revision, or commits after this write and restores the
    -- same batch in its own transaction. The gate prevents provider dispatch
    -- until that Stop transaction has a definite result.
    if ctx.stop_requested or (ctx.turn_state and (ctx.turn_state.failed or ctx.turn_state.handoff)) then
        return { completed = true, next_ops = {} }
    end
    ctx.input_apply_batch = input_updates
    local expected_revision = tonumber(ctx.interaction and ctx.interaction.revision) or 0
    local _, input_err = persist_pending_inputs(ctx, input_updates, expected_revision)
    local stop_gate = ctx.stop_commit_channel
    if stop_gate then
        stop_gate:receive()
        if ctx.stop_commit_channel == stop_gate then ctx.stop_commit_channel = nil end
    end
    ctx.input_apply_batch = nil
    if input_err then
        if ctx.stop_requested then return { completed = true, next_ops = {} } end
        return nil, input_err
    end
    if ctx.stop_requested or (ctx.turn_state and (ctx.turn_state.failed or ctx.turn_state.handoff)) then
        return { completed = true, next_ops = {} }
    end
    publish_applied_inputs(ctx, input_updates)
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

    local _, after_err = apply_lifecycle((ctx :: SessionContext), lifecycle_runtime.PHASE.AFTER_STEP, agent, {
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

    if result.tokens and type(result.tokens) == "table" then
        local session_data = ctx.reader:state()
        local current_meta = session_data.meta or {}

        if not current_meta.tokens or type(current_meta.tokens) ~= "table" then
            current_meta.tokens = {}
        end

        for token_key, token_value in pairs(result.tokens) do
            if type(token_value) == "number" then
                current_meta.tokens[token_key] = (current_meta.tokens[token_key] or 0) + token_value
            end
        end

        ctx.writer:update_meta({ meta = { tokens = current_meta.tokens } })
    end

    if result.truncated and not ctx.stop_requested then
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

        local stored_id, store_err = ctx.writer:add_message(consts.MSG_TYPE.ASSISTANT, result.result or "", metadata)
        if store_err then
            ctx.upstream:message_error(response_id, consts.ERROR_CODES.STORAGE_ERROR, store_err)
            return nil, store_err
        end
        assistant_message_id = stored_id

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

    local turn_blocked = ctx.stop_requested
        or (ctx.turn_state and (ctx.turn_state.failed or ctx.turn_state.handoff))
    if turn_blocked and #unified_tool_calls > 0 then
        local saved, cancel_err = record_cancelled_tools(ctx, unified_tool_calls)
        if not saved then return nil, cancel_err end
    end

    -- Separate user-facing operations from background operations
    local user_facing_ops = {}
    local background_ops = {}

    if #unified_tool_calls > 0 and not turn_blocked then
        table.insert(user_facing_ops, {
            type = consts.OP_TYPE.PROCESS_TOOLS,
            tool_calls = unified_tool_calls,
            tool_wrappers = agent.tool_wrappers or {},
            agent = {
                id = agent.id,
                model = agent.model,
                agent_options = agent.agent_options,
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

    -- Finalization and pending steering are serialized by session.lua's
    -- queue-empty boundary. Keeping the turn active here prevents a user
    -- admission from racing the final response before that boundary runs.

    return {
        message_id = op.message_id,
        response_id = response_id,
        completed = (#user_facing_ops == 0),
        next_ops = all_ops
    }
end

function message_handlers.process_tools(ctx: any, op: any)
    local turn_blocked = ctx.stop_requested
        or (ctx.turn_state and (ctx.turn_state.failed or ctx.turn_state.handoff))
    if turn_blocked then
        local saved, err = record_cancelled_tools(ctx, op.tool_calls)
        if not saved then return nil, err end
        return { completed = true, next_ops = {} }
    end
    if not op.tool_calls or #op.tool_calls == 0 then
        return { completed = true }
    end

    local caller = (message_handlers._tool_caller or tool_caller).new()
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

    local wrapper_context: ToolWrapperExecutionContext = {
        host = {
            kind = "session",
            session_id = ctx.session_id :: string
        },
        agent = active_agent,
        run_context = {
            contract = RUN_CONTEXT_CONTRACT,
            binding = (ctx.config and ctx.config.run_context_binding) or DEFAULT_RUN_CONTEXT_BINDING,
            host = {
                kind = "session",
                session_id = ctx.session_id
            },
            agent = active_agent
        }
    }

    if type(caller.set_tool_wrappers) == "function" then
        caller:set_tool_wrappers(op.tool_wrappers or {})
    end
    if type(caller.set_wrapper_context) == "function" then
        caller:set_wrapper_context(wrapper_context)
    end

    local validated_tools, validate_err = caller:validate(op.tool_calls)
    if validate_err and not validated_tools then
        return nil, "Tool validation failed: " .. validate_err
    end

    local ordered_ids, included = {}, {}
    for _, call in ipairs(op.tool_calls) do
        if call.id and validated_tools[call.id] and not included[call.id] then
            ordered_ids[#ordered_ids + 1], included[call.id] = call.id, true
        end
    end
    local remaining = {}
    for id in pairs(validated_tools) do
        if not included[id] then remaining[#remaining + 1] = id end
    end
    table.sort(remaining)
    for _, id in ipairs(remaining) do ordered_ids[#ordered_ids + 1] = id end

    for _, call_id in ipairs(ordered_ids) do
        local tool_call = validated_tools[call_id]
        do
            local message_type = consts.MSG_TYPE.FUNCTION
            local send_upstream = true

            if tool_call.registry_id == ctx.config.delegation_func_id then
                message_type = consts.MSG_TYPE.DELEGATION
                send_upstream = false
            elseif tool_call.meta and tool_call.meta.private then
                message_type = consts.MSG_TYPE.PRIVATE_FUNCTION
                send_upstream = false
            end

            local message_id, err = ctx.writer:add_message(message_type, json.encode(tool_call.args), {
                call_id = call_id,
                function_name = tool_call.name,
                registry_id = tool_call.registry_id,
                status = consts.FUNC_STATUS.PENDING,
                provider_metadata = tool_call.provider_metadata
            })

            if err or not message_id then return nil, err or "Failed to persist tool call" end
            if not err then
                tool_call.message_id = message_id

                if send_upstream then
                    ctx.upstream:send_message_update(call_id, consts.UPSTREAM_TYPES.FUNCTION_CALL, {
                        function_name = tool_call.name
                    })
                end
            end
        end
    end

    local session_context, err = ctx.reader:get_full_context()
    if err then
        session_context = {}
    end
    session_context = with_agent_run_context(ctx :: SessionContext, session_context, active_agent)

    local results = caller:execute(session_context, validated_tools)

    local next_ops = {}
    local control_ops = {}

    for _, call_id in ipairs(ordered_ids) do
        local result_data = results[call_id]
        if not result_data then return nil, "Tool batch returned no result for " .. tostring(call_id) end
        local tool_result = result_data.result
        if not result_data.error and type(tool_result) == "table" and type(tool_result._control) == "table" then
            local control = tool_result._control
            local request = nil
            if type(control.config) == "table" then request = control.config.input_policy end
            if request ~= nil and request ~= false then
                local resolved, policy_err
                if type(ctx.request_input_policy) == "function" then
                    resolved, policy_err = ctx.request_input_policy(request, op.agent or current_agent(ctx))
                else
                    resolved, policy_err = input_policy.apply_request(ctx, request, op.agent or current_agent(ctx))
                end
                if not resolved then
                    result_data.error = policy_err or "Input policy change failed"
                else
                    control.config.input_policy = nil
                    if next(control.config) == nil then control.config = nil end
                    tool_result.interaction = resolved
                end
            elseif request == false then
                result_data.error = "Input policy request must be an object"
            end
        end
        local message_id = result_data.tool_call.message_id
        local is_delegation = result_data.tool_call.registry_id == ctx.config.delegation_func_id
        local is_private = result_data.tool_call.meta and result_data.tool_call.meta.private

        if result_data.error then
            local saved, save_err = ctx.writer:update_message_meta(message_id, {
                result = tostring(result_data.error),
                status = consts.FUNC_STATUS.ERROR,
                function_name = result_data.tool_call.name,
                call_id = call_id,
                registry_id = result_data.tool_call.registry_id
            })
            if not saved then return nil, save_err or "Failed to persist tool error" end

            if not is_delegation and not is_private then
                ctx.upstream:send_message_update(call_id, consts.UPSTREAM_TYPES.FUNCTION_ERROR, {
                    call_id = call_id,
                    function_name = result_data.tool_call.name,
                    error = "Function execution failed"
                })
            end
        else
            local tool_result = result_data.result

            if not is_delegation and tool_result and type(tool_result) == "table" and tool_result._control then
                local saved, save_err = ctx.writer:update_message_meta(message_id, {
                    control_operations = tool_result._control
                })
                if not saved then return nil, save_err or "Failed to persist tool controls" end
            end

            if not is_delegation and tool_result and type(tool_result) == "table" and tool_result._control then
                local control = tool_result._control

                if control.artifacts and #control.artifacts > 0 then
                    table.insert(control_ops, {
                        type = consts.OP_TYPE.CONTROL_ARTIFACTS,
                        artifacts = control.artifacts
                    })
                end

                if control.context then
                    table.insert(control_ops, {
                        type = consts.OP_TYPE.CONTROL_CONTEXT,
                        context_operations = control.context
                    })
                end

                if control.memory then
                    table.insert(control_ops, {
                        type = consts.OP_TYPE.CONTROL_MEMORY,
                        memory_operations = control.memory
                    })
                end

                if control.config then
                    table.insert(control_ops, {
                        type = consts.OP_TYPE.CONTROL_CONFIG,
                        config_changes = control.config
                    })
                end

                tool_result._control = nil
            end

            local saved, save_err = ctx.writer:update_message_meta(message_id, {
                result = tool_result,
                status = consts.FUNC_STATUS.SUCCESS,
                function_name = result_data.tool_call.name,
                call_id = call_id,
                registry_id = result_data.tool_call.registry_id
            })
            if not saved then return nil, save_err or "Failed to persist tool result" end

            if not is_delegation and not is_private then
                ctx.upstream:send_message_update(call_id, consts.UPSTREAM_TYPES.FUNCTION_SUCCESS, {
                    call_id = call_id,
                    function_name = result_data.tool_call.name
                })
            end
        end
    end

    message_handlers.note_tool_round(ctx :: SessionContext, results)

    for _, control_op in ipairs(control_ops) do
        table.insert(next_ops, control_op)
    end

    turn_blocked = ctx.stop_requested
        or (ctx.turn_state and (ctx.turn_state.failed or ctx.turn_state.handoff))
    if #op.tool_calls > 0 and not turn_blocked then
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
