import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Spin } from 'antd';

/**
 * HomePage component - handles initial routing logic
 * Redirects users based on authentication status and role
 */
const HomePage = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', color: '#666' }}>
          Đang kiểm tra đăng nhập...
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, redirect based on user role
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === 'cashier') {
    return <Navigate to="/admin/pos" replace />;
  } else if (user?.role === 'staff') {
    return <Navigate to="/staff/dashboard" replace />;
  } else if (user?.role === 'customer') {
    return <Navigate to="/customer/dashboard" replace />;
  }

  // Default fallback to login if role is not recognized
  return <Navigate to="/login" replace />;
};

export default HomePage;
