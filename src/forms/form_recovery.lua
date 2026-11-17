local consts = require("consts")
local artifact_repo = require("artifact_repo")
local form_artifact = require("form_artifact")
local form_meta = require("form_meta")

-- The forms step of pending call recovery. An ask_user call whose form was
-- committed can still be pending when the process stopped after storing the
-- form but before settling the call. The form exists and the user can see
-- it, so the call succeeded; reporting it as interrupted would make the
-- agent ask again. The session process passes settle_call to
-- message_repo.recover_pending wherever it recovers pending calls.

local form_recovery = {}

-- The metadata that settles `row`, a pending call row (metadata decoded),
-- as the ask_user result when its forms operation created a committed form
-- whose server-written origin names this call; a call cannot claim a form
-- another call created. nil when there is no such form, or nil and an error
-- when the lookup failed: recovery then stops and runs again later instead
-- of reporting the call as interrupted while its form exists.
function form_recovery.settle_call(row: any): (any, string?)
    local operations = type(row.metadata) == "table" and row.metadata.control_operations or nil
    local forms = type(operations) == "table" and operations.forms or nil
    local first = type(forms) == "table" and forms[1] or nil
    if type(first) ~= "table" or type(first.artifact_id) ~= "string" then return nil, nil end

    local artifact, err = artifact_repo.find(first.artifact_id)
    if err then return nil, "Failed to read form artifact: " .. tostring(err) end
    if not artifact or artifact.session_id ~= row.session_id then return nil, nil end

    local origin = form_meta.origin(form_meta.of(artifact.meta))
    if origin.tool_message_id ~= row.message_id then return nil, nil end
    if origin.call_id ~= nil and origin.call_id ~= row.metadata.call_id then return nil, nil end
    return {
        status = consts.FUNC_STATUS.SUCCESS,
        result = { message = form_artifact.created_message(artifact.title, artifact.artifact_id) },
    }, nil
end

return form_recovery
