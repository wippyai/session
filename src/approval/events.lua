-- Tool approval events and results (docs/tool-approval-protocol.md sections
-- 4, 8, 9 and 11).
--
-- Builders only, plus thin publish helpers over the session upstream: the
-- `tool_approval` event on the per-call topic, the `function_error`
-- settlement of a call that did not run, the session notices and the
-- session `activity` update. The model-facing result of a call that did not
-- run is fixed server text; it never names approval IDs, digests or grants.
local json = require("json")
local consts = require("consts")

local events = {}

-- The per-call event type (upstream message type).
events.TOOL_APPROVAL = "tool_approval"
events.OUTCOME = { NOT_APPROVED = "not_approved", CANCELLED = "cancelled" }

-- Session notices (session `error` events). Each one ends the turn.
events.NOTICE = {
    UNAVAILABLE = {
        code = "tool_approval_unavailable",
        message = "A tool call needs your approval, but no open chat window can show it. The assistant stopped.",
    },
    LIMIT = {
        code = "tool_approval_limit",
        message = "The assistant asked for more tool approvals in one turn than this agent allows. No tool ran, and the assistant stopped.",
    },
}

-- Model-facing reasons. `approval_check_failed` is the reason for the
-- freeze outcome `freeze_failed`: a valid call the Session could not freeze
-- for the approval check (malformed call, nesting, a value that is not
-- JSON-shaped). It never runs and is never asked about; the turn continues.
events.REASON = {
    DENIED_BY_USER = "denied_by_user",
    STOPPED_BY_USER = "stopped_by_user",
    NOT_RUN_BATCH_STOPPED = "not_run_batch_stopped",
    EXPIRED = "expired",
    STOPPED = "stopped",
    SUPERSEDED = "superseded_by_user_message",
    INTERRUPTED = "interrupted",
    UNAVAILABLE = "approval_ui_unavailable",
    LIMIT = "limit",
    CHANGED_BEFORE_RUN = "changed_before_run",
    REVOKED = "revoked",
    REPEATED_DENIED_CALL = "repeated_denied_call",
    APPROVAL_CHECK_FAILED = "approval_check_failed",
}
local REASON = events.REASON

local DO_NOT_REPEAT = "The tool did not run. Do not call it again with the same arguments."

