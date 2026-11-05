local plugin = require('plugin')
local consts = require('consts')

local function run(args)
    consts.PROCESS.SESSION_ID = 'app:interruption_session_worker'
    return plugin.run(args)
end

return { run = run }
