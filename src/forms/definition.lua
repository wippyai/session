local json = require("json")
local ordered_json = require("ordered_json")
local form_text = require("form_text")
local form_checks = require("form_checks")
local field_values = require("field_values")

-- Session forms contract: the definition an agent authors and the answers a
-- user submits for it. A field is a choice (defined here) or one of the
-- standard types text, textarea, number, email, date and checkbox (defined
-- in field_values.lua).
--
-- Pure functions, no I/O. Every rejection carries a stable `code`, a `path`
-- (definition) or field id (answers) and a plain `message`. Array positions
-- in paths are 0-based, as in the JSON the agent wrote.
--
-- Answers are validated one field at a time with explicit checks rather than
-- one json.validate call over the whole object: the runtime validator names
-- only the first violation of a document, and an empty Lua table is
-- indistinguishable from an empty array.

local definition = {}

-- The version of a form follows its definition: a form of choice fields only
-- is version 1, exactly as it was before standard fields existed, and a form
-- with any other field is version 2. A reader that only knows version 1 shows
-- a notice for a version 2 form instead of rendering it wrongly.
definition.VERSIONS = { CHOICES = 1, FIELDS = 2 }

function definition.version_of(def: any): integer
    for _, field in ipairs(def.fields) do
        if field.type ~= "choice" then return definition.VERSIONS.FIELDS end
    end
    return definition.VERSIONS.CHOICES
end

definition.LIMITS = {
    TITLE = 160,
    DESCRIPTION = 1000,
    SUBMIT_LABEL = 40,
    ANSWERED_MESSAGE = 200,
    FIELDS = 20,
    LABEL = 240,
    OPTIONS = 20,
    OPTION_TEXT = 240,
    OTHER_TEXT = 2000,
    NOTE_TEXT = 1000,
    DEFINITION_BYTES = 32 * 1024,
}

local FIELD_ID_PATTERN = "^[a-z][a-z0-9_]*$"
local FIELD_ID_MAX = 40

-- A valid Other/note answer is at most LIMIT UTF-8 characters (4 bytes
-- each) plus whatever surrounding whitespace a real client sends. This
-- bounds every per-byte scan on the raw value to a small multiple of the
-- limit, independent of the 64 KiB body cap, before any of them run.
local RAW_TEXT_MULTIPLIER = 8

local ROOT_KEYS = {
    title = true, description = true, submit_label = true, answered_message = true, fields = true,
}
local FIELD_KEYS = {
    id = true, type = true, label = true, description = true, required = true,
    options = true, multiple = true, allow_other = true,
}
local OPTION_KEYS = { value = true, label = true, description = true }

---------------------------------------------------------------------------
-- Small shape helpers
---------------------------------------------------------------------------

-- A decoded JSON array: a table whose keys are exactly 1..n.
local function is_array(value: any): boolean
    if type(value) ~= "table" then return false end
    local count = 0
    for key in pairs(value) do
        if type(key) ~= "number" or key < 1 or key ~= math.floor(key) then return false end
        count = count + 1
    end
    return count == #value
end

-- A decoded JSON object: a table whose keys are all strings. An empty table
-- passes both is_array and is_object; callers decide what empty means.
local function is_object(value: any): boolean
    if type(value) ~= "table" then return false end
    for key in pairs(value) do
        if type(key) ~= "string" then return false end
    end
    return true
end

local is_blank = form_text.is_blank
local add_error = form_checks.add_error
local check_text = form_checks.check_text
local check_boolean = form_checks.check_boolean
local check_unknown_keys = form_checks.check_unknown_keys

---------------------------------------------------------------------------
-- Definition
---------------------------------------------------------------------------

local function normalize_option(errors: {any}, path: string, raw: any, strict: boolean): any
    if type(raw) == "string" then
        local value = check_text(errors, path, raw,
            { required = true, max = definition.LIMITS.OPTION_TEXT, strict = strict })
        if not value then return nil end
        return { value = value, label = value }
    end
    if type(raw) ~= "table" or not is_object(raw) or next(raw) == nil then
        add_error(errors, path, "invalid_type", "An option is a string or an object with value and label.")
        return nil
    end
    local before = #errors
    check_unknown_keys(errors, path, raw, OPTION_KEYS)
    local value = check_text(errors, path .. ".value", raw.value,
        { required = true, max = definition.LIMITS.OPTION_TEXT, strict = strict })
    local label = check_text(errors, path .. ".label", raw.label,
        { required = true, max = definition.LIMITS.OPTION_TEXT, strict = strict })
    local description = check_text(errors, path .. ".description", raw.description,
        { required = false, max = definition.LIMITS.DESCRIPTION, strict = strict, multiline = true })
    if #errors > before then return nil end
    return { value = value, label = label, description = description }
