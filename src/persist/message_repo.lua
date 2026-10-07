local sql = require("sql")
local json = require("json")
local time = require("time")
local consts = require("consts")
local input_metadata = require("input_metadata")
local message_order = require("message_order")

type Message = {
    message_id: string,
    session_id: string,
    date: string,
    type: string,
    data: string,
    metadata: {[string]: any}?,
    request_id: string?,
    request_hash: string?,
}

type MessageList = {
    messages: {Message},
    has_more: boolean,
    next_cursor: string?,
    prev_cursor: string?,
}

local message_repo = {}
local context_staging = require('context_staging_repo')

local function same_receipt(stored, incoming)
    if type(stored) ~= 'table' or type(incoming) ~= 'table'
        or stored.actor_id ~= incoming.actor_id
        or not context_staging.valid_reference(stored.reference)
        or not context_staging.valid_reference(incoming.reference) then return false end
    for _, key in ipairs({ 'version', 'id', 'content_hash', 'content_bytes' }) do
        if stored.reference[key] ~= incoming.reference[key] then return false end
    end
    return true
end
local get_db

function message_repo.create_batch(session_id, rows)
    local db, err = get_db()
    if err then return nil, err end
    local tx, begin_err = db:begin()
    if begin_err then db:release(); return nil, begin_err end
    local now = time.now():format(time.RFC3339NANO)
    for _, row in ipairs(rows) do
        local metadata, encode_err = json.encode(row.metadata or {})
        if encode_err then tx:rollback(); db:release(); return nil, encode_err end
        local _, insert_err = sql.builder.insert("messages"):set_map({
            message_id = row.message_id, session_id = session_id, date = now,
            type = row.type, data = row.data, metadata = metadata
        }):run_with(tx):exec()
        if insert_err then tx:rollback(); db:release(); return nil, insert_err end
    end
    local update_result, update_err = sql.builder.update("sessions"):set("last_message_date", now)
        :where("session_id = ?", session_id):run_with(tx):exec()
    if update_err then tx:rollback(); db:release(); return nil, update_err end
    if update_result.rows_affected == 0 then
        tx:rollback(); db:release(); return nil, "Session not found"
    end
    local _, commit_err = tx:commit()
    if commit_err then tx:rollback(); db:release(); return nil, commit_err end
    db:release()
    return true
end

function message_repo.recover_pending(session_id, anchor_id)
    local recovered = 0
    local function recover_rows(rows)
        for _, row in ipairs(rows or {}) do
            if (row.type == consts.MSG_TYPE.FUNCTION or row.type == consts.MSG_TYPE.PRIVATE_FUNCTION
                or row.type == consts.MSG_TYPE.DELEGATION)
                and type(row.metadata) == "table" and row.metadata.status == consts.FUNC_STATUS.PENDING then
                local _, update_err = message_repo.update_metadata(row.message_id, {
                    status = consts.FUNC_STATUS.ERROR,
                    result = "interrupted, outcome unknown"
                })
                if update_err then return nil, update_err end
                recovered = recovered + 1
            end
        end
        return true
    end

    if anchor_id then
        local window, err = message_repo.list_after_message(session_id, anchor_id)
        if err then return nil, err end
        if not window then return nil, "Failed to list messages for recovery" end
        local _, recovery_err = recover_rows(window)
        if recovery_err then return nil, recovery_err end
    else
        local cursor = nil
        while true do
            local page, err = message_repo.list_by_session(session_id, 500, cursor, "before")
            if err then return nil, err end
            if not page then return nil, "Failed to list messages for recovery" end
            local _, recovery_err = recover_rows(page.messages)
            if recovery_err then return nil, recovery_err end
            if not page.has_more then break end
            cursor = page.next_cursor
        end
    end
    return recovered
end

-- Get a database connection
get_db = function()
    local DB_RESOURCE, _ = consts.get_db_resource()

    local db, err = sql.get(DB_RESOURCE)
    if err then
        return nil, "Failed to connect to database: " .. err
    end
    return db
end

