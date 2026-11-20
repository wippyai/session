local test = require("test")
local control_handlers = require("control_handlers")
local command_bus = require("command_bus")
local consts = require("consts")
local uuid = require("uuid")
local security = require("security")
local context_repo = require("context_repo")
local session_repo = require("session_repo")
local artifact_repo = require("artifact_repo")
local writer = require("writer")
local wait_for_boot = require("wait_for_boot")
local message_handlers = require("message_handlers")
local fx = require("gate_fixtures")

-- Artifact content for the packaged-content cases (EE2-2712).
local WEB_PAGE = '{"name":"@app/report","version":"1.0.0","specification":"wippy-component-1.0",'
    .. '"wippy":{"type":"page","path":"index.html"}}'
local ES_MODULE = '{"name":"@app/widget","version":"1.0.0","specification":"wippy-component-1.0",'
    .. '"browser":"index.js","wippy":{"tagName":"app-widget"}}'
local IFRAME_TAG = '{"specification":"wippy-component-tag-1.0","wippy":{"tagName":"w-iframe"},'
    .. '"props":{"src":"https://example.com"}}'
local SAFE_FORM = '{"specification":"wippy-component-tag-1.0","wippy":{"tagName":"wippy-form"},'
    .. '"props":{"title":"Form"}}'
local PLAIN_JSON = '{"rows":[1,2,3]}'
-- The Host parses any content that parses as JSON, whatever its content
-- type, and mounts no value other than a string or a safe form while isolated.
local NOT_ISOLATABLE = {
    { name = "web-page package", content = WEB_PAGE },
    { name = "web-page package as text/html", content = WEB_PAGE, content_type = "text/html" },
    { name = "web-page package with a charset", content = WEB_PAGE,
        content_type = "application/json; charset=utf-8" },
    { name = "plain JSON object", content = PLAIN_JSON },
    { name = "plain JSON object as text/plain", content = PLAIN_JSON, content_type = "text/plain" },
    { name = "JSON array", content = '[{"a":1}]' },
    { name = "JSON number as text/markdown", content = "123", content_type = "text/markdown" },
    { name = "JSON boolean", content = "true" },
    { name = "JSON null", content = "null" },
    { name = "ES module package", content = ES_MODULE },
    { name = "w-iframe tag", content = IFRAME_TAG },
    { name = "wippy-form with onclick", content = '{"specification":"wippy-component-tag-1.0",'
        .. '"wippy":{"tagName":"wippy-form"},"props":{"title":"Form","onclick":"parent.approve()"}}' },
    { name = "wippy-form with ONCLICK", content = '{"specification":"wippy-component-tag-1.0",'
        .. '"wippy":{"tagName":"wippy-form"},"props":{"title":"Form","ONCLICK":"parent.approve()"}}' },
}
local PROTECTED_ACTIVATION = { active = true, require = "all", approve_all = "off", timeout_seconds = 900,
    max_requests_per_turn = 10, revision = 1 }

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
            reset = function() return true end
        },
        writer = {
            update_meta = function(self, meta)
                if captured.persist_error then return nil, captured.persist_error end
                captured.persist_calls = captured.persist_calls + 1
                captured.persisted_update = meta
                captured.persisted = meta.config
                return true
            end,
            add_message = function() return "stored-message" end
        },
        upstream = {
            update_session = function() captured.upstream_calls = captured.upstream_calls + 1 end,
            session_error = function() captured.session_errors = captured.session_errors + 1 end,
        }
    }
    return ctx, captured
end

