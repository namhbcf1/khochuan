import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Button,
  Space,
  Typography,
  Breadcrumb,
  Card,
  Progress,
  Statistic
} from 'antd';
import {
  DashboardOutlined,
  TrophyOutlined,
  ShoppingOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  StarOutlined,
  FireOutlined,
  GiftOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const StaffLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/staff/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/staff/leaderboard',
      icon: <TrophyOutlined />,
      label: 'Bảng xếp hạng',
    },
    {
      key: '/staff/sales',
      icon: <ShoppingOutlined />,
      label: 'Doanh số',
    },
    {
      key: '/staff/training',
      icon: <BookOutlined />,
      label: 'Đào tạo',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [
      {
        title: 'Staff Portal',
      }
    ];

    if (pathSegments.length > 1) {
      const currentPage = pathSegments[1];
      const pageNames = {
        dashboard: 'Dashboard',
        leaderboard: 'Bảng xếp hạng',
        sales: 'Doanh số',
        training: 'Đào tạo',
      };
      items.push({
        title: pageNames[currentPage] || currentPage,
      });
    }

    return items;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{
          height: '64px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
        }}>
          {!collapsed ? (
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              🎮 Staff Portal
            </Title>
          ) : (
            <span style={{ fontSize: '24px' }}>🎮</span>
          )}
        </div>

        {!collapsed && (
          <div style={{ padding: '16px' }}>
            {/* User Level Card */}
            <Card
              size="small"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                marginBottom: '16px'
              }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <Avatar
                  size={64}
                  icon={<UserOutlined />}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    marginBottom: '8px'
                  }}
                />
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                  Level 12 Ninja
                </div>
                <Progress
                  percent={75}
                  showInfo={false}
                  strokeColor={{
                    '0%': '#ffd700',
                    '100%': '#ff6b35',
                  }}
                  style={{ marginBottom: '8px' }}
                />
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                  750/1000 XP đến Level 13
                </Text>
              </div>
            </Card>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Card
                size="small"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none' }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px' }}>Hôm nay</span>}
                  value={15}
                  valueStyle={{ color: '#ffd700', fontSize: '16px' }}
                  prefix={<StarOutlined />}
                />
              </Card>
              <Card
                size="small"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none' }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px' }}>Streak</span>}
                  value={7}
                  valueStyle={{ color: '#ff4d4f', fontSize: '16px' }}
                  prefix={<FireOutlined />}
                  suffix="ngày"
                />
              </Card>
            </div>
          </div>
        )}

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            background: 'transparent'
          }}
        />

        {!collapsed && (
          <div style={{ padding: '16px', marginTop: 'auto' }}>
            <Card
              size="small"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <GiftOutlined style={{ color: '#ffd700', fontSize: '24px', marginBottom: '8px' }} />
              <Text style={{ color: 'white', fontSize: '12px', display: 'block' }}>
                Bạn có 3 phần thưởng chưa nhận!
              </Text>
              <Button
                type="primary"
                size="small"
                style={{
                  marginTop: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none'
                }}
              >
                Nhận ngay
              </Button>
            </Card>
          </div>
        )}
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', marginRight: '16px' }}
            />

            <Breadcrumb items={getBreadcrumbItems()} />
          </div>

          <Space size="middle">
            <Space>
              <Badge count={3} size="small">
                <GiftOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
              </Badge>
              <Text strong>Xếp hạng: #5</Text>
            </Space>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: '8px', background: '#1890ff' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text strong>{user?.name || 'Staff'}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Level 12 Ninja
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffLayout;