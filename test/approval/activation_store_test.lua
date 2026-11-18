local test = require("test")
local activation = require("activation")
local writer = require("writer")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local input_policy = require("input_policy")
local wait_for_boot = require("wait_for_boot")
local security = require("security")
local uuid = require("uuid")

local TRAIT = "wippy.session.traits:tool_approval"

local function clone(value: any): any
    if type(value) ~= "table" then return value end
    local out = {}
    for key, item in pairs(value) do out[key] = clone(item) end
    return out
end

local function define_tests()
    describe("Tool approval activation storage", function()
        local fixtures = {}

        local function new_session(): (string, any)
            local context_id, session_id = uuid.v7(), uuid.v7()
            assert(context_repo.create(context_id, "primary", "{}"))
            assert(session_repo.create(session_id, security.actor():id(), context_id, "Activation", "test", {},
                { agent_id = "app:approval_agent", model = "model:test", max_turn_iterations = 7 }))
            fixtures[#fixtures + 1] = { session_id = session_id, context_id = context_id }
            return session_id, assert(writer.new(session_id))
        end

        local function stored_config(session_id: string): any
            return assert(session_repo.get(session_id, security.actor():id())).config
        end

        local function activate(session_id: string, persistence: any, context: any?): any
            local ctx = {
                session_id = session_id,
                config = clone(stored_config(session_id)),
                writer = persistence,
                agent_ctx = { active_traits = { { id = TRAIT, context = context or {} } } },
            }
            local result, err = activation.apply(ctx, { id = "app:approval_agent",
                agent_options = { tool_approval = { schema = 1 } } })
            test.is_nil(err)
            test.is_true(result.protected)
            return ctx
        end

        before_all(function()
            wait_for_boot.run()
        end)
        after_all(function()
            for _, fixture in ipairs(fixtures) do
                session_repo.delete(fixture.session_id)
                context_repo.delete(fixture.context_id)
            end
        end)

        it("stores config.tool_approval with the row locked and keeps every other key", function()
            local session_id, persistence = new_session()
            local ctx = activate(session_id, persistence, { require = "all" })
            local config = stored_config(session_id)
            test.is_true(config.tool_approval.active)
            test.eq(config.tool_approval.require, "all")
            test.eq(config.tool_approval.revision, 1)
            test.eq(config.agent_id, "app:approval_agent")
            test.eq(config.max_turn_iterations, 7)
            test.eq(ctx.config.tool_approval.require, "all", "ctx.config is updated in the same step")
        end)

        it("leaves the row as it is when the mutation returns nil", function()
            local session_id, persistence = new_session()
            activate(session_id, persistence)
            local value, err = persistence:update_tool_approval(function() return nil end)
            test.is_nil(err)
            test.eq(value.revision, 1)
            test.eq(stored_config(session_id).tool_approval.revision, 1)
        end)

        it("keeps the stored activation through a whole-config write made from an older copy", function()
            local session_id, persistence = new_session()
            local stale = clone(stored_config(session_id))
            activate(session_id, persistence)
            stale.model = "model:changed"
            stale.tool_approval = { active = false }
            local ok, err = persistence:update_meta({ config = stale })
            test.is_nil(err)
            test.is_true(ok)
            local config = stored_config(session_id)
            test.eq(config.model, "model:changed")
            test.is_true(config.tool_approval.active, "a whole-config writer can't change tool_approval")
            test.is_true(stale.tool_approval.active, "the caller's table holds the stored value")
        end)

        it("keeps tool_approval through a session-scope input policy change after activation", function()
            local session_id, persistence = new_session()
            local agent = { id = "app:approval_agent", agent_options = { session_input = { can_manage = true } } }
            for _, stale_copy in ipairs({ false, true }) do
                local ctx = activate(session_id, persistence)
                if stale_copy then ctx.config.tool_approval = nil end
                ctx.status = "idle"
                ctx.current_agent = agent
                local mode = stale_copy and "block" or "steer"
                local interaction, err = input_policy.apply_request(ctx, { mode = mode, scope = "session" }, agent)
                test.is_nil(err)
                test.not_nil(interaction)
                local config = stored_config(session_id)
                test.eq(config.input_policy.while_running, mode)
                test.is_true(config.tool_approval.active, "stored activation kept (stale copy: " .. tostring(stale_copy) .. ")")
                test.is_true(ctx.config.tool_approval.active, "ctx.config keeps it (stale copy: " .. tostring(stale_copy) .. ")")
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
