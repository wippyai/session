local json = require("json")
local uuid = require("uuid")
local consts = require("consts")
local artifact_repo = require("artifact_repo")
local artifact_events = require("artifact_events")
local tx = require("tx")
local definition = require("definition")
local form_artifact = require("form_artifact")

type ArtifactData = {
    id: string?,
    title: string?,
    content: string?,
    content_type: string?,
    description: string?,
    icon: string?,
    status: string?,
    type: string?,
    page_id: string?,
    params: {[string]: any}?,
    display_type: string?,
    preview: string?,
    instructions: boolean?,
}

local control_handlers = {}

function control_handlers.handle_context_command(ctx, op)
    if not op.action then
        return nil, consts.ERR.CONTEXT_ACTION_REQUIRED
    end

    if op.action == consts.CONTEXT_ACTIONS.WRITE then
        return control_handlers.context_write(ctx, op)
    elseif op.action == consts.CONTEXT_ACTIONS.DELETE then
        return control_handlers.context_delete(ctx, op)
    else
        return nil, consts.ERR.INVALID_CONTEXT_ACTION
    end
end

function control_handlers.context_write(ctx, op)
    if not op.key then
        return nil, consts.ERR.CONTEXT_KEY_REQUIRED
    end

    local success, err = ctx.writer:set_context(op.key, op.data)
    if not success then
        return nil, consts.ERR.CONTEXT_UPDATE_FAILED .. ": " .. (err or "unknown error")
    end

    ctx.reader:reset()

    local context_data, get_err = ctx.reader:get_full_context()
    if get_err then
        context_data = {}
    end

    if op.from_pid and process and process.send then
        process.send(op.from_pid, consts.CONTEXT_COMMANDS.COMMAND_SUCCESS, {
            action = consts.CONTEXT_ACTIONS.WRITE,
            key = op.key,
            context = context_data
        })
    end

    return {
        completed = true,
        action = consts.CONTEXT_ACTIONS.WRITE,
        key = op.key,
        context = context_data
    }
end

function control_handlers.context_delete(ctx, op)
    if not op.key then
        return nil, consts.ERR.CONTEXT_KEY_REQUIRED
    end

    local success, err = ctx.writer:delete_context(op.key)
    if not success then
        return nil, consts.ERR.CONTEXT_UPDATE_FAILED .. ": " .. (err or "unknown error")
    end

    ctx.reader:reset()

    local context_data, get_err = ctx.reader:get_full_context()
    if get_err then
        context_data = {}
    end

    if op.from_pid and process and process.send then
        process.send(op.from_pid, consts.CONTEXT_COMMANDS.COMMAND_SUCCESS, {
            action = consts.CONTEXT_ACTIONS.DELETE,
            key = op.key,
            context = context_data
        })
    end

    return {
        completed = true,
        action = consts.CONTEXT_ACTIONS.DELETE,
        key = op.key,
        context = context_data
    }
end

