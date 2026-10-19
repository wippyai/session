local M = {}

function M.get_info(args)
    if type(args) ~= "table" or type(args.file_uuid) ~= "string" then
        return nil, "file_uuid is required"
    end
    return {
        size = 1,
        mime_type = "text/plain",
        metadata = { filename = "contract-fixture.txt" },
    }
end

return M
