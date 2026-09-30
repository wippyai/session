local sql = require("sql")
local json = require("json")
local time = require("time")
local consts = require("consts")
local tx = require("tx")
local message_date = require("message_date")
local input_metadata = require("input_metadata")

type Message = {
    message_id: string,
    session_id: string,
    date: string,
    type: string,
    data: string,
    metadata: {[string]: any}?,
}

type MessageList = {
    messages: {Message},
    has_more: boolean,
    next_cursor: string?,
    prev_cursor: string?,
}

local message_repo = {}
local get_db

function message_repo.create_batch(session_id, rows)
    local result, err = tx.run(function(dbtx)
        local _, lock_err = message_date.lock_session(dbtx, session_id)
        if lock_err then return nil, lock_err end

        -- Each row's date is taken after the previous row is inserted, so the
        -- batch sorts in array order even inside one clock tick.
        local last_date = nil
        for _, row in ipairs(rows) do
            local metadata, encode_err = json.encode(row.metadata or {})
            if encode_err then return nil, encode_err end
            local date, date_err = message_date.next(dbtx, session_id)
            if date_err then return nil, date_err end
            local _, insert_err = sql.builder.insert("messages"):set_map({
                message_id = row.message_id, session_id = session_id, date = date,
                type = row.type, data = row.data, metadata = metadata
            }):run_with(dbtx):exec()
            if insert_err then return nil, insert_err end
            last_date = date
        end

        if #rows == 0 then return true end

        local update_result, update_err = sql.builder.update("sessions"):set("last_message_date", last_date)
            :where("session_id = ?", session_id):run_with(dbtx):exec()
        if update_err then return nil, update_err end
        if update_result.rows_affected == 0 then
            return nil, "Session not found"
        end
        return true
    end)

    if err then return nil, err end
    return result
end

-- A pending call whose control operations created a session form that was
-- committed (the process stopped after storing the form but before settling
-- the call). Returns the form's artifact row ({ artifact_id, title }), nil
-- when there is no such form, or nil and an error when the lookup failed:
-- recovery then stops and runs again later instead of reporting the call as
-- interrupted while its form exists.
local function committed_form_of(row)
    local operations = row.metadata.control_operations
    local forms = type(operations) == "table" and operations.forms or nil
    local first = type(forms) == "table" and forms[1] or nil
    if type(first) ~= "table" or type(first.artifact_id) ~= "string" then return nil end

    local artifact, err = message_repo._form_artifact(first.artifact_id, row.session_id)
    if err then return nil, err end
    if not artifact then return nil end

    -- The form's server-written origin must name this call. A call cannot
    -- claim a form that another call created.
    local form = type(artifact.meta) == "table" and artifact.meta.session_form or nil
    local origin = type(form) == "table" and form.origin or nil
    if type(origin) ~= "table" or origin.tool_message_id ~= row.message_id then return nil end
    if origin.call_id ~= nil and origin.call_id ~= row.metadata.call_id then return nil end
    return artifact
end

-- The artifact `artifact_id` of `session_id` with its meta decoded, nil when
-- there is none, or nil and an error. A meta that does not decode reads as
-- none. Replaceable in tests.
function message_repo._form_artifact(artifact_id, session_id)
    local db, err = get_db()
    if err then return nil, err end
    local rows, query_err = sql.builder.select("artifact_id", "title", "meta")
        :from("artifacts")
        :where(sql.builder.and_({
            sql.builder.expr("artifact_id = ?", artifact_id),
            sql.builder.expr("session_id = ?", session_id),
        }))
        :limit(1)
        :run_with(db):query()
    db:release()
    if query_err then return nil, "Failed to read form artifact: " .. tostring(query_err) end
    if #rows == 0 then return nil end
    local artifact = rows[1]
    if type(artifact.meta) == "string" and artifact.meta ~= "" then
        local decoded, decode_err = json.decode(artifact.meta :: string)
        artifact.meta = not decode_err and decoded or nil
    end
    return artifact
end

