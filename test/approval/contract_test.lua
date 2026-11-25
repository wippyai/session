local test = require("test")
local json = require("json")
local uuid = require("uuid")
local sql = require("sql")
local time = require("time")
local security = require("security")
local registry = require("registry")
local consts = require("consts")
local upstream = require("upstream")
local approval_events = require("approval_events")
local approval_commands = require("approval_commands")
local approval_repo = require("approval_repo")
local message_handlers = require("message_handlers")
local get_session = require("get_session")
local list_sessions = require("list_sessions")
local session_messages = require("session_messages")
local get_capabilities = require("get_capabilities")
local artifact_access = require("artifact_access")
local wait_for_boot = require("wait_for_boot")
local fx = require("gate_fixtures")

-- Contract tests (EE2-2710 AC 38): every event, reply and REST projection
-- the Session sends, as it leaves the Session, has exactly the keys of its
-- protocol fixture (docs/tool-approval-protocol.md, test/approval/fixtures).
-- Messages are captured from the real upstream (its _send_message), so the
-- envelope (type, session_id) is the one clients get.
--
-- Comparison, by dotted key path ("[]" for array items):
--   - no key the fixture does not have (extra), except under `opaque` paths
--     (model-provided arguments, stored row data) and outside `strict`
--     prefixes when given (a REST object the protocol only extends);
--   - every key of the fixture (missing), except a key whose fixture value
--     is null (the Session leaves a null field out), keys in `optional`,
--     and items of an array that is empty in the message.

local MARKED, GRANTED, PRIVATE = fx.MARKED, fx.GRANTED, fx.PRIVATE
local NULL = "<json null>"

-- Decodes JSON keeping object nulls as the marker NULL.
local function decode(raw: string): any
    local marked = raw:gsub(":%s*null(%s*[,}])", ': "<json null>"%1')
    return assert(json.decode(marked))
end

local function is_array(value: any): boolean
    return type(value) == "table" and #value > 0
end

-- { [path] = value } of every key path, and the set of paths that hold an
-- empty table.
local function paths_of(value: any): (any, any)
    local paths, empty = {}, {}
    local function walk(node: any, prefix: string)
        if type(node) ~= "table" then return end
        if next(node) == nil then
            empty[prefix] = true
            return
        end
        if is_array(node) then
            for _, item in ipairs(node) do
                local path = prefix .. ".[]"
                if paths[path] == nil then paths[path] = item end
                walk(item, path)
            end
            return
        end
        for key, item in pairs(node) do
            local path = prefix == "" and tostring(key) or (prefix .. "." .. tostring(key))
            paths[path] = item
            walk(item, path)
        end
    end
    walk(value, "")
    return paths, empty
end

