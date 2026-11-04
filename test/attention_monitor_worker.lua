local time = require('time')

-- Only a hang reaches this: every wait ends on its condition, and normal cases take
-- seconds that grow under load.
local EVENT_DEADLINE = '30s'

local function run(args)
    local owner_pid = args.reply_pid
    local inbox = process.inbox()
    local deadline = time.after(EVENT_DEADLINE)
    local sent, send_err = process.send(owner_pid, 'attention_monitor_ready', {})
    if not sent then
        return nil, send_err
    end
    while true do
        local selected = channel.select({ inbox:case_receive(), deadline:case_receive() })
        if selected.channel == deadline then
            return nil, 'monitor fixture deadline expired'
        end
        if not selected.ok then
            return nil, 'monitor fixture inbox closed'
        end
        local message = selected.value
        if message:from() == owner_pid then
            if message:topic() == 'attention_monitor_stop' then
                return true
            end
            if message:topic() == 'attention_monitor_ping' then
                local pong_sent, pong_err = process.send(owner_pid, 'attention_monitor_pong', {})
                if not pong_sent then
                    return nil, pong_err
                end
            end
        end
    end
end

return { run = run }
