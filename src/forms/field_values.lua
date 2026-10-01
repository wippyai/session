local json = require("json")
local text = require("text")
local time = require("time")
local form_text = require("form_text")
local form_checks = require("form_checks")
local form_pattern = require("form_pattern")

-- The standard field types of Session forms V2 (text, textarea, number,
-- email, date, checkbox): their definition keys, the check of one answer, the
-- canonical text of a stored answer and the descriptions the answer record
-- and read_form give an agent. definition.lua calls in here from the places
-- that are specific to a field's type; choice fields stay in definition.lua.
--
-- Pure functions, no I/O. The rules are written down once more in the form
-- component (frontend/wippy-form), and both sides are tested against the one
-- fixture file test/forms/fixtures/v2_conformance.json. The one rule the
-- component does not have is the text pattern: only this side evaluates it
-- (see form_pattern.lua), and the fixture's pattern cases are not run by the
-- component.
--
-- Answer checks return (value, nil) for an accepted answer (the normalized
-- value to store), (nil, nil) for a field left unanswered and (nil, err) for
-- a refusal, where err is { code, message }. A refusal never repeats the
-- value the user sent.
--
-- An answer is checked in this order: its type, its raw size (a value longer
-- than any valid one is refused before anything scans it), UTF-8, control
-- characters, whether it is blank, its length, and last its pattern.

local field_values = {}

