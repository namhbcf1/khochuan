// @ts-check
const { test, expect } = require('@playwright/test');

// Helper function to login as admin before testing
async function login(page) {
  await page.goto('/login');
  
  // Fill in login credentials
  await page.locator('input[type="text"], input[placeholder*="Username"]').first().fill('admin');
  await page.locator('input[type="password"], input[placeholder*="Password"]').first().fill('admin123');
  
  // Click login button
  const loginButton = page.getByRole('button', { name: /login|đăng nhập/i }).first();
  await loginButton.click();
  
  // Wait for navigation to complete
  await page.waitForTimeout(2000);
}

test.describe('Main Pages Tests', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Analytics page should load properly', async ({ page }) => {
    await page.goto('/analytics');
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Verify at least one chart container is visible
    await expect(page.locator('.ant-card, .chart-container, .recharts-responsive-container').first()).toBeVisible({ timeout: 10000 });
    
    // Verify tabs exist
    await expect(page.locator('.ant-tabs, .ant-tabs-tab, button[role="tab"]').first()).toBeVisible({ timeout: 10000 });
    
    // Check if the page has at least some content
    await expect(page.locator('.ant-row, div > h1, div > h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Customers page should load properly', async ({ page }) => {
    await page.goto('/customers');
    
    // Wait for the page to load fully
    await page.waitForTimeout(5000);
    
    // Take screenshot for verification
    const screenshot = await page.screenshot();
    expect(screenshot).toBeTruthy();
    
    // Verify the page loaded something (not empty)
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(500); // Basic check that some HTML content loaded
    
    // Check URL to confirm navigation worked
    expect(page.url()).toContain('/customers');
  });

  test('Orders page should load properly', async ({ page }) => {
    await page.goto('/orders');
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Check if at least one card is visible
    await expect(page.locator('.ant-card').first()).toBeVisible({ timeout: 10000 });
    
    // Verify order table exists
    await expect(page.locator('table, .ant-table').first()).toBeVisible({ timeout: 10000 });
  });

  test('Settings page should load properly', async ({ page }) => {
    await page.goto('/settings');
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Verify settings tabs exist
    await expect(page.locator('.ant-tabs').first()).toBeVisible({ timeout: 10000 });
    
    // Verify form fields exist (check just the first one)
    await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 });
    
    // Verify save button exists
    await expect(page.getByRole('button', { name: /Save|Lưu/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Staff page should load properly', async ({ page }) => {
    await page.goto('/staff');
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Check if the page has some content (headings or tables)
    await expect(page.locator('div > h1, div > h2, .ant-table-wrapper').first()).toBeVisible({ timeout: 10000 });
    
    // Check if any metric cards are visible
    await expect(page.locator('.ant-card, .stat-card, .ant-statistic').first()).toBeVisible({ timeout: 10000 });
    
    // Verify staff table exists
    await expect(page.locator('.ant-table, .ant-table-row, .staff-table').first()).toBeVisible({ timeout: 10000 });
  });
}); 