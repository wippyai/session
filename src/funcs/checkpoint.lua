local json = require("json")
local session = require("session")
local llm = require("llm")
local prompt = require("prompt")
local text_clamp = require("text_clamp")

type CheckpointResult = {
    success: boolean,
    summary: string?,
    tokens: {
        prompt_tokens: number,
        completion_tokens: number,
        total_tokens: number,
    }?,
}

local CONFIG = {
    model = "class:fast",
    temperature = 0.2,
    max_tokens = 3000,
    max_tool_result_chars = 2000,
    -- Together these fit a 200k window at four bytes per token, with room for the
    -- prompt, the previous checkpoint and the reservation, when no window resolves.
    max_conversation_chars = 500000,
    max_tool_results = 100,
    max_tool_results_chars = 100000,
}

-- The summary is asked to stay under this share of max_tokens, so a normal summary
-- finishes instead of being cut off at the limit.
local SUMMARY_BUDGET_SHARE = 0.8
-- Admission counts request structure too, which the sections below do not measure.
local INPUT_SLACK = 0.9
local BYTES_PER_TOKEN = 4
local TOOL_RESULTS_SHARE = 0.2

local function positive_number(value: any, fallback: number): number
    local n = tonumber(value)
    if not n or n <= 0 then
        return fallback
    end
    return n
end

local function config_from_args(args)
    local options = type(args.options) == "table" and args.options or {}
    return {
        model = type(options.model) == "string" and options.model ~= "" and options.model or CONFIG.model,
        temperature = tonumber(options.temperature) or CONFIG.temperature,
        max_tokens = positive_number(options.max_tokens, CONFIG.max_tokens),
        max_tool_result_chars = positive_number(options.max_tool_result_chars, CONFIG.max_tool_result_chars),
        max_conversation_chars = positive_number(options.max_conversation_chars, CONFIG.max_conversation_chars),
        max_tool_results = positive_number(options.max_tool_results, CONFIG.max_tool_results),
        max_tool_results_chars = positive_number(options.max_tool_results_chars, CONFIG.max_tool_results_chars),
    }
end

local function clamp_transcript(text: string, max_chars: number): (string, number)
    local limit = math.floor(max_chars)
    if #text <= limit then
        return text, 0
    end

    local cut = #text - limit
    local newline = string.find(text, "\n", cut, true)
    local kept = newline and string.sub(text, newline + 1) or text_clamp.tail(text, limit)
    local dropped = #text - #kept
    return "[... " .. tostring(dropped) .. " earlier characters of this section omitted "
        .. "to fit the summarizer's input ...]\n" .. kept, dropped
end

local function newest(items: { string }, max_items: number): { string }
    if #items <= max_items then
        return items
    end
    local kept = {}
    for i = #items - max_items + 1, #items do
        table.insert(kept, items[i])
    end
    return kept
end

-- Section budgets from the window of the resolved model. fixed_chars is the input
-- that is sent whole. Models without a window keep the configured budgets.
local function section_budgets(cfg: any, fixed_chars: number): (number?, number?, string?)
    local card = llm.resolve_model(cfg.model)
    local window = card and tonumber(card.max_tokens)
    if not window or window <= 0 then
        return cfg.max_conversation_chars, cfg.max_tool_results_chars, nil
    end
    local available = math.floor((window - cfg.max_tokens) * BYTES_PER_TOKEN * INPUT_SLACK) - fixed_chars
    if available <= 0 then
        return nil, nil, "Summarizer input does not fit the context window of " .. tostring(cfg.model)
    end
    local results = math.min(cfg.max_tool_results_chars, math.floor(available * TOOL_RESULTS_SHARE))
    return math.min(cfg.max_conversation_chars, available - results), results, nil
end

local function checkpoint_prompt(template, max_tokens)
    local rendered = template:gsub("3000", tostring(max_tokens))
    return rendered
end

