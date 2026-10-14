return require('migration').define(function()
    migration('Create test users', function()
        local function create_users(db)
            local _, err = db:execute('CREATE TABLE app_users (user_id TEXT PRIMARY KEY)')
            if err then error(err) end
            local _, capture_err = db:execute('CREATE TABLE interruption_prompt_captures (label TEXT, request_id TEXT, payload TEXT)')
            if capture_err then error(capture_err) end
        end
        for _, dialect in ipairs({'sqlite', 'postgres'}) do
            database(dialect, function() up(create_users) end)
        end
    end)
end)
