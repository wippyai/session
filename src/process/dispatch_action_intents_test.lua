local test = require('test')
local intents = require('dispatch_action_intents')

local function define_tests()
    describe('Deferred dispatch action authority', function()
        local broker, store, now
        before_each(function()
            now = 100
            broker = { binds = 0, cancels = 0, last = nil }
            function broker:bind_turn(intent)
                self.binds, self.last = self.binds + 1, intent
                return { capability = 'private-test-authority' }
            end
            function broker:cancel_session() self.cancels = self.cancels + 1 end
            store = intents.new(broker, 'fixture-broker')
            store.now = function() return now end
        end)
        local function intent(request_id)
            return { session_id = 'fixture-session', request_id = request_id or 'fixture-request',
                session_pid = 'fixture-session-pid', user_id = 'fixture-user', conn_pid = 'original-connection' }
        end
        local function row()
            return { session_id = 'fixture-session', dispatch_id = 'fixture-dispatch', message_id = 'fixture-message',
                request_id = 'fixture-request', actor_id = 'fixture-user', generation = 1, state = 'started' }
        end
        local function request(nonce)
            return { dispatch_id = 'fixture-dispatch', message_id = 'fixture-message', generation = 1, intent_nonce = nonce }
        end
        it('records bounded intent without binding and preserves original authority across duplicate ingress and activation', function()
            local first = assert(store:stage(intent()))
            local changed = intent()
            changed.conn_pid = 'different-connection'
            local duplicate = assert(store:stage(changed))
            test.eq(first.deferred_action_nonce, duplicate.deferred_action_nonce)
            test.eq(broker.binds, 0)
            test.eq(broker.cancels, 0)
            local active = store:activate('fixture-session-pid', row(), request(first.deferred_action_nonce))
            test.eq(active.broker_pid, 'fixture-broker')
            test.eq(broker.last.conn_pid, 'original-connection')
            test.eq(broker.binds, 1)
            store:activate('fixture-session-pid', row(), request(first.deferred_action_nonce))
            test.eq(broker.binds, 1)
            test.eq(broker.cancels, 0)
        end)
        it('revokes a terminal dispatch once and never cancels a newer activated root', function()
            local staged = assert(store:stage(intent()))
            local active = row()
            store:activate('fixture-session-pid', active, request(staged.deferred_action_nonce))
            test.is_false(store:finish(active))
            active.state = 'completed'
            test.is_true(store:finish(active))
            test.is_false(store:finish(active))
            test.eq(broker.cancels, 1)
            store.activated[active.session_id] = { dispatch_id = 'newer-dispatch' }
            test.is_false(store:finish(active))
            test.eq(broker.cancels, 1)
        end)
        it('rejects mismatched generation before consuming intent and does not bind expired intent', function()
            local staged = assert(store:stage(intent()))
            local wrong = request(staged.deferred_action_nonce)
            wrong.generation = 2
            local value, err = store:activate('fixture-session-pid', row(), wrong)
            test.is_nil(value)
            test.eq(err, 'invalid_dispatch')
            test.eq(store.count, 1)
            test.eq(broker.cancels, 0)
            now = 221
            test.is_nil(store:activate('fixture-session-pid', row(), request(staged.deferred_action_nonce)))
            test.eq(broker.binds, 0)
            test.eq(broker.cancels, 1)
            test.eq(store.count, 0)
        end)
        it('caps private pending authority and forgets it when the authenticated session exits', function()
            for index = 1, 128 do assert(store:stage(intent('request-' .. index))) end
            test.is_nil(store:stage(intent('overflow')))
            test.eq(store.count, 128)
            store:forget('fixture-session')
            test.eq(store.count, 0)
            test.eq(next(store.pending), nil)
            test.eq(next(store.by_request), nil)
            test.eq(broker.binds, 0)
        end)
    end)
end

return test.run_cases(define_tests)
