local test = require("test")
local activation = require("activation")
local trait_config = require("trait_config")

local TRAIT = "wippy.session.traits:tool_approval"
local MARKER = { tool_approval = { schema = 1 } }
local NOW = "2026-11-18T12:00:00Z"

-- A session context with a fake writer that keeps config.tool_approval the
-- way writer:update_tool_approval does: mutate gets the committed value.
local function fake_ctx(opts: any?): any
    opts = opts or {}
    local stored = { value = opts.stored }
    local writes = {}
    local ctx = {
        session_id = "sess-activation",
        config = { agent_id = opts.agent_id or "app:agent", tool_approval = opts.stored },
        agent_ctx = { active_traits = opts.traits },
        approval_surfaces = opts.surfaces,
        writer = {
            update_tool_approval = function(_self, mutate)
                if opts.write_error then return nil, opts.write_error end
                local next_value = mutate(stored.value)
                if next_value == nil then return stored.value end
                stored.value = next_value
                table.insert(writes, next_value)
                return next_value
            end,
        },
    }
    return ctx, writes, stored
end

local function agent(options: any?): any
    return { id = "app:agent", agent_options = options or {} }
end

local function define_tests()
    describe("Tool approval activation: reading the agent", function()
        before_each(function()
            activation._now = function() return NOW end
            activation._enforcement = nil
            activation._agent_registry = nil
        end)
        after_each(function()
            activation._now = nil
            activation._enforcement = nil
            activation._agent_registry = nil
        end)

        it("finds the trait in string and object form and refuses a double listing", function()
            local listed, context, err = activation.find_listing({ "other:trait", TRAIT })
            test.is_true(listed)
            test.is_nil(context)
            test.is_nil(err)
            listed, context = activation.find_listing({ { id = TRAIT, context = { require = "all" } } })
            test.is_true(listed)
            test.eq(context.require, "all")
            listed = activation.find_listing({ "other:trait" })
            test.is_false(listed)
            listed = activation.find_listing(nil)
            test.is_false(listed)
            local _, _, twice = activation.find_listing({ TRAIT, { id = TRAIT, context = {} } })
            test.contains(tostring(twice), "listed more than once")
        end)

        it("accepts a listed trait with valid context and compiled options", function()
            local settings, listed, err = activation.check({ { id = TRAIT, context = { require = "all", timeout_seconds = 60 } } }, MARKER)
            test.is_nil(err)
            test.is_true(listed)
            test.eq(settings.require, "all")
            test.eq(settings.timeout_seconds, 60)
            test.eq(settings.approve_all, "off")
        end)

        it("fails closed on invalid context, missing compiled options and options without a listing", function()
            local _, _, invalid_context = activation.check({ { id = TRAIT, context = { require = "some" } } }, MARKER)
            test.contains(tostring(invalid_context), "tool_approval_config_invalid: require must be marked or all")
            local _, _, unknown_key = activation.check({ { id = TRAIT, context = { requre = "all" } } }, MARKER)
            test.contains(tostring(unknown_key), "tool_approval_config_invalid: unknown key requre")
            local _, _, no_options = activation.check({ TRAIT }, {})
            test.contains(tostring(no_options), "tool_approval_config_invalid: the compiled agent has no tool_approval options")
            local _, _, nil_options = activation.check({ TRAIT }, nil)
            test.contains(tostring(nil_options), "tool_approval_config_invalid")
            local _, listed, orphan = activation.check({ "other:trait" }, MARKER)
            test.is_true(listed)
            test.contains(tostring(orphan), "its trait list does not name " .. TRAIT)
            local _, _, unreadable = activation.check(nil, MARKER)
            test.contains(tostring(unreadable), "tool_approval_config_invalid")
        end)

        it("reports no opt-in for an agent that neither lists the trait nor carries its options", function()
            local settings, listed, err = activation.check({ "other:trait" }, { session_input = {} })
            test.is_nil(settings)
            test.is_false(listed)
            test.is_nil(err)
        end)

        it("reads the session trait overlay before the registry entry", function()
            local looked_up = false
            activation._agent_registry = {
                get_by_id = function() looked_up = true; return { traits = { TRAIT } } end,
                get_by_name = function() return nil, "not found" end,
            }
            local ctx = fake_ctx({ traits = { "other:trait" } })
            local traits = activation.raw_traits(ctx)
            test.eq(#traits, 1)
            test.eq(traits[1], "other:trait")
            test.is_false(looked_up, "the overlay replaces the agent's own list")

            local plain = fake_ctx({})
            local from_registry = activation.raw_traits(plain)
            test.is_true(looked_up)
            test.eq(from_registry[1], TRAIT)
        end)

        it("falls back to the lookup by name and returns nil for an unknown agent", function()
            local names = {}
            activation._agent_registry = {
                get_by_id = function() return nil, "no agent" end,
                get_by_name = function(name)
                    table.insert(names, name)
                    if name == "named" then return { traits = { TRAIT } } end
                    return nil, "no agent"
                end,
            }
            local ctx = fake_ctx({ agent_id = "named" })
            test.eq(activation.raw_traits(ctx)[1], TRAIT)
            local unknown = fake_ctx({ agent_id = "app:missing" })
            test.is_nil(activation.raw_traits(unknown))
            test.eq(#names, 2)
        end)
    end)

    describe("Tool approval activation: the stored record", function()
        it("creates the record at revision 1 with the current settings", function()
            local settings = trait_config.normalize({ approve_all = "batch" })
            local record = activation.merge(nil, settings, nil)
            test.is_true(record.active)
            test.eq(record.require, "marked")
            test.eq(record.approve_all, "batch")
            test.eq(record.timeout_seconds, 900)
            test.eq(record.max_requests_per_turn, 10)
            test.eq(record.revision, 1)
            test.is_nil(record.ui_declared_at)
        end)

        it("keeps require all and takes the other settings from the current agent", function()
            local stored = activation.merge(nil, trait_config.normalize({ require = "all", timeout_seconds = 60 }), nil)
            local next_record = activation.merge(stored, trait_config.normalize({ require = "marked", approve_all = "tool" }), nil)
            test.eq(next_record.require, "all", "the stricter require wins")
            test.eq(next_record.approve_all, "tool")
            test.eq(next_record.timeout_seconds, 900)
            test.eq(next_record.revision, 2)
        end)

        it("changes nothing when the settings are the same or the agent has no trait", function()
            local settings = trait_config.normalize({})
            local stored = activation.merge(nil, settings, nil)
            test.is_nil(activation.merge(stored, settings, nil))
            test.is_nil(activation.merge(stored, nil, nil), "an agent without the trait never changes the record")
            test.is_nil(activation.merge(nil, nil, NOW), "no record for an unprotected session")
        end)

        it("writes ui_declared_at once", function()
            local stored = activation.merge(nil, trait_config.normalize({}), nil)
            local declared = activation.merge(stored, nil, NOW)
            test.eq(declared.ui_declared_at, NOW)
            test.eq(declared.revision, 2)
            test.is_nil(activation.merge(declared, nil, "2026-11-18T13:00:00Z"), "the first time stays")
        end)
    end)

    describe("Tool approval activation: one agent step", function()
        before_each(function()
            activation._now = function() return NOW end
            activation._enforcement = nil
        end)
        after_each(function()
            activation._now = nil
            activation._enforcement = nil
        end)

        it("stores the activation and updates ctx.config in the same step", function()
            local ctx, writes = fake_ctx({ traits = { { id = TRAIT, context = { require = "all" } } } })
            local result, err = activation.apply(ctx, agent(MARKER))
            test.is_nil(err)
            test.is_true(result.protected)
            test.eq(#writes, 1)
            test.eq(ctx.config.tool_approval.require, "all")
            test.eq(ctx.config.tool_approval.revision, 1)
            test.eq(ctx.tool_approval_policy.enforcement, "enforce")
            test.is_true(ctx.tool_approval_policy.agent_opted_in)
        end)

        it("writes nothing for an unprotected session", function()
            local ctx, writes = fake_ctx({ traits = {} })
            local result, err = activation.apply(ctx, agent({}))
            test.is_nil(err)
            test.is_false(result.protected)
            test.eq(#writes, 0)
            test.is_nil(ctx.config.tool_approval)
            test.is_nil(ctx.tool_approval_policy)
        end)

        it("keeps approvals on after a switch to an agent without the trait", function()
            local ctx, writes = fake_ctx({ traits = { TRAIT } })
            assert(activation.apply(ctx, agent(MARKER)))
            ctx.agent_ctx.active_traits = { "other:trait" }
            local result, err = activation.apply(ctx, agent({}))
            test.is_nil(err)
            test.is_true(result.protected)
            test.eq(#writes, 1, "no write for the agent without the trait")
            test.is_false(ctx.tool_approval_policy.agent_opted_in)
            test.eq(ctx.tool_approval_policy.require, "marked")
        end)

        it("fails closed with kind invalid and writes nothing for a bad trait context", function()
            local ctx, writes = fake_ctx({ traits = { { id = TRAIT, context = { timeout_seconds = 5 } } } })
            local result, err, kind = activation.apply(ctx, agent(MARKER))
            test.is_nil(result)
            test.eq(kind, activation.FAILURE.INVALID)
            test.contains(tostring(err), "tool_approval_config_invalid")
            test.eq(#writes, 0)
            test.is_nil(ctx.config.tool_approval)
        end)

        it("fails closed when the trait entry did not compile", function()
            local ctx, writes = fake_ctx({ traits = { TRAIT } })
            local result, err, kind = activation.apply(ctx, agent({}))
            test.is_nil(result)
            test.eq(kind, activation.FAILURE.INVALID)
            test.contains(tostring(err), "compiled agent has no tool_approval options")
            test.eq(#writes, 0)
        end)

        it("fails closed on a damaged stored activation", function()
            local ctx = fake_ctx({ traits = {}, stored = { active = true, require = "marked" } })
            local result, err, kind = activation.apply(ctx, agent({}))
            test.is_nil(result)
            test.eq(kind, activation.FAILURE.INVALID)
            test.contains(tostring(err), "tool_approval_config_invalid")
        end)

        it("returns a storage failure when the activation can't be stored", function()
            local ctx = fake_ctx({ traits = { TRAIT }, write_error = "database is down" })
            local result, err, kind = activation.apply(ctx, agent(MARKER))
            test.is_nil(result)
            test.eq(kind, activation.FAILURE.STORAGE)
            test.contains(tostring(err), "database is down")
            test.is_nil(ctx.config.tool_approval)
        end)

        it("says enforcement is off when the operator setting is off, and still stores the activation", function()
            activation._enforcement = function() return "off" end
            local ctx, writes = fake_ctx({ traits = { TRAIT } })
            local result = assert(activation.apply(ctx, agent(MARKER)))
            test.is_true(result.protected)
            test.eq(result.policy.enforcement, "off")
            test.eq(#writes, 1, "the activation stays sticky for when enforcement returns")
        end)

        it("stores ui_declared_at when a surface is live at activation", function()
            local ctx = fake_ctx({ traits = { TRAIT }, surfaces = { live = 1, revision = 1 } })
            assert(activation.apply(ctx, agent(MARKER)))
            test.eq(ctx.config.tool_approval.ui_declared_at, NOW)
        end)

        it("note_declared stores ui_declared_at once and only for a protected session", function()
            local unprotected = fake_ctx({})
            local value, err = activation.note_declared(unprotected)
            test.is_nil(value)
            test.is_nil(err)
            local ctx, writes = fake_ctx({ traits = { TRAIT } })
            assert(activation.apply(ctx, agent(MARKER)))
            assert(activation.note_declared(ctx))
            test.eq(ctx.config.tool_approval.ui_declared_at, NOW)
            activation._now = function() return "2026-11-18T14:00:00Z" end
            assert(activation.note_declared(ctx))
            test.eq(ctx.config.tool_approval.ui_declared_at, NOW)
            test.eq(#writes, 2)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
