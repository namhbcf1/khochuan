/**
 * KhoChuan POS - Customer Routes
 * Handles customer management, loyalty points, and warranties
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
// CUSTOMER ROUTES
// ==========================================

// Get all customers (admin, staff, cashier)
router.get('/', async (c) => {
  try {
    const customerService = c.get('customerService');
    
    // Extract query parameters
    const { search, sort_by, sort_dir, page, limit } = c.req.query();
    
    // Get customers with filters
    const result = await customerService.getCustomers({
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
      message: error.message || 'Failed to get customers' 
    }, 400);
  }
});

// Get customer by ID
router.get('/:id', async (c) => {
  try {
    const customerService = c.get('customerService');
    const id = c.req.param('id');
    
    const customer = await customerService.getCustomerById(id);
    
    return c.json({
      status: 'success',
      data: customer
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get customer' 
    }, 404);
  }
});

// Get current customer profile (for customer role)
router.get('/profile/me', async (c) => {
  try {
    const customerService = c.get('customerService');
    const userId = c.get('jwtPayload').sub;
    
    // Check if user is a customer
    const role = c.get('jwtPayload').role;
    if (role !== 'customer') {
      return c.json({ 
        status: 'error', 
        message: 'Only customers can access this endpoint' 
      }, 403);
    }
    
    const customer = await customerService.getCustomerByUserId(userId);
    
    return c.json({
      status: 'success',
      data: customer
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get customer profile' 
    }, 404);
  }
});

// Create new customer
router.post('/', async (c) => {
  try {
    const customerService = c.get('customerService');
    const customerData = await c.req.json();
    
    // Validate required fields
    if (!customerData.name) {
      return c.json({ 
        status: 'error', 
        message: 'Name is required' 
      }, 400);
    }
    
    const customer = await customerService.createCustomer(customerData);
    
    return c.json({
      status: 'success',
      message: 'Customer created successfully',
      data: customer
    }, 201);
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to create customer' 
    }, 400);
  }
});

// Update customer
router.put('/:id', async (c) => {
  try {
    const customerService = c.get('customerService');
    const id = c.req.param('id');
    const customerData = await c.req.json();
    
    const customer = await customerService.updateCustomer(id, customerData);
    
    return c.json({
      status: 'success',
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    return c.json({
      status: 'error', 
      message: error.message || 'Failed to update customer' 
    }, 400);
  }
});

// Update current customer profile (for customer role)
router.put('/profile/me', async (c) => {
  try {
    const customerService = c.get('customerService');
    const userId = c.get('jwtPayload').sub;
    const customerData = await c.req.json();
    
    // Check if user is a customer
    const role = c.get('jwtPayload').role;
    if (role !== 'customer') {
      return c.json({
        status: 'error', 
        message: 'Only customers can access this endpoint' 
      }, 403);
    }
    
    // Get customer by user ID
    const customer = await customerService.getCustomerByUserId(userId);
    
    // Update customer
    const updatedCustomer = await customerService.updateCustomer(customer.id, customerData);
    
    return c.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: updatedCustomer
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to update profile' 
    }, 400);
  }
});

// Delete customer
router.delete('/:id', async (c) => {
  try {
    const customerService = c.get('customerService');
    const id = c.req.param('id');
    
    await customerService.deleteCustomer(id);
    
    return c.json({
      status: 'success',
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to delete customer' 
    }, 400);
  }
});

// Get customer orders
router.get('/:id/orders', async (c) => {
  try {
    const customerService = c.get('customerService');
    const id = c.req.param('id');
    const { page, limit } = c.req.query();
    
    const orders = await customerService.getCustomerOrders(id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    return c.json({
      status: 'success',
      data: orders
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get customer orders' 
    }, 400);
  }
});

// Get current customer orders (for customer role)
router.get('/profile/me/orders', async (c) => {
  try {
    const customerService = c.get('customerService');
    const userId = c.get('jwtPayload').sub;
    const { page, limit } = c.req.query();
    
    // Check if user is a customer
    const role = c.get('jwtPayload').role;
    if (role !== 'customer') {
      return c.json({ 
        status: 'error', 
        message: 'Only customers can access this endpoint' 
      }, 403);
    }
    
    // Get customer by user ID
    const customer = await customerService.getCustomerByUserId(userId);
    
    const orders = await customerService.getCustomerOrders(customer.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    return c.json({
      status: 'success',
      data: orders
    });
  } catch (error) {
    return c.json({
      status: 'error', 
      message: error.message || 'Failed to get orders' 
    }, 400);
  }
});

// ==========================================
// LOYALTY ROUTES
// ==========================================

// Get customer loyalty transactions
router.get('/:id/loyalty', async (c) => {
  try {
    const customerService = c.get('customerService');
    const id = c.req.param('id');
    const { page, limit } = c.req.query();
    
    const transactions = await customerService.getLoyaltyTransactions(id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    return c.json({
      status: 'success',
      data: transactions
    });
  } catch (error) {
        return c.json({
      status: 'error', 
      message: error.message || 'Failed to get loyalty transactions' 
    }, 400);
      }
});

// Get current customer loyalty transactions (for customer role)
router.get('/profile/me/loyalty', async (c) => {
  try {
    const customerService = c.get('customerService');
    const userId = c.get('jwtPayload').sub;
    const { page, limit } = c.req.query();
    
    // Check if user is a customer
    const role = c.get('jwtPayload').role;
    if (role !== 'customer') {
        return c.json({
        status: 'error', 
        message: 'Only customers can access this endpoint' 
      }, 403);
    }
    
    // Get customer by user ID
    const customer = await customerService.getCustomerByUserId(userId);
    
    const transactions = await customerService.getLoyaltyTransactions(customer.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    return c.json({
      status: 'success',
      data: transactions
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get loyalty transactions' 
    }, 400);
  }
});

// Add loyalty points to customer (admin, cashier)
router.post('/:id/loyalty/add', async (c) => {
  try {
    const customerService = c.get('customerService');
    const id = c.req.param('id');
    const { points, reason, reference_id } = await c.req.json();
    
    // Validate points
    if (!points || isNaN(points) || points <= 0) {
      return c.json({ 
        status: 'error', 
        message: 'Valid positive points value is required' 
      }, 400);
    }
    
    const customer = await customerService.addLoyaltyPoints(
      id, 
      points, 
      reason || 'Manual adjustment', 
      reference_id
    );
    
    return c.json({
      status: 'success',
      message: 'Loyalty points added successfully',
      data: customer
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to add loyalty points' 
    }, 400);
  }
});

// Redeem loyalty points (admin, cashier, customer)
router.post('/:id/loyalty/redeem', async (c) => {
  try {
    const customerService = c.get('customerService');
    const id = c.req.param('id');
    const { points, reason, reference_id } = await c.req.json();
    
    // Validate points
    if (!points || isNaN(points) || points <= 0) {
      return c.json({
        status: 'error', 
        message: 'Valid positive points value is required' 
      }, 400);
    }
    
    const customer = await customerService.redeemLoyaltyPoints(
      id, 
      points, 
      reason || 'Points redemption', 
      reference_id
    );
    
    return c.json({
      status: 'success',
      message: 'Loyalty points redeemed successfully',
      data: customer
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to redeem loyalty points' 
    }, 400);
  }
});

// Redeem current customer loyalty points (for customer role)
router.post('/profile/me/loyalty/redeem', async (c) => {
  try {
    const customerService = c.get('customerService');
    const userId = c.get('jwtPayload').sub;
    const { points, reason } = await c.req.json();
    
    // Check if user is a customer
    const role = c.get('jwtPayload').role;
    if (role !== 'customer') {
      return c.json({
        status: 'error', 
        message: 'Only customers can access this endpoint' 
      }, 403);
    }
    
    // Validate points
    if (!points || isNaN(points) || points <= 0) {
        return c.json({
        status: 'error', 
        message: 'Valid positive points value is required' 
      }, 400);
    }
    
    // Get customer by user ID
    const customer = await customerService.getCustomerByUserId(userId);
    
    const updatedCustomer = await customerService.redeemLoyaltyPoints(
      customer.id, 
      points, 
      reason || 'Points redemption by customer'
    );
    
    return c.json({
      status: 'success',
      message: 'Loyalty points redeemed successfully',
      data: updatedCustomer
    });
  } catch (error) {
      return c.json({
      status: 'error', 
      message: error.message || 'Failed to redeem loyalty points' 
    }, 400);
  }
});

// ==========================================
// WARRANTY ROUTES
// ==========================================

// Get customer warranties
router.get('/:id/warranties', async (c) => {
  try {
    const customerService = c.get('customerService');
    const id = c.req.param('id');
    const { page, limit, status } = c.req.query();
    
    const warranties = await customerService.getCustomerWarranties(id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status
    });
    
    return c.json({
      status: 'success',
      data: warranties
    });
  } catch (error) {
      return c.json({
      status: 'error', 
      message: error.message || 'Failed to get warranties' 
    }, 400);
  }
});

// Get current customer warranties (for customer role)
router.get('/profile/me/warranties', async (c) => {
  try {
    const customerService = c.get('customerService');
    const userId = c.get('jwtPayload').sub;
    const { page, limit, status } = c.req.query();
    
    // Check if user is a customer
    const role = c.get('jwtPayload').role;
    if (role !== 'customer') {
        return c.json({
        status: 'error', 
        message: 'Only customers can access this endpoint' 
      }, 403);
    }
    
    // Get customer by user ID
    const customer = await customerService.getCustomerByUserId(userId);
    
    const warranties = await customerService.getCustomerWarranties(customer.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status
    });
    
    return c.json({
      status: 'success',
      data: warranties
    });
  } catch (error) {
      return c.json({
      status: 'error', 
      message: error.message || 'Failed to get warranties' 
    }, 400);
  }
});

// Register warranty for customer
router.post('/:id/warranties', async (c) => {
  try {
    const customerService = c.get('customerService');
    const id = c.req.param('id');
    const warrantyData = await c.req.json();
    
    // Set customer ID
    warrantyData.customer_id = id;
    
    // Validate required fields
    if (!warrantyData.product_id || !warrantyData.expiry_date) {
      return c.json({ 
        status: 'error', 
        message: 'Product ID and expiry date are required' 
      }, 400);
    }
    
    const warranty = await customerService.registerWarranty(warrantyData);
    
    return c.json({
      status: 'success',
      message: 'Warranty registered successfully',
      data: warranty
    }, 201);
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to register warranty' 
    }, 400);
  }
});

// Submit warranty claim
router.post('/warranties/:warranty_id/claims', async (c) => {
  try {
    const customerService = c.get('customerService');
    const warranty_id = c.req.param('warranty_id');
    const { issue_description } = await c.req.json();
    
    // Validate required fields
    if (!issue_description) {
      return c.json({
        status: 'error', 
        message: 'Issue description is required' 
      }, 400);
    }
    
    const claim = await customerService.submitWarrantyClaim({
      warranty_id,
      issue_description
    });
    
    return c.json({
      status: 'success',
      message: 'Warranty claim submitted successfully',
      data: claim
    }, 201);
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to submit warranty claim' 
    }, 400);
  }
});

// Get customer warranty claims
router.get('/:id/warranty-claims', async (c) => {
  try {
    const customerService = c.get('customerService');
    const id = c.req.param('id');
    const { page, limit, status } = c.req.query();
    
    const claims = await customerService.getCustomerWarrantyClaims(id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status
    });
    
    return c.json({
      status: 'success',
      data: claims
    });
  } catch (error) {
      return c.json({
      status: 'error', 
      message: error.message || 'Failed to get warranty claims' 
    }, 400);
  }
});

// Get current customer warranty claims (for customer role)
router.get('/profile/me/warranty-claims', async (c) => {
  try {
    const customerService = c.get('customerService');
    const userId = c.get('jwtPayload').sub;
    const { page, limit, status } = c.req.query();
    
    // Check if user is a customer
    const role = c.get('jwtPayload').role;
    if (role !== 'customer') {
      return c.json({
        status: 'error', 
        message: 'Only customers can access this endpoint' 
      }, 403);
    }
    
    // Get customer by user ID
    const customer = await customerService.getCustomerByUserId(userId);
    
    const claims = await customerService.getCustomerWarrantyClaims(customer.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status
    });
    
    return c.json({
      status: 'success',
      data: claims
    });
  } catch (error) {
    return c.json({
      status: 'error', 
      message: error.message || 'Failed to get warranty claims' 
    }, 400);
  }
});

export default router;