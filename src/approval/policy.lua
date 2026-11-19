-- Tool approval policy evaluator (EE2-2710, architecture 4.3). Pure
-- functions: the caller passes the frozen call, the effective policy
-- (trait_config.effective) and the session's grants, and gets a decision. The
-- evaluator never reads or writes storage; a grant it would suspend is
-- returned in `suspend` for the caller to persist.
--
-- Evaluation order, Phase 1 rows of the table in 4.3:
--   1 operator switch `off`   -> allow, reason enforcement_off
--   4 requirement             -> allow, reason not_required, when nothing requires approval
--   5 repeated denial         -> settle, reason repeated_denied_call
--   6 grant                   -> allow, reason grant (unless the tool has approve_all: false)
--   7 request                 -> ask, with the offered decisions
-- Rows 2 and 3 (administrator rules, deny lists) are later phases.
--
-- The call (a frozen call, freeze.lua):
--   call_id     string
--   row_type    "function" | "private_function" | "delegation"
--   approval    tool_meta.read(meta) result; read from `meta` when absent
--   identity    { registry_id, fingerprint, target_agent_id? } (grant key);
--               built from registry_id, fingerprint, delegate_target when absent
--   denial_key  string (repeated-denial rule)
-- The turn scope:
--   session_id, owner_id, epoch   whose grants may match (grant isolation; non-empty strings)
--   denied_keys                   { [denial_key] = true } for calls denied earlier in this turn
local tool_meta = require("tool_meta")

local policy = {}

policy.DECISION = { ALLOW = "allow", ASK = "ask", SETTLE = "settle" }
policy.REASON = {
    ENFORCEMENT_OFF = "enforcement_off",
    NOT_REQUIRED = "not_required",
    GRANT = "grant",
    REPEATED_DENIED_CALL = "repeated_denied_call",
    APPROVAL_REQUIRED = "approval_required",
}
policy.SCOPE = { NONE = "none", BATCH = "batch", TOOL = "tool", SESSION = "session" }
policy.SUSPENSION = {
    AGENT_WITHOUT_TRAIT = "agent_without_trait",
    TOOL_APPROVE_ALL_FALSE = "tool_approve_all_false",
    MODE_NOT_PERMITTED = "mode_not_permitted",
    DEPLOYMENT_CHANGED = "deployment_changed",
}

local SCOPE = policy.SCOPE
local REQUIRE = { marked = true, all = true }
local MODES = { off = true, batch = true, tool = true, session = true }
local ENFORCEMENT = { enforce = true, off = true }
local ROW_TYPES = { ["function"] = true, private_function = true, delegation = true }
local DELEGATION = "delegation"
local ACTIVE = "active"

local function check_policy(effective: any): string?
    if type(effective) ~= "table" or effective.active ~= true then return "the policy is not active" end
    if not ENFORCEMENT[effective.enforcement] then return "policy.enforcement must be enforce or off" end
    if not REQUIRE[effective.require] then return "policy.require must be marked or all" end
    if not MODES[effective.approve_all] then return "policy.approve_all must be off, batch, tool or session" end
    if type(effective.agent_opted_in) ~= "boolean" then return "policy.agent_opted_in must be a boolean" end
    return nil
end

-- The call's approval settings: the normalized tool_meta.read result that
-- freeze stores, or read from `meta` when absent. A present but malformed
-- value is an error, never "unmarked".
local function approval_of(call: any): (any, string?)
    local approval = call.approval
    if approval == nil then return tool_meta.read(call.meta), nil end
    if type(approval) ~= "table" then return nil, "call.approval must be a table" end
    if type(approval.required) ~= "boolean" then return nil, "call.approval.required must be a boolean" end
    if approval.approve_all ~= nil and type(approval.approve_all) ~= "boolean" then
        return nil, "call.approval.approve_all must be a boolean or absent"
    end
    if approval.warnings ~= nil and type(approval.warnings) ~= "table" then
        return nil, "call.approval.warnings must be a list"
    end
    return approval, nil
end

