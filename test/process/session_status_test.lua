local test = require("test")
local session_status = require("session_status")

-- A stored "running" status with no registered session process reads as
-- idle, with the interaction the plugin's recovery will store, so clients
-- never block Send on a session that will not resume on its own. get_session,
-- list_sessions, the form state service and the plugin's stale-status scan
-- all read the status through this library.

local function define_tests()
    describe("session status", function()
        local original = nil

        before_each(function()
            original = session_status._lookup
        end)

        after_each(function()
            session_status._lookup = original
        end)

        it("reads a stored running status as idle when no process is registered", function()
            session_status._lookup = function() return nil end
            local session = { status = "running", session_id = "s1", config = {},
                meta = { interaction = { can_send = false, revision = 4 } } }
            test.is_true(session_status.is_stale_running(session))
            local status, interaction: any = session_status.effective(session)
            test.eq(status, "idle")
            test.is_true(interaction.can_send, "a message continues the session")
            test.eq(interaction.revision, 5, "newer than the stored one")
            test.eq(session.status, "running", "the row is left as stored")
        end)

        it("keeps a stored running status and its interaction when the process is registered", function()
            session_status._lookup = function(session_id) return "pid-" .. session_id end
            local stored = { can_send = false, revision = 7 }
            local session = { status = "running", session_id = "s1", config = {}, meta = { interaction = stored } }
            test.is_false(session_status.is_stale_running(session))
            local status, interaction = session_status.effective(session)
            test.eq(status, "running")
            test.eq(interaction, stored)
        end)

        it("leaves every other status alone without checking the registry", function()
            session_status._lookup = function() error("must not be called for a status other than running") end
            for _, stored in ipairs({ "idle", "completed", "failed" }) do
                local status = session_status.effective({ status = stored, session_id = "s1" })
                test.eq(status, stored)
            end
        end)

        it("uses the lookup a caller passes instead of the registry", function()
            session_status._lookup = function() error("the caller's lookup replaces this one") end
            local session = { status = "running", session_id = "s2", config = {} }
            test.eq(session_status.effective(session, function() return "pid" end), "running")
            test.eq(session_status.effective(session, function() return nil end), "idle")
        end)
    end)
end

return test.run_cases(define_tests)
