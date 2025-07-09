const { test, expect } = require('@playwright/test');
const { loginAs } = require('./helpers/auth');

test.describe('Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginAs(page, 'admin');
    // Navigate to customer management page
    await page.goto('/admin/customers/customer-management');
    await expect(page.locator('h1:has-text("Customer Management")')).toBeVisible();
  });

  test('should display customer list', async ({ page }) => {
    // Verify customer table is visible with data
    const customerTable = page.locator('table.customer-table');
    await expect(customerTable).toBeVisible();
    
    // Check if there are customers in the list
    const rowCount = await page.locator('table.customer-table tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Verify essential columns are present
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Phone")')).toBeVisible();
    await expect(page.locator('th:has-text("Loyalty Points")')).toBeVisible();
  });

  test('should search and filter customers', async ({ page }) => {
    // Get initial customer count
    const initialCount = await page.locator('table.customer-table tbody tr').count();
    
    // Use the search filter
    await page.locator('input[placeholder="Search customers"]').fill('John');
    await page.keyboard.press('Enter');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check filtered count is different
    const filteredCount = await page.locator('table.customer-table tbody tr').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Clear filter
    await page.locator('input[placeholder="Search customers"]').clear();
    await page.keyboard.press('Enter');
    
    // Verify count returns to initial
    await page.waitForTimeout(1000);
    const resetCount = await page.locator('table.customer-table tbody tr').count();
    expect(resetCount).toEqual(initialCount);
  });

  test('should add a new customer', async ({ page }) => {
    // Get initial customer count
    const initialCount = await page.locator('table.customer-table tbody tr').count();
    
    // Click add customer button
    await page.locator('button:has-text("Add Customer")').click();
    
    // Fill customer form
    await page.locator('input[name="name"]').fill('Test Customer');
    await page.locator('input[name="email"]').fill(`test.customer.${Date.now()}@example.com`);
    await page.locator('input[name="phone"]').fill('123456789');
    await page.locator('input[name="address"]').fill('123 Test Street');
    
    // Submit form
    await page.locator('button:has-text("Save")').click();
    
    // Verify success message
    await expect(page.locator('div.toast-success:has-text("Customer added successfully")')).toBeVisible();
    
    // Verify customer count increased
    await page.reload();
    const newCount = await page.locator('table.customer-table tbody tr').count();
    expect(newCount).toEqual(initialCount + 1);
  });

  test('should edit existing customer', async ({ page }) => {
    // Click on first customer to edit
    await page.locator('table.customer-table tbody tr').first().click();
    
    // Wait for customer detail modal
    await expect(page.locator('div.customer-detail-modal')).toBeVisible();
    
    // Click edit button
    await page.locator('button:has-text("Edit")').click();
    
    // Generate unique email to avoid conflicts
    const uniqueEmail = `edited.customer.${Date.now()}@example.com`;
    
    // Update customer email
    await page.locator('input[name="email"]').clear();
    await page.locator('input[name="email"]').fill(uniqueEmail);
    
    // Save changes
    await page.locator('button:has-text("Save Changes")').click();
    
    // Verify success message
    await expect(page.locator('div.toast-success:has-text("Customer updated successfully")')).toBeVisible();
    
    // Close modal
    await page.locator('button.modal-close').click();
    
    // Search for updated customer
    await page.locator('input[placeholder="Search customers"]').fill(uniqueEmail);
    await page.keyboard.press('Enter');
    
    // Verify customer appears in search results
    await page.waitForTimeout(1000);
    const rowCount = await page.locator('table.customer-table tbody tr').count();
    expect(rowCount).toEqual(1);
  });

  test('should view customer purchase history', async ({ page }) => {
    // Click on first customer to view details
    await page.locator('table.customer-table tbody tr').first().click();
    
    // Wait for customer detail modal
    await expect(page.locator('div.customer-detail-modal')).toBeVisible();
    
    // Navigate to purchase history tab
    await page.locator('button:has-text("Purchase History")').click();
    
    // Verify purchase history table is visible
    await expect(page.locator('div.purchase-history-table')).toBeVisible();
    await expect(page.locator('th:has-text("Order #")')).toBeVisible();
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Amount")')).toBeVisible();
  });

  test('should manage customer loyalty points', async ({ page }) => {
    // Click on first customer to view details
    await page.locator('table.customer-table tbody tr').first().click();
    
    // Wait for customer detail modal
    await expect(page.locator('div.customer-detail-modal')).toBeVisible();
    
    // Navigate to loyalty points tab
    await page.locator('button:has-text("Loyalty Points")').click();
    
    // Get current loyalty points
    const currentPointsText = await page.locator('div.loyalty-points-value').textContent();
    const currentPoints = parseInt(currentPointsText.trim(), 10);
    
    // Add loyalty points
    await page.locator('button:has-text("Add Points")').click();
    await page.locator('input[name="points"]').fill('100');
    await page.locator('select[name="reason"]').selectOption('manual-adjustment');
    await page.locator('textarea[name="notes"]').fill('Test adjustment');
    await page.locator('button:has-text("Confirm")').click();
    
    // Verify success message
    await expect(page.locator('div.toast-success:has-text("Points added successfully")')).toBeVisible();
    
    // Verify points were added
    const newPointsText = await page.locator('div.loyalty-points-value').textContent();
    const newPoints = parseInt(newPointsText.trim(), 10);
    expect(newPoints).toEqual(currentPoints + 100);
  });

  test('should test customer segmentation AI feature', async ({ page }) => {
    // Navigate to customer segmentation page
    await page.goto('/admin/customers/customer-segmentation');
    await expect(page.locator('h1:has-text("Customer Segmentation")')).toBeVisible();
    
    // Run segmentation
    await page.locator('button:has-text("Run Segmentation")').click();
    
    // Wait for processing
    await expect(page.locator('div.processing-indicator')).toBeVisible();
    await expect(page.locator('div.segmentation-results')).toBeVisible({ timeout: 30000 });
    
    // Verify segments are created
    const segmentCount = await page.locator('div.segment-card').count();
    expect(segmentCount).toBeGreaterThan(0);
    
    // Check if segment data is displayed
    await expect(page.locator('div.segment-chart')).toBeVisible();
    await expect(page.locator('div.segment-details')).toBeVisible();
    
    // Export segments
    await page.locator('button:has-text("Export Segments")').click();
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('customer-segments');
  });
}); 