local test = require("test")
local policy = require("policy")
local trait_config = require("trait_config")

-- Policy evaluator (architecture 4.3): the combination table (AC 10), the
-- evaluation order (AC 19), grant matching and suspension (AC 9, 12, 13, 15,
-- 16, 43).

local FP_A = "sha256:" .. string.rep("a", 64)
local FP_B = "sha256:" .. string.rep("b", 64)
local SCOPE = { session_id = "s1", owner_id = "u1", epoch = 1, denied_keys = {} }

local function effective(require_value: string, mode: string, opted_in: boolean?)
    local current = nil
    if opted_in ~= false then current = { require = require_value, approve_all = mode } end
    local stored = { active = true, require = require_value, approve_all = mode, timeout_seconds = 900,
        max_requests_per_turn = 10 }
    local value, err = trait_config.effective(stored, current)
    test.is_nil(err)
    return value
end

-- A frozen call. kind: function | private_function | delegation.
local function call(id: string, opts: any?)
    opts = opts or {}
    local row_type = opts.row_type or "function"
    local meta = opts.meta
    if meta == nil and (opts.required or opts.option ~= nil) then
        local approval = {}
        if opts.required then approval.required = true end
        if opts.option ~= nil then approval.approve_all = opts.option end
        meta = { approval = approval }
    end
    if row_type == "private_function" then
        meta = meta or {}
        meta.private = true
    end
    local registry_id = opts.registry_id or (row_type == "delegation" and "app:delegate" or "app.tools:delete")
    local target = nil
    if row_type == "delegation" then target = { agent_id = opts.target or "app.agents:worker", fingerprint = FP_B } end
    return {
        call_id = id,
        row_type = row_type,
        registry_id = registry_id,
        meta = meta,
        identity = { registry_id = registry_id, fingerprint = opts.fingerprint or FP_A,
            target_agent_id = target and target.agent_id or nil },
        delegate_target = target,
        denial_key = opts.denial_key or ("key-" .. id),
    }
end

local function tool_grant(id: string, overrides: any?)
    local grant = { grant_id = id, session_id = "s1", owner_id = "u1", epoch = 1, scope = "tool",
        registry_id = "app.tools:delete", fingerprint = FP_A, status = "active", revision = 1 }
    for k, v in pairs(overrides or {}) do grant[k] = v end
    return grant
end

local function session_grant(id: string, manifest: any?, overrides: any?)
    local grant = { grant_id = id, session_id = "s1", owner_id = "u1", epoch = 1, scope = "session",
        manifest = manifest or { { registry_id = "app.tools:delete", fingerprint = FP_A } },
        status = "active", revision = 1 }
    for k, v in pairs(overrides or {}) do grant[k] = v end
    return grant
end

local function batch(calls: any, eff: any, grants: any?, scope: any?)
    local out, err = policy.evaluate_batch(calls, eff, grants or {}, scope or SCOPE)
    test.is_nil(err)
    return out
end

local function one(c: any, eff: any, grants: any?, scope: any?)
    local result, err = policy.evaluate(c, eff, grants or {}, scope or SCOPE)
    test.is_nil(err)
    return result
end

-- The combination table of architecture 4.3. Per mode: the scope offered for
-- tool option absent, true, false. "batch" holds with two eligible requests;
-- one request alone gets none.
local TABLE = {
    off = { absent = "none", ["true"] = "tool", ["false"] = "none" },
    batch = { absent = "batch", ["true"] = "tool", ["false"] = "none" },
    tool = { absent = "tool", ["true"] = "tool", ["false"] = "none" },
    session = { absent = "session", ["true"] = "session", ["false"] = "none" },
}
local OPTIONS = { absent = nil, ["true"] = true, ["false"] = false }

local function offered_scope(result: any): string
    if not result.offered.approve_all then return "none" end
    return result.offered.approve_all.scope
end

