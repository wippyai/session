-- Text rules shared by the form definition (definition.lua), the standard
-- field values (field_values.lua) and the pattern checker (form_pattern.lua):
-- UTF-8 decoding and code point counts, the JavaScript trim set, blank and
-- control character tests, and the sequence every free-text answer takes
-- (read_answer). Pure functions, no I/O. The checks of the raw keys of a
-- definition are in form_checks.lua.

local form_text = {}

-- Decodes the UTF-8 character at byte `index` of `text`. Returns its code
-- point and the index of the next character, or nil when the bytes there are
-- not valid UTF-8: a malformed or truncated sequence, an overlong form, a
-- surrogate or a value past U+10FFFF. The runtime (Lua 5.3, Wippy
-- modification) has no utf8 library, global or required, so this is the one
-- decoder every text rule uses.
local function decode_at(text: string, index: integer): (integer?, integer)
    local byte = string.byte(text, index)
    local extra, minimum, value
    if byte < 0x80 then
        return byte, index + 1
    elseif byte >= 0xC2 and byte <= 0xDF then
        extra, minimum, value = 1, 0x80, byte - 0xC0
    elseif byte >= 0xE0 and byte <= 0xEF then
        extra, minimum, value = 2, 0x800, byte - 0xE0
    elseif byte >= 0xF0 and byte <= 0xF4 then
        extra, minimum, value = 3, 0x10000, byte - 0xF0
    else
        return nil, index
    end
    if index + extra > #text then return nil, index end
    for offset = 1, extra do
        local continuation = string.byte(text, index + offset)
        if continuation < 0x80 or continuation > 0xBF then return nil, index end
        value = value * 64 + (continuation - 0x80)
    end
    if value < minimum or value > 0x10FFFF or (value >= 0xD800 and value <= 0xDFFF) then
        return nil, index
    end
    return value, index + extra + 1
end

-- Number of Unicode code points in `text`, or nil when it is not valid
-- UTF-8. Limits count characters as users see them, as json.validate's
-- maxLength does.
local function char_length(text: string): number?
    local count = 0
    local index = 1
    local size = #text
    while index <= size do
        local value
        value, index = decode_at(text, index)
        if not value then return nil end
        count = count + 1
    end
    return count
end

-- The characters JavaScript's String.prototype.trim removes: ECMAScript
-- WhiteSpace (tab, vertical tab, form feed, U+FEFF and every Unicode space
-- separator) and LineTerminator (LF, CR, U+2028, U+2029). The form component
-- trims Other text and notes with it, so the server trims them, and decides
-- they are blank, with exactly this set. U+200B ZERO WIDTH SPACE is not in it.
local WHITESPACE = {
    [0x0009] = true, [0x000A] = true, [0x000B] = true, [0x000C] = true, [0x000D] = true,
    [0x0020] = true, [0x00A0] = true, [0x1680] = true,
    [0x2000] = true, [0x2001] = true, [0x2002] = true, [0x2003] = true, [0x2004] = true,
    [0x2005] = true, [0x2006] = true, [0x2007] = true, [0x2008] = true, [0x2009] = true,
    [0x200A] = true, [0x2028] = true, [0x2029] = true, [0x202F] = true, [0x205F] = true,
    [0x3000] = true, [0xFEFF] = true,
}

-- Invisible format characters. An agent-authored title, label or message
-- made up only of these and WHITESPACE shows nothing, so it is blank too.
local ZERO_WIDTH = { [0x200B] = true, [0x200C] = true, [0x200D] = true, [0x2060] = true }

-- True when `text` (valid UTF-8) shows nothing: empty, or every character
-- in WHITESPACE or ZERO_WIDTH. For agent-authored definition text; answer
-- text follows JavaScript trim instead (trim, is_whitespace_only).
local function is_blank(text: string): boolean
    local index = 1
    local size = #text
    while index <= size do
        local value
        value, index = decode_at(text, index)
        if not value or not (WHITESPACE[value] or ZERO_WIDTH[value]) then
            return false
        end
    end
    return true
