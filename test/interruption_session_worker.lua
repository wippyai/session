local session = require('session')
local llm = require('llm')
local time = require('time')

local function run(args)
    local fixture = args.user_metadata
    llm._models = {
        get_by_name = function(name)
            return { name = name, providers = { { id = 'scripted', provider_model = name, options = {} } } }
        end,
    }
    local calls = 0
    llm._providers = {
        driver_declares_legacy_reasoning_flag = function() return false end,
        open = function()
            return {
                generate = function(_, request)
                    calls = calls + 1
                    assert(process.send(fixture.reply_pid :: string, 'provider_prompt', request))
                    if fixture.interrupt and calls == 1 then
                        if fixture.interrupt == 'blocked' then time.sleep('1h') end
                        time.sleep('300ms')
                        if fixture.interrupt == 'crash' then error('Scripted provider interruption') end
                    end
                    return { success = true, result = {
                        content = 'Scripted answer', tool_calls = {}, finish_reason = 'stop',
                        tokens = { prompt_tokens = 1, completion_tokens = 1, total_tokens = 2 },
                    } }
                end,
            }
        end,
    }
    return session.run(args)
end

return { run = run }
