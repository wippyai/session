local consts = require("consts")
local approval_repo = require("approval_repo")
local message_repo = require("message_repo")
local form_recovery = require("form_recovery")
local events = require("approval_events")

-- Recovery of the calls an interrupted turn left pending, for every entry
-- point: session start, bus failure and process exit (command_bus:fail), the
-- plugin's failure paths, an enforced Stop and the stale-running scan. Two
-- phases, in this order:
--
-- 1. reconcile: in one transaction with the session row locked, every open
--    batch and every batch with a call row still pending is closed as
--    `exit` (approval_repo.close_batch): pending requests become
--    `interrupted`, calls that did not run get a not-run disposition, the
--    controls of an open batch and of a batch released before the
--    interruption become `cancelled`, released dispositions stay. The
--    session activity is cleared. Only for a protected session; the
--    approval tables of an unprotected one are not touched.
-- 2. recover_pending settles the pending call rows. form_recovery is asked
--    first. A row of a batch (metadata.batch_id) is written here, in a
--    locked transaction and only while it is still pending, so it never
--    gets a second terminal result: a call of a closed batch that a person
--    did not approve gets the model's not-run result (events.model_result);
--    an approved call, and every call of a released batch, keep "outcome
--    unknown" (message_repo.INTERRUPTED_RESULT), because it may have run.
--
-- message_handlers.recover_behavior_controls runs after both phases and does
-- not replay the controls of a batch whose `controls` is `cancelled`.
local recovery = {}

local function session_gone(err: any): boolean
    return errors.is(err, errors.NOT_FOUND) and approval_repo.conflict_code(err) == "session"
end

-- Writes `metadata` to the call row `message_id` in a transaction with the
-- session row locked, only while the row is still pending. `metadata` may be
-- a function of the transaction that returns the metadata (or nil and an
-- error). opts.correction: the caller settled this row itself and corrects
-- it, so the pending check is skipped. Returns true when it wrote, false
-- when the row was no longer pending or the session is gone, or nil and an
-- error.
function recovery.write_call(session_id: string, message_id: string, metadata: any, opts: any?): (boolean?, string?)
    local if_pending = not (type(opts) == "table" and opts.correction == true)
    local result, err = approval_repo.transact(session_id, function(dbtx)
        local value, build_err = metadata, nil
        if type(metadata) == "function" then value, build_err = metadata(dbtx) end
        if build_err ~= nil then return nil, build_err end
        return message_repo.update_metadata(message_id, value, session_id, { tx = dbtx, if_pending = if_pending })
    end)
    if result == nil then
        if session_gone(err) then return false, nil end
        return nil, tostring(err)
    end
    return result.updated == true, nil
end

-- Phase 1. Returns true, or nil and an error. A deleted session has nothing
-- to reconcile.
function recovery.reconcile(session_id: string, protected: boolean?): (boolean?, string?)
    if not protected then return true, nil end
    local _, err = approval_repo.transact(session_id, function(dbtx)
        local ids, seen = {}, {}
        local function add(batch_id: any)
            if type(batch_id) == "string" and batch_id ~= "" and not seen[batch_id] then
                seen[batch_id] = true
                ids[#ids + 1] = batch_id
            end
        end
        local open, open_err = approval_repo.list_batches(dbtx, session_id, { approval_repo.BATCH_STATE.OPEN })
        if not open then return nil, open_err end
        for _, batch in ipairs(open) do add(batch.batch_id) end
        local rows, rows_err = message_repo.list_pending_calls(dbtx, session_id)
        if not rows then return nil, rows_err end
        for _, row in ipairs(rows) do add(row.metadata.batch_id) end
        for _, batch_id in ipairs(ids) do
            local closed, close_err = approval_repo.close_batch(dbtx, batch_id, "exit")
            if not closed and not errors.is(close_err, errors.NOT_FOUND) then return nil, close_err end
        end
        local current, read_err = approval_repo.read_activity(dbtx, session_id)
        if not current then return nil, read_err end
        if current.activity ~= nil then
            local cleared, clear_err = approval_repo.write_activity(dbtx, session_id, nil)
            if not cleared then return nil, clear_err end
        end
        return true
    end)
    if err ~= nil and not session_gone(err) then return nil, tostring(err) end
    return true, nil
end

-- The metadata that settles `row`, a pending call row of a batch, after
-- phase 1, read in `dbtx`.
local function batch_settlement(dbtx: any, session_id: string, row: any): (any, string?)
    local batch, batch_err = approval_repo.get_batch(dbtx, row.metadata.batch_id)
    if not batch and not errors.is(batch_err, errors.NOT_FOUND) then return nil, tostring(batch_err) end
    local record = nil
    if batch then
        local records, list_err = approval_repo.list_by_batch(dbtx, session_id, batch.batch_id)
        if not records then return nil, tostring(list_err) end
        for _, candidate in ipairs(records) do
            if candidate.tool_message_id == row.message_id then record = candidate end
        end
    end
    local metadata: any
    if batch and batch.state == approval_repo.BATCH_STATE.CLOSED
        and not (record and record.state == approval_repo.STATE.APPROVED) then
        -- The batch was never released: the call did not run.
        local reason, feedback = events.closed_reason(batch.close_reason, record)
        local close = events.CLOSE[batch.close_reason]
        metadata = events.not_run_settlement(reason, feedback, close and close.cancelled == true)
    else
        metadata = { status = consts.FUNC_STATUS.ERROR, result = message_repo.INTERRUPTED_RESULT }
    end
    if record then metadata.approval = approval_repo.projection(record) end
    return metadata, nil
end

-- Phase 2: the settle function recover_pending asks about each pending call
-- row of `session_id` (see message_repo.recover_pending, which takes the
-- third return value `written`).
local function settle_for(session_id: string): any
    return function(row: any): (any, string?, boolean?)
        local update, form_err = form_recovery.settle_call(row)
        if form_err then return nil, form_err, nil end
        if type(row.metadata) ~= "table" or type(row.metadata.batch_id) ~= "string" then return update, nil, nil end
        local _, write_err = recovery.write_call(session_id, row.message_id, function(dbtx)
            if update ~= nil then return update, nil end
            return batch_settlement(dbtx, session_id, row)
        end)
        if write_err then return nil, write_err, nil end
        return nil, nil, true
    end
end

-- Both phases for the session's rows after `anchor_id` (every row when nil).
-- `protected`: the session has a stored tool approval activation
-- (config.tool_approval). Returns how many calls it settled, or nil and an
-- error; recovery then runs again later.
function recovery.recover_calls(session_id: string, anchor_id: string?, protected: boolean?): (number?, string?)
    local reconciled, reconcile_err = recovery.reconcile(session_id, protected)
    if not reconciled then return nil, reconcile_err end
    return message_repo.recover_pending(session_id, anchor_id, settle_for(session_id))
end

-- Whether the batch `batch_id` has its controls cancelled (a fenced batch, or
-- one interrupted after its release). false for an unknown batch. Returns
-- the answer, or nil and an error.
function recovery.controls_cancelled(batch_id: string): (boolean?, string?)
    local batch, err = approval_repo.get_batch(nil, batch_id)
    if not batch then
        if errors.is(err, errors.NOT_FOUND) then return false, nil end
        return nil, tostring(err)
    end
    return batch.controls == approval_repo.CONTROLS.CANCELLED, nil
end

return recovery
