local test = require("test")
local http = require("http")
local json = require("json")
local registry = require("registry")
local agents_details = require("agents_details")
local tools_by_name = require("tools_by_name")

-- GET /agents/details and GET /tools/by-name against the registry fixtures in
-- test/api/_index.yaml. Only the HTTP context and the actor are faked; the
-- agent registry, the registry and the tool name resolver are the real ones.

-- Installs a fake request and response on a handler module. `raw` holds the
-- body as it goes on the wire: the text of res:write, or the JSON encoding of
-- the value given to res:write_json.
local function install(api, query: {[string]: string}, authenticated: boolean?): any
    local result: any = {}
    local req = {
        query = function(_, key) return query[key] end,
    }
    local res = {
        set_content_type = function(_, value) result.content_type = value end,
        set_status = function(_, value) result.status = value end,
        write = function(_, value) result.raw = value end,
        write_json = function(_, value)
            result.body = value
            result.raw = json.encode(value)
        end,
    }
    api._http = {
        STATUS = http.STATUS,
        CONTENT = http.CONTENT,
        request = function() return req end,
        response = function() return res end,
    }
    api._security = {
        actor = function()
            if authenticated == false then return nil end
            return { id = function() return "actor-host-routes" end }
        end,
    }
    return result
end

local function define_tests()
    describe("Web Host route registration", function()
        it("registers the exact GET paths the Web Host calls", function()
            local expected = {
                ["wippy.session.api:agents_details.endpoint"] = "/agents/details",
                ["wippy.session.api:tools_by_name.endpoint"] = "/tools/by-name",
            }
            for id, path in pairs(expected) do
                local entry, err = registry.get(id)
                test.is_nil(err)
                test.eq(entry.kind, "http.endpoint")
                test.eq(entry.data.method, "GET")
                test.eq(entry.data.path, path)
            end
        end)

        it("puts both routes on the router that api_router names", function()
            local reference = registry.get("wippy.session.api:get_capabilities.endpoint")
            test.not_nil(reference)
            for _, id in ipairs({
                "wippy.session.api:agents_details",
                "wippy.session.api:agents_details.endpoint",
                "wippy.session.api:tools_by_name",
                "wippy.session.api:tools_by_name.endpoint",
            }) do
                test.eq(registry.get(id).meta.router, reference.meta.router)
            end
        end)
    end)

    describe("GET /agents/details", function()
        local original = {
            http = agents_details._http,
            security = agents_details._security,
        }

        after_each(function()
            agents_details._http = original.http
            agents_details._security = original.security
        end)

        it("returns a public agent by name with only its string start prompts", function()
            local result = install(agents_details, { agent = "host-routes-public" })
            agents_details.handler()
            test.eq(result.status, 200)
            test.is_true(result.body.success)
            local agent = result.body.agent
            test.eq(agent.id, "app.api:host_routes_public_agent")
            test.eq(agent.name, "host-routes-public")
            test.eq(agent.title, "Host Routes Helper")
            test.eq(#agent.start_prompts, 2)
            test.eq(agent.start_prompts[1], "Summarize this page")
            test.eq(agent.start_prompts[2], "Draft a reply")
        end)

        it("returns an agent by registry id and uses its name when it has no title", function()
            local result = install(agents_details, { agent = "app.api:host_routes_untitled_agent" })
            agents_details.handler()
            test.eq(result.status, 200)
            local agent = result.body.agent
            test.eq(agent.id, "app.api:host_routes_untitled_agent")
            test.eq(agent.name, "host-routes-untitled")
            test.eq(agent.title, "host-routes-untitled")
            test.eq(#agent.start_prompts, 0)
        end)

        it("finds an agent by a name that contains a colon", function()
            local result = install(agents_details, { agent = "host-routes:colon" })
            agents_details.handler()
            test.eq(result.status, 200)
            test.eq(result.body.agent.id, "app.api:host_routes_colon_name_agent")
            test.eq(result.body.agent.title, "Colon Name Helper")
        end)

        it("returns no start prompts when start_prompts is not a list", function()
            local result = install(agents_details, { agent = "host-routes-scalar-prompts" })
            agents_details.handler()
            test.eq(result.status, 200)
            test.eq(result.body.agent.title, "Scalar Prompts Helper")
            test.eq(#result.body.agent.start_prompts, 0)
        end)

        it("answers an unknown agent with 200 and a null agent", function()
            local by_name = install(agents_details, { agent = "host-routes-missing" })
            agents_details.handler()
            test.eq(by_name.status, 200)
            test.eq(by_name.raw, '{"success":true,"agent":null}')

            local by_id = install(agents_details, { agent = "app.api:host_routes_missing_agent" })
            agents_details.handler()
            test.eq(by_id.status, 200)
            test.eq(by_id.raw, '{"success":true,"agent":null}')
        end)

        it("answers a private agent exactly like an unknown one", function()
            local by_name = install(agents_details, { agent = "host-routes-private" })
            agents_details.handler()
            test.eq(by_name.status, 200)
            test.eq(by_name.raw, '{"success":true,"agent":null}')

            local by_id = install(agents_details, { agent = "app.api:host_routes_private_agent" })
            agents_details.handler()
            test.eq(by_id.status, 200)
            test.eq(by_id.raw, '{"success":true,"agent":null}')
        end)

        it("answers a registry id that is not an agent with a null agent", function()
            local result = install(agents_details, { agent = "app.api:host_routes_titled_tool" })
            agents_details.handler()
            test.eq(result.status, 200)
            test.eq(result.raw, '{"success":true,"agent":null}')
        end)

        it("rejects a missing or empty agent parameter with 400", function()
            local missing = install(agents_details, {})
            agents_details.handler()
            test.eq(missing.status, 400)
            test.is_false(missing.body.success)
            test.not_nil(missing.body.error)

            local empty = install(agents_details, { agent = "" })
            agents_details.handler()
            test.eq(empty.status, 400)
            test.is_false(empty.body.success)
        end)

        it("rejects an unauthenticated request with 401", function()
            local result = install(agents_details, { agent = "host-routes-public" }, false)
            agents_details.handler()
            test.eq(result.status, 401)
            test.is_false(result.body.success)
            test.is_nil(result.body.agent)
        end)
    end)

    describe("GET /tools/by-name", function()
        local original = {
            http = tools_by_name._http,
            security = tools_by_name._security,
        }

        after_each(function()
            tools_by_name._http = original.http
            tools_by_name._security = original.security
        end)

        it("finds tools by LLM name and by registry id", function()
            local result = install(tools_by_name, {
                tools = "host_routes_titled_tool,app.api:host_routes_plain_tool",
            })
            tools_by_name.handler()
            test.eq(result.status, 200)
            test.is_true(result.body.success)
            local found = result.body.tools
            test.eq(found["host_routes_titled_tool"].name, "host_routes_titled_tool")
            test.eq(found["host_routes_titled_tool"].title, "Titled Fixture Tool")
            test.eq(found["app.api:host_routes_plain_tool"].name, "host_routes_plain_tool")
        end)

        it("matches a tool by its llm_alias", function()
            local result = install(tools_by_name, { tools = "host_routes_alias,host_routes_aliased_tool" })
            tools_by_name.handler()
            test.eq(result.status, 200)
            local found = result.body.tools["host_routes_alias"]
            test.not_nil(found)
            test.eq(found.name, "host_routes_alias")
            test.eq(found.title, "Aliased Fixture Tool")
            test.is_nil(result.body.tools["host_routes_aliased_tool"])
        end)

        it("uses the LLM name as the title when the tool has none", function()
            local result = install(tools_by_name, { tools = "host_routes_plain_tool" })
            tools_by_name.handler()
            test.eq(result.body.tools["host_routes_plain_tool"].title, "host_routes_plain_tool")
        end)

        it("uses the LLM name as the title when the title is empty", function()
            local result = install(tools_by_name, { tools = "host_routes_empty_title_tool" })
            tools_by_name.handler()
            test.eq(result.body.tools["host_routes_empty_title_tool"].title, "host_routes_empty_title_tool")
        end)

        it("leaves out private tools by LLM name and by registry id", function()
            local result = install(tools_by_name, {
                tools = "host_routes_private_alias,app.api:host_routes_private_tool",
            })
            tools_by_name.handler()
            test.eq(result.status, 200)
            test.eq(json.encode(result.body.tools), "{}")
        end)

        it("trims names, skips empty items and leaves out unknown names", function()
            local result = install(tools_by_name, {
                tools = " host_routes_titled_tool ,, host_routes_no_such_tool ,",
            })
            tools_by_name.handler()
            test.eq(result.status, 200)
            local count = 0
            for _ in pairs(result.body.tools) do count = count + 1 end
            test.eq(count, 1)
            test.not_nil(result.body.tools["host_routes_titled_tool"])
            test.is_nil(result.body.tools["host_routes_no_such_tool"])
        end)

        it("encodes an empty result as an empty object", function()
            local result = install(tools_by_name, { tools = "host_routes_no_such_tool" })
            tools_by_name.handler()
            test.eq(result.status, 200)
            test.eq(json.encode(result.body.tools), "{}")
            test.not_nil((string.find(result.raw, '"tools":{}', 1, true)))
        end)

        it("rejects a missing or empty tools parameter with 400", function()
            local missing = install(tools_by_name, {})
            tools_by_name.handler()
            test.eq(missing.status, 400)
            test.is_false(missing.body.success)
            test.not_nil(missing.body.error)

            local empty = install(tools_by_name, { tools = "" })
            tools_by_name.handler()
            test.eq(empty.status, 400)
            test.is_false(empty.body.success)
        end)

        it("rejects an unauthenticated request with 401", function()
            local result = install(tools_by_name, { tools = "host_routes_titled_tool" }, false)
            tools_by_name.handler()
            test.eq(result.status, 401)
            test.is_false(result.body.success)
            test.is_nil(result.body.tools)
        end)
    end)
end

return test.run_cases(define_tests)
