local test = require("test")
local checkpoint = require("checkpoint")
local prompt = require("prompt")

local function define_tests()
    describe("outgoing summary boundary", function()
        it("excludes queued steering and later arrivals from the captured settled tail", function()
            local messages = {
                {message_id = "request", metadata = {}},
                {message_id = "queued", metadata = {input = {state = "pending"}}},
                {message_id = "applied", metadata = {input = {state = "applied"}}},
                {message_id = "tool", metadata = {}},
                {message_id = "later", metadata = {}},
            }
            local selected, err = checkpoint.select_messages(messages, "tool")
            test.is_nil(err)
            test.eq(#selected, 3)
            test.eq(selected[1].message_id, "request")
            test.eq(selected[2].message_id, "applied")
            test.eq(selected[3].message_id, "tool")
        end)
        it("fails if the captured boundary disappeared", function()
            local selected, err = checkpoint.select_messages({{message_id = "different"}}, "missing")
            test.is_nil(selected)
            test.eq(err, "Checkpoint boundary not found in summary history")
        end)
        it("preserves ordinary checkpoint selection", function()
            local messages = {{message_id = "queued", metadata = {input = {state = "pending"}}}}
            test.eq(checkpoint.select_messages(messages), messages)
        end)
    end)

    describe("checkpoint config_from_args", function()
        it("falls back to defaults when no options are supplied", function()
            local cfg = checkpoint.config_from_args({ session_id = "s1" })

            test.eq(cfg.model, "class:fast")
            test.eq(cfg.temperature, 0.2)
            test.eq(cfg.max_tokens, 3000)
            test.eq(cfg.max_tool_result_chars, 2000)
        end)

        it("applies model, temperature, max_tokens and max_tool_result_chars overrides", function()
            local cfg = checkpoint.config_from_args({
                session_id = "s1",
                options = {
                    model = "class:smart",
                    temperature = 0.7,
                    max_tokens = 8000,
                    max_tool_result_chars = 500,
                },
            })

            test.eq(cfg.model, "class:smart")
            test.eq(cfg.temperature, 0.7)
            test.eq(cfg.max_tokens, 8000)
            test.eq(cfg.max_tool_result_chars, 500)
        end)

        it("rejects non-positive numeric overrides and keeps defaults", function()
            local cfg = checkpoint.config_from_args({
                session_id = "s1",
                options = {
                    max_tokens = 0,
                    max_tool_result_chars = -10,
                },
            })

            test.eq(cfg.max_tokens, 3000)
            test.eq(cfg.max_tool_result_chars, 2000)
        end)

        it("ignores empty model string and keeps the default", function()
            local cfg = checkpoint.config_from_args({
                session_id = "s1",
                options = { model = "" },
            })

            test.eq(cfg.model, "class:fast")
        end)

        it("tolerates a non-table options value", function()
            local cfg = checkpoint.config_from_args({
                session_id = "s1",
                options = "not-a-table",
            })

            test.eq(cfg.model, "class:fast")
            test.eq(cfg.max_tokens, 3000)
        end)
    end)

    describe("summarizer request", function()
        local original_open, original_generate, original_resolve = session.open, llm.generate, llm.resolve_model
        after_each(function()
            session.open, llm.generate, llm.resolve_model = original_open, original_generate, original_resolve
        end)

        local function session_with(rows: {any}, summary: string?)
            local query = {}
            function query:from_checkpoint() return self end
            function query:all() return rows, nil end
            local contexts = {}
            function contexts:type(_kind) return self end
            function contexts:all()
                if summary then return {{ text = summary }}, nil end
                return {}, nil
            end
            session.open = function()
                return { messages = function() return query end, contexts = function() return contexts end }
            end
        end

        local function capture(response: any?): any
            local captured = { chars = 0, text = "" }
            llm.generate = function(prompt_input, options)
                captured.calls = (captured.calls or 0) + 1
                captured.max_tokens = options.max_tokens
                local parts = {}
                for _, message in ipairs(prompt_input:get_messages()) do
                    for _, part in ipairs(message.content or {}) do parts[#parts + 1] = part.text or "" end
                end
                captured.text = table.concat(parts, "\n")
                captured.chars = #captured.text
                return response or { result = "Summary.", finish_reason = "stop" }, nil
            end
            return captured
        end

        local function oversized_rows(): {any}
            local rows = {}
            for index = 1, 80 do
                rows[#rows + 1] = { type = "user", data = string.rep("x", 9000) .. index, metadata = {} }
            end
            for index = 1, 100 do
                rows[#rows + 1] = { type = "function", data = "{}", metadata = {
                    function_name = "t", status = "success", result = string.rep("r", 3000) } }
            end
            return rows
        end

        it("rejects a summary cut off by its output budget", function()
            session_with({{ type = "user", data = "Remember the blue door.", metadata = {} }})
            capture({ result = "1. FACTS: the user wants the blue do", finish_reason = "length" })

            local result, err = checkpoint.handle({ session_id = "s1" })

            test.is_nil(result, "a cut summary must not become the checkpoint")
            test.contains(tostring(err), "output budget")
        end)

        it("asks for a budget below max_tokens", function()
            session_with({{ type = "user", data = "Hello.", metadata = {} }})
            local captured = capture()
            llm.resolve_model = function() return { max_tokens = 200000 }, nil end

            assert(checkpoint.handle({ session_id = "s1" }))

            test.eq(captured.max_tokens, 3000)
            test.is_nil((captured.text:find("USE ALL", 1, true)))
            test.is_nil((captured.text:find("3000", 1, true)), "the prompt never asks for the whole budget")
            test.contains(captured.text, "2400 tokens")
        end)

        it("sizes the request to the window of the resolved model", function()
            session_with(oversized_rows(), "Previous summary.")
            local captured = capture()
            llm.resolve_model = function(identifier)
                test.eq(identifier, "class:fast")
                return { max_tokens = 10000 }, nil
            end

            assert(checkpoint.handle({ session_id = "s1" }))

            test.eq(captured.calls, 1)
            test.ok(captured.chars / 4 + 3000 <= 10000, "estimate plus reservation fits: " .. captured.chars)
            test.contains(captured.text, "Previous summary.")
        end)

        it("fits a 200k window with the default budgets when no window resolves", function()
            session_with(oversized_rows())
            local captured = capture()
            llm.resolve_model = function() return nil, "no model" end

            assert(checkpoint.handle({ session_id = "s1" }))

            test.ok(captured.chars / 4 + 3000 <= 200000, "defaults fit a 200k window: " .. captured.chars)
        end)

        it("fails without a request when the window cannot hold the fixed input", function()
            session_with({{ type = "user", data = "Hello.", metadata = {} }}, string.rep("s", 40000))
            local captured = capture()
            llm.resolve_model = function() return { max_tokens = 4000 }, nil end

            local result, err = checkpoint.handle({ session_id = "s1" })

            test.is_nil(result)
            test.contains(tostring(err), "context window")
            test.is_nil(captured.calls)
        end)
    end)

    describe("checkpoint input caps", function()
        it("has generous defaults that do not touch a normal range", function()
            local cfg = checkpoint.config_from_args({ session_id = "s1" })

            test.eq(cfg.max_conversation_chars, 500000)
            test.eq(cfg.max_tool_results, 100)
            test.eq(cfg.max_tool_results_chars, 100000)
        end)

        it("applies max_conversation_chars and max_tool_results overrides", function()
            local cfg = checkpoint.config_from_args({
                session_id = "s1",
                options = { max_conversation_chars = 5000, max_tool_results = 7 },
            })

            test.eq(cfg.max_conversation_chars, 5000)
            test.eq(cfg.max_tool_results, 7)
        end)

        it("leaves a transcript within the cap untouched", function()
            local text, dropped = checkpoint.clamp_transcript("line 1\nline 2", 100)
            test.eq(text, "line 1\nline 2")
            test.eq(dropped, 0)
        end)

        it("keeps the newest lines of an oversized transcript and says how much it dropped", function()
            local lines = {}
            for i = 1, 100 do
                lines[i] = string.format("[TOOL_RESULT]: attempt %03d", i)
            end
            local transcript = table.concat(lines, "\n")

            local text, dropped = checkpoint.clamp_transcript(transcript, 300)

            test.gt(dropped, 0)
            test.is_true(string.find(text, "attempt 100", 1, true) ~= nil, "the newest line must survive")
            test.is_true(string.find(text, "attempt 001", 1, true) == nil, "the oldest line must go")
            test.is_true(string.find(text, "earlier characters of this section omitted", 1, true) ~= nil)
            test.is_nil((string.find(text, "previous checkpoint covers", 1, true)), "nothing else holds the dropped text")
            test.is_true(string.find(text, "\n[TOOL_RESULT]: attempt", 1, true) ~= nil, "the cut lands on a line boundary")
        end)

        it("keeps the newest tool results", function()
            local kept = checkpoint.newest({ "r1", "r2", "r3", "r4" }, 2)
            test.eq(#kept, 2)
            test.eq(kept[1], "r3")
            test.eq(kept[2], "r4")
            test.eq(#checkpoint.newest({ "r1" }, 2), 1)
        end)
    end)

    describe("checkpoint prompt token substitution", function()
        it("adds the rendered system prompt without replacement-count metadata", function()
            local builder = prompt.new()
            builder:add_system(checkpoint.checkpoint_prompt("Use full 3000 tokens here.", 8000))

            local messages = builder:get_messages()
            test.eq(#messages, 1)
            test.eq(messages[1].role, "system")
            test.is_nil(rawget(messages[1], "metadata"))
        end)

        it("substitutes the default 3000 token marker with the configured budget", function()
            local rendered = checkpoint.checkpoint_prompt("Use full 3000 tokens here.", 8000)
            test.eq(rendered, "Use full 8000 tokens here.")
        end)

        it("leaves text without the marker unchanged", function()
            local rendered = checkpoint.checkpoint_prompt("No marker present.", 8000)
            test.eq(rendered, "No marker present.")
        end)
    end)
end

return test.run_cases(define_tests)
