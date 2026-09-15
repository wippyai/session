local time = require("time")
local json = require("json")
local uuid = require("uuid")
local logger = require("logger"):named("relay.session")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local start_tokens = require("start_tokens")
local consts = require("consts")
local funcs = require("funcs")
local ui_action_broker = require("ui_action_broker")
local prompt_builder = require("prompt_builder")

type PluginArgs = {
    user_id: string,
    user_metadata: {[string]: any}?,
    user_hub_pid: any?,
}

type ActiveSession = {
    pid: any,
    created_at: time.Time,
    last_activity: time.Time?,
    terminating: boolean,
    terminate_reason: string?,
}

type ActiveDispatch = {
    dispatch_id: string,
    generation: number,
}

-- Invoke the configured on_session_end hook (non-blocking).
-- Returns true when a hook was scheduled, false when no hook is configured.
-- The spawn and call dependencies are injectable for testing.
local function fire_session_end_hook(hook_func_id: string?, params: table, spawn: any?, call: any?)
    if not hook_func_id or hook_func_id == "" then
        return false
    end

    spawn = spawn or coroutine.spawn
    call = call or funcs.call

    spawn(function()
        call(hook_func_id, params)
    end)

    return true
end

local function run(args)
    if not args or not args.user_id then
        return nil, "Missing required arguments: user_id"
    end

    local base_config = consts.get_config()

    local state = {
        user_id = args.user_id,
        user_metadata = args.user_metadata or {},
        user_hub_pid = args.user_hub_pid,
        base_config = base_config,
        active_sessions = {} :: {[string]: ActiveSession},
        active_dispatches = {} :: {[string]: ActiveDispatch},
        session_count = 0,
        shutting_down = false,
        shutdown_deadline = nil,
    }

    process.set_options({ trap_links = true })

    local broker: any = ui_action_broker.new({
        ttl_seconds = base_config.ui_action_ttl_seconds,
        send = function(pid, topic, payload)
            return process.send(pid, topic, payload)
        end,
        monitor = function(pid)
            return process.monitor(pid)
        end,
        unmonitor = function(pid)
            return process.unmonitor(pid)
        end,
        new_id = function()
            local id, id_err = uuid.v7()
            if not id then
                error("Failed to generate UI action ID: " .. tostring(id_err))
            end
            return id
        end,
        now = function()
            return time.now():unix()
        end,
        format_time = function(unix_seconds)
            return time.unix(unix_seconds, 0):utc():format_rfc3339()
        end,
        validate_prepared_file = function(prepared_file, actor_id, session_id)
            return prompt_builder.validate_prepared_file(prepared_file, actor_id, session_id)
        end,
    })

    local gc_ticker = time.ticker(base_config.gc_interval)
    local ui_action_ticker = time.ticker(consts.TIMEOUTS.UI_ACTION_SWEEP)
    local inbox = process.inbox()
    local events = process.events()

    local function send_error(conn_pid, error_code, message, request_id)
        if conn_pid then
            process.send(conn_pid :: string, consts.TOPICS.ERROR, {
                error = error_code,
                message = message,
                request_id = request_id
            })
        end
    end

    local function get_active_session_ids()
        local session_ids = {}
        for session_id, _ in pairs(state.active_sessions) do
            table.insert(session_ids, session_id)
        end
        return session_ids
    end

    local function update_session_activity(session_id)
        if state.active_sessions[session_id] then
            state.active_sessions[session_id].last_activity = time.now()
        end
    end

    local function graceful_terminate_session(session_id: string, session_info: ActiveSession?, reason: string)
        if not session_info or not session_info.pid then
            return
        end

        if session_info.terminating then
            return
        end

        session_info.terminating = true
        session_info.terminate_reason = reason
        broker:cancel_session(session_id, "unavailable", "session is terminating")

        logger:info("initiating graceful session termination", {
            user_id = state.user_id,
            session_id = session_id,
            reason = reason
        })

        process.send(session_info.pid :: string, consts.TOPICS.FINISH_AND_EXIT, {})
    end

    local function get_oldest_session()
        local oldest_id = nil
        local oldest_time = nil

        for session_id, session_info in pairs(state.active_sessions) do
            if not session_info.terminating then
                local last_activity = session_info.last_activity or session_info.created_at
                if not oldest_time or last_activity:before(oldest_time) then
                    oldest_time = last_activity
                    oldest_id = session_id
                end
            end
        end

        return oldest_id
    end

    local function enforce_session_limit()
        local active_count = 0
        for _, info in pairs(state.active_sessions) do
            if not info.terminating then
                active_count = active_count + 1
            end
        end

        while active_count >= consts.LIMITS.MAX_SESSIONS_PER_USER do
            local oldest_id = get_oldest_session()
            if not oldest_id then
                break
            end
            graceful_terminate_session(oldest_id, state.active_sessions[oldest_id], "limit_exceeded")
            active_count = active_count - 1
        end
    end

    local function finish_deferred_shutdown()
        if not state.shutting_down or not state.shutdown_deadline then
            return
        end
        if time.now():sub(state.shutdown_deadline):seconds() < 0 then
            return
        end

        state.shutting_down = false
        state.shutdown_deadline = nil
        for session_id, session_info in pairs(state.active_sessions) do
            graceful_terminate_session(session_id, session_info, "shutdown")
        end
    end

    local function unpack_start_token(token)
        if not token then
            return nil, "Start token is required"
        end

        local token_data, err = start_tokens.unpack(token :: string)
        if err then
            return nil, "Invalid start token: " .. err
        end
        return token_data, nil
    end

    local function create_session_in_db(session_id, token_data)
        local primary_context_id, ctx_err = uuid.v7()
        if ctx_err then
            return nil, "Failed to generate context ID: " .. ctx_err
        end

        local context_data = {}
        if token_data.context then
            context_data = token_data.context
        end

        local context, err = context_repo.create(primary_context_id, consts.CONTEXT_TYPES.SESSION,
            json.encode(context_data))
        if err then
            return nil, "Failed to create primary context: " .. err
        end

        local session_config = {
            token_checkpoint_threshold = state.base_config.token_checkpoint_threshold,
            max_message_limit = state.base_config.max_message_limit,
            checkpoint_function_id = state.base_config.checkpoint_function_id,
            title_function_id = state.base_config.title_function_id,
            delegation_func_id = state.base_config.delegation_func_id,
            enable_agent_cache = state.base_config.enable_agent_cache,
            delegation_description_suffix = state.base_config.delegation_description_suffix,

            agent_id = token_data.agent or "",
            model = token_data.model or "",
            init_function_id = token_data.start_func or nil,
            init_function_params = token_data.start_params or nil,
        }

        local session_meta = {}

        local session, err = session_repo.create(
            session_id,
            state.user_id,
            primary_context_id,
            token_data.title or "",
            token_data.kind or consts.SESSION_KINDS.DEFAULT,
            session_meta,
            session_config
        )
        if err then
            context_repo.delete(primary_context_id)
            return nil, "Failed to create session: " .. err
        end

        return session
    end

    local function reset_session_status_if_crashed(session_id, existing_session)
        -- If session exists in DB but not in active sessions, it likely crashed
        -- Reset status to IDLE to ensure clean recovery
        if existing_session and not state.active_sessions[session_id] then
            local current_meta = existing_session.meta or {}
            current_meta.status = existing_session.status or current_meta.status
            if current_meta.status and current_meta.status ~= consts.STATUS.IDLE then
                logger:info("detected crashed session - resetting status to idle", {
                    user_id = state.user_id,
                    session_id = session_id,
                    previous_status = current_meta.status
                })

                local success, err = session_repo.update_session_meta(session_id, { status = consts.STATUS.IDLE })
                if not success then
                    logger:warn("failed to reset session status after crash", {
                        session_id = session_id,
                        error = err
                    })
                    return false, "Failed to reset session status: " .. (err or "unknown error")
                end

                -- Notify hub of status reset if available
                if state.user_hub_pid then
                    process.send(state.user_hub_pid :: string, consts.TOPIC_PREFIXES.SESSION .. session_id, {
                        type = consts.UPSTREAM_TYPES.UPDATE,
                        session_id = session_id,
                        status = consts.STATUS.IDLE
                    })
                end
            end
        end
        return true, nil
    end

    local function create_session(payload_data)
        if not payload_data then
            return nil, "Payload data is required"
        end

        enforce_session_limit()

        local session_id = payload_data.session_id
        if not session_id then
            local id, err = uuid.v7()
            if err then
                send_error(payload_data.conn_pid, consts.ERROR_CODES.SESSION_ID_GEN,
                    "Failed to generate session ID: " .. err, payload_data.request_id)
                return nil, err
            end
            session_id = id
        end

        if state.active_sessions[session_id] then
            logger:debug("session already exists", { user_id = state.user_id, session_id = session_id })
            if state.user_hub_pid then
                process.send(state.user_hub_pid :: string, consts.TOPICS.SESSION_OPENED, {
                    session_id = session_id,
                    active_session_ids = get_active_session_ids(),
                    request_id = payload_data.request_id
                })
            end
            return session_id, nil
        end

        local existing_session, _ = session_repo.get(session_id, state.user_id)
        local session_exists = existing_session ~= nil

        -- Handle crash recovery: reset status if session exists but isn't active
        if session_exists then
            local reset_success, reset_err = reset_session_status_if_crashed(session_id, existing_session)
            if not reset_success then
                send_error(payload_data.conn_pid, consts.ERROR_CODES.SESSION_SPAWN,
                    "Failed to recover crashed session: " .. reset_err, payload_data.request_id)
                return nil, reset_err
            end
        end

        local create_new_session = not session_exists

        if create_new_session then
            if not payload_data.start_token then
                send_error(payload_data.conn_pid, consts.ERROR_CODES.TOKEN_INVALID,
                    "Start token required for new session", payload_data.request_id)
                return nil, "Start token required"
            end

            local token_data, err = unpack_start_token(payload_data.start_token)
            if err then
                send_error(payload_data.conn_pid, consts.ERROR_CODES.TOKEN_INVALID, err, payload_data.request_id)
                return nil, err
            end

            local _, session_create_err = create_session_in_db(session_id, token_data)
            if session_create_err then
                send_error(payload_data.conn_pid, consts.ERROR_CODES.SESSION_SPAWN,
                    "Failed to create session: " .. session_create_err, payload_data.request_id)
                return nil, session_create_err
            end
        end

        local session_init = {
            session_id = session_id,
            user_id = state.user_id,
            user_metadata = state.user_metadata,
            conn_pid = payload_data.conn_pid,
            parent_pid = process.pid()
        }

        if create_new_session then
            session_init.create = true
            session_init.start_token = payload_data.start_token
        end

        logger:debug("session operation", {
            user_id = state.user_id,
            session_id = session_id,
            create = create_new_session,
            exists = session_exists
        })

        local session_pid, spawn_err = process.with_context({
            session_id = session_id,
            user_id = state.user_id,
        }):spawn_linked_monitored(
            consts.PROCESS.SESSION_ID,
            state.base_config.default_host :: string,
            session_init
        )

        if spawn_err then
            send_error(payload_data.conn_pid, consts.ERROR_CODES.SESSION_SPAWN,
                "Failed to create session: " .. spawn_err, payload_data.request_id)
            return nil, spawn_err
        end

        if session_pid then
            local now = time.now()
            state.active_sessions[session_id] = {
                pid = session_pid,
                created_at = now,
                last_activity = now,
                terminating = false,
                terminate_reason = nil
            }
            state.session_count = state.session_count + 1

            local action = create_new_session and consts.SESSION_OPS.CREATE or consts.SESSION_OPS.RECONNECT
            logger:info("session " .. action,
                { user_id = state.user_id, session_id = session_id, active_sessions = state.session_count })

            if state.user_hub_pid then
                process.send(state.user_hub_pid :: string, consts.TOPICS.SESSION_OPENED, {
                    session_id = session_id,
                    active_session_ids = get_active_session_ids(),
                    request_id = payload_data.request_id
                })
            end
        end

        return session_id, nil
    end

    local function handle_session_close(payload_data)
        if not payload_data then
            return
        end

        local conn_pid = payload_data.conn_pid
        local session_id = payload_data.session_id
        local request_id = payload_data.request_id

        if type(session_id) ~= "string" or session_id == "" then
            send_error(conn_pid, consts.ERROR_CODES.INVALID_SESSION_ID,
                "Session ID is required for closing a session", request_id)
            return
        end
        local checked_session_id: string = session_id

        local session_info = state.active_sessions[checked_session_id]
        if session_info then
            if state.session_count > 1 then
                graceful_terminate_session(checked_session_id, session_info, "user_closed")
                logger:info("session close requested", { user_id = state.user_id, session_id = checked_session_id })
            else
                logger:debug("keeping last session active", { user_id = state.user_id, session_id = checked_session_id })
            end
        else
            send_error(conn_pid, consts.ERROR_CODES.SESSION_NOT_FOUND,
                "Cannot close session: session ID not found or invalid", request_id)
        end
    end

    local action_intents: any = require('dispatch_action_intents').new(broker, process.pid())

    local function handle_message_or_command(payload_data, topic_type)
        -- Ingress records private intent only. A claimed dispatch activates routing once.
        local broker = {
            bind_turn = function(_, intent)
                local exists, err = require('dispatch_repo').request_exists(intent.session_id, intent.request_id)
                if exists or err then return nil end
                return action_intents:stage(intent)
            end,
            cancel_session = function() return true end,
        }
        if not payload_data then
            return
        end

        local conn_pid = payload_data.conn_pid
        local session_id = payload_data.session_id
        local request_id = payload_data.request_id

        logger:debug("routing message", { user_id = state.user_id, session_id = session_id, topic_type = topic_type })

        if not session_id and state.session_count == 0 then
            local created_session_id, err = create_session(payload_data)
            if err then
                return
            end
            session_id = created_session_id
        elseif not session_id then
            local most_recent_id = nil
            local most_recent_time = nil

            for sid, session_info in pairs(state.active_sessions) do
                local last_activity = session_info.last_activity or session_info.created_at
                if not most_recent_time or last_activity:after(most_recent_time) then
                    most_recent_time = last_activity
                    most_recent_id = sid
                end
            end
            session_id = most_recent_id
        end

        if not session_id then
            send_error(conn_pid, consts.ERROR_CODES.SESSION_NOT_FOUND,
                "No active sessions available", request_id)
            return
        end

        local session_info = state.active_sessions[session_id]
        if session_info then
            update_session_activity(session_id)

            if topic_type == consts.HANDLER_TYPES.MESSAGE then
                local message_data = type(payload_data.data) == "table" and payload_data.data or {}
                local clean_data = {}
                for key, value in pairs(message_data) do
                    if key ~= "runtime_context" then
                        clean_data[key] = value
                    end
                end
                local attention = nil
                if type(message_data.runtime_context) == "table" then
                    attention = message_data.runtime_context.attention
                end
                local ui_action_runtime = nil
                if type(attention) == "table" then
                    ui_action_runtime = broker:bind_turn({
                        user_id = state.user_id,
                        session_id = session_id,
                        session_pid = session_info.pid,
                        ingress_pid = state.user_hub_pid,
                        conn_pid = conn_pid,
                        host_instance_id = attention.host_instance_id,
                        agent_actions_enabled = attention.agent_actions_enabled,
                        request_id = request_id,
                    })
                    if ui_action_runtime then
                        ui_action_runtime.broker_pid = process.pid()
                    end
                else
                    broker:cancel_session(session_id, "unavailable", "agent actions unavailable for this turn")
                end
                process.send(session_info.pid :: string, consts.TOPICS.MESSAGE, {
                    conn_pid = conn_pid,
                    data = clean_data,
                    request_id = request_id,
                    ui_action_runtime = ui_action_runtime,
                })
            elseif topic_type == consts.HANDLER_TYPES.COMMAND then
                local cmd_data = payload_data.data or {}
                cmd_data.conn_pid = conn_pid
                if request_id then
                    cmd_data.request_id = request_id
                end
                process.send(session_info.pid :: string, consts.TOPICS.COMMAND, cmd_data)
            end
        else
            -- Session ID provided but not in active sessions - try to recover
            logger:info("attempting to recover inactive session", { user_id = state.user_id, session_id = session_id })
            local created_session_id, err = create_session(payload_data)
            if err then
                send_error(conn_pid, consts.ERROR_CODES.SESSION_NOT_FOUND,
                    "Session not found and recovery failed: " .. err, request_id)
                return
            end

            -- Retry the message/command with the recovered session
            local recovered_session_info = state.active_sessions[created_session_id]
            if recovered_session_info then
                update_session_activity(created_session_id)

                if topic_type == consts.HANDLER_TYPES.MESSAGE then
                    local message_data = type(payload_data.data) == "table" and payload_data.data or {}
                    local clean_data = {}
                    for key, value in pairs(message_data) do
                        if key ~= "runtime_context" then
                            clean_data[key] = value
                        end
                    end
                    local attention = nil
                    if type(message_data.runtime_context) == "table" then
                        attention = message_data.runtime_context.attention
                    end
                    local ui_action_runtime = nil
                    if type(attention) == "table" then
                        ui_action_runtime = broker:bind_turn({
                            user_id = state.user_id,
                            session_id = created_session_id,
                            session_pid = recovered_session_info.pid,
                            ingress_pid = state.user_hub_pid,
                            conn_pid = conn_pid,
                            host_instance_id = attention.host_instance_id,
                            agent_actions_enabled = attention.agent_actions_enabled,
                            request_id = request_id,
                        })
                        if ui_action_runtime then
                            ui_action_runtime.broker_pid = process.pid()
                        end
                    else
                        broker:cancel_session(created_session_id, "unavailable", "agent actions unavailable for this turn")
                    end
                    process.send(recovered_session_info.pid :: string, consts.TOPICS.MESSAGE, {
                        conn_pid = conn_pid,
                        data = clean_data,
                        request_id = request_id,
                        ui_action_runtime = ui_action_runtime,
                    })
                elseif topic_type == consts.HANDLER_TYPES.COMMAND then
                    local cmd_data = payload_data.data or {}
                    cmd_data.conn_pid = conn_pid
                    if request_id then
                        cmd_data.request_id = request_id
                    end
                    process.send(recovered_session_info.pid :: string, consts.TOPICS.COMMAND, cmd_data)
                end
            else
                send_error(conn_pid, consts.ERROR_CODES.SESSION_NOT_FOUND,
                    "Session recovery failed", request_id)
            end
        end
    end

    local function check_inactive_sessions()
        local now = time.now()
        local inactivity_duration, _ = time.parse_duration(consts.TIMEOUTS.SESSION_INACTIVITY)

        local to_remove = {}

        for session_id, session_info in pairs(state.active_sessions) do
            local last_activity: time.Time = session_info.last_activity or session_info.created_at
            local time_since_activity = now:sub(last_activity)

            if time_since_activity:seconds() > inactivity_duration:seconds() then
                table.insert(to_remove, session_id)
            end
        end

        if #to_remove > 0 then
            logger:info("removing inactive sessions", { user_id = state.user_id, count = #to_remove })
        end

        for _, session_id in ipairs(to_remove) do
            local session_info = state.active_sessions[session_id]
            if session_info then
                graceful_terminate_session(session_id, session_info, "inactivity")
            end
        end
    end

    while true do
        local result = channel.select({
            inbox:case_receive(),
            events:case_receive(),
            gc_ticker:channel():case_receive(),
            ui_action_ticker:channel():case_receive()
        })

        if not result.ok then
            break
        end

        if result.channel == inbox then
            local msg = result.value
            local topic = msg:topic()
            local payload = msg:payload()

            logger:debug("received topic", { topic = topic })

            if topic == 'session_dispatch_activate' then
                local request = payload:data()
                local active = type(request) == 'table' and state.active_sessions[request.session_id]
                if active and active.pid == msg:from() then
                    local row = require('dispatch_repo').get(request.session_id, request.message_id)
                    local action_runtime = action_intents:activate(msg:from(), row, request)
                    if row and row.state == 'started'
                        and row.session_id == request.session_id
                        and row.message_id == request.message_id
                        and row.dispatch_id == request.dispatch_id
                        and row.generation == request.generation then
                        state.active_dispatches[request.session_id] = {
                            dispatch_id = row.dispatch_id,
                            generation = row.generation,
                        }
                    end
                    process.send(msg:from(), 'session_dispatch_activated', {
                        nonce = request.nonce, dispatch_id = request.dispatch_id, runtime = action_runtime,
                    })
                end
            elseif topic == 'session_dispatch_finished' then
                local request = payload:data()
                if type(request) == 'table' then
                    local session_id = request.session_id
                    if type(session_id) == 'string' then
                        local active = state.active_sessions[session_id]
                        if active and active.pid == msg:from() then
                            local row = require('dispatch_repo').get(session_id, request.message_id)
                            local tracked = state.active_dispatches[session_id]
                            local generation_matches = tracked
                                and row
                                and row.generation == tracked.generation
                                and (request.generation == nil or request.generation == tracked.generation)
                            if row and row.session_id == session_id
                                and row.dispatch_id == request.dispatch_id
                                and generation_matches
                                and action_intents:finish(row) then
                                if tracked.dispatch_id == row.dispatch_id then
                                    state.active_dispatches[session_id] = nil
                                    if state.shutting_down then
                                        graceful_terminate_session(session_id, active, "shutdown")
                                    end
                                end
                            end
                        end
                    end
                end
            elseif topic == consts.PLUGIN_TOPICS.OPEN then
                local payload_data = payload:data()
                logger:debug("handling session open", { user_id = state.user_id })
                create_session(payload_data)
            elseif topic == consts.PLUGIN_TOPICS.CLOSE then
                handle_session_close(payload:data())
            elseif topic == consts.PLUGIN_TOPICS.MESSAGE then
                handle_message_or_command(payload:data(), consts.HANDLER_TYPES.MESSAGE)
            elseif topic == consts.PLUGIN_TOPICS.COMMAND then
                handle_message_or_command(payload:data(), consts.HANDLER_TYPES.COMMAND)
            elseif topic == consts.PLUGIN_TOPICS.SHUTDOWN then
                if not state.shutting_down then
                    logger:info("received shutdown signal - deferring session termination", { user_id = state.user_id })
                    state.shutting_down = true
                    state.shutdown_deadline = time.now():add(consts.TIMEOUTS.SHUTDOWN_GRACE)
                    for session_id, session_info in pairs(state.active_sessions) do
                        broker:cancel_session(session_id, "disconnected", "client transport disconnected")
                        if not state.active_dispatches[session_id] then
                            graceful_terminate_session(session_id, session_info, "shutdown")
                        end
                    end
                end
            elseif topic == consts.PLUGIN_TOPICS.RESUME then
                if state.shutting_down then
                    state.shutting_down = false
                    state.shutdown_deadline = nil
                    logger:info("cancelled shutdown - client reconnected", { user_id = state.user_id })
                end
            elseif topic == consts.PLUGIN_TOPICS.UI_ACTION_REQUEST then
                local accepted, request_err = broker:request(msg:from(), payload:data())
                if not accepted then
                    logger:warn("UI action request rejected", {
                        error = tostring(request_err or "unknown rejection"),
                    })
                end
            elseif topic == consts.PLUGIN_TOPICS.UI_ACTION_CANCEL then
                broker:cancel(msg:from(), payload:data())
            elseif topic == consts.PLUGIN_TOPICS.UI_ACTION_RESULT then
                local payload_data = payload:data() or {}
                local accepted, result_err = broker:result(
                    msg:from(),
                    payload_data.conn_pid,
                    payload_data.session_id,
                    payload_data.data
                )
                if not accepted then
                    logger:warn("UI action result rejected", {
                        error = tostring(result_err or "unknown rejection"),
                        request_id = payload_data.request_id,
                        session_id = payload_data.session_id,
                    })
                    send_error(payload_data.conn_pid, "ui_action_invalid", "UI action result rejected", payload_data.request_id)
                else
                    local result_data = payload_data.data or {}
                    logger:info("UI action result accepted", {
                        request_id = result_data.request_id or payload_data.request_id,
                        session_id = payload_data.session_id,
                        status = result_data.status,
                    })
                end
            elseif string.sub(topic, 1, string.len(consts.TOPIC_PREFIXES.SESSION)) == consts.TOPIC_PREFIXES.SESSION then
                if state.user_hub_pid then
                    process.send(state.user_hub_pid :: string, topic, payload:data())
                end
            end
        elseif result.channel == events then
            local event = result.value
            if event.kind == process.event.LINK_DOWN or event.kind == process.event.EXIT then
                broker:handle_exit(event.from)
                for session_id, session_info in pairs(state.active_sessions) do
                    if session_info.pid == event.from then
                        action_intents:forget(session_id)
                        state.active_dispatches[session_id] = nil
                        local err = "terminated"
                        if event.result and event.result.error then
                            err = tostring(event.result.error)
                        end

                        -- Update session status in database based on termination reason
                        local target_status
                        if event.result and event.result.error then
                            target_status = consts.STATUS.FAILED
                        else
                            target_status = consts.STATUS.IDLE
                        end

                        local success, status_err = session_repo.update_session_meta(session_id, { status = target_status })
                        if not success then
                            logger:warn("failed to update session status", {
                                session_id = session_id,
                                target_status = target_status,
                                error = status_err
                            })
                        end

                        -- Invoke on_session_end hook if configured (non-blocking)
                        fire_session_end_hook(state.base_config.on_session_end_func_id, {
                            session_id = session_id,
                            user_id = state.user_id,
                            status = target_status,
                            reason = err,
                        })

                        state.active_sessions[session_id] = nil
                        state.session_count = state.session_count - 1

                        logger:info("session terminated", {
                            user_id = state.user_id,
                            session_id = session_id,
                            reason = err,
                            status_updated = target_status,
                            active_sessions = state.session_count
                        })

                        if state.user_hub_pid then
                            -- Send session status update first
                            if success then
                                process.send(state.user_hub_pid :: string, consts.TOPIC_PREFIXES.SESSION .. session_id, {
                                    type = consts.UPSTREAM_TYPES.UPDATE,
                                    session_id = session_id,
                                    status = target_status
                                })
                            end

                            -- Then send session closed notification
                            process.send(state.user_hub_pid :: string, consts.TOPICS.SESSION_CLOSED, {
                                session_id = session_id,
                                reason = err,
                                active_session_ids = get_active_session_ids()
                            })
                        end

                        if state.session_count == 0 then
                            gc_ticker:stop()
                            ui_action_ticker:stop()
                            logger:info("plugin shutting down - no active sessions", { user_id = state.user_id })
                            return { status = "shutdown", user_id = state.user_id, reason = "no_active_sessions" }
                        end
                        break
                    end
                end
            elseif event.kind == process.event.CANCEL then
                break
            end
        elseif result.channel == gc_ticker:channel() then
            local _, context_cleanup_err = require('context_staging_repo').cleanup()
            if context_cleanup_err then logger:warn('Context staging cleanup unavailable') end
            check_inactive_sessions()
        elseif result.channel == ui_action_ticker:channel() then
            broker:expire()
            finish_deferred_shutdown()
        end
    end

    for session_id, _ in pairs(state.active_sessions) do
        broker:cancel_session(session_id, "disconnected", "session plugin stopped")
    end
    gc_ticker:stop()
    ui_action_ticker:stop()
    logger:info("plugin shutting down", { user_id = state.user_id, active_sessions = state.session_count })
    return { status = "shutdown", user_id = state.user_id }
end

return { run = run, fire_session_end_hook = fire_session_end_hook }
