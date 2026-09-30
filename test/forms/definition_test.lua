local test = require("test")
local json = require("json")
local definition = require("definition")
local answer_text = require("answer_text")

local function choice(id, extra)
    local field = { id = id, type = "choice", label = "Question " .. id, options = { "Courier", "Pickup point" } }
    for key, value in pairs(extra or {}) do field[key] = value end
    return field
end

local function form(fields, extra)
    local def = { title = "Delivery preference", fields = fields }
    for key, value in pairs(extra or {}) do def[key] = value end
    return def
end

local function codes(errors)
    local out = {}
    for _, item in ipairs(errors or {}) do out[item.path] = item.code end
    return out
end

local function first_code(raw)
    local _, errors = definition.normalize(raw)
    local item = errors and errors[1]
    return item and item.code, item and item.path
end

local function list_of(count, make)
    local out = {}
    for index = 1, count do table.insert(out, make(index)) end
    return out
end

local function normalized(def)
    local result, errors = definition.normalize(def)
    test.is_nil(errors, definition.format_errors(errors))
    return result
end

local function define_tests()
    describe("definition normalizer", function()
        it("normalizes string options and fills boolean defaults", function()
            local def = normalized(form({ choice("delivery", { required = true }) }))
            local field = def.fields[1]
            test.eq(field.type, "choice")
            test.eq(field.required, true)
            test.eq(field.multiple, false)
            test.eq(field.allow_other, false)
            test.eq(field.options[1].value, "Courier")
            test.eq(field.options[1].label, "Courier")
            test.eq(#field.options, 2)
        end)

        it("rejects control characters in new definitions but allows line breaks in descriptions", function()
            test.eq(first_code(form({ choice("delivery") }, { title = "Deliver\1y" })), "control_characters")
            test.eq(first_code(form({ choice("delivery", { label = "Line\nbreak" }) })), "control_characters")
            test.eq(first_code(form({ choice("delivery", { options = { "Cou\127rier" } }) })), "control_characters")
            local def = normalized(form({ choice("delivery", { description = "First line\n\tSecond line" }) },
                { description = "Intro\nMore" }))
            test.eq(def.fields[1].description, "First line\n\tSecond line")
            test.eq(def.description, "Intro\nMore")
        end)

        it("reads a stored definition without rules added after it was created", function()
            local raw = form({ choice("delivery") }, { title = "Old\1title" })
            test.not_nil(select(2, definition.normalize(raw)), "a new definition is refused")
            local stored, errors = definition.normalize(raw, { stored = true })
            test.is_nil(errors)
            test.eq(stored.title, "Old\1title")
        end)

        it("accepts every limit exactly and refuses one more", function()
            local L = definition.LIMITS
            normalized(form(list_of(L.FIELDS, function(i) return choice("f" .. i) end),
                { title = string.rep("t", L.TITLE), description = string.rep("d", L.DESCRIPTION),
                  submit_label = string.rep("s", L.SUBMIT_LABEL) }))
            normalized(form({ choice("delivery", { label = string.rep("l", L.LABEL),
                options = list_of(L.OPTIONS, function(i) return "o" .. i .. string.rep("x", 10) end) }) }))
            test.eq(first_code(form({ choice("delivery") }, { title = string.rep("t", L.TITLE + 1) })), "too_long")
            test.eq(first_code(form(list_of(L.FIELDS + 1, function(i) return choice("f" .. i) end))), "too_many")
            test.eq(first_code(form({ choice("delivery", { options = list_of(L.OPTIONS + 1,
                function(i) return "o" .. i end) }) })), "too_many")
            test.eq(first_code(form({ choice("delivery", { label = string.rep("l", L.LABEL + 1) }) })), "too_long")
        end)

        it("keeps rich options with a stable value", function()
            local def = normalized(form({ choice("delivery", { options = {
                { value = "courier", label = "Courier", description = "To your address" },
                "Locker",
            } }) }))
            local options = def.fields[1].options
            test.eq(options[1].value, "courier")
            test.eq(options[1].label, "Courier")
            test.eq(options[1].description, "To your address")
            test.eq(options[2].value, "Locker")
        end)

        it("is idempotent on its own output", function()
            local once = normalized(form({ choice("a", { multiple = true, allow_other = true }) },
                { description = "Pick", submit_label = "Send" }))
            local twice = normalized(once)
            -- json.encode key order is not stable, so compare structurally.
            local function same(a, b)
                if type(a) ~= type(b) then return false end
                if type(a) ~= "table" then return a == b end
                for key, value in pairs(a) do
                    if not same(value, b[key]) then return false end
                end
                for key in pairs(b) do
                    if a[key] == nil then return false end
                end
                return true
            end
            test.is_true(same(once, twice))
            test.eq(json.decode(json.encode(twice)).fields[1].options[2].value, "Pickup point")
        end)

        it("enforces the title bounds", function()
            normalized(form({ choice("a") }, { title = string.rep("t", 160) }))
            test.eq(first_code(form({ choice("a") }, { title = string.rep("t", 161) })), "too_long")
            test.eq(first_code(form({ choice("a") }, { title = "   " })), "blank")
            test.eq(first_code({ fields = { choice("a") } }), "required")
        end)

        it("counts characters, not bytes, and rejects invalid UTF-8", function()
            normalized(form({ choice("a") }, { title = string.rep("é", 160) }))
            test.eq(first_code(form({ choice("a") }, { title = string.rep("é", 161) })), "too_long")
            test.eq(first_code(form({ choice("a") }, { title = "bad \255 byte" })), "invalid_text")
        end)

        it("enforces description and submit label bounds", function()
            normalized(form({ choice("a") }, { description = string.rep("d", 1000), submit_label = string.rep("s", 40) }))
            test.eq(first_code(form({ choice("a") }, { description = string.rep("d", 1001) })), "too_long")
            test.eq(first_code(form({ choice("a") }, { submit_label = string.rep("s", 41) })), "too_long")
            test.eq(first_code(form({ choice("a", { description = string.rep("d", 1001) }) })), "too_long")
        end)

        it("keeps an optional one-line answered_message", function()
            test.eq(normalized(form({ choice("a") }, { answered_message = "Answered a question." })).answered_message,
                "Answered a question.")
            test.is_nil(normalized(form({ choice("a") })).answered_message)
            test.is_nil(normalized(form({ choice("a") }, { answered_message = "" })).answered_message)
            normalized(form({ choice("a") }, { answered_message = string.rep("m", 200) }))
            test.eq(first_code(form({ choice("a") }, { answered_message = string.rep("m", 201) })), "too_long")
            test.eq(first_code(form({ choice("a") }, { answered_message = "   " })), "blank")
            test.eq(first_code(form({ choice("a") }, { answered_message = "two\nlines" })), "control_characters")
            test.eq(first_code(form({ choice("a") }, { answered_message = 3 })), "invalid_type")
        end)

        it("enforces the field count", function()
            normalized(form(list_of(20, function(i) return choice("f" .. i) end)))
            local code, path = first_code(form(list_of(21, function(i) return choice("f" .. i) end)))
            test.eq(code, "too_many")
            test.eq(path, "fields")
            test.eq(first_code(form({})), "too_few")
            test.eq(first_code(form("not a list")), "invalid_type")
        end)

        it("enforces the label bounds", function()
            normalized(form({ choice("a", { label = string.rep("l", 240) }) }))
            local code, path = first_code(form({ choice("a", { label = string.rep("l", 241) }) }))
            test.eq(code, "too_long")
            test.eq(path, "fields[0].label")
            test.eq(first_code(form({ choice("a", { label = "" }) })), "blank")
        end)

        it("validates field ids", function()
            normalized(form({ choice("a" .. string.rep("b", 39)) }))
            test.eq(first_code(form({ choice("a" .. string.rep("b", 40)) })), "invalid_id")
            test.eq(first_code(form({ choice("Delivery") })), "invalid_id")
            test.eq(first_code(form({ choice("1st") })), "invalid_id")
            local code, path = first_code(form({ choice("a"), choice("a") }))
            test.eq(code, "duplicate_id")
            test.eq(path, "fields[1].id")
        end)

        it("enforces the option count and distinct values", function()
            normalized(form({ choice("a", { options = list_of(20, function(i) return "o" .. i end) }) }))
            test.eq(first_code(form({ choice("a", { options = list_of(21, function(i) return "o" .. i end) }) })), "too_many")
            test.eq(first_code(form({ choice("a", { options = {} }) })), "too_few")
            local code, path = first_code(form({ choice("a", { options = { "x", { value = "x", label = "Again" } } }) }))
            test.eq(code, "duplicate_option")
            test.eq(path, "fields[0].options[1]")
            test.eq(first_code(form({ choice("a", { options = { { value = "x" } } }) })), "required")
            test.eq(first_code(form({ choice("a", { options = { 5 } }) })), "invalid_type")
        end)

        it("enforces option text and option description bounds", function()
            local L = definition.LIMITS
            normalized(form({ choice("delivery", { options = {
                { value = string.rep("v", L.OPTION_TEXT), label = string.rep("l", L.OPTION_TEXT),
                    description = string.rep("d", L.DESCRIPTION) },
            } }) }))
            local code, path = first_code(form({ choice("delivery", { options = {
                { value = string.rep("v", L.OPTION_TEXT + 1), label = "L" },
            } }) }))
            test.eq(code, "too_long")
            test.eq(path, "fields[0].options[0].value")
            test.eq(first_code(form({ choice("delivery", { options = {
                { value = "v", label = string.rep("l", L.OPTION_TEXT + 1) },
            } }) })), "too_long")
            test.eq(first_code(form({ choice("delivery", { options = {
                { value = "v", label = "L", description = string.rep("d", L.DESCRIPTION + 1) },
            } }) })), "too_long")
            -- A bare string option is both value and label, so it is bound the same way.
            normalized(form({ choice("delivery", { options = { string.rep("o", L.OPTION_TEXT) } }) }))
            test.eq(first_code(form({ choice("delivery", { options = { string.rep("o", L.OPTION_TEXT + 1) } }) })),
                "too_long")
        end)

        it("treats invisible-only text as blank, ASCII or not", function()
            -- U+200B ZERO WIDTH SPACE, U+00A0 NBSP, U+FEFF BOM/ZWNBSP.
            test.eq(first_code(form({ choice("a") }, { title = "\226\128\139\194\160\239\187\191" })), "blank")
            test.eq(first_code(form({ choice("a", { label = "\226\128\139" }) })), "blank")
            -- A real character next to invisible ones is still visible text.
            normalized(form({ choice("a") }, { title = "\226\128\139t\194\160" }))
        end)

        it("rejects C1, bidi override/isolate and line/paragraph separator code points as control characters", function()
            -- U+0085 (C1 NEL), U+202E (RIGHT-TO-LEFT OVERRIDE), U+2066 (LEFT-TO-RIGHT ISOLATE),
            -- U+2028 (LINE SEPARATOR).
            test.eq(first_code(form({ choice("a") }, { title = "a\194\133b" })), "control_characters")
            test.eq(first_code(form({ choice("a") }, { title = "a\226\128\174b" })), "control_characters")
            test.eq(first_code(form({ choice("a") }, { title = "a\226\129\166b" })), "control_characters")
            test.eq(first_code(form({ choice("a") }, { title = "a\226\128\168b" })), "control_characters")
            -- A stored (already-accepted) definition is read without the strict check.
            local stored, errors = definition.normalize(form({ choice("a") }, { title = "a\194\133b" }), { stored = true })
            test.is_nil(errors)
            test.eq(stored.title, "a\194\133b")
        end)

        it("accepts hostile characters in title and label and preserves them exactly", function()
            local hostile = "' onload='x' <img src=x> & \"quoted\""
            local def = normalized(form({ choice("a", { label = hostile }) }, { title = hostile }))
            test.eq(def.title, hostile)
            test.eq(def.fields[1].label, hostile)
        end)

        it("explains the DEFINITION_BYTES measurement in the too_large message", function()
            local fields = list_of(20, function(i)
                return choice("f" .. i, { label = string.rep("l", 240),
                    options = list_of(20, function(j) return string.rep(tostring(j % 10), 200) .. "#" .. j end) })
            end)
            local _, errors = definition.normalize(form(fields))
            test.eq(errors[1].code, "too_large")
            test.contains(errors[1].message, "normalized")
            test.contains(errors[1].message, "{\"value\":..,\"label\":..}")
        end)

        it("accepts a definition of exactly 32 KiB and refuses one byte more", function()
            local L = definition.LIMITS
            -- A coarse-then-fine byte search: full filler fields, then full
            -- filler options within one more field, then that field's own
            -- description (0-1000 characters, and optional, so it is always
            -- a valid field on its own) closes the exact remaining gap. The
            -- description's range is wide enough to always cover the gap a
            -- coarse field (whole fields) and a medium option (one more
            -- option in the last field) leave between them, which can run
            -- to several hundred bytes.
            local FILLER = 60

            local function filler_option(j)
                local text = string.rep("o", FILLER - 2) .. string.format("%02d", j)
                return { value = text, label = text }
            end

            local function filler_field(id)
                return choice("full" .. id, { label = string.rep("l", L.LABEL),
                    options = list_of(L.OPTIONS, filler_option) })
            end

            local function fields_with(full_fields, partial_count, description_len)
                local fields = list_of(full_fields, filler_field)
                local partial = choice("partial", { label = string.rep("l", L.LABEL),
                    options = list_of(partial_count, filler_option) })
                if description_len and description_len > 0 then
                    partial.description = string.rep("d", description_len)
                end
                table.insert(fields, partial)
                return fields
            end

            -- Any rejection (in practice, only too_large, or too_few
            -- options for an empty coarse/medium probe) counts as "over":
            -- this must never assert, only measure.
            local function encoded_len(fields)
                local result, errors = definition.normalize(form(fields))
                if errors then return math.huge end
                return #json.encode(result)
            end

            -- Coarse: grow whole filler fields, measured on their own (a
            -- trailing field with zero options, as fields_with(n, 0, nil)
            -- would build, is itself invalid -- too_few, not too_large --
            -- so every candidate would read as "over" and the search could
            -- never grow past 0). Leave room for at least one more field.
            local full_fields = 0
            while full_fields < L.FIELDS - 1
                and encoded_len(list_of(full_fields + 1, filler_field)) <= L.DEFINITION_BYTES do
                full_fields = full_fields + 1
            end

            -- Medium: within one more field, grow full filler options
            -- (starting at 1, not 0, for the same reason as the coarse
            -- level) while there is room for at least one more to spare.
            -- If the resulting gap still will not fit in one description,
            -- back the coarse count off by one field and redo the medium
            -- search: each step back frees a whole field's worth of room,
            -- so this always terminates.
            local partial_count, at1, at2
            while true do
                partial_count = 1
                while partial_count < L.OPTIONS - 1
                    and encoded_len(fields_with(full_fields, partial_count + 1, nil)) <= L.DEFINITION_BYTES do
                    partial_count = partial_count + 1
                end
                at1 = encoded_len(fields_with(full_fields, partial_count, 1))
                at2 = encoded_len(fields_with(full_fields, partial_count, 2))
                if at1 <= L.DEFINITION_BYTES and at2 - at1 == 1
                    and (L.DEFINITION_BYTES - at1) <= L.DESCRIPTION - 1 then
                    break
                end
                test.is_true(full_fields > 0,
                    "even zero filler fields must leave room for one field's worth of fine-tuning")
                full_fields = full_fields - 1
            end

            local per_char = at2 - at1
            test.eq(per_char, 1, "one more description character should cost exactly one byte")
            local gap = L.DEFINITION_BYTES - at1
            test.is_true(gap >= 0, "the medium level must not already be at or over the limit")
            local description_len = 1 + gap
            test.is_true(description_len >= 1 and description_len <= L.DESCRIPTION,
                "the description must fit the remaining gap")

            local exact = normalized(form(fields_with(full_fields, partial_count, description_len)))
            test.eq(#json.encode(exact), L.DEFINITION_BYTES)

            local code = first_code(form(fields_with(full_fields, partial_count, description_len + 1)))
            test.eq(code, "too_large")
        end)

        it("rejects unknown keys at every level", function()
            local _, errors = definition.normalize(form({ choice("a", { max = 2, options = {
                { value = "x", label = "X", colour = "red" } } }) }, { theme = "dark" }))
            local found = codes(errors)
            test.eq(found["theme"], "unknown_key")
            test.eq(found["fields[0].max"], "unknown_key")
            test.eq(found["fields[0].options[0].colour"], "unknown_key")
        end)

        it("rejects unsupported types and non-boolean flags", function()
            test.eq(first_code(form({ choice("a", { type = "text" }) })), "unsupported_type")
            test.eq(first_code(form({ choice("a", { multiple = "yes" }) })), "invalid_type")
            test.eq(first_code("title"), "invalid_type")
        end)

        it("bounds the serialized definition to 32 KiB", function()
            local fields = list_of(20, function(i)
                return choice("f" .. i, { label = string.rep("l", 240),
                    options = list_of(20, function(j) return string.rep(tostring(j % 10), 200) .. "#" .. j end) })
            end)
            test.eq(first_code(form(fields)), "too_large")
        end)

        it("formats errors as path, code and message", function()
            local _, errors = definition.normalize(form({ choice("a"), choice("a") }))
            test.contains(definition.format_errors(errors), "fields[1].id: duplicate_id:")
        end)
    end)

    describe("answer validation", function()
        local def = normalized(form({
            choice("single", { required = true }),
            choice("other", { allow_other = true }),
            choice("many", { multiple = true, allow_other = true, options = { "a", "b", "c" } }),
            choice("must", { multiple = true, required = true, options = { "a", "b" } }),
        }))

        local function check(answers)
            return definition.validate_answers(def, answers)
        end

        local function field_code(answers, id)
            local _, field_errors = check(answers)
            local list = field_errors and field_errors[id]
            return list and list[1].code
        end

        it("accepts valid answers and canonicalizes the order of selections", function()
            local answers, field_errors, form_errors = check({
                single = "Courier", other = { other = "Drone" }, many = { "c", { other = "x" }, "a" }, must = { "b" },
            })
            test.is_nil(field_errors)
            test.is_nil(form_errors)
            test.eq(answers.single, "Courier")
            test.eq(answers.other.other, "Drone")
            test.eq(answers.many[1], "a")
            test.eq(answers.many[2], "c")
            test.eq(answers.many[3].other, "x")
            test.eq(definition.encode_answers(def, answers),
                '{"single":"Courier","other":{"other":"Drone"},"many":["a","c",{"other":"x"}],"must":["b"]}')
        end)

        it("trims outer whitespace from Other text and counts code points after trimming", function()
            local answers, field_errors = check({ single = "Courier", other = { other = "  Drone \n" }, must = { "a" } })
            test.is_nil(field_errors)
            test.eq(answers.other.other, "Drone")
            test.eq(field_code({ single = "Courier", other = { other = "   " }, must = { "a" } }, "other"), "blank")
            local emoji = string.rep("\240\159\154\154", 2000)
            local _, ok_errors = check({ single = "Courier", other = { other = " " .. emoji .. " " }, must = { "a" } })
            test.is_nil(ok_errors, "2000 emoji are 2000 code points")
            test.eq(field_code({ single = "Courier", other = { other = emoji .. "x" }, must = { "a" } }, "other"),
                "too_long")
        end)

        it("omits an unanswered optional field and an empty optional selection", function()
            local answers = check({ single = "Courier", many = {}, must = { "a" } })
            test.is_nil(answers.other)
            test.is_nil(answers.many)
            test.eq(definition.encode_answers(def, answers), '{"single":"Courier","must":["a"]}')
        end)

        it("requires required fields, including a non-empty required selection", function()
            test.eq(field_code({ must = { "a" } }, "single"), "required")
            test.eq(field_code({ single = "Courier", must = {} }, "must"), "required")
        end)

        it("rejects unknown options, wrong types and misplaced other answers", function()
            test.eq(field_code({ single = "Truck", must = { "a" } }, "single"), "invalid_option")
            test.eq(field_code({ single = 3, must = { "a" } }, "single"), "invalid_type")
            test.eq(field_code({ single = { other = "x" }, must = { "a" } }, "single"), "other_not_allowed")
            test.eq(field_code({ single = "Courier", other = { other = "x", extra = 1 }, must = { "a" } }, "other"), "invalid_type")
            test.eq(field_code({ single = "Courier", many = "a", must = { "a" } }, "many"), "invalid_type")
            test.eq(field_code({ single = "Courier", many = { "a", 1 }, must = { "a" } }, "many"), "invalid_type")
        end)

        it("rejects duplicate selections and a second other answer", function()
            test.eq(field_code({ single = "Courier", many = { "a", "a" }, must = { "a" } }, "many"), "duplicate_selection")
            test.eq(field_code({ single = "Courier", many = { { other = "x" }, { other = "y" } }, must = { "a" } }, "many"),
                "multiple_other")
        end)

        it("bounds other text and requires visible text", function()
            local ok = check({ single = "Courier", other = { other = string.rep("ж", 2000) }, must = { "a" } })
            test.not_nil(ok)
            test.eq(field_code({ single = "Courier", other = { other = string.rep("o", 2001) }, must = { "a" } }, "other"),
                "too_long")
            test.eq(field_code({ single = "Courier", other = { other = "  \n" }, must = { "a" } }, "other"), "blank")
        end)

        it("rejects control characters in Other text but allows tabs and line breaks, like notes", function()
            test.eq(field_code({ single = "Courier", other = { other = "bell\7" }, must = { "a" } }, "other"),
                "invalid_text")
            test.eq(field_code({ single = "Courier", other = { other = "a\194\133b" }, must = { "a" } }, "other"),
                "invalid_text", "C1 control (U+0085)")
            local answers, field_errors = check({ single = "Courier",
                other = { other = "Line one\tand\nline two" }, must = { "a" } })
            test.is_nil(field_errors)
            test.eq(answers.other.other, "Line one\tand\nline two")
        end)

        it("treats invisible-only Other text as blank", function()
            -- U+200B ZERO WIDTH SPACE either side of ordinary whitespace.
            test.eq(field_code({ single = "Courier", other = { other = "  \226\128\139  " }, must = { "a" } },
                "other"), "blank")
        end)

        it("finishes fast on a pathological whitespace run instead of hanging (H3)", function()
            local time = require("time")
            local huge_padded = "x" .. string.rep(" ", 60000) .. "y"
            local huge_blank = string.rep(" ", 60000)

            local start = time.now()
            local other_code = field_code({ single = "Courier", other = { other = huge_padded }, must = { "a" } },
                "other")
            local other_blank_code = field_code({ single = "Courier", other = { other = huge_blank }, must = { "a" } },
                "other")
            local note_code = field_code({ single = { value = "Courier", note = huge_padded }, must = { "a" } },
                "single")
            local note_blank_code = field_code({ single = { value = "Courier", note = huge_blank }, must = { "a" } },
                "single")
            local elapsed = time.now():sub(start)

            test.eq(other_code, "too_long")
            test.eq(other_blank_code, "too_long")
            test.eq(note_code, "too_long")
            test.eq(note_blank_code, "too_long")
            -- The old quadratic trim cost about 2e9 steps on one such value
            -- (H3); a linear trim plus the raw-byte cap finish in well under
            -- a second for all four.
            test.is_true(elapsed:milliseconds() < 2000,
                string.format("expected well under 2000ms, took %.2fms", elapsed:milliseconds()))
        end)

        it("accepts a note on a chosen option, in single and several-answer questions", function()
            local answers, field_errors = check({
                single = { value = "Pickup point", note = "  The one on Harbour Street\nnot the mall  " },
                many = { { other = "x" }, "c", { value = "a", note = "Gift wrap it" } },
                must = { { value = "b", note = "only b" } },
            })
            test.is_nil(field_errors)
            test.eq(answers.single.value, "Pickup point")
            test.eq(answers.single.note, "The one on Harbour Street\nnot the mall")
            test.eq(answers.many[1].value, "a", "definition order kept for noted options")
            test.eq(answers.many[2], "c")
            test.eq(answers.many[3].other, "x", "own answer stays last")
            test.eq(definition.encode_answers(def, answers),
                '{"single":{"value":"Pickup point","note":"The one on Harbour Street\\nnot the mall"},'
                .. '"many":[{"value":"a","note":"Gift wrap it"},"c",{"other":"x"}],"must":[{"value":"b","note":"only b"}]}')
        end)

        it("gives back the plain value for a missing or blank note", function()
            local answers = check({ single = { value = "Courier", note = "  \n " }, many = { { value = "b" } }, must = { "a" } })
            test.eq(answers.single, "Courier")
            test.eq(answers.many[1], "b")
            test.eq(definition.encode_answers(def, answers), '{"single":"Courier","many":["b"],"must":["a"]}')
        end)

        it("bounds notes and rejects bad noted answers", function()
            local long_ok = check({ single = { value = "Courier", note = string.rep("ж", 1000) }, must = { "a" } })
            test.not_nil(long_ok, "1000 code points is the limit")
            test.eq(field_code({ single = { value = "Courier", note = string.rep("o", 1001) }, must = { "a" } }, "single"), "too_long")
            test.eq(field_code({ single = { value = "Courier", note = "bell\7" }, must = { "a" } }, "single"), "invalid_text")
            test.eq(field_code({ single = { value = "Truck", note = "x" }, must = { "a" } }, "single"), "invalid_option")
            test.eq(field_code({ single = { value = "Courier", note = 5 }, must = { "a" } }, "single"), "invalid_type")
            test.eq(field_code({ single = { value = "Courier", note = "x", color = "red" }, must = { "a" } }, "single"), "invalid_type")
            test.eq(field_code({ single = { note = "x" }, must = { "a" } }, "single"), "invalid_type")
            test.eq(field_code({ single = "Courier", many = { "a", { value = "a", note = "again" } }, must = { "a" } }, "many"),
                "duplicate_selection")
        end)

        it("reports only the first violation per field, and unknown keys as form errors", function()
            local answers, field_errors, form_errors = check({ single = "Truck", ghost = "boo" })
            test.is_nil(answers)
            test.eq(#field_errors.single, 1)
            test.eq(field_errors.must[1].code, "required")
            test.eq(form_errors[1].code, "unknown_field")
            test.eq(form_errors[1].field, "ghost")
        end)

        it("rejects answers that are not an object", function()
            local _, _, form_errors = check({ "Courier" })
            test.eq(form_errors[1].code, "invalid_type")
        end)

        it("encodes no answers as an empty object", function()
            local optional = normalized(form({ choice("a") }))
            local answers = definition.validate_answers(optional, {})
            test.eq(definition.encode_answers(optional, answers), "{}")
            -- The returned table itself must also read back as an object
            -- when a caller (e.g. state_service's stored submission.answers)
            -- json.encodes it directly instead of going through
            -- encode_answers: a plain {} is indistinguishable from an empty
            -- array (probe J5) and would otherwise serialize as [].
            test.eq((json.encode(answers)), "{}")
        end)
    end)

    describe("answer text", function()
        local def = normalized(form({
            choice("delivery", { required = true, options = { { value = "courier", label = "Courier" }, "Locker" } }),
            choice("extras", { multiple = true, allow_other = true, options = { "Gift wrap", "Receipt" } }),
            choice("note", {}),
        }))

        -- The record attribute's value, raw and decoded.
        local function tagged_record(text: string): (any, string)
            local value = string.match(text, "\n\n<wippy%-form%-answers record='([^']*)'>\n</wippy%-form%-answers>$")
            test.not_nil(value, "the element ends the message, its record in a single-quoted attribute")
            return json.decode(value), value
        end

        it("builds the sentence and the tagged record from the definition", function()
            local text = answer_text.build({ artifact_id = "form-1", definition = def, late = false,
                answers = { delivery = "courier", extras = { "Receipt", { other = "Call first" } } } })
            test.eq(text, "Answered “Delivery preference”.\n\n<wippy-form-answers record='"
                .. '{"form_id":"form-1","form_version":1,"title":"Delivery preference","late":false,"answers":{'
                .. '"delivery":{"question":"Question delivery","answer":{"value":"courier","label":"Courier"}},'
                .. '"extras":{"question":"Question extras","answer":[{"value":"Receipt","label":"Receipt"},{"other":"Call first"}]},'
                .. '"note":{"question":"Question note","answer":null}}}'
                .. "'>\n</wippy-form-answers>")
        end)

        it("uses the agent's answered_message as the sentence, as plain text", function()
            local asked = normalized(form({ choice("delivery", {}) },
                { answered_message = "Answered **questions** about <b>delivery</b>" }))
            local text = answer_text.build({ artifact_id = "form-1", definition = asked, late = false,
                answers = { delivery = "Delivery A" } })
            test.eq(string.match(text, "^[^\n]*"), "Answered \\*\\*questions\\*\\* about \\<b\\>delivery\\</b\\>")
        end)

        it("keeps the sentence a single plain paragraph even when it starts with block Markdown syntax", function()
            local function sentence_for(answered_message)
                local asked = normalized(form({ choice("delivery", {}) }, { answered_message = answered_message }))
                local text = answer_text.build({ artifact_id = "form-1", definition = asked, late = false,
                    answers = { delivery = "Delivery A" } })
                return string.match(text, "^[^\n]*")
            end

            -- ATX heading, bullet list, plus-list, ordered list, blockquote,
            -- and an indented code block (4+ leading spaces).
            test.eq(sentence_for("# Heading looking text"), "\\# Heading looking text")
            test.eq(sentence_for("- bullet looking text"), "\\- bullet looking text")
            test.eq(sentence_for("+ plus looking text"), "\\+ plus looking text")
            test.eq(sentence_for("1. ordered looking text"), "1\\. ordered looking text")
            test.eq(sentence_for("1) ordered looking text"), "1\\) ordered looking text")
            test.eq(sentence_for(">quoted looking text"), "\\>quoted looking text")
            test.eq(sentence_for("    indented looking text"), " indented looking text")
            -- A thematic break/setext-underline line made only of - or =.
            test.eq(sentence_for("---"), "\\---")
            test.eq(sentence_for("==="), "\\===")
            -- Mid-sentence, none of these need escaping (already covered by
            -- the "uses the agent's answered_message" test for * and <>).
            test.eq(sentence_for("Answered # 1, not a heading"), "Answered # 1, not a heading")
            test.eq(sentence_for("Five - four - three - two - one"), "Five - four - three - two - one")
        end)

        it("gives a record the agent can use without the original form", function()
            local record = json.decode(answer_text.record_json({ artifact_id = "form-1", definition = def, late = true,
                answers = { delivery = { value = "courier", note = "back door" }, extras = { "Gift wrap" } } }))
            test.eq(record.title, "Delivery preference")
            test.is_true(record.late)
            test.eq(record.late_notice, answer_text.LATE_NOTICE)
            test.eq(record.answers.delivery.question, "Question delivery")
            test.eq(record.answers.delivery.answer.value, "courier")
            test.eq(record.answers.delivery.answer.label, "Courier")
            test.eq(record.answers.delivery.answer.note, "back door")
            test.eq(record.answers.extras.answer[1].label, "Gift wrap")
            test.is_nil(record.answers.note.answer)

            local questions = json.decode(answer_text.questions_json(def))
            test.eq(questions.delivery.options[1].value, "courier")
            test.eq(questions.delivery.options[1].label, "Courier")
            test.is_true(questions.delivery.required)
            test.is_true(questions.extras.multiple)
            test.is_true(questions.extras.allow_other)
        end)

        it("marks a late answer in the record and keeps the sentence", function()
            local text = answer_text.build({ artifact_id = "form-1", definition = def, late = true,
                answers = { delivery = "Locker" } })
            test.eq(string.match(text, "^[^\n]*"), "Answered “Delivery preference”.")
            local record = tagged_record(text)
            test.is_true(record.late)
            test.contains(record.late_notice, "ask for fresh confirmation before acting")
        end)

        it("keeps user text from ending the attribute, closing the tag or adding markup", function()
            local hostile = "' onload='x' </wippy-form-answers><img src=x onerror=alert(1)> &amp; ```\n\n# heading"
            local noted = { delivery = { value = "courier", note = hostile }, extras = { { other = hostile } } }
            local text = answer_text.build({ artifact_id = "form-1", definition = def, late = false, answers = noted })
            local _, closings = string.gsub(text, "</wippy%-form%-answers>", "")
            test.eq(closings, 1, "only the real closing tag")
            local _, line_breaks = string.gsub(text, "\n", "")
            test.eq(line_breaks, 3, "the blank line after the sentence and the break before the closing tag")
            local record, value = tagged_record(text)
            test.is_nil(string.find(value, "['<>&]"), "no raw ', <, > or & inside the attribute value")
            test.eq(record.answers.delivery.answer.note, hostile)
            test.eq(record.answers.extras.answer[1].other, hostile)
        end)

        it("carries hostile title and label characters through the record intact", function()
            local hostile = "' onload='x' <script>&\"quote\""
            local hostile_def = normalized(form({ choice("a", { label = hostile }) }, { title = hostile }))
            local text = answer_text.build({ artifact_id = "form-1", definition = hostile_def, late = false,
                answers = { a = "Courier" } })
            local record, value = tagged_record(text)
            test.is_nil(string.find(value, "['<>&]"), "no raw ', <, > or & inside the attribute value")
            test.eq(record.title, hostile)
            test.eq(record.answers.a.question, hostile)
        end)
    end)
end

return test.run_cases(define_tests)
