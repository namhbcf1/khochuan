import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Select, Button, Spin, Alert, Tabs, Tag, Tooltip, Progress, DatePicker, Statistic } from 'antd';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ShoppingOutlined, WarningOutlined, ClockCircleOutlined, InboxOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Define colors for stock status
const STOCK_STATUS_COLORS = {
  'adequate': '#52c41a',
  'low': '#faad14',
  'critical': '#f5222d'
};

const InventoryDashboard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [forecastPeriod, setForecastPeriod] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [processingIndicator, setProcessingIndicator] = useState(false);
  const [forecastMetadata, setForecastMetadata] = useState(null);
  
  useEffect(() => {
    fetchCategories();
    fetchInventoryData();
  }, []);

  useEffect(() => {
    fetchForecastData();
  }, [forecastPeriod, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchInventoryData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/inventory', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setInventoryData(response.data.data);
      } else {
        setError('Failed to load inventory data');
      }
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError(`Error: ${err.message || 'Failed to load inventory data'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecastData = async () => {
    setProcessingIndicator(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.append('category_id', selectedCategory);
      }
      params.append('forecast_period', forecastPeriod);
      
      const response = await api.get(`/ai/demand-forecast?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setForecastData(response.data.data.forecasts);
        setForecastMetadata(response.data.data.metadata);
        console.log('Forecast data:', response.data.data);
      } else {
        setError('Failed to load forecast data');
      }
    } catch (err) {
      console.error('Error fetching forecast data:', err);
      setError(`Error: ${err.message || 'Failed to load forecast data'}`);
    } finally {
      setTimeout(() => setProcessingIndicator(false), 800); // Keep indicator visible briefly for UX
    }
  };

  const handleForecastPeriodChange = (value) => {
    setForecastPeriod(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleRefresh = () => {
    fetchInventoryData();
    fetchForecastData();
  };

  // Calculate inventory metrics
  const calculateInventoryMetrics = () => {
    const totalProducts = inventoryData.length;
    const lowStockProducts = inventoryData.filter(item => item.stock_status === 'low').length;
    const outOfStockProducts = inventoryData.filter(item => item.quantity <= 0).length;
    const totalValue = inventoryData.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    
    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue
    };
  };

  const metrics = calculateInventoryMetrics();

  // Columns for the inventory table
  const inventoryColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'In Stock',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Status',
      dataIndex: 'stock_status',
      key: 'stock_status',
      render: (status) => {
        let color = STOCK_STATUS_COLORS[status] || 'default';
        return (
          <Tag color={color}>
            {status.toUpperCase()}
          </Tag>
        );
      },
      filters: [
        { text: 'Adequate', value: 'adequate' },
        { text: 'Low', value: 'low' },
        { text: 'Critical', value: 'critical' },
      ],
      onFilter: (value, record) => record.stock_status === value,
    },
    {
      title: 'Reorder Point',
      dataIndex: 'reorder_point',
      key: 'reorder_point',
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => console.log('View product details:', record.id)}>
          View Details
        </Button>
      ),
    },
  ];

  // Columns for the forecast table
  const forecastColumns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
    },
    {
      title: 'Predicted Demand',
      dataIndex: ['summary', 'total_predicted_demand'],
      key: 'predicted_demand',
      sorter: (a, b) => a.summary.total_predicted_demand - b.summary.total_predicted_demand,
    },
    {
      title: 'Daily Avg',
      dataIndex: ['summary', 'avg_daily_demand'],
      key: 'avg_daily_demand',
      render: (value) => value.toFixed(1),
    },
    {
      title: 'Trend',
      dataIndex: ['summary', 'trend'],
      key: 'trend',
      render: (trend) => {
        let color = trend === 'increasing' ? 'green' : trend === 'decreasing' ? 'red' : 'blue';
        return (
          <Tag color={color}>
            {trend.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Stock Status',
      dataIndex: ['summary', 'stock_status'],
      key: 'stock_status',
      render: (status) => {
        let color = STOCK_STATUS_COLORS[status] || 'default';
        return (
          <Tag color={color}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Days Until Stockout',
      dataIndex: ['summary', 'days_until_stockout'],
      key: 'days_until_stockout',
      render: (days) => {
        let color = days < 7 ? 'red' : days < 14 ? 'orange' : 'green';
        return (
          <span style={{ color }}>
            {days} days
          </span>
        );
      },
    },
    {
      title: 'Reorder',
      dataIndex: ['summary', 'reorder_recommendation', 'should_reorder'],
      key: 'should_reorder',
      render: (shouldReorder, record) => {
        return shouldReorder ? (
          <Button type="primary" danger size="small">
            Reorder {record.summary.reorder_recommendation.recommended_quantity} units
          </Button>
        ) : (
          <Tag color="green">No action needed</Tag>
        );
      },
    },
  ];

  // Prepare data for forecast chart
  const prepareChartData = (product) => {
    if (!product || !product.forecast) return [];
    
    return product.forecast.map(day => ({
      date: day.date,
      predicted: day.predicted_demand,
      lower: day.lower_bound,
      upper: day.upper_bound
    }));
  };

  return (
    <div className="inventory-dashboard-page">
      <h1>Inventory Dashboard</h1>
      
      <Card className="control-card">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6} lg={4}>
            <label>Category:</label>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="All Categories"
              onChange={handleCategoryChange}
              allowClear
              disabled={loading}
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6} lg={4}>
            <label>Forecast Period:</label>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={forecastPeriod}
              onChange={handleForecastPeriodChange}
              disabled={loading}
            >
              <Option value="7d">7 Days</Option>
              <Option value="14d">14 Days</Option>
              <Option value="30d">30 Days</Option>
              <Option value="90d">90 Days</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6} lg={4}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={handleRefresh} 
              loading={loading}
              style={{ marginTop: 32 }}
            >
              Refresh Data
            </Button>
          </Col>
          <Col xs={24} sm={8} md={6} lg={4}>
            <Button 
              type="default" 
              icon={<DownloadOutlined />}
              onClick={() => console.log('Export data')} 
              style={{ marginTop: 32 }}
            >
              Export Report
            </Button>
          </Col>
        </Row>
      </Card>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={metrics.totalProducts}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={metrics.lowStockProducts}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Out of Stock"
              value={metrics.outOfStockProducts}
              valueStyle={{ color: '#f5222d' }}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Inventory Value"
              value={metrics.totalValue}
              precision={2}
              prefix="$"
            />
          </Card>
        </Col>
      </Row>

      {processingIndicator && (
        <Card className="processing-indicator" style={{ marginTop: 16, textAlign: 'center' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Processing inventory forecast...</p>
        </Card>
      )}

      <Tabs defaultActiveKey="forecast" style={{ marginTop: 16 }}>
        <TabPane tab="Demand Forecast" key="forecast">
          {!processingIndicator && forecastData.length > 0 && (
            <>
              <Card title="Inventory Forecast" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col xs={24} lg={24}>
                    <p>Showing forecast for {forecastPeriod} with {forecastMetadata?.accuracy_metrics?.mape ? `${(forecastMetadata.accuracy_metrics.mape * 100).toFixed(1)}%` : 'N/A'} average prediction error.</p>
                    <Table
                      columns={forecastColumns}
                      dataSource={forecastData}
                      rowKey="product_id"
                      pagination={{ pageSize: 5 }}
                      expandable={{
                        expandedRowRender: record => (
                          <div style={{ margin: 0 }}>
                            <h4>Forecast Details</h4>
                            <Row gutter={16}>
                              <Col span={24}>
                                <ResponsiveContainer width="100%" height={200}>
                                  <AreaChart
                                    data={prepareChartData(record)}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="predicted" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Predicted Demand" />
                                    <Area type="monotone" dataKey="upper" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.1} name="Upper Bound" />
                                    <Area type="monotone" dataKey="lower" stroke="#ffc658" fill="#ffc658" fillOpacity={0.1} name="Lower Bound" />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </Col>
                            </Row>
                            <Row gutter={16} style={{ marginTop: 16 }}>
                              <Col span={8}>
                                <h4>Seasonal Factors</h4>
                                <ul>
                                  {Object.entries(record.summary.seasonal_factors).map(([day, factor]) => (
                                    <li key={day}>{day.charAt(0).toUpperCase() + day.slice(1)}: {factor.toFixed(1)}</li>
                                  ))}
                                </ul>
                              </Col>
                              <Col span={8}>
                                <h4>Reorder Recommendation</h4>
                                <p><strong>Should Reorder:</strong> {record.summary.reorder_recommendation.should_reorder ? 'Yes' : 'No'}</p>
                                <p><strong>Recommended Quantity:</strong> {record.summary.reorder_recommendation.recommended_quantity}</p>
                                <p><strong>Optimal Order Date:</strong> {record.summary.reorder_recommendation.optimal_order_date}</p>
                              </Col>
                              <Col span={8}>
                                <h4>Stock Status</h4>
                                <p><strong>Current Stock:</strong> {record.current_stock}</p>
                                <p><strong>Days Until Stockout:</strong> {record.summary.days_until_stockout}</p>
                                <p><strong>Stock Status:</strong> <Tag color={STOCK_STATUS_COLORS[record.summary.stock_status]}>{record.summary.stock_status.toUpperCase()}</Tag></p>
                              </Col>
                            </Row>
                          </div>
                        ),
                      }}
                    />
                  </Col>
                </Row>
              </Card>
              
              <Card title="Inventory Insights">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Card type="inner" title="Products Requiring Reorder">
                      <Table
                        columns={[
                          { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
                          { title: 'Current Stock', dataIndex: 'current_stock', key: 'current_stock' },
                          { title: 'Recommended Qty', dataIndex: ['summary', 'reorder_recommendation', 'recommended_quantity'], key: 'recommended_qty' },
                          { 
                            title: 'Action', 
                            key: 'action',
                            render: () => <Button size="small" type="primary">Order</Button>
                          }
                        ]}
                        dataSource={forecastData.filter(item => item.summary.reorder_recommendation.should_reorder)}
                        rowKey="product_id"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card type="inner" title="Trending Products">
                      <Table
                        columns={[
                          { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
                          { 
                            title: 'Trend', 
                            dataIndex: ['summary', 'trend'], 
                            key: 'trend',
                            render: (trend) => {
                              let color = trend === 'increasing' ? 'green' : trend === 'decreasing' ? 'red' : 'blue';
                              return (
                                <Tag color={color}>
                                  {trend.toUpperCase()}
                                </Tag>
                              );
                            }
                          },
                          { title: 'Daily Demand', dataIndex: ['summary', 'avg_daily_demand'], key: 'avg_daily_demand', render: (val) => val.toFixed(1) }
                        ]}
                        dataSource={forecastData.filter(item => item.summary.trend === 'increasing').sort((a, b) => b.summary.avg_daily_demand - a.summary.avg_daily_demand)}
                        rowKey="product_id"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>
                </Row>
              </Card>
            </>
          )}
          
          {!processingIndicator && forecastData.length === 0 && !error && (
            <Card>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p>No forecast data available. Try selecting a different category or time period.</p>
              </div>
            </Card>
          )}
        </TabPane>
        
        <TabPane tab="Current Inventory" key="inventory">
          <Card>
            <Table
              columns={inventoryColumns}
              dataSource={inventoryData}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="Inventory Analytics" key="analytics">
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card title="Stock Level by Category">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={categories.map(category => ({
                      name: category.name,
                      value: inventoryData.filter(item => item.category === category.name).reduce((sum, item) => sum + item.quantity, 0)
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="value" name="Stock Quantity" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Stock Status Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Adequate', value: inventoryData.filter(item => item.stock_status === 'adequate').length, color: STOCK_STATUS_COLORS.adequate },
                        { name: 'Low', value: inventoryData.filter(item => item.stock_status === 'low').length, color: STOCK_STATUS_COLORS.low },
                        { name: 'Critical', value: inventoryData.filter(item => item.stock_status === 'critical').length, color: STOCK_STATUS_COLORS.critical }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Adequate', color: STOCK_STATUS_COLORS.adequate },
                        { name: 'Low', color: STOCK_STATUS_COLORS.low },
                        { name: 'Critical', color: STOCK_STATUS_COLORS.critical }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default InventoryDashboard; 