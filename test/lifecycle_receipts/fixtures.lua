local function fail(_payload)
    return nil, "lifecycle receipt failure"
end

return { fail = fail }
