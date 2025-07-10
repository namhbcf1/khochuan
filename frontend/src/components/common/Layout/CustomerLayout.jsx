import React, { useState } from 'react';
import { Layout, Typography, Menu, Button, Drawer, theme } from 'antd';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  MenuOutlined, 
  HomeOutlined, 
  FileSearchOutlined, 
  InfoCircleOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const CustomerLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { token } = theme.useToken();
  const { isAuthenticated, user } = useAuth();

  // Menu items for authenticated customers
  const authenticatedMenuItems = [
    {
      key: '/customer/profile',
      icon: <UserOutlined />,
      label: <Link to="/customer/profile">Hồ sơ cá nhân</Link>,
    },
    {
      key: '/customer/warranty',
      icon: <SafetyCertificateOutlined />,
      label: <Link to="/customer/warranty">Bảo hành</Link>,
    },
    {
      key: '/customer/loyalty',
      icon: <TrophyOutlined />,
      label: <Link to="/customer/loyalty">Điểm thưởng</Link>,
    },
  ];

  // Menu items for non-authenticated users
  const publicMenuItems = [
    {
      key: '/customer-lookup',
      icon: <FileSearchOutlined />,
      label: <Link to="/customer-lookup">Tra cứu sản phẩm</Link>,
    },
    {
      key: '/terms',
      icon: <InfoCircleOutlined />,
      label: <Link to="/terms">Điều khoản bảo hành</Link>,
    },
  ];

  // Use authenticated menu if user is logged in, otherwise use public menu
  const menuItems = isAuthenticated && user?.role === 'customer' 
    ? authenticatedMenuItems 
    : publicMenuItems;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between px-4 sm:px-6 bg-white shadow-sm z-10">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Trường Phát Computer" 
              className="h-8 mr-2"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/40x40?text=TP';
              }}
            />
            <Title level={4} style={{ margin: 0, display: 'none', '@media (min-width: 640px)': { display: 'block' } }}>
              Trường Phát Computer
            </Title>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:block">
          <Menu 
            mode="horizontal" 
            selectedKeys={[location.pathname]} 
            items={menuItems}
            style={{ border: 'none', backgroundColor: 'transparent' }}
          />
        </div>

        {/* Mobile Navigation Button */}
        <Button 
          type="text"
          icon={<MenuOutlined />}
          onClick={toggleMobileMenu}
          className="sm:hidden"
        />

        {/* Mobile Navigation Drawer */}
        <Drawer
          title="Menu"
          placement="right"
          onClose={toggleMobileMenu}
          open={mobileMenuOpen}
          width={250}
        >
          <Menu 
            mode="vertical" 
            selectedKeys={[location.pathname]} 
            items={menuItems}
            style={{ border: 'none' }}
          />
        </Drawer>
      </Header>

      <Content className="p-4 sm:p-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <Outlet />
        </div>
      </Content>

      <Footer className="text-center">
        <Text type="secondary">
          © {new Date().getFullYear()} Trường Phát Computer. Tất cả quyền được bảo lưu.
        </Text>
      </Footer>
    </Layout>
  );
};

export default CustomerLayout; 