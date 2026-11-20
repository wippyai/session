local json = require("json")
local uuid = require("uuid")
local consts = require("consts")
local approval_repo = require("approval_repo")
local message_repo = require("message_repo")
local fingerprint = require("fingerprint")
local policy = require("policy")
local tool_meta = require("tool_meta")
local activation = require("activation")
local approval_gate = require("approval_gate")
local events = require("approval_events")
local wake = require("wake")
local logger = require("logger"):named("session.approval.commands")

-- The tool approval commands of the session inbox: a decision
-- (`tool_approval`) and a grant revocation (`tool_approval_grant_revoke`).
-- Wire contract: docs/tool-approval-protocol.md sections 5 to 7.
--
-- They are handled here, in the inbox, and never queued on the command bus,
-- where the approval gate waits. Validation order: body size, the sender
-- (the parent plugin process, with the session owner stamped as
-- sender_user_id by the plugin), then in one transaction with the session
-- row locked: the stored owner, the receipt for request_id, the request or
-- grant, its state, the deadline, the decision fields, the digest and the
-- revision, the batch fence and the current policy, and the writes with the
-- receipt. Only after the commit are the events published, the reply sent
-- and the waiting gate woken.
local commands = {}

commands.MAX_BODY_BYTES = 4096
commands.MAX_REASON_CHARS = 2000

commands.CODE = {
    NOT_FOUND = "approval_not_found",
    NOT_PENDING = "approval_not_pending",
    STALE = "approval_stale",
    EXPIRED = "approval_expired",
    INVALID = "invalid_decision",
    GRANT_NOT_FOUND = "grant_not_found",
    REQUEST_CONFLICT = "request_conflict",
    FORBIDDEN = "forbidden",
}
local CODE = commands.CODE

local MESSAGE = {
    [CODE.NOT_FOUND] = "No such approval request in this session.",
    [CODE.NOT_PENDING] = "This approval was already decided.",
    [CODE.STALE] = "The approval request changed. Review it again.",
    [CODE.EXPIRED] = "The approval request expired.",
    [CODE.INVALID] = "The decision is not valid for this request.",
    [CODE.GRANT_NOT_FOUND] = "No such grant in this session.",
    [CODE.REQUEST_CONFLICT] = "This request_id was used with a different command.",
    [CODE.FORBIDDEN] = "Only the session owner can send this command.",
    [consts.ERROR_CODES.STORAGE_ERROR] = "The command could not be stored. Try again.",
}

local DECISION = consts.COMMANDS.TOOL_APPROVAL
local REVOKE = consts.COMMANDS.TOOL_APPROVAL_GRANT_REVOKE

-- The client fields of each command. The receipt's body hash covers exactly
-- these, so the transport fields (conn_pid, request_id, sender_user_id) never
-- make a retry differ.
local FIELDS = {
    [DECISION] = { "command", "approval_id", "decision", "approve_all_scope", "then", "reason",
        "intent_digest", "expected_revision" },
    [REVOKE] = { "command", "grant_id", "expected_revision" },
}

local STATE = approval_repo.STATE
local SCOPE = policy.SCOPE

local function body_of(payload: any): any
    local body = {}
    for _, key in ipairs(FIELDS[payload.command]) do body[key] = payload[key] end
    return body
end

-- Characters of a UTF-8 string (bytes that do not continue a character).
local function char_count(text: string): number
    local _, count = text:gsub("[^\128-\191]", "")
    return count
end

-- Whether the decision fields fit the request's offer (step 7).
local function valid_fields(data: any, record: any): boolean
    local offered = type(record.offered) == "table" and record.offered or {}
    local decision = data.decision
    local listed = false
    for _, name in ipairs(offered.decisions or {}) do
        if name == decision then listed = true end
    end
    if not listed then return false end
    local reason, after = data.reason, data["then"]
    if decision == "deny" then
        if data.approve_all_scope ~= nil then return false end
        if after == "stop" then return reason == nil end
        if after ~= "continue" or type(reason) ~= "string" then return false end
        local count = char_count(reason)
        return count >= 1 and count <= commands.MAX_REASON_CHARS
    end
    if after ~= nil or reason ~= nil then return false end
    if decision == "approve_all" then
        return type(offered.approve_all) == "table" and data.approve_all_scope == offered.approve_all.scope
    end
    return data.approve_all_scope == nil
end

local function tool_title(registry_id: any): string?
    if type(registry_id) ~= "string" then return nil end
    return tool_meta.title(tool_meta.entry(registry_id), registry_id)
end

local function grant_reply(grant: any): any
    if type(grant) ~= "table" then return nil end
    return events.grant_object(grant, tool_title(grant.registry_id))
