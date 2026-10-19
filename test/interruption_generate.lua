local ctx = require('ctx')
local time = require('time')
local response_mapper = require('response_mapper')

local function run(request)
    local fixture = assert(ctx.get('fixture'))
    request.worker_pid = fixture.worker_pid
    request.responses_input = response_mapper.map_messages(request.messages)
    request.responses_instructions = response_mapper.extract_instructions(request.messages)
    assert(process.send(fixture.reply_pid, 'provider_prompt', request))
    if fixture.lifecycle and fixture.call_number == 1 then time.sleep('1500ms') end
    if fixture.interrupt and fixture.call_number == 1 then
        if fixture.interrupt == 'blocked' or fixture.interrupt == 'crash' then time.sleep('1h') end
        time.sleep('300ms')
    end
    return { success = true, result = {
        content = fixture.lifecycle and fixture.call_number == 1 and '' or 'Scripted answer',
        tool_calls = fixture.lifecycle and fixture.call_number == 1 and {{
            id = 'lifecycle-call', name = 'lifecycle_tool', registry_id = 'app:lifecycle_tool', arguments = '{}',
        }} or {}, finish_reason = 'stop',
        tokens = { prompt_tokens = 1, completion_tokens = 1, total_tokens = 2 },
    } }
end

return {
    run = run,
    status = function() return { success = true, status = 'healthy' } end,
}
