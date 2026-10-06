local funcs = require("funcs")
local consts = require("consts")
local tool_caller = require("tool_caller")
local time = require("time")
local checkpoint_runtime = require("checkpoint_runtime")
local input_policy = require("input_policy")

type BackgroundTriggerResult = {
    skipped: boolean?,
    checkpoint_triggered: boolean?,
    title_triggered: boolean?,
    next_ops: {any}?,
}

local session_handlers = {}
session_handlers._funcs = nil
session_handlers._checkpoint_runtime = nil

local RUN_CONTEXT_CONTRACT = "wippy.agent:run_context"
local DEFAULT_RUN_CONTEXT_BINDING = "wippy.session.run_context:binding"

local function clone(value)
    if type(value) ~= "table" then return value end
    local result = {}
    for key, item in pairs(value) do result[key] = clone(item) end
    return result
end

local function fail_runtime(ctx, message)
    ctx.status = consts.STATUS.FAILED
    if ctx.turn_state then
        ctx.turn_state.active = false
        ctx.turn_state.failed = true
        ctx.turn_state.input_policy = nil
    end
    if ctx.upstream and type(ctx.upstream.session_error) == "function" then
        pcall(function() ctx.upstream:session_error("SESSION_FAILED", message) end)
    end
    return nil, message
end

local function restore_agent(ctx, previous_agent, previous_model)
    if not previous_agent or previous_agent == "" then
        return nil, "there is no previous agent to restore"
    end
    local restored, restore_err = ctx.agent_ctx:switch_to_agent(previous_agent, { model = previous_model })
    if not restored then return nil, restore_err or "agent rollback failed" end
    return true
end

local function restore_model(ctx, previous_model)
    if not previous_model or not ctx.agent_ctx.switch_to_model then
        return nil, "there is no previous model to restore"
    end
    local restored, restore_err = ctx.agent_ctx:switch_to_model(previous_model)
    if not restored then return nil, restore_err or "model rollback failed" end
    return true
end

local function funcs_module(): any
    return session_handlers._funcs or funcs
end

local function checkpoint_runtime_module(): any
    return session_handlers._checkpoint_runtime or checkpoint_runtime
end

local function checkpoint_options_from_agent(op): table
    local agent_options = op and op.agent_options
    if type(agent_options) ~= "table" or type(agent_options.checkpoint) ~= "table" then
        return {}
    end

    return agent_options.checkpoint
end

local function has_checkpoint_bindings(bindings: any): boolean
    if type(bindings) ~= "table" then
        return false
    end
    if type(bindings.checkpoint) == "table" then
        bindings = bindings.checkpoint
    end
    return #bindings > 0
end

local function resolve_checkpoint_config(ctx, op): (string?, number?)
    local checkpoint_options = checkpoint_options_from_agent(op)
    local function_id = checkpoint_options.function_id or ctx.config.checkpoint_function_id
    if type(function_id) ~= "string" or function_id == "" then
        function_id = nil
    end
    local threshold = tonumber(checkpoint_options.token_threshold)

    if not threshold then
        threshold = tonumber(ctx.config.token_checkpoint_threshold)
    end

    return function_id, threshold
end

function session_handlers.execute_function(ctx, op)
    if not op.function_id then
        return nil, "Function ID is required"
    end

    local session_context, ctx_err = ctx.reader:get_full_context()
    if ctx_err then
        session_context = {}
    end

    local call_id = op.function_id
    local validated_tools = {
        [call_id] = {
            valid = true,
            name = op.function_id,
            args = op.function_params or {},
            call_id = call_id,
            registry_id = op.function_id
        }
    }

    local caller = tool_caller.new()
    local results = caller:execute(session_context, validated_tools)

    if not results or not results[call_id] then
        return nil, "No function result returned"
    end

    local result_data = results[call_id]

    if result_data.error then
        return nil, "Function execution failed: " .. tostring(result_data.error)
    end

    local tool_result = result_data.result
    local next_ops = {}
    local control_ops = {}

    if tool_result and type(tool_result) == "table" and tool_result._control then
        local control = tool_result._control

        if control.artifacts and #control.artifacts > 0 then
            table.insert(control_ops, {
                type = consts.OP_TYPE.CONTROL_ARTIFACTS,
                artifacts = control.artifacts
            })
        end

        if control.context then
            table.insert(control_ops, {
                type = consts.OP_TYPE.CONTROL_CONTEXT,
                context_operations = control.context
            })
        end

        if control.memory then
            table.insert(control_ops, {
                type = consts.OP_TYPE.CONTROL_MEMORY,
                memory_operations = control.memory
            })
        end

        if control.config then
            table.insert(control_ops, {
                type = consts.OP_TYPE.CONTROL_CONFIG,
                config_changes = control.config
            })
        end

        tool_result._control = nil
    end

    for _, control_op in ipairs(control_ops) do
        table.insert(next_ops, control_op)
    end

    return {
        completed = true,
        function_id = op.function_id,
        result = tool_result,
        next_ops = next_ops
    }
