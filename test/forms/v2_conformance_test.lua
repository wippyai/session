local test = require("test")
local json = require("json")
local fs = require("fs")
local definition = require("definition")

-- Runs test/forms/fixtures/v2_conformance.json through the definition
-- normalizer and the answer validator. The same file is the contract the
-- form component's client-side checks are tested against, so a rule changes
-- in one place and both sides follow.
--
-- A case is an object:
--   name          unique title of the case
--   field         one field as an agent would write it (id "f" and label
--                 "Question" are added when missing), or
--   fields        several fields (ids f0, f1, ... and the label are added when
--                 missing)
--   value         the answer for the first field; absent or null = no answer
--   value_concat  instead of value: a list of strings and { repeat, times }
--                 objects joined into one string (long values)
--   expect        one of
--       { ok = v }                the answer is accepted and stored as v
--       { same = true }           accepted and stored exactly as sent
--       { unanswered = true }     accepted, nothing stored for the field
--       { error = code }          the answer is refused with this code
--       { definition_ok = true }  the definition is accepted
--       { definition_error = code, path = "fields[0].key" }
--                                 the definition is refused (path optional)
--       { normalized = { ... } }  the definition is accepted and the first
--                                 field, normalized, has these values (the
--                                 client receives definitions in this form,
--                                 so its answer checks start from them)

local FIXTURE = "/v2_conformance.json"

local function load_cases(): any
    local volume, volume_err = fs.get("app.forms:fixtures")
    if not volume then error("fixture volume: " .. tostring(volume_err)) end
    local raw, read_err = volume:readfile(FIXTURE)
    if not raw then error("fixture file: " .. tostring(read_err)) end
    local cases, decode_err = json.decode(raw)
    if type(cases) ~= "table" then error("fixture JSON: " .. tostring(decode_err)) end
    return cases
end

local function expand(case: any): any
    if case.value_concat == nil then return case.value end
    local parts = {}
    for _, part in ipairs(case.value_concat) do
        if type(part) == "string" then
            table.insert(parts, part)
        else
            table.insert(parts, string.rep(part["repeat"], part.times))
        end
    end
    return table.concat(parts)
end

local function build_fields(case: any): {any}
    local source = case.fields or { case.field }
    local fields = {}
    for index, raw in ipairs(source) do
        local field = {}
        for key, value in pairs(raw) do field[key] = value end
        field.id = field.id or (case.fields and ("f" .. (index - 1)) or "f")
        field.label = field.label or "Question"
        table.insert(fields, field)
    end
    return fields
end

local function normalize(case: any): (any, any)
    return definition.normalize({ title = "Title", fields = build_fields(case) })
end

local function has_error(errors: any, code: string, path: string?): boolean
    for _, item in ipairs(errors or {}) do
        if item.code == code and (path == nil or item.path == path) then return true end
    end
    return false
end

-- A whole number is stored as an integer, whatever spelling it arrived in.
local function check_number_type(result: any)
    if type(result) == "number" and result == math.floor(result) then
        test.eq(math.type(result), "integer", "a whole number is stored as an integer")
    end
end

local function check_definition(case: any)
    local expect = case.expect
    local def, errors = normalize(case)
    if expect.definition_ok then
        test.is_nil(errors, definition.format_errors(errors))
        test.not_nil(def)
        return
    end
    if expect.definition_error then
        test.is_nil(def, "the definition must be refused")
        test.is_true(has_error(errors, expect.definition_error, expect.path),
            "expected " .. expect.definition_error .. " at " .. tostring(expect.path)
            .. ", got:\n" .. definition.format_errors(errors))
        return
    end
    test.is_nil(errors, definition.format_errors(errors))
    local field = def.fields[1]
    for key, expected in pairs(expect.normalized) do
        test.eq(field[key], expected, "normalized " .. key)
        check_number_type(field[key])
    end
end

local function check_answer(case: any)
    local expect = case.expect
    local def, errors = normalize(case)
    test.is_nil(errors, definition.format_errors(errors))
    local value = expand(case)
    local answers = {}
    if value ~= nil then answers.f = value end
    local normalized, field_errors, form_errors = definition.validate_answers(def, answers)
    test.is_nil(form_errors)
    if expect.error then
        test.is_nil(normalized, "the answer must be refused")
        test.not_nil(field_errors, "expected " .. expect.error)
        test.eq(field_errors.f[1].code, expect.error)
        return
    end
    test.is_nil(field_errors, "unexpected " .. tostring(field_errors and field_errors.f and field_errors.f[1].code))
    test.not_nil(normalized)
    if expect.unanswered then
        test.is_nil(normalized.f, "nothing is stored for an unanswered field")
        return
    end
    local expected = expect.same and value or expect.ok
    test.eq(normalized.f, expected)
    check_number_type(normalized.f)
end

local function define_tests()
    describe("V2 conformance fixture", function()
        local cases = load_cases()

        it("holds a case for every rule, each with a unique name", function()
            test.gt(#cases, 400)
            local seen = {}
            for _, case in ipairs(cases) do
                test.is_nil(seen[case.name], "duplicate case name: " .. case.name)
                seen[case.name] = true
            end
        end)

        for _, case in ipairs(cases) do
            it(case.name, function()
                local expect = case.expect
                if expect.definition_ok or expect.definition_error or expect.normalized then
                    check_definition(case)
                else
                    check_answer(case)
                end
            end)
        end
    end)
end

return test.run_cases(define_tests)
