@echo off
REM Script to check user's module access
echo.
echo ============================================================
echo   Checking User Module Access
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

echo Running module access check...
echo.

node scripts/check-user-module-access.js

pause

