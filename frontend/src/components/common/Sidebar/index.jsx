import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  BarChartOutlined,
  ShopOutlined,
  FileTextOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  TagOutlined,
  DollarOutlined,
  RobotOutlined,
  AppstoreOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';
import './styles.css';

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  // Define the navigation items based on user role
  const getNavItems = () => {
    const role = user?.role || 'guest';
    
    const adminItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        path: '/admin/dashboard'
      },
      {
        key: 'ai',
        icon: <RobotOutlined />,
        label: 'AI Insights',
        path: '/admin/ai-insights'
      },
      {
        key: 'products',
        icon: <ShoppingOutlined />,
        label: 'Products',
        children: [
          {
            key: 'product-management',
            label: 'Product Management',
            path: '/admin/products'
          },
          {
            key: 'price-optimization',
            label: 'Price Optimization',
            path: '/admin/products/price-optimization'
          },
          {
            key: 'categories',
            label: 'Categories',
            path: '/admin/products/categories'
          },
          {
            key: 'inventory',
            label: 'Inventory',
            path: '/admin/inventory'
          }
        ]
      },
      {
        key: 'customers',
        icon: <UserOutlined />,
        label: 'Customers',
        children: [
          {
            key: 'customer-management',
            label: 'Customer Management',
            path: '/admin/customers'
          },
          {
            key: 'customer-segmentation',
            label: 'Customer Segmentation',
            path: '/admin/customers/segmentation'
          },
          {
            key: 'loyalty',
            label: 'Loyalty Program',
            path: '/admin/customers/loyalty'
          }
        ]
      },
      {
        key: 'orders',
        icon: <FileTextOutlined />,
        label: 'Orders',
        children: [
          {
            key: 'order-management',
            label: 'Order Management',
            path: '/admin/orders'
          },
          {
            key: 'returns',
            label: 'Returns & Refunds',
            path: '/admin/orders/returns'
          }
        ]
      },
      {
        key: 'staff',
        icon: <TeamOutlined />,
        label: 'Staff',
        children: [
          {
            key: 'staff-management',
            label: 'Staff Management',
            path: '/admin/staff'
          },
          {
            key: 'gamification',
            label: 'Gamification',
            path: '/admin/staff/gamification'
          },
          {
            key: 'performance',
            label: 'Performance',
            path: '/admin/staff/performance'
          }
        ]
      },
      {
        key: 'analytics',
        icon: <BarChartOutlined />,
        label: 'Analytics',
        children: [
          {
            key: 'sales-analytics',
            label: 'Sales Analytics',
            path: '/admin/analytics/sales'
          },
          {
            key: 'inventory-analytics',
            label: 'Inventory Analytics',
            path: '/admin/analytics/inventory'
          },
          {
            key: 'customer-analytics',
            label: 'Customer Analytics',
            path: '/admin/analytics/customers'
          },
          {
            key: 'reports',
            label: 'Reports',
            path: '/admin/analytics/reports'
          }
        ]
      },
      {
        key: 'integrations',
        icon: <GlobalOutlined />,
        label: 'Integrations',
        children: [
          {
            key: 'ecommerce',
            label: 'E-commerce',
            path: '/admin/integrations/ecommerce'
          },
          {
            key: 'payment',
            label: 'Payment Gateways',
            path: '/admin/integrations/payment'
          },
          {
            key: 'api',
            label: 'API Management',
            path: '/admin/integrations/api'
          }
        ]
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Settings',
        path: '/admin/settings'
      }
    ];
    
    const cashierItems = [
      {
        key: 'pos',
        icon: <ShopOutlined />,
        label: 'POS Terminal',
        path: '/cashier/pos'
      },
      {
        key: 'customers',
        icon: <UserOutlined />,
        label: 'Customers',
        path: '/cashier/customers'
      },
      {
        key: 'orders',
        icon: <FileTextOutlined />,
        label: 'Orders',
        path: '/cashier/orders'
      },
      {
        key: 'session',
        icon: <DollarOutlined />,
        label: 'Session',
        path: '/cashier/session'
      }
    ];
    
    const staffItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        path: '/staff/dashboard'
      },
      {
        key: 'sales',
        icon: <TagOutlined />,
        label: 'My Sales',
        path: '/staff/sales'
      },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'My Profile',
        path: '/staff/profile'
      },
      {
        key: 'gamification',
        icon: <AppstoreOutlined />,
        label: 'Achievements',
        path: '/staff/gamification'
      }
    ];
    
    switch (role) {
      case 'admin':
        return adminItems;
      case 'cashier':
        return cashierItems;
      case 'staff':
        return staffItems;
      default:
        return [];
    }
  };
  
  const renderMenuItems = (items) => {
    return items.map(item => {
      if (item.children) {
        return (
          <SubMenu key={item.key} icon={item.icon} title={item.label}>
            {renderMenuItems(item.children)}
          </SubMenu>
        );
      }
      
      return (
        <Menu.Item key={item.key} icon={item.icon}>
          <Link to={item.path}>{item.label}</Link>
        </Menu.Item>
      );
    });
  };
  
  const getSelectedKeys = () => {
    const path = location.pathname;
    const navItems = getNavItems();
    
    // Flatten all navigation items
    const flattenItems = (items) => {
      return items.reduce((acc, item) => {
        if (item.children) {
          return [...acc, ...flattenItems(item.children)];
        }
        return [...acc, item];
      }, []);
    };
    
    const allItems = flattenItems(navItems);
    
    // Find the item that matches the current path
    const matchedItem = allItems.find(item => path === item.path || path.startsWith(item.path + '/'));
    
    return matchedItem ? [matchedItem.key] : [];
  };
  
  const getOpenKeys = () => {
    const selectedKeys = getSelectedKeys();
    if (selectedKeys.length === 0) return [];
    
    const navItems = getNavItems();
    
    // Find parent keys
    const findParentKeys = (items, targetKey, parents = []) => {
      for (const item of items) {
        if (item.key === targetKey) {
          return parents;
        }
        
        if (item.children) {
          const result = findParentKeys(item.children, targetKey, [...parents, item.key]);
          if (result.length > 0) {
            return result;
          }
        }
      }
      
      return [];
    };
    
    return findParentKeys(navItems, selectedKeys[0]);
  };
  
  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={toggleCollapsed}
      className="app-sidebar"
    >
      <div className="logo">
        {collapsed ? 'KC' : 'KhoChuan POS'}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
      >
        {renderMenuItems(getNavItems())}
      </Menu>
      
      <div className="sidebar-footer">
        <Button 
          type="text" 
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          className="collapse-button"
        />
      </div>
    </Sider>
  );
};

export default Sidebar; 