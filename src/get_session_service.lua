local service = require("service")

local M = {}

function M.handle(args)
    return service.get(args)
end

return M
