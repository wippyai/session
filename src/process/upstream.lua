local consts = require("consts")

type UpstreamPayload = {
    type: string?,
    session_id: string?,
}

local session_upstream = { _session_repo = require("session_repo") }
session_upstream.__index = session_upstream

local function is_not_found(err)
    return type(err) == "userdata" and err:kind() == "NotFound"
end

function session_upstream.new(session_id, conn_pid, parent_pid)
    local self = setmetatable({}, session_upstream)
    self.session_id = session_id
    self.conn_pid = conn_pid
    self.parent_pid = parent_pid
    return self
end

function session_upstream.notify_external(session_id, changes)
    if type(session_id) ~= "string" or session_id == "" then
        return nil, "Session ID is required"
    end
    if type(changes) ~= "table" then
        return nil, "Session changes are required"
    end

    local session_pid, lookup_err = process.registry.lookup("session." .. session_id)
    if lookup_err and not is_not_found(lookup_err) then return nil, lookup_err end
    if not session_pid then return true end

    local sent, send_err = process.send(session_pid, consts.TOPICS.SESSION_UPDATED, changes)
    if sent then return true end
    -- Persistence already succeeded. A normal owner exit between lookup and
    -- delivery does not turn an offline rename into an error.
    local current, current_err = process.registry.lookup("session." .. session_id)
    if not current and (not current_err or is_not_found(current_err)) then return true end
    return nil, send_err
end

-- Called only by the session owner. Notifications invalidate fields; their
-- values may already be stale by the time this mailbox message is handled.
function session_upstream:refresh_external(changes)
    local current, err = session_upstream._session_repo.get(self.session_id)
    if not current then
        if err == "Session not found" then
            self:update_session({ deleted = true })
            return true
        end
        return nil, err or "Failed to reload session"
    end
    local update = {}
    for _, key in ipairs({ "title", "status", "kind", "public_meta", "last_message_date" }) do
        if changes[key] ~= nil then update[key] = current[key] end
    end
    -- Never forward private metadata, config or caller-supplied row contents.
    update.session_id = self.session_id
    self:_send_session_update(consts.UPSTREAM_TYPES.UPDATE, update)
    return true
end

-- Topic generation methods --

-- Get session-level topic
function session_upstream:get_session_topic()
    return consts.TOPIC_PREFIXES.SESSION .. self.session_id
end

-- Get message-level topic
function session_upstream:get_message_topic(message_id)
    return consts.TOPIC_PREFIXES.SESSION .. self.session_id .. consts.TOPIC_PREFIXES.MESSAGE .. message_id
end

-- SESSION-LEVEL UPDATES --

-- Update session state (status, agent, model, etc.)
function session_upstream:update_session(changes)
    -- Title writes can originate in the command-bus coroutine or an API.
    -- Only the owner's inbox loop publishes their authoritative stored value.
    if changes.title ~= nil then
        return session_upstream.notify_external(self.session_id, changes)
    end
    changes["session_id"] = self.session_id
    self:_send_session_update(consts.UPSTREAM_TYPES.UPDATE, changes)
end

-- Report session-level error
function session_upstream:session_error(code, message)
    self:_send_session_update(consts.UPSTREAM_TYPES.ERROR, {
        code = code,
        message = message
    })
end

-- MESSAGE-LEVEL UPDATES --

-- Announce new assistant response beginning
function session_upstream:response_beginning(response_id, message_id)
    self:send_message_update(response_id, consts.UPSTREAM_TYPES.RESPONSE_STARTED, {
        response_id = response_id,
        message_id = message_id,
        timestamp = os.time()
    })
end

-- Confirm message reception
function session_upstream:message_received(message_id, text, file_uuids, input, request_id, context_attachments)
    self:send_message_update(message_id, consts.UPSTREAM_TYPES.RECEIVED, {
        message_id = message_id,
        request_id = request_id,
        text = text,
        timestamp = os.time(),
        file_uuids = file_uuids,
        input = input,
        context_attachments = context_attachments
    })
end

-- Report message-level error
function session_upstream:message_error(message_id, code, message)
    self:send_message_update(message_id, consts.UPSTREAM_TYPES.ERROR, {
        message_id = message_id,
        code = code,
        message = message
    })
end

-- Invalidate message
function session_upstream:invalidate_message(message_id, reason)
    self:send_message_update(message_id, consts.UPSTREAM_TYPES.INVALIDATE, {
        response_id = message_id,
        reason = reason
    })
end

-- Report command success with request_id
function session_upstream:command_success(request_id, details)
    local payload = {
        request_id = request_id,
        success = true
    }
    for key, value in pairs(details or {}) do
        payload[key] = value
    end
    self:_send_session_update(consts.UPSTREAM_TYPES.COMMAND_RESPONSE, payload)
end

-- Report command error with request_id
function session_upstream:command_error(request_id, code, message, payload)
    payload = payload or {}
    self:_send_session_update(consts.UPSTREAM_TYPES.ERROR, {
        request_id = request_id,
        code = code,
        message = message,
        message_id = payload.message_id,
        input = payload.input
    })
end

-- PRIVATE METHODS --

-- Send session-level update
function session_upstream:_send_session_update(type, payload)
    local topic = self:get_session_topic()
    local message = { type = type, session_id = self.session_id }

    -- Merge payload fields into message
    for k, v in pairs(payload or {}) do
        message[k] = v
    end

    self:_send_message(topic, message)
end

-- Send message-level update
function session_upstream:send_message_update(message_id, type, payload)
    local topic = self:get_message_topic(message_id)
    local message = { type = type, session_id = self.session_id }

    -- Merge payload fields into message
    for k, v in pairs(payload or {}) do
        message[k] = v
    end

    self:_send_message(topic, message)
end

-- Send message to appropriate recipients
function session_upstream:_send_message(topic, message)
    -- Send to parent process (which can relay to all connections)
    if self.parent_pid then
        local ok, err = pcall(process.send, self.parent_pid :: string, topic, message)
        if not ok then return nil, tostring(err) end
    end
    return true
end

return session_upstream
