local json = require("json")
local uuid = require("uuid")
local consts = require("consts")
local input_metadata = require("input_metadata")
local input_policy = require("input_policy")
local prompt_builder = require("prompt_builder")
local tool_caller = require("tool_caller")
local output = require("output")
local lifecycle_runtime = require("lifecycle_runtime")
local tools = require("tools")
local control_handlers = require("control_handlers")
local message_repo = require("message_repo")
local artifact_repo = require("artifact_repo")
local artifact_events = require("artifact_events")
local logger = require("logger"):named("session.forms")

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
    interaction: any?,
    stop_commit_channel: any?,
    input_apply_batch: any?,
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
    local session_reader = ctx.reader
    if session_reader and type(session_reader.list_all_messages) == "function" then
        return session_reader:list_all_messages()
    end
    if session_reader and type(session_reader.messages) == "function" then
        return session_reader:messages():all()
    end
    return message_repo.list_all_by_session(ctx.session_id)
end

-- STEERING AND FORM ANSWERS
--
-- Typed input during a running turn follows the session input policy: it is
-- refused, or stored at once as a pending steering row that the next step of
-- the turn applies (upstream steering). A form answer is not typed input and
-- is never steered into a running turn: it stays a pending answer row until
-- the session admits it (FORM ANSWER ADMISSION below). Both rows are dated
-- when they are accepted (message_date), so the store's row order is the
-- order the user sent them in, and the two keep that order:
--   - a step applies steering rows only up to the first pending answer; the
--     rows after it wait with the answer (prepare_pending_inputs);
--   - admitting an answer first applies the steering rows accepted before
--     it, so they stay ahead of it in the prompt (admit_in_order);
--   - the turn that follows admitted answers starts at the latest steering
--     row still pending after them, or at the latest answer
--     (turn_start_after).
-- A steering row is never anchored to a pending answer: admission moves the
-- answer to the end of the history, and the steering row would move with it.
-- Applying a steering row changes only its metadata, never its date, so it
-- does not change which forms are stale (message_repo.has_user_input_after
-- counts it from when it was accepted).

-- One pass over the session's rows in store order: the pending steering
-- rows (sorted by date, then id), the anchor for applying them (the last row
-- that is neither steering input, a pending answer nor `start_id`), the
-- position and row of the first pending answer, and the position of
-- `start_id` when it is an ordinary row.
local function scan_inputs(ctx, start_id)
    local messages, read_err = all_messages(ctx)
    if not messages then return nil, read_err or "Failed to read pending inputs" end
    local scan = { pending = {} :: {any}, anchor_id = nil :: any, first_answer = nil :: number?,
        answer = nil :: any, start = nil :: number? }
    for index, message in ipairs(messages) do
        local metadata = type(message.metadata) == "table" and message.metadata or nil
        local input = metadata and metadata.input
        if input ~= nil then
            if not input_metadata.validate(message) then
                return nil, "Malformed steering metadata on message " .. tostring(message.message_id)
            end
            if input.state == "pending" then table.insert(scan.pending, { row = message, index = index }) end
        elseif message_repo.is_pending_answer(message) then
            if not scan.first_answer then
                scan.first_answer = index
                scan.answer = message
            end
        elseif message.message_id ~= start_id then
            scan.anchor_id = message.message_id
        else
            scan.start = index
        end
    end
    table.sort(scan.pending, function(a, b)
        if a.row.date ~= b.row.date then return tostring(a.row.date or "") < tostring(b.row.date or "") end
        return tostring(a.row.message_id) < tostring(b.row.message_id)
    end)
    return scan, nil
end

