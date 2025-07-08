/**
 * Authentication Middleware
 * Provides JWT verification and role-based access control
 */

import { corsHeaders } from '../utils/cors';

/**
 * Verify JWT token from Authorization header
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
export async function verifyToken(request, env) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return null;
    }
    
    // Verify token using Workers JWT library or KV store
    // This is a simplified example - in production, use proper JWT verification
    const tokenData = await env.AUTH_STORE.get(`token:${token}`);
    if (!tokenData) {
      return null;
    }
    
    // Parse token data
    return JSON.parse(tokenData);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Authentication middleware
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables
 * @returns {Response|null} - Error response or null to continue
 */
export async function authMiddleware(request, env) {
  // Skip auth for OPTIONS requests (CORS preflight)
  if (request.method === 'OPTIONS') {
    return null;
  }
  
  // Verify token
  const user = await verifyToken(request, env);
  if (!user) {
    return new Response(JSON.stringify({ 
      error: 'Unauthorized',
      message: 'Authentication required'
    }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
  }
  
  // Attach user to request for handlers
  request.user = user;
  
  // Continue processing
  return null;
}

/**
 * Role-based access control middleware
 * @param {Array<String>} allowedRoles - Roles allowed to access the route
 * @returns {Function} - Middleware function
 */
export function roleCheck(allowedRoles) {
  return async (request, env) => {
    // Skip for OPTIONS requests
    if (request.method === 'OPTIONS') {
      return null;
    }
    
    // Ensure user is authenticated
    const user = request.user || await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        message: 'Authentication required'
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
    
    // Check if user has allowed role
    if (!allowedRoles.includes(user.role)) {
      return new Response(JSON.stringify({ 
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
    
    // Continue processing
    return null;
  };
}