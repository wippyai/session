local http = require("http")
local security = require("security")
local session_repo = require("session_repo")
local message_repo = require("message_repo")
local session_status = require("session_status")
local approval_projection = require("approval_projection")
local approval_repo = require("approval_repo")
local details_projection = require("details_projection")

-- Test seams: the HTTP context and the actor.
local api = {
    _http = http,
    _security = security,
    _approval_projection = approval_projection,
}

type GetSessionResponse = {
    success: boolean,
    server_now: string?,
    session: any?,
    latest_message: any?,
    message_count: number?,
    error: string?,
}

local function handler()
    local res = api._http.response()
    local req = api._http.request()

    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    res:set_header("Cache-Control", "no-store")

    local actor = api._security.actor()
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

    local latest_message, message_count, history_err = details_projection.history_summary(message_repo, session_id, session.config)
    if history_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "Failed to read the session" })
        return
    end
    details_projection.session(session)

    -- A turn the runtime stopped reads as idle (session_status).
    session.status, session.interaction = session_status.effective(session)
    session.current_agent = ""
    session.current_model = ""

    if session.config and type(session.config) == "table" then
        session.current_agent = session.config.agent_id or ""
        session.current_model = session.config.model or ""
    end

    -- The tool approval fields (docs/tool-approval-protocol.md section 10):
    -- tool_approval, and activity as null when nothing waits.
    local _, projection_err = api._approval_projection.apply_rest(session)
    if projection_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = "Failed to read the session"
        })
        return
    end

    local response = {
        success = true,
        details_revision = session.details_revision,
        server_now = approval_repo.now(),
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

api.handler = handler

return api
