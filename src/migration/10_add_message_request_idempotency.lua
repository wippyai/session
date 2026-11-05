return require("migration").define(function()
    migration("Add durable message request idempotency", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute("ALTER TABLE messages ADD COLUMN request_id TEXT")
                if err then
                    error(err)
                end
                _, err = db:execute("ALTER TABLE messages ADD COLUMN request_hash TEXT")
                if err then
                    error(err)
                end
                _, err = db:execute("CREATE UNIQUE INDEX idx_messages_session_request ON messages(session_id, request_id) WHERE request_id IS NOT NULL")
                if err then
                    error(err)
                end
            end)

            down(function(db)
                local _, err = db:execute("DROP INDEX IF EXISTS idx_messages_session_request")
                if err then
                    error(err)
                end
                _, err = db:execute("ALTER TABLE messages DROP COLUMN request_hash")
                if err then
                    error(err)
                end
                _, err = db:execute("ALTER TABLE messages DROP COLUMN request_id")
                if err then
                    error(err)
                end
            end)
        end)

        database("sqlite", function()
            up(function(db)
                local _, err = db:execute("ALTER TABLE messages ADD COLUMN request_id TEXT")
                if err then
                    error(err)
                end
                _, err = db:execute("ALTER TABLE messages ADD COLUMN request_hash TEXT")
                if err then
                    error(err)
                end
                _, err = db:execute("CREATE UNIQUE INDEX idx_messages_session_request ON messages(session_id, request_id) WHERE request_id IS NOT NULL")
                if err then
                    error(err)
                end
            end)

            down(function(db)
                local _, err = db:execute("DROP INDEX IF EXISTS idx_messages_session_request")
                if err then
                    error(err)
                end
                _, err = db:execute("ALTER TABLE messages DROP COLUMN request_hash")
                if err then
                    error(err)
                end
                _, err = db:execute("ALTER TABLE messages DROP COLUMN request_id")
                if err then
                    error(err)
                end
            end)
        end)
    end)
end)
