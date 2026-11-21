-- Activation of native tool-call approval.
--
-- At every agent step, after the effective agent is loaded and before the
-- model call, message_handlers.agent_step calls activation.apply. It reads
-- the raw trait list of the effective agent: the session's trait overlay when
-- one is set, else the agent's registry entry. When that list names
-- wippy.session.traits:tool_approval, the trait context is validated
-- (trait_config.normalize) and the compiled agent must carry the options the
-- trait entry contributes (agent_options.tool_approval). Then the activation
-- is stored in config.tool_approval with the session row locked, and
-- ctx.config is updated in the same step.
--
-- Fail closed: an invalid context, missing compiled options, a trait listed
-- twice, compiled options without a listing, or a damaged stored activation
-- returns ("invalid", detail); the caller fails the turn with
-- tool_approval_config_invalid and makes no model call. There is no fallback
-- that runs without the gate.
--
-- Sticky and monotonic: the stored activation is never removed or weakened
-- here. A later agent without the trait leaves it as it is; the stricter
-- `require` wins; approve_all, the timeout and the request cap come from the
-- current agent when it has the trait (trait_config.effective).
--
-- Only writer:update_tool_approval writes config.tool_approval. Whole-config
-- writers (input policy, agent and model changes, `_control` config) keep the
-- stored value (writer:update_meta), and control_handlers.control_config
-- refuses a whole `_control` that names tool_approval.
local trait_config = require("trait_config")
local agent_registry = require("agent_registry")
local policy = require("policy")
local tool_meta = require("tool_meta")
local approval_repo = require("approval_repo")
local approval_projection = require("approval_projection")
local consts = require("consts")
local time = require("time")

local activation = {}

activation.ERROR_CODE = trait_config.ERROR_CODE
activation.TRAIT_ID = trait_config.TRAIT_ID
-- The agent_options key the trait entry contributes to the compiled agent.
activation.COMPILED_OPTION = "tool_approval"
activation.FAILURE = { INVALID = "invalid", STORAGE = "storage" }

-- Test seams.
activation._agent_registry = nil :: any
activation._now = nil :: any
activation._enforcement = nil :: any

local REQUIRE_ALL = trait_config.REQUIRE.ALL
local REQUIRE_MARKED = trait_config.REQUIRE.MARKED

local function invalid(detail: string): string
    return activation.ERROR_CODE .. ": " .. detail
end

-- The clock of activation and the approval gate, in unix seconds (the test
-- seam activation._now replaces it).
function activation.now(): number
    if activation._now then return activation._now() end
    return time.now():unix()
end

-- The operator setting tool_approval_enforcement, "enforce" or "off".
function activation.enforcement(): string
    if activation._enforcement then return activation._enforcement() end
    return consts.tool_approval_enforcement()
end

local function trait_id_of(entry: any): any
    if type(entry) == "string" then return entry end
    if type(entry) == "table" then return entry.id end
    return nil
end

-- Finds the trait in a raw trait list. Returns (listed, context, err).
-- Listing the trait twice is an error: the compiler would keep one context
-- and drop the other, so the effective settings would be ambiguous.
function activation.find_listing(raw_traits: any): (boolean, any, string?)
    if raw_traits == nil then return false, nil, nil end
    if type(raw_traits) ~= "table" then return false, nil, "the agent's trait list is not a list" end
    local count = 0
    local context = nil
    for _, entry in ipairs(raw_traits) do
        if trait_id_of(entry) == activation.TRAIT_ID then
            count = count + 1
            if type(entry) == "table" then context = entry.context end
        end
    end
    if count > 1 then return true, nil, "the trait " .. activation.TRAIT_ID .. " is listed more than once" end
    return count == 1, context, nil
end