-- The applied-state updates for the steering rows due now: those accepted
-- before the first pending form answer.
--
-- Placement relative to `start_id`, the ordinary row that starts the turn (a
-- typed message, or an admitted answer), which the first step passes:
--   - a row accepted before it goes before it: steering left pending by a
--     stopped or recovered turn is included when the user starts another
--     turn, ahead of the new message.
--   - a row accepted after it goes after it. Steering is included in
--     persisted message order, and a message typed while the turn's first
--     step has not built the prompt yet (the step waits behind any operation
--     queued ahead of it) was persisted after the message that starts the
--     turn, so it must not reach the model before that message. A turn that
--     starts at an admitted form answer while the user keeps typing hits
--     this often, but the rule does not depend on forms.
-- On later steps (no `start_id`) every due row goes after the latest ordinary
-- row.
local function steering_updates(scan, start_id)
    local updates = {}
    for _, entry in ipairs(scan.pending) do
        if not scan.first_answer or entry.index < scan.first_answer then
            local anchor = scan.anchor_id
            if scan.start and entry.index > scan.start then anchor = start_id end
            table.insert(updates, {
                message_id = entry.row.message_id,
                metadata = { input = { state = "applied", after_message_id = anchor } },
            })
        end
    end
    return updates
end

local function prepare_pending_inputs(ctx, new_user_id)
    local scan, err = scan_inputs(ctx, new_user_id)
    if not scan then return nil, err end
    return steering_updates(scan, new_user_id)
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

-- Whether the current turn ended by creating a form (control_forms keys its
-- one-form-per-turn marker by the same turn id). Such a turn takes no
-- further step; steering that is still pending starts the next turn instead
-- (session.flush_held).
function message_handlers.ended_by_form(ctx): boolean
    local state = ctx.turn_state
    if type(state) ~= "table" or ctx.form_turn_id == nil then return false end
    return ctx.form_turn_id == (state.id or state.message_id)
end

-- Completes the current turn: the turn state goes inactive and the session
-- idle (failed and finishing stay as they are), persisted with the new
-- interaction before it is announced. Returns true, or nil and an error.
function message_handlers.complete_turn(ctx)
    local state = ctx.turn_state
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
    return true
end

-- Called only by the session inbox after its command bus becomes empty. The
-- turn continues while steering is due (accepted before any pending form
-- answer), unless it ended by creating a form.
--
-- opts.defer_completion: a turn that ends normally (not stopped, failed or
-- finishing) is left running, with ctx.completion_deferred set, and the end
-- of the turn completes it (session.flush_held): idle when nothing follows,
-- or straight into the next turn when admitted answers or steering left
-- after a form start one. Completing it here first wrote idle and then
-- running again, two status changes the clients saw as a flicker.
function message_handlers.finish_turn(ctx, opts)
    local state = ctx.turn_state
    local ends_normally = state and state.active and not is_turn_blocked(ctx)
    if ends_normally and not message_handlers.ended_by_form(ctx) then
        local updates, err = prepare_pending_inputs(ctx, nil)
        if not updates then return nil, err or "Failed to read pending input" end
        if #updates > 0 then
            return { completed = false, next_ops = { {
                type = consts.OP_TYPE.AGENT_STEP, message_id = state.message_id,
                request_id = state.request_id, from_user = false,
            } } }
        end
    end
    local coordinator = type(ctx.coordinator) == "table" and ctx.coordinator or nil
    if opts and opts.defer_completion and ends_normally and ctx.status == consts.STATUS.RUNNING
        and coordinator and coordinator.state == "running" then
        ctx.completion_deferred = true
        return { completed = true, next_ops = {} }
    end
    local completed, complete_err = message_handlers.complete_turn(ctx)
    if not completed then return nil, complete_err end
    return { completed = true, next_ops = {} }
end

