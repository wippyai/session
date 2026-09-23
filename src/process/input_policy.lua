local json = require("json")
local input_policy = {}

local function clone(value)
    if type(value) ~= "table" then return value end
    local result = {}
    for key, item in pairs(value) do result[key] = clone(item) end
    return result
end

local function mode(value)
    if value == "block" or value == "steer" then return value end
    return nil
end

local function policy(ctx)
    local config = ctx.config or {}
    return type(config.input_policy) == "table" and config.input_policy or {}
end

local function allowed(config, requested)
    if config.allowed_modes == nil then return true end
    if type(config.allowed_modes) ~= "table" then return false end
    for _, value in ipairs(config.allowed_modes) do
        if value == requested then return true end
    end
    return false
end

function input_policy.validate_mode(value)
    if value == "inherit" or mode(value) then return true end
    return false, "Input policy mode must be block, steer, or inherit"
end

function input_policy.validate_scope(value)
    if value == nil or value == "turn" or value == "session" then return true end
    return false, "Input policy scope must be turn or session"
end

function input_policy.normalize_request(request)
    if type(request) ~= "table" then return nil, "Input policy request must be an object" end
    local ok, err = input_policy.validate_mode(request.mode)
    if not ok then return nil, err end
    ok, err = input_policy.validate_scope(request.scope)
    if not ok then return nil, err end
    return { mode = request.mode, scope = request.scope or "turn" }
end

function input_policy.agent_defaults(agent)
    local options = agent and agent.agent_options
    local defaults = options and options.session_input
    if type(defaults) ~= "table" then defaults = {} end
    return { while_running = mode(defaults.while_running), can_manage = defaults.can_manage == true }
end

function input_policy.fingerprint(text, file_uuids)
    if file_uuids ~= nil and type(file_uuids) ~= "table" then return nil, "Files must be an array" end
    local files = {}
    for index, value in ipairs(file_uuids or {}) do files[index] = tostring(value) end
    -- Arrays give the fingerprint a stable field order across process recovery.
    return json.encode({ tostring(text or ""), files })
end

function input_policy.resolve(ctx, agent)
    ctx = ctx or {}
    local configured = policy(ctx)
    local defaults = input_policy.agent_defaults(agent or ctx.current_agent)
    local turn = ctx.turn_state and ctx.turn_state.input_policy
    local selected = mode(type(turn) == "table" and turn.while_running)
        or mode(configured.while_running) or defaults.while_running or "block"
    local restricted = selected == "steer" and not allowed(configured, "steer")
    local effective = restricted and "block" or selected
    local running = ctx.status == "running" or (ctx.turn_state and ctx.turn_state.active == true) or false
    local unavailable = ctx.status == "failed" or ctx.status == "finishing" or ctx.status == "stopping"
        or (running and ctx.stop_requested == true)
    local reason = nil
    if unavailable then reason = "session_unavailable"
    elseif running and restricted then reason = "input_policy_restricted"
    elseif running and effective == "block" then reason = "session_busy" end
    return {
        mode = effective,
        can_send = not unavailable and (not running or effective == "steer"),
        can_stop = running and not unavailable,
        revision = tonumber(ctx.input_policy_revision) or 0,
        reason = reason,
    }
end

input_policy.interaction = input_policy.resolve

function input_policy.clear_turn(ctx)
    if ctx.turn_state then ctx.turn_state.input_policy = nil end
end

local function same(left, right)
    return left and left.mode == right.mode and left.can_send == right.can_send
        and left.can_stop == right.can_stop and left.reason == right.reason
end

local function next_snapshot(ctx, candidate, agent, force)
    local result = input_policy.resolve(candidate, agent)
    local revision = math.max(tonumber(ctx.input_policy_revision) or 0,
        tonumber(ctx.interaction and ctx.interaction.revision) or 0)
    if force or not same(ctx.interaction, result) then revision = revision + 1 end
    result.revision = revision
    return result
end

local function announce(ctx, interaction)
    ctx.interaction = interaction
    ctx.input_policy_revision = interaction.revision
    if ctx.upstream then ctx.upstream:update_session({ status = ctx.status, interaction = interaction }) end
end

-- The session inbox serializes these writes with admission, Stop, and turn completion.
function input_policy.publish(ctx, agent, force)
    local interaction = next_snapshot(ctx, ctx, agent, force)
    if not force and same(ctx.interaction, interaction) then return ctx.interaction end
    local ok, err = ctx.writer:update_meta({ status = ctx.status, meta = {
        interaction = interaction, input_policy_default = input_policy.agent_defaults(agent or ctx.current_agent),
    } })
    if not ok then return nil, err or "Failed to persist interaction" end
    announce(ctx, interaction)
    return interaction
end

function input_policy.apply_request(ctx, request, agent)
    local normalized, err = input_policy.normalize_request(request)
    if not normalized then return nil, err end
    agent = agent or ctx.current_agent
    local configured = policy(ctx)
    if not input_policy.agent_defaults(agent).can_manage then
        return nil, "Active agent cannot manage session input policy"
    end
    if configured.allow_agent_changes == false then
        return nil, "Session configuration disallows agent input policy changes"
    end
    local active_id = ctx.current_agent and ctx.current_agent.id or ctx.config.agent_id
    if agent and agent.id and active_id and agent.id ~= active_id then
        return nil, "Input policy caller is no longer the active agent"
    end
    if normalized.mode ~= "inherit" and not allowed(configured, normalized.mode) then
        return nil, "Input policy mode is outside the application bounds"
    end
    if normalized.scope == "turn" and (not ctx.turn_state or not ctx.turn_state.active
        or ctx.stop_requested or ctx.status == "failed" or ctx.status == "finishing" or ctx.status == "stopping") then
        return nil, "Turn input policy requires a healthy active turn"
    end
    local candidate = {
        config = clone(ctx.config), turn_state = clone(ctx.turn_state), status = ctx.status,
        stop_requested = ctx.stop_requested, current_agent = agent,
    }
    if normalized.scope == "session" then
        candidate.config.input_policy = clone(configured)
        candidate.config.input_policy.while_running = normalized.mode ~= "inherit" and normalized.mode or nil
    else
        candidate.turn_state.input_policy = normalized.mode ~= "inherit" and { while_running = normalized.mode } or nil
    end
    local interaction = next_snapshot(ctx, candidate, agent, false)
    local updates = { status = ctx.status, meta = {
        interaction = interaction, input_policy_default = input_policy.agent_defaults(agent),
    } }
    if normalized.scope == "session" then updates.config = candidate.config end
    local ok, write_err = ctx.writer:update_meta(updates)
    if not ok then return nil, write_err or "Failed to persist input policy" end
    ctx.config = candidate.config
    ctx.turn_state = candidate.turn_state
    announce(ctx, interaction)
    return interaction
end

-- Recovery uses persisted defaults, never a temporary turn policy.
function input_policy.recovery_snapshot(session, status)
    local meta = session.meta or {}
    local ctx = {
        config = session.config or {}, status = status,
        input_policy_revision = (tonumber(meta.interaction and meta.interaction.revision) or 0) + 1,
    }
    return input_policy.resolve(ctx, { agent_options = { session_input = meta.input_policy_default } })
end

return input_policy
