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

        local function section(text: string, heading: string): string?
            local _, start = text:find(heading, 1, true)
            if not start then return nil end
            local ending = text:find("\n\n\n===", start + 1, true)
            return text:sub(start + 1, ending and ending - 1 or -1)
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
                captured.conversation = section(captured.text, "===FULL CONVERSATION TO CHECKPOINT===\n\n")
                    or section(captured.text, "===NEW CONVERSATION SINCE CHECKPOINT===\n\n")
                captured.results = section(captured.text, "\n===KEY TOOL RESULTS===\n")
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

        it("caps the output budget at the output limit of the resolved model", function()
            session_with({{ type = "user", data = "Hello.", metadata = {} }})
            local captured = capture()
            llm.resolve_model = function() return { max_tokens = 200000, output_tokens = 1000 }, nil end

            assert(checkpoint.handle({ session_id = "s1" }))

            test.eq(captured.max_tokens, 1000, "the wire limit and the prompt agree")
            test.contains(captured.text, "800 tokens")
            test.is_nil((captured.text:find("2400", 1, true)))
            test.eq(checkpoint.config_from_args({ session_id = "s1", options = { max_tokens = 8000 } }).max_tokens, 1000)
        end)

        it("gives the summarizer every replayed call type", function()
            session_with({
                { type = "function", data = '{"query":"public"}', metadata = {
                    function_name = "search", status = "success", result = "public result" } },
                { type = "private_function", data = '{"query":"private"}', metadata = {
                    function_name = "lookup", status = "success", result = { secret_state = "private result" } } },
                { type = "delegation", data = '{"message":"delegate this"}', metadata = {
                    function_name = "ask_specialist", status = "success", result = { data = "delegated answer" } } },
                { type = "function", data = '{"query":"broken"}', metadata = {
                    function_name = "search", status = "error", result = "tool failure text" } },
                { type = "delegation", data = '{"message":"failed delegation"}', metadata = {
                    function_name = "ask_specialist", status = "cancelled", result = "delegation cancelled" } },
            })
            local captured = capture()
            llm.resolve_model = function() return { max_tokens = 200000 }, nil end

            assert(checkpoint.handle({ session_id = "s1" }))

            for _, expected in ipairs({ "public", "public result", "private", "private result", "delegate this",
                "delegated answer", "tool failure text", "failed delegation", "delegation cancelled", "lookup",
                "ask_specialist" }) do
                test.contains(captured.text, expected)
            end
            test.contains(captured.text, "[TOOL_ERROR]: tool failure text")
        end)

        for _, call_type in ipairs({ "function", "private_function", "delegation" }) do
            for _, invalidation in ipairs({
                { name = "boolean", stale = true },
                { name = "reason", stale = "The observed interface revision changed.", summary = "Previous summary." },
            }) do
                it("replaces stale " .. call_type .. " results in both sections with the " .. invalidation.name .. " notice", function()
                    local withdrawn = "obsolete_" .. call_type .. "_state"
                    session_with({
                        { type = call_type, data = '{"query":"observed state"}', metadata = {
                            function_name = "inspect_state", status = "success", stale = invalidation.stale,
                            result = call_type == "function" and withdrawn or { state = withdrawn } } },
                        { type = call_type, data = "{}", metadata = {
                            function_name = "inspect_current_state", status = "success", stale = false,
                            result = "current state" } },
                    }, invalidation.summary)
                    local captured = capture()
                    llm.resolve_model = function() return { max_tokens = 200000 }, nil end

                    assert(checkpoint.handle({ session_id = "s1" }))

                    local notice = "STALE INFO: this result was withdrawn by the tool that produced " ..
                        "it and no longer describes the current state." ..
                        (invalidation.name == "reason" and (" " .. invalidation.stale) or "") ..
                        " Do not answer from it. Call the tool again if you need this."
                    test.is_nil((captured.text:find(withdrawn, 1, true)),
                        "summarizer request contains withdrawn value: " .. withdrawn)
                    test.contains(captured.text, "[TOOL_RESULT]: " .. notice)
                    test.contains(captured.text, "inspect_state_result: " .. notice)
                    test.contains(captured.text, '[TOOL_ARGUMENTS]: {"query":"observed state"}')
                    test.contains(captured.text, "[TOOL_RESULT]: current state")
                    test.contains(captured.text, "inspect_current_state_result: current state")
                end)
            end
        end

        it("bounds arguments and results of every call type by the result budget", function()
            session_with({
                { type = "delegation", data = string.rep("a", 500), metadata = {
                    function_name = "ask", status = "success", result = string.rep("r", 500) } },
                { type = "private_function", data = string.rep("b", 500), metadata = {
                    function_name = "lookup", status = "success", result = string.rep("s", 500) } },
            })
            local captured = capture()
            llm.resolve_model = function() return { max_tokens = 200000 }, nil end

            assert(checkpoint.handle({ session_id = "s1", options = { max_tool_result_chars = 50 } }))

            for _, letter in ipairs({ "a", "b", "r", "s" }) do
                test.contains(captured.text, string.rep(letter, 50))
                test.is_nil((captured.text:find(string.rep(letter, 51), 1, true)))
            end
        end)

        it("rejects a conversation that exceeds the resolved model input budget", function()
            session_with(oversized_rows(), "Previous summary.")
            local captured = capture()
            llm.resolve_model = function(identifier)
                test.eq(identifier, "class:fast")
                return { max_tokens = 10000 }, nil
            end

            local result, err = checkpoint.handle({ session_id = "s1" })

            test.is_nil(result, "an oversized conversation must not produce a checkpoint")
            test.contains(tostring(err), "conversation exceeds its input budget")
            test.is_nil(captured.calls, "the summarizer must not receive an incomplete conversation")
        end)

        it("rejects a conversation that exceeds the default input budget when no window resolves", function()
            session_with(oversized_rows())
            local captured = capture()
            llm.resolve_model = function() return nil, "no model" end

            local result, err = checkpoint.handle({ session_id = "s1" })

            test.is_nil(result, "the fallback budget must not discard conversation history")
            test.contains(tostring(err), "conversation exceeds its input budget")
            test.is_nil(captured.calls)
        end)

        for _, limit in ipairs({ "max_tool_results_chars", "max_tool_results" }) do
            it("summarizes when duplicate tool results exceed " .. limit, function()
                session_with({
                    { type = "function", data = "{}", metadata = {
                        function_name = "first", status = "success", result = "first fact" } },
                    { type = "function", data = "{}", metadata = {
                        function_name = "last", status = "success", result = "last fact" } },
                })
                local captured = capture()
                llm.resolve_model = function() return { max_tokens = 200000 }, nil end

                local result, err = checkpoint.handle({ session_id = "s1", options = { [limit] = 1 } })

                test.is_nil(err, "duplicate tool results may be dropped")
                test.eq(result.summary, "Summary.")
                test.eq(captured.calls, 1)
                test.contains(captured.conversation, "[TOOL_RESULT]: first fact")
                test.contains(captured.conversation, "[TOOL_RESULT]: last fact")
                test.is_nil((captured.results:find("first_result:", 1, true)))
                if limit == "max_tool_results" then
                    test.eq(captured.results, "last_result: last fact")
                else
                    test.contains(captured.results, "earlier characters of this section omitted")
                end
            end)
        end

        it("summarizes 150 tool calls and repeats only the newest 100 results", function()
            local rows = {}
            for index = 1, 150 do
                rows[index] = { type = "function", data = "{}", metadata = {
                    function_name = "lookup", status = "success", result = string.format("fact %03d", index) } }
            end
            session_with(rows, "Previous summary.")
            local captured = capture()
            llm.resolve_model = function() return { max_tokens = 200000 }, nil end

            local result, err = checkpoint.handle({ session_id = "s1" })

            test.is_nil(err)
            test.eq(result.summary, "Summary.")
            test.eq(captured.calls, 1)
            test.contains(captured.text, "Previous summary.")
            local expected = {}
            for index = 1, 150 do
                local fact = string.format("fact %03d", index)
                test.contains(captured.conversation, "[TOOL_RESULT]: " .. fact)
                if index > 50 then expected[#expected + 1] = "lookup_result: " .. fact end
            end
            test.eq(captured.results, table.concat(expected, "\n"))
        end)

        for _, scenario in ipairs({
            { remaining = 400, name = "summarizes a conversation that leaves only a reduced results budget" },
            { remaining = 0, name = "summarizes a conversation that leaves no results budget" },
            { remaining = -1, name = "rejects a conversation one byte over the available window input" },
        }) do
            it(scenario.name, function()
                local rows = {
                    { type = "user", data = "Remember the blue door.", metadata = {} },
                    { type = "function", data = "{}", metadata = {
                        function_name = "lookup", status = "success", result = string.rep("tool result line\n", 100) } },
                }
                session_with(rows)
                local captured = capture()
                llm.resolve_model = function() return { max_tokens = 10000 }, nil end
                assert(checkpoint.handle({ session_id = "s1" }))

                local original_results = captured.results
                -- Five user sections have four double-newline joins, plus the system separator.
                local separator_chars = 4 * 2 + 1
                local fixed_chars = captured.chars - #captured.conversation
                    - #"\n===KEY TOOL RESULTS===\n" - #original_results - separator_chars
                local available = math.floor((10000 - 3000) * 4 * 0.9) - fixed_chars
                rows[1].data = rows[1].data .. string.rep("x", available - #captured.conversation - scenario.remaining)
                captured = capture()

                local result, err = checkpoint.handle({ session_id = "s1" })

                if scenario.remaining < 0 then
                    test.is_nil(result)
                    test.contains(tostring(err), "conversation exceeds its input budget")
                    test.is_nil(captured.calls)
                    return
                end
                test.is_nil(err)
                test.eq(result.summary, "Summary.")
                test.eq(captured.calls, 1)
                test.eq(#captured.conversation, available - scenario.remaining)
                test.contains(captured.conversation, rows[1].data)
                test.contains(captured.conversation, rows[2].metadata.result)
                test.ok(captured.chars / 4 + 3000 <= 10000, "estimate plus reservation fits")
                if scenario.remaining == 0 then
                    test.is_nil(captured.results)
                    test.is_nil((captured.text:find("===KEY TOOL RESULTS===", 1, true)))
                else
                    test.not_nil(captured.results)
                    test.ok(#captured.results < #original_results)
                    test.contains(captured.results, "earlier characters of this section omitted")
                    test.contains(captured.results, "tool result line")
                end
            end)
        end

        for _, capped in ipairs({ false, true }) do
            it(capped and "honors an explicit conversation cap with a resolved 1M window"
                or "summarizes a 600000-byte transcript with a resolved 1M window", function()
                session_with({{ type = "user", data = string.rep("x", 600000 - #"[USER]: "), metadata = {} }})
                local captured = capture()
                llm.resolve_model = function() return { max_tokens = 1000000 }, nil end

                local result, err = checkpoint.handle({ session_id = "s1",
                    options = capped and { max_conversation_chars = 500000 } or {} })

                if capped then
                    test.is_nil(result)
                    test.contains(tostring(err), "conversation exceeds its input budget")
                    test.is_nil(captured.calls)
                else
                    test.is_nil(err)
                    test.eq(result.summary, "Summary.")
                    test.eq(captured.calls, 1)
                    test.eq(#captured.conversation, 600000)
                    test.ok(captured.chars / 4 + 3000 <= 1000000, "estimate plus reservation fits")
                end
            end)
        end

        it("rejects an oversized transcript even when its newest lines fit", function()
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

            session_with({{ type = "user", data = transcript, metadata = {} }})
            local captured = capture()
            llm.resolve_model = function() return { max_tokens = 200000 }, nil end

            local result, err = checkpoint.handle({ session_id = "s1", options = { max_conversation_chars = 300 } })

            test.is_nil(result, "keeping the newest lines is insufficient for a checkpoint")
            test.contains(tostring(err), "conversation exceeds its input budget")
            test.is_nil(captured.calls)

            local complete, complete_err = checkpoint.handle({ session_id = "s1",
                options = { max_conversation_chars = #"[USER]: " + #transcript } })

            test.is_nil(complete_err)
            test.eq(complete.summary, "Summary.", "a transcript exactly within the budget still summarizes")
            test.eq(captured.calls, 1)
            test.contains(captured.text, transcript)
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
