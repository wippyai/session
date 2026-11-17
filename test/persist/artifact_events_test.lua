local test = require("test")
local artifact_events = require("artifact_events")

-- The publisher's own contract: it addresses the owner's hub ("user.<owner>",
-- never the caller), drops silently with no hub, and never runs when the
-- caller has nothing to publish. process.registry/process.send are mocked
-- here rather than exercised against a real relay hub process, since the
-- harness has no such process to run against.

local function define_tests()
    describe("artifact_events.publish_updated", function()
        after_each(function()
            restore_mock("process.registry")
            restore_mock("process.send")
        end)

        it("addresses the owning user's hub, not the caller's id", function()
            local looked_up = nil
            local sent = nil

            mock("process.registry", {
                lookup = function(name)
                    looked_up = name
                    if name == "user.owner-123" then
                        return "hub-pid-for-owner"
                    end
                    return nil
                end
            })
            mock("process.send", function(pid, topic, payload)
                sent = { pid = pid, topic = topic, payload = payload }
                return true, nil
            end)

            local published = artifact_events.publish_updated({
                artifact_id = "artifact-1",
                user_id = "owner-123",
                kind = "static",
                title = "t",
                created_at = "2026-01-01T00:00:00Z",
                updated_at = "2026-01-01T00:00:00Z",
                content_version = 3,
            })

            test.is_true(published)
            test.eq(looked_up, "user.owner-123")
            test.not_nil(sent)
            assert(sent)
            test.eq(sent.pid, "hub-pid-for-owner")
            test.eq(sent.topic, "artifact:artifact-1")
            test.eq(sent.payload.uuid, "artifact-1")
            test.eq(sent.payload.content_version, 3)
            test.eq(type(sent.payload.content_version), "number")
        end)

        it("drops the event silently when the owner has no active hub", function()
            local send_calls = 0

            mock("process.registry", { lookup = function() return nil end })
            mock("process.send", function() send_calls = send_calls + 1 end)

            local published = artifact_events.publish_updated({
                artifact_id = "artifact-2",
                user_id = "owner-no-hub",
                kind = "static",
                title = "t",
                created_at = "2026-01-01T00:00:00Z",
                updated_at = "2026-01-01T00:00:00Z",
                content_version = 1,
            })

            test.is_false(published)
            test.eq(send_calls, 0)
        end)

        it("does nothing for a nil artifact or one missing an owner", function()
            local lookup_calls = 0
            mock("process.registry", { lookup = function() lookup_calls = lookup_calls + 1; return "pid" end })
            mock("process.send", function() end)

            test.is_false(artifact_events.publish_updated(nil))
            test.is_false(artifact_events.publish_updated({ artifact_id = "artifact-3" }))
            test.eq(lookup_calls, 0)
        end)
    end)
end

return test.run_cases(define_tests)
