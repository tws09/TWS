# Update all import statements to use new service paths
$ErrorActionPreference = "Stop"

$frontendPath = Join-Path $PSScriptRoot "..\..\.."
$servicesPath = Join-Path $frontendPath "src\shared\services"

# Mapping of old imports to new imports
$importMappings = @{
    # Analytics
    "from ['\`"].*shared/services/analyticsService['\`"]" = "from '@/shared/services/analytics/analytics.service'"
    "from ['\`"].*shared/services/aiInsightsService['\`"]" = "from '@/shared/services/analytics/ai-insights.service'"
    
    # Auth
    "from ['\`"].*shared/services/secureTokenService['\`"]" = "from '@/shared/services/auth/secure-token.service'"
    "from ['\`"].*shared/services/tokenRefreshService['\`"]" = "from '@/shared/services/auth/token-refresh.service'"
    
    # Tenant
    "from ['\`"].*shared/services/tenantApiService['\`"]" = "from '@/shared/services/tenant/tenant-api.service'"
    
    # Business
    "from ['\`"].*shared/services/billingService['\`"]" = "from '@/shared/services/business/billing.service'"
    "from ['\`"].*shared/services/equityService['\`"]" = "from '@/shared/services/business/equity.service'"
    "from ['\`"].*shared/services/formManagementService['\`"]" = "from '@/shared/services/business/form-management.service'"
    "from ['\`"].*shared/services/partnerService['\`"]" = "from '@/shared/services/business/partner.service'"
    "from ['\`"].*shared/services/resourceService['\`"]" = "from '@/shared/services/business/resource.service'"
    "from ['\`"].*shared/services/taskService['\`"]" = "from '@/shared/services/business/task.service'"
    "from ['\`"].*shared/services/usageTrackingService['\`"]" = "from '@/shared/services/business/usage-tracking.service'"
    "from ['\`"].*shared/services/workspaceService['\`"]" = "from '@/shared/services/business/workspace.service'"
}

# More specific patterns for different path depths
$specificMappings = @{
    # Relative paths (../../shared/services/...)
    "from ['\`"]\.\.\/\.\.\/\.\.\/shared\/services\/tenantApiService['\`"]" = "from '../../../shared/services/tenant/tenant-api.service'"
    "from ['\`"]\.\.\/\.\.\/\.\.\/\.\.\/shared\/services\/tenantApiService['\`"]" = "from '../../../../shared/services/tenant/tenant-api.service'"
    "from ['\`"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/shared\/services\/tenantApiService['\`"]" = "from '../../../../../shared/services/tenant/tenant-api.service'"
    "from ['\`"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/shared\/services\/tenantApiService['\`"]" = "from '../../../../../../shared/services/tenant/tenant-api.service'"
    "from ['\`"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/shared\/services\/tenantApiService['\`"]" = "from '../../../../../../../shared/services/tenant/tenant-api.service'"
    
    # Absolute paths (@/shared/services/...)
    "from ['\`"]@\/shared\/services\/tenantApiService['\`"]" = "from '@/shared/services/tenant/tenant-api.service'"
}

# Get all JavaScript/TypeScript files in frontend/src
$jsFiles = Get-ChildItem -Path (Join-Path $frontendPath "src") -Include "*.js","*.jsx","*.ts","*.tsx" -Recurse | Where-Object {
    $_.FullName -notmatch "node_modules" -and
    $_.FullName -notmatch "\.git" -and
    $_.FullName -notmatch "services\\index\.js"  # Skip the index file
}

$updatedCount = 0
$fileCount = 0

foreach ($file in $jsFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileUpdated = $false
    
    # Apply specific mappings first (more specific patterns)
    foreach ($mapping in $specificMappings.GetEnumerator()) {
        if ($content -match $mapping.Key) {
            $content = $content -replace $mapping.Key, $mapping.Value
            $fileUpdated = $true
        }
    }
    
    # Apply general mappings
    foreach ($mapping in $importMappings.GetEnumerator()) {
        if ($content -match $mapping.Key) {
            $content = $content -replace $mapping.Key, $mapping.Value
            $fileUpdated = $true
        }
    }
    
    # Handle relative path patterns more generically
    $relativePatterns = @{
        "tenantApiService" = "tenant/tenant-api.service"
        "analyticsService" = "analytics/analytics.service"
        "aiInsightsService" = "analytics/ai-insights.service"
        "secureTokenService" = "auth/secure-token.service"
        "tokenRefreshService" = "auth/token-refresh.service"
        "billingService" = "business/billing.service"
        "equityService" = "business/equity.service"
        "formManagementService" = "business/form-management.service"
        "partnerService" = "business/partner.service"
        "resourceService" = "business/resource.service"
        "taskService" = "business/task.service"
        "usageTrackingService" = "business/usage-tracking.service"
        "workspaceService" = "business/workspace.service"
    }
    
    foreach ($pattern in $relativePatterns.GetEnumerator()) {
        $oldPattern = "shared/services/$($pattern.Key)"
        $newPattern = "shared/services/$($pattern.Value)"
        
        if ($content -match [regex]::Escape($oldPattern)) {
            $content = $content -replace [regex]::Escape($oldPattern), $newPattern
            $fileUpdated = $true
        }
    }
    
    if ($fileUpdated) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $relativePath = $file.FullName.Replace($frontendPath, '')
        Write-Host "Updated: $relativePath" -ForegroundColor Green
        $updatedCount++
    }
    
    $fileCount++
}

Write-Host "`nUpdate complete!" -ForegroundColor Green
Write-Host "Files scanned: $fileCount" -ForegroundColor Cyan
Write-Host "Files updated: $updatedCount" -ForegroundColor Green
