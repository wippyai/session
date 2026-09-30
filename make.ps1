# Windows adapter for the Makefile. Same targets and semantics:
# every Wippy target runs from test/, and `test` deletes only its own test
# database first. build-ui builds both frontend/wippy-form and
# frontend/wippy-form-answers (each its own npm package) into
# src/forms/ui/dist/ and src/forms/ui/answers-dist/. ui-dev / ui-dev-answers
# run each package's own watch-mode dev build separately (they cannot share
# one blocking recipe; see ui-dev-answers' comment below).
# Set WIPPY_BIN (or WIPPY) to a runtime binary path when wippy is not on PATH.
param(
    [ValidateSet('test', 'lint', 'install', 'clean', 'build-ui', 'ui-dev', 'ui-dev-answers', 'help')]
    [string]$Target = 'test'
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$testDir = Join-Path $repo 'test'
$db = Join-Path $testDir '.wippy\test.db'
$uiDir = Join-Path $repo 'frontend/wippy-form'
$uiAnswersDir = Join-Path $repo 'frontend/wippy-form-answers'

function Clear-TestDatabase {
    foreach ($path in @($db, "$db-wal", "$db-shm")) {
        if (Test-Path -LiteralPath $path) {
            Remove-Item -LiteralPath $path -Force -ErrorAction Stop
        }
    }
}

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

function Invoke-Wippy([string[]]$WippyArgs) {
    $wippy = Resolve-Wippy
    Push-Location $testDir
    try {
        & $wippy @WippyArgs
        $script:code = $LASTEXITCODE
    }
    finally { Pop-Location }
}

function Invoke-Npm([string[]]$NpmArgs, [string]$Dir) {
    Push-Location $Dir
    try {
        & npm @NpmArgs
        if ($LASTEXITCODE -ne 0) { throw "npm $($NpmArgs -join ' ') failed in $Dir (exit $LASTEXITCODE)" }
    }
    finally { Pop-Location }
}

$code = 0
try {
    switch ($Target) {
        'test'     { Clear-TestDatabase; Invoke-Wippy @('test') }
        'lint'     { Invoke-Wippy @('lint', '--level', 'error') }
        'install'  { Invoke-Wippy @('install') }
        'clean'    { Clear-TestDatabase }
        'build-ui' {
            # Each call throws on failure (see Invoke-Npm), which aborts this
            # case block immediately: a failing wippy-form build never lets
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
        'help'     { 'Targets: test (clean, then wippy test), lint, install, clean, build-ui (npm ci + build both wippy-form and wippy-form-answers UIs), ui-dev (npm run dev, wippy-form), ui-dev-answers (npm run dev, wippy-form-answers). Set WIPPY_BIN (or WIPPY) to override the runtime path.' }
    }
}
catch {
    Write-Error $_ -ErrorAction Continue
    exit 1
}
exit $code
