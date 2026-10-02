local test = require("test")
local upstream = require("upstream")

local function fixture(): (any, any)
    local events: any = {}
    local sender = upstream.new("s1", nil, nil)
    sender._send_message = function(_, topic, data)
        events[#events + 1] = { topic = topic, data = data }
        return true
    end
    return sender, events
end

local function define_tests()
    describe("existing session response protocol", function()
        it("confirms a persisted message through one correlated receipt", function()
            local sender, events = fixture()
            sender:message_received("m1", "server text", { "file1" }, { state = "pending" }, "r1")
            test.eq(#events, 1)
            test.eq(events[1].topic, "session:s1:message:m1")
            test.eq(events[1].data.type, "received")
            test.eq(events[1].data.request_id, "r1")
            test.eq(events[1].data.message_id, "m1")
            test.eq(events[1].data.text, "server text")
            test.eq(events[1].data.file_uuids[1], "file1")
            test.eq(events[1].data.input.state, "pending")
        end)

        it("preserves legacy receipts without a request ID", function()
            local sender, events = fixture()
            sender:message_received("m1", "hello")
            test.eq(events[1].data.type, "received")
            test.is_nil(events[1].data.request_id)
            test.is_nil(events[1].data.input)
        end)

        it("correlates command errors on the existing session topic", function()
            local sender, events = fixture()
            sender:command_error("r2", "STORAGE_ERROR", "write failed")
            test.eq(events[1].topic, "session:s1")
            test.eq(events[1].data.type, "error")
            test.eq(events[1].data.request_id, "r2")
            test.eq(events[1].data.code, "STORAGE_ERROR")
        end)

        it("confirms a command through a typed command response", function()
            local sender, events = fixture()
            sender:command_success("r3", { staged = true })
            test.eq(events[1].topic, "session:s1")
            test.eq(events[1].data.type, "command_response")
            test.eq(events[1].data.request_id, "r3")
            test.eq(events[1].data.success, true)
            test.eq(events[1].data.staged, true)
        end)

        it("uses session updates for artifact command confirmation", function()
            local sender, events = fixture()
            sender:update_session({ request_id = "artifact-request" })
            test.eq(events[1].topic, "session:s1")
            test.eq(events[1].data.type, "update")
            test.eq(events[1].data.request_id, "artifact-request")
            test.eq(events[1].data.session_id, "s1")
        end)
    end)
end

return test.run_cases(define_tests)
