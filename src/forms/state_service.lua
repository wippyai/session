local json = require("json")
local uuid = require("uuid")
local consts = require("consts")
local definition = require("definition")
local form_artifact = require("form_artifact")
local answer_text = require("answer_text")
local tx = require("tx")
local artifact_repo = require("artifact_repo")
local artifact_events = require("artifact_events")
local message_repo = require("message_repo")
local message_date = require("message_date")
local session_repo = require("session_repo")

-- Form state behind GET/POST /artifact/{id}/state (the HTTP handlers in
-- src/api/artifact_state.lua are thin adapters). Every function returns an
-- HTTP status and a JSON body string; bodies are composed with explicit
-- nulls (form_artifact.json_object) because the contract has nullable keys.
--
-- Acceptance (POST) is one transaction: re-read the form, compute `late`,
-- switch the artifact to idle with the accepted submission (conditional on
-- the expected content_version) and insert the answer as a pending user row.
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
    return process.registry.lookup(consts.REGISTRY.SESSION .. session_id)
end

function state_service._lookup_plugin(user_id)
    return process.registry.lookup(consts.REGISTRY.PLUGIN .. user_id)
end

function state_service._send(pid, topic, payload)
    process.send(pid, topic, payload)
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
    return form_artifact.json_object(entries)
end

local function failure(status, code, message, extra)
    return status, error_body(code, message, extra)
end

---------------------------------------------------------------------------
-- Loading and authorization
---------------------------------------------------------------------------

local function is_not_found(err)
    return string.find(string.lower(tostring(err)), "not found", 1, true) ~= nil
end

-- Loads the artifact and its form for `user_id`. Returns (artifact, form) or
-- (nil, nil, status, body). A missing artifact, another user's artifact and
-- an artifact whose session is gone or not the user's are all 404, so the
-- endpoint does not reveal that a foreign artifact exists.
local function load_form(user_id, artifact_id)
    if type(artifact_id) ~= "string" or artifact_id == "" then
        return nil, nil, failure(400, "invalid_request", "Missing artifact ID in path")
    end
    local artifact, err = artifact_repo.get(artifact_id)
    if not artifact then
        if is_not_found(err) then
            return nil, nil, failure(404, "not_found", "Form not found")
        end
        return nil, nil, failure(500, "internal", "Failed to read the form")
    end
    if artifact.user_id ~= user_id or type(artifact.session_id) ~= "string" or artifact.session_id == "" then
        return nil, nil, failure(404, "not_found", "Form not found")
    end
    local session, session_err = session_repo.get(artifact.session_id, user_id)
    if not session then
        if is_not_found(session_err) then
            return nil, nil, failure(404, "not_found", "Form not found")
        end
        return nil, nil, failure(500, "internal", "Failed to read the form")
    end
    local form, form_err = form_artifact.parse(artifact)
    if not form then
        return nil, nil, failure(400, "not_a_form", tostring(form_err))
    end
    return artifact, form
end

-- "pending" while the answer row still waits for admission, else "complete".
local function delivery_of(submission)
    if type(submission) ~= "table" then return nil, nil end
    local row, err = message_repo.get(submission.message_id)
    if not row then
        if is_not_found(err) then return "complete", nil end
        return nil, tostring(err)
    end
    local marker = type(row.metadata) == "table" and row.metadata.session_form or nil
    if type(marker) == "table" and marker.pending == true then return "pending", nil end
    return "complete", nil
end

---------------------------------------------------------------------------
-- GET
---------------------------------------------------------------------------

