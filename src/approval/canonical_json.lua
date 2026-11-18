local json = require("json")

-- Canonical JSON for tool approval digests and fingerprints (EE2-2710).
--
-- The design names wippy.agent:canonical, but on runtime 0.3.66a that encoder
-- can't be used for a security digest:
--   - it walks arrays with ipairs, so [1,null,3] and [1,null,9] both encode
--     as [1] (the JSON decoder leaves a hole for null);
--   - it turns every key into a string before the lookup, so {[2]="a",["2"]="b"}
--     encodes like {[2]="c",["2"]="b"};
--   - it writes null for a value json.encode can't encode (a function, NaN).
-- This encoder accepts only JSON-shaped values and refuses everything else
-- instead of substituting a value:
--   - strings (bytes kept as they are; ", \ and control bytes escaped);
--   - booleans; integers; finite floats ("%.17g", which round-trips);
--   - json.null, written as null;
--   - tables with only string keys (objects, keys in byte order) or only
--     positive integer keys (arrays up to the largest index, a hole written as
--     null, at most MAX_ARRAY items). An empty table is [].
-- Nesting deeper than MAX_DEPTH (32) levels is refused.
local canonical_json = {}

-- Each level costs two Lua frames; on runtime 0.3.66a 64 levels already
-- overflowed the call stack inside a test, so the limit stays well below.
-- The digest input wraps the arguments one level down, so arguments may nest
-- 31 levels; deeper ones fail to freeze and settle as not run.
canonical_json.MAX_DEPTH = 32
canonical_json.MAX_ARRAY = 100000

local function fail(message: string)
    error({ canonical_json = message }, 0)
end

local function encode_string(value: string): string
    local escaped = value:gsub('[%c"\\]', function(c: string): string
        if c == '"' then return '\\"' end
        if c == "\\" then return "\\\\" end
        return string.format("\\u%04x", string.byte(c))
    end)
    return '"' .. escaped .. '"'
end

local encode_value

local function encode_table(value: any, depth: integer, out: {string})
    if depth > canonical_json.MAX_DEPTH then fail("value nests deeper than " .. canonical_json.MAX_DEPTH .. " levels") end
    local string_keys, integer_keys, max_index = 0, 0, 0
    for key in pairs(value) do
        if type(key) == "string" then
            string_keys = string_keys + 1
        elseif type(key) == "number" and key == key and key % 1 == 0 and key >= 1 then
            -- Wippy's Lua reports array keys as numbers whose math.type is not
            -- always "integer"; any whole positive number is an array index.
            integer_keys = integer_keys + 1
            if key > max_index then max_index = key end
        else
            fail("a table key must be a string or a positive integer, got " .. type(key) .. " " .. tostring(key))
        end
    end
    if string_keys > 0 and integer_keys > 0 then fail("a table mixes string and integer keys") end
    if string_keys > 0 then
        local keys = {}
        for key in pairs(value) do keys[#keys + 1] = key end
        table.sort(keys)
        out[#out + 1] = "{"
        for index, key in ipairs(keys) do
            if index > 1 then out[#out + 1] = "," end
            out[#out + 1] = encode_string(key)
            out[#out + 1] = ":"
            encode_value(value[key], depth + 1, out)
        end
        out[#out + 1] = "}"
        return
    end
    if max_index > canonical_json.MAX_ARRAY then fail("an array index above " .. canonical_json.MAX_ARRAY) end
    out[#out + 1] = "["
    for index = 1, max_index do
        if index > 1 then out[#out + 1] = "," end
        local item = value[index]
        if item == nil then out[#out + 1] = "null" else encode_value(item, depth + 1, out) end
    end
    out[#out + 1] = "]"
end

encode_value = function(value: any, depth: integer, out: {string})
    local kind = type(value)
    if kind == "string" then
        out[#out + 1] = encode_string(value)
    elseif kind == "boolean" then
        out[#out + 1] = value and "true" or "false"
    elseif kind == "number" then
        if math.type(value) == "integer" then
            out[#out + 1] = string.format("%d", value)
        elseif value ~= value or value == math.huge or value == -math.huge then
            fail("a number is not finite")
        else
            out[#out + 1] = string.format("%.17g", value)
        end
    elseif kind == "table" then
        encode_table(value, depth, out)
    elseif value == json.null then
        out[#out + 1] = "null"
    elseif kind == "nil" then
        out[#out + 1] = "null"
    else
        fail("a " .. kind .. " value is not JSON")
    end
end

-- Returns the canonical text, or nil and the reason the value is not JSON-shaped.
function canonical_json.encode(value: any): (string?, string?)
    local out: {string} = {}
    local ok, err = pcall(encode_value, value, 1, out)
    if not ok then
        if type(err) == "table" and err.canonical_json then return nil, tostring(err.canonical_json) end
        return nil, tostring(err)
    end
    return table.concat(out), nil
end

return canonical_json
