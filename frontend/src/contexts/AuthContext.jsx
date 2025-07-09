import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { message } from 'antd';
import apiClient from '../services/api';

// Auth action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial auth state
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  accessToken: null,
  refreshToken: null,
  permissions: [],
  roleLevel: 0,
  error: null,
  lastActivity: null
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        permissions: action.payload.permissions || [],
        roleLevel: action.payload.roleLevel || 0,
        error: null,
        lastActivity: Date.now()
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        permissions: [],
        roleLevel: 0,
        error: action.payload.error
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };
    
    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        lastActivity: Date.now()
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}

// Role permissions mapping (should match backend)
const ROLE_PERMISSIONS = {
  admin: {
    level: 3,
    permissions: [
      'users:manage', 'products:manage', 'orders:manage', 'customers:manage',
      'staff:manage', 'analytics:view', 'settings:manage', 'reports:generate'
    ]
  },
  staff: {
    level: 2,
    permissions: [
      'products:manage', 'orders:view', 'customers:manage', 
      'analytics:view', 'inventory:manage'
    ]
  },
  cashier: {
    level: 1,
    permissions: [
      'products:view', 'orders:create', 'customers:view', 'pos:operate'
    ]
  }
};

// Create auth context
export const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Storage keys
  const STORAGE_KEYS = {
    ACCESS_TOKEN: 'pos_access_token',
    REFRESH_TOKEN: 'pos_refresh_token',
    USER: 'pos_user',
    LAST_ACTIVITY: 'pos_last_activity'
  };

  // Save auth data to storage
  const saveAuthData = (authData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  };

  // Clear auth data from storage
  const clearAuthData = () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  };

  // Load auth data from storage
  const loadAuthData = () => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr);
        const roleData = ROLE_PERMISSIONS[user.role] || { level: 0, permissions: [] };
        
        return {
          accessToken,
          refreshToken,
          user,
          permissions: roleData.permissions,
          roleLevel: roleData.level,
          lastActivity: lastActivity ? parseInt(lastActivity) : null
        };
      }
    } catch (error) {
      console.error('Failed to load auth data:', error);
      clearAuthData();
    }
    return null;
  };

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data;

      const roleData = ROLE_PERMISSIONS[user.role] || { level: 0, permissions: [] };
      
      const authData = {
        user,
        accessToken,
        refreshToken,
        permissions: roleData.permissions,
        roleLevel: roleData.level
      };

      // Save to storage
      saveAuthData(authData);

      // Update API client default headers
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: authData
      });

      message.success(`Welcome back, ${user.name}!`);
      return { success: true };

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage }
      });

      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async (showMessage = true) => {
    try {
      // Try to call logout endpoint if authenticated
      if (state.isAuthenticated && state.accessToken) {
        await apiClient.post('/auth/logout', {
          refreshToken: state.refreshToken
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local data
      clearAuthData();
      
      // Remove auth header
      delete apiClient.defaults.headers.common['Authorization'];
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      if (showMessage) {
        message.success('You have been logged out');
      }
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      if (!state.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiClient.post('/auth/refresh-token', {
        refreshToken: state.refreshToken
      });
      
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Update API client default headers
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Update state
      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN,
        payload: { accessToken, refreshToken: newRefreshToken }
      });
      
      // Update storage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Force logout on refresh failure
      logout(false);
      return false;
    }
  };

  // Update user information
  const updateUser = async (userData) => {
    try {
      const response = await apiClient.put('/users/profile', userData);
      const updatedUser = response.data;
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: updatedUser
      });
      
      // Update user in storage
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ ...user, ...updatedUser }));
      }
      
      message.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await apiClient.put('/users/password', passwordData);
      message.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to change password';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return state.permissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => state.permissions.includes(permission));
  };

  // Check if user has required role level
  const hasRoleLevel = (requiredLevel) => {
    return state.roleLevel >= requiredLevel;
  };

  // Check if user can access a route based on permissions
  const canAccessRoute = (routePermissions) => {
    if (!routePermissions || routePermissions.length === 0) return true;
    return hasAnyPermission(routePermissions);
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Setup API interceptors for handling 401 errors
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized error
        if (error.response?.status === 401 && !originalRequest._retry && state.refreshToken) {
          originalRequest._retry = true;
          
          const refreshed = await refreshToken();
          if (refreshed) {
            return apiClient(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [state.refreshToken]);

  // Setup activity tracker to auto logout on inactivity
  useEffect(() => {
    if (!state.isAuthenticated) return;

    // Define activity timeout (30 minutes)
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    const updateActivity = () => {
      if (state.isAuthenticated) {
        const now = Date.now();
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN,
          payload: { 
            accessToken: state.accessToken,
            refreshToken: state.refreshToken
          }
        });
      }
    };

    const checkActivity = () => {
      const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      if (lastActivity) {
        const now = Date.now();
        const idle = now - parseInt(lastActivity);
        
        if (idle > INACTIVITY_TIMEOUT) {
          logout(false);
          message.info('You have been logged out due to inactivity');
        }
      }
    };

    // Add event listeners
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Setup periodic check
    const activityCheckInterval = setInterval(checkActivity, 60000); // Check every minute

    return () => {
      // Cleanup
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(activityCheckInterval);
    };
  }, [state.isAuthenticated]);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      try {
        const authData = loadAuthData();
        
        if (authData) {
          // Check for token validity or perform token refresh
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${authData.accessToken}`;
          
          // Check for token expiration by examining activity timestamp
          const now = Date.now();
          const lastActivity = authData.lastActivity;
          const TOKEN_REFRESH_THRESHOLD = 4 * 60 * 60 * 1000; // 4 hours
          
          if (lastActivity && now - lastActivity > TOKEN_REFRESH_THRESHOLD) {
            // Token might be expired, attempt refresh
            const refreshed = await refreshToken();
            if (!refreshed) {
              // Refresh failed, stay logged out
              dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
              return;
            }
          }
          
          // Login with stored data
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: authData
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };
    
    initializeAuth();
  }, []);

  // Prepare context value
  const authContextValue = {
    ...state,
    login,
    logout,
    refreshToken,
    updateUser,
    changePassword,
    hasPermission,
    hasAnyPermission,
    hasRoleLevel,
    canAccessRoute,
    clearError
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 