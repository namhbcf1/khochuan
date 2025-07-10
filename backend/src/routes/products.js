/**
 * KhoChuan POS - Product Routes
 * Handles products, categories, and inventory operations
 */

import { Hono } from 'hono';
import { jwt } from 'hono/jwt';

const router = new Hono();

// JWT middleware for protected routes
const authenticate = jwt({
  secret: (c) => c.env.JWT_SECRET
});

// Apply authentication to all routes
router.use('*', authenticate);

// ==========================================
// PRODUCT ROUTES
// ==========================================

// Get all products
router.get('/', async (c) => {
  try {
    const productService = c.get('productService');
    
    // Extract query parameters
    const { 
      category_id, 
      is_active, 
      search, 
      sort_by, 
      sort_dir,
      page,
      limit
    } = c.req.query();
    
    // Parse boolean parameter
    const parsedIsActive = is_active !== undefined 
      ? is_active === 'true' || is_active === '1'
      : undefined;
    
    // Get products with filters
    const result = await productService.getProducts({
      category_id,
      is_active: parsedIsActive,
      search,
      sort_by,
      sort_dir,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    return c.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get products' 
    }, 400);
  }
});

// Get product by ID
router.get('/:id', async (c) => {
  try {
    const productService = c.get('productService');
    const id = c.req.param('id');
    
    const product = await productService.getProductById(id);
    
    return c.json({
      status: 'success',
      data: product
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get product' 
    }, 404);
  }
});

// Get product by barcode
router.get('/barcode/:barcode', async (c) => {
  try {
    const productService = c.get('productService');
    const barcode = c.req.param('barcode');
    
    const product = await productService.getProductByBarcode(barcode);
    
    return c.json({
      status: 'success',
      data: product
    });
  } catch (error) {
    return c.json({
      status: 'error', 
      message: error.message || 'Failed to get product' 
    }, 404);
  }
});

// Create new product
router.post('/', async (c) => {
  try {
    const productService = c.get('productService');
    const productData = await c.req.json();
    
    // Validate required fields
    if (!productData.name || !productData.price) {
      return c.json({
        status: 'error', 
        message: 'Name and price are required' 
      }, 400);
    }
    
    const product = await productService.createProduct(productData);
    
    return c.json({
      status: 'success',
      message: 'Product created successfully',
      data: product
    }, 201);
  } catch (error) {
    return c.json({
      status: 'error', 
      message: error.message || 'Failed to create product' 
    }, 400);
  }
});

// Update product
router.put('/:id', async (c) => {
  try {
    const productService = c.get('productService');
    const id = c.req.param('id');
    const productData = await c.req.json();
    
    const product = await productService.updateProduct(id, productData);
    
    return c.json({
      status: 'success',
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    return c.json({
      status: 'error', 
      message: error.message || 'Failed to update product' 
    }, 400);
  }
});

// Delete product
router.delete('/:id', async (c) => {
  try {
    const productService = c.get('productService');
    const id = c.req.param('id');
    
    await productService.deleteProduct(id);
    
    return c.json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    return c.json({
      status: 'error', 
      message: error.message || 'Failed to delete product' 
    }, 400);
  }
});

// Update product stock
router.post('/:id/stock', async (c) => {
  try {
    const productService = c.get('productService');
    const id = c.req.param('id');
    const { quantity, reason } = await c.req.json();
    const userId = c.get('jwtPayload').sub;
    
    // Validate quantity
    if (quantity === undefined || isNaN(quantity)) {
      return c.json({
        status: 'error', 
        message: 'Valid quantity is required' 
      }, 400);
    }
    
    const product = await productService.updateStock(id, quantity, userId, reason);
    
      return c.json({
      status: 'success',
      message: 'Stock updated successfully',
      data: product
    });
  } catch (error) {
        return c.json({
      status: 'error', 
      message: error.message || 'Failed to update stock' 
    }, 400);
  }
});

// Get low stock products
router.get('/stock/low', async (c) => {
  try {
    const productService = c.get('productService');
    
    const products = await productService.getLowStockProducts();
    
    return c.json({
      status: 'success',
      data: products
    });
  } catch (error) {
      return c.json({
      status: 'error', 
      message: error.message || 'Failed to get low stock products' 
    }, 400);
  }
});

// Get inventory logs for a product
router.get('/:id/inventory-logs', async (c) => {
  try {
    const productService = c.get('productService');
    const id = c.req.param('id');
    const { page, limit } = c.req.query();
    
    const logs = await productService.getInventoryLogs(id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    return c.json({
      status: 'success',
      data: logs
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get inventory logs' 
    }, 400);
  }
});

// ==========================================
// CATEGORY ROUTES
// ==========================================

// Get all categories
router.get('/categories/all', async (c) => {
  try {
    const productService = c.get('productService');
    
    const categories = await productService.getCategories();
    
    return c.json({
      status: 'success',
      data: categories
    });
  } catch (error) {
      return c.json({
      status: 'error', 
      message: error.message || 'Failed to get categories' 
    }, 400);
  }
});

// Create new category
router.post('/categories', async (c) => {
  try {
    const productService = c.get('productService');
    const categoryData = await c.req.json();
    
    // Validate required fields
    if (!categoryData.name) {
      return c.json({
        status: 'error', 
        message: 'Name is required' 
      }, 400);
    }
    
    const category = await productService.createCategory(categoryData);
    
    return c.json({
      status: 'success',
      message: 'Category created successfully',
      data: category
    }, 201);
  } catch (error) {
      return c.json({
      status: 'error', 
      message: error.message || 'Failed to create category' 
    }, 400);
  }
});

// Update category
router.put('/categories/:id', async (c) => {
  try {
    const productService = c.get('productService');
    const id = c.req.param('id');
    const categoryData = await c.req.json();
    
    const category = await productService.updateCategory(id, categoryData);
    
    return c.json({
      status: 'success',
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
      return c.json({
      status: 'error', 
      message: error.message || 'Failed to update category' 
    }, 400);
  }
});

// Delete category
router.delete('/categories/:id', async (c) => {
  try {
    const productService = c.get('productService');
    const id = c.req.param('id');
    
    await productService.deleteCategory(id);
    
    return c.json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    return c.json({
      status: 'error', 
      message: error.message || 'Failed to delete category' 
    }, 400);
  }
});

export default router;