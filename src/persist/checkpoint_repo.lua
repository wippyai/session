local sql = require("sql")
local json = require("json")
local time = require("time")
local consts = require("consts")

local checkpoint_repo = {}

-- Keep the prompt anchor, summary, audit metadata and compact request in one
-- transaction. A failed or interrupted write must leave the old prompt usable.
function checkpoint_repo.commit(session_id, user_id, op, summary, message_metadata, summary_id)
    local resource = consts.get_db_resource()
    local db, db_err = sql.get(resource)
    if not db then return nil, db_err end
    local tx, begin_err = db:begin()
    if not tx then db:release(); return nil, begin_err end
    local function abort(err)
        tx:rollback()
        db:release()
        return nil, err
    end
    local sessions, session_err = sql.builder.select("meta", "primary_context_id"):from("sessions")
        :where("session_id = ? AND user_id = ?", session_id, user_id):run_with(tx):query()
    if session_err or not sessions or #sessions ~= 1 then return abort(session_err or "Session not found") end
    local session = sessions[1]
    local messages, message_err = sql.builder.select("metadata"):from("messages")
        :where("session_id = ? AND message_id = ?", session_id, op.message_id):run_with(tx):query()
    if message_err or not messages or #messages ~= 1 then return abort(message_err or "Checkpoint message not found in session") end
    local contexts, context_err = sql.builder.select("data"):from("contexts")
        :where("context_id = ?", session.primary_context_id):run_with(tx):query()
    if context_err or not contexts or #contexts ~= 1 then return abort(context_err or "Primary context not found") end

    local meta, meta_err = json.decode(session.meta or "{}")
    if meta_err or type(meta) ~= "table" then return abort(meta_err or "Invalid session metadata") end
    local context, decode_err = json.decode(contexts[1].data or "{}")
    if decode_err or type(context) ~= "table" then return abort(decode_err or "Invalid primary context") end
    local metadata, metadata_err = json.decode(messages[1].metadata or "{}")
    if metadata_err or type(metadata) ~= "table" then return abort(metadata_err or "Invalid message metadata") end
    for key, value in pairs(message_metadata) do metadata[key] = value end
    meta.checkpoints = type(meta.checkpoints) == "table" and meta.checkpoints or {}
    local already_recorded = false
    for _, checkpoint in ipairs(meta.checkpoints) do
        if checkpoint.checkpoint_id == op.checkpoint_id then already_recorded = true end
    end
    local now = time.now():format(time.RFC3339NANO)
    if not already_recorded then
        meta.checkpoints[#meta.checkpoints + 1] = {
            checkpoint_id = op.checkpoint_id, message_id = op.message_id,
            created_at = now, trigger_tokens = op.trigger_tokens or 0,
            checkpoint_tokens = message_metadata.checkpoint_tokens,
        }
    end
    context[consts.CONTEXT_KEYS.CURRENT_CHECKPOINT_ID] = op.checkpoint_id
    if op.clear_request then context[consts.CONTEXT_KEYS.CHECKPOINT_REQUESTED] = nil end
    local meta_json, encode_err = json.encode(meta)
    if encode_err then return abort(encode_err) end
    local context_json, context_encode_err = json.encode(context)
    if context_encode_err then return abort(context_encode_err) end
    local metadata_json, metadata_encode_err = json.encode(metadata)
    if metadata_encode_err then return abort(metadata_encode_err) end

    local _, delete_err = sql.builder.delete("session_contexts")
        :where("session_id = ? AND type = ?", session_id, consts.CONTEXT_TYPES.CONVERSATION_SUMMARY):run_with(tx):exec()
    if delete_err then return abort(delete_err) end
    local _, insert_err = sql.builder.insert("session_contexts"):set_map({
        id = summary_id, session_id = session_id, type = consts.CONTEXT_TYPES.CONVERSATION_SUMMARY,
        text = summary, time = now,
    }):run_with(tx):exec()
    if insert_err then return abort(insert_err) end
    local _, message_write_err = sql.builder.update("messages"):set("metadata", metadata_json)
        :where("session_id = ? AND message_id = ?", session_id, op.message_id):run_with(tx):exec()
    if message_write_err then return abort(message_write_err) end
    local _, session_write_err = sql.builder.update("sessions"):set("meta", meta_json)
        :where("session_id = ?", session_id):run_with(tx):exec()
    if session_write_err then return abort(session_write_err) end
    local _, context_write_err = sql.builder.update("contexts"):set("data", context_json)
        :where("context_id = ?", session.primary_context_id):run_with(tx):exec()
    if context_write_err then return abort(context_write_err) end
    local committed, commit_err = tx:commit()
    if not committed then return abort(commit_err or "Checkpoint commit failed") end
    db:release()
    return true
end

return checkpoint_repo
