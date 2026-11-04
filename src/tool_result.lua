local tool_result = {}

function tool_result.withdrawal_notice(stale: any): string?
    if stale == nil or stale == false then return nil end
    local why = type(stale) == "string" and stale or ""
    return "STALE INFO: this result was withdrawn by the tool that produced " ..
        "it and no longer describes the current state." ..
        (why ~= "" and (" " .. why) or "") ..
        " Do not answer from it. Call the tool again if you need this."
end

return tool_result
