import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Divider, 
  Row, 
  Col, 
  Alert,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  DashboardOutlined,
  ShoppingCartOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';

const { Title, Paragraph, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await login(values);
      
      if (result.success) {
        // Redirect based on role
        const role = values.email.includes('admin') ? 'admin' : 
                    values.email.includes('cashier') ? 'cashier' : 'staff';
        
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
            navigate(from);
        }
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    {
      role: 'Admin',
      email: 'admin@smartpos.com',
      password: 'admin123',
      icon: <DashboardOutlined />,
      color: '#ffd700',
      description: 'Quản lý toàn bộ hệ thống'
    },
    {
      role: 'Cashier',
      email: 'cashier@smartpos.com',
      password: 'cashier123',
      icon: <ShoppingCartOutlined />,
      color: '#52c41a',
      description: 'Vận hành POS Terminal'
    },
    {
      role: 'Staff',
      email: 'staff@smartpos.com',
      password: 'staff123',
      icon: <TeamOutlined />,
      color: '#1890ff',
      description: 'Theo dõi hiệu suất'
    }
  ];

  const handleDemoLogin = (demoUser) => {
    onFinish({
      email: demoUser.email,
      password: demoUser.password
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row gutter={[32, 32]} style={{ width: '100%', maxWidth: '1200px' }}>
        {/* Left Side - Login Form */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
            bodyStyle={{ padding: '40px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <Title level={2} style={{ color: '#1890ff', marginBottom: '10px' }}>
                🏪 Smart POS
              </Title>
              <Paragraph style={{ color: '#666', fontSize: '16px' }}>
                Đăng nhập vào hệ thống
              </Paragraph>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                style={{ marginBottom: '20px' }}
                onClose={() => setError('')}
              />
            )}

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập email của bạn"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{ 
                    height: '50px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  {loading ? <Spin size="small" /> : 'Đăng nhập'}
                </Button>
              </Form.Item>
            </Form>

            <Divider>
              <Text type="secondary">hoặc</Text>
            </Divider>

            <div style={{ textAlign: 'center' }}>
              <Button type="link" onClick={() => navigate('/')}>
                ← Quay lại trang chủ
              </Button>
            </div>
          </Card>
        </Col>

        {/* Right Side - Demo Accounts */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white'
            }}
            bodyStyle={{ padding: '40px' }}
          >
            <Title level={3} style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>
              🎯 Demo Accounts
            </Title>
            
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {demoLogins.map((demo, index) => (
                <Card
                  key={index}
                  hoverable
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                  bodyStyle={{ padding: '20px' }}
                  onClick={() => handleDemoLogin(demo)}
                >
                  <Row align="middle" gutter={[16, 0]}>
                    <Col flex="none">
                      <div style={{ 
                        fontSize: '2rem', 
                        color: demo.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '60px',
                        height: '60px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%'
                      }}>
                        {demo.icon}
                      </div>
                    </Col>
                    <Col flex="auto">
                      <Title level={4} style={{ color: 'white', margin: 0 }}>
                        {demo.role}
                      </Title>
                      <Paragraph style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0' }}>
                        {demo.description}
                      </Paragraph>
                      <Text code style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '12px'
                      }}>
                        {demo.email}
                      </Text>
                    </Col>
                    <Col flex="none">
                      <Button 
                        type="primary" 
                        ghost 
                        size="small"
                        loading={loading}
                      >
                        Đăng nhập
                      </Button>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ color: 'white', marginBottom: '15px' }}>
                🚀 Tính năng nổi bật
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🤖</div>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                      AI Smart
                    </Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📊</div>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                      Analytics
                    </Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🎮</div>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                      Gamification
                    </Text>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;