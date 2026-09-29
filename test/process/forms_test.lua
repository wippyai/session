local test = require("test")
local json = require("json")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
local security = require("security")
local consts = require("consts")
local command_bus = require("command_bus")
local message_handlers = require("message_handlers")
local session = require("session")
local state_service = require("state_service")
local prompt_builder = require("prompt_builder")
local artifact_repo = require("artifact_repo")
local message_repo = require("message_repo")
local context_repo = require("context_repo")
local session_repo = require("session_repo")
local reader = require("reader")
local writer = require("writer")
local wait_for_boot = require("wait_for_boot")

-- Session forms inside the session process, on the real database: creation
-- through the ask_user tool and the `_control.forms` effect in
-- process_tools, the one-form-per-turn guard, ending the turn, the failure
-- row rewrite (F05), and admission of accepted answers (idle, during a turn,
-- and by the startup/end_turn scan).

local TOOL_ID = "wippy.session.forms:ask_user_tool"

local DEFINITION = {
    title = "Delivery preference",
    fields = {
        { id = "delivery", type = "choice", label = "How should the parcel be delivered?",
            required = true, options = { "Courier", "Pickup point", "Locker" } },
    },
}

local function define_tests()
    describe("session forms in the session process", function()
        local user_id = ""
        local created = {} :: {any}
        local original_lookup = nil

        before_all(function()
            wait_for_boot.run()
            local actor = security.actor()
            user_id = actor and actor:id() or ""
            original_lookup = state_service._lookup_session
            -- No session process runs in these tests; the wake-up is a no-op.
            state_service._lookup_session = function() return nil end
        end)

        after_all(function()
            state_service._lookup_session = original_lookup
            local db, err = sql.get(consts.get_db_resource())
            if err then error(err) end
            for _, item in ipairs(created) do
                db:execute("DELETE FROM artifacts WHERE session_id = $1", { item.session_id })
                db:execute("DELETE FROM messages WHERE session_id = $1", { item.session_id })
                db:execute("DELETE FROM sessions WHERE session_id = $1", { item.session_id })
                db:execute("DELETE FROM contexts WHERE context_id = $1", { item.context_id })
            end
            db:release()
        end)

        local function new_ctx()
            local session_id, context_id = uuid.v7(), uuid.v7()
            local _, context_err = context_repo.create(context_id, "primary", "{}")
            test.is_nil(context_err)
            local _, session_err = session_repo.create(session_id, user_id, context_id, "Forms", "test")
            test.is_nil(session_err)
            table.insert(created, { session_id = session_id, context_id = context_id })
            local session_writer, writer_err = writer.new(session_id)
            test.is_nil(writer_err)
            local session_reader, reader_err = reader.open(session_id)
            test.is_nil(reader_err)
            local events = { received = {} :: {any}, updates = {} :: {any}, artifacts = {} :: {any} }
            local ctx = {
                session_id = session_id,
                user_id = user_id,
                writer = session_writer,
                reader = session_reader,
                config = {},
                held = {},
                pending_answers = {},
                turn_state = { id = "turn-" .. uuid.v7(), steps = 0, repeated_calls = 0 },
                upstream = {
                    send_message_update = function(_self, id, kind, payload)
                        if kind == "artifact" then table.insert(events.artifacts, payload) end
                    end,
                    update_session = function(_self, changes) table.insert(events.updates, changes) end,
                    message_received = function(_self, id, text) table.insert(events.received, { id = id, text = text }) end,
                    message_error = function() end,
                    command_error = function() end,
                    session_error = function() end,
                },
            }
            return ctx, events
        end

        local function rows_of(ctx, msg_type)
            local page: any = message_repo.list_by_session(ctx.session_id, 500)
            local out = {}
            for _, row in ipairs(page.messages) do
                if row.type == msg_type then table.insert(out, row) end
            end
            return out
        end

        -- One ask_user call through the real tool and process_tools.
        local function ask(ctx, args)
            local call_id = "call-" .. uuid.v7()
            local _, ids: any, store_err = ctx.writer:add_response("", {}, {
                { id = call_id, name = "ask_user", arguments = args, registry_id = TOOL_ID,
                    type = consts.MSG_TYPE.FUNCTION },
            })
            test.is_nil(store_err)
            local tool_result, tool_err = funcs.new():call(TOOL_ID, args)
            local caller = {
                set_strategy = function() end,
                execute = function(_self, _context, tools)
                    if tool_err then
                        return { [call_id] = { error = tool_err, tool_call = tools[call_id] } }
                    end
                    return { [call_id] = { result = tool_result, tool_call = tools[call_id] } }
                end,
            }
            local validated = { [call_id] = { valid = true, name = "ask_user", args = args, registry_id = TOOL_ID } }
            local result, err = message_handlers.process_tools(ctx, {
                tool_calls = { { id = call_id, name = "ask_user", registry_id = TOOL_ID, arguments = args } },
                call_message_ids = ids, caller = caller, validated_tools = validated,
                message_id = "user-message", agent = { id = "agent:forms" },
            })
            local call_rows: any = ids
            return result, err, call_id, call_rows
        end

        local function has_continue(result)
            for _, op in ipairs((result and result.next_ops) or {}) do
                if op.type == consts.OP_TYPE.AGENT_CONTINUE then return true end
            end
            return false
        end

        local function form_id_of(ctx)
            local artifacts: any = artifact_repo.list_by_session(ctx.session_id)
            test.eq(#artifacts, 1)
            return artifacts[1].artifact_id
        end

        local function submit(artifact_id, answers)
            local status, body = state_service.submit(user_id, artifact_id, json.encode({
                form_version = 1, request_id = uuid.v7(), expected_content_version = 1,
                answers = answers or { delivery = "Courier" },
            }))
            test.eq(status, 200, body)
            return json.decode(tostring(body))
        end

        describe("creation", function()
            it("stores the form bound to its origin and ends the turn", function()
                local ctx, events = new_ctx()
                local result, err, call_id, ids = ask(ctx, DEFINITION)
                test.is_nil(err)
                test.is_false(has_continue(result), "a created form ends the turn")
                test.is_true(result.completed)

                local artifact: any = artifact_repo.get(form_id_of(ctx))
                test.eq(artifact.kind, "inline")
                test.eq(artifact.title, "Delivery preference")
                test.eq(artifact.content_version, 1)
                test.eq(artifact.meta.display_type, "inline")
                test.eq(artifact.meta.content_type, "application/json")
                test.eq(artifact.meta.status, "active")
                local content = json.decode(tostring(artifact.content))
                test.eq(content.specification, "wippy-component-tag-1.0")
                test.eq(content.wippy.tagName, "wippy-form")
                test.eq(content.props["form-version"], 1)
                test.eq(content.props.state, "active")
                test.eq(content.props.definition.fields[1].options[1].value, "Courier")

                local origin = artifact.meta.session_form.origin
                test.eq(artifact.meta.session_form.version, 1)
                test.is_nil(artifact.meta.session_form.submission)
                test.eq(origin.turn_id, ctx.turn_state.id)
                test.eq(origin.call_id, call_id)
                test.eq(origin.tool_message_id, (ids :: any)[call_id])

                local artifact_rows = rows_of(ctx, consts.MSG_TYPE.ARTIFACT)
                test.eq(#artifact_rows, 1)
                test.eq(artifact_rows[1].metadata.artifact_id, artifact.artifact_id)
                test.eq(origin.created_cursor, artifact_rows[1].date)
                test.eq(#events.artifacts, 1)

                local call_row = message_repo.get((ids :: any)[call_id])
                test.eq(call_row.metadata.status, consts.FUNC_STATUS.SUCCESS)
                test.eq(call_row.metadata.result.message, 'Form "Delivery preference" was created as '
                    .. artifact.artifact_id .. ". Its answer will arrive as a user message.")
            end)

            it("settles the tool call only after the form is stored", function()
                -- Records write order on the writer; reading the table here
                -- would block on the writer's own open transaction.
                local ctx = new_ctx()
                local session_writer: any = ctx.writer
                local original_store = session_writer.create_artifact
                local original_meta = session_writer.update_message_meta
                local order = {}
                session_writer.create_artifact = function(...)
                    table.insert(order, "form stored")
                    return original_store(...)
                end
                session_writer.update_message_meta = function(self, id, meta)
                    if type(meta) == "table" and meta.status == consts.FUNC_STATUS.SUCCESS then
                        table.insert(order, "call settled")
                    end
                    return original_meta(self, id, meta)
                end
                local _, err = ask(ctx, DEFINITION)
                session_writer.create_artifact = original_store
                session_writer.update_message_meta = original_meta
                test.is_nil(err)
                test.eq(table.concat(order, ", "), "form stored, call settled")
            end)

            it("returns a tool error for an invalid definition and stores nothing", function()
                local ctx = new_ctx()
                local result, err, call_id, ids = ask(ctx, { title = "Broken", fields = {
                    { id = "a", type = "choice", label = "A", options = { "x", "x" } },
                } })
                test.is_nil(err)
                test.is_true(has_continue(result), "the agent gets a step to correct the definition")
                local call_row = message_repo.get((ids :: any)[call_id])
                test.eq(call_row.metadata.status, consts.FUNC_STATUS.ERROR)
                test.contains(tostring(call_row.metadata.result), "fields[0].options[1]: duplicate_option")
                test.eq(#artifact_repo.list_by_session(ctx.session_id), 0)
                test.eq(#rows_of(ctx, consts.MSG_TYPE.ARTIFACT), 0)
            end)

            it("allows one form per turn and marks the refused call as an error", function()
                local ctx = new_ctx()
                local _, first_err = ask(ctx, DEFINITION)
                test.is_nil(first_err)
                local result, err, call_id, ids = ask(ctx, DEFINITION)
                test.is_nil(err, "a refused form does not fail the turn")
                test.not_nil(result)
                test.is_true(has_continue(result), "the agent sees the tool error and the turn goes on")
                test.eq(#artifact_repo.list_by_session(ctx.session_id), 1)
                local call_row = message_repo.get((ids :: any)[call_id])
                test.eq(call_row.metadata.status, consts.FUNC_STATUS.ERROR)
                test.contains(tostring(call_row.metadata.result), "one_form_per_turn")

                -- A later turn may ask again.
                ctx.turn_state.id = "turn-" .. uuid.v7()
                local _, later_err = ask(ctx, DEFINITION)
                test.is_nil(later_err)
                test.eq(#artifact_repo.list_by_session(ctx.session_id), 2)
            end)

            it("creates one form from two calls in one batch, refuses the second and ends the turn", function()
                local ctx = new_ctx()
                local first_id, second_id = "call-" .. uuid.v7(), "call-" .. uuid.v7()
                local calls = {}
                for _, id in ipairs({ first_id, second_id }) do
                    table.insert(calls, { id = id, name = "ask_user", arguments = DEFINITION,
                        registry_id = TOOL_ID, type = consts.MSG_TYPE.FUNCTION })
                end
                local _, ids: any, store_err = ctx.writer:add_response("", {}, calls)
                test.is_nil(store_err)
                local executor = funcs.new()
                local caller = {
                    set_strategy = function() end,
                    execute = function(_self, _context, tools)
                        local out = {}
                        for _, id in ipairs({ first_id, second_id }) do
                            out[id] = { result = executor:call(TOOL_ID, DEFINITION), tool_call = tools[id] }
                        end
                        return out
                    end,
                }
                local validated = {}
                for _, id in ipairs({ first_id, second_id }) do
                    validated[id] = { valid = true, name = "ask_user", args = DEFINITION, registry_id = TOOL_ID }
                end

                local result, err = message_handlers.process_tools(ctx, {
                    tool_calls = calls, call_message_ids = ids, caller = caller, validated_tools = validated,
                    message_id = "user-message", agent = { id = "agent:forms" },
                })

                test.is_nil(err, "the session keeps running")
                test.not_nil(result)
                test.is_false(has_continue(result), "the first form still ends the turn")
                test.eq(#artifact_repo.list_by_session(ctx.session_id), 1)
                test.eq(#rows_of(ctx, consts.MSG_TYPE.ARTIFACT), 1)
                local first_row: any = message_repo.get(ids[first_id])
                local second_row: any = message_repo.get(ids[second_id])
                test.eq(first_row.metadata.status, consts.FUNC_STATUS.SUCCESS)
                test.eq(second_row.metadata.status, consts.FUNC_STATUS.ERROR)
                test.contains(tostring(second_row.metadata.result), "one_form_per_turn")
            end)

            it("refuses a definition that fails the session's own check without failing the turn", function()
                local ctx = new_ctx()
                local call_id = "call-" .. uuid.v7()
                local _, ids: any = ctx.writer:add_response("", {}, {
                    { id = call_id, name = "ask_user", arguments = "{}", registry_id = TOOL_ID,
                        type = consts.MSG_TYPE.FUNCTION },
                })
                -- A tool output the session does not trust: a definition that bypassed
                -- the tool's own validation.
                local forged = { message = "ok", _control = { forms = {
                    { artifact_id = uuid.v7(), definition = { title = "", fields = {} } },
                } } }
                local caller = {
                    set_strategy = function() end,
                    execute = function(_self, _context, tools)
                        return { [call_id] = { result = forged, tool_call = tools[call_id] } }
                    end,
                }
                local result, err = message_handlers.process_tools(ctx, {
                    tool_calls = { { id = call_id, name = "ask_user", registry_id = TOOL_ID, arguments = "{}" } },
                    call_message_ids = ids, caller = caller,
                    validated_tools = { [call_id] = { valid = true, name = "ask_user", args = {}, registry_id = TOOL_ID } },
                    message_id = "user-message", agent = { id = "agent:forms" },
                })
                test.is_nil(err)
                test.is_true(has_continue(result))
                test.eq(#artifact_repo.list_by_session(ctx.session_id), 0)
                local row: any = message_repo.get(ids[call_id])
                test.eq(row.metadata.status, consts.FUNC_STATUS.ERROR)
                test.contains(tostring(row.metadata.result), "invalid_definition")
                test.is_nil((ctx :: any).form_turn_id)
            end)

            it("rewrites the call to an error and leaves no form when storing fails", function()
                local ctx = new_ctx()
                local real_writer = ctx.writer
                -- The artifact insert succeeds; the artifact message fails inside the
                -- same transaction, so both roll back.
                ctx.writer = setmetatable({
                    add_message = function(_self, msg_type, content, metadata, opts)
                        if msg_type == consts.MSG_TYPE.ARTIFACT then return nil, "message disk full" end
                        return real_writer:add_message(msg_type, content, metadata, opts)
                    end,
                }, { __index = real_writer })
                local result, err, call_id, ids = ask(ctx, DEFINITION)
                test.is_nil(result)
                test.contains(tostring(err), "message disk full")
                test.eq(#artifact_repo.list_by_session(ctx.session_id), 0)
                test.eq(#rows_of(ctx, consts.MSG_TYPE.ARTIFACT), 0)
                local call_row = message_repo.get((ids :: any)[call_id])
                test.eq(call_row.metadata.status, consts.FUNC_STATUS.ERROR)
                test.contains(tostring(call_row.metadata.result), "message disk full")
                test.is_nil(ctx.form_turn_id, "a failed attempt does not use up the turn")
            end)

            it("does not run another agent step on the bus after a form", function()
                local ctx = new_ctx()
                local continued = 0
                local bus: any = command_bus.new(ctx)
                ctx.queue_empty_callback = function() bus:stop(); return true end
                bus:mount_op_handler(consts.OP_TYPE.PROCESS_TOOLS, function(c, op)
                    local result, err = ask(c, DEFINITION)
                    return result, err
                end)
                bus:mount_op_handler(consts.OP_TYPE.AGENT_CONTINUE, function()
                    continued = continued + 1
                    return { completed = true }
                end)
                bus:queue_op({ type = consts.OP_TYPE.PROCESS_TOOLS })
                local ok, err = bus:run()
                test.is_nil(err)
                test.is_true(ok)
                test.eq(continued, 0)
            end)
        end)

        describe("answer admission", function()
            it("keeps a pending answer out of the prompt", function()
                local ctx = new_ctx()
                ask(ctx, DEFINITION)
                local accepted = submit(form_id_of(ctx))
                local messages = ctx.reader:messages():from_checkpoint():all()
                local found = false
                for _, row in ipairs(messages) do
                    if row.message_id == accepted.answer_message_id then found = true end
                end
                test.is_true(found, "the committed row is in the history")
                local builder = prompt_builder.build(messages, {}, {}, { include_contexts = false,
                    include_files = false, cache_markers = false })
                for _, message in ipairs(builder:get_messages()) do
                    if message.role == "user" then
                        test.is_false(string.find(tostring(message.content[1].text), "Answers to form", 1, true) ~= nil)
                    end
                end
            end)

            it("admits an answer that arrives while idle and starts a turn for it", function()
                local ctx, events = new_ctx()
                ask(ctx, DEFINITION)
                local accepted = submit(form_id_of(ctx))
                ctx.writer:add_message(consts.MSG_TYPE.ASSISTANT, "later row")

                local bus: any = command_bus.new(ctx)
                local routed = session.route_input(ctx, bus, consts.TOPICS.FORM_ANSWER,
                    { message_id = accepted.answer_message_id }, { finishing = false })
                test.is_true(routed)
                test.eq(#bus.ops, 1)
                test.eq(bus.ops[1].type, consts.OP_TYPE.ADMIT_ANSWER)
                test.is_true(bus.ops[1].starts_turn)

                local result, err = message_handlers.admit_answer(ctx, bus.ops[1])
                test.is_nil(err)
                test.eq(result.next_ops[1].type, consts.OP_TYPE.AGENT_STEP)
                test.eq(result.next_ops[1].message_id, accepted.answer_message_id)
                test.is_true(result.next_ops[1].from_user)

                local rows: any = message_repo.list_by_session(ctx.session_id, 500).messages
                local last = rows[#rows]
                test.eq(last.message_id, accepted.answer_message_id)
                test.is_nil(last.metadata.session_form.pending)
                test.eq(events.received[1].id, accepted.answer_message_id)
                test.contains(events.received[1].text, "Answers to form")

                local builder = prompt_builder.build(ctx.reader:messages():from_checkpoint():all(), {}, {},
                    { include_contexts = false, include_files = false, cache_markers = false })
                local prompt = builder:get_messages()
                test.contains(tostring(prompt[#prompt].content[1].text), "Answers to form")

                local again = message_handlers.admit_answer(ctx, { message_id = accepted.answer_message_id })
                test.is_nil(again.next_ops, "a repeated wake-up is a no-op")
            end)

            it("holds an answer during a turn and admits it at end_turn after held input", function()
                local ctx = new_ctx()
                ask(ctx, DEFINITION)
                local accepted = submit(form_id_of(ctx))
                local bus: any = command_bus.new(ctx)
                ctx.flush_held = function(run_agent) return session.flush_held(ctx, run_agent) end
                ctx.admit_answers = function(run_agent) return session.admit_answers_at_turn_end(ctx, run_agent) end
                bus.state = "running"
                bus.turn_state.id = ctx.turn_state.id

                session.route_input(ctx, bus, consts.TOPICS.FORM_ANSWER,
                    { message_id = accepted.answer_message_id }, { finishing = false })
                test.eq(#bus.ops, 0, "never admitted mid-turn")
                test.eq(ctx.pending_answers[1], accepted.answer_message_id)
                test.eq(message_repo.get(accepted.answer_message_id).metadata.session_form.pending, true)

                local typed_id = uuid.v7()
                table.insert(ctx.held, { message_id = typed_id, data = { text = "typed while busy" } })

                local ok, err = bus:end_turn()
                test.is_nil(err)
                test.is_true(ok)
                test.eq(#ctx.pending_answers, 0)
                test.eq(bus.ops[1].type, consts.OP_TYPE.AGENT_STEP)
                test.eq(bus.ops[1].message_id, accepted.answer_message_id)

                local rows: any = message_repo.list_by_session(ctx.session_id, 500).messages
                test.eq(rows[#rows - 1].message_id, typed_id)
                test.eq(rows[#rows].message_id, accepted.answer_message_id)
                test.is_nil(rows[#rows].metadata.session_form.pending)
            end)

            it("keeps an answer pending when the turn ends by a stop or finish", function()
                for _, draining in ipairs({ "draining_stop", "draining_finish" }) do
                    local ctx = new_ctx()
                    ask(ctx, DEFINITION)
                    local accepted = submit(form_id_of(ctx))
                    local bus: any = command_bus.new(ctx)
                    ctx.flush_held = function(run_agent) return session.flush_held(ctx, run_agent) end
                    ctx.admit_answers = function(run_agent) return session.admit_answers_at_turn_end(ctx, run_agent) end
                    bus.turn_state.id = ctx.turn_state.id
                    bus.state = draining

                    local _, err = bus:end_turn()
                    test.is_nil(err)
                    for _, op in ipairs(bus.ops) do
                        test.is_false(op.type == consts.OP_TYPE.AGENT_STEP, draining .. " starts no agent step")
                    end
                    test.eq(message_repo.get(accepted.answer_message_id).metadata.session_form.pending, true,
                        draining .. " leaves the answer for the next start")
                end
            end)

            it("admits pending answers from the scan exactly once, in acceptance order", function()
                local ctx = new_ctx()
                ask(ctx, DEFINITION)
                local first_form = form_id_of(ctx)
                ctx.turn_state.id = "turn-" .. uuid.v7()
                ask(ctx, DEFINITION)
                local second_form = nil
                for _, artifact in ipairs(artifact_repo.list_by_session(ctx.session_id)) do
                    if artifact.artifact_id ~= first_form then second_form = artifact.artifact_id end
                end
                local first = submit(first_form)
                local second = submit(assert(second_form), { delivery = "Locker" })

                -- What session start finds (no wake-up ever arrived).
                local pending: any = message_repo.list_pending_answers(ctx.session_id, 1)
                test.eq(pending[1].message_id, first.answer_message_id)

                local last_id, err = message_handlers.admit_answers(ctx)
                test.is_nil(err)
                test.eq(last_id, second.answer_message_id)
                local rows: any = message_repo.list_by_session(ctx.session_id, 500).messages
                test.eq(rows[#rows - 1].message_id, first.answer_message_id)
                test.eq(rows[#rows].message_id, second.answer_message_id)
                local admitted_date = rows[#rows].date

                local again, again_err = message_handlers.admit_answers(ctx)
                test.is_nil(again_err)
                test.is_nil(again)
                test.eq(message_repo.get(second.answer_message_id).date, admitted_date)
                test.eq(#message_repo.list_pending_answers(ctx.session_id, 50), 0)
                test.is_nil(message_repo.admit_pending_answer(ctx.session_id, first.answer_message_id))
            end)

            it("ignores a wake-up for another session's answer", function()
                local ctx = new_ctx()
                ask(ctx, DEFINITION)
                local accepted = submit(form_id_of(ctx))
                local other = new_ctx()
                local admitted, err = message_repo.admit_pending_answer(other.session_id, accepted.answer_message_id)
                test.is_nil(err)
                test.is_nil(admitted)
                test.eq(message_repo.get(accepted.answer_message_id).metadata.session_form.pending, true)
            end)
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
