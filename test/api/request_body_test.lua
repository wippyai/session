local test = require("test")
local request_body = require("request_body")

-- The Content-Type gate and the capped body read the form state POST
-- endpoint runs before the form service sees a body.

-- A minimal fake of the stream object req:stream() returns: `chunks` is fed
-- out one at a time by :read(), then nil (EOF). read_calls counts calls so
-- a test can prove the reader stops instead of draining an endless stream.
local function fake_stream(chunks: {string})
    local index = 0
    local closed = false
    local read_calls = 0
    return {
        read = function(_, _size)
            read_calls = read_calls + 1
            index = index + 1
            if index > #chunks then return nil, nil end
            return chunks[index], nil
        end,
        close = function() closed = true end,
        was_closed = function() return closed end,
        read_count = function() return read_calls end,
    }
end

local function define_tests()
    describe("is_json_content_type", function()
        it("accepts application/json with or without a charset parameter", function()
            test.is_true(request_body.is_json_content_type("application/json"))
            test.is_true(request_body.is_json_content_type("application/json; charset=utf-8"))
            test.is_true(request_body.is_json_content_type("application/json;charset=utf-8"))
            test.is_true(request_body.is_json_content_type("  application/json  "))
            test.is_true(request_body.is_json_content_type("APPLICATION/JSON"))
        end)

        it("refuses everything else, including no header at all", function()
            test.is_false(request_body.is_json_content_type(nil))
            test.is_false(request_body.is_json_content_type(""))
            test.is_false(request_body.is_json_content_type("text/plain"))
            test.is_false(request_body.is_json_content_type("application/json-patch+json"))
            test.is_false(request_body.is_json_content_type("multipart/form-data; boundary=x"))
        end)
    end)

    describe("read_capped_stream", function()
        it("concatenates chunks up to the limit and closes the stream", function()
            local stream = fake_stream({ "abc", "def", "gh" })
            local body, err = request_body.read_capped_stream(stream, 100)
            test.is_nil(err)
            test.eq(body, "abcdefgh")
            test.is_true(stream.was_closed())
        end)

        it("reports too_large and stops reading once the total exceeds the limit", function()
            -- An endless stream: read() never returns nil on its own. If the
            -- reader did not stop at the cap, this test would hang.
            local read_calls = 0
            local stream = {
                read = function() read_calls = read_calls + 1 return string.rep("x", 1000), nil end,
                close = function() end,
            }
            local body, err = request_body.read_capped_stream(stream, 2500)
            test.is_nil(body)
            test.eq(err, "too_large")
            -- 3 chunks of 1000 bytes exceed the 2500 cap; a 4th would not
            -- be read if the reader stops as soon as the cap is crossed.
            test.is_true(read_calls <= 3, string.format("expected at most 3 reads, got %d", read_calls))
        end)

        it("propagates a read error instead of returning a partial body", function()
            local stream = {
                read = function() return nil, "boom" end,
                close = function() end,
            }
            local body, err = request_body.read_capped_stream(stream, 100)
            test.is_nil(body)
            test.eq(err, "boom")
        end)

        it("accepts an exactly-at-limit body and rejects one byte more", function()
            local at_limit = fake_stream({ string.rep("x", 10) })
            local body, err = request_body.read_capped_stream(at_limit, 10)
            test.is_nil(err)
            test.eq(#body, 10)

            local over_limit = fake_stream({ string.rep("x", 11) })
            local over_body, over_err = request_body.read_capped_stream(over_limit, 10)
            test.is_nil(over_body)
            test.eq(over_err, "too_large")
        end)
    end)
end

return test.run_cases(define_tests)
