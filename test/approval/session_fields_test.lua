local test = require("test")
local json = require("json")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local security = require("security")
local registry = require("registry")
local consts = require("consts")
local approval_repo = require("approval_repo")
local approval_events = require("approval_events")
local approval_gate = require("approval_gate")
local approval_commands = require("approval_commands")
local approval_recovery = require("approval_recovery")
local approval_projection = require("approval_projection")
local activation = require("activation")
local fingerprint = require("fingerprint")
local message_handlers = require("message_handlers")
local message_repo = require("message_repo")
local get_session = require("get_session")
local list_sessions = require("list_sessions")
local get_capabilities = require("get_capabilities")
local artifact_access = require("artifact_access")
local wait_for_boot = require("wait_for_boot")
local fx = require("gate_fixtures")

-- The session fields of tool approval (protocol sections 9, 10 and 12) and
-- the S10 event rules: the REST session read and list, the open
-- announcement, live updates of tool_approval, metadata.approval with
-- batch_id and never pending on a terminal row (live and recovery), recovery
-- updates published live, delegation targets in a session grant's scope,
-- events of private and delegation calls, the capability and the trait
-- entry, and the artifact read.

local MARKED, PLAIN, PRIVATE, DELEGATE, TARGET = fx.MARKED, fx.PLAIN, fx.PRIVATE, fx.DELEGATE, fx.TARGET
local new_ctx, round, row, updates_of = fx.new_ctx, fx.round, fx.row, fx.updates_of
local records_by_call, start, finish, pending = fx.records_by_call, fx.start, fx.finish, fx.pending
local TRAIT = "wippy.session.traits:tool_approval"

-- Calls a REST handler (get_session or list_sessions) with a fake request
-- for the test actor. Returns the status and the body.
local function rest(api: any, query: any): (any, any)
    local result: any = {}
    local saved = { http = api._http, security = api._security }
    api._http = {
        request = function() return { query = function(_, key) return query[key] end } end,
        response = function() return {
            set_header = function() end,
            set_content_type = function() end,
            set_status = function(_, value) result.status = value end,
            write_json = function(_, value) result.body = value end,
        } end,
    }
    api._security = { actor = function() return security.actor() end }
    local ok, err = pcall(api.handler)
    api._http, api._security = saved.http, saved.security
    if not ok then error(err) end
    return result.status, result.body
end

-- A protected session as stored after a turn asked for one call: the
-- activation, one pending request (the activity) and an active tool grant
-- of another tool.
local function protected_session(): (any, any, any)
    local ctx = new_ctx({ live = 1 })
    assert(approval_repo.update_tool_approval(ctx.session_id, function() return ctx.config.tool_approval end))
    -- Approve all true keeps the tool grant valid under the default mode off.
    local grant = fx.create_tool_grant(ctx, fx.GRANTED)
    local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
    local handle = start(ctx, op)
    pending(ctx, batch.batch_id, 1)
    return ctx, grant, handle
end

local function session_of(body: any, session_id: string): any
    for _, session in ipairs(body.sessions or {}) do
        if session.session_id == session_id then return session end
    end
    return nil
end

