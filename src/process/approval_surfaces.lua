-- Approval UI surfaces per session, kept by the session plugin
-- (docs/tool-approval-protocol.md section 3). A surface is a live client connection that declared it
-- renders approval cards for a session: the tool_approval_surface command with
-- `enabled: true`, or `tool_approval_ui: 1` in session_message
-- data.runtime_context. A connection withdraws with the same command and
-- `enabled: false`, or by closing.
--
-- Pure state: no process calls. The plugin monitors each declaring
-- connection (one reference per session it declared for, shared with the
-- Attention broker's monitor count), and sends a session's live set to its
-- Session process on every change, so the set survives a Session process
-- restart while the connections stay open. A withdrawn declaration comes back
-- only through a new declaration; a reopen or a later message that does not
-- declare leaves it withdrawn.
local approval_surfaces = {}

local tracker = {}
tracker.__index = tracker

function approval_surfaces.new(): any
    return setmetatable({
        -- session_id -> { [conn_pid] = true }
        sessions = {} :: {[string]: {[string]: boolean}},
        -- session_id -> revision of its live set, moving up on every change
        revisions = {} :: {[string]: number},
    }, tracker)
end

-- Whether a client payload value declares a surface: a positive integer
-- capability version (`tool_approval_ui: 1`).
function approval_surfaces.declares(value: any): boolean
    return type(value) == "number" and value >= 1 and value % 1 == 0
end

local function valid_id(value: any): boolean
    return type(value) == "string" and value ~= ""
end

local function bump(self: any, session_id: string)
    self.revisions[session_id] = (self.revisions[session_id] or 0) + 1
end

-- Records that `conn_pid` renders approval cards for `session_id`. Returns
-- true when the declaration is new (the plugin then takes a monitor
-- reference and sends the set), false when it was already recorded.
function tracker:declare(session_id: any, conn_pid: any): boolean
    if not valid_id(session_id) or not valid_id(conn_pid) then return false end
    local set = self.sessions[session_id]
    if not set then
        set = {}
        self.sessions[session_id] = set
    end
    if set[conn_pid] then return false end
    set[conn_pid] = true
    bump(self, session_id)
    return true
end

-- Removes the declaration of `conn_pid` for `session_id`. Returns true when
-- one was removed (the plugin then releases a monitor reference and sends
-- the set). The session stays known with an empty set.
function tracker:withdraw(session_id: any, conn_pid: any): boolean
    local set = valid_id(session_id) and self.sessions[session_id] or nil
    if not set or not valid_id(conn_pid) or not set[conn_pid] then return false end
    set[conn_pid] = nil
    bump(self, session_id)
    return true
end

-- A connection closed: removes all of its declarations. Returns the IDs of
-- the sessions whose live set changed, sorted.
function tracker:drop_connection(conn_pid: any): {string}
    local changed = {}
    if not valid_id(conn_pid) then return changed end
    for session_id, set in pairs(self.sessions) do
        if set[conn_pid] then
            set[conn_pid] = nil
            bump(self, session_id)
            table.insert(changed, session_id)
        end
    end
    table.sort(changed)
    return changed
end

-- Whether any connection ever declared for the session in this plugin.
function tracker:known(session_id: any): boolean
    return valid_id(session_id) and self.sessions[session_id] ~= nil
end

-- The number of live surfaces of the session.
function tracker:live(session_id: any): number
    local set = valid_id(session_id) and self.sessions[session_id] or nil
    local count = 0
    for _ in pairs(set or {}) do count = count + 1 end
    return count
end

-- The payload of the dedicated topic to the Session process:
-- { session_id, live, revision }. Connection IDs stay in the plugin.
function tracker:snapshot(session_id: string): any
    return { session_id = session_id, live = self:live(session_id), revision = self.revisions[session_id] or 0 }
end

return approval_surfaces
