local test = require("test")
local attention_control_runtime = require("attention_control_runtime")

local function harness()
    local now = 1000
    local sequence = 0
    local updates = 0
    local runtime = attention_control_runtime.new({
        connection_id = "conn-1",
        new_id = function()
            sequence = sequence + 1
            return "grant-" .. sequence
        end,
        now = function()
            return now
        end,
    })
    local function update(enabled, expected_revision, agent_id)
        updates = updates + 1
        return {
            enabled = enabled,
            revision = expected_revision + 1,
            updated_at = "fixture-time",
            updated_by = "agent:" .. agent_id,
        }
    end
    return runtime, update, function(value)
        now = value
    end, function()
        return updates
    end
end

local function request(capability, overrides)
    local value = {
        request_id = "call-1",
        reply_topic = "session_attention_context_result:fixture",
        capability = capability,
        session_id = "session-1",
        agent_id = "agent-1",
        enabled = true,
        expected_revision = 0,
    }
    for key, item in pairs(overrides or {}) do
        value[key] = item
    end
    return value
end

local function expected(overrides)
    local value = {
        schema = "wippy.attention.session-control.v1",
        session_id = "session-1",
        agent_id = "agent-1",
        reply_topic = "session_attention_context_result:fixture",
    }
    for key, item in pairs(overrides or {}) do
        value[key] = item
    end
    return value
end

local function define_tests()
    describe("Attention Session control authority", function()
        it("consumes one grant and replays an exact duplicate once without another update", function()
            local runtime, update, _, update_count = harness()
            local capability = runtime:issue({
                session_id = "session-1",
                agent_id = "agent-1",
                request_id = "call-1",
            })
            local first = runtime:handle(request(capability), "worker-1", expected(), update)
            local repeated = runtime:handle(request(capability), "worker-1", expected(), update)

            test.eq(first.attention_context.revision, 1)
            test.eq(repeated.attention_context.revision, 1)
            test.eq(update_count(), 1)
        end)

        it("rejects a changed duplicate and a replay from another sender", function()
            local runtime, update, _, update_count = harness()
            local capability = runtime:issue({
                session_id = "session-1",
                agent_id = "agent-1",
                request_id = "call-1",
            })
            runtime:handle(request(capability), "worker-1", expected(), update)

            local changed = runtime:handle(request(capability, { enabled = false }), "worker-1", expected(), update)
            local wrong_sender = runtime:handle(request(capability), "worker-2", expected(), update)

            test.eq(changed.error, "ATTENTION_CONTEXT_REQUEST_CONFLICT")
            test.eq(wrong_sender.error, "ATTENTION_CONTEXT_REQUEST_CONFLICT")
            test.eq(update_count(), 1)
        end)

        it("rejects wrong Session, stale agent, expiry, and connection replacement", function()
            local runtime, update, set_now, update_count = harness()
            local capability = runtime:issue({
                session_id = "session-1",
                agent_id = "agent-1",
                request_id = "call-1",
            })
            test.eq(runtime:handle(request(capability), "worker-1", expected({ session_id = "other" }), update).error,
                "ATTENTION_CONTEXT_SESSION_STALE")
            test.eq(runtime:handle(request(capability), "worker-1", expected({ agent_id = "other" }), update).error,
                "ATTENTION_CONTEXT_AGENT_STALE")

            set_now(1030)
            test.eq(runtime:handle(request(capability), "worker-1", expected(), update).error,
                "ATTENTION_CONTEXT_AUTHORITY_STALE")

            local fresh = runtime:issue({
                session_id = "session-1",
                agent_id = "agent-1",
                request_id = "call-1",
            })
            runtime:set_connection("conn-2")
            test.eq(runtime:handle(request(fresh), "worker-1", expected(), update).error,
                "ATTENTION_CONTEXT_AUTHORITY_STALE")
            test.eq(update_count(), 0)
        end)
    end)
end

return test.run_cases(define_tests)