end

-- The grant an Approve all of scope tool or session creates. A tool grant
-- takes the request's grant identity; a session grant's manifest is the tool
-- list the card disclosed (display.approve_all_scope.tools).
local function new_grant(ctx: any, record: any, scope: string, sender: string): (any, string?)
    local grant_id, id_err = uuid.v7()
    if not grant_id then return nil, "Failed to generate a grant ID: " .. tostring(id_err) end
    local owner = approval_gate.grant_scope(ctx)
    local grant: any = {
        grant_id = grant_id, session_id = owner.session_id, owner_id = owner.owner_id, epoch = owner.epoch,
        scope = scope, source_approval_id = record.approval_id, created_by = sender,
    }
    if scope == SCOPE.TOOL then
        grant.registry_id = record.registry_id
        grant.fingerprint = record.fingerprint
        grant.target_agent_id = record.target_agent_id
    else
        local disclosed = type(record.display) == "table" and record.display.approve_all_scope or nil
        local manifest = {}
        for _, tool in ipairs(type(disclosed) == "table" and disclosed.tools or {}) do
            manifest[#manifest + 1] = { registry_id = tool.registry_id, fingerprint = tool.fingerprint,
                target_agent_id = tool.target_agent_id }
        end
        grant.manifest = manifest
    end
    return grant, nil
end

