local contract = require("contract")
local consts = require("consts")
local context_repo = require("context_repo")
local json = require("json")
local message_repo = require("message_repo")
local security = require("security")
local session_repo = require("session_repo")
local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local wait_for_boot = require("wait_for_boot")

-- The agent's prompt is rebuilt on every step from the messages recorded since the
-- current checkpoint (prompt_builder.from_session -> reader:messages():from_checkpoint():all()).
-- Whatever bound that query applies, the NEWEST rows must survive it: the last tool result
-- is the only feedback the model gets about the action it just took. A window that keeps
-- the oldest rows and drops the newest freezes the conversation: every step sees the same
-- prompt, no tool result ever reaches the model, and it repeats the last visible
-- instruction indefinitely (observed 2026-09-21: ~5,100 identical pack_document calls
-- over 10.5 hours, prompt_tokens constant from the 250th message after the checkpoint on).
--
-- The cases below seed one checkpoint anchor and then more tool call/result pairs than the
-- 250-row page message_repo.list_after_message used to apply by default, and require the
-- newest result to be visible: directly through the repository (with and without an
-- explicit limit) and through the prompt the run-context binding builds with the
-- since_checkpoint selector (the same query and the same prompt_builder.build that
-- agent_step uses).

local CONTRACT_ID = "wippy.agent:run_context"
local BINDING_ID = "wippy.session.run_context:binding"
local TEST_ACTOR_ID = "session-prompt-window-test@wippy.local"

-- Pairs of (assistant tool call, tool result) seeded after the anchor. 150 pairs = 300 rows,
-- comfortably past the 250-row page that used to be applied by default.
local TOOL_ROUNDS = 150
local NEWEST_MARKER = "NEWEST_TOOL_RESULT_MUST_BE_VISIBLE"

local test_data = {
    session_id = uuid.v7(),
    context_id = uuid.v7(),
    anchor_id = uuid.v7(),
    newest_id = nil :: string?,
    seeded = 0,
}

local function cleanup()
    local db_resource = consts.get_db_resource()
    local db, err = sql.get(db_resource)
    if err then
        return
    end

    local tx, tx_err = db:begin()
    if tx_err then
        db:release()
        return
    end

    tx:execute("DELETE FROM messages WHERE session_id = $1", { test_data.session_id })
    tx:execute("DELETE FROM session_contexts WHERE session_id = $1", { test_data.session_id })
    tx:execute("DELETE FROM sessions WHERE session_id = $1", { test_data.session_id })
    tx:execute("DELETE FROM contexts WHERE context_id = $1", { test_data.context_id })

    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback()
    end
    db:release()
end

local function open_binding()
    local def, def_err = contract.get(CONTRACT_ID)
    test.is_nil(def_err, "contract.get: " .. tostring(def_err))
    test.not_nil(def)

    local actor = security.new_actor(TEST_ACTOR_ID, { source = "prompt_window_test" })
    local scope, scope_err = security.named_scope("app:test_group")
    test.is_nil(scope_err, "security.named_scope: " .. tostring(scope_err))
    test.not_nil(scope)

    local instance, open_err = def
        :with_actor(actor)
        :with_scope(scope)
        :open(BINDING_ID)
    test.is_nil(open_err, "contract.open: " .. tostring(open_err))
    test.not_nil(instance)
    return instance
end

local function create_message(message_id: string, msg_type: string, data: string, metadata: any): any
    local created, err = message_repo.create(message_id, test_data.session_id, msg_type, data, metadata)
    if err then
        error("seed message failed: " .. tostring(err))
    end
    test_data.seeded = test_data.seeded + 1
    return created
end

