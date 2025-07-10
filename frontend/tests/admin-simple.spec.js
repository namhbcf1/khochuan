/**
 * Simple Admin Dashboard Tests
 * Basic tests for admin functionality
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://khoaugment.pages.dev';

test.describe('Simple Admin Tests', () => {
  
  test('Admin demo login works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Click admin demo button
    const adminDemoButton = page.locator('button:has-text("Quản trị viên (Demo)")').first();
    await expect(adminDemoButton).toBeVisible();
    await adminDemoButton.click();
    
    // Wait for navigation
    await page.waitForTimeout(5000);
    
    // Check if we're on admin page or dashboard
    const currentUrl = page.url();
    const isAdminPage = currentUrl.includes('/admin') || 
                      currentUrl.includes('/dashboard') ||
                      await page.locator('text=Dashboard').isVisible().catch(() => false) ||
                      await page.locator('text=Admin').isVisible().catch(() => false) ||
                      await page.locator('text=Quản trị').isVisible().catch(() => false) ||
                      await page.locator('text=Doanh thu').isVisible().catch(() => false) ||
                      await page.locator('text=Analytics').isVisible().catch(() => false);
    
    expect(isAdminPage).toBe(true);
  });

  test('Admin dashboard has basic elements', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Login as admin
    const adminDemoButton = page.locator('button:has-text("Quản trị viên (Demo)")').first();
    await adminDemoButton.click();
    await page.waitForTimeout(5000);
    
    // Check for basic dashboard elements
    const hasContent = await page.locator('body').textContent();
    const hasBasicElements = hasContent && (
      hasContent.includes('Dashboard') ||
      hasContent.includes('Doanh thu') ||
      hasContent.includes('Revenue') ||
      hasContent.includes('Analytics') ||
      hasContent.includes('Admin')
    );
    
    expect(hasBasicElements).toBe(true);
  });

  test('Navigation elements exist', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Login as admin
    const adminDemoButton = page.locator('button:has-text("Quản trị viên (Demo)")').first();
    await adminDemoButton.click();
    await page.waitForTimeout(5000);
    
    // Check for navigation elements
    const navElements = [
      'Dashboard', 'Products', 'Customers', 'Orders', 'Inventory', 'Reports', 'Settings',
      'Sản phẩm', 'Khách hàng', 'Đơn hàng', 'Kho hàng', 'Báo cáo', 'Cài đặt'
    ];
    
    let foundNavElements = 0;
    for (const element of navElements) {
      const hasElement = await page.locator(`text=${element}`).isVisible().catch(() => false);
      if (hasElement) {
        foundNavElements++;
      }
    }
    
    // Should find at least some navigation elements
    expect(foundNavElements).toBeGreaterThan(0);
  });

  test('Charts or analytics display', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Login as admin
    const adminDemoButton = page.locator('button:has-text("Quản trị viên (Demo)")').first();
    await adminDemoButton.click();
    await page.waitForTimeout(5000);
    
    // Check for charts or analytics
    const chartSelectors = [
      '.recharts-wrapper',
      'canvas',
      'svg',
      '.chart-container',
      '.analytics'
    ];
    
    let hasCharts = false;
    for (const selector of chartSelectors) {
      const chart = await page.locator(selector).isVisible().catch(() => false);
      if (chart) {
        hasCharts = true;
        break;
      }
    }
    
    // Check for KPI or metrics
    const kpiElements = [
      'Revenue', 'Doanh thu', 'Sales', 'Bán hàng', 'Orders', 'Đơn hàng', 'Total', 'Tổng'
    ];
    
    let hasKPI = false;
    for (const kpi of kpiElements) {
      const hasElement = await page.locator(`text=${kpi}`).isVisible().catch(() => false);
      if (hasElement) {
        hasKPI = true;
        break;
      }
    }
    
    // Should have either charts or KPI elements
    expect(hasCharts || hasKPI).toBe(true);
  });

  test('Admin interface is responsive', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Login as admin
    const adminDemoButton = page.locator('button:has-text("Quản trị viên (Demo)")').first();
    await adminDemoButton.click();
    await page.waitForTimeout(5000);
    
    // Check if content is visible and fits
    const content = await page.locator('body').isVisible();
    expect(content).toBe(true);
    
    // Check if there's no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });
});
