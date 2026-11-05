local test = require('test')
local api = require('get_capabilities')

local function define_tests()
    describe('Session capabilities HTTP contract', function()
        local original = {
            http = api._http,
            security = api._security,
            context_attachments = api._context_attachments,
            context_staging_repo = api._context_staging_repo,
        }

        local function install(options): any
            options = options or {}
            local result: any = {}
            local res = {
                set_header = function(_, key, value)
                    result.headers = result.headers or {}
                    result.headers[key] = value
                end,
                set_content_type = function(_, value) result.content_type = value end,
                set_status = function(_, value) result.status = value end,
                write_json = function(_, value) result.body = value end,
            }
            api._http = {
                CONTENT = { JSON = 'application/json' },
                response = function() return res end,
            }
            api._security = {
                actor = function()
                    if options.authenticated == false then return nil end
                    return { id = function() return 'actor-capabilities' end }
                end,
            }
            api._context_attachments = {
                capabilities = function()
                    return { version = 1, handlers = options.handlers or {
                        { kind = 'wippy.attention', versions = { 1, 2, 3, 4 } },
                        { kind = 'wippy.attention.visual', versions = { 1 } },
                    } }
                end,
            }
            api._context_staging_repo = { MAX_BYTES = 32768 }
            return result
        end

        after_each(function()
            api._http = original.http
            api._security = original.security
            api._context_attachments = original.context_attachments
            api._context_staging_repo = original.context_staging_repo
        end)

        it('rejects an unauthenticated request', function()
            local result = install({ authenticated = false })
            api.handler()
            test.eq(result.status, 401)
            test.eq(result.body.error.code, 'UNAUTHENTICATED')
            test.is_nil(result.body.capabilities)
        end)

        it('describes receipt, steering and Attention support without caching', function()
            local result = install()
            api.handler()
            test.eq(result.status, 200)
            test.eq(result.headers['Cache-Control'], 'no-store')
            local capabilities = result.body.capabilities
            test.eq(capabilities.schema, 'wippy.session.capabilities.v1')
            test.eq(capabilities.message_receipt, 1)
            test.eq(capabilities.steering, 1)
            test.eq(capabilities.attention.context, 1)
            test.eq(capabilities.attention.browser_operations, 1)
            test.eq(capabilities.attention.context_attachments.transport, 1)
            test.is_true(capabilities.attention.context_attachments.staging)
            test.eq(capabilities.attention.context_attachments.max_context_bytes, 32768)
            test.eq(#capabilities.attention.context_attachments.handlers, 2)
            test.eq(capabilities.attention.context_attachments.handlers[2].kind, 'wippy.attention.visual')
        end)

        it('reports only the attachment versions the renderer supports', function()
            local result = install({ handlers = { { kind = 'wippy.attention', versions = { 1 } } } })
            api.handler()
            local handlers = result.body.capabilities.attention.context_attachments.handlers
            test.eq(#handlers, 1)
            test.eq(#handlers[1].versions, 1)
        end)
    end)
end

return test.run_cases(define_tests)
