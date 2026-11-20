local test = require("test")
local uuid = require("uuid")
local time = require("time")
local sql = require("sql")
local registry = require("registry")
local consts = require("consts")
local approval_commands = require("approval_commands")
local approval_repo = require("approval_repo")
local session_repo = require("session_repo")
local fingerprint = require("fingerprint")
local activation = require("activation")
local tool_meta = require("tool_meta")
local wait_for_boot = require("wait_for_boot")
local fx = require("gate_fixtures")

-- The tool approval commands of the session inbox: decisions and grant
-- revocations through approval_commands.handle, as the session inbox calls
-- it for a command the parent plugin forwarded, against the real gate in
-- process_tools (its own coroutine) and the real store.

local MARKED, GRANTED, PLAIN, FORBIDDEN = fx.MARKED, fx.GRANTED, fx.PLAIN, fx.FORBIDDEN
local new_ctx, round, row, count = fx.new_ctx, fx.round, fx.row, fx.count
local start, finish, pending = fx.start, fx.finish, fx.pending
local launches, records_by_call = fx.launches, fx.records_by_call

-- Sends a command as the plugin forwards it: the client data with conn_pid,
-- request_id and sender_user_id. opts.from (default the parent plugin),
-- opts.sender (default the session owner; false leaves it out),
-- opts.request_id. Returns the reply the session sent.
local function send(ctx: any, captured: any, data: any, opts: any?): any
    opts = opts or {}
    local payload: any = { conn_pid = "conn-1", request_id = opts.request_id or ("req-" .. uuid.v7()) }
    for key, value in pairs(data) do payload[key] = value end
    if opts.sender ~= false then payload.sender_user_id = opts.sender or ctx.user_id end
    local replies = #captured.replies
    test.is_true(approval_commands.handle(ctx, opts.from or fx.PLUGIN_PID, payload), "the inbox handles it")
    test.eq(#captured.replies, replies + 1, "one reply")
    return captured.replies[#captured.replies]
end

-- The decision command for `record`, with its digest and revision.
local function decision(record: any, fields: any?): any
    local data: any = { command = "tool_approval", approval_id = record.approval_id,
        intent_digest = record.intent_digest, expected_revision = record.revision }
    for key, value in pairs(fields or {}) do data[key] = value end
    return data
end

local function revocation(grant: any, revision: number?): any
    return { command = "tool_approval_grant_revoke", grant_id = grant.grant_id,
        expected_revision = revision or grant.revision }
end

local function record_of(ctx: any, batch: any, call_id: string): any
    return records_by_call(ctx.session_id, batch.batch_id)[call_id]
end

local function grants_of(session_id: string): number
    return count("session_tool_approval_grants", session_id)
end

-- A caller that stops at the start of caller:execute, after the release
-- committed and before any call launched, until the test lets it go.
local function held_caller(): any
    local caller = fx.fake_caller()
    caller.entered = channel.new(1)
    caller.go = channel.new(1)
    local run_calls = caller.execute
    function caller:execute(context, tools, cancel)
        self.entered:send(true)
        self.go:receive()
        return run_calls(self, context, tools, cancel)
    end
    return caller
end

local function define_tests()
    describe("Tool approval inbox commands", function()
        local saved = {}
        before_all(function()
            wait_for_boot.run()
            saved.registry_get = tool_meta._registry_get
        end)
        after_each(function() tool_meta._registry_get = saved.registry_get end)
        after_all(function() fx.cleanup() end)

        it("leaves every other command to the session as before", function()
            local ctx = new_ctx({ live = 1 })
            test.is_false(approval_commands.handle(ctx, fx.PLUGIN_PID, { command = "stop", request_id = "r" }))
            test.is_false(approval_commands.handle(ctx, fx.PLUGIN_PID, { command = "tool_approval_surface" }))
        end)

        it("commits exactly one of two decisions; the other gets approval_not_pending with the committed approval", function()
            local ctx, captured = new_ctx({ live = 1 })
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            local record = record_of(ctx, batch, "call-a")
            local first = send(ctx, captured, decision(record, { decision = "approve" }), { request_id = "req-1" })
            test.is_true(first.success)
            test.eq(first.details.approval.state, "approved")
            test.eq(first.details.approval.decided_via, "user")
            test.eq(first.details.approval.revision, 2)
            test.eq(#first.details.approvals, 1)
            for _, case in ipairs({ { revision = record.revision, name = "the revision the card showed" },
                { revision = 99, name = "a stale revision" } }) do
                local second = send(ctx, captured, decision(record, { decision = "deny", ["then"] = "continue",
                    reason = "No", expected_revision = case.revision }))
                test.is_false(second.success, case.name)
                test.eq(second.code, "approval_not_pending", case.name .. ": checked before the revision")
                test.eq(second.details.approval.state, "approved", case.name .. ": the committed approval")
                test.eq(second.details.approval.decided_via, "user", case.name)
            end
            finish(handle)
            test.eq(launches(op.caller), 1, "the call runs once")
            local stored = record_of(ctx, batch, "call-a")
            test.eq(stored.state, "approved")
            test.eq(stored.decided_by, ctx.user_id, "the actor comes from the authenticated sender")

            -- A retry with the same request_id and body replays the stored
            -- response; another body under that request_id conflicts.
            local replay = send(ctx, captured, decision(record, { decision = "approve" }), { request_id = "req-1" })
            test.is_true(replay.success)
            test.eq(replay.details.approval.revision, 2, "the stored response, not the current record")
            test.eq(replay.details.approval.decided_at, first.details.approval.decided_at)
            test.eq(record_of(ctx, batch, "call-a").revision, stored.revision, "the replay writes nothing")
            local conflict = send(ctx, captured, decision(record, { decision = "deny", ["then"] = "stop" }),
                { request_id = "req-1" })
            test.eq(conflict.code, "request_conflict")
            test.eq(count("session_command_receipts", ctx.session_id), 1, "one receipt, for the committed decision")
        end)

        it("refuses a command from a sender that is not the parent plugin or not the owner, before the receipt lookup", function()
            local ctx, captured = new_ctx({ live = 1 })
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            local record = record_of(ctx, batch, "call-a")
            local approve = decision(record, { decision = "approve" })
            for _, case in ipairs({
                { name = "another process with the owner's user_id", opts = { from = "intruder-pid" } },
                { name = "the plugin with another user", opts = { sender = "other-user" } },
                { name = "the plugin without a stamped sender", opts = { sender = false } },
            }) do
                local reply = send(ctx, captured, approve, case.opts)
                test.eq(reply.code, "forbidden", case.name)
            end
            local unchanged = record_of(ctx, batch, "call-a")
            test.eq(unchanged.state, "pending", "nothing changed")
            test.eq(unchanged.revision, 1)
            test.eq(count("session_command_receipts", ctx.session_id), 0)

            test.is_true(send(ctx, captured, approve, { request_id = "req-1" }).success)
            finish(handle)
            -- The owner's committed receipt is never replayed to anyone else.
            local reply = send(ctx, captured, approve, { request_id = "req-1", sender = "other-user" })
            test.eq(reply.code, "forbidden")
            test.is_nil(reply.details, "no committed record goes to another user")
        end)

        it("refuses the owner's decision with forbidden after the session changed owner", function()
            local ctx, captured = new_ctx({ live = 1 })
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            local db = assert(sql.get(consts.get_db_resource()))
            local _, update_err = db:execute("UPDATE sessions SET user_id = $1 WHERE session_id = $2",
                { "new-owner", ctx.session_id })
            db:release()
            test.is_nil(update_err)
            local reply = send(ctx, captured, decision(record_of(ctx, batch, "call-a"), { decision = "approve" }))
            test.eq(reply.code, "forbidden")
            test.eq(record_of(ctx, batch, "call-a").state, "pending")
            ctx.approval_wake:notify("finish")
            finish(handle)
            test.eq(launches(op.caller), 0)
        end)

        it("answers approval_not_found, approval_expired, invalid_decision and approval_stale and changes nothing", function()
            local ctx, captured = new_ctx({ live = 1 })
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            local record = record_of(ctx, batch, "call-a")
            local other_ctx, other_captured = new_ctx({ live = 1 })
            local cases = {
                { code = "approval_not_found", data = decision({ approval_id = uuid.v7(), intent_digest = "x",
                    revision = 1 }, { decision = "approve" }) },
                { code = "invalid_decision", data = decision(record, { decision = "approve_all",
                    approve_all_scope = "batch" }), name = "not offered" },
                { code = "invalid_decision", data = decision(record, { decision = "approve", ["then"] = "stop" }) },
                { code = "invalid_decision", data = decision(record, { decision = "deny" }), name = "no then" },
                { code = "invalid_decision", data = decision(record, { decision = "deny", ["then"] = "continue" }) },
                { code = "invalid_decision", data = decision(record, { decision = "deny", ["then"] = "continue",
                    reason = "" }) },
                { code = "invalid_decision", data = decision(record, { decision = "deny", ["then"] = "continue",
                    reason = string.rep("a", 2001) }), name = "2,001 characters" },
                { code = "invalid_decision", data = decision(record, { decision = "deny", ["then"] = "stop",
                    reason = "why" }) },
                { code = "invalid_decision", data = decision(record, { decision = "approve",
                    padding = string.rep("x", 4096) }), name = "over 4 KB" },
                { code = "approval_stale", data = decision(record, { decision = "approve",
                    intent_digest = "sha256:" .. string.rep("0", 64) }) },
                { code = "approval_stale", data = decision(record, { decision = "approve", expected_revision = 2 }) },
            }
            for _, case in ipairs(cases) do
                local reply = send(ctx, captured, case.data)
                test.eq(reply.code, case.code, case.name or case.code)
            end
            -- A request of another session is not found here.
            local foreign = send(other_ctx, other_captured, decision(record, { decision = "approve" }))
            test.eq(foreign.code, "approval_not_found")
            local unchanged = record_of(ctx, batch, "call-a")
            test.eq(unchanged.state, "pending")
            test.eq(unchanged.revision, 1)
            test.eq(count("session_command_receipts", ctx.session_id), 0)

            -- The deadline.
            local saved_now = activation._now
            local later = time.now():unix() + 3600
            activation._now = function() return later end
            local expired = send(ctx, captured, decision(record, { decision = "approve" }))
            activation._now = saved_now
            test.eq(expired.code, "approval_expired")
            -- Positive control: a reason of exactly 2,000 characters fits.
            local denied = send(ctx, captured, decision(record, { decision = "deny", ["then"] = "continue",
                reason = string.rep("a", 2000) }))
            test.is_true(denied.success)
            finish(handle)
            test.eq(launches(op.caller), 0)
        end)

        it("closes the batch in the stop denial's transaction; nothing of the batch runs", function()
            local ctx, captured = new_ctx({ live = 1 })
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-c", registry_id = PLAIN, args = {} },
            })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            local reply = send(ctx, captured, decision(record_of(ctx, batch, "call-a"),
                { decision = "deny", ["then"] = "stop" }))
            test.is_true(reply.success)
            test.eq(reply.details.approval.state, "denied")
            test.eq(reply.details.approval["then"], "stop")
            test.eq(reply.details.approval.disposition, "not_run", "the closure committed with the decision")
            local closed = assert(approval_repo.get_batch(nil, batch.batch_id))
            test.eq(closed.state, "closed")
            test.eq(closed.close_reason, "stop_denial")
            local _, err, seconds = finish(handle)
            test.is_nil(err)
            test.is_true(seconds < 10, "the decision woke the gate")
            test.eq(launches(op.caller), 0)
            test.eq(row(op.call_message_ids["call-a"]).metadata.result.reason, "stopped_by_user")
        end)

        it("publishes the committed state, the activity, then the reply, and wakes the waiting gate", function()
            local ctx, captured = new_ctx({ live = 1 })
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-b", registry_id = MARKED, args = { n = 2 } },
            })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 2)
            local waiter = ctx.approval_wake.waiter
            test.not_nil(waiter, "the gate waits on the hub")
            local events_before = #captured.updates
            local reply = send(ctx, captured, decision(record_of(ctx, batch, "call-a"), { decision = "approve" }))
            test.is_true(reply.success)
            local event = captured.updates[events_before + 1]
            test.eq(event.id, "call-a", "the per-call topic")
            test.eq(event.type, "tool_approval")
            test.eq(event.payload.approval.state, "approved")
            test.eq(event.payload.function_name, "call-a")
            test.is_nil(event.payload.request_id, "a state event never carries the client request_id")
            local activity = captured.session_updates[#captured.session_updates]
            test.eq(#activity.activity.approval_ids, 1, "only the request that still waits")
            test.eq(activity.activity.approval_ids[1], record_of(ctx, batch, "call-b").approval_id)
            test.eq(row(op.call_message_ids["call-a"]).metadata.approval.state, "approved", "the row projection")
            test.eq(row(op.call_message_ids["call-a"]).metadata.status, "pending", "the row waits for its result")
            local second = send(ctx, captured, decision(record_of(ctx, batch, "call-b"), { decision = "approve" }))
            test.is_true(second.success)
            local _, _, seconds = finish(handle)
            test.is_true(seconds < 10)
            test.eq(launches(op.caller), 2)
        end)

        it("approves the three covered requests with one scope batch decision, stores no grant and asks again next batch", function()
            local ctx, captured = new_ctx({ live = 1, policy = { approve_all = "batch" } })
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-b", registry_id = MARKED, args = { n = 2 } },
                { id = "call-c", registry_id = MARKED, args = { n = 3 } },
            })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 3)
            local record = record_of(ctx, batch, "call-b")
            test.eq(record.offered.approve_all.scope, "batch")
            test.eq(#record.offered.approve_all.covers, 3)
            local reply = send(ctx, captured, decision(record, { decision = "approve_all", approve_all_scope = "batch" }))
            test.is_true(reply.success)
            test.eq(#reply.details.approvals, 3)
            test.is_nil(reply.details.grant)
            finish(handle)
            test.eq(launches(op.caller), 3)
            for _, call_id in ipairs({ "call-a", "call-b", "call-c" }) do
                test.eq(record_of(ctx, batch, call_id).decided_via, "approve_all", call_id)
            end
            test.eq(grants_of(ctx.session_id), 0, "no grant row")
            local next_op, next_batch = round(ctx, { { id = "call-d", registry_id = MARKED, args = { n = 4 } },
                { id = "call-e", registry_id = MARKED, args = { n = 5 } } })
            local next_handle = start(ctx, next_op)
            pending(ctx, next_batch.batch_id, 2)
            ctx.approval_wake:notify("finish")
            finish(next_handle)
            test.eq(launches(next_op.caller), 0, "the next batch asks again")
        end)

        it("creates one grant with the tool's fingerprint for scope tool; the tool then runs on it and another marked tool asks", function()
            local ctx, captured = new_ctx({ live = 1, policy = { approve_all = "tool" } })
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            local record = record_of(ctx, batch, "call-a")
            test.eq(record.display.approve_all_scope.tools[1].registry_id, MARKED)
            local reply = send(ctx, captured, decision(record, { decision = "approve_all", approve_all_scope = "tool" }))
            test.is_true(reply.success)
            finish(handle)
            test.eq(launches(op.caller), 1)
            local grant = assert(approval_repo.get_grant(nil, reply.details.grant.grant_id))
            test.eq(grant.scope, "tool")
            test.eq(grant.registry_id, MARKED)
            test.eq(grant.fingerprint, assert(fingerprint.of_entry(registry.get(MARKED))))
            test.eq(grant.owner_id, ctx.user_id)
            test.eq(grant.epoch, ctx.session_id)
            test.eq(grant.source_approval_id, record.approval_id)
            test.eq(grant.created_by, ctx.user_id)
            test.eq(reply.details.grant.title, "Delete customer")
            test.eq(reply.details.approval.grant_id, grant.grant_id)
            test.eq(grants_of(ctx.session_id), 1)

            local next_op, next_batch = round(ctx, {
                { id = "call-b", registry_id = MARKED, args = { n = 2 } },
                { id = "call-c", registry_id = GRANTED, args = { invoice = 7 } },
            })
            local next_handle = start(ctx, next_op)
            pending(ctx, next_batch.batch_id, 1)
            local audit = record_of(ctx, next_batch, "call-b")
            test.eq(audit.decided_via, "grant")
            test.eq(audit.grant_id, grant.grant_id)
            test.is_nil(audit.expires_at, "no request for the granted tool")
            test.eq(record_of(ctx, next_batch, "call-c").state, "pending", "another marked tool asks")
            send(ctx, captured, decision(record_of(ctx, next_batch, "call-c"), { decision = "approve" }))
            finish(next_handle)
            test.is_true(next_op.caller.launches["call-b"])
            test.is_true(next_op.caller.launches["call-c"])
        end)

        it("creates a session grant whose manifest is the disclosed tool list; a later tool and an approve_all false tool ask", function()
            local ctx, captured = new_ctx({ live = 1, policy = { approve_all = "session", require = "all" } })
            ctx.current_agent.tools = { { registry_id = MARKED }, { registry_id = PLAIN }, { registry_id = FORBIDDEN } }
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            local record = record_of(ctx, batch, "call-a")
            local disclosed = record.display.approve_all_scope
            test.eq(disclosed.scope, "session")
            local listed = {}
            for _, tool in ipairs(disclosed.tools) do listed[tool.registry_id] = tool.fingerprint end
            test.not_nil(listed[MARKED])
            test.not_nil(listed[PLAIN])
            test.is_nil(listed[FORBIDDEN], "a tool with approve_all: false is never in the scope")
            local reply = send(ctx, captured, decision(record, { decision = "approve_all", approve_all_scope = "session" }))
            test.is_true(reply.success)
            test.eq(reply.details.grant.scope, "session")
            test.is_nil(reply.details.grant.registry_id)
            finish(handle)
            local grant = assert(approval_repo.get_grant(nil, reply.details.grant.grant_id))
            test.eq(#grant.manifest, #disclosed.tools, "the manifest is the disclosure list")
            for index, entry in ipairs(grant.manifest) do
                test.eq(entry.registry_id, disclosed.tools[index].registry_id)
                test.eq(entry.fingerprint, disclosed.tools[index].fingerprint)
            end

            local next_op, next_batch = round(ctx, {
                { id = "call-b", registry_id = MARKED, args = { n = 2 } },
                { id = "call-c", registry_id = PLAIN, args = {} },
                { id = "call-d", registry_id = GRANTED, args = { invoice = 7 } },
                { id = "call-e", registry_id = FORBIDDEN, args = { amount = 9 } },
            })
            local next_handle = start(ctx, next_op)
            pending(ctx, next_batch.batch_id, 2)
            test.eq(record_of(ctx, next_batch, "call-b").decided_via, "grant")
            test.eq(record_of(ctx, next_batch, "call-c").decided_via, "grant", "a disclosed tool that was not called")
            test.eq(record_of(ctx, next_batch, "call-d").state, "pending", "a tool added after the grant asks")
            local forbidden = record_of(ctx, next_batch, "call-e")
            test.eq(forbidden.state, "pending", "approve_all: false asks every time")
            test.is_nil(forbidden.offered.approve_all)
            send(ctx, captured, decision(record_of(ctx, next_batch, "call-d"), { decision = "approve" }))
            send(ctx, captured, decision(forbidden, { decision = "approve" }))
            finish(next_handle)
            test.eq(launches(next_op.caller), 4)
        end)

        it("refuses a scope that differs from the offer and changes only the covered list", function()
            local ctx, captured = new_ctx({ live = 1, policy = { approve_all = "tool" } })
            local op, batch = round(ctx, {
                { id = "call-a", registry_id = MARKED, args = { n = 1 } },
                { id = "call-b", registry_id = MARKED, args = { n = 2 } },
                { id = "call-c", registry_id = GRANTED, args = { invoice = 7 } },
            })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 3)
            local record = record_of(ctx, batch, "call-a")
            test.eq(#record.offered.approve_all.covers, 2, "scope tool covers the same tool only")
            for _, scope in ipairs({ "session", "batch" }) do
                local reply = send(ctx, captured, decision(record, { decision = "approve_all", approve_all_scope = scope }))
                test.eq(reply.code, "invalid_decision", scope)
            end
            for _, call_id in ipairs({ "call-a", "call-b", "call-c" }) do
                local unchanged = record_of(ctx, batch, call_id)
                test.eq(unchanged.state, "pending", call_id .. ": nothing changed")
                test.eq(unchanged.revision, 1, call_id)
            end
            test.eq(grants_of(ctx.session_id), 0)
            local reply = send(ctx, captured, decision(record, { decision = "approve_all", approve_all_scope = "tool" }))
            test.is_true(reply.success)
            test.eq(#reply.details.approvals, 2)
            test.eq(record_of(ctx, batch, "call-b").state, "approved")
            local outside = record_of(ctx, batch, "call-c")
            test.eq(outside.state, "pending", "a request outside the covered list keeps its card")
            test.eq(outside.revision, 1)
            send(ctx, captured, decision(outside, { decision = "approve" }))
            finish(handle)
            test.eq(launches(op.caller), 3)
        end)

        it("rejects Approve all after the batch fence closed and creates no grant", function()
            for _, case in ipairs({ "steering", "stop" }) do
                local ctx, captured = new_ctx({ live = 1, policy = { approve_all = "tool" } })
                local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
                local handle = start(ctx, op)
                pending(ctx, batch.batch_id, 1)
                local record = record_of(ctx, batch, "call-a")
                if case == "steering" then
                    -- Stored, but the gate has not woken yet: the batch row
                    -- is still open and the request still pending.
                    fx.steer(ctx, true)
                else
                    fx.stop(ctx)
                end
                local reply = send(ctx, captured, decision(record, { decision = "approve_all", approve_all_scope = "tool" }))
                test.eq(reply.code, "approval_not_pending", case)
                test.eq(reply.details.approval.state, case == "steering" and "superseded" or "cancelled", case)
                test.eq(grants_of(ctx.session_id), 0, case .. ": no grant")
                test.eq(assert(approval_repo.get_batch(nil, batch.batch_id)).close_reason, case, case)
                finish(handle)
                test.eq(launches(op.caller), 0, case)
            end
        end)

        it("revokes a grant before the release: its call settles as revoked, receipts stay, a retry replays, another user is refused", function()
            local ctx, captured = new_ctx({ live = 1 })
            local grant = fx.create_tool_grant(ctx, GRANTED)
            local op, batch = round(ctx, {
                { id = "call-g", registry_id = GRANTED, args = { invoice = 7 } },
                { id = "call-m", registry_id = MARKED, args = { n = 1 } },
            })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            test.eq(record_of(ctx, batch, "call-g").decided_via, "grant")
            local reply = send(ctx, captured, revocation(grant), { request_id = "rev-1" })
            test.is_true(reply.success)
            test.eq(reply.details.grant.status, "revoked")
            test.eq(reply.details.grant.revision, 2)
            local replay = send(ctx, captured, revocation(grant), { request_id = "rev-1" })
            test.is_true(replay.success, "the same request_id and body replays")
            test.eq(replay.details.grant.revision, 2)
            test.eq(assert(approval_repo.get_grant(nil, grant.grant_id)).revision, 2, "revoked once")
            test.eq(send(ctx, captured, revocation(grant, 2)).code, "grant_not_found", "already revoked")
            test.eq(send(ctx, captured, revocation(grant), { request_id = "rev-2", sender = "other-user" }).code,
                "forbidden")
            send(ctx, captured, decision(record_of(ctx, batch, "call-m"), { decision = "approve" }), { request_id = "dec-1" })
            local receipt_before = approval_repo.get_receipt(nil, ctx.user_id, ctx.session_id, "dec-1")
            finish(handle)
            test.is_nil(op.caller.launches["call-g"], "the revoked grant no longer lets the call run")
            test.is_true(op.caller.launches["call-m"])
            local audit = record_of(ctx, batch, "call-g")
            test.eq(audit.state, "approved", "the grant decision stays")
            test.eq(audit.decided_via, "grant")
            test.eq(audit.disposition, "not_run")
            test.eq(audit.disposition_reason, "revoked")
            test.eq(row(op.call_message_ids["call-g"]).metadata.result.reason, "revoked")
            local receipt_after = approval_repo.get_receipt(nil, ctx.user_id, ctx.session_id, "dec-1")
            test.eq(receipt_after.body_hash, receipt_before.body_hash, "receipts are immutable")
            test.eq(receipt_after.response.approval.revision, receipt_before.response.approval.revision)

            local later, later_batch = round(ctx, { { id = "call-h", registry_id = GRANTED, args = { invoice = 8 } } })
            local later_handle = start(ctx, later)
            pending(ctx, later_batch.batch_id, 1)
            ctx.approval_wake:notify("finish")
            finish(later_handle)
            test.eq(launches(later.caller), 0, "later calls ask again")
        end)

        it("does not reverse released calls when the revocation commits after the release, also before they launch", function()
            local ctx, captured = new_ctx({ live = 1 })
            local grant = fx.create_tool_grant(ctx, GRANTED)
            local caller = held_caller()
            local op, batch = round(ctx, {
                { id = "call-g", registry_id = GRANTED, args = { invoice = 7 } },
                { id = "call-m", registry_id = MARKED, args = { n = 1 } },
            }, caller)
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            send(ctx, captured, decision(record_of(ctx, batch, "call-m"), { decision = "approve" }))
            caller.entered:receive()
            test.eq(launches(caller), 0, "released, nothing launched yet")
            test.eq(assert(approval_repo.get_batch(nil, batch.batch_id)).state, "released")
            local reply = send(ctx, captured, revocation(grant))
            test.is_true(reply.success)
            caller.go:send(true)
            finish(handle)
            test.is_true(caller.launches["call-g"], "the released call still runs")
            test.is_true(caller.launches["call-m"])
            test.eq(record_of(ctx, batch, "call-g").disposition, "dispatched")
            test.eq(assert(approval_repo.get_grant(nil, grant.grant_id)).status, "revoked")
        end)

        it("settles a batch allowed entirely by a grant as revoked when the revocation commits before the release", function()
            local ctx, captured = new_ctx({ live = 1 })
            local grant = fx.create_tool_grant(ctx, GRANTED)
            local reads = 0
            ctx.reader.get_full_context = function()
                reads = reads + 1
                if reads == 2 then
                    test.is_true(send(ctx, captured, revocation(grant)).success)
                end
                return {}, nil
            end
            local op, batch = round(ctx, { { id = "call-g", registry_id = GRANTED, args = { invoice = 7 } } })
            local result = finish(start(ctx, op))
            test.eq(reads, 2, "the revocation committed between evaluation and release")
            test.eq(launches(op.caller), 0)
            test.eq(record_of(ctx, batch, "call-g").disposition_reason, "revoked")
            test.is_true(fx.has_continue(result), "the turn continues")
        end)

        it("asks again after the tool's deployment changed and never matches another delegation target", function()
            local ctx, captured = new_ctx({ live = 1, policy = { approve_all = "tool", require = "all" } })
            local delegate = function(id: string, target: string): any
                return { id = id, registry_id = fx.DELEGATE, type = consts.MSG_TYPE.DELEGATION,
                    args = { task = "Refund order 7" }, context = { to_agent_id = target } }
            end
            local op, batch = round(ctx, { delegate("call-d", fx.TARGET), { id = "call-a", registry_id = MARKED, args = {} } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 2)
            for _, call_id in ipairs({ "call-d", "call-a" }) do
                local record = record_of(ctx, batch, call_id)
                test.is_true(send(ctx, captured, decision(record, { decision = "approve_all",
                    approve_all_scope = "tool" })).success, call_id)
            end
            finish(handle)
            local grants = assert(approval_repo.list_grants(nil, ctx.session_id))
            test.eq(#grants, 2)

            tool_meta._registry_get = function(id)
                local entry = registry.get(id)
                if id ~= MARKED or not entry then return entry end
                local changed = { id = entry.id, kind = entry.kind, data = entry.data, meta = {} }
                for key, value in pairs(entry.meta or {}) do changed.meta[key] = value end
                changed.meta.description = "Deletes a customer and every invoice."
                return changed
            end
            local next_op, next_batch = round(ctx, { delegate("call-e", fx.TARGET), delegate("call-f", fx.AGENT),
                { id = "call-b", registry_id = MARKED, args = {} } })
            local next_handle = start(ctx, next_op)
            pending(ctx, next_batch.batch_id, 2)
            test.eq(record_of(ctx, next_batch, "call-e").decided_via, "grant", "the recorded target matches")
            test.eq(record_of(ctx, next_batch, "call-f").state, "pending", "another target never matches")
            test.eq(record_of(ctx, next_batch, "call-b").state, "pending", "a changed deployment asks again")
            ctx.approval_wake:notify("finish")
            finish(next_handle)
            test.eq(launches(next_op.caller), 0)
        end)

        it("keeps grants across a new turn and a process restart and ends them on an owner change and deletion; a new session has none", function()
            local ctx, captured = new_ctx({ live = 1, policy = { approve_all = "tool" } })
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            send(ctx, captured, decision(record_of(ctx, batch, "call-a"), { decision = "approve_all",
                approve_all_scope = "tool" }))
            finish(handle)

            -- A new process of the same session, in a new turn.
            local restarted = new_ctx({ live = 1, policy = { approve_all = "tool" }, session_id = ctx.session_id })
            local next_op, next_batch = round(restarted, { { id = "call-b", registry_id = MARKED, args = { n = 2 } } })
            finish(start(restarted, next_op))
            test.is_true(next_op.caller.launches["call-b"], "the grant survives")
            test.eq(record_of(restarted, next_batch, "call-b").decided_via, "grant")

            for _, case in ipairs({
                { name = "an owner change", opts = { session_id = ctx.session_id, user_id = "new-owner" } },
                { name = "a new session", opts = {} },
            }) do
                local opts = case.opts
                opts.live, opts.policy = 1, { approve_all = "tool" }
                local other = new_ctx(opts)
                local other_op, other_batch = round(other, { { id = "call-c", registry_id = MARKED, args = { n = 3 } } })
                local other_handle = start(other, other_op)
                pending(other, other_batch.batch_id, 1)
                other.approval_wake:notify("finish")
                finish(other_handle)
                test.eq(launches(other_op.caller), 0, case.name .. ": the call asks")
            end

            test.eq(grants_of(ctx.session_id), 1)
            assert(session_repo.delete(ctx.session_id))
            test.eq(grants_of(ctx.session_id), 0, "deletion removes the grant with the session")
        end)

        it("restores a grant an agent switch suspended only on a user agent switch, never for a changed deployment", function()
            local ctx = new_ctx({ live = 1, declared = "2026-11-19T10:00:00Z" })
            local granted = fx.create_tool_grant(ctx, GRANTED)
            local changed = fx.create_tool_grant(ctx, MARKED)
            assert(approval_repo.transact(ctx.session_id, function(dbtx)
                return approval_repo.suspend_grant(dbtx, ctx.session_id, changed.grant_id, nil, "deployment_changed")
            end))
            local function status_of(grant: any): string
                return assert(approval_repo.get_grant(nil, grant.grant_id)).status
            end
            local with_trait = { id = fx.AGENT, agent_options = { tool_approval = { schema = 1 } } }
            local without_trait = { id = fx.AGENT, agent_options = {} }
            -- A model-originated switch away and back: activation runs at
            -- the next steps, and nothing restores the grant.
            ctx.agent_ctx = { active_traits = { "other:trait" } }
            assert(activation.apply(ctx, without_trait))
            test.eq(status_of(granted), "suspended")
            ctx.agent_ctx = { active_traits = { activation.TRAIT_ID } }
            assert(activation.apply(ctx, with_trait))
            test.eq(status_of(granted), "suspended", "nothing model-originated restores it")
            -- A user switch to an agent that does not permit it restores nothing.
            ctx.agent_ctx = { active_traits = { "other:trait" } }
            assert(activation.restore_grants(ctx, without_trait))
            test.eq(status_of(granted), "suspended")
            -- A user switch to an agent that permits it.
            ctx.agent_ctx = { active_traits = { activation.TRAIT_ID } }
            assert(activation.restore_grants(ctx, with_trait))
            local restored = assert(approval_repo.get_grant(nil, granted.grant_id))
            test.eq(restored.status, "active")
            test.is_nil(restored.suspension_reason)
            test.eq(status_of(changed), "suspended", "a changed deployment needs a new Approve all")
            assert(activation.apply(ctx, with_trait))
            local op, batch = round(ctx, { { id = "call-g", registry_id = GRANTED, args = { invoice = 7 } } })
            finish(start(ctx, op))
            test.is_true(op.caller.launches["call-g"])
            test.eq(record_of(ctx, batch, "call-g").grant_id, granted.grant_id)
        end)

        it("gives grant authority back through a new Approve all while the suspended grant stays suspended", function()
            local ctx, captured = new_ctx({ live = 1, policy = { approve_all = "tool" } })
            local grant = fx.create_tool_grant(ctx, MARKED)
            assert(approval_repo.transact(ctx.session_id, function(dbtx)
                return approval_repo.suspend_grant(dbtx, ctx.session_id, grant.grant_id, nil, "mode_not_permitted")
            end))
            local op, batch = round(ctx, { { id = "call-a", registry_id = MARKED, args = { n = 1 } } })
            local handle = start(ctx, op)
            pending(ctx, batch.batch_id, 1)
            local reply = send(ctx, captured, decision(record_of(ctx, batch, "call-a"),
                { decision = "approve_all", approve_all_scope = "tool" }))
            finish(handle)
            test.eq(assert(approval_repo.get_grant(nil, grant.grant_id)).status, "suspended", "the old grant stays suspended")
            local next_op, next_batch = round(ctx, { { id = "call-b", registry_id = MARKED, args = { n = 2 } } })
            finish(start(ctx, next_op))
            test.is_true(next_op.caller.launches["call-b"])
            test.eq(record_of(ctx, next_batch, "call-b").grant_id, reply.details.grant.grant_id)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
