# PowerShell Script to Test Theme API Endpoints
# Usage: .\test-theme-api.ps1

$ErrorActionPreference = "Stop"

Write-Host "Testing Tenant Theme API Endpoints" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_URL = "http://localhost:5000"
$TEST_EMAIL = Read-Host "Enter your email"
$TEST_PASSWORD = Read-Host "Enter your password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($TEST_PASSWORD)
$TEST_PASSWORD_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Step 1: Login
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $TEST_EMAIL
        password = $TEST_PASSWORD_PLAIN
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/login" `
        -Method Post `
        -Headers @{'Content-Type'='application/json'} `
        -Body $loginBody

    if ($loginResponse.success -and $loginResponse.accessToken) {
        Write-Host "Login successful!" -ForegroundColor Green
        $token = $loginResponse.accessToken
        $tenantSlug = $null
        
        if ($loginResponse.user.tenantSlug) {
            $tenantSlug = $loginResponse.user.tenantSlug
        } elseif ($loginResponse.user.tenantId) {
            $tenantSlug = $loginResponse.user.tenantId
        } elseif ($loginResponse.user.orgId -and $loginResponse.user.orgId.slug) {
            $tenantSlug = $loginResponse.user.orgId.slug
        }
        
        if (-not $tenantSlug) {
            Write-Host "Warning: Could not determine tenant slug from login response" -ForegroundColor Yellow
            Write-Host "Login response:" -ForegroundColor Yellow
            $loginResponse | ConvertTo-Json -Depth 5
            $tenantSlug = Read-Host "Enter tenant slug manually"
        }
        
        Write-Host "Tenant Slug: $tenantSlug" -ForegroundColor Cyan
    } else {
        Write-Host "Login failed!" -ForegroundColor Red
        $loginResponse | ConvertTo-Json
        exit 1
    }
} catch {
    Write-Host "Login error: $_" -ForegroundColor Red
    Write-Host "Error Details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Get Theme
Write-Host "Step 2: Getting current theme..." -ForegroundColor Yellow
try {
    $getThemeResponse = Invoke-RestMethod -Uri "$API_URL/api/tenant/$tenantSlug/organization/settings/theme" `
        -Method Get `
        -Headers @{
            'Authorization' = "Bearer $token"
            'Content-Type' = 'application/json'
        }

    if ($getThemeResponse.success) {
        Write-Host "Theme retrieved successfully!" -ForegroundColor Green
        Write-Host "Current theme:" -ForegroundColor Cyan
        $getThemeResponse.data.theme | ConvertTo-Json -Depth 5
    } else {
        Write-Host "Failed to get theme" -ForegroundColor Red
        $getThemeResponse | ConvertTo-Json
    }
} catch {
    Write-Host "Get theme error: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    if ($_.ErrorDetails.Message) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Step 3: Update Theme
Write-Host "Step 3: Updating theme..." -ForegroundColor Yellow
try {
    $testTheme = @{
        name = "blue"
        colors = @{
            primary = "#2563EB"
            secondary = "#0284C7"
            accent = "#0EA5E9"
        }
        fonts = @{
            heading = "Geist"
            body = "Inter"
        }
        customColors = @{}
    } | ConvertTo-Json

    Write-Host "Updating with theme:" -ForegroundColor Cyan
    $testTheme | ConvertFrom-Json | ConvertTo-Json -Depth 5

    $updateThemeResponse = Invoke-RestMethod -Uri "$API_URL/api/tenant/$tenantSlug/organization/settings/theme" `
        -Method Put `
        -Headers @{
            'Authorization' = "Bearer $token"
            'Content-Type' = 'application/json'
        } `
        -Body $testTheme

    if ($updateThemeResponse.success) {
        Write-Host "Theme updated successfully!" -ForegroundColor Green
        Write-Host "Updated theme:" -ForegroundColor Cyan
        $updateThemeResponse.data.theme | ConvertTo-Json -Depth 5
    } else {
        Write-Host "Failed to update theme" -ForegroundColor Red
        $updateThemeResponse | ConvertTo-Json
    }
} catch {
    Write-Host "Update theme error: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    if ($_.ErrorDetails.Message) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Step 4: Verify Theme Persisted
Write-Host "Step 4: Verifying theme persisted..." -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-RestMethod -Uri "$API_URL/api/tenant/$tenantSlug/organization/settings/theme" `
        -Method Get `
        -Headers @{
            'Authorization' = "Bearer $token"
            'Content-Type' = 'application/json'
        }

    if ($verifyResponse.success) {
        $currentThemeName = $verifyResponse.data.theme.name
        if ($currentThemeName -eq "blue") {
            Write-Host "Theme persisted correctly! Name: $currentThemeName" -ForegroundColor Green
        } else {
            Write-Host "Theme persisted but name is '$currentThemeName' (expected 'blue')" -ForegroundColor Yellow
        }
        Write-Host "Current theme:" -ForegroundColor Cyan
        $verifyResponse.data.theme | ConvertTo-Json -Depth 5
    } else {
        Write-Host "Failed to verify theme" -ForegroundColor Red
    }
} catch {
    Write-Host "Verify theme error: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Check backend terminal for logs" -ForegroundColor White
Write-Host "2. Check browser console for theme-related logs" -ForegroundColor White
Write-Host "3. Refresh the page and see if theme persists" -ForegroundColor White
