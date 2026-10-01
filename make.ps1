# Windows adapter for the Makefile. Same targets and semantics:
# every Wippy target runs from test/, and `test` deletes only its own test
# database first. build-ui builds both frontend/wippy-form and
# frontend/wippy-form-answers (each its own npm package) into
# src/forms/ui/dist/ and src/forms/ui/answers-dist/. ui-dev / ui-dev-answers
# run each package's own watch-mode dev build separately (they cannot share
# one blocking recipe; see ui-dev-answers' comment below).
# test-ui / lint-ui mirror build-ui's per-package `npm ci` pattern. lint-ui
# also runs `vue-tsc --noEmit` for wippy-form (it renders .vue SFCs and
# depends on vue-tsc); wippy-form-answers has no .vue files and no vue-tsc
# dependency, so it gets ESLint only. check-ui runs scripts/check-ui.mjs,
# which fails when a fresh build of either UI package differs from its
# committed dist/answers-dist output, or when src/forms/ui/_index.yaml's
# hand-copied registry metadata disagrees with the owning package.json.
# verify chains test, lint, test-ui, lint-ui and check-ui — the same gates
# CI runs separately — stopping at the first failure, same as `make verify`.
# Set WIPPY_BIN (or WIPPY) to a runtime binary path when wippy is not on PATH.
param(
    [ValidateSet('test', 'lint', 'install', 'clean', 'build-ui', 'ui-dev', 'ui-dev-answers', 'test-ui', 'lint-ui', 'check-ui', 'verify', 'help')]
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

function Invoke-Npx([string[]]$NpxArgs, [string]$Dir) {
    Push-Location $Dir
    try {
        & npx @NpxArgs
        if ($LASTEXITCODE -ne 0) { throw "npx $($NpxArgs -join ' ') failed in $Dir (exit $LASTEXITCODE)" }
    }
    finally { Pop-Location }
}

function Invoke-TestTarget { Clear-TestDatabase; Invoke-Wippy @('test') }
function Invoke-LintTarget { Invoke-Wippy @('lint', '--level', 'error') }

function Invoke-TestUiTarget {
    # Each call throws on failure (Invoke-Npm) except it doesn't abort the
    # whole case silently — PowerShell propagates the exception up to the
    # outer try/catch, same as build-ui: a failing wippy-form test never
    # lets wippy-form-answers start, and a failing wippy-form-answers test
    # still fails the target even though wippy-form passed.
    Invoke-Npm @('ci') $uiDir
    Invoke-Npm @('test') $uiDir
    Invoke-Npm @('ci') $uiAnswersDir
    Invoke-Npm @('test') $uiAnswersDir
}

function Invoke-LintUiTarget {
    Invoke-Npm @('ci') $uiDir
    Invoke-Npm @('run', 'lint') $uiDir
    Invoke-Npx @('vue-tsc', '--noEmit') $uiDir
    Invoke-Npm @('ci') $uiAnswersDir
    Invoke-Npm @('run', 'lint') $uiAnswersDir
}

function Invoke-CheckUiTarget {
    Push-Location $repo
    try {
        & node (Join-Path $repo 'scripts/check-ui.mjs')
        if ($LASTEXITCODE -ne 0) { throw "check-ui failed (exit $LASTEXITCODE)" }
    }
    finally { Pop-Location }
}

$code = 0
try {
    switch ($Target) {
        'test'     { Invoke-TestTarget }
        'lint'     { Invoke-LintTarget }
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
        'test-ui'  { Invoke-TestUiTarget }
        'lint-ui'  { Invoke-LintUiTarget }
        'check-ui' { Invoke-CheckUiTarget }
        'verify'   {
            # Mirrors `make verify`'s prerequisite order (test lint test-ui
            # lint-ui check-ui) and stops at the first failure. Invoke-Wippy
            # (used by test/lint) records its exit code in $script:code
            # instead of throwing, so those two steps need an explicit check;
            # the *-ui steps and check-ui throw on failure already, which
            # the outer try/catch below turns into exit 1.
            Invoke-TestTarget
            if ($script:code -ne 0) { exit $script:code }
            Invoke-LintTarget
            if ($script:code -ne 0) { exit $script:code }
            Invoke-TestUiTarget
            Invoke-LintUiTarget
            Invoke-CheckUiTarget
        }
        'help'     { 'Targets: test (clean, then wippy test), lint, install, clean, build-ui (npm ci + build both wippy-form and wippy-form-answers UIs), ui-dev (npm run dev, wippy-form), ui-dev-answers (npm run dev, wippy-form-answers), test-ui (npm ci + npm test, both UI packages), lint-ui (npm ci + eslint, both UI packages, plus vue-tsc --noEmit for wippy-form), check-ui (node scripts/check-ui.mjs — dist-vs-source and _index.yaml-vs-package.json drift), verify (test, lint, test-ui, lint-ui, check-ui, in order). Set WIPPY_BIN (or WIPPY) to override the runtime path.' }
    }
}
catch {
    Write-Error $_ -ErrorAction Continue
    exit 1
}
exit $code
