local test = require("test")
local consts = require("consts")
local handlers = require("message_handlers")
local prompt_builder = require("prompt_builder")
local session_handlers = require("session_handlers")

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
            add_response = function(_, content, metadata, calls)
                if ctx.write_error then return nil, nil, ctx.write_error end
                local id = ctx.writer:add_message(consts.MSG_TYPE.ASSISTANT, content, metadata)
                local call_ids = {}
                for _, call in ipairs(calls or {}) do
                    call_ids[call.id] = ctx.writer:add_message(call.type or consts.MSG_TYPE.FUNCTION,
                        call.arguments or "{}", {
                            call_id = call.id, function_name = call.name,
                            registry_id = call.registry_id, provider_metadata = call.provider_metadata,
                            status = consts.FUNC_STATUS.PENDING,
                        })
                end
                return id, call_ids, nil
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
            update_message_meta = function(_, id, updates)
                for _, row in ipairs(rows) do
                    if row.message_id == id then
                        row.metadata = row.metadata or {}
                        for key, value in pairs(updates) do row.metadata[key] = value end
                        return true
                    end
                end
                return nil, "Fixture message not found"
            end,
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

local function tool_boundary_fixture(): (table, {table}, {string}, {string}, table, table)
    local ctx, rows, events, applied = fixture({
        { message_id = "start", type = consts.MSG_TYPE.USER, data = "original task", metadata = {} },
        { message_id = "assistant", type = consts.MSG_TYPE.ASSISTANT, data = "working", metadata = {} },
    })
    local calls, ids, validated = {}, {}, {}
    for index = 1, 2 do
        local id = "call-" .. tostring(index)
        local message_id = "tool-" .. tostring(index)
        calls[index] = { id = id, name = "lookup", arguments = "{}", registry_id = "app:lookup" }
        ids[id] = message_id
        validated[id] = { valid = true, name = "lookup", args = {}, registry_id = "app:lookup", meta = {} }
        rows[#rows + 1] = { message_id = message_id, type = consts.MSG_TYPE.FUNCTION, data = "{}",
            metadata = { call_id = id, function_name = "lookup", status = consts.FUNC_STATUS.PENDING } }
    end
    ctx.status = "running"
    ctx.turn_state = { active = true, message_id = "start", steps = 1, repeated_calls = 0 }
    local context = {}
    ctx.reader.get_context = function(_, key) return context[key] end
    ctx.reader.get_full_context = function() return context end
    ctx.writer.set_context = function(_, key, value)
        test.eq(rows[3].metadata.status, consts.FUNC_STATUS.SUCCESS)
        test.eq(rows[4].metadata.status, consts.FUNC_STATUS.SUCCESS)
        context[key] = value
        events[#events + 1] = "control"
        return true
    end
    ctx.agent_ctx.get_current_agent = function() return ctx.current_agent end
    ctx.agent_ctx.switch_to_model = function(_, model)
        test.eq(rows[3].metadata.status, consts.FUNC_STATUS.SUCCESS)
        test.eq(rows[4].metadata.status, consts.FUNC_STATUS.SUCCESS)
        ctx.current_agent.model = model
        return true
    end
    local op = {
        message_id = "start", checkpoint_anchor_id = "assistant",
        tool_calls = calls, call_message_ids = ids, validated_tools = validated,
        agent = { id = ctx.current_agent.id, model = ctx.current_agent.model, agent_options = {} },
        behavior_round = true,
        behavior_controls = {{
            config = { model = "model:next" },
            context = { session = { set = { project = "steered" } } },
            memory = { compact = true },
        }},
        caller = {
            set_strategy = function() end,
            execute = function()
                local admitted, err = handlers.handle_message(ctx, {
                    data = { text = "use the new plan" }, request_id = "steer-between-tools",
                })
                test.is_nil(err)
                test.is_true(admitted.completed, "mid-tool input must not dispatch another turn")
                test.eq(rows[#rows].metadata.input.state, "pending")
                if ctx.stop_between_tools then ctx.stop_requested = true end
                return {
                    ["call-1"] = { result = "first outcome", tool_call = validated["call-1"] },
                    ["call-2"] = { result = "second outcome", tool_call = validated["call-2"] },
                }
            end,
        },
    }
    return ctx, rows, events, applied, op, context
end

local function define_tests()
    describe("steering lifecycle", function()
        it("commits idle admission before receipt and request acknowledgement", function()
            local ctx, rows, events = fixture()
            local result, err = handlers.handle_message(ctx, { data = { text = "start" }, request_id = "request-1" })
            test.is_nil(err)
            test.eq(events[1], "admit")
            test.eq(events[2], "received")
            test.eq(events[3], "session")
            test.is_nil(events[4])
            test.eq(ctx.status, "running")
            local admission = test.not_nil(ctx.admission, "admission metadata is captured")
            local acknowledgement = test.not_nil(ctx.ack, "receipt is captured")
            test.eq(admission.status, "running")
            test.eq(acknowledgement.data.message_id, rows[1].message_id)
            test.eq((result :: any).next_ops[1].request_id, "request-1")
        end)

        it("does not replace committed interaction with cached token metadata", function()
            local ctx = fixture()
            local durable: any = { interaction = { can_send = true, revision = 12 } }
            ctx.interaction = durable.interaction
            ctx.reader.state = function()
                return { meta = { interaction = { can_send = false, revision = 9 },
                    tokens = { total_tokens = 5 } }, config = ctx.config }
            end
            ctx.writer.update_meta = function(_, updates)
                for key, value in pairs(updates.meta or {}) do durable[key] = value end
                return true
            end
            ctx.current_agent.step = function()
                return { result = "answer", tool_calls = {}, tokens = { total_tokens = 3 } }
            end
            local result, err = handlers.agent_step(ctx, { message_id = "start", from_user = true })
            test.is_nil(err)
            test.not_nil(result)
            test.eq(durable.interaction.revision, 12)
            test.is_true(durable.interaction.can_send)
            test.eq(durable.tokens.total_tokens, 8)
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
            local acknowledgement = test.not_nil(ctx.ack, "pending input receipt is captured")
            test.eq(acknowledgement.request_id, "request-2")
        end)

        it("settles both tools before controls, compaction and exactly one steered model continuation", function()
            local ctx, rows, events, applied, op, context = tool_boundary_fixture()
            local result, err = handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(#result.next_ops, 2)
            local check, continuation = result.next_ops[1], result.next_ops[2]
            test.eq(check.type, consts.OP_TYPE.CHECK_BACKGROUND_TRIGGERS)
            test.eq(continuation.type, consts.OP_TYPE.AGENT_CONTINUE)
            test.eq(check.agent.model, "model:next", "requested compaction uses the committed configuration")
            test.is_true(context[consts.CONTEXT_KEYS.CHECKPOINT_REQUESTED])
            test.eq(rows[5].metadata.input.state, "pending", "compaction scheduling cannot consume steering")
            test.eq(rows[2].metadata.behavior_control_state, "applied")

            ctx.config.checkpoint = { function_id = "app:checkpoint" }
            local triggered, trigger_err = session_handlers.check_background_triggers(ctx, check)
            test.is_nil(trigger_err)
            test.eq(triggered.next_ops[1].agent.model, "model:next")
            local continued, continue_err = handlers.agent_continue(ctx, continuation)
            test.is_nil(continue_err)
            test.not_nil(continued)
            test.eq(#applied, 1)
            test.eq(rows[5].metadata.input.state, "applied")
            local results, steering, model_calls = {}, 0, 0
            for index, message in ipairs(ctx.prompt) do
                if message.function_call_id then results[message.function_call_id] = index end
                if message.role == "user" and message.content[1].text == "use the new plan" then
                    steering = steering + 1
                    test.not_nil(results["call-1"])
                    test.not_nil(results["call-2"])
                    test.lt(results["call-1"], index)
                    test.lt(results["call-2"], index)
                end
            end
            for _, event in ipairs(events) do if event == "model" then model_calls = model_calls + 1 end end
            test.eq(steering, 1)
            test.eq(model_calls, 1)
            local finished, finish_err = handlers.finish_turn(ctx)
            test.is_nil(finish_err)
            test.eq(#finished.next_ops, 0, "no duplicate dispatch after consuming steering")
        end)

        it("keeps mid-tool steering pending and cancels behavior proposals when Stop wins", function()
            local ctx, rows, events, _, op, context = tool_boundary_fixture()
            ctx.stop_between_tools = true
            local result, err = handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(#result.next_ops, 0)
            test.eq(rows[3].metadata.status, consts.FUNC_STATUS.SUCCESS)
            test.eq(rows[4].metadata.status, consts.FUNC_STATUS.SUCCESS)
            test.eq(rows[5].metadata.input.state, "pending")
            test.eq(rows[2].metadata.behavior_control_state, "cancelled")
            test.is_nil(context.project)
            test.is_nil(context[consts.CONTEXT_KEYS.CHECKPOINT_REQUESTED])
            test.eq(ctx.config.model, "model:test")
            for _, event in ipairs(events) do test.is_false(event == "model" or event == "control") end
        end)

        it("preserves accepted steering and compact across agent handoff until the next user turn", function()
            local ctx, rows, _, _, op, context = tool_boundary_fixture()
            op.behavior_controls[1].config = { agent = "agent:next" }
            ctx.agent_ctx.switch_to_agent = function(_, id)
                test.eq(rows[3].metadata.status, consts.FUNC_STATUS.SUCCESS)
                test.eq(rows[4].metadata.status, consts.FUNC_STATUS.SUCCESS)
                ctx.current_agent.id = id
                ctx.agent_ctx.current_model = "model:test"
                return true
            end
            local processed, err = handlers.process_tools(ctx, op)
            test.is_nil(err)
            test.eq(#processed.next_ops, 0, "handoff must not continue the old agent turn")
            test.eq(rows[5].metadata.input.state, "pending")
            test.is_true(context[consts.CONTEXT_KEYS.CHECKPOINT_REQUESTED])
            local finished, finish_err = handlers.finish_turn(ctx)
            test.is_nil(finish_err)
            test.eq(#finished.next_ops, 0)
            test.eq(ctx.status, "idle")
            local admitted, admit_err = handlers.handle_message(ctx, {
                data = { text = "resume" }, request_id = "next-turn",
            })
            test.is_nil(admit_err)
            local stepped, step_err = handlers.agent_step(ctx, admitted.next_ops[1])
            test.is_nil(step_err)
            test.not_nil(stepped)
            test.eq(ctx.config.agent_id, "agent:next")
            test.eq(rows[5].metadata.input.state, "applied")
            local occurrences = 0
            for _, message in ipairs(ctx.prompt) do
                if message.role == "user" then
                    -- The canonical prompt library coalesces adjacent user text.
                    for _, part in ipairs(message.content or {}) do
                        if type(part.text) == "string" then
                            for _ in string.gmatch(part.text, "use the new plan") do occurrences = occurrences + 1 end
                        end
                    end
                end
            end
            test.eq(occurrences, 1)
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

        it("cancels the persisted old-agent intent after handoff without duplicating it", function()
            local call = { message_id = "call-message", date = "2026-01-02T00:00:00Z",
                type = consts.MSG_TYPE.FUNCTION, data = "{}",
                metadata = { call_id = "old-call", status = consts.FUNC_STATUS.PENDING } }
            local ctx, rows = fixture({ call })
            ctx.turn_state = { active = true, handoff = true }
            local result, err = handlers.process_tools(ctx, {
                tool_calls = { { id = "old-call", name = "lookup", arguments = "{}" } },
                call_message_ids = { ["old-call"] = "call-message" },
                cancel_only = true,
            })
            test.is_nil(err)
            test.not_nil(result)
            test.eq(#result.next_ops, 0)
            test.eq(#rows, 1)
            test.eq(rows[1].type, consts.MSG_TYPE.FUNCTION)
            test.eq(rows[1].metadata.call_id, "old-call")
            test.eq(rows[1].metadata.status, consts.FUNC_STATUS.CANCELLED)
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
