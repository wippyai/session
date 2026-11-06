local artifact_projection = require("artifact_projection")

-- Publishes artifact-update events to the owning user's relay hub, if one is
-- connected. Mirrors the process-registry lookup + process.send pattern used
-- by keeper's events/api/subscribe.lua and dataflow's persist/commit.lua:
-- the hub process is addressed as "user.<user_id>" in the process registry,
-- never by the caller's own id (the caller may not be the owner, and is not
-- necessarily who should receive the update).
--
-- Call publish_updated only after the write that produced `artifact` has
-- committed - this module never writes anything itself.
local HUB_PREFIX = "user."

local artifact_events = {}

-- Look up the owner's relay hub pid (isolated so tests can mock it).
function artifact_events._lookup_hub(user_id)
    return process.registry.lookup(HUB_PREFIX .. user_id)
end

-- Send to the hub pid (isolated so tests can mock it).
function artifact_events._send(pid, topic, payload)
    process.send(pid, topic, payload)
end

-- Publish an "artifact:<artifact_id>" event carrying the same projection the
-- GET /artifact/{id} endpoint returns. If the owner has no active hub (no
-- open tab) this silently does nothing - there is nobody to tell.
function artifact_events.publish_updated(artifact)
    if not artifact or not artifact.user_id or artifact.user_id == "" then
        return false
    end

    if not artifact.artifact_id or artifact.artifact_id == "" then
        return false
    end

    local pid = artifact_events._lookup_hub(artifact.user_id)
    if not pid then
        return false
    end

    local payload = artifact_projection.build(artifact)
    artifact_events._send(pid, "artifact:" .. artifact.artifact_id, payload)
    return true
end

return artifact_events
