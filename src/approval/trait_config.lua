-- Settings of the wippy.session.traits:tool_approval trait (EE2-2710,
-- architecture 4.3). normalize() validates the trait context an agent author
-- wrote and fills the defaults. effective() combines the stored, sticky
-- activation with the current agent's settings into the policy the evaluator
-- reads. Pure functions: no registry, database or logger access.
--
-- Invalid values are errors, never silent defaults: activation fails closed
-- with tool_approval_config_invalid and no model call. Unknown keys are errors
-- too, because a misspelt key (for example `requre: all`) would otherwise
-- leave the weaker default in force.
local trait_config = {}

trait_config.TRAIT_ID = "wippy.session.traits:tool_approval"
trait_config.ERROR_CODE = "tool_approval_config_invalid"

trait_config.REQUIRE = { MARKED = "marked", ALL = "all" }
trait_config.APPROVE_ALL = { OFF = "off", BATCH = "batch", TOOL = "tool", SESSION = "session" }
trait_config.ENFORCEMENT = { ENFORCE = "enforce", OFF = "off" }

trait_config.DEFAULTS = {
    require = "marked",
    approve_all = "off",
    timeout_seconds = 900,
    max_requests_per_turn = 10,
}

trait_config.LIMITS = {
    timeout_seconds = { min = 30, max = 3600 },
    max_requests_per_turn = { min = 1, max = 50 },
}

local REQUIRE_VALUES = { marked = true, all = true }
local APPROVE_ALL_VALUES = { off = true, batch = true, tool = true, session = true }
local KNOWN_KEYS = { require = true, approve_all = true, timeout_seconds = true, max_requests_per_turn = true }

local function invalid(detail: string): (nil, string)
    return nil, trait_config.ERROR_CODE .. ": " .. detail
end

local function integer_in(value: any, key: string): (integer?, string?)
    local limits = trait_config.LIMITS[key]
    if type(value) ~= "number" or value ~= value or value % 1 ~= 0 then
        return nil, key .. " must be an integer from " .. limits.min .. " to " .. limits.max
    end
    local whole = math.tointeger(value)
    if not whole or whole < limits.min or whole > limits.max then
        return nil, key .. " must be an integer from " .. limits.min .. " to " .. limits.max
    end
    return whole, nil
end

-- Validates a trait context. nil means "all defaults". Returns the
-- normalized settings, or nil and "tool_approval_config_invalid: <detail>".
function trait_config.normalize(context: any): (any, string?)
    if context == nil then context = {} end
    if type(context) ~= "table" then
        return invalid("the trait context must be an object")
    end
    local unknown = {}
    for key in pairs(context) do
        if not KNOWN_KEYS[key] then unknown[#unknown + 1] = tostring(key) end
    end
    if #unknown > 0 then
        table.sort(unknown)
        return invalid("unknown key " .. table.concat(unknown, ", "))
    end

    local out = {}
    local require_value = context.require
    if require_value == nil then require_value = trait_config.DEFAULTS.require end
    if type(require_value) ~= "string" or not REQUIRE_VALUES[require_value] then
        return invalid("require must be marked or all")
    end
    out.require = require_value

    local approve_all = context.approve_all
    if approve_all == nil then approve_all = trait_config.DEFAULTS.approve_all end
    if type(approve_all) ~= "string" or not APPROVE_ALL_VALUES[approve_all] then
        return invalid("approve_all must be off, batch, tool or session")
    end
    out.approve_all = approve_all

    for _, key in ipairs({ "timeout_seconds", "max_requests_per_turn" }) do
        local value = context[key]
        if value == nil then
            out[key] = trait_config.DEFAULTS[key]
        else
            local whole, err = integer_in(value, key)
            if not whole then return invalid(err :: string) end
            out[key] = whole
        end
    end
    return out, nil
end

-- True when `stored` is a valid stored activation
-- (config.tool_approval = { active = true, require, approve_all, ... }).
local function stored_settings(stored: any): (any, string?)
    if stored == nil then return nil, nil end
    if type(stored) ~= "table" or stored.active ~= true then
        return invalid("the stored activation is not active")
    end
    return trait_config.normalize({
        require = stored.require,
        approve_all = stored.approve_all,
        timeout_seconds = stored.timeout_seconds,
        max_requests_per_turn = stored.max_requests_per_turn,
    })
end

-- The effective policy for one turn (architecture 4.3, "Activation is sticky
-- and monotonic"):
--   stored      config.tool_approval of the session, or nil
--   current     the current agent's trait context when its trait list names
--               the trait, else nil (pass {} for "listed with no context")
--   enforcement the operator setting tool_approval_enforcement, "enforce"
--               (default) or "off"
-- The stricter `require` wins. approve_all, the timeout and the request cap
-- come from the current agent when it has the trait, else from the stored
-- values. agent_opted_in is false when the current agent lacks the trait; the
-- gate stays on, but no grant matches (policy.lua).
-- Returns nil, nil when neither the stored activation nor the current agent
-- opts in: the session is not protected.
function trait_config.effective(stored: any, current: any, enforcement: string?): (any, string?)
    local enforcement_value = enforcement or trait_config.ENFORCEMENT.ENFORCE
    if enforcement_value ~= trait_config.ENFORCEMENT.ENFORCE and enforcement_value ~= trait_config.ENFORCEMENT.OFF then
        return invalid("tool_approval_enforcement must be enforce or off")
    end
    local stored_value, stored_err = stored_settings(stored)
    if stored_err then return nil, stored_err end
    local current_value = nil
    if current ~= nil then
        local normalized, err = trait_config.normalize(current)
        if not normalized then return nil, err end
        current_value = normalized
    end
    if not stored_value and not current_value then return nil, nil end

    local source = current_value or stored_value
    local require_value = source.require
    if stored_value and stored_value.require == trait_config.REQUIRE.ALL then
        require_value = trait_config.REQUIRE.ALL
    end
    return {
        active = true,
        enforcement = enforcement_value,
        require = require_value,
        approve_all = source.approve_all,
        timeout_seconds = source.timeout_seconds,
        max_requests_per_turn = source.max_requests_per_turn,
        agent_opted_in = current_value ~= nil,
    }, nil
end

return trait_config
