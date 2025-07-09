export const ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  STAFF: 'staff'
};

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_UPDATE: 'inventory.update',
  ORDERS_VIEW: 'orders.view',
  ORDERS_CREATE: 'orders.create',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_DELETE: 'orders.delete',
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_UPDATE: 'customers.update',
  CUSTOMERS_DELETE: 'customers.delete',
  STAFF_VIEW: 'staff.view',
  STAFF_CREATE: 'staff.create',
  STAFF_UPDATE: 'staff.update',
  STAFF_DELETE: 'staff.delete',
  REPORTS_VIEW: 'reports.view',
  REPORTS_CREATE: 'reports.create',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
  POS_USE: 'pos.use'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_DELETE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
    PERMISSIONS.CUSTOMERS_DELETE,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.STAFF_UPDATE,
    PERMISSIONS.STAFF_DELETE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.POS_USE
  ],
  [ROLES.CASHIER]: [
    PERMISSIONS.POS_USE,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW
  ]
};

// Helper functions
export const hasRole = (userRole, requiredRole) => {
  return userRole === requiredRole;
};

export const hasAnyRole = (userRole, requiredRoles) => {
  return requiredRoles.includes(userRole);
};

export const hasAllRoles = (userRole, requiredRoles) => {
  return requiredRoles.every(role => userRole === role);
};

export const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (userRole, requiredPermissions) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return requiredPermissions.some(permission => permissions.includes(permission));
};

export const hasAllPermissions = (userRole, requiredPermissions) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return requiredPermissions.every(permission => permissions.includes(permission));
};

export const getUserPermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

export const isFeatureEnabled = (feature) => {
  // Simple feature flag implementation
  return true;
};

export const checkBusinessRule = (rule, context) => {
  // Simple business rule implementation
  return true;
};
