local api = {
    _http = require("http"),
    _security = require("security"),
    _session_repo = require("session_repo"),
    _upstream = require("upstream"),
}

type DeleteSessionResponse = {
    success: boolean,
    message: string?,
    session_id: string?,
    error: string?,
}

local function handler()
    local res = api._http.response()
    local req = api._http.request()

    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    -- Security check - ensure user is authenticated
    local actor = api._security.actor()
    if not actor then
        res:set_status(api._http.STATUS.UNAUTHORIZED)
        res:write_json({
            success = false,
            error = "Authentication required"
        })
        return
    end

    -- Get user ID from the authenticated actor
    local user_id = actor:id()

    -- Get session ID from query parameter
    local session_id = req:query("session_id")
    if not session_id or session_id == "" then
        res:set_status(api._http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "session_id parameter is required"
        })
        return
    end

    -- Get the session first to verify ownership
    local session, err = api._session_repo.get(session_id, user_id)
    if err then
        if err == "Session not found" then
            res:set_status(api._http.STATUS.NOT_FOUND)
            res:write_json({
                success = false,
                error = "Session not found"
            })
        else
            res:set_status(api._http.STATUS.INTERNAL_ERROR)
            res:write_json({
                success = false,
                error = err
            })
        end
        return
    end

    -- Verify the session belongs to the authenticated user
    if session.user_id ~= user_id then
        res:set_status(api._http.STATUS.FORBIDDEN)
        res:write_json({
            success = false,
            error = "You don't have permission to delete this session"
        })
        return
    end

    -- Delete the session
    local result, err = api._session_repo.delete(session_id)
    if err then
        res:set_status(api._http.STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = err
        })
        return
    end

    local published, publish_err = api._upstream.notify_external(session_id, { deleted = true })
    if not published then
        res:set_status(api._http.STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = publish_err,
        })
        return
    end

    -- Return success response
    res:set_content_type(api._http.CONTENT.JSON)
    res:set_status(api._http.STATUS.OK)
    res:write_json({
        success = true,
        message = "Session deleted successfully",
        session_id = session_id
    })
end

api.handler = handler

return api
