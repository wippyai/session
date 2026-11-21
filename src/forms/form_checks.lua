local form_text = require("form_text")

-- Checks of the raw keys of an agent-authored definition, shared by the
-- definition (definition.lua) and the standard fields (field_values.lua).
-- definition.lua imports field_values, so neither of them can own what both
-- use; it lives here, on top of the text rules of form_text. Pure functions,
-- no I/O.
--
-- Rejections are { path, code, message } items appended to an errors list, as
-- definition.normalize returns them. Array positions in paths are 0-based, as
-- in the JSON the agent wrote.

local form_checks = {}

local function add_error(errors: {any}, path: string, code: string, message: string)
    table.insert(errors, { path = path, code = code, message = message })
end

-- Checks an optional or required plain-text definition value. Returns the
-- value to keep (nil for an omitted optional value) and whether it was valid.
-- opts.strict applies the rules for new definitions (control characters);
-- stored definitions are read without them so a later tightening never makes
-- an existing form unreadable.
local function check_text(errors: {any}, path: string, value: any,
    opts: {required: boolean, min: number?, max: number, strict: boolean?, multiline: boolean?})
    if value == nil then
        if opts.required then
            add_error(errors, path, "required", "A value is required.")
            return nil, false
        end
        return nil, true
    end
    if type(value) ~= "string" then
        add_error(errors, path, "invalid_type", "Must be a string.")
        return nil, false
    end
    local length = form_text.char_length(value)
    if not length then
        add_error(errors, path, "invalid_text", "Must be valid UTF-8 text.")
        return nil, false
    end
    if opts.required and form_text.is_blank(value) then
        add_error(errors, path, "blank", "Must contain visible text.")
        return nil, false
    end
    if opts.strict and form_text.has_control_characters(value, opts.multiline == true) then
        add_error(errors, path, "control_characters", opts.multiline
            and "Must not contain control characters other than tabs and line breaks."
            or "Must not contain control characters or line breaks.")
        return nil, false
    end
    if length > opts.max then
        add_error(errors, path, "too_long", string.format("Must be at most %d characters.", opts.max))
        return nil, false
    end
    if not opts.required and length == 0 then
        return nil, true
    end
    return value, true
end

local function check_boolean(errors: {any}, path: string, value: any): boolean
    if value == nil then return false end
    if type(value) ~= "boolean" then
        add_error(errors, path, "invalid_type", "Must be true or false.")
        return false
    end
    return value
end

local function check_unknown_keys(errors: {any}, path: string, value: table, allowed: {[string]: boolean})
    local unknown = {}
    for key in pairs(value) do
        if not allowed[key] then table.insert(unknown, tostring(key)) end
    end
    table.sort(unknown)
    for _, key in ipairs(unknown) do
        add_error(errors, path == "" and key or (path .. "." .. key), "unknown_key",
            "Unknown key \"" .. key .. "\".")
    end
end

form_checks.add_error = add_error
form_checks.check_text = check_text
form_checks.check_boolean = check_boolean
form_checks.check_unknown_keys = check_unknown_keys

return form_checks
