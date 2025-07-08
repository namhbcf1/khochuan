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
  Tag,
  Divider
} from 'antd';
import {
  ShoppingCartOutlined,
  FileSearchOutlined,
  UserOutlined,
  CalendarOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  AppstoreOutlined,
  DollarOutlined,
  PieChartOutlined,
  PrinterOutlined,
  ReloadOutlined,
  BarcodeOutlined,
  CreditCardOutlined,
  TeamOutlined,
  GiftOutlined
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
      key: 'pos',
      icon: <ShoppingCartOutlined />,
      label: 'Bán hàng',
      children: [
        {
          key: '/cashier/pos',
          label: 'Màn hình bán hàng',
        },
        {
          key: '/cashier/pos/products',
          label: 'Chọn sản phẩm',
        },
        {
          key: '/cashier/pos/cart',
          label: 'Giỏ hàng',
        },
        {
          key: '/cashier/pos/payment',
          label: 'Thanh toán',
        },
        {
          key: '/cashier/pos/receipt',
          label: 'In hóa đơn',
        },
        {
          key: '/cashier/pos/suggestions',
          label: 'Gợi ý thông minh',
        },
      ],
    },
    {
      key: 'orders',
      icon: <FileSearchOutlined />,
      label: 'Đơn hàng',
      children: [
        {
          key: '/cashier/orders',
          label: 'Lịch sử đơn hàng',
        },
        {
          key: '/cashier/orders/returns',
          label: 'Xử lý đổi trả',
        },
        {
          key: '/cashier/orders/tracking',
          label: 'Theo dõi đơn hàng',
        },
      ],
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: 'Khách hàng',
      children: [
        {
          key: '/cashier/customers',
          label: 'Tra cứu khách hàng',
        },
        {
          key: '/cashier/customers/loyalty',
          label: 'Điểm thưởng',
        },
        {
          key: '/cashier/customers/membership',
          label: 'Kiểm tra thành viên',
        },
      ],
    },
    {
      key: 'session',
      icon: <CalendarOutlined />,
      label: 'Ca làm việc',
      children: [
        {
          key: '/cashier/session/start',
          label: 'Mở ca',
        },
        {
          key: '/cashier/session/end',
          label: 'Đóng ca',
        },
        {
          key: '/cashier/session/cash',
          label: 'Kiểm đếm tiền',
        },
        {
          key: '/cashier/session/reports',
          label: 'Báo cáo ca',
        },
      ],
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
        title: 'Thu ngân',
      }
    ];

    if (pathSegments.length > 1) {
      const currentPage = pathSegments[1];
      const pageNames = {
        pos: 'Bán hàng',
        orders: 'Đơn hàng',
        customers: 'Khách hàng',
        session: 'Ca làm việc',
      };
      items.push({
        title: pageNames[currentPage] || currentPage,
      });

      if (pathSegments.length > 2) {
        const subPage = pathSegments[2];
        const subPageNames = {
          // POS
          products: 'Chọn sản phẩm',
          cart: 'Giỏ hàng',
          payment: 'Thanh toán',
          receipt: 'In hóa đơn',
          suggestions: 'Gợi ý thông minh',
          // Orders
          returns: 'Xử lý đổi trả',
          tracking: 'Theo dõi đơn hàng',
          // Customers
          loyalty: 'Điểm thưởng',
          membership: 'Kiểm tra thành viên',
          // Session
          start: 'Mở ca',
          end: 'Đóng ca',
          cash: 'Kiểm đếm tiền',
          reports: 'Báo cáo ca',
        };
        items.push({
          title: subPageNames[subPage] || subPage,
        });
      }
    }

    return items;
  };

  const currentTime = new Date().toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          background: '#052c65',
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
              🖥️ Trường Phát
            </Title>
          ) : (
            <span style={{ fontSize: '24px' }}>🖥️</span>
          )}
        </div>

        {!collapsed && (
          <div style={{ padding: '12px 16px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ color: '#d6e4ff' }}>Ca hiện tại:</Text>
              <Text strong style={{ color: 'white' }}>Ca sáng</Text>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ color: '#d6e4ff' }}>Bắt đầu:</Text>
              <Text strong style={{ color: 'white' }}>08:00</Text>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ color: '#d6e4ff' }}>Hiện tại:</Text>
              <Text strong style={{ color: 'white' }}>{currentTime}</Text>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ color: '#d6e4ff' }}>Trạng thái:</Text>
              <Tag color="success" style={{ margin: 0 }}>Đang hoạt động</Tag>
            </div>

            <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.2)' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ color: '#d6e4ff' }}>Đơn hôm nay:</Text>
              <Text strong style={{ color: 'white' }}>24</Text>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ color: '#d6e4ff' }}>Doanh thu:</Text>
              <Text strong style={{ color: '#52c41a' }}>4,520,000đ</Text>
            </div>
          </div>
        )}

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={collapsed ? [] : ['pos', 'orders', 'customers', 'session']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            border: 'none',
            background: 'transparent'
          }}
        />

        {!collapsed && (
          <div style={{ padding: '16px', marginTop: 'auto' }}>
            <Space style={{ width: '100%' }} direction="vertical">
              <Button 
                type="primary" 
                icon={<PrinterOutlined />} 
                block
                style={{ marginBottom: '8px', background: '#1890ff' }}
              >
                In báo cáo ca
              </Button>
              
              <Button 
                danger
                icon={<LogoutOutlined />} 
                block
                onClick={() => navigate('/cashier/session/end')}
              >
                Đóng ca
              </Button>
            </Space>
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
            {/* Quick access */}
            <Space>
              <Button type="primary" icon={<BarcodeOutlined />}>
                Quét mã
              </Button>
              
              <Button icon={<ReloadOutlined />}>
                Làm mới
              </Button>
            </Space>

            {/* Notifications */}
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined />} />
            </Badge>

            {/* User dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: '8px', background: '#052c65' }} />
                <div>
                  <Text strong>{user?.name || 'Cashier'}</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Thu ngân
                    </Text>
                  </div>
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default CashierLayout;