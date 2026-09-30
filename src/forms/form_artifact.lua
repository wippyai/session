local json = require("json")
local definition = require("definition")
local form_meta = require("form_meta")

-- The stored representation of a session form: an inline artifact whose
-- content is the component-tag package for <wippy-form>, plus one metadata
-- key, meta.session_form (version, origin binding, and the accepted
-- submission once answered; read it through form_meta).

local form_artifact = {}

form_artifact.SPECIFICATION = "wippy-component-tag-1.0"
form_artifact.TAG_NAME = "wippy-form"
form_artifact.META_KEY = form_meta.KEY
form_artifact.META_VERSION = form_meta.VERSION

form_artifact.STATE = {
    ACTIVE = "active",
    IDLE = "idle",
}

-- Content JSON for a form in the given state ("active" or "idle").
function form_artifact.build_content(def: any, state: string): (string?, string?)
    local encoded, err = json.encode({
        specification = form_artifact.SPECIFICATION,
        wippy = { tagName = form_artifact.TAG_NAME },
        props = {
            ["form-version"] = definition.FORM_VERSION,
            definition = def,
            state = state,
        },
    })
    if err then return nil, "Failed to encode form content: " .. tostring(err) end
    return encoded, nil
end

-- The initial meta.session_form object. `submission` stays absent (JSON
-- null) until an answer is accepted: Lua has no null sentinel.
function form_artifact.new_meta(origin: any): any
    return {
        version = form_artifact.META_VERSION,
        origin = origin,
    }
end

-- Reads a form out of an artifact row (meta already decoded). Returns
-- { definition, state, meta } or nil plus a reason when the artifact is not
-- a supported form.
function form_artifact.parse(artifact: any): (any, string?)
    local meta = type(artifact) == "table" and form_meta.of(artifact.meta) or nil
    if not meta or meta.version ~= form_artifact.META_VERSION then
        return nil, "Artifact is not a form"
    end
    if type(artifact.content) ~= "string" or artifact.content == "" then
        return nil, "Form content is missing"
    end
    local content, decode_err = json.decode(artifact.content)
    if decode_err or type(content) ~= "table" then
        return nil, "Form content is not valid JSON"
    end
    if content.specification ~= form_artifact.SPECIFICATION
        or type(content.wippy) ~= "table" or content.wippy.tagName ~= form_artifact.TAG_NAME
        or type(content.props) ~= "table" then
        return nil, "Form content is not a wippy-form package"
    end
    if content.props["form-version"] ~= definition.FORM_VERSION then
        return nil, "Unsupported form version"
    end
    -- The stored definition was normalized at creation; normalizing again
    -- rebuilds the answer rules from it and rejects a damaged record. Rules
    -- added after creation are not applied (stored = true).
    local def, def_errors = definition.normalize(content.props.definition, { stored = true })
    if not def then
        return nil, "Stored form definition is invalid: " .. definition.format_errors(def_errors)
    end
    return {
        definition = def,
        state = content.props.state,
        meta = meta,
        content = content,
    }, nil
end

-- The ask_user tool result for a created form. Recovery settles a call
-- whose form was committed with the same text (form_recovery).
function form_artifact.created_message(title: string, artifact_id: string): string
    return string.format('Form "%s" was created as %s. Its answer will arrive as a user message.',
        title, artifact_id)
end

-- Content JSON with props.state replaced, everything else kept.
function form_artifact.content_with_state(form: any, state: string): (string?, string?)
    return form_artifact.build_content(form.definition, state)
end

return form_artifact
