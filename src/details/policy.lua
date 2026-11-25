local consts = require("consts")
local masks = require("masks")
local registry = require("registry")
local agent_registry = require("agent_registry")
local logger = require("logger"):named("session.details")

local policy: any = { PARTS = { "arguments", "result", "error", "timing" }, TRAIT_ID = "wippy.session.traits:call_details" }
local rank = { none = 0, summary = 1, full = 2 }
policy._app = nil :: any
policy._tool = nil :: any
policy._agent = nil :: any

function policy.level(value: any): string
    if rank[value] ~= nil then return value end
    return "none"
end

function policy.lowest(left: any, right: any): string
    left, right = policy.level(left), policy.level(right)
    return rank[left] <= rank[right] and left or right
end

function policy.tool(id: any): any
    if policy._tool then return policy._tool(id) end
    if type(id) ~= "string" or id == "" then return {} end
    local entry = registry.get(id)
    return entry or {}
end

function policy.private_name(name: string): boolean
    local entries = registry.find({ ["meta.type"] = "tool" }) or {}
    for _, entry in ipairs(entries) do
        local meta = entry.meta or {}
        if meta.private == true and (entry.id == name or entry.name == name or meta.llm_alias == name) then return true end
    end
    return false
end

function policy.agent(config: any, agent_id: any): any
    if policy._agent then return policy._agent(config, agent_id) end
    if type(config.active_traits) == "table" then return config.active_traits end
    if type(agent_id) ~= "string" or agent_id == "" then return {} end
    local spec = agent_registry.get_by_id(agent_id) or agent_registry.get_by_name(agent_id)
    if type(spec) ~= "table" then
        logger:warn("call details agent could not be read")
        return false
    end
    return spec.traits or {}
end

local function valid_layer(layer: any, tools: boolean): boolean
    if layer == nil then return true end
    if type(layer) ~= "table" then return false end
    for key, value in pairs(layer) do
        if key == "tools" and tools then
            if type(value) ~= "table" then return false end
            for id, override in pairs(value) do
                if type(id) ~= "string" or not valid_layer(override, false) then return false end
            end
        elseif rank[value] == nil or (key ~= "thinking" and key ~= "arguments"
            and key ~= "result" and key ~= "error" and key ~= "timing") then
            return false
        end
    end
    return true
end

function policy.trait(traits: any): any
    if traits == nil then return {} end
    if type(traits) ~= "table" then return false end
    local found, context = false, {}
    for _, entry in ipairs(traits) do
        local id = type(entry) == "table" and entry.id or entry
        if id == policy.TRAIT_ID then
            if found then return false end
            found = true
            if type(entry) == "table" then context = entry.context else context = {} end
            if context == nil then context = {} end
        end
    end
    if not valid_layer(context, true) then return false end
    return context
end

-- Omitted limits inherit; malformed limits deny.
function policy.resolve(app: any, agent: any, display: any, session: any, tool_id: any): any
    local levels: any = {}
    local valid_agent = agent ~= false and valid_layer(agent, true)
    if not valid_agent then logger:warn("invalid call details agent trait") end
    local override = valid_agent and type(agent) == "table" and type(agent.tools) == "table" and agent.tools[tool_id] or nil
    for _, part in ipairs(policy.PARTS) do
        local level = consts.normalize_tool_details(app)
        if not valid_agent then level = "none" end
        for _, layer in ipairs({ agent == nil and {} or agent, override == nil and {} or override,
            display == nil and {} or display, session == nil and {} or session }) do
            if type(layer) ~= "table" then level = "none"
            elseif layer[part] ~= nil then
                if rank[layer[part]] == nil then logger:warn("invalid call details part level", { part = part }) end
                level = policy.lowest(level, layer[part])
            end
        end
        levels[part] = level
    end
    return levels
end

function policy.revision(config: any): number
    local revision = type(config) == "table" and config.details_revision or nil
    if type(revision) == "number" and revision >= 0 and revision % 1 == 0 then return revision end
    return 0
end

function policy.current(config: any, agent_id: any, tool_id: any, arguments: any): any
    config = type(config) == "table" and config or {}
    local entry = policy.tool(tool_id)
    local meta = type(entry.meta) == "table" and entry.meta or {}
    local display = meta.display
    local app = policy._app and policy._app() or consts.session_show_tool_details()
    local traits = policy.agent(config, agent_id or config.agent_id)
    local levels = policy.resolve(app, policy.trait(traits), display, config.call_details, tool_id)
    local marked, schema_valid = masks.schema(meta.input_schema or entry.input_schema, arguments)
    local sensitive = type(display) == "table" and display.sensitive or nil
    local paths = { arguments = marked, result = {} }
    if not schema_valid then
        levels.arguments, paths.arguments = "none", { "" }
        logger:warn("invalid call details input schema")
    end
    if sensitive ~= nil and type(sensitive) ~= "table" then
        levels.arguments, levels.result, levels.error = "none", "none", "none"
        paths.arguments, paths.result = { "" }, { "" }
        logger:warn("invalid call details sensitive marks")
    elseif sensitive then
        for _, part in ipairs({ "arguments", "result" }) do
            if sensitive[part] ~= nil then
                if masks.valid(sensitive[part]) then paths[part] = masks.union(paths[part], sensitive[part])
                else
                    levels[part], paths[part] = "none", { "" }
                    if part == "result" then levels.error = "none" end
                    logger:warn("invalid call details mask", { part = part })
                end
            end
        end
    end
    levels.masks = paths
    return levels
end

function policy.stamp(config: any, agent_id: any, tool_id: any, arguments: any): any
    local stamp = policy.current(config, agent_id, tool_id, arguments)
    stamp.v, stamp.policy_revision = 1, 1
    return stamp
end

function policy.valid_stamp(stamp: any): boolean
    if type(stamp) ~= "table" or stamp.v ~= 1 or type(stamp.policy_revision) ~= "number"
        or stamp.policy_revision < 1 or stamp.policy_revision % 1 ~= 0 or type(stamp.masks) ~= "table" then return false end
    for _, part in ipairs(policy.PARTS) do if rank[stamp[part]] == nil then return false end end
    return masks.valid(stamp.masks.arguments) and masks.valid(stamp.masks.result)
end

function policy.read(stamp: any, current: any): any
    local out: any = { masks = { arguments = {}, result = {} } }
    local valid = policy.valid_stamp(stamp)
    for _, part in ipairs(policy.PARTS) do
        out[part] = valid and policy.lowest(stamp[part], current[part]) or "none"
    end
    if valid then
        out.masks.arguments = masks.union(stamp.masks.arguments, current.masks.arguments)
        out.masks.result = masks.union(stamp.masks.result, current.masks.result)
    end
    return out
end

return policy