-- Starts a turn at `message_id` (a row that is already stored) the way an
-- idle typed message does in handle_message: the running status and the
-- new interaction are persisted first, then the turn state follows. Used for
-- turns that answer form answers or steering left after a form.
function message_handlers.start_turn(ctx, message_id)
    local next_turn = { active = true, steps = 0, repeated_calls = 0, message_id = message_id }
    local candidate = {
        config = ctx.config,
        turn_state = next_turn,
        status = consts.STATUS.RUNNING,
        stop_requested = false,
        current_agent = current_agent(ctx),
        input_policy_revision = ctx.input_policy_revision,
        interaction = ctx.interaction,
    }
    local interaction = input_policy.snapshot(ctx, candidate, candidate.current_agent)
    local ok, err = ctx.writer:update_meta({ status = consts.STATUS.RUNNING, meta = { interaction = interaction } })
    if not ok then return nil, err or "Failed to persist turn start" end
    ctx.turn_generation = (tonumber(ctx.turn_generation) or 0) + 1
    ctx.turn_state = next_turn
    ctx.stop_requested = false
    ctx.status = consts.STATUS.RUNNING
    input_policy.accept_committed(ctx, interaction)
    return true
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

local MAX_FILE_UUIDS = 100

-- The client's attachment ids, kept only when they are a list of UUID
-- strings. Message metadata is also matched as text (form answer markers),
-- so nothing else the client sends may reach it.
local function file_uuids_of(value: any): {string}?
    if type(value) ~= "table" then return nil end
    local count = 0
    for _ in pairs(value) do count = count + 1 end
    if count == 0 or count > MAX_FILE_UUIDS then return nil end
    local out: {string} = {}
    for index = 1, count do
        local item = value[index]
        if type(item) ~= "string" or not string.match(item, consts.UUID_PATTERN) then return nil end
        out[index] = item
    end
    return out
end

-- Persists one input message and announces a user message as received once it is stored.
-- opts.tx writes on a caller's transaction; opts.announce = false leaves the
-- announcement to the caller (after its commit).
function message_handlers.write_input(ctx, item, opts)
    opts = opts or {}
    local data = type(item.data) == "table" and item.data or {}
    local msg_type = data.type
    if msg_type ~= consts.MSG_TYPE.DEVELOPER and msg_type ~= consts.MSG_TYPE.SYSTEM then
        msg_type = consts.MSG_TYPE.USER
    end
    local text = type(data.text) == "string" and data.text or ""
    local file_uuids = file_uuids_of(data.file_uuids)
    local message_id, err = ctx.writer:add_message(msg_type, text, {
        message_id = item.message_id, file_uuids = file_uuids
    }, opts.tx and { tx = opts.tx } or nil)
    if err then return nil, err end
    if opts.announce ~= false then message_handlers.announce_input(ctx, message_id, msg_type, item) end
    return message_id, msg_type
end

function message_handlers.announce_input(ctx, message_id, msg_type, item)
    if msg_type ~= consts.MSG_TYPE.USER or not ctx.upstream then return end
    local data = type(item.data) == "table" and item.data or {}
    ctx.upstream:message_received(message_id, type(data.text) == "string" and data.text or "",
        file_uuids_of(data.file_uuids))
end

local function bus_state(ctx)
    return type(ctx.coordinator) == "table" and ctx.coordinator.state or nil
end

-- The session is finishing (or failing): form answers stay pending for the
-- next session start, which admits them and starts a turn.
local function finishing(ctx)
    return bus_state(ctx) == "draining_finish"
end

-- No agent turn follows the current operation (stop or finish requested).
local function no_turn_follows(ctx)
    local state = bus_state(ctx)
    return state == "draining_stop" or state == "draining_finish" or state == "closed"
end

