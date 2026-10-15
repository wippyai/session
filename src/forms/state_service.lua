local json = require("json")
local uuid = require("uuid")
local security = require("security")
local consts = require("consts")
local definition = require("definition")
local form_artifact = require("form_artifact")
local form_meta = require("form_meta")
local answer_text = require("answer_text")
local ordered_json = require("ordered_json")
local tx = require("tx")
local artifact_repo = require("artifact_repo")
local artifact_events = require("artifact_events")
local message_repo = require("message_repo")
local message_date = require("message_date")
local session_repo = require("session_repo")
local session_status = require("session_status")
local logger = require("logger"):named("session.forms")

-- Form state behind GET/POST /artifact/{id}/state (the HTTP handlers in
-- src/api/artifact_state.lua are thin adapters). Every function returns an
-- HTTP status and a JSON body string; bodies are composed with explicit
-- nulls (ordered_json.object) because the contract has nullable keys.
--
-- Acceptance (POST) is one transaction: lock the session row, re-read the
-- form, decide `late`, insert the answer as a pending user row and switch the
-- artifact to idle with the accepted submission (conditional on the expected
-- content_version).
-- After commit the artifact event is published and the session process is
-- woken with the row id; the row itself makes the delivery durable.

local state_service = {}

state_service.MAX_BODY_BYTES = 64 * 1024
state_service.MAX_REQUEST_ID = 128

-- Seams for tests.
function state_service._new_message_id()
    return uuid.v7()
end

function state_service._lookup_session(session_id)
    return session_status._lookup(session_id)
end

-- The same session permissions the session reader and writer check: reading
-- a form needs read access, answering it needs write access.
function state_service._can_read(session_id)
    return security.can("read", "session:" .. session_id)
end

function state_service._can_write(session_id)
    return security.can("write", "session:" .. session_id)
end

function state_service._lookup_plugin(user_id)
    return process.registry.lookup(consts.REGISTRY.PLUGIN .. user_id)
end

-- Returns (ok, err) like process.send.
function state_service._send(pid, topic, payload)
    return process.send(pid, topic, payload)
end

---------------------------------------------------------------------------
-- Responses
---------------------------------------------------------------------------

local function error_body(code, message, extra)
    local entries = {
        { "success", false },
        { "code", code },
        { "message", message },
    }
    for _, entry in ipairs(extra or {}) do table.insert(entries, entry) end
    return ordered_json.object(entries)
end

local function failure(status, code, message, extra)
    return status, error_body(code, message, extra)
end

-- An error response for the HTTP adapter's own refusals, in the same shape
-- as every other body of this API.
function state_service.error_response(status, code, message)
    return failure(status, code, message)
end

-- The 413 for a body over MAX_BODY_BYTES.
function state_service.payload_too_large()
    return failure(413, "payload_too_large",
        string.format("The submission is larger than %d KiB.", math.floor(state_service.MAX_BODY_BYTES / 1024)))
end

-- A 500: the client gets `message`, and the cause goes to the log.
local function internal_failure(message, cause)
    logger:warn(message, { error = tostring(cause) })
    return failure(500, "internal", message)
end

---------------------------------------------------------------------------
-- Loading and authorization
---------------------------------------------------------------------------

-- Loads the artifact and its form for `user_id`. Returns (artifact, form) or
-- (nil, nil, status, body). A missing artifact, another user's artifact and
-- an artifact whose session is gone or not the user's are all 404
-- (artifact_repo.get_owned), so the endpoint does not reveal that a foreign
-- artifact exists. A form always belongs to a session.
local function load_form(user_id, artifact_id)
    if type(artifact_id) ~= "string" or artifact_id == "" then
        return nil, nil, failure(400, "invalid_request", "Missing artifact ID in path")
    end
    local artifact, err = artifact_repo.get_owned(user_id, artifact_id)
    if not artifact then
        if artifact_repo.is_not_found(err) then
            return nil, nil, failure(404, "not_found", "Form not found")
        end
        return nil, nil, internal_failure("Failed to read the form", err)
    end
    if type(artifact.session_id) ~= "string" or artifact.session_id == "" then
        return nil, nil, failure(404, "not_found", "Form not found")
    end
    local form, form_err = form_artifact.parse(artifact)
    if not form then
        return nil, nil, failure(400, "not_a_form", tostring(form_err))
    end
    return artifact, form
