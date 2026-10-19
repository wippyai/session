local store = require("store")
local time = require("time")

local function generate(_args)
    local storage = assert(store.get("app.lifecycle:state"))
    local count = (storage:get("count") or 0) + 1
    assert(storage:set("count", count))
    local scenario = assert(storage:get("scenario"))
    storage:release()
    if count == 1 then
        local release = process.listen("lifecycle:release")
        local control = process.listen("lifecycle:control")
        assert(process.send(scenario.parent, "lifecycle:model_ready", { pid = process.pid() }))
        local deadline = time.timer("10s")
        local selected
        repeat
            selected = channel.select({ release:case_receive(), control:case_receive(), deadline:channel():case_receive() })
            if selected.channel == control then
                local request = selected.value
                assert(process.send(request.pid, request.topic, request.data or {}))
                assert(process.send(scenario.parent, "lifecycle:control_done", {}))
            end
        until selected.channel ~= control
        deadline:stop()
        process.unlisten(release)
        process.unlisten(control)
        assert(selected.channel == release, "model release deadline")
        return { success = true, result = { content = "", tool_calls = {
            { id = "audit-call", name = "edit", arguments = "{}" },
        } }, tokens = { prompt_tokens = 10, completion_tokens = 5, total_tokens = 15 },
            finish_reason = "tool_call" }
    end
    return { success = true, result = { content = "Edit completed.", tool_calls = {} },
        tokens = { prompt_tokens = 10, completion_tokens = 5, total_tokens = 15 }, finish_reason = "stop" }
end

local function edit()
    local storage = assert(store.get("app.lifecycle:state"))
    local scenario = assert(storage:get("scenario"))
    storage:release()
    local db = assert(require("sql").get("app:db"))
    local _, err = db:execute("INSERT INTO session_lifecycle_effects (id) VALUES ($1)", { scenario.id })
    db:release()
    if err then return nil, err end
    return "Stored edit."
end

return { generate = generate, edit = edit }
