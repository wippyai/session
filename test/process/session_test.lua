local test = require("test")
local consts = require("consts")
local session = require("session")
local command_bus = require("command_bus")
local message_handlers = require("message_handlers")
local control_handlers = require("control_handlers")

local function fixture()
    local saved = {} :: {any}
    local received = {} :: {any}
    local errors = {} :: {any}
    local successes = {} :: {any}
    local ctx = {
        session_id = "session-1", held = {},
        writer = {
            add_message = function(_self, msg_type, content, metadata)
                table.insert(saved, { type = msg_type, content = content,
                    message_id = metadata.message_id })
                return metadata.message_id
            end,
            update_status = function() return true end
        },
        upstream = {
            message_received = function(_self, id, text)
                table.insert(received, { id = id, text = text })
            end,
            send_message_update = function() end,
            command_success = function(_self, id)
                table.insert(successes, id)
            end,
            command_error = function(_self, id, code, message)
                table.insert(errors, { id = id, code = code, message = message })
            end,
            update_session = function() end
        }
    }
    return ctx, command_bus.new(ctx), saved, received, errors, successes
end

local function define_tests()
    describe("session input routing", function()
        it("announces held input immediately and writes it in arrival order at the boundary", function()
            local ctx, bus, saved, received = fixture()
            bus.state = "running"
            local first = { data = { text = "first" }, request_id = "request-1" }
            local second = { data = { text = "second" }, request_id = "request-2" }
            local ok, err = session.route_input(ctx, bus, consts.TOPICS.MESSAGE, first, {})
            test.is_nil(err)
            test.is_true(ok)
            session.route_input(ctx, bus, consts.TOPICS.MESSAGE, second, {})
            test.eq(#received, 2)
            test.eq(#saved, 0)
            test.eq(#ctx.held, 2)
            local last_id, flush_err, request_id = session.flush_held(ctx, true)
            test.is_nil(flush_err)
            test.eq(last_id, received[2].id)
            test.eq(request_id, "request-2")
            test.eq(saved[1].message_id, received[1].id)
            test.eq(saved[2].message_id, received[2].id)
            test.eq(saved[1].content, "first")
            test.eq(saved[2].content, "second")
        end)

        it("holds a second input while the first start is still queued", function()
            local ctx, bus, saved, received = fixture()
            session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                { data = { text = "first" }, request_id = "request-1" }, {})
            session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                { data = { text = "second" }, request_id = "request-2" }, {})
            test.eq(#bus.ops, 1)
            test.eq(#ctx.held, 1)
            test.eq(#saved, 0)
            test.eq(received[2].id, (ctx.held[1] :: any).message_id)
        end)

        it("rejects a full held buffer and still accepts STOP", function()
            local ctx, bus, saved, received, errors = fixture()
            bus.state = "running"
            for index = 1, 256 do
                ctx.held[index] = { message_id = tostring(index), data = { text = "held" } }
            end
            session.route_input(ctx, bus, consts.TOPICS.MESSAGE,
                { data = { text = "overflow" }, request_id = "overflow" }, {})
            test.eq(#ctx.held, 256)
            test.eq(#received, 0)
            test.eq(#saved, 0)
            test.eq(errors[1].id, "overflow")
            test.contains(errors[1].message, "full")
            local stopped, stop_err = session.route_input(ctx, bus, consts.TOPICS.STOP, {}, {})
            test.is_nil(stop_err)
            test.is_true(stopped)
            test.eq(bus.state, "draining_stop")
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
                bus:stop()
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
                bus:request_stop("stop-request")
                return { next_ops = {{ type = consts.OP_TYPE.AGENT_CONTINUE }} }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                table.insert(order, "continued")
                return { completed = true }
            end)
            bus:mount_op_handler(consts.OP_TYPE.AGENT_CHANGE, function(_ctx, op)
                table.insert(order, "agent-change")
                ctx.upstream:command_success(op.request_id)
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
                test.eq(bus.state, "running")
                ctx.upstream:send_message_update(op.message_id, consts.UPSTREAM_TYPES.CONTENT,
                    { content = "answer" })
                bus:stop()
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
            test.eq(errors[1].id, "bad-context")
            test.eq(errors[1].code, "HANDLER_ERROR")
            test.not_nil(answered)
        end)

        it("replies with the finishing code when lifecycle rejects a command", function()
            local ctx, bus, _, _, errors = fixture()
            bus:stop()

            local ok, err = session.route_input(ctx, bus, consts.TOPICS.COMMAND,
                { command = consts.COMMANDS.AGENT, name = "agent:next", request_id = "closed-request" }, {})

            test.is_nil(err)
            test.is_true(ok)
            test.eq(#errors, 1)
            test.eq(errors[1].id, "closed-request")
            test.eq(errors[1].code, "SESSION_FINISHING")
            test.contains(errors[1].message, "closed")
        end)

        it("reports artifact storage failure and keeps the command bus available", function()
            local ctx, bus, _, _, errors = fixture()
            ctx.writer.add_message = function() return nil, "disk unavailable" end
            local progressed = false
            bus:mount_op_handler(consts.OP_TYPE.REFERENCE_ARTIFACT, session.reference_artifact)
            bus:mount_op_handler("after_artifact_failure", function()
                progressed = true
                bus:stop()
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
            test.eq(errors[1].id, "artifact-request")
            test.eq(errors[1].code, consts.ERROR_CODES.STORAGE_ERROR)
            test.eq(errors[1].message, "Failed to reference artifact")
        end)

        it("writes a received id before starting user work", function()
            local ctx, _, saved = fixture()
            local result, err = message_handlers.handle_message(ctx, {
                message_id = "announced-id", data = { text = "hello" }, request_id = "request-1"
            })
            test.is_nil(err)
            test.eq(saved[1].message_id, "announced-id")
            test.eq(result.next_ops[1].message_id, "announced-id")
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
