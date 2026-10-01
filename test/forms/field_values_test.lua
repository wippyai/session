local test = require("test")
local json = require("json")
local registry = require("registry")
local definition = require("definition")
local field_values = require("field_values")
local form_pattern = require("form_pattern")
local form_text = require("form_text")

-- The parts of the standard field rules the shared conformance fixture
-- (v2_conformance_test.lua) does not reach: the decimal text and step
-- arithmetic on their own, the pattern checker's results, a stored form whose
-- pattern no longer compiles, and the text helpers.

local function define_tests()
    describe("number text", function()
        it("writes whole numbers as integers and others as their shortest decimal, never with an exponent", function()
            local cases = {
                { 3, "3" }, { 3.0, "3" }, { -3, "-3" }, { 0, "0" }, { -0.0, "0" }, { 100, "100" },
                { 0.1, "0.1" }, { -0.5, "-0.5" }, { 2.5, "2.5" }, { -2.25, "-2.25" }, { 100.5, "100.5" },
                { 0.001, "0.001" }, { 0.000001, "0.000001" }, { 1e-7, "0.0000001" }, { 1.5e-6, "0.0000015" },
                { 1e12, "1000000000000" }, { -1e12, "-1000000000000" }, { 999999999999.5, "999999999999.5" },
                { 123456789.125, "123456789.125" }, { 0.30000000000000004, "0.30000000000000004" },
                { 1 / 3, "0.3333333333333333" },
            }
            for _, case in ipairs(cases) do
                test.eq(field_values.number_text(case[1]), case[2], tostring(case[2]))
            end
        end)

        it("reads back as the same number", function()
            for _, value in ipairs({ 0.1, 0.2, 1 / 3, 123456789.125, 1e-7, 2.5e-5, 999999999999.5 }) do
                test.eq(tonumber(field_values.number_text(value)), value)
            end
        end)
    end)

    describe("number step", function()
        local function on_step(step: number, value: number, min: number?): boolean
            local stored, err = field_values.check_answer({ type = "number", step = step, min = min }, value)
            test.is_true(err == nil or err.code == "not_on_step", "unexpected " .. tostring(err and err.code))
            return stored ~= nil
        end

        it("accepts every multiple of a decimal step and refuses the values between", function()
            for _, step in ipairs({ 0.1, 0.01, 0.25, 0.7, 3 }) do
                local places = step == 3 and 0 or (step == 0.25 and 2 or (step == 0.01 and 2 or 1))
                local scale = 10 ^ places
                local scaled_step = math.floor(step * scale + 0.5)
                for count = 0, 120 do
                    -- The decimal text of count * step, built from digits.
                    local whole = count * scaled_step
                    local text
                    if places == 0 then
                        text = string.format("%d", whole)
                    else
                        local integer_part = math.floor(whole / scale)
                        local fraction = string.format("%d", whole - integer_part * scale)
                        text = string.format("%d", integer_part) .. "." .. string.rep("0", places - #fraction) .. fraction
                    end
                    local value = tonumber(text) :: number
                    test.is_true(on_step(step, value), text .. " is a multiple of " .. step)
                    if places > 0 then
                        local between = tonumber(text .. "5") :: number
                        test.is_false(on_step(step, between), text .. "5 lies between steps of " .. step)
                    end
                end
            end
        end)

        it("counts steps from min, and keeps exact at the largest magnitudes", function()
            test.is_true(on_step(0.3, 0.4, 0.1))
            test.is_false(on_step(0.3, 0.5, 0.1))
            test.is_true(on_step(0.000001, 1000000000000))
            test.is_true(on_step(0.000001, -1000000000000))
            test.is_true(on_step(0.000001, 999999999999.5))
            test.is_true(on_step(7, 999999999999))
            test.is_false(on_step(7, 1000000000000))
            test.is_true(on_step(1, -999999999999, -1000000000000))
            test.is_false(on_step(2, -999999999999, -1000000000000))
        end)

        it("treats a stored step or minimum outside the supported range as having no grid", function()
            local _, zero = field_values.check_answer({ type = "number", step = 0 }, 3)
            test.eq(zero.code, "not_on_step")
            local _, negative = field_values.check_answer({ type = "number", step = -1 }, 3)
            test.eq(negative.code, "not_on_step")
            local _, huge = field_values.check_answer({ type = "number", step = 1e300 }, 3)
            test.eq(huge.code, "not_on_step")
            local _, fine = field_values.check_answer({ type = "number", step = 0.0000001 }, 0.0000001)
            test.eq(fine.code, "not_on_step", "seven decimals are past the supported six")
            local _, far = field_values.check_answer({ type = "number", step = 1, min = -1e300 }, 3)
            test.eq(far.code, "not_on_step")
        end)
    end)

    -- The step grid starts at min (zero without a min) and runs in both
    -- directions, and a value below min is refused anyway, so min is always
    -- on the grid and inside the range: a definition the checker accepts
    -- can never allow no answer at all. A range narrower than one step allows
    -- exactly the minimum (or, without a min, the multiples of the step up to
    -- the max). The sweep keeps that true for every combination.
    describe("number definitions", function()
        it("always leave at least one allowed value, however narrow the range is next to the step", function()
            local mins = { false, -7, 0, 1, 2.5 }
            local maxes = { false, -3, 0, 4, 100 }
            local steps = { false, 0.5, 5, 7 }
            local accepted = 0
            local empty = {} :: {string}
            for _, min in ipairs(mins) do
                for _, max in ipairs(maxes) do
                    for _, step in ipairs(steps) do
                        for _, integer in ipairs({ false, true }) do
                            local raw = { id = "f", type = "number", label = "Q", integer = integer }
                            if min ~= false then raw.min = min end
                            if max ~= false then raw.max = max end
                            if step ~= false then raw.step = step end
                            local normalized = definition.normalize({ title = "T", fields = { raw } })
                            if normalized then
                                accepted = accepted + 1
                                local field = normalized.fields[1]
                                local candidate: number
                                if field.min ~= nil then
                                    candidate = field.integer and math.ceil(field.min) or field.min
                                elseif field.max ~= nil then
                                    candidate = field.step ~= nil and math.floor(field.max / field.step) * field.step
                                        or (field.integer and math.floor(field.max) or field.max)
                                else
                                    candidate = 0
                                end
                                local _, err = field_values.check_answer(field, candidate)
                                if err then
                                    table.insert(empty, string.format("min=%s max=%s step=%s integer=%s: %s refused as %s",
                                        tostring(min), tostring(max), tostring(step), tostring(integer),
                                        tostring(candidate), tostring(err.code)))
                                end
                            end
                        end
                    end
                end
            end
            test.gt(accepted, 100, "the sweep must reach many accepted definitions")
            test.eq(#empty, 0, table.concat(empty, "\n"))
        end)

        it("accept a step wider than the range, which allows the minimum alone", function()
            for _, integer in ipairs({ false, true }) do
                local normalized, errors = definition.normalize({ title = "T", fields = {
                    { id = "f", type = "number", label = "Q", integer = integer, min = 1, max = 4, step = 5 } } })
                test.is_nil(errors, definition.format_errors(errors))
                local field = (normalized :: any).fields[1]
                local allowed = {}
                for value = 1, 4 do
                    if select(2, field_values.check_answer(field, value)) == nil then table.insert(allowed, value) end
                end
                test.eq(#allowed, 1, "integer=" .. tostring(integer))
                test.eq(allowed[1], 1, "integer=" .. tostring(integer))
            end
        end)
    end)

    describe("pattern check", function()
        local function check(pattern: any)
            local ok, code, message = form_pattern.check(pattern)
            return ok, code, message
        end

        it("accepts patterns inside the subset", function()
            for _, pattern in ipairs({
                "a", "[a-z]+", "\\d{3}-\\d{4}", "(Mr|Mrs)\\. [A-Z]", "[^0-9]*", "a|b|c", "(?:ab)+", "x{2,5}?",
                "^abc$", "[\\w.+-]+", "\\.", "é+", "[a-]", "[-a]",
            }) do
                local ok, code = check(pattern)
                test.is_true(ok, pattern .. " -> " .. tostring(code))
            end
        end)

        it("tells a construct outside the subset from a malformed pattern", function()
            local _, unsupported = check("(?=a)a")
            test.eq(unsupported, "unsupported_pattern")
            local _, malformed = check("(a")
            test.eq(malformed, "invalid_pattern")
            local _, bound = check("a{101}")
            test.eq(bound, "unsupported_pattern")
            local _, empty = check("")
            test.eq(empty, "invalid_pattern")
            local _, not_text = check(5)
            test.eq(not_text, "invalid_pattern")
            local _, bad_utf8 = check("a\255")
            test.eq(bad_utf8, "invalid_pattern")
        end)

        it("gives a plain message that names what to change", function()
            local _, _, message = check("a\\sb")
            test.contains(message, "\\s")
            local _, _, nested = check("(a+)+")
            test.contains(nested, "(a+)+")
        end)

        it("compiles to a whole-text match", function()
            local expression = form_pattern.compile("a|b")
            test.is_true(((expression :: any):match_string("a")))
            test.is_false(((expression :: any):match_string("ab")))
        end)

        it("does not let an unbalanced pattern break out of the full-match wrapper", function()
            local ok, code = check("a)(b")
            test.is_nil(ok)
            test.eq(code, "invalid_pattern")
        end)

        -- RE2 reads a repeat count that starts with a zero followed by another
        -- digit as text, not as a repeat: "{" becomes a literal brace. The
        -- checker refuses such a count, or the pattern would pass the check and
        -- then match the wrong answers.
        describe("repeat counts", function()
            local saved_max = form_pattern.MAX_REPEAT
            after_each(function() form_pattern.MAX_REPEAT = saved_max end)

            it("refuses a count with a leading zero, as RE2 does not read it as a repeat", function()
                for _, pattern in ipairs({ "a{01}", "a{1,02}", "a{00}", "a{01,}", "a{0100,0050}", "a{007,9}", "a{0,00}" }) do
                    local ok, code, message = check(pattern)
                    test.is_nil(ok, pattern)
                    test.eq(code, "invalid_pattern", pattern)
                    test.contains(message, "zero", pattern)
                end
            end)

            it("shows in RE2 itself what the refusal protects against", function()
                -- The positive control: the refused spellings compile, and
                -- mean a literal brace, so the checker's view of them (a
                -- repeat) would have been wrong.
                local literal = form_pattern.compile("a{01}")
                test.is_true(((literal :: any):match_string("a{01}")))
                test.is_false(((literal :: any):match_string("a")))
                local counted = form_pattern.compile("a{1}")
                test.is_true(((counted :: any):match_string("a")))
                test.is_false(((counted :: any):match_string("a{1}")))
            end)

            it("accepts a count of zero, which RE2 reads as a repeat", function()
                for _, pattern in ipairs({ "a{0}", "a{0,0}", "a{0,5}", "a{10}", "a{100}", "a{1,100}" }) do
                    local ok, code = check(pattern)
                    test.is_true(ok, pattern .. " -> " .. tostring(code))
                end
                local zero = form_pattern.compile("ba{0}")
                test.is_true(((zero :: any):match_string("b")))
                test.is_false(((zero :: any):match_string("ba")))
            end)

            it("matches exactly the lengths its counts name, for every accepted count", function()
                local counts = { 0, 1, 2, 3, 10, 99, 100 }
                for _, low in ipairs(counts) do
                    local forms = { { string.format("a{%d}", low), low, low }, { string.format("a{%d,}", low), low, nil } }
                    for _, high in ipairs(counts) do
                        if high >= low then
                            table.insert(forms, { string.format("a{%d,%d}", low, high), low, high })
                        end
                    end
                    for _, form in ipairs(forms) do
                        local ok, code = check(form[1])
                        test.is_true(ok, form[1] .. " -> " .. tostring(code))
                        local expression = form_pattern.compile(form[1])
                        for length = 0, 102 do
                            local expected = length >= form[2] and (form[3] == nil or length <= form[3])
                            test.eq(((expression :: any):match_string(string.rep("a", length))), expected,
                                form[1] .. " against " .. length .. " characters")
                        end
                    end
                end
            end)

            it("refuses a count over the bound and a range out of order, whatever the bound is written with", function()
                local ok, code = check("a{100}")
                test.is_true(ok, tostring(code))
                local _, over = check("a{101}")
                test.eq(over, "unsupported_pattern")
                local _, order, order_message = check("a{9,2}")
                test.eq(order, "invalid_pattern")
                test.contains(order_message, "out of order")

                -- A one-digit and a four-digit bound: nothing in the checks
                -- may assume three digits.
                form_pattern.MAX_REPEAT = 5
                test.is_true(check("a{5}"))
                local _, small = check("a{6}")
                test.eq(small, "unsupported_pattern")
                local _, small_range = check("a{1,6}")
                test.eq(small_range, "unsupported_pattern")

                form_pattern.MAX_REPEAT = 1000
                test.is_true(check("a{1000}"))
                test.is_true(check("a{999,1000}"))
                local _, big = check("a{1001}")
                test.eq(big, "unsupported_pattern")
                local _, big_order, big_message = check("a{1000,999}")
                test.eq(big_order, "invalid_pattern")
                test.contains(big_message, "out of order")
            end)

            it("refuses a count of any length without reading it as a number", function()
                local _, code, message = check("a{" .. string.rep("9", 150) .. "}")
                test.eq(code, "unsupported_pattern")
                test.contains(message, "at most 100")
                local _, ordered = check("a{" .. string.rep("9", 90) .. "," .. string.rep("9", 89) .. "}")
                test.eq(ordered, "unsupported_pattern")
            end)
        end)
    end)

    describe("compiling a pattern", function()
        local original = form_pattern._compile_source
        local sources = {} :: {string}

        before_each(function()
            sources = {}
            form_pattern._compile_source = function(source: string)
                table.insert(sources, source)
                return original(source)
            end
        end)
        after_each(function() form_pattern._compile_source = original end)

        it("has the check go through compile, the one owner of the whole-text wrapper", function()
            local ok, code = form_pattern.check("owner[a-z]+")
            test.is_true(ok, tostring(code))
            test.eq(#sources, 1)
            test.eq(sources[1], "^(?:owner[a-z]+)$")
            -- Compiling it again, by compile or by check, reuses the first.
            local expression = form_pattern.compile("owner[a-z]+")
            test.eq(#sources, 1, "compile reuses what the check compiled")
            test.is_true(form_pattern.check("owner[a-z]+"))
            test.eq(#sources, 1, "a second check reuses it too")
            test.is_true(((expression :: any):match_string("ownerabc")))
            test.is_false(((expression :: any):match_string("xownerabc")))
        end)

        it("compiles a pattern once when a text field with a pattern and a default is written", function()
            local normalized, errors = definition.normalize({ title = "T", fields = {
                { id = "code", type = "text", label = "Code", pattern = "once-[0-9]{2}", default = "once-42" },
            } })
            test.is_nil(errors, definition.format_errors(errors))
            test.not_nil(normalized)
            test.eq(#sources, 1, "the check and the default's check share one compile")
        end)

        it("answers with the same compiled expression for the same pattern, and keeps a refusal's reason", function()
            local first = form_pattern.compile("same-[a-z]")
            local second = form_pattern.compile("same-[a-z]")
            test.eq(first, second)
            local missing, reason = form_pattern.compile("(")
            test.is_nil(missing)
            test.not_nil(reason)
            local again, again_reason = form_pattern.compile("(")
            test.is_nil(again)
            test.not_nil(again_reason, "a pattern that does not compile is refused every time")
        end)

        it("keeps a bounded number of compiled patterns, and still answers correctly past the bound", function()
            local limit = form_pattern.CACHE_LIMIT
            test.gt(limit, 0)
            for index = 1, limit * 3 do
                local expression = form_pattern.compile("bounded" .. index .. "x")
                test.is_true(((expression :: any):match_string("bounded" .. index .. "x")))
            end
            test.is_true(form_pattern.cached_count() <= limit, "more than the bound is cached")
            test.gt(#sources, limit, "the bound made some patterns compile again")
            local early = form_pattern.compile("bounded1x")
            test.is_true(((early :: any):match_string("bounded1x")))
            test.is_false(((early :: any):match_string("bounded2x")))
        end)
    end)

    describe("a stored text field whose pattern no longer compiles", function()
        it("is reported as a fault of the form, not of the answer", function()
            local field = { type = "text", max_length = 10, min_length = 0, pattern = "(" }
            local value, err = field_values.check_answer(field, "abc")
            test.is_nil(value)
            test.eq(err.code, "internal")
            test.is_true(err.internal)
            -- An empty answer never reaches the pattern.
            local blank, blank_err = field_values.check_answer(field, "")
            test.is_nil(blank)
            test.is_nil(blank_err)
        end)

        it("reports a field type it does not know the same way", function()
            local _, err = field_values.check_answer({ type = "rating" }, "x")
            test.eq(err.code, "internal")
        end)
    end)

    describe("the ask_user tool schema", function()
        local function field_schema(): any
            local entry, err = registry.get("wippy.session.forms:ask_user_tool")
            test.is_nil(err)
            local schema, decode_err = json.decode(tostring(entry.meta.input_schema))
            test.is_nil(decode_err)
            return schema.properties.fields.items
        end

        it("is one flat field object that names all seven types and does not require options", function()
            local item = field_schema()
            test.eq(item.additionalProperties, false)
            local names = {}
            for _, name in ipairs(item.properties.type.enum) do names[name] = true end
            for _, name in ipairs({ "choice", "text", "textarea", "number", "email", "date", "checkbox" }) do
                test.is_true(names[name], name)
            end
            test.eq(#item.properties.type.enum, 7)
            table.sort(item.required)
            test.eq(table.concat(item.required, ","), "id,label,type")
        end)

        it("offers every key a field type accepts, so the model can write each of them", function()
            local item = field_schema()
            local keys = { id = true, type = true, label = true, description = true, required = true,
                options = true, multiple = true, allow_other = true }
            for _, type_keys in pairs(field_values.KEYS) do
                for key in pairs(type_keys) do keys[key] = true end
            end
            for key in pairs(keys) do
                test.not_nil(item.properties[key], "the schema describes " .. key)
                test.not_nil(item.properties[key].description, "the schema explains " .. key)
            end
            for key in pairs(item.properties) do
                test.is_true(keys[key], "the schema offers " .. key .. " but no type accepts it")
            end
        end)

        -- What the model is told about a pattern is the contract it writes
        -- against, so it is tied to what form_pattern accepts and says.
        describe("the pattern description", function()
            local function description(): string
                return tostring(field_schema().properties.pattern.description)
            end

            local function set_of(characters: string): {[string]: boolean}
                local set = {}
                for character in string.gmatch(characters, "%S") do set[character] = true end
                return set
            end

            local function same_set(a: {[string]: boolean}, b: {[string]: boolean}, label: string)
                for character in pairs(a) do test.is_true(b[character], label .. ": extra " .. character) end
                for character in pairs(b) do test.is_true(a[character], label .. ": missing " .. character) end
            end

            it("lists exactly the characters a backslash may precede, as the parser does", function()
                local text = description()
                local listed, in_class = string.match(text, "one of these characters: (.-) %(inside a class also (.)%)")
                test.not_nil(listed, "the description names the characters")
                same_set(set_of(listed :: string), set_of(form_pattern.ESCAPABLE), "description against the parser")
                test.eq(in_class, form_pattern.CLASS_ESCAPABLE)

                -- The parser's own message for an escape it refuses.
                local _, code, message = form_pattern.check("a\\q")
                test.eq(code, "unsupported_pattern")
                local from_message = string.match(tostring(message), "before one of (.-)%.$")
                test.not_nil(from_message, "the message names the characters")
                same_set(set_of(from_message :: string), set_of(form_pattern.ESCAPABLE), "message against the parser")
                local _, _, class_message = form_pattern.check("[\\q]")
                test.contains(tostring(class_message), " and " .. form_pattern.CLASS_ESCAPABLE .. ".")
            end)

            it("lists what the parser accepts: each escape is taken, and no other punctuation is", function()
                local escapable = set_of(form_pattern.ESCAPABLE)
                for byte = 33, 126 do
                    local character = string.char(byte)
                    local outside = form_pattern.check("a\\" .. character)
                    local inside = form_pattern.check("[\\" .. character .. "]")
                    if escapable[character] then
                        test.is_true(outside, "\\" .. character .. " outside a class")
                        test.is_true(inside, "\\" .. character .. " inside a class")
                    elseif character == "d" or character == "w" then
                        test.is_true(outside, "\\" .. character)
                    else
                        test.is_nil(outside, "\\" .. character .. " outside a class")
                        test.is_true(inside == nil or character == form_pattern.CLASS_ESCAPABLE,
                            "\\" .. character .. " inside a class")
                    end
                end
            end)

            it("names each construct the parser accepts, with an example the parser takes", function()
                local text = description()
                local constructs = {
                    { "^ and $", "^a$" }, { "[abc]", "[abc]" }, { "[^abc]", "[^abc]" }, { "[a-z]", "[a-z]" },
                    { "\\d and \\w", "\\d\\w" }, { "( )", "(a)" }, { "(?: )", "(?:a)" }, { "alternation |", "a|b" },
                    { "* + ?", "a*b+c?" }, { "{n}", "a{3}" }, { "{n,}", "a{3,}" }, { "{n,m}", "a{3,4}" },
                    { "lazy ?", "a{2,5}?" }, { "[ as \\[", "[\\[]" },
                }
                for _, construct in ipairs(constructs) do
                    test.contains(text, construct[1], "the description names " .. construct[1])
                    local ok, code = form_pattern.check(construct[2])
                    test.is_true(ok, construct[2] .. " -> " .. tostring(code))
                end
            end)

            it("names each construct the parser refuses, and the refusal is real", function()
                local text = description()
                local refused = {
                    { "lookahead", "(?=a)a" }, { "lookbehind", "(?<=a)b" }, { "backreferences", "(a)\\1" },
                    { "named groups", "(?P<n>a)" }, { "flags", "(?i)a" }, { "\\s", "\\s" }, { "\\S", "\\S" },
                    { "\\D", "\\D" }, { "\\W", "\\W" }, { "\\b", "\\b" }, { "\\B", "\\B" }, { "\\p", "\\p{L}" },
                    { "\\x", "\\x41" }, { "\\n", "\\n" }, { "\\t", "\\t" }, { "POSIX classes", "[[:alpha:]]" },
                    { "a**", "a**" }, { "(a+)+", "(a+)+" },
                }
                for _, construct in ipairs(refused) do
                    test.contains(text, construct[1], "the description names " .. construct[1])
                    local ok = form_pattern.check(construct[2])
                    test.is_nil(ok, construct[2] .. " is refused")
                end
            end)

            it("states the bounds the parser enforces", function()
                local text = description()
                test.contains(text, string.format("at most %d characters", form_pattern.MAX_LENGTH))
                test.contains(text, string.format("nested more than %d deep", form_pattern.MAX_DEPTH))
                test.contains(text, string.format("counts of at most %d", form_pattern.MAX_REPEAT))
                test.contains(text, "no leading zero")
                test.is_true(form_pattern.check(string.format("a{%d}", form_pattern.MAX_REPEAT)))
                test.is_nil(form_pattern.check(string.format("a{%d}", form_pattern.MAX_REPEAT + 1)))
                test.is_nil(form_pattern.check("a{01}"))
                local nested = string.rep("(", form_pattern.MAX_DEPTH) .. "a" .. string.rep(")", form_pattern.MAX_DEPTH)
                test.is_true(form_pattern.check(nested))
                test.is_nil(form_pattern.check("(" .. nested .. ")"))
                test.is_true(form_pattern.check(string.rep("a", form_pattern.MAX_LENGTH)))
                test.is_nil(form_pattern.check(string.rep("a", form_pattern.MAX_LENGTH + 1)))
            end)
        end)
    end)

    describe("text helpers", function()
        it("counts blank answer text by the JavaScript trim set, where a zero-width space is content", function()
            test.is_true(form_text.is_whitespace_only(""))
            test.is_true(form_text.is_whitespace_only(" \t\n\r"))
            test.is_true(form_text.is_whitespace_only("\194\160\227\128\128\239\187\191"))
            test.is_false(form_text.is_whitespace_only("\226\128\139"), "U+200B is not whitespace here")
            test.is_false(form_text.is_whitespace_only(" a "))
            test.is_false(form_text.is_whitespace_only("\255"), "invalid UTF-8 is not blank")
        end)

        it("stays blank for definition text that shows nothing", function()
            test.is_true(form_text.is_blank("\226\128\139 "), "zero-width characters make a title blank")
        end)
    end)
end

return test.run_cases(define_tests)
