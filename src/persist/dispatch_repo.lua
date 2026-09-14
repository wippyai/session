local sql = require('sql')
local json = require('json')
local uuid = require('uuid')
local hash = require('hash')
local time = require('time')
local env = require('env')
local security = require('security')
local consts = require('consts')
local staging = require('context_staging_repo')

local repo = {}
repo._now = function() return time.now():unix() end
repo._stamp = function() return time.now():utc():format_rfc3339() end
repo.CODES = { DISPATCH_COMPLETED = true, DISPATCH_CANCELLED = true, DISPATCH_OWNER_LOST = true,
    DISPATCH_HANDLER_FAILED = true, DISPATCH_ENQUEUE_FAILED = true, DISPATCH_INTERRUPTED = true }

function repo.settings()
    local function bounded(id, fallback, low, high): number
        local raw = env.get('wippy.session.env:' .. id)
        local value = tonumber(raw)
        if not value or value % 1 ~= 0 or value < low or value > high then return fallback end
        return value :: number
    end
    local heartbeat = bounded('dispatch_heartbeat_seconds', 5, 1, 30)
    return { heartbeat = heartbeat, lease = math.max(heartbeat * 3, bounded('dispatch_owner_lease_seconds', 30, 3, 300)),
        page = bounded('dispatch_queue_page', 32, 1, 32) }
end

function repo.descriptor(row)
    if not row then return nil end
    return { version = 1, dispatch_id = row.dispatch_id, message_id = row.message_id,
        state = row.state, generation = row.generation, revision = row.revision,
        response_id = row.response_id, updated_at = row.updated_at,
        terminal_code = repo.CODES[row.terminal_code] and row.terminal_code or nil }
end

local function one(tx, table_name, field, value)
    local rows, err = sql.builder.select('*'):from(table_name):where(field .. ' = ?', value):limit(1):run_with(tx):query()
    if err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
    return rows[1]
end

local function authorized(tx, session_id)
    local actor = security.actor()
    if not actor or not security.can('write', 'session:' .. session_id) then return nil, 'DISPATCH_UNAUTHORIZED' end
    local session, err = one(tx, 'sessions', 'session_id', session_id)
    if err then return nil, err end
    if not session or session.user_id ~= actor:id() then return nil, 'DISPATCH_UNAUTHORIZED' end
    return session
end

function repo.check_fence(tx, fence)
    if type(fence) ~= 'table' then return nil, 'DISPATCH_FENCE_LOST' end
    local session, err = authorized(tx, fence.session_id)
    if not session then return nil, err end
    local owner, owner_err = one(tx, 'session_dispatch_owners', 'session_id', fence.session_id)
    local row, row_err = one(tx, 'message_dispatches', 'dispatch_id', fence.dispatch_id)
    if owner_err or row_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
    if not owner or not row or row.state ~= 'started' or row.session_id ~= fence.session_id
        or owner.actor_id ~= session.user_id or row.actor_id ~= session.user_id
        or owner.worker_id ~= fence.worker_id or row.worker_id ~= fence.worker_id
        or owner.generation ~= fence.generation or row.generation ~= fence.generation
        or owner.lease_expires_at <= repo._now() then return nil, 'DISPATCH_FENCE_LOST' end
    return row
end

function repo.transaction(callback, fence)
    local db, err = sql.get(consts.get_db_resource())
    if not db then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
    local tx
    tx, err = db:begin()
    if not tx then db:release(); return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
    -- Global order: staging guard, session owner, dispatch, business rows. Deletion uses the same guard.
    local locked, lock_err = staging.lock(tx)
    if not locked then tx:rollback(); db:release(); return nil, lock_err end
    if fence then
        local valid, fence_err = repo.check_fence(tx, fence)
        if not valid then tx:rollback(); db:release(); return nil, fence_err end
    end
    local ok, value, failure = pcall(callback, tx)
    if not ok or failure then tx:rollback(); db:release(); return nil, failure or 'DISPATCH_STORAGE_UNAVAILABLE' end
    local _, commit_err = tx:commit()
    if commit_err then tx:rollback(); db:release(); return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
    db:release()
    return value
