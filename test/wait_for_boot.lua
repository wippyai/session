local sql = require("sql")
local time = require("time")
local security = require("security")
local encryption_key_bootloader = require("encryption_key_bootloader")
local migration_bootloader = require("migration_bootloader")

local bootloaders_started = false

-- Newer Bootloader releases run migrations before the test entrypoint.
-- Supply the external user-table contract before Session's PostgreSQL DDL.
local function prepare_postgres_dependencies()
    local db = assert(sql.get("app:db"))
    local _, err
    if db:type() == "postgres" then
        _, err = db:execute("CREATE TABLE IF NOT EXISTS app_users (user_id TEXT PRIMARY KEY)")
    end
    db:release()
    if err then error(err) end
    return {status = "success", message = "Session test user-table contract is ready"}
end

local function call_bootloader(module, options)
    if type(module) == "function" then
        return module(options)
    end
    if type(module) == "table" and type(module.run) == "function" then
        return module.run(options)
    end
    error("bootloader import is not callable")
end

local function run_setup_bootloaders()
    if bootloaders_started then
        return
    end

    -- Session references the application's user table. Supply only that
    -- external contract in the disposable PostgreSQL harness.
    local db = assert(sql.get("app:db"))
    if db:type() == "postgres" then
        local _, create_err = db:execute("CREATE TABLE IF NOT EXISTS app_users (user_id TEXT PRIMARY KEY)")
        if create_err then db:release(); error(create_err) end
        local _, seed_err = db:execute("INSERT INTO app_users (user_id) VALUES ($1) ON CONFLICT DO NOTHING",
            {security.actor():id()})
        if seed_err then db:release(); error(seed_err) end
    end
    db:release()

    local key_result = call_bootloader(encryption_key_bootloader, {})
    if type(key_result) ~= "table" or key_result.status == "error" then
        error("encryption key bootloader failed: " .. tostring(key_result and key_result.message or key_result))
    end

    local migration_result = call_bootloader(migration_bootloader, {})
    if type(migration_result) ~= "table" or migration_result.status == "error" then
        error("migration bootloader failed: " .. tostring(migration_result and migration_result.message or migration_result))
    end
    bootloaders_started = true
end

local function run()
    run_setup_bootloaders()

    local max_attempts = 40
    local sleep_ms = 100

    for attempt = 1, max_attempts do
        local db, err = sql.get("app:db")
        if not err then
            local _, query_err = db:query("SELECT context_id FROM contexts LIMIT 0")
            db:release()

            if not query_err then
                return true
            end
        end

        time.sleep(sleep_ms .. "ms")
    end

    error("bootloader did not complete within " .. (max_attempts * sleep_ms) .. "ms")
end

return { run = run, prepare_postgres_dependencies = prepare_postgres_dependencies }
