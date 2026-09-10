local json = require("json")
local uuid = require("uuid")
local hash = require("hash")
local consts = require("consts")
local prompt_builder = require("prompt_builder")
local context_attachments = require("context_attachments")
local tool_caller = require("tool_caller")
local output = require("output")
local lifecycle_runtime = require("lifecycle_runtime")

type SessionContext = {
    session_id: string,
    user_id: string,
    reader: any,
    writer: any,
    upstream: any,
    config: {[string]: any},
    agent_ctx: any,
    queue_empty_callback: any?,
    lifecycle_state: table?,
}

type ToolWrapperHostRef = {
    kind: string,
    session_id: string,
}

type ToolWrapperAgentRef = {
    id: string?,
    model: string?,
}

type ToolWrapperExecutionContext = {
    host: ToolWrapperHostRef,
    agent: ToolWrapperAgentRef,
    run_context: table?,
}

local message_handlers = {}
message_handlers._context_staging = require('context_staging_repo')

message_handlers._authorize_file = function(file_uuid, actor_id, session_id)
    return prompt_builder._authorize_file(file_uuid, actor_id, session_id)
end

function message_handlers.context_transport_capabilities(capabilities_version)
    if capabilities_version ~= nil and capabilities_version ~= 1 then return nil, 'INVALID_CAPABILITIES_VERSION' end
    local _, err = message_handlers._context_staging.cleanup()
    if err then return nil, err end
    local result = { context_attachments_transport = { version = 1, staging = true, max_context_bytes = 32768 } }
    if capabilities_version == 1 then result.context_attachments_capabilities = context_attachments.capabilities() end
    return result
end

local function reject_transport(ctx, op, code)
    if op.request_id then ctx.upstream:command_error(op.request_id, code, 'Context transport request rejected') end
    return { completed = true, rejected = true, error = code }
end

local function reject_file_references(ctx, op)
    local code = consts.ERROR_CODES.INVALID_FILE_REFERENCES
    if op.request_id then
        ctx.upstream:command_error(op.request_id, code, 'One or more attached files are unavailable')
    end
    return { completed = true, rejected = true, error = code }
end

local function validate_file_references(file_uuids, actor_id, session_id)
    if file_uuids == nil then return true end
    if type(file_uuids) ~= 'table' then return false end

    local length = #file_uuids
    local key_count = 0
    for key, _ in pairs(file_uuids) do
        key_count = key_count + 1
        if type(key) ~= 'number' or key % 1 ~= 0 or key < 1 or key > length then
            return false
        end
    end
    if key_count ~= length then return false end

    local seen = {}
    for index = 1, length do
        local file_uuid = file_uuids[index]
        if type(file_uuid) ~= 'string' or file_uuid == '' or seen[file_uuid] then
            return false
        end
        local ok, authorized = pcall(message_handlers._authorize_file, file_uuid, actor_id, session_id)
        if not ok or authorized ~= true then return false end
        seen[file_uuid] = true
    end
    return true
end

message_handlers._authorize_visual = function(request)
    return prompt_builder._authorize_visual(request)
end

message_handlers._resolve_visual = function(request)
    return prompt_builder._resolve_visual(request)
end

local RUN_CONTEXT_CONTRACT = "wippy.agent:run_context"
local DEFAULT_RUN_CONTEXT_BINDING = "wippy.session.run_context:binding"

local OUTCOME = {
    CONTINUES = "continues",
    COMPLETED = "completed",
    FAILED = "failed",
}

local REASON = {
    NO_TOOLS_REQUIRED = "no_tools_required",
    TOOL_RESULTS_RECORDED = "tool_results_recorded",
    CONTEXT_LIMIT_REACHED = "context_limit_reached",
    HOST_FAILED = "host_failed",
    AGENT_SWITCH = "agent_switch",
    SESSION_FINISHED = "session_finished",
}

local function copy_context(context: any): table
    local copied = {}
    if type(context) == "table" then
        for k, v in pairs(context) do
            copied[k] = v
        end
    end
    return copied
end

