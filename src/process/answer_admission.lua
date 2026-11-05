local consts = require("consts")
local message_repo = require("message_repo")
local message_order = require("message_order")
local artifact_repo = require("artifact_repo")
local artifact_events = require("artifact_events")

-- Applies pending steering and admits pending form answers, in the order the
-- user sent them. The functions read the session context fields they need:
-- session_id, reader, writer, upstream, interaction, coordinator and
-- stopped_answers.
local answer_admission = {}

-- Typed input during a turn follows the input policy: it is refused, or
-- stored at once as pending steering that the next step applies. A form
-- answer is never steered into a running turn, and it stays a pending row
-- until it is admitted. Both are dated when they are accepted, so the store
-- order is the order the user sent them in, and it is kept in three places.
-- A step applies steering only up to the first pending answer
-- (prepare_pending_inputs). Admitting an answer first applies the steering
-- accepted before it (admit_in_order). The turn after admitted answers starts
-- at the latest steering row still pending, or at the latest answer
-- (turn_start_after). Steering is never anchored to a pending answer, because
-- admission moves the answer to the end of the history. Applying steering
-- changes only its metadata and never its date, so it does not change which
-- forms are stale (message_repo.has_user_input_after).

-- The inputs due for admission, read with bounded queries: sessions can be
-- arbitrarily long, so nothing here reads the whole history. `pending` is the
-- pending steering in store order, `answer` the first pending form answer,
-- `anchor_id` the anchor for applying steering (the newest row that is neither
-- steering input, a pending answer nor `start_id`), and `start` the row
-- `start_id` when it is an ordinary one.
local function scan_inputs(ctx: any, start_id)
    local pending, read_err = ctx.reader:list_pending_inputs()
    if not pending then return nil, read_err or "Failed to read pending inputs" end
    local answers, answers_err = ctx.reader:list_pending_answers(1)
    if not answers then return nil, answers_err or "Failed to read pending answers" end
    message_order.sort(pending)
    local scan = { pending = pending, answer = answers[1], anchor_id = nil :: any, start = nil :: any }
    if #pending == 0 then return scan, nil end

    local anchor_err
    scan.anchor_id, anchor_err = ctx.reader:newest_non_input_id(start_id)
    if anchor_err then return nil, anchor_err end
    if start_id then
        local row = ctx.reader:get_message(start_id)
        local metadata = type(row) == "table" and type(row.metadata) == "table" and row.metadata or {}
        if row and metadata.input == nil and not message_repo.is_pending_answer(row) then scan.start = row end
    end
    return scan, nil
end

-- Steering is due when it was accepted before the first pending form answer.
local function is_due(scan, row)
    return not scan.answer or message_order.precedes(row, scan.answer)
end

-- The applied-state updates for the steering rows due now: those accepted
-- before the first pending form answer.
--
-- Placement relative to `start_id`, the ordinary row that starts the turn (a
-- typed message, or an admitted answer), which the first step passes:
--   - a row accepted before it goes before it: steering left pending by a
--     stopped or recovered turn is included when the user starts another
--     turn, ahead of the new message.
--   - a row accepted after it goes after it. Steering is included in
--     persisted message order, and a message typed while the turn's first
--     step has not built the prompt yet (the step waits behind any operation
--     queued ahead of it) was persisted after the message that starts the
--     turn, so it must not reach the model before that message. A turn that
--     starts at an admitted form answer while the user keeps typing hits
--     this often, but the rule does not depend on forms.
-- On later steps (no `start_id`) every due row goes after the latest ordinary
-- row.
local function steering_updates(scan, start_id)
    local updates = {}
    for _, row in ipairs(scan.pending) do
        if is_due(scan, row) then
            local anchor = scan.anchor_id
            if scan.start and message_order.precedes(scan.start, row) then anchor = start_id end
            table.insert(updates, {
                message_id = row.message_id,
                metadata = { input = { state = "applied", after_message_id = anchor } },
            })
        end
    end
    return updates
end

function answer_admission.prepare_pending_inputs(ctx: any, new_user_id: any?)
    local scan, err = scan_inputs(ctx, new_user_id)
    if not scan then return nil, err end
    return steering_updates(scan, new_user_id)
end

