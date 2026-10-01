local text = require("text")
local form_text = require("form_text")

-- The pattern an agent may put on a `text` field (V2): a small subset of
-- regular expression syntax that means the same in Go RE2 (the runtime's
-- text.regexp, used here) and in JavaScript with the `u` flag (the form
-- component, which runs the same pattern in the browser).
--
-- A pattern must match the whole answer. It is compiled as ^(?:pattern)$, so
-- an alternation is matched as a whole and the author needs no anchors.
--
-- The subset:
--   literals, `.`, `^` and `$`
--   classes [abc] [^abc] [a-z] with the escapes \d \w (ASCII) and escaped
--     punctuation; no POSIX classes, no [ inside a class
--   groups ( ) and (?: ), alternation |
--   quantifiers * + ? {n} {n,} {n,m}, each with an optional lazy ?
--   escapes \d \w and a backslash before one of  ^ $ \ . * + ? ( ) [ ] { } | /
--     (and - inside a class); every other escape is outside the subset
--
-- Left out because RE2 and JavaScript differ on them or because a browser's
-- backtracking engine can stall on them: lookaround, backreferences, named
-- groups, flags, \s \S \D \W \b \B \p \x \A \z and the other letter escapes.
--
-- Bounds: 200 characters, 3 nested groups, repeat counts up to 100 (written
-- without a leading zero, because RE2 reads {01} as the text "{01}"), and no
-- unbounded repeat (* + {n,}) of a group that itself holds an unbounded
-- repeat, such as (a+)+.
--
-- check() answers with a code. "unsupported_pattern" means a well-formed
-- construct or bound the subset does not allow; "invalid_pattern" means the
-- pattern is malformed.

local form_pattern = {}

form_pattern.MAX_LENGTH = 200
form_pattern.MAX_DEPTH = 3
form_pattern.MAX_REPEAT = 100

local UNSUPPORTED = "unsupported_pattern"
local INVALID = "invalid_pattern"

-- A backslash before one of these is that character, in and out of a class.
local ESCAPABLE = {}
for character in string.gmatch("^$\\.*+?()[]{}|/", ".") do ESCAPABLE[character] = true end

-- Aborts the parse with a code and a message; check() catches it.
local function reject(code: string, message: string)
    error({ pattern_error = true, code = code, message = message }, 0)
end

-- The pattern as a list of characters and their code points.
local function split(pattern: string): ({string}, {integer})
    local chars, points = {}, {}
    local index = 1
    local size = #pattern
    while index <= size do
        local point, next_index = form_text.decode_at(pattern, index)
        table.insert(chars, string.sub(pattern, index, next_index - 1))
        table.insert(points, point :: integer)
        index = next_index
    end
    return chars, points
end

local function is_digit(character: string?): boolean
    return character ~= nil and string.find(character, "^%d$") ~= nil
end

local function parse(chars: {string}, points: {integer})
    local size = #chars
    local position = 1

    local parse_alternation

    -- After a backslash. Returns "class" for \d and \w, "char" for an escaped
    -- punctuation character and its code point.
    local function parse_escape(in_class: boolean): (string, integer)
        local escaped = chars[position + 1]
        if escaped == nil then
            reject(INVALID, "The pattern ends with a backslash.")
        end
        if escaped == "d" or escaped == "w" then
            position = position + 2
            return "class", 0
        end
        if ESCAPABLE[escaped] or (in_class and escaped == "-") then
            local point = points[position + 1]
            position = position + 2
            return "char", point
        end
        reject(UNSUPPORTED, "The escape \\" .. escaped .. " is not supported. Supported: \\d, \\w and a "
            .. "backslash before one of ^ $ \\ . * + ? ( ) [ ] { } | /" .. (in_class and " and -." or "."))
        return "char", 0 -- not reached: reject() raises
    end

    local function parse_class()
        position = position + 1 -- the [
        if chars[position] == "^" then position = position + 1 end
        local atoms = 0
        while true do
            local character = chars[position]
            if character == nil then reject(INVALID, "A character class is not closed with ].") end
            if character == "]" then
                if atoms == 0 then reject(INVALID, "A character class is empty.") end
                position = position + 1
                return
            end
            local kind, low
            if character == "\\" then
                kind, low = parse_escape(true)
            elseif character == "[" then
                reject(UNSUPPORTED, "Write [ as \\[ inside a character class. POSIX classes are not supported.")
            elseif character == "-" then
                if atoms > 0 and chars[position + 1] ~= "]" then
                    reject(INVALID, "Put - first or last in a character class, or write it as \\-.")
                end
                kind, low = "char", points[position]
                position = position + 1
            else
                kind, low = "char", points[position]
                position = position + 1
            end
            atoms = atoms + 1
            if chars[position] == "-" and chars[position + 1] ~= nil and chars[position + 1] ~= "]" then
                if kind ~= "char" then
                    reject(INVALID, "A range cannot start at \\d or \\w.")
                end
                position = position + 1 -- the -
                local high
                local end_character = chars[position]
                if end_character == "\\" then
                    local end_kind, end_point = parse_escape(true)
                    if end_kind ~= "char" then reject(INVALID, "A range cannot end at \\d or \\w.") end
                    high = end_point
                elseif end_character == "[" then
                    reject(UNSUPPORTED, "Write [ as \\[ inside a character class. POSIX classes are not supported.")
                else
                    high = points[position]
                    position = position + 1
                end
                if (high :: integer) < (low :: integer) then
                    reject(INVALID, "A character range is out of order.")
                end
            end
        end
    end

    -- The braces after an atom: {n}, {n,} or {n,m}. Returns whether the
    -- repeat is unbounded.
    local function parse_braces(): boolean
        position = position + 1 -- the {
        -- The digits of one count, or nil when there are none. A count is
        -- never longer than one digit when it starts with a zero: RE2 does not
        -- read "{01}" as a repeat but as the text "{01}", so the pattern
        -- would mean something other than what it says.
        local function read_number(): string?
            local start = position
            while is_digit(chars[position]) do position = position + 1 end
            if position == start then return nil end
            local digits = table.concat(chars, "", start, position - 1)
            if #digits > 1 and string.sub(digits, 1, 1) == "0" then
                reject(INVALID, "A repeat count must not start with a zero, as {01} does; write {1}. "
                    .. "A count of zero is written {0}.")
            end
            return digits
        end
        local low = read_number()
        if low == nil then reject(INVALID, "A { must start a repeat such as {2}, {2,} or {2,5}; write \\{ for a brace.") end
        local high, unbounded = low, false
        if chars[position] == "," then
            position = position + 1
            high = read_number()
            unbounded = high == nil
        end
        if chars[position] ~= "}" then
            reject(INVALID, "A repeat such as {2,5} is not closed with }.")
        end
        position = position + 1
        -- The counts are digit strings without a leading zero, so one is
        -- larger than another when it is longer, or equally long and later in
        -- the alphabet of digits. Nothing here depends on how many digits the
        -- bound has, or turns a count into a number.
        local function compare(a: string, b: string): integer
            if #a ~= #b then return #a < #b and -1 or 1 end
            if a == b then return 0 end
            return a < b and -1 or 1
        end
        local bound = string.format("%d", form_pattern.MAX_REPEAT)
        if compare(low :: string, bound) > 0 or (high ~= nil and compare(high, bound) > 0) then
            reject(UNSUPPORTED, string.format("A repeat count is at most %d.", form_pattern.MAX_REPEAT))
        end
        if high ~= nil and compare(high, low :: string) < 0 then
            reject(INVALID, "A repeat range is out of order.")
        end
        return unbounded
    end

    local function parse_sequence(depth: integer): boolean
        local unbounded = false
        while position <= size do
            local character = chars[position]
            if character == "|" then break end
            if character == ")" then
                if depth == 0 then reject(INVALID, "A ) has no matching (.") end
                break
            end
            local quantifiable = true
            local group_unbounded = false
            if character == "(" then
                position = position + 1
                if chars[position] == "?" then
                    if chars[position + 1] ~= ":" then
                        reject(UNSUPPORTED, "Lookaround, named groups and flags are not supported. "
                            .. "Only (?: ) groups are.")
                    end
                    position = position + 2
                end
                if depth + 1 > form_pattern.MAX_DEPTH then
                    reject(UNSUPPORTED, string.format("Groups can be nested %d deep at most.", form_pattern.MAX_DEPTH))
                end
                group_unbounded = parse_alternation(depth + 1)
                if chars[position] ~= ")" then reject(INVALID, "A group is not closed with ).") end
                position = position + 1
            elseif character == "[" then
                parse_class()
            elseif character == "\\" then
                parse_escape(false)
            elseif character == "^" or character == "$" then
                position = position + 1
                quantifiable = false
            elseif character == "." then
                position = position + 1
            elseif character == "*" or character == "+" or character == "?" then
                reject(INVALID, "A " .. character .. " has nothing to repeat.")
            elseif character == "{" then
                reject(INVALID, "A { must follow something to repeat; write \\{ for a brace.")
            elseif character == "}" or character == "]" then
                reject(INVALID, "Write " .. character .. " as \\" .. character .. ".")
            else
                position = position + 1
            end

            local quantifier = chars[position]
            if quantifier == "*" or quantifier == "+" or quantifier == "?" or quantifier == "{" then
                if not quantifiable then reject(INVALID, "A " .. quantifier .. " has nothing to repeat.") end
                local repeats_forever
                if quantifier == "{" then
                    repeats_forever = parse_braces()
                else
                    position = position + 1
                    repeats_forever = quantifier ~= "?"
                end
                if chars[position] == "?" then position = position + 1 end -- lazy
                local next_character = chars[position]
                if next_character == "*" or next_character == "+" or next_character == "?" or next_character == "{" then
                    reject(INVALID, "A repeat cannot be repeated again.")
                end
                if repeats_forever and group_unbounded then
                    reject(UNSUPPORTED, "A group that repeats without end cannot hold a repeat without end, "
                        .. "as in (a+)+.")
                end
                unbounded = unbounded or repeats_forever
            end
            unbounded = unbounded or group_unbounded
        end
        return unbounded
    end

    parse_alternation = function(depth: integer): boolean
        local unbounded = false
        while true do
            if parse_sequence(depth) then unbounded = true end
            if chars[position] == "|" then
                position = position + 1
            else
                break
            end
        end
        return unbounded
    end

    parse_alternation(0)
end

-- Checks a pattern against the subset. Returns true, or nil, a code
-- ("invalid_pattern" or "unsupported_pattern") and a plain message.
function form_pattern.check(pattern: any): (boolean?, string?, string?)
    if type(pattern) ~= "string" or pattern == "" then
        return nil, INVALID, "A pattern must not be empty."
    end
    local length = form_text.char_length(pattern)
    if not length then return nil, INVALID, "A pattern must be valid UTF-8 text." end
    if form_text.has_control_characters(pattern, false) then
        return nil, INVALID, "A pattern must not contain control characters."
    end
    if length > form_pattern.MAX_LENGTH then
        return nil, UNSUPPORTED, string.format("A pattern is at most %d characters.", form_pattern.MAX_LENGTH)
    end
    local chars, points = split(pattern)
    local ok, failure = pcall(parse, chars, points)
    if not ok then
        if type(failure) == "table" and failure.pattern_error then
            local rejection = failure :: any
            return nil, rejection.code :: string, rejection.message :: string
        end
        error(failure, 0)
    end
    local re, compile_err = text.regexp.compile("^(?:" .. pattern .. ")$")
    if not re then
        return nil, INVALID, "The pattern could not be compiled: " .. tostring(compile_err)
    end
    return true, nil, nil
end

-- The compiled full-match expression for a pattern, or nil and the error.
function form_pattern.compile(pattern: string): (any, any)
    return text.regexp.compile("^(?:" .. pattern .. ")$")
end

return form_pattern
