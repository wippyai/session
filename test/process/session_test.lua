local test = require("test")
local consts = require("consts")
local session = require("session")
local command_bus = require("command_bus")
local message_handlers = require("message_handlers")
local control_handlers = require("control_handlers")

local function fixture(): (any, any, {any}, {any}, {any}, {any})
    local saved = {} :: {any}
    local received = {} :: {any}
    local errors = {} :: {any}
    local successes = {} :: {any}
    local ctx: any = {
        session_id = "session-1", held = {}, status = consts.STATUS.IDLE,
        config = { input_policy = { while_running = "steer" } },
        writer = {
            add_message = function(_self, msg_type, content, metadata)
                local id = metadata.message_id or ("server-" .. tostring(#saved + 1))
                table.insert(saved, { type = msg_type, content = content, metadata = metadata,
                    message_id = id })
                return id
            end,
            admit_message = function(self, msg_type, content, metadata, updates)
                return self:add_message(msg_type, content, metadata)
            end,
            update_meta = function() return true end,
            update_status = function() return true end
        },
        upstream = {
            message_received = function(_self, id, text)
                local stored = false
                for _, row in ipairs(saved) do
                    if row.message_id == id then stored = true end
                end
                table.insert(received, { id = id, text = text, stored = stored })
            end,
            send_message_update = function() end,

            command_error = function(_self, id, code, message)
                table.insert(errors, { id = id, code = code, message = message })
            end,
            update_session = function(_self, update)
                if update.request_id then table.insert(successes, update.request_id) end
            end
        }
    }
    ctx.flush_held = function(run_agent) return session.flush_held(ctx, run_agent) end
    return ctx, command_bus.new(ctx), saved, received, errors, successes
end

local function define_tests()
    describe("session input routing", function()
        it("persists and acknowledges steering while keeping one active turn", function()
            local ctx, bus, saved, received = fixture()
            ctx.status = consts.STATUS.RUNNING
            ctx.turn_state.active = true
            bus.state = "running"
            for index = 1, 2 do
                local ok, err = session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                    { data = { text = "steer-" .. index }, request_id = "request-" .. index }, {})
                test.is_nil(err)
                test.is_true(ok)
            end
            test.eq(#saved, 2)
            test.eq(#received, 2)
            test.is_true(received[1].stored)
            test.is_true(received[2].stored)
            test.eq(saved[1].metadata.input.state, "pending")
            test.eq(saved[2].metadata.input.state, "pending")
            test.eq(#ctx.held, 0)
            test.eq(#bus.ops, 0)
        end)

        it("admits idle input before scheduling its model step", function()
            local ctx, bus, saved, received = fixture()
            session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                { data = { text = "first" }, request_id = "request-1" }, {})
            test.eq(#saved, 1)
            test.eq(#received, 1)
            test.is_true(received[1].stored)
            test.is_nil(saved[1].metadata.input)
            test.eq(ctx.status, consts.STATUS.RUNNING)
            test.eq(#bus.ops, 1)
            test.eq(bus.ops[1].message_id, saved[1].message_id)
        end)

        it("accepts the second input as pending while the first step is still queued", function()
            local ctx, bus, saved, received = fixture()
            session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                { data = { text = "first" }, request_id = "request-1" }, {})
            session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                { data = { text = "second" }, request_id = "request-2" }, {})
            test.eq(#bus.ops, 1)
            test.eq(#ctx.held, 0)
            test.eq(#saved, 2)
            test.eq(#received, 2)
            test.eq(saved[2].metadata.input.state, "pending")
        end)

        it("rejects blocked input without persisting or acknowledging it", function()
            local ctx, bus, saved, received, errors = fixture()
            ctx.config.input_policy.while_running = "block"
            ctx.status = consts.STATUS.RUNNING
            ctx.turn_state.active = true
            bus.state = "running"
            session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                { data = { text = "blocked" }, request_id = "blocked-request" }, {})
            test.eq(#saved, 0)
            test.eq(#received, 0)
            test.eq((errors :: any)[1].id, "blocked-request")
            test.eq((errors :: any)[1].code, "INPUT_BLOCKED")
        end)

        it("keeps an admitted message durable when an earlier control fails", function()
            local ctx, bus, saved, received = fixture()
            bus:mount_op_handler(consts.OP_TYPE.CONTROL_ARTIFACTS, function()
                return nil, "control failed"
            end)
            bus:queue_op({ type = consts.OP_TYPE.CONTROL_ARTIFACTS })
            session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                { data = { text = "accepted" }, request_id = "accepted-request" }, {})
            local ok, err = bus:run()
            test.is_nil(ok)
            test.eq(err, "control failed")
            test.eq(#saved, 1)
            test.eq(saved[1].message_id, received[1].id)
        end)

        it("keeps the session idle after atomic admission fails", function()
            local ctx, bus, saved, received, errors = fixture()
            ctx.writer.admit_message = function() return nil, "disk unavailable" end
            local ok, err = session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                { data = { text = "not accepted" }, request_id = "failed-request" }, {})
            test.is_true(ok)
            test.is_nil(err)
            test.eq(ctx.status, consts.STATUS.IDLE)
            test.eq(#saved, 0)
            test.eq(#received, 0)
            test.eq(#bus.ops, 0)
            test.eq((errors :: any)[1].id, "failed-request")
            test.eq((errors :: any)[1].code, consts.ERROR_CODES.STORAGE_ERROR)
        end)

        it("retains pending input after Stop and rejects later sends", function()
            local ctx, bus, saved, received, errors = fixture()
            ctx.status = consts.STATUS.RUNNING
            ctx.turn_state.active = true
            bus.state = "running"
            session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                { data = { text = "accepted" }, request_id = "accepted" }, {})
            session.route_input(ctx, bus, consts.TOPICS.STOP, { request_id = "stop" }, {})
            session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                { data = { text = "too late" }, request_id = "late" }, {})
            test.eq(#saved, 1)
            test.eq(saved[1].metadata.input.state, "pending")
            test.eq(#received, 1)
            test.eq(bus.state, "draining_stop")
            test.eq((errors :: any)[1].id, "late")
        end)

        it("does not stop the active turn when Stop persistence fails", function()
            local ctx, bus, _, _, errors, successes = fixture()
            ctx.status = consts.STATUS.RUNNING
            ctx.turn_state.active = true
            bus.state = "running"
            ctx.writer.update_meta = function() return nil, "stop disk failure" end
            session.route_input(ctx, bus, consts.TOPICS.STOP, { request_id = "stop" }, {})
            test.eq((bus :: any).state, "running")
            test.is_nil(ctx.stop_requested)
            test.eq(#successes, 0)
            test.eq((errors :: any)[1].id, "stop")
        end)

        it("keeps a shared Stop identity valid when an earlier persistence attempt fails", function()
            local ctx, bus = fixture()
            ctx.status = consts.STATUS.RUNNING
            ctx.turn_state.active = true
            ctx.parent_pid = "supervisor"
            bus.state = "running"
            local signals = {} :: {any}
            mock("process.send", function(_, topic, payload)
                signals[#signals + 1] = { topic = topic, payload = payload }
                return true
            end)
            ctx.writer.update_meta = function() return nil, "disk failure" end
            session.route_input(ctx, bus, consts.TOPICS.STOP,
                { request_id = "first", stop_request_id = "shared", stop_supervised = true }, {})
            ctx.writer.update_meta = function() return true end
            session.route_input(ctx, bus, consts.TOPICS.STOP,
                { request_id = "second", stop_request_id = "shared", stop_supervised = true }, {})
            restore_mock("process.send")
            test.eq(#signals, 1)
            test.eq(signals[1].topic, consts.TOPICS.STOP_ESCALATION)
            test.eq(signals[1].payload.stop_request_id, "shared")
            test.eq(bus.state, "draining_stop")
        end)

        it("holds internal context input until the response boundary", function()
            local ctx, bus, saved, received = fixture()
            ctx.status = consts.STATUS.RUNNING
            ctx.turn_state.active = true
            bus.state = "running"
            session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                { data = { type = consts.MSG_TYPE.DEVELOPER, text = "internal context" } }, {})
            test.eq(#saved, 0)
            test.eq(#ctx.held, 1)
            local last_id, err = session.flush_held(ctx, true)
            test.is_nil(err)
            test.is_nil(last_id)
            test.eq(#saved, 1)
            test.eq(saved[1].type, consts.MSG_TYPE.DEVELOPER)
            test.eq(#received, 0)
        end)

        it("writes held input without an agent step on finish", function()
            local ctx, bus, saved = fixture()
            bus.state = "draining_finish"
            ctx.held = {{ message_id = "held-user", data = { text = "later" } }}
            local last_id, err = session.flush_held(ctx, false)
            test.is_nil(err)
            test.is_nil(last_id)
            test.eq(saved[1].message_id, "held-user")
            test.eq(#ctx.held, 0)
        end)

        it("keeps unwritten held input after a partial write failure", function()
            local ctx, _, saved = fixture()
            local errors = {} :: {any}
            ctx.upstream.message_error = function(_self, id, code, message)
                table.insert(errors, { id = id, code = code, message = message })
            end
            ctx.held = {
                { message_id = "held-1", data = { text = "one" } },
                { message_id = "held-2", data = { text = "two" } },
                { message_id = "held-3", data = { text = "three" } }
            }
            local original_add = ctx.writer.add_message
            ctx.writer.add_message = function(self, kind, content, metadata)
                if metadata.message_id == "held-2" then return nil, "disk unavailable" end
                return original_add(self, kind, content, metadata)
            end

            local _, err = session.flush_held(ctx, false)

            test.eq(err, "disk unavailable")
            test.eq(#saved, 1)
            test.eq(saved[1].message_id, "held-1")
            test.eq(#ctx.held, 2)
            test.eq((errors :: any)[1].id, "held-2")
            test.eq(errors[2].id, "held-3")
            ctx.writer.add_message = original_add
            local _, retry_err = session.flush_held(ctx, false)
            test.is_nil(retry_err)
            test.eq(#saved, 3)
            test.eq(saved[2].message_id, "held-2")
            test.eq(saved[3].message_id, "held-3")
        end)

        it("routes both stop forms and artifact references through the bus", function()
            local ctx, bus = fixture()
            bus.state = "running"
            session.route_input(ctx, bus, consts.TOPICS.COMMAND,
                { command = consts.COMMANDS.STOP }, {})
            test.eq(bus.state, "draining_stop")
            bus.state = "idle"
            session.route_input(ctx, bus, consts.TOPICS.COMMAND,
                { command = consts.COMMANDS.ARTIFACT, artifact_id = "artifact-1" }, {})
            test.eq(bus.ops[1].type, consts.OP_TYPE.REFERENCE_ARTIFACT)
        end)

        it("applies accepted agent and artifact commands after STOP settles the tool round", function()
            local ctx, bus, _, _, _, successes = fixture()
            local order = {}
            ctx.on_turn_end = function() table.insert(order, "settled") end
            ctx.queue_empty_callback = function()
                command_bus.stop(bus)
                return true
            end
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function()
                return { next_ops = {{ type = consts.OP_TYPE.PROCESS_TOOLS }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, function()
                session.route_input(ctx, bus, consts.TOPICS.COMMAND,
                    { command = consts.COMMANDS.AGENT, name = "agent:next", request_id = "agent-request" }, {})
                session.route_input(ctx, bus, consts.TOPICS.COMMAND,
                    { command = consts.COMMANDS.ARTIFACT, artifact_id = "artifact-1",
                        request_id = "artifact-request" }, {})
                command_bus.request_stop(bus, "stop-request")
                return { next_ops = {{ type = consts.OP_TYPE.AGENT_CONTINUE }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                table.insert(order, "continued")
                return { completed = true }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CHANGE, function(_ctx, op)
                table.insert(order, "agent-change")
                ctx.upstream:update_session({ request_id = op.request_id })
                return { completed = true }
            end)
            bus:mount_op_handler(consts.OP_TYPE.REFERENCE_ARTIFACT, function(_ctx, op)
                table.insert(order, "artifact-reference")
                return session.reference_artifact(ctx, op)
            end)
            bus:queue_op({ type = consts.OP_TYPE.AGENT_STEP, from_user = true, message_id = "user-1" })

            local ok, err = bus:run()

            test.is_nil(err)
            test.is_true(ok)
            test.eq(table.concat(order, ","), "settled,agent-change,artifact-reference")
            test.eq(successes[1], "agent-request")
            test.eq(successes[2], "artifact-request")
        end)

        it("keeps the session available after an invalid command and answers the next message", function()
            local ctx, bus, _, _, errors = fixture()
            local answered = nil :: string?
            ctx.upstream.send_message_update = function(_self, message_id, update_type, payload)
                if update_type == consts.UPSTREAM_TYPES.CONTENT then
                    answered = message_id
                    test.eq(payload.content, "answer")
                end
            end
            bus:mount_op_handler(consts.OP_TYPE.HANDLE_CONTEXT, control_handlers.handle_context_command)
            bus:mount_op_handler(consts.OP_TYPE.HANDLE_MESSAGE, message_handlers.handle_message)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_STEP, function(_ctx, op)
                test.eq((bus :: any).state, "running")
                ctx.upstream:send_message_update(op.message_id, consts.UPSTREAM_TYPES.CONTENT,
                    { content = "answer" })
                command_bus.stop(bus)
                return { completed = true }
            end)

            session.route_input(ctx, bus, consts.TOPICS.COMMAND, {
                command = consts.COMMANDS.CONTEXT, action = "invalid", request_id = "bad-context"
            }, {})
            session.route_input(ctx, bus, consts.TOPICS.MESSAGE, {
                data = { text = "next" }, request_id = "next-message"
            }, {})

            local ok, err = bus:run()

            test.is_nil(err)
            test.is_true(ok)
            test.eq(#errors, 1)
            test.eq((errors :: any)[1].id, "bad-context")
            test.eq((errors :: any)[1].code, "HANDLER_ERROR")
            test.not_nil(answered)
        end)

        it("replies with the finishing code when lifecycle rejects a command", function()
            local ctx, bus, _, _, errors = fixture()
            command_bus.stop(bus)

            local ok, err = session.route_input(ctx, bus, consts.TOPICS.COMMAND,
                { command = consts.COMMANDS.AGENT, name = "agent:next", request_id = "closed-request" }, {})

            test.is_nil(err)
            test.is_true(ok)
            test.eq(#errors, 1)
            test.eq((errors :: any)[1].id, "closed-request")
            test.eq((errors :: any)[1].code, "SESSION_FINISHING")
            test.contains((errors :: any)[1].message, "closed")
        end)

        it("reports artifact storage failure and keeps the command bus available", function()
            local ctx, bus, _, _, errors = fixture()
            ctx.writer.add_message = function() return nil, "disk unavailable" end
            local progressed = false
            bus:mount_op_handler(consts.OP_TYPE.REFERENCE_ARTIFACT, session.reference_artifact)
            bus:mount_op_handler("after_artifact_failure", function()
                progressed = true
                command_bus.stop(bus)
                return { completed = true }
            end)
            bus:queue_op({ type = consts.OP_TYPE.REFERENCE_ARTIFACT,
                artifact_id = "artifact-1", request_id = "artifact-request" })
            bus:queue_op({ type = "after_artifact_failure" })

            local ok, err = bus:run()

            test.is_nil(err)
            test.is_true(ok)
            test.is_true(progressed)
            test.eq(#errors, 1)
            test.eq((errors :: any)[1].id, "artifact-request")
            test.eq((errors :: any)[1].code, consts.ERROR_CODES.STORAGE_ERROR)
            test.eq((errors :: any)[1].message, "Failed to reference artifact")
        end)

        it("uses a server message id before starting user work", function()
            local ctx, _, saved = fixture()
            local result, err = message_handlers.handle_message(ctx, {
                message_id = "announced-id", data = { text = "hello" }, request_id = "request-1"
            })
            test.is_nil(err)
            test.eq(saved[1].message_id, "server-1")
            test.eq((result :: any).next_ops[1].message_id, saved[1].message_id)
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
