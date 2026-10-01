local consts = require("consts")
local input_metadata = require("input_metadata")
local message_repo = require("message_repo")
local artifact_repo = require("artifact_repo")
local artifact_events = require("artifact_events")

local answer_admission = {}

local function all_messages(ctx)
    local session_reader = ctx.reader
    if session_reader and type(session_reader.list_all_messages) == "function" then
        return session_reader:list_all_messages()
    end
    if session_reader and type(session_reader.messages) == "function" then
        return session_reader:messages():all()
    end
    return message_repo.list_all_by_session(ctx.session_id)
end

-- STEERING AND FORM ANSWERS
--
-- Typed input during a running turn follows the session input policy: it is
-- refused, or stored at once as a pending steering row that the next step of
-- the turn applies (upstream steering). A form answer is not typed input and
-- is never steered into a running turn: it stays a pending answer row until
-- the session admits it (FORM ANSWER ADMISSION below). Both rows are dated
-- when they are accepted (message_date), so the store's row order is the
-- order the user sent them in, and the two keep that order:
--   - a step applies steering rows only up to the first pending answer; the
--     rows after it wait with the answer (prepare_pending_inputs);
--   - admitting an answer first applies the steering rows accepted before
--     it, so they stay ahead of it in the prompt (admit_in_order);
--   - the turn that follows admitted answers starts at the latest steering
--     row still pending after them, or at the latest answer
--     (turn_start_after).
-- A steering row is never anchored to a pending answer: admission moves the
-- answer to the end of the history, and the steering row would move with it.
-- Applying a steering row changes only its metadata, never its date, so it
-- does not change which forms are stale (message_repo.has_user_input_after
-- counts it from when it was accepted).

-- One pass over the session's rows in store order: the pending steering
-- rows (sorted by date, then id), the anchor for applying them (the last row
-- that is neither steering input, a pending answer nor `start_id`), the
-- position and row of the first pending answer, and the position of
-- `start_id` when it is an ordinary row.
local function scan_inputs(ctx, start_id)
    local messages, read_err = all_messages(ctx)
    if not messages then return nil, read_err or "Failed to read pending inputs" end
    local scan = { pending = {} :: {any}, anchor_id = nil :: any, first_answer = nil :: number?,
        answer = nil :: any, start = nil :: number? }
    for index, message in ipairs(messages) do
        local metadata = type(message.metadata) == "table" and message.metadata or nil
        local input = metadata and metadata.input
        if input ~= nil then
            if not input_metadata.validate(message) then
                return nil, "Malformed steering metadata on message " .. tostring(message.message_id)
            end
            if input.state == "pending" then table.insert(scan.pending, { row = message, index = index }) end
        elseif message_repo.is_pending_answer(message) then
            if not scan.first_answer then
                scan.first_answer = index
                scan.answer = message
            end
        elseif message.message_id ~= start_id then
            scan.anchor_id = message.message_id
        else
            scan.start = index
        end
    end
    table.sort(scan.pending, function(a, b)
        if a.row.date ~= b.row.date then return tostring(a.row.date or "") < tostring(b.row.date or "") end
        return tostring(a.row.message_id) < tostring(b.row.message_id)
    end)
    return scan, nil
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
    for _, entry in ipairs(scan.pending) do
        if not scan.first_answer or entry.index < scan.first_answer then
            local anchor = scan.anchor_id
            if scan.start and entry.index > scan.start then anchor = start_id end
            table.insert(updates, {
                message_id = entry.row.message_id,
                metadata = { input = { state = "applied", after_message_id = anchor } },
            })
        end
    end
    return updates
end

function answer_admission.prepare_pending_inputs(ctx, new_user_id)
    local scan, err = scan_inputs(ctx, new_user_id)
    if not scan then return nil, err end
    return steering_updates(scan, new_user_id)
end

function answer_admission.persist_pending_inputs(ctx, updates, expected_revision)
    if #updates == 0 then return 0 end
    if type(ctx.writer.apply_inputs) ~= "function" then
        return nil, "Session writer does not support atomic input application"
    end
    local ok, err = ctx.writer:apply_inputs(updates, expected_revision)
    if not ok then return nil, err end
    return #updates
end

function answer_admission.publish_applied_inputs(ctx, updates)
    for _, update in ipairs(updates) do
        ctx.upstream:send_message_update(update.message_id, consts.UPSTREAM_TYPES.UPDATE, {
            message_id = update.message_id, input = update.metadata.input,
        })
    end
    return #updates
end

