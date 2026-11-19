local test = require("test")
local json = require("json")
local registry = require("registry")

-- The JSON fixtures of docs/tool-approval-protocol.md (inlined into the
-- registry entry app.approval:protocol_fixtures) keep the keys a client
-- reads. Paths are dotted; a number selects an array item (1-based). A path
-- in `null` must hold a JSON null at exactly that path.
local REQUIRED = {
    ["capabilities.json"] = { "success", "capabilities.schema", "capabilities.tool_approval" },
    ["tool_approval_surface_declare.json"] = { "type", "session_id", "request_id", "data.command", "data.enabled" },
    ["session_message_runtime_context.json"] = { "type", "session_id", "data.text",
        "data.runtime_context.tool_approval_ui" },
    ["tool_approval_surface_withdraw.json"] = { "type", "session_id", "data.command", "data.enabled" },
    ["tool_approval_event_pending.json"] = { "type", "session_id", "message_id", "call_id", "function_name",
        "row_type", "server_now", "approval.approval_id", "approval.batch_id", "approval.state",
        "approval.revision", "approval.intent_digest", "approval.requested_at", "approval.expires_at",
        "approval.offered.decisions", "approval.offered.approve_all.scope", "approval.offered.approve_all.covers",
        "approval.display.title", "approval.display.description", "approval.display.agent",
        "approval.display.summary", "approval.display.arguments", "approval.display.cut",
        "approval.display.numbers", "approval.display.batch_peers", "approval.display.approve_all_scope.scope",
        "approval.display.approve_all_scope.tools", "approval.display.approve_all_scope.covered",
        "approval.display.approve_all_scope.covered_count",
        null = { "approval.decided_at", "approval.decided_via", "approval.grant_id", "approval.disposition" } },
    ["tool_approval_event_decided.json"] = { "type", "session_id", "message_id", "call_id", "server_now",
        "approval.approval_id", "approval.state", "approval.revision", "approval.decided_via", "approval.decided_at" },
    ["tool_approval_event_grant.json"] = { "type", "row_type", "approval.state", "approval.decided_via",
        "approval.grant_id" },
    ["decision_approve.json"] = { "type", "session_id", "request_id", "data.command", "data.approval_id",
        "data.decision", "data.intent_digest", "data.expected_revision" },
    ["decision_approve_all.json"] = { "type", "request_id", "data.command", "data.decision",
        "data.approve_all_scope", "data.intent_digest", "data.expected_revision" },
    ["decision_deny_stop.json"] = { "type", "request_id", "data.command", "data.decision", "data.then",
        "data.intent_digest", "data.expected_revision" },
    ["decision_deny_continue.json"] = { "type", "request_id", "data.command", "data.decision", "data.then",
        "data.reason", "data.intent_digest", "data.expected_revision" },
    ["grant_revoke.json"] = { "type", "session_id", "request_id", "data.command", "data.grant_id",
        "data.expected_revision" },
    ["command_response_decision.json"] = { "type", "session_id", "request_id", "success", "approval.approval_id",
        "approval.state", "approvals.1.approval_id", "grant.grant_id", "grant.scope", "grant.status",
        "grant.revision" },
    ["command_response_revoke.json"] = { "type", "request_id", "success", "grant.grant_id", "grant.status",
        "grant.revision" },
    ["command_error_not_pending.json"] = { "type", "session_id", "request_id", "code", "message",
        "approval.approval_id", "approval.state", "approval.revision" },
    ["command_error_stale.json"] = { "type", "request_id", "code", "message" },
    ["function_error_not_approved.json"] = { "type", "session_id", "message_id", "call_id", "function_name",
        "error", "outcome", "approval.approval_id", "approval.state", "approval.disposition" },
    ["function_call_approved.json"] = { "type", "session_id", "message_id", "function_name", "approval.state",
        "approval.decided_via", null = { "approval.grant_id" } },
    ["session_update_activity.json"] = { "type", "session_id", "activity.kind", "activity.approval_ids",
        "activity_revision", "tool_approval.active", "tool_approval.revision", "tool_approval.grants.1.grant_id",
        "tool_approval.grants.1.revision", "tool_approval.grants.1.scope", "tool_approval.grants.1.status",
        "tool_approval.grants.1.registry_id", "tool_approval.grants.1.title", "tool_approval.grants.1.created_at",
        null = { "tool_approval.grants.1.suspension_reason" } },
    ["session_update_activity_cleared.json"] = { "type", "session_id", "activity_revision", null = { "activity" } },
    ["session_error_unavailable.json"] = { "type", "session_id", "code", "message" },
    ["session_error_limit.json"] = { "type", "session_id", "code", "message" },
    ["rest_session.json"] = { "success", "server_now", "session.session_id", "session.status", "session.activity",
        "session.activity_revision", "session.tool_approval.active", "session.tool_approval.grants" },
    ["rest_message_row.json"] = { "success", "server_now", "messages.1.message_id", "messages.1.type",
        "messages.1.metadata.status", "messages.1.metadata.approval.approval_id",
        "messages.1.metadata.approval.call_id", "messages.1.metadata.approval.state",
        "messages.1.metadata.approval.revision", "messages.1.metadata.approval.intent_digest",
        "messages.1.metadata.approval.offered", "messages.1.metadata.approval.display",
        "messages.1.metadata.approval.requested_at", "messages.1.metadata.approval.expires_at" },
    ["model_result_not_run.json"] = { "executed", "reason", "instruction" },
}

