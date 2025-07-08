import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

// Simple loading component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '16px'
  }}>
    Đang tải...
  </div>
);

// Simple routes component
const AppRoutes = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>🚀 Smart POS System</h1>
    <p>Hệ thống quản lý bán hàng thông minh</p>
    <div style={{ marginTop: '20px' }}>
      <button style={{ margin: '10px', padding: '10px 20px' }}>
        👨‍💼 Admin Dashboard
      </button>
      <button style={{ margin: '10px', padding: '10px 20px' }}>
        💰 POS Terminal
      </button>
      <button style={{ margin: '10px', padding: '10px 20px' }}>
        👥 Staff Portal
      </button>
    </div>
  </div>
);

// Ant Design theme
const theme = {
  token: {
    colorPrimary: '#1890ff',
    fontSize: 14,
    borderRadius: 6,
  }
};

function App() {
  return (
    <HelmetProvider>
      <ConfigProvider locale={viVN} theme={theme}>
        <Router>
          <div className="app">
            <Suspense fallback={<LoadingFallback />}>
              <AppRoutes />
            </Suspense>
          </div>
        </Router>
      </ConfigProvider>
    </HelmetProvider>
  );
}

export default App;