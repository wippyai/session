local cleanup = require('context_cleanup')
local env = require('env')
local sql = require('sql')
local security = require('security')

local function run(args)
    local reply_pid = args.reply_pid :: string
    cleanup.INTERVAL = '20ms'
    local sweep, calls = cleanup._sweep, 0
    cleanup._sweep = function()
        calls = calls + 1
        local count, err
        if args.fail_first and calls == 1 then err = 'CONTEXT_STAGING_UNAVAILABLE'
        else count, err = sweep() end
        local diagnostics
        if err then
            local resource, env_err = env.get('wippy.session.env:database_resource')
            local db, db_err = sql.get(resource)
            diagnostics = { env_allowed = security.can('env.get', 'wippy.session.env:database_resource'),
                db_allowed = security.can('db.get', 'app:db'), resource_present = type(resource) == 'string',
                env_error = env_err ~= nil, db_error = db_err ~= nil,
                foreign_db_allowed = security.can('db.get', 'other:db'), session_write_allowed = security.can('write', 'session:other') }
            if db then db:release() end
        end
        local sent, send_err = process.send(reply_pid, 'cleanup_sweep', { count = count, unavailable = err ~= nil, calls = calls, diagnostics = diagnostics })
        if not sent then error('cleanup worker send failed') end
        return count, err
    end
    return cleanup.run()
end

return { run = run }
