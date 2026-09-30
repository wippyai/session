local test = require("test")
local form_index = require("form_index")
local message_repo = require("message_repo")

local function unanswered(n)
    return {
        artifact_id = string.format("a-%03d", n), title = "Form " .. n,
        meta = { session_form = { version = 1, origin = { created_cursor = string.format("2026-09-29T10:%02d", n) } } },
    }
end

local function answered(n)
    local artifact = unanswered(n)
    artifact.artifact_id = string.format("b-%03d", n)
    artifact.meta.session_form.submission = {
        submitted_at = string.format("2026-09-29T11:%02d", n), late = n == 1, message_id = "m-" .. n,
    }
    return artifact
end

local function count(text, pattern)
    local found = 0
    for _ in string.gmatch(text, pattern) do found = found + 1 end
    return found
end

local function define_tests()
    describe("form index", function()
        it("is absent when the session has no forms", function()
            test.is_nil(form_index.build({ { artifact_id = "x", title = "Notes", meta = {} } }))
            test.is_nil(form_index.build(nil))
        end)

        it("lists at most 8 unanswered and 4 answered forms, newest first, and counts the rest", function()
            local artifacts = {}
            for n = 1, 10 do table.insert(artifacts, unanswered(n)) end
            for n = 1, 6 do table.insert(artifacts, answered(n)) end
            local text = form_index.build(artifacts) or ""
            test.eq(count(text, "\n%- unanswered: "), 8)
            test.eq(count(text, "\n%- answered: "), 4)
            test.contains(text, "(2 more unanswered and 2 more answered forms not listed)")
            test.contains(text, "form_id=a-010")
            test.is_false(string.find(text, "form_id=a-001", 1, true) ~= nil, "the oldest unanswered form is omitted")
            test.contains(text, "form_id=b-006 answered=2026-09-29T11:06 late=false answer_message_id=m-6")
        end)

        it("lists an answer that is not admitted yet as pending, without its answer message", function()
            local artifacts = { answered(1), answered(2) }
            local text = form_index.build(artifacts, { pending_answers = { ["b-002"] = true } }) or ""
            test.contains(text, "- answer pending (arrives as a later user message): \"Form 2\" form_id=b-002 asked=2026-09-29T10:02")
            test.is_false(string.find(text, "m-2", 1, true) ~= nil, "no id of the pending answer")
            test.contains(text, "- answered: \"Form 1\" form_id=b-001")
            test.is_true(form_index.has_answers(artifacts))
            test.is_false(form_index.has_answers({ unanswered(1) }))
        end)

        it("reads pending answer rows only when a form holds an answer", function()
            local original = message_repo.list_pending_answers
            local scans = 0
            message_repo.list_pending_answers = function(session_id, limit)
                scans = scans + 1
                test.eq(session_id, "s-1")
                test.eq(limit, form_index.MAX_PENDING_SCAN)
                return {
                    { type = "user", metadata = { session_form = { artifact_id = "b-002", pending = true } } },
                    { type = "user", metadata = { file_uuids = {} } },
                }
            end

            local none, none_err = form_index.pending_answers("s-1", { unanswered(1) })
            local some, some_err = form_index.pending_answers("s-1", { unanswered(1), answered(2) })
            message_repo.list_pending_answers = original

            test.is_nil(none_err)
            test.is_nil(next(none or { x = true }), "no answered form: an empty set")
            test.is_nil(some_err)
            test.is_true((some :: any)["b-002"])
            test.eq(scans, 1, "the rows are read only for the session with an answered form")
        end)

        it("stays within 8 KiB and is the same for the same rows", function()
            local artifacts = {}
            for n = 1, 8 do
                local artifact = unanswered(n)
                artifact.title = string.rep("Very long title ", 60)
                table.insert(artifacts, artifact)
            end
            local text = form_index.build(artifacts) or ""
            test.is_true(#text <= form_index.MAX_BYTES)
            test.eq(form_index.build(artifacts), text)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
