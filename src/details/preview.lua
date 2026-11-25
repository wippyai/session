local json = require("json")
local masks = require("masks")

-- Server-built argument preview for the approval card
-- (docs/tool-approval-protocol.md, the `display` object).
--
-- preview.build(args) returns
--   arguments  the preview value (decoded JSON, at most 8 KB as JSON text, depth 6)
--   cut        JSON Pointer paths (into `arguments`) of every value the
--              preview shortened or replaced; each such value states its full size
--   numbers    JSON Pointer paths of numbers sent as strings so their digits
--              stay exact (the type marker)
--   summary    one line of about 80 characters for the compact card
--
-- Rules:
--   - Strings and object keys are shown through JSON string escaping: control,
--     bidirectional, zero-width and other invisible format characters become
--     \uXXXX (or \n, \t, ...), a backslash becomes \\ and a quote \". So U+202E
--     shows as the six characters \u202e, while the literal text \u202e shows
--     as \\u202e. Invalid UTF-8 bytes show as \xNN.
--     The escaped set is INVISIBLE_RANGES (Unicode 15.1 Cc, Cf, Zl, Zp and
--     Default_Ignorable_Code_Point).
--   - Base64 and hex runs of at least 128 characters, and data URLs, show as
--     "[binary, <decoded size>]". A base64 run uses one alphabet and is not
--     path-like; a data URL payload ends at the first character outside its
--     alphabet, so trailing text stays visible.
--   - A string longer than 1 KB of escaped text ends with "… [cut, <size>]".
--     A container deeper than 6 levels shows as "[cut, <size>]". Members that
--     no longer fit the 8 KB budget are replaced by one last member
--     "[cut, <n> more, <size>]" (key "…" in an object).
--   - Integers outside the JSON safe range (2^53 - 1) are sent as their exact
--     decimal digits; floats at or above 2^53 as "%.17g" text.
--   - Sensitive paths are replaced before rendering or measuring values.
--   - The summary quotes every key: "customer_id": "c_1042", "hard": true
-- Sizes: the exact JSON bytes the wire encoder writes for a string, an object
-- or an array; the decoded bytes of binary data.
local preview = {}

preview.MAX_BYTES = 8192
preview.MAX_DEPTH = 6
preview.STRING_MAX = 1024
preview.KEY_MAX = 128
preview.SUMMARY_CHARS = 80
preview.BINARY_RUN = 128

local SAFE_INTEGER = 9007199254740991
local TWO_53 = 9007199254740992.0
local OMIT_RESERVE = 64
local MIN_CHILD = 48
local ELLIPSIS = "\u{2026}"

---------------------------------------------------------------------------
-- Sizes and escaping
---------------------------------------------------------------------------

function preview.size_text(bytes: number): string
    if bytes < 1024 then return string.format("%d B", bytes) end
    if bytes < 1024 * 1024 then return string.format("%.1f KB", bytes / 1024) end
    if bytes < 1024 * 1024 * 1024 then return string.format("%.1f MB", bytes / (1024 * 1024)) end
    return string.format("%.1f GB", bytes / (1024 * 1024 * 1024))
end

