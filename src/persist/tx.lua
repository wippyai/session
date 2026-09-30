local sql = require("sql")
local consts = require("consts")

-- Shared transaction helper for the persist layer.
--
-- tx.run(fn) opens a new transaction on the session database resource, calls
-- fn(dbtx) under pcall, commits when fn succeeds and rolls back when it fails
-- (either fn raises, or fn returns a non-nil error as its second value). The
-- connection is always released, on every path. Callers follow the ordinary
-- Lua (result, err) convention inside fn: return the value(s) to hand back to
-- tx.run's caller, or (nil, err) to abort and roll back.
--
-- Repos that need to participate in a transaction started by someone else
-- (e.g. a caller-supplied opts.tx) do not go through this helper at all -
-- they run their statements directly on the given transaction and leave
-- begin/commit/rollback/release to whoever owns it.
--
-- Inside fn every repository call must pass opts.tx = dbtx. A call without it
-- would take a second pooled connection: it would not see the transaction's
-- uncommitted rows, and when the pool has a single connection it would wait
-- forever for the one fn holds. So while fn runs, the same coroutine gets an
-- error instead from a nested tx.run and from tx.connect.
local tx = {}

local OUTSIDE_ONLY = "inside tx.run without opts.tx: pass the open transaction as opts.tx"

-- Coroutines whose fn is running inside tx.run.
local active = {}

local function current()
    return coroutine.running() or "main"
end

-- Whether the calling coroutine is inside tx.run.
function tx.active()
    return active[current()] == true
end

-- A pooled connection for a repository call that runs outside a transaction.
-- The caller releases it.
function tx.connect()
    if tx.active() then
        return nil, "Repository call " .. OUTSIDE_ONLY
    end
    local db, err = sql.get(consts.get_db_resource())
    if err then
        return nil, "Failed to connect to database: " .. err
    end
    return db
end

function tx.run(fn)
    if tx.active() then
        return nil, "Nested tx.run " .. OUTSIDE_ONLY
    end

    local db_resource = consts.get_db_resource()
    local db, connect_err = sql.get(db_resource)
    if connect_err then
        return nil, "Failed to connect to database: " .. connect_err
    end

    local dbtx, begin_err = db:begin()
    if begin_err then
        db:release()
        return nil, "Failed to begin transaction: " .. begin_err
    end

    local key = current()
    active[key] = true
    local ok, result, fn_err = pcall(fn, dbtx)
    active[key] = nil

    if not ok then
        dbtx:rollback()
        db:release()
        error(result, 0)
    end

    if fn_err ~= nil then
        dbtx:rollback()
        db:release()
        return nil, fn_err
    end

    local _, commit_err = dbtx:commit()
    if commit_err then
        dbtx:rollback()
        db:release()
        return nil, "Failed to commit transaction: " .. commit_err
    end

    db:release()
    return result
end

return tx
