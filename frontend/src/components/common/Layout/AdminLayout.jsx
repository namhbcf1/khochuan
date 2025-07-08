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
  Breadcrumb
} from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ApiOutlined,
  RiseOutlined,
  LineChartOutlined,
  PartitionOutlined,
  SlidersOutlined,
  BankOutlined,
  SafetyOutlined,
  TagsOutlined,
  AppstoreOutlined,
  CloudOutlined,
  CreditCardOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      children: [
        {
          key: '/admin/dashboard',
          label: 'Phân tích',
        },
        {
          key: '/admin/dashboard/revenue',
          label: 'Doanh thu',
        },
        {
          key: '/admin/dashboard/performance',
          label: 'Hiệu suất',
        },
      ],
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: 'Sản phẩm',
      children: [
        {
          key: '/admin/products',
          label: 'Quản lý sản phẩm',
        },
        {
          key: '/admin/products/new',
          label: 'Thêm sản phẩm',
        },
        {
          key: '/admin/products/bulk',
          label: 'Thao tác hàng loạt',
        },
        {
          key: '/admin/products/price-optimization',
          label: 'Tối ưu giá',
        },
      ],
    },
    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: 'Kho hàng',
      children: [
        {
          key: '/admin/inventory',
          label: 'Tổng quan kho',
        },
        {
          key: '/admin/inventory/movements',
          label: 'Biến động kho',
        },
        {
          key: '/admin/inventory/forecasting',
          label: 'Dự báo nhu cầu',
        },
        {
          key: '/admin/inventory/warehouse',
          label: 'Quản lý kho',
        },
      ],
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: 'Đơn hàng',
      children: [
        {
          key: '/admin/orders',
          label: 'Quản lý đơn hàng',
        },
        {
          key: '/admin/orders/analytics',
          label: 'Phân tích đơn hàng',
        },
        {
          key: '/admin/orders/returns',
          label: 'Xử lý đổi trả',
        },
      ],
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: 'Khách hàng',
      children: [
        {
          key: '/admin/customers',
          label: 'Quản lý khách hàng',
        },
        {
          key: '/admin/customers/loyalty',
          label: 'Chương trình thân thiết',
        },
        {
          key: '/admin/customers/segmentation',
          label: 'Phân khúc khách hàng',
        },
        {
          key: '/admin/customers/personalization',
          label: 'Cá nhân hóa',
        },
      ],
    },
    {
      key: 'staff',
      icon: <TeamOutlined />,
      label: 'Nhân viên',
      children: [
        {
          key: '/admin/staff',
          label: 'Quản lý nhân viên',
        },
        {
          key: '/admin/staff/performance',
          label: 'Theo dõi hiệu suất',
        },
        {
          key: '/admin/staff/gamification',
          label: 'Cấu hình game hóa',
        },
        {
          key: '/admin/staff/commissions',
          label: 'Thiết lập hoa hồng',
        },
      ],
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
      children: [
        {
          key: '/admin/reports',
          label: 'Trung tâm báo cáo',
        },
        {
          key: '/admin/reports/custom',
          label: 'Báo cáo tùy chỉnh',
        },
        {
          key: '/admin/reports/omnichannel',
          label: 'Phân tích đa kênh',
        },
        {
          key: '/admin/reports/business-intelligence',
          label: 'Thông minh kinh doanh',
        },
      ],
    },
    {
      key: 'integrations',
      icon: <ApiOutlined />,
      label: 'Tích hợp',
      children: [
        {
          key: '/admin/integrations',
          label: 'Kênh thương mại điện tử',
        },
        {
          key: '/admin/integrations/payments',
          label: 'Cổng thanh toán',
        },
        {
          key: '/admin/integrations/apps',
          label: 'Ứng dụng bên thứ 3',
        },
        {
          key: '/admin/integrations/api',
          label: 'Quản lý API',
        },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      children: [
        {
          key: '/admin/settings',
          label: 'Cài đặt hệ thống',
        },
        {
          key: '/admin/settings/roles',
          label: 'Phân quyền',
        },
        {
          key: '/admin/settings/security',
          label: 'Bảo mật',
        },
        {
          key: '/admin/settings/company',
          label: 'Thông tin công ty',
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
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => navigate('/admin/settings'),
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
        title: 'Admin',
      }
    ];

    if (pathSegments.length > 1) {
      const currentPage = pathSegments[1];
      const pageNames = {
        dashboard: 'Dashboard',
        products: 'Sản phẩm',
        inventory: 'Kho hàng',
        orders: 'Đơn hàng',
        customers: 'Khách hàng',
        staff: 'Nhân viên',
        reports: 'Báo cáo',
        integrations: 'Tích hợp',
        settings: 'Cài đặt',
      };
      items.push({
        title: pageNames[currentPage] || currentPage,
      });

      if (pathSegments.length > 2) {
        const subPage = pathSegments[2];
        const subPageNames = {
          // Dashboard
          revenue: 'Doanh thu',
          performance: 'Hiệu suất',
          // Products
          new: 'Thêm sản phẩm',
          bulk: 'Thao tác hàng loạt',
          'price-optimization': 'Tối ưu giá',
          // Inventory
          movements: 'Biến động kho',
          forecasting: 'Dự báo nhu cầu',
          warehouse: 'Quản lý kho',
          // Orders
          analytics: 'Phân tích đơn hàng',
          returns: 'Xử lý đổi trả',
          // Customers
          loyalty: 'Chương trình thân thiết',
          segmentation: 'Phân khúc khách hàng',
          personalization: 'Cá nhân hóa',
          // Staff
          performance: 'Theo dõi hiệu suất',
          gamification: 'Cấu hình game hóa',
          commissions: 'Thiết lập hoa hồng',
          // Reports
          custom: 'Báo cáo tùy chỉnh',
          omnichannel: 'Phân tích đa kênh',
          'business-intelligence': 'Thông minh kinh doanh',
          // Integrations
          payments: 'Cổng thanh toán',
          apps: 'Ứng dụng bên thứ 3',
          api: 'Quản lý API',
          // Settings
          roles: 'Phân quyền',
          security: 'Bảo mật',
          company: 'Thông tin công ty',
        };
        items.push({
          title: subPageNames[subPage] || subPage,
        });
      }
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
          background: '#001529',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{
          height: '64px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid #303030',
        }}>
          {!collapsed ? (
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              🏪 Smart POS
            </Title>
          ) : (
            <span style={{ fontSize: '24px' }}>🏪</span>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={collapsed ? [] : ['dashboard', 'products', 'inventory', 'orders', 'customers', 'staff', 'reports', 'integrations', 'settings']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
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
            <Badge count={5} size="small">
              <Button type="text" icon={<BellOutlined />} />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text strong>{user?.name || 'Admin'}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Quản trị viên
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;