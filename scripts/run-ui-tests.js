const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  testTimeout: 300000, // 5 minutes
  reportDir: path.join(__dirname, '../playwright-report'),
  testResultsDir: path.join(__dirname, '../test-results'),
  summaryFile: path.join(__dirname, '../UI-TEST-SUMMARY.md')
};

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Helper function to create directories if they don't exist
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper function to run a command and return its output
function runCommand(command) {
  try {
    return execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: config.testTimeout
    });
  } catch (error) {
    console.error(`${colors.red}Error running command: ${command}${colors.reset}`);
    console.error(error.stdout?.toString() || error.message);
    return error.stdout?.toString() || '';
  }
}

// Main function
async function main() {
  console.log(`${colors.bright}${colors.bgBlue}🧪 Starting KhoChuan UI Tests 🧪${colors.reset}`);
  
  // Ensure directories exist
  ensureDirExists(config.reportDir);
  ensureDirExists(config.testResultsDir);
  
  // Array to hold all test results
  const testResults = [];
  
  // Run different test suites
  
  console.log(`${colors.cyan}Running authentication tests...${colors.reset}`);
  testResults.push({
    name: 'Authentication',
    output: runCommand('npx playwright test tests/authentication.spec.js --project=chromium')
  });
  
  console.log(`${colors.cyan}Running dashboard tests...${colors.reset}`);
  testResults.push({
    name: 'Dashboard',
    output: runCommand('npx playwright test tests/dashboard.spec.js --project=chromium')
  });
  
  console.log(`${colors.cyan}Running main pages tests...${colors.reset}`);
  testResults.push({
    name: 'Main Pages',
    output: runCommand('npx playwright test tests/pages.spec.js --project=chromium')
  });
  
  console.log(`${colors.cyan}Running customer tests...${colors.reset}`);
  testResults.push({
    name: 'Customers',
    output: runCommand('npx playwright test tests/customers.spec.js --project=chromium')
  });
  
  console.log(`${colors.cyan}Running visual regression tests...${colors.reset}`);
  testResults.push({
    name: 'Visual Regression',
    output: runCommand('npx playwright test tests/visual-regression.spec.js --project=chromium')
  });

  // Parse test results
  const parsedResults = parseTestResults(testResults);
  
  // Generate summary report
  generateReport(parsedResults);
  
  console.log(`${colors.green}${colors.bright}Tests completed! Report generated at: ${config.summaryFile}${colors.reset}`);
  console.log(`${colors.yellow}Run 'npx playwright show-report' to view detailed HTML report${colors.reset}`);
}

// Parse test results to extract failures and successes
function parseTestResults(testResults) {
  const parsed = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    details: []
  };
  
  testResults.forEach(result => {
    const output = result.output;
    const testSuiteDetails = {
      name: result.name,
      errors: [],
      successes: []
    };
    
    // Extract test counts using regex
    const countMatch = output.match(/(\d+) passed \/ (\d+) failed \/ (\d+) total/);
    if (countMatch) {
      const passed = parseInt(countMatch[1], 10);
      const failed = parseInt(countMatch[2], 10);
      const total = parseInt(countMatch[3], 10);
      
      parsed.totalTests += total;
      parsed.passed += passed;
      parsed.failed += failed;
    }
    
    // Extract error information
    const errorMatches = output.match(/Error:.*?(?=\n\n|\n$)/gs);
    if (errorMatches) {
      errorMatches.forEach(error => {
        // Extract the test name from the error message
        const testNameMatch = error.match(/- (.+?)\s+›/);
        const testName = testNameMatch ? testNameMatch[1] : 'Unknown test';
        
        // Extract the failure reason
        const reasonMatch = error.match(/Error: (.+?)(?=\n|$)/);
        const reason = reasonMatch ? reasonMatch[1] : 'Unknown error';
        
        testSuiteDetails.errors.push({
          test: testName,
          reason: reason
        });
      });
    }
    
    // Extract successful tests
    const successMatches = output.match(/ok\s+\d+\s+-\s+(.+?)(?=\n|$)/g);
    if (successMatches) {
      successMatches.forEach(success => {
        const testNameMatch = success.match(/ok\s+\d+\s+-\s+(.+?)(?=\n|$)/);
        if (testNameMatch) {
          testSuiteDetails.successes.push(testNameMatch[1]);
        }
      });
    }
    
    parsed.details.push(testSuiteDetails);
  });
  
  return parsed;
}

