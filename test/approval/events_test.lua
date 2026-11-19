local test = require("test")
local json = require("json")
local registry = require("registry")
local time = require("time")
local approval_events = require("approval_events")

-- Model-facing results and event payloads of the approval gate (EE2-2710,
-- architecture 4.8 and 4.9, docs/tool-approval-protocol.md section 11).

local REASONS = {
    "denied_by_user", "stopped_by_user", "not_run_batch_stopped", "expired", "stopped",
    "superseded_by_user_message", "interrupted", "approval_ui_unavailable", "limit",
    "changed_before_run", "revoked", "repeated_denied_call", "approval_check_failed",
}

local function define_tests()
    describe("Tool approval events and model results", function()
        it("defines a fixed result for every reason of the protocol table and nothing names an approval", function()
            for _, reason in ipairs(REASONS) do
                test.is_true(approval_events.is_reason(reason), reason)
                local result = approval_events.model_result(reason)
                test.is_false(result.executed, reason)
                test.eq(result.reason, reason)
                test.eq(type(result.instruction), "string", reason)
                test.is_true(#result.instruction > 0, reason)
                local text = approval_events.not_run_text(reason)
                test.is_true(text:sub(1, 8) == "Not run:" or text:sub(1, 8) == "Skipped ", reason .. ": " .. text)
                local encoded = json.encode(result)
                for _, word in ipairs({ "approval_id", "digest", "grant" }) do
                    test.is_nil(encoded:find(word, 1, true), reason .. " names " .. word)
                end
            end
            test.is_false(approval_events.is_reason("stale"))
            test.is_false(pcall(approval_events.model_result, "stale"), "an unknown reason is an error")
        end)

        it("defines approval_check_failed for the freeze_failed outcome", function()
            local result = approval_events.model_result("approval_check_failed")
            test.eq(result.instruction, "The tool did not run. Do not call it again with the same arguments."
                .. " The call could not be prepared for the approval check.")
            test.is_nil(result.user_feedback)
            test.eq(approval_events.not_run_text("approval_check_failed"),
                "Not run: the call could not be checked for approval.")
        end)

        it("matches the protocol fixture for a continue denial", function()
            local result = approval_events.model_result("denied_by_user", "Use the staging customer instead.")
            test.eq(result.user_feedback, "Use the staging customer instead.")
            test.eq(result.instruction,
                "The tool did not run. Do not call it again with the same arguments. Follow the user's feedback.")
            test.eq(approval_events.not_run_text("denied_by_user"), "Not run: you denied this call.")
        end)

        it("maps each closure to its reasons, turn end and checkpoint", function()
            local asked = { state = "interrupted", expires_at = "2026-11-19T10:15:00Z", decided_via = "system" }
            local granted = { state = "approved", decided_via = "grant" }
            test.eq(approval_events.closed_reason("finish", asked), "interrupted")
            test.eq(approval_events.closed_reason("unavailable", { state = "unavailable" }), "approval_ui_unavailable")
            test.eq(approval_events.closed_reason("unavailable", granted), "not_run_batch_stopped")
            test.eq(approval_events.closed_reason("unavailable", nil), "not_run_batch_stopped")
            test.eq(approval_events.closed_reason("limit", nil), "limit")
            test.eq(approval_events.closed_reason("limit", { state = "limited" }), "limit")
            test.eq(approval_events.closed_reason("steering", nil), "superseded_by_user_message")
            test.eq(approval_events.closed_reason("deadline", asked), "expired")
            test.eq(approval_events.closed_reason("deadline", granted), "not_run_batch_stopped")
            local reason, feedback = approval_events.closed_reason("stop_denial",
                { state = "denied", ["then"] = "continue", reason = "No" })
            test.eq(reason, "denied_by_user")
            test.eq(feedback, "No")
            test.eq(approval_events.closed_reason("stop_denial", { state = "denied", ["then"] = "stop" }), "stopped_by_user")
            test.is_true(approval_events.CLOSE.limit.end_turn)
            test.is_true(approval_events.CLOSE.unavailable.end_turn)
            test.is_false(approval_events.CLOSE.steering.end_turn)
            test.is_true(approval_events.CLOSE.stop.skip_checkpoint)
            test.is_nil(approval_events.CLOSE.limit.skip_checkpoint)
            test.is_false(pcall(approval_events.closed_reason, "nope", nil))
        end)

        it("builds the tool_approval payload without a client request_id", function()
            local record = {
                approval_id = "a1", batch_id = "b1", tool_message_id = "m1", call_id = "call_abc",
                row_type = "function", state = "pending", revision = 1, intent_digest = "sha256:x",
                requested_at = "2026-11-19T10:00:00Z", expires_at = "2026-11-19T10:15:00Z",
                offered = { decisions = { "approve", "deny" } }, display = { title = "Delete customer" },
            }
            local payload = approval_events.tool_approval_payload(record, "delete_customer", "2026-11-19T10:00:01Z")
            test.eq(payload.message_id, "m1")
            test.eq(payload.call_id, "call_abc")
            test.eq(payload.row_type, "function")
            test.eq(payload.server_now, "2026-11-19T10:00:01Z")
            test.eq(payload.approval.approval_id, "a1")
            test.eq(payload.approval.batch_id, "b1")
            test.is_nil(payload.request_id)
            local not_run = approval_events.not_run_payload("m1", "call_abc", "delete_customer", "limit",
                { approval_id = "a1", state = "limited", disposition = "not_run" })
            test.eq(not_run.outcome, "not_approved")
            test.eq(not_run.error, "Not run: too many approval requests in this turn.")
            test.eq(not_run.approval.disposition, "not_run")
            test.eq(approval_events.not_run_payload("m1", "c", "f", "stopped", nil, true).outcome, "cancelled")
        end)

        it("clears the activity with an explicit null, as the protocol fixture shows", function()
            local raw = registry.get("app.approval:protocol_fixtures").data.fixtures["session_update_activity_cleared.json"]
            local sent = nil
            local upstream = { update_session = function(_self, changes) sent = changes end }
            approval_events.publish_activity(upstream, { activity = nil, revision = 8 })
            local event = { type = "update", session_id = "01990a2b-0000-7000-8000-000000000001" }
            for key, value in pairs(sent) do event[key] = value end
            local encoded = json.encode(event)
            test.contains(encoded, '"activity":null', "the key is on the wire")
            test.contains(tostring(raw), '"activity": null')
            local fixture = assert(json.decode(tostring(raw)))
            local decoded = assert(json.decode(encoded))
            for _, key in ipairs({ "type", "session_id", "activity_revision" }) do
                test.eq(decoded[key], fixture[key], key)
            end
            -- The null survives the process message the upstream sends.
            local inbox = process.inbox()
            process.send(process.pid(), "approval_activity_probe", event)
            local got = channel.select({ inbox:case_receive(), time.after("1s"):case_receive() })
            test.is_true(got.channel == inbox, "the probe message arrived")
            test.contains(json.encode(got.value:payload():data()), '"activity":null')
        end)

        it("sends each notice once per turn", function()
            local sent = {}
            local upstream = { session_error = function(_self, code, message)
                sent[#sent + 1] = { code = code, message = message }
            end }
            local turn = {}
            test.is_true(approval_events.publish_notice(upstream, turn, "turn-1", approval_events.NOTICE.LIMIT))
            test.is_false(approval_events.publish_notice(upstream, turn, "turn-1", approval_events.NOTICE.LIMIT))
            test.is_true(approval_events.publish_notice(upstream, turn, "turn-1", approval_events.NOTICE.UNAVAILABLE))
            test.eq(#sent, 2)
            -- The turn state table outlives a turn: a new turn ID sends again.
            test.is_true(approval_events.publish_notice(upstream, turn, "turn-2", approval_events.NOTICE.LIMIT))
            test.eq(#sent, 3)
            test.eq(sent[1].code, "tool_approval_limit")
            test.eq(sent[2].code, "tool_approval_unavailable")
            test.eq(sent[2].message,
                "A tool call needs your approval, but no open chat window can show it. The assistant stopped.")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
