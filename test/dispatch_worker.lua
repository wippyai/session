local time = require('time')
local sql = require('sql')
local json = require('json')
local writer = require('writer')
local reader = require('reader')
local handlers = require('message_handlers')
local command_bus = require('command_bus')
local dispatch_runtime = require('dispatch_runtime')
local dispatches = require('dispatch_repo')
local dispatch_writer = require('dispatch_writer')
local consts = require('consts')

type FixtureQuery = {
    from_checkpoint: (self: FixtureQuery) -> FixtureQuery,
    all: (self: FixtureQuery) -> ({}, string?),
    count: (self: FixtureQuery) -> (number?, string?),
}

type FixtureReader = {
    state: (self: FixtureReader) -> { config: {} },
    reset: (self: FixtureReader) -> (boolean?, string?),
    messages: (self: FixtureReader) -> FixtureQuery,
}

type DispatchManager = {
    root: { fence: { session_id: string, dispatch_id: string, generation: number, worker_id: string } }?,
    worker_id: string,
    close: (self: DispatchManager) -> (boolean?, string?),
    open: (self: DispatchManager) -> (boolean?, string?),
    wake: (self: DispatchManager, bus: {}) -> (boolean?, string?),
    heartbeat: (self: DispatchManager) -> (boolean?, string?),
    after: (self: DispatchManager, op: {}, result: {}?, err: string?, intercepted: boolean?) -> (),
    relay: (self: DispatchManager, topic: string, payload: {}) -> (boolean?, string?),
    scoped_context: (self: DispatchManager, root: {}, operation_key: string) -> { reader: FixtureReader },
}

