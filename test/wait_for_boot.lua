local sql = require("sql")
local time = require("time")
local security = require("security")
local encryption_key_bootloader = require("encryption_key_bootloader")
local migration_bootloader = require("migration_bootloader")

local bootloaders_started = false
local users_provisioned = false

-- Sessions and artifacts reference app_users on PostgreSQL, a table the host
-- application owns, while the SQLite test database does not enforce the
-- foreign keys. Most suites invent their own user ids, so a BEFORE INSERT
-- trigger registers the user a row names. The foreign keys stay defined and
-- enforced; their check runs after the trigger. The harness only. The DDL
-- runs under an advisory lock because test processes start in parallel.
local PROVISION_USERS = {
    [[CREATE OR REPLACE FUNCTION session_test_provision_user() RETURNS trigger AS $body$
      BEGIN
        IF NEW.user_id IS NOT NULL THEN
          INSERT INTO app_users (user_id) VALUES (NEW.user_id) ON CONFLICT DO NOTHING;
        END IF;
        RETURN NEW;
      END;
      $body$ LANGUAGE plpgsql]],
    "DROP TRIGGER IF EXISTS session_test_provision_user ON sessions",
    [[CREATE TRIGGER session_test_provision_user BEFORE INSERT ON sessions
      FOR EACH ROW EXECUTE FUNCTION session_test_provision_user()]],
    "DROP TRIGGER IF EXISTS session_test_provision_user ON artifacts",
    [[CREATE TRIGGER session_test_provision_user BEFORE INSERT ON artifacts
      FOR EACH ROW EXECUTE FUNCTION session_test_provision_user()]],
}

-- Returns true when no provisioning is needed or it is done, false while the
-- tables the triggers sit on are not migrated yet.
local function provision_test_users()
    if users_provisioned then return true end
    local db = assert(sql.get("app:db"))
    if db:type() == "postgres" then
        local _, probe_err = db:query("SELECT user_id FROM artifacts LIMIT 0")
        if probe_err then db:release(); return false end
        local transaction, begin_err = db:begin()
        if begin_err then db:release(); error(begin_err) end
        local _, lock_err = transaction:execute("SELECT pg_advisory_xact_lock(7316002)")
        local failure = lock_err
        if not failure then
            for _, statement in ipairs(PROVISION_USERS) do
                local _, statement_err = transaction:execute(statement)
                if statement_err then failure = statement_err; break end
            end
        end
        if failure then
            transaction:rollback()
            db:release()
            error(failure)
        end
        local _, commit_err = transaction:commit()
        if commit_err then transaction:rollback(); db:release(); error(commit_err) end
    end
    db:release()
    users_provisioned = true
    return true
end

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

            if not query_err and provision_test_users() then
                return true
            end
        end

        time.sleep(sleep_ms .. "ms")
    end

    error("bootloader did not complete within " .. (max_attempts * sleep_ms) .. "ms")
end

return { run = run, prepare_postgres_dependencies = prepare_postgres_dependencies }
