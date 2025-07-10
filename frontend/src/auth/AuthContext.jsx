import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { message } from 'antd';

// Initial state
const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  permissions: [],
  role: null,
  lastActivity: null,
  expiresAt: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
  SET_PERMISSIONS: 'SET_PERMISSIONS',
  UPDATE_LAST_ACTIVITY: 'UPDATE_LAST_ACTIVITY',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
};

// Session configuration
const SESSION_CONFIG = {
  TIMEOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  STORAGE_PREFIX: 'khochuan_',
  TOKEN_KEY: 'khochuan_token',
  USER_KEY: 'khochuan_user',
  EXPIRES_KEY: 'khochuan_expires',
  ACTIVITY_KEY: 'khochuan_last_activity',
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.user.role,
        permissions: action.payload.permissions || [],
        isAuthenticated: true,
        loading: false,
        lastActivity: action.payload.lastActivity || Date.now(),
        expiresAt: action.payload.expiresAt || null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        role: null,
        permissions: [],
        isAuthenticated: false,
        loading: false,
        lastActivity: null,
        expiresAt: null,
      };
    case AUTH_ACTIONS.LOGOUT:
    case AUTH_ACTIONS.SESSION_EXPIRED:
      return {
        ...initialState,
        loading: false,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case AUTH_ACTIONS.SET_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload,
      };
    case AUTH_ACTIONS.UPDATE_LAST_ACTIVITY:
      return {
        ...state,
        lastActivity: action.payload,
      };
    default:
      return state;
  }
};

