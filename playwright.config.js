// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Cấu hình Playwright cho KhoChuan POS
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  
  // Thời gian timeout tối đa cho mỗi test
  timeout: 30 * 1000,
  
  // Chạy tests trong file theo tuần tự, nhưng file song song với file khác
  fullyParallel: false,
  
  // Fail cả test suite nếu một test fail
  forbidOnly: !!process.env.CI,
  
  // Retry lại mỗi test bao nhiêu lần
  retries: process.env.CI ? 2 : 0,
  
  // Số workers song song
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter để hiển thị kết quả test
  reporter: [['html'], ['list']],
  
  // Shared settings cho tất cả các projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',

    // Collect trace khi retrying a test
    trace: 'on-first-retry',
    
    // Screenshot khi test thất bại
    screenshot: 'only-on-failure',
    
    // Collect video khi test thất bại
    video: 'on-first-retry',
    
    // Timeout cho các navigation
    navigationTimeout: 15000,
    
    // Timeout cho các selectors
    actionTimeout: 10000,
    
    // Đợi trang load xong trước khi consider navigation hoàn tất
    waitForNavigation: { waitUntil: 'networkidle' },
    
    // Đợi trang load xong sau khi navigation
    launchOptions: {
      slowMo: 100,
    }
  },

  // Cấu hình cho projects khác nhau
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 }
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Test trên thiết bị di động
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Test trên dark mode
    {
      name: 'Dark mode',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
      },
    }
  ],

  // Cấu hình web server
  webServer: {
    command: 'cd frontend && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 60000,
  },
}); 