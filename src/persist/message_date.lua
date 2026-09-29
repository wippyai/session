local time = require("time")

-- Produces messages.date / sessions.last_message_date values for the
-- persist layer.
--
-- Every new value is RFC3339 in the host's offset (as before; "Z" on UTC
-- hosts), with the nanosecond fraction padded to exactly 9 digits. The old
-- `time.now():format(time.RFC3339NANO)` trimmed trailing fractional zeros,
-- so on UTC hosts "...05.1Z" sorted after "...05.15Z" as text (SQLite
-- stores the column as text; PostgreSQL's `timestamp` accepts this layout).
-- Keeping the host offset, rather than switching to UTC, keeps new rows in
-- text order with the rows existing sessions already hold: a trimmed old
-- value sorts before any fixed-width value of the same or a later instant.
-- A change of the host offset (DST) can still misorder rows across it, as
-- before. Existing rows are not rewritten; `next()` parses both forms.
local FIXED_LAYOUT = "2006-01-02T15:04:05.000000000Z07:00"

local message_date = {}

-- Exposed so callers (and tests) can format an arbitrary time.Time with the
-- same fixed-width layout without duplicating the literal.
message_date.LAYOUT = FIXED_LAYOUT

-- now() returns the current instant, fixed width, host offset.
function message_date.now()
    return time.now():format(FIXED_LAYOUT)
end

-- next(last_date) returns a date strictly greater than last_date (an
-- existing messages.date or sessions.last_message_date value - old format,
-- new format, or nil/"" when the session has no prior row yet).
--
-- It returns the current instant when that already sorts after last_date;
-- otherwise it returns last_date + 1 nanosecond. This keeps a burst of
-- writes inside a single clock tick - including the rows of one
-- create_batch call, chained by passing each row's date back in as the next
-- call's last_date - strictly increasing instead of colliding on a shared
-- timestamp (which previously left the tie to fall to message_id order).
function message_date.next(last_date)
    local now = time.now()

    if not last_date or last_date == "" then
        return now:format(FIXED_LAYOUT)
    end

    local last, parse_err = time.parse(time.RFC3339NANO, last_date)
    if parse_err then
        -- Unparseable legacy value: do not let it block forward progress.
        return now:format(FIXED_LAYOUT)
    end

    if now:after(last) then
        return now:format(FIXED_LAYOUT)
    end

    -- Stay in the parsed value's own offset so the result sorts after it as text.
    return last:add(time.NANOSECOND):format(FIXED_LAYOUT)
end

return message_date
