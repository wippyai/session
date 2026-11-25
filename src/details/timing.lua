local time = require("time")

local timing = {}
timing._now = nil :: any
local function now(): number
    if timing._now then return timing._now() end
    return time.now():unix_nano() / 1000000
end

-- Observe the executor actually used by the caller. Keep its actor, scope
-- and context chain intact; start the clock only at dispatch.
function timing.attach(caller: any): any
    local starts, durations = {}, {}
    local original = caller.executor
    if original == nil then return durations, function() end end
    local function wrap(executor: any, call_id: any): any
        return {
            with_actor = function(_, actor)
                local next_executor, err = executor:with_actor(actor)
                if not next_executor then return nil, err end
                return wrap(next_executor, call_id), err
            end,
            with_scope = function(_, scope)
                local next_executor, err = executor:with_scope(scope)
                if not next_executor then return nil, err end
                return wrap(next_executor, call_id), err
            end,
            with_context = function(_, context)
                local next_executor, err = executor:with_context(context)
                if not next_executor then return nil, err end
                return wrap(next_executor, context.call_id), err
            end,
            async = function(_, id, args)
                local start = now()
                local command, err = executor:async(id, args)
                if command and call_id then starts[call_id] = start end
                return command, err
            end,
            call = function(_, id, args)
                local start = now()
                local result, err = executor:call(id, args)
                if call_id then durations[call_id] = math.max(0, math.floor(now() - start)) end
                return result, err
            end,
        }
    end
    caller.executor = wrap(original, nil)
    local previous = caller.result_listener
    if type(caller.set_result_listener) == "function" then
        caller:set_result_listener(function(call_id, result)
            if starts[call_id] then durations[call_id] = math.max(0, math.floor(now() - starts[call_id])) end
            if previous then return previous(call_id, result) end
        end)
    end
    return durations, function()
        caller.executor = original
        if type(caller.set_result_listener) == "function" then caller:set_result_listener(previous) end
    end
end

return timing