function message_repo.recover_pending(session_id, anchor_id)
    local recovered = 0
    local function recover_rows(rows)
        for _, row in ipairs(rows or {}) do
            local form = nil
            if row.type == consts.MSG_TYPE.FUNCTION and type(row.metadata) == "table"
                and row.metadata.status == consts.FUNC_STATUS.PENDING then
                local form_err
                form, form_err = committed_form_of(row)
                if form_err then return nil, form_err end
            end
            if form then
                -- The form exists and is visible, so the call succeeded;
                -- reporting it as interrupted would make the agent ask again.
                local _, update_err = message_repo.update_metadata(row.message_id, {
                    status = consts.FUNC_STATUS.SUCCESS,
                    result = { message = string.format(
                        'Form "%s" was created as %s. Its answer will arrive as a user message.',
                        form.title, form.artifact_id) }
                })
                if update_err then return nil, update_err end
                recovered = recovered + 1
            elseif (row.type == consts.MSG_TYPE.FUNCTION or row.type == consts.MSG_TYPE.PRIVATE_FUNCTION
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

-- Get a database connection (refused inside tx.run; see tx.connect)
get_db = function()
    return tx.connect()
end

-- Create a new message.
--
-- opts.tx (optional): run the insert and the sessions.last_message_date
-- update on this caller-supplied transaction; do not begin, commit or
-- release. Lets a caller combine message creation with other writes (e.g. an
-- artifact update) atomically.
function message_repo.create(message_id, session_id, msg_type, data, metadata, opts)
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

    local function do_create(dbtx)
        -- Lock the session row first, then take a date the store orders
        -- after every row of the session (see message_date).
        local _, lock_err = message_date.lock_session(dbtx, session_id)
        if lock_err then return nil, lock_err end
        local date, date_err = message_date.next(dbtx, session_id)
        if date_err then return nil, date_err end

        -- Build the INSERT query
        local insert_query = sql.builder.insert("messages")
            :set_map({
                message_id = message_id,
                session_id = session_id,
                date = date,
                type = msg_type,
                data = data,
                metadata = metadata_json or sql.as.null()
            })

        -- Execute the query within transaction
        local _, insert_err = insert_query:run_with(dbtx):exec()
        if insert_err then
            return nil, "Failed to create message: " .. insert_err
        end

        -- Build the UPDATE query for session's last message date
        local update_query = sql.builder.update("sessions")
            :set("last_message_date", date)
            :where("session_id = ?", session_id)

        -- Execute the update within transaction
        local update_result, update_err = update_query:run_with(dbtx):exec()
        if update_err then
            return nil, "Failed to update session last message date: " .. update_err
        end

        -- Check if session was found
        if update_result.rows_affected == 0 then
            return nil, "Session not found"
        end

        return {
            message_id = message_id,
            session_id = session_id,
            date = date,
            type = msg_type
        }
    end

    if opts and opts.tx then
        return do_create(opts.tx)
    end

    return tx.run(do_create)
end

-- Reads and decodes the session's meta on `conn` (a transaction holding the
-- session lock). Returns the table (empty when unset), or nil and an error.
local function session_meta_of(conn, session_id)
    local rows, read_err = sql.builder.select("meta"):from("sessions")
        :where("session_id = ?", session_id):run_with(conn):query()
    if read_err or not rows or #rows ~= 1 then return nil, read_err or "Session not found" end
    if not rows[1].meta or rows[1].meta == "" then return {} end
    local decoded, decode_err = json.decode(tostring(rows[1].meta))
    if decode_err or type(decoded) ~= "table" then return nil, decode_err or "Invalid session metadata" end
    return decoded
end

