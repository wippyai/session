local consts = require("consts")
local logger = require("logger"):named("session.process")
local reader = require("reader")
local writer = require("writer")
local upstream = require("upstream")
local command_bus = require("command_bus")
local message_handlers = require("message_handlers")
local control_handlers = require("control_handlers")
local session_handlers = require("session_handlers")
local agent_context = require("agent_context")
local tools = require("tools")
local message_repo = require("message_repo")
local form_recovery = require("form_recovery")
local uuid = require("uuid")
local input_policy = require("input_policy")

type SessionArgs = {
    session_id: string,
    user_id: string,
    conn_pid: any?,
    parent_pid: any?,
    create: boolean?,
    start_token: string?,
    recovery_notice: string?,
}

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
}

local function clone(value)
    if type(value) ~= "table" then return value end
    local result = {}
    for key, item in pairs(value) do result[key] = clone(item) end
    return result
end

local function commit_stop(context: any, session_upstream: any, request_id: string?): (boolean?, string?)
    if context.stop_requested then
        if request_id then session_upstream:update_session({
            request_id = request_id, status = context.status, interaction = context.interaction,
        }) end
        return true
    end
    local running = context.status == consts.STATUS.RUNNING
        or (context.turn_state and context.turn_state.active == true)
    if request_id and not running then
        session_upstream:command_error(request_id, "SESSION_NOT_RUNNING", "Session is not running")
        return nil, "Session is not running"
    end

    local candidate_state = clone(context.turn_state)
    if candidate_state then candidate_state.input_policy = nil end
    local candidate = {
        config = context.config,
        turn_state = candidate_state,
        status = context.status,
        stop_requested = true,
        current_agent = context.current_agent,
        input_policy_revision = context.input_policy_revision,
        interaction = context.interaction,
    }
    local interaction = input_policy.snapshot(context, candidate, context.current_agent)
    local stop_gate = nil
    local stopped, stop_err
    if context.input_apply_batch and type(context.writer.stop_with_input_rollback) == "function" then
        stop_gate = channel.new(1)
        context.stop_commit_channel = stop_gate
        stopped, stop_err = context.writer:stop_with_input_rollback(context.input_apply_batch, {
            status = context.status,
            meta = { interaction = interaction },
        })
    else
        stopped, stop_err = context.writer:update_meta({
            status = context.status,
            meta = { interaction = interaction },
        })
    end
    if not stopped then
        if stop_gate then stop_gate:send({ success = false, error = stop_err }) end
        if request_id then
            session_upstream:command_error(request_id, "STORAGE_ERROR", stop_err or "Failed to persist Stop")
        else
            session_upstream:session_error("STORAGE_ERROR", stop_err or "Failed to persist Stop")
        end
        return nil, stop_err
    end
    context.stop_requested = true
    context.turn_state = candidate_state
    input_policy.accept_committed(context, interaction, request_id)
    if stop_gate then stop_gate:send({ success = true }) end
    return true
end

local function reference_artifact(ctx, op)
    local message_id, err = ctx.writer:add_message(consts.MSG_TYPE.ARTIFACT, "", {
        artifact_id = op.artifact_id
    })
    if err then
        ctx.upstream:command_error(op.request_id, consts.ERROR_CODES.STORAGE_ERROR, "Failed to reference artifact")
        return { completed = true }
    end
    ctx.upstream:send_message_update(message_id, "artifact", {
        message_id = message_id, artifact_id = op.artifact_id
    })
    ctx.upstream:update_session({ request_id = op.request_id })
    return { completed = true }
end

local function queue_error_code(bus)
    if bus.state == "closed" then return "SESSION_FINISHING" end
    if bus.state == "draining_finish" then return "SESSION_FINISHING" end
    return "SESSION_BUSY"
end

-- THE HELD QUEUE (ctx.held)
--
-- Typed input never waits here: during a turn it is steered or refused at
-- once (message_handlers.handle_message). What waits, in arrival order, is:
--   internal context   { message_id, data, request_id } - developer and
--                      system messages, written at the next safe boundary
--   form answer        { answer_id } - the wake-up of an answer the state API
--                      already committed as a pending row
-- A running turn never admits an answer; the end of the turn does (flush_held).
local MAX_HELD = 256
local MAX_HELD_ANSWERS = 64

