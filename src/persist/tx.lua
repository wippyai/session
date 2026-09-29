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
local tx = {}

function tx.run(fn)
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

    local ok, result, fn_err = pcall(fn, dbtx)

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