function answer_admission.persist_pending_inputs(ctx: any, updates, expected_revision)
    if #updates == 0 then return 0 end
    if type(ctx.writer.apply_inputs) ~= "function" then
        return nil, "Session writer does not support atomic input application"
    end
    local ok, err = ctx.writer:apply_inputs(updates, expected_revision)
    if not ok then return nil, err end
    return #updates
end

function answer_admission.publish_applied_inputs(ctx: any, updates)
    for _, update in ipairs(updates) do
        ctx.upstream:send_message_update(update.message_id, consts.UPSTREAM_TYPES.UPDATE, {
            message_id = update.message_id, input = update.metadata.input,
        })
    end
    return #updates
end

local function commit_pending_inputs(ctx: any, updates)
    local expected_revision = tonumber(ctx.interaction and ctx.interaction.revision) or 0
    local count, err = answer_admission.persist_pending_inputs(ctx, updates, expected_revision)
    if not count then return nil, err end
    answer_admission.publish_applied_inputs(ctx, updates)
    return count
end

function answer_admission.apply_pending_inputs(ctx: any, new_user_id: any?)
    local updates, err = answer_admission.prepare_pending_inputs(ctx, new_user_id)
    if not updates then return nil, err end
    return commit_pending_inputs(ctx, updates)
end

function answer_admission.bus_state(ctx: any)
    return type(ctx.coordinator) == "table" and ctx.coordinator.state or nil
end

-- The session is finishing (or failing): form answers stay pending for the
-- next session start, which admits them and starts a turn.
function answer_admission.finishing(ctx: any)
    return answer_admission.bus_state(ctx) == "draining_finish"
end

-- No agent turn follows the current operation (stop or finish requested).
function answer_admission.no_turn_follows(ctx: any)
    local state = answer_admission.bus_state(ctx)
    return state == "draining_stop" or state == "draining_finish" or state == "closed"
end

-- Form answer admission. The state API commits an answer as a user row whose
-- metadata.session_form.pending is true, and admission re-dates the row to the
-- end of the history and clears the marker (message_repo.admit_pending_answer).
-- Until then prompt_builder leaves the row out, so a running turn never sees
-- an answer that arrived after it started. Answers are admitted in acceptance
-- order, each after the steering rows accepted before it. When that happens
-- depends on the session:
--   - Idle: at once, and a turn starts for the answer (admit_answer).
--   - During a turn: at the end of the turn, in arrival order with the
--     internal messages held during it (session.flush_held).
--   - After Stop: when the stop settles, with no turn. ctx.stopped_answers
--     makes a retry start no turn either, and the plugin admits the answers
--     of a Stop it had to enforce the same way (admit_stopped).
--   - Finishing or failed: the answer stays pending, and the next session
--     start admits it and starts a turn.
-- Once an answer is admitted, open views of its form reload the delivery
-- state, at once when a turn follows and after the session is idle again
-- when none does (publish_deferred).

-- Bound on the answers one admission pass handles.
answer_admission.SCAN_LIMIT = 50

function answer_admission.stopped_answers(ctx: any)
    if type(ctx.stopped_answers) ~= "table" then ctx.stopped_answers = {} end
    return ctx.stopped_answers
end

-- Remembers answers that belong to a stopped turn but could not be admitted
-- yet: a later retry admits them without a turn.
function answer_admission.note_stopped_answer(ctx: any, message_id)
    answer_admission.stopped_answers(ctx)[message_id] = true
end

-- Admits one pending answer row and announces it. Returns the admitted row
-- with no_turn = true when it belongs to a stopped turn; nil when the row is
-- not a pending answer of this session (already admitted, or foreign).
function answer_admission.admit_one(ctx: any, message_id)
    local admitted, err = message_repo.admit_pending_answer(ctx.session_id, message_id)
    if err then return nil, err end
    if not admitted then return nil, nil end
    local stopped = answer_admission.stopped_answers(ctx)
    admitted.no_turn = stopped[admitted.message_id] == true
    stopped[admitted.message_id] = nil
    if ctx.upstream then
        ctx.upstream:message_received(admitted.message_id, admitted.data or "")
    end
    return admitted, nil
end

