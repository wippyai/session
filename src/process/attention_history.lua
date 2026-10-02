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
local LEGACY_INSPECT = 'wippy.agent.tools:attention_inspect'
local READ_KINDS = {
    ['wippy.agent.tools:attention_find_semantic'] = 'find',
    ['wippy.agent.tools:attention_find_css'] = 'find',
    ['wippy.agent.tools:attention_get_node'] = 'find',
    ['wippy.agent.tools:attention_get_tree'] = 'tree',
    ['wippy.agent.tools:attention_get_geometry'] = 'geometry',
    ['wippy.agent.tools:attention_hit_test'] = 'point',
    ['wippy.agent.tools:attention_get_cursor'] = 'cursor',
    ['wippy.agent.tools:attention_get_focus'] = 'focus',
    ['wippy.agent.tools:attention_get_selection'] = 'selection',
}
-- The revisions whose change withdraws an earlier read of each kind. Cursor, focus,
-- and selection reads have none: only a newer read of the same query replaces them.
local REVISION_RULES = {
    find = { 'tree' }, tree = { 'tree' }, geometry = { 'geometry' }, point = { 'tree', 'geometry' },
    cursor = {}, focus = {}, selection = {},
}
local ALL_REVISIONS = { 'tree', 'observation', 'geometry' }

local function is_read(registry_id)
    return READ_KINDS[registry_id] ~= nil or registry_id == LEGACY_INSPECT
end

-- A legacy attention_inspect row names its kind in args.operation.
local function read_kind(registry_id, args)
    if registry_id == LEGACY_INSPECT then
        local operation = type(args) == 'table' and args.operation or nil
        return REVISION_RULES[operation] and operation or nil
    end
    return READ_KINDS[registry_id]
end

local function revision_changed(value, latest)
    if type(value.revisions) ~= 'table' or type(latest) ~= 'table' then return false end
    for _, field in ipairs(REVISION_RULES[value.kind] or ALL_REVISIONS) do
        local own, newest = value.revisions[field], latest[field]
        if own ~= nil and newest ~= nil and read.canonical(own) ~= read.canonical(newest) then return true end
    end
    return false
end

local function copy(value)
    local out = {}
    for key, child in pairs(value or {}) do out[key] = child end
    return out
end

local function timestamp(value)
    if type(value) == 'number' then return value end
    if type(value) ~= 'string' then return nil end
    for _, layout in ipairs({ time.RFC3339NANO, time.RFC3339 }) do
        local ok, parsed, err = pcall(time.parse, layout, value)
        if ok and not err and parsed then return parsed:unix() end
    end
    return nil
end

-- Message dates come back from the database. SQLite returns the text Session
-- wrote, with its zone offset. Postgres keeps them in a `timestamp` column, which
-- drops the offset, and returns the writer's local wall clock with a "Z" suffix
-- (Postgres 16: written 18:08:42+02:00, read back 18:08:42Z). A "Z" row date is
-- therefore read as server-local wall-clock time; on a UTC server both readings
-- agree.
local WALL_CLOCK = '2006-01-02T15:04:05.999999999'

local function row_time(value)
    local wall = type(value) == 'string' and value:match('^(.+)Z$') or nil
    if not wall then return timestamp(value) end
    local ok, parsed, err = pcall(time.parse, WALL_CLOCK, wall, time.localtz)
    if ok and not err and parsed then return parsed:unix() end
    return nil
end

-- Lifetimes start at the server's row date. Client and Host clocks are never
-- compared with server time, so clock skew cannot expire or extend context.
local function expired(row_date, lifetime, now)
    local start = row_time(row_date)
    return start == nil or start + lifetime <= now
end

-- A shorter lifetime declared by the client still applies, measured as a duration
-- on the client's own clock.
local function attachment_lifetime(attachment)
    local created, expires = timestamp(attachment.created_at), timestamp(attachment.expires_at)
    if created and expires then return math.min(M.TTL_SECONDS, expires - created) end
    return M.TTL_SECONDS
end

local function observation(message)
    local meta = message.metadata or {}
    if message.type ~= 'function' and message.type ~= 'private_function' then return nil end
    if not is_read(meta.registry_id) or meta.status ~= 'success' then return nil end
    local result = meta.result
    if type(result) ~= 'table' then return nil end
    if result.schema == 'wippy.attention.model.v1' and result.status == 'inspected' then return result end
    if meta.registry_id == LEGACY_INSPECT
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
            value.kind = read_kind(message.metadata.registry_id, args)
            observations[index] = value
            if index > latest_user and not expired(message.date, M.TTL_SECONDS, now) then
                latest_query[key] = index
                if type(value.host) == 'string' and type(value.revisions) == 'table' then
                    local latest = latest_revision[value.host] or {}
                    for field, revision in pairs(value.revisions) do latest[field] = revision end
                    latest_revision[value.host] = latest
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
            elseif expired(message.date, M.TTL_SECONDS, now) then reason = 'Attention observation expired.'
            elseif index < latest_action then reason = 'A browser interaction ended the validity of this observation.'
            elseif latest_query[value.query_key] and latest_query[value.query_key] ~= index then reason = 'A newer Attention observation replaced this query.'
            elseif type(value.host) == 'string' and revision_changed(value, latest_revision[value.host]) then
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
                    or expired(message.date, attachment_lifetime(attachment), now)) then removed = true
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
