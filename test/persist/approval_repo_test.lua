local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local consts = require("consts")
local tx = require("tx")
local approval_repo = require("approval_repo")
local message_repo = require("message_repo")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local wait_for_boot = require("wait_for_boot")

-- The tool approval store (EE2-2710, architecture 4.6): conditional writes,
-- receipts, batch fences, grants, the turn fence, session activity, the
-- create_batch descriptor and session deletion. Runs on SQLite and
-- PostgreSQL (POSTGRES_TEST_FILTER).

local HASH_A = "sha256:" .. string.rep("a", 64)
local HASH_B = "sha256:" .. string.rep("b", 64)

local function count(table_name, session_id)
    local db = assert(sql.get(consts.get_db_resource()))
    local rows, err = db:query("SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE session_id = $1", { session_id })
    db:release()
    if err then error(err) end
    return tonumber(rows[1].n)
end

local function new_session(user_id)
    local context_id = uuid.v7()
    assert(context_repo.create(context_id, "primary", "approval test"))
    local session_id = uuid.v7()
    assert(session_repo.create(session_id, user_id or uuid.v7(), context_id, "Approval test"))
    return session_id
end

-- An assistant row and `n` function call rows, stored through create_batch.
local function store_calls(session_id: string, n: number, descriptor_options: any?): any
    local assistant_id = uuid.v7()
    local rows = { { message_id = assistant_id, type = consts.MSG_TYPE.ASSISTANT, data = "calling tools", metadata = {} } }
    local members = {}
    for index = 1, n do
        local call_row = uuid.v7()
        rows[#rows + 1] = {
            message_id = call_row, type = consts.MSG_TYPE.FUNCTION, data = "{}",
            metadata = { status = "pending", call_id = "call_" .. index, function_name = "delete_customer" },
        }
        members[#members + 1] = call_row
    end
    local descriptor = nil
    if descriptor_options ~= false then
        descriptor = { batch_id = assistant_id, members = members, turn_id = (descriptor_options or {}).turn_id or "turn-1" }
    end
    local ok, err, _, batch = message_repo.create_batch(session_id, rows, descriptor)
    if not ok then error(err) end
    return { batch_id = assistant_id, members = members, rows = rows, batch = batch, descriptor = descriptor }
end

local function request_for(session_id, calls, index, overrides)
    local request = {
        approval_id = uuid.v7(),
        session_id = session_id,
        batch_id = calls.batch_id,
        tool_message_id = calls.members[index],
        row_type = consts.MSG_TYPE.FUNCTION,
        call_id = "call_" .. index,
        registry_id = "app.tools:delete_customer",
        fingerprint = HASH_A,
        intent_digest = HASH_B,
        display = { title = "Delete customer", arguments = { customer_id = "c_" .. index } },
        offered = { decisions = { "approve", "deny" } },
        expires_at = "2099-01-01T00:00:00Z",
    }
    for key, value in pairs(overrides or {}) do request[key] = value end
    return request
end

local function create_request(session_id, calls, index, overrides)
    return tx.run(function(dbtx)
        return approval_repo.create_request(dbtx, request_for(session_id, calls, index, overrides))
    end)
end

local function in_tx(fn: any): (any, any, any)
    local extra = nil
    local result, err = tx.run(function(dbtx)
        local value, fn_err, fn_extra = fn(dbtx)
        if fn_err ~= nil then extra = fn_extra; return nil, fn_err end
        return value
    end)
    return result, err, extra
end

local function define_tests()
    describe("Tool approval store", function()
        before_all(function()
            wait_for_boot.run()
        end)

        describe("create_batch descriptor", function()
            it("behaves as before without a descriptor: no batch, no batch_id", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 2, false)
                test.is_nil(calls.batch)
                test.eq(count("session_tool_approval_batches", session_id), 0)
                for _, member in ipairs(calls.members) do
                    local row = assert(message_repo.get(member))
                    test.is_nil(row.metadata.batch_id)
                    test.eq(row.metadata.status, "pending")
                end
            end)

            it("stores the batch record and stamps batch_id on every member row in the same write", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 3)
                test.not_nil(calls.batch)
                test.eq(calls.batch.batch_id, calls.batch_id)
                test.eq(calls.batch.state, "open")
                test.eq(calls.batch.controls, "kept")
                test.eq(calls.batch.turn_id, "turn-1")
                test.eq(calls.batch.revision, 1)
                test.eq(#calls.batch.members, 3)
                for index, member in ipairs(calls.members) do
                    test.eq(calls.batch.members[index], member)
                    local row = assert(message_repo.get(member))
                    test.eq(row.metadata.batch_id, calls.batch_id)
                    test.eq(row.metadata.call_id, "call_" .. index)
                end
                -- The assistant row is not a member, and the caller's tables are not changed.
                test.is_nil(assert(message_repo.get(calls.batch_id)).metadata.batch_id)
                test.is_nil(calls.rows[2].metadata.batch_id)
            end)

            it("refuses a descriptor that names a row outside the write, and stores nothing", function()
                local session_id = new_session()
                local rows = { { message_id = uuid.v7(), type = consts.MSG_TYPE.FUNCTION, data = "{}", metadata = {} } }
                local ok, err = message_repo.create_batch(session_id, rows,
                    { batch_id = uuid.v7(), members = { uuid.v7() }, turn_id = "turn-1" })
                test.is_nil(ok)
                test.contains(tostring(err), "not a row of this write")
                test.eq(count("messages", session_id), 0)
                test.eq(count("session_tool_approval_batches", session_id), 0)
            end)

            it("creates the batch closed when the Stop fence names its turn", function()
                local session_id = new_session()
                assert(in_tx(function(dbtx) return approval_repo.write_turn_fence(dbtx, session_id, "turn-7", "stop") end))
                local fenced = store_calls(session_id, 1, { turn_id = "turn-7" })
                test.eq(fenced.batch.state, "closed")
                test.eq(fenced.batch.close_reason, "stop")
                test.eq(fenced.batch.controls, "cancelled")
                -- A fence of another turn does not apply.
                local other = store_calls(session_id, 1, { turn_id = "turn-8" })
                test.eq(other.batch.state, "open")
            end)

            it("creates the batch closed when a steering input is pending", function()
                local session_id = new_session()
                assert(message_repo.create_batch(session_id, { {
                    message_id = uuid.v7(), type = consts.MSG_TYPE.USER, data = "stop that",
                    metadata = { input = { state = "pending" } },
                } }))
                local calls = store_calls(session_id, 1)
                test.eq(calls.batch.state, "closed")
                test.eq(calls.batch.close_reason, "steering")
            end)
        end)

        describe("requests and decisions", function()
            it("creates a pending request and reads it back with its projection", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 1)
                local record = assert(create_request(session_id, calls, 1))
                test.eq(record.state, "pending")
                test.eq(record.revision, 1)
                test.eq(record.display.title, "Delete customer")
                test.is_nil(record.decided_via)
                local read = assert(approval_repo.get(nil, record.approval_id))
                test.eq(read.tool_message_id, calls.members[1])
                local by_message = assert(approval_repo.get_by_message(nil, session_id, calls.members[1]))
                test.eq(by_message.approval_id, record.approval_id)
                local projection = approval_repo.projection(read)
                test.eq(projection.approval_id, record.approval_id)
                test.eq(projection.call_id, "call_1")
                test.eq(projection.state, "pending")
                test.is_nil(projection.tool_message_id)
            end)

            it("refuses an approved record that no grant allowed, and a second record for one call", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 1)
                local refused, refused_err = create_request(session_id, calls, 1, { state = "approved", decided_via = "user" })
                test.is_nil(refused)
                test.contains(tostring(refused_err), "grant")
                assert(create_request(session_id, calls, 1))
                local duplicate = create_request(session_id, calls, 1)
                test.is_nil(duplicate)
                test.eq(count("session_tool_approvals", session_id), 1)
            end)

            it("commits one decision; a later one gets not_pending with the committed record", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 1)
                local record = assert(create_request(session_id, calls, 1))
                local decided = assert(in_tx(function(dbtx)
                    return approval_repo.decide(dbtx, session_id, record.approval_id, 1,
                        { state = "approved", decided_via = "user", decided_by = "user-1" })
                end))
                test.eq(decided.state, "approved")
                test.eq(decided.revision, 2)
                test.eq(decided.decided_by, "user-1")
                test.not_nil(decided.decided_at)

                -- Not pending is reported before the stale revision.
                local again, again_err, current = in_tx(function(dbtx)
                    return approval_repo.decide(dbtx, session_id, record.approval_id, 1,
                        { state = "denied", decided_via = "user", ["then"] = "stop" })
                end)
                test.is_nil(again)
                test.is_true(approval_repo.is_conflict(again_err))
                test.eq(approval_repo.conflict_code(again_err), "not_pending")
                test.eq(current.state, "approved")
                test.eq(current.revision, 2)
            end)

            it("refuses a decision with a stale revision and changes nothing", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 1)
                local record = assert(create_request(session_id, calls, 1))
                local result, err, current = in_tx(function(dbtx)
                    return approval_repo.decide(dbtx, session_id, record.approval_id, 5,
                        { state = "approved", decided_via = "user" })
                end)
                test.is_nil(result)
                test.eq(approval_repo.conflict_code(err), "revision")
                test.eq(current.revision, 1)
                local read = assert(approval_repo.get(nil, record.approval_id))
                test.eq(read.state, "pending")
                test.eq(read.revision, 1)
            end)

            it("stores then and reason for a denial and refuses them on an approval", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 2)
                local first = assert(create_request(session_id, calls, 1))
                local second = assert(create_request(session_id, calls, 2))
                local denied = assert(in_tx(function(dbtx)
                    return approval_repo.decide(dbtx, session_id, first.approval_id, 1,
                        { state = "denied", decided_via = "user", ["then"] = "continue", reason = "Use staging." })
                end))
                test.eq(denied["then"], "continue")
                test.eq(denied.reason, "Use staging.")
                local refused, refused_err = in_tx(function(dbtx)
                    return approval_repo.decide(dbtx, session_id, second.approval_id, 1,
                        { state = "approved", decided_via = "user", ["then"] = "stop" })
                end)
                test.is_nil(refused)
                test.contains(tostring(refused_err), "Only a denial")
                local missing_then = in_tx(function(dbtx)
                    return approval_repo.decide(dbtx, session_id, second.approval_id, 1,
                        { state = "denied", decided_via = "user" })
                end)
                test.is_nil(missing_then)
            end)

            it("writes a disposition once, and dispatched only for an approved call", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 1)
                local record = assert(create_request(session_id, calls, 1))
                local early, early_err = in_tx(function(dbtx)
                    return approval_repo.set_disposition(dbtx, session_id, record.approval_id, "dispatched")
                end)
                test.is_nil(early)
                test.eq(approval_repo.conflict_code(early_err), "not_approved")
                assert(in_tx(function(dbtx)
                    return approval_repo.decide(dbtx, session_id, record.approval_id, 1, { state = "approved", decided_via = "user" })
                end))
                local dispatched = assert(in_tx(function(dbtx)
                    return approval_repo.set_disposition(dbtx, session_id, record.approval_id, "dispatched", nil, 2)
                end))
                test.eq(dispatched.disposition, "dispatched")
                test.eq(dispatched.revision, 3)
                local second, second_err, current = in_tx(function(dbtx)
                    return approval_repo.set_disposition(dbtx, session_id, record.approval_id, "not_run", "intent_changed")
                end)
                test.is_nil(second)
                test.eq(approval_repo.conflict_code(second_err), "disposition_set")
                test.eq(current.disposition, "dispatched")
                -- The decision stays as it was.
                test.eq(current.state, "approved")
            end)

            it("rolls back the whole transaction when a step conflicts (transact wrapper)", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 1)
                local result, err, current = approval_repo.transact(session_id, function(dbtx)
                    local created, create_err = approval_repo.create_request(dbtx, request_for(session_id, calls, 1))
                    if not created then return nil, create_err end
                    return approval_repo.decide(dbtx, session_id, created.approval_id, 9,
                        { state = "approved", decided_via = "user" })
                end)
                test.is_nil(result)
                test.eq(approval_repo.conflict_code(err), "revision")
                test.eq(current.revision, 1)
                test.eq(count("session_tool_approvals", session_id), 0)
            end)

            it("reports a missing session as not found", function()
                local result, err = approval_repo.transact(uuid.v7(), function() return true end)
                test.is_nil(result)
                test.is_true(approval_repo.is_not_found(err))
                test.eq(approval_repo.conflict_code(err), "session")
            end)
        end)

        describe("command receipts", function()
            it("replays the same body, refuses another body, and scopes by owner", function()
                local session_id = new_session()
                local response = { request_id = "req-1", success = true, approval = { state = "approved" } }
                assert(in_tx(function(dbtx)
                    return approval_repo.store_receipt(dbtx, {
                        owner_id = "owner-1", session_id = session_id, request_id = "req-1",
                        body_hash = HASH_A, response = response,
                    })
                end))
                local replay = assert(approval_repo.lookup_receipt(nil, "owner-1", session_id, "req-1", HASH_A))
                test.eq(replay.approval.state, "approved")
                test.eq(replay.request_id, "req-1")

                local conflicting, conflict_err, receipt = approval_repo.lookup_receipt(nil, "owner-1", session_id, "req-1", HASH_B)
                test.is_nil(conflicting)
                test.eq(approval_repo.conflict_code(conflict_err), "request_conflict")
                test.eq(receipt.body_hash, HASH_A)

                local other_owner, other_err = approval_repo.lookup_receipt(nil, "owner-2", session_id, "req-1", HASH_A)
                test.is_nil(other_owner)
                test.is_nil(other_err)

                local duplicate = in_tx(function(dbtx)
                    return approval_repo.store_receipt(dbtx, {
                        owner_id = "owner-1", session_id = session_id, request_id = "req-1",
                        body_hash = HASH_B, response = { success = false },
                    })
                end)
                test.is_nil(duplicate)
                local kept = assert(approval_repo.get_receipt(nil, "owner-1", session_id, "req-1"))
                test.eq(kept.body_hash, HASH_A)
            end)

            it("refuses a malformed body hash", function()
                local session_id = new_session()
                local stored, err = in_tx(function(dbtx)
                    return approval_repo.store_receipt(dbtx, {
                        owner_id = "owner-1", session_id = session_id, request_id = "req-2",
                        body_hash = "sha256:XYZ", response = {},
                    })
                end)
                test.is_nil(stored)
                test.contains(tostring(err), "body_hash")
            end)
        end)

        describe("batch fence", function()
            it("closes an open batch: pending requests close, unreleased calls get not_run, decisions stay", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 3)
                local pending = assert(create_request(session_id, calls, 1))
                local approved = assert(create_request(session_id, calls, 2))
                local denied = assert(create_request(session_id, calls, 3))
                assert(in_tx(function(dbtx)
                    return approval_repo.decide(dbtx, session_id, approved.approval_id, 1, { state = "approved", decided_via = "user" })
                end))
                assert(in_tx(function(dbtx)
                    return approval_repo.decide(dbtx, session_id, denied.approval_id, 1,
                        { state = "denied", decided_via = "user", ["then"] = "stop" })
                end))

                local closure = assert(in_tx(function(dbtx)
                    local closed, close_err = approval_repo.close_batch(dbtx, calls.batch_id, "stop_denial")
                    if not closed then return nil, close_err end
                    local again, again_err = approval_repo.close_batch(dbtx, calls.batch_id, "stop_denial")
                    if not again then return nil, again_err end
                    return { batch = closed, repeat_changes = again.changed }
                end))
                local batch = closure.batch
                -- A second closure in the same transaction finds the batch closed and writes nothing.
                test.eq(#closure.repeat_changes, 0)
                test.eq(batch.state, "closed")
                test.eq(batch.close_reason, "stop_denial")
                test.eq(batch.controls, "cancelled")
                test.eq(batch.revision, 2)
                test.not_nil(batch.closed_at)

                local by_id = {}
                for _, record in ipairs(assert(approval_repo.list_by_batch(nil, session_id, calls.batch_id))) do
                    by_id[record.approval_id] = record
                end
                test.eq(by_id[pending.approval_id].state, "cancelled")
                test.eq(by_id[pending.approval_id].decided_via, "system")
                test.eq(by_id[pending.approval_id].disposition, "not_run")
                test.eq(by_id[pending.approval_id].disposition_reason, "batch_stopped")
                test.eq(by_id[approved.approval_id].state, "approved")
                test.eq(by_id[approved.approval_id].disposition, "not_run")
                test.eq(by_id[approved.approval_id].disposition_reason, "batch_stopped")
                test.eq(by_id[denied.approval_id].state, "denied")
                test.eq(by_id[denied.approval_id].disposition_reason, "denied")
            end)

            it("returns the records a closure changed", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 2)
                assert(create_request(session_id, calls, 1))
                assert(create_request(session_id, calls, 2))
                local changed = assert(in_tx(function(dbtx)
                    local closed, close_err = approval_repo.close_batch(dbtx, calls.batch_id, "deadline")
                    if not closed then return nil, close_err end
                    return closed.changed
                end))
                test.eq(#changed, 2)
                for _, record in ipairs(changed) do
                    test.eq(record.state, "expired")
                    test.eq(record.revision, 2)
                end
            end)

            it("closes an open batch that has no request, and keeps the first closure's reason", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 1)
                local closed = assert(in_tx(function(dbtx) return approval_repo.close_batch(dbtx, calls.batch_id, "steering") end))
                test.eq(closed.state, "closed")
                test.eq(closed.close_reason, "steering")
                local again = assert(in_tx(function(dbtx) return approval_repo.close_batch(dbtx, calls.batch_id, "stop") end))
                test.eq(again.close_reason, "steering")
                test.eq(again.revision, closed.revision)
            end)

            it("maps each closure reason to the state of a pending request", function()
                local expected = {
                    stop = "cancelled", steering = "superseded", finish = "interrupted", exit = "interrupted",
                    deadline = "expired", grace = "unavailable", limit = "limited", unavailable = "unavailable",
                }
                local session_id = new_session()
                for reason, state in pairs(expected) do
                    local calls = store_calls(session_id, 1)
                    local record = assert(create_request(session_id, calls, 1))
                    assert(in_tx(function(dbtx) return approval_repo.close_batch(dbtx, calls.batch_id, reason) end))
                    local read = assert(approval_repo.get(nil, record.approval_id))
                    test.eq(read.state, state, reason)
                    test.eq(read.disposition, "not_run", reason)
                end
            end)

            it("refuses release while a request is pending, releases once, and never after closure", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 1)
                local record = assert(create_request(session_id, calls, 1))
                local early, early_err = in_tx(function(dbtx) return approval_repo.release_batch(dbtx, calls.batch_id) end)
                test.is_nil(early)
                test.eq(approval_repo.conflict_code(early_err), "batch_pending")

                assert(in_tx(function(dbtx)
                    return approval_repo.decide(dbtx, session_id, record.approval_id, 1, { state = "approved", decided_via = "user" })
                end))
                local released = assert(in_tx(function(dbtx)
                    local batch, release_err = approval_repo.release_batch(dbtx, calls.batch_id)
                    if not batch then return nil, release_err end
                    local _, disposition_err = approval_repo.set_disposition(dbtx, session_id, record.approval_id, "dispatched")
                    if disposition_err then return nil, disposition_err end
                    return batch
                end))
                test.eq(released.state, "released")
                test.not_nil(released.released_at)

                local second, second_err, current = in_tx(function(dbtx) return approval_repo.release_batch(dbtx, calls.batch_id) end)
                test.is_nil(second)
                test.eq(approval_repo.conflict_code(second_err), "batch_released")
                test.eq(current.state, "released")

                local closed_calls = store_calls(session_id, 1)
                assert(in_tx(function(dbtx) return approval_repo.close_batch(dbtx, closed_calls.batch_id, "finish") end))
                local refused, refused_err = in_tx(function(dbtx) return approval_repo.release_batch(dbtx, closed_calls.batch_id) end)
                test.is_nil(refused)
                test.eq(approval_repo.conflict_code(refused_err), "batch_closed")
            end)

            it("releases a batch with no request (allowed entirely by grants)", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 2)
                local released = assert(in_tx(function(dbtx) return approval_repo.release_batch(dbtx, calls.batch_id) end))
                test.eq(released.state, "released")
            end)

            it("after release: steering and finish change nothing; Stop and exit cancel controls only", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 1)
                local record = assert(create_request(session_id, calls, 1))
                assert(in_tx(function(dbtx)
                    local _, decide_err = approval_repo.decide(dbtx, session_id, record.approval_id, 1, { state = "approved", decided_via = "user" })
                    if decide_err then return nil, decide_err end
                    local batch, release_err = approval_repo.release_batch(dbtx, calls.batch_id)
                    if not batch then return nil, release_err end
                    return approval_repo.set_disposition(dbtx, session_id, record.approval_id, "dispatched")
                end))

                for _, reason in ipairs({ "steering", "finish" }) do
                    local batch = assert(in_tx(function(dbtx) return approval_repo.close_batch(dbtx, calls.batch_id, reason) end))
                    test.eq(batch.state, "released", reason)
                    test.eq(batch.controls, "kept", reason)
                end
                local stopped = assert(in_tx(function(dbtx) return approval_repo.close_batch(dbtx, calls.batch_id, "stop") end))
                test.eq(stopped.state, "released")
                test.eq(stopped.controls, "cancelled")
                local read = assert(approval_repo.get(nil, record.approval_id))
                test.eq(read.disposition, "dispatched")

                local refused, refused_err = in_tx(function(dbtx) return approval_repo.close_batch(dbtx, calls.batch_id, "deadline") end)
                test.is_nil(refused)
                test.eq(approval_repo.conflict_code(refused_err), "batch_released")
            end)

            it("reports a missing batch as not found", function()
                local result, err = in_tx(function(dbtx) return approval_repo.close_batch(dbtx, uuid.v7(), "stop") end)
                test.is_nil(result)
                test.is_true(approval_repo.is_not_found(err))
            end)
        end)

        describe("grants", function()
            it("creates, suspends and revokes a grant with conditional revisions", function()
                local session_id = new_session()
                local grant = assert(in_tx(function(dbtx)
                    return approval_repo.create_grant(dbtx, {
                        grant_id = uuid.v7(), session_id = session_id, owner_id = "owner-1", epoch = "epoch-1",
                        scope = "tool", registry_id = "app.tools:delete_customer", fingerprint = HASH_A,
                        created_by = "owner-1",
                    })
                end))
                test.eq(grant.status, "active")
                test.eq(grant.revision, 1)
                test.eq(#assert(approval_repo.list_grants(nil, session_id)), 1)

                local stale, stale_err = in_tx(function(dbtx)
                    return approval_repo.suspend_grant(dbtx, session_id, grant.grant_id, 4, "agent_mode")
                end)
                test.is_nil(stale)
                test.eq(approval_repo.conflict_code(stale_err), "revision")

                local suspended = assert(in_tx(function(dbtx)
                    return approval_repo.suspend_grant(dbtx, session_id, grant.grant_id, 1, "agent_mode")
                end))
                test.eq(suspended.status, "suspended")
                test.eq(suspended.suspension_reason, "agent_mode")
                test.eq(suspended.revision, 2)

                local revoked = assert(in_tx(function(dbtx)
                    return approval_repo.revoke_grant(dbtx, session_id, grant.grant_id, 2, "owner-1")
                end))
                test.eq(revoked.status, "revoked")
                test.eq(revoked.revoked_by, "owner-1")
                test.eq(#assert(approval_repo.list_grants(nil, session_id)), 0)

                local again, again_err, current = in_tx(function(dbtx)
                    return approval_repo.revoke_grant(dbtx, session_id, grant.grant_id, nil, "owner-1")
                end)
                test.is_nil(again)
                test.eq(approval_repo.conflict_code(again_err), "grant_revoked")
                test.eq(current.status, "revoked")
            end)

            it("needs a manifest for a session grant and keeps grants to their session", function()
                local session_id = new_session()
                local refused = in_tx(function(dbtx)
                    return approval_repo.create_grant(dbtx, {
                        grant_id = uuid.v7(), session_id = session_id, owner_id = "owner-1", epoch = "epoch-1",
                        scope = "session", created_by = "owner-1",
                    })
                end)
                test.is_nil(refused)
                local grant = assert(in_tx(function(dbtx)
                    return approval_repo.create_grant(dbtx, {
                        grant_id = uuid.v7(), session_id = session_id, owner_id = "owner-1", epoch = "epoch-1",
                        scope = "session", created_by = "owner-1",
                        manifest = { { registry_id = "app.tools:a", fingerprint = HASH_A } },
                    })
                end))
                test.eq(grant.manifest[1].registry_id, "app.tools:a")
                local other_session = new_session()
                local foreign, foreign_err = in_tx(function(dbtx)
                    return approval_repo.revoke_grant(dbtx, other_session, grant.grant_id, nil, "owner-1")
                end)
                test.is_nil(foreign)
                test.is_true(approval_repo.is_not_found(foreign_err))
            end)
        end)

        describe("turn fence", function()
            it("is written for one turn, keeps the first reason, and is cleared at admission", function()
                local session_id = new_session()
                test.is_nil(approval_repo.read_turn_fence(nil, session_id))
                local fence = assert(in_tx(function(dbtx) return approval_repo.write_turn_fence(dbtx, session_id, "turn-1", "stop") end))
                test.eq(fence.turn_id, "turn-1")
                test.is_true(fence.written)
                local kept = assert(in_tx(function(dbtx) return approval_repo.write_turn_fence(dbtx, session_id, "turn-1", "finish") end))
                test.eq(kept.reason, "stop")
                test.is_false(kept.written)
                test.eq(assert(approval_repo.read_turn_fence(nil, session_id)).reason, "stop")
                local cleared = assert(in_tx(function(dbtx) return approval_repo.clear_turn_fence(dbtx, session_id) end))
                test.eq(cleared.turn_id, "turn-1")
                test.is_nil(approval_repo.read_turn_fence(nil, session_id))
                local refused = in_tx(function(dbtx) return approval_repo.write_turn_fence(dbtx, session_id, "turn-2", "steering") end)
                test.is_nil(refused)
            end)
        end)

        describe("session activity", function()
            it("is null with revision 0 at first, and session reads project every change", function()
                local user_id = uuid.v7()
                local session_id = new_session(user_id)
                local session = assert(session_repo.get(session_id))
                test.is_nil(session.activity)
                test.eq(session.activity_revision, 0)

                local written = assert(in_tx(function(dbtx)
                    return approval_repo.write_activity(dbtx, session_id,
                        { kind = "awaiting_tool_approval", approval_ids = { "a-1" } }, 0)
                end))
                test.eq(written.revision, 1)
                session = assert(session_repo.get(session_id))
                test.eq(session.activity.kind, "awaiting_tool_approval")
                test.eq(session.activity.approval_ids[1], "a-1")
                test.eq(session.activity_revision, 1)

                local listed = assert(session_repo.list_by_user(user_id))
                test.eq(listed[1].activity.kind, "awaiting_tool_approval")
                test.eq(listed[1].activity_revision, 1)

                local stale, stale_err = in_tx(function(dbtx) return approval_repo.write_activity(dbtx, session_id, nil, 0) end)
                test.is_nil(stale)
                test.eq(approval_repo.conflict_code(stale_err), "revision")

                local cleared = assert(in_tx(function(dbtx) return approval_repo.write_activity(dbtx, session_id, nil, 1) end))
                test.eq(cleared.revision, 2)
                session = assert(session_repo.get(session_id))
                test.is_nil(session.activity)
                test.eq(session.activity_revision, 2)
            end)

            it("is projected by list_by_user_status", function()
                local user_id = uuid.v7()
                local session_id = new_session(user_id)
                assert(session_repo.update_session_meta(session_id, { status = "running" }))
                assert(in_tx(function(dbtx)
                    return approval_repo.write_activity(dbtx, session_id, { kind = "awaiting_tool_approval", approval_ids = {} })
                end))
                local page = assert(session_repo.list_by_user_status(user_id, "running"))
                test.eq(#page.sessions, 1)
                test.eq(page.sessions[1].activity.kind, "awaiting_tool_approval")
                test.eq(page.sessions[1].activity_revision, 1)
            end)
        end)

        describe("row projection writes", function()
            it("merges metadata inside the caller's transaction and refuses another session's row", function()
                local session_id = new_session()
                local calls = store_calls(session_id, 1)
                local updated = assert(in_tx(function(dbtx)
                    return message_repo.update_metadata_tx(dbtx, session_id, calls.members[1], { approval = { state = "pending" } })
                end))
                test.eq(updated.metadata.approval.state, "pending")
                local row = assert(message_repo.get(calls.members[1]))
                test.eq(row.metadata.approval.state, "pending")
                test.eq(row.metadata.status, "pending")
                test.eq(row.metadata.batch_id, calls.batch_id)

                local other = new_session()
                local refused, refused_err = in_tx(function(dbtx)
                    return message_repo.update_metadata_tx(dbtx, other, calls.members[1], { approval = {} })
                end)
                test.is_nil(refused)
                test.contains(tostring(refused_err), "not found")
            end)
        end)

        describe("session deletion", function()
            it("removes the session's approval records, batches, grants and receipts, and only those", function()
                local session_id = new_session()
                local keep_id = new_session()
                for _, id in ipairs({ session_id, keep_id }) do
                    local calls = store_calls(id, 1)
                    assert(create_request(id, calls, 1))
                    assert(in_tx(function(dbtx)
                        local _, grant_err = approval_repo.create_grant(dbtx, {
                            grant_id = uuid.v7(), session_id = id, owner_id = "owner-1", epoch = "epoch-1",
                            scope = "tool", registry_id = "app.tools:x", fingerprint = HASH_A, created_by = "owner-1",
                        })
                        if grant_err then return nil, grant_err end
                        return approval_repo.store_receipt(dbtx, {
                            owner_id = "owner-1", session_id = id, request_id = "req-1", body_hash = HASH_A, response = {},
                        })
                    end))
                end
                for _, name in ipairs({ "session_tool_approvals", "session_tool_approval_batches",
                    "session_tool_approval_grants", "session_command_receipts" }) do
                    test.eq(count(name, session_id), 1, name)
                end

                assert(session_repo.delete(session_id))
                for _, name in ipairs({ "session_tool_approvals", "session_tool_approval_batches",
                    "session_tool_approval_grants", "session_command_receipts", "messages" }) do
                    test.eq(count(name, session_id), 0, name)
                    test.eq(count(name, keep_id) >= 1, true, name .. " of the other session")
                end
            end)
        end)
    end)
end

return test.run_cases(define_tests)
