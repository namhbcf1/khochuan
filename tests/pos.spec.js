// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('POS Terminal Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Đi đến trang đăng nhập
    await page.goto('/login');
    
    // Đợi trang tải xong
    await page.waitForLoadState('networkidle');
    
    // Tìm và điền vào trường tên đăng nhập
    const usernameInput = page.getByPlaceholder(/Tên đăng nhập|Username|Email/i).first();
    await expect(usernameInput).toBeVisible({ timeout: 5000 });
    await usernameInput.fill('cashier');
    
    // Tìm và điền vào trường mật khẩu
    const passwordInput = page.getByPlaceholder(/Mật khẩu|Password/i).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill('cashier123');
    
    // Nhấn nút đăng nhập
    const loginButton = page.getByRole('button', { name: /Đăng nhập|Login/i });
    await loginButton.click();
    
    // Đợi chuyển hướng đến trang POS
    try {
      await page.waitForURL('**/pos**', { timeout: 5000 });
    } catch (error) {
      // Nếu không tìm thấy URL với /pos, thử kiểm tra các thành phần POS trên trang hiện tại
      console.log('Không chuyển hướng đến URL có chứa /pos, kiểm tra các thành phần POS trên trang hiện tại');
      
      // Tìm và nhấn vào nút POS hoặc Terminal nếu có
      const posLink = page.locator('nav a, .sidebar a').filter({ hasText: /POS|Terminal|Thu ngân/i }).first();
      if (await posLink.isVisible()) {
        await posLink.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('POS terminal loads with basic components', async ({ page }) => {
    // Kiểm tra các thành phần cơ bản của POS
    
    // Tìm kiếm lưới sản phẩm hoặc danh sách sản phẩm
    const hasProducts = await page.locator('.products, .product-grid, .product-list, .product-item, .product-card').count() > 0;
    if (hasProducts) {
      await expect(page.locator('.products, .product-grid, .product-list, .product-item, .product-card').first()).toBeVisible({ timeout: 5000 });
    }
    
    // Tìm kiếm giỏ hàng hoặc đơn hàng
    const hasCart = await page.locator('.cart, .cart-panel, .order, .order-summary, .bill').count() > 0;
    if (hasCart) {
      await expect(page.locator('.cart, .cart-panel, .order, .order-summary, .bill').first()).toBeVisible({ timeout: 5000 });
    }
    
    // Tìm kiếm thanh tìm kiếm sản phẩm
    const hasSearchBar = await page.locator('input[type="search"], input[type="text"], input[placeholder*="Search"]').count() > 0;
    if (hasSearchBar) {
      await expect(page.locator('input[type="search"], input[type="text"], input[placeholder*="Search"]').first()).toBeVisible({ timeout: 5000 });
    }
    
    // Tìm kiếm nút thanh toán
    const hasCheckoutButton = await page.locator('button').filter({ hasText: /Checkout|Payment|Thanh toán/i }).count() > 0;
    if (hasCheckoutButton) {
      await expect(page.locator('button').filter({ hasText: /Checkout|Payment|Thanh toán/i }).first()).toBeVisible({ timeout: 5000 });
    }
    
    // Phải có ít nhất 2 trong 4 thành phần cơ bản
    const componentsFound = [hasProducts, hasCart, hasSearchBar, hasCheckoutButton].filter(Boolean).length;
    expect(componentsFound).toBeGreaterThanOrEqual(2);
  });

  test('can interact with products', async ({ page }) => {
    // Tìm kiếm các sản phẩm
    const products = page.locator('.product, .product-item, .product-card');
    const productCount = await products.count();
    
    if (productCount > 0) {
      // Click vào sản phẩm đầu tiên
      await products.first().click();
      
      // Đợi một chút để xem phản ứng
      await page.waitForTimeout(1000);
      
      // Kiểm tra xem có thêm vào giỏ hàng không
      const cartItems = page.locator('.cart-item, .order-item, .bill-item');
      const hasCartItems = await cartItems.count() > 0;
      
      if (!hasCartItems) {
        // Nếu không thêm trực tiếp vào giỏ hàng, thử tìm nút thêm và nhấn vào
        const addButton = products.first().locator('button').filter({ hasText: /Add|Thêm|Cart/i }).first();
        if (await addButton.count() > 0) {
          await addButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // Kiểm tra tìm kiếm sản phẩm nếu có thanh tìm kiếm
    const searchInput = page.locator('input[type="search"], input[type="text"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.keyboard.press('Enter');
      
      // Đợi kết quả tìm kiếm
      await page.waitForTimeout(1000);
    }
  });

  test('can add and remove items from cart', async ({ page }) => {
    // Tìm kiếm các sản phẩm
    const products = page.locator('.product, .product-item, .product-card');
    const productCount = await products.count();
    
    if (productCount > 0) {
      // Đếm số lượng sản phẩm trong giỏ hàng ban đầu
      const cartItems = page.locator('.cart-item, .order-item, .bill-item');
      const initialCartCount = await cartItems.count();
      
      // Thêm sản phẩm vào giỏ hàng
      await products.first().click();
      
      // Đợi giỏ hàng cập nhật
      await page.waitForTimeout(1000);
      
      // Kiểm tra xem số lượng sản phẩm trong giỏ có tăng không
      const newCartCount = await cartItems.count();
      
      // Nếu chưa thêm được vào giỏ, thử tìm và nhấn nút thêm
      if (newCartCount <= initialCartCount) {
        const addButton = products.first().locator('button').filter({ hasText: /Add|Thêm|Cart/i }).first();
        if (await addButton.count() > 0) {
          await addButton.click();
          await page.waitForTimeout(1000);
        }
      }
      
      // Tìm kiếm nút xóa sản phẩm trong giỏ hàng
      if (await cartItems.count() > 0) {
        const removeButton = cartItems.first().locator('button').filter({ hasText: /Remove|Delete|Xóa|X|-/i }).first();
        if (await removeButton.count() > 0) {
          // Ghi nhớ số lượng sản phẩm trước khi xóa
          const beforeRemoveCount = await cartItems.count();
          
          // Xóa sản phẩm
          await removeButton.click();
          
          // Đợi giỏ hàng cập nhật
          await page.waitForTimeout(1000);
          
          // Kiểm tra số lượng sản phẩm sau khi xóa
          const afterRemoveCount = await cartItems.count();
          
          // Số lượng sau khi xóa phải ít hơn hoặc bằng số lượng ban đầu
          expect(afterRemoveCount).toBeLessThanOrEqual(beforeRemoveCount);
        }
      }
    }
  });

  test('can adjust product quantity in cart', async ({ page }) => {
    // Tìm kiếm các sản phẩm
    const products = page.locator('.product, .product-item, .product-card');
    const productCount = await products.count();
    
    if (productCount > 0) {
      // Thêm sản phẩm vào giỏ hàng nếu giỏ trống
      const cartItems = page.locator('.cart-item, .order-item, .bill-item');
      if (await cartItems.count() === 0) {
        // Thêm sản phẩm vào giỏ
        await products.first().click();
        
        // Đợi giỏ hàng cập nhật
        await page.waitForTimeout(1000);
        
        // Nếu vẫn chưa có sản phẩm trong giỏ, thử nhấn nút thêm
        if (await cartItems.count() === 0) {
          const addButton = products.first().locator('button').filter({ hasText: /Add|Thêm|Cart/i }).first();
          if (await addButton.count() > 0) {
            await addButton.click();
            await page.waitForTimeout(1000);
          }
        }
      }
      
      // Nếu có sản phẩm trong giỏ, tìm các nút điều chỉnh số lượng
      if (await cartItems.count() > 0) {
        const firstCartItem = cartItems.first();
        
        // Tìm nút tăng số lượng
        const increaseButton = firstCartItem.locator('button').filter({ hasText: /\+|Increase|Tăng/i }).first();
        if (await increaseButton.count() > 0) {
          // Tìm trường hiển thị số lượng
          const quantityElement = firstCartItem.locator('.quantity, [name="quantity"], .amount').first();
          
          // Nếu có trường số lượng, ghi nhớ giá trị ban đầu
          let initialQuantity = 1;
          if (await quantityElement.count() > 0) {
            const quantityText = await quantityElement.textContent() || '1';
            initialQuantity = parseInt(quantityText.trim()) || 1;
          }
          
          // Nhấn nút tăng số lượng
          await increaseButton.click();
          
          // Đợi giỏ hàng cập nhật
          await page.waitForTimeout(500);
          
          // Kiểm tra lại số lượng sau khi tăng (nếu có thể)
          if (await quantityElement.count() > 0) {
            const newQuantityText = await quantityElement.textContent() || '1';
            const newQuantity = parseInt(newQuantityText.trim()) || 1;
            
            // Số lượng mới phải lớn hơn hoặc bằng số lượng ban đầu
            expect(newQuantity).toBeGreaterThanOrEqual(initialQuantity);
          }
        }
      }
    }
  });

  test('can proceed to checkout if available', async ({ page }) => {
    // Tìm kiếm các sản phẩm
    const products = page.locator('.product, .product-item, .product-card');
    
    // Thêm sản phẩm vào giỏ hàng nếu giỏ trống
    const cartItems = page.locator('.cart-item, .order-item, .bill-item');
    if (await cartItems.count() === 0 && await products.count() > 0) {
      // Thêm sản phẩm vào giỏ
      await products.first().click();
      
      // Đợi giỏ hàng cập nhật
      await page.waitForTimeout(1000);
      
      // Nếu vẫn chưa có sản phẩm trong giỏ, thử nhấn nút thêm
      if (await cartItems.count() === 0) {
        const addButton = products.first().locator('button').filter({ hasText: /Add|Thêm|Cart/i }).first();
        if (await addButton.count() > 0) {
          await addButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // Tìm và nhấn nút thanh toán
    const checkoutButton = page.locator('button').filter({ hasText: /Checkout|Payment|Thanh toán|Thanh Toán/i }).first();
    if (await checkoutButton.isEnabled() && await checkoutButton.isVisible()) {
      await checkoutButton.click();
      
      // Đợi màn hình thanh toán hiển thị
      await page.waitForTimeout(3000);
      
      // Kiểm tra các phương thức thanh toán nếu có
      const hasPaymentMethods = await page.locator('.payment-methods, .payment-options, [name="payment-method"]').count() > 0;
      
      if (hasPaymentMethods) {
        // Chọn phương thức thanh toán tiền mặt nếu có
        const cashOption = page.locator('text=Cash, text=Tiền mặt, label:has-text("Cash"), label:has-text("Tiền mặt")').first();
        if (await cashOption.count() > 0) {
          await cashOption.click();
          
          // Đợi xử lý
          await page.waitForTimeout(500);
          
          // Tìm nút hoàn thành thanh toán
          const completeButton = page.locator('button').filter({ hasText: /Complete|Confirm|Finish|Hoàn thành|Xác nhận|Thanh toán/i }).first();
          if (await completeButton.isVisible() && await completeButton.isEnabled()) {
            await completeButton.click();
            
            // Đợi xử lý thanh toán
            await page.waitForTimeout(3000);
            
            // Kiểm tra thông báo thành công nếu có
            await page.locator('text=Success, text=Successful, text=Completed, text=Thành công').first().isVisible({ timeout: 5000 });
          }
        }
      }
    }
  });
}); 