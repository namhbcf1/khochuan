# KhoChuan POS - Deployment Verification Script (PowerShell)
# This script verifies that a deployment is working correctly

param(
    [string]$DeploymentUrl = "https://khochuan-pos.pages.dev",
    [string]$ApiUrl = "https://jsonplaceholder.typicode.com"
)

$LogFile = Join-Path (Split-Path $PSScriptRoot -Parent) "CHUAN.MD"
$Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"

# Function to log to CHUAN.MD
function Log-ToChuan {
    param([string]$Message)
    Add-Content -Path $LogFile -Value $Message
}

Write-Host "Verifying deployment at $DeploymentUrl" -ForegroundColor Cyan
Write-Host "API expected at $ApiUrl" -ForegroundColor Cyan

# Check if site is accessible
Write-Host "Checking if site is accessible..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $DeploymentUrl -Method Head -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "Site is accessible" -ForegroundColor Green
    } else {
        Write-Host "Site is not accessible! Status code: $($response.StatusCode)" -ForegroundColor Red
        Log-ToChuan @"

## Deployment Verification Failed - $Timestamp
Site at $DeploymentUrl is not accessible (Status code: $($response.StatusCode))
"@
        exit 1
    }
} catch {
    Write-Host "Site is not accessible! Error: $($_.Exception.Message)" -ForegroundColor Red
    Log-ToChuan @"

## Deployment Verification Failed - $Timestamp
Site at $DeploymentUrl is not accessible. Error: $($_.Exception.Message)
"@
    exit 1
}

# Check API health endpoint
Write-Host "Checking API health..." -ForegroundColor Yellow
$apiAccessible = $false

try {
    # First try the /health endpoint
    $apiResponse = Invoke-WebRequest -Uri "$ApiUrl/health" -Method Head -UseBasicParsing -ErrorAction SilentlyContinue
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "API health endpoint is accessible" -ForegroundColor Green
        $apiAccessible = $true
    }
} catch {
    Write-Host "API health endpoint not found. Trying root endpoint..." -ForegroundColor Yellow
}

# If health endpoint failed, try the root endpoint
if (-not $apiAccessible) {
    try {
        $apiRootResponse = Invoke-WebRequest -Uri $ApiUrl -Method Head -UseBasicParsing
        if ($apiRootResponse.StatusCode -eq 200 -or $apiRootResponse.StatusCode -eq 201) {
            Write-Host "API root endpoint is accessible" -ForegroundColor Green
            $apiAccessible = $true
        } else {
            Write-Host "API is not accessible! Status code: $($apiRootResponse.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "API is not accessible! Error: $($_.Exception.Message)" -ForegroundColor Red
        Log-ToChuan @"

## Deployment Verification Failed - $Timestamp
API at $ApiUrl is not accessible. Error: $($_.Exception.Message)
"@
        exit 1
    }
}

# Run deployment tests
Write-Host "Running deployment tests..." -ForegroundColor Yellow
$testScriptPath = Join-Path (Split-Path $PSScriptRoot -Parent) "tests\run-deployment-tests.js"
try {
    # Set working directory to project root
    Push-Location (Split-Path $PSScriptRoot -Parent)
    
    # Set environment variables for the test
    $env:DEPLOYMENT_URL = $DeploymentUrl
    $env:API_URL = $ApiUrl
    $env:TEST_DEPLOYED = "1"
    
    node $testScriptPath
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Deployment tests passed" -ForegroundColor Green
    } else {
        Write-Host "Deployment tests failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Deployment tests failed! Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

# All checks passed
Write-Host "All deployment checks PASSED" -ForegroundColor Green
Log-ToChuan @"

## Deployment Verification Completed - $Timestamp
Full verification completed successfully for $DeploymentUrl
- Frontend is accessible
- API is accessible
- All tests passed
"@

exit 0 