local function define_tests()
    describe("explicit behavior targets across agent switches", function()
        it("preserves an explicitly empty tools restriction across an agent switch", function()
            local ctx = mock_ctx()
            ctx.config = { agent_id = "agent:old", active_tools = {} }
            local ok, err = control_handlers.apply_behavior_controls(ctx, {
                { config = { agent = "agent:new", tools = {} } }
            })
            test.is_nil(err)
            test.is_true(ok)
            test.eq(type(ctx.config.active_tools), "table")
            test.eq(#ctx.config.active_tools, 0)
        end)

        it("retains an explicit trait overlay equal to the old agent overlay", function()
            local ctx, captured = mock_ctx()
            ctx.config = { agent_id = "agent:old", model = "model:old", active_traits = { "trait:keep" } }
            local ok, err = control_handlers.apply_behavior_controls(ctx, {
                { config = { agent = "agent:new", traits = { "trait:keep" } } }
            })
            test.is_nil(err)
            test.is_true(ok)
            test.eq(type(ctx.config.active_traits), "table")
            test.eq(ctx.config.active_traits[1], "trait:keep")
        end)
        it("retains an explicit model equal to the old model when the new default differs", function()
            local ctx, captured = mock_ctx()
            ctx.config = { agent_id = "agent:old", model = "model:keep" }
            ctx.agent_ctx.switch_to_agent = function(self, id, options)
                self.current_model = options and options.model or "model:new_default"
                captured.current_agent = id
                return true
            end
            local ok, err = control_handlers.apply_behavior_controls(ctx, {
                { config = { agent = "agent:new", model = "model:keep" } }
            })
            test.is_nil(err)
            test.is_true(ok)
            test.eq(ctx.config.model, "model:keep")
        end)
    end)

    describe("behavior controls", function()
        it("replays a combined agent/model/overlay target without resetting it again", function()
            local ctx, captured = mock_ctx()
            ctx.config = { agent_id = "agent:old", model = "model:keep", active_tools = {} }
            local controls = {{ config = { agent = "agent:new", model = "model:keep", tools = {} } }}
            local initial_writes, initial_announcements
            for attempt = 1, 2 do
                local result, err = control_handlers.apply_behavior_controls(ctx, controls)
                test.is_nil(err)
                test.is_true(result)
                test.eq(ctx.config.model, "model:keep")
                test.eq(type(ctx.config.active_tools), "table")
                test.eq(#ctx.config.active_tools, 0)
                if attempt == 1 then
                    initial_writes, initial_announcements = captured.persist_calls, captured.upstream_calls
                else
                    test.eq(captured.persist_calls, initial_writes, "replay adds no durable writes")
                    test.eq(captured.upstream_calls, initial_announcements, "replay adds no announcements")
                end
            end
            test.eq(#captured.switches, 1)
            test.eq(captured.persist_calls, 1)
        end)

        it("does not reset overlays or announce an already-committed target during replay", function()
            local ctx, captured = mock_ctx()
            ctx.config = { agent_id = "agent:target", model = "model:target", active_traits = { "trait:kept" } }
            local result, err = control_handlers.apply_behavior_controls(ctx, {
                { config = { agent = "agent:target", model = "model:target", traits = { "trait:kept" } } }
            })
            test.is_nil(err)
            test.is_true(result)
            test.eq(#captured.switches, 0)
            test.eq(captured.persist_calls, 0)
            test.eq(captured.upstream_calls, 0)
        end)

        it("validates the entire batch before applying any effects", function()
            local ctx, captured = mock_ctx()
            local result, err = control_handlers.apply_behavior_controls(ctx, {
                { config = { model = "model:new" } }, { config = { stop = true } }
            })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(captured.persist_calls, 0)
        end)

        it("returns storage failures without continuing later policies", function()
            local ctx, captured = mock_ctx()
            ctx.writer.set_context = function() return nil, "disk full" end
            local result, err = control_handlers.apply_behavior_controls(ctx, {
                { context = { session = { set = { key = "value" } } } },
                { config = { model = "model:new" } }
            })
            test.is_nil(result)
            test.contains(tostring(err), "disk full")
            test.eq(captured.persist_calls, 0)
        end)
    end)

    describe("context and memory control failures", function()
        it("returns the storage error from each context write", function()
            for _, case in ipairs({
                { operations = { public_meta = { set = { key = { title = "new" } } } },
                    method = "update_meta" },
                { operations = { session = { set = { key = "new" } } },
                    method = "set_context" },
                { operations = { session = { delete = { "key" } } },
                    method = "delete_context" }
            }) do
                local ctx = {
                    reader = { state = function() return { public_meta = {} } end,
                        reset = function() return true end },
                    writer = {},
                    upstream = { update_session = function() end }
                }
                ctx.writer[case.method] = function() return nil, "context disk unavailable" end
                local result, err = control_handlers.control_context(ctx,
                    { context_operations = case.operations })
                test.is_nil(result)
                test.contains(tostring(err), "context disk unavailable")
            end
        end)

        it("returns the storage error from each memory write", function()
            for _, case in ipairs({
                { operations = { clear = "note" }, method = "delete_session_context" },
                { operations = { add = {{ type = "note", text = "new" }} },
                    method = "add_session_context" },
                { operations = { delete = { "memory-1" } },
                    method = "delete_session_context" }
            }) do
                local ctx = {
                    reader = { contexts = function()
                        return { all = function() return {{ id = "memory-1", type = "note" }} end }
                    end },
                    writer = {}
                }
                ctx.writer[case.method] = function() return nil, "memory disk unavailable" end
                local result, err = control_handlers.control_memory(ctx,
                    { memory_operations = case.operations })
                test.is_nil(result)
                test.contains(tostring(err), "memory disk unavailable")
            end
        end)
    end)

    describe("artifact control failures", function()
        it("classifies standalone and inline deliveries independently", function()
            local messages = {}
            local ctx = {
                writer = {
                    create_artifact = function() return true end,
                    add_message = function(_self, kind, content, metadata)
                        table.insert(messages, { kind = kind, content = content, metadata = metadata })
                        return "message-" .. tostring(#messages)
                    end,
                },
                upstream = {
                    send_message_update = function() end,
                    update_session = function() end,
                },
            }

            local result, err = control_handlers.control_artifacts(ctx, { artifacts = {
                { title = "Inline chart", content = "<svg/>", instructions = true },
                { title = "Standalone report", content = "report", instructions = false },
            } })

            test.is_nil(err)
            test.is_true(result.completed)
            test.eq(#result.created_artifacts, 2)
            test.is_true(result.created_artifacts[1].inline)
            test.is_false(result.created_artifacts[2].inline)
            local cards = 0
            for _, message in ipairs(messages) do
                if message.kind == consts.MSG_TYPE.ARTIFACT then cards = cards + 1 end
            end
            test.eq(cards, 1, "only instructions=false gets a standalone artifact card")
        end)

        it("continues when an artifact announcement or instruction write fails", function()
            for _, failed_type in ipairs({ consts.MSG_TYPE.SYSTEM, consts.MSG_TYPE.DEVELOPER }) do
                local updates = 0
                local ctx = {
                    writer = {
                        create_artifact = function() return true end,
                        add_message = function(_self, kind)
                            if kind == failed_type then return nil, "announcement disk unavailable" end
                            return "stored-message"
                        end
                    },
                    upstream = {
                        send_message_update = function() end,
                        update_session = function() updates = updates + 1 end
                    }
                }
                local result, err = control_handlers.control_artifacts(ctx, {
                    artifacts = {{ title = "example", content = "text", instructions = true }}
                })
                test.is_nil(err)
                test.is_true(result.completed)
                test.eq(updates, 1)
            end
        end)

        it("fails the turn when an artifact update is not confirmed", function()
            for _, failure in ipairs({
                { error = "artifact missing" },
                { error = "disk unavailable" }
            }) do
                local continued = false
                local ctx = { writer = {
                    session_id = "session-1",
                    update_artifact = function() return nil, failure.error end
                } }
                local bus = command_bus.new(ctx)
                bus:mount_op_handler(consts.OP_TYPE.CONTROL_ARTIFACTS,
                    control_handlers.control_artifacts)
                bus:mount_op_handler("after_update", function()
                    continued = true
                    bus:stop()
                    return { completed = true }
                end)
                bus:queue_op({ type = consts.OP_TYPE.CONTROL_ARTIFACTS,
                    artifacts = {{ id = "artifact-1", content = "updated" }} })
                bus:queue_op({ type = "after_update" })

                local original_find = artifact_repo.find
                artifact_repo.find = function() return { session_id = "session-1" } end
                local ok, err = bus:run()
                artifact_repo.find = original_find

                test.is_nil(ok)
                test.contains(tostring(err), failure.error)
                test.is_false(continued)
            end
        end)

        it("ends the turn on a failed second artifact without referencing it", function()
            local stored = {}
            local messages = {}
            local updates = {} :: {any}
            local ctx = {
                writer = {
                    create_artifact = function(_self, id)
                        if #stored == 1 then return nil, "disk unavailable" end
                        table.insert(stored, id)
                        return true
                    end,
                    add_message = function(_self, kind, content, metadata)
                        table.insert(messages, { kind = kind, content = content, metadata = metadata })
                        return "message-" .. tostring(#messages)
                    end
                },
                upstream = {
                    send_message_update = function(_self, _id, _kind, payload)
                        table.insert(updates, payload)
                    end,
                    update_session = function() end
                }
            }
            local bus = command_bus.new(ctx)
            bus:mount_op_handler(consts.OP_TYPE.CONTROL_ARTIFACTS,
                control_handlers.control_artifacts)
            bus:mount_op_handler("after_artifacts", function()
                bus:stop()
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.CONTROL_ARTIFACTS, artifacts = {
                { title = "stored", content = "one", instructions = false },
                { title = "missing", content = "two", instructions = false }
            } })
            bus:queue_op({ type = "after_artifacts" })

            local ok, err = bus:run()

            test.is_nil(ok)
            test.contains(tostring(err), "disk unavailable")
            test.eq(#stored, 1)
            test.eq(#updates, 1)
            test.eq(updates[1].artifact_id, stored[1])
            for _, message in ipairs(messages) do
                test.eq(message.metadata.artifact_id, stored[1])
            end
        end)
    end)

    -- `_control` payloads can't change config.tool_approval.
    describe("control_config and the tool approval activation", function()
        local STORED = { active = true, require = "all", approve_all = "off", timeout_seconds = 900,
            max_requests_per_turn = 10, revision = 2 }

        it("refuses a control that names tool_approval and changes nothing", function()
            for _, changes in ipairs({
                { tool_approval = { active = false } },
                { tool_approval = false, agent = "agent:writer", traits = {} },
            }) do
                local ctx, captured = mock_ctx()
                ctx.config = { agent_id = "agent:old", tool_approval = STORED }
                local result, err = control_handlers.control_config(ctx, { config_changes = changes })
                test.is_nil(err)
                test.eq(result.rejected, "tool_approval_forbidden: Tool approval settings cannot be changed by a control")
                test.eq(captured.persist_calls, 0, "nothing is stored")
                test.is_false(captured.traits_set, "no overlay is applied")
                test.is_nil(captured.switched_to, "no agent switch")
                test.eq(ctx.config.tool_approval, STORED)
            end
        end)

        it("keeps the activation through a control agent switch and trait overlay", function()
            local ctx, captured = mock_ctx()
            ctx.config = { agent_id = "agent:old", tool_approval = STORED }
            local result, err = control_handlers.control_config(ctx,
                { config_changes = { agent = "agent:writer", traits = { "concise" } } })
            test.is_nil(err)
            test.is_nil(result.rejected)
            local persisted = captured.persisted or {}
            test.eq(persisted.tool_approval.require, "all")
            test.eq(ctx.config.tool_approval.revision, 2)
            test.eq(ctx.config.agent_id, "agent:writer")
        end)

        it("refuses tool_approval in a behavior control proposal", function()
            local ctx, captured = mock_ctx()
            ctx.config = { agent_id = "agent:old", tool_approval = STORED }
            local ok, err = control_handlers.apply_behavior_controls(ctx, {
                { config = { tool_approval = { active = false } } }
            })
            test.is_nil(ok)
            test.contains(tostring(err), "only supports agent, model, traits and tools")
            test.eq(captured.persist_calls, 0)
            test.eq(ctx.config.tool_approval, STORED)
        end)
    end)

    describe("control_config trait and tool overlays", function()
        it("continues when a configuration announcement is not stored", function()
            for _, failed_type in ipairs({ consts.MSG_TYPE.SYSTEM, consts.MSG_TYPE.DEVELOPER }) do
                local ctx = mock_ctx()
                ctx.writer.add_message = function(_self, kind)
                    if kind == failed_type then return nil, "config message disk unavailable" end
                    return "stored-message"
                end
                local result, err = control_handlers.control_config(ctx,
                    { config_changes = { agent = "agent:writer" } })
                test.is_nil(err)
                test.is_true(result.completed)
            end
        end)

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
            test.is_nil((ctx.turn_state :: any).failed)
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

    describe("artifact update: meta_patch survival and event publish (real writer + DB)", function()
        local test_data = {
            user_id = uuid.v7(),
            context_id = uuid.v7(),
            session_id = uuid.v7(),
        }

        before_all(function()
            wait_for_boot.run()

            local actor = security.actor()
            if actor then
                test_data.user_id = actor:id()
            end

            local _, context_err = context_repo.create(test_data.context_id, "primary", "Control handler context")
            test.is_nil(context_err)

            local _, session_err = session_repo.create(
                test_data.session_id, test_data.user_id, test_data.context_id, "Control handler session", "test"
            )
            test.is_nil(session_err)
        end)

        after_all(function()
            session_repo.delete(test_data.session_id)
            context_repo.delete(test_data.context_id)
        end)

        after_each(function()
            restore_mock("process.registry")
            restore_mock("process.send")
        end)

        local function real_ctx()
            local session_writer, writer_err = writer.new(test_data.session_id)
            test.is_nil(writer_err)
            return { writer = session_writer, upstream = { update_session = function() end } }
        end

        it("edits the given artifact in place and publishes its new version", function()
            local artifact_id, create_id_err = uuid.v7()
            test.is_nil(create_id_err)

            local ctx = real_ctx()
            local created_id, create_err = ctx.writer:create_artifact(artifact_id, consts.ARTIFACT_TYPES.VIEW_REF,
                "Form", "{}", {
                    page_id = "page-form-1",
                    display_type = consts.ARTIFACT_DISPLAY.STANDALONE,
                    preview = "fill out this form",
                    status = consts.ARTIFACT_STATUS.IDLE,
                })
            test.is_nil(create_err)
            test.eq(created_id, artifact_id)

            local published = nil
            mock("process.registry", {
                lookup = function(name)
                    if name == "user." .. test_data.user_id then
                        return "hub-pid"
                    end
                    return nil
                end
            })
            mock("process.send", function(pid, topic, payload)
                published = { pid = pid, topic = topic, payload = payload }
            end)

            local result, err = control_handlers.control_artifacts(ctx, {
                artifacts = {{ id = artifact_id, title = "Revised form", content = '{"revised":true}',
                    status = consts.ARTIFACT_STATUS.ACTIVE }}
            })
            test.is_nil(err)
            test.not_nil(result)

            local artifact, get_err = artifact_repo.get(artifact_id)
            test.is_nil(get_err)
            test.eq(#result.created_artifacts, 0)
            test.eq(artifact.title, "Revised form")
            test.eq(artifact.content, '{"revised":true}')
            test.eq(artifact.content_version, 2)
            test.eq(artifact.meta.status, consts.ARTIFACT_STATUS.ACTIVE)
            test.eq(artifact.meta.page_id, "page-form-1")
            test.eq(artifact.meta.display_type, consts.ARTIFACT_DISPLAY.STANDALONE)
            test.eq(artifact.meta.preview, "fill out this form")

            test.not_nil(published)
            assert(published)
            test.eq(published.pid, "hub-pid")
            test.eq(published.topic, "artifact:" .. artifact_id)
            test.eq(published.payload.uuid, artifact_id)
            test.eq(published.payload.session_id, test_data.session_id)
            test.eq(published.payload.preview, "fill out this form")
            test.eq(published.payload.content_version, artifact.content_version)
            test.eq(type(published.payload.content_version), "number")
        end)

        it("checks every edit target before creating artifacts in the batch", function()
            local ctx = real_ctx()
            ctx.upstream.send_message_update = function() end
            local before_count = assert(artifact_repo.count_by_session(test_data.session_id))
            local result, err = control_handlers.control_artifacts(ctx, {
                artifacts = {
                    { title = "New artifact", content = "text", instructions = false },
                    { id = uuid.v7(), title = "Missing artifact", content = "updated" },
                },
            })

            test.is_nil(result)
            test.contains(tostring(err), "Artifact not found")
            local after_count = assert(artifact_repo.count_by_session(test_data.session_id))
            test.eq(after_count - before_count, 0)
        end)

        it("does not publish when the artifact update fails", function()
            local send_calls = 0
            mock("process.registry", { lookup = function() return "hub-pid" end })
            mock("process.send", function() send_calls = send_calls + 1 end)

            local ctx = real_ctx()
            local id = uuid.v7()
            test.eq(ctx.writer:create_artifact(id, consts.ARTIFACT_TYPES.INLINE, "Original", "text"), id)
            ctx.writer.update_artifact = function() return nil, "disk unavailable" end
            local result, err = control_handlers.control_artifacts(ctx, {
                artifacts = {{ id = id, status = "active" }}
            })

            test.is_nil(result)
            test.contains(tostring(err), "disk unavailable")
            test.eq(send_calls, 0)
        end)
    end)

    -- EE2-2712: a package runs with the user's token or in the Host realm,
    -- so it cannot be isolated. A protected session refuses it before
    -- anything is written; an unprotected session stores it as before.
    describe("packaged content and tool approval (real writer + DB)", function()
        local session_id = uuid.v7()
        local context_id = uuid.v7()

        before_all(function()
            wait_for_boot.run()
            local actor = security.actor()
            local user_id = actor and actor:id() or uuid.v7()
            local _, context_err = context_repo.create(context_id, "primary", "Packaged content context")
            test.is_nil(context_err)
            local _, session_err = session_repo.create(session_id, user_id, context_id, "Packaged content", "test")
            test.is_nil(session_err)
        end)

        after_all(function()
            session_repo.delete(session_id)
            context_repo.delete(context_id)
        end)

        local function new_ctx(protected: boolean): any
            local session_writer, writer_err = writer.new(session_id)
            test.is_nil(writer_err)
            return {
                writer = session_writer,
                config = protected and { tool_approval = PROTECTED_ACTIVATION } or {},
                upstream = { update_session = function() end, send_message_update = function() end },
            }
        end

        local function stored_count(): number
            return assert(artifact_repo.count_by_session(session_id))
        end

        local function json_artifact(content: string, content_type: string?): any
            return { title = "Report", content = content, content_type = content_type or consts.CONTENT_TYPES.JSON,
                instructions = false }
        end

        local function rejected_text(result: any): string
            return tostring(type(result) == "table" and result.rejected or nil)
        end

        it("refuses each content that cannot run isolated, whatever its content type, and writes nothing", function()
            for _, case in ipairs(NOT_ISOLATABLE) do
                local ctx = new_ctx(true)
                local before = stored_count()
                local result, err = control_handlers.control_artifacts(ctx, { artifacts = {
                    json_artifact(case.content, case.content_type),
                } })
                test.is_nil(err, case.name)
                local text = rejected_text(result)
                test.contains(text, "isolation_required: ", case.name)
                test.contains(text, "requires tool approval", case.name)
                test.contains(text, "HTML or markdown", case.name)
                test.eq(stored_count(), before, case.name .. ": no artifact row")

                -- The second item of a batch whose first item is fine.
                local batch, batch_err = control_handlers.control_artifacts(ctx, { artifacts = {
                    { title = "Notes", content = "<p>Notes</p>", content_type = consts.CONTENT_TYPES.HTML,
                        instructions = false },
                    json_artifact(case.content, case.content_type),
                } })
                test.is_nil(batch_err, case.name)
                test.contains(rejected_text(batch), "isolation_required: ", case.name)
                test.eq(stored_count(), before, case.name .. ": the first item of the batch is not created")
            end
        end)

        it("refuses an update that makes the stored artifact a package and leaves it unchanged", function()
            local ctx = new_ctx(true)
            local cases = {
                -- New content type and new content.
                { name = "plain JSON into a package", stored_type = consts.CONTENT_TYPES.TEXT,
                    stored = PLAIN_JSON, update = { content_type = consts.CONTENT_TYPES.JSON, content = WEB_PAGE } },
                -- The stored content type, new content.
                { name = "new content only", stored_type = consts.CONTENT_TYPES.JSON,
                    stored = PLAIN_JSON, update = { content = ES_MODULE } },
                -- The stored package, a title change only.
                { name = "stored package", stored_type = consts.CONTENT_TYPES.JSON,
                    stored = IFRAME_TAG, update = { title = "Renamed" } },
            }
            for _, case in ipairs(cases) do
                local id = uuid.v7()
                test.eq(ctx.writer:create_artifact(id, consts.ARTIFACT_TYPES.INLINE, "Data", case.stored,
                    { content_type = case.stored_type }), id, case.name)
                local update: any = { id = id }
                for key, value in pairs(case.update) do update[key] = value end
                local result, err = control_handlers.control_artifacts(ctx, { artifacts = { update } })
                test.is_nil(err, case.name)
                test.contains(rejected_text(result), "isolation_required: ", case.name)
                local artifact: any = assert(artifact_repo.get(id))
                test.eq(artifact.title, "Data", case.name)
                test.eq(artifact.content, case.stored, case.name)
                test.eq(artifact.meta.content_type, case.stored_type, case.name)
                test.eq(artifact.content_version, 1, case.name)
            end
        end)

        it("checks two updates of one artifact in a batch as the artifact they leave, in either order", function()
            local ctx = new_ctx(true)
            for _, order in ipairs({ "content type first", "content first" }) do
                local id = uuid.v7()
                test.eq(ctx.writer:create_artifact(id, consts.ARTIFACT_TYPES.INLINE, "Data", "x",
                    { content_type = consts.CONTENT_TYPES.TEXT }), id, order)
                local set_type = { id = id, content_type = consts.CONTENT_TYPES.JSON }
                local set_content = { id = id, content = WEB_PAGE }
                local items = order == "content first" and { set_content, set_type } or { set_type, set_content }
                local result, err = control_handlers.control_artifacts(ctx, { artifacts = items })
                test.is_nil(err, order)
                test.contains(rejected_text(result), "isolation_required: ", order)
                local artifact: any = assert(artifact_repo.get(id))
                test.eq(artifact.content, "x", order)
                test.eq(artifact.meta.content_type, consts.CONTENT_TYPES.TEXT, order)
                test.eq(artifact.content_version, 1, order)
            end

            -- A stored package that an earlier item replaces with HTML: a
            -- later item that changes only the title leaves HTML behind.
            local id = uuid.v7()
            test.eq(ctx.writer:create_artifact(id, consts.ARTIFACT_TYPES.INLINE, "Data", IFRAME_TAG,
                { content_type = consts.CONTENT_TYPES.JSON }), id)
            local result, err = control_handlers.control_artifacts(ctx, { artifacts = {
                { id = id, content = "<p>Report</p>", content_type = consts.CONTENT_TYPES.HTML },
                { id = id, title = "Report" },
            } })
            test.is_nil(err)
            test.is_nil(result.rejected)
            local artifact: any = assert(artifact_repo.get(id))
            test.eq(artifact.content, "<p>Report</p>")
            test.eq(artifact.title, "Report")
        end)

        it("stores a Session form tag without event props, HTML, markdown, a view_ref and a JSON string", function()
            local ctx = new_ctx(true)
            local before = stored_count()
            local result, err = control_handlers.control_artifacts(ctx, { artifacts = {
                json_artifact(SAFE_FORM),
                { title = "Page", content = "<p>Hello</p>", content_type = consts.CONTENT_TYPES.HTML },
                { title = "Notes", content = "# Notes", content_type = consts.CONTENT_TYPES.MARKDOWN },
                -- The Host renders a view_ref isolated; its params are not a package.
                { title = "App page", type = consts.ARTIFACT_TYPES.VIEW_REF, page_id = "app:report_page",
                    content_type = consts.CONTENT_TYPES.JSON, params = { specification = "wippy-component-1.0" },
                    instructions = false },
                -- A JSON string renders as text.
                json_artifact('"hello"'),
            } })
            test.is_nil(err)
            test.is_nil(result.rejected)
            test.eq(#result.created_artifacts, 5)
            test.eq(stored_count() - before, 5)

            -- An update of a stored Session form tag without event props.
            local form_id = result.created_artifacts[1].artifact_id
            local updated, update_err = control_handlers.control_artifacts(ctx, { artifacts = {
                { id = form_id, title = "Form, revised" },
            } })
            test.is_nil(update_err)
            test.is_nil(updated.rejected)
            local revised: any = assert(artifact_repo.get(form_id))
            test.eq(revised.title, "Form, revised")
        end)

        it("stores every package as before when the session is not protected", function()
            local ctx = new_ctx(false)
            for _, case in ipairs(NOT_ISOLATABLE) do
                local before = stored_count()
                local result, err = control_handlers.control_artifacts(ctx, { artifacts = {
                    json_artifact(case.content, case.content_type),
                } })
                test.is_nil(err, case.name)
                test.is_nil(result.rejected, case.name)
                test.eq(#result.created_artifacts, 1, case.name)
                test.eq(stored_count() - before, 1, case.name)
                local artifact: any = assert(artifact_repo.get(result.created_artifacts[1].artifact_id))
                test.eq(artifact.content, case.content, case.name)
            end
        end)
    end)

    describe("isolation_required as the model sees it", function()
        after_all(function()
            fx.cleanup()
        end)

        -- One round of the plain test tool (no approval needed) whose result
        -- asks for a web-page package artifact.
        local function package_round(ctx: any): (any, any, any)
            local caller = fx.fake_caller()
            function caller:execute(_context, tools)
                self.runs = self.runs + 1
                local results = {}
                for call_id, tool in pairs(tools or {}) do
                    self.launches[call_id] = true
                    results[call_id] = { tool_call = tool, result = { ok = true, _control = { artifacts = {
                        { title = "Report", content = WEB_PAGE, content_type = consts.CONTENT_TYPES.JSON,
                            instructions = false },
                    } } } }
                end
                return results
            end
            local op = fx.round(ctx, { { id = "call-1", registry_id = fx.PLAIN, name = "lookup_customer", args = {} } },
                caller)
            local result, err = message_handlers.process_tools(ctx, op)
            return result, err, fx.row(op.call_message_ids["call-1"])
        end

        it("turns the refusal into a tool error of that call, and the turn goes on", function()
            wait_for_boot.run()
            local ctx, captured = fx.new_ctx({ live = 1 })
            local result, err, call_row = package_round(ctx)
            test.is_nil(err)
            test.eq(call_row.metadata.status, consts.FUNC_STATUS.ERROR)
            test.contains(tostring(call_row.metadata.result), "isolation_required: ")
            local errors = fx.updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_ERROR)
            test.eq(#errors, 1, "the call is announced as failed")
            test.contains(tostring(errors[1].payload.error), "isolation_required: ")
            test.is_true(fx.has_continue(result), "the agent gets a step to answer in another form")
            test.eq(assert(artifact_repo.count_by_session(ctx.session_id)), 0)

            -- Positive control: the same round in an unprotected session.
            local open_ctx = fx.new_ctx({ protected = false })
            local open_result, open_err, open_row = package_round(open_ctx)
            test.is_nil(open_err)
            test.eq(open_row.metadata.status, consts.FUNC_STATUS.SUCCESS)
            test.is_true(fx.has_continue(open_result))
            test.eq(assert(artifact_repo.count_by_session(open_ctx.session_id)), 1)
        end)
    end)
end

return test.run_cases(define_tests)