-- The raw trait list of the effective agent, or nil when it can't be read.
-- The session's trait overlay replaces the agent's own list at compile time
-- (agent_context.load_agent), so it is the list when set; else the agent's
-- registry entry, looked up by ID and then by name as load_agent does.
function activation.raw_traits(ctx: any): any
    local agent_ctx = ctx and ctx.agent_ctx
    if type(agent_ctx) == "table" and type(agent_ctx.active_traits) == "table" then
        return agent_ctx.active_traits
    end
    local agent_id = ctx and ctx.config and ctx.config.agent_id
    if type(agent_id) ~= "string" or agent_id == "" then return nil end
    local registry_module = activation._agent_registry or agent_registry
    local spec = registry_module.get_by_id(agent_id)
    if not spec then spec = registry_module.get_by_name(agent_id) end
    if type(spec) ~= "table" then return nil end
    return spec.traits or {}
end

-- Decides the current agent's opt-in from its raw trait list and its
-- compiled agent_options. Returns (settings, listed, err): settings are the
-- normalized trait context when the agent opts in; err (prefixed with
-- tool_approval_config_invalid) means the turn must fail.
function activation.check(raw_traits: any, compiled_options: any): (any, boolean, string?)
    local listed, context, list_err = activation.find_listing(raw_traits)
    if list_err then return nil, true, invalid(list_err) end
    local marker = type(compiled_options) == "table" and compiled_options[activation.COMPILED_OPTION] or nil
    if listed then
        local settings, settings_err = trait_config.normalize(context)
        if not settings then return nil, true, settings_err end
        if type(marker) ~= "table" then
            return nil, true, invalid("the compiled agent has no " .. activation.COMPILED_OPTION
                .. " options; the trait entry " .. activation.TRAIT_ID .. " is not available")
        end
        return settings, true, nil
    end
    if marker ~= nil then
        return nil, true, invalid("the compiled agent carries " .. activation.COMPILED_OPTION
            .. " options, but its trait list does not name " .. activation.TRAIT_ID)
    end
    return nil, false, nil
end

local function same(left: any, right: any): boolean
    if type(left) ~= "table" or type(right) ~= "table" then return false end
    for _, key in ipairs(trait_config.SETTING_KEYS) do
        if left[key] ~= right[key] then return false end
    end
    return left.active == true and left.ui_declared_at == right.ui_declared_at
end

-- The next stored activation, or nil when nothing changes.
--   stored       the committed config.tool_approval, or nil
--   settings     the current agent's normalized trait context, or nil when
--                the agent does not opt in
--   declared_at  a timestamp when a live approval UI surface exists now
-- The record is { active, require, approve_all, timeout_seconds,
-- max_requests_per_turn, revision, ui_declared_at }. require never moves from
-- all back to marked; ui_declared_at is written once; revision moves up by
-- one on every change.
function activation.merge(stored: any, settings: any, declared_at: string?): any
    if stored == nil and settings == nil then return nil end
    local base = {}
    if type(stored) == "table" then
        for key, value in pairs(stored) do base[key] = value end
    end
    if settings ~= nil then
        local stricter = settings.require == REQUIRE_ALL
            or (type(stored) == "table" and stored.require == REQUIRE_ALL)
        base.require = stricter and REQUIRE_ALL or REQUIRE_MARKED
        base.approve_all = settings.approve_all
        base.timeout_seconds = settings.timeout_seconds
        base.max_requests_per_turn = settings.max_requests_per_turn
    end
    if declared_at ~= nil and base.ui_declared_at == nil then base.ui_declared_at = declared_at end
    base.active = true
    if same(stored, base) then return nil end
    local revision = type(stored) == "table" and tonumber(stored.revision) or 0
    base.revision = math.tointeger(revision + 1) or revision + 1
    return base
end

-- Publishes the session's tool_approval field when the activation in
-- ctx.config has a revision the clients have not seen
-- (ctx.tool_approval_published_revision). The Host isolates mounted content
-- only from that field, so a failed publish is returned as an error: the
-- step fails closed and the next step publishes again.
local function publish_activation(ctx: any): (boolean?, string?)
    local stored = ctx.config and ctx.config.tool_approval
    if type(stored) ~= "table" or stored.revision == ctx.tool_approval_published_revision then return true, nil end
    return approval_projection.publish(ctx)