-- reason -> { instruction (model), text (the function_error event and the
-- card's "Not run" line) }
local TEXT = {
    [REASON.DENIED_BY_USER] = {
        instruction = DO_NOT_REPEAT .. " Follow the user's feedback.",
        text = "Not run: you denied this call.",
    },
    [REASON.STOPPED_BY_USER] = {
        instruction = "The tool did not run. The user denied it and stopped the assistant. Do not continue the task.",
        text = "Not run: you denied this call and stopped the assistant.",
    },
    [REASON.NOT_RUN_BATCH_STOPPED] = {
        instruction = "The tool did not run, because the tool calls of this step were stopped together.",
        text = "Not run: the calls of this step were stopped.",
    },
    [REASON.EXPIRED] = {
        instruction = "The tool did not run, because no decision arrived in time.",
        text = "Not run: no decision in time.",
    },
    [REASON.STOPPED] = {
        instruction = "The tool did not run, because the user stopped the assistant.",
        text = "Not run: you stopped the assistant.",
    },
    [REASON.SUPERSEDED] = {
        instruction = "The tool did not run, because the user sent a new message. Read it and follow it.",
        text = "Skipped because you sent a message.",
    },
    [REASON.INTERRUPTED] = {
        instruction = "The tool did not run, because the approval wait was interrupted.",
        text = "Not run: the approval wait was interrupted.",
    },
    [REASON.UNAVAILABLE] = {
        instruction = "The tool did not run, because no open chat window could show the approval request.",
        text = "Not run: no open chat window could show the approval request.",
    },
    [REASON.LIMIT] = {
        instruction = "The tool did not run, because this turn asked for more approvals than the agent allows.",
        text = "Not run: too many approval requests in this turn.",
    },
    [REASON.CHANGED_BEFORE_RUN] = {
        instruction = "The tool did not run, because the call changed before it could run.",
        text = "Not run: the call changed before it could run.",
    },
    [REASON.REVOKED] = {
        instruction = "The tool did not run, because the permission that allowed it was withdrawn.",
        text = "Not run: the permission for this call was withdrawn.",
    },
    [REASON.REPEATED_DENIED_CALL] = {
        instruction = DO_NOT_REPEAT .. " The user denied the same call earlier in this turn.",
        text = "Not run: you denied the same call earlier in this turn.",
    },
    [REASON.APPROVAL_CHECK_FAILED] = {
        instruction = DO_NOT_REPEAT .. " The call could not be prepared for the approval check.",
        text = "Not run: the call could not be checked for approval.",
    },
}

-- The structured result the model sees for a call that did not run.
-- feedback is the user's text of a `continue` denial.
function events.model_result(reason: string, feedback: string?): any
    local text = TEXT[reason]
    if not text then error("unknown not-run reason: " .. tostring(reason)) end
    local result = { executed = false, reason = reason, instruction = text.instruction }
    if type(feedback) == "string" and feedback ~= "" then result.user_feedback = feedback end
    return result
end

-- The human-readable "Not run" text of a reason.
function events.not_run_text(reason: string): string
    local text = TEXT[reason]
    if not text then error("unknown not-run reason: " .. tostring(reason)) end
    return text.text
end

-- What a batch closure means for the calls it did not run: the model reason
-- of a call whose own request the closure ended (`own`) and of every other
-- unreleased call (`peer`), whether the turn ends, and whether a requested
-- checkpoint is skipped (the bus refuses it while it drains a Stop or
-- shuts down).
events.CLOSE = {
    stop_denial = { own = REASON.NOT_RUN_BATCH_STOPPED, peer = REASON.NOT_RUN_BATCH_STOPPED, end_turn = true },
    stop = { own = REASON.STOPPED, peer = REASON.STOPPED, end_turn = true, skip_checkpoint = true, cancelled = true },
    steering = { own = REASON.SUPERSEDED, peer = REASON.SUPERSEDED, end_turn = false },
    finish = { own = REASON.INTERRUPTED, peer = REASON.INTERRUPTED, end_turn = true, skip_checkpoint = true },
    exit = { own = REASON.INTERRUPTED, peer = REASON.INTERRUPTED, end_turn = true, skip_checkpoint = true },
    deleted = { own = REASON.INTERRUPTED, peer = REASON.INTERRUPTED, end_turn = true, skip_checkpoint = true },
    deadline = { own = REASON.EXPIRED, peer = REASON.NOT_RUN_BATCH_STOPPED, end_turn = true },
    grace = { own = REASON.UNAVAILABLE, peer = REASON.NOT_RUN_BATCH_STOPPED, end_turn = true },
    unavailable = { own = REASON.UNAVAILABLE, peer = REASON.NOT_RUN_BATCH_STOPPED, end_turn = true },
    limit = { own = REASON.LIMIT, peer = REASON.LIMIT, end_turn = true },
}

-- The model reason of one call of a closed batch. `record` is its approval
-- record or nil. A denial keeps its own reason; a request that a person was
-- asked about (or that was created limited or unavailable) takes the
-- closure's `own` reason; every other call takes `peer`.
function events.closed_reason(close_reason: string, record: any): (string, string?)
    local close = events.CLOSE[close_reason]
    if not close then error("unknown batch close reason: " .. tostring(close_reason)) end
    if type(record) == "table" then
        if record.state == "denied" then
            if record["then"] == "stop" then return REASON.STOPPED_BY_USER, nil end
            return REASON.DENIED_BY_USER, record.reason
        end
        if record.state == "limited" then return REASON.LIMIT, nil end
        if record.state == "unavailable" then return REASON.UNAVAILABLE, nil end
        -- An approved call that the closure kept from running is a peer.
        if record.state == "approved" then return close.peer, nil end
        if record.decided_via ~= "grant" and record.expires_at ~= nil then return close.own, nil end
    end
    return close.peer, nil
end

-- The `approval` object of a tool_approval event: the committed record as
-- the protocol names it (section 4).
local function approval_object(record: any): any
    return {
        approval_id = record.approval_id,
        batch_id = record.batch_id,
        state = record.state,
        revision = record.revision,
        intent_digest = record.intent_digest,
        requested_at = record.requested_at,
        expires_at = record.expires_at,
        decided_at = record.decided_at,
        decided_via = record.decided_via,
        ["then"] = record["then"],
        reason = record.reason,
        grant_id = record.grant_id,
        disposition = record.disposition,
        offered = record.offered,
        display = record.display,
    }
end

-- Payload of a tool_approval event for `record` on the call's topic. It never
-- carries a client request_id.
function events.tool_approval_payload(record: any, function_name: any, server_now: string): any
    return {
        message_id = record.tool_message_id,
        call_id = record.call_id,
        function_name = function_name,
        row_type = record.row_type,
        server_now = server_now,
        approval = approval_object(record),
    }
end

-- Payload of the function_error settlement of a call that did not run.
function events.not_run_payload(message_id: string, call_id: string, function_name: any, reason: string,
                                record: any, cancelled: boolean?): any
    local payload = {
        message_id = message_id,
        call_id = call_id,
        function_name = function_name,
        error = events.not_run_text(reason),
        outcome = cancelled and events.OUTCOME.CANCELLED or events.OUTCOME.NOT_APPROVED,
    }
    if type(record) == "table" then
        payload.approval = {
            approval_id = record.approval_id,
            state = record.state,
            ["then"] = record["then"],
            reason = record.reason,
            disposition = record.disposition,
        }
    end
    return payload
end

-- Publishes one tool_approval event.
function events.publish_record(upstream: any, record: any, function_name: any, server_now: string)
    upstream:send_message_update(record.call_id, events.TOOL_APPROVAL,
        events.tool_approval_payload(record, function_name, server_now))
end

-- Publishes the not-run settlement of one call (every row type).
function events.publish_not_run(upstream: any, call_id: string, payload: any)
    upstream:send_message_update(call_id, consts.UPSTREAM_TYPES.FUNCTION_ERROR, payload)
end

-- Publishes the session activity with its revision. A cleared activity is
-- sent as an explicit JSON null: a client keeps a key the update leaves out.
function events.publish_activity(upstream: any, activity: any)
    if type(activity) ~= "table" then return end
    local value = activity.activity
    if value == nil then value = json.null end
    upstream:update_session({ activity = value, activity_revision = activity.revision })
end

-- Publishes a session notice. Each notice ends the turn, so a turn sends it
-- at most once.
function events.publish_notice(upstream: any, notice: any)
    upstream:session_error(notice.code, notice.message)
end

return events
