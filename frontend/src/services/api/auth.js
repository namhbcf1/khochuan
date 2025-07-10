import axios from 'axios';
import { mockApi, shouldUseMockApi } from '../mockApi';

// Cấu hình base URL cho auth API
const AUTH_API_URL = import.meta.env.VITE_API_URL || 'https://khoaugment-api.namhbcf1.workers.dev';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Các API endpoint
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  VERIFY: '/auth/verify'
};

/**
 * Service xác thực người dùng
 */
const authService = {
  /**
   * Đăng nhập người dùng
   * @param {Object} credentials - Thông tin đăng nhập (email, password)
   * @returns {Promise} Promise with user data
   */
  login: async (credentials) => {
    console.log('🔑 AuthService: Login attempt', { email: credentials.email });
    console.log('🔑 AuthService: Should use mock API?', shouldUseMockApi());

    // Use mock API if configured or if backend is unavailable
    if (shouldUseMockApi()) {
      console.log('🔑 AuthService: Using mock API');
      try {
        const mockResponse = await mockApi.login(credentials.email, credentials.password);
        console.log('🔑 AuthService: Mock API response', mockResponse);
        return {
          success: true,
          user: mockResponse.data.user,
          token: mockResponse.data.token
        };
      } catch (error) {
        console.error('🔑 AuthService: Mock API error', error);
        return {
          success: false,
          message: error.message || 'Email hoặc mật khẩu không đúng!'
        };
      }
    }

    // Try real API
    console.log('🔑 AuthService: Trying real API');
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
      console.log('🔑 AuthService: Real API response', response.data);
      return response.data;
    } catch (error) {
      console.error('🔑 AuthService: Real API error', error);

      // Fallback to mock API if real API fails
      try {
        console.log('🔑 AuthService: Falling back to mock API...');
        const mockResponse = await mockApi.login(credentials.email, credentials.password);
        console.log('🔑 AuthService: Mock API fallback response', mockResponse);
        return {
          success: true,
          user: mockResponse.data.user,
          token: mockResponse.data.token
        };
      } catch (mockError) {
        console.error('🔑 AuthService: Mock API fallback error', mockError);
        // Both real and mock API failed
        if (error.response) {
          return {
            success: false,
            message: error.response.data.message || 'Đăng nhập thất bại'
          };
        }
        return {
          success: false,
          message: 'Email hoặc mật khẩu không đúng!'
        };
      }
    }
  },

  /**
   * Đăng xuất người dùng
   * @returns {Promise} Promise with logout result
   */
  logout: async () => {
    // Use mock API if configured
    if (shouldUseMockApi()) {
      return await mockApi.logout();
    }

    try {
      const token = localStorage.getItem('khochuan_token');
      if (token) {
        const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data;
      }
      return { success: true, message: 'Đã đăng xuất' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: true, message: 'Đã đăng xuất' }; // Always return success even on error
    }
  },

  /**
   * Xác thực token
   * @param {string} token - JWT token hiện tại
   * @returns {Promise} Promise with verification result
   */
  verifyToken: async (token) => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.VERIFY, { token });
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      };
    }
  },
  
  /**
   * Thêm token vào request header
   * @param {string} token - JWT token 
   */
  setAuthToken: (token) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }
};

export default authService; 