end

-- Stores the merge of the committed activation with `settings` and
-- `declared_at` (row locked, writer:update_tool_approval), adopts the
-- committed value into ctx.config and publishes it when its revision is new
-- to the clients. Returns the value in force, or nil and an error.
function activation.persist(ctx: any, settings: any, declared_at: string?): (any, string?)
    local writer = ctx.writer
    if type(writer) ~= "table" or type(writer.update_tool_approval) ~= "function" then
        return nil, "The session writer cannot store the tool approval activation"
    end
    local committed, err = writer:update_tool_approval(function(current)
        return activation.merge(current, settings, declared_at)
    end)
    if err then return nil, tostring(err) end
    ctx.config = ctx.config or {}
    ctx.config.tool_approval = committed
    local published, publish_err = publish_activation(ctx)
    if not published then return nil, publish_err end
    return committed, nil
end

-- Records the first live approval UI surface of a protected session
-- (config.tool_approval.ui_declared_at). Does nothing for an
-- unprotected session or when the time is already stored.
function activation.note_declared(ctx: any): (any, string?)
    local stored = ctx.config and ctx.config.tool_approval
    if type(stored) ~= "table" or stored.ui_declared_at ~= nil then return stored, nil end
    return activation.persist(ctx, nil, approval_repo.timestamp(activation.now()))
end

-- The number of live approval UI surfaces the parent plugin last sent.
function activation.live_surfaces(ctx: any): number
    local surfaces = ctx.approval_surfaces
    return type(surfaces) == "table" and tonumber(surfaces.live) or 0
end

-- Why `effective` does not let `grant` match, or nil when it does; or nil
-- and an error when the tool's registry entry can't be read.
local function unpermitted_reason(effective: any, grant: any): (string?, string?)
    local option = nil
    if grant.scope == policy.SCOPE.TOOL and effective.agent_opted_in then
        -- Only these checks need the tool option. A failed read fails the
        -- step, because the check can't be done without the option. A
        -- tool no longer in the registry is checked as if it had no
        -- option: the same entry can come back with the same
        -- fingerprint, so a narrower mode must suspend the grant now.
        -- A call to a missing tool can't use the grant anyway, and a
        -- tool added again asks once.
        local entry, read_err = tool_meta.entry(grant.registry_id)
        if read_err then
            return nil, "Failed to read tool " .. tostring(grant.registry_id) .. " for its grant: " .. read_err
        end
        if entry then option = tool_meta.approve_all(entry) end
    end
    return policy.grant_suspension(effective, grant, option), nil
end

