local session_repo = require('session_repo')

local function run(request)
    local reply_pid = request.reply_pid
    local inbox = process.inbox()
    while true do
        local selected = inbox:case_receive()
        local message = channel.select({ selected })
        if not message.ok then return nil, 'attention state worker receive failed' end
        if message.value:topic() == 'attention_state_request' then
            local payload = message.value:payload():data()
            local state, update_err, current = session_repo.update_attention_context(
                payload.session_id, payload.enabled, payload.expected_revision, payload.updated_by
            )
            local sent, send_err = process.send(reply_pid, 'attention_state_result', {
                writer = payload.writer,
                state = state,
                error = update_err,
                current = current,
            })
            if not sent then return nil, send_err end
        elseif message.value:topic() == 'attention_state_stop' then
            return { status = 'stopped' }
        end
    end
end

return { run = run }
