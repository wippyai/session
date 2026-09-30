local test = require("test")
local get_session = require("get_session")
local list_sessions = require("list_sessions")

-- get_session.lua and list_sessions.lua report a stored "running" status as
-- "idle" when no session process is registered for it (a crash the
-- plugin's startup reconciliation has not reached yet), so the Host never
-- blocks Send on it: in the interaction model a "failed" session takes no
-- input. The full handlers need a live http.request()/response()
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

        it("reports a stored running status as idle when no process is registered", function()
            get_session._lookup_session = function() return nil end
            test.eq(get_session._reported_status({ status = "running", session_id = "s1" }), "idle")
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

        it("reports the interaction the plugin's recovery will store for a crashed turn", function()
            -- A blocking turn left running by a crash: stored as not sendable.
            local session = { status = "idle", session_id = "s1", config = {},
                meta = { interaction = { can_send = false, revision = 4 } } }
            local interaction: any = get_session._reported_interaction(session, "running")
            test.is_true(interaction.can_send, "a message continues the session")
            test.eq(interaction.revision, 5, "newer than the stored one")
        end)

        it("keeps the stored interaction when the status is reported as stored", function()
            local stored = { can_send = false, revision = 7 }
            local session = { status = "running", session_id = "s1", config = {}, meta = { interaction = stored } }
            test.eq(get_session._reported_interaction(session, "running"), stored)
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

        it("reports a stored running status as idle when no process is registered", function()
            list_sessions._lookup_session = function() return nil end
            test.eq(list_sessions._reported_status({ status = "running", session_id = "s2" }), "idle")
        end)

        it("keeps a stored running status when its process is registered", function()
            list_sessions._lookup_session = function(session_id) return "pid-" .. session_id end
            test.eq(list_sessions._reported_status({ status = "running", session_id = "s2" }), "running")
        end)

        it("leaves every other status alone without even checking the registry", function()
            list_sessions._lookup_session = function() error("must not be called for a non-running status") end
            test.eq(list_sessions._reported_status({ status = "idle", session_id = "s2" }), "idle")
        end)

        it("reports a crashed turn's interaction like get_session", function()
            local session = { status = "idle", session_id = "s2", config = {},
                meta = { interaction = { can_send = false, revision = 2 } } }
            local interaction: any = list_sessions._reported_interaction(session, "running")
            test.is_true(interaction.can_send)
            test.eq(interaction.revision, 3)
        end)
    end)
end

return test.run_cases(define_tests)
