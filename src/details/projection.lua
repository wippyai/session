local json = require("json")
local time = require("time")
local policy = require("policy")
local masks = require("masks")
local preview = require("preview")

local projection: any = {}
local NULL = json.null
local CALL_KEYS = { "call_id", "function_name", "registry_id", "agent_id", "batch_id", "artifact_id" }
local APPROVAL_KEYS = { "approval_id", "batch_id", "call_id", "state", "revision", "intent_digest",
    "requested_at", "expires_at", "decided_at", "decided_via", "then", "reason", "grant_id", "disposition" }
local DISPLAY_KEYS = { "title", "description", "agent", "target_agent" }

local function select_keys(value: any, keys: any): any
    local out: any = {}
    for _, key in ipairs(keys) do
        local child = value[key]
        if child == NULL or type(child) == "string" or type(child) == "number" or type(child) == "boolean" then
            out[key] = child
        end
    end
    return out
end

function projection.metadata(row: any): any
    if type(row.metadata_json) == "string" and row.metadata_json ~= "" then
        local decoded, err = masks.decode(row.metadata_json)
        if not err and type(decoded) == "table" then return decoded end
        return {}
    end
    return type(row.metadata) == "table" and row.metadata or {}
end

local function decode_arguments(data: any): (any, boolean)
    if type(data) == "string" then
        local value, err = masks.decode(data)
        if err then return nil, false end
        return value == nil and NULL or value, true
    end
    return data, data ~= nil
end

function projection.private(row: any, meta: any): boolean
    if row.type == "private_function" then return true end
    if row.type ~= "function" and row.type ~= "delegation" then return false end
    local entry = policy.tool(meta.registry_id)
    return type(entry.meta) == "table" and entry.meta.private == true
end

-- Only a private call's own approval record is a public exception.
function projection.visible(row: any): boolean
    local meta = projection.metadata(row)
    return not projection.private(row, meta) or type(meta.approval) == "table"
end

local function descriptor(level: string, capture: string, value: any, paths: any, part: string): (any, any)
    local availability = capture
    if capture == "available" and level == "none" then availability = "restricted" end
    local out: any = { level = level, availability = availability, summary = NULL, preview = NULL,
        has_full = false, masked_paths = {} }
    if availability ~= "available" then return out, nil end
    local masked, matched = masks.apply(value, paths)
    local built = preview.build(masked, nil, 72, true)
    out.masked_paths = matched
    out.summary = built.summary
    if part == "error" then out.summary = "The tool failed" end
    if part == "timing" then
        local seconds = string.format("%.1f", masked / 1000):gsub("%.0$", "")
        out.summary = "Ran for " .. seconds .. " s"
    end
    if level == "full" then
        out.preview = { value = built.arguments == nil and NULL or built.arguments, cut = built.cut, numbers = built.numbers }
        out.has_full = true
    end
    return out, masked
end