local function check_offer(result: any, expected: string, label: string)
    test.eq(result.decision, "ask", label .. " asks")
    test.eq(offered_scope(result), expected, label)
    local has_approve_all = false
    for _, decision in ipairs(result.offered.decisions) do
        if decision == "approve_all" then has_approve_all = true end
    end
    test.eq(has_approve_all, expected ~= "none", label .. ": approve_all in decisions")
    test.eq(result.offered.decisions[1], "approve", label)
    test.eq(result.offered.decisions[#result.offered.decisions], "deny", label)
end

local function define_tests()
    describe("Tool approval policy: combination table (AC 10)", function()
        for _, require_value in ipairs({ "marked", "all" }) do
            for _, row_type in ipairs({ "function", "private_function", "delegation" }) do
                it(("offers the listed scope for all 12 pairs, require %s, %s calls"):format(require_value, row_type),
                    function()
                        local checked = 0
                        for _, mode in ipairs({ "off", "batch", "tool", "session" }) do
                            local eff = effective(require_value, mode)
                            for _, option_name in ipairs({ "absent", "true", "false" }) do
                                local option = OPTIONS[option_name]
                                local label = ("%s/%s/%s/%s"):format(require_value, row_type, mode, option_name)
                                -- Under marked the tool is marked; under all it is not, so `all` alone asks.
                                local opts = { row_type = row_type, option = option, required = require_value == "marked" }
                                local pair = batch({ call("c1", opts), call("c2", opts) }, eff)
                                local single = batch({ call("c1", opts) }, eff)
                                if row_type == "delegation" and require_value == "marked" then
                                    -- Phase 1: delegation calls are gated only under require: all.
                                    test.eq(pair.results[1].decision, "allow", label)
                                    test.eq(pair.results[1].reason, "not_required", label)
                                    test.is_nil(pair.results[1].offered, label)
                                else
                                    local expected = TABLE[mode][option_name]
                                    check_offer(pair.results[1], expected, label .. " (two requests)")
                                    check_offer(pair.results[2], expected, label .. " (two requests, second)")
                                    local expected_single = expected == "batch" and "none" or expected
                                    check_offer(single.results[1], expected_single, label .. " (one request)")
                                    if expected ~= "none" then
                                        test.eq(#pair.results[1].offered.approve_all.covers, 2, label .. " covers")
                                        test.eq(pair.results[1].offered.approve_all.covers[1], "c1", label)
                                        test.eq(pair.results[1].offered.approve_all.covers[2], "c2", label)
                                    end
                                end
                                checked = checked + 1
                            end
                        end
                        test.eq(checked, 12)
                    end)
            end
        end

        it("runs an unmarked call without asking under require: marked", function()
            local result = one(call("c1", {}), effective("marked", "session"))
            test.eq(result.decision, "allow")
            test.eq(result.reason, "not_required")
            local restricted = one(call("c1", { option = false }), effective("marked", "session"))
            test.eq(restricted.decision, "allow", "approve_all: false alone does not mark a tool")
        end)

        it("asks for every call under require: all, including private and delegation calls", function()
            for _, row_type in ipairs({ "function", "private_function", "delegation" }) do
                local result = one(call("c1", { row_type = row_type }), effective("all", "off"))
                test.eq(result.decision, "ask", row_type)
                test.eq(result.reason, "approval_required", row_type)
            end
        end)

        it("counts only eligible requests for scope batch and keeps tool scope to one grant key", function()
            local eff = effective("all", "batch")
            local out = batch({ call("c1", {}), call("c2", { option = false }),
                call("c3", { registry_id = "app.tools:mail", option = true }) }, eff)
            -- c1 and c3 are eligible (two), c2 is not.
            test.eq(offered_scope(out.results[1]), "batch")
            test.eq(table.concat(out.results[1].offered.approve_all.covers, ","), "c1,c3")
            test.eq(offered_scope(out.results[2]), "none")
            test.eq(offered_scope(out.results[3]), "tool")
            test.eq(table.concat(out.results[3].offered.approve_all.covers, ","), "c3")

            local lonely = batch({ call("c1", {}), call("c2", { option = false }) }, eff)
            test.eq(offered_scope(lonely.results[1]), "none", "one eligible request gets no batch scope")
        end)

        it("does not offer grant scopes when the current agent lacks the trait", function()
            local eff = effective("marked", "session", false)
            local out = batch({ call("c1", { required = true }), call("c2", { required = true, option = true }) }, eff)
            test.eq(offered_scope(out.results[1]), "none")
            test.eq(offered_scope(out.results[2]), "none")
            local batch_mode = batch({ call("c1", { required = true }), call("c2", { required = true }) },
                effective("marked", "batch", false))
            test.eq(offered_scope(batch_mode.results[1]), "batch", "batch scope stores no grant")
        end)
    end)

    describe("Tool approval policy: evaluation order (AC 19)", function()
        it("skips every check when the operator switch is off, with a warning", function()
            local eff = effective("all", "off")
            eff.enforcement = "off"
            local result = one(call("c1", { required = true }), eff)
            test.eq(result.decision, "allow")
            test.eq(result.reason, "enforcement_off")
            test.is_true(#result.warnings >= 1)
        end)

        it("checks the requirement before repeated denial", function()
            local scope = { session_id = "s1", owner_id = "u1", epoch = 1, denied_keys = { k1 = true } }
            local result = one(call("c1", { denial_key = "k1" }), effective("marked", "off"), {}, scope)
            test.eq(result.reason, "not_required")
        end)

        it("settles a repeated denied call before it looks at grants", function()
            local scope = { session_id = "s1", owner_id = "u1", epoch = 1, denied_keys = { k1 = true } }
            local result = one(call("c9", { required = true, denial_key = "k1" }), effective("marked", "tool"),
                { tool_grant("g1") }, scope)
            test.eq(result.decision, "settle")
            test.eq(result.reason, "repeated_denied_call")
            test.is_nil(result.grant_id)
            local other = one(call("c10", { required = true, denial_key = "k2" }), effective("marked", "tool"),
                { tool_grant("g1") }, scope)
            test.eq(other.reason, "grant", "a different denial key uses the grant")
        end)

        it("fails closed on a malformed policy, call or scope", function()
            local _, err1 = policy.evaluate(call("c1", {}), { active = true, enforcement = "enforce",
                require = "some", approve_all = "off", agent_opted_in = true }, {}, SCOPE)
            test.not_nil(err1)
            local _, err2 = policy.evaluate({ call_id = "c1", row_type = "tool" }, effective("all", "off"), {}, SCOPE)
            test.not_nil(err2)
            local _, err3 = policy.evaluate(call("c1", {}), effective("all", "off"), { tool_grant("g1") },
                { denied_keys = {} })
            test.not_nil(err3, "grants need the owner, session and epoch to match against")
        end)
    end)

    describe("Tool approval policy: grants (AC 9, 12, 13, 15, 16, 43)", function()
        it("matches a tool grant under mode tool or session, and under off or batch only with approve_all: true", function()
            for _, mode in ipairs({ "tool", "session" }) do
                local result = one(call("c1", { required = true }), effective("marked", mode), { tool_grant("g1") })
                test.eq(result.reason, "grant", mode)
                test.eq(result.grant_id, "g1", mode)
                test.eq(#result.suspend, 0, mode)
            end
            for _, mode in ipairs({ "off", "batch" }) do
                local absent = one(call("c1", { required = true }), effective("marked", mode), { tool_grant("g1") })
                test.eq(absent.decision, "ask", mode)
                test.eq(absent.suspend[1].grant_id, "g1", mode)
                test.eq(absent.suspend[1].reason, "mode_not_permitted", mode)
                local keeps = one(call("c1", { required = true, option = true }), effective("marked", mode),
                    { tool_grant("g1") })
                test.eq(keeps.reason, "grant", mode .. " with tool approve_all: true")
            end
        end)

        it("matches a session grant only under mode session and only for tools in its manifest", function()
            local grants = { session_grant("g2") }
            test.eq(one(call("c1", { required = true }), effective("marked", "session"), grants).reason, "grant")
            local under_tool = one(call("c1", { required = true }), effective("marked", "tool"), grants)
            test.eq(under_tool.decision, "ask")
            test.eq(under_tool.suspend[1].reason, "mode_not_permitted")
            local added_later = one(call("c2", { required = true, registry_id = "app.tools:new" }),
                effective("marked", "session"), grants)
            test.eq(added_later.decision, "ask", "a tool added after the grant asks")
            test.eq(#added_later.suspend, 0)
        end)

        it("never lets a grant satisfy a tool with approve_all: false", function()
            local grants = { tool_grant("g1"), session_grant("g2") }
            local result = one(call("c1", { required = true, option = false }), effective("marked", "session"), grants)
            test.eq(result.decision, "ask")
            test.eq(result.max_scope, "none")
            test.eq(#result.suspend, 2)
            test.eq(result.suspend[1].reason, "tool_approve_all_false")
        end)

        it("matches no grant for an agent without the trait while the gate stays on", function()
            local result = one(call("c1", { required = true }), effective("marked", "session", false),
                { tool_grant("g1"), session_grant("g2") })
            test.eq(result.decision, "ask")
            test.eq(#result.suspend, 2)
            test.eq(result.suspend[1].reason, "agent_without_trait")
        end)

        it("never matches a suspended or revoked grant, even when the policy permits it again", function()
            for _, status in ipairs({ "suspended", "revoked" }) do
                local result = one(call("c1", { required = true }), effective("marked", "session"),
                    { tool_grant("g1", { status = status, suspension_reason = "mode_not_permitted" }) })
                test.eq(result.decision, "ask", status)
                test.eq(#result.suspend, 0, status)
            end
        end)

        it("asks again after a deployment change (new fingerprint) without suspending the grant", function()
            local result = one(call("c1", { required = true, fingerprint = FP_B }), effective("marked", "tool"),
                { tool_grant("g1"), session_grant("g2") })
            test.eq(result.decision, "ask")
            test.eq(#result.suspend, 0)
        end)

        it("matches a delegation grant only for its recorded target", function()
            local grant = tool_grant("g3", { registry_id = "app:delegate", target_agent_id = "app.agents:worker" })
            local same = one(call("c1", { row_type = "delegation" }), effective("all", "tool"), { grant })
            test.eq(same.reason, "grant")
            local other = one(call("c2", { row_type = "delegation", target = "app.agents:admin" }),
                effective("all", "tool"), { grant })
            test.eq(other.decision, "ask", "a grant for target A never runs target B")
            local untargeted = tool_grant("g4", { registry_id = "app:delegate" })
            test.eq(one(call("c3", { row_type = "delegation" }), effective("all", "tool"), { untargeted }).decision,
                "ask", "a grant without a target does not match a delegation call")
        end)

        it("keeps grants to their owner, session and epoch", function()
            for _, overrides in ipairs({ { session_id = "s2" }, { owner_id = "u2" }, { epoch = 2 } }) do
                local result = one(call("c1", { required = true }), effective("marked", "tool"),
                    { tool_grant("g1", overrides) })
                test.eq(result.decision, "ask")
            end
        end)

        it("matches private calls like public calls", function()
            local result = one(call("c1", { row_type = "private_function", required = true }),
                effective("marked", "tool"), { tool_grant("g1") })
            test.eq(result.reason, "grant")
        end)

        it("returns each grant to suspend once per batch", function()
            local out = batch({ call("c1", { required = true }), call("c2", { required = true }) },
                effective("marked", "off"), { tool_grant("g1") })
            test.eq(#out.suspend, 1)
            test.eq(out.suspend[1].grant_id, "g1")
        end)
    end)
end

return test.run_cases(define_tests)