-- Code points shown escaped: the union of the general categories Cc
-- (controls), Cf (format), Zl (line separator) and Zp (paragraph separator)
-- and the Default_Ignorable_Code_Point property, from Unicode 15.1
-- (UnicodeData.txt and DerivedCoreProperties.txt). Sorted, inclusive ranges.
preview.INVISIBLE_RANGES = {
    { 0x0000, 0x001F },   -- Cc
    { 0x007F, 0x009F },   -- Cc (DEL, C1 controls)
    { 0x00AD, 0x00AD },   -- Cf soft hyphen
    { 0x034F, 0x034F },   -- DI combining grapheme joiner
    { 0x0600, 0x0605 },   -- Cf Arabic number signs
    { 0x061C, 0x061C },   -- Cf Arabic letter mark
    { 0x06DD, 0x06DD },   -- Cf Arabic end of ayah
    { 0x070F, 0x070F },   -- Cf Syriac abbreviation mark
    { 0x0890, 0x0891 },   -- Cf Arabic pound and piastre marks above
    { 0x08E2, 0x08E2 },   -- Cf Arabic disputed end of ayah
    { 0x115F, 0x1160 },   -- DI Hangul fillers
    { 0x17B4, 0x17B5 },   -- DI Khmer inherent vowels
    { 0x180B, 0x180F },   -- DI Mongolian variation selectors, Cf vowel separator
    { 0x200B, 0x200F },   -- Cf zero-width space, joiners, LRM, RLM
    { 0x2028, 0x202E },   -- Zl, Zp, Cf bidirectional embeddings and overrides
    { 0x2060, 0x206F },   -- Cf word joiner, invisible operators, isolates; DI
    { 0x3164, 0x3164 },   -- DI Hangul filler
    { 0xFE00, 0xFE0F },   -- DI variation selectors
    { 0xFEFF, 0xFEFF },   -- Cf zero-width no-break space (BOM)
    { 0xFFA0, 0xFFA0 },   -- DI halfwidth Hangul filler
    { 0xFFF0, 0xFFFB },   -- DI unassigned, Cf interlinear annotation
    { 0x110BD, 0x110BD }, -- Cf Kaithi number sign
    { 0x110CD, 0x110CD }, -- Cf Kaithi number sign above
    { 0x13430, 0x1343F }, -- Cf Egyptian hieroglyph format controls
    { 0x1BCA0, 0x1BCA3 }, -- Cf shorthand format controls
    { 0x1D173, 0x1D17A }, -- Cf musical symbol format controls
    { 0xE0000, 0xE0FFF }, -- Cf tags, DI variation selectors supplement and reserved
}

local function hidden(cp: integer): boolean
    for _, range in ipairs(preview.INVISIBLE_RANGES) do
        if cp < range[1] then return false end
        if cp <= range[2] then return true end
    end
    return false
end

local SHORT_ESCAPES = { [0x08] = "\\b", [0x09] = "\\t", [0x0A] = "\\n", [0x0C] = "\\f", [0x0D] = "\\r" }

local function escape_codepoint(cp: integer): string
    if SHORT_ESCAPES[cp] then return SHORT_ESCAPES[cp] end
    if cp < 0x10000 then return string.format("\\u%04x", cp) end
    local v = cp - 0x10000
    return string.format("\\u%04x\\u%04x", 0xD800 + (v >> 10), 0xDC00 + (v & 0x3FF))
end

-- Decodes one UTF-8 sequence at byte i. Returns the code point and its
-- length, or nil for an invalid byte.
local function decode_at(s: string, i: integer): (integer?, integer)
    local c = s:byte(i)
    if c < 0x80 then return c, 1 end
    local len, cp, min
    if c >= 0xC2 and c <= 0xDF then len, cp, min = 2, c & 0x1F, 0x80
    elseif c >= 0xE0 and c <= 0xEF then len, cp, min = 3, c & 0x0F, 0x800
    elseif c >= 0xF0 and c <= 0xF4 then len, cp, min = 4, c & 0x07, 0x10000
    else return nil, 1 end
    if i + len - 1 > #s then return nil, 1 end
    for k = 1, len - 1 do
        local b = s:byte(i + k)
        if b < 0x80 or b > 0xBF then return nil, 1 end
        cp = (cp << 6) | (b & 0x3F)
    end
    if cp < min or cp > 0x10FFFF or (cp >= 0xD800 and cp <= 0xDFFF) then return nil, 1 end
    return cp, len
end

