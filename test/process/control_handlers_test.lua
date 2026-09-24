local test = require("test")
local control_handlers = require("control_handlers")

-- Builds a ctx whose agent_ctx records the declarative overlay calls. control_config
-- reads session state for the agent/model path; a traits/tools-only directive leaves
-- that path untouched (config unchanged), so a minimal reader suffices.
local function mock_ctx()
    local captured = {
        traits = nil :: {string}?,
        tools = nil :: {string}?,
        traits_set = false,
        tools_set = false,
        persisted = nil :: {[string]: any}?,
        switched_to = nil :: string?,
        switches = {},
        resets = 0,
        upstream_calls = 0,
        persist_error = nil :: string?,
        persisted_update = nil :: {[string]: any}?,
        persist_calls = 0,
        session_errors = 0,
        current_agent = nil :: string?,
        session_input = {} :: {[string]: any},
    }
    local ctx = {
        config = {},
        agent_ctx = {
            current_model = "model:default",
            set_active_traits = function(self, traits)
                captured.traits = traits
                captured.traits_set = true
                captured.session_input = {}
                for _, trait in ipairs(traits or {}) do
                    if trait == "wippy.session.traits:steering" then
                        captured.session_input.while_running = "steer"
                    end
                end
                return true
            end,
            set_active_tools = function(self, tools)
                captured.tools = tools
                captured.tools_set = true
                return true
            end,
            switch_to_agent = function(self, agent_id, opts)
                captured.switched_to = agent_id
                captured.current_agent = agent_id
                captured.switches[#captured.switches + 1] = agent_id
                return true
            end,
            switch_to_model = function(self, model)
                return true
            end,
            get_current_agent = function()
                return { id = captured.current_agent, agent_options = { session_input = captured.session_input } }
            end,
        },
        reader = {
            state = function()
                return { config = {} }
            end,
            reset = function() end
        },
        writer = {
            update_meta = function(self, meta)
                if captured.persist_error then return nil, captured.persist_error end
                captured.persist_calls = captured.persist_calls + 1
                captured.persisted_update = meta
                captured.persisted = meta.config
                return true
            end,
            add_message = function() end
        },
        upstream = {
            update_session = function() captured.upstream_calls = captured.upstream_calls + 1 end,
            session_error = function() captured.session_errors = captured.session_errors + 1 end,
        }
    }
    return ctx, captured
end

local function define_tests()
    describe("control_config trait and tool overlays", function()
        it("applies active traits declared in config", function()
            local ctx, captured = mock_ctx()

            local result, err = control_handlers.control_config(ctx,
                { config_changes = { traits = { "researcher", "writer" } } })

            test.is_nil(err)
            test.not_nil(result)
            test.is_true(captured.traits_set)
            local traits = captured.traits or {}
            test.eq(#traits, 2)
            test.eq(traits[1], "researcher")
            -- overlay is persisted to session config so it survives a restart
            local persisted = captured.persisted or {}
            test.eq((persisted.active_traits or {})[1], "researcher")
        end)

        it("applies active tools declared in config", function()
            local ctx, captured = mock_ctx()

            control_handlers.control_config(ctx,
                { config_changes = { tools = { "wippy.files:read_file" } } })

            test.is_true(captured.tools_set)
            test.eq((captured.tools or {})[1], "wippy.files:read_file")
        end)

        it("treats an empty tool list as an explicit clear", function()
            local ctx, captured = mock_ctx()

            control_handlers.control_config(ctx, { config_changes = { tools = {} } })

            test.is_true(captured.tools_set)
            test.eq(#captured.tools, 0)
        end)

        it("treats an empty trait list as an explicit clear", function()
            local ctx, captured = mock_ctx()

            control_handlers.control_config(ctx, { config_changes = { traits = {} } })

            test.is_true(captured.traits_set)
            test.eq(#(captured.traits or {}), 0)
        end)

        it("applies a trait overlay onto the new agent when both change together", function()
            local ctx, captured = mock_ctx()

            control_handlers.control_config(ctx,
                { config_changes = { agent = "agent:writer", traits = { "concise" } } })

            -- agent switch happens before the overlay is applied
            test.eq(captured.switched_to, "agent:writer")
            test.is_true(captured.traits_set)
            test.eq((captured.traits or {})[1], "concise")
            -- the overlay, not the agent-switch clear, is what gets persisted
            local persisted = captured.persisted or {}
            test.eq((persisted.active_traits or {})[1], "concise")
        end)

        it("clears persisted overlays when only the agent changes", function()
            local ctx, captured = mock_ctx()

            control_handlers.control_config(ctx, { config_changes = { agent = "agent:writer" } })

            local persisted = captured.persisted or {}
            test.eq(persisted.active_traits, false)
            test.eq(persisted.active_tools, false)
        end)

        it("does not apply or persist overlays when the agent switch fails", function()
            local ctx, captured = mock_ctx()
            ctx.agent_ctx.switch_to_agent = function(self, agent_id, opts)
                return false, "agent not found"
            end

            local result, err = control_handlers.control_config(ctx,
                { config_changes = { agent = "agent:missing", traits = { "concise" } } })

            test.not_nil(err)
            test.is_nil(result)
            test.is_false(captured.traits_set, "overlay not applied after a failed switch")
            test.is_nil(captured.persisted, "nothing persisted after a failed switch")
        end)

        it("applies and persists agent, model, traits and tools together", function()
            local ctx, captured = mock_ctx()

            control_handlers.control_config(ctx, { config_changes = {
                agent = "agent:writer",
                model = "model:fast",
                traits = { "concise" },
                tools = { "wippy.files:read_file" },
            } })

            test.eq(captured.switched_to, "agent:writer")
            test.is_true(captured.traits_set)
            test.is_true(captured.tools_set)
            local p = captured.persisted or {}
            test.eq(p.agent_id, "agent:writer")
            test.eq(p.model, "model:fast")
            test.eq((p.active_traits or {})[1], "concise")
            test.eq((p.active_tools or {})[1], "wippy.files:read_file")
        end)

        it("leaves overlays untouched when traits and tools are absent", function()
            local ctx, captured = mock_ctx()

            control_handlers.control_config(ctx, { config_changes = {} })

            test.is_false(captured.traits_set)
            test.is_false(captured.tools_set)
        end)

        it("restores runtime state and publishes nothing when persistence fails", function()
            local ctx, captured = mock_ctx()
            ctx.config = {
                agent_id = "agent:old",
                model = "model:old",
                active_traits = { "old-trait" },
                active_tools = { "old-tool" },
            }
            captured.persist_error = "disk failure"

            local result, err = control_handlers.control_config(ctx, { config_changes = {
                agent = "agent:new",
                traits = { "new-trait" },
                tools = { "new-tool" },
            } })

            test.is_nil(result)
            test.contains(err, "disk failure")
            test.eq(captured.switches[1], "agent:new")
            test.eq(captured.switches[2], "agent:old")
            test.eq((captured.traits or {})[1], "old-trait")
            test.eq((captured.tools or {})[1], "old-tool")
            test.eq(ctx.config.agent_id, "agent:old")
            test.eq(captured.upstream_calls, 0)
        end)

        it("restores inherited overlays when durable persistence fails", function()
            local ctx, captured = mock_ctx()
            ctx.config = { agent_id = "agent:old", model = "model:old" }
            captured.persist_error = "disk failure"

            local result, err = control_handlers.control_config(ctx, { config_changes = {
                traits = { "new-trait" },
                tools = { "new-tool" },
            } })

            test.is_nil(result)
            test.contains(err, "disk failure")
            test.is_true(captured.traits_set)
            test.is_true(captured.tools_set)
            -- nil is the agent-context sentinel for inherited defaults. An empty
            -- list would silently replace the agent defaults after rollback.
            test.is_nil(captured.traits)
            test.is_nil(captured.tools)
        end)

        it("sets the handoff barrier and clears the turn override after a committed agent change", function()
            local ctx, captured = mock_ctx()
            ctx.config = { agent_id = "agent:old", model = "model:old" }
            ctx.status = "running"
            ctx.interaction = { can_send = true, revision = 0 }
            ctx.turn_state = { active = true, input_policy = { while_running = "steer" } }

            local result, err = control_handlers.control_config(ctx, {
                config_changes = { agent = "agent:new" },
            })

            test.is_nil(err)
            test.not_nil(result)
            test.is_true((ctx.turn_state :: any).handoff)
            test.is_true((ctx.turn_state :: any).failed)
            test.is_nil(ctx.turn_state.input_policy)
            test.eq(captured.persist_calls, 1)
            test.is_false((captured.persisted_update or {}).meta.interaction.can_send)
        end)

        it("commits a steering trait default and interaction in one write", function()
            local ctx, captured = mock_ctx()
            ctx.config = { agent_id = "agent:current", model = "model:default" }
            ctx.status = "running"
            ctx.turn_state = { active = true }
            ctx.interaction = { can_send = false, revision = 0 }
            captured.current_agent = "agent:current"

            local result, err = control_handlers.control_config(ctx, { config_changes = {
                traits = { "wippy.session.traits:steering" },
            } })

            test.is_nil(err)
            test.not_nil(result)
            test.eq(captured.persist_calls, 1)
            test.is_true((captured.persisted_update or {}).meta.interaction.can_send)
            test.eq((captured.persisted_update or {}).meta.interaction.revision, 1)
        end)

        it("marks the session failed when durable write and agent rollback both fail", function()
            local ctx, captured = mock_ctx()
            ctx.config = { agent_id = "agent:old", model = "model:old" }
            captured.persist_error = "disk failure"
            local switches = 0
            ctx.agent_ctx.switch_to_agent = function(self, agent_id)
                switches = switches + 1
                captured.switches[#captured.switches + 1] = agent_id
                if switches > 1 then return false, "rollback unavailable" end
                return true
            end

            local result, err = control_handlers.control_config(ctx, {
                config_changes = { agent = "agent:new" },
            })

            test.is_nil(result)
            test.contains(err, "runtime rollback failed")
            test.eq(ctx.status, "failed")
            test.eq(captured.session_errors, 1)
        end)
    end)
end

return test.run_cases(define_tests)
