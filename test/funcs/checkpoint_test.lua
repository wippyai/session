local test = require("test")
local checkpoint = require("checkpoint")

local function define_tests()
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

    describe("checkpoint input caps", function()
        it("has generous defaults that do not touch a normal range", function()
            local cfg = checkpoint.config_from_args({ session_id = "s1" })

            test.eq(cfg.max_conversation_chars, 600000)
            test.eq(cfg.max_tool_results, 100)
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
