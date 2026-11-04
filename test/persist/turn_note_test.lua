local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local security = require("security")
local consts = require("consts")
local message_repo = require("message_repo")
local message_order = require("message_order")
local reader = require("reader")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local wait_for_boot = require("wait_for_boot")

local function define_tests()
    describe("turn note lookup", function()
        local context_id, session_id, owner
        before_all(function() wait_for_boot.run() end)
        before_each(function()
            local actor = security.actor()
            owner = actor and actor:id() or uuid.v7()
            context_id, session_id = uuid.v7(), uuid.v7()
            test.not_nil(context_repo.create(context_id, "primary", "turn note test"))
            test.not_nil(session_repo.create(session_id, owner, context_id, "Turn notes", "test"))
        end)
        after_each(function()
            session_repo.delete(session_id)
            context_repo.delete(context_id)
        end)

        local function add(kind, text, metadata)
            local id = uuid.v7()
            test.not_nil(message_repo.create(id, session_id, kind, text, metadata or {}))
            return id
        end

        local function add_note(source_id, text)
            return add(consts.MSG_TYPE.SYSTEM, text, { preserve_position = true, source_id = source_id,
                system_action = consts.SYSTEM_ACTIONS.TURN_CONTEXT })
        end

        -- A long turn: a checkpoint keeps one row of it, the rest is compacted away.
        local function long_turn(source_id)
            local rows = {}
            for index = 1, 400 do
                rows[index] = { message_id = uuid.v7(), type = consts.MSG_TYPE.FUNCTION, data = "{}", metadata = {
                    function_name = "t", status = "success", source_id = source_id,
                    result = { system_action = consts.SYSTEM_ACTIONS.TURN_CONTEXT, source_id = source_id } } }
            end
            assert(message_repo.create_batch(session_id, rows))
        end

        it("finds the note without reading the turn", function()
            local source = add(consts.MSG_TYPE.USER, "Question.")
            local note = add_note(source, "The current date and time is Monday.")
            long_turn(source)
            add(consts.MSG_TYPE.SYSTEM, "Host record.", { source_id = source, system_action = "turn_failed" })
            local other_source = add(consts.MSG_TYPE.USER, "Later.")
            add_note(other_source, "The current date and time is Tuesday.")

            local list_after = message_repo.list_after_message
            local windows = 0
            message_repo.list_after_message = function(...)
                windows = windows + 1
                return list_after(...)
            end
            local found, err = assert(reader.open(session_id)):get_turn_note(source)
            message_repo.list_after_message = list_after

            test.is_nil(err)
            test.eq(found.message_id, note)
            test.eq(found.data, "The current date and time is Monday.")
            test.is_true(found.metadata.preserve_position)
            test.eq(windows, 0, "the lookup does not read a window of rows")
            local rows = assert(message_repo.list_turn_notes(session_id, source))
            test.eq(#rows, 1, "only the note is loaded out of 400 rows of the turn")
        end)

        it("returns nothing without a note", function()
            local source = add(consts.MSG_TYPE.USER, "Question.")
            long_turn(source)
            local found, err = assert(reader.open(session_id)):get_turn_note(source)
            test.is_nil(err)
            test.is_nil(found)
            test.eq(#assert(message_repo.list_turn_notes(session_id, source)), 0)
        end)

        it("returns the first note of a turn when a retry stored another", function()
            local source = add(consts.MSG_TYPE.USER, "Question.")
            local first = add_note(source, "First render.")
            add_note(source, "Second render.")
            local found = assert(assert(reader.open(session_id)):get_turn_note(source))
            test.eq(found.message_id, first)
        end)

        it("reaches the session through its index", function()
            local db = assert(sql.get(consts.get_db_resource()))
            local statement = "SELECT message_id, data, metadata FROM messages WHERE session_id = '" .. session_id
                .. "' AND type = 'system' AND metadata LIKE '%\"turn_context\"%' AND metadata LIKE '%x%' ORDER BY "
                .. message_order.date(db:type()) .. " ASC, message_id ASC"
            local plan
            if db:type() == sql.type.POSTGRES then
                local tx = assert(db:begin())
                assert(tx:execute("SET LOCAL enable_seqscan = off"))
                plan = assert(tx:query("EXPLAIN " .. statement))
                tx:rollback()
            else
                plan = assert(db:query("EXPLAIN QUERY PLAN " .. statement))
            end
            db:release()
            test.contains(json.encode(plan), "idx_messages_")
            test.is_nil((json.encode(plan):find("SCAN messages", 1, true)))
        end)
    end)
end

return test.run_cases(define_tests)
