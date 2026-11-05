local uuid = require("uuid")

-- The developer row that closes a turn cut short, for
-- message_repo.stop_with_input_rollback, which skips it when the history
-- already holds one for that turn. It tells the model not to resume the turn,
-- and the form state reads it as the turn not having finished.

local interruption_boundary = {}

-- A boundary for `reason`: "stop" for a user's Stop, "recovery" for a turn
-- that a crash or a restart cut off. Returns the boundary, or nil and an error.
function interruption_boundary.new(reason)
    local id, err = uuid.v7()
    if not id then return nil, err end
    local detail = reason == "stop" and "The user cancels the preceding turn."
        or "The preceding turn is interrupted before completion; its outcome may be unknown."
    return {
        message_id = id,
        data = detail .. " Do not automatically resume that turn or carry out its remaining instructions. "
            .. "Follow subsequent user messages as new requests, including an explicit request to continue.",
        metadata = { preserve_position = true, interruption = { reason = reason } },
    }
end

return interruption_boundary
