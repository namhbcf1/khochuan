# KhoChuan POS - AI API Testing Script
# This script tests the AI API endpoints for functionality

param (
    [string]$baseUrl = "http://localhost:3000/api/v1/ai",
    [string]$token = "",
    [switch]$verbose = $false
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for console output
$colorSuccess = "Green"
$colorError = "Red"
$colorInfo = "Cyan"
$colorWarning = "Yellow"

# Function to make API requests
function Invoke-ApiRequest {
    param (
        [string]$endpoint,
        [string]$method = "GET",
        [object]$body = $null,
        [hashtable]$query = @{}
    )
    
    $url = "$baseUrl/$endpoint"
    
    # Add query parameters if any
    if ($query.Count -gt 0) {
        $queryString = ""
        foreach ($key in $query.Keys) {
            $value = $query[$key]
            if ($queryString -eq "") {
                $queryString = "?$key=$value"
            } else {
                $queryString += "&$key=$value"
            }
        }
        $url += $queryString
    }
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($token) {
        $headers["Authorization"] = "Bearer $token"
    }
    
    $params = @{
        Uri = $url
        Method = $method
        Headers = $headers
        ContentType = "application/json"
    }
    
    if ($body -and $method -ne "GET") {
        $params["Body"] = ($body | ConvertTo-Json -Depth 10)
    }
    
    if ($verbose) {
        Write-Host "Request: $method $url" -ForegroundColor $colorInfo
        if ($body) {
            Write-Host "Request Body: $($body | ConvertTo-Json -Depth 10)" -ForegroundColor $colorInfo
        }
    }
    
    try {
        $response = Invoke-RestMethod @params
        
        if ($verbose) {
            Write-Host "Response: $($response | ConvertTo-Json -Depth 10 -Compress)" -ForegroundColor $colorInfo
        }
        
        return $response
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $statusDescription = $_.Exception.Response.StatusDescription
        
        Write-Host "Error: $statusCode $statusDescription" -ForegroundColor $colorError
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            
            Write-Host "Response Body: $responseBody" -ForegroundColor $colorError
            
            return $null
        } catch {
            Write-Host "Failed to read error response: $_" -ForegroundColor $colorError
            return $null
        }
    }
}

# Function to run a test and report results
function Test-Endpoint {
    param (
        [string]$name,
        [string]$endpoint,
        [string]$method = "GET",
        [object]$body = $null,
        [hashtable]$query = @{},
        [scriptblock]$validation = { $true }
    )
    
    Write-Host "`n==== Testing $name ====" -ForegroundColor $colorInfo
    
    try {
        $response = Invoke-ApiRequest -endpoint $endpoint -method $method -body $body -query $query
        
        if ($response -eq $null) {
            Write-Host "Test Failed: No response received" -ForegroundColor $colorError
            return $false
        }
        
        $valid = & $validation $response
        
        if ($valid) {
            Write-Host "Test Passed: $name" -ForegroundColor $colorSuccess
            return $true
        } else {
            Write-Host "Test Failed: Validation failed for $name" -ForegroundColor $colorError
            return $false
        }
    } catch {
        Write-Host "Test Failed: $_" -ForegroundColor $colorError
        return $false
    }
}

# Function to authenticate and get token
function Get-AuthToken {
    param (
        [string]$username,
        [string]$password
    )
    
    Write-Host "`n==== Authenticating ====" -ForegroundColor $colorInfo
    
    $authUrl = $baseUrl -replace "/ai", "/auth/login"
    
    $body = @{
        email = $username
        password = $password
    }
    
    try {
        $response = Invoke-RestMethod -Uri $authUrl -Method POST -Body ($body | ConvertTo-Json) -ContentType "application/json"
        
        if ($response.success -and $response.data.token) {
            Write-Host "Authentication successful" -ForegroundColor $colorSuccess
            return $response.data.token
        } else {
            Write-Host "Authentication failed: Invalid response format" -ForegroundColor $colorError
            return $null
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $statusDescription = $_.Exception.Response.StatusDescription
        
        Write-Host "Authentication failed: $statusCode $statusDescription" -ForegroundColor $colorError
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            
            Write-Host "Response Body: $responseBody" -ForegroundColor $colorError
        } catch {
            Write-Host "Failed to read error response: $_" -ForegroundColor $colorError
        }
        
        return $null
    }
}

# Main execution
Write-Host "KhoChuan POS - AI API Testing Script" -ForegroundColor $colorInfo
Write-Host "Base URL: $baseUrl" -ForegroundColor $colorInfo

# If no token provided, prompt for login
if (-not $token) {
    $username = Read-Host "Enter admin username (email)"
    $password = Read-Host "Enter password" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    
    $token = Get-AuthToken -username $username -password $plainPassword
    
    if (-not $token) {
        Write-Host "Failed to authenticate. Exiting." -ForegroundColor $colorError
        exit 1
    }
}

# Track test results
$testResults = @{
    Passed = 0
    Failed = 0
    Total = 0
}

# Test 1: Customer Segmentation
$result = Test-Endpoint -name "Customer Segmentation" -endpoint "customer-segments" -query @{
    timeframe = "90d"
    segment_count = 5
} -validation {
    param($response)
    
    if (-not $response.success) {
        Write-Host "API returned error: $($response.message)" -ForegroundColor $colorError
        return $false
    }
    
    if (-not $response.data -or -not $response.data.segments) {
        Write-Host "Missing segments in response" -ForegroundColor $colorError
        return $false
    }
    
    Write-Host "Found $($response.data.segments.Count) customer segments" -ForegroundColor $colorSuccess
    return $true
}

if ($result) { $testResults.Passed++ } else { $testResults.Failed++ }
$testResults.Total++