-- Stores one new artifact and the chat rows that come with it: the artifact
-- row, the standalone artifact message (instructions == false) and the
-- "Artifact created" system row. Shared by control_artifacts and
-- control_forms so both create artifacts the same way.
--
-- opts.artifact_id - use this id instead of minting one
-- opts.tx          - write every row on this caller-supplied transaction
--
-- Returns a record { artifact_id, title, kind, message_id?, message_date?,
-- instruction? }. Nothing is sent upstream here: call announce_artifact with
-- the record once the writes are durable (after commit when opts.tx is used).
function control_handlers.store_artifact(ctx, artifact_data, opts)
    opts = opts or {}
    local write_opts = opts.tx and { tx = opts.tx } or nil

    local artifact_id = opts.artifact_id
    if not artifact_id then
        local id_err
        artifact_id, id_err = uuid.v7()
        if id_err then
            return nil, "Failed to generate artifact ID: " .. id_err
        end
    end

    local kind, content, meta, instruction_template
    if artifact_data.type == consts.ARTIFACT_TYPES.VIEW_REF then
        if not artifact_data.page_id then
            return nil, "Page ID is required for view_ref artifacts"
        end

        content = "{}"
        if artifact_data.params then
            local encoded, encode_err = json.encode(artifact_data.params)
            if encode_err then
                return nil, "Failed to encode artifact params: " .. encode_err
            end
            content = encoded
        end

        kind = consts.ARTIFACT_TYPES.VIEW_REF
        meta = {
            content_type = artifact_data.content_type or consts.CONTENT_TYPES.HTML,
            description = artifact_data.description,
            preview = artifact_data.preview,
            icon = artifact_data.icon,
            status = artifact_data.status or consts.ARTIFACT_STATUS.IDLE,
            page_id = artifact_data.page_id,
            display_type = artifact_data.display_type or consts.ARTIFACT_DISPLAY.STANDALONE
        }
        instruction_template = consts.ARTIFACT_INSTRUCTIONS.VIEW_REF_TEMPLATE
    else
        kind = artifact_data.type or consts.ARTIFACT_TYPES.INLINE
        content = artifact_data.content or ""
        meta = {
            content_type = artifact_data.content_type or consts.CONTENT_TYPES.MARKDOWN,
            description = artifact_data.description,
            preview = artifact_data.preview,
            icon = artifact_data.icon,
            status = artifact_data.status or consts.ARTIFACT_STATUS.IDLE,
            display_type = artifact_data.display_type or consts.ARTIFACT_DISPLAY.INLINE
        }
        instruction_template = consts.ARTIFACT_INSTRUCTIONS.WITH_PREVIEW_TEMPLATE
    end

    local success, create_err = ctx.writer:create_artifact(
        artifact_id, kind, artifact_data.title, content, meta, write_opts)
    if not success then
        return nil, "Failed to create artifact: " .. tostring(create_err)
    end

    local record = { artifact_id = artifact_id, title = artifact_data.title, kind = kind }

    if artifact_data.instructions ~= false then
        if artifact_data.preview and artifact_data.preview ~= "" then
            record.instruction = string.format(instruction_template,
                artifact_data.title, artifact_id, artifact_data.preview)
        else
            record.instruction = string.format(consts.ARTIFACT_INSTRUCTIONS.REFERENCE_TEMPLATE,
                artifact_data.title, artifact_id)
        end
    end

    -- ⚠️ DO NOT REVERT unless you know exactly what you are doing. ⚠️
    -- Chat front-ends render a standalone artifact card from a message
    -- with type='artifact' + metadata.artifact_id. Without the line
    -- below, standalone artifacts (instructions=false) never render in
    -- the chat thread — only the SYSTEM/artifact_created message was
    -- emitted, which front-ends do not render.
    --
    -- Gate to STANDALONE only: inline artifacts (instructions=true) are
    -- rendered via the <artifact id="…"/> tag the agent embeds in its
    -- reply (see the instructions block above). Emitting an artifact
    -- message here for the inline case too would render it TWICE.
    if artifact_data.instructions == false then
        local message_id, message_err, stored_row: any = ctx.writer:add_message(consts.MSG_TYPE.ARTIFACT,
            artifact_data.title, { artifact_id = artifact_id }, write_opts)
        if message_err then
            return nil, "Failed to store standalone artifact message: " .. message_err
        end
        record.message_id = message_id
        record.message_date = type(stored_row) == "table" and stored_row.date or nil
    end

    ctx.writer:add_message(consts.MSG_TYPE.SYSTEM, "Artifact created: " .. artifact_data.title, {
        system_action = consts.SYSTEM_ACTIONS.ARTIFACT_CREATED,
        artifact_id = artifact_id
    }, write_opts)

    return record, nil
end

-- Tells connected clients about an artifact stored by store_artifact.
function control_handlers.announce_artifact(ctx, record)
    if record.message_id then
        ctx.upstream:send_message_update(record.message_id, "artifact", {
            message_id = record.message_id,
            artifact_id = record.artifact_id
        })
    end
    ctx.upstream:update_session({
        artifact_added = record.artifact_id
    })
end

