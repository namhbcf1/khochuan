import React, { Suspense, ErrorBoundary } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

// Context Providers
import { AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './utils/context/ThemeContext';
import { GameProvider } from './utils/context/GameContext';
import { CartProvider } from './utils/context/CartContext';
import { OfflineProvider } from './utils/context/OfflineContext';
import { NotificationProvider } from './utils/context/NotificationContext';

// Main Components
import AppRoutes from './routes';
import LoadingFallback from './components/common/LoadingFallback';
import ErrorBoundaryComponent from './components/common/ErrorBoundary';
import OfflineIndicator from './components/common/OfflineIndicator';
import UpdateNotification from './components/common/UpdateNotification';

// Styles
import './styles/globals.css';

// Ant Design theme configuration
const antdTheme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',
    fontSize: 14,
    borderRadius: 6,
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
  },
};

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryComponent}>
      <HelmetProvider>
        <ConfigProvider 
          locale={viVN} 
          theme={antdTheme}
          componentSize="middle"
        >
          <ThemeProvider>
            <OfflineProvider>
              <NotificationProvider>
                <AuthProvider>
                  <GameProvider>
                    <CartProvider>
                      <Router>
                        <div className="app">
                          <Suspense fallback={<LoadingFallback />}>
                            <AppRoutes />
                          </Suspense>
                          
                          {/* Global Components */}
                          <OfflineIndicator />
                          <UpdateNotification />
                        </div>
                      </Router>
                    </CartProvider>
                  </GameProvider>
                </AuthProvider>
              </NotificationProvider>
            </OfflineProvider>
          </ThemeProvider>
        </ConfigProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;