-- Suspends the active grants of the session that `effective` no longer
-- permits (the agent lacks the trait, or its Approve-all mode is narrower),
-- before the model step. Only an authenticated user action restores a
-- suspended grant, so a later switch back does not bring it back.
local function suspend_unpermitted_grants(ctx: any, effective: any): (boolean?, string?)
    local grants, err = approval_repo.list_grants(nil, ctx.session_id, { consts.GRANT_STATUS.ACTIVE })
    if not grants then return nil, tostring(err) end
    local suspend = {}
    for _, grant in ipairs(grants) do
        local reason, reason_err = unpermitted_reason(effective, grant)
        if reason_err then return nil, reason_err end
        if reason then suspend[#suspend + 1] = { grant_id = grant.grant_id, reason = reason } end
    end
    if #suspend == 0 then return true, nil end
    local _, suspend_err = approval_repo.transact(ctx.session_id, function(dbtx)
        return approval_repo.suspend_grants(dbtx, ctx.session_id, suspend)
    end)
    if suspend_err then return nil, tostring(suspend_err) end
    approval_projection.publish(ctx)
    return true, nil
end

-- The suspensions an agent switch causes. A grant suspended because its
-- tool's deployment changed, or because the tool forbids Approve all, needs a
-- new Approve all.
local RESTORABLE = {
    [policy.SUSPENSION.AGENT_WITHOUT_TRAIT] = true,
    [policy.SUSPENSION.MODE_NOT_PERMITTED] = true,
}

-- A user agent switch, an authenticated user action, restores the grants
-- that an agent switch suspended and that the new agent's policy permits
-- again. Only session_handlers.agent_change calls it, and only for a switch
-- the user sent; model-originated switches, trait overlays and tool changes
-- never restore a grant. `agent` is the compiled new agent. Returns true, or
-- nil and an error (the grants then stay suspended).
function activation.restore_grants(ctx: any, agent: any): (boolean?, string?)
    local stored = ctx.config and ctx.config.tool_approval
    if type(stored) ~= "table" then return true, nil end
    local settings, _, check_err = activation.check(activation.raw_traits(ctx), agent and agent.agent_options)
    if check_err then return nil, check_err end
    local effective, policy_err = trait_config.effective(stored, settings, activation.enforcement())
    if not effective then return nil, policy_err end
    local grants, err = approval_repo.list_grants(nil, ctx.session_id, { consts.GRANT_STATUS.SUSPENDED })
    if not grants then return nil, tostring(err) end
    local restore = {}
    for _, grant in ipairs(grants) do
        if RESTORABLE[grant.suspension_reason] then
            local reason, reason_err = unpermitted_reason(effective, grant)
            if reason_err then return nil, reason_err end
            if not reason then restore[#restore + 1] = grant end
        end
    end
    if #restore == 0 then return true, nil end
    local _, restore_err = approval_repo.transact(ctx.session_id, function(dbtx)
        for _, grant in ipairs(restore) do
            local _, grant_err = approval_repo.restore_grant(dbtx, ctx.session_id, grant.grant_id, grant.revision)
            if grant_err and not errors.is(grant_err, errors.CONFLICT) then return nil, grant_err end
        end
        return true
    end)
    if restore_err then return nil, tostring(restore_err) end
    approval_projection.publish(ctx)
    return true, nil
end

-- Runs at every agent step, before the model call. Returns true, or nil,
-- detail, kind: kind "invalid" fails the turn with
-- tool_approval_config_invalid and no model call; kind "storage" is a
-- storage or registry read failure the caller treats as fatal. Sets ctx.tool_approval_policy
-- (trait_config.effective; nil when the session is not protected) for the
-- approval gate.
function activation.apply(ctx: any, agent: any): (boolean?, string?, string?)
    ctx.tool_approval_policy = nil
    local stored = ctx.config and ctx.config.tool_approval
    if stored ~= nil then
        local _, stored_err = trait_config.effective(stored, nil, trait_config.ENFORCEMENT.ENFORCE)
        if stored_err then return nil, stored_err, activation.FAILURE.INVALID end
    end

    local settings, _, check_err = activation.check(activation.raw_traits(ctx),
        agent and agent.agent_options)
    if check_err then return nil, check_err, activation.FAILURE.INVALID end

    local declared_at = activation.live_surfaces(ctx) > 0 and approval_repo.timestamp(activation.now()) or nil
    local pending_declaration = type(stored) == "table" and declared_at ~= nil and stored.ui_declared_at == nil
    if settings ~= nil or pending_declaration then
        local committed, write_err = activation.persist(ctx, settings, declared_at)
        if write_err then return nil, write_err, activation.FAILURE.STORAGE end
        stored = committed
    end
    if stored == nil then return true, nil, nil end
    -- A step without a new write retries a publish an earlier step failed.
    local published, publish_err = publish_activation(ctx)
    if not published then return nil, publish_err, activation.FAILURE.STORAGE end

    local effective, policy_err = trait_config.effective(stored, settings, activation.enforcement())
    if not effective then return nil, policy_err, activation.FAILURE.INVALID end
    local suspended, suspend_err = suspend_unpermitted_grants(ctx, effective)
    if not suspended then return nil, suspend_err, activation.FAILURE.STORAGE end
    ctx.tool_approval_policy = effective
    return true, nil, nil
end

return activation