-- Create the first user message of a turn together with the RUNNING session
-- state. A failed write leaves neither half committed. The message date comes
-- from message_date under the session lock, like every other session row.
function message_repo.admit(message_id, session_id, msg_type, data, metadata, session_updates)
    local valid, validation_err = input_metadata.validate({ type = msg_type, metadata = metadata })
    if not valid then return nil, validation_err end
    if not message_id or message_id == "" then return nil, "Message ID is required" end
    if not session_id or session_id == "" then return nil, "Session ID is required" end
    if not msg_type or msg_type == "" then return nil, "Message type is required" end
    if data == nil then return nil, "Message data is required" end
    if type(session_updates) ~= "table" then return nil, "Session updates are required" end

    local metadata_json = nil
    if metadata ~= nil then
        metadata_json = type(metadata) == "table" and json.encode(metadata) or metadata
        if not metadata_json then return nil, "Failed to encode metadata" end
    end

    return tx.run(function(dbtx)
        -- The lock also proves the session exists, without relying on
        -- rows_affected, which some drivers report as 0 for a no-op update.
        local _, lock_err = message_date.lock_session(dbtx, session_id)
        if lock_err then return nil, lock_err end
        local date, date_err = message_date.next(dbtx, session_id)
        if date_err then return nil, date_err end

        local _, insert_err = sql.builder.insert("messages"):set_map({
            message_id = message_id,
            session_id = session_id,
            date = date,
            type = msg_type,
            data = data,
            metadata = metadata_json or sql.as.null(),
        }):run_with(dbtx):exec()
        if insert_err then return nil, "Failed to create message: " .. tostring(insert_err) end

        local current_meta, meta_err = session_meta_of(dbtx, session_id)
        if not current_meta then return nil, meta_err end
        for key, value in pairs(session_updates.meta or {}) do current_meta[key] = value end
        local encoded_meta, encode_err = json.encode(current_meta)
        if encode_err then return nil, "Failed to encode session metadata: " .. encode_err end

        local update = sql.builder.update("sessions")
            :set("last_message_date", date)
            :set("meta", encoded_meta)
        if session_updates.status ~= nil then update = update:set("status", session_updates.status) end
        local _, update_err = update:where("session_id = ?", session_id):run_with(dbtx):exec()
        if update_err then return nil, "Failed to update session state: " .. tostring(update_err) end

        return { message_id = message_id, session_id = session_id, date = date, type = msg_type }
    end)
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
        :order_by("date ASC, message_id ASC")
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
    if type(expected_revision) ~= "number" then
        return nil, "Expected interaction revision is required"
    end
    return tx.run(function(dbtx)
        -- Serializes with Stop and every other writer of the session row.
        local _, lock_err = message_date.lock_session(dbtx, session_id)
        if lock_err then return nil, lock_err end
        local session_meta, meta_err = session_meta_of(dbtx, session_id)
        if not session_meta then return nil, meta_err end
        local interaction = type(session_meta.interaction) == "table" and session_meta.interaction or {}
        if (tonumber(interaction.revision) or 0) ~= expected_revision then
            return nil, "Interaction revision changed before input application"
        end
        for _, update in ipairs(updates) do
            local next_input = type(update.metadata) == "table" and update.metadata.input
            if not input_metadata.validate({ type = consts.MSG_TYPE.USER, metadata = update.metadata })
                or type(next_input) ~= "table" or next_input.state ~= "applied" then
                return nil, "Invalid applied input metadata"
            end
            local rows, read_err = sql.builder.select("metadata"):from("messages")
                :where("session_id = ?", session_id):where("message_id = ?", update.message_id)
                :run_with(dbtx):query()
            if read_err or not rows or #rows ~= 1 then return nil, read_err or "Pending message not found in session" end
            local metadata, decode_err = json.decode(tostring(rows[1].metadata or ""))
            if decode_err then return nil, decode_err end
            if not input_metadata.validate({ type = consts.MSG_TYPE.USER, metadata = metadata })
                or type(metadata) ~= "table" or type(metadata.input) ~= "table" or metadata.input.state ~= "pending" then
                return nil, "Input is no longer pending"
            end
            for key, value in pairs(update.metadata) do metadata[key] = value end
            local encoded, encode_err = json.encode(metadata)
            if encode_err then return nil, encode_err end
            local result, write_err = sql.builder.update("messages"):set("metadata", encoded)
                :where("session_id = ?", session_id):where("message_id = ?", update.message_id)
                :run_with(dbtx):exec()
            if write_err or not result or result.rows_affected ~= 1 then
                return nil, write_err or "Failed to apply pending input"
            end
        end
        return true
    end)