end

function session_handlers.intercept_execution(ctx, op)
    return {
        completed = true,
        intercepted = true
    }
end

function session_handlers.check_background_triggers(ctx, op)
    local next_ops = {}
    local tokens = op.tokens
    local message_id = op.message_id

    if not tokens or not message_id then
        return { skipped = true }
    end

    local anchor_id = op.checkpoint_anchor_id or message_id

    local checkpoint_needed = false
    local title_needed = false

    local session_data = ctx.reader:state()

    local checkpoint_function_id, token_threshold = resolve_checkpoint_config(ctx, op)
    local checkpoint_available = checkpoint_function_id ~= nil or has_checkpoint_bindings(op.checkpoint_bindings)
    -- context_tokens is the full prompt size (uncached input plus cache reads
    -- and writes); prompt_tokens alone counts only the uncached input.
    local context_tokens = tokens.context_tokens
    if checkpoint_available and context_tokens and token_threshold and token_threshold > 0 then

        if context_tokens > token_threshold then
            checkpoint_needed = true
            table.insert(next_ops, {
                type = consts.OP_TYPE.CREATE_CHECKPOINT,
                checkpoint_function_id = checkpoint_function_id,
                checkpoint_bindings = op.checkpoint_bindings,
                checkpoint_id = anchor_id,
                message_id = anchor_id,
                trigger_tokens = context_tokens,
                agent = op.agent,
                agent_options = op.agent_options,
                run_context_binding = op.run_context_binding
            })
        end
    end

    if ctx.config.title_function_id and not checkpoint_needed then
        local has_title = session_data.title and session_data.title ~= ""

        if not has_title then
            local total_count, err = ctx.reader:messages():count()

            if not err and total_count and total_count >= consts.INTERNAL.TITLE_TRIGGER_MESSAGE_COUNT then
                title_needed = true
                table.insert(next_ops, {
                    type = consts.OP_TYPE.GENERATE_TITLE,
                    session_id = ctx.session_id,
                    current_checkpoint_id = ctx.reader:get_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID)
                })
            end
        end
    end

    if #next_ops == 0 then
        return { skipped = true }
    end

    return {
        checkpoint_triggered = checkpoint_needed,
        title_triggered = title_needed,
        next_ops = next_ops
    }
end

function session_handlers.generate_title(ctx, op)
    if not ctx.config.title_function_id then
        return nil, "No title function ID configured"
    end

    local session_context, ctx_err = ctx.reader:get_full_context()
    if ctx_err then
        session_context = {}
    end

    local result, title_err = funcs_module().new():with_context(session_context):call(ctx.config.title_function_id :: string, {
        session_id = ctx.session_id
    })

    if title_err then
        return nil, title_err
    end

    if not result or not result.title then
        return nil, "No title returned"
    end

    local success, err = ctx.writer:update_title(result.title)
    if not success then
        return nil, err
    end

    ctx.reader:reset()

    ctx.upstream:update_session({ title = result.title })

    return {
        completed = true,
        title = result.title,
        tokens = result.tokens
    }
end