local PROMPTS = {
    initial = [[Create comprehensive checkpoint in at most 3000 tokens. This serves as memory, task tracker, and behavior monitor.

Structure your checkpoint to capture:

1. FACTS & STATE: All data, IDs, files, decisions, costs, current state of everything
2. USER CONTEXT: Who they are, what they need, their patterns, concerns, communication style
3. TASK PROGRESS: What's completed vs pending. For complex tasks: steps done, steps remaining, blockers
4. AGENT BEHAVIOR: Tool usage patterns, failed attempts, repetitive actions (CRITICAL: note if agent repeating same failures)
5. EXECUTION HISTORY: What worked, what failed, what was tried multiple times (detect loops/inefficiencies)
6. DEPENDENCIES: How things connect - what depends on what, what blocks what
7. LEARNED INSIGHTS: What we discovered about the problem space, what approaches work/don't work
8. NEXT ACTIONS: Clear picture of what should happen next, what to avoid repeating

IMPORTANT: Flag any concerning patterns:
- Agent calling same tool repeatedly with same params (dead loop)
- Multiple failures on same operation
- Circular dependencies or logic
- Incomplete subtasks blocking progress

Write densely but preserve clarity. Full sentences for complex context, bullet-style for task lists.
Goal: Enable any AI to understand current state, avoid past mistakes, and continue effectively.
Do not write information without need to do it, like dont write that no patterns were found if that is the case.
Finish within the budget: a checkpoint cut off before its end is discarded.]],

    update = [[Merge previous checkpoint with new events in at most 3000 tokens. Track both progress and problems.

Previous checkpoint = working state. Update with:

1. PRESERVE CRITICAL STATE: All facts, pending tasks, known issues from before
2. UPDATE PROGRESS: Mark completed items DONE, add new tasks, update blockers
3. BEHAVIOR ANALYSIS: New patterns observed - especially inefficiencies or loops
   - Did agent repeat previous mistakes?
   - Are we stuck in same failure pattern?
   - New dead ends discovered?
4. EXECUTION LEARNINGS: What strategies emerged, what definitely doesn't work
5. STATE CHANGES: What moved from pending→done, what new problems appeared
6. REFINED UNDERSTANDING: Better grasp of problem space, user needs, system behavior
7. CORRECTED COURSE: If previous approach failed, what's the new strategy?

CRITICAL FLAGS TO PRESERVE/ADD:
- LOOP WARNING: if agent tried same thing 3+ times
- BLOCKED: if progress stopped on something
- RESOLVED: if previous blocker was fixed
- PATTERN: if repetitive behavior detected

Goal: Working memory that prevents repeated mistakes and tracks complex execution state.
Write clearly - another AI should immediately understand what to do and what to avoid.
Finish within the budget: a checkpoint cut off before its end is discarded.

Avoid duplicating non-unique information in checkpoint.
]],
}

