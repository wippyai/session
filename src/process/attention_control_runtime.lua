local attention_control_runtime = {}
attention_control_runtime.__index = attention_control_runtime

local DEFAULT_GRANT_TTL_SECONDS = 30
local DEFAULT_REPLAY_TTL_SECONDS = 60
local DEFAULT_MAX_ENTRIES = 256

local function nonempty(value, max_length)
    return type(value) == "string" and value ~= "" and #value <= max_length
end

local function same_request(entry, request, sender)
    return entry.sender == sender
        and entry.capability == request.capability
        and entry.session_id == request.session_id
        and entry.agent_id == request.agent_id
        and entry.request_id == request.request_id
        and entry.reply_topic == request.reply_topic
        and entry.enabled == request.enabled
        and entry.expected_revision == request.expected_revision
end

local function copy_response(response)
    local copy = {
        schema = response.schema,
        request_id = response.request_id,
        session_id = response.session_id,
        error = response.error,
    }
    if type(response.attention_context) == "table" then
        copy.attention_context = {
            enabled = response.attention_context.enabled,
            revision = response.attention_context.revision,
            updated_at = response.attention_context.updated_at,
            updated_by = response.attention_context.updated_by,
        }
    end
    return copy
end

function attention_control_runtime.new(deps)
    assert(type(deps) == "table", "attention control dependencies are required")
    assert(type(deps.new_id) == "function", "new_id dependency is required")
    assert(type(deps.now) == "function", "now dependency is required")
    local grant_ttl_seconds = deps.grant_ttl_seconds or DEFAULT_GRANT_TTL_SECONDS
    local replay_ttl_seconds = deps.replay_ttl_seconds or DEFAULT_REPLAY_TTL_SECONDS
    local max_entries = deps.max_entries or DEFAULT_MAX_ENTRIES
    assert(type(grant_ttl_seconds) == "number" and grant_ttl_seconds >= 1 and grant_ttl_seconds <= 60,
        "grant_ttl_seconds must be between 1 and 60")
    assert(type(replay_ttl_seconds) == "number" and replay_ttl_seconds >= 1 and replay_ttl_seconds <= 300,
        "replay_ttl_seconds must be between 1 and 300")
    assert(type(max_entries) == "number" and max_entries >= 1 and max_entries <= 1024,
        "max_entries must be between 1 and 1024")
    return setmetatable({
        deps = deps,
        grant_ttl_seconds = grant_ttl_seconds,
        replay_ttl_seconds = replay_ttl_seconds,
        max_entries = max_entries,
        generation = 1,
        connection_id = deps.connection_id and tostring(deps.connection_id) or nil,
        pending = {},
        pending_count = 0,
        completed = {},
        completed_count = 0,
    }, attention_control_runtime)
end

function attention_control_runtime:_cleanup()
    local now = self.deps.now()
    for capability, grant in pairs(self.pending) do
        if grant.expires_at <= now then
            self.pending[capability] = nil
            local pending_count = self.pending_count
            assert(type(pending_count) == "number", "pending_count must be numeric")
            self.pending_count = pending_count - 1
        end
    end
    for request_id, entry in pairs(self.completed) do
        if entry.expires_at <= now then
            self.completed[request_id] = nil
            local completed_count = self.completed_count
            assert(type(completed_count) == "number", "completed_count must be numeric")
            self.completed_count = completed_count - 1
        end
    end
end

function attention_control_runtime:invalidate()
    self.generation = self.generation + 1
    self.pending = {}
    self.pending_count = 0
    self.completed = {}
    self.completed_count = 0
end

function attention_control_runtime:set_connection(connection_id)
    local normalized = connection_id and tostring(connection_id) or nil
    if normalized == self.connection_id then
        return false
    end
    self.connection_id = normalized
    self:invalidate()
    return true
end