field_values.LIMITS = {
    TEXT_DEFAULT = 500,
    TEXT_MAX = 2000,
    TEXTAREA_MAX = 8000,
    -- The sum of the largest answers of all text, textarea and email fields
    -- of one form. At four bytes per character (UTF-8 written as it is, as a
    -- browser's JSON.stringify writes it), those answers, the 20 field ids
    -- and the request envelope fit the 64 KiB request cap; the state service
    -- test sends the largest such request. Not covered: the Other text and
    -- notes of choice fields (each has its own cap, and none counts here), and
    -- a client that writes non-ASCII text as six-byte escape sequences, which
    -- can take up to twelve bytes per character.
    TEXT_BUDGET = 16000,
    EMAIL_MAX = 254,
    EMAIL_LOCAL_MAX = 64,
    PLACEHOLDER = 200,
    NUMBER_MAGNITUDE = 1e12,
    NUMBER_DECIMALS = 6,
}

-- A valid answer is at most this many UTF-8 characters, four bytes each.
local BYTES_PER_CHARACTER = 4
-- An email is trimmed, so it may carry surrounding whitespace that a valid
-- address does not; this bounds the scan of such a value.
local RAW_EMAIL_MULTIPLIER = 8
local RAW_DATE_BYTES = 512

local COMMON_KEYS = { id = true, type = true, label = true, description = true, required = true }

local function keys_of(extra: {string}): {[string]: boolean}
    local keys: {[string]: boolean} = {}
    for key in pairs(COMMON_KEYS) do keys[key] = true end
    for _, key in ipairs(extra) do keys[key] = true end
    return keys
end

-- The keys a field of each type may carry. Anything else is `unknown_key`.
field_values.KEYS = {
    text = keys_of({ "min_length", "max_length", "pattern", "placeholder", "default" }),
    textarea = keys_of({ "min_length", "max_length", "placeholder", "default" }),
    number = keys_of({ "min", "max", "step", "integer", "default" }),
    email = keys_of({ "default" }),
    date = keys_of({ "min", "max", "default" }),
    checkbox = keys_of({ "default" }),
}

field_values.TYPE_NAMES = "choice, text, textarea, number, email, date, checkbox"

function field_values.is_standard(type_name: any): boolean
    return type(type_name) == "string" and field_values.KEYS[type_name] ~= nil
end

-- Whether `value` is a number with no fractional part: finite and equal to
-- its floor, however it was written (3, 3.0 or 3e0). The one whole-number
-- test: the definition keys, the answers and the state service use it.
function field_values.is_whole(value: any): boolean
    return type(value) == "number" and value == value and value ~= math.huge and value ~= -math.huge
        and value == math.floor(value)
end

local function refuse(code: string, message: string): (any, any)
    return nil, { code = code, message = message }
end

local function unanswered(field: any): (any, any)
    if field.required then
        return nil, { code = "required", message = "This question requires an answer." }
    end
    return nil, nil
end

---------------------------------------------------------------------------
-- Decimal numbers
--
-- Step checks and the canonical text of a number work on the number's
-- shortest decimal digits, not on float or integer arithmetic: the runtime
-- compares and takes remainders of integers through 64-bit floats, which is
-- not exact above 2^53, and a value of 1e12 with six decimals is 1e18 once
-- scaled. Digit strings of at most 19 digits are added, subtracted, compared
-- and divided here as plain schoolbook arithmetic.
---------------------------------------------------------------------------

-- A finite number as (negative, digits, power): its magnitude is the integer
-- written by `digits` (no leading zeros, "0" for zero) times 10^power, with
-- the fewest digits that read back as the same number.
local function decimal_of(value: number): (boolean, string, integer)
    local negative = value < 0
    local magnitude = negative and -value or value
    if magnitude == 0 then return false, "0", 0 end
    local digits, power
    if field_values.is_whole(magnitude) then
        digits, power = string.format("%d", magnitude), 0
    else
        -- The shortest of 2 to 17 significant digits that parses back to the
        -- same number (tonumber needs the point in the mantissa).
        local formatted
        for precision = 1, 16 do
            formatted = string.format("%." .. precision .. "e", magnitude)
            if tonumber(formatted) == magnitude then break end
        end
        local mantissa, sign, exponent = string.match(formatted, "^(%d%.%d+)e([+-])(%d+)$")
        digits = (string.gsub(mantissa :: string, "%.", ""))
        local exponent_value = math.tointeger(tonumber(exponent)) :: integer
        if sign == "-" then exponent_value = -exponent_value end
        power = exponent_value - (#digits - 1)
    end
    -- Drop trailing zeros into the power.
    local trimmed = (string.gsub(digits, "0+$", ""))
    power = power + (#digits - #trimmed)
    return negative, trimmed, power
end

-- How many digits a number has after the decimal point.
local function decimals_of(value: number): integer
    local _, _, power = decimal_of(value)
    return power < 0 and -power or 0
end

-- The canonical JSON text of a number: an integer when it is whole, else its
-- shortest decimal digits with no exponent. json.encode is not used: it
-- writes an exponent for some magnitudes and not for others, depending on
-- where the number sits in the document.
function field_values.number_text(value: number): string
    local negative, digits, power = decimal_of(value)
    if digits == "0" then return "0" end
    local body
    if power >= 0 then
        body = digits .. string.rep("0", power)
    else
        local point = #digits + power
        if point > 0 then
            body = string.sub(digits, 1, point) .. "." .. string.sub(digits, point + 1)
        else
            body = "0." .. string.rep("0", -point) .. digits
        end
    end
    return negative and ("-" .. body) or body
end

-- Non-negative integers as digit strings without leading zeros.
local function compare_digits(a: string, b: string): integer
    if #a ~= #b then return #a < #b and -1 or 1 end
    if a == b then return 0 end
    return a < b and -1 or 1
end

local function add_digits(a: string, b: string): string
    local out = {}
    local carry = 0
    local i, j = #a, #b
    while i >= 1 or j >= 1 or carry > 0 do
        local sum = carry
        if i >= 1 then
            sum = sum + (string.byte(a, i) - 48)
            i = i - 1
        end
        if j >= 1 then
            sum = sum + (string.byte(b, j) - 48)
            j = j - 1
        end
        if sum >= 10 then
            sum, carry = sum - 10, 1
        else
            carry = 0
        end
        table.insert(out, 1, string.char(sum + 48))
    end
    return table.concat(out)
end

-- a - b, for a >= b.
local function subtract_digits(a: string, b: string): string
    local out = {}
    local borrow = 0
    local j = #b
    for i = #a, 1, -1 do
        local difference = (string.byte(a, i) - 48) - borrow
        if j >= 1 then
            difference = difference - (string.byte(b, j) - 48)
            j = j - 1
        end
        if difference < 0 then
            difference, borrow = difference + 10, 1
        else
            borrow = 0
        end
        table.insert(out, 1, string.char(difference + 48))
    end
    local stripped = (string.gsub(table.concat(out), "^0+", ""))
    return stripped == "" and "0" or stripped
end

-- Whether `divisor` (not zero) divides `dividend` exactly: long division
-- keeping only the remainder.
local function divides(dividend: string, divisor: string): boolean
    local remainder = "0"
    for index = 1, #dividend do
        local digit = string.sub(dividend, index, index)
        remainder = remainder == "0" and digit or (remainder .. digit)
        while compare_digits(remainder, divisor) >= 0 do
            remainder = subtract_digits(remainder, divisor)
        end
    end
    return remainder == "0"
end

-- Whether `value` lies on the grid that starts at the field's min (zero when
-- there is none) and moves in steps of its step. The value must have no more
-- decimals than the step and the base do together; then |value - base|, scaled
-- to whole numbers, must be a multiple of the scaled step.
local function on_step(field: any, value: number): boolean
    local step = field.step :: number
    local base = field.min or 0
    -- A stored step that is not positive has no grid, which also keeps the
    -- division below from looping on a zero divisor. A step or minimum outside
    -- the supported magnitude and decimals (stored forms are not re-checked
    -- for it) cannot be proved to lie on a grid either.
    local limit = field_values.LIMITS.NUMBER_MAGNITUDE
    if step <= 0 or step > limit or base > limit or base < -limit
        or decimals_of(step) > field_values.LIMITS.NUMBER_DECIMALS
        or decimals_of(base) > field_values.LIMITS.NUMBER_DECIMALS then
        return false
    end
    local places = decimals_of(step)
    local base_places = decimals_of(base)
    if base_places > places then places = base_places end
    local value_negative, value_digits, value_power = decimal_of(value)
    if value_power < -places then return false end
    local base_negative, base_digits, base_power = decimal_of(base)
    local _, step_digits, step_power = decimal_of(step)

    local function scaled(digits: string, power: integer): string
        if digits == "0" then return "0" end
        return digits .. string.rep("0", power + places)
    end
    local scaled_value = scaled(value_digits, value_power)
    local scaled_base = scaled(base_digits, base_power)
    local distance
    if value_negative == base_negative then
        if compare_digits(scaled_value, scaled_base) >= 0 then
            distance = subtract_digits(scaled_value, scaled_base)
        else
            distance = subtract_digits(scaled_base, scaled_value)
        end
    else
        distance = add_digits(scaled_value, scaled_base)
    end
    return divides(distance, scaled(step_digits, step_power))
end

---------------------------------------------------------------------------
-- Answers
---------------------------------------------------------------------------

-- Compiled once: a pragmatic address syntax (WHATWG-style dot-atom local
-- part, DNS-label domain with at least one dot), ASCII only. No claim that
-- the address exists.
local EMAIL_PATTERN = "^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*"
    .. "@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?"
    .. "(?:\\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$"
local email_expression = nil

local function check_free_text(field: any, value: any): (any, any)
    if type(value) ~= "string" then
        return refuse("invalid_type", "Must be text.")
    end
    local multiline = field.type == "textarea"
    -- Text is kept exactly as typed (no trim); only a value of nothing but
    -- whitespace counts as no answer.
    local _, length, problem = form_text.read_answer(value, {
        max = field.max_length :: number, raw_factor = BYTES_PER_CHARACTER, trim = false, multiline = multiline })
    if problem == "blank" then return unanswered(field) end
    if problem == "too_long" then
        return refuse("too_long", string.format("Must be at most %d characters.", field.max_length))
    end
    if problem == "not_utf8" then
        return refuse("invalid_text", "Must be valid UTF-8 text.")
    end
    if problem then
        return refuse("invalid_text", multiline
            and "Must not contain control characters other than tabs and line breaks."
            or "Must not contain control characters or line breaks.")
    end
    if (length :: number) < (field.min_length or 0) then
        return refuse("too_short", string.format("Must be at least %d characters.", field.min_length))
    end
    if field.pattern ~= nil then
        local expression = form_pattern.compile(field.pattern :: string)
        if not expression then
            -- A stored pattern that no longer compiles is the form's fault,
            -- not the user's.
            return nil, { code = "internal", internal = true,
                message = "This question's pattern cannot be checked." }
        end
        local matched = (expression :: any):match_string(value)
        if not matched then
            return refuse("pattern_mismatch", "Does not match the expected format.")
        end
    end
    return value, nil
end

local function check_email(field: any, value: any): (any, any)
    if type(value) ~= "string" then
        return refuse("invalid_type", "Must be text.")
    end
    -- Every problem with the text itself (too much of it, bad bytes, control
    -- characters, too many characters) is one refusal; the address syntax and
    -- the local part's length follow.
    local address, _, problem = form_text.read_answer(value, {
        max = field_values.LIMITS.EMAIL_MAX, raw_factor = RAW_EMAIL_MULTIPLIER, trim = true, multiline = false })
    if problem == "blank" then return unanswered(field) end
    if problem then return refuse("invalid_email", "Enter a valid email address.") end
    local at = string.find(address :: string, "@", 1, true)
    if at ~= nil and at - 1 > field_values.LIMITS.EMAIL_LOCAL_MAX then
        return refuse("invalid_email", "Enter a valid email address.")
    end
    if email_expression == nil then
        email_expression = text.regexp.compile(EMAIL_PATTERN)
    end
    local matched = (email_expression :: any):match_string(address)
    if not matched then
        return refuse("invalid_email", "Enter a valid email address.")
    end
    return address, nil
end

local function check_number(field: any, value: any): (any, any)
    if type(value) ~= "number" then
        return refuse("invalid_type", "Must be a number.")
    end
    local limit = field_values.LIMITS.NUMBER_MAGNITUDE
    if value ~= value or value > limit or value < -limit then
        local shown = field_values.number_text(limit)
        return refuse("invalid_number", string.format("Enter a number between -%s and %s.", shown, shown))
    end
    local whole = field_values.is_whole(value)
    if field.integer and not whole then
        return refuse("not_integer", "Enter a whole number.")
    end
    -- A whole number is stored as an integer, however it was written.
    local stored = whole and math.tointeger(value) or value
    if field.min ~= nil and stored < field.min then
        return refuse("below_min", "Is below the minimum.")
    end
    if field.max ~= nil and stored > field.max then
        return refuse("above_max", "Is above the maximum.")
    end
    if field.step ~= nil and not on_step(field, stored) then
        return refuse("not_on_step", "Is not one of the allowed steps.")
    end
    return stored, nil
end

-- Whether `value` is a calendar date written YYYY-MM-DD in ASCII, from year
-- 0001 to 9999.
local function is_calendar_date(value: string): boolean
    if not string.find(value, "^%d%d%d%d%-%d%d%-%d%d$") then return false end
    if value < "0001-01-01" then return false end
    local parsed = time.parse(time.DATE_ONLY, value)
    return parsed ~= nil
end

local function check_date(field: any, value: any): (any, any)
    if type(value) ~= "string" then
        return refuse("invalid_type", "Must be a date written YYYY-MM-DD.")
    end
    if #value > RAW_DATE_BYTES then
        return refuse("invalid_date", "Enter a date as YYYY-MM-DD.")
    end
    if form_text.is_whitespace_only(value) then return unanswered(field) end
    if not is_calendar_date(value) then
        return refuse("invalid_date", "Enter a real date as YYYY-MM-DD.")
    end
    if field.min ~= nil and value < field.min then
        return refuse("below_min", "Is before the earliest date.")
    end
    if field.max ~= nil and value > field.max then
        return refuse("above_max", "Is after the latest date.")
    end
    return value, nil
end

local function check_checkbox(field: any, value: any): (any, any)
    if type(value) ~= "boolean" then
        return refuse("invalid_type", "Must be true or false.")
    end
    -- An unchecked optional box is an answer; a required one must be checked.
    if field.required and not value then
        return refuse("required", "This question requires an answer.")
    end
    return value, nil
end

local ANSWER_CHECKS = {
    text = check_free_text,
    textarea = check_free_text,
    email = check_email,
    number = check_number,
    date = check_date,
    checkbox = check_checkbox,
}

-- Checks one answer to a standard field (a normalized field of one of the
-- standard types). `value` is nil when the user sent nothing. A refusal with
-- `internal` set is a fault in the stored form, not in the answer.
function field_values.check_answer(field: any, value: any): (any, any)
    if value == nil then return unanswered(field) end
    local check = ANSWER_CHECKS[field.type]
    if check == nil then
        return nil, { code = "internal", internal = true, message = "This question's type cannot be checked." }
    end
    return check(field, value)
end

---------------------------------------------------------------------------
-- Canonical and record text
---------------------------------------------------------------------------

-- The JSON literal of a normalized scalar answer: a string, a number or a
-- boolean. Used for the canonical answers (replay key, GET `data`) and the
-- answer record.
function field_values.literal(value: any): string
    if type(value) == "boolean" then return value and "true" or "false" end
    if type(value) == "number" then return field_values.number_text(value) end
    return (json.encode(value))
end

-- The entries { key, value } that describe a field to an agent that lost the
-- original ask_user call, after "question" and "type": what it needs to
-- restate the question (answer_text.questions_json). A key with no value is
-- left out.
function field_values.question_entries(field: any): {any}
    local entries = {}
    local function add(key: string, value: any)
        if type(value) == "number" then
            table.insert(entries, { key, raw = field_values.number_text(value) })
        elseif value ~= nil then
            table.insert(entries, { key, value })
        end
    end
    add("required", field.required == true)
    if field.type == "text" or field.type == "textarea" then
        add("min_length", field.min_length)
        add("max_length", field.max_length)
        add("pattern", field.pattern)
    elseif field.type == "number" then
        add("integer", field.integer == true)
        add("min", field.min)
        add("max", field.max)
        add("step", field.step)
    elseif field.type == "date" then
        add("min", field.min)
        add("max", field.max)
    end
    add("default", field.default)
    return entries
end

---------------------------------------------------------------------------
-- Definition
---------------------------------------------------------------------------

-- A whole number as an integer, whatever it was written as.
local function as_integer(value: number): number
    return math.tointeger(value) or value
end

-- Reads an optional whole-number key. `low`/`high` are the inclusive bounds
-- checked for new definitions (opts.strict). Returns the value, or nil when
-- absent or refused (the refusal is in errors).
local function read_whole(errors: {any}, path: string, value: any, low: number, high: number, strict: boolean): number?
    if value == nil then return nil end
    if not field_values.is_whole(value) then
        form_checks.add_error(errors, path, "invalid_type", "Must be a whole number.")
        return nil
    end
    if strict and (value < low or value > high) then
        form_checks.add_error(errors, path, "invalid_range",
            string.format("Must be between %d and %d.", low, high))
        return nil
    end
    return as_integer(value :: number)
end

-- Reads an optional number bound or step. `code` is the refusal code for a
-- value outside the supported magnitude and decimals.
local function read_bound(errors: {any}, path: string, value: any, code: string, strict: boolean): number?
    if value == nil then return nil end
    if type(value) ~= "number" or value ~= value then
        form_checks.add_error(errors, path, "invalid_type", "Must be a number.")
        return nil
    end
    if strict then
        local limit = field_values.LIMITS.NUMBER_MAGNITUDE
        if value > limit or value < -limit then
            local shown = field_values.number_text(limit)
            form_checks.add_error(errors, path, code, string.format("Must be between -%s and %s.", shown, shown))
            return nil
        end
        if decimals_of(value) > field_values.LIMITS.NUMBER_DECIMALS then
            form_checks.add_error(errors, path, code,
                string.format("Must have at most %d decimals.", field_values.LIMITS.NUMBER_DECIMALS))
            return nil
        end
    end
    return as_integer(value)
end

local function read_date_bound(errors: {any}, path: string, value: any, strict: boolean): string?
    if value == nil then return nil end
    if type(value) ~= "string" then
        form_checks.add_error(errors, path, "invalid_type", "Must be a date written YYYY-MM-DD.")
        return nil
    end
    if strict and (#value > RAW_DATE_BYTES or not is_calendar_date(value)) then
        form_checks.add_error(errors, path, "invalid_range", "Must be a real date written YYYY-MM-DD.")
        return nil
    end
    return value
end

-- The default of a field: checked as an answer to the field (without the
-- default itself) and stored as that answer's normalized value. A default is
-- only ever shown prefilled; the server never submits it. Stored definitions
-- keep what they hold.
local function read_default(errors: {any}, path: string, raw: any, field: any, strict: boolean): any
    local value = raw.default
    if value == nil then return nil end
    if not strict then return value end
    if field.type == "checkbox" then
        if type(value) ~= "boolean" then
            form_checks.add_error(errors, path .. ".default", "invalid_default", "A default must be true or false.")
            return nil
        end
        if value then
            form_checks.add_error(errors, path .. ".default", "default_not_allowed",
                "A checkbox cannot start checked: a default must not agree to anything for the user.")
            return nil
        end
        return false
    end
    local candidate = {}
    for key, item in pairs(field) do candidate[key] = item end
    candidate.default = nil
    candidate.required = false
    local checked, err = field_values.check_answer(candidate, value)
    if err then
        form_checks.add_error(errors, path .. ".default", "invalid_default",
            "The default is not a valid answer for this question (" .. tostring(err.code) .. ").")
        return nil
    end
    if checked == nil then
        form_checks.add_error(errors, path .. ".default", "invalid_default", "A default must not be blank.")
        return nil
    end
    return checked
end

local function normalize_text_like(errors: {any}, path: string, raw: any, field: any, strict: boolean)
    local is_text = field.type == "text"
    local cap = is_text and field_values.LIMITS.TEXT_MAX or field_values.LIMITS.TEXTAREA_MAX
    local default_max = is_text and field_values.LIMITS.TEXT_DEFAULT or field_values.LIMITS.TEXTAREA_MAX
    local min_length = read_whole(errors, path .. ".min_length", raw.min_length, 0, cap, strict)
    local max_length = read_whole(errors, path .. ".max_length", raw.max_length, 1, cap, strict)
    field.min_length = min_length or 0
    field.max_length = max_length or default_max
    if strict and min_length ~= nil and field.min_length > field.max_length then
        form_checks.add_error(errors, path .. ".min_length", "invalid_range", "Must not be more than max_length.")
    end
    if raw.pattern ~= nil then
        if type(raw.pattern) ~= "string" then
            form_checks.add_error(errors, path .. ".pattern", "invalid_type", "Must be a string.")
        elseif strict then
            local ok, code, message = form_pattern.check(raw.pattern)
            if not ok then
                form_checks.add_error(errors, path .. ".pattern", code :: string, message :: string)
            else
                field.pattern = raw.pattern
            end
        else
            field.pattern = raw.pattern
        end
    end
    field.placeholder = (form_checks.check_text(errors, path .. ".placeholder", raw.placeholder,
        { required = false, max = field_values.LIMITS.PLACEHOLDER, strict = strict }))
end

local function normalize_number(errors: {any}, path: string, raw: any, field: any, strict: boolean)
    field.integer = form_checks.check_boolean(errors, path .. ".integer", raw.integer)
    field.min = read_bound(errors, path .. ".min", raw.min, "invalid_range", strict)
    field.max = read_bound(errors, path .. ".max", raw.max, "invalid_range", strict)
    field.step = read_bound(errors, path .. ".step", raw.step, "invalid_step", strict)
    if not strict then return end
    if field.step ~= nil and field.step <= 0 then
        form_checks.add_error(errors, path .. ".step", "invalid_step", "Must be more than zero.")
        field.step = nil
        return
    end
    if field.min ~= nil and field.max ~= nil and field.min > field.max then
        form_checks.add_error(errors, path .. ".min", "invalid_range", "Must not be more than max.")
    end
    if field.integer then
        if field.step ~= nil and not field_values.is_whole(field.step) then
            form_checks.add_error(errors, path .. ".step", "invalid_step", "Must be a whole number for a whole-number question.")
        elseif field.step ~= nil and field.min ~= nil and not field_values.is_whole(field.min) then
            form_checks.add_error(errors, path .. ".step", "invalid_step",
                "Steps count from min, so min must be a whole number for a whole-number question.")
        end
        if field.min ~= nil and field.max ~= nil and math.ceil(field.min) > math.floor(field.max) then
            form_checks.add_error(errors, path .. ".min", "invalid_range", "No whole number lies between min and max.")
        end
    end
end

local function normalize_date(errors: {any}, path: string, raw: any, field: any, strict: boolean)
    field.min = read_date_bound(errors, path .. ".min", raw.min, strict)
    field.max = read_date_bound(errors, path .. ".max", raw.max, strict)
    if strict and field.min ~= nil and field.max ~= nil and field.min > field.max then
        form_checks.add_error(errors, path .. ".min", "invalid_range", "Must not be after max.")
    end
end

local NORMALIZERS = {
    text = normalize_text_like,
    textarea = normalize_text_like,
    number = normalize_number,
    date = normalize_date,
}

-- Normalizes a field of a standard type. `base` carries the already checked
-- common keys { id, type, label, description, required }; the unknown-key
-- check and the common keys are the caller's. Returns the normalized field.
-- Anything wrong is appended to `errors`; the caller decides from the error
-- count whether the field is usable.
function field_values.normalize(errors: {any}, path: string, raw: any, base: any, strict: boolean): any
    local field = {
        id = base.id,
        type = base.type,
        label = base.label,
        description = base.description,
        required = base.required,
    }
    local normalizer = NORMALIZERS[base.type]
    if normalizer then normalizer(errors, path, raw, field, strict) end
    field.default = read_default(errors, path, raw, field, strict)
    return field
end

-- The most characters the answers of `fields` can hold in all.
function field_values.text_budget(fields: {any}): integer
    local total = 0
    for _, field in ipairs(fields) do
        if field.type == "text" or field.type == "textarea" then
            total = total + (field.max_length or 0)
        elseif field.type == "email" then
            total = total + field_values.LIMITS.EMAIL_MAX
        end
    end
    return total
end

return field_values
