local message_order = require("message_order")

return require("migration").define(function()
    migration("Index precise SQLite message chronology", function()
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute("CREATE INDEX idx_messages_chronology ON messages(session_id, "
                    .. message_order.SQLITE_DATE .. ", message_id)")
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP INDEX IF EXISTS idx_messages_chronology")
                if err then error(err) end
            end)
        end)
        database("postgres", function()
            up(function(_db) end)
            down(function(_db) end)
        end)
    end)
end)