# Test 2: Demand Forecasting
$result = Test-Endpoint -name "Demand Forecasting" -endpoint "demand-forecast" -query @{
    forecast_period = "30d"
} -validation {
    param($response)
    
    if (-not $response.success) {
        Write-Host "API returned error: $($response.message)" -ForegroundColor $colorError
        return $false
    }
    
    if (-not $response.data -or -not $response.data.forecasts) {
        Write-Host "Missing forecasts in response" -ForegroundColor $colorError
        return $false
    }
    
    Write-Host "Found forecasts for $($response.data.forecasts.Count) products" -ForegroundColor $colorSuccess
    return $true
}

if ($result) { $testResults.Passed++ } else { $testResults.Failed++ }
$testResults.Total++

# Test 3: Price Optimization
$result = Test-Endpoint -name "Price Optimization" -endpoint "price-optimization" -query @{
    optimization_target = "revenue"
} -validation {
    param($response)
    
    if (-not $response.success) {
        Write-Host "API returned error: $($response.message)" -ForegroundColor $colorError
        return $false
    }
    
    if (-not $response.data -or -not $response.data.optimizations) {
        Write-Host "Missing optimizations in response" -ForegroundColor $colorError
        return $false
    }
    
    Write-Host "Found price optimizations for $($response.data.optimizations.Count) products" -ForegroundColor $colorSuccess
    return $true
}

if ($result) { $testResults.Passed++ } else { $testResults.Failed++ }
$testResults.Total++

# Test 4: Price Simulation
$result = Test-Endpoint -name "Price Simulation" -endpoint "price-simulation" -method "POST" -body @{
    product_id = 1
    price = 19.99
} -validation {
    param($response)
    
    if (-not $response.success) {
        Write-Host "API returned error: $($response.message)" -ForegroundColor $colorError
        return $false
    }
    
    if (-not $response.data -or -not $response.data.product_id) {
        Write-Host "Missing simulation data in response" -ForegroundColor $colorError
        return $false
    }
    
    Write-Host "Successfully simulated price change for product $($response.data.product_name)" -ForegroundColor $colorSuccess
    return $true
}

if ($result) { $testResults.Passed++ } else { $testResults.Failed++ }
$testResults.Total++

# Test 5: Product Recommendations
$result = Test-Endpoint -name "Product Recommendations" -endpoint "recommendations" -query @{
    customer_id = 1
    limit = 5
} -validation {
    param($response)
    
    if (-not $response.success) {
        Write-Host "API returned error: $($response.message)" -ForegroundColor $colorError
        return $false
    }
    
    if (-not $response.data) {
        Write-Host "Missing recommendations in response" -ForegroundColor $colorError
        return $false
    }
    
    $totalRecommendations = 0
    if ($response.data.personalized) { $totalRecommendations += $response.data.personalized.Count }
    if ($response.data.trending) { $totalRecommendations += $response.data.trending.Count }
    if ($response.data.similar) { $totalRecommendations += $response.data.similar.Count }
    if ($response.data.complementary) { $totalRecommendations += $response.data.complementary.Count }
    
    Write-Host "Found $totalRecommendations total recommendations across all types" -ForegroundColor $colorSuccess
    return $true
}

if ($result) { $testResults.Passed++ } else { $testResults.Failed++ }
$testResults.Total++

# Test 6: Trending Products
$result = Test-Endpoint -name "Trending Products" -endpoint "trending-products" -query @{
    limit = 10
} -validation {
    param($response)
    
    if (-not $response.success) {
        Write-Host "API returned error: $($response.message)" -ForegroundColor $colorError
        return $false
    }
    
    if (-not $response.data -or $response.data.Count -eq 0) {
        Write-Host "Missing trending products in response" -ForegroundColor $colorError
        return $false
    }
    
    Write-Host "Found $($response.data.Count) trending products" -ForegroundColor $colorSuccess
    return $true
}

if ($result) { $testResults.Passed++ } else { $testResults.Failed++ }
$testResults.Total++

# Test 7: Similar Products
$result = Test-Endpoint -name "Similar Products" -endpoint "similar-products/1" -query @{
    limit = 5
} -validation {
    param($response)
    
    if (-not $response.success) {
        Write-Host "API returned error: $($response.message)" -ForegroundColor $colorError
        return $false
    }
    
    if (-not $response.data) {
        Write-Host "Missing similar products in response" -ForegroundColor $colorError
        return $false
    }
    
    Write-Host "Found $($response.data.Count) similar products" -ForegroundColor $colorSuccess
    return $true
}

if ($result) { $testResults.Passed++ } else { $testResults.Failed++ }
$testResults.Total++

# Test 8: Complementary Products
$result = Test-Endpoint -name "Complementary Products" -endpoint "complementary-products/1" -query @{
    limit = 5
} -validation {
    param($response)
    
    if (-not $response.success) {
        Write-Host "API returned error: $($response.message)" -ForegroundColor $colorError
        return $false
    }
    
    if (-not $response.data) {
        Write-Host "Missing complementary products in response" -ForegroundColor $colorError
        return $false
    }
    
    Write-Host "Found $($response.data.Count) complementary products" -ForegroundColor $colorSuccess
    return $true
}

if ($result) { $testResults.Passed++ } else { $testResults.Failed++ }
$testResults.Total++

# Print summary
Write-Host "`n==== Test Summary ====" -ForegroundColor $colorInfo
Write-Host "Total Tests: $($testResults.Total)" -ForegroundColor $colorInfo
Write-Host "Passed: $($testResults.Passed)" -ForegroundColor $colorSuccess
Write-Host "Failed: $($testResults.Failed)" -ForegroundColor $colorError

# Return exit code based on test results
if ($testResults.Failed -gt 0) {
    exit 1
} else {
    exit 0
} 