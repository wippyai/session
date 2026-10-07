local store = require("store")
local time = require("time")

local function state()
    local storage, err = store.get("app.runtime:state")
    if err then error(tostring(err)) end
    return storage
end

local function generate(args)
    local storage = state()
    local requests = storage:get("requests") or {}
    requests[#requests + 1] = { model = args.model, messages = args.messages }
    storage:set("requests", requests)
    local scenario = storage:get("scenario")
    local calls = {}
    local content = "The help agent completed the handoff."
    if args.model == "router" then
        content = "Transferring the request."
        calls = {{ id = "call-handoff", name = "handoff", arguments = "{}" }}
        if scenario.mixed or scenario.malformed then
            calls[#calls + 1] = { id = "call-failure", name = "failing_tool", arguments = "{}" }
        end
        if scenario.malformed then
            table.insert(calls, scenario.malformed == "artifacts" and 2 or 1,
                { id = "call-malformed", name = "malformed_effects", arguments = "{}" })
        end
    end
    return {
        success = true,
        result = { content = content, tool_calls = calls },
        tokens = { prompt_tokens = 10, completion_tokens = 5, total_tokens = 15 },
        finish_reason = #calls > 0 and "tool_call" or "stop",
    }
end

local function handoff()
    local storage = state()
    local scenario = storage:get("scenario")
    if scenario.stop then
        local release = process.listen("fixture:release")
        process.send(scenario.parent, "fixture:handoff_ready", { pid = process.pid() })
        local timer = time.timer("5s")
        local selected = channel.select({ release:case_receive(), timer:channel():case_receive() })
        timer:stop()
        if selected.channel ~= release then error("handoff release deadline exceeded") end
    end
    return {
        message = "Handoff accepted.",
        _control = {
            config = { agent = "app.runtime:help" },
            context = { session = { set = { handoff_note = "Keep the earlier conversation." } } },
        },
    }
end

local function held_prompt()
    local scenario = state():get("scenario")
    if scenario and scenario.hold_prompt then
        local release = process.listen("fixture:prompt_release")
        process.send(scenario.parent, "fixture:prompt_ready", { pid = process.pid() })
        local timer = time.timer("5s")
        local selected = channel.select({ release:case_receive(), timer:channel():case_receive() })
        timer:stop()
        process.unlisten(release)
        if selected.channel ~= release then error("prompt release deadline exceeded") end
    end
    return ""
end

local function malformed_effects()
    if state():get("scenario").malformed == "artifacts" then
        return { message = "Malformed control.", _control = { artifacts = 42 } }
    end
    return { message = "Malformed control.", _control = true }
end

return {
    generate = generate,
    handoff = handoff,
    malformed_effects = malformed_effects,
    held_prompt = held_prompt,
    fail = function() error("Expected mixed-result failure") end,
}