function attention_control_runtime:issue(fields)
    self:_cleanup()
    if type(fields) ~= "table"
        or not nonempty(fields.session_id, 128)
        or not nonempty(fields.agent_id, 160)
        or not nonempty(fields.request_id, 128) then
        return nil, "ATTENTION_CONTEXT_AUTHORITY_INVALID"
    end
    if self.pending_count >= self.max_entries then
        return nil, "ATTENTION_CONTEXT_AUTHORITY_EXHAUSTED"
    end
    local capability, id_err = self.deps.new_id()
    if not capability then
        return nil, id_err or "ATTENTION_CONTEXT_AUTHORITY_UNAVAILABLE"
    end
    self.pending[capability] = {
        session_id = fields.session_id,
        agent_id = fields.agent_id,
        request_id = fields.request_id,
        generation = self.generation,
        expires_at = self.deps.now() + self.grant_ttl_seconds,
    }
    self.pending_count = self.pending_count + 1
    return capability, nil
end

function attention_control_runtime:handle(request, sender, expected, update)
    self:_cleanup()
    local response = {
        schema = expected.schema,
        request_id = type(request) == "table" and request.request_id or nil,
        session_id = expected.session_id,
    }
    if type(request) ~= "table"
        or not nonempty(request.request_id, 128)
        or not nonempty(request.reply_topic, 160)
        or not nonempty(request.capability, 160)
        or not nonempty(request.session_id, 128)
        or not nonempty(request.agent_id, 160)
        or type(request.enabled) ~= "boolean"
        or request.expected_revision ~= nil
            and (type(request.expected_revision) ~= "number"
                or request.expected_revision < 0
                or request.expected_revision % 1 ~= 0)
        or not nonempty(sender, 160) then
        response.error = "ATTENTION_CONTEXT_REQUEST_INVALID"
        return response
    end
    if request.reply_topic ~= expected.reply_topic then
        response.error = "ATTENTION_CONTEXT_REPLY_TOPIC_INVALID"
        return response
    end
    if request.session_id ~= expected.session_id then
        response.error = "ATTENTION_CONTEXT_SESSION_STALE"
        return response
    end
    if request.agent_id ~= expected.agent_id then
        response.error = "ATTENTION_CONTEXT_AGENT_STALE"
        return response
    end

    local prior = self.completed[request.request_id]
    if prior then
        if prior.generation ~= self.generation then
            response.error = "ATTENTION_CONTEXT_AUTHORITY_STALE"
        elseif same_request(prior, request, sender) then
            return copy_response(prior.response)
        else
            response.error = "ATTENTION_CONTEXT_REQUEST_CONFLICT"
        end
        return response
    end

    local grant = self.pending[request.capability]
    if not grant
        or grant.generation ~= self.generation
        or grant.expires_at <= self.deps.now()
        or grant.session_id ~= request.session_id
        or grant.agent_id ~= request.agent_id
        or grant.request_id ~= request.request_id then
        response.error = "ATTENTION_CONTEXT_AUTHORITY_STALE"
        return response
    end

    self.pending[request.capability] = nil
    self.pending_count = self.pending_count - 1
    local state, update_err = update(request.enabled, request.expected_revision, request.agent_id)
    if state then
        response.attention_context = state
    else
        response.error = update_err or "ATTENTION_CONTEXT_UPDATE_REJECTED"
    end

    if self.completed_count >= self.max_entries then
        local oldest_id = nil
        local oldest_expiry = nil
        for request_id, entry in pairs(self.completed) do
            if oldest_expiry == nil or entry.expires_at < oldest_expiry then
                oldest_id = request_id
                oldest_expiry = entry.expires_at
            end
        end
        if oldest_id then
            self.completed[oldest_id] = nil
            self.completed_count = self.completed_count - 1
        end
    end
    self.completed[request.request_id] = {
        sender = sender,
        capability = request.capability,
        session_id = request.session_id,
        agent_id = request.agent_id,
        request_id = request.request_id,
        reply_topic = request.reply_topic,
        enabled = request.enabled,
        expected_revision = request.expected_revision,
        generation = self.generation,
        expires_at = self.deps.now() + self.replay_ttl_seconds,
        response = copy_response(response),
    }
    local completed_count = self.completed_count
    assert(type(completed_count) == "number", "completed_count must be numeric")
    self.completed_count = completed_count + 1
    return copy_response(response)
end

return attention_control_runtime
