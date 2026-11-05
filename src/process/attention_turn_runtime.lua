local uuid = require('uuid')
local time = require('time')
local runtime = {}
runtime.__index = runtime

function runtime.new(context)
    return setmetatable({ context = context, has_binding = false }, runtime)
end

-- This private exchange authorizes browser operations for an already accepted
-- message. It does not acknowledge the user message or schedule agent execution.
function runtime:activate(op)
    local intent = op.ui_action_runtime
    if not intent and not self.has_binding then return nil end
    local parent = self.context.upstream.parent_pid
    if not parent then return nil end
    local nonce, mailbox = uuid.v7(), channel.new(1)
    self.pending = { nonce = nonce, request_id = op.request_id, mailbox = mailbox }
    local intent_nonce
    if type(intent) == 'table' then intent_nonce = (intent :: any).deferred_action_nonce end
    local sent = process.send(parent, 'session_attention_activate', {
        nonce = nonce, session_id = self.context.session_id, message_id = op.message_id,
        request_id = op.request_id, intent_nonce = intent_nonce,
    })
    local bound
    if sent then
        local deadline = time.after('3s')
        local selected = channel.select({ mailbox:case_receive(), deadline:case_receive() })
        if selected.ok and selected.channel == mailbox then bound = (selected.value :: any).runtime end
    end
    self.pending = nil
    self.has_binding = bound ~= nil
    return bound
end

function runtime:activated(sender, response)
    local pending = self.pending
    if sender ~= self.context.upstream.parent_pid or not pending or pending.consumed
        or type(response) ~= 'table' or response.nonce ~= pending.nonce
        or response.request_id ~= pending.request_id then return false end
    pending.consumed = true
    return pending.mailbox:send({ runtime = response.runtime })
end

return runtime
