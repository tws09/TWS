@echo off
REM Script to start all TWS services
REM This will start backend server and provide instructions for frontend

echo ========================================
echo TWS Services Startup Script
echo ========================================
echo.

REM Change to backend directory
cd /d "%~dp0\.."

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found
echo.

REM Check if .env file exists
if exist ".env" (
    echo [OK] .env file found
) else (
    echo [WARNING] .env file not found
    echo           Creating .env file with default MongoDB Atlas connection...
    echo.
    (
        echo # MongoDB Connection String
        echo MONGO_URI=mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack
        echo.
        echo # JWT Secrets
        echo JWT_SECRET=your-super-secure-jwt-secret-at-least-64-characters-long-for-development
        echo JWT_REFRESH_SECRET=your-super-secure-refresh-secret-at-least-64-characters-long-for-development
        echo.
        echo # Environment
        echo NODE_ENV=development
        echo PORT=5000
    ) > .env
    echo [OK] .env file created
)
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    echo.
)

echo ========================================
echo Starting Backend Server
echo ========================================
echo.
echo [INFO] Backend will start on: http://localhost:5000
echo [INFO] Health check: http://localhost:5000/health
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start backend server
node server.js

pause

