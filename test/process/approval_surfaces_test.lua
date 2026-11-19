local test = require("test")
local approval_surfaces = require("approval_surfaces")
local plugin = require("plugin")
local session = require("session")
local message_handlers = require("message_handlers")
local wake = require("wake")
local consts = require("consts")
local context_repo = require("context_repo")
local session_repo = require("session_repo")
local wait_for_boot = require("wait_for_boot")
local security = require("security")
local uuid = require("uuid")

local HUB = "relay-hub-1"
local SURFACES = consts.TOPICS.APPROVAL_SURFACES

-- Runs the session plugin over a script of inbox messages and process
-- events. Inbox items: { topic, data, from } (data may be a function of the
-- run, for pids known only at run time). Event items: { event = { kind, from,
-- result } }. Every spawn is confirmed at once with SESSION_OPENED from the new
-- pid. After the script the plugin is cancelled.
local function run_plugin(script: {any}): any
    local run = { sent = {}, spawns = {}, monitors = {}, unmonitors = {} }
    local queue = {}
    for _, item in ipairs(script) do table.insert(queue, item) end
    local inbox = process.inbox()
    local events = process.events()
    local function message(topic, data, from)
        return {
            topic = function() return topic end,
            payload = function() return { data = function() return data end } end,
            from = function() return from end,
        }
    end
    mock("process.with_context", function()
        return { spawn_linked_monitored = function(_self, _id, _host, init)
            local pid = "session-pid-" .. tostring(#run.spawns + 1)
            table.insert(run.spawns, { session_id = init.session_id, pid = pid })
            table.insert(queue, 1, { topic = consts.TOPICS.SESSION_OPENED,
                data = { session_id = init.session_id, from_pid = pid }, from = pid })
            return pid, nil
        end }
    end)
    mock("process.send", function(pid, topic, payload)
        table.insert(run.sent, { pid = pid, topic = topic, payload = payload })
        return true, nil
    end)
    mock("process.monitor", function(pid)
        run.monitors[pid] = (run.monitors[pid] or 0) + 1
        return true, nil
    end)
    mock("process.unmonitor", function(pid)
        run.unmonitors[pid] = (run.unmonitors[pid] or 0) + 1
        return true, nil
    end)
    mock("process.cancel", function() return true, nil end)
    mock("process.terminate", function() return true, nil end)
    mock("coroutine.spawn", function() end)
    mock("channel.select", function(cases)
        if cases.default then return { ok = true, default = true } end
        local item = table.remove(queue, 1)
        if not item then
            return { ok = true, channel = events, value = { kind = process.event.CANCEL } }
        end
        if item.event then
            local event = {}
            for key, value in pairs(item.event) do
                event[key] = type(value) == "function" and value(run) or value
            end
            return { ok = true, channel = events, value = event }
        end
        local data = type(item.data) == "function" and item.data(run) or item.data
        return { ok = true, channel = inbox, value = message(item.topic, data, item.from) }
    end)
    local result, run_err = plugin.run({ user_id = security.actor():id(), user_hub_pid = HUB })
    restore_mock("channel.select")
    restore_mock("coroutine.spawn")
    restore_mock("process.terminate")
    restore_mock("process.cancel")
    restore_mock("process.unmonitor")
    restore_mock("process.monitor")
    restore_mock("process.send")
    restore_mock("process.with_context")
    run.result, run.error = result, run_err
    return run
end

-- The live sets the plugin sent, in order, as "pid:live".
local function pushes(run: any, session_id: string?): {string}
    local out = {}
    for _, item in ipairs(run.sent) do
        if item.topic == SURFACES and (session_id == nil or item.payload.session_id == session_id) then
            table.insert(out, tostring(item.pid) .. ":" .. tostring(item.payload.live))
        end
    end
    return out
end

local function sent_to(run: any, pid: string, topic: string): {any}
    local out = {}
    for _, item in ipairs(run.sent) do
        if item.pid == pid and item.topic == topic then table.insert(out, item.payload) end
    end
    return out
end

-- `legacy_declare` puts the pre-v4 field tool_approval_ui on session_open,
-- which the relay never forwards; the plugin must ignore it.
local function open(session_id: string, conn: string, legacy_declare: boolean?, from: any?): any
    return { topic = consts.PLUGIN_TOPICS.OPEN, from = from or HUB,
        data = { session_id = session_id, conn_pid = conn, tool_approval_ui = legacy_declare and 1 or nil } }
end

local function surface_command(session_id: string, conn: string, enabled: any, from: any?, request_id: string?): any
    return { topic = consts.PLUGIN_TOPICS.COMMAND, from = from or HUB,
        data = { session_id = session_id, conn_pid = conn, request_id = request_id,
            data = { command = "tool_approval_surface", enabled = enabled } } }
end

local function declare(session_id: string, conn: string, from: any?): any
    return surface_command(session_id, conn, true, from, "req-declare")
end

local function withdraw(session_id: string, conn: string, from: any?): any
    return surface_command(session_id, conn, false, from, "req-withdraw")
end

local function message_with(session_id: string, conn: string, runtime_context: any): any
    return { topic = consts.PLUGIN_TOPICS.MESSAGE, from = HUB,
        data = { session_id = session_id, conn_pid = conn, request_id = "req-msg",
            data = { text = "hello", runtime_context = runtime_context } } }
end

local function session_exit(index: number): any
    return { event = { kind = process.event.EXIT,
        from = function(run) return run.spawns[index].pid end,
        result = { value = { status = "shutdown", intentional_exit = true } } } }
end

local function define_tests()
    describe("Approval UI surface tracker", function()
        it("records each declaration once and counts the live set per session", function()
            local tracker = approval_surfaces.new()
            test.is_false(tracker:known("s1"))
            test.is_true(tracker:declare("s1", "c1"))
            test.is_false(tracker:declare("s1", "c1"), "a repeated declaration is not new")
            test.is_true(tracker:declare("s1", "c2"))
            test.is_true(tracker:declare("s2", "c1"))
            test.eq(tracker:live("s1"), 2)
            test.eq(tracker:snapshot("s1").revision, 2)
            test.eq(tracker:snapshot("s1").live, 2)
            test.is_nil(tracker:snapshot("s1").connections, "connection ids stay in the plugin")
        end)

        it("withdraws one declaration and keeps the session known", function()
            local tracker = approval_surfaces.new()
            tracker:declare("s1", "c1")
            test.is_true(tracker:withdraw("s1", "c1"))
            test.is_false(tracker:withdraw("s1", "c1"))
            test.is_true(tracker:known("s1"))
            test.eq(tracker:live("s1"), 0)
            test.eq(tracker:snapshot("s1").revision, 2)
        end)

        it("drops every declaration of a closed connection", function()
            local tracker = approval_surfaces.new()
            tracker:declare("s2", "c1")
            tracker:declare("s1", "c1")
            tracker:declare("s1", "c2")
            local changed = tracker:drop_connection("c1")
            test.eq(#changed, 2)
            test.eq(changed[1], "s1")
            test.eq(changed[2], "s2")
            test.eq(tracker:live("s1"), 1)
            test.eq(tracker:live("s2"), 0)
        end)

        it("accepts only positive integer declarations and valid ids", function()
            test.is_true(approval_surfaces.declares(1))
            test.is_true(approval_surfaces.declares(2))
            for _, value in ipairs({ 0, 1.5, "1", true, -1 }) do
                test.is_false(approval_surfaces.declares(value), tostring(value))
            end
            test.is_false(approval_surfaces.declares(nil))
            local tracker = approval_surfaces.new()
            test.is_false(tracker:declare("", "c1"))
            test.is_false(tracker:declare("s1", nil))
        end)
    end)

    describe("Approval UI surfaces in the session plugin", function()
        local first, second
        local fixtures = {}
        before_all(function()
            wait_for_boot.run()
            first, second = uuid.v7(), uuid.v7()
            for _, session_id in ipairs({ first, second }) do
                local context_id = uuid.v7()
                assert(context_repo.create(context_id, "primary", "{}"))
                assert(session_repo.create(session_id, security.actor():id(), context_id, "Surfaces", "test", {}, {}))
                table.insert(fixtures, { session_id = session_id, context_id = context_id })
            end
        end)
        after_all(function()
            for _, fixture in ipairs(fixtures) do
                session_repo.delete(fixture.session_id)
                context_repo.delete(fixture.context_id)
            end
        end)

        it("records an enabled: true declaration after the open and replies on the session topic", function()
            local run = run_plugin({ open(first, "conn-1"), declare(first, "conn-1") })
            local list = pushes(run, first)
            test.eq(#list, 1)
            test.eq(list[1], "session-pid-1:1")
            test.eq(run.monitors["conn-1"], 1)
            test.eq(#sent_to(run, "session-pid-1", consts.TOPICS.COMMAND), 0, "not forwarded")
            local replies = sent_to(run, "conn-1", consts.TOPIC_PREFIXES.SESSION .. first)
            test.eq(#replies, 1)
            test.eq(replies[1].type, consts.UPSTREAM_TYPES.COMMAND_RESPONSE)
            test.eq(replies[1].request_id, "req-declare")
            test.is_true(replies[1].success)
        end)

        it("records a declaration sent after a reopen of a live session", function()
            local run = run_plugin({ open(first, "conn-1"), open(first, "conn-2"), declare(first, "conn-2") })
            test.eq(#run.spawns, 1, "the live session is reopened, not started again")
            local list = pushes(run, first)
            test.eq(#list, 1)
            test.eq(list[1], "session-pid-1:1")
        end)

        it("ignores tool_approval_ui on session_open, which the relay never forwards", function()
            local run = run_plugin({ open(first, "conn-1", true), open(first, "conn-2", true) })
            test.eq(#pushes(run, first), 0, "no surface is declared by an open")
            test.is_nil(run.monitors["conn-1"])
            test.is_nil(run.monitors["conn-2"])
        end)

        it("refuses a surface command whose enabled is not a boolean and changes nothing", function()
            local run = run_plugin({ open(first, "conn-1"), declare(first, "conn-1"),
                surface_command(first, "conn-1", 1, nil, "req-bad"),
                surface_command(first, "conn-1", "false", nil, "req-bad-2"),
                surface_command(first, "conn-1", nil, nil, "req-bad-3") })
            local list = pushes(run, first)
            test.eq(#list, 1, "only the valid declaration changed the set")
            test.eq(list[1], "session-pid-1:1")
            local replies = sent_to(run, "conn-1", consts.TOPIC_PREFIXES.SESSION .. first)
            test.eq(#replies, 4)
            for index = 2, 4 do
                test.is_false(replies[index].success)
                test.eq(replies[index].code, "invalid_surface_command")
            end
            test.is_nil(run.unmonitors["conn-1"])
        end)

        it("records a declaration from session_message runtime_context before stripping it", function()
            local run = run_plugin({ open(first, "conn-1"),
                message_with(first, "conn-3", { tool_approval_ui = 1 }) })
            local list = pushes(run, first)
            test.eq(#list, 1)
            test.eq(list[1], "session-pid-1:1")
            local forwarded = sent_to(run, "session-pid-1", consts.TOPICS.MESSAGE)
            test.eq(#forwarded, 1)
            test.is_nil(forwarded[1].data.runtime_context, "runtime_context is still stripped")
            local order = {}
            for _, item in ipairs(run.sent) do
                if item.pid == "session-pid-1" then table.insert(order, item.topic) end
            end
            test.eq(order[1], SURFACES, "the set reaches the session before the message")
            test.eq(order[2], consts.TOPICS.MESSAGE)
        end)

        it("handles the withdrawal in the plugin and never forwards it", function()
            local run = run_plugin({ open(first, "conn-1"), declare(first, "conn-1"), withdraw(first, "conn-1") })
            local list = pushes(run, first)
            test.eq(#list, 2)
            test.eq(list[2], "session-pid-1:0")
            test.eq(#sent_to(run, "session-pid-1", consts.TOPICS.COMMAND), 0, "not forwarded")
            test.eq(run.unmonitors["conn-1"], 1, "the monitor reference is released")
            local replies = sent_to(run, "conn-1", consts.TOPIC_PREFIXES.SESSION .. first)
            test.eq(#replies, 2)
            test.eq(replies[2].type, consts.UPSTREAM_TYPES.COMMAND_RESPONSE)
            test.eq(replies[2].request_id, "req-withdraw")
            test.is_true(replies[2].success)
        end)

        it("does not restore a withdrawn declaration on reopen, a later message or a process restart", function()
            local run = run_plugin({
                open(second, "conn-keep"),
                open(first, "conn-1"),
                declare(first, "conn-1"),
                withdraw(first, "conn-1"),
                open(first, "conn-1"),
                message_with(first, "conn-1", { attention = { host_instance_id = "h" } }),
                session_exit(2),
                open(first, "conn-1"),
            })
            local list = pushes(run, first)
            test.eq(list[1], "session-pid-2:1")
            test.eq(list[2], "session-pid-2:0")
            test.eq(list[3], "session-pid-3:0", "the restarted process gets the set without it")
            test.eq(#list, 3, "the reopen and the message change nothing")
        end)

        it("restores a surface only through a new declaration", function()
            local run = run_plugin({ open(first, "conn-1"), declare(first, "conn-1"), withdraw(first, "conn-1"),
                open(first, "conn-1"), declare(first, "conn-1") })
            local list = pushes(run, first)
            test.eq(list[#list], "session-pid-1:1")
        end)

        it("refuses a surface command and declarations from a process that is not the relay", function()
            local run = run_plugin({
                open(first, "conn-1"),
                declare(first, "conn-1"),
                withdraw(first, "conn-1", "intruder-pid"),
                declare(first, "conn-2", "intruder-pid"),
                message_with(first, "conn-3", { tool_approval_ui = 1 }),
            })
            -- conn-3 came from the relay; the two intruder messages changed nothing.
            local list = pushes(run, first)
            test.eq(#list, 2)
            test.eq(list[1], "session-pid-1:1")
            test.eq(list[2], "session-pid-1:2")
            test.is_nil(run.unmonitors["conn-1"], "nothing was released")
            test.is_nil(run.monitors["conn-2"], "the intruder's connection is not tracked")
            test.eq(#sent_to(run, "conn-1", consts.TOPIC_PREFIXES.SESSION .. first), 1,
                "only the relay's declaration is answered; no reply to the intruder")
            test.eq(#sent_to(run, "conn-2", consts.TOPIC_PREFIXES.SESSION .. first), 0)
            test.eq(#sent_to(run, "session-pid-1", consts.TOPICS.COMMAND), 0)
        end)

        it("keeps the live set across a Session process restart while the connection stays open", function()
            local run = run_plugin({
                open(second, "conn-keep"),
                open(first, "conn-1"),
                declare(first, "conn-1"),
                session_exit(2),
                open(first, "conn-other"),
            })
            local list = pushes(run, first)
            test.eq(list[1], "session-pid-2:1")
            test.eq(list[#list], "session-pid-3:1", "the new process gets the open connection's surface")
        end)

        it("drops the surfaces of a closed connection and shares its monitor with the broker count", function()
            local run = run_plugin({
                open(second, "conn-keep"),
                open(first, "conn-1"),
                declare(first, "conn-1"),
                message_with(second, "conn-1", { tool_approval_ui = 1 }),
                withdraw(second, "conn-1"),
                { event = { kind = process.event.EXIT, from = "conn-1" } },
            })
            test.eq(run.monitors["conn-1"], 1, "one monitor for two declarations")
            test.eq(run.unmonitors["conn-1"], 1, "released once, when the last reference goes")
            local list = pushes(run, first)
            test.eq(list[#list], "session-pid-2:0")
        end)
    end)

    describe("Approval surfaces in the session process", function()
        local function ctx_for(parent: any): any
            return { session_id = "sess-1", parent_pid = parent, approval_wake = wake.new(), config = {} }
        end

        it("accepts the set only from the parent plugin and only for this session", function()
            local ctx = ctx_for("plugin-pid")
            test.is_false(session.accept_surfaces(ctx, "other-pid", { session_id = "sess-1", live = 1, revision = 1 }))
            test.is_false(session.accept_surfaces(ctx, "plugin-pid", { session_id = "sess-2", live = 1, revision = 1 }))
            test.is_true(rawget(ctx, "approval_surfaces") == nil, "nothing accepted yet")
            local unparented = ctx_for(nil)
            test.is_false(session.accept_surfaces(unparented, nil, { session_id = "sess-1", live = 1, revision = 1 }))
            test.is_true(session.accept_surfaces(ctx, "plugin-pid", { session_id = "sess-1", live = 1, revision = 1 }))
            test.eq(ctx.approval_surfaces.live, 1)
            test.is_false(session.accept_surfaces(ctx, "plugin-pid", { session_id = "sess-1", live = 0, revision = 1 }),
                "an old revision is ignored")
        end)

        it("wakes the gate and stores ui_declared_at once in a protected session", function()
            local ctx = ctx_for("plugin-pid")
            ctx.config.tool_approval = { active = true, require = "marked", approve_all = "off",
                timeout_seconds = 900, max_requests_per_turn = 10, revision = 1 }
            local writes = 0
            ctx.writer = { update_tool_approval = function(_self, mutate)
                local next_value = mutate(ctx.config.tool_approval)
                if next_value then writes = writes + 1 end
                return next_value or ctx.config.tool_approval
            end }
            local waiter = ctx.approval_wake:arm("batch-1")
            test.is_true(session.accept_surfaces(ctx, "plugin-pid", { session_id = "sess-1", live = 0, revision = 1 }))
            test.is_true(waiter.flags.surfaces)
            test.eq(writes, 0, "an empty set is no declaration")
            test.is_true(session.accept_surfaces(ctx, "plugin-pid", { session_id = "sess-1", live = 2, revision = 2 }))
            test.not_nil(ctx.config.tool_approval.ui_declared_at)
            test.is_true(session.accept_surfaces(ctx, "plugin-pid", { session_id = "sess-1", live = 1, revision = 3 }))
            test.eq(writes, 1, "stored once")
        end)
    end)

    describe("Wake signals from the session inbox", function()
        local function stop_ctx(): any
            local ctx = {
                status = "running", stop_requested = false, input_policy_revision = 0,
                interaction = { can_send = true, revision = 0 }, config = {},
                turn_state = { active = true },
                approval_wake = wake.new(),
                writer = { stop_with_input_rollback = function() return true end, update_meta = function() return true end },
                upstream = { update_session = function() end, command_error = function() end, session_error = function() end },
            }
            return ctx
        end

        it("closes the batch cancellation channel before bus:request_stop runs", function()
            local ctx = stop_ctx()
            local cancel = ctx.approval_wake:register_batch_cancel("batch-1", "turn-1")
            local closed_when_requested = nil
            local bus = { turn_state = { id = "turn-1" }, request_stop = function()
                local result = channel.select({ cancel:case_receive(), default = true })
                closed_when_requested = not result.default and not result.ok
                return true
            end }
            local ok, err = session.route_input(ctx, bus, consts.TOPICS.STOP, {}, {})
            test.is_nil(err)
            test.is_true(ok)
            test.is_true(closed_when_requested, "closed synchronously before request_stop")
        end)

        it("wakes the gate for committed steering only", function()
            local original = message_handlers.handle_message
            for _, case in ipairs({ { steered = true, woken = true }, { steered = nil, woken = false } }) do
                local ctx = stop_ctx()
                ctx.held = {}
                local waiter = ctx.approval_wake:arm("batch-1")
                message_handlers.handle_message = function()
                    return { message_id = "steer-1", completed = true, steered = case.steered, next_ops = {} }
                end
                local bus = { state = "running", ops = {}, settle_ops = {}, turn_state = { id = "turn-1" },
                    queue_op = function() return true end }
                local ok, err = session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                    { data = { text = "change of plan" }, request_id = "req-steer" }, { finishing = false })
                message_handlers.handle_message = original
                test.is_nil(err)
                test.is_true(ok)
                test.eq(waiter.flags.steering == true, case.woken)
            end
        end)

        it("leaves the channel open when Stop is not committed", function()
            local ctx = stop_ctx()
            ctx.writer.stop_with_input_rollback = function() return nil, "disk failure" end
            local cancel = ctx.approval_wake:register_batch_cancel("batch-1", "turn-1")
            local requested = false
            local bus = { turn_state = { id = "turn-1" }, request_stop = function() requested = true; return true end }
            session.route_input(ctx, bus, consts.TOPICS.STOP, {}, {})
            test.is_false(requested)
            local result = channel.select({ cancel:case_receive(), default = true })
            test.is_true(result.default)
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
