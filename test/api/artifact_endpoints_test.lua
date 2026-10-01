local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local time = require("time")
local security = require("security")
local consts = require("consts")
local session_repo = require("session_repo")
local context_repo = require("context_repo")
local artifact_access = require("artifact_access")
local wait_for_boot = require("wait_for_boot")

-- GET /artifact/{id} and GET /artifact/{id}/content, driven through
-- artifact_access (their request handling after authentication) with a fake
-- request and response on the real database. Both answer another user's
-- artifact exactly like a missing one (404, same body), so neither tells a
-- caller that a foreign id exists. The owner still gets the artifact.

local function fake_exchange(artifact_id: string)
    local req = {
        param = function(_self, name)
            if name == "id" then return artifact_id end
            return nil
        end,
        query_params = function() return {} end,
    }
    local res = { status = nil :: number?, body = nil :: string?, content_type = nil :: string? }
    function res:set_status(status) self.status = status end
    function res:set_content_type(content_type) self.content_type = content_type end
    function res:set_header() end
    function res:write_json(value) self.body = value end
    function res:write(value) self.body = value end
    return req, res
end

local function call(serve: any, artifact_id: string, user_id: string)
    local req, res = fake_exchange(artifact_id)
    serve(req, res, user_id)
    return res.status, res.body
end

-- A JSON body as "key=value" pairs in key order, to compare two bodies.
local function canonical(body: any): string
    if type(body) ~= "table" then return tostring(body) end
    local keys = {}
    for key in pairs(body) do table.insert(keys, tostring(key)) end
    table.sort(keys)
    local parts = {}
    for _, key in ipairs(keys) do table.insert(parts, key .. "=" .. tostring(body[key])) end
    return table.concat(parts, ";")
end

local function insert_artifact(db, artifact_id, session_id, user_id, content)
    local now = time.now():format(time.RFC3339)
    local _, err = db:execute(
        "INSERT INTO artifacts (artifact_id, session_id, user_id, kind, title, content, meta, created_at, updated_at) "
            .. "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        { artifact_id, session_id, user_id, "inline", "Notes", content,
            json.encode({ content_type = "text/plain" }), now, now })
    if err then error(err) end
end

local function define_tests()
    describe("artifact endpoints for another user's artifact", function()
        local owner_id = ""
        local fixture = {} :: any

        before_all(function()
            wait_for_boot.run()
            local actor = security.actor()
            owner_id = actor and actor:id() or ""
            fixture = {
                owner_session = uuid.v7(), owner_context = uuid.v7(),
                other_session = uuid.v7(), other_context = uuid.v7(),
                owned = uuid.v7(), foreign = uuid.v7(), orphaned = uuid.v7(),
                other_user = "other-user-" .. uuid.v7(),
            }
            context_repo.create(fixture.owner_context, "primary", "{}")
            context_repo.create(fixture.other_context, "primary", "{}")
            session_repo.create(fixture.owner_session, owner_id, fixture.owner_context, "Mine", "test")
            session_repo.create(fixture.other_session, fixture.other_user, fixture.other_context, "Theirs", "test")
            local db, err = sql.get(consts.get_db_resource())
            if err then error(err) end
            insert_artifact(db, fixture.owned, fixture.owner_session, owner_id, "owner text")
            insert_artifact(db, fixture.foreign, fixture.other_session, fixture.other_user, "their text")
            -- Stored with this user's id, in a session that belongs to someone else.
            insert_artifact(db, fixture.orphaned, fixture.other_session, owner_id, "odd text")
            db:release()
        end)

        after_all(function()
            local db, err = sql.get(consts.get_db_resource())
            if err then error(err) end
            for _, id in ipairs({ fixture.owned, fixture.foreign, fixture.orphaned }) do
                db:execute("DELETE FROM artifacts WHERE artifact_id = $1", { id })
            end
            for _, id in ipairs({ fixture.owner_session, fixture.other_session }) do
                db:execute("DELETE FROM sessions WHERE session_id = $1", { id })
            end
            for _, id in ipairs({ fixture.owner_context, fixture.other_context }) do
                db:execute("DELETE FROM contexts WHERE context_id = $1", { id })
            end
            db:release()
        end)

        for _, endpoint in ipairs({
            { name = "GET /artifact/{id}", serve = artifact_access.serve_metadata },
            { name = "GET /artifact/{id}/content", serve = artifact_access.serve_content },
        }) do
            it(endpoint.name .. " answers a foreign id exactly like a missing one", function()
                local missing_status, missing_body = call(endpoint.serve, uuid.v7(), owner_id)
                test.eq(missing_status, 404)

                local cases = {
                    { label = "another user's artifact", id = fixture.foreign, user = owner_id },
                    { label = "an artifact in another user's session", id = fixture.orphaned, user = owner_id },
                    { label = "this user's artifact asked by someone else", id = fixture.owned, user = fixture.other_user },
                }
                for _, case in ipairs(cases) do
                    local status, body = call(endpoint.serve, tostring(case.id), tostring(case.user))
                    test.eq(status, 404, case.label)
                    test.eq(canonical(body), canonical(missing_body), case.label .. ": same body as a missing id")
                end
                test.eq(canonical(missing_body), "error=Artifact not found;success=false",
                    "a generic body, without the id")
            end)
        end

        it("still serves the owner", function()
            local status, body: any = call(artifact_access.serve_metadata, tostring(fixture.owned), owner_id)
            test.eq(status, 200)
            test.eq(body.uuid, fixture.owned)

            local content_status, content = call(artifact_access.serve_content, tostring(fixture.owned), owner_id)
            test.eq(content_status, 200)
            test.eq(content, "owner text")
        end)
    end)
end

return test.run_cases(define_tests)