// Generate a summary report
function generateReport(parsedResults) {
  let report = `# KhoChuan UI Test Summary\n\n`;
  
  report += `## Overview\n\n`;
  report += `- **Total Tests:** ${parsedResults.totalTests}\n`;
  report += `- **Passed:** ${parsedResults.passed}\n`;
  report += `- **Failed:** ${parsedResults.failed}\n`;
  report += `- **Pass Rate:** ${Math.round((parsedResults.passed / parsedResults.totalTests) * 100)}%\n\n`;
  
  report += `## Test Suite Details\n\n`;
  
  parsedResults.details.forEach(suite => {
    report += `### ${suite.name}\n\n`;
    
    if (suite.errors.length > 0) {
      report += `#### Failed Tests (${suite.errors.length})\n\n`;
      report += `| Test | Reason |\n`;
      report += `|------|--------|\n`;
      
      suite.errors.forEach(error => {
        report += `| ${error.test} | ${error.reason} |\n`;
      });
      
      report += `\n`;
    }
    
    if (suite.successes.length > 0) {
      report += `#### Passed Tests (${suite.successes.length})\n\n`;
      report += `- ${suite.successes.join('\n- ')}\n\n`;
    }
  });
  
  report += `## UI Elements Needing Attention\n\n`;
  
  // Analyze errors to identify missing UI elements
  const missingUIElements = [];
  parsedResults.details.forEach(suite => {
    suite.errors.forEach(error => {
      if (error.reason.includes('Locator') && 
          (error.reason.includes('not found') || error.reason.includes('not visible'))) {
        // Extract the element selector
        const selectorMatch = error.reason.match(/('.*?'|".*?")/);
        if (selectorMatch) {
          missingUIElements.push({
            suite: suite.name,
            test: error.test,
            element: selectorMatch[0].replace(/['"]/g, ''),
            message: error.reason
          });
        }
      }
    });
  });
  
  if (missingUIElements.length > 0) {
    report += `| Suite | Test | Missing Element | Description |\n`;
    report += `|-------|------|----------------|-------------|\n`;
    
    missingUIElements.forEach(element => {
      report += `| ${element.suite} | ${element.test} | \`${element.element}\` | ${element.message.replace(/\n/g, ' ')} |\n`;
    });
  } else {
    report += `No missing UI elements detected! 🎉\n\n`;
  }
  
  report += `\n## Next Steps\n\n`;
  report += `1. Fix any missing UI elements identified above\n`;
  report += `2. Review visual regression test failures (if any)\n`;
  report += `3. Update component designs for consistency\n`;
  
  // Write the report to a file
  fs.writeFileSync(config.summaryFile, report);
  
  // Display a summary in the console
  console.log(`\n${colors.bgCyan}${colors.black}${colors.bright} Test Summary ${colors.reset}`);
  console.log(`${colors.bright}Total Tests:${colors.reset} ${parsedResults.totalTests}`);
  console.log(`${colors.green}Passed:${colors.reset} ${parsedResults.passed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${parsedResults.failed}`);
  console.log(`${colors.blue}Pass Rate:${colors.reset} ${Math.round((parsedResults.passed / parsedResults.totalTests) * 100)}%`);
  
  if (missingUIElements.length > 0) {
    console.log(`\n${colors.yellow}${colors.bright}⚠️ Missing UI Elements: ${missingUIElements.length}${colors.reset}`);
    missingUIElements.forEach(element => {
      console.log(`${colors.yellow}- ${element.test}: ${element.element}${colors.reset}`);
    });
  } else {
    console.log(`\n${colors.green}${colors.bright}✅ No missing UI elements detected!${colors.reset}`);
  }
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}${colors.bright}Error running tests:${colors.reset}`, error);
  process.exit(1);
}); 