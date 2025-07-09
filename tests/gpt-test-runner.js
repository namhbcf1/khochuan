const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration
const config = {
  testDir: path.join(__dirname),
  resultsDir: path.join(__dirname, '../playwright-report'),
  screenshotsDir: path.join(__dirname, '../test-results'),
  maxRetries: 3,
  reportFile: path.join(__dirname, '../gpt-test-report.md'),
  testTimeout: 120000, // 2 minutes
};

// Main function
async function main() {
  try {
    console.log('🚀 Starting GPT-powered test runner');
    
    // Step 1: Run Playwright tests
    console.log('📋 Running Playwright tests...');
    await runPlaywrightTests();
    
    // Step 2: Collect test results
    console.log('📊 Collecting test results...');
    const testResults = await collectTestResults();
    
    // Step 3: Analyze results with GPT-4
    console.log('🧠 Analyzing test results with GPT-4...');
    const analysis = await analyzeWithGPT(testResults);
    
    // Step 4: Generate additional tests if needed
    console.log('✨ Generating additional tests...');
    await generateAdditionalTests(analysis);
    
    // Step 5: Create final report
    console.log('📝 Creating final report...');
    await createReport(testResults, analysis);
    
    console.log('✅ Test run completed successfully!');
    
  } catch (error) {
    console.error('❌ Error running tests:', error);
    process.exit(1);
  }
}

// Run Playwright tests
async function runPlaywrightTests() {
  return new Promise((resolve, reject) => {
    const command = 'npx playwright test';
    
    const child = exec(command, { timeout: config.testTimeout }, (error) => {
      if (error && error.code !== 1) {  // Playwright exits with code 1 when tests fail
        reject(error);
      } else {
        resolve();
      }
    });
    
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });
}

// Collect test results
async function collectTestResults() {
  try {
    // Read the Playwright test report JSON
    const reportPath = path.join(config.resultsDir, 'results.json');
    
    if (!fs.existsSync(reportPath)) {
      throw new Error('Test report not found. Make sure tests have been run.');
    }
    
    const reportJson = fs.readFileSync(reportPath, 'utf8');
    const report = JSON.parse(reportJson);
    
    // Collect screenshots for failed tests
    const screenshots = [];
    const testResultsDir = config.screenshotsDir;
    
    if (fs.existsSync(testResultsDir)) {
      const testDirs = fs.readdirSync(testResultsDir);
      
      for (const testDir of testDirs) {
        const testPath = path.join(testResultsDir, testDir);
        if (fs.statSync(testPath).isDirectory()) {
          const files = fs.readdirSync(testPath);
          const screenshotFiles = files.filter(file => file.endsWith('-failed.png'));
          
          for (const screenshot of screenshotFiles) {
            screenshots.push({
              test: testDir,
              path: path.join(testPath, screenshot),
              filename: screenshot,
            });
          }
        }
      }
    }
    
    return {
      report,
      screenshots,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error collecting test results:', error);
    throw error;
  }
}

// Analyze test results with GPT-4
async function analyzeWithGPT(testResults) {
  try {
    const { report } = testResults;
    
    // Count passed and failed tests
    const stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
    };
    
    const failedTests = [];
    
    // Process test results
    for (const suite of report.suites) {
      for (const spec of suite.specs) {
        stats.total++;
        
        if (spec.ok) {
          stats.passed++;
        } else {
          stats.failed++;
          failedTests.push({
            title: spec.title,
            file: spec.file,
            error: spec.tests[0]?.results[0]?.error?.message || 'Unknown error',
          });
        }
      }
    }
    
    // Create a prompt for GPT-4
    const prompt = `
You are an expert QA engineer analyzing test results for the KhoChuan POS system.

Test Summary:
- Total Tests: ${stats.total}
- Passed: ${stats.passed}
- Failed: ${stats.failed}
- Skipped: ${stats.skipped}

${failedTests.length > 0 ? `Failed Tests:
${failedTests.map(test => `- ${test.title} (${test.file})
  Error: ${test.error}`).join('\n')}` : 'All tests passed!'}

Based on these results:
1. Analyze the root causes of the failures
2. Suggest fixes for the failed tests
3. Identify potential areas for additional test coverage
4. Recommend improvements to the test suite
5. Suggest any UI/UX improvements for the KhoChuan POS system

Please provide your analysis in a structured format.
`;

    // Call GPT-4 API
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert QA engineer specializing in web application testing with Playwright. You analyze test results and provide actionable insights to improve both the tests and the application."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });
    
    return {
      stats,
      failedTests,
      gptAnalysis: response.choices[0].message.content,
    };
  } catch (error) {
    console.error('Error analyzing with GPT:', error);
    return {
      stats: { total: 0, passed: 0, failed: 0, skipped: 0 },
      failedTests: [],
      gptAnalysis: 'Error analyzing test results with GPT.',
    };
  }
}

