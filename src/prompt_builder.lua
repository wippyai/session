local json = require("json")
local consts = require("consts")
local contract = require("contract")
local fs = require("fs")
local base64 = require("base64")
local hash = require("hash")
local time = require("time")
local input_metadata = require("input_metadata")

type BuildOptions = {
    include_contexts: boolean?,
    include_files: boolean?,
    include_context_attachments: boolean?,
    context_attachment_max_bytes: number?,
    visual_resolver: any?,
    file_resolver: any?,
    upload_repo: any?,
    now: any?,
    cache_markers: boolean?,
    input_overrides: table?,
}

type VisualRequest = {
    reference: { kind: string, opaque_id: string },
    media: { content_type: string, content_bytes: number },
}

local prompt_builder = {
    _prompt = require("prompt"),
    _context_attachments = require("context_attachments"),
    _contract = contract,
    _fs = fs,
}

local FILE_PROVIDER_CONTRACT = "wippy.session:file_provider"
local CONTENT_PROVIDER_CONTRACT = "userspace.contract:content_provider"
local UPLOAD_CONTENT_PROVIDER = "userspace.uploads:content_provider"
local VISUAL_MAX_BYTES = 5 * 1024 * 1024

local function file_not_expired(value)
    if value == nil then
        return true
    end
    if type(value) == "number" then
        return value > time.now():unix()
    end
    if type(value) ~= "string" or value == "" then
        return false
    end
    local ok, expires = pcall(time.parse, time.RFC3339, value)
    return ok == true and expires ~= nil and expires:unix() > time.now():unix()
end

local function upload_session_matches(upload, session_id)
    if type(upload) ~= "table" then
        return false
    end
    local metadata = type(upload.metadata) == "table" and upload.metadata or {}
    local bound_session = upload.session_id or metadata.session_id
    return bound_session == nil or bound_session == session_id
end

local function upload_not_expired(upload)
    local metadata = type(upload) == "table" and type(upload.metadata) == "table" and upload.metadata or {}
    return file_not_expired(upload and (upload.expires_at or metadata.expires_at))
end

local function resolve_file_via_contract(file_uuid)
    local definition, get_err = prompt_builder._contract.get(FILE_PROVIDER_CONTRACT)
    if get_err or not definition then
        return nil
    end
    local implementations, implementations_err = definition:implementations()
    if implementations_err or type(implementations) ~= "table" or #implementations == 0 then
        return nil
    end
    local instance, open_err = definition:open()
    if open_err or not instance then
        return nil
    end
    local ok, info, info_err = pcall(function()
        return instance:get_info({ file_uuid = file_uuid })
    end)
    if not ok or info_err or type(info) ~= "table" then
        return nil
    end
    return info
end

local function resolve_file(file_uuid, options)
    local via_contract = resolve_file_via_contract(file_uuid)
    if via_contract then
        return via_contract
    end
    local resolver = options.file_resolver or options.file_lookup
    if type(resolver) == "function" then
        local ok, upload, resolve_err = pcall(resolver, file_uuid)
        if ok and not resolve_err and type(upload) == "table" then
            return upload
        end
    end
    if type(options.upload_repo) == "table" and type(options.upload_repo.get) == "function" then
        local ok, upload, upload_err = pcall(options.upload_repo.get, file_uuid)
        if ok and not upload_err and type(upload) == "table" then
            return upload
        end
    end
    return nil
end

local function close_file(file)
    pcall(function()
        file:close()
    end)
end

local function read_exact(file, expected_bytes)
    local parts = {}
    local total = 0
    while total < expected_bytes do
        local chunk, read_err = file:read(math.min(64 * 1024, expected_bytes - total))
        if type(chunk) == "string" and #chunk > 0 then
            table.insert(parts, chunk)
            total = total + #chunk
        end
        if read_err and total < expected_bytes then
            return nil
        end
        if type(chunk) ~= "string" or #chunk == 0 then
            break
        end
    end
    if total ~= expected_bytes then
        return nil
    end
    return table.concat(parts)
end

