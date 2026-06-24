local service = require("service")

local M = {}

function M.handle(args)
    return service.update(args)
end

return M
