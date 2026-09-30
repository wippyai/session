local json = require("json")
local definition = require("definition")

-- The stored representation of a session form: an inline artifact whose
-- content is the component-tag package for <wippy-form>, plus one metadata
-- key, meta.session_form (version, origin binding, and the accepted
-- submission once answered).

local form_artifact = {}

form_artifact.SPECIFICATION = "wippy-component-tag-1.0"
form_artifact.TAG_NAME = "wippy-form"
form_artifact.META_KEY = "session_form"
form_artifact.META_VERSION = 1

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
-- null) until an answer is accepted: Lua has no null sentinel (probe J5).
function form_artifact.new_meta(origin: any): any
    return {
        version = form_artifact.META_VERSION,
        origin = origin,
    }
end

-- Key order of the stored meta.session_form object and its parts. Keys not
-- listed here are written after the listed ones, sorted.
local META_ORDER = { "version", "origin", "submission" }
local ORIGIN_ORDER = { "turn_id", "call_id", "tool_message_id", "created_cursor" }
local SUBMISSION_ORDER = { "request_id", "answers", "submitted_at", "message_id", "late" }

local function encode_plain(value: any): (string?, string?)
    local encoded, err = json.encode(value)
    if err then return nil, tostring(err) end
    return encoded, nil
end

-- Encodes an object with `order` first, then its other keys sorted.
-- encoders[key] (optional) encodes that key's value.
local function ordered_object(value: any, order: {string}, encoders: any?): (string?, string?)
    local known = {}
    local keys = {}
    for _, key in ipairs(order) do
        known[key] = true
        table.insert(keys, key)
    end
    local extra = {}
    for key in pairs(value) do
        if not known[key] then table.insert(extra, tostring(key)) end
    end
    table.sort(extra)
    for _, key in ipairs(extra) do table.insert(keys, key) end

    local parts = {}
    for _, key in ipairs(keys) do
        local item = value[key]
        if item ~= nil then
            local encoder = encoders and encoders[key] or encode_plain
            local encoded, err = encoder(item)
            if not encoded then return nil, err end
            table.insert(parts, (json.encode(key)) .. ":" .. encoded)
        end
    end
    return "{" .. table.concat(parts, ",") .. "}", nil
end

-- The stored text of meta.session_form, for artifact_repo.raw_json: keys in
-- a fixed order, and accepted answers as definition.encode_answers writes
-- them (definition order, "value" before "note"). The same form and answers
-- are always stored as the same text, whatever order their tables were
-- built in.
function form_artifact.encode_meta(def: any, meta: any): (string?, string?)
    local encoders = {
        origin = function(origin: any): (string?, string?)
            if type(origin) ~= "table" then return encode_plain(origin) end
            return ordered_object(origin, ORIGIN_ORDER)
        end,
        submission = function(submission: any): (string?, string?)
            if type(submission) ~= "table" then return encode_plain(submission) end
            return ordered_object(submission, SUBMISSION_ORDER, {
                answers = function(answers: any): (string?, string?)
                    return definition.encode_answers(def, answers), nil
                end,
            })
        end,
    }
    return ordered_object(meta, META_ORDER, encoders)
end

-- Reads a form out of an artifact row (meta already decoded). Returns
-- { definition, state, meta } or nil plus a reason when the artifact is not
-- a supported form.
function form_artifact.parse(artifact: any): (any, string?)
    if type(artifact) ~= "table" or type(artifact.meta) ~= "table" then
        return nil, "Artifact is not a form"
    end
    local meta = artifact.meta[form_artifact.META_KEY]
    if type(meta) ~= "table" or meta.version ~= form_artifact.META_VERSION then
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

-- Content JSON with props.state replaced, everything else kept.
function form_artifact.content_with_state(form: any, state: string): (string?, string?)
    return form_artifact.build_content(form.definition, state)
end

-- Encodes an object with keys in the given order. Each entry is
-- { key, value } or { key, raw = "<json>" }; a nil value is written as JSON
-- null, which json.encode cannot express (no null sentinel, probe J5).
function form_artifact.json_object(entries: {any}): string
    local parts = {}
    for _, entry in ipairs(entries) do
        local encoded
        if entry.raw ~= nil then
            encoded = entry.raw
        elseif entry[2] == nil then
            encoded = "null"
        else
            encoded = json.encode(entry[2])
        end
        table.insert(parts, (json.encode(entry[1])) .. ":" .. tostring(encoded))
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

return form_artifact
