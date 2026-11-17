local test = require("test")
local json = require("json")
local uuid = require("uuid")
local security = require("security")
local artifact_state_access = require("artifact_state_access")
local state_service = require("state_service")
local wait_for_boot = require("wait_for_boot")

-- The form state endpoints' request handling (artifact_state_access) with a
-- fake request and response: the refusals that never reach the state
-- service (no actor, wrong Content-Type, a body over the cap, an unreadable
-- body) and the hand-over to the state service.

-- opts: content_type, content_length, artifact_id, chunks (the body as the
-- stream returns it), read_error, stream_error.
local function fake_exchange(opts: any)
    local req = {
        content_type = function(_self) return opts.content_type end,
        content_length = function(_self) return opts.content_length end,
        param = function(_self, name)
            if name == "id" then return opts.artifact_id end
            return nil
        end,
        stream = function(_self)
            if opts.stream_error then return nil, opts.stream_error end
            local position = 0
            return {
                read = function(_stream, _size)
                    position = position + 1
                    if opts.read_error then return nil, opts.read_error end
                    return (opts.chunks or {})[position], nil
                end,
                close = function(_stream) end,
            }
        end,
    }
    local res = { headers = {} } :: any
    function res:set_status(status) self.status = status end
    function res:set_content_type(content_type) self.content_type = content_type end
    function res:set_header(name, value) self.headers[name] = value end
    function res:write(body) self.body = body end
    return req, res
end

local function decoded(res: any): any
    local body, err = json.decode(tostring(res.body))
    test.is_nil(err)
    return body
end

local function define_tests()
    describe("form state endpoints, before the state service", function()
        it("answers a request with no actor as 401, never cached", function()
            local _, res = fake_exchange({})
            artifact_state_access.respond_unauthenticated(res)

            test.eq(res.status, 401)
            test.eq(res.content_type, "application/json")
            test.eq(res.headers["Cache-Control"], "no-store")
            local body = decoded(res)
            test.eq(body.success, false)
            test.eq(body.code, "unauthorized")
        end)

        it("opens the request with a short deadline and a body cap that fit the answer limit", function()
            local options = artifact_state_access.request_options()
            test.eq(options.timeout, artifact_state_access.REQUEST_TIMEOUT_MS)
            test.is_true(options.timeout <= 5000, "the default is 5 minutes; a slow upload must not hold a worker that long")
            test.is_true(options.max_body < 120 * 1024 * 1024, "the default is 120 MB")
            -- read_capped answers 413 for a body over the cap; the transport
            -- cap must sit above the largest body it can read before that.
            test.is_true(options.max_body >= state_service.MAX_BODY_BYTES * 2)
            test.is_true(options.max_body <= 1024 * 1024)
        end)

        it("refuses a body that is not JSON before reading it", function()
            local req, res = fake_exchange({ content_type = "text/plain", chunks = { "{}" },
                stream_error = "the body must not be read" })
            artifact_state_access.serve_submit(req, res, "user-1")

            test.eq(res.status, 415)
            test.eq(decoded(res).code, "unsupported_media_type")
            test.eq(res.headers["Cache-Control"], "no-store")
        end)

        it("refuses a declared length over the cap without reading the body", function()
            local req, res = fake_exchange({ content_type = "application/json",
                content_length = state_service.MAX_BODY_BYTES + 1, stream_error = "the body must not be read" })
            artifact_state_access.serve_submit(req, res, "user-1")

            test.eq(res.status, 413)
            local body = decoded(res)
            test.eq(body.code, "payload_too_large")
            test.eq(body.message, "The submission is larger than 64 KiB.")
        end)

        it("refuses a body that grows past the cap while it is read", function()
            local chunk = string.rep("a", state_service.MAX_BODY_BYTES)
            local req, res = fake_exchange({ content_type = "application/json; charset=utf-8",
                chunks = { chunk, "b" } })
            artifact_state_access.serve_submit(req, res, "user-1")

            test.eq(res.status, 413)
            test.eq(decoded(res).code, "payload_too_large")
        end)

        it("answers an unreadable body as a 500 without its cause", function()
            local cases = {
                { label = "a failed read", opts = { read_error = "connection reset" } },
                { label = "no stream", opts = { stream_error = "stream unavailable" } },
            }
            for _, case in ipairs(cases) do
                local label = tostring(case.label)
                case.opts.content_type = "application/json"
                local req, res = fake_exchange(case.opts)
                artifact_state_access.serve_submit(req, res, "user-1")

                test.eq(res.status, 500, label)
                local body = decoded(res)
                test.eq(body.code, "internal", label)
                test.eq(body.message, "Failed to read the request body.", label)
            end
        end)
    end)

    describe("form state endpoints, handing over to the state service", function()
        local user_id = ""

        before_all(function()
            wait_for_boot.run()
            local actor = security.actor()
            user_id = actor and actor:id() or ""
        end)

        it("passes a readable body and the path id on", function()
            local req, res = fake_exchange({ content_type = "application/json",
                artifact_id = uuid.v7(), chunks = { "{}" } })
            artifact_state_access.serve_submit(req, res, user_id)

            test.eq(res.status, 404)
            test.eq(decoded(res).code, "not_found")
            test.eq(res.headers["Cache-Control"], "no-store")
        end)

        it("answers a read of an unknown form with the state service's 404", function()
            local req, res = fake_exchange({ artifact_id = uuid.v7() })
            artifact_state_access.serve_get(req, res, user_id)

            test.eq(res.status, 404)
            test.eq(decoded(res).code, "not_found")
            test.eq(res.headers["Cache-Control"], "no-store")
        end)
    end)
end

return test.run_cases(define_tests)
