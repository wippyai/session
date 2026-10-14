local test = require("test")
local writer = require("writer")
local message_repo = require("message_repo")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local wait_for_boot = require("wait_for_boot")
local benchmark_report = require("benchmark_report")
local security = require("security")
local uuid = require("uuid")
local time = require("time")
local env = require("env")

local function define_tests()
    test.describe("Persisted message metadata benchmark", function()
        if not env.get("WIPPY_BENCH_SAMPLES") then
            test.it_skip("requires benchmark settings", function() end)
            return
        end
        test.it("measures verified metadata patches with retained payloads", function()
            wait_for_boot.run()
            local payload_size = tonumber((env.get("WIPPY_BENCH_SIZE"))) or 128
            local warmup = tonumber((env.get("WIPPY_BENCH_WARMUP"))) or 100
            local samples = tonumber((env.get("WIPPY_BENCH_SAMPLES"))) or 100
            local memory_operations = tonumber((env.get("WIPPY_BENCH_MEMORY_OPERATIONS"))) or 2048
            local batch_size = 32
            local payload = string.rep("a", payload_size)
            local context_id, session_id = uuid.v7(), uuid.v7()
            assert(context_repo.create(context_id, "primary", "{}"))
            assert(session_repo.create(session_id, security.actor():id(), context_id, "Metadata benchmark", "test"))
            local persistence = assert(writer.new(session_id))
            local message_id = assert(persistence:add_message("function", "{}", {
                call_id = "metadata-benchmark", status = "pending", payload = payload,
                control_operations = { config = { agent = "app.runtime:help" } },
            }))
            local iteration = 0
            local function update_and_verify()
                iteration = iteration + 1
                assert(persistence:update_message_meta(message_id, { result = iteration, status = "success" }))
                local message = assert(message_repo.get(message_id))
                test.eq(message.session_id, session_id)
                test.eq(message.metadata.payload, payload)
                test.eq(message.metadata.call_id, "metadata-benchmark")
                test.eq(message.metadata.control_operations.config.agent, "app.runtime:help")
                test.eq(message.metadata.result, iteration)
                test.eq(message.metadata.status, "success")
            end
            local ok, err = pcall(function()
                local measured = {}
                for sample = 1, warmup + samples do
                    local start = time.now()
                    for _ = 1, batch_size do update_and_verify() end
                    local elapsed = time.now():sub(start):microseconds() / 1000
                    if sample > warmup then measured[#measured + 1] = elapsed end
                end
                local memory, memory_err = benchmark_report.measure_memory(function()
                    for _ = 1, memory_operations do update_and_verify() end
                end, memory_operations)
                test.not_nil(memory, tostring(memory_err))
                local report, report_err = benchmark_report.report({
                    name = "session_metadata_write", size = payload_size,
                    operations_per_sample = batch_size, samples_ms = measured, memory = memory,
                })
                test.not_nil(report, tostring(report_err))
            end)
            local session_deleted, session_delete_err = session_repo.delete(session_id)
            local context_deleted, context_delete_err = context_repo.delete(context_id)
            local cleanup_err = (not session_deleted and (session_delete_err or "session was not deleted"))
                or (not context_deleted and (context_delete_err or "context was not deleted")) or nil
            if not ok then
                error(cleanup_err and tostring(err) .. "; cleanup failed: " .. tostring(cleanup_err) or err)
            end
            if cleanup_err then error("Benchmark cleanup failed: " .. tostring(cleanup_err)) end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
