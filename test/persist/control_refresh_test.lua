local test = require("test")
local writer = require("writer")
local reader = require("reader")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local control_handlers = require("control_handlers")
local wait_for_boot = require("wait_for_boot")
local security = require("security")
local uuid = require("uuid")

local REFRESH_ERROR = "Session not found during reset"

local function with_failing_refresh(body)
    wait_for_boot.run()
    local context_id, session_id = uuid.v7(), uuid.v7()
    assert(context_repo.create(context_id, "primary", "{}"))
    assert(session_repo.create(session_id, security.actor():id(), context_id, "Control refresh", "test", {},
        { agent_id = "agent:writer", model = "model:default" }))
    local ok, err = pcall(function()
        local state = assert(reader.open(session_id))
        local observed = { refreshes = 0 }
        state.reset = function()
            observed.refreshes = observed.refreshes + 1
            return nil, REFRESH_ERROR
        end
        body(session_id, assert(writer.new(session_id)), state, observed)
    end)
    local session_deleted, session_err = session_repo.delete(session_id)
    local context_deleted, context_err = context_repo.delete(context_id)
    local cleanup_err = (not session_deleted and tostring(session_err)) or (not context_deleted and tostring(context_err)) or nil
    if not ok then error(cleanup_err and tostring(err) .. "; cleanup failed: " .. cleanup_err or err) end
    if cleanup_err then error("Cleanup failed: " .. cleanup_err) end
end

local function define_tests()
    test.describe("Control effect state refresh", function()
        test.it("returns a failed refresh after a durable context write", function()
            with_failing_refresh(function(session_id, persistence, state, observed)
                local result, err = control_handlers.control_context({
                    writer = persistence, reader = state, upstream = { update_session = function() end },
                }, { context_operations = { session = { set = { handoff_note = "Keep the earlier conversation." } } } })
                test.is_nil(result)
                test.contains(tostring(err), REFRESH_ERROR)
                test.eq(observed.refreshes, 1)
                local reopened = assert(reader.open(session_id))
                test.eq(reopened:get_context("handoff_note"), "Keep the earlier conversation.")
            end)
        end)

        test.it("returns a failed refresh after a durable context write command", function()
            with_failing_refresh(function(session_id, persistence, state, observed)
                local result, err = control_handlers.context_write({ writer = persistence, reader = state },
                    { key = "command_note", data = "written" })
                test.is_nil(result)
                test.contains(tostring(err), REFRESH_ERROR)
                test.eq(observed.refreshes, 1)
                test.eq(assert(reader.open(session_id)):get_context("command_note"), "written")
            end)
        end)

        test.it("returns a failed refresh after a durable context delete command", function()
            with_failing_refresh(function(session_id, persistence, state, observed)
                assert(persistence:set_context("command_note", "written"))
                local result, err = control_handlers.context_delete({ writer = persistence, reader = state },
                    { key = "command_note" })
                test.is_nil(result)
                test.contains(tostring(err), REFRESH_ERROR)
                test.eq(observed.refreshes, 1)
                test.is_nil(assert(reader.open(session_id)):get_context("command_note"))
            end)
        end)

        test.it("returns a failed refresh after a durable config write", function()
            with_failing_refresh(function(session_id, persistence, state, observed)
                local result, err = control_handlers.control_config({
                    config = { agent_id = "agent:writer", model = "model:default" },
                    writer = persistence, reader = state,
                    agent_ctx = {
                        set_active_tools = function() return true end,
                        get_current_agent = function() return { id = "agent:writer" } end,
                    },
                    upstream = { update_session = function() end, session_error = function() end },
                }, { config_changes = { tools = { "app:tool" } } })
                test.is_nil(result)
                test.contains(tostring(err), REFRESH_ERROR)
                test.eq(observed.refreshes, 1)
                local reopened = assert(reader.open(session_id))
                test.eq(reopened:state().config.active_tools[1], "app:tool")
            end)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
