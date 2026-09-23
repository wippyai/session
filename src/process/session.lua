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
local input_policy = require("input_policy")

type SessionArgs = {
    session_id: string,
    user_id: string,
    conn_pid: any?,
    parent_pid: any?,
    create: boolean?,
    start_token: string?,
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
    turn_state: table?,
    status: string?,
    input_policy_revision: number?,
    stop_requested: boolean?,
    turn_generation: number?,
    current_agent: any?,
    interaction: any?,
    request_input_policy: any?,
    refresh_interaction: any?,
    operation_error_callback: any?,
}

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
    if session_data.status == consts.STATUS.FAILED then
        error("Cannot open failed session")
    end

    local session_writer, writer_err = writer.new(args.session_id)
    if not session_writer then
        error("Failed to create session writer: " .. writer_err)
    end

    local session_upstream = upstream.new(args.session_id, args.conn_pid, args.parent_pid)
    local policy_requests = channel.new(16)
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

    local context: SessionContext = {
        session_id = args.session_id,
        user_id = args.user_id,
        reader = session_reader,
        writer = session_writer,
        upstream = session_upstream,
        config = session_config,
        agent_ctx = agent_ctx,
        lifecycle_state = {},
        turn_state = nil,
        status = consts.STATUS.IDLE,
        interaction = session_data.meta and session_data.meta.interaction,
        input_policy_revision = tonumber(session_data.meta and session_data.meta.interaction and session_data.meta.interaction.revision) or 0,
        stop_requested = false,
        queue_empty_callback = nil
    }

    context.turn_generation = 0
    context.queue_empty_callback = function()
        -- Admission and completion share the FIFO inbox, including messages
        -- already waiting when the provider returns its final response.
        process.send(self_pid, boundary_topic, { generation = context.turn_generation })
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
    if initial_agent_err then logger:warn("failed to load initial input policy defaults", { error = initial_agent_err }) end
    local initial_interaction, initial_err = input_policy.publish(context, initial_agent, true)
    if not initial_interaction then error(initial_err) end

    local bus = command_bus.new(context)
    local function request_stop(request_id)
        context.stop_requested = true
        input_policy.clear_turn(context)
        if request_id then session_upstream:command_success(request_id, { stopped = true }) end
        local _, policy_err = input_policy.publish(context, context.current_agent)
        if policy_err then session_upstream:session_error("STORAGE_ERROR", policy_err) end
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

    bus:mount_op_handler(consts.OP_TYPE.AGENT_CHANGE, function(ctx, op)
        local result, err = session_handlers.agent_change(ctx, op)
        if err then return nil, err end
        local _, policy_err = ctx.refresh_interaction(true)
        if policy_err then return nil, policy_err end
        return result
    end)
    bus:mount_op_handler(consts.OP_TYPE.MODEL_CHANGE, session_handlers.model_change)
    bus:mount_op_handler(consts.OP_TYPE.GENERATE_TITLE, session_handlers.generate_title)
    bus:mount_op_handler(consts.OP_TYPE.CREATE_CHECKPOINT, session_handlers.create_checkpoint)
    bus:mount_op_handler(consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS, session_handlers.check_background_triggers)
    bus:mount_op_handler(consts.OP_TYPE.EXECUTE_FUNCTION, session_handlers.execute_function)
    bus:mount_op_handler(consts.OP_TYPE.HANDLE_CONTEXT, control_handlers.handle_context_command)

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

    -- Send initial session data to client
    session_upstream:update_session({
        agent = session_config.agent_id,
        model = session_config.model,
        status = consts.STATUS.IDLE,
        last_message_date = session_data.last_message_date,
        public_meta = session_data.public_meta,
        interaction = context.interaction,
    })

    process.registry.register("session." .. args.session_id)

    local session_state = {
        stopping = false,
        finishing = false,
        bus_done_received = false
    }
    local bus_done = channel.new()

    coroutine.spawn(function()
        local _, bus_err = bus:run()
        if bus_err then
            logger:warn("command bus error", { error = bus_err })
        end
        bus_done:send({ error = bus_err })
    end)

    local inbox = process.inbox()
    local events = process.events()

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
                if request.clear_turn then input_policy.clear_turn(context) end
                local agent, load_err = active_agent()
                if load_err then policy_err = load_err
                else value, policy_err = input_policy.publish(context, agent, true) end
            else
                value, policy_err = input_policy.apply_request(context, request.request, request.agent)
            end
            request.reply:send({ value = value, error = policy_err })
        elseif result.channel == inbox then
            local msg = result.value
            local topic = msg:topic()
            local payload = msg:payload()

            if topic == boundary_topic then
                local boundary = payload:data()
                if bus.pending_ops == 0 and boundary.generation == context.turn_generation then
                    local finished, finish_err = message_handlers.finish_turn(context)
                    if finish_err then
                        session_upstream:session_error("STORAGE_ERROR", finish_err)
                        if context.turn_state then context.turn_state.failed = true end
                        finished = message_handlers.finish_turn(context)
                    end
                    for _, next_op in ipairs(finished and finished.next_ops or {}) do bus:queue_op(next_op) end
                end
            elseif topic == consts.TOPICS.MESSAGE then
                local payload_data = payload:data()
                if payload_data.conn_pid then
                    session_upstream.conn_pid = payload_data.conn_pid
                end

                local message_data = type(payload_data.data) == "table" and payload_data.data or {}
                message_data.message_id = payload_data.message_id or message_data.message_id or payload_data.client_message_id
                local message_type = message_data.type
                -- User retries still reach durable deduplication during shutdown.
                -- Admission rejects new input from the finishing interaction state.
                if session_state.finishing and (message_type == consts.MSG_TYPE.DEVELOPER or message_type == consts.MSG_TYPE.SYSTEM) then
                    if payload_data.request_id then
                        session_upstream:command_error(payload_data.request_id, "SESSION_FINISHING", "Session is finishing and cannot accept new messages")
                    end
                else
                    -- Admit user input in the session inbox so persistence and the
                    -- acknowledgement happen before the command bus starts a turn.
                    if message_type ~= consts.MSG_TYPE.DEVELOPER and message_type ~= consts.MSG_TYPE.SYSTEM then
                        local admitted, admit_err = message_handlers.handle_message(context, {
                            data = message_data,
                            request_id = payload_data.request_id
                        })
                        if not admitted then
                            if payload_data.request_id then
                                session_upstream:command_error(payload_data.request_id, consts.ERROR_CODES.STORAGE_ERROR, admit_err or "Failed to accept input")
                            end
                        else
                            if #(admitted.next_ops or {}) > 0 then
                                context.status = consts.STATUS.RUNNING
                                local _, publish_err = input_policy.publish(context, context.current_agent)
                                if publish_err then session_upstream:session_error("STORAGE_ERROR", publish_err) end
                            end
                            for _, next_op in ipairs(admitted.next_ops or {}) do bus:queue_op(next_op) end
                        end
                    else
                        bus:queue_op({
                            type = consts.OP_TYPE.HANDLE_MESSAGE,
                            data = payload_data.data,
                            request_id = payload_data.request_id
                        })
                    end
                end
            elseif topic == consts.TOPICS.COMMAND then
                local payload_data = payload:data()
                if payload_data.conn_pid then
                    session_upstream.conn_pid = payload_data.conn_pid
                end

                if payload_data.command == consts.COMMANDS.CONTEXT then
                    bus:queue_op({
                        type = consts.OP_TYPE.HANDLE_CONTEXT,
                        action = payload_data.action,
                        key = payload_data.key,
                        data = payload_data.data,
                        from_pid = payload_data.from_pid,
                        request_id = payload_data.request_id
                    })
                elseif payload_data.command == consts.COMMANDS.STOP then
                    request_stop(payload_data.request_id)
                elseif payload_data.command == consts.COMMANDS.AGENT then
                    if payload_data.name then
                        bus:queue_op({
                            type = consts.OP_TYPE.AGENT_CHANGE,
                            agent_id = payload_data.name,
                            request_id = payload_data.request_id
                        })
                    end
                elseif payload_data.command == consts.COMMANDS.MODEL then
                    if payload_data.name then
                        bus:queue_op({
                            type = consts.OP_TYPE.MODEL_CHANGE,
                            model = payload_data.name,
                            request_id = payload_data.request_id
                        })
                    end
                elseif payload_data.command == consts.COMMANDS.ARTIFACT then
                    if payload_data.artifact_id then
                        local message_id, err = session_writer:add_message(consts.MSG_TYPE.ARTIFACT, "", {
                            artifact_id = payload_data.artifact_id
                        })

                        if err then
                            session_upstream:command_error(payload_data.request_id, consts.ERROR_CODES.STORAGE_ERROR, "Failed to reference artifact")
                        else
                            session_upstream:send_message_update(message_id, "artifact", {
                                message_id = message_id,
                                artifact_id = payload_data.artifact_id
                            })
                            session_upstream:command_success(payload_data.request_id)
                        end
                    elseif payload_data.artifacts then
                        bus:queue_op({
                            type = consts.OP_TYPE.CONTROL_ARTIFACTS,
                            artifacts = payload_data.artifacts,
                            request_id = payload_data.request_id
                        })
                    else
                        session_upstream:command_error(payload_data.request_id, consts.ERROR_CODES.INVALID_JSON, "Either artifact_id or artifacts array required")
                    end
                end
            elseif topic == consts.TOPICS.FINISH_AND_EXIT then
                session_state.finishing = true
                context.status = "finishing"
                request_stop(nil)
                bus:finish()
            elseif topic == consts.TOPICS.CONTINUE then
                logger:debug("continue signal received", { session_id = args.session_id })
            elseif topic == consts.TOPICS.STOP then
                request_stop(nil)
            end
        elseif result.channel == events then
            local event = result.value

            if event.kind == process.event.CANCEL then
                session_state.stopping = true
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
                session_state.error = result.value.error
                context.status = consts.STATUS.FAILED
                if context.turn_state then context.turn_state.active = false end
                input_policy.clear_turn(context)
                input_policy.publish(context, context.current_agent, true)
                session_upstream:session_error("SESSION_FAILED", tostring(result.value.error))
            end
            session_state.stopping = true
            break
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

    if session_state.error then error(tostring(session_state.error)) end
    return { status = "shutdown", session_id = args.session_id }
end

return { run = run }
