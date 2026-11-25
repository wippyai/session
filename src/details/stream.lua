local stream = {}

-- Construct content chunks afresh. Provider metadata, reasoning and tool
-- argument chunks never cross the P1 browser boundary.
function stream.project(chunk: any): any
    if type(chunk) ~= "table" then return nil end
    if chunk.type == "chunk" and type(chunk.content) == "string" then
        return { type = "chunk", content = chunk.content }
    end
    if chunk.type == "done" then return { type = "done" } end
    if chunk.type == "error" then
        return { type = "error", error = { type = "server_error", message = "The model request failed" } }
    end
    return nil
end

function stream.open(target: any, id: string): (any, any, string?)
    if not target then return nil, function() end, nil end
    local topic = "session.details.stream." .. id
    local input, err = process.listen(topic)
    if not input then return nil, nil, tostring(err) end
    local stop, done = channel.new(1), channel.new(1)
    local function forward(chunk)
        local public = stream.project(chunk)
        if public then process.send(target.reply_to, target.topic or "llm_response", public) end
    end
    coroutine.spawn(function()
        while true do
            local selected = channel.select({ input:case_receive(), stop:case_receive() })
            if selected.channel == stop or not selected.ok then break end
            forward(selected.value)
        end
        -- Drain chunks already delivered before the completed step.
        while true do
            local selected = channel.select({ input:case_receive(), default = true })
            if selected.default or not selected.ok then break end
            forward(selected.value)
        end
        process.unlisten(input)
        done:send(true)
    end)
    return { reply_to = process.pid(), topic = topic, buffer_size = target.buffer_size }, function()
        stop:send(true)
        done:receive()
    end, nil
end

return stream