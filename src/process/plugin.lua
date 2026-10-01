local time = require("time")
local json = require("json")
local uuid = require("uuid")
local logger = require("logger"):named("relay.session")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local start_tokens = require("start_tokens")
local consts = require("consts")
local input_policy = require("input_policy")
local session_status = require("session_status")
local form_recovery = require("form_recovery")
local funcs = require("funcs")
local message_repo = require("message_repo")
local answer_admission = require("answer_admission")
local reader = require("reader")
local writer = require("writer")
local upstream = require("upstream")

type PluginArgs = {
    user_id: string,
    user_metadata: {[string]: any}?,
    user_hub_pid: any?,
}

type ActiveSession = {
    pid: any,
    open_notified: boolean?,
    pending_requests: {any}?,
    created_at: time.Time,
    last_activity: time.Time?,
    terminating: boolean,
    terminate_reason: string?,
    stop_escalation: number?,
    stop_request_id: string?,
    stop_deadline: any?,
    -- Started to admit pending form answers (wake-up or scan), not by a client.
    answer_start: boolean?,
}

-- Bounds of the periodic scan for sessions that hold pending form answers
-- (resume_pending_answer_sessions): sessions listed per scan, sessions started
-- per scan, the longest wait in scans before a session whose start failed is
-- tried again, and the page size of the stale running session scan.
local RESUME_SCAN_LIMIT = 20
local RESUME_STARTS_PER_SCAN = 3
local MAX_RESUME_WAIT = 32
local STALE_PAGE_SIZE = 50

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

-- The notice that a turn did not complete: after a failed exit, and for a
-- turn the runtime interrupted (`interrupted`, stored idle).
local function exit_error_payload(session_id, status, reason, interrupted)
    if status ~= consts.STATUS.FAILED and not interrupted then return nil end
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

local function status_after_exit(_session_info: any, result: any, exit_error: any)
    if not exit_error and type(result) == "table" and result.intentional_exit == true
        and result.status == "shutdown" and not result.error and not result.interrupted then
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
    return message_repo.recover_pending(session_id, anchor, form_recovery.settle_call)
end

-- Admits, with no turn, the form answers a stopped turn left pending: the
-- same admission a Stop the session honours runs when it settles
-- (session.flush_held, phase "stop"), in acceptance order and each after
-- the steering accepted before it (answer_admission.admit_in_order). The
-- user's clients (`hub_pid`) are told each answer was received. Returns the
-- admitted rows, to publish once the idle status is out. A row whose
-- admission fails stays pending, and the next session start admits it with
-- a turn.
local function admit_stopped_answers(session_id: string, user_id: string, hub_pid: any)
    local pending, list_err = message_repo.list_pending_answers(session_id, 1)
    if not pending then return {}, list_err end
    if #pending == 0 then return {}, nil end
    local stored, read_err = session_repo.get(session_id, user_id)
    if not stored then return {}, read_err or "Session was not found" end
    local session_writer, writer_err = writer.new(session_id)
    if not session_writer then return {}, writer_err end
    return answer_admission.admit_stopped(session_id, session_writer, upstream.new(session_id, nil, hub_pid),
        stored.meta and stored.meta.interaction)
end

-- Stores `target_status` with the interaction recovery gives it. Before
-- that, `opts.recover_calls` repairs the calls an interrupted turn left
-- pending, and `opts.admit_stopped` admits its pending form answers with no
-- turn (admit_stopped_answers, clients told through `opts.hub_pid`).
-- Returns the status, whether it was stored, the storage error, the call
-- repair error, the interaction and the admitted answer rows.
local function settle_session(session_id: string, user_id: string, target_status: string, opts: any?)
    opts = opts or {}
    local recovery_err = nil
    if opts.recover_calls then
        local _, err = recover_session_calls(session_id)
        recovery_err = err
    end
    local admitted = {}
    if opts.admit_stopped then
        local admit_err
        admitted, admit_err = admit_stopped_answers(session_id, user_id, opts.hub_pid)
        if admit_err then
            logger:warn("form answer admission failed", { session_id = session_id, error = tostring(admit_err) })
        end
    end
    local stored, read_err = session_repo.get(session_id, user_id)
    if not stored then
        return target_status, false, read_err or "Session was not found", recovery_err, nil, admitted
    end
    local meta = stored.meta or {}
    local interaction = input_policy.recovery_snapshot(stored, target_status)
    meta.interaction = interaction
    local success, status_err = session_repo.update_session_meta(session_id, {
        status = target_status, meta = meta
    })
    return target_status, success, status_err, recovery_err, interaction, admitted
