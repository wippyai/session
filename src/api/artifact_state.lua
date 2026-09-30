local http = require("http")
local security = require("security")
local state_service = require("state_service")

-- GET/POST /artifact/{id}/state: session form state and answer submission.
-- Thin HTTP adapters over wippy.session.forms:state_service, which owns the
-- form checks, status codes and bodies. This file owns the two things that
-- are genuinely HTTP-layer, not form-layer: the Content-Type gate and the
-- capped body read below. Responses are never cached.

local function respond(res, status, body)
    res:set_status(status or http.STATUS.INTERNAL_ERROR)
    res:set_content_type(http.CONTENT.JSON)
    res:set_header("Cache-Control", "no-store")
    res:write(body or "")
end

local UNAUTHENTICATED = '{"success":false,"code":"unauthorized","message":"Authentication required"}'
local UNSUPPORTED_MEDIA_TYPE = '{"success":false,"code":"unsupported_media_type","message":"Content-Type must be application/json."}'
local PAYLOAD_TOO_LARGE = '{"success":false,"code":"payload_too_large","message":"The submission is larger than 64 KiB."}'

-- The media type from a Content-Type header value, lowercased and without a
-- parameter (";charset=..." and the like), or nil when there is none. Only
-- single-character-class patterns are used (no `.-` backtracking, see H3).
local function media_type(content_type: string?): string?
    if type(content_type) ~= "string" then return nil end
    local semi = string.find(content_type, ";", 1, true)
    local head = semi and string.sub(content_type, 1, semi - 1) or content_type
    head = string.gsub(head, "%s", "")
    if head == "" then return nil end
    return string.lower(head)
end

-- With cookie auth, a form without a Content-Type check would let a
-- cross-site text/plain POST submit an answer (a charset parameter is still
-- accepted: "application/json; charset=utf-8" is real JSON).
local function is_json_content_type(content_type: string?): boolean
    return media_type(content_type) == "application/json"
end

-- Reads the whole body through the request stream and stops as soon as it
-- would exceed `limit`, instead of buffering it first. req:body() has no
-- such cap: with a chunked request (no Content-Length, the only check the
-- declared-length branch below can make) that reads an unbounded body into
-- memory before state_service ever sees its length.
local function read_capped_stream(stream: any, limit: number): (string?, string?)
    local parts = {}
    local total = 0
    while true do
        local chunk, read_err = stream:read(65536)
        if read_err then
            stream:close()
            return nil, tostring(read_err)
        end
        if not chunk then break end
        total = total + #chunk
        if total > limit then
            stream:close()
            return nil, "too_large"
        end
        table.insert(parts, chunk)
    end
    stream:close()
    return table.concat(parts), nil
end

local function read_capped_body(req: any, limit: number): (string?, string?)
    local stream, stream_err = req:stream()
    if not stream then
        return nil, tostring(stream_err or "stream unavailable")
    end
    return read_capped_stream(stream, limit)
end

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

    if not is_json_content_type(req:content_type()) then
        respond(res, 415, UNSUPPORTED_MEDIA_TYPE)
        return
    end

    -- Refuse an oversized body before reading it when the length is declared.
    local declared = req:content_length()
    if type(declared) == "number" and declared > state_service.MAX_BODY_BYTES then
        respond(res, 413, PAYLOAD_TOO_LARGE)
        return
    end

    local raw_body, body_err = read_capped_body(req, state_service.MAX_BODY_BYTES)
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
    -- Test seams: pure logic a live http.request()/http.response() context
    -- cannot exercise directly.
    _is_json_content_type = is_json_content_type,
    _read_capped_stream = read_capped_stream,
}
