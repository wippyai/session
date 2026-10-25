local test = require("test")
local json = require("json")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local consts = require("consts")
local definition = require("definition")
local state_service = require("state_service")
local control_handlers = require("control_handlers")
local answer_admission = require("answer_admission")
local artifact_repo = require("artifact_repo")
local message_repo = require("message_repo")
local context_repo = require("context_repo")
local session_repo = require("session_repo")
local writer = require("writer")
local message_date = require("message_date")
local time = require("time")
local wait_for_boot = require("wait_for_boot")

-- "sqlite" or "postgres", read when the cases are defined.
local function database_kind()
    local db = sql.get(consts.get_db_resource())
    if not db then return "unknown" end
    local kind = db:type()
    db:release()
    return kind
end

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
            original.lock_session = message_date.lock_session
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
            message_date.lock_session = original.lock_session
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
                reader = { list_all_messages = function() return message_repo.list_all_by_session(session_id) end },
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

            local row: any = message_repo.get(body.answer_message_id)
            test.eq(row.type, consts.MSG_TYPE.USER)
            test.eq(row.session_id, ctx.session_id)
            test.eq(string.sub(row.data, 1, 12), "Answered “")
            test.contains(row.data, "”.\n\n<wippy-form-answers record='{")
            test.contains(row.data, '"answer":{"other":"Drone"}')
            test.contains(row.data, '"answer":[{"value":"Gift wrap","label":"Gift wrap"},{"value":"Receipt","label":"Receipt"}]')
            -- The marker names the form and says the row is not admitted yet;
            -- the request id and the late flag live in the form's submission
            -- and in the record text.
            test.eq(row.metadata.session_form.artifact_id, artifact_id)
            test.eq(row.metadata.session_form.pending, true)
            test.is_nil(row.metadata.session_form.submission_id)
            test.is_nil(row.metadata.session_form.late)

            test.eq(#wakes, 1)
            test.eq(wakes[1].pid, "pid-" .. ctx.session_id)
            test.eq(wakes[1].topic, "form_answer")
            test.eq(wakes[1].payload.message_id, body.answer_message_id)
        end)

        it("changes only the lifecycle state of the form content when it accepts an answer", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local before: any = artifact_repo.get(artifact_id)
            local content: any = json.decode(tostring(before.content))
            content.props.density = "comfortable"
            local db, db_err = sql.get(consts.get_db_resource())
            test.is_nil(db_err)
            local _, update_err = db:execute("UPDATE artifacts SET content = $1 WHERE artifact_id = $2",
                { json.encode(content), artifact_id })
            db:release()
            test.is_nil(update_err)

            local status = post(artifact_id, answer())
            test.eq(status, 200)
            local after_row: any = artifact_repo.get(artifact_id)
            local after: any = json.decode(tostring(after_row.content))
            test.eq(after.props.state, "idle")
            test.eq(after.props.density, "comfortable", "a prop the answer does not touch is kept")
            test.eq(after.props["form-version"], content.props["form-version"])
            test.eq(after.specification, content.specification)
            test.eq(after.wippy.tagName, content.wippy.tagName)
            local function same(a: any, b: any): boolean
                if type(a) ~= "table" or type(b) ~= "table" then return a == b end
                for key, value in pairs(a) do
                    if not same(value, b[key]) then return false end
                end
                for key in pairs(b) do
                    if a[key] == nil then return false end
                end
                return true
            end
            test.is_true(same(after.props.definition, content.props.definition), "the stored definition is kept")
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

            local admitted: any = answer_admission.admit_in_order(ctx, nil)
            test.eq(admitted[#admitted].message_id, accepted.answer_message_id)
            local _, stopped = get(artifact_id)
            test.eq(stopped.delivery, "interrupted", "admitted, no reply, session not running")

            session_repo.update_session_meta(ctx.session_id, { status = consts.STATUS.RUNNING })
            local _, running = get(artifact_id)
            test.eq(running.delivery, "running", "admitted, no reply yet, turn running")

            -- After a crash the stored status still says running, but no
            -- session process exists until something reopens the session.
            local live = state_service._lookup_session
            state_service._lookup_session = function() return nil end
            local _, crashed = get(artifact_id)
            state_service._lookup_session = live
            test.eq(crashed.delivery, "interrupted", "stored running status with no live session process")

            ctx.writer:add_message(consts.MSG_TYPE.ASSISTANT, "Locker it is.")
            local _, after = get(artifact_id)
            test.eq(after.delivery, "complete", "the agent replied after the answer")
        end)

        it("judges staleness by acceptance time, not by where admission moved the answer", function()
            local ctx = new_session()
            local first = new_form(ctx)
            test.eq(post(first, answer()), 200)
            local second = new_form(ctx)
            -- The first answer, accepted before the second form existed, is
            -- admitted now and lands after the second form in the history.
            test.eq(#answer_admission.admit_in_order(ctx, nil), 1)
            local _, before = get(second)
            test.eq(before.stale, false, "an answer accepted earlier does not make a later form stale")
            ctx.writer:add_message(consts.MSG_TYPE.USER, "Something else")
            local _, after = get(second)
            test.eq(after.stale, true)
        end)

        it("refuses a submit without session write permission and stores nothing", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local original_can = state_service._can_write
            state_service._can_write = function() return false end
            local status, body = post(artifact_id, answer())
            state_service._can_write = original_can
            test.eq(status, 403)
            test.eq(body.code, "forbidden")
            test.eq(artifact_repo.get(artifact_id).content_version, 1)
            test.eq(#user_rows(ctx.session_id), 0)
        end)

        it("classifies the loser of a concurrent submit as already_submitted", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local stale_copy = artifact_repo.get(artifact_id)
            local original_new_id = state_service._new_message_id
            local original_get = artifact_repo.get
            local raced = false
            state_service._new_message_id = function()
                if not raced then
                    raced = true
                    -- The other tab wins between our read and our write.
                    state_service._new_message_id = original_new_id
                    test.eq(post(artifact_id, answer(nil, { delivery = "Locker" })), 200)
                    -- Our transaction still reads the old revision once.
                    artifact_repo.get = function(id, opts)
                        if opts and opts.tx then
                            artifact_repo.get = original_get
                            return stale_copy
                        end
                        return original_get(id, opts)
                    end
                end
                return original_new_id()
            end
            local status, body = post(artifact_id, answer(nil, { delivery = "Courier" }))
            state_service._new_message_id = original_new_id
            artifact_repo.get = original_get
            test.eq(status, 409)
            test.eq(body.code, "already_submitted")
            test.eq(#user_rows(ctx.session_id), 1, "one answer row")
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

        it("replays a retry whose JSON lists the same answers with keys in another order", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local request_id = uuid.v7()
            local first_body = '{"form_version":1,"request_id":' .. (json.encode(request_id))
                .. ',"expected_content_version":1,"answers":{"delivery":{"value":"Courier","note":"Ring twice"},'
                .. '"extras":["Receipt","Gift wrap"]}}'
            local retry_body = '{"answers":{"extras":["Gift wrap","Receipt"],'
                .. '"delivery":{"note":"  Ring twice ","value":"Courier"}},"expected_content_version":1,'
                .. '"request_id":' .. (json.encode(request_id)) .. ',"form_version":1}'
            local status, first = post(artifact_id, first_body)
            test.eq(status, 200)
            test.eq(first.replayed, false)
            local retry_status, retry = post(artifact_id, retry_body)
            test.eq(retry_status, 200, "a retry, not a request_conflict")
            test.eq(retry.replayed, true)
            test.eq(retry.answer_message_id, first.answer_message_id)
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

        it("revalidates against a definition changed before acceptance without writing an answer", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local original_new_id = state_service._new_message_id
            local changed = false
            state_service._new_message_id = function()
                if not changed then
                    changed = true
                    -- This runs after the initial artifact read but before
                    -- the acceptance transaction. The changed definition
                    -- rejects the request's formerly valid Courier answer.
                    local artifact = artifact_repo.get(artifact_id)
                    local content = json.decode(artifact.content)
                    content.props.definition.fields[1].options = { "Locker" }
                    local _, update_err = artifact_repo.update_content(artifact_id, json.encode(content))
                    test.is_nil(update_err)
                end
                return original_new_id()
            end
            local request = answer(nil, { delivery = "Courier" })
            request.expected_content_version = nil
            local status, body = post(artifact_id, request)
            state_service._new_message_id = original_new_id

            test.eq(status, 422)
            test.eq(body.code, "validation_failed")
            test.eq(body.errors.delivery[1].code, "invalid_option")
            local artifact = artifact_repo.get(artifact_id)
            test.eq(artifact.content_version, 2, "only the competing definition update committed")
            test.is_nil(artifact.meta.session_form.submission, "rejected answer does not settle the form")
            test.eq(#user_rows(ctx.session_id), 0, "rejected answer creates no pending row")
            test.eq(#wakes, 0, "rejected answer does not wake the session")
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
            test.contains(row.data, '"late":true,"late_notice":')
            local _, state = get(artifact_id)
            test.eq(state.late, true)
            test.eq(state.stale, false)
        end)

        it("refuses to read a form without session read access", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local original_can = state_service._can_read
            state_service._can_read = function() return false end
            local status, body = get(artifact_id)
            state_service._can_read = original_can
            test.eq(status, 403)
            test.eq(body.code, "forbidden")
        end)

        it("decides late once, on the acceptance transaction, and keeps the text and the form in step", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            ctx.writer:add_message(consts.MSG_TYPE.USER, "Something else meanwhile")
            local original_after = message_repo.has_user_input_after
            local checks = {} :: {any}
            message_repo.has_user_input_after = function(session_id, after, exclude, opts)
                table.insert(checks, opts and opts.tx ~= nil)
                return original_after(session_id, after, exclude, opts)
            end
            local status, body = post(artifact_id, answer())
            message_repo.has_user_input_after = original_after
            test.eq(status, 200)
            test.eq(#checks, 1)
            test.is_true(checks[1], "inside the transaction")
            test.eq(body.late, true)
            local row: any = message_repo.get(body.answer_message_id)
            test.contains(row.data, '"late":true,"late_notice":')
            test.eq(artifact_repo.get(artifact_id).meta.session_form.submission.late, true)
            test.eq(#user_rows(ctx.session_id), 2, "one answer row next to the typed one")
        end)

        it("records the answer row's own date as the acceptance time", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local _, body = post(artifact_id, answer())
            local row: any = message_repo.get(body.answer_message_id)
            local submission = artifact_repo.get(artifact_id).meta.session_form.submission
            test.eq(submission.submitted_at, row.date)
        end)

        it("does not validate the answers of a request against an answered form", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            test.eq(post(artifact_id, answer()), 200)
            local original_validate = definition.validate_answers
            local validated = 0
            definition.validate_answers = function(def, answers)
                validated = validated + 1
                return original_validate(def, answers)
            end
            local status, body = post(artifact_id, answer(nil, { delivery = { other = string.rep(" ", 4000) } }))
            definition.validate_answers = original_validate
            test.eq(status, 409)
            test.eq(body.code, "already_submitted")
            test.eq(validated, 0)
        end)

        it("wakes the plugin when the session process cannot be reached and reports a lost wake-up", function()
            local sent = {} :: {any}
            state_service._lookup_session = function() return "stale-pid" end
            state_service._lookup_plugin = function(owner) return "plugin-" .. owner end
            state_service._send = function(pid, topic, payload)
                table.insert(sent, { pid = pid, topic = topic, payload = payload })
                if pid == "stale-pid" then return nil, "process not found" end
                return true
            end
            local ok = state_service.wake_session("session-x", "answer-x", "owner-x")
            test.is_true(ok)
            test.eq(#sent, 2)
            test.eq(sent[2].pid, "plugin-owner-x")
            test.eq(sent[2].topic, "wake")

            state_service._lookup_plugin = function() return nil end
            local lost, why = state_service.wake_session("session-x", "answer-x", "owner-x")
            test.is_false(lost)
            test.contains(tostring(why), "process not found")
        end)

        it("counts only a finished reply as delivery", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local _, accepted = post(artifact_id, answer())
            answer_admission.admit_in_order(ctx, nil)
            state_service._lookup_session = function() return nil end

            -- A tool call alone is not a reply: the turn stopped or crashed after it.
            local _, call_ids: any = ctx.writer:add_response("", {}, {
                { id = "call-1", name = "lookup", arguments = "{}", registry_id = "app:lookup",
                    type = consts.MSG_TYPE.FUNCTION },
            })
            local _, after_call = get(artifact_id)
            test.eq(after_call.delivery, "interrupted")

            -- A turn that ended by asking a new form did reply.
            ctx.writer:update_message_meta(call_ids["call-1"], { status = consts.FUNC_STATUS.SUCCESS,
                control_operations = { forms = { { artifact_id = uuid.v7() } } } })
            local _, after_form = get(artifact_id)
            test.eq(after_form.delivery, "complete")

            -- An answer row that is gone from the history is not delivered.
            message_repo.delete(accepted.answer_message_id)
            local _, gone = get(artifact_id)
            test.eq(gone.delivery, "interrupted")
        end)

        it("reports a failed session read in the delivery state as an error", function()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            post(artifact_id, answer())
            answer_admission.admit_in_order(ctx, nil)
            local original_get = session_repo.get
            session_repo.get = function(session_id, owner)
                -- The ownership check passes; the delivery lookup fails.
                if owner == nil then return nil, "database unavailable" end
                return original_get(session_id, owner)
            end
            local status, body = get(artifact_id)
            session_repo.get = original_get
            test.eq(status, 500)
            test.eq(body.code, "internal")
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

        -- A session delete and a form answer for the same form meet on the
        -- session row and on the form's artifact row. The race below is forced
        -- into the order that locks them crosswise: the answer holds the
        -- session row (paused after its lock), the delete removes the
        -- artifacts and then waits for the session row, and the answer goes on
        -- to update the artifact. Held in that order by the two sides, the
        -- locks would form a cycle that PostgreSQL ends by aborting one
        -- transaction. SQLite serializes writers on one lock, so it has no
        -- such cycle.
        local function waiting_for_a_lock()
            local db = assert(sql.get(consts.get_db_resource()))
            local rows = db:query("SELECT count(*) AS n FROM pg_stat_activity"
                .. " WHERE wait_event_type = 'Lock' AND datname = current_database() AND pid <> pg_backend_pid()")
            db:release()
            return rows ~= nil and rows[1] ~= nil and tonumber(rows[1].n) > 0
        end

        local function race_delete_against_answer()
            local ctx = new_session()
            local artifact_id = new_form(ctx)
            local session_id = ctx.session_id
            local locked, resume = channel.new(1), channel.new(1)
            local paused = false
            message_date.lock_session = function(conn, id)
                local ok, lock_err = original.lock_session(conn, id)
                if ok and not paused and id == session_id then
                    paused = true
                    locked:send(true)
                    resume:receive()
                end
                return ok, lock_err
            end

            local answered, deleted = channel.new(1), channel.new(1)
            coroutine.spawn(function()
                local status, body = post(artifact_id, answer())
                answered:send({ status = status, body = body })
            end)
            locked:receive()
            coroutine.spawn(function()
                local result, delete_err = session_repo.delete(session_id)
                deleted:send({ result = result, err = delete_err })
            end)
            for _ = 1, 100 do
                if waiting_for_a_lock() then break end
                time.sleep("50ms")
            end
            test.is_true(waiting_for_a_lock(), "the delete waits for the session row")
            resume:send(true)

            local outcome = {}
            local deadline = time.after("20s")
            while not (outcome.answer and outcome.delete) do
                local selected = channel.select({
                    answered:case_receive(), deleted:case_receive(), deadline:case_receive(),
                })
                test.is_true(selected.channel ~= deadline, "the race settles instead of hanging")
                if selected.channel == answered then outcome.answer = selected.value
                else outcome.delete = selected.value end
            end
            message_date.lock_session = original.lock_session
            return ctx, artifact_id, outcome
        end

        if database_kind() == "postgres" then
            it("lets a session delete and a form answer both finish when they race for one form", function()
                local ctx, artifact_id, outcome = race_delete_against_answer()
                local summary = string.format("answer %s %s, delete %s",
                    tostring(outcome.answer.status), tostring(outcome.answer.body and outcome.answer.body.code),
                    tostring(outcome.delete.err or "ok"))
                -- Whichever side the database aborts is retried: a delete that
                -- failed is repeated, an answer that failed is asked again.
                if outcome.delete.err then
                    local retried = session_repo.delete(ctx.session_id)
                    test.not_nil(retried, "the delete succeeds when it is retried (" .. summary .. ")")
                end
                if outcome.answer.status ~= 200 then
                    local retry_status = post(artifact_id, answer())
                    test.eq(retry_status, 404, "an answer retried after the session is gone finds no form (" .. summary .. ")")
                end
                test.eq(outcome.answer.status, 200, summary)
                test.is_nil(outcome.delete.err, summary)
                local gone = session_repo.get(ctx.session_id)
                test.is_nil(gone, "the session is deleted")
                local db = assert(sql.get(consts.get_db_resource()))
                local left = db:query("SELECT (SELECT count(*) FROM artifacts WHERE session_id = $1) AS artifacts,"
                    .. " (SELECT count(*) FROM messages WHERE session_id = $1) AS messages", { ctx.session_id })
                db:release()
                test.eq(tonumber(left[1].artifacts), 0)
                test.eq(tonumber(left[1].messages), 0)
            end)

            it("answers 404 when the session is deleted while the answer waits for the session row", function()
                local ctx = new_session()
                local artifact_id = new_form(ctx)
                local session_id = ctx.session_id
                -- Stands in for a delete that got the session row first.
                local db = assert(sql.get(consts.get_db_resource()))
                local holder = assert(db:begin())
                local _, lock_err = holder:execute(
                    "UPDATE sessions SET last_message_date = last_message_date WHERE session_id = $1", { session_id })
                test.is_nil(lock_err)

                local answered = channel.new(1)
                coroutine.spawn(function()
                    local status, body = post(artifact_id, answer())
                    answered:send({ status = status, body = body })
                end)
                for _ = 1, 100 do
                    if waiting_for_a_lock() then break end
                    time.sleep("50ms")
                end
                test.is_true(waiting_for_a_lock(), "the answer waits for the session row")
                for _, statement in ipairs({
                    "DELETE FROM artifacts WHERE session_id = $1",
                    "DELETE FROM messages WHERE session_id = $1",
                    "DELETE FROM sessions WHERE session_id = $1",
                }) do
                    local _, delete_err = holder:execute(statement, { session_id })
                    test.is_nil(delete_err)
                end
                local _, commit_err = holder:commit()
                db:release()
                test.is_nil(commit_err)

                local deadline = time.after("20s")
                local selected = channel.select({ answered:case_receive(), deadline:case_receive() })
                test.is_true(selected.channel ~= deadline, "the answer settles instead of hanging")
                test.eq(selected.value.status, 404)
                test.eq(selected.value.body.code, "not_found")
            end)
        else
            test.it_skip("lets a session delete and a form answer both finish when they race for one form (PostgreSQL only: SQLite serializes writers on one lock)", function() end)
            test.it_skip("answers 404 when the session is deleted while the answer waits for the session row (PostgreSQL only)", function() end)
        end
    end)
end

return test.run_cases(define_tests)
