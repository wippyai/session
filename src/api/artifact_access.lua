local http = require("http")
local artifact_repo = require("artifact_repo")

-- The refusal of the artifact endpoints (GET /artifact/{id} and
-- GET /artifact/{id}/content) when artifact_repo.get_owned finds no artifact
-- the caller owns. A missing artifact, another user's artifact and an
-- artifact whose session is gone or belongs to someone else all answer the
-- same way: 404 with one generic body. A different status or body for "not
-- yours" would tell a caller that a foreign id exists, and no repository or
-- session error text reaches the client. The form state endpoints use the
-- same owner check (forms/state_service.lua).

local artifact_access = {}

-- Writes the response for a get_owned error.
function artifact_access.respond_refused(res: any, err: any)
    res:set_content_type(http.CONTENT.JSON)
    if artifact_repo.is_not_found(err) then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = "Artifact not found" })
        return
    end
    res:set_status(http.STATUS.INTERNAL_ERROR)
    res:write_json({ success = false, error = "Failed to retrieve artifact" })
end

return artifact_access
