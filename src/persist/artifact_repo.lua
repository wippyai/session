local sql = require("sql")
local json = require("json")
local time = require("time")
local security = require("security")
local tx = require("tx")

type Artifact = {
    artifact_id: string,
    session_id: string?,
    user_id: string,
    kind: string,
    title: string,
    content: string?,
    meta: {[string]: any}?,
    created_at: string,
    updated_at: string,
}

type ArtifactUpdates = {
    kind: string?,
    title: string?,
    content: string?,
    meta: {[string]: any}?,
}

local artifact_repo = {}

-- Get a database connection (refused inside tx.run; see tx.connect)
local function get_db()
    return tx.connect()
end

-- Runs fn(conn) on opts.tx when the caller supplies a transaction (no
-- acquire/release), otherwise on a pooled connection released afterwards.
local function with_connection(opts: any, fn: (any) -> (any, any)): (any, any)
    if opts and opts.tx then
        return fn(opts.tx)
    end
    local db, err = get_db()
    if err then
        return nil, err
    end
    local result, fn_err = fn(db)
    db:release()
    return result, fn_err
end

-- Create a new artifact.
--
-- opts.tx (optional): run the session lookup and the insert on this
-- caller-supplied transaction; do not acquire or release a connection.
function artifact_repo.create(artifact_id, session_id, kind, title, content, meta, opts)
    session_id = session_id or nil

    if not artifact_id or artifact_id == "" then
        return nil, "Artifact ID is required"
    end
    if not kind or kind == "" then
        return nil, "Artifact kind is required"
    end

    local actor = security.actor()
    if not actor then
        return nil, "No authenticated user found"
    end

    local user_id

    local meta_json = nil
    if meta then
        if type(meta) == "table" then
            local encoded, err = json.encode(meta)
            if err then
                return nil, "Failed to encode meta: " .. err
            end
            meta_json = encoded
        else
            meta_json = meta
        end
    end

    local now = time.now():utc():format(time.RFC3339)

    local _, write_err = with_connection(opts, function(conn)
        if session_id and session_id ~= "" then
            local check_query = sql.builder.select("session_id", "user_id")
                :from("sessions")
                :where("session_id = ?", session_id)

            local sessions, err = check_query:run_with(conn):query()
            if err then
                return nil, "Failed to check if session exists: " .. err
            end

            if #sessions == 0 then
                return nil, "Session not found"
            end

            user_id = sessions[1].user_id
        else
            user_id = actor:id()
        end

        local insert_query = sql.builder.insert("artifacts")
            :set_map({
                artifact_id = artifact_id,
                session_id = session_id,
                user_id = user_id,
                kind = kind,
                title = title or "",
                content = content or "",
                meta = meta_json or sql.as.null(),
                created_at = now,
                updated_at = now
            })

        local _, err = insert_query:run_with(conn):exec()
        if err then
            return nil, "Failed to create artifact: " .. err
        end
        return true
    end)
    if write_err then
        return nil, write_err
    end

    return {
        artifact_id = artifact_id,
        session_id = session_id,
        user_id = user_id,
        kind = kind,
        title = title,
        created_at = now,
        updated_at = now
    }
end

-- One artifact row on `conn` with its meta decoded; nil without an error
-- when there is none.
local function read_artifact(conn: any, artifact_id: string): (any, string?)
    local rows, query_err = sql.builder.select("artifact_id", "session_id", "user_id", "kind", "title", "content", "meta", "created_at", "updated_at", "content_version")
        :from("artifacts")
        :where("artifact_id = ?", artifact_id)
        :limit(1)
        :run_with(conn):query()
    if query_err then
        return nil, "Failed to get artifact: " .. query_err
    end
    if #rows == 0 then
        return nil, nil
    end

    local artifact = rows[1]

    -- Parse meta JSON if it exists
    if artifact.meta and artifact.meta ~= "" then
        local decoded, err = json.decode(artifact.meta :: string)
        if not err then
            artifact.meta = decoded
        end
    end

    return artifact
