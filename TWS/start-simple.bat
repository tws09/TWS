@echo off
REM ========================================
REM TWS Simple Server Startup
REM Starts both servers with one command
REM ========================================

echo.
echo ========================================
echo   TWS Unified Server Startup
echo ========================================
echo.

cd /d "%~dp0"

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Start servers using npm
echo [INFO] Starting both servers...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

npm start

pause

