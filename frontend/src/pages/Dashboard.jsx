import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Space, Statistic, Progress } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  RiseOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect based on user role
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'cashier') {
      navigate('/cashier/pos');
    } else if (user?.role === 'staff') {
      navigate('/staff/dashboard');
    }
  }, [user, navigate]);

  // Demo statistics
  const stats = [
    {
      title: 'Doanh thu hôm nay',
      value: 15420000,
      prefix: <DollarOutlined />,
      suffix: 'VND',
      color: '#52c41a'
    },
    {
      title: 'Đơn hàng',
      value: 234,
      prefix: <ShoppingCartOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Khách hàng',
      value: 1234,
      prefix: <UserOutlined />,
      color: '#722ed1'
    },
    {
      title: 'Nhân viên',
      value: 12,
      prefix: <TeamOutlined />,
      color: '#fa8c16'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
            🏪 SmartPOS System
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>
            Hệ thống quản lý bán hàng thông minh
          </Text>
        </div>

        {/* Quick Stats */}
        <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
          {stats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card 
                style={{ 
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px'
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>{stat.title}</span>}
                  value={stat.value}
                  valueStyle={{ color: stat.color }}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Welcome Card */}
          <Col xs={24} lg={16}>
            <Card 
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                height: '100%'
              }}
            >
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Title level={2} style={{ color: 'white', marginBottom: '24px' }}>
                  Chào mừng đến với SmartPOS! 👋
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', display: 'block', marginBottom: '32px' }}>
                  Hệ thống quản lý bán hàng hiện đại với AI tích hợp, 
                  giúp tối ưu hóa doanh thu và trải nghiệm khách hàng.
                </Text>
                
                <Space size="large" wrap>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<ShoppingCartOutlined />}
                    onClick={() => navigate('/login')}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px'
                    }}
                  >
                    Bắt đầu bán hàng
                  </Button>
                  <Button 
                    size="large" 
                    icon={<UserOutlined />}
                    onClick={() => navigate('/login')}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      borderRadius: '8px'
                    }}
                  >
                    Đăng nhập
                  </Button>
                </Space>
              </div>
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col xs={24} lg={8}>
            <Card 
              title={<span style={{ color: 'white' }}>Tính năng nổi bật</span>}
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                height: '100%'
              }}
              headStyle={{ border: 'none' }}
              bodyStyle={{ padding: '20px' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a', fontSize: '24px', marginRight: '12px' }} />
                  <div>
                    <Text strong style={{ color: 'white', display: 'block' }}>AI Dự đoán</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Dự báo nhu cầu thông minh</Text>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <TrophyOutlined style={{ color: '#fa8c16', fontSize: '24px', marginRight: '12px' }} />
                  <div>
                    <Text strong style={{ color: 'white', display: 'block' }}>Gamification</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Động lực cho nhân viên</Text>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <UserOutlined style={{ color: '#1890ff', fontSize: '24px', marginRight: '12px' }} />
                  <div>
                    <Text strong style={{ color: 'white', display: 'block' }}>CRM Tích hợp</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Quản lý khách hàng toàn diện</Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Performance Overview */}
        <Row gutter={[24, 24]} style={{ marginTop: '40px' }}>
          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ color: 'white' }}>Hiệu suất hệ thống</span>}
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px'
              }}
              headStyle={{ border: 'none' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>CPU Usage</Text>
                  <Progress percent={45} strokeColor="#52c41a" />
                </div>
                <div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Memory Usage</Text>
                  <Progress percent={67} strokeColor="#1890ff" />
                </div>
                <div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Storage</Text>
                  <Progress percent={23} strokeColor="#722ed1" />
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ color: 'white' }}>Thống kê nhanh</span>}
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px'
              }}
              headStyle={{ border: 'none' }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Sản phẩm</span>}
                    value={1234}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Danh mục</span>}
                    value={89}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Nhà cung cấp</span>}
                    value={45}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Kho hàng</span>}
                    value={3}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px' }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
            © 2024 SmartPOS System. Phiên bản 1.0.0
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;