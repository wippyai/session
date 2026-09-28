local test = require("test")
local consts = require("consts")
local handlers = require("message_handlers")
local prompt_builder = require("prompt_builder")

local function pending(id, date)
    return { message_id = id, date = date or "2026-01-01T00:00:00Z", type = consts.MSG_TYPE.USER,
        data = id, metadata = { input = { state = "pending" } } }
end

local function fixture(rows)
    rows = rows or {}
    local events, applied = {}, {}
    local ctx: any
    local agent = { id = "agent:test", model = "model:test", agent_options = {
        session_input = { while_running = "steer", can_manage = true },
    } }
    agent.step = function(_, builder)
        ctx.prompt = builder:get_messages()
        events[#events + 1] = "model"
        if ctx.provider_error then return nil, ctx.provider_error end
        return { result = "answer", tool_calls = {} }
    end
    local query = { from_checkpoint = function(self) return self end, all = function() return rows end }
    ctx = {
        session_id = "s1", user_id = "u1", status = "idle", current_agent = agent,
        config = { agent_id = agent.id, model = agent.model }, lifecycle_state = {},
        reader = {
            list_all_messages = function() return rows end,
            list_pending_inputs = function()
                local result = {}
                for _, row in ipairs(rows) do
                    local input = row.metadata and row.metadata.input
                    if input and input.state == "pending" then result[#result + 1] = row end
                end
                return result
            end,
            messages = function() return query end,
            contexts = function() return { all = function() return {} end } end,
            state = function() return { meta = {}, config = ctx.config } end,
            get_context = function() return nil end,
            get_full_context = function()
                if ctx.context_error then return nil, ctx.context_error end
                return {}
            end,
            reset = function() return true end,
        },
        agent_ctx = { load_agent = function()
            if ctx.load_error then return nil, ctx.load_error end
            return agent
        end },
        writer = {
            add_message = function(_, kind, text, meta)
                if ctx.write_error then return nil, ctx.write_error end
                local id = "server-" .. tostring(#rows + 1)
                rows[#rows + 1] = { message_id = id, date = "2026-01-02T00:00:00Z",
                    type = kind, data = text, metadata = meta or {} }
                events[#events + 1] = "write"
                return id
            end,
            admit_message = function(_, kind, text, meta, updates)
                if ctx.admit_error then return nil, ctx.admit_error end
                local id = "server-" .. tostring(#rows + 1)
                rows[#rows + 1] = { message_id = id, date = "2026-01-02T00:00:00Z",
                    type = kind, data = text, metadata = meta or {} }
                ctx.admission = updates
                events[#events + 1] = "admit"
                return id
            end,
            update_meta = function(_, update)
                if ctx.meta_error then return nil, ctx.meta_error end
                ctx.last_meta = update
                return true
            end,
            apply_inputs = function(_, updates, expected_revision)
                if ctx.apply_error then return nil, ctx.apply_error end
                ctx.expected_revision = expected_revision
                for _, update in ipairs(updates) do
                    applied[#applied + 1] = update.message_id
                    for _, row in ipairs(rows) do
                        if row.message_id == update.message_id then
                            for key, value in pairs(update.metadata) do row.metadata[key] = value end
                        end
                    end
                end
                if ctx.stop_during_apply then
                    for _, update in ipairs(updates) do
                        for _, row in ipairs(rows) do
                            if row.message_id == update.message_id then row.metadata.input = { state = "pending" } end
                        end
                    end
                    ctx.stop_requested = true
                    ctx.stop_commit_channel = { receive = function() return { success = true } end }
                    events[#events + 1] = "stop"
                elseif ctx.stop_failure_during_apply then
                    ctx.stop_commit_channel = { receive = function() return { success = false } end }
                    events[#events + 1] = "stop-error"
                end
                if ctx.handoff_during_apply then ctx.turn_state.handoff = true end
                return true
            end,
            update_message_meta = function() return true end,
        },
        upstream = {
            message_received = function(_, message_id, text, files, input, request_id)
                ctx.ack = { request_id = request_id, data = { message_id = message_id, text = text, file_uuids = files, input = input } }
                events[#events + 1] = "received"
            end,
            command_error = function(_, _, code) ctx.rejection = code end,
            send_message_update = function(_, _, kind) events[#events + 1] = kind end,
            update_session = function() events[#events + 1] = "session" end,
            session_error = function() end, message_error = function() end,
            response_beginning = function() events[#events + 1] = "response" end,
            invalidate_message = function() end,
        },
    }
    return ctx, rows, events, applied
end

local function define_tests()
    describe("steering lifecycle", function()
        it("commits idle admission before receipt and request acknowledgement", function()
            local ctx, rows, events = fixture()
            local result, err = handlers.handle_message(ctx, { data = { text = "start" }, request_id = "request-1" })
            test.is_nil(err)
            test.eq(events[1], "admit")
            test.eq(events[2], "session")
            test.eq(events[3], "received")
            test.is_nil(events[4])
            test.eq(ctx.status, "running")
            test.eq(ctx.admission.status, "running")
            test.eq(ctx.ack.data.message_id, rows[1].message_id)
            test.is_nil((result :: any).next_ops[1].request_id)
        end)

        it("does not acknowledge or mutate state when admission fails", function()
            local ctx, rows, events = fixture()
            ctx.admit_error = "disk failure"
            local result, err = handlers.handle_message(ctx, { data = { text = "start" }, request_id = "request-1" })
            test.is_nil(result)
            test.eq(err, "disk failure")
            test.is_nil(ctx.turn_state)
            test.eq(ctx.status, "idle")
            test.eq(#rows, 0)
            test.eq(#events, 0)
        end)

        it("stores only pending metadata for input during a running turn", function()
            local ctx, rows = fixture()
            ctx.status = "running"
            ctx.turn_state = { active = true, message_id = "start" }
            local result, err = handlers.handle_message(ctx, { data = { text = "steer" }, request_id = "request-2" })
            test.is_nil(err)
            test.is_true(result.completed)
            test.eq(rows[1].metadata.input.state, "pending")
            test.is_nil(rows[1].metadata.input.after_message_id)
            test.eq(ctx.ack.request_id, "request-2")
        end)

        it("orders one applied batch by date then server message ID", function()
            local ctx, rows, _, applied = fixture({
                pending("z-later", "2026-01-02T00:00:00Z"),
                pending("b-first", "2026-01-01T00:00:00Z"),
                pending("a-first", "2026-01-01T00:00:00Z"),
                { message_id = "anchor", date = "2026-01-03T00:00:00Z", type = consts.MSG_TYPE.ASSISTANT,
                    data = "done", metadata = {} },
            })
            local count, err = handlers.apply_pending_inputs(ctx)
            test.is_nil(err)
            test.eq(count, 3)
            test.eq(applied[1], "a-first")
            test.eq(applied[2], "b-first")
            test.eq(applied[3], "z-later")
            test.eq(rows[1].metadata.input.after_message_id, "anchor")
        end)

        it("leaves the complete pending batch unchanged after transaction failure", function()
            local ctx, rows, events = fixture({ pending("p1"), pending("p2") })
            ctx.apply_error = "transaction failure"
            local count, err = handlers.apply_pending_inputs(ctx)
            test.is_nil(count)
            test.eq(err, "transaction failure")
            test.eq(rows[1].metadata.input.state, "pending")
            test.eq(rows[2].metadata.input.state, "pending")
            test.eq(#events, 0)
        end)

        it("fails visibly and preserves malformed steering metadata", function()
            local bad = { message_id = "bad", date = "2026-01-01", type = consts.MSG_TYPE.USER,
                data = "bad", metadata = { input = { state = "unknown" } } }
            local ctx, rows = fixture({ bad })
            local count, err = handlers.apply_pending_inputs(ctx)
            test.is_nil(count)
            test.not_nil(err)
            test.contains(err, "Malformed steering metadata")
            test.eq(rows[1].metadata.input.state, "unknown")
            local builder, build_err = prompt_builder.build(rows, {}, {}, {})
            test.is_nil(builder)
            test.not_nil(build_err)
            test.contains(build_err, "Malformed steering metadata")
        end)

        it("puts an applied input with a missing anchor at the first prompt boundary", function()
            local builder, err = prompt_builder.build({
                { message_id = "steer", date = "2026-01-02", type = consts.MSG_TYPE.USER,
                    data = "steer now", metadata = { input = { state = "applied", after_message_id = "pruned" } } },
                { message_id = "visible", date = "2026-01-03", type = consts.MSG_TYPE.ASSISTANT,
                    data = "visible", metadata = {} },
            }, {}, {}, { cache_markers = false })
            test.is_nil(err)
            test.not_nil(builder)
            local prompt = builder:get_messages()
            test.not_nil(prompt[1])
            test.eq(prompt[1].role, "user")
            test.eq(prompt[1].content[1].text, "steer now")
        end)

        it("schedules one continuation only while pending input remains", function()
            local ctx = fixture({ pending("p") })
            ctx.turn_state = { active = true, message_id = "original" }
            ctx.status = "running"
            local result = handlers.finish_turn(ctx)
            test.eq(#result.next_ops, 1)
            test.eq(result.next_ops[1].message_id, "original")
            test.is_false(result.next_ops[1].from_user)
        end)

        it("Stop retains pending input and blocks provider dispatch", function()
            local ctx, rows, events = fixture({ pending("retained") })
            ctx.turn_state = { active = true, message_id = "old", input_policy = { while_running = "block" } }
            ctx.stop_requested, ctx.status = true, "running"
            local result, err = handlers.agent_step(ctx, { message_id = "old" })
            test.is_nil(err)
            test.eq(#result.next_ops, 0)
            test.eq(rows[1].metadata.input.state, "pending")
            test.eq(#events, 0)
            result, err = handlers.finish_turn(ctx)
            test.is_nil(err)
            test.eq(rows[1].metadata.input.state, "pending")
            test.eq(ctx.status, "idle")
        end)

        it("rejects a later send when Stop committed first", function()
            local ctx, rows = fixture()
            ctx.status = "running"
            ctx.stop_requested = true
            ctx.turn_state = { active = true, message_id = "old" }

            local result, err = handlers.handle_message(ctx, {
                data = { text = "too late" }, request_id = "send-after-stop",
            })

            test.is_nil(err)
            test.not_nil(result)
            test.eq(#rows, 0)
            test.eq(ctx.rejection, "INPUT_BLOCKED")
        end)

        it("keeps pending input on agent, context, prompt, and lifecycle failures", function()
            local ctx, rows = fixture({ pending("p") })
            ctx.load_error = "missing agent"
            local result, err = handlers.agent_step(ctx, { message_id = "turn" })
            test.is_nil(result)
            test.not_nil(err)
            ctx.load_error = nil
            ctx.context_error = "context unavailable"
            result, err = handlers.agent_step(ctx, { message_id = "turn" })
            test.is_nil(result)
            test.not_nil(err)
            test.contains(err, "context unavailable")
            ctx.context_error = nil
            local original_builder = handlers._prompt_builder
            handlers._prompt_builder = { from_session = function() return nil, "prompt unavailable" end }
            result, err = handlers.agent_step(ctx, { message_id = "turn" })
            handlers._prompt_builder = original_builder
            test.is_nil(result)
            test.contains(err, "prompt unavailable")
            local original_lifecycle = handlers._lifecycle_runtime
            ctx.current_agent.bindings = { lifecycle = { "binding" } }
            handlers._lifecycle_runtime = { apply = function() return nil, "lifecycle unavailable" end }
            result, err = handlers.agent_step(ctx, { message_id = "turn" })
            handlers._lifecycle_runtime = original_lifecycle
            test.is_nil(result)
            test.contains(err, "lifecycle unavailable")
            test.eq(rows[1].metadata.input.state, "pending")
        end)

        it("keeps input applied after a provider failure", function()
            local ctx, rows = fixture({ pending("p") })
            ctx.status = "running"
            ctx.turn_state = { active = true, message_id = "turn", steps = 0, repeated_calls = 0 }
            ctx.provider_error = "provider failed"
            local result, err = handlers.agent_step(ctx, { message_id = "turn" })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err, "provider failed")
            test.eq(rows[1].metadata.input.state, "applied")
        end)

        it("restores the full pending batch when Stop commits during apply", function()
            local ctx, rows, events = fixture({ pending("p1"), pending("p2") })
            ctx.status = "running"
            ctx.turn_state = { active = true, message_id = "turn", steps = 0, repeated_calls = 0 }
            ctx.stop_during_apply = true
            local result, err = handlers.agent_step(ctx, { message_id = "turn" })
            test.is_nil(err)
            test.not_nil(result)
            test.eq(rows[1].metadata.input.state, "pending")
            test.eq(rows[2].metadata.input.state, "pending")
            test.eq(events[#events], "stop")
            for _, event in ipairs(events) do
                test.is_false(event == "update")
                test.is_false(event == "model")
            end
        end)

        it("continues with an applied batch when a racing Stop transaction fails", function()
            local ctx, rows, events = fixture({ pending("p") })
            ctx.status = "running"
            ctx.turn_state = { active = true, message_id = "turn", steps = 0, repeated_calls = 0 }
            ctx.stop_failure_during_apply = true
            local result, err = handlers.agent_step(ctx, { message_id = "turn" })
            test.is_nil(err)
            test.not_nil(result)
            test.eq(rows[1].metadata.input.state, "applied")
            test.eq(ctx.expected_revision, 0)
            test.contains(table.concat(events, ","), "update")
            test.contains(table.concat(events, ","), "model")
        end)

        it("keeps input pending when handoff already owns the boundary", function()
            local ctx, rows, events = fixture({ pending("p") })
            ctx.status = "running"
            ctx.turn_state = { active = true, message_id = "turn", steps = 0, repeated_calls = 0,
                handoff = true, failed = true }
            local result, err = handlers.agent_step(ctx, { message_id = "turn" })
            test.is_nil(err)
            test.not_nil(result)
            test.eq(rows[1].metadata.input.state, "pending")
            test.eq(#events, 0)
        end)

        it("cancels queued old-agent tools after handoff", function()
            local ctx, rows = fixture()
            ctx.turn_state = { active = true, handoff = true }
            local result, err = handlers.process_tools(ctx, {
                tool_calls = { { id = "old-call", name = "lookup", arguments = "{}" } },
            })
            test.is_nil(err)
            test.not_nil(result)
            test.eq(#result.next_ops, 0)
            test.eq(rows[1].type, consts.MSG_TYPE.PRIVATE_FUNCTION)
            test.eq(rows[1].metadata.call_id, "old-call")
            test.eq(rows[1].metadata.status, consts.FUNC_STATUS.ERROR)
        end)

        it("does not commit completion state when its write fails", function()
            local ctx = fixture()
            ctx.status = "running"
            ctx.turn_state = { active = true, input_policy = { while_running = "steer" }, failed = true }
            ctx.meta_error = "disk failure"
            local result, err = handlers.finish_turn(ctx)
            test.is_nil(result)
            test.eq(err, "disk failure")
            test.eq(ctx.status, "running")
            test.is_true(ctx.turn_state.active)
            test.eq(ctx.turn_state.input_policy.while_running, "steer")
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