end

local function not_found(artifact_id)
    return errors.new({
        kind = errors.NOT_FOUND,
        message = "Artifact not found",
        details = { artifact_id = artifact_id },
    })
end

-- The artifact `artifact_id`, or nil without an error when there is none.
--
-- opts.tx (optional): read on this caller-supplied transaction.
function artifact_repo.find(artifact_id, opts)
    if not artifact_id or artifact_id == "" then
        return nil, "Artifact ID is required"
    end
    return with_connection(opts, function(conn)
        return read_artifact(conn, artifact_id)
    end)
end

-- Get an artifact by ID.
--
-- opts.tx (optional): read on this caller-supplied transaction.
function artifact_repo.get(artifact_id, opts)
    local artifact, err = artifact_repo.find(artifact_id, opts)
    if err then
        return nil, err
    end
    if not artifact then
        return nil, "Artifact not found"
    end
    return artifact
end

-- The artifact when `user_id` owns it: the artifact is the user's, and so is
-- its session when it has one. A missing artifact, another user's artifact
-- and an artifact whose session is gone or belongs to someone else are all
-- one NOT_FOUND error (artifact_repo.is_not_found), so a caller that answers
-- them alike tells nobody that a foreign id exists. Any other error is a
-- storage failure.
--
-- opts.tx (optional): read on this caller-supplied transaction.
function artifact_repo.get_owned(user_id, artifact_id, opts)
    if not artifact_id or artifact_id == "" then
        return nil, "Artifact ID is required"
    end

    return with_connection(opts, function(conn)
        local artifact, err = read_artifact(conn, artifact_id)
        if err then return nil, err end
        if not artifact or artifact.user_id ~= user_id then return nil, not_found(artifact_id) end
        if type(artifact.session_id) == "string" and artifact.session_id ~= "" then
            local sessions, session_err = sql.builder.select("session_id")
                :from("sessions")
                :where(sql.builder.and_({
                    sql.builder.expr("session_id = ?", artifact.session_id),
                    sql.builder.expr("user_id = ?", user_id),
                }))
                :limit(1)
                :run_with(conn):query()
            if session_err then return nil, "Failed to check the artifact's session: " .. session_err end
            if #sessions == 0 then return nil, not_found(artifact_id) end
        end
        return artifact
    end)
end

local function has_kind(err: any, kind: string): boolean
    if err == nil or type(err) == "string" then return false end
    local ok, actual = pcall(function() return err:kind() end)
    return ok and actual == kind
end

-- Whether `err` is the NOT_FOUND error get_owned and update return.
function artifact_repo.is_not_found(err: any): boolean
    return has_kind(err, errors.NOT_FOUND)
end

-- Whether `err` is the CONFLICT error update returns for a stale
-- expected_version, or for a meta that kept changing during a patch.
function artifact_repo.is_conflict(err: any): boolean
    return has_kind(err, errors.CONFLICT)
end

-- Conditional writes a meta patch makes before it reports a conflict. Each
-- attempt that loses to another writer re-reads the meta and merges again.
local META_PATCH_ATTEMPTS = 5

-- Test seam: when set, called as fn(conn, artifact_id) after a meta patch
-- has read the current meta and before its conditional write.
artifact_repo._on_meta_read = nil :: any

-- The stored meta text of an artifact and its decoded object. Returns
-- (raw, object), or (nil, nil, err) when the row is missing or the stored
-- value is not a JSON object: patching it would wipe every key.
local function read_meta(conn, artifact_id)
    local rows, err = sql.builder.select("meta")
        :from("artifacts")
        :where("artifact_id = ?", artifact_id)
        :limit(1)
        :run_with(conn):query()
    if err then
        return nil, nil, "Failed to read current meta: " .. err
    end
    if #rows == 0 then
        return nil, nil, not_found(artifact_id)
    end

    local raw = rows[1].meta
    if raw == nil or raw == "" then
        return raw, {}
    end
    local decoded, decode_err = json.decode(raw :: string)
    if decode_err or type(decoded) ~= "table" or #decoded > 0 then
        return nil, nil, "Stored artifact meta is not a JSON object; not patching it"
    end
    return raw, decoded
