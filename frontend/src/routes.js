import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import ProtectedRoute from './auth/ProtectedRoute';

// Layouts
const CashierLayout = lazy(() => import('./components/common/Layout/CashierLayout'));
const AdminLayout = lazy(() => import('./components/common/Layout/AdminLayout'));
const StaffLayout = lazy(() => import('./components/common/Layout/StaffLayout'));

// Public pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Error404 = lazy(() => import('./pages/Error404'));
const Error403 = lazy(() => import('./pages/Error403'));

// Cashier pages
const POSTerminal = lazy(() => import('./pages/cashier/POS/POSTerminal'));
const CartManager = lazy(() => import('./pages/cashier/POS/CartManager'));
const PaymentProcessor = lazy(() => import('./pages/cashier/POS/PaymentProcessor'));
const ShiftStart = lazy(() => import('./pages/cashier/Session/ShiftStart'));
const ShiftEnd = lazy(() => import('./pages/cashier/Session/ShiftEnd'));
const OrderHistory = lazy(() => import('./pages/cashier/Orders/OrderHistory'));
const CustomerLookup = lazy(() => import('./pages/cashier/Customers/CustomerLookup'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard/AnalyticsDashboard'));
const ProductManagement = lazy(() => import('./pages/admin/Products/ProductManagement'));
const ProductForm = lazy(() => import('./pages/admin/Products/ProductForm'));
const InventoryDashboard = lazy(() => import('./pages/admin/Inventory/InventoryDashboard'));
const OrderManagement = lazy(() => import('./pages/admin/Orders/OrderManagement'));
const CustomerManagement = lazy(() => import('./pages/admin/Customers/CustomerManagement'));

// Staff pages
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard/PerformanceOverview'));
const MySales = lazy(() => import('./pages/staff/Sales/MySales'));
const ProductKnowledge = lazy(() => import('./pages/staff/Training/ProductKnowledge'));

// Fallback loader
const LoadingSuspense = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" tip="Đang tải..." />
  </div>
);

/**
 * Cấu hình routes chính của ứng dụng
 */
const AppRoutes = () => {
  return (
    <React.Suspense fallback={<LoadingSuspense />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/403" element={<Error403 />} />
        
        {/* Cashier Routes */}
        <Route path="/cashier" element={
          <ProtectedRoute requiredRoles={['cashier', 'admin']}>
            <CashierLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/cashier/pos" replace />} />
          <Route path="pos" element={<POSTerminal />} />
          <Route path="pos/cart" element={<CartManager />} />
          <Route path="pos/payment" element={<PaymentProcessor />} />
          <Route path="session/start" element={<ShiftStart />} />
          <Route path="session/end" element={<ShiftEnd />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="customers" element={<CustomerLookup />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="inventory" element={<InventoryDashboard />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
        </Route>
        
        {/* Staff Routes */}
        <Route path="/staff" element={
          <ProtectedRoute requiredRoles={['staff', 'admin']}>
            <StaffLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="sales" element={<MySales />} />
          <Route path="training/products" element={<ProductKnowledge />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes; 