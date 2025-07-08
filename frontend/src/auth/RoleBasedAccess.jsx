import React from 'react';
import { Navigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useAuth } from './AuthContext';

const RoleBasedAccess = ({ children, allowedRoles = [], requiredPermissions = [] }) => {
  const { role, hasRole, hasPermission } = useAuth();

  // Check if user has required role
  const hasRequiredRole = allowedRoles.length === 0 || hasRole(allowedRoles);

  // Check if user has required permissions
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.every(permission => hasPermission(permission));

  // If user doesn't have required role or permissions, show access denied
  if (!hasRequiredRole || !hasRequiredPermissions) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f0f2f5'
      }}>
        <Result
          status="403"
          title="403"
          subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  return children;
};

export default RoleBasedAccess;