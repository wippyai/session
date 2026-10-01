local http = require("http")
local security = require("security")
local artifact_state_access = require("artifact_state_access")

-- GET/POST /artifact/{id}/state: session form state and answer submission.
-- Thin function entries over wippy.session.api:artifact_state_access: they
-- read the HTTP context and the actor.

local function context()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, nil, "Failed to get HTTP context"
    end
    return req, res, nil
end

local function get()
    local req, res, context_err = context()
    if not req then return nil, context_err end

    local actor = security.actor()
    if not actor then
        artifact_state_access.respond_unauthenticated(res)
        return
    end
    artifact_state_access.serve_get(req, res, actor:id())
end

local function post()
    local req, res, context_err = context()
    if not req then return nil, context_err end

    local actor = security.actor()
    if not actor then
        artifact_state_access.respond_unauthenticated(res)
        return
    end
    artifact_state_access.serve_submit(req, res, actor:id())
end

return {
    get = get,
    post = post,
}
