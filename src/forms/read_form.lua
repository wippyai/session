local ctx = require("ctx")
local answer_text = require("answer_text")
local artifact_repo = require("artifact_repo")
local form_artifact = require("form_artifact")
local form_meta = require("form_meta")
local ordered_json = require("ordered_json")

-- The read_form tool: the self-contained record of one form of the calling
-- session. An answered form gives the same record as its answer message
-- (each question with its answer's value, label and note); an unanswered
-- form gives its questions with their options. It reads only forms of the
-- session the agent runs in, so a form id from another session reveals
-- nothing.
--
-- An answer the session has not admitted yet (it arrived during the running
-- turn) is reported as pending, without its values: the turn must not act on
-- it now and again when it arrives as the next user message. The session
-- passes the forms with such answers in the call context (session_forms, see
-- message_handlers.process_tools); without that list no answer is shown.

local PENDING_NOTE = "The user answered this form. The answer arrives as a user message after this turn;"
    .. " do not act on it before then."

local function calling_session_id()
    local run = ctx.get("agent_run")
    local host = type(run) == "table" and run.host or nil
    return type(host) == "table" and host.session_id or nil
end

local function answer_pending(form_id)
    local view = ctx.get("session_forms")
    local pending = type(view) == "table" and view.pending_answers or nil
    if type(pending) ~= "table" then return true end
    return pending[form_id] == true
end

local function handler(params: any)
    local form_id = type(params) == "table" and params.form_id or nil
    if type(form_id) ~= "string" or form_id == "" then
        return nil, "form_id is required"
    end
    local session_id = calling_session_id()
    if not session_id then
        return nil, "read_form works only inside a session"
    end

    local artifact = artifact_repo.get(form_id)
    if not artifact or artifact.session_id ~= session_id then
        return nil, "No form " .. form_id .. " in this session"
    end
    local form, parse_err = form_artifact.parse(artifact)
    if not form then
        return nil, "Not a form: " .. tostring(parse_err)
    end

    local submission = form_meta.submission(form.meta)
    if not submission then
        return { message = ordered_json.object({
            { "status", "unanswered" },
            { "form_id", artifact.artifact_id },
            { "title", form.definition.title },
            { "questions", raw = answer_text.questions_json(form.definition) },
        }) }
    end
    if answer_pending(artifact.artifact_id) then
        return { message = ordered_json.object({
            { "status", "answer_pending" },
            { "form_id", artifact.artifact_id },
            { "title", form.definition.title },
            { "note", PENDING_NOTE },
        }) }
    end
    -- A late record carries its own late_notice.
    return { message = ordered_json.object({
        { "status", "answered" },
        { "answered_at", tostring(submission.submitted_at) },
        { "form", raw = answer_text.record_json({
            artifact_id = artifact.artifact_id, definition = form.definition,
            answers = submission.answers, late = submission.late == true,
        }) },
    }) }
end

return { handler = handler }
