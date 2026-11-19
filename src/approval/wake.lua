-- The wake hub of one session process.
--
-- The session inbox tells the approval gate what happened while it waits,
-- without ever blocking. The gate arms a waiter before it writes its
-- requests; the inbox calls notify(kind) where the signal is committed:
--
--   decision, revoked   after the decision or revocation commit
--   steering            route_input, after a new pending steering input is stored
--   finish              FINISH_AND_EXIT, where the finish is accepted
--   deleted             SESSION_UPDATED with the row gone
--   exiting             supervisor cancel, ingress or bus failure, before settle_exit
--   surfaces            the parent plugin sent a new live set of approval UI surfaces
--   stop                route_input, after the Stop commit
--
-- notify puts one token into the waiter's channel (capacity 1) without
-- blocking; a full channel already holds a wake-up, so the token is dropped.
-- After every wake the gate rereads committed state, so a dropped token loses
-- nothing. `finish`, `deleted` and `exiting` also stay set on the hub: a
-- waiter armed later starts with a token in its channel. Everything here runs
-- in the session process, whose coroutines are cooperative, so no lock is
-- needed.
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

local hub_methods = {}
hub_methods.__index = hub_methods

-- Puts one token into the waiter's channel unless it already holds one.
local function signal(waiter: any)
    channel.select({ waiter.channel:case_send(true), default = true })
end

function wake.new(): any
    return setmetatable({ sticky = {} :: {[string]: boolean}, waiter = nil :: any }, hub_methods)
end

-- Arms a waiter for `batch_id` and returns it: { batch_id, channel }. The
-- channel has capacity 1. A new waiter replaces the previous one (the session
-- runs one batch at a time). When a sticky kind is already set, its channel
-- holds a token, so the gate sees it on its first select.
function hub_methods:arm(batch_id: any): any
    local waiter = { batch_id = batch_id, channel = channel.new(1) }
    if next(self.sticky) ~= nil then signal(waiter) end
    self.waiter = waiter
    return waiter
end

-- Removes the armed waiter. With `waiter`, only when it is still the armed one.
function hub_methods:disarm(waiter: any?)
    if waiter ~= nil and self.waiter ~= waiter then return end
    self.waiter = nil
end

-- Whether a sticky kind (finish, deleted, exiting) was signalled.
function hub_methods:is_set(kind: string): boolean
    return self.sticky[kind] == true
end

-- Records `kind` and wakes the armed waiter. Never blocks. Returns true when
-- a waiter was armed. An unknown kind is an error of the caller.
function hub_methods:notify(kind: string): boolean
    if not KNOWN[kind] then error("unknown wake kind: " .. tostring(kind)) end
    if STICKY[kind] then self.sticky[kind] = true end
    local waiter = self.waiter
    if not waiter then return false end
    signal(waiter)
    return true
end

-- A finish was taken back (a client returned before the session started to
-- finish). Later batches no longer close for it.
function hub_methods:cancel_finish()
    self.sticky[wake.KIND.FINISH] = nil
end

return wake
