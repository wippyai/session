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
local uuid = require("uuid")

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
    ctx.upstream:command_success(op.request_id)
    return { completed = true }
end

local function queue_error_code(bus)
    if bus.state == "closed" then return "SESSION_FINISHING" end
    if bus.state == "draining_finish" then return "SESSION_FINISHING" end
    return "SESSION_BUSY"
end

-- THE HELD QUEUE (ctx.held)
--
-- Input that arrives while a turn is active waits here in arrival order:
--   typed input        { message_id, data, request_id }
--   form answer        { answer_id } - the wake-up of an answer the state API
--                      already committed as a pending row
-- Arrival order is the order the inputs were accepted, and the history keeps
-- it: an answer sent before a typed "stop, don't do that" stays before it.
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
--   "step"      between two steps of a turn: typed input is written for the
--               next step to see, up to the first held form answer. Answers
--               are only admitted when the turn ends, and input that came
--               after one waits with it so the order holds.
--   "turn_end"  the turn ended: typed input is written and answers admitted
--               in arrival order, then any pending answer nobody woke the
--               session for. Returns the latest of them for the next turn.
--   "stop"      the user stopped the turn: the same, but no turn follows.
--               The answers are delivered now so that they never start a
--               turn on their own later.
--   "exit"      the session is finishing or failing: typed input is written;
--               answers stay pending for the next session start.
-- Returns (id for the next turn or nil, error, its request id). A write
-- failure keeps the unwritten input held and reports it; a failed answer
-- admission leaves the row pending (the plugin's scan asks again).
local function flush_held(ctx: any, run_agent: boolean, phase: string?)
    phase = phase or (run_agent and "turn_end" or "exit")
    local settle = phase == "turn_end" or phase == "stop"
    local turn_id, turn_request = nil, nil
    local unserved = ctx.unserved_input
    ctx.unserved_input = nil
    if phase == "turn_end" and type(unserved) == "table" then
        turn_id, turn_request = unserved.message_id, unserved.request_id
    end

    local admitted = {}
    -- Input arriving while this runs waits for the next boundary.
    local count = #ctx.held
    for _ = 1, count do
        local item = ctx.held[1]
        if is_answer(item) then
            if phase == "step" then break end
            table.remove(ctx.held :: {any}, 1)
            if settle then
                local row, admit_err = message_handlers.admit_one(ctx, item.answer_id)
                if admit_err then
                    logger:warn("form answer admission failed",
                        { session_id = ctx.session_id, error = tostring(admit_err) })
                    if phase == "stop" then message_handlers.note_stopped_answer(ctx, item.answer_id) end
                elseif row then
                    table.insert(admitted, row)
                    if not row.no_turn then turn_id, turn_request = row.message_id, nil end
                end
            end
        else
            local message_id, msg_type = message_handlers.write_input(ctx, item)
            if not message_id then
                if ctx.upstream then
                    for _, pending in ipairs(ctx.held) do
                        if not is_answer(pending) then
                            ctx.upstream:message_error(pending.message_id,
                                consts.ERROR_CODES.STORAGE_ERROR, msg_type)
                        end
                    end
                end
                message_handlers.publish_admitted(admitted)
                return nil, msg_type
            end
            table.remove(ctx.held :: {any}, 1)
            if msg_type == consts.MSG_TYPE.USER then
                turn_id, turn_request = message_id, item.request_id
            end
        end
    end

    if settle and type(ctx.session_id) == "string" then
        -- Pending answers whose wake-up never arrived (all later than the
        -- inputs above as far as this session knows).
        local _, scan_err, found = message_handlers.admit_answers(ctx)
        if scan_err then
            logger:warn("form answer admission failed", { session_id = ctx.session_id, error = tostring(scan_err) })
        end
        for _, row in ipairs(found or {}) do
            table.insert(admitted, row)
            if not row.no_turn then turn_id, turn_request = row.message_id, nil end
        end
    end

    local next_turn = phase == "turn_end" and run_agent and turn_id or nil
    if #admitted > 0 then
        if next_turn then
            -- The status still says running (the turn that just ended), and
            -- the next turn starts right away.
            message_handlers.publish_admitted(admitted)
        else
            message_handlers.defer_publish(ctx, admitted)
        end
    end
    return next_turn, nil, next_turn and turn_request or nil
end

-- A form is being created inside a turn. Typed input held since before it is
-- written ahead of the form, on the form's transaction, so the form does not
-- start out as asked earlier than a message the user sent before it existed.
-- Only the input before the first held answer (answers wait for the end of
-- the turn). Returns the written entries for commit_held_before_form.
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

-- After the form's transaction committed: the entries are no longer held,
-- and the turn that follows the form answers the latest typed message.
local function commit_held_before_form(ctx: any, written: any)
    for _ = 1, #written do table.remove(ctx.held :: {any}, 1) end
    for _, entry in ipairs(written) do
        message_handlers.announce_input(ctx, entry.message_id, entry.msg_type, entry.item)
        if entry.msg_type == consts.MSG_TYPE.USER then
            ctx.unserved_input = { message_id = entry.message_id, request_id = entry.item.request_id }
        end
    end
end

local function settle_exit(bus: any, err: any)
    return bus:fail(err)
end

local function route_input(ctx: any, bus: any, topic: string, payload_data: any, session_state: any)
    payload_data = payload_data or {}
    if payload_data.conn_pid then ctx.upstream.conn_pid = payload_data.conn_pid end
    if topic == consts.TOPICS.STOP or
        (topic == consts.TOPICS.COMMAND and payload_data.command == consts.COMMANDS.STOP) then
        local stop_request_id = payload_data.stop_request_id or bus.turn_state.stop_request_id
        if not stop_request_id then
            local generated, id_err = uuid.v7()
            if id_err then return nil, id_err end
            stop_request_id = generated
        end
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
        if #ctx.held >= MAX_HELD then
            ctx.upstream:command_error(payload_data.request_id, "SESSION_BUSY", "Deferred message buffer is full")
            return true
        end
        local message_id, id_err = uuid.v7()
        if id_err then return nil, id_err end
        local data = type(payload_data.data) == "table" and payload_data.data or {}
        local is_user = data.type ~= consts.MSG_TYPE.DEVELOPER
            and data.type ~= consts.MSG_TYPE.SYSTEM
        if is_user then
            local _, status_err = ctx.writer:update_status(consts.STATUS.RUNNING)
            if status_err then return nil, status_err end
        end
        local item = { message_id = message_id, data = data, request_id = payload_data.request_id }
        if bus:is_turn_active() then
            table.insert(ctx.held, item)
            if is_user then
                ctx.upstream:update_session({ status = consts.STATUS.RUNNING })
            end
        else
            local queued, queue_err = bus:queue_op({ type = consts.OP_TYPE.HANDLE_MESSAGE,
                message_id = message_id, data = data, request_id = payload_data.request_id,
                starts_turn = is_user })
            if not queued then
                ctx.upstream:command_error(payload_data.request_id, queue_error_code(bus), queue_err)
                return true
            end
        end
        return true
    end
    if topic == consts.TOPICS.FORM_ANSWER then
        -- The answer row is already committed and marked pending, so nothing
        -- here needs to be durable: a dropped wake-up is recovered by the
        -- end-of-turn, startup and plugin scans. Never admitted mid-turn: the
        -- running turn must not see an answer that arrived after it started;
        -- it waits in the held queue in arrival order. Without a message id
        -- this is the plugin asking the session to look for pending answers.
        local message_id = payload_data.message_id
        if session_state.finishing then return true end
        if bus:is_turn_active() then
            if type(message_id) == "string" and message_id ~= "" then hold_answer(ctx, message_id) end
        else
            bus:queue_op({ type = consts.OP_TYPE.ADMIT_ANSWER,
                message_id = message_id, starts_turn = true })
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

    if not args.create and session_data.status and session_data.status ~= consts.STATUS.IDLE then
        local _, status_err = session_writer:update_meta({ status = consts.STATUS.IDLE })
        if status_err then error("Failed to reset session status: " .. status_err) end
    end

    local recovered_calls = 0
    if not args.create then
        local count, recovery_err = message_repo.recover_pending(args.session_id,
            session_reader:get_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID))
        if recovery_err then error("Failed to recover pending calls: " .. recovery_err) end
        recovered_calls = count
    end

    local session_upstream = upstream.new(args.session_id, args.conn_pid, args.parent_pid)

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

    local context: SessionContext = {
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
    }
    context.queue_empty_callback = function()
        local _, status_err = session_writer:update_status(consts.STATUS.IDLE)
        if status_err then return nil, status_err end
        session_upstream:update_session({ status = consts.STATUS.IDLE })
        -- Answers admitted with no turn (after a stop) read as delivered
        -- now that the status is idle.
        message_handlers.publish_deferred(context)
        return true
    end

    context.flush_held = function(run_agent, phase) return flush_held(context, run_agent, phase) end
    context.write_held_before_form = function(write_opts) return write_held_before_form(context, write_opts) end
    context.commit_held_before_form = function(written) return commit_held_before_form(context, written) end
    context.settle_intents = function()
        return message_repo.recover_pending(args.session_id,
            session_reader:get_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID))
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

    bus:mount_op_handler(consts.OP_TYPE.CONTROL_ARTIFACTS, control_handlers.control_artifacts)
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
    bus:mount_op_handler(consts.OP_TYPE.ADMIT_ANSWER, message_handlers.admit_answer)

    -- Form answers accepted while no session process was running (or whose
    -- wake-up was lost) are admitted first, in acceptance order.
    if not args.create then
        local pending, pending_err = message_repo.list_pending_answers(args.session_id, 1)
        if pending_err then
            logger:warn("pending form answer scan failed", { session_id = args.session_id, error = pending_err })
        elseif pending and #pending > 0 then
            bus:queue_op({ type = consts.OP_TYPE.ADMIT_ANSWER,
                message_id = pending[1].message_id, starts_turn = true })
        end
    end

    if args.create then
        local status_ok, status_err = session_writer:update_status(consts.STATUS.IDLE)
        if not status_ok then error("Failed to initialize session status: " .. tostring(status_err)) end

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

    coroutine.spawn(function()
        local _, bus_err = bus:run()
        if bus_err then
            logger:warn("command bus error", { error = bus_err })
            bus:stop()
        end
        bus_done:send({ error = bus_err })
    end)

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
    })

    while not session_state.stopping do
        local result = channel.select({
            inbox:case_receive(),
            events:case_receive(),
            bus_done:case_receive()
        })

        if not result.ok then
            break
        end

        if result.channel == inbox then
            local msg = result.value
            local topic = msg:topic()
            if topic == consts.TOPICS.FINISH_AND_EXIT then
                session_state.finishing = true
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

    local _, settle_err = settle_exit(bus, exit_err)

    if not session_state.bus_done_received then
        bus_done:receive()
    end

    if settle_err then error(settle_err) end

    local _, lifecycle_err = message_handlers.deactivate_current_agent(context, "session_finished", {
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
    settle_exit = settle_exit,
    write_held_before_form = write_held_before_form,
    commit_held_before_form = commit_held_before_form,
    reference_artifact = reference_artifact }
