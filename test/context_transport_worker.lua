local writer = require('writer')
local handlers = require('message_handlers')
local staging = require('context_staging_repo')
local sessions = require('session_repo')

local function run(args)
    local reply_pid = args.reply_pid :: string
    local sent, send_err = process.send(reply_pid, 'context_worker_started', {})
    if not sent then error('context worker send failed') end
    local session_writer, writer_err = writer.new(args.session_id)
    assert(process.send(reply_pid, 'context_worker_ready', { authorized = session_writer ~= nil, reason = writer_err }))
    local inbox = process.inbox()
    while true do
        local msg = inbox:receive()
        if msg:topic() == 'context_worker_stop' then return end
        local request = msg:payload():data()
        local result = {}
        if request.action == 'create' then
            result.value, result.error = staging.create(args.user_id, args.session_id, request.request_id, request.canonical, request.expiry)
        elseif request.action == 'cancel' then
            result.value, result.error = staging.cancel(args.user_id, args.session_id, request.request_id, request.id)
        elseif request.action == 'delete' then
            result.value, result.error = sessions.delete(args.session_id)
        elseif not session_writer then
            result.error = 'UNAUTHORIZED_WORKER'
        else
            local acknowledgements, echoes = {}, {}
            local add_message = assert(session_writer.add_message, 'session writer add_message unavailable')
            if request.pause_before_commit then
                session_writer.add_message = function(self, ...)
                    assert(process.send(reply_pid, 'context_worker_before_commit', {}))
                    local deadline = require('time').after('3s')
                    local selected = channel.select({ inbox:case_receive(), deadline:case_receive() })
                    assert(selected.channel ~= deadline and selected.ok, 'commit barrier timed out')
                    assert(selected.value:topic() == 'context_worker_continue', 'commit barrier cancelled')
                    return add_message(self, ...)
                end
            end
            local upstream = {
                command_success = function(_, request_id, details) table.insert(acknowledgements, { request_id = request_id, success = true, details = details }) end,
                command_error = function(_, request_id, code) table.insert(acknowledgements, { request_id = request_id, success = false, code = code }) end,
                message_received = function(_, message_id, text, files, context, request_id) table.insert(echoes, { message_id = message_id, attachments = context, request_id = request_id }) end,
            }
            local outcome, err = handlers.handle_message({ session_id = args.session_id, user_id = args.user_id,
                writer = session_writer, upstream = upstream }, { request_id = request.request_id, data = request.data })
            result.value, result.error = outcome, err
            session_writer.add_message = add_message
            result.acknowledgements, result.echoes = acknowledgements, echoes
        end
        result.sequence = request.sequence
        assert(process.send(reply_pid, 'context_worker_result', result))
    end
end

return { run = run }
