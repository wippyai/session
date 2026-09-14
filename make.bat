@echo off
setlocal

set "ROOT=%~dp0"
set "TARGET=%~1"
if not defined TARGET set "TARGET=test"

if /I "%TARGET%"=="clean" goto clean

if defined WIPPY_EXE (
  set "WIPPY_CMD=%WIPPY_EXE%"
) else (
  for %%I in (wippy.exe) do set "WIPPY_CMD=%%~$PATH:I"
)

if not defined WIPPY_CMD (
  echo wippy.exe was not found. Set WIPPY_EXE or add it to PATH. 1>&2
  exit /b 1
)
if not exist "%WIPPY_CMD%" (
  echo The configured wippy.exe does not exist. 1>&2
  exit /b 1
)

if /I "%TARGET%"=="test" goto test
if /I "%TARGET%"=="lint" goto lint
if /I "%TARGET%"=="install" goto install

echo Usage: make.bat [test^|lint^|install^|clean] 1>&2
exit /b 2

:clean
for %%F in ("%ROOT%test\.wippy\test.db" "%ROOT%test\.wippy\test.db-wal" "%ROOT%test\.wippy\test.db-shm") do (
  if exist "%%~F" del /q "%%~F"
  if exist "%%~F" exit /b 1
)
exit /b 0

:test
call "%~f0" clean
if errorlevel 1 exit /b %errorlevel%
pushd "%ROOT%test"
if errorlevel 1 exit /b %errorlevel%
if defined TEST_CONFIG (
  "%WIPPY_CMD%" test -c --config "%TEST_CONFIG%"
) else (
  "%WIPPY_CMD%" test -c
)
set "RESULT=%errorlevel%"
popd
exit /b %RESULT%

:lint
pushd "%ROOT%test"
if errorlevel 1 exit /b %errorlevel%
"%WIPPY_CMD%" lint
set "RESULT=%errorlevel%"
popd
exit /b %RESULT%

:install
pushd "%ROOT%test"
if errorlevel 1 exit /b %errorlevel%
"%WIPPY_CMD%" install
set "RESULT=%errorlevel%"
popd
exit /b %RESULT%
