import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './auth/AuthContext';
import AppRoutes from './routes';
import './styles/globals.css';

// Loading component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '16px',
    flexDirection: 'column'
  }}>
    <div style={{ marginBottom: '20px', fontSize: '24px' }}>🚀</div>
    <div>Đang tải Smart POS...</div>
  </div>
);

// Ant Design theme
const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    fontSize: 14,
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Layout: {
      bodyBg: '#f0f2f5',
      headerBg: '#001529',
      siderBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1890ff',
    },
    Button: {
      fontWeight: 500,
    },
    Table: {
      headerBg: '#fafafa',
    },
    Card: {
      borderRadius: 12,
    },
  },
};

function App() {
  return (
    <ConfigProvider locale={viVN} theme={theme}>
      <AuthProvider>
        <Router>
          <div className="app">
            <Suspense fallback={<LoadingFallback />}>
              <AppRoutes />
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;