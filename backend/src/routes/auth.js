/**
 * KhoChuan POS - Authentication Routes
 * Handles user authentication, registration, and profile management
 */

import { Hono } from 'hono';
import { jwt } from 'hono/jwt';

const router = new Hono();

// Login route
router.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Validate input
    if (!email || !password) {
      return c.json({ 
        status: 'error', 
        message: 'Email and password are required' 
      }, 400);
    }
    
    // Get auth service from context
    const authService = c.get('authService');

    // Authenticate user
    const result = await authService.login(email, password);
    
    return c.json({
      status: 'success',
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Authentication failed' 
    }, 401);
  }
});

// Register route
router.post('/register', async (c) => {
  try {
    const userData = await c.req.json();

    // Validate input
    if (!userData.email || !userData.password || !userData.name) {
      return c.json({ 
        status: 'error', 
        message: 'Email, password, and name are required' 
      }, 400);
    }
    
    // Get auth service from context
    const authService = c.get('authService');

    // Register user
    const user = await authService.register(userData);
    
    return c.json({
      status: 'success',
      message: 'Registration successful',
      data: user
    }, 201);
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Registration failed' 
    }, 400);
  }
});

// JWT middleware for protected routes
const authenticate = jwt({
  secret: (c) => c.env.JWT_SECRET
});
    
// Get current user profile
router.get('/profile', authenticate, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const authService = c.get('authService');
    
    // Get user profile
    const user = await authService.getUserById(userId);
    
    // Get user permissions
    const permissions = await authService.getUserPermissions(user.role);
    
    return c.json({
      status: 'success',
      data: {
        user,
        permissions
      }
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to get profile' 
    }, 400);
  }
});

// Update user profile
router.put('/profile', authenticate, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const userData = await c.req.json();
    const db = c.get('authService').db;
    
    // Remove sensitive fields that shouldn't be updated directly
    const { password, password_hash, role, is_active, ...updateData } = userData;
    
    // Update user
    await db.update('users', userId, {
      ...updateData,
      updated_at: new Date().toISOString()
    });
    
    // Get updated user
    const user = await db.findById('users', userId);
    
    return c.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: c.get('authService').sanitizeUser(user)
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to update profile' 
    }, 400);
  }
});

// Change password
router.post('/change-password', authenticate, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const { currentPassword, newPassword } = await c.req.json();
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return c.json({ 
        status: 'error', 
        message: 'Current password and new password are required' 
      }, 400);
    }
    
    // Change password
    await c.get('authService').changePassword(userId, currentPassword, newPassword);
    
    return c.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      message: error.message || 'Failed to change password' 
    }, 400);
  }
});

// Verify token validity
router.get('/verify', authenticate, async (c) => {
  return c.json({
    status: 'success',
    message: 'Token is valid',
    data: {
      user: {
        id: c.get('jwtPayload').sub,
        email: c.get('jwtPayload').email,
        name: c.get('jwtPayload').name,
        role: c.get('jwtPayload').role
      }
  }
  });
});

export default router;