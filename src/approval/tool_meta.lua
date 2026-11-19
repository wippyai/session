-- Reads the `approval` field of a tool's registry meta. Two forms:
--
--   approval: required                       short form
--   approval: { required: true, approve_all: true | false }   object form
--
-- read() never fails: tool metadata belongs to the tool author, and a mistake
-- there must not stop the turn. It fails closed instead and reports why in
-- `warnings` for the caller to log:
--   - an unknown string in the short form marks the tool as required;
--   - the object form marks the tool when `required` is true; an absent or
--     false `required` leaves it unmarked, and a non-boolean `required` marks it;
--   - a non-boolean `approve_all` reads as false (no Approve all, no grant);
--   - unknown object keys are ignored, so a tool written for a later phase
--     still asks on this Session.
-- `approval: true` marks the tool and `approval: false` does not.
-- The field does nothing unless the session is protected (the gate decides).
local registry = require("registry")

local tool_meta = {}

-- Test seam: replaces registry.get.
tool_meta._registry_get = nil :: any

tool_meta.SHORT_REQUIRED = "required"

local KNOWN_KEYS = { required = true, approve_all = true }

-- Returns { required = boolean, approve_all = true | false | nil, warnings = {string} }.
-- approve_all nil means "tool option absent" (the combination table column).
function tool_meta.read(meta: any)
    local out = { required = false, approve_all = nil, warnings = {} }
    local approval = type(meta) == "table" and meta.approval or nil
    if approval == nil then return out end

    if approval == true then
        out.required = true
        return out
    end
    if approval == false then return out end

    if type(approval) == "string" then
        out.required = true
        if approval ~= tool_meta.SHORT_REQUIRED then
            out.warnings[#out.warnings + 1] = "meta.approval '" .. approval
                .. "' is not a known short form; the tool is treated as required"
        end
        return out
    end

    if type(approval) ~= "table" then
        out.required = true
        out.warnings[#out.warnings + 1] = "meta.approval must be a string or an object; the tool is treated as required"
        return out
    end

    local unknown = {}
    for key in pairs(approval) do
        if not KNOWN_KEYS[key] then unknown[#unknown + 1] = tostring(key) end
    end
    table.sort(unknown)
    for _, key in ipairs(unknown) do
        out.warnings[#out.warnings + 1] = "meta.approval." .. key .. " is not known to this Session version and is ignored"
    end

    local required = approval.required
    if required == true then
        out.required = true
    elseif required ~= nil and required ~= false then
        out.required = true
        out.warnings[#out.warnings + 1] = "meta.approval.required must be a boolean; the tool is treated as required"
    end

    local approve_all = approval.approve_all
    if approve_all == true or approve_all == false then
        out.approve_all = approve_all
    elseif approve_all ~= nil then
        out.approve_all = false
        out.warnings[#out.warnings + 1] = "meta.approval.approve_all must be a boolean; Approve all is not offered for this tool"
    end
    return out
end

-- The registry entry of `id`. Returns nil, nil when the registry has no such
-- entry, and nil, err when the read failed (registry.get raised or returned
-- an error other than not found).
function tool_meta.entry(id: any): (any, string?)
    if type(id) ~= "string" or id == "" then return nil, nil end
    local ok, entry, err = pcall(tool_meta._registry_get or registry.get, id)
    if not ok then return nil, tostring(entry) end
    if type(entry) == "table" then return entry, nil end
    if err == nil or errors.is(err, errors.NOT_FOUND) then return nil, nil end
    return nil, tostring(err)
end

-- The tool option approve_all (true, false or nil for absent) of an entry.
function tool_meta.approve_all(entry: any): boolean?
    return tool_meta.read(type(entry) == "table" and entry.meta or nil).approve_all
end

-- A non-empty text field of an entry's meta, or nil.
function tool_meta.text(entry: any, key: string): string?
    local meta = type(entry) == "table" and entry.meta or nil
    local value = type(meta) == "table" and meta[key] or nil
    if type(value) == "string" and value ~= "" then return value end
    return nil
end

-- The title people see for an entry: meta.title, else meta.name, else
-- `fallback`.
function tool_meta.title(entry: any, fallback: any): string
    return tool_meta.text(entry, "title") or tool_meta.text(entry, "name") or tostring(fallback or "")
end

return tool_meta