function message_handlers.handle_message(ctx, op)
    local data = type(op.data) == "table" and op.data or {}
    if data.type == consts.MSG_TYPE.DEVELOPER or data.type == consts.MSG_TYPE.SYSTEM then
        local message_id, write_err = message_handlers.write_input(ctx, op)
        if not message_id then return nil, write_err end
        return { message_id = message_id, completed = true }
    end
    local active = ctx.turn_state and ctx.turn_state.active == true or false
    local interaction = input_policy.resolve(ctx, current_agent(ctx))
    if not interaction.can_send then
        if op.request_id then ctx.upstream:command_error(op.request_id, "INPUT_BLOCKED",
            "Session is not accepting messages right now") end
        return { completed = true }
    end

    local answers: {any} = {}
    if not active and not op.exiting and not finishing(ctx) then
        -- Form answers accepted before this message go first: a lost wake-up
        -- must not let a later typed message overtake them in the history.
        -- No turn starts for them here; the turn this message starts sees
        -- them ahead of it. A finishing or exiting session leaves them
        -- pending for its next start.
        local admit_err
        answers, admit_err = message_handlers.admit_in_order(ctx, nil)
        if admit_err then
            logger:warn("form answer admission before a message failed",
                { session_id = ctx.session_id, error = tostring(admit_err) })
        end
    end

    local text = type(data.text) == "string" and data.text or ""
    local file_uuids = file_uuids_of(data.file_uuids)
    local input = active and { state = "pending" } or nil
    local metadata = { file_uuids = file_uuids }
    if input then metadata.input = input end
    local message_id, err
    local committed_interaction
    if active then
        message_id, err = ctx.writer:add_message(consts.MSG_TYPE.USER, text, metadata)
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
        message_id, err = ctx.writer:admit_message(consts.MSG_TYPE.USER, text, metadata, {
            status = consts.STATUS.RUNNING,
            meta = { interaction = next_interaction },
        })
        if message_id then
            next_turn.message_id = message_id
            ctx.turn_generation = (tonumber(ctx.turn_generation) or 0) + 1
            ctx.turn_state = next_turn
            ctx.stop_requested = false
            ctx.status = consts.STATUS.RUNNING
            committed_interaction = next_interaction
        end
    end
    if not message_id then
        -- The answers are admitted but no turn starts for them.
        message_handlers.publish_admitted(answers)
        return nil, err or "Failed to persist input"
    end

    ctx.upstream:message_received(message_id, text, file_uuids, input, op.request_id)
    if committed_interaction then input_policy.accept_committed(ctx, committed_interaction) end
    -- After the running status, so their forms read as being answered.
    message_handlers.publish_admitted(answers)
    return {
        message_id = message_id, completed = active,
        next_ops = active and {} or { { type = consts.OP_TYPE.AGENT_STEP, message_id = message_id,
            request_id = op.request_id, from_user = true } },
    }
end

-- FORM ANSWER ADMISSION
--
-- The state API commits a form answer as a user row marked
-- metadata.session_form.pending and wakes the session. The row is not
-- written here again: admission re-dates it to the end of the history and
-- clears the marker (both in message_repo.admit_pending_answer). Until then
-- prompt_builder leaves the row out, so a running turn never sees an answer
-- that arrived after it started. Answers are admitted in acceptance order,
-- each after the steering rows accepted before it (see STEERING AND FORM
-- ANSWERS above).
--
-- When an answer is admitted:
--   - idle session: at once, and a turn starts for it (admit_answer, run
--     from the session inbox like an idle typed message);
--   - during a turn: at the end of the turn, in arrival order with the
--     internal messages held during the turn, and the next turn answers the
--     latest input (session.flush_held);
--   - the user stopped the turn: when the stop settles, with no turn; the
--     form reads as delivered and the user continues by sending a message.
--     Such an answer never starts a turn later, also when its admission has
--     to be retried (ctx.stopped_answers). A Stop the plugin has to enforce
--     ends the process first; the plugin then admits the session's pending
--     answers the same way, with no turn (plugin.finalize_exit);
--   - the session is finishing or failed: never; it stays pending and the
--     next session start admits it and starts a turn.
-- Once admitted, open views of the form reload its delivery state. When a
-- turn follows, the session status says running before they do; when none
-- follows, they reload after the status is back to idle (publish_deferred).
local ADMIT_SCAN_LIMIT = 50

local function stopped_answers(ctx)
    if type(ctx.stopped_answers) ~= "table" then ctx.stopped_answers = {} end
    return ctx.stopped_answers
end

-- Remembers answers that belong to a stopped turn but could not be admitted
-- yet: a later retry admits them without a turn.
function message_handlers.note_stopped_answer(ctx, message_id)
    stopped_answers(ctx)[message_id] = true
end

