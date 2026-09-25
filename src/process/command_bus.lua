local consts = require("consts")

local command_bus = {}
command_bus.__index = command_bus

local function is_control(op)
    return op.type == consts.OP_TYPE.CONTROL_ARTIFACTS
        or op.type == consts.OP_TYPE.CONTROL_CONTEXT
        or op.type == consts.OP_TYPE.CONTROL_MEMORY
        or op.type == consts.OP_TYPE.CONTROL_CONFIG
end

local function reject_user_command(self, op, code, message)
    if not op.user_command or not op.request_id or not self.context.upstream then return end
    self.context.upstream:command_error(op.request_id, code, message)
end

local function is_fatal_operation(op)
    return op.type == consts.OP_TYPE.AGENT_STEP
        or op.type == consts.OP_TYPE.PROCESS_TOOLS
        or op.type == consts.OP_TYPE.AGENT_CONTINUE
        or is_control(op)
end

function command_bus.new(context)
    local self = setmetatable({}, command_bus)
    self.context = context
    self.state = "idle"
    self.ops = {}
    self.settle_ops = {}
    self.wake = channel.new(1)
    self.wake_pending = false
    self.handlers = {}
    self.pending_ops = 0
    self.turn_state = { steps = 0, repeated_calls = 0,
        id = nil, stop_request_id = nil } :: any
    context.turn_state = self.turn_state
    context.coordinator = self
    return self
end

function command_bus:mount_op_handler(op_type, handler)
    if not op_type or type(handler) ~= "function" then
        return false, "Operation type and handler function required"
    end
    self.handlers[op_type] = handler
    return true
end

function command_bus:wake_loop()
    if self.wake_pending then return end
    self.wake_pending = true
    self.wake:send(true)
end

function command_bus:queue_op(op)
    if self.state == "closed" then return false, "Command bus is closed" end
    if self.state == "draining_finish" then
        return false, "Command bus is draining"
    end
    if self.state == "draining_stop" and not op.user_command then
        return false, "Command bus is stopping agent work"
    end
    if #self.ops + #self.settle_ops >= 256 then return false, "Command bus queue is full" end
    local queue = op.user_command and self:is_turn_active() and self.settle_ops or self.ops
    table.insert(queue, op)
    self.pending_ops = self.pending_ops + 1
    self:wake_loop()
    return true
end

function command_bus:is_turn_active()
    if self.state ~= "idle" then return self.state ~= "closed" end
    if self.current_op and self.current_op.starts_turn then return true end
    for _, op in ipairs(self.ops) do
        if op.starts_turn or op.type == consts.OP_TYPE.AGENT_STEP
            or op.type == consts.OP_TYPE.AGENT_CONTINUE then
            return true
        end
    end
    return false
end

function command_bus:request_stop(stop_request_id)
    if self.state == "closed" or self.state == "draining_finish" then return false end
    if not self:is_turn_active() then return false end
    if self.state ~= "draining_stop" then self.state = "draining_stop" end
    self.turn_state.stop_request_id = stop_request_id or self.turn_state.stop_request_id
    self:wake_loop()
    return true
end

function command_bus:stop_requested()
    return self.state == "draining_stop" or self.state == "draining_finish"
end

function command_bus:finish()
    if self.state == "closed" then return end
    self.state = "draining_finish"
    self:wake_loop()
end

function command_bus:stop()
    for _, op in ipairs(self.ops) do
        reject_user_command(self, op, "SESSION_FINISHING", "Session is finishing")
    end
    for _, op in ipairs(self.settle_ops) do
        reject_user_command(self, op, "SESSION_FINISHING", "Session is finishing")
    end
    self.state = "closed"
    self.ops = {}
    self.settle_ops = {}
    self.pending_ops = 0
    self:wake_loop()
end

function command_bus:intercept(handler)
    self:request_stop()
    if handler then handler(self.context, { intercepted_ops = {} }) end
end

