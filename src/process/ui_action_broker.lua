local context_attachments = require("context_attachments")
local ui_action_broker = {}
ui_action_broker.__index = ui_action_broker

local SCHEMA = "wippy.ui-action.v1"
local DEFAULT_TTL_SECONDS = 120
local MAX_TTL_SECONDS = 120
local MAX_REQUEST_CACHE = 1024
local RESULT_TOPIC_PREFIX = "session_ui_action_result:"

local TOOL_MODES = {
    ["wippy.agent.tools:attention_inspect"] = "inspect",
    ["wippy.agent.tools:attention_find_semantic"] = "inspect",
    ["wippy.agent.tools:attention_find_css"] = "inspect",
    ["wippy.agent.tools:attention_get_node"] = "inspect",
    ["wippy.agent.tools:attention_get_tree"] = "inspect",
    ["wippy.agent.tools:attention_get_geometry"] = "inspect",
    ["wippy.agent.tools:attention_get_cursor"] = "inspect",
    ["wippy.agent.tools:attention_get_focus"] = "inspect",
    ["wippy.agent.tools:attention_get_selection"] = "inspect",
    ["wippy.agent.tools:attention_hit_test"] = "inspect",
    ["wippy.agent.tools:ui_action_highlight"] = "highlight",
    ["wippy.agent.tools:ui_action_confirm"] = "confirm",
    ["wippy.agent.tools:ui_action_capture_visual"] = "capture_visual",
    ["wippy.agent.tools:ui_action_select"] = "select",
}

local RESULT_STATUSES = {
    inspected = true,
    selected = true,
    confirmed = true,
    prepared = true,
    cancelled = true,
    denied = true,
    rejected = true,
    expired = true,
    stale = true,
    disconnected = true,
    ["permission-denied"] = true,
    unavailable = true,
    error = true,
}

local function nonempty(value, max_length)
    return type(value) == "string" and value ~= "" and #value <= max_length
end

local function result_topic(call_id)
    if not nonempty(call_id, 128) then
        return nil
    end
    local digest = hash.sha256(call_id)
    if not digest then
        return nil
    end
    return RESULT_TOPIC_PREFIX .. digest
end

local function finite(value)
    return type(value) == "number" and value == value and value ~= math.huge and value ~= -math.huge
end

local function only_keys(value, allowed)
    for key, _ in pairs(value) do
        if not allowed[key] then
            return false
        end
    end
    return true
end

local function valid_rect(rect)
    return type(rect) == "table"
        and only_keys(rect, { x = true, y = true, width = true, height = true })
        and finite(rect.x)
        and finite(rect.y)
        and finite(rect.width)
        and rect.width >= 0
        and finite(rect.height)
        and rect.height >= 0
end

