/**
 * Test fixtures and data generation helpers
 */

/**
 * Generate random test data
 */
function generateTestData() {
  const timestamp = Date.now();
  return {
    // Customer data
    customer: {
      name: `Test Customer ${timestamp}`,
      email: `test.customer.${timestamp}@example.com`,
      phone: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      address: '123 Test Street, Test City'
    },
    
    // Product data
    product: {
      name: `Test Product ${timestamp}`,
      sku: `TP-${timestamp}`,
      barcode: `12345${timestamp.toString().substring(5)}`,
      description: 'This is a test product description',
      price: Math.floor(10 + Math.random() * 990) / 10, // Random price between 1.0 and 100.0
      cost: Math.floor(5 + Math.random() * 500) / 10, // Random cost between 0.5 and 50.0
      category: 'Test Category'
    },
    
    // Order data
    order: {
      items: [
        { 
          name: `Test Product 1-${timestamp}`,
          quantity: Math.floor(1 + Math.random() * 5),
          price: Math.floor(10 + Math.random() * 990) / 10
        },
        { 
          name: `Test Product 2-${timestamp}`,
          quantity: Math.floor(1 + Math.random() * 5),
          price: Math.floor(10 + Math.random() * 990) / 10
        }
      ],
      payment: {
        method: 'cash',
        amount: 0 // Will be calculated based on items
      },
      notes: 'Test order created by automated tests'
    }
  };
}

/**
 * Create a test product in the system
 * @param {Object} page - Playwright page object
 * @param {Object} productData - Product data (optional, generated if not provided)
 * @returns {Promise<Object>} - Created product data
 */
async function createTestProduct(page, productData = null) {
  const data = productData || generateTestData().product;
  
  // Navigate to product creation page
  await page.goto('/admin/products/product-form');
  
  // Fill product form
  await page.locator('input[name="name"]').fill(data.name);
  await page.locator('input[name="sku"]').fill(data.sku);
  await page.locator('input[name="barcode"]').fill(data.barcode);
  await page.locator('textarea[name="description"]').fill(data.description);
  await page.locator('input[name="price"]').fill(data.price.toString());
  await page.locator('input[name="cost"]').fill(data.cost.toString());
  
  // Select category (assuming a select dropdown)
  await page.selectOption('select[name="category"]', { label: data.category });
  
  // Submit form
  await page.locator('button:has-text("Save")').click();
  
  // Wait for success message
  await page.locator('div.toast-success').waitFor();
  
  return data;
}

/**
 * Create a test customer in the system
 * @param {Object} page - Playwright page object
 * @param {Object} customerData - Customer data (optional, generated if not provided)
 * @returns {Promise<Object>} - Created customer data
 */
async function createTestCustomer(page, customerData = null) {
  const data = customerData || generateTestData().customer;
  
  // Navigate to customer creation page
  await page.goto('/admin/customers/customer-management');
  
  // Click add customer button
  await page.locator('button:has-text("Add Customer")').click();
  
  // Fill customer form
  await page.locator('input[name="name"]').fill(data.name);
  await page.locator('input[name="email"]').fill(data.email);
  await page.locator('input[name="phone"]').fill(data.phone);
  await page.locator('input[name="address"]').fill(data.address);
  
  // Submit form
  await page.locator('button:has-text("Save")').click();
  
  // Wait for success message
  await page.locator('div.toast-success').waitFor();
  
  return data;
}

/**
 * Create a test order in the system
 * @param {Object} page - Playwright page object
 * @param {Object} orderData - Order data (optional, generated if not provided)
 * @returns {Promise<Object>} - Created order data with order number
 */
async function createTestOrder(page, orderData = null) {
  const data = orderData || generateTestData().order;
  
  // Navigate to POS terminal
  await page.goto('/cashier/pos/pos-terminal');
  
  // Add items to cart
  for (const item of data.items) {
    // Search for product
    await page.locator('input[placeholder="Search products"]').fill(item.name);
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Click on first search result (assumes product exists)
    await page.locator('div.product-item').first().click();
    
    // Set quantity
    if (item.quantity > 1) {
      await page.locator('button.quantity-increase').click({ clickCount: item.quantity - 1 });
    }
  }
  
  // Calculate total
  let total = 0;
  for (const item of data.items) {
    total += item.price * item.quantity;
  }
  data.payment.amount = total;
  
  // Proceed to checkout
  await page.locator('button:has-text("Checkout")').click();
  
  // Select payment method
  await page.locator(`button[data-payment="${data.payment.method}"]`).click();
  
  // Enter payment amount
  await page.locator('input[name="payment-amount"]').fill(data.payment.amount.toString());
  
  // Add notes if provided
  if (data.notes) {
    await page.locator('textarea[name="notes"]').fill(data.notes);
  }
  
  // Complete order
  await page.locator('button:has-text("Complete Order")').click();
  
  // Wait for order success screen
  await page.locator('div.order-success').waitFor();
  
  // Get order number
  const orderNumberText = await page.locator('div.order-number').textContent();
  const orderNumber = orderNumberText.match(/\d+/)[0];
  
  // Add order number to returned data
  data.orderNumber = orderNumber;
  
  return data;
}

/**
 * Clean up test data after tests
 * @param {Object} page - Playwright page object
 * @param {Object} testData - Test data to clean up
 */
async function cleanupTestData(page, testData) {
  // Implement cleanup logic here
  // This could delete test products, customers, orders etc.
  // For example:
  
  if (testData.product) {
    await page.goto('/admin/products');
    await page.locator('input[placeholder="Search products"]').fill(testData.product.sku);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    // Check if product exists
    const productExists = await page.locator(`td:has-text("${testData.product.sku}")`).count() > 0;
    if (productExists) {
      // Delete the product
      await page.locator(`tr:has-text("${testData.product.sku}") button.delete-btn`).click();
      await page.locator('button:has-text("Confirm Delete")').click();
      await page.locator('div.toast-success').waitFor();
    }
  }
  
  // Similar cleanup for customers, orders, etc.
}

module.exports = {
  generateTestData,
  createTestProduct,
  createTestCustomer,
  createTestOrder,
  cleanupTestData
}; 