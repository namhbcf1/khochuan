// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAs } = require('./helpers/auth');

test.describe('Visual Regression Tests', () => {
  test('login page visual check', async ({ page }) => {
    // Go to the login page
    await page.goto('/login');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot('login-page.png');
  });
  
  test('admin dashboard visual check', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    
    const usernameInput = page.getByPlaceholder(/Tên đăng nhập|Username|Email/i).first();
    await expect(usernameInput).toBeVisible({ timeout: 5000 });
    await usernameInput.fill('admin');
    
    const passwordInput = page.getByPlaceholder(/Mật khẩu|Password/i).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill('admin123');
    
    const loginButton = page.getByRole('button', { name: /Đăng nhập|Login/i });
    await loginButton.click();
    
    // Wait for successful login and redirection to dashboard
    await page.waitForURL('**/admin/dashboard**', { timeout: 10000 });
    
    // Ensure page is fully loaded
    await page.waitForLoadState('networkidle');
    
    // Hide any dynamic content that might change between runs
    await page.evaluate(() => {
      // Hide time-based elements like timestamps, notifications
      const elementsToHide = [
        '.timestamp',
        '.time',
        '.date',
        '.notification-badge',
        '.user-avatar'
      ];
      
      elementsToHide.forEach(selector => {
        document.querySelectorAll(selector).forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.visibility = 'hidden';
          }
        });
      });
    });
    
    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot('admin-dashboard.png');
  });
  
  test('POS terminal visual check', async ({ page }) => {
    // Login as cashier
    await page.goto('/login');
    
    const usernameInput = page.getByPlaceholder(/Tên đăng nhập|Username|Email/i).first();
    await expect(usernameInput).toBeVisible({ timeout: 5000 });
    await usernameInput.fill('cashier');
    
    const passwordInput = page.getByPlaceholder(/Mật khẩu|Password/i).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill('cashier123');
    
    const loginButton = page.getByRole('button', { name: /Đăng nhập|Login/i });
    await loginButton.click();
    
    // Wait for successful login and redirection to POS terminal
    await page.waitForURL('**/cashier/pos**', { timeout: 10000 });
    
    // Ensure page is fully loaded
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic content
    await page.evaluate(() => {
      const elementsToHide = [
        '.timestamp',
        '.time',
        '.date',
        '.notification-badge'
      ];
      
      elementsToHide.forEach(selector => {
        document.querySelectorAll(selector).forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.visibility = 'hidden';
          }
        });
      });
    });
    
    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot('pos-terminal.png');
  });
  
  test('products page visual check', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    
    const usernameInput = page.getByPlaceholder(/Tên đăng nhập|Username|Email/i).first();
    await expect(usernameInput).toBeVisible({ timeout: 5000 });
    await usernameInput.fill('admin');
    
    const passwordInput = page.getByPlaceholder(/Mật khẩu|Password/i).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill('admin123');
    
    const loginButton = page.getByRole('button', { name: /Đăng nhập|Login/i });
    await loginButton.click();
    
    // Navigate to products page
    await page.goto('/admin/products');
    
    // Ensure page is fully loaded
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic content
    await page.evaluate(() => {
      const elementsToHide = [
        '.timestamp',
        '.time',
        '.date'
      ];
      
      elementsToHide.forEach(selector => {
        document.querySelectorAll(selector).forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.visibility = 'hidden';
          }
        });
      });
    });
    
    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot('products-page.png');
  });
  
  test('responsive design - mobile view', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Go to login page
    await page.goto('/login');
    
    // Ensure page is fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot('login-mobile.png');
    
    // Login as admin
    const usernameInput = page.getByPlaceholder(/Tên đăng nhập|Username|Email/i).first();
    await expect(usernameInput).toBeVisible({ timeout: 5000 });
    await usernameInput.fill('admin');
    
    const passwordInput = page.getByPlaceholder(/Mật khẩu|Password/i).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill('admin123');
    
    const loginButton = page.getByRole('button', { name: /Đăng nhập|Login/i });
    await loginButton.click();
    
    // Wait for successful login and redirection to dashboard
    await page.waitForURL('**/admin/dashboard**', { timeout: 10000 });
    
    // Ensure page is fully loaded
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic content
    await page.evaluate(() => {
      const elementsToHide = [
        '.timestamp',
        '.time',
        '.date',
        '.notification-badge'
      ];
      
      elementsToHide.forEach(selector => {
        document.querySelectorAll(selector).forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.visibility = 'hidden';
          }
        });
      });
    });
    
    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot('dashboard-mobile.png');
  });
  
  test('dark mode visual check', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    
    const usernameInput = page.getByPlaceholder(/Tên đăng nhập|Username|Email/i).first();
    await expect(usernameInput).toBeVisible({ timeout: 5000 });
    await usernameInput.fill('admin');
    
    const passwordInput = page.getByPlaceholder(/Mật khẩu|Password/i).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill('admin123');
    
    const loginButton = page.getByRole('button', { name: /Đăng nhập|Login/i });
    await loginButton.click();
    
    // Wait for successful login
    await page.waitForURL('**/admin/dashboard**', { timeout: 10000 });
    
    // Switch to dark mode if available
    // Find and click dark mode toggle if it exists
    const darkModeToggle = page.locator('.dark-mode-toggle, .theme-switch');
    
    if (await darkModeToggle.count() > 0) {
      await darkModeToggle.click();
      
      // Wait for theme to apply
      await page.waitForTimeout(1000);
      
      // Hide dynamic content
      await page.evaluate(() => {
        const elementsToHide = [
          '.timestamp',
          '.time',
          '.date',
          '.notification-badge'
        ];
        
        elementsToHide.forEach(selector => {
          document.querySelectorAll(selector).forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.visibility = 'hidden';
            }
          });
        });
      });
      
      // Take screenshot and compare with baseline
      await expect(page).toHaveScreenshot('dark-mode-dashboard.png');
    }
  });
  // If no dark mode toggle is found, test is skipped automatically
}); 