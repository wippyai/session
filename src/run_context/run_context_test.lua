local contract = require("contract")
local context_repo = require("context_repo")
local consts = require("consts")
local json = require("json")
local message_repo = require("message_repo")
local security = require("security")
local session_contexts_repo = require("session_contexts_repo")
local session_repo = require("session_repo")
local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local wait_for_boot = require("wait_for_boot")

local CONTRACT_ID = "wippy.agent:run_context"
local BINDING_ID = "wippy.session.run_context:binding"
local TEST_ACTOR_ID = "session-run-context-test@wippy.local"

local test_data = {
    session_id = uuid.v7(),
    context_id = uuid.v7(),
    summary_id = uuid.v7(),
    user_message_id = uuid.v7(),
    assistant_message_id = uuid.v7(),
}

local function open_binding()
    local def, def_err = contract.get(CONTRACT_ID)
    test.is_nil(def_err, "contract.get: " .. tostring(def_err))
    test.not_nil(def)

    local actor = security.new_actor(TEST_ACTOR_ID, { source = "run_context_test" })
    local scope, scope_err = security.named_scope("wippy.session.run_context:test_group")
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

local function current_user_id()
    return TEST_ACTOR_ID
end

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

local function setup_session()
    wait_for_boot.run()
    cleanup()

    local context_json, encode_err = json.encode({
        topic = "run-context",
        nested = { enabled = true },
        current_checkpoint_id = test_data.user_message_id
    })
    test.is_nil(encode_err)

    local context, context_err = context_repo.create(test_data.context_id, "primary", context_json)
    test.is_nil(context_err, "context create: " .. tostring(context_err))
    test.not_nil(context)

    local session, session_err = session_repo.create(
        test_data.session_id,
        current_user_id(),
        test_data.context_id,
        "Run Context Test",
        "test",
        { purpose = "run_context" },
        { model = "test-model" }
    )
    test.is_nil(session_err, "session create: " .. tostring(session_err))
    test.not_nil(session)

    local user_message, user_err = message_repo.create(
        test_data.user_message_id,
        test_data.session_id,
        "user",
        "hello from session",
        { trace = "user" }
    )
    test.is_nil(user_err, "user message create: " .. tostring(user_err))
    test.not_nil(user_message)

    local assistant_message, assistant_err = message_repo.create(
        test_data.assistant_message_id,
        test_data.session_id,
        "assistant",
        "hello from assistant",
        { trace = "assistant" }
    )
    test.is_nil(assistant_err, "assistant message create: " .. tostring(assistant_err))
    test.not_nil(assistant_message)

    local summary, summary_err = session_contexts_repo.create(
        test_data.summary_id,
        test_data.session_id,
        "conversation_summary",
        "existing summary"
    )
    test.is_nil(summary_err, "summary create: " .. tostring(summary_err))
    test.not_nil(summary)
end

