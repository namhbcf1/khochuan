/**
 * ============================================================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================================================
 * Handles JWT token validation, user authentication, and role-based access
 */

import { corsHeaders } from '../utils/cors.js';
import { verifyJWT } from '../utils/jwt.js';

/**
<<<<<<< HEAD
 * Authentication middleware for protected routes
 */
export async function authMiddleware(request, env, ctx) {
  try {
    // Skip auth for public routes
    const publicRoutes = [
      '/health',
      '/api/info',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password'
    ];

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Check if this is a public route
    if (publicRoutes.some(route => pathname.includes(route))) {
      return; // Continue to next handler
    }

    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
        code: 'AUTH_MISSING_TOKEN'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const payload = await verifyJWT(token, env.JWT_SECRET || 'default-secret-key');

    if (!payload) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        code: 'AUTH_INVALID_TOKEN'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get user from database to ensure they still exist and are active
    const user = await request.db.findById('users', payload.userId);

    if (!user || !user.is_active) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'User not found or inactive',
        code: 'AUTH_USER_INACTIVE'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Add user info to request for use in route handlers
    request.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: payload.permissions || [],
      tokenExp: payload.exp
    };

    // Continue to next handler
    return;

  } catch (error) {
    console.error('Auth middleware error:', error);

    return new Response(JSON.stringify({
      error: 'Authentication Error',
      message: 'Failed to authenticate request',
      code: 'AUTH_ERROR'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

/**
 * Role-based access control middleware
 */
export function requireRole(allowedRoles) {
  return async function(request, env, ctx) {
    if (!request.user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const userRole = request.user.role;

    if (!allowedRoles.includes(userRole)) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        code: 'AUTH_INSUFFICIENT_PERMISSIONS'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Continue to next handler
    return;
  };
}

/**
 * Permission-based access control middleware
 */
export function requirePermission(permission) {
  return async function(request, env, ctx) {
    if (!request.user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const userPermissions = request.user.permissions || [];

    if (!userPermissions.includes(permission) && request.user.role !== 'admin') {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: `Access denied. Required permission: ${permission}`,
        code: 'AUTH_INSUFFICIENT_PERMISSIONS'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Continue to next handler
    return;
  };
}

// Export auth as alias for authMiddleware
export const auth = authMiddleware;
=======
 * Giải mã JWT token
 * @param {string} token - JWT token string
 * @param {string} secret - Secret key for verification
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
async function verifyJWT(token, secret) {
  try {
    // Split token parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode header and payload
    const [headerB64, payloadB64, signatureB64] = parts;
    
    // Verify signature
    const signatureVerified = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    ).then(key => crypto.subtle.verify(
      { name: 'HMAC', hash: 'SHA-256' },
      key,
      Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
      new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    ));
    
    if (!signatureVerified) {
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check token expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Authentication middleware
 * @param {Object} env - Environment variables
 * @returns {Function} - Middleware function
 */
export const auth = (env) => async (request) => {
  // Skip auth for OPTIONS requests (CORS preflight)
  if (request.method === 'OPTIONS') {
    return;
  }
  
  // Get authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Authentication required'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Invalid token format'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
  
  // Verify token
  const payload = await verifyJWT(token, env.JWT_SECRET || 'khochuan-secret-key');
  if (!payload) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Invalid or expired token'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
  
  // Attach user info to request
  request.user = {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role
  };
  
  // Continue processing
  return;
};

/**
 * Role-based access control middleware
 * @param {Array<String>} roles - Roles allowed to access the route
 * @returns {Function} - Middleware function
 */
export const rbac = (roles) => (request) => {
  // Skip for OPTIONS requests
  if (request.method === 'OPTIONS') {
    return;
  }
  
  // Ensure user is authenticated
  if (!request.user) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Authentication required'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
  
  // Check if user has allowed role
  if (!roles.includes(request.user.role)) {
    return new Response(JSON.stringify({
      success: false,
      message: 'You do not have permission to access this resource'
    }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
  
  // Continue processing
  return;
};
>>>>>>> 6806c702f54d85aaf87695d8ea5a7e4205f1eb0c
