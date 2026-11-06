local test = require("test")
local definition = require("definition")
local form_text = require("form_text")

-- Every free-text answer takes the same sequence (form_text.read_answer): a
-- size guard on the raw value, trim where the answer is trimmed, UTF-8, control
-- characters, blank, then the length. Six answers take it: the Other text and
-- the note of a choice (single and multiple), and the text, textarea and email
-- fields. This file pins what each of them answers at every step, codes and
-- messages included, so the one helper cannot change one of them unnoticed,
-- and tests the helper on its own.

local DEF = definition.normalize({ title = "Text", fields = {
    { id = "pick", type = "choice", label = "Pick", allow_other = true, options = { "A", "B" } },
    { id = "many", type = "choice", label = "Many", multiple = true, allow_other = true, options = { "A", "B" } },
    { id = "line", type = "text", label = "Line", max_length = 5 },
    { id = "area", type = "textarea", label = "Area", max_length = 5 },
    { id = "mail", type = "email", label = "Mail" },
} })

local SPACES = "   \194\160\227\128\128" -- spaces, no-break space, ideographic space: blank to the trim set

-- Per pipeline: how an answer is written, what a refusal says, and how each
-- kind of blank answer comes out. `max` and `raw` are the character limit and
-- the size guard's multiplier; `stored` reads the kept text from the result.
local PIPELINES = {
    {
        name = "other", field = "pick", max = 2000, raw = 8, multiline = true, trims = true,
        wrap = function(text) return { other = text } end,
        stored = function(result: any) return result.other end,
        too_long = "The other answer must be at most 2000 characters.",
        not_utf8 = "The other answer must be valid UTF-8 text.",
        control = "The other answer must not contain control characters other than tabs and line breaks.",
        blank = function(result: any, code: any, message: any)
            test.is_nil(result)
            test.eq(code, "blank")
            test.eq(message, "Enter the other answer.")
        end,
    },
    {
        name = "other in a list", field = "many", max = 2000, raw = 8, multiline = true, trims = true,
        wrap = function(text) return { { other = text } } end,
        stored = function(result: any) return result[1].other end,
        too_long = "The other answer must be at most 2000 characters.",
        not_utf8 = "The other answer must be valid UTF-8 text.",
        control = "The other answer must not contain control characters other than tabs and line breaks.",
        blank = function(result: any, code: any, message: any)
            test.is_nil(result)
            test.eq(code, "blank")
            test.eq(message, "Enter the other answer.")
        end,
    },
    {
        name = "note", field = "pick", max = 1000, raw = 8, multiline = true, trims = true,
        wrap = function(text) return { value = "A", note = text } end,
        stored = function(result: any) return result.note end,
        too_long = "A note must be at most 1000 characters.",
        not_utf8 = "The note must be valid UTF-8 text.",
        control = "The note must not contain control characters other than tabs and line breaks.",
        -- A blank note is no note: the plain option comes back.
        blank = function(result: any, code: any)
            test.is_nil(code)
            test.eq(result, "A")
        end,
    },
    {
        name = "note in a list", field = "many", max = 1000, raw = 8, multiline = true, trims = true,
        wrap = function(text) return { { value = "A", note = text } } end,
        stored = function(result: any) return result[1].note end,
        too_long = "A note must be at most 1000 characters.",
        not_utf8 = "The note must be valid UTF-8 text.",
        control = "The note must not contain control characters other than tabs and line breaks.",
        blank = function(result: any, code: any)
            test.is_nil(code)
            test.eq(result[1], "A")
            test.eq(#result, 1)
        end,
    },
    {
        name = "text", field = "line", max = 5, raw = 4, multiline = false, trims = false,
        wrap = function(text) return text end,
        stored = function(result: any) return result end,
        too_long = "Must be at most 5 characters.",
        not_utf8 = "Must be valid UTF-8 text.",
        control = "Must not contain control characters or line breaks.",
        blank = function(result: any, code: any)
            test.is_nil(code)
            test.is_nil(result)
        end,
    },
    {
        name = "textarea", field = "area", max = 5, raw = 4, multiline = true, trims = false,
        wrap = function(text) return text end,
        stored = function(result: any) return result end,
        too_long = "Must be at most 5 characters.",
        not_utf8 = "Must be valid UTF-8 text.",
        control = "Must not contain control characters other than tabs and line breaks.",
        blank = function(result: any, code: any)
            test.is_nil(code)
            test.is_nil(result)
        end,
    },
}

local function run(pipeline: any, text: string): (any, any, any)
    local answers = { [pipeline.field] = pipeline.wrap(text) }
    local normalized, field_errors = definition.validate_answers(DEF, answers)
    if field_errors then
        local err = field_errors[pipeline.field][1]
        return nil, err.code, err.message
    end
    return normalized[pipeline.field], nil, nil
end

local function mail(text: string): (any, any, any)
    local normalized, field_errors = definition.validate_answers(DEF, { mail = text })
    if field_errors then
        local err = field_errors.mail[1]
        return nil, err.code, err.message
    end
    return normalized.mail, nil, nil
end

local function define_tests()
    for _, pipeline in ipairs(PIPELINES) do
        describe("the " .. pipeline.name .. " answer", function()
            it("refuses a raw value over the size guard before it looks at the bytes", function()
                local huge = string.rep("\255", pipeline.max * pipeline.raw + 1)
                local result, code, message = run(pipeline, huge)
                test.is_nil(result)
                test.eq(code, "too_long", "the guard comes before the UTF-8 check")
                test.eq(message, pipeline.too_long)
            end)

            it("refuses invalid UTF-8, before control characters", function()
                local _, code, message = run(pipeline, "a\255")
                test.eq(code, "invalid_text")
                test.eq(message, pipeline.not_utf8)
                local _, both, both_message = run(pipeline, "\255\1")
                test.eq(both, "invalid_text")
                test.eq(both_message, pipeline.not_utf8)
            end)

            it("refuses a control character with the message of its kind", function()
                local _, code, message = run(pipeline, "a\1b")
                test.eq(code, "invalid_text")
                test.eq(message, pipeline.control)
                local _, delete = run(pipeline, "a\127")
                test.eq(delete, "invalid_text")
                local _, c1 = run(pipeline, "a\194\133")
                test.eq(c1, "invalid_text")
                local _, bidi = run(pipeline, "a\226\128\174")
                test.eq(bidi, "invalid_text")
            end)

            it("takes tabs and line breaks only where the answer is multi-line", function()
                local result, code, message = run(pipeline, "a\tb\nc")
                if pipeline.multiline then
                    test.is_nil(code)
                    test.eq(pipeline.stored(result), "a\tb\nc")
                else
                    test.eq(code, "invalid_text")
                    test.eq(message, pipeline.control)
                end
            end)

            it("treats an answer of only whitespace as blank, after the control check", function()
                local result, code, message = run(pipeline, SPACES)
                pipeline.blank(result, code, message)
            end)

            it("counts characters, not bytes, against the limit", function()
                local fits = string.rep("\195\169", pipeline.max) -- é
                local result, code = run(pipeline, fits)
                test.is_nil(code)
                test.eq(pipeline.stored(result), fits)
                local over, over_code, over_message = run(pipeline, fits .. "\195\169")
                test.is_nil(over)
                test.eq(over_code, "too_long")
                test.eq(over_message, pipeline.too_long)
                local astral = string.rep("\240\159\152\128", pipeline.max) -- U+1F600
                local astral_result, astral_code = run(pipeline, astral)
                test.is_nil(astral_code)
                test.eq(pipeline.stored(astral_result), astral)
            end)

            it("accepts the limit and refuses one character more", function()
                local at_limit = string.rep("a", pipeline.max)
                local result, code = run(pipeline, at_limit)
                test.is_nil(code)
                test.eq(pipeline.stored(result), at_limit)
                local _, over = run(pipeline, at_limit .. "a")
                test.eq(over, "too_long")
            end)

            it(pipeline.trims and "keeps the text without its outer whitespace" or "keeps the text exactly as typed", function()
                local result, code = run(pipeline, " x ")
                test.is_nil(code)
                test.eq(pipeline.stored(result), pipeline.trims and "x" or " x ")
                local nbsp, nbsp_code = run(pipeline, "\194\160x\227\128\128")
                test.is_nil(nbsp_code)
                test.eq(pipeline.stored(nbsp), pipeline.trims and "x" or "\194\160x\227\128\128")
            end)

            it("keeps a zero-width space as content", function()
                local result, code = run(pipeline, "\226\128\139")
                test.is_nil(code)
                test.eq(pipeline.stored(result), "\226\128\139")
            end)

            it("measures the limit after trimming only where the answer is trimmed", function()
                local padded = string.rep(" ", pipeline.max) .. "x"
                local result, code = run(pipeline, padded)
                if pipeline.trims then
                    test.is_nil(code)
                    test.eq(pipeline.stored(result), "x")
                else
                    test.is_nil(result)
                    test.eq(code, "too_long")
                end
            end)
        end)
    end

    describe("the email answer", function()
        local MESSAGE = "Enter a valid email address."

        it("refuses a raw value over the size guard, and a value over 254 characters", function()
            local _, huge_code, huge_message = mail(string.rep("a", 254 * 8 + 1))
            test.eq(huge_code, "invalid_email")
            test.eq(huge_message, MESSAGE)
            local _, over_code = mail(string.rep("a", 64) .. "@" .. string.rep("b", 63) .. "."
                .. string.rep("c", 63) .. "." .. string.rep("d", 63) .. "." .. string.rep("e", 63))
            test.eq(over_code, "invalid_email")
            local at_limit = string.rep("a", 64) .. "@" .. string.rep("b", 60) .. "." .. string.rep("c", 60) .. "."
                .. string.rep("d", 60) .. "." .. string.rep("e", 6)
            test.eq(#at_limit, 254)
            local kept, kept_code = mail(at_limit)
            test.is_nil(kept_code)
            test.eq(kept, at_limit)
        end)

        it("answers invalid_email for invalid UTF-8 and control characters", function()
            for _, value in ipairs({ "a\255@b.co", "a\1@b.co", "a@b.co\1", "a@\194\133b.co", "a b@c.co", "a@b.co\255" }) do
                local result, code, message = mail(value)
                test.is_nil(result, value)
                test.eq(code, "invalid_email", value)
                test.eq(message, MESSAGE, value)
            end
        end)

        it("trims the address, and leaves a blank one unanswered", function()
            local trimmed = mail("  \194\160a@b.co\n ")
            test.eq(trimmed, "a@b.co")
            local blank, blank_code = mail(SPACES)
            test.is_nil(blank)
            test.is_nil(blank_code)
            local empty, empty_code = mail("")
            test.is_nil(empty)
            test.is_nil(empty_code)
        end)

        it("refuses an address that is not valid syntax", function()
            for _, value in ipairs({ "nope", "a@b", "@b.co", "a@.co", "a@b..co", "é@b.co", "a@é.co" }) do
                local _, code = mail(value)
                test.eq(code, "invalid_email", value)
            end
            local _, local_over = mail(string.rep("a", 65) .. "@b.co")
            test.eq(local_over, "invalid_email")
            test.eq(mail(string.rep("a", 64) .. "@b.co"), string.rep("a", 64) .. "@b.co")
        end)
    end)

    describe("form_text.read_answer", function()
        local function read(value: string, overrides: any?)
            local opts = { max = 5, raw_factor = 4, trim = false, multiline = false }
            for key, item in pairs(overrides or {}) do opts[key] = item end
            return form_text.read_answer(value, opts)
        end

        it("returns the text and its length in characters", function()
            local kept, length, problem = read("abc")
            test.eq(kept, "abc")
            test.eq(length, 3)
            test.is_nil(problem)
            local accented, accented_length = read("\195\169\195\169")
            test.eq(accented, "\195\169\195\169")
            test.eq(accented_length, 2)
        end)

        it("names the first problem in the fixed order, and returns no text with it", function()
            local function problem_of(value: string, overrides: any?): string?
                local kept, length, problem = read(value, overrides)
                if problem then
                    test.is_nil(kept)
                    test.is_nil(length)
                end
                return problem
            end
            test.eq(problem_of(string.rep("\255", 21)), "too_long", "the size guard is first")
            test.eq(problem_of("\255\1"), "not_utf8")
            test.eq(problem_of("\1  "), "control_characters")
            test.eq(problem_of("   "), "blank")
            test.eq(problem_of("abcdef"), "too_long")
            test.is_nil(problem_of("abcde"))
        end)

        it("measures the size guard with the raw factor, from the limit", function()
            test.is_nil(select(3, read(string.rep("a", 5), { max = 5, raw_factor = 1 })))
            test.eq(select(3, read(string.rep("a", 6), { max = 5, raw_factor = 1 })), "too_long")
            test.eq(select(3, read(string.rep("\255", 41), { max = 5, raw_factor = 8 })), "too_long")
            test.eq(select(3, read(string.rep("\255", 40), { max = 5, raw_factor = 8 })), "not_utf8")
        end)

        it("allows tabs and line breaks only for multi-line text", function()
            test.eq(select(3, read("a\tb")), "control_characters")
            test.eq(select(3, read("a\nb")), "control_characters")
            test.is_nil(select(3, read("a\tb", { multiline = true })))
            test.eq(select(3, read("a\1b", { multiline = true })), "control_characters")
        end)

        it("trims only when asked, and then measures the trimmed text", function()
            local kept, length = read(" ab ")
            test.eq(kept, " ab ")
            test.eq(length, 4)
            local trimmed, trimmed_length = read(" ab ", { trim = true })
            test.eq(trimmed, "ab")
            test.eq(trimmed_length, 2)
            test.eq(select(3, read("      ab", { trim = false })), "too_long")
            test.is_nil(select(3, read("      ab", { trim = true })))
            test.eq(select(3, read(" \t ", { trim = true, multiline = true })), "blank")
        end)

        it("counts a zero-width space as content and a no-break space as blank", function()
            test.is_nil(select(3, read("\226\128\139")))
            test.eq(select(3, read("\194\160\227\128\128")), "blank")
        end)
    end)
end

return test.run_cases(define_tests)
