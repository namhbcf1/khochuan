import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { message } from 'antd';
import authService from '../services/api/auth';

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
          // Set auth token in axios headers
          authService.setAuthToken(token);
          
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
    authService.setAuthToken(null);
  };

  // Handle logout
  const handleLogout = async (expired = false) => {
    if (!expired) {
      await authService.logout();
    }
    
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
    console.log('🔐 AuthContext: Starting login process', { email: credentials.email });
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      // Call API login
      console.log('🔐 AuthContext: Calling authService.login');
      const response = await authService.login(credentials);
      console.log('🔐 AuthContext: Login response received', response);

      if (response.success) {
        const { user, token } = response;
        console.log('🔐 AuthContext: Login successful', { user: user.email, role: user.role });

        // Set auth token in axios headers
        authService.setAuthToken(token);

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
            permissions: getPermissionsByRole(user.role),
            expiresAt,
            lastActivity,
          },
        });

        message.success('Đăng nhập thành công!');
        console.log('🔐 AuthContext: Login process completed successfully');
        return { success: true, user };
      } else {
        console.error('🔐 AuthContext: Login failed', response.message);
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
        message.error(response.message || 'Email hoặc mật khẩu không đúng!');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('🔐 AuthContext: Login error caught', error);
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      message.error('Đăng nhập thất bại!');
      return { success: false, error: error.message };
    }
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

  // Context value
  const value = {
    ...state,
    login,
    logout: () => handleLogout(),
    updateUser,
    hasPermission,
    hasRole,
    updateLastActivity,
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