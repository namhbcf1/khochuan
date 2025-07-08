import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Space, Alert, Divider, Tag } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, PhoneOutlined, FacebookOutlined, MessageOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';

const { Title, Text, Paragraph } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await login({
        email: values.email,
        password: values.password
      });
      
      if (result.success) {
        // Redirect will be handled by AuthContext
      } else {
        setError('Email hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi đăng nhập');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (email, password) => {
    form.setFieldsValue({ email, password });
    handleLogin({ email, password });
  };

  const demoAccounts = [
    {
      role: 'Admin',
      email: 'admin@truongphat.com',
      password: 'admin123',
      color: '#722ed1',
      description: 'Quản lý toàn bộ hệ thống'
    },
    {
      role: 'Cashier',
      email: 'cashier@truongphat.com',
      password: 'cashier123',
      color: '#52c41a',
      description: 'Thu ngân, bán hàng'
    },
    {
      role: 'Staff',
      email: 'staff@truongphat.com',
      password: 'staff123',
      color: '#1890ff',
      description: 'Nhân viên bán hàng'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={1} style={{ color: 'white', marginBottom: '8px' }}>
            💻 Trường Phát Computer
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
            Đăng nhập vào hệ thống quản lý bán hàng
          </Text>
        </div>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {/* Login Form */}
          <Card 
            style={{ 
              flex: 1,
              minWidth: '400px',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Title level={3} style={{ marginBottom: '8px' }}>
                Đăng nhập
              </Title>
              <Text type="secondary">
                Nhập thông tin tài khoản của bạn
              </Text>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: '24px' }}
              />
            )}

            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
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
                  placeholder="admin@truongphat.com"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  icon={<LoginOutlined />}
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Text type="secondary">
                Chưa có tài khoản? Liên hệ quản trị viên
              </Text>
            </div>
          </Card>

          {/* Demo Accounts and Contact Info */}
          <Card
            title={
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>
                  🎭 Tài khoản Demo
                </Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Nhấn để đăng nhập nhanh
                </Text>
              </div>
            }
            style={{
              flex: 1,
              minWidth: '350px',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none'
            }}
            headStyle={{ border: 'none', paddingBottom: '16px' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {demoAccounts.map((account, index) => (
                <Card
                  key={index}
                  size="small"
                  hoverable
                  onClick={() => handleDemoLogin(account.email, account.password)}
                  style={{
                    borderRadius: '12px',
                    border: `1px solid ${account.color}20`,
                    background: `${account.color}05`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <Tag color={account.color} style={{ margin: 0, marginRight: '8px' }}>
                          {account.role}
                        </Tag>
                        <Text strong style={{ color: account.color }}>
                          {account.email}
                        </Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {account.description}
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      style={{
                        background: account.color,
                        border: 'none',
                        borderRadius: '6px'
                      }}
                    >
                      Đăng nhập
                    </Button>
                  </div>
                </Card>
              ))}
            </Space>

            <Divider style={{ margin: '24px 0' }} />

            <div style={{ textAlign: 'center' }}>
              <Title level={5} style={{ marginBottom: '16px' }}>
                📞 Liên Hệ Trường Phát Computer Hòa Bình
              </Title>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Card size="small" style={{ borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneOutlined style={{ fontSize: '20px', color: '#1677ff', marginRight: '12px' }} />
                    <div>
                      <Text strong>Hotline</Text>
                      <div><a href="tel:0836768597">0836.768.597</a></div>
                    </div>
                  </div>
                </Card>
                
                <Card size="small" style={{ borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MessageOutlined style={{ fontSize: '20px', color: '#1677ff', marginRight: '12px' }} />
                    <div>
                      <Text strong>Zalo</Text>
                      <div><a href="https://zalo.me/0836768597" target="_blank" rel="noopener noreferrer">0836.768.597</a></div>
                    </div>
                  </div>
                </Card>
                
                <Card size="small" style={{ borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FacebookOutlined style={{ fontSize: '20px', color: '#1677ff', marginRight: '12px' }} />
                    <div>
                      <Text strong>Facebook</Text>
                      <div><a href="https://www.facebook.com/truongphatcomputerhoabinh" target="_blank" rel="noopener noreferrer">Trường Phát Computer Hòa Bình</a></div>
                    </div>
                  </div>
                </Card>
              </Space>
            </div>
          </Card>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
            © {new Date().getFullYear()} Trường Phát Computer. Tất cả quyền được bảo lưu.
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Login;