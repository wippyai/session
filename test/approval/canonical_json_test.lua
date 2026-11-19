local test = require("test")
local json = require("json")
local canonical_json = require("canonical_json")
local fingerprint = require("fingerprint")

-- Canonical JSON for digests: array holes, mixed keys and values that are not
-- JSON never encode alike or as a substitute value.

local function enc(value: any): string
    local text, err = canonical_json.encode(value)
    test.is_nil(err, tostring(err))
    return tostring(text)
end

local function refused(value: any, fragment: string)
    local text, err = canonical_json.encode(value)
    test.is_nil(text, "refused: " .. fragment)
    test.contains(tostring(err), fragment)
end

local function nest(levels: integer): any
    local value: any = "leaf"
    for _ = 1, levels - 1 do value = { value } end
    return { value }
end

local function define_tests()
    describe("Tool approval canonical JSON", function()
        it("keeps everything after a null in an array", function()
            local a = enc(json.decode("[1,null,3]"))
            local b = enc(json.decode("[1,null,9]"))
            test.eq(a, "[1,null,3]")
            test.eq(b, "[1,null,9]")
            test.neq(a, b)
            test.eq(enc({ [1] = "a", [3] = "c" }), '["a",null,"c"]')
            test.eq(enc({ x = json.null }), '{"x":null}')
        end)

        it("sorts object keys and writes the same text for any insertion order", function()
            test.eq(enc(json.decode('{"b":{"d":3,"c":2},"a":1}')), '{"a":1,"b":{"c":2,"d":3}}')
            test.eq(enc(json.decode('{"a":1,"b":{"c":2,"d":3}}')), '{"a":1,"b":{"c":2,"d":3}}')
            test.eq(enc({}), "[]")
        end)

        it("refuses mixed and non-JSON keys instead of merging them", function()
            refused({ [2] = "delete", ["2"] = "read" }, "mixes string and integer keys")
            refused({ [1.5] = "x" }, "a table key must be")
            refused({ [0] = "x" }, "a table key must be")
            refused({ [true] = "x" }, "a table key must be")
        end)

        it("refuses values json.encode would turn into null", function()
            refused({ f = function() end }, "function value is not JSON")
            refused({ n = 0 / 0 }, "not finite")
            refused({ n = math.huge }, "not finite")
            refused({ n = -math.huge }, "not finite")
        end)

        it("keeps exact integers and round-trips floats", function()
            test.eq(enc(json.decode('{"a":9007199254740993,"b":-9223372036854775808}')),
                '{"a":9007199254740993,"b":-9223372036854775808}')
            test.eq(enc({ x = 1.5, y = 0.1 }), '{"x":1.5,"y":0.10000000000000001}')
            test.neq(enc({ 9007199254740992 }), enc({ 9007199254740993 }))
        end)

        it("escapes quotes, backslashes and control bytes, and keeps other bytes", function()
            test.eq(enc({ s = 'a"b\\c\n\0' }), '{"s":"a\\"b\\\\c\\u000a\\u0000"}')
            test.eq(enc({ s = "é" }), '{"s":"é"}')
            test.neq(enc({ s = "a\\u0000" }), enc({ s = "a\0" }))
        end)

        it("refuses nesting deeper than 32 levels and very large array indexes", function()
            test.not_nil(canonical_json.encode(nest(32)))
            refused(nest(33), "deeper than 32")
            refused(nest(200), "deeper than 32")
            refused({ [canonical_json.MAX_ARRAY + 1] = 1 }, "array index above")
        end)

        it("makes fingerprint.digest fail instead of hashing a value it can't encode", function()
            local digest, err = fingerprint.digest({ f = function() end })
            test.is_nil(digest)
            test.contains(tostring(err), "not JSON-shaped")
            local a = fingerprint.digest(json.decode("[1,null,3]"))
            local b = fingerprint.digest(json.decode("[1,null,9]"))
            test.neq(a, b)
        end)
    end)
end

return test.run_cases(define_tests)
