-- JSON request bodies of the API endpoints: the Content-Type gate and a
-- body read that stops at a size cap.

local request_body = {}

-- The media type from a Content-Type header value, lowercased and without a
-- parameter (";charset=..." and the like), or nil when there is none. Only
-- single-character-class patterns are used: a `.-` pattern backtracks, which
-- is quadratic on a long header value.
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
function request_body.is_json_content_type(content_type: string?): boolean
    return media_type(content_type) == "application/json"
end

-- Reads the whole body through the request stream and stops as soon as it
-- would exceed `limit`, instead of buffering it first; "too_large" is the
-- error then. req:body() has no such cap: with a chunked request (no
-- Content-Length, which a caller can check before reading) that reads an
-- unbounded body into memory before anything sees its length.
function request_body.read_capped_stream(stream: any, limit: number): (string?, string?)
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

-- The whole body of `req`, read through its stream with the same cap.
function request_body.read_capped(req: any, limit: number): (string?, string?)
    local stream, stream_err = req:stream()
    if not stream then
        return nil, tostring(stream_err or "stream unavailable")
    end
    return request_body.read_capped_stream(stream, limit)
end

return request_body
