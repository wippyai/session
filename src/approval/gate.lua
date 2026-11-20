local uuid = require("uuid")
local time = require("time")
local consts = require("consts")
local approval_repo = require("approval_repo")
local message_repo = require("message_repo")
local freeze = require("freeze")
local fingerprint = require("fingerprint")
local policy = require("policy")
local preview = require("preview")
local tool_meta = require("tool_meta")
local activation = require("activation")
local ui_action_broker = require("ui_action_broker")
local events = require("approval_events")
local approval_projection = require("approval_projection")
local logger = require("logger"):named("session.approval.gate")

-- The tool approval gate, called from message_handlers.process_tools after
-- the cancel_only, missing-caller and validation guards and before any call
-- is announced or dispatched. The wire contract is
-- docs/tool-approval-protocol.md.
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
--     end_turn         no further model step for this turn.
--     end_reason       the batch close reason, when fenced.
--     skip_checkpoint  a requested checkpoint does not run (Stop, finish,
--                      exit, deletion).
--     deleted          the session was deleted: nothing was written.
--   and, after a release (not fenced):
--     released         { [call_id] = true } of the calls process_tools gives
--                      to caller:execute to run: calls that need no approval
--                      and whose tool entry did not change before the release,
--                      calls the caller reports as failed without running
--                      them, and approved calls the release marked
--                      `dispatched`. Nothing else runs.
--     not_run          { [call_id] = text } of the settled calls; the caller
--                      gets each as an entry that does not run, with the text
--                      as its error, so its result listener and after-execute
--                      wrappers see every call.
--     approvals        { [call_id] = { state, decided_via, grant_id } } of the
--                      released approved calls, for their function_call event.
--     session_context  the context the release rechecked; dispatch uses it.
--
-- Flow: freeze, evaluate, then the limit and "no approval UI" paths, or the
-- requests and the wait (gate._wait), then one release transaction. A batch
-- that needs no decision goes straight to the release.
local gate = {}

local KIND = {
    RUN = "run",          -- no approval needed; runs as before
    ERROR = "error",      -- invalid in validate or arguments that don't decode; the caller's error text
    NOT_RUN = "not_run",  -- settled by the gate with its own reason (changed, check failed, repeated denial)
    GRANT = "grant",      -- a grant satisfies the requirement (audit record)
    ASK = "ask",          -- needs a decision
}

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

-- Whose grants may match, and whom a new grant belongs to: the session
-- owner, the logical session and the grant epoch. The epoch is the session
-- ID: a copied or forked session has a new ID and so inherits no grants.
function gate.grant_scope(ctx: any): any
    return { session_id = ctx.session_id, owner_id = ctx.user_id, epoch = ctx.session_id }
end

-- The stable part of the Attention binding of a UI action tool (one that
-- acts in the browser); nil for every other tool. Per-launch capabilities
-- are not part of it.
local function browser_binding(op: any, registry_id: any): any
    local mode = ui_action_broker.TOOL_MODES[registry_id]
    if mode == nil or mode == "inspect" then return nil end
    local runtime = op.ui_action_runtime
    if type(runtime) ~= "table" then return { bound = false } end
    return {
        bound = true,
        session_id = runtime.session_id,
        host_instance_id = runtime.host_instance_id,
        delivery_handle = runtime.delivery_handle,
    }
end

-- The freeze environment of one call (freeze.lua). The tool entry and the
-- delegate target's entry are read now, so a release recheck sees the
-- deployment that would run.
local function freeze_env(ctx: any, op: any, item: any, session_context: any): any
    local target_id = item.row_type == consts.MSG_TYPE.DELEGATION and freeze.delegate_target_id(item.validated) or nil
    return {
        session_context = session_context,
        row_type = item.row_type,
        delegation_func_id = ctx.config and ctx.config.delegation_func_id,
        entry = tool_meta.entry(item.registry_id),
        target_entry = target_id and tool_meta.entry(target_id) or nil,
        browser_binding = browser_binding(op, item.registry_id),
    }
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
            local call_env = freeze_env(ctx, op, item, env.session_context)
            item.target_entry = call_env.target_entry
            frozen, failure = freeze.call(validated, call_env)
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
    local evaluated = policy.evaluate_batch(frozen_calls, effective, grants, scope)
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
            -- A call that needs no approval has no record; the release
            -- compares its tool's fingerprint with this one.
            item.run_fingerprint = item.frozen.identity and item.frozen.identity.fingerprint
        end
    end
    return evaluated, nil
