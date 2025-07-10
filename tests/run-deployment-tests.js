#!/usr/bin/env node

/**
 * Script to run deployment tests against the live KhoChuan POS system
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'https://khochuan-pos.pages.dev';
const API_URL = process.env.API_URL || 'https://jsonplaceholder.typicode.com';
const REPORT_PATH = path.join(__dirname, '..', 'playwright-report');
const LOG_FILE = path.join(__dirname, '..', 'CHUAN.MD');

// Ensure the report directory exists
if (!fs.existsSync(REPORT_PATH)) {
  fs.mkdirSync(REPORT_PATH, { recursive: true });
}

console.log('Running deployment tests against:', DEPLOYMENT_URL);

try {
  // Set environment variables for the test
  process.env.TEST_DEPLOYED = "1";
  process.env.DEPLOYMENT_URL = DEPLOYMENT_URL;
  process.env.API_URL = API_URL;
  
  // Use a simpler command that works reliably
  const command = `npx playwright test --grep "Deployment Verification" --project=deployed`;
  console.log('Running command:', command);
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('Deployment tests completed successfully');
  
  // Append test results to the CHUAN.MD file
  const timestamp = new Date().toISOString();
  const successMessage = `
## Deployment Test Results - ${timestamp}
Deployment tests passed for ${DEPLOYMENT_URL}
- All page loads verified
- Login form appears correctly
- No console errors detected
- API endpoints accessible

To view detailed report: \`npx playwright show-report\`
`;

  fs.appendFileSync(LOG_FILE, successMessage);
  
} catch (error) {
  console.error('Deployment tests failed');
  
  // Append failure information to the CHUAN.MD file
  const timestamp = new Date().toISOString();
  const errorMessage = `
## Deployment Test Results - ${timestamp}
Deployment tests FAILED for ${DEPLOYMENT_URL}
- Check playwright-report directory for details
- Run \`npx playwright show-report\` to view errors

Error: ${error.message || 'Unknown error'}
`;

  fs.appendFileSync(LOG_FILE, errorMessage);
  process.exit(1);
} 