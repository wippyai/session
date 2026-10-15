-- SQLite stores RFC3339Nano as text, whose variable-width fractions do not sort
-- chronologically (".11Z" sorts before ".1Z"). Normalize only the comparison key:
-- original dates, IDs and cursor contracts remain unchanged, including old rows.
-- Strip fractions before SQLite's date conversion to avoid millisecond rounding,
-- then append all nine fractional digits. Offset conversion affects whole seconds.
local time = require("time")
local message_order = {}

-- Layouts a stored date may come back in: the RFC3339 text SQLite keeps, and
-- the forms a timestamp column may be returned in.
local READ_LAYOUTS = {
    time.RFC3339NANO,
    "2006-01-02 15:04:05.999999999Z07:00",
    "2006-01-02 15:04:05.999999999 -0700 MST",
    "2006-01-02 15:04:05.999999999",
}

-- The instant a stored date names, in any layout it may come back in, or nil
-- when `value` is not such a date.
function message_order.parse(value: any)
    if type(value) ~= "string" or value == "" then return nil end
    for _, layout in ipairs(READ_LAYOUTS) do
        local parsed, parse_err = time.parse(layout, value)
        if not parse_err and parsed then return parsed end
    end
    return nil
end

-- PostgreSQL's driver returns a timestamp column at one-second precision, so
-- a date read as is loses its fraction and rows of one second tie. Reads of a
-- message date select this text instead: UTC, in the nine-digit layout of
-- message_date.LAYOUT (the column holds microseconds, so the last three
-- digits are zeros).
local POSTGRES_READ_DATE = [[to_char(@DATE@, 'YYYY-MM-DD"T"HH24:MI:SS.US"000Z"') AS date]]

-- The select-list item that reads a message date in full precision. `column`
-- qualifies the date column (default "date"); the result is always named
-- "date" on PostgreSQL.
function message_order.select_date(db_type: string, column: string?): string
    if db_type ~= "postgres" then return column or "date" end
    local item = string.gsub(POSTGRES_READ_DATE, "@DATE@", column or "date")
    return item
end

local SQLITE_KEY_TEMPLATE = [[
    (strftime('%Y-%m-%dT%H:%M:%S', substr(@DATE@, 1, 19) ||
        CASE WHEN substr(@DATE@, -6, 1) IN ('+', '-') THEN substr(@DATE@, -6) ELSE 'Z' END)
    || '.' || substr(
        CASE WHEN substr(@DATE@, 20, 1) = '.' THEN
            substr(@DATE@, 21, length(@DATE@) - 20 -
                CASE WHEN substr(@DATE@, -6, 1) IN ('+', '-') THEN 6 ELSE 1 END)
        ELSE '' END || '000000000', 1, 9))
]]

-- The SQLite key over `column`, a (possibly qualified) date column.
local function sqlite_date(column: string): string
    local key = string.gsub(SQLITE_KEY_TEMPLATE, "@DATE@", column)
    return key
end

message_order.SQLITE_DATE = sqlite_date("date")

-- The SQL expression that orders and compares message dates. `column`
-- qualifies the date column when the query aliases the messages table
-- (for example "m.date").
function message_order.date(db_type: string, column: string?): string
    if db_type == "sqlite" then
        if column == nil or column == "date" then return message_order.SQLITE_DATE end
        return sqlite_date(column)
    end
    -- PostgreSQL already compares native timestamps, not text.
    return column or "date"
end

-- The value to compare with message_order.date(db_type) for the stored date
-- `date`, in any layout a stored date comes back in. SQLite compares the
-- normalized key text, so the date is converted to the same text. PostgreSQL
-- compares the timestamp, which drops an offset it is given, so the date goes
-- as the UTC wall clock. A value that is no date passes as is.
function message_order.bind(db_type: string, date: string): string
    local parsed = message_order.parse(date)
    if not parsed then return date end
    return parsed:utc():format("2006-01-02T15:04:05.000000000")
end

-- Steering rows can be re-anchored after retrieval. Use the same chronological
-- order there, parsing with the runtime's time SDK once per row, not per comparison.
function message_order.sort(rows: {any})
    if #rows < 2 then return end
    local keys = {}
    for _, row in ipairs(rows) do
        local key = tostring(row.date or "")
        local parsed = message_order.parse(key)
        if parsed then key = parsed:utc():format("2006-01-02T15:04:05.000000000Z") end
        keys[row] = key
    end
    table.sort(rows, function(a, b)
        if keys[a] ~= keys[b] then return keys[a] < keys[b] end
        return tostring(a.message_id) < tostring(b.message_id)
    end)
end

return message_order
