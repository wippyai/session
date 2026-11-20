local test = require("test")
local json = require("json")
local time = require("time")
local text = require("text")

-- Runtime facts the V2 standard field rules (src/forms/field_values.lua,
-- form_pattern.lua) are built on, checked against the Wippy runtime these
-- tests run on. Each case asserts what the runtime does today: when a runtime
-- upgrade changes one, the failure points at the rule that has to be looked
-- at again.

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
    describe("numbers", function()
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
    end)

    describe("time.parse(time.DATE_ONLY)", function()
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

    describe("text.regexp", function()
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

        -- A backtracking engine would not finish these.
        it("matches in linear time on patterns that make a backtracking engine stall", function()
            test.is_false(matches("^(?:(a+)+b)$", string.rep("a", 2000)))
            test.is_false(matches("^(?:(x+x+)+y)$", string.rep("x", 2000)))
            test.is_false(matches("^(?:(a|b|ab)+c)$", string.rep("ab", 1000)))
        end)
    end)
end

return test.run_cases(define_tests)
