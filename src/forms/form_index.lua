local json = require("json")
local form_artifact = require("form_artifact")

-- A bounded, deterministic index of a session's forms for the prompt.
--
-- The summary written at a checkpoint is free text and may drop form ids or
-- answer values, so the prompt builder adds this index itself, for every
-- agent (with or without the forms trait): unanswered forms and the most
-- recent answers, with ids to look up exact values. It is computed from the
-- stored artifacts on every build, so there is no copy to keep in sync.
--
-- An answer the session has not admitted yet (it arrived during the running
-- turn) is listed as pending, with no answer message id: the turn must not
-- see it, and the agent gets it as the next user message.

local form_index = {}

form_index.MAX_UNANSWERED = 8
form_index.MAX_ANSWERED = 4
form_index.MAX_BYTES = 8 * 1024
-- Bound for the pending answer lookup that goes with the index.
form_index.MAX_PENDING_SCAN = 200

local HEADING = "Session forms (index; exact answers are in the answer messages and can be read with read_form when available):"

-- Forms of a session as { artifact_id, title, created, submission, pending },
-- from artifact rows with decoded meta. pending_answers: set of form ids
-- whose answer is not admitted yet.
local function forms_of(artifacts, pending_answers)
    local forms = {}
    for _, artifact in ipairs(artifacts or {}) do
        local meta = type(artifact.meta) == "table" and artifact.meta or nil
        local form = meta and meta[form_artifact.META_KEY] or nil
        if type(form) == "table" then
            local origin = type(form.origin) == "table" and form.origin or {}
            local submission = type(form.submission) == "table" and form.submission or nil
            table.insert(forms, {
                artifact_id = artifact.artifact_id,
                title = artifact.title or "",
                created = type(origin.created_cursor) == "string" and origin.created_cursor or "",
                submission = submission,
                pending = submission ~= nil and pending_answers[artifact.artifact_id] == true,
            })
        end
    end
    return forms
end

-- Whether any form among the artifacts holds an accepted answer (only then
-- can an answer be pending).
function form_index.has_answers(artifacts)
    for _, artifact in ipairs(artifacts or {}) do
        local meta = type(artifact.meta) == "table" and artifact.meta or nil
        local form = meta and meta[form_artifact.META_KEY] or nil
        if type(form) == "table" and type(form.submission) == "table" then return true end
    end
    return false
end

-- Newest first, ties by id, so the output is stable for the same rows.
local function newest_first(key)
    return function(a, b)
        local ka, kb = key(a), key(b)
        if ka ~= kb then return ka > kb end
        return a.artifact_id > b.artifact_id
    end
end

-- Returns the index text, or nil when the session has no forms.
-- opts.pending_answers: set of form ids whose accepted answer is not
-- admitted yet (message_repo.list_pending_answers).
function form_index.build(artifacts, opts)
    local pending_answers = type(opts) == "table" and type(opts.pending_answers) == "table"
        and opts.pending_answers or {}
    local forms = forms_of(artifacts, pending_answers)
    if #forms == 0 then return nil end

    -- A pending answer counts with the open forms: for this turn the form is
    -- not answered yet.
    local open, answered = {}, {}
    for _, form in ipairs(forms) do
        if form.submission and not form.pending then table.insert(answered, form) else table.insert(open, form) end
    end
    table.sort(open, newest_first(function(f) return f.created end))
    table.sort(answered, newest_first(function(f) return f.submission.submitted_at or "" end))

    local lines = { HEADING }
    local size = #HEADING
    local omitted_unanswered, omitted_answered = 0, 0

    local function add(line)
        if size + #line + 1 > form_index.MAX_BYTES - 200 then return false end
        table.insert(lines, line)
        size = size + #line + 1
        return true
    end

    for position, form in ipairs(open) do
        local line
        if form.pending then
            line = string.format("- answer pending (arrives as a later user message): %s form_id=%s asked=%s",
                json.encode(form.title), form.artifact_id, form.created)
        else
            line = string.format("- unanswered: %s form_id=%s asked=%s",
                json.encode(form.title), form.artifact_id, form.created)
        end
        if position > form_index.MAX_UNANSWERED or not add(line) then
            omitted_unanswered = omitted_unanswered + 1
        end
    end
    for position, form in ipairs(answered) do
        local submission = form.submission
        local line = string.format("- answered: %s form_id=%s answered=%s late=%s answer_message_id=%s",
            json.encode(form.title), form.artifact_id, tostring(submission.submitted_at or ""),
            tostring(submission.late == true), tostring(submission.message_id or ""))
        if position > form_index.MAX_ANSWERED or not add(line) then
            omitted_answered = omitted_answered + 1
        end
    end
    if omitted_unanswered > 0 or omitted_answered > 0 then
        table.insert(lines, string.format("(%d more unanswered and %d more answered forms not listed)",
            omitted_unanswered, omitted_answered))
    end
    return table.concat(lines, "\n")
end

return form_index
