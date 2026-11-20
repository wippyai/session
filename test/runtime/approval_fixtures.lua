local ctx = require("ctx")
local store = require("store")
local time = require("time")

-- Fixtures of the tool approval runtime suites (approval_runtime_test.lua):
-- the scripted model, the tools that record every launch, and a client
-- connection process. State is kept per session in the
-- app.runtime:approval_state store:
--   reply:<session_id>         the test process, which gets every report
--   script:<session_id>        { [model call number] = { content, calls } }
--   calls:<session_id>         model calls so far
--   launch:<session_id>:<id>   true once the tool call `id` started

local STATE = "app.runtime:approval_state"

local function state()
    local storage, err = store.get(STATE)
    if err then error(tostring(err)) end
    return storage
end

-- The model. The worker puts { session_id } in the provider context. Each
-- call reports `approval:provider_call` with the request messages, then
-- answers with the scripted step: tool calls ({ id, tool, n }) or a final
-- answer.
local function generate(request)
    local fixture = assert(ctx.get("fixture"), "the approval worker sets the provider fixture")
    local storage = state()
    local session_id = fixture.session_id
    local number = (storage:get("calls:" .. session_id) or 0) + 1
    storage:set("calls:" .. session_id, number)
    local reply = storage:get("reply:" .. session_id)
    if reply then
        process.send(reply, "approval:provider_call", { session_id = session_id, call_number = number,
            messages = request.messages })
    end
    local script = storage:get("script:" .. session_id) or {}
    local step = script[number] or {}
    local calls = {}
    for _, call in ipairs(step.calls or {}) do
        calls[#calls + 1] = { id = call.id, name = call.tool, registry_id = "app.runtime:" .. call.tool,
            arguments = '{"n":' .. tostring(call.n or 0) .. '}' }
    end
    return { success = true, result = {
        content = step.content or (#calls > 0 and "" or "Done."),
        tool_calls = calls,
        finish_reason = #calls > 0 and "tool_call" or "stop",
        tokens = { prompt_tokens = 1, completion_tokens = 1, total_tokens = 2 },
    } }
end

local function status()
    return { success = true, status = "healthy" }
end

-- Every tool of the approval agent. It records its launch under the call's
-- `n` argument and reports `approval:tool_ran` to the test.
local function tool(args)
    local run = ctx.get("agent_run")
    local host = type(run) == "table" and run.host or {}
    local session_id = tostring(host.session_id)
    local storage = state()
    local n = type(args) == "table" and args.n or nil
    storage:set("launch:" .. session_id .. ":" .. tostring(n), true)
    local reply = storage:get("reply:" .. session_id)
    if reply then process.send(reply, "approval:tool_ran", { session_id = session_id, n = n }) end
    return { ok = true, n = n }
end

-- A client connection: it only exists, so the plugin can monitor it, until
-- it gets `approval:close` or is terminated (at most 300 s). It forwards what
-- it receives to `args.forward_to`.
local function connection(args)
    local inbox = process.inbox()
    local deadline = time.after("300s")
    while true do
        local selected = channel.select({ inbox:case_receive(), deadline:case_receive() })
        if selected.channel == deadline then return { status = "timeout" } end
        local message = selected.value
        if message:topic() == "approval:close" then return { status = "closed" } end
        if args and args.forward_to then
            process.send(args.forward_to, "approval:conn", { conn = process.pid(), topic = message:topic(),
                data = message:payload():data() })
        end
    end
end

return { generate = generate, status = status, tool = tool, connection = connection }