end

-- Commit Stop together with restoring an in-flight input batch. This closes the
-- interval where pending rows may already be applied but have not entered a
-- provider prompt.
function message_repo.stop_with_input_rollback(session_id, updates, session_updates)
    if type(session_updates) ~= "table" then return nil, "Session updates are required" end
    return tx.run(function(dbtx)
        local _, lock_err = message_date.lock_session(dbtx, session_id)
        if lock_err then return nil, lock_err end
        for _, update in ipairs(updates) do
            local expected = type(update.metadata) == "table" and update.metadata.input
            if type(expected) ~= "table" or expected.state ~= "applied" then
                return nil, "Invalid applied input metadata"
            end
            local rows, read_err = sql.builder.select("metadata"):from("messages")
                :where("session_id = ?", session_id):where("message_id = ?", update.message_id)
                :run_with(dbtx):query()
            if read_err or not rows or #rows ~= 1 then return nil, read_err or "Applied message not found in session" end
            local metadata, decode_err = json.decode(tostring(rows[1].metadata or ""))
            if decode_err then return nil, decode_err end
            local current = type(metadata) == "table" and metadata.input
            if type(current) ~= "table" or (current.state ~= "pending" and current.state ~= "applied") then
                return nil, "Malformed steering metadata"
            end
            if current.state == "applied" then
                if current.after_message_id ~= expected.after_message_id then
                    return nil, "Input application changed before Stop"
                end
                metadata.input = { state = "pending" }
                local encoded, encode_err = json.encode(metadata)
                if encode_err then return nil, encode_err end
                local result, write_err = sql.builder.update("messages"):set("metadata", encoded)
                    :where("session_id = ?", session_id):where("message_id = ?", update.message_id)
                    :run_with(dbtx):exec()
                if write_err or not result or result.rows_affected ~= 1 then
                    return nil, write_err or "Failed to restore pending input"
                end
            end
        end
        local current_meta, meta_err = session_meta_of(dbtx, session_id)
        if not current_meta then return nil, meta_err end
        for key, value in pairs(session_updates.meta or {}) do current_meta[key] = value end
        local encoded_meta, encode_meta_err = json.encode(current_meta)
        if encode_meta_err then return nil, encode_meta_err end
        local session_update = sql.builder.update("sessions"):set("meta", encoded_meta)
        if session_updates.status ~= nil then session_update = session_update:set("status", session_updates.status) end
        local _, update_err = session_update:where("session_id = ?", session_id):run_with(dbtx):exec()
        if update_err then return nil, update_err end
        return true
    end)
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

-- Checks that `message_id` is a row of the session. Returns true, or nil and
-- an error.
local function anchor_exists(db, session_id, message_id)
    local rows, err = sql.builder.select("message_id")
        :from("messages")
        :where("session_id = ? AND message_id = ?", session_id, message_id)
        :limit(1):run_with(db):query()
    if err then return nil, err end
    if #rows == 0 then return nil, "Message anchor not found: " .. tostring(message_id) end
    return true
end

