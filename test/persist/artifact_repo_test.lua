local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local json = require("json")
local artifact_repo = require("artifact_repo")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local time = require("time")
local security = require("security")
local consts = require("consts")
local wait_for_boot = require("wait_for_boot")

-- Insert an artifact directly via SQL (bypasses security.actor() requirement)
local function insert_artifact(db, artifact_id, session_id, user_id, kind, title, content, meta)
    local meta_json = nil
    if meta then
        local encoded, err = json.encode(meta)
        if not err then
            meta_json = encoded
        end
    end

    local now = time.now():format(time.RFC3339)
    db:execute(
        "INSERT INTO artifacts (artifact_id, session_id, user_id, kind, title, content, meta, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        { artifact_id, session_id, user_id, kind, title, content or "", meta_json, now, now }
    )
end

local function define_tests()
    describe("Artifact Repository", function()
        -- Test data
        local test_data = {
            user_id = uuid.v7(),
            context_id = uuid.v7(),
            session_id = uuid.v7(),
            artifact_id = uuid.v7(),
            artifact_id2 = uuid.v7()
        }
        local actor = security.actor()
        if actor then
            test_data.user_id = actor:id()
        end

        -- Setup test environment before all tests
        before_all(function()
            wait_for_boot.run()

            -- Create a test context
            local context, err = context_repo.create(
                test_data.context_id,
                "primary",
                "Test context data"
            )

            if err then
                error("Failed to create test context: " .. err)
            end

            -- Create a test session
            local session, err = session_repo.create(
                test_data.session_id,
                test_data.user_id,
                test_data.context_id,
                "Test Session",
                "test"
            )

            if err then
                error("Failed to create test session: " .. err)
            end

            -- Insert test artifacts directly via SQL
            local db_resource, _ = consts.get_db_resource()
            local db, err = sql.get(db_resource)
            if err then
                error("Failed to connect to database: " .. err)
            end

            insert_artifact(db, test_data.artifact_id, test_data.session_id,
                test_data.user_id, "static", "Test Artifact", "This is test artifact content", nil)

            local metadata = {
                content_type = "text/markdown",
                size = 1024,
                tags = {"test", "example"}
            }
            insert_artifact(db, test_data.artifact_id2, test_data.session_id,
                test_data.user_id, "dynamic", "Metadata Artifact", "Artifact with metadata", metadata)

            db:release()
        end)

        -- Clean up test data after all tests
        after_all(function()
            local db_resource, _ = consts.get_db_resource()
            local db, err = sql.get(db_resource)
            if err then
                error("Failed to connect to database: " .. err)
            end

            local tx, err = db:begin()
            if err then
                db:release()
                error("Failed to begin transaction: " .. err)
            end

            tx:execute("DELETE FROM artifacts WHERE session_id = $1", { test_data.session_id })
            tx:execute("DELETE FROM messages WHERE session_id = $1", { test_data.session_id })
            tx:execute("DELETE FROM session_contexts WHERE session_id = $1", { test_data.session_id })
            tx:execute("DELETE FROM sessions WHERE session_id = $1", { test_data.session_id })
            tx:execute("DELETE FROM contexts WHERE context_id = $1", { test_data.context_id })

            local success, err = tx:commit()
            if err then
                tx:rollback()
                db:release()
                error("Failed to commit cleanup transaction: " .. err)
            end

            db:release()
        end)

        it("should require authenticated user for create", function()
            -- Without security context, create should return auth error
            local has_actor = security.actor() ~= nil
            if not has_actor then
                local artifact, err = artifact_repo.create(
                    uuid.v7(),
                    test_data.session_id,
                    "static",
                    "title",
                    "content"
                )
                test.is_nil(artifact)
                test.contains(tostring(err), "No authenticated user found")
            end
        end)

        it("should get an artifact by ID", function()
            local artifact, err = artifact_repo.get(test_data.artifact_id)

            test.is_nil(err)
            test.not_nil(artifact)
            test.eq(artifact.artifact_id, test_data.artifact_id)
            test.eq(artifact.session_id, test_data.session_id)
            test.eq(artifact.kind, "static")
            test.eq(artifact.title, "Test Artifact")
            test.eq(artifact.content, "This is test artifact content")
        end)

        it("should parse metadata JSON when retrieving", function()
            local artifact, err = artifact_repo.get(test_data.artifact_id2)

            test.is_nil(err)
            test.not_nil(artifact)
            test.not_nil(artifact.meta)
            test.eq(artifact.meta.content_type, "text/markdown")
            test.eq(artifact.meta.size, 1024)
            test.eq(#artifact.meta.tags, 2)
            test.eq(artifact.meta.tags[1], "test")
        end)

        it("should list artifacts by session ID", function()
            local artifacts, err = artifact_repo.list_by_session(test_data.session_id)

            test.is_nil(err)
            test.not_nil(artifacts)
            test.eq(#artifacts, 2)
        end)

        it("should list artifacts by kind", function()
            local artifacts, err = artifact_repo.list_by_kind(test_data.session_id, "static")

            test.is_nil(err)
            test.not_nil(artifacts)
            test.eq(#artifacts, 1)
            assert(artifacts)
            test.eq(artifacts[1].kind, "static")

            artifacts, err = artifact_repo.list_by_kind(test_data.session_id, "dynamic")
            test.is_nil(err)
            test.not_nil(artifacts)
            assert(artifacts)
            test.eq(#artifacts, 1)
            test.eq(artifacts[1].kind, "dynamic")
        end)

        it("should update artifact metadata", function()
            local updates = {
                title = "Updated Artifact",
                meta = {
                    content_type = "text/html",
                    size = 2048,
                    tags = {"updated", "example"}
                }
            }

            local update_result, err = artifact_repo.update(test_data.artifact_id, updates)

            test.is_nil(err)
            test.not_nil(update_result)
            test.is_true(update_result.updated)

            -- Verify updates
            local artifact, err = artifact_repo.get(test_data.artifact_id)
            test.is_nil(err)
            test.eq(artifact.title, "Updated Artifact")
            test.eq(artifact.meta.content_type, "text/html")
            test.eq(artifact.meta.size, 2048)
            test.eq(#artifact.meta.tags, 2)
            test.eq(artifact.meta.tags[1], "updated")
        end)

        it("should update artifact content", function()
            local content = "This is updated content"
            local update_result, err = artifact_repo.update_content(test_data.artifact_id, content)

            test.is_nil(err)
            test.not_nil(update_result)
            test.is_true(update_result.updated)

            -- Verify content update
            local artifact_content, err = artifact_repo.get_content(test_data.artifact_id)
            test.is_nil(err)
            test.eq(artifact_content, content)
        end)

        it("should count artifacts in a session", function()
            local count, err = artifact_repo.count_by_session(test_data.session_id)

            test.is_nil(err)
            test.eq(count, 2)
        end)

        it("should count artifacts by kind", function()
            local count, err = artifact_repo.count_by_kind(test_data.session_id, "static")

            test.is_nil(err)
            test.eq(count, 1)

            count, err = artifact_repo.count_by_kind(test_data.session_id, "dynamic")
            test.is_nil(err)
            test.eq(count, 1)

            count, err = artifact_repo.count_by_kind(test_data.session_id, "nonexistent")
            test.is_nil(err)
            test.eq(count, 0)
        end)

        it("should delete an artifact", function()
            -- Verify we can get the artifact
            local artifact, err = artifact_repo.get(test_data.artifact_id)
            test.is_nil(err)
            test.not_nil(artifact)

            -- Delete it
            local result, err = artifact_repo.delete(test_data.artifact_id)

            test.is_nil(err)
            test.not_nil(result)
            test.is_true(result.deleted)

            -- Verify the deletion
            artifact, err = artifact_repo.get(test_data.artifact_id)
            test.is_nil(artifact)
            test.contains(tostring(err), "not found")

            -- Count should now be 1
            local count, err = artifact_repo.count_by_session(test_data.session_id)
            test.is_nil(err)
            test.eq(count, 1)
        end)

        it("should handle validation errors", function()
            -- Get with invalid ID
            local artifact, err = artifact_repo.get("")
            test.is_nil(artifact)
            test.contains(tostring(err), "Artifact ID is required")

            -- List by invalid session ID
            local artifacts, err = artifact_repo.list_by_session("")
            test.is_nil(artifacts)
            test.contains(tostring(err), "Session ID is required")

            -- Delete with invalid ID
            local result, err = artifact_repo.delete("")
            test.is_nil(result)
            test.contains(tostring(err), "Artifact ID is required")

            -- Delete non-existent artifact
            result, err = artifact_repo.delete(uuid.v7())
            test.is_nil(result)
            test.contains(tostring(err), "Artifact not found")

            -- Update with invalid ID
            result, err = artifact_repo.update("", { title = "x" })
            test.is_nil(result)
            test.contains(tostring(err), "Artifact ID is required")

            -- Update content with invalid ID
            result, err = artifact_repo.update_content("", "content")
            test.is_nil(result)
            test.contains(tostring(err), "Artifact ID is required")
        end)

        it("should list a user's artifacts with session scoping and cursor pagination", function()
            -- Self-contained fixtures: the shared artifacts are updated and deleted
            -- by earlier cases, so the catalog assertions own their rows outright.
            local owner_id = uuid.v7()
            local other_owner_id = uuid.v7()
            local session_a = uuid.v7()
            local session_b = uuid.v7()
            local first_id = uuid.v7()
            local second_id = uuid.v7()
            local third_id = uuid.v7()
            local foreign_id = uuid.v7()

            local db_resource, _ = consts.get_db_resource()
            local db, db_err = sql.get(db_resource)
            if db_err then
                error("Failed to connect to database: " .. db_err)
            end

            insert_artifact(db, first_id, session_a, owner_id, "static", "Catalog One",
                "first content", { content_type = "text/markdown", display_type = "standalone" })
            insert_artifact(db, second_id, session_a, owner_id, "static", "Catalog Two",
                "second content", { content_type = "text/html", display_type = "inline" })
            insert_artifact(db, third_id, session_b, owner_id, "dynamic", "Catalog Three",
                "third content", { content_type = "application/json" })
            insert_artifact(db, foreign_id, session_a, other_owner_id, "static", "Not Yours",
                "foreign content", nil)

            -- Everything this actor owns, across sessions.
            local page, err = artifact_repo.list_by_user(owner_id, nil, 50, nil)
            test.is_nil(err)
            test.not_nil(page)
            assert(page)
            test.eq(#page.artifacts, 3)
            test.eq(page.has_more, false)

            -- A row owned by another actor is never returned, even from a shared session.
            local by_id = {}
            for _, artifact in ipairs(page.artifacts) do
                by_id[artifact.artifact_id] = artifact
            end
            test.is_nil(by_id[foreign_id])
            test.not_nil(by_id[first_id])
            test.not_nil(by_id[second_id])
            test.not_nil(by_id[third_id])

            -- Metadata only: content bytes never reach the catalog.
            test.is_nil(by_id[first_id].content)
            test.eq(by_id[first_id].title, "Catalog One")
            test.eq(by_id[second_id].meta.display_type, "inline")
            test.eq(by_id[second_id].meta.content_type, "text/html")

            -- The optional session filter narrows the same actor-scoped query.
            local scoped, scoped_err = artifact_repo.list_by_user(owner_id, session_b, 50, nil)
            test.is_nil(scoped_err)
            assert(scoped)
            test.eq(#scoped.artifacts, 1)
            test.eq(scoped.artifacts[1].artifact_id, third_id)

            -- Keyset pagination walks every row exactly once, with no gaps.
            local seen = {}
            local seen_count = 0
            local cursor = nil
            local pages = 0
            repeat
                local chunk, chunk_err = artifact_repo.list_by_user(owner_id, nil, 1, cursor)
                test.is_nil(chunk_err)
                assert(chunk)
                for _, artifact in ipairs(chunk.artifacts) do
                    test.is_nil(seen[artifact.artifact_id])
                    seen[artifact.artifact_id] = true
                    seen_count = seen_count + 1
                    cursor = artifact.artifact_id
                end
                pages = pages + 1
            until not chunk.has_more or pages > 10
            test.eq(seen_count, 3)
            test.eq(pages, 3)

            -- An unknown cursor is rejected rather than silently restarting page one.
            local invalid, invalid_err = artifact_repo.list_by_user(owner_id, nil, 50, uuid.v7())
            test.is_nil(invalid)
            test.contains(tostring(invalid_err), "Invalid artifact cursor")

            -- A cursor naming another actor's row is out of scope, so it is invalid too.
            local stolen, stolen_err = artifact_repo.list_by_user(owner_id, nil, 50, foreign_id)
            test.is_nil(stolen)
            test.contains(tostring(stolen_err), "Invalid artifact cursor")

            local missing, missing_err = artifact_repo.list_by_user("", nil, 50, nil)
            test.is_nil(missing)
            test.contains(tostring(missing_err), "User ID is required")

            db:execute("DELETE FROM artifacts WHERE session_id = $1 OR session_id = $2",
                { session_a, session_b })
            db:release()
        end)

        describe("update: meta_patch, meta_remove, expected_version, content_version", function()
            local function fresh_artifact(kind: string?, meta: {[string]: any}?)
                local id = uuid.v7()
                local db_resource, _ = consts.get_db_resource()
                local db, db_err = sql.get(db_resource)
                if db_err then error("Failed to connect to database: " .. db_err) end
                insert_artifact(db, id, test_data.session_id, test_data.user_id,
                    kind or "static", "Patch Target", "v1", meta)
                db:release()
                return id
            end

            it("meta_patch sets keys without wiping unrelated ones", function()
                local id = fresh_artifact("static", {
                    display_type = "standalone",
                    page_id = "page-1",
                    preview = "a preview",
                })

                local result, err = artifact_repo.update(id, {
                    meta_patch = { status = "active", icon = "star" }
                })
                test.is_nil(err)
                test.not_nil(result)
                assert(result)
                test.is_true(result.updated)

                local artifact, get_err = artifact_repo.get(id)
                test.is_nil(get_err)
                test.eq(artifact.meta.status, "active")
                test.eq(artifact.meta.icon, "star")
                -- Untouched by this patch - must survive.
                test.eq(artifact.meta.display_type, "standalone")
                test.eq(artifact.meta.page_id, "page-1")
                test.eq(artifact.meta.preview, "a preview")
            end)

            it("meta_remove deletes only the named keys", function()
                local id = fresh_artifact("static", {
                    display_type = "standalone",
                    status = "active",
                    icon = "star",
                })

                local result, err = artifact_repo.update(id, {
                    meta_remove = { "status", "icon" }
                })
                test.is_nil(err)
                test.not_nil(result)

                local artifact, get_err = artifact_repo.get(id)
                test.is_nil(get_err)
                test.is_nil(artifact.meta.status)
                test.is_nil(artifact.meta.icon)
                test.eq(artifact.meta.display_type, "standalone")
            end)

            it("rejects meta combined with meta_patch or meta_remove", function()
                local id = fresh_artifact("static", {})

                local result, err = artifact_repo.update(id, {
                    meta = { status = "active" },
                    meta_patch = { icon = "star" }
                })
                test.is_nil(result)
                test.contains(tostring(err), "Cannot combine meta")
            end)

            it("bumps content_version only when content changes", function()
                local id = fresh_artifact("static", { status = "idle" })

                local title_result, title_err = artifact_repo.update(id, { title = "Renamed" })
                test.is_nil(title_err)
                assert(title_result)
                test.eq(title_result.content_version, 1)

                local meta_result, meta_err = artifact_repo.update(id, { meta_patch = { status = "active" } })
                test.is_nil(meta_err)
                assert(meta_result)
                test.eq(meta_result.content_version, 1)

                local content_result, content_err = artifact_repo.update(id, { content = "v2" })
                test.is_nil(content_err)
                assert(content_result)
                test.eq(content_result.content_version, 2)

                local artifact, get_err = artifact_repo.get(id)
                test.is_nil(get_err)
                test.eq(artifact.content_version, 2)
                test.eq(artifact.title, "Renamed")
                test.eq(artifact.meta.status, "active")
            end)

            it("a stale expected_version is reported as CONFLICT with current_version", function()
                local id = fresh_artifact("static", {})

                -- Advances content_version to 2.
                local bumped, bump_err = artifact_repo.update(id, { content = "v2" })
                test.is_nil(bump_err)
                assert(bumped)
                test.eq(bumped.content_version, 2)

                -- Still claims version 1 - stale.
                local result, err = artifact_repo.update(id, { content = "v3" }, { expected_version = 1 })
                test.is_nil(result)
                test.not_nil(err)
                local conflict_err = err :: any
                test.eq(conflict_err:kind(), errors.CONFLICT)
                local details = conflict_err:details()
                test.eq(details.current_version, 2)

                -- The right version succeeds.
                local ok, ok_err = artifact_repo.update(id, { content = "v3" }, { expected_version = 2 })
                test.is_nil(ok_err)
                assert(ok)
                test.eq(ok.content_version, 3)
            end)

            it("a missing artifact is reported as NOT_FOUND", function()
                local result, err = artifact_repo.update(uuid.v7(), { title = "x" })
                test.is_nil(result)
                test.not_nil(err)
                local not_found_err = err :: any
                test.eq(not_found_err:kind(), errors.NOT_FOUND)
            end)

            it("list_by_session, list_by_kind, and list_by_user all surface content_version", function()
                local id = fresh_artifact("static", {})
                local bumped, bump_err = artifact_repo.update(id, { content = "v2" })
                test.is_nil(bump_err)
                assert(bumped)

                local by_session, session_err = artifact_repo.list_by_session(test_data.session_id)
                test.is_nil(session_err)
                local found_session = nil
                for _, artifact in ipairs(by_session) do
                    if artifact.artifact_id == id then found_session = artifact end
                end
                test.not_nil(found_session)
                assert(found_session)
                test.eq(found_session.content_version, 2)

                local by_kind, kind_err = artifact_repo.list_by_kind(test_data.session_id, "static")
                test.is_nil(kind_err)
                local found_kind = nil
                for _, artifact in ipairs(by_kind) do
                    if artifact.artifact_id == id then found_kind = artifact end
                end
                test.not_nil(found_kind)
                assert(found_kind)
                test.eq(found_kind.content_version, 2)

                local by_user, user_err = artifact_repo.list_by_user(test_data.user_id, test_data.session_id, 50, nil)
                test.is_nil(user_err)
                assert(by_user)
                local found_user = nil
                for _, artifact in ipairs(by_user.artifacts) do
                    if artifact.artifact_id == id then found_user = artifact end
                end
                test.not_nil(found_user)
                assert(found_user)
                test.eq(found_user.content_version, 2)
            end)

            local function raw_meta(id)
                local db, db_err = sql.get(consts.get_db_resource())
                if not db then error(db_err) end
                local rows, query_err = db:query("SELECT meta FROM artifacts WHERE artifact_id = $1", { id })
                db:release()
                test.is_nil(query_err)
                return rows[1] and rows[1].meta
            end

            local function set_raw_meta(id, meta)
                local db, db_err = sql.get(consts.get_db_resource())
                if not db then error(db_err) end
                local _, exec_err = db:execute("UPDATE artifacts SET meta = $1 WHERE artifact_id = $2", { meta, id })
                db:release()
                test.is_nil(exec_err)
            end

            it("keeps a key another writer set between the meta read and the write", function()
                local id = fresh_artifact("static", { display_type = "inline" })
                local interleaved = 0
                local original = artifact_repo._on_meta_read
                -- Runs on the same connection, after update() read the meta
                -- and before it writes: stands in for a concurrent writer
                -- that commits in that window.
                artifact_repo._on_meta_read = function(conn, artifact_id)
                    if artifact_id ~= id or interleaved > 0 then return end
                    interleaved = interleaved + 1
                    local _, exec_err = sql.builder.update("artifacts")
                        :set("meta", '{"display_type":"inline","other":"kept"}')
                        :where("artifact_id = ?", artifact_id)
                        :run_with(conn):exec()
                    test.is_nil(exec_err)
                end
                local result, err = artifact_repo.update(id, { meta_patch = { status = "active" } })
                artifact_repo._on_meta_read = original

                test.is_nil(err)
                test.not_nil(result)
                test.eq(interleaved, 1)
                local artifact: any = artifact_repo.get(id)
                test.eq(artifact.meta.status, "active")
                test.eq(artifact.meta.other, "kept")
                test.eq(artifact.meta.display_type, "inline")
            end)

            it("refuses to patch stored meta that is not valid JSON and leaves it unchanged", function()
                local id = fresh_artifact("static", nil)
                set_raw_meta(id, "{broken")

                local result, err = artifact_repo.update(id, { meta_patch = { status = "active" } })
                test.is_nil(result)
                test.contains(tostring(err), "meta")
                test.eq(raw_meta(id), "{broken")

                local removed, remove_err = artifact_repo.update(id, { meta_remove = { "status" } })
                test.is_nil(removed)
                test.not_nil(remove_err)
                test.eq(raw_meta(id), "{broken")
            end)

            it("keeps empty objects in untouched keys and stores an emptied meta as an object", function()
                local id = fresh_artifact("static", nil)
                set_raw_meta(id, '{"keep":{},"list":[],"session_form":{"submission":{"answers":{}}}}')
                local _, err = artifact_repo.update(id, { meta_patch = { status = "idle" } })
                test.is_nil(err)
                local stored = tostring(raw_meta(id))
                test.contains(stored, '"keep":{}')
                test.contains(stored, '"list":[]')
                test.contains(stored, '"answers":{}')

                local emptied = fresh_artifact("static", { only = "key" })
                local _, remove_err = artifact_repo.update(emptied, { meta_remove = { "only" } })
                test.is_nil(remove_err)
                test.eq(raw_meta(emptied), "{}")

                local was_null = fresh_artifact("static", nil)
                local _, null_err = artifact_repo.update(was_null, { meta_remove = { "absent" } })
                test.is_nil(null_err)
                test.eq(raw_meta(was_null), "{}")
            end)

            it("meta_patch keeps working for inline and view_ref artifacts", function()
                local inline_id = fresh_artifact("inline", { display_type = "inline" })
                local inline_result, inline_err = artifact_repo.update(inline_id, {
                    meta_patch = { status = "active" }
                })
                test.is_nil(inline_err)
                assert(inline_result)
                local inline_artifact, inline_get_err = artifact_repo.get(inline_id)
                test.is_nil(inline_get_err)
                test.eq(inline_artifact.meta.status, "active")
                test.eq(inline_artifact.meta.display_type, "inline")

                local view_ref_id = fresh_artifact("view_ref", {
                    page_id = "page-42", display_type = "standalone"
                })
                local view_ref_result, view_ref_err = artifact_repo.update(view_ref_id, {
                    meta_patch = { preview = "a preview" }
                })
                test.is_nil(view_ref_err)
                assert(view_ref_result)
                local view_ref_artifact, view_ref_get_err = artifact_repo.get(view_ref_id)
                test.is_nil(view_ref_get_err)
                test.eq(view_ref_artifact.meta.preview, "a preview")
                test.eq(view_ref_artifact.meta.page_id, "page-42")
                test.eq(view_ref_artifact.meta.display_type, "standalone")
            end)
        end)
    end)
end

return test.run_cases(define_tests)
