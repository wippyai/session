local test = require("test")
local json = require("json")
local registry = require("registry")
local fs = require("fs")

-- docs/tool-approval-protocol.md ends with a fixture index: one table row per
-- fixture file, with the keys and value types that file must have. This suite
-- reads the document (through the app.approval:docs volume) and the fixtures
-- (inlined into the registry entry app.approval:protocol_fixtures at load
-- time) and checks one against the other, so a change to either one without
-- the other fails here.

local SOURCE = "app.approval:protocol_fixtures"
local DOCS = "app.approval:docs"
local DOCUMENT = "/tool-approval-protocol.md"
local INDEX_HEADING = "## 12. Fixture index"
local ROW_PATTERN = "^| `([%w_]+%.json)` | [^|]+ | `([^`]+)` |%s*$"

local function load_source()
    local entry, err = registry.get(SOURCE)
    if not entry then error("Missing " .. SOURCE .. ": " .. tostring(err)) end
    local volume, volume_err = fs.get(DOCS)
    if not volume then error("Missing " .. DOCS .. ": " .. tostring(volume_err)) end
    local document, read_err = volume:readfile(DOCUMENT)
    if not document then error("Cannot read " .. DOCUMENT .. ": " .. tostring(read_err)) end
    return { document = document, fixtures = entry.data.fixtures }
end

-- Rows of the fixture index: { file, rules = { "path:type" | "path=value", ... } }.
local function index_rows(document: string)
    local rows = {}
    local in_index = false
    for line in (document .. "\n"):gmatch("([^\n]*)\n") do
        line = line:gsub("\r$", "")
        if line == INDEX_HEADING then
            in_index = true
        elseif in_index and line:match("^## ") then
            break
        elseif in_index then
            local file, rules = line:match(ROW_PATTERN)
            if file then
                local list = {}
                for rule in rules:gmatch("%S+") do list[#list + 1] = rule end
                rows[#rows + 1] = { file = file, rules = list }
            end
        end
    end
    return rows
end

local function decode_fixture(raw: any)
    if type(raw) == "table" then return raw end
    local decoded, err = json.decode(tostring(raw))
    if err then return nil, err end
    return decoded
end

local function resolve(value: any, path: string)
    local current = value
    for segment in path:gmatch("[^%.]+") do
        if type(current) ~= "table" then return nil end
        local index = tonumber(segment)
        if index then current = current[index] else current = current[segment] end
    end
    return current
end

local function is_array(value: any): boolean
    if type(value) ~= "table" then return false end
    for key in pairs(value) do
        if type(key) ~= "number" then return false end
    end
    return true
end

local function has_type(value: any, kind: string, raw: string, path: string): boolean
    if kind == "string" then return type(value) == "string" end
    if kind == "number" then return type(value) == "number" end
    if kind == "integer" then return type(value) == "number" and value % 1 == 0 end
    if kind == "boolean" then return type(value) == "boolean" end
    if kind == "array" then return is_array(value) end
    if kind == "object" then
        if type(value) ~= "table" then return false end
        return next(value) == nil or not is_array(value)
    end
    if kind == "null" then
        -- JSON null decodes to nil, which an absent key also gives; the raw
        -- text must name the key with a null value.
        local key = path:match("([^%.]+)$")
        return value == nil and raw:find('"' .. key .. '"%s*:%s*null') ~= nil
    end
    error("Unknown type in the fixture index: " .. kind)
end

-- Checks one fixture against its rules. Returns a list of problems.
local function check_fixture(raw: string, fixture: any, rules: {string})
    local problems = {}
    for _, rule in ipairs(rules) do
        local path, expected = rule:match("^([^:=]+)=(.+)$")
        if path then
            local actual = resolve(fixture, path)
            if tostring(actual) ~= expected then
                problems[#problems + 1] = path .. " is " .. tostring(actual) .. ", expected " .. expected
            end
        else
            local type_path, kinds = rule:match("^([^:=]+):(.+)$")
            if not type_path then error("Malformed rule in the fixture index: " .. rule) end
            local actual = resolve(fixture, type_path)
            local matched = false
            for kind in kinds:gmatch("[^/]+") do
                if has_type(actual, kind, raw, type_path) then matched = true end
            end
            if not matched then
                problems[#problems + 1] = type_path .. " is not " .. kinds
            end
        end
    end
    return problems
end

local function define_tests()
    describe("Tool approval protocol fixtures", function()
        it("lists every fixture in the document and nothing else", function()
            local source = load_source()
            test.eq(type(source.document), "string", "the document is inlined")
            local rows = index_rows(source.document)
            test.is_true(#rows >= 20, "fixture index rows parsed: " .. #rows)

            local listed = {}
            for _, row in ipairs(rows) do
                test.is_nil(listed[row.file], "listed once: " .. row.file)
                listed[row.file] = true
                test.not_nil(source.fixtures[row.file], "fixture file registered: " .. row.file)
            end
            for file in pairs(source.fixtures) do
                test.is_true(listed[file] == true, "fixture listed in the document: " .. file)
            end
        end)

        it("gives every fixture the keys and types the document requires", function()
            local source = load_source()
            local checked = 0
            for _, row in ipairs(index_rows(source.document)) do
                local raw = source.fixtures[row.file]
                local fixture, err = decode_fixture(raw)
                test.is_nil(err, "valid JSON: " .. row.file)
                local problems = check_fixture(tostring(raw), fixture, row.rules)
                test.eq(#problems, 0, row.file .. ": " .. table.concat(problems, "; "))
                checked = checked + 1
            end
            test.eq(checked, 24)
        end)

        it("reports a fixture that drops a required key or changes a value", function()
            local raw = '{"type":"tool_approval","approval":{"state":"approved","revision":"1"}}'
            local fixture = assert(decode_fixture(raw))
            local problems = check_fixture(raw, fixture, {
                "type=tool_approval", "approval.state=pending", "approval.revision:integer",
                "message_id:string", "approval.grant_id:null",
            })
            test.eq(#problems, 4, table.concat(problems, "; "))
        end)

        it("never names a client request_id in a state event", function()
            local source = load_source()
            for _, file in ipairs({ "tool_approval_event_pending.json", "tool_approval_event_decided.json",
                "tool_approval_event_grant.json" }) do
                local fixture = assert(decode_fixture(source.fixtures[file]))
                test.is_nil(fixture.request_id, file)
            end
        end)
    end)
end

return test.run_cases(define_tests)
