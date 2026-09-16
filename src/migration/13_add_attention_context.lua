return require('migration').define(function()
    migration('Add per-session Attention context state', function()
        local function configure()
            up(function(db)
                local _, err = db:execute([[ALTER TABLE sessions
                    ADD COLUMN attention_enabled BOOLEAN NOT NULL DEFAULT FALSE]])
                if err then error(err) end
                _, err = db:execute([[ALTER TABLE sessions
                    ADD COLUMN attention_revision BIGINT NOT NULL DEFAULT 0]])
                if err then error(err) end
                _, err = db:execute([[ALTER TABLE sessions
                    ADD COLUMN attention_updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP]])
                if err then error(err) end
                _, err = db:execute([[ALTER TABLE sessions
                    ADD COLUMN attention_updated_by TEXT NOT NULL DEFAULT 'system']])
                if err then error(err) end
            end)
            down(function(db)
                for _, statement in ipairs({
                    'ALTER TABLE sessions DROP COLUMN attention_updated_by',
                    'ALTER TABLE sessions DROP COLUMN attention_updated_at',
                    'ALTER TABLE sessions DROP COLUMN attention_revision',
                    'ALTER TABLE sessions DROP COLUMN attention_enabled',
                }) do
                    local _, err = db:execute(statement)
                    if err then error(err) end
                end
            end)
        end
        database('postgres', configure)
        database('sqlite', configure)
    end)
end)