end

local function normalize_field(errors: {any}, path: string, raw: any, seen_ids: {[string]: boolean}, strict: boolean): any
    if type(raw) ~= "table" or not is_object(raw) or next(raw) == nil then
        add_error(errors, path, "invalid_type", "A field is an object.")
        return nil
    end
    local before = #errors
    -- The keys a field may carry depend on its type.
    local standard = field_values.is_standard(raw.type)
    check_unknown_keys(errors, path, raw, standard and field_values.KEYS[raw.type] or FIELD_KEYS)

    local id = raw.id
    if id == nil then
        add_error(errors, path .. ".id", "required", "A field id is required.")
    elseif type(id) ~= "string" then
        add_error(errors, path .. ".id", "invalid_type", "Must be a string.")
    elseif #id > FIELD_ID_MAX or not string.match(id, FIELD_ID_PATTERN) then
        add_error(errors, path .. ".id", "invalid_id",
            "Must start with a lowercase letter and use only a-z, 0-9 and _ (at most 40 characters).")
    elseif seen_ids[id] then
        add_error(errors, path .. ".id", "duplicate_id", "Field id \"" .. id .. "\" is used more than once.")
    else
        seen_ids[id] = true
    end

    local unsupported = false
    if raw.type == nil then
        add_error(errors, path .. ".type", "required", "A field type is required.")
    elseif raw.type ~= "choice" and not standard then
        unsupported = true
        add_error(errors, path .. ".type", "unsupported_type",
            "Supported types: " .. field_values.TYPE_NAMES .. ".")
    end

    local label = check_text(errors, path .. ".label", raw.label,
        { required = true, max = definition.LIMITS.LABEL, strict = strict })
    local description = check_text(errors, path .. ".description", raw.description,
        { required = false, max = definition.LIMITS.DESCRIPTION, strict = strict, multiline = true })
    local required = check_boolean(errors, path .. ".required", raw.required)

    if standard then
        local field = field_values.normalize(errors, path, raw, {
            id = id, type = raw.type, label = label, description = description, required = required,
        }, strict)
        if #errors > before then return nil end
        return field
    end

    -- A field of an unknown type is not a choice that forgot its options:
    -- the type is the one thing to fix, so no choice rule is applied to it.
    if unsupported then return nil end

    local multiple = check_boolean(errors, path .. ".multiple", raw.multiple)
    local allow_other = check_boolean(errors, path .. ".allow_other", raw.allow_other)

    local options = {}
    local options_path = path .. ".options"
    if raw.options == nil then
        add_error(errors, options_path, "required", "A choice field needs options.")
    elseif not is_array(raw.options) then
        add_error(errors, options_path, "invalid_type", "Must be a list of options.")
    elseif #raw.options == 0 then
        add_error(errors, options_path, "too_few", "At least one option is required.")
    elseif #raw.options > definition.LIMITS.OPTIONS then
        add_error(errors, options_path, "too_many",
            string.format("At most %d options are allowed.", definition.LIMITS.OPTIONS))
    else
        local seen_values = {}
        for index, raw_option in ipairs(raw.options) do
            local option_path = string.format("%s[%d]", options_path, index - 1)
            local option = normalize_option(errors, option_path, raw_option, strict)
            if option then
                if seen_values[option.value] then
                    add_error(errors, option_path, "duplicate_option",
                        "Option value \"" .. option.value .. "\" appears more than once.")
                else
                    seen_values[option.value] = true
                    table.insert(options, option)
                end
            end
        end
    end

    if #errors > before then return nil end
    return {
        id = id,
        type = "choice",
        label = label,
        description = description,
        required = required,
        options = options,
        multiple = multiple,
        allow_other = allow_other,
    }
end

