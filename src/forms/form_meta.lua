-- The form record in an artifact's meta: meta.session_form, with its
-- version, its origin binding and, once answered, the accepted submission.
-- Every reader of the record goes through these accessors. The library
-- imports nothing, so the persistence layer can use it too.

local form_meta = {}

form_meta.KEY = "session_form"
form_meta.VERSION = 1

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

return form_meta
