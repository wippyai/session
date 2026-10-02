local consts = require("consts")
local logger = require("logger"):named("session.process")
local reader = require("reader")
local writer = require("writer")
local upstream = require("upstream")
local command_bus = require("command_bus")
local message_handlers = require("message_handlers")
local control_handlers = require("control_handlers")
local session_handlers = require("session_handlers")
local session_repo = require("session_repo")
local agent_context = require("agent_context")
local tools = require("tools")

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
    controller_pid: string,
    user_id: string,
    reader: any,
    writer: any,
    upstream: any,
    config: {[string]: any},
    agent_ctx: any,
    queue_empty_callback: any?,
    lifecycle_state: table?,
    set_attention_context: any?,
    activate_attention_turn: any?,
    prepare_attention_prompt: any?,
}

local attention_turn_runtime = require('attention_turn_runtime')
local attention_history = require('attention_history')
local context_attachments = require('context_attachments')
local time = require('time')
local uuid = require('uuid')
local hash = require('hash')
local attention_control_runtime = require('attention_control_runtime')
local ATTENTION_CONTROL_REQUEST_TOPIC = 'session_attention_context_request'
local ATTENTION_CONTROL_RESULT_PREFIX = 'session_attention_context_result:'
local ATTENTION_CONTROL_RESULT_SCHEMA = 'wippy.attention.session-control.v1'

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
        controller_pid = tostring(process.pid()),
        user_id = args.user_id,
        reader = session_reader,
        writer = session_writer,
        upstream = session_upstream,
        config = session_config,
        agent_ctx = agent_ctx,
        lifecycle_state = {},
        queue_empty_callback = function()
            session_writer:update_status(consts.STATUS.IDLE)
            session_upstream:update_session({ status = consts.STATUS.IDLE })
        end
    }

    local attention_control: any = attention_control_runtime.new({
        connection_id = args.conn_pid,
        new_id = function()
            return uuid.v7()
        end,
        now = function()
            return time.now():unix()
        end,
    })
    context.issue_attention_control = function(agent_id, call_id)
        return attention_control:issue({
            session_id = args.session_id,
            agent_id = agent_id,
            request_id = call_id,
        })
    end
    context.invalidate_attention_control = function()
        attention_control:invalidate()
    end

    local attention_turn: any = attention_turn_runtime.new(context)
    context.activate_attention_turn = function(op) return attention_turn:activate(op) end
    context.prepare_attention_prompt = function() return attention_history.build(context) end
    local bus = command_bus.new(context)

    local function intercept_handler(ctx, op)
        return {
            completed = true,
            intercepted = true,
            intercepted_count = #op.intercepted_ops
        }
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
        attention_context = session_data.attention_context,
    })
    local current_attention_context = session_data.attention_context or { revision = 0 }
    local function emit_attention_context(attention_context)
        local incoming_revision = tonumber(attention_context and attention_context.revision)
        local current_revision = tonumber(current_attention_context.revision) or 0
        if not incoming_revision or incoming_revision <= current_revision then
            return false
        end
        current_attention_context = attention_context
        session_upstream:update_session({ attention_context = attention_context })
        return true
    end
    local function update_attention_context(enabled: any, expected_revision: any, updated_by: string)
        if enabled and not context_attachments.supports('wippy.attention', 4) then
            return nil, 'ATTENTION_CONTEXT_CAPABILITY_UNAVAILABLE'
        end
        return session_repo.update_attention_context(
            args.session_id,
            enabled,
            expected_revision,
            updated_by
        )
    end
    context.set_attention_context = function(enabled, expected_revision, agent_id)
        if type(agent_id) ~= "string" or agent_id == "" then
            return nil, "ATTENTION_CONTEXT_AGENT_REQUIRED"
        end
        if agent_id ~= context.config.agent_id then
            return nil, "ATTENTION_CONTEXT_AGENT_STALE"
        end
        local state, update_err, current = update_attention_context(
            enabled,
            expected_revision,
            "agent:" .. agent_id
        )
        if state then
            emit_attention_context(state)
        end
        return state, update_err, current
    end

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
        bus_done:send(true)
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
            local payload = msg:payload()

            if topic == 'session_attention_activated' then
                attention_turn:activated(msg:from(), payload:data())
            elseif topic == ATTENTION_CONTROL_REQUEST_TOPIC then
                local request = payload:data() or {}
                if type(request.request_id) == 'string' and request.request_id ~= '' then
                    local digest = hash.sha256(request.request_id)
                    local reply_topic = digest and ATTENTION_CONTROL_RESULT_PREFIX .. digest or ''
                    local response = attention_control:handle(request, tostring(msg:from()), {
                        schema = ATTENTION_CONTROL_RESULT_SCHEMA,
                        session_id = args.session_id,
                        agent_id = context.config.agent_id,
                        reply_topic = reply_topic,
                    }, context.set_attention_context)
                    if reply_topic ~= '' then
                        process.send(msg:from(), reply_topic, response)
                    end
                end
            elseif topic == consts.TOPICS.ATTENTION_CONTEXT_UPDATED then
                local notification = payload:data() or {}
                if type(notification.attention_context) == 'table' then
                    emit_attention_context(notification.attention_context)
                end
            elseif topic == consts.TOPICS.MESSAGE then
                local payload_data = payload:data()
                if payload_data.conn_pid then
                    attention_control:set_connection(payload_data.conn_pid)
                    session_upstream.conn_pid = payload_data.conn_pid
                end

                -- Reject messages if session is finishing
                if session_state.finishing then
                    if payload_data.request_id then
                        session_upstream:command_error(payload_data.request_id, "SESSION_FINISHING", "Session is finishing and cannot accept new messages")
                    end
                else
                    -- Context messages (developer/system) are persisted but do not run the
                    -- agent on their own, so they must not flip the session to RUNNING; only
                    -- a real user turn does. Matches how a turn is gated downstream.
                    local message_data = type(payload_data.data) == "table" and payload_data.data or {}
                    local message_type = message_data.type
                    if message_type ~= consts.MSG_TYPE.DEVELOPER and message_type ~= consts.MSG_TYPE.SYSTEM then
                        session_writer:update_status(consts.STATUS.RUNNING)
                        session_upstream:update_session({ status = consts.STATUS.RUNNING })
                    end

                    bus:queue_op({
                        type = consts.OP_TYPE.HANDLE_MESSAGE,
                        data = payload_data.data,
                        request_id = payload_data.request_id,
                        ui_action_runtime = payload_data.ui_action_runtime,
                    })
                end
            elseif topic == consts.TOPICS.COMMAND then
                local payload_data = payload:data()
                if payload_data.conn_pid then
                    attention_control:set_connection(payload_data.conn_pid)
                    session_upstream.conn_pid = payload_data.conn_pid
                end

                if payload_data.command == 'context_transport_capabilities' then
                    local capabilities, capability_err = message_handlers.context_transport_capabilities(payload_data.capabilities_version)
                    if capabilities then
                        session_upstream:command_success(payload_data.request_id, capabilities)
                    else
                        session_upstream:command_error(payload_data.request_id,
                            capability_err == 'INVALID_CAPABILITIES_VERSION' and capability_err or 'CONTEXT_STAGING_UNAVAILABLE', 'Context transport unavailable')
                    end
                elseif payload_data.command == consts.COMMANDS.CONTEXT then
                    bus:queue_op({
                        type = consts.OP_TYPE.HANDLE_CONTEXT,
                        action = payload_data.action,
                        key = payload_data.key,
                        data = payload_data.data,
                        from_pid = payload_data.from_pid,
                        request_id = payload_data.request_id
                    })
                elseif payload_data.command == consts.COMMANDS.ATTENTION_CONTEXT_SET then
                    local attention_context, attention_err = update_attention_context(
                        payload_data.enabled,
                        payload_data.expected_revision,
                        args.user_id
                    )
                    if attention_context then
                        emit_attention_context(attention_context)
                        session_upstream:command_success(payload_data.request_id, {
                            attention_context = attention_context,
                        })
                    elseif attention_err == 'ATTENTION_CONTEXT_REVISION_CONFLICT' then
                        session_upstream:command_error(payload_data.request_id, attention_err,
                            'Attention context revision is stale')
                    else
                        session_upstream:command_error(payload_data.request_id, attention_err,
                            'Attention context update rejected')
                    end
                elseif payload_data.command == consts.COMMANDS.STOP then
                    bus:intercept(intercept_handler)
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
                bus:finish()
            elseif topic == consts.TOPICS.CONTINUE then
                logger:debug("continue signal received", { session_id = args.session_id })
            elseif topic == consts.TOPICS.STOP then
                bus:intercept(intercept_handler)
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
            if session_state.finishing then
                session_state.stopping = true
                break
            end
        end
    end

    if not session_state.bus_done_received then
        bus_done:receive()
    end
    attention_control:invalidate()

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

    return { status = "shutdown", session_id = args.session_id }
end

return { run = run }