-- Tells open views of the admitted answers' forms that the delivery state
-- changed; they reload it.
function answer_admission.publish_admitted(rows: any?)
    if not rows then return end
    for _, row in ipairs(rows) do
        local form_id = type(row) == "table" and message_repo.answer_form_id(row) or nil
        if form_id then
            local form_artifact = artifact_repo.get(form_id)
            if form_artifact then artifact_events.publish_updated(form_artifact) end
        end
    end
end

function answer_admission.defer_publish(ctx: any, rows)
    if type(ctx.deferred_admissions) ~= "table" then ctx.deferred_admissions = {} end
    for _, row in ipairs(rows or {}) do table.insert(ctx.deferred_admissions, row) end
end

-- Called once the session status is idle again.
function answer_admission.publish_deferred(ctx: any)
    local rows = ctx.deferred_admissions
    ctx.deferred_admissions = nil
    answer_admission.publish_admitted(rows)
end

-- Admits pending answers in acceptance order, up to and including
-- `through_id` (every one, bounded, when it is nil or no longer pending).
-- Before each answer, the steering rows accepted before it are applied at
-- the current end of the history, so the prompt keeps them ahead of it.
-- Stops when the session starts finishing. The durable rows, not the
-- wake-ups, decide what is admitted, so a missed wake-up is recovered by the
-- next scan and a repeated one is a no-op. Nothing is published here (see
-- publish_admitted). Returns the admitted rows and the first error; rows
-- not admitted stay pending for the next scan.
function answer_admission.admit_in_order(ctx: any, through_id)
    local admitted = {}
    for _ = 1, answer_admission.SCAN_LIMIT do
        if answer_admission.finishing(ctx) then break end
        local scan, scan_err = scan_inputs(ctx, nil)
        if not scan then return admitted, scan_err end
        local answer = scan.answer
        if not answer then break end
        local updates = steering_updates(scan, nil)
        if #updates > 0 then
            local _, apply_err = commit_pending_inputs(ctx, updates)
            if apply_err then return admitted, apply_err end
        end
        local done, err = answer_admission.admit_one(ctx, answer.message_id)
        if err then return admitted, err end
        -- Not pending any more: nothing else admits answers of this session,
        -- so stop rather than read the same row again.
        if not done then break end
        table.insert(admitted, done)
        if through_id and answer.message_id == through_id then break end
    end
    return admitted, nil
end

-- The latest admitted answer a turn should answer (not one of a stopped turn).
function answer_admission.turn_answer(rows)
    for index = #rows, 1, -1 do
        if not rows[index].no_turn then return rows[index].message_id end
    end
    return nil
end

-- The row the turn after admitted answers starts at: the latest steering row
-- still pending ahead of any pending answer (it was sent after them), or
-- else the latest admitted answer that wants a turn. Steering rows alone
-- start a turn only when `steering_turn` is set (the ended turn stopped at a
-- form); otherwise that turn itself would have continued for them.
function answer_admission.turn_start_after(ctx: any, admitted, steering_turn)
    local answer_id = answer_admission.turn_answer(admitted or {})
    if not answer_id and not steering_turn then return nil, nil end
    local scan, err = scan_inputs(ctx, nil)
    if not scan then return nil, err end
    local latest = nil
    for _, row in ipairs(scan.pending) do
        if is_due(scan, row) then latest = row.message_id end
    end
    return latest or answer_id, nil
end

-- Admits the pending answers of a session that has no process, with no turn
-- (the plugin does this after a Stop it had to enforce). The rows are read
-- from storage, steering is applied through `writer` against the stored
-- `interaction`, and `upstream` tells the clients each answer was received.
-- Returns the admitted rows and the first error, like admit_in_order.
function answer_admission.admit_stopped(session_id: string, writer: any, upstream: any, interaction: any)
    return answer_admission.admit_in_order({
        session_id = session_id,
        writer = writer,
        upstream = upstream,
        interaction = interaction,
        reader = {
            list_pending_inputs = function() return message_repo.list_pending_inputs(session_id) end,
            list_pending_answers = function(_, limit) return message_repo.list_pending_answers(session_id, limit) end,
            newest_non_input_id = function(_, excluded) return message_repo.newest_non_input_id(session_id, excluded) end,
        },
    }, nil)
end

return answer_admission
