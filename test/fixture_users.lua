return require("migration").define(function()
    migration("Create session harness user fixtures", function()
        local function create_users(db)
            local _, err = db:execute("CREATE TABLE app_users (user_id TEXT PRIMARY KEY)")
            if err then error(err) end
        end
        local function drop_users(db)
            local _, err = db:execute("DROP TABLE app_users")
            if err then error(err) end
        end
        database("postgres", function() up(create_users); down(drop_users) end)
        database("sqlite", function() up(create_users); down(drop_users) end)
    end)
end)
