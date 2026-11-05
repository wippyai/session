local http = require('http')
local security = require('security')
local context_attachments = require('context_attachments')
local context_staging_repo = require('context_staging_repo')

-- Describes what this Session module supports, so a client can choose the
-- matching protocol before it sends anything. Releases without this endpoint
-- answer 404; clients then fall back to inferring support from session state.
local api = {
    _http = http,
    _security = security,
    _context_attachments = context_attachments,
    _context_staging_repo = context_staging_repo,
}

api.SCHEMA = 'wippy.session.capabilities.v1'

function api.describe()
    local attachments = api._context_attachments.capabilities()
    return {
        schema = api.SCHEMA,
        -- `received` echoes request_id, and an identical retry returns the same message.
        message_receipt = 1,
        -- Input sent while a turn runs is stored as pending and applied at the next
        -- step; session updates carry `interaction`; Stop accepts a stop_request_id.
        steering = 1,
        attention = {
            -- Per-session attention_context state, attention_context_set and the PATCH route.
            context = 1,
            -- runtime_context binding and session_ui_action_request/result.
            browser_operations = 1,
            context_attachments = {
                transport = 1,
                staging = true,
                max_context_bytes = api._context_staging_repo.MAX_BYTES,
                handlers = attachments.handlers,
            },
        },
    }
end

local function handler()
    local res = api._http.response()
    if not res then return nil, 'HTTP context unavailable' end
    res:set_content_type(api._http.CONTENT.JSON)
    res:set_header('Cache-Control', 'no-store')

    if not api._security.actor() then
        res:set_status(401)
        res:write_json({ success = false, error = { code = 'UNAUTHENTICATED', message = 'Authentication required' } })
        return
    end

    res:set_status(200)
    res:write_json({ success = true, capabilities = api.describe() })
end

api.handler = handler

return api
