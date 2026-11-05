local test = require("test")
local title = require("title")
local llm = require("llm")
local session = require("session")

local function define_tests()
    describe("title conversation input", function()
        local original_open, original_generate = session.open, llm.generate
        after_each(function()
            session.open, llm.generate = original_open, original_generate
        end)

        local function prompt_text(summaries: {any}): string
            local rows = {
                { type = "user", data = "Plan the release.", metadata = {} },
                { type = "system", data = "The current date and time is Monday.",
                    metadata = { preserve_position = true, system_action = "turn_context" } },
                { type = "system", data = "Lifecycle system note.",
                    metadata = { preserve_position = true, system_action = "lifecycle_note" } },
                { type = "system", data = "Host record.", metadata = {} },
                { type = "assistant", data = "Release planned.", metadata = {} },
            }
            local query = {}
            function query:from_checkpoint() return self end
            function query:type(_kind) return self end
            function query:all() return rows, nil end
            local contexts = {}
            function contexts:type(_kind) return self end
            function contexts:all() return summaries, nil end
            session.open = function()
                return {
                    messages = function() return query end,
                    contexts = function() return contexts end,
                }
            end
            local sent = {}
            llm.generate = function(prompt_builder)
                for _, message in ipairs(prompt_builder:get_messages()) do
                    for _, part in ipairs(message.content or {}) do sent[#sent + 1] = part.text end
                end
                return { result = "Release planning" }, nil
            end
            local result, err = title.handle({ session_id = "session-title" })
            test.is_nil(err)
            test.eq(result.title, "Release planning")
            return table.concat(sent, "\n")
        end

        it("leaves out a form answer the session has not admitted", function()
            local query = {}
            function query:all()
                return {
                    { type = "user", data = "Plan the release.", metadata = {} },
                    { type = "user", data = "Waiting answer.",
                        metadata = { session_form = { artifact_id = "form-1", pending = true } } },
                    { type = "user", data = "Admitted answer.",
                        metadata = { session_form = { artifact_id = "form-2" } } },
                }, nil
            end
            local contexts = {}
            function contexts:type(_kind) return self end
            function contexts:all() return {}, nil end
            session.open = function()
                return { messages = function() return query end, contexts = function() return contexts end }
            end
            local sent = {}
            llm.generate = function(prompt_builder)
                for _, message in ipairs(prompt_builder:get_messages()) do
                    for _, part in ipairs(message.content or {}) do sent[#sent + 1] = part.text end
                end
                return { result = "Release planning" }, nil
            end

            test.not_nil(title.handle({ session_id = "session-title" }))
            local text = table.concat(sent, "\n")
            test.contains(text, "Plan the release.")
            test.contains(text, "Admitted answer.")
            test.is_nil(string.find(text, "Waiting answer.", 1, true))
        end)

        it("clamps a long title on a character boundary", function()
            local query = {}
            function query:all() return {{ type = "user", data = "Doors.", metadata = {} }}, nil end
            local contexts = {}
            function contexts:type(_kind) return self end
            function contexts:all() return {}, nil end
            session.open = function()
                return { messages = function() return query end, contexts = function() return contexts end }
            end
            llm.generate = function() return { result = "A" .. string.rep("я", 70) }, nil end

            local result = assert(title.handle({ session_id = "session-title" }))

            test.eq(#result.title, 99, "the cut drops the split character")
            test.eq(result.title, "A" .. string.rep("я", 49))
        end)

        for name, summaries in pairs({
            ["before a checkpoint"] = {},
            ["after a checkpoint"] = {{ text = "Earlier summary", time = "2026-11-03" }},
        }) do
            it("leaves positional notes out " .. name, function()
                local text = prompt_text(summaries)
                test.contains(text, "User: Plan the release.")
                test.contains(text, "Assistant: Release planned.")
                test.contains(text, "System: Host record.")
                test.is_nil((text:find("current date and time", 1, true)))
                test.is_nil((text:find("Lifecycle system note", 1, true)))
            end)
        end
    end)
end

return { run_tests = test.run_cases(define_tests) }
