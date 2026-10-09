return require('migration').define(function()
    migration('Add private bounded context staging transport', function()
        local function configure()
            up(function(db)
                local statements = {
                    [[CREATE TABLE context_stage_guard (id INTEGER PRIMARY KEY, serial INTEGER NOT NULL)]],
                    [[INSERT INTO context_stage_guard (id, serial) VALUES (1, 0)]],
                    [[CREATE TABLE context_stages (id TEXT PRIMARY KEY, actor_id TEXT NOT NULL, session_id TEXT NOT NULL, request_id TEXT NOT NULL, canonical_content TEXT NOT NULL, content_hash TEXT NOT NULL, content_bytes INTEGER NOT NULL, expires_at BIGINT NOT NULL, cancelled INTEGER NOT NULL DEFAULT 0, UNIQUE(actor_id, session_id, request_id))]],
                    [[CREATE INDEX idx_context_stages_expiry ON context_stages(expires_at)]],
                    [[CREATE INDEX idx_context_stages_actor ON context_stages(actor_id)]],
                    [[CREATE INDEX idx_context_stages_session ON context_stages(session_id)]],
                    [[ALTER TABLE messages ADD COLUMN context_receipt TEXT]],
                }
                for _, statement in ipairs(statements) do
                    local _, err = db:execute(statement)
                    if err then error(err) end
                end
            end)
            down(function(db)
                for _, statement in ipairs({
                    [[ALTER TABLE messages DROP COLUMN context_receipt]],
                    [[DROP TABLE context_stages]],
                    [[DROP TABLE context_stage_guard]],
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
