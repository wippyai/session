local json = require("json")
local consts = require("consts")
local session = require("session")
local prompt_builder = require("prompt_builder")

local M = {}

type Selector = {
    mode: string?,
    last: any?,
    from_id: string?,
    to_id: string?,
    checkpoint_id: string?,
    max_chars: any?,
}

local function host_session_id(args)
    local host = type(args) == "table" and args.host or nil
    local session_id = host and host.session_id or (type(args) == "table" and args.session_id)
    if type(session_id) ~= "string" or session_id == "" then
        return nil, "host.session_id is required"
    end
    return session_id, nil
end

local function open_reader(args)
    local session_id, id_err = host_session_id(args)
    if id_err then
        return nil, id_err
    end

    local reader, err = session.open(session_id)
    if not reader then
        return nil, err or "failed to open session"
    end

    return reader, nil
end

local function selector(args): Selector
    local raw = type(args) == "table" and args.selector or nil
    if type(raw) ~= "table" then
        return { mode = "since_checkpoint" } :: Selector
    end
    return raw :: Selector
end

local function without_anchor(messages, anchor_id)
    if type(anchor_id) ~= "string" or anchor_id == "" then
        return messages or {}
    end

    local out = {}
    for _, msg in ipairs(messages or {}) do
        if msg.message_id ~= anchor_id then
            out[#out + 1] = msg
        end
    end
    return out
end

local function query_messages(reader, sel)
    local mode = sel.mode or "since_checkpoint"
    local query = reader:messages()

    if mode == "window" then
        local count = sel.last == nil and 20 or tonumber(sel.last)
        if not count or count <= 0 then
            return nil, "selector.last must be positive for window"
        end
        return query:last(count):all()
    end

    if mode == "since_id" then
        if type(sel.from_id) ~= "string" or sel.from_id == "" then
            return nil, "selector.from_id is required for since_id"
        end
        local messages, err = query:after(sel.from_id):all()
        if err then
            return nil, err
        end
        return without_anchor(messages, sel.from_id), nil
    end

    if mode == "range" then
        if type(sel.from_id) == "string" and sel.from_id ~= ""
           and type(sel.to_id) == "string" and sel.to_id ~= ""
           and sel.from_id == sel.to_id then
            return {}, nil
        end
        if type(sel.from_id) == "string" and sel.from_id ~= "" then
            query = query:after(sel.from_id)
        end
        local messages, err = query:all()
        if err then
            return nil, err
        end
        messages = without_anchor(messages, sel.from_id)
        if type(sel.to_id) ~= "string" or sel.to_id == "" then
            return messages, nil
        end
        local out = {}
        for _, msg in ipairs(messages or {}) do
            out[#out + 1] = msg
            if msg.message_id == sel.to_id then
                break
            end
        end
        return out, nil
    end

    if mode == "all" then
        return query:all()
    end

    if mode == "checkpoint" then
        if type(sel.checkpoint_id) ~= "string" or sel.checkpoint_id == "" then
            return nil, "selector.checkpoint_id is required for checkpoint"
        end
        local messages, err = query:after(sel.checkpoint_id):all()
        if err then
            return nil, err
        end
        return without_anchor(messages, sel.checkpoint_id), nil
    end

    if mode == "since_checkpoint" then
        local checkpoint_id = reader:get_context(consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID)
        local messages, err = query:from_checkpoint():all()
        if err then
            return nil, err
        end
        return without_anchor(messages, checkpoint_id), nil
    end

    return nil, "unknown selector mode: " .. tostring(mode)
end

local function decode_data(data)
    if type(data) ~= "string" then
        return data
    end
    local decoded, err = json.decode(data)
    if not err then
        return decoded
    end
    return data
end

local function normalize_event(msg)
    return {
        id = msg.message_id,
        role = msg.type,
        content = decode_data(msg.data),
        raw_content = msg.data,
        metadata = type(msg.metadata) == "table" and msg.metadata or {},
        created_at = msg.date
    }
end

local function clamp_events(events, max_chars)
    local limit = tonumber(max_chars)
    if not limit or limit <= 0 then
        return events, false
    end

    local total = 0
    local out = {}
    local truncated = false
    for _, event in ipairs(events) do
        local content = event.raw_content or event.content or ""
        if type(content) ~= "string" then
            local encoded = json.encode(content)
            content = encoded or tostring(content)
        end
        local next_total = total + #content
        if next_total > limit then
            truncated = true
            break
        end
        total = next_total
        out[#out + 1] = event
    end
    return out, truncated
end

local function history_result(reader, args)
    local sel = selector(args)
    local messages, err = query_messages(reader, sel)
    if err then
        return nil, err
    end

    local events = {}
    for _, msg in ipairs(messages or {}) do
        events[#events + 1] = normalize_event(msg)
    end
    local truncated
    events, truncated = clamp_events(events, sel.max_chars)

    local first = events[1]
    local last = events[#events]
    return {
        events = events,
        range = {
            from_id = first and first.id or nil,
            to_id = last and last.id or nil,
            checkpoint_id = sel.checkpoint_id
        },
        truncated = truncated == true,
        count = #events
    }, nil
end

function M.get_context(args)
    local reader, err = open_reader(args)
    if not reader then
        return nil, err
    end

    local context, ctx_err = reader:get_full_context()
    if ctx_err then
        return nil, ctx_err
    end

    return {
        context = context or {},
        host = type(args) == "table" and args.host or nil,
        agent = type(args) == "table" and args.agent or nil
    }, nil
end

function M.get_history(args)
    local reader, err = open_reader(args)
    if not reader then
        return nil, err
    end

    return history_result(reader, args)
end

local function prompt_to_text(messages)
    local parts = {}
    for _, msg in ipairs(messages or {}) do
        local role = tostring(msg.role or "message")
        local text = ""
        if type(msg.content) == "table" then
            for _, item in ipairs(msg.content) do
                if type(item) == "table" and item.text then
                    text = text .. tostring(item.text)
                elseif type(item) == "string" then
                    text = text .. item
                end
            end
        elseif msg.content ~= nil then
            text = tostring(msg.content)
        end
        parts[#parts + 1] = string.format("[%s] %s", role, text)
    end
    return table.concat(parts, "\n")
end

function M.get_prompt(args)
    local reader, err = open_reader(args)
    if not reader then
        return nil, err
    end

    local hist, hist_err = history_result(reader, args)
    if hist_err then
        return nil, hist_err
    end

    local messages = {}
    for _, event in ipairs(hist.events or {}) do
        messages[#messages + 1] = {
            message_id = event.id,
            type = event.role,
            data = event.raw_content,
            metadata = event.metadata or {}
        }
    end

    local contexts, ctx_err = reader:contexts():all()
    if ctx_err then
        contexts = {}
    end

    local built, build_err = prompt_builder.build(messages, contexts, reader:state(), {
        include_contexts = args and args.include_contexts ~= false,
        include_files = args and args.include_files ~= false,
        cache_markers = args and args.cache_markers ~= false
    })
    if build_err then
        return nil, build_err
    end

    local prompt_messages = built:get_messages()
    local format = args and args.format or "messages"
    local result = {
        range = hist.range,
        truncated = hist.truncated
    }
    if format == "text" or format == "both" then
        result.text = prompt_to_text(prompt_messages)
    end
    if format ~= "text" then
        result.messages = prompt_messages
    end

    return result, nil
end

return M
