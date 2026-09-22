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
