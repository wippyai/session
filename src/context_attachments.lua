local json = require("json")
local hash = require("hash")
local time = require("time")
local renderer = require("renderer")

local context_attachments = {}
context_attachments._renderer = renderer
context_attachments.ATTENTION_V2_MAX_ENVELOPE_BYTES = 16384
context_attachments.MAX_EXPANDED_BYTES = 262144

local function renderer_supports(kind, version)
    local active = context_attachments._renderer
    if type(active) ~= 'table' or type(active.supports) ~= 'function' then return false end
    if kind == 'wippy.attention' and version == 2 and type(active.expand_attention_v2) ~= 'function' then return false end
    if kind == 'wippy.attention' and version == 3 and type(active.expand_attention_v3) ~= 'function' then return false end
    if kind == 'wippy.attention' and version == 4 and type(active.expand_attention_v4) ~= 'function' then return false end
    local ok, supported = pcall(active.supports, kind, version)
    return ok and supported == true
end

-- Preserve the renderer capability contract when Session is used as its wrapper.
function context_attachments.supports(kind, version)
    return renderer_supports(kind, version)
end

function context_attachments.capabilities()
    local handlers = {}
    for _, entry in ipairs({ { kind = 'wippy.attention', versions = { 1, 2, 3, 4 } },
        { kind = 'wippy.attention.visual', versions = { 1 } } }) do
        local versions = {}
        for _, version in ipairs(entry.versions) do
            if renderer_supports(entry.kind, version) then versions[#versions + 1] = version end
        end
        if #versions > 0 then handlers[#handlers + 1] = { kind = entry.kind, versions = versions } end
    end
    return { version = 1, handlers = handlers }
end

context_attachments.MAX_COUNT = 8
context_attachments.MAX_TOTAL_BYTES = 32 * 1024
context_attachments.MAX_ATTACHMENT_BYTES = 32 * 1024
context_attachments.ATTENTION_KIND = "wippy.attention"
context_attachments.ATTENTION_VERSION = 1
context_attachments.ATTENTION_SCHEMA = "wippy.attention.v1"
context_attachments.VISUAL_KIND = "wippy.attention.visual"
context_attachments.VISUAL_VERSION = 1
context_attachments.VISUAL_SCHEMA = "wippy.attention.visual.v1"
context_attachments.VISUAL_MAX_BYTES = 1024 * 1024
context_attachments.VISUAL_MAX_DIMENSION = 2048
context_attachments.VISUAL_MAX_PIXELS = 4194304
context_attachments.MAX_JSON_DEPTH = 32
context_attachments.MAX_SAFE_INTEGER = 9007199254740991

local function failure(code, path, message, attachment_id)
    return {
        code = code,
        path = path,
        message = message,
        attachment_id = attachment_id
    }
end

local function is_array(value)
    if type(value) ~= "table" then
        return false
    end
    local encoded, err = json.encode(value)
    return not err and encoded:sub(1, 1) == "["
end

local function validate_json_depth(value, depth, seen)
    if depth > context_attachments.MAX_JSON_DEPTH then
        return false, "Context attachment JSON exceeds the maximum depth of 32"
    end
    if type(value) ~= "table" then
        return true
    end
    seen = seen or {}
    if seen[value] then
        return false, "Context attachment JSON must not contain cycles"
    end
    seen[value] = true
    for _, child in pairs(value) do
        local valid, err = validate_json_depth(child, depth + 1, seen)
        if not valid then
            return false, err
        end
    end
    seen[value] = nil
    return true
end

local function canonical_json(value, depth_checked)
    if not depth_checked then
        local valid, depth_err = validate_json_depth(value, 0)
        if not valid then
            return nil, depth_err
        end
    end
    local value_type = type(value)
    if value_type ~= "table" then
        local encoded, err = json.encode(value)
        if err then
            return nil, tostring(err)
        end
        return encoded
    end

    if is_array(value) then
        local parts = {}
        for i = 1, #value do
            local encoded, err = canonical_json(value[i], true)
            if not encoded then
                return nil, err
            end
            table.insert(parts, encoded)
        end
        return "[" .. table.concat(parts, ",") .. "]"
    end

    local keys = {}
    for key, _ in pairs(value) do
        if type(key) ~= "string" then
            return nil, "JSON object keys must be strings"
        end
        table.insert(keys, key)
    end
    table.sort(keys)

    local parts = {}
    for _, key in ipairs(keys) do
        local encoded_key, key_err = json.encode(key)
        if key_err then
            return nil, tostring(key_err)
        end
        local encoded_value, value_err = canonical_json(value[key], true)
        if not encoded_value then
            return nil, value_err
        end
        table.insert(parts, encoded_key .. ":" .. encoded_value)
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

context_attachments.canonical_json = canonical_json

local function is_string(value, max_length, allow_empty)
    return type(value) == "string"
        and (allow_empty or #value > 0)
        and #value <= max_length
end

local function is_number(value)
    return type(value) == "number" and value == value and value ~= math.huge and value ~= -math.huge
end

local function is_integer(value, minimum, maximum)
    maximum = maximum or context_attachments.MAX_SAFE_INTEGER
    return is_number(value) and value % 1 == 0 and value >= minimum and value <= maximum
end

local function has_only_keys(value, allowed)
    if type(value) ~= "table" then
        return false
    end
    for key, _ in pairs(value) do
        if not allowed[key] then
            return false
        end
    end
    return true
end

local function is_timestamp(value)
    if not is_string(value, 64, false) then
        return false
    end
    local year, month, day, hour, minute, second, fraction = string.match(
        value,
        "^(%d%d%d%d)%-(%d%d)%-(%d%d)T(%d%d):(%d%d):(%d%d)%.(%d+)Z$"
    )
    if not year then
        year, month, day, hour, minute, second = string.match(
            value,
            "^(%d%d%d%d)%-(%d%d)%-(%d%d)T(%d%d):(%d%d):(%d%d)Z$"
        )
    end
    if not year or (fraction and #fraction > 9) then
        return false
    end
    local year_number = tonumber(year) or 0
    local month_number = tonumber(month) or 0
    local day_number = tonumber(day) or 0
    local hour_number = tonumber(hour) or -1
    local minute_number = tonumber(minute) or -1
    local second_number = tonumber(second) or -1
    if year_number < 1 then
        return false
    end
    if month_number < 1 or month_number > 12 then
        return false
    end
    if day_number < 1 then
        return false
    end
    if hour_number < 0 or hour_number > 23 then
        return false
    end
    if minute_number < 0 or minute_number > 59 then
        return false
    end
    if second_number < 0 or second_number > 59 then
        return false
    end
    local leap_year = year_number % 4 == 0 and (year_number % 100 ~= 0 or year_number % 400 == 0)
    local days_in_month = { 31, leap_year and 29 or 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 }
    if day_number > days_in_month[month_number] then
        return false
    end
    local parsed, err = time.parse(time.RFC3339, value)
    return parsed ~= nil and err == nil
end

local function is_frame_origin(value)
    if value == nil or value == "about:srcdoc" then
        return true
    end
    return is_string(value, 2048, false)
        and (string.match(value, "^http://[^/%?#@]+$") ~= nil
            or string.match(value, "^https://[^/%?#@]+$") ~= nil)
end

local function is_point(value)
    return type(value) == "table"
        and has_only_keys(value, { x = true, y = true })
        and is_number(value.x)
        and is_number(value.y)
end

local function is_query_point(value)
    return type(value) == "table"
        and has_only_keys(value, { point_id = true, x = true, y = true })
        and is_string(value.point_id, 128, false)
        and is_number(value.x)
        and is_number(value.y)
end

local function is_rect(value)
    return type(value) == "table"
        and has_only_keys(value, { x = true, y = true, width = true, height = true })
        and is_number(value.x)
        and is_number(value.y)
        and is_number(value.width)
        and value.width >= 0
        and is_number(value.height)
        and value.height >= 0
end

local function is_action_ref(value)
    return type(value) == "table"
        and has_only_keys(value, {
            snapshot_id = true,
            target_id = true,
            host_instance_id = true,
            mount_id = true,
            generation = true,
            path_digest = true,
            rect = true,
            label = true
        })
        and is_string(value.snapshot_id, 128, false)
        and is_string(value.target_id, 128, false)
        and is_string(value.host_instance_id, 160, false)
        and is_string(value.mount_id, 160, false)
        and is_integer(value.generation, 0)
        and is_string(value.path_digest, 71, false)
        and string.match(value.path_digest, "^sha256:[a-f0-9]+$") ~= nil
        and #value.path_digest == 71
        and is_rect(value.rect)
        and (value.label == nil or is_string(value.label, 256, true))
end

local function same_rect(left, right)
    return left.x == right.x
        and left.y == right.y
        and left.width == right.width
        and left.height == right.height
end

local function attention_path_digest_matches(path, expected)
    local semantic_path = {}
    local geometry_keys = {
        rect = true,
        clip_rect = true,
        local_to_parent = true,
        coordinate_quality = true
    }
    for _, segment in ipairs(path) do
        local semantic = {}
        for key, value in pairs(segment) do
            if not geometry_keys[key] then semantic[key] = value end
        end
        table.insert(semantic_path, semantic)
    end
    local semantic_json = canonical_json(semantic_path)
    if semantic_json then
        local semantic_digest = hash.sha256(semantic_json)
        if semantic_digest and expected == "sha256:" .. semantic_digest then return true end
    end
    local legacy_json = canonical_json(path)
    if not legacy_json then return false end
    local legacy_digest = hash.sha256(legacy_json)
    return legacy_digest ~= nil and expected == "sha256:" .. legacy_digest
end

local function is_transform(value)
    if type(value) ~= "table"
        or not has_only_keys(value, { matrix = true, convention = true, direction = true })
        or not is_array(value.matrix)
        or #value.matrix ~= 16
        or value.convention ~= "dommatrix-column-major"
        or value.direction ~= "local-to-parent" then
        return false
    end
    for _, member in ipairs(value.matrix) do
        if not is_number(member) then
            return false
        end
    end
    return true
end

local realm_kinds = {
    host = true,
    panel = true,
    artifact = true,
    page = true,
    iframe = true,
    ["web-fragment"] = true,
    ["web-component"] = true,
    ["shadow-root"] = true,
    element = true
}

local function is_path(value)
    if not is_array(value) or #value < 1 or #value > 32 then
        return false
    end
    for _, segment in ipairs(value) do
        if type(segment) ~= "table"
            or not has_only_keys(segment, {
                kind = true,
                mount_id = true,
                generation = true,
                label = true,
                panel_id = true,
                surface_id = true,
                artifact_id = true,
                page_id = true,
                package_id = true,
                tag_name = true,
                selector_hint = true,
                frame_origin = true,
                rect = true,
                clip_rect = true,
                local_to_parent = true,
                coordinate_quality = true
            })
            or not realm_kinds[segment.kind]
            or not is_string(segment.mount_id, 160, false)
            or not is_integer(segment.generation, 0)
            or (segment.label ~= nil and not is_string(segment.label, 256, true))
            or (segment.panel_id ~= nil and not is_string(segment.panel_id, 128, true))
            or (segment.surface_id ~= nil and not is_string(segment.surface_id, 128, true))
            or (segment.artifact_id ~= nil and not is_string(segment.artifact_id, 128, true))
            or (segment.page_id ~= nil and not is_string(segment.page_id, 128, true))
            or (segment.package_id ~= nil and not is_string(segment.package_id, 256, true))
            or (segment.tag_name ~= nil and not is_string(segment.tag_name, 128, true))
            or (segment.selector_hint ~= nil and not is_string(segment.selector_hint, 512, true))
            or not is_frame_origin(segment.frame_origin)
            or (segment.rect ~= nil and not is_rect(segment.rect))
            or (segment.clip_rect ~= nil and not is_rect(segment.clip_rect))
            or (segment.local_to_parent ~= nil and not is_transform(segment.local_to_parent))
            or (segment.coordinate_quality ~= nil and segment.coordinate_quality ~= "exact" and segment.coordinate_quality ~= "approximate") then
            return false
        end
    end
    return true
end

local selection_directions = {
    none = true,
    forward = true,
    backward = true
}

local function is_mount_ref(value)
    return type(value) == "table"
        and has_only_keys(value, { mount_id = true, generation = true })
        and is_string(value.mount_id, 160, false)
        and is_integer(value.generation, 0)
end

local function is_selection(value)
    if type(value) ~= "table"
        or not has_only_keys(value, {
            selection_id = true,
            selected_at = true,
            kind = true,
            collapsed = true,
            direction = true,
            text = true,
            anchor_path = true,
            focus_path = true,
            ranges = true
        })
        or not is_string(value.selection_id, 128, false)
        or not is_timestamp(value.selected_at)
        or value.kind ~= "text"
        or value.collapsed ~= false
        or selection_directions[value.direction] ~= true
        or not is_string(value.text, 1024, true)
        or not is_path(value.anchor_path)
        or not is_path(value.focus_path)
        or not is_array(value.ranges)
        or #value.ranges > 4 then
        return false
    end
    for _, range in ipairs(value.ranges) do
        if type(range) ~= "table"
            or not has_only_keys(range, { rect = true, coordinate_space = true })
            or not is_rect(range.rect)
            or (range.coordinate_space ~= "host-viewport" and not is_mount_ref(range.coordinate_space)) then
            return false
        end
    end
    return true
end

local function is_summary(value)
    if type(value) ~= "table"
        or not has_only_keys(value, { role = true, name = true, text = true, value = true, state = true }) then
        return false
    end
    local lengths = { role = 256, name = 256, text = 1024, value = 256 }
    for key, max_length in pairs(lengths) do
        if value[key] ~= nil and not is_string(value[key], max_length, true) then
            return false
        end
    end
    if value.state ~= nil then
        if type(value.state) ~= "table" or is_array(value.state) then
            return false
        end
        for key, member in pairs(value.state) do
            local member_type = type(member)
            if type(key) ~= "string"
                or (member_type ~= "boolean" and member_type ~= "number" and member_type ~= "string" and member ~= nil)
                or (member_type == "number" and not is_number(member)) then
                return false
            end
        end
    end
    return true
end

local event_types = {
    pointermove = true,
    pointerdown = true,
    pointerup = true,
    click = true,
    touchstart = true,
    touchend = true
}

local pointer_types = {
    mouse = true,
    pen = true,
    touch = true,
    unknown = true
}

local function is_observed_event(value)
    if type(value) ~= "table"
        or not has_only_keys(value, {
            event_id = true,
            sequence = true,
            type = true,
            observed_at = true,
            realm_time_ms = true,
            point = true,
            pointer_id = true,
            pointer_type = true,
            buttons = true,
            pointer_capture = true,
            candidate_ids = true
        })
        or not is_string(value.event_id, 128, false)
        or not is_integer(value.sequence, 0)
        or event_types[value.type] ~= true
        or not is_timestamp(value.observed_at)
        or not is_number(value.realm_time_ms)
        or value.realm_time_ms < 0
        or not is_point(value.point)
        or (value.pointer_id ~= nil and not is_integer(value.pointer_id, -context_attachments.MAX_SAFE_INTEGER))
        or (value.pointer_type ~= nil and pointer_types[value.pointer_type] ~= true)
        or (value.buttons ~= nil and not is_integer(value.buttons, 0))
        or (value.pointer_capture ~= nil and type(value.pointer_capture) ~= "boolean")
        or not is_array(value.candidate_ids)
        or #value.candidate_ids > 128 then
        return false
    end
    local candidate_ids = {}
    for _, candidate_id in ipairs(value.candidate_ids) do
        if not is_string(candidate_id, 128, false) or candidate_ids[candidate_id] then
            return false
        end
        candidate_ids[candidate_id] = true
    end
    return true
end

local omission_reasons = {
    ["candidate-budget"] = true,
    ["capability-unavailable"] = true,
    ["child-disconnected"] = true,
    ["child-timeout"] = true,
    clipped = true,
    ["depth-limit"] = true,
    excluded = true,
    navigation = true,
    ["non-invertible-transform"] = true,
    occluded = true,
    ["point-budget"] = true,
    redacted = true,
    ["response-budget"] = true,
    ["runtime-metadata-unavailable"] = true,
    ["stale-mount"] = true,
    ["unsupported-transform"] = true,
    ["unsupported-boundary"] = true
}

local capture_codes = {
    ["byte-limit"] = true,
    ["capture-unavailable"] = true,
    ["dimension-limit"] = true,
    disabled = true,
    ["encode-failed"] = true,
    ["permission-denied"] = true,
    ["pixel-limit"] = true,
    ["privacy-excluded"] = true,
    ["redaction-applied"] = true,
    ["stale-target"] = true,
    ["store-failed"] = true,
    timeout = true
}

local forbidden_context_keys = {
    authorization = true,
    broker_pid = true,
    capability_token = true,
    connection_target = true,
    delivery_handle = true,
    node_handle = true,
    reflection_handle = true,
    result_channel = true,
    runtime_context = true,
    signed_url = true,
    target_token = true,
    ui_action_runtime = true
}

local function contains_forbidden_context_key(value, allow_visual_authorization)
    if type(value) ~= "table" then
        return false
    end
    for key, child in pairs(value) do
        if forbidden_context_keys[key] and not (allow_visual_authorization and key == "authorization") then
            return true
        end
        if contains_forbidden_context_key(child, allow_visual_authorization) then
            return true
        end
    end
    return false
end

local function validate_visual(payload)
    if type(payload) ~= "table"
        or not has_only_keys(payload, {
            schema = true,
            capture_id = true,
            snapshot_id = true,
            host_instance_id = true,
            created_at = true,
            expires_at = true,
            candidate_ids = true,
            region = true,
            media = true,
            reference = true,
            authorization = true,
            redactions_applied = true,
        })
        or payload.schema ~= context_attachments.VISUAL_SCHEMA
        or not is_string(payload.capture_id, 160, false)
        or not is_string(payload.snapshot_id, 160, false)
        or not is_string(payload.host_instance_id, 160, false)
        or not is_timestamp(payload.created_at)
        or not is_timestamp(payload.expires_at)
        or not is_array(payload.candidate_ids)
        or #payload.candidate_ids == 0
        or #payload.candidate_ids > 128
        or not is_rect(payload.region)
        or not is_integer(payload.redactions_applied, 0)
        or payload.redactions_applied > 4096 then
        return false
    end
    local candidate_ids = {}
    for _, candidate_id in ipairs(payload.candidate_ids) do
        if not is_string(candidate_id, 160, false) or candidate_ids[candidate_id] then
            return false
        end
        candidate_ids[candidate_id] = true
    end
    local media = payload.media
    if type(media) ~= "table"
        or not has_only_keys(media, {
            content_type = true,
            content_bytes = true,
            content_hash = true,
            pixel_width = true,
            pixel_height = true,
        })
        or media.content_type ~= "image/png" and media.content_type ~= "image/webp"
        or not is_integer(media.content_bytes, 1)
        or media.content_bytes > context_attachments.VISUAL_MAX_BYTES
        or not is_string(media.content_hash, 71, false)
        or string.match(media.content_hash, "^sha256:[a-f0-9]+$") == nil
        or #media.content_hash ~= 71
        or not is_integer(media.pixel_width, 1)
        or media.pixel_width > context_attachments.VISUAL_MAX_DIMENSION
        or not is_integer(media.pixel_height, 1)
        or media.pixel_height > context_attachments.VISUAL_MAX_DIMENSION
        or media.pixel_width * media.pixel_height > context_attachments.VISUAL_MAX_PIXELS then
        return false
    end
    local reference = payload.reference
    local authorization = payload.authorization
    return type(reference) == "table"
        and has_only_keys(reference, { kind = true, opaque_id = true })
        and reference.kind == "upload"
        and is_string(reference.opaque_id, 160, false)
        and type(authorization) == "table"
        and has_only_keys(authorization, { scope = true, session_id = true, audience = true, expires_at = true })
        and authorization.scope == "session"
        and is_string(authorization.session_id, 160, false)
        and authorization.audience == "agent-context"
        and is_timestamp(authorization.expires_at)
        and authorization.expires_at == payload.expires_at
end

local function is_omission(value)
    return type(value) == "table"
        and has_only_keys(value, { reason = true, capture_code = true, point_id = true, mount_id = true, detail = true })
        and omission_reasons[value.reason] == true
        and (value.capture_code == nil or capture_codes[value.capture_code] == true)
        and (value.point_id == nil or is_string(value.point_id, 128, false))
        and (value.mount_id == nil or is_string(value.mount_id, 160, false))
        and (value.detail == nil or is_string(value.detail, 512, false))
end

local function is_provenance(value)
    return type(value) == "table"
        and has_only_keys(value, { geometry_source = true, runtime_source = true })
        and (value.geometry_source == "document" or value.geometry_source == "physical-host")
        and (value.runtime_source == "document" or value.runtime_source == "iframe-realm" or value.runtime_source == "fragment-realm")
end

local function validate_attention(payload, allow_selection)
    local allowed_keys = {
        schema = true,
        snapshot_id = true,
        host_instance_id = true,
        mount_generation = true,
        created_at = true,
        coordinate_space = true,
        capture = true,
        pointer = true,
        focus = true,
        recent_events = true,
        candidates = true,
        omissions = true
    }
    if allow_selection then allowed_keys.selection = true end
    if type(payload) ~= "table"
        or not has_only_keys(payload, allowed_keys)
        or payload.schema ~= context_attachments.ATTENTION_SCHEMA
        or not is_string(payload.snapshot_id, 128, false)
        or not is_string(payload.host_instance_id, 160, false)
        or not is_integer(payload.mount_generation, 0)
        or not is_timestamp(payload.created_at) then
        return false, 'root'
    end
    local space = payload.coordinate_space
    if type(space) ~= "table"
        or not has_only_keys(space, { kind = true, width = true, height = true, device_pixel_ratio = true })
        or space.kind ~= "host-viewport"
        or not is_number(space.width)
        or space.width < 0
        or not is_number(space.height)
        or space.height < 0
        or not is_number(space.device_pixel_ratio)
        or space.device_pixel_ratio <= 0 then
        return false, 'coordinate-space'
    end
    local capture = payload.capture
    if type(capture) ~= "table"
        or not has_only_keys(capture, {
            radius_css_px = true,
            grid_step_css_px = true,
            sampled_points = true,
            points = true,
            duration_ms = true,
            complete = true
        })
        or not is_number(capture.radius_css_px)
        or capture.radius_css_px < 0
        or capture.radius_css_px > 100
        or not is_number(capture.grid_step_css_px)
        or capture.grid_step_css_px <= 0
        or capture.grid_step_css_px > 100
        or not is_integer(capture.sampled_points, 0)
        or capture.sampled_points > 4096
        or not is_array(capture.points)
        or #capture.points ~= capture.sampled_points
        or #capture.points > 4096
        or not is_number(capture.duration_ms)
        or capture.duration_ms < 0
        or type(capture.complete) ~= "boolean" then
        return false, 'capture'
    end
    local point_ids = {}
    for _, point in ipairs(capture.points) do
        if not is_query_point(point) or point_ids[point.point_id] then
            return false, 'capture-point'
        end
        point_ids[point.point_id] = true
    end
    if payload.pointer ~= nil and not is_observed_event(payload.pointer) then
        return false, 'pointer'
    end
    if payload.focus ~= nil then
        if type(payload.focus) ~= "table"
            or not has_only_keys(payload.focus, {
                event_id = true,
                sequence = true,
                focused_at = true,
                realm_time_ms = true,
                candidate_id = true,
                path = true,
                summary = true
            })
            or not is_string(payload.focus.event_id, 128, false)
            or not is_integer(payload.focus.sequence, 0)
            or not is_timestamp(payload.focus.focused_at)
            or not is_number(payload.focus.realm_time_ms)
            or payload.focus.realm_time_ms < 0
            or (payload.focus.candidate_id ~= nil and not is_string(payload.focus.candidate_id, 128, true))
            or not is_path(payload.focus.path)
            or not is_summary(payload.focus.summary) then
            return false, 'focus'
        end
    end
    if payload.selection ~= nil and (not allow_selection or not is_selection(payload.selection)) then
        return false, 'selection'
    end
    if not is_array(payload.recent_events) or #payload.recent_events > 32 then
        return false, 'recent-events'
    end
    for _, event in ipairs(payload.recent_events) do
        if not is_observed_event(event) then
            return false, 'recent-event'
        end
    end
    local observation_point_ids = {}
    if payload.pointer ~= nil then
        observation_point_ids[payload.pointer.event_id] = true
    end
    if payload.focus ~= nil then
        observation_point_ids[payload.focus.event_id] = true
    end
    for _, event in ipairs(payload.recent_events) do
        observation_point_ids[event.event_id] = true
    end
    if not is_array(payload.candidates) or #payload.candidates > 128 then
        return false, 'candidates'
    end
    local candidate_ids = {}
    for _, candidate in ipairs(payload.candidates) do
        if type(candidate) ~= "table"
            or not has_only_keys(candidate, {
                target_id = true,
                path = true,
                rect = true,
                clip_rect = true,
                sample_point_ids = true,
                occluded = true,
                summary = true,
                provenance = true,
                action_ref = true
            })
            or not is_string(candidate.target_id, 128, false)
            or not is_path(candidate.path)
            or not is_rect(candidate.rect)
            or (candidate.clip_rect ~= nil and not is_rect(candidate.clip_rect))
            or not is_array(candidate.sample_point_ids)
            or #candidate.sample_point_ids == 0
            or #candidate.sample_point_ids > 4096
            or type(candidate.occluded) ~= "boolean"
            or not is_summary(candidate.summary)
            or (candidate.provenance ~= nil and not is_provenance(candidate.provenance))
            or (candidate.action_ref ~= nil and not is_action_ref(candidate.action_ref)) then
            return false, 'candidate'
        end
        if candidate.action_ref ~= nil then
            local leaf = candidate.path[#candidate.path]
            if candidate.action_ref.snapshot_id ~= payload.snapshot_id
                or candidate.action_ref.target_id ~= candidate.target_id
                or candidate.action_ref.host_instance_id ~= payload.host_instance_id
                or candidate.action_ref.mount_id ~= leaf.mount_id
                or candidate.action_ref.generation ~= leaf.generation
                or not same_rect(candidate.action_ref.rect, candidate.rect)
                or not attention_path_digest_matches(candidate.path, candidate.action_ref.path_digest) then
                return false, 'action-reference'
            end
        end
        candidate_ids[candidate.target_id] = true
        local sample_point_ids = {}
        for _, point_id in ipairs(candidate.sample_point_ids) do
            if not is_string(point_id, 128, false)
                or sample_point_ids[point_id]
                or (not point_ids[point_id] and not observation_point_ids[point_id]) then
                return false, 'sample-point-reference'
            end
            sample_point_ids[point_id] = true
        end
    end
    if payload.pointer ~= nil then
        for _, candidate_id in ipairs(payload.pointer.candidate_ids) do
            if not candidate_ids[candidate_id] then
                return false, 'pointer-candidate-reference'
            end
        end
    end
    for _, event in ipairs(payload.recent_events) do
        for _, candidate_id in ipairs(event.candidate_ids) do
            if not candidate_ids[candidate_id] then
                return false, 'event-candidate-reference'
            end
        end
    end
    if payload.focus ~= nil
        and payload.focus.candidate_id ~= nil
        and not candidate_ids[payload.focus.candidate_id] then
        return false, 'focus-candidate-reference'
    end
    if not is_array(payload.omissions) or #payload.omissions > 128 then
        return false, 'omissions'
    end
    for _, omission in ipairs(payload.omissions) do
        if not is_omission(omission) then
            return false, 'omission'
        end
    end
    return true
end

function context_attachments.validate(attachments, options)
    options = options or {}
    if not is_array(attachments) then
        return nil, failure("array-required", "context_attachments", "context_attachments must be an array")
    end
    local max_count = math.min(options.max_count or context_attachments.MAX_COUNT, context_attachments.MAX_COUNT)
    local max_total_bytes = math.min(options.max_total_bytes or context_attachments.MAX_TOTAL_BYTES, context_attachments.MAX_TOTAL_BYTES)
    local max_attachment_bytes = math.min(options.max_attachment_bytes or context_attachments.MAX_ATTACHMENT_BYTES, context_attachments.MAX_ATTACHMENT_BYTES)
    if #attachments > max_count then
        return nil, failure("too-many-attachments", "context_attachments", "too many context attachments")
    end
    local encoded, encode_err = json.encode(attachments)
    if encode_err then
        return nil, failure("invalid-json", "context_attachments", tostring(encode_err))
    end
    if #encoded > max_total_bytes then
        return nil, failure("total-bytes-exceeded", "context_attachments", "context attachments exceed the total byte limit")
    end

    local now = options.now or time.now()
    local remaining_expanded = context_attachments.MAX_EXPANDED_BYTES
    local seen = {}
    for index, attachment in ipairs(attachments) do
        local path = "context_attachments[" .. tostring(index) .. "]"
        if type(attachment) ~= "table"
            or not has_only_keys(attachment, {
                attachment_id = true,
                kind = true,
                version = true,
                created_at = true,
                expires_at = true,
                content_type = true,
                content_bytes = true,
                content_hash = true,
                content = true
            })
            or not is_string(attachment.attachment_id, 128, false)
            or not is_string(attachment.kind, 128, false)
            or not string.match(attachment.kind, "^[a-z][a-z0-9%.%-]*$")
            or string.match(attachment.kind, "[%.%-][%.%-]")
            or string.match(attachment.kind, "[%.%-]$")
            or not is_integer(attachment.version, 1)
            or not is_timestamp(attachment.created_at)
            or (attachment.expires_at ~= nil and not is_timestamp(attachment.expires_at))
            or attachment.content_type ~= "application/json"
            or not is_integer(attachment.content_bytes, 0)
            or attachment.content_bytes > context_attachments.MAX_ATTACHMENT_BYTES
            or not is_string(attachment.content_hash, 71, false)
            or type(attachment.content) ~= "string"
            or #attachment.content > context_attachments.MAX_ATTACHMENT_BYTES then
            return nil, failure("invalid-envelope", path, "attachment envelope is invalid")
        end
        local attachment_id = attachment.attachment_id
        local content = attachment.content :: string
        if seen[attachment_id] then
            return nil, failure("duplicate-attachment-id", path .. ".attachment_id", "attachment_id must be unique", attachment_id)
        end
        seen[attachment_id] = true
        local attachment_json, attachment_err = json.encode(attachment)
        if attachment_err then
            return nil, failure("invalid-json", path, tostring(attachment_err), attachment_id)
        end
        if #attachment_json > max_attachment_bytes then
            return nil, failure("attachment-bytes-exceeded", path, "attachment exceeds the byte limit", attachment_id)
        end
        if #content ~= attachment.content_bytes then
            return nil, failure("content-size-mismatch", path .. ".content_bytes", "content_bytes does not match the canonical payload", attachment_id)
        end
        if not string.match(attachment.content_hash, "^sha256:%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x$") then
            return nil, failure("invalid-content-hash", path .. ".content_hash", "content_hash must be a lowercase SHA-256 digest", attachment_id)
        end
        local digest, digest_err = hash.sha256(content)
        if digest_err then
            return nil, failure("hash-failed", path .. ".content_hash", tostring(digest_err), attachment_id)
        end
        if attachment.content_hash ~= "sha256:" .. digest then
            return nil, failure("content-hash-mismatch", path .. ".content_hash", "content_hash does not match the canonical payload", attachment_id)
        end
        local payload, payload_err = json.decode(content)
        if payload_err then
            return nil, failure("invalid-json", path .. ".content", tostring(payload_err), attachment_id)
        end
        local canonical, canonical_err = canonical_json(payload)
        if not canonical then
            return nil, failure("invalid-json", path .. ".content", tostring(canonical_err), attachment_id)
        end
        if canonical ~= content then
            return nil, failure("noncanonical-content", path .. ".content", "content must use canonical JSON encoding", attachment_id)
        end
        local is_visual_v1 = attachment.kind == context_attachments.VISUAL_KIND
            and attachment.version == context_attachments.VISUAL_VERSION
        if contains_forbidden_context_key(payload, is_visual_v1) then
            return nil, failure("forbidden-live-field", path .. ".content", "durable context must not contain live capability or bearer fields", attachment_id)
        end
        if attachment.expires_at then
            local expires = time.parse(time.RFC3339, attachment.expires_at :: string)
            if not expires:after(now) then
                return nil, failure("expired", path .. ".expires_at", "attachment has expired", attachment_id)
            end
        end
        if attachment.kind == context_attachments.ATTENTION_KIND
            and attachment.version == context_attachments.ATTENTION_VERSION
            and not validate_attention(payload) then
            return nil, failure("invalid-attention-payload", path .. ".content", "wippy.attention v1 content is invalid", attachment_id)
        end
        if attachment.kind == 'wippy.attention' and (attachment.version == 1 or attachment.version == 2 or attachment.version == 3 or attachment.version == 4) then
            local expanded_bytes = #canonical
            if attachment.version == 2 or attachment.version == 3 or attachment.version == 4 then
                if not renderer_supports(attachment.kind, attachment.version) then
                    return nil, failure('unsupported-attention-version', path, 'Attention version ' .. tostring(attachment.version) .. ' admission and rendering are unavailable', attachment_id)
                end
                local envelope = canonical_json(attachment)
                if not envelope or #envelope > context_attachments.ATTENTION_V2_MAX_ENVELOPE_BYTES then
                    return nil, failure('attachment-bytes-exceeded', path, 'Attention version ' .. tostring(attachment.version) .. ' envelope exceeds the byte limit', attachment_id)
                end
                local expand = attachment.version == 4
                    and context_attachments._renderer.expand_attention_v4
                    or attachment.version == 3
                        and context_attachments._renderer.expand_attention_v3
                        or context_attachments._renderer.expand_attention_v2
                local ok, expanded, _, bytes = pcall(expand, payload, remaining_expanded)
                if not ok or not expanded then
                    return nil, failure('invalid-attention-expansion', path, 'Attention version ' .. tostring(attachment.version) .. ' expansion is invalid', attachment_id)
                end
                local reconstruction_valid, reconstruction_stage = validate_attention(expanded, attachment.version == 4)
                if not reconstruction_valid then
                    return nil, failure('invalid-attention-reconstruction-' .. tostring(reconstruction_stage or 'unknown'), path, 'Attention version ' .. tostring(attachment.version) .. ' reconstruction is invalid', attachment_id)
                end
                expanded_bytes = bytes
            end
            if type(expanded_bytes) ~= 'number' or expanded_bytes > remaining_expanded then
                return nil, failure('expanded-bytes-exceeded', path, 'Attention reconstruction exceeds the aggregate byte limit', attachment_id)
            end
            remaining_expanded = remaining_expanded - expanded_bytes
        end
        if is_visual_v1 then
            if not validate_visual(payload)
                or attachment.expires_at ~= payload.expires_at then
                return nil, failure("invalid-visual-payload", path .. ".content", "wippy.attention.visual v1 content is invalid", attachment_id)
            end
            if not options.session_id or payload.authorization.session_id ~= options.session_id then
                return nil, failure("visual-session-mismatch", path .. ".content.authorization.session_id", "visual attachment is not authorized for this session", attachment_id)
            end
            if options.require_visual_authorization then
                if type(options.visual_authorizer) ~= "function" then
                    return nil, failure("visual-authorization-unavailable", path .. ".content.reference", "visual reference authorization is unavailable", attachment_id)
                end
                local authorized_ok, authorized = pcall(options.visual_authorizer, {
                    reference = payload.reference,
                    authorization = payload.authorization,
                    media = payload.media,
                })
                if not authorized_ok or authorized ~= true then
                    return nil, failure("visual-reference-unauthorized", path .. ".content.reference", "visual reference is missing or unauthorized", attachment_id)
                end
                if type(options.visual_resolver) ~= "function" then
                    return nil, failure("visual-verification-unavailable", path .. ".content.reference", "visual reference verification is unavailable", attachment_id)
                end
                local resolved_ok, resolved = pcall(options.visual_resolver, {
                    reference = payload.reference,
                    authorization = payload.authorization,
                    media = payload.media,
                })
                if not resolved_ok or type(resolved) ~= "table"
                    or type(resolved.data) ~= "string"
                    or resolved.content_type ~= payload.media.content_type
                    or #resolved.data ~= payload.media.content_bytes then
                    return nil, failure("visual-reference-invalid", path .. ".content.reference", "visual reference data is missing or invalid", attachment_id)
                end
                local resolved_digest, resolved_digest_err = hash.sha256(resolved.data)
                if resolved_digest_err or "sha256:" .. resolved_digest ~= payload.media.content_hash then
                    return nil, failure("visual-reference-integrity-mismatch", path .. ".content.reference", "visual reference data does not match its declared hash", attachment_id)
                end
            end
        end
    end
    return attachments
end

function context_attachments.format_error(err)
    if type(err) ~= "table" then
        return tostring(err)
    end
    return (err.code or "invalid-context-attachment") .. " at " .. (err.path or "context_attachments") .. ": " .. (err.message or "invalid context attachment")
end

-- Prompt rendering is framework-owned. Keep this compatibility entrypoint as a
-- direct alias so validation and model projection cannot drift independently.
context_attachments.render = renderer.render

return context_attachments
