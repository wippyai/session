local test = require("test")
local writer = require("writer")
local message_repo = require("message_repo")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local wait_for_boot = require("wait_for_boot")
local security = require("security")
local uuid = require("uuid")
local sql = require("sql")
local consts = require("consts")

local function define_tests()
    test.describe("Session writer metadata patches", function()
        local context_id, session_id, persistence
        local messages = {}
        local function message(metadata)
            local id = assert(persistence:add_message("function", "{}", metadata))
            messages[#messages + 1] = id
            return id
        end
        test.before_all(function()
            wait_for_boot.run()
            context_id, session_id = uuid.v7(), uuid.v7()
            assert(context_repo.create(context_id, "primary", "{}"))
            assert(session_repo.create(session_id, security.actor():id(), context_id, "Metadata patches", "test"))
            persistence = assert(writer.new(session_id))
        end)
        test.after_all(function()
            for _, id in ipairs(messages) do message_repo.delete(id) end
            session_repo.delete(session_id)
            context_repo.delete(context_id)
        end)
        test.it("reads current metadata once while preserving a patch committed before the read", function()
            local id = message({old = true})
            local original_get = message_repo.get
            local reads = 0
            message_repo.get = function(requested_id)
                reads = reads + 1
                if reads == 1 then
                    message_repo.get = original_get
                    assert(message_repo.update_metadata(id, {interleaved = true}))
                    message_repo.get = function(next_id)
                        reads = reads + 1
                        return original_get(next_id)
                    end
                end
                return original_get(requested_id)
            end
            local ok, result, err = pcall(persistence.update_message_meta, persistence, id, {status = "success"})
            message_repo.get = original_get
            test.is_true(ok)
            test.is_nil(err)
            test.is_true(result)
            local row = assert(message_repo.get(id))
            test.is_true(row.metadata.old)
            test.is_true(row.metadata.interleaved)
            test.eq(row.metadata.status, "success")
            test.eq(reads, 1, "A metadata patch must reuse its ownership read")
        end)
        test.it("rejects another session before changing its metadata", function()
            local id = message({protected = true})
            local result, err = message_repo.update_metadata(id, {protected = false}, uuid.v7())
            test.is_nil(result)
            test.eq(err, "Message belongs to different session")
            test.is_true(assert(message_repo.get(id)).metadata.protected)
            local other = setmetatable({session_id = uuid.v7()}, writer)
            result, err = other:update_message_meta(id, {protected = false})
            test.is_nil(result)
            test.eq(err, "Message belongs to different session")
            test.is_true(assert(message_repo.get(id)).metadata.protected)
        end)
        test.it("preserves missing-row and read-error responses", function()
            local result, err = persistence:update_message_meta(uuid.v7(), {})
            test.is_nil(result)
            test.eq(err, "Failed to get message: Message not found")
            local original_get = message_repo.get
            message_repo.get = function() return nil, "storage unavailable" end
            local ok
            ok, result, err = pcall(persistence.update_message_meta, persistence, uuid.v7(), {})
            message_repo.get = original_get
            test.is_true(ok)
            test.is_nil(result)
            test.eq(err, "Failed to get message: storage unavailable")
        end)
        test.it("settles concurrent patches on independent messages", function()
            local first, second = message({first = true}), message({second = true})
            local done = channel.new(2)
            for _, id in ipairs({first, second}) do
                coroutine.spawn(function()
                    local result, err = persistence:update_message_meta(id, {status = "success"})
                    done:send({result = result, err = err})
                end)
            end
            for _ = 1, 2 do
                local result = done:receive()
                test.is_nil(result.err)
                test.is_true(result.result)
            end
            local first_row, second_row = assert(message_repo.get(first)), assert(message_repo.get(second))
            test.is_true(first_row.metadata.first)
            test.is_true(second_row.metadata.second)
            test.eq(first_row.metadata.status, "success")
            test.eq(second_row.metadata.status, "success")
        end)
        test.it("settles a function result with one read and preserves metadata override order", function()
            local id = message({call_id = "kept", nested = {value = 42}})
            local original_get = message_repo.get
            local reads = 0
            message_repo.get = function(requested_id)
                reads = reads + 1
                return original_get(requested_id)
            end
            local ok, result, err = pcall(persistence.update_function_result, persistence, id,
                "initial result", true, {result = "override result", status = "override status", extra = true})
            message_repo.get = original_get
            test.is_true(ok)
            test.is_nil(err)
            test.is_true(result)
            local row = assert(message_repo.get(id))
            test.eq(row.metadata.call_id, "kept")
            test.eq(row.metadata.nested.value, 42)
            test.eq(row.metadata.result, "override result")
            test.eq(row.metadata.status, "override status")
            test.is_true(row.metadata.extra)
            test.eq(reads, 1, "Settling a function result must read the row only once")
        end)
        test.it("rejects missing and foreign function results without changing stored metadata", function()
            local id = message({status = "pending"})
            local other = setmetatable({session_id = uuid.v7()}, writer)
            local result, err = other:update_function_result(id, "result", true)
            test.is_nil(result)
            test.eq(err, "Message belongs to different session")
            test.eq(assert(message_repo.get(id)).metadata.status, "pending")
            result, err = persistence:update_function_result(uuid.v7(), "result", false)
            test.is_nil(result)
            test.eq(err, "Failed to get message: Message not found")
            result, err = persistence:update_function_result(id, nil, false)
            test.is_nil(result)
            test.eq(err, "Function result is required")
        end)
        test.it("rejects ownership changes between the read and write", function()
            local id = message({protected = true})
            local other_id = uuid.v7()
            assert(session_repo.create(other_id, security.actor():id(), context_id, "Other session", "test"))
            local db = assert(sql.get(consts.get_db_resource()))
            local original_get = message_repo.get
            message_repo.get = function(requested_id)
                local row, err = original_get(requested_id)
                assert(sql.builder.update("messages"):set("session_id", other_id)
                    :where("message_id = ?", id):run_with(db):exec())
                return row, err
            end
            local ok, result, err = pcall(persistence.update_message_meta, persistence, id, {protected = false})
            message_repo.get = original_get
            local row = assert(message_repo.get(id))
            assert(sql.builder.update("messages"):set("session_id", session_id)
                :where("message_id = ?", id):run_with(db):exec())
            db:release()
            session_repo.delete(other_id)
            test.is_true(ok)
            test.is_nil(result)
            test.contains(err, "different session")
            test.is_true(row.metadata.protected)
        end)
    end)
end

return {run = test.run_cases(define_tests)}
