local test = require("test")
local json = require("json")
local registry = require("registry")
local uuid = require("uuid")
local security = require("security")
local policy = require("policy")
local masks = require("masks")
local projection = require("projection")
local preview = require("preview")
local timing = require("timing")
local stream = require("stream")
local consts = require("consts")
local capabilities = require("capabilities")
local session_messages = require("session_messages")
local session_repo = require("session_repo")
local message_repo = require("message_repo")
local upstream = require("upstream")
local gate = require("gate")
local get_session = require("get_session")
local time = require("time")
local fx = require("gate_fixtures")
local message_handlers = require("message_handlers")
local control_handlers = require("control_handlers")

local wait_for_boot = require("wait_for_boot")

local NULL = json.null
local fixtures = (registry.get("app.details:fixtures").data or {}).fixtures
local function fixture(name: string): any
    -- json.decode maps object nulls to nil. Preserve them while loading the
    -- golden wire object, so omitted required nulls fail the comparison too.
    local raw = fixtures[name .. ".json"]
    local marker = "__call_details_fixture_null__"
    assert(not raw:find(marker, 1, true))
    local out, index, quoted, escaped = {}, 1, false, false
    while index <= #raw do
        local char = raw:sub(index, index)
        if not quoted and raw:sub(index, index + 3) == "null" then
            out[#out + 1] = '"' .. marker .. '"'
            index = index + 4
        else
            out[#out + 1] = char
            if quoted then
                if escaped then escaped = false
                elseif char == string.char(92) then escaped = true
                elseif char == '"' then quoted = false end
            elseif char == '"' then quoted = true end
            index = index + 1
        end
    end
    local function restore(value: any): any
        if value == marker then return NULL end
        if type(value) == "table" then
            for key, child in pairs(value) do value[key] = restore(child) end
        end
        return value
    end
    local value = restore(assert(json.decode(table.concat(out))))
    value._case = nil
    return value
end

local function equal(actual: any, expected: any, path: string?)
    path = path or ""
    if actual == NULL or expected == NULL then test.eq(actual == NULL, expected == NULL, path); return end
    test.eq(type(actual), type(expected), path)
    if type(expected) ~= "table" then test.eq(actual, expected, path); return end
    for key, value in pairs(expected) do equal(actual[key], value, path .. "/" .. tostring(key)) end
    for key in pairs(actual) do test.eq(expected[key] ~= nil, true, path .. "/" .. tostring(key) .. " unexpected") end
end

local function tool(): any
    return { meta = {
        input_schema = { type = "object", properties = { api_key = { writeOnly = true } } },
        display = { sensitive = { result = { "/access_token" } } },
    } }
end

local function stored(name: string, expected: any): (any, any)
    local args = { api_key = "SECRET-ARGUMENT", invoice_id = "inv_42" }
    if name == "call_invalid_arguments" then args.invoice_id = 42 end
    local meta = {
        call_id = "call_invoice_42", function_name = "lookup_invoice",
        registry_id = "app.tools:lookup_invoice", agent_id = "app.agents:billing",
        status = "success", duration_ms = 2100,
        result = { access_token = "SECRET-RESULT", invoice_id = "inv_42", status = "paid" },
        thinking_blocks = { { signature = "SECRET-SIGNATURE" } }, reasoning_details = "INTERNAL",
        provider_metadata = "INTERNAL", control_operations = "INTERNAL",
        prefix_fingerprint = "INTERNAL", checkpoint_summary = "INTERNAL", unknown_future_internal = "INTERNAL",
    }
    local config = { details_revision = 4, call_details = {} }
    for _, part in ipairs(policy.PARTS) do config.call_details[part] = expected.details[part].level end
    if name:find("not_approved") or name == "call_pending_approval_none" then
        meta.function_name, meta.registry_id = "delete_invoice", "app.tools:delete_invoice"
        meta.approval = masks.copy(expected.metadata.approval)
        meta.approval.display.arguments = { api_key = "LEAK", invoice_id = "OLD" }
        meta.approval.display.summary = "LEAK"
        meta.approval.display.unknown_internal = "INTERNAL"
        meta.approval.display.batch_peers = { "private_peer", "archive_invoice" }
        meta.status, meta.outcome, meta.duration_ms = "error", "not_approved", nil
        meta.result = "Not run: you denied this call."
    end
    if name == "call_pending_approval_none" or name == "call_running" or name == "function_call" then
        meta.status, meta.outcome, meta.result, meta.duration_ms = "pending", nil, nil, nil
    end
    if name == "call_error_full" or name == "call_error_summary" or name == "function_error" then
        meta.status, meta.result = "error", "Invoice service timed out."
    end
    if name == "call_result_full_error_none" or name == "function_error_none" then
        meta.status, meta.result = "error", "SECRET-FAILURE"
    end
    if name == "call_cancelled" then
        meta.status, meta.result, meta.duration_ms = "cancelled", "Session stopped while the call was running.", 400
    end
    if name == "call_invalid_arguments" then
        meta.status, meta.outcome, meta.result, meta.duration_ms = "error", "invalid_arguments",
            "Invalid arguments: invoice_id must be a string.", nil
    end
    if name == "call_unknown" then
        meta.status, meta.outcome, meta.result, meta.duration_ms = "error", "unknown", nil, nil
    end
    if name == "call_result_empty" then meta.result = "" end
    if name == "call_result_missing" then meta.result = nil end
    if name == "call_result_null" then meta.result = NULL end
    if name == "call_result_cut_8kb" then
        meta.result = {}
        for index = 1, 200 do
            local digits = string.format("%04d", index)
            meta.result[index] = { invoice_id = "inv_" .. digits,
                description = "Invoice " .. digits .. " for account review and payment reconciliation.", status = "paid" }
        end
    end
    meta.details = policy.stamp(config, meta.agent_id, meta.registry_id, args)
    if name == "call_legacy_no_stamp" then config.call_details = {}; meta.details = nil end
    return { message_id = expected.message_id, session_id = expected.session_id,
        type = "function", date = "2026-11-25T10:15:00Z", data = json.encode(args), metadata = meta }, config
end

local function define_tests()
    describe("P1 call details", function()
        local original = {}
        test.before_all(function() wait_for_boot.run() end)
        test.before_each(function()
            original.app, original.agent, original.tool = policy._app, policy._agent, policy._tool
            policy._app = function() return "full" end
            policy._agent = function() return {} end
            policy._tool = tool
        end)
        test.after_each(function()
            policy._app, policy._agent, policy._tool = original.app, original.agent, original.tool
            timing._now = nil
            fx.cleanup()
        end)

        for name in pairs(fixtures) do
            local stem = name:gsub("%.json$", "")
            if stem:sub(1, 5) == "call_" then
                it("projects fixture " .. stem, function()
                    local expected = fixture(stem)
                    local row, config = stored(stem, expected)
                    equal(projection.row(row, config), expected)
                    test.not_nil(row.metadata.unknown_future_internal, "storage remains unchanged")
                end)
            elseif stem == "function_call" or stem == "function_success" or stem == "function_error" or stem == "function_error_none" then
                it("projects fixture " .. stem, function()
                    local expected = fixture(stem)
                    local row, config = stored(stem, expected)
                    equal(projection.event(expected.type, row, config), expected)
                end)
            end
        end


        it("settles undecodable arguments before dispatch at every error level", function()
            for _, level in ipairs({ "none", "summary", "full" }) do
                for _, signalled in ipairs({ false, true }) do
                    local ctx = fx.new_ctx({ protected = false })
                    ctx.config.call_details = { error = level }
                    local raw = '{"n":SECRET-BROKEN'
                    local op = fx.round(ctx, { { id = "broken", registry_id = fx.PLAIN,
                        stored_args = raw, raw_args = raw } })
                    if signalled then
                        op.tool_calls[1].arguments_error = "invalid JSON"
                        op.validated_tools.broken.valid = false
                        op.validated_tools.broken.error = "Failed to parse arguments: invalid JSON"
                    end
                    local result, err = message_handlers.process_tools(ctx, op)
                    test.is_nil(err)
                    test.is_true(fx.has_continue(result), "the model can repair its call")
                    test.eq(fx.launches(op.caller), 0)
                    local row = fx.row(op.call_message_ids.broken)
                    test.eq(row.metadata.status, "error")
                    test.eq(row.metadata.outcome, "invalid_arguments")
                    test.is_nil(row.metadata.duration_ms)
                    local rest = projection.row(row, ctx.config)
                    local live = projection.event("function_error", row, ctx.config)
                    for _, value in ipairs({ rest, live }) do
                        test.eq(value.details.arguments.availability, "not_captured")
                        test.eq(value.details.timing.availability, "not_captured")
                        test.is_nil((json.encode(value):find("SECRET-BROKEN", 1, true)))
                    end
                    test.eq(rest.metadata.outcome, "invalid_arguments")
                    test.eq(live.outcome, "invalid_arguments")
                    if level == "none" then test.is_nil(live.error)
                    elseif level == "summary" then test.eq(live.error, "The tool failed")
                    else test.contains(live.error, "Failed to parse arguments:") end
                    test.contains(row.metadata.result, "Failed to parse arguments:")
                end
            end
        end)

        it("masks structured executor errors without flattening their fields", function()
            policy._tool = function() return { meta = { display = { sensitive = { result = { "/message" } } } } } end
            for _, level in ipairs({ "none", "summary", "full" }) do
                local ctx = fx.new_ctx({ protected = false })
                ctx.config.call_details = { error = level, result = "full" }
                local op = fx.round(ctx, { { id = "failed", registry_id = fx.PLAIN } })
                op.caller.execute = function(_, _, tools)
                    return { failed = { error = { message = "SECRET-FAILURE", code = "safe" }, tool_call = tools.failed } }
                end
                local _, err = message_handlers.process_tools(ctx, op)
                test.is_nil(err)
                local row = fx.row(op.call_message_ids.failed)
                test.eq(type(row.metadata.result), "table")
                test.eq(row.metadata.result.message, "SECRET-FAILURE", "replay keeps the original")
                local rest, live = projection.row(row, ctx.config), projection.event("function_error", row, ctx.config)
                test.is_nil((json.encode({ rest, live }):find("SECRET-FAILURE", 1, true)))
                if level == "full" then
                    test.eq(rest.metadata.result.message, masks.HIDDEN)
                    test.eq(rest.details.error.preview.value.message, masks.HIDDEN)
                    test.eq(assert(json.decode(live.error)).message, masks.HIDDEN)
                elseif level == "summary" then test.eq(live.error, "The tool failed")
                else test.is_nil(live.error) end
            end
        end)

        it("strips checkpoint fields from every row type and latest message", function()
            local internal = { checkpoint_summary = "SECRET-CHECKPOINT", checkpoint_reason = "SECRET-CHECKPOINT",
                checkpoint_id = "SECRET-CHECKPOINT", checkpoint_tokens = 42, checkpoint_source = "SECRET-CHECKPOINT",
                checkpoint_binding_metadata = { secret = "SECRET-CHECKPOINT" }, checkpoint_binding_errors = { "SECRET-CHECKPOINT" },
                trigger_tokens = 42, checkpoint_generated_at = "SECRET-CHECKPOINT", provider_metadata = "SECRET-CHECKPOINT" }
            for _, kind in ipairs({ "user", "system", "artifact", "form", "developer", "model_change", "agent_change", "unknown", "assistant", "function", "delegation" }) do
                local row = { type = kind, data = "{}", metadata = masks.copy(internal) }
                row.metadata.file_uuids = { "file" }
                row.metadata.context_attachments = { { kind = "wippy.attention", version = 1 } }
                row.metadata.input = { mode = "steering" }
                row.metadata.session_form = { pending = true }
                row.metadata.system_action, row.metadata.to_model = "model_change", "model"
                local projected = projection.row(row, {})
                for key in pairs(internal) do test.is_nil(projected.metadata[key], kind .. ":" .. key) end
                if kind == "user" then
                    test.eq(projected.metadata.file_uuids[1], "file")
                    test.eq(projected.metadata.context_attachments[1].kind, "wippy.attention")
                    test.eq(projected.metadata.input.mode, "steering")
                    test.eq(projected.metadata.session_form.pending, true)
                elseif kind == "system" then test.eq(projected.metadata.to_model, "model") end
                local latest = projection.history_summary({ list_by_session = function()
                    return { messages = { row }, has_more = false }
                end }, "session", {})
                test.is_nil((json.encode(latest):find("SECRET-CHECKPOINT", 1, true)))
                test.eq(row.metadata.checkpoint_summary, "SECRET-CHECKPOINT", "storage is unchanged")
            end
        end)

        it("keeps public batch peers with generated names and no llm_alias", function()
            local entry = registry.get("app.details:archive-invoice-generated")
            test.is_nil(entry.meta.llm_alias)
            test.is_true(policy.public_name("archive_invoice_generated"))
            local row, config = stored("call_not_approved_full", fixture("call_not_approved_full"))
            row.metadata.approval.display.batch_peers = { "archive_invoice_generated" }
            equal(projection.rows({ row }, config)[1].metadata.approval.display.batch_peers, { "archive_invoice_generated" })
        end)

        it("drops private batch peers with generated names and no llm_alias", function()
            local entry = registry.get("app.details:private-peer-generated")
            test.is_nil(entry.meta.llm_alias)
            test.is_true(policy.private_name("private_peer_generated"))
            test.is_false(policy.public_name("private_peer_generated"))
            local row, config = stored("call_not_approved_full", fixture("call_not_approved_full"))
            row.metadata.approval.display.batch_peers = { "private_peer_generated" }
            equal(projection.rows({ row }, config)[1].metadata.approval.display.batch_peers, {})
        end)

        it("keeps only known public batch peers on pages without private rows", function()
            local row, config = stored("call_not_approved_full", fixture("call_not_approved_full"))
            row.metadata.approval.display.batch_peers = { "removed_private_tool", "private_peer", "archive_invoice" }
            local page = projection.rows({ row }, config)
            equal(page[1].metadata.approval.display.batch_peers, { "archive_invoice" })
            test.is_nil((json.encode(page):find("removed_private_tool", 1, true)))
        end)

        it("keeps registry restrictions after control replaces active traits with an empty list", function()
            policy._agent = nil
            local ctx: any = {
                config = { agent_id = "app.details:restricted_agent", active_traits = {} },
                agent_ctx = {
                    set_active_traits = function() return true end,
                    get_current_agent = function() return { id = "app.details:restricted_agent" } end,
                },
                reader = { state = function() return { config = {} } end, reset = function() return true end },
                writer = { update_meta = function() return true end },
            }
            test.eq(policy.stamp(ctx.config, ctx.config.agent_id, "tool", {}).arguments, "none")
            local result, err = control_handlers.control_config(ctx, { config_changes = { traits = {} } })
            test.is_nil(err)
            test.eq(result.completed, true)
            test.eq(#ctx.config.active_traits, 0)
            local stamp = policy.stamp(ctx.config, ctx.config.agent_id, "tool", {})
            for _, part in ipairs(policy.PARTS) do test.eq(stamp[part], "none", part) end
        end)

        it("allows active traits only to lower the registry ceiling", function()
            policy._agent = function() return {} end
            local traits = { { id = policy.TRAIT_ID, context = { result = "none" } } }
            test.eq(policy.stamp({ active_traits = traits }, "agent", "tool", {}).result, "none")
        end)

        it("masks map schemas and fails closed for unsupported marked applicators at every projection", function()
            local cases = {
                { schema = { properties = { credentials = { additionalProperties = {
                    properties = { token = { writeOnly = true } } } } } }, valid = true },
                { schema = { properties = { credentials = { patternProperties = {
                    ["^account"] = { properties = { token = { writeOnly = true } } } } } } }, valid = false },
            }
            for _, keyword in ipairs({ "if", "then", "else", "dependentSchemas", "unevaluatedProperties", "not", "contains", "propertyNames", "unevaluatedItems" }) do
                cases[#cases + 1] = { schema = { [keyword] = { properties = { token = { writeOnly = true } } } }, valid = false }
            end
            for _, case in ipairs(cases) do
                local args = { credentials = { account = { token = "SECRET-MAP", name = "visible" } } }
                policy._tool = function() return { meta = { input_schema = case.schema } } end
                local paths, valid = masks.schema(case.schema, args)
                test.eq(valid, case.valid)
                if valid then equal(paths, { "/credentials/account/token" }) end
                local expected = fixture("call_pending_approval_none")
                local row, config = stored("call_pending_approval_none", expected)
                config.call_details = { arguments = "full", result = "full", error = "full", timing = "full" }
                row.data = json.encode(args)
                row.metadata.details = policy.stamp(config, row.metadata.agent_id, row.metadata.registry_id, args)
                local rest = projection.row(row, config)
                local live = projection.event("function_call", row, config)
                for _, projected in ipairs({ rest, live }) do
                    test.is_nil((json.encode(projected):find("SECRET-MAP", 1, true)))
                    test.eq(projected.details.arguments.level, valid and "full" or "none")
                end
                test.is_nil((json.encode(rest.metadata.approval.display):find("SECRET-MAP", 1, true)))
                if valid then
                    test.eq(assert(json.decode(rest.data)).credentials.account.token, masks.HIDDEN)
                    test.eq(rest.metadata.approval.display.arguments.credentials.account.token, masks.HIDDEN)
                else
                    test.eq(rest.metadata.approval.display.arguments, masks.HIDDEN)
                end
            end
        end)

        it("resolves every four-layer combination for every part", function()
            local levels = { "none", "summary", "full" }
            for _, part in ipairs(policy.PARTS) do
                for a, app in ipairs(levels) do for b, agent in ipairs(levels) do
                    for c, display in ipairs(levels) do for d, session in ipairs(levels) do
                        local out = policy.resolve(app, { [part] = agent }, { [part] = display }, { [part] = session }, "tool")
                        test.eq(out[part], levels[math.min(a, b, c, d)])
                    end end
                end end
            end
        end)

        it("reads invalid values restrictively and supports app booleans", function()
            for _, value in ipairs({ "FULL", "invalid", 3, {}, "" }) do test.eq(consts.normalize_tool_details(value), "none") end
            test.eq(consts.normalize_tool_details(nil), "none")
            for _, value in ipairs({ true, "true" }) do test.eq(consts.normalize_tool_details(value), "full") end
            for _, value in ipairs({ false, "false" }) do test.eq(consts.normalize_tool_details(value), "none") end
            test.eq(policy.resolve("full", false, {}, {}, "tool").result, "none")
            test.eq(policy.resolve("full", {}, { result = "bad" }, {}, "tool").result, "none")
            test.eq(policy.resolve("full", {}, {}, { result = false }, "tool").result, "none")
            test.eq(policy.trait({ { id = policy.TRAIT_ID, context = { result = "bad" } } }), false)
            test.eq(policy.resolve("full", { tools = { tool = { arguments = "summary" } } }, {}, {}, "tool").arguments, "summary")
        end)

        it("keeps the write-time ceiling when the app rises", function()
            local row, config = stored("call_success_full_masked", fixture("call_success_full_masked"))
            row.metadata.details.arguments = "none"
            test.eq(projection.row(row, config).data, NULL)
            for _, stamp in ipairs({ {}, { v = 2 }, { v = 1, arguments = "full" } }) do
                row.metadata.details = stamp
                test.eq(projection.row(row, config).data, NULL)
            end
        end)

        it("keeps saved masks after the schema mark is removed", function()
            local row, config = stored("call_success_full_masked", fixture("call_success_full_masked"))
            policy._tool = function() return {} end
            local out = projection.row(row, config)
            test.is_nil(((json.encode(out) or ""):find("SECRET", 1, true)))
            test.eq(assert(json.decode(out.data)).api_key, masks.HIDDEN)
        end)

        it("masks nested schema arrays and JSON Pointer escapes before every preview", function()
            local value = { rows = { { password = "secret" }, { password = "secret2" } }, ["a/b~c"] = false }
            local paths, valid = masks.schema({ properties = { rows = { items = { properties = { password = { writeOnly = true } } } } } }, value)
            test.eq(valid, true)
            paths = masks.union(paths, { "/a~1b~0c" })
            local out, matched = masks.apply(value, paths)
            equal(matched, { "/a~1b~0c", "/rows/0/password", "/rows/1/password" })
            test.eq(out.rows[2].password, masks.HIDDEN)
            test.eq(out["a/b~c"], masks.HIDDEN)
            test.eq(value.rows[1].password, "secret")
            test.eq(masks.apply(value, { "" }), masks.HIDDEN)
            test.eq(masks.valid({ "/bad~2escape" }), false)
            test.eq(masks.valid({ [2] = "/x" }), false)
            local built = preview.build({ secret = string.rep("x", 20000) }, { "/secret" })
            test.eq(built.arguments.secret, masks.HIDDEN)
            test.eq(#built.cut, 0)
        end)

        it("preserves and masks captured JSON null members", function()
            local value = assert(masks.decode('{"password":null,"nested":[null,{"token":null}]}'))
            local masked, matched = masks.apply(value, { "/password", "/nested/1/token" })
            equal(matched, { "/nested/1/token", "/password" })
            test.eq(masked.password, masks.HIDDEN)
            test.eq(masked.nested[2].token, masks.HIDDEN)
            test.eq(masked.nested[1], NULL)
            test.contains(json.encode(masked), "null")
            test.eq(masks.decode('"null"'), "null")
        end)

        it("drops provider internals and unknown metadata aliases", function()
            local row, config = stored("call_success_full_masked", fixture("call_success_full_masked"))
            row.metadata_json = json.encode(row.metadata)
            row.raw_metadata = row.metadata_json
            local call = projection.row(row, config)
            for _, key in ipairs({ "details", "thinking_blocks", "signatures", "reasoning_details", "provider_metadata",
                "control_operations", "prefix_fingerprint", "checkpoint_summary", "unknown_future_internal" }) do
                test.is_nil(call.metadata[key], key)
            end
            test.is_nil(call.metadata_json)
            test.is_nil(call.raw_metadata)
            local assistant = projection.row({ type = "assistant", data = "answer", metadata = row.metadata }, config)
            test.is_nil(assistant.metadata.unknown_future_internal)
            local other = projection.row({ type = "user", data = "question", metadata = { context_attachments = { "keep" } } }, config)
            equal(other.metadata.context_attachments, { "keep" })
        end)

        it("never copies failure text through result full when error is none", function()
            local row, config = stored("call_result_full_error_none", fixture("call_result_full_error_none"))
            local out = projection.row(row, config)
            test.is_nil((json.encode(out):find("SECRET%-FAILURE")))
            test.is_nil((json.encode(projection.event("function_error", row, config)):find("SECRET%-FAILURE")))
        end)

        it("omits decided arguments but rebuilds the summary", function()
            local row, config = stored("call_not_approved_summary", fixture("call_not_approved_summary"))
            local display = projection.row(row, config).metadata.approval.display
            test.not_nil(display.summary)
            test.is_nil(display.arguments)
            test.is_nil(display.cut)
            test.is_nil(display.numbers)
            test.is_nil(display.unknown_internal)
        end)

        it("filters private rows events and every batch peer name", function()
            policy._tool = function(id) if id == "private" then return { meta = { private = true } } end; return tool() end
            local row, config = stored("call_not_approved_summary", fixture("call_not_approved_summary"))
            local private = { type = "private_function", message_id = "private-row", data = "secret", metadata = { function_name = "private_peer", registry_id = "private" } }
            test.eq(#projection.rows({ private }, config), 0)
            test.is_nil(projection.event("function_call", private, config))
            local visible = projection.rows({ private, row }, config)
            test.eq(#visible, 1)
            equal(visible[1].metadata.approval.display.batch_peers, { "archive_invoice" })
            private.metadata.approval = masks.copy(row.metadata.approval)
            test.not_nil(projection.row(private, config), "own approval stays")
            test.is_nil(projection.event("function_error", private, config))
        end)

        it("removes private peers when the approval gate builds a public card", function()
            local public = { name = "public", row_type = "function", frozen = {
                args = { api_key = "secret", invoice_id = "inv_42" },
                identity = { registry_id = "public" }, title = "Public", description = "",
            } }
            local private = { name = "private_peer", row_type = "private_function" }
            local other = { name = "other_public", row_type = "function" }
            equal(gate.display_for(public, { public, private, other }, "Agent").batch_peers, { "other_public" })
        end)

        it("removes private references from saved bulk approval scopes and offers", function()
            policy._tool = function(id)
                if id == "private" then return { meta = { private = true } } end
                return tool()
            end
            local row, config = stored("call_pending_approval_none", fixture("call_pending_approval_none"))
            row.metadata.approval.offered = { decisions = { "approve", "approve_all", "deny" },
                approve_all = { scope = "session", covers = { "public-approval", "private-approval" } } }
            row.metadata.approval.display.approve_all_scope = { scope = "session", covered_count = 2,
                tools = { { registry_id = "private", title = "private_peer" } },
                covered = { { approval_id = "private-approval", title = "private_peer" } } }
            local public = projection.row(row, config)
            test.is_nil(public.metadata.approval.display.approve_all_scope)
            test.eq(public.metadata.approval.offered.approve_all, NULL)
            equal(public.metadata.approval.offered.decisions, { "approve", "deny" })
            test.is_nil((json.encode(public):find("private-approval", 1, true)))
            test.is_nil((json.encode(public):find("private_peer", 1, true)))
        end)

        it("never offers a bulk decision that would disclose a private tool", function()
            policy._tool = function(id)
                if id == fx.PRIVATE then return { meta = { private = true } } end
                return tool()
            end
            local ctx = fx.new_ctx({ live = 1, policy = { require = "all", approve_all = "session" } })
            local op, batch = fx.round(ctx, {
                { id = "public", registry_id = fx.MARKED, args = { customer_id = "c_1" } },
                { id = "private", registry_id = fx.PRIVATE, type = consts.MSG_TYPE.PRIVATE_FUNCTION, args = {} },
            })
            local handle = fx.start(ctx, op)
            local checked, failure = pcall(function()
                fx.pending(ctx, batch.batch_id, 2)
                local records = fx.records_by_call(ctx.session_id, batch.batch_id)
                test.not_nil(records.private, "the private call keeps its own approval card")
                for _, record in pairs(records) do
                    test.is_nil(record.offered.approve_all)
                    test.is_nil(record.display.approve_all_scope)
                    equal(record.offered.decisions, { "approve", "deny" })
                end
            end)
            fx.stop(ctx)
            local _, err = fx.finish(handle)
            test.is_nil(err)
            assert(checked, failure)
        end)

        it("hides invalid sensitive definitions even in a pending approval", function()
            local row, config = stored("call_pending_approval_none", fixture("call_pending_approval_none"))
            policy._tool = function() return { meta = { display = { sensitive = { arguments = { "/bad~2" } } } } } end
            local out = projection.row(row, config)
            test.eq(out.metadata.approval.display.arguments, masks.HIDDEN)
            test.is_nil((json.encode(out):find("SECRET", 1, true)))
        end)

        it("bounds previews to 8192 bytes and records cuts", function()
            local value = {}
            for index = 1, 1000 do value[index] = string.rep("word ", 100) end
            local built = preview.build(value)
            test.is_true(#json.encode(built.arguments) <= 8192)
            test.is_true(#built.cut > 0)
        end)

        it("filters the real history HTTP boundary and disables caching", function()
            local old_http, old_security, old_sessions, old_messages =
                session_messages._http, session_messages._security, session_messages._session_repo, session_messages._message_repo
            local row, config = stored("call_success_full_masked", fixture("call_success_full_masked"))
            local private = { type = "private_function", message_id = "private", data = "SECRET", metadata = {} }
            local body: any = nil
            local headers = {}
            session_messages._http = {
                request = function() return { query = function(_, key) if key == "session_id" then return row.session_id end; return nil end } end,
                response = function() return {
                    set_header = function(_, key, value) headers[key] = value end,
                    set_status = function() end, set_content_type = function() end,
                    write_json = function(_, value) body = value end,
                } end,
            }
            session_messages._security = { actor = function() return { id = function() return "owner" end } end }
            session_messages._session_repo = { get = function() return { user_id = "owner", config = config } end }
            session_messages._message_repo = {
                list_by_session = function() return { messages = { row, private }, has_more = false } end,
                list_pending_inputs = function() return {} end,
            }
            local ok, err = pcall(session_messages.handler)
            session_messages._http, session_messages._security, session_messages._session_repo, session_messages._message_repo =
                old_http, old_security, old_sessions, old_messages
            test.eq(ok, true, tostring(err))
            test.eq(headers["Cache-Control"], "no-store")
            test.eq(body.details_revision, 4)
            test.eq(#body.messages, 1)
            test.is_nil((json.encode(body):find("SECRET", 1, true)))
            test.is_nil(body.messages[1].metadata.details)
        end)

        it("projects capabilities_phase1 and session_read P1 fields", function()
            local expected = fixture("capabilities_phase1").capabilities
            local original_consts = capabilities._consts
            capabilities._consts = { session_show_tool_details = function() return "full" end }
            local actual = capabilities.describe()
            capabilities._consts = original_consts
            actual.attention = nil
            equal(actual, expected)
            local session = fixture("session_read").session
            session.details.thinking = nil
            local wanted = masks.copy(session)
            session.details, session.details_revision = nil, nil
            session.config = { details_revision = 4, call_details = wanted.details }
            projection.session(session)
            session.config = nil
            equal(session, wanted)
        end)

        it("projects persisted function events and latest_message at their public boundaries", function()
            local session_id, context_id = uuid.v7(), uuid.v7()
            local actor = assert(security.actor())
            local contexts = require("context_repo")
            assert(contexts.create(context_id, "primary", "details boundary"))
            local config = { details_revision = 4, call_details = { error = "none" } }
            assert(session_repo.create(session_id, actor:id(), context_id, "details", "default", {}, config))
            local row = stored("call_error_full", fixture("call_error_full"))
            row.session_id, row.message_id = session_id, uuid.v7()
            assert(message_repo.create(row.message_id, session_id, row.type, row.data, row.metadata))
            local private_id = uuid.v7()
            assert(message_repo.create(private_id, session_id, "private_function", "SECRET-PRIVATE",
                { call_id = "private-call", function_name = "private_peer" }))
            local sender = upstream.new(session_id)
            local sent = {}
            sender._send_message = function(_, _, value) sent[#sent + 1] = value; return true end
            sender:send_message_update("call_invoice_42", "function_error", { message_id = row.message_id, error = "RAW-FAILURE" })
            sender:send_message_update("private-call", "function_error", { message_id = private_id, function_name = "private_peer", error = "PRIVATE" })
            test.eq(#sent, 1)
            test.is_nil(sent[1].error)
            test.eq(sent[1].details.error.level, "none")
            test.is_nil((json.encode(sent):find("RAW%-FAILURE")))
            local original_http, original_security = get_session._http, get_session._security
            local body, headers
            headers = {}
            get_session._http = {
                request = function() return { query = function() return session_id end } end,
                response = function() return {
                    set_header = function(_, key, value) headers[key] = value end,
                    set_status = function() end, set_content_type = function() end,
                    write_json = function(_, value) body = value end,
                } end,
            }
            get_session._security = { actor = function() return actor end }
            local ok, err = pcall(get_session.handler)
            local call_body = body
            local anchor_id = uuid.v7()
            assert(message_repo.create(anchor_id, session_id, "user", "Visible request", {
                checkpoint_summary = "SECRET-CHECKPOINT", checkpoint_binding_metadata = { private = "SECRET-CHECKPOINT" },
                file_uuids = { "file" }, input = { state = "applied" },
            }))
            local anchor_ok, anchor_err = pcall(get_session.handler)
            local anchor_body = body
            body = call_body
            get_session._http, get_session._security = original_http, original_security
            assert(session_repo.delete(session_id))
            assert(contexts.delete(context_id))
            test.eq(ok, true, tostring(err))
            test.eq(anchor_ok, true, tostring(anchor_err))
            test.eq(anchor_body.latest_message.message_id, anchor_id)
            test.eq(anchor_body.latest_message.metadata.file_uuids[1], "file")
            test.eq(anchor_body.latest_message.metadata.input.state, "applied")
            test.is_nil((json.encode(anchor_body):find("SECRET-CHECKPOINT", 1, true)))
            test.eq(headers["Cache-Control"], "no-store")
            test.eq(body.message_count, 1)
            test.eq(body.latest_message.message_id, row.message_id)
            test.eq(body.details_revision, 4)
            test.eq(body.session.details.error, "none")
            test.is_nil((json.encode(body):find("SECRET%-PRIVATE")))
            test.is_nil(body.latest_message.metadata.provider_metadata)
        end)

        it("saves larger revisions and emits update_details_revision from trusted config", function()
            local session_id = uuid.v7()
            local actor = assert(security.actor())
            local context_id = uuid.v7()
            assert(require("context_repo").create(context_id, "primary", "details test"))
            assert(session_repo.create(session_id, actor:id(), context_id, "details", "default", {}, {}))
            local update = assert(session_repo.update_session_meta(session_id, { config = { call_details = { arguments = "none" } } }))
            test.eq(update.details_revision, 1)
            local same = assert(session_repo.update_session_meta(session_id, { config = { call_details = { arguments = "none" }, details_revision = 900 } }))
            test.eq(same.details_revision, 1)
            local changed = assert(session_repo.update_session_meta(session_id, { config = { call_details = { arguments = "summary" } } }))
            test.eq(changed.details_revision, 2)
            local sender = upstream.new(session_id)
            local sent
            sender._send_message = function(_, _, value) sent = value; return true end
            sender:update_session({ details_revision = 5 })
            local expected = fixture("update_details_revision")
            sent.session_id = expected.session_id
            equal(sent, expected)
            assert(session_repo.delete(session_id))
            assert(require("context_repo").delete(context_id))
        end)

        it("measures dispatch to each result without approval wait or sibling delay", function()
            local clock = 10000
            timing._now = function() return clock end
            local context
            local executor = {}
            function executor:with_context(value) context = value; return self end
            function executor:async(_id: any, _args: any) return {} end
            local caller: any = { executor = executor, set_result_listener = function(self, listener) self.result_listener = listener end }
            clock = 50000 -- An approval wait before attaching is not execution.
            local durations, restore = timing.attach(caller)
            caller.executor:with_context({ call_id = "a" }):async("tool", {})
            clock = 50200
            caller.executor:with_context({ call_id = "b" }):async("tool", {})
            clock = 50300
            caller.result_listener("a", {})
            clock = 50900
            caller.result_listener("b", {})
            test.eq(durations.a, 300)
            test.eq(durations.b, 700)
            test.is_nil(durations.not_dispatched)
            restore()
            test.eq(caller.executor, executor)
        end)

        it("stamps durable calls and their results while retaining originals for replay", function()
            local ctx = fx.new_ctx({ protected = false })
            local op = fx.round(ctx, { { id = "durable", registry_id = fx.PLAIN,
                args = { api_key = "SECRET-ARGUMENT", invoice_id = "inv_42" } } })
            local row_id = op.call_message_ids.durable
            local initial = fx.row(row_id)
            test.eq(initial.metadata.details.arguments, "full")
            equal(initial.metadata.details.masks.arguments, { "/api_key" })
            test.eq(assert(json.decode(initial.data)).api_key, "SECRET-ARGUMENT")
            local clock = 1000
            timing._now = function() return clock end
            local caller = op.caller
            caller.executor = {
                with_context = function(self) return self end,
                async = function() return {} end,
            }
            caller.set_result_listener = function(self, listener) self.result_listener = listener end
            caller.execute = function(self, _, tools)
                local executed = tools.durable
                self.executor:with_context({ call_id = "durable" }):async(executed.registry_id, executed.args)
                clock = 1300
                policy._tool = function()
                    local entry = tool()
                    entry.meta.display.result = "summary"
                    return entry
                end
                local result = { result = { access_token = "SECRET-RESULT", status = "paid" }, tool_call = executed }
                self.result_listener("durable", result)
                return { durable = result }
            end
            local _, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            local settled = fx.row(row_id)
            test.eq(settled.metadata.details.result, "summary")
            test.eq(settled.metadata.duration_ms, 300)
            test.eq(settled.metadata.result.access_token, "SECRET-RESULT")
            policy._tool = function() return {} end
            local public = projection.row(settled, {})
            test.eq(public.details.result.level, "summary")
            test.is_nil((json.encode(public):find("SECRET", 1, true)))
        end)

        it("refuses model changes to call details and its revision before reading session state", function()
            for _, changes in ipairs({ { call_details = { result = "full" } }, { details_revision = 50 } }) do
                local result, err = control_handlers.control_config({}, { config_changes = changes })
                test.is_nil(err)
                test.eq(result.completed, true)
                test.contains(result.rejected, "call_details_forbidden")
            end
        end)

        it("drops tool and thinking stream chunks and strips future content internals", function()
            test.is_nil(stream.project({ type = "tool_call", name = "private", arguments = "SECRET" }))
            test.is_nil(stream.project({ type = "thinking", content = "SECRET", thinking_blocks = {} }))
            equal(stream.project({ type = "chunk", content = "answer", provider_metadata = "SECRET" }), { type = "chunk", content = "answer" })
            equal(stream.project({ type = "done", meta = { thinking_blocks = "SECRET" } }), { type = "done" })
        end)

        it("forwards answer chunks live through the Session listener in order and drains on close", function()
            local topic = "details.test." .. uuid.v7()
            local received = assert(process.listen(topic))
            local target, close, err = stream.open({ reply_to = process.pid(), topic = topic }, uuid.v7())
            test.is_nil(err)
            test.eq(target.reply_to, (process.pid()))
            test.is_true(target.topic ~= topic)
            assert(process.send(target.reply_to, target.topic, { type = "tool_call", arguments = "SECRET" }))
            assert(process.send(target.reply_to, target.topic, { type = "thinking", text = "SECRET" }))
            assert(process.send(target.reply_to, target.topic, { type = "chunk", content = "first", provider_metadata = "SECRET" }))
            local live = channel.select({ received:case_receive(), time.after("2s"):case_receive() })
            assert(live.channel == received, "answer must arrive before closing the step")
            equal(live.value, { type = "chunk", content = "first" })
            assert(process.send(target.reply_to, target.topic, { type = "chunk", content = "second" }))
            assert(process.send(target.reply_to, target.topic, { type = "done", metadata = "SECRET" }))
            close()
            local remaining = {}
            while true do
                local next_chunk = channel.select({ received:case_receive(), default = true })
                if next_chunk.default then break end
                remaining[#remaining + 1] = next_chunk.value
            end
            process.unlisten(received)
            equal(remaining, { { type = "chunk", content = "second" }, { type = "done" } })
            local absent, no_close, no_err = stream.open(nil, uuid.v7())
            test.is_nil(absent)
            test.is_nil(no_err)
            no_close()
        end)
    end)
end

return test.run_cases(define_tests)