local function validate_request(request_id, request_hash)
    if request_id ~= nil and (type(request_id) ~= "string" or request_id == "" or #request_id > 160) then
        return nil, "Request ID is invalid"
    end
    if (request_id == nil) ~= (request_hash == nil) then
        return nil, "Request ID and hash must be provided together"
    end
    if request_hash ~= nil and (type(request_hash) ~= "string"
        or string.match(request_hash, "^sha256:[a-f0-9]+$") == nil
        or #request_hash ~= 71) then
        return nil, "Request hash is invalid"
    end
    return true
end

-- Checks a staged context receipt inside the insert transaction. Returns the
-- receipt JSON to store, or the prior message when this is an exact retry. The
-- caller rolls back in both the retry and the error case. Only receipt-bearing
-- inserts take the global staging lock; plain messages never wait on staging.
local function stage_receipt(tx, session_id, request_id, request_hash, context_receipt)
    if not context_receipt then return nil end
    if type(context_receipt) ~= 'table' or type(context_receipt.actor_id) ~= 'string'
        or not context_staging.valid_reference(context_receipt.reference) then
        return nil, nil, 'INVALID_CONTEXT_REFERENCE'
    end
    local locked, lock_err = context_staging.lock(tx)
    if not locked then return nil, nil, lock_err end
    local owners, owner_err = sql.builder.select('user_id'):from('sessions')
        :where('session_id = ?', session_id):limit(1):run_with(tx):query()
    local existing, lookup_err = sql.builder.select('message_id', 'request_hash', 'context_receipt'):from('messages')
        :where('session_id = ?', session_id):where('request_id = ?', request_id):limit(1):run_with(tx):query()
    if owner_err or lookup_err or not owners[1] or owners[1].user_id ~= context_receipt.actor_id then
        return nil, nil, (owner_err or lookup_err) and 'CONTEXT_STAGING_UNAVAILABLE' or 'CONTEXT_SESSION_UNAVAILABLE'
    end
    if existing[1] then
        local prior = existing[1]
        local stored = type(prior.context_receipt) == 'string' and json.decode(prior.context_receipt) or nil
        if prior.request_hash ~= request_hash then return nil, nil, 'Request ID conflict' end
        if not same_receipt(stored, context_receipt) then return nil, nil, 'INVALID_CONTEXT_REFERENCE' end
        prior.duplicate = true
        return nil, prior
    end
    local stage, stage_err = context_staging.check_in_transaction(tx, context_receipt, session_id, request_id)
    if not stage then return nil, nil, stage_err end
    return json.encode(context_receipt)
end

-- After a failed insert, an exact retry of a stored request is a duplicate
-- rather than an error.
local function replay_request(session_id, request_id, request_hash, context_receipt)
    if not request_id then return nil end
    local existing, lookup_err = message_repo.get_by_request_id(session_id, request_id)
    if not existing or lookup_err then return nil end
    if existing.request_hash ~= request_hash then return nil, "Request ID conflict" end
    if context_receipt and not same_receipt(existing.context_receipt, context_receipt) then
        return nil, 'INVALID_CONTEXT_REFERENCE'
    end
    existing.duplicate = true
    return existing
end

-- Create a new message
function message_repo.create(message_id, session_id, msg_type, data, metadata, request_id, request_hash, context_receipt)
    local valid, validation_err = input_metadata.validate({ type = msg_type, metadata = metadata })
    if not valid then return nil, validation_err end
    if not message_id or message_id == "" then
        return nil, "Message ID is required"
    end

    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end

    if not msg_type or msg_type == "" then
        return nil, "Message type is required"
    end

    if not data then
        return nil, "Message data is required"
    end
    local request_ok, request_err = validate_request(request_id, request_hash)
    if not request_ok then return nil, request_err end

    -- Convert metadata to JSON if it's a table
    local metadata_json = nil
    if metadata then
        if type(metadata) == "table" then
            local encoded, err = json.encode(metadata)
            if err then
                return nil, "Failed to encode metadata: " .. err
            end
            metadata_json = encoded
        else
            metadata_json = metadata
        end
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    -- Begin transaction
    local tx, err = db:begin()
    if err then
        db:release()
        return nil, "Failed to begin transaction: " .. err
    end

    local now = time.now():format(time.RFC3339NANO)

    local receipt_json, prior, receipt_err = stage_receipt(tx, session_id, request_id, request_hash, context_receipt)
    if prior or receipt_err then
        tx:rollback()
        db:release()
        return prior, receipt_err
    end

    -- Build the INSERT query
    local insert_query = sql.builder.insert("messages")
        :set_map({
            message_id = message_id,
            session_id = session_id,
            date = now,
            type = msg_type,
            data = data,
            metadata = metadata_json or sql.as.null(),
            request_id = request_id or sql.as.null(),
            request_hash = request_hash or sql.as.null(),
            context_receipt = receipt_json or sql.as.null(),
        })

    -- Execute the query within transaction
    local insert_executor = insert_query:run_with(tx)
    local result, err = insert_executor:exec()

    if err then
        tx:rollback()
        db:release()
        local existing, replay_err = replay_request(session_id, request_id, request_hash, context_receipt)
        if existing or replay_err then return existing, replay_err end
        return nil, "Failed to create message: " .. err
    end

    -- Build the UPDATE query for session's last message date
    local update_query = sql.builder.update("sessions")
        :set("last_message_date", now)
        :where("session_id = ?", session_id)

    -- Execute the update within transaction
    local update_executor = update_query:run_with(tx)
    local result, err = update_executor:exec()

    if err then
        tx:rollback()
        db:release()
        return nil, "Failed to update session last message date: " .. err
    end

    -- Check if session was found
    if result.rows_affected == 0 then
        tx:rollback()
        db:release()
        return nil, "Session not found"
    end

    -- Commit transaction
    local success, err = tx:commit()
    if err then
        tx:rollback()
        db:release()
        return nil, "Failed to commit transaction: " .. err
    end

    db:release()

    return {
        message_id = message_id,
        session_id = session_id,
        date = now,
        type = msg_type,
        request_id = request_id,
        request_hash = request_hash,
        duplicate = false,
    }
end

-- Create the first user message of a turn together with the RUNNING session
-- state. A failed write leaves neither half committed. An exact retry of a
-- stored request returns the prior message with duplicate = true and changes
-- nothing.
function message_repo.admit(message_id, session_id, msg_type, data, metadata, session_updates,
    request_id, request_hash, context_receipt)
    local valid, validation_err = input_metadata.validate({ type = msg_type, metadata = metadata })
    if not valid then return nil, validation_err end
    if not message_id or message_id == "" then return nil, "Message ID is required" end
    if not session_id or session_id == "" then return nil, "Session ID is required" end
    if not msg_type or msg_type == "" then return nil, "Message type is required" end
    if data == nil then return nil, "Message data is required" end
    if type(session_updates) ~= "table" then return nil, "Session updates are required" end
    local request_ok, request_err = validate_request(request_id, request_hash)
    if not request_ok then return nil, request_err end

    local metadata_json = nil
    if metadata ~= nil then
        metadata_json = type(metadata) == "table" and json.encode(metadata) or metadata
        if not metadata_json then return nil, "Failed to encode metadata" end
    end

    local db, db_err = get_db()
    if not db then return nil, db_err end
    local tx, begin_err = db:begin()
    if not tx then db:release(); return nil, "Failed to begin transaction: " .. tostring(begin_err) end
    local function abort(reason)
        tx:rollback()
        db:release()
        return nil, reason
    end

    local now = time.now():format(time.RFC3339NANO)
    local receipt_json, prior, receipt_err = stage_receipt(tx, session_id, request_id, request_hash, context_receipt)
    if prior then
        tx:rollback()
        db:release()
        return prior
    end
    if receipt_err then return abort(receipt_err) end

    local inserted, insert_err = sql.builder.insert("messages"):set_map({
        message_id = message_id,
        session_id = session_id,
        date = now,
        type = msg_type,
        data = data,
        metadata = metadata_json or sql.as.null(),
        request_id = request_id or sql.as.null(),
        request_hash = request_hash or sql.as.null(),
        context_receipt = receipt_json or sql.as.null(),
    }):run_with(tx):exec()
    if insert_err or not inserted then
        tx:rollback()
        db:release()
        local existing, replay_err = replay_request(session_id, request_id, request_hash, context_receipt)
        if existing or replay_err then return existing, replay_err end
        return nil, "Failed to create message: " .. tostring(insert_err or "No result")
    end

    local rows, read_err = sql.builder.select("meta"):from("sessions")
        :where("session_id = ?", session_id):run_with(tx):query()
    if read_err or not rows or #rows ~= 1 then return abort(read_err or "Session not found") end
    local current_meta = {}
    if rows[1].meta and rows[1].meta ~= "" then
        local decoded, decode_err = json.decode(rows[1].meta :: string)
        if decode_err or type(decoded) ~= "table" then return abort(decode_err or "Invalid session metadata") end
        current_meta = decoded
    end
    for key, value in pairs(session_updates.meta or {}) do current_meta[key] = value end
    local encoded_meta, meta_err = json.encode(current_meta)
    if meta_err then return abort("Failed to encode session metadata: " .. meta_err) end

    local update = sql.builder.update("sessions")
        :set("last_message_date", now)
        :set("meta", encoded_meta)
    if session_updates.status ~= nil then update = update:set("status", session_updates.status) end
    update = update:where("session_id = ?", session_id)
    local updated, update_err = update:run_with(tx):exec()
    if update_err or not updated or updated.rows_affected ~= 1 then
        return abort("Failed to update session state: " .. tostring(update_err or "Session not found"))
    end

    local committed, commit_err = tx:commit()
    if not committed then return abort("Failed to commit admission: " .. tostring(commit_err or "No result")) end
    db:release()
    return {
        message_id = message_id, session_id = session_id, date = now, type = msg_type,
        request_id = request_id, request_hash = request_hash, duplicate = false,
    }
end

-- Get a message by ID
function message_repo.get(message_id)
    if not message_id or message_id == "" then
        return nil, "Message ID is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    -- Build the SELECT query
    local query = sql.builder.select("message_id", "session_id", "date", "type", "data", "metadata")
        :from("messages")
        :where("message_id = ?", message_id)
        :limit(1)

    -- Execute the query
    local executor = query:run_with(db)
    local messages, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to get message: " .. err
    end

    if #messages == 0 then
        return nil, "Message not found"
    end

    local message = messages[1]

    -- Parse metadata JSON if it exists
    if message.metadata and message.metadata ~= "" then
        local decoded, err = json.decode(message.metadata :: string)
        if not err then
            message.metadata = decoded
        end
    end

    return message
end

function message_repo.get_by_request_id(session_id, request_id)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end
    if not request_id or request_id == "" then
        return nil, "Request ID is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end
    local query = sql.builder.select(
        "message_id",
        "session_id",
        "date",
        "type",
        "data",
        "metadata",
        "request_id",
        "request_hash"
    )
        :from("messages")
        :where(sql.builder.and_({
            sql.builder.expr("session_id = ?", session_id),
            sql.builder.expr("request_id = ?", request_id),
        }))
        :limit(1)
    local messages, query_err = query:run_with(db):query()
    if not query_err and messages[1] then
        local receipts, receipt_err = sql.builder.select('context_receipt'):from('messages')
            :where('session_id = ?', session_id):where('request_id = ?', request_id):limit(1):run_with(db):query()
        if receipt_err then db:release(); return nil, 'CONTEXT_STAGING_UNAVAILABLE' end
        if receipts[1] and type(receipts[1].context_receipt) == 'string' then
            local decoded, decode_err = json.decode(receipts[1].context_receipt)
            if decode_err then db:release(); return nil, 'INVALID_CONTEXT_RECEIPT' end
            messages[1].context_receipt = decoded
        end
    end
    db:release()
    if query_err then
        return nil, "Failed to get message by request ID: " .. query_err
    end
    if #messages == 0 then
        return nil, "Message request not found"
    end
    local message = messages[1]
    if message.metadata and message.metadata ~= "" then
        local decoded, decode_err = json.decode(message.metadata :: string)
        if not decode_err then
            message.metadata = decoded
        end
    end
    return message
end

function message_repo.list_all_by_session(session_id)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end
    local db, err = get_db()
    if err then
        return nil, err
    end
    local query = sql.builder.select("message_id", "session_id", "date", "type", "data", "metadata")
        :from("messages")
        :where("session_id = ?", session_id)
        :order_by(message_order.date(db:type()) .. " ASC, message_id ASC")
    local executor = query:run_with(db)
    local messages, query_err = executor:query()
    db:release()
    if query_err then
        return nil, "Failed to list all messages: " .. query_err
    end
    for _, message in ipairs(messages or {}) do
        if message.metadata and message.metadata ~= "" then
            local decoded, decode_err = json.decode(message.metadata :: string)
            if decode_err then return nil, "Failed to decode message metadata: " .. decode_err end
            message.metadata = decoded
        end
    end
    return messages or {}
end

function message_repo.list_pending_inputs(session_id)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end
    local result, err = message_repo.list_all_by_session(session_id)
    if err then
        return nil, err
    end
    local pending = {}
    for _, message in ipairs(result or {}) do
        local metadata = message.metadata
        local input = nil
        if type(metadata) == "table" then input = metadata.input end
        if input ~= nil then
            if not input_metadata.validate(message) then
                return nil, "Malformed steering metadata on message " .. tostring(message.message_id)
            end
            if input.state == "pending" then pending[#pending + 1] = message end
        end
    end
    return pending
end

-- Apply a pending batch atomically before the next provider operation.
function message_repo.apply_inputs(session_id, updates, expected_revision)
    local db, err = get_db()
    if not db then return nil, err end
    local tx, begin_err = db:begin()
    if not tx then db:release(); return nil, begin_err end
    local function abort(reason)
        tx:rollback()
        db:release()
        return nil, reason
    end
    if type(expected_revision) ~= "number" then
        return abort("Expected interaction revision is required")
    end
    local session_rows, session_err = sql.builder.select("meta"):from("sessions")
        :where("session_id = ?", session_id):run_with(tx):query()
    if session_err or not session_rows or #session_rows ~= 1 then
        return abort(session_err or "Session not found")
    end
    local session_meta = {}
    if session_rows[1].meta and session_rows[1].meta ~= "" then
        local decoded, decode_err = json.decode(tostring(session_rows[1].meta))
        if decode_err or type(decoded) ~= "table" then return abort(decode_err or "Invalid session metadata") end
        session_meta = decoded
    end
    local interaction = type(session_meta.interaction) == "table" and session_meta.interaction or {}
    if (tonumber(interaction.revision) or 0) ~= expected_revision then
        return abort("Interaction revision changed before input application")
    end
    for _, update in ipairs(updates) do
        local next_input = type(update.metadata) == "table" and update.metadata.input
        if not input_metadata.validate({ type = consts.MSG_TYPE.USER, metadata = update.metadata })
            or type(next_input) ~= "table" or next_input.state ~= "applied" then
            return abort("Invalid applied input metadata")
        end
        local rows, read_err = sql.builder.select("metadata"):from("messages")
            :where("session_id = ?", session_id):where("message_id = ?", update.message_id):run_with(tx):query()
        if read_err or not rows or #rows ~= 1 then return abort(read_err or "Pending message not found in session") end
        local metadata, decode_err = json.decode(tostring(rows[1].metadata or ""))
        if decode_err then return abort(decode_err) end
        if not input_metadata.validate({ type = consts.MSG_TYPE.USER, metadata = metadata })
            or type(metadata) ~= "table" or type(metadata.input) ~= "table" or metadata.input.state ~= "pending" then
            return abort("Input is no longer pending")
        end
        for key, value in pairs(update.metadata) do metadata[key] = value end
        local encoded, encode_err = json.encode(metadata)
        if encode_err then return abort(encode_err) end
        local result, write_err = sql.builder.update("messages"):set("metadata", encoded)
            :where("session_id = ?", session_id):where("message_id = ?", update.message_id):run_with(tx):exec()
        if write_err or not result or result.rows_affected ~= 1 then return abort(write_err or "Failed to apply pending input") end
    end
    local ok, commit_err = tx:commit()
    if not ok then return abort(commit_err or "Failed to commit pending input") end
    db:release()
    return true
end

-- Commit Stop together with restoring an in-flight input batch. This closes the
-- interval where pending rows may already be applied but have not entered a
-- provider prompt.
function message_repo.stop_with_input_rollback(session_id, updates, session_updates)
    if type(session_updates) ~= "table" then return nil, "Session updates are required" end
    local db, err = get_db()
    if not db then return nil, err end
    local tx, begin_err = db:begin()
    if not tx then db:release(); return nil, begin_err end
    local function abort(reason)
        tx:rollback()
        db:release()
        return nil, reason
    end
    for _, update in ipairs(updates) do
        local expected = type(update.metadata) == "table" and update.metadata.input
        if type(expected) ~= "table" or expected.state ~= "applied" then
            return abort("Invalid applied input metadata")
        end
        local rows, read_err = sql.builder.select("metadata"):from("messages")
            :where("session_id = ?", session_id):where("message_id = ?", update.message_id):run_with(tx):query()
        if read_err or not rows or #rows ~= 1 then return abort(read_err or "Applied message not found in session") end
        local metadata, decode_err = json.decode(tostring(rows[1].metadata or ""))
        if decode_err then return abort(decode_err) end
        local current = type(metadata) == "table" and metadata.input
        if type(current) ~= "table" or (current.state ~= "pending" and current.state ~= "applied") then
            return abort("Malformed steering metadata")
        end
        if current.state == "applied" then
            if current.after_message_id ~= expected.after_message_id then
                return abort("Input application changed before Stop")
            end
            metadata.input = { state = "pending" }
            local encoded, encode_err = json.encode(metadata)
            if encode_err then return abort(encode_err) end
            local result, write_err = sql.builder.update("messages"):set("metadata", encoded)
                :where("session_id = ?", session_id):where("message_id = ?", update.message_id):run_with(tx):exec()
            if write_err or not result or result.rows_affected ~= 1 then
                return abort(write_err or "Failed to restore pending input")
            end
        end
    end
    local session_rows, session_err = sql.builder.select("meta"):from("sessions")
        :where("session_id = ?", session_id):run_with(tx):query()
    if session_err or not session_rows or #session_rows ~= 1 then
        return abort(session_err or "Session not found")
    end
    local current_meta = {}
    if session_rows[1].meta and session_rows[1].meta ~= "" then
        local decoded, decode_err = json.decode(tostring(session_rows[1].meta))
        if decode_err or type(decoded) ~= "table" then return abort(decode_err or "Invalid session metadata") end
        current_meta = decoded
    end
    for key, value in pairs(session_updates.meta or {}) do current_meta[key] = value end
    local encoded_meta, meta_err = json.encode(current_meta)
    if meta_err then return abort(meta_err) end
    local session_update = sql.builder.update("sessions"):set("meta", encoded_meta)
    if session_updates.status ~= nil then session_update = session_update:set("status", session_updates.status) end
    local updated, update_err = session_update:where("session_id = ?", session_id):run_with(tx):exec()
    if update_err or not updated or updated.rows_affected ~= 1 then
        return abort(update_err or "Failed to commit Stop state")
    end
    local ok, commit_err = tx:commit()
    if not ok then return abort(commit_err or "Failed to commit Stop") end
    db:release()
    return true
end

function message_repo.update_metadata(message_id, metadata)
    if not message_id or message_id == "" then
        return nil, "Message ID is required"
    end

    if not metadata then
        return nil, "Metadata is required"
    end

    local message, err = message_repo.get(message_id)
    if not message or err then
        return nil, "Message not found"
    end

    if type(message.metadata) == "table" and type(metadata) == "table" then
        for k, v in pairs(metadata) do
            message.metadata[k] = v
        end
        metadata = message.metadata
    end

    -- Convert metadata to JSON if it's a table
    local metadata_json = nil
    if type(metadata) == "table" then
        local encoded, err = json.encode(metadata)
        if err then
            return nil, "Failed to encode metadata: " .. err
        end
        metadata_json = encoded
    else
        metadata_json = metadata
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    local update_query = sql.builder.update("messages")
        :set("metadata", metadata_json)
        :where("message_id = ?", message_id)

    local update_executor = update_query:run_with(db)
    local result, err = update_executor:exec()

    db:release()

    if err then
        return nil, "Failed to update message metadata: " .. err
    end

    return {
        message_id = message_id,
        updated = true
    }
end

local function anchor_date(db, session_id, message_id)
    local rows, err = sql.builder.select(message_order.date(db:type()) .. " AS sort_date")
        :from("messages")
        :where("session_id = ? AND message_id = ?", session_id, message_id)
        :limit(1):run_with(db):query()
    if err then return nil, err end
    if #rows == 0 then return nil, "Message anchor not found: " .. tostring(message_id) end
    return rows[1].sort_date
end

-- List messages by session ID with cursor-based pagination
function message_repo.list_by_session(session_id, limit, cursor, direction)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end

    if not direction then
        direction = "after"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    local date_key = message_order.date(db:type())

    -- Default limit if not provided
    limit = limit or 500
    if limit < 1 then
        limit = 1
    end

    -- Build the SELECT query
    local query = sql.builder.select("message_id", "session_id", "date", "type", "data", "metadata")
        :from("messages")
        :where("session_id = ?", session_id)

    -- Add cursor-based condition if cursor is provided
    if cursor and cursor ~= "" then
        local date, anchor_err = anchor_date(db, session_id, cursor)
        if anchor_err then db:release(); return nil, anchor_err end
        if direction == "after" then
            -- Get messages after the cursor (newer messages)
            query = query:where("(" .. date_key .. " > ? OR (" .. date_key .. " = ? AND message_id > ?))", date, date, cursor)
            query = query:order_by(date_key .. " ASC, message_id ASC")
        else
            -- Default to "before" (older messages)
            query = query:where("(" .. date_key .. " < ? OR (" .. date_key .. " = ? AND message_id < ?))", date, date, cursor)
            query = query:order_by(date_key .. " DESC, message_id DESC")
        end
    else
        -- No cursor, get latest messages
        query = query:order_by(date_key .. " DESC, message_id DESC")
    end

    -- Add limit
    query = query:limit(limit + 1) -- Fetch one extra to determine if there are more results

    -- Execute the query
    local executor = query:run_with(db)
    local messages, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to list messages: " .. err
    end

    -- Determine if there are more results
    local has_more = #messages > limit
    if has_more then
        -- Remove the extra item we fetched
        table.remove(messages)
    end

    -- Parse metadata JSON if it exists
    for i, message in ipairs(messages) do
        if message.metadata and message.metadata ~= "" then
            local decoded, err = json.decode(message.metadata :: string)
            if not err then
                message.metadata = decoded
            end
        end
    end

    -- Reverse to chronological ASC order when query used DESC
    if not (cursor and direction == "after") then
        local reversed = {}
        for i = #messages, 1, -1 do
            table.insert(reversed, messages[i])
        end
        messages = reversed
    end

    -- Cursors from chronological (ASC) order
    local next_cursor = nil
    local prev_cursor = nil

    if #messages > 0 then
        next_cursor = messages[1].message_id       -- oldest in batch, for paging backwards
        prev_cursor = messages[#messages].message_id -- newest in batch, for paging forwards
    end

    return {
        messages = messages,
        has_more = has_more,
        next_cursor = next_cursor,
        prev_cursor = prev_cursor
    }
end

function message_repo.list_after_message(session_id, after_message_id, limit: number?)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end

    if not after_message_id or after_message_id == "" then
        return nil, "After message ID is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    local date, anchor_err = anchor_date(db, session_id, after_message_id)
    if anchor_err then db:release(); return nil, anchor_err end
    local date_key = message_order.date(db:type())

    -- Build the SELECT query
    local query = sql.builder.select("message_id", "session_id", "date", "type", "data", "metadata")
        :from("messages")
        :where(sql.builder.and_({
            sql.builder.expr("session_id = ?", session_id),
            sql.builder.expr("(" .. date_key .. " > ? OR (" .. date_key .. " = ? AND message_id >= ?))",
                date, date, after_message_id)
        }))

    local bounded = false
    if limit ~= nil and limit > 0 then
        -- Newest rows first; flipped back to chronological order below.
        bounded = true
        query = query:order_by(date_key .. " DESC, message_id DESC"):limit(limit)
    else
        query = query:order_by(date_key .. " ASC, message_id ASC")
    end

    -- Execute the query
    local executor = query:run_with(db)
    local messages, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to list messages after message ID: " .. err
    end

    -- Parse metadata JSON if it exists
    for i, message in ipairs(messages) do
        if message.metadata and message.metadata ~= "" then
            local decoded, err = json.decode(message.metadata :: string)
            if not err then
                message.metadata = decoded
            end
        end
    end

    if bounded then
        local chronological = {}
        for i = #messages, 1, -1 do
            table.insert(chronological, messages[i])
        end
        messages = chronological
    end

    return messages
end

-- List messages by type within a session
-- When limit and offset are specified, messages are retrieved from the end of chat
function message_repo.list_by_type(session_id, msg_type, limit, offset)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end

    if not msg_type or msg_type == "" then
        return nil, "Message type is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    -- Build the SELECT query
    local query = sql.builder.select("message_id", "session_id", "date", "type", "data", "metadata")
        :from("messages")
        :where(sql.builder.and_({
            sql.builder.expr("session_id = ?", session_id),
            sql.builder.expr("type = ?", msg_type)
        }))
        :order_by(message_order.date(db:type()) .. " DESC, message_id DESC")

    -- Add limit and offset if provided
    if limit and limit > 0 then
        query = query:limit(limit)
        if offset and offset > 0 then
            query = query:offset(offset)
        end
    end

    -- Execute the query
    local executor = query:run_with(db)
    local messages, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to list messages by type: " .. err
    end

    -- Parse metadata JSON if it exists
    for i, message in ipairs(messages) do
        if message.metadata and message.metadata ~= "" then
            local decoded, err = json.decode(message.metadata :: string)
            if not err then
                message.metadata = decoded
            end
        end
    end

    -- Reverse the order to maintain chronological order in the result
    local reversed = {}
    for i = #messages, 1, -1 do
        table.insert(reversed, messages[i])
    end

    return reversed
end

-- Get the latest message in a session
function message_repo.get_latest(session_id)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    -- Build the SELECT query
    local query = sql.builder.select("message_id", "session_id", "date", "type", "data", "metadata")
        :from("messages")
        :where("session_id = ?", session_id)
        :order_by(message_order.date(db:type()) .. " DESC, message_id DESC")
        :limit(1)

    -- Execute the query
    local executor = query:run_with(db)
    local messages, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to get latest message: " .. err
    end

    if #messages == 0 then
        return nil, "No messages found for this session"
    end

    local message = messages[1]

    -- Parse metadata JSON if it exists
    if message.metadata and message.metadata ~= "" then
        local decoded, err = json.decode(message.metadata :: string)
        if not err then
            message.metadata = decoded
        end
    end

    return message
end

-- Delete a message
function message_repo.delete(message_id)
    if not message_id or message_id == "" then
        return nil, "Message ID is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    -- Check if message exists
    local check_query = sql.builder.select("message_id")
        :from("messages")
        :where("message_id = ?", message_id)

    local check_executor = check_query:run_with(db)
    local messages, err = check_executor:query()

    if err then
        db:release()
        return nil, "Failed to check if message exists: " .. err
    end

    if #messages == 0 then
        db:release()
        return nil, "Message not found"
    end

    -- Build the DELETE query
    local delete_query = sql.builder.delete("messages")
        :where("message_id = ?", message_id)

    -- Execute the query
    local delete_executor = delete_query:run_with(db)
    local result, err = delete_executor:exec()

    db:release()

    if err then
        return nil, "Failed to delete message: " .. err
    end

    return { deleted = true }
end

-- Count messages in a session
function message_repo.count_by_session(session_id)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    local query = sql.builder.select("COUNT(*) as count")
        :from("messages")
        :where("session_id = ?", session_id)

    -- Execute the query
    local executor = query:run_with(db)
    local result, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to count messages: " .. err
    end

    return result[1].count
end

-- Count messages by type in a session
function message_repo.count_by_type(session_id, msg_type)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end

    if not msg_type or msg_type == "" then
        return nil, "Message type is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    local query = sql.builder.select("COUNT(*) as count")
        :from("messages")
        :where(sql.builder.and_({
            sql.builder.expr("session_id = ?", session_id),
            sql.builder.expr("type = ?", msg_type)
        }))

    -- Execute the query
    local executor = query:run_with(db)
    local result, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to count messages by type: " .. err
    end

    return result[1].count
end

return message_repo
