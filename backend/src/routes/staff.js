/**
 * KhoChuan POS - Staff Routes
 * Handles staff management and gamification features
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
// STAFF MANAGEMENT ROUTES
// ==========================================

// Get all staff members (admin only)
router.get('/', async (c) => {
  try {
    // Check if user has admin role
    const role = c.get('jwtPayload').role;
    if (role !== 'admin' && role !== 'manager') {
      return c.json({ 
        status: 'error', 
        message: 'Access denied. Admin or manager role required.' 
      }, 403);
    }
    
    // Extract query parameters
    const { search, sort_by, sort_dir, page, limit } = c.req.query();
    
    // Get staff service
    const authService = c.get('authService');
    
    // Get staff with filters
    const result = await authService.getUsers({
      role: ['staff', 'cashier'],
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
      message: error.message || 'Failed to get staff members' 
    }, 400);
  }
});

// Get staff member by ID
router.get('/:id', async (c) => {
  try {
    // Check if user has admin role
    const role = c.get('jwtPayload').role;
    if (role !== 'admin' && role !== 'manager') {
      return c.json({ 
        status: 'error', 
        message: 'Access denied. Admin or manager role required.' 
      }, 403);
    }
    
    const id = c.req.param('id');
    const authService = c.get('authService');
    
    // Get staff member
    const user = await authService.getUserById(id);
    
    // Check if user is staff or cashier
    if (user.role !== 'staff' && user.role !== 'cashier') {
      return c.json({ 
        status: 'error', 
        message: 'User is not a staff member' 
      }, 400);
    }
    
    return c.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get staff member' 
    }, 404);
  }
});

// Create new staff member
router.post('/', async (c) => {
  try {
    // Check if user has admin role
    const role = c.get('jwtPayload').role;
    if (role !== 'admin' && role !== 'manager') {
      return c.json({ 
        status: 'error', 
        message: 'Access denied. Admin or manager role required.' 
      }, 403);
    }
    
    const userData = await c.req.json();
    const authService = c.get('authService');
    
    // Validate required fields
    if (!userData.name || !userData.email || !userData.password || !userData.role) {
      return c.json({ 
        status: 'error', 
        message: 'Name, email, password, and role are required' 
      }, 400);
    }
    
    // Check if role is valid
    if (userData.role !== 'staff' && userData.role !== 'cashier') {
      return c.json({ 
        status: 'error', 
        message: 'Role must be either staff or cashier' 
      }, 400);
    }
    
    // Create staff member
    const user = await authService.createUser(userData);
    
    // Initialize gamification stats for new staff
    const gamificationService = c.get('gamificationService');
    await gamificationService.getStaffStats(user.id);
    
    return c.json({
      status: 'success',
      message: 'Staff member created successfully',
      data: user
    }, 201);
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to create staff member' 
    }, 400);
  }
});

// Update staff member
router.put('/:id', async (c) => {
  try {
    // Check if user has admin role
    const role = c.get('jwtPayload').role;
    if (role !== 'admin' && role !== 'manager') {
      return c.json({ 
        status: 'error', 
        message: 'Access denied. Admin or manager role required.' 
      }, 403);
    }
    
    const id = c.req.param('id');
    const userData = await c.req.json();
    const authService = c.get('authService');
    
    // Get staff member
    const user = await authService.getUserById(id);
    
    // Check if user is staff or cashier
    if (user.role !== 'staff' && user.role !== 'cashier') {
      return c.json({ 
        status: 'error', 
        message: 'User is not a staff member' 
      }, 400);
    }
    
    // Update staff member
    const updatedUser = await authService.updateUser(id, userData);
    
    return c.json({
      status: 'success',
      message: 'Staff member updated successfully',
      data: updatedUser
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to update staff member' 
    }, 400);
  }
});

// Delete staff member
router.delete('/:id', async (c) => {
  try {
    // Check if user has admin role
    const role = c.get('jwtPayload').role;
    if (role !== 'admin' && role !== 'manager') {
      return c.json({ 
        status: 'error', 
        message: 'Access denied. Admin or manager role required.' 
      }, 403);
    }
    
    const id = c.req.param('id');
    const authService = c.get('authService');
    
    // Get staff member
    const user = await authService.getUserById(id);
    
    // Check if user is staff or cashier
    if (user.role !== 'staff' && user.role !== 'cashier') {
      return c.json({ 
        status: 'error', 
        message: 'User is not a staff member' 
      }, 400);
    }
    
    // Delete staff member
    await authService.deactivateUser(id);
    
    return c.json({
      status: 'success',
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to delete staff member' 
    }, 400);
  }
});

// ==========================================
// GAMIFICATION ROUTES
// ==========================================

// Get staff stats
router.get('/:id/stats', async (c) => {
  try {
    const id = c.req.param('id');
    const loggedInUserId = c.get('jwtPayload').sub;
    const userRole = c.get('jwtPayload').role;
    
    // Check permissions - either the user themselves, or admin/manager
    if (id !== loggedInUserId && userRole !== 'admin' && userRole !== 'manager') {
      return c.json({ 
        status: 'error', 
        message: 'Access denied. You can only view your own stats.' 
      }, 403);
    }
    
    const gamificationService = c.get('gamificationService');
    const stats = await gamificationService.getStaffStats(id);
    
    return c.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get staff stats' 
    }, 400);
  }
});

// Get current user's stats (staff/cashier)
router.get('/me/stats', async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const role = c.get('jwtPayload').role;
    
    // Check if user is staff or cashier
    if (role !== 'staff' && role !== 'cashier') {
      return c.json({ 
        status: 'error', 
        message: 'Only staff or cashier can access this endpoint' 
      }, 403);
    }
    
    const gamificationService = c.get('gamificationService');
    const stats = await gamificationService.getStaffStats(userId);
    
    return c.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get staff stats' 
    }, 400);
  }
});

// Award points to staff (admin only)
router.post('/:id/points', async (c) => {
  try {
    // Check if user has admin role
    const role = c.get('jwtPayload').role;
    if (role !== 'admin' && role !== 'manager') {
      return c.json({ 
        status: 'error', 
        message: 'Access denied. Admin or manager role required.' 
      }, 403);
    }
    
    const id = c.req.param('id');
    const { points, reason, referenceId } = await c.req.json();
    
    // Validate required fields
    if (!points || !reason) {
      return c.json({ 
        status: 'error', 
        message: 'Points and reason are required' 
      }, 400);
    }
    
    // Validate points is a number
    if (isNaN(points)) {
      return c.json({ 
        status: 'error', 
        message: 'Points must be a number' 
      }, 400);
    }
    
    const gamificationService = c.get('gamificationService');
    const updatedStats = await gamificationService.awardPoints(id, points, reason, referenceId);
    
    return c.json({
      status: 'success',
      message: 'Points awarded successfully',
      data: updatedStats
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to award points' 
    }, 400);
  }
});

// Get all badges
router.get('/badges', async (c) => {
  try {
    const gamificationService = c.get('gamificationService');
    const badges = await gamificationService.getBadges();
    
    return c.json({
      status: 'success',
      data: badges
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get badges' 
    }, 400);
  }
});

// Get all challenges
router.get('/challenges', async (c) => {
  try {
    const gamificationService = c.get('gamificationService');
    const challenges = await gamificationService.getChallenges();
    
    return c.json({
      status: 'success',
      data: challenges
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get challenges' 
    }, 400);
  }
});

// Create new challenge (admin only)
router.post('/challenges', async (c) => {
  try {
    // Check if user has admin role
    const role = c.get('jwtPayload').role;
    if (role !== 'admin' && role !== 'manager') {
      return c.json({ 
        status: 'error', 
        message: 'Access denied. Admin or manager role required.' 
      }, 403);
    }
    
    const challengeData = await c.req.json();
    const gamificationService = c.get('gamificationService');
    
    // Validate required fields
    if (!challengeData.name || !challengeData.description || !challengeData.target_value || 
        !challengeData.action_type || !challengeData.reward_points) {
      return c.json({ 
        status: 'error', 
        message: 'Name, description, target_value, action_type, and reward_points are required' 
      }, 400);
    }
    
    // Create challenge
    const challenge = await gamificationService.createChallenge(challengeData);
    
    return c.json({
      status: 'success',
      message: 'Challenge created successfully',
      data: challenge
    }, 201);
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to create challenge' 
    }, 400);
  }
});

// Get leaderboard
router.get('/leaderboard', async (c) => {
  try {
    // Extract query parameters
    const { metric = 'total_points', limit = '10' } = c.req.query();
    
    // Validate metric
    const validMetrics = ['total_points', 'total_sales', 'total_orders', 'commission_earned'];
    if (!validMetrics.includes(metric)) {
      return c.json({ 
        status: 'error', 
        message: 'Invalid metric. Valid metrics: ' + validMetrics.join(', ') 
      }, 400);
    }
    
    // Get leaderboard from staff_stats table
    const query = `
      SELECT ss.*, u.name, u.email, u.avatar_url
      FROM staff_stats ss
      JOIN users u ON ss.user_id = u.id
      WHERE u.is_active = 1 AND u.role IN ('staff', 'cashier')
      ORDER BY ss.${metric} DESC
      LIMIT ?
    `;
    
    const db = c.get('db');
    const result = await db.query(query, [parseInt(limit)]);
    
    return c.json({
      status: 'success',
      data: result.results || []
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get leaderboard' 
    }, 400);
  }
});

export default router;