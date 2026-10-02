local test = require('test')
local api = require('set_attention_context')

local function define_tests()
    describe('Session Attention context HTTP contract', function()
        local original = {
            http = api._http,
            security = api._security,
            session_repo = api._session_repo,
            consts = api._consts,
            context_attachments = api._context_attachments,
            process = api._process,
        }

        local function install(options): any
            options = options or {}
            local result: any = { updates = 0, sends = 0 }
            local req = {
                param = function(_, key)
                    if key == 'session_id' then return options.session_id or 'session-http' end
                end,
                body_json = function()
                    return options.body or { enabled = true, expected_revision = 0 }
                end,
            }
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
                request = function() return req end,
                response = function() return res end,
            }
            api._security = {
                actor = function()
                    if options.authenticated == false then return nil end
                    return { id = function() return options.actor_id or 'actor-http' end }
                end,
                can = function() return options.authorized ~= false end,
            }
            api._context_attachments = {
                supports = function(kind, version)
                    test.eq(kind, 'wippy.attention')
                    test.eq(version, 4)
                    return options.capable ~= false
                end,
            }
            api._session_repo = {
                update_attention_context = function(session_id, enabled, expected_revision, updated_by)
                    result.updates = result.updates + 1
                    result.persisted = true
                    result.update = {
                        session_id = session_id,
                        enabled = enabled,
                        expected_revision = expected_revision,
                        updated_by = updated_by,
                    }
                    if options.update_err then
                        return nil, options.update_err, options.current
                    end
                    return options.state or {
                        enabled = enabled,
                        revision = (expected_revision or 0) + 1,
                        updated_by = updated_by,
                    }
                end,
            }
            api._consts = { TOPICS = { ATTENTION_CONTEXT_UPDATED = 'attention-updated' } }
            api._process = {
                registry = {
                    lookup = function() return options.session_pid end,
                },
                send = function(_, topic, payload)
                    test.is_true(result.persisted)
                    result.sends = result.sends + 1
                    result.topic = topic
                    result.payload = payload
                    return true
                end,
            }
            return result
        end

        after_each(function()
            api._http = original.http
            api._security = original.security
            api._session_repo = original.session_repo
            api._consts = original.consts
            api._context_attachments = original.context_attachments
            api._process = original.process
        end)

        it('rejects an unauthenticated request before reading capability or storage', function()
            local result = install({ authenticated = false })
            api.handler()
            test.eq(result.status, 401)
            test.eq(result.body.error.code, 'UNAUTHENTICATED')
            test.eq(result.updates, 0)
        end)

        it('rejects a request without session ownership before changing state', function()
            local result = install({ authorized = false })
            api.handler()
            test.eq(result.status, 403)
            test.eq(result.body.error.code, 'SESSION_FORBIDDEN')
            test.eq(result.updates, 0)
        end)

        it('rejects enablement when Attention version 4 is unavailable', function()
            local result = install({ capable = false })
            api.handler()
            test.eq(result.status, 409)
            test.eq(result.body.error.code, 'ATTENTION_CONTEXT_CAPABILITY_UNAVAILABLE')
            test.eq(result.updates, 0)
        end)

        it('allows disablement when capability is unavailable and emits only after persistence', function()
            local result = install({
                body = { enabled = false, expected_revision = 3 },
                capable = false,
                session_pid = 'session-pid',
            })
            api.handler()
            test.eq(result.status, 200)
            test.eq(result.updates, 1)
            test.eq(result.update.enabled, false)
            test.eq(result.update.expected_revision, 3)
            test.eq(result.sends, 1)
            test.eq(result.topic, 'attention-updated')
            test.is_false(result.payload.attention_context.enabled)
        end)

        it('returns the current state for an expected revision conflict without emitting an update', function()
            local current = { enabled = true, revision = 4, updated_by = 'agent:agent-1' }
            local result = install({
                body = { enabled = false, expected_revision = 2 },
                session_pid = 'session-pid',
                update_err = 'ATTENTION_CONTEXT_REVISION_CONFLICT',
                current = current,
            })
            api.handler()
            test.eq(result.status, 409)
            test.eq(result.body.error.code, 'ATTENTION_CONTEXT_REVISION_CONFLICT')
            test.eq(result.body.attention_context.revision, 4)
            test.eq(result.updates, 1)
            test.eq(result.sends, 0)
        end)
    end)
end

return test.run_cases(define_tests)