local function with_agent_run_context(ctx: SessionContext, context: any, agent_ref: ToolWrapperAgentRef?): table
    local next_context = copy_context(context)
    local host = {
        kind = "session",
        session_id = ctx.session_id
    }
    local agent_info = agent_ref or {
        id = ctx.config and ctx.config.agent_id,
        model = ctx.config and ctx.config.model
    }

    next_context.agent_run = {
        host = host,
        agent = agent_info,
        run_context = {
            contract = RUN_CONTEXT_CONTRACT,
            binding = (ctx.config and ctx.config.run_context_binding) or DEFAULT_RUN_CONTEXT_BINDING,
            host = host,
            agent = agent_info
        }
    }

    return next_context
end

local function host_ref(ctx: SessionContext): table
    return {
        kind = "session",
        session_id = ctx.session_id
    }
end

local function string_or_nil(value: any): string?
    if type(value) == "string" and value ~= "" then
        return value
    end
    return nil
end

local function agent_ref_from(ctx: SessionContext, agent: any?): ToolWrapperAgentRef
    return {
        id = string_or_nil(agent and agent.id or (ctx.config and ctx.config.agent_id)),
        model = string_or_nil(agent and agent.model or (ctx.config and ctx.config.model))
    }
end

local function run_context_ref(ctx: SessionContext, agent_ref: ToolWrapperAgentRef, host: table): table
    return {
        contract = RUN_CONTEXT_CONTRACT,
        binding = (ctx.config and ctx.config.run_context_binding) or DEFAULT_RUN_CONTEXT_BINDING,
        host = host,
        agent = agent_ref
    }
end

local function apply_lifecycle(ctx: SessionContext, phase: string, agent: any?, opts: table?): (table?, string?)
    if not agent or type(agent.bindings) ~= "table" then
        return { applied = 0, skipped = 0 }, nil
    end

    local host = host_ref(ctx)
    local agent_ref = agent_ref_from(ctx, agent)
    local payload = {
        phase = phase,
        host = host,
        agent = agent_ref,
        reason = opts and opts.reason,
        outcome = opts and opts.outcome,
        refs = opts and opts.refs,
        run_context = run_context_ref(ctx, agent_ref, host),
    } :: LifecyclePayload

    return lifecycle_runtime.apply(agent.bindings, payload)
end

local function append_lifecycle_messages(builder: any, result: table?)
    if not builder or type(result) ~= "table" or type(result.messages) ~= "table" then
        return
    end

    for _, message in ipairs(result.messages) do
        if type(message) == "table" then
            local content = message.content or message.text or message.data
            if type(content) == "string" and content ~= "" then
                local role = message.role or message.type or "developer"
                if role == "system" and type(builder.add_system) == "function" then
                    builder:add_system(content)
                elseif role == "user" and type(builder.add_user) == "function" then
                    builder:add_user(content)
                elseif role == "assistant" and type(builder.add_assistant) == "function" then
                    builder:add_assistant(content, message.metadata)
                elseif type(builder.add_developer) == "function" then
                    builder:add_developer(content, message.metadata)
                end
            end
        end
    end
end

local function current_agent(ctx: SessionContext): any?
    if ctx.agent_ctx and type(ctx.agent_ctx.get_current_agent) == "function" then
        local agent = ctx.agent_ctx:get_current_agent()
        if agent then
            return agent
        end
    end

    if ctx.config and ctx.config.agent_id and ctx.config.agent_id ~= "" and ctx.agent_ctx and type(ctx.agent_ctx.load_agent) == "function" then
        local agent = ctx.agent_ctx:load_agent(ctx.config.agent_id, {
            model = ctx.config.model
        })
        return agent
    end

    return nil
end