-- A decision, in the caller's transaction. Returns { error, approval } for a
-- refusal, { response, records, activity } after the writes, or nil and an
-- error (and the committed record of a conflict).
local function decide(dbtx: any, ctx: any, data: any, sender: string): (any, any, any)
    if type(data.approval_id) ~= "string" or data.approval_id == "" then return { error = CODE.NOT_FOUND } end
    local record, read_err = approval_repo.get(dbtx, data.approval_id)
    if not record then
        if errors.is(read_err, errors.NOT_FOUND) then return { error = CODE.NOT_FOUND } end
        return nil, read_err
    end
    if record.session_id ~= ctx.session_id then return { error = CODE.NOT_FOUND } end
    if record.state ~= STATE.PENDING then return { error = CODE.NOT_PENDING, approval = record } end
    if type(record.expires_at) ~= "string"
        or approval_repo.timestamp(activation.now()) >= record.expires_at then
        return { error = CODE.EXPIRED, approval = record }
    end
    if not valid_fields(data, record) then return { error = CODE.INVALID } end
    if data.intent_digest ~= record.intent_digest or data.expected_revision ~= record.revision then
        return { error = CODE.STALE }
    end

    -- The batch fence. A Stop, finish or stop denial closed the batch in its
    -- own transaction; a stored steering message closes it here, so the
    -- decision (and any grant) is refused with the committed state.
    local batch, batch_err = approval_repo.get_batch(dbtx, record.batch_id)
    if not batch then return nil, batch_err end
    if batch.state ~= approval_repo.BATCH_STATE.OPEN then return { error = CODE.NOT_PENDING, approval = record } end
    local fence, fence_err = approval_repo.close_reason(dbtx, ctx.session_id, batch.turn_id,
        message_repo.has_pending_input, nil)
    if fence_err then return nil, fence_err end
    if fence then
        local closed, close_err = approval_repo.close_batch(dbtx, batch.batch_id, fence)
        if not closed then return nil, close_err end
        local current, current_err = approval_repo.get(dbtx, record.approval_id)
        if not current then return nil, current_err end
        return { error = CODE.NOT_PENDING, approval = current, closed = true }
    end

    -- The current policy must still allow a grant of the offered scope.
    local scope = data.decision == "approve_all" and record.offered.approve_all.scope or nil
    if scope == SCOPE.TOOL or scope == SCOPE.SESSION then
        local effective = ctx.tool_approval_policy
        local entry, entry_err = tool_meta.entry(record.registry_id)
        if entry_err then return nil, entry_err end
        if type(effective) ~= "table" or effective.enforcement ~= "enforce"
            or policy.grant_suspension(effective, { scope = scope }, tool_meta.approve_all(entry)) ~= nil then
            return { error = CODE.INVALID }
        end
    end

    local now = approval_repo.now()
    local changed, grant = {}, nil
    if data.decision == "approve_all" then
        if scope == SCOPE.TOOL or scope == SCOPE.SESSION then
            local built, build_err = new_grant(ctx, record, scope, sender)
            if not built then return nil, build_err end
            local created, create_err = approval_repo.create_grant(dbtx, built)
            if not created then return nil, create_err end
            grant = created
        end
        -- Only the offer's immutable covered list, and only its members that
        -- are still pending.
        for _, approval_id in ipairs(record.offered.approve_all.covers or {}) do
            local covered = record
            if approval_id ~= record.approval_id then
                local found, found_err = approval_repo.get(dbtx, approval_id)
                if not found and not errors.is(found_err, errors.NOT_FOUND) then return nil, found_err end
                covered = found
            end
            if covered and covered.session_id == ctx.session_id and covered.state == STATE.PENDING then
                local decided, decide_err, current = approval_repo.decide(dbtx, ctx.session_id, covered.approval_id,
                    covered.revision, { state = STATE.APPROVED, decided_via = "approve_all",
                        grant_id = grant and grant.grant_id or nil, decided_at = now, decided_by = sender })
                if not decided then return nil, decide_err, current end
                changed[#changed + 1] = decided.approval_id
            end
        end
    else
        local denial = data.decision == "deny"
        local decided, decide_err, current = approval_repo.decide(dbtx, ctx.session_id, record.approval_id,
            record.revision, {
                state = denial and STATE.DENIED or STATE.APPROVED, decided_via = "user",
                ["then"] = denial and data["then"] or nil,
                reason = denial and data["then"] == "continue" and data.reason or nil,
                decided_at = now, decided_by = sender,
            })
        if not decided then return nil, decide_err, current end
        changed[1] = decided.approval_id
        -- A stop denial closes the batch in the same transaction: no call of
        -- it runs.
        if denial and data["then"] == "stop" then
            local closed, close_err = approval_repo.close_batch(dbtx, batch.batch_id, "stop_denial")
            if not closed then return nil, close_err end
        end
    end

    -- The committed records, their row projections and the activity.
    local records, reply_records, latest_clicked = {}, {}, nil
    for _, approval_id in ipairs(changed) do
        local latest, latest_err = approval_repo.get(dbtx, approval_id)
        if not latest then return nil, latest_err end
        local _, row_err = message_repo.update_metadata(latest.tool_message_id,
            { approval = approval_repo.projection(latest) }, ctx.session_id, { tx = dbtx })
        if row_err then return nil, row_err end
        records[#records + 1] = latest
        reply_records[#reply_records + 1] = events.command_record(latest)
        if approval_id == record.approval_id then latest_clicked = latest end
    end
    local batch_records, list_err = approval_repo.list_by_batch(dbtx, ctx.session_id, batch.batch_id)
    if not batch_records then return nil, list_err end
    local pending_ids = {}
    for _, other in ipairs(batch_records) do
        if other.state == STATE.PENDING then pending_ids[#pending_ids + 1] = other.approval_id end
    end
    local activity, activity_err = approval_repo.write_activity(dbtx, ctx.session_id,
        #pending_ids > 0 and { kind = "awaiting_tool_approval", approval_ids = pending_ids } or nil)
    if not activity then return nil, activity_err end
    return {
        response = {
            approval = events.command_record(latest_clicked or record),
            approvals = reply_records,
            grant = grant_reply(grant),
        },
        records = records,
        activity = activity,
    }
end

-- A grant revocation, in the caller's transaction. The release transaction
-- rechecks every grant under the same session lock, so a revocation that
-- commits first keeps the calls it covered from running, and one that
-- commits after a release never reverses it.
local function revoke(dbtx: any, ctx: any, data: any, sender: string): (any, any, any)
    if type(data.grant_id) ~= "string" or data.grant_id == "" then return { error = CODE.GRANT_NOT_FOUND } end
    local grant, read_err = approval_repo.get_grant(dbtx, data.grant_id)
    if not grant then
        if errors.is(read_err, errors.NOT_FOUND) then return { error = CODE.GRANT_NOT_FOUND } end
        return nil, read_err
    end
    if grant.session_id ~= ctx.session_id then return { error = CODE.GRANT_NOT_FOUND } end
    if grant.status == consts.GRANT_STATUS.REVOKED then return { error = CODE.GRANT_NOT_FOUND, grant = grant } end
    if data.expected_revision ~= grant.revision then return { error = CODE.STALE, grant = grant } end
    local revoked, revoke_err, current = approval_repo.revoke_grant(dbtx, ctx.session_id, grant.grant_id,
        grant.revision, sender)
    if not revoked then return nil, revoke_err, current end
    return { response = { grant = grant_reply(revoked) } }
end

-- Replies with an error code and the committed records that go with it.
local function refuse(ctx: any, request_id: any, code: string, outcome: any?)
    local extra = nil
    if type(outcome) == "table" and (outcome.approval or outcome.grant) then
        extra = {
            approval = outcome.approval and events.command_record(outcome.approval) or nil,
            grant = grant_reply(outcome.grant),
        }
    end
    ctx.upstream:command_error(request_id, code, MESSAGE[code] or code, extra)
end

-- The function name of a call row, for its tool_approval event.
local function function_name(record: any): any
    local row = message_repo.get(record.tool_message_id)
    return type(row) == "table" and type(row.metadata) == "table" and row.metadata.function_name or nil
end

-- Handles a tool approval command that reached the session inbox from
-- `from`. Returns false when `payload` is not one, so the caller routes it as
-- before; true when it was handled (answered, or refused).
function commands.handle(ctx: any, from: any, payload: any): boolean
    if type(payload) ~= "table" or FIELDS[payload.command] == nil then return false end
    local request_id = payload.request_id

    -- 1. Body size.
    local encoded = json.encode(payload)
    if type(encoded) ~= "string" or #encoded > commands.MAX_BODY_BYTES then
        refuse(ctx, request_id, CODE.INVALID)
        return true
    end
    -- 2. The sender: only the parent plugin, which stamps the user of its
    -- authenticated relay as sender_user_id, and only the session owner.
    -- Nothing in the client payload counts as identity.
    local sender = payload.sender_user_id
    if from == nil or from ~= ctx.parent_pid or type(sender) ~= "string" or sender == ""
        or sender ~= ctx.user_id then
        logger:warn("tool approval command refused: not from the session owner",
            { session_id = ctx.session_id, from = tostring(from), command = tostring(payload.command) })
        refuse(ctx, request_id, CODE.FORBIDDEN)
        return true
    end
    if type(request_id) ~= "string" or request_id == "" or #request_id > approval_repo.MAX_REQUEST_ID then
        refuse(ctx, request_id, CODE.INVALID)
        return true
    end
    local body_hash = fingerprint.digest(body_of(payload))
    if not body_hash then
        refuse(ctx, request_id, CODE.INVALID)
        return true
    end

    local apply = payload.command == DECISION and decide or revoke
    local outcome, err, current = approval_repo.transact(ctx.session_id, function(dbtx)
        local owner, owner_err = approval_repo.session_owner(dbtx, ctx.session_id)
        if owner_err then return nil, owner_err end
        if owner ~= sender then return { error = CODE.FORBIDDEN } end
        -- 3. The receipt, scoped to the owner and the session.
        local stored, receipt_err = approval_repo.lookup_receipt(dbtx, sender, ctx.session_id, request_id, body_hash)
        if receipt_err then
            if errors.is(receipt_err, errors.CONFLICT) then return { error = CODE.REQUEST_CONFLICT } end
            return nil, receipt_err
        end
        if stored then return { replay = stored } end
        local result, apply_err, apply_current = apply(dbtx, ctx, payload, sender)
        if not result then return nil, apply_err, apply_current end
        if result.response then
            local _, store_err = approval_repo.store_receipt(dbtx, { owner_id = sender, session_id = ctx.session_id,
                request_id = request_id, body_hash = body_hash, response = result.response })
            if store_err then return nil, store_err end
        end
        return result
    end)

    if not outcome then
        local code = approval_repo.conflict_code(err)
        if errors.is(err, errors.NOT_FOUND) and code == "session" then
            refuse(ctx, request_id, CODE.FORBIDDEN)
        elseif errors.is(err, errors.CONFLICT) and code == approval_repo.CONFLICT.NOT_PENDING then
            refuse(ctx, request_id, CODE.NOT_PENDING, { approval = current })
        elseif errors.is(err, errors.CONFLICT) then
            refuse(ctx, request_id, CODE.STALE)
        else
            logger:warn("tool approval command failed", { session_id = ctx.session_id,
                command = tostring(payload.command), error = tostring(err) })
            refuse(ctx, request_id, consts.ERROR_CODES.STORAGE_ERROR)
        end
        return true
    end
    if outcome.replay then
        ctx.upstream:command_success(request_id, outcome.replay)
        return true
    end
    if outcome.error then
        refuse(ctx, request_id, outcome.error, outcome)
        -- A fence closure was committed: the waiting gate settles the batch.
        if outcome.closed then ctx.approval_wake:notify(wake.KIND.DECISION) end
        return true
    end

    local server_now = approval_repo.now()
    for _, record in ipairs(outcome.records or {}) do
        events.publish_record(ctx.upstream, record, function_name(record), server_now)
    end
    events.publish_activity(ctx.upstream, outcome.activity)
    ctx.upstream:command_success(request_id, outcome.response)
    ctx.approval_wake:notify(payload.command == DECISION and wake.KIND.DECISION or wake.KIND.REVOKED)
    return true
end

return commands
