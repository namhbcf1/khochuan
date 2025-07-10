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
  Tabs, 
  Table,
  Tag,
  Radio,
  Divider,
  Tooltip,
  Alert,
  Spin
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  TeamOutlined,
  ShoppingOutlined,
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

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

/**
 * Trang Analytics cung cấp thông tin phân tích dữ liệu cho toàn hệ thống
 */
const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sales');
  const [chartType, setChartType] = useState('line');
  const [dateRange, setDateRange] = useState(null);
  
  // Giả lập tải dữ liệu
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [timeRange, dateRange]);

  // KPI data
  const kpiData = [
    {
      title: 'Tổng doanh thu',
      value: 345680000,
      prefix: <DollarOutlined style={{ color: '#52c41a' }} />,
      suffix: 'VND',
      change: 15.8,
      changeType: 'increase'
    },
    {
      title: 'Đơn hàng',
      value: 1845,
      prefix: <ShoppingCartOutlined style={{ color: '#1890ff' }} />,
      change: 10.2,
      changeType: 'increase'
    },
    {
      title: 'Khách hàng',
      value: 254,
      prefix: <UserOutlined style={{ color: '#722ed1' }} />,
      change: 5.7,
      changeType: 'increase'
    },
    {
      title: 'Sản phẩm bán ra',
      value: 3642,
      prefix: <ShoppingOutlined style={{ color: '#fa8c16' }} />,
      change: 8.4,
      changeType: 'increase'
    }
  ];

  // Sales data
  const salesData = [
    { date: '01/06', revenue: 15500000, orders: 25 },
    { date: '02/06', revenue: 12800000, orders: 22 },
    { date: '03/06', revenue: 14200000, orders: 28 },
    { date: '04/06', revenue: 16800000, orders: 30 },
    { date: '05/06', revenue: 19500000, orders: 35 },
    { date: '06/06', revenue: 25600000, orders: 42 },
    { date: '07/06', revenue: 18500000, orders: 32 },
    { date: '08/06', revenue: 21200000, orders: 38 },
    { date: '09/06', revenue: 19800000, orders: 36 },
    { date: '10/06', revenue: 22500000, orders: 40 },
    { date: '11/06', revenue: 27800000, orders: 45 },
    { date: '12/06', revenue: 24300000, orders: 41 },
    { date: '13/06', revenue: 20100000, orders: 37 },
    { date: '14/06', revenue: 18900000, orders: 33 }
  ];

  // Product performance data
  const productData = [
    { name: 'iPhone 15 Pro', sales: 125, revenue: 187500000, trend: 'up' },
    { name: 'Samsung Galaxy S24', sales: 98, revenue: 147000000, trend: 'up' },
    { name: 'MacBook Air M3', sales: 52, revenue: 156000000, trend: 'down' },
    { name: 'AirPods Pro', sales: 142, revenue: 42600000, trend: 'up' },
    { name: 'iPad Pro', sales: 38, revenue: 76000000, trend: 'stable' },
    { name: 'Xiaomi 14', sales: 87, revenue: 86130000, trend: 'up' },
    { name: 'Dell XPS 13', sales: 29, revenue: 87000000, trend: 'down' },
    { name: 'Sony WH-1000XM5', sales: 64, revenue: 70400000, trend: 'up' },
    { name: 'Apple Watch S9', sales: 72, revenue: 115200000, trend: 'stable' },
    { name: 'Nintendo Switch', sales: 45, revenue: 40500000, trend: 'down' }
  ];

  // Channel distribution data
  const channelData = [
    { name: 'Cửa hàng', value: 65, color: '#1890ff' },
    { name: 'Website', value: 15, color: '#52c41a' },
    { name: 'Mobile App', value: 10, color: '#722ed1' },
    { name: 'Shopee', value: 5, color: '#fa8c16' },
    { name: 'Lazada', value: 3, color: '#eb2f96' },
    { name: 'Tiki', value: 2, color: '#13c2c2' }
  ];

  // Customer data
  const customerData = [
    { segment: 'VIP', count: 28, revenue: 95450000, avgOrderValue: 3498000, color: '#722ed1' },
    { segment: 'Thường xuyên', count: 76, revenue: 125700000, avgOrderValue: 1680000, color: '#52c41a' },
    { segment: 'Bình thường', count: 112, revenue: 98760000, avgOrderValue: 880000, color: '#1890ff' },
    { segment: 'Mới', count: 38, revenue: 25770000, avgOrderValue: 678000, color: '#fa8c16' }
  ];

  // Function to handle time range change
  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  // Function to handle date range change
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
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

  // KPI cards
  const renderKPICards = () => {
    return (
      <Row gutter={[16, 16]} className="analytics-kpi-cards">
        {kpiData.map((kpi, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card className="analytics-card">
              <Statistic
                title={kpi.title}
                value={kpi.value}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                prefix={kpi.prefix}
                suffix={kpi.suffix}
                formatter={(value) => {
                  if (kpi.suffix === 'VND') {
                    return formatCurrency(value).replace('₫', '');
                  }
                  return value.toLocaleString();
                }}
              />
              <div className="analytics-card-trend">
                {kpi.changeType === 'increase' ? (
                  <RiseOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <FallOutlined style={{ color: '#ff4d4f' }} />
                )}
                <span style={{ 
                  color: kpi.changeType === 'increase' ? '#52c41a' : '#ff4d4f',
                  marginLeft: '5px'
                }}>
                  {kpi.change}%
                </span>
                <span style={{ marginLeft: '5px', color: '#8c8c8c' }}>
                  so với {timeRange === 'today' ? 'hôm qua' : timeRange === 'week' ? 'tuần trước' : 'tháng trước'}
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // Sales chart
  const renderSalesChart = () => {
    return (
      <Card 
        title="Biểu đồ doanh thu" 
        className="analytics-chart-card"
        extra={
          <Space>
            <Radio.Group value={chartType} onChange={e => setChartType(e.target.value)}>
              <Radio.Button value="line"><LineChartOutlined /></Radio.Button>
              <Radio.Button value="bar"><BarChartOutlined /></Radio.Button>
            </Radio.Group>
            <Button icon={<DownloadOutlined />}>Xuất</Button>
          </Space>
        }
      >
        <div className="chart-container" style={{ height: 350 }}>
          {chartType === 'line' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `${value/1000000}M`} />
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
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="revenue" stroke="#1890ff" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="orders" stroke="#52c41a" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `${value/1000000}M`} />
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
                <Bar yAxisId="left" dataKey="revenue" name="revenue" fill="#1890ff" />
                <Bar yAxisId="right" dataKey="orders" name="orders" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    );
  };

  // Channel distribution pie chart
  const renderChannelChart = () => {
    return (
      <Card title="Phân bố kênh bán hàng" className="analytics-chart-card">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={channelData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {channelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip formatter={(value) => `${value}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  // Customer segment chart
  const renderCustomerSegmentChart = () => {
    return (
      <Card title="Phân khúc khách hàng" className="analytics-chart-card">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={customerData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => `${value/1000000}M`} />
            <YAxis type="category" dataKey="segment" />
            <RechartsTooltip 
              formatter={(value, name) => {
                if (name === 'revenue') {
                  return [formatCurrency(value), 'Doanh thu'];
                } else if (name === 'avgOrderValue') {
                  return [formatCurrency(value), 'Giá trị đơn hàng TB'];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="revenue" name="revenue" fill="#1890ff" />
            <Bar dataKey="count" name="count" fill="#52c41a" />
            <Bar dataKey="avgOrderValue" name="avgOrderValue" fill="#722ed1" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  // Product table
  const renderProductTable = () => {
    const columns = [
      {
        title: 'Sản phẩm',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Số lượng bán',
        dataIndex: 'sales',
        key: 'sales',
        sorter: (a, b) => a.sales - b.sales,
        render: (text) => <span>{text.toLocaleString()}</span>,
      },
      {
        title: 'Doanh thu',
        dataIndex: 'revenue',
        key: 'revenue',
        sorter: (a, b) => a.revenue - b.revenue,
        render: (text) => <span>{formatCurrency(text)}</span>,
      },
      {
        title: 'Xu hướng',
        dataIndex: 'trend',
        key: 'trend',
        render: (text) => (
          <Tag color={text === 'up' ? 'success' : text === 'down' ? 'error' : 'warning'}>
            {getTrendIcon(text)} {text === 'up' ? 'Tăng' : text === 'down' ? 'Giảm' : 'Ổn định'}
          </Tag>
        ),
      },
    ];

    return (
      <Card 
        title="Hiệu suất sản phẩm" 
        className="analytics-table-card"
        extra={<Button icon={<DownloadOutlined />}>Xuất</Button>}
      >
        <Table 
          dataSource={productData} 
          columns={columns} 
          rowKey="name"
          pagination={{ pageSize: 5 }}
          className="analytics-table"
        />
      </Card>
    );
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <Title level={2}>Phân tích dữ liệu</Title>
        <Space>
          <Select
            defaultValue="week"
            style={{ width: 120 }}
            onChange={handleTimeRangeChange}
            options={[
              { value: 'today', label: 'Hôm nay' },
              { value: 'week', label: 'Tuần này' },
              { value: 'month', label: 'Tháng này' },
              { value: 'quarter', label: 'Quý này' },
              { value: 'year', label: 'Năm nay' },
              { value: 'custom', label: 'Tùy chỉnh' },
            ]}
          />
          {timeRange === 'custom' && (
            <RangePicker onChange={handleDateRangeChange} />
          )}
          <Button icon={<ReloadOutlined />} onClick={() => setLoading(true)}>Làm mới</Button>
          <Button type="primary" icon={<DownloadOutlined />}>Xuất báo cáo</Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        {renderKPICards()}

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          className="analytics-tabs"
          tabBarExtraContent={
            <Button icon={<FilterOutlined />}>Lọc</Button>
          }
        >
          <TabPane tab="Doanh số" key="sales">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                {renderSalesChart()}
              </Col>
              <Col xs={24} lg={8}>
                {renderChannelChart()}
              </Col>
              <Col xs={24}>
                {renderProductTable()}
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Khách hàng" key="customers">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                {renderCustomerSegmentChart()}
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Số liệu khách hàng">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="Khách hàng mới"
                        value={38}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Tỷ lệ chuyển đổi"
                        value={12.3}
                        precision={1}
                        valueStyle={{ color: '#3f8600' }}
                        suffix="%"
                        prefix={<RiseOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Giá trị đơn hàng TB"
                        value={1256000}
                        formatter={(value) => formatCurrency(value)}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Tỷ lệ quay lại"
                        value={68}
                        suffix="%"
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Sản phẩm" key="products">
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                {renderProductTable()}
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};

export default Analytics; 