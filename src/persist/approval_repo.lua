local sql = require("sql")
local json = require("json")
local time = require("time")
local tx = require("tx")
local consts = require("consts")
local message_date = require("message_date")

-- Tool approval store: approval requests, batch fences, grants, command
-- receipts, the turn-scoped fence and session activity.
--
-- Transaction contract. Every write helper takes the caller's open
-- transaction (`dbtx`) as its first argument and never starts one: tx.run
-- refuses nesting, and the write must commit together with the caller's other
-- writes (a message insert, a Stop, a decision receipt). The caller takes the
-- session row lock first (approval_repo.transact, or message_date.lock_session
-- in a message transaction), so reads and writes of one session never
-- interleave. Conditional updates check `revision = expected`. Only after the
-- commit does a caller wake the gate.
--
-- Read helpers take a connection or transaction, or nil for a pooled
-- connection.
--
-- Errors. A conflict is returned as (nil, err, current): err is an
-- errors.CONFLICT error whose code (approval_repo.conflict_code) names the
-- conflict, and current is the committed record. A missing row is an
-- errors.NOT_FOUND error. Test with errors.is(err, errors.CONFLICT) or
-- errors.is(err, errors.NOT_FOUND).
local approval_repo = {}

approval_repo.STATE = {
    PENDING = "pending",
    APPROVED = "approved",
    DENIED = "denied",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
    SUPERSEDED = "superseded",
    INTERRUPTED = "interrupted",
    UNAVAILABLE = "unavailable",
    LIMITED = "limited",
}

approval_repo.BATCH_STATE = { OPEN = "open", CLOSED = "closed", RELEASED = "released" }
approval_repo.DISPOSITION = { DISPATCHED = "dispatched", NOT_RUN = "not_run" }
approval_repo.CONTROLS = { KEPT = "kept", CANCELLED = "cancelled" }

-- Conflict codes (approval_repo.conflict_code).
approval_repo.CONFLICT = {
    NOT_PENDING = "not_pending",
    REVISION = "revision",
    DISPOSITION_SET = "disposition_set",
    NOT_APPROVED = "not_approved",
    BATCH_CLOSED = "batch_closed",
    BATCH_RELEASED = "batch_released",
    BATCH_PENDING = "batch_pending",
    GRANT_NOT_ACTIVE = "grant_not_active",
    GRANT_REVOKED = "grant_revoked",
    REQUEST_CONFLICT = "request_conflict",
}

local STATE = approval_repo.STATE
local BATCH = approval_repo.BATCH_STATE
local CONFLICT = approval_repo.CONFLICT

local STATES = {}
for _, state in pairs(STATE) do STATES[state] = true end
local DECIDED_VIA = { user = true, approve_all = true, grant = true, system = true }
local THEN = { stop = true, continue = true }
local ROW_TYPES = { [consts.MSG_TYPE.FUNCTION] = true, [consts.MSG_TYPE.PRIVATE_FUNCTION] = true,
    [consts.MSG_TYPE.DELEGATION] = true }
local FENCE_REASONS = { stop = true, finish = true }

-- What a batch closure does to a request that is still pending, and the
-- disposition reason it records for every call of the batch that has none.
local CLOSE = {
    stop_denial = { state = STATE.CANCELLED, disposition = "batch_stopped" },
    stop = { state = STATE.CANCELLED, disposition = "batch_stopped" },
    steering = { state = STATE.SUPERSEDED, disposition = "superseded" },
    finish = { state = STATE.INTERRUPTED, disposition = "interrupted" },
    exit = { state = STATE.INTERRUPTED, disposition = "interrupted" },
    deleted = { state = STATE.INTERRUPTED, disposition = "deleted" },
    deadline = { state = STATE.EXPIRED, disposition = "expired" },
    grace = { state = STATE.UNAVAILABLE, disposition = "unavailable" },
    limit = { state = STATE.LIMITED, disposition = "limit" },
    unavailable = { state = STATE.UNAVAILABLE, disposition = "unavailable" },
}
approval_repo.CLOSE_REASONS = {}
for reason in pairs(CLOSE) do approval_repo.CLOSE_REASONS[reason] = true end

local APPROVAL_COLUMNS = {
    "approval_id", "session_id", "batch_id", "tool_message_id", "row_type", "call_id",
    "registry_id", "fingerprint", "target_agent_id", "intent_digest", "display", "offered",
    "denial_key", "state", "decided_via", "deny_then", "reason", "grant_id", "disposition",
    "disposition_reason", "revision", "requested_at", "expires_at", "decided_at", "decided_by",
}
local BATCH_COLUMNS = {
    "batch_id", "session_id", "turn_id", "state", "close_reason", "controls",
    "revision", "created_at", "closed_at", "released_at",
}
local GRANT_COLUMNS = {
    "grant_id", "session_id", "owner_id", "epoch", "scope", "registry_id", "fingerprint",
    "target_agent_id", "manifest", "status", "suspension_reason", "source_approval_id",
    "created_by", "created_at", "revoked_by", "revoked_at", "revision",
}

---------------------------------------------------------------------------
-- Errors
---------------------------------------------------------------------------

local function conflict(code: string, message: string)
    return errors.new({ kind = errors.CONFLICT, message = message, details = { code = code } })
end

local function not_found(what: string, id: any)
    return errors.new({
        kind = errors.NOT_FOUND,
        message = what .. " not found: " .. tostring(id),
        details = { code = what },
    })
end

-- The code of a conflict or not-found error ("not_pending", "revision", ...;
-- "session", "approval", "batch", "grant" for a missing row), or nil.
function approval_repo.conflict_code(err: any): string?
    if err == nil or type(err) == "string" then return nil end
    local ok, details = pcall(function() return err:details() end)
    if ok and type(details) == "table" and type(details.code) == "string" then return details.code end
    return nil
end

---------------------------------------------------------------------------
-- Helpers
---------------------------------------------------------------------------

-- The RFC 3339 UTC text of a unix time (whole seconds).
function approval_repo.timestamp(unix: number): string
    return time.unix(math.floor(unix), 0):utc():format(time.RFC3339)
end

function approval_repo.now(): string
    return approval_repo.timestamp(time.now():unix())
