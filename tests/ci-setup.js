/**
 * CI/CD setup for KhoChuan Playwright tests
 * 
 * This file handles CI environment setup, configuration and reporting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Setup for Continuous Integration environments
 */
async function setupCI() {
  console.log('Setting up CI environment for KhoChuan testing...');
  
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, '..', 'playwright-report');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Create test-results directory if it doesn't exist
  const resultsDir = path.join(__dirname, '..', 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Create fixtures directory and sample files if they don't exist
  const fixturesDir = path.join(__dirname, 'fixtures');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
    
    // Create a sample inventory update CSV file for tests
    const sampleCsvPath = path.join(fixturesDir, 'inventory-update.csv');
    const sampleCsvContent = `SKU,Quantity,Location\nTP-123456,100,Main\nTP-789012,50,Main\nTP-345678,75,Main`;
    fs.writeFileSync(sampleCsvPath, sampleCsvContent);
    
    // Create a sample badge image for tests
    // This uses a simple 1x1 transparent PNG base64 encoded
    const sampleBadgePath = path.join(fixturesDir, 'badge.png');
    const sampleBadgeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    fs.writeFileSync(sampleBadgePath, Buffer.from(sampleBadgeBase64, 'base64'));
  }
  
  try {
    // Install Playwright browser dependencies if in CI environment
    if (process.env.CI) {
      console.log('Installing Playwright dependencies in CI environment...');
      execSync('npx playwright install --with-deps chromium firefox webkit', { stdio: 'inherit' });
    }
    
    console.log('CI setup completed successfully!');
  } catch (error) {
    console.error('Error setting up CI environment:', error);
    process.exit(1);
  }
}

/**
 * Generate GitHub Actions workflow file if needed
 */
function generateGitHubWorkflow() {
  const workflowDir = path.join(__dirname, '..', '.github', 'workflows');
  const workflowFile = path.join(workflowDir, 'playwright.yml');
  
  // Create .github/workflows directory if it doesn't exist
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }
  
  // Skip if workflow file already exists
  if (fs.existsSync(workflowFile)) {
    console.log('GitHub Actions workflow file already exists');
    return;
  }
  
  // GitHub Actions workflow configuration
  const workflowContent = `name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npm run test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
    - name: Run GPT-4 Test Analysis
      if: always()
      run: node tests/gpt-test-runner.js --analyze-only
      env:
        OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
`;
  
  // Write workflow file
  fs.writeFileSync(workflowFile, workflowContent);
  console.log('Generated GitHub Actions workflow file');
}

/**
 * Main setup function
 */
async function main() {
  await setupCI();
  generateGitHubWorkflow();
  
  // Log summary
  console.log('\n=== KhoChuan Testing Framework Setup ===');
  console.log('✅ Test fixtures and directories created');
  console.log('✅ CI environment configured');
  console.log('✅ GitHub Actions workflow generated');
  console.log('\nRun tests with: npm run test');
}

// Execute if run directly
if (require.main === module) {
  main().catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
  });
}

module.exports = {
  setupCI
}; 