-- Normalizes an agent-authored definition. Returns (normalized, nil) or
-- (nil, errors) where errors is a list of { path, code, message }.
-- Strings in `options` become { value = s, label = s }; booleans default to
-- false; empty optional descriptions are dropped.
-- opts.stored skips the rules that could refuse a form accepted earlier, so
-- it stays readable: the control-character rule and, for standard fields, the
-- policy checks (pattern subset, default, ranges and the text budget). The
-- structural checks still apply.
function definition.normalize(raw: any, opts: {stored: boolean?}?): (any, {any}?)
    local errors = {}
    local strict = not (opts and opts.stored)
    if type(raw) ~= "table" or not is_object(raw) or next(raw) == nil then
        add_error(errors, "", "invalid_type", "The form definition must be an object with title and fields.")
        return nil, errors
    end
    check_unknown_keys(errors, "", raw, ROOT_KEYS)

    local title = check_text(errors, "title", raw.title,
        { required = true, max = definition.LIMITS.TITLE, strict = strict })
    local description = check_text(errors, "description", raw.description,
        { required = false, max = definition.LIMITS.DESCRIPTION, strict = strict, multiline = true })
    local submit_label = check_text(errors, "submit_label", raw.submit_label,
        { required = false, max = definition.LIMITS.SUBMIT_LABEL, strict = strict })
    if submit_label and is_blank(submit_label) then
        add_error(errors, "submit_label", "blank", "Must contain visible text.")
    end
    -- The user's chat message once they answer (answer_text.sentence); never
    -- shown on the form itself.
    local answered_message = check_text(errors, "answered_message", raw.answered_message,
        { required = false, max = definition.LIMITS.ANSWERED_MESSAGE, strict = strict })
    if answered_message and is_blank(answered_message) then
        add_error(errors, "answered_message", "blank", "Must contain visible text.")
    end

    local fields = {}
    if raw.fields == nil then
        add_error(errors, "fields", "required", "At least one field is required.")
    elseif not is_array(raw.fields) then
        add_error(errors, "fields", "invalid_type", "Must be a list of fields.")
    elseif #raw.fields == 0 then
        add_error(errors, "fields", "too_few", "At least one field is required.")
    elseif #raw.fields > definition.LIMITS.FIELDS then
        add_error(errors, "fields", "too_many",
            string.format("At most %d fields are allowed.", definition.LIMITS.FIELDS))
    else
        local seen_ids = {}
        for index, raw_field in ipairs(raw.fields) do
            local field = normalize_field(errors, string.format("fields[%d]", index - 1), raw_field, seen_ids, strict)
            if field then table.insert(fields, field) end
        end
        -- Every answer of the form must fit the request body cap: see
        -- field_values.LIMITS.TEXT_BUDGET. Not applied to a stored form.
        local budget = field_values.text_budget(fields)
        if strict and budget > field_values.LIMITS.TEXT_BUDGET then
            add_error(errors, "fields", "text_budget_exceeded", string.format(
                "The text, textarea and email fields can hold %d characters in all, over the %d allowed. "
                .. "Lower max_length on some of them, or use fewer.", budget, field_values.LIMITS.TEXT_BUDGET))
        end
    end

    if #errors > 0 then return nil, errors end

    local normalized = {
        title = title,
        description = description,
        submit_label = submit_label,
        answered_message = answered_message,
        fields = fields,
    }
    local encoded = json.encode(normalized)
    if type(encoded) ~= "string" or #encoded > definition.LIMITS.DEFINITION_BYTES then
        add_error(errors, "", "too_large", string.format(
            "The definition is %d bytes once normalized, over the %d byte limit. This is measured "
            .. "after normalization, where every plain string option becomes {\"value\":..,\"label\":..}, "
            .. "so a compact-looking definition with many short string options can be well over the limit "
            .. "before it is written out this way. Use fewer fields/options, or fewer plain string options.",
            type(encoded) == "string" and #encoded or -1, definition.LIMITS.DEFINITION_BYTES))
        return nil, errors
    end
    return normalized, nil
end

-- One line per error, "path: code: message", for tool results and logs.
function definition.format_errors(errors: {any}?): string
    local lines = {}
    for _, item in ipairs(errors or {}) do
        local path = item.path ~= "" and item.path or "(definition)"
        table.insert(lines, path .. ": " .. item.code .. ": " .. item.message)
    end
    return table.concat(lines, "\n")
end

---------------------------------------------------------------------------
-- Answers
---------------------------------------------------------------------------

local function option_index(field: any)
    local index = {}
    for position, option in ipairs(field.options) do
        index[option.value] = position
    end
    return index
end

-- What each problem of form_text.read_answer is called and said for the Other
-- text and for a note. Both are trimmed, as the form component does before
-- sending, and may have tabs and line breaks. A blank Other text is refused;
-- a blank note is dropped (check_noted).
local OTHER_WORDING = {
    too_long = { code = "too_long",
        message = string.format("The other answer must be at most %d characters.", definition.LIMITS.OTHER_TEXT) },
    not_utf8 = { code = "invalid_text", message = "The other answer must be valid UTF-8 text." },
    control_characters = { code = "invalid_text",
        message = "The other answer must not contain control characters other than tabs and line breaks." },
    blank = { code = "blank", message = "Enter the other answer." },
}
local NOTE_WORDING = {
    too_long = { code = "too_long",
        message = string.format("A note must be at most %d characters.", definition.LIMITS.NOTE_TEXT) },
    not_utf8 = { code = "invalid_text", message = "The note must be valid UTF-8 text." },
    control_characters = { code = "invalid_text",
        message = "The note must not contain control characters other than tabs and line breaks." },
}

local function refusal(wording: {[string]: any}, problem: string): any
    local entry = wording[problem] :: any
    return { code = entry.code, message = entry.message }
end

-- Validates the `{ other = "text" }` object. Returns the normalized object or
-- nil plus the error.
local function check_other(field: any, value: table): (any, any)
    if not field.allow_other then
        return nil, { code = "other_not_allowed", message = "This question does not accept another answer." }
    end
    for key in pairs(value) do
        if key ~= "other" then
            return nil, { code = "invalid_type", message = "An other answer is an object with only \"other\"." }
        end
    end
    if type(value.other) ~= "string" then
        return nil, { code = "invalid_type", message = "The other answer must be text." }
    end
    local text, _, problem = form_text.read_answer(value.other, {
        max = definition.LIMITS.OTHER_TEXT, raw_factor = RAW_TEXT_MULTIPLIER, trim = true, multiline = true })
    if problem then return nil, refusal(OTHER_WORDING, problem) end
    return { other = text }, nil
end

-- Validates a listed option with the user's note, `{ value = "...", note = "..." }`.
-- A missing or blank note gives back the plain option value, so an answer
-- without a note always has the same shape.
local function check_noted(value: table, positions: {[string]: number}): (any, any)
    for key in pairs(value) do
        if key ~= "value" and key ~= "note" then
            return nil, { code = "invalid_type", message = "A noted answer is an object with only \"value\" and \"note\"." }
        end
    end
    local chosen = value.value
    if type(chosen) ~= "string" or not positions[chosen] then
        return nil, { code = "invalid_option", message = "Choose one of the listed options." }
    end
    local note = value.note
    if note == nil then return chosen, nil end
    if type(note) ~= "string" then
        return nil, { code = "invalid_type", message = "A note must be text." }
    end
    local kept, _, problem = form_text.read_answer(note, {
        max = definition.LIMITS.NOTE_TEXT, raw_factor = RAW_TEXT_MULTIPLIER, trim = true, multiline = true })
    if problem == "blank" then return chosen, nil end
    if problem then return nil, refusal(NOTE_WORDING, problem) end
    return { value = chosen, note = kept }, nil
end

-- An answer object is either an own answer `{ other }` or a noted option
-- `{ value, note }`.
local function check_object(field: any, value: table, positions: {[string]: number}): (any, any)
    if value.other ~= nil then return check_other(field, value) end
    if value.value ~= nil then return check_noted(value, positions) end
    return nil, { code = "invalid_type", message = "An answer object has \"value\" (with an optional \"note\") or \"other\"." }
end

local function required_error(): any
    return { code = "required", message = "This question requires an answer." }
end

local function check_single(field: any, value: any, positions: {[string]: number}): (any, any)
    if type(value) == "string" then
        if not positions[value] then
            return nil, { code = "invalid_option", message = "Choose one of the listed options." }
        end
        return value, nil
    end
    if type(value) == "table" and is_object(value) and next(value) ~= nil then
        return check_object(field, value, positions)
    end
    return nil, { code = "invalid_type", message = "Choose one option." }
end

local function check_multiple(field: any, value: any, positions: {[string]: number}): (any, any)
    if type(value) ~= "table" or not is_array(value) then
        return nil, { code = "invalid_type", message = "Choose a list of options." }
    end
    -- selected[value] holds the normalized item: the value string, or
    -- { value, note } when the user added a note.
    local selected = {}
    local other = nil
    for _, item in ipairs(value) do
        local chosen, normalized = nil, nil
        if type(item) == "string" then
            if not positions[item] then
                return nil, { code = "invalid_option", message = "Choose only the listed options." }
            end
            chosen, normalized = item, item
        elseif type(item) == "table" and is_object(item) and next(item) ~= nil then
            if item.other ~= nil then
                if other then
                    return nil, { code = "multiple_other", message = "Only one other answer is allowed." }
                end
                local own, err = check_other(field, item)
                if err then return nil, err end
                other = own
            else
                local noted, err = check_object(field, item, positions)
                if err then return nil, err end
                chosen = type(noted) == "string" and noted or noted.value
                normalized = noted
            end
        else
            return nil, { code = "invalid_type", message = "Choose only the listed options." }
        end
        if chosen then
            if selected[chosen] ~= nil then
                return nil, { code = "duplicate_selection", message = "An option is selected more than once." }
            end
            selected[chosen] = normalized
        end
    end
    -- Canonical order: definition order, then the other answer.
    local ordered = {}
    for _, option in ipairs(field.options) do
        if selected[option.value] ~= nil then table.insert(ordered, selected[option.value]) end
    end
    if other then table.insert(ordered, other) end
    if #ordered == 0 then return nil, nil end
    return ordered, nil
end

-- Validates submitted answers against a normalized definition.
-- Returns (normalized_answers, field_errors, form_errors):
--   normalized_answers - table keyed by field id; unanswered optional fields
--                        are omitted; multiple selections in definition order
--   field_errors       - { [field_id] = { { code, message } } } (first
--                        violation per field), or nil when valid
--   form_errors        - list of { code, message, field? } for problems that
--                        belong to no defined field, or nil when valid. The
--                        code "internal" is a fault in the stored form (a
--                        pattern that no longer compiles), not in the
--                        answers: the caller answers 500, not 422
function definition.validate_answers(def: any, answers: any): (any, any, any)
    local field_errors = {}
    local form_errors = {}
    -- table.create(0, n) (Wippy extension) forces json.encode to read this
    -- as an object, not an array: a plain {} is indistinguishable from an
    -- empty array, so an all-optional unanswered form would
    -- otherwise store/serialize submission.answers as [] instead of {}.
    local normalized = table.create(0, #def.fields)

    if type(answers) ~= "table" or not is_object(answers) then
        table.insert(form_errors, { code = "invalid_type", message = "Answers must be an object keyed by question id." })
        return nil, nil, form_errors
    end

    local known = {}
    for _, field in ipairs(def.fields) do known[field.id] = true end
    local unknown = {}
    for key in pairs(answers) do
        if not known[key] then table.insert(unknown, key) end
    end
    table.sort(unknown)
    for _, key in ipairs(unknown) do
        table.insert(form_errors, { code = "unknown_field", field = key,
            message = "\"" .. key .. "\" is not a question in this form." })
    end

    local has_field_errors = false
    for _, field in ipairs(def.fields) do
        local value = answers[field.id]
        local result, err = nil, nil
        if field.type == "choice" then
            local positions = option_index(field)
            if value ~= nil then
                if field.multiple then
                    result, err = check_multiple(field, value, positions)
                else
                    result, err = check_single(field, value, positions)
                end
            end
            if not err and result == nil and field.required then
                err = required_error()
            end
        else
            -- A standard field decides `required` itself: an unchecked
            -- required checkbox is a value (false) that still fails it.
            result, err = field_values.check_answer(field, value)
            if err and err.internal then
                -- A fault in the stored form, not in the answers.
                return nil, nil, { { code = "internal", field = field.id, message = err.message } }
            end
        end
        if err then
            field_errors[field.id] = { err }
            has_field_errors = true
        elseif result ~= nil then
            normalized[field.id] = result
        end
    end

    if has_field_errors or #form_errors > 0 then
        return nil, has_field_errors and field_errors or nil, #form_errors > 0 and form_errors or nil
    end
    return normalized, nil, nil
end

-- Encodes one normalized answer value (a string, a number or a boolean,
-- { value, note }, { other }, or a list of choice answers) with a fixed key
-- order, so equal answers encode equally.
local function encode_value(value: any): string
    if type(value) ~= "table" then
        return field_values.literal(value)
    end
    if is_array(value) and #value > 0 then
        local parts = {}
        for _, item in ipairs(value) do table.insert(parts, encode_value(item)) end
        return ordered_json.array(parts)
    end
    if value.value ~= nil then
        return ordered_json.object({ { "value", value.value }, { "note", value.note } })
    end
    return ordered_json.object({ { "other", value.other } })
end

-- Canonical JSON of normalized answers: keys in definition order, `{}` when
-- nothing was answered (json.encode would give `[]` for an empty table).
-- Equal answers always produce the same string, so it also serves as the
-- replay comparison key.
function definition.encode_answers(def: any, answers: any): string
    local entries = {}
    for _, field in ipairs(def.fields) do
        local value = answers and answers[field.id]
        if value ~= nil then
            table.insert(entries, { field.id, raw = encode_value(value) })
        end
    end
    return ordered_json.object(entries)
end

definition.is_array = is_array
definition.is_object = is_object

return definition