local function authorized_file_info(file_uuid)
    if type(file_uuid) ~= "string" or file_uuid == "" then
        return nil
    end
    local definition, get_err = prompt_builder._contract.get(CONTENT_PROVIDER_CONTRACT)
    if get_err or not definition then
        return nil
    end
    local scoped, context_err = definition:with_context({
        upload_id = file_uuid,
    })
    if context_err or not scoped then
        return nil
    end
    local instance, open_err = scoped:open(UPLOAD_CONTENT_PROVIDER)
    if open_err or not instance then
        return nil
    end
    local ok, info, info_err = pcall(function()
        return instance:get_info()
    end)
    if not ok or info_err or type(info) ~= "table"
        or type(info.content_type) ~= "string"
        or info.content_type == ""
        or type(info.size) ~= "number"
        or info.size < 0
        or type(info.storage_id) ~= "string"
        or info.storage_id == ""
        or type(info.storage_path) ~= "string"
        or info.storage_path == ""
        or not file_not_expired(info.expires_at) then
        return nil
    end

    return info
end

local function authorized_visual_info(request: VisualRequest)
    if type(request) ~= "table"
        or type(request.reference) ~= "table"
        or request.reference.kind ~= "upload"
        or type(request.reference.opaque_id) ~= "string"
        or type(request.media) ~= "table"
        or type(request.media.content_bytes) ~= "number"
        or request.media.content_bytes < 1
        or request.media.content_bytes > VISUAL_MAX_BYTES
        or request.media.content_type ~= "image/png" and request.media.content_type ~= "image/webp" then
        return nil
    end

    local info = authorized_file_info(request.reference.opaque_id)
    if not info
        or info.content_type ~= request.media.content_type
        or info.size ~= request.media.content_bytes then
        return nil
    end
    return info
end

local function authorize_visual_via_contract(request: VisualRequest)
    return authorized_visual_info(request) ~= nil
end

local function resolve_visual_via_contract(request: VisualRequest)
    local info: any = authorized_visual_info(request)
    if not info then
        return nil
    end
    local storage_id = info.storage_id
    local storage_path = info.storage_path
    if type(storage_id) ~= "string" or type(storage_path) ~= "string" then
        return nil
    end

    local storage, storage_err = prompt_builder._fs.get(storage_id)
    if storage_err or not storage then
        return nil
    end
    local file, file_err = storage:open(storage_path, "r")
    if file_err or not file then
        return nil
    end
    local stat, stat_err = file:stat()
    if stat_err or type(stat) ~= "table" or stat.size ~= request.media.content_bytes then
        close_file(file)
        return nil
    end
    local data = read_exact(file, request.media.content_bytes)
    local final_stat, final_stat_err = file:stat()
    close_file(file)
    if not data or final_stat_err or type(final_stat) ~= "table"
        or final_stat.size ~= request.media.content_bytes then
        return nil
    end
    return {
        data = data,
        content_type = info.content_type,
    }
end

prompt_builder._resolve_file = resolve_file
prompt_builder._authorize_file = function(file_uuid, actor_id, session_id)
    if type(actor_id) ~= "string" or actor_id == "" then
        return false
    end
    local upload = resolve_file_via_contract(file_uuid)
    if type(upload) ~= "table" or upload.user_id ~= actor_id
        or not upload_session_matches(upload, session_id)
        or not upload_not_expired(upload) then
        return false
    end
    local info = authorized_file_info(file_uuid)
    if not info then
        return false
    end
    return true
end

