local test = require("test")
local json = require("json")
local freeze = require("freeze")
local fingerprint = require("fingerprint")
local tool_caller = require("tool_caller")
local canonical_json = require("canonical_json")

-- Freeze, intent digest, denial key and fingerprints.

local DELEGATE = "app:delegate_to_agent"

local function entry(overrides: any?)
    local value = {
        id = "app.tools:delete_customer",
        kind = "function.lua",
        meta = { type = "tool", title = "Delete customer", description = "Permanently deletes a customer.",
            approval = "required" },
        data = { source = "file://delete.lua", method = "run" },
    }
    for k, v in pairs(overrides or {}) do value[k] = v end
    return value
end

local function agent_entry(id: string, prompt: string?)
    return { id = id, kind = "registry.entry", meta = { type = "agent.gen1", title = id },
        data = { prompt = prompt or "You help." } }
end

local function validated(overrides: any?)
    local value = {
        call_id = "call_1",
        name = "delete_customer",
        args = { customer_id = "c_1042", hard = true },
        registry_id = "app.tools:delete_customer",
        meta = { type = "tool", approval = "required" },
        context = { tenant = "acme" },
        valid = true,
    }
    for k, v in pairs(overrides or {}) do value[k] = v end
    return value
end

local function env(overrides: any?)
    local value = { session_context = { session_id = "s1", user_id = "u1" }, row_type = "function", entry = entry() }
    for k, v in pairs(overrides or {}) do value[k] = v end
    return value
end

local function frozen_of(call: any, options: any)
    local frozen, failure = freeze.call(call, options)
    test.is_nil(failure, failure and failure.error or nil)
    return frozen
end

local function delegation_call(target: string, overrides: any?)
    local value = validated({
        call_id = "call_d",
        name = "ask_worker",
        registry_id = DELEGATE,
        args = { task = "summarize" },
        meta = {},
        context = { from_agent_id = "app.agents:main", to_agent_id = target },
    })
    for k, v in pairs(overrides or {}) do value[k] = v end
    return value
end

local function delegation_env(target: string, overrides: any?)
    local value = env({
        row_type = "delegation",
        delegation_func_id = DELEGATE,
        entry = entry({ id = DELEGATE, meta = { type = "tool", title = "Delegate" }, data = { method = "run" } }),
        target_entry = agent_entry(target),
    })
    for k, v in pairs(overrides or {}) do value[k] = v end
    return value
end