local function commit_pending_inputs(ctx, updates)
    local expected_revision = tonumber(ctx.interaction and ctx.interaction.revision) or 0
    local count, err = answer_admission.persist_pending_inputs(ctx, updates, expected_revision)
    if not count then return nil, err end
    answer_admission.publish_applied_inputs(ctx, updates)
    return count
end

function answer_admission.apply_pending_inputs(ctx, new_user_id)
    local updates, err = answer_admission.prepare_pending_inputs(ctx, new_user_id)
    if not updates then return nil, err end
    return commit_pending_inputs(ctx, updates)
end

function answer_admission.bus_state(ctx)
    return type(ctx.coordinator) == "table" and ctx.coordinator.state or nil
end

-- The session is finishing (or failing): form answers stay pending for the
-- next session start, which admits them and starts a turn.
function answer_admission.finishing(ctx)
    return answer_admission.bus_state(ctx) == "draining_finish"
end

-- No agent turn follows the current operation (stop or finish requested).
function answer_admission.no_turn_follows(ctx)
    local state = answer_admission.bus_state(ctx)
    return state == "draining_stop" or state == "draining_finish" or state == "closed"
end

-- FORM ANSWER ADMISSION
--
-- The state API commits a form answer as a user row marked
-- metadata.session_form.pending and wakes the session. The row is not
-- written here again: admission re-dates it to the end of the history and
-- clears the marker (both in message_repo.admit_pending_answer). Until then
-- prompt_builder leaves the row out, so a running turn never sees an answer
-- that arrived after it started. Answers are admitted in acceptance order,
-- each after the steering rows accepted before it (see STEERING AND FORM
-- ANSWERS above).
--
-- When an answer is admitted:
--   - idle session: at once, and a turn starts for it (admit_answer, run
--     from the session inbox like an idle typed message);
--   - during a turn: at the end of the turn, in arrival order with the
--     internal messages held during the turn, and the next turn answers the
--     latest input (session.flush_held);
--   - the user stopped the turn: when the stop settles, with no turn; the
--     form reads as delivered and the user continues by sending a message.
--     Such an answer never starts a turn later, also when its admission has
--     to be retried (ctx.stopped_answers). A Stop the plugin has to enforce
--     ends the process first; the plugin then admits the session's pending
--     answers the same way, with no turn (plugin.finalize_exit);
--   - the session is finishing or failed: never; it stays pending and the
--     next session start admits it and starts a turn.
-- Once admitted, open views of the form reload its delivery state. When a
-- turn follows, the session status says running before they do; when none
-- follows, they reload after the status is back to idle (publish_deferred).
answer_admission.SCAN_LIMIT = 50

function answer_admission.stopped_answers(ctx)
    if type(ctx.stopped_answers) ~= "table" then ctx.stopped_answers = {} end
    return ctx.stopped_answers
end

-- Remembers answers that belong to a stopped turn but could not be admitted
-- yet: a later retry admits them without a turn.
function answer_admission.note_stopped_answer(ctx, message_id)
    answer_admission.stopped_answers(ctx)[message_id] = true
end

-- Admits one pending answer row and announces it. Returns the admitted row
-- with no_turn = true when it belongs to a stopped turn; nil when the row is
-- not a pending answer of this session (already admitted, or foreign).
function answer_admission.admit_one(ctx, message_id)
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
function answer_admission.publish_admitted(rows: {any}?)
    if not rows then return end
    for _, row in ipairs(rows) do
        local form_id = type(row) == "table" and message_repo.answer_form_id(row) or nil
        if form_id then
            local form_artifact = artifact_repo.get(form_id)
            if form_artifact then artifact_events.publish_updated(form_artifact) end
        end
    end
end

function answer_admission.defer_publish(ctx, rows)
    if type(ctx.deferred_admissions) ~= "table" then ctx.deferred_admissions = {} end
    for _, row in ipairs(rows or {}) do table.insert(ctx.deferred_admissions, row) end
end

-- Called once the session status is idle again.
function answer_admission.publish_deferred(ctx)
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
function answer_admission.admit_in_order(ctx, through_id)
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
function answer_admission.turn_start_after(ctx, admitted, steering_turn)
    local answer_id = answer_admission.turn_answer(admitted or {})
    if not answer_id and not steering_turn then return nil, nil end
    local scan, err = scan_inputs(ctx, nil)
    if not scan then return nil, err end
    local latest = nil
    for _, entry in ipairs(scan.pending) do
        if not scan.first_answer or entry.index < scan.first_answer then latest = entry.row.message_id end
    end
    return latest or answer_id, nil
end

return answer_admission