function control_handlers.control_artifacts(ctx, op)
    if not op.artifacts or #op.artifacts == 0 then
        return nil, "No artifacts provided"
    end

    local created_artifacts = {}
    local instructions = {}

    for _, artifact_data in ipairs(op.artifacts) do
        if artifact_data.title and (artifact_data.content or artifact_data.page_id) then
            local record, store_err = control_handlers.store_artifact(ctx, artifact_data)
            if not record then
                return nil, store_err
            end
            table.insert(created_artifacts, {
                artifact_id = record.artifact_id,
                title = record.title,
                kind = record.kind
            })
            if record.instruction then
                table.insert(instructions, record.instruction)
            end
            control_handlers.announce_artifact(ctx, record)
        elseif artifact_data.id then
            -- meta_patch (not a whole-meta replace): a full replace here would wipe
            -- keys this directive doesn't know about (display_type, page_id, preview,
            -- ...), since it only ever carries these four fields.
            local updates = {
                title = artifact_data.title,
                content = artifact_data.content,
                meta_patch = {
                    content_type = artifact_data.content_type,
                    description = artifact_data.description,
                    icon = artifact_data.icon,
                    status = artifact_data.status
                }
            }

            local update_result, update_err = ctx.writer:update_artifact(artifact_data.id, updates)
            if not update_result then
                return nil, "Failed to update artifact: " .. tostring(update_err)
            end

            -- Publish only after the write has committed, and read the merged row
            -- back rather than reconstructing it from the request payload (the
            -- meta_patch merge happened server-side, inside the repo).
            local updated_artifact, get_err = artifact_repo.get(artifact_data.id)
            if not get_err and updated_artifact then
                artifact_events.publish_updated(updated_artifact)
            end
        end
    end

    if #instructions > 0 then
        local instruction_text = table.concat(instructions, "\n\n")
        ctx.writer:add_message(consts.MSG_TYPE.DEVELOPER, instruction_text, {
            system_action = "artifact_instructions",
            created_artifacts = created_artifacts
        })
    end

    return {
        completed = true,
        created_artifacts = created_artifacts
    }
end

