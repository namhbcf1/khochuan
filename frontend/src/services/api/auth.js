import axios from 'axios';
import apiClient from '../api';

// Cấu hình base URL cho auth API
const AUTH_API_URL = process.env.REACT_APP_API_URL || '/api';

// Các API endpoint
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  PROFILE: '/users/profile'
};

/**
 * Service xác thực người dùng
 */
const authService = {
  /**
   * Đăng nhập người dùng
   * @param {Object} credentials - Thông tin đăng nhập (username/email, password)
   * @returns {Promise} Promise with user data
   */
  login: async (credentials) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  /**
   * Đăng ký tài khoản mới
   * @param {Object} userData - Thông tin người dùng mới
   * @returns {Promise} Promise with registration result
   */
  register: async (userData) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  /**
   * Đăng xuất người dùng
   * @param {string} refreshToken - Token refresh hiện tại
   * @returns {Promise} Promise with logout result
   */
  logout: async (refreshToken) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
    return response.data;
  },

  /**
   * Làm mới token
   * @param {string} refreshToken - Token refresh hiện tại
   * @returns {Promise} Promise with new tokens
   */
  refreshToken: async (refreshToken) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
    return response.data;
  },

  /**
   * Xác minh email
   * @param {string} token - Token xác minh email
   * @returns {Promise} Promise with verification result
   */
  verifyEmail: async (token) => {
    const response = await apiClient.post(`${AUTH_ENDPOINTS.VERIFY_EMAIL}/${token}`);
    return response.data;
  },

  /**
   * Yêu cầu khôi phục mật khẩu
   * @param {string} email - Email tài khoản
   * @returns {Promise} Promise with forgot password result
   */
  forgotPassword: async (email) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data;
  },

  /**
   * Đặt lại mật khẩu
   * @param {Object} resetData - Dữ liệu đặt lại mật khẩu (token, newPassword)
   * @returns {Promise} Promise with reset password result
   */
  resetPassword: async (resetData) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, resetData);
    return response.data;
  },

  /**
   * Thay đổi mật khẩu khi đã đăng nhập
   * @param {Object} passwordData - Dữ liệu thay đổi mật khẩu (currentPassword, newPassword)
   * @returns {Promise} Promise with change password result
   */
  changePassword: async (passwordData) => {
    const response = await apiClient.put(AUTH_ENDPOINTS.CHANGE_PASSWORD, passwordData);
    return response.data;
  },

  /**
   * Cập nhật thông tin người dùng
   * @param {Object} userData - Dữ liệu cập nhật
   * @returns {Promise} Promise with updated user data
   */
  updateProfile: async (userData) => {
    const response = await apiClient.put(AUTH_ENDPOINTS.PROFILE, userData);
    return response.data;
  },

  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Promise} Promise with user data
   */
  getProfile: async () => {
    const response = await apiClient.get(AUTH_ENDPOINTS.PROFILE);
    return response.data;
  },

  /**
   * Tải file ảnh đại diện
   * @param {File} file - File ảnh đại diện
   * @returns {Promise} Promise with avatar upload result
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post(`${AUTH_ENDPOINTS.PROFILE}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  /**
   * Kiểm tra trạng thái xác thực
   * @returns {Promise} Promise with auth status
   */
  checkAuthStatus: async () => {
    try {
      const response = await apiClient.get(`${AUTH_ENDPOINTS.PROFILE}/status`);
      return {
        isAuthenticated: true,
        user: response.data
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        user: null
      };
    }
  }
};

export default authService; 