end

-- Update artifact.
--
-- opts (optional):
--   tx               - run on this caller-supplied transaction; no own
--                       begin/commit/release. Lets a caller combine this
--                       update with other writes atomically.
--   expected_version  - require content_version to still equal this value
--                       (adds "AND content_version = ?"); a mismatch or a
--                       deleted row is reported as CONFLICT/NOT_FOUND.
--
-- updates.meta replaces the whole meta object. updates.meta_patch (table)
-- sets individual keys, read-merge-write against the current meta on the
-- same connection/transaction. The write is conditional on the meta still
-- being the text that was read, so a patch never drops a key another writer
-- set in between; on a lost race it reads and merges again. Stored meta that
-- is not a JSON object is an error, not an empty object. meta may not be
-- combined with meta_patch.
--
-- Returns { artifact_id, updated = true, content_version } on success, read
-- back on the same connection so the caller always has the value it produced
-- (not a value a concurrent writer could have since moved past).
function artifact_repo.update(artifact_id, updates, opts)
    if not artifact_id or artifact_id == "" then
        return nil, "Artifact ID is required"
    end

    if not updates or type(updates) ~= "table" then
        return nil, "Updates must be a table"
    end

    if updates.meta ~= nil and updates.meta_patch ~= nil then
        return nil, "Cannot combine meta with meta_patch"
    end

    opts = opts or {}

    local patching = updates.meta_patch ~= nil

    -- A full replace is encoded once; a patch is merged on every attempt.
    local replace_value = nil
    if updates.meta ~= nil then
        if type(updates.meta) == "table" then
            local encoded, encode_err = json.encode(updates.meta)
            if encode_err then
                return nil, "Failed to encode meta: " .. encode_err
            end
            replace_value = encoded
        else
            replace_value = updates.meta
        end
    end

    local function read_back(conn)
        local final_rows, final_err = sql.builder.select("content_version")
            :from("artifacts")
            :where("artifact_id = ?", artifact_id)
            :limit(1)
            :run_with(conn):query()
        if final_err then
            return nil, "Failed to read updated artifact: " .. final_err
        end
        return {
            artifact_id = artifact_id,
            updated = true,
            content_version = final_rows[1].content_version,
        }
    end

    -- One conditional write. Returns (result, err, retry): retry is true when
    -- only the meta changed since it was read.
    local function attempt(conn)
        local meta_value = replace_value
        local read_raw = nil
        if patching then
            local raw, current_meta, read_err = read_meta(conn, artifact_id)
            if read_err then return nil, read_err end
            read_raw = raw
            if artifact_repo._on_meta_read then artifact_repo._on_meta_read(conn, artifact_id) end

            for k, v in pairs(updates.meta_patch) do
                current_meta[k] = v
            end

            if next(current_meta) == nil then
                -- An empty meta is still an object.
                meta_value = "{}"
            else
                local encoded, encode_err = json.encode(current_meta)
                if encode_err then
                    return nil, "Failed to encode meta: " .. encode_err
                end
                meta_value = encoded
            end
        end

        -- Build the update query
        local update_query = sql.builder.update("artifacts")

        if updates.kind ~= nil then
            update_query = update_query:set("kind", updates.kind)
        end

        if updates.title ~= nil then
            update_query = update_query:set("title", updates.title)
        end

        if updates.content ~= nil then
            update_query = update_query:set("content", updates.content)
            -- Bumped here as well as in update_content, because this is the path the session
            -- flow actually uses: control_handlers -> writer:update_artifact -> update().
            -- Bumped only when the content changes; a title or meta edit is not a new version
            -- of the content and must not invalidate a cached body.
            update_query = update_query:set("content_version", sql.builder.expr("content_version + 1"))
        end

        if meta_value ~= nil then
            update_query = update_query:set("meta", meta_value)
        end

        -- Always update the updated_at timestamp
        update_query = update_query:set("updated_at", time.now():utc():format(time.RFC3339))

        -- Add where clause - the conditional update is the CAS winner check
        -- when a caller supplies expected_version, and the lost-update guard
        -- for a meta patch.
        local where_filters = { sql.builder.expr("artifact_id = ?", artifact_id) }
        if opts.expected_version ~= nil then
            table.insert(where_filters, sql.builder.expr("content_version = ?", opts.expected_version))
        end
        if patching then
            if read_raw == nil then
                table.insert(where_filters, sql.builder.expr("meta IS NULL"))
            else
                table.insert(where_filters, sql.builder.expr("meta = ?", read_raw))
            end
        end
        update_query = update_query:where(sql.builder.and_(where_filters))

        -- Execute the query
        local result, exec_err = update_query:run_with(conn):exec()
        if exec_err then
            return nil, "Failed to update artifact: " .. exec_err
        end

        if result.rows_affected > 0 then
            return read_back(conn)
        end

        -- Read once, here, to tell NOT_FOUND, a stale expected_version
        -- (CONFLICT) and a meta changed since it was read (retry) apart.
        local state_rows, state_err = sql.builder.select("artifact_id", "content_version", "meta")
            :from("artifacts")
            :where("artifact_id = ?", artifact_id)
            :limit(1)
            :run_with(conn):query()
        if state_err then
            return nil, "Failed to verify artifact state: " .. state_err
        end

        if #state_rows == 0 then
            return nil, not_found(artifact_id)
        end

        local state = state_rows[1]
        if opts.expected_version ~= nil and state.content_version ~= opts.expected_version then
            return nil, errors.new({
                kind = errors.CONFLICT,
                message = "Artifact was modified by another update",
                details = { artifact_id = artifact_id, current_version = state.content_version },
            })
        end
        if patching and state.meta ~= read_raw then
            return nil, nil, true
        end

        -- The row matched but the driver counted no change (some report
        -- changed rows, not matched rows).
        return read_back(conn)
    end

    local function run_update(conn)
        if patching then
            -- The first statement of a patch is a write, not the meta read.
            -- On SQLite a transaction that reads first holds a snapshot, and
            -- when another connection commits before this one writes, the
            -- write fails with "database is locked" (test/persist/
            -- artifact_repo_test.lua reproduces it). Taking the write lock first makes
            -- other writers wait for this commit, as on PostgreSQL, where it
            -- is the row lock. The row is rewritten with its own meta, so
            -- nothing changes if the update then fails or finds no row.
            local _, lock_err = sql.builder.update("artifacts")
                :set("meta", sql.builder.expr("meta"))
                :where("artifact_id = ?", artifact_id)
                :run_with(conn):exec()
            if lock_err then
                return nil, "Failed to lock artifact: " .. tostring(lock_err)
            end
        end
        for _ = 1, META_PATCH_ATTEMPTS do
            local result, err, retry = attempt(conn)
            if not retry then return result, err end
        end
        return nil, errors.new({
            kind = errors.CONFLICT,
            message = "Artifact meta kept changing during the update",
            details = { artifact_id = artifact_id },
        })
    end

    if opts.tx then
        return run_update(opts.tx)
    end

    -- Own transaction: the meta read-merge-write, the conditional UPDATE and the
    -- version read-back must be atomic, or a concurrent writer could lose a meta
    -- key or make this call report a version it did not produce.
    return tx.run(run_update)
