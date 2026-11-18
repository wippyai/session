local test = require("test")
local json = require("json")
local preview = require("preview")

-- Argument preview (architecture 4.6; AC 36), one case per rule.

local BS = "\\"

local function has(list: {string}, value: string): boolean
    for _, item in ipairs(list) do
        if item == value then return true end
    end
    return false
end

local function encoded_size(value: any): integer
    return #(json.encode(value) or "")
end

local function base64_of(bytes: integer): string
    local alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    local out = {}
    for i = 1, (bytes // 3) * 4 do
        local index = (i * 7 + i // 3) % 64 + 1
        out[i] = alphabet:sub(index, index)
    end
    return table.concat(out)
end

local function define_tests()
    describe("Tool approval argument preview (AC 36)", function()
        it("shows U+202E and the literal text \\u202e differently", function()
            local out = preview.build({ a = "x\u{202E}y", b = "x" .. BS .. "u202ey" })
            test.eq(out.arguments.a, "x" .. BS .. "u202ey", "the character becomes its escape")
            test.eq(out.arguments.b, "x" .. BS .. BS .. "u202ey", "the literal backslash is escaped too")
            test.neq(out.arguments.a, out.arguments.b)
        end)

        it("escapes zero-width, bidirectional, control and quote characters", function()
            local out = preview.build({
                zw = "a\u{200B}b\u{200D}c\u{FEFF}d\u{2060}",
                bidi = "\u{2066}x\u{2069}\u{200F}",
                control = "line1\nline2\t\0end",
                quote = "say \"hi\"",
                tag = "x\u{E0041}",
                bad = "ok\255",
                plain = "Grüße 日本",
            })
            test.eq(out.arguments.zw, "a" .. BS .. "u200bb" .. BS .. "u200dc" .. BS .. "ufeffd" .. BS .. "u2060")
            test.eq(out.arguments.bidi, BS .. "u2066x" .. BS .. "u2069" .. BS .. "u200f")
            test.eq(out.arguments.control, "line1" .. BS .. "nline2" .. BS .. "t" .. BS .. "u0000end")
            test.eq(out.arguments.quote, "say " .. BS .. "\"hi" .. BS .. "\"")
            test.eq(out.arguments.tag, "x" .. BS .. "udb40" .. BS .. "udc41")
            test.eq(out.arguments.bad, "ok" .. BS .. "xff")
            test.eq(out.arguments.plain, "Grüße 日本", "visible text is unchanged")
            test.eq(#out.cut, 0)
        end)

        it("escapes object keys the same way", function()
            local out = preview.build({ ["evil\u{202E}key"] = 1 })
            test.eq(out.arguments["evil" .. BS .. "u202ekey"], 1)
        end)

        it("keeps exact int64 digits above 2^53 as strings with a type marker", function()
            local args = json.decode('{"big":9007199254740993,"min":-9223372036854775808,'
                .. '"max":9223372036854775807,"safe":9007199254740991,"nested":[1,12345678901234567]}')
            local out = preview.build(args)
            test.eq(out.arguments.big, "9007199254740993")
            test.eq(out.arguments.min, "-9223372036854775808")
            test.eq(out.arguments.max, "9223372036854775807")
            test.eq(out.arguments.safe, 9007199254740991, "a safe integer stays a number")
            test.eq(out.arguments.nested[2], "12345678901234567")
            test.is_true(has(out.numbers, "/big"))
            test.is_true(has(out.numbers, "/min"))
            test.is_true(has(out.numbers, "/nested/1"))
            test.is_false(has(out.numbers, "/safe"))
            test.contains(out.summary, "big: 9007199254740993")
        end)

        it("shows a float beyond 2^53 as text instead of claiming digits it does not have", function()
            local out = preview.build(json.decode('{"huge":12345678901234567890,"half":1.5}'))
            test.eq(out.arguments.huge, "1.2345678901234567e+19")
            test.eq(out.arguments.half, 1.5)
            test.is_true(has(out.numbers, "/huge"))
        end)

        it("shows base64, a data URL and long hex runs as [binary, size]", function()
            local b64 = base64_of(1500)
            local hex = string.rep("0123456789abcdef", 16)
            local out = preview.build({
                blob = b64,
                image = "data:image/png;base64," .. b64,
                inline = "see data:text/plain,hello-world here",
                digest = "sha256 " .. hex .. " end",
                token = "sk_test_51HAbCdEfGh0123456789",
            })
            test.eq(out.arguments.blob, "[binary, 1.5 KB]")
            test.eq(out.arguments.image, "[binary, 1.5 KB]")
            test.eq(out.arguments.inline, "see [binary, 11 B] here")
            test.eq(out.arguments.digest, "sha256 [binary, 128 B] end")
            test.eq(out.arguments.token, "sk_test_51HAbCdEfGh0123456789", "a short token is not binary")
            for _, path in ipairs({ "/blob", "/image", "/inline", "/digest" }) do
                test.is_true(has(out.cut, path), path)
            end
            test.is_false(has(out.cut, "/token"))
        end)

        it("cuts a long string and states its full size", function()
            local text = string.rep("word ", 2000)
            local out = preview.build({ note = text })
            test.contains(out.arguments.note, "[cut, 9.8 KB]")
            test.eq(out.arguments.note:sub(1, 10), "word word ")
            test.is_true(encoded_size(out.arguments.note) <= preview.STRING_MAX + 2)
            test.is_true(has(out.cut, "/note"))
        end)

        it("cuts below depth 6 and states the size", function()
            local args = { l2 = { l3 = { l4 = { l5 = { l6 = { l7 = { l8 = "deep" } } } } } } }
            local out = preview.build(args)
            local l6 = out.arguments.l2.l3.l4.l5.l6
            test.eq(type(l6), "table", "depth 6 is kept")
            test.eq(type(l6.l7), "string")
            test.matches(l6.l7, "^%[cut, %d+ B%]$")
            test.is_true(has(out.cut, "/l2/l3/l4/l5/l6/l7"))
        end)

        it("keeps the whole preview within 8 KB and states what it left out", function()
            local args = {}
            for i = 1, 500 do args[("key_%03d"):format(i)] = string.rep("v", 100) end
            local out = preview.build(args)
            test.is_true(encoded_size(out.arguments) <= preview.MAX_BYTES, "size " .. encoded_size(out.arguments))
            test.is_true(encoded_size(out.arguments) > preview.MAX_BYTES - 512, "the budget is used")
            local omitted = out.arguments["\u{2026}"]
            test.matches(omitted, "^%[cut, %d+ more, [%d%.]+ KB%]$")
            test.is_true(has(out.cut, "/\u{2026}"))
            test.eq(out.arguments.key_001, string.rep("v", 100))

            local list = {}
            for i = 1, 5000 do list[i] = i * 1000 end
            local long = preview.build({ ids = list })
            test.is_true(encoded_size(long.arguments) <= preview.MAX_BYTES)
            local ids = long.arguments.ids
            test.matches(ids[#ids], "^%[cut, %d+ more, [%d%.]+ KB%]$")
            test.is_true(has(long.cut, "/ids/" .. (#ids - 1)))

            local wide = {}
            for i = 1, 40 do wide["k" .. i] = { text = string.rep("x", 3000), nested = { string.rep("y", 3000) } } end
            local mixed = preview.build(wide)
            test.is_true(encoded_size(mixed.arguments) <= preview.MAX_BYTES, "size " .. encoded_size(mixed.arguments))
        end)

        it("builds a one-line summary of about 80 characters with a count of the rest", function()
            local out = preview.build({ customer_id = "c_1042", hard = true })
            test.eq(out.summary, "customer_id: \"c_1042\", hard: true")

            local many = {}
            for i = 1, 20 do many[("field_%02d"):format(i)] = "value number " .. i end
            local line = preview.build(many).summary
            local head = line:match("^(.-) %+%d+ more$")
            test.not_nil(head, line)
            test.is_true(#head <= preview.SUMMARY_CHARS, line)
            test.matches(line, "%+%d+ more$")

            local first_long = preview.build({ a = string.rep("z", 300), b = 1 }).summary
            test.matches(first_long, "^a: \"z+\u{2026} %+1 more$")

            test.eq(preview.build({ items = { 1, 2, 3 }, opts = { x = 1 } }).summary, "items: [3 items], opts: {1 keys}")
            test.eq(preview.build({}).summary, "no arguments")
            test.contains(preview.build({ v = "a\u{202E}b" }).summary, "a" .. BS .. "u202eb")
        end)

        it("does not redact any key", function()
            local out = preview.build({ password = "hunter2", api_key = "k" })
            test.eq(out.arguments.password, "hunter2")
            test.eq(out.arguments.api_key, "k")
        end)
    end)
end

return test.run_cases(define_tests)
