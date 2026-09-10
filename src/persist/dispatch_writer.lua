local sql = require('sql')
local json = require('json')
local time = require('time')
local dispatches = require('dispatch_repo')

local writer = {}
writer.__index = writer

local function decode(value)
    if type(value) == 'table' then return value end
    if type(value) == 'string' then return json.decode(value) or {} end
    return {}
end

function writer.new(base, root, operation_key)
    return setmetatable({ session_id = base.session_id, user_id = base.user_id,
        primary_context_id = base._session_data.primary_context_id, root = root,
        operation_key = operation_key, ordinal = 0 }, writer)
end

function writer:transaction(callback)
    local value, err = dispatches.transaction(callback, self.root.fence)
    if err then self.root.failure = self.root.failure or 'DISPATCH_HANDLER_FAILED' end
    return value, err
end

function writer:next_id()
    self.ordinal = self.ordinal + 1
    return dispatches.output_id(self.root.row.dispatch_id, self.operation_key, self.ordinal)
end

function writer:add_message(kind, content, metadata)
    if kind == 'user' then self.root.failure = 'DISPATCH_HANDLER_FAILED'; return nil, 'DISPATCH_INVALID_NESTED_USER' end
    metadata = metadata or {}
    local message_id = metadata.message_id or self:next_id()
    if kind == 'assistant' and not self.response_used then
        message_id = self.operation_key == 'root' and self.root.row.response_id
            or dispatches.output_id(self.root.row.dispatch_id, self.operation_key, 'response')
        self.response_used = true
    end
    local clean = {}
    for key, value in pairs(metadata) do if key ~= 'message_id' then clean[key] = value end end
    return self:transaction(function(tx)
        local existing, lookup_err = sql.builder.select('message_id', 'root_dispatch_id'):from('messages')
            :where('message_id = ?', message_id):limit(1):run_with(tx):query()
        if lookup_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        if existing[1] then
            if existing[1].root_dispatch_id ~= self.root.row.dispatch_id then return nil, 'DISPATCH_OUTPUT_CONFLICT' end
            return message_id
        end
        local stamp = time.now():format(time.RFC3339NANO)
        local _, err = sql.builder.insert('messages'):set_map({ message_id = message_id, session_id = self.session_id,
            type = kind, data = content or '', metadata = json.encode(clean), date = stamp,
            root_dispatch_id = self.root.row.dispatch_id }):run_with(tx):exec()
        if err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        local _, update_err = sql.builder.update('sessions'):set('last_message_date', stamp)
            :where('session_id = ?', self.session_id):run_with(tx):exec()
        if update_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        return message_id
    end)
end

function writer:update_message_meta(message_id, updates)
    return self:transaction(function(tx)
        local rows, err = sql.builder.select('metadata'):from('messages'):where('message_id = ?', message_id)
            :where('session_id = ?', self.session_id):where('root_dispatch_id = ?', self.root.row.dispatch_id):limit(1):run_with(tx):query()
        if err or not rows[1] then return nil, 'DISPATCH_OUTPUT_UNAVAILABLE' end
        local metadata = decode(rows[1].metadata)
        for key, value in pairs(updates) do metadata[key] = value end
        local _, write_err = sql.builder.update('messages'):set('metadata', json.encode(metadata))
            :where('message_id = ?', message_id):where('session_id = ?', self.session_id)
            :where('root_dispatch_id = ?', self.root.row.dispatch_id):run_with(tx):exec()
        if write_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        return true
    end)
end

function writer:add_function_call(name, arguments, metadata)
    metadata = metadata or {}
    metadata.function_name, metadata.status = name, 'pending'
    return self:add_message('function', type(arguments) == 'table' and json.encode(arguments) or arguments, metadata)
end

function writer:update_function_result(message_id, result, success, metadata)
    metadata = metadata or {}
    metadata.result, metadata.status = result, success and 'success' or 'error'
    return self:update_message_meta(message_id, metadata)
end

function writer:update_meta(updates)
    return self:transaction(function(tx)
        local query = sql.builder.update('sessions'):where('session_id = ?', self.session_id)
        for _, key in ipairs({ 'title', 'status', 'kind' }) do if updates[key] ~= nil then query = query:set(key, updates[key]) end end
        for _, key in ipairs({ 'meta', 'config', 'public_meta' }) do
            if updates[key] ~= nil then query = query:set(key, json.encode(updates[key])) end
        end
        query = query:set('last_message_date', time.now():format(time.RFC3339))
        local _, err = query:run_with(tx):exec()
        if err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        return true
    end)
end

function writer:update_title(title) return self:update_meta({ title = title }) end
function writer:update_status(status) return self:update_meta({ status = status }) end

function writer:create_artifact(artifact_id, kind, title, content, meta)
    return self:transaction(function(tx)
        local stamp = time.now():format(time.RFC3339)
        local _, err = sql.builder.insert('artifacts'):set_map({ artifact_id = artifact_id, session_id = self.session_id,
            user_id = self.user_id, kind = kind, title = title or '', content = content or '',
            meta = meta and json.encode(meta) or sql.as.null(), created_at = stamp, updated_at = stamp }):run_with(tx):exec()
        if err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        return artifact_id
    end)
end

function writer:update_artifact(artifact_id, updates)
    return self:transaction(function(tx)
        local query = sql.builder.update('artifacts'):where('artifact_id = ?', artifact_id):where('session_id = ?', self.session_id)
        for _, key in ipairs({ 'kind', 'title', 'content' }) do if updates[key] ~= nil then query = query:set(key, updates[key]) end end
        if updates.meta ~= nil then query = query:set('meta', type(updates.meta) == 'table' and json.encode(updates.meta) or updates.meta) end
        local result, err = query:set('updated_at', time.now():format(time.RFC3339)):run_with(tx):exec()
        if err or result.rows_affected ~= 1 then return nil, 'DISPATCH_OUTPUT_UNAVAILABLE' end
        return true
    end)
end

function writer:set_context(key, value)
    return self:transaction(function(tx)
        local rows, err = sql.builder.select('data'):from('contexts'):where('context_id = ?', self.primary_context_id):limit(1):run_with(tx):query()
        if err or not rows[1] then return nil, 'DISPATCH_OUTPUT_UNAVAILABLE' end
        local data = decode(rows[1].data)
        data[key] = value
        local _, update_err = sql.builder.update('contexts'):set('data', json.encode(data)):where('context_id = ?', self.primary_context_id):run_with(tx):exec()
        if update_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        return true
    end)
end

function writer:delete_context(key) return self:set_context(key, nil) end

function writer:add_session_context(kind, text, timestamp)
    local id = self:next_id()
    return self:transaction(function(tx)
        local _, err = sql.builder.insert('session_contexts'):set_map({ id = id, session_id = self.session_id,
            type = kind, text = text, time = timestamp or time.now():unix() }):run_with(tx):exec()
        if err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        return id
    end)
end

function writer:delete_session_context(id)
    return self:transaction(function(tx)
        local result, err = sql.builder.delete('session_contexts'):where('session_id = ?', self.session_id):where('id = ?', id):run_with(tx):exec()
        if err or result.rows_affected ~= 1 then return nil, 'DISPATCH_OUTPUT_UNAVAILABLE' end
        return true
    end)
end

function writer:delete_session_contexts_by_type(kind)
    return self:transaction(function(tx)
        local result, err = sql.builder.delete('session_contexts'):where('session_id = ?', self.session_id):where('type = ?', kind):run_with(tx):exec()
        if err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        return { deleted_count = result.rows_affected }
    end)
end

return writer
