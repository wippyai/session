local test = require("test")
local command_bus = require("command_bus")
local consts = require("consts")
local context_repo = require("context_repo")
local reader = require("reader")
local security = require("security")
local session = require("session")
local session_repo = require("session_repo")
local uuid = require("uuid")
local wait_for_boot = require("wait_for_boot")
local writer = require("writer")

-- The session asks the bus to finish (FINISH_AND_EXIT: the client disconnected, the plugin
-- is shutting down, the session went inactive) expecting the in-flight work to wind down and
-- the process to exit. An agent turn is a self-perpetuating chain of operations: every
-- handler result carries the next op. finish() only stops the bus once the queue is empty,
-- so if the chain keeps re-feeding itself through next_ops the queue never empties and the
-- "finishing" session runs forever (observed 2026-09-21: a tool loop survived every
-- graceful-termination signal for 10.5 hours and was only killed by a redeploy).
--
-- A handler that returns next_ops is a continuation of the SAME turn, not new work, so a
-- finishing bus must stop feeding it, exactly the way an intercept (STOP) already does.

local SAFETY_VALVE = 5

local function create_persisted_fixture(): (string, string)
    wait_for_boot.run()
    local actor = security.actor()
    local session_id = uuid.v7()
    local context_id = uuid.v7()
    local _, context_err = context_repo.create(context_id, "primary", "{}")
    test.is_nil(context_err)
    local _, session_err = session_repo.create(session_id, actor:id(), context_id, "Boundary", "test")
    test.is_nil(session_err)
    return session_id, context_id
end

-- Runs a "loop" op that re-queues itself through next_ops on a fresh bus. `on_call(n, bus)`
-- runs before each op's result is produced and returns true once it has signalled the bus.
-- The handler cuts the chain by itself after `max_calls`, or SAFETY_VALVE calls after the
-- signal, so a defective bus cannot hang the suite; whoever cuts the chain also stops the
-- bus, because an idle bus blocks in run() waiting for more work (that is its job in the
-- session process). The assertions look at how many calls slipped through after the signal.
local function run_loop(max_calls: number, on_call: ((number, any) -> boolean)?): (number, number?, any)
    local bus = command_bus.new({})
    local calls = 0
    local signalled_at: number? = nil

    bus:mount_op_handler("loop", function(_ctx, _op)
        calls = calls + 1
        if signalled_at == nil and on_call ~= nil and on_call(calls, bus) then
            signalled_at = calls
        end
        if calls >= max_calls or (signalled_at ~= nil and calls - signalled_at >= SAFETY_VALVE) then
            bus:stop()
            return { completed = true }
        end
        return { completed = false, next_ops = { { type = "loop" } } }
    end)

    bus:queue_op({ type = "loop" })
    local ok, err = bus:run()
    test.is_nil(err)
    test.is_true(ok == true)

    return calls, signalled_at, bus
end

