/**
 * KhoChuan POS - Analytics Routes
 * Provides access to business insights and analytics data
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

// Middleware to check admin/staff permissions
const checkPermissions = async (c, next) => {
  const role = c.get('jwtPayload').role;
  
  if (!['admin', 'staff'].includes(role)) {
    return c.json({
      status: 'error', 
      message: 'Insufficient permissions. Admin or staff role required.' 
    }, 403);
    }

  await next();
};

// ==========================================
// DASHBOARD ROUTES
// ==========================================

// Get dashboard overview
router.get('/dashboard/overview', checkPermissions, async (c) => {
  try {
    const analyticsService = c.get('analyticsService');
    const { period } = c.req.query();
    
    const overview = await analyticsService.getDashboardOverview(period);

    return c.json({
      status: 'success',
      data: overview
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get dashboard overview' 
    }, 400);
  }
});

// ==========================================
// SALES ANALYTICS ROUTES
// ==========================================

// Get sales trends
router.get('/sales/trends', checkPermissions, async (c) => {
  try {
    const analyticsService = c.get('analyticsService');
    const { start_date, end_date, group_by } = c.req.query();

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
    
    const trends = await analyticsService.getSalesTrends({
      start_date,
      end_date,
      group_by
    });

    return c.json({
      status: 'success',
      data: trends
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get sales trends' 
    }, 400);
  }
});

// ==========================================
// CUSTOMER ANALYTICS ROUTES
// ==========================================

// Get customer insights
router.get('/customers/insights', checkPermissions, async (c) => {
  try {
    const analyticsService = c.get('analyticsService');
    const { period } = c.req.query();
    
    const insights = await analyticsService.getCustomerInsights({ period });

    return c.json({
      status: 'success',
      data: insights
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get customer insights' 
    }, 400);
  }
});

// ==========================================
// INVENTORY ANALYTICS ROUTES
// ==========================================

// Get inventory analytics
router.get('/inventory/analytics', checkPermissions, async (c) => {
  try {
    const analyticsService = c.get('analyticsService');
    
    const analytics = await analyticsService.getInventoryAnalytics();

    return c.json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get inventory analytics' 
    }, 400);
  }
});

// ==========================================
// STAFF ANALYTICS ROUTES
// ==========================================

// Get staff performance
router.get('/staff/performance', checkPermissions, async (c) => {
  try {
    const analyticsService = c.get('analyticsService');
    const { period } = c.req.query();
    
    const performance = await analyticsService.getStaffPerformance({ period });

    return c.json({
      status: 'success',
      data: performance
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get staff performance' 
    }, 400);
  }
});

export default router;