local function blank_to_nil(value: any): any
    if value == "" then return nil end
    return value
end

-- The grant key of a call: tool identity, deployment fingerprint and, for a
-- delegation call, the target agent.
function policy.identity(call: any): any
    if type(call.identity) == "table" then
        return {
            registry_id = call.identity.registry_id,
            fingerprint = call.identity.fingerprint,
            target_agent_id = blank_to_nil(call.identity.target_agent_id),
        }
    end
    local target = type(call.delegate_target) == "table" and call.delegate_target.agent_id or nil
    return { registry_id = call.registry_id, fingerprint = call.fingerprint, target_agent_id = blank_to_nil(target) }
end

local function same_identity(a: any, b: any): boolean
    return type(a) == "table" and type(b) == "table"
        and type(a.registry_id) == "string" and a.registry_id ~= ""
        and type(a.fingerprint) == "string" and a.fingerprint ~= ""
        and a.registry_id == b.registry_id
        and a.fingerprint == b.fingerprint
        and blank_to_nil(a.target_agent_id) == blank_to_nil(b.target_agent_id)
end

-- The maximum Approve-all scope of the combination table in 4.3, for a call
-- that already requires approval. `option` is the tool's approve_all (true,
-- false or nil for "absent"). The batch rule "only with at least two eligible
-- pending requests" is applied per batch in evaluate_batch. Tool and session
-- scopes create grants; when the current agent lacks the trait no grant can
-- match, so they are not offered.
function policy.max_scope(effective: any, option: any): string
    if option == false then return SCOPE.NONE end
    local mode = effective.approve_all
    local scope = SCOPE.NONE
    if mode == "off" then
        if option == true then scope = SCOPE.TOOL end
    elseif mode == "batch" then
        scope = option == true and SCOPE.TOOL or SCOPE.BATCH
    elseif mode == "tool" then
        scope = SCOPE.TOOL
    elseif mode == "session" then
        scope = SCOPE.SESSION
    end
    if (scope == SCOPE.TOOL or scope == SCOPE.SESSION) and not effective.agent_opted_in then
        return SCOPE.NONE
    end
    return scope
end

-- Whether the current policy lets a grant of `grant_scope` satisfy a call
-- with tool option `option`; when not, the suspension reason.
local function grant_permitted(effective: any, option: any, grant_scope: string): (boolean, string?)
    if not effective.agent_opted_in then return false, policy.SUSPENSION.AGENT_WITHOUT_TRAIT end
    if option == false then return false, policy.SUSPENSION.TOOL_APPROVE_ALL_FALSE end
    local scope = policy.max_scope(effective, option)
    if grant_scope == SCOPE.TOOL and (scope == SCOPE.TOOL or scope == SCOPE.SESSION) then return true, nil end
    if grant_scope == SCOPE.SESSION and scope == SCOPE.SESSION then return true, nil end
    return false, policy.SUSPENSION.MODE_NOT_PERMITTED
end

-- Why the current policy no longer lets `grant` match a call to its tool, or
-- nil when it still may. `option` is the tool's approve_all (nil for a
-- session grant).
function policy.grant_suspension(effective: any, grant: any, option: any): string?
    local permitted, reason = grant_permitted(effective, option, grant.scope)
    if permitted then return nil end
    return reason
end

-- Same tool (registry ID and delegate target), whatever the deployment.
local function same_tool(a: any, b: any): boolean
    return type(a) == "table" and type(b) == "table"
        and type(a.registry_id) == "string" and a.registry_id ~= ""
        and a.registry_id == b.registry_id
        and blank_to_nil(a.target_agent_id) == blank_to_nil(b.target_agent_id)
end

-- "covers" when the grant names this tool at this deployment; "changed"
-- when it names this tool at another deployment; nil otherwise.
local function grant_relation(grant: any, identity: any): string?
    local entries = {}
    if grant.scope == SCOPE.TOOL then
        entries = { grant }
    elseif grant.scope == SCOPE.SESSION and type(grant.manifest) == "table" then
        entries = grant.manifest
    end
    local changed = false
    for _, entry in ipairs(entries) do
        if same_identity(entry, identity) then return "covers" end
        if same_tool(entry, identity) then changed = true end
    end
    if changed then return "changed" end
    return nil
