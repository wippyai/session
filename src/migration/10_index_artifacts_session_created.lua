return require("migration").define(function()
    migration("Add artifacts session+created index", function()
        -- list_by_session filters session_id (indexed single-column) and orders by
        -- created_at DESC, forcing a per-session sort. Composite (session_id,
        -- created_at DESC) serves both.
        database("postgres", function()
            up(function(db)
                db:execute("CREATE INDEX IF NOT EXISTS idx_artifacts_session_created ON artifacts(session_id, created_at DESC)")
            end)
            down(function(db)
                db:execute("DROP INDEX IF EXISTS idx_artifacts_session_created")
            end)
        end)

        database("sqlite", function()
            up(function(db)
                db:execute("CREATE INDEX IF NOT EXISTS idx_artifacts_session_created ON artifacts(session_id, created_at DESC)")
            end)
            down(function(db)
                db:execute("DROP INDEX IF EXISTS idx_artifacts_session_created")
            end)
        end)
    end)
end)
