local test = require("test")
local form_checks = require("form_checks")

-- The checks of the raw keys of an agent-authored definition that definition.lua
-- and field_values.lua share: the error list, plain-text values, booleans and
-- the keys a field may carry. A rejection is { path, code, message }.

-- An empty list typed as the checks take it. A bare {} literal is typed as a
-- table with no elements, which the linter then refuses to index.
local function new_errors(): {any}
    return {}
end

local function define_tests()
    describe("form_checks.add_error", function()
        it("appends a rejection with its path, code and message", function()
            local errors = new_errors()
            form_checks.add_error(errors, "fields[0].label", "required", "A value is required.")
            test.eq(#errors, 1)
            test.eq(errors[1].path, "fields[0].label")
            test.eq(errors[1].code, "required")
            test.eq(errors[1].message, "A value is required.")
        end)
    end)

    describe("form_checks.check_text", function()
        local function check(value: any, opts: any?): (any, boolean, {any})
            local errors = new_errors()
            local options = { required = false, max = 5 }
            for key, item in pairs(opts or {}) do options[key] = item end
            local kept, ok = form_checks.check_text(errors, "title", value, options)
            return kept, ok, errors
        end

        it("keeps a valid value, and treats an omitted optional value as valid and absent", function()
            local kept, ok, errors = check("abc")
            test.eq(kept, "abc")
            test.is_true(ok)
            test.eq(#errors, 0)
            local absent, absent_ok = check(nil)
            test.is_nil(absent)
            test.is_true(absent_ok)
            local empty, empty_ok = check("")
            test.is_nil(empty, "an empty optional value is dropped")
            test.is_true(empty_ok)
        end)

        it("refuses an omitted required value, a value of the wrong type and invalid UTF-8", function()
            local _, ok, errors = check(nil, { required = true })
            test.is_false(ok)
            test.eq(errors[1].code, "required")
            test.eq(errors[1].path, "title")
            local _, _, typed = check(5)
            test.eq(typed[1].code, "invalid_type")
            local _, _, bad = check("a\255")
            test.eq(bad[1].code, "invalid_text")
        end)

        it("refuses a required value that shows nothing, with zero-width characters counted as nothing", function()
            local _, _, spaces = check("   ", { required = true })
            test.eq(spaces[1].code, "blank")
            local _, _, zero_width = check("\226\128\139", { required = true })
            test.eq(zero_width[1].code, "blank")
            local kept = check("   ", { required = false })
            test.eq(kept, "   ", "an optional value is not tested for blank")
        end)

        it("refuses control characters only when strict, and allows tabs and line breaks when multiline", function()
            local _, _, loose = check("a\1")
            test.eq(#loose, 0, "a stored definition is read without the control character rule")
            local _, _, strict = check("a\1", { strict = true })
            test.eq(strict[1].code, "control_characters")
            test.eq(strict[1].message, "Must not contain control characters or line breaks.")
            local _, _, line = check("a\nb", { strict = true })
            test.eq(line[1].code, "control_characters")
            local _, ok_multiline = check("a\nb", { strict = true, multiline = true })
            test.is_true(ok_multiline)
            local _, _, multiline = check("a\1", { strict = true, multiline = true })
            test.eq(multiline[1].message, "Must not contain control characters other than tabs and line breaks.")
        end)

        it("refuses a value over the limit, counted in characters", function()
            local _, _, over = check("abcdef")
            test.eq(over[1].code, "too_long")
            test.eq(over[1].message, "Must be at most 5 characters.")
            local kept, ok = check("\195\169\195\169\195\169\195\169\195\169")
            test.is_true(ok)
            test.not_nil(kept)
        end)
    end)

    describe("form_checks.check_boolean", function()
        it("reads an omitted flag as false, keeps a boolean and refuses anything else", function()
            local errors = new_errors()
            test.is_false(form_checks.check_boolean(errors, "required", nil))
            test.is_true(form_checks.check_boolean(errors, "required", true))
            test.is_false(form_checks.check_boolean(errors, "required", false))
            test.eq(#errors, 0)
            test.is_false(form_checks.check_boolean(errors, "fields[0].multiple", "yes"))
            test.eq(#errors, 1)
            test.eq(errors[1].code, "invalid_type")
            test.eq(errors[1].path, "fields[0].multiple")
            test.eq(errors[1].message, "Must be true or false.")
        end)
    end)

    describe("form_checks.check_unknown_keys", function()
        it("names each unknown key in sorted order, under the path of the object", function()
            local errors = new_errors()
            form_checks.check_unknown_keys(errors, "fields[1]", { id = 1, zeta = 2, alpha = 3, type = 4 },
                { id = true, type = true })
            test.eq(#errors, 2)
            test.eq(errors[1].path, "fields[1].alpha")
            test.eq(errors[2].path, "fields[1].zeta")
            test.eq(errors[1].code, "unknown_key")
            test.eq(errors[1].message, "Unknown key \"alpha\".")
        end)

        it("names a key of the root object by itself", function()
            local errors = new_errors()
            form_checks.check_unknown_keys(errors, "", { title = 1, extra = 2 }, { title = true })
            test.eq(#errors, 1)
            test.eq(errors[1].path, "extra")
        end)

        it("reports nothing when every key is allowed", function()
            local errors = new_errors()
            form_checks.check_unknown_keys(errors, "", { title = 1 }, { title = true, fields = true })
            test.eq(#errors, 0)
        end)
    end)
end

return test.run_cases(define_tests)