local function public_peers(peers: any, private_names: any): any
    local out: any = {}
    if type(peers) ~= "table" then return out end
    for _, name in ipairs(peers) do
        if type(name) == "string" and not (private_names and private_names[name]) and not policy.private_name(name) then
            out[#out + 1] = name
        end
    end
    return out
end

-- Rebuild every argument-derived field. Nothing stored under display is
-- copied as an argument preview, including in a decided private card.
function projection.approval(record: any, arguments: any, captured: boolean, level: string, paths: any, private_names: any): any
    if type(record) ~= "table" then return nil end
    local out = select_keys(record, APPROVAL_KEYS)
    local offered = record.offered
    if type(offered) == "table" then
        out.offered = {}
        if type(offered.decisions) == "table" then
            out.offered.decisions = {}
            for _, choice in ipairs(offered.decisions) do
                if choice == "approve" or choice == "deny" or choice == "approve_all" then
                    out.offered.decisions[#out.offered.decisions + 1] = choice
                end
            end
        end
        if type(offered.approve_all) == "table" then
            out.offered.approve_all = select_keys(offered.approve_all, { "scope" })
            out.offered.approve_all.covers = {}
            for _, id in ipairs(offered.approve_all.covers or {}) do
                if type(id) == "string" then out.offered.approve_all.covers[#out.offered.approve_all.covers + 1] = id end
            end
        elseif offered.approve_all == NULL then out.offered.approve_all = NULL end
    elseif offered == NULL then out.offered = NULL end
    local display = type(record.display) == "table" and record.display or {}
    out.display = select_keys(display, DISPLAY_KEYS)
    local hidden_scope = policy.private_scope(display.approve_all_scope, private_names)
    if hidden_scope and type(out.offered) == "table" and type(out.offered.approve_all) == "table" then
        local choices = {}
        for _, choice in ipairs(out.offered.decisions or {}) do
            if choice ~= "approve_all" then choices[#choices + 1] = choice end
        end
        out.offered.decisions, out.offered.approve_all = choices, NULL
    end
    if type(display.approve_all_scope) == "table" and not hidden_scope then
        local scope = display.approve_all_scope
        local all = select_keys(scope, { "scope", "covered_count" })
        all.tools, all.covered = {}, {}
        for _, item in ipairs(scope.tools or {}) do
            all.tools[#all.tools + 1] = select_keys(item, { "registry_id", "title", "fingerprint", "target_agent_id" })
        end
        for _, item in ipairs(scope.covered or {}) do
            all.covered[#all.covered + 1] = select_keys(item, { "approval_id", "title" })
        end
        out.display.approve_all_scope = all
    end
    if display.batch_peers ~= nil then out.display.batch_peers = public_peers(display.batch_peers, private_names) end
    if captured and (record.state == "pending" or level ~= "none") then
        local built = preview.build(arguments, paths)
        out.display.summary = built.summary
        if record.state == "pending" or level == "full" then
            out.display.arguments, out.display.cut, out.display.numbers = built.arguments, built.cut, built.numbers
        end
    end
    return out
end

function projection.row(row: any, config: any, private_names: any): any
    local meta = projection.metadata(row)
    local private = projection.private(row, meta)
    if private and type(meta.approval) ~= "table" then return nil end
    config = type(config) == "table" and config or {}
    local out = select_keys(row, { "message_id", "session_id", "type", "date", "data", "request_id" })
    out.details_revision = policy.revision(config)
    if type(out.date) == "number" then out.date = time.unix(out.date, 0):format_rfc3339() end
    local call = row.type == "function" or row.type == "delegation" or row.type == "private_function"
    if not call and row.type ~= "assistant" then
        out.metadata = masks.copy(meta)
        if meta.file_uuids then out.file_uuids = masks.copy(meta.file_uuids) end
        return out
    end
    if not call then
        out.metadata = select_keys(meta, { "agent_id", "model", "finish_reason" })
        if type(meta.usage) == "table" then
            out.metadata.usage = {}
            for _, key in ipairs({ "prompt_tokens", "completion_tokens", "total_tokens" }) do
                local value = meta.usage[key]
                if type(value) == "number" and value >= 0 and value % 1 == 0 then out.metadata.usage[key] = value end
            end
        end
        return out
    end
    local arguments, captured = decode_arguments(row.data)
    local current = policy.current(config, meta.agent_id or config.agent_id, meta.registry_id, arguments)
    local effective = policy.read(meta.details, current)
    local status = meta.status or "pending"
    local outcome = meta.outcome
    if meta.result == "interrupted, outcome unknown" then outcome = "unknown" end
    if status == "cancelled" then status, outcome = "error", "cancelled" end
    if outcome ~= "cancelled" and outcome ~= "not_approved" and outcome ~= "invalid_arguments" and outcome ~= "unknown" then outcome = NULL end
    local pending = status == "pending"
    local success = status == "success"
    local value_captured = (meta.result ~= nil or meta.result_captured == true) and outcome ~= "unknown"
    local result_capture = pending and "pending" or (success and value_captured and "available" or "not_captured")
    local error_capture = pending and "pending" or (not success and value_captured and "available" or "not_captured")
    local duration = meta.duration_ms
    local duration_captured = type(duration) == "number" and duration >= 0 and duration % 1 == 0
    local timing_capture = pending and "pending" or (duration_captured and "available" or "not_captured")
    local details, args, result, failure = {}, nil, nil, nil
    details.arguments, args = descriptor(effective.arguments, captured and "available" or "not_captured", arguments, effective.masks.arguments, "arguments")
    details.result, result = descriptor(effective.result, result_capture, meta.result == nil and NULL or meta.result, effective.masks.result, "result")
    details.error, failure = descriptor(effective.error, error_capture, meta.result == nil and NULL or meta.result, effective.masks.result, "error")
    details.timing = descriptor(effective.timing, timing_capture, duration, {}, "timing")
    out.data = effective.arguments == "full" and captured and args or NULL
    out.metadata = select_keys(meta, CALL_KEYS)
    if row.type == "delegation" then
        for _, key in ipairs({ "to_agent", "from_agent", "model" }) do out.metadata[key] = masks.copy(meta[key]) end
    end
    out.metadata.status, out.metadata.outcome = status, outcome
    out.metadata.result = NULL
    if success and effective.result == "full" and value_captured then out.metadata.result = result end
    if not success and not pending and effective.error == "full" and value_captured then out.metadata.result = failure end
    out.metadata.duration_ms = effective.timing ~= "none" and duration_captured and not pending and duration or NULL
    if effective.arguments == "full" and captured then out.data = json.encode(args) end
    out.metadata.approval = projection.approval(meta.approval, arguments, captured,
        effective.arguments, masks.union(current.masks.arguments, effective.masks.arguments), private_names)
    out.details = details
    return out
end

function projection.rows(rows: any, config: any): any
    local names, out = {}, {}
    for _, row in ipairs(rows or {}) do
        local meta = projection.metadata(row)
        if projection.private(row, meta) then
            if meta.function_name then names[meta.function_name] = true end
            if meta.registry_id then names[meta.registry_id] = true end
        end
    end
    for _, row in ipairs(rows or {}) do
        local value = projection.row(row, config, names)
        if value then out[#out + 1] = value end
    end
    return out
end

function projection.history_summary(repo: any, session_id: string, config: any): (any, number?, string?)
    local latest, count, cursor = nil, 0, ""
    while true do
        local page, err = repo.list_by_session(session_id, 500, cursor, "before")
        if not page then return nil, nil, err end
        local visible = projection.rows(page.messages, config)
        if not latest and #visible > 0 then latest = visible[#visible] end
        count = count + #visible
        if not page.has_more then break end
        local next_cursor = page.next_cursor
        if not next_cursor or next_cursor == cursor then return nil, nil, "Invalid history cursor" end
        cursor = next_cursor
    end
    return latest, count, nil
end

function projection.session(session: any): any
    local levels = policy.current(session.config, session.config and session.config.agent_id, nil, nil)
    session.details = {}
    for _, part in ipairs(policy.PARTS) do session.details[part] = levels[part] end
    session.details_revision = policy.revision(session.config)
    return session
end

function projection.event(kind: string, row: any, config: any): any
    local meta = projection.metadata(row)
    -- Private approvals have their own tool_approval channel, never function_*.
    if projection.private(row, meta) then return nil end
    local value = projection.row(row, config)
    if not value or not value.details then return nil end
    local payload = { type = kind, session_id = row.session_id, message_id = row.message_id,
        call_id = meta.call_id, function_name = meta.function_name,
        details = value.details, outcome = value.metadata.outcome,
        duration_ms = value.metadata.duration_ms, details_revision = value.details_revision,
        approval = value.metadata.approval }
    if kind == "function_error" and value.details.error.availability == "available" then
        if value.details.error.level == "summary" then payload.error = "The tool failed"
        elseif value.details.error.level == "full" then
            local failure = value.metadata.result
            payload.error = type(failure) == "string" and failure or json.encode(failure)
        end
    end
    return payload
end

return projection