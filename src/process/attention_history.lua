local json = require('json')
local time = require('time')
local read = require('attention_read')
local prompt_builder = require('prompt_builder')

local M = { TTL_SECONDS = 30 }
local ACTIONS = {
    ['wippy.agent.tools:ui_action_highlight'] = true,
    ['wippy.agent.tools:ui_action_confirm'] = true,
    ['wippy.agent.tools:ui_action_select'] = true,
    ['wippy.agent.tools:ui_action_capture_visual'] = true,
}

local function copy(value)
    local out = {}
    for key, child in pairs(value or {}) do out[key] = child end
    return out
end

local function timestamp(value)
    if type(value) ~= 'string' then return nil end
    local parsed, err = time.parse(time.RFC3339, value)
    if err or not parsed then return nil end
    return parsed:unix()
end

local function expired(created, expires, now)
    local start = timestamp(created)
    local finish = timestamp(expires)
    if start == nil then return true end
    if start + M.TTL_SECONDS <= now then return true end
    return finish ~= nil and finish <= now
end

local function observation(message)
    local meta = message.metadata or {}
    if message.type ~= 'function' and message.type ~= 'private_function' then return nil end
    if not read.is_read(meta.registry_id) or meta.status ~= 'success' then return nil end
    local result = meta.result
    if type(result) ~= 'table' then return nil end
    if result.schema == 'wippy.attention.model.v1' and result.status == 'inspected' then return result end
    if meta.registry_id == 'wippy.agent.tools:attention_inspect'
        and result.schema == 'wippy.ui-action.v1' and type(result.inspection) == 'table' then
        local value = copy(result.inspection)
        value.host = result.host_instance_id
        return value
    end
    return nil
end

local function supported_attachment(attachment)
    return attachment.kind == 'wippy.attention' and type(attachment.version) == 'number'
        and attachment.version >= 1 and attachment.version <= 4 and attachment.version % 1 == 0
        or attachment.kind == 'wippy.attention.visual' and attachment.version == 1
end

-- Only the model view loses automatic context. The immutable acceptance payload
-- remains in storage, including hashes needed to recognize an identical retry.
function M.prepare(messages, now)
    local latest_user, fresh_read = 0, false
    for index, message in ipairs(messages) do
        if message.type == 'user' then latest_user = index end
    end
    local latest_query, latest_revision, observations, latest_action = {}, {}, {}, 0
    for index, message in ipairs(messages) do
        local metadata = message.metadata or {}
        if index > latest_user and (message.type == 'function' or message.type == 'private_function')
            and ACTIONS[metadata.registry_id] and metadata.status == 'success' then latest_action = index end
        local value = observation(message)
        if value then
            observations[index] = value
            local args = message.data
            if type(args) == 'string' then args = json.decode(args :: string) end
            local key = message.metadata.registry_id .. ':' .. read.canonical(args or {})
            value = copy(value)
            value.query_key = key
            observations[index] = value
            if index > latest_user and not expired(value.measured_at, nil, now) then
                latest_query[key] = index
                if type(value.host) == 'string' and type(value.revisions) == 'table' then
                    latest_revision[value.host] = read.canonical(value.revisions)
                end
                if value.outcome == 'ok' or value.outcome == 'partial' or value.outcome == 'empty' then fresh_read = true end
            end
        end
    end
    local projected, updates = {}, {}
    for index, message in ipairs(messages) do
        local meta = message.metadata or {}
        local next_message = message
        local value, reason = observations[index], nil
        if value and (meta.stale == nil or meta.stale == false) then
            if index < latest_user then reason = 'Attention observation belongs to an earlier user turn.'
            elseif expired(value.measured_at, nil, now) then reason = 'Attention observation expired.'
            elseif index < latest_action then reason = 'A browser interaction ended the validity of this observation.'
            elseif latest_query[value.query_key] and latest_query[value.query_key] ~= index then reason = 'A newer Attention observation replaced this query.'
            elseif type(value.host) == 'string' and latest_revision[value.host] ~= nil
                and type(value.revisions) == 'table' and read.canonical(value.revisions) ~= latest_revision[value.host] then
                reason = 'The observed interface revision changed.'
            end
        end
        if reason then
            next_message = copy(message)
            next_message.metadata = copy(meta)
            next_message.metadata.stale = reason
            updates[#updates + 1] = { message_id = message.message_id, stale = reason }
        end
        if message.type == 'user' and type(meta.context_attachments) == 'table' then
            local kept, removed = {}, false
            for _, attachment in ipairs(meta.context_attachments) do
                if supported_attachment(attachment) and (index < latest_user or fresh_read or latest_action > index
                    or expired(attachment.created_at, attachment.expires_at, now)) then removed = true
                else kept[#kept + 1] = attachment end
            end
            if removed then
                next_message = copy(next_message)
                next_message.metadata = copy(next_message.metadata)
                next_message.metadata.context_attachments = kept
            end
        end
        projected[#projected + 1] = next_message
    end
    return projected, updates
end

-- This Session Attention hook runs before prompt construction. It reuses the
-- existing reader, metadata writer and stale-result rendering without changing
-- generic prompt, provider or agent lifecycle contracts.
function M.build(context, options)
    local messages, err = context.reader:messages():from_checkpoint():all()
    if err then return nil, 'Failed to load messages: ' .. err end
    local projected, updates = M.prepare(messages, time.now():unix())
    for _, update in ipairs(updates) do
        local saved, save_err = context.writer:update_message_meta(update.message_id, { stale = update.stale })
        if not saved then return nil, save_err or 'Attention observation withdrawal failed' end
    end
    local adapter = setmetatable({}, { __index = function(_, key)
        if key == 'messages' then return function()
            local query = {}
            function query:from_checkpoint() return self end
            function query:all() return projected end
            return query
        end end
        return function(_, ...) return context.reader[key](context.reader, ...) end
    end })
    return prompt_builder.from_session(adapter, options)
end

return M