-- Admits one pending answer row and announces it. Returns the admitted row
-- with no_turn = true when it belongs to a stopped turn; nil when the row is
-- not a pending answer of this session (already admitted, or foreign).
function message_handlers.admit_one(ctx, message_id)
    local admitted, err = message_repo.admit_pending_answer(ctx.session_id, message_id)
    if err then return nil, err end
    if not admitted then return nil, nil end
    local stopped = stopped_answers(ctx)
    admitted.no_turn = stopped[admitted.message_id] == true
    stopped[admitted.message_id] = nil
    if ctx.upstream then
        ctx.upstream:message_received(admitted.message_id, admitted.data or "")
    end
    return admitted, nil
end

-- Tells open views of the admitted answers' forms that the delivery state
-- changed; they reload it.
function message_handlers.publish_admitted(rows: {any}?)
    if not rows then return end
    for _, row in ipairs(rows) do
        local form_id = type(row) == "table" and message_repo.answer_form_id(row) or nil
        if form_id then
            local form_artifact = artifact_repo.get(form_id)
            if form_artifact then artifact_events.publish_updated(form_artifact) end
        end
    end
end

function message_handlers.defer_publish(ctx, rows)
    if type(ctx.deferred_admissions) ~= "table" then ctx.deferred_admissions = {} end
    for _, row in ipairs(rows or {}) do table.insert(ctx.deferred_admissions, row) end
end

-- Called once the session status is idle again.
function message_handlers.publish_deferred(ctx)
    local rows = ctx.deferred_admissions
    ctx.deferred_admissions = nil
    message_handlers.publish_admitted(rows)
end

-- Admits pending answers in acceptance order, up to and including
-- `through_id` (every one, bounded, when it is nil or no longer pending).
-- Before each answer, the steering rows accepted before it are applied at
-- the current end of the history, so the prompt keeps them ahead of it.
-- Stops when the session starts finishing. The durable rows, not the
-- wake-ups, decide what is admitted, so a missed wake-up is recovered by the
-- next scan and a repeated one is a no-op. Nothing is published here (see
-- publish_admitted). Returns the admitted rows and the first error; rows
-- not admitted stay pending for the next scan.
function message_handlers.admit_in_order(ctx, through_id)
    local admitted = {}
    for _ = 1, ADMIT_SCAN_LIMIT do
        if finishing(ctx) then break end
        local scan, scan_err = scan_inputs(ctx, nil)
        if not scan then return admitted, scan_err end
        local answer = scan.answer
        if not answer then break end
        local updates = steering_updates(scan, nil)
        if #updates > 0 then
            local _, apply_err = commit_pending_inputs(ctx, updates)
            if apply_err then return admitted, apply_err end
        end
        local done, err = message_handlers.admit_one(ctx, answer.message_id)
        if err then return admitted, err end
        -- Not pending any more: nothing else admits answers of this session,
        -- so stop rather than read the same row again.
        if not done then break end
        table.insert(admitted, done)
        if through_id and answer.message_id == through_id then break end
    end
    return admitted, nil
end

-- The latest admitted answer a turn should answer (not one of a stopped turn).
function message_handlers.turn_answer(rows)
    for index = #rows, 1, -1 do
        if not rows[index].no_turn then return rows[index].message_id end
    end
    return nil
end

-- The row the turn after admitted answers starts at: the latest steering row
-- still pending ahead of any pending answer (it was sent after them), or
-- else the latest admitted answer that wants a turn. Steering rows alone
-- start a turn only when `steering_turn` is set (the ended turn stopped at a
-- form); otherwise that turn itself would have continued for them.
function message_handlers.turn_start_after(ctx, admitted, steering_turn)
    local answer_id = message_handlers.turn_answer(admitted or {})
    if not answer_id and not steering_turn then return nil, nil end
    local scan, err = scan_inputs(ctx, nil)
    if not scan then return nil, err end
    local latest = nil
    for _, entry in ipairs(scan.pending) do
        if not scan.first_answer or entry.index < scan.first_answer then latest = entry.row.message_id end
    end
    return latest or answer_id, nil
