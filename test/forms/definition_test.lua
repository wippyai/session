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
        end)
    end)

    describe("answer text", function()
        local def = normalized(form({
            choice("delivery", { required = true, options = { { value = "courier", label = "Courier" }, "Locker" } }),
            choice("extras", { multiple = true, allow_other = true, options = { "Gift wrap", "Receipt" } }),
            choice("note", {}),
        }))

        it("builds the summary and the exact answers from the definition", function()
            local text = answer_text.build({ artifact_id = "form-1", definition = def, late = false,
                answers = { delivery = "courier", extras = { "Receipt", { other = "Call first" } } } })
            test.eq(string.sub(text, 1, 49), 'Answers to form "Delivery preference" (form_id: f')
            test.contains(text, "- Question delivery: Courier\n")
            test.contains(text, "- Question extras: Receipt, Other: Call first\n")
            test.contains(text, "- Question note: (no answer)\n")
            test.contains(text, "Exact answers:\n```json\n"
                .. '{"form_id":"form-1","form_version":1,"answers":{"delivery":"courier","extras":["Receipt",{"other":"Call first"}]}}'
                .. "\n```")
            test.is_false(string.find(text, "Late answer", 1, true) ~= nil)
        end)

        it("labels a late answer and asks for fresh confirmation", function()
            local text = answer_text.build({ artifact_id = "form-1", definition = def, late = true,
                answers = { delivery = "Locker" } })
            test.eq(string.sub(text, 1, 26), 'Late answer to form "Deliv')
            test.contains(text, answer_text.LATE_NOTICE)
            test.contains(text, "ask for fresh confirmation before acting")
        end)

        it("lengthens the fence past backticks in values and folds line breaks", function()
            local text = answer_text.build({ artifact_id = "form-1", definition = def, late = false,
                answers = { delivery = "courier", extras = { { other = "````\n# heading" } } } })
            test.contains(text, "\n`````json\n")
            test.contains(text, "- Question extras: Other: ```` # heading\n")
            test.eq(answer_text.fence_for("no ticks"), "```")
            test.eq(answer_text.fence_for("a ``` b"), "````")
        end)
    end)
end

return test.run_cases(define_tests)