local function define_tests()
    describe("Tool approval freeze", function()
        it("freezes decoded arguments, the effective context, the entry and the digest", function()
            local frozen = frozen_of(validated({ args = '{"customer_id":"c_1042","hard":true}' }), env())
            test.eq(frozen.args.customer_id, "c_1042")
            test.is_true(frozen.args.hard)
            test.eq(frozen.title, "Delete customer")
            test.eq(frozen.description, "Permanently deletes a customer.")
            test.eq(frozen.effective_context.tenant, "acme")
            test.eq(frozen.effective_context.session_id, "s1")
            test.eq(frozen.effective_context.call_id, "call_1")
            test.eq(frozen.fingerprint, fingerprint.of_entry(entry()))
            test.matches(frozen.intent_digest, "^sha256:%x+$")
            test.eq(#frozen.intent_digest, 71)
            test.matches(frozen.denial_key, "^sha256:%x+$")
            test.is_true(frozen.approval.required)
            test.eq(frozen.identity.registry_id, "app.tools:delete_customer")
            test.eq(frozen.identity.fingerprint, frozen.fingerprint)
        end)

        it("merges context the way the caller does: session over tool, runtime fields removed", function()
            local merged = freeze.merge_context(
                { a = 1, keep = "tool", ui_action_runtime = { token = "t" } },
                { a = 2, b = 3, attention_context_runtime = { token = "s" }, call_id = "forged" },
                "call_9")
            test.eq(merged.a, 2)
            test.eq(merged.b, 3)
            test.eq(merged.keep, "tool")
            test.is_nil(merged.ui_action_runtime)
            test.is_nil(merged.attention_context_runtime)
            test.eq(merged.call_id, "call_9", "call_id is set last, as in the caller")
        end)

        it("keeps the digest for the same call with another key order or call ID", function()
            local a = frozen_of(validated({ args = '{"customer_id":"c_1042","hard":true,"n":{"x":1,"y":2}}' }), env())
            local b = frozen_of(validated({ call_id = "call_2",
                args = '{"n":{"y":2,"x":1},"hard":true,"customer_id":"c_1042"}' }), env())
            test.eq(a.intent_digest, b.intent_digest)
            test.eq(a.denial_key, b.denial_key)
            local again = frozen_of(validated(), env())
            test.eq(freeze.digest(again), again.intent_digest, "the release recheck recomputes the same digest")
            local token = frozen_of(validated(), env({ session_context = { session_id = "s1", user_id = "u1",
                ui_action_runtime = { capability = "other" } } }))
            test.eq(token.intent_digest, again.intent_digest, "capability tokens are not part of the digest")
        end)

        it("changes the digest when an argument, the context, the entry or the binding changes", function()
            local base = frozen_of(validated(), env())
            local changes = {
                argument = frozen_of(validated({ args = { customer_id = "c_1043", hard = true } }), env()),
                session_context = frozen_of(validated(), env({ session_context = { session_id = "s1", user_id = "u2" } })),
                tool_context = frozen_of(validated({ context = { tenant = "globex" } }), env()),
                entry_meta = frozen_of(validated(), env({ entry = entry({ meta = { type = "tool", title = "Delete customer",
                    description = "Permanently deletes a customer.", approval = { required = true, approve_all = true } } }) })),
                entry_data = frozen_of(validated(), env({ entry = entry({ data = { source = "file://delete2.lua", method = "run" } }) })),
                binding = frozen_of(validated(), env({ browser_binding = { connection_id = "c2", host_id = "h1" } })),
            }
            for name, changed in pairs(changes) do
                test.neq(changed.intent_digest, base.intent_digest, name)
            end
            test.neq(changes.argument.denial_key, base.denial_key)
            test.neq(changes.session_context.denial_key, base.denial_key, "stable context is part of the denial key")
            test.neq(changes.binding.denial_key, base.denial_key, "the browser binding is part of the denial key")
            test.neq(changes.entry_data.denial_key, base.denial_key, "the deployment fingerprint is part of the denial key")
            local token = frozen_of(validated({ call_id = "call_7" }), env({ session_context = { session_id = "s1",
                user_id = "u1", ui_action_runtime = { capability = "launch-token" } } }))
            test.eq(token.denial_key, base.denial_key, "call IDs and per-launch tokens are not part of the denial key")
        end)

        it("returns freeze_failed, never invalid, when a valid call can't be frozen", function()
            local deep: any = "leaf"
            for _ = 1, 65 do deep = { deep } end
            local _, nested = freeze.call(validated({ args = { payload = deep } }), env())
            test.eq(nested.outcome, "freeze_failed", tostring(nested.error))
            local _, func = freeze.call(validated({ args = { callback = function() end } }), env())
            test.eq(func.outcome, "freeze_failed", tostring(func.error))
            local _, mixed = freeze.call(validated({ args = { [1] = "a", x = "b" } }), env())
            test.eq(mixed.outcome, "freeze_failed", tostring(mixed.error))
            local _, deep_context = freeze.call(validated({ context = { nested = deep } }), env())
            test.eq(deep_context.outcome, "freeze_failed", tostring(deep_context.error))
            local _, no_id = freeze.call(validated({ call_id = "" }), env())
            test.eq(no_id.outcome, "freeze_failed")
            local _, not_table = freeze.call("call_1", env())
            test.eq(not_table.outcome, "freeze_failed")
        end)

        it("treats only a call without valid = true as invalid, as the caller does", function()
            local without_flag = validated({ error = "no schema" })
            without_flag.valid = nil
            local _, missing = freeze.call(without_flag, env())
            test.eq(missing.outcome, "invalid")
            test.eq(missing.error, "no schema")
            local _, truthy = freeze.call(validated({ valid = "yes" }), env())
            test.eq(truthy.outcome, "invalid")
        end)

        it("reads the approval settings from the same entry as the fingerprint", function()
            local unmarked_entry = entry({ meta = { type = "tool", title = "Delete customer" } })
            local from_entry = frozen_of(validated({ meta = { type = "tool", approval = "required" } }),
                env({ entry = unmarked_entry }))
            test.is_false(from_entry.approval.required, "validate-time meta is ignored")
            local marked = frozen_of(validated({ meta = { type = "tool" } }), env())
            test.is_true(marked.approval.required, "the entry marks the tool")
            test.eq(marked.meta.approval, "required")
        end)

        it("settles as changed_before_run when the entry is not the called tool", function()
            local _, wrong = freeze.call(validated(), env({ entry = entry({ id = "app.tools:other" }) }))
            test.eq(wrong.outcome, "changed_before_run")
            local _, no_id = freeze.call(validated(), env({ entry = entry({ id = false }) }))
            test.eq(no_id.outcome, "changed_before_run")
        end)

        it("gives the tool the same context as freeze (parity with the real caller)", function()
            local tool_context = { tenant = "acme", shared = "tool", ui_action_runtime = { token = "t" } }
            local session_context = { session_id = "s1", shared = "session", nested = { a = { 1, 2 } },
                attention_context_runtime = { token = "s" }, call_id = "forged" }
            local call = validated({ context = tool_context })
            local frozen = frozen_of(call, env({ session_context = session_context }))

            local received = nil
            local caller = tool_caller.new()
            caller.executor = {
                with_context = function(_, context)
                    return {
                        call = function(_, registry_id, args)
                            received = { context = context, registry_id = registry_id, args = args }
                            return { ok = true }, nil
                        end,
                    }
                end,
            }
            local results, err = caller:execute(session_context, { call_1 = validated({ context = tool_context }) })
            test.is_nil(err)
            test.is_nil(results.call_1.error)
            test.not_nil(received, "the capturing executor ran")
            test.eq(canonical_json.encode(received.context), canonical_json.encode(frozen.effective_context))
            test.eq(received.registry_id, frozen.registry_id)
            test.eq(canonical_json.encode(received.args), canonical_json.encode(frozen.args))
        end)

        it("keeps exact int64 digits in the digest", function()
            local low = frozen_of(validated({ args = '{"id":9007199254740992}' }), env())
            local high = frozen_of(validated({ args = '{"id":9007199254740993}' }), env())
            test.neq(low.intent_digest, high.intent_digest)
            local min = frozen_of(validated({ args = '{"id":-9223372036854775808}' }), env())
            test.eq(math.type(min.args.id), "integer")
            test.eq(string.format("%d", min.args.id), "-9223372036854775808")
        end)

        it("settles undecodable arguments with the caller's own error text", function()
            local bad = "{\"customer_id\": \"c_1042\""
            local frozen, failure = freeze.call(validated({ args = bad }), env())
            test.is_nil(frozen)
            test.eq(failure.outcome, "arguments")

            -- The text the caller returns today for the same call.
            local caller = tool_caller.new()
            local results, err = caller:execute({}, { call_1 = validated({ args = bad }) })
            test.is_nil(err)
            test.eq(failure.error, results.call_1.error)
            test.matches(failure.error, "^Failed to parse arguments: ")
        end)

        it("passes a call that validate marked invalid with its own error", function()
            local _, failure = freeze.call(validated({ valid = false, error = "Failed to get tool schema: gone" }), env())
            test.eq(failure.outcome, "invalid")
            test.eq(failure.error, "Failed to get tool schema: gone")
        end)

        it("settles a call whose tool entry is gone as changed_before_run", function()
            local _, failure = freeze.call(validated(), env({ entry = false }))
            test.eq(failure.outcome, "changed_before_run")
        end)
    end)

    describe("Tool approval freeze: delegation", function()
        it("takes the target from the validated call and keys the grant to it", function()
            local frozen = frozen_of(delegation_call("app.agents:worker"), delegation_env("app.agents:worker"))
            test.eq(frozen.row_type, "delegation")
            test.eq(frozen.delegate_target.agent_id, "app.agents:worker")
            test.eq(frozen.delegate_target.fingerprint, fingerprint.of_entry(agent_entry("app.agents:worker")))
            test.eq(frozen.identity.target_agent_id, "app.agents:worker")
            test.eq(frozen.identity.fingerprint,
                fingerprint.delegation(frozen.fingerprint, frozen.delegate_target.fingerprint))
            test.neq(frozen.identity.fingerprint, frozen.fingerprint)
        end)

        it("detects a delegation call by the delegation function ID", function()
            local options = delegation_env("app.agents:worker")
            options.row_type = nil
            local frozen = frozen_of(delegation_call("app.agents:worker"), options)
            test.eq(frozen.row_type, "delegation")
        end)

        it("settles as changed_before_run when session context names another target", function()
            local options = delegation_env("app.agents:worker", {
                session_context = { session_id = "s1", to_agent_id = "app.agents:admin" },
            })
            local frozen, failure = freeze.call(delegation_call("app.agents:worker"), options)
            test.is_nil(frozen)
            test.eq(failure.outcome, "changed_before_run")
            test.contains(failure.error, "app.agents:admin")
        end)

        it("prefers the call's agent_id when the call carries it", function()
            local call = delegation_call("app.agents:worker", { agent_id = "app.agents:worker" })
            test.not_nil(frozen_of(call, delegation_env("app.agents:worker")))
            local forged = delegation_call("app.agents:admin", { agent_id = "app.agents:worker" })
            local _, failure = freeze.call(forged, delegation_env("app.agents:worker"))
            test.eq(failure.outcome, "changed_before_run")
        end)

        it("gives another target, or a changed target agent, another grant key", function()
            local a = frozen_of(delegation_call("app.agents:worker"), delegation_env("app.agents:worker"))
            local b = frozen_of(delegation_call("app.agents:admin"), delegation_env("app.agents:admin"))
            test.neq(a.identity.target_agent_id, b.identity.target_agent_id)
            test.neq(a.intent_digest, b.intent_digest)
            test.neq(a.denial_key, b.denial_key)
            local redeployed = frozen_of(delegation_call("app.agents:worker"), delegation_env("app.agents:worker",
                { target_entry = agent_entry("app.agents:worker", "You help differently.") }))
            test.neq(redeployed.identity.fingerprint, a.identity.fingerprint)
        end)

        it("settles as changed_before_run when the target entry is another agent", function()
            local _, wrong = freeze.call(delegation_call("app.agents:worker"),
                delegation_env("app.agents:worker", { target_entry = agent_entry("app.agents:admin") }))
            test.eq(wrong.outcome, "changed_before_run")
        end)

        it("puts the full delegate target into the denial key", function()
            local a = frozen_of(delegation_call("app.agents:worker"), delegation_env("app.agents:worker"))
            local redeployed = frozen_of(delegation_call("app.agents:worker"), delegation_env("app.agents:worker",
                { target_entry = agent_entry("app.agents:worker", "Changed prompt.") }))
            test.neq(a.denial_key, redeployed.denial_key)
        end)

        it("settles a delegation call without a target or a resolvable target agent", function()
            local _, no_target = freeze.call(delegation_call("app.agents:worker", { context = {} }),
                delegation_env("app.agents:worker"))
            test.eq(no_target.outcome, "changed_before_run")
            local _, no_entry = freeze.call(delegation_call("app.agents:worker"),
                delegation_env("app.agents:worker", { target_entry = false }))
            test.eq(no_entry.outcome, "changed_before_run")
        end)
    end)

    describe("Tool approval fingerprints", function()
        it("is stable for equal entries and changes with kind, meta or data", function()
            local base = fingerprint.of_entry(entry())
            test.eq(fingerprint.of_entry(entry()), base)
            test.eq(fingerprint.of_entry(entry({ id = "app.tools:other" })), base, "the ID is not part of it")
            test.neq(fingerprint.of_entry(entry({ kind = "process.lua" })), base)
            test.neq(fingerprint.of_entry(entry({ meta = { type = "tool", title = "Delete customer!" } })), base)
            test.neq(fingerprint.of_entry(entry({ data = { source = "file://delete.lua", method = "main" } })), base)
            local _, err = fingerprint.of_entry({ meta = {} })
            test.not_nil(err)
        end)

        it("reads a live registry entry", function()
            local value, read_entry = fingerprint.for_id("app.approval:freeze_test")
            test.matches(value, "^sha256:%x+$")
            test.eq(read_entry.id, "app.approval:freeze_test", "registry.get gives the id freeze compares")
            test.eq(value, fingerprint.of_entry(read_entry))
            local missing = fingerprint.for_id("app.approval:no_such_entry")
            test.is_nil(missing)
        end)

        it("hashes canonical JSON, so key order does not matter", function()
            local a = fingerprint.digest(json.decode('{"a":1,"b":{"c":2,"d":3}}'))
            local b = fingerprint.digest(json.decode('{"b":{"d":3,"c":2},"a":1}'))
            test.eq(a, b)
        end)
    end)
end

return test.run_cases(define_tests)
