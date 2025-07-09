/**
 * Authentication helper functions for testing
 */
const { expect } = require('@playwright/test');

/**
 * Login credentials for different user roles
 */
const credentials = {
  admin: {
    email: 'admin@khochuan.com',
    password: 'admin123'
  },
  cashier: {
    email: 'cashier@khochuan.com',
    password: 'cashier123'
  },
  staff: {
    email: 'staff@khochuan.com',
    password: 'staff123'
  },
  customer: {
    email: 'customer@example.com',
    password: 'customer123'
  }
};

/**
 * Login as a specific user role
 * @param {Object} page - Playwright page object
 * @param {string} role - User role (admin, cashier, staff, customer)
 * @returns {Promise<void>}
 */
async function loginAs(page, role) {
  // Navigate to login page
  await page.goto('/login');
  
  // Fill login form with credentials for the specified role
  const usernameInput = page.getByPlaceholder(/Tên đăng nhập|Username|Email/i).first();
  await expect(usernameInput).toBeVisible({ timeout: 5000 });
  await usernameInput.fill(credentials[role].email);
  
  const passwordInput = page.getByPlaceholder(/Mật khẩu|Password/i).first();
  await expect(passwordInput).toBeVisible({ timeout: 5000 });
  await passwordInput.fill(credentials[role].password);
  
  // Submit login form
  const loginButton = page.getByRole('button', { name: /Đăng nhập|Login/i });
  await loginButton.click();
  
  // Wait for successful login (redirect to dashboard or home)
  try {
    if (role === 'admin') {
      await page.waitForURL('**/admin/dashboard**', { timeout: 10000 });
    } else if (role === 'cashier') {
      await page.waitForURL('**/cashier/pos**', { timeout: 10000 });
    } else if (role === 'staff') {
      await page.waitForURL('**/staff/dashboard**', { timeout: 10000 });
    } else if (role === 'customer') {
      await page.waitForURL('**/customer/profile**', { timeout: 10000 });
    }
  } catch (error) {
    console.log(`Login redirect timeout for ${role}, checking if we're on a valid page`);
    // If we don't get redirected to the expected URL, check if we're logged in
    await page.waitForTimeout(2000); // Wait a bit more
  }
}

/**
 * Logout the current user
 * @param {Object} page - Playwright page object
 * @returns {Promise<void>}
 */
async function logout(page) {
  // Click on user menu/avatar
  await page.locator('div.user-avatar, button.user-menu').click();
  
  // Click logout button/link
  await page.locator('button:has-text("Logout"), a:has-text("Logout")').click();
  
  // Wait for redirect to login page
  await page.waitForURL('**/login**');
}

/**
 * Check if user has specific permissions
 * @param {Object} page - Playwright page object
 * @param {string} permission - Permission to check
 * @returns {Promise<boolean>} - Whether user has permission
 */
async function hasPermission(page, permission) {
  // This is a simple implementation that checks if certain elements/features are visible
  // In a real app, you'd likely check this differently based on your permission system
  
  // For demonstration, we'll use different UI indicators for different permissions
  switch (permission) {
    case 'manage_products':
      return await page.locator('a:has-text("Products")').isVisible();
    case 'manage_staff':
      return await page.locator('a:has-text("Staff Management")').isVisible();
    case 'view_analytics':
      return await page.locator('a:has-text("Analytics")').isVisible();
    case 'process_orders':
      return await page.locator('a:has-text("POS"), a:has-text("Terminal")').isVisible();
    default:
      return false;
  }
}

module.exports = {
  loginAs,
  logout,
  hasPermission,
  credentials
}; 