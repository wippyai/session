local http = require("http")
local security = require("security")
local session_repo = require("session_repo")
local message_repo = require("message_repo")
local consts = require("consts")
local input_policy = require("input_policy")

local get_session = {}

-- Seam for tests.
function get_session._lookup_session(session_id: string): any
    return process.registry.lookup(consts.REGISTRY.SESSION .. session_id)
end

-- A stored "running" status with no registered session process is a crash
-- the plugin's startup reconciliation has not reached yet. Report it as
-- failed here so the Host never blocks Send on a session that will not
-- resume on its own; the stored value is untouched, and the plugin's own
-- scan still owns recovery.
local function reported_status(session: any): string
    if session.status == consts.STATUS.RUNNING and not get_session._lookup_session(session.session_id) then
        return consts.STATUS.FAILED
    end
    return session.status :: string
end

-- The interaction follows the reported status. When a crashed turn is
-- reported as failed, it reads the way the plugin's recovery will store it
-- (input_policy.recovery_snapshot), so status and interaction never disagree.
local function reported_interaction(session: any, stored_status: any): any
    if session.status ~= stored_status then
        return input_policy.recovery_snapshot(session, session.status)
    end
    return session.meta and session.meta.interaction
end

type GetSessionResponse = {
    success: boolean,
    session: any?,
    latest_message: any?,
    message_count: number?,
    error: string?,
}

local function handler()
    local res = http.response()
    local req = http.request()

    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({
            success = false,
            error = "Authentication required"
        })
        return
    end

    local session_id = req:query("session_id")
    if not session_id or session_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Session ID is required"
        })
        return
    end

    local user_id = actor:id()

    local session, err = session_repo.get(session_id, user_id)
    if err then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({
            success = false,
            error = err
        })
        return
    end

    if session.user_id ~= user_id then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({
            success = false,
            error = "Access denied"
        })
        return
    end

    local latest_message, _ = message_repo.get_latest(session_id)
    local message_count, _ = message_repo.count_by_session(session_id)

    local stored_status = session.status
    session.status = reported_status(session)
    session.interaction = reported_interaction(session, stored_status)
    session.current_agent = ""
    session.current_model = ""

    if session.config and type(session.config) == "table" then
        session.current_agent = session.config.agent_id or ""
        session.current_model = session.config.model or ""
    end

    local response = {
        success = true,
        session = session
    }

    if latest_message then
        response.latest_message = latest_message
    end

    if message_count then
        response.message_count = message_count
    end

    res:set_content_type(http.CONTENT.JSON)
    res:set_status(http.STATUS.OK)
    res:write_json(response)
end

get_session.handler = handler
get_session._reported_status = reported_status
get_session._reported_interaction = reported_interaction

return get_session
