# Frontend Service Reorganization Script
$ErrorActionPreference = "Stop"

$servicesPath = $PSScriptRoot

Write-Host "Starting frontend service reorganization..." -ForegroundColor Green

# Service mappings: [sourceFile] = @{folder="targetFolder"; name="newName"}
$serviceMappings = @{
    # Analytics Services
    "analyticsService.js" = @{folder="analytics"; name="analytics.service.js"}
    "aiInsightsService.js" = @{folder="analytics"; name="ai-insights.service.js"}
    
    # Auth Services
    "secureTokenService.js" = @{folder="auth"; name="secure-token.service.js"}
    "tokenRefreshService.js" = @{folder="auth"; name="token-refresh.service.js"}
    
    # Tenant Services
    "tenantApiService.js" = @{folder="tenant"; name="tenant-api.service.js"}
    
    # Business Services
    "billingService.js" = @{folder="business"; name="billing.service.js"}
    "equityService.js" = @{folder="business"; name="equity.service.js"}
    "formManagementService.js" = @{folder="business"; name="form-management.service.js"}
    "partnerService.js" = @{folder="business"; name="partner.service.js"}
    "resourceService.js" = @{folder="business"; name="resource.service.js"}
    "taskService.js" = @{folder="business"; name="task.service.js"}
    "usageTrackingService.js" = @{folder="business"; name="usage-tracking.service.js"}
    "workspaceService.js" = @{folder="business"; name="workspace.service.js"}
}

$movedCount = 0
$skippedCount = 0

foreach ($mapping in $serviceMappings.GetEnumerator()) {
    $sourceFile = $mapping.Key
    $targetFolder = $mapping.Value.folder
    $newName = $mapping.Value.name
    $sourcePath = Join-Path $servicesPath $sourceFile
    $targetDir = Join-Path $servicesPath $targetFolder
    $targetPath = Join-Path $targetDir $newName
    
    if (Test-Path $sourcePath) {
        # Create target directory if it doesn't exist
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            Write-Host "Created directory: $targetFolder" -ForegroundColor Yellow
        }
        
        # Move file
        Move-Item -Path $sourcePath -Destination $targetPath -Force
        Write-Host "Moved: $sourceFile -> $targetFolder/$newName" -ForegroundColor Green
        $movedCount++
    } else {
        Write-Host "Skipped: $sourceFile (not found)" -ForegroundColor Gray
        $skippedCount++
    }
}

Write-Host "`nReorganization complete!" -ForegroundColor Green
Write-Host "Moved: $movedCount files" -ForegroundColor Green
Write-Host "Skipped: $skippedCount files" -ForegroundColor Yellow
Write-Host "`nNOTE: You need to update all import statements in your codebase to use the new paths!" -ForegroundColor Red