end

-- True when `text` (valid UTF-8) is empty or only JavaScript trim
-- whitespace: what a user's answer text counts as blank. Unlike is_blank,
-- zero-width characters are content here.
local function is_whitespace_only(text: string): boolean
    local index = 1
    local size = #text
    while index <= size do
        local value
        value, index = decode_at(text, index)
        if not value or not WHITESPACE[value] then return false end
    end
    return true
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
        value, index = decode_at(text, index)
        if not value then return true end
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

-- `text` without the WHITESPACE characters at either end, as JavaScript's
-- String.prototype.trim gives it. One forward pass, so it stays linear on a
-- long run of spaces, where a "^%s*(.-)%s*$" pattern backtracks
-- quadratically. Text that is not valid UTF-8 is returned as it is, for the
-- caller's UTF-8 check to refuse.
local function trim(text: string): string
    local index = 1
    local size = #text
    local first, last = nil, 0
    while index <= size do
        local value, next_index = decode_at(text, index)
        if not value then return text end
        if not WHITESPACE[value] then
            first = first or index
            last = next_index - 1
        end
        index = next_index
    end
    if not first then return "" end
    return string.sub(text, first, last)
end

-- The raw_factor of an answer that is trimmed: a valid one is at most 4 bytes
-- per character, plus whatever surrounding whitespace a real client sends. This
-- bounds every per-byte scan of the raw value to a small multiple of the limit,
-- independent of the 64 KiB body cap.
local TRIMMED_RAW_FACTOR = 8

-- The sequence every free-text answer takes: the Other text and the note of a
-- choice, and the text, textarea and email fields. One function, so the six
-- cannot drift apart. It stops at the first problem, in this order:
--   1. the size guard: more than opts.max * opts.raw_factor bytes is
--      "too_long", before anything scans the value. The factor is the bytes a
--      character can take (4), or TRIMMED_RAW_FACTOR where the answer is trimmed;
--   2. trim, when opts.trim, with the JavaScript set;
--   3. UTF-8 ("not_utf8"), which counts the characters;
--   4. control characters ("control_characters"); a tab and a line break are
--      allowed when opts.multiline;
--   5. blank ("blank"): nothing but whitespace, where a zero-width character
--      is content;
--   6. more than opts.max characters ("too_long").
-- Returns the text (trimmed when opts.trim, else as it came) and its length
-- in characters, or nil, nil and the problem. The codes and messages are the
-- caller's: they differ per answer.
local function read_answer(value: string,
    opts: {max: number, raw_factor: number, trim: boolean, multiline: boolean}): (string?, number?, string?)
    if #value > opts.max * opts.raw_factor then return nil, nil, "too_long" end
    local kept = opts.trim and trim(value) or value
    local length = char_length(kept)
    if not length then return nil, nil, "not_utf8" end
    if has_control_characters(kept, opts.multiline) then return nil, nil, "control_characters" end
    if is_whitespace_only(kept) then return nil, nil, "blank" end
    if length > opts.max then return nil, nil, "too_long" end
    return kept, length, nil
end

-- Compares two non-negative integers written as digit strings without leading
-- zeros: -1, 0 or 1. The longer one is larger, and equal lengths compare as
-- text, so a value of any length is compared without turning it into a number.
local function compare_digits(a: string, b: string): integer
    if #a ~= #b then return #a < #b and -1 or 1 end
    if a == b then return 0 end
    return a < b and -1 or 1
end

form_text.decode_at = decode_at
form_text.char_length = char_length
form_text.is_blank = is_blank
form_text.is_whitespace_only = is_whitespace_only
form_text.has_control_characters = has_control_characters
form_text.trim = trim
form_text.read_answer = read_answer
form_text.compare_digits = compare_digits
form_text.TRIMMED_RAW_FACTOR = TRIMMED_RAW_FACTOR

return form_text
