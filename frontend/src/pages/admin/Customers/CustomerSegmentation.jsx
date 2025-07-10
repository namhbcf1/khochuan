import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Button, Table, Spin, Statistic, Alert, Tabs, Tag, Tooltip, Progress } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserOutlined, ClockCircleOutlined, DollarOutlined, ShoppingOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const { TabPane } = Tabs;
const { Option } = Select;

// Define colors for segments
const SEGMENT_COLORS = {
  'Champions': '#52c41a',
  'Loyal': '#1890ff',
  'Potential Loyalists': '#13c2c2',
  'New Customers': '#722ed1',
  'Promising': '#2f54eb',
  'Needs Attention': '#faad14',
  'At Risk': '#fa8c16',
  'Can\'t Lose': '#fa541c',
  'Lost': '#f5222d'
};

const CustomerSegmentation = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [segmentData, setSegmentData] = useState([]);
  const [timeframe, setTimeframe] = useState('90d');
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [processingIndicator, setProcessingIndicator] = useState(false);
  const [segmentationResults, setSegmentationResults] = useState(null);
  
  useEffect(() => {
    fetchSegmentData();
  }, [timeframe]);

  const fetchSegmentData = async () => {
    setLoading(true);
    setProcessingIndicator(true);
    setError(null);
    
    try {
      const response = await api.get(`/ai/customers/segment?timeframe=${timeframe}&include_metrics=${includeMetrics}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSegmentData(response.data.data.segments);
        setSegmentationResults(response.data.data);
        console.log('Segmentation data:', response.data.data);
      } else {
        setError('Failed to load customer segments');
      }
    } catch (err) {
      console.error('Error fetching customer segments:', err);
      setError(`Error: ${err.message || 'Failed to load customer segments'}`);
    } finally {
      setLoading(false);
      setTimeout(() => setProcessingIndicator(false), 800); // Keep indicator visible briefly for UX
    }
  };

  const handleTimeframeChange = (value) => {
    setTimeframe(value);
  };

  const handleRefresh = () => {
    fetchSegmentData();
  };

  // Prepare data for pie chart
  const pieChartData = segmentData.map(segment => ({
    name: segment.segment_name,
    value: segment.customer_count,
    color: SEGMENT_COLORS[segment.segment_name] || '#8c8c8c'
  }));

  // Prepare data for bar chart
  const barChartData = segmentData.map(segment => ({
    name: segment.segment_name,
    recency: segment.avg_recency,
    frequency: segment.avg_frequency,
    monetary: segment.avg_monetary
  }));

  // Columns for the segments table
  const columns = [
    {
      title: 'Segment',
      dataIndex: 'segment_name',
      key: 'segment_name',
      render: (text) => (
        <Tag color={SEGMENT_COLORS[text] || 'default'} style={{ fontSize: '14px', padding: '4px 8px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'segment_description',
      key: 'segment_description',
    },
    {
      title: 'Customers',
      dataIndex: 'customer_count',
      key: 'customer_count',
      sorter: (a, b) => a.customer_count - b.customer_count,
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (text) => `${text}%`,
      sorter: (a, b) => a.percentage - b.percentage,
    },
    {
      title: 'Avg. Recency',
      dataIndex: 'avg_recency',
      key: 'avg_recency',
      render: (value) => (
        <Tooltip title={`${value} out of 5`}>
          <Progress percent={value * 20} size="small" strokeColor={value > 3.5 ? "#52c41a" : value > 2.5 ? "#faad14" : "#f5222d"} />
        </Tooltip>
      ),
      sorter: (a, b) => a.avg_recency - b.avg_recency,
    },
    {
      title: 'Avg. Frequency',
      dataIndex: 'avg_frequency',
      key: 'avg_frequency',
      render: (value) => (
        <Tooltip title={`${value} out of 5`}>
          <Progress percent={value * 20} size="small" strokeColor={value > 3.5 ? "#52c41a" : value > 2.5 ? "#faad14" : "#f5222d"} />
        </Tooltip>
      ),
      sorter: (a, b) => a.avg_frequency - b.avg_frequency,
    },
    {
      title: 'Avg. Monetary',
      dataIndex: 'avg_monetary',
      key: 'avg_monetary',
      render: (value) => (
        <Tooltip title={`${value} out of 5`}>
          <Progress percent={value * 20} size="small" strokeColor={value > 3.5 ? "#52c41a" : value > 2.5 ? "#faad14" : "#f5222d"} />
        </Tooltip>
      ),
      sorter: (a, b) => a.avg_monetary - b.avg_monetary,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => console.log('View customers in segment:', record.segment_name)}>
          View Customers
        </Button>
      ),
    },
  ];

  return (
    <div className="customer-segmentation-page">
      <h1>Customer Segmentation</h1>
      
      <Card className="control-card">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6} lg={4}>
            <label>Time Period:</label>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={timeframe}
              onChange={handleTimeframeChange}
              disabled={loading}
            >
              <Option value="30d">Last 30 Days</Option>
              <Option value="90d">Last 90 Days</Option>
              <Option value="180d">Last 180 Days</Option>
              <Option value="365d">Last 365 Days</Option>
              <Option value="all">All Time</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6} lg={4}>
            <Button 
              type="primary" 
              onClick={handleRefresh} 
              loading={loading}
              style={{ marginTop: 32 }}
            >
              Analyze Customers
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

      {processingIndicator && (
        <Card className="processing-indicator" style={{ marginTop: 16, textAlign: 'center' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Processing customer data...</p>
        </Card>
      )}

      {!processingIndicator && segmentationResults && (
        <div className="segmentation-results">
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Total Customers"
                  value={segmentationResults.metrics.total_customers}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Analyzed Customers"
                  value={segmentationResults.metrics.analyzed_customers}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Time Period"
                  value={segmentationResults.metrics.time_period}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Segments"
                  value={segmentData.length}
                  prefix={<DollarOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Tabs defaultActiveKey="overview" style={{ marginTop: 16 }}>
            <TabPane tab="Overview" key="overview">
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Card title="Customer Segment Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="RFM Metrics by Segment">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={barChartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="recency" name="Recency" fill="#8884d8" />
                        <Bar dataKey="frequency" name="Frequency" fill="#82ca9d" />
                        <Bar dataKey="monetary" name="Monetary" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Segment Details" key="details">
              <Card>
                <Table
                  columns={columns}
                  dataSource={segmentData}
                  rowKey="segment_name"
                  pagination={false}
                  loading={loading}
                />
              </Card>
            </TabPane>
            <TabPane tab="Marketing Recommendations" key="recommendations">
              <Card title="Segment-Based Marketing Strategies">
                {segmentData.map(segment => (
                  <Card 
                    key={segment.segment_name} 
                    type="inner" 
                    title={
                      <span>
                        <Tag color={SEGMENT_COLORS[segment.segment_name] || 'default'}>
                          {segment.segment_name}
                        </Tag>
                        {segment.segment_name}
                      </span>
                    }
                    style={{ marginBottom: 16 }}
                  >
                    <p><strong>Description:</strong> {segment.segment_description}</p>
                    <p><strong>Customer Count:</strong> {segment.customer_count} ({segment.percentage}%)</p>
                    <p><strong>Recommended Strategy:</strong></p>
                    {segment.segment_name === 'Champions' && (
                      <ul>
                        <li>Reward these customers with loyalty programs</li>
                        <li>Create referral incentives</li>
                        <li>Ask for reviews and testimonials</li>
                        <li>Engage them as brand ambassadors</li>
                      </ul>
                    )}
                    {segment.segment_name === 'Loyal' && (
                      <ul>
                        <li>Upsell higher-value products</li>
                        <li>Invite to exclusive events</li>
                        <li>Create membership programs</li>
                        <li>Provide early access to new products</li>
                      </ul>
                    )}
                    {segment.segment_name === 'Potential Loyalists' && (
                      <ul>
                        <li>Offer personalized recommendations</li>
                        <li>Implement targeted email campaigns</li>
                        <li>Provide special onboarding</li>
                        <li>Create membership benefits</li>
                      </ul>
                    )}
                    {segment.segment_name === 'New Customers' && (
                      <ul>
                        <li>Focus on excellent first experience</li>
                        <li>Educational content about products</li>
                        <li>Follow-up communication</li>
                        <li>First purchase discount on next order</li>
                      </ul>
                    )}
                    {segment.segment_name === 'Promising' && (
                      <ul>
                        <li>Targeted cross-selling</li>
                        <li>Personalized product recommendations</li>
                        <li>Engagement through multiple channels</li>
                        <li>Feedback surveys with incentives</li>
                      </ul>
                    )}
                    {segment.segment_name === 'Needs Attention' && (
                      <ul>
                        <li>Re-engagement campaigns</li>
                        <li>Feedback surveys to understand issues</li>
                        <li>Special offers to increase purchase frequency</li>
                        <li>Product education to increase value perception</li>
                      </ul>
                    )}
                    {segment.segment_name === 'At Risk' && (
                      <ul>
                        <li>Win-back campaigns</li>
                        <li>Special discounts or offers</li>
                        <li>Personalized communication</li>
                        <li>Surveys to understand why they left</li>
                      </ul>
                    )}
                    {segment.segment_name === 'Can\'t Lose' && (
                      <ul>
                        <li>Reactivation campaigns</li>
                        <li>Special incentives to return</li>
                        <li>Personalized outreach</li>
                        <li>New product announcements</li>
                      </ul>
                    )}
                    {segment.segment_name === 'Lost' && (
                      <ul>
                        <li>Final attempt win-back offers</li>
                        <li>Feedback surveys to improve</li>
                        <li>Consider removing from active marketing</li>
                        <li>Analyze reasons for loss to prevent future churn</li>
                      </ul>
                    )}
                  </Card>
                ))}
              </Card>
            </TabPane>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default CustomerSegmentation; 