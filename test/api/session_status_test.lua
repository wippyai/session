local test = require("test")
local get_session = require("get_session")
local list_sessions = require("list_sessions")

-- get_session.lua and list_sessions.lua report a stored "running" status as
-- "failed" when no session process is registered for it (a crash the
-- plugin's startup reconciliation has not reached yet), so the Host never
-- blocks Send on it. The full handlers need a live http.request()/response()
-- context a unit test cannot construct, so this covers the pure
-- _reported_status logic directly, with _lookup_session swapped for a fake
-- (the same test-seam convention as state_service._lookup_session).

local function define_tests()
    describe("get_session reported status", function()
        local original = nil

        before_each(function()
            original = get_session._lookup_session
        end)

        after_each(function()
            get_session._lookup_session = original
        end)

        it("reports a stored running status as failed when no process is registered", function()
            get_session._lookup_session = function() return nil end
            test.eq(get_session._reported_status({ status = "running", session_id = "s1" }), "failed")
        end)

        it("keeps a stored running status when its process is registered", function()
            get_session._lookup_session = function(session_id) return "pid-" .. session_id end
            test.eq(get_session._reported_status({ status = "running", session_id = "s1" }), "running")
        end)

        it("leaves every other status alone without even checking the registry", function()
            get_session._lookup_session = function() error("must not be called for a non-running status") end
            test.eq(get_session._reported_status({ status = "idle", session_id = "s1" }), "idle")
            test.eq(get_session._reported_status({ status = "completed", session_id = "s1" }), "completed")
            test.eq(get_session._reported_status({ status = "failed", session_id = "s1" }), "failed")
        end)
    end)

    describe("list_sessions reported status", function()
        local original = nil

        before_each(function()
            original = list_sessions._lookup_session
        end)

        after_each(function()
            list_sessions._lookup_session = original
        end)

        it("reports a stored running status as failed when no process is registered", function()
            list_sessions._lookup_session = function() return nil end
            test.eq(list_sessions._reported_status({ status = "running", session_id = "s2" }), "failed")
        end)

        it("keeps a stored running status when its process is registered", function()
            list_sessions._lookup_session = function(session_id) return "pid-" .. session_id end
            test.eq(list_sessions._reported_status({ status = "running", session_id = "s2" }), "running")
        end)

        it("leaves every other status alone without even checking the registry", function()
            list_sessions._lookup_session = function() error("must not be called for a non-running status") end
            test.eq(list_sessions._reported_status({ status = "idle", session_id = "s2" }), "idle")
        end)
    end)
end

return test.run_cases(define_tests)