local function under(path: string, prefix: string): boolean
    return path == prefix or path:sub(1, #prefix + 1) == prefix .. "."
end

local function under_any(path: string, prefixes: {string}?): boolean
    for _, prefix in ipairs(prefixes or {}) do
        if under(path, prefix) then return true end
    end
    return false
end

local function parent_of(path: string): string
    return path:match("^(.*)%.[^%.]+$") or ""
end

local function fixture(name: string): any
    local fixtures = assert(registry.get("app.approval:protocol_fixtures")).data.fixtures
    return decode(tostring(assert(fixtures[name], "fixture " .. name)))
end

-- The problems of `message` (a Lua value as the Session sends it) against
-- the fixture `name`. opts: { opaque, optional, strict }.
local function problems(message: any, name: string, opts: any?): {string}
    opts = opts or {}
    local sent_paths, sent_empty = paths_of(decode(json.encode(message)))
    local doc_paths = paths_of(fixture(name))
    local out = {}
    for path in pairs(sent_paths) do
        if doc_paths[path] == nil and not under_any(path, opts.opaque)
            and (opts.strict == nil or under_any(path, opts.strict)) then
            out[#out + 1] = "extra " .. path
        end
    end
    for path in pairs(doc_paths) do
        local null_above = false
        local cursor = path
        while cursor ~= "" do
            if doc_paths[cursor] == NULL then null_above = true end
            cursor = parent_of(cursor)
        end
        if sent_paths[path] == nil and not null_above and not under_any(path, opts.optional)
            and not under_any(path, opts.opaque) and not sent_empty[parent_of(path)] then
            out[#out + 1] = "missing " .. path
        end
    end
    table.sort(out)
    return out
end

local function check(message: any, name: string, opts: any?)
    test.not_nil(message, name .. ": the Session sent it")
    local found = problems(message, name, opts)
    test.eq(table.concat(found, "; "), "", name)
end

-- A process_tools context whose upstream is the real one, with the wire
-- messages captured.
local function wired_ctx(opts: any?): (any, {any})
    local ctx = fx.new_ctx(opts)
    local sent = {}
    local up = upstream.new(ctx.session_id, nil, "contract-parent")
    function up:_send_message(topic, message)
        sent[#sent + 1] = { topic = topic, message = message }
        return true
    end
    ctx.upstream = up
    return ctx, sent
end

local function find(sent: {any}, pred: any): any
    for _, item in ipairs(sent) do
        if pred(item.message) then return item.message end
    end
    return nil
end

local function find_last(sent: {any}, pred: any): any
    local found = nil
    for _, item in ipairs(sent) do
        if pred(item.message) then found = item.message end
    end
    return found
end

local function command(ctx: any, data: any): any
    local payload: any = { request_id = "req-" .. uuid.v7(), sender_user_id = ctx.user_id, conn_pid = "conn-1" }
    for key, value in pairs(data) do payload[key] = value end
    approval_commands.handle(ctx, fx.PLUGIN_PID, payload)
    return payload.request_id
end

local function decision(record: any, fields: any): any
    local data: any = { command = "tool_approval", approval_id = record.approval_id,
        intent_digest = record.intent_digest, expected_revision = record.revision }
    for key, value in pairs(fields) do data[key] = value end
    return data
end

local function reply_to(sent: {any}, request_id: string): any
    return find(sent, function(m) return m.request_id == request_id end)
end

local function rest(api: any, query: any, extra: any?): any
    local result: any = {}
    local saved = { http = api._http, security = api._security }
    api._http = {
        request = function() return { query = function(_, key) return query[key] end } end,
        response = function() return {
            set_header = function() end, set_content_type = function() end,
            set_status = function(_, value) result.status = value end,
            write_json = function(_, value) result.body = value end,
        } end,
    }
    api._security = { actor = function() return security.actor() end }
    local ok, err = pcall(api.handler)
    api._http, api._security = saved.http, saved.security
    if not ok then error(err) end
    return result.body
end

local function define_tests()
    describe("Tool approval contract: messages match the protocol document", function()
        before_all(function() wait_for_boot.run() end)
        after_all(function() fx.cleanup() end)

        it("matches the tool_approval events, function events and decision replies", function()
            -- A batch of two marked calls, Approve all batch offered.
            local ctx, sent = wired_ctx({ live = 1, policy = { approve_all = "batch" } })
            local op, batch = fx.round(ctx, {
                { id = "call-a", registry_id = MARKED, name = "delete_customer", args = { customer_id = "c_1", hard = true } },
                { id = "call-b", registry_id = MARKED, name = "delete_customer", args = { customer_id = "c_2" } },
            })
            local handle = fx.start(ctx, op)
            fx.pending(ctx, batch.batch_id, 2)
            local pending_event = find(sent, function(m)
                return m.type == "tool_approval" and m.call_id == "call-a" and m.approval.state == "pending"
            end)
            check(pending_event, "tool_approval_event_pending.json", { opaque = { "approval.display.arguments" } })
            local records = fx.records_by_call(ctx.session_id, batch.batch_id)
            check(find_last(sent, function(m) return m.type == "update" and m.activity ~= nil end),
                "session_update_activity.json", { optional = { "tool_approval" } })

            -- Approve the first; the second's competing decision is refused
            -- with the committed record; a stale digest is refused too.
            local approve_id = command(ctx, decision(records["call-a"], { decision = "approve" }))
            local approved = reply_to(sent, approve_id)
            -- A plain approval creates no grant; the Approve all case below
            -- checks the grant fields.
            check(approved, "command_response_decision.json",
                { optional = { "grant", "approval.grant_id", "approvals.[].grant_id" } })
            local late_id = command(ctx, decision(records["call-a"], { decision = "approve" }))
            check(reply_to(sent, late_id), "command_error_not_pending.json")
            local stale_id = command(ctx, decision(records["call-b"], { decision = "deny", ["then"] = "continue",
                reason = "Use the staging customer instead.", intent_digest = "sha256:" .. string.rep("0", 64) }))
            check(reply_to(sent, stale_id), "command_error_stale.json")
            command(ctx, decision(records["call-b"], { decision = "deny", ["then"] = "continue",
                reason = "Use the staging customer instead." }))
            fx.finish(handle)

            check(find(sent, function(m)
                return m.type == "tool_approval" and m.call_id == "call-a" and m.approval.state == "approved"
            end), "tool_approval_event_decided.json", { opaque = { "approval.display.arguments",
                -- This batch offered Approve all; the pending event checks it.
                "approval.offered", "approval.display.approve_all_scope", "approval.display.batch_peers" } })
            check(find(sent, function(m) return m.type == "function_call" and m.function_name == "delete_customer" end),
                "function_call_approved.json")
            check(find(sent, function(m) return m.type == "function_error" and m.call_id == "call-b" end),
                "function_error_not_approved.json")
            check(find_last(sent, function(m) return m.type == "update" and m.activity ~= nil end),
                "session_update_activity_cleared.json")

            -- State events and session updates never carry a client request_id.
            for _, item in ipairs(sent) do
                local m = item.message
                if m.type == "tool_approval" or (m.type == "update" and (m.activity ~= nil or m.tool_approval ~= nil)) then
                    test.is_nil(m.request_id, "no client request_id in " .. m.type)
                end
            end
        end)

        it("matches Approve all with a grant, its revocation and the tool_approval session update", function()
            local ctx, sent = wired_ctx({ live = 1, policy = { approve_all = "tool" } })
            local op, batch = fx.round(ctx, { { id = "call-a", registry_id = GRANTED, args = { invoice = 7 } } })
            local handle = fx.start(ctx, op)
            fx.pending(ctx, batch.batch_id, 1)
            local record = fx.records_by_call(ctx.session_id, batch.batch_id)["call-a"]
            local all_id = command(ctx, decision(record, { decision = "approve_all", approve_all_scope = "tool" }))
            fx.finish(handle)
            local reply = reply_to(sent, all_id)
            check(reply, "command_response_decision.json")
            check(find_last(sent, function(m) return m.type == "update" and m.tool_approval ~= nil end),
                "session_update_activity.json", { optional = { "activity", "activity_revision" } })
            local revoke_id = command(ctx, { command = "tool_approval_grant_revoke", grant_id = reply.grant.grant_id,
                expected_revision = reply.grant.revision })
            check(reply_to(sent, revoke_id), "command_response_revoke.json")
        end)

        it("matches the grant audit event of a private call and the session notices", function()
            local ctx, sent = wired_ctx({ live = 1, policy = { require = "all", approve_all = "tool" } })
            fx.create_tool_grant(ctx, PRIVATE)
            local op = fx.round(ctx, { { id = "call-p", registry_id = PRIVATE, name = "lookup_customer",
                type = consts.MSG_TYPE.PRIVATE_FUNCTION, args = { customer_id = "c_1042" } } })
            local _, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            check(find(sent, function(m) return m.type == "tool_approval" and m.call_id == "call-p" end),
                "tool_approval_event_grant.json", { opaque = { "approval.display.arguments" } })

            local never, never_sent = wired_ctx({ policy = { require = "all" } })
            local never_op = fx.round(never, { { id = "call-x", registry_id = MARKED, args = {} } })
            assert(message_handlers.process_tools(never, never_op))
            check(find(never_sent, function(m) return m.type == "error" and m.code == "tool_approval_unavailable" end),
                "session_error_unavailable.json")

            local capped, capped_sent = wired_ctx({ live = 1, policy = { max_requests_per_turn = 1 } })
            local capped_op = fx.round(capped, {
                { id = "call-1", registry_id = MARKED, args = { n = 1 } },
                { id = "call-2", registry_id = MARKED, args = { n = 2 } },
            })
            assert(message_handlers.process_tools(capped, capped_op))
            check(find(capped_sent, function(m) return m.type == "error" and m.code == "tool_approval_limit" end),
                "session_error_limit.json")
        end)

        it("matches the model result of a call that did not run", function()
            check(approval_events.model_result("denied_by_user", "Use the staging customer instead."),
                "model_result_not_run.json")
        end)

        it("matches the REST session read, the session list, a message row, the capability and the artifact read", function()
            local ctx = fx.new_ctx({ live = 1 })
            assert(approval_repo.update_tool_approval(ctx.session_id, function() return ctx.config.tool_approval end))
            local op, batch = fx.round(ctx, { { id = "call-a", registry_id = MARKED, name = "delete_customer",
                args = { customer_id = "c_1042", hard = true } } })
            local handle = fx.start(ctx, op)
            fx.pending(ctx, batch.batch_id, 1)

            -- The session object: only the fields the protocol adds are
            -- checked strictly; the rest of the object is the existing one.
            local strict = { "success", "server_now", "session.activity", "session.activity_revision",
                "session.tool_approval" }
            check(rest(get_session, { session_id = ctx.session_id }), "rest_session.json",
                { strict = strict, optional = { "session.title", "session.kind", "session.user_id" } })
            local listed = rest(list_sessions, { limit = "100" })
            local entry = nil
            for _, session in ipairs(listed.sessions) do
                if session.session_id == ctx.session_id then entry = session end
            end
            check({ success = listed.success, server_now = listed.server_now, session = entry }, "rest_session.json",
                { strict = strict, optional = { "session.title", "session.kind", "session.user_id" } })

            local page = rest(session_messages, { session_id = ctx.session_id, limit = "100" })
            local row = nil
            for _, message in ipairs(page.messages) do
                if type(message.metadata) == "table" and message.metadata.approval ~= nil then row = message end
            end
            check({ success = page.success, server_now = page.server_now, count = page.count,
                session_id = page.session_id, messages = { row }, pending_inputs = page.pending_inputs,
                pagination = page.pagination }, "rest_message_row.json",
                { strict = { "success", "server_now", "messages.[].metadata.approval" },
                  opaque = { "messages.[].metadata.approval.display.arguments" } })
            ctx.approval_wake:notify("finish")
            fx.finish(handle)

            check({ success = true, capabilities = get_capabilities.describe() }, "capabilities.json",
                { strict = { "success", "capabilities.schema", "capabilities.tool_approval" } })

            local owner = assert(security.actor()):id()
            local artifact_id = uuid.v7()
            local db = assert(sql.get(consts.get_db_resource()))
            local now = time.now():format(time.RFC3339)
            assert(db:execute("INSERT INTO artifacts (artifact_id, session_id, user_id, kind, title, content, meta, "
                .. "created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                { artifact_id, ctx.session_id, owner, "inline", "Report", "<p>x</p>",
                    json.encode({ content_type = "text/html" }), now, now }))
            local res: any = {}
            function res:set_status(status) self.status = status end
            function res:set_content_type() end
            function res:set_header() end
            function res:write_json(value) self.body = value end
            artifact_access.serve_metadata({ param = function() return artifact_id end }, res, owner)
            db:execute("DELETE FROM artifacts WHERE artifact_id = $1", { artifact_id })
            db:release()
            check(res.body, "rest_artifact.json", { strict = { "session_id", "tool_approval" } })
            test.is_true(res.body.tool_approval.active)
        end)

        it("reports an undocumented key and a missing documented key", function()
            -- The comparison itself: a positive control.
            local message = { type = "function_error", session_id = "s", message_id = "m", call_id = "c",
                function_name = "f", error = "e", outcome = "not_approved", surprise = true,
                approval = { approval_id = "a", state = "denied", ["then"] = "continue", reason = "r" } }
            test.eq(table.concat(problems(message, "function_error_not_approved.json"), "; "),
                "extra surprise; missing approval.disposition")
        end)
    end)
end

return test.run_cases(define_tests)
