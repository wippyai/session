local agent = require("agent")
local prompt = require("prompt")

-- Probes the resolved Framework agent so suites can run its capability-dependent
-- cases; WIPPY_TEST_REQUIRE_CASES=1 makes those cases mandatory instead.
local function probe_step(runtime_options: table): (boolean, any, table)
    local runner = agent.new({ id = "capability-probe", name = "Capability probe",
        description = "Detects Framework step capabilities", prompt = "Probe." })
    local previous = agent._llm
    local seen = { generated = false, options = nil :: any }
    agent._llm = { generate = function(_, options)
        seen.generated = true
        seen.options = options
        return { result = "", tokens = {} }
    end }
    local ok, result = pcall(runner.step, runner, prompt.new(), runtime_options)
    agent._llm = previous
    return ok, result, seen
end

local function stops_before_generation(): boolean
    local ok, result, seen = probe_step({ stop_check = function() return true end })
    return ok and type(result) == "table" and result.stopped == true and not seen.generated
end

-- The agent hands the host cancel channel to the model call, which cancels it in flight.
local function cancels_in_flight(): boolean
    local cancel = channel.new()
    local ok, _, seen = probe_step({ cancel = cancel })
    return ok and seen.options ~= nil and seen.options.cancel == cancel
end

return { stops_before_generation = stops_before_generation, cancels_in_flight = cancels_in_flight }
