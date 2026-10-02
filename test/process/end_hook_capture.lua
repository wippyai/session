local json = require("json")
local uuid = require("uuid")
local consts = require("consts")
local message_repo = require("message_repo")

local function run(args)
    local encoded, encode_err = json.encode(args)
    if encode_err then return nil, encode_err end
    local message_id, id_err = uuid.v7()
    if id_err then return nil, id_err end
    return message_repo.create(message_id, args.session_id, consts.MSG_TYPE.DEVELOPER,
        encoded, { test_end_hook = true })
end

return { run = run }