end

-- List artifacts by session ID
function artifact_repo.list_by_session(session_id, limit, offset)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    -- Build the SELECT query
    local query = sql.builder.select("artifact_id", "session_id", "user_id", "kind", "title", "meta", "created_at", "updated_at", "content_version")
        :from("artifacts")
        :where("session_id = ?", session_id)
        :order_by("created_at DESC")

    -- Add limit and offset if provided
    if limit and limit > 0 then
        query = query:limit(limit)
        if offset and offset > 0 then
            query = query:offset(offset)
        end
    end

    -- Execute the query
    local executor = query:run_with(db)
    local artifacts, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to list artifacts: " .. err
    end

    -- Parse meta JSON if it exists
    for i, artifact in ipairs(artifacts) do
        if artifact.meta and artifact.meta ~= "" then
            local decoded, err = json.decode(artifact.meta :: string)
            if not err then
                artifact.meta = decoded
            end
        end
    end

    return artifacts
end

-- List metadata-only artifacts owned by a user. The optional session filter is
-- applied inside the same actor-scoped query. Cursor pagination uses the stable
-- (created_at, artifact_id) ordering so concurrent inserts cannot shift rows
-- between pages. Cursors carry only an opaque artifact id; the timestamp is
-- resolved inside the same actor/session scope instead of trusting client data.
function artifact_repo.list_by_user(user_id, session_id, limit, cursor_artifact_id)
    if not user_id or user_id == "" then
        return nil, "User ID is required"
    end

    limit = limit or 50
    if limit < 1 then limit = 1 end

    local db, err = get_db()
    if err then return nil, err end

    local cursor_created_at = nil
    if cursor_artifact_id then
        local cursor_filters = {
            sql.builder.expr("user_id = ?", user_id),
            sql.builder.expr("artifact_id = ?", cursor_artifact_id),
        }
        if session_id and session_id ~= "" then
            cursor_filters[#cursor_filters + 1] = sql.builder.expr("session_id = ?", session_id)
        end
        local cursor_query = sql.builder.select("created_at", "artifact_id")
            :from("artifacts")
            :where(sql.builder.and_(cursor_filters))
            :limit(1)
        local cursor_rows, cursor_err = cursor_query:run_with(db):query()
        if cursor_err then
            db:release()
            return nil, "Failed to resolve artifact cursor: " .. cursor_err
        end
        if #cursor_rows == 0 then
            db:release()
            return nil, "Invalid artifact cursor"
        end
        cursor_created_at = cursor_rows[1].created_at
    end

    local filters = { sql.builder.expr("user_id = ?", user_id) }
    if session_id and session_id ~= "" then
        filters[#filters + 1] = sql.builder.expr("session_id = ?", session_id)
    end
    if cursor_created_at and cursor_artifact_id then
        filters[#filters + 1] = sql.builder.expr(
            "(created_at < ? OR (created_at = ? AND artifact_id < ?))",
            cursor_created_at,
            cursor_created_at,
            cursor_artifact_id
        )
    end

    local query = sql.builder.select(
            "artifact_id", "session_id", "kind", "title", "meta", "created_at", "updated_at", "content_version"
        )
        :from("artifacts")
        :where(sql.builder.and_(filters))
        :order_by("created_at DESC, artifact_id DESC")
        :limit(limit + 1)

    local artifacts, query_err = query:run_with(db):query()
    db:release()
    if query_err then return nil, "Failed to list user artifacts: " .. query_err end

    local has_more = #artifacts > limit
    if has_more then table.remove(artifacts) end
    for _, artifact in ipairs(artifacts) do
        if artifact.meta and artifact.meta ~= "" then
            local decoded, decode_err = json.decode(artifact.meta :: string)
            artifact.meta = decode_err and {} or decoded
        elseif not artifact.meta then
            artifact.meta = {}
        end
    end

    return { artifacts = artifacts, has_more = has_more }
end

-- List artifacts by kind
function artifact_repo.list_by_kind(session_id, kind, limit, offset)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end

    if not kind or kind == "" then
        return nil, "Artifact kind is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    -- Build the SELECT query
    local query = sql.builder.select("artifact_id", "session_id", "user_id", "kind", "title", "meta", "created_at", "updated_at", "content_version")
        :from("artifacts")
        :where(sql.builder.and_({
            sql.builder.expr("session_id = ?", session_id),
            sql.builder.expr("kind = ?", kind)
        }))
        :order_by("created_at DESC")

    -- Add limit and offset if provided
    if limit and limit > 0 then
        query = query:limit(limit)
        if offset and offset > 0 then
            query = query:offset(offset)
        end
    end

    -- Execute the query
    local executor = query:run_with(db)
    local artifacts, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to list artifacts by kind: " .. err
    end

    -- Parse meta JSON if it exists
    for i, artifact in ipairs(artifacts) do
        if artifact.meta and artifact.meta ~= "" then
            local decoded, err = json.decode(artifact.meta :: string)
            if not err then
                artifact.meta = decoded
            end
        end
    end

    return artifacts
end

-- Get artifact content
function artifact_repo.get_content(artifact_id)
    if not artifact_id or artifact_id == "" then
        return nil, "Artifact ID is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    -- Build the SELECT query
    local query = sql.builder.select("content")
        :from("artifacts")
        :where("artifact_id = ?", artifact_id)
        :limit(1)

    -- Execute the query
    local executor = query:run_with(db)
    local results, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to get artifact content: " .. err
    end

    if #results == 0 then
        return nil, "Artifact not found"
    end

    return results[1].content
end

-- Update artifact content. Delegates to update(), which bumps content_version.
function artifact_repo.update_content(artifact_id, content)
    if not artifact_id or artifact_id == "" then
        return nil, "Artifact ID is required"
    end

    if content == nil then
        return nil, "Content is required"
    end

    return artifact_repo.update(artifact_id, { content = content })
end

-- Delete an artifact
function artifact_repo.delete(artifact_id)
    if not artifact_id or artifact_id == "" then
        return nil, "Artifact ID is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    -- Check if artifact exists
    local check_query = sql.builder.select("artifact_id")
        :from("artifacts")
        :where("artifact_id = ?", artifact_id)

    local check_executor = check_query:run_with(db)
    local artifacts, err = check_executor:query()

    if err then
        db:release()
        return nil, "Failed to check if artifact exists: " .. err
    end

    if #artifacts == 0 then
        db:release()
        return nil, "Artifact not found"
    end

    -- Build the DELETE query
    local delete_query = sql.builder.delete("artifacts")
        :where("artifact_id = ?", artifact_id)

    -- Execute the query
    local delete_executor = delete_query:run_with(db)
    local result, err = delete_executor:exec()

    db:release()

    if err then
        return nil, "Failed to delete artifact: " .. err
    end

    return { deleted = true }
end

-- Count artifacts in a session
function artifact_repo.count_by_session(session_id)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    local query = sql.builder.select("COUNT(*) as count")
        :from("artifacts")
        :where("session_id = ?", session_id)

    -- Execute the query
    local executor = query:run_with(db)
    local result, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to count artifacts: " .. err
    end

    return result[1].count
end

-- Count artifacts by kind in a session
function artifact_repo.count_by_kind(session_id, kind)
    if not session_id or session_id == "" then
        return nil, "Session ID is required"
    end

    if not kind or kind == "" then
        return nil, "Artifact kind is required"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    local query = sql.builder.select("COUNT(*) as count")
        :from("artifacts")
        :where(sql.builder.and_({
            sql.builder.expr("session_id = ?", session_id),
            sql.builder.expr("kind = ?", kind)
        }))

    -- Execute the query
    local executor = query:run_with(db)
    local result, err = executor:query()

    db:release()

    if err then
        return nil, "Failed to count artifacts by kind: " .. err
    end

    return result[1].count
end

return artifact_repo
