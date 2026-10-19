local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local consts = require("consts")
local session_handlers = require("session_handlers")
local command_bus = require("command_bus")
local session = require("session")
local reader = require("reader")
local writer = require("writer")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local message_repo = require("message_repo")
local wait_for_boot = require("wait_for_boot")

local function mock_ctx(state_config)
    local captured = {
        persisted = nil :: table?,
        upstream = nil :: table?,
        system_messages = 0,
        developer_messages = 0,
        switched_agent = nil :: string?,
        switched_model = nil :: string?,
        resets = 0,
        persisted_update = nil :: table?,
        session_errors = 0,
    }

    local ctx = {
        config = nil,
        reader = {
            state = function()
                return { config = state_config or {} }
            end,
            reset = function()
                captured.resets = captured.resets + 1
                return true
            end,
        },
        writer = {
            update_meta = function(self, meta)
                captured.persisted_update = meta
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
            session_error = function() captured.session_errors = captured.session_errors + 1 end,
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
            get_current_agent = function()
                return { id = captured.switched_agent, model = "model:new",
                    agent_options = { session_input = { while_running = "steer" } } }
            end,
        },
    }

    return ctx, captured
end

local function mock_checkpoint_ctx(config)
    local captured = {
        message_meta = nil :: table?,
        session_meta = nil :: table?,
        context_key = nil :: string?,
        context_value = nil :: string?,
        summary = nil :: string?,
        resets = 0,
    }

    local ctx = {
        session_id = "sess-1",
        config = config or {},
        reader = {
            state = function()
                return {
                    title = "",
                    meta = {}
                }
            end,
            get_full_context = function()
                return {
                    session_id = "sess-1"
                }
            end,
            get_context = function()
                return nil
            end,
            messages = function()
                return {
                    count = function()
                        return 0
                    end
                }
            end,
            reset = function()
                captured.resets = captured.resets + 1
                return true
            end,
        },
        writer = {
            update_message_meta = function(_, _message_id, meta)
                captured.message_meta = meta
                return true
            end,
            update_meta = function(_, payload)
                captured.session_meta = payload.meta
                return true
            end,
            set_context = function(_, key, value)
                captured.context_key = key
                captured.context_value = value
                return true
            end,
            delete_session_contexts_by_type = function()
                return true
            end,
            add_session_context = function(_, _context_type, summary)
                captured.summary = summary
                return "summary-id"
            end,
        },
        upstream = {
            update_session = function() end,
        }
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

        for _, change in ipairs({
            { name = "agent_change", op = { agent_id = "agent:new", init = true } },
            { name = "model_change", op = { model = "model:next" } },
        }) do
            it(change.name .. " returns a failed reader refresh after the durable config write", function()
                local ctx, captured = mock_ctx({ agent_id = "agent:old", model = "model:old" })
                ctx.reader.reset = function() return nil, "Session not found during reset" end

                local result, err = session_handlers[change.name](ctx, change.op)

                test.is_nil(result)
                test.contains(tostring(err), "Session not found during reset")
                test.not_nil(captured.persisted)
                test.not_nil(captured.upstream)
            end)
        end
        it("preserves the switched agent through a model change and a fresh reader", function()
            local function copy_config(config)
                local copy = {}
                for key, value in pairs(config) do copy[key] = value end
                return copy
            end

            local persisted = {
                agent_id = "agent:a",
                model = "model:a",
                title_function_id = "keep:title",
            }
            local cached = copy_config(persisted)
            local ctx, captured = mock_ctx(cached)
            ctx.config = copy_config(persisted)
            ctx.reader.state = function()
                return { config = cached }
            end
            ctx.reader.reset = function()
                cached = copy_config(persisted)
                captured.resets = captured.resets + 1
                return true
            end
            ctx.writer.update_meta = function(_, meta)
                persisted = copy_config(meta.config)
                return true
            end
            ctx.agent_ctx.switch_to_model = function(self, model)
                captured.switched_model = model
                self.current_model = model
                return true
            end
            ctx.agent_ctx.get_current_agent = function()
                return { id = captured.switched_agent, model = captured.switched_model or "model:new" }
            end

            local agent_result, agent_err = session_handlers.agent_change(ctx, { agent_id = "agent:b" })
            test.is_nil(agent_err)
            test.not_nil(agent_result)
            test.eq(cached.agent_id, "agent:b")

            local model_result, model_err = session_handlers.model_change(ctx, { model = "model:a" })
            test.is_nil(model_err)
            test.not_nil(model_result)
            test.eq(ctx.config.agent_id, "agent:b")
            test.eq(ctx.config.model, "model:a")
            test.eq(persisted.agent_id, "agent:b")
            test.eq(persisted.model, "model:a")
            test.eq(persisted.title_function_id, "keep:title")
            test.eq(captured.switched_agent, "agent:b")
            test.eq(captured.switched_model, "model:a")

            local fresh_ctx = mock_ctx(copy_config(persisted))
            local restored = fresh_ctx.reader:state().config
            test.eq(restored.agent_id, "agent:b")
            test.eq(restored.model, "model:a")
            test.eq(restored.title_function_id, "keep:title")
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

        it("retains the authoritative session input policy across handoff", function()
            local ctx, captured = mock_ctx({
                agent_id = "agent:stale",
                model = "model:stale",
            })
            ctx.config = {
                agent_id = "agent:old",
                model = "model:old",
                input_policy = { while_running = "steer" },
            }
            ctx.status = "running"
            ctx.interaction = { can_send = true, revision = 0 }
            ctx.turn_state = { active = true, input_policy = { while_running = "steer" } }

            local result, err = session_handlers.agent_change(ctx, { agent_id = "agent:new" })

            test.is_nil(err)
            test.not_nil(result)
            test.eq((captured.persisted or {}).input_policy.while_running, "steer")
            test.eq(ctx.config.input_policy.while_running, "steer")
            test.eq(captured.resets, 1)
            test.is_false((captured.persisted_update or {}).meta.interaction.can_send)
            test.is_true((ctx.turn_state :: any).handoff)
            test.is_nil((ctx.turn_state :: any).input_policy)
        end)

        it("marks the session failed when config persistence and runtime rollback both fail", function()
            local ctx, captured = mock_ctx({ agent_id = "agent:old", model = "model:old" })
            ctx.config = { agent_id = "agent:old", model = "model:old" }
            local switches = 0
            ctx.agent_ctx.switch_to_agent = function(self, agent_id)
                switches = switches + 1
                captured.switched_agent = agent_id
                if switches > 1 then return false, "rollback unavailable" end
                return true
            end
            ctx.writer.update_meta = function() return nil, "disk failure" end

            local result, err = session_handlers.agent_change(ctx, { agent_id = "agent:new" })

            test.is_nil(result)
            test.contains(err, "runtime rollback failed")
            test.eq((ctx :: any).status, "failed")
            test.eq(captured.session_errors, 1)
        end)

        it("fails closed when a first agent cannot be rolled back after a write failure", function()
            local ctx, captured = mock_ctx({})
            ctx.config = {}
            ctx.writer.update_meta = function() return nil, "disk failure" end

            local result, err = session_handlers.agent_change(ctx, { agent_id = "agent:new" })

            test.is_nil(result)
            test.contains(err, "no previous agent")
            test.eq((ctx :: any).status, "failed")
            test.eq(captured.session_errors, 1)
        end)

        it("restores the prior agent and leaves turn state unchanged after persistence failure", function()
            local ctx, captured = mock_ctx({ agent_id = "agent:old", model = "model:old" })
            ctx.config = { agent_id = "agent:old", model = "model:old" }
            ctx.turn_state = { active = true, input_policy = { while_running = "steer" } }
            ctx.writer.update_meta = function() return nil, "disk failure" end

            local result, err = session_handlers.agent_change(ctx, { agent_id = "agent:new" })

            test.is_nil(result)
            test.contains(err, "disk failure")
            test.eq(captured.switched_agent, "agent:old")
            test.eq(ctx.config.agent_id, "agent:old")
            test.is_nil((ctx.turn_state :: any).handoff)
            test.eq(ctx.turn_state.input_policy.while_running, "steer")
            test.eq(captured.resets, 0)
        end)
    end)

    describe("agent then model on the stored session", function()
        -- The Host sends an agent choice and then a model choice as two
        -- commands. The model change must keep the chosen agent: before
        -- 0.6.3 it wrote back a config read before the agent change was
        -- stored, so the session silently returned to the old agent.
        local user_id = ""
        local created = {} :: {any}

        before_all(function()
            wait_for_boot.run()
            local actor = security.actor()
            user_id = actor and actor:id() or ""
        end)

        after_all(function()
            local db, err = sql.get(consts.get_db_resource())
            if err then error(err) end
            for _, item in ipairs(created) do
                db:execute("DELETE FROM messages WHERE session_id = $1", { item.session_id })
                db:execute("DELETE FROM sessions WHERE session_id = $1", { item.session_id })
                db:execute("DELETE FROM contexts WHERE context_id = $1", { item.context_id })
            end
            db:release()
        end)

        it("keeps the chosen agent when a model is chosen next", function()
            local session_id, context_id = uuid.v7(), uuid.v7()
            test.is_nil(select(2, context_repo.create(context_id, "primary", "{}")))
            test.is_nil(select(2, session_repo.create(session_id, user_id, context_id, "Agents", "test", {},
                { agent_id = "agent:first", model = "model:first" })))
            table.insert(created, { session_id = session_id, context_id = context_id })
            local session_reader: any = reader.open(session_id)
            local session_writer: any = writer.new(session_id)
            local current = { id = "agent:first", model = "model:first" }
            local updates = {} :: {any}
            -- As session.lua sets it up: the live config starts as the stored one.
            local ctx: any = {
                session_id = session_id, user_id = user_id, reader = session_reader, writer = session_writer,
                config = session_reader:state().config, status = consts.STATUS.IDLE, held = {},
                upstream = {
                    update_session = function(_self, changes) table.insert(updates, changes) end,
                    command_error = function() end, session_error = function() end,
                },
                agent_ctx = {
                    current_model = "model:first",
                    switch_to_agent = function(self, agent_id)
                        self.current_model = "model:second-default"
                        current = { id = agent_id, model = self.current_model }
                        return true
                    end,
                    switch_to_model = function(self, model)
                        self.current_model = model
                        current = { id = current.id, model = model }
                        return true
                    end,
                    get_current_agent = function() return current end,
                },
            }
            local bus: any = command_bus.new(ctx)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CHANGE, session_handlers.agent_change)
            bus:mount_op_handler(consts.OP_TYPE.MODEL_CHANGE, session_handlers.model_change)

            local function command(name, value)
                local ok, err = session.route_input(ctx, bus, consts.TOPICS.COMMAND,
                    { command = name, name = value, request_id = name .. "-request" }, { finishing = false })
                test.is_nil(err)
                test.is_true(ok)
                while #bus.ops > 0 do
                    local op: any = table.remove(bus.ops :: {any}, 1)
                    bus.pending_ops = bus.pending_ops - 1
                    local result: any, op_err = bus:process_operation(op)
                    test.is_nil(op_err)
                    test.is_nil(result.error_message)
                end
            end
            command(consts.COMMANDS.AGENT, "agent:second")
            command(consts.COMMANDS.MODEL, "model:chosen")

            local stored: any = session_repo.get(session_id, user_id)
            test.eq(stored.config.agent_id, "agent:second", "the chosen agent is kept")
            test.eq(stored.config.model, "model:chosen")
            test.eq(ctx.config.agent_id, "agent:second")
            test.eq(session_reader:state().config.agent_id, "agent:second")
            local notices = {}
            for _, row in ipairs(message_repo.list_by_session(session_id, 50).messages) do
                if row.type == consts.MSG_TYPE.SYSTEM then table.insert(notices, row.data) end
            end
            test.eq(#notices, 2)
            test.contains(notices[1], "Agent changed to: agent:second")
            test.contains(notices[2], "Model changed to: model:chosen")
            local last_agent = nil
            for _, update in ipairs(updates) do
                if update.agent then last_agent = update.agent end
            end
            test.eq(last_agent, "agent:second", "no update names the old agent again")
        end)
    end)

    describe("title generation beside the turn", function()
        local original_funcs = nil

        before_each(function() original_funcs = session_handlers._funcs end)
        after_each(function() session_handlers._funcs = original_funcs end)

        -- A session with no title yet whose next title call returns `title`
        -- (or fails with `title_err`). `calls` counts title function calls.
        local function title_ctx(title: string?, title_err: string?)
            local captured = { calls = 0, stored = nil :: string?, announced = nil :: string?, resets = 0 }
            session_handlers._funcs = { new = function()
                return {
                    with_context = function(self) return self end,
                    call = function()
                        captured.calls = captured.calls + 1
                        if title_err then return nil, title_err end
                        return { title = title }
                    end,
                }
            end }
            local queued = {} :: {any}
            local ctx: any = {
                session_id = "sess-title",
                config = { title_function_id = "app:title" },
                run_in_background = function(work) table.insert(queued, work) end,
                reader = {
                    state = function() return { title = captured.stored or "", meta = {} } end,
                    messages = function() return { count = function() return 4 end } end,
                    get_context = function() return nil end,
                    get_full_context = function() return {} end,
                    reset = function() captured.resets = captured.resets + 1; return true end,
                },
                writer = {
                    update_title = function(_self, value) captured.stored = value; return true end,
                },
                upstream = {
                    update_session = function(_self, changes) captured.announced = changes.title end,
                },
            }
            return ctx, captured, queued
        end

        local function title_ops(result: any): number
            local count = 0
            for _, op in ipairs((result and result.next_ops) or {}) do
                if op.type == "generate_title" then count = count + 1 end
            end
            return count
        end

        it("returns at once and generates the title in the background", function()
            local ctx, captured, queued = title_ctx("Parcel delivery")

            local result, err = session_handlers.generate_title(ctx, { session_id = "sess-title" })

            test.is_nil(err)
            test.is_true(result.completed)
            test.eq(captured.calls, 0, "the operation does not wait for the model call")
            test.eq(#queued, 1)
            queued[1]()
            test.eq(captured.calls, 1)
            test.eq(captured.stored, "Parcel delivery")
            test.eq(captured.announced, "Parcel delivery")
            test.gte(captured.resets, 1)
        end)

        it("does not ask for a second title while one is being generated", function()
            local ctx, _, queued = title_ctx("Parcel delivery")
            local trigger = { tokens = { prompt_tokens = 10 }, message_id = "msg-1" }
            test.eq(title_ops(session_handlers.check_background_triggers(ctx, trigger)), 1)

            session_handlers.generate_title(ctx, { session_id = "sess-title" })
            test.eq(title_ops(session_handlers.check_background_triggers(ctx, trigger)), 0,
                "the next step of the turn does not start another title")

            queued[1]()
            test.eq(title_ops(session_handlers.check_background_triggers(ctx, trigger)), 0,
                "the session has its title now")
        end)

        it("lets a later step try again after a failed title", function()
            local ctx, captured, queued = title_ctx(nil, "model unavailable")
            local trigger = { tokens = { prompt_tokens = 10 }, message_id = "msg-1" }
            session_handlers.generate_title(ctx, { session_id = "sess-title" })
            queued[1]()
            test.eq(captured.calls, 1)
            test.is_nil(captured.stored)
            test.eq(title_ops(session_handlers.check_background_triggers(ctx, trigger)), 1)
        end)

        it("generates the title in place when the host runs no background work", function()
            local ctx, captured = title_ctx("Parcel delivery")
            ctx.run_in_background = nil

            local result, err = session_handlers.generate_title(ctx, { session_id = "sess-title" })

            test.is_nil(err)
            test.eq((result :: any).title, "Parcel delivery")
            test.eq(captured.calls, 1)
            test.eq(captured.stored, "Parcel delivery")
        end)
    end)

    describe("session checkpoint dispatch", function()
        before_each(function()
            session_handlers._checkpoint_runtime = nil
            session_handlers._funcs = nil
        end)

        after_each(function()
            session_handlers._checkpoint_runtime = nil
            session_handlers._funcs = nil
        end)

        it("triggers a checkpoint when a trait binding exists without a function id", function()
            local ctx = {
                config = {
                    token_checkpoint_threshold = 100,
                    checkpoint_function_id = nil,
                    title_function_id = nil,
                },
                reader = {
                    state = function()
                        return {
                            title = "",
                            meta = {}
                        }
                    end,
                    messages = function()
                        return {
                            count = function()
                                return 0
                            end
                        }
                    end,
                    get_context = function()
                        return nil
                    end,
                }
            }

            local result, err = session_handlers.check_background_triggers(ctx, {
                tokens = {
                    prompt_tokens = 200,
                    context_tokens = 200
                },
                message_id = "msg-1",
                checkpoint_bindings = {
                    {
                        id = "memory_checkpoint",
                        binding = "test.memory:checkpoint"
                    }
                },
                agent = {
                    id = "agent-1",
                    model = "model-1"
                },
                run_context_binding = "test.session:run_context"
            })

            test.is_nil(err)
            test.is_true(result.checkpoint_triggered)
            test.eq(#result.next_ops, 1)
            test.eq(result.next_ops[1].type, "create_checkpoint")
            test.eq(result.next_ops[1].checkpoint_bindings[1].binding, "test.memory:checkpoint")
            test.is_nil(result.next_ops[1].checkpoint_function_id)
        end)

        it("creates a checkpoint through a trait binding before using the function fallback", function()
            local ctx, captured = mock_checkpoint_ctx({
                checkpoint_function_id = "fallback:checkpoint",
                title_function_id = nil,
                run_context_binding = "test.session:run_context",
            })

            local func_calls = 0
            session_handlers._funcs = {
                new = function()
                    return {
                        with_context = function(self)
                            return self
                        end,
                        call = function()
                            func_calls = func_calls + 1
                            return {
                                summary = "fallback summary"
                            }
                        end
                    }
                end
            }
            session_handlers._checkpoint_runtime = {
                create = function(bindings, payload)
                    test.eq(bindings.checkpoint[1].binding, "test.memory:checkpoint")
                    test.eq(payload.host.kind, "session")
                    test.eq(payload.run_context.binding, "test.session:run_context")
                    return {
                        applied = 1,
                        result = {
                            memory = "trait memory",
                            tokens = {
                                prompt_tokens = 10
                            }
                        }
                    }
                end
            }

            local result, err = session_handlers.create_checkpoint(ctx, {
                checkpoint_id = "msg-1",
                message_id = "msg-1",
                trigger_tokens = 200,
                checkpoint_bindings = {
                    {
                        id = "memory_checkpoint",
                        binding = "test.memory:checkpoint"
                    }
                },
                agent = {
                    id = "agent-1",
                    model = "model-1"
                }
            })

            test.is_nil(err)
            test.not_nil(result)
            test.eq(func_calls, 0)
            test.eq(captured.summary, "trait memory")
            test.eq((captured.message_meta or {}).checkpoint_source, "binding")
            test.eq((captured.message_meta or {}).checkpoint_summary, "trait memory")
            test.eq(result.tokens.prompt_tokens, 10)
        end)

        it("keeps the global checkpoint function fallback when no binding is configured", function()
            local ctx, captured = mock_checkpoint_ctx({
                checkpoint_function_id = "fallback:checkpoint",
                title_function_id = nil,
            })

            local called = nil
            session_handlers._funcs = {
                new = function()
                    return {
                        with_context = function(self, context)
                            test.eq(context.session_id, "sess-1")
                            return self
                        end,
                        call = function(_, function_id, args)
                            called = {
                                function_id = function_id,
                                args = args
                            }
                            return {
                                summary = "fallback summary",
                                tokens = {
                                    prompt_tokens = 12
                                }
                            }
                        end
                    }
                end
            }

            local result, err = session_handlers.create_checkpoint(ctx, {
                checkpoint_id = "msg-1",
                message_id = "msg-1",
                trigger_tokens = 200,
            })

            test.is_nil(err)
            test.not_nil(result)
            test.eq((called or {}).function_id, "fallback:checkpoint")
            test.eq(((called or {}).args or {}).session_id, "sess-1")
            test.eq(captured.summary, "fallback summary")
            test.eq((captured.message_meta or {}).checkpoint_source, "function")
            test.eq(result.tokens.prompt_tokens, 12)
        end)

        it("anchors the checkpoint on checkpoint_anchor_id when the step provides one", function()
            local ctx = {
                config = {
                    token_checkpoint_threshold = 100,
                    checkpoint_function_id = "fallback:checkpoint",
                    title_function_id = nil,
                },
                reader = {
                    state = function() return { title = "", meta = {} } end,
                    messages = function() return { count = function() return 0 end } end,
                    get_context = function() return nil end,
                }
            }

            local result, err = session_handlers.check_background_triggers(ctx, {
                tokens = { prompt_tokens = 200, context_tokens = 200 },
                message_id = "msg-user",
                checkpoint_anchor_id = "msg-assistant-7",
            })

            test.is_nil(err)
            test.is_true(result.checkpoint_triggered)
            test.eq(result.next_ops[1].type, "create_checkpoint")
            test.eq(result.next_ops[1].checkpoint_id, "msg-assistant-7")
            test.eq(result.next_ops[1].message_id, "msg-assistant-7", "the summary is stored on the anchor row")

            -- Callers that pass only message_id keep anchoring on it.
            local legacy, legacy_err = session_handlers.check_background_triggers(ctx, {
                tokens = { prompt_tokens = 200, context_tokens = 200 },
                message_id = "msg-user",
            })
            test.is_nil(legacy_err)
            test.eq(legacy.next_ops[1].checkpoint_id, "msg-user")
            test.eq(legacy.next_ops[1].message_id, "msg-user")
        end)

        it("triggers on the full context size, not the uncached prompt_tokens alone", function()
            local ctx = {
                config = {
                    token_checkpoint_threshold = 100000,
                    checkpoint_function_id = "fallback:checkpoint",
                    title_function_id = nil,
                },
                reader = {
                    state = function() return { title = "", meta = {} } end,
                    messages = function() return { count = function() return 0 end } end,
                    get_context = function() return nil end,
                }
            }

            -- Claude-style report: caching means prompt_tokens is only the handful of
            -- uncached tokens, while context_tokens carries the real, full prompt size.
            local result, err = session_handlers.check_background_triggers(ctx, {
                tokens = {
                    prompt_tokens = 20,
                    cache_read_tokens = 150000,
                    cache_write_tokens = 20,
                    context_tokens = 150040,
                },
                message_id = "msg-1",
            })

            test.is_nil(err)
            test.is_true(result.checkpoint_triggered)
            test.eq(result.next_ops[1].type, "create_checkpoint")
            test.eq(result.next_ops[1].trigger_tokens, 150040)
        end)

        it("uses normalized context size across cache reports and preserves the threshold boundary", function()
            local reports = {
                { tokens = { prompt_tokens = 150001, context_tokens = 150001 }, expected = 150001 },
                { tokens = { prompt_tokens = 0, cache_write_tokens = 150001,
                    context_tokens = 150001 }, expected = 150001 },
                { tokens = { prompt_tokens = 0, cache_read_tokens = 150001,
                    context_tokens = 150001 }, expected = 150001 },
                -- The LLM adapter already separates cached input from an inclusive provider count.
                { tokens = { prompt_tokens = 10000, cache_read_tokens = 80000,
                    context_tokens = 90000 } },
                { tokens = { prompt_tokens = 20, cache_read_tokens = 99980,
                    context_tokens = 100000 } },
                { tokens = { prompt_tokens = 20, context_tokens = 0 } },
            }
            for _, report in ipairs(reports) do
                local ctx = mock_checkpoint_ctx({ token_checkpoint_threshold = 100000,
                    checkpoint_function_id = "fallback:checkpoint" })
                local result, err = session_handlers.check_background_triggers(ctx, {
                    tokens = report.tokens, message_id = "msg-user",
                })
                test.is_nil(err)
                test.eq(result.checkpoint_triggered == true, report.expected ~= nil)
                if report.expected then
                    test.eq(result.next_ops[1].trigger_tokens, report.expected)
                else
                    test.is_true(result.skipped)
                end
            end
        end)

        it("does not trigger when the full context size is below the threshold", function()
            local ctx = {
                config = {
                    token_checkpoint_threshold = 100000,
                    checkpoint_function_id = "fallback:checkpoint",
                    title_function_id = nil,
                },
                reader = {
                    state = function() return { title = "", meta = {} } end,
                    messages = function() return { count = function() return 0 end } end,
                    get_context = function() return nil end,
                }
            }

            local result, err = session_handlers.check_background_triggers(ctx, {
                tokens = {
                    prompt_tokens = 20,
                    cache_read_tokens = 500,
                    context_tokens = 520,
                },
                message_id = "msg-1",
            })

            test.is_nil(err)
            test.is_true(result.skipped)
        end)

        it("refreshes the reader once the new anchor is recorded, so the next prompt starts from it", function()
            local ctx, captured = mock_checkpoint_ctx({
                checkpoint_function_id = "fallback:checkpoint",
                title_function_id = nil,
            })

            session_handlers._funcs = {
                new = function()
                    return {
                        with_context = function(self, _context) return self end,
                        call = function(_, _function_id, _args)
                            return { summary = "summary", tokens = { prompt_tokens = 1 } }
                        end
                    }
                end
            }

            local result, err = session_handlers.create_checkpoint(ctx, {
                checkpoint_id = "msg-assistant-7",
                message_id = "msg-assistant-7",
                trigger_tokens = 200,
            })

            test.is_nil(err)
            test.not_nil(result)
            test.eq(captured.context_key, "current_checkpoint_id")
            test.eq(captured.context_value, "msg-assistant-7")
            test.gte(captured.resets, 1,
                "the reader caches the primary context; without a reset the next prompt is built from the old anchor")
        end)

        it("returns a failed reader refresh after storing a generated title", function()
            local ctx = mock_checkpoint_ctx({ title_function_id = "app:title" })
            local stored, announced
            ctx.writer.update_title = function(_self, title) stored = title; return true end
            ctx.upstream = { update_session = function(_self, payload) announced = payload.title end }
            ctx.reader.reset = function() return nil, "Session not found during reset" end
            session_handlers._funcs = {
                new = function()
                    return {
                        with_context = function(self, _context) return self end,
                        call = function() return { title = "Stored title", tokens = {} } end
                    }
                end
            }

            local result, err = session_handlers.generate_title(ctx, {})

            test.is_nil(result)
            test.contains(tostring(err), "Session not found during reset")
            test.eq(stored, "Stored title")
            test.eq(announced, "Stored title")
        end)

        it("returns a failed reader refresh after recording the checkpoint", function()
            local ctx, captured = mock_checkpoint_ctx({
                checkpoint_function_id = "fallback:checkpoint",
                title_function_id = nil,
            })
            ctx.reader.reset = function() return nil, "Session not found during reset" end
            session_handlers._funcs = {
                new = function()
                    return {
                        with_context = function(self, _context) return self end,
                        call = function() return { summary = "summary", tokens = { prompt_tokens = 1 } } end
                    }
                end
            }

            local result, err = session_handlers.create_checkpoint(ctx, {
                checkpoint_id = "msg-assistant-8",
                message_id = "msg-assistant-8",
                trigger_tokens = 200,
            })

            test.is_nil(result)
            test.contains(tostring(err), "Session not found during reset")
            test.eq(captured.context_value, "msg-assistant-8")
        end)
    end)
end

return test.run_cases(define_tests)
