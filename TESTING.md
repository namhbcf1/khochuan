# KhoChuan POS Testing Framework

## Overview

This document provides comprehensive documentation for the KhoChuan POS system testing framework. The testing framework is built using Playwright for end-to-end testing and includes GPT-4 integration for intelligent test analysis and generation.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [GPT-4 Integration](#gpt-4-integration)
5. [Continuous Integration](#continuous-integration)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Access to a KhoChuan POS instance (local or staging)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd khochuan
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

4. Set up test fixtures:
   ```bash
   node tests/ci-setup.js
   ```

## Test Structure

The testing framework is organized as follows:

```
tests/
├── authentication.spec.js     # Authentication tests
├── dashboard.spec.js         # Admin dashboard tests
├── pos.spec.js               # POS terminal tests
├── inventory.spec.js         # Inventory management tests
├── customers.spec.js         # Customer management tests
├── gamification.spec.js      # Staff gamification tests
├── ci-setup.js               # CI environment setup
├── gpt-test-runner.js        # GPT-4 integration script
├── helpers/
│   ├── auth.js               # Authentication helpers
│   └── fixtures.js           # Test data generation
└── fixtures/                 # Test fixture files
    ├── inventory-update.csv  # Sample inventory file
    └── badge.png             # Sample image file
```

## Running Tests

### Basic Test Execution

Run all tests:

```bash
npm run test
```

Run specific test file:

```bash
npx playwright test tests/authentication.spec.js
```

Run tests in headed mode (with browser UI):

```bash
npx playwright test --headed
```

Run tests on a specific browser:

```bash
npx playwright test --project=chromium
```

### Test Filtering

Run tests with a specific tag:

```bash
npx playwright test --grep "@critical"
```

Skip certain tests:

```bash
npx playwright test --grep-invert "@slow"
```

### Test Report

Generate and open HTML report:

```bash
npx playwright show-report
```

## GPT-4 Integration

The KhoChuan testing framework includes GPT-4 integration for intelligent test analysis and generation.

### Features

1. **Test Result Analysis**: Automatically analyzes test results and identifies root causes of failures
2. **Test Generation**: Creates additional tests to improve coverage
3. **Regression Detection**: Identifies patterns in failures across test runs
4. **Detailed Reports**: Generates comprehensive reports with actionable insights

### Usage

Run tests with GPT-4 analysis:

```bash
node tests/gpt-test-runner.js
```

Generate additional tests based on current coverage:

```bash
node tests/gpt-test-runner.js --generate
```

Analyze existing test results without running tests:

```bash
node tests/gpt-test-runner.js --analyze-only
```

### Configuration

To use GPT-4 integration, you need an OpenAI API key:

1. Create a `.env` file in the project root
2. Add your API key: `OPENAI_API_KEY=your-api-key-here`

## Continuous Integration

The testing framework is set up for continuous integration with GitHub Actions.

### GitHub Actions Workflow

A GitHub Actions workflow is automatically created at `.github/workflows/playwright.yml` that:

1. Runs on push to main branch and pull requests
2. Installs Node.js and dependencies
3. Runs all tests
4. Uploads test report as artifact
5. Runs GPT-4 analysis on test results

### Additional CI Support

The framework can be easily adapted for other CI systems:

- **CircleCI**: Use the `ci-setup.js` script in your config.yml
- **Jenkins**: Add the test commands to your Jenkinsfile
- **GitLab CI**: Configure `.gitlab-ci.yml` with test commands

## Best Practices

### Writing Tests

1. **Isolation**: Each test should be independent and not rely on the state from previous tests
2. **Clear Assertions**: Use descriptive assertions that clearly indicate what is being tested
3. **Descriptive Names**: Use clear test and describe names that explain the functionality being tested
4. **Data Management**: Use test fixtures and helpers to manage test data
5. **Cleanup**: Clean up any data created during tests

### Selectors

Prefer the following selector strategies (in order):

1. Semantic selectors (role, label, text): `page.getByRole('button', { name: 'Submit' })`
2. Test ID selectors: `page.locator('[data-testid="submit-button"]')`
3. CSS selectors: `page.locator('button.submit-button')`

Avoid using selectors that depend on implementation details or are brittle to design changes.

## Troubleshooting

### Common Issues

#### Tests Fail in CI but Pass Locally

- **Timing Issues**: Use `await expect(...).toBeVisible()` instead of arbitrary timeouts
- **Browser Differences**: Run tests across all browser environments locally
- **Environmental Differences**: Ensure environment variables are set correctly

#### Slow Tests

- **Reduce Waits**: Replace `page.waitForTimeout()` with specific waiters like `waitForSelector()`
- **Parallelize Tests**: Use Playwright's parallel execution features
- **Optimize Actions**: Minimize unnecessary navigations and actions

#### Authentication Issues

- **State Persistence**: Use Playwright's storage state feature
- **Direct API Login**: Consider using API endpoints for login instead of UI for setup

### Getting Help

- File an issue in the project repository
- Check the Playwright documentation: https://playwright.dev/docs/intro
- Contact the development team on the project Slack channel

---

## Advanced Topics

### Visual Testing

The framework supports visual comparison testing:

```javascript
// Take a screenshot and compare with baseline
await expect(page).toHaveScreenshot('dashboard.png');
```

To update snapshots:

```bash
npx playwright test --update-snapshots
```

### API Testing

For testing backend APIs:

```javascript
// Example API test
test('API should return customer data', async ({ request }) => {
  const response = await request.get('/api/customers/123');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.name).toBe('Test Customer');
});
```

### Performance Testing

Basic performance metrics collection:

```javascript
// Measure page load performance
const startTime = Date.now();
await page.goto('/admin/dashboard');
const loadTime = Date.now() - startTime;
console.log(`Page loaded in ${loadTime}ms`);
``` 