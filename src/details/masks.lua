local json = require("json")

local masks: any = { HIDDEN = "[hidden: sensitive]" }

function masks.copy(value: any): any
    if value == json.null or type(value) ~= "table" then return value end
    local out: any = {}
    for key, child in pairs(value) do out[key] = masks.copy(child) end
    local mt = getmetatable(value)
    if type(mt) == "table" then setmetatable(out, mt) end
    return out
end

-- Keep explicit JSON nulls at public projection boundaries. The runtime
-- decoder otherwise removes null object members.
function masks.decode(raw: string): (any, any)
    local decoded, err = json.decode(raw)
    if err then return nil, err end
    local marker = "__wippy_details_null__"
    while raw:find(marker, 1, true) do marker = marker .. "_" end
    local out, index, quoted, escaped = {}, 1, false, false
    while index <= #raw do
        local char = raw:sub(index, index)
        if not quoted and raw:sub(index, index + 3) == "null" then
            out[#out + 1] = '"' .. marker .. '"'
            index = index + 4
        else
            out[#out + 1] = char
            if quoted then
                if escaped then escaped = false
                elseif char == string.char(92) then escaped = true
                elseif char == '"' then quoted = false end
            elseif char == '"' then quoted = true end
            index = index + 1
        end
    end
    local value, parse_err = json.decode(table.concat(out))
    if parse_err then return nil, parse_err end
    local function restore(child: any): any
        if child == marker then return json.null end
        if type(child) == "table" then
            for key, member in pairs(child) do child[key] = restore(member) end
        end
        return child
    end
    return restore(value), nil
end

function masks.escape(key: any): string
    return tostring(key):gsub("~", "~0"):gsub("/", "~1")
end

function masks.tokens(path: any): any
    if type(path) ~= "string" then return nil end
    if path == "" then return {} end
    if path:sub(1, 1) ~= "/" or path:find("~[^01]") or path:sub(-1) == "~" then return nil end
    local out = {}
    for token in (path:sub(2) .. "/"):gmatch("(.-)/") do
        out[#out + 1] = token:gsub("~1", "/"):gsub("~0", "~")
    end
    return out
end

function masks.valid(paths: any): boolean
    if type(paths) ~= "table" or paths == json.null then return false end
    local count = 0
    for key, path in pairs(paths) do
        if type(key) ~= "number" or key < 1 or key % 1 ~= 0 or not masks.tokens(path) then return false end
        count = count + 1
    end
    return count == #paths
end

function masks.union(left: any, right: any): any
    local seen, out = {}, {}
    for _, paths in ipairs({ left or {}, right or {} }) do
        for _, path in ipairs(paths) do
            if not seen[path] then seen[path] = true; out[#out + 1] = path end
        end
    end
    table.sort(out)
    return out
end

local function key_of(value: any, token: string): any
    if value[token] ~= nil then return token end
    if token == "0" or token:match("^[1-9][0-9]*$") then
        local index = tonumber(token)
        if index then return index + 1 end
    end
    return token
end

function masks.apply(value: any, paths: any): (any, any)
    local out, matched = masks.copy(value), {}
    for _, path in ipairs(paths or {}) do
        local tokens = masks.tokens(path)
        if tokens then
            if #tokens == 0 then
                out = masks.HIDDEN
                matched[#matched + 1] = path
            else
                local parent = out
                for index = 1, #tokens - 1 do
                    if type(parent) ~= "table" or parent == json.null then parent = nil; break end
                    parent = parent[key_of(parent, tokens[index])]
                end
                if type(parent) == "table" and parent ~= json.null then
                    local key = key_of(parent, tokens[#tokens])
                    if parent[key] ~= nil then
                        parent[key] = masks.HIDDEN
                        matched[#matched + 1] = path
                    end
                end
            end
        end
    end
    return out, masks.union(matched, {})
end

-- Expand schema marks into concrete captured paths before storing them.
function masks.schema(schema: any, value: any): (any, boolean)
    if type(schema) == "string" then
        local decoded, err = json.decode(schema)
        if err then return {}, false end
        schema = decoded
    end
    if schema == nil then return {}, true end
    if type(schema) ~= "table" then return {}, false end
    local root, paths, valid = schema, {}, true
    local function contains_mark(node: any, depth: number): boolean
        if type(node) ~= "table" then return false end
        if depth > 64 then return true end
        if node.writeOnly ~= nil and node.writeOnly ~= false then return true end
        if node["$ref"] then
            local ref = node["$ref"]
            if type(ref) ~= "string" or ref:sub(1, 1) ~= "#" then return true end
            local tokens = masks.tokens(ref:sub(2))
            if not tokens then return true end
            local target = root
            for _, key in ipairs(tokens) do target = type(target) == "table" and target[key] or nil end
            if contains_mark(target, depth + 1) then return true end
        end
        for _, child in pairs(node) do
            if contains_mark(child, depth + 1) then return true end
        end
        return false
    end
    local mapped = { properties = true, additionalProperties = true, items = true, prefixItems = true,
        allOf = true, anyOf = true, oneOf = true, ["$ref"] = true, ["$defs"] = true, definitions = true }
    local function walk(node: any, captured: any, path: string, depth: number)
        if captured == nil then return end
        if type(node) == "boolean" then return end
        if type(node) ~= "table" or depth > 64 then valid = false; return end
        if node.writeOnly ~= nil and type(node.writeOnly) ~= "boolean" then valid = false end
        if node.writeOnly == true then paths[#paths + 1] = path; return end
        -- Unknown applicators cannot be mapped to concrete captured paths.
        -- This includes patternProperties: Lua patterns are not JSON Schema regexes.
        for keyword, child in pairs(node) do
            if not mapped[keyword] and contains_mark(child, depth + 1) then valid = false; return end
        end
        if node["$ref"] then
            local ref = node["$ref"]
            if type(ref) ~= "string" or ref:sub(1, 1) ~= "#" then valid = false; return end
            local tokens = masks.tokens(ref:sub(2))
            local target = root
            if not tokens then valid = false; return end
            for _, key in ipairs(tokens) do target = type(target) == "table" and target[key] or nil end
            walk(target, captured, path, depth + 1)
        end
        for _, keyword in ipairs({ "allOf", "anyOf", "oneOf" }) do
            if node[keyword] ~= nil then
                if type(node[keyword]) ~= "table" then valid = false; return end
                for _, child in ipairs(node[keyword]) do walk(child, captured, path, depth + 1) end
            end
        end
        if type(captured) ~= "table" or captured == json.null then return end
        if node.properties ~= nil then
            if type(node.properties) ~= "table" then valid = false; return end
            for key, child in pairs(node.properties) do
                walk(child, captured[key], path .. "/" .. masks.escape(key), depth + 1)
            end
        end
        if type(node.additionalProperties) == "table" then
            for key, child in pairs(captured) do
                if type(key) == "string" and (type(node.properties) ~= "table" or node.properties[key] == nil) then
                    walk(node.additionalProperties, child, path .. "/" .. masks.escape(key), depth + 1)
                end
            end
        elseif node.additionalProperties ~= nil and type(node.additionalProperties) ~= "boolean" then
            valid = false
        end
        for index, child in ipairs(captured) do
            local item = type(node.prefixItems) == "table" and node.prefixItems[index] or node.items
            if type(node.items) == "table" and node.items[1] ~= nil then item = node.items[index] end
            if item ~= nil then walk(item, child, path .. "/" .. (index - 1), depth + 1) end
        end
    end
    walk(schema, value, "", 0)
    return masks.union(paths, {}), valid
end

return masks