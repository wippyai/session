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

local function write_input(ctx: any, item: any)
    local data = type(item.data) == "table" and item.data or {}
    local msg_type = data.type
    if msg_type ~= consts.MSG_TYPE.DEVELOPER and msg_type ~= consts.MSG_TYPE.SYSTEM then
        msg_type = consts.MSG_TYPE.USER
    end
    local message_id, err = ctx.writer:add_message(msg_type, data.text or "", {
        message_id = item.message_id, file_uuids = data.file_uuids
    })
    if err then return nil, err end
    return message_id, msg_type
end

local function flush_held(ctx: any, run_agent: boolean)
    local last_user_id = nil
    local last_request_id = nil
    for _, item in ipairs(ctx.held) do
        local message_id, msg_type = write_input(ctx, item)
        if not message_id then return nil, msg_type end
        if msg_type == consts.MSG_TYPE.USER then
            last_user_id = message_id
            last_request_id = item.request_id
        end
    end
    ctx.held = {}
    return run_agent and last_user_id or nil, nil, last_request_id
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
        if #ctx.held >= 256 then
            ctx.upstream:command_error(payload_data.request_id, "SESSION_BUSY", "Deferred message buffer is full")
            return true
        end
        local message_id, id_err = uuid.v7()
        if id_err then return nil, id_err end
        local data = type(payload_data.data) == "table" and payload_data.data or {}
        local item = { message_id = message_id, data = data, request_id = payload_data.request_id }
        if bus:is_turn_active() then
            table.insert(ctx.held, item)
        else
            local queued, queue_err = bus:queue_op({ type = consts.OP_TYPE.HANDLE_MESSAGE,
                message_id = message_id, data = data, request_id = payload_data.request_id,
                starts_turn = data.type ~= consts.MSG_TYPE.DEVELOPER
                    and data.type ~= consts.MSG_TYPE.SYSTEM })
            if not queued then
                ctx.upstream:command_error(payload_data.request_id, queue_error_code(bus), queue_err)
                return true
            end
        end
        if data.type ~= consts.MSG_TYPE.DEVELOPER and data.type ~= consts.MSG_TYPE.SYSTEM then
            ctx.upstream:message_received(message_id, data.text or "", data.file_uuids)
            local _, status_err = ctx.writer:update_status(consts.STATUS.RUNNING)
            if status_err then return nil, status_err end
            ctx.upstream:update_session({ status = consts.STATUS.RUNNING })
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

    local session_writer, writer_err = writer.new(args.session_id)
    if not session_writer then
        error("Failed to create session writer: " .. writer_err)
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
        queue_empty_callback = function()
            local _, status_err = session_writer:update_status(consts.STATUS.IDLE)
            if status_err then return nil, status_err end
            session_upstream:update_session({ status = consts.STATUS.IDLE })
            return true
        end
    }

    context.flush_held = function(run_agent) return flush_held(context, run_agent) end

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

    if args.create then
        session_writer:update_status(consts.STATUS.IDLE)

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

    if args.recovery_notice or recovered_calls > 0 then
        session_upstream:session_error("recovery_incomplete",
            args.recovery_notice or "The previous turn stopped before completion. Send a new message to continue.")
    end
    -- Send initial session data to client
    session_upstream:update_session({
        agent = session_config.agent_id,
        model = session_config.model,
        status = consts.STATUS.IDLE,
        last_message_date = session_data.last_message_date,
        public_meta = session_data.public_meta,
    })

    process.registry.register("session." .. args.session_id)

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
                    error("Session ingress failed: " .. route_err)
                end
            end
        elseif result.channel == events then
            local event = result.value

            if event.kind == process.event.CANCEL then
                session_state.stopping = true
                session_state.interrupted = true
                bus:stop()
                break
            elseif event.kind == process.event.EXIT then
                logger:debug("child process exited", { from = event.from })
            elseif event.kind == process.event.LINK_DOWN then
                logger:warn("linked process failed", { from = event.from })
            end
        elseif result.channel == bus_done then
            session_state.bus_done_received = true
            if result.value.error then
                error(result.value.error)
            elseif session_state.finishing then
                session_state.stopping = true
                break
            end
        end
    end

    if not session_state.bus_done_received then
        bus_done:receive()
    end

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
    reference_artifact = reference_artifact }
