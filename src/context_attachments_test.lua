local test = require("test")
local json = require("json")
local hash = require("hash")
local time = require("time")
local context_attachments = require("context_attachments")

-- Mirrors contracts/attention-context/v1/fixtures/validation-parity.json, the
-- canonical cross-runtime corpus owned by gen-2-chat. Wippy module tests cannot
-- import files outside their linked source graph, so the cases remain named and
-- ordered identically here.
local validation_parity = {
    limits = {
        max_json_depth = 32,
        max_safe_integer = 9007199254740991,
        max_sample_point_ids = 4096,
        max_sample_point_id_length = 128,
    },
    production_snapshot = {
        fixture = "valid-attention.json",
        expected_content_bytes = 1040,
        expected_content_hash = "sha256:a1fce4912a4ec429c3d07ed3d71b1d5ceec6d327da7d8f7dc04b306f9e23580c",
        max_serialized_attachment_set_bytes = 32768,
    },
    capture_codes = {
        "byte-limit",
        "capture-unavailable",
        "dimension-limit",
        "disabled",
        "encode-failed",
        "permission-denied",
        "pixel-limit",
        "privacy-excluded",
        "redaction-applied",
        "stale-target",
        "store-failed",
        "timeout",
    },
    valid_timestamps = {
        "2026-09-04T12:00:00Z",
        "2024-02-29T23:59:59.123456789Z",
    },
    invalid_timestamps = {
        "2026-09-04T12:00:00+00:00",
        "2026-09-04T12:00:00.1234567890Z",
        "2026-02-29T12:00:00Z",
        "2026-01-01T24:00:00Z",
    },
    valid_frame_origins = {
        "about:srcdoc",
        "https://example.test",
        "http://127.0.0.1:8086",
    },
    invalid_frame_origins = {
        "ftp://example.test",
        "https://example.test/path",
        "https://user@example.test",
        "null",
    },
    forbidden_context_keys = {
        "authorization",
        "broker_pid",
        "capability_token",
        "connection_target",
        "delivery_handle",
        "node_handle",
        "reflection_handle",
        "result_channel",
        "runtime_context",
        "signed_url",
        "target_token",
        "ui_action_runtime",
    },
}

local function golden_payload()
    return json.decode([=[{
      "schema":"wippy.attention.v1",
      "snapshot_id":"snapshot-1",
      "host_instance_id":"host-1",
      "mount_generation":3,
      "created_at":"2026-09-04T12:00:00.000Z",
      "coordinate_space":{"kind":"host-viewport","width":1280,"height":720,"device_pixel_ratio":1},
       "capture":{"radius_css_px":20,"grid_step_css_px":5,"sampled_points":1,"points":[{"point_id":"p0","x":120,"y":112}],"duration_ms":12,"complete":true},
      "recent_events":[],
       "candidates":[{
         "target_id":"target-1",
         "action_ref":{"generation":1,"host_instance_id":"host-1","label":"Nested status","mount_id":"leaf-1","path_digest":"sha256:2c46a9ab38e76737a2418025f51d2c7f2f3d743bedaba84a04598fb2aed7758f","rect":{"height":24,"width":80,"x":100,"y":100},"snapshot_id":"snapshot-1","target_id":"target-1"},
         "path":[
          {"kind":"host","mount_id":"host-1","generation":3},
          {"kind":"element","mount_id":"leaf-1","generation":1,"tag_name":"span"}
        ],
        "rect":{"x":100,"y":100,"width":80,"height":24},
        "sample_point_ids":["p0"],
        "occluded":false,
        "summary":{"role":"status","name":"Nested status","text":"Ready"}
      }],
      "omissions":[]
    }]=])
end

local function golden_attachment()
    local content = context_attachments.canonical_json(golden_payload())
    return {
        attachment_id = "attachment-1",
        kind = "wippy.attention",
        version = 1,
        created_at = "2026-09-04T12:00:00.000Z",
        content_type = "application/json",
        content_bytes = 1040,
        content_hash = "sha256:a1fce4912a4ec429c3d07ed3d71b1d5ceec6d327da7d8f7dc04b306f9e23580c",
        content = content
    }
end

