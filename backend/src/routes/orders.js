/**
 * KhoChuan POS - Order Routes
 * Handles order management and transactions
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
// ORDER ROUTES
// ==========================================

// Get all orders with filtering and pagination
router.get('/', async (c) => {
  try {
    const orderService = c.get('orderService');
    
    // Extract query parameters
    const { 
      customer_id, 
      cashier_id, 
      payment_method,
      order_status,
      date_from,
      date_to,
      search,
      sort_by,
      sort_dir,
      page,
      limit
    } = c.req.query();
    
    // Get orders with filters
    const result = await orderService.getOrders({
      customer_id,
      cashier_id,
      payment_method,
      order_status,
      date_from,
      date_to,
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
      message: error.message || 'Failed to get orders' 
    }, 400);
  }
});

// Get order by ID
router.get('/:id', async (c) => {
  try {
    const orderService = c.get('orderService');
    const id = c.req.param('id');
    
    const order = await orderService.getOrderById(id);
    
    return c.json({
      status: 'success',
      data: order
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get order' 
    }, 404);
  }
});

// Create new order
router.post('/', async (c) => {
  try {
    const orderService = c.get('orderService');
    const orderData = await c.req.json();
    
    // Set cashier ID from authenticated user if not provided
    if (!orderData.cashier_id) {
      orderData.cashier_id = c.get('jwtPayload').sub;
    }
    
    // Validate required fields
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return c.json({ 
        status: 'error', 
        message: 'Order must have at least one item' 
      }, 400);
    }
    
    if (!orderData.subtotal || !orderData.total_amount || !orderData.payment_method) {
      return c.json({ 
        status: 'error', 
        message: 'Subtotal, total amount, and payment method are required' 
      }, 400);
    }
    
    const order = await orderService.createOrder(orderData);
    
    return c.json({
      status: 'success',
      message: 'Order created successfully',
      data: order
    }, 201);
  } catch (error) {
    return c.json({
      status: 'error', 
      message: error.message || 'Failed to create order' 
    }, 400);
  }
});

// Update order status
router.put('/:id/status', async (c) => {
  try {
    const orderService = c.get('orderService');
    const id = c.req.param('id');
    const { status } = await c.req.json();
    const userId = c.get('jwtPayload').sub;
    
    // Validate status
    if (!status) {
      return c.json({
        status: 'error', 
        message: 'Status is required' 
      }, 400);
    }
    
    const order = await orderService.updateOrderStatus(id, status, userId);
    
    return c.json({
      status: 'success',
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    return c.json({
      status: 'error', 
      message: error.message || 'Failed to update order status' 
    }, 400);
  }
});

// Process order refund
router.post('/:id/refund', async (c) => {
  try {
    const orderService = c.get('orderService');
    const id = c.req.param('id');
    const refundData = await c.req.json();
    
    // Set user ID from authenticated user
    refundData.user_id = c.get('jwtPayload').sub;
    
    const order = await orderService.refundOrder(id, refundData);
    
    return c.json({
      status: 'success',
      message: 'Order refunded successfully',
      data: order
    });
  } catch (error) {
    return c.json({
      status: 'error', 
      message: error.message || 'Failed to refund order' 
    }, 400);
  }
});

// ==========================================
// SALES REPORTS
// ==========================================

// Get daily sales summary
router.get('/reports/daily/:date', async (c) => {
  try {
    const orderService = c.get('orderService');
    const date = c.req.param('date');
    
    // Validate date format (YYYY-MM-DD)
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return c.json({
        status: 'error', 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      }, 400);
    }
    
    const summary = await orderService.getDailySalesSummary(date);
    
        return c.json({
      status: 'success',
      data: summary
    });
  } catch (error) {
      return c.json({
      status: 'error', 
      message: error.message || 'Failed to get daily sales summary' 
    }, 400);
  }
});

// Get sales report
router.get('/reports/sales', async (c) => {
  try {
    const orderService = c.get('orderService');
    const { 
      start_date, 
      end_date, 
      group_by, 
      cashier_id 
    } = c.req.query();
    
    // Validate required parameters
    if (!start_date || !end_date) {
      return c.json({
        status: 'error', 
        message: 'Start date and end date are required' 
      }, 400);
    }
    
    // Validate date formats (YYYY-MM-DD)
    if (!start_date.match(/^\d{4}-\d{2}-\d{2}$/) || !end_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return c.json({
        status: 'error', 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      }, 400);
    }
    
    const report = await orderService.getSalesReport({
      start_date,
      end_date,
      group_by,
      cashier_id
    });
    
    return c.json({
      status: 'success',
      data: report
    });
  } catch (error) {
      return c.json({
      status: 'error', 
      message: error.message || 'Failed to get sales report' 
    }, 400);
  }
});

export default router;