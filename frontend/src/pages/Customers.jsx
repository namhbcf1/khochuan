import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Table, 
  Tabs, 
  Input, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Statistic, 
  Avatar,
  Dropdown,
  Menu,
  Tooltip,
  Badge,
  Select,
  Divider,
  Empty,
  message
} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  SearchOutlined, 
  PlusOutlined, 
  ExportOutlined, 
  ImportOutlined,
  FilterOutlined, 
  SettingOutlined, 
  BarChartOutlined,
  PieChartOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ShoppingOutlined,
  WalletOutlined,
  DownOutlined,
  MailOutlined,
  PhoneOutlined,
  EllipsisOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { api } from '../services/api';
import { CustomerSegmentationService } from '../services/ai/customerSegmentation';

// Setup dayjs plugins
dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * Main Customers page component
 * Acts as a hub for customer-related functionality
 */
const Customers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [customerStats, setCustomerStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    new: 0,
    vip: 0,
    withOrders: 0
  });

  // Load customers data
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle filtering and searching
  useEffect(() => {
    if (!customers.length) return;
    
    let result = [...customers];
    
    // Apply search filter
    if (searchText) {
      result = result.filter(
        customer =>
          customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          customer.phone?.includes(searchText)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(customer => customer.status === statusFilter);
    }
    
    // Apply segment filter
    if (segmentFilter !== 'all') {
      result = result.filter(customer => customer.segment === segmentFilter);
    }
    
    setFilteredCustomers(result);
  }, [searchText, statusFilter, segmentFilter, customers]);

  // Fetch customers from API
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call your actual API
      // api.get('/customers')
      
      // For now, we'll use mock data
      setTimeout(() => {
        const mockData = generateCustomerData();
        setCustomers(mockData);
        setFilteredCustomers(mockData);
        
        // Calculate stats
        const stats = {
          total: mockData.length,
          active: mockData.filter(c => c.status === 'active').length,
          inactive: mockData.filter(c => c.status === 'inactive').length,
          new: mockData.filter(c => c.status === 'new').length,
          vip: mockData.filter(c => c.segment === 'VIP').length,
          withOrders: mockData.filter(c => c.orders > 0).length
        };
        
        setCustomerStats(stats);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("Could not load customer data");
      setLoading(false);
    }
  };

  // Generate mock customer data
  const generateCustomerData = () => {
    const statuses = ['active', 'inactive', 'new'];
    const segments = ['Regular', 'VIP', 'New', 'At Risk', 'Inactive'];
    
    const mockNames = [
      'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Minh Cường', 'Phạm Thị Diễm',
      'Hoàng Văn Em', 'Đỗ Thị Phương', 'Ngô Văn Giang', 'Vũ Thị Hà',
      'Đinh Văn Indra', 'Bùi Thị Kim', 'Lý Văn Long', 'Mai Thị Minh',
      'Phan Văn Nam', 'Đặng Thị Oanh', 'Huỳnh Văn Phúc', 'Chu Thị Quỳnh',
      'Trương Văn Rồng', 'Hoàng Thị Sen', 'Lê Văn Tâm', 'Nguyễn Thị Uyên'
    ];
    
    return Array.from({ length: 100 }, (_, i) => {
      const id = i + 1;
      const name = mockNames[Math.floor(Math.random() * mockNames.length)];
      const email = name.replace(/\s+/g, '').toLowerCase() + '@example.com';
      const phone = `0${Math.floor(Math.random() * 900000000) + 100000000}`;
      const orders = Math.floor(Math.random() * 30);
      const totalSpent = Math.floor(Math.random() * 50000000);
      
      // Generate random dates
      const createdDate = dayjs()
        .subtract(Math.floor(Math.random() * 365 * 2), 'day')
        .format('YYYY-MM-DD');
      
      let lastOrderDate = null;
      if (orders > 0) {
        lastOrderDate = dayjs()
          .subtract(Math.floor(Math.random() * 180), 'day')
          .format('YYYY-MM-DD');
      }
      
      // Determine status and segment
      let status;
      if (dayjs(createdDate).isAfter(dayjs().subtract(30, 'day'))) {
        status = 'new';
      } else if (orders > 0 && dayjs(lastOrderDate).isAfter(dayjs().subtract(90, 'day'))) {
        status = 'active';
      } else {
        status = 'inactive';
      }
      
      // Determine segment
      let segment;
      if (orders === 0) {
        segment = 'New';
      } else if (orders > 10 && totalSpent > 10000000) {
        segment = 'VIP';
      } else if (status === 'inactive' && orders > 0) {
        segment = 'At Risk';
      } else if (status === 'inactive' && dayjs(lastOrderDate).isBefore(dayjs().subtract(180, 'day'))) {
        segment = 'Inactive';
      } else {
        segment = 'Regular';
      }
      
      return {
        id,
        name,
        email,
        phone,
        orders,
        totalSpent,
        createdDate,
        lastOrderDate,
        status,
        segment,
        key: id
      };
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: keys => setSelectedRowKeys(keys)
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one customer');
      return;
    }
    
    message.info(`${action} action on ${selectedRowKeys.length} customers`);
    // In a real implementation, this would call your API
  };

  // Dropdown menu for bulk actions
  const bulkActionMenu = (
    <Menu>
      <Menu.Item key="export" onClick={() => handleBulkAction('Export')}>
        Export selected
      </Menu.Item>
      <Menu.Item key="tag" onClick={() => handleBulkAction('Tag')}>
        Add tag
      </Menu.Item>
      <Menu.Item key="segment" onClick={() => handleBulkAction('Segment')}>
        Add to segment
      </Menu.Item>
      <Menu.Item key="email" onClick={() => handleBulkAction('Email')}>
        Send email
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" danger onClick={() => handleBulkAction('Delete')}>
        Delete selected
      </Menu.Item>
    </Menu>
  );

  // Table columns
  const columns = [
    {
      title: 'Customer',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
          <div>
            <div>{text}</div>
            <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      key: 'orders',
      sorter: (a, b) => a.orders - b.orders,
      render: (text) => (
        <Badge count={text} showZero style={{ backgroundColor: text > 0 ? '#1890ff' : '#d9d9d9' }} />
      ),
    },
    {
      title: 'Total Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Segment',
      dataIndex: 'segment',
      key: 'segment',
      render: (segment) => {
        const colorMap = {
          'VIP': 'gold',
          'Regular': 'blue',
          'New': 'green',
          'At Risk': 'orange',
          'Inactive': 'gray'
        };
        
        return (
          <Tag color={colorMap[segment] || 'default'}>
            {segment}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          'active': 'success',
          'inactive': 'default',
          'new': 'processing'
        };
        
        return (
          <Badge status={colorMap[status] || 'default'} text={status} />
        );
      },
    },
    {
      title: 'Last Order',
      dataIndex: 'lastOrderDate',
      key: 'lastOrderDate',
      sorter: (a, b) => {
        if (!a.lastOrderDate) return 1;
        if (!b.lastOrderDate) return -1;
        return dayjs(a.lastOrderDate).unix() - dayjs(b.lastOrderDate).unix();
      },
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : <Text type="secondary">Never</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/customers/edit/${record.id}`);
              }} 
            />
          </Tooltip>
          <Tooltip title="More actions">
            <Dropdown 
              overlay={
                <Menu>
                  <Menu.Item key="view" onClick={() => navigate(`/admin/customers/view/${record.id}`)}>
                    View details
                  </Menu.Item>
                  <Menu.Item key="orders" onClick={() => navigate(`/admin/orders?customer=${record.id}`)}>
                    View orders
                  </Menu.Item>
                  <Menu.Item key="email" onClick={() => message.info(`Email to ${record.name}`)}>
                    Send email
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="delete" danger onClick={() => message.info(`Delete ${record.name}`)}>
                    Delete
                  </Menu.Item>
                </Menu>
              } 
              trigger={['click']}
              onClick={(e) => e.stopPropagation()}
            >
              <Button type="text" icon={<EllipsisOutlined />} onClick={(e) => e.stopPropagation()} />
            </Dropdown>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Render statistics cards
  const renderCustomerStats = () => {
    const { total, active, inactive, new: newCustomers, vip, withOrders } = customerStats;
    
    return (
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Total Customers" 
              value={total} 
              prefix={<TeamOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Active Customers" 
              value={active} 
              prefix={<UserOutlined />} 
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Inactive Customers" 
              value={inactive} 
              prefix={<ClockCircleOutlined />} 
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="New Customers" 
              value={newCustomers} 
              prefix={<PlusOutlined />} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="VIP Customers" 
              value={vip} 
              prefix={<TrophyOutlined />} 
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Purchase Rate" 
              value={total ? (withOrders / total * 100).toFixed(1) : 0} 
              suffix="%" 
              precision={1} 
              prefix={<ShoppingOutlined />} 
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    
    // Apply filter based on tab
    if (key === 'all') {
      setStatusFilter('all');
    } else if (key === 'active') {
      setStatusFilter('active');
    } else if (key === 'inactive') {
      setStatusFilter('inactive');
    } else if (key === 'new') {
      setStatusFilter('new');
    } else if (key === 'vip') {
      setSegmentFilter('VIP');
    }
  };

  return (
    <div className="customers-page">
      <Card bordered={false} className="header-card">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Title level={2}>Customer Management</Title>
            <Text type="secondary">
              Manage and analyze your customer base
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => navigate('/admin/customers/add')}
              >
                Add Customer
              </Button>
              <Button 
                icon={<BarChartOutlined />} 
                onClick={() => navigate('/admin/customers/segmentation')}
              >
                Segmentation
              </Button>
              <Button 
                icon={<TrophyOutlined />}
                onClick={() => navigate('/admin/customers/loyalty')}
              >
                Loyalty
              </Button>
              <Button 
                icon={<SyncOutlined />} 
                loading={loading}
                onClick={fetchCustomers}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ margin: '24px 0' }}>
        {renderCustomerStats()}
      </div>

      <Card bordered={false}>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          tabBarExtraContent={
            <Space>
              <Search
                placeholder="Search customers"
                allowClear
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 250 }}
              />
              <Select 
                style={{ width: 150 }} 
                value={segmentFilter} 
                onChange={setSegmentFilter}
                placeholder="Segment filter"
              >
                <Option value="all">All Segments</Option>
                <Option value="VIP">VIP</Option>
                <Option value="Regular">Regular</Option>
                <Option value="New">New</Option>
                <Option value="At Risk">At Risk</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
              
              {selectedRowKeys.length > 0 && (
                <>
                  <Text type="secondary">
                    {selectedRowKeys.length} selected
                  </Text>
                  
                  <Dropdown overlay={bulkActionMenu}>
                    <Button>
                      Actions <DownOutlined />
                    </Button>
                  </Dropdown>
                </>
              )}
            </Space>
          }
        >
          <TabPane tab="All Customers" key="all">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredCustomers}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              onRow={(record) => ({
                onClick: () => navigate(`/admin/customers/view/${record.id}`)
              })}
            />
          </TabPane>
          <TabPane tab="Active Customers" key="active">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredCustomers}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              onRow={(record) => ({
                onClick: () => navigate(`/admin/customers/view/${record.id}`)
              })}
            />
          </TabPane>
          <TabPane tab="Inactive Customers" key="inactive">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredCustomers}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              onRow={(record) => ({
                onClick: () => navigate(`/admin/customers/view/${record.id}`)
              })}
            />
          </TabPane>
          <TabPane tab="New Customers" key="new">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredCustomers}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              onRow={(record) => ({
                onClick: () => navigate(`/admin/customers/view/${record.id}`)
              })}
            />
          </TabPane>
          <TabPane tab="VIP Customers" key="vip">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredCustomers}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              onRow={(record) => ({
                onClick: () => navigate(`/admin/customers/view/${record.id}`)
              })}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Customers; 