end

local function call_title(item: any): string
    return (item.frozen and item.frozen.title) or tostring(item.name or item.registry_id or "")
end

-- Every tool of the current agent a session grant can cover, with its grant
-- identity, in a stable order: its tools ({ registry_id, title, fingerprint })
-- and its delegation targets ({ registry_id = the delegation function,
-- target_agent_id, title = the target agent's title, fingerprint = the
-- delegation grant fingerprint of the function and the target }, the identity
-- freeze gives a delegation call). The agent's `tools` is the compiled
-- name-keyed map (a list is read the same way); an entry with `agent_id` is a
-- delegation. A tool that can't be fingerprinted can't be granted, so it is
-- not disclosed either; neither is a tool or delegation function with
-- approval.approve_all false.
local function session_scope_tools(ctx: any): {any}
    local agent = ctx.current_agent
    local listed = type(agent) == "table" and type(agent.tools) == "table" and agent.tools or {}
    local delegation_id = ctx.config and ctx.config.delegation_func_id
    local tools = {}
    for _, tool in pairs(listed) do
        if type(tool) == "table" then
            local target = tool.agent_id
            if type(target) == "string" and target ~= "" then
                local entry = tool_meta.entry(delegation_id)
                local target_entry = tool_meta.entry(target)
                local function_fingerprint = entry and fingerprint.of_entry(entry) or nil
                local target_fingerprint = target_entry and fingerprint.of_entry(target_entry) or nil
                local grant_fingerprint = function_fingerprint and target_fingerprint
                    and fingerprint.delegation(function_fingerprint, target_fingerprint) or nil
                if grant_fingerprint and tool_meta.approve_all(entry) ~= false then
                    tools[#tools + 1] = { registry_id = delegation_id, title = tool_meta.title(target_entry, target),
                        fingerprint = grant_fingerprint, target_agent_id = target }
                end
            else
                local registry_id = tool.registry_id
                local entry = tool_meta.entry(registry_id)
                local tool_fingerprint = entry and fingerprint.of_entry(entry) or nil
                if tool_fingerprint and tool_meta.approve_all(entry) ~= false then
                    tools[#tools + 1] = { registry_id = registry_id, title = tool_meta.title(entry, registry_id),
                        fingerprint = tool_fingerprint }
                end
            end
        end
    end
    table.sort(tools, function(a, b)
        if a.registry_id ~= b.registry_id then return tostring(a.registry_id) < tostring(b.registry_id) end
        return tostring(a.target_agent_id or "") < tostring(b.target_agent_id or "")
    end)
    return tools
end