local function seed_session()
    wait_for_boot.run()
    cleanup()

    -- The anchor is the message the last checkpoint was created at; the primary context
    -- points at it exactly the way session_handlers.create_checkpoint records it.
    local context_json, encode_err = json.encode({
        [consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID] = test_data.anchor_id
    })
    test.is_nil(encode_err)

    local _, context_err = context_repo.create(test_data.context_id, "primary", context_json)
    test.is_nil(context_err, "context create: " .. tostring(context_err))

    local _, session_err = session_repo.create(
        test_data.session_id,
        TEST_ACTOR_ID,
        test_data.context_id,
        "Prompt Window Test",
        "test",
        {},
        { model = "test-model" }
    )
    test.is_nil(session_err, "session create: " .. tostring(session_err))

    create_message(test_data.anchor_id, consts.MSG_TYPE.USER, "please pack the document", {})

    -- The checkpoint window includes the anchor and orders later rows by date and id.

    for round = 1, TOOL_ROUNDS do
        local is_newest = round == TOOL_ROUNDS
        local call_id = "call-" .. tostring(round)

        create_message(uuid.v7(), consts.MSG_TYPE.ASSISTANT, "", {
            source_id = test_data.anchor_id,
            tokens = { prompt_tokens = 1000 + round, completion_tokens = 10 }
        })

        local function_id = uuid.v7()
        create_message(function_id, consts.MSG_TYPE.FUNCTION, json.encode({ attempt = round }), {
            call_id = call_id,
            function_name = "pack_document",
            registry_id = "app:pack_document",
            status = consts.FUNC_STATUS.SUCCESS,
            result = {
                attempt = round,
                success = false,
                report = is_newest and NEWEST_MARKER or ("attempt " .. tostring(round) .. " failed"),
            }
        })

        if is_newest then
            test_data.newest_id = function_id
        end
    end
end

local function contains_id(messages: any, wanted_id: any): boolean
    for _, msg in ipairs(messages or {}) do
        if msg.message_id == wanted_id then
            return true
        end
    end
    return false
end

local function last_function_result_text(prompt_messages: any): string?
    local last: string? = nil
    for _, msg in ipairs(prompt_messages or {}) do
        if msg.role == "function_result" then
            local part = msg.content and msg.content[1]
            if part and type(part.text) == "string" then
                last = part.text
            end
        end
    end
    return last
end

local function define_tests()
    describe("prompt window since checkpoint", function()
        before_all(seed_session)
        after_all(cleanup)

        it("keeps the newest message when the conversation since the checkpoint outgrows the default page", function()
            test.eq(test_data.seeded, 1 + TOOL_ROUNDS * 2)

            -- Exactly the call prompt_builder.from_session makes: no explicit limit.
            local messages, err = message_repo.list_after_message(test_data.session_id, test_data.anchor_id)

            test.is_nil(err, "list_after_message: " .. tostring(err))
            test.not_nil(messages)

            local last = messages[#messages]
            test.is_true(
                contains_id(messages, test_data.newest_id),
                string.format(
                    "the window returned %d of %d rows since the checkpoint and dropped the newest one (%s); it ends at %s. "
                        .. "A page that keeps the OLDEST rows freezes the agent's context.",
                    #messages, test_data.seeded, tostring(test_data.newest_id), tostring(last and last.message_id)
                )
            )
        end)

        it("treats an explicit limit as the newest rows of the range, in chronological order", function()
            local messages, err = message_repo.list_after_message(test_data.session_id, test_data.anchor_id, 10)

            test.is_nil(err, "list_after_message with limit: " .. tostring(err))
            test.not_nil(messages)
            test.eq(#messages, 10)
            test.eq(messages[#messages].message_id, test_data.newest_id, "the newest row must close the window")
            for i = 2, #messages do
                test.is_true(messages[i].date >= messages[i - 1].date, "rows must stay in chronological order")
            end
        end)

        it("shows the model the newest tool result in the prompt built since the checkpoint", function()
            local result, err = open_binding():get_prompt({
                host = { kind = "session", session_id = test_data.session_id },
                selector = { mode = "since_checkpoint" },
                format = "messages"
            })

            test.is_nil(err, "get_prompt since_checkpoint: " .. tostring(err))
            test.not_nil(result)
            test.not_nil(result.messages)

            local last_result = last_function_result_text(result.messages) or "<no function_result in prompt>"
            test.is_true(
                string.find(last_result, NEWEST_MARKER, 1, true) ~= nil,
                string.format(
                    "the prompt has %d messages and its last tool result is %q; the newest tool result (%s) never reaches the model, "
                        .. "so every following step is a blind re-sample of the same prompt",
                    #result.messages, string.sub(last_result, 1, 80), NEWEST_MARKER
                )
            )
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
