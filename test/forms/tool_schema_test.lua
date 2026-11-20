local test = require("test")
local json = require("json")
local registry = require("registry")
local definition = require("definition")
local field_values = require("field_values")
local form_pattern = require("form_pattern")

-- The ask_user and ask_user_fields tool schemas and the trait prompt state
-- types, keys and limits by hand. Each one is compared with what the
-- validator enforces, so a change on one side only fails here.

local function define_tests()
    describe("the ask_user_fields tool schema", function()
        local CHOICE_TOOL = "wippy.session.forms:ask_user_tool"
        local FIELDS_TOOL = "wippy.session.forms:ask_user_fields_tool"

        local function schema_of(tool_id: string): any
            local entry, err = registry.get(tool_id)
            test.is_nil(err)
            local schema, decode_err = json.decode(tostring(entry.meta.input_schema))
            test.is_nil(decode_err)
            return schema
        end

        local function root_schema(): any
            return schema_of(FIELDS_TOOL)
        end

        -- Each tool advertises exactly the types its handler accepts, and
        -- each trait carries its own tool and names it in its prompt.
        describe("the field types each tool accepts", function()
            local function type_enum(tool_id: string): any
                return schema_of(tool_id).properties.fields.items.properties.type.enum
            end

            it("are choice only for ask_user, as its handler enforces", function()
                local enum = type_enum(CHOICE_TOOL)
                test.eq(#enum, 1)
                test.eq(enum[1], "choice")
                local accepted = {}
                for name in pairs(definition.CHOICE_TYPES) do table.insert(accepted, name) end
                test.eq(#accepted, 1)
                test.eq(accepted[1], "choice")
            end)

            it("are every type for ask_user_fields, in the server's order, with options not required", function()
                local enum = type_enum(FIELDS_TOOL)
                test.eq(#enum, #definition.TYPES)
                for index, name in ipairs(definition.TYPES) do
                    test.eq(enum[index], name)
                end
                local item = schema_of(FIELDS_TOOL).properties.fields.items
                table.sort(item.required)
                test.eq(table.concat(item.required, ","), "id,label,type")
            end)

            it("belong to the trait that carries the tool, and its prompt names it", function()
                for trait_id, tool_id in pairs({
                    ["wippy.session.forms:ask_user"] = CHOICE_TOOL,
                    ["wippy.session.forms:ask_user_fields"] = FIELDS_TOOL,
                }) do
                    local trait, err = registry.get(trait_id)
                    test.is_nil(err)
                    local tools = trait.data.tools
                    test.eq(#tools, 2)
                    test.eq(tools[1], tool_id)
                    test.eq(tools[2], "wippy.session.forms:read_form_tool")
                    local tool = registry.get(tool_id)
                    test.contains(tostring(trait.data.prompt), "the " .. tostring(tool.meta.llm_alias) .. " tool")
                end
            end)
        end)

        local function field_schema(): any
            return root_schema().properties.fields.items
        end

        -- The numbers the model is told are written in the schema and the
        -- trait prompt by hand, so each one is compared with the constant the
        -- validator enforces. A limit that changes in one place fails here.
        describe("the limits it states", function()
            local LIMITS = field_values.LIMITS
            local magnitude = field_values.number_text(LIMITS.NUMBER_MAGNITUDE)

            it("are the limits of the standard fields", function()
                local properties = field_schema().properties
                local max_length = tostring(properties.max_length.description)
                test.contains(max_length, string.format("default %d, at most %d", LIMITS.TEXT_DEFAULT, LIMITS.TEXT_MAX))
                test.contains(max_length, string.format("textarea: default and at most %d", LIMITS.TEXTAREA_MAX))
                test.contains(max_length, string.format("at most %d characters together", LIMITS.TEXT_BUDGET))
                test.contains(max_length, string.format("an email counts %d", LIMITS.EMAIL_MAX))
                test.contains(tostring(properties.placeholder.description),
                    string.format("at most %d characters", LIMITS.PLACEHOLDER))
                local decimals = string.format("at most %d decimals", LIMITS.NUMBER_DECIMALS)
                local range = string.format("between -%s and %s", magnitude, magnitude)
                test.contains(tostring(properties.min.description), decimals)
                test.contains(tostring(properties.min.description), range)
                test.contains(tostring(properties.step.description), decimals)
                test.contains(tostring(properties.max.description), "same limits as min")
            end)

            -- Both tools state the same definition limits.
            for _, tool_id in ipairs({ CHOICE_TOOL, FIELDS_TOOL }) do
                it("are the limits of the definition in " .. tool_id, function()
                    local root = schema_of(tool_id)
                    local DEFINITION = definition.LIMITS
                    test.contains(tostring(root.properties.title.description), string.format("1-%d characters", DEFINITION.TITLE))
                    test.contains(tostring(root.properties.description.description),
                        string.format("at most %d characters", DEFINITION.DESCRIPTION))
                    test.contains(tostring(root.properties.submit_label.description),
                        string.format("at most %d characters", DEFINITION.SUBMIT_LABEL))
                    test.contains(tostring(root.properties.answered_message.description),
                        string.format("at most %d characters", DEFINITION.ANSWERED_MESSAGE))
                    test.contains(tostring(root.properties.fields.description), string.format("1-%d questions", DEFINITION.FIELDS))
                    local item = root.properties.fields.items.properties
                    test.contains(tostring(item.label.description), string.format("1-%d characters", DEFINITION.LABEL))
                    test.contains(tostring(item.description.description),
                        string.format("at most %d characters", DEFINITION.DESCRIPTION))
                    test.contains(tostring(item.options.description), string.format("1-%d distinct choices, each at most %d characters",
                        DEFINITION.OPTIONS, DEFINITION.OPTION_TEXT))
                    local entry = registry.get(tool_id)
                    test.contains(tostring(entry.meta.llm_description),
                        string.format("about %d KiB", math.floor(DEFINITION.DEFINITION_BYTES / 1024)))
                end)
            end

            it("are the limits the trait prompt gives the model", function()
                local entry, err = registry.get("wippy.session.forms:ask_user_fields")
                test.is_nil(err)
                local prompt = tostring(entry.data.prompt)
                test.not_nil(string.find(prompt, string.format("at most %d%%s+characters", LIMITS.TEXT_BUDGET)),
                    "the prompt names the text budget " .. LIMITS.TEXT_BUDGET)
                test.not_nil(string.find(prompt, string.format("at most %d%%s+characters", LIMITS.EMAIL_MAX)),
                    "the prompt names the email length " .. LIMITS.EMAIL_MAX)
            end)

            it("are enforced at the numbers the schema states", function()
                -- The values the text promises are accepted, one more is not.
                local function text_field(max: number)
                    return { id = "f", type = "text", label = "Q", max_length = max }
                end
                test.is_nil(select(2, definition.normalize({ title = "T", fields = { text_field(LIMITS.TEXT_MAX) } })))
                local _, over = definition.normalize({ title = "T", fields = { text_field(LIMITS.TEXT_MAX + 1) } })
                test.eq(over[1].code, "invalid_range")
                local _, number_over = definition.normalize({ title = "T", fields = {
                    { id = "f", type = "number", label = "Q", max = LIMITS.NUMBER_MAGNITUDE } } })
                test.is_nil(number_over)
                local _, past = definition.normalize({ title = "T", fields = {
                    { id = "f", type = "number", label = "Q", max = LIMITS.NUMBER_MAGNITUDE * 10 } } })
                test.eq(past[1].code, "invalid_range")
            end)
        end)

        it("offers every key a field type accepts, so the model can write each of them", function()
            local item = field_schema()
            local keys = { id = true, type = true, label = true, description = true, required = true,
                options = true, multiple = true, allow_other = true }
            for _, type_keys in pairs(field_values.KEYS) do
                for key in pairs(type_keys) do keys[key] = true end
            end
            for key in pairs(keys) do
                test.not_nil(item.properties[key], "the schema describes " .. key)
                test.not_nil(item.properties[key].description, "the schema explains " .. key)
            end
            for key in pairs(item.properties) do
                test.is_true(keys[key], "the schema offers " .. key .. " but no type accepts it")
            end
        end)

        -- What the model is told about a pattern is the contract it writes
        -- against, so it is tied to what form_pattern accepts and says.
        describe("the pattern description", function()
            local function description(): string
                return tostring(field_schema().properties.pattern.description)
            end

            local function set_of(characters: string): {[string]: boolean}
                local set: {[string]: boolean} = {}
                for character in string.gmatch(characters, "%S") do set[character] = true end
                return set
            end

            local function same_set(a: {[string]: boolean}, b: {[string]: boolean}, label: string)
                for character in pairs(a) do test.is_true(b[character], label .. ": extra " .. character) end
                for character in pairs(b) do test.is_true(a[character], label .. ": missing " .. character) end
            end

            it("lists exactly the characters a backslash may precede, as the parser does", function()
                local text = description()
                local listed, in_class = string.match(text, "one of these characters: (.-) %(inside a class also (.)%)")
                test.not_nil(listed, "the description names the characters")
                same_set(set_of(listed :: string), set_of(form_pattern.ESCAPABLE), "description against the parser")
                test.eq(in_class, form_pattern.CLASS_ESCAPABLE)

                -- The parser's own message for an escape it refuses.
                local _, code, message = form_pattern.check("a\\q")
                test.eq(code, "unsupported_pattern")
                local from_message = string.match(tostring(message), "before one of (.-)%.$")
                test.not_nil(from_message, "the message names the characters")
                same_set(set_of(from_message :: string), set_of(form_pattern.ESCAPABLE), "message against the parser")
                local _, _, class_message = form_pattern.check("[\\q]")
                test.contains(tostring(class_message), " and " .. form_pattern.CLASS_ESCAPABLE .. ".")
            end)

            it("lists what the parser accepts: each escape is taken, and no other punctuation is", function()
                local escapable = set_of(form_pattern.ESCAPABLE)
                for byte = 33, 126 do
                    local character = string.char(byte)
                    local outside = form_pattern.check("a\\" .. character)
                    local inside = form_pattern.check("[\\" .. character .. "]")
                    if escapable[character] then
                        test.is_true(outside, "\\" .. character .. " outside a class")
                        test.is_true(inside, "\\" .. character .. " inside a class")
                    elseif character == "d" or character == "w" then
                        test.is_true(outside, "\\" .. character)
                    else
                        test.is_nil(outside, "\\" .. character .. " outside a class")
                        test.is_true(inside == nil or character == form_pattern.CLASS_ESCAPABLE,
                            "\\" .. character .. " inside a class")
                    end
                end
            end)

            it("states the bounds the parser enforces", function()
                local text = description()
                test.contains(text, string.format("at most %d characters", form_pattern.MAX_LENGTH))
                test.contains(text, string.format("nested at most %d deep", form_pattern.MAX_DEPTH))
                test.contains(text, string.format("counts of at most %d", form_pattern.MAX_REPEAT))
                test.contains(text, string.format("counts at most %d with every repeat written out", form_pattern.MAX_EXPANDED))
                test.is_true(form_pattern.check(string.format("a{%d}", form_pattern.MAX_REPEAT)))
                test.is_nil(form_pattern.check(string.format("a{%d}", form_pattern.MAX_REPEAT + 1)))
                test.is_nil(form_pattern.check("a{01}"))
                local nested = string.rep("(", form_pattern.MAX_DEPTH) .. "a" .. string.rep(")", form_pattern.MAX_DEPTH)
                test.is_true(form_pattern.check(nested))
                test.is_nil(form_pattern.check("(" .. nested .. ")"))
                test.is_true(form_pattern.check("[" .. string.rep("a", form_pattern.MAX_LENGTH - 2) .. "]"))
                test.is_nil(form_pattern.check(string.rep("a", form_pattern.MAX_LENGTH + 1)))
            end)
        end)
    end)
end

return test.run_cases(define_tests)
