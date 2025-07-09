/**
 * Authentication Middleware
 * Provides JWT verification and role-based access control
 */

import { corsHeaders } from '../utils/cors';

/**
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