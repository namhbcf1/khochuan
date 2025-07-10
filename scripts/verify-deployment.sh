#!/bin/bash

# KhoChuan POS - Deployment Verification Script
# This script verifies that a deployment is working correctly

set -e

# Configuration
DEPLOYMENT_URL=${1:-"https://khochuan-pos.pages.dev"}
API_URL=${2:-"https://khochuan-api.workers.dev"}
LOG_FILE="../CHUAN.MD"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "Verifying deployment at $DEPLOYMENT_URL"
echo "API expected at $API_URL"

# Function to log to CHUAN.MD
log_to_chuan() {
  echo "$1" >> $LOG_FILE
}

# Check if site is accessible
echo "Checking if site is accessible..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DEPLOYMENT_URL)
if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 301 ] || [ "$HTTP_STATUS" -eq 302 ]; then
  echo "Site is accessible (Status: $HTTP_STATUS)"
else
  echo "Site is not accessible! Status code: $HTTP_STATUS"
  log_to_chuan "
## Deployment Verification Failed - $TIMESTAMP
Site at $DEPLOYMENT_URL is not accessible (Status code: $HTTP_STATUS)
"
  exit 1
fi

# Check API health endpoint
echo "Checking API health..."
if curl -s --head --request GET "$API_URL/health" | grep -E "200|301|302" > /dev/null; then
  echo "API is accessible"
else
  echo "API is not accessible!"
  
  # Try without /health for APIs that don't have that endpoint
  if curl -s --head --request GET "$API_URL" | grep -E "200|301|302" > /dev/null; then
    echo "API base URL is accessible (without /health endpoint)"
  else
    log_to_chuan "
## Deployment Verification Failed - $TIMESTAMP
API at $API_URL is not accessible
"
    exit 1
  fi
fi

# Run deployment tests
echo "Running deployment tests..."
cd ..
if node tests/run-deployment-tests.js; then
  echo "Deployment tests passed"
else
  echo "Deployment tests failed!"
  exit 1
fi

# All checks passed
echo "All deployment checks PASSED"
log_to_chuan "
## Deployment Verification Completed - $TIMESTAMP
Full verification completed successfully for $DEPLOYMENT_URL
- Frontend is accessible
- API is accessible
- All tests passed
"

exit 0 