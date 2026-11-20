local http = require("http")
local security = require("security")
local agent_registry = require("agent_registry")

-- Returns one public agent's title and start prompts for the Web Host composer.
local api = {
    _http = http,
    _security = security,
    _agent_registry = agent_registry,
}

-- An unknown, non-agent or private agent gets the same answer, so the
-- response does not show whether a private agent exists. The json module has
-- no null value, so the body is written as text.
api.NO_AGENT_BODY = '{"success":true,"agent":null}'

-- Finds a gen1 agent by registry id ("ns:name") or by meta.name.
local function find_agent(identifier: string)
    if identifier:find(":", 1, true) then
        return api._agent_registry.get_by_id(identifier)
    end
    return api._agent_registry.get_by_name(identifier)
end

-- The Web Host renders start prompts as text, so only strings are returned.
-- A start_prompts value that is not a list gives no prompts.
local function start_prompts_of(spec): {string}
    local prompts: {string} = {}
    if type(spec.start_prompts) ~= "table" then
        return prompts
    end
    for _, item in ipairs(spec.start_prompts) do
        if type(item) == "string" then
            prompts[#prompts + 1] = item
        end
    end
    return prompts
end

local function handler()
    local res = api._http.response()
    local req = api._http.request()
    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    res:set_content_type(api._http.CONTENT.JSON)

    if not api._security.actor() then
        res:set_status(api._http.STATUS.UNAUTHORIZED)
        res:write_json({
            success = false,
            error = "Authentication required"
        })
        return
    end

    local agent_param = req:query("agent")
    if not agent_param or agent_param == "" then
        res:set_status(api._http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Missing 'agent' query parameter"
        })
        return
    end

    local spec = find_agent(agent_param)
    if not spec or spec.meta.private then
        res:set_status(api._http.STATUS.OK)
        res:write(api.NO_AGENT_BODY)
        return
    end

    res:set_status(api._http.STATUS.OK)
    res:write_json({
        success = true,
        agent = {
            id = spec.id,
            name = spec.name,
            title = spec.title ~= "" and spec.title or spec.name,
            start_prompts = start_prompts_of(spec)
        }
    })
end

api.handler = handler

return api