end

local function non_empty_string(value: any): boolean
    return type(value) == "string" and value ~= ""
end

-- Grant isolation: owner, logical session and grant epoch, all non-empty
-- strings (the epoch column is TEXT), compared directly.
local function owned_by_scope(grant: any, scope: any): boolean
    return non_empty_string(grant.session_id) and grant.session_id == scope.session_id
        and non_empty_string(grant.owner_id) and grant.owner_id == scope.owner_id
        and non_empty_string(grant.epoch) and grant.epoch == scope.epoch
end

-- Row 6. Returns the matching grant, and every active grant that covers the
-- call but that the current policy no longer permits, with its reason. A
-- grant for this tool at another deployment fingerprint is suspended with
-- deployment_changed, so the entry returning to the old deployment does not
-- restore it silently (architecture 4.3: only an authenticated user action
-- restores a suspended grant).
local function match_grants(effective: any, approval: any, identity: any, grants: any, scope: any)
    local matched = nil
    local suspend = {}
    for _, grant in ipairs(grants or {}) do
        if type(grant) == "table" and grant.status == ACTIVE and owned_by_scope(grant, scope) then
            local relation = grant_relation(grant, identity)
            if relation == "changed" then
                suspend[#suspend + 1] = { grant_id = grant.grant_id, reason = policy.SUSPENSION.DEPLOYMENT_CHANGED }
            elseif relation == "covers" then
                local permitted, reason = grant_permitted(effective, approval.approve_all, grant.scope)
                if permitted then
                    if not matched then matched = grant end
                else
                    suspend[#suspend + 1] = { grant_id = grant.grant_id, reason = reason }
                end
            end
        end
    end
    return matched, suspend
end

local function check_scope(scope: any, grants: any): string?
    if type(scope) ~= "table" then return "the turn scope is required" end
    if scope.denied_keys ~= nil and type(scope.denied_keys) ~= "table" then
        return "scope.denied_keys must be a table"
    end
    if grants ~= nil and type(grants) ~= "table" then return "grants must be a list" end
    if grants and #grants > 0 then
        for _, key in ipairs({ "session_id", "owner_id", "epoch" }) do
            if not non_empty_string(scope[key]) then
                return "scope." .. key .. " must be a non-empty string to match grants"
            end
        end
    end
    return nil
end

-- Evaluates one call. Returns a result table, or nil and an error when the
-- policy or the call is malformed (the gate then fails closed).
--   decision   allow | ask | settle
--   reason     enforcement_off | not_required | grant | repeated_denied_call | approval_required
--   grant_id, grant_scope   for reason grant
--   max_scope  for ask: the table's scope before the per-batch rule
--   suspend    { { grant_id, reason } } grants the caller must suspend
--   warnings   tool meta warnings, and the enforcement-off warning
function policy.evaluate(call: any, effective: any, grants: any, scope: any): (any, string?)
    local policy_err = check_policy(effective)
    if policy_err then return nil, policy_err end
    if type(call) ~= "table" or type(call.call_id) ~= "string" or call.call_id == "" then
        return nil, "the call needs a call_id"
    end
    if not ROW_TYPES[call.row_type] then return nil, "call.row_type must be function, private_function or delegation" end
    local scope_err = check_scope(scope, grants)
    if scope_err then return nil, scope_err end

    local approval, approval_err = approval_of(call)
    if not approval then return nil, approval_err end
    local result = {
        call_id = call.call_id,
        suspend = {},
        warnings = {},
        approve_all_option = approval.approve_all,
    }
    for _, warning in ipairs(approval.warnings or {}) do result.warnings[#result.warnings + 1] = warning end

    -- Row 1: the operator switch.
    if effective.enforcement == "off" then
        result.decision = policy.DECISION.ALLOW
        result.reason = policy.REASON.ENFORCEMENT_OFF
        result.warnings[#result.warnings + 1] = "tool approval enforcement is off; the approval check was skipped"
        return result, nil
    end

    -- Row 4: the requirement. Under `require: marked` only marked tools ask,
    -- and delegation calls never (Phase 1 gates them only under `all`).
    -- Private calls follow the same rules as public calls.
    local required
    if effective.require == "all" then
        required = true
    else
        required = approval.required == true and call.row_type ~= DELEGATION
    end
    if not required then
        result.decision = policy.DECISION.ALLOW
        result.reason = policy.REASON.NOT_REQUIRED
        return result, nil
    end

    -- Row 5: repeated denial, before any grant.
    local denied = scope.denied_keys or {}
    if type(call.denial_key) == "string" and call.denial_key ~= "" and denied[call.denial_key] then
        result.decision = policy.DECISION.SETTLE
        result.reason = policy.REASON.REPEATED_DENIED_CALL
        return result, nil
    end

    -- Row 6: a valid, matching grant. approve_all: false blocks every grant.
    local identity = policy.identity(call)
    result.identity = identity
    local grant, suspend = match_grants(effective, approval, identity, grants, scope)
    result.suspend = suspend
    if grant then
        result.decision = policy.DECISION.ALLOW
        result.reason = policy.REASON.GRANT
        result.grant_id = grant.grant_id
        result.grant_scope = grant.scope
        return result, nil
    end

    -- Row 7: a request.
    result.decision = policy.DECISION.ASK
    result.reason = policy.REASON.APPROVAL_REQUIRED
    result.max_scope = policy.max_scope(effective, approval.approve_all)
    return result, nil
end

local function covers_for(scope_name: string, own: any, eligible: {any}): {string}
    local covers = {}
    for _, other in ipairs(eligible) do
        if scope_name ~= SCOPE.TOOL or same_identity(other.identity, own.identity) then
            covers[#covers + 1] = other.call_id
        end
    end
    return covers
end

-- Evaluates the calls of one batch in model order and fixes each request's
-- offer:
--   offered = { decisions = { "approve", ["approve_all",] "deny" },
--               approve_all = { scope, covers = { call_id, ... } } | nil }
-- A request is eligible for Approve all when its tool option is not false.
-- Scope batch is offered only when the batch has at least two eligible
-- requests; it covers every eligible request of the batch, as does scope
-- session. Scope tool covers the eligible requests with the same grant key.
-- The gate maps the call IDs in `covers` to approval IDs when it creates the
-- requests. Returns { results = { ... }, suspend = { { grant_id, reason } } }.
function policy.evaluate_batch(calls: any, effective: any, grants: any, scope: any): (any, string?)
    if type(calls) ~= "table" then return nil, "calls must be a list" end
    local results = {}
    local eligible = {}
    local suspend, suspended = {}, {}
    for index, call in ipairs(calls) do
        local result, err = policy.evaluate(call, effective, grants, scope)
        if not result then return nil, "call " .. index .. ": " .. tostring(err) end
        results[index] = result
        for _, item in ipairs(result.suspend) do
            if item.grant_id and not suspended[item.grant_id] then
                suspended[item.grant_id] = true
                suspend[#suspend + 1] = item
            end
        end
        if result.decision == policy.DECISION.ASK and result.approve_all_option ~= false then
            eligible[#eligible + 1] = result
        end
    end

    for _, result in ipairs(results) do
        if result.decision == policy.DECISION.ASK then
            local scope_name = result.max_scope
            if scope_name == SCOPE.BATCH and #eligible < 2 then scope_name = SCOPE.NONE end
            result.offered_scope = scope_name
            if scope_name == SCOPE.NONE then
                result.offered = { decisions = { "approve", "deny" } }
            else
                result.offered = {
                    decisions = { "approve", "approve_all", "deny" },
                    approve_all = { scope = scope_name, covers = covers_for(scope_name, result, eligible) },
                }
            end
        end
    end
    return { results = results, suspend = suspend }, nil
end

return policy
