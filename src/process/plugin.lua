local time = require("time")
local json = require("json")
local uuid = require("uuid")
local logger = require("logger"):named("relay.session")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local start_tokens = require("start_tokens")
local consts = require("consts")
local funcs = require("funcs")
local message_repo = require("message_repo")
local reader = require("reader")

type PluginArgs = {
    user_id: string,
    user_metadata: {[string]: any}?,
    user_hub_pid: any?,
}

type ActiveSession = {
    pid: any,
    conn_pid: any?,
    request_id: any?,
    open_notified: boolean?,
    created_at: time.Time,
    last_activity: time.Time?,
    terminating: boolean,
    terminate_reason: string?,
    stop_escalation: number?,
    stop_request_id: string?,
    stop_deadline: any?,
}

local function clear_stop_deadline(session_info)
    local deadline = session_info.stop_deadline
    if not deadline then return end
    session_info.stop_deadline = nil
    deadline.timer:stop()
    if deadline.cancel then deadline.cancel:send(true) end
end

local function replace_stop_deadline(session_info, request_id, level, timer: any, cancel: any?)
    if not request_id then error("Stop deadline requires a request id") end
    clear_stop_deadline(session_info)
    session_info.stop_request_id = request_id
    session_info.stop_deadline = {
        request_id = request_id, level = level, timer = timer, cancel = cancel
    }
end

local function deadline_matches(session_info, deadline)
    local active = session_info.stop_deadline
    return deadline.stop_request_id ~= nil and active ~= nil
        and session_info.pid == deadline.session_pid
        and session_info.stop_request_id == deadline.stop_request_id
        and active.request_id == deadline.stop_request_id
        and session_info.stop_escalation == deadline.level
        and active.level == deadline.level
end

local function exit_error_payload(session_id, status, reason)
    if status ~= consts.STATUS.FAILED then return nil end
    return {
        type = consts.UPSTREAM_TYPES.ERROR,
        session_id = session_id,
        code = "recovery_incomplete",
        message = "Session stopped before completing work (" .. tostring(reason) ..
            "). Send a new message to continue."
    }
end

-- Invoke the configured on_session_end hook (non-blocking).
-- Returns true when a hook was scheduled, false when no hook is configured.
local function fire_session_end_hook(hook_func_id, params, spawn, call)
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

local function status_after_exit(_session_info: any, result: any)
    if result and result.intentional_exit == true and result.status == "shutdown"
        and not result.error and not result.interrupted then
        return consts.STATUS.IDLE
    end
    return consts.STATUS.FAILED
end

local function needs_crash_reset(session)
    return session and session.status and session.status ~= consts.STATUS.IDLE
end

local function recover_session_calls(session_id)
    local session_reader, open_err = reader.open(session_id)
    if open_err then return nil, open_err end
    local anchor = session_reader:get_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID)
    return message_repo.recover_pending(session_id, anchor)
end

