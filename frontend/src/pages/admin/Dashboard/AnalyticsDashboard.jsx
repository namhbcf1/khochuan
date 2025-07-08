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
  List
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
  PieChartOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(false);

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

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      processing: 'processing',
      pending: 'warning',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      completed: 'Hoàn thành',
      processing: 'Đang xử lý',
      pending: 'Chờ xử lý',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

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

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              📊 Analytics Dashboard
            </Title>
            <Text type="secondary">
              Tổng quan phân tích doanh thu và hiệu suất
            </Text>
          </Col>
          <Col>
            <Space>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
              >
                <Select.Option value="today">Hôm nay</Select.Option>
                <Select.Option value="week">Tuần này</Select.Option>
                <Select.Option value="month">Tháng này</Select.Option>
                <Select.Option value="quarter">Quý này</Select.Option>
              </Select>
              <RangePicker />
              <Button type="primary" icon={<BarChartOutlined />}>
                Xuất báo cáo
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {kpiData.map((kpi, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={kpi.title}
                value={kpi.value}
                prefix={kpi.prefix}
                suffix={kpi.suffix}
                valueStyle={{ color: kpi.prefix.props.style.color }}
              />
              <div style={{ marginTop: '8px' }}>
                <Space>
                  {kpi.changeType === 'increase' ? (
                    <RiseOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <FallOutlined style={{ color: '#ff4d4f' }} />
                  )}
                  <Text 
                    style={{ 
                      color: kpi.changeType === 'increase' ? '#52c41a' : '#ff4d4f',
                      fontSize: '12px'
                    }}
                  >
                    {Math.abs(kpi.change)}% so với hôm qua
                  </Text>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Top Products */}
        <Col xs={24} lg={12}>
          <Card 
            title="🏆 Sản phẩm bán chạy"
            extra={<Button type="link" icon={<PieChartOutlined />}>Chi tiết</Button>}
          >
            <List
              dataSource={topProducts}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: '#1890ff' }}>
                        {index + 1}
                      </Avatar>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.name}</span>
                        {getTrendIcon(item.trend)}
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary">Đã bán: {item.sales} sản phẩm</Text>
                        <br />
                        <Text strong style={{ color: '#52c41a' }}>
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND' 
                          }).format(item.revenue)}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col xs={24} lg={12}>
          <Card 
            title="🛒 Đơn hàng gần đây"
            extra={<Button type="link">Xem tất cả</Button>}
          >
            <List
              dataSource={recentOrders}
              renderItem={(order) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<ShoppingCartOutlined />} />}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{order.id}</span>
                        <Tag color={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text>{order.customer} • {order.items} sản phẩm • {order.time}</Text>
                        <br />
                        <Text strong style={{ color: '#52c41a' }}>
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND' 
                          }).format(order.amount)}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Staff Performance */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card 
            title="👥 Hiệu suất nhân viên"
            extra={<Button type="link" icon={<TeamOutlined />}>Quản lý nhân viên</Button>}
          >
            <Row gutter={[16, 16]}>
              {staffPerformance.map((staff, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card size="small">
                    <div style={{ textAlign: 'center' }}>
                      <Avatar size={48} style={{ backgroundColor: '#1890ff', marginBottom: '8px' }}>
                        {staff.name.charAt(0)}
                      </Avatar>
                      <Title level={5} style={{ margin: '0 0 4px 0' }}>
                        {staff.name}
                      </Title>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {staff.sales} đơn hàng
                      </Text>
                    </div>
                    
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Text style={{ fontSize: '12px' }}>Mục tiêu</Text>
                        <Text style={{ fontSize: '12px' }}>{staff.target}%</Text>
                      </div>
                      <Progress 
                        percent={staff.target} 
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                        size="small"
                      />
                    </div>
                    
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                        {new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND',
                          notation: 'compact'
                        }).format(staff.revenue)}
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="⚡ Thao tác nhanh">
            <Space size="middle" wrap>
              <Button type="primary" icon={<BarChartOutlined />}>
                Báo cáo chi tiết
              </Button>
              <Button icon={<UserOutlined />}>
                Quản lý khách hàng
              </Button>
              <Button icon={<ShoppingCartOutlined />}>
                Quản lý đơn hàng
              </Button>
              <Button icon={<TeamOutlined />}>
                Quản lý nhân viên
              </Button>
              <Button icon={<TrophyOutlined />}>
                Cài đặt gamification
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard; 