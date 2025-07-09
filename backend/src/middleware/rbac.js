/**
 * Role-Based Access Control (RBAC) Middleware
 * Manages access control for the system
 */

import { corsHeaders } from '../utils/cors';

/**
 * Permission definitions
 */
export const PERMISSIONS = {
  // Admin permissions
  'admin:full_access': 'Full system access',
  'admin:users': 'Manage users',
  'admin:settings': 'Manage system settings',
  
  // Cashier permissions
  'cashier:sales': 'Process sales',
  'cashier:orders': 'Manage orders',
  'cashier:inventory': 'View inventory',
  
  // Staff permissions
  'staff:profile': 'View and update profile',
  'staff:sales': 'View sales',
  'staff:reports': 'View reports',
  
  // Customer permissions
  'customer:orders': 'View orders',
  'customer:profile': 'View and update profile'
};

/**
 * Role definitions with associated permissions
 */
export const ROLES = {
  admin: [
    'admin:full_access',
    'admin:users',
    'admin:settings',
    'cashier:sales',
    'cashier:orders',
    'cashier:inventory',
    'staff:profile',
    'staff:sales',
    'staff:reports'
  ],
  cashier: [
    'cashier:sales',
    'cashier:orders',
    'cashier:inventory',
    'staff:profile',
    'staff:sales'
  ],
  staff: [
    'staff:profile',
    'staff:sales',
    'staff:reports'
  ],
  customer: [
    'customer:orders',
    'customer:profile'
  ]
};

/**
 * Check if user has required permission
 * @param {Object} user - User object with role
 * @param {String} permission - Required permission
 * @returns {Boolean} - True if user has permission
 */
export function hasPermission(user, permission) {
  if (!user || !user.role) {
    return false;
  }
  
  const rolePermissions = ROLES[user.role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Permission check middleware
 * @param {String|Array} requiredPermissions - Required permission(s)
 * @returns {Function} - Middleware function
 */
export const requirePermission = (requiredPermissions) => (request) => {
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
  
  // Normalize permissions to array
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];
  
  // Check if user has any of the required permissions
  const hasRequiredPermission = permissions.some(
    permission => hasPermission(request.user, permission)
  );
  
  if (!hasRequiredPermission) {
    return new Response(JSON.stringify({
      success: false,
      message: 'You do not have permission to perform this action'
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