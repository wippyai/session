local plugin = require("plugin")
local consts = require("consts")

-- The real session plugin, starting approval_session_worker as its Session
-- process.
local function run(args)
    consts.PROCESS.SESSION_ID = "app.runtime:approval_session_worker"
    return plugin.run(args)
end

return { run = run }
