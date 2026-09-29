local http = require("http")
local artifact_repo = require("artifact_repo")
local artifact_projection = require("artifact_projection")
local session_repo = require("session_repo")
local security = require("security")

type ArtifactMetadataResponse = {
    uuid: string,
    type: string,
    kind: string,
    display_type: string?,
    title: string,
    created_at: string,
    updated_at: string,
    content_version: number,
    content_type: string?,
    description: string?,
    icon: string?,
    status: string?,
    page_id: string?,
    is_view_reference: boolean?,
    params: {[string]: any}?,
}

local function handler()
    -- Get response object
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    -- Security check - ensure user is authenticated
    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({
            success = false,
            error = "Authentication required"
        })
        return
    end

    -- Get user ID from the authenticated actor
    local user_id = actor:id()

    -- Get artifact ID from URL path
    local artifact_id = req:param("id")
    if not artifact_id or artifact_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({
            success = false,
            error = "Missing artifact ID in path"
        })
        return
    end

    -- Fetch the artifact from the repository
    local artifact, err = artifact_repo.get(artifact_id)
    if err then
        -- Handle not found error
        if err:match("not found") then
            res:set_status(http.STATUS.NOT_FOUND)
            res:set_content_type(http.CONTENT.JSON)
            res:write_json({
                success = false,
                error = "Artifact not found: " .. artifact_id
            })
            return
        end

        -- Handle other errors
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({
            success = false,
            error = "Failed to retrieve artifact: " .. err
        })
        return
    end

    -- Get the session to check ownership
    if artifact.session_id and artifact.session_id ~= "" then
        local session, session_err = session_repo.get(artifact.session_id)
        if session_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:set_content_type(http.CONTENT.JSON)
            res:write_json({
                success = false,
                error = "Failed to verify artifact ownership: " .. session_err
            })
            return
        end

        -- Verify the session belongs to the authenticated user
        if session.user_id ~= user_id then
            res:set_status(http.STATUS.FORBIDDEN)
            res:set_content_type(http.CONTENT.JSON)
            res:write_json({
                success = false,
                error = "Access denied: You don't have permission to access this artifact"
            })
            return
        end
    end

    if artifact.user_id ~= user_id then
        res:set_status(http.STATUS.FORBIDDEN)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({
            success = false,
            error = "Access denied: You don't have permission to access this artifact"
        })
        return
    end

    -- Convert to a client-friendly format. Shared with the artifact-updated
    -- event publisher so the two representations cannot drift apart.
    local response = artifact_projection.build(artifact)

    -- Return JSON metadata response
    res:set_content_type(http.CONTENT.JSON)
    res:set_status(http.STATUS.OK)
    res:write_json(response)
end

return {
    handler = handler
}
