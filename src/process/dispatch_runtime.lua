local json = require('json')
local uuid = require('uuid')
local time = require('time')
local dispatches = require('dispatch_repo')
local fenced_writer = require('dispatch_writer')
local consts = require('consts')

local runtime = {}
runtime.__index = runtime
runtime.STREAM_TOPIC = 'session_dispatch_stream'
runtime.MAX_TOTAL_OPERATIONS = 256
runtime.MAX_PENDING_OPERATIONS = 128

function runtime.new(context)
    return setmetatable({ context = context, worker_id = uuid.v7(), owner = nil, root = nil,
        pending_actions = {}, closed = false }, runtime)
end

function runtime:status(row)
    self.context.upstream:_send_session_update('dispatch_status', {
        session_id = self.context.session_id, request_id = row.request_id,
        dispatch = dispatches.descriptor(row), root_message_id = row.message_id,
    })
end

function runtime:snapshot(ids)
    local snapshot, err = dispatches.snapshot(self.context.session_id, ids)
    if not snapshot then return nil, err end
    return { dispatch_protocol = { version = 1, enabled = true }, dispatch_snapshot = snapshot }
end

function runtime:open()
    local owner, err = dispatches.acquire(self.context.session_id, self.worker_id)
    if not owner then return nil, err end
    self.owner = owner
    return true
end

function runtime:accepted(row, action_runtime, duplicate)
    if not row then return end
    if not duplicate and action_runtime then self.pending_actions[row.dispatch_id] = action_runtime end
end

function runtime:heartbeat()
    if self.closed then return false end
    if not self.owner then return self:open() end
    local ok, err = dispatches.heartbeat(self.owner)
    if not ok then
        if self.root then self.root.failure = 'DISPATCH_OWNER_LOST' end
        self.closed = true
        return nil, err
    end
    return true
end

function runtime:wake(bus)
    if self.closed or self.root or not self.owner then return true end
    local row, err = dispatches.claim(self.owner)
    if err then return nil, err end
    if not row then return true end
    local row_data = row :: any
    local config, decode_err = json.decode(row_data.config_json :: string)
    if decode_err or type(config) ~= 'table' then
        dispatches.finish({ session_id = row_data.session_id, dispatch_id = row_data.dispatch_id,
            generation = row_data.generation, worker_id = self.worker_id }, 'DISPATCH_HANDLER_FAILED')
        return nil, 'DISPATCH_INVALID_CONFIG'
    end
    local root = { row = row_data, config = config, pending = 1, operation_count = 1, operations = { root = 'queued' }, stream_nonce = uuid.v7(),
        fence = { session_id = row_data.session_id, dispatch_id = row_data.dispatch_id, generation = row_data.generation, worker_id = self.worker_id },
        action_runtime = self.pending_actions[row_data.dispatch_id] }
    self.pending_actions[row_data.dispatch_id] = nil
    self.root = root
    self:status(row_data)
    local queued, queue_err = bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP, message_id = row_data.message_id,
        request_id = row_data.request_id, from_user = true, dispatch_root = root, operation_key = 'root',
        ui_action_runtime = root.action_runtime, internal = true })
    if not queued then
        root.failure = 'DISPATCH_ENQUEUE_FAILED'
        self:complete(root)
        return nil, queue_err
    end
    return true
end

function runtime:scoped_context(root, operation_key)
    local base = self.context
    local scoped = {}
    for key, value in pairs(base) do scoped[key] = value end
    scoped.config = assert(json.decode(root.row.config_json))
    scoped.dispatch_root = root
    scoped.operation_key = operation_key
    scoped.writer = fenced_writer.new(base.writer, root, operation_key)
    local reader = setmetatable({}, { __index = function(_, key)
        if key == 'messages' then return function()
            local query = {}
            function query:from_checkpoint()
                self.checkpoint_id, self.error = base.reader:get_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID)
                return self
            end
            function query:all()
                if self.error then return nil, self.error end
                return dispatches.history(root.fence, self.checkpoint_id)
            end
            function query:count()
                if self.error then return nil, self.error end
                return dispatches.history_count(root.fence, self.checkpoint_id)
            end
            return query
        end end
        if key == 'state' then return function()
            local state = base.reader:state()
            state.config = assert(json.decode(root.row.config_json))
            return state
        end end
        local value = base.reader[key]
        if type(value) == 'function' then return function(_, ...) return value(base.reader, ...) end end
        return value
    end })
    scoped.reader = reader
    scoped.upstream = base.upstream:with_dispatch(root, function() return dispatches.valid(root.fence) ~= nil end)
    scoped.stream_target = { reply_to = process.pid(), topic = runtime.STREAM_TOPIC .. ':' .. root.stream_nonce .. ':' .. operation_key }
    return scoped
end