// Create context
export const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for session expiration
  const checkSessionExpiration = useCallback(() => {
    if (state.expiresAt && Date.now() > state.expiresAt) {
      message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      handleLogout(true);
      return true;
    }
    return false;
  }, [state.expiresAt]);

  // Check for inactivity timeout
  const checkInactivityTimeout = useCallback(() => {
    if (state.lastActivity && Date.now() - state.lastActivity > SESSION_CONFIG.TIMEOUT_DURATION) {
      message.warning('Phiên làm việc đã hết hạn do không hoạt động. Vui lòng đăng nhập lại.');
      handleLogout(true);
      return true;
    }
    return false;
  }, [state.lastActivity]);

  // Update last activity
  const updateLastActivity = useCallback(() => {
    if (state.isAuthenticated) {
      const now = Date.now();
      dispatch({ type: AUTH_ACTIONS.UPDATE_LAST_ACTIVITY, payload: now });
      localStorage.setItem(SESSION_CONFIG.ACTIVITY_KEY, now.toString());
    }
  }, [state.isAuthenticated]);

  // Handle user activity
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => updateLastActivity();

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check session every minute
    const sessionCheckInterval = setInterval(() => {
      checkSessionExpiration() || checkInactivityTimeout();
    }, 60000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(sessionCheckInterval);
    };
  }, [state.isAuthenticated, updateLastActivity, checkSessionExpiration, checkInactivityTimeout]);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem(SESSION_CONFIG.TOKEN_KEY);
    const user = localStorage.getItem(SESSION_CONFIG.USER_KEY);
    const expiresAt = localStorage.getItem(SESSION_CONFIG.EXPIRES_KEY);
    const lastActivity = localStorage.getItem(SESSION_CONFIG.ACTIVITY_KEY);
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        const parsedExpiresAt = expiresAt ? parseInt(expiresAt, 10) : null;
        const parsedLastActivity = lastActivity ? parseInt(lastActivity, 10) : Date.now();

        // Check if session has expired
        if (parsedExpiresAt && Date.now() > parsedExpiresAt) {
          handleLogout(true);
        } else {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: parsedUser,
              token,
              permissions: parsedUser.permissions || [],
              expiresAt: parsedExpiresAt,
              lastActivity: parsedLastActivity,
            },
          });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearAuthStorage();
      }
    }
    
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
  }, []);

  // Clear authentication storage
  const clearAuthStorage = () => {
    localStorage.removeItem(SESSION_CONFIG.TOKEN_KEY);
    localStorage.removeItem(SESSION_CONFIG.USER_KEY);
    localStorage.removeItem(SESSION_CONFIG.EXPIRES_KEY);
    localStorage.removeItem(SESSION_CONFIG.ACTIVITY_KEY);
  };

  // Handle logout
  const handleLogout = (expired = false) => {
    clearAuthStorage();
    dispatch({ 
      type: expired ? AUTH_ACTIONS.SESSION_EXPIRED : AUTH_ACTIONS.LOGOUT 
    });
    if (!expired) {
      message.success('Đăng xuất thành công!');
    }
  };

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      // Validate credentials
      const validCredentials = validateCredentials(credentials);
      
      if (validCredentials.success) {
        const { user, token } = validCredentials;
        
        // Set session expiration (24 hours from now)
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
        const lastActivity = Date.now();
        
        // Store in localStorage
        localStorage.setItem(SESSION_CONFIG.TOKEN_KEY, token);
        localStorage.setItem(SESSION_CONFIG.USER_KEY, JSON.stringify(user));
        localStorage.setItem(SESSION_CONFIG.EXPIRES_KEY, expiresAt.toString());
        localStorage.setItem(SESSION_CONFIG.ACTIVITY_KEY, lastActivity.toString());

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user,
            token,
            permissions: user.permissions,
            expiresAt,
            lastActivity,
          },
        });

        message.success('Đăng nhập thành công!');
        return { success: true, user };
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
        message.error(validCredentials.error || 'Email hoặc mật khẩu không đúng!');
        return { success: false, error: validCredentials.error };
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      message.error('Đăng nhập thất bại!');
      return { success: false, error: error.message };
    }
  };

  // Validate credentials
  const validateCredentials = (credentials) => {
    // Mock user accounts
    const validUsers = [
      {
        email: 'admin@khochuan.com',
        username: 'admin',
        password: 'admin123',
        name: 'Quản trị viên',
        role: 'admin',
      },
      {
        email: 'cashier@khochuan.com',
        username: 'cashier',
        password: 'cashier123',
        name: 'Thu ngân',
        role: 'cashier',
      },
      {
        email: 'staff@khochuan.com',
        username: 'staff',
        password: 'staff123',
        name: 'Nhân viên bán hàng',
        role: 'staff',
      },
      {
        email: 'customer@khochuan.com',
        username: 'customer',
        password: 'customer123',
        name: 'Nguyễn Văn Khách',
        role: 'customer',
        phone: '0987654321',
        address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
        loyaltyPoints: 250,
        memberSince: '2023-01-15',
        membershipLevel: 'Silver',
        totalSpent: 12500000,
        lastPurchase: '2023-06-22',
        warrantyItems: [
          {
            id: 'WR-001',
            productName: 'Laptop Dell XPS 13',
            serialNumber: 'DL-XPS-2022-1234',
            purchaseDate: '2023-01-15',
            warrantyEnd: '2024-01-15',
            status: 'active'
          },
          {
            id: 'WR-002',
            productName: 'Màn hình Dell P2419H',
            serialNumber: 'DL-P2419H-2022-5678',
            purchaseDate: '2023-03-10',
            warrantyEnd: '2024-03-10',
            status: 'active'
          }
        ]
      }
    ];

    // Find matching user by email or username
    const user = validUsers.find(u => {
      const inputIdentifier = credentials.email || credentials.username || '';
      const inputPassword = credentials.password || '';
      
      // Check if the input matches either email or username
      const identifierMatch = 
        inputIdentifier.toLowerCase() === u.email.toLowerCase() || 
        inputIdentifier.toLowerCase() === u.username.toLowerCase();
      
      return identifierMatch && u.password === inputPassword;
    });

    if (user) {
      // Create user object without password
      const { password, ...userWithoutPassword } = user;
      
      // Add permissions
      const userWithPermissions = {
        ...userWithoutPassword,
        permissions: getPermissionsByRole(user.role),
        id: Date.now(), // Mock user ID
        avatar: null,
      };

      return {
        success: true,
        user: userWithPermissions,
        token: 'khochuan-jwt-token-' + Date.now()
      };
    }

    return {
      success: false,
      error: 'Email hoặc mật khẩu không đúng'
    };
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
    
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem(SESSION_CONFIG.USER_KEY, JSON.stringify(updatedUser));
    }
  };

  // Check permission function
  const hasPermission = (permission) => {
    return state.permissions.includes(permission);
  };

  // Check role function
  const hasRole = (role) => {
    if (Array.isArray(role)) {
      return role.includes(state.role);
    }
    return state.role === role;
  };

  // Function to get accessible menu items based on user role
  const getAccessibleMenus = () => {
    // Default menu if no user or no role
    if (!state.user || !state.role) return [];

    const menuItems = [];

    // Admin menu
    if (state.role === 'admin') {
      menuItems.push(
        {
          key: '/dashboard',
          label: 'Dashboard',
          path: '/dashboard',
          icon: 'DashboardOutlined',
        },
        {
          key: '/products',
          label: 'Sản phẩm',
          icon: 'ShoppingOutlined',
          children: [
            {
              key: '/admin/products/product-management',
              label: 'Quản lý sản phẩm',
              path: '/admin/products/product-management',
              icon: 'AppstoreOutlined',
            },
            {
              key: '/admin/products/price-optimization',
              label: 'Tối ưu giá',
              path: '/admin/products/price-optimization',
              icon: 'BarChartOutlined',
            },
            {
              key: '/admin/products/bulk-operations',
              label: 'Thao tác hàng loạt',
              path: '/admin/products/bulk-operations',
              icon: 'FileTextOutlined',
            },
          ]
        },
        {
          key: '/orders',
          label: 'Đơn hàng',
          icon: 'ShoppingCartOutlined',
          children: [
            {
              key: '/admin/orders/order-management',
              label: 'Quản lý đơn hàng',
              path: '/admin/orders/order-management',
              icon: 'FileTextOutlined',
            },
            {
              key: '/admin/orders/order-analytics',
              label: 'Phân tích đơn hàng',
              path: '/admin/orders/order-analytics',
              icon: 'BarChartOutlined',
            },
            {
              key: '/admin/orders/return-processing',
              label: 'Xử lý đổi/trả',
              path: '/admin/orders/return-processing',
              icon: 'RollbackOutlined',
            },
          ]
        },
        {
          key: '/customers',
          label: 'Khách hàng',
          icon: 'UserOutlined',
          children: [
            {
              key: '/admin/customers/customer-management',
              label: 'Quản lý khách hàng',
              path: '/admin/customers/customer-management',
              icon: 'TeamOutlined',
            },
            {
              key: '/admin/customers/customer-analytics',
              label: 'Phân tích khách hàng',
              path: '/admin/customers/customer-analytics',
              icon: 'BarChartOutlined',
            },
            {
              key: '/admin/customers/customer-segmentation',
              label: 'Phân khúc khách hàng',
              path: '/admin/customers/customer-segmentation',
              icon: 'AppstoreOutlined',
            },
          ]
        },
        {
          key: '/staff',
          label: 'Nhân viên',
          icon: 'TeamOutlined',
          children: [
            {
              key: '/admin/staff/performance-tracking',
              label: 'Theo dõi hiệu suất',
              path: '/admin/staff/performance-tracking',
              icon: 'BarChartOutlined',
            },
            {
              key: '/admin/staff/gamification-config',
              label: 'Cấu hình gamification',
              path: '/admin/staff/gamification-config',
              icon: 'TrophyOutlined',
            },
            {
              key: '/admin/staff/commission-settings',
              label: 'Cài đặt hoa hồng',
              path: '/admin/staff/commission-settings',
              icon: 'DollarOutlined',
            },
          ]
        },
        {
          key: '/reports',
          label: 'Báo cáo',
          icon: 'FileTextOutlined',
          children: [
            {
              key: '/admin/reports/business-intelligence',
              label: 'Business Intelligence',
              path: '/admin/reports/business-intelligence',
              icon: 'BarChartOutlined',
            },
            {
              key: '/admin/reports/custom-reports',
              label: 'Báo cáo tùy chỉnh',
              path: '/admin/reports/custom-reports',
              icon: 'FileTextOutlined',
            },
            {
              key: '/admin/reports/inventory-report',
              label: 'Báo cáo tồn kho',
              path: '/admin/reports/inventory-report',
              icon: 'ShoppingOutlined',
            },
          ]
        },
      );
    }
    
    // Cashier menu
    else if (state.role === 'cashier') {
      menuItems.push(
        {
          key: '/pos',
          label: 'POS Terminal',
          path: '/cashier/pos/pos-terminal',
          icon: 'ShopOutlined',
          badge: 'Mới'
        },
        {
          key: '/customers',
          label: 'Khách hàng',
          icon: 'UserOutlined',
          children: [
            {
              key: '/cashier/customers/customer-lookup',
              label: 'Tra cứu khách hàng',
              path: '/cashier/customers/customer-lookup',
              icon: 'TeamOutlined',
            },
            {
              key: '/cashier/customers/loyalty-points',
              label: 'Điểm thưởng',
              path: '/cashier/customers/loyalty-points',
              icon: 'TrophyOutlined',
            },
          ]
        },
        {
          key: '/orders',
          label: 'Đơn hàng',
          icon: 'ShoppingCartOutlined',
          children: [
            {
              key: '/cashier/orders/order-history',
              label: 'Lịch sử đơn hàng',
              path: '/cashier/orders/order-history',
              icon: 'FileTextOutlined',
            },
            {
              key: '/cashier/orders/returns',
              label: 'Đổi/trả hàng',
              path: '/cashier/orders/returns',
              icon: 'RollbackOutlined',
            },
          ]
        },
        {
          key: '/session',
          label: 'Ca làm việc',
          icon: 'ClockCircleOutlined',
          children: [
            {
              key: '/cashier/session/cash-count',
              label: 'Kiểm đếm tiền',
              path: '/cashier/session/cash-count',
              icon: 'BankOutlined',
            },
            {
              key: '/cashier/session/shift-end',
              label: 'Kết thúc ca',
              path: '/cashier/session/shift-end',
              icon: 'ClockCircleOutlined',
            },
          ]
        }
      );
    }
    
    // Staff menu
    else if (state.role === 'staff') {
      menuItems.push(
        {
          key: '/dashboard',
          label: 'Dashboard',
          path: '/staff/dashboard/performance-overview',
          icon: 'DashboardOutlined',
        },
        {
          key: '/sales',
          label: 'Bán hàng',
          icon: 'ShoppingCartOutlined',
          children: [
            {
              key: '/staff/sales/my-sales',
              label: 'Doanh số của tôi',
              path: '/staff/sales/my-sales',
              icon: 'BarChartOutlined',
            },
            {
              key: '/staff/sales/customer-insights',
              label: 'Thông tin khách hàng',
              path: '/staff/sales/customer-insights',
              icon: 'UserOutlined',
            },
          ]
        },
        {
          key: '/gamification',
          label: 'Gamification',
          icon: 'TrophyOutlined',
          children: [
            {
              key: '/staff/gamification/achievement-center',
              label: 'Trung tâm thành tích',
              path: '/staff/gamification/achievement-center',
              icon: 'TrophyOutlined',
            },
            {
              key: '/staff/gamification/badge-collection',
              label: 'Bộ sưu tập huy hiệu',
              path: '/staff/gamification/badge-collection',
              icon: 'TrophyOutlined',
            },
          ]
        },
      );
    }
    
    // Customer menu
    else if (state.role === 'customer') {
      menuItems.push(
        {
          key: '/profile',
          label: 'Hồ sơ cá nhân',
          path: '/customer/profile',
          icon: 'UserOutlined',
        },
        {
          key: '/orders',
          label: 'Lịch sử mua hàng',
          path: '/customer/orders',
          icon: 'ShoppingOutlined',
        },
        {
          key: '/loyalty',
          label: 'Điểm thưởng',
          path: '/customer/loyalty',
          icon: 'TrophyOutlined',
        },
        {
          key: '/warranty',
          label: 'Bảo hành',
          path: '/customer/warranty',
          icon: 'SafetyOutlined',
        },
        {
          key: '/lookup',
          label: 'Tra cứu thông tin',
          path: '/customer/lookup',
          icon: 'SearchOutlined',
        },
        {
          key: '/terms',
          label: 'Điều khoản bảo hành',
          path: '/customer/terms',
          icon: 'FileTextOutlined',
        },
      );
    }
    
    return menuItems;
  };

  // Context value
  const value = {
    ...state,
    login,
    logout: () => handleLogout(),
    updateUser,
    hasPermission,
    hasRole,
    updateLastActivity,
    getAccessibleMenus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to get permissions by role
const getPermissionsByRole = (role) => {
  const permissions = {
    admin: [
      'dashboard.view',
      'products.view', 'products.create', 'products.update', 'products.delete',
      'inventory.view', 'inventory.update',
      'orders.view', 'orders.create', 'orders.update', 'orders.delete',
      'customers.view', 'customers.create', 'customers.update', 'customers.delete',
      'staff.view', 'staff.create', 'staff.update', 'staff.delete',
      'reports.view', 'reports.create',
      'settings.view', 'settings.update',
      'pos.use',
    ],
    cashier: [
      'pos.use',
      'orders.view', 'orders.create',
      'customers.view', 'customers.create', 'customers.update',
      'products.view',
      'inventory.view',
    ],
    staff: [
      'dashboard.view',
      'sales.view',
      'gamification.view',
      'training.view',
      'profile.view', 'profile.update',
    ],
    customer: [
      'profile.view', 'profile.update',
      'orders.view', 'orders.history',
      'loyalty.view', 'loyalty.redeem',
      'warranty.view', 'warranty.claim',
      'lookup.use', 'lookup.product',
      'qr.scan', 'terms.view',
      'customer.dashboard'
    ],
  };

  return permissions[role] || [];
};

export default AuthContext; 