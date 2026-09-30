local http = require("http")
local json = require("json")
local artifact_repo = require("artifact_repo")
local artifact_access = require("artifact_access")
local security = require("security")
local renderer = require("renderer")

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

    -- A foreign artifact answers exactly like a missing one (artifact_access):
    -- 404 with a generic body, not 403, which confirmed that the id exists.
    local artifact, refused = artifact_access.find_owned(user_id, artifact_id :: string)
    if not artifact then
        artifact_access.respond_refused(res, refused)
        return
    end

    -- Special handling for view_ref artifacts
    if artifact.kind == "view_ref" and artifact.meta then
        local page_id = artifact.meta.page_id
        if not page_id then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:set_content_type(http.CONTENT.JSON)
            res:write_json({
                success = false,
                error = "Invalid page reference: missing page_id"
            })
            return
        end

        -- Get the content (which contains our JSON parameters)
        local content_json, content_err = artifact_repo.get_content(artifact_id)
        if content_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:set_content_type(http.CONTENT.JSON)
            res:write_json({
                success = false,
                error = "Failed to retrieve page parameters: " .. content_err
            })
            return
        end

        -- Parse the JSON parameters
        local params = {}
        if content_json and content_json ~= "" then
            local decoded, json_err = json.decode(content_json :: string)
            if json_err then
                res:set_status(http.STATUS.INTERNAL_ERROR)
                res:set_content_type(http.CONTENT.JSON)
                res:write_json({
                    success = false,
                    error = "Failed to parse parameters: " .. json_err
                })
                return
            end
            params = decoded
        end
        params.artifact_id = artifact_id

        -- Get any additional query params from current request
        local query = {}
        for name, value in pairs(req:query_params()) do
            query[name] = value
        end

        -- Render the page using all params from artifact with empty query
        local rendered_content, render_err = renderer.render(page_id, params, query)

        if render_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:set_content_type(http.CONTENT.JSON)
            res:write_json({
                success = false,
                error = "Failed to render page reference: " .. render_err
            })
            return
        end

        -- Set content type and return the rendered content
        res:set_content_type(artifact.meta.content_type or "text/html")
        res:set_status(http.STATUS.OK)
        res:write(rendered_content :: string)
        return
    end

    -- For other artifact types, continue with normal content retrieval
    local content, content_err = artifact_repo.get_content(artifact_id)
    if content_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({
            success = false,
            error = "Failed to retrieve artifact content: " .. content_err
        })
        return
    end

    -- Default content type if not specified in metadata
    local content_type = "text/plain"

    -- Get content type from metadata if available
    if artifact.meta and artifact.meta.content_type then
        content_type = artifact.meta.content_type
    end

    -- Set content type and return the content
    res:set_content_type(content_type :: string)
    res:set_status(http.STATUS.OK)
    res:write(content :: string)
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
