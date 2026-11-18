local hash = require("hash")
local registry = require("registry")
local canonical = require("canonical")

-- Deployment fingerprints and digests for tool approval (EE2-2710,
-- architecture 4.3 and 4.5 step 3). A fingerprint is `sha256:` of the
-- canonical JSON (wippy.agent:canonical) of a registry entry's kind, meta and
-- data. Registry entries have no version, so this is what a grant pins. An
-- edit that changes only code the entry points to, and not the entry itself,
-- does not change the fingerprint.
--
-- Canonical JSON keeps every 64-bit integer exactly; numbers above the int64
-- range reach the Session as floats already (docs/tool-approval-protocol.md,
-- "Exact numbers").
local fingerprint = {}

-- `sha256:<64 hex>` of the canonical JSON of a value.
function fingerprint.digest(value: any): (string?, string?)
    local text = canonical.encode(value)
    local digest, err = hash.sha256(text)
    if err or type(digest) ~= "string" then return nil, "sha256 failed: " .. tostring(err) end
    return "sha256:" .. digest, nil
end

-- Fingerprint of a registry entry ({ kind, meta, data }, as registry.get returns it).
function fingerprint.of_entry(entry: any): (string?, string?)
    if type(entry) ~= "table" or type(entry.kind) ~= "string" or entry.kind == "" then
        return nil, "a registry entry with a kind is required"
    end
    return fingerprint.digest({ kind = entry.kind, meta = entry.meta or {}, data = entry.data or {} })
end

-- Reads an entry from the registry and fingerprints it. Returns the
-- fingerprint and the entry.
function fingerprint.for_id(registry_id: string): (string?, any)
    if type(registry_id) ~= "string" or registry_id == "" then return nil, "registry_id is required" end
    local entry, err = registry.get(registry_id)
    if not entry then return nil, "registry entry " .. registry_id .. " not found: " .. tostring(err) end
    local value, fp_err = fingerprint.of_entry(entry)
    if not value then return nil, fp_err end
    return value, entry
end

-- The grant fingerprint of a delegation call: the delegation function's
-- entry and the target agent's entry together, so a change to either one
-- needs fresh consent (architecture 4.3, "A delegation grant key contains the
-- delegation function ID, the resolved target agent ID and its fingerprint").
function fingerprint.delegation(function_fingerprint: string, target_fingerprint: string): (string?, string?)
    if type(function_fingerprint) ~= "string" or type(target_fingerprint) ~= "string" then
        return nil, "both fingerprints are required"
    end
    return fingerprint.digest({ ["function"] = function_fingerprint, target = target_fingerprint })
end

return fingerprint
