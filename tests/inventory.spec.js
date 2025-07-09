const { test, expect } = require('@playwright/test');
const { loginAs } = require('./helpers/auth');

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginAs(page, 'admin');
    // Navigate to inventory management page
    await page.goto('/admin/inventory/inventory-dashboard');
    await expect(page.locator('h1:has-text("Inventory Dashboard")')).toBeVisible();
  });

  test('should display current inventory levels', async ({ page }) => {
    // Verify inventory table is visible with data
    const inventoryTable = page.locator('table.inventory-table');
    await expect(inventoryTable).toBeVisible();
    
    // Check if there are items in the inventory
    const rowCount = await page.locator('table.inventory-table tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Verify essential columns are present
    await expect(page.locator('th:has-text("Product Name")')).toBeVisible();
    await expect(page.locator('th:has-text("SKU")')).toBeVisible();
    await expect(page.locator('th:has-text("Quantity")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should filter inventory items', async ({ page }) => {
    // Get initial item count
    const initialCount = await page.locator('table.inventory-table tbody tr').count();
    
    // Use the search filter
    await page.locator('input[placeholder="Search products"]').fill('Test Product');
    await page.keyboard.press('Enter');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check filtered count is different
    const filteredCount = await page.locator('table.inventory-table tbody tr').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Clear filter
    await page.locator('input[placeholder="Search products"]').clear();
    await page.keyboard.press('Enter');
    
    // Verify count returns to initial
    await page.waitForTimeout(1000);
    const resetCount = await page.locator('table.inventory-table tbody tr').count();
    expect(resetCount).toEqual(initialCount);
  });

  test('should add stock to existing product', async ({ page }) => {
    // Find first product in the list
    const firstProductRow = page.locator('table.inventory-table tbody tr').first();
    
    // Get current stock level
    const currentStock = await firstProductRow.locator('td:nth-child(4)').textContent();
    const currentStockNumber = parseInt(currentStock.trim(), 10);
    
    // Click on the product to open detail view
    await firstProductRow.click();
    await expect(page.locator('div.product-detail-modal')).toBeVisible();
    
    // Add 10 units to stock
    await page.locator('button:has-text("Add Stock")').click();
    await page.locator('input[name="quantity"]').fill('10');
    await page.locator('button:has-text("Confirm")').click();
    
    // Wait for confirmation and close modal
    await expect(page.locator('div.toast-success')).toBeVisible();
    await page.locator('button.modal-close').click();
    
    // Refresh page to see updated stock
    await page.reload();
    
    // Verify stock has increased
    const firstProductRowAfter = page.locator('table.inventory-table tbody tr').first();
    const newStock = await firstProductRowAfter.locator('td:nth-child(4)').textContent();
    const newStockNumber = parseInt(newStock.trim(), 10);
    
    expect(newStockNumber).toEqual(currentStockNumber + 10);
  });

  test('should generate low stock report', async ({ page }) => {
    // Navigate to reports section
    await page.locator('a:has-text("Reports")').click();
    await page.locator('a:has-text("Inventory Report")').click();
    
    // Select low stock report type
    await page.selectOption('select[name="report-type"]', 'low-stock');
    await page.locator('button:has-text("Generate")').click();
    
    // Verify report is generated
    await expect(page.locator('h2:has-text("Low Stock Items")')).toBeVisible();
    
    // Export report
    await page.locator('button:has-text("Export")').click();
    
    // Check if download started
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('low-stock-report');
  });

  test('should test demand forecasting feature', async ({ page }) => {
    // Navigate to demand forecasting
    await page.locator('a:has-text("Demand Forecasting")').click();
    
    // Select a product category for forecasting
    await page.selectOption('select[name="category"]', { label: 'All Categories' });
    
    // Select forecast period
    await page.selectOption('select[name="period"]', '30');
    
    // Generate forecast
    await page.locator('button:has-text("Generate Forecast")').click();
    
    // Verify forecast chart appears
    await expect(page.locator('div.forecast-chart')).toBeVisible();
    
    // Check if forecast data contains expected elements
    await expect(page.locator('table.forecast-table')).toBeVisible();
    await expect(page.locator('th:has-text("Product")')).toBeVisible();
    await expect(page.locator('th:has-text("Forecasted Demand")')).toBeVisible();
    await expect(page.locator('th:has-text("Confidence")')).toBeVisible();
  });

  test('should perform bulk inventory update', async ({ page }) => {
    // Navigate to bulk operations
    await page.locator('a:has-text("Bulk Operations")').click();
    
    // Upload inventory CSV file
    await page.setInputFiles('input[type="file"]', './fixtures/inventory-update.csv');
    
    // Verify upload success
    await expect(page.locator('div.upload-success')).toBeVisible();
    
    // Map CSV columns
    await page.selectOption('select[name="sku-column"]', '0');
    await page.selectOption('select[name="quantity-column"]', '1');
    
    // Confirm import
    await page.locator('button:has-text("Update Inventory")').click();
    
    // Verify confirmation dialog
    await expect(page.locator('div.confirm-dialog')).toBeVisible();
    await page.locator('button:has-text("Yes, Update")').click();
    
    // Check success message
    await expect(page.locator('div.toast-success:has-text("Inventory Updated")')).toBeVisible();
    
    // Verify import log is available
    await expect(page.locator('a:has-text("View Import Log")')).toBeVisible();
  });
}); 