function command_bus:process_operation(op)
    local handler = self.handlers[op.type]
    if not handler then
        local err = "No handler for operation: " .. tostring(op.type)
        if not op.user_command then return nil, err end
        reject_user_command(self, op, "HANDLER_ERROR", err)
        return { error_handled = true, error_message = err }
    end
    local result, err = handler(self.context, op)
    if err then
        if op.user_command then
            reject_user_command(self, op, "HANDLER_ERROR", err)
            return { error_handled = true, error_message = err }
        end
        if is_fatal_operation(op) then return nil, err end
        if op.type == consts.OP_TYPE.HANDLE_MESSAGE and self.context.upstream then
            self.context.upstream:message_error(op.message_id, consts.ERROR_CODES.STORAGE_ERROR, err)
        end
        return { error_handled = true, error_message = err }
    end
    return result, nil
end

function command_bus:admitted(op)
    if self.state == "closed" then return false end
    if self.state == "draining_stop" or self.state == "draining_finish" then
        if op.type == consts.OP_TYPE.HANDLE_MESSAGE then return true end
        return (op.type == consts.OP_TYPE.PROCESS_TOOLS or is_control(op)) and op.round_effect == true
    end
    return true
end

function command_bus:enqueue_result(result)
    local next_ops = (result and result.next_ops) or {}
    for index = #next_ops, 1, -1 do
        local op = next_ops[index]
        op.round_effect = true
        if self:admitted(op) then
            if self:stop_requested() and op.type == consts.OP_TYPE.PROCESS_TOOLS then
                op.cancel_only = true
            end
            table.insert(self.ops, 1, op)
            self.pending_ops = self.pending_ops + 1
        end
    end
end

function command_bus:flush_held(run_agent)
    if not self.context.flush_held then return nil, nil end
    return self.context.flush_held(run_agent)
end

function command_bus:end_turn()
    local stop_id = self.turn_state.stop_request_id
    local turn_id = self.turn_state.id
    local was_draining = self.state == "draining_stop" or self.state == "draining_finish"
    local last_id, err, request_id = self:flush_held(not was_draining)
    if err then return nil, err end
    local draining = self.state == "draining_stop" or self.state == "draining_finish"
    local settle_ops = self.settle_ops
    self.settle_ops = {}
    if self.state == "draining_finish" then
        self.state = "closed"
        for _, op in ipairs(settle_ops) do
            self.pending_ops = self.pending_ops - 1
            reject_user_command(self, op, "SESSION_FINISHING", "Session is finishing")
        end
    else
        self.state = "idle"
        for index = #settle_ops, 1, -1 do
            table.insert(self.ops, 1, settle_ops[index])
        end
        if last_id and not draining then
            table.insert(self.ops, #settle_ops + 1, { type = consts.OP_TYPE.AGENT_STEP,
                message_id = last_id, request_id = request_id, from_user = true })
            self.pending_ops = self.pending_ops + 1
        end
    end
    self.turn_state.stop_request_id = nil
    self.turn_state.id = nil
    if self.context.on_turn_end then self.context.on_turn_end(turn_id, draining, stop_id) end
    return true
end

function command_bus:run()
    while self.state ~= "closed" do
        local op = table.remove(self.ops, 1)
        if op then
            self.pending_ops = self.pending_ops - 1
            if op.type == consts.OP_TYPE.AGENT_CONTINUE and self.state == "running" then
                local _, flush_err = self:flush_held(true)
                if flush_err then return nil, flush_err end
            end
            if self:admitted(op) then
                if op.type == consts.OP_TYPE.AGENT_STEP and op.from_user and self.state == "idle" then
                    self.state = "running"
                    self.turn_state.id = op.message_id
                end
                if self:stop_requested() and op.type == consts.OP_TYPE.PROCESS_TOOLS then
                    op.cancel_only = true
                end
                self.current_op = op
                local result, err = self:process_operation(op)
                self.current_op = nil
                if err then return nil, err end
                self:enqueue_result(result)
            elseif op.user_command then
                local code = self.state == "closed" and "SESSION_FINISHING" or "SESSION_STOPPING"
                reject_user_command(self, op, code, "Session no longer accepts this command")
            end
        elseif self.state == "running" or self.state == "draining_stop" or self.state == "draining_finish" then
            local _, err = self:end_turn()
            if err then return nil, err end
        else
            if self.context.queue_empty_callback then
                local _, err = self.context.queue_empty_callback()
                if err then return nil, err end
            end
            if self.state ~= "closed" and #self.ops == 0 then
                self.wake:receive()
                self.wake_pending = false
            end
        end
    end
    return true
end

return command_bus
