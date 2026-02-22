# PowerShell script to set REDIS_DISABLED=true in .env file
# This disables Redis connections and prevents connection errors

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting REDIS_DISABLED=true in .env" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "[INFO] .env file not found, creating new one..." -ForegroundColor Yellow
    @"
# Environment Variables
REDIS_DISABLED=true
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "[SUCCESS] Created .env file with REDIS_DISABLED=true" -ForegroundColor Green
} else {
    # Read current .env file
    $envContent = Get-Content ".env" -Raw
    
    # Check if REDIS_DISABLED exists
    if ($envContent -match "REDIS_DISABLED") {
        Write-Host "[INFO] REDIS_DISABLED found in .env, updating..." -ForegroundColor Yellow
        # Update existing value
        $envContent = $envContent -replace "REDIS_DISABLED\s*=\s*.*", "REDIS_DISABLED=true"
        $envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
        Write-Host "[SUCCESS] Updated REDIS_DISABLED=true in .env" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Adding REDIS_DISABLED=true to .env..." -ForegroundColor Yellow
        # Add new line
        Add-Content -Path ".env" -Value "REDIS_DISABLED=true"
        Write-Host "[SUCCESS] Added REDIS_DISABLED=true to .env" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done! Redis is now disabled." -ForegroundColor Green
Write-Host "Restart your server for changes to take effect." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

