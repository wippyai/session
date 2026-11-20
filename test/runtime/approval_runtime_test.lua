local test = require("test")
local consts = require("consts")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local message_repo = require("message_repo")
local approval_repo = require("approval_repo")
local session_service = require("session_service")
local wait_for_boot = require("wait_for_boot")
local security = require("security")
local store = require("store")
local uuid = require("uuid")
local time = require("time")
local json = require("json")
local sql = require("sql")

-- Tool approval with real Session processes (EE2-2710 AC 4, 21, 22, 24, 25
-- and 30). The unit suites in test/approval drive process_tools and the
-- inbox handlers directly; these start the Session process
-- (approval_session_worker, the real session.run with a scripted model) and,
-- where the plugin matters, the real session plugin (approval_plugin_worker),
-- with this test process as the user's relay hub. A tool records every launch
-- (approval_fixtures.tool), so "no tool ran" is read from the store, not
-- inferred from events.

local AGENT = "app.runtime:approval_agent"
local SESSION_WORKER = "app.runtime:approval_session_worker"
local PLUGIN_WORKER = "app.runtime:approval_plugin_worker"
local CONNECTION = "app.runtime:approval_connection"
local STATE = "app.runtime:approval_state"
local MARKED, PLAIN, GRANTED = "approval_marked_tool", "approval_plain_tool", "approval_granted_tool"
-- Only a hang reaches this: every wait ends on its event.
local EVENT_DEADLINE = "30s"
-- AC 21: a wait ends and tears down within 10 s.
local TEARDOWN_SECONDS = 10
local STATUS = consts.STATUS
local TYPES = consts.UPSTREAM_TYPES

local function storage(): any
    return assert(store.get(STATE))
end

-- Everything this process received, in order: { topic, data }. Exit events
-- of monitored processes are logged with topic "exit".
local log: {any} = {}
local cleanup_items: {any} = {}
-- The primary context ID of each session a test created.
local contexts: {[string]: string} = {}

