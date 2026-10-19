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
        local original_repo = upstream._session_repo
        after_each(function() upstream._session_repo = original_repo end)

        it("settles delayed updates as deleted and keeps private row fields out of events", function()
            local sender, events = fixture()
            upstream._session_repo = { get = function()
                return { title = "latest", meta = { secret = "private" }, config = { model = "private" } }
            end }
            test.is_true(sender:refresh_external({ title = "old", meta = {}, config = {} }))
            test.eq(events[1].data.title, "latest")
            test.is_nil(events[1].data.meta)
            test.is_nil(events[1].data.config)
            upstream._session_repo = { get = function() return nil, "Session not found" end }
            test.is_true(sender:refresh_external({ title = "old" }))
            test.is_true(events[2].data.deleted)
        end)

        it("does not publish stale values when reloading the row fails", function()
            local sender, events = fixture()
            upstream._session_repo = { get = function() return nil, "database unavailable" end }
            local ok, err = sender:refresh_external({ title = "old" })
            test.is_nil(ok)
            test.eq(err, "database unavailable")
            test.eq(#events, 0)
        end)

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

        it("notifies a mounted session after an external mutation", function()
            local sent = {} :: {any}
            mock("process.registry", {
                lookup = function(name)
                    test.eq(name, "session.s1")
                    return "mounted-session"
                end,
            })
            mock("process.send", function(pid, topic, payload)
                sent[#sent + 1] = { pid = pid, topic = topic, payload = payload }
                return true
            end)

            local published, publish_err = upstream.notify_external("s1", { title = "Renamed" })

            restore_mock("process.send")
            restore_mock("process.registry")
            test.is_true(published)
            test.is_nil(publish_err)
            test.eq(#sent, 1)
            test.eq(sent[1].pid, "mounted-session")
            test.eq(sent[1].topic, "session.updated")
            test.eq(sent[1].payload.title, "Renamed")
        end)

        it("does not publish an external mutation when the session is not mounted", function()
            local sends = 0
            mock("process.registry", { lookup = function() return nil end })
            mock("process.send", function() sends = sends + 1; return true end)

            local published, publish_err = upstream.notify_external("s1", { deleted = true })

            restore_mock("process.send")
            restore_mock("process.registry")
            test.is_true(published)
            test.is_nil(publish_err)
            test.eq(sends, 0)
        end)

        it("returns a registry lookup error without sending an external mutation", function()
            local sends = 0
            mock("process.registry", { lookup = function() return nil, "lookup failed" end })
            mock("process.send", function() sends = sends + 1; return true end)

            local published, publish_err = upstream.notify_external("s1", { deleted = true })

            restore_mock("process.send")
            restore_mock("process.registry")
            test.is_nil(published)
            test.eq(publish_err, "lookup failed")
            test.eq(sends, 0)
        end)
    end)
end

return test.run_cases(define_tests)
