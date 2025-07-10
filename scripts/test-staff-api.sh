#!/bin/bash

# Test script for KhoChuan POS Staff API
# This script tests the Staff Management API endpoints

# Configuration
API_URL="https://khochuan-pos-api.bangachieu2.workers.dev/api/v1"
ADMIN_EMAIL="admin@khochuan.com"
ADMIN_PASSWORD="admin123"

# Text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print section headers
print_header() {
    echo -e "\n${BLUE}==== $1 ====${NC}\n"
}

# Helper function to print success or failure
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# Store the auth token
AUTH_TOKEN=""

print_header "Testing Staff Management API"

# Step 1: Login as admin
echo -e "${YELLOW}1. Authenticating as admin...${NC}"
AUTH_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

# Extract token
AUTH_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}Authentication failed. Cannot proceed with tests.${NC}"
    echo "Response: $AUTH_RESPONSE"
    exit 1
else
    echo -e "${GREEN}Authentication successful. Token received.${NC}"
fi

# Step 2: Get all staff members
print_header "Getting Staff List"
STAFF_RESPONSE=$(curl -s -X GET "$API_URL/staff" \
    -H "Authorization: Bearer $AUTH_TOKEN")

echo "Staff list response:"
echo "$STAFF_RESPONSE" | json_pp

# Step 3: Create a new staff member
print_header "Creating New Staff Member"
NEW_STAFF_EMAIL="teststaff_$(date +%s)@khochuan.com"
NEW_STAFF_NAME="Test Staff $(date +%s)"

echo -e "${YELLOW}Creating staff with email: $NEW_STAFF_EMAIL${NC}"

CREATE_RESPONSE=$(curl -s -X POST "$API_URL/staff" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "{
        \"name\":\"$NEW_STAFF_NAME\",
        \"email\":\"$NEW_STAFF_EMAIL\",
        \"password\":\"password123\",
        \"role\":\"staff\"
    }")

echo "Create staff response:"
echo "$CREATE_RESPONSE" | json_pp

# Extract staff ID
NEW_STAFF_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$NEW_STAFF_ID" ]; then
    echo -e "${RED}Failed to create staff member.${NC}"
else
    echo -e "${GREEN}Successfully created staff member with ID: $NEW_STAFF_ID${NC}"
fi

# Step 4: Get staff stats
if [ ! -z "$NEW_STAFF_ID" ]; then
    print_header "Getting Staff Stats"
    STATS_RESPONSE=$(curl -s -X GET "$API_URL/staff/$NEW_STAFF_ID/stats" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "Staff stats response:"
    echo "$STATS_RESPONSE" | json_pp
fi

# Step 5: Award points to staff
if [ ! -z "$NEW_STAFF_ID" ]; then
    print_header "Awarding Points to Staff"
    POINTS_RESPONSE=$(curl -s -X POST "$API_URL/staff/$NEW_STAFF_ID/points" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "{
            \"points\": 50,
            \"reason\": \"Test achievement\",
            \"referenceId\": \"test-$(date +%s)\"
        }")
    
    echo "Award points response:"
    echo "$POINTS_RESPONSE" | json_pp
fi

# Step 6: Get leaderboard
print_header "Getting Staff Leaderboard"
LEADERBOARD_RESPONSE=$(curl -s -X GET "$API_URL/staff/leaderboard?metric=total_points&limit=5" \
    -H "Authorization: Bearer $AUTH_TOKEN")

echo "Leaderboard response:"
echo "$LEADERBOARD_RESPONSE" | json_pp

# Step 7: Get badges
print_header "Getting Badges"
BADGES_RESPONSE=$(curl -s -X GET "$API_URL/staff/badges" \
    -H "Authorization: Bearer $AUTH_TOKEN")

echo "Badges response:"
echo "$BADGES_RESPONSE" | json_pp

# Step 8: Get challenges
print_header "Getting Challenges"
CHALLENGES_RESPONSE=$(curl -s -X GET "$API_URL/staff/challenges" \
    -H "Authorization: Bearer $AUTH_TOKEN")

echo "Challenges response:"
echo "$CHALLENGES_RESPONSE" | json_pp

# Step 9: Update staff member
if [ ! -z "$NEW_STAFF_ID" ]; then
    print_header "Updating Staff Member"
    UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/staff/$NEW_STAFF_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "{
            \"name\":\"$NEW_STAFF_NAME (Updated)\",
            \"phone\":\"1234567890\"
        }")
    
    echo "Update staff response:"
    echo "$UPDATE_RESPONSE" | json_pp
fi

# Step 10: Delete staff member (or deactivate)
if [ ! -z "$NEW_STAFF_ID" ]; then
    print_header "Deactivating Staff Member"
    DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/staff/$NEW_STAFF_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "Deactivate staff response:"
    echo "$DELETE_RESPONSE" | json_pp
fi

echo -e "\n${GREEN}==== Staff API Tests Completed ====${NC}\n" 