end

function repo.enqueue_in_transaction(tx, message_id, session_id, request_id)
    local existing, lookup_err = one(tx, 'message_dispatches', 'message_id', message_id)
    if lookup_err or existing then return existing, lookup_err end
    local session, err = one(tx, 'sessions', 'session_id', session_id)
    if not session then return nil, err or 'DISPATCH_UNAUTHORIZED' end
    local owner, owner_err = one(tx, 'session_dispatch_owners', 'session_id', session_id)
    if owner_err then return nil, owner_err end
    local stamp = repo._stamp()
    if not owner then
        local _, insert_err = sql.builder.insert('session_dispatch_owners'):set_map({ session_id = session_id,
            actor_id = session.user_id, generation = 0, next_sequence = 0, lease_expires_at = 0, updated_at = stamp }):run_with(tx):exec()
        if insert_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        owner = { next_sequence = 0 }
    end
    local sequence = owner.next_sequence + 1
    local _, update_err = sql.builder.update('session_dispatch_owners'):set('next_sequence', sequence)
        :where('session_id = ?', session_id):run_with(tx):exec()
    if update_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
    local dispatch_id, response_id = uuid.v7(), uuid.v7()
    if not dispatch_id or not response_id then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
    local row = { dispatch_id = dispatch_id, message_id = message_id, session_id = session_id,
        actor_id = session.user_id, request_id = request_id, queue_sequence = sequence,
        state = 'queued', generation = 0, revision = 1, response_id = response_id,
        config_json = session.config or '{}', created_at = stamp, updated_at = stamp }
    local _, insert_err = sql.builder.insert('message_dispatches'):set_map(row):run_with(tx):exec()
    if insert_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
    local _, tag_err = sql.builder.update('messages'):set('root_dispatch_id', dispatch_id)
        :where('message_id = ?', message_id):run_with(tx):exec()
    if tag_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
    return row
end

function repo.get(session_id, message_id)
    return repo.transaction(function(tx)
        local session, err = authorized(tx, session_id)
        if not session then return nil, err end
        local row, row_err = one(tx, 'message_dispatches', 'message_id', message_id)
        if row and row.session_id ~= session_id then return nil, 'DISPATCH_UNAUTHORIZED' end
        return row, row_err
    end)
end

function repo.request_exists(session_id, request_id)
    if type(request_id) ~= 'string' or #request_id > 160 then return false end
    return repo.transaction(function(tx)
        local session, err = authorized(tx, session_id)
        if not session then return nil, err end
        local rows, query_err = sql.builder.select('message_id'):from('messages'):where('session_id = ?', session_id)
            :where('request_id = ?', request_id):limit(1):run_with(tx):query()
        if query_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        return rows[1] ~= nil
    end)
end

local function terminal(tx, row, state, code)
    if not repo.CODES[code] then return nil, 'DISPATCH_INVALID_STATE' end
    local stamp = repo._stamp()
    local _, err = sql.builder.update('message_dispatches'):set_map({ state = state, terminal_code = code,
        generation = math.max(1, row.generation), revision = row.revision + 1, updated_at = stamp, finished_at = stamp })
        :where('dispatch_id = ?', row.dispatch_id):run_with(tx):exec()
    if err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
    row.state, row.terminal_code, row.generation, row.revision, row.updated_at = state, code, math.max(1, row.generation), row.revision + 1, stamp
    if state ~= 'completed' then
        local messages, query_err = sql.builder.select('message_id', 'metadata'):from('messages')
            :where('root_dispatch_id = ?', row.dispatch_id):run_with(tx):query()
        if query_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        for _, message in ipairs(messages) do
            local metadata = type(message.metadata) == 'string' and json.decode(message.metadata) or nil
            if metadata and metadata.status == 'pending' then
                metadata.status, metadata.result = 'error', { code = code, message = 'Turn interrupted; external outcome may be unknown' }
                local _, write_err = sql.builder.update('messages'):set('metadata', json.encode(metadata))
                    :where('message_id = ?', message.message_id):run_with(tx):exec()
                if write_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
            end
        end
    end
    return row
end

