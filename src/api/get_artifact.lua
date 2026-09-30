local http = require("http")
local artifact_access = require("artifact_access")
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

    artifact_access.serve_metadata(req, res, actor:id())
end

return {
    handler = handler
}