end

-- A form answer arrived (or the plugin asks the session to look for pending
-- ones) while no turn is active. Runs from the session inbox, like an idle
-- typed message, so a message cannot start a second turn meanwhile. Admits
-- the pending answers and starts one turn for the latest; answers of a
-- stopped turn start none. The running status is persisted before anything
-- is admitted, so a failed status write leaves the rows pending for the next
-- scan. A storage failure is logged and leaves the rows pending; the
-- plugin's periodic scan asks again.
function message_handlers.admit_answer(ctx, _op)
    if finishing(ctx) or bus_state(ctx) == "closed" then return { completed = true } end
    local pending, list_err = message_repo.list_pending_answers(ctx.session_id, ADMIT_SCAN_LIMIT)
    if not pending then
        logger:warn("pending form answer scan failed", { session_id = ctx.session_id, error = tostring(list_err) })
        return { completed = true }
    end
    if #pending == 0 then return { completed = true } end

    local wants_turn = false
    local stopped = stopped_answers(ctx)
    for _, row in ipairs(pending) do
        if not stopped[row.message_id] then wants_turn = true end
    end
    wants_turn = wants_turn and not no_turn_follows(ctx)
    if wants_turn then
        local started, start_err = message_handlers.start_turn(ctx, nil)
        if not started then
            logger:warn("session status update failed", { session_id = ctx.session_id, error = tostring(start_err) })
            return { completed = true }
        end
    end

    local admitted, admit_err = message_handlers.admit_in_order(ctx, nil)
    if admit_err then
        logger:warn("form answer admission failed", { session_id = ctx.session_id, error = tostring(admit_err) })
    end
    local start_id = nil
    if wants_turn then
        local start_err
        start_id, start_err = message_handlers.turn_start_after(ctx, admitted, false)
        if start_err then
            logger:warn("pending input scan failed", { session_id = ctx.session_id, error = tostring(start_err) })
        end
    end
    if not start_id or no_turn_follows(ctx) then
        -- Nothing admitted for a turn (already admitted, a failed write, or
        -- only answers of a stopped turn): back to idle.
        if wants_turn then
            local _, complete_err = message_handlers.complete_turn(ctx)
            if complete_err then
                logger:warn("session status update failed",
                    { session_id = ctx.session_id, error = tostring(complete_err) })
            end
        end
        message_handlers.defer_publish(ctx, admitted)
        return { completed = true }
    end
    ctx.turn_state.message_id = start_id
    message_handlers.publish_admitted(admitted)
    return { message_id = start_id, next_ops = {{
        type = consts.OP_TYPE.AGENT_STEP, message_id = start_id, from_user = true
    }} }
end

