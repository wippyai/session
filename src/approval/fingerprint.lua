local hash = require("hash")
local canonical_json = require("canonical_json")

-- Deployment fingerprints and digests for tool approval. A fingerprint is `sha256:` of the
-- canonical JSON of a registry entry's kind, meta and data. Registry entries
-- have no version, so this is what a grant pins. An edit that changes only
-- code the entry points to, and not the entry itself, does not change the
-- fingerprint.
--
-- The canonical JSON is canonical_json.lua (see that file for why the
-- Session keeps its own encoder). It keeps
-- every 64-bit integer exactly; numbers above the int64 range reach the
-- Session as floats already (docs/tool-approval-protocol.md, "Exact
-- numbers"). A value that is not JSON-shaped is refused, never hashed.
local fingerprint = {}

-- `sha256:<64 hex>` of the canonical JSON of a value.
function fingerprint.digest(value: any): (string?, string?)
    local text, encode_err = canonical_json.encode(value)
    if not text then return nil, "not JSON-shaped: " .. tostring(encode_err) end
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

-- The grant fingerprint of a delegation call: the delegation function's
-- entry and the target agent's entry together, so a change to either one
-- needs fresh consent (a delegation grant key holds the delegation function
-- ID, the resolved target agent ID and its fingerprint).
function fingerprint.delegation(function_fingerprint: string, target_fingerprint: string): (string?, string?)
    if type(function_fingerprint) ~= "string" or type(target_fingerprint) ~= "string" then
        return nil, "both fingerprints are required"
    end
    return fingerprint.digest({ ["function"] = function_fingerprint, target = target_fingerprint })
end

return fingerprint
