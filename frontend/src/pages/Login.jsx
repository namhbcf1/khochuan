import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Form, Input, Button, Checkbox, Card, Typography, Alert, Layout,
  Row, Col, Divider, Space, Spin
} from 'antd';
import {
  UserOutlined, LockOutlined, LoginOutlined
} from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

/**
 * Trang đăng nhập vào hệ thống
 */
const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();

  const [loginError, setLoginError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Xác định trang cần chuyển hướng sau khi đăng nhập
  const from = location.state?.from || '/';

  // Nếu đã đăng nhập, chuyển hướng đến trang đích
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onFinish = async (values) => {
    setProcessing(true);
    setLoginError('');
    
    try {
      const { username, password, remember } = values;
      await login(username, password, remember);
      // Chuyển hướng sẽ được xử lý bởi useEffect
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Đăng nhập không thành công. Vui lòng kiểm tra thông tin đăng nhập.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh'
      }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '50px 0' }}>
        <Row justify="center" align="middle" style={{ minHeight: '100%' }}>
          <Col xs={22} sm={16} md={10} lg={8} xl={6}>
            <Card
              bordered={false}
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: '8px'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Title level={2} style={{ marginBottom: 0 }}>🖥️ Trường Phát POS</Title>
                <Paragraph type="secondary">Đăng nhập để tiếp tục</Paragraph>
              </div>

              {loginError && (
                <Alert
                  message="Lỗi đăng nhập"
                  description={loginError}
                  type="error"
                  showIcon
                  closable
                  style={{ marginBottom: '24px' }}
                />
              )}

              <Form
                name="login"
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  remember: true,
                }}
              >
                <Form.Item
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập tên đăng nhập!',
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    size="large"
                    placeholder="Tên đăng nhập"
                    disabled={processing}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập mật khẩu!',
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    size="large"
                    placeholder="Mật khẩu"
                    disabled={processing}
                  />
                </Form.Item>

                <Form.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox disabled={processing}>Ghi nhớ đăng nhập</Checkbox>
                    </Form.Item>

                    <Link to="/forgot-password">
                      Quên mật khẩu?
                    </Link>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<LoginOutlined />}
                    size="large"
                    block
                    loading={processing}
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>
              </Form>

              <Divider>
                <Text type="secondary">hoặc đăng nhập với vai trò</Text>
              </Divider>

              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  block
                  onClick={() => {
                    form.setFieldsValue({
                      username: 'admin',
                      password: 'admin123'
                    });
                    form.submit();
                  }}
                  disabled={processing}
                >
                  Quản trị viên (Demo)
                </Button>
                
                <Button 
                  block
                  onClick={() => {
                    form.setFieldsValue({
                      username: 'cashier',
                      password: 'cashier123'
                    });
                    form.submit();
                  }}
                  disabled={processing}
                >
                  Thu ngân (Demo)
                </Button>
                
                <Button 
                  block
                  onClick={() => {
                    form.setFieldsValue({
                      username: 'staff',
                      password: 'staff123'
                    });
                    form.submit();
                  }}
                  disabled={processing}
                >
                  Nhân viên (Demo)
                </Button>
              </Space>
              
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Text type="secondary">
                  © {new Date().getFullYear()} Trường Phát Computer Hòa Bình
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Login;