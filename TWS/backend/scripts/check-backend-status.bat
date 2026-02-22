@echo off
REM Script to check if backend server is running
echo.
echo ============================================================
echo   Checking Backend Server Status
echo ============================================================
echo.

cd /d "%~dp0\.."

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not found in PATH.
    echo.
    pause
    exit /b 1
)

echo Running backend status check...
echo.

node scripts/check-backend-status.js

pause