local function valid_target(target)
    return type(target) == "table"
        and only_keys(target, {
            snapshot_id = true,
            target_id = true,
            host_instance_id = true,
            mount_id = true,
            generation = true,
            path_digest = true,
            rect = true,
            label = true,
        })
        and nonempty(target.snapshot_id, 128)
        and nonempty(target.target_id, 128)
        and nonempty(target.host_instance_id, 160)
        and nonempty(target.mount_id, 160)
        and type(target.generation) == "number"
        and target.generation >= 0
        and target.generation <= 9007199254740991
        and target.generation % 1 == 0
        and nonempty(target.path_digest, 71)
        and string.match(target.path_digest, "^sha256:[a-f0-9]+$") ~= nil
        and #target.path_digest == 71
        and valid_rect(target.rect)
        and (target.label == nil or type(target.label) == "string" and #target.label <= 256)
end


local function sanitize_target(target)
    return {
        snapshot_id = target.snapshot_id,
        target_id = target.target_id,
        host_instance_id = target.host_instance_id,
        mount_id = target.mount_id,
        generation = target.generation,
        path_digest = target.path_digest,
        rect = {
            x = target.rect.x,
            y = target.rect.y,
            width = target.rect.width,
            height = target.rect.height,
        },
        label = target.label,
    }
end

local function same_target(left, right)
    -- The bound Host refreshes geometry for the same canonical node at action time.
    -- Snapshot identity and ancestry remain immutable capabilities.
    return left.snapshot_id == right.snapshot_id
        and left.target_id == right.target_id
        and left.host_instance_id == right.host_instance_id
        and left.mount_id == right.mount_id
        and left.generation == right.generation
        and left.path_digest == right.path_digest
        and left.label == right.label
end

local function target_in(target, targets)
    for _, candidate in ipairs(targets or {}) do
        if same_target(target, candidate) then
            return true
        end
    end
    return false
end

local function integer(value, minimum, maximum)
    return finite(value) and value % 1 == 0 and value >= minimum and value <= (maximum or 9007199254740991)
end

local function array(value, maximum, validate)
    if type(value) ~= "table" or #value > maximum then return false end
    local count = 0
    for key, member in pairs(value) do
        count = count + 1
        if not integer(key, 1, #value) or not validate(member) then return false end
    end
    return count == #value
end

local function node_ref(value, host)
    return type(value) == "table"
        and only_keys(value, { node_id = true, host_instance_id = true, mount_id = true, generation = true })
        and nonempty(value.node_id, 160) and value.host_instance_id == host
        and nonempty(value.mount_id, 160) and integer(value.generation, 1)
end

local function fields(value, allowed, maximum)
    if type(value) ~= "table" or not only_keys(value, allowed) then return false end
    for _, member in pairs(value) do
        if type(member) ~= "string" or #member > maximum then return false end
    end
    return true
end

local function summary(value)
    if type(value) ~= "table" or not only_keys(value, { role = true, name = true, text = true, value = true, state = true }) then return false end
    for key, member in pairs(value) do
        if key ~= "state" and (type(member) ~= "string" or #member > 1024) then return false end
    end
    if value.state ~= nil then
        if type(value.state) ~= "table" then return false end
        local count = 0
        for key, member in pairs(value.state) do
            count = count + 1
            if count > 16 or not nonempty(key, 64)
                or not (type(member) == "boolean" or finite(member) or type(member) == "string" and #member <= 256) then return false end
        end
    end
    return true
end

local function coordinate_space(value)
    return value == "host-viewport" or type(value) == "table"
        and only_keys(value, { mount_id = true, generation = true })
        and nonempty(value.mount_id, 160) and integer(value.generation, 1)
end

local function geometry(value)
    return type(value) == "table"
        and only_keys(value, { rect = true, clip = true, visible = true, offscreen = true, quality = true, coordinate_space = true })
        and (value.rect == nil or valid_rect(value.rect)) and (value.clip == nil or valid_rect(value.clip))
        and type(value.visible) == "boolean" and type(value.offscreen) == "boolean"
        and (value.quality == "exact" or value.quality == "approximate" or value.quality == "unavailable")
        and (value.quality ~= "unavailable" or value.rect == nil and value.clip == nil)
        and coordinate_space(value.coordinate_space)
end

local function inspection_node(value, host)
    local kinds = { host = true, panel = true, artifact = true, page = true, iframe = true,
        ["web-fragment"] = true, ["web-component"] = true, ["shadow-root"] = true, element = true,
        document = true, semantic = true, placeholder = true }
    local states = { mounted = true, hidden = true, unmounted = true, unavailable = true }
    if type(value) ~= "table" or not only_keys(value, { ref = true, parent = true, kind = true, path = true,
        summary = true, resource = true, layout = true, geometry = true, state = true })
        or not node_ref(value.ref, host) or value.parent ~= nil and not node_ref(value.parent, host)
        or not kinds[value.kind] or not states[value.state]
        or not context_attachments.attention_fields.path(value.path) or not summary(value.summary) then return false end
    if value.resource ~= nil and not fields(value.resource, {
        resource_id = true, package_id = true, package_version = true, tag_name = true, title = true,
    }, 1024) then return false end
    local layout = value.layout
    if layout ~= nil then
        if type(layout) ~= "table" or not only_keys(layout, {
            instance_id = true, panel_id = true, role = true, title = true, breakpoint = true,
            active = true, collapsed = true, drawer = true, floating = true, modal = true,
        }) or not nonempty(layout.instance_id, 160) or not nonempty(layout.panel_id, 160) then return false end
        for _, key in ipairs({ "role", "title", "breakpoint" }) do
            if layout[key] ~= nil and not nonempty(layout[key], 256) then return false end
        end
        for _, key in ipairs({ "active", "collapsed", "drawer", "floating", "modal" }) do
            if type(layout[key]) ~= "boolean" then return false end
        end
    end
    return value.geometry == nil or geometry(value.geometry)
end

local function focus(value)
    return type(value) == "table" and only_keys(value, {
        event_id = true, sequence = true, focused_at = true, realm_time_ms = true, candidate_id = true, path = true, summary = true,
    }) and nonempty(value.event_id, 128) and integer(value.sequence, 0)
        and context_attachments.attention_fields.timestamp(value.focused_at)
        and finite(value.realm_time_ms) and value.realm_time_ms >= 0
        and (value.candidate_id == nil or nonempty(value.candidate_id, 160))
        and context_attachments.attention_fields.path(value.path) and summary(value.summary)
end

local function inspection_data(value, host, operation)
    if value == nil then return true end
    if type(value) ~= "table" then return false end
    local nodes = function(item) return inspection_node(item, host) end
    if operation == "tree" or operation == "find" then
        return only_keys(value, operation == "tree" and { root = true, nodes = true } or { nodes = true })
            and (value.root == nil or node_ref(value.root, host)) and array(value.nodes, 256, nodes)
    elseif operation == "cursor" or operation == "point" then
        return only_keys(value, operation == "cursor" and { event = true, nodes = true } or { point = true, nodes = true })
            and array(value.nodes, 256, nodes)
            and (operation ~= "cursor" or value.event == nil or context_attachments.attention_fields.event(value.event))
            and (operation ~= "point" or type(value.point) == "table" and only_keys(value.point, { x = true, y = true })
                and finite(value.point.x) and finite(value.point.y))
    elseif operation == "focus" then
        return only_keys(value, { focus = true, node = true })
            and (value.focus == nil or focus(value.focus)) and (value.node == nil or nodes(value.node))
    elseif operation == "selection" then
        return only_keys(value, { selection = true, anchor = true, focus = true })
            and (value.selection == nil or context_attachments.attention_fields.selection(value.selection))
            and (value.anchor == nil or node_ref(value.anchor, host)) and (value.focus == nil or node_ref(value.focus, host))
    elseif operation == "geometry" then
        if not only_keys(value, { node = true, rect = true, clip = true, visible = true, offscreen = true, quality = true, coordinate_space = true })
            or not node_ref(value.node, host) then return false end
        return geometry({ rect = value.rect, clip = value.clip, visible = value.visible, offscreen = value.offscreen,
            quality = value.quality, coordinate_space = value.coordinate_space })
    end
    return false
end

local function request_key(delivery_handle, session_id, call_id)
    return delivery_handle .. "\0" .. session_id .. "\0" .. call_id
end

local function canonical(value)
    local value_type = type(value)
    if value_type == "nil" then
        return "n"
    end
    if value_type == "boolean" then
        return value and "b1" or "b0"
    end
    if value_type == "number" then
        return "d" .. string.format("%.17g", value)
    end
    if value_type == "string" then
        return "s" .. #value .. ":" .. value
    end
    if value_type ~= "table" then
        return value_type
    end
    local keys = {}
    for key, _ in pairs(value) do
        keys[#keys + 1] = key
    end
    table.sort(keys, function(left, right)
        return tostring(left) < tostring(right)
    end)
    local parts = { "t", #keys, "[" }
    for _, key in ipairs(keys) do
        parts[#parts + 1] = canonical(key)
        parts[#parts + 1] = canonical(value[key])
    end
    parts[#parts + 1] = "]"
    return table.concat(parts)
end

local function bounded(value, budget, depth)
    if depth > 48 or budget.nodes <= 0 or budget.bytes <= 0 then return false end
    budget.nodes = budget.nodes - 1
    local kind = type(value)
    budget.bytes = budget.bytes - (kind == "string" and #value + 8 or 24)
    if kind == "number" then return finite(value) and budget.bytes >= 0 end
    if kind == "table" then
        for key, item in pairs(value) do
            if not bounded(key, budget, depth + 1) or not bounded(item, budget, depth + 1) then return false end
        end
        return budget.bytes >= 0
    end
    return (kind == "nil" or kind == "string" or kind == "boolean") and budget.bytes >= 0
end

local function request_fingerprint(registry_id, args)
    return hash.sha256(canonical({ registry_id = registry_id, args = args }))
end

local function valid_capture(capture)
    if type(capture) ~= "table"
        or not only_keys(capture, {
            scope = true,
            region = true,
            allow_adjustment = true,
            allow_viewport_choice = true,
            format = true,
        }) then
        return false
    end
    local scope = capture.scope or "target"
    if scope ~= "target" and scope ~= "region" and scope ~= "viewport" then
        return false
    end
    if scope == "region" and not valid_rect(capture.region) then
        return false
    end
    if capture.region ~= nil and not valid_rect(capture.region) then
        return false
    end
    if capture.allow_adjustment ~= nil and type(capture.allow_adjustment) ~= "boolean" then
        return false
    end
    if capture.allow_viewport_choice ~= nil and type(capture.allow_viewport_choice) ~= "boolean" then
        return false
    end
    if capture.format ~= nil and capture.format ~= "image/png" and capture.format ~= "image/webp" then
        return false
    end
    return true
end

local function sanitize_capture(capture)
    return {
        scope = capture.scope or "target",
        region = capture.region and {
            x = capture.region.x,
            y = capture.region.y,
            width = capture.region.width,
            height = capture.region.height,
        } or nil,
        allow_adjustment = capture.allow_adjustment ~= false,
        allow_viewport_choice = capture.allow_viewport_choice == true,
        format = capture.format or "image/png",
    }
end

local function validate_args(mode, args, host_instance_id)
    if mode == "inspect" then
        local operations = { cursor = true, focus = true, selection = true, point = true, tree = true, find = true, geometry = true }
        if not bounded(args, { nodes = 2048, bytes = 16384 }, 0)
            or type(args) ~= "table" or not only_keys(args, { operation = true, scope = true, args = true })
            or not operations[args.operation] or type(args.args or {}) ~= "table" or type(args.scope or {}) ~= "table" then
            return nil, "invalid inspection query"
        end
        local scope = args.scope or {}
        if not only_keys(scope, { fromRoot = true, node = true }) or scope.fromRoot ~= nil and scope.fromRoot ~= true then
            return nil, "invalid inspection scope"
        end
        local node = scope.node
        if node ~= nil and (type(node) ~= "table" or not only_keys(node, { node_id = true, host_instance_id = true, mount_id = true, generation = true })
            or not node_ref(node, host_instance_id)) then
            return nil, "invalid inspection node"
        end
        -- Preserve object shape through JSON even when an observation has no args.
        -- Empty array tables are not valid public inspection argument objects.
        local query_args = table.create(0, 1)
        for key, value in pairs(args.args or {}) do query_args[key] = value end
        local allowed = { x = true, y = true, coordinate_space = true, radius_css_px = true, step_css_px = true, query = true, limit = true, depth = true, continuation = true, node = true }
        if not only_keys(query_args, allowed) or #canonical(args) > 16384 then return nil, "inspection request exceeds limits" end
        return { query = { operation = args.operation, scope = { fromRoot = true, node = node }, args = query_args }, targets = {} }, nil
    end
    if type(args) ~= "table" then
        return nil, "arguments must be an object"
    end
    if args.prompt ~= nil and (type(args.prompt) ~= "string" or #args.prompt > 512) then
        return nil, "prompt is invalid"
    end
    local targets = args.targets or {}
    if type(targets) ~= "table" or #targets > 32 then
        return nil, "targets are invalid"
    end
    if (mode == "highlight" or mode == "confirm" or mode == "capture_visual") and #targets == 0 then
        return nil, "targets are required"
    end
    local sanitized_targets = {}
    for _, target in ipairs(targets) do
        if not valid_target(target) or target.host_instance_id ~= host_instance_id then
            return nil, "target reference is invalid"
        end
        sanitized_targets[#sanitized_targets + 1] = sanitize_target(target)
    end
    if args.allow_pointer ~= nil and type(args.allow_pointer) ~= "boolean" then
        return nil, "allow_pointer is invalid"
    end
    if args.allow_keyboard ~= nil and type(args.allow_keyboard) ~= "boolean" then
        return nil, "allow_keyboard is invalid"
    end
    if args.capture_region ~= nil and type(args.capture_region) ~= "boolean" then
        return nil, "capture_region is invalid"
    end
    if mode == "capture_visual" and not valid_capture(args.capture or {}) then
        return nil, "capture is invalid"
    end
    if mode ~= "capture_visual" and args.capture ~= nil then
        return nil, "capture is not allowed"
    end
    if mode == "capture_visual" and args.capture_region ~= nil then
        return nil, "capture_region is not allowed"
    end
    local capture_region
    if mode ~= "capture_visual" then
        capture_region = args.capture_region == true
    end
    return {
        prompt = args.prompt,
        targets = sanitized_targets,
        allow_pointer = args.allow_pointer ~= false,
        allow_keyboard = args.allow_keyboard ~= false,
        capture_region = capture_region,
        capture = mode == "capture_visual" and sanitize_capture(args.capture or {}) or nil,
    }, nil
end

local function validate_result(result)
    if type(result) ~= "table"
        or not only_keys(result, {
            schema = true,
            message_type = true,
            result_id = true,
            in_reply_to_action_id = true,
            request_id = true,
            session_id = true,
            host_instance_id = true,
            completed_at = true,
            status = true,
            selected_target = true,
            prepared_file = true,
            reason = true,
            inspection = true,
            targets = true,
        })
        or result.schema ~= SCHEMA
        or result.message_type ~= "result"
        or not nonempty(result.result_id, 128)
        or not nonempty(result.in_reply_to_action_id, 128)
        or not nonempty(result.request_id, 128)
        or not nonempty(result.session_id, 128)
        or not nonempty(result.host_instance_id, 160)
        or not nonempty(result.completed_at, 64)
        or not RESULT_STATUSES[result.status] then
        return nil, "result envelope is invalid"
    end
    if result.reason ~= nil and (type(result.reason) ~= "string" or #result.reason > 512) then
        return nil, "result reason is invalid"
    end
    if result.selected_target ~= nil and not valid_target(result.selected_target) then
        return nil, "selected target is invalid"
    end
    if result.status == "inspected" then
        local inspection = result.inspection
        local outcomes = { ok = true, empty = true, cleared = true, unknown = true, partial = true, unavailable = true, stale = true, cancelled = true }
        if not bounded(inspection, { nodes = 32768, bytes = 262144 }, 0)
            or type(inspection) ~= "table" or not only_keys(inspection, {
            request_id = true, host_instance_id = true, measured_at = true, revisions = true,
            outcome = true, data = true, omissions = true, continuation = true,
        }) or inspection.host_instance_id ~= result.host_instance_id or not nonempty(inspection.request_id, 256)
            or not outcomes[inspection.outcome] or #canonical(inspection) > 98304
            or type(inspection.revisions) ~= "table" or type(inspection.omissions) ~= "table" then
            return nil, "invalid inspection result"
        end
        if not context_attachments.attention_fields.timestamp(inspection.measured_at)
            or not only_keys(inspection.revisions, { tree = true, observation = true, geometry = true })
            or not integer(inspection.revisions.tree, 0) or not integer(inspection.revisions.observation, 0)
            or not integer(inspection.revisions.geometry, 0)
            or inspection.continuation ~= nil and not nonempty(inspection.continuation, 160)
            or not array(inspection.omissions, 256, function(item)
                return type(item) == "table" and only_keys(item, { node = true, reason = true })
                    and nonempty(item.reason, 64) and (item.node == nil or node_ref(item.node, result.host_instance_id))
            end) then return nil, "invalid inspection metadata" end
        if not array(result.targets, 32, function(item)
            return valid_target(item) and item.host_instance_id == result.host_instance_id
        end) then return nil, "invalid inspection targets" end
    elseif result.inspection ~= nil or result.targets ~= nil then
        return nil, "inspection data is not allowed for terminal status"
    end
    local prepared_file = result.prepared_file
    local prepared_file_valid = type(prepared_file) == "table"
        and only_keys(prepared_file, {
            uuid = true,
            name = true,
            mime_type = true,
            byte_size = true,
            sha256 = true,
            scope = true,
        })
        and nonempty(prepared_file.uuid, 160)
        and nonempty(prepared_file.name, 256)
        and (prepared_file.mime_type == "image/png" or prepared_file.mime_type == "image/webp")
        and type(prepared_file.byte_size) == "number"
        and prepared_file.byte_size % 1 == 0
        and prepared_file.byte_size > 0
        and prepared_file.byte_size <= 1048576
        and nonempty(prepared_file.sha256, 71)
        and string.match(prepared_file.sha256, "^sha256:[a-f0-9]+$") ~= nil
        and #prepared_file.sha256 == 71
        and (prepared_file.scope == "target" or prepared_file.scope == "region" or prepared_file.scope == "viewport")
    if (result.status == "selected" or result.status == "confirmed") and result.selected_target == nil then
        return nil, "selected target is required for terminal status"
    end
    if result.status ~= "selected" and result.status ~= "confirmed" and result.selected_target ~= nil then
        return nil, "selected target is not allowed for terminal status"
    end
    if result.status == "prepared" and not prepared_file_valid then
        return nil, "prepared file is required for terminal status"
    end
    if result.status ~= "prepared" and prepared_file ~= nil then
        return nil, "prepared file is not allowed for terminal status"
    end
    return {
        schema = SCHEMA,
        message_type = "result",
        result_id = result.result_id,
        in_reply_to_action_id = result.in_reply_to_action_id,
        request_id = result.request_id,
        session_id = result.session_id,
        host_instance_id = result.host_instance_id,
        completed_at = result.completed_at,
        status = result.status,
        inspection = result.inspection,
        targets = result.targets,
        selected_target = result.selected_target and sanitize_target(result.selected_target) or nil,
        prepared_file = prepared_file_valid and {
            uuid = prepared_file.uuid,
            name = prepared_file.name,
            mime_type = prepared_file.mime_type,
            byte_size = prepared_file.byte_size,
            sha256 = prepared_file.sha256,
            scope = prepared_file.scope,
        } or nil,
        reason = result.reason,
    }, nil
end

function ui_action_broker.new(deps): any
    assert(type(deps) == "table", "broker dependencies are required")
    assert(type(deps.send) == "function", "send dependency is required")
    assert(type(deps.new_id) == "function", "new_id dependency is required")
    assert(type(deps.now) == "function", "now dependency is required")
    assert(type(deps.format_time) == "function", "format_time dependency is required")
    local ttl_seconds = deps.ttl_seconds or DEFAULT_TTL_SECONDS
    assert(type(ttl_seconds) == "number"
        and ttl_seconds % 1 == 0
        and ttl_seconds >= 1
        and ttl_seconds <= MAX_TTL_SECONDS, "ttl_seconds must be an integer between 1 and 120")
    return setmetatable({
        deps = deps,
        ttl_seconds = ttl_seconds,
        bindings = {},
        pending = {},
        completed = {},
        requests = {},
        request_count = 0,
        monitor_refs = {},
    }, ui_action_broker)
end

function ui_action_broker:_monitor(pid)
    local refs = self.monitor_refs[pid] or 0
    if refs == 0 and self.deps.monitor then
        local monitored, monitor_err = self.deps.monitor(pid)
        if monitored == false or monitored == nil and monitor_err ~= nil then
            return false, monitor_err or "process monitor failed"
        end
    end
    self.monitor_refs[pid] = refs + 1
    return true, nil
end

function ui_action_broker:_unmonitor(pid)
    local refs = self.monitor_refs[pid]
    if not refs then
        return
    end
    if refs > 1 then
        self.monitor_refs[pid] = refs - 1
        return
    end
    self.monitor_refs[pid] = nil
    if self.deps.unmonitor then
        return self.deps.unmonitor(pid)
    end
    return true, nil
end

function ui_action_broker:_remove_binding(session_id)
    local binding = self.bindings[session_id]
    if binding then
        self.bindings[session_id] = nil
        self:_unmonitor(binding.conn_pid)
    end
end

function ui_action_broker:_make_result(action, status, reason)
    return {
        schema = SCHEMA,
        message_type = "result",
        result_id = self.deps.new_id(),
        in_reply_to_action_id = action.action_id,
        request_id = action.request_id,
        session_id = action.session_id,
        host_instance_id = action.host_instance_id,
        completed_at = self.deps.format_time(self.deps.now()),
        status = status,
        reason = reason,
    }
end

function ui_action_broker:_finish(action, result)
    local pending_key = action.pending_key or action.session_id
    if self.pending[pending_key] ~= action then
        return false
    end
    self.pending[pending_key] = nil
    local completed = {
        expires_at = math.max(action.expires_at, self.deps.now() + self.ttl_seconds),
        ingress_pid = action.ingress_pid,
        conn_pid = action.conn_pid,
        session_id = action.session_id,
        request_id = action.request_id,
        host_instance_id = action.host_instance_id,
        registry_id = action.registry_id,
        waiter_pid = action.waiter_pid,
        delivery_handle = action.delivery_handle,
        user_id = action.user_id,
        fingerprint = action.fingerprint,
        result = result,
    }
    self.completed[action.action_id] = completed
    self.requests[request_key(action.delivery_handle, action.session_id, action.request_id)] = completed
    self:_unmonitor(action.waiter_pid)
    local sent, send_err = self.deps.send(action.waiter_pid, action.reply_topic, result)
    if sent == false or sent == nil and send_err ~= nil then
        return false, send_err or "UI action result delivery failed"
    end
    return true, nil
end

function ui_action_broker:_cache_rejection(action, result)
    local completed = {
        expires_at = self.deps.now() + self.ttl_seconds,
        ingress_pid = action.ingress_pid,
        conn_pid = action.conn_pid,
        session_id = action.session_id,
        request_id = action.request_id,
        host_instance_id = action.host_instance_id,
        registry_id = action.registry_id,
        waiter_pid = action.waiter_pid,
        delivery_handle = action.delivery_handle,
        user_id = action.user_id,
        fingerprint = action.fingerprint,
        result = result,
    }
    self.completed[action.action_id] = completed
    self.requests[request_key(action.delivery_handle, action.session_id, action.request_id)] = completed
    self.request_count = self.request_count + 1
    return completed
end

function ui_action_broker:_remove_completed(action_id, completed)
    if self.completed[action_id] ~= completed then
        return
    end
    self.completed[action_id] = nil
    local cache_key = request_key(completed.delivery_handle, completed.session_id, completed.request_id)
    if self.requests[cache_key] == completed then
        self.requests[cache_key] = nil
        self.request_count = math.max(0, self.request_count - 1)
    end
end

function ui_action_broker:_reject_request(waiter_pid, binding, request, status, reason, fingerprint)
    local action = {
        action_id = self.deps.new_id(),
        request_id = request.call_id,
        reply_topic = request.reply_topic,
        session_id = binding.session_id,
        host_instance_id = binding.host_instance_id,
        user_id = binding.user_id,
        ingress_pid = binding.ingress_pid,
        conn_pid = binding.conn_pid,
        delivery_handle = binding.delivery_handle,
        registry_id = request.registry_id,
    }
    action.fingerprint = fingerprint or request_fingerprint(request.registry_id, { rejection = reason })
    local result = self:_make_result(action, status or "unavailable", reason)
    self:_cache_rejection(action, result)
    return self.deps.send(waiter_pid, action.reply_topic, result)
end

function ui_action_broker:_reject_unbound_request(waiter_pid, request, reason)
    if not nonempty(waiter_pid, 256)
        or type(request) ~= "table"
        or not TOOL_MODES[request.registry_id]
        or not nonempty(request.delivery_handle, 128)
        or not nonempty(request.call_id, 128)
        or request.reply_topic ~= result_topic(request.call_id)
        or not nonempty(request.session_id, 128)
        or not nonempty(request.host_instance_id, 160) then
        return false, "unauthorized tool request"
    end
    local action = {
        action_id = self.deps.new_id(),
        request_id = request.call_id,
        reply_topic = request.reply_topic,
        session_id = request.session_id,
        host_instance_id = request.host_instance_id,
    }
    local sent, send_err = self.deps.send(
        waiter_pid,
        action.reply_topic,
        self:_make_result(action, "unavailable", reason)
    )
    if sent == false or sent == nil and send_err ~= nil then
        return false, send_err or "UI action rejection delivery failed"
    end
    return false, reason
end

function ui_action_broker:bind_turn(fields)
    if type(fields) ~= "table"
        or type(fields.agent_actions_enabled) ~= "boolean"
        or not nonempty(fields.user_id, 160)
        or not nonempty(fields.session_id, 128)
        or not nonempty(fields.session_pid, 256)
        or not nonempty(fields.ingress_pid, 256)
        or not nonempty(fields.conn_pid, 256)
        or not nonempty(fields.host_instance_id, 160) then
        return nil, "ui actions are unavailable for this turn"
    end

    local prior = self.bindings[fields.session_id]
    if prior and prior.user_id ~= fields.user_id then
        return nil, "ui actions are unavailable for this turn"
    end

    self:cancel_session(fields.session_id, "unavailable", "turn route replaced")

    local now = self.deps.now()
    local binding = {
        delivery_handle = self.deps.new_id(),
        user_id = fields.user_id,
        session_id = fields.session_id,
        session_pid = fields.session_pid,
        ingress_pid = fields.ingress_pid,
        conn_pid = fields.conn_pid,
        host_instance_id = fields.host_instance_id,
        turn_request_id = fields.request_id,
        agent_actions_authorized = fields.agent_actions_enabled,
        expires_at = now + self.ttl_seconds,
    }
    local monitored, monitor_err = self:_monitor(fields.conn_pid)
    if not monitored then
        return nil, monitor_err or "ui action route monitor failed"
    end
    self.bindings[fields.session_id] = binding
    return {
        delivery_handle = binding.delivery_handle,
        session_id = binding.session_id,
        host_instance_id = binding.host_instance_id,
        inspection_authorized = true,
        agent_actions_authorized = binding.agent_actions_authorized,
    }, nil
end

function ui_action_broker:request(waiter_pid, request)
    if type(request) ~= "table" or not nonempty(waiter_pid, 256) then
        return false, "invalid internal request"
    end
    local mode = TOOL_MODES[request.registry_id]
    if not mode or not nonempty(request.delivery_handle, 128) or not nonempty(request.call_id, 128)
        or request.reply_topic ~= result_topic(request.call_id)
        or not nonempty(request.session_id, 128) or not nonempty(request.host_instance_id, 160) then
        return false, "unauthorized tool request"
    end

    local binding = nil
    for _, candidate in pairs(self.bindings) do
        if candidate.delivery_handle == request.delivery_handle then
            binding = candidate
            break
        end
    end
    if not binding then
        return self:_reject_unbound_request(waiter_pid, request, "ui action route is unavailable")
    end
    if request.session_id ~= binding.session_id or request.host_instance_id ~= binding.host_instance_id then
        return self:_reject_unbound_request(waiter_pid, request, "unauthorized tool request")
    end
    if mode ~= "inspect" and not binding.agent_actions_authorized then
        return self:_reject_unbound_request(waiter_pid, request, "interactive actions are not authorized for this turn")
    end

    local args, args_err = validate_args(mode, request.args, binding.host_instance_id)
    local fingerprint = args
        and request_fingerprint(request.registry_id, args)
        or hash.sha256(request.registry_id .. "\0invalid:" .. (args_err or "invalid arguments"))
    local cache_key = request_key(request.delivery_handle, request.session_id, request.call_id)
    local prior = self.requests[cache_key]
    if prior then
        if prior.expires_at <= self.deps.now() then
            if prior.action_id and self.pending[prior.pending_key or request.session_id] == prior then
                self:_finish(prior, self:_make_result(prior, "expired", "UI action expired"))
                prior = self.requests[cache_key]
            end
            if prior and prior.expires_at <= self.deps.now() then
                if prior.result then
                    self:_remove_completed(prior.result.in_reply_to_action_id, prior)
                elseif self.requests[cache_key] == prior then
                    self.requests[cache_key] = nil
                    self.request_count = math.max(0, self.request_count - 1)
                end
                prior = nil
            end
            if prior and prior.result and prior.expires_at > self.deps.now() then
                if prior.user_id ~= binding.user_id
                    or prior.host_instance_id ~= request.host_instance_id
                    or prior.registry_id ~= request.registry_id
                    or prior.delivery_handle ~= request.delivery_handle
                    or prior.fingerprint ~= fingerprint then
                    return false, "unauthorized tool request"
                end
                local sent, send_err = self.deps.send(waiter_pid, request.reply_topic, prior.result)
                if sent == false or sent == nil and send_err ~= nil then
                    return false, send_err or "UI action result redelivery failed"
                end
                return true, "duplicate"
            end
        elseif prior.result then
            if prior.user_id ~= binding.user_id
                or prior.host_instance_id ~= request.host_instance_id
                or prior.registry_id ~= request.registry_id
                or prior.delivery_handle ~= request.delivery_handle
                or prior.fingerprint ~= fingerprint then
                return false, "unauthorized tool request"
            end
            local sent, send_err = self.deps.send(waiter_pid, request.reply_topic, prior.result)
            if sent == false or sent == nil and send_err ~= nil then
                return false, send_err or "UI action result redelivery failed"
            end
            return true, "duplicate"
        elseif prior.action_id then
            if prior.delivery_handle ~= request.delivery_handle
                or prior.registry_id ~= request.registry_id
                or prior.user_id ~= binding.user_id
                or prior.fingerprint ~= fingerprint then
                return false, "UI action request correlation mismatch"
            end
            if prior.waiter_pid ~= waiter_pid then
                self:_unmonitor(prior.waiter_pid)
                local monitored, monitor_err = self:_monitor(waiter_pid)
                if not monitored then
                    return false, monitor_err or "tool process monitor failed"
                end
                prior.waiter_pid = waiter_pid
            end
            return true, prior.action_id
        end
    end
    if binding.expires_at <= self.deps.now() then
        self:_reject_request(waiter_pid, binding, request, "expired", "UI action route expired", fingerprint)
        self:_remove_binding(binding.session_id)
        return false, "ui action route is unavailable"
    end

    if self.request_count >= MAX_REQUEST_CACHE then
        return false, "UI action request capacity reached"
    end

    if args_err then
        self:_reject_request(waiter_pid, binding, request, "unavailable", args_err, fingerprint)
        return false, args_err
    end

    local now = self.deps.now()
    local action = {
        action_id = self.deps.new_id(),
        request_id = request.call_id,
        reply_topic = request.reply_topic,
        user_id = binding.user_id,
        session_id = binding.session_id,
        session_pid = binding.session_pid,
        ingress_pid = binding.ingress_pid,
        conn_pid = binding.conn_pid,
        waiter_pid = waiter_pid,
        host_instance_id = binding.host_instance_id,
        delivery_handle = binding.delivery_handle,
        registry_id = request.registry_id,
        fingerprint = fingerprint,
        mode = mode,
        inspection_operation = args.query and args.query.operation,
        targets = args.targets,
        capture = args.capture,
        expires_at = math.min(binding.expires_at, now + (mode == "inspect" and 2 or self.ttl_seconds)),
    }
    action.pending_key = mode == "inspect" and (binding.session_id .. "\0" .. action.action_id) or binding.session_id

    local read_count, total_count = 0, 0
    for _, pending in pairs(self.pending) do
        total_count = total_count + 1
        if pending.session_id == binding.session_id and pending.mode == "inspect" then read_count = read_count + 1 end
    end
    if (mode ~= "inspect" and self.pending[binding.session_id]) or (mode == "inspect" and (read_count >= 16 or total_count >= 128)) then
        self:_reject_request(
            waiter_pid,
            binding,
            request,
            "unavailable",
            "another UI action is pending",
            fingerprint
        )
        return false, "another UI action is pending"
    end

    local monitored, monitor_err = self:_monitor(waiter_pid)
    if not monitored then
        self:_reject_request(waiter_pid, binding, request, "unavailable", "tool process monitor failed", fingerprint)
        return false, monitor_err or "tool process monitor failed"
    end
    local sent, send_err = self.deps.send(binding.conn_pid, "session_ui_action_request", {
        schema = SCHEMA,
        message_type = "request",
        action_id = action.action_id,
        request_id = action.request_id,
        session_id = action.session_id,
        host_instance_id = action.host_instance_id,
        created_at = self.deps.format_time(now),
        expires_at = self.deps.format_time(action.expires_at),
        mode = mode,
        query = args.query,
        prompt = args.prompt,
        targets = mode ~= "inspect" and args.targets or nil,
        allow_pointer = args.allow_pointer,
        allow_keyboard = args.allow_keyboard,
        capture_region = args.capture_region,
        capture = args.capture,
    })
    if sent == false or sent == nil and send_err ~= nil then
        self:_unmonitor(waiter_pid)
        self:_reject_request(waiter_pid, binding, request, "unavailable", "Host UI action delivery failed", fingerprint)
        return false, send_err or "Host UI action delivery failed"
    end
    self.pending[action.pending_key] = action
    self.requests[cache_key] = action
    self.request_count = self.request_count + 1
    return true, action.action_id
end

function ui_action_broker:result(sender_pid, conn_pid, session_id, result)
    local checked, validation_err = validate_result(result)
    if not checked then
        return false, validation_err
    end
    local completed = self.completed[checked.in_reply_to_action_id]
    if completed then
        if completed.expires_at <= self.deps.now() then
            self:_remove_completed(checked.in_reply_to_action_id, completed)
        elseif sender_pid == completed.ingress_pid
            and conn_pid == completed.conn_pid
            and session_id == completed.session_id
            and checked.request_id == completed.request_id
            and checked.session_id == completed.session_id
            and checked.host_instance_id == completed.host_instance_id then
            return true, "duplicate"
        else
            return false, "UI action correlation mismatch"
        end
    end

    local action = self.pending[session_id .. "\0" .. checked.in_reply_to_action_id] or self.pending[session_id]
    if not action then
        return false, "no pending UI action"
    end
    if action.expires_at <= self.deps.now() then
        self:_finish(action, self:_make_result(action, "expired", "UI action expired"))
        return false, "UI action expired"
    end
    if sender_pid ~= action.ingress_pid
        or conn_pid ~= action.conn_pid
        or checked.in_reply_to_action_id ~= action.action_id
        or checked.request_id ~= action.request_id
        or checked.session_id ~= action.session_id
        or checked.host_instance_id ~= action.host_instance_id then
        return false, "UI action correlation mismatch"
    end
    if checked.selected_target and checked.selected_target.host_instance_id ~= action.host_instance_id then
        return false, "selected target Host mismatch"
    end
    if checked.selected_target and #action.targets > 0 and not target_in(checked.selected_target, action.targets) then
        return false, "selected target was not offered"
    end
    if (checked.status == "inspected") ~= (action.mode == "inspect" and checked.inspection ~= nil) then
        return false, "inspection result mode mismatch"
    end
    if action.mode == "inspect" then
        local statuses = { inspected = true, unavailable = true, expired = true, stale = true, error = true,
            cancelled = true, disconnected = true, ["permission-denied"] = true }
        if not statuses[checked.status] then return false, "inspection result status is invalid" end
        if checked.inspection and not inspection_data(checked.inspection.data, action.host_instance_id, action.inspection_operation) then
            return false, "invalid inspection data"
        end
    end
    if action.mode == "capture_visual" and checked.status == "prepared" then
        local validator = self.deps.validate_prepared_file
        if type(validator) ~= "function" then
            self:_finish(action, self:_make_result(action, "error", "Prepared visual validation is unavailable"))
            return false, "prepared visual validation is unavailable"
        end
        local ok, accepted, validation_error = pcall(
            validator,
            checked.prepared_file,
            action.user_id,
            action.session_id
        )
        if not ok or accepted ~= true then
            self:_finish(action, self:_make_result(action, "error", "Prepared visual failed integrity validation"))
            return false, validation_error or "prepared visual failed integrity validation"
        end
    end
    if action.mode == "capture_visual" and checked.status ~= "prepared"
        and checked.status ~= "cancelled" and checked.status ~= "denied"
        and checked.status ~= "expired" and checked.status ~= "stale"
        and checked.status ~= "disconnected" and checked.status ~= "unavailable"
        and checked.status ~= "error" then
        return false, "visual action result status is invalid"
    end
    if action.mode ~= "capture_visual" and (checked.status == "prepared" or checked.status == "denied") then
        return false, "visual result status is not allowed"
    end

    return self:_finish(action, checked)
end

function ui_action_broker:cancel(waiter_pid, request)
    if type(request) ~= "table" then
        return false
    end
    for _, action in pairs(self.pending) do
        if action.waiter_pid == waiter_pid
            and action.delivery_handle == request.delivery_handle
            and action.request_id == request.call_id then
            self:_finish(action, self:_make_result(action, "cancelled", "tool request cancelled"))
            return true
        end
    end
    return false
end

function ui_action_broker:cancel_session(session_id, status, reason)
    local actions = {}
    for _, action in pairs(self.pending) do
        if action.session_id == session_id then actions[#actions + 1] = action end
    end
    for _, action in ipairs(actions) do
        self:_finish(action, self:_make_result(action, status or "unavailable", reason))
    end
    self:_remove_binding(session_id)
end

function ui_action_broker:handle_exit(pid)
    local session_exits = {}
    for session_id, binding in pairs(self.bindings) do
        if binding.session_pid == pid then
            session_exits[#session_exits + 1] = session_id
        end
    end
    for _, session_id in ipairs(session_exits) do
        self:cancel_session(session_id, "unavailable", "session process exited")
    end

    self:handle_disconnect(pid)

    for _, action in pairs(self.pending) do
        if action.waiter_pid == pid then
            self:_finish(action, self:_make_result(action, "cancelled", "tool process exited"))
        end
    end
end

function ui_action_broker:handle_disconnect(pid)
    local disconnected_sessions = {}
    for session_id, binding in pairs(self.bindings) do
        if binding.conn_pid == pid then
            disconnected_sessions[#disconnected_sessions + 1] = session_id
        end
    end
    for _, session_id in ipairs(disconnected_sessions) do
        self:cancel_session(session_id, "disconnected", "UI action route disconnected")
    end
end

function ui_action_broker:expire()
    local now = self.deps.now()
    for _, action in pairs(self.pending) do
        if action.expires_at <= now then
            self:_finish(action, self:_make_result(action, "expired", "UI action expired"))
        end
    end
    local expired_bindings = {}
    for session_id, binding in pairs(self.bindings) do
        if binding.expires_at <= now then
            expired_bindings[#expired_bindings + 1] = session_id
        end
    end
    for _, session_id in ipairs(expired_bindings) do
        self:_remove_binding(session_id)
    end
    for action_id, completed in pairs(self.completed) do
        if completed.expires_at <= now then
            self:_remove_completed(action_id, completed)
        end
    end
end

ui_action_broker.SCHEMA = SCHEMA
ui_action_broker.MAX_TTL_SECONDS = MAX_TTL_SECONDS
ui_action_broker.TOOL_MODES = TOOL_MODES

return ui_action_broker
