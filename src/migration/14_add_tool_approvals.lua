-- Tool approval store (EE2-2710). Additive: four new tables and three new
-- session columns; no existing row changes. The SQL is the same on PostgreSQL
-- and SQLite (TEXT, BIGINT, no foreign keys): session_repo.delete removes the
-- rows explicitly, as it does for the other dependent tables. Timestamps are
-- RFC3339 text in UTC. JSON values are text.
--
-- The decision column for a denial is `deny_then`, because THEN is a reserved
-- word in SQL. approval_repo reads it back as `then`.
local STATEMENTS = {
    [[CREATE TABLE session_tool_approvals (
        approval_id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        batch_id TEXT NOT NULL,
        tool_message_id TEXT NOT NULL,
        row_type TEXT NOT NULL,
        call_id TEXT NOT NULL,
        registry_id TEXT NOT NULL,
        fingerprint TEXT,
        target_agent_id TEXT,
        intent_digest TEXT NOT NULL,
        display TEXT NOT NULL,
        offered TEXT,
        denial_key TEXT,
        state TEXT NOT NULL,
        decided_via TEXT,
        deny_then TEXT,
        reason TEXT,
        grant_id TEXT,
        disposition TEXT,
        disposition_reason TEXT,
        revision BIGINT NOT NULL DEFAULT 1,
        requested_at TEXT NOT NULL,
        expires_at TEXT,
        decided_at TEXT,
        decided_by TEXT
    )]],
    [[CREATE INDEX idx_tool_approvals_session_state ON session_tool_approvals(session_id, state)]],
    -- One approval record per call row.
    [[CREATE UNIQUE INDEX idx_tool_approvals_session_message ON session_tool_approvals(session_id, tool_message_id)]],
    [[CREATE INDEX idx_tool_approvals_session_batch ON session_tool_approvals(session_id, batch_id)]],

    [[CREATE TABLE session_tool_approval_batches (
        batch_id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        members TEXT NOT NULL,
        turn_id TEXT,
        state TEXT NOT NULL,
        close_reason TEXT,
        controls TEXT NOT NULL DEFAULT 'kept',
        revision BIGINT NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        closed_at TEXT,
        released_at TEXT
    )]],
    [[CREATE INDEX idx_tool_approval_batches_session_state ON session_tool_approval_batches(session_id, state)]],

    [[CREATE TABLE session_tool_approval_grants (
        grant_id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        epoch TEXT NOT NULL,
        scope TEXT NOT NULL,
        registry_id TEXT,
        fingerprint TEXT,
        target_agent_id TEXT,
        manifest TEXT,
        status TEXT NOT NULL,
        suspension_reason TEXT,
        source_approval_id TEXT,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        revoked_by TEXT,
        revoked_at TEXT,
        revision BIGINT NOT NULL DEFAULT 1
    )]],
    [[CREATE INDEX idx_tool_approval_grants_session_status ON session_tool_approval_grants(session_id, status)]],

    [[CREATE TABLE session_command_receipts (
        owner_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        request_id TEXT NOT NULL,
        body_hash TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (owner_id, session_id, request_id)
    )]],
    -- session_repo.delete removes receipts by session; the key starts with owner_id.
    [[CREATE INDEX idx_session_command_receipts_session ON session_command_receipts(session_id)]],

    [[ALTER TABLE sessions ADD COLUMN activity TEXT]],
    [[ALTER TABLE sessions ADD COLUMN activity_revision BIGINT NOT NULL DEFAULT 0]],
    [[ALTER TABLE sessions ADD COLUMN approval_turn_fence TEXT]],
}

local DOWN = {
    [[ALTER TABLE sessions DROP COLUMN approval_turn_fence]],
    [[ALTER TABLE sessions DROP COLUMN activity_revision]],
    [[ALTER TABLE sessions DROP COLUMN activity]],
    [[DROP INDEX IF EXISTS idx_session_command_receipts_session]],
    [[DROP TABLE IF EXISTS session_command_receipts]],
    [[DROP INDEX IF EXISTS idx_tool_approval_grants_session_status]],
    [[DROP TABLE IF EXISTS session_tool_approval_grants]],
    [[DROP INDEX IF EXISTS idx_tool_approval_batches_session_state]],
    [[DROP TABLE IF EXISTS session_tool_approval_batches]],
    [[DROP INDEX IF EXISTS idx_tool_approvals_session_batch]],
    [[DROP INDEX IF EXISTS idx_tool_approvals_session_message]],
    [[DROP INDEX IF EXISTS idx_tool_approvals_session_state]],
    [[DROP TABLE IF EXISTS session_tool_approvals]],
}

return require('migration').define(function()
    migration('Add the tool approval store', function()
        local function configure()
            up(function(db)
                for _, statement in ipairs(STATEMENTS) do
                    local _, err = db:execute(statement)
                    if err then error(err) end
                end
            end)
            down(function(db)
                for _, statement in ipairs(DOWN) do
                    local _, err = db:execute(statement)
                    if err then error(err) end
                end
            end)
        end
        database('postgres', configure)
        database('sqlite', configure)
    end)
end)