end

-- Settles a session whose turn was cut off from outside, either by a runtime
-- stop or by the plugin enforcing the user's Stop (stop_enforced). It is
-- stored idle with an interaction that takes input, because nothing in the
-- session failed and a failed status would keep Send disabled. Pending calls
-- are repaired first. After an enforced Stop the pending form answers are
-- admitted with no turn (`admit_stopped`), and after a runtime stop they stay
-- pending for the next session start. Clients get the recovery notice only
-- when the runtime stopped (settle_stale_running).
local function settle_interrupted(session_id: string, user_id: string, opts: any?)
    opts = opts or {}
    return settle_session(session_id, user_id, consts.STATUS.IDLE,
        { recover_calls = true, admit_stopped = opts.admit_stopped, hub_pid = opts.hub_pid })
end

-- Whether the plugin cancelled or terminated the session process to enforce
-- the user's Stop: the turn did not stop within the stop deadline (a model
-- call Stop cannot interrupt, for example), so the exit that follows is that
-- Stop, not a failure of the session.
local function stop_enforced(session_info: any): boolean
    return type(session_info) == "table" and (tonumber(session_info.stop_escalation) or 0) >= 2
end

-- Settles a session process that exited while the runtime keeps running. A
-- process that exits with an error, or is cancelled for any other reason, is
-- stored failed. After an enforced Stop the answers accepted during the
-- stopped turn are admitted with no turn, so they never start one later;
-- `hub_pid` receives their announcements.
local function finalize_exit(session_id: string, user_id: string, session_info: any, result: any,
    exit_error: any, hub_pid: any?)
    if stop_enforced(session_info) then
        return settle_interrupted(session_id, user_id, { admit_stopped = true, hub_pid = hub_pid })
    end
    local target_status = status_after_exit(session_info, result, exit_error)
    return settle_session(session_id, user_id, target_status,
        { recover_calls = target_status == consts.STATUS.FAILED })
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
        shutting_down = false,
        -- session id -> { failures, wait }: a session started for its
        -- pending form answers that failed; the scan skips it `wait` times.
        resume_backoff = {} :: {[string]: any},
        stale_checked = false,
        -- The grace period after the user's last client left, while it runs:
        -- { generation, timer, cancel } (begin_shutdown).
        shutdown_deadline = nil :: any,
        shutdown_generation = 0,
    }

    process.set_options({ trap_links = true })

    -- Named so the form state API can wake a stopped session without going
    -- through the relay hub, which would make the HTTP handler the session's
    -- client connection. Without the name a wake is lost and the answer is
    -- admitted on the next session start.
    local plugin_name = consts.REGISTRY.PLUGIN .. state.user_id
    local named, name_err = process.registry.register(plugin_name)
    if not named then
        logger:warn("session plugin registry name unavailable", { user_id = state.user_id, error = tostring(name_err) })
    end

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

    local function publish_after_commit(target_pid, topic, payload)
        if not target_pid then return true end
        local ok, send_err = pcall(process.send, target_pid :: string, topic, payload)
        if not ok then
            logger:warn("failed to publish committed session state", {
                topic = topic,
                error = tostring(send_err),
            })
            return false
        end
        return true
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

    -- The user hub tells this plugin "shutdown" when the user's last client
    -- disconnects and "resume" when a client connects again. A page reload is
    -- both, a fraction of a second apart: the old socket closes before the
    -- new one opens. Finishing a session is a Stop for its turn (the turn
    -- ends at its next boundary, steering still unused stays pending and
    -- form answers wait for the next session start), so the sessions are not
    -- finished at the first "shutdown". A client has the grace period to
    -- return; "resume" ends it, and only a grace period that runs out
    -- finishes them (finish_sessions_for_shutdown).
    local function clear_shutdown_deadline()
        local deadline = state.shutdown_deadline
        if not deadline then return end
        state.shutdown_deadline = nil
        deadline.timer:stop()
        deadline.cancel:send(true)
    end

    local function begin_shutdown()
        -- A repeated "shutdown" keeps the grace period it already started.
        if state.shutting_down then return end
        state.shutting_down = true
        state.shutdown_generation = state.shutdown_generation + 1
        local plugin_pid = process.pid()
        local generation = state.shutdown_generation
        local timer = time.timer(consts.TIMEOUTS.SHUTDOWN_GRACE)
        local cancel = channel.new(1)
        state.shutdown_deadline = { generation = generation, timer = timer, cancel = cancel }
        coroutine.spawn(function()
            local selected = channel.select({ timer:channel():case_receive(), cancel:case_receive() })
            if selected.channel == timer:channel() then
                process.send(plugin_pid, consts.PLUGIN_TOPICS.SHUTDOWN_DEADLINE, { generation = generation })
            end
        end)
        logger:info("last client disconnected - sessions finish unless one reconnects", {
            user_id = state.user_id,
            grace = consts.TIMEOUTS.SHUTDOWN_GRACE,
        })
    end

    -- A client connected again ("resume"): the grace period ends and nothing
    -- is finished. Sessions the grace period already finished keep finishing.
    local function cancel_shutdown()
        if not state.shutting_down then return end
        state.shutting_down = false
        clear_shutdown_deadline()
        logger:info("cancelled shutdown - client reconnected", { user_id = state.user_id })
    end

    -- The grace period ran out. The deadline message carries the generation
    -- of the grace period that sent it, which a message from a client never
    -- does, and one that belongs to a cancelled or an older grace period is
    -- ignored.
    local function finish_sessions_for_shutdown(deadline_data: any)
        local deadline = state.shutdown_deadline
        if not deadline or type(deadline_data) ~= "table" or deadline_data.generation ~= deadline.generation then
            return
        end
        state.shutdown_deadline = nil
        logger:info("no client returned - notifying sessions to finish", { user_id = state.user_id })
        for session_id, session_info in pairs(state.active_sessions) do
            graceful_terminate_session(session_id, session_info, "shutdown")
        end
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

    local function notify_session_opened(session_id, request_id)
        if state.user_hub_pid then
            process.send(state.user_hub_pid :: string, consts.TOPICS.SESSION_OPENED, {
                session_id = session_id,
                active_session_ids = get_active_session_ids(),
                request_id = request_id
            })
        end
    end

    local function queue_start_request(session_info: any, kind: string, payload_data: any)
        session_info.pending_requests = session_info.pending_requests or {}
        if #session_info.pending_requests >= 256 then
            send_error(payload_data.conn_pid, "SESSION_BUSY",
                "Pending startup request buffer is full", payload_data.request_id)
            return
        end
        table.insert(session_info.pending_requests, { kind = kind, payload = payload_data })
    end

    local function fail_start_requests(session_info, message)
        for _, request in ipairs(session_info.pending_requests or {}) do
            local request_data = request.payload or {}
            send_error(request_data.conn_pid, consts.ERROR_CODES.SESSION_SPAWN,
                message, request_data.request_id)
        end
        session_info.pending_requests = {}
    end

    local function fail_inbox_requests(code, message)
        while true do
            local selected = channel.select({ inbox:case_receive(), default = true })
            if not selected.ok or selected.channel ~= inbox then return end
            local request = selected.value
            local topic = request:topic()
            if topic == consts.PLUGIN_TOPICS.OPEN or topic == consts.PLUGIN_TOPICS.MESSAGE
                or topic == consts.PLUGIN_TOPICS.COMMAND or topic == consts.PLUGIN_TOPICS.CLOSE then
                local payload_data = request:payload():data() or {}
                send_error(payload_data.conn_pid, code, message, payload_data.request_id)
            end
        end
    end

    local function forward_request(session_info, session_id, topic_type, request_data)
        local conn_pid = request_data.conn_pid
        local request_id = request_data.request_id
        if session_info.terminating then
            send_error(conn_pid, consts.ERROR_CODES.SESSION_NOT_FOUND,
                "Session is finishing", request_id)
            return
        end
        if topic_type == consts.HANDLER_TYPES.MESSAGE then
            local _, send_err = process.send(session_info.pid :: string, consts.TOPICS.MESSAGE,
                { conn_pid = conn_pid, data = request_data.data, request_id = request_id })
            if send_err then
                send_error(conn_pid, consts.ERROR_CODES.SESSION_NOT_FOUND, send_err, request_id)
            end
        elseif topic_type == consts.HANDLER_TYPES.COMMAND then
            local cmd_data = request_data.data or {}
            cmd_data.conn_pid = conn_pid
            if request_id then cmd_data.request_id = request_id end
            if cmd_data.command == consts.COMMANDS.STOP then
                cmd_data.stop_supervised = true
                local stop_request_id = session_info.stop_request_id
                if not stop_request_id then
                    local generated, id_err = uuid.v7()
                    if id_err then
                        send_error(conn_pid, consts.ERROR_CODES.SESSION_SPAWN, id_err, request_id)
                        return
                    end
                    stop_request_id = generated
                end
                cmd_data.stop_request_id = stop_request_id
            end
            local _, send_err = process.send(session_info.pid :: string, consts.TOPICS.COMMAND, cmd_data)
            if send_err then
                send_error(conn_pid, consts.ERROR_CODES.SESSION_NOT_FOUND, send_err, request_id)
            elseif cmd_data.command == consts.COMMANDS.STOP then
                -- Keep the same correlation while the child commits Stop. The
                -- escalation deadline starts only after STOP_ESCALATION arrives.
                session_info.stop_request_id = cmd_data.stop_request_id
            end
        end
    end

    local function create_session(payload_data, is_open)
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
            local session_info = state.active_sessions[session_id]
            if is_open then
                if session_info.open_notified then
                    notify_session_opened(session_id, payload_data.request_id)
                else
                    queue_start_request(session_info, "open", payload_data)
                end
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
        if not session_pid then
            local no_pid_err = "Session process did not start"
            send_error(payload_data.conn_pid, consts.ERROR_CODES.SESSION_SPAWN,
                no_pid_err, payload_data.request_id)
            return nil, no_pid_err
        end

        local now = time.now()
        local pending_requests = {}
        if is_open then
            table.insert(pending_requests, { kind = "open", payload = payload_data })
        end
        state.active_sessions[session_id] = {
            pid = session_pid,
            pending_requests = pending_requests,
            created_at = now,
            last_activity = now,
            terminating = false,
            terminate_reason = nil
        }
        state.session_count = state.session_count + 1

        local action = create_new_session and consts.SESSION_OPS.CREATE or consts.SESSION_OPS.RECONNECT
        logger:info("session " .. action,
            { user_id = state.user_id, session_id = session_id, active_sessions = state.session_count })

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
        local function route(session_info)
            update_session_activity(session_id)
            if not session_info.open_notified then
                queue_start_request(session_info, topic_type, payload_data)
                return
            end
            forward_request(session_info, session_id, topic_type, payload_data)
        end

        logger:debug("routing message", { user_id = state.user_id, session_id = session_id, topic_type = topic_type })

        if not session_id and state.session_count == 0 then
            local created_session_id, err = create_session(payload_data, true)
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
            route(session_info)
        else
            -- Session ID provided but not in active sessions - try to recover
            logger:info("attempting to recover inactive session", { user_id = state.user_id, session_id = session_id })
            local created_session_id, err = create_session(payload_data, true)
            if err then
                send_error(conn_pid, consts.ERROR_CODES.SESSION_NOT_FOUND,
                    "Session not found and recovery failed: " .. err, request_id)
                return
            end

            -- Retry the message/command with the recovered session
            local recovered_session_info = state.active_sessions[created_session_id :: string]
            if recovered_session_info then
                session_id = created_session_id
                route(recovered_session_info)
            else
                send_error(conn_pid, consts.ERROR_CODES.SESSION_NOT_FOUND,
                    "Session recovery failed", request_id)
            end
        end
    end

    -- A form answer was accepted for one of this user's sessions. A running
    -- session gets the answer id (without one it looks for pending answers
    -- itself); a stopped one is started with no client connection and admits
    -- its pending answers on start. An unknown or foreign session is
    -- ignored: create_session only reopens sessions this user owns and never
    -- creates one without a start token.
    local function handle_wake(payload_data: any)
        if type(payload_data) ~= "table" or type(payload_data.session_id) ~= "string"
            or payload_data.session_id == "" then
            return
        end
        local session_id: string = payload_data.session_id
        local session_info = state.active_sessions[session_id]
        -- A session that is running (not finishing) takes its wake-up also
        -- while the grace period after the last client's disconnect runs.
        if session_info then
            if not session_info.terminating then
                local message_id = type(payload_data.message_id) == "string" and payload_data.message_id or nil
                process.send(session_info.pid :: string, consts.TOPICS.FORM_ANSWER, { message_id = message_id })
            end
            return
        end
        if state.shutting_down then return end
        local started_id, err = create_session({ session_id = session_id })
        if err then
            logger:warn("form answer wake could not start the session",
                { user_id = state.user_id, session_id = session_id, error = tostring(err) })
            return
        end
        local started = state.active_sessions[started_id :: string]
        if started then started.answer_start = true end
    end

    -- Scans for this user's sessions that hold form answers nobody admitted.
    -- A stopped session is started (the wake-up was lost, e.g. the runtime
    -- restarted while no client was connected); a running one is asked to
    -- look again (its admission failed, or its wake-up was lost). Bounded:
    -- a few starts per scan, never at the cost of evicting a session the
    -- user may be using, and a session whose start failed waits a growing
    -- number of scans, so it neither restarts on every tick nor keeps the
    -- others from their turn.
    local function resume_pending_answer_sessions()
        if state.shutting_down then return end
        local waiting = {}
        for session_id, entry in pairs(state.resume_backoff) do
            if entry.wait > 0 then
                entry.wait = entry.wait - 1
                waiting[session_id] = true
            end
        end
        local exclude = {}
        for session_id in pairs(waiting) do table.insert(exclude, session_id) end
        table.sort(exclude)
        local ids, err = message_repo.list_sessions_with_pending_answers(state.user_id, RESUME_SCAN_LIMIT,
            { exclude = exclude })
        if err then
            logger:warn("pending form answer scan failed", { user_id = state.user_id, error = tostring(err) })
            return
        end
        local starts = 0
        for _, session_id in ipairs(ids or {}) do
            if state.active_sessions[session_id] then
                handle_wake({ session_id = session_id })
            elseif not waiting[session_id] and starts < RESUME_STARTS_PER_SCAN
                and state.session_count < consts.LIMITS.MAX_SESSIONS_PER_USER - 1 then
                starts = starts + 1
                handle_wake({ session_id = session_id })
            end
        end
    end

    -- A session started for its pending answers that exits with a failure
    -- waits longer before the next try; a clean exit clears that.
    local function note_resume_exit(session_id, session_info, target_status)
        if target_status ~= consts.STATUS.FAILED then
            state.resume_backoff[session_id] = nil
            return
        end
        if not session_info.answer_start then return end
        local entry = state.resume_backoff[session_id] or { failures = 0, wait = 0 }
        entry.failures = entry.failures + 1
        entry.wait = math.min(2 ^ (entry.failures - 1), MAX_RESUME_WAIT)
        state.resume_backoff[session_id] = entry
    end

    -- Tells the user's clients how a session ended: the stored status and
    -- interaction, once they are committed.
    local function report_final_status(session_id, target_status, stored, reason, interaction, interrupted)
        if not state.user_hub_pid then return end
        local error_update = exit_error_payload(session_id, target_status, reason, interrupted)
        if error_update then
            publish_after_commit(state.user_hub_pid, consts.TOPIC_PREFIXES.SESSION .. session_id, error_update)
        end
        if stored then
            publish_after_commit(state.user_hub_pid, consts.TOPIC_PREFIXES.SESSION .. session_id, {
                type = consts.UPSTREAM_TYPES.UPDATE,
                session_id = session_id,
                status = target_status,
                interaction = interaction,
            })
        end
    end

    -- Sessions left "running" when the whole runtime stopped: no plugin saw
    -- their process exit, so the stored status still says running, and the
    -- Host shows Stop and blocks Send until something reopens the session.
    -- Once, at start, each such session of this user that no live process
    -- holds is settled as interrupted (settle_interrupted: pending calls
    -- repaired, status idle with an interaction that takes input, clients
    -- told with the recovery notice). Its form answers read as interrupted.
    -- All of the user's running sessions are read, a page at a time; the
    -- pages follow session ids, so settling a session does not move the rows
    -- of later pages.
    local function settle_stale_running()
        local after = nil :: string?
        repeat
            local page, err = session_repo.list_by_user_status(state.user_id, consts.STATUS.RUNNING,
                STALE_PAGE_SIZE, { after = after })
            if not page then
                logger:warn("stale session status scan failed", { user_id = state.user_id, error = tostring(err) })
                return
            end
            for _, session in ipairs(page.sessions or {}) do
                local session_id = tostring(session.session_id)
                if not state.active_sessions[session_id] and session_status.is_stale_running(session) then
                    local target_status, stored, status_err, recovery_err, interaction =
                        settle_interrupted(session_id, state.user_id :: string)
                    if recovery_err or status_err then
                        logger:warn("stale session status could not be settled", { session_id = session_id,
                            error = tostring(status_err or recovery_err) })
                    end
                    report_final_status(session_id, target_status, stored, "runtime stopped", interaction, true)
                end
            end
            -- A cursor that does not move would read the same page forever.
            if page.next_cursor == after then return end
            after = page.next_cursor
        until not after
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

    -- First pending-answer scan as an ordinary inbox message, after start-up.
    process.send(process.pid(), consts.PLUGIN_TOPICS.SCAN_ANSWERS, {})

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
                create_session(payload_data, true)
            elseif topic == consts.PLUGIN_TOPICS.CLOSE then
                handle_session_close(payload:data())
            elseif topic == consts.PLUGIN_TOPICS.MESSAGE then
                handle_message_or_command(payload:data(), consts.HANDLER_TYPES.MESSAGE)
            elseif topic == consts.PLUGIN_TOPICS.COMMAND then
                handle_message_or_command(payload:data(), consts.HANDLER_TYPES.COMMAND)
            elseif topic == consts.PLUGIN_TOPICS.SHUTDOWN then
                begin_shutdown()
            elseif topic == consts.PLUGIN_TOPICS.SHUTDOWN_DEADLINE then
                finish_sessions_for_shutdown(payload:data())
            elseif topic == consts.PLUGIN_TOPICS.WAKE then
                handle_wake(payload:data())
            elseif topic == consts.PLUGIN_TOPICS.SCAN_ANSWERS then
                if not state.stale_checked then
                    state.stale_checked = true
                    settle_stale_running()
                end
                resume_pending_answer_sessions()
            elseif topic == consts.PLUGIN_TOPICS.RESUME then
                cancel_shutdown()
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
                    local pending_requests = session_info.pending_requests or {}
                    session_info.pending_requests = {}
                    for _, request in ipairs(pending_requests) do
                        if request.kind == "open" then
                            notify_session_opened(started.session_id, request.payload.request_id)
                        else
                            forward_request(session_info, started.session_id,
                                request.kind, request.payload)
                        end
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
                local exit_result = event.result and event.result.value
                local exit_error = event.result and event.result.error
                for session_id, session_info in pairs(state.active_sessions) do
                    if session_info.pid == event.from then
                        if type(exit_result) == "table" and exit_result.status == "refused" then
                            fail_start_requests(session_info,
                                "Failed to create session: " .. tostring(exit_result.error or "Session start refused"))
                            clear_stop_deadline(session_info)
                            if state.active_sessions[session_id] == session_info then
                                state.active_sessions[session_id] = nil
                                state.session_count = state.session_count - 1
                            end
                            if state.session_count == 0 then
                                fail_inbox_requests(consts.ERROR_CODES.SESSION_SPAWN,
                                    "Failed to create session: " ..
                                    tostring(exit_result.error or "Session start refused"))
                                gc_ticker:stop()
                                clear_shutdown_deadline()
                                return { status = "shutdown", user_id = state.user_id,
                                    reason = "no_active_sessions" }
                            end
                            break
                        end

                        if not session_info.open_notified then
                            local reason = "Session exited before confirming start"
                            if exit_error or (type(exit_result) == "table" and exit_result.error) then
                                reason = exit_error or exit_result.error
                            end
                            fail_start_requests(session_info, "Failed to create session: " .. tostring(reason))
                        end

                        clear_stop_deadline(session_info)
                        local err = "unexpected exit"
                        if session_info.stop_escalation and session_info.stop_escalation >= 2 then
                            err = "terminated"
                        elseif type(exit_result) == "table" and exit_result.status == "shutdown" then
                            err = exit_result.interrupted and "interrupted" or "completed"
                        end
                        if exit_error or (type(exit_result) == "table" and exit_result.error) then
                            err = tostring(exit_error or exit_result.error)
                        end

                        -- Update session status in database based on termination reason
                        local target_status, success, status_err, recovery_err, interaction, admitted =
                            finalize_exit(session_id, state.user_id :: string, session_info, exit_result, exit_error,
                                state.user_hub_pid)
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
                        note_resume_exit(session_id, session_info, target_status)

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

                        -- Session status update first, then the closed notification.
                        -- An enforced Stop is what the user asked for, so it
                        -- publishes the idle status without the recovery error.
                        report_final_status(session_id, target_status, success, err, interaction, false)
                        -- Open views of the forms answered during an enforced
                        -- Stop reload their delivery state once it says idle.
                        answer_admission.publish_admitted(admitted)
                        if state.user_hub_pid then
                            publish_after_commit(state.user_hub_pid, consts.TOPICS.SESSION_CLOSED, {
                                session_id = session_id,
                                reason = err,
                                active_session_ids = get_active_session_ids()
                            })
                        end

                        -- Finished for a disconnect whose grace period ran
                        -- out, and a client connected again meanwhile: the
                        -- form answers it left pending are not left for the
                        -- next periodic scan, or for the plugin to start
                        -- again. Steering alone starts nothing: unused
                        -- steering stays pending, as after any Stop.
                        if session_info.terminate_reason == "shutdown" and not state.shutting_down then
                            resume_pending_answer_sessions()
                        end

                        if state.session_count == 0 then
                            fail_inbox_requests(consts.ERROR_CODES.SESSION_NOT_FOUND,
                                "Session exited: " .. err)
                            gc_ticker:stop()
                            clear_shutdown_deadline()
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
            resume_pending_answer_sessions()
        end
    end

    gc_ticker:stop()
    clear_shutdown_deadline()
    logger:info("plugin shutting down", { user_id = state.user_id, active_sessions = state.session_count })
    return { status = "shutdown", user_id = state.user_id }
end

return { run = run, fire_session_end_hook = fire_session_end_hook }
