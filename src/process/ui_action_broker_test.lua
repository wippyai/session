local test = require("test")
local ui_action_broker = require("ui_action_broker")

local function reply_topic(call_id)
    return "session_ui_action_result:" .. hash.sha256(call_id)
end

local function target(host_instance_id, suffix)
    return {
        snapshot_id = "snapshot-" .. suffix,
        target_id = "target-" .. suffix,
        host_instance_id = host_instance_id,
        mount_id = "mount-" .. suffix,
        generation = 1,
        path_digest = "sha256:" .. string.rep("a", 64),
        rect = { x = 1, y = 2, width = 30, height = 40 },
        label = "Target " .. suffix,
    }
end

local function harness(ttl_seconds, overrides): (any, {any}, {any}, {any}, any)
    local now = 1000
    local sequence = 0
    local sends: {any} = {}
    local monitors: {any} = {}
    local unmonitors: {any} = {}
    local broker: any = ui_action_broker.new({
        ttl_seconds = ttl_seconds,
        send = function(pid, topic, payload)
            sends[#sends + 1] = { pid = pid, topic = topic, payload = payload }
            if overrides and overrides.send then
                return overrides.send(pid, topic, payload)
            end
            return true, nil
        end,
        monitor = function(pid)
            monitors[#monitors + 1] = pid
            if overrides and overrides.monitor then
                return overrides.monitor(pid)
            end
            return true, nil
        end,
        unmonitor = function(pid)
            unmonitors[#unmonitors + 1] = pid
            if overrides and overrides.unmonitor then
                return overrides.unmonitor(pid)
            end
            return true, nil
        end,
        new_id = function()
            sequence = sequence + 1
            return "id-" .. sequence
        end,
        now = function()
            return now
        end,
        format_time = function(value)
            return "time-" .. value
        end,
        validate_prepared_file = overrides and overrides.validate_prepared_file or nil,
    })
    return broker, sends, monitors, unmonitors, function(value)
        now = value
    end
end

local function bind(broker: any, session_id, conn_pid, host_instance_id): any
    local runtime, err = broker:bind_turn({
        user_id = "user-1",
        session_id = session_id,
        session_pid = "session-pid-" .. session_id,
        ingress_pid = "user-hub-pid",
        conn_pid = conn_pid,
        host_instance_id = host_instance_id,
        agent_actions_enabled = true,
        request_id = "turn-" .. session_id,
    })
    test.is_nil(err)
    test.not_nil(runtime)
    return runtime
end

local function request(broker: any, runtime: any, waiter_pid, call_id, target_ref)
    return broker:request(waiter_pid, {
        delivery_handle = runtime.delivery_handle,
        registry_id = "wippy.agent.tools:ui_action_confirm",
        call_id = call_id,
        reply_topic = reply_topic(call_id),
        session_id = runtime.session_id,
        host_instance_id = runtime.host_instance_id,
        args = { targets = { target_ref } },
    })
end

local function capture_request(broker: any, runtime: any, waiter_pid, call_id, target_ref)
    return broker:request(waiter_pid, {
        delivery_handle = runtime.delivery_handle,
        registry_id = "wippy.agent.tools:ui_action_capture_visual",
        call_id = call_id,
        reply_topic = reply_topic(call_id),
        session_id = runtime.session_id,
        host_instance_id = runtime.host_instance_id,
        args = {
            targets = { target_ref },
            capture = { scope = "target", format = "image/png" },
        },
    })
end

local function client_result(action, conn_pid, status)
    return conn_pid, action.session_id, {
        schema = "wippy.ui-action.v1",
        message_type = "result",
        result_id = "result-" .. action.action_id,
        in_reply_to_action_id = action.action_id,
        request_id = action.request_id,
        session_id = action.session_id,
        host_instance_id = action.host_instance_id,
        completed_at = "2026-09-04T12:00:00Z",
        status = status or "confirmed",
        selected_target = action.targets[1],
    }
end

local function define_tests()
    describe("Attention UI action broker", function()
        it("targets each authenticated connection directly without a user-hub frame", function()
            local broker, sends = harness()
            local first = bind(broker, "s1", "conn-1", "host-1")
            local second = bind(broker, "s2", "conn-2", "host-2")

            test.is_true(request(broker, first, "session-pid-s1", "call-1", target("host-1", "one")))
            test.is_true(request(broker, second, "session-pid-s2", "call-2", target("host-2", "two")))

            test.eq(#sends, 2)
            test.eq(sends[1].pid, "conn-1")
            test.eq(sends[2].pid, "conn-2")
            test.eq(sends[1].topic, "session_ui_action_request")
            test.eq(sends[2].topic, "session_ui_action_request")
            test.eq(sends[1].payload.session_id, "s1")
            test.eq(sends[2].payload.session_id, "s2")
            test.is_nil(sends[1].payload.delivery_handle)
            test.is_nil(sends[2].payload.delivery_handle)
        end)

        it("rejects spoofed connection and correlation fields", function()
            local broker, sends = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            request(broker, runtime, "session-pid-s1", "call-1", target("host-1", "one"))
            local action: any = broker.pending.s1
            local _, session_id, result = client_result(action, "conn-1")

            test.is_false(broker:result("spoofed-hub-pid", "conn-1", session_id, result))
            test.is_false(broker:result("user-hub-pid", "conn-2", session_id, result))
            result.host_instance_id = "host-2"
            test.is_false(broker:result("user-hub-pid", "conn-1", session_id, result))
            test.eq(#sends, 1)
            test.not_nil(broker.pending.s1)
        end)

        it("rejects selected targets with altered geometry or labels", function()
            local broker, sends = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            request(broker, runtime, "session-pid-s1", "call-1", target("host-1", "one"))
            local action: any = broker.pending.s1
            local conn_pid, session_id, result = client_result(action, "conn-1")

            result.selected_target = target("host-1", "one")
            result.selected_target.rect.x = result.selected_target.rect.x + 1
            local accepted, err = broker:result("user-hub-pid", conn_pid, session_id, result)
            test.is_false(accepted)
            test.eq(err, "selected target was not offered")
            test.not_nil(broker.pending.s1)

            result.selected_target = target("host-1", "one")
            result.selected_target.label = "Altered label"
            accepted, err = broker:result("user-hub-pid", conn_pid, session_id, result)
            test.is_false(accepted)
            test.eq(err, "selected target was not offered")
            test.not_nil(broker.pending.s1)

            result.selected_target = target("host-1", "one")
            test.is_true(broker:result("user-hub-pid", conn_pid, session_id, result))
            test.eq(#sends, 2)
            test.eq(sends[2].payload.selected_target.label, "Target one")
        end)

        it("routes a capability-bound request to its tool worker and rejects mismatched scope", function()
            local broker, sends = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")

            test.is_true(request(broker, runtime, "tool-worker-pid", "call-1", target("host-1", "one")))
            local action: any = broker.pending.s1
            test.eq(action.reply_topic, reply_topic("call-1"))
            local conn_pid, session_id, result = client_result(action, "conn-1")
            test.is_true(broker:result("user-hub-pid", conn_pid, session_id, result))
            test.eq(sends[2].pid, "tool-worker-pid")
            test.eq(sends[2].topic, reply_topic("call-1"))

            local accepted, err = broker:request("unrelated-pid", {
                delivery_handle = runtime.delivery_handle,
                registry_id = "wippy.agent.tools:ui_action_confirm",
                call_id = "call-2",
                reply_topic = reply_topic("call-2"),
                session_id = "other-session",
                host_instance_id = runtime.host_instance_id,
                args = { targets = { target("host-1", "one") } },
            })

            test.is_false(accepted)
            test.eq(err, "unauthorized tool request")
            test.eq(#sends, 3)
            test.eq(sends[3].pid, "unrelated-pid")
            test.eq(sends[3].topic, reply_topic("call-2"))
            test.eq(sends[3].payload.request_id, "call-2")
            test.eq(sends[3].payload.session_id, "other-session")
            test.eq(sends[3].payload.status, "unavailable")
            test.is_nil(broker.pending.s1)
        end)

        it("rejects missing or caller-selected reply topics before routing", function()
            local broker, sends, monitors = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            local base_request = {
                delivery_handle = runtime.delivery_handle,
                registry_id = "wippy.agent.tools:ui_action_confirm",
                call_id = "call-secure",
                session_id = runtime.session_id,
                host_instance_id = runtime.host_instance_id,
                args = { targets = { target("host-1", "one") } },
            }

            local accepted, err = broker:request("tool-worker-pid", base_request)
            test.is_false(accepted)
            test.eq(err, "unauthorized tool request")

            base_request.reply_topic = reply_topic("another-call")
            accepted, err = broker:request("tool-worker-pid", base_request)
            test.is_false(accepted)
            test.eq(err, "unauthorized tool request")

            base_request.reply_topic = "session_ui_action_result"
            accepted, err = broker:request("tool-worker-pid", base_request)
            test.is_false(accepted)
            test.eq(err, "unauthorized tool request")
            test.eq(#sends, 0)
            test.eq(#monitors, 1)
            test.is_nil(broker.pending.s1)
        end)

        it("returns an immediate terminal result for unknown and stale capabilities", function()
            local broker, sends = harness()

            local accepted, err = broker:request("tool-worker-pid", {
                delivery_handle = "unknown-capability",
                registry_id = "wippy.agent.tools:ui_action_confirm",
                call_id = "call-unknown",
                reply_topic = reply_topic("call-unknown"),
                session_id = "s-unknown",
                host_instance_id = "host-unknown",
                args = { targets = { target("host-unknown", "one") } },
            })
            test.is_false(accepted)
            test.eq(err, "ui action route is unavailable")
            test.eq(#sends, 1)
            test.eq(sends[1].pid, "tool-worker-pid")
            test.eq(sends[1].topic, reply_topic("call-unknown"))
            test.eq(sends[1].payload.request_id, "call-unknown")
            test.eq(sends[1].payload.session_id, "s-unknown")
            test.eq(sends[1].payload.host_instance_id, "host-unknown")
            test.eq(sends[1].payload.status, "unavailable")

            local runtime = bind(broker, "s1", "conn-1", "host-1")
            broker:cancel_session("s1", "unavailable", "route retired")
            accepted, err = request(broker, runtime, "stale-worker-pid", "call-stale", target("host-1", "two"))
            test.is_false(accepted)
            test.eq(err, "ui action route is unavailable")
            test.eq(#sends, 2)
            test.eq(sends[2].pid, "stale-worker-pid")
            test.eq(sends[2].payload.request_id, "call-stale")
            test.eq(sends[2].payload.status, "unavailable")
        end)

        it("expires pending actions at or before the 120 second limit", function()
            local broker, sends, _, _, set_now = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            request(broker, runtime, "session-pid-s1", "call-1", target("host-1", "one"))
            local action: any = broker.pending.s1
            test.eq(action.expires_at, 1120)

            set_now(1120)
            broker:expire()
            test.is_nil(broker.pending.s1)
            test.eq(#sends, 2)
            test.eq(sends[2].pid, "session-pid-s1")
            test.eq(sends[2].payload.status, "expired")
        end)

        it("supports the bounded two-second E2E timeout override", function()
            local broker, sends, _, _, set_now = harness(2)
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            request(broker, runtime, "session-pid-s1", "call-1", target("host-1", "one"))
            local action: any = broker.pending.s1
            test.eq(action.expires_at, 1002)

            set_now(1002)
            broker:expire()
            test.is_nil(broker.pending.s1)
            test.eq(sends[2].payload.status, "expired")

            test.is_false(pcall(function() harness(0) end))
            test.is_false(pcall(function() harness(121) end))
            test.is_false(pcall(function() harness(1.5) end))
        end)

        it("recovers request capacity when a late result removes an expired completion", function()
            local broker, sends, _, _, set_now = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            request(broker, runtime, "session-pid-s1", "call-1", target("host-1", "one"))
            local action: any = broker.pending.s1
            set_now(1120)
            broker:expire()
            test.eq(broker.request_count, 1)
            set_now(1240)
            local _, _, result = client_result(action, "conn-1")
            test.is_false(broker:result("user-hub-pid", "conn-1", "s1", result))
            test.eq(broker.request_count, 0)
            test.is_nil(broker.completed[action.action_id])
            test.eq(#sends, 2)
        end)

        it("allows only one pending action per session and rejects the second immediately", function()
            local broker, sends = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            test.is_true(request(broker, runtime, "session-pid-s1", "call-1", target("host-1", "one")))
            test.is_false(request(broker, runtime, "session-pid-s1", "call-2", target("host-1", "two")))

            test.not_nil(broker.pending.s1)
            test.eq(broker.pending.s1.waiter_pid, "session-pid-s1")
            test.eq(#sends, 2)
            test.eq(sends[2].pid, "session-pid-s1")
            test.eq(sends[2].payload.status, "unavailable")
        end)

        it("replays a cached validation rejection for the same request", function()
            local broker, sends = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            local invalid = {
                delivery_handle = runtime.delivery_handle,
                registry_id = "wippy.agent.tools:ui_action_confirm",
                call_id = "call-invalid",
                reply_topic = reply_topic("call-invalid"),
                session_id = runtime.session_id,
                host_instance_id = runtime.host_instance_id,
                args = { targets = { { bad = true } } },
            }
            test.is_false(broker:request("tool-worker-pid", invalid))
            test.is_true(broker:request("replacement-worker-pid", invalid))
            test.eq(#sends, 2)
            test.eq(sends[1].payload.reason, "target reference is invalid")
            test.eq(sends[2].payload.reason, "target reference is invalid")
        end)

        it("does not cache or send a rejection when request capacity is full", function()
            local broker, sends = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            broker.request_count = 1024
            local accepted, err = broker:request("tool-worker-pid", {
                delivery_handle = runtime.delivery_handle,
                registry_id = "wippy.agent.tools:ui_action_confirm",
                call_id = "call-capacity",
                reply_topic = reply_topic("call-capacity"),
                session_id = runtime.session_id,
                host_instance_id = runtime.host_instance_id,
                args = { targets = { { bad = true } } },
            })
            test.is_false(accepted)
            test.eq(err, "UI action request capacity reached")
            test.eq(broker.request_count, 1024)
            test.eq(#sends, 0)
        end)

        it("does not reuse a call ID when the request fingerprint changes", function()
            local broker, sends = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            request(broker, runtime, "tool-worker-pid", "call-reuse", target("host-1", "one"))
            local accepted, err = request(broker, runtime, "replacement-worker-pid", "call-reuse", target("host-1", "two"))
            test.is_false(accepted)
            test.eq(err, "UI action request correlation mismatch")
            test.eq(#sends, 1)
        end)

        it("allows the same call ID in a later delivery handle", function()
            local broker, sends = harness()
            local first = bind(broker, "s1", "conn-1", "host-1")
            request(broker, first, "tool-worker-pid", "call-turn", target("host-1", "one"))
            local second = bind(broker, "s1", "conn-2", "host-1")
            test.is_true(request(broker, second, "replacement-worker-pid", "call-turn", target("host-1", "one")))
            test.eq(#sends, 3)
            test.eq(sends[3].pid, "conn-2")
        end)

        it("accepts only the first terminal result", function()
            local broker, sends = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            request(broker, runtime, "session-pid-s1", "call-1", target("host-1", "one"))
            local action: any = broker.pending.s1
            local conn_pid, session_id, result = client_result(action, "conn-1")

            test.is_true(broker:result("user-hub-pid", conn_pid, session_id, result))
            local accepted, duplicate = broker:result("user-hub-pid", conn_pid, session_id, result)
            test.is_true(accepted)
            test.eq(duplicate, "duplicate")
            test.eq(#sends, 2)
            test.eq(sends[2].pid, "session-pid-s1")
            test.eq(sends[2].payload.status, "confirmed")
        end)

        it("validates a prepared visual before returning it to the tool worker", function()
            local validated_file, validated_actor, validated_session
            local broker, sends = harness(nil, {
                validate_prepared_file = function(prepared_file, actor_id, session_id)
                    validated_file = prepared_file
                    validated_actor = actor_id
                    validated_session = session_id
                    return true, nil
                end,
            })
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            test.is_true(capture_request(broker, runtime, "tool-worker-pid", "call-visual", target("host-1", "one")))
            local action: any = broker.pending.s1
            local result = {
                schema = "wippy.ui-action.v1",
                message_type = "result",
                result_id = "result-" .. action.action_id,
                in_reply_to_action_id = action.action_id,
                request_id = action.request_id,
                session_id = action.session_id,
                host_instance_id = action.host_instance_id,
                completed_at = "2026-09-04T12:00:00Z",
                status = "prepared",
                prepared_file = {
                    uuid = "file-1",
                    name = "attention-target.png",
                    mime_type = "image/png",
                    byte_size = 128,
                    sha256 = "sha256:" .. string.rep("b", 64),
                    scope = "target",
                },
            }

            test.is_true(broker:result("user-hub-pid", "conn-1", "s1", result))
            test.eq(validated_file.uuid, "file-1")
            test.eq(validated_actor, "user-1")
            test.eq(validated_session, "s1")
            test.eq(#sends, 2)
            test.eq(sends[2].pid, "tool-worker-pid")
            test.eq(sends[2].topic, reply_topic("call-visual"))
            test.eq(sends[2].payload.status, "prepared")
            test.eq(sends[2].payload.prepared_file.sha256, result.prepared_file.sha256)
        end)

        it("returns one terminal error when prepared visual integrity validation fails", function()
            local broker, sends = harness(nil, {
                validate_prepared_file = function()
                    return false, "file hash mismatch"
                end,
            })
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            test.is_true(capture_request(broker, runtime, "tool-worker-pid", "call-visual", target("host-1", "one")))
            local action: any = broker.pending.s1
            local result = {
                schema = "wippy.ui-action.v1",
                message_type = "result",
                result_id = "result-" .. action.action_id,
                in_reply_to_action_id = action.action_id,
                request_id = action.request_id,
                session_id = action.session_id,
                host_instance_id = action.host_instance_id,
                completed_at = "2026-09-04T12:00:00Z",
                status = "prepared",
                prepared_file = {
                    uuid = "file-1",
                    name = "attention-target.png",
                    mime_type = "image/png",
                    byte_size = 128,
                    sha256 = "sha256:" .. string.rep("b", 64),
                    scope = "target",
                },
            }

            local accepted, err = broker:result("user-hub-pid", "conn-1", "s1", result)
            test.is_false(accepted)
            test.eq(err, "file hash mismatch")
            test.is_nil(broker.pending.s1)
            test.eq(#sends, 2)
            test.eq(sends[2].payload.status, "error")
            test.eq(sends[2].payload.reason, "Prepared visual failed integrity validation")

            local duplicate, duplicate_status = broker:result("user-hub-pid", "conn-1", "s1", result)
            test.is_true(duplicate)
            test.eq(duplicate_status, "duplicate")
            test.eq(#sends, 2)
        end)

        it("returns one terminal error when prepared visual validation is unavailable", function()
            local broker, sends = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            test.is_true(capture_request(broker, runtime, "tool-worker-pid", "call-visual", target("host-1", "one")))
            local action: any = broker.pending.s1
            local result = {
                schema = "wippy.ui-action.v1",
                message_type = "result",
                result_id = "result-" .. action.action_id,
                in_reply_to_action_id = action.action_id,
                request_id = action.request_id,
                session_id = action.session_id,
                host_instance_id = action.host_instance_id,
                completed_at = "2026-09-04T12:00:00Z",
                status = "prepared",
                prepared_file = {
                    uuid = "file-1",
                    name = "attention-target.png",
                    mime_type = "image/png",
                    byte_size = 128,
                    sha256 = "sha256:" .. string.rep("b", 64),
                    scope = "target",
                },
            }

            local accepted, err = broker:result("user-hub-pid", "conn-1", "s1", result)
            test.is_false(accepted)
            test.eq(err, "prepared visual validation is unavailable")
            test.is_nil(broker.pending.s1)
            test.eq(#sends, 2)
            test.eq(sends[2].payload.status, "error")
            test.eq(sends[2].payload.reason, "Prepared visual validation is unavailable")
        end)

        it("authenticates completed-action correlation before accepting a replay", function()
            local broker, sends = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            request(broker, runtime, "session-pid-s1", "call-1", target("host-1", "one"))
            local action: any = broker.pending.s1
            local conn_pid, session_id, result = client_result(action, "conn-1")

            test.is_true(broker:result("user-hub-pid", conn_pid, session_id, result))
            test.is_false(broker:result("spoofed-hub-pid", conn_pid, session_id, result))
            test.is_false(broker:result("user-hub-pid", "conn-2", session_id, result))
            test.is_false(broker:result("user-hub-pid", conn_pid, "s2", result))
            result.request_id = "spoofed-call"
            test.is_false(broker:result("user-hub-pid", conn_pid, session_id, result))
            test.eq(#sends, 2)
        end)

        it("propagates connection and tool-worker monitor failures", function()
            local broker = harness(nil, {
                monitor = function(pid)
                    if pid == "conn-1" then
                        return false, "connection monitor unavailable"
                    end
                    return true, nil
                end,
            })
            local runtime, err = broker:bind_turn({
                user_id = "user-1",
                session_id = "s1",
                session_pid = "session-pid-s1",
                ingress_pid = "user-hub-pid",
                conn_pid = "conn-1",
                host_instance_id = "host-1",
                agent_actions_enabled = true,
            })
            test.is_nil(runtime)
            test.eq(err, "connection monitor unavailable")
            test.is_nil(broker.bindings.s1)

            local worker_broker, sends = harness(nil, {
                monitor = function(pid)
                    if pid == "tool-worker-pid" then
                        return false, "worker monitor unavailable"
                    end
                    return true, nil
                end,
            })
            local bound = bind(worker_broker, "s2", "conn-2", "host-2")
            local accepted, request_err = request(
                worker_broker,
                bound,
                "tool-worker-pid",
                "call-2",
                target("host-2", "two")
            )
            test.is_false(accepted)
            test.eq(request_err, "worker monitor unavailable")
            test.is_nil(worker_broker.pending.s2)
            test.eq(#sends, 1)
            test.eq(sends[1].pid, "tool-worker-pid")
            test.eq(sends[1].payload.status, "unavailable")
        end)

        it("propagates Host request delivery failure and releases the worker monitor", function()
            local broker, sends, _, unmonitors = harness(nil, {
                send = function(_, topic)
                    if topic == "session_ui_action_request" then
                        return false, "Host connection unavailable"
                    end
                    return true, nil
                end,
            })
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            local accepted, err = request(
                broker,
                runtime,
                "tool-worker-pid",
                "call-1",
                target("host-1", "one")
            )

            test.is_false(accepted)
            test.eq(err, "Host connection unavailable")
            test.is_nil(broker.pending.s1)
            test.eq(#sends, 2)
            test.eq(sends[1].pid, "conn-1")
            test.eq(sends[2].pid, "tool-worker-pid")
            test.eq(sends[2].payload.status, "unavailable")
            test.eq(unmonitors[#unmonitors], "tool-worker-pid")
        end)

        it("cancels only the action bound to a disconnected connection", function()
            local broker, sends = harness()
            local first = bind(broker, "s1", "conn-1", "host-1")
            local second = bind(broker, "s2", "conn-2", "host-2")
            request(broker, first, "session-pid-s1", "call-1", target("host-1", "one"))
            request(broker, second, "session-pid-s2", "call-2", target("host-2", "two"))

            broker:handle_exit("conn-1")
            test.is_nil(broker.pending.s1)
            test.not_nil(broker.pending.s2)
            test.eq(sends[3].pid, "session-pid-s1")
            test.eq(sends[3].payload.status, "disconnected")
        end)

        it("invalidates a prior route when the next turn disables agent actions", function()
            local broker = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            local disabled, err = broker:bind_turn({
                user_id = "user-1",
                session_id = "s1",
                session_pid = "session-pid-s1",
                ingress_pid = "user-hub-pid",
                conn_pid = "conn-1",
                host_instance_id = "host-1",
                agent_actions_enabled = false,
            })

            test.is_nil(disabled)
            test.not_nil(err)
            test.is_nil(broker.bindings.s1)
            test.is_false(request(broker, runtime, "waiter-1", "call-1", target("host-1", "one")))
        end)

        it("keeps the prior route when the next turn has malformed identity fields", function()
            local broker = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            local replacement, err = broker:bind_turn({
                user_id = "user-1",
                session_id = "s1",
                session_pid = "session-pid-s1",
                ingress_pid = "user-hub-pid",
                conn_pid = "conn-2",
                host_instance_id = "host-2",
                agent_actions_enabled = "false",
            })

            test.is_nil(replacement)
            test.not_nil(err)
            test.eq(broker.bindings.s1.delivery_handle, runtime.delivery_handle)
            test.is_true(request(broker, runtime, "waiter-1", "call-1", target("host-1", "one")))
        end)

        it("does not let a different user cancel the prior route", function()
            local broker = harness()
            local runtime = bind(broker, "s1", "conn-1", "host-1")
            local replacement, err = broker:bind_turn({
                user_id = "user-2",
                session_id = "s1",
                session_pid = "session-pid-s1-new",
                ingress_pid = "user-hub-pid-new",
                conn_pid = "conn-2",
                host_instance_id = "host-2",
                agent_actions_enabled = false,
            })

            test.is_nil(replacement)
            test.not_nil(err)
            test.eq(broker.bindings.s1.delivery_handle, runtime.delivery_handle)
            test.is_true(request(broker, runtime, "waiter-1", "call-1", target("host-1", "one")))
        end)
    end)
end

return test.run_cases(define_tests)