function message_handlers.deactivate_current_agent(ctx: SessionContext, reason: string?, outcome: table?): (table?, string?)
    ctx.lifecycle_state = ctx.lifecycle_state or {}
    local state = ctx.lifecycle_state
    if not state.active_agent_id then
        return { applied = 0, skipped = 0 }, nil
    end

    local agent = state.active_agent or current_agent(ctx)
    if not agent then
        state.active_agent_id = nil
        state.active_model = nil
        state.active_agent = nil
        return { applied = 0, skipped = 0 }, nil
    end

    local result, err = apply_lifecycle(ctx, lifecycle_runtime.PHASE.DEACTIVATE, agent, {
        reason = reason or REASON.SESSION_FINISHED,
        outcome = outcome or {
            state = OUTCOME.COMPLETED,
            reason = reason or REASON.SESSION_FINISHED
        }
    })

    if not err then
        state.active_agent_id = nil
        state.active_model = nil
        state.active_agent = nil
    end

    return result, err
end

local function ensure_agent_activated(ctx: SessionContext, agent: any, refs: table?): (table?, string?)
    ctx.lifecycle_state = ctx.lifecycle_state or {}
    local state = ctx.lifecycle_state
    local agent_ref = agent_ref_from(ctx, agent)
    local same_agent = state.active_agent_id == agent_ref.id and state.active_model == agent_ref.model

    if same_agent then
        state.active_agent = agent
        return { applied = 0, skipped = 0 }, nil
    end

    if state.active_agent_id then
        local _, deactivate_err = message_handlers.deactivate_current_agent(ctx, REASON.AGENT_SWITCH, {
            state = OUTCOME.CONTINUES,
            reason = REASON.AGENT_SWITCH
        })
        if deactivate_err then
            return nil, deactivate_err
        end
    end

    local result, err = apply_lifecycle(ctx, lifecycle_runtime.PHASE.ACTIVATE, agent, {
        reason = "agent_loaded",
        refs = refs,
        outcome = {
            state = OUTCOME.CONTINUES,
            reason = "agent_loaded"
        }
    })
    if err then
        return result, err
    end

    state.active_agent_id = agent_ref.id
    state.active_model = agent_ref.model
    state.active_agent = agent
    return result, nil
end

