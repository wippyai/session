local json = require("json")
local uuid = require("uuid")
local hash = require("hash")
local consts = require("consts")
local input_metadata = require("input_metadata")
local input_policy = require("input_policy")
local prompt_builder = require("prompt_builder")
local context_attachments = require("context_attachments")
local tool_caller = require("tool_caller")
local output = require("output")
local lifecycle_runtime = require("lifecycle_runtime")
local tools = require("tools")
local control_handlers = require("control_handlers")

type SessionContext = {
    session_id: string,
    controller_pid: string,
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
    interaction: any?,
    stop_commit_channel: any?,
    input_apply_batch: any?,
    activate_attention_turn: any?,
    prepare_attention_prompt: any?,
    set_attention_context: any?,
}

type AttentionToolContext = {
    session_id: string?,
    controller_pid: string?,
    config: {[string]: any}?,
    agent_ctx: any?,
    set_attention_context: any?,
    issue_attention_control: any?,
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
    _lifecycle_runtime = nil :: any,
}
message_handlers._context_staging = require('context_staging_repo')

message_handlers._authorize_file = function(file_uuid, actor_id, session_id)
    return prompt_builder._authorize_file(file_uuid, actor_id, session_id)
end

function message_handlers.context_transport_capabilities(capabilities_version)
    if capabilities_version ~= nil and capabilities_version ~= 1 then return nil, 'INVALID_CAPABILITIES_VERSION' end
    local result = { context_attachments_transport = { version = 1, staging = true, max_context_bytes = 32768 } }
    if capabilities_version == 1 then result.context_attachments_capabilities = context_attachments.capabilities() end
    return result
end

local function reject_transport(ctx, op, code)
    if op.request_id then ctx.upstream:command_error(op.request_id, code, 'Context transport request rejected') end
    return { completed = true, rejected = true, error = code }
end

local function reject_file_references(ctx, op)
    local code = consts.ERROR_CODES.INVALID_FILE_REFERENCES
    if op.request_id then
        ctx.upstream:command_error(op.request_id, code, 'One or more attached files are unavailable')
    end
    return { completed = true, rejected = true, error = code }
end

local function validate_file_references(file_uuids, actor_id, session_id)
    if file_uuids == nil then return true end
    if type(file_uuids) ~= 'table' then return false end

    local length = #file_uuids
    local key_count = 0
    for key, _ in pairs(file_uuids) do
        key_count = key_count + 1
        if type(key) ~= 'number' or key % 1 ~= 0 or key < 1 or key > length then
            return false
        end
    end
    if key_count ~= length then return false end

    local seen = {}
    for index = 1, length do
        local file_uuid = file_uuids[index]
        if type(file_uuid) ~= 'string' or file_uuid == '' or seen[file_uuid] then
            return false
        end
        local ok, authorized = pcall(message_handlers._authorize_file, file_uuid, actor_id, session_id)
        if not ok or authorized ~= true then return false end
        seen[file_uuid] = true
    end
    return true
end

message_handlers._authorize_visual = function(request)
    return prompt_builder._authorize_visual(request)
end

message_handlers._resolve_visual = function(request)
    return prompt_builder._resolve_visual(request)
end

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
    local _, err = ctx.writer:update_meta({ meta = { tokens = current_meta.tokens } })
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

local function current_agent(ctx: AttentionToolContext): any?
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
        local previous_agent = state.active_agent or current_agent(ctx)
        if previous_agent then
            local _, deactivate_err = apply_lifecycle(ctx, lifecycle_runtime.PHASE.DEACTIVATE, previous_agent, {
                reason = REASON.AGENT_SWITCH,
                outcome = {
                    state = OUTCOME.CONTINUES,
                    reason = REASON.AGENT_SWITCH
                }
            })
            if deactivate_err then
                return nil, deactivate_err
            end
        end

        state.active_agent_id = nil
        state.active_model = nil
        state.active_agent = nil
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
    state.active = true
    return state
end