local function interrupt_owner(tx, owner)
    local rows, err = sql.builder.select('*'):from('message_dispatches'):where('session_id = ?', owner.session_id)
        :where('state = ?', 'started'):limit(32):run_with(tx):query()
    if err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
    for _, row in ipairs(rows) do
        local done, terminal_err = terminal(tx, row :: { state: string, dispatch_id: string, generation: number, revision: number }, 'interrupted', 'DISPATCH_OWNER_LOST')
        if not done then return nil, terminal_err end
    end
    return true
end

function repo.acquire(session_id, worker_id)
    return repo.transaction(function(tx)
        local session, err = authorized(tx, session_id)
        if not session then return nil, err end
        local owner, owner_err = one(tx, 'session_dispatch_owners', 'session_id', session_id)
        if owner_err then return nil, owner_err end
        if owner and owner.worker_id ~= worker_id and owner.lease_expires_at > repo._now() then return nil, 'DISPATCH_OWNER_BUSY' end
        if owner and owner.worker_id == worker_id and owner.lease_expires_at > repo._now() then return owner end
        if owner and owner.worker_id then
            local interrupted, lost_err = interrupt_owner(tx, owner)
            if not interrupted then return nil, lost_err end
        end
        local next_owner = { session_id = session_id, actor_id = session.user_id, worker_id = worker_id,
            generation = owner and (owner.generation :: number) + 1 or 1, next_sequence = owner and owner.next_sequence or 0,
            lease_expires_at = repo._now() + repo.settings().lease, updated_at = repo._stamp() }
        local _, write_err
        if owner then _, write_err = sql.builder.update('session_dispatch_owners'):set_map(next_owner):where('session_id = ?', session_id):run_with(tx):exec()
        else _, write_err = sql.builder.insert('session_dispatch_owners'):set_map(next_owner):run_with(tx):exec() end
        if write_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        return next_owner
    end)
end

local function check_owner(tx, token)
    local session, auth_err = authorized(tx, token.session_id)
    if not session then return nil, auth_err end
    local owner, err = one(tx, 'session_dispatch_owners', 'session_id', token.session_id)
    if not owner then return nil, err or 'DISPATCH_FENCE_LOST' end
    if owner.actor_id ~= session.user_id or owner.worker_id ~= token.worker_id
        or owner.generation ~= token.generation or owner.lease_expires_at <= repo._now() then return nil, 'DISPATCH_FENCE_LOST' end
    return owner
end

function repo.heartbeat(token)
    return repo.transaction(function(tx)
        local owner, err = check_owner(tx, token)
        if not owner then return nil, err end
        local _, write_err = sql.builder.update('session_dispatch_owners'):set('lease_expires_at', repo._now() + repo.settings().lease)
            :set('updated_at', repo._stamp()):where('session_id = ?', token.session_id):run_with(tx):exec()
        if write_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        return true
    end)
end

function repo.claim(token)
    return repo.transaction(function(tx)
        local owner, err = check_owner(tx, token)
        if not owner then return nil, err end
        local active, active_err = sql.builder.select('dispatch_id'):from('message_dispatches')
            :where('session_id = ?', token.session_id):where('state = ?', 'started'):limit(1):run_with(tx):query()
        if active_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        if active[1] then return nil end
        local rows, query_err = sql.builder.select('*'):from('message_dispatches'):where('session_id = ?', token.session_id)
            :where('state = ?', 'queued'):order_by('queue_sequence ASC'):limit(1):run_with(tx):query()
        if query_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        local row = rows[1]
        if not row then return nil end
        local stamp = repo._stamp()
        local _, write_err = sql.builder.update('message_dispatches'):set_map({ state = 'started', worker_id = token.worker_id,
            generation = token.generation, revision = row.revision + 1, updated_at = stamp, started_at = stamp })
            :where('dispatch_id = ?', row.dispatch_id):where('state = ?', 'queued'):run_with(tx):exec()
        if write_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        row.state, row.worker_id, row.generation, row.revision, row.updated_at = 'started', token.worker_id, token.generation, row.revision + 1, stamp
        return row
    end)
end