function session_handlers.create_checkpoint(ctx, op)
    local checkpoint_function_id = op.checkpoint_function_id or ctx.config.checkpoint_function_id

    if not op.checkpoint_id then
        return nil, "Checkpoint ID required"
    end

    local session_context, ctx_err = ctx.reader:get_full_context()
    if ctx_err then
        session_context = {}
    end

    local result = nil
    local checkpoint_source = "function"
    local checkpoint_binding_metadata = nil
    local checkpoint_options = checkpoint_options_from_agent(op)

    if has_checkpoint_bindings(op.checkpoint_bindings) then
        local host = {
            kind = "session",
            session_id = ctx.session_id
        }
        local agent = type(op.agent) == "table" and op.agent or {
            id = ctx.config and ctx.config.agent_id,
            model = ctx.config and ctx.config.model
        }
        local runtime_result, runtime_err = checkpoint_runtime_module().create({
            checkpoint = op.checkpoint_bindings
        }, {
            host = host,
            agent = agent,
            reason = "token_threshold_exceeded",
            selector = {
                mode = "since_checkpoint"
            },
            run_context = {
                contract = RUN_CONTEXT_CONTRACT,
                binding = op.run_context_binding or (ctx.config and ctx.config.run_context_binding) or DEFAULT_RUN_CONTEXT_BINDING,
                host = host,
                agent = agent
            },
            refs = {
                checkpoint_id = op.checkpoint_id,
                message_id = op.message_id,
                trigger_tokens = op.trigger_tokens or 0
            },
            options = checkpoint_options
        })
        if runtime_err then
            return nil, runtime_err
        end
        if runtime_result and runtime_result.result then
            result = runtime_result.result
            checkpoint_source = "binding"
            checkpoint_binding_metadata = runtime_result.metadata
        end
    end

    if not result then
        if not checkpoint_function_id then
            return nil, "No summary function ID configured"
        end

        local func_err
        result, func_err = funcs_module().new():with_context(session_context):call(checkpoint_function_id :: string, {
            session_id = ctx.session_id,
            options = checkpoint_options
        })

        if func_err then
            return nil, func_err
        end
    end

    if type(result) == "table" and (not result.summary) and type(result.memory) == "string" then
        result.summary = result.memory
    end

    if not result or not result.summary then
        return nil, "No summary returned"
    end

    local checkpoint_metadata = {
        checkpoint_summary = result.summary,
        checkpoint_reason = "token_threshold_exceeded",
        checkpoint_id = op.checkpoint_id,
        trigger_tokens = op.trigger_tokens or 0,
        checkpoint_generated_at = time.now():format(time.RFC3339),
        checkpoint_tokens = result.tokens or {},
        checkpoint_source = checkpoint_source,
        checkpoint_binding_metadata = checkpoint_binding_metadata
    }

    local success, err = ctx.writer:update_message_meta(op.message_id, checkpoint_metadata)
    if not success then
        return nil, err
    end

    local session_data = ctx.reader:state()
    local current_meta = session_data.meta or {}

    if not current_meta.checkpoints or type(current_meta.checkpoints) ~= "table" then
        current_meta.checkpoints = {}
    end

    table.insert(current_meta.checkpoints, {
        checkpoint_id = op.checkpoint_id,
        message_id = op.message_id,
        created_at = time.now():format(time.RFC3339),
        trigger_tokens = op.trigger_tokens or 0,
        checkpoint_tokens = result.tokens or {}
    })

    local meta_success, meta_err = ctx.writer:update_meta({ meta = { checkpoints = current_meta.checkpoints } })
    if not meta_success then
        return nil, "Failed to update checkpoint meta: " .. (meta_err or "unknown error")
    end

    local success1, err1 = ctx.writer:set_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID, op.checkpoint_id)
    if not success1 then
        return nil, err1
    end

    ctx.reader:reset()

    ctx.writer:delete_session_contexts_by_type(consts.CONTEXT_TYPES.CONVERSATION_SUMMARY)

    local summary_id, ctx_err = ctx.writer:add_session_context(consts.CONTEXT_TYPES.CONVERSATION_SUMMARY, result.summary)
    if ctx_err then
        return nil, ctx_err
    end

    local next_ops = {}
    if ctx.config.title_function_id then
        table.insert(next_ops, {
            type = consts.OP_TYPE.GENERATE_TITLE,
            session_id = ctx.session_id,
            current_checkpoint_id = op.checkpoint_id
        })
    end

    return {
        completed = true,
        checkpoint_id = op.checkpoint_id,
        tokens = result.tokens,
        next_ops = next_ops
    }
end

