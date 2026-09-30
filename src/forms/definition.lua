local json = require("json")

-- Session forms V1 contract: the definition an agent authors (choice fields
-- only) and the answers a user submits for it.
--
-- Pure functions, no I/O. Every rejection carries a stable `code`, a `path`
-- (definition) or field id (answers) and a plain `message`. Array positions
-- in paths are 0-based, as in the JSON the agent wrote.
--
-- Answers are validated one field at a time with explicit checks rather than
-- one json.validate call over the whole object: the runtime validator names
-- only the first violation of a document (probe J2), and an empty Lua table
-- is indistinguishable from an empty array (probe J5).

local definition = {}

definition.FORM_VERSION = 1

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
-- limit, independent of the 64 KiB body cap, before any of them run (H3).
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
-- passes both is_array and is_object (J5); callers decide what empty means.
local function is_object(value: any): boolean
    if type(value) ~= "table" then return false end
    for key in pairs(value) do
        if type(key) ~= "string" then return false end
    end
    return true
end

-- Number of Unicode code points in `text`, or nil when it is not valid UTF-8
-- (malformed or truncated sequences, overlong forms, surrogates, values past
-- U+10FFFF). Limits count characters as users see them (probe J4 shows
-- json.validate's maxLength does the same). The standard utf8 library is not
-- available in this runtime, so the decoding is done here.
local function char_length(text: string): number?
    local count = 0
    local index = 1
    local size = #text
    while index <= size do
        local byte = string.byte(text, index)
        local extra, minimum, value
        if byte < 0x80 then
            extra, minimum, value = 0, 0, byte
        elseif byte >= 0xC2 and byte <= 0xDF then
            extra, minimum, value = 1, 0x80, byte - 0xC0
        elseif byte >= 0xE0 and byte <= 0xEF then
            extra, minimum, value = 2, 0x800, byte - 0xE0
        elseif byte >= 0xF0 and byte <= 0xF4 then
            extra, minimum, value = 3, 0x10000, byte - 0xF0
        else
            return nil
        end
        if index + extra > size then return nil end
        for offset = 1, extra do
            local continuation = string.byte(text, index + offset)
            if continuation < 0x80 or continuation > 0xBF then return nil end
            value = value * 64 + (continuation - 0x80)
        end
        if value < minimum or value > 0x10FFFF or (value >= 0xD800 and value <= 0xDFFF) then
            return nil
        end
        count = count + 1
        index = index + extra + 1
    end
    return count
end

-- Bytes the ASCII whitespace class %s matches: space, tab, LF, VT, FF, CR.
local ASCII_WHITESPACE = { [32] = true, [9] = true, [10] = true, [11] = true, [12] = true, [13] = true }

-- Unicode code points that are invisible or render as a space. Combined with
-- ASCII_WHITESPACE, text made up only of these still counts as blank, even
-- though the byte class %s (used by the old `not string.find(text, "%S")`)
-- treats every non-ASCII byte as "visible" and so missed all of them.
local BLANK_CODEPOINTS = {
    [0x00A0] = true, -- NO-BREAK SPACE
    [0x1680] = true, -- OGHAM SPACE MARK
    [0x2000] = true, [0x2001] = true, [0x2002] = true, [0x2003] = true,
    [0x2004] = true, [0x2005] = true, [0x2006] = true, [0x2007] = true,
    [0x2008] = true, [0x2009] = true, [0x200A] = true, -- EN QUAD .. HAIR SPACE
    [0x200B] = true, [0x200C] = true, [0x200D] = true, -- ZERO WIDTH SPACE/NON-JOINER/JOINER
    [0x202F] = true, -- NARROW NO-BREAK SPACE
    [0x205F] = true, -- MEDIUM MATHEMATICAL SPACE
    [0x2060] = true, -- WORD JOINER
    [0x3000] = true, -- IDEOGRAPHIC SPACE
    [0xFEFF] = true, -- ZERO WIDTH NO-BREAK SPACE / BOM
}

-- Decodes one UTF-8 code point starting at byte `index` of `text` (assumed
-- already valid UTF-8: callers run this only after char_length has accepted
-- the string). Returns the code point and the index of the next character.
local function next_codepoint(text: string, index: integer): (integer, integer)
    local byte = string.byte(text, index)
    local extra, value
    if byte < 0x80 then
        extra, value = 0, byte
    elseif byte >= 0xC2 and byte <= 0xDF then
        extra, value = 1, byte - 0xC0
    elseif byte >= 0xE0 and byte <= 0xEF then
        extra, value = 2, byte - 0xE0
    elseif byte >= 0xF0 and byte <= 0xF4 then
        extra, value = 3, byte - 0xF0
    else
        extra, value = 0, byte
    end
    for offset = 1, extra do
        value = value * 64 + (string.byte(text, index + offset) - 0x80)
    end
    return value, index + extra + 1
end

-- True when `text` (valid UTF-8) is empty, or every code point in it is
-- ASCII whitespace or a BLANK_CODEPOINTS entry (probe H-review: zero-width
-- and no-break spaces used to pass this check as "visible" text).
local function is_blank(text: string): boolean
    local index = 1
    local size = #text
    while index <= size do
        local value
        value, index = next_codepoint(text, index)
        if not (ASCII_WHITESPACE[value] or BLANK_CODEPOINTS[value]) then
            return false
        end
    end
    return true
end

local function add_error(errors: {any}, path: string, code: string, message: string)
    table.insert(errors, { path = path, code = code, message = message })
end

-- True when `text` (valid UTF-8) has a control character: ASCII C0 (and
-- DEL), other than tab and newline where `multiline`; C1 (U+0080-U+009F);
-- the bidi override/isolate controls (U+202A-U+202E, U+2066-U+2069); or the
-- line/paragraph separators U+2028/U+2029. Question text is shown as-is, so
-- these are refused rather than silently changed or left to confuse a
-- renderer that treats them as directional or line-breaking control.
local function has_control_characters(text: string, multiline: boolean): boolean
    local index = 1
    local size = #text
    while index <= size do
        local value
        value, index = next_codepoint(text, index)
        if value < 0x80 then
            local is_c0 = value < 32 or value == 127
            if is_c0 and multiline and (value == 9 or value == 10) then
                is_c0 = false
            end
            if is_c0 then return true end
        elseif (value >= 0x80 and value <= 0x9F)
            or (value >= 0x202A and value <= 0x202E)
            or (value >= 0x2066 and value <= 0x2069)
            or value == 0x2028 or value == 0x2029 then
            return true
        end
    end
    return false
end

-- Linear-time equivalent of string.match(s, "^%s*(.-)%s*$"): that pattern
-- backtracks quadratically on a long run of trailing whitespace (H3), and
-- "^%s*(.*%S)" is quadratic on an all-whitespace string. One forward scan
-- for the first non-space byte, one backward scan for the last.
local function trim(text: string): string
    local first = string.find(text, "%S")
    if not first then return "" end
    local last = #text
    while last > first and ASCII_WHITESPACE[string.byte(text, last)] do
        last = last - 1
    end
    return string.sub(text, first, last)
end

-- Checks an optional or required plain-text value. Returns the value to keep
-- (nil for an omitted optional value) and whether it was valid. opts.strict
-- applies the rules for new definitions (control characters); stored
-- definitions are read without them so a later tightening never makes an
-- existing form unreadable.
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
    local length = char_length(value)
    if not length then
        add_error(errors, path, "invalid_text", "Must be valid UTF-8 text.")
        return nil, false
    end
    if opts.required and is_blank(value) then
        add_error(errors, path, "blank", "Must contain visible text.")
        return nil, false
    end
    if opts.strict and has_control_characters(value, opts.multiline == true) then
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
    check_unknown_keys(errors, path, raw, FIELD_KEYS)

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

    if raw.type == nil then
        add_error(errors, path .. ".type", "required", "A field type is required.")
    elseif raw.type ~= "choice" then
        add_error(errors, path .. ".type", "unsupported_type", "Only the \"choice\" type is supported.")
    end

    local label = check_text(errors, path .. ".label", raw.label,
        { required = true, max = definition.LIMITS.LABEL, strict = strict })
    local description = check_text(errors, path .. ".description", raw.description,
        { required = false, max = definition.LIMITS.DESCRIPTION, strict = strict, multiline = true })
    local required = check_boolean(errors, path .. ".required", raw.required)
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
-- opts.stored: the definition was accepted earlier and is being read back;
-- rules added since (control characters) are not applied to it.
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
    local text = value.other
    if type(text) ~= "string" then
        return nil, { code = "invalid_type", message = "The other answer must be text." }
    end
    -- Reject an absurdly long raw value before any per-byte scan below runs
    -- on it (H3); a real answer never needs this much raw text.
    if #text > definition.LIMITS.OTHER_TEXT * RAW_TEXT_MULTIPLIER then
        return nil, { code = "too_long", message = string.format(
            "The other answer must be at most %d characters.", definition.LIMITS.OTHER_TEXT) }
    end
    -- Outer whitespace is dropped, as the form component does before sending.
    text = trim(text)
    local length = char_length(text :: string)
    if not length then
        return nil, { code = "invalid_text", message = "The other answer must be valid UTF-8 text." }
    end
    if has_control_characters(text :: string, true) then
        return nil, { code = "invalid_text", message = "The other answer must not contain control characters other than tabs and line breaks." }
    end
    if is_blank(text) then
        return nil, { code = "blank", message = "Enter the other answer." }
    end
    if length > definition.LIMITS.OTHER_TEXT then
        return nil, { code = "too_long", message = string.format(
            "The other answer must be at most %d characters.", definition.LIMITS.OTHER_TEXT) }
    end
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
    -- Reject an absurdly long raw value before any per-byte scan below runs
    -- on it (H3); a real note never needs this much raw text.
    if #note > definition.LIMITS.NOTE_TEXT * RAW_TEXT_MULTIPLIER then
        return nil, { code = "too_long", message = string.format(
            "A note must be at most %d characters.", definition.LIMITS.NOTE_TEXT) }
    end
    note = trim(note)
    local length = char_length(note :: string)
    if not length then
        return nil, { code = "invalid_text", message = "The note must be valid UTF-8 text." }
    end
    if has_control_characters(note :: string, true) then
        return nil, { code = "invalid_text", message = "The note must not contain control characters other than tabs and line breaks." }
    end
    if note == "" then return chosen, nil end
    if length > definition.LIMITS.NOTE_TEXT then
        return nil, { code = "too_long", message = string.format(
            "A note must be at most %d characters.", definition.LIMITS.NOTE_TEXT) }
    end
    return { value = chosen, note = note }, nil
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
--                        belong to no defined field, or nil when valid
function definition.validate_answers(def: any, answers: any): (any, any, any)
    local field_errors = {}
    local form_errors = {}
    -- table.create(0, n) (Wippy extension) forces json.encode to read this
    -- as an object, not an array: a plain {} is indistinguishable from an
    -- empty array (probe J5), so an all-optional unanswered form would
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
        local positions = option_index(field)
        local result, err = nil, nil
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

-- Encodes one normalized answer value (string, { value, note }, { other }, or
-- a list of them) with a fixed key order, so equal answers encode equally.
local function encode_value(value: any): string
    if type(value) == "string" then
        return (json.encode(value))
    end
    if is_array(value) and #value > 0 then
        local parts = {}
        for _, item in ipairs(value) do table.insert(parts, encode_value(item)) end
        return "[" .. table.concat(parts, ",") .. "]"
    end
    if value.value ~= nil then
        return "{\"value\":" .. (json.encode(value.value)) .. ",\"note\":" .. (json.encode(value.note)) .. "}"
    end
    return "{\"other\":" .. (json.encode(value.other)) .. "}"
end

-- Canonical JSON of normalized answers: keys in definition order, `{}` when
-- nothing was answered (json.encode would give `[]` for an empty table).
-- Equal answers always produce the same string, so it also serves as the
-- replay comparison key.
function definition.encode_answers(def: any, answers: any): string
    local parts = {}
    for _, field in ipairs(def.fields) do
        local value = answers and answers[field.id]
        if value ~= nil then
            table.insert(parts, (json.encode(field.id)) .. ":" .. encode_value(value))
        end
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

definition.is_array = is_array
definition.is_object = is_object

return definition
