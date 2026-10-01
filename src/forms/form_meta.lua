-- The form record in an artifact's meta: meta.session_form, with its
-- version, its origin binding and, once answered, the accepted submission.
-- Every reader of the record goes through these accessors. The library
-- imports nothing, so the persistence layer can use it too.

local form_meta = {}

form_meta.KEY = "session_form"

-- The version of the stored record. The form definition has its own version
-- (definition.FORM_VERSION); both are 1 today and change independently.
form_meta.VERSION = 1

-- The metadata key of the marker a form answer's message row carries:
-- { artifact_id, pending }. It is stored under the same name as KEY, but it
-- is a separate record on another table, so each has its own constant.
form_meta.ANSWER_KEY = "session_form"

-- The form record of an artifact's decoded meta, or nil when the artifact
-- is not a form.
function form_meta.of(meta: any): any
    local record = type(meta) == "table" and meta[form_meta.KEY] or nil
    return type(record) == "table" and record or nil
end

-- The accepted submission of a form record, or nil while it is unanswered.
function form_meta.submission(record: any): any
    local submission = type(record) == "table" and record.submission or nil
    return type(submission) == "table" and submission or nil
end

-- The origin binding of a form record; an empty table when it has none.
function form_meta.origin(record: any): any
    local origin = type(record) == "table" and record.origin or nil
    return type(origin) == "table" and origin or {}
end

-- The date of the form's artifact message, which every later user input is
-- compared with to tell whether the conversation moved on; nil when the
-- record has none.
function form_meta.created_cursor(record: any): string?
    local cursor = form_meta.origin(record).created_cursor
    if type(cursor) == "string" and cursor ~= "" then return cursor end
    return nil
end

-- A copy of a form record with `submission` set, to write back once an
-- answer is accepted.
function form_meta.with_submission(record: any, submission: any): any
    local copy = {}
    for key, value in pairs(type(record) == "table" and record or {}) do copy[key] = value end
    copy.submission = submission
    return copy
end

return form_meta
