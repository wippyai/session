local uuid = require("uuid")
local definition = require("definition")
local form_artifact = require("form_artifact")

-- The ask_user and ask_user_fields tools. They only validate and normalize
-- the definition and hand it to the session process as a `_control.forms`
-- operation; the session stores the form, binds it to the calling turn and
-- ends the turn. An invalid definition is a tool error (nil, message) so the
-- agent can fix it; nothing is stored in that case.
-- The two tools differ only in the field types they accept (`types`).
local function ask(params: any, types: {[string]: boolean}?)
    local normalized, errors = definition.normalize(params, { types = types })
    if not normalized then
        return nil, "Invalid form definition:\n" .. definition.format_errors(errors)
    end

    local artifact_id, id_err = uuid.v7()
    if id_err then
        return nil, "Failed to create form id: " .. tostring(id_err)
    end

    return {
        message = form_artifact.created_message(normalized.title, artifact_id),
        _control = {
            forms = {
                { artifact_id = artifact_id, definition = normalized },
            },
        },
    }
end

-- ask_user (trait wippy.session.forms:ask_user): choice questions only.
local function handler(params: any)
    return ask(params, definition.CHOICE_TYPES)
end

-- ask_user_fields (trait wippy.session.forms:ask_user_fields): choice
-- questions and the standard fields.
local function fields_handler(params: any)
    return ask(params, nil)
end

return { handler = handler, fields_handler = fields_handler }
