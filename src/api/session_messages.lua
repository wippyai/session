local http = require("http")
local security = require("security")
local session_repo = require("session_repo")
local message_repo = require("message_repo")
local approval_repo = require("approval_repo")
local time = require("time")
local json = require("json")
local details_projection = require("details_projection")
local details_policy = require("details_policy")

local api = {
    _http = http,
    _security = security,
    _session_repo = session_repo,
    _message_repo = message_repo,
}

type SessionMessagesResponse = {
    success: boolean,
    server_now: string?,
    count: number?,
    session_id: string?,
    messages: {any}?,
    pending_inputs: {any}?,
    pagination: {
        has_more: boolean,
        next_cursor: string?,
        prev_cursor: string?,
    }?,
    error: string?,
}

function api.handler()
    local res = api._http.response()
    local req = api._http.request()

    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    res:set_header("Cache-Control", "no-store")

    -- Security check - ensure user is authenticated
    local actor = api._security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({
            success = false,
            error = "Authentication required"
        })
        return
    end

    -- Get session ID from query parameter
    local session_id = req:query("session_id")
    if not session_id or session_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Session ID is required"
        })
        return
    end

    -- Get user ID from the authenticated actor
    local user_id = actor:id()

    -- Verify session belongs to the authenticated user
    local session, err = api._session_repo.get(session_id, user_id)
    if err or not session then
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

    -- Get query parameters for pagination
    local limit = tonumber(req:query("limit")) or 50
    local cursor = req:query("cursor") or ""
    local direction = req:query("direction") or "before" -- Default to "before" (older messages)

    -- Enforce limit constraints
    if limit > 100 then
        limit = 100
    elseif limit < 1 then
        limit = 1
    end

    -- Get messages for this session with cursor-based pagination
    local result, err = api._message_repo.list_by_session(session_id, limit, cursor, direction)
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = err
        })
        return
    end

    local messages = result.messages
    local pending_inputs, pending_err = api._message_repo.list_pending_inputs(session_id)
    if pending_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = pending_err })
        return
    end
    messages = details_projection.rows(messages, session.config)
    -- An all-private page must not strand a client at an empty public cursor.
    local scanned_cursor = cursor
    while #messages == 0 and result.has_more do
        local next_scan = direction == "after" and result.prev_cursor or result.next_cursor
        if not next_scan or next_scan == scanned_cursor then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({ success = false, error = "Failed to page session history" })
            return
        end
        scanned_cursor = next_scan
        local page, page_err = api._message_repo.list_by_session(session_id, limit, next_scan, direction)
        if not page then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({ success = false, error = page_err })
            return
        end
        result = page
        messages = details_projection.rows(result.messages, session.config)
    end
    pending_inputs = details_projection.rows(pending_inputs, session.config)
    -- Never expose a private row ID through a pagination cursor.
    result.next_cursor = messages[1] and messages[1].message_id or nil
    result.prev_cursor = messages[#messages] and messages[#messages].message_id or nil

    -- Return JSON response
    res:set_content_type(http.CONTENT.JSON)
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        -- A reloaded approval card computes its time left from this
        -- (docs/tool-approval-protocol.md section 10).
        server_now = approval_repo.now(),
        details_revision = details_policy.revision(session.config),
        count = #messages,
        session_id = session_id,
        messages = messages,
        pending_inputs = pending_inputs or {},
        pagination = {
            has_more = result.has_more,
            next_cursor = result.next_cursor,
            prev_cursor = result.prev_cursor
        }
    })
end

return api