function state_service.get_state(user_id, artifact_id)
    local artifact, form, status, body = load_form(user_id, artifact_id)
    if not artifact then return status, body end

    local submission = form.meta.submission
    local origin = type(form.meta.origin) == "table" and form.meta.origin or {}
    local stale = false
    local delivery = nil
    if type(submission) ~= "table" then
        submission = nil
        if type(origin.created_cursor) == "string" and origin.created_cursor ~= "" then
            local moved_on, stale_err = message_repo.has_user_input_after(
                artifact.session_id, origin.created_cursor, artifact.artifact_id)
            if stale_err then return failure(500, "internal", "Failed to read the form state") end
            stale = moved_on == true
        end
    else
        local delivery_err
        delivery, delivery_err = delivery_of(submission)
        if delivery_err then return failure(500, "internal", "Failed to read the delivery state") end
    end

    return 200, form_artifact.json_object({
        { "form_version", definition.FORM_VERSION },
        { "artifact_id", artifact.artifact_id },
        { "session_id", artifact.session_id },
        { "status", submission and form_artifact.STATE.IDLE or form_artifact.STATE.ACTIVE },
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
    return form_artifact.json_object({
        { "success", true },
        { "artifact_id", r.artifact_id },
        { "request_id", r.request_id },
        { "answer_message_id", r.message_id },
        { "content_version", r.content_version },
        { "status", form_artifact.STATE.IDLE },
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

-- Classifies a request against an already accepted submission: an exact
-- replay (same request id, same normalized answers) gets the original result;
-- anything else is a 409.
local function against_existing(artifact, form, submission, request_id, canonical)
    if submission.request_id == request_id then
        local accepted = definition.encode_answers(form.definition, submission.answers)
        if canonical and canonical == accepted then
            local delivery, delivery_err = delivery_of(submission)
            if delivery_err then return failure(500, "internal", "Failed to read the delivery state") end
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

local function copy_table(value)
    local out = {}
    for key, item in pairs(value or {}) do out[key] = item end
    return out
end

-- Validation response: 422 with errors keyed by field id and form errors.
local function validation_body(field_errors, form_errors)
    local field_entries = {}
    local ids = {}
    for id in pairs(field_errors or {}) do table.insert(ids, id) end
    table.sort(ids)
    for _, id in ipairs(ids) do table.insert(field_entries, { id, field_errors[id] }) end
    local errors_json = form_artifact.json_object(field_entries)
    local form_errors_json = "[]"
    if form_errors and #form_errors > 0 then form_errors_json = json.encode(form_errors) end
    return form_artifact.json_object({
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

    local envelope, envelope_err = parse_envelope(raw_body)
    if not envelope then return failure(400, "invalid_request", tostring(envelope_err)) end
    local request_id = envelope.request_id

    local normalized, field_errors, form_errors = definition.validate_answers(form.definition, envelope.answers)
    local canonical = normalized and definition.encode_answers(form.definition, normalized) or nil

    if type(form.meta.submission) == "table" then
        return against_existing(artifact, form, form.meta.submission, request_id, canonical)
    end
    local expected_version = envelope.expected_content_version
    if expected_version ~= nil and (artifact.content_version or 1) ~= expected_version then
        return failure(409, "version_conflict", "The form changed since it was loaded.", conflict_extra(artifact))
    end
    if not normalized then
        return 422, validation_body(field_errors, form_errors)
    end

    local message_id, id_err = state_service._new_message_id()
    if not message_id then return failure(500, "internal", "Failed to create the answer id: " .. tostring(id_err)) end
    local submitted_at = message_date.now()
    local session_id = artifact.session_id

    local accepted, accept_err = tx.run(function(dbtx)
        local current, current_err = artifact_repo.get(artifact.artifact_id, { tx = dbtx })
        if not current then
            if is_not_found(current_err) then return nil, { status = 404 } end
            return nil, tostring(current_err)
        end
        local current_form, parse_err = form_artifact.parse(current)
        if not current_form then return nil, tostring(parse_err) end
        if type(current_form.meta.submission) == "table" then
            return nil, { existing = current, form = current_form }
        end
        if expected_version ~= nil and (current.content_version or 1) ~= expected_version then
            return nil, { version_conflict = current }
        end

        local origin = type(current_form.meta.origin) == "table" and current_form.meta.origin or {}
        local late = false
        if type(origin.created_cursor) == "string" and origin.created_cursor ~= "" then
            local moved_on, stale_err = message_repo.has_user_input_after(
                session_id, origin.created_cursor, current.artifact_id, { tx = dbtx })
            if stale_err then return nil, tostring(stale_err) end
            late = moved_on == true
        end

        local text = answer_text.build({
            artifact_id = current.artifact_id,
            definition = current_form.definition,
            answers = normalized,
            late = late,
        })
        local content, content_err = form_artifact.content_with_state(current_form, form_artifact.STATE.IDLE)
        if not content then return nil, content_err end

        local meta = copy_table(current_form.meta)
        meta.submission = {
            request_id = request_id,
            answers = normalized,
            submitted_at = submitted_at,
            message_id = message_id,
            late = late,
        }
        local updated, update_err = artifact_repo.update(current.artifact_id, {
            content = content,
            meta_patch = {
                [form_artifact.META_KEY] = meta,
                status = form_artifact.STATE.IDLE,
            },
        -- The conditional update is the winner check even without a client
        -- revision: it pins the revision read above in this transaction.
        }, { tx = dbtx, expected_version = expected_version or current.content_version or 1 })
        if not updated then
            local kind_ok, kind = pcall(function() return (update_err :: any):kind() end)
            if kind_ok and kind == errors.CONFLICT then return nil, { version_conflict = current } end
            return nil, tostring(update_err)
        end

        local _, message_err = message_repo.create(message_id, session_id, consts.MSG_TYPE.USER, text, {
            session_form = {
                artifact_id = current.artifact_id,
                submission_id = request_id,
                late = late,
                pending = true,
            },
        }, { tx = dbtx })
        if message_err then return nil, tostring(message_err) end

        return { content_version = updated.content_version, late = late }
    end)

    if not accepted then
        if type(accept_err) == "table" then
            if accept_err.status == 404 then return failure(404, "not_found", "Form not found") end
            if accept_err.existing then
                return against_existing(accept_err.existing, accept_err.form,
                    accept_err.form.meta.submission, request_id, canonical)
            end
            if accept_err.version_conflict then
                return failure(409, "version_conflict", "The form changed since it was loaded.",
                    conflict_extra(accept_err.version_conflict))
            end
        end
        return failure(500, "internal", "The answer could not be saved. Try again.")
    end

    -- Committed. Tell the owner's open tabs, then wake the session process;
    -- neither is needed for correctness (state refetch, pending-row scans).
    local updated_artifact = artifact_repo.get(artifact.artifact_id)
    if updated_artifact then artifact_events.publish_updated(updated_artifact) end
    state_service.wake_session(session_id, message_id, artifact.user_id)

    return 200, success_body({
        artifact_id = artifact.artifact_id, request_id = request_id, message_id = message_id,
        content_version = accepted.content_version, late = accepted.late,
        delivery = "pending", replayed = false,
    })
end

-- Sends `form_answer` to the session's registered process. When none runs
-- (idle timeout, restart), asks the owner's session plugin to start it; the
-- session admits pending answers on start. With no plugin (the owner has no
-- connection) the answer waits for the next session start.
function state_service.wake_session(session_id, message_id, owner_id)
    local pid = state_service._lookup_session(session_id)
    if pid then
        state_service._send(pid, consts.TOPICS.FORM_ANSWER, { message_id = message_id })
        return true
    end
    if not owner_id or owner_id == "" then return false end
    local plugin = state_service._lookup_plugin(owner_id)
    if not plugin then return false end
    state_service._send(plugin, consts.PLUGIN_TOPICS.WAKE, { session_id = session_id, message_id = message_id })
    return true
end

return state_service
