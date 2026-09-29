local sql = require("sql")
local json = require("json")
local consts = require("consts")
local tx = require("tx")
local message_date = require("message_date")

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
        local session_rows, select_err = sql.builder.select("last_message_date")
            :from("sessions")
            :where("session_id = ?", session_id)
            :limit(1):run_with(dbtx):query()
        if select_err then return nil, select_err end
        if #session_rows == 0 then return nil, "Session not found" end

        -- Assign strictly increasing dates in array order, chaining each
        -- row's date into the next so a whole batch written inside one
        -- clock tick still sorts in insertion order.
        local last_date = session_rows[1].last_message_date
        for _, row in ipairs(rows) do
            local metadata, encode_err = json.encode(row.metadata or {})
            if encode_err then return nil, encode_err end
            local date = message_date.next(last_date)
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

-- Create a new message.
--
-- opts.tx (optional): run the insert and the sessions.last_message_date
-- update on this caller-supplied transaction; do not begin, commit or
-- release. Lets a caller combine message creation with other writes (e.g. an
-- artifact update) atomically.
function message_repo.create(message_id, session_id, msg_type, data, metadata, opts)
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
        -- Read the session's current last_message_date inside this
        -- transaction so the new row's date can be made strictly greater
        -- than it, even when several writes land in the same clock tick.
        local session_rows, select_err = sql.builder.select("last_message_date")
            :from("sessions")
            :where("session_id = ?", session_id)
            :limit(1):run_with(dbtx):query()
        if select_err then
            return nil, "Failed to read session last message date: " .. select_err
        end
        if #session_rows == 0 then
            return nil, "Session not found"
        end

        local date = message_date.next(session_rows[1].last_message_date)

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
    local rows, err = sql.builder.select("date")
        :from("messages")
        :where("session_id = ? AND message_id = ?", session_id, message_id)
        :limit(1):run_with(db):query()
    if err then return nil, err end
    if #rows == 0 then return nil, "Message anchor not found: " .. tostring(message_id) end
    return rows[1].date
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
        local date, anchor_err = anchor_date(db, session_id, cursor)
        if anchor_err then db:release(); return nil, anchor_err end
        if direction == "after" then
            -- Get messages after the cursor (newer messages)
            query = query:where("(date > ? OR (date = ? AND message_id > ?))", date, date, cursor)
            query = query:order_by("date ASC, message_id ASC")
        else
            -- Default to "before" (older messages)
            query = query:where("(date < ? OR (date = ? AND message_id < ?))", date, date, cursor)
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

    local date, anchor_err = anchor_date(db, session_id, after_message_id)
    if anchor_err then db:release(); return nil, anchor_err end

    -- Build the SELECT query
    local query = sql.builder.select("message_id", "session_id", "date", "type", "data", "metadata")
        :from("messages")
        :where(sql.builder.and_({
            sql.builder.expr("session_id = ?", session_id),
            sql.builder.expr("(date > ? OR (date = ? AND message_id >= ?))",
                date, date, after_message_id)
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

local PENDING_ANSWER_PATTERN = '%"pending":true%'

local function decode_metadata(row)
    if type(row.metadata) == "string" and row.metadata ~= "" then
        local decoded, decode_err = json.decode(row.metadata :: string)
        if not decode_err then row.metadata = decoded end
    end
    if type(row.metadata) ~= "table" then row.metadata = {} end
    return row
end

local function is_pending_answer(row)
    local form = type(row.metadata) == "table" and row.metadata.session_form or nil
    return row.type == consts.MSG_TYPE.USER and type(form) == "table" and form.pending == true
end

-- Pending answer rows of a session in history order, at most `limit`.
function message_repo.list_pending_answers(session_id, limit)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end
    local db, err = get_db()
    if err then return nil, err end

    local rows, query_err = sql.builder.select("message_id", "session_id", "date", "type", "data", "metadata")
        :from("messages")
        :where(sql.builder.and_({
            sql.builder.expr("session_id = ?", session_id),
            sql.builder.expr("type = ?", consts.MSG_TYPE.USER),
            sql.builder.expr("metadata LIKE ?", PENDING_ANSWER_PATTERN)
        }))
        :order_by("date ASC, message_id ASC")
        :limit(limit or 50)
        :run_with(db):query()
    db:release()
    if query_err then return nil, "Failed to list pending answers: " .. query_err end

    local pending = {}
    for _, row in ipairs(rows) do
        decode_metadata(row)
        if is_pending_answer(row) then table.insert(pending, row) end
    end
    return pending
end

-- Admits one pending answer row in a single transaction: the row gets a date
-- after everything already in the session (message_date.next of the
-- session's last_message_date), its pending marker is cleared, and the
-- session's last_message_date follows. Returns the admitted row, or nil
-- without an error when the row is not a pending answer of this session
-- (already admitted, or foreign), so a repeated admission is a no-op.
function message_repo.admit_pending_answer(session_id, message_id)
    if not session_id or session_id == "" then return nil, "Session ID is required" end
    if not message_id or message_id == "" then return nil, "Message ID is required" end

    local result, err = tx.run(function(dbtx)
        local rows, select_err = sql.builder.select("message_id", "session_id", "date", "type", "data", "metadata")
            :from("messages")
            :where("message_id = ?", message_id)
            :limit(1):run_with(dbtx):query()
        if select_err then return nil, "Failed to read answer: " .. select_err end
        if #rows == 0 then return false end
        local row = decode_metadata(rows[1])
        if row.session_id ~= session_id or not is_pending_answer(row) then return false end

        local session_rows, session_err = sql.builder.select("last_message_date")
            :from("sessions")
            :where("session_id = ?", session_id)
            :limit(1):run_with(dbtx):query()
        if session_err then return nil, "Failed to read session last message date: " .. session_err end
        if #session_rows == 0 then return nil, "Session not found" end

        local date = message_date.next(session_rows[1].last_message_date)
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

-- Whether a user row other than an answer to `exclude_artifact_id` was
-- stored after `after_date` - the "conversation moved on" test for a form.
-- opts.tx: run on a caller-supplied transaction.
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

    -- A form has at most one answer row, so two rows are enough to find one
    -- that is not it.
    local rows, query_err = sql.builder.select("message_id", "metadata")
        :from("messages")
        :where(sql.builder.and_({
            sql.builder.expr("session_id = ?", session_id),
            sql.builder.expr("type = ?", consts.MSG_TYPE.USER),
            sql.builder.expr("date > ?", after_date)
        }))
        :order_by("date ASC, message_id ASC")
        :limit(2)
        :run_with(conn):query()
    if db then db:release() end
    if query_err then return nil, "Failed to check later user input: " .. query_err end

    for _, row in ipairs(rows) do
        decode_metadata(row)
        local form = row.metadata.session_form
        if not (type(form) == "table" and exclude_artifact_id and form.artifact_id == exclude_artifact_id) then
            return true
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
