local ctx = require("ctx")
local input_policy = require("input_policy")

local function handler(args)
    local run = ctx.get("agent_run")
    local host = type(run) == "table" and run.host
    if type(host) ~= "table" or host.kind ~= "session" or type(host.session_id) ~= "string" or host.session_id == "" then
        return nil, "Session input policy is available only inside a session"
    end
    local request, err = input_policy.normalize_request(args)
    if not request then return nil, err end
    -- The owning session validates and persists this directive before recording
    -- tool success. No caller-supplied session identifier is accepted.
    return {
        message = "Requested session input policy change.",
        _control = { config = { input_policy = request } },
    }
end

return { handler = handler }
