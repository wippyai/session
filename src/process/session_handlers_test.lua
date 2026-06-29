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

local function mock_checkpoint_ctx(config)
    local captured = {
        message_meta = nil :: table?,
        session_meta = nil :: table?,
        context_key = nil :: string?,
        context_value = nil :: string?,
        summary = nil :: string?,
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
                    prompt_tokens = 200
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
    end)
end

return test.run_cases(define_tests)
