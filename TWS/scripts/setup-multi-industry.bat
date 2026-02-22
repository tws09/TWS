@echo off
REM Multi-Industry Master ERP Setup Script for Windows
REM This script sets up the complete Multi-Industry Master ERP system

echo.
echo 🚀 Setting up Multi-Industry Master ERP System...
echo ==================================================

REM Check if MongoDB connection is configured
echo [INFO] Checking MongoDB connection configuration...
if not defined MONGO_URI (
    echo [INFO] Setting up environment variables...
    set MONGO_URI=mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack
    set JWT_SECRET=your_jwt_secret_here_change_in_production
    set JWT_REFRESH_SECRET=your_jwt_refresh_secret_here_change_in_production
    set ENCRYPTION_MASTER_KEY=your_encryption_master_key_here_32_chars
    echo [SUCCESS] Environment variables configured for MongoDB Atlas
) else (
    echo [SUCCESS] MongoDB connection already configured
)

REM Setup backend
echo.
echo [INFO] Setting up backend...

if not exist "backend" (
    echo [ERROR] Backend directory not found. Please run this script from the TWS root directory.
    pause
    exit /b 1
)

cd backend

echo [INFO] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Backend dependencies installed

echo [INFO] Seeding Master ERP templates...
call node src/scripts/seedMasterERPs.js
if %errorlevel% neq 0 (
    echo [ERROR] Failed to seed Master ERP templates
    pause
    exit /b 1
)
echo [SUCCESS] Master ERP templates seeded successfully

echo [INFO] Testing Master ERP system...
call node src/scripts/testMasterERP.js
if %errorlevel% neq 0 (
    echo [WARNING] Master ERP system test failed, but continuing...
) else (
    echo [SUCCESS] Master ERP system test passed
)

cd ..

REM Setup frontend
echo.
echo [INFO] Setting up frontend...

if not exist "frontend" (
    echo [ERROR] Frontend directory not found. Please run this script from the TWS root directory.
    pause
    exit /b 1
)

cd frontend

echo [INFO] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Frontend dependencies installed

cd ..

echo.
echo [SUCCESS] Multi-Industry Master ERP system setup completed!
echo.

REM Ask if user wants to start services
set /p start_services="Do you want to start the services now? (y/n): "
if /i "%start_services%"=="y" (
    echo.
    echo [INFO] Starting services...
    echo [INFO] Starting backend server...
    start "Backend Server" cmd /k "cd backend && npm start"
    
    REM Wait a moment for backend to start
    timeout /t 3 /nobreak >nul
    
    echo [INFO] Starting frontend server...
    start "Frontend Server" cmd /k "cd frontend && npm start"
    
    echo.
    echo [SUCCESS] Services started successfully!
    echo.
    echo [INFO] Access your Multi-Industry Master ERP system:
    echo [INFO]   Frontend: http://localhost:3000
    echo [INFO]   Backend API: http://localhost:5000
    echo [INFO]   Supra-Admin: http://localhost:3000/supra-admin
    echo [INFO]   Master ERP Management: http://localhost:3000/supra-admin/master-erp
    echo.
    echo [INFO] Press any key to close this window...
    pause >nul
) else (
    echo.
    echo [INFO] Setup complete. To start services manually:
    echo [INFO]   Backend: cd backend ^&^& npm start
    echo [INFO]   Frontend: cd frontend ^&^& npm start
    echo.
    echo [INFO] Press any key to close this window...
    pause >nul
)
