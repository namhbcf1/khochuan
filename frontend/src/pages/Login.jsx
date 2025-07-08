import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Space, Alert, Divider, Tag, Checkbox, notification } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, PhoneOutlined, FacebookOutlined, MessageOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';

const { Title, Text, Paragraph } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Check for saved credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem('truongphat_remember_email');
    if (savedEmail) {
      form.setFieldsValue({ email: savedEmail });
      setRememberMe(true);
    }
  }, [form]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = async (values) => {
    if (!networkStatus) {
      notification.error({
        message: 'Không có kết nối mạng',
        description: 'Vui lòng kiểm tra kết nối internet và thử lại.',
        duration: 4,
      });
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('truongphat_remember_email', values.email);
      } else {
        localStorage.removeItem('truongphat_remember_email');
      }

      const result = await login({
        email: values.email,
        password: values.password
      });
      
      if (result.success) {
        // Redirect will be handled by AuthContext
        notification.success({
          message: 'Đăng nhập thành công',
          description: `Chào mừng ${result.user.name} đã quay trở lại!`,
          duration: 2,
        });
      } else {
        setError(result.error || 'Email hoặc mật khẩu không đúng');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
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

  // Form validation rules
  const emailRules = [
    { required: true, message: 'Vui lòng nhập email!' },
    { type: 'email', message: 'Email không hợp lệ!' },
    { max: 50, message: 'Email không được vượt quá 50 ký tự!' },
  ];

  const passwordRules = [
    { required: true, message: 'Vui lòng nhập mật khẩu!' },
    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
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

        {!networkStatus && (
          <Alert
            message="Không có kết nối mạng"
            description="Bạn đang ở chế độ ngoại tuyến. Một số tính năng có thể không hoạt động cho đến khi kết nối được khôi phục."
            type="warning"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        )}

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
                closable
                onClose={() => setError('')}
              />
            )}

            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
              layout="vertical"
              size="large"
              initialValues={{ remember: rememberMe }}
            >
              <Form.Item
                name="email"
                label="Email"
                rules={emailRules}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="admin@truongphat.com"
                  style={{ borderRadius: '8px' }}
                  disabled={loading}
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={passwordRules}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  style={{ borderRadius: '8px' }}
                  disabled={loading}
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Checkbox 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  >
                    Ghi nhớ đăng nhập
                  </Checkbox>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  icon={loading ? <LoadingOutlined /> : <LoginOutlined />}
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
                  hoverable={!loading}
                  onClick={() => !loading && handleDemoLogin(account.email, account.password)}
                  style={{
                    borderRadius: '12px',
                    border: `1px solid ${account.color}20`,
                    background: `${account.color}05`,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: loading ? 0.7 : 1
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
                      loading={loading}
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