function repo.valid(fence)
    if type(fence) ~= 'table' or type(fence.session_id) ~= 'string' then return nil, 'DISPATCH_FENCE_LOST' end
    local actor = security.actor()
    if not actor or not security.can('write', 'session:' .. fence.session_id) then return nil, 'DISPATCH_UNAUTHORIZED' end
    local db = sql.get(consts.get_db_resource())
    if not db then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
    -- One read statement observes a consistent owner/dispatch/session fence without taking the global write guard.
    local rows, err = sql.builder.select('d.*'):from('message_dispatches d')
        :join('session_dispatch_owners o ON o.session_id = d.session_id'):join('sessions s ON s.session_id = d.session_id')
        :where('d.dispatch_id = ?', fence.dispatch_id):where('d.session_id = ?', fence.session_id):where('d.state = ?', 'started')
        :where('s.user_id = ?', actor:id()):where('o.actor_id = s.user_id'):where('d.actor_id = s.user_id')
        :where('o.worker_id = ?', fence.worker_id):where('d.worker_id = ?', fence.worker_id)
        :where('o.generation = ?', fence.generation):where('d.generation = ?', fence.generation)
        :where('o.lease_expires_at > ?', repo._now()):limit(1):run_with(db):query()
    db:release()
    if err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
    return rows[1], not rows[1] and 'DISPATCH_FENCE_LOST' or nil
end

function repo.finish(fence, code)
    return repo.transaction(function(tx)
        local row, err = repo.check_fence(tx, fence)
        if not row then return nil, err end
        return terminal(tx, row, code == 'DISPATCH_COMPLETED' and 'completed' or 'interrupted', code)
    end)
end

function repo.release(token)
    return repo.transaction(function(tx)
        local session, err = authorized(tx, token.session_id)
        if not session then return nil, err end
        local owner, owner_err = one(tx, 'session_dispatch_owners', 'session_id', token.session_id)
        if not owner then return nil, owner_err end
        if owner.worker_id ~= token.worker_id or owner.generation ~= token.generation then return false end
        local ok, lost_err = interrupt_owner(tx, owner)
        if not ok then return nil, lost_err end
        local _, write_err = sql.builder.update('session_dispatch_owners'):set('worker_id', sql.as.null())
            :set('lease_expires_at', 0):where('session_id = ?', token.session_id):run_with(tx):exec()
        if write_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        return true
    end)
end

function repo.classify_expired()
    return repo.transaction(function(tx)
        local rows, err = sql.builder.select('*'):from('session_dispatch_owners'):where('lease_expires_at <= ?', repo._now())
            :where('worker_id IS NOT NULL'):order_by('lease_expires_at ASC'):limit(32):run_with(tx):query()
        if err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        for _, owner in ipairs(rows) do
            local ok, lost_err = interrupt_owner(tx, owner)
            if not ok then return nil, lost_err end
            local _, clear_err = sql.builder.update('session_dispatch_owners'):set('worker_id', sql.as.null())
                :where('session_id = ?', owner.session_id):run_with(tx):exec()
            if clear_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        end
        return #rows
    end)
end

