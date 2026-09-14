local sql = require('sql')
local json = require('json')
local hash = require('hash')
local uuid = require('uuid')
local time = require('time')
local consts = require('consts')

local repo = { MAX_BYTES = 32768, MAX_SESSION = 8, MAX_ACTOR = 32, MAX_TOTAL = 1024, CLEANUP_BATCH = 100 }
repo._now = function() return time.now():unix() end

function repo.valid_id(value)
    return type(value) == 'string' and #value > 0 and #value <= 128
        and string.match(value, '^[A-Za-z0-9_-]+$') ~= nil
end

function repo.valid_request_id(value)
    return type(value) == 'string' and #value > 0 and #value <= 160
        and string.find(value, '[%c]') == nil
end

function repo.valid_reference(ref)
    if type(ref) ~= 'table' then return false end
    local allowed = { version = true, id = true, content_hash = true, content_bytes = true }
    for key in pairs(ref) do if not allowed[key] then return false end end
    return ref.version == 1 and repo.valid_id(ref.id)
        and type(ref.content_hash) == 'string' and #ref.content_hash == 71
        and string.match(ref.content_hash, '^sha256:[a-f0-9]+$') ~= nil
        and type(ref.content_bytes) == 'number' and ref.content_bytes >= 2
        and ref.content_bytes <= repo.MAX_BYTES and ref.content_bytes % 1 == 0
end

local function connect()
    local resource = consts.get_db_resource()
    local db, err = sql.get(resource)
    if err then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
    return db
end

function repo.lock(tx)
    -- A real SQL write serializes quota checks/inserts on SQLite and PostgreSQL.
    local result, err = tx:execute('UPDATE context_stage_guard SET serial = serial WHERE id = 1')
    if err or not result or result.rows_affected ~= 1 then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
    return true
end

local function transaction(callback)
    local db, err = connect()
    if not db then return nil, err end
    local tx
    tx, err = db:begin()
    if not tx then db:release(); return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
    local locked = repo.lock(tx)
    if not locked then tx:rollback(); db:release(); return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
    local value, failure = callback(tx)
    if failure then tx:rollback(); db:release(); return nil, failure end
    local _, commit_err = tx:commit()
    if commit_err then tx:rollback(); db:release(); return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
    db:release()
    return value
end

local function sweep(tx)
    local rows, err = sql.builder.select('id'):from('context_stages')
        :where('expires_at <= ?', repo._now()):order_by('expires_at ASC')
        :limit(repo.CLEANUP_BATCH):run_with(tx):query()
    if err then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
    for _, row in ipairs(rows) do
        local _, delete_err = sql.builder.delete('context_stages'):where('id = ?', row.id):run_with(tx):exec()
        if delete_err then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
    end
    return #rows
end

function repo.cleanup()
    return transaction(sweep)
end

local function lookup(tx, actor_id, session_id, request_id, id)
    local query = sql.builder.select('*'):from('context_stages')
        :where('actor_id = ?', actor_id):where('session_id = ?', session_id):where('request_id = ?', request_id)
    if id then query = query:where('id = ?', id) end
    local rows, err = query:limit(1):run_with(tx):query()
    if err then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
    return rows[1]
end

local function descriptor(row)
    return { version = 1, id = row.id, content_hash = row.content_hash, content_bytes = row.content_bytes }
end

