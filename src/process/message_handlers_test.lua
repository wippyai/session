local test = require("test")
local hash = require("hash")
local consts = require("consts")
local context_attachments = require("context_attachments")
local message_handlers = require("message_handlers")

local function attachment()
    local payload = { future = true }
    local canonical = context_attachments.canonical_json(payload)
    return {
        attachment_id = "attachment-1",
        kind = "example.future-context",
        version = 7,
        created_at = "2026-09-04T12:00:00Z",
        content_type = "application/json",
        content_bytes = #canonical,
        content_hash = "sha256:" .. hash.sha256(canonical),
        content = canonical
    }
end

local function visual_attachment()
    local payload = {
        schema = "wippy.attention.visual.v1",
        capture_id = "capture-1",
        snapshot_id = "snapshot-1",
        host_instance_id = "host-1",
        created_at = "2026-09-04T12:00:00Z",
        expires_at = "2099-09-04T12:05:00Z",
        candidate_ids = { "target-1" },
        region = { x = 1, y = 2, width = 3, height = 4 },
        media = {
            content_type = "image/png",
            content_bytes = 4,
            content_hash = "sha256:" .. string.rep("0", 64),
            pixel_width = 3,
            pixel_height = 4,
        },
        reference = { kind = "upload", opaque_id = "upload-1" },
        authorization = {
            scope = "session",
            session_id = "session-1",
            audience = "agent-context",
            expires_at = "2099-09-04T12:05:00Z",
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
    }
end

local function context(writer_error, duplicate): (any, any)
    local calls = {}
    local ctx = {
        session_id = "session-1",
        writer = {
            add_message = function(_, message_type, text, metadata, request_id, request_hash)
                table.insert(calls, {
                    type = "write",
                    message_type = message_type,
                    text = text,
                    metadata = metadata,
                    request_id = request_id,
                    request_hash = request_hash,
                })
                if writer_error then
                    return nil, writer_error
                end
                return "persisted-message-1", nil, duplicate == true
            end
        },
        upstream = {
            message_received = function(_, message_id, text, file_uuids, attachments, request_id)
                table.insert(calls, {
                    type = "received",
                    message_id = message_id,
                    text = text,
                    file_uuids = file_uuids,
                    attachments = attachments,
                    request_id = request_id
                })
            end,
            command_success = function(_, request_id, details)
                table.insert(calls, { type = "success", request_id = request_id, details = details })
            end,
            command_error = function(_, request_id, code, message)
                table.insert(calls, { type = "error", request_id = request_id, code = code, message = message })
            end
        }
    }
    return ctx, calls
end

local function attention_context_tool()
    return { registry_id = "wippy.agent.tools:attention_context_set" }
end

local function generic_ui_action_tool()
    return { registry_id = "wippy.agent.tools:ui_action_confirm" }
end

local function define_tests()
    describe("Attention context tool authorization", function()
        it("rejects a setting tool without current-turn Host authority before calling the handler", function()
            local handler_calls = 0
            local ctx = {
                session_id = "session-1",
                controller_pid = "controller-1",
                config = { agent_id = "agent-1" },
                set_attention_context = function()
                    handler_calls = handler_calls + 1
                end,
            }
            local runtime, err = message_handlers._resolve_tool_runtime_context(ctx, {
                agent = { id = "agent-1" },
            }, attention_context_tool())

            test.is_nil(runtime)
            test.eq(err, "Attention context control unavailable: agent actions were not enabled for this turn")
            test.eq(handler_calls, 0)
        end)

        it("rejects a setting tool when the runtime object has no trusted authority marker", function()
            local ctx = {
                session_id = "session-1",
                controller_pid = "controller-1",
                config = { agent_id = "agent-1" },
                set_attention_context = function() end,
            }
            local runtime, err = message_handlers._resolve_tool_runtime_context(ctx, {
                agent = { id = "agent-1" },
                ui_action_runtime = {},
            }, attention_context_tool())

            test.is_nil(runtime)
            test.eq(err, "Attention context control unavailable: agent actions were not enabled for this turn")
        end)

        it("rejects a setting tool when the runtime authority marker is false", function()
            local ctx = {
                session_id = "session-1",
                controller_pid = "controller-1",
                config = { agent_id = "agent-1" },
                set_attention_context = function() end,
            }
            local runtime, err = message_handlers._resolve_tool_runtime_context(ctx, {
                agent = { id = "agent-1" },
                ui_action_runtime = { agent_actions_authorized = false },
            }, attention_context_tool())

            test.is_nil(runtime)
            test.eq(err, "Attention context control unavailable: agent actions were not enabled for this turn")
        end)

        it("returns Session control authority when the current turn enables agent actions", function()
            local issued_agent = nil
            local issued_call = nil
            local ctx = {
                session_id = "session-1",
                controller_pid = "controller-1",
                config = { agent_id = "fallback-agent" },
                set_attention_context = function() end,
                issue_attention_control = function(agent_id, call_id)
                    issued_agent = agent_id
                    issued_call = call_id
                    return "grant-1"
                end,
            }
            local runtime, err = message_handlers._resolve_tool_runtime_context(ctx, {
                agent = { id = "agent-1" },
                ui_action_runtime = { broker_pid = "broker-1", agent_actions_authorized = true },
            }, attention_context_tool(), "call-1")

            test.is_nil(err)
            test.eq(runtime.attention_context_runtime.session_id, "session-1")
            test.eq(runtime.attention_context_runtime.controller_pid, "controller-1")
            test.eq(runtime.attention_context_runtime.agent_id, "agent-1")
            test.eq(runtime.attention_context_runtime.capability, "grant-1")
            test.eq(issued_agent, "agent-1")
            test.eq(issued_call, "call-1")
            test.is_nil((runtime.attention_context_runtime :: any).agent_actions_authorized)
            test.is_nil(runtime.ui_action_runtime)
        end)

        it("rejects a generic UI action when the runtime object has no trusted authority marker", function()
            local runtime, err = message_handlers._resolve_tool_runtime_context({}, {
                ui_action_runtime = { delivery_handle = "delivery-1" },
            }, generic_ui_action_tool())

            test.is_nil(runtime)
            test.eq(err, "UI action unavailable: agent actions were not enabled for this turn")
        end)

        it("rejects a generic UI action when the runtime authority marker is false", function()
            local runtime, err = message_handlers._resolve_tool_runtime_context({}, {
                ui_action_runtime = { agent_actions_authorized = false },
            }, generic_ui_action_tool())

            test.is_nil(runtime)
            test.eq(err, "UI action unavailable: agent actions were not enabled for this turn")
        end)

        it("copies generic UI action routing without exposing the authority marker", function()
            local runtime, err = message_handlers._resolve_tool_runtime_context({}, {
                ui_action_runtime = {
                    broker_pid = "broker-1",
                    delivery_handle = "delivery-1",
                    session_id = "session-1",
                    host_instance_id = "host-1",
                    agent_actions_authorized = true,
                },
            }, generic_ui_action_tool())

            test.is_nil(err)
            test.eq(runtime.ui_action_runtime.broker_pid, "broker-1")
            test.eq(runtime.ui_action_runtime.delivery_handle, "delivery-1")
            test.eq(runtime.ui_action_runtime.session_id, "session-1")
            test.eq(runtime.ui_action_runtime.host_instance_id, "host-1")
            test.is_nil((runtime.ui_action_runtime :: any).agent_actions_authorized)
        end)
    end)

    describe('Referenced context ingestion boundaries', function()
        local original_renderer = context_attachments._renderer
        local original_staging = message_handlers._context_staging :: any
        local original_authorizer = message_handlers._authorize_visual
        local original_resolver = message_handlers._resolve_visual
        after_each(function()
            context_attachments._renderer = original_renderer
            message_handlers._context_staging = original_staging
            message_handlers._authorize_visual = original_authorizer
            message_handlers._resolve_visual = original_resolver
        end)
        local function referenced(array): (any, any, any)
            local canonical = context_attachments.canonical_json(array)
            local ref = { version = 1, id = 'stage-1', content_hash = 'sha256:' .. hash.sha256(canonical), content_bytes = #canonical }
            local ctx, calls = context()
            ctx.user_id = 'actor-1'
            ctx.writer.get_message_by_request_id = function() return nil end
            message_handlers._context_staging = {
                valid_reference = original_staging.valid_reference,
                valid_request_id = original_staging.valid_request_id,
                resolve = function(actor, session, request, reference)
                    test.eq(actor, 'actor-1'); test.eq(session, 'session-1'); test.eq(request, 'request-1')
                    test.eq(reference.id, ref.id)
                    return array
                end,
            }
            return ctx, calls, ref
        end
        it('checks visual authorization again after referenced hydration before writing', function()
            local array = { attachment() }
            array[1].kind, array[1].version = 'wippy.attention', 2
            context_attachments._renderer = { supports = function() return false end }
            local inline, inline_calls = context()
            local rejected = message_handlers.handle_message(inline, { request_id = 'request-1', data = { text = 'Unsupported v2', context_attachments = array } })
            test.is_true(rejected.rejected)
            test.eq(rejected.error.code, 'unsupported-attention-version')
            test.eq(#inline_calls, 1)
            local staged, staged_calls, ref = referenced(array)
            rejected = message_handlers.handle_message(staged, { request_id = 'request-1', data = { text = 'Unsupported v2', context_attachments_ref = ref } })
            test.is_true(rejected.rejected)
            test.eq(rejected.error.code, 'unsupported-attention-version')
            test.eq(#staged_calls, 1)
        end)
        it('returns identical accepted inline receipts without expiry or renderer revalidation and rejects changed content or carrier', function()
            local array = { attachment() }
            array[1].kind, array[1].version, array[1].expires_at = 'wippy.attention', 2, '2020-01-01T00:00:00Z'
            context_attachments._renderer = { supports = function() return false end }
            local ctx, calls = context()
            local prior = { message_id = 'persisted-message-1', metadata = { context_attachments = array } }
            prior.request_hash = 'sha256:' .. hash.sha256(context_attachments.canonical_json({ text = 'Accepted inline', file_uuids = {}, context_attachments = array }))
            ctx.writer.get_message_by_request_id = function() return prior end
            local result = message_handlers.handle_message(ctx, { request_id = 'request-1', data = { text = 'Accepted inline', context_attachments = array } })
            test.is_true(result.duplicate)
            test.eq(result.message_id, prior.message_id)
            test.is_nil(result.next_ops)
            for _, call in ipairs(calls) do test.is_true(call.type ~= 'write' and call.type ~= 'received') end
            result = message_handlers.handle_message(ctx, { request_id = 'request-1', data = { text = 'Changed text', context_attachments = array } })
            test.is_true(result.rejected)
            local changed = { attachment() }
            result = message_handlers.handle_message(ctx, { request_id = 'request-1', data = { text = 'Accepted inline', context_attachments = changed } })
            test.is_true(result.rejected)
            prior.context_receipt = { actor_id = 'actor-1', reference = {} }
            result = message_handlers.handle_message(ctx, { request_id = 'request-1', data = { text = 'Accepted inline', context_attachments = array } })
            test.is_true(result.rejected)
        end)
        it('rechecks visual reference authorization before writing', function()
            local ctx, calls, ref = referenced({ visual_attachment() })
            local authorizations = 0
            message_handlers._authorize_visual = function() authorizations = authorizations + 1; return false end
            message_handlers._resolve_visual = function() error('denied reference must not resolve bytes') end
            local result = message_handlers.handle_message(ctx, { request_id = 'request-1', data = { text = 'No visual turn', context_attachments_ref = ref } })
            test.is_true(result.rejected)
            test.eq(authorizations, 1)
            test.eq(#calls, 1)
            test.eq(calls[1].type, 'error')
        end)
        it('rejects hydrated expired attachments without a persistence call', function()
            local expired = attachment()
            expired.created_at = '2020-01-01T00:00:00Z'
            expired.expires_at = '2021-01-01T00:00:00Z'
            local ctx, calls, ref = referenced({ expired })
            local result = message_handlers.handle_message(ctx, { request_id = 'request-1', data = { context_attachments_ref = ref } })
            test.is_true(result.rejected)
            test.eq(#calls, 1)
            test.eq(calls[1].code, consts.ERROR_CODES.INVALID_CONTEXT_ATTACHMENTS)
        end)
        it('fails closed when authorized receipt lookup fails without reading a stage', function()
            local ctx, calls, ref = referenced({ attachment() })
            ctx.writer.get_message_by_request_id = function() return nil, 'CONTEXT_SESSION_UNAVAILABLE' end
            message_handlers._context_staging.resolve = function() error('unauthorized lookup must not hydrate') end
            local result = message_handlers.handle_message(ctx, { request_id = 'request-1', data = { context_attachments_ref = ref } })
            test.is_true(result.rejected)
            test.eq(#calls, 1)
        end)
        it('acknowledges an identical committed expired attachment without revalidation or a second agent step', function()
            local expired = attachment()
            expired.created_at = '2020-01-01T00:00:00Z'
            expired.expires_at = '2021-01-01T00:00:00Z'
            local array = { expired }
            local ctx, calls, ref = referenced(array)
            ctx.writer.get_message_by_request_id = function()
                return { message_id = 'server-original-id', metadata = { context_attachments = array },
                    context_receipt = { actor_id = 'actor-1', reference = ref },
                    request_hash = 'sha256:' .. hash.sha256(context_attachments.canonical_json({ text = 'Original', file_uuids = {}, context_attachments = array })) }
            end
            message_handlers._context_staging.resolve = function() error('committed retry must not read collected stage') end
            local result = message_handlers.handle_message(ctx, { request_id = 'request-1', data = { text = 'Original', context_attachments_ref = ref } })
            test.is_true(result.duplicate)
            test.eq(result.message_id, 'server-original-id')
            test.is_nil(result.next_ops)
            test.eq(#calls, 1)
            test.eq(calls[1].details.message_id, 'server-original-id')
        end)
        it('rejects a corrupt committed receipt instead of acknowledging missing context', function()
            local ctx, calls, ref = referenced({ attachment() })
            ctx.writer.get_message_by_request_id = function()
                return { message_id = 'server-id', metadata = { context_attachments = {} },
                    context_receipt = { actor_id = 'actor-1', reference = ref }, request_hash = 'unused' }
            end
            local result = message_handlers.handle_message(ctx, { request_id = 'request-1', data = { context_attachments_ref = ref } })
            test.is_true(result.rejected)
            test.eq(calls[1].code, 'INVALID_CONTEXT_RECEIPT')
        end)
        it('rejects transaction-time cancellation as a terminal rejected operation rather than failing the command bus', function()
            local ctx, calls, ref = referenced({ attachment() })
            ctx.writer.add_message = function() return nil, 'CONTEXT_REFERENCE_UNAVAILABLE' end
            local result, err = message_handlers.handle_message(ctx, { request_id = 'request-1', data = { context_attachments_ref = ref } })
            test.is_nil(err)
            test.is_true(result.rejected)
            test.eq(calls[1].code, 'CONTEXT_REFERENCE_UNAVAILABLE')
        end)
    end)
    describe("Message context attachment ingestion", function()
        local original_file_authorizer = message_handlers._authorize_file
        after_each(function()
            message_handlers._authorize_file = original_file_authorizer
        end)

        it("persists text files and attachments before correlated acceptance", function()
            local ctx, calls = context()
            ctx.user_id = "actor-1"
            message_handlers._authorize_file = function(file_uuid, actor_id, session_id)
                test.eq(file_uuid, "file-1")
                test.eq(actor_id, "actor-1")
                test.eq(session_id, "session-1")
                return true
            end
            local result, err = message_handlers.handle_message(ctx, {
                request_id = "request-1",
                data = {
                    text = "What am I pointing at?",
                    file_uuids = { "file-1" },
                    context_attachments = { attachment() }
                }
            })

            test.is_nil(err)
            test.eq(result.message_id, "persisted-message-1")
            local write_call = calls[1] :: any
            local received_call = calls[2] :: any
            local success_call = calls[3] :: any
            test.eq(write_call.type, "write")
            test.eq(write_call.request_id, "request-1")
            test.is_true(string.find(write_call.request_hash, "sha256:", 1, true) == 1)
            test.eq(write_call.metadata.context_attachments[1].attachment_id, "attachment-1")
            test.eq(received_call.type, "received")
            test.eq(received_call.request_id, "request-1")
            test.eq(success_call.type, "success")
            test.eq(success_call.details.message_id, "persisted-message-1")
            test.eq(success_call.details.attachments[1].content_hash, attachment().content_hash)
        end)

        it("rejects an unauthorized ordinary file atomically and accepts the next message", function()
            local ctx, calls = context()
            ctx.user_id = "actor-1"
            message_handlers._authorize_file = function(file_uuid, actor_id, session_id)
                test.eq(file_uuid, "foreign-file")
                test.eq(actor_id, "actor-1")
                test.eq(session_id, "session-1")
                return false
            end

            local rejected, reject_err = message_handlers.handle_message(ctx, {
                request_id = "request-foreign-file",
                data = {
                    text = "Do not persist without this file",
                    file_uuids = { "foreign-file" },
                    context_attachments = { attachment() }
                }
            })
            test.is_nil(reject_err)
            test.is_true(rejected.rejected)
            test.eq(rejected.error, consts.ERROR_CODES.INVALID_FILE_REFERENCES)
            test.eq(#calls, 1)
            test.eq(calls[1].type, "error")

            local accepted, accept_err = message_handlers.handle_message(ctx, {
                request_id = "request-after-foreign-file",
                data = { text = "Session remains usable", context_attachments = { attachment() } }
            })
            test.is_nil(accept_err)
            test.eq(accepted.message_id, "persisted-message-1")
            test.eq(calls[2].type, "write")
        end)

        it("rejects invalid attachments without writing a message", function()
            local ctx, calls = context()
            local invalid = attachment()
            invalid.content_hash = "sha256:not-a-digest"

            local result, err = message_handlers.handle_message(ctx, {
                request_id = "request-2",
                data = { text = "Do not persist", context_attachments = { invalid } }
            })

            test.is_nil(err)
            test.is_true(result.rejected)
            test.eq(#calls, 1)
            local error_call = calls[1] :: any
            test.eq(error_call.type, "error")
            test.eq(error_call.code, consts.ERROR_CODES.INVALID_CONTEXT_ATTACHMENTS)
        end)

        it("rejects an unauthorized visual reference before writing the owning message", function()
            local original_authorizer = message_handlers._authorize_visual
            local original_resolver = message_handlers._resolve_visual
            local authorized_request = nil
            message_handlers._authorize_visual = function(request)
                authorized_request = request
                return false
            end
            message_handlers._resolve_visual = function()
                error("must not resolve an unauthorized reference")
            end
            local ctx, calls = context()
            local result, err = message_handlers.handle_message(ctx, {
                request_id = "request-visual-forged",
                data = { text = "Do not persist", context_attachments = { visual_attachment() } }
            })
            message_handlers._authorize_visual = original_authorizer
            message_handlers._resolve_visual = original_resolver

            test.is_nil(err)
            test.is_true(result.rejected)
            test.eq(result.error.code, "visual-reference-unauthorized")
            test.not_nil(authorized_request)
            if authorized_request then
                test.eq(authorized_request.reference.opaque_id, "upload-1")
            end
            test.eq(#calls, 1)
            local error_call = calls[1] :: any
            test.eq(error_call.type, "error")
            test.eq(error_call.code, consts.ERROR_CODES.INVALID_CONTEXT_ATTACHMENTS)
        end)

        it("rejects visual bytes that fail integrity before writing the owning message", function()
            local original_authorizer = message_handlers._authorize_visual
            local original_resolver = message_handlers._resolve_visual
            message_handlers._authorize_visual = function()
                return true
            end
            message_handlers._resolve_visual = function()
                return { data = "data", content_type = "image/png" }
            end
            local ctx, calls = context()
            local result, err = message_handlers.handle_message(ctx, {
                request_id = "request-visual-integrity",
                data = { text = "Do not persist", context_attachments = { visual_attachment() } }
            })
            message_handlers._authorize_visual = original_authorizer
            message_handlers._resolve_visual = original_resolver

            test.is_nil(err)
            test.is_true(result.rejected)
            test.eq(result.error.code, "visual-reference-integrity-mismatch")
            test.eq(#calls, 1)
            local error_call = calls[1] :: any
            test.eq(error_call.type, "error")
            test.eq(error_call.code, consts.ERROR_CODES.INVALID_CONTEXT_ATTACHMENTS)
        end)

        it("does not acknowledge a message whose atomic write fails", function()
            local ctx, calls = context("storage unavailable")
            local result, err = message_handlers.handle_message(ctx, {
                request_id = "request-3",
                data = { text = "Do not acknowledge", context_attachments = { attachment() } }
            })

            test.is_nil(result)
            test.eq(err, "storage unavailable")
            local write_call = calls[1] :: any
            local error_call = calls[2] :: any
            test.eq(write_call.type, "write")
            test.eq(error_call.type, "error")
            test.eq(error_call.code, consts.ERROR_CODES.STORAGE_ERROR)
            test.eq(#calls, 2)
        end)

        it("replays duplicate acceptance without a second upstream message or agent step", function()
            local ctx, calls = context(nil, true)
            local result, err = message_handlers.handle_message(ctx, {
                request_id = "request-retry",
                data = { text = "Retry", context_attachments = { attachment() } }
            })

            test.is_nil(err)
            test.is_true(result.completed)
            test.is_true(result.duplicate)
            test.is_nil(result.next_ops)
            test.eq(#calls, 2)
            test.eq(calls[1].type, "write")
            test.eq(calls[2].type, "success")
            test.eq(calls[2].details.message_id, "persisted-message-1")
        end)

        it("rejects conflicting reuse of a durable request ID", function()
            local ctx, calls = context("Request ID conflict")
            local result, err = message_handlers.handle_message(ctx, {
                request_id = "request-conflict",
                data = { text = "Changed retry", context_attachments = { attachment() } }
            })

            test.is_nil(result)
            test.eq(err, "Request ID conflict")
            test.eq(#calls, 2)
            test.eq(calls[2].type, "error")
            test.eq(calls[2].code, consts.ERROR_CODES.REQUEST_CONFLICT)
        end)
    end)
end

return test.run_cases(define_tests)
