local session = require("session")
local llm = require("llm")
local time = require("time")
local store = require("store")
local approval_gate = require("approval_gate")
local activation = require("activation")
local approval_repo = require("approval_repo")
local approval_commands = require("approval_commands")
local approval_events = require("approval_events")
local upstream = require("upstream")
local message_handlers = require("message_handlers")
local approval_recovery = require("approval_recovery")

-- The Session process of the tool approval runtime suites: session.run with
-- the scripted model (approval_fixtures.generate) and, from
-- args.user_metadata (the plugin passes its own; a direct spawn passes one):
--   grace_seconds  approval_gate.GRACE_SECONDS (the 120 s grace period seam)
--   clock          activation._now reads the store key clock:<session_id>
--                  as an offset in seconds (the deadline seam)
--   inject         one point where the process stops once and reports
--                  `approval:paused` { point, session_id, pid } to the test,
--                  until the test sends `approval:resume` to that pid (30 s at
--                  most):
--     commit       the decision transaction committed, nothing published
--     projection   the decided record's event published, no reply yet
--     ack          the command reply sent, the gate not woken yet
--     wake         the gate woke to every request decided, before the
--                  release transaction
--     dispatch     the release committed, before caller:execute
--   or one fault of the gate's wait:
--     hang         the wait ignores every wake for 60 s (a stuck turn)
--     fail_wait    the wait fails at its first wake (a failed tool round)
--   fail_live_settlement  while a tool round (process_tools) runs, its own
--                  settlement of a failed round fails: the batch closure
--                  (approval_recovery.close_failed_batch) and the call row
--                  writes (approval_recovery.write_call). The batch and the
--                  rows stay open for command_bus:fail, whose recovery
--                  writes normally once the round returned.

local STATE = "app.runtime:approval_state"

local function pack(...)
    return { n = select("#", ...), ... }
end

local function run(args: any)
    local fixture = args.user_metadata or {}
    local session_id = args.session_id
    local storage = assert(store.get(STATE))
    local reply = storage:get("reply:" .. tostring(session_id))

    llm._models = {
        get_by_name = function(name)
            return { name = name, providers = { { id = "app.runtime:approval_provider", provider_model = name,
                context = { fixture = { session_id = session_id } } } } }
        end,
    }
    if fixture.grace_seconds then approval_gate.GRACE_SECONDS = fixture.grace_seconds end
    if fixture.fail_live_settlement then
        local in_round = false
        local process_tools = message_handlers.process_tools
        message_handlers.process_tools = function(...)
            in_round = true
            local result = pack(process_tools(...))
            in_round = false
            return table.unpack(result, 1, result.n)
        end
        local close_failed_batch = approval_recovery.close_failed_batch
        approval_recovery.close_failed_batch = function(...)
            if in_round then return nil, "injected batch closure failure" end
            return close_failed_batch(...)
        end
        local write_call = approval_recovery.write_call
        approval_recovery.write_call = function(...)
            if in_round then return nil, "injected call row failure" end
            return write_call(...)
        end
    end
    if fixture.clock then
        activation._now = function()
            local offset = storage:get("clock:" .. tostring(session_id))
            return time.now():unix() + (tonumber(offset) or 0)
        end
    end

    local fired = false
    local function pause(point: string)
        fired = true
        -- Listen before reporting, so the resume never reaches the inbox.
        local resume = process.listen("approval:resume")
        process.send(reply, "approval:paused", { point = point, session_id = session_id, pid = process.pid() })
        local selected = channel.select({ resume:case_receive(), time.after("30s"):case_receive() })
        process.unlisten(resume)
        if selected.channel ~= resume then error("the injected pause at " .. point .. " was never resumed") end
    end

    -- Every pass of the gate's wait that finds no closure reports
    -- `approval:parked` { session_id }. While a request is still pending, the
    -- gate's next step is to wait on its wake-up channel with no I/O in
    -- between, so a signal the test sends after this report reaches a waiting
    -- gate (without the clock seam, whose store read could yield). Only the
    -- gate's wait reads the closure outside a transaction (conn nil).
    local close_reason = approval_repo.close_reason
    approval_repo.close_reason = function(conn, ...)
        local reason, err = close_reason(conn, ...)
        if conn == nil and reason == nil and err == nil and reply then
            process.send(reply, "approval:parked", { session_id = session_id })
        end
        return reason, err
    end

    -- Every read of the live approval UI surfaces reports `approval:live`
    -- { session_id, live }. While the gate waits, only its wait reads them,
    -- and a read of 0 starts the grace period.
    local live_surfaces = activation.live_surfaces
    activation.live_surfaces = function(ctx)
        local live = live_surfaces(ctx)
        if reply then process.send(reply, "approval:live", { session_id = session_id, live = live }) end
        return live
    end

    local point = fixture.inject
    -- The pause points fire only once the test set armed:<session_id>, so
    -- a setup decision before it passes untouched.
    local function armed(): boolean
        return not fired and storage:get("armed:" .. tostring(session_id)) == true
    end
    local in_decision = false
    if point == "commit" or point == "projection" or point == "ack" then
        local handle = approval_commands.handle
        approval_commands.handle = function(context, from, payload)
            in_decision = armed() and type(payload) == "table" and payload.command == "tool_approval"
            local result = pack(handle(context, from, payload))
            in_decision = false
            return table.unpack(result, 1, result.n)
        end
    end
    if point == "commit" then
        local transact = approval_repo.transact
        approval_repo.transact = function(...)
            local result = pack(transact(...))
            if in_decision and not fired and result[1] then pause(point) end
            return table.unpack(result, 1, result.n)
        end
    elseif point == "projection" then
        local publish = approval_events.publish_record
        approval_events.publish_record = function(...)
            publish(...)
            if in_decision and not fired then pause(point) end
        end
    elseif point == "ack" then
        local command_success = upstream.command_success
        upstream.command_success = function(...)
            command_success(...)
            if in_decision and not fired then pause(point) end
        end
    elseif point == "wake" then
        local wait = approval_gate._wait
        approval_gate._wait = function(ctx, gate_run, waiting)
            local outcome, err = wait(ctx, gate_run, waiting)
            if armed() and type(outcome) == "table" and outcome.release then pause(point) end
            return outcome, err
        end
    elseif point == "dispatch" then
        local gate = message_handlers._approval_gate
        message_handlers._approval_gate = function(ctx, op, env)
            local result, err = gate(ctx, op, env)
            if armed() and type(result) == "table" and next(result.released or {}) ~= nil then pause(point) end
            return result, err
        end
    elseif point == "hang" then
        approval_gate._wait = function()
            process.send(reply, "approval:paused", { point = point, session_id = session_id, pid = process.pid() })
            time.sleep("60s")
            return nil, "the injected hang ended"
        end
    elseif point == "fail_wait" then
        approval_gate._wait = function(_ctx, _run, waiting)
            process.send(reply, "approval:paused", { point = point, session_id = session_id, pid = process.pid() })
            channel.select({ waiting.waiter.channel:case_receive(), time.after("30s"):case_receive() })
            return nil, "Injected approval wait failure"
        end
    end
    return session.run(args)
end

return { run = run }
