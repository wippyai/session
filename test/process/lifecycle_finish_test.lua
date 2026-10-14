local test = require('test')
local bus_module = require('command_bus')
local consts = require('consts')

local function define_tests()
    describe('Lifecycle finish at the turn boundary', function()
        it('continues model, tools and follow-up steps before closing', function()
            local bus = bus_module.new({})
            local order = {}
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                table.insert(order, 'model')
                bus:finish()
                test.is_false(bus:stop_requested())
                return { next_ops = {{ type = consts.OP_TYPE.PROCESS_TOOLS }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, function(_, op)
                test.is_nil(op.cancel_only)
                table.insert(order, 'tool-result')
                return { next_ops = {{ type = consts.OP_TYPE.AGENT_CONTINUE }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                table.insert(order, 'answer')
                return { completed = true }
            end)
            assert(bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP, from_user = true, message_id = 'request' }))
            assert(bus:run())
            test.eq(table.concat(order, ','), 'model,tool-result,answer')
            test.eq(bus.state, 'closed')
            test.eq(bus.pending_ops, 0)
        end)
        it('resumes a pending finish without starting or losing another turn', function()
            local context = {}
            local bus = bus_module.new(context)
            local calls = 0
            context.queue_empty_callback = function() bus:stop() end
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                bus:finish()
                test.is_true(bus:cancel_finish())
                return { next_ops = {{ type = consts.OP_TYPE.AGENT_CONTINUE }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                calls = calls + 1
                return { completed = true }
            end)
            assert(bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP, from_user = true, message_id = 'request' }))
            assert(bus:run())
            test.eq(calls, 1)
            test.is_false(bus:cancel_finish())
        end)
        it('allows explicit Stop while a lifecycle finish is pending', function()
            local bus = bus_module.new({})
            local cancelled = false
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                bus:finish()
                test.is_true(bus:request_stop('stop'))
                return { next_ops = {{ type = consts.OP_TYPE.PROCESS_TOOLS }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, function(_, op)
                cancelled = op.cancel_only == true
                return { completed = true }
            end)
            assert(bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP, from_user = true, message_id = 'request' }))
            assert(bus:run())
            test.is_true(cancelled)
            test.eq(bus.state, 'closed')
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
