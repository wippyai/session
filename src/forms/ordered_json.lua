local json = require("json")

-- JSON text with a fixed key order and explicit nulls, for everything the
-- forms write whose layout a reader or a comparison relies on: the answer
-- record, the canonical answers used for replay, the read_form result and
-- the state API bodies. json.encode writes an object's keys in no fixed
-- order, and a nil value is no key at all, so it cannot write null.

local ordered_json = {}

-- An object with keys in the order given. Each entry is { key, value } or
-- { key, raw = "<json>" } for a value that is already JSON text; a nil value
-- is written as null.
function ordered_json.object(entries: {any}): string
    local parts = {}
    for _, entry in ipairs(entries) do
        local encoded
        if entry.raw ~= nil then
            encoded = entry.raw
        elseif entry[2] == nil then
            encoded = "null"
        else
            encoded = json.encode(entry[2])
        end
        table.insert(parts, (json.encode(entry[1])) .. ":" .. tostring(encoded))
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

-- An array of items that are already JSON text, in the order given.
function ordered_json.array(items: {string}): string
    return "[" .. table.concat(items, ",") .. "]"
end

return ordered_json
