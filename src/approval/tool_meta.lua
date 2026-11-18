-- Reads the `approval` field of a tool's registry meta (EE2-2710,
-- architecture 4.3). Two forms:
--
--   approval: required                       short form
--   approval: { required: true, approve_all: true | false }   object form
--
-- read() never fails: tool metadata belongs to the tool author, and a mistake
-- there must not stop the turn. It fails closed instead and reports why in
-- `warnings` for the caller to log:
--   - an unknown string in the short form marks the tool as required;
--   - the object form marks the tool when `required` is true (architecture
--     4.3: "`approval.required: true`"); an absent or false `required` leaves
--     it unmarked, and a non-boolean `required` marks it;
--   - a non-boolean `approve_all` reads as false (no Approve all, no grant);
--   - unknown object keys are ignored, so a tool written for a later phase
--     still asks on a Phase 1 Session.
-- `approval: true` marks the tool and `approval: false` does not.
-- The field does nothing unless the session is protected (the gate decides).
local tool_meta = {}

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

return tool_meta