-- display.approve_all_scope: every tool in the scope of the offer, with the
-- grant identity (registry ID, deployment fingerprint, delegate target), and
-- every covered pending call. The tool list is immutable once stored: a
-- session grant's manifest is exactly this list (approval_commands), so the
-- person consents to what the card discloses and nothing else.
local function approve_all_disclosure(ctx: any, offered: any, covered_items: {any}): any
    local tools, seen = {}, {}
    local function add_tool(registry_id: any, title: any, tool_fingerprint: any, target: any)
        local key = tostring(registry_id) .. "\0" .. tostring(target or "")
        if seen[key] then return end
        seen[key] = true
        tools[#tools + 1] = { registry_id = registry_id, title = title, fingerprint = tool_fingerprint,
            target_agent_id = target }
    end
    local covered = {}
    for _, item in ipairs(covered_items) do
        local identity = item.frozen.identity
        add_tool(identity.registry_id, call_title(item), identity.fingerprint, identity.target_agent_id)
        covered[#covered + 1] = { approval_id = item.approval_id, title = call_title(item) }
    end
    if offered.approve_all.scope == policy.SCOPE.SESSION then
        for _, tool in ipairs(session_scope_tools(ctx)) do
            add_tool(tool.registry_id, tool.title, tool.fingerprint, tool.target_agent_id)
        end
    end
    return { scope = offered.approve_all.scope, tools = tools, covered = covered, covered_count = #covered }
end

-- The server-built card content of one request.
local function display_for(item: any, items: {any}, agent_title: string): any
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
        display.target_agent = tool_meta.title(item.target_entry, frozen.delegate_target.agent_id)
    end
    return display
end

-- Assigns approval IDs and builds the record of every call that gets one:
-- asks (state `ask_state`, pending ones expire at `deadline`), and grant
-- audit records.
local function build_records(ctx: any, op: any, binding: any, items: {any}, ask_state: string,
                             now: number, deadline: number): ({any}?, string?)
    local agent_id = type(op.agent) == "table" and op.agent.id or (ctx.config and ctx.config.agent_id)
    local agent_title = tool_meta.title(tool_meta.entry(agent_id), agent_id)
    local by_call = {}
    for _, item in ipairs(items) do
        if item.kind == KIND.ASK or item.kind == KIND.GRANT then
            local id, id_err = uuid.v7()
            if not id then return nil, "Failed to generate an approval ID: " .. tostring(id_err) end
            item.approval_id = id
            by_call[item.call_id] = item
        end
    end
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
                fingerprint = frozen.identity.fingerprint,
                target_agent_id = frozen.delegate_target and frozen.delegate_target.agent_id or nil,
                intent_digest = frozen.intent_digest,
                denial_key = frozen.denial_key,
                requested_at = approval_repo.timestamp(now),
                display = display_for(item, items, agent_title),
            }
            if item.kind == KIND.GRANT then
                request.state = approval_repo.STATE.APPROVED
                request.decided_via = "grant"
                request.grant_id = item.evaluation.grant_id
            else
                local offered = item.evaluation.offered
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
                if ask_state == approval_repo.STATE.PENDING then request.expires_at = approval_repo.timestamp(deadline) end
            end
            records[#records + 1] = request
        end
    end
    return records, nil
end

-- Stores the records and their row projections (metadata.approval) in
-- `dbtx`; with pending requests also the session activity. The batch must
-- still be open. Returns { records, activity } or (nil, err).
local function store_records(dbtx: any, ctx: any, binding: any, requests: {any}): (any, any)
    local batch, batch_err = approval_repo.get_batch(dbtx, binding.batch_id)
    if not batch then return nil, batch_err end
    if batch.state ~= approval_repo.BATCH_STATE.OPEN then
        return { closed = batch }
    end
    local stored, pending_ids = {}, {}
    for _, request in ipairs(requests) do
        local record, create_err = approval_repo.create_request(dbtx, request)
        if not record then return nil, create_err end
        local _, projection_err = message_repo.update_metadata(record.tool_message_id,
            { approval = approval_repo.projection(record) }, ctx.session_id, { tx = dbtx })
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
        local not_run = events.not_run_settlement(reason :: string, feedback, cancelled)
        metadata.status, metadata.result = not_run.status, not_run.result
    end
    if type(record) == "table" then metadata.approval = approval_repo.projection(record) end
    return metadata
end

local function is_public(item: any): boolean
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
            if is_public(item) then
                ctx.upstream:send_message_update(item.call_id, consts.UPSTREAM_TYPES.FUNCTION_ERROR, {
                    message_id = item.message_id, call_id = item.call_id,
                    function_name = item.name, error = tostring(item.error),
                })
            end
        elseif is_public(item) or type(entry.record) == "table" then
            -- A private or delegation call gets its function_error only after
            -- its tool_approval event (published first), which names its row
            -- type: function events carry none. One without an approval
            -- record gets no event, as before this feature.
            events.publish_not_run(ctx.upstream, item.call_id, events.not_run_payload(item.message_id,
                item.call_id, item.name, entry.reason, entry.record, entry.cancelled))
        end
    end
end

-- Publishes the tool_approval event of every record whose committed revision
-- is newer than the last one published for it (run.published), in the order
-- given. A public call that a grant allows gets no tool_approval event; its
-- function_call or function_error carries the audit. Callers publish these
-- events before any settlement of the same calls, so a client knows a
-- private or delegation row's type before its function_error arrives.
local function publish_records(ctx: any, run: any, records: {any}?)
    local names = {}
    for _, item in ipairs(run.items) do names[item.message_id] = item.name end
    local server_now = approval_repo.now()
    for _, record in ipairs(records or {}) do
        local seen = run.published[record.approval_id]
        -- A grant audit record is published once, with its disposition
        -- (written by the release or the closure), not also when created.
        local audit_unsettled = record.decided_via == "grant" and record.disposition == nil
        if not audit_unsettled and (seen == nil or record.revision > seen) then
            run.published[record.approval_id] = record.revision
            local public_grant = record.decided_via == "grant" and record.row_type == consts.MSG_TYPE.FUNCTION
            if not public_grant then
                events.publish_record(ctx.upstream, record, names[record.tool_message_id], server_now)
            end
        end
    end
end

-- After a commit that stored the evaluator's grant suspensions: the grants
-- chip reads the new statuses from the session's tool_approval field.
local function publish_suspensions(ctx: any, suspend: {any}?)
    if type(suspend) == "table" and #suspend > 0 then approval_projection.publish(ctx) end
end

local function all_calls(items: {any}): {[string]: boolean}
    local all = {}
    for _, item in ipairs(items) do all[item.call_id] = true end
    return all
end

-- The result for a batch whose session (and so its rows) is gone: nothing is
-- written, nothing runs, and the turn ends.
local function deleted_result(items: {any}): any
    return { fenced = true, end_turn = true, end_reason = "deleted", skip_checkpoint = true,
        settled = all_calls(items), deleted = true }
end

local function session_gone(err: any): boolean
    local code = approval_repo.conflict_code(err)
    return errors.is(err, errors.NOT_FOUND) and (code == "session" or code == "batch")
end

-- Closes the batch with `reason`, settles every call row of the batch in one
-- transaction (session row locked first), clears the activity, then
-- publishes the record events and then the settlements. `requests` are
-- records to create in the same transaction (the limit and unavailable
-- paths). A closure that an earlier writer (Stop, finish, a stop denial)
-- committed keeps its reason. The evaluator's grant suspensions are stored
-- whatever the reason.
local function close_and_settle(ctx: any, run: any, reason: string, requests: {any}?): (any, string?)
    local items = run.items
    if reason == "deleted" then return deleted_result(items), nil end
    local outcome, err = approval_repo.transact(ctx.session_id, function(dbtx)
        local suspended, suspend_err = approval_repo.suspend_grants(dbtx, ctx.session_id, run.suspend)
        if not suspended then return nil, suspend_err end
        if requests and #requests > 0 then
            local stored, store_err = store_records(dbtx, ctx, run.binding, requests)
            if not stored then return nil, store_err end
        end
        local closed, close_err, latest = approval_repo.close_batch(dbtx, run.binding.batch_id, reason)
        if not closed then return nil, close_err, latest end
        if closed.state ~= approval_repo.BATCH_STATE.CLOSED then
            return nil, "The approval batch was released; its calls are not settled here"
        end
        local close_reason = closed.close_reason
        local close = events.CLOSE[close_reason]
        if not close then return nil, "Unknown batch close reason: " .. tostring(close_reason) end
        local records, list_err = approval_repo.list_by_batch(dbtx, ctx.session_id, run.binding.batch_id)
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
            local _, row_err = message_repo.update_metadata(item.message_id, metadata, ctx.session_id, { tx = dbtx })
            if row_err then return nil, row_err end
            settled[#settled + 1] = { item = item, reason = call_reason, record = record, cancelled = cancelled }
        end
        local activity = nil
        if run.had_activity then
            local cleared, activity_err = approval_repo.write_activity(dbtx, ctx.session_id, nil)
            if not cleared then return nil, activity_err end
            activity = cleared
        end
        return { close_reason = close_reason, close = close, settled = settled, records = records, activity = activity }
    end)
    if not outcome then
        if session_gone(err) then return deleted_result(items), nil end
        return nil, tostring(err)
    end
    run.had_activity = false
    publish_suspensions(ctx, run.suspend)
    run.suspend = nil

    publish_records(ctx, run, outcome.records)
    publish_settlements(ctx, outcome.settled)
    events.publish_activity(ctx.upstream, outcome.activity)

    return {
        fenced = true,
        end_turn = outcome.close.end_turn == true,
        end_reason = outcome.close_reason,
        skip_checkpoint = outcome.close.skip_checkpoint == true,
        settled = all_calls(items),
    }, nil
end

local function ever_declared(ctx: any): boolean
    local stored = ctx.config and ctx.config.tool_approval
    return type(stored) == "table" and stored.ui_declared_at ~= nil
end

-- Signals the inbox accepted that end the wait or forbid a release, in the
-- order they win: deletion, exit, Stop (ctx.stop_requested, which commit_stop
-- sets and the session sets at exit), finish. Returns a close reason or nil.
local function signalled(ctx: any): string?
    local hub = ctx.approval_wake
    if hub:is_set("deleted") then return "deleted" end
    if hub:is_set("exiting") then return "exit" end
    if ctx.stop_requested == true then return "stop" end
    if hub:is_set("finish") then return "finish" end
    return nil
end

-- The committed state of a waiting batch: { close_reason } when it must
-- close, { release = true } when every request is decided, nil while a
-- request is still pending.
local function committed_outcome(ctx: any, run: any): (any, string?)
    local batch, err = approval_repo.get_batch(nil, run.binding.batch_id)
    if not batch then
        if session_gone(err) then return { close_reason = "deleted" }, nil end
        return nil, tostring(err)
    end
    if batch.state == approval_repo.BATCH_STATE.CLOSED then return { close_reason = batch.close_reason }, nil end
    if batch.state ~= approval_repo.BATCH_STATE.OPEN then
        return nil, "The approval batch was released while its requests waited"
    end
    local records, list_err = approval_repo.list_by_batch(nil, ctx.session_id, run.binding.batch_id)
    if not records then return nil, tostring(list_err) end
    local close_reason, reason_err = approval_repo.close_reason(nil, ctx.session_id, batch.turn_id,
        message_repo.has_pending_input, records)
    if reason_err then
        if session_gone(reason_err) then return { close_reason = "deleted" }, nil end
        return nil, tostring(reason_err)
    end
    if close_reason then return { close_reason = close_reason }, nil end
    for _, record in ipairs(records) do
        if record.state == approval_repo.STATE.PENDING then return nil, nil end
    end
    return { release = true }, nil
end

local function after(seconds: number): any
    local ms = math.max(1, math.floor(seconds * 1000))
    return time.after(tostring(ms) .. "ms")
end

-- The wait of a batch whose requests need decisions. The waiter was armed
-- before the requests were written. After every wake the gate rereads the
-- committed state; no transaction or lock is held while it waits. It selects
-- on the waiter (decision, revocation, steering, finish, deletion, exit,
-- surface changes, Stop), the deadline and, while no approval UI surface is
-- live, the grace period. Returns { close_reason } or { release = true }.
gate.GRACE_SECONDS = 120

function gate._wait(ctx: any, run: any, waiting: any): (any, string?)
    local grace_from = nil
    while true do
        local reason = signalled(ctx)
        if reason then return { close_reason = reason }, nil end
        -- The deadline is checked against the clock read before the committed
        -- state: the decision command refuses a decision at or after the
        -- deadline, so a decision that commits during this read was in time
        -- and its release wins.
        local checked_at = activation.now()
        local outcome, err = committed_outcome(ctx, run)
        if err then return nil, err end
        if outcome then return outcome, nil end
        if checked_at >= waiting.deadline then return { close_reason = "deadline" }, nil end
        -- The grace period and the timers use the clock after the read, so
        -- the grace period starts no earlier than the gate saw no surface.
        local now = activation.now()
        local cases = { waiting.waiter.channel:case_receive(), after(waiting.deadline - now):case_receive() }
        if activation.live_surfaces(ctx) == 0 then
            grace_from = grace_from or now
            local left = grace_from + gate.GRACE_SECONDS - now
            if left <= 0 then return { close_reason = "grace" }, nil end
            cases[#cases + 1] = after(left):case_receive()
        else
            grace_from = nil
        end
        channel.select(cases)
    end
end

-- The Attention browser binding ends at the expiry the broker set for the
-- turn (ui_action_ttl_seconds); a call released later would reach a Host the
-- person did not review. A binding without an expiry is never fresh. The
-- broker checks the expiry again when it dispatches the action.
local function binding_fresh(op: any, now: number): boolean
    local runtime = op.ui_action_runtime
    local expires_at = type(runtime) == "table" and tonumber(runtime.expires_at) or nil
    return expires_at ~= nil and now < expires_at
end

-- The release recheck of one approved call. Returns nil when the call may
-- run, else the disposition reason: `revoked` when the grant that allowed it
-- is no longer active or no longer belongs to the session's current owner
-- (`owner`, read in the release transaction), session and epoch,
-- `intent_changed` when the tool entry, the effective context, the delegate
-- target or the browser binding differ from what was approved.
local function recheck(dbtx: any, ctx: any, op: any, item: any, record: any, session_context: any, now: number,
                       owner: string): string?
    if record.decided_via == "grant" then
        local grant = approval_repo.get_grant(dbtx, record.grant_id)
        local scope = gate.grant_scope(ctx)
        if type(grant) ~= "table" or grant.session_id ~= scope.session_id or grant.owner_id ~= owner
            or grant.epoch ~= scope.epoch or grant.status ~= consts.GRANT_STATUS.ACTIVE then
            return "revoked"
        end
    end
    local frozen = freeze.call(item.validated, freeze_env(ctx, op, item, session_context))
    if not frozen or frozen.intent_digest ~= record.intent_digest then return "intent_changed" end
    if frozen.identity.fingerprint ~= record.fingerprint then return "intent_changed" end
    if frozen.browser_binding ~= nil then
        if frozen.browser_binding.bound ~= true or not binding_fresh(op, now) then return "intent_changed" end
    end
    return nil
end

local DISPOSITION_REASON = {
    denied = events.REASON.DENIED_BY_USER,
    revoked = events.REASON.REVOKED,
    intent_changed = events.REASON.CHANGED_BEFORE_RUN,
}

-- The release transaction of a batch: with the session row locked, it
-- refuses a closed batch, a turn fenced by Stop or finish, a pending steering
-- input and a stop denial (the batch then closes through close_and_settle),
-- rechecks every approved call and the tool entry of every call that needed
-- no approval (a changed one does not run: `changed_before_run`), writes
-- `dispatched` or `not_run` for each record, marks the batch released and
-- settles the calls that do not run.
-- Returns the gate result for process_tools.
local function release(ctx: any, op: any, env: any, run: any): (any, string?)
    local binding, items = run.binding, run.items
    local reason = signalled(ctx)
    if reason then return close_and_settle(ctx, run, reason) end

    local session_context, context_err = env.read_session_context()
    if context_err then
        local _, batch_err = approval_repo.get_batch(nil, binding.batch_id)
        if session_gone(batch_err) then return deleted_result(items), nil end
        return nil, "Failed to read the session context for the release: " .. tostring(context_err)
    end
    local now = activation.now()
    local outcome, err = approval_repo.transact(ctx.session_id, function(dbtx)
        local suspended, suspend_err = approval_repo.suspend_grants(dbtx, ctx.session_id, run.suspend)
        if not suspended then return nil, suspend_err end
        local batch, batch_err = approval_repo.get_batch(dbtx, binding.batch_id)
        if not batch then return nil, batch_err end
        if batch.state == approval_repo.BATCH_STATE.CLOSED then return { close_reason = batch.close_reason } end
        if batch.state ~= approval_repo.BATCH_STATE.OPEN then return nil, "The approval batch was already released" end
        -- A deletion, exit, Stop or finish the inbox accepted while the
        -- context was read; a finish closure that failed to store is only
        -- logged, so the in-memory signal is checked again here.
        local signal = signalled(ctx)
        if signal then return { close_reason = signal } end
        local records, list_err = approval_repo.list_by_batch(dbtx, ctx.session_id, binding.batch_id)
        if not records then return nil, list_err end
        local close_reason, reason_err = approval_repo.close_reason(dbtx, ctx.session_id, batch.turn_id,
            message_repo.has_pending_input, records)
        if reason_err then return nil, reason_err end
        if close_reason then return { close_reason = close_reason } end

        -- The owner now, under the session lock: a grant of an earlier owner
        -- allows nothing, also when the owner changed during the wait.
        local owner, owner_err = approval_repo.session_owner(dbtx, ctx.session_id)
        if not owner then return nil, owner_err end
        local by_message = {}
        for _, record in ipairs(records) do by_message[record.tool_message_id] = record end
        local decisions, changed_runs = {}, {}
        for _, item in ipairs(items) do
            local record = by_message[item.message_id]
            if not record and item.kind == KIND.RUN then
                -- A call that needed no approval runs only with the tool
                -- deployment it was evaluated with: a tool entry that changed
                -- during the wait (newly marked, or replaced) may now need
                -- approval. Only the tool fingerprint counts, not the context.
                -- No fingerprint fails closed.
                local frozen = freeze.call(item.validated, freeze_env(ctx, op, item, session_context))
                local current = frozen and frozen.identity and frozen.identity.fingerprint
                if type(item.run_fingerprint) ~= "string" or current ~= item.run_fingerprint then
                    changed_runs[item.message_id] = true
                end
            elseif record then
                local disposition, why = approval_repo.DISPOSITION.NOT_RUN, nil
                if record.state == approval_repo.STATE.APPROVED then
                    why = recheck(dbtx, ctx, op, item, record, session_context, now, owner)
                    if not why then disposition = approval_repo.DISPOSITION.DISPATCHED end
                elseif record.state == approval_repo.STATE.DENIED then
                    why = "denied"
                else
                    return nil, "Approval " .. tostring(record.approval_id) .. " is " .. tostring(record.state)
                        .. " at release"
                end
                local written, write_err, latest = approval_repo.set_disposition(dbtx, ctx.session_id,
                    record.approval_id, disposition, why, record.revision)
                if not written then return nil, write_err, latest end
                by_message[item.message_id] = written
                decisions[item.message_id] = why
            end
        end
        local released, release_err, latest = approval_repo.release_batch(dbtx, binding.batch_id)
        if not released then return nil, release_err, latest end

        local settled, changed = {}, {}
        for _, item in ipairs(items) do
            local record = by_message[item.message_id]
            if record then changed[#changed + 1] = record end
            local why = decisions[item.message_id]
            local call_reason, feedback = nil, nil
            if item.kind == KIND.NOT_RUN then
                call_reason = item.reason
            elseif changed_runs[item.message_id] then
                call_reason = events.REASON.CHANGED_BEFORE_RUN
            elseif why then
                call_reason = DISPOSITION_REASON[why]
                if why == "denied" then feedback = record.reason end
            end
            local metadata
            if call_reason then
                metadata = settlement(item, call_reason, feedback, record, false)
                settled[#settled + 1] = { item = item, reason = call_reason, record = record }
            elseif record then
                metadata = { approval = approval_repo.projection(record) }
            end
            if metadata then
                local _, row_err = message_repo.update_metadata(item.message_id, metadata, ctx.session_id, { tx = dbtx })
                if row_err then return nil, row_err end
            end
        end
        local activity = nil
        if run.had_activity then
            local cleared, activity_err = approval_repo.write_activity(dbtx, ctx.session_id, nil)
            if not cleared then return nil, activity_err end
            activity = cleared
        end
        return { settled = settled, changed = changed, records = by_message, activity = activity,
            changed_runs = changed_runs }
    end)
    if not outcome then
        if session_gone(err) then return deleted_result(items), nil end
        return nil, tostring(err)
    end
    publish_suspensions(ctx, run.suspend)
    run.suspend = nil
    if outcome.close_reason then return close_and_settle(ctx, run, outcome.close_reason) end
    run.had_activity = false

    publish_records(ctx, run, outcome.changed)
    publish_settlements(ctx, outcome.settled)
    events.publish_activity(ctx.upstream, outcome.activity)

    local result: any = {
        fenced = false, end_turn = false, skip_checkpoint = false,
        settled = {}, released = {}, not_run = {}, approvals = {}, session_context = session_context,
    }
    for _, entry in ipairs(outcome.settled) do
        result.settled[entry.item.call_id] = true
        result.not_run[entry.item.call_id] = events.not_run_text(entry.reason)
    end
    for _, item in ipairs(items) do
        local record = outcome.records[item.message_id]
        if (item.kind == KIND.RUN and not outcome.changed_runs[item.message_id]) or item.kind == KIND.ERROR then
            result.released[item.call_id] = true
        elseif record and record.disposition == approval_repo.DISPOSITION.DISPATCHED then
            result.released[item.call_id] = true
            result.approvals[item.call_id] = {
                state = record.state, decided_via = record.decided_via, grant_id = record.grant_id,
            }
        end
    end
    return result, nil
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
        -- Operator switch off: the round runs as before and every skipped
        -- check is logged.
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

    local items, freeze_err = freeze_calls(ctx, op, env)
    if not items then return nil, freeze_err end
    local run = { binding = binding, items = items, published = {}, had_activity = false }
    local history, history_err = turn_history(ctx, binding.turn_id)
    if not history then return nil, history_err end
    local evaluated, eval_err = evaluate(ctx, items, effective, history)
    if not evaluated then return nil, eval_err end
    run.suspend = evaluated.suspend

    local asks, grants = 0, 0
    for _, item in ipairs(items) do
        if item.kind == KIND.ASK then asks = asks + 1 end
        if item.kind == KIND.GRANT then grants = grants + 1 end
    end

    local batch, batch_err = approval_repo.get_batch(nil, binding.batch_id)
    if not batch then
        if session_gone(batch_err) then return deleted_result(items), nil end
        return nil, tostring(batch_err)
    end
    if batch.state == approval_repo.BATCH_STATE.CLOSED then
        -- Closed before the gate (Stop, finish or steering committed first):
        -- nothing of the batch runs and no request is created.
        return close_and_settle(ctx, run, batch.close_reason)
    end
    if batch.state ~= approval_repo.BATCH_STATE.OPEN then
        return nil, "The approval batch is " .. tostring(batch.state) .. " before the gate"
    end

    if asks == 0 and grants == 0 then
        -- Nothing needs a decision: the batch goes straight to the release
        -- transaction, which also settles the calls the gate refused itself.
        return release(ctx, op, env, run)
    end

    local now = activation.now()
    local deadline = now + effective.timeout_seconds
    if asks > 0 and history.requested + asks > effective.max_requests_per_turn then
        -- Per-turn cap: only new pending requests count. Every member settles
        -- as not run with reason limit; the turn ends.
        local requests, build_err = build_records(ctx, op, binding, items, approval_repo.STATE.LIMITED, now, deadline)
        if not requests then return nil, build_err end
        local result, close_err = close_and_settle(ctx, run, "limit", requests)
        if result and result.end_reason == "limit" then events.publish_notice(ctx.upstream, events.NOTICE.LIMIT) end
        return result, close_err
    end

    if asks > 0 and activation.live_surfaces(ctx) == 0 and not ever_declared(ctx) then
        -- No client ever declared an approval UI for this session: the calls
        -- that ask settle at once with a notice, and the turn ends.
        local requests, build_err = build_records(ctx, op, binding, items, approval_repo.STATE.UNAVAILABLE, now,
            deadline)
        if not requests then return nil, build_err end
        local result, close_err = close_and_settle(ctx, run, "unavailable", requests)
        if result and result.end_reason == "unavailable" then
            events.publish_notice(ctx.upstream, events.NOTICE.UNAVAILABLE)
        end
        return result, close_err
    end

    -- Requests: the waiter is armed before anything is written, then all
    -- requests, grant audit records, row projections and the activity commit
    -- in one transaction, then the events are published.
    local requests, build_err = build_records(ctx, op, binding, items, approval_repo.STATE.PENDING, now, deadline)
    if not requests then return nil, build_err end
    local hub = ctx.approval_wake
    local waiter = asks > 0 and hub:arm(binding.batch_id) or nil
    local function disarm()
        if waiter then hub:disarm(waiter) end
    end
    local stored, store_err = approval_repo.transact(ctx.session_id, function(dbtx)
        local suspended, suspend_err = approval_repo.suspend_grants(dbtx, ctx.session_id, run.suspend)
        if not suspended then return nil, suspend_err end
        return store_records(dbtx, ctx, binding, requests)
    end)
    if not stored then
        disarm()
        if session_gone(store_err) then return deleted_result(items), nil end
        return nil, tostring(store_err)
    end
    publish_suspensions(ctx, run.suspend)
    run.suspend = nil
    if stored.closed then
        -- A closure committed between the read above and the write.
        disarm()
        return close_and_settle(ctx, run, stored.closed.close_reason)
    end
    run.had_activity = stored.activity ~= nil
    publish_records(ctx, run, stored.records)
    events.publish_activity(ctx.upstream, stored.activity)

    if waiter then
        local outcome, wait_err = gate._wait(ctx, run, { waiter = waiter, deadline = deadline })
        disarm()
        if not outcome then return nil, wait_err end
        if outcome.close_reason then
            local result, close_err = close_and_settle(ctx, run, outcome.close_reason)
            -- No surface came back within the grace period: the same notice
            -- as a session that never declared one.
            if result and result.end_reason == "grace" then
                events.publish_notice(ctx.upstream, events.NOTICE.UNAVAILABLE)
            end
            return result, close_err
        end
    end
    return release(ctx, op, env, run)
end

return gate
