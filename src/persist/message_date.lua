local time = require("time")
local sql = require("sql")
local tx = require("tx")
local message_order = require("message_order")

-- Message dates. Rows order by (date, message_id), so a new or re-dated row
-- needs a date the store orders after every row of its session. next()
-- proposes the current time and asks the store, in the writing transaction
-- and after lock_session, whether any row sorts at or after it. If one does,
-- it steps just past the latest stored date. Dates are never chosen by
-- comparing stored values with the clock in Lua: the store compares them
-- as message_order.date does (a chronological key on SQLite, whose text
-- does not sort by time, and the timestamp on PostgreSQL, which rounds to
-- microseconds).

-- The layout of every new date: RFC3339 in UTC, with the fraction padded to 9
-- digits. A timestamp column discards an offset and keeps the wall clock, so
-- a date written in the host's offset would read hours off on a host that is
-- not in UTC.
local FIXED_LAYOUT = "2006-01-02T15:04:05.000000000Z07:00"

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

-- now(db_type) returns the current instant, fixed width, UTC. PostgreSQL
-- keeps microseconds and rounds a finer value, so for it the date is cut to
-- microseconds first: the date handed back is the date the row stores.
function message_date.now(db_type: string?)
    local now = time.now()
    if db_type == "postgres" then
        -- Seconds and the nanosecond part apart: a Lua number cannot hold
        -- the whole unix_nano() exactly.
        local nanosecond = now:nanosecond()
        now = time.unix(now:unix(), nanosecond - nanosecond % 1000)
    end
    return now:utc():format(FIXED_LAYOUT)
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
    local db_type = tx.type_of(conn)
    local rows, err = sql.builder.select("message_id")
        :from("messages")
        :where(sql.builder.and_({
            sql.builder.expr("session_id = ?", session_id),
            sql.builder.expr(message_order.date(db_type) .. " >= ?", message_order.bind(db_type, candidate)),
        }))
        :limit(1):run_with(conn):query()
    if err then
        return nil, "Failed to check message order: " .. tostring(err)
    end
    return #rows == 0
end

local function latest_date(conn, session_id)
    local rows, err = sql.builder.select(message_order.select_date(tx.type_of(conn)))
        :from("messages")
        :where("session_id = ?", session_id)
        :order_by(message_order.date(tx.type_of(conn)) .. " DESC")
        :limit(1):run_with(conn):query()
    if err then
        return nil, "Failed to read the latest message date: " .. tostring(err)
    end
    return rows[1] and rows[1].date
end

-- The instant a stored date names, in any layout it may come back in, or nil
-- when `value` is not such a date.
function message_date.parse_stored(value: any)
    return message_order.parse(value)
end

-- next(conn, session_id) returns a date the store orders after every
-- message of the session. Call it on the writing transaction after
-- lock_session(); a batch calls it once per row, each row inserted before
-- the next call.
--
-- It returns the current instant when that already sorts last. Otherwise
-- it returns the latest stored date plus the smallest step that sorts last,
-- in UTC. If no step does (the stored value cannot be
-- parsed), it returns the current instant and the tie falls to message_id,
-- rather than blocking writes to the session.
function message_date.next(conn, session_id)
    local now = message_date.now(tx.type_of(conn))
    local is_last, err = after_all_rows(conn, session_id, now)
    if err then return nil, err end
    if is_last then return now end

    local latest, latest_err = latest_date(conn, session_id)
    if latest_err then return nil, latest_err end
    local parsed = message_date.parse_stored(latest)
    if parsed then
        for _, step in ipairs(STEPS) do
            local candidate = parsed:add(step):utc():format(FIXED_LAYOUT)
            local sorts_last, check_err = after_all_rows(conn, session_id, candidate)
            if check_err then return nil, check_err end
            if sorts_last then return candidate end
        end
    end
    return now
end

return message_date