function message_handlers.agent_step(ctx, op)
    if is_turn_blocked(ctx) then return { completed = true, next_ops = {} } end
    local input_updates, input_err = prepare_pending_inputs(ctx, op.from_user and op.message_id or nil)
    if not input_updates then return nil, input_err end
    local builder, err = (message_handlers._prompt_builder or prompt_builder).from_session(ctx.reader, {
        input_overrides = input_updates,
    })
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
    ctx.current_agent = agent
    local state = ctx.turn_state
    if not state or state.active == false or (op.from_user and state.message_id ~= op.message_id) then
        state = begin_turn(ctx, op.message_id)
    end
    if op.from_user then state.request_id = op.request_id end
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
        return nil, "Failed to load session context: " .. tostring(ctx_err)
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
            local _, store_err, stored: any = ctx.writer:add_message(consts.MSG_TYPE.ASSISTANT, result.result, {
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
                using_tools = false,
                date = type(stored) == "table" and stored.date or nil
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
        local stored_id, call_message_ids, store_err, stored_date = ctx.writer:add_response(
            result.result or "", metadata, intents)
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

        -- Also after Stop: Stop does not cancel a model call already in
        -- flight, and a reply that arrives after it is stored above, so it is
        -- sent now too. Otherwise the chat would gain it only on a reload.
        -- It carries the stored row's date: the response began when the step
        -- started, which after a Stop can be long before the reply was
        -- stored, and the live reply must show the time the history keeps.
        if result.result and result.result ~= "" then
            ctx.upstream:send_message_update(response_id, consts.UPSTREAM_TYPES.CONTENT, {
                content = result.result,
                using_tools = (#unified_tool_calls > 0),
                date = stored_date
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
    -- Set by an effect that finishes the turn (a created form): the calls are
    -- settled as usual, but no continuation step is queued.
    local end_turn = false
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

                local settled = {
                    result = tool_result,
                    status = consts.FUNC_STATUS.SUCCESS,
                    function_name = result_data.tool_call.name,
                    call_id = call_id,
                    registry_id = result_data.tool_call.registry_id
                }
                -- A call with control effects is settled only after its
                -- effects commit, so a crash in between leaves the call
                -- pending for recovery instead of claiming work that never
                -- happened (e.g. "form created" with no form stored).
                if not control then
                    local _, update_err = ctx.writer:update_message_meta(message_id, settled)
                    if update_err then return fail_remaining(index, update_err) end
                end

                local rejected = nil
                -- Set once this call's form is committed. The form names the
                -- call as its origin, so from then on a failure leaves the call
                -- pending: recovery (form_recovery.settle_call) settles it as
                -- created. Marking it an error would make the agent ask again
                -- and leave two forms.
                local form_committed = false
                local function fail_from(reason)
                    return fail_remaining(form_committed and index + 1 or index, reason)
                end
                if control then
                    local effects = {}
                    if control.artifacts and #control.artifacts > 0 then
                        table.insert(effects, { control_handlers.control_artifacts,
                            { artifacts = control.artifacts } })
                    end
                    if type(control.forms) == "table" and #control.forms > 0 then
                        -- Trusted bindings come from the session, not the tool.
                        local turn = ctx.turn_state
                        table.insert(effects, { control_handlers.control_forms, {
                            forms = control.forms,
                            turn_id = (type(turn) == "table" and turn.id) or op.message_id,
                            call_id = call_id,
                            tool_message_id = message_id,
                        } })
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
                            return fail_from(reason)
                        end
                        if type(applied) == "table" and type(applied.rejected) == "string" then
                            -- The effect refused the request without writing anything (e.g. a
                            -- second form in one turn). Only this call becomes a tool error; the
                            -- round and the turn go on so the agent can react to it.
                            rejected = applied.rejected
                        elseif type(applied) == "table" and applied.end_turn then
                            end_turn = true
                            if effect[1] == control_handlers.control_forms then form_committed = true end
                        end
                    end
                end

                if rejected then
                    settled.result = rejected
                    settled.status = consts.FUNC_STATUS.ERROR
                end
                if control then
                    local _, settle_err = ctx.writer:update_message_meta(message_id, settled)
                    if settle_err then return fail_from(settle_err) end
                end

                if rejected then
                    if not is_delegation and not is_private then
                        ctx.upstream:send_message_update(call_id, consts.UPSTREAM_TYPES.FUNCTION_ERROR, {
                            call_id = call_id,
                            function_name = result_data.tool_call.name,
                            error = "Function execution failed"
                        })
                    end
                elseif not is_delegation and not is_private then
                    ctx.upstream:send_message_update(call_id, consts.UPSTREAM_TYPES.FUNCTION_SUCCESS, {
                        call_id = call_id,
                        function_name = result_data.tool_call.name
                    })
                end
            end
        end
    end

    message_handlers.note_tool_round(ctx, results)

    if #op.tool_calls > 0 and not end_turn and not is_turn_blocked(ctx) then
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
    if is_turn_blocked(ctx) then return { completed = true, next_ops = {} } end
    return message_handlers.agent_step(ctx, {
        message_id = op.message_id,
        request_id = op.request_id,
        from_user = false
    })
end

return message_handlers
