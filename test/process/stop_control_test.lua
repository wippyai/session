local test = require("test")
local session = require("session")

local function fixture(write_error, rollback_error)
    local events = {}
    local ctx = {
        status = "running",
        stop_requested = false,
        input_policy_revision = 0,
        interaction = { can_send = true, revision = 0 },
        config = {},
        turn_state = {
            active = true,
            input_policy = { while_running = "steer" },
        },
        writer = {
            update_meta = function()
                events[#events + 1] = "write"
                if write_error then return nil, write_error end
                return true
            end,
            stop_with_input_rollback = function(_, updates)
                events[#events + 1] = "stop-write"
                if rollback_error then return nil, rollback_error end
                for _, update in ipairs(updates) do update.restored = true end
                return true
            end,
        },
        upstream = {
            update_session = function() events[#events + 1] = "session" end,
        },
    }
    local commands = {
        command_success = function(_, request_id)
            events[#events + 1] = "ack:" .. request_id
        end,
        command_error = function(_, request_id, code)
            events[#events + 1] = "error:" .. request_id .. ":" .. code
        end,
        session_error = function(_, code)
            events[#events + 1] = "session-error:" .. code
        end,
    }
    return ctx, commands, events
end

local function define_tests()
    describe("Stop persistence boundary", function()
        it("acknowledges only after Stop and interaction are committed", function()
            local ctx, commands, events = fixture()

            local ok, err = session._commit_stop(ctx, commands, "stop-1")

            test.is_nil(err)
            test.is_true(ok)
            test.eq(events[1], "write")
            test.eq(events[2], "session")
            test.eq(events[3], "ack:stop-1")
            test.is_true(ctx.stop_requested)
            test.is_nil(ctx.turn_state.input_policy)
            test.is_false(ctx.interaction.can_send)
        end)

        it("restores the active turn when Stop persistence fails", function()
            local ctx, commands, events = fixture("disk failure")

            local ok, err = session._commit_stop(ctx, commands, "stop-2")

            test.is_nil(ok)
            test.eq(err, "disk failure")
            test.eq(events[1], "write")
            test.eq(events[2], "error:stop-2:STORAGE_ERROR")
            test.is_false(ctx.stop_requested)
            test.eq(ctx.turn_state.input_policy.while_running, "steer")
            test.is_true(ctx.interaction.can_send)
        end)

        it("treats repeated Stop as idempotent without another write", function()
            local ctx, commands, events = fixture()
            ctx.stop_requested = true

            local ok, err = session._commit_stop(ctx, commands, "stop-repeat")

            test.is_nil(err)
            test.is_true(ok)
            test.eq(#events, 1)
            test.eq(events[1], "ack:stop-repeat")
        end)

        it("commits an in-flight batch rollback and Stop as one boundary", function()
            local ctx, commands, events = fixture()
            local batch = { { message_id = "pending-1", metadata = { input = { state = "applied" } } } }
            ctx.input_apply_batch = batch

            local ok, err = session._commit_stop(ctx, commands, "stop-race")

            test.is_nil(err)
            test.is_true(ok)
            test.eq(events[1], "stop-write")
            test.eq(events[2], "session")
            test.eq(events[3], "ack:stop-race")
            test.is_true((batch[1] :: any).restored)
            test.is_true(ctx.stop_requested)
        end)

        it("leaves the turn active when the atomic Stop transaction fails", function()
            local ctx, commands, events = fixture(nil, "rollback failure")
            ctx.input_apply_batch = {
                { message_id = "pending-1", metadata = { input = { state = "applied" } } },
            }

            local ok, err = session._commit_stop(ctx, commands, "stop-race-failed")

            test.is_nil(ok)
            test.eq(err, "rollback failure")
            test.eq(events[1], "stop-write")
            test.eq(events[2], "error:stop-race-failed:STORAGE_ERROR")
            test.is_false(ctx.stop_requested)
            test.eq(ctx.turn_state.input_policy.while_running, "steer")
        end)

        it("rejects an external Stop for an idle session without writing", function()
            local ctx, commands, events = fixture()
            ctx.status = "idle"
            ctx.turn_state.active = false

            local ok, err = session._commit_stop(ctx, commands, "stop-idle")

            test.is_nil(ok)
            test.eq(err, "Session is not running")
            test.eq(#events, 1)
            test.eq(events[1], "error:stop-idle:SESSION_NOT_RUNNING")
        end)
    end)
end

return test.run_cases(define_tests)