// Generate additional tests based on GPT analysis
async function generateAdditionalTests(analysis) {
  try {
    // Only generate new tests if there were failures or if coverage is low
    if (analysis.stats.failed === 0 && analysis.stats.total >= 15) {
      console.log('No additional tests needed.');
      return;
    }
    
    console.log('Generating additional tests...');
    
    // Read existing test files to understand structure
    const testFiles = fs.readdirSync(config.testDir)
      .filter(file => file.endsWith('.spec.js'));
    
    let existingTestContent = '';
    if (testFiles.length > 0) {
      const sampleTestFile = fs.readFileSync(
        path.join(config.testDir, testFiles[0]),
        'utf8'
      );
      existingTestContent = sampleTestFile;
    }
    
    // Create a prompt for GPT-4
    const prompt = `
You are an expert QA engineer writing Playwright tests for the KhoChuan POS system.

Based on the analysis of existing tests and failures, please generate a new test file that covers additional scenarios.

Here's an example of the existing test structure:

\`\`\`javascript
${existingTestContent}
\`\`\`

Please generate a new test file that:
1. Focuses on edge cases and error handling
2. Tests responsive design on different screen sizes
3. Includes accessibility testing
4. Covers any missing functionality identified in the analysis

The test file should follow the same structure and best practices as the existing tests.
`;

    // Call GPT-4 API
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert QA engineer specializing in web application testing with Playwright. You write comprehensive, maintainable, and effective tests."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });
    
    // Save the generated test file
    const generatedTest = response.choices[0].message.content;
    const testContent = generatedTest.replace(/```javascript|```js|```|<[^>]+>/g, '').trim();
    
    const newTestFileName = `gpt-generated-${Date.now()}.spec.js`;
    fs.writeFileSync(path.join(config.testDir, newTestFileName), testContent);
    
    console.log(`Generated new test file: ${newTestFileName}`);
    
    return newTestFileName;
  } catch (error) {
    console.error('Error generating additional tests:', error);
  }
}

// Create final report
async function createReport(testResults, analysis) {
  try {
    const { stats, failedTests, gptAnalysis } = analysis;
    
    const report = `# KhoChuan POS Test Report

## Test Summary
- **Total Tests:** ${stats.total}
- **Passed:** ${stats.passed}
- **Failed:** ${stats.failed}
- **Skipped:** ${stats.skipped}
- **Test Run Date:** ${new Date(testResults.timestamp).toLocaleString()}

${failedTests.length > 0 ? `
## Failed Tests
${failedTests.map(test => `
### ${test.title}
- **File:** ${test.file}
- **Error:** ${test.error}
`).join('\n')}
` : '## All Tests Passed! ✅'}

## GPT Analysis
${gptAnalysis}

---
Report generated on ${new Date().toLocaleString()}
`;

    fs.writeFileSync(config.reportFile, report);
    console.log(`Report saved to ${config.reportFile}`);
    
  } catch (error) {
    console.error('Error creating report:', error);
  }
}

// Run the main function
main(); 