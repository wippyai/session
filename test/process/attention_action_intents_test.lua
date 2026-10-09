local test = require('test')
local intents = require('attention_action_intents')

local function define_tests()
    describe('Accepted-message browser authority', function()
        local store, broker, now
        before_each(function()
            now = 100
            broker = { binds = 0, cancels = 0 }
            function broker:bind_turn(intent) self.binds = self.binds + 1; self.last = intent; return { capability = 'test' } end
            function broker:cancel_session() self.cancels = self.cancels + 1 end
            store = intents.new(broker, 'broker')
            store.now = function() return now end
        end)
        local function intent(request)
            return { session_id = 'session', session_pid = 'worker', request_id = request or 'request', conn_pid = 'original-tab' }
        end
        local function accepted()
            return { type = 'user', session_id = 'session', message_id = 'message', request_id = 'request' }
        end
        local function request(nonce)
            return { session_id = 'session', message_id = 'message', request_id = 'request', intent_nonce = nonce }
        end
        it('binds only after acceptance and keeps original tab authority on duplicate delivery', function()
            local staged = assert(store:stage(intent()))
            local other = intent(); other.conn_pid = 'other-tab'
            test.eq(store:stage(other).deferred_action_nonce, staged.deferred_action_nonce)
            test.eq(broker.binds, 0)
            local runtime = store:activate('worker', accepted(), request(staged.deferred_action_nonce))
            test.eq(runtime.broker_pid, 'broker')
            test.eq(broker.last.conn_pid, 'original-tab')
            test.eq(store:activate('worker', accepted(), request(staged.deferred_action_nonce)), runtime)
            test.eq(broker.binds, 1)
        end)
        it('rejects a mismatched persisted message without consuming the intent', function()
            local staged = assert(store:stage(intent()))
            local wrong = accepted(); wrong.message_id = 'other'
            local value, err = store:activate('worker', wrong, request(staged.deferred_action_nonce))
            test.is_nil(value); test.eq(err, 'invalid_message'); test.eq(store.count, 1)
            test.eq(broker.binds, 0)
        end)
        it('does not bind expired or foreign-worker authority', function()
            local staged = assert(store:stage(intent()))
            test.is_nil(store:activate('foreign-worker', accepted(), request(staged.deferred_action_nonce)))
            test.eq(broker.binds, 0)
            store:finish('session')
            staged = assert(store:stage(intent()))
            now = 221
            test.is_nil(store:activate('worker', accepted(), request(staged.deferred_action_nonce)))
            test.eq(broker.binds, 0)
        end)
        it('bounds pending authority and removes it on session exit', function()
            for index = 1, 128 do assert(store:stage(intent('request-' .. index))) end
            test.is_nil(store:stage(intent('overflow')))
            store:forget('session')
            test.eq(store.count, 0)
            test.is_nil((next(store.pending)))
            test.is_nil((next(store.by_request)))
        end)
    end)
end

return test.run_cases(define_tests)
