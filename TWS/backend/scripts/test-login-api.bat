@echo off
REM Script to test login API endpoint
echo.
echo ============================================================
echo   Testing Login API Endpoint
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

echo Running API test script...
echo.

node scripts/test-login-api.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   Test Complete
    echo ============================================================
) else (
    echo.
    echo ============================================================
    echo   Test Failed
    echo ============================================================
)

pause
