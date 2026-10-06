param(
    [ValidateSet('test', 'lint', 'install', 'clean')]
    [string]$Target = 'test'
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$testDir = Join-Path $repo 'test'
$db = Join-Path $testDir '.wippy\test.db'

function Clear-TestDatabase {
    foreach ($path in @($db, "$db-wal", "$db-shm")) {
        if (Test-Path -LiteralPath $path) {
            Remove-Item -LiteralPath $path -Force -ErrorAction Stop
        }
    }
}

if ($Target -eq 'clean') {
    Clear-TestDatabase
    exit 0
}

$wippy = $env:WIPPY_BIN
if (-not $wippy) {
    $command = Get-Command wippy -CommandType Application -ErrorAction SilentlyContinue
    if ($command) { $wippy = $command.Source }
}
if (-not $wippy -or -not (Test-Path -LiteralPath $wippy -PathType Leaf)) {
    throw 'Set WIPPY_BIN to a Wippy executable, or add wippy to PATH.'
}

if ($Target -eq 'test') { Clear-TestDatabase }
# TEST_CONFIG names an extra runtime config, as in the Makefile.
$configArgs = @('--config', '.wippy.yaml')
if ($env:TEST_CONFIG) { $configArgs += @('--config', $env:TEST_CONFIG) }
Push-Location $testDir
try {
    switch ($Target) {
        'test' { & $wippy 'test' @configArgs }
        'lint' { & $wippy 'lint' @configArgs '--level' 'error' }
        'install' { & $wippy 'install' }
    }
    $code = $LASTEXITCODE
}
finally {
    Pop-Location
}
exit $code
