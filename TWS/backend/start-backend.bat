@echo off
REM Simple script to start the backend server
echo.
echo ============================================================
echo   Starting TWS Backend Server
echo ============================================================
echo.

cd /d "%~dp0"

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not found in PATH.
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js found
echo.

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found
    echo [INFO] Creating .env file with default settings...
    echo.
    (
        echo PORT=5000
        echo NODE_ENV=development
        echo MONGO_URI=mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack
        echo JWT_SECRET=your-super-secure-jwt-secret-at-least-64-characters-long-for-development
        echo JWT_REFRESH_SECRET=your-super-secure-refresh-secret-at-least-64-characters-long-for-development
    ) > .env
    echo [OK] .env file created
    echo.
)

echo [INFO] Starting backend server...
echo [INFO] Backend will run on: http://localhost:5000
echo [INFO] Health check: http://localhost:5000/health
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
node server.js

pause

