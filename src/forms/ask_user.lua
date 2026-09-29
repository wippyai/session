local uuid = require("uuid")
local definition = require("definition")

-- The ask_user tool. It only validates and normalizes the definition and
-- hands it to the session process as a `_control.forms` operation; the
-- session stores the form, binds it to the calling turn and ends the turn.
-- An invalid definition is a tool error (nil, message) so the agent can fix
-- it; nothing is stored in that case.
local function handler(params: any)
    local normalized, errors = definition.normalize(params)
    if not normalized then
        return nil, "Invalid form definition:\n" .. definition.format_errors(errors)
    end

    local artifact_id, id_err = uuid.v7()
    if id_err then
        return nil, "Failed to create form id: " .. tostring(id_err)
    end

    return {
        message = string.format('Form "%s" was created as %s. Its answer will arrive as a user message.',
            normalized.title, artifact_id),
        _control = {
            forms = {
                { artifact_id = artifact_id, definition = normalized },
            },
        },
    }
end

return { handler = handler }
