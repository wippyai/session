local registry = require("registry")
local uuid = require("uuid")
local time = require("time")
local consts = require("consts")
local approval_repo = require("approval_repo")
local message_repo = require("message_repo")
local freeze = require("freeze")
local policy = require("policy")
local preview = require("preview")
local tool_meta = require("tool_meta")
local events = require("approval_events")
local logger = require("logger"):named("session.approval.gate")

-- The tool approval gate (EE2-2710, architecture 4.4 and 4.5), called from
-- message_handlers.process_tools after the cancel_only, missing-caller and
-- validation guards and before any call is announced or dispatched.
--
-- gate.run(ctx, op, env) returns
--   nil, nil            the session is not protected: process_tools runs the
--                       round as before. The evaluator is not called and the
--                       approval tables are not read or written.
--   nil, err            the check failed; process_tools settles every call as
--                       not run. No fallback runs a call.
--   result              { fenced, end_turn, end_reason, skip_checkpoint, settled }
--     fenced           true: no call of the batch runs; the gate settled every
--                      call row, and process_tools dispatches nothing.
--     settled          { [call_id] = true } of the calls the gate settled
--                      itself, with their results and events.
--     released         { [call_id] = true } of the calls process_tools may
--                      give to caller:execute (not fenced only): calls that
--                      need no approval, and calls the caller reports as
--                      failed without running them. Nothing else runs.
--     end_turn         no further model step for this turn.
--     end_reason       the batch close reason, when fenced.
--     skip_checkpoint  a requested checkpoint does not run (Stop, finish,
--                      exit, deletion).
--
-- Slice S7a builds the gate up to the wait: freezing, the evaluator, grant
-- audit records, the per-turn request cap, the "no approval UI" path and
-- request creation in the batch record. The wait, the release transaction and
-- the end-of-turn marker are slice S7b. Until then gate._await_release closes
-- every batch that needs a decision or a grant as interrupted, so a call that
-- needs approval never runs.
local gate = {}

gate.KIND = {
    RUN = "run",          -- no approval needed; runs as before
    ERROR = "error",      -- invalid in validate or arguments that don't decode; the caller's error text
    NOT_RUN = "not_run",  -- settled by the gate with its own reason (changed, check failed, repeated denial)
    GRANT = "grant",      -- a grant satisfies the requirement (audit record)
    ASK = "ask",          -- needs a decision
}
local KIND = gate.KIND

-- Test seams.
gate._registry_get = nil :: any
gate._now = nil :: any

local UI_ACTION_PREFIX = "wippy.agent.tools:ui_action_"

local function now_unix(): number
    if gate._now then return gate._now() end
    return time.now():unix()
end

local function rfc3339(unix: number): string
    return time.unix(math.floor(unix), 0):utc():format(time.RFC3339)
end

local function registry_get(id: any): any
    if type(id) ~= "string" or id == "" then return nil end
    local getter = gate._registry_get or registry.get
    local ok, entry = pcall(getter, id)
    if ok and type(entry) == "table" then return entry end
    return nil
end

local function entry_title(entry: any, fallback: any): string
    local meta = type(entry) == "table" and entry.meta or nil
    for _, key in ipairs({ "title", "name" }) do
        local value = type(meta) == "table" and meta[key] or nil
        if type(value) == "string" and value ~= "" then return value end
    end
    return tostring(fallback or "")
end

-- The turn a tool round belongs to: the id control_forms and the batch
-- descriptor use.
function gate.turn_id(ctx: any, op: any?): string?
    local turn = ctx and ctx.turn_state
    local id = type(turn) == "table" and (turn.id or turn.message_id) or nil
    if id == nil and type(op) == "table" then id = op.message_id end
    if type(id) == "string" and id ~= "" then return id end
    return nil
end

-- The writer:add_response options of a model response with calls: a batch
-- record only while the gate enforces (a protected session, operator switch
-- on). nil otherwise, so an unprotected response writes no batch.
function gate.response_options(ctx: any): any
    local current = ctx and ctx.tool_approval_policy
    if type(current) ~= "table" or current.enforcement ~= "enforce" then return nil end
    return { approval_batch = { turn_id = gate.turn_id(ctx) } }
