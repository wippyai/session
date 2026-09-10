local command_bus = {
    context = nil :: any,
    ops_channel = nil :: any,
    stop_signal = nil :: any,
    stopping = false,
    finishing = false,
    intercepted = false,
    intercept_handler = nil :: ((any, any) -> (any, string?))?,
    handlers = {} :: {[string]: (any, any) -> (any, string?)},
    pending_ops = 0 :: number,
}
command_bus.__index = command_bus
command_bus.CAPACITY = 256
command_bus.MAX_FANOUT = 128

type Operation = {
    type: string,
    internal: boolean?,
    request_id: string?,
}

type OperationResult = {
    completed: boolean?,
    next_ops: {Operation}?,
    error_handled: boolean?,
    error_message: string?,
}

function command_bus.new(context)
    local self = setmetatable({}, command_bus)

    self.context = context

    self.ops_channel = channel.new(command_bus.CAPACITY)
    self.stop_signal = channel.new(1)

    self.stopping = false
    self.finishing = false
    self.intercepted = false
    self.intercept_handler = nil

    self.handlers = {} :: {[string]: (any, any) -> (any, string?)}
    self.pending_ops = 0

    return self
end

function command_bus:mount_op_handler(op_type, handler_func)
    if not op_type or type(handler_func) ~= "function" then
        return false, "Operation type and handler function required"
    end
    self.handlers[op_type] = handler_func
    return true, nil
end

function command_bus:can_queue_batch(ops, replacing_current)
    if type(ops) ~= 'table' or #ops > command_bus.MAX_FANOUT then return false, 'Operation fanout exceeds limit' end
    local seen, count = {}, 0
    for key, op in pairs(ops) do
        if type(key) ~= 'number' or key % 1 ~= 0 or key < 1 or key > #ops or type(op) ~= 'table'
            or type(op.type) ~= 'string' or seen[op] then return false, 'Invalid operation batch' end
        seen[op] = true
        count = count + 1
        if self.finishing and not op.internal and not replacing_current then return false, 'Command bus is finishing' end
    end
    if count ~= #ops then return false, 'Invalid operation batch' end
    if self.stopping or self.pending_ops - (replacing_current and 1 or 0) + #ops > command_bus.CAPACITY then
        return false, 'Command bus capacity exceeded'
    end
    return true
end

function command_bus:queue_batch(ops, replacing_current)
    local valid, err = self:can_queue_batch(ops, replacing_current)
    if not valid then return false, err end
    if #ops == 0 then return true end
    local selected = channel.select({ self.ops_channel:case_send({ _dispatch_batch = ops }), default = true })
    if selected.default or not selected.ok then return false, 'Operation enqueue unavailable' end
    self.pending_ops = self.pending_ops + #ops
    return true
end

function command_bus:queue_op(op)
    if self.stopping then
        return false, "Command bus is stopping"
    end
    if self.finishing and not op.internal then
        return false, "Command bus is finishing"
    end
    local accepted, err = self:queue_batch({ op }, false)
    if not accepted and not op.dispatch_root and op.request_id and self.context.upstream then
        self.context.upstream:command_error(op.request_id, 'SESSION_BUSY', 'Session operation queue is full')
    end
    return accepted, err
end

function command_bus:is_fatal_error(err, op_type)
    if not err or type(err) ~= "string" then
        return false
    end

    if string.find(err, "No handler for operation") then
        return true
    end

    if string.find(err, "Missing required arguments") then
        return true
    end

    if string.find(err, "Failed to open session") then
        return true
    end

    if string.find(err, "Cannot open failed session") then
        return true
    end

    return false
end

