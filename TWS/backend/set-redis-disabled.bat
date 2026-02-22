@echo off
REM Script to set REDIS_DISABLED=true in .env file
REM This disables Redis connections and prevents connection errors

echo ========================================
echo Setting REDIS_DISABLED=true in .env
echo ========================================
echo.

cd /d "%~dp0"

REM Check if .env file exists
if not exist ".env" (
    echo [INFO] .env file not found, creating new one...
    echo # Environment Variables > .env
    echo REDIS_DISABLED=true >> .env
    echo [SUCCESS] Created .env file with REDIS_DISABLED=true
    goto :end
)

REM Check if REDIS_DISABLED already exists
findstr /C:"REDIS_DISABLED" .env >nul
if %errorlevel% equ 0 (
    echo [INFO] REDIS_DISABLED found in .env, updating...
    REM Use PowerShell to update the value
    powershell -Command "(Get-Content .env) -replace 'REDIS_DISABLED=.*', 'REDIS_DISABLED=true' | Set-Content .env"
    echo [SUCCESS] Updated REDIS_DISABLED=true in .env
) else (
    echo [INFO] Adding REDIS_DISABLED=true to .env...
    echo REDIS_DISABLED=true >> .env
    echo [SUCCESS] Added REDIS_DISABLED=true to .env
)

:end
echo.
echo ========================================
echo Done! Redis is now disabled.
echo Restart your server for changes to take effect.
echo ========================================
echo.
pause

