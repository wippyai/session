local consts = require("consts")

local input_metadata = {}

function input_metadata.validate(message): (boolean, string?)
    local metadata = message.metadata
    if type(metadata) ~= "table" or metadata.input == nil then return true end
    if message.type ~= consts.MSG_TYPE.USER then
        return false, "Steering metadata is only valid on user messages"
    end
    local input = metadata.input
    if type(input) ~= "table" then return false, "Steering metadata must be a table" end
    if input.state ~= "pending" and input.state ~= "applied" then
        return false, "Steering state must be pending or applied"
    end
    local anchor = input.after_message_id
    if input.state == "pending" and anchor ~= nil then
        return false, "Pending steering input cannot have an anchor"
    end
    if anchor ~= nil and (type(anchor) ~= "string" or anchor == "") then
        return false, "Steering anchor must be a non-empty string"
    end
    return true
end

return input_metadata
