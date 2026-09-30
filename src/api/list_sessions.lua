local http = require("http")
local security = require("security")
local session_repo = require("session_repo")
local consts = require("consts")
local input_policy = require("input_policy")

local list_sessions = {}

-- Seam for tests.
function list_sessions._lookup_session(session_id: string): any
    return process.registry.lookup(consts.REGISTRY.SESSION .. session_id)
end

-- A stored "running" status with no registered session process is a crash
-- the plugin's startup reconciliation has not reached yet. Report it as
-- failed here so the Host never blocks Send on a session that will not
-- resume on its own; the stored value is untouched, and the plugin's own
-- scan still owns recovery.
local function reported_status(session: any): string
    if session.status == consts.STATUS.RUNNING and not list_sessions._lookup_session(session.session_id) then
        return consts.STATUS.FAILED
    end
    return session.status :: string
end

-- The interaction follows the reported status (see get_session.lua).
local function reported_interaction(session: any, stored_status: any): any
    if session.status ~= stored_status then
        return input_policy.recovery_snapshot(session, session.status)
    end
    return session.meta and session.meta.interaction
end

type ListSessionsResponse = {
    success: boolean,
    count: number?,
    sessions: {any}?,
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

    local user_id = actor:id()

    local limit = tonumber(req:query("limit")) or 20
    local offset = tonumber(req:query("offset")) or 0

    if limit > 100 then
        limit = 100
    elseif limit < 1 then
        limit = 1
    end

    local total_count, err = session_repo.count_by_user(user_id)
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = err
        })
        return
    end

    local sessions, err = session_repo.list_by_user(user_id, limit, offset)
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = err
        })
        return
    end

    for i, session in ipairs(sessions) do
        local stored_status = session.status
        session.status = reported_status(session)
        session.interaction = reported_interaction(session, stored_status)
        session.current_agent = ""
        session.current_model = ""

        if session.config and type(session.config) == "table" then
            session.current_agent = session.config.agent_id or ""
            session.current_model = session.config.model or ""
        end
    end

    res:set_content_type(http.CONTENT.JSON)
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        count = total_count,
        sessions = sessions
    })
end

list_sessions.handler = handler
list_sessions._reported_status = reported_status
list_sessions._reported_interaction = reported_interaction

return list_sessions
