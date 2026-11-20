local http = require("http")
local security = require("security")
local session_repo = require("session_repo")
local session_status = require("session_status")
local approval_projection = require("approval_projection")
local time = require("time")

-- Test seams: the HTTP context, the actor and the session store.
local api = {
    _http = http,
    _security = security,
    _session_repo = session_repo,
    _approval_projection = approval_projection,
}

type ListSessionsResponse = {
    success: boolean,
    server_now: string?,
    count: number?,
    sessions: {any}?,
    error: string?,
}

local function handler()
    local res = api._http.response()
    local req = api._http.request()

    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    local actor = api._security.actor()
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

    local total_count, err = api._session_repo.count_by_user(user_id)
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = err
        })
        return
    end

    local sessions, err = api._session_repo.list_by_user(user_id, limit, offset)
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = err
        })
        return
    end

    for i, session in ipairs(sessions) do
        -- A turn the runtime stopped reads as idle (session_status).
        session.status, session.interaction = session_status.effective(session)
        session.current_agent = ""
        session.current_model = ""

        if session.config and type(session.config) == "table" then
            session.current_agent = session.config.agent_id or ""
            session.current_model = session.config.model or ""
        end

        -- The tool approval fields (docs/tool-approval-protocol.md section
        -- 10): tool_approval, and activity as null when nothing waits.
        local _, projection_err = api._approval_projection.apply_rest(session)
        if projection_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({
                success = false,
                error = "Failed to read the sessions"
            })
            return
        end
    end

    res:set_content_type(http.CONTENT.JSON)
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        server_now = time.now():utc():format(time.RFC3339),
        count = total_count,
        sessions = sessions
    })
end

api.handler = handler

return api
