local test = require("test")
local uuid = require("uuid")
local security = require("security")
local sql = require("sql")
local time = require("time")
local consts = require("consts")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local message_repo = require("message_repo")
local writer = require("writer")
local reader = require("reader")
local message_handlers = require("message_handlers")
local agent_library = require("agent_library")
local llm = require("llm")
local wait_for_boot = require("wait_for_boot")

local function define_tests()
    describe("expired thinking through the stored session, Agent and LLM", function()
        local session_id, context_id, user_id
        local saved, requests, route, written_ttl

        before_all(function() wait_for_boot.run() end)

        before_each(function()
            session_id, context_id = uuid.v7(), uuid.v7()
            local actor = security.actor()
            if not actor then error("expired thinking test requires an actor") end
            user_id = actor:id()
            assert(context_repo.create(context_id, "primary", "{}"))
            assert(session_repo.create(session_id, user_id, context_id, "expired thinking test", "test"))

            requests = {}
            route, written_ttl = { id = "test:provider", provider_model = "wire" }, nil
            saved = { agent_llm = agent_library._llm, models = llm._models, providers = llm._providers,
                resolver = llm._model_resolver, usage = llm._usage_tracker }
            agent_library._llm = llm
            llm._model_resolver = { resolve = function() return {
                name = "test-model", max_tokens = 200000, capabilities = { "generate" },
                providers = { route },
            } end }
            llm._usage_tracker = false
            llm._providers = {
                driver_declares_legacy_reasoning_flag = function() return false end,
                driver_output_policy = function() return nil, nil end,
                open = function() return { generate = function(_, args)
                    local replayed = {}
                    for _, message in ipairs(args.messages) do
                        local blocks = type(message.metadata) == "table" and message.metadata.thinking_blocks or nil
                        if message.role == "assistant" and type(blocks) == "table" then
                            for _, block in ipairs(blocks) do replayed[#replayed + 1] = block.signature end
                        end
                    end
                    requests[#requests + 1] = table.concat(replayed, ",")
                    return { result = "Answer " .. #requests .. ".",
                        tokens = { prompt_tokens = 100, completion_tokens = 2,
                            cache_write_by_ttl = written_ttl and { [written_ttl] = 50 } or nil },
                        metadata = { thinking_blocks = { { type = "thinking", thinking = "", signature = "step-" .. #requests } } } }
                end } end,
            }
        end)

        after_each(function()
            agent_library._llm, llm._models, llm._providers = saved.agent_llm, saved.models, saved.providers
            llm._model_resolver, llm._usage_tracker = saved.resolver, saved.usage
            session_repo.delete(session_id)
            context_repo.delete(context_id)
        end)

        local function session_context(agent_options: table?): any
            local runner = agent_library.new({ id = "test:expiry", name = "Expiry integration",
                description = "Test fixture", model = "test-model", prompt = "Answer the question.",
                agent_options = agent_options })
            return { session_id = session_id, user_id = user_id,
                config = { agent_id = runner.id, model = runner.model },
                reader = assert(reader.open(session_id)), writer = assert(writer.new(session_id)), lifecycle_state = {},
                agent_ctx = { load_agent = function() return runner end, get_current_agent = function() return runner end },
                upstream = { response_beginning = function() end, send_message_update = function() end,
                    invalidate_message = function() end, message_error = function() end,
                    update_session = function() end, session_error = function() end,
                    message_received = function() end, command_error = function() end } }
        end

        local function turn(ctx: any, text: string): string
            local accepted, err = message_handlers.handle_message(ctx, { data = { text = text }, request_id = uuid.v7() })
            assert(not err, tostring(err))
            local step, step_err = message_handlers.agent_step(ctx, accepted.next_ops[1])
            assert(not step_err, tostring(step_err))
            assert(step.completed, "the turn must end with the answer")
            assert(message_handlers.finish_turn(ctx))
            return accepted.message_id
        end

        local function age_history(seconds: number, step_seconds: number?)
            local date = time.unix(time.now():unix() - seconds, 0):utc():format(time.RFC3339NANO)
            local db = assert(sql.get(consts.get_db_resource()))
            local _, err = sql.builder.update("messages"):set("date", date)
                :where("session_id = ?", session_id):run_with(db):exec()
            db:release()
            assert(not err, tostring(err))
            assert(assert(writer.new(session_id)):update_meta({
                meta = { model_step_at = time.now():unix() - (step_seconds or seconds) } }))
        end

        it("stops replaying earlier thinking once the cache lifetime has passed", function()
            local options = { prompt_cache = { drop_expired_thinking = true } }
            turn(session_context(options), "First question.")
            age_history(3600)

            local ctx = session_context(options)
            local second = turn(ctx, "Second question.")
            local third = turn(ctx, "Third question.")

            test.eq(requests[2], "", "the turn that follows the pause replays no earlier block")
            test.eq(requests[3], "step-2", "the next turn keeps the blocks produced after the pause")
            test.is_true(message_repo.get(second).metadata.expires_thinking)
            test.is_nil(message_repo.get(third).metadata.expires_thinking)
        end)

        it("replays earlier thinking while the cache is alive", function()
            local ctx = session_context({ prompt_cache = { drop_expired_thinking = true } })
            turn(ctx, "First question.")
            age_history(200)

            local second = turn(ctx, "Second question.")

            test.eq(requests[2], "step-1")
            test.is_nil(message_repo.get(second).metadata.expires_thinking)
        end)

        it("trusts the stored time of the last model step over older messages", function()
            local options = { prompt_cache = { drop_expired_thinking = true } }
            turn(session_context(options), "First question.")
            test.eq(type(session_repo.get(session_id, user_id).meta.model_step_at), "number",
                "the turn end stores the time of its last model step")
            age_history(3600, 200)

            local second = turn(session_context(options), "Second question.")

            test.eq(requests[2], "step-1")
            test.is_nil(message_repo.get(second).metadata.expires_thinking)
        end)

        it("takes the option from the model card of an agent that sets none", function()
            route.drop_expired_thinking = true
            turn(session_context(nil), "First question.")
            age_history(3600)

            local second = turn(session_context(nil), "Second question.")

            test.eq(requests[2], "")
            test.is_true(message_repo.get(second).metadata.expires_thinking)
        end)

        it("lets the agent switch off what the model card switches on", function()
            route.drop_expired_thinking = true
            local options = { prompt_cache = { drop_expired_thinking = false } }
            turn(session_context(options), "First question.")
            age_history(3600)

            turn(session_context(options), "Second question.")

            test.eq(requests[2], "step-1")
        end)

        it("waits for the lifetime the provider reported for its cache writes", function()
            local options = { prompt_cache = { drop_expired_thinking = true } }
            written_ttl = "1h"
            turn(session_context(options), "First question.")
            test.eq(session_repo.get(session_id, user_id).meta.model_cache_ttl, "1h")
            age_history(1800)

            turn(session_context(options), "Second question.")
            age_history(3700)
            turn(session_context(options), "Third question.")

            test.eq(requests[2], "step-1", "half an hour is inside the reported hour")
            test.eq(requests[3], "", "past the reported hour the earlier blocks leave")
        end)

        it("replays earlier thinking for an agent that did not opt in", function()
            turn(session_context(nil), "First question.")
            age_history(86400)

            local second = turn(session_context(nil), "Second question.")

            test.eq(requests[2], "step-1")
            test.is_nil(message_repo.get(second).metadata.expires_thinking)
        end)
    end)
end

return { run_tests = test.run_cases(define_tests) }