-- Rows positioned after (or before) the row `anchor_id` in (date,
-- message_id) order. The anchor's date is read by a subquery, so the store
-- compares its own values and nothing depends on how a date reads back.
-- `prefix` qualifies the outer columns (e.g. "m."); `inclusive` keeps the
-- anchor row itself.
local function position_filter(anchor_id, direction, inclusive: boolean?, prefix: string?)
    prefix = prefix or ""
    local cmp = direction == "before" and "<" or ">"
    local anchor = "(SELECT a.date FROM messages a WHERE a.message_id = ?)"
    return sql.builder.expr(string.format("(%sdate %s %s OR (%sdate = %s AND %smessage_id %s ?))",
        prefix, cmp, anchor, prefix, anchor, prefix, inclusive and (cmp .. "=") or cmp),
        anchor_id, anchor_id, anchor_id)
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
        local _, anchor_err = anchor_exists(db, session_id, cursor)
        if anchor_err then db:release(); return nil, anchor_err end
        if direction == "after" then
            -- Get messages after the cursor (newer messages)
            query = query:where(position_filter(cursor, "after", false))
            query = query:order_by("date ASC, message_id ASC")
        else
            -- Default to "before" (older messages)
            query = query:where(position_filter(cursor, "before", false))
            query = query:order_by("date DESC, message_id DESC")
        end
    else
        -- No cursor, get latest messages
        query = query:order_by("date DESC, message_id DESC")
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

    local _, anchor_err = anchor_exists(db, session_id, after_message_id)
    if anchor_err then db:release(); return nil, anchor_err end

    -- Build the SELECT query
    local query = sql.builder.select("message_id", "session_id", "date", "type", "data", "metadata")
        :from("messages")
        :where(sql.builder.and_({
            sql.builder.expr("session_id = ?", session_id),
            position_filter(after_message_id, "after", true)
        }))

    local bounded = false
    if limit ~= nil and limit > 0 then
        -- Newest rows first; flipped back to chronological order below.
        bounded = true
        query = query:order_by("date DESC, message_id DESC"):limit(limit)
    else
        query = query:order_by("date ASC, message_id ASC")
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
        :order_by("date DESC, message_id DESC")

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
        :order_by("date DESC, message_id DESC")
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

-- SESSION FORM ANSWERS
--
-- An accepted form answer is committed as a user row whose
-- metadata.session_form.pending is true (see wippy.session.forms). The row
-- stays out of prompts until the session process admits it; admission moves
-- the row to the end of the history and clears the marker.

-- Only the server writes top-level metadata keys of a user row; a client
-- supplies values under file_uuids at most. So a form answer is recognised by
-- a decoded top-level session_form table, never by text alone: the LIKE
-- patterns below only narrow the rows that are decoded and checked. They
-- match whatever the key order, because "pending":true sits inside the
-- session_form object.
local PENDING_CANDIDATE_PATTERN = '%"session_form":{%"pending":true%'
local SUBMITTED_PATTERN = '%"submitted_at":%'

-- Rows fetched per page by the scans below.
local SCAN_PAGE = 100

local function decode_metadata(row)
    if type(row.metadata) == "string" and row.metadata ~= "" then
        local decoded, decode_err = json.decode(row.metadata :: string)
        if not decode_err then row.metadata = decoded end
    end
    if type(row.metadata) ~= "table" then row.metadata = {} end
    return row
end

local function is_form_answer(row)
    return row.type == consts.MSG_TYPE.USER and type(row.metadata) == "table"
        and type(row.metadata.session_form) == "table"
end

local function is_pending_answer(row)
    return is_form_answer(row) and row.metadata.session_form.pending == true
end

-- Whether a history row (metadata decoded) is a form answer that the
-- session has not admitted yet. Prompt builders and summarizers skip these:
-- the active turn must not see input accepted after it started.
message_repo.is_pending_answer = is_pending_answer

