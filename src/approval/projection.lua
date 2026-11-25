local approval_repo = require("approval_repo")
local message_repo = require("message_repo")
local tool_meta = require("tool_meta")
local events = require("approval_events")
local logger = require("logger"):named("session.approval.projection")

-- The session fields of tool approval as clients read them
-- (docs/tool-approval-protocol.md sections 9 and 10, and the artifact read in
-- section 12): `tool_approval` with the grants, and `activity` with
-- `activity_revision`. One builder for the REST session read, the session
-- list, the open announcement and live session updates, so they cannot drift
-- apart.
--
-- An unprotected session (no stored activation, config.tool_approval) reads
-- as { active = false, revision = 0, grants = {} } without touching the
-- approval tables.
local projection = {}

-- Whether a decoded session config has the stored activation on.
function projection.active(config: any): boolean
    local stored = type(config) == "table" and config.tool_approval or nil
    return type(stored) == "table" and stored.active == true
end

-- A grant as clients see it (events.grant_object). The title is the tool's
-- registry title; for a delegation grant it is the target agent's title,
-- because that is what the grant lets run.
function projection.grant(grant: any): any
    if type(grant) ~= "table" then return nil end
    local title = nil
    local titled = grant.target_agent_id or grant.registry_id
    if type(titled) == "string" and titled ~= "" then
        title = tool_meta.title(tool_meta.entry(titled), titled)
    end
    return events.grant_object(grant, title)
end

-- The `tool_approval` field of a session whose decoded config is `config`
-- and whose current owner is `owner_id`: { active, revision (the stored
-- activation's revision), grants (active and suspended; revoked grants are
-- not listed) }. A grant ends when the session gets another owner, so only
-- the current owner's grants are listed. Returns the field, or nil and an
-- error.
function projection.session_field(session_id: string, config: any, owner_id: any): (any, string?)
    local stored = type(config) == "table" and config.tool_approval or nil
    if type(stored) ~= "table" then return { active = false, revision = 0, grants = {} }, nil end
    local grants, err = approval_repo.list_grants(nil, session_id)
    if not grants then return nil, tostring(err) end
    local list = {}
    for _, grant in ipairs(grants) do
        if grant.owner_id == owner_id then list[#list + 1] = projection.grant(grant) end
    end
    return {
        active = stored.active == true,
        revision = math.tointeger(tonumber(stored.revision) or 0) or 0,
        grants = list,
    }, nil
end

-- Adds the approval fields to a session object of a REST read or the session
-- list (session_repo.get or list_by_user, with config decoded and the activity
-- columns projected): `tool_approval`, and `activity` as JSON null when
-- nothing waits. Returns the session, or nil and an error.
function projection.apply_rest(session: any): (any, string?)
    local field, err = projection.session_field(session.session_id, session.config, session.user_id)
    if not field then return nil, err end
    session.tool_approval = field
    session.activity = events.activity_value(session.activity)
    session.activity_revision = tonumber(session.activity_revision) or 0
    return session, nil
end

-- The approval fields of the open announcement (the first session update a
-- Session process sends): `activity`, `activity_revision` and
-- `tool_approval`, read after recovery, for the session owner `owner_id`.
-- Returns them, or nil and an error.
function projection.announcement(session_id: string, config: any, owner_id: any): (any, string?)
    local current, read_err = approval_repo.read_activity(nil, session_id)
    if not current then return nil, tostring(read_err) end
    local field, field_err = projection.session_field(session_id, config, owner_id)
    if not field then return nil, field_err end
    return {
        activity = events.activity_value(current.activity),
        activity_revision = current.revision,
        tool_approval = field,
    }, nil
end

-- Publishes the `tool_approval` field of the session `ctx` serves as a live
-- session update, after a commit that changed the activation or a grant, and
-- records its revision in ctx.tool_approval_published_revision (the open
-- announcement sets it too). Returns true, or nil and an error after a
-- failed read, which is also logged. A ctx with no upstream to the clients
-- publishes nothing.
function projection.publish(ctx: any): (boolean?, string?)
    if type(ctx) ~= "table" or type(ctx.upstream) ~= "table" or type(ctx.upstream.update_session) ~= "function" then
        return true, nil
    end
    local field, err = projection.session_field(ctx.session_id, ctx.config, ctx.user_id)
    if not field then
        logger:warn("tool approval session field was not published",
            { session_id = ctx.session_id, error = tostring(err) })
        return nil, "Failed to publish the tool approval session field: " .. tostring(err)
    end
    -- The revision counts as published only once the update was delivered.
    local sent, send_err = ctx.upstream:update_session({ tool_approval = field })
    if not sent then
        logger:warn("tool approval session field was not delivered",
            { session_id = ctx.session_id, error = tostring(send_err) })
        return nil, "Failed to publish the tool approval session field: " .. tostring(send_err or "not delivered")
    end
    ctx.tool_approval_published_revision = field.revision
    return true, nil
end

-- The `tool_approval` object of an artifact read: { active } copied from
-- the artifact's session. An artifact without a session is not protected.
-- Returns the object, or nil and an error (a read failure; the caller fails
-- closed).
function projection.artifact_field(session_id: any): (any, string?)
    if type(session_id) ~= "string" or session_id == "" then return { active = false }, nil end
    local stored, err = approval_repo.read_activation(nil, session_id)
    if err then return nil, tostring(err) end
    return { active = type(stored) == "table" and stored.active == true }, nil
end

-- The tool name of the call row of an approval record, for its
-- tool_approval event.
function projection.function_name(record: any): any
    local row = message_repo.get(record.tool_message_id)
    return type(row) == "table" and type(row.metadata) == "table" and row.metadata.function_name or nil
end

return projection