end

-- How many rows after an answer are read to look for the agent's reply.
local REPLY_SCAN_LIMIT = 50

-- A reply is assistant text, or a turn that ended by asking a new form. Tool
-- calls alone are not: a turn that crashed or was stopped after one did not
-- answer.
local function is_reply(row)
    if row.type == consts.MSG_TYPE.ASSISTANT then
        return type(row.data) == "string" and string.find(row.data, "%S") ~= nil
    end
    if row.type == consts.MSG_TYPE.FUNCTION then
        local meta = type(row.metadata) == "table" and row.metadata or {}
        local operations = type(meta.control_operations) == "table" and meta.control_operations or {}
        return meta.status == consts.FUNC_STATUS.SUCCESS
            and type(operations.forms) == "table" and #operations.forms > 0
    end
    return false
end

-- Whether other user input was accepted after the form was created: the
-- "conversation moved on" test. `opts.tx` reads on a caller's transaction. A
-- form without a creation cursor never counts as moved on. Returns the flag,
-- or nil and an error.
local function moved_on(artifact, record, opts)
    local cursor = form_meta.created_cursor(record)
    if not cursor then return false, nil end
    local moved, err = message_repo.has_user_input_after(artifact.session_id, cursor, artifact.artifact_id, opts)
    if err then return nil, err end
    return moved == true, nil
end

-- Delivery of an accepted answer, derived from the rows (no stored state):
--   pending      the answer row waits for admission
--   complete     admitted, and the agent has replied after it
--   running      admitted, no reply yet, and a live session process is
--                running a turn
--   interrupted  admitted, no reply, and no turn is running: the user
--                stopped the turn (the answer is delivered; a new message
--                continues), or it crashed before answering (the stored
--                status can still say running until the session process
--                starts again). Also when the answer row is gone from the
--                history: nothing will answer it.
local function delivery_of(submission, session_id)
    if type(submission) ~= "table" then return nil, nil end
    local row, err = message_repo.find(submission.message_id)
    if err then return nil, tostring(err) end
    if not row then return "interrupted", nil end
    if message_repo.is_pending_answer(row) then return "pending", nil end

    -- The newest rows after the answer (the answer row among them when few
    -- follow). A full page means the conversation went on long after it.
    local later, list_err = message_repo.list_after_message(session_id, row.message_id, REPLY_SCAN_LIMIT)
    if not later then return nil, tostring(list_err) end
    if #later >= REPLY_SCAN_LIMIT then return "complete", nil end
    for _, candidate in ipairs(later) do
        if candidate.message_id ~= row.message_id and is_reply(candidate) then return "complete", nil end
    end
    -- A stored "running" status with no live session process is a stopped
    -- turn, not a running one (session_status).
    local session, session_err = session_repo.get(session_id)
    if not session then return nil, tostring(session_err) end
    local status = session_status.effective(session, state_service._lookup_session)
    if status == consts.STATUS.RUNNING then return "running", nil end
    return "interrupted", nil
end

---------------------------------------------------------------------------
-- GET
---------------------------------------------------------------------------

function state_service.get_state(user_id, artifact_id)
    local artifact, form, status, body = load_form(user_id, artifact_id)
    if not artifact then return status, body end
    -- The owner is known at this point, so a refusal reveals nothing new.
    if not state_service._can_read(artifact.session_id) then
        return failure(403, "forbidden", "You cannot read forms in this session.")
    end

    local submission = form_meta.submission(form.meta)
    local stale = false
    local delivery = nil
    if not submission then
        local stale_err
        stale, stale_err = moved_on(artifact, form.meta)
        if stale_err then return internal_failure("Failed to read the form state", stale_err) end
    else
        local delivery_err
        delivery, delivery_err = delivery_of(submission, artifact.session_id)
        if delivery_err then return internal_failure("Failed to read the delivery state", delivery_err) end
    end

    return 200, ordered_json.object({
        { "form_version", definition.FORM_VERSION },
        { "artifact_id", artifact.artifact_id },
        { "session_id", artifact.session_id },
        { "status", submission and consts.ARTIFACT_STATUS.IDLE or consts.ARTIFACT_STATUS.ACTIVE },
        { "stale", stale },
        { "late", submission and submission.late == true or false },
        { "content_version", artifact.content_version or 1 },
        { "definition", raw = (json.encode(form.definition)) },
        { "data", raw = submission and definition.encode_answers(form.definition, submission.answers) or nil },
        { "submitted_at", submission and submission.submitted_at or nil },
        { "answer_message_id", submission and submission.message_id or nil },
        { "delivery", delivery },
    })
