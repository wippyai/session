local function apply(payload)
    if payload.phase == "after_step" then
        return { _control = { context = { session = { set = { native_behavior_applied = true } } } } }
    end
    return {}
end

return { apply = apply }
