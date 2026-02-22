@echo off
REM Script to fix co-founder login issues for 14modules@gmail.com
REM This will diagnose and fix the user account in the database

echo.
echo ============================================================
echo   Fixing Co-Founder Login (14modules@gmail.com)
echo ============================================================
echo.

cd /d "%~dp0\.."

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not found in PATH.
    echo.
    echo Please either:
    echo 1. Add Node.js to your system PATH, OR
    echo 2. Run this script from a terminal where Node.js is available
    echo.
    echo To check if Node.js is installed, run: node --version
    echo.
    pause
    exit /b 1
)

echo Running fix script...
echo.

node scripts/fix-cofounder-login.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   SUCCESS: User account has been fixed!
    echo ============================================================
    echo.
    echo You can now try logging in with:
    echo   Email:    14modules@gmail.com
    echo   Password: CoFounder@2024
    echo.
) else (
    echo.
    echo ============================================================
    echo   ERROR: Script failed to complete
    echo ============================================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause

