local logger = require("logger"):named("session.inventory")

local M = {}

function M.is_not_found(err)
    return type(err) == "userdata" and err:kind() == "NotFound"
end

function M.send(user_id, topic, payload)
    local hub, err = process.registry.lookup("user." .. user_id)
    if err and not M.is_not_found(err) then return nil, err end
    if not hub then return true end
    return process.send(hub, topic, payload)
end

function M.warn(topic, err)
    logger:warn("Failed to publish committed change", { topic = topic, error = tostring(err) })
end

return M
