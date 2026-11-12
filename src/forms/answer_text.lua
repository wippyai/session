local definition = require("definition")
local ordered_json = require("ordered_json")
local message_repo = require("message_repo")

-- Text of the user message that carries an accepted form answer. The server
-- builds it from the immutable definition and the validated answers, and the
-- browser never supplies it. It has this shape:
--
--   <answered_message, or Answered “<title>”.>
--
--   <wippy-form-answers record='{...}'>
--   </wippy-form-answers>
--
-- The user sees only the sentence. The element is empty, so nothing shows if
-- its component has not loaded or the sanitizer drops it. The tag sits on its
-- own lines so Markdown leaves it alone, and "'", "<", ">" and "&" inside the
-- record are written as \u escapes so user text cannot end the attribute.

local answer_text = {}

answer_text.TAG = "wippy-form-answers"
answer_text.LATE_NOTICE = "The conversation moved on before this answer. Use it as context "
    .. "and ask for fresh confirmation before acting on the earlier request."

-- Escapes Markdown so agent-written text shows as one plain paragraph: line
-- breaks fold to spaces and block syntax at the line start is escaped.
local function plain(text: any): string
    local folded = string.gsub(tostring(text), "[%c]+", " ")
    -- Collapse a leading run of spaces to one, so the line cannot pass for
    -- an indented code block (4 or more leading spaces).
    folded = string.gsub(folded, "^ +", " ")
    local escaped = string.gsub(folded, "([%\\`%*_%[%]<>&~])", "\\%1")
    -- A heading, list or ordered-list marker, or a thematic break/setext
    -- underline, only means something at the very start of the line; "#",
    -- "-", "+" and digits are not escaped above because doing that
    -- mid-sentence would be needlessly ugly there.
    if string.find(escaped, "^#") then
        escaped = "\\" .. escaped
    elseif string.find(escaped, "^[%-%+] ") then
        escaped = "\\" .. escaped
    elseif string.find(escaped, "^%d+[%.%)] ") then
        escaped = string.gsub(escaped, "^(%d+)([%.%)])", "%1\\%2", 1)
    elseif string.find(escaped, "^[%-=][%-= ]*$") then
        escaped = "\\" .. escaped
    end
    return escaped
end

-- The element's tag in any letter case, as a Lua pattern built from TAG.
-- Captures the "/" of a closing tag and the name as written.
local function any_case(letter: string): string
    return "[" .. string.upper(letter) .. string.lower(letter) .. "]"
end
local TAG_NAME_PATTERN = (string.gsub((string.gsub(answer_text.TAG, "%-", "%%-")), "%a", any_case))
local TAG_PATTERN = "<(/?)(" .. TAG_NAME_PATTERN .. ")"

-- Only answer rows carry a real answer record. The same tag typed or pasted
-- by a user, opening or closing and in any letter case, has its "<" written
-- as "&lt;", so the model (and the checkpoint summary) reads it as the
-- user's text and not as an answer record.
function answer_text.neutralize(text: any): any
    if type(text) ~= "string" then return text end
    return (string.gsub(text, TAG_PATTERN, "&lt;%1%2"))
end

-- The text of a stored user row as the model and the checkpoint summary read
-- it, or nil for a form answer the session has not admitted yet, which
-- neither may show. A server-written answer row keeps its answer element,
-- and the same tag in typed text is neutralized.
function answer_text.model_text(row: any): string?
    if message_repo.is_pending_answer(row) then return nil end
    local text = row.data
    if type(text) ~= "string" then return "" end
    if message_repo.is_form_answer(row) then return text end
    return answer_text.neutralize(text) :: string
end

local ATTRIBUTE_SAFE = {["'"] = "\\u0027", ["<"] = "\\u003c", [">"] = "\\u003e", ["&"] = "\\u0026" }

-- Only valid on encoded JSON: these characters occur there only inside
-- strings, where the \u escapes decode to the same text.
local function attribute_safe(encoded: string): string
    local escaped = string.gsub(encoded, "['<>&]", ATTRIBUTE_SAFE)
    return escaped
end

local function option_labels(field: any): {[string]: string}
    local labels: {[string]: string} = {}
    for _, option in ipairs(field.options) do labels[option.value] = option.label end
    return labels
end

-- One chosen item as the agent reads it (fixed key order).
local function record_item(labels: {[string]: string}, item: any): string
    if type(item) == "string" then
        return ordered_json.object({ { "value", item }, { "label", labels[item] or item } })
    end
    if item.value ~= nil then
        return ordered_json.object({
            { "value", item.value }, { "label", labels[item.value] or item.value }, { "note", item.note },
        })
    end
    return ordered_json.object({ { "other", item.other } })
end

-- Self-contained answer record, on one line: every question in definition
-- order with its text and its answer, so the agent needs nothing else to act
-- on it. An answer is {"value","label"} for a chosen option (plus "note"
-- when the user added one), {"other"} for the user's own answer, a list of
-- those for a several-answer question, or null for a question left
-- unanswered. A late answer adds "late_notice". The stored submission keeps
-- only values (definition.encode_answers), so the record is derived from it
-- and the immutable definition. read_form returns the same record.
-- params: { artifact_id, definition (normalized), answers (normalized, or
-- nil), late }
function answer_text.record_json(params: any): string
    local def = params.definition
    local questions = {}
    for _, field in ipairs(def.fields) do
        local labels = option_labels(field)
        local value = params.answers and params.answers[field.id]
        local answer = "null"
        if value ~= nil and definition.is_array(value) then
            local items = {}
            for _, item in ipairs(value) do table.insert(items, record_item(labels, item)) end
            answer = ordered_json.array(items)
        elseif value ~= nil then
            answer = record_item(labels, value)
        end
        table.insert(questions, { field.id, raw = ordered_json.object({
            { "question", field.label }, { "answer", raw = answer },
        }) })
    end
    local entries = {
        { "form_id", tostring(params.artifact_id) },
        { "form_version", definition.FORM_VERSION },
        { "title", def.title },
        { "late", params.late == true },
    }
    if params.late then table.insert(entries, { "late_notice", answer_text.LATE_NOTICE }) end
    table.insert(entries, { "answers", raw = ordered_json.object(questions) })
    return ordered_json.object(entries)
end

-- The questions of an unanswered form with their options, so an agent that
-- lost the original tool call can still restate them.
function answer_text.questions_json(def: any): string
    local questions = {}
    for _, field in ipairs(def.fields) do
        local options = {}
        for _, option in ipairs(field.options) do
            table.insert(options, ordered_json.object({ { "value", option.value }, { "label", option.label } }))
        end
        table.insert(questions, { field.id, raw = ordered_json.object({
            { "question", field.label },
            { "multiple", field.multiple == true },
            { "required", field.required == true },
            { "allow_other", field.allow_other == true },
            { "options", raw = ordered_json.array(options) },
        }) })
    end
    return ordered_json.object(questions)
end

-- The sentence the user sees: the agent's answered_message, or a neutral one
-- built from the title for forms asked without it.
function answer_text.sentence(def: any): string
    if def.answered_message then return plain(def.answered_message) end
    return "Answered “" .. plain(def.title) .. "”."
end

-- params: { artifact_id, definition (normalized), answers (normalized), late }
function answer_text.build(params: any): string
    return answer_text.sentence(params.definition)
        .. "\n\n<" .. answer_text.TAG .. " record='" .. attribute_safe(answer_text.record_json(params))
        .. "'>\n</" .. answer_text.TAG .. ">"
end

return answer_text
