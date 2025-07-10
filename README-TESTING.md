# KhoChuan POS Testing Framework - Quick Start Guide

## Introduction

This testing framework provides comprehensive end-to-end testing for the KhoChuan POS system using Playwright and GPT-4 integration. The framework allows for robust automated testing of all critical features including authentication, dashboard operations, POS terminal functionality, inventory management, customer management, and staff gamification.

## Quick Start

### 1. Setup Testing Environment

Run the setup script to initialize the testing environment:

```bash
# On Windows
node setup-testing.js

# On Unix/Linux/macOS
chmod +x setup-testing.js
./setup-testing.js
```

This will:
- Create necessary directories
- Install dependencies
- Configure environment variables
- Set up CI integration

### 2. Run Tests

Run the entire test suite:

```bash
npm run test
```

Run specific test files:

```bash
npx playwright test tests/authentication.spec.js
```

Run tests with UI mode (for debugging):

```bash
npm run test:ui
```

### 3. View Test Reports

After tests run, view the HTML report:

```bash
npm run test:report
```

### 4. Use GPT-4 Integration

Analyze test results with GPT-4:

```bash
npm run test:analyze
```

Generate additional tests:

```bash
node tests/gpt-test-runner.js --generate
```

## Key Features

- **Multi-browser Testing:** Run tests on Chromium, Firefox, and WebKit
- **Mobile Device Testing:** Test responsive design on mobile viewports
- **Visual Testing:** Compare UI with baseline screenshots
- **AI Integration:** GPT-4 analysis of test results and automatic test generation
- **CI/CD Ready:** GitHub Actions integration with test reporting
- **Comprehensive Coverage:** Tests all critical application features

## Test Files Overview

| Test File | Description |
|-----------|-------------|
| `authentication.spec.js` | Tests login/logout for all user roles |
| `dashboard.spec.js` | Tests admin dashboard functionality |
| `pos.spec.js` | Tests POS terminal and checkout process |
| `inventory.spec.js` | Tests inventory management features |
| `customers.spec.js` | Tests customer management features |
| `gamification.spec.js` | Tests staff gamification features |

## Detailed Documentation

For more detailed documentation, refer to the [TESTING.md](./TESTING.md) file. 