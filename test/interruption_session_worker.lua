local session = require('session')
local llm = require('llm')
local time = require('time')
local response_mapper = require('response_mapper')
local writer = require('writer')

local function run(args: any)
    local fixture = args.user_metadata
    llm._models = {
        get_by_name = function(name)
            return { name = name, providers = { { id = 'scripted', provider_model = name, options = {} } } }
        end,
    }
    if fixture.cancel_before_tools then
        local open_writer = writer.new
        writer.new = function(...)
            local instance, err = open_writer(...)
            if not instance then return nil, err end
            local add_response = instance.add_response
            instance.add_response = function(self, content, metadata, intents)
                local id, ids, store_err = add_response(self, content, metadata, intents)
                if id and #intents > 0 then
                    assert(process.send(fixture.reply_pid, 'tool_intent_persisted', {}))
                    time.sleep('300ms')
                end
                return id, ids, store_err
            end
            return instance
        end
    end
    local calls = 0
    llm._providers = {
        driver_declares_legacy_reasoning_flag = function() return false end,
        open = function()
            return {
                generate = function(_, request)
                    calls = calls + 1
                    request.worker_pid = process.pid()
                    request.responses_input = response_mapper.map_messages(request.messages)
                    request.responses_instructions = response_mapper.extract_instructions(request.messages)
                    assert(process.send(fixture.reply_pid :: string, 'provider_prompt', request))
                    if fixture.lifecycle and calls == 1 then time.sleep('1500ms') end
                    if fixture.interrupt and calls == 1 then
                        if fixture.interrupt == 'blocked' then time.sleep('1h') end
                        time.sleep('300ms')
                        if fixture.interrupt == 'crash' then error('Scripted provider interruption') end
                    end
                    return { success = true, result = {
                        content = fixture.lifecycle and calls == 1 and '' or 'Scripted answer',
                        tool_calls = fixture.lifecycle and calls == 1 and {{
                            id = 'lifecycle-call', name = 'lifecycle_tool', registry_id = 'app:lifecycle_tool', arguments = '{}',
                        }} or {}, finish_reason = 'stop',
                        tokens = { prompt_tokens = 1, completion_tokens = 1, total_tokens = 2 },
                    } }
                end,
            }
        end,
    }
    return session.run(args)
end

return { run = run }
