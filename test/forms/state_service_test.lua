local test = require("test")
local json = require("json")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local consts = require("consts")
local definition = require("definition")
local state_service = require("state_service")
local control_handlers = require("control_handlers")
local message_handlers = require("message_handlers")
local artifact_repo = require("artifact_repo")
local message_repo = require("message_repo")
local context_repo = require("context_repo")
local session_repo = require("session_repo")
local writer = require("writer")
local wait_for_boot = require("wait_for_boot")

-- GET/POST form state through wippy.session.forms:state_service on the real
-- database. The HTTP adapter (src/api/artifact_state.lua) only forwards the
-- actor id, path id and raw body, so the status codes and bodies are
-- asserted here.

local DEFINITION = {
    title = "Delivery preference",
    fields = {
        { id = "delivery", type = "choice", label = "How should the parcel be delivered?",
            required = true, allow_other = true, options = { "Courier", "Pickup point", "Locker" } },
        { id = "extras", type = "choice", label = "Extras", multiple = true, options = { "Gift wrap", "Receipt" } },
    },
}

local function define_tests()
    describe("form state API", function()
        local user_id = ""
        local created = {} :: {any}
        local wakes = {} :: {any}
        local original = {}

        before_all(function()
            wait_for_boot.run()
            local actor = security.actor()
            user_id = actor and actor:id() or ""
            original.lookup = state_service._lookup_session
            original.send = state_service._send
            original.plugin = state_service._lookup_plugin
            original.new_id = state_service._new_message_id
        end)

        before_each(function()
            wakes = {}
            state_service._lookup_session = function(session_id) return "pid-" .. session_id end
            state_service._send = function(pid, topic, payload)
                table.insert(wakes, { pid = pid, topic = topic, payload = payload })
            end
        end)

        after_each(function()
            state_service._lookup_session = original.lookup
            state_service._send = original.send
            state_service._lookup_plugin = original.plugin
            state_service._new_message_id = original.new_id
        end)

        after_all(function()
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

        local function new_session()
            local session_id, context_id = uuid.v7(), uuid.v7()
            local _, context_err = context_repo.create(context_id, "primary", "{}")
            test.is_nil(context_err)
            local _, session_err = session_repo.create(session_id, user_id, context_id, "Forms", "test")
            test.is_nil(session_err)
            table.insert(created, { session_id = session_id, context_id = context_id })
            local session_writer, writer_err = writer.new(session_id)
            test.is_nil(writer_err)
            return {
                session_id = session_id,
                writer = session_writer,
                upstream = {
                    send_message_update = function() end,
                    update_session = function() end,
                    message_received = function() end,
                },
            }
        end

        local function new_form(ctx)
            local def = definition.normalize(DEFINITION)
            local artifact_id = uuid.v7()
            local _, err = control_handlers.control_forms(ctx, {
                forms = { { artifact_id = artifact_id, definition = def } },
                turn_id = "turn-" .. uuid.v7(), call_id = "call-1", tool_message_id = "tool-row-1",
            })
            test.is_nil(err)
            return artifact_id
        end

        local function post(artifact_id, body, as_user)
            local raw = type(body) == "string" and body or json.encode(body)
            local status, response = state_service.submit(as_user or user_id, artifact_id, raw)
            return status, json.decode(tostring(response)), response
        end

        local function get(artifact_id, as_user)
            local status, response = state_service.get_state(as_user or user_id, artifact_id)
            return status, json.decode(tostring(response)), response
        end

        local function answer(request_id: any?, answers: any?, version: any?)
            return {
                form_version = 1,
                request_id = request_id or uuid.v7(),
                expected_content_version = version or 1,
                answers = answers or { delivery = "Courier" },
            }
        end

        local function user_rows(session_id)
            local page: any = message_repo.list_by_session(session_id, 500)
            local rows = {}
            for _, row in ipairs(page.messages) do
                if row.type == consts.MSG_TYPE.USER then table.insert(rows, row) end
            end
            return rows
        end

        it("reads an active form with null answer fields", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local status, body, raw = get(artifact_id)
            test.eq(status, 200)
            test.eq(body.form_version, 1)
            test.eq(body.artifact_id, artifact_id)
            test.eq(body.session_id, ctx.session_id)
            test.eq(body.status, "active")
            test.eq(body.stale, false)
            test.eq(body.late, false)
            test.eq(body.content_version, 1)
            test.eq(body.definition.title, "Delivery preference")
            test.eq(body.definition.fields[1].options[2].value, "Pickup point")
            test.contains(raw, '"data":null')
            test.contains(raw, '"submitted_at":null')
            test.contains(raw, '"answer_message_id":null')
            test.contains(raw, '"delivery":null')
        end)

        it("marks an active form stale only after another user message", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            ctx.writer:add_message(consts.MSG_TYPE.ASSISTANT, "Waiting for your choice")
            local _, before = get(artifact_id)
            test.eq(before.stale, false)
            ctx.writer:add_message(consts.MSG_TYPE.USER, "Actually, never mind")
            local _, after = get(artifact_id)
            test.eq(after.stale, true)
        end)

        it("accepts an answer atomically and wakes the session", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local request_id = uuid.v7()
            local status, body = post(artifact_id, answer(request_id, {
                delivery = { other = "Drone" }, extras = { "Receipt", "Gift wrap" } }))
            test.eq(status, 200)
            test.eq(body.success, true)
            test.eq(body.artifact_id, artifact_id)
            test.eq(body.request_id, request_id)
            test.eq(body.content_version, 2)
            test.eq(body.status, "idle")
            test.eq(body.late, false)
            test.eq(body.delivery, "pending")
            test.eq(body.replayed, false)

            local artifact: any = artifact_repo.get(artifact_id)
            test.eq(artifact.content_version, 2)
            test.eq(artifact.meta.status, "idle")
            test.eq(json.decode(artifact.content).props.state, "idle")
            local submission = artifact.meta.session_form.submission
            test.eq(submission.request_id, request_id)
            test.eq(submission.message_id, body.answer_message_id)
            test.eq(submission.answers.extras[1], "Gift wrap")
            test.eq(artifact.meta.session_form.origin.turn_id ~= nil, true)

            local row: any = message_repo.get(body.answer_message_id)
            test.eq(row.type, consts.MSG_TYPE.USER)
            test.eq(row.session_id, ctx.session_id)
            test.eq(string.sub(row.data, 1, 16), "Answers to form ")
            test.contains(row.data, '"answers":{"delivery":{"other":"Drone"},"extras":["Gift wrap","Receipt"]}')
            test.eq(row.metadata.session_form.artifact_id, artifact_id)
            test.eq(row.metadata.session_form.submission_id, request_id)
            test.eq(row.metadata.session_form.pending, true)
            test.eq(row.metadata.session_form.late, false)

            test.eq(#wakes, 1)
            test.eq(wakes[1].pid, "pid-" .. ctx.session_id)
            test.eq(wakes[1].topic, "form_answer")
            test.eq(wakes[1].payload.message_id, body.answer_message_id)
        end)

        it("asks the owner's session plugin to start a stopped session", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            state_service._lookup_session = function() return nil end
            state_service._lookup_plugin = function(owner) return "plugin-" .. owner end
            local status, body = post(artifact_id, answer())
            test.eq(status, 200)
            test.eq(#wakes, 1)
            test.eq(wakes[1].pid, "plugin-" .. user_id)
            test.eq(wakes[1].topic, "wake")
            test.eq(wakes[1].payload.session_id, ctx.session_id)
            test.eq(wakes[1].payload.message_id, body.answer_message_id)

            state_service._lookup_plugin = function() return nil end
            local other = new_form(new_session())
            test.eq(post(other, answer()), 200)
            test.eq(#wakes, 1)
        end)

        it("reads an idle form with its answer and delivery state", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local _, accepted = post(artifact_id, answer(nil, { delivery = "Locker" }))
            local status, body = get(artifact_id)
            test.eq(status, 200)
            test.eq(body.status, "idle")
            test.eq(body.stale, false)
            test.eq(body.content_version, 2)
            test.eq(body.data.delivery, "Locker")
            test.eq(body.answer_message_id, accepted.answer_message_id)
            test.not_nil(body.submitted_at)
            test.eq(body.delivery, "pending")

            local admitted = message_handlers.admit_answers(ctx)
            test.eq(admitted, accepted.answer_message_id)
            local _, after = get(artifact_id)
            test.eq(after.delivery, "complete")
        end)

        it("replays the same request with the original result", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local request = answer(nil, { delivery = "Courier", extras = { "Receipt", "Gift wrap" } })
            local _, first = post(artifact_id, request)
            -- Same answers in another order normalize to the same submission.
            request.answers.extras = { "Gift wrap", "Receipt" }
            local status, replay = post(artifact_id, request)
            test.eq(status, 200)
            test.eq(replay.replayed, true)
            test.eq(replay.answer_message_id, first.answer_message_id)
            test.eq(replay.content_version, 2)
            test.eq(#user_rows(ctx.session_id), 1)
            test.eq(#wakes, 1)
        end)

        it("rejects the same request id with different answers", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local request = answer(nil, { delivery = "Courier" })
            post(artifact_id, request)
            request.answers = { delivery = "Locker" }
            local status, body = post(artifact_id, request)
            test.eq(status, 409)
            test.eq(body.success, false)
            test.eq(body.code, "request_conflict")
            test.not_nil(body.message)
            test.eq(#user_rows(ctx.session_id), 1)
        end)

        it("rejects a second submission after the first one won", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local first_status = post(artifact_id, answer(nil, { delivery = "Courier" }))
            test.eq(first_status, 200)
            local status, body = post(artifact_id, answer(nil, { delivery = "Courier" }))
            test.eq(status, 409)
            test.eq(body.code, "already_submitted")
            test.eq(body.status, "idle")
            test.eq(body.content_version, 2)
            test.eq(#user_rows(ctx.session_id), 1)
        end)

        it("rejects a stale expected revision, and skips the check when it is omitted", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local status, body = post(artifact_id, answer(nil, nil, 7))
            test.eq(status, 409)
            test.eq(body.code, "version_conflict")
            test.eq(body.content_version, 1)

            local request = answer()
            request.expected_content_version = nil
            local ok_status, ok_body = post(artifact_id, request)
            test.eq(ok_status, 200)
            test.eq(ok_body.content_version, 2)
        end)

        it("returns field errors without changing anything", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local status, body, raw = post(artifact_id, answer(nil, { delivery = "Truck", ghost = 1 }))
            test.eq(status, 422)
            test.eq(body.success, false)
            test.eq(body.code, "validation_failed")
            test.eq(body.errors.delivery[1].code, "invalid_option")
            test.eq(body.form_errors[1].code, "unknown_field")

            local missing_status, missing = post(artifact_id, answer(nil, { extras = {} }))
            test.eq(missing_status, 422)
            test.eq(missing.errors.delivery[1].code, "required")
            test.contains(raw, '"errors":{')

            local artifact: any = artifact_repo.get(artifact_id)
            test.eq(artifact.content_version, 1)
            test.is_nil(artifact.meta.session_form.submission)
            test.eq(#user_rows(ctx.session_id), 0)
        end)

        it("answers 404 for a missing or foreign form", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local status, body = get(uuid.v7())
            test.eq(status, 404)
            test.eq(body.code, "not_found")
            local foreign_get = get(artifact_id, "someone-else")
            test.eq(foreign_get, 404)
            local foreign_post = post(artifact_id, answer(), "someone-else")
            test.eq(foreign_post, 404)
            test.eq(#user_rows(ctx.session_id), 0)
        end)

        it("answers 400 for a non-form artifact and a malformed envelope", function()
            local ctx = new_session()
            local plain_id = uuid.v7()
            local _, create_err = ctx.writer:create_artifact(plain_id, "inline", "Notes", "# notes",
                { content_type = "text/markdown" })
            test.is_nil(create_err)
            local status, body = get(plain_id)
            test.eq(status, 400)
            test.eq(body.code, "not_a_form")

            local artifact_id = new_form(ctx)
            local bad_json = post(artifact_id, "{")
            test.eq(bad_json, 400)
            local bad_version, bad_body = post(artifact_id, { form_version = 2, request_id = "r", answers = {} })
            test.eq(bad_version, 400)
            test.eq(bad_body.code, "invalid_request")
            local no_request = post(artifact_id, { form_version = 1, answers = { delivery = "Courier" } })
            test.eq(no_request, 400)
        end)

        it("answers 413 for a body over 64 KiB", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local request = answer(nil, { delivery = { other = string.rep("x", 70000) } })
            local status, body = post(artifact_id, request)
            test.eq(status, 413)
            test.eq(body.code, "payload_too_large")
        end)

        it("labels an answer late when the conversation moved on", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            ctx.writer:add_message(consts.MSG_TYPE.USER, "Let's talk about something else")
            local status, body = post(artifact_id, answer())
            test.eq(status, 200)
            test.eq(body.late, true)
            local row: any = message_repo.get(body.answer_message_id)
            test.eq(string.sub(row.data, 1, 20), "Late answer to form ")
            test.eq(row.metadata.session_form.late, true)
            local _, state = get(artifact_id)
            test.eq(state.late, true)
            test.eq(state.stale, false)
        end)

        it("rolls back the artifact when the answer row cannot be written", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            -- Reuse an id that already exists in messages: the insert after the
            -- artifact update fails inside the same transaction.
            local taken = user_rows(ctx.session_id)
            local existing_id: any = ctx.writer:add_message(consts.MSG_TYPE.ASSISTANT, "occupies an id")
            test.eq(#taken, 0)
            state_service._new_message_id = function() return existing_id end

            local status, body = post(artifact_id, answer())
            test.eq(status, 500)
            test.eq(body.code, "internal")
            local artifact: any = artifact_repo.get(artifact_id)
            test.eq(artifact.content_version, 1)
            test.eq(artifact.meta.status, "active")
            test.is_nil(artifact.meta.session_form.submission)
            test.eq(json.decode(artifact.content).props.state, "active")
            test.eq(#user_rows(ctx.session_id), 0)
            test.eq(#wakes, 0)

            state_service._new_message_id = original.new_id
            local retry_status = post(artifact_id, answer())
            test.eq(retry_status, 200)
        end)
    end)
end

return test.run_cases(define_tests)
