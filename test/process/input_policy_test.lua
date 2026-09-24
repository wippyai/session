local test = require("test")
local policy = require("input_policy")

local function agent(mode, manage, id)
    return { id = id, agent_options = { session_input = { while_running = mode, can_manage = manage } } }
end

local function context(config, status, turn)
    local ctx
    local writes, events = {}, {}
    ctx = {
        config = config or {}, status = status or "running", turn_state = turn or { active = true },
        input_policy_revision = 0,
        writer = { update_meta = function(_, update)
            if ctx.write_error then return nil, ctx.write_error end
            writes[#writes + 1] = update
            return true
        end },
        upstream = { update_session = function(_, update)
            if ctx.event_error then error(ctx.event_error) end
            events[#events + 1] = update
        end },
    }
    return ctx, writes, events
end

local function define_tests()
    describe("session input policy", function()
        it("resolves turn, session, agent, and block precedence", function()
            local ctx = context({ input_policy = { while_running = "block" } })
            local steering = agent("steer", true)
            ctx.turn_state.input_policy = { while_running = "steer" }
            test.is_true(policy.resolve(ctx, steering).can_send)
            ctx.turn_state.input_policy = nil
            test.is_false(policy.resolve(ctx, steering).can_send)
            ctx.config.input_policy.while_running = nil
            test.is_true(policy.resolve(ctx, steering).can_send)
            test.is_false(policy.resolve(ctx).can_send)
        end)

        it("uses status only to make idle available and Stop unavailable to policy", function()
            local ctx = context({})
            test.is_false(policy.resolve(ctx).can_send)
            ctx.stop_requested = true
            test.is_false(policy.resolve(ctx, agent("steer", true)).can_send)
            ctx.turn_state.active, ctx.status = false, "idle"
            test.is_true(policy.resolve(ctx).can_send)
        end)

        it("defaults tool changes to turn scope and supports inherit", function()
            local ctx, writes = context({})
            local steering = agent("steer", true)
            local value, err = policy.apply_request(ctx, { mode = "block" }, steering)
            test.is_nil(err)
            test.is_false(value.can_send)
            test.eq(ctx.turn_state.input_policy.while_running, "block")
            test.is_nil((writes :: any)[1].config)
            value, err = policy.apply_request(ctx, { mode = "inherit" }, steering)
            test.is_nil(err)
            test.is_nil(ctx.turn_state.input_policy)
            test.is_true(value.can_send)
        end)

        it("persists only the session while_running override", function()
            local ctx, writes = context({ agent_id = "a", model = "m", nested = { keep = true } })
            local value, err = policy.apply_request(ctx, { mode = "steer", scope = "session" }, agent("block", true, "a"))
            test.is_nil(err)
            test.is_true(value.can_send)
            test.eq(ctx.config.input_policy.while_running, "steer")
            test.eq(ctx.config.model, "m")
            test.is_true((writes :: any)[1].config.nested.keep)
            value, err = policy.apply_request(ctx, { mode = "inherit", scope = "session" }, agent("block", true, "a"))
            test.is_nil(err)
            test.is_nil(ctx.config.input_policy.while_running)
        end)

        it("denies callers without the trait and stale agents", function()
            local ctx, writes, events = context({ agent_id = "new" })
            local value, err = policy.apply_request(ctx, { mode = "steer" }, agent("steer", false, "new"))
            test.is_nil(value)
            test.not_nil(err)
            value, err = policy.apply_request(ctx, { mode = "steer" }, agent("steer", true, "old"))
            test.is_nil(value)
            test.not_nil(err)
            test.eq(#writes, 0)
            test.eq(#events, 0)
        end)

        it("rejects invalid modes, scopes, and unhealthy turn scope", function()
            local ctx = context({})
            for _, request in ipairs({
                { mode = "retry" }, { mode = "steer", scope = "forever" },
            }) do
                local value, err = policy.apply_request(ctx, request, agent("steer", true))
                test.is_nil(value)
                test.not_nil(err)
            end
            ctx.turn_state.active, ctx.status = false, "idle"
            local value, err = policy.apply_request(ctx, { mode = "steer" }, agent("steer", true))
            test.is_nil(value)
            test.not_nil(err)
        end)

        it("does not mutate or publish after a persistence failure", function()
            local ctx, writes, events = context({ input_policy = { while_running = "block" } })
            local original_config, original_turn = ctx.config, ctx.turn_state
            ctx.interaction = policy.resolve(ctx)
            local original_interaction = ctx.interaction
            ctx.write_error = "disk failure"
            local value, err = policy.apply_request(ctx, { mode = "steer", scope = "session" }, agent("steer", true))
            test.is_nil(value)
            test.eq(err, "disk failure")
            test.is_true(ctx.config == original_config)
            test.is_true(ctx.turn_state == original_turn)
            test.is_true(ctx.interaction == original_interaction)
            test.eq(#writes, 0)
            test.eq(#events, 0)
        end)

        it("increments only when can_send changes and force still writes status", function()
            local ctx, writes = context({})
            ctx.input_policy_revision = 8
            local value, err = policy.publish(ctx, agent("steer", true), true)
            test.is_nil(err)
            test.eq(value.revision, 9)
            value = policy.publish(ctx, agent("steer", true), true)
            test.eq(value.revision, 9)
            test.eq(#writes, 2)
            ctx.status, ctx.turn_state.active = "idle", false
            value = policy.publish(ctx, agent("steer", true), true)
            test.eq(value.revision, 9)
        end)

        it("keeps committed state when event publication fails", function()
            local ctx, writes = context({})
            ctx.event_error = "socket closed"
            local value, err = policy.publish(ctx, agent("steer", true), true)
            test.is_nil(err)
            test.not_nil(value)
            test.eq(#writes, 1)
            test.is_true(ctx.interaction == value)
        end)

        it("recovers from persisted state without a temporary override", function()
            local stored = { config = { input_policy = { while_running = "steer" } }, meta = {
                interaction = { can_send = false, revision = 19 },
            } }
            local idle = policy.recovery_snapshot(stored, "idle")
            test.is_true(idle.can_send)
            test.eq(idle.revision, 20)
            test.is_false(policy.recovery_snapshot(stored, "failed").can_send)
        end)

        it("clears only the temporary override", function()
            local ctx = context({ input_policy = { while_running = "steer" } })
            ctx.turn_state.input_policy = { while_running = "block" }
            policy.clear_turn(ctx)
            test.is_nil(ctx.turn_state.input_policy)
            test.eq(ctx.config.input_policy.while_running, "steer")
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