end

local function with_connection(conn: any, fn: any): (any, any, any)
    if conn then return fn(conn) end
    local db, err = tx.connect()
    if not db then return nil, err end
    local result, fn_err, extra = fn(db)
    db:release()
    return result, fn_err, extra
end

local function non_empty(value: any): boolean
    return type(value) == "string" and value ~= ""
end

local function encode(value: any): (string?, string?)
    if value == nil then return nil end
    local encoded, err = json.encode(value)
    if err then return nil, "Failed to encode JSON: " .. tostring(err) end
    return encoded
end

local function decode(value: any): any
    if type(value) ~= "string" or value == "" then return nil end
    local decoded, err = json.decode(value)
    if err then return nil end
    return decoded
end

local function exec(query: any, conn: any, what: string): (any, string?)
    local result, err = query:run_with(conn):exec()
    if err then return nil, what .. ": " .. tostring(err) end
    return result
end

local function select_rows(conn: any, query: any, what: string): ({any}?, string?)
    local rows, err = query:run_with(conn):query()
    if err then return nil, what .. ": " .. tostring(err) end
    return rows or {}
end

-- Takes the session row lock in `dbtx`. Returns true, or nil and a
-- NOT_FOUND error (code "session") when the session row is gone.
function approval_repo.lock_session(dbtx: any, session_id: string)
    local ok, err = message_date.lock_session(dbtx, session_id)
    if ok then return true end
    if err == "Session not found" then return nil, not_found("session", session_id) end
    return nil, err
end

---------------------------------------------------------------------------
-- Records
---------------------------------------------------------------------------

local function approval_from_row(row: any): any
    if not row then return nil end
    return {
        approval_id = row.approval_id,
        session_id = row.session_id,
        batch_id = row.batch_id,
        tool_message_id = row.tool_message_id,
        row_type = row.row_type,
        call_id = row.call_id,
        registry_id = row.registry_id,
        fingerprint = row.fingerprint,
        target_agent_id = row.target_agent_id,
        intent_digest = row.intent_digest,
        display = decode(row.display),
        offered = decode(row.offered),
        denial_key = row.denial_key,
        state = row.state,
        decided_via = row.decided_via,
        ["then"] = row.deny_then,
        reason = row.reason,
        grant_id = row.grant_id,
        disposition = row.disposition,
        disposition_reason = row.disposition_reason,
        revision = tonumber(row.revision) or 0,
        requested_at = row.requested_at,
        expires_at = row.expires_at,
        decided_at = row.decided_at,
        decided_by = row.decided_by,
    }
end

local function batch_from_row(row: any): any
    if not row then return nil end
    return {
        batch_id = row.batch_id,
        session_id = row.session_id,
        turn_id = row.turn_id,
        state = row.state,
        close_reason = row.close_reason,
        controls = row.controls,
        revision = tonumber(row.revision) or 0,
        created_at = row.created_at,
        closed_at = row.closed_at,
        released_at = row.released_at,
    }
end

local function grant_from_row(row: any): any
    if not row then return nil end
    return {
        grant_id = row.grant_id,
        session_id = row.session_id,
        owner_id = row.owner_id,
        epoch = row.epoch,
        scope = row.scope,
        registry_id = row.registry_id,
        fingerprint = row.fingerprint,
        target_agent_id = row.target_agent_id,
        manifest = decode(row.manifest),
        status = row.status,
        suspension_reason = row.suspension_reason,
        source_approval_id = row.source_approval_id,
        created_by = row.created_by,
        created_at = row.created_at,
        revoked_by = row.revoked_by,
        revoked_at = row.revoked_at,
        revision = tonumber(row.revision) or 0,
    }
end

-- The row projection stored as metadata.approval on the call row.
function approval_repo.projection(record: any): any
    return {
        approval_id = record.approval_id,
        batch_id = record.batch_id,
        call_id = record.call_id,
        state = record.state,
        decided_via = record.decided_via,
        disposition = record.disposition,
        revision = record.revision,
        ["then"] = record["then"],
        reason = record.reason,
        offered = record.offered,
        intent_digest = record.intent_digest,
        display = record.display,
        requested_at = record.requested_at,
        expires_at = record.expires_at,
        decided_at = record.decided_at,
        grant_id = record.grant_id,
    }
end

local function read_approval(conn: any, session_id: string?, approval_id: string)
    local query = sql.builder.select(table.unpack(APPROVAL_COLUMNS))
        :from("session_tool_approvals"):where("approval_id = ?", approval_id)
    if session_id then query = query:where("session_id = ?", session_id) end
    local rows, err = select_rows(conn, query:limit(1), "Failed to read approval")
    if not rows then return nil, err end
    return approval_from_row(rows[1])
end

local function read_batch(conn: any, batch_id: string)
    local rows, err = select_rows(conn, sql.builder.select(table.unpack(BATCH_COLUMNS))
        :from("session_tool_approval_batches"):where("batch_id = ?", batch_id):limit(1), "Failed to read batch")
    if not rows then return nil, err end
    return batch_from_row(rows[1])
end

local function read_grant(conn: any, session_id: string?, grant_id: string)
    local query = sql.builder.select(table.unpack(GRANT_COLUMNS))
        :from("session_tool_approval_grants"):where("grant_id = ?", grant_id)
    if session_id then query = query:where("session_id = ?", session_id) end
    local rows, err = select_rows(conn, query:limit(1), "Failed to read grant")
    if not rows then return nil, err end
    return grant_from_row(rows[1])
end

