import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Row, 
  Col, 
  Input, 
  Button, 
  Tag, 
  Space, 
  Badge, 
  DatePicker, 
  Select, 
  Typography, 
  Statistic, 
  Tabs,
  Divider,
  Tooltip,
  Menu,
  Dropdown,
  message,
  Popconfirm,
  Modal,
  Descriptions
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  PrinterOutlined, 
  ExportOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SyncOutlined,
  DollarCircleOutlined, 
  ShoppingOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  DownOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  BarChartOutlined,
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Column } from '@ant-design/plots';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

/**
 * Main Orders page component
 * Provides order management interface with filtering, statistics and visualization
 */
const Orders = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    processing: 0,
    cancelled: 0,
    totalSales: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsVisible, setOrderDetailsVisible] = useState(false);
  const [timeframeFilter, setTimeframeFilter] = useState('week');
  const [salesData, setSalesData] = useState([]);

  // Load orders data
  useEffect(() => {
    fetchOrders();
  }, []);

  // Generate sales chart data based on timeframe
  useEffect(() => {
    if (orders.length === 0) return;
    
    const getTimePeriods = () => {
      const now = dayjs();
      let periods = [];
      
      if (timeframeFilter === 'week') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = now.subtract(i, 'day');
          periods.push({
            label: date.format('DD/MM'),
            date: date.format('YYYY-MM-DD')
          });
        }
      } else if (timeframeFilter === 'month') {
        // Last 30 days, grouped by week
        for (let i = 3; i >= 0; i--) {
          const endDate = now.subtract(i * 7, 'day');
          const startDate = endDate.subtract(6, 'day');
          periods.push({
            label: `${startDate.format('DD/MM')}-${endDate.format('DD/MM')}`,
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD')
          });
        }
      } else if (timeframeFilter === 'year') {
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = now.subtract(i, 'month');
          periods.push({
            label: date.format('MMM'),
            month: date.month(),
            year: date.year()
          });
        }
      }
      
      return periods;
    };

    const periods = getTimePeriods();
    
    const data = periods.map(period => {
      let totalSales = 0;
      let orderCount = 0;
      
      if (timeframeFilter === 'week') {
        // Daily data
        orders.forEach(order => {
          const orderDate = dayjs(order.date).format('YYYY-MM-DD');
          if (orderDate === period.date && order.status !== 'cancelled') {
            totalSales += order.totalAmount;
            orderCount++;
          }
        });
      } else if (timeframeFilter === 'month') {
        // Weekly data
        orders.forEach(order => {
          const orderDate = dayjs(order.date);
          const orderDateStr = orderDate.format('YYYY-MM-DD');
          const startDate = period.startDate;
          const endDate = period.endDate;
          
          if (orderDateStr >= startDate && orderDateStr <= endDate && order.status !== 'cancelled') {
            totalSales += order.totalAmount;
            orderCount++;
          }
        });
      } else if (timeframeFilter === 'year') {
        // Monthly data
        orders.forEach(order => {
          const orderDate = dayjs(order.date);
          if (orderDate.month() === period.month && 
              orderDate.year() === period.year && 
              order.status !== 'cancelled') {
            totalSales += order.totalAmount;
            orderCount++;
          }
        });
      }
      
      return {
        period: period.label,
        sales: totalSales,
        count: orderCount
      };
    });
    
    setSalesData(data);
  }, [orders, timeframeFilter]);

  // Handle filtering orders
  useEffect(() => {
    if (!orders.length) return;
    
    let result = [...orders];
    
    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(searchLower) ||
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.phone.includes(searchText)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply payment method filter
    if (paymentMethodFilter !== 'all') {
      result = result.filter(order => order.paymentMethod === paymentMethodFilter);
    }
    
    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      
      result = result.filter(order => {
        const orderDate = dayjs(order.date);
        return orderDate.isAfter(startDate) && orderDate.isBefore(endDate);
      });
    }
    
    setFilteredOrders(result);
  }, [orders, searchText, statusFilter, paymentMethodFilter, dateRange]);

  // Tab change handler - filters orders by status
  useEffect(() => {
    if (activeTab === 'all') {
      setStatusFilter('all');
    } else if (activeTab === 'completed') {
      setStatusFilter('completed');
    } else if (activeTab === 'processing') {
      setStatusFilter('processing');
    } else if (activeTab === 'pending') {
      setStatusFilter('pending');
    } else if (activeTab === 'cancelled') {
      setStatusFilter('cancelled');
    }
  }, [activeTab]);

  // Fetch orders from API (mock data for now)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // In a real implementation, call your API
      // const response = await api.get('/orders');
      // const data = response.data;
      
      // For now, we'll use mock data
      setTimeout(() => {
        const mockData = generateMockOrders();
        setOrders(mockData);
        setFilteredOrders(mockData);
        
        // Calculate order statistics
        const stats = {
          total: mockData.length,
          completed: mockData.filter(o => o.status === 'completed').length,
          processing: mockData.filter(o => ['processing', 'pending', 'shipped'].includes(o.status)).length,
          cancelled: mockData.filter(o => o.status === 'cancelled').length,
          totalSales: mockData.reduce((sum, order) => 
            order.status !== 'cancelled' ? sum + order.totalAmount : sum, 0)
        };
        
        setOrderStats(stats);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Could not load order data");
      setLoading(false);
    }
  };

  // Generate mock order data
  const generateMockOrders = () => {
    const orderStatuses = ['completed', 'processing', 'pending', 'shipped', 'cancelled'];
    const paymentMethods = ['cash', 'card', 'bank_transfer', 'ewallet'];
    const paymentStatuses = ['paid', 'pending', 'refunded', 'failed'];
    
    return Array.from({ length: 200 }, (_, i) => {
      const id = `ORD-${100000 + i}`;
      const date = dayjs()
        .subtract(Math.floor(Math.random() * 90), 'day')
        .format('YYYY-MM-DD');
      
      const itemCount = Math.floor(Math.random() * 8) + 1;
      const itemTotal = Math.floor(Math.random() * 5000000) + 100000;
      const totalAmount = itemTotal;
      
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const paymentStatus = status === 'cancelled' ? 'refunded' : 
                           status === 'completed' ? 'paid' : 
                           paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      // Generate mock items
      const items = Array.from({ length: itemCount }, (_, j) => ({
        id: j + 1,
        name: `Product ${j + 1}`,
        price: Math.floor(Math.random() * 1000000) + 50000,
        quantity: Math.floor(Math.random() * 5) + 1,
        total: Math.floor(Math.random() * 1000000) + 50000,
      }));
      
      return {
        id,
        date,
        customer: {
          id: Math.floor(Math.random() * 1000) + 1,
          name: `Customer ${Math.floor(Math.random() * 100) + 1}`,
          phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
          email: `customer${Math.floor(Math.random() * 100) + 1}@example.com`,
        },
        items,
        itemCount,
        totalAmount,
        status,
        paymentMethod,
        paymentStatus,
        key: id,
        shipping: {
          method: 'Standard',
          cost: Math.floor(Math.random() * 50000),
          address: 'Customer address',
        },
        note: Math.random() > 0.7 ? 'Customer special request' : null,
      };
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND'
    }).format(amount);
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    let color, text;
    
    switch (status) {
      case 'completed':
        color = 'success';
        text = 'Completed';
        break;
      case 'processing':
        color = 'processing';
        text = 'Processing';
        break;
      case 'pending':
        color = 'warning';
        text = 'Pending';
        break;
      case 'shipped':
        color = 'blue';
        text = 'Shipped';
        break;
      case 'cancelled':
        color = 'error';
        text = 'Cancelled';
        break;
      default:
        color = 'default';
        text = status;
    }
    
    return <Badge status={color} text={text} />;
  };

  // Render payment method
  const renderPaymentMethod = (method) => {
    const methodNames = {
      cash: 'Cash',
      card: 'Credit/Debit Card',
      bank_transfer: 'Bank Transfer',
      ewallet: 'E-Wallet'
    };
    
    return methodNames[method] || method;
  };

  // Render payment status
  const renderPaymentStatus = (status) => {
    let color;
    
    switch (status) {
      case 'paid':
        color = 'green';
        break;
      case 'pending':
        color = 'orange';
        break;
      case 'refunded':
        color = 'volcano';
        break;
      case 'failed':
        color = 'red';
        break;
      default:
        color = 'default';
    }
    
    return <Tag color={color}>{status}</Tag>;
  };

  // Handle row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: keys => setSelectedRowKeys(keys)
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one order');
      return;
    }
    
    message.info(`${action} action on ${selectedRowKeys.length} orders`);
    // In a real implementation, this would call your API
  };

  // Dropdown menu for bulk actions
  const bulkActionMenu = (
    <Menu>
      <Menu.Item key="export" onClick={() => handleBulkAction('Export')}>
        Export selected
      </Menu.Item>
      <Menu.Item key="print" onClick={() => handleBulkAction('Print')}>
        Print invoices
      </Menu.Item>
      <Menu.Item key="status" onClick={() => handleBulkAction('Update status')}>
        Update status
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" danger onClick={() => handleBulkAction('Delete')}>
        Delete selected
      </Menu.Item>
    </Menu>
  );

  // Show order details
  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderDetailsVisible(true);
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: text => <a onClick={() => {}}>{text}</a>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: customer => (
        <div>
          <div>{customer.name}</div>
          <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{customer.phone}</div>
        </div>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'itemCount',
      key: 'itemCount',
      sorter: (a, b) => a.itemCount - b.itemCount,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: amount => formatCurrency(amount),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => renderStatusBadge(status),
      filters: [
        { text: 'Completed', value: 'completed' },
        { text: 'Processing', value: 'processing' },
        { text: 'Pending', value: 'pending' },
        { text: 'Shipped', value: 'shipped' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: status => renderPaymentStatus(status),
      filters: [
        { text: 'Paid', value: 'paid' },
        { text: 'Pending', value: 'pending' },
        { text: 'Refunded', value: 'refunded' },
        { text: 'Failed', value: 'failed' },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => showOrderDetails(record)}
          />
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => navigate(`/admin/orders/edit/${record.id}`)}
          />
          <Popconfirm
            title="Are you sure you want to delete this order?"
            onConfirm={() => message.success(`Order ${record.id} deleted`)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Sales chart configuration
  const salesChartConfig = {
    data: salesData,
    isGroup: true,
    xField: 'period',
    yField: 'sales',
    seriesField: 'type',
    color: ['#1890ff'],
    columnStyle: {
      radius: [5, 5, 0, 0],
    },
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
      formatter: (datum) => `${(datum.sales / 1000000).toFixed(1)}M`,
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    yAxis: {
      label: {
        formatter: (v) => `${(v / 1000000).toFixed(1)}M`,
      },
    },
    meta: {
      sales: {
        alias: 'Sales (VND)',
      },
    },
  };

  // Render order statistics
  const renderOrderStats = () => {
    return (
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6} lg={6}>
          <Card size="small">
            <Statistic 
              title="Total Orders" 
              value={orderStats.total} 
              prefix={<ShoppingOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={6}>
          <Card size="small">
            <Statistic 
              title="Completed" 
              value={orderStats.completed} 
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={6}>
          <Card size="small">
            <Statistic 
              title="Processing" 
              value={orderStats.processing} 
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={6}>
          <Card size="small">
            <Statistic 
              title="Total Sales" 
              value={formatCurrency(orderStats.totalSales)} 
              valueStyle={{ color: '#722ed1' }}
              prefix={<DollarCircleOutlined />} 
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="orders-page">
      <Card bordered={false} className="header-card">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Title level={2}>Order Management</Title>
            <Text type="secondary">
              Track, manage, and process customer orders
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => navigate('/admin/orders/create')}
              >
                Create Order
              </Button>
              <Button 
                icon={<BarChartOutlined />} 
                onClick={() => navigate('/admin/orders/analytics')}
              >
                Analytics
              </Button>
              <Button 
                icon={<ExportOutlined />}
                onClick={() => message.info('Exporting orders to Excel')}
              >
                Export
              </Button>
              <Button 
                icon={<SyncOutlined />} 
                loading={loading}
                onClick={fetchOrders}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ margin: '24px 0' }}>
        {renderOrderStats()}
      </div>

      <Card 
        title="Sales Overview" 
        bordered={false}
        style={{ marginBottom: '24px' }}
        extra={
          <Select 
            value={timeframeFilter} 
            onChange={setTimeframeFilter}
            style={{ width: 120 }}
          >
            <Option value="week">Week</Option>
            <Option value="month">Month</Option>
            <Option value="year">Year</Option>
          </Select>
        }
      >
        <Column {...salesChartConfig} height={300} />
      </Card>

      <Card bordered={false}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarExtraContent={
            <Space>
              <Search
                placeholder="Search orders"
                allowClear
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              <RangePicker 
                value={dateRange}
                onChange={setDateRange}
                style={{ width: 230 }}
              />
              <Select 
                style={{ width: 150 }} 
                value={paymentMethodFilter} 
                onChange={setPaymentMethodFilter}
                placeholder="Payment method"
              >
                <Option value="all">All Methods</Option>
                <Option value="cash">Cash</Option>
                <Option value="card">Card</Option>
                <Option value="bank_transfer">Bank Transfer</Option>
                <Option value="ewallet">E-Wallet</Option>
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
              
              <Button 
                icon={<FilterOutlined />}
                onClick={() => {
                  setSearchText('');
                  setDateRange(null);
                  setStatusFilter('all');
                  setPaymentMethodFilter('all');
                  setActiveTab('all');
                }}
              >
                Clear Filters
              </Button>
            </Space>
          }
        >
          <TabPane tab="All Orders" key="all">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredOrders}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
            />
          </TabPane>
          <TabPane tab="Completed" key="completed">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredOrders}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
            />
          </TabPane>
          <TabPane tab="Processing" key="processing">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredOrders}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
            />
          </TabPane>
          <TabPane tab="Pending" key="pending">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredOrders}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
            />
          </TabPane>
          <TabPane tab="Cancelled" key="cancelled">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredOrders}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Order Details Modal */}
      <Modal
        title={`Order Details: ${selectedOrder?.id}`}
        visible={orderDetailsVisible}
        onCancel={() => setOrderDetailsVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setOrderDetailsVisible(false)}>
            Close
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={() => message.info('Printing order...')}
          >
            Print
          </Button>,
        ]}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}>
              <Descriptions.Item label="Customer">{selectedOrder.customer.name}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selectedOrder.customer.phone}</Descriptions.Item>
              <Descriptions.Item label="Date">{selectedOrder.date}</Descriptions.Item>
              <Descriptions.Item label="Status">{renderStatusBadge(selectedOrder.status)}</Descriptions.Item>
              <Descriptions.Item label="Payment">{renderPaymentMethod(selectedOrder.paymentMethod)}</Descriptions.Item>
              <Descriptions.Item label="Payment Status">{renderPaymentStatus(selectedOrder.paymentStatus)}</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <h3>Order Items</h3>
            <Table
              dataSource={selectedOrder.items}
              pagination={false}
              rowKey="id"
              columns={[
                {
                  title: 'Product',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Price',
                  dataIndex: 'price',
                  key: 'price',
                  render: price => formatCurrency(price),
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'Total',
                  dataIndex: 'total',
                  key: 'total',
                  render: total => formatCurrency(total),
                },
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong>Total:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>{formatCurrency(selectedOrder.totalAmount)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
            
            {selectedOrder.note && (
              <>
                <Divider />
                <h3>Notes</h3>
                <p>{selectedOrder.note}</p>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders; 