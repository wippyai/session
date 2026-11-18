local json = require("json")
local fingerprint = require("fingerprint")
local tool_meta = require("tool_meta")

-- Freezes one validated tool call for approval (EE2-2710, architecture 4.5
-- step 3): decoded arguments, the effective execution context, the tool
-- entry's identity, title, description and deployment fingerprint, the
-- delegate target for delegation calls and the Attention browser binding.
-- The intent digest covers all of them; the denial key covers what the
-- repeated-denial rule compares (4.3, order 5).
--
-- freeze.call(validated, env) never reads the registry; the gate passes the
-- entries in `env`:
--   session_context     the context the gate passes to caller:execute
--   row_type            "function" | "private_function" | "delegation"
--   delegation_func_id  ctx.config.delegation_func_id
--   entry               registry entry of validated.registry_id
--   target_entry        registry entry of the delegate target (delegation calls)
--   browser_binding     the Attention UI action binding, or nil
-- It returns the frozen call, or nil and a failure:
--   { outcome = "invalid", error }             validate marked the call invalid; it keeps its error
--   { outcome = "arguments", error }           arguments did not decode; error is the caller's text
--   { outcome = "changed_before_run", error }  the call does not name what would run
local freeze = {}

freeze.OUTCOME = { INVALID = "invalid", ARGUMENTS = "arguments", CHANGED = "changed_before_run" }

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
freeze.TRANSIENT_CONTEXT_KEYS = {
    call_id = true,
    attention_inspection_runtime = true,
    attention_context_runtime = true,
    ui_action_runtime = true,
}

local MAX_COPY_DEPTH = 64

local function deep_copy(value: any, depth: integer): any
    if type(value) ~= "table" then return value end
    if depth > MAX_COPY_DEPTH then error("value nests deeper than " .. MAX_COPY_DEPTH .. " levels") end
    local out = {}
    for k, v in pairs(value) do out[k] = deep_copy(v, depth + 1) end
    return out
end

-- Mirrors merge_execution_context in wippy.agent.tools:caller: tool context,
-- then session context over it, runtime fields removed, call_id set last.
function freeze.merge_context(tool_context: any, session_context: any, call_id: string): table
    local merged = {}
    for k, v in pairs(type(tool_context) == "table" and tool_context or {}) do
        if not freeze.RUNTIME_CONTEXT_FIELDS[k] then merged[k] = deep_copy(v, 1) end
    end
    for k, v in pairs(type(session_context) == "table" and session_context or {}) do
        if not freeze.RUNTIME_CONTEXT_FIELDS[k] then merged[k] = deep_copy(v, 1) end
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

local function changed(message: string)
    return nil, { outcome = freeze.OUTCOME.CHANGED, error = message }
end

-- The fields the intent digest covers (architecture 4.5 step 3).
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

-- The repeated-denial key: tool identity, delegate target, canonical
-- arguments and stable semantic context; no call IDs, timestamps or
-- capability tokens.
function freeze.denial_key(frozen: any): (string?, string?)
    return fingerprint.digest({
        registry_id = frozen.registry_id,
        target_agent_id = frozen.delegate_target and frozen.delegate_target.agent_id or nil,
        args = frozen.args,
        context = stable_context(frozen.effective_context),
    })
end

local function entry_text(entry: any, key: string): string?
    local meta = type(entry) == "table" and entry.meta or nil
    local value = type(meta) == "table" and meta[key] or nil
    if type(value) == "string" and value ~= "" then return value end
    return nil
end

function freeze.call(validated: any, env: any): (any, any)
    if type(validated) ~= "table" or type(validated.call_id) ~= "string" then
        return nil, { outcome = freeze.OUTCOME.INVALID, error = "Tool call is malformed" }
    end
    env = env or {}
    if validated.valid == false then
        return nil, { outcome = freeze.OUTCOME.INVALID, error = validated.error }
    end

    -- Decode exactly as caller.lua prepare_call does, with the same error text.
    local args = validated.args
    if type(args) == "string" then
        local parsed, err = json.decode(args)
        if err then
            return nil, { outcome = freeze.OUTCOME.ARGUMENTS, error = "Failed to parse arguments: " .. tostring(err) }
        end
        args = parsed
    end
    local copy_ok, copy_value = pcall(deep_copy, args, 1)
    if not copy_ok then return nil, { outcome = freeze.OUTCOME.INVALID, error = tostring(copy_value) } end
    args = copy_value

    local context_ok, merged = pcall(freeze.merge_context, validated.context, env.session_context, validated.call_id)
    if not context_ok then return nil, { outcome = freeze.OUTCOME.INVALID, error = tostring(merged) } end

    local registry_id = validated.registry_id
    local entry = env.entry
    if type(entry) ~= "table" then
        return changed("The tool entry " .. tostring(registry_id) .. " is no longer in the registry")
    end
    local tool_fingerprint, fp_err = fingerprint.of_entry(entry)
    if not tool_fingerprint then return changed("The tool entry can't be fingerprinted: " .. tostring(fp_err)) end

    local row_type = env.row_type or "function"
    local is_delegation = row_type == "delegation"
        or (env.delegation_func_id ~= nil and registry_id == env.delegation_func_id)
    local delegate_target = nil
    local identity = { registry_id = registry_id, fingerprint = tool_fingerprint }
    if is_delegation then
        row_type = "delegation"
        -- The target the model chose, from the validated call; the caller's
        -- merge may have replaced to_agent_id through session context.
        local target = validated.agent_id
        if type(target) ~= "string" or target == "" then
            target = type(validated.context) == "table" and validated.context.to_agent_id or nil
        end
        if type(target) ~= "string" or target == "" then
            return changed("The delegation call names no target agent")
        end
        if merged.to_agent_id ~= target then
            return changed("The execution context delegates to " .. tostring(merged.to_agent_id)
                .. ", not to the requested agent " .. target)
        end
        local target_fingerprint, target_err = fingerprint.of_entry(env.target_entry)
        if not target_fingerprint then
            return changed("The target agent " .. target .. " can't be resolved: " .. tostring(target_err))
        end
        delegate_target = { agent_id = target, fingerprint = target_fingerprint }
        local grant_fingerprint, grant_err = fingerprint.delegation(tool_fingerprint, target_fingerprint)
        if not grant_fingerprint then return changed(tostring(grant_err)) end
        identity = { registry_id = registry_id, fingerprint = grant_fingerprint, target_agent_id = target }
    end

    local meta = type(validated.meta) == "table" and validated.meta or (entry.meta or {})
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
        browser_binding = deep_copy(env.browser_binding, 1),
        meta = meta,
        approval = tool_meta.read(meta),
        identity = identity,
    }
    local digest, digest_err = freeze.digest(frozen)
    if not digest then return nil, { outcome = freeze.OUTCOME.INVALID, error = digest_err } end
    frozen.intent_digest = digest
    local denial_key, key_err = freeze.denial_key(frozen)
    if not denial_key then return nil, { outcome = freeze.OUTCOME.INVALID, error = key_err } end
    frozen.denial_key = denial_key
    return frozen, nil
end

return freeze
