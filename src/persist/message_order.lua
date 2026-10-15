-- SQLite stores RFC3339Nano as text, whose variable-width fractions do not sort
-- chronologically (".11Z" sorts before ".1Z"). Normalize only the comparison key:
-- original dates, IDs and cursor contracts remain unchanged, including old rows.
-- Strip fractions before SQLite's date conversion to avoid millisecond rounding,
-- then append all nine fractional digits. Offset conversion affects whole seconds.
local time = require("time")
local message_order = {}

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
-- `date`. SQLite compares the normalized key text, so the date is converted
-- to the same text; PostgreSQL compares the timestamp, so it passes as is.
function message_order.bind(db_type: string, date: string): string
    if db_type ~= "sqlite" then return date end
    local parsed = time.parse(time.RFC3339NANO, date)
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
        local parsed = time.parse(time.RFC3339NANO, key)
        if parsed then key = parsed:utc():format("2006-01-02T15:04:05.000000000Z") end
        keys[row] = key
    end
    table.sort(rows, function(a, b)
        if keys[a] ~= keys[b] then return keys[a] < keys[b] end
        return tostring(a.message_id) < tostring(b.message_id)
    end)
end

return message_order