-- Bound outgoing summaries to the captured settled tail. Pending steering is
-- still queued; neither it nor later arrivals belong to this summary.
local function select_messages(messages, checkpoint_id)
    if checkpoint_id == nil then return messages end
    local selected = {}
    for _, message in ipairs(messages) do
        local input = (message.metadata or {}).input
        if type(input) ~= "table" or input.state == "applied" then
            selected[#selected + 1] = message
        end
        if message.message_id == checkpoint_id then return selected end
    end
    return nil, "Checkpoint boundary not found in summary history"
end

local function handle(args)
    if not args.session_id then
        return nil, "session_id is required"
    end

    local cfg = config_from_args(args)

    local session_reader, session_err = session.open(args.session_id)
    if not session_reader then
        return nil, "Failed to open session: " .. (session_err or "unknown error")
    end

    local existing_summaries, ctx_err = session_reader:contexts():type("conversation_summary"):all()
    if ctx_err then
        existing_summaries = {}
    end

    local existing_summary = nil
    if existing_summaries and #existing_summaries > 0 then
        table.sort(existing_summaries :: {table}, function(a, b)
            return (a.time or a.created_at or "") > (b.time or b.created_at or "")
        end)
        existing_summary = existing_summaries[1].text
    end

    local range_messages = {}
    if existing_summary then
        local messages_after_checkpoint, msg_err = session_reader:messages():from_checkpoint():all()
        if msg_err then
            return nil, "Failed to load messages after checkpoint: " .. msg_err
        end
        range_messages = messages_after_checkpoint
    else
        local all_messages, msg_err = session_reader:messages():all()
        if msg_err then
            return nil, "Failed to load messages: " .. msg_err
        end
        range_messages = all_messages
    end

    local selected, selection_err = select_messages(range_messages, args.checkpoint_id)
    if not selected then return nil, selection_err end
    range_messages = selected
    if #range_messages == 0 then
        return nil, "No messages found for checkpoint"
    end

    local conversation_parts = {}
    local file_references = {}
    local tool_patterns = {}
    local tool_results = {}

    for _, msg in ipairs(range_messages) do
        if msg.type == "user" then
            table.insert(conversation_parts, "[USER]: " .. (msg.data or ""))

            local metadata = msg.metadata or {}
            if metadata.file_uuids and #metadata.file_uuids > 0 then
                for _, file_uuid in ipairs(metadata.file_uuids) do
                    table.insert(file_references, "file_uuid:" .. file_uuid)
                end
            end
        elseif msg.type == "assistant" and msg.data ~= "" then
            table.insert(conversation_parts, "[ASSISTANT]: " .. msg.data)
        elseif msg.type == "function" then
            local metadata = msg.metadata or {}
            local function_name = metadata.function_name or "unknown"
            local status = metadata.status or "unknown"

            tool_patterns[function_name] = (tool_patterns[function_name] or 0) + 1

            table.insert(conversation_parts, "[TOOL_CALL]: " .. function_name .. " (status: " .. status .. ")")

            if metadata.result then
                local result_text
                if type(metadata.result) == "table" then
                    result_text = json.encode(metadata.result)
                else
                    result_text = tostring(metadata.result)
                end

                -- Store full tool results for important context
                table.insert(tool_results, function_name .. "_result: " .. result_text:sub(1, cfg.max_tool_result_chars))

                if result_text:len() <= cfg.max_tool_result_chars then
                    table.insert(conversation_parts, "[TOOL_RESULT]: " .. result_text)
                else
                    table.insert(conversation_parts, "[TOOL_RESULT]: " .. result_text:sub(1, cfg.max_tool_result_chars) .. "...")
                end
            end
        elseif msg.type == "delegation" then
            local metadata = msg.metadata or {}
            local function_name = metadata.function_name or "delegation"
            table.insert(conversation_parts, "[DELEGATION]: " .. function_name .. " (status: " .. (metadata.status or "unknown") .. ")")
        elseif msg.type == "system" then
            table.insert(conversation_parts, "[SYSTEM]: " .. (msg.data or ""))
        elseif msg.type == "developer" then
            table.insert(conversation_parts, "[DEVELOPER]: " .. (msg.data or ""))
        end
    end

    if #conversation_parts == 0 then
        return nil, "No conversation content found"
    end

    local summary_budget = math.floor(cfg.max_tokens * SUMMARY_BUDGET_SHARE)
    local system_text = checkpoint_prompt(existing_summary and PROMPTS.update or PROMPTS.initial, summary_budget)
    local previous_text = existing_summary and ("===PREVIOUS CHECKPOINT (PRESERVE AND BUILD ON THIS)===\n" .. existing_summary) or nil
    local conversation_heading = existing_summary and "\n===NEW CONVERSATION SINCE CHECKPOINT===" or "===FULL CONVERSATION TO CHECKPOINT==="
    local files_text = #file_references > 0
        and ("\n===FILE REFERENCES IN THIS SECTION===\n" .. table.concat(file_references, "\n")) or nil

    local pattern_notes = {}
    for tool_name, call_count in pairs(tool_patterns) do
        table.insert(pattern_notes, tool_name .. " called " .. call_count .. " time(s)")
    end
    local patterns_text = #pattern_notes > 0
        and ("\n===TOOL USAGE PATTERNS===\n" .. table.concat(pattern_notes, "\n")) or nil

    local instruction = existing_summary and
        "\n===INSTRUCTION===\nCreate updated checkpoint that preserves ALL previous understanding while adding new insights, in at most " .. tostring(summary_budget) .. " tokens." or
        "\n===INSTRUCTION===\nCreate comprehensive checkpoint from this conversation, in at most " .. tostring(summary_budget) .. " tokens, capturing everything that helps AI understand and assist user."

    local fixed_chars = #system_text + #(previous_text or "") + #conversation_heading + #(files_text or "")
        + #(patterns_text or "") + #instruction
    local conversation_chars, results_chars, budget_err = section_budgets(cfg, fixed_chars)
    if budget_err then return nil, budget_err end

    local summary_prompt = prompt.new()
    summary_prompt:add_system(system_text)
    if previous_text then summary_prompt:add_user(previous_text) end
    summary_prompt:add_user(conversation_heading)
    summary_prompt:add_user((clamp_transcript(table.concat(conversation_parts, "\n"), conversation_chars :: number)))

    if files_text then summary_prompt:add_user(files_text) end

    if #tool_results > 0 then
        local results_text = clamp_transcript(table.concat(newest(tool_results, cfg.max_tool_results), "\n"),
            results_chars :: number)
        summary_prompt:add_user("\n===KEY TOOL RESULTS===\n" .. results_text)
    end

    if patterns_text then summary_prompt:add_user(patterns_text) end

    summary_prompt:add_user(instruction)

    local response, llm_err = llm.generate(summary_prompt, {
        model = cfg.model,
        temperature = cfg.temperature,
        max_tokens = cfg.max_tokens
    })

    if llm_err or not response or not response.result then
        return nil, "Failed to generate summary: " .. (llm_err or "no result")
    end
    -- A cut summary would replace the history it describes. The old anchor stays.
    if response.finish_reason == llm.FINISH_REASON.LENGTH then
        return nil, "Summary exceeded its output budget of " .. tostring(cfg.max_tokens) .. " tokens"
    end

    return {
        success = true,
        summary = response.result,
        tokens = response.tokens or {
            prompt_tokens = 0,
            completion_tokens = 0,
            total_tokens = 0
        }
    }
end

return {
    handle = handle,
    select_messages = select_messages,
    config_from_args = config_from_args,
    checkpoint_prompt = checkpoint_prompt,
    clamp_transcript = clamp_transcript,
    newest = newest,
}