local function replace_content(attachment, payload)
    local content = context_attachments.canonical_json(payload)
    attachment.content = content
    attachment.content_bytes = #content
    attachment.content_hash = "sha256:" .. hash.sha256(content)
end

local function action_ref_for(payload)
    local candidate = payload.candidates[1]
    local leaf = candidate.path[#candidate.path]
    local canonical_path = context_attachments.canonical_json(candidate.path)
    return {
        snapshot_id = payload.snapshot_id,
        target_id = candidate.target_id,
        host_instance_id = payload.host_instance_id,
        mount_id = leaf.mount_id,
        generation = leaf.generation,
        path_digest = "sha256:" .. hash.sha256(canonical_path),
        rect = candidate.rect,
        label = "Nested status",
    }
end

local function visual_attachment()
    local data = "visual-bytes"
    local payload = {
        schema = "wippy.attention.visual.v1",
        capture_id = "capture-1",
        snapshot_id = "snapshot-1",
        host_instance_id = "host-1",
        created_at = "2026-09-04T12:00:00Z",
        expires_at = "2026-09-04T12:05:00Z",
        candidate_ids = { "target-1" },
        region = { x = 1, y = 2, width = 3, height = 4 },
        media = {
            content_type = "image/png",
            content_bytes = #data,
            content_hash = "sha256:" .. hash.sha256(data),
            pixel_width = 3,
            pixel_height = 4,
        },
        reference = { kind = "upload", opaque_id = "upload-1" },
        authorization = {
            scope = "session",
            session_id = "session-1",
            audience = "agent-context",
            expires_at = "2026-09-04T12:05:00Z",
        },
        redactions_applied = 0,
    }
    local content = context_attachments.canonical_json(payload)
    return {
        attachment_id = "visual-1",
        kind = "wippy.attention.visual",
        version = 1,
        created_at = payload.created_at,
        expires_at = payload.expires_at,
        content_type = "application/json",
        content_bytes = #content,
        content_hash = "sha256:" .. hash.sha256(content),
        content = content,
    }, data
end

local function define_tests()
    describe('Attention v2 admission and renderer capability intersection', function()
        local prompt_builder = require('prompt_builder')
        local original_prompt_renderer = prompt_builder._context_attachments
        local active = context_attachments._renderer
        after_each(function()
            context_attachments._renderer = active
            prompt_builder._context_attachments = original_prompt_renderer
        end)
        local function compact()
            local payload = golden_payload()
            payload.schema = 'wippy.attention.v2'
            payload.path_dictionary = payload.candidates[1].path
            payload.candidates[1].path = nil
            payload.candidates[1].path_indices = { 0, 1 }
            payload.candidates[1].sample_point_ids = nil
            payload.candidates[1].sample_refs = { 0 }
            payload.candidates[1].action_ref.label = nil
            local attachment = golden_attachment()
            attachment.version = 2
            attachment.attachment_id = 'compact-1'
            replace_content(attachment, payload)
            return attachment, payload
        end
        local function compact_v3()
            local attachment, payload = compact()
            for index, segment in ipairs(payload.path_dictionary) do
                local segment_data = segment :: any
                local attrs = {}
                for _, key in ipairs({ 'label', 'panel_id', 'surface_id', 'artifact_id', 'page_id', 'package_id',
                    'tag_name', 'selector_hint', 'frame_origin', 'coordinate_quality' }) do
                    if segment_data[key] ~= nil then attrs[key] = segment_data[key] end
                end
                for _, key in ipairs({ 'rect', 'clip_rect' }) do
                    if segment_data[key] ~= nil then
                        attrs[key] = { segment_data[key].x, segment_data[key].y, segment_data[key].width, segment_data[key].height }
                    end
                end
                if segment_data.local_to_parent ~= nil then attrs.local_to_parent = segment_data.local_to_parent.matrix end
                payload.path_dictionary[index] = { segment_data.kind, segment_data.mount_id, segment_data.generation, attrs }
            end
            payload.schema, attachment.version, attachment.attachment_id = 'wippy.attention.v3', 3, 'compact-v3-1'
            replace_content(attachment, payload)
            return attachment, payload
        end
        it('matches the Host compact golden bytes and digest and persists the original envelope', function()
            local attachment = compact()
            test.eq(#attachment.content, 1040)
            test.eq(attachment.content_hash, 'sha256:d20ab08a1a88e882421a2a1f6187b261db1c6c56532f006a518fb0ce8aedf5f5')
            local before = context_attachments.canonical_json({ attachment })
            local validated, err = context_attachments.validate({ attachment })
            test.is_nil(err)
            test.eq(context_attachments.canonical_json(validated), before)
        end)
        it('preserves registered Framework support through the real Session wrapper and prompt builder', function()
            prompt_builder._context_attachments = context_attachments
            test.is_true(context_attachments.supports('wippy.attention', 1))
            test.is_true(context_attachments.supports('wippy.attention', 2))
            test.is_true(context_attachments.supports('wippy.attention', 3))
            test.is_true(context_attachments.supports('wippy.attention.visual', 1))
            test.is_false(context_attachments.supports('example.unknown', 1))
            test.is_false(context_attachments.supports(nil, 2))
            local attachment = compact()
            local messages = { { type = 'user', data = 'Required compact context', metadata = { context_attachments = { attachment } } } }
            local builder, err = prompt_builder.build(messages, {}, {}, { include_files = false })
            test.is_nil(err)
            test.eq(#builder:get_messages()[1].content, 2)
            test.contains(builder:get_messages()[1].content[2].text, 'Nested status')
            for _, unavailable in ipairs({ {},
                { supports = function() return 'yes' end },
                { supports = function() error('fixture support unavailable') end },
                { supports = function() return false end },
                { supports = active.supports },
            }) do
                context_attachments._renderer = unavailable
                test.is_false(context_attachments.supports('wippy.attention', 2))
                builder, err = prompt_builder.build(messages, {}, {}, { include_files = false })
                test.is_nil(builder)
                test.eq(err, 'REQUIRED_CONTEXT_RENDER_UNAVAILABLE')
            end
        end)
        it('admits v3 only when the renderer provides its expansion contract', function()
            local attachment, payload = compact_v3()
            test.is_true(context_attachments.validate({ attachment }) ~= nil)
            payload.path_dictionary[2][4].tag_name = 'button'
            replace_content(attachment, payload)
            test.is_nil(context_attachments.validate({ attachment }))
            context_attachments._renderer = { supports = active.supports, expand_attention_v2 = active.expand_attention_v2 }
            test.is_false(context_attachments.supports('wippy.attention', 3))
            local _, err = context_attachments.validate({ attachment })
            test.eq(err.code, 'unsupported-attention-version')
        end)
        it('reconstructs a lattice and rejects malformed indices identity digests and semantic fields atomically', function()
            local changes = {
                function(p) p.candidates[1].path_indices = { -1 } end,
                function(p) p.candidates[1].path_indices = { 0.5 } end,
                function(p) p.candidates[1].path_indices = { 0, 2 } end,
                function(p) p.candidates[1].sample_refs = { { 0, 2 } } end,
                function(p) p.candidates[1].sample_refs = { 0, 0 } end,
                function(p) p.path_dictionary[1].generation = 100 end,
                function(p) p.coordinate_space.width = -1 end,
                function(p) p.capture.points[1].point_id = '' end,
                function(p) p.path_dictionary[3] = p.path_dictionary[1] end,
            }
            for _, mutate in ipairs(changes) do
                local attachment, payload = compact()
                mutate(payload); replace_content(attachment, payload)
                test.is_nil(context_attachments.validate({ golden_attachment(), attachment }))
            end
            local attachment, payload = compact()
            payload.capture.points = nil
            payload.capture.point_encoding = { kind = 'css-euclidean-grid.v1', origin = { x = 120, y = 112 } }
            payload.capture.sampled_points = 49
            payload.candidates[1].sample_refs = { { 0, 49 } }
            replace_content(attachment, payload)
            test.is_true(context_attachments.validate({ attachment }) ~= nil)
        end)
        it('advertises deterministic strict intersection and rejects unavailable known v2 while preserving inert future versions', function()
            local expected = { version = 1, handlers = { { kind = 'wippy.attention', versions = { 1, 2, 3 } },
                { kind = 'wippy.attention.visual', versions = { 1 } } } }
            test.eq(context_attachments.canonical_json(context_attachments.capabilities()), context_attachments.canonical_json(expected))
            for _, probe in ipairs({ function() return 'yes' end, function() error('unavailable') end, function() return false end }) do
                context_attachments._renderer = { supports = probe, expand_attention_v2 = active.expand_attention_v2,
                    expand_attention_v3 = active.expand_attention_v3 }
                test.eq(#context_attachments.capabilities().handlers, 0)
                local attachment = compact()
                local _, err = context_attachments.validate({ attachment })
                test.eq(err.code, 'unsupported-attention-version')
                attachment.version = 4
                test.is_true(context_attachments.validate({ attachment }) ~= nil)
            end
            context_attachments._renderer = { supports = function() return true end }
            test.eq(context_attachments.canonical_json(context_attachments.capabilities().handlers[1].versions), '[1]')
        end)
        it('enforces the complete canonical envelope boundary rather than only payload bytes', function()
            local attachment, payload = compact()
            payload.candidates[1].summary.state = { padding = '' }
            replace_content(attachment, payload)
            local padding = 16384 - #context_attachments.canonical_json(attachment)
            payload.candidates[1].summary.state.padding = string.rep('x', padding)
            replace_content(attachment, payload)
            padding = padding + 16384 - #context_attachments.canonical_json(attachment)
            payload.candidates[1].summary.state.padding = string.rep('x', padding)
            replace_content(attachment, payload)
            test.eq(#context_attachments.canonical_json(attachment), 16384)
            test.is_true(context_attachments.validate({ attachment }) ~= nil)
            payload.candidates[1].summary.state.padding = string.rep('x', padding + 1)
            replace_content(attachment, payload)
            test.eq(#context_attachments.canonical_json(attachment), 16385)
            local _, err = context_attachments.validate({ attachment })
            test.eq(err.code, 'attachment-bytes-exceeded')
        end)
        it('charges reconstructed paths across mixed v1 and v2 attachments before persistence', function()
            local attachment, payload = compact()
            for _, segment in ipairs(payload.path_dictionary) do segment.selector_hint = string.rep('x', 512) end
            local source = payload.candidates[1]
            source.action_ref = nil
            source.path_indices = { 0 }
            for index = 2, 32 do source.path_indices[index] = 1 end
            for index = 2, 4 do
                payload.candidates[index] = assert(json.decode(context_attachments.canonical_json(source)))
                payload.candidates[index].target_id = 'target-' .. index
            end
            replace_content(attachment, payload)
            test.is_true(context_attachments.validate({ attachment }) ~= nil)
            local array, sum = { golden_attachment() }, #golden_attachment().content
            local _, _, bytes = active.expand_attention_v2(payload)
            for index = 1, 4 do
                local copy = assert(json.decode(context_attachments.canonical_json(attachment)))
                copy.attachment_id = 'compact-' .. index
                array[#array + 1] = copy
                sum = sum + (bytes :: number)
                if sum <= 262144 then test.is_true(context_attachments.validate(array) ~= nil)
                else
                    test.is_true(#context_attachments.canonical_json(array) < 32768)
                    test.is_nil(context_attachments.validate(array))
                    return
                end
            end
            error('Expansion fixture must cross the aggregate budget')
        end)
    end)
    describe("Context attachments", function()
        it("matches the TypeScript canonical JSON golden digest", function()
            local attachment = golden_attachment()
            local canonical = attachment.content

            test.eq(#canonical, 1040)
            local validated, err = context_attachments.validate({ attachment }, {
                now = time.parse(time.RFC3339, "2026-09-04T12:01:00Z")
            })
            test.is_nil(err)
            test.not_nil(validated)
        end)

        it("accepts stable panel and surface identity on semantic path segments", function()
            local attachment = golden_attachment()
            local payload = json.decode(attachment.content :: string)
            payload.candidates[1].path[1].panel_id = "panel-main"
            payload.candidates[1].path[1].surface_id = "surface-primary"
            payload.candidates[1].action_ref = action_ref_for(payload)
            replace_content(attachment, payload)

            local validated, err = context_attachments.validate({ attachment })

            test.is_nil(err)
            test.eq(validated[1].content, attachment.content)
        end)

        it("preserves unknown kinds and versions", function()
            local attachment = golden_attachment()
            attachment.kind = "example.future-context"
            attachment.version = 7

            local validated, err = context_attachments.validate({ attachment })
            test.is_nil(err)
            test.eq(validated[1].kind, "example.future-context")
        end)

        it("rejects duplicate IDs atomically", function()
            local attachment = golden_attachment()
            local validated, err = context_attachments.validate({ attachment, attachment })

            test.is_nil(validated)
            test.eq(err.code, "duplicate-attachment-id")
        end)

        it("rejects malformed known payloads", function()
            local attachment = golden_attachment()
            local payload = json.decode(attachment.content :: string)
            payload.snapshot_id = nil
            local canonical = context_attachments.canonical_json(payload)
            attachment.content = canonical
            attachment.content_bytes = #canonical
            attachment.content_hash = "sha256:" .. hash.sha256(canonical)

            local validated, err = context_attachments.validate({ attachment })
            test.is_nil(validated)
            test.eq(err.code, "invalid-attention-payload")
        end)

        it("accepts the complete normative focus event shape", function()
            local attachment = golden_attachment()
            local payload = json.decode(attachment.content :: string)
            payload.focus = {
                event_id = "focus-1",
                sequence = 7,
                focused_at = "2026-09-04T12:00:00.000Z",
                realm_time_ms = 123.5,
                candidate_id = "target-1",
                path = payload.candidates[1].path,
                summary = { name = "Nested status" }
            }
            payload.candidates[1].sample_point_ids = { "focus-1" }
            replace_content(attachment, payload)

            local validated, err = context_attachments.validate({ attachment })
            test.is_nil(err)
            test.not_nil(validated)

            payload.focus.sequence = nil
            replace_content(attachment, payload)
            validated, err = context_attachments.validate({ attachment })
            test.is_nil(validated)
            test.eq(err.code, "invalid-attention-payload")
        end)

        it("rejects live capability fields in unknown durable context", function()
            local attachment = golden_attachment()
            attachment.kind = "example.future-context"
            attachment.version = 7
            replace_content(attachment, { nested = { signed_url = "must-not-persist" } })

            local validated, err = context_attachments.validate({ attachment })
            test.is_nil(validated)
            test.eq(err.code, "forbidden-live-field")
        end)

        it("rejects authorization objects in generic unknown attachments", function()
            local attachment = golden_attachment()
            attachment.kind = "example.future-context"
            attachment.version = 7
            replace_content(attachment, {
                authorization = {
                    scope = "session",
                    session_id = "session-1",
                    audience = "agent-context",
                    expires_at = "2026-09-04T12:05:00Z",
                },
            })

            local validated, err = context_attachments.validate({ attachment })
            test.is_nil(validated)
            test.eq(err.code, "forbidden-live-field")
        end)

        it("accepts only the exact session-authorized visual v1 contract", function()
            local attachment = visual_attachment()
            local validated, err = context_attachments.validate({ attachment }, {
                session_id = "session-1",
                now = time.parse(time.RFC3339, "2026-09-04T12:01:00Z"),
            })
            test.is_nil(err)
            test.not_nil(validated)

            local mismatched_expiry = visual_attachment()
            mismatched_expiry.expires_at = "2026-09-04T12:04:00Z"
            validated, err = context_attachments.validate({ mismatched_expiry }, {
                session_id = "session-1",
                now = time.parse(time.RFC3339, "2026-09-04T12:01:00Z"),
            })
            test.is_nil(validated)
            test.eq(err.code, "invalid-visual-payload")

            local malformed = visual_attachment()
            local payload = json.decode(malformed.content :: string)
            payload.authorization.extra = true
            replace_content(malformed, payload)
            validated, err = context_attachments.validate({ malformed }, {
                session_id = "session-1",
                now = time.parse(time.RFC3339, "2026-09-04T12:01:00Z"),
            })
            test.is_nil(validated)
            test.eq(err.code, "invalid-visual-payload")
        end)

        it("rejects visual authorization for another session or an unknown version", function()
            local attachment = visual_attachment()
            local validated, err = context_attachments.validate({ attachment }, {
                session_id = "session-2",
                now = time.parse(time.RFC3339, "2026-09-04T12:01:00Z"),
            })
            test.is_nil(validated)
            test.eq(err.code, "visual-session-mismatch")

            attachment.version = 2
            validated, err = context_attachments.validate({ attachment }, {
                session_id = "session-1",
                now = time.parse(time.RFC3339, "2026-09-04T12:01:00Z"),
            })
            test.is_nil(validated)
            test.eq(err.code, "forbidden-live-field")
        end)

        it("rejects expired and oversized visual references", function()
            local attachment = visual_attachment()
            local validated, err = context_attachments.validate({ attachment }, {
                session_id = "session-1",
                now = time.parse(time.RFC3339, "2026-09-04T12:06:00Z"),
            })
            test.is_nil(validated)
            test.eq(err.code, "expired")

            attachment = visual_attachment()
            local payload = json.decode(attachment.content :: string)
            payload.media.content_bytes = context_attachments.VISUAL_MAX_BYTES + 1
            replace_content(attachment, payload)
            validated, err = context_attachments.validate({ attachment }, {
                session_id = "session-1",
                now = time.parse(time.RFC3339, "2026-09-04T12:01:00Z"),
            })
            test.is_nil(validated)
            test.eq(err.code, "invalid-visual-payload")
        end)

        it("renders verified visual bytes and safely skips denied or mismatched data", function()
            local attachment, data = visual_attachment()
            local options = {
                session_id = "session-1",
                now = time.parse(time.RFC3339, "2026-09-04T12:01:00Z"),
                visual_resolver = function(request)
                    test.eq(request.reference.opaque_id, "upload-1")
                    test.eq(request.authorization.audience, "agent-context")
                    return { data = data, content_type = "image/png" }
                end,
            }
            local parts = context_attachments.render({ attachment }, options)
            test.eq(#parts, 1)
            test.eq(parts[1].type, "image")
            test.eq(parts[1].source.type, "base64")

            local failures = {
                function() error("denied") end,
                function() return { data = data .. "x", content_type = "image/png" } end,
                function() return { data = data, content_type = "image/webp" } end,
                function() return { data = "visual-bytez", content_type = "image/png" } end,
            }
            for _, resolver in ipairs(failures) do
                options.visual_resolver = resolver
                parts = context_attachments.render({ attachment, golden_attachment() }, options)
                test.eq(#parts, 1)
                test.eq(parts[1].type, "text")
            end
        end)

        it("rejects every private UI action bearer and runtime field", function()
            for _, key in ipairs(validation_parity.forbidden_context_keys) do
                local attachment = golden_attachment()
                attachment.kind = "example.future-context"
                attachment.version = 7
                replace_content(attachment, { nested = { [key] = "must-not-persist" } })

                local validated, err = context_attachments.validate({ attachment })
                test.is_nil(validated)
                test.eq(err.code, "forbidden-live-field")
            end
        end)

        it("accepts a coherent immutable action reference and renders it exactly", function()
            local attachment = golden_attachment()
            local payload = json.decode(attachment.content :: string)
            payload.candidates[1].action_ref = action_ref_for(payload)
            replace_content(attachment, payload)

            local validated, err = context_attachments.validate({ attachment })
            test.is_nil(err)
            test.not_nil(validated)
            local parts = context_attachments.render(validated, { max_bytes = 8192 })
            test.eq(parts[1].type, "text")
            test.is_true(string.find(parts[1].text, '"host_instance_id":"host-1"', 1, true) ~= nil)
            test.is_true(string.find(parts[1].text, '"generation":1', 1, true) ~= nil)
            test.is_true(string.find(parts[1].text, '"path_digest":"sha256:', 1, true) ~= nil)
        end)

        it("rejects an action reference that does not match its durable candidate", function()
            local attachment = golden_attachment()
            local payload = json.decode(attachment.content :: string)
            payload.candidates[1].action_ref = action_ref_for(payload)
            payload.candidates[1].action_ref.mount_id = "wrong-mount"
            replace_content(attachment, payload)

            local validated, err = context_attachments.validate({ attachment })
            test.is_nil(validated)
            test.eq(err.code, "invalid-attention-payload")

            attachment = golden_attachment()
            payload = json.decode(attachment.content :: string)
            payload.candidates[1].action_ref = action_ref_for(payload)
            payload.candidates[1].action_ref.path_digest = "sha256:" .. string.rep("0", 64)
            replace_content(attachment, payload)
            validated, err = context_attachments.validate({ attachment })
            test.is_nil(validated)
            test.eq(err.code, "invalid-attention-payload")

            attachment = golden_attachment()
            payload = json.decode(attachment.content :: string)
            payload.candidates[1].action_ref = action_ref_for(payload)
            payload.candidates[1].path[2].tag_name = "button"
            replace_content(attachment, payload)
            validated, err = context_attachments.validate({ attachment })
            test.is_nil(validated)
            test.eq(err.code, "invalid-attention-payload")
        end)

        it("rejects live capability fields in durable Attention content", function()
            local attachment = golden_attachment()
            local payload = json.decode(attachment.content :: string)
            payload.candidates[1].target_token = "forbidden"
            local content = context_attachments.canonical_json(payload)
            attachment.content = content
            attachment.content_bytes = #content
            attachment.content_hash = "sha256:" .. hash.sha256(content)

            local validated, err = context_attachments.validate({ attachment })
            test.is_nil(validated)
            test.eq(err.code, "forbidden-live-field")
        end)

        it("rejects extra members at strict payload boundaries", function()
            local mutations = {
                function(payload) payload.extra = true end,
                function(payload) payload.coordinate_space.extra = true end,
                function(payload) payload.capture.extra = true end,
                function(payload) payload.capture.points[1].extra = true end,
                function(payload) payload.candidates[1].extra = true end,
                function(payload) payload.candidates[1].path[1].extra = true end,
                function(payload) payload.candidates[1].summary.extra = true end,
                function(payload) payload.omissions[1] = { reason = "excluded", extra = true } end
            }

            for _, mutate in ipairs(mutations) do
                local attachment = golden_attachment()
                local payload = json.decode(attachment.content :: string)
                mutate(payload)
                replace_content(attachment, payload)

                local validated, err = context_attachments.validate({ attachment })
                test.is_nil(validated)
                test.eq(err.code, "invalid-attention-payload")
            end
        end)

        it("rejects noncanonical JSON even when its digest matches", function()
            local attachment = golden_attachment()
            local content = " " .. (attachment.content :: string)
            attachment.content = content
            attachment.content_bytes = #content
            attachment.content_hash = "sha256:" .. hash.sha256(content)

            local validated, err = context_attachments.validate({ attachment })
            test.is_nil(validated)
            test.eq(err.code, "noncanonical-content")
        end)

        it("rejects frame metadata containing paths, queries, or fragments", function()
            local attachment = golden_attachment()
            local payload = json.decode(attachment.content :: string)
            payload.candidates[1].path[2].frame_origin = "https://example.com/private?token=secret#target"
            replace_content(attachment, payload)

            local validated, err = context_attachments.validate({ attachment })
            test.is_nil(validated)
            test.eq(err.code, "invalid-attention-payload")
        end)

        it("executes the shared cross-runtime validation parity corpus", function()
            local production_snapshot = golden_attachment()
            test.eq(validation_parity.production_snapshot.fixture, "valid-attention.json")
            test.eq(production_snapshot.content_bytes, validation_parity.production_snapshot.expected_content_bytes)
            test.eq(production_snapshot.content_hash, validation_parity.production_snapshot.expected_content_hash)
            test.is_true(#json.encode({ production_snapshot }) <= validation_parity.production_snapshot.max_serialized_attachment_set_bytes)

            for _, created_at in ipairs(validation_parity.valid_timestamps) do
                local attachment = golden_attachment()
                attachment.kind = "example.future-context"
                attachment.version = 7
                attachment.created_at = created_at
                local validated, err = context_attachments.validate({ attachment })
                test.is_nil(err)
                test.not_nil(validated)
            end
            for _, created_at in ipairs(validation_parity.invalid_timestamps) do
                local attachment = golden_attachment()
                attachment.kind = "example.future-context"
                attachment.version = 7
                attachment.created_at = created_at
                local validated, err = context_attachments.validate({ attachment })
                test.is_nil(validated)
                test.eq(err.code, "invalid-envelope")
            end

            for _, frame_origin in ipairs(validation_parity.valid_frame_origins) do
                local attachment = golden_attachment()
                local payload = json.decode(attachment.content :: string)
                payload.candidates[1].action_ref = nil
                payload.candidates[1].path[2].frame_origin = frame_origin
                replace_content(attachment, payload)
                local validated, err = context_attachments.validate({ attachment })
                test.is_nil(err)
                test.not_nil(validated)
            end
            for _, frame_origin in ipairs(validation_parity.invalid_frame_origins) do
                local attachment = golden_attachment()
                local payload = json.decode(attachment.content :: string)
                payload.candidates[1].action_ref = nil
                payload.candidates[1].path[2].frame_origin = frame_origin
                replace_content(attachment, payload)
                local validated, err = context_attachments.validate({ attachment })
                test.is_nil(validated)
                test.eq(err.code, "invalid-attention-payload")
            end

            for _, capture_code in ipairs(validation_parity.capture_codes) do
                local attachment = golden_attachment()
                local payload = json.decode(attachment.content :: string)
                payload.omissions = { { reason = "redacted", capture_code = capture_code } }
                replace_content(attachment, payload)
                local validated, err = context_attachments.validate({ attachment })
                test.is_nil(err)
                test.not_nil(validated)
            end
            local attachment = golden_attachment()
            local payload = json.decode(attachment.content :: string)
            payload.omissions = { { reason = "redacted", capture_code = "future-code" } }
            replace_content(attachment, payload)
            local validated, err = context_attachments.validate({ attachment })
            test.is_nil(validated)
            test.eq(err.code, "invalid-attention-payload")

            for _, field in ipairs({ "point_id", "mount_id", "detail" }) do
                attachment = golden_attachment()
                payload = json.decode(attachment.content :: string)
                payload.omissions = { { reason = "excluded", [field] = "" } }
                replace_content(attachment, payload)
                validated, err = context_attachments.validate({ attachment })
                test.is_nil(validated)
                test.eq(err.code, "invalid-attention-payload")
            end

            attachment = golden_attachment()
            payload = json.decode(attachment.content :: string)
            payload.mount_generation = validation_parity.limits.max_safe_integer
            replace_content(attachment, payload)
            validated, err = context_attachments.validate({ attachment })
            test.is_nil(err)
            test.not_nil(validated)
            payload.mount_generation = validation_parity.limits.max_safe_integer + 1
            replace_content(attachment, payload)
            validated, err = context_attachments.validate({ attachment })
            test.is_nil(validated)
            test.eq(err.code, "invalid-attention-payload")

            local max_point_id = string.rep("p", validation_parity.limits.max_sample_point_id_length)
            attachment = golden_attachment()
            payload = json.decode(attachment.content :: string)
            payload.capture.points[1].point_id = max_point_id
            payload.candidates[1].sample_point_ids = { max_point_id }
            replace_content(attachment, payload)
            validated, err = context_attachments.validate({ attachment })
            test.is_nil(err)
            test.not_nil(validated)
            payload.capture.points[1].point_id = max_point_id .. "x"
            payload.candidates[1].sample_point_ids = { max_point_id .. "x" }
            replace_content(attachment, payload)
            validated, err = context_attachments.validate({ attachment })
            test.is_nil(validated)
            test.eq(err.code, "invalid-attention-payload")

            local nested = true
            for _ = 1, validation_parity.limits.max_json_depth + 1 do
                nested = { nested = nested }
            end
            local canonical, canonical_err = context_attachments.canonical_json(nested)
            test.is_nil(canonical)
            test.not_nil(canonical_err)
        end)

        it("rejects expired attachments", function()
            local attachment = golden_attachment()
            attachment.expires_at = "2026-09-04T12:00:30Z"

            local validated, err = context_attachments.validate({ attachment }, {
                now = time.parse(time.RFC3339, "2026-09-04T12:01:00Z")
            })
            test.is_nil(validated)
            test.eq(err.code, "expired")
        end)
    end)
end

return test.run_cases(define_tests)
