-- The wake hub of one session process (EE2-2710, architecture 4.5 step 8).
--
-- The session inbox tells the approval gate what happened while it waits,
-- without ever blocking. The gate arms a waiter before it writes its
-- requests; the inbox calls notify(kind) at the points of the signal table:
--
--   decision, revoked   after the decision or revocation commit (S8)
--   steering            route_input, after a new pending steering input is stored
--   finish              FINISH_AND_EXIT and deletion, where the finish is accepted
--   deleted             SESSION_UPDATED with the row gone
--   exiting             supervisor cancel, ingress or bus failure, before settle_exit
--   surfaces            the parent plugin sent a new live set of approval UI surfaces
--   stop                accept_stop, before bus:request_stop
--
-- notify sets the kind in the waiter's flags and puts one token into the
-- waiter's channel (capacity 1) without blocking; a full channel already
-- holds a wake-up, so the token is dropped and the flag carries the kind.
-- After every wake the gate rereads committed state, so a dropped token loses
-- nothing. `finish`, `deleted` and `exiting` also stay set on the hub: a
-- waiter armed later starts with them set and its channel already holding a
-- token. Without an armed waiter notify only records those sticky kinds.
--
-- The batch cancellation channel (architecture 4.5 step 9): before release
-- the gate registers the batch with register_batch_cancel and passes the
-- channel to caller:execute. Accepting Stop (accept_stop, before
-- bus:request_stop returns), exit or deletion closes it synchronously, in the
-- inbox coroutine; nothing depends on a separately scheduled coroutine. A
-- channel registered after such a signal was accepted is closed at once.
-- Everything here runs in the session process, whose coroutines are
-- cooperative, so no lock is needed.
local wake = {}

wake.KIND = {
    DECISION = "decision",
    REVOKED = "revoked",
    STEERING = "steering",
    FINISH = "finish",
    DELETED = "deleted",
    EXITING = "exiting",
    SURFACES = "surfaces",
    STOP = "stop",
}

local KNOWN = {}
for _, kind in pairs(wake.KIND) do KNOWN[kind] = true end
local STICKY = { [wake.KIND.FINISH] = true, [wake.KIND.DELETED] = true, [wake.KIND.EXITING] = true }
-- Signals that end every batch of the session, whatever its turn.
local CANCELS = { [wake.KIND.DELETED] = true, [wake.KIND.EXITING] = true }

local hub_methods = {}
hub_methods.__index = hub_methods

-- Puts one token into the waiter's channel unless it already holds one.
local function signal(waiter: any)
    channel.select({ waiter.channel:case_send(true), default = true })
end

function wake.new(): any
    return setmetatable({
        sticky = {} :: {[string]: boolean},
        waiter = nil :: any,
        cancel = nil :: any,
        stopped_turn = nil :: any,
    }, hub_methods)
end

-- Arms a waiter for `batch_id` and returns it: { batch_id, channel, flags }.
-- The channel has capacity 1. A new waiter replaces the previous one (the
-- session runs one batch at a time). Kinds that are already sticky on the hub
-- are set in its flags and its channel holds a token, so the gate sees them
-- on its first select.
function hub_methods:arm(batch_id: any): any
    local waiter = { batch_id = batch_id, channel = channel.new(1), flags = {} :: {[string]: boolean} }
    local sticky_seen = false
    for kind in pairs(self.sticky) do
        waiter.flags[kind] = true
        sticky_seen = true
    end
    if sticky_seen then signal(waiter) end
    self.waiter = waiter
    return waiter
end

-- Removes the armed waiter. With `waiter`, only when it is still the armed one.
function hub_methods:disarm(waiter: any?)
    if waiter ~= nil and self.waiter ~= waiter then return end
    self.waiter = nil
end

-- Returns the flags set since the last take and clears them.
function wake.take(waiter: any): {[string]: boolean}
    local flags = waiter.flags
    waiter.flags = {}
    return flags
end

-- Whether a sticky kind (finish, deleted, exiting) was signalled.
function hub_methods:is_set(kind: string): boolean
    return self.sticky[kind] == true
end

local function close_cancel(self: any)
    local registered = self.cancel
    if registered and not registered.closed then
        registered.closed = true
        registered.channel:close()
    end
end

-- Records `kind` and wakes the armed waiter. Never blocks. Returns true when
-- a waiter was armed. An unknown kind is an error of the caller.
function hub_methods:notify(kind: string): boolean
    if not KNOWN[kind] then error("unknown wake kind: " .. tostring(kind)) end
    if STICKY[kind] then self.sticky[kind] = true end
    if CANCELS[kind] then close_cancel(self) end
    local waiter = self.waiter
    if not waiter then return false end
    waiter.flags[kind] = true
    signal(waiter)
    return true
end

-- A finish was taken back (cancel_finish: a client returned before the
-- session started to finish). Later batches no longer close for it.
function hub_methods:cancel_finish()
    self.sticky[wake.KIND.FINISH] = nil
end

-- The inbox accepted a Stop for the turn `turn_id` (the command bus turn, nil
-- when none runs). Called before bus:request_stop: closes the registered
-- batch channel at once, remembers the turn, so a batch of that turn that
-- registers later starts closed, and wakes the waiter.
function hub_methods:accept_stop(turn_id: any)
    if turn_id ~= nil then self.stopped_turn = turn_id end
    close_cancel(self)
    self:notify(wake.KIND.STOP)
end

-- Registers the cancellation channel of `batch_id`, which belongs to the turn
-- `turn_id`, and returns it. The channel starts closed when deletion or exit
-- was accepted, or a Stop of the same turn. It replaces any earlier
-- registration.
function hub_methods:register_batch_cancel(batch_id: any, turn_id: any): any
    local registered = { batch_id = batch_id, turn_id = turn_id, channel = channel.new(), closed = false }
    self.cancel = registered
    local stopped = turn_id ~= nil and self.stopped_turn == turn_id
    if stopped or self.sticky[wake.KIND.DELETED] or self.sticky[wake.KIND.EXITING] then
        close_cancel(self)
    end
    return registered.channel
end

-- Whether the registered channel of `batch_id` is closed.
function hub_methods:batch_cancelled(batch_id: any): boolean
    local registered = self.cancel
    return registered ~= nil and registered.batch_id == batch_id and registered.closed
end

-- Forgets the registration of `batch_id` after the batch settled.
function hub_methods:unregister_batch_cancel(batch_id: any)
    if self.cancel and self.cancel.batch_id == batch_id then self.cancel = nil end
end

return wake
