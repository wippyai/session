local http = require('http')
local security = require('security')
local session_repo = require('session_repo')
local consts = require('consts')
local context_attachments = require('context_attachments')

local api = {
    _http = http,
    _security = security,
    _session_repo = session_repo,
    _consts = consts,
    _context_attachments = context_attachments,
    _process = process,
}

local function respond(res, status: number, code: string?, message: string?, state: table?)
    res:set_status(status)
    local body = { success = status < 400 }
    if state then body.attention_context = state end
    if code then body.error = { code = code, message = message } end
    res:write_json(body)
end

local function handler()
    local res = api._http.response()
    local req = api._http.request({ timeout = 5000, max_body = 8192 })
    if not res or not req then return nil, 'HTTP context unavailable' end
    res:set_content_type(api._http.CONTENT.JSON)
    res:set_header('Cache-Control', 'no-store')

    local actor = api._security.actor()
    if not actor then return respond(res, 401, 'UNAUTHENTICATED', 'Authentication required') end

    local session_id = req:param('session_id')
    if type(session_id) ~= 'string' or #session_id == 0 or #session_id > 160 then
        return respond(res, 400, 'INVALID_SESSION_ID', 'Session ID is required')
    end
    if not api._security.can('write', 'session:' .. session_id) then
        return respond(res, 403, 'SESSION_FORBIDDEN', 'Session access is not allowed')
    end
    -- The permission grant covers session resources in general; only the owner
    -- may change this session's state. Other users get the same 404 as a
    -- missing session.
    local owned, owner_err = api._session_repo.get(session_id, actor:id())
    if not owned then
        if owner_err == 'Session not found' then
            return respond(res, 404, 'SESSION_NOT_FOUND', 'Session not found')
        end
        return respond(res, 503, 'ATTENTION_CONTEXT_STORAGE_UNAVAILABLE', 'Attention context storage is unavailable')
    end

    local body, body_err = req:body_json()
    if body_err or type(body) ~= 'table' then
        return respond(res, 400, 'INVALID_JSON', 'A JSON object is required')
    end
    for key, _ in pairs(body) do
        if key ~= 'enabled' and key ~= 'expected_revision' then
            return respond(res, 400, 'UNKNOWN_FIELD', 'Unknown field: ' .. tostring(key))
        end
    end
    if type(body.enabled) ~= 'boolean' then
        return respond(res, 422, 'INVALID_ATTENTION_CONTEXT_ENABLED', 'enabled must be a boolean')
    end
    if body.expected_revision ~= nil and (type(body.expected_revision) ~= 'number'
        or body.expected_revision < 0 or body.expected_revision % 1 ~= 0) then
        return respond(res, 422, 'INVALID_ATTENTION_CONTEXT_REVISION', 'expected_revision must be a non-negative integer')
    end
    if body.enabled and not api._context_attachments.supports('wippy.attention', 4) then
        return respond(res, 409, 'ATTENTION_CONTEXT_CAPABILITY_UNAVAILABLE',
            'Attention context version 4 is unavailable')
    end

    local state, update_err, current = api._session_repo.update_attention_context(
        session_id, body.enabled, body.expected_revision, actor:id(), actor:id()
    )
    if not state then
        if update_err == 'ATTENTION_CONTEXT_REVISION_CONFLICT' then
            return respond(res, 409, update_err, 'Attention context revision is stale', current)
        end
        if update_err == 'SESSION_NOT_FOUND' then
            return respond(res, 404, update_err, 'Session not found')
        end
        if update_err == 'ATTENTION_CONTEXT_STORAGE_UNAVAILABLE' then
            return respond(res, 503, update_err, 'Attention context storage is unavailable')
        end
        return respond(res, 400, update_err or 'ATTENTION_CONTEXT_UPDATE_FAILED', 'Attention context request rejected')
    end

    local session_pid = api._process.registry.lookup('session.' .. session_id)
    if session_pid then
        api._process.send(session_pid, api._consts.TOPICS.ATTENTION_CONTEXT_UPDATED, {
            attention_context = state,
        })
    end

    return respond(res, 200, nil, nil, state)
end

api.handler = handler

return api
