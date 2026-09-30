local http = require("http")
local artifact_repo = require("artifact_repo")
local session_repo = require("session_repo")

-- Owner check shared by the artifact endpoints (GET /artifact/{id} and
-- GET /artifact/{id}/content). A missing artifact, another user's artifact
-- and an artifact whose session is gone or belongs to someone else all
-- answer the same way: 404 with one generic body. A different status or
-- body for "not yours" would tell a caller that a foreign id exists, and no
-- repository or session error text reaches the client. The form state
-- endpoints follow the same rule in forms/state_service.lua.

local artifact_access = {}

local NOT_FOUND = "not_found"
local INTERNAL = "internal"

local function is_not_found(err)
    return string.find(string.lower(tostring(err)), "not found", 1, true) ~= nil
end

-- The artifact when `user_id` owns it, else nil and "not_found" or
-- "internal" (a storage failure).
function artifact_access.find_owned(user_id: string, artifact_id: string): (any, string?)
    local artifact, err = artifact_repo.get(artifact_id)
    if not artifact then
        if is_not_found(err) then return nil, NOT_FOUND end
        return nil, INTERNAL
    end
    if artifact.user_id ~= user_id then return nil, NOT_FOUND end
    if type(artifact.session_id) == "string" and artifact.session_id ~= "" then
        -- With the user id, another user's session reads as not found too.
        local session, session_err = session_repo.get(artifact.session_id, user_id)
        if not session then
            if is_not_found(session_err) then return nil, NOT_FOUND end
            return nil, INTERNAL
        end
    end
    return artifact, nil
end

-- Writes the response for a find_owned failure.
function artifact_access.respond_refused(res: any, reason: string?)
    res:set_content_type(http.CONTENT.JSON)
    if reason == NOT_FOUND then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = "Artifact not found" })
        return
    end
    res:set_status(http.STATUS.INTERNAL_ERROR)
    res:write_json({ success = false, error = "Failed to retrieve artifact" })
end

return artifact_access