function prompt_builder.validate_prepared_file(prepared_file, actor_id, session_id)
    if type(prepared_file) ~= "table"
        or type(actor_id) ~= "string" or actor_id == ""
        or type(session_id) ~= "string" or session_id == "" then
        return false, "prepared visual identity is invalid"
    end
    if type(prepared_file.uuid) ~= "string" or prepared_file.uuid == ""
        or type(prepared_file.name) ~= "string" or prepared_file.name == ""
        or type(prepared_file.mime_type) ~= "string"
        or prepared_file.mime_type ~= "image/png" and prepared_file.mime_type ~= "image/webp"
        or type(prepared_file.byte_size) ~= "number"
        or prepared_file.byte_size % 1 ~= 0
        or prepared_file.byte_size < 1
        or prepared_file.byte_size > VISUAL_MAX_BYTES
        or type(prepared_file.sha256) ~= "string"
        or #prepared_file.sha256 ~= 71
        or string.match(prepared_file.sha256, "^sha256:[a-f0-9]+$") == nil then
        return false, "prepared visual identity is invalid"
    end
    local upload = resolve_file_via_contract(prepared_file.uuid)
    if type(upload) ~= "table" or upload.user_id ~= actor_id
        or not upload_session_matches(upload, session_id)
        or not upload_not_expired(upload) then
        return false, "prepared visual is not owned by the session user"
    end
    local info = authorized_file_info(prepared_file.uuid)
    if not info
        or prepared_file.mime_type ~= upload.mime_type
        or prepared_file.mime_type ~= info.content_type
        or prepared_file.byte_size ~= upload.size
        or prepared_file.byte_size ~= info.size then
        return false, "prepared visual metadata does not match the upload"
    end
    local filename = type(upload.metadata) == "table" and upload.metadata.filename or nil
    if type(filename) == "string" and filename ~= "" and filename ~= prepared_file.name then
        return false, "prepared visual filename does not match the upload"
    end
    local visual_request: VisualRequest = {
        reference = {
            kind = "upload",
            opaque_id = prepared_file.uuid :: string,
        },
        media = {
            content_type = prepared_file.mime_type :: string,
            content_bytes = prepared_file.byte_size :: number,
        },
    }
    local resolved = resolve_visual_via_contract(visual_request)
    if type(resolved) ~= "table"
        or type(resolved.data) ~= "string"
        or #resolved.data ~= prepared_file.byte_size
        or resolved.content_type ~= prepared_file.mime_type then
        return false, "prepared visual content could not be resolved"
    end
    local digest, digest_err = hash.sha256(resolved.data)
    if digest_err or prepared_file.sha256 ~= "sha256:" .. tostring(digest) then
        return false, "prepared visual hash does not match the upload"
    end
    return true, nil
end
prompt_builder._authorize_visual = authorize_visual_via_contract
prompt_builder._resolve_visual = resolve_visual_via_contract

local function resolve_message_image(file_uuid, upload, options)
    if type(upload) ~= "table"
        or upload.mime_type ~= "image/png" and upload.mime_type ~= "image/webp" then
        return nil
    end
    if type(upload.size) ~= "number" or upload.size < 1 or upload.size > VISUAL_MAX_BYTES then
        return nil, "ATTACHED_IMAGE_INVALID"
    end
    local resolver = options.visual_resolver or prompt_builder._resolve_visual
    local ok, resolved = pcall(resolver, {
        reference = {
            kind = "upload",
            opaque_id = file_uuid,
        },
        media = {
            content_type = upload.mime_type,
            content_bytes = upload.size,
        },
    })
    if not ok or type(resolved) ~= "table"
        or type(resolved.data) ~= "string"
        or resolved.content_type ~= upload.mime_type
        or #resolved.data ~= upload.size
        or #resolved.data > VISUAL_MAX_BYTES then
        return nil, "ATTACHED_IMAGE_RESOLUTION_FAILED"
    end
    local resolved_data = resolved.data :: string
    local resolved_content_type = resolved.content_type :: string
    local encoded, encode_err = base64.encode(resolved_data)
    if encode_err or type(encoded) ~= "string" or encoded == "" then
        return nil, "ATTACHED_IMAGE_ENCODING_FAILED"
    end
    return prompt_builder._prompt.image_base64(resolved_content_type, encoded)
end

