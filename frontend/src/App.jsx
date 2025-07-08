import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

// Simple loading component
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

// Main Dashboard Component
const Dashboard = () => (
  <div style={{ 
    padding: '40px 20px', 
    textAlign: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  }}>
    <h1 style={{ 
      fontSize: '3rem', 
      marginBottom: '20px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
    }}>
      🏪 Smart POS System
    </h1>
    <p style={{ 
      fontSize: '1.2rem', 
      marginBottom: '40px',
      maxWidth: '600px',
      margin: '0 auto 40px'
    }}>
      Hệ thống quản lý bán hàng thông minh với AI - Tối ưu cho Cloudflare Edge
    </p>
    
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Admin Card */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '30px',
        border: '1px solid rgba(255,255,255,0.2)',
        transition: 'transform 0.3s ease',
        cursor: 'pointer'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👨‍💼</div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Admin Dashboard</h3>
        <p style={{ opacity: 0.9, marginBottom: '20px' }}>
          Quản lý toàn bộ hệ thống, báo cáo, phân tích dữ liệu
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '10px 20px',
          borderRadius: '8px',
          display: 'inline-block'
        }}>
          Truy cập Dashboard
        </div>
      </div>

      {/* POS Terminal Card */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '30px',
        border: '1px solid rgba(255,255,255,0.2)',
        transition: 'transform 0.3s ease',
        cursor: 'pointer'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💰</div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>POS Terminal</h3>
        <p style={{ opacity: 0.9, marginBottom: '20px' }}>
          Terminal bán hàng với quét mã vạch và thanh toán
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '10px 20px',
          borderRadius: '8px',
          display: 'inline-block'
        }}>
          Mở Terminal
        </div>
      </div>

      {/* Staff Portal Card */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '30px',
        border: '1px solid rgba(255,255,255,0.2)',
        transition: 'transform 0.3s ease',
        cursor: 'pointer'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👥</div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Staff Portal</h3>
        <p style={{ opacity: 0.9, marginBottom: '20px' }}>
          Cổng nhân viên với game hóa và theo dõi hiệu suất
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '10px 20px',
          borderRadius: '8px',
          display: 'inline-block'
        }}>
          Vào Portal
        </div>
      </div>
    </div>

    {/* Features Section */}
    <div style={{ marginTop: '60px' }}>
      <h2 style={{ marginBottom: '30px' }}>✨ Tính năng nổi bật</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
          🤖 AI Recommendations
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
          📊 Real-time Analytics
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
          🎮 Staff Gamification
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
          📱 PWA Mobile Support
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
          🔄 Offline Sync
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
          ⚡ Cloudflare Edge
        </div>
      </div>
    </div>

    {/* Status Section */}
    <div style={{ 
      marginTop: '40px', 
      padding: '20px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '12px',
      maxWidth: '600px',
      margin: '40px auto 0'
    }}>
      <h3>🚀 System Status</h3>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '15px' }}>
        <div>
          <div style={{ color: '#4ade80' }}>●</div>
          <div style={{ fontSize: '0.9rem' }}>Frontend</div>
        </div>
        <div>
          <div style={{ color: '#fbbf24' }}>●</div>
          <div style={{ fontSize: '0.9rem' }}>Backend</div>
        </div>
        <div>
          <div style={{ color: '#4ade80' }}>●</div>
          <div style={{ fontSize: '0.9rem' }}>Database</div>
        </div>
        <div>
          <div style={{ color: '#4ade80' }}>●</div>
          <div style={{ fontSize: '0.9rem' }}>CDN</div>
        </div>
      </div>
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
    <ConfigProvider locale={viVN} theme={theme}>
      <Router>
        <div className="app">
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;