end

---------------------------------------------------------------------------
-- POST
---------------------------------------------------------------------------

local function is_integer_number(value)
    return type(value) == "number" and value == math.floor(value) and value >= 1
end

-- Checks the versioned envelope. Returns the envelope or (nil, message).
local function parse_envelope(raw_body)
    if raw_body == "" then return nil, "Request body is required" end
    local body, decode_err = json.decode(raw_body)
    if decode_err or type(body) ~= "table" or not definition.is_object(body) or next(body) == nil then
        return nil, "Request body must be a JSON object"
    end
    if body.form_version ~= definition.FORM_VERSION then
        return nil, "Unsupported form_version"
    end
    local request_id = body.request_id
    if type(request_id) ~= "string" or not string.find(request_id, "%S")
        or #request_id > state_service.MAX_REQUEST_ID then
        return nil, "request_id must be a non-empty string of at most 128 characters"
    end
    -- Optional: without it only the revision check is skipped.
    if body.expected_content_version ~= nil then
        if not is_integer_number(body.expected_content_version) then
            return nil, "expected_content_version must be a positive integer"
        end
        body.expected_content_version = math.floor(body.expected_content_version)
    end
    if body.answers == nil or type(body.answers) ~= "table" then
        return nil, "answers must be an object"
    end
    return body, nil
end

local function success_body(r)
    return ordered_json.object({
        { "success", true },
        { "artifact_id", r.artifact_id },
        { "request_id", r.request_id },
        { "answer_message_id", r.message_id },
        { "content_version", r.content_version },
        { "status", consts.ARTIFACT_STATUS.IDLE },
        { "late", r.late },
        { "delivery", r.delivery },
        { "replayed", r.replayed },
    })
end

local function conflict_extra(artifact)
    return {
        { "status", type(artifact.meta) == "table" and artifact.meta.status or nil },
        { "content_version", artifact.content_version or 1 },
    }
end

-- The canonical encoding of valid answers, or nil when they are not valid.
local function canonical_of(form, answers)
    local normalized = definition.validate_answers(form.definition, answers)
    return normalized and definition.encode_answers(form.definition, normalized) or nil
end

-- Classifies a request against an already accepted submission: an exact
-- replay (same request id, same normalized answers) gets the original result;
-- anything else is a 409. Both sides are compared as definition.encode_answers
-- writes them from the decoded values, never as request or stored JSON text,
-- so key order in either cannot turn a retry into a request_conflict. The
-- answers are only validated for a replay candidate, so an answered form
-- costs no validation work.
local function against_existing(artifact, form, submission, request_id, answers)
    if submission.request_id == request_id then
        local accepted = definition.encode_answers(form.definition, submission.answers)
        local canonical = canonical_of(form, answers)
        if canonical and canonical == accepted then
            local delivery, delivery_err = delivery_of(submission, artifact.session_id)
            if delivery_err then return internal_failure("Failed to read the delivery state", delivery_err) end
            return 200, success_body({
                artifact_id = artifact.artifact_id, request_id = request_id,
                message_id = submission.message_id, content_version = artifact.content_version or 1,
                late = submission.late == true, delivery = delivery, replayed = true,
            })
        end
        return failure(409, "request_conflict",
            "This request id was already used with different answers.", conflict_extra(artifact))
    end
    return failure(409, "already_submitted", "This form was already answered.", conflict_extra(artifact))
end

