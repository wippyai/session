# Windows adapter for the Makefile. Same targets, dependencies, settings and
# failure behavior: a failing step stops the target with a non-zero exit code.
#
# Settings are read from environment variables of the same name as the
# Makefile variables (TEST_ARTIFACTS, TEST_DIR, TEST_CONFIG, TEST_DB,
# TEST_BACKUP_DIR, TEST_FILTER, FRAMEWORK_DIR, PGHOST, PGPORT, PGDATABASE,
# PGUSER, PGPASSWORD, the BENCH_* sizes, UI_DIR, UI_ANSWERS_DIR). Set WIPPY_BIN
# (or WIPPY) to a runtime binary path when wippy is not on PATH.
#
# prepare and clean do what scripts/test-workspace.sh and
# scripts/prepare-test-db.sh do, without bash, jq or awk. Like the shell
# script, clean needs the `sqlite3` command line tool to back up and recreate
# the test database.
#
# build-ui builds frontend/wippy-form and frontend/wippy-form-answers (each its
# own npm package) into src/forms/ui/dist/ and src/forms/ui/answers-dist/.
# ui-dev and ui-dev-answers run each package's watch-mode build separately
# (they block forever, so they cannot share one recipe). test-ui and lint-ui
# use the same per-package `npm ci` pattern; lint-ui also runs
# `vue-tsc --noEmit` for wippy-form. check-ui runs scripts/check-ui.mjs, which
# fails when a fresh build of either UI package differs from its committed
# output, or when src/forms/ui/_index.yaml disagrees with the owning
# package.json. verify runs install, test, lint, test-ui, lint-ui and check-ui
# in that order and stops at the first failure.
param(
    [ValidateSet('test', 'test-runtime', 'test-postgres', 'bench', 'lint', 'install', 'prepare', 'clean', 'build-ui', 'ui-dev', 'ui-dev-answers', 'test-ui', 'lint-ui', 'check-ui', 'verify', 'help')]
    [string]$Target = 'test'
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path

function Get-Setting([string]$Name, [string]$Default = '') {
    $value = [Environment]::GetEnvironmentVariable($Name)
    if ([string]::IsNullOrEmpty($value)) { return $Default }
    return $value
}

function ConvertTo-FullPath([string]$Path) {
    if (-not [IO.Path]::IsPathRooted($Path)) { $Path = Join-Path $repo $Path }
    return ([IO.Path]::GetFullPath($Path)).Replace('\', '/')
}

$testArtifacts = ConvertTo-FullPath (Get-Setting 'TEST_ARTIFACTS' (Join-Path ([IO.Path]::GetTempPath()) 'wippy-session-tests'))
$testDir = ConvertTo-FullPath (Get-Setting 'TEST_DIR' "$testArtifacts/workspace")
$testConfig = ConvertTo-FullPath (Get-Setting 'TEST_CONFIG' "$testDir/.wippy.yaml")
$testDb = ConvertTo-FullPath (Get-Setting 'TEST_DB' "$testArtifacts/test.db")
$testBackupDir = ConvertTo-FullPath (Get-Setting 'TEST_BACKUP_DIR' "$testArtifacts/backups")
$testFilter = Get-Setting 'TEST_FILTER'
$frameworkDir = Get-Setting 'FRAMEWORK_DIR'
$uiDir = Join-Path $repo (Get-Setting 'UI_DIR' 'frontend/wippy-form')
$uiAnswersDir = Join-Path $repo (Get-Setting 'UI_ANSWERS_DIR' 'frontend/wippy-form-answers')

function Resolve-Wippy {
    $wippy = $env:WIPPY_BIN
    if (-not $wippy) { $wippy = $env:WIPPY }
    if (-not $wippy) {
        $command = Get-Command wippy -CommandType Application -ErrorAction SilentlyContinue
        if ($command) { $wippy = $command.Source }
    }
    if (-not $wippy -or -not (Test-Path -LiteralPath $wippy -PathType Leaf)) {
        throw 'Set WIPPY_BIN (or WIPPY) to a Wippy executable, or add wippy to PATH.'
    }
    return $wippy
}

# Runs a native command in a directory and throws, carrying the command's exit
# code, when it fails.
function Invoke-Native([string]$Dir, [string]$Command, [string[]]$Arguments) {
    Push-Location $Dir
    try {
        & $Command @Arguments
        if ($LASTEXITCODE -ne 0) {
            $failure = New-Object System.Exception("$Command $($Arguments -join ' ') failed in $Dir (exit $LASTEXITCODE)")
            $failure.Data['ExitCode'] = $LASTEXITCODE
            throw $failure
        }
    }
    finally { Pop-Location }
}

# Sets process environment variables for a script block and restores them.
function Invoke-WithEnvironment([hashtable]$Variables, [scriptblock]$Body) {
    $saved = @{}
    foreach ($name in $Variables.Keys) {
        $saved[$name] = [Environment]::GetEnvironmentVariable($name)
        [Environment]::SetEnvironmentVariable($name, [string]$Variables[$name])
    }
    try { & $Body }
    finally {
        foreach ($name in $saved.Keys) { [Environment]::SetEnvironmentVariable($name, $saved[$name]) }
    }
}

function Write-TextFile([string]$Path, [string]$Text) {
    [IO.File]::WriteAllText($Path, $Text, (New-Object System.Text.UTF8Encoding($false)))
}

# Same result as scripts/test-workspace.sh: a workspace outside the repository
# with a lock file that points at the repository's test sources and a runtime
# config that replaces wippy/session with this checkout's src directory, the
# module root that the forms UI bundles (fs.directory, base: module) resolve from.
function Invoke-Prepare {
    $repository = (Resolve-Path -LiteralPath $repo).Path.Replace('\', '/')
    New-Item -ItemType Directory -Force -Path $testDir | Out-Null
    $workspace = (Resolve-Path -LiteralPath $testDir).Path.Replace('\', '/')
    $framework = ''
    if ($frameworkDir) { $framework = (Resolve-Path -LiteralPath $frameworkDir).Path.Replace('\', '/') }
    if (("$workspace/").StartsWith("$repository/", [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Test workspace must be outside the repository'
    }
    New-Item -ItemType Directory -Force -Path (Join-Path $workspace '.wippy') | Out-Null

    $modules = ConvertTo-Json -Compress -InputObject "$workspace/modules"
    $source = ConvertTo-Json -Compress -InputObject "$repository/test"
    $lock = foreach ($line in [IO.File]::ReadAllLines((Join-Path $repository 'test/wippy.lock'))) {
        if ($line -match '^\s*modules:\s+\.wippy(\s|$)') { "    modules: $modules" }
        elseif ($line -match '^\s*src:\s+\.(\s|$)') { "    src: $source" }
        else { $line }
    }
    Write-TextFile (Join-Path $workspace 'wippy.lock') (($lock -join "`n") + "`n")

    $replacements = [ordered]@{ 'wippy/session' = "$repository/src" }
    if ($framework) {
        $replacements['wippy/agent'] = "$framework/src/agent/src"
        $replacements['wippy/llm'] = "$framework/src/llm/src"
        $replacements['wippy/test'] = "$framework/src/test"
    }
    $config = [ordered]@{
        version = '1.0'
        logger = [ordered]@{ level = 'error' }
        registry = [ordered]@{
            dependency_vendor_dir = "$workspace/modules/vendor"
            dependency_lock_path = "$workspace/wippy.lock"
        }
        workspace = [ordered]@{ replacements = $replacements }
    }
    Write-TextFile (Join-Path $workspace '.wippy.yaml') ((ConvertTo-Json -Depth 6 -InputObject $config) + "`n")
}

# Writes `sqlite3 <database> .dump` to a file byte for byte. The file is created
# exclusively, like the shell script's noclobber redirect.
function Save-SqliteDump([string]$Database, [string]$Destination) {
    $info = New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName = (Get-Command sqlite3 -CommandType Application | Select-Object -First 1).Source
    $info.Arguments = "`"$Database`" .dump"
    $info.UseShellExecute = $false
    $info.RedirectStandardOutput = $true
    $process = [System.Diagnostics.Process]::Start($info)
    $file = [IO.File]::Open($Destination, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write)
    try { $process.StandardOutput.BaseStream.CopyTo($file) }
    finally { $file.Dispose() }
    $process.WaitForExit()
    if ($process.ExitCode -ne 0) { throw "sqlite3 .dump failed for $Database (exit $($process.ExitCode))" }
}

# Same result as scripts/prepare-test-db.sh: dump the current test database
# into the backup directory, then recreate it empty.
function Invoke-Clean {
    if (-not (Get-Command sqlite3 -CommandType Application -ErrorAction SilentlyContinue)) {
        throw 'The sqlite3 command line tool is required to back up and recreate the test database.'
    }
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $testDb), $testBackupDir | Out-Null
    $stamp = Get-Date -Format 'yyyy-MM-dd-HHmm'
    $backup = "$testBackupDir/$stamp.sql"
    if (Test-Path -LiteralPath $backup) {
        $backup = "$testBackupDir/$stamp-$(Get-Date -Format 'ss')-$PID.sql"
    }
    Save-SqliteDump $testDb $backup
    foreach ($path in @($testDb, "$testDb-wal", "$testDb-shm")) {
        if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Force -ErrorAction Stop }
    }
    Invoke-Native $repo 'sqlite3' @($testDb, 'PRAGMA user_version = 0;')
}

function Invoke-WippyTest([string]$Filter, [hashtable]$ExtraEnvironment = @{}) {
    New-Item -ItemType Directory -Force -Path "$testArtifacts/benchmarks" | Out-Null
    $environment = @{ WIPPY_TEST_REPOSITORY = $repo.Replace('\', '/'); WIPPY_TEST_ARTIFACTS = $testArtifacts }
    foreach ($name in $ExtraEnvironment.Keys) { $environment[$name] = $ExtraEnvironment[$name] }
    $arguments = @('test')
    if ((Get-Setting 'WIPPY_BENCH_EXACT_ALLOCATIONS') -eq '1') { $arguments += '--profiler' }
    $arguments += @('--config', $testConfig,
        '-o', "app:db:file=$testDb",
        '-o', "app:env_storage:file_path=$testArtifacts/test.env",
        '-o', "app.runtime:benchmark_output:directory=$testArtifacts/benchmarks")
    if ($Filter.Trim()) { $arguments += @('test', '--', $Filter) }
    Invoke-WithEnvironment $environment { Invoke-Native $testDir (Resolve-Wippy) $arguments }
}

function Assert-FrameworkDir {
    if (-not $frameworkDir) { throw 'Set FRAMEWORK_DIR to use the required runtime test runner' }
}

function Invoke-Test {
    Invoke-Clean
    Invoke-WippyTest $testFilter
}

function Invoke-TestRuntime([string]$Filter = 'app.runtime:handoff_runtime') {
    Assert-FrameworkDir
    Invoke-Install
    Invoke-WithEnvironment @{ WIPPY_TEST_REQUIRE_CASES = '1' } {
        Invoke-Clean
        Invoke-WippyTest $Filter
    }
}

# The caller supplies a fresh disposable database; this target never drops one.
function Invoke-TestPostgres {
    Assert-FrameworkDir
    Invoke-Install
    New-Item -ItemType Directory -Force -Path "$testArtifacts/benchmarks" | Out-Null
    $environment = @{
        TZ = 'UTC'
        WIPPY_TEST_REQUIRE_CASES = '1'
        WIPPY_TEST_REPOSITORY = $repo.Replace('\', '/')
        WIPPY_TEST_ARTIFACTS = $testArtifacts
    }
    $arguments = @('test', '--config', $testConfig,
        '-o', 'app:db:kind=db.sql.postgres',
        '-o', "app:db:host=$(Get-Setting 'PGHOST' 'localhost')",
        '-o', "app:db:port=$(Get-Setting 'PGPORT' '5433')",
        '-o', "app:db:database=$(Get-Setting 'PGDATABASE' 'session_test')",
        '-o', "app:db:username=$(Get-Setting 'PGUSER' 'kickside')",
        '-o', "app:db:password=$(Get-Setting 'PGPASSWORD' 'kickside')",
        '-o', 'app:db:options.sslmode=disable',
        '-o', "app:env_storage:file_path=$testArtifacts/test.env",
        '-o', "app.runtime:benchmark_output:directory=$testArtifacts/benchmarks",
        'test', '--', 'app.persist:writer_metadata_test', 'app.persist:control_refresh_test', 'app.persist:session_repo_test', 'app.runtime:handoff_runtime')
    Invoke-WithEnvironment $environment { Invoke-Native $testDir (Resolve-Wippy) $arguments }
}

function Invoke-Bench {
    $wippy = Resolve-Wippy
    $revision = Get-Setting 'BENCH_REVISION'
    if (-not $revision) { $revision = (& git -C $repo rev-parse HEAD); if ($LASTEXITCODE -ne 0) { throw 'git rev-parse HEAD failed' } }
    $frameworkRevision = Get-Setting 'BENCH_FRAMEWORK_REVISION'
    if (-not $frameworkRevision) {
        if ($frameworkDir) {
            $frameworkRevision = (& git -C $frameworkDir rev-parse HEAD)
            if ($LASTEXITCODE -ne 0) { throw 'git rev-parse HEAD failed in FRAMEWORK_DIR' }
        }
        else { $frameworkRevision = 'locked' }
    }
    $runtime = (& $wippy version)
    if ($LASTEXITCODE -ne 0) { throw "$wippy version failed" }
    $exact = Get-Setting 'BENCH_EXACT_ALLOCATIONS' '1'
    New-Item -ItemType Directory -Force -Path "$testArtifacts/benchmarks" | Out-Null
    $runs = @()
    foreach ($size in (Get-Setting 'BENCH_SIZES' '1,8,32').Split(',')) {
        $runs += , @($size, (Get-Setting 'BENCH_MEMORY_OPERATIONS' '256'), 'app.runtime:handoff_benchmark', 'session_handoff')
    }
    foreach ($size in (Get-Setting 'BENCH_METADATA_SIZES' '128,4096').Split(',')) {
        $runs += , @($size, (Get-Setting 'BENCH_METADATA_MEMORY_OPERATIONS' '2048'), 'app.runtime:metadata_benchmark', 'session_metadata_write')
    }
    foreach ($run in $runs) {
        $output = "$testArtifacts/benchmarks/$($run[3])-$($run[0]).json"
        Remove-Item -LiteralPath $output -Force -ErrorAction SilentlyContinue
        $environment = @{
            WIPPY_BENCH_SIZE = $run[0]
            WIPPY_BENCH_WARMUP = Get-Setting 'BENCH_WARMUP' '100'
            WIPPY_BENCH_SAMPLES = Get-Setting 'BENCH_SAMPLES' '100'
            WIPPY_BENCH_MEMORY_OPERATIONS = $run[1]
            WIPPY_BENCH_EXACT_ALLOCATIONS = $exact
            WIPPY_BENCH_REVISION = $revision
            WIPPY_BENCH_RUNTIME = $runtime
            WIPPY_BENCH_FRAMEWORK_REVISION = $frameworkRevision
        }
        Invoke-WithEnvironment $environment { Invoke-TestRuntime $run[2] }
        if (-not (Test-Path -LiteralPath $output) -or (Get-Item -LiteralPath $output).Length -eq 0) {
            throw "Missing benchmark report $output"
        }
    }
}

function Invoke-Lint {
    Invoke-Native $testDir (Resolve-Wippy) @('lint', '--config', $testConfig, '--level', 'error')
}

function Invoke-Install {
    Invoke-Prepare
    Invoke-Native $testDir (Resolve-Wippy) @('install', '--config', $testConfig)
}

function Invoke-BuildUi {
    Invoke-Native $uiDir 'npm' @('ci')
    Invoke-Native $uiDir 'npm' @('run', 'build')
    Invoke-Native $uiAnswersDir 'npm' @('ci')
    Invoke-Native $uiAnswersDir 'npm' @('run', 'build')
}

function Invoke-TestUi {
    Invoke-Native $uiDir 'npm' @('ci')
    Invoke-Native $uiDir 'npm' @('test')
    Invoke-Native $uiAnswersDir 'npm' @('ci')
    Invoke-Native $uiAnswersDir 'npm' @('test')
}

function Invoke-LintUi {
    Invoke-Native $uiDir 'npm' @('ci')
    Invoke-Native $uiDir 'npm' @('run', 'lint')
    Invoke-Native $uiDir 'npx' @('vue-tsc', '--noEmit')
    Invoke-Native $uiAnswersDir 'npm' @('ci')
    Invoke-Native $uiAnswersDir 'npm' @('run', 'lint')
}

function Invoke-CheckUi {
    Invoke-Native $repo 'node' @((Join-Path $repo 'scripts/check-ui.mjs'))
}

$exitCode = 0
try {
    switch ($Target) {
        'test' { Invoke-Test }
        'test-runtime' { Invoke-TestRuntime }
        'test-postgres' { Invoke-TestPostgres }
        'bench' { Invoke-Bench }
        'lint' { Invoke-Lint }
        'install' { Invoke-Install }
        'prepare' { Invoke-Prepare }
        'clean' { Invoke-Clean }
        'build-ui' { Invoke-BuildUi }
        'ui-dev' { Invoke-Native $uiDir 'npm' @('run', 'dev') }
        'ui-dev-answers' { Invoke-Native $uiAnswersDir 'npm' @('run', 'dev') }
        'test-ui' { Invoke-TestUi }
        'lint-ui' { Invoke-LintUi }
        'check-ui' { Invoke-CheckUi }
        'verify' {
            Invoke-Install
            Invoke-Test
            Invoke-Lint
            Invoke-TestUi
            Invoke-LintUi
            Invoke-CheckUi
        }
        'help' { 'Targets: test, test-runtime, test-postgres, bench, lint, install, prepare, clean, build-ui, ui-dev, ui-dev-answers, test-ui, lint-ui, check-ui, verify. Settings come from environment variables named like the Makefile variables. Set WIPPY_BIN (or WIPPY) to override the runtime path.' }
    }
}
catch {
    Write-Error $_ -ErrorAction Continue
    $exitCode = 1
    if ($_.Exception.Data.Contains('ExitCode')) { $exitCode = [int]$_.Exception.Data['ExitCode'] }
}
exit $exitCode
