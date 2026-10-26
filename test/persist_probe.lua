local contract = require('contract')
local json = require('json')
local sql = require('sql')

-- Reads the committed record named by refs.event_id through the supplied
-- run_context and stores what it found for the runtime test to inspect.
local function apply(payload)
    if payload.phase ~= 'after_persist' then return {} end
    local event_id = payload.refs and payload.refs.event_id
    local run_context = payload.run_context or {}
    local definition, definition_err = contract.get(run_context.contract)
    if not definition then return nil, 'run_context contract: ' .. tostring(definition_err) end
    local reader, open_err = definition:open(run_context.binding)
    if not reader then return nil, 'run_context open: ' .. tostring(open_err) end
    local history, history_err = reader:get_history({
        host = run_context.host, agent = run_context.agent,
        selector = { mode = 'range', to_id = event_id },
    })
    local last = history and history.events and history.events[#history.events]
    local capture = assert(json.encode({
        event_id = event_id,
        history_error = history_err and tostring(history_err) or nil,
        last_id = last and last.id,
        last_role = last and last.role,
        last_content = last and type(last.content) == 'string' and last.content or nil,
        outcome = payload.outcome,
    }))
    local db = assert(sql.get('app:db'))
    local _, insert_err = db:execute('INSERT INTO interruption_prompt_captures (label, request_id, payload) VALUES ($1, $2, $3)',
        { 'after_persist:' .. tostring(payload.host and payload.host.session_id), tostring(event_id), capture })
    db:release()
    if insert_err then return nil, tostring(insert_err) end
    return {}
end

return { apply = apply }
