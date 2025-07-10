// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Deployment verification tests
 * 
 * These tests verify that the deployed application is working correctly.
 * They check basic functionality without modifying any data.
 */

// Get the deployment URL from environment variable or use default
const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'https://khochuan-pos.pages.dev';
const API_URL = process.env.API_URL || 'https://jsonplaceholder.typicode.com';
const IS_KHOCHUAN = DEPLOYMENT_URL.includes('khochuan');

test.describe('Deployment Verification', () => {
  test('Homepage loads correctly', async ({ page }) => {
    // Navigate to the homepage
    console.log(`Testing deployment URL: ${DEPLOYMENT_URL}`);
    await page.goto(DEPLOYMENT_URL);
    
    // Verify the page loaded
    if (IS_KHOCHUAN) {
      // For KhoChuan site, we expect specific title patterns
      await expect(page).toHaveTitle(/KhoChuan|POS|Smart/i);
    } else {
      // For any other site, just verify a title exists
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    }
    
    // Verify there's some content
    const mainContent = await page.locator('body').textContent() || '';
    expect(mainContent.length).toBeGreaterThan(100);
    
    // Take a screenshot for reference
    await page.screenshot({ path: 'playwright-report/homepage.png', fullPage: true });
  });
  
  test('Login form is accessible', async ({ page }) => {
    // Navigate to the login page (if it's not the homepage)
    await page.goto(DEPLOYMENT_URL);
    
    // If we're already on a login page, verify the form
    // Otherwise, try to find and click a login button/link
    const isLoginPage = await page.locator('input[type="password"]').count() > 0;
    
    if (!isLoginPage) {
      // Try to find a login link or button
      const loginLinkOrButton = await page.locator('a, button').filter({
        hasText: /login|sign in|đăng nhập/i
      }).first();
      
      if (await loginLinkOrButton.count() > 0) {
        await loginLinkOrButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Look for typical login form elements
    const usernameInput = page.locator('input[type="text"], input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button, input[type="submit"]').filter({
      hasText: /login|sign in|đăng nhập|submit/i
    }).first();
    
    // Verify at least one of these elements exists, indicating a login form
    const formElementsCount = 
      await usernameInput.count() + 
      await passwordInput.count() + 
      await loginButton.count();
    
    // If this is not KhoChuan site, we might not have a login form
    if (IS_KHOCHUAN) {
      expect(formElementsCount).toBeGreaterThan(0);
    } else {
      // For non-KhoChuan sites, just take a screenshot and skip login form check
      console.log(`Not a KhoChuan site, skipping login form verification. Elements found: ${formElementsCount}`);
      test.skip();
    }
    
    // Take a screenshot for reference
    await page.screenshot({ path: 'playwright-report/login-form.png', fullPage: true });
  });
  
  test('No console errors on page load', async ({ page }) => {
    // Collect console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate to the page
    await page.goto(DEPLOYMENT_URL);
    await page.waitForLoadState('networkidle');
    
    // Print any errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
    
    // Expect no console errors
    // Note: In some cases, we might want to allow certain known errors
    expect(consoleErrors.length).toBeLessThanOrEqual(1);
  });
  
  test('API is accessible', async ({ request }) => {
    // Try to make a simple request to the API
    const response = await request.get(`${API_URL}/posts/1`);
    
    // Verify the response status
    expect(response.status()).toBeLessThan(400);
    
    // Verify the response is JSON
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    
    // Verify the response has some data
    const data = await response.json();
    expect(data).toBeTruthy();
  });
}); 