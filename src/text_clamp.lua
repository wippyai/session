-- Byte budgets over UTF-8 text. A cut never splits a character: PostgreSQL rejects
-- the invalid bytes outright and JSON encoders replace them.
local text_clamp = {}

local function continuation_byte(byte: number?): boolean
    return byte ~= nil and byte >= 128 and byte < 192
end

-- The first max_bytes of text or fewer, ending on a character boundary.
function text_clamp.head(text: string, max_bytes: number): string
    if #text <= max_bytes then return text end
    local head_end = max_bytes
    while head_end > 0 and continuation_byte(text:byte(head_end + 1)) do head_end = head_end - 1 end
    return text:sub(1, head_end)
end

-- The last max_bytes of text or fewer, starting on a character boundary.
function text_clamp.tail(text: string, max_bytes: number): string
    if #text <= max_bytes then return text end
    local tail_start = #text - max_bytes + 1
    while continuation_byte(text:byte(tail_start)) do tail_start = tail_start + 1 end
    return text:sub(tail_start)
end

return text_clamp
