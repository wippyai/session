local test = require("test")
local exec = require("exec")
local env = require("env")
local json = require("json")
local uuid = require("uuid")

local function quote(value)
    return "'" .. value:gsub("'", "'\\''") .. "'"
end

local function run(command, expected_status)
    local executor = exec.get("app.runtime:executor")
    local child, create_err = executor:exec("sh -c " .. quote(command))
    test.is_nil(create_err)
    test.not_nil(child)
    local started, start_err = child:start()
    test.is_nil(start_err)
    local stream = child:stdout_stream()
    local parts = {}
    while true do
        local chunk, err = stream:read()
        test.is_nil(err)
        if not chunk then break end
        parts[#parts + 1] = chunk
    end
    local status, wait_err = child:wait()
    executor:release()
    test.is_nil(wait_err)
    test.eq(status, expected_status or 0, command)
    return table.concat(parts)
end

local function with_directory(body)
    local directory = assert(env.get("WIPPY_TEST_ARTIFACTS")) .. "/bootstrap-" .. uuid.v7()
    run("mkdir -p " .. quote(directory))
    directory = run("cd " .. quote(directory) .. " && pwd -P"):gsub("\n$", "")
    local repository = run("cd " .. quote(assert(env.get("WIPPY_TEST_REPOSITORY"))) .. " && pwd -P"):gsub("\n$", "")
    local ok, err = pcall(body, directory, repository)
    run("rm -rf " .. quote(directory))
    if not ok then error(err) end
end

local function define_tests()
    test.describe("External test bootstrap", function()
        if not env.get("WIPPY_TEST_REPOSITORY") or not env.get("WIPPY_TEST_ARTIFACTS") then
            test.it_skip("requires the Unix Makefile bootstrap environment", function() end)
            return
        end
        test.it("preserves the previous SQLite contents before resetting the test database", function()
            with_directory(function(directory, repository)
                local database = directory .. "/test.db"
                run("sqlite3 " .. quote(database) .. " " .. quote("CREATE TABLE evidence(value TEXT); INSERT INTO evidence VALUES('preserved');"))
                local prepare = "bash " .. quote(repository .. "/scripts/prepare-test-db.sh") .. " " .. quote(database) .. " " .. quote(directory .. "/backups")
                run(prepare)
                local backup = run("find " .. quote(directory .. "/backups") .. " -name '*.sql'"):gsub("\n$", "")
                run("sqlite3 " .. quote(directory .. "/restored.db") .. " < " .. quote(backup))
                test.eq(run("sqlite3 " .. quote(directory .. "/restored.db") .. " 'SELECT value FROM evidence'"), "preserved\n")
                test.eq(run("sqlite3 " .. quote(database) .. " 'SELECT count(*) FROM sqlite_master'"), "0\n")
                run(prepare)
                local files = run("find " .. quote(directory .. "/backups") .. " -name '*.sql'")
                local count = 0
                for _ in files:gmatch("[^\n]+") do count = count + 1 end
                test.eq(count, 2, "A repeated reset must preserve both backups")
            end)
        end)
        test.it("prepares external dependencies while retaining the selected source bindings", function()
            with_directory(function(directory, repository)
                local prepare = "bash " .. quote(repository .. "/scripts/test-workspace.sh") .. " " .. quote(repository) .. " " .. quote(directory .. "/workspace")
                run(prepare)
                local locked = json.decode(run("cat " .. quote(directory .. "/workspace/.wippy.yaml")))
                test.eq(locked.workspace.replacements["wippy/session"], repository)
                test.is_nil(locked.workspace.replacements["wippy/agent"])
                run(prepare .. " " .. quote(repository))
                local candidate = json.decode(run("cat " .. quote(directory .. "/workspace/.wippy.yaml")))
                test.eq(candidate.workspace.replacements["wippy/agent"], repository .. "/src/agent/src")
                test.eq(candidate.workspace.replacements["wippy/llm"], repository .. "/src/llm/src")
                test.eq(candidate.workspace.replacements["wippy/test"], repository .. "/src/test")
                test.eq(candidate.registry.dependency_vendor_dir, directory .. "/workspace/modules/vendor")
                test.eq(candidate.registry.dependency_lock_path, directory .. "/workspace/wippy.lock")
            end)
        end)
        test.it("rejects workspace symlinks that point inside the repository", function()
            with_directory(function(directory, repository)
                local source = directory .. "/source"
                local alias = directory .. "/workspace-alias"
                run("mkdir -p " .. quote(source .. "/test"))
                run("cp " .. quote(repository .. "/test/wippy.lock") .. " " .. quote(source .. "/test/wippy.lock"))
                run("ln -s " .. quote(source) .. " " .. quote(alias))
                run("bash " .. quote(repository .. "/scripts/test-workspace.sh") .. " " .. quote(source) .. " " .. quote(alias), 1)
            end)
        end)
        test.it("requires the candidate runner for mandatory runtime checks", function()
            with_directory(function(directory, repository)
                for _, target in ipairs({ "test-runtime", "bench" }) do
                    run("make -s -C " .. quote(repository) .. " " .. target ..
                        " FRAMEWORK_DIR= WIPPY=true " .. quote("TEST_ARTIFACTS=" .. directory .. "/artifacts") ..
                        " " .. quote("TEST_BACKUP_DIR=" .. directory .. "/backups"), 2)
                end
            end)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
