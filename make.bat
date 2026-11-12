@echo off
setlocal
powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "%~dp0make.ps1" %*
exit /b %ERRORLEVEL%
