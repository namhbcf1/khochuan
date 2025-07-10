#!/usr/bin/env node

/**
 * KhoChuan POS Testing Framework Setup Script
 * 
 * This script initializes the testing environment for KhoChuan POS system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const { setupCI } = require('./tests/ci-setup');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Print a colorful message to console
 * @param {string} message - Message to print
 * @param {string} type - Message type (info, success, warning, error)
 */
function printMessage(message, type = 'info') {
  const colors = {
    info: '\x1b[36m%s\x1b[0m',    // Cyan
    success: '\x1b[32m%s\x1b[0m', // Green
    warning: '\x1b[33m%s\x1b[0m', // Yellow
    error: '\x1b[31m%s\x1b[0m'    // Red
  };
  
  console.log(colors[type], message);
}

/**
 * Create the test directories structure
 */
async function createTestDirectories() {
  printMessage('Creating test directories...', 'info');
  
  const directories = [
    'tests',
    'tests/helpers',
    'tests/fixtures',
    'playwright-report',
    'test-results'
  ];
  
  directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      printMessage(`Created directory: ${dir}`, 'success');
    } else {
      printMessage(`Directory exists: ${dir}`, 'info');
    }
  });
}

/**
 * Install dependencies for testing framework
 */
async function installDependencies() {
  printMessage('Installing Playwright and dependencies...', 'info');
  
  try {
    // Add Playwright dependencies to package.json if not already present
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = require(packageJsonPath);
    
    let modified = false;
    
    // Add dev dependencies if not present
    const devDependencies = {
      '@playwright/test': '^1.39.0',
      'dotenv': '^16.3.1',
      'openai': '^4.0.0',
      'chalk': '^5.3.0'
    };
    
    packageJson.devDependencies = packageJson.devDependencies || {};
    
    Object.entries(devDependencies).forEach(([name, version]) => {
      if (!packageJson.devDependencies[name]) {
        packageJson.devDependencies[name] = version;
        modified = true;
      }
    });
    
    // Add test script if not present
    packageJson.scripts = packageJson.scripts || {};
    if (!packageJson.scripts.test) {
      packageJson.scripts.test = 'playwright test';
      modified = true;
    }
    
    if (!packageJson.scripts['test:ui']) {
      packageJson.scripts['test:ui'] = 'playwright test --ui';
      modified = true;
    }
    
    if (!packageJson.scripts['test:report']) {
      packageJson.scripts['test:report'] = 'playwright show-report';
      modified = true;
    }
    
    if (!packageJson.scripts['test:analyze']) {
      packageJson.scripts['test:analyze'] = 'node tests/gpt-test-runner.js';
      modified = true;
    }
    
    // Save changes if any were made
    if (modified) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      printMessage('Updated package.json with test dependencies', 'success');
      
      // Install dependencies
      printMessage('Installing npm dependencies...', 'info');
      execSync('npm install', { stdio: 'inherit' });
    } else {
      printMessage('Dependencies already installed in package.json', 'info');
    }
    
    // Install Playwright browsers
    printMessage('Installing Playwright browsers...', 'info');
    execSync('npx playwright install', { stdio: 'inherit' });
    
  } catch (error) {
    printMessage(`Error installing dependencies: ${error.message}`, 'error');
    process.exit(1);
  }
}

/**
 * Configure environment for tests
 */
async function configureEnvironment() {
  printMessage('Configuring test environment...', 'info');
  
  // Create .env file if it doesn't exist
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    printMessage('Creating .env file for test configuration', 'info');
    
    // Prompt for OpenAI API key
    const promptApiKey = () => {
      return new Promise((resolve) => {
        rl.question('Enter your OpenAI API key for GPT-4 integration (press Enter to skip): ', (answer) => {
          resolve(answer.trim());
        });
      });
    };
    
    const apiKey = await promptApiKey();
    
    // Create basic .env file
    let envContent = `# KhoChuan POS Testing Environment Configuration\n\n`;
    
    // Add API key if provided
    if (apiKey) {
      envContent += `# OpenAI API key for GPT-4 integration\nOPENAI_API_KEY=${apiKey}\n\n`;
    } else {
      envContent += `# OpenAI API key for GPT-4 integration (uncomment and add your key)\n# OPENAI_API_KEY=your-api-key-here\n\n`;
    }
    
    // Add test environment variables
    envContent += `# Test Environment Configuration\n`;
    envContent += `TEST_ENV=development\n`;
    envContent += `BASE_URL=http://localhost:3000\n`;
    envContent += `ADMIN_EMAIL=admin@khochuan.com\n`;
    envContent += `ADMIN_PASSWORD=admin123\n`;
    
    fs.writeFileSync(envPath, envContent);
    printMessage('.env file created successfully', 'success');
  } else {
    printMessage('.env file already exists', 'info');
  }
}

/**
 * Main setup function
 */
async function setup() {
  printMessage('=== KhoChuan POS Testing Framework Setup ===\n', 'info');
  
  try {
    await createTestDirectories();
    await installDependencies();
    await configureEnvironment();
    await setupCI();
    
    printMessage('\n✅ Testing framework setup completed successfully!', 'success');
    printMessage('\nNext steps:', 'info');
    printMessage('1. Review the configuration in .env file', 'info');
    printMessage('2. Check the TESTING.md file for documentation', 'info');
    printMessage('3. Run tests with: npm run test', 'info');
    printMessage('4. Run test UI with: npm run test:ui', 'info');
    printMessage('5. View test report with: npm run test:report', 'info');
    printMessage('6. Analyze tests with GPT-4: npm run test:analyze\n', 'info');
    
  } catch (error) {
    printMessage(`\n❌ Setup failed: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setup();
}

module.exports = { setup }; 