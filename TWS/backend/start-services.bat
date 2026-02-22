@echo off
echo Starting TWS Backend Services...

REM Start MongoDB (if not running)
net start MongoDB 2>nul || echo MongoDB already running or not installed

REM Start Redis (if not running)
redis-server --daemonize yes 2>nul || echo Redis already running or not installed

REM Start Backend
echo Starting Backend on port 4000...
start "TWS Backend" cmd /k "cd /d %~dp0 && npm start"

REM Start Admin Dashboard
echo Starting Admin Dashboard on port 3001...
start "TWS Admin Dashboard" cmd /k "cd /d %~dp0\..\admin-dashboard && npm start"

echo All services started!
pause