local function recent(): string
    local out = {}
    for index = math.max(1, #log - 12), #log do
        local entry = log[index]
        local data = type(entry.data) == "table" and entry.data or {}
        local result = type(data.result) == "table" and data.result or {}
        out[#out + 1] = string.format("%s:%s:%s:%s", tostring(entry.topic), tostring(data.type or data.kind),
            tostring(data.call_id or data.request_id or data.point),
            tostring(data.status or data.code or data.message or result.error))
    end
    return table.concat(out, " | ")
end

local function receive_one(timer: any): any
    local inbox, events = process.inbox(), process.events()
    local selected = channel.select({ inbox:case_receive(), events:case_receive(), timer:channel():case_receive() })
    if selected.channel == timer:channel() then return nil end
    local entry
    if selected.channel == events then
        entry = { topic = "exit", data = selected.value }
    else
        entry = { topic = selected.value:topic(), data = selected.value:payload():data() }
    end
    log[#log + 1] = entry
    return entry
end

-- Waits for the first logged message after index `since` (default: all)
-- that matches. Returns its data and log index.
local function await(predicate: any, description: string, since: number?, timeout: string?): (any, number)
    for index = (since or 0) + 1, #log do
        if predicate(log[index].topic, log[index].data) then return log[index].data, index end
    end
    local timer = time.timer(timeout or EVENT_DEADLINE)
    while true do
        local entry = receive_one(timer)
        if not entry then error("Deadline waiting for " .. description .. "; last: " .. recent()) end
        if predicate(entry.topic, entry.data) then
            timer:stop()
            return entry.data, #log
        end
    end
end

-- Receives for `duration` and fails when a message after `since` matches.
local function absent(predicate: any, description: string, since: number, duration: string)
    for index = since + 1, #log do
        if predicate(log[index].topic, log[index].data) then error("Unexpected " .. description) end
    end
    local timer = time.timer(duration)
    while true do
        local entry = receive_one(timer)
        if not entry then return end
        if predicate(entry.topic, entry.data) then
            timer:stop()
            error("Unexpected " .. description .. "; last: " .. recent())
        end
    end
end

local function mark(): number
    return #log
end

local function now(): number
    return time.now():unix_nano() / 1000000000
end

local function is_type(data: any, kind: string, call_id: string?): boolean
    return type(data) == "table" and data.type == kind and (call_id == nil or data.call_id == call_id)
end

local function approval_event(state: string, call_id: string, session_id: string?): any
    return function(_topic: any, data: any)
        return is_type(data, "tool_approval", call_id) and type(data.approval) == "table"
            and data.approval.state == state and (session_id == nil or data.session_id == session_id)
    end
end

local function status_of(session_id: string, status: string): any
    return function(topic: any, data: any)
        return topic == "session:" .. session_id and type(data) == "table" and data.status == status
    end
end

local function reply_to(request_id: string): any
    return function(_topic: any, data: any)
        return type(data) == "table" and data.request_id == request_id
            and (data.type == TYPES.COMMAND_RESPONSE or data.type == TYPES.ERROR)
    end
end

local function exit_of(pid: any): any
    return function(topic: any, data: any) return topic == "exit" and data.from == pid end
end

local function paused(point: string): any
    return function(topic: any, data: any) return topic == "approval:paused" and data.point == point end
end

local function count_logged(predicate: any, since: number?): number
    local n = 0
    for index = (since or 0) + 1, #log do
        if predicate(log[index].topic, log[index].data) then n = n + 1 end
    end
    return n
end

-- A user of its own, so a plugin's stale scan and registry name see only
-- this test's sessions.
local function new_user(): string
    local user_id = uuid.v7()
    local db = assert(sql.get(consts.get_db_resource()))
    local _, err = db:execute("INSERT INTO app_users (user_id) VALUES ($1)", { user_id })
    db:release()
    assert(not err, tostring(err))
    table.insert(cleanup_items, { user_id = user_id })
    return user_id
end

local DEFAULT_SCRIPT = {
    { calls = { { id = "call-a", tool = MARKED, n = 1 }, { id = "call-c", tool = PLAIN, n = 3 } } },
}

-- A protected session (the approval agent) of `owner` with its model
-- script. Returns the session ID.
local function new_session(owner: string, script: any?): string
    local session_id, context_id = uuid.v7(), uuid.v7()
    assert(context_repo.create(context_id, "primary", "{}"))
    assert(session_repo.create(session_id, owner, context_id, "Approval runtime", "test", {}, { agent_id = AGENT }))
    local state = storage()
    state:set("reply:" .. session_id, process.pid())
    state:set("script:" .. session_id, script or DEFAULT_SCRIPT)
    contexts[session_id] = context_id
    table.insert(cleanup_items, { session_id = session_id, context_id = context_id })
    return session_id
end

local function track(pid: any): any
    table.insert(cleanup_items, { pid = pid })
    return pid
end

-- The tool calls that started, by their `n` argument.
local function launches(session_id: string): {[number]: boolean}
    local state, out = storage(), {}
    for n = 1, 9 do
        if state:get("launch:" .. session_id .. ":" .. tostring(n)) then out[n] = true end
    end
    return out
end

local function launch_count(session_id: string): number
    local n = 0
    for _ in pairs(launches(session_id)) do n = n + 1 end
    return n
end

local function model_calls(session_id: string): number
    local calls = storage():get("calls:" .. session_id)
    return tonumber(calls) or 0
end

-- Waits for the live result of each call, then for the idle status after the
-- last of them: the end of the turn, whatever closed or released the batch.
local function settled_then_idle(session_id: string, call_ids: {string}, since: number)
    local last = since
    for _, call_id in ipairs(call_ids) do
        local _, index = await(function(_topic: any, data: any)
            return type(data) == "table" and data.session_id == session_id and data.call_id == call_id
                and (data.type == TYPES.FUNCTION_SUCCESS or data.type == TYPES.FUNCTION_ERROR)
        end, "the result of " .. call_id, since)
        if index > last then last = index end
    end
    await(function(topic: any, data: any)
        return topic == "session:" .. session_id and type(data) == "table" and data.status == STATUS.IDLE
    end, "idle after the results", last)
end

-- Waits for model call `number` of the session, then for the idle status
-- published after it: the end of the turn that call answered.
local function turn_end(session_id: string, number: number, since: number)
    local _, index = await(function(topic: any, data: any)
        return topic == "approval:provider_call" and data.session_id == session_id and data.call_number == number
    end, "model call " .. tostring(number), since)
    await(function(topic: any, data: any)
        return topic == "session:" .. session_id and type(data) == "table" and data.status == STATUS.IDLE
    end, "idle after model call " .. tostring(number), index)
end

local function primary_context(session_id: string): any
    local context: any = assert(context_repo.get(contexts[session_id]))
    return json.decode(context.data) or {}
end

-- The tool call rows of a session by call ID (a list each, to count them).
local function call_rows(session_id: string): any
    local page: any = assert(message_repo.list_by_session(session_id))
    local rows = {}
    for _, message in ipairs(page.messages) do
        local call_id = type(message.metadata) == "table" and message.metadata.call_id or nil
        if message.type == consts.MSG_TYPE.FUNCTION and call_id then
            rows[call_id] = rows[call_id] or {}
            table.insert(rows[call_id], message)
        end
    end
    return rows
end

-- The behavior control state of the first assistant row that holds one: the
-- tool round's model step.
local function round_controls(session_id: string): string
    local page: any = assert(message_repo.list_by_session(session_id))
    for _, message in ipairs(page.messages) do
        local state = type(message.metadata) == "table" and message.metadata.behavior_control_state or nil
        if state then return tostring(state) end
    end
    return "none"
end

-- The approval records of a session by call ID.
local function records(session_id: string): any
    local db = assert(sql.get(consts.get_db_resource()))
    local rows, err = db:query("SELECT approval_id, call_id FROM session_tool_approvals WHERE session_id = $1",
        { session_id })
    db:release()
    assert(not err, tostring(err))
    local out = {}
    for _, item in ipairs(rows or {}) do out[item.call_id] = assert(approval_repo.get(nil, item.approval_id)) end
    return out
end

local function record_of(session_id: string, call_id: string): any
    return assert(records(session_id)[call_id], "no approval record for " .. call_id)
end

-- What a session's calls and the batch of `call_ids[1]` read as: per call
-- "<call>=<record state or ->/<row status>/<outcome>" (outcome
-- not_run:<reason>, unknown for "interrupted, outcome unknown", ran, or the
-- result text), then "batch=<state>:<close reason>:<controls>" and the
-- activity kind. Same form as the unit suites' recovery_summary.
local function summary(session_id: string, call_ids: {string}): string
    local rows, by_call = call_rows(session_id), records(session_id)
    local parts, batch_id = {}, nil
    for _, call_id in ipairs(call_ids) do
        local row = rows[call_id] and rows[call_id][1]
        local metadata = row and row.metadata or {}
        local result = metadata.result
        local outcome = tostring(result)
        if type(result) == "table" then
            outcome = result.executed == false and ("not_run:" .. tostring(result.reason)) or "ran"
        elseif result == message_repo.INTERRUPTED_RESULT then
            outcome = "unknown"
        end
        local record = by_call[call_id]
        batch_id = batch_id or metadata.batch_id or (record and record.batch_id)
        parts[#parts + 1] = string.format("%s=%s/%s/%s", call_id, record and record.state or "-",
            tostring(metadata.status), outcome)
    end
    if batch_id then
        local batch: any = assert(approval_repo.get_batch(nil, batch_id))
        parts[#parts + 1] = string.format("batch=%s:%s:%s", batch.state, tostring(batch.close_reason), batch.controls)
    end
    local activity: any = assert(approval_repo.read_activity(nil, session_id))
    parts[#parts + 1] = "activity=" .. tostring(type(activity.activity) == "table" and activity.activity.kind or nil)
    return table.concat(parts, " ")
end

-- AC 30: every call has exactly one stored result and at most one live
-- terminal event, and every gated call that started has a committed
-- approved record with disposition dispatched, released before it ran. A
-- dispatched call is never reported as not run.
local function assert_one_result_each(session_id: string, calls: {any}, label: string)
    local rows, by_call, ran = call_rows(session_id), records(session_id), launches(session_id)
    for _, call in ipairs(calls) do
        local list = rows[call.id] or {}
        test.eq(#list, 1, label .. ": one row for " .. call.id)
        local metadata = list[1] and list[1].metadata or {}
        test.is_true(metadata.status ~= nil and metadata.status ~= consts.FUNC_STATUS.PENDING,
            label .. ": " .. call.id .. " has its result")
        local terminal = {}
        for _, entry in ipairs(log) do
            local data = entry.data
            if type(data) == "table" and data.session_id == session_id
                and (is_type(data, TYPES.FUNCTION_SUCCESS, call.id) or is_type(data, TYPES.FUNCTION_ERROR, call.id)) then
                terminal[#terminal + 1] = string.format("%s %s(%s, %s, %s)", tostring(entry.topic), data.type,
                    tostring(data.outcome), tostring(data.error), tostring(json.encode(data.approval)))
            end
        end
        test.is_true(#terminal <= 1, label .. ": at most one terminal event for " .. call.id .. ": "
            .. table.concat(terminal, "; "))
        local record = by_call[call.id]
        if ran[call.n] and call.gated then
            test.is_true(record ~= nil and record.state == "approved" and record.disposition == "dispatched",
                label .. ": " .. call.id .. " ran only after a committed approval and its release")
        end
        if record and record.disposition == "dispatched" then
            test.is_false(type(metadata.result) == "table" and metadata.result.executed == false,
                label .. ": a dispatched call is never reported as not run")
        end
    end
end

-------------------------------------------------------------------------------
-- Session handles. `direct` starts the Session process with this test as its
-- parent (the plugin's place); `via_plugin` talks to a real plugin as its
-- relay hub, for a client connection `conn`.

local function user_scope(): any
    return security.new_scope():with(assert(security.policy("wippy.security:general")) :: security.Policy)
end

local function decision_fields(record: any, decision: string, extra: any?): any
    local data: any = { command = "tool_approval", approval_id = record.approval_id, decision = decision,
        intent_digest = record.intent_digest, expected_revision = record.revision }
    for key, value in pairs(extra or {}) do data[key] = value end
    return data
end

local function direct(session_id: string, owner: string, fixture: any?, create: boolean?): any
    local handle: any = { session_id = session_id, owner = owner }
    -- The Session process runs as its owner, as the plugin starts it.
    local pid, err = process.with_context({}):with_actor(security.new_actor(owner, {})):with_scope(user_scope())
        :spawn_monitored(SESSION_WORKER, "app:processes", {
        session_id = session_id, user_id = owner, parent_pid = process.pid(), create = create == true,
        conn_pid = process.pid(), user_metadata = fixture or {},
    })
    test.is_nil(err)
    handle.pid = track(pid)
    function handle:send(topic: string, payload: any)
        assert(process.send(self.pid, topic, payload))
    end
    function handle:command(data: any): string
        local request_id = "cmd-" .. uuid.v7()
        data.request_id = request_id
        data.sender_user_id = self.owner
        self:send(consts.TOPICS.COMMAND, data)
        return request_id
    end
    function handle:message(text: string): string
        local request_id = "msg-" .. uuid.v7()
        self:send(consts.TOPICS.MESSAGE, { request_id = request_id, data = { text = text } })
        return request_id
    end
    function handle:surfaces(live: number, revision: number)
        self:send(consts.TOPICS.APPROVAL_SURFACES, { session_id = self.session_id, live = live, revision = revision })
    end
    function handle:finish()
        self:send(consts.TOPICS.FINISH_AND_EXIT, {})
    end
    -- Ingress answers a command only after the start-up (recovery included).
    local ready = handle:command({ command = "context_transport_capabilities", capabilities_version = 1 })
    local is_reply, is_exit = reply_to(ready), exit_of(handle.pid)
    local answer = await(function(topic: any, data: any) return is_reply(topic, data) or is_exit(topic, data) end,
        "session readiness")
    if answer.from == handle.pid then
        error("The Session process exited at start: " .. tostring(answer.result and answer.result.error))
    end
    return handle
end

local function start_plugin(user_id: string, fixture: any?): any
    local pid = assert(process.with_context({}):with_actor(security.new_actor(user_id, {})):with_scope(user_scope())
        :spawn_monitored(PLUGIN_WORKER, "app:processes", {
            user_id = user_id, user_hub_pid = process.pid(), user_metadata = fixture or {},
        }))
    return track(pid)
end

local function new_connection(): any
    return track(assert(process.spawn_monitored(CONNECTION, "app:processes", { forward_to = process.pid() })))
end

local function via_plugin(plugin_pid: any, session_id: string, owner: string, conn: any): any
    local handle: any = { session_id = session_id, owner = owner, plugin = plugin_pid, conn = conn }
    function handle:command(data: any, conn_pid: any?): string
        local request_id = "cmd-" .. uuid.v7()
        assert(process.send(self.plugin, consts.PLUGIN_TOPICS.COMMAND, { session_id = self.session_id,
            conn_pid = conn_pid or self.conn, request_id = request_id, data = data }))
        return request_id
    end
    function handle:message(text: string): string
        local request_id = "msg-" .. uuid.v7()
        assert(process.send(self.plugin, consts.PLUGIN_TOPICS.MESSAGE, { session_id = self.session_id,
            conn_pid = self.conn, request_id = request_id, data = { text = text } }))
        return request_id
    end
    function handle:open(conn_pid: any?)
        local since = mark()
        assert(process.send(self.plugin, consts.PLUGIN_TOPICS.OPEN, { session_id = self.session_id,
            conn_pid = conn_pid or self.conn }))
        await(function(topic: any) return topic == consts.TOPICS.SESSION_OPENED end, "session opened", since)
    end
    -- tool_approval_surface from connection `conn_pid` (default the handle's).
    function handle:surface(enabled: boolean, conn_pid: any?)
        local target = conn_pid or self.conn
        local request_id = self:command({ command = consts.COMMANDS.TOOL_APPROVAL_SURFACE, enabled = enabled }, target)
        await(function(topic: any, data: any)
            return topic == "approval:conn" and data.conn == target and type(data.data) == "table"
                and data.data.request_id == request_id
        end, "surface command reply")
    end
    function handle:session_pid(): any
        local pid, err = process.registry.lookup("session." .. self.session_id)
        if not pid then error("no Session process: " .. tostring(err) .. "; last: " .. recent()) end
        return pid
    end
    return handle
end

-- Waits for the pending request of `call_id`. Returns its stored record.
local function pending(session_id: string, call_id: string, since: number?): any
    local data = await(approval_event("pending", call_id, session_id), "pending request of " .. call_id, since)
    return assert(approval_repo.get(nil, data.approval.approval_id))
end

-- Waits for the gate's wait pass after index `since` (approval_session_worker
-- reports it): a signal sent after it reaches a gate that is waiting, not
-- one still in its first read.
local function parked(session_id: string, since: number)
    await(function(topic: any, data: any)
        return topic == "approval:parked" and data.session_id == session_id
    end, "the waiting gate", since)
end

-- Sends a decision and waits for its reply. Returns the reply.
local function decide(handle: any, record: any, decision: string, extra: any?): any
    local request_id = handle:command(decision_fields(record, decision, extra))
    return await(reply_to(request_id), "reply to " .. decision)
end

local function stop(handle: any)
    local request_id = handle:command({ command = consts.COMMANDS.STOP })
    -- A committed Stop answers with a session update that names the request.
    await(function(_topic: any, data: any)
        return type(data) == "table" and data.request_id == request_id
    end, "committed Stop")
end

-- Ends a direct handle's process and waits for its exit.
local function close(handle: any)
    handle:finish()
    await(exit_of(handle.pid), "session exit")
end

local function cleanup()
    local state = storage()
    for index = #cleanup_items, 1, -1 do
        local item = cleanup_items[index]
        if item.pid then
            process.terminate(item.pid)
        elseif item.session_id then
            session_repo.delete(item.session_id)
            context_repo.delete(item.context_id)
            for _, key in ipairs({ "reply:", "script:", "calls:", "clock:", "armed:" }) do
                state:delete(key .. item.session_id)
            end
            for n = 1, 9 do state:delete("launch:" .. item.session_id .. ":" .. tostring(n)) end
        elseif item.user_id then
            local db = assert(sql.get(consts.get_db_resource()))
            db:execute("DELETE FROM app_users WHERE user_id = $1", { item.user_id })
            db:release()
        end
    end
    cleanup_items = {}
    log = {}
end

-------------------------------------------------------------------------------
-- AC 4, 21, 22: the wait of a real Session process.

local function define_wait_tests()
    describe("Tool approval wait in a real Session process", function()
        before_all(function() wait_for_boot.run() end)
        after_each(function() cleanup() end)

        -- AC 4, and the positive control for every "no tool ran" below.
        it("runs an approved call after tool_approval pending and approved, function_call, then function_success", function()
            local owner = new_user()
            local session_id = new_session(owner)
            local handle = direct(session_id, owner, nil, true)
            handle:surfaces(1, 1)
            local since = mark()
            handle:message("Delete record 1.")
            local record = pending(session_id, "call-a", since)
            test.eq(launch_count(session_id), 0, "nothing runs while the request waits")
            local reply = decide(handle, record, "approve")
            test.is_true(reply.success)
            turn_end(session_id, 2, since)
            -- The states in order. The release publishes the approved record
            -- again with its disposition (protocol section 4: `disposition`
            -- once known), so repeats of one state count once.
            local order, dispositions = {}, {}
            local function add(item: string)
                if order[#order] ~= item then order[#order + 1] = item end
            end
            for index = since + 1, #log do
                local data = log[index].data
                if is_type(data, "tool_approval", "call-a") then
                    add("tool_approval:" .. data.approval.state)
                    dispositions[#dispositions + 1] = tostring(data.approval.disposition)
                end
                if is_type(data, TYPES.FUNCTION_CALL, "call-a") or (is_type(data, TYPES.FUNCTION_CALL)
                    and data.message_id == record.tool_message_id) then
                    order[#order + 1] = "function_call:" .. tostring(type(data.approval) == "table" and data.approval.state)
                end
                if is_type(data, TYPES.FUNCTION_SUCCESS, "call-a") then order[#order + 1] = "function_success" end
            end
            test.eq(table.concat(order, " "),
                "tool_approval:pending tool_approval:approved function_call:approved function_success")
            test.eq(dispositions[#dispositions], "dispatched", "the last approval event carries the disposition")
            test.is_true(launches(session_id)[1] and launches(session_id)[3], "the approved call and its peer ran")
            test.eq(summary(session_id, { "call-a", "call-c" }),
                "call-a=approved/success/ran call-c=-/success/ran batch=released:nil:kept activity=nil")
            test.eq(round_controls(session_id), "applied")
            test.is_true(primary_context(session_id).native_behavior_applied == true,
                "the round's behavior control applies after an approved round")
            close(handle)
        end)

        it("ends the wait on a Stop that commits first within 10 s and refuses a later approval", function()
            local owner = new_user()
            local session_id = new_session(owner)
            local handle = direct(session_id, owner, nil, true)
            handle:surfaces(1, 1)
            local since = mark()
            handle:message("Delete record 1.")
            local record = pending(session_id, "call-a", since)
            parked(session_id, since)
            local started = now()
            stop(handle)
            await(function(_topic: any, data: any) return is_type(data, TYPES.FUNCTION_ERROR, "call-a") end,
                "the settlement of call-a", since)
            test.is_true(now() - started < TEARDOWN_SECONDS, "the wait ended within 10 s")
            await(status_of(session_id, STATUS.IDLE), "stopped turn", since)
            local late = decide(handle, record, "approve")
            test.eq(late.code, "approval_not_pending")
            test.eq(late.approval.state, "cancelled")
            test.eq(launch_count(session_id), 0)
            test.eq(summary(session_id, { "call-a", "call-c" }),
                "call-a=cancelled/cancelled/not_run:stopped call-c=-/cancelled/not_run:stopped"
                    .. " batch=closed:stop:cancelled activity=nil")
            close(handle)
        end)

        it("ends the wait on finish, supervisor cancel and deletion within 10 s, with no tool run", function()
            for _, case in ipairs({ "finish", "cancel", "delete" }) do
                local owner = new_user()
                local session_id = new_session(owner)
                local handle = direct(session_id, owner, nil, true)
                handle:surfaces(1, 1)
                local since = mark()
                handle:message("Delete record 1.")
                pending(session_id, "call-a", since)
                parked(session_id, since)
                local started = now()
                if case == "finish" then
                    handle:finish()
                elseif case == "cancel" then
                    process.cancel(handle.pid)
                else
                    assert(session_service.delete({ session_id = session_id, user_id = owner }))
                end
                local exit = await(exit_of(handle.pid), case .. " exit", since)
                test.is_true(now() - started < TEARDOWN_SECONDS, case .. ": the wait ended within 10 s")
                test.eq(launch_count(session_id), 0, case .. ": no tool ran")
                if case == "delete" then
                    -- The gate writes nothing for a deleted session
                    -- (deleted_result). The exit result is not checked: the
                    -- process exits with "Session not found" once the rows
                    -- are gone, and the plugin settles a deleted session
                    -- without recovery.
                    test.is_nil((session_repo.get(session_id)), "the session is gone")
                    test.eq(next(records(session_id)), nil, "its approval records are gone")
                else
                    test.is_nil(exit.result and exit.result.error, case .. ": a clean exit")
                    -- A process exit while waiting: every call has exactly one
                    -- terminal result after the exit recovery.
                    assert_one_result_each(session_id, { { id = "call-a", n = 1, gated = true },
                        { id = "call-c", n = 3 } }, case)
                    test.eq(summary(session_id, { "call-a", "call-c" }), case == "finish"
                        and "call-a=interrupted/error/not_run:interrupted call-c=-/error/not_run:interrupted"
                            .. " batch=closed:finish:cancelled activity=nil"
                        or "call-a=interrupted/error/not_run:interrupted call-c=-/error/not_run:interrupted"
                            .. " batch=closed:exit:cancelled activity=nil", case)
                end
            end
        end)

        it("tears down within 10 s when the session rows were deleted under the waiting process", function()
            local owner = new_user()
            local session_id = new_session(owner)
            local handle = direct(session_id, owner, nil, true)
            handle:surfaces(1, 1)
            local since = mark()
            handle:message("Delete record 1.")
            pending(session_id, "call-a", since)
            parked(session_id, since)
            -- The rows go without the deletion signal; the finish then wakes
            -- the gate, whose teardown finds nothing to write.
            assert(session_repo.delete(session_id))
            local started = now()
            handle:finish()
            await(exit_of(handle.pid), "exit after the rows were deleted", since)
            test.is_true(now() - started < TEARDOWN_SECONDS, "the process ends within 10 s")
            test.eq(launch_count(session_id), 0, "no tool ran")
            -- The gate's teardown writes nothing for a session that is gone
            -- (deleted_result); the exit then fails on the missing session
            -- row, as in the deletion case above.
        end)

        -- AC 22: the next model step sees the steering message after the
        -- results, in both orders.
        it("supersedes the waiting batch on steering, in both orders, and the next step reads the results first", function()
            for _, case in ipairs({ "steering first", "peer approved first" }) do
                local owner = new_user()
                local session_id = new_session(owner, { { calls = {
                    { id = "call-a", tool = MARKED, n = 1 }, { id = "call-b", tool = MARKED, n = 2 } } } })
                local handle = direct(session_id, owner, nil, true)
                handle:surfaces(1, 1)
                local since = mark()
                handle:message("Delete records 1 and 2.")
                pending(session_id, "call-a", since)
                local peer = pending(session_id, "call-b", since)
                parked(session_id, since)
                if case == "peer approved first" then
                    local decided = mark()
                    test.is_true(decide(handle, peer, "approve").success, case)
                    -- The decision woke the gate; call-a still waits.
                    parked(session_id, decided)
                end
                handle:message("Use record 9 instead.")
                local second = await(function(topic: any, data: any)
                    return topic == "approval:provider_call" and data.session_id == session_id and data.call_number == 2
                end, "the next model step", since)
                turn_end(session_id, 2, since)
                test.eq(launch_count(session_id), 0, case .. ": nothing of the batch ran")
                test.eq(summary(session_id, { "call-a", "call-b" }), string.format(
                    "call-a=superseded/error/not_run:superseded_by_user_message call-b=%s/error/not_run:superseded_by_user_message"
                        .. " batch=closed:steering:cancelled activity=nil",
                    case == "peer approved first" and "approved" or "superseded"), case)
                local prompt = assert(json.encode(second.messages))
                local result_at = nil
                local cursor = 1
                while true do
                    local found = prompt:find("because the user sent a new message", cursor, true)
                    if not found then break end
                    result_at, cursor = found, found + 1
                end
                local steering_at = prompt:find("Use record 9 instead.", 1, true)
                test.not_nil(result_at, case .. ": the model gets the superseded results")
                test.not_nil(steering_at, case .. ": the model gets the steering message")
                test.is_true(result_at < steering_at, case .. ": results first, then the steering message")
                close(handle)
            end
        end)
    end)
end

-------------------------------------------------------------------------------
-- AC 24: a crash while waiting, through each of the six recovery entry
-- points. The crashed state: call-a pending, call-b approved (no
-- disposition), call-c needs no approval; the assistant row holds the
-- round's pending behavior control (app:native_behavior_trait).

local CRASH_SCRIPT = { { calls = { { id = "call-a", tool = MARKED, n = 1 }, { id = "call-b", tool = MARKED, n = 2 },
    { id = "call-c", tool = PLAIN, n = 3 } } } }
local CRASH_CALLS = { "call-a", "call-b", "call-c" }
local CRASHED = "call-a=interrupted/error/not_run:interrupted call-b=approved/error/unknown"
    .. " call-c=-/error/not_run:interrupted batch=closed:exit:cancelled activity=nil"

-- Starts a turn and brings it to the crashed state. Returns the session ID.
local function crash_ready(handle: any, session_id: string, since: number)
    handle:message("Delete records 1 and 2.")
    pending(session_id, "call-a", since)
    local approved = pending(session_id, "call-b", since)
    test.is_true(decide(handle, approved, "approve").success)
    await(approval_event("approved", "call-b", session_id), "approved call-b", since)
end

-- After recovery: the stored state, then a new Session process (whose start
-- recovers the behavior controls) cancels the round's control on the
-- assistant row without applying it, and no tool ran. `at_start`: the entry
-- point is that start itself, so nothing is checked before it.
local function assert_recovered(session_id: string, owner: string, expected: string, label: string,
                                at_start: boolean?)
    if not at_start then test.eq(summary(session_id, CRASH_CALLS), expected, label) end
    local restarted = direct(session_id, owner, nil, false)
    test.eq(summary(session_id, CRASH_CALLS), expected, label .. ": after the restart")
    test.eq(round_controls(session_id), "cancelled",
        label .. ": the assistant row's behavior control is cancelled, not replayed")
    test.is_nil(primary_context(session_id).native_behavior_applied, label .. ": the control was never applied")
    test.eq(launch_count(session_id), 0, label .. ": no tool ran, also after the restart")
    close(restarted)
end

local function define_recovery_tests()
    describe("Tool approval recovery of a real Session process", function()
        before_all(function() wait_for_boot.run() end)
        after_each(function() cleanup() end)

        it("recovers at the next session start after the process was killed while waiting", function()
            local owner = new_user()
            local session_id = new_session(owner, CRASH_SCRIPT)
            local handle = direct(session_id, owner, nil, true)
            handle:surfaces(1, 1)
            local since = mark()
            crash_ready(handle, session_id, since)
            process.terminate(handle.pid)
            await(exit_of(handle.pid), "killed session", since)
            test.eq((session_repo.get(session_id) :: any).status, STATUS.RUNNING, "nothing settled the turn yet")
            test.eq(summary(session_id, CRASH_CALLS), "call-a=pending/pending/nil call-b=approved/pending/nil"
                .. " call-c=-/pending/nil batch=open:nil:kept activity=awaiting_tool_approval", "the crashed state")
            assert_recovered(session_id, owner, CRASHED, "session start", true)
        end)

        it("recovers through the process exit after a supervisor cancel", function()
            local owner = new_user()
            local session_id = new_session(owner, CRASH_SCRIPT)
            local handle = direct(session_id, owner, nil, true)
            handle:surfaces(1, 1)
            local since = mark()
            crash_ready(handle, session_id, since)
            process.cancel(handle.pid)
            await(exit_of(handle.pid), "cancelled session", since)
            -- The waiting gate still owns its calls at the exit and settles
            -- them itself: it knows the approved call-b never ran.
            assert_recovered(session_id, owner, "call-a=interrupted/error/not_run:interrupted"
                .. " call-b=approved/error/not_run:interrupted call-c=-/error/not_run:interrupted"
                .. " batch=closed:exit:cancelled activity=nil", "process exit")
        end)

        it("recovers through the command bus failure of a tool round that fails while waiting", function()
            local owner = new_user()
            local session_id = new_session(owner, CRASH_SCRIPT)
            local handle = direct(session_id, owner, { inject = "fail_wait" }, true)
            handle:surfaces(1, 1)
            local since = mark()
            handle:message("Delete records 1 and 2.")
            pending(session_id, "call-a", since)
            local approved = pending(session_id, "call-b", since)
            await(paused("fail_wait"), "the wait started", since)
            -- The decision wakes the gate, whose wait then fails.
            test.is_true(decide(handle, approved, "approve").success)
            local exit = await(exit_of(handle.pid), "failed session", since)
            test.not_nil(exit.result and exit.result.error, "the bus failure ends the process")
            assert_recovered(session_id, owner,
                "call-a=interrupted/error/Tool approval check failed: Injected approval wait failure"
                    .. " call-b=approved/error/Tool approval check failed: Injected approval wait failure"
                    .. " call-c=-/error/Tool approval check failed: Injected approval wait failure"
                    .. " batch=closed:exit:cancelled activity=nil", "bus failure")
        end)

        it("recovers on the plugin's failure path when the Session process dies while waiting", function()
            local owner = new_user()
            local session_id = new_session(owner, CRASH_SCRIPT)
            local plugin = start_plugin(owner)
            local handle = via_plugin(plugin, session_id, owner, new_connection())
            handle:open()
            handle:surface(true)
            local since = mark()
            crash_ready(handle, session_id, since)
            local session_pid = assert(handle:session_pid())
            process.terminate(session_pid)
            await(status_of(session_id, STATUS.FAILED), "failed status from the plugin", since)
            assert_recovered(session_id, owner, CRASHED, "plugin failure path")
        end)

        it("recovers after a Stop the plugin had to enforce on a stuck turn", function()
            local owner = new_user()
            local session_id = new_session(owner, CRASH_SCRIPT)
            local plugin = start_plugin(owner, { inject = "hang" })
            local handle = via_plugin(plugin, session_id, owner, new_connection())
            handle:open()
            handle:surface(true)
            local since = mark()
            crash_ready(handle, session_id, since)
            await(paused("hang"), "the stuck wait", since)
            local session_pid = assert(handle:session_pid())
            process.monitor(session_pid)
            stop(handle)
            -- The stuck process publishes nothing more; the next idle status
            -- is the plugin's, after it cancelled (10 s) and then
            -- terminated (10 s later) the process.
            local stopped = mark()
            await(exit_of(session_pid), "the plugin ends the stuck process", since, "40s")
            await(status_of(session_id, STATUS.IDLE), "the enforced Stop's idle status", stopped)
            -- The Stop committed before the crash closed the batch: its
            -- pending request reads cancelled (not interrupted) and the calls
            -- the Stop settled say so; the approved call without a
            -- disposition keeps "outcome unknown".
            assert_recovered(session_id, owner,
                "call-a=cancelled/cancelled/not_run:stopped call-b=approved/error/unknown"
                    .. " call-c=-/cancelled/not_run:stopped batch=closed:stop:cancelled activity=nil", "enforced Stop")
        end)

        it("recovers in the plugin's stale-running scan after the runtime lost the process", function()
            local owner = new_user()
            local session_id = new_session(owner, CRASH_SCRIPT)
            local handle = direct(session_id, owner, nil, true)
            handle:surfaces(1, 1)
            local since = mark()
            crash_ready(handle, session_id, since)
            process.terminate(handle.pid)
            await(exit_of(handle.pid), "killed session", since)
            local scan_since = mark()
            start_plugin(owner)
            await(status_of(session_id, STATUS.IDLE), "the stale scan's idle status", scan_since)
            assert_recovered(session_id, owner, CRASHED, "stale-running scan")
        end)
    end)
end

-------------------------------------------------------------------------------
-- AC 25: approval UI surfaces through the real plugin and connection
-- processes. The 120 s grace period runs through its seam
-- (approval_gate.GRACE_SECONDS, set in the Session process by the worker).

local GRACE = 2

local function unavailable_settled(session_id: string): any
    return function(_topic: any, data: any)
        return is_type(data, TYPES.FUNCTION_ERROR, "call-a") and data.session_id == session_id
    end
end

local function notices(session_id: string, since: number): number
    return count_logged(function(_topic: any, data: any)
        return type(data) == "table" and data.session_id == session_id and data.type == TYPES.ERROR
            and data.code == "tool_approval_unavailable"
    end, since)
end

local function define_surface_tests()
    describe("Tool approval UI surfaces through the session plugin", function()
        before_all(function() wait_for_boot.run() end)
        after_each(function() cleanup() end)

        it("settles at once as approval_ui_unavailable with one notice when no client ever declared a surface", function()
            local owner = new_user()
            local session_id = new_session(owner)
            local handle = via_plugin(start_plugin(owner, { grace_seconds = GRACE }), session_id, owner, new_connection())
            handle:open()
            local since = mark()
            handle:message("Delete record 1.")
            turn_end(session_id, 1, since)
            test.eq(count_logged(approval_event("pending", "call-a", session_id), since), 0, "no request waits")
            test.eq(notices(session_id, since), 1, "one notice for the turn")
            test.eq(model_calls(session_id), 1, "no further model call")
            test.eq(launch_count(session_id), 0)
            test.eq(summary(session_id, { "call-a", "call-c" }),
                "call-a=unavailable/error/not_run:approval_ui_unavailable"
                    .. " call-c=-/error/not_run:not_run_batch_stopped batch=closed:unavailable:cancelled activity=nil")
        end)

        it("waits the grace period after a withdrawal or a close, then settles the same way", function()
            for _, case in ipairs({ "withdrawal", "close" }) do
                local owner = new_user()
                local session_id = new_session(owner)
                local handle = via_plugin(start_plugin(owner, { grace_seconds = GRACE }), session_id, owner,
                    new_connection())
                handle:open()
                handle:surface(true)
                local since = mark()
                handle:message("Delete record 1.")
                pending(session_id, "call-a", since)
                local started = now()
                if case == "withdrawal" then
                    handle:surface(false)
                else
                    process.terminate(handle.conn)
                end
                await(unavailable_settled(session_id), case .. ": settlement", since)
                local waited = now() - started
                test.is_true(waited >= GRACE - 0.5, case .. ": not before the grace period, waited " .. tostring(waited))
                test.is_true(waited < GRACE + 5, case .. ": soon after the grace period, waited " .. tostring(waited))
                turn_end(session_id, 1, since)
                test.eq(notices(session_id, since), 1, case .. ": one notice")
                test.eq(model_calls(session_id), 1, case .. ": no further model call")
                test.eq(launch_count(session_id), 0, case)
                test.eq(summary(session_id, { "call-a" }),
                    "call-a=unavailable/error/not_run:approval_ui_unavailable batch=closed:grace:cancelled activity=nil",
                    case)
            end
        end)

        it("keeps the request pending when a reload declares a new connection within the grace period", function()
            local owner = new_user()
            local session_id = new_session(owner)
            local handle = via_plugin(start_plugin(owner, { grace_seconds = GRACE }), session_id, owner,
                new_connection())
            handle:open()
            handle:surface(true)
            local since = mark()
            handle:message("Delete record 1.")
            local record = pending(session_id, "call-a", since)
            process.terminate(handle.conn)
            local reloaded = new_connection()
            handle.conn = reloaded
            handle:open(reloaded)
            handle:surface(true, reloaded)
            absent(unavailable_settled(session_id), "settlement after a reload", since,
                tostring((GRACE + 2) * 1000) .. "ms")
            test.eq(record_of(session_id, "call-a").state, "pending")
            test.is_true(decide(handle, record, "approve").success)
            turn_end(session_id, 2, since)
            test.is_true(launches(session_id)[1], "the approved call ran")
        end)

        it("gives a restarted Session process the plugin's live set", function()
            local owner = new_user()
            local session_id = new_session(owner, { { content = "Ready." }, DEFAULT_SCRIPT[1] })
            local plugin = start_plugin(owner, { grace_seconds = GRACE })
            local handle = via_plugin(plugin, session_id, owner, new_connection())
            -- A second open session keeps the plugin running while the first
            -- one's process is gone (a plugin with no session exits).
            via_plugin(plugin, new_session(owner, {}), owner, handle.conn):open()
            handle:open()
            handle:surface(true)
            local first = mark()
            handle:message("Hello.")
            turn_end(session_id, 1, first)
            local old_pid = assert(handle:session_pid())
            process.terminate(old_pid)
            await(status_of(session_id, STATUS.FAILED), "the plugin settled the dead process", first)
            -- The connection stays open; the restarted process gets its surface.
            handle:open()
            test.is_true(handle:session_pid() ~= old_pid, "a new Session process")
            local since = mark()
            handle:message("Delete record 1.")
            local record = pending(session_id, "call-a", since)
            absent(unavailable_settled(session_id), "settlement while the surface is live", since,
                tostring((GRACE + 2) * 1000) .. "ms")
            test.is_true(decide(handle, record, "approve").success)
            turn_end(session_id, 3, since)
            test.is_true(launches(session_id)[1], "the approved call ran")
        end)

        it("runs a batch covered entirely by grants with no surface", function()
            local owner = new_user()
            local session_id = new_session(owner, { { calls = { { id = "call-g1", tool = GRANTED, n = 7 } } },
                { content = "Sent." }, { calls = { { id = "call-g2", tool = GRANTED, n = 8 } } } })
            local handle = via_plugin(start_plugin(owner, { grace_seconds = GRACE }), session_id, owner,
                new_connection())
            handle:open()
            handle:surface(true)
            local since = mark()
            handle:message("Send invoice 7.")
            local record = pending(session_id, "call-g1", since)
            test.eq(record.offered.approve_all.scope, "tool")
            local reply = decide(handle, record, "approve_all", { approve_all_scope = "tool" })
            test.not_nil(reply.grant, "a tool grant")
            turn_end(session_id, 2, since)
            -- No surface from here on: the withdrawal reaches the session before
            -- the next message (same sender), and the connection closes.
            handle:surface(false)
            process.terminate(handle.conn)
            local second = mark()
            handle:message("Send invoice 8.")
            turn_end(session_id, 4, second)
            test.is_true(launches(session_id)[8], "the grant-covered call ran")
            test.eq(count_logged(approval_event("pending", "call-g2", session_id), second), 0, "no request")
            test.eq(notices(session_id, second), 0, "no notice")
            local audit = record_of(session_id, "call-g2")
            test.eq(audit.decided_via .. ":" .. tostring(audit.disposition), "grant:dispatched")
        end)
    end)
end

-------------------------------------------------------------------------------
-- AC 30: failure injection between the decision commit, its projection, the
-- acknowledgement, the gate's wake-up and dispatch. The Session process stops
-- once at the point (approval_session_worker `inject`), the test fires one
-- signal, then lets it go on. At the inbox points (commit, projection, ack)
-- the inbox is held, so the signal is handled after the command, in either
-- order with the gate; at wake and dispatch the command bus is held and the
-- inbox handles the signal at once.

local POINTS = { "commit", "projection", "ack", "wake", "dispatch" }
local SIGNALS = { "stop", "revoke", "steering", "finish", "cancel", "deadline" }

-- Calls that must run (true) or not (false) for a point and signal; nil:
-- only the invariant holds (either order is correct).
local EXPECTED_RUNS: {[string]: {[string]: boolean}} = {
    wake = { stop = false, steering = false, finish = false, cancel = false, deadline = true, revoke = true },
    dispatch = { steering = true, finish = true, deadline = true, revoke = true },
    commit = { deadline = true }, projection = { deadline = true }, ack = { deadline = true },
}

local function fire(handle: any, signal: string, grant: any)
    -- Stop and the revocation are answered after the held command at an inbox
    -- point, so their replies are awaited after the resume.
    if signal == "stop" then
        return handle:command({ command = consts.COMMANDS.STOP })
    elseif signal == "revoke" then
        return handle:command({ command = "tool_approval_grant_revoke", grant_id = grant.grant_id,
            expected_revision = grant.revision })
    elseif signal == "steering" then
        handle:message("Use record 9 instead.")
    elseif signal == "finish" then
        handle:finish()
    elseif signal == "cancel" then
        process.cancel(handle.pid)
    elseif signal == "deadline" then
        storage():set("clock:" .. handle.session_id, 1000)
    end
    return nil
end

local function run_injection(point: string, signal: string)
    local label = point .. "/" .. signal
    local owner = new_user()
    local revoke = signal == "revoke"
    local script = revoke and {
        { calls = { { id = "call-g1", tool = GRANTED, n = 7 } } }, { content = "Sent." },
        { calls = { { id = "call-a", tool = MARKED, n = 1 }, { id = "call-g", tool = GRANTED, n = 8 } } },
    } or DEFAULT_SCRIPT
    local session_id = new_session(owner, script)
    local handle = direct(session_id, owner, { inject = point, clock = true }, true)
    handle:surfaces(1, 1)
    local grant = nil
    if revoke then
        local first = mark()
        handle:message("Send invoice 7.")
        local record = pending(session_id, "call-g1", first)
        grant = decide(handle, record, "approve_all", { approve_all_scope = "tool" }).grant
        turn_end(session_id, 2, first)
    end
    -- The injection point is armed from here on.
    storage():set("armed:" .. session_id, true)
    local since = mark()
    handle:message("Delete record 1.")
    local record = pending(session_id, "call-a", since)
    local decision_id = handle:command(decision_fields(record, "approve"))
    local stopped = await(paused(point), label .. ": the injected pause", since)
    local function replied(request_id: string): any
        return function(_topic: any, data: any) return type(data) == "table" and data.request_id == request_id end
    end
    local signal_id = fire(handle, signal, grant)
    if point == "wake" or point == "dispatch" then
        -- The inbox is free: the signal is committed before the bus goes on.
        -- A barrier command after it (same sender, in order) proves the
        -- inbox handled it; after a cancel only the exit path answers
        -- (SESSION_FINISHING), so that answer proves the cancel was taken.
        if signal_id then await(replied(signal_id), label .. ": the signal's reply", since) end
        for attempt = 1, 20 do
            local barrier = handle:command({ command = "context_transport_capabilities", capabilities_version = 1 })
            local answer = await(replied(barrier), label .. ": the barrier", since)
            if signal ~= "cancel" or answer.code == "SESSION_FINISHING" then break end
            test.is_true(attempt < 20, label .. ": the cancel was taken")
        end
    end
    assert(process.send(stopped.pid, "approval:resume", true))
    if signal_id then await(replied(signal_id), label .. ": the signal's reply", since) end
    local calls = { { id = "call-a", n = 1, gated = true } }
    calls[2] = revoke and { id = "call-g", n = 8, gated = true } or { id = "call-c", n = 3 }
    if signal == "cancel" or signal == "finish" then
        await(exit_of(handle.pid), label .. ": exit", since)
    else
        await(reply_to(decision_id), label .. ": decision reply", since)
        settled_then_idle(session_id, { calls[1].id, calls[2].id }, since)
        close(handle)
    end
    assert_one_result_each(session_id, calls, label)
    local expected = EXPECTED_RUNS[point] and EXPECTED_RUNS[point][signal]
    local ran = launches(session_id)
    if expected == true then
        test.is_true(ran[1] == true, label .. ": the approved call runs; "
            .. summary(session_id, { calls[1].id, calls[2].id }))
        if revoke and point == "wake" then
            test.is_nil(ran[8], label .. ": a grant revoked before the release allows nothing")
            test.eq(record_of(session_id, "call-g").disposition_reason, "revoked", label)
        elseif revoke then
            test.is_true(ran[8] == true, label .. ": a revocation after the release does not reverse it")
        end
    elseif expected == false then
        test.eq(launch_count(session_id), 0, label .. ": no call of the batch runs")
    end
end

local function define_injection_tests()
    describe("Tool approval failure injection in a real Session process", function()
        before_all(function() wait_for_boot.run() end)
        after_each(function() cleanup() end)

        for _, point in ipairs(POINTS) do
            it("holds every call to one result and runs none without a committed approval: " .. point, function()
                for _, signal in ipairs(SIGNALS) do
                    run_injection(point, signal)
                    cleanup()
                end
            end)
        end
    end)
end

return {
    wait = test.run_cases(define_wait_tests),
    recovery = test.run_cases(define_recovery_tests),
    surfaces = test.run_cases(define_surface_tests),
    injection = test.run_cases(define_injection_tests),
}
