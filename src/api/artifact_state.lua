local http = require("http")
local security = require("security")
local request_body = require("request_body")
local state_service = require("state_service")

-- GET/POST /artifact/{id}/state: session form state and answer submission.
-- Thin HTTP adapters over wippy.session.forms:state_service, which owns the
-- form checks, status codes and bodies. The POST body goes through the
-- Content-Type gate and the capped read of request_body first. Responses
-- are never cached.

local function respond(res, status, body)
    res:set_status(status or http.STATUS.INTERNAL_ERROR)
    res:set_content_type(http.CONTENT.JSON)
    res:set_header("Cache-Control", "no-store")
    res:write(body or "")
end

local UNAUTHENTICATED = '{"success":false,"code":"unauthorized","message":"Authentication required"}'
local UNSUPPORTED_MEDIA_TYPE = '{"success":false,"code":"unsupported_media_type","message":"Content-Type must be application/json."}'
local PAYLOAD_TOO_LARGE = '{"success":false,"code":"payload_too_large","message":"The submission is larger than 64 KiB."}'

local function get()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    local actor = security.actor()
    if not actor then
        respond(res, http.STATUS.UNAUTHORIZED, UNAUTHENTICATED)
        return
    end

    local status, body = state_service.get_state(actor:id(), req:param("id"))
    respond(res, status, body)
end

local function post()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    local actor = security.actor()
    if not actor then
        respond(res, http.STATUS.UNAUTHORIZED, UNAUTHENTICATED)
        return
    end

    if not request_body.is_json_content_type(req:content_type()) then
        respond(res, 415, UNSUPPORTED_MEDIA_TYPE)
        return
    end

    -- Refuse an oversized body before reading it when the length is declared.
    local declared = req:content_length()
    if type(declared) == "number" and declared > state_service.MAX_BODY_BYTES then
        respond(res, 413, PAYLOAD_TOO_LARGE)
        return
    end

    local raw_body, body_err = request_body.read_capped(req, state_service.MAX_BODY_BYTES)
    if body_err == "too_large" then
        respond(res, 413, PAYLOAD_TOO_LARGE)
        return
    elseif body_err then
        respond(res, http.STATUS.INTERNAL_ERROR,
            '{"success":false,"code":"internal","message":"Failed to read the request body."}')
        return
    end

    local status, body = state_service.submit(actor:id(), req:param("id"), raw_body)
    respond(res, status, body)
end

return {
    get = get,
    post = post,
}
