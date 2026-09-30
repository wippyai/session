local http = require("http")
local json = require("json")
local artifact_repo = require("artifact_repo")
local artifact_projection = require("artifact_projection")
local renderer = require("renderer")

-- Request handling of the artifact endpoints (GET /artifact/{id} and
-- GET /artifact/{id}/content) once the caller is authenticated; the
-- function entries only read the HTTP context and the actor. Both read the
-- artifact through artifact_repo.get_owned, so a missing artifact, another
-- user's artifact and an artifact whose session is gone or belongs to
-- someone else all answer the same way: 404 with one generic body. A
-- different status or body for "not yours" would tell a caller that a
-- foreign id exists, and no repository or session error text reaches the
-- client. The form state endpoints use the same owner check
-- (forms/state_service.lua).

local artifact_access = {}

-- Writes the response for a get_owned error.
local function respond_refused(res: any, err: any)
    res:set_content_type(http.CONTENT.JSON)
    if artifact_repo.is_not_found(err) then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = "Artifact not found" })
        return
    end
    res:set_status(http.STATUS.INTERNAL_ERROR)
    res:write_json({ success = false, error = "Failed to retrieve artifact" })
end

-- GET /artifact/{id}: the artifact metadata, for `user_id` (authenticated).
function artifact_access.serve_metadata(req: any, res: any, user_id: string)
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

    -- A foreign artifact answers exactly like a missing one.
    local artifact, refused = artifact_repo.get_owned(user_id, artifact_id :: string)
    if not artifact then
        respond_refused(res, refused)
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

-- GET /artifact/{id}/content: the artifact content, for `user_id`
-- (authenticated).
function artifact_access.serve_content(req: any, res: any, user_id: string)
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

    -- A foreign artifact answers exactly like a missing one: 404 with a
    -- generic body, not 403, which confirmed that the id exists.
    local artifact, refused = artifact_repo.get_owned(user_id, artifact_id :: string)
    if not artifact then
        respond_refused(res, refused)
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

return artifact_access
