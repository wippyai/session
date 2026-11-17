local http = require("http")
local request_body = require("request_body")
local state_service = require("state_service")

-- Request handling of the form state endpoints (GET and POST
-- /artifact/{id}/state) once the caller is authenticated; the function
-- entries in artifact_state.lua only read the HTTP context and the actor.
-- state_service owns the form checks, status codes and bodies. The POST body
-- goes through the Content-Type gate and the capped read of request_body
-- first. Responses are never cached.

local artifact_state_access = {}

-- The options both endpoints open their request with (http.request): a read
-- deadline in milliseconds and a body cap in bytes. They apply before the
-- owner check, so a stranger or a slow client cannot hold a worker. The cap
-- is twice the documented answer limit on purpose: read_capped stops at
-- state_service.MAX_BODY_BYTES and answers 413, and the transport cap must
-- not cut a body off first (that would read as a 500 instead).
artifact_state_access.REQUEST_TIMEOUT_MS = 5000
function artifact_state_access.request_options()
    return {
        timeout = artifact_state_access.REQUEST_TIMEOUT_MS,
        max_body = state_service.MAX_BODY_BYTES * 2,
    }
end

local function respond(res: any, status: number?, body: string?)
    res:set_status(status or http.STATUS.INTERNAL_ERROR)
    res:set_content_type(http.CONTENT.JSON)
    res:set_header("Cache-Control", "no-store")
    res:write(body or "")
end

-- The 401 for a request with no actor.
function artifact_state_access.respond_unauthenticated(res: any)
    respond(res, state_service.error_response(http.STATUS.UNAUTHORIZED, "unauthorized", "Authentication required"))
end

-- GET /artifact/{id}/state for `user_id`.
function artifact_state_access.serve_get(req: any, res: any, user_id: string)
    respond(res, state_service.get_state(user_id, req:param("id")))
end

-- POST /artifact/{id}/state for `user_id`: the answer submission.
function artifact_state_access.serve_submit(req: any, res: any, user_id: string)
    if not request_body.is_json_content_type(req:content_type()) then
        respond(res, state_service.error_response(415, "unsupported_media_type",
            "Content-Type must be application/json."))
        return
    end

    -- Refuse an oversized body before reading it when the length is declared.
    local declared = req:content_length()
    if type(declared) == "number" and declared > state_service.MAX_BODY_BYTES then
        respond(res, state_service.payload_too_large())
        return
    end

    local raw_body, body_err = request_body.read_capped(req, state_service.MAX_BODY_BYTES)
    if body_err == "too_large" then
        respond(res, state_service.payload_too_large())
        return
    elseif body_err then
        respond(res, state_service.error_response(http.STATUS.INTERNAL_ERROR, "internal",
            "Failed to read the request body."))
        return
    end

    respond(res, state_service.submit(user_id, req:param("id"), raw_body))
end

return artifact_state_access
