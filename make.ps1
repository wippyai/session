# Windows adapter for the Makefile. Same targets and semantics:
# every target runs from test/, and `test` deletes the test database first.
# build-ui/ui-dev run from frontend/wippy-form (the wippy-form web
# component's own npm package) and build into src/forms/ui/dist/.
# Set WIPPY to a runtime binary path to use one that is not on PATH.
param([string]$Target = 'help')

$ErrorActionPreference = 'Stop'
$testDir = Join-Path $PSScriptRoot 'test'
$uiDir = Join-Path $PSScriptRoot 'frontend/wippy-form'
$wippy = if ($env:WIPPY) { $env:WIPPY } else { 'wippy' }

function Invoke-Wippy([string[]]$WippyArgs) {
    Push-Location $testDir
    try {
        & $wippy @WippyArgs
        if ($LASTEXITCODE -ne 0) { throw "wippy $($WippyArgs -join ' ') failed (exit $LASTEXITCODE)" }
    }
    finally { Pop-Location }
}

function Invoke-Npm([string[]]$NpmArgs) {
    Push-Location $uiDir
    try {
        & npm @NpmArgs
        if ($LASTEXITCODE -ne 0) { throw "npm $($NpmArgs -join ' ') failed (exit $LASTEXITCODE)" }
    }
    finally { Pop-Location }
}

function Clear-TestDb {
    foreach ($suffix in '', '-wal', '-shm') {
        Remove-Item -LiteralPath (Join-Path $testDir ".wippy/test.db$suffix") -Force -ErrorAction SilentlyContinue
    }
}

try {
    switch ($Target) {
        'test'     { Clear-TestDb; Invoke-Wippy @('test') }
        'lint'     { Invoke-Wippy @('lint', '--level', 'error') }
        'install'  { Invoke-Wippy @('install') }
        'clean'    { Clear-TestDb }
        'build-ui' { Invoke-Npm @('ci'); Invoke-Npm @('run', 'build') }
        'ui-dev'   { Invoke-Npm @('run', 'dev') }
        'help'     { 'Targets: test (clean, then wippy test), lint, install, clean, build-ui (npm ci + build the wippy-form UI), ui-dev (npm run dev). Set WIPPY to override the runtime path.' }
        default    { throw "Unknown target: $Target" }
    }
}
catch {
    Write-Error $_
    exit 1
}
