@echo off
REM Simple batch file to run the grant-all-modules-access script
REM This will try to find Node.js automatically

REM Change to the directory where this batch file is located
cd /d "%~dp0"

echo ========================================
echo Grant All Modules Access - Co-Founder Setup
echo ========================================
echo.
echo [INFO] Current directory: %CD%
echo.

REM Check if node is available
where node >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OK] Node.js found in PATH
    echo.
    echo [INFO] Running: node grant-all-modules-access.js
    echo.
    node grant-all-modules-access.js
    goto :end
)

echo [INFO] Node.js not found in PATH. Searching common locations...
echo.

REM Check common Node.js installation paths
set "NODE_EXE="

if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files\nodejs\node.exe"
    goto :run
)

if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files (x86)\nodejs\node.exe"
    goto :run
)

if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
    goto :run
)

REM Not found - show installation instructions
echo [ERROR] Node.js not found!
echo.
echo ========================================
echo INSTALLATION REQUIRED
echo ========================================
echo.
echo Please install Node.js:
echo.
echo 1. Visit: https://nodejs.org/
echo 2. Download the LTS version (Windows Installer)
echo 3. Run the installer
echo 4. Make sure to check "Add to PATH" during installation
echo 5. Restart PowerShell/Command Prompt after installation
echo 6. Run this script again
echo.
echo ========================================
echo.
pause
exit /b 1

:run
echo [OK] Found Node.js at: %NODE_EXE%
echo.
echo [INFO] Current directory: %CD%
echo [INFO] Running: "%NODE_EXE%" grant-all-modules-access.js
echo.
"%NODE_EXE%" grant-all-modules-access.js

:end
if %ERRORLEVEL% == 0 (
    echo.
    echo ========================================
    echo SUCCESS! Co-founder access granted.
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERROR: Script failed. Check output above.
    echo ========================================
)
echo.
pause

