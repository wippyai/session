local http = require('http')
local security = require('security')
local json = require('json')
local time = require('time')
local writer = require('session_writer')
local attachments = require('context_attachments')
local staging = require('context_staging_repo')
local prompt_builder = require('prompt_builder')

local api = {}
api._http = http
api._security = security
api._writer = writer
api._staging = staging

local function respond(res, status, body)
    res:set_status(status)
    res:write_json(body)
end

local function fail(res, status, code)
    respond(res, status, { error = { code = code, message = 'Context transport request rejected' } })
end

function api.handler()
    local res = api._http.response()
    local req = api._http.request({ timeout = 5000, max_body = 32768 })
    if not res or not req then return nil, 'HTTP context unavailable' end
    res:set_content_type(http.CONTENT.JSON)
    res:set_header('Cache-Control', 'no-store')
    local actor = api._security.actor()
    if not actor then return fail(res, 401, 'UNAUTHENTICATED') end
    local session_id = req:query('session_id')
    if type(session_id) ~= 'string' or #session_id == 0 or #session_id > 160 then
        return fail(res, 400, 'INVALID_SESSION_ID')
    end
    if not api._security.can('write', 'session:' .. session_id) then return fail(res, 403, 'SESSION_FORBIDDEN') end
    local session_writer = api._writer.new(session_id)
    if not session_writer then return fail(res, 404, 'CONTEXT_SESSION_UNAVAILABLE') end
    local method = req:method()
    if method == 'GET' then
        local capability_version = req:query('capabilities_version')
        if capability_version ~= nil and capability_version ~= '1' then return fail(res, 400, 'INVALID_CAPABILITIES_VERSION') end
        local _, cleanup_err = api._staging.cleanup()
        if cleanup_err then return fail(res, 503, cleanup_err) end
        local result = { context_attachments_transport = { version = 1, staging = true, max_context_bytes = 32768 } }
        if capability_version == '1' then result.context_attachments_capabilities = attachments.capabilities() end
        return respond(res, 200, result)
    end
    local request_id = req:query('request_id')
    if not staging.valid_request_id(request_id) then return fail(res, 400, 'INVALID_REQUEST_ID') end
    if method == 'DELETE' then
        local ok, cancel_err = api._staging.cancel(actor:id(), session_id, request_id, req:query('id'))
        if not ok then return fail(res, cancel_err == 'INVALID_CONTEXT_REFERENCE' and 400 or 503, cancel_err) end
        return respond(res, 200, { success = true })
    end
    if method ~= 'POST' then return fail(res, 405, 'METHOD_NOT_ALLOWED') end
    local encoding = req:header('Content-Encoding')
    if encoding and encoding ~= '' and encoding ~= 'identity' then return fail(res, 415, 'UNSUPPORTED_ENCODING') end
    if not req:is_content_type('application/json') then return fail(res, 415, 'UNSUPPORTED_CONTENT_TYPE') end
    local length = req:content_length()
    if length and length > 32768 then return fail(res, 413, 'CONTEXT_BODY_TOO_LARGE') end
    local body, body_err = req:body()
    if body_err then
        return fail(res, errors.is(body_err, errors.INVALID) and 413 or 400, 'CONTEXT_BODY_REJECTED')
    end
    if type(body) ~= 'string' or #body > 32768 then return fail(res, 413, 'CONTEXT_BODY_TOO_LARGE') end
    local decoded, decode_err = json.decode(body)
    if decode_err then return fail(res, 400, 'INVALID_JSON') end
    local canonical = attachments.canonical_json(decoded)
    if not canonical or canonical ~= body then return fail(res, 422, 'NONCANONICAL_CONTEXT') end
    local validated = attachments.validate(decoded, {
        session_id = session_id, require_visual_authorization = true,
        visual_authorizer = prompt_builder._authorize_visual,
        visual_resolver = prompt_builder._resolve_visual,
    })
    if not validated then return fail(res, 422, 'INVALID_CONTEXT_ATTACHMENTS') end
    local expires_at = time.now():unix() + 300
    for _, attachment in ipairs(validated) do
        if attachment.expires_at then
            local expiry = time.parse(time.RFC3339, attachment.expires_at :: string)
            expires_at = math.min(expires_at, expiry:unix())
        end
    end
    local result, stage_err = api._staging.create(actor:id(), session_id, request_id, canonical, expires_at)
    if not result then
        local statuses = { CONTEXT_STAGE_QUOTA = 429, CONTEXT_STAGE_CONFLICT = 409,
            INVALID_CONTEXT_STAGE = 422, CONTEXT_SESSION_UNAVAILABLE = 404 }
        return fail(res, statuses[stage_err] or 503, stage_err)
    end
    return respond(res, 201, result)
end

return api
