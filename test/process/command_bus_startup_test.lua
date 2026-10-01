local test = require("test")
local command_bus = require("command_bus")
local consts = require("consts")

local function define_tests()
    describe("command bus startup configuration", function()
        it("leaves the init function and first turn queued until configuration is applied", function()
            local ctx: any = {}
            local bus = command_bus.new(ctx)
            local order = {}
            for _, kind in ipairs({ consts.OP_TYPE.AGENT_CHANGE, consts.OP_TYPE.MODEL_CHANGE,
                consts.OP_TYPE.EXECUTE_FUNCTION, consts.OP_TYPE.AGENT_STEP }) do
                bus:mount_op_handler(kind, function(_, op)
                    order[#order + 1] = op.type
                    return { completed = true }
                end)
            end
            ctx.queue_empty_callback = function() bus:stop(); return true end
            bus:queue_op({ type = consts.OP_TYPE.AGENT_CHANGE, init = true })
            bus:queue_op({ type = consts.OP_TYPE.MODEL_CHANGE, init = true })
            bus:queue_op({ type = consts.OP_TYPE.EXECUTE_FUNCTION })
            bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP, from_user = true, message_id = "first" })

            local ok, err = bus:run_initial_ops()

            test.is_true(ok)
            test.is_nil(err)
            test.eq(table.concat(order, ","), "agent_change,model_change")
            test.eq(bus.state, "idle")
            test.eq(bus.pending_ops, 2)
            test.is_nil(ctx.turn_state.active)
            local ran, run_err = bus:run()
            test.is_true(ran)
            test.is_nil(run_err)
            test.eq(table.concat(order, ","), "agent_change,model_change,execute_function,agent_step")
            test.eq(bus.pending_ops, 0)
        end)

        it("closes startup after an init handler error without running later operations", function()
            local bus = command_bus.new({})
            local later_calls = 0
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CHANGE, function()
                return nil, "initial agent unavailable"
            end)
            bus:mount_op_handler(consts.OP_TYPE.MODEL_CHANGE, function()
                later_calls = later_calls + 1
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_CHANGE, init = true })
            bus:queue_op({ type = consts.OP_TYPE.MODEL_CHANGE, init = true })

            local ok, err = bus:run_initial_ops()

            test.is_nil(ok)
            test.eq(err, "initial agent unavailable")
            test.eq(bus.state, "closed")
            test.eq(bus.pending_ops, 0)
            test.eq(later_calls, 0)
        end)

        it("does not execute an ordinary switch during startup on reopen", function()
            local bus = command_bus.new({})
            local switched = false
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CHANGE, function()
                switched = true
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_CHANGE, user_command = true })

            local ok, err = bus:run_initial_ops()

            test.is_true(ok)
            test.is_nil(err)
            test.is_false(switched)
            test.eq(bus.pending_ops, 1)
            test.eq(#bus.ops, 1)
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