function prompt_builder.build(messages, contexts, session_meta, options)
    if not messages then
        return nil, "Messages are required"
    end

    options = options or {}
    local include_contexts = options.include_contexts ~= false
    local include_files = options.include_files ~= false
    local include_context_attachments = options.include_context_attachments ~= false
    local cache_markers = options.cache_markers ~= false

    if options.input_overrides and #options.input_overrides > 0 then
        local overrides = {}
        for _, update in ipairs(options.input_overrides) do overrides[update.message_id] = update.metadata end
        local preview = {}
        for _, message in ipairs(messages) do
            local override = overrides[message.message_id]
            if override then
                local copy, metadata = {}, {}
                for key, value in pairs(message) do copy[key] = value end
                for key, value in pairs(message.metadata or {}) do metadata[key] = value end
                for key, value in pairs(override) do metadata[key] = value end
                copy.metadata = metadata
                preview[#preview + 1] = copy
            else
                preview[#preview + 1] = message
            end
        end
        messages = preview
    end
    local builder = prompt_builder._prompt.new()

    for _, msg in ipairs(messages) do
        local valid, validation_err = input_metadata.validate(msg)
        if not valid then
            return nil, "Malformed steering metadata on message " .. tostring(msg.message_id)
                .. ": " .. tostring(validation_err)
        end
    end

    if include_contexts and contexts and #contexts > 0 then
        local memory_text = "Session context memory:\n\n"
        for _, context in ipairs(contexts) do
            memory_text = memory_text .. "## " .. context.type .. "\n" .. context.text .. "\n\n"
        end
        builder:add_system(memory_text)

        if cache_markers then
            builder:add_cache_marker("context_memories")
        end
    end

    local anchored, message_ids = {}, {}
    for _, msg in ipairs(messages) do
        local input = (msg.metadata or {}).input
        if not (msg.type == consts.MSG_TYPE.USER and type(input) == "table") then
            message_ids[msg.message_id] = true
        end
    end
    for _, msg in ipairs(messages) do
        local input = (msg.metadata or {}).input
        if msg.type == consts.MSG_TYPE.USER and type(input) == "table" and input.state == "applied" then
            local anchor = input.after_message_id
            if not anchor or not message_ids[anchor] then anchor = "" end
            anchored[anchor] = anchored[anchor] or {}
            table.insert(anchored[anchor], msg)
        end
    end

    local function add_message(msg, render_steering)
        local metadata: table = msg.metadata or {}

        local input = metadata.input
        if not render_steering and msg.type == consts.MSG_TYPE.USER and type(input) == "table" then
            return
        end

        if msg.type == consts.MSG_TYPE.SYSTEM then
            -- for internal use only, use developer role for ongoing system messages
        elseif msg.type == consts.MSG_TYPE.USER then
            local user_parts = { prompt_builder._prompt.text(msg.data :: string) }
            if include_context_attachments and metadata.context_attachments then
                local required, required_count, required_versions = {}, 0, {}
                for _, attachment in ipairs(metadata.context_attachments) do
                    if attachment.kind == 'wippy.attention'
                        and type(attachment.version) == 'number'
                        and attachment.version >= 1 and attachment.version <= 4
                        and attachment.version % 1 == 0 then
                        required[attachment.attachment_id] = true
                        required_versions[attachment.version] = true
                        required_count = required_count + 1
                    end
                end
                for version in pairs(required_versions) do
                    local ok, supported = pcall(prompt_builder._context_attachments.supports, 'wippy.attention', version)
                    if not ok or supported ~= true then return nil, 'REQUIRED_CONTEXT_RENDER_UNAVAILABLE' end
                end
                local render_ok, attachment_parts, diagnostics = pcall(prompt_builder._context_attachments.render,
                    metadata.context_attachments,
                    {
                        max_bytes = options.context_attachment_max_bytes,
                        session_id = session_meta and session_meta.session_id,
                        visual_resolver = options.visual_resolver or prompt_builder._resolve_visual,
                        now = options.now,
                    }
                )
                if not render_ok or type(attachment_parts) ~= 'table' then
                    return nil, 'CONTEXT_RENDER_FAILED'
                end
                if required_count > 0 then
                    if #attachment_parts == 0 then return nil, 'REQUIRED_CONTEXT_RENDER_FAILED' end
                    for _, diagnostic in ipairs(diagnostics or {}) do
                        if required[diagnostic.attachment_id] then return nil, 'REQUIRED_CONTEXT_RENDER_FAILED' end
                    end
                end
                for _, part in ipairs(attachment_parts) do
                    table.insert(user_parts, part)
                end
            end
            builder:add_message(prompt_builder._prompt.ROLE.USER, user_parts)

            if include_files and metadata.file_uuids and #metadata.file_uuids > 0 then
                local file_info = {}
                for _, file_uuid in ipairs(metadata.file_uuids) do
                    if type(file_uuid) == "string" then
                        local upload = prompt_builder._resolve_file(file_uuid, options)
                        local image_part, image_err = resolve_message_image(file_uuid, upload, options :: BuildOptions)
                        if image_err then
                            return nil, image_err
                        end
                        if image_part then
                            builder:add_message(prompt_builder._prompt.ROLE.USER, { image_part })
                        end
                        table.insert(file_info, {
                            filename = upload and upload.metadata and upload.metadata.filename or "Unknown filename",
                            size = upload and upload.size or 0,
                            type = upload and upload.mime_type or "Unknown type",
                            uuid = file_uuid
                        })
                    end
                end

                if #file_info > 0 then
                    local files_text = "User attached the following files:\n"
                    for _, file in ipairs(file_info) do
                        files_text = files_text .. string.format(
                            "- %s (Type: %s, Size: %d bytes, ID: %s)\n",
                            file.filename, file.type, file.size, file.uuid
                        )
                    end
                    builder:add_developer(files_text)
                end
            end

            if cache_markers and metadata.last_checkpoint then
                builder:add_cache_marker("checkpoint_" .. msg.message_id)
            end
        elseif msg.type == consts.MSG_TYPE.ASSISTANT then
            -- Always use add_assistant and let prompt library handle thinking blocks internally
            builder:add_assistant(msg.data :: string, metadata)
        elseif msg.type == consts.MSG_TYPE.DEVELOPER then
            builder:add_developer(msg.data :: string, metadata)
        elseif
            msg.type == consts.MSG_TYPE.FUNCTION
            or msg.type == consts.MSG_TYPE.PRIVATE_FUNCTION
            or msg.type == consts.MSG_TYPE.DELEGATION
        then
            local func_name = tostring(metadata.function_name)
            if func_name ~= "" and metadata.status then
                local args = msg.data
                if type(args) == "string" then
                    local parsed, parse_err = json.decode(args)
                    if not parse_err then
                        args = parsed
                    end
                end

                local llm_call_id = tostring(metadata.call_id or msg.message_id)
                local opts: {provider_metadata: table?}? = nil
                if type(metadata.provider_metadata) == "table" then
                    opts = { provider_metadata = metadata.provider_metadata }
                end
                builder:add_function_call(func_name, args :: string, llm_call_id, opts)

                if metadata.status == consts.FUNC_STATUS.PENDING then
                    builder:add_function_result(func_name, "incomplete", llm_call_id)
                elseif metadata.status == consts.FUNC_STATUS.SUCCESS or
                    metadata.status == consts.FUNC_STATUS.ERROR or
                    metadata.status == consts.FUNC_STATUS.CANCELLED then
                    -- A RESULT THAT HAS SINCE STOPPED BEING TRUE.
                    --
                    -- The conversation is rebuilt from these rows on every turn, so a tool
                    -- result keeps being re-sent long after the thing it described has moved
                    -- on. Usually that is right. It is the opposite when the result carries an
                    -- IMAGE: the image is re-sent as a vision part every turn, and the model
                    -- sees a picture of something that has since changed, with nothing
                    -- attached to say so. It reads as perception rather than as a record with
                    -- a date on it, and a model will answer from it without calling anything.
                    --
                    -- Only the tool that produced a result knows when it expires, and it
                    -- cannot reach a prompt assembled here. So the producer marks its own row
                    -- and this honours the mark.
                    --
                    -- The row is REPLACED, never dropped: providers reject a function call
                    -- with no matching result, so the pair has to survive. Replacing the
                    -- content is also what removes the image, since the image only exists
                    -- because it is encoded in this content.
                    local stale = metadata.stale
                    if stale ~= nil and stale ~= false then
                        local why = type(stale) == "string" and stale or ""
                        builder:add_function_result(
                            func_name,
                            "STALE INFO: this result was withdrawn by the tool that produced " ..
                            "it and no longer describes the current state." ..
                            (why ~= "" and (" " .. why) or "") ..
                            " Do not answer from it. Call the tool again if you need this.",
                            llm_call_id)
                    else
                        local result_content = metadata.result
                        if type(result_content) == "table" then
                            result_content = json.encode(result_content)
                        elseif result_content == nil then
                            result_content = "nil"
                        else
                            result_content = tostring(result_content)
                        end
                        builder:add_function_result(func_name, tostring(result_content), llm_call_id)
                    end
                end
            end
        elseif msg.type == consts.MSG_TYPE.ARTIFACT then
            if msg.data and msg.data ~= "" then
                builder:add_developer("Artifact: " .. msg.data, metadata)
            end
        end
    end

    local function add_anchored(anchor)
        local rows = anchored[anchor or ""]
        if rows then
            table.sort(rows, function(a, b)
                if a.date ~= b.date then return tostring(a.date or "") < tostring(b.date or "") end
                return tostring(a.message_id) < tostring(b.message_id)
            end)
            for _, row in ipairs(rows) do
                local _, render_err = add_message(row, true)
                if render_err then return render_err end
            end
            anchored[anchor or ""] = nil
        end
        return nil
    end

    -- add_message returns an error when required context cannot be rendered;
    -- the whole prompt fails closed rather than dropping that context.
    local anchored_err = add_anchored("")
    if anchored_err then return nil, anchored_err end
    for _, msg in ipairs(messages) do
        local metadata = msg.metadata or {}
        local input = metadata.input
        if not (msg.type == consts.MSG_TYPE.USER and type(input) == "table") then
            local _, render_err = add_message(msg)
            if render_err then return nil, render_err end
            anchored_err = add_anchored(msg.message_id)
            if anchored_err then return nil, anchored_err end
        end
    end
    -- A ROLLING BREAKPOINT ON THE HISTORY TAIL.
    --
    -- The prompt is rebuilt from the message rows on every agent step, and the only
    -- markers were the context memories and the last checkpoint. Everything after the
    -- checkpoint -- every tool call and result of the current turn -- was therefore sent
    -- uncached on every step. Marking the end of the history lets a supported provider
    -- reuse the unchanged prefix on the next step. The new suffix is a cache write;
    -- changed or expired prefixes can still miss.
    --
    -- Provider mappers deduplicate and cap breakpoints while reserving a slot for the
    -- latest eligible history boundary. Providers without explicit caching ignore markers.
    if cache_markers and #messages > 0 then
        builder:add_cache_marker("history_tail")
    end

    return builder, nil
end

prompt_builder.CHECKPOINT_RESUME_NOTE = "The conversation resumed from a checkpoint. Everything before this point is "
    .. "summarized in the session context memory above. Continue the current task from the latest messages below."

local function anchors_on_agent_message(session: any, messages: any): boolean
    if type(session.get_context) ~= "function" then
        return false
    end
    local checkpoint_id = session:get_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID)
    local first = messages[1]
    if not checkpoint_id or not first or first.message_id ~= checkpoint_id then
        return false
    end
    return first.type ~= consts.MSG_TYPE.USER and first.type ~= consts.MSG_TYPE.DEVELOPER
end

function prompt_builder.from_session(session, options)
    if not session then
        return nil, "Session reader is required"
    end

    local messages, err = session:messages():from_checkpoint():all()
    if err then
        return nil, "Failed to load messages: " .. err
    end

    if anchors_on_agent_message(session, messages) then
        table.insert(messages, 1, {
            message_id = "checkpoint-resume:" .. tostring(messages[1].message_id),
            type = consts.MSG_TYPE.DEVELOPER,
            data = prompt_builder.CHECKPOINT_RESUME_NOTE,
            metadata = {}
        })
    end

    local contexts, err = session:contexts():all()
    if err then
        return nil, "Failed to load contexts: " .. err
    end

    local session_meta = session:state()

    return prompt_builder.build(messages, contexts, session_meta, options)
end

return prompt_builder
