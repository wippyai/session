local test = require("test")
local rename = require("rename_session")
local delete = require("delete_session")

local function response(result)
    return {
        set_content_type = function() end,
        set_status = function(_, status) result.status = status end,
        write_json = function(_, body) result.body = body end,
    }
end

local function define_tests()
    describe("external session mutations", function()
        local original = {
            rename_http = rename._http,
            rename_security = rename._security,
            rename_writer = rename._session_writer,
            rename_upstream = rename._upstream,
            delete_http = delete._http,
            delete_security = delete._security,
            delete_repo = delete._session_repo,
            delete_upstream = delete._upstream,
        }

        after_each(function()
            rename._http = original.rename_http
            rename._security = original.rename_security
            rename._session_writer = original.rename_writer
            rename._upstream = original.rename_upstream
            delete._http = original.delete_http
            delete._security = original.delete_security
            delete._session_repo = original.delete_repo
            delete._upstream = original.delete_upstream
        end)

        it("publishes a rename only after the title persists", function()
            local result = { persisted = false }
            rename._http = {
                STATUS = { OK = 200, BAD_REQUEST = 400, UNAUTHORIZED = 401, INTERNAL_ERROR = 500 },
                CONTENT = { JSON = "application/json" },
                response = function() return response(result) end,
                request = function()
                    return { body_json = function() return { session_id = "session-1", title = "Renamed" } end }
                end,
            }
            rename._security = { actor = function() return { id = function() return "actor-1" end } end }
            rename._session_writer = {
                new = function() return {
                    update_title = function(_, title)
                        test.eq(title, "Renamed")
                        result.persisted = true
                        return true
                    end,
                } end,
            }
            rename._upstream = {
                notify_external = function(session_id, changes)
                    test.is_true(result.persisted)
                    result.event = { session_id = session_id, changes = changes }
                    return true
                end,
            }

            rename.handler()

            test.eq(result.status, 200)
            test.eq(result.event.session_id, "session-1")
            test.eq(result.event.changes.title, "Renamed")
        end)

        it("publishes a deletion only after the session persists as deleted", function()
            local result = { persisted = false }
            delete._http = {
                STATUS = { OK = 200, BAD_REQUEST = 400, UNAUTHORIZED = 401, FORBIDDEN = 403, NOT_FOUND = 404, INTERNAL_ERROR = 500 },
                CONTENT = { JSON = "application/json" },
                response = function() return response(result) end,
                request = function() return { query = function() return "session-1" end } end,
            }
            delete._security = { actor = function() return { id = function() return "actor-1" end } end }
            delete._session_repo = {
                get = function() return { user_id = "actor-1" } end,
                delete = function()
                    result.persisted = true
                    return { deleted = true }
                end,
            }
            delete._upstream = {
                notify_external = function(session_id, changes)
                    test.is_true(result.persisted)
                    result.event = { session_id = session_id, changes = changes }
                    return true
                end,
            }

            delete.handler()

            test.eq(result.status, 200)
            test.eq(result.event.session_id, "session-1")
            test.is_true(result.event.changes.deleted)
        end)
    end)
end

return test.run_cases(define_tests)
