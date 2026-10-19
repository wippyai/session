local session = require('session')
local llm = require('llm')
local time = require('time')
local writer = require('writer')

local function run(args: any)
    local fixture = args.user_metadata
    local calls = 0
    llm._models = {
        get_by_name = function(name)
            calls = calls + 1
            local request_fixture = {}
            for key, value in pairs(fixture) do request_fixture[key] = value end
            request_fixture.worker_pid = process.pid()
            request_fixture.call_number = calls
            return { name = name, providers = { { id = 'app:interruption_provider', provider_model = name,
                context = { fixture = request_fixture } } } }
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
    return session.run(args)
end

return { run = run }
