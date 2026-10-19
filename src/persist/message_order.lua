-- SQLite stores RFC3339Nano as text, whose variable-width fractions do not sort
-- chronologically (".11Z" sorts before ".1Z"). Normalize only the comparison key:
-- original dates, IDs and cursor contracts remain unchanged, including old rows.
-- Strip fractions before SQLite's date conversion to avoid millisecond rounding,
-- then append all nine fractional digits. Offset conversion affects whole seconds.
local time = require("time")
local message_order = {}

message_order.SQLITE_DATE = [[
    (strftime('%Y-%m-%dT%H:%M:%S', substr(date, 1, 19) ||
        CASE WHEN substr(date, -6, 1) IN ('+', '-') THEN substr(date, -6) ELSE 'Z' END)
    || '.' || substr(
        CASE WHEN substr(date, 20, 1) = '.' THEN
            substr(date, 21, length(date) - 20 -
                CASE WHEN substr(date, -6, 1) IN ('+', '-') THEN 6 ELSE 1 END)
        ELSE '' END || '000000000', 1, 9))
]]

function message_order.date(db_type: string): string
    if db_type == "sqlite" then return message_order.SQLITE_DATE end
    -- PostgreSQL already compares native timestamps, not text.
    return "date"
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
