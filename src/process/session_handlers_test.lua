local test = require("test")
local session_handlers = require("session_handlers")

local function mock_ctx(state_config)
    local captured = {
        persisted = nil :: table?,
        upstream = nil :: table?,
        system_messages = 0,
        developer_messages = 0,
        switched_agent = nil :: string?,
        switched_model = nil :: string?,
    }

    local ctx = {
        config = nil,
        reader = {
            state = function()
                return { config = state_config or {} }
            end,
            reset = function()
                return true
            end,
        },
        writer = {
            update_meta = function(self, meta)
                captured.persisted = meta.config
                return true
            end,
            add_message = function(self, message_type)
                if message_type == "system" then
                    captured.system_messages = captured.system_messages + 1
                elseif message_type == "developer" then
                    captured.developer_messages = captured.developer_messages + 1
                end
                return "msg-id"
            end,
        },
        upstream = {
            update_session = function(self, payload)
                captured.upstream = payload
            end,
        },
        agent_ctx = {
            current_model = "model:new",
            switch_to_agent = function(self, agent_id)
                captured.switched_agent = agent_id
                self.current_model = "model:new"
                return true
            end,
            switch_to_model = function(self, model)
                captured.switched_model = model
                return true
            end,
        },
    }

    return ctx, captured
end

local function define_tests()
    describe("session_handlers config normalization", function()
        it("agent_change tolerates a missing live ctx.config", function()
            local ctx, captured = mock_ctx({
                agent_id = "agent:old",
                model = "model:old",
            })

            local result, err = session_handlers.agent_change(ctx, {
                agent_id = "agent:new",
                init = true,
            })

            test.is_nil(err)
            test.not_nil(result)
            test.not_nil(ctx.config)
            test.eq(ctx.config.agent_id, "agent:new")
            test.eq(ctx.config.model, "model:new")
            test.eq(captured.switched_agent, "agent:new")
            test.eq((captured.persisted or {}).agent_id, "agent:new")
            test.eq((captured.persisted or {}).model, "model:new")
            test.eq((captured.upstream or {}).agent, "agent:new")
            test.eq((captured.upstream or {}).model, "model:new")
        end)

        it("model_change tolerates a missing live ctx.config", function()
            local ctx, captured = mock_ctx({
                agent_id = "agent:current",
                model = "model:old",
            })

            local result, err = session_handlers.model_change(ctx, {
                model = "model:new",
            })

            test.is_nil(err)
            test.not_nil(result)
            test.not_nil(ctx.config)
            test.eq(ctx.config.model, "model:new")
            test.eq(captured.switched_model, "model:new")
            test.eq((captured.persisted or {}).model, "model:new")
            test.eq((captured.upstream or {}).model, "model:new")
        end)
    end)
end

return test.run_cases(define_tests)
