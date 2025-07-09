/**
 * ============================================================================
 * AUTHENTICATION ROUTES
 * ============================================================================
 * Handles user authentication, registration, and profile management
 */

import { Router } from 'itty-router';
import { createJWT, verifyJWT } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/encryption.js';
import { corsHeaders } from '../utils/cors.js';
import { validateRequest } from '../utils/validators.js';

const router = Router();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate JWT tokens for user
 */
async function generateTokens(user, env) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    permissions: getPermissionsByRole(user.role)
  };

  const accessToken = await createJWT(payload, env.JWT_SECRET || 'default-secret-key', 15 * 60); // 15 minutes
  const refreshToken = await createJWT(payload, env.JWT_SECRET || 'default-secret-key', 7 * 24 * 60 * 60); // 7 days

  return { accessToken, refreshToken };
}

/**
 * Get permissions based on user role
 */
function getPermissionsByRole(role) {
  const permissions = {
    admin: ['*'], // All permissions
    cashier: ['pos.create', 'pos.read', 'customers.read', 'customers.create', 'products.read'],
    staff: ['pos.read', 'customers.read', 'products.read', 'gamification.read']
  };

  return permissions[role] || [];
}

/**
 * Generate unique order number
 */
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}-${random}`;
}

/**
 * Generate UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * POST /api/auth/login
 * User login endpoint
 */
router.post('/api/auth/login', async (request, env, ctx) => {
  try {
    const body = await request.json();

    // Validate request data
    const validation = validateRequest(body, schemas.login);
    if (!validation.isValid) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validation.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { email, password } = validation.sanitized;

    // Find user by email
    const user = await request.db.getUserByEmail(email);

    if (!user) {
      return new Response(JSON.stringify({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return new Response(JSON.stringify({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user, env);

    // Update last login
    await request.db.updateUserLastLogin(user.id);

    // Log login activity
    await request.db.logActivity({
      user_id: user.id,
      action: 'login',
      entity_type: 'auth',
      entity_id: user.id,
      new_values: {
        ip: request.headers.get('CF-Connecting-IP'),
        userAgent: request.headers.get('User-Agent')
      },
      ip_address: request.headers.get('CF-Connecting-IP'),
      user_agent: request.headers.get('User-Agent')
    });

    // Return user data without password
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatar_url: user.avatar_url,
      last_login: user.last_login
    };

    return new Response(JSON.stringify({
      success: true,
      message: 'Login successful',
      user: userData,
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 // 15 minutes
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

/**
 * POST /api/auth/register
 * User registration endpoint (Admin only in production)
 */
router.post('/api/auth/register', async (request, env, ctx) => {
  try {
    const body = await request.json();

    // Validate request data
    const validation = validateRequest(body, schemas.register);
    if (!validation.isValid) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validation.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { name, email, password, role, phone } = validation.sanitized;

    // Check if user already exists
    const existingUser = await request.db.getUserByEmail(email);

    if (existingUser) {
      return new Response(JSON.stringify({
        error: 'User already exists',
        code: 'USER_EXISTS'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = generateUUID();
    const userData = {
      id: userId,
      email,
      password_hash: passwordHash,
      name,
      role: role || 'staff',
      phone: phone || null
    };

    await request.db.createUser(userData);

    // Initialize staff stats
    await request.db.execute(`
      INSERT INTO staff_stats (id, user_id, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `, [generateUUID(), userId]);

    // Log registration activity
    await request.db.logActivity({
      user_id: userId,
      action: 'register',
      entity_type: 'user',
      entity_id: userId,
      new_values: {
        role: userData.role,
        email: userData.email
      },
      ip_address: request.headers.get('CF-Connecting-IP'),
      user_agent: request.headers.get('User-Agent')
    });

    // Get created user (without password)
    const newUser = await request.db.getUserById(userId);

    return new Response(JSON.stringify({
      success: true,
      message: 'User registered successfully',
      user: newUser
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/api/auth/refresh', async (request, env, ctx) => {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return new Response(JSON.stringify({
        error: 'Refresh token required',
        code: 'TOKEN_REQUIRED'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Verify refresh token
    const payload = await verifyJWT(refreshToken, env.JWT_SECRET || 'default-secret-key');

    if (!payload) {
      return new Response(JSON.stringify({
        error: 'Invalid refresh token',
        code: 'INVALID_TOKEN'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Check if user still exists and is active
    const user = await request.db.getUserById(payload.userId);

    if (!user) {
      return new Response(JSON.stringify({
        error: 'Invalid refresh token',
        code: 'INVALID_TOKEN'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user, env);

    return new Response(JSON.stringify({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60 // 15 minutes
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return new Response(JSON.stringify({
      error: 'Invalid refresh token',
      code: 'INVALID_TOKEN'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

/**
 * POST /api/auth/logout
 * User logout endpoint
 */
router.post('/api/auth/logout', async (request, env, ctx) => {
  try {
    const authHeader = request.headers.get('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = await verifyJWT(token, env.JWT_SECRET || 'default-secret-key');

      if (payload) {
        // Log logout activity
        await request.db.logActivity({
          user_id: payload.userId,
          action: 'logout',
          entity_type: 'auth',
          entity_id: payload.userId,
          ip_address: request.headers.get('CF-Connecting-IP'),
          user_agent: request.headers.get('User-Agent')
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    // Even if token verification fails, we consider logout successful
    return new Response(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// ============================================================================
// EXPORT ROUTER
// ============================================================================

export default router;

// ==========================================
// PROTECTED ROUTES (Require authentication)
// ==========================================

// GET /api/auth/me
router.get('/me', async (request, env, ctx) => {
  try {
    const user = c.get('user') // Set by auth middleware
    
    // Get user with stats
    const userWithStats = await c.env.DB.prepare(`
      SELECT 
        u.id, u.email, u.name, u.role, u.phone, u.avatar_url, u.last_login,
        s.total_sales, s.total_orders, s.total_points, s.level, s.current_streak
      FROM users u
      LEFT JOIN staff_stats s ON u.id = s.user_id
      WHERE u.id = ? AND u.is_active = 1
    `).bind(user.id).first()
    
    if (!userWithStats) {
      return c.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, 404)
    }
    
    return c.json({
      success: true,
      user: userWithStats
    })
    
  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, 500)
  }
})

// PUT /api/auth/profile
router.put('/profile', async (request, env, ctx) => {
  try {
    const user = c.get('user')
    const { name, phone } = await c.req.json()
    
    // Validate input
    if (!name || name.trim().length < 2) {
      return c.json({ 
        error: 'Name must be at least 2 characters',
        code: 'VALIDATION_ERROR'
      }, 400)
    }
    
    // Update user profile
    await c.env.DB.prepare(`
      UPDATE users 
      SET name = ?, phone = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(name.trim(), phone || null, user.id).run()
    
    // Log profile update
    await logActivity(c.env.DB, user.id, 'profile_update', {
      changes: { name, phone }
    })
    
    // Get updated user
    const updatedUser = await c.env.DB.prepare(`
      SELECT id, email, name, role, phone, avatar_url FROM users WHERE id = ?
    `).bind(user.id).first()
    
    return c.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    })
    
  } catch (error) {
    console.error('Profile update error:', error)
    return c.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, 500)
  }
})

// PUT /api/auth/change-password
router.put('/change-password', async (request, env, ctx) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const validatedData = changePasswordSchema.parse(body)
    
    // Get current user with password
    const currentUser = await c.env.DB.prepare(`
      SELECT password_hash FROM users WHERE id = ?
    `).bind(user.id).first()
    
    if (!currentUser) {
      return c.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, 404)
    }
    
    // Verify current password
    const isValidPassword = await verifyPassword(
      validatedData.currentPassword, 
      currentUser.password_hash
    )
    
    if (!isValidPassword) {
      return c.json({ 
        error: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      }, 400)
    }
    
    // Hash new password
    const newPasswordHash = await hashPassword(validatedData.newPassword)
    
    // Update password
    await c.env.DB.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(newPasswordHash, user.id).run()
    
    // Invalidate all refresh tokens for this user
    await c.env.SESSIONS.delete(`refresh_${user.id}`)
    
    // Log password change
    await logActivity(c.env.DB, user.id, 'password_change')
    
    return c.json({
      success: true,
      message: 'Password changed successfully'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        details: error.errors
      }, 400)
    }
    
    console.error('Password change error:', error)
    return c.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, 500)
  }
})