-- The JSON decoder drops a null; each object value null is decoded as this
-- marker instead, so a null is told apart from a missing key at its path.
local NULL = "<json null>"

local function decode(raw: string): (any, string?)
    local marked = raw:gsub(":%s*null(%s*[,}])", ': "<json null>"%1')
    local decoded, err = json.decode(marked)
    if err then return nil, tostring(err) end
    return decoded, nil
end

local function resolve(value: any, path: string): any
    local current = value
    for segment in path:gmatch("[^%.]+") do
        if type(current) ~= "table" then return nil end
        current = current[tonumber(segment) or segment]
    end
    return current
end

-- The problems of one fixture against its required keys.
local function problems_of(raw: string, required: any): {string}
    local fixture, err = decode(raw)
    if not fixture then return { "not JSON: " .. tostring(err) } end
    local problems = {}
    for _, path in ipairs(required) do
        if resolve(fixture, path) == nil then problems[#problems + 1] = path .. " is missing" end
    end
    for _, path in ipairs(required.null or {}) do
        if resolve(fixture, path) ~= NULL then problems[#problems + 1] = path .. " is not null" end
    end
    return problems
end

local function fixtures(): any
    return assert(registry.get("app.approval:protocol_fixtures")).data.fixtures
end

local function define_tests()
    describe("Tool approval protocol fixtures", function()
        it("checks every registered fixture and nothing else", function()
            for file in pairs(fixtures()) do test.not_nil(REQUIRED[file], "required keys listed: " .. file) end
            for file in pairs(REQUIRED) do test.not_nil(fixtures()[file], "fixture registered: " .. file) end
        end)

        it("gives every fixture the keys a client reads", function()
            for file, raw in pairs(fixtures()) do
                local problems = problems_of(tostring(raw), REQUIRED[file] or {})
                test.eq(#problems, 0, file .. ": " .. table.concat(problems, "; "))
            end
        end)

        it("reports a missing key and a null that sits at another path", function()
            local problems = problems_of('{"approval":{"state":"approved"},"other":{"grant_id":null}}',
                { "approval.revision", null = { "approval.grant_id" } })
            test.eq(table.concat(problems, "; "), "approval.revision is missing; approval.grant_id is not null")
        end)

        it("never names a client request_id in a state event", function()
            for _, file in ipairs({ "tool_approval_event_pending.json", "tool_approval_event_decided.json",
                "tool_approval_event_grant.json" }) do
                test.is_nil(resolve(assert(decode(tostring(fixtures()[file]))), "request_id"), file)
            end
        end)
    end)
end

return test.run_cases(define_tests)