local function finalize_exit(session_id: string, session_info: any, result: any)
    local target_status = status_after_exit(session_info, result)
    local recovery_err = nil
    if target_status == consts.STATUS.FAILED then
        local _, err = recover_session_calls(session_id)
        recovery_err = err
    end
    local success, status_err = session_repo.update_session_meta(session_id, {
        status = target_status
    })
    return target_status, success, status_err, recovery_err
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
        session_count = 0,
        shutting_down = false
    }

    process.set_options({ trap_links = true })

    local gc_ticker = time.ticker(base_config.gc_interval)
    local inbox = process.inbox()
    local events = process.events()

    local function schedule_stop_deadline(session_id, session_info, level)
        local plugin_pid = process.pid()
        local session_pid = session_info.pid
        local request_id = session_info.stop_request_id
        local timer = time.timer("10s")
        local cancel = channel.new(1)
        replace_stop_deadline(session_info, request_id, level, timer, cancel)
        coroutine.spawn(function()
            local selected = channel.select({ timer:channel():case_receive(), cancel:case_receive() })
            if selected.channel == timer:channel() then
                process.send(plugin_pid, consts.TOPICS.STOP_DEADLINE, {
                    session_id = session_id, session_pid = session_pid,
                    stop_request_id = request_id, level = level
                })
            end
        end)
    end

    local function cancel_stopped_session(session_id, session_info)
        session_info.stop_escalation = 2
        local _, cancel_err = process.cancel(session_info.pid :: string)
        if cancel_err then
            logger:warn("session cancellation failed", {session_id = session_id, error = cancel_err})
        end
        schedule_stop_deadline(session_id, session_info, 2)
    end

    local function terminate_stopped_session(session_id, session_info)
        session_info.stop_escalation = 3
        clear_stop_deadline(session_info)
        local _, terminate_err = process.terminate(session_info.pid :: string)
        if terminate_err then
            logger:warn("session termination failed", {session_id = session_id, error = terminate_err})
        end
    end

    local function apply_stop_level(session_id, session_info, level)
        if level == 1 then
            schedule_stop_deadline(session_id, session_info, 1)
        elseif level == 2 then
            cancel_stopped_session(session_id, session_info)
        else
            terminate_stopped_session(session_id, session_info)
        end
    end

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

        local _, err = context_repo.create(primary_context_id, consts.CONTEXT_TYPES.SESSION,
            json.encode(context_data))
        if err then
            return nil, "Failed to create primary context: " .. err
        end

        local session_config = {
            token_checkpoint_threshold = state.base_config.token_checkpoint_threshold,
            max_turn_iterations = state.base_config.max_turn_iterations,
            max_repeated_tool_calls = state.base_config.max_repeated_tool_calls,
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
            if state.user_hub_pid and state.active_sessions[session_id].open_notified then
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
        local recovery_notice = nil

        if session_exists then
            if needs_crash_reset(existing_session) then
                recovery_notice = "The previous session stopped before completing a turn. Send a new message to continue."
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
            request_id = payload_data.request_id,
            parent_pid = process.pid()
        }
        session_init.recovery_notice = recovery_notice

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
                conn_pid = payload_data.conn_pid,
                request_id = payload_data.request_id,
                created_at = now,
                last_activity = now,
                terminating = false,
                terminate_reason = nil
            }
            state.session_count = state.session_count + 1

            local action = create_new_session and consts.SESSION_OPS.CREATE or consts.SESSION_OPS.RECONNECT
            logger:info("session " .. action,
                { user_id = state.user_id, session_id = session_id, active_sessions = state.session_count })

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

    local function handle_message_or_command(payload_data, topic_type)
        if not payload_data then
            return
        end

        local conn_pid = payload_data.conn_pid
        local session_id = payload_data.session_id
        local request_id = payload_data.request_id
        local function forward(session_info)
            if session_info.terminating then
                send_error(conn_pid, consts.ERROR_CODES.SESSION_NOT_FOUND,
                    "Session is finishing", request_id)
                return
            end
            if topic_type == consts.HANDLER_TYPES.MESSAGE then
                local _, send_err = process.send(session_info.pid :: string, consts.TOPICS.MESSAGE,
                    { conn_pid = conn_pid, data = payload_data.data, request_id = request_id })
                if send_err then
                    send_error(conn_pid, consts.ERROR_CODES.SESSION_NOT_FOUND, send_err, request_id)
                end
            elseif topic_type == consts.HANDLER_TYPES.COMMAND then
                local cmd_data = payload_data.data or {}
                cmd_data.conn_pid = conn_pid
                if request_id then cmd_data.request_id = request_id end
                if cmd_data.command == consts.COMMANDS.STOP then
                    cmd_data.stop_supervised = true
                    local info = state.active_sessions[session_id]
                    if info then
                        if not info.stop_request_id then
                            local generated, id_err = uuid.v7()
                            if id_err then
                                send_error(conn_pid, consts.ERROR_CODES.SESSION_SPAWN, id_err, request_id)
                                return
                            end
                            info.stop_request_id = generated
                        end
                        cmd_data.stop_request_id = info.stop_request_id
                        if not info.stop_escalation then
                            info.stop_escalation = 1
                            apply_stop_level(session_id, info, 1)
                        end
                    end
                end
                process.send(session_info.pid :: string, consts.TOPICS.COMMAND, cmd_data)
            end
        end

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
            forward(session_info)
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
            local recovered_session_info = state.active_sessions[created_session_id :: string]
            if recovered_session_info then
                update_session_activity(created_session_id)
                forward(recovered_session_info)
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
            gc_ticker:channel():case_receive()
        })

        if not result.ok then
            break
        end

        if result.channel == inbox then
            local msg = result.value
            local topic = msg:topic()
            local payload = msg:payload()

            logger:debug("received topic", { topic = topic })

            if topic == consts.PLUGIN_TOPICS.OPEN then
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
                logger:info("received shutdown signal - notifying sessions to finish", { user_id = state.user_id })
                state.shutting_down = true

                for session_id, session_info in pairs(state.active_sessions) do
                    graceful_terminate_session(session_id, session_info, "shutdown")
                end
            elseif topic == consts.PLUGIN_TOPICS.RESUME then
                if state.shutting_down then
                    state.shutting_down = false
                    logger:info("cancelled shutdown - client reconnected", { user_id = state.user_id })
                end
            elseif topic == consts.TOPICS.STOP_ESCALATION then
                local stop_data = payload:data()
                local session_info = state.active_sessions[stop_data.session_id]
                if session_info and session_info.pid == stop_data.from_pid and
                    stop_data.stop_request_id and
                    (not stop_data.supervised or
                        session_info.stop_request_id == stop_data.stop_request_id) then
                    if not session_info.stop_escalation
                        or session_info.stop_request_id ~= stop_data.stop_request_id then
                        clear_stop_deadline(session_info)
                        session_info.stop_request_id = stop_data.stop_request_id
                        session_info.stop_escalation = 1
                        apply_stop_level(stop_data.session_id, session_info, 1)
                    end
                end
            elseif topic == consts.TOPICS.STOP_RESOLVED then
                local resolved = payload:data()
                local session_info = state.active_sessions[resolved.session_id]
                if session_info and session_info.pid == resolved.from_pid and
                    resolved.stop_request_id and
                    session_info.stop_request_id == resolved.stop_request_id then
                    clear_stop_deadline(session_info)
                    session_info.stop_escalation = nil
                    session_info.stop_request_id = nil
                end
            elseif topic == consts.TOPICS.STOP_DEADLINE then
                local deadline = payload:data()
                local session_info = state.active_sessions[deadline.session_id]
                if session_info and deadline_matches(session_info, deadline) then
                    if deadline.level == 1 then
                        cancel_stopped_session(deadline.session_id, session_info)
                    else
                        terminate_stopped_session(deadline.session_id, session_info)
                    end
                end
            elseif topic == consts.TOPICS.SESSION_OPENED then
                local started = payload:data()
                local session_info = state.active_sessions[started.session_id]
                if session_info and session_info.pid == started.from_pid and not session_info.open_notified then
                    session_info.open_notified = true
                    if state.user_hub_pid then
                        process.send(state.user_hub_pid :: string, consts.TOPICS.SESSION_OPENED, {
                            session_id = started.session_id,
                            active_session_ids = get_active_session_ids(),
                            request_id = session_info.request_id
                        })
                    end
                end
            elseif string.sub(topic, 1, string.len(consts.TOPIC_PREFIXES.SESSION)) == consts.TOPIC_PREFIXES.SESSION then
                if state.user_hub_pid then
                    process.send(state.user_hub_pid :: string, topic, payload:data())
                end
            end
        elseif result.channel == events then
            local event = result.value
            if event.kind == process.event.LINK_DOWN or event.kind == process.event.EXIT then
                for session_id, session_info in pairs(state.active_sessions) do
                    if session_info.pid == event.from then
                        if event.result and event.result.status == "refused" then
                            send_error(session_info.conn_pid, consts.ERROR_CODES.SESSION_SPAWN,
                                "Failed to create session: " .. tostring(event.result.error or "Session start refused"),
                                session_info.request_id)
                            clear_stop_deadline(session_info)
                            if state.active_sessions[session_id] == session_info then
                                state.active_sessions[session_id] = nil
                                state.session_count = state.session_count - 1
                            end
                            if state.session_count == 0 then
                                gc_ticker:stop()
                                return { status = "shutdown", user_id = state.user_id,
                                    reason = "no_active_sessions" }
                            end
                            break
                        end

                        clear_stop_deadline(session_info)
                        local err = "unexpected exit"
                        if session_info.stop_escalation and session_info.stop_escalation >= 2 then
                            err = "terminated"
                        elseif event.result and event.result.status == "shutdown" then
                            err = event.result.interrupted and "interrupted" or "completed"
                        end
                        if event.result and event.result.error then
                            err = tostring(event.result.error)
                        end

                        -- Update session status in database based on termination reason
                        local target_status, success, status_err, recovery_err =
                            finalize_exit(session_id, session_info, event.result)
                        if recovery_err then
                            logger:warn("failed to recover pending calls", {
                                session_id = session_id, error = recovery_err
                            })
                        end
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
                            local error_update = exit_error_payload(session_id, target_status, err)
                            if error_update then
                                process.send(state.user_hub_pid :: string,
                                    consts.TOPIC_PREFIXES.SESSION .. session_id, error_update)
                            end
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
            check_inactive_sessions()
        end
    end

    gc_ticker:stop()
    logger:info("plugin shutting down", { user_id = state.user_id, active_sessions = state.session_count })
    return { status = "shutdown", user_id = state.user_id }
end

return { run = run, fire_session_end_hook = fire_session_end_hook }