local function list_approvals(conn: any, filters: {any})
    local rows, err = select_rows(conn, sql.builder.select(table.unpack(APPROVAL_COLUMNS))
        :from("session_tool_approvals"):where(sql.builder.and_(filters))
        :order_by("requested_at ASC, approval_id ASC"), "Failed to list approvals")
    if not rows then return nil, err end
    local records = {}
    for _, row in ipairs(rows) do records[#records + 1] = approval_from_row(row) end
    return records
end

---------------------------------------------------------------------------
-- Approval requests
---------------------------------------------------------------------------

function approval_repo.get(conn: any, approval_id: string)
    if not non_empty(approval_id) then return nil, "Approval ID is required" end
    return with_connection(conn, function(c)
        local record, err = read_approval(c, nil, approval_id)
        if err then return nil, err end
        if not record then return nil, not_found("approval", approval_id) end
        return record
    end)
end

function approval_repo.list_by_batch(conn: any, session_id: string, batch_id: string)
    return with_connection(conn, function(c)
        return list_approvals(c, {
            sql.builder.expr("session_id = ?", session_id),
            sql.builder.expr("batch_id = ?", batch_id),
        })
    end)
end

-- The batches of the turn `turn_id` (every turn of the session when nil) on
-- `conn`, optionally only those in `states`, in creation order.
local function turn_batches(conn: any, session_id: string, turn_id: string?, states: {string}?): ({any}?, string?)
    local query = sql.builder.select(table.unpack(BATCH_COLUMNS)):from("session_tool_approval_batches")
        :where("session_id = ?", session_id)
    if turn_id ~= nil then query = query:where("turn_id = ?", turn_id) end
    if states then
        local marks = {}
        for _ in ipairs(states) do marks[#marks + 1] = "?" end
        query = query:where("state IN (" .. table.concat(marks, ", ") .. ")", table.unpack(states))
    end
    local rows, err = select_rows(conn, query:order_by("created_at ASC, batch_id ASC"), "Failed to list turn batches")
    if not rows then return nil, err end
    local batches = {}
    for _, row in ipairs(rows) do batches[#batches + 1] = batch_from_row(row) end
    return batches, nil
end

-- The session's batches in `states` (every state when nil), in creation
-- order. Recovery reads the open ones.
function approval_repo.list_batches(conn: any, session_id: string, states: {string}?)
    if not non_empty(session_id) then return nil, "Session ID is required" end
    return with_connection(conn, function(c) return turn_batches(c, session_id, nil, states) end)
end

-- The approval records of every batch of the turn `turn_id` (the batch
-- record's turn_id), in creation order. The gate reads them for the
-- repeated-denial rule and the per-turn request cap.
function approval_repo.list_by_turn(conn: any, session_id: string, turn_id: string)
    if not non_empty(session_id) then return nil, "Session ID is required" end
    if not non_empty(turn_id) then return nil, "Turn ID is required" end
    return with_connection(conn, function(c)
        local batches, batch_err = turn_batches(c, session_id, turn_id)
        if not batches then return nil, batch_err end
        if #batches == 0 then return {} end
        local marks, ids = {}, {}
        for _, row in ipairs(batches) do
            marks[#marks + 1] = "?"
            ids[#ids + 1] = row.batch_id
        end
        local rows, err = select_rows(c, sql.builder.select(table.unpack(APPROVAL_COLUMNS))
            :from("session_tool_approvals"):where("session_id = ?", session_id)
            :where("batch_id IN (" .. table.concat(marks, ", ") .. ")", table.unpack(ids))
            :order_by("requested_at ASC, approval_id ASC"), "Failed to list turn approvals")
        if not rows then return nil, err end
        local records = {}
        for _, row in ipairs(rows) do records[#records + 1] = approval_from_row(row) end
        return records
    end)
end

-- Creates one approval record. A record starts pending, or already decided
-- when no person is asked: approved through a grant (decided_via "grant"),
-- unavailable or limited. Returns the stored record.
function approval_repo.create_request(dbtx: any, request: any)
    if type(request) ~= "table" then return nil, "Approval request is required" end
    for _, key in ipairs({ "approval_id", "session_id", "batch_id", "tool_message_id", "row_type",
        "call_id", "registry_id", "intent_digest" }) do
        if not non_empty(request[key]) then return nil, "Approval request " .. key .. " is required" end
    end
    if not ROW_TYPES[request.row_type] then return nil, "Approval request row_type is invalid" end
    if type(request.display) ~= "table" then return nil, "Approval request display is required" end
    local state = request.state or STATE.PENDING
    if state == STATE.APPROVED then
        if request.decided_via ~= "grant" or not non_empty(request.grant_id) then
            return nil, "An approval created approved must come from a grant"
        end
    elseif state == STATE.PENDING then
        if not non_empty(request.expires_at) then return nil, "A pending approval needs expires_at" end
        if request.decided_via ~= nil then return nil, "A pending approval has no decided_via" end
    elseif state ~= STATE.UNAVAILABLE and state ~= STATE.LIMITED then
        return nil, "Approval requests are created pending, approved by a grant, unavailable or limited"
    end

    local display, display_err = encode(request.display)
    if display_err then return nil, display_err end
    local offered, offered_err = encode(request.offered)
    if offered_err then return nil, offered_err end


    local now = approval_repo.now()
    local decided_via = request.decided_via
    if decided_via == nil and state ~= STATE.PENDING then decided_via = "system" end
    local _, insert_err = exec(sql.builder.insert("session_tool_approvals"):set_map({
        approval_id = request.approval_id,
        session_id = request.session_id,
        batch_id = request.batch_id,
        tool_message_id = request.tool_message_id,
        row_type = request.row_type,
        call_id = request.call_id,
        registry_id = request.registry_id,
        fingerprint = request.fingerprint,
        target_agent_id = request.target_agent_id,
        intent_digest = request.intent_digest,
        display = display,
        offered = offered,
        denial_key = request.denial_key,
        state = state,
        decided_via = decided_via,
        grant_id = request.grant_id,
        revision = 1,
        requested_at = request.requested_at or now,
        expires_at = request.expires_at,
        decided_at = state ~= STATE.PENDING and (request.decided_at or now) or nil,
        decided_by = request.decided_by,
    }), dbtx, "Failed to create approval")
    if insert_err then return nil, insert_err end
    return read_approval(dbtx, request.session_id, request.approval_id)
end

-- Commits a decision on a pending request: moves it from pending to a
-- terminal state with revision + 1. decision = { state, decided_via, then,
-- reason, grant_id, decided_at, decided_by }. A request that is not pending
-- is reported before a revision mismatch, so a competing
-- decision always gets the committed state.
function approval_repo.decide(dbtx: any, session_id: string, approval_id: string, expected_revision: number, decision: any)
    if type(decision) ~= "table" then return nil, "Decision is required" end
    if type(expected_revision) ~= "number" then return nil, "Expected revision is required" end
    local state = decision.state
    if state == STATE.PENDING or not STATES[state] then
        return nil, "Decision state must be a terminal state"
    end
    if not DECIDED_VIA[decision.decided_via] then return nil, "Decision decided_via is invalid" end
    if state == STATE.DENIED then
        if not THEN[decision["then"]] then return nil, "A denial needs then = stop or continue" end
    elseif decision["then"] ~= nil or decision.reason ~= nil then
        return nil, "Only a denial takes then and reason"
    end

    local current, read_err = read_approval(dbtx, session_id, approval_id)
    if read_err then return nil, read_err end
    if not current then return nil, not_found("approval", approval_id) end
    if current.state ~= STATE.PENDING then
        return nil, conflict(CONFLICT.NOT_PENDING, "Approval is not pending"), current
    end
    if current.revision ~= expected_revision then
        return nil, conflict(CONFLICT.REVISION, "Approval revision changed"), current
    end

    local update = sql.builder.update("session_tool_approvals")
        :set("state", state)
        :set("decided_via", decision.decided_via)
        :set("decided_at", decision.decided_at or approval_repo.now())
        :set("revision", current.revision + 1)
    if decision["then"] ~= nil then update = update:set("deny_then", decision["then"]) end
    if decision.reason ~= nil then update = update:set("reason", decision.reason) end
    if decision.grant_id ~= nil then update = update:set("grant_id", decision.grant_id) end
    if decision.decided_by ~= nil then update = update:set("decided_by", decision.decided_by) end
    local result, update_err = exec(update
        :where("approval_id = ?", approval_id):where("session_id = ?", session_id)
        :where("state = ?", STATE.PENDING):where("revision = ?", expected_revision),
        dbtx, "Failed to decide approval")
    if update_err then return nil, update_err end
    if not result or result.rows_affected ~= 1 then
        local latest = read_approval(dbtx, session_id, approval_id)
        return nil, conflict(CONFLICT.REVISION, "Approval changed during the decision"), latest
    end
    return read_approval(dbtx, session_id, approval_id)
end

-- Records whether the call ran. Written once; `dispatched` only for an
-- approved request. expected_revision is optional.
function approval_repo.set_disposition(dbtx: any, session_id: string, approval_id: string,
                                       disposition: string, reason: string?, expected_revision: number?)
    if disposition ~= approval_repo.DISPOSITION.DISPATCHED and disposition ~= approval_repo.DISPOSITION.NOT_RUN then
        return nil, "Disposition must be dispatched or not_run"
    end
    local current, read_err = read_approval(dbtx, session_id, approval_id)
    if read_err then return nil, read_err end
    if not current then return nil, not_found("approval", approval_id) end
    if current.disposition ~= nil then
        return nil, conflict(CONFLICT.DISPOSITION_SET, "Disposition already written"), current
    end
    if expected_revision ~= nil and current.revision ~= expected_revision then
        return nil, conflict(CONFLICT.REVISION, "Approval revision changed"), current
    end
    if disposition == approval_repo.DISPOSITION.DISPATCHED and current.state ~= STATE.APPROVED then
        return nil, conflict(CONFLICT.NOT_APPROVED, "Only an approved call can be dispatched"), current
    end
    local update = sql.builder.update("session_tool_approvals")
        :set("disposition", disposition)
        :set("revision", current.revision + 1)
    if reason ~= nil then update = update:set("disposition_reason", reason) end
    local result, update_err = exec(update
        :where("approval_id = ?", approval_id):where("session_id = ?", session_id)
        :where("revision = ?", current.revision):where("disposition IS NULL"),
        dbtx, "Failed to write disposition")
    if update_err then return nil, update_err end
    if not result or result.rows_affected ~= 1 then
        local latest = read_approval(dbtx, session_id, approval_id)
        return nil, conflict(CONFLICT.REVISION, "Approval changed during the disposition write"), latest
    end
    return read_approval(dbtx, session_id, approval_id)
end

---------------------------------------------------------------------------
-- Command receipts
---------------------------------------------------------------------------

-- The longest request_id a receipt keeps.
approval_repo.MAX_REQUEST_ID = 160

local function valid_hash(value: any): boolean
    return type(value) == "string" and #value == 71 and value:match("^sha256:[a-f0-9]+$") ~= nil
end

function approval_repo.get_receipt(conn: any, owner_id: string, session_id: string, request_id: string)
    return with_connection(conn, function(c)
        local rows, err = select_rows(c, sql.builder.select("owner_id", "session_id", "request_id", "body_hash",
                "response", "created_at")
            :from("session_command_receipts")
            :where("owner_id = ?", owner_id):where("session_id = ?", session_id)
            :where("request_id = ?", request_id):limit(1), "Failed to read receipt")
        if not rows then return nil, err end
        local row = rows[1]
        if not row then return nil end
        return {
            owner_id = row.owner_id,
            session_id = row.session_id,
            request_id = row.request_id,
            body_hash = row.body_hash,
            response = decode(row.response),
            created_at = row.created_at,
        }
    end)
end

-- Receipt lookup for a command. Returns the stored response when
-- the same request_id came with the same body hash; nil when there is no
-- receipt; (nil, request_conflict, receipt) when the body differs.
function approval_repo.lookup_receipt(conn: any, owner_id: string, session_id: string, request_id: string, body_hash: string)
    local receipt, err = approval_repo.get_receipt(conn, owner_id, session_id, request_id)
    if err then return nil, err end
    if not receipt then return nil end
    if receipt.body_hash ~= body_hash then
        return nil, conflict(CONFLICT.REQUEST_CONFLICT, "request_id was used with a different body"), receipt
    end
    return receipt.response
end

-- Stores the response of a committed command. A second receipt for the same
-- (owner_id, session_id, request_id) fails the insert, and so the caller's
-- transaction.
function approval_repo.store_receipt(dbtx: any, receipt: any)
    if type(receipt) ~= "table" then return nil, "Receipt is required" end
    for _, key in ipairs({ "owner_id", "session_id", "request_id" }) do
        if not non_empty(receipt[key]) then return nil, "Receipt " .. key .. " is required" end
    end
    if #receipt.request_id > approval_repo.MAX_REQUEST_ID then return nil, "Receipt request_id is too long" end
    if not valid_hash(receipt.body_hash) then return nil, "Receipt body_hash must be sha256:<64 hex>" end
    if type(receipt.response) ~= "table" then return nil, "Receipt response is required" end
    local response, encode_err = encode(receipt.response)
    if encode_err then return nil, encode_err end
    local _, insert_err = exec(sql.builder.insert("session_command_receipts"):set_map({
        owner_id = receipt.owner_id,
        session_id = receipt.session_id,
        request_id = receipt.request_id,
        body_hash = receipt.body_hash,
        response = response,
        created_at = approval_repo.now(),
    }), dbtx, "Failed to store receipt")
    if insert_err then return nil, insert_err end
    return true
end

---------------------------------------------------------------------------
-- Grants
---------------------------------------------------------------------------

function approval_repo.get_grant(conn: any, grant_id: string)
    return with_connection(conn, function(c)
        local grant, err = read_grant(c, nil, grant_id)
        if err then return nil, err end
        if not grant then return nil, not_found("grant", grant_id) end
        return grant
    end)
end

-- The session's grants in creation order. statuses defaults to active and
-- suspended (revoked grants never match again).
function approval_repo.list_grants(conn: any, session_id: string, statuses: {string}?)
    statuses = statuses or { consts.GRANT_STATUS.ACTIVE, consts.GRANT_STATUS.SUSPENDED }
    return with_connection(conn, function(c)
        local marks = {}
        for _ in ipairs(statuses) do marks[#marks + 1] = "?" end
        local rows, err = select_rows(c, sql.builder.select(table.unpack(GRANT_COLUMNS))
            :from("session_tool_approval_grants")
            :where("session_id = ?", session_id)
            :where("status IN (" .. table.concat(marks, ", ") .. ")", table.unpack(statuses))
            :order_by("created_at ASC, grant_id ASC"), "Failed to list grants")
        if not rows then return nil, err end
        local grants = {}
        for _, row in ipairs(rows) do grants[#grants + 1] = grant_from_row(row) end
        return grants
    end)
end

-- Creates an active grant. Scope `tool` needs registry_id and fingerprint
-- (and target_agent_id for a delegation grant); scope `session` needs the
-- manifest of eligible tool identities.
function approval_repo.create_grant(dbtx: any, grant: any)
    if type(grant) ~= "table" then return nil, "Grant is required" end
    for _, key in ipairs({ "grant_id", "session_id", "owner_id", "epoch", "created_by" }) do
        if not non_empty(grant[key]) then return nil, "Grant " .. key .. " is required" end
    end
    if grant.scope == "tool" then
        if not non_empty(grant.registry_id) or not non_empty(grant.fingerprint) then
            return nil, "A tool grant needs registry_id and fingerprint"
        end
    elseif grant.scope == "session" then
        if type(grant.manifest) ~= "table" or next(grant.manifest) == nil then
            return nil, "A session grant needs a manifest"
        end
    else
        return nil, "Grant scope must be tool or session"
    end
    local manifest, encode_err = encode(grant.manifest)
    if encode_err then return nil, encode_err end
    local _, insert_err = exec(sql.builder.insert("session_tool_approval_grants"):set_map({
        grant_id = grant.grant_id,
        session_id = grant.session_id,
        owner_id = grant.owner_id,
        epoch = grant.epoch,
        scope = grant.scope,
        registry_id = grant.registry_id,
        fingerprint = grant.fingerprint,
        target_agent_id = grant.target_agent_id,
        manifest = manifest,
        status = consts.GRANT_STATUS.ACTIVE,
        source_approval_id = grant.source_approval_id,
        created_by = grant.created_by,
        created_at = grant.created_at or approval_repo.now(),
        revision = 1,
    }), dbtx, "Failed to create grant")
    if insert_err then return nil, insert_err end
    return read_grant(dbtx, grant.session_id, grant.grant_id)
end

local function change_grant(dbtx: any, session_id: string, grant_id: string, expected_revision: number?,
                            allowed: {[string]: boolean}, refused_code: string, changes: {[string]: any})
    local current, read_err = read_grant(dbtx, session_id, grant_id)
    if read_err then return nil, read_err end
    if not current then return nil, not_found("grant", grant_id) end
    if not allowed[current.status] then
        return nil, conflict(refused_code, "Grant is " .. tostring(current.status)), current
    end
    if expected_revision ~= nil and current.revision ~= expected_revision then
        return nil, conflict(CONFLICT.REVISION, "Grant revision changed"), current
    end
    local update = sql.builder.update("session_tool_approval_grants"):set("revision", current.revision + 1)
    for key, value in pairs(changes) do update = update:set(key, value) end
    local result, update_err = exec(update:where("grant_id = ?", grant_id):where("session_id = ?", session_id)
        :where("revision = ?", current.revision), dbtx, "Failed to update grant")
    if update_err then return nil, update_err end
    if not result or result.rows_affected ~= 1 then
        local latest = read_grant(dbtx, session_id, grant_id)
        return nil, conflict(CONFLICT.REVISION, "Grant changed during the update"), latest
    end
    return read_grant(dbtx, session_id, grant_id)
end

-- active -> suspended (a stricter agent mode suspends a grant).
function approval_repo.suspend_grant(dbtx: any, session_id: string, grant_id: string, expected_revision: number?, reason: string)
    if not non_empty(reason) then return nil, "Suspension reason is required" end
    return change_grant(dbtx, session_id, grant_id, expected_revision,
        { active = true }, CONFLICT.GRANT_NOT_ACTIVE,
        { status = consts.GRANT_STATUS.SUSPENDED, suspension_reason = reason })
end

-- Suspends every { grant_id, reason } of `list` that is still active; a grant
-- that is no longer active is left as it is. Returns true.
function approval_repo.suspend_grants(dbtx: any, session_id: string, list: {any}?)
    for _, item in ipairs(list or {}) do
        local _, err = approval_repo.suspend_grant(dbtx, session_id, item.grant_id, nil, item.reason)
        if err and not errors.is(err, errors.CONFLICT) then return nil, err end
    end
    return true
end

-- suspended -> active (an authenticated user action restores a grant).
function approval_repo.restore_grant(dbtx: any, session_id: string, grant_id: string, expected_revision: number?)
    return change_grant(dbtx, session_id, grant_id, expected_revision,
        { suspended = true }, CONFLICT.GRANT_NOT_ACTIVE,
        { status = consts.GRANT_STATUS.ACTIVE, suspension_reason = sql.builder.expr("NULL") })
end

-- active or suspended -> revoked. A revoked grant never matches again.
function approval_repo.revoke_grant(dbtx: any, session_id: string, grant_id: string, expected_revision: number?, revoked_by: string)
    if not non_empty(revoked_by) then return nil, "revoked_by is required" end
    return change_grant(dbtx, session_id, grant_id, expected_revision,
        { active = true, suspended = true }, CONFLICT.GRANT_REVOKED,
        { status = consts.GRANT_STATUS.REVOKED, revoked_by = revoked_by, revoked_at = approval_repo.now() })
end

---------------------------------------------------------------------------
-- Turn fence (sessions.approval_turn_fence)
---------------------------------------------------------------------------

local function read_session_column(conn: any, session_id: string, column: string)
    local rows, err = select_rows(conn, sql.builder.select(column):from("sessions")
        :where("session_id = ?", session_id):limit(1), "Failed to read session")
    if not rows then return nil, err end
    if #rows == 0 then return nil, not_found("session", session_id) end
    return rows[1]
end

-- The owner (sessions.user_id) of the session, or nil and a NOT_FOUND error
-- (code "session").
function approval_repo.session_owner(conn: any, session_id: string)
    return with_connection(conn, function(c)
        local row, err = read_session_column(c, session_id, "user_id")
        if not row then return nil, err end
        return row.user_id
    end)
end

-- The stored activation (config.tool_approval) of the session, or nil when
-- it was never protected; nil and a NOT_FOUND error (code "session") when the
-- session is gone, or nil and an error when the config can't be read.
function approval_repo.read_activation(conn: any, session_id: string)
    return with_connection(conn, function(c)
        local row, err = read_session_column(c, session_id, "config")
        if not row then return nil, err end
        if type(row.config) ~= "string" or row.config == "" then return nil end
        local config, decode_err = json.decode(row.config)
        if decode_err or type(config) ~= "table" then return nil, "Stored session config is not a JSON object" end
        return config.tool_approval
    end)
end

-- The turn-scoped Stop or finish fence { turn_id, reason }, or nil.
function approval_repo.read_turn_fence(conn: any, session_id: string)
    return with_connection(conn, function(c)
        local row, err = read_session_column(c, session_id, "approval_turn_fence")
        if not row then return nil, err end
        return decode(row.approval_turn_fence)
    end)
end

-- Persists the fence for `turn_id` (reason `stop` or `finish`). A fence that
-- already names the same turn is kept, except that a Stop replaces a finish:
-- stop is the stronger reason, and a finish that is taken back clears only
-- its own fence. Returns { turn_id, reason, written } for the fence in force;
-- written is false when the earlier fence of the turn was kept.
function approval_repo.write_turn_fence(dbtx: any, session_id: string, turn_id: string, reason: string)
    if not non_empty(turn_id) then return nil, "Turn ID is required" end
    if not FENCE_REASONS[reason] then return nil, "Turn fence reason must be stop or finish" end
    local current, read_err = approval_repo.read_turn_fence(dbtx, session_id)
    if read_err then return nil, read_err end
    if type(current) == "table" and current.turn_id == turn_id
        and (current.reason == reason or current.reason == "stop") then
        return { turn_id = current.turn_id, reason = current.reason, written = false }
    end
    local encoded, encode_err = encode({ turn_id = turn_id, reason = reason })
    if encode_err then return nil, encode_err end
    local _, update_err = exec(sql.builder.update("sessions"):set("approval_turn_fence", encoded)
        :where("session_id = ?", session_id), dbtx, "Failed to write turn fence")
    if update_err then return nil, update_err end
    return { turn_id = turn_id, reason = reason, written = true }
end

-- Clears the fence. With `turn_id` and `reason`, only a fence that names that
-- turn with that reason (a finish taken back clears its own fence). Returns
-- the cleared fence, or nil when none was cleared.
function approval_repo.clear_turn_fence(dbtx: any, session_id: string, turn_id: string?, reason: string?)
    local current, read_err = approval_repo.read_turn_fence(dbtx, session_id)
    if read_err then return nil, read_err end
    if type(current) ~= "table" then return nil end
    if turn_id ~= nil and (current.turn_id ~= turn_id or current.reason ~= reason) then return nil end
    local _, update_err = exec(sql.builder.update("sessions"):set("approval_turn_fence", sql.builder.expr("NULL"))
        :where("session_id = ?", session_id), dbtx, "Failed to clear turn fence")
    if update_err then return nil, update_err end
    return current
end

---------------------------------------------------------------------------
-- Session activity (sessions.activity, sessions.activity_revision)
---------------------------------------------------------------------------

-- Returns { activity (or nil), revision }, or nil and an error.
local function read_activity(conn: any, session_id: string)
    return with_connection(conn, function(c)
        local rows, err = select_rows(c, sql.builder.select("activity", "activity_revision"):from("sessions")
            :where("session_id = ?", session_id):limit(1), "Failed to read session activity")
        if not rows then return nil, err end
        if #rows == 0 then return nil, not_found("session", session_id) end
        return { activity = decode(rows[1].activity), revision = tonumber(rows[1].activity_revision) or 0 }
    end)
end

approval_repo.read_activity = read_activity

-- Sets the activity (a table with `kind`, or nil to clear) and moves
-- activity_revision up by one. expected_revision is optional. Returns
-- { activity, revision }.
function approval_repo.write_activity(dbtx: any, session_id: string, activity: any, expected_revision: number?)
    if activity ~= nil and (type(activity) ~= "table" or not non_empty(activity.kind)) then
        return nil, "Activity must be nil or a table with kind"
    end
    local encoded, encode_err = encode(activity)
    if encode_err then return nil, encode_err end
    local current, read_err = read_activity(dbtx, session_id)
    if not current then return nil, read_err end
    if expected_revision ~= nil and current.revision ~= expected_revision then
        return nil, conflict(CONFLICT.REVISION, "Activity revision changed"), current
    end
    local next_revision = current.revision + 1
    local value: any = encoded
    if encoded == nil then value = sql.builder.expr("NULL") end
    local _, update_err = exec(sql.builder.update("sessions"):set("activity", value)
        :set("activity_revision", next_revision)
        :where("session_id = ?", session_id):where("activity_revision = ?", current.revision),
        dbtx, "Failed to write session activity")
    if update_err then return nil, update_err end
    return { activity = activity, revision = next_revision }
end

---------------------------------------------------------------------------
-- Batches (the batch fence)
---------------------------------------------------------------------------

-- Why an open batch of the turn `turn_id` must close, or nil: the turn's Stop
-- or finish fence, then a steering input stored as pending
-- (pending_input(conn, session_id), message_repo.has_pending_input), then a
-- stop denial among `records`.
function approval_repo.close_reason(conn: any, session_id: string, turn_id: string?, pending_input: any,
                                    records: {any}?): (string?, any)
    local fence, fence_err = approval_repo.read_turn_fence(conn, session_id)
    if fence_err then return nil, fence_err end
    if type(fence) == "table" and turn_id ~= nil and fence.turn_id == turn_id then return fence.reason, nil end
    local steering, steering_err = pending_input(conn, session_id)
    if steering_err then return nil, steering_err end
    if steering then return "steering", nil end
    for _, record in ipairs(records or {}) do
        if record.state == STATE.DENIED and record["then"] == "stop" then return "stop_denial", nil end
    end
    return nil, nil
end

-- Validates a batch descriptor { batch_id, members, turn_id? }. member_ids,
-- when given, is the set of row IDs the same write inserts.
function approval_repo.validate_descriptor(descriptor: any, member_ids: {[string]: boolean}?)
    if type(descriptor) ~= "table" then return nil, "Batch descriptor must be a table" end
    if not non_empty(descriptor.batch_id) then return nil, "Batch descriptor batch_id is required" end
    if descriptor.turn_id ~= nil and not non_empty(descriptor.turn_id) then
        return nil, "Batch descriptor turn_id must be a non-empty string"
    end
    if type(descriptor.members) ~= "table" or #descriptor.members == 0 then
        return nil, "Batch descriptor members are required"
    end
    local seen = {}
    for _, member in ipairs(descriptor.members) do
        if not non_empty(member) then return nil, "Batch descriptor member IDs must be strings" end
        if seen[member] then return nil, "Batch descriptor lists a member twice: " .. member end
        if member_ids and not member_ids[member] then
            return nil, "Batch member is not a row of this write: " .. member
        end
        seen[member] = true
    end
    return true
end

-- Writes the batch record inside the call-and-batch transaction
-- (message_repo.create_batch). The batch is created already closed when an
-- earlier closure applies (approval_repo.close_reason). Returns the stored
-- batch.
function approval_repo.create_batch_record(dbtx: any, session_id: string, descriptor: any, pending_input: any)
    local close_reason, reason_err = approval_repo.close_reason(dbtx, session_id, descriptor.turn_id, pending_input)
    if reason_err then return nil, reason_err end
    local now = approval_repo.now()
    local _, insert_err = exec(sql.builder.insert("session_tool_approval_batches"):set_map({
        batch_id = descriptor.batch_id,
        session_id = session_id,
        turn_id = descriptor.turn_id,
        state = close_reason and BATCH.CLOSED or BATCH.OPEN,
        close_reason = close_reason,
        controls = close_reason and approval_repo.CONTROLS.CANCELLED or approval_repo.CONTROLS.KEPT,
        revision = 1,
        created_at = now,
        closed_at = close_reason and now or nil,
    }), dbtx, "Failed to create batch")
    if insert_err then return nil, insert_err end
    return read_batch(dbtx, descriptor.batch_id)
end

-- A Stop or finish of the turn `turn_id`: writes the turn fence (a Stop
-- replaces a finish of the same turn; otherwise the first reason stays) and
-- closes the turn's batches with `reason`
-- (close_batch: an open batch closes; a released one has its controls
-- cancelled by a Stop and keeps them for a finish). Runs in the caller's
-- transaction. Returns true.
function approval_repo.fence_turn(dbtx: any, session_id: string, turn_id: string, reason: string)
    local _, fence_err = approval_repo.write_turn_fence(dbtx, session_id, turn_id, reason)
    if fence_err then return nil, fence_err end
    local batches, list_err = turn_batches(dbtx, session_id, turn_id, { BATCH.OPEN, BATCH.RELEASED })
    if not batches then return nil, list_err end
    for _, batch in ipairs(batches) do
        local closed, close_err = approval_repo.close_batch(dbtx, batch.batch_id, reason)
        if not closed then return nil, close_err end
    end
    return true
end

function approval_repo.get_batch(conn: any, batch_id: string)
    return with_connection(conn, function(c)
        local batch, err = read_batch(c, batch_id)
        if err then return nil, err end
        if not batch then return nil, not_found("batch", batch_id) end
        return batch
    end)
end

local function update_batch(dbtx: any, batch: any, changes: {[string]: any})
    local update = sql.builder.update("session_tool_approval_batches"):set("revision", batch.revision + 1)
    for key, value in pairs(changes) do update = update:set(key, value) end
    local result, update_err = exec(update:where("batch_id = ?", batch.batch_id)
        :where("revision = ?", batch.revision), dbtx, "Failed to update batch")
    if update_err then return nil, update_err end
    if not result or result.rows_affected ~= 1 then
        local latest = read_batch(dbtx, batch.batch_id)
        return nil, conflict(CONFLICT.REVISION, "Batch changed during the update"), latest
    end
    return read_batch(dbtx, batch.batch_id)
end

-- Closes a batch. Returns the batch record.
--
-- Open batch: the batch becomes closed with `reason` and controls
-- "cancelled", even when no request is still pending. Pending requests take
-- the closure's state (stop and stop_denial: cancelled, steering: superseded,
-- finish, exit, deleted: interrupted, deadline: expired, grace and
-- unavailable: unavailable, limit: limited). Every record without a
-- disposition gets disposition not_run; terminal decisions do not change.
-- Released batch: steering, finish and deleted change nothing; stop and exit
-- set controls "cancelled" and keep every disposition; other reasons are
-- refused (batch_released). Closed batch: nothing changes; the first
-- closure's reason stays.
function approval_repo.close_batch(dbtx: any, batch_id: string, reason: string)
    local close = CLOSE[reason]
    if not close then return nil, "Unknown batch close reason: " .. tostring(reason) end
    local batch, batch_err = approval_repo.get_batch(dbtx, batch_id)
    if not batch then return nil, batch_err end

    if batch.state == BATCH.CLOSED then return batch end
    if batch.state == BATCH.RELEASED then
        if reason == "steering" or reason == "finish" or reason == "deleted" then return batch end
        if reason ~= "stop" and reason ~= "exit" then
            return nil, conflict(CONFLICT.BATCH_RELEASED, "Batch was already released"), batch
        end
        if batch.controls == approval_repo.CONTROLS.CANCELLED then return batch end
        return update_batch(dbtx, batch, { controls = approval_repo.CONTROLS.CANCELLED })
    end

    local now = approval_repo.now()
    local records, list_err = list_approvals(dbtx, {
        sql.builder.expr("session_id = ?", batch.session_id),
        sql.builder.expr("batch_id = ?", batch_id),
    })
    if not records then return nil, list_err end
    for _, record in ipairs(records) do
        local update = nil
        if record.state == STATE.PENDING then
            update = sql.builder.update("session_tool_approvals")
                :set("state", close.state):set("decided_via", "system"):set("decided_at", now)
        end
        if record.disposition == nil then
            local disposition_reason = close.disposition
            if record.state == STATE.DENIED then disposition_reason = "denied" end
            update = (update or sql.builder.update("session_tool_approvals"))
                :set("disposition", approval_repo.DISPOSITION.NOT_RUN)
                :set("disposition_reason", disposition_reason)
        end
        if update then
            local result, update_err = exec(update:set("revision", record.revision + 1)
                :where("approval_id = ?", record.approval_id):where("revision = ?", record.revision),
                dbtx, "Failed to close approval")
            if update_err then return nil, update_err end
            if not result or result.rows_affected ~= 1 then
                return nil, conflict(CONFLICT.REVISION, "Approval changed during the batch closure"),
                    read_approval(dbtx, batch.session_id, record.approval_id)
            end
        end
    end

    return update_batch(dbtx, batch, {
        state = BATCH.CLOSED,
        close_reason = reason,
        controls = approval_repo.CONTROLS.CANCELLED,
        closed_at = now,
    })
end

-- Releases an open batch: succeeds at most once, and never for a
-- closed batch or while a request of the batch is still pending. The caller
-- writes the dispositions of the released calls in the same transaction.
function approval_repo.release_batch(dbtx: any, batch_id: string)
    local batch, batch_err = approval_repo.get_batch(dbtx, batch_id)
    if not batch then return nil, batch_err end
    if batch.state == BATCH.CLOSED then
        return nil, conflict(CONFLICT.BATCH_CLOSED, "Batch is closed"), batch
    end
    if batch.state == BATCH.RELEASED then
        return nil, conflict(CONFLICT.BATCH_RELEASED, "Batch was already released"), batch
    end
    local pending, pending_err = list_approvals(dbtx, {
        sql.builder.expr("session_id = ?", batch.session_id),
        sql.builder.expr("batch_id = ?", batch_id),
        sql.builder.expr("state = ?", STATE.PENDING),
    })
    if not pending then return nil, pending_err end
    if #pending > 0 then
        return nil, conflict(CONFLICT.BATCH_PENDING, "A request of the batch is still pending"), batch
    end
    return update_batch(dbtx, batch, { state = BATCH.RELEASED, released_at = approval_repo.now() })
end

---------------------------------------------------------------------------
-- Stored activation (sessions.config.tool_approval)
---------------------------------------------------------------------------

-- Reads the session config inside `dbtx` with the session row locked and
-- replaces only its `tool_approval` key with mutate(current). mutate is a pure
-- function of the committed value (nil when the session was never
-- protected); it returns the new value, or nil to leave the row unchanged.
-- Every other key is written back as it was read under the lock, so a
-- concurrent writer of another key is not undone. Returns the value in
-- force after the call (the new one, or the committed one when unchanged).
function approval_repo.update_tool_approval(session_id: string, mutate: any)
    if not non_empty(session_id) then return nil, "Session ID is required" end
    if type(mutate) ~= "function" then return nil, "mutate must be a function" end
    return approval_repo.transact(session_id, function(dbtx)
        local row, read_err = read_session_column(dbtx, session_id, "config")
        if not row then return nil, read_err end
        local config = {}
        if type(row.config) == "string" and row.config ~= "" then
            local decoded, decode_err = json.decode(row.config)
            if decode_err or type(decoded) ~= "table" then
                return nil, "Stored session config is not a JSON object"
            end
            config = decoded
        end
        local current = config.tool_approval
        local next_value = mutate(current)
        if next_value == nil then return current end
        config.tool_approval = next_value
        local encoded, encode_err = encode(config)
        if encode_err then return nil, encode_err end
        local _, update_err = exec(sql.builder.update("sessions"):set("config", encoded)
            :where("session_id = ?", session_id), dbtx, "Failed to store the tool approval activation")
        if update_err then return nil, update_err end
        return next_value
    end)
end

-- Runs fn(dbtx) in a new transaction with the session row locked first, for
-- a caller that owns no transaction yet. Returns fn's result, or nil, the
-- error and the third value fn returned with it (the committed record of a
-- conflict). Refused inside another tx.run.
function approval_repo.transact(session_id: string, fn: any): (any, any, any)
    local extra = nil
    local result, err = tx.run(function(dbtx)
        local _, lock_err = approval_repo.lock_session(dbtx, session_id)
        if lock_err then return nil, lock_err end
        local value, fn_err, fn_extra = fn(dbtx)
        if fn_err ~= nil then
            extra = fn_extra
            return nil, fn_err
        end
        return value
    end)
    if err ~= nil then return nil, err, extra end
    return result
end

return approval_repo