function repo.create(actor_id, session_id, request_id, canonical, expires_at)
    if not repo.valid_request_id(request_id) or type(canonical) ~= 'string'
        or #canonical < 2 or #canonical > repo.MAX_BYTES or type(expires_at) ~= 'number'
        or expires_at <= repo._now() or expires_at > repo._now() + 300 then
        return nil, 'INVALID_CONTEXT_STAGE'
    end
    local digest, digest_err = hash.sha256(canonical)
    if digest_err then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
    local content_hash = 'sha256:' .. digest
    return transaction(function(tx)
        local _, sweep_err = sweep(tx)
        if sweep_err then return nil, sweep_err end
        local sessions, session_err = sql.builder.select('session_id'):from('sessions')
            :where('session_id = ?', session_id):where('user_id = ?', actor_id):limit(1):run_with(tx):query()
        if session_err then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
        if #sessions ~= 1 then return nil, 'CONTEXT_SESSION_UNAVAILABLE' end
        local existing, lookup_err = lookup(tx, actor_id, session_id, request_id)
        if lookup_err then return nil, lookup_err end
        if existing and existing.expires_at <= repo._now() then
            -- The bounded global sweep may not reach this request. Expire only its exact row here.
            local _, delete_err = sql.builder.delete('context_stages'):where('id = ?', existing.id):run_with(tx):exec()
            if delete_err then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
            existing = nil
        end
        if existing then
            if existing.cancelled ~= 0 or existing.content_hash ~= content_hash or existing.canonical_content ~= canonical then
                return nil, 'CONTEXT_STAGE_CONFLICT'
            end
            return { context_attachments_ref = descriptor(existing), expires_at = time.unix(existing.expires_at, 0):utc():format_rfc3339() }
        end
        -- Never mint an unrecorded retry locator after this message was committed.
        -- The original live stage can be reused above; its private receipt remains valid after cleanup.
        local committed, committed_err = sql.builder.select('message_id'):from('messages')
            :where('session_id = ?', session_id):where('request_id = ?', request_id):limit(1):run_with(tx):query()
        if committed_err then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
        if #committed > 0 then return nil, 'CONTEXT_STAGE_CONFLICT' end
        -- All retained rows count, including cancellation tombstones: cancellation cannot bypass rate/cap limits.
        local all, count_err = sql.builder.select('actor_id', 'session_id'):from('context_stages')
            :limit(repo.MAX_TOTAL + 1):run_with(tx):query()
        if count_err then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
        local actor_count, session_count = 0, 0
        for _, row in ipairs(all) do
            if row.actor_id == actor_id then actor_count = actor_count + 1 end
            if row.session_id == session_id then session_count = session_count + 1 end
        end
        if #all >= repo.MAX_TOTAL or actor_count >= repo.MAX_ACTOR or session_count >= repo.MAX_SESSION then
            return nil, 'CONTEXT_STAGE_QUOTA'
        end
        local id, id_err = uuid.v7()
        if id_err then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
        local row = { id = id, actor_id = actor_id, session_id = session_id, request_id = request_id,
            canonical_content = canonical, content_hash = content_hash, content_bytes = #canonical,
            expires_at = expires_at, cancelled = 0 }
        local _, insert_err = sql.builder.insert('context_stages'):set_map(row):run_with(tx):exec()
        if insert_err then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
        return { context_attachments_ref = descriptor(row), expires_at = time.unix(expires_at, 0):utc():format_rfc3339() }
    end)
end

function repo.check_in_transaction(tx, receipt, session_id, request_id)
    if type(receipt) ~= 'table' or type(receipt.actor_id) ~= 'string' or not repo.valid_reference(receipt.reference) then
        return nil, 'INVALID_CONTEXT_REFERENCE'
    end
    local row, err = lookup(tx, receipt.actor_id, session_id, request_id, receipt.reference.id)
    if err then return nil, err end
    if not row or row.cancelled ~= 0 or row.expires_at <= repo._now() then return nil, 'CONTEXT_REFERENCE_UNAVAILABLE' end
    local ref = receipt.reference
    if row.content_hash ~= ref.content_hash or row.content_bytes ~= ref.content_bytes
        or #row.canonical_content ~= ref.content_bytes
        or 'sha256:' .. hash.sha256(row.canonical_content) ~= ref.content_hash then
        return nil, 'INVALID_CONTEXT_REFERENCE'
    end
    return row
end

function repo.resolve(actor_id, session_id, request_id, ref)
    if not repo.valid_request_id(request_id) or not repo.valid_reference(ref) then return nil, 'INVALID_CONTEXT_REFERENCE' end
    return transaction(function(tx)
        local row, err = repo.check_in_transaction(tx, { actor_id = actor_id, reference = ref }, session_id, request_id)
        if not row then return nil, err end
        local attachments, decode_err = json.decode(row.canonical_content :: string)
        if decode_err then return nil, 'INVALID_CONTEXT_REFERENCE' end
        return attachments
    end)
end

function repo.cancel(actor_id, session_id, request_id, id)
    if type(id) ~= 'string' or type(request_id) ~= 'string' or not repo.valid_id(id) or not repo.valid_request_id(request_id :: string) then return nil, 'INVALID_CONTEXT_REFERENCE' end
    return transaction(function(tx)
        local _, err = sql.builder.update('context_stages'):set('cancelled', 1):set('canonical_content', '')
            :where('id = ?', id):where('actor_id = ?', actor_id):where('session_id = ?', session_id)
            :where('request_id = ?', request_id):run_with(tx):exec()
        if err then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
        return true
    end)
end

return repo
