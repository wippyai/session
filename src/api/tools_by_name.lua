local http = require("http")
local security = require("security")
local registry = require("registry")
local tools = require("tools")

-- Returns tool titles by the names that tool calls carry, for the Web Host
-- tool-call rows. tools.find_tools is not used: it runs the input schema
-- processors and the store cache for every tool and drops duplicate names.
local api = {
    _http = http,
    _security = security,
    _registry = registry,
    _tools = tools,
}

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

    local tools_param = req:query("tools")
    if not tools_param or tools_param == "" then
        res:set_status(api._http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Missing 'tools' query parameter. Expected a comma-separated list of tool names."
        })
        return
    end

    local entries, err = api._registry.find({
        [".kind"] = "function.*",
        ["meta.type"] = "tool"
    })
    if err then
        res:set_status(api._http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    -- A tool call carries the name the model used: meta.llm_alias, or the
    -- sanitized id name when there is no alias. The registry id also matches.
    local by_name = {}
    for _, entry in ipairs(entries or {}) do
        local llm_name = api._tools.get_tool_name(entry)
        local found = {
            name = llm_name,
            title = (entry.meta and entry.meta.title) or llm_name
        }
        if by_name[llm_name] == nil then
            by_name[llm_name] = found
        end
        by_name[entry.id] = found
    end

    -- Unknown names are left out. An empty result must still encode as {}.
    local result = table.create(0, 1)
    for item in string.gmatch(tools_param, "[^,]+") do
        local name = item:match("^%s*(.-)%s*$")
        if name ~= "" and by_name[name] then
            result[name] = by_name[name]
        end
    end

    res:set_status(api._http.STATUS.OK)
    res:write_json({
        success = true,
        tools = result
    })
end

api.handler = handler

return api