-- Appends the display tokens of raw text s[from..to] to `tokens`. Each
-- token is one character or one escape, so a cut never splits either.
local function tokenize(s: string, from: integer, to: integer, tokens: {string}, limit: integer?)
    local i = from
    while i <= to do
        if limit and #tokens >= limit then return end
        local cp, len = decode_at(s, i)
        local token
        if cp == nil then
            token = string.format("\\x%02x", s:byte(i))
        elseif cp == 0x5C then
            token = "\\\\"
        elseif cp == 0x22 then
            token = "\\\""
        elseif hidden(cp) then
            token = escape_codepoint(cp)
        else
            token = s:sub(i, i + len - 1)
        end
        tokens[#tokens + 1] = token
        i = i + len
    end
end

-- The escaped display form of a whole string.
function preview.escape(s: string): string
    local tokens = {}
    tokenize(s, 1, #s, tokens)
    return table.concat(tokens)
end

local cost_cache: {[string]: integer} = {}

-- Bytes a display string adds to the JSON text of the preview.
local function cost(text: string): integer
    local cached = cost_cache[text]
    if cached then return cached end
    local encoded = json.encode(text) or ""
    local value = #encoded - 2
    if #text <= 8 then cost_cache[text] = value end
    return value
end

---------------------------------------------------------------------------
-- Binary detection
---------------------------------------------------------------------------

local function base64_bytes(payload: string): integer
    local padding = #(payload:match("(=*)$") or "")
    local body = #payload - padding
    return math.max(0, (body * 3) // 4)
end

-- A run that reads as a file or URL path is text, not base64: it starts with
-- "/", or it splits on "/" into three or more segments of at most 40
-- characters each.
local PATH_SEGMENT_MAX = 40

local function path_like(run: string): boolean
    if run:sub(1, 1) == "/" then return true end
    local segments, longest = 0, 0
    for segment in (run .. "/"):gmatch("([^/]*)/") do
        segments = segments + 1
        if #segment > longest then longest = #segment end
    end
    return segments >= 3 and longest <= PATH_SEGMENT_MAX
end

-- Spans { from, to, size } of binary content in s, in order, not overlapping.
local function binary_spans(s: string): {any}
    local spans = {}
    local search = 1
    while true do
        local at = s:find("data:", search, true)
        if not at then break end
        local before = at > 1 and s:sub(at - 1, at - 1) or ""
        local header, comma_capture = s:match("^([%w%.%+%-/;=]*)(),", at + 5)
        local comma = tonumber(comma_capture)
        local is_base64 = header ~= nil and header:find(";base64", 1, true) ~= nil
        -- The payload alphabet is narrow, so the span ends at the first
        -- character a data URL can't hold (a shell ;, |, $ or a space): text
        -- after it stays visible.
        local payload = ""
        if comma then
            payload = s:match(is_base64 and "^[%w%+/=_%-]*" or "^[%w%%%-%._~]*", comma + 1) or ""
        end
        if (before == "" or not before:match("[%w]")) and header and comma and payload ~= ""
            and (header:find("/", 1, true) or is_base64) then
            local stop = comma + #payload
            local size = is_base64 and base64_bytes(payload) or #payload
            spans[#spans + 1] = { from = at, to = stop, size = size }
            search = stop + 1
        else
            search = at + 5
        end
    end

    local function inside(from: integer): boolean
        for _, span in ipairs(spans) do
            if from >= span.from and from <= span.to then return true end
        end
        return false
    end

    local runs = {}
    for from_capture, run, after_capture in s:gmatch("()([%w%+/=_%-]+)()") do
        local from = tonumber(from_capture) or 0
        local after = tonumber(after_capture) or 0
        if #run >= preview.BINARY_RUN and not inside(from) then
            local size = nil
            if run:match("^%x+$") then
                size = #run // 2
            elseif run:find("%d") and run:find("%u") and run:find("%l") and not path_like(run)
                and not (run:find("[%+/]") and run:find("[_%-]")) then
                -- One base64 alphabet only: standard (+ /) or URL-safe (- _).
                size = base64_bytes(run)
            end
            if size then runs[#runs + 1] = { from = from, to = after - 1, size = size } end
        end
    end
    for _, run in ipairs(runs) do spans[#spans + 1] = run end
    table.sort(spans, function(a, b) return a.from < b.from end)
    return spans
end

---------------------------------------------------------------------------
-- Rendering
---------------------------------------------------------------------------

local function pointer(path: string, key: string): string
    local escaped = key:gsub("~", "~0")
    escaped = escaped:gsub("/", "~1")
    return path .. "/" .. escaped
end

-- The length of a table read as a JSON array, as canonical_json reads it:
-- only positive integer keys, up to the largest one (a decoded null leaves a
-- hole). nil for an object or an empty table.
local function array_length(value: any): integer?
    local length = nil
    for key in pairs(value) do
        if type(key) ~= "number" or key % 1 ~= 0 or key < 1 then return nil end
        if not length or key > length then length = math.floor(key) end
    end
    return length
end

local function sorted_keys(value: any): {any}
    local keys = {}
    for key in pairs(value) do keys[#keys + 1] = key end
    table.sort(keys, function(a, b) return tostring(a) < tostring(b) end)
    return keys
end

-- Exact JSON size of an original value as the wire encoder writes it (the
-- "full size" of a cut value): encoded strings and keys, punctuation included.
local function full_size(value: any, memo: any): integer
    local kind = type(value)
    if kind == "string" then return #(json.encode(value) or "") end
    if kind ~= "table" then return #(json.encode(value) or "null") end
    if memo[value] then return memo[value] end
    local total = 2
    local first = true
    local length = array_length(value)
    if length then
        for index = 1, length do
            total = total + full_size(value[index], memo) + (first and 0 or 1)
            first = false
        end
    else
        for key, child in pairs(value) do
            total = total + #(json.encode(tostring(key)) or "") + 1 + full_size(child, memo) + (first and 0 or 1)
            first = false
        end
    end
    memo[value] = total
    return total
end

local function marker(text: string): (string, integer)
    return text, cost(text) + 2
end

-- Renders a string within `budget` JSON bytes (quotes included).
local function render_string(s: string, path: string, budget: integer, state: any): (string, integer)
    local limit = math.min(budget, preview.STRING_MAX + 2)
    local spans = binary_spans(s)
    local tokens, costs = {}, {}
    local used = 2
    local position = 1
    local function add(token: string): boolean
        local c = cost(token)
        tokens[#tokens + 1] = token
        costs[#costs + 1] = c
        used = used + c
        return used <= limit
    end
    local function add_text(to: integer): boolean
        local piece = {}
        local start = position
        while start <= to do
            piece = {}
            tokenize(s, start, to, piece, 256)
            local consumed = 0
            for _, token in ipairs(piece) do
                if not add(token) then return false end
                local cp, len = decode_at(s, start + consumed)
                consumed = consumed + (cp and len or 1)
            end
            start = start + consumed
        end
        return true
    end
    local fits = true
    for _, span in ipairs(spans) do
        if fits then fits = add_text(span.from - 1) end
        if fits then
            state.cut[#state.cut + 1] = path
            fits = add("[binary, " .. preview.size_text(span.size) .. "]")
        end
        position = span.to + 1
        if not fits then break end
    end
    if fits then fits = add_text(#s) end
    if fits then return table.concat(tokens), used end

    -- Too long: keep the tokens that fit beside the cut note.
    local size = full_size(s, state.memo)
    local note = ELLIPSIS .. " [cut, " .. preview.size_text(size) .. "]"
    local room = limit - 2 - cost(note)
    if room < 0 then
        local text, text_cost = marker("[cut, " .. preview.size_text(size) .. "]")
        return text, text_cost
    end
    local kept, total = {}, 0
    for index, token in ipairs(tokens) do
        if total + costs[index] > room then break end
        kept[#kept + 1] = token
        total = total + costs[index]
    end
    if state.cut[#state.cut] ~= path then state.cut[#state.cut + 1] = path end
    return table.concat(kept) .. note, total + cost(note) + 2
end

local function render_number(value: number, path: string, state: any): (any, integer)
    if math.type(value) == "integer" then
        if value > SAFE_INTEGER or value < -SAFE_INTEGER then
            state.numbers[#state.numbers + 1] = path
            local text, text_cost = marker(string.format("%d", value))
            return text, text_cost
        end
    elseif value >= TWO_53 or value <= -TWO_53 then
        state.numbers[#state.numbers + 1] = path
        local text, text_cost = marker(string.format("%.17g", value))
        return text, text_cost
    end
    return value, #(json.encode(value) or "0")
end

local render_value

-- The display form of an object key: escaped, and at most KEY_MAX bytes of
-- escaped text plus "…". Returns the text and whether it was shortened.
local function key_text_of(key: any): (string, boolean)
    local raw = tostring(key)
    local tokens = {}
    tokenize(raw, 1, #raw, tokens, preview.KEY_MAX + 1)
    local short, length = {}, 0
    for _, token in ipairs(tokens) do
        if length + #token > preview.KEY_MAX then
            return table.concat(short) .. ELLIPSIS, true
        end
        short[#short + 1] = token
        length = length + #token
    end
    return table.concat(short), false
end

-- Keys of one object, in canonical order, made unique after shortening.
local function display_keys(keys: {any}): ({string}, {boolean})
    local texts, shortened, taken = {}, {}, {}
    for index, key in ipairs(keys) do
        local text, was_cut = key_text_of(key)
        local unique, n = text, 1
        while taken[unique] do
            n = n + 1
            unique = text .. ELLIPSIS .. n
        end
        taken[unique] = true
        texts[index] = unique
        shortened[index] = was_cut
    end
    return texts, shortened
end

local function unused_key(base: string, out: any): string
    local key = base
    while out[key] ~= nil do key = key .. ELLIPSIS end
    return key
end

local function render_container(value: any, depth: integer, path: string, budget: integer, state: any): (any, integer)
    local size = full_size(value, state.memo)
    if depth > preview.MAX_DEPTH or budget < MIN_CHILD then
        state.cut[#state.cut + 1] = path
        local text, text_cost = marker("[cut, " .. preview.size_text(size) .. "]")
        return text, text_cost
    end
    local length = array_length(value)
    local array = length ~= nil
    local members = {}
    if length then
        for index = 1, length do members[index] = { value = value[index] } end
    else
        local keys = sorted_keys(value)
        local texts, shortened = display_keys(keys)
        for index, key in ipairs(keys) do
            members[#members + 1] = { value = value[key], key_text = texts[index], key_cut = shortened[index] }
        end
    end

    local out = {}
    local used = 2
    for index, member in ipairs(members) do
        local separator = index > 1 and 1 or 0
        local key_cost = array and 0 or (cost(member.key_text) + 3)
        local reserve = index < #members and OMIT_RESERVE or 0
        if state.details then
            reserve = 0
            if index < #members and size > budget then
                local remaining_size = 2
                for rest = index + 1, #members do
                    remaining_size = remaining_size + full_size(members[rest].value, state.memo)
                    if rest > index + 1 then remaining_size = remaining_size + 1 end
                    if not array then remaining_size = remaining_size + cost(members[rest].key_text) + 3 end
                end
                local _, note_cost = marker("[cut, " .. (#members - index) .. " more, " .. preview.size_text(remaining_size) .. "]")
                reserve = 1 + note_cost
                if not array then reserve = reserve + cost(unused_key(ELLIPSIS, out)) + 3 end
            end
        end
        local room = budget - used - separator - key_cost - reserve
        if room < MIN_CHILD and not (state.details and full_size(member.value, state.memo) <= room) then
            local omitted, omitted_size = 0, 0
            for rest = index, #members do
                omitted = omitted + 1
                omitted_size = omitted_size + full_size(members[rest].value, state.memo)
            end
            if state.details then
                omitted_size = omitted_size + 2 + math.max(0, omitted - 1)
                if not array then
                    for rest = index, #members do omitted_size = omitted_size + cost(members[rest].key_text) + 3 end
                end
            end
            local text, text_cost = marker("[cut, " .. omitted .. " more, " .. preview.size_text(omitted_size) .. "]")
            if array then
                out[index] = text
                state.cut[#state.cut + 1] = pointer(path, tostring(index - 1))
                used = used + separator + text_cost
            else
                local omit_key = unused_key(ELLIPSIS, out)
                out[omit_key] = text
                state.cut[#state.cut + 1] = pointer(path, omit_key)
                used = used + separator + cost(omit_key) + 3 + text_cost
            end
            break
        end
        local child_path = pointer(path, array and tostring(index - 1) or tostring(member.key_text))
        if member.key_cut then state.cut[#state.cut + 1] = child_path end
        local rendered, rendered_cost = render_value(member.value, depth + 1, child_path, room, state)
        if array then
            -- A null item stays in its place.
            if rendered == nil then rendered = json.null end
            out[index] = rendered
        else
            out[member.key_text] = rendered
        end
        used = used + separator + key_cost + rendered_cost
    end
    return out, used
end

render_value = function(value: any, depth: integer, path: string, budget: integer, state: any): (any, integer)
    local kind = type(value)
    local out, out_cost
    if kind == "string" then
        out, out_cost = render_string(value, path, budget, state)
        return out, out_cost
    end
    if kind == "number" then
        out, out_cost = render_number(value, path, state)
        return out, out_cost
    end
    if kind == "table" then
        out, out_cost = render_container(value, depth, path, budget, state)
        return out, out_cost
    end
    if kind == "boolean" or kind == "nil" then return value, #(json.encode(value) or "null") end
    local encoded = json.encode(value)
    if encoded then return value, #encoded end
    local text, text_cost = marker("[" .. kind .. "]")
    return text, text_cost
end

---------------------------------------------------------------------------
-- Summary
---------------------------------------------------------------------------

local function char_count(text: string): integer
    local _, count = text:gsub("[^\128-\191]", "")
    return count
end

local function truncate_chars(text: string, chars: integer): string
    local out, count, i = {}, 0, 1
    while i <= #text and count < chars do
        local _, len = decode_at(text, i)
        out[#out + 1] = text:sub(i, i + len - 1)
        count = count + 1
        i = i + len
    end
    local result = table.concat(out)
    -- Never end on half of an escaped backslash.
    local trailing = #(result:match("(\\*)$") or "")
    if trailing % 2 == 1 then result = result:sub(1, -2) end
    return result
end

local function summary_value(original: any, shown: any, path: string, numbers: any): string
    if type(original) == "table" then
        local length = array_length(original)
        if length then return "[" .. length .. " items]" end
        local count = 0
        for _ in pairs(original) do count = count + 1 end
        if count == 0 then return "{}" end
        return "{" .. count .. " keys}"
    end
    if numbers[path] then return tostring(shown) end
    if type(shown) == "string" then return "\"" .. shown .. "\"" end
    if shown == nil then return "null" end
    return tostring(json.encode(shown) or shown)
end

local function build_summary(args: any, arguments: any, numbers: {string}, target: number?): string
    local summary_chars = target or preview.SUMMARY_CHARS
    local number_paths = {}
    for _, path in ipairs(numbers) do number_paths[path] = true end
    if type(args) ~= "table" or array_length(args) then
        local text = summary_value(args, arguments, "", number_paths)
        if char_count(text) > summary_chars then
            text = truncate_chars(text, summary_chars - 1) .. ELLIPSIS
        end
        return text
    end
    local keys = sorted_keys(args)
    if #keys == 0 then return "no arguments" end
    local texts = display_keys(keys)
    local line, shown_count = "", 0
    for index, key in ipairs(keys) do
        local key_text = texts[index]
        local path = pointer("", key_text)
        local shown = nil
        if type(arguments) == "table" then shown = arguments[key_text] end
        -- A key the 8 KB budget left out has no preview value: it is not
        -- shown here and counts in "+n more". A false value is shown.
        if shown == nil then break end
        -- Keys are quoted, so a key such as `dry_run: true, delete_all` reads
        -- as one key.
        local part = "\"" .. key_text .. "\": " .. summary_value(args[key], shown, path, number_paths)
        local candidate = shown_count == 0 and part or (line .. ", " .. part)
        if char_count(candidate) <= summary_chars then
            line = candidate
            shown_count = shown_count + 1
        else
            if shown_count == 0 then
                line = truncate_chars(part, summary_chars - 1) .. ELLIPSIS
                shown_count = 1
            end
            break
        end
    end
    local rest = #keys - shown_count
    if rest > 0 then line = line .. " +" .. rest .. " more" end
    return line
end

---------------------------------------------------------------------------
-- Entry point
---------------------------------------------------------------------------

function preview.build(args: any, paths: any?, summary_target: number?, details: boolean?)
    if paths then args = masks.apply(args, paths) end
    local state = { cut = {}, numbers = {}, memo = {}, details = details == true }
    local arguments = render_value(args, 1, "", preview.MAX_BYTES, state)
    return {
        arguments = arguments,
        cut = state.cut,
        numbers = state.numbers,
        summary = build_summary(args, arguments, state.numbers, summary_target),
    }
end

return preview
