import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import ProtectedRoute from './auth/ProtectedRoute';
import RoleBasedAccess from './auth/RoleBasedAccess';

// Layouts
const AdminLayout = lazy(() => import('./components/common/Layout/AdminLayout'));
const CashierLayout = lazy(() => import('./components/common/Layout/CashierLayout'));
const StaffLayout = lazy(() => import('./components/common/Layout/StaffLayout'));

// Auth Pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard/AnalyticsDashboard'));
const ProductManagement = lazy(() => import('./pages/admin/Products/ProductManagement'));
const InventoryDashboard = lazy(() => import('./pages/admin/Inventory/InventoryDashboard'));
const OrderManagement = lazy(() => import('./pages/admin/Orders/OrderManagement'));
const StaffManagement = lazy(() => import('./pages/admin/Staff/StaffManagement'));
const CustomerManagement = lazy(() => import('./pages/admin/Customers/CustomerManagement'));
const ReportCenter = lazy(() => import('./pages/admin/Reports/ReportCenter'));
const SystemSettings = lazy(() => import('./pages/admin/Settings/SystemSettings'));

// Cashier Pages
const POSTerminal = lazy(() => import('./pages/cashier/POS/POSTerminal'));
const OrderHistory = lazy(() => import('./pages/cashier/Orders/OrderHistory'));
const CustomerLookup = lazy(() => import('./pages/cashier/Customers/CustomerLookup'));
const ShiftManagement = lazy(() => import('./pages/cashier/Session/ShiftStart'));

// Staff Pages
const PersonalDashboard = lazy(() => import('./pages/staff/Dashboard/PersonalDashboard'));
const Leaderboard = lazy(() => import('./pages/staff/Gamification/Leaderboard'));
const MySales = lazy(() => import('./pages/staff/Sales/MySales'));
const TrainingCenter = lazy(() => import('./pages/staff/Training/TrainingCenter'));

// Loading Component
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <RoleBasedAccess allowedRoles={['admin']}>
              <AdminLayout />
            </RoleBasedAccess>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="inventory" element={<InventoryDashboard />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="reports" element={<ReportCenter />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>

        {/* Cashier Routes */}
        <Route path="/cashier" element={
          <ProtectedRoute>
            <RoleBasedAccess allowedRoles={['admin', 'cashier']}>
              <CashierLayout />
            </RoleBasedAccess>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/cashier/pos" replace />} />
          <Route path="pos" element={<POSTerminal />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="customers" element={<CustomerLookup />} />
          <Route path="session" element={<ShiftManagement />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={
          <ProtectedRoute>
            <RoleBasedAccess allowedRoles={['admin', 'staff']}>
              <StaffLayout />
            </RoleBasedAccess>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<PersonalDashboard />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="sales" element={<MySales />} />
          <Route path="training" element={<TrainingCenter />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 