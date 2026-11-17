local consts = require("consts")
local input_policy = require("input_policy")

-- How a session's stored status reads while no session process runs it.
--
-- A stored "running" status with no registered session process is a turn
-- the runtime stopped from outside (a crash or a restart) that the plugin's
-- reconciliation (plugin.lua, settle_stale_running) has not settled yet. It
-- reads the way that reconciliation stores it: idle, with the interaction
-- recovery gives it (input_policy.recovery_snapshot), which takes input. So
-- a client never blocks Send on a session that will not resume on its own,
-- and status and interaction never disagree. The stored row is untouched;
-- the plugin still owns recovery.

local session_status = {}

-- The registered process of a session, or nil. Replaceable in tests.
function session_status._lookup(session_id: string): any
    return process.registry.lookup(consts.REGISTRY.SESSION .. session_id)
end

-- Whether `session` (a sessions row) is stored as running while no session
-- process is registered for it. `lookup` replaces the registry lookup.
function session_status.is_stale_running(session: any, lookup: ((string) -> any)?): boolean
    if session.status ~= consts.STATUS.RUNNING then return false end
    local find = lookup or session_status._lookup
    return not find(tostring(session.session_id))
end

-- The status and interaction clients see for `session` (a sessions row with
-- meta decoded). `lookup` replaces the registry lookup.
function session_status.effective(session: any, lookup: ((string) -> any)?): (string, any)
    if session_status.is_stale_running(session, lookup) then
        return consts.STATUS.IDLE, input_policy.recovery_snapshot(session, consts.STATUS.IDLE)
    end
    return session.status :: string, session.meta and session.meta.interaction
end

return session_status
