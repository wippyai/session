local uuid = require('uuid')
local time = require('time')

local intents = {}
intents.__index = intents

function intents.new(broker, broker_pid)
    return setmetatable({ broker = broker, broker_pid = broker_pid, pending = {}, by_request = {},
        activated = {}, sequence = 0, count = 0, now = function() return time.now():unix() end }, intents)
end

function intents:stage(intent)
    if type(intent.request_id) ~= 'string' then return nil end
    local key = intent.session_id .. ':' .. intent.request_id
    local prior = self.by_request[key] and self.pending[self.by_request[key]]
    if prior and prior.expires_at > self.now() then return { deferred_action_nonce = prior.nonce } end
    local expired = {}
    for nonce, record in pairs(self.pending) do if record.expires_at <= self.now() then expired[#expired + 1] = nonce end end
    for _, nonce in ipairs(expired) do
        local record = self.pending[nonce]
        self.pending[nonce], self.by_request[record.key] = nil, nil
        self.count = self.count - 1
    end
    if self.count >= 128 then return nil end
    self.sequence = self.sequence + 1
    local nonce = uuid.v7()
    if not nonce then return nil end
    self.pending[nonce] = { nonce = nonce, key = key, value = intent, expires_at = self.now() + 120 }
    self.by_request[key] = nonce
    self.count = self.count + 1
    return { deferred_action_nonce = nonce }
end

function intents:activate(sender, accepted, request)
    if type(accepted) ~= 'table' or accepted.type ~= 'user'
        or accepted.session_id ~= request.session_id or accepted.message_id ~= request.message_id
        or accepted.request_id ~= request.request_id then return nil, 'invalid_message' end
    local prior = self.activated[accepted.session_id]
    if prior and prior.message_id == accepted.message_id then return prior.runtime end
    local record = request.intent_nonce and self.pending[request.intent_nonce]
    local bound
    if record then
        self.pending[record.nonce], self.by_request[record.key] = nil, nil
        self.count = self.count - 1
        local intent = record.value
        if record.expires_at > self.now() and intent.session_pid == sender
            and intent.session_id == accepted.session_id and intent.request_id == accepted.request_id then
            bound = self.broker:bind_turn(intent)
            if bound then bound.broker_pid = self.broker_pid end
        end
    end
    if not bound then self.broker:cancel_session(accepted.session_id, 'unavailable', 'Agent actions unavailable for this turn') end
    self.activated[accepted.session_id] = { message_id = accepted.message_id, runtime = bound }
    return bound
end

function intents:finish(session_id)
    self.activated[session_id] = nil
    self.broker:cancel_session(session_id, 'cancelled', 'Agent turn finished')
    return true
end

function intents:forget(session_id)
    self.activated[session_id] = nil
    local forgotten = {}
    for nonce, record in pairs(self.pending) do if record.value.session_id == session_id then forgotten[#forgotten + 1] = nonce end end
    for _, nonce in ipairs(forgotten) do
        local record = self.pending[nonce]
        self.pending[nonce], self.by_request[record.key] = nil, nil
        self.count = self.count - 1
    end
end

return intents
