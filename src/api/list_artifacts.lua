local http = require("http")
local security = require("security")
local artifact_repo = require("artifact_repo")

local function bad_request(res, message)
    res:set_status(http.STATUS.BAD_REQUEST)
    res:write_json({ success = false, error = message })
end

local function is_uuid(value)
    if type(value) ~= "string" or #value ~= 36 then return false end
    local a, b, c, d, e = value:match("^(%x+)%-(%x+)%-(%x+)%-(%x+)%-(%x+)$")
    return a ~= nil and #a == 8 and #b == 4 and #c == 4 and #d == 4 and #e == 12
end

local function parse_cursor(raw)
    if not raw or raw == "" then return nil, nil end
    if #raw > 64 then return nil, "Invalid artifact cursor" end
    local artifact_id = raw:match("^v1:(.+)$")
    if not is_uuid(artifact_id) then return nil, "Invalid artifact cursor" end
    return artifact_id, nil
end

local function public_artifact(row)
    local meta = type(row.meta) == "table" and row.meta or {}
    return {
        uuid = row.artifact_id,
        artifact_id = row.artifact_id,
        session_id = row.session_id,
        kind = row.kind,
        title = row.title,
        created_at = row.created_at,
        updated_at = row.updated_at,
        display_type = meta.display_type,
        content_type = meta.content_type,
        description = meta.description,
        preview = meta.preview,
        icon = meta.icon,
        status = meta.status,
    }
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "Failed to get HTTP context" end

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "Authentication required" })
        return
    end

    local raw_limit = req:query("limit")
    local limit = 50
    if raw_limit and raw_limit ~= "" then
        if not raw_limit:match("^%d+$") then
            bad_request(res, "Limit must be an integer from 1 to 100")
            return
        end
        limit = tonumber(raw_limit)
        if not limit or limit < 1 or limit > 100 then
            bad_request(res, "Limit must be an integer from 1 to 100")
            return
        end
    end

    local session_id = req:query("session_id")
    if session_id == "" then session_id = nil end
    if session_id and #session_id > 128 then
        bad_request(res, "Invalid session ID")
        return
    end

    local cursor_artifact_id, cursor_err = parse_cursor(req:query("cursor"))
    if cursor_err then
        bad_request(res, cursor_err)
        return
    end

    local result, err = artifact_repo.list_by_user(
        actor:id(),
        session_id,
        limit,
        cursor_artifact_id
    )
    if err then
        if err == "Invalid artifact cursor" then
            bad_request(res, err)
            return
        end
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = err })
        return
    end

    local artifacts = {}
    for _, row in ipairs(result.artifacts or {}) do
        artifacts[#artifacts + 1] = public_artifact(row)
    end

    local next_cursor = nil
    if result.has_more and #result.artifacts > 0 then
        local last = result.artifacts[#result.artifacts]
        next_cursor = "v1:" .. tostring(last.artifact_id)
    end

    res:set_content_type(http.CONTENT.JSON)
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        count = #artifacts,
        artifacts = artifacts,
        pagination = { has_more = result.has_more == true, next_cursor = next_cursor },
    })
end

return { handler = handler }
