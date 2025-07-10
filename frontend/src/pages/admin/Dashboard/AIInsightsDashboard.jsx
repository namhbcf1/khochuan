import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Tabs, Spin, Alert, List, Tag, Tooltip, Progress, Divider } from 'antd';
import { 
  RobotOutlined, 
  UserOutlined, 
  ShoppingOutlined, 
  DollarOutlined, 
  LineChartOutlined, 
  BulbOutlined,
  RiseOutlined,
  BarChartOutlined,
  ReloadOutlined,
  AreaChartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const { TabPane } = Tabs;

const AIInsightsDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [demandForecasts, setDemandForecasts] = useState([]);
  const [priceOptimizations, setPriceOptimizations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [aiMetrics, setAiMetrics] = useState({
    totalRevenueIncrease: 0,
    totalProfitIncrease: 0,
    inventoryEfficiency: 0,
    customerEngagement: 0,
    recommendationConversion: 0
  });
  
  useEffect(() => {
    fetchAIData();
  }, []);
  
  const fetchAIData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch data in parallel
      const [
        segmentsResponse,
        forecastsResponse,
        optimizationsResponse,
        recommendationsResponse,
        metricsResponse
      ] = await Promise.all([
        api.get('/ai/customer-segments?segment_count=5', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/ai/demand-forecast?forecast_period=30d&limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/ai/price-optimization?optimization_target=revenue&limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/ai/trending-products?limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/analytics/ai-performance', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      if (segmentsResponse.data.success) {
        setCustomerSegments(segmentsResponse.data.data.segments || []);
      }
      
      if (forecastsResponse.data.success) {
        setDemandForecasts(forecastsResponse.data.data.forecasts || []);
      }
      
      if (optimizationsResponse.data.success) {
        setPriceOptimizations(optimizationsResponse.data.data.optimizations || []);
      }
      
      if (recommendationsResponse.data.success) {
        setRecommendations(recommendationsResponse.data.data || []);
      }
      
      if (metricsResponse.data.success) {
        setAiMetrics(metricsResponse.data.data || {
          totalRevenueIncrease: 5.8,
          totalProfitIncrease: 7.2,
          inventoryEfficiency: 12.5,
          customerEngagement: 8.3,
          recommendationConversion: 4.7
        });
      }
    } catch (err) {
      console.error('Error fetching AI data:', err);
      setError(`Error: ${err.message || 'Failed to load AI insights'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const navigateToFeature = (path) => {
    navigate(path);
  };
  
  // Colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Prepare data for segment distribution chart
  const prepareSegmentData = () => {
    if (!customerSegments.length) return [];
    
    return customerSegments.map((segment, index) => ({
      name: segment.name,
      value: segment.customer_count,
      color: COLORS[index % COLORS.length]
    }));
  };
  
  // Prepare data for forecast chart
  const prepareForecastData = () => {
    if (!demandForecasts.length) return [];
    
    // Get the first product with forecast data
    const product = demandForecasts[0];
    if (!product || !product.forecast) return [];
    
    return product.forecast.slice(0, 14).map(day => ({
      date: day.date,
      demand: day.predicted_demand,
      lower: day.lower_bound,
      upper: day.upper_bound
    }));
  };
  
  // Prepare data for price optimization impact
  const prepareOptimizationData = () => {
    if (!priceOptimizations.length) return [];
    
    return priceOptimizations.slice(0, 5).map((item, index) => ({
      name: item.product_name.length > 15 ? item.product_name.substring(0, 15) + '...' : item.product_name,
      current: item.current_revenue,
      optimized: item.expected_revenue,
      color: COLORS[index % COLORS.length]
    }));
  };
  
  return (
    <div className="ai-insights-dashboard">
      <h1>
        <RobotOutlined style={{ marginRight: 8 }} />
        AI Insights Dashboard
      </h1>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <p>Loading AI insights...</p>
        </div>
      ) : error ? (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Revenue Increase"
                  value={aiMetrics.totalRevenueIncrease}
                  precision={1}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<RiseOutlined />}
                  suffix="%"
                />
                <div className="stat-description">From AI price optimization</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Profit Increase"
                  value={aiMetrics.totalProfitIncrease}
                  precision={1}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<DollarOutlined />}
                  suffix="%"
                />
                <div className="stat-description">From AI-driven strategies</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Inventory Efficiency"
                  value={aiMetrics.inventoryEfficiency}
                  precision={1}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<ShoppingOutlined />}
                  suffix="%"
                />
                <div className="stat-description">Improvement from forecasting</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Recommendation Conversion"
                  value={aiMetrics.recommendationConversion}
                  precision={1}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<BulbOutlined />}
                  suffix="%"
                />
                <div className="stat-description">Of recommendations purchased</div>
              </Card>
            </Col>
          </Row>
          
          <div style={{ textAlign: 'right', margin: '16px 0' }}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchAIData}
            >
              Refresh Data
            </Button>
          </div>
          
          <Tabs defaultActiveKey="overview">
            <TabPane 
              tab={<span><AreaChartOutlined /> Overview</span>}
              key="overview"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="Customer Segment Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={prepareSegmentData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {prepareSegmentData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <Button 
                        type="primary"
                        onClick={() => navigateToFeature('/admin/customers/segmentation')}
                      >
                        View Customer Segmentation
                      </Button>
                    </div>
                  </Card>
                </Col>
                
                <Col xs={24} lg={12}>
                  <Card title="Demand Forecast (Next 14 Days)">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={prepareForecastData()}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="demand" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Predicted Demand" />
                        <Area type="monotone" dataKey="upper" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.1} name="Upper Bound" />
                        <Area type="monotone" dataKey="lower" stroke="#ffc658" fill="#ffc658" fillOpacity={0.1} name="Lower Bound" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <Button 
                        type="primary"
                        onClick={() => navigateToFeature('/admin/inventory/demand-forecasting')}
                      >
                        View Demand Forecasting
                      </Button>
                    </div>
                  </Card>
                </Col>
                
                <Col xs={24} lg={12}>
                  <Card title="Price Optimization Impact">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={prepareOptimizationData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="current" name="Current Revenue" fill="#8884d8" />
                        <Bar dataKey="optimized" name="Optimized Revenue" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <Button 
                        type="primary"
                        onClick={() => navigateToFeature('/admin/products/price-optimization')}
                      >
                        View Price Optimization
                      </Button>
                    </div>
                  </Card>
                </Col>
                
                <Col xs={24} lg={12}>
                  <Card title="Top Product Recommendations">
                    <List
                      itemLayout="horizontal"
                      dataSource={recommendations.slice(0, 5)}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <img 
                                src={item.image_url || 'https://via.placeholder.com/40x40?text=Product'} 
                                alt={item.product_name}
                                style={{ width: 40, height: 40, objectFit: 'cover' }}
                              />
                            }
                            title={item.product_name}
                            description={
                              <div>
                                <div>${item.price.toFixed(2)}</div>
                                <Tag color="blue">{item.recommendation_reason}</Tag>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <Button 
                        type="primary"
                        onClick={() => navigateToFeature('/admin/products/recommendations')}
                      >
                        View Product Recommendations
                      </Button>
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane 
              tab={<span><UserOutlined /> Customer Segmentation</span>}
              key="segmentation"
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Customer Segments Overview">
                    <div className="segment-cards">
                      {customerSegments.map((segment, index) => (
                        <Card 
                          key={segment.id} 
                          className="segment-card"
                          style={{ borderTop: `4px solid ${COLORS[index % COLORS.length]}` }}
                        >
                          <h3>{segment.name}</h3>
                          <p>{segment.description}</p>
                          <Statistic 
                            title="Customers" 
                            value={segment.customer_count} 
                            suffix={`/ ${segment.percentage}%`}
                          />
                          <Divider />
                          <div className="segment-metrics">
                            <div className="metric">
                              <div className="metric-label">Recency</div>
                              <div className="metric-value">{segment.avg_recency_days.toFixed(1)} days</div>
                            </div>
                            <div className="metric">
                              <div className="metric-label">Frequency</div>
                              <div className="metric-value">{segment.avg_frequency.toFixed(1)} orders</div>
                            </div>
                            <div className="metric">
                              <div className="metric-label">Monetary</div>
                              <div className="metric-value">${segment.avg_monetary.toFixed(2)}</div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane 
              tab={<span><ShoppingOutlined /> Demand Forecasting</span>}
              key="forecasting"
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Top Products Requiring Attention">
                    <List
                      itemLayout="horizontal"
                      dataSource={demandForecasts.filter(item => item.summary.stock_status !== 'adequate').slice(0, 5)}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button 
                              type={item.summary.stock_status === 'critical' ? 'primary' : 'default'}
                              danger={item.summary.stock_status === 'critical'}
                            >
                              Reorder
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={item.product_name}
                            description={
                              <div>
                                <div>
                                  <Tag 
                                    color={
                                      item.summary.stock_status === 'critical' ? 'red' : 
                                      item.summary.stock_status === 'low' ? 'orange' : 'green'
                                    }
                                  >
                                    {item.summary.stock_status.toUpperCase()}
                                  </Tag>
                                  <span style={{ marginLeft: 8 }}>
                                    {item.current_stock} in stock
                                  </span>
                                </div>
                                <div>
                                  <Tooltip title="Days until stockout based on forecast">
                                    <span>Days until stockout: </span>
                                    <span style={{ 
                                      color: item.summary.days_until_stockout < 7 ? 'red' : 
                                              item.summary.days_until_stockout < 14 ? 'orange' : 'green' 
                                    }}>
                                      {item.summary.days_until_stockout}
                                    </span>
                                  </Tooltip>
                                </div>
                                <div>
                                  Predicted demand: {item.summary.total_predicted_demand} units
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane 
              tab={<span><DollarOutlined /> Price Optimization</span>}
              key="pricing"
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Top Price Optimization Opportunities">
                    <List
                      itemLayout="horizontal"
                      dataSource={priceOptimizations.sort((a, b) => 
                        (b.expected_revenue - b.current_revenue) - (a.expected_revenue - a.current_revenue)
                      ).slice(0, 5)}
                      renderItem={item => {
                        const revenueDiff = ((item.expected_revenue - item.current_revenue) / item.current_revenue) * 100;
                        const priceDiff = ((item.optimized_price - item.current_price) / item.current_price) * 100;
                        
                        return (
                          <List.Item
                            actions={[
                              <Button type="primary">
                                Apply Price
                              </Button>
                            ]}
                          >
                            <List.Item.Meta
                              title={item.product_name}
                              description={
                                <div>
                                  <div>
                                    Current price: ${item.current_price.toFixed(2)} → 
                                    <span style={{ 
                                      color: priceDiff > 0 ? 'green' : 'red',
                                      fontWeight: 'bold',
                                      marginLeft: 4
                                    }}>
                                      ${item.optimized_price.toFixed(2)}
                                      <span style={{ fontSize: '0.85em' }}>
                                        ({priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(1)}%)
                                      </span>
                                    </span>
                                  </div>
                                  <div>
                                    <Progress 
                                      percent={Math.abs(revenueDiff)} 
                                      size="small" 
                                      status={revenueDiff > 0 ? "success" : "exception"}
                                      format={() => `${revenueDiff > 0 ? '+' : ''}${revenueDiff.toFixed(1)}%`}
                                    />
                                    <div style={{ fontSize: '0.85em' }}>
                                      Expected revenue impact: ${item.current_revenue.toFixed(2)} → ${item.expected_revenue.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              }
                            />
                          </List.Item>
                        );
                      }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane 
              tab={<span><BulbOutlined /> Recommendations</span>}
              key="recommendations"
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Top Trending Products">
                    <div className="trending-products">
                      {recommendations.slice(0, 5).map((product, index) => (
                        <Card 
                          key={product.product_id} 
                          className="trending-product-card"
                          hoverable
                        >
                          <div className="product-image">
                            <img 
                              src={product.image_url || 'https://via.placeholder.com/150x150?text=Product'} 
                              alt={product.product_name}
                            />
                          </div>
                          <div className="product-details">
                            <h4>{product.product_name}</h4>
                            <div className="product-price">${product.price.toFixed(2)}</div>
                            <Tag color="blue">{product.recommendation_reason}</Tag>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </>
      )}
      
      <style jsx>{`
        .ai-insights-dashboard {
          padding-bottom: 24px;
        }
        
        .stat-description {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);
          margin-top: 4px;
        }
        
        .segment-cards {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .segment-card {
          flex: 1;
          min-width: 200px;
        }
        
        .segment-metrics {
          display: flex;
          justify-content: space-between;
        }
        
        .metric {
          text-align: center;
        }
        
        .metric-label {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);
        }
        
        .metric-value {
          font-weight: bold;
        }
        
        .trending-products {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .trending-product-card {
          flex: 1;
          min-width: 150px;
          max-width: 200px;
        }
        
        .product-image {
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 12px;
        }
        
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .product-details h4 {
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .product-price {
          font-weight: bold;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

export default AIInsightsDashboard; 