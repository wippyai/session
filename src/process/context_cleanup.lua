local time = require('time')
local logger = require('logger'):named('session.context_cleanup')
local staging = require('context_staging_repo')

local cleanup = {}
cleanup.INTERVAL = '10s'
cleanup.MAX_BATCHES = math.ceil(staging.MAX_TOTAL / staging.CLEANUP_BATCH)
cleanup._sweep = staging.cleanup

function cleanup.sweep()
    local removed = 0
    for _ = 1, cleanup.MAX_BATCHES do
        local count, err = cleanup._sweep()
        if err then return nil, err end
        removed = removed + count
        if count < staging.CLEANUP_BATCH then break end
    end
    return removed
end

function cleanup.run()
    local events = process.events()
    while true do
        local _, dispatch_err = require('dispatch_repo').classify_expired()
        if dispatch_err then logger:warn('Dispatch classification unavailable; retry scheduled') end
        local _, err = cleanup.sweep()
        -- Bootloader migrations may not be ready at service startup. Retry without exposing DB errors.
        if err then logger:warn('Context staging cleanup unavailable; retry scheduled') end
        local deadline = time.after(cleanup.INTERVAL)
        local selected = channel.select({ events:case_receive(), deadline:case_receive() })
        if not selected.ok or selected.channel == events and selected.value.kind == process.event.CANCEL then
            return { stopped = true }
        end
    end
end

return cleanup