function command_bus:process_operation(op)
    local handler = self.handlers[op.type]
    if not handler then
        if op.dispatch_root and self.context.dispatch_manager then
            self.context.dispatch_manager:after(op, nil, 'DISPATCH_HANDLER_FAILED', false)
            return { error_handled = true }, nil
        end
        local error_msg = "No handler for operation: " .. tostring(op.type)
        return nil, error_msg
    end

    local op_context = self.context
    local manager = self.context.dispatch_manager
    if manager then
        local scoped, scope_err = manager:before(op)
        if not scoped then
            manager:after(op, nil, scope_err, false)
            return { error_handled = true }, nil
        end
        op_context = scoped
    end
    local ok, result, err = pcall(handler, op_context, op)
    if not ok then err, result = result, nil end
    if not err and not self.intercepted and result and result.next_ops then
        local ready = self:can_queue_batch(result.next_ops, true)
        if ready and manager and op.dispatch_root then ready = manager:preflight(op, result.next_ops) end
        if not ready then
            if op.dispatch_root then op.dispatch_root.failure = 'DISPATCH_ENQUEUE_FAILED' end
            err, result = 'Operation fanout rejected', nil
        end
    end
    if manager and op.dispatch_root then
        manager:after(op, result, err, self.intercepted)
        if err or op.dispatch_root.failure then
            self.intercepted, self.intercept_handler = false, nil
            return { error_handled = true }, nil
        end
    end

    if err then
        local is_fatal = self:is_fatal_error(err, op.type)

        if is_fatal then
            return nil, err
        else
            -- Report error but don't change status - that's not the bus's job
            if self.context.upstream and op.request_id then
                self.context.upstream:command_error(op.request_id, "HANDLER_ERROR", err)
            end

            return { error_handled = true, error_message = err }, nil
        end
    end

    if self.intercepted then
        if self.intercept_handler and type(self.intercept_handler) == "function" then
            local next_ops = (result and result.next_ops) or {}
            local intercept_result, intercept_err = self.intercept_handler(self.context, {
                intercepted_ops = next_ops,
                original_result = result
            })
        end

        self.intercepted = false
        self.intercept_handler = nil

        return result, nil
    end

    if result and result.next_ops then
        local queued, queue_err = self:queue_batch(result.next_ops, true)
        if not queued then
            if manager and op.dispatch_root then
                op.dispatch_root.failure = 'DISPATCH_ENQUEUE_FAILED'
                manager:complete(op.dispatch_root)
            end
            return nil, queue_err
        end
    end

    return result, nil
end

function command_bus:intercept(intercept_handler_func)
    self.intercepted = true
    self.intercept_handler = intercept_handler_func
end

function command_bus:stop()
    if self.stopping then
        return
    end
    self.stopping = true
    self.stop_signal:send(true)
end

function command_bus:finish()
    if self.finishing or self.stopping then
        return
    end
    self.finishing = true

    if self.pending_ops == 0 then
        self:stop()
    end
end

function command_bus:run()
    local active_batch, batch_index
    while not self.stopping do
        local result
        if active_batch and batch_index <= #active_batch then
            result = { ok = true, channel = self.ops_channel, value = active_batch[batch_index] }
            batch_index = batch_index + 1
        else
            active_batch = nil
            result = channel.select({
            self.stop_signal:case_receive(),
            self.ops_channel:case_receive()
            })
            if result.ok and result.channel == self.ops_channel and result.value._dispatch_batch then
                active_batch, batch_index = result.value._dispatch_batch, 2
                result.value = active_batch[1]
            end
        end

        if not result.ok then
            break
        end

        if result.channel == self.stop_signal then
            self.stopping = true
        elseif result.channel == self.ops_channel then
            local _, err = self:process_operation(result.value)
            self.pending_ops = self.pending_ops - 1
            if self.context.dispatch_manager and not self.finishing and not self.stopping then
                self.context.dispatch_manager:wake(self)
            end

            if err then
                local is_fatal = self:is_fatal_error(err, result.value.type)
                if is_fatal then
                    return nil, err
                end
            end

            -- Check if all operations processed and call callback if available
            if self.pending_ops == 0 then
                if self.context.queue_empty_callback then
                    self.context.queue_empty_callback()
                end

                if self.finishing then
                    self:stop()
                end
            end
        end
    end

    return true, nil
end

return command_bus
