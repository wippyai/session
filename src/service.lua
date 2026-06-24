local json = require("json")
local uuid = require("uuid")
local consts = require("consts")
local session_repo = require("session_repo")
local context_repo = require("context_repo")

type Session = {
    session_id: string,
    user_id: string,
    status: string?,
    primary_context_id: string,
    title: string,
    kind: string,
    meta: {[string]: any},
    config: {[string]: any},
    public_meta: {[string]: any},
    start_date: string?,
    last_message_date: string?,
}

type EnsureSessionArgs = {
    session_id: any?,
    user_id: any?,
    kind: any?,
    title: any?,
    meta: any?,
    config: any?,
    primary_context_id: any?,
    primary_context_data: any?,
    reset_status: any?,
}

type EnsureSessionResult = {
    session: Session,
    created: boolean,
    recovered: boolean,
    primary_context_id: string,
}

type GetSessionArgs = {
    session_id: any?,
    user_id: any?,
}

type UpdateSessionArgs = {
    session_id: any?,
    updates: any?,
}

type DeleteSessionArgs = {
    session_id: any?,
    user_id: any?,
}

local M = {}

local function required_string(value, name)
    if type(value) ~= "string" or value == "" then
        return nil, name .. " is required"
    end
    return value, nil
end

local function optional_string(value, name, default)
    if value == nil then
        return default or "", nil
    end
    if type(value) ~= "string" then
        return nil, name .. " must be a string"
    end
    return value, nil
end

local function optional_table(value, name)
    if value == nil then
        return {}, nil
    end
    if type(value) ~= "table" then
        return nil, name .. " must be a table"
    end
    return value, nil
end

local function encode_context_data(data)
    if data == nil then
        return "{}", nil
    end
    if type(data) == "string" then
        return data, nil
    end
    if type(data) == "table" then
        local encoded, err = json.encode(data)
        if err then
            return nil, "Failed to encode primary_context_data: " .. tostring(err)
        end
        return encoded, nil
    end
    return nil, "primary_context_data must be a string or table"
end

local function should_reset_status(status)
    return status == consts.STATUS.RUNNING or status == consts.STATUS.FAILED
end

local function normalize_existing_session(session: Session, reset_status: boolean): (EnsureSessionResult?, string?)
    if reset_status and should_reset_status(session.status) then
        local updated, err = session_repo.update_session_meta(session.session_id, {
            status = consts.STATUS.IDLE
        })
        if err then
            return nil, err
        end
        session.status = consts.STATUS.IDLE
    end

    return {
        session = session,
        created = false,
        recovered = true,
        primary_context_id = session.primary_context_id
    }, nil
end

local function create_session(args: EnsureSessionArgs, session_id: string, user_id: string): (EnsureSessionResult?, string?)
    local title, title_err = optional_string(args.title, "title", "")
    if title_err then
        return nil, title_err
    end

    local kind, kind_err = optional_string(args.kind, "kind", consts.SESSION_KINDS.DEFAULT)
    if kind_err then
        return nil, kind_err
    end

    local meta, meta_err = optional_table(args.meta, "meta")
    if meta_err then
        return nil, meta_err
    end

    local config, config_err = optional_table(args.config, "config")
    if config_err then
        return nil, config_err
    end

    local context_id = args.primary_context_id
    if context_id == nil then
        context_id = uuid.v7()
    end
    local normalized_context_id, context_id_err = required_string(context_id, "primary_context_id")
    if context_id_err then
        return nil, context_id_err
    end
    context_id = normalized_context_id :: string

    local context_data, data_err = encode_context_data(args.primary_context_data)
    if data_err then
        return nil, data_err
    end

    local _, context_err = context_repo.create(
        context_id,
        consts.CONTEXT_TYPES.SESSION,
        context_data
    )
    if context_err then
        return nil, context_err
    end

    local session, session_err = session_repo.create(
        session_id,
        user_id,
        context_id,
        title,
        kind,
        meta,
        config
    )
    if session_err then
        context_repo.delete(context_id)
        return nil, session_err
    end

    local created_session = session :: Session
    created_session.status = consts.STATUS.IDLE

    return {
        session = created_session,
        created = true,
        recovered = false,
        primary_context_id = context_id
    } :: EnsureSessionResult, nil
end

function M.ensure(args: EnsureSessionArgs): (EnsureSessionResult?, string?)
    if type(args) ~= "table" then
        return nil, "args must be a table"
    end

    local session_id, session_err = required_string(args.session_id, "session_id")
    if session_err then
        return nil, session_err
    end

    local user_id, user_err = required_string(args.user_id, "user_id")
    if user_err then
        return nil, user_err
    end

    local session, get_err = session_repo.get(session_id, user_id)
    if session then
        return normalize_existing_session(session :: Session, args.reset_status ~= false)
    end
    if get_err and get_err ~= "Session not found" then
        return nil, get_err
    end

    return create_session(args, session_id, user_id)
end

function M.get(args: GetSessionArgs): (Session?, string?)
    if type(args) ~= "table" then
        return nil, "args must be a table"
    end

    local session_id, session_err = required_string(args.session_id, "session_id")
    if session_err then
        return nil, session_err
    end

    local user_id = args.user_id
    if user_id ~= nil then
        local normalized, user_err = required_string(user_id, "user_id")
        if user_err then
            return nil, user_err
        end
        user_id = normalized
    end

    local session, err = session_repo.get(session_id, user_id)
    return session :: Session?, err
end

function M.update(args: UpdateSessionArgs)
    if type(args) ~= "table" then
        return nil, "args must be a table"
    end

    local session_id, session_err = required_string(args.session_id, "session_id")
    if session_err then
        return nil, session_err
    end
    if type(args.updates) ~= "table" then
        return nil, "updates table is required"
    end

    return session_repo.update_session_meta(session_id, args.updates)
end

function M.delete(args: DeleteSessionArgs)
    if type(args) ~= "table" then
        return nil, "args must be a table"
    end

    local session_id, session_err = required_string(args.session_id, "session_id")
    if session_err then
        return nil, session_err
    end

    local user_id = args.user_id
    if user_id ~= nil then
        local normalized, user_err = required_string(user_id, "user_id")
        if user_err then
            return nil, user_err
        end
        user_id = normalized
    end

    local session, get_err = session_repo.get(session_id, user_id)
    if not session then
        return nil, get_err or "Session not found"
    end

    local result, delete_err = session_repo.delete(session_id)
    if delete_err then
        return nil, delete_err
    end

    local context_id = session.primary_context_id
    if type(context_id) == "string" and context_id ~= "" then
        local _, context_err = context_repo.delete(context_id)
        if context_err and context_err ~= "Context not found" then
            result.primary_context_deleted = false
            result.primary_context_error = context_err
            return result, nil
        end
        result.primary_context_deleted = true
    end

    return result, nil
end

return M
