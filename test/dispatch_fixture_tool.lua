local function run(args)
    if args.fail then return nil, 'FIXTURE_TOOL_FAILURE' end
    return { result = 'fixture tool succeeded' }
end

return { run = run }