-- Runs `build()` (a select that includes `<prefix>message_id`) page by page
-- in (date, message_id) order and calls visit(row) for each row until it
-- returns true. Returns true when visit stopped the scan, false when the rows
-- ran out, or nil and an error. Each page starts after the previous page's
-- last row; if that row is re-dated meanwhile (admission), the scan can skip
-- rows, which the next scan finds.
local function scan(conn, build, prefix: string?, visit)
    prefix = prefix or ""
    local last_id = nil
    while true do
        local query = build()
        if last_id then query = query:where(position_filter(last_id, "after", false, prefix)) end
        local rows, err = query
            :order_by(prefix .. "date ASC, " .. prefix .. "message_id ASC")
            :limit(SCAN_PAGE)
            :run_with(conn):query()
        if err then return nil, err end
        for _, row in ipairs(rows) do
            if visit(row) then return true end
        end
        if #rows < SCAN_PAGE then return false end
        last_id = rows[#rows].message_id
    end
end

-- Pending answer rows of a session in history order, at most `limit`.
function message_repo.list_pending_answers(session_id, limit)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end
    limit = limit or 50
    local db, err = get_db()
    if err then return nil, err end

    local pending = {}
    local _, scan_err = scan(db, function()
        return sql.builder.select("message_id", "session_id", "date", "type", "data", "metadata")
            :from("messages")
            :where(sql.builder.and_({
                sql.builder.expr("session_id = ?", session_id),
                sql.builder.expr("type = ?", consts.MSG_TYPE.USER),
                sql.builder.expr("metadata LIKE ?", PENDING_CANDIDATE_PATTERN)
            }))
    end, nil, function(row)
        decode_metadata(row)
        if is_pending_answer(row) then table.insert(pending, row) end
        return #pending >= limit
    end)
    db:release()
    if scan_err then return nil, "Failed to list pending answers: " .. tostring(scan_err) end
    return pending
end

-- Ids of the user's sessions that hold pending answer rows, at most `limit`,
-- ordered by their oldest pending answer. opts.exclude: session ids to skip
-- (for example sessions already running, or ones that failed to start), so
-- they cannot fill the result and starve the others. Lets the session plugin
-- start sessions whose wake-up was lost, for example after a runtime restart.
function message_repo.list_sessions_with_pending_answers(user_id, limit, opts)
    if not user_id or user_id == "" then return nil, "User ID is required" end
    limit = limit or 5
    local exclude = opts and type(opts.exclude) == "table" and opts.exclude or {}
    local db, err = get_db()
    if err then return nil, err end

    local ids, seen = {}, {}
    for _, id in ipairs(exclude) do seen[id] = true end
    local _, scan_err = scan(db, function()
        local filters = {
            sql.builder.expr("s.user_id = ?", user_id),
            sql.builder.expr("m.type = ?", consts.MSG_TYPE.USER),
            sql.builder.expr("m.metadata LIKE ?", PENDING_CANDIDATE_PATTERN),
        }
        for _, id in ipairs(exclude) do
            table.insert(filters, sql.builder.expr("m.session_id <> ?", id))
        end
        return sql.builder.select("m.message_id", "m.session_id", "m.type", "m.metadata")
            :from("messages m")
            :join("sessions s ON s.session_id = m.session_id")
            :where(sql.builder.and_(filters))
    end, "m.", function(row)
        if seen[row.session_id] then return false end
        decode_metadata(row)
        if is_pending_answer(row) then
            seen[row.session_id] = true
            table.insert(ids, row.session_id)
        end
        return #ids >= limit
    end)
    db:release()
    if scan_err then return nil, "Failed to list sessions with pending answers: " .. tostring(scan_err) end
    return ids
end

-- Admits one pending answer row in a single transaction: with the session
-- row locked, the row gets a date the store orders after everything already
-- in the session (message_date.next), its pending marker is cleared, and the
-- session's last_message_date follows. Returns the admitted row, or nil
-- without an error when the row is not a pending answer of this session
-- (already admitted, or foreign), so a repeated admission is a no-op.
function message_repo.admit_pending_answer(session_id, message_id)
    if not session_id or session_id == "" then return nil, "Session ID is required" end
    if not message_id or message_id == "" then return nil, "Message ID is required" end

    local result, err = tx.run(function(dbtx)
        -- Lock first: a concurrent writer of this session must not take a
        -- date between this read and this write.
        local _, lock_err = message_date.lock_session(dbtx, session_id)
        if lock_err then return nil, lock_err end

        local rows, select_err = sql.builder.select("message_id", "session_id", "date", "type", "data", "metadata")
            :from("messages")
            :where("message_id = ?", message_id)
            :limit(1):run_with(dbtx):query()
        if select_err then return nil, "Failed to read answer: " .. select_err end
        if #rows == 0 then return false end
        local row = decode_metadata(rows[1])
        if row.session_id ~= session_id or not is_pending_answer(row) then return false end

        local date, date_err = message_date.next(dbtx, session_id)
        if date_err then return nil, date_err end
        row.metadata.session_form.pending = nil
        local metadata_json, encode_err = json.encode(row.metadata)
        if encode_err then return nil, "Failed to encode metadata: " .. encode_err end

        local _, update_err = sql.builder.update("messages")
            :set("date", date)
            :set("metadata", metadata_json)
            :where("message_id = ?", message_id)
            :run_with(dbtx):exec()
        if update_err then return nil, "Failed to admit answer: " .. update_err end

        local _, session_update_err = sql.builder.update("sessions")
            :set("last_message_date", date)
            :where("session_id = ?", session_id)
            :run_with(dbtx):exec()
        if session_update_err then
            return nil, "Failed to update session last message date: " .. session_update_err
        end

        row.date = date
        return row
    end)
    if err then return nil, err end
    if not result then return nil, nil end
    return result
end

local function parse_instant(value)
    if type(value) ~= "string" then return nil end
    local parsed, parse_err = time.parse(time.RFC3339NANO, value)
    if parse_err then return nil end
    return parsed
end

-- Whether `value` (an acceptance time) is later than `after` (a message
-- date). Both come from the clock, possibly with different offsets, so they
-- are compared as instants; as text only when one does not parse.
local function accepted_after(value, after)
    local value_at, after_at = parse_instant(value), parse_instant(after)
    if value_at and after_at then return value_at:after(after_at) end
    return value > after
end

-- Whether user input other than the answer to `exclude_artifact_id` was
-- accepted after `after_date` - the "conversation moved on" test for a form.
-- Typed user rows count by their date, compared in the store. Form answers
-- count by their acceptance time (the form artifact's
-- submission.submitted_at), not by the answer row's date, because admission
-- moves that row to the end of the history: an answer accepted before a form
-- was created must not make it stale once admitted. opts.tx: run on a
-- caller-supplied transaction.
function message_repo.has_user_input_after(session_id, after_date, exclude_artifact_id, opts)
    if not session_id or session_id == "" then return nil, "Session ID is required" end
    if not after_date or after_date == "" then return nil, "Date is required" end

    local conn = opts and opts.tx
    local db = nil
    if not conn then
        local get_err
        db, get_err = get_db()
        if get_err then return nil, get_err end
        conn = db
    end

    -- Every later user row that is not a server-written form answer is typed
    -- input, whatever its client data contains.
    local typed, typed_err = scan(conn, function()
        return sql.builder.select("message_id", "type", "metadata")
            :from("messages")
            :where(sql.builder.and_({
                sql.builder.expr("session_id = ?", session_id),
                sql.builder.expr("type = ?", consts.MSG_TYPE.USER),
                sql.builder.expr("date > ?", after_date)
            }))
    end, nil, function(row)
        return not is_form_answer(decode_metadata(row))
    end)
    if typed_err then
        if db then db:release() end
        return nil, "Failed to check later user input: " .. tostring(typed_err)
    end
    if typed then
        if db then db:release() end
        return true
    end

    local answered, answered_err = sql.builder.select("artifact_id", "meta")
        :from("artifacts")
        :where(sql.builder.and_({
            sql.builder.expr("session_id = ?", session_id),
            sql.builder.expr("meta LIKE ?", SUBMITTED_PATTERN)
        }))
        :run_with(conn):query()
    if db then db:release() end
    if answered_err then return nil, "Failed to check later form answers: " .. answered_err end

    for _, row in ipairs(answered) do
        if row.artifact_id ~= exclude_artifact_id then
            local meta = row.meta
            if type(meta) == "string" then meta = json.decode(meta :: string) end
            local form = type(meta) == "table" and meta.session_form or nil
            local submission = type(form) == "table" and form.submission or nil
            if type(submission) == "table" and type(submission.submitted_at) == "string"
                and accepted_after(submission.submitted_at, after_date) then
                return true
            end
        end
    end
    return false
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
