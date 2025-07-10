// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAs } = require('./helpers/auth');

// Helper function for visual comparisons
async function takeScreenshotAndCompare(page, name) {
  // Take screenshot and compare with baseline
  await expect(page).toHaveScreenshot(`${name}-${test.info().project.name}.png`, {
    threshold: 0.2, // 20% threshold for pixel differences
    maxDiffPixelRatio: 0.1, // Allow up to 10% pixels to be different
  });
}

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('Dashboard visual regression test', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // Wait for charts to load
    await page.waitForTimeout(2000);
    await takeScreenshotAndCompare(page, 'admin-dashboard');
  });

  test('Customers page visual regression test', async ({ page }) => {
    await page.goto('/customers');
    // Wait for charts and tables to load
    await page.waitForTimeout(2000);
    await takeScreenshotAndCompare(page, 'customers-page');
    
    // Also test customer segmentation view
    await page.locator('button:has-text("Segmentation")').click();
    await page.waitForTimeout(1000);
    await takeScreenshotAndCompare(page, 'customer-segmentation');
  });

  test('Orders page visual regression test', async ({ page }) => {
    await page.goto('/orders');
    // Wait for charts and tables to load
    await page.waitForTimeout(2000);
    await takeScreenshotAndCompare(page, 'orders-page');
    
    // Test different order tabs
    await page.getByRole('tab', { name: /Completed/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshotAndCompare(page, 'completed-orders');
    
    await page.getByRole('tab', { name: /Processing/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshotAndCompare(page, 'processing-orders');
  });

  test('POS Terminal visual regression test', async ({ page }) => {
    await page.goto('/cashier/pos/pos-terminal');
    // Wait for products to load
    await page.waitForTimeout(2000);
    await takeScreenshotAndCompare(page, 'pos-terminal');
  });

  test('Settings page visual regression test', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForTimeout(1000);
    await takeScreenshotAndCompare(page, 'settings-page');
    
    // Test different settings tabs
    await page.getByRole('tab', { name: /Company Profile/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshotAndCompare(page, 'company-profile-settings');
    
    await page.getByRole('tab', { name: /Security/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshotAndCompare(page, 'security-settings');
  });

  test('Staff page visual regression test', async ({ page }) => {
    await page.goto('/staff');
    // Wait for charts and tables to load
    await page.waitForTimeout(2000);
    await takeScreenshotAndCompare(page, 'staff-page');
    
    // Test different staff tabs
    await page.getByRole('tab', { name: /Top Performers/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshotAndCompare(page, 'top-performers-staff');
    
    // Test gamification modal
    await page.locator('button:has-text("Gamification")').click();
    await page.waitForTimeout(1000);
    await takeScreenshotAndCompare(page, 'gamification-modal');
  });

  test('Analytics page visual regression test', async ({ page }) => {
    await page.goto('/analytics');
    // Wait for charts to load
    await page.waitForTimeout(2000);
    await takeScreenshotAndCompare(page, 'analytics-page');
    
    // Test different analytics tabs
    await page.getByRole('tab', { name: /Customers/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshotAndCompare(page, 'customer-analytics');
    
    await page.getByRole('tab', { name: /Products/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshotAndCompare(page, 'product-analytics');
  });
  
  // Test mobile responsiveness - this will be run with mobile viewports automatically
  // due to the project configuration in playwright.config.js
  test('Mobile dashboard responsiveness test', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/admin/dashboard');
      await page.waitForTimeout(2000);
      await takeScreenshotAndCompare(page, 'dashboard-mobile');
    }
  });
}); 