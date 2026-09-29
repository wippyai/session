# Windows adapter for the Makefile. Same targets and semantics:
# every target runs from test/, and `test` deletes the test database first.
# Set WIPPY to a runtime binary path to use one that is not on PATH.
param([string]$Target = 'help')

$ErrorActionPreference = 'Stop'
$testDir = Join-Path $PSScriptRoot 'test'
$wippy = if ($env:WIPPY) { $env:WIPPY } else { 'wippy' }

function Invoke-Wippy([string[]]$WippyArgs) {
    Push-Location $testDir
    try {
        & $wippy @WippyArgs
        if ($LASTEXITCODE -ne 0) { throw "wippy $($WippyArgs -join ' ') failed (exit $LASTEXITCODE)" }
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
        'test'    { Clear-TestDb; Invoke-Wippy @('test') }
        'lint'    { Invoke-Wippy @('lint', '--level', 'error') }
        'install' { Invoke-Wippy @('install') }
        'clean'   { Clear-TestDb }
        'help'    { 'Targets: test (clean, then wippy test), lint, install, clean. Set WIPPY to override the runtime path.' }
        default   { throw "Unknown target: $Target" }
    }
}
catch {
    Write-Error $_
    exit 1
}
