local http = require("http")
local artifact_access = require("artifact_access")
local artifact_repo = require("artifact_repo")
local artifact_projection = require("artifact_projection")
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

-- Answers one request for `user_id`, already authenticated.
local function serve(req: any, res: any, user_id: string)
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

    -- A foreign artifact answers exactly like a missing one (artifact_access).
    local artifact, refused = artifact_repo.get_owned(user_id, artifact_id :: string)
    if not artifact then
        artifact_access.respond_refused(res, refused)
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

    serve(req, res, actor:id())
end

return {
    handler = handler,
    -- Test seam: the request handling after authentication, which a unit
    -- test can drive with a fake request and response.
    _serve = serve,
}
