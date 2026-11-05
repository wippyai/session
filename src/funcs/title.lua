local session = require("session")
local llm = require("llm")
local prompt = require("prompt")
local text_clamp = require("text_clamp")
local answer_text = require("answer_text")

type TitleResult = {
    success: boolean,
    title: string?,
    tokens: {
        prompt_tokens: number,
        completion_tokens: number,
        total_tokens: number,
    }?,
}

local CONFIG = {
    model = "class:fast",
    temperature = 0.1,
    max_tokens = 50,
    max_prior_checkpoints = 5,
    max_conversation_chars = 800,
    max_assistant_content = 200
}

local PROMPTS = {
    primary = "Generate a concise, descriptive title for this conversation. The title should be 3-8 words long, capture the main topic, be clear and specific, use sentence case, and not use quotation marks. Respond with ONLY the title.",
    secondary = "Generate a concise title that reflects the user's overall focus across this extended conversation. Consider the progression from previous checkpoints to current activity. The title should be 3-8 words long, capture the evolved main theme, be clear and specific, use sentence case, and not use quotation marks. Respond with ONLY the title."
}

-- A title describes the conversation; positional notes (the time of a turn,
-- lifecycle guidance) are context sent to the model, not what it was about.
local function add_conversation_part(parts: {string}, msg: any)
    if msg.type == "user" then
        -- A form answer the session has not admitted yet is not part of the
        -- conversation, so the model must not see it.
        local text = answer_text.model_text(msg)
        if text then table.insert(parts, "User: " .. text) end
    elseif msg.type == "assistant" and msg.data and msg.data ~= "" then
        local content = text_clamp.head(msg.data, CONFIG.max_assistant_content)
        if #msg.data > CONFIG.max_assistant_content then
            content = content .. "..."
        end
        table.insert(parts, "Assistant: " .. content)
    elseif msg.type == "system" and msg.data and msg.data ~= ""
        and not (msg.metadata and msg.metadata.preserve_position) then
        table.insert(parts, "System: " .. (msg.data or ""))
    end
end

local function handle(args)
    if not args.session_id then
        return nil, "session_id is required"
    end

    local session_reader, session_err = session.open(args.session_id)
    if not session_reader then
        return nil, "Failed to open session: " .. (session_err or "unknown error")
    end

    local existing_summaries, ctx_err = session_reader:contexts():type("conversation_summary"):all()
    if ctx_err then
        existing_summaries = {}
    end

    local has_checkpoints = existing_summaries and #existing_summaries > 0

    local conversation_parts = {}
    local title_prompt = prompt.new()

    if not has_checkpoints then
        title_prompt:add_system(PROMPTS.primary)

        local all_messages, msg_err = session_reader:messages():all()
        if msg_err then
            return nil, "Failed to load messages: " .. msg_err
        end

        for _, msg in ipairs(all_messages) do
            add_conversation_part(conversation_parts, msg)
        end
    else
        title_prompt:add_system(PROMPTS.secondary)

        table.sort(existing_summaries :: {table}, function(a, b)
            return (a.time or a.created_at or "") > (b.time or b.created_at or "")
        end)

        local checkpoint_count = math.min(#existing_summaries, CONFIG.max_prior_checkpoints)

        if checkpoint_count > 0 then
            title_prompt:add_user("Previous topics:")
            for i = 1, checkpoint_count do
                local summary_excerpt = existing_summaries[i].text:sub(1, 500)
                title_prompt:add_user("Topic " .. i .. ": " .. summary_excerpt .. "...")
            end
        end

        local messages_after_checkpoint, msg_err = session_reader:messages():from_checkpoint():all()
        if msg_err then
            return nil, "Failed to load messages after checkpoint: " .. msg_err
        end

        if #messages_after_checkpoint > 0 then
            title_prompt:add_user("Recent activity since last checkpoint:")

            for _, msg in ipairs(messages_after_checkpoint) do
                add_conversation_part(conversation_parts, msg)
            end
        end
    end

    if #conversation_parts == 0 then
        return nil, "No meaningful conversation content found"
    end

    local conversation_text = table.concat(conversation_parts, "\n")
    if #conversation_text > CONFIG.max_conversation_chars then
        conversation_text = text_clamp.head(conversation_text, CONFIG.max_conversation_chars) .. "..."
    end

    title_prompt:add_user("Conversation to title:\n\n" .. conversation_text)
    title_prompt:add_user("\nGenerate a concise title for this conversation:")

    local response, llm_err = llm.generate(title_prompt, {
        model = CONFIG.model,
        temperature = CONFIG.temperature,
        max_tokens = CONFIG.max_tokens
    })

    if llm_err or not response or not response.result then
        return nil, "Failed to generate title: " .. (llm_err or "no result")
    end

    local title = response.result:gsub("^%s+", ""):gsub("%s+$", "")
    title = title:gsub("[\"']", "")
    title = title:gsub("\n.*$", "")

    if #title == 0 then
        return nil, "Generated title is empty"
    end

    title = text_clamp.head(title, 100)

    return {
        success = true,
        title = title,
        tokens = response.tokens or {
            prompt_tokens = 0,
            completion_tokens = 0,
            total_tokens = 0
        }
    }
end

return { handle = handle }
