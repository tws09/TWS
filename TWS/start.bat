@echo off
REM ========================================
REM TWS Unified Server Startup (Single File)
REM Starts both backend and frontend servers
REM ========================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   TWS Unified Server Startup
echo ========================================
echo.

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo [INFO] Current directory: %CD%
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
node --version
echo.

REM Start servers using Node.js script
echo [INFO] Starting servers...
echo.

node start.js

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to start servers
    pause
    exit /b 1
)

pause

