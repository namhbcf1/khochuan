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
  GiftOutlined,
  RocketOutlined,
  TeamOutlined,
  BarChartOutlined,
  IdcardOutlined,
  AimOutlined,
  SettingOutlined
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
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      children: [
        {
          key: '/staff/dashboard',
          label: 'Tổng quan',
        },
        {
          key: '/staff/dashboard/performance',
          label: 'Hiệu suất',
        },
        {
          key: '/staff/dashboard/commission',
          label: 'Hoa hồng',
        },
        {
          key: '/staff/dashboard/goals',
          label: 'Mục tiêu',
        }
      ]
    },
    {
      key: 'gamification',
      icon: <TrophyOutlined />,
      label: 'Game hóa',
      children: [
        {
          key: '/staff/leaderboard',
          label: 'Bảng xếp hạng',
        },
        {
          key: '/staff/achievements',
          label: 'Thành tích',
        },
        {
          key: '/staff/badges',
          label: 'Huy hiệu',
        },
        {
          key: '/staff/challenges',
          label: 'Thử thách',
        },
        {
          key: '/staff/rewards',
          label: 'Phần thưởng',
        },
        {
          key: '/staff/competitions',
          label: 'Cuộc thi nhóm',
        }
      ]
    },
    {
      key: 'sales',
      icon: <ShoppingOutlined />,
      label: 'Bán hàng',
      children: [
        {
          key: '/staff/sales',
          label: 'Doanh số của tôi',
        },
        {
          key: '/staff/sales/targets',
          label: 'Mục tiêu',
        },
        {
          key: '/staff/sales/recommendations',
          label: 'Gợi ý sản phẩm',
        },
        {
          key: '/staff/sales/customers',
          label: 'Khách hàng',
        }
      ]
    },
    {
      key: 'training',
      icon: <BookOutlined />,
      label: 'Đào tạo',
      children: [
        {
          key: '/staff/training',
          label: 'Trung tâm đào tạo',
        },
        {
          key: '/staff/training/products',
          label: 'Kiến thức sản phẩm',
        },
        {
          key: '/staff/training/skills',
          label: 'Kỹ năng bán hàng',
        },
        {
          key: '/staff/training/certifications',
          label: 'Chứng chỉ',
        }
      ]
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ',
      children: [
        {
          key: '/staff/profile',
          label: 'Thông tin cá nhân',
        },
        {
          key: '/staff/profile/performance',
          label: 'Lịch sử hiệu suất',
        },
        {
          key: '/staff/profile/commission',
          label: 'Lịch sử hoa hồng',
        },
        {
          key: '/staff/profile/preferences',
          label: 'Tùy chọn',
        }
      ]
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/staff/profile'),
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
        achievements: 'Thành tích',
        badges: 'Huy hiệu',
        challenges: 'Thử thách',
        rewards: 'Phần thưởng',
        competitions: 'Cuộc thi nhóm',
        sales: 'Doanh số',
        training: 'Đào tạo',
        profile: 'Hồ sơ',
      };
      items.push({
        title: pageNames[currentPage] || currentPage,
      });

      if (pathSegments.length > 2) {
        const subPage = pathSegments[2];
        const subPageNames = {
          // Dashboard
          performance: 'Hiệu suất',
          commission: 'Hoa hồng',
          goals: 'Mục tiêu',
          // Sales
          targets: 'Mục tiêu bán hàng',
          recommendations: 'Gợi ý sản phẩm',
          customers: 'Khách hàng',
          // Training
          products: 'Kiến thức sản phẩm',
          skills: 'Kỹ năng bán hàng',
          certifications: 'Chứng chỉ',
          // Profile
          performance: 'Lịch sử hiệu suất',
          commission: 'Lịch sử hoa hồng',
          preferences: 'Tùy chọn',
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
          defaultOpenKeys={collapsed ? [] : ['dashboard', 'gamification', 'sales', 'training', 'profile']}
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
                onClick={() => navigate('/staff/rewards')}
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
            {/* Notifications */}
            <Badge count={3} size="small">
              <Button type="text" icon={<GiftOutlined />} />
            </Badge>
            
            {/* Missions */}
            <Badge count={2} size="small">
              <Button type="text" icon={<RocketOutlined />} />
            </Badge>

            {/* User dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Badge dot offset={[-5, 5]}>
                  <Avatar icon={<UserOutlined />} style={{ marginRight: '8px', background: '#1890ff' }} />
                </Badge>
                <div>
                  <Text strong>{user?.name || 'Staff User'}</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Level 12 • Ninja
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

export default StaffLayout;