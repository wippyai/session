local test = require("test")
local json = require("json")
local registry = require("registry")
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
