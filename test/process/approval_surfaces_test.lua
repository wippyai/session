local test = require("test")
local approval_surfaces = require("approval_surfaces")
local session = require("session")
local message_handlers = require("message_handlers")
local wake = require("wake")
local consts = require("consts")

-- Whether the waiter's channel holds a wake-up token (taken).
local function woken(waiter: any): boolean
    return not channel.select({ waiter.channel:case_receive(), default = true }).default
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
            test.is_true(woken(waiter))
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

        it("wakes the gate on a committed Stop, before bus:request_stop runs", function()
            local ctx = stop_ctx()
            local waiter = ctx.approval_wake:arm("batch-1")
            local woken_when_requested = nil
            local bus = { turn_state = { id = "turn-1" }, request_stop = function()
                woken_when_requested = woken(waiter)
                return true
            end }
            local ok, err = session.route_input(ctx, bus, consts.TOPICS.STOP, {}, {})
            test.is_nil(err)
            test.is_true(ok)
            test.is_true(woken_when_requested)
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
                local called, ok, err = pcall(session.route_input, ctx, bus, consts.TOPICS.MESSAGE,
                    { data = { text = "change of plan" }, request_id = "req-steer" }, { finishing = false })
                message_handlers.handle_message = original
                if not called then error(ok) end
                test.is_nil(err)
                test.is_true(ok)
                test.eq(woken(waiter), case.woken)
            end
        end)

        it("neither wakes the gate nor stops the bus when Stop is not committed", function()
            local ctx = stop_ctx()
            ctx.writer.stop_with_input_rollback = function() return nil, "disk failure" end
            local waiter = ctx.approval_wake:arm("batch-1")
            local requested = false
            local bus = { turn_state = { id = "turn-1" }, request_stop = function() requested = true; return true end }
            session.route_input(ctx, bus, consts.TOPICS.STOP, {}, {})
            test.is_false(requested)
            test.is_false(woken(waiter))
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