local function is_turn_blocked(ctx: any): boolean
    local state = ctx.turn_state
    return ctx.stop_requested == true
        or (ctx.coordinator and ctx.coordinator:stop_requested())
        or (state and (state.failed or state.handoff)) or false
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
        local metadata = type(message.metadata) == "table" and message.metadata or nil
        local input = metadata and metadata.input
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
    if state and state.active and not is_turn_blocked(ctx) then
        local pending, err = ctx.reader:list_pending_inputs()
        if not pending then return nil, err or "Failed to read pending input" end
        if #pending > 0 then
            return { completed = false, next_ops = { {
                type = consts.OP_TYPE.AGENT_STEP, message_id = state.message_id,
                request_id = state.request_id, from_user = false,
                ui_action_runtime = state.ui_action_runtime,
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

local function error_text(err: any): string
    if type(err) == "table" and type(err.message) == "string" then
        return err.message
    end
    return tostring(err)
end

-- Ends only the current turn after an agent, provider, or configuration failure; the
-- session stays open and accepts the next message. Use it only before add_response:
-- after that the turn has stored tool intents, and failures must stay fatal so the
-- command bus settles them.
-- opts.after_step: BEFORE_STEP ran and AFTER_STEP has not, so close the step as failed.
-- opts.tokens: usage reported by a step that did run.
local function fail_turn(ctx: SessionContext, op: any, agent: any, response_id: string,
    code: string, err: any, opts: table?): (table?, string?)
    local detail = error_text(err)
    if opts and opts.tokens then
        local _, token_err = persist_token_usage(ctx, opts.tokens)
        if token_err then return nil, token_err end
    end

    turn_state(ctx).failed = true
    input_policy.clear_turn(ctx)
    ctx.upstream:message_error(response_id, code, detail)

    if opts and opts.after_step then
        apply_lifecycle(ctx, lifecycle_runtime.PHASE.AFTER_STEP, agent, {
            reason = REASON.HOST_FAILED,
            refs = {
                message_id = op.message_id,
                response_id = response_id,
                request_id = op.request_id
            },
            outcome = {
                state = OUTCOME.FAILED,
                reason = REASON.HOST_FAILED
            }
        })
    end

    ctx.writer:add_message(consts.MSG_TYPE.SYSTEM, "Turn failed: " .. detail, {
        system_action = consts.SYSTEM_ACTIONS.TURN_FAILED,
        error_code = code,
        source_id = op.message_id,
        response_id = response_id
    })

    return {
        message_id = op.message_id,
        response_id = response_id,
        completed = true,
        failed = detail,
        next_ops = {}
    }
end

-- Persists one input message and announces a user message as received once it is stored.
function message_handlers.write_input(ctx, item)
    local data = type(item.data) == "table" and item.data or {}
    local msg_type = data.type
    if msg_type ~= consts.MSG_TYPE.DEVELOPER and msg_type ~= consts.MSG_TYPE.SYSTEM then
        msg_type = consts.MSG_TYPE.USER
    end
    local message_id, err = ctx.writer:add_message(msg_type, data.text or "", {
        message_id = item.message_id, file_uuids = data.file_uuids
    })
    if err then return nil, err end
    if msg_type == consts.MSG_TYPE.USER and ctx.upstream then
        ctx.upstream:message_received(message_id, data.text or "", data.file_uuids)
    end
    return message_id, msg_type
end

function message_handlers.handle_message(ctx, op)
    local data = type(op.data) == "table" and op.data or {}
    if data.type == consts.MSG_TYPE.DEVELOPER or data.type == consts.MSG_TYPE.SYSTEM then
        local message_id, write_err = message_handlers.write_input(ctx, op)
        if not message_id then return nil, write_err end
        return { message_id = message_id, completed = true }
    end

    local attachments = data.context_attachments
    local reference = data.context_attachments_ref
    local receipt, accepted_message = nil, nil
    local existing_file_message = nil
    if reference == nil and attachments == nil and data.file_uuids ~= nil
        and op.request_id and type(ctx.writer.get_message_by_request_id) == 'function' then
        local lookup_err
        existing_file_message, lookup_err = ctx.writer:get_message_by_request_id(op.request_id)
        if lookup_err then return nil, lookup_err end
    end
    if reference == nil and attachments ~= nil and op.request_id and type(ctx.writer.get_message_by_request_id) == 'function' then
        local existing, lookup_err = ctx.writer:get_message_by_request_id(op.request_id)
        if lookup_err then return reject_transport(ctx, op, 'CONTEXT_STAGING_UNAVAILABLE') end
        if existing then
            local supplied = context_attachments.canonical_json(attachments)
            local original = context_attachments.canonical_json(existing.metadata and existing.metadata.context_attachments)
            if existing.context_receipt or not supplied or supplied ~= original then
                return reject_transport(ctx, op, consts.ERROR_CODES.REQUEST_CONFLICT)
            end
            accepted_message = existing
            attachments = existing.metadata.context_attachments
        end
    end
    if reference ~= nil then
        local staging = message_handlers._context_staging
        if attachments ~= nil or not staging.valid_reference(reference) or not staging.valid_request_id(op.request_id) then
            return reject_transport(ctx, op, 'INVALID_CONTEXT_REFERENCE')
        end
        local existing, lookup_err = ctx.writer:get_message_by_request_id(op.request_id)
        if lookup_err then return reject_transport(ctx, op, 'CONTEXT_STAGING_UNAVAILABLE') end
        local prior = existing and existing.context_receipt
        if prior and prior.actor_id == ctx.user_id
            and context_attachments.canonical_json(prior.reference) == context_attachments.canonical_json(reference) then
            accepted_message = existing
            attachments = existing.metadata and existing.metadata.context_attachments
            if type(attachments) ~= 'table' then return reject_transport(ctx, op, 'INVALID_CONTEXT_RECEIPT') end
            local canonical = context_attachments.canonical_json(attachments)
            if not canonical or #canonical ~= reference.content_bytes
                or 'sha256:' .. hash.sha256(canonical) ~= reference.content_hash then
                return reject_transport(ctx, op, 'INVALID_CONTEXT_RECEIPT')
            end
        else
            local resolve_err
            attachments, resolve_err = staging.resolve(ctx.user_id, ctx.session_id, op.request_id, reference)
            if not attachments then return reject_transport(ctx, op, resolve_err) end
            receipt = { actor_id = ctx.user_id, reference = reference }
        end
    end
    if attachments ~= nil and not accepted_message then
        local validated, validation_err = context_attachments.validate(attachments, {
            session_id = ctx.session_id,
            require_visual_authorization = true,
            visual_authorizer = message_handlers._authorize_visual,
            visual_resolver = message_handlers._resolve_visual,
        })
        if not validated then
            if op.request_id then
                ctx.upstream:command_error(
                    op.request_id,
                    consts.ERROR_CODES.INVALID_CONTEXT_ATTACHMENTS,
                    context_attachments.format_error(validation_err)
                )
            end
            return {
                completed = true,
                rejected = true,
                error = validation_err
            }
        end
        attachments = validated
    end

    local request_hash = nil
    if op.request_id then
        local canonical, canonical_err = context_attachments.canonical_json({
            text = data.text or "",
            file_uuids = data.file_uuids or {},
            context_attachments = attachments or {},
        })
        if not canonical then
            ctx.upstream:command_error(op.request_id, consts.ERROR_CODES.INVALID_JSON, tostring(canonical_err))
            return { completed = true, rejected = true, error = consts.ERROR_CODES.INVALID_JSON }
        end
        local digest, digest_err = hash.sha256(canonical)
        if digest_err then return nil, digest_err end
        request_hash = "sha256:" .. digest
    end
    if existing_file_message then
        if existing_file_message.request_hash ~= request_hash then
            return reject_transport(ctx, op, consts.ERROR_CODES.REQUEST_CONFLICT)
        end
        accepted_message = existing_file_message
    end
    if accepted_message and accepted_message.request_hash ~= request_hash then
        return reject_transport(ctx, op, consts.ERROR_CODES.REQUEST_CONFLICT)
    end

    -- An exact retry of a stored request is acknowledged again, even when the
    -- input policy would block a new message now.
    local function acknowledge_duplicate(message_id, stored)
        local stored_metadata = type(stored) == "table" and type(stored.metadata) == "table" and stored.metadata or nil
        ctx.upstream:message_received(message_id, data.text or "", data.file_uuids,
            stored_metadata and stored_metadata.input, op.request_id, attachments)
        return { completed = true, duplicate = true, message_id = message_id }
    end
    if accepted_message then
        return acknowledge_duplicate(accepted_message.message_id, accepted_message)
    end

    local active = ctx.turn_state and ctx.turn_state.active == true or false
    local interaction = input_policy.resolve(ctx, current_agent(ctx))
    if not interaction.can_send then
        if op.request_id then ctx.upstream:command_error(op.request_id, "INPUT_BLOCKED",
            "Session is not accepting messages right now") end
        return { completed = true }
    end
    if not validate_file_references(data.file_uuids, ctx.user_id, ctx.session_id) then
        return reject_file_references(ctx, op)
    end

    local input = active and { state = "pending" } or nil
    local metadata = { file_uuids = data.file_uuids, context_attachments = attachments }
    if input then metadata.input = input end
    local message_id, err, duplicate
    local committed_interaction
    local next_turn = nil
    if active then
        message_id, err, duplicate = ctx.writer:add_message(consts.MSG_TYPE.USER, data.text or "", metadata,
            op.request_id, request_hash, receipt)
    else
        if type(ctx.writer.admit_message) ~= "function" then
            return nil, "Session writer does not support atomic admission"
        end
        next_turn = { active = true, steps = 0, repeated_calls = 0 }
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
        message_id, err, duplicate = ctx.writer:admit_message(consts.MSG_TYPE.USER, data.text or "", metadata, {
            status = consts.STATUS.RUNNING,
            meta = { interaction = next_interaction },
        }, op.request_id, request_hash, receipt)
        if message_id and not duplicate then committed_interaction = next_interaction end
    end
    -- Storage failures return to the session inbox, which reports them once.
    if err then
        if receipt and (err == 'CONTEXT_REFERENCE_UNAVAILABLE' or err == 'INVALID_CONTEXT_REFERENCE'
            or err == 'CONTEXT_SESSION_UNAVAILABLE') then
            return reject_transport(ctx, op, err)
        end
        return nil, err
    end
    if not message_id then
        return nil, "Failed to persist input"
    end
    if duplicate then
        return acknowledge_duplicate(message_id, nil)
    end

    if next_turn then
        next_turn.message_id = message_id
        ctx.turn_generation = (tonumber(ctx.turn_generation) or 0) + 1
        ctx.turn_state = next_turn
        ctx.stop_requested = false
        ctx.status = consts.STATUS.RUNNING
    end
    ctx.upstream:message_received(message_id, data.text or "", data.file_uuids, input, op.request_id, attachments)
    if committed_interaction then input_policy.accept_committed(ctx, committed_interaction) end
    return {
        message_id = message_id, completed = active,
        next_ops = active and {} or { { type = consts.OP_TYPE.AGENT_STEP, message_id = message_id,
            request_id = op.request_id, from_user = true, ui_action_runtime = op.ui_action_runtime } },
    }
end

-- Agent, provider, and configuration failures end the turn through fail_turn and keep
-- the session open. Storage and consistency failures return nil, err, which the
-- command bus treats as fatal.
function message_handlers.agent_step(ctx, op)
    if is_turn_blocked(ctx) then return { completed = true, next_ops = {} } end
    local response_id, id_err = uuid.v7()
    if id_err then
        return nil, "Failed to generate response ID: " .. tostring(id_err)
    end
    if op.from_user and type(ctx.activate_attention_turn) == "function" then
        op.ui_action_runtime = ctx.activate_attention_turn(op)
    end
    local input_updates, input_err = prepare_pending_inputs(ctx, op.from_user and op.message_id or nil)
    if not input_updates then return nil, input_err end
    local prompt_options = { input_overrides = input_updates }
    local builder, err
    if type(ctx.prepare_attention_prompt) == "function" then
        builder, err = ctx.prepare_attention_prompt(prompt_options)
    else
        builder, err = (message_handlers._prompt_builder or prompt_builder).from_session(ctx.reader, prompt_options)
    end
    if not builder then
        return nil, "Failed to build prompt: " .. tostring(err)
    end

    if not ctx.config.agent_id or ctx.config.agent_id == "" then
        return fail_turn(ctx, op, nil, response_id, consts.ERROR_CODES.AGENT_ERROR,
            "No agent configured for this session")
    end

    local agent, agent_err = ctx.agent_ctx:load_agent(ctx.config.agent_id, {
        model = ctx.config.model
    })
    if not agent then
        return fail_turn(ctx, op, nil, response_id, consts.ERROR_CODES.AGENT_ERROR,
            "Failed to load agent: " .. error_text(agent_err or "unknown error"))
    end

    -- Loop guards (see above). Every step of the turn is counted, including the one that
    -- answers the user's message, which also starts a fresh count.
    ctx.current_agent = agent
    local state = ctx.turn_state
    if not state or state.active == false or (op.from_user and state.message_id ~= op.message_id) then
        state = begin_turn(ctx, op.message_id)
    end
    if op.from_user then state.request_id = op.request_id end
    -- Steered input continues the same turn, so it keeps the turn's Host binding.
    state.ui_action_runtime = op.ui_action_runtime
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

    local session_context, ctx_err = ctx.reader:get_full_context()
    if ctx_err then
        return nil, "Failed to load session context: " .. tostring(ctx_err)
    end
    session_context = with_agent_run_context(ctx, session_context, agent_ref_from(ctx, agent))

    local activate_result, activate_err = ensure_agent_activated(ctx, agent, {
        message_id = op.message_id,
        request_id = op.request_id
    })
    if activate_err then
        return fail_turn(ctx, op, agent, response_id, consts.ERROR_CODES.AGENT_ERROR, activate_err)
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
        return fail_turn(ctx, op, agent, response_id, consts.ERROR_CODES.AGENT_ERROR, before_err)
    end
    append_lifecycle_messages(builder, before_result)

    if is_turn_blocked(ctx) then return { completed = true, next_ops = {} } end
    ctx.input_apply_batch = input_updates
    local expected_revision = tonumber(ctx.interaction and ctx.interaction.revision) or 0
    local _, input_apply_err = persist_pending_inputs(ctx, input_updates, expected_revision)
    local stop_gate = ctx.stop_commit_channel
    if stop_gate then
        stop_gate:receive()
        if ctx.stop_commit_channel == stop_gate then ctx.stop_commit_channel = nil end
    end
    ctx.input_apply_batch = nil
    if input_apply_err then
        if ctx.stop_requested then return { completed = true, next_ops = {} } end
        return nil, input_apply_err
    end
    if is_turn_blocked(ctx) then return { completed = true, next_ops = {} } end
    publish_applied_inputs(ctx, input_updates)
    ctx.upstream:response_beginning(response_id, op.message_id)

    local runtime_options = {
        context = session_context
    }
    if ctx.stream_target then
        runtime_options.stream_target = ctx.stream_target
    elseif ctx.upstream.conn_pid then
        runtime_options.stream_target = {
            reply_to = ctx.upstream.conn_pid,
            topic = ctx.upstream:get_message_topic(response_id)
        }
    end

    local result, exec_err = agent:step(builder, runtime_options)
    if exec_err or type(result) ~= "table" then
        return fail_turn(ctx, op, agent, response_id, consts.ERROR_CODES.AGENT_ERROR,
            exec_err or "Agent step returned no result", {
                after_step = true,
                tokens = type(result) == "table" and result.tokens or nil
            })
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
        return fail_turn(ctx, op, agent, response_id, consts.ERROR_CODES.AGENT_ERROR, after_err,
            { tokens = result.tokens })
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
        if is_turn_blocked(ctx) then
            return { message_id = op.message_id, response_id = response_id, completed = true, next_ops = {} }
        end

        return {
            message_id = op.message_id,
            response_id = response_id,
            completed = false,
            next_ops = {
                {
                    type = consts.OP_TYPE.AGENT_STEP,
                    message_id = op.message_id,
                    request_id = op.request_id,
                    from_user = false,
                    ui_action_runtime = op.ui_action_runtime,
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
            return fail_turn(ctx, op, agent, response_id, consts.ERROR_CODES.AGENT_ERROR, validate_err,
                { tokens = result.tokens })
        end
        unified_tool_calls = prepared_caller.last_tool_calls or unified_tool_calls
    end

    local seen_call_ids = {}
    for _, call in ipairs(unified_tool_calls) do
        if type(call.id) ~= "string" or not string.find(call.id, "%S") then
            return fail_turn(ctx, op, agent, response_id, consts.ERROR_CODES.AGENT_ERROR,
                "Tool call ID must be a non-empty string", { tokens = result.tokens })
        end
        if seen_call_ids[call.id] then
            return fail_turn(ctx, op, agent, response_id, consts.ERROR_CODES.AGENT_ERROR,
                "Duplicate tool call ID: " .. tostring(call.id), { tokens = result.tokens })
        end
        seen_call_ids[call.id] = true
    end
    for call_id in pairs(validated_tools or {}) do
        if not seen_call_ids[call_id] then
            return fail_turn(ctx, op, agent, response_id, consts.ERROR_CODES.AGENT_ERROR,
                "Validated tool call ID is missing from wrapper output: " .. tostring(call_id),
                { tokens = result.tokens })
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

        -- fail_turn must not be used from add_response on: the stored tool intents are
        -- settled only by the fatal path.
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

        if is_turn_blocked(ctx) then
            for _, call in ipairs(unified_tool_calls) do
                local _, cancel_err = ctx.writer:update_message_meta((call_message_ids :: table)[call.id], {
                    status = consts.FUNC_STATUS.CANCELLED,
                    result = "Session stopped before the call executed"
                })
                if cancel_err then return nil, cancel_err end
            end
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

    if is_turn_blocked(ctx) then
        return { message_id = op.message_id, response_id = response_id, completed = true, next_ops = {} }
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

    if #unified_tool_calls > 0 and not is_turn_blocked(ctx) then
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
                model = agent.model,
                agent_options = agent.agent_options,
            },
            message_id = op.message_id,
            response_id = response_id,
            request_id = op.request_id,
            has_text_response = (result.result and result.result ~= ""),
            ui_action_runtime = op.ui_action_runtime,
        })
    end

    if result.tokens then
        local checkpoint_anchor_id = op.message_id
        if not op.from_user and assistant_message_id then
            checkpoint_anchor_id = assistant_message_id
        end

        table.insert(background_ops, {
            type = consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS,
            background = true,
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

message_handlers._resolve_tool_runtime_context = function(context: AttentionToolContext, operation: any, tool_call: any, call_id: string?): (table?, string?)
    local active = current_agent(context)
    local expected_agent = type(operation.agent) == "table" and operation.agent.id
        or context.config and context.config.agent_id
    local tool_id = tostring(tool_call.registry_id)
    if not active or active.id ~= expected_agent then
        return nil, "Attention authority requires the current effective agent"
    end
    local allowed = false
    for _, tool in pairs(active.tools or {}) do
        if tostring(tool.registry_id) == tool_id then allowed = true; break end
    end
    if not allowed then
        return nil, "Attention tool is not enabled for the current effective agent"
    end
    if tool_id == "wippy.agent.tools:attention_inspect"
        or tool_id == "wippy.agent.tools:attention_find_semantic"
        or tool_id == "wippy.agent.tools:attention_find_css"
        or tool_id == "wippy.agent.tools:attention_get_node"
        or tool_id == "wippy.agent.tools:attention_get_tree"
        or tool_id == "wippy.agent.tools:attention_get_geometry"
        or tool_id == "wippy.agent.tools:attention_get_cursor"
        or tool_id == "wippy.agent.tools:attention_get_focus"
        or tool_id == "wippy.agent.tools:attention_get_selection"
        or tool_id == "wippy.agent.tools:attention_hit_test" then
        local runtime = operation.ui_action_runtime
        if not runtime or runtime.inspection_authorized ~= true then
            return nil, "Attention inspection unavailable: this turn has no authenticated Host binding"
        end
        return { attention_inspection_runtime = {
            broker_pid = runtime.broker_pid, delivery_handle = runtime.delivery_handle,
            session_id = runtime.session_id, host_instance_id = runtime.host_instance_id,
        } }, nil
    end
    if tostring(tool_call.registry_id) == "wippy.agent.tools:attention_context_set" then
        if not operation.ui_action_runtime or operation.ui_action_runtime.inspection_authorized ~= true then
            return nil, "Attention context control unavailable: this turn has no authenticated Host binding"
        end
        if type(context.set_attention_context) ~= "function" then
            return nil, "Attention context control unavailable for this Session"
        end
        local op_agent = type(operation.agent) == "table" and operation.agent or nil
        local agent_id = string_or_nil(op_agent and op_agent.id)
            or string_or_nil(context.config and context.config.agent_id)
        if not agent_id then
            return nil, "Attention context control requires an active agent identity"
        end
        if type(context.issue_attention_control) ~= "function" then
            return nil, "Attention context control authority is unavailable for this Session"
        end
        local capability, capability_err = context.issue_attention_control(agent_id, call_id)
        if not capability then
            return nil, "Attention context control authority failed: " .. tostring(capability_err)
        end
        return {
            attention_context_runtime = {
                session_id = context.session_id,
                controller_pid = context.controller_pid,
                agent_id = agent_id,
                capability = capability,
            },
        }, nil
    end
    if not operation.ui_action_runtime or operation.ui_action_runtime.agent_actions_authorized ~= true then
        return nil, "UI action unavailable: agent actions were not enabled for this turn"
    end
    return {
        ui_action_runtime = {
            broker_pid = operation.ui_action_runtime.broker_pid,
            delivery_handle = operation.ui_action_runtime.delivery_handle,
            session_id = operation.ui_action_runtime.session_id,
            host_instance_id = operation.ui_action_runtime.host_instance_id,
        }
    }, nil
end

function message_handlers.process_tools(ctx, op)
    if not op.tool_calls or #op.tool_calls == 0 then
        return { completed = true }
    end

    if op.cancel_only or is_turn_blocked(ctx) then
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
    -- A caller without the resolver gives Attention tools no runtime, so they fail closed.
    if type(caller.set_runtime_context_resolver) == "function" then
        caller:set_runtime_context_resolver(function(call_id, tool_call)
            return message_handlers._resolve_tool_runtime_context(ctx, op, tool_call, call_id)
        end)
    end

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
                message_id = op.call_message_ids[call_id],
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

            local policy_result = result_data.result
            if not result_data.error and not is_delegation and type(policy_result) == "table"
                and type(policy_result._control) == "table" then
                local control = policy_result._control
                local request = nil
                if type(control.config) == "table" then request = control.config.input_policy end
                if request ~= nil then
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
                        policy_result.interaction = resolved
                    end
                end
            end

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
                        message_id = message_id,
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
                        message_id = message_id,
                        call_id = call_id,
                        function_name = result_data.tool_call.name
                    })
                end
            end
        end
    end

    message_handlers.note_tool_round(ctx, results)

    if #op.tool_calls > 0 and not is_turn_blocked(ctx) then
        table.insert(next_ops, {
            type = consts.OP_TYPE.AGENT_CONTINUE,
            message_id = op.message_id,
            request_id = op.request_id,
            ui_action_runtime = op.ui_action_runtime,
        })
    end

    return {
        completed = (#next_ops == 0),
        next_ops = next_ops
    }
end

function message_handlers.agent_continue(ctx, op)
    if is_turn_blocked(ctx) then return { completed = true, next_ops = {} } end
    return message_handlers.agent_step(ctx, {
        message_id = op.message_id,
        request_id = op.request_id,
        from_user = false,
        ui_action_runtime = op.ui_action_runtime,
    })
end

return message_handlers
