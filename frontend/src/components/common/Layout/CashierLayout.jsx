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
  Statistic
} from 'antd';
import {
  ShoppingCartOutlined,
  HistoryOutlined,
  UserOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DollarOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const CashierLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/cashier/pos',
      icon: <ShoppingCartOutlined />,
      label: 'POS Terminal',
    },
    {
      key: '/cashier/orders',
      icon: <HistoryOutlined />,
      label: 'Lịch sử đơn hàng',
    },
    {
      key: '/cashier/customers',
      icon: <UserOutlined />,
      label: 'Khách hàng',
    },
    {
      key: '/cashier/session',
      icon: <ClockCircleOutlined />,
      label: 'Quản lý ca',
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
        title: 'Cashier',
      }
    ];

    if (pathSegments.length > 1) {
      const currentPage = pathSegments[1];
      const pageNames = {
        pos: 'POS Terminal',
        orders: 'Lịch sử đơn hàng',
        customers: 'Khách hàng',
        session: 'Quản lý ca',
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
        width={250}
        style={{
          background: '#52c41a',
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
              💰 POS Terminal
            </Title>
          ) : (
            <span style={{ fontSize: '24px' }}>💰</span>
          )}
        </div>

        {!collapsed && (
          <div style={{ padding: '16px' }}>
            <Card size="small" style={{ background: 'rgba(255,255,255,0.1)', border: 'none' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Doanh thu ca này</span>}
                value={1250000}
                precision={0}
                valueStyle={{ color: 'white', fontSize: '18px' }}
                prefix={<DollarOutlined />}
                suffix="đ"
              />
            </Card>
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
              <ShoppingOutlined style={{ color: '#52c41a' }} />
              <Text strong>Ca: 08:00 - 16:00</Text>
            </Space>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: '8px', background: '#52c41a' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text strong>{user?.name || 'Cashier'}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Thu ngân
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

export default CashierLayout;