local function define_tests()
    test.describe("session run_context binding", function()
        before_all(setup_session)
        after_all(cleanup)

        test.it("routes get_context through the child binding function", function()
            local result, err = open_binding():get_context({ host = { kind = "session" } })
            test.is_nil(result)
            test.contains(tostring(err), "host.session_id is required")
        end)

        test.it("routes get_history through the child binding function", function()
            local result, err = open_binding():get_history({ host = { kind = "session" } })
            test.is_nil(result)
            test.contains(tostring(err), "host.session_id is required")
        end)

        test.it("routes get_prompt through the child binding function", function()
            local result, err = open_binding():get_prompt({ host = { kind = "session" } })
            test.is_nil(result)
            test.contains(tostring(err), "host.session_id is required")
        end)

        test.it("reads context through the child binding function", function()
            local result, err = open_binding():get_context({
                host = { kind = "session", session_id = test_data.session_id },
                agent = { id = "agent:test", model = "test-model" }
            })

            test.is_nil(err, "get_context: " .. tostring(err))
            test.not_nil(result)
            test.eq(result.host.session_id, test_data.session_id)
            test.eq(result.agent.id, "agent:test")
            test.eq(result.context.topic, "run-context")
            test.is_true(result.context.nested.enabled)
        end)

        test.it("reads a bounded history slice through the child binding function", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = { mode = "window", last = 1 }
            })

            test.is_nil(err, "get_history: " .. tostring(err))
            test.not_nil(result)
            test.eq(#result.events, 1)
            test.eq(result.events[1].id, test_data.assistant_message_id)
            test.eq(result.events[1].role, "assistant")
            test.eq(result.events[1].content, "hello from assistant")
            test.eq(result.range.from_id, test_data.assistant_message_id)
            test.eq(result.range.to_id, test_data.assistant_message_id)
            test.is_false(result.truncated)
        end)

        test.it("reads all history in chronological order", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = { mode = "all" }
            })

            test.is_nil(err, "get_history all: " .. tostring(err))
            test.eq(#result.events, 2)
            test.eq(result.events[1].id, test_data.user_message_id)
            test.eq(result.events[2].id, test_data.assistant_message_id)
            test.eq(result.range.from_id, test_data.user_message_id)
            test.eq(result.range.to_id, test_data.assistant_message_id)
        end)

        test.it("uses a default window size when last is omitted", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = { mode = "window" }
            })

            test.is_nil(err, "get_history window default: " .. tostring(err))
            test.eq(#result.events, 2)
            test.eq(result.events[1].id, test_data.user_message_id)
            test.eq(result.events[2].id, test_data.assistant_message_id)
        end)

        test.it("rejects non-positive window sizes", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = { mode = "window", last = 0 }
            })

            test.is_nil(result)
            test.contains(tostring(err), "selector.last must be positive")
        end)

        test.it("rejects non-numeric window sizes", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = { mode = "window", last = "later" }
            })

            test.is_nil(result)
            test.contains(tostring(err), "selector.last must be positive")
        end)

        test.it("requires from_id for since_id", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = { mode = "since_id" }
            })

            test.is_nil(result)
            test.contains(tostring(err), "selector.from_id is required")
        end)

        test.it("treats since_id as exclusive", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = {
                    mode = "since_id",
                    from_id = test_data.user_message_id
                }
            })

            test.is_nil(err, "get_history since_id: " .. tostring(err))
            test.eq(#result.events, 1)
            test.eq(result.events[1].id, test_data.assistant_message_id)
            test.eq(result.range.from_id, test_data.assistant_message_id)
            test.eq(result.range.to_id, test_data.assistant_message_id)
        end)

        test.it("treats range without from_id as beginning of history", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = {
                    mode = "range",
                    to_id = test_data.user_message_id
                }
            })

            test.is_nil(err, "get_history range from beginning: " .. tostring(err))
            test.eq(#result.events, 1)
            test.eq(result.events[1].id, test_data.user_message_id)
            test.eq(result.range.from_id, test_data.user_message_id)
            test.eq(result.range.to_id, test_data.user_message_id)
        end)

        test.it("treats range as exclusive from_id and inclusive to_id", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = {
                    mode = "range",
                    from_id = test_data.user_message_id,
                    to_id = test_data.assistant_message_id
                }
            })

            test.is_nil(err, "get_history range: " .. tostring(err))
            test.eq(#result.events, 1)
            test.eq(result.events[1].id, test_data.assistant_message_id)
            test.eq(result.range.from_id, test_data.assistant_message_id)
            test.eq(result.range.to_id, test_data.assistant_message_id)
        end)

        test.it("returns an empty range when from_id and to_id are the same", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = {
                    mode = "range",
                    from_id = test_data.user_message_id,
                    to_id = test_data.user_message_id
                }
            })

            test.is_nil(err, "get_history empty range: " .. tostring(err))
            test.eq(#result.events, 0)
            test.is_nil(result.range.from_id)
            test.is_nil(result.range.to_id)
        end)

        test.it("treats range without to_id as open ended", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = {
                    mode = "range",
                    from_id = test_data.user_message_id
                }
            })

            test.is_nil(err, "get_history open range: " .. tostring(err))
            test.eq(#result.events, 1)
            test.eq(result.events[1].id, test_data.assistant_message_id)
            test.eq(result.range.from_id, test_data.assistant_message_id)
            test.eq(result.range.to_id, test_data.assistant_message_id)
        end)

        test.it("requires checkpoint_id for explicit checkpoint mode", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = { mode = "checkpoint" }
            })

            test.is_nil(result)
            test.contains(tostring(err), "selector.checkpoint_id is required")
        end)

        test.it("treats explicit checkpoints as exclusive anchors", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = {
                    mode = "checkpoint",
                    checkpoint_id = test_data.user_message_id
                }
            })

            test.is_nil(err, "get_history checkpoint: " .. tostring(err))
            test.eq(#result.events, 1)
            test.eq(result.events[1].id, test_data.assistant_message_id)
        end)

        test.it("uses the current checkpoint as an exclusive anchor by default", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id }
            })

            test.is_nil(err, "get_history since_checkpoint: " .. tostring(err))
            test.eq(#result.events, 1)
            test.eq(result.events[1].id, test_data.assistant_message_id)
        end)

        test.it("rejects unknown selector modes", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = { mode = "laterish" }
            })

            test.is_nil(result)
            test.contains(tostring(err), "unknown selector mode")
        end)

        test.it("applies max_chars after slicing and reports truncation", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = {
                    mode = "all",
                    max_chars = 20
                }
            })

            test.is_nil(err, "get_history max_chars: " .. tostring(err))
            test.eq(#result.events, 1)
            test.eq(result.events[1].id, test_data.user_message_id)
            test.is_true(result.truncated)
            test.eq(result.range.from_id, test_data.user_message_id)
            test.eq(result.range.to_id, test_data.user_message_id)
        end)

        test.it("ignores root max_chars for history slices", function()
            local result, err = open_binding():get_history({
                host = { kind = "session", session_id = test_data.session_id },
                selector = { mode = "all" },
                max_chars = 20
            })

            test.is_nil(err, "get_history root max_chars: " .. tostring(err))
            test.eq(#result.events, 2)
            test.is_false(result.truncated)
        end)

        test.it("builds prompt text through the child binding function", function()
            local result, err = open_binding():get_prompt({
                host = { kind = "session", session_id = test_data.session_id },
                selector = { mode = "all" },
                format = "both"
            })

            test.is_nil(err, "get_prompt: " .. tostring(err))
            test.not_nil(result)
            test.not_nil(result.messages)
            test.contains(result.text, "hello from session")
            test.contains(result.text, "hello from assistant")
            test.eq(result.range.from_id, test_data.user_message_id)
            test.eq(result.range.to_id, test_data.assistant_message_id)
        end)

        test.it("applies selector max_chars to prompt slices", function()
            local result, err = open_binding():get_prompt({
                host = { kind = "session", session_id = test_data.session_id },
                selector = {
                    mode = "all",
                    max_chars = 20
                },
                format = "text"
            })

            test.is_nil(err, "get_prompt selector max_chars: " .. tostring(err))
            test.is_true(result.truncated)
            test.eq(result.range.from_id, test_data.user_message_id)
            test.eq(result.range.to_id, test_data.user_message_id)
            test.contains(result.text, "hello from session")
            test.is_true(string.find(result.text, "hello from assistant", 1, true) == nil)
        end)

        test.it("builds prompt from the selected slice only", function()
            local result, err = open_binding():get_prompt({
                host = { kind = "session", session_id = test_data.session_id },
                selector = {
                    mode = "since_id",
                    from_id = test_data.user_message_id
                },
                format = "text"
            })

            test.is_nil(err, "get_prompt selected slice: " .. tostring(err))
            test.contains(result.text, "hello from assistant")
            test.is_true(string.find(result.text, "hello from session", 1, true) == nil)
            test.is_nil(result.messages)
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
