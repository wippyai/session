local json = require("json")
local consts = require("consts")

-- Shapes the metadata-response view of an artifact row. Used by both the GET
-- /artifact/{id} endpoint (src/api/get_artifact.lua) and the artifact-updated
-- event publisher (artifact_events.lua) so the two representations cannot
-- drift apart.
--
-- `artifact` is a row as returned by artifact_repo.get/update-style reads:
-- meta already decoded to a table (or nil/absent), content_version numeric.
local artifact_projection = {}

function artifact_projection.build(artifact)
    local response = {
        uuid = artifact.artifact_id,
        type = artifact.kind,
        kind = artifact.kind,
        title = artifact.title,
        created_at = artifact.created_at,
        updated_at = artifact.updated_at,
        content_version = artifact.content_version or 1,
    }

    if artifact.meta then
        response.content_type = artifact.meta.content_type
        response.description = artifact.meta.description
        response.icon = artifact.meta.icon
        response.status = artifact.meta.status
        response.display_type = artifact.meta.display_type

        -- Add page reference specific data if this is a view_ref artifact
        if artifact.kind == consts.ARTIFACT_TYPES.VIEW_REF then
            response.page_id = artifact.meta.page_id
            response.is_view_reference = true
            response.display_type = artifact.meta.display_type or consts.ARTIFACT_DISPLAY.STANDALONE
            -- Legacy overload, deliberately retained: existing clients (the
            -- <w-artifact> renderer among them) read the display mode from
            -- `type` for view_ref artifacts. New clients should read
            -- `display_type`, which carries the same value for every kind.
            response.type = artifact.meta.display_type or consts.ARTIFACT_DISPLAY.STANDALONE

            -- Also get the params if this is a view_ref
            if artifact.content and artifact.content ~= "" then
                local params, decode_err = json.decode(artifact.content :: string)
                if not decode_err then
                    response.params = params
                end
            end
        end
    end

    return response
end

return artifact_projection
