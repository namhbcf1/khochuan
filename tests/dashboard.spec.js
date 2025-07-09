// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Admin Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Đi đến trang đăng nhập
    await page.goto('/login');
    
    // Đợi trang tải xong
    await page.waitForLoadState('networkidle');
    
    // Tìm và điền vào trường tên đăng nhập
    const usernameInput = page.getByPlaceholder(/Tên đăng nhập|Username|Email/i).first();
    await expect(usernameInput).toBeVisible({ timeout: 5000 });
    await usernameInput.fill('admin');
    
    // Tìm và điền vào trường mật khẩu
    const passwordInput = page.getByPlaceholder(/Mật khẩu|Password/i).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill('admin123');
    
    // Nhấn nút đăng nhập
    const loginButton = page.getByRole('button', { name: /Đăng nhập|Login/i });
    await loginButton.click();
    
    // Đợi chuyển hướng đến trang dashboard
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('dashboard page loads with main components', async ({ page }) => {
    // Kiểm tra tiêu đề dashboard
    await expect(page.locator('h1, h2, .page-title').filter({ hasText: /Dashboard|Tổng quan|Overview/i }).first()).toBeVisible();
    
    // Kiểm tra các thành phần chính của dashboard
    await expect(page.locator('.dashboard-stats, .stats-cards, .overview-cards, .metrics').first()).toBeVisible({ timeout: 5000 });
    
    // Kiểm tra xem có biểu đồ nào hiển thị không
    const hasCharts = await page.locator('.chart-container, .analytics-chart, canvas, svg.chart').count() > 0;
    if (hasCharts) {
      await expect(page.locator('.chart-container, .analytics-chart, canvas, svg.chart').first()).toBeVisible({ timeout: 10000 });
    }
    
    // Kiểm tra các thành phần khác nếu có
    const hasRecentItems = await page.locator('.recent-orders, .recent-activities, .recent-transactions, table').count() > 0;
    if (hasRecentItems) {
      await expect(page.locator('.recent-orders, .recent-activities, .recent-transactions, table').first()).toBeVisible();
    }
  });
  
  test('navigation sidebar contains key menu items', async ({ page }) => {
    // Kiểm tra xem sidebar có hiển thị không
    const sidebar = page.locator('nav, .sidebar, .menu, .navigation');
    await expect(sidebar.first()).toBeVisible();
    
    // Tìm kiếm các mục menu chính
    const menuItems = [
      /Dashboard|Tổng quan/i,
      /Product|Sản phẩm/i,
      /Order|Đơn hàng/i,
      /Customer|Khách hàng/i,
    ];
    
    // Đếm số lượng mục menu chính được tìm thấy
    let foundItems = 0;
    
    for (const pattern of menuItems) {
      const menuItem = sidebar.locator('a, button').filter({ hasText: pattern }).first();
      if (await menuItem.count() > 0) {
        foundItems++;
      }
    }
    
    // Có ít nhất 2 trong số các mục menu chính
    expect(foundItems).toBeGreaterThanOrEqual(2);
  });
  
  test('can navigate between main sections', async ({ page }) => {
    // Tìm và kiểm tra menu sản phẩm
    const productsLink = page.locator('nav a, .sidebar a').filter({ hasText: /Products|Sản phẩm/i }).first();
    
    if (await productsLink.isVisible()) {
      // Click vào menu sản phẩm
      await productsLink.click();
      
      // Đợi chuyển hướng đến trang sản phẩm
      await page.waitForURL('**/product**', { timeout: 5000 });
      
      // Kiểm tra tiêu đề trang sản phẩm
      await expect(page.locator('h1, h2, .page-title').filter({ hasText: /Products|Sản phẩm/i }).first()).toBeVisible();
      
      // Quay lại trang dashboard
      const dashboardLink = page.locator('nav a, .sidebar a').filter({ hasText: /Dashboard|Tổng quan/i }).first();
      await dashboardLink.click();
      
      // Đợi chuyển hướng đến trang dashboard
      await page.waitForURL('**/dashboard**', { timeout: 5000 });
    }
    
    // Tìm và kiểm tra menu đơn hàng
    const ordersLink = page.locator('nav a, .sidebar a').filter({ hasText: /Orders|Đơn hàng/i }).first();
    
    if (await ordersLink.isVisible()) {
      // Click vào menu đơn hàng
      await ordersLink.click();
      
      // Đợi chuyển hướng đến trang đơn hàng
      await page.waitForURL('**/order**', { timeout: 5000 });
      
      // Kiểm tra tiêu đề trang đơn hàng
      await expect(page.locator('h1, h2, .page-title').filter({ hasText: /Orders|Đơn hàng/i }).first()).toBeVisible();
    }
  });

  test('can view statistics and metrics', async ({ page }) => {
    // Tìm kiếm các thẻ thống kê
    const statsCards = page.locator('.stat-card, .dashboard-card, .metric-card, .card');
    
    // Kiểm tra xem có thẻ thống kê nào không
    const cardCount = await statsCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Kiểm tra thẻ đầu tiên có hiển thị không
    await expect(statsCards.first()).toBeVisible();
    
    // Kiểm tra các thẻ chính (nếu có)
    const keyMetrics = [
      /Revenue|Doanh thu/i,
      /Orders|Đơn hàng/i,
      /Customers|Khách hàng/i,
      /Products|Sản phẩm/i
    ];
    
    // Đếm số lượng thẻ thống kê chính được tìm thấy
    let foundMetrics = 0;
    
    for (const pattern of keyMetrics) {
      const metric = page.locator('.stat-card, .dashboard-card, .metric-card, .card').filter({ hasText: pattern }).first();
      if (await metric.count() > 0) {
        foundMetrics++;
      }
    }
    
    // Có ít nhất 1 thẻ thống kê chính
    expect(foundMetrics).toBeGreaterThanOrEqual(1);
  });
  
  test('user profile menu functionality', async ({ page }) => {
    // Tìm kiếm menu/avatar người dùng
    const userMenu = page.locator('.user-menu, .profile-menu, .avatar, .user-profile').first();
    
    if (await userMenu.isVisible()) {
      // Click vào menu người dùng
      await userMenu.click();
      
      // Kiểm tra xem dropdown menu có hiển thị không
      const dropdown = page.locator('.dropdown-menu, .menu-items, .profile-dropdown');
      await expect(dropdown.first()).toBeVisible();
      
      // Kiểm tra các mục trong dropdown
      const dropdownItems = dropdown.locator('a, button, li');
      const itemCount = await dropdownItems.count();
      
      // Phải có ít nhất 1 mục trong dropdown
      expect(itemCount).toBeGreaterThan(0);
    }
  });
}); 