local function is_answer(item: any): boolean
    return type(item) == "table" and type(item.answer_id) == "string"
end

local function hold_answer(ctx: any, message_id: string)
    local answers = 0
    for _, item in ipairs(ctx.held) do
        if is_answer(item) then
            if item.answer_id == message_id then return end
            answers = answers + 1
        end
    end
    -- Beyond the bounds the row stays pending; the end-of-turn scan admits it.
    if answers >= MAX_HELD_ANSWERS or #ctx.held >= MAX_HELD then return end
    table.insert(ctx.held, { answer_id = message_id })
end

-- Settles held input. phase:
--   "step"      between two steps of a turn: internal messages are written
--               for the next step to see, up to the first held form answer.
--               Answers are only admitted when the turn ends, and what came
--               after one waits with it so the order holds.
--   "turn_end"  the turn ended: messages are written and answers admitted in
--               arrival order, then any pending answer nobody woke the
--               session for. Answers are admitted in acceptance order, each
--               after the steering rows accepted before it
--               (message_handlers.admit_in_order). If an answer was
--               admitted, or the turn stopped at a form while steering is
--               still pending, the next turn starts at once at the latest of
--               that input (message_handlers.turn_start_after).
--   "stop"      the user stopped the turn: the same, but no turn follows.
--               The answers are delivered now so that they never start a
--               turn on their own later. Steering accepted after the last of
--               them stays pending, as it does after any Stop.
--   "exit"      the session is finishing or failed: messages are written;
--               answers stay pending for the next session start.
-- Returns (id the next turn starts at or nil, error, its request id). A write
-- failure keeps the unwritten input held and reports it; a failed answer
-- admission leaves the row pending (the plugin's scan asks again).
local function flush_held(ctx: any, run_agent: boolean, phase: string?)
    phase = phase or (run_agent and "turn_end" or "exit")
    if phase ~= "step" and ctx.status == consts.STATUS.FAILED then phase = "exit" end
    local settle = phase == "turn_end" or phase == "stop"
    local steering_turn = phase == "turn_end" and message_handlers.ended_by_form(ctx)

    local admitted = {}
    local function admit(through_id)
        local rows, admit_err = message_handlers.admit_in_order(ctx, through_id)
        for _, row in ipairs(rows) do table.insert(admitted, row) end
        if admit_err then
            logger:warn("form answer admission failed", { session_id = ctx.session_id, error = tostring(admit_err) })
            if phase == "stop" and through_id then message_handlers.note_stopped_answer(ctx, through_id) end
        end
    end

    -- Input arriving while this runs waits for the next boundary.
    local count = #ctx.held
    for _ = 1, count do
        local item = ctx.held[1]
        if is_answer(item) then
            if phase == "step" then break end
            table.remove(ctx.held :: {any}, 1)
            if settle then admit(item.answer_id) end
        else
            local message_id, write_err = message_handlers.write_input(ctx, item)
            if not message_id then
                if ctx.upstream then
                    for _, pending in ipairs(ctx.held) do
                        if not is_answer(pending) then
                            ctx.upstream:message_error(pending.message_id,
                                consts.ERROR_CODES.STORAGE_ERROR, write_err)
                        end
                    end
                end
                message_handlers.defer_publish(ctx, admitted)
                return nil, write_err
            end
            table.remove(ctx.held :: {any}, 1)
        end
    end

    -- Pending answers whose wake-up never arrived.
    if settle and type(ctx.session_id) == "string" then admit(nil) end

    local next_turn = nil
    if phase == "turn_end" and run_agent then
        local start_err
        next_turn, start_err = message_handlers.turn_start_after(ctx, admitted, steering_turn)
        if start_err then
            message_handlers.defer_publish(ctx, admitted)
            return nil, start_err
        end
        if next_turn then
            local started, turn_err = message_handlers.start_turn(ctx, next_turn)
            if not started then
                message_handlers.defer_publish(ctx, admitted)
                return nil, turn_err
            end
        end
    end
    -- The ended turn was left running (finish_turn, defer_completion): the
    -- next turn replaced it above, or it completes now. Either way the
    -- clients see one status change.
    if ctx.completion_deferred then
        ctx.completion_deferred = nil
        if not next_turn then
            local completed, complete_err = message_handlers.complete_turn(ctx)
            if not completed then
                message_handlers.defer_publish(ctx, admitted)
                return nil, complete_err
            end
        end
    end
    if #admitted > 0 then
        if next_turn then
            -- The session status already says running for the next turn.
            message_handlers.publish_admitted(admitted)
        else
            message_handlers.defer_publish(ctx, admitted)
        end
    end
    return next_turn, nil, nil
end

-- A form is being created inside a turn. Internal messages held since before
-- it are written ahead of the form, on the form's transaction, so the history
-- keeps them before it. Only those before the first held answer (answers
-- wait for the end of the turn). Typed input needs nothing here: a steered
-- message is stored when it arrives, so a message sent before the form
-- already sits before it and does not make it stale. Returns the written
-- entries for commit_held_before_form.
local function write_held_before_form(ctx: any, write_opts: any)
    local written = {}
    for _, item in ipairs(ctx.held) do
        if is_answer(item) then break end
        local message_id, msg_type = message_handlers.write_input(ctx, item,
            { tx = write_opts and write_opts.tx, announce = false })
        if not message_id then return nil, msg_type end
        table.insert(written, { item = item, message_id = message_id, msg_type = msg_type })
    end
    return written, nil
end

-- After the form's transaction committed: the entries are no longer held.
local function commit_held_before_form(ctx: any, written: any)
    for _ = 1, #written do table.remove(ctx.held :: {any}, 1) end
    for _, entry in ipairs(written) do
        message_handlers.announce_input(ctx, entry.message_id, entry.msg_type, entry.item)
    end
end

local function settle_exit(bus: any, err: any)
    return bus:fail(err)
end

-- Runs `work` in its own coroutine of the session process, beside the
-- command bus (see session_handlers.generate_title).
local function run_in_background(work: any)
    coroutine.spawn(work)
end

-- The turn boundary, run by the session inbox once the command bus is empty
-- (turn_boundary_callback). The turn continues for steering that is due, or
-- ends: the rest of the held queue and the pending answers are settled, and
-- the next turn may start. A turn that ends normally is completed only after
-- that (flush_held), so a turn that admitted answers goes straight into the
-- next one without an idle status in between. Returns true, or nil and an
-- error.
local function turn_boundary(ctx: any, bus: any): (boolean?, string?)
    -- Internal messages held during the turn, up to the first held form
    -- answer: a continuation step sees them.
    local _, flush_err = flush_held(ctx, false, "step")
    if flush_err then return nil, flush_err end
    local finished, finish_err = message_handlers.finish_turn(ctx, { defer_completion = true })
    if not finished then return nil, finish_err end
    if finished.completed then
        local _, end_err = bus:end_turn()
        if end_err then return nil, end_err end
        -- flush_held completes the deferred turn; this covers a context
        -- without the held-input hooks, where end_turn settles nothing.
        if ctx.completion_deferred then
            ctx.completion_deferred = nil
            local completed, complete_err = message_handlers.complete_turn(ctx)
            if not completed then return nil, complete_err end
        end
        return true
    end
    for _, next_op in ipairs(finished.next_ops or {}) do
        local queued, queue_err = bus:queue_op(next_op)
        if not queued then return nil, queue_err end
    end
    return true
end

local function route_input(ctx: any, bus: any, topic: string, payload_data: any, session_state: any)
    payload_data = payload_data or {}
    if payload_data.conn_pid then ctx.upstream.conn_pid = payload_data.conn_pid end
    if topic == consts.TOPICS.STOP or
        (topic == consts.TOPICS.COMMAND and payload_data.command == consts.COMMANDS.STOP) then
        local stop_request_id = bus.turn_state.stop_request_id or payload_data.stop_request_id
        if not stop_request_id then
            local generated, id_err = uuid.v7()
            if id_err then return nil, id_err end
            stop_request_id = generated
        end
        local committed = commit_stop(ctx, ctx.upstream, payload_data.request_id :: string?)
        if not committed then return true end
        local requested = bus:request_stop(stop_request_id)
        if ctx.parent_pid then
            process.send(ctx.parent_pid :: string,
                requested and consts.TOPICS.STOP_ESCALATION or consts.TOPICS.STOP_RESOLVED, {
                    session_id = ctx.session_id, turn_id = requested and bus.turn_state.id or nil,
                    stop_request_id = stop_request_id,
                    from_pid = process.pid(), supervised = payload_data.stop_supervised == true
                })
        end
        return true
    end
    if topic == consts.TOPICS.MESSAGE then
        if session_state.finishing then
            ctx.upstream:command_error(payload_data.request_id, "SESSION_FINISHING", "Session is finishing")
            return true
        end
        local data = type(payload_data.data) == "table" and payload_data.data or {}
        local is_user = data.type ~= consts.MSG_TYPE.DEVELOPER
            and data.type ~= consts.MSG_TYPE.SYSTEM
        if is_user then
            if bus.state == "closed" or bus.state == "draining_finish" or bus.state == "draining_stop" then
                ctx.upstream:command_error(payload_data.request_id, queue_error_code(bus),
                    "Session is not accepting messages")
                return true
            end
            if #bus.ops + #bus.settle_ops >= 256 and not (ctx.turn_state and ctx.turn_state.active) then
                ctx.upstream:command_error(payload_data.request_id, "SESSION_BUSY", "Command bus queue is full")
                return true
            end
            -- The inbox serializes durable admission with Stop and completion.
            local admitted, admit_err = message_handlers.handle_message(ctx, {
                data = data, request_id = payload_data.request_id,
            })
            if not admitted then
                ctx.upstream:command_error(payload_data.request_id, consts.ERROR_CODES.STORAGE_ERROR,
                    admit_err or "Failed to accept input")
            else
                for _, next_op in ipairs(admitted.next_ops or {}) do
                    local queued, queue_err = bus:queue_op(next_op)
                    if not queued then return nil, queue_err end
                end
            end
        else
            -- Internal context messages retain the upstream safe-boundary buffer.
            if #ctx.held >= MAX_HELD then
                ctx.upstream:command_error(payload_data.request_id, "SESSION_BUSY", "Deferred message buffer is full")
                return true
            end
            local message_id, id_err = uuid.v7()
            if id_err then return nil, id_err end
            local item = { message_id = message_id, data = data, request_id = payload_data.request_id }
            if bus:is_turn_active() then
                table.insert(ctx.held, item)
            else
                item.type = consts.OP_TYPE.HANDLE_MESSAGE
                local queued, queue_err = bus:queue_op(item)
                if not queued then
                    ctx.upstream:command_error(payload_data.request_id, queue_error_code(bus), queue_err)
                end
            end
        end
        return true
    end
    if topic == consts.TOPICS.FORM_ANSWER then
        -- The answer row is already committed and marked pending, so nothing
        -- here needs to be durable: a dropped wake-up is recovered by the
        -- end-of-turn, startup and plugin scans. Never admitted mid-turn: the
        -- running turn must not see an answer that arrived after it started;
        -- it waits in the held queue in arrival order. While idle it is
        -- admitted here, in the inbox, like an idle typed message, so a
        -- message arriving meanwhile cannot start a second turn. Without a
        -- message id this is the plugin asking the session to look for
        -- pending answers.
        local message_id = payload_data.message_id
        if session_state.finishing or bus.state == "closed" or bus.state == "draining_finish" then
            return true
        end
        if (ctx.turn_state and ctx.turn_state.active) or bus:is_turn_active() then
            if type(message_id) == "string" and message_id ~= "" then hold_answer(ctx, message_id) end
        else
            local result = message_handlers.admit_answer(ctx, { message_id = message_id })
            for _, next_op in ipairs(result.next_ops or {}) do
                local queued, queue_err = bus:queue_op(next_op)
                if not queued then return nil, queue_err end
            end
        end
        return true
    end
    if topic ~= consts.TOPICS.COMMAND then return true end
    local op = nil
    if payload_data.command == consts.COMMANDS.CONTEXT then
        op = { type = consts.OP_TYPE.HANDLE_CONTEXT, action = payload_data.action,
            key = payload_data.key, data = payload_data.data, from_pid = payload_data.from_pid,
            request_id = payload_data.request_id }
    elseif payload_data.command == consts.COMMANDS.AGENT and payload_data.name then
        op = { type = consts.OP_TYPE.AGENT_CHANGE, agent_id = payload_data.name,
            request_id = payload_data.request_id }
    elseif payload_data.command == consts.COMMANDS.MODEL and payload_data.name then
        op = { type = consts.OP_TYPE.MODEL_CHANGE, model = payload_data.name,
            request_id = payload_data.request_id }
    elseif payload_data.command == consts.COMMANDS.ARTIFACT then
        if payload_data.artifact_id then
            op = { type = consts.OP_TYPE.REFERENCE_ARTIFACT,
                artifact_id = payload_data.artifact_id, request_id = payload_data.request_id }
        elseif payload_data.artifacts then
            op = { type = consts.OP_TYPE.CONTROL_ARTIFACTS,
                artifacts = payload_data.artifacts, request_id = payload_data.request_id }
        else
            ctx.upstream:command_error(payload_data.request_id, consts.ERROR_CODES.INVALID_JSON,
                "Either artifact_id or artifacts array required")
        end
    end
    if op then
        op.user_command = true
        local queued, queue_err = bus:queue_op(op)
        if not queued then
            ctx.upstream:command_error(payload_data.request_id, queue_error_code(bus), queue_err)
        end
    end
    return true
end

local function run(args: SessionArgs)
    if not args or not args.user_id or not args.session_id then
        error(consts.ERR.MISSING_ARGS)
    end

    local session_reader, err = reader.open(args.session_id)
    if err then
        error("Failed to open session: " .. err)
    end

    local session_data = session_reader:state()
    local session_config = session_data.config or {}

    -- A session ID has one registered process.
    local registry_name = consts.REGISTRY.SESSION .. args.session_id
    local registered, register_err = process.registry.register(registry_name)
    if not registered then
        local registration_error = tostring(register_err or "unknown error")
        local kind_ok, register_kind = pcall(function() return register_err:kind() end)
        local duplicate_name = registration_error:match("name.-already registered") ~= nil
        if kind_ok and register_kind == "AlreadyExists" and duplicate_name then
            return { status = "refused", session_id = args.session_id, error = registration_error }
        end
        error("Failed to register session " .. registry_name .. ": " .. registration_error)
    end

    local session_writer, writer_err = writer.new(args.session_id)
    if not session_writer then
        error("Failed to create session writer: " .. writer_err)
    end

    local recovered_calls = 0
    if not args.create then
        local count, recovery_err = message_repo.recover_pending(args.session_id,
            session_reader:get_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID), form_recovery.settle_call)
        if recovery_err then error("Failed to recover pending calls: " .. recovery_err) end
        recovered_calls = count
    end

    local session_upstream = upstream.new(args.session_id, args.conn_pid, args.parent_pid)
    local policy_requests = channel.new(16)
    local boundary_reply: any = channel.new(1)
    local boundary_topic = "session.internal.turn_boundary"
    local self_pid = process.pid()

    -- Initialize agent context using session config
    local agent_opts = {
        enable_cache = session_config.enable_agent_cache == true,
        context = {} :: {[string]: any},
    }
    local agent_ctx = agent_context.new(agent_opts)

    -- Re-apply persisted declarative trait/tool overlays so they survive a process
    -- restart. A list overlay replaces the agent's own set; `false` is the cleared
    -- marker written on an agent switch (config can't drop a key) and is skipped.
    if type(session_config.active_traits) == "table" then
        agent_ctx:set_active_traits(session_config.active_traits)
    end
    if type(session_config.active_tools) == "table" then
        agent_ctx:set_active_tools(session_config.active_tools)
    end

    -- Configure delegation if enabled
    if session_config.delegation_func_id then
        local delegation_schema = nil
        local tool_schema, schema_err = tools.get_tool_schema(session_config.delegation_func_id)
        if tool_schema and tool_schema.schema then
            delegation_schema = tool_schema.schema
        end

        agent_ctx:configure_delegate_tools({
            enabled = true,
            description_suffix = session_config.delegation_description_suffix,
            default_schema = delegation_schema
        })
    end

    local context: any = {
        session_id = args.session_id,
        user_id = args.user_id,
        reader = session_reader,
        writer = session_writer,
        upstream = session_upstream,
        config = session_config,
        agent_ctx = agent_ctx,
        held = {},
        parent_pid = args.parent_pid,
        lifecycle_state = {},
        status = consts.STATUS.IDLE,
        interaction = session_data.meta and session_data.meta.interaction,
        input_policy_revision = tonumber(session_data.meta and session_data.meta.interaction
            and session_data.meta.interaction.revision) or 0,
        stop_requested = false,
        turn_generation = 0,
    }
    -- Work that must not hold up the turn (the session title).
    context.run_in_background = run_in_background
    -- The session status is kept by the turn boundary (message_handlers.
    -- finish_turn). An empty queue only publishes answers admitted without a
    -- turn (after a stop), which read as delivered now that it is idle.
    context.queue_empty_callback = function()
        message_handlers.publish_deferred(context)
        return true
    end

    context.turn_boundary_callback = function()
        local sent, send_err = process.send(self_pid, boundary_topic, { generation = context.turn_generation })
        if not sent then return nil, send_err or "Failed to request turn completion" end
        local result = boundary_reply:receive()
        return result.value, result.error
    end
    context.operation_error_callback = function(op, err)
        if context.turn_state and context.turn_state.active and
            (op.type == consts.OP_TYPE.AGENT_STEP or op.type == consts.OP_TYPE.AGENT_CONTINUE
                or op.type == consts.OP_TYPE.PROCESS_TOOLS) then
            context.turn_state.failed = true
        end
    end
    context.request_input_policy = function(request, agent)
        local reply = channel.new(1)
        policy_requests:send({ request = request, agent = agent, reply = reply })
        local result = reply:receive()
        return result.value, result.error
    end
    context.refresh_interaction = function(clear_turn)
        local reply = channel.new(1)
        policy_requests:send({ refresh = true, clear_turn = clear_turn, reply = reply })
        local result = reply:receive()
        return result.value, result.error
    end

    local function active_agent()
        if context.config.agent_id and context.config.agent_id ~= "" then
            local agent, load_err = agent_ctx:load_agent(context.config.agent_id, { model = context.config.model })
            if not agent then return nil, load_err end
            context.current_agent = agent
        end
        return context.current_agent
    end
    local initial_agent, initial_agent_err = active_agent()
    if initial_agent_err then error("Failed to load initial agent: " .. tostring(initial_agent_err)) end
    local initial_interaction = input_policy.snapshot(context, context, initial_agent)
    local initialized, initial_err = session_writer:update_meta({
        status = consts.STATUS.IDLE, meta = { interaction = initial_interaction },
    })
    if not initialized then error("Failed to initialize interaction: " .. tostring(initial_err)) end
    context.interaction = initial_interaction
    context.input_policy_revision = initial_interaction.revision

    context.flush_held = function(run_agent, phase) return flush_held(context, run_agent, phase) end
    context.write_held_before_form = function(write_opts) return write_held_before_form(context, write_opts) end
    context.commit_held_before_form = function(written) return commit_held_before_form(context, written) end
    context.settle_intents = function()
        return message_repo.recover_pending(args.session_id,
            session_reader:get_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID), form_recovery.settle_call)
    end

    local bus = command_bus.new(context)
    context.on_turn_end = function(turn_id, stop_requested, stop_request_id)
        if stop_requested and args.parent_pid then
            process.send(args.parent_pid :: string, consts.TOPICS.STOP_RESOLVED, {
                session_id = args.session_id, turn_id = turn_id,
                stop_request_id = stop_request_id, from_pid = process.pid()
            })
        end
    end

    -- Mount all operation handlers
    bus:mount_op_handler(consts.OP_TYPE.HANDLE_MESSAGE, message_handlers.handle_message)
    bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, message_handlers.agent_step)
    bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, message_handlers.process_tools)
    bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, message_handlers.agent_continue)

    bus:mount_op_handler(consts.OP_TYPE.CONTROL_ARTIFACTS, function(ctx, op)
        local result, artifact_err = control_handlers.control_artifacts(ctx, op)
        if not result then return nil, artifact_err end
        -- A refusal is answered by the command bus with its error code.
        if op.user_command and op.request_id and type(result.rejected) ~= "string" then
            ctx.upstream:update_session({ request_id = op.request_id })
        end
        return result
    end)
    bus:mount_op_handler(consts.OP_TYPE.CONTROL_CONTEXT, control_handlers.control_context)
    bus:mount_op_handler(consts.OP_TYPE.CONTROL_MEMORY, control_handlers.control_memory)
    bus:mount_op_handler(consts.OP_TYPE.CONTROL_CONFIG, control_handlers.control_config)

    bus:mount_op_handler(consts.OP_TYPE.AGENT_CHANGE, session_handlers.agent_change)
    bus:mount_op_handler(consts.OP_TYPE.MODEL_CHANGE, session_handlers.model_change)
    bus:mount_op_handler(consts.OP_TYPE.GENERATE_TITLE, session_handlers.generate_title)
    bus:mount_op_handler(consts.OP_TYPE.CREATE_CHECKPOINT, session_handlers.create_checkpoint)
    bus:mount_op_handler(consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS, session_handlers.check_background_triggers)
    bus:mount_op_handler(consts.OP_TYPE.EXECUTE_FUNCTION, session_handlers.execute_function)
    bus:mount_op_handler(consts.OP_TYPE.HANDLE_CONTEXT, control_handlers.handle_context_command)
    bus:mount_op_handler(consts.OP_TYPE.REFERENCE_ARTIFACT, reference_artifact)

    if args.create then

        if session_config.agent_id and session_config.agent_id ~= "" then
            bus:queue_op({
                type = consts.OP_TYPE.AGENT_CHANGE,
                agent_id = session_config.agent_id,
                init = true
            })
        end

        if session_config.model and session_config.model ~= "" then
            bus:queue_op({
                type = consts.OP_TYPE.MODEL_CHANGE,
                model = session_config.model,
                init = true
            })
        end

        if session_config.init_function_id and session_config.init_function_id ~= "" then
            bus:queue_op({
                type = consts.OP_TYPE.EXECUTE_FUNCTION,
                function_id = session_config.init_function_id,
                function_params = session_config.init_function_params,
            })
        end
    end

    local session_state = {
        stopping = false,
        finishing = false,
        interrupted = false,
        bus_done_received = false
    }
    local bus_done = channel.new()


    local inbox = process.inbox()
    local events = process.events()
    local exit_err = nil :: string?

    if args.parent_pid then
        process.send(args.parent_pid :: string, consts.TOPICS.SESSION_OPENED, {
            session_id = args.session_id, from_pid = process.pid()
        })
    end

    if args.recovery_notice or recovered_calls > 0 then
        session_upstream:session_error("recovery_incomplete",
            args.recovery_notice or "The previous turn stopped before completion. Send a new message to continue.")
    end

    session_upstream:update_session({
        agent = session_config.agent_id,
        model = session_config.model,
        status = consts.STATUS.IDLE,
        last_message_date = session_data.last_message_date,
        public_meta = session_data.public_meta,
        interaction = context.interaction,
    })

    -- Form answers accepted while no session process was running (or whose
    -- wake-up was lost) are admitted first, in acceptance order, and start a
    -- turn. After the idle announcement above, so the running status that
    -- follows is the last one the clients see.
    if not args.create then
        local admitted = message_handlers.admit_answer(context, {})
        for _, next_op in ipairs(admitted.next_ops or {}) do
            local queued, queue_err = bus:queue_op(next_op)
            if not queued then error("Failed to start the pending answer turn: " .. tostring(queue_err)) end
        end
    end

    coroutine.spawn(function()
        local _, bus_err = bus:run()
        if bus_err then
            logger:warn("command bus error", { error = bus_err })
            bus:stop()
        end
        bus_done:send({ error = bus_err })
    end)
    while not session_state.stopping do
        local result = channel.select({
            inbox:case_receive(),
            events:case_receive(),
            bus_done:case_receive(),
            policy_requests:case_receive()
        })

        if not result.ok then
            break
        end

        if result.channel == policy_requests then
            local request: any = (result.value :: any)
            local value, policy_err
            if request.refresh then
                local previous_policy = context.turn_state and context.turn_state.input_policy
                if request.clear_turn then input_policy.clear_turn(context) end
                local agent, load_err = active_agent()
                if load_err then policy_err = load_err
                else value, policy_err = input_policy.publish(context, agent, true) end
                if policy_err and context.turn_state then
                    context.turn_state.input_policy = previous_policy
                end
            else
                value, policy_err = input_policy.apply_request(context, request.request, request.agent)
            end
            request.reply:send({ value = value, error = policy_err })
        elseif result.channel == inbox then
            local msg = result.value
            local topic = msg:topic()
            if topic == boundary_topic then
                local boundary = msg:payload():data()
                local boundary_err = nil
                if #bus.ops == 0 and boundary.generation == context.turn_generation then
                    local _, err = turn_boundary(context, bus)
                    boundary_err = err
                end
                boundary_reply:send({ value = not boundary_err, error = boundary_err })
            elseif topic == consts.TOPICS.FINISH_AND_EXIT then
                local committed, stop_err = commit_stop(context, session_upstream, nil)
                if not committed then exit_err = stop_err; break end
                session_state.finishing = true
                context.status = "finishing"
                bus:finish()
            else
                local _, route_err = route_input(context, bus, topic, msg:payload():data(), session_state)
                if route_err then
                    exit_err = "Session ingress failed: " .. route_err
                    break
                end
            end
        elseif result.channel == events then
            local event = result.value

            if event.kind == process.event.CANCEL then
                session_state.stopping = true
                session_state.interrupted = true
                break
            elseif event.kind == process.event.EXIT then
                logger:debug("child process exited", { from = event.from })
            elseif event.kind == process.event.LINK_DOWN then
                logger:warn("linked process failed", { from = event.from })
            end
        elseif result.channel == bus_done then
            session_state.bus_done_received = true
            if result.value.error then
                exit_err = result.value.error
                break
            elseif session_state.finishing then
                session_state.stopping = true
                break
            end
        end
    end

    input_policy.clear_turn(context)
    context.stop_requested = true
    local _, settle_err = settle_exit(bus, exit_err)

    while not session_state.bus_done_received do
        local pending = channel.select({
            bus_done:case_receive(), policy_requests:case_receive(), inbox:case_receive(),
        })
        if not pending.ok then break end
        if pending.channel == bus_done then
            session_state.bus_done_received = true
            settle_err = settle_err or (pending.value and pending.value.error)
        elseif pending.channel == policy_requests then
            (pending.value :: any).reply:send({ error = "Session is closing" })
        elseif pending.channel == inbox then
            local msg = pending.value
            if msg:topic() == boundary_topic then
                boundary_reply:send({ error = "Session is closing" })
            else
                local payload = msg:payload():data() or {}
                if payload.request_id then
                    session_upstream:command_error(payload.request_id, "SESSION_FINISHING", "Session is closing")
                end
            end
        end
    end

    if settle_err then error(settle_err) end

    local _, lifecycle_err = message_handlers.deactivate_current_agent(context :: SessionContext, "session_finished", {
        state = "completed",
        reason = "session_finished"
    })
    if lifecycle_err then
        logger:warn("agent lifecycle deactivate failed", {
            session_id = args.session_id,
            error = tostring(lifecycle_err)
        })
    end

    return { status = "shutdown", session_id = args.session_id,
        interrupted = session_state.interrupted,
        intentional_exit = session_state.finishing }
end

return { run = run, route_input = route_input, flush_held = flush_held,
    settle_exit = settle_exit, turn_boundary = turn_boundary, run_in_background = run_in_background,
    write_held_before_form = write_held_before_form,
    commit_held_before_form = commit_held_before_form,
    reference_artifact = reference_artifact, _commit_stop = commit_stop }