-- Validation response: 422 with errors keyed by field id and form errors.
local function validation_body(field_errors, form_errors)
    local field_entries = {}
    local ids = {}
    for id in pairs(field_errors or {}) do table.insert(ids, id) end
    table.sort(ids)
    for _, id in ipairs(ids) do table.insert(field_entries, { id, field_errors[id] }) end
    local errors_json = ordered_json.object(field_entries)
    local form_errors_json = "[]"
    if form_errors and #form_errors > 0 then form_errors_json = json.encode(form_errors) end
    return ordered_json.object({
        { "success", false },
        { "code", "validation_failed" },
        { "message", "Some answers are not valid." },
        { "errors", raw = errors_json },
        { "form_errors", raw = form_errors_json },
    })
end

function state_service.submit(user_id, artifact_id, raw_body)
    if type(raw_body) ~= "string" then raw_body = "" end
    if #raw_body > state_service.MAX_BODY_BYTES then
        return failure(413, "payload_too_large", "The submission is larger than 64 KiB.")
    end

    local artifact, form, status, body = load_form(user_id, artifact_id)
    if not artifact then return status, body end
    -- The owner is known at this point, so a refusal reveals nothing new.
    if not state_service._can_write(artifact.session_id) then
        return failure(403, "forbidden", "You cannot answer forms in this session.")
    end

    local envelope, envelope_err = parse_envelope(raw_body)
    if not envelope then return failure(400, "invalid_request", tostring(envelope_err)) end
    local request_id = envelope.request_id

    -- An answered form is settled before the answers are validated: only an
    -- exact replay (same request id) needs them normalized.
    local existing = form_meta.submission(form.meta)
    if existing then
        return against_existing(artifact, form, existing, request_id, envelope.answers)
    end
    local expected_version = envelope.expected_content_version
    if expected_version ~= nil and (artifact.content_version or 1) ~= expected_version then
        return failure(409, "version_conflict", "The form changed since it was loaded.", conflict_extra(artifact))
    end
    local normalized, field_errors, form_errors = definition.validate_answers(form.definition, envelope.answers)
    if not normalized then
        return 422, validation_body(field_errors, form_errors)
    end

    local message_id, id_err = state_service._new_message_id()
    if not message_id then return internal_failure("Failed to create the answer id", id_err) end
    local session_id = artifact.session_id

    local accepted, accept_err = tx.run(function(dbtx)
        -- The session row's write lock comes first, so `late` is decided
        -- against every input written before this answer, and any input
        -- written after waits for this commit and sorts after the answer.
        -- A session removed meanwhile fails the lock; the owner check after
        -- the transaction then answers 404.
        local _, lock_err = message_date.lock_session(dbtx, session_id)
        if lock_err then return nil, tostring(lock_err) end

        -- Ownership and revision are read again under the lock.
        local current, current_err = artifact_repo.get_owned(user_id, artifact.artifact_id, { tx = dbtx })
        if not current then
            if artifact_repo.is_not_found(current_err) then return nil, { status = 404 } end
            return nil, tostring(current_err)
        end
        local current_form, parse_err = form_artifact.parse(current)
        if not current_form then return nil, tostring(parse_err) end
        if form_meta.submission(current_form.meta) then
            return nil, { existing = current, form = current_form }
        end
        if expected_version ~= nil and (current.content_version or 1) ~= expected_version then
            return nil, { version_conflict = current }
        end

        local late, stale_err = moved_on(current, current_form.meta, { tx = dbtx })
        if stale_err then return nil, tostring(stale_err) end

        local text = answer_text.build({
            artifact_id = current.artifact_id,
            definition = current_form.definition,
            answers = normalized,
            late = late,
        })
        -- The row's marker: which form it answers, and that the session has
        -- not admitted it yet.
        local stored: any, message_err = message_repo.create(message_id, session_id, consts.MSG_TYPE.USER, text, {
            [form_meta.ANSWER_KEY] = {
                artifact_id = current.artifact_id,
                pending = true,
            },
        }, nil, nil, nil, { tx = dbtx })
        if message_err then return nil, tostring(message_err) end

        local content, content_err = form_artifact.content_with_state(current_form, consts.ARTIFACT_STATUS.IDLE)
        if not content then return nil, content_err end
        local record = form_meta.with_submission(current_form.meta, {
            request_id = request_id,
            answers = normalized,
            -- The answer row's own date: its place in the input order.
            submitted_at = stored.date,
            message_id = message_id,
            late = late,
        })
        local updated, update_err = artifact_repo.update(current.artifact_id, {
            content = content,
            meta_patch = {
                [form_meta.KEY] = record,
                status = consts.ARTIFACT_STATUS.IDLE,
            },
        -- The conditional update is the winner check even without a client
        -- revision: it pins the revision read above in this transaction.
        }, { tx = dbtx, expected_version = expected_version or current.content_version or 1 })
        if not updated then
            if artifact_repo.is_conflict(update_err) then return nil, { version_conflict = current } end
            return nil, tostring(update_err)
        end

        return { content_version = updated.content_version, late = late }
    end)

    if not accepted then
        if type(accept_err) == "table" then
            if accept_err.status == 404 then return failure(404, "not_found", "Form not found") end
            if accept_err.existing then
                return against_existing(accept_err.existing, accept_err.form,
                    form_meta.submission(accept_err.form.meta), request_id, envelope.answers)
            end
        end
        -- A concurrent submission may have won while this transaction ran:
        -- SQLite reports the loser as busy, PostgreSQL as a revision
        -- conflict. Read the committed state and classify against it.
        local winner, winner_err = artifact_repo.get_owned(user_id, artifact.artifact_id)
        if artifact_repo.is_not_found(winner_err) then return failure(404, "not_found", "Form not found") end
        local winner_form = winner and form_artifact.parse(winner) or nil
        local won = winner_form and form_meta.submission(winner_form.meta) or nil
        if won then
            return against_existing(winner, winner_form, won, request_id, envelope.answers)
        end
        if type(accept_err) == "table" and accept_err.version_conflict then
            return failure(409, "version_conflict", "The form changed since it was loaded.",
                conflict_extra(accept_err.version_conflict))
        end
        return internal_failure("The answer could not be saved. Try again.", accept_err)
    end

    -- Committed. Tell the owner's open tabs, then wake the session process;
    -- neither is needed for correctness (state refetch, pending-row scans),
    -- so a failed wake-up is logged and does not fail the request.
    local updated_artifact = artifact_repo.get(artifact.artifact_id)
    if updated_artifact then artifact_events.publish_updated(updated_artifact) end
    local woken, wake_err = state_service.wake_session(session_id, message_id, artifact.user_id)
    if not woken then
        logger:warn("form answer wake-up not delivered",
            { session_id = session_id, message_id = message_id, error = tostring(wake_err) })
    end

    return 200, success_body({
        artifact_id = artifact.artifact_id, request_id = request_id, message_id = message_id,
        content_version = accepted.content_version, late = accepted.late,
        delivery = "pending", replayed = false,
    })
end

-- Sends `form_answer` to the session's registered process. When none runs
-- (idle timeout, restart) or the send fails, asks the owner's session plugin
-- to start it; the session admits pending answers on start. With no plugin
-- (the owner has no connection) the answer waits for the next session start
-- or the plugin's scan. Returns true, or false and why the wake-up was not
-- delivered.
function state_service.wake_session(session_id, message_id, owner_id)
    local pid = state_service._lookup_session(session_id)
    local send_err = nil
    if pid then
        local _, err = state_service._send(pid, consts.TOPICS.FORM_ANSWER, { message_id = message_id })
        if not err then return true end
        send_err = tostring(err)
    end
    if not owner_id or owner_id == "" then
        return false, send_err or "no session process and no owner to start one"
    end
    local plugin = state_service._lookup_plugin(owner_id)
    if not plugin then
        return false, send_err or "no session process and no session plugin for the owner"
    end
    local _, plugin_err = state_service._send(plugin, consts.PLUGIN_TOPICS.WAKE,
        { session_id = session_id, message_id = message_id })
    if plugin_err then return false, tostring(plugin_err) end
    return true
end

return state_service
