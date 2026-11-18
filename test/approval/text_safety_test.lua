local test = require("test")
local fs = require("fs")

-- Trojan Source guard: no file under src/ or docs/ may contain a literal
-- zero-width or bidirectional control character (U+200B-200F, U+202A-202E,
-- U+2066-2069). Write them as escape text (for example \u202e) instead. The
-- folders come from the app.approval:source and app.approval:docs volumes,
-- which the make targets point at the repository.

-- UTF-8 forms: U+200B-200F = E2 80 8B-8F, U+202A-202E = E2 80 AA-AE,
-- U+2066-2069 = E2 81 A6-A9.
local PATTERNS = { "\226\128[\139-\143]", "\226\128[\170-\174]", "\226\129[\166-\169]" }

local function findings(text: string): {string}
    local found = {}
    local line = 1
    local position = 1
    for _, pattern in ipairs(PATTERNS) do
        local start = 1
        while true do
            local at = text:find(pattern, start)
            if not at then break end
            local _, newlines = text:sub(position, at):gsub("\n", "")
            found[#found + 1] = string.format("line %d: U+%04X", line + newlines,
                ((text:byte(at + 1) & 0x3F) << 6 | (text:byte(at + 2) & 0x3F)) + 0x2000)
            start = at + 3
        end
    end
    return found
end

local function scan(volume: any, path: string, out: any)
    for entry in volume:readdir(path) do
        local child = (path == "/" and "" or path) .. "/" .. entry.name
        if entry.type == fs.type.DIR then
            scan(volume, child, out)
        else
            local text, err = volume:readfile(child)
            if not text then error("cannot read " .. child .. ": " .. tostring(err)) end
            out.files = out.files + 1
            for _, item in ipairs(findings(text)) do out.problems[#out.problems + 1] = child .. " " .. item end
        end
    end
end

local function scan_volume(id: string)
    local volume, err = fs.get(id)
    if not volume then error("missing volume " .. id .. ": " .. tostring(err)) end
    local out = { files = 0, problems = {} }
    scan(volume, "/", out)
    return out
end

local function define_tests()
    describe("Hidden characters in src and docs", function()
        it("finds a literal control character in a sample (positive control)", function()
            local sample = "ok\nnext \226\128\174 and \226\128\139 and \226\129\167\n"
            local found = findings(sample)
            test.eq(#found, 3, table.concat(found, "; "))
            test.contains(table.concat(found, "; "), "U+202E")
            test.eq(#findings("plain \\u202e escape text"), 0)
        end)

        it("has none under src/", function()
            local result = scan_volume("app.approval:source")
            test.is_true(result.files > 20, "files scanned under src: " .. result.files)
            test.eq(#result.problems, 0, table.concat(result.problems, "; "))
        end)

        it("has none under docs/", function()
            local result = scan_volume("app.approval:docs")
            test.is_true(result.files >= 1, "files scanned under docs: " .. result.files)
            test.eq(#result.problems, 0, table.concat(result.problems, "; "))
        end)
    end)
end

return test.run_cases(define_tests)