local function define_tests()
    describe("command bus termination of a self-perpetuating chain", function()
        it("runs a chain to its natural end", function()
            local calls, _, bus = run_loop(3)
            test.eq(calls, 3)
            test.eq(bus.pending_ops, 0)
        end)

        it("finish() on an idle bus stops it immediately", function()
            local bus = command_bus.new({})
            bus:finish()
            local ok, err = bus:run()
            test.is_nil(err)
            test.is_true(ok == true)
        end)

        it("intercept (STOP) drops the in-flight operation's next_ops", function()
            local calls, signalled_at, bus = run_loop(100, function(n, current_bus)
                if n == 2 then
                    current_bus:intercept(function(_ctx, _op)
                        -- In the session process STOP leaves the bus idle for the next user
                        -- message; here nothing else will arrive, so stop it once intercepted.
                        current_bus:stop()
                        return { completed = true, intercepted = true }
                    end)
                    return true
                end
                return false
            end)

            test.eq(signalled_at, 2)
            test.eq(calls, 2, "no operation may run after the intercepted one")
            test.eq(bus.pending_ops, 0, "an intercepted operation's next_ops must not be enqueued")
        end)
    end)
    describe("turn boundaries", function()
        it("persists assistant, call results, and held input in boundary order", function()
            local session_id, context_id = create_persisted_fixture()
            local session_writer, writer_err = writer.new(session_id)
            test.is_nil(writer_err)
            if not session_writer then error("Failed to open persisted test writer") end
            local held_id = uuid.v7()
            local ctx = { writer = session_writer, held = {{
                message_id = held_id, data = { text = "held user message" }
            }} }
            local bus = command_bus.new(ctx)
            local assistant_id = nil :: string?
            local call_ids = nil :: any
            ctx.flush_held = function(run_agent) return session.flush_held(ctx, run_agent) end
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function(_ctx, op)
                if op.message_id == held_id then
                    bus:stop()
                    return { completed = true }
                end
                local stored_assistant_id, stored_call_ids, response_err = session_writer:add_response("thinking", {}, {
                    { id = "function-call", name = "lookup", arguments = "{}",
                        registry_id = "app:lookup", type = consts.MSG_TYPE.FUNCTION },
                    { id = "private-call", name = "secret", arguments = "{}",
                        registry_id = "app:secret", type = consts.MSG_TYPE.PRIVATE_FUNCTION },
                    { id = "delegation-call", name = "delegate", arguments = "{}",
                        registry_id = "app:delegate", type = consts.MSG_TYPE.DELEGATION }
                })
                test.is_nil(response_err)
                assistant_id = stored_assistant_id
                call_ids = stored_call_ids
                return { next_ops = {{ type = consts.OP_TYPE.PROCESS_TOOLS }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, function()
                for call_id, result in pairs({
                ["function-call"] = "function result",
                ["private-call"] = "private result",
                ["delegation-call"] = "delegation result"
                }) do
                    local _, result_err = session_writer:update_message_meta(call_ids[call_id], {
                        status = consts.FUNC_STATUS.SUCCESS, result = result
                    })
                    test.is_nil(result_err)
                end
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP,
                message_id = "first-user", from_user = true })

            local ok, run_err = bus:run()

            test.is_nil(run_err)
            test.is_true(ok)

            local session_reader, reader_err = reader.open(session_id)
            test.is_nil(reader_err)
            local history, history_err = session_reader:messages():all()
            test.is_nil(history_err)
            test.eq(#history, 5)
            test.eq(history[1].message_id, assistant_id)
            test.eq(history[1].type, consts.MSG_TYPE.ASSISTANT)
            test.eq(history[2].type, consts.MSG_TYPE.FUNCTION)
            test.eq(history[2].metadata.result, "function result")
            test.eq(history[3].type, consts.MSG_TYPE.PRIVATE_FUNCTION)
            test.eq(history[3].metadata.result, "private result")
            test.eq(history[4].type, consts.MSG_TYPE.DELEGATION)
            test.eq(history[4].metadata.result, "delegation result")
            test.eq(history[5].message_id, held_id)
            test.eq(history[5].type, consts.MSG_TYPE.USER)
            test.eq(history[5].data, "held user message")

            session_repo.delete(session_id)
            context_repo.delete(context_id)
        end)

        it("rejects queued user commands with the existing finishing code", function()
            local errors = {} :: {any}
            local bus = command_bus.new({ upstream = {
                command_error = function(_self, request_id, code, message)
                    table.insert(errors, { request_id = request_id, code = code, message = message })
                end
            } })
            bus:queue_op({ type = "user-command", request_id = "queued", user_command = true })

            bus:stop()

            test.eq(#errors, 1)
            test.eq(errors[1].request_id, "queued")
            test.eq(errors[1].code, "SESSION_FINISHING")
        end)

        it("keeps agent work failures fatal without reporting them as command errors", function()
            local errors = {} :: {any}
            local bus = command_bus.new({ upstream = {
                command_error = function(_self, request_id, code, message)
                    table.insert(errors, { request_id = request_id, code = code, message = message })
                end
            } })
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                return nil, "agent step failed"
            end)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP,
                message_id = "user-message", request_id = "agent-request", from_user = true })

            local ok, err = bus:run()

            test.is_nil(ok)
            test.eq(err, "agent step failed")
            test.eq(#errors, 0)
        end)

        it("terminalizes unstarted calls when STOP arrives during the agent step", function()
            local order = {}
            local state_at_end = nil
            local ctx = { held = { "held" } }
            local bus = command_bus.new(ctx)
            ctx.on_turn_end = function() state_at_end = bus.state end
            ctx.flush_held = function(run_agent)
                table.insert(order, run_agent and "held-and-run" or "held-only")
                ctx.held = {}
            end
            ctx.queue_empty_callback = function() bus:stop(); return true end
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                bus:request_stop()
                return { next_ops = {
                    { type = consts.OP_TYPE.PROCESS_TOOLS },
                    { type = consts.OP_TYPE.AGENT_CONTINUE }
                } }
            end)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, function(_ctx, op)
                table.insert(order, op.cancel_only and "cancel-intents" or "execute-intents")
                return { completed = true }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                table.insert(order, "continued")
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP, from_user = true, message_id = "first" })
            local _, err = bus:run()
            test.is_nil(err)
            test.eq(table.concat(order, ","), "cancel-intents,held-only")
            test.eq(state_at_end, "idle")
            test.eq(bus.state, "closed")
        end)

        it("records an accepted user message when STOP precedes its dispatch", function()
            local recorded = 0
            local steps = 0
            local ctx = {}
            local bus = command_bus.new(ctx)
            ctx.queue_empty_callback = function() bus:stop(); return true end
            bus:mount_op_handler(consts.OP_TYPE.HANDLE_MESSAGE, function()
                recorded = recorded + 1
                return { next_ops = {{ type = consts.OP_TYPE.AGENT_STEP,
                    from_user = true, message_id = "user" }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                steps = steps + 1
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.HANDLE_MESSAGE, starts_turn = true })
            bus:request_stop()
            local _, err = bus:run()
            test.is_nil(err)
            test.eq(recorded, 1)
            test.eq(steps, 0)
        end)

        it("applies tool outcomes and control before draining STOP", function()
            local order = {}
            local ctx = { held = { "held" } }
            local bus = command_bus.new(ctx)
            ctx.flush_held = function(run_agent)
                table.insert(order, run_agent and "held-and-run" or "held-only")
                ctx.held = {}
            end
            ctx.queue_empty_callback = function() bus:stop(); return true end
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                return { next_ops = {{ type = consts.OP_TYPE.PROCESS_TOOLS }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, function()
                bus:request_stop()
                table.insert(order, "result-written")
                return { next_ops = {
                    { type = consts.OP_TYPE.CONTROL_CONTEXT },
                    { type = consts.OP_TYPE.AGENT_CONTINUE }
                } }
            end)
            bus:mount_op_handler(consts.OP_TYPE.CONTROL_CONTEXT, function()
                table.insert(order, "control")
                return { completed = true }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                table.insert(order, "continued")
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP, from_user = true, message_id = "first" })
            local _, err = bus:run()
            test.is_nil(err)
            test.eq(table.concat(order, ","), "result-written,control,held-only")
        end)

        it("finishes after writing held input without an agent step", function()
            local order = {}
            local ctx = { held = { "held" } }
            local bus = command_bus.new(ctx)
            ctx.flush_held = function(run_agent)
                table.insert(order, run_agent and "held-and-run" or "held-only")
                ctx.held = {}
            end
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                bus:finish()
                return { next_ops = {{ type = consts.OP_TYPE.AGENT_CONTINUE }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                table.insert(order, "continued")
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP, from_user = true, message_id = "first" })
            local _, err = bus:run()
            test.is_nil(err)
            test.eq(table.concat(order, ","), "held-only")
            test.eq(bus.state, "closed")
        end)
    end)

end

return { run_tests = test.run_cases(define_tests) }
