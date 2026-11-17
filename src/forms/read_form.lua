local ctx = require("ctx")
local answer_text = require("answer_text")
local artifact_repo = require("artifact_repo")
local form_artifact = require("form_artifact")
local form_meta = require("form_meta")
local message_repo = require("message_repo")
local ordered_json = require("ordered_json")

-- The read_form tool: the self-contained record of one form of the calling
-- session. An answered form gives the same record as its answer message
-- (each question with its answer's value, label and note); an unanswered
-- form gives its questions with their options. It reads only forms of the
-- session the agent runs in, so a form id from another session reveals
-- nothing.
--
-- An answer the session has not admitted yet (it arrived during the running
-- turn, also while this tool round runs) is reported as pending, without its
-- values: the turn must not act on it now and again when it arrives as the
-- next user message. Whether it is admitted is read from the answer row
-- itself when the tool runs.

local PENDING_NOTE = "The user answered this form. The answer arrives as a user message after this turn;"
    .. " do not act on it before then."

local function calling_session_id()
    local run = ctx.get("agent_run")
    local host = type(run) == "table" and run.host or nil
    return type(host) == "table" and host.session_id or nil
end

-- Whether the accepted answer of `submission` is not admitted yet, from its
-- answer row (message_repo.is_pending_answer). A row that is gone can no
-- longer arrive as a message, so its answer is shown. Returns the flag, or
-- nil and an error when the row cannot be read.
local function answer_pending(submission: any): (boolean?, string?)
    if type(submission.message_id) ~= "string" or submission.message_id == "" then return true, nil end
    local row, err = message_repo.find(submission.message_id)
    if err then return nil, tostring(err) end
    if not row then return false, nil end
    return message_repo.is_pending_answer(row), nil
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
    local pending, pending_err = answer_pending(submission)
    if pending == nil then
        return nil, "Failed to read the answer of form " .. form_id .. ": " .. tostring(pending_err)
    end
    if pending then
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
