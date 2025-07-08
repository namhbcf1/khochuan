import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Typography, Space, Tag, Divider } from 'antd';
import { 
  DashboardOutlined, 
  ShoppingCartOutlined, 
  TeamOutlined,
  TrophyOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, hasRole } = useAuth();

  // If user is authenticated, redirect to appropriate dashboard
  React.useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'cashier':
          navigate('/cashier/pos');
          break;
        case 'staff':
          navigate('/staff/dashboard');
          break;
        default:
          // Stay on main dashboard
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRoleAccess = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'cashier':
        navigate('/cashier/pos');
        break;
      case 'staff':
        navigate('/staff/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Title level={1} style={{ 
            color: 'white', 
            fontSize: '3.5rem', 
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🏪 Smart POS System
          </Title>
          <Paragraph style={{ 
            fontSize: '1.3rem', 
            color: 'rgba(255,255,255,0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Hệ thống quản lý bán hàng thông minh với AI, Game hóa và Real-time Analytics
          </Paragraph>
          <Tag color="gold" style={{ marginTop: '10px', fontSize: '14px' }}>
            Powered by Cloudflare Edge
          </Tag>
        </div>

        {/* Main Content */}
        {!isAuthenticated ? (
          <>
            {/* Role Cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: '60px' }}>
              <Col xs={24} md={8}>
                <Card
                  hoverable
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    textAlign: 'center',
                    height: '280px'
                  }}
                  bodyStyle={{ padding: '30px' }}
                  onClick={() => handleRoleAccess('admin')}
                >
                  <DashboardOutlined style={{ fontSize: '3rem', color: '#ffd700', marginBottom: '20px' }} />
                  <Title level={3} style={{ color: 'white', marginBottom: '15px' }}>
                    Admin Dashboard
                  </Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '20px' }}>
                    Quản lý toàn bộ hệ thống, báo cáo, phân tích dữ liệu và cấu hình AI
                  </Paragraph>
                  <Button type="primary" size="large" ghost>
                    Truy cập Dashboard
                  </Button>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card
                  hoverable
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    textAlign: 'center',
                    height: '280px'
                  }}
                  bodyStyle={{ padding: '30px' }}
                  onClick={() => handleRoleAccess('cashier')}
                >
                  <ShoppingCartOutlined style={{ fontSize: '3rem', color: '#52c41a', marginBottom: '20px' }} />
                  <Title level={3} style={{ color: 'white', marginBottom: '15px' }}>
                    POS Terminal
                  </Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '20px' }}>
                    Terminal bán hàng với quét mã vạch, thanh toán và gợi ý AI
                  </Paragraph>
                  <Button type="primary" size="large" ghost>
                    Mở Terminal
                  </Button>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card
                  hoverable
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    textAlign: 'center',
                    height: '280px'
                  }}
                  bodyStyle={{ padding: '30px' }}
                  onClick={() => handleRoleAccess('staff')}
                >
                  <TeamOutlined style={{ fontSize: '3rem', color: '#1890ff', marginBottom: '20px' }} />
                  <Title level={3} style={{ color: 'white', marginBottom: '15px' }}>
                    Staff Portal
                  </Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '20px' }}>
                    Cổng nhân viên với game hóa, theo dõi hiệu suất và đào tạo
                  </Paragraph>
                  <Button type="primary" size="large" ghost>
                    Vào Portal
                  </Button>
                </Card>
              </Col>
            </Row>

            {/* Features Grid */}
            <div style={{ marginBottom: '60px' }}>
              <Title level={2} style={{ color: 'white', textAlign: 'center', marginBottom: '40px' }}>
                ✨ Tính năng nổi bật
              </Title>
              <Row gutter={[16, 16]}>
                {[
                  { icon: '🤖', title: 'AI Recommendations', desc: 'Gợi ý sản phẩm thông minh' },
                  { icon: '📊', title: 'Real-time Analytics', desc: 'Phân tích dữ liệu thời gian thực' },
                  { icon: '🎮', title: 'Staff Gamification', desc: 'Game hóa cho nhân viên' },
                  { icon: '📱', title: 'PWA Mobile', desc: 'Hỗ trợ mobile và offline' },
                  { icon: '🔄', title: 'Offline Sync', desc: 'Đồng bộ khi mất kết nối' },
                  { icon: '⚡', title: 'Cloudflare Edge', desc: 'Tốc độ toàn cầu' }
                ].map((feature, index) => (
                  <Col xs={12} md={8} lg={4} key={index}>
                    <Card
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        textAlign: 'center',
                        height: '120px'
                      }}
                      bodyStyle={{ padding: '16px' }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                        {feature.icon}
                      </div>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
                        {feature.title}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>
                        {feature.desc}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Login Section */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <Title level={3} style={{ color: 'white', marginBottom: '20px' }}>
                Bắt đầu sử dụng ngay
              </Title>
              <Space size="large">
                <Button type="primary" size="large" onClick={handleLogin}>
                  <UserOutlined /> Đăng nhập
                </Button>
                <Button size="large" ghost>
                  <ShopOutlined /> Demo
                </Button>
              </Space>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ color: 'white' }}>
              Chào mừng, {user?.name}!
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.8)' }}>
              Đang chuyển hướng đến dashboard của bạn...
            </Paragraph>
          </div>
        )}

        {/* System Status */}
        <Card
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            textAlign: 'center'
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <Title level={4} style={{ color: 'white', marginBottom: '20px' }}>
            🚀 System Status
          </Title>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <div style={{ color: '#52c41a', fontSize: '1.5rem' }}>●</div>
              <div style={{ color: 'white', fontSize: '12px' }}>Frontend</div>
            </Col>
            <Col span={6}>
              <div style={{ color: '#faad14', fontSize: '1.5rem' }}>●</div>
              <div style={{ color: 'white', fontSize: '12px' }}>Backend</div>
            </Col>
            <Col span={6}>
              <div style={{ color: '#52c41a', fontSize: '1.5rem' }}>●</div>
              <div style={{ color: 'white', fontSize: '12px' }}>Database</div>
            </Col>
            <Col span={6}>
              <div style={{ color: '#52c41a', fontSize: '1.5rem' }}>●</div>
              <div style={{ color: 'white', fontSize: '12px' }}>CDN</div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;