function session_handlers.agent_change(ctx, op)
    if not op.agent_id then
        return nil, "Agent ID is required"
    end
    local stored_config = ctx.config or ((ctx.reader:state() or {}).config or {})
    local current_config = clone(stored_config)
    local previous_agent = stored_config.agent_id
    local previous_model = stored_config.model

    current_config.agent_id = op.agent_id

    -- Switch to new agent without forcing current model
    local switch_success, switch_err = ctx.agent_ctx:switch_to_agent(op.agent_id)

    if not switch_success then
        return nil, "Failed to switch agent: " .. (switch_err or "unknown error")
    end

    -- Get the new agent's default model and update config
    local new_model = ctx.agent_ctx.current_model
    current_config.model = new_model

    local next_agent = nil
    if type(ctx.agent_ctx.get_current_agent) == "function" then
        next_agent = ctx.agent_ctx:get_current_agent()
    end
    next_agent = next_agent or { id = op.agent_id, model = new_model }
    local candidate_state = clone(ctx.turn_state)
    if candidate_state then
        candidate_state.input_policy = nil
        if candidate_state.active then candidate_state.handoff = true end
    end
    local candidate = {
        config = current_config,
        turn_state = candidate_state,
        status = ctx.status,
        stop_requested = ctx.stop_requested,
        current_agent = next_agent,
        input_policy_revision = ctx.input_policy_revision,
        interaction = ctx.interaction,
    }
    local interaction = input_policy.snapshot(ctx, candidate, next_agent)

    local success, err = ctx.writer:update_meta({
        config = current_config,
        status = ctx.status,
        meta = { interaction = interaction },
    })
    if not success then
        local restored, restore_err = restore_agent(ctx, previous_agent, previous_model)
        if not restored then
            return fail_runtime(ctx, "Failed to update agent config: " .. tostring(err or "unknown error")
                .. "; runtime rollback failed: " .. tostring(restore_err))
        end
        return nil, "Failed to update agent config: " .. (err or "unknown error")
    end
    ctx.config = current_config
    ctx.turn_state = candidate_state
    ctx.current_agent = next_agent
    ctx.reader:reset()
    input_policy.accept_committed(ctx, interaction)

    local switch_message = string.format("Agent changed to: %s (model: %s)", op.agent_id, new_model)
    ctx.writer:add_message(consts.MSG_TYPE.SYSTEM, switch_message, {
        system_action = "agent_change",
        from_agent = previous_agent,
        to_agent = op.agent_id,
        from_model = previous_model,
        to_model = new_model
    })

    -- Notify agent and reset cache
    ctx.writer:add_message(consts.MSG_TYPE.DEVELOPER, switch_message)

    ctx.upstream:update_session({
        agent = op.agent_id,
        model = new_model
    })

    return {
        completed = true,
        previous_agent = previous_agent,
        new_agent = op.agent_id,
        previous_model = previous_model,
        new_model = new_model
    }
end

function session_handlers.model_change(ctx, op)
    if not op.model then
        return nil, "Model name is required"
    end
    local current_config = ctx.config or ((ctx.reader:state() or {}).config or {})
    local staged_config = clone(current_config)
    local previous_model = current_config.model

    staged_config.model = op.model
    if current_config.agent_id and ctx.agent_ctx.switch_to_model then
        local switched, switch_err = ctx.agent_ctx:switch_to_model(op.model)
        if switched == false then
            return nil, "Failed to switch model: " .. (switch_err or "unknown error")
        end
    end
    local success, err = ctx.writer:update_meta({ config = staged_config })
    if not success then
        local restored, restore_err = restore_model(ctx, previous_model)
        if not restored then
            return fail_runtime(ctx, "Failed to update model config: " .. tostring(err or "unknown error")
                .. "; runtime rollback failed: " .. tostring(restore_err))
        end
        return nil, "Failed to update model config: " .. (err or "unknown error")
    end

    ctx.config = staged_config
    ctx.reader:reset()

    local change_message = string.format("Model changed to: %s", op.model)
    ctx.writer:add_message(consts.MSG_TYPE.SYSTEM, change_message, {
        system_action = "model_change",
        from_model = previous_model,
        to_model = op.model
    })

    -- Notify agent and reset cache
    ctx.writer:add_message(consts.MSG_TYPE.DEVELOPER, change_message)

    ctx.upstream:update_session({
        model = op.model
    })

    return {
        completed = true,
        previous_model = previous_model,
        new_model = op.model
    }
end

return session_handlers
