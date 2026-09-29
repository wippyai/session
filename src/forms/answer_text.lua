local json = require("json")
local definition = require("definition")

-- Builds the text of the user message that carries an accepted form answer
-- (spec section 13). The server writes it from the immutable definition and
-- the validated answers; the browser never supplies it.
--
--   Answers to form "<title>" (form_id: <id>):
--   - <label>: <readable answer>
--
--   Exact answers:
--   ```json
--   {"form_id":"<id>","form_version":1,"answers":{...}}
--   ```
--
-- A late answer starts with `Late answer to form ...` and a line telling the
-- agent to ask for fresh confirmation before acting. Labels and answers are
-- untrusted text: line breaks inside them are folded to spaces so no value
-- can start a line (and with it a heading, list item or code fence), and the
-- fence around the exact JSON is longer than any backtick run inside it.

local answer_text = {}

answer_text.LATE_NOTICE = "The conversation moved on before this answer. Use it as context "
    .. "and ask for fresh confirmation before acting on the earlier request."
answer_text.NO_ANSWER = "(no answer)"

local function one_line(text: any): string
    local folded = string.gsub(tostring(text), "[%c]+", " ")
    return folded
end

local function longest_backtick_run(text: string): integer
    local longest = 0
    for run in string.gmatch(text, "`+") do
        if #run > longest then longest = #run end
    end
    return longest
end

-- A fence of at least three backticks that is longer than any run inside
-- `body`.
function answer_text.fence_for(body: string): string
    local length = longest_backtick_run(body) + 1
    if length < 3 then length = 3 end
    return string.rep("`", length)
end

local function readable_value(field: any, value: any): string
    if value == nil then return answer_text.NO_ANSWER end
    local labels = {}
    for _, option in ipairs(field.options) do labels[option.value] = option.label end
    local function one(item: any): string
        if type(item) == "string" then return labels[item] or item end
        return "Other: " .. tostring(item.other)
    end
    if type(value) == "table" and value.other == nil then
        local parts = {}
        for _, item in ipairs(value) do table.insert(parts, one(item)) end
        return table.concat(parts, ", ")
    end
    return one(value)
end

-- params: { artifact_id, definition (normalized), answers (normalized), late }
function answer_text.build(params: any): string
    local def = params.definition
    local title = one_line(def.title)
    local heading = params.late and "Late answer to form" or "Answers to form"
    local lines = {
        string.format("%s \"%s\" (form_id: %s):", heading, title, tostring(params.artifact_id)),
    }
    if params.late then
        table.insert(lines, answer_text.LATE_NOTICE)
    end
    for _, field in ipairs(def.fields) do
        table.insert(lines, "- " .. one_line(field.label) .. ": "
            .. one_line(readable_value(field, params.answers[field.id])))
    end

    local exact = "{\"form_id\":" .. (json.encode(tostring(params.artifact_id)))
        .. ",\"form_version\":" .. tostring(definition.FORM_VERSION)
        .. ",\"answers\":" .. definition.encode_answers(def, params.answers) .. "}"
    local fence = answer_text.fence_for(exact)

    table.insert(lines, "")
    table.insert(lines, "Exact answers:")
    table.insert(lines, fence .. "json")
    table.insert(lines, exact)
    table.insert(lines, fence)
    return table.concat(lines, "\n")
end

return answer_text
