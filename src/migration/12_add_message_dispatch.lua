return require('migration').define(function()
    migration('Add private authenticated root-turn dispatch recovery', function()
        local function configure()
            up(function(db)
                for _, statement in ipairs({
                    [[CREATE TABLE session_dispatch_owners (session_id TEXT PRIMARY KEY, actor_id TEXT NOT NULL, worker_id TEXT, generation BIGINT NOT NULL DEFAULT 0, next_sequence BIGINT NOT NULL DEFAULT 0, lease_expires_at BIGINT NOT NULL DEFAULT 0, updated_at TEXT NOT NULL)]],
                    [[CREATE TABLE message_dispatches (dispatch_id TEXT PRIMARY KEY, message_id TEXT NOT NULL UNIQUE, session_id TEXT NOT NULL, actor_id TEXT NOT NULL, request_id TEXT, queue_sequence BIGINT NOT NULL, state TEXT NOT NULL, generation BIGINT NOT NULL DEFAULT 0, revision BIGINT NOT NULL DEFAULT 1, worker_id TEXT, response_id TEXT NOT NULL, config_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, started_at TEXT, finished_at TEXT, terminal_code TEXT, UNIQUE(session_id, queue_sequence))]],
                    [[CREATE INDEX idx_message_dispatches_queue ON message_dispatches(session_id, state, queue_sequence)]],
                    [[CREATE INDEX idx_dispatch_owner_expiry ON session_dispatch_owners(lease_expires_at)]],
                    [[ALTER TABLE messages ADD COLUMN root_dispatch_id TEXT]],
                    [[CREATE INDEX idx_messages_root_dispatch ON messages(root_dispatch_id)]],
                }) do
                    local _, err = db:execute(statement)
                    if err then error(err) end
                end
            end)
            down(function(db)
                for _, statement in ipairs({ [[DROP INDEX idx_messages_root_dispatch]],
                    [[ALTER TABLE messages DROP COLUMN root_dispatch_id]], [[DROP TABLE message_dispatches]],
                    [[DROP TABLE session_dispatch_owners]] }) do
                    local _, err = db:execute(statement)
                    if err then error(err) end
                end
            end)
        end
        database('postgres', configure)
        database('sqlite', configure)
    end)
end)
