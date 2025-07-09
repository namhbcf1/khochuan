// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the login page before each test
    await page.goto('/login');
    
    // Đợi cho loading screen biến mất (nếu có)
    try {
      await page.waitForSelector('.app-loading', { state: 'hidden', timeout: 5000 });
    } catch (e) {
      // Nếu không có loading screen, tiếp tục
      console.log('Không có loading screen hoặc đã ẩn');
    }
  });
  
  test('should display login page with all elements', async ({ page }) => {
    // Kiểm tra các thành phần chính của trang đăng nhập
    await expect(page.getByRole('heading', { name: '📦 KhoChuan POS' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByPlaceholder(/Tên đăng nhập|Username|Email/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByPlaceholder(/Mật khẩu|Password/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Đăng nhập|Login/i })).toBeVisible({ timeout: 5000 });
  });
  
  test('should show error on invalid login', async ({ page }) => {
    // Tìm các trường đăng nhập
    const usernameInput = page.getByPlaceholder(/Tên đăng nhập|Username|Email/i).first();
    await expect(usernameInput).toBeVisible({ timeout: 5000 });
    await usernameInput.fill('wrong@example.com');
    
    const passwordInput = page.getByPlaceholder(/Mật khẩu|Password/i).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill('wrongpassword');
    
    // Nhấn nút đăng nhập
    const loginButton = page.getByRole('button', { name: /Đăng nhập|Login/i });
    await loginButton.click();
    
    // Đợi thông báo lỗi xuất hiện
    await expect(page.getByText(/không đúng|incorrect|failed|thất bại|lỗi|error/i).first()).toBeVisible({ timeout: 5000 });
  });
  
  test('should login as admin successfully', async ({ page }) => {
    // Tìm các trường đăng nhập
    const usernameInput = page.getByPlaceholder(/Tên đăng nhập|Username|Email/i).first();
    await expect(usernameInput).toBeVisible({ timeout: 5000 });
    await usernameInput.fill('admin');
    
    const passwordInput = page.getByPlaceholder(/Mật khẩu|Password/i).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill('admin123');
    
    // Nhấn nút đăng nhập
    const loginButton = page.getByRole('button', { name: /Đăng nhập|Login/i });
    await loginButton.click();
    
    // Đợi chuyển hướng đến trang dashboard
    await page.waitForURL(/dashboard|admin/i, { timeout: 10000 });
    
    // Kiểm tra các thành phần của dashboard admin
    await expect(page.getByText(/Dashboard|Bảng điều khiển|Tổng quan/i).first()).toBeVisible({ timeout: 5000 });
  });
  
  test('should login as cashier successfully', async ({ page }) => {
    // Tìm các trường đăng nhập
    const usernameInput = page.getByPlaceholder(/Tên đăng nhập|Username|Email/i).first();
    await expect(usernameInput).toBeVisible({ timeout: 5000 });
    await usernameInput.fill('cashier');
    
    const passwordInput = page.getByPlaceholder(/Mật khẩu|Password/i).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill('cashier123');
    
    // Nhấn nút đăng nhập
    const loginButton = page.getByRole('button', { name: /Đăng nhập|Login/i });
    await loginButton.click();
    
    // Đợi chuyển hướng đến trang POS
    await page.waitForURL(/pos|cashier/i, { timeout: 10000 });
  });
  
  test('should logout successfully', async ({ page }) => {
    // Đăng nhập trước
    const usernameInput = page.getByPlaceholder(/Tên đăng nhập|Username|Email/i).first();
    await expect(usernameInput).toBeVisible({ timeout: 5000 });
    await usernameInput.fill('admin');
    
    const passwordInput = page.getByPlaceholder(/Mật khẩu|Password/i).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill('admin123');
    
    const loginButton = page.getByRole('button', { name: /Đăng nhập|Login/i });
    await loginButton.click();
    
    // Đợi đăng nhập thành công
    await page.waitForURL(/dashboard|admin/i, { timeout: 10000 });
    
    // Tìm nút đăng xuất trong các vị trí phổ biến
    const logoutButton = page.getByRole('button', { name: /Đăng xuất|Logout|Log out/i }).first();
    
    if (await logoutButton.isVisible({ timeout: 5000 })) {
      // Click vào nút đăng xuất nếu hiển thị trực tiếp
      await logoutButton.click();
    } else {
      // Nếu không thấy nút đăng xuất trực tiếp, tìm menu người dùng và mở nó
      const userMenu = page.locator('.user-menu, .profile-menu, .avatar, .user-profile').first();
      await userMenu.click();
      
      // Sau khi mở menu, tìm và click vào nút đăng xuất
      const logoutMenuItem = page.getByText(/Đăng xuất|Logout|Log out/i).first();
      await expect(logoutMenuItem).toBeVisible({ timeout: 5000 });
      await logoutMenuItem.click();
    }
    
    // Đợi quay lại trang đăng nhập
    await page.waitForURL(/login/i, { timeout: 10000 });
    
    // Xác nhận quay lại trang đăng nhập
    await expect(page.getByRole('heading', { name: '📦 KhoChuan POS' })).toBeVisible({ timeout: 5000 });
  });
  
  test('should redirect to login if accessing protected page while logged out', async ({ page }) => {
    // Truy cập trang được bảo vệ khi chưa đăng nhập
    await page.goto('/admin/dashboard');
    
    // Đợi chuyển hướng đến trang đăng nhập
    await page.waitForURL(/login/i, { timeout: 10000 });
    
    // Xác nhận đã chuyển hướng đến trang đăng nhập
    await expect(page.getByRole('heading', { name: '📦 KhoChuan POS' })).toBeVisible({ timeout: 5000 });
  });
}); 