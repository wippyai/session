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

function intents:activate(sender, row, request)
    if not row or row.state ~= 'started' or row.dispatch_id ~= request.dispatch_id
        or row.message_id ~= request.message_id or row.generation ~= request.generation then return nil, 'invalid_dispatch' end
    local prior = self.activated[row.session_id]
    if prior and prior.dispatch_id == row.dispatch_id then return prior.runtime end
    local record = request.intent_nonce and self.pending[request.intent_nonce]
    local bound
    if record then
        self.pending[record.nonce], self.by_request[record.key] = nil, nil
        self.count = self.count - 1
        local intent = record.value
        if record.expires_at > self.now() and intent.session_pid == sender and intent.session_id == row.session_id
            and intent.request_id == row.request_id and intent.user_id == row.actor_id then
            bound = self.broker:bind_turn(intent)
            if bound then bound.broker_pid = self.broker_pid end
        end
    end
    if not bound then self.broker:cancel_session(row.session_id, 'unavailable', 'Agent actions unavailable for activated turn') end
    self.activated[row.session_id] = { dispatch_id = row.dispatch_id, runtime = bound }
    return bound
end

function intents:finish(row)
    if not row or (row.state ~= 'completed' and row.state ~= 'interrupted' and row.state ~= 'cancelled') then return false end
    local active = self.activated[row.session_id]
    if not active or active.dispatch_id ~= row.dispatch_id then return false end
    self.activated[row.session_id] = nil
    self.broker:cancel_session(row.session_id, 'cancelled', 'Dispatch finished')
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
