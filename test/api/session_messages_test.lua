local test = require("test")
local api = require("session_messages")

local function define_tests()
    test.describe("Session messages HTTP contract", function()
        local original = {
            http = api._http,
            security = api._security,
            session_repo = api._session_repo,
            message_repo = api._message_repo,
        }

        test.after_each(function()
            api._http = original.http
            api._security = original.security
            api._session_repo = original.session_repo
            api._message_repo = original.message_repo
        end)

        test.it("returns pending private functions without allowing a cached history response", function()
            local result = { headers = {} }
            local req = {
                query = function(_, key)
                    local values = {
                        session_id = "session-http",
                        limit = "100",
                        cursor = "",
                        direction = "before",
                    }
                    return values[key]
                end,
            }
            local res = {
                set_header = function(_, key, value) result.headers[key] = value end,
                set_content_type = function(_, value) result.content_type = value end,
                set_status = function(_, value) result.status = value end,
                write_json = function(_, value) result.body = value end,
            }

            api._http = {
                request = function() return req end,
                response = function() return res end,
            }
            api._security = {
                actor = function()
                    return { id = function() return "actor-http" end }
                end,
            }
            api._session_repo = {
                get = function(session_id, actor_id)
                    test.eq(session_id, "session-http")
                    test.eq(actor_id, "actor-http")
                    return { user_id = "actor-http" }
                end,
            }
            api._message_repo = {
                list_by_session = function(session_id, limit, cursor, direction)
                    test.eq(session_id, "session-http")
                    test.eq(limit, 100)
                    test.eq(cursor, "")
                    test.eq(direction, "before")
                    return {
                        messages = {
                            {
                                message_id = "function-message",
                                session_id = "session-http",
                                type = "private_function",
                                data = "{}",
                                metadata_json = [[{"call_id":"attention-e2e-confirm-1","status":"pending"}]],
                            },
                        },
                        has_more = false,
                    }
                end,
                list_pending_inputs = function(session_id)
                    test.eq(session_id, "session-http")
                    return {}
                end,
            }

            api.handler()

            test.eq(result.headers["Cache-Control"], "no-store")
            test.eq(result.status, 200)
            test.eq(#result.body.messages, 1)
            test.eq(result.body.messages[1].type, "private_function")
            test.eq(result.body.messages[1].metadata.call_id, "attention-e2e-confirm-1")
            test.eq(result.body.messages[1].metadata.status, "pending")
        end)
        test.it("projects cancelled history as a settled error while preserving the durable outcome", function()
            local durable = { status = "cancelled", result = "Stopped by user", call_id = "call-object" }
            local response
            api._http = {
                request = function() return { query = function(_, key)
                    if key == "session_id" then return "session-http" end
                    return nil
                end } end,
                response = function() return {
                    set_header = function() end, set_content_type = function() end, set_status = function() end,
                    write_json = function(_, value) response = value end,
                } end,
            }
            api._security = { actor = function() return { id = function() return "actor-http" end } end }
            api._session_repo = { get = function() return { user_id = "actor-http" } end }
            api._message_repo = {
                list_by_session = function() return { messages = {
                    { type = "function", metadata = durable },
                    { type = "function", metadata_json = [[{"status":"cancelled","call_id":"call-json"}]] },
                    { type = "function", metadata = { status = "success" } },
                }, has_more = false } end,
                list_pending_inputs = function() return {} end,
            }
            api.handler()
            test.eq(response.messages[1].metadata.status, "error")
            test.eq(response.messages[1].metadata.outcome, "cancelled")
            test.eq(response.messages[1].metadata.result, "Stopped by user")
            test.eq(response.messages[2].metadata.status, "error")
            test.eq(response.messages[2].metadata.outcome, "cancelled")
            test.eq(response.messages[3].metadata.status, "success")
            test.eq(durable.status, "cancelled", "response projection must not rewrite storage metadata")
        end)
    end)
end

return test.run_cases(define_tests)
