local http = require("http")
local security = require("security")
local state_service = require("state_service")

-- GET/POST /artifact/{id}/state: session form state and answer submission.
-- Thin HTTP adapters over wippy.session.forms:state_service, which owns the
-- checks, status codes and bodies. Responses are never cached.

local function respond(res, status, body)
    res:set_status(status or http.STATUS.INTERNAL_ERROR)
    res:set_content_type(http.CONTENT.JSON)
    res:set_header("Cache-Control", "no-store")
    res:write(body or "")
end

local UNAUTHENTICATED = '{"success":false,"code":"unauthorized","message":"Authentication required"}'

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

    -- Refuse an oversized body before reading it when the length is declared.
    local declared = req:content_length()
    if type(declared) == "number" and declared > state_service.MAX_BODY_BYTES then
        respond(res, 413, '{"success":false,"code":"payload_too_large","message":"The submission is larger than 64 KiB."}')
        return
    end

    local raw_body = req:body()
    local status, body = state_service.submit(actor:id(), req:param("id"), raw_body)
    respond(res, status, body)
end

return {
    get = get,
    post = post,
}