function repo.snapshot(session_id, dispatch_ids)
    return repo.transaction(function(tx)
        local session, err = authorized(tx, session_id)
        if not session then return nil, err end
        local query = sql.builder.select('*'):from('message_dispatches'):where('session_id = ?', session_id)
        local page = repo.settings().page
        if dispatch_ids ~= nil then
            if type(dispatch_ids) ~= 'table' or #dispatch_ids < 1 or #dispatch_ids > 32 then return nil, 'DISPATCH_INVALID_QUERY' end
            local filters = {}
            for _, id in ipairs(dispatch_ids) do
                if type(id) ~= 'string' or #id ~= 36 or not string.match(id, '^[a-f0-9-]+$') then return nil, 'DISPATCH_INVALID_QUERY' end
                table.insert(filters, sql.builder.expr('dispatch_id = ?', id))
            end
            query = query:where(sql.builder.or_(filters))
            page = 32
        end
        local rows, query_err = query:order_by('queue_sequence DESC'):limit(page + 1):run_with(tx):query()
        if query_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        local result = {}
        for i, row in ipairs(rows) do if i <= page then table.insert(result, repo.descriptor(row)) end end
        return { version = 1, dispatches = result, has_more = #rows > page }
    end)
end

function repo.cancel(session_id, dispatch_id)
    return repo.transaction(function(tx)
        local session, err = authorized(tx, session_id)
        if not session then return nil, err end
        local row, lookup_err = one(tx, 'message_dispatches', 'dispatch_id', dispatch_id)
        if not row or row.session_id ~= session_id then return nil, lookup_err or 'DISPATCH_UNAUTHORIZED' end
        if row.state == 'queued' then return terminal(tx, row, 'cancelled', 'DISPATCH_CANCELLED') end
        if row.state == 'started' then return terminal(tx, row, 'interrupted', 'DISPATCH_CANCELLED') end
        return row
    end)
end

local function history_query(tx, root, columns, checkpoint_id)
    local query = sql.builder.select(table.unpack(columns))
        :from('messages m'):left_join('message_dispatches d ON d.dispatch_id = m.root_dispatch_id')
        :where('m.session_id = ?', root.session_id)
        :where('(d.queue_sequence <= ? OR (m.root_dispatch_id IS NULL AND m.message_id <= ?))', root.queue_sequence, root.message_id)
    if checkpoint_id ~= nil then
        local rows, err = sql.builder.select('m.message_id', 'm.date', 'd.queue_sequence')
            :from('messages m'):left_join('message_dispatches d ON d.dispatch_id = m.root_dispatch_id')
            :where('m.session_id = ?', root.session_id):where('m.message_id = ?', checkpoint_id):limit(1):run_with(tx):query()
        local checkpoint = rows and rows[1]
        if err or not checkpoint then return nil, 'DISPATCH_CHECKPOINT_UNAVAILABLE' end
        local sequence = checkpoint.queue_sequence or 0
        if sequence > root.queue_sequence then return nil, 'DISPATCH_CHECKPOINT_UNAVAILABLE' end
        query = query:where('(COALESCE(d.queue_sequence, 0) > ? OR (COALESCE(d.queue_sequence, 0) = ? AND (m.date > ? OR (m.date = ? AND m.message_id >= ?))))',
            sequence, sequence, checkpoint.date, checkpoint.date, checkpoint.message_id)
    end
    return query
end

function repo.history(fence, checkpoint_id)
    return repo.transaction(function(tx)
        local root, err = repo.check_fence(tx, fence)
        if not root then return nil, err end
        local query, bound_err = history_query(tx, root, { 'm.message_id', 'm.session_id', 'm.date', 'm.type', 'm.data', 'm.metadata' }, checkpoint_id)
        if not query then return nil, bound_err end
        local rows, query_err = query:order_by('COALESCE(d.queue_sequence, 0) DESC, m.date DESC, m.message_id DESC'):limit(500):run_with(tx):query()
        if query_err then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        local messages = {}
        for i = #rows, 1, -1 do
            local row = rows[i]
            row.metadata = type(row.metadata) == 'string' and json.decode(row.metadata) or {}
            table.insert(messages, row)
        end
        return messages
    end, fence)
end

function repo.history_count(fence, checkpoint_id)
    return repo.transaction(function(tx)
        local root, err = repo.check_fence(tx, fence)
        if not root then return nil, err end
        local query, bound_err = history_query(tx, root, { 'COUNT(m.message_id) AS total' }, checkpoint_id)
        if not query then return nil, bound_err end
        local rows, query_err = query:run_with(tx):query()
        if query_err or not rows[1] then return nil, 'DISPATCH_STORAGE_UNAVAILABLE' end
        return tonumber(rows[1].total)
    end, fence)
end

function repo.output_id(dispatch_id, operation_key, ordinal)
    local digest = hash.sha256(dispatch_id .. ':' .. operation_key .. ':' .. tostring(ordinal))
    return string.sub(digest, 1, 8) .. '-' .. string.sub(digest, 9, 12) .. '-8' .. string.sub(digest, 14, 16)
        .. '-a' .. string.sub(digest, 18, 20) .. '-' .. string.sub(digest, 21, 32)
end

return repo
