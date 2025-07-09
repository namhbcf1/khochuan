import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Space, 
  Button, 
  Select, 
  DatePicker,
  Progress,
  Table,
  Tag,
  Avatar,
  List,
  Divider,
  Spin,
  Alert,
  Tabs,
  Switch
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExportOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartType, setChartType] = useState('daily');
  const [isComparing, setIsComparing] = useState(false);

  // Demo data
  const kpiData = [
    {
      title: 'Tổng doanh thu',
      value: 245680000,
      prefix: <DollarOutlined style={{ color: '#52c41a' }} />,
      suffix: 'VND',
      change: 12.5,
      changeType: 'increase'
    },
    {
      title: 'Đơn hàng',
      value: 1234,
      prefix: <ShoppingCartOutlined style={{ color: '#1890ff' }} />,
      change: 8.2,
      changeType: 'increase'
    },
    {
      title: 'Khách hàng mới',
      value: 89,
      prefix: <UserOutlined style={{ color: '#722ed1' }} />,
      change: -2.1,
      changeType: 'decrease'
    },
    {
      title: 'Tỷ lệ chuyển đổi',
      value: 3.2,
      prefix: <TrophyOutlined style={{ color: '#fa8c16' }} />,
      suffix: '%',
      change: 0.8,
      changeType: 'increase'
    }
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro', sales: 45, revenue: 45000000, trend: 'up' },
    { name: 'Samsung Galaxy S24', sales: 38, revenue: 38000000, trend: 'up' },
    { name: 'MacBook Air M3', sales: 23, revenue: 69000000, trend: 'down' },
    { name: 'AirPods Pro', sales: 67, revenue: 20100000, trend: 'up' },
    { name: 'iPad Pro', sales: 19, revenue: 38000000, trend: 'stable' }
  ];

  const recentOrders = [
    { 
      id: 'ORD-001', 
      customer: 'Nguyễn Văn A', 
      amount: 2500000, 
      status: 'completed',
      time: '10:30 AM',
      items: 3
    },
    { 
      id: 'ORD-002', 
      customer: 'Trần Thị B', 
      amount: 1800000, 
      status: 'processing',
      time: '10:15 AM',
      items: 2
    },
    { 
      id: 'ORD-003', 
      customer: 'Lê Văn C', 
      amount: 3200000, 
      status: 'completed',
      time: '09:45 AM',
      items: 5
    },
    { 
      id: 'ORD-004', 
      customer: 'Phạm Thị D', 
      amount: 950000, 
      status: 'pending',
      time: '09:30 AM',
      items: 1
    }
  ];

  const staffPerformance = [
    { name: 'Nguyễn Minh', sales: 15, revenue: 12500000, target: 85 },
    { name: 'Trần Hương', sales: 12, revenue: 9800000, target: 78 },
    { name: 'Lê Tuấn', sales: 18, revenue: 15200000, target: 92 },
    { name: 'Phạm Linh', sales: 9, revenue: 7300000, target: 65 }
  ];

  // Daily sales data
  const salesData = [
    { name: 'T2', revenue: 15500000, orders: 25 },
    { name: 'T3', revenue: 12800000, orders: 22 },
    { name: 'T4', revenue: 14200000, orders: 28 },
    { name: 'T5', revenue: 16800000, orders: 30 },
    { name: 'T6', revenue: 19500000, orders: 35 },
    { name: 'T7', revenue: 25600000, orders: 42 },
    { name: 'CN', revenue: 18500000, orders: 32 }
  ];

  // Monthly sales data
  const monthlySalesData = [
    { name: 'T1', revenue: 320500000, orders: 520 },
    { name: 'T2', revenue: 290800000, orders: 485 },
    { name: 'T3', revenue: 310200000, orders: 510 },
    { name: 'T4', revenue: 350800000, orders: 580 },
    { name: 'T5', revenue: 380500000, orders: 620 },
    { name: 'T6', revenue: 410600000, orders: 650 }
  ];

  // Channel distribution data
  const channelData = [
    { name: 'Cửa hàng', value: 65, color: '#1890ff' },
    { name: 'Web', value: 20, color: '#52c41a' },
    { name: 'App', value: 10, color: '#722ed1' },
    { name: 'Marketplace', value: 5, color: '#fa8c16' }
  ];

  // Category distribution data
  const categoryData = [
    { name: 'Điện thoại', value: 40, color: '#1890ff' },
    { name: 'Laptop', value: 25, color: '#52c41a' },
    { name: 'Phụ kiện', value: 20, color: '#faad14' },
    { name: 'Màn hình', value: 10, color: '#eb2f96' },
    { name: 'Khác', value: 5, color: '#bfbfbf' }
  ];

  // Function to get status color for orders
  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      processing: 'processing',
      pending: 'warning',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  // Function to get status text in Vietnamese
  const getStatusText = (status) => {
    const texts = {
      completed: 'Hoàn thành',
      processing: 'Đang xử lý',
      pending: 'Chờ xử lý',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  // Function to get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <RiseOutlined style={{ color: '#52c41a' }} />;
      case 'down':
        return <FallOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <LineChartOutlined style={{ color: '#faad14' }} />;
    }
  };

  // Function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Render sales chart based on selected type
  const renderSalesChart = () => {
    const data = chartType === 'daily' ? salesData : monthlySalesData;
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} className="chart-container">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" />
          <RechartsTooltip 
            formatter={(value, name) => {
              if (name === 'revenue') {
                return [formatCurrency(value), 'Doanh thu'];
              }
              return [value, 'Đơn hàng'];
            }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="revenue" 
            stroke="#1890ff" 
            name="Doanh thu" 
            activeDot={{ r: 8 }} 
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="orders" 
            stroke="#52c41a" 
            name="Đơn hàng" 
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render channel distribution chart
  const renderChannelChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart className="analytics-chart">
        <Pie
          data={channelData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {channelData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  // Render category distribution chart
  const renderCategoryChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={categoryData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
        className="analytics-chart"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" />
        <RechartsTooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
        <Legend />
        <Bar dataKey="value" name="Tỷ lệ %" radius={[0, 10, 10, 0]}>
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  // Layout with sidebar navigation and dashboard content
  return (
    <div className="dashboard-container">
      {/* Sidebar navigation for tests */}
      <nav className="sidebar navigation">
        {/* Menu items for test */}
        <div className="menu-item">Dashboard</div>
        <div className="menu-item">Products</div>
        <div className="menu-item">Customers</div>
        <div className="menu-item">Orders</div>
        <div className="menu-item">Staff</div>
        <div className="menu-item">Reports</div>
        <div className="menu-item">Settings</div>
      </nav>
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <Title level={1}>Analytics Dashboard</Title>
          <div className="dashboard-controls">
            <Space>
              <Select
                value={timeRange}
                onChange={(value) => setTimeRange(value)}
                style={{ width: 120 }}
              >
                <Select.Option value="today">Today</Select.Option>
                <Select.Option value="yesterday">Yesterday</Select.Option>
                <Select.Option value="week">This Week</Select.Option>
                <Select.Option value="month">This Month</Select.Option>
                <Select.Option value="quarter">This Quarter</Select.Option>
                <Select.Option value="year">This Year</Select.Option>
                <Select.Option value="custom">Custom Range</Select.Option>
              </Select>
              
              {timeRange === 'custom' && (
                <RangePicker />
              )}
              
              <Button icon={<ReloadOutlined />} onClick={() => setLoading(true)}>
                Refresh
              </Button>
              
              <Button icon={<ExportOutlined />}>
                Export
              </Button>
            </Space>
          </div>
        </div>
        
        {/* Stats Cards for Tests */}
        <div className="dashboard-stats">
          <Row gutter={[16, 16]} className="stats-cards">
            {kpiData.map((item, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card className="stat-card">
                  <Statistic
                    title={item.title}
                    value={item.value}
                    precision={0}
                    valueStyle={{ color: item.changeType === 'increase' ? '#3f8600' : '#cf1322' }}
                    prefix={item.prefix}
                    suffix={item.suffix}
                  />
                  <div className="stat-change">
                    {item.changeType === 'increase' ? (
                      <ArrowUpOutlined style={{ color: '#3f8600' }} />
                    ) : (
                      <ArrowDownOutlined style={{ color: '#cf1322' }} />
                    )}
                    <span>{Math.abs(item.change)}% from previous {timeRange}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
          <TabPane tab="Overview" key="overview">
            <div className="dashboard-charts">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                  <Card title="Sales Performance" className="sales-chart overview-cards">
                    {renderSalesChart()}
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="Sales by Channel" className="channel-chart overview-cards">
                    {renderChannelChart()}
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={8}>
                  <Card title="Sales by Category" className="category-chart overview-cards">
                    {renderCategoryChart()}
                  </Card>
                </Col>
                <Col xs={24} lg={16}>
                  <Card title="Recent Orders" className="recent-orders overview-cards">
                    <Table
                      dataSource={recentOrders}
                      columns={[
                        {
                          title: 'Order ID',
                          dataIndex: 'id',
                          key: 'id',
                        },
                        {
                          title: 'Customer',
                          dataIndex: 'customer',
                          key: 'customer',
                        },
                        {
                          title: 'Amount',
                          dataIndex: 'amount',
                          key: 'amount',
                          render: (amount) => formatCurrency(amount),
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          render: (status) => (
                            <Tag color={getStatusColor(status)}>
                              {getStatusText(status)}
                            </Tag>
                          ),
                        },
                        {
                          title: 'Time',
                          dataIndex: 'time',
                          key: 'time',
                        },
                      ]}
                      pagination={false}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
          
          <TabPane tab="Performance Metrics" key="metrics">
            <div className="dashboard-metrics metrics-cards">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Staff Performance" className="staff-performance metrics-cards">
                    <Table
                      dataSource={staffPerformance}
                      columns={[
                        {
                          title: 'Staff',
                          dataIndex: 'name',
                          key: 'name',
                        },
                        {
                          title: 'Orders',
                          dataIndex: 'sales',
                          key: 'sales',
                        },
                        {
                          title: 'Revenue',
                          dataIndex: 'revenue',
                          key: 'revenue',
                          render: (revenue) => formatCurrency(revenue),
                        },
                        {
                          title: 'Target Progress',
                          dataIndex: 'target',
                          key: 'target',
                          render: (target) => (
                            <Progress percent={target} />
                          ),
                        },
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 