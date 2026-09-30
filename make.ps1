# Windows adapter for the Makefile. Same targets and semantics:
# every target runs from test/, and `test` deletes the test database first.
# build-ui builds both frontend/wippy-form and frontend/wippy-form-answers
# (each its own npm package) into src/forms/ui/dist/ and
# src/forms/ui/answers-dist/. ui-dev / ui-dev-answers run each package's
# own watch-mode dev build separately (they cannot share one blocking
# recipe — see ui-dev-answers' comment below).
# Set WIPPY to a runtime binary path to use one that is not on PATH.
param([string]$Target = 'test')

$ErrorActionPreference = 'Stop'
$testDir = Join-Path $PSScriptRoot 'test'
$uiDir = Join-Path $PSScriptRoot 'frontend/wippy-form'
$uiAnswersDir = Join-Path $PSScriptRoot 'frontend/wippy-form-answers'
$wippy = if ($env:WIPPY) { $env:WIPPY } else { 'wippy' }

function Invoke-Wippy([string[]]$WippyArgs) {
    Push-Location $testDir
    try {
        & $wippy @WippyArgs
        if ($LASTEXITCODE -ne 0) { throw "wippy $($WippyArgs -join ' ') failed (exit $LASTEXITCODE)" }
    }
    finally { Pop-Location }
}

function Invoke-Npm([string[]]$NpmArgs, [string]$Dir = $uiDir) {
    Push-Location $Dir
    try {
        & npm @NpmArgs
        if ($LASTEXITCODE -ne 0) { throw "npm $($NpmArgs -join ' ') failed in $Dir (exit $LASTEXITCODE)" }
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
        'build-ui' {
            # Each call throws on failure (see Invoke-Npm), which aborts this
            # case block immediately — a failing wippy-form build never lets
            # wippy-form-answers start, and a failing wippy-form-answers
            # build still fails the target even though wippy-form succeeded.
            Invoke-Npm @('ci') $uiDir
            Invoke-Npm @('run', 'build') $uiDir
            Invoke-Npm @('ci') $uiAnswersDir
            Invoke-Npm @('run', 'build') $uiAnswersDir
        }
        'ui-dev'         { Invoke-Npm @('run', 'dev') $uiDir }
        # Separate target, not folded into ui-dev: `npm run dev` is
        # `vite build --watch`, which blocks forever, so two of them can't
        # sensibly run from one sequential recipe.
        'ui-dev-answers' { Invoke-Npm @('run', 'dev') $uiAnswersDir }
        'help'     { 'Targets: test (clean, then wippy test), lint, install, clean, build-ui (npm ci + build both wippy-form and wippy-form-answers UIs), ui-dev (npm run dev, wippy-form), ui-dev-answers (npm run dev, wippy-form-answers). Set WIPPY to override the runtime path.' }
        default    { throw "Unknown target: $Target" }
    }
}
catch {
    Write-Error $_
    exit 1
}
