local test = require("test")
local agent_context = require("agent_context")
local input_policy = require("input_policy")

local function define_tests()
    describe("session traits through the agent compiler", function()
        it("retains steering and management options in either trait order", function()
            for _, id in ipairs({ "app:steering_first_agent", "app:control_first_agent" }) do
                local context = agent_context.new({ enable_cache = false, context = {} })
                local agent, err = context:load_agent(id)
                test.is_nil(err)
                test.not_nil(agent)
                local defaults = input_policy.agent_defaults(agent)
                test.eq(defaults.while_running, "steer", id)
                test.is_true(defaults.can_manage, id)
            end
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
