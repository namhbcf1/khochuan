# Test script for KhoChuan POS Staff API
# This script tests the Staff Management API endpoints

# Configuration
$API_URL = "https://khochuan-pos-api.bangachieu2.workers.dev/api/v1"
$ADMIN_EMAIL = "admin@khochuan.com"
$ADMIN_PASSWORD = "admin123"

# Helper function to print section headers
function Print-Header {
    param($text)
    Write-Host "`n==== $text ====`n" -ForegroundColor Blue
}

# Store the auth token
$AUTH_TOKEN = ""

Print-Header "Testing Staff Management API"

# Step 1: Login as admin
Write-Host "1. Authenticating as admin..." -ForegroundColor Yellow
$authBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
} | ConvertTo-Json

$authResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -ContentType "application/json" -Body $authBody -ErrorAction SilentlyContinue

if ($authResponse.status -ne "success") {
    Write-Host "Authentication failed. Cannot proceed with tests." -ForegroundColor Red
    Write-Host "Response: $($authResponse | ConvertTo-Json)"
    exit 1
}

$AUTH_TOKEN = $authResponse.data.token
Write-Host "Authentication successful. Token received." -ForegroundColor Green

# Step 2: Get all staff members
Print-Header "Getting Staff List"
$headers = @{
    "Authorization" = "Bearer $AUTH_TOKEN"
}

try {
    $staffResponse = Invoke-RestMethod -Uri "$API_URL/staff" -Method Get -Headers $headers -ErrorAction SilentlyContinue
    Write-Host "Staff list response:" -ForegroundColor Green
    $staffResponse | ConvertTo-Json -Depth 4
}
catch {
    Write-Host "Failed to get staff list: $_" -ForegroundColor Red
}

# Step 3: Create a new staff member
Print-Header "Creating New Staff Member"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$NEW_STAFF_EMAIL = "teststaff_$timestamp@khochuan.com"
$NEW_STAFF_NAME = "Test Staff $timestamp"

Write-Host "Creating staff with email: $NEW_STAFF_EMAIL" -ForegroundColor Yellow

$createBody = @{
    name = $NEW_STAFF_NAME
    email = $NEW_STAFF_EMAIL
    password = "password123"
    role = "staff"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "$API_URL/staff" -Method Post -ContentType "application/json" -Headers $headers -Body $createBody -ErrorAction SilentlyContinue
    Write-Host "Create staff response:" -ForegroundColor Green
    $createResponse | ConvertTo-Json -Depth 4

    $NEW_STAFF_ID = $createResponse.data.id
    
    if ([string]::IsNullOrEmpty($NEW_STAFF_ID)) {
        Write-Host "Failed to get new staff ID." -ForegroundColor Red
    } else {
        Write-Host "Successfully created staff member with ID: $NEW_STAFF_ID" -ForegroundColor Green
    }
}
catch {
    Write-Host "Failed to create staff: $_" -ForegroundColor Red
    $NEW_STAFF_ID = $null
}

# Step 4: Get staff stats
if (-not [string]::IsNullOrEmpty($NEW_STAFF_ID)) {
    Print-Header "Getting Staff Stats"
    try {
        $statsResponse = Invoke-RestMethod -Uri "$API_URL/staff/$NEW_STAFF_ID/stats" -Method Get -Headers $headers -ErrorAction SilentlyContinue
        Write-Host "Staff stats response:" -ForegroundColor Green
        $statsResponse | ConvertTo-Json -Depth 4
    }
    catch {
        Write-Host "Failed to get staff stats: $_" -ForegroundColor Red
    }
}

# Step 5: Award points to staff
if (-not [string]::IsNullOrEmpty($NEW_STAFF_ID)) {
    Print-Header "Awarding Points to Staff"
    $pointsBody = @{
        points = 50
        reason = "Test achievement"
        referenceId = "test-$timestamp"
    } | ConvertTo-Json

    try {
        $pointsResponse = Invoke-RestMethod -Uri "$API_URL/staff/$NEW_STAFF_ID/points" -Method Post -ContentType "application/json" -Headers $headers -Body $pointsBody -ErrorAction SilentlyContinue
        Write-Host "Award points response:" -ForegroundColor Green
        $pointsResponse | ConvertTo-Json -Depth 4
    }
    catch {
        Write-Host "Failed to award points: $_" -ForegroundColor Red
    }
}

# Step 6: Get leaderboard
Print-Header "Getting Staff Leaderboard"
try {
    $leaderboardResponse = Invoke-RestMethod -Uri "$API_URL/staff/leaderboard?metric=total_points&limit=5" -Method Get -Headers $headers -ErrorAction SilentlyContinue
    Write-Host "Leaderboard response:" -ForegroundColor Green
    $leaderboardResponse | ConvertTo-Json -Depth 4
}
catch {
    Write-Host "Failed to get leaderboard: $_" -ForegroundColor Red
}

# Step 7: Get badges
Print-Header "Getting Badges"
try {
    $badgesResponse = Invoke-RestMethod -Uri "$API_URL/staff/badges" -Method Get -Headers $headers -ErrorAction SilentlyContinue
    Write-Host "Badges response:" -ForegroundColor Green
    $badgesResponse | ConvertTo-Json -Depth 4
}
catch {
    Write-Host "Failed to get badges: $_" -ForegroundColor Red
}

# Step 8: Get challenges
Print-Header "Getting Challenges"
try {
    $challengesResponse = Invoke-RestMethod -Uri "$API_URL/staff/challenges" -Method Get -Headers $headers -ErrorAction SilentlyContinue
    Write-Host "Challenges response:" -ForegroundColor Green
    $challengesResponse | ConvertTo-Json -Depth 4
}
catch {
    Write-Host "Failed to get challenges: $_" -ForegroundColor Red
}

# Step 9: Update staff member
if (-not [string]::IsNullOrEmpty($NEW_STAFF_ID)) {
    Print-Header "Updating Staff Member"
    $updateBody = @{
        name = "$NEW_STAFF_NAME (Updated)"
        phone = "1234567890"
    } | ConvertTo-Json

    try {
        $updateResponse = Invoke-RestMethod -Uri "$API_URL/staff/$NEW_STAFF_ID" -Method Put -ContentType "application/json" -Headers $headers -Body $updateBody -ErrorAction SilentlyContinue
        Write-Host "Update staff response:" -ForegroundColor Green
        $updateResponse | ConvertTo-Json -Depth 4
    }
    catch {
        Write-Host "Failed to update staff: $_" -ForegroundColor Red
    }
}

# Step 10: Delete staff member (or deactivate)
if (-not [string]::IsNullOrEmpty($NEW_STAFF_ID)) {
    Print-Header "Deactivating Staff Member"
    try {
        $deleteResponse = Invoke-RestMethod -Uri "$API_URL/staff/$NEW_STAFF_ID" -Method Delete -Headers $headers -ErrorAction SilentlyContinue
        Write-Host "Deactivate staff response:" -ForegroundColor Green
        $deleteResponse | ConvertTo-Json -Depth 4
    }
    catch {
        Write-Host "Failed to deactivate staff: $_" -ForegroundColor Red
    }
}

Write-Host "`n==== Staff API Tests Completed ====`n" -ForegroundColor Green 