-- The `_control.forms` effect of the ask_user tool (wippy.session.forms).
--
-- op: { forms = { { artifact_id, definition } }, turn_id, call_id,
--       tool_message_id } - process_tools adds the trusted bindings; the
--       tool supplies only the minted artifact id and the definition.
--
-- The definition is validated again here (the server does not trust the
-- tool output). One form per bus turn: a second attempt in the same turn is
-- rejected before anything is written. The artifact, its standalone chat
-- message, the system row and meta.session_form (origin binding, with the
-- artifact message's date as created_cursor) are written in one transaction,
-- so a failure leaves no form behind. Success asks process_tools to end the
-- turn instead of running another agent step.
local ARTIFACT_ID_PATTERN = "^%x%x%x%x%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x$"

-- A refused request is not an error of the session: control_forms returns
-- { completed = true, rejected = "<code>: <message>" } and process_tools
-- turns only that call into a tool error. Storage failures stay errors
-- (nil, err) and fail the turn as for every other effect.
local function reject(code, message)
    return { completed = true, rejected = code .. ": " .. message }
end

function control_handlers.control_forms(ctx, op)
    if type(op.forms) ~= "table" or #op.forms == 0 then
        return reject("invalid_request", "No form was provided.")
    end
    if #op.forms > 1 then
        return reject("one_form_per_turn", "Ask at most one form per turn.")
    end
    if type(op.turn_id) ~= "string" or op.turn_id == "" then
        return reject("no_turn", "A form can only be created during an agent turn.")
    end

    local created_artifacts = {}
    for _, item in ipairs(op.forms) do
        if type(item) ~= "table" then
            return reject("invalid_request", "Invalid form operation.")
        end
        local def, def_errors = definition.normalize(item.definition)
        if not def then
            return reject("invalid_definition", "Invalid form definition:\n" .. definition.format_errors(def_errors))
        end
        if type(item.artifact_id) ~= "string" or not string.match(item.artifact_id, ARTIFACT_ID_PATTERN) then
            return reject("invalid_request", "Form artifact id is missing or invalid.")
        end
        if ctx.form_turn_id == op.turn_id then
            return reject("one_form_per_turn",
                "This turn already asked the user with a form. No second form was created; "
                    .. "wait for the answer to the first one.")
        end

        local content, content_err = form_artifact.build_content(def, form_artifact.STATE.ACTIVE)
        if not content then return nil, content_err end

        local record, create_err = tx.run(function(dbtx)
            local stored, store_err = control_handlers.store_artifact(ctx, {
                type = consts.ARTIFACT_TYPES.INLINE,
                title = def.title,
                content = content,
                content_type = consts.CONTENT_TYPES.JSON,
                display_type = consts.ARTIFACT_DISPLAY.INLINE,
                status = consts.ARTIFACT_STATUS.ACTIVE,
                instructions = false,
            }, { tx = dbtx, artifact_id = item.artifact_id })
            if not stored then return nil, store_err end
            if not stored.message_date then
                return nil, "Form artifact message date is unknown"
            end

            local _, meta_err = artifact_repo.update(stored.artifact_id, {
                meta_patch = {
                    [form_artifact.META_KEY] = form_artifact.new_meta({
                        turn_id = op.turn_id,
                        call_id = op.call_id,
                        tool_message_id = op.tool_message_id,
                        created_cursor = stored.message_date,
                    }),
                },
            }, { tx = dbtx })
            if meta_err then return nil, "Failed to bind form origin: " .. tostring(meta_err) end
            return stored
        end)
        if not record then
            return nil, "Failed to create form: " .. tostring(create_err)
        end

        ctx.form_turn_id = op.turn_id
        control_handlers.announce_artifact(ctx, record)
        table.insert(created_artifacts, {
            artifact_id = record.artifact_id,
            title = record.title,
            kind = record.kind
        })
    end

    return { completed = true, end_turn = true, created_artifacts = created_artifacts }
end

function control_handlers.control_context(ctx, op)
    if not op.context_operations then
        return nil, "No context operations provided"
    end

    if op.context_operations.public_meta then
        local session_data = ctx.reader:state()
        local current_meta = session_data.public_meta or {}
        local changed_public_meta = false

        if op.context_operations.public_meta.clear and type(op.context_operations.public_meta.clear) == "string" then
            local to_remove = {}
            for id, public_meta_item in pairs(current_meta) do
                if public_meta_item.type and public_meta_item.type == op.context_operations.public_meta.clear then
                    table.insert(to_remove, id)
                end
            end
            for _, id in ipairs(to_remove) do
                current_meta[id] = nil
                changed_public_meta = true
            end
        end

        if op.context_operations.public_meta.set and type(op.context_operations.public_meta.set) == "table" then
            for key, value in pairs(op.context_operations.public_meta.set) do
                current_meta[key] = value
                changed_public_meta = true
            end
        end

        if op.context_operations.public_meta.delete and type(op.context_operations.public_meta.delete) == "table" then
            for _, id in ipairs(op.context_operations.public_meta.delete) do
                if current_meta[id] then
                    current_meta[id] = nil
                    changed_public_meta = true
                end
            end
        end

        if changed_public_meta then
            local update_success, update_err = ctx.writer:update_meta({ public_meta = current_meta })
            if not update_success then
                return nil, "Failed to update public meta: " .. tostring(update_err)
            else
                local result = {}
                for id, data in pairs(current_meta) do
                    table.insert(result, {
                        id = data.id or id,
                        title = data.title,
                        url = data.url,
                        display_name = data.display_name
                    })
                end
                ctx.upstream:update_session({ public_meta = result })
            end
        end
    end

    if op.context_operations.session then
        if op.context_operations.session.set and type(op.context_operations.session.set) == "table" then
            for key, value in pairs(op.context_operations.session.set) do
                local set_success, set_err = ctx.writer:set_context(key, value)
                if not set_success then
                    return nil, "Failed to set session context: " .. tostring(set_err)
                end
            end
        end

        if op.context_operations.session.delete and type(op.context_operations.session.delete) == "table" then
            for _, key in ipairs(op.context_operations.session.delete) do
                local delete_success, delete_err = ctx.writer:delete_context(key)
                if not delete_success then
                    return nil, "Failed to delete session context: " .. tostring(delete_err)
                end
            end
        end
    end

    ctx.reader:reset()

    return { completed = true }
end

function control_handlers.control_memory(ctx, op)
    if not op.memory_operations then
        return nil, "No memory operations provided"
    end

    if op.memory_operations.clear then
        local clear_keys = {}
        if type(op.memory_operations.clear) == "string" then
            clear_keys = { op.memory_operations.clear }
        elseif type(op.memory_operations.clear) == "table" then
            clear_keys = op.memory_operations.clear
        end

        local contexts, err = ctx.reader:contexts():all()
        if err then
            return nil, err
        else
            for _, context in ipairs(contexts) do
                for _, clear_key in ipairs(clear_keys) do
                    if context.type == clear_key then
                        local delete_success, delete_err = ctx.writer:delete_session_context(context.id)
                        if not delete_success then
                            return nil, "Failed to clear memory: " .. tostring(delete_err)
                        end
                    end
                end
            end
        end
    end

    if op.memory_operations.add and type(op.memory_operations.add) == "table" then
        for _, mem_item in ipairs(op.memory_operations.add) do
            if mem_item.type and mem_item.text then
                local memory_id, err = ctx.writer:add_session_context(mem_item.type, mem_item.text)
                if not memory_id then
                    return nil, "Failed to add memory: " .. tostring(err)
                end
            end
        end
    end

    if op.memory_operations.delete and type(op.memory_operations.delete) == "table" then
        for _, mem_id in ipairs(op.memory_operations.delete) do
            local deleted, err = ctx.writer:delete_session_context(mem_id)
            if not deleted then
                return nil, "Failed to delete memory: " .. tostring(err)
            end
        end
    end

    return { completed = true }
end

function control_handlers.control_config(ctx, op)
    if not op.config_changes then
        return nil, "No config changes provided"
    end

    local session_data = ctx.reader:state()
    local current_config = session_data.config or {}
    local config_changed = false
    local agent_changed = false
    local model_changed = false
    local previous_agent = current_config.agent_id
    local previous_model = current_config.model

    if op.config_changes.agent then
        current_config.agent_id = op.config_changes.agent
        -- An agent switch resets the trait/tool overlays (they are agent-specific). Clear
        -- the persisted ones too so a restart does not re-apply a prior agent's overlay;
        -- a traits/tools change in the same directive is applied afterwards and overrides.
        current_config.active_traits = false
        current_config.active_tools = false
        config_changed = true
        agent_changed = true
    end

    if op.config_changes.model then
        current_config.model = op.config_changes.model
        config_changed = true
        model_changed = true
    end

    -- Perform agent/model switches before applying overlays: switch_to_agent resets the
    -- in-memory overlays, so a declarative overlay must land on the new agent afterwards.
    if agent_changed or model_changed then
        ctx.reader:reset()

        if agent_changed and not model_changed then
            -- Agent changed but no explicit model - use new agent's default model
            local switch_success, switch_err = ctx.agent_ctx:switch_to_agent(current_config.agent_id)

            if switch_success then
                -- Get the new agent's default model and update config
                local new_model = ctx.agent_ctx.current_model
                current_config.model = new_model
                ctx.config.model = new_model

                ctx.upstream:update_session({
                    agent = current_config.agent_id,
                    model = new_model
                })
            else
                return nil, "Failed to switch to agent: " .. (switch_err or "unknown error")
            end
        elseif agent_changed and model_changed then
            -- Both agent and model explicitly changed
            local switch_success, switch_err = ctx.agent_ctx:switch_to_agent(current_config.agent_id, {
                model = current_config.model
            })

            if not switch_success then
                return nil, "Failed to switch to agent with model: " .. (switch_err or "unknown error")
            end

            ctx.upstream:update_session({
                agent = current_config.agent_id,
                model = current_config.model
            })
        elseif model_changed then
            -- Only model changed
            local switch_success, switch_err = ctx.agent_ctx:switch_to_model(current_config.model)

            if not switch_success then
                return nil, "Failed to switch model: " .. (switch_err or "unknown error")
            end

            ctx.upstream:update_session({ model = current_config.model })
        end
    end

    -- Declarative active trait/tool overlays, applied after any agent switch so they land
    -- on the new agent, and persisted to session config so they survive a restart. They
    -- replace the agent's own set; an empty list clears, nil leaves unchanged.
    if op.config_changes.traits ~= nil then
        ctx.agent_ctx:set_active_traits(op.config_changes.traits)
        current_config.active_traits = op.config_changes.traits
        config_changed = true
    end
    if op.config_changes.tools ~= nil then
        ctx.agent_ctx:set_active_tools(op.config_changes.tools)
        current_config.active_tools = op.config_changes.tools
        config_changed = true
    end

    if config_changed then
        local success, err = ctx.writer:update_meta({ config = current_config })
        if not success then
            return nil, "Failed to update session config: " .. err
        end

        for k, v in pairs(current_config) do
            ctx.config[k] = v
        end

        -- Add system message if agent or model changed
        if agent_changed or model_changed then
            local change_parts = {}
            if agent_changed then
                table.insert(change_parts, string.format("agent: %s", current_config.agent_id))
            end
            if model_changed or (agent_changed and not model_changed) then
                table.insert(change_parts, string.format("model: %s", current_config.model))
            end

            local change_message = string.format("Configuration changed (%s)", table.concat(change_parts, ", "))
            ctx.writer:add_message(consts.MSG_TYPE.SYSTEM, change_message, {
                system_action = "config_change",
                previous_agent = previous_agent,
                new_agent = agent_changed and current_config.agent_id or nil,
                previous_model = previous_model,
                new_model = current_config.model
            })
            ctx.writer:add_message(consts.MSG_TYPE.DEVELOPER, change_message)
        end
    end

    return { completed = true }
end

return control_handlers
