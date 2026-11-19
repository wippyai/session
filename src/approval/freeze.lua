local json = require("json")
local fingerprint = require("fingerprint")
local tool_meta = require("tool_meta")

-- Freezes one validated tool call for approval: decoded arguments, the effective execution context, the tool
-- entry's identity, title, description and deployment fingerprint, the
-- delegate target for delegation calls and the Attention browser binding.
-- The intent digest covers all of them; the denial key covers what the
-- repeated-denial rule compares.
--
-- freeze.call(validated, env) never reads the registry; the gate passes the
-- entries in `env`:
--   session_context     the context the gate passes to caller:execute
--   row_type            "function" | "private_function" | "delegation"
--   delegation_func_id  ctx.config.delegation_func_id
--   entry               registry entry of validated.registry_id (its id must match)
--   target_entry        registry entry of the delegate target (delegation calls; its id must match)
--   browser_binding     the stable Attention UI action binding, or nil
-- The approval settings (meta.approval), the title, the description and the
-- fingerprint all come from `entry`, so they describe the same deployment.
--
-- It returns the frozen call, or nil and a failure. Only `invalid` passes
-- the gate without a request; every other failure must settle as not run:
--   { outcome = "invalid", error }             validate marked the call invalid (valid ~= true,
--                                              as the caller's `not tool_call.valid`); the caller
--                                              never runs it and reports this error
--   { outcome = "arguments", error }           arguments did not decode; error is the caller's text
--   { outcome = "changed_before_run", error }  the call does not name what would run
--   { outcome = "freeze_failed", error }       the Session could not freeze a valid call
--                                              (malformed call, nesting, a value that is not
--                                              JSON-shaped); the gate settles it as not run,
--                                              never runs it and never asks
local freeze = {}

freeze.OUTCOME = {
    INVALID = "invalid",
    ARGUMENTS = "arguments",
    CHANGED = "changed_before_run",
    FREEZE_FAILED = "freeze_failed",
}

-- The caller's merge_execution_context (wippy.agent.tools:caller) drops these
-- keys from both contexts; only the call's runtime resolver supplies them.
freeze.RUNTIME_CONTEXT_FIELDS = {
    attention_inspection_runtime = true,
    attention_context_runtime = true,
    ui_action_runtime = true,
}

-- Context keys that are not part of the call's meaning: the caller sets
-- call_id per call, and the runtime fields carry per-launch capability
-- tokens. They are excluded from the intent digest and the denial key.
freeze.TRANSIENT_CONTEXT_KEYS = { call_id = true }
for key in pairs(freeze.RUNTIME_CONTEXT_FIELDS) do freeze.TRANSIENT_CONTEXT_KEYS[key] = true end

local MAX_COPY_DEPTH = 64

local function deep_copy(value: any, depth: integer): any
    if type(value) ~= "table" then return value end
    if depth > MAX_COPY_DEPTH then error("value nests deeper than " .. MAX_COPY_DEPTH .. " levels", 0) end
    local out = {}
    for k, v in pairs(value) do out[k] = deep_copy(v, depth + 1) end
    return out
end

-- Mirrors merge_execution_context in wippy.agent.tools:caller: tool context,
-- then session context over it, runtime fields removed, call_id set last.
function freeze.merge_context(tool_context: any, session_context: any, call_id: string): table
    local merged = {}
    for k, v in pairs(type(tool_context) == "table" and tool_context or {}) do
        if not freeze.RUNTIME_CONTEXT_FIELDS[k] then merged[k] = deep_copy(v, 2) end
    end
    for k, v in pairs(type(session_context) == "table" and session_context or {}) do
        if not freeze.RUNTIME_CONTEXT_FIELDS[k] then merged[k] = deep_copy(v, 2) end
    end
    merged.call_id = call_id
    return merged
end

local function stable_context(context: any): table
    local out = {}
    for k, v in pairs(context or {}) do
        if not freeze.TRANSIENT_CONTEXT_KEYS[k] then out[k] = v end
    end
    return out
end

local function failure(outcome: string, message: any)
    return nil, { outcome = outcome, error = tostring(message) }
end

local function changed(message: string)
    return failure(freeze.OUTCOME.CHANGED, message)
end

local function freeze_failed(message: any)
    return failure(freeze.OUTCOME.FREEZE_FAILED, message)
end

-- The fields the intent digest covers.
local function digest_input(frozen: any): table
    return {
        registry_id = frozen.registry_id,
        name = frozen.name,
        title = frozen.title,
        description = frozen.description,
        args = frozen.args,
        effective_context = stable_context(frozen.effective_context),
        fingerprint = frozen.fingerprint,
        delegate_target = frozen.delegate_target,
        browser_binding = frozen.browser_binding,
    }
end

-- Recomputes the intent digest of a frozen call (the release recheck).
function freeze.digest(frozen: any): (string?, string?)
    return fingerprint.digest(digest_input(frozen))
end

-- The repeated-denial key: tool identity and deployment fingerprint, the
-- full delegate target (agent and fingerprint), the stable browser binding,
-- canonical arguments and stable semantic context. Call IDs and per-launch
-- capability tokens are left out; the frozen call holds no timestamps.
function freeze.denial_key(frozen: any): (string?, string?)
    return fingerprint.digest({
        registry_id = frozen.registry_id,
        fingerprint = frozen.fingerprint,
        delegate_target = frozen.delegate_target,
        browser_binding = frozen.browser_binding,
        args = frozen.args,
        context = stable_context(frozen.effective_context),
    })
end

-- The target agent the model chose for a delegation call: the validated
-- call's agent_id, else its context's to_agent_id. The caller's merge may
-- replace to_agent_id through the session context, so the merged context is
-- not read here.
function freeze.delegate_target_id(validated: any): string?
    if type(validated) ~= "table" then return nil end
    local target = validated.agent_id
    if type(target) ~= "string" or target == "" then
        target = type(validated.context) == "table" and validated.context.to_agent_id or nil
    end
    if type(target) ~= "string" or target == "" then return nil end
    return target
end

local function entry_text(entry: any, key: string): string?
    local meta = type(entry) == "table" and entry.meta or nil
    local value = type(meta) == "table" and meta[key] or nil
    if type(value) == "string" and value ~= "" then return value end
    return nil
end

function freeze.call(validated: any, env: any): (any, any)
    if type(validated) ~= "table" or type(validated.call_id) ~= "string" or validated.call_id == "" then
        return freeze_failed("The tool call has no call ID")
    end
    env = env or {}
    if validated.valid ~= true then
        return nil, { outcome = freeze.OUTCOME.INVALID, error = validated.error }
    end

    -- Decode exactly as caller.lua prepare_call does, with the same error text.
    local args = validated.args
    if type(args) == "string" then
        local parsed, err = json.decode(args)
        if err then
            return failure(freeze.OUTCOME.ARGUMENTS, "Failed to parse arguments: " .. tostring(err))
        end
        args = parsed
    end
    local copy_ok, copy_value = pcall(deep_copy, args, 1)
    if not copy_ok then return freeze_failed("The arguments can't be frozen: " .. tostring(copy_value)) end
    args = copy_value

    local context_ok, merged = pcall(freeze.merge_context, validated.context, env.session_context, validated.call_id)
    if not context_ok then return freeze_failed("The execution context can't be frozen: " .. tostring(merged)) end

    local binding_ok, binding = pcall(deep_copy, env.browser_binding, 1)
    if not binding_ok then return freeze_failed("The browser binding can't be frozen: " .. tostring(binding)) end

    local registry_id = validated.registry_id
    local entry = env.entry
    if type(entry) ~= "table" then
        return changed("The tool entry " .. tostring(registry_id) .. " is no longer in the registry")
    end
    if entry.id ~= registry_id then
        return changed("The registry entry " .. tostring(entry.id) .. " is not the called tool " .. tostring(registry_id))
    end
    local tool_fingerprint, fp_err = fingerprint.of_entry(entry)
    if not tool_fingerprint then return freeze_failed("The tool entry can't be fingerprinted: " .. tostring(fp_err)) end

    local row_type = env.row_type or "function"
    local is_delegation = row_type == "delegation"
        or (env.delegation_func_id ~= nil and registry_id == env.delegation_func_id)
    local delegate_target = nil
    local identity = { registry_id = registry_id, fingerprint = tool_fingerprint }
    if is_delegation then
        row_type = "delegation"
        local target = freeze.delegate_target_id(validated)
        if not target then return changed("The delegation call names no target agent") end
        if merged.to_agent_id ~= target then
            return changed("The execution context delegates to " .. tostring(merged.to_agent_id)
                .. ", not to the requested agent " .. target)
        end
        local target_entry = env.target_entry
        if type(target_entry) ~= "table" then
            return changed("The target agent " .. target .. " is not in the registry")
        end
        if target_entry.id ~= target then
            return changed("The registry entry " .. tostring(target_entry.id) .. " is not the target agent " .. target)
        end
        local target_fingerprint, target_err = fingerprint.of_entry(target_entry)
        if not target_fingerprint then
            return freeze_failed("The target agent " .. target .. " can't be fingerprinted: " .. tostring(target_err))
        end
        delegate_target = { agent_id = target, fingerprint = target_fingerprint }
        local grant_fingerprint, grant_err = fingerprint.delegation(tool_fingerprint, target_fingerprint)
        if not grant_fingerprint then return freeze_failed(grant_err) end
        identity = { registry_id = registry_id, fingerprint = grant_fingerprint, target_agent_id = target }
    end

    local meta = type(entry.meta) == "table" and entry.meta or {}
    local frozen = {
        call_id = validated.call_id,
        row_type = row_type,
        registry_id = registry_id,
        name = validated.name,
        title = entry_text(entry, "title") or validated.name,
        description = entry_text(entry, "description") or "",
        args = args,
        effective_context = merged,
        fingerprint = tool_fingerprint,
        delegate_target = delegate_target,
        browser_binding = binding,
        meta = meta,
        approval = tool_meta.read(meta),
        identity = identity,
    }
    local digest, digest_err = freeze.digest(frozen)
    if not digest then return freeze_failed("The intent digest failed: " .. tostring(digest_err)) end
    frozen.intent_digest = digest
    local denial_key, key_err = freeze.denial_key(frozen)
    if not denial_key then return freeze_failed("The denial key failed: " .. tostring(key_err)) end
    frozen.denial_key = denial_key
    return frozen, nil
end

return freeze