local function outcome_from_agent_result(result: any): table
    if result and result.truncated then
        return {
            state = OUTCOME.CONTINUES,
            reason = REASON.CONTEXT_LIMIT_REACHED
        }
    end

    local has_tools = result and (
        (type(result.tool_calls) == "table" and #result.tool_calls > 0) or
        (type(result.delegate_calls) == "table" and #result.delegate_calls > 0)
    )
    if has_tools then
        return {
            state = OUTCOME.CONTINUES,
            reason = REASON.TOOL_RESULTS_RECORDED
        }
    end

    return {
        state = OUTCOME.COMPLETED,
        reason = REASON.NO_TOOLS_REQUIRED
    }
end

function message_handlers.handle_message(ctx, op)
    local attachments = op.data.context_attachments
    local reference = op.data.context_attachments_ref
    local receipt, accepted_message = nil, nil
    local existing_file_message = nil
    if reference == nil and attachments == nil and op.data.file_uuids ~= nil
        and op.request_id and type(ctx.writer.get_message_by_request_id) == 'function' then
        local lookup_err
        existing_file_message, lookup_err = ctx.writer:get_message_by_request_id(op.request_id)
        if lookup_err then
            ctx.upstream:command_error(op.request_id, consts.ERROR_CODES.STORAGE_ERROR, 'Unable to verify message retry')
            return nil, lookup_err
        end
    end
    if reference == nil and attachments ~= nil and op.request_id and type(ctx.writer.get_message_by_request_id) == 'function' then
        local existing, lookup_err = ctx.writer:get_message_by_request_id(op.request_id)
        if lookup_err then return reject_transport(ctx, op, 'CONTEXT_STAGING_UNAVAILABLE') end
        if existing then
            local supplied = context_attachments.canonical_json(attachments)
            local original = context_attachments.canonical_json(existing.metadata and existing.metadata.context_attachments)
            if existing.context_receipt or not supplied or supplied ~= original then
                return reject_transport(ctx, op, consts.ERROR_CODES.REQUEST_CONFLICT)
            end
            accepted_message = existing
            attachments = existing.metadata.context_attachments
        end
    end
    if reference ~= nil then
        local staging = message_handlers._context_staging
        if attachments ~= nil or not staging.valid_reference(reference) or not staging.valid_request_id(op.request_id) then
            return reject_transport(ctx, op, 'INVALID_CONTEXT_REFERENCE')
        end
        local existing, lookup_err = ctx.writer:get_message_by_request_id(op.request_id)
        if lookup_err then return reject_transport(ctx, op, 'CONTEXT_STAGING_UNAVAILABLE') end
        local prior = existing and existing.context_receipt
        if prior and prior.actor_id == ctx.user_id
            and context_attachments.canonical_json(prior.reference) == context_attachments.canonical_json(reference) then
            accepted_message = existing
            attachments = existing.metadata and existing.metadata.context_attachments
            if type(attachments) ~= 'table' then return reject_transport(ctx, op, 'INVALID_CONTEXT_RECEIPT') end
            local canonical = context_attachments.canonical_json(attachments)
            if not canonical or #canonical ~= reference.content_bytes
                or 'sha256:' .. hash.sha256(canonical) ~= reference.content_hash then
                return reject_transport(ctx, op, 'INVALID_CONTEXT_RECEIPT')
            end
        else
            local resolve_err
            attachments, resolve_err = staging.resolve(ctx.user_id, ctx.session_id, op.request_id, reference)
            if not attachments then return reject_transport(ctx, op, resolve_err) end
            receipt = { actor_id = ctx.user_id, reference = reference }
        end
    end
    if attachments ~= nil and not accepted_message then
        local validated, validation_err = context_attachments.validate(attachments, {
            session_id = ctx.session_id,
            require_visual_authorization = true,
            visual_authorizer = message_handlers._authorize_visual,
            visual_resolver = message_handlers._resolve_visual,
        })
        if not validated then
            if op.request_id then
                ctx.upstream:command_error(
                    op.request_id,
                    consts.ERROR_CODES.INVALID_CONTEXT_ATTACHMENTS,
                    context_attachments.format_error(validation_err)
                )
            end
            return {
                completed = true,
                rejected = true,
                error = validation_err
            }
        end
        attachments = validated
    end

    local metadata = {
        file_uuids = op.data.file_uuids,
        context_attachments = attachments
    }
    local request_hash = nil
    if op.request_id then
        local canonical, canonical_err = context_attachments.canonical_json({
            text = op.data.text or "",
            file_uuids = op.data.file_uuids or {},
            context_attachments = attachments or {},
        })
        if not canonical then
            ctx.upstream:command_error(op.request_id, consts.ERROR_CODES.INVALID_JSON, tostring(canonical_err))
            return { completed = true, rejected = true }, canonical_err
        end
        local digest, digest_err = hash.sha256(canonical)
        if digest_err then
            ctx.upstream:command_error(op.request_id, consts.ERROR_CODES.STORAGE_ERROR, tostring(digest_err))
            return nil, digest_err
        end
        request_hash = "sha256:" .. digest
    end
    if existing_file_message then
        if existing_file_message.request_hash ~= request_hash then
            return reject_transport(ctx, op, consts.ERROR_CODES.REQUEST_CONFLICT)
        end
        accepted_message = existing_file_message
    end
    if accepted_message and accepted_message.request_hash ~= request_hash then
        return reject_transport(ctx, op, consts.ERROR_CODES.REQUEST_CONFLICT)
    end
    if not accepted_message and not validate_file_references(op.data.file_uuids, ctx.user_id, ctx.session_id) then
        return reject_file_references(ctx, op)
    end
    local message_id, err, duplicate
    if accepted_message then
        message_id, duplicate = accepted_message.message_id, true
    else
        message_id, err, duplicate = ctx.writer:add_message(
        consts.MSG_TYPE.USER,
        op.data.text or "",
        metadata,
        op.request_id,
        request_hash,
        receipt
    )
    end
    if err then
        if receipt and (err == 'CONTEXT_REFERENCE_UNAVAILABLE' or err == 'INVALID_CONTEXT_REFERENCE'
            or err == 'CONTEXT_SESSION_UNAVAILABLE') then
            return reject_transport(ctx, op, err)
        end
        if op.request_id then
            local error_code = err == "Request ID conflict"
                and consts.ERROR_CODES.REQUEST_CONFLICT
                or consts.ERROR_CODES.STORAGE_ERROR
            ctx.upstream:command_error(op.request_id, error_code, err)
        end
        return nil, err
    end

    local dispatch
    if ctx.dispatch_manager then
        local dispatch_err
        dispatch, dispatch_err = require('dispatch_repo').get(ctx.session_id, message_id)
        if not dispatch then return nil, dispatch_err or 'DISPATCH_UNAVAILABLE' end
        ctx.dispatch_manager:accepted(dispatch, op.ui_action_runtime, duplicate)
    end
    local attachment_refs = {}
    if op.request_id then
        for _, attachment in ipairs(attachments or {}) do
            table.insert(attachment_refs, {
                attachment_id = attachment.attachment_id,
                kind = attachment.kind,
                version = attachment.version,
                content_hash = attachment.content_hash
            })
        end
    end
    if duplicate then
        ctx.upstream:command_success(op.request_id, {
            message_id = message_id,
            attachments = attachment_refs,
            dispatch = dispatch and require('dispatch_repo').descriptor(dispatch) or nil
        })
        return {
            completed = true,
            duplicate = true,
            message_id = message_id,
        }
    end

    ctx.upstream:message_received(message_id, op.data.text or "", op.data.file_uuids, attachments, op.request_id)
    if op.request_id then
        ctx.upstream:command_success(op.request_id, {
            message_id = message_id,
            attachments = attachment_refs,
            dispatch = dispatch and require('dispatch_repo').descriptor(dispatch) or nil
        })
    end

    if ctx.dispatch_manager then return { completed = true, message_id = message_id } end
    return {
        message_id = message_id,
        next_ops = {
            {
                type = consts.OP_TYPE.AGENT_STEP,
                message_id = message_id,
                request_id = op.request_id,
                from_user = true,
                ui_action_runtime = op.ui_action_runtime,
            }
        }
    }
end

function message_handlers.agent_step(ctx, op)
    local builder, err = prompt_builder.from_session(ctx.reader)
    if not builder then
        return nil, "Failed to build prompt: " .. err
    end

    if not ctx.config.agent_id or ctx.config.agent_id == "" then
        return nil, "No agent configured for this session"
    end

    local agent, agent_err = ctx.agent_ctx:load_agent(ctx.config.agent_id, {
        model = ctx.config.model
    })
    if not agent then
        return nil, "Failed to load agent: " .. (agent_err or "unknown error")
    end

    local response_id, err = uuid.v7()
    if ctx.dispatch_root then
        response_id = ctx.operation_key == 'root' and ctx.dispatch_root.row.response_id
            or require('dispatch_repo').output_id(ctx.dispatch_root.row.dispatch_id, ctx.operation_key, 'response')
    end
    if err then
        return nil, "Failed to generate response ID: " .. err
    end

    local session_context, ctx_err = ctx.reader:get_full_context()
    if ctx_err then
        session_context = {}
    end
    session_context = with_agent_run_context(ctx, session_context, agent_ref_from(ctx, agent))

    local activate_result, activate_err = ensure_agent_activated(ctx, agent, {
        message_id = op.message_id,
        request_id = op.request_id
    })
    if activate_err then
        return nil, activate_err
    end
    append_lifecycle_messages(builder, activate_result)

    local before_result, before_err = apply_lifecycle(ctx, lifecycle_runtime.PHASE.BEFORE_STEP, agent, {
        reason = "agent_step",
        refs = {
            message_id = op.message_id,
            request_id = op.request_id
        },
        outcome = {
            state = OUTCOME.CONTINUES,
            reason = "agent_step"
        }
    })
    if before_err then
        return nil, before_err
    end
    append_lifecycle_messages(builder, before_result)

    ctx.upstream:response_beginning(response_id, op.message_id)

    local runtime_options = {
        context = session_context
    }
    if ctx.stream_target then
        runtime_options.stream_target = ctx.stream_target
    elseif ctx.upstream.conn_pid then
        runtime_options.stream_target = {
            reply_to = ctx.upstream.conn_pid,
            topic = ctx.upstream:get_message_topic(response_id)
        }
    end

    local result, exec_err = agent:step(builder, runtime_options)
    if exec_err then
        ctx.upstream:message_error(response_id, consts.ERROR_CODES.AGENT_ERROR, exec_err)
        return nil, exec_err
    end

    local _, after_err = apply_lifecycle(ctx, lifecycle_runtime.PHASE.AFTER_STEP, agent, {
        reason = "agent_step",
        refs = {
            message_id = op.message_id,
            response_id = response_id,
            request_id = op.request_id
        },
        outcome = outcome_from_agent_result(result)
    })
    if after_err then
        ctx.upstream:message_error(response_id, consts.ERROR_CODES.AGENT_ERROR, after_err)
        return nil, after_err
    end

    if result.tokens and type(result.tokens) == "table" then
        local session_data = ctx.reader:state()
        local current_meta = session_data.meta or {}

        if not current_meta.tokens or type(current_meta.tokens) ~= "table" then
            current_meta.tokens = {}
        end

        for token_key, token_value in pairs(result.tokens) do
            if type(token_value) == "number" then
                current_meta.tokens[token_key] = (current_meta.tokens[token_key] or 0) + token_value
            end
        end

        ctx.writer:update_meta({ meta = current_meta })
    end

    if result.truncated then
        if result.result and result.result ~= "" then
            local _, store_err = ctx.writer:add_message(consts.MSG_TYPE.ASSISTANT, result.result, {
                source_id = op.message_id,
                agent_id = ctx.config.agent_id,
                model = ctx.config.model,
                tokens = result.tokens,
                truncated = true
            })
            if store_err then
                return nil, store_err
            end

            ctx.upstream:send_message_update(response_id, consts.UPSTREAM_TYPES.CONTENT, {
                content = result.result,
                using_tools = false
            })
        end

        ctx.writer:add_message(consts.MSG_TYPE.DEVELOPER, (output :: any).TRUNCATION_MSG, {})

        return {
            message_id = op.message_id,
            response_id = response_id,
            completed = false,
            next_ops = {
                {
                    type = consts.OP_TYPE.AGENT_STEP,
                    message_id = op.message_id,
                    request_id = op.request_id,
                    from_user = false,
                    ui_action_runtime = op.ui_action_runtime,
                }
            }
        }
    end

    local unified_tool_calls = {}
    if result.tool_calls and #result.tool_calls > 0 then
        for _, tool_call in ipairs(result.tool_calls) do
            table.insert(unified_tool_calls, tool_call)
        end
    end
    if result.delegate_calls and #result.delegate_calls > 0 then
        for _, delegate_call in ipairs(result.delegate_calls) do
            if ctx.config.delegation_func_id then
                delegate_call.registry_id = ctx.config.delegation_func_id
                table.insert(unified_tool_calls, delegate_call)
            end
        end
    end

    if (result.result and result.result ~= "") or (#unified_tool_calls > 0) or result.memory_recall then
        local current_checkpoint_id = ctx.reader:get_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID)

        local metadata = {
            source_id = op.message_id,
            agent_id = ctx.config.agent_id,
            model = ctx.config.model,
            tokens = result.tokens,
            checkpoint_id = current_checkpoint_id
        }

        if result.memory_recall then
            metadata.memory_ids = result.memory_recall.memory_ids
            metadata.memory_count = result.memory_recall.count
        end

        if result.metadata then
            for k, v in pairs(result.metadata) do
                metadata[k] = v
            end
        end

        local _, store_err = ctx.writer:add_message(consts.MSG_TYPE.ASSISTANT, result.result or "", metadata)
        if store_err then
            ctx.upstream:message_error(response_id, consts.ERROR_CODES.STORAGE_ERROR, store_err)
            return nil, store_err
        end

        if result.result and result.result ~= "" then
            ctx.upstream:send_message_update(response_id, consts.UPSTREAM_TYPES.CONTENT, {
                content = result.result,
                using_tools = (#unified_tool_calls > 0)
            })
        end
    else
        ctx.upstream:invalidate_message(response_id)
    end

    if result.memory_prompt then
        local memory_metadata = {}
        if result.memory_prompt.metadata and result.memory_prompt.metadata.memory_ids then
            memory_metadata.memory_ids = result.memory_prompt.metadata.memory_ids
        end
        ctx.writer:add_message(consts.MSG_TYPE.DEVELOPER, result.memory_prompt.content, memory_metadata)
    end

    -- Separate user-facing operations from background operations
    local user_facing_ops = {}
    local background_ops = {}

    if #unified_tool_calls > 0 then
        table.insert(user_facing_ops, {
            type = consts.OP_TYPE.PROCESS_TOOLS,
            tool_calls = unified_tool_calls,
            tool_wrappers = agent.tool_wrappers or {},
            agent = {
                id = agent.id,
                model = agent.model
            },
            message_id = op.message_id,
            response_id = response_id,
            request_id = op.request_id,
            has_text_response = (result.result and result.result ~= ""),
            ui_action_runtime = op.ui_action_runtime,
        })
    end

    -- Background operations don't affect user-facing status
    if op.from_user and result.tokens then
        table.insert(background_ops, {
            type = consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS,
            background = true,
            tokens = result.tokens,
            agent_options = agent.agent_options or {},
            checkpoint_bindings = agent.bindings and agent.bindings.checkpoint,
            agent = {
                id = agent.id,
                model = agent.model
            },
            run_context_binding = (ctx.config and ctx.config.run_context_binding) or DEFAULT_RUN_CONTEXT_BINDING,
            message_id = op.message_id
        })
    end

    -- Combine all operations for processing
    local all_ops = {}
    for _, op_item in ipairs(user_facing_ops) do
        table.insert(all_ops, op_item)
    end
    for _, op_item in ipairs(background_ops) do
        table.insert(all_ops, op_item)
    end

    return {
        message_id = op.message_id,
        response_id = response_id,
        completed = (#user_facing_ops == 0),
        next_ops = all_ops
    }
end

function message_handlers.process_tools(ctx, op)
    if not op.tool_calls or #op.tool_calls == 0 then
        return { completed = true }
    end

    local caller = tool_caller.new()
    caller:set_strategy(tool_caller.STRATEGY.PARALLEL)
    caller:set_runtime_context_resolver(function(call_id, tool_call)
        if not op.ui_action_runtime then
            return nil, "UI action unavailable: agent actions were not enabled for this turn"
        end
        return {
            ui_action_runtime = {
                broker_pid = op.ui_action_runtime.broker_pid,
                delivery_handle = op.ui_action_runtime.delivery_handle,
                session_id = op.ui_action_runtime.session_id,
                host_instance_id = op.ui_action_runtime.host_instance_id,
            }
        }, nil
    end)

    local op_agent = op.agent
    if type(op_agent) ~= "table" then
        op_agent = nil
    end
    local fallback_agent = {
        id = string_or_nil(ctx.config and ctx.config.agent_id),
        model = string_or_nil(ctx.config and ctx.config.model)
    } :: ToolWrapperAgentRef
    local active_agent = (op_agent or fallback_agent) :: ToolWrapperAgentRef

    local wrapper_context: ToolWrapperExecutionContext = {
        host = {
            kind = "session",
            session_id = ctx.session_id
        },
        agent = active_agent,
        run_context = {
            contract = RUN_CONTEXT_CONTRACT,
            binding = (ctx.config and ctx.config.run_context_binding) or DEFAULT_RUN_CONTEXT_BINDING,
            host = {
                kind = "session",
                session_id = ctx.session_id
            },
            agent = active_agent
        }
    }

    if type(caller.set_tool_wrappers) == "function" then
        caller:set_tool_wrappers(op.tool_wrappers or {})
    end
    if type(caller.set_wrapper_context) == "function" then
        caller:set_wrapper_context(wrapper_context)
    end

    local validated_tools, validate_err = caller:validate(op.tool_calls)
    if validate_err and not validated_tools then
        return nil, "Tool validation failed: " .. validate_err
    end

    for call_id, tool_call in pairs(validated_tools) do
        if tool_call.valid or tool_call.error then
            local message_type = consts.MSG_TYPE.FUNCTION
            local send_upstream = true

            if tool_call.registry_id == ctx.config.delegation_func_id then
                message_type = consts.MSG_TYPE.DELEGATION
                send_upstream = false
            elseif tool_call.meta and tool_call.meta.private then
                message_type = consts.MSG_TYPE.PRIVATE_FUNCTION
                send_upstream = false
            end

            local message_id, err = ctx.writer:add_message(message_type, json.encode(tool_call.args), {
                call_id = call_id,
                function_name = tool_call.name,
                registry_id = tool_call.registry_id,
                status = consts.FUNC_STATUS.PENDING,
                provider_metadata = tool_call.provider_metadata
            })
            if err or not message_id then return nil, err or 'Tool message persistence failed' end

            if not err then
                tool_call.message_id = message_id

                if send_upstream then
                    ctx.upstream:send_message_update(message_id, consts.UPSTREAM_TYPES.FUNCTION_CALL, {
                        call_id = call_id,
                        function_name = tool_call.name
                    })
                end
            end
        end
    end

    local session_context, err = ctx.reader:get_full_context()
    if err then
        session_context = {}
    end
    session_context = with_agent_run_context(ctx, session_context, active_agent)

    local results = caller:execute(session_context, validated_tools)

    local next_ops = {}
    local control_ops = {}

    for call_id, result_data in pairs(results) do
        local message_id = result_data.tool_call.message_id
        local is_delegation = result_data.tool_call.registry_id == ctx.config.delegation_func_id
        local is_private = result_data.tool_call.meta and result_data.tool_call.meta.private

        if result_data.error then
            ctx.writer:update_message_meta(message_id, {
                result = tostring(result_data.error),
                status = consts.FUNC_STATUS.ERROR,
                function_name = result_data.tool_call.name,
                call_id = call_id,
                registry_id = result_data.tool_call.registry_id
            })

            if not is_delegation and not is_private then
                ctx.upstream:send_message_update(message_id, consts.UPSTREAM_TYPES.FUNCTION_ERROR, {
                    call_id = call_id,
                    function_name = result_data.tool_call.name,
                    error = "Function execution failed"
                })
            end
        else
            local tool_result = result_data.result

            if not is_delegation and tool_result and type(tool_result) == "table" and tool_result._control then
                ctx.writer:update_message_meta(message_id, {
                    control_operations = tool_result._control
                })
            end

            if not is_delegation and tool_result and type(tool_result) == "table" and tool_result._control then
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

            ctx.writer:update_message_meta(message_id, {
                result = tool_result,
                status = consts.FUNC_STATUS.SUCCESS,
                function_name = result_data.tool_call.name,
                call_id = call_id,
                registry_id = result_data.tool_call.registry_id
            })

            if not is_delegation and not is_private then
                ctx.upstream:send_message_update(message_id, consts.UPSTREAM_TYPES.FUNCTION_SUCCESS, {
                    call_id = call_id,
                    function_name = result_data.tool_call.name
                })
            end
        end
    end

    for _, control_op in ipairs(control_ops) do
        table.insert(next_ops, control_op)
    end

    if #op.tool_calls > 0 then
        table.insert(next_ops, {
            type = consts.OP_TYPE.AGENT_CONTINUE,
            message_id = op.message_id,
            request_id = op.request_id,
            ui_action_runtime = op.ui_action_runtime,
        })
    end

    return {
        completed = (#next_ops == 0),
        next_ops = next_ops
    }
end

function message_handlers.agent_continue(ctx, op)
    return message_handlers.agent_step(ctx, {
        message_id = op.message_id,
        request_id = op.request_id,
        from_user = false,
        ui_action_runtime = op.ui_action_runtime,
    })
end

return message_handlers
