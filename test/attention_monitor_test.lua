local time = require('time')
local test = require('test')

local function receive(receive_channel)
    local deadline = time.after('2s')
    local selected = channel.select({ receive_channel:case_receive(), deadline:case_receive() })
    assert(selected.channel ~= deadline, 'monitor fixture receive timed out')
    assert(selected.ok, 'monitor fixture channel closed')
    return selected.value
end

local function define_tests()
    test.describe('Attention real process monitor lifecycle', function()
        test.it('unmonitors a live process without terminating it, then monitors its exit', function()
            local inbox = process.inbox()
            local events = process.events()
            local worker_pid, spawn_err = process.spawn('app:attention_monitor_worker', 'app:processes', {
                reply_pid = process.pid(),
            })
            assert(worker_pid, spawn_err or 'monitor fixture spawn failed')
            local success, failure = pcall(function()
                local ready = receive(inbox)
                test.eq(ready:topic(), 'attention_monitor_ready')
                test.eq(ready:from(), worker_pid)

                local monitored, monitor_err = process.monitor(worker_pid)
                test.is_nil(monitor_err)
                test.is_true(monitored)
                local ping_sent, ping_err = process.send(worker_pid, 'attention_monitor_ping', {})
                test.is_nil(ping_err)
                test.is_true(ping_sent)
                local pong = receive(inbox)
                test.eq(pong:topic(), 'attention_monitor_pong')
                test.eq(pong:from(), worker_pid)

                local unmonitored, unmonitor_err = process.unmonitor(worker_pid)
                test.is_nil(unmonitor_err)
                test.is_true(unmonitored)
                local live_sent, live_err = process.send(worker_pid, 'attention_monitor_ping', {})
                test.is_nil(live_err)
                test.is_true(live_sent)
                local live_pong = receive(inbox)
                test.eq(live_pong:topic(), 'attention_monitor_pong')
                test.eq(live_pong:from(), worker_pid)

                local remonitored, remonitor_err = process.monitor(worker_pid)
                test.is_nil(remonitor_err)
                test.is_true(remonitored)
                local stopped, stop_err = process.send(worker_pid, 'attention_monitor_stop', {})
                test.is_nil(stop_err)
                test.is_true(stopped)
                local exited = receive(events)
                test.eq(exited.kind, process.event.EXIT)
                test.eq(exited.from, worker_pid)
                test.is_nil(exited.result.error)
            end)
            if not success then
                -- Cleanup is bounded even if monitor/unmonitor itself failed.
                process.send(worker_pid, 'attention_monitor_stop', {})
                process.cancel(worker_pid, '1s')
                error(failure)
            end
        end)
    end)
end

return test.run_cases(define_tests)
