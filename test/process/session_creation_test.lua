local test = require("test")
local consts = require("consts")
local session = require("session")
local command_bus = require("command_bus")
local agent_context = require("agent_context")
local message_handlers = require("message_handlers")
local context_repo = require("context_repo")
local session_repo = require("session_repo")
local message_repo = require("message_repo")
local security = require("security")
local uuid = require("uuid")
local wait_for_boot = require("wait_for_boot")
local writer = require("writer")

local function define_tests()
    describe("session creation operation order", function()
        for _, scenario in ipairs({
            { name = "applies both init switches before an immediate first message and answers once",
                model = "gpt-4o-mini", expected_model = "gpt-4o-mini",
                order = "agent_change,model_change,user_message" },
            { name = "applies the agent default before an immediate first message when no model is pinned",
                expected_model = "gpt-4o", order = "agent_change,user_message" },
        }) do
            it(scenario.name, function()
                wait_for_boot.run()
                local actor = security.actor()
                local session_id, context_id = uuid.v7(), uuid.v7()
                local _, context_err = context_repo.create(context_id, "primary", "{}")
                test.is_nil(context_err)
                local _, create_err = session_repo.create(session_id, actor:id(), context_id, "First turn", "test")
                test.is_nil(create_err)
                local _, config_err = session_repo.update_session_meta(session_id, { config = {
                    agent_id = "app.process:initial_agent", model = scenario.model,
                } })
                test.is_nil(config_err)

                local bus: any = nil
                local scheduled: any = nil
                local steps = 0
                local order = {}
                local sent = {} :: {any}
                local at_boundary: any = nil
                local init_during_turn = false
                local done: any = nil
                local inbox = { case_receive = function(self) return self end }
                local events = { case_receive = function(self) return self end }
                local bus_done = {
                    case_receive = function(self) return self end,
                    send = function(_, value) done = value; return true end,
                    receive = function() return done end,
                }
                local original_new = command_bus.new
                local original_agent_new = agent_context.new
                local original_writer_new = writer.new
                local original_channel_new = channel.new

                command_bus.new = function(ctx)
                    bus = original_new(ctx)
                    local process_operation = bus.process_operation
                    bus.process_operation = function(self, op)
                        if op.init then
                            order[#order + 1] = op.type
                            init_during_turn = init_during_turn or ctx.turn_state.active == true
                        end
                        return process_operation(self, op)
                    end
                    local end_turn = bus.end_turn
                    bus.end_turn = function(self)
                        local state = ctx.turn_state
                        at_boundary = { failed = state.failed, handoff = state.handoff }
                        if message_handlers.finish_turn then
                            local _, err = message_handlers.finish_turn(ctx)
                            if err then return nil, err end
                        end
                        return end_turn(self)
                    end
                    return bus
                end
                writer.new = function(id)
                    local session_writer, err = original_writer_new(id)
                    if session_writer then
                        for _, method in ipairs({ "admit_message", "add_message" }) do
                            local write = session_writer[method]
                            if write then
                                session_writer[method] = function(self, kind, ...)
                                    if kind == consts.MSG_TYPE.USER then order[#order + 1] = "user_message" end
                                    return write(self, kind, ...)
                                end
                            end
                        end
                    end
                    return session_writer, err
                end
                -- Compile and switch real agents/models; only the provider response is scripted.
                agent_context.new = function(options)
                    local ctx = original_agent_new(options)
                    local load_agent = ctx.load_agent
                    ctx.load_agent = function(self, id, opts)
                        local agent, err = load_agent(self, id, opts)
                        if agent then
                            agent.step = function()
                                steps = steps + 1
                                test.eq(self.current_model, scenario.expected_model)
                                return { result = "first reply", tool_calls = {} }
                            end
                        end
                        return agent, err
                    end
                    return ctx
                end
                mock("process.registry", { register = function() return true end })
                mock("process.inbox", function() return inbox end)
                mock("process.events", function() return events end)
                mock("process.send", function(_, topic, payload)
                    sent[#sent + 1] = { topic = topic, payload = payload }
                    if message_handlers.finish_turn and payload.type == consts.UPSTREAM_TYPES.RECEIVED then
                        local page: any = message_repo.list_by_session(session_id)
                        test.eq(page.messages[#page.messages].type, consts.MSG_TYPE.USER, "receipt follows persistence")
                    end
                    return true
                end)
                mock("channel.new", function(capacity)
                    if capacity == nil then return bus_done end
                    return original_channel_new(capacity)
                end)
                -- Delay the bus until ingress has admitted the message sent immediately on open.
                mock("coroutine.spawn", function(fn) scheduled = fn end)
                local selection = 0
                mock("channel.select", function()
                    selection = selection + 1
                    if selection == 1 then
                        return { ok = true, channel = inbox, value = {
                            topic = function() return consts.TOPICS.MESSAGE end,
                            payload = function() return { data = function()
                                return { data = { text = "first" }, request_id = "first" }
                            end } end,
                        } }
                    elseif selection == 2 then
                        -- Run the real bus/handlers to the response boundary without another inbox coroutine.
                        bus.context.turn_boundary_callback = function()
                            return bus:end_turn()
                        end
                        bus.context.queue_empty_callback = function() bus:stop(); return true end
                        scheduled()
                        return { ok = true, channel = events, value = { kind = process.event.CANCEL } }
                    end
                    return { ok = true, channel = bus_done, value = done }
                end)

                local ok, result = pcall(session.run, {
                    session_id = session_id, user_id = actor:id(), parent_pid = "first-turn-parent", create = true,
                })
                restore_mock("channel.select")
                restore_mock("coroutine.spawn")
                restore_mock("channel.new")
                restore_mock("process.send")
                restore_mock("process.events")
                restore_mock("process.inbox")
                restore_mock("process.registry")
                command_bus.new = original_new
                agent_context.new = original_agent_new
                writer.new = original_writer_new

                local page, history_err = message_repo.list_by_session(session_id)
                session_repo.delete(session_id)
                context_repo.delete(context_id)

                test.is_true(ok, tostring(result))
                test.is_nil(done and done.error)
                test.is_nil(history_err)
                test.eq(steps, 1, "the first message must produce one assistant turn")
                test.eq(table.concat(order, ","), scenario.order)
                test.is_false(init_during_turn, "init must precede user admission")
                test.not_nil(at_boundary)
                test.is_nil(at_boundary.failed)
                test.is_nil(at_boundary.handoff)
                local assistants = {}
                for _, row in ipairs(page.messages) do
                    if row.type == consts.MSG_TYPE.ASSISTANT then assistants[#assistants + 1] = row end
                end
                test.eq(#assistants, 1)
                test.eq(assistants[1].data, "first reply")
                test.eq(assistants[1].metadata.model, scenario.expected_model)
                local replies = 0
                for _, event in ipairs(sent) do
                    if event.payload.type == consts.UPSTREAM_TYPES.CONTENT then
                        replies = replies + 1
                        test.eq(event.payload.content, "first reply")
                    end
                    if message_handlers.finish_turn and event.payload.status == consts.STATUS.IDLE
                        and event.payload.agent then
                        test.eq(event.payload.model, scenario.expected_model)
                    end
                end
                test.eq(replies, 1, "the first reply must reach the client")
                -- The separate historical run checks turn behavior; #44's event ordering is tested on master.
                if message_handlers.finish_turn then
                    test.eq(sent[1].topic, consts.TOPICS.SESSION_OPENED)
                end
            end)
        end
    end)
end

return { run_tests = test.run_cases(define_tests) }