end

-- The approval binding a PROCESS_TOOLS operation carries: the policy of the
-- step that produced the calls and, while the gate enforces, the stored
-- batch. nil for an unprotected session.
function gate.op_binding(ctx: any, batch: any): any
    local current = ctx and ctx.tool_approval_policy
    if type(current) ~= "table" then return nil end
    local binding: any = { policy = current }
    if current.enforcement == "enforce" and type(batch) == "table" then
        binding.batch_id = batch.batch_id
        binding.turn_id = batch.turn_id
    end
    return binding
end

-- Whose grants may match: the session owner, the logical session and the
-- grant epoch. The epoch is the session ID: a copied or forked session has a
-- new ID and so inherits no grants (architecture 4.3, grant lifetime).
function gate.grant_scope(ctx: any): any
    return { session_id = ctx.session_id, owner_id = ctx.user_id, epoch = ctx.session_id }
end

-- The stable part of the Attention binding for UI action tools; nil for
-- every other tool. Per-launch capabilities are not part of it.
local function browser_binding(op: any, registry_id: any): any
    if type(registry_id) ~= "string" or registry_id:sub(1, #UI_ACTION_PREFIX) ~= UI_ACTION_PREFIX then return nil end
    local runtime = op.ui_action_runtime
    if type(runtime) ~= "table" then return { bound = false } end
    return {
        bound = true,
        session_id = runtime.session_id,
        host_instance_id = runtime.host_instance_id,
        delivery_handle = runtime.delivery_handle,
    }
end

-- The delegate target the model chose, read as freeze.lua reads it.
local function delegate_target_id(validated: any): any
    if type(validated) ~= "table" then return nil end
    if type(validated.agent_id) == "string" and validated.agent_id ~= "" then return validated.agent_id end
    if type(validated.context) == "table" then return validated.context.to_agent_id end
    return nil
end

-- Freezes every call in model order. Returns the items, or nil and an error
-- when a call has no stored row.
local function freeze_calls(ctx: any, op: any, env: any): ({any}?, string?)
    local items = {}
    local validated_tools = env.validated_tools or {}
    for index, call in ipairs(op.tool_calls or {}) do
        local message_id = op.call_message_ids and op.call_message_ids[call.id]
        if type(message_id) ~= "string" or message_id == "" then
            return nil, "Tool call intent was not stored with the assistant response: " .. tostring(call.id)
        end
        local validated = validated_tools[call.id]
        local row_type = (op.call_message_types and op.call_message_types[call.id]) or consts.MSG_TYPE.FUNCTION
        local item: any = {
            index = index, call_id = call.id, message_id = message_id, row_type = row_type,
            name = (type(validated) == "table" and validated.name) or call.name,
            registry_id = (type(validated) == "table" and validated.registry_id) or call.registry_id,
            validated = validated,
        }
        local frozen, failure
        if type(validated) ~= "table" then
            failure = { outcome = freeze.OUTCOME.FREEZE_FAILED, error = "The call has no validated entry" }
        else
            local target_id = row_type == consts.MSG_TYPE.DELEGATION and delegate_target_id(validated) or nil
            item.target_entry = target_id and registry_get(target_id) or nil
            frozen, failure = freeze.call(validated, {
                session_context = env.session_context,
                row_type = row_type,
                delegation_func_id = ctx.config and ctx.config.delegation_func_id,
                entry = registry_get(item.registry_id),
                target_entry = item.target_entry,
                browser_binding = browser_binding(op, item.registry_id),
            })
        end
        if frozen then
            item.frozen = frozen
            item.row_type = frozen.row_type
        else
            local outcome = type(failure) == "table" and failure.outcome or freeze.OUTCOME.FREEZE_FAILED
            if outcome == freeze.OUTCOME.INVALID and validated.valid then
                -- A truthy `valid` that is not true: the caller would run it,
                -- so it can't pass as invalid.
                item.kind = KIND.NOT_RUN
                item.reason = events.REASON.APPROVAL_CHECK_FAILED
            elseif outcome == freeze.OUTCOME.INVALID or outcome == freeze.OUTCOME.ARGUMENTS then
                -- validate marked it invalid, or its arguments don't decode: the
                -- caller would report exactly this error and never run it.
                item.kind = KIND.ERROR
                item.error = failure.error
            elseif outcome == freeze.OUTCOME.CHANGED then
                item.kind = KIND.NOT_RUN
                item.reason = events.REASON.CHANGED_BEFORE_RUN
            else
                item.kind = KIND.NOT_RUN
                item.reason = events.REASON.APPROVAL_CHECK_FAILED
                logger:warn("tool call could not be frozen for the approval check; it does not run", {
                    session_id = ctx.session_id, call_id = call.id, registry_id = tostring(item.registry_id),
                    error = type(failure) == "table" and tostring(failure.error) or nil,
                })
            end
        end
        items[#items + 1] = item
    end
    return items, nil
end

-- Repeated-denial keys and the requests already created in this turn.
local function turn_history(ctx: any, turn_id: any): (any, string?)
    local history = { denied_keys = {}, requested = 0 }
    if type(turn_id) ~= "string" or turn_id == "" then return history, nil end
    local records, err = approval_repo.list_by_turn(nil, ctx.session_id, turn_id)
    if not records then return nil, tostring(err) end
    for _, record in ipairs(records) do
        if record.state == approval_repo.STATE.DENIED and type(record.denial_key) == "string" then
            history.denied_keys[record.denial_key] = true
        end
        -- Only requests a person was asked about count (they were created
        -- pending, with a deadline); grant audit records don't.
        if record.expires_at ~= nil and record.decided_via ~= "grant" then
            history.requested = history.requested + 1
        end
    end
    return history, nil
end

-- Runs the evaluator over the frozen calls and sets each item's kind.
local function evaluate(ctx: any, items: {any}, effective: any, history: any): (any, string?)
    local frozen_calls, frozen_items = {}, {}
    for _, item in ipairs(items) do
        if item.frozen then
            frozen_calls[#frozen_calls + 1] = item.frozen
            frozen_items[#frozen_items + 1] = item
        end
    end
    if #frozen_calls == 0 then return { suspend = {} }, nil end
    local grants, grants_err = approval_repo.list_grants(nil, ctx.session_id)
    if not grants then return nil, tostring(grants_err) end
    local scope = gate.grant_scope(ctx)
    scope.denied_keys = history.denied_keys
    local evaluated, eval_err = policy.evaluate_batch(frozen_calls, effective, grants, scope)
    if not evaluated then return nil, "Tool approval policy failed: " .. tostring(eval_err) end
    for index, result in ipairs(evaluated.results) do
        local item = frozen_items[index]
        item.evaluation = result
        for _, warning in ipairs(result.warnings or {}) do
            logger:warn("tool approval meta warning", { session_id = ctx.session_id,
                call_id = item.call_id, registry_id = tostring(item.registry_id), warning = tostring(warning) })
        end
        if result.decision == policy.DECISION.ASK then
            item.kind = KIND.ASK
        elseif result.decision == policy.DECISION.SETTLE then
            item.kind = KIND.NOT_RUN
            item.reason = events.REASON.REPEATED_DENIED_CALL
        elseif result.reason == policy.REASON.GRANT then
            item.kind = KIND.GRANT
        else
            item.kind = KIND.RUN
        end
    end
    return evaluated, nil
end

local function call_title(item: any): string
    return (item.frozen and item.frozen.title) or tostring(item.name or item.registry_id or "")
end

-- display.approve_all_scope: every tool in the scope of the offer and every
-- covered pending call (architecture 4.3, disclosure).
local function approve_all_disclosure(ctx: any, offered: any, covered_items: {any}): any
    local tools, seen = {}, {}
    local function add_tool(registry_id: any, title: any, target: any)
        local key = tostring(registry_id) .. "\0" .. tostring(target or "")
        if seen[key] then return end
        seen[key] = true
        tools[#tools + 1] = { registry_id = registry_id, title = title, target_agent_id = target }
    end
    local covered = {}
    for _, item in ipairs(covered_items) do
        local target = item.frozen.delegate_target and item.frozen.delegate_target.agent_id or nil
        add_tool(item.registry_id, call_title(item), target)
        covered[#covered + 1] = { approval_id = item.approval_id, title = call_title(item) }
    end
    if offered.approve_all.scope == policy.SCOPE.SESSION then
        local agent = ctx.current_agent
        for _, tool in ipairs(type(agent) == "table" and type(agent.tools) == "table" and agent.tools or {}) do
            local registry_id = type(tool) == "table" and tool.registry_id or nil
            local entry = registry_get(registry_id)
            if entry and tool_meta.read(entry.meta).approve_all ~= false then
                add_tool(registry_id, entry_title(entry, registry_id), nil)
            end
        end
    end
    return { scope = offered.approve_all.scope, tools = tools, covered = covered, covered_count = #covered }
end

-- The server-built card content of one request (4.8).
local function display_for(ctx: any, op: any, item: any, items: {any}, agent_title: string): any
    local frozen = item.frozen
    local built = preview.build(frozen.args)
    local peers = {}
    for _, other in ipairs(items) do
        if other ~= item then peers[#peers + 1] = tostring(other.name or "") end
    end
    local display: any = {
        title = frozen.title,
        description = frozen.description,
        agent = agent_title,
        summary = built.summary,
        arguments = built.arguments == nil and {} or built.arguments,
        cut = built.cut,
        numbers = built.numbers,
        batch_peers = peers,
    }
    if frozen.delegate_target then
        display.target_agent = entry_title(item.target_entry, frozen.delegate_target.agent_id)
    end
    return display
end

-- Assigns approval IDs and builds the record of every call that gets one:
-- asks (state `ask_state`), and grant audit records.
local function build_records(ctx: any, op: any, binding: any, items: {any}, effective: any,
                             ask_state: string): ({any}?, string?)
    local agent_id = type(op.agent) == "table" and op.agent.id or (ctx.config and ctx.config.agent_id)
    local agent_title = entry_title(registry_get(agent_id), agent_id)
    local by_call = {}
    for _, item in ipairs(items) do
        if item.kind == KIND.ASK or item.kind == KIND.GRANT then
            local id, id_err = uuid.v7()
            if not id then return nil, "Failed to generate an approval ID: " .. tostring(id_err) end
            item.approval_id = id
            by_call[item.call_id] = item
        end
    end
    local now = now_unix()
    local records = {}
    for _, item in ipairs(items) do
        if item.approval_id then
            local frozen = item.frozen
            local request: any = {
                approval_id = item.approval_id,
                session_id = ctx.session_id,
                batch_id = binding.batch_id,
                tool_message_id = item.message_id,
                row_type = item.row_type,
                call_id = item.call_id,
                registry_id = frozen.registry_id,
                fingerprint = frozen.identity and frozen.identity.fingerprint or frozen.fingerprint,
                target_agent_id = frozen.delegate_target and frozen.delegate_target.agent_id or nil,
                intent_digest = frozen.intent_digest,
                denial_key = frozen.denial_key,
                requested_at = rfc3339(now),
                display = display_for(ctx, op, item, items, agent_title),
            }
            if item.kind == KIND.GRANT then
                request.state = approval_repo.STATE.APPROVED
                request.decided_via = "grant"
                request.grant_id = item.evaluation.grant_id
            else
                local offered = item.evaluation.offered or { decisions = { "approve", "deny" } }
                if offered.approve_all then
                    local covers, covered_items = {}, {}
                    for _, call_id in ipairs(offered.approve_all.covers or {}) do
                        local covered = by_call[call_id]
                        if not covered then return nil, "Approve all covers a call without a request: " .. tostring(call_id) end
                        covers[#covers + 1] = covered.approval_id
                        covered_items[#covered_items + 1] = covered
                    end
                    offered = { decisions = offered.decisions,
                        approve_all = { scope = offered.approve_all.scope, covers = covers } }
                    request.display.approve_all_scope = approve_all_disclosure(ctx, offered, covered_items)
                end
                request.offered = offered
                request.state = ask_state
                if ask_state == approval_repo.STATE.PENDING then
                    request.expires_at = rfc3339(now + (tonumber(effective.timeout_seconds) or 900))
                end
            end
            records[#records + 1] = request
        end
    end
    return records, nil
end

-- Persists the evaluator's grant suspensions. A grant that is no longer
-- active is left as it is.
local function apply_suspensions(dbtx: any, session_id: string, suspend: any): (boolean?, string?)
    for _, item in ipairs(suspend or {}) do
        local _, err = approval_repo.suspend_grant(dbtx, session_id, item.grant_id, nil, item.reason)
        if err and not approval_repo.is_conflict(err) then return nil, tostring(err) end
    end
    return true, nil
end

-- Stores the records and their row projections (metadata.approval) in
-- `dbtx`; with pending requests also the session activity. The batch must
-- still be open. Returns { records, activity } or (nil, err).
local function store_records(dbtx: any, ctx: any, binding: any, requests: {any}, suspend: any): (any, any)
    local batch, batch_err = approval_repo.get_batch(dbtx, binding.batch_id)
    if not batch then return nil, batch_err end
    if batch.state ~= approval_repo.BATCH_STATE.OPEN then
        return { closed = batch }
    end
    local suspended, suspend_err = apply_suspensions(dbtx, ctx.session_id, suspend)
    if not suspended then return nil, suspend_err end
    local stored, pending_ids = {}, {}
    for _, request in ipairs(requests) do
        local record, create_err = approval_repo.create_request(dbtx, request)
        if not record then return nil, create_err end
        local _, projection_err = message_repo.update_metadata_tx(dbtx, ctx.session_id, record.tool_message_id,
            { approval = approval_repo.projection(record) })
        if projection_err then return nil, projection_err end
        stored[#stored + 1] = record
        if record.state == approval_repo.STATE.PENDING then pending_ids[#pending_ids + 1] = record.approval_id end
    end
    local activity = nil
    if #pending_ids > 0 then
        local written, activity_err = approval_repo.write_activity(dbtx, ctx.session_id,
            { kind = "awaiting_tool_approval", approval_ids = pending_ids })
        if not written then return nil, activity_err end
        activity = written
    end
    return { records = stored, activity = activity }
end

-- The row metadata of a call the gate settles.
local function settlement(item: any, reason: string?, feedback: string?, record: any, cancelled: boolean?): any
    local metadata: any = {
        function_name = item.name,
        call_id = item.call_id,
        registry_id = item.registry_id,
    }
    if item.kind == KIND.ERROR then
        metadata.status = consts.FUNC_STATUS.ERROR
        metadata.result = tostring(item.error)
    else
        metadata.status = cancelled and consts.FUNC_STATUS.CANCELLED or consts.FUNC_STATUS.ERROR
        metadata.result = events.model_result(reason :: string, feedback)
    end
    if type(record) == "table" then metadata.approval = approval_repo.projection(record) end
    return metadata
end

local function is_public(ctx: any, item: any): boolean
    if item.row_type == consts.MSG_TYPE.PRIVATE_FUNCTION or item.row_type == consts.MSG_TYPE.DELEGATION then
        return false
    end
    local validated = item.validated
    return not (type(validated) == "table" and type(validated.meta) == "table" and validated.meta.private)
end

-- Publishes the settlement events of the calls the gate settled, in model
-- order. `settled` holds { item, reason, record, cancelled }.
local function publish_settlements(ctx: any, settled: {any})
    for _, entry in ipairs(settled) do
        local item = entry.item
        if item.kind == KIND.ERROR then
            -- Today's event for a call the caller reports as failed.
            if is_public(ctx, item) then
                ctx.upstream:send_message_update(item.call_id, consts.UPSTREAM_TYPES.FUNCTION_ERROR, {
                    message_id = item.message_id, call_id = item.call_id,
                    function_name = item.name, error = tostring(item.error),
                })
            end
        else
            events.publish_not_run(ctx.upstream, item.call_id, events.not_run_payload(item.message_id,
                item.call_id, item.name, entry.reason, entry.record, entry.cancelled))
        end
    end
end

local function publish_records(ctx: any, items: {any}, records: {any}, server_now: string)
    local names = {}
    for _, item in ipairs(items) do names[item.message_id] = item.name end
    for _, record in ipairs(records) do
        local public_grant = record.decided_via == "grant" and record.row_type == consts.MSG_TYPE.FUNCTION
        -- A public call a grant allows has no tool_approval event; its
        -- function_call carries the audit (4.8).
        if not public_grant then
            events.publish_record(ctx.upstream, record, names[record.tool_message_id], server_now)
        end
    end
end

-- Closes the batch with `reason`, settles every call row of the batch in one
-- transaction (session row locked first), clears the activity, then
-- publishes. `requests` are records to create in the same transaction (the
-- limit and unavailable paths); nil when they exist already.
local function close_and_settle(ctx: any, binding: any, items: {any}, reason: string, requests: {any}?,
                                suspend: any, had_activity: boolean): (any, string?)
    local outcome, err = approval_repo.transact(ctx.session_id, function(dbtx)
        local created = {}
        if requests and #requests > 0 then
            local stored, store_err = store_records(dbtx, ctx, binding, requests, suspend)
            if not stored then return nil, store_err end
            created = stored.records or {}
        end
        local closed, close_err, latest = approval_repo.close_batch(dbtx, binding.batch_id, reason)
        if not closed then return nil, close_err, latest end
        if closed.state ~= approval_repo.BATCH_STATE.CLOSED then
            return nil, "The approval batch was released; its calls are not settled here"
        end
        local close_reason = closed.close_reason or reason
        local close = events.CLOSE[close_reason]
        if not close then return nil, "Unknown batch close reason: " .. tostring(close_reason) end
        local records, list_err = approval_repo.list_by_batch(dbtx, ctx.session_id, binding.batch_id)
        if not records then return nil, list_err end
        local by_message = {}
        for _, record in ipairs(records) do by_message[record.tool_message_id] = record end
        local settled = {}
        for _, item in ipairs(items) do
            local record = by_message[item.message_id]
            local call_reason, feedback = item.reason, nil
            local cancelled = false
            if item.kind ~= KIND.ERROR and item.kind ~= KIND.NOT_RUN then
                call_reason, feedback = events.closed_reason(close_reason, record)
                cancelled = close.cancelled == true
            end
            local metadata = settlement(item, call_reason, feedback, record, cancelled)
            local _, row_err = message_repo.update_metadata_tx(dbtx, ctx.session_id, item.message_id, metadata)
            if row_err then return nil, row_err end
            settled[#settled + 1] = { item = item, reason = call_reason, record = record, cancelled = cancelled }
        end
        local activity = nil
        if had_activity then
            local cleared, activity_err = approval_repo.write_activity(dbtx, ctx.session_id, nil)
            if not cleared then return nil, activity_err end
            activity = cleared
        end
        -- Records to announce: the ones this closure changed, and the ones it
        -- created (their first event shows the final state).
        local changed, seen = {}, {}
        for _, record in ipairs(closed.changed or {}) do seen[record.approval_id] = true end
        for _, record in ipairs(records) do
            if seen[record.approval_id] then changed[#changed + 1] = record end
        end
        for _, record in ipairs(created) do
            if not seen[record.approval_id] then changed[#changed + 1] = by_message[record.tool_message_id] end
        end
        return { close_reason = close_reason, close = close, settled = settled, changed = changed, activity = activity }
    end)
    if not outcome then return nil, tostring(err) end

    publish_records(ctx, items, outcome.changed, approval_repo.now())
    publish_settlements(ctx, outcome.settled)
    events.publish_activity(ctx.upstream, outcome.activity)

    local all = {}
    for _, item in ipairs(items) do all[item.call_id] = true end
    return {
        fenced = true,
        end_turn = outcome.close.end_turn == true,
        end_reason = outcome.close_reason,
        skip_checkpoint = outcome.close.skip_checkpoint == true,
        settled = all,
    }, nil
end

-- Waits for the decisions of a batch that needs them and releases it
-- (architecture 4.5 steps 8 and 9). Returns { close_reason } when the batch
-- must close instead.
--
-- Slice S7b builds the wait and the release transaction. Until then no
-- batch that needs a decision or a grant is released: it closes as
-- interrupted (model reason `interrupted`), so no gated call runs.
function gate._await_release(ctx: any, _pending: any): any
    logger:warn("tool approval wait is not available in this build; the batch is closed and no call runs", {
        session_id = ctx.session_id, batch_id = _pending and _pending.batch_id,
    })
    return { close_reason = "finish" }
end

-- Settles the given NOT_RUN items of a batch that otherwise runs: one
-- transaction, then their events.
local function settle_some(ctx: any, items: {any}, suspend: any): (boolean?, string?)
    local settled = {}
    local _, err = approval_repo.transact(ctx.session_id, function(dbtx)
        local suspended, suspend_err = apply_suspensions(dbtx, ctx.session_id, suspend)
        if not suspended then return nil, suspend_err end
        for _, item in ipairs(items) do
            if item.kind == KIND.NOT_RUN then
                local _, row_err = message_repo.update_metadata_tx(dbtx, ctx.session_id, item.message_id,
                    settlement(item, item.reason, nil, nil, false))
                if row_err then return nil, row_err end
                settled[#settled + 1] = { item = item, reason = item.reason }
            end
        end
        return true
    end)
    if err then return nil, tostring(err) end
    publish_settlements(ctx, settled)
    return true, nil
end

local function live_surfaces(ctx: any): number
    local surfaces = ctx.approval_surfaces
    return type(surfaces) == "table" and (tonumber(surfaces.live) or 0) or 0
end

local function ever_declared(ctx: any): boolean
    local stored = ctx.config and ctx.config.tool_approval
    return type(stored) == "table" and stored.ui_declared_at ~= nil
end

function gate.run(ctx: any, op: any, env: any): (any, string?)
    local binding = op.approval
    if binding == nil then
        -- A protected session's round always carries its binding (agent_step).
        if ctx.tool_approval_policy ~= nil or (type(ctx.config) == "table" and ctx.config.tool_approval ~= nil) then
            return nil, "The tool round of a protected session has no approval binding"
        end
        return nil, nil
    end
    local effective = binding.policy
    if type(effective) ~= "table" then return nil, "The approval binding has no policy" end
    if effective.enforcement == "off" then
        -- Operator switch off (architecture 4.3): the round runs as before and
        -- every skipped check is logged.
        for _, call in ipairs(op.tool_calls or {}) do
            logger:warn("tool approval enforcement is off; the approval check was skipped", {
                session_id = ctx.session_id, call_id = call.id, registry_id = tostring(call.registry_id),
            })
        end
        return nil, nil
    end
    if effective.enforcement ~= "enforce" then return nil, "Unknown tool approval enforcement" end
    if type(binding.batch_id) ~= "string" or binding.batch_id == "" then
        return nil, "The tool round of a protected session has no approval batch"
    end
    env = env or {}

    local items, freeze_err = freeze_calls(ctx, op, env)
    if not items then return nil, freeze_err end
    local history, history_err = turn_history(ctx, binding.turn_id)
    if not history then return nil, history_err end
    local evaluated, eval_err = evaluate(ctx, items, effective, history)
    if not evaluated then return nil, eval_err end

    local asks, grants = 0, 0
    for _, item in ipairs(items) do
        if item.kind == KIND.ASK then asks = asks + 1 end
        if item.kind == KIND.GRANT then grants = grants + 1 end
    end

    local batch, batch_err = approval_repo.get_batch(nil, binding.batch_id)
    if not batch then return nil, tostring(batch_err) end
    if batch.state == approval_repo.BATCH_STATE.CLOSED then
        -- Closed before the gate (Stop, finish or steering committed first):
        -- nothing of the batch runs and no request is created.
        return close_and_settle(ctx, binding, items, batch.close_reason or "finish", nil, nil, false)
    end
    if batch.state ~= approval_repo.BATCH_STATE.OPEN then
        return nil, "The approval batch is " .. tostring(batch.state) .. " before the gate"
    end

    if asks == 0 and grants == 0 then
        -- Nothing needs a decision: the round runs as before, except the calls
        -- the gate settled itself.
        local settled, released = {}, {}
        local any_settled = false
        for _, item in ipairs(items) do
            if item.kind == KIND.NOT_RUN then
                settled[item.call_id] = true
                any_settled = true
            elseif item.kind == KIND.RUN or item.kind == KIND.ERROR then
                released[item.call_id] = true
            else
                return nil, "Unexpected tool approval outcome for " .. tostring(item.call_id)
            end
        end
        if any_settled or #(evaluated.suspend or {}) > 0 then
            local ok, settle_err = settle_some(ctx, items, evaluated.suspend)
            if not ok then return nil, settle_err end
        end
        return { fenced = false, end_turn = false, skip_checkpoint = false, settled = settled,
            released = released }, nil
    end

    local limit = tonumber(effective.max_requests_per_turn) or 0
    if asks > 0 and history.requested + asks > limit then
        -- Per-turn cap (4.5 step 5): only new pending requests count. Every
        -- member settles as not run with reason limit; the turn ends.
        local requests, build_err = build_records(ctx, op, binding, items, effective, approval_repo.STATE.LIMITED)
        if not requests then return nil, build_err end
        local result, close_err = close_and_settle(ctx, binding, items, "limit", requests, evaluated.suspend, false)
        if not result then return nil, close_err end
        if result.end_reason == "limit" then
            events.publish_notice(ctx.upstream, ctx.turn_state, gate.turn_id(ctx, op), events.NOTICE.LIMIT)
        end
        return result, nil
    end

    if asks > 0 and live_surfaces(ctx) == 0 and not ever_declared(ctx) then
        -- No client ever declared an approval UI for this session (4.5 step 6):
        -- the calls that ask settle at once; one notice per turn; the turn ends.
        -- A session that declared before waits for the grace period (S7b).
        local requests, build_err = build_records(ctx, op, binding, items, effective, approval_repo.STATE.UNAVAILABLE)
        if not requests then return nil, build_err end
        local result, close_err = close_and_settle(ctx, binding, items, "unavailable", requests, evaluated.suspend, false)
        if not result then return nil, close_err end
        if result.end_reason == "unavailable" then
            events.publish_notice(ctx.upstream, ctx.turn_state, gate.turn_id(ctx, op), events.NOTICE.UNAVAILABLE)
        end
        return result, nil
    end

    -- Requests (4.5 step 7): the waiter is armed before anything is written,
    -- then all requests, grant audit records, row projections and the
    -- activity commit in one transaction, then the events are published.
    local requests, build_err = build_records(ctx, op, binding, items, effective, approval_repo.STATE.PENDING)
    if not requests then return nil, build_err end
    local hub = ctx.approval_wake
    local waiter = hub and hub:arm(binding.batch_id) or nil
    local stored, store_err = approval_repo.transact(ctx.session_id, function(dbtx)
        return store_records(dbtx, ctx, binding, requests, evaluated.suspend)
    end)
    if not stored then
        if hub then hub:disarm(waiter) end
        return nil, tostring(store_err)
    end
    if stored.closed then
        -- A closure committed between the read above and the write.
        if hub then hub:disarm(waiter) end
        return close_and_settle(ctx, binding, items, stored.closed.close_reason or "finish", nil, nil, false)
    end
    publish_records(ctx, items, stored.records, approval_repo.now())
    events.publish_activity(ctx.upstream, stored.activity)

    local outcome = gate._await_release(ctx, { batch_id = binding.batch_id, waiter = waiter,
        records = stored.records, items = items, policy = effective })
    if hub then hub:disarm(waiter) end
    if type(outcome) ~= "table" or type(outcome.close_reason) ~= "string" then
        return nil, "The approval wait returned no outcome"
    end
    return close_and_settle(ctx, binding, items, outcome.close_reason, nil, nil, stored.activity ~= nil)
end

return gate
