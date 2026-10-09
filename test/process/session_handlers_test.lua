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
    end)
end

return test.run_cases(define_tests)
