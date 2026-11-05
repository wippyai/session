local test = require("test")
local json = require("json")
local time = require("time")
local text = require("text")

-- Runtime facts the V2 standard field rules (src/forms/field_values.lua,
-- form_pattern.lua) are built on, checked against the Wippy runtime these
-- tests run on. Each case asserts what the runtime does today: when a runtime
-- upgrade changes one, the failure points at the rule that has to be looked
-- at again. The observed values are written up in
-- .local/work/session-forms/probes/2026-10-01-v2-runtime-probes.md.
--
-- Lua source in these tests writes raw bytes as decimal escapes ("\240"):
-- this runtime has no "\xHH" or "\u{...}" escape and silently drops the
-- backslash.

local function compile(pattern: string): (any, any)
    return text.regexp.compile(pattern)
end

-- Whether `pattern` matches the whole of `subject` (patterns here carry their
-- own anchors). Fails the test when the pattern does not compile.
local function matches(pattern: string, subject: string): boolean
    local re, err = compile(pattern)
    test.is_nil(err, "compile " .. pattern)
    local result, match_err = (re :: any):match_string(subject)
    test.is_nil(match_err)
    return result == true
end

local function define_tests()
    describe("P0 Lua source escapes", function()
        it("has decimal byte escapes only", function()
            test.eq(#"\240", 1)
            test.eq(string.byte("\240", 1), 240)
            test.eq(#"\xF0", 3, "\\xF0 is read as the three characters xF0")
            test.eq(#"\u{E9}", 5, "\\u{E9} is read as the five characters u{E9}")
        end)
    end)

    describe("P1 numbers", function()
        it("decodes integers exactly and everything else as a float", function()
            local cases = {
                { "3", 3, "integer" },
                { "3.0", 3, "float" },
                { "1e2", 100, "float" },
                { "0.1", 0.1, "float" },
                { "-0", 0, "integer" },
                { "1e21", 1e21, "float" },
                { "1e-7", 1e-7, "float" },
                { "123456789012345678", 123456789012345678, "integer" },
                { "12345678901234567890", 1.2345678901234567e19, "float" },
            }
            for _, case in ipairs(cases) do
                local value, err = json.decode(case[1])
                test.is_nil(err, case[1])
                test.eq(value, case[2], case[1])
                test.eq(math.type(value), case[3], case[1])
            end
            -- "-0.0" keeps its sign as a float; "-0" has none.
            local negative_zero = json.decode("-0.0")
            test.eq(math.type(negative_zero), "float")
            test.is_true(1 / negative_zero < -1e308, "1 / -0.0 is negative infinity")
            -- math.huge is the largest finite float here, not infinity, so the
            -- number rules test magnitude with a plain comparison.
            test.eq(math.huge, 1.7976931348623157e308)
        end)

        it("fails the whole decode on a number outside the float range", function()
            for _, source in ipairs({ "1e400", "-1e400" }) do
                local value, err = json.decode(source)
                test.is_nil(value, source)
                test.contains(tostring(err), "out of range")
                local object, object_err = json.decode('{"answers":{"n":' .. source .. '}}')
                test.is_nil(object, "an overflowing answer fails the whole body")
                test.not_nil(object_err)
            end
        end)

        it("keeps integers exact in sums, differences, comparison and modulo", function()
            local big = json.decode("9007199254740993") -- 2^53 + 1
            test.eq(math.type(big), "integer")
            test.eq(big - 9007199254740992, 1, "subtraction is exact")
            test.eq(big == 9007199254740992, false, "== compares integers exactly")
            local wide = json.decode("123456789012345678")
            test.eq(wide - 123456789012345000, 678, "subtraction is exact")
            test.eq(wide % 1000, 678, "% is exact")
            test.eq(math.type(3 % 2), "integer")
            test.eq(math.tointeger(1e18), 1000000000000000000)
            test.eq(math.type(math.tointeger(3.0)), "integer")
            test.eq(math.type(math.floor(json.decode("3.0"))), "float")
        end)

        it("encodes numbers in a position-dependent spelling", function()
            test.eq(json.encode(3.0), "3")
            test.eq(json.encode(0.1), "0.1")
            test.eq(json.encode(-0.0), "-0")
            test.eq(json.encode(1e-7), "1e-7")
            test.eq(json.encode(1e21), "1e+21")
            test.eq(json.encode({ a = 1e-7 }), '{"a":0.0000001}')
            test.eq(json.encode({ a = 1e21 }), '{"a":1000000000000000000000}')
            test.eq(json.encode({ a = 3.0 }), '{"a":3}')
        end)

        it("formats and parses decimal text", function()
            test.eq(string.format("%.1e", 0.1), "1.0e-01")
            test.eq(string.format("%.16e", 0.1), "1.0000000000000001e-01")
            test.eq(string.format("%.2e", 123456.0), "1.23e+05")
            test.eq(string.format("%d", 3.0), "3")
            test.eq(string.format("%.3e", json.decode("5")), "5.000e+00")
            test.eq(tonumber("1.5e+02"), 150)
            test.eq(tonumber("1.0e-01"), 0.1)
            test.is_nil(tonumber("1e2"), "an exponent needs a mantissa with a point")
            test.eq(tostring(0.30000000000000004), "0.30000000000000004")
            test.eq(tostring(1e-7), "1e-07")
            test.eq(tostring(123456789.125), "1.23456789125e+08")
        end)
    end)

    describe("P2 null in decoded answers", function()
        it("drops a null object member and leaves a hole in an array", function()
            local object, err = json.decode('{"a":null,"b":1}')
            test.is_nil(err)
            test.is_nil(object.a)
            test.eq(object.b, 1)
            local keys = 0
            for _ in pairs(object) do keys = keys + 1 end
            test.eq(keys, 1)

            local list = json.decode("[1,null,2]")
            local count = 0
            for _ in pairs(list) do count = count + 1 end
            test.eq(count, 2)
            test.eq(#list, 3, "the length counts the hole, so it is not a plain array")

            local nothing, nothing_err = json.decode("null")
            test.is_nil(nothing)
            test.is_nil(nothing_err)

            local nested = json.decode('{"answers":{"x":null}}')
            test.is_nil(next(nested.answers), "an answer sent as null is an answer not sent")
        end)
    end)

    describe("P3 time.parse(time.DATE_ONLY)", function()
        it("accepts exactly the real calendar days written as YYYY-MM-DD", function()
            test.eq(time.DATE_ONLY, "2006-01-02")
            local accepted = {
                "2024-02-29", "2000-02-29", "0001-01-01", "9999-12-31", "2023-12-31",
                "0000-01-01", -- year 0 parses: the form rules refuse it themselves
            }
            for _, value in ipairs(accepted) do
                local parsed, err = time.parse(time.DATE_ONLY, value)
                test.is_nil(err, value)
                test.not_nil(parsed, value)
            end
            local parsed = time.parse(time.DATE_ONLY, "2024-02-29")
            test.eq(parsed:year(), 2024)
            test.eq(parsed:month(), 2)
            test.eq(parsed:day(), 29)
        end)

        it("rejects wrong calendar days and every other spelling", function()
            local rejected = {
                "2023-02-30", "2023-02-29", "1900-02-29", "2100-02-29", "2023-04-31", "2023-01-32",
                "2023-13-01", "2023-00-10", "2023-2-3", "2023-1-01", "2023-01-1",
                " 2023-01-01", "2023-01-01 ", "2023-01-01x", "2023-01-01T00:00:00Z", "+2023-01-01",
                "10000-01-01", "23-01-01", "2023/01/01", "",
                "２０２３-０１-０１", -- full-width digits
            }
            for _, value in ipairs(rejected) do
                local parsed, err = time.parse(time.DATE_ONLY, value)
                test.is_nil(parsed, "[" .. value .. "]")
                test.not_nil(err, "[" .. value .. "]")
            end
            local _, calendar_err = time.parse(time.DATE_ONLY, "2023-02-30")
            test.contains(tostring(calendar_err), "day out of range")
        end)
    end)

    describe("P4 text.regexp", function()
        it("refuses what the form rules also refuse, with an INVALID error", function()
            local refused = {
                "(?=a)", "(?!a)", "(a)\\1", "a{1001}", "a{0,2000}", "a{3,2}", "a**", "a{2}{3}", "(", "[", "*a",
                "a\255", -- invalid UTF-8 in the pattern
            }
            for _, pattern in ipairs(refused) do
                local re, err = compile(pattern)
                test.is_nil(re, pattern)
                test.not_nil(err, pattern)
                test.eq(err:kind(), errors.INVALID, pattern)
            end
            local _, lookahead = compile("(?=a)")
            test.contains(tostring(lookahead), "invalid or unsupported Perl syntax")
            test.not_nil(compile("a{1000}"), "a repeat count of 1000 is the bound")
        end)

        it("accepts what the form rules must refuse themselves", function()
            local accepted = {
                "(?i)abc", "(?i:abc)", "(?P<n>a)", "(?<n>a)", "\\s", "\\S", "\\b", "\\B", "\\pL", "\\p{L}",
                "[[:alpha:]]", "\\x41", "\\x{41}", "\\Aab\\z", "a{,3}", "a{}", "}", "]", "\\-", "\\_", "\\@",
                "^*", "[\\w-x]", "(?:)", "a|",
            }
            for _, pattern in ipairs(accepted) do
                local re, err = compile(pattern)
                test.is_nil(err, pattern)
                test.not_nil(re, pattern)
            end
        end)

        it("matches the whole text only, ASCII classes, one character per code point", function()
            test.is_true(matches("^(?:a+)$", "aaa"))
            test.is_false(matches("^(?:a+)$", "aaa\n"), "$ is the end of the text, not before a final newline")
            test.is_false(matches("(?:a+)$", "aaa\n"))
            test.is_true(matches("^(?:\\d+)$", "123"))
            test.is_false(matches("^(?:\\d+)$", "\217\161\217\162"), "\\d is ASCII only (Arabic-Indic digits)")
            test.is_true(matches("^(?:\\w+)$", "abc_1"))
            test.is_false(matches("^(?:\\w+)$", "é"), "\\w is ASCII only")
            test.is_false(matches("^(?:\\s)$", "\194\160"), "\\s does not match a no-break space (JavaScript's does)")
            test.is_true(matches("^(?:\\pL+)$", "é"))
            test.is_true(matches("^(?:.)$", "\240\159\152\128"), ". is one code point, not one UTF-8 byte")
            test.is_false(matches("^(?:..)$", "\240\159\152\128"))
            test.is_true(matches("^(?:[\240\159\152\128])$", "\240\159\152\128"))
            test.is_true(matches("^(?:.)$", "\r"), ". matches CR (JavaScript's does not)")
            test.is_true(matches("^(?:.)$", "\226\128\168"), ". matches U+2028 (JavaScript's does not)")
            test.is_false(matches("^(?:.)$", "\n"))
            test.is_true(matches("(?i)^(?:abc)$", "ABC"))
            test.is_true(matches("^(?:a{2,3})$", "aa"))
            test.is_true(matches("^(?:a+?)$", "aaa"))
            test.is_true(matches("^(?:(a{2}){3})$", "aaaaaa"))
        end)

        it("reads invalid UTF-8 in a subject as a replacement character", function()
            test.is_true(matches("^(?:.+)$", "ab\255cd"))
            test.is_false(matches("^(?:[a-z]+)$", "ab\255cd"))
        end)

        it("runs in linear time on patterns that make a backtracking engine stall", function()
            local started = time.now()
            test.is_false(matches("^(?:(a+)+b)$", string.rep("a", 2000)))
            test.is_false(matches("^(?:(x+x+)+y)$", string.rep("x", 2000)))
            test.is_false(matches("^(?:(a|b|ab)+c)$", string.rep("ab", 1000)))
            local long = string.rep("ab ", 666)
            local re = compile("^(?:[a-z ]*)$")
            for _ = 1, 100 do
                test.is_true(((re :: any):match_string(long)))
            end
            local elapsed = time.now():sub(started):milliseconds()
            test.lt(elapsed, 2000, "a 2000-character value matches in far under a second")
        end)

        it("compiles a pattern wrapped for a full match", function()
            test.is_true(matches("^(?:a|b)$", "b"))
            test.is_false(matches("^(?:a|b)$", "ab"))
            test.is_true(matches("^(?:^a$)$", "a"), "an author's own anchors are harmless inside the wrapper")
        end)
    end)
end

return test.run_cases(define_tests)
