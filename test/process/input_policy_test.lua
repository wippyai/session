local test = require("test")
local policy = require("input_policy")

local function agent(mode, manage, id)
    return { id = id, agent_options = { session_input = { while_running = mode, can_manage = manage } } }
end

local function context(config, status, turn)
    local ctx
    local writes: {any} = {}
    local events: {any} = {}
    ctx = {
        config = config or {}, status = status or "running", turn_state = turn or { active = true },
        input_policy_revision = 0,
        writer = { update_meta = function(_, update)
            if ctx.write_error then return nil, ctx.write_error end
            writes[#writes + 1] = update
            return true
        end },
        upstream = { update_session = function(_, update) events[#events + 1] = update end },
    }
    return ctx, writes, events
end

local function define_tests()
    describe("session input policy", function()
        it("resolves turn, session, agent and legacy precedence", function()
            local ctx = context({ input_policy = { while_running = "block" } })
            local a = agent("steer", true)
            ctx.turn_state.input_policy = { while_running = "steer" }
            test.eq(policy.resolve(ctx, a).mode, "steer")
            ctx.turn_state.input_policy = nil
            test.eq(policy.resolve(ctx, a).mode, "block")
            ctx.config.input_policy.while_running = nil
            test.eq(policy.resolve(ctx, a).mode, "steer")
            test.eq(policy.resolve(ctx).mode, "block")
        end)

        it("keeps Stop separate from a blocked composer", function()
            local value = policy.resolve(context({}))
            test.is_false(value.can_send)
            test.is_true(value.can_stop)
        end)

        it("blocks both controls until a stopped operation finishes", function()
            local ctx = context({})
            ctx.stop_requested = true
            local value = policy.resolve(ctx, agent("steer", true))
            test.is_false(value.can_send)
            test.is_false(value.can_stop)
            ctx.turn_state.active, ctx.status = false, "idle"
            value = policy.resolve(ctx)
            test.is_true(value.can_send)
            test.is_false(value.can_stop)
        end)

        it("enforces empty, malformed and explicit application restrictions", function()
            for _, allowed in ipairs({ {}, { "block" }, "invalid" }) do
                local ctx = context({ input_policy = { allowed_modes = allowed } })
                local value = policy.resolve(ctx, agent("steer", true))
                test.eq(value.mode, "block")
                test.is_false(value.can_send)
                local changed, err = policy.apply_request(ctx, { mode = "steer" }, agent("steer", true))
                test.is_nil(changed)
                test.not_nil(err)
                ctx.status, ctx.turn_state.active = "idle", false
                test.is_true(policy.resolve(ctx, agent("steer", true)).can_send)
            end
        end)

        it("defaults management changes to turn scope and inherits correctly", function()
            local ctx, writes = context({})
            local a = agent("steer", true)
            local value, err = policy.apply_request(ctx, { mode = "block" }, a)
            test.is_nil(err)
            test.eq(value.mode, "block")
            test.eq(ctx.turn_state.input_policy.while_running, "block")
            test.is_nil((writes :: any)[1].config)
            value, err = policy.apply_request(ctx, { mode = "inherit" }, a)
            test.is_nil(err)
            test.is_nil(ctx.turn_state.input_policy)
            test.eq(value.mode, "steer")
        end)

        it("preserves all config and the turn override when changing session scope", function()
            local ctx, writes = context({
                agent_id = "a", model = "m", nested = { keep = true },
                input_policy = { while_running = "block", allowed_modes = { "block", "steer" }, allow_agent_changes = true },
            })
            ctx.turn_state.input_policy = { while_running = "steer" }
            local value, err = policy.apply_request(ctx, { mode = "inherit", scope = "session" }, agent("block", true, "a"))
            test.is_nil(err)
            test.eq(value.mode, "steer")
            test.is_nil(ctx.config.input_policy.while_running)
            test.is_true(ctx.config.input_policy.allow_agent_changes)
            test.eq(ctx.config.model, "m")
            test.is_true((writes :: any)[1].config.nested.keep)
            test.eq(ctx.turn_state.input_policy.while_running, "steer")
        end)

        it("requires both active-agent capability and application permission", function()
            local ctx, writes, events = context({ input_policy = { can_manage = true } })
            local value, err = policy.apply_request(ctx, { mode = "steer" }, agent("steer", false))
            test.is_nil(value)
            test.not_nil(err)
            ctx.config.input_policy.allow_agent_changes = false
            value, err = policy.apply_request(ctx, { mode = "steer" }, agent("steer", true))
            test.is_nil(value)
            test.not_nil(err)
            test.eq(#writes, 0)
            test.eq(#events, 0)
        end)

        it("rejects a management request from the prior agent after handoff", function()
            local ctx = context({ agent_id = "new" })
            local value, err = policy.apply_request(ctx, { mode = "steer" }, agent("steer", true, "old"))
            test.is_nil(value)
            test.not_nil(err)
        end)

        it("rejects malformed scopes and unhealthy turn overrides", function()
            local ctx = context({})
            for _, scope in ipairs({ false, {}, "forever" }) do
                local value, err = policy.apply_request(ctx, { mode = "steer", scope = scope }, agent("steer", true))
                test.is_nil(value)
                test.not_nil(err)
            end
            ctx.turn_state.active, ctx.status = false, "idle"
            local value, err = policy.apply_request(ctx, { mode = "steer" }, agent("steer", true))
            test.is_nil(value)
            test.not_nil(err)
        end)

        it("does not mutate state or publish when persistence fails", function()
            local ctx, writes, events = context({ input_policy = { while_running = "block" } })
            local config, turn = ctx.config, ctx.turn_state
            ctx.interaction = policy.resolve(ctx)
            local interaction = ctx.interaction
            ctx.write_error = "disk failure"
            local value, err = policy.apply_request(ctx, { mode = "steer", scope = "session" }, agent("steer", true))
            test.is_nil(value)
            test.eq(err, "disk failure")
            test.is_true(ctx.config == config)
            test.is_true(ctx.turn_state == turn)
            test.is_true(ctx.interaction == interaction)
            test.eq(ctx.input_policy_revision, 0)
            test.eq(#writes, 0)
            test.eq(#events, 0)
        end)

        it("persists monotonic revisions before publishing and skips unchanged state", function()
            local ctx, writes, events = context({})
            ctx.input_policy_revision = 8
            local value, err = policy.publish(ctx, agent("steer", true), true)
            test.is_nil(err)
            test.eq(value.revision, 9)
            test.eq((writes :: any)[1].meta.interaction.revision, (events :: any)[1].interaction.revision)
            policy.publish(ctx, agent("steer", true))
            test.eq(#writes, 1)
            ctx.status, ctx.turn_state.active = "idle", false
            value = policy.publish(ctx, agent("steer", true))
            test.eq(value.revision, 10)
        end)

        it("recovery drops temporary state but retains agent defaults and session overrides", function()
            local stored = { config = {}, meta = {
                interaction = { mode = "block", revision = 19 },
                input_policy_default = { while_running = "steer" },
            } }
            local value = policy.recovery_snapshot(stored, "idle")
            test.eq(value.mode, "steer")
            test.eq(value.revision, 20)
            test.is_true(value.can_send)
            test.is_false(value.can_stop)
            stored.config.input_policy = { while_running = "block" }
            test.eq(policy.recovery_snapshot(stored, "idle").mode, "block")
            test.is_false(policy.recovery_snapshot(stored, "failed").can_send)
        end)

        it("clears only the temporary override", function()
            local ctx = context({ input_policy = { while_running = "steer" } })
            ctx.turn_state.input_policy = { while_running = "block" }
            policy.clear_turn(ctx)
            test.is_nil(ctx.turn_state.input_policy)
            test.eq(ctx.config.input_policy.while_running, "steer")
        end)

        it("uses a stable fingerprint without text or file boundary collisions", function()
            test.eq(policy.fingerprint("a", { "b", "c" }), policy.fingerprint("a", { "b", "c" }))
            test.is_false(policy.fingerprint("ab", { "c" }) == policy.fingerprint("a", { "b", "c" }))
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
