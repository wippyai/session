return require("migration").define(function()
    migration("Add content_version to artifacts table", function()
        -- content_version is already declared on the artifact API response type and was
        -- returned as a hardcoded literal 1, with no column behind it. This adds the
        -- storage so the value can be real and monotonic.
        --
        -- Both arms use a plain ADD COLUMN with a non-null default: unlike migration 09,
        -- no table recreation is needed because nothing about the existing columns,
        -- constraints or indexes changes. Existing rows therefore keep their data and
        -- receive content_version = 1, which matches the value the API previously
        -- reported for them.
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([[
                    ALTER TABLE artifacts
                    ADD COLUMN content_version INTEGER NOT NULL DEFAULT 1
                ]])
                if err then
                    error(err)
                end
            end)

            down(function(db)
                local _, err = db:execute([[
                    ALTER TABLE artifacts
                    DROP COLUMN content_version
                ]])
                if err then
                    error(err)
                end
            end)
        end)

        database("sqlite", function()
            up(function(db)
                -- SQLite supports ADD COLUMN provided the column is either nullable or
                -- carries a non-null default, which this one does.
                local _, err = db:execute([[
                    ALTER TABLE artifacts
                    ADD COLUMN content_version INTEGER NOT NULL DEFAULT 1
                ]])
                if err then
                    error(err)
                end
            end)

            down(function(db)
                -- DROP COLUMN requires SQLite 3.35 or newer. If the runtime ships an
                -- older build this fails loudly rather than leaving the column behind
                -- while reporting success.
                local _, err = db:execute([[
                    ALTER TABLE artifacts
                    DROP COLUMN content_version
                ]])
                if err then
                    error(err)
                end
            end)
        end)
    end)
end)
