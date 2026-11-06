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

    -- The one whole-number test: the answer checks, the definition keys and
    -- the state service's expected_content_version all use it.
    describe("whole numbers", function()
        it("is_whole accepts a finite number with no fraction, however it is written", function()
            for _, value in ipairs({ 0, 1, -1, 3.0, -3.0, 100, 1e12, -1e12, 2 ^ 53, 1e300 }) do
                test.is_true(field_values.is_whole(value), tostring(value))
            end
        end)

        it("is_whole refuses a fraction, a non-finite number and anything that is not a number", function()
            for _, value in ipairs({ 0.5, -0.5, 1e-7, 2.0000001, 0 / 0, math.huge, -math.huge }) do
                test.is_false(field_values.is_whole(value), tostring(value))
            end
            for _, value in ipairs({ "3", true, false, {} }) do
                test.is_false(field_values.is_whole(value), tostring(value))
            end
            test.is_false(field_values.is_whole(nil))
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
            local saved_expanded = form_pattern.MAX_EXPANDED
            after_each(function()
                form_pattern.MAX_REPEAT = saved_max
                form_pattern.MAX_EXPANDED = saved_expanded
            end)

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
                    local forms = { { string.format("a{%d}", low), low, low } }
                    -- An open repeat counts its lower bound plus one, so {100,} is over the size limit.
                    if low < 100 then table.insert(forms, { string.format("a{%d,}", low), low, nil }) end
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
                form_pattern.MAX_EXPANDED = 1000
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

    describe("pattern size with every repeat written out", function()
        local function refused(pattern: string)
            local ok, code, message = form_pattern.check(pattern)
            test.is_nil(ok, pattern)
            test.eq(code, "unsupported_pattern", pattern)
            return message
        end

        local function accepted(pattern: string)
            local ok, code = form_pattern.check(pattern)
            test.is_true(ok, pattern .. " -> " .. tostring(code))
        end

        it("takes a pattern at the limit and refuses one over it", function()
            test.eq(form_pattern.MAX_EXPANDED, 100)
            accepted("a{100}")
            accepted(string.rep("a", 100))
            refused(string.rep("a", 101))
            refused("a{100}b")
        end)

        it("multiplies nested repeats", function()
            accepted("(a{5}){20}")
            refused("(a{5}){21}")
            accepted("((a{5}){5}){4}")
            refused("((a{5}){5}){5}")
            accepted("(ab){50}")
            refused("(ab){51}")
        end)

        it("adds up alternatives and sequences", function()
            accepted("(a{50}|b{50})")
            refused("(a{50}|b{51})")
            accepted("a{50}b{50}")
            refused("a{50}b{51}")
            accepted("a{50}|b{50}")
            refused("a{50}|b{51}")
        end)

        it("counts an open repeat as its lower bound plus one", function()
            accepted("a{99,}")
            refused("a{100,}")
        end)

        it("counts what * + and ? repeat once, so they hide no cost", function()
            for _, form in ipairs({ "(a*b){0,%d}", "(a+b){0,%d}", "(a?b){0,%d}" }) do
                accepted(string.format(form, 50))
                refused(string.format(form, 51))
            end
        end)

        it("counts an empty group", function()
            accepted("(()()){0,50}")
            refused("(()()){0,51}")
        end)

        it("counts a repeat of zero as what it repeats, once", function()
            accepted("a{0}")
            accepted("(?:a{0}b){50}")
            refused("(?:a{0}b){51}")
            accepted("(?:a{0,0}b){50}")
            refused("(?:a{0,0}b){51}")
            accepted("(?:(ab){0}c){33}")
            refused("(?:(ab){0}c){34}")
        end)

        it("refuses a group of empty repeats that compiles to thousands of instructions", function()
            -- 46 copies of a{0} repeated 99 times: each copy compiles to an
            -- instruction, so this is about 4,500 of them, in 198 characters.
            local crafted = "(?:(?:" .. string.rep("a{0}", 46) .. "){99}b)*"
            test.eq(#crafted, 198)
            refused(crafted)
        end)

        it("reports a malformed pattern as malformed, whatever its size", function()
            local ok, code = form_pattern.check("a{100}a{100}(")
            test.is_nil(ok)
            test.eq(code, "invalid_pattern")
        end)

        it("names the limit and no part of the pattern", function()
            local message = refused("secret{100}")
            test.contains(message, "100")
            test.is_nil((string.find(message, "secret", 1, true)))
        end)

        it("takes the shapes real forms use", function()
            accepted("[A-Z]{2}[0-9]{6}")
            accepted("\\+?[0-9]{7,15}")
            accepted("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
            accepted("[a-z0-9]{1,64}")
            accepted("([a-z]{1,10} ){0,5}")
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

    describe("the ask_user_fields tool schema", function()
        local CHOICE_TOOL = "wippy.session.forms:ask_user_tool"
        local FIELDS_TOOL = "wippy.session.forms:ask_user_fields_tool"

        local function schema_of(tool_id: string): any
            local entry, err = registry.get(tool_id)
            test.is_nil(err)
            local schema, decode_err = json.decode(tostring(entry.meta.input_schema))
            test.is_nil(decode_err)
            return schema
        end

        local function root_schema(): any
            return schema_of(FIELDS_TOOL)
        end

        -- Each tool advertises exactly the types its handler accepts, and
        -- each trait carries its own tool and names it in its prompt.
        describe("the field types each tool accepts", function()
            local function type_enum(tool_id: string): any
                return schema_of(tool_id).properties.fields.items.properties.type.enum
            end

            it("are choice only for ask_user, as its handler enforces", function()
                local enum = type_enum(CHOICE_TOOL)
                test.eq(#enum, 1)
                test.eq(enum[1], "choice")
                local accepted = {}
                for name in pairs(definition.CHOICE_TYPES) do table.insert(accepted, name) end
                test.eq(#accepted, 1)
                test.eq(accepted[1], "choice")
            end)

            it("are every type for ask_user_fields, in the server's order", function()
                local enum = type_enum(FIELDS_TOOL)
                test.eq(#enum, #definition.TYPES)
                for index, name in ipairs(definition.TYPES) do
                    test.eq(enum[index], name)
                end
            end)

            it("belong to the trait that carries the tool, and its prompt names it", function()
                for trait_id, tool_id in pairs({
                    ["wippy.session.forms:ask_user"] = CHOICE_TOOL,
                    ["wippy.session.forms:ask_user_fields"] = FIELDS_TOOL,
                }) do
                    local trait, err = registry.get(trait_id)
                    test.is_nil(err)
                    local tools = trait.data.tools
                    test.eq(#tools, 2)
                    test.eq(tools[1], tool_id)
                    test.eq(tools[2], "wippy.session.forms:read_form_tool")
                    local tool = registry.get(tool_id)
                    test.contains(tostring(trait.data.prompt), "the " .. tostring(tool.meta.llm_alias) .. " tool")
                end
            end)
        end)

        local function field_schema(): any
            return root_schema().properties.fields.items
        end

        -- The numbers the model is told are written in the schema and the
        -- trait prompt by hand, so each one is compared with the constant the
        -- validator enforces. A limit that changes in one place fails here.
        describe("the limits it states", function()
            local LIMITS = field_values.LIMITS
            local magnitude = field_values.number_text(LIMITS.NUMBER_MAGNITUDE)

            it("are the limits of the standard fields", function()
                local properties = field_schema().properties
                local max_length = tostring(properties.max_length.description)
                test.contains(max_length, string.format("default %d, at most %d", LIMITS.TEXT_DEFAULT, LIMITS.TEXT_MAX))
                test.contains(max_length, string.format("textarea: default and at most %d", LIMITS.TEXTAREA_MAX))
                test.contains(max_length, string.format("at most %d characters together", LIMITS.TEXT_BUDGET))
                test.contains(max_length, string.format("an email counts %d", LIMITS.EMAIL_MAX))
                test.contains(tostring(properties.placeholder.description),
                    string.format("at most %d characters", LIMITS.PLACEHOLDER))
                local decimals = string.format("at most %d decimals", LIMITS.NUMBER_DECIMALS)
                local range = string.format("between -%s and %s", magnitude, magnitude)
                test.contains(tostring(properties.min.description), decimals)
                test.contains(tostring(properties.min.description), range)
                test.contains(tostring(properties.step.description), decimals)
                test.contains(tostring(properties.max.description), "same limits as min")
            end)

            -- Both tools state the same definition limits.
            for _, tool_id in ipairs({ CHOICE_TOOL, FIELDS_TOOL }) do
                it("are the limits of the definition in " .. tool_id, function()
                    local root = schema_of(tool_id)
                    local DEFINITION = definition.LIMITS
                    test.contains(tostring(root.properties.title.description), string.format("1-%d characters", DEFINITION.TITLE))
                    test.contains(tostring(root.properties.description.description),
                        string.format("at most %d characters", DEFINITION.DESCRIPTION))
                    test.contains(tostring(root.properties.submit_label.description),
                        string.format("at most %d characters", DEFINITION.SUBMIT_LABEL))
                    test.contains(tostring(root.properties.answered_message.description),
                        string.format("at most %d characters", DEFINITION.ANSWERED_MESSAGE))
                    test.contains(tostring(root.properties.fields.description), string.format("1-%d questions", DEFINITION.FIELDS))
                    local item = root.properties.fields.items.properties
                    test.contains(tostring(item.label.description), string.format("1-%d characters", DEFINITION.LABEL))
                    test.contains(tostring(item.description.description),
                        string.format("at most %d characters", DEFINITION.DESCRIPTION))
                    test.contains(tostring(item.options.description), string.format("1-%d distinct choices, each at most %d characters",
                        DEFINITION.OPTIONS, DEFINITION.OPTION_TEXT))
                    local entry = registry.get(tool_id)
                    test.contains(tostring(entry.meta.llm_description),
                        string.format("about %d KiB", math.floor(DEFINITION.DEFINITION_BYTES / 1024)))
                end)
            end

            it("are the limits the trait prompt gives the model", function()
                local entry, err = registry.get("wippy.session.forms:ask_user_fields")
                test.is_nil(err)
                local prompt = tostring(entry.data.prompt)
                test.not_nil(string.find(prompt, string.format("at most %d%%s+characters", LIMITS.TEXT_BUDGET)),
                    "the prompt names the text budget " .. LIMITS.TEXT_BUDGET)
            end)

            it("are enforced at the numbers the schema states", function()
                -- The values the text promises are accepted, one more is not.
                local function text_field(max: number)
                    return { id = "f", type = "text", label = "Q", max_length = max }
                end
                test.is_nil(select(2, definition.normalize({ title = "T", fields = { text_field(LIMITS.TEXT_MAX) } })))
                local _, over = definition.normalize({ title = "T", fields = { text_field(LIMITS.TEXT_MAX + 1) } })
                test.eq(over[1].code, "invalid_range")
                local _, number_over = definition.normalize({ title = "T", fields = {
                    { id = "f", type = "number", label = "Q", max = LIMITS.NUMBER_MAGNITUDE } } })
                test.is_nil(number_over)
                local _, past = definition.normalize({ title = "T", fields = {
                    { id = "f", type = "number", label = "Q", max = LIMITS.NUMBER_MAGNITUDE * 10 } } })
                test.eq(past[1].code, "invalid_range")
            end)
        end)

        describe("the number range message", function()
            local saved = field_values.LIMITS.NUMBER_MAGNITUDE
            after_each(function() field_values.LIMITS.NUMBER_MAGNITUDE = saved end)

            it("names the limit the validator enforces, for an answer and for a bound", function()
                local _, answer_err = field_values.check_answer({ type = "number" }, 1000000000000)
                test.is_nil(answer_err)
                local _, big = field_values.check_answer({ type = "number" }, 1000000000001)
                test.eq(big.code, "invalid_number")
                test.eq(big.message, "Enter a number between -1000000000000 and 1000000000000.")

                field_values.LIMITS.NUMBER_MAGNITUDE = 500000
                local _, changed = field_values.check_answer({ type = "number" }, 600000)
                test.eq(changed.code, "invalid_number")
                test.eq(changed.message, "Enter a number between -500000 and 500000.")
                local _, errors = definition.normalize({ title = "T", fields = {
                    { id = "f", type = "number", label = "Q", min = 600000 } } })
                test.eq(errors[1].code, "invalid_range")
                test.eq(errors[1].message, "Must be between -500000 and 500000.")
            end)
        end)

        it("tells the model in the trait prompt the limits each text type has", function()
            local trait, err = registry.get("wippy.session.forms:ask_user_fields")
            test.is_nil(err)
            local prompt = (string.gsub(tostring(trait.data.prompt), "%s+", " "))
            local limits = field_values.LIMITS
            test.contains(prompt, "A text or textarea field holds at most what its max_length allows")
            test.contains(prompt, string.format("an email address at most %d characters", limits.EMAIL_MAX))
            test.contains(prompt, string.format("together at most %d characters", limits.TEXT_BUDGET))
            -- An email field has no max_length: a model that wrote one would get unknown_key.
            test.is_nil(field_values.KEYS.email.max_length)
        end)

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
                local set: {[string]: boolean} = {}
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
                test.contains(text, string.format("counts at most %d with every repeat written out", form_pattern.MAX_EXPANDED))
                test.contains(text, "no leading zero")
                test.contains(text, "an empty group count 1")
                test.contains(text, "a repeat of zero counts what it repeats once, so a{0} counts 1")
                test.is_true(form_pattern.check(string.format("a{%d}", form_pattern.MAX_REPEAT)))
                test.is_nil(form_pattern.check(string.format("a{%d}", form_pattern.MAX_REPEAT + 1)))
                test.is_nil(form_pattern.check("a{01}"))
                local nested = string.rep("(", form_pattern.MAX_DEPTH) .. "a" .. string.rep(")", form_pattern.MAX_DEPTH)
                test.is_true(form_pattern.check(nested))
                test.is_nil(form_pattern.check("(" .. nested .. ")"))
                test.is_true(form_pattern.check("[" .. string.rep("a", form_pattern.MAX_LENGTH - 2) .. "]"))
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
