local time = require("time")
local sql = require("sql")

-- Produces messages.date / sessions.last_message_date values for the
-- persist layer.
--
-- Messages are ordered by (date, message_id) in SQL, so every new or
-- re-dated row must get a date that the store orders after every other row
-- of its session. That order is the store's own: text comparison on SQLite,
-- timestamp comparison on PostgreSQL, where a value loses its offset and is
-- rounded to microseconds when stored, and may be read back with a
-- different offset label. So a date is never chosen by comparing a stored
-- value with the clock in Lua. next() proposes a value and asks the store,
-- in the writing transaction, whether any row of the session sorts at or
-- after it.
--
-- New values are RFC3339 in the host's offset with the fraction padded to 9
-- digits, the same layout the session already uses, so the current time
-- normally orders after the rows a session already holds. When it does not
-- (writes inside one clock tick or microsecond, a date ahead of the clock,
-- a change of the host offset, older trimmed values such as "...05.15Z",
-- which sorts after "...05.150000001Z" as text), next() steps just past the
-- latest stored date instead.
local FIXED_LAYOUT = "2006-01-02T15:04:05.000000000Z07:00"

-- Layouts a stored date may come back in: the RFC3339 text SQLite keeps, and
-- the forms a timestamp column may be returned in.
local READ_LAYOUTS = {
    time.RFC3339NANO,
    "2006-01-02 15:04:05.999999999Z07:00",
    "2006-01-02 15:04:05.999999999 -0700 MST",
    "2006-01-02 15:04:05.999999999",
}

-- Steps tried past the latest stored date, smallest first. One microsecond
-- survives a timestamp column; the larger steps get a text value past a
-- trimmed older one of the same second.
local STEPS = {
    time.MICROSECOND,
    time.MILLISECOND,
    10 * time.MILLISECOND,
    100 * time.MILLISECOND,
    time.SECOND,
}

local message_date = {}

-- Exposed so callers (and tests) can format an arbitrary time.Time with the
-- same fixed-width layout without duplicating the literal.
message_date.LAYOUT = FIXED_LAYOUT

-- now() returns the current instant, fixed width, host offset.
function message_date.now()
    return time.now():format(FIXED_LAYOUT)
end

-- Takes the session row's write lock in `conn` (a transaction) before the
-- caller reads anything it bases a date on, so concurrent writers of one
-- session run one after the other on every backend. Returns true, or nil
-- and "Session not found". Hold it until commit; call next() after it.
function message_date.lock_session(conn, session_id)
    local _, lock_err = sql.builder.update("sessions")
        :set("last_message_date", sql.builder.expr("last_message_date"))
        :where("session_id = ?", session_id)
        :run_with(conn):exec()
    if lock_err then
        return nil, "Failed to lock session: " .. tostring(lock_err)
    end

    -- Not rows_affected: some drivers report 0 for an update that changes
    -- nothing.
    local rows, select_err = sql.builder.select("session_id")
        :from("sessions")
        :where("session_id = ?", session_id)
        :limit(1):run_with(conn):query()
    if select_err then
        return nil, "Failed to read session: " .. tostring(select_err)
    end
    if #rows == 0 then
        return nil, "Session not found"
    end
    return true
end

-- Whether the store orders `candidate` after every message of the session.
local function after_all_rows(conn, session_id, candidate)
    local rows, err = sql.builder.select("message_id")
        :from("messages")
        :where(sql.builder.and_({
            sql.builder.expr("session_id = ?", session_id),
            sql.builder.expr("date >= ?", candidate),
        }))
        :limit(1):run_with(conn):query()
    if err then
        return nil, "Failed to check message order: " .. tostring(err)
    end
    return #rows == 0
end

local function latest_date(conn, session_id)
    local rows, err = sql.builder.select("date")
        :from("messages")
        :where("session_id = ?", session_id)
        :order_by("date DESC")
        :limit(1):run_with(conn):query()
    if err then
        return nil, "Failed to read the latest message date: " .. tostring(err)
    end
    return rows[1] and rows[1].date
end

local function parse_stored(value: any)
    if type(value) ~= "string" or value == "" then return nil end
    for _, layout in ipairs(READ_LAYOUTS) do
        local parsed, parse_err = time.parse(layout, value)
        if not parse_err and parsed then return parsed end
    end
    return nil
end

-- next(conn, session_id) returns a date the store orders after every
-- message of the session. Call it on the writing transaction after
-- lock_session(); a batch calls it once per row, each row inserted before
-- the next call.
--
-- It returns the current instant when that already sorts last. Otherwise
-- it returns the latest stored date plus the smallest step that sorts last,
-- formatted in that value's own offset, which keeps its wall-clock digits
-- on a timestamp column. If no step does (the stored value cannot be
-- parsed), it returns the current instant and the tie falls to message_id,
-- rather than blocking writes to the session.
function message_date.next(conn, session_id)
    local now = message_date.now()
    local is_last, err = after_all_rows(conn, session_id, now)
    if err then return nil, err end
    if is_last then return now end

    local latest, latest_err = latest_date(conn, session_id)
    if latest_err then return nil, latest_err end
    local parsed = parse_stored(latest)
    if parsed then
        for _, step in ipairs(STEPS) do
            local candidate = parsed:add(step):format(FIXED_LAYOUT)
            local sorts_last, check_err = after_all_rows(conn, session_id, candidate)
            if check_err then return nil, check_err end
            if sorts_last then return candidate end
        end
    end
    return now
end

return message_date