local function run(args)
    if args.now then dispatches._now = function() return args.now end end
    local base_writer = assert(writer.new(args.session_id))
    local base_reader = assert((reader :: { open: (string) -> FixtureReader }).open(args.session_id))
    local packets, calls, histories, agent_ids = {}, 0, {}, {}
    local background_counts = {}
    local child_effects, last_relay_validations = 0, 0
    local tool_failure = 'none'
    local tool_schema = 'not-requested'
    if args.tool_mode then
        local schema, err = require('tools').get_tool_schema('app:dispatch_fixture_tool')
        if schema then tool_schema = 'available'
        else
            local message = string.lower(tostring(err or ''))
            tool_schema = string.find(message, 'permission', 1, true) and 'permission-denied'
                or string.find(message, 'not found', 1, true) and 'not-found'
                or string.find(message, 'invalid tool type', 1, true) and 'invalid-tool-type' or 'schema-error'
        end
    end
    local upstream = require('upstream').new(args.session_id, nil, nil)
    upstream._send_message = function(self, topic, message)
        if args.tool_mode then
            local wire = require('upstream').new(args.session_id, nil, args.reply_pid)
            if self._dispatch_root then wire = wire:with_dispatch(self._dispatch_root, self._dispatch_guard) end
            return wire:_send_message(topic, message)
        end
        if self._dispatch_root then
            if not self._dispatch_guard() then return nil, 'DISPATCH_FENCE_LOST' end
            message.dispatch = dispatches.descriptor(self._dispatch_root.row)
            message.root_message_id = self._dispatch_root.row.message_id
        end
        table.insert(packets, { topic = topic, message = message })
        return true
    end
    local context = { session_id = args.session_id, user_id = args.user_id, writer = base_writer,
        reader = base_reader, upstream = upstream, config = base_reader:state().config }
    local manager = dispatch_runtime.new(context) :: DispatchManager
    context.dispatch_manager = manager
    context.agent_ctx = { load_agent = function(_, agent_id, opts)
        table.insert(agent_ids, { agent_id = agent_id, model = opts.model })
        if args.prompt_failure then error('fixture prompt failure') end
        return { step = function(_, prompt, runtime_options)
            calls = calls + 1
            local root = assert(manager.root)
            local history = assert(dispatches.history(root.fence))
            local texts = {}
            for _, message in ipairs(history) do table.insert(texts, message.data) end
            table.insert(histories, texts)
            if args.model_failure then return nil, 'fixture model failure' end
            if args.tool_mode and calls == 1 then return { result = '', tool_calls = { {
                id = 'call_123', name = 'fixture_tool', registry_id = 'app:dispatch_fixture_tool', arguments = { fail = args.tool_mode == 'error' },
            } } } end
            return { result = 'dispatch answer ' .. calls, tokens = args.background and { prompt_tokens = 1 } or nil }
        end }
    end }
    local bus = command_bus.new(context)
    if args.enqueue_failure then
        local enqueue = bus.queue_op
        bus.queue_op = function(self, op)
            if op.dispatch_root and args.enqueue_failure == 'root' then
                return nil, 'FIXTURE_ENQUEUE_FAILED'
            end
            return enqueue(self, op)
        end
        local batch = bus.queue_batch
        bus.queue_batch = function(self, ops, replacing)
            if replacing and args.enqueue_failure == 'child' then return nil, 'FIXTURE_ENQUEUE_FAILED' end
            return batch(self, ops, replacing)
        end
    end
    local idle_waiter
    local function report(request, value, err)
        assert(process.send(args.reply_pid, 'dispatch_test_result', { sequence = request.sequence, value = value, error = err }))
    end
    local function stats()
        return { calls = calls, histories = histories, agent_ids = agent_ids,
            snapshot = dispatches.snapshot(args.session_id), packets = packets, background_counts = background_counts,
            child_effects = child_effects, last_relay_validations = last_relay_validations, tool_failure = tool_failure, tool_schema = tool_schema }
    end
    context.queue_empty_callback = function()
        if idle_waiter then report(idle_waiter, stats()); idle_waiter = nil end
    end
    bus:mount_op_handler(consts.OP_TYPE.HANDLE_MESSAGE, handlers.handle_message)
    bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function(ctx, op)
        local result, err = handlers.agent_step(ctx, op)
        if result and args.descendant_failure then result.next_ops = { { type = 'dispatch_fixture_child' } } end
        if result and args.missing_handler then result.next_ops = { { type = 'dispatch_missing_handler' } } end
        if result and args.intercept then bus:intercept() end
        if result and args.config_mutation and op.operation_key == 'root' then result.next_ops = { { type = 'dispatch_mutate_config' } } end
        if result and args.fanout and op.operation_key == 'root' then
            result.next_ops = {}
            for index = 1, args.fanout do result.next_ops[index] = { type = 'dispatch_fanout_child' } end
        end
        if result and args.chain and op.operation_key == 'root' then result.next_ops = { { type = 'dispatch_fanout_child' } } end
        if result and args.sparse_once and op.operation_key == 'root' then
            result.next_ops = {}
            for index = 1, 4 do result.next_ops[index] = { type = 'dispatch_fanout_child' } end
            result.next_ops[2] = nil
            args.sparse_once = false
        end
        return result, err
    end)
    bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, function(ctx, op)
        local ok, result, err = pcall(handlers.process_tools, ctx, op)
        if not ok then err, result = result, nil end
        if err then
            local text = tostring(err)
            tool_failure = string.match(text, '[%w_./]+:%d+') or 'handler-error'
        end
        return result, err
    end)
    bus:mount_op_handler('dispatch_fanout_child', function(ctx, op)
        child_effects = child_effects + 1
        assert(ctx.writer:add_message('developer', 'bounded child ' .. child_effects))
        local children = {}
        local count = args.chain and 1 or args.child_fanout and op.operation_key == 'root.1' and args.child_fanout or 0
        for index = 1, count do children[index] = { type = 'dispatch_fanout_child' } end
        return { next_ops = children }
    end)
    bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, handlers.agent_continue)
    bus:mount_op_handler(consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS, require('session_handlers').check_background_triggers)
    bus:mount_op_handler(consts.OP_TYPE.GENERATE_TITLE, function(ctx)
        if args.background_failure then return nil, 'fixture background failure' end
        table.insert(background_counts, assert(ctx.reader:messages():count()))
        return { completed = true }
    end)
    bus:mount_op_handler('dispatch_mutate_config', function(ctx, op)
        local state = ctx.reader:state()
        state.config.agent_id, state.config.model = 'fixture:future', 'future-model'
        ctx.config.agent_id, ctx.config.model = 'fixture:mutated-local', 'mutated-local-model'
        assert(ctx.writer:update_meta({ config = state.config }))
        return { next_ops = { { type = consts.OP_TYPE.AGENT_CONTINUE, message_id = op.message_id } } }
    end)
    bus:mount_op_handler('dispatch_fixture_child', function(ctx, op)
        local pending = assert(ctx.writer:add_function_call('fixture_interrupted_tool', {}, { call_id = 'fixture-call' }))
        ctx.writer:update_meta({ public_meta = { fixture = true } })
        return nil, 'fixture descendant failure'
    end)
    coroutine.spawn(function() bus:run() end)
    assert(process.send(args.reply_pid, 'dispatch_test_ready', {}))
    local claimed
    local inbox = process.inbox()
    while true do
        local msg = inbox:receive()
        local request = msg:payload():data()
        if msg:topic() == 'dispatch_test_stop' then manager:close(); bus:stop(); return end
        if msg:topic() == 'dispatch_test_crash' then bus:stop(); return end
        local value, err
        if request.action == 'accept' then
            value, err = handlers.handle_message(context, { request_id = request.request_id, data = request.data })
        elseif request.action == 'queue_capacity' then
            local pending = command_bus.new(context)
            local accepted = 0
            for index = 1, pending.CAPACITY do
                if pending:queue_op({ type = 'fixture_not_executed', request_id = 'queued-' .. index }) then accepted = accepted + 1 end
            end
            local overflow = pending:queue_op({ type = 'fixture_not_executed', request_id = 'queued-overflow' })
            value = { accepted = accepted, overflow = overflow, pending = pending.pending_ops,
                rejection = packets[#packets] and packets[#packets].message.code }
        elseif request.action == 'open' then
            if args.context_renderer_failure then
                local builder = require('prompt_builder')
                local original = builder._context_attachments
                builder._context_attachments = {
                    supports = args.context_renderer_failure == 'unsupported' and function() return false end or original.supports,
                    render = function()
                        if args.context_renderer_failure == 'thrown' then error('fixture renderer exception') end
                        return {}, { { attachment_id = 'stored-context', code = 'render_failed' } }
                    end,
                }
            end
            value, err = manager:open()
        elseif request.action == 'claim' then
            claimed, err = dispatches.claim(manager.owner)
            value = claimed and dispatches.descriptor(claimed) or nil
        elseif request.action == 'run' then
            value, err = manager:wake(bus)
        elseif request.action == 'idle' then
            if manager.root or bus.pending_ops > 0 then idle_waiter = request else value = stats() end
        elseif request.action == 'stats' then value = stats()
        elseif request.action == 'clock' then args.now = request.now; dispatches._now = function() return args.now end; value = true
        elseif request.action == 'heartbeat' then value, err = manager:heartbeat()
        elseif request.action == 'classify' then value, err = dispatches.classify_expired()
        elseif request.action == 'fenced_write' then
            local root = { row = claimed, fence = { session_id = args.session_id, dispatch_id = claimed.dispatch_id,
                generation = claimed.generation, worker_id = manager.worker_id } }
            local scoped = dispatch_writer.new(base_writer, root, 'fixture')
            local method = assert(scoped[request.method], 'unknown fenced writer method')
            value, err = method(scoped, table.unpack(request.arguments or {}))
        elseif request.action == 'relay' then
            if not manager.root then
                manager.root = { row = claimed, pending = 2, operation_count = 2,
                    operations = { root = 'active', ['root.1'] = 'active' }, stream_nonce = 'fixture-stream',
                    fence = { session_id = args.session_id, dispatch_id = claimed.dispatch_id,
                        generation = claimed.generation, worker_id = manager.worker_id } }
            end
            local previous = context.upstream
            context.upstream = require('upstream').new(args.session_id, nil, args.reply_pid)
            local validate, calls = dispatches.valid, 0
            dispatches.valid = function(fence)
                calls = calls + 1
                local validated, validation_err = validate(fence)
                if request.retire_during_validation then
                    local retired = channel.new(1)
                    coroutine.spawn(function()
                        manager:after({ dispatch_root = manager.root, operation_key = 'root' }, { completed = true })
                        retired:send(true)
                    end)
                    local selected = channel.select({ retired:case_receive(), time.after('3s'):case_receive() })
                    assert(selected.channel == retired and selected.ok, 'Fixture operation retirement timed out')
                end
                return validated, validation_err
            end
            value, err = manager:relay(request.topic, request.payload)
            dispatches.valid, last_relay_validations = validate, calls
            context.upstream = previous
        elseif request.action == 'finish_operation' then
            manager:after({ dispatch_root = manager.root, operation_key = request.operation_key }, { completed = true })
            value = true
        elseif request.action == 'checkpoint_window' then
            assert(base_writer:set_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID, request.checkpoint_id))
            assert(base_reader:reset())
            local root = { row = claimed, stream_nonce = 'fixture-checkpoint', fence = { session_id = args.session_id, dispatch_id = claimed.dispatch_id,
                generation = claimed.generation, worker_id = manager.worker_id } }
            local scoped = manager:scoped_context(root, 'root')
            local query = scoped.reader:messages():from_checkpoint()
            local window, window_err = query:all()
            if not window then err = window_err else value = { messages = window, count = query:count() } end
        elseif request.action == 'history' then
            value, err = dispatches.history({ session_id = args.session_id, dispatch_id = claimed.dispatch_id,
                generation = claimed.generation, worker_id = manager.worker_id })
        elseif request.action == 'cancel' then value, err = dispatches.cancel(args.session_id, request.dispatch_id)
        elseif request.action == 'rollback' then
            value, err = dispatches.transaction(function(tx)
                local _, insert_err = sql.builder.insert('messages'):set_map({ message_id = request.message_id, session_id = args.session_id,
                    type = 'user', data = 'rollback', date = time.now():format(time.RFC3339NANO) }):run_with(tx):exec()
                if insert_err then return nil, 'FIXTURE_INSERT_FAILED' end
                local row, queue_err = dispatches.enqueue_in_transaction(tx, request.message_id, args.session_id, request.request_id)
                if not row then return nil, queue_err end
                return nil, 'FIXTURE_ROLLBACK'
            end)
        end
        if request ~= idle_waiter then report(request, value, err) end
    end
end

return { run = run }
