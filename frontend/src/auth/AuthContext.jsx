import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { message } from 'antd';

// Initial state
const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  permissions: [],
  role: null,
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
      };
    case AUTH_ACTIONS.LOGOUT:
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
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('truongphat_token');
    const user = localStorage.getItem('truongphat_user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: parsedUser,
            token,
            permissions: parsedUser.permissions || [],
          },
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('truongphat_token');
        localStorage.removeItem('truongphat_user');
      }
    }
    
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      // Mock login - replace with actual API call
      const mockUser = {
        id: 1,
        name: credentials.email.includes('admin') ? 'Quản trị viên' : 
              credentials.email.includes('cashier') ? 'Thu ngân' : 'Nhân viên',
        email: credentials.email,
        role: credentials.email.includes('admin') ? 'admin' : 
              credentials.email.includes('cashier') ? 'cashier' : 'staff',
        avatar: null,
        permissions: getPermissionsByRole(credentials.email.includes('admin') ? 'admin' : 
                                        credentials.email.includes('cashier') ? 'cashier' : 'staff'),
      };

      // Validate credentials
      if (
        (credentials.email === 'admin@truongphat.com' && credentials.password === 'admin123') ||
        (credentials.email === 'cashier@truongphat.com' && credentials.password === 'cashier123') ||
        (credentials.email === 'staff@truongphat.com' && credentials.password === 'staff123')
      ) {
        const mockToken = 'truongphat-jwt-token-' + Date.now();

        // Store in localStorage
        localStorage.setItem('truongphat_token', mockToken);
        localStorage.setItem('truongphat_user', JSON.stringify(mockUser));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: mockUser,
            token: mockToken,
            permissions: mockUser.permissions,
          },
        });

        message.success('Đăng nhập thành công!');
        return { success: true };
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
        message.error('Email hoặc mật khẩu không đúng!');
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      message.error('Đăng nhập thất bại!');
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('truongphat_token');
    localStorage.removeItem('truongphat_user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    message.success('Đăng xuất thành công!');
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
    localStorage.setItem('truongphat_user', JSON.stringify({ ...state.user, ...userData }));
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

  // Context value
  const value = {
    ...state,
    login,
    logout,
    updateUser,
    hasPermission,
    hasRole,
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
  };

  return permissions[role] || [];
};

export default AuthContext; 