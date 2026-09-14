local test = require('test')
local hash = require('hash')
local time = require('time')
local api = require('context_staging')
local attachments = require('context_attachments')

local function envelope(padding, expiry)
    local content = attachments.canonical_json({ text = string.char(34, 10, 92, 197, 188) .. string.rep('a', padding or 0) })
    return { attachment_id = 'http-test', kind = 'example.context', version = 1,
        created_at = time.now():utc():format_rfc3339(), expires_at = expiry,
        content_type = 'application/json', content = content,
        content_bytes = #content, content_hash = 'sha256:' .. hash.sha256(content) }
end

local function full_array()
    local padding = 32000
    for _ = 1, 5 do
        local body = attachments.canonical_json({ envelope(padding) })
        if #body == 32768 then return body end
        padding = padding + 32768 - #body
    end
    error('full quota fixture did not converge')
end

local function define_tests()
    describe('Context staging HTTP contract', function()
        local original = { http = api._http, security = api._security, writer = api._writer, staging = api._staging }
        after_each(function()
            api._http, api._security, api._writer, api._staging = original.http, original.security, original.writer, original.staging
        end)
        local function invoke(options)
            local opts = options or {}
            local result = { headers = {}, calls = {}, body_reads = 0 } :: {
                headers: { [string]: string },
                calls: { [number]: { [string]: any } },
                body_reads: number,
                status: number?,
                body: any?,
                reader_config: { max_body: number, timeout: number }?,
            }
            local body = opts.body or attachments.canonical_json({ envelope() })
            local req = {
                query = function(_, key)
                    local values = { session_id = 'session-http', request_id = 'request-http', id = 'stage-http' }
                    if opts.query then for k, value in pairs(opts.query) do values[k] = value end end
                    return values[key]
                end,
                method = function() return opts.method or 'GET' end,
                header = function() return opts.encoding end,
                is_content_type = function() return opts.content_type ~= false end,
                content_length = function() return opts.length or #body end,
                body = function() result.body_reads = result.body_reads + 1; return body, opts.body_error end,
            }
            local res = {
                set_status = function(_, status) result.status = status end,
                set_content_type = function(_, value) result.content_type = value end,
                set_header = function(_, key, value) result.headers[key] = value end,
                write_json = function(_, value) result.body = value end,
            }
            api._http = {
                request = function(config) result.reader_config = config; return req end,
                response = function() return res end,
            }
            api._security = {
                actor = function() if opts.anonymous then return nil end; return { id = function() return 'actor-http' end } end,
                can = function(action, resource)
                    test.eq(action, 'write'); test.eq(resource, 'session:session-http'); return not opts.forbidden
                end,
            }
            api._writer = { new = function() if opts.missing then return nil end; return {} end }
            api._staging = {
                cleanup = function() if opts.unavailable then return nil, 'CONTEXT_STAGING_UNAVAILABLE' end; return 0 end,
                create = function(actor, session, request, canonical, expiry)
                    table.insert(result.calls, { actor = actor, session = session, request = request, canonical = canonical, expiry = expiry })
                    if opts.stage_error then return nil, opts.stage_error end
                    return { context_attachments_ref = { version = 1, id = 'stage-http', content_hash = 'sha256:' .. hash.sha256(canonical), content_bytes = #canonical },
                        expires_at = time.unix(expiry, 0):utc():format_rfc3339() }
                end,
                cancel = function(actor, session, request, id)
                    table.insert(result.calls, { actor = actor, session = session, request = request, id = id })
                    if opts.stage_error then return nil, opts.stage_error end
                    return true
                end,
            }
            api.handler()
            test.eq(result.headers['Cache-Control'], 'no-store')
            test.eq(result.reader_config.max_body, 32768)
            test.eq(result.reader_config.timeout, 5000)
            return result
        end
        it('advertises only the exact authenticated versioned capability', function()
            local result = invoke()
            test.eq(result.status, 200)
            test.eq(attachments.canonical_json(result.body), attachments.canonical_json({ context_attachments_transport = { version = 1, staging = true, max_context_bytes = 32768 } }))
            test.eq(result.body_reads, 0)
        end)
        it('rejects missing actor permission ownership and request identities before reading', function()
            local supported = invoke({ query = { capabilities_version = '1' } })
            test.eq(supported.status, 200)
            test.eq(attachments.canonical_json(supported.body.context_attachments_capabilities), attachments.canonical_json(attachments.capabilities()))
            for _, version in ipairs({ '2', '', '01' }) do
                local invalid = invoke({ query = { capabilities_version = version } })
                test.eq(invalid.status, 400)
                test.eq(invalid.body.error.code, 'INVALID_CAPABILITIES_VERSION')
                test.eq(invalid.body_reads, 0)
            end
            for _, opts in ipairs({ { anonymous = true, expected = 401 }, { forbidden = true, expected = 403 },
                { missing = true, expected = 404 }, { query = { session_id = '' }, expected = 400 },
                { method = 'POST', query = { request_id = '' }, expected = 400 } }) do
                local result = invoke(opts)
                test.eq(result.status, opts.expected)
                test.eq(result.body_reads, 0)
                test.eq(#result.calls, 0)
            end
        end)
        it('stages a valid full-quota Unicode escaped attachment envelope without truncation', function()
            local body = full_array()
            local result = invoke({ method = 'POST', body = body })
            test.eq(result.status, 201)
            test.eq(result.body_reads, 1)
            test.eq(result.body.context_attachments_ref.content_bytes, 32768)
            test.eq(result.body.context_attachments_ref.content_hash, 'sha256:' .. hash.sha256(body))
            test.eq(result.calls[1].canonical, body)
            test.eq(result.calls[1].actor, 'actor-http')
            test.eq(result.calls[1].request, 'request-http')
        end)
        it('bounds stage expiry by attachment expiry and maximum TTL', function()
            local payload = { schema = 'wippy.attention.v2', snapshot_id = 'http-v2', host_instance_id = 'host-http', mount_generation = 1,
                created_at = '2026-09-04T12:00:00Z', coordinate_space = { kind = 'host-viewport', width = 800, height = 600, device_pixel_ratio = 1 },
                capture = { radius_css_px = 20, grid_step_css_px = 5, sampled_points = 0, points = {}, duration_ms = 0, complete = true },
                path_dictionary = {}, candidates = {}, recent_events = {}, omissions = {} }
            local compact = envelope()
            compact.kind, compact.version = 'wippy.attention', 2
            compact.content = attachments.canonical_json(payload)
            compact.content_bytes, compact.content_hash = #compact.content, 'sha256:' .. hash.sha256(compact.content)
            local body = attachments.canonical_json({ compact })
            local result = invoke({ method = 'POST', body = body })
            test.eq(result.status, 201)
            test.eq(result.calls[1].canonical, body)
            compact.content = compact.content .. ' '
            compact.content_bytes, compact.content_hash = #compact.content, 'sha256:' .. hash.sha256(compact.content)
            local invalid = invoke({ method = 'POST', body = attachments.canonical_json({ compact }) })
            test.eq(invalid.status, 422)
            test.eq(#invalid.calls, 0)
        end)
        it('bounds stage expiry by declared expiry and maximum retention', function()
            local expiry = time.now():add('30s'):utc():format_rfc3339()
            local result = invoke({ method = 'POST', body = attachments.canonical_json({ envelope(0, expiry) }) })
            test.eq(result.status, 201)
            test.eq(result.calls[1].expiry, time.parse(time.RFC3339, expiry):unix())
        end)
        it('rejects unsupported encodings content types and declared oversized bodies before reading', function()
            for _, opts in ipairs({ { encoding = 'gzip', expected = 415 }, { content_type = false, expected = 415 }, { length = 32769, expected = 413 } }) do
                opts.method = 'POST'
                local result = invoke(opts)
                test.eq(result.status, opts.expected)
                test.eq(result.body_reads, 0)
            end
        end)
        it('rejects chunked oversize typed reader errors and malformed noncanonical or invalid arrays', function()
            local cases = {
                { body = string.rep('a', 32769), length = -1, expected = 413 },
                { body_error = errors.new({ message = 'do not expose body', kind = errors.INVALID }), expected = 413 },
                { body_error = errors.new({ message = 'do not expose timeout', kind = errors.INTERNAL }), expected = 400 },
                { body = '[', expected = 400 }, { body = '[ ]', expected = 422 },
                { body = '[1]', expected = 422 },
            }
            for _, opts in ipairs(cases) do
                opts.method = 'POST'
                local result = invoke(opts)
                test.eq(result.status, opts.expected)
                test.eq(#result.calls, 0)
                test.eq(result.body.error.message, 'Context transport request rejected')
            end
        end)
        it('maps safe conflict quota and availability failures', function()
            for _, case in ipairs({ { 'CONTEXT_STAGE_CONFLICT', 409 }, { 'CONTEXT_STAGE_QUOTA', 429 }, { 'CONTEXT_STAGING_UNAVAILABLE', 503 } }) do
                local result = invoke({ method = 'POST', stage_error = case[1] })
                test.eq(result.status, case[2])
                test.eq(result.body.error.code, case[1])
            end
            test.eq(invoke({ unavailable = true }).status, 503)
        end)
        it('cancels only the bound actor session request and reference without reading a body', function()
            local result = invoke({ method = 'DELETE' })
            test.eq(result.status, 200)
            test.is_true(result.body.success)
            test.eq(result.body_reads, 0)
            test.eq(result.calls[1].actor, 'actor-http')
            test.eq(result.calls[1].session, 'session-http')
            test.eq(result.calls[1].request, 'request-http')
            test.eq(result.calls[1].id, 'stage-http')
        end)
        it('returns conflict without a new locator when a committed request cannot be restaged', function()
            local result = invoke({ method = 'POST', stage_error = 'CONTEXT_STAGE_CONFLICT' })
            test.eq(result.status, 409)
            test.eq(result.body.error.code, 'CONTEXT_STAGE_CONFLICT')
            test.is_nil(result.body.context_attachments_ref)
        end)
    end)
end

return test.run_cases(define_tests)