function runtime:before(op)
    local root = op.dispatch_root
    if not root then return self.context end
    if root ~= self.root or root.failure or root.operations[op.operation_key] ~= 'queued' then return nil, 'DISPATCH_FENCE_LOST' end
    local valid, err = dispatches.valid(root.fence)
    if not valid then root.failure = 'DISPATCH_OWNER_LOST'; return nil, err end
    if not root.action_activated then
        root.action_activated = true
        local parent = self.context.upstream.parent_pid
        if parent then
            local nonce, mailbox = uuid.v7(), channel.new(1)
            self.activation = { nonce = nonce, dispatch_id = root.row.dispatch_id, mailbox = mailbox }
            local sent = process.send(parent, 'session_dispatch_activate', {
                nonce = nonce, session_id = root.row.session_id, message_id = root.row.message_id,
                dispatch_id = root.row.dispatch_id, generation = root.row.generation,
                intent_nonce = root.action_runtime and root.action_runtime.deferred_action_nonce,
            })
            root.action_runtime = nil
            if sent then
                local deadline = time.after('3s')
                local selected = channel.select({ mailbox:case_receive(), deadline:case_receive() })
                if selected.ok and selected.channel == mailbox then
                    root.action_runtime = (selected.value :: any).runtime
                end
            end
            self.activation = nil
        end
        if root.action_runtime and root.action_runtime.deferred_action_nonce then root.action_runtime = nil end
        op.ui_action_runtime = root.action_runtime
        if not dispatches.valid(root.fence) then root.failure = 'DISPATCH_OWNER_LOST'; return nil, 'DISPATCH_FENCE_LOST' end
    end
    root.operations[op.operation_key] = 'active'
    return self:scoped_context(root, op.operation_key)
end

function runtime:activated(sender, message)
    local pending = self.activation
    if sender ~= self.context.upstream.parent_pid or not pending or pending.consumed or type(message) ~= 'table'
        or message.nonce ~= pending.nonce or message.dispatch_id ~= pending.dispatch_id then return false end
    pending.consumed = true
    return pending.mailbox:send({ runtime = message.runtime })
end

function runtime:revoke_action(root)
    local parent = self.context.upstream.parent_pid
    if parent then process.send(parent, 'session_dispatch_finished', {
        session_id = root.row.session_id, message_id = root.row.message_id, dispatch_id = root.row.dispatch_id,
    }) end
end

function runtime:complete(root)
    local row, err = dispatches.finish(root.fence, root.failure or 'DISPATCH_COMPLETED')
    if row then self:status(row) end
    self:revoke_action(root)
    if root == self.root then self.root = nil end
    return row, err
end

function runtime:preflight(op, children)
    local root = op.dispatch_root
    return root == self.root and not root.failure and root.operation_count + #children <= runtime.MAX_TOTAL_OPERATIONS
        and root.pending - 1 + #children <= runtime.MAX_PENDING_OPERATIONS
end

function runtime:after(op, result, err, intercepted)
    local root = op.dispatch_root
    if not root or root ~= self.root or root.operations[op.operation_key] == nil then return end
    if op.background ~= true then
        if err or result and result.error_handled then root.failure = root.failure or 'DISPATCH_HANDLER_FAILED' end
        if intercepted then root.failure = root.failure or 'DISPATCH_CANCELLED' end
    end
    root.operations[op.operation_key] = nil
    if root.failure then result = nil end
    for i, child in ipairs(result and result.next_ops or {}) do
        child.internal = true
        child.background = op.background == true or child.background == true
        child.dispatch_root, child.operation_key = root, op.operation_key .. '.' .. i
        root.operations[child.operation_key] = 'queued'
        child.ui_action_runtime = root.action_runtime
        root.pending = root.pending + 1
        root.operation_count = root.operation_count + 1
    end
    root.pending = root.pending - 1
    if root.pending == 0 or root.failure then self:complete(root) end
end

function runtime:cancel()
    if self.root then
        local root = self.root
        root.failure = 'DISPATCH_CANCELLED'
        local row = dispatches.cancel(self.context.session_id, root.row.dispatch_id)
        if row then self:status(row) end
        self:revoke_action(root)
    end
end

function runtime:close()
    self.closed = true
    if self.owner then
        local value, err = dispatches.release(self.owner)
        if self.root then self:revoke_action(self.root) end
        return value, err
    end
    return true
end

function runtime:relay(topic, payload)
    local root = self.root
    if not root or root.failure then return false end
    local prefix = runtime.STREAM_TOPIC .. ':' .. root.stream_nonce .. ':'
    if string.sub(topic, 1, #prefix) ~= prefix then return false end
    local operation_key = string.sub(topic, #prefix + 1)
    if root.operations[operation_key] ~= 'active' or type(payload) ~= 'table' then return false end
    local response_id = operation_key == 'root' and root.row.response_id or dispatches.output_id(root.row.dispatch_id, operation_key, 'response')
    local upstream = self.context.upstream:with_dispatch(root, function()
        local valid = dispatches.valid(root.fence)
        -- SQL can yield while the operation completes or this root is retired.
        return valid ~= nil and self.root == root and not root.failure and root.operations[operation_key] == 'active'
    end)
    local sent, err = upstream:_send_message(upstream:get_message_topic(response_id), payload)
    return sent == true, err
end

return runtime
