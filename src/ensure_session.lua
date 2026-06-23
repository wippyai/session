local service = require("service")

local M = {}

function M.handle(args)
    return service.ensure(args)
end

return M
