local service = require("service")

local M = {}

function M.handle(args)
    return service.delete(args)
end

return M