local function tool_approval_updates(captured: any): {any}
    local out = {}
    for _, update in ipairs(captured.session_updates) do
        if update.tool_approval ~= nil then out[#out + 1] = update.tool_approval end
    end
    return out
end

local function define_tests()
    describe("Tool approval session fields", function()
        local saved = {}
        before_all(function()
            wait_for_boot.run()
            saved.wait = approval_gate._wait
        end)
        after_each(function() approval_gate._wait = saved.wait end)
        after_all(function() fx.cleanup() end)

        it("REST read and list: tool_approval with grants, and activity null with its revision when nothing waits", function()
            -- AC 37, protocol section 10.
            local ctx, grant, handle = protected_session()
            local plain_id = fx.new_session({ config = { agent_id = fx.AGENT } })

            local status, body = rest(get_session, { session_id = ctx.session_id })
            test.eq(status, 200)
            test.is_true(type(body.server_now) == "string" and body.server_now:match("Z$") ~= nil, "server_now")
            local field = body.session.tool_approval
            test.is_true(field.active)
            test.eq(field.revision, ctx.config.tool_approval.revision)
            test.eq(#field.grants, 1)
            test.eq(field.grants[1].grant_id, grant.grant_id)
            test.eq(field.grants[1].revision, 1)
            test.eq(field.grants[1].status, "active")
            test.eq(field.grants[1].scope, "tool")
            test.eq(field.grants[1].registry_id, fx.GRANTED)
            test.eq(field.grants[1].title, "Send invoice email")
            test.eq(body.session.activity.kind, "awaiting_tool_approval")
            local waiting_revision = body.session.activity_revision
            test.is_true(waiting_revision > 0)

            ctx.approval_wake:notify("finish")
            finish(handle)
            _, body = rest(get_session, { session_id = ctx.session_id })
            test.eq(body.session.activity, json.null, "an explicit null when nothing waits")
            test.is_true(body.session.activity_revision > waiting_revision, "a higher revision")
            test.contains(json.encode(body), '"activity":null')

            -- A suspended grant shows its status and the suspension reason.
            assert(approval_repo.transact(ctx.session_id, function(dbtx)
                return approval_repo.suspend_grant(dbtx, ctx.session_id, grant.grant_id, nil, "mode_not_permitted")
            end))
            _, body = rest(list_sessions, { limit = "100" })
            local listed = assert(session_of(body, ctx.session_id), "the protected session is listed")
            test.is_true(type(body.server_now) == "string")
            test.eq(listed.tool_approval.grants[1].status, "suspended")
            test.eq(listed.tool_approval.grants[1].suspension_reason, "mode_not_permitted")
            test.eq(listed.tool_approval.grants[1].revision, 2)
            test.eq(listed.activity, json.null)
            local plain = assert(session_of(body, plain_id), "the unprotected session is listed")
            test.is_false(plain.tool_approval.active)
            test.eq(plain.tool_approval.revision, 0)
            test.eq(#plain.tool_approval.grants, 0)
            test.eq(plain.activity, json.null)
            test.eq(plain.activity_revision, 0)
        end)

        it("publishes the tool_approval field live when the session becomes protected and when a grant changes", function()
            -- AC 37: live updates; committed responses and updates move the grants chip.
            local ctx, captured = new_ctx({ live = 1 })
            -- An unprotected session: its open announcement had revision 0.
            ctx.config.tool_approval = nil
            ctx.tool_approval_published_revision = 0
            local agent = { id = fx.AGENT, agent_options = { tool_approval = { schema = 1 } } }
            ctx.agent_ctx = { active_traits = { { id = TRAIT, context = { approve_all = "tool" } } } }
            assert(activation.apply(ctx, agent))
            local published = tool_approval_updates(captured)
            test.eq(#published, 1, "one update when the session becomes protected")
            test.is_true(published[1].active)
            test.eq(published[1].revision, ctx.config.tool_approval.revision)
            assert(activation.apply(ctx, agent))
            test.eq(#tool_approval_updates(captured), 1, "nothing when nothing changed")

            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            local record = records_by_call(ctx.session_id, batch.batch_id)["call-a"]
            approval_commands.handle(ctx, fx.PLUGIN_PID, { command = "tool_approval", request_id = "req-" .. uuid.v7(),
                sender_user_id = ctx.user_id, approval_id = record.approval_id, decision = "approve_all",
                approve_all_scope = "tool", intent_digest = record.intent_digest, expected_revision = record.revision })
            finish(handle)
            published = tool_approval_updates(captured)
            test.eq(#published, 2, "the new grant is published")
            test.eq(#published[2].grants, 1)
            local grant = published[2].grants[1]
            test.eq(grant.status, "active")

            approval_commands.handle(ctx, fx.PLUGIN_PID, { command = "tool_approval_grant_revoke",
                request_id = "req-" .. uuid.v7(), sender_user_id = ctx.user_id, grant_id = grant.grant_id,
                expected_revision = grant.revision })
            published = tool_approval_updates(captured)
            test.eq(#published, 3, "the revocation is published")
            test.eq(#published[3].grants, 0, "a revoked grant is not listed")
        end)

        it("publishes the tool_approval field live when the activation step or the gate suspends a grant", function()
            -- The activation step: a switch to an agent without the trait.
            local ctx, captured = new_ctx({ live = 1, declared = "2026-11-19T10:00:00Z" })
            local grant = fx.create_tool_grant(ctx, fx.GRANTED)
            ctx.agent_ctx = { active_traits = { "other:trait" } }
            assert(activation.apply(ctx, { id = fx.AGENT, agent_options = {} }))
            local published = tool_approval_updates(captured)
            test.eq(#published, 1)
            test.eq(published[1].grants[1].grant_id, grant.grant_id)
            test.eq(published[1].grants[1].status, "suspended")
            test.eq(published[1].grants[1].suspension_reason, "agent_without_trait")

            -- The gate's evaluation: an agent without the trait at the step.
            -- The call then asks; the wait ends at once.
            approval_gate._wait = function() return { close_reason = "finish" } end
            local gate_ctx, gate_captured = new_ctx({ live = 1, policy = { agent_opted_in = false } })
            local gate_grant = fx.create_tool_grant(gate_ctx, fx.GRANTED)
            local op = round(gate_ctx, { { id = "call-1", registry_id = fx.GRANTED, args = { invoice = 7 } } })
            assert(message_handlers.process_tools(gate_ctx, op))
            published = tool_approval_updates(gate_captured)
            test.eq(#published, 1, "the evaluator's suspension is published")
            test.eq(published[1].grants[1].grant_id, gate_grant.grant_id)
            test.eq(published[1].grants[1].status, "suspended")
        end)

        it("projects batch_id in metadata.approval", function()
            local ctx = new_ctx({ live = 1 })
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            test.eq(row(op.call_message_ids["call-a"]).metadata.approval.batch_id, batch.batch_id)
            ctx.approval_wake:notify("finish")
            finish(handle)
        end)

        it("leaves no pending projection when the round fails after its requests were stored", function()
            -- S9 open item 2, live path: fail_remaining closes the open batch.
            local ctx, captured = new_ctx({ live = 1 })
            approval_gate._wait = function() return nil, "lost the database" end
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-c", registry_id = PLAIN, args = {} },
            })
            local _, err = message_handlers.process_tools(ctx, op)
            test.contains(tostring(err), "lost the database")
            local metadata = row(op.call_message_ids["call-a"]).metadata
            test.eq(metadata.status, "error")
            test.eq(metadata.approval.state, "interrupted", "the row's card is not pending")
            test.eq(metadata.approval.disposition, "not_run")
            test.eq(records_by_call(ctx.session_id, batch.batch_id)["call-a"].state, "interrupted")
            local stored = assert(approval_repo.get_batch(nil, batch.batch_id))
            test.eq(stored.state .. ":" .. stored.close_reason, "closed:exit")
            local last = nil
            for _, update in ipairs(updates_of(captured, approval_events.TOOL_APPROVAL)) do
                if update.id == "call-a" then last = update.payload.approval end
            end
            test.eq(last.state, "interrupted", "the closure is published live")
            test.eq(captured.session_updates[#captured.session_updates].activity, json.null, "the activity is cleared")
        end)

        it("rewrites the projection of a terminal row when recovery closes its batch", function()
            -- S9 open item 2, recovery path: recover_pending skips terminal rows.
            local ctx, op, batch = fx.crashed_batch()
            assert(message_repo.update_metadata(op.call_message_ids["call-a"],
                { status = "error", result = "failed elsewhere" }))
            test.eq(row(op.call_message_ids["call-a"]).metadata.approval.state, "pending")
            assert(approval_recovery.recover_calls(ctx.session_id, nil, true))
            local metadata = row(op.call_message_ids["call-a"]).metadata
            test.eq(metadata.approval.state, "interrupted")
            test.eq(metadata.approval.revision, records_by_call(ctx.session_id, batch.batch_id)["call-a"].revision)
            test.eq(metadata.status, "error", "the row keeps its status")
            test.eq(metadata.result, "failed elsewhere", "and its result")
        end)

        it("publishes what recovery changed when it has an upstream, and nothing without one", function()
            -- S9 open item 3.
            local ctx, op = fx.crashed_batch()
            local updates, session_updates = {}, {}
            local upstream = {
                send_message_update = function(_, id, kind, payload)
                    updates[#updates + 1] = { id = id, type = kind, payload = payload }
                end,
                update_session = function(_, changes) session_updates[#session_updates + 1] = changes end,
            }
            assert(approval_recovery.recover_calls(ctx.session_id, nil, true, upstream))
            local states = {}
            for _, update in ipairs(updates) do
                test.eq(update.type, approval_events.TOOL_APPROVAL)
                test.is_nil(update.payload.request_id, "a state event carries no client request_id")
                states[update.id] = update.payload.approval.state
            end
            test.eq(states["call-a"], "interrupted")
            test.eq(states["call-b"], "approved", "the approved record's disposition moved")
            test.eq(#session_updates, 1)
            test.eq(session_updates[1].activity, json.null)
            test.is_true(session_updates[1].activity_revision > 0)

            local quiet = fx.crashed_batch()
            assert(approval_recovery.recover_calls(quiet.session_id, nil, true))
            test.eq(row(op.call_message_ids["call-a"]).metadata.approval.state, "interrupted")
        end)

        it("discloses the agent's delegation targets in a session grant's scope; the grant runs that target", function()
            local ctx, captured = new_ctx({ live = 1, policy = { approve_all = "session", require = "all" } })
            -- The compiled agent's tools: a name-keyed map, with a delegation.
            ctx.current_agent.tools = {
                delete_customer = { name = "delete_customer", registry_id = MARKED },
                lookup = { name = "lookup", registry_id = PLAIN },
                billing = { name = "billing", agent_id = TARGET },
            }
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            local record = records_by_call(ctx.session_id, batch.batch_id)["call-a"]
            local delegation = nil
            local listed = {}
            for _, tool in ipairs(record.display.approve_all_scope.tools) do
                listed[tool.registry_id .. "/" .. tostring(tool.target_agent_id)] = true
                if tool.target_agent_id == TARGET then delegation = tool end
            end
            test.is_true(listed[MARKED .. "/nil"])
            test.is_true(listed[PLAIN .. "/nil"], "a tool of the map that no call names")
            test.not_nil(delegation, "the delegation target is disclosed")
            test.eq(delegation.registry_id, DELEGATE)
            test.eq(delegation.title, "Billing agent")
            test.eq(delegation.fingerprint, assert(fingerprint.delegation(
                assert(fingerprint.of_entry(registry.get(DELEGATE))), assert(fingerprint.of_entry(registry.get(TARGET))))))
            approval_commands.handle(ctx, fx.PLUGIN_PID, { command = "tool_approval", request_id = "req-" .. uuid.v7(),
                sender_user_id = ctx.user_id, approval_id = record.approval_id, decision = "approve_all",
                approve_all_scope = "session", intent_digest = record.intent_digest, expected_revision = record.revision })
            finish(handle)
            local grants = assert(approval_repo.list_grants(nil, ctx.session_id))
            local in_manifest = false
            for _, entry in ipairs(grants[1].manifest) do
                if entry.target_agent_id == TARGET and entry.registry_id == DELEGATE then in_manifest = true end
            end
            test.is_true(in_manifest, "the manifest follows the disclosed list")

            local next_op, next_batch = round(ctx, { { id = "call-d", registry_id = DELEGATE, name = "billing",
                type = consts.MSG_TYPE.DELEGATION, args = { task = "Refund order 7" }, context = { to_agent_id = TARGET } } })
            local _, err = message_handlers.process_tools(ctx, next_op)
            test.is_nil(err)
            local audit = records_by_call(ctx.session_id, next_batch.batch_id)["call-d"]
            test.eq(audit.decided_via, "grant", "the session grant covers the delegation target")
            test.eq(audit.disposition, "dispatched")
            test.is_true(next_op.caller.launches["call-d"])
            test.eq(#captured.notices, 0)
        end)

        it("gives a private or delegation call without an approval record no function_error", function()
            local ctx, captured = new_ctx({ live = 1 })
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-p", registry_id = PRIVATE, type = consts.MSG_TYPE.PRIVATE_FUNCTION, args = { q = 1 } },
                { id = "call-d", registry_id = DELEGATE, type = consts.MSG_TYPE.DELEGATION, args = { task = "x" },
                    context = { to_agent_id = TARGET } },
            })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            local record = records_by_call(ctx.session_id, batch.batch_id)["call-a"]
            approval_commands.handle(ctx, fx.PLUGIN_PID, { command = "tool_approval", request_id = "req-" .. uuid.v7(),
                sender_user_id = ctx.user_id, approval_id = record.approval_id, decision = "deny", ["then"] = "stop",
                intent_digest = record.intent_digest, expected_revision = record.revision })
            finish(handle)
            local errors_for = {}
            for _, update in ipairs(updates_of(captured, consts.UPSTREAM_TYPES.FUNCTION_ERROR)) do
                errors_for[update.id] = true
            end
            test.is_true(errors_for["call-a"], "the public call gets its function_error")
            test.is_nil(errors_for["call-p"], "no function_error for a private call without a record")
            test.is_nil(errors_for["call-d"], "no function_error for a delegation call without a record")
            test.eq(row(op.call_message_ids["call-p"]).metadata.result.reason, "not_run_batch_stopped",
                "the row is still settled")
        end)

        it("publishes one tool_approval event, before function_error, for a not-approved delegation call", function()
            local ctx, captured = new_ctx({ live = 1, policy = { require = "all" } })
            local op, batch = round(ctx, {
                { id = "call-d", registry_id = DELEGATE, type = consts.MSG_TYPE.DELEGATION, args = { task = "x" },
                    context = { to_agent_id = TARGET } },
            })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            local record = records_by_call(ctx.session_id, batch.batch_id)["call-d"]
            approval_commands.handle(ctx, fx.PLUGIN_PID, { command = "tool_approval", request_id = "req-" .. uuid.v7(),
                sender_user_id = ctx.user_id, approval_id = record.approval_id, decision = "deny",
                ["then"] = "continue", reason = "Not now", intent_digest = record.intent_digest,
                expected_revision = record.revision })
            finish(handle)
            local settled_at, error_at = nil, nil
            for index, update in ipairs(captured.updates) do
                if update.id == "call-d" and update.type == approval_events.TOOL_APPROVAL
                    and update.payload.approval.disposition == "not_run" then settled_at = index end
                if update.id == "call-d" and update.type == consts.UPSTREAM_TYPES.FUNCTION_ERROR then error_at = index end
            end
            test.not_nil(settled_at)
            test.not_nil(error_at)
            test.is_true(settled_at < error_at, "tool_approval first")
            test.eq(captured.updates[settled_at].payload.row_type, "delegation")
        end)

        it("publishes one approved tool_approval audit event for a grant-approved private or delegation call", function()
            -- AC 38.
            local ctx, captured = new_ctx({ live = 1, policy = { require = "all", approve_all = "tool" } })
            fx.create_tool_grant(ctx, PRIVATE)
            local target_fingerprint = assert(fingerprint.of_entry(registry.get(TARGET)))
            local delegation_fingerprint = assert(fingerprint.delegation(
                assert(fingerprint.of_entry(registry.get(DELEGATE))), target_fingerprint))
            assert(approval_repo.transact(ctx.session_id, function(dbtx)
                return approval_repo.create_grant(dbtx, { grant_id = uuid.v7(), session_id = ctx.session_id,
                    owner_id = ctx.user_id, epoch = ctx.session_id, scope = "tool", registry_id = DELEGATE,
                    fingerprint = delegation_fingerprint, target_agent_id = TARGET, created_by = ctx.user_id })
            end))
            local op = round(ctx, {
                { id = "call-p", registry_id = PRIVATE, type = consts.MSG_TYPE.PRIVATE_FUNCTION, args = { q = 1 } },
                { id = "call-d", registry_id = DELEGATE, type = consts.MSG_TYPE.DELEGATION, args = { task = "x" },
                    context = { to_agent_id = TARGET } },
            })
            local _, err = message_handlers.process_tools(ctx, op)
            test.is_nil(err)
            for _, call_id in ipairs({ "call-p", "call-d" }) do
                local events_for = {}
                for _, update in ipairs(updates_of(captured, approval_events.TOOL_APPROVAL)) do
                    if update.id == call_id then events_for[#events_for + 1] = update.payload end
                end
                test.eq(#events_for, 1, call_id .. ": one audit event")
                test.eq(events_for[1].approval.state, "approved", call_id)
                test.eq(events_for[1].approval.decided_via, "grant", call_id)
                test.eq(events_for[1].approval.disposition, "dispatched", call_id)
                test.is_true(op.caller.launches[call_id], call_id .. " ran")
            end
        end)

        it("advertises tool_approval 1 and registers the trait entry the activation needs", function()
            test.eq(get_capabilities.describe().tool_approval, 1)
            local entry = assert(registry.get(TRAIT), "the trait entry is registered")
            test.eq(entry.meta.type, "agent.trait")
            local options = entry.data and entry.data.agent_options
            test.not_nil(options, "the trait contributes agent options")
            test.eq(options.tool_approval.schema, 1)
            -- The compiled marker the trait contributes passes the activation check.
            local settings, listed, check_err = activation.check({ { id = TRAIT, context = { require = "all" } } },
                { tool_approval = options.tool_approval })
            test.is_nil(check_err)
            test.is_true(listed)
            test.eq(settings.require, "all")
        end)

        it("returns session_id and tool_approval.active from the artifact's session in the artifact read", function()
            local ctx = new_ctx({ live = 1 })
            assert(approval_repo.update_tool_approval(ctx.session_id, function() return ctx.config.tool_approval end))
            local plain_id = fx.new_session({ config = { agent_id = fx.AGENT } })
            local owner = assert(security.actor()):id()
            local ids = { protected = uuid.v7(), plain = uuid.v7(), loose = uuid.v7() }
            local db = assert(sql.get(consts.get_db_resource()))
            local now = time.now():format(time.RFC3339)
            local meta = json.encode({ content_type = "text/html" })
            for name, session_id in pairs({ protected = ctx.session_id, plain = plain_id }) do
                local _, err = db:execute("INSERT INTO artifacts (artifact_id, session_id, user_id, kind, title, content, "
                    .. "meta, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                    { ids[name], session_id, owner, "inline", "Page", "<p>x</p>", meta, now, now })
                if err then error(err) end
            end
            local _, loose_err = db:execute("INSERT INTO artifacts (artifact_id, user_id, kind, title, content, "
                .. "meta, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                { ids.loose, owner, "inline", "Page", "<p>x</p>", meta, now, now })
            if loose_err then error(loose_err) end
            local function read(artifact_id: string): (any, any)
                local res: any = {}
                function res:set_status(status) self.status = status end
                function res:set_content_type() end
                function res:set_header() end
                function res:write_json(value) self.body = value end
                artifact_access.serve_metadata({ param = function() return artifact_id end }, res, owner)
                return res.status, res.body
            end
            local status, body = read(ids.protected)
            test.eq(status, 200)
            test.eq(body.session_id, ctx.session_id)
            test.is_true(body.tool_approval.active, "a protected session's artifact")
            status, body = read(ids.plain)
            test.eq(status, 200)
            test.eq(body.session_id, plain_id)
            test.is_false(body.tool_approval.active, "an unprotected session's artifact")
            _, body = read(ids.loose)
            test.is_false(body.tool_approval.active, "an artifact without a session")

            -- A failed read of the session fails closed: no metadata, no flag.
            local saved_field = artifact_access._approval_projection
            artifact_access._approval_projection = { artifact_field = function() return nil, "database gone" end }
            status, body = read(ids.protected)
            artifact_access._approval_projection = saved_field
            test.eq(status, 500)
            test.is_nil(body.tool_approval)
            for _, id in pairs(ids) do db:execute("DELETE FROM artifacts WHERE artifact_id = $1", { id }) end
            db:release()
        end)

        it("carries a cleared activity across process.send as JSON null", function()
            -- publish_activity relies on it: the session sends its updates to
            -- the plugin with process.send.
            local inbox = process.inbox()
            assert(process.send(process.pid(), "approval_null_probe", { activity = json.null, activity_revision = 3 }))
            local selected = channel.select({ inbox:case_receive(), time.after("10s"):case_receive() })
            test.eq(selected.channel, inbox, "the probe arrived")
            local data = selected.value:payload():data()
            test.eq(json.encode(data), '{"activity":null,"activity_revision":3}')
        end)

        it("announces the approval fields of the open announcement after recovery", function()
            local ctx = fx.crashed_batch()
            local fields = assert(approval_projection.announcement(ctx.session_id, ctx.config))
            test.is_true(fields.tool_approval.active)
            test.is_true(fields.activity ~= json.null, "the crashed turn still waits before recovery")
            assert(approval_recovery.recover_calls(ctx.session_id, nil, true))
            fields = assert(approval_projection.announcement(ctx.session_id, ctx.config))
            test.eq(fields.activity, json.null)
            test.is_true(fields.activity_revision > 0)
            local unprotected = assert(approval_projection.announcement(fx.new_session(), {}))
            test.is_false(unprotected.tool_approval.active)
            test.eq(unprotected.activity, json.null)
        end)
    end)
end

return test.run_cases(define_tests)
