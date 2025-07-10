import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Select, Form, InputNumber, Spin, Alert, Tabs, Tag, Tooltip, Progress, Slider, Statistic } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { DollarOutlined, RiseOutlined, PercentageOutlined, InfoCircleOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const { TabPane } = Tabs;
const { Option } = Select;

const PriceOptimization = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [optimizationResults, setOptimizationResults] = useState([]);
  const [optimizationMetadata, setOptimizationMetadata] = useState(null);
  const [optimizationTarget, setOptimizationTarget] = useState('revenue');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceSimulation, setPriceSimulation] = useState(null);
  const [processingIndicator, setProcessingIndicator] = useState(false);
  
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);
  
  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory);
    }
  }, [selectedCategory]);

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

  const fetchProducts = async (categoryId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (categoryId) {
        params.append('category_id', categoryId);
      }
      
      const response = await api.get(`/products?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(`Error: ${err.message || 'Failed to load products'}`);
    } finally {
      setLoading(false);
    }
  };

  const runPriceOptimization = async () => {
    setProcessingIndicator(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.append('category_id', selectedCategory);
      }
      params.append('optimization_target', optimizationTarget);
      
      const response = await api.get(`/ai/price-optimization?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setOptimizationResults(response.data.data.optimizations);
        setOptimizationMetadata(response.data.data.metadata);
        console.log('Optimization data:', response.data.data);
      } else {
        setError('Failed to load optimization data');
      }
    } catch (err) {
      console.error('Error fetching optimization data:', err);
      setError(`Error: ${err.message || 'Failed to load optimization data'}`);
    } finally {
      setTimeout(() => setProcessingIndicator(false), 800); // Keep indicator visible briefly for UX
    }
  };

  const simulatePrice = async (productId, price) => {
    setProcessingIndicator(true);
    setError(null);
    
    try {
      const response = await api.post('/ai/price-simulation', {
        product_id: productId,
        price: price
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setPriceSimulation(response.data.data);
        console.log('Simulation data:', response.data.data);
      } else {
        setError('Failed to simulate price');
      }
    } catch (err) {
      console.error('Error simulating price:', err);
      setError(`Error: ${err.message || 'Failed to simulate price'}`);
    } finally {
      setTimeout(() => setProcessingIndicator(false), 800);
    }
  };

  const applyOptimizedPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/products/update-prices', {
        products: optimizationResults.map(item => ({
          product_id: item.product_id,
          new_price: item.optimized_price
        }))
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Show success message or notification
        fetchProducts(selectedCategory);
      } else {
        setError('Failed to apply optimized prices');
      }
    } catch (err) {
      console.error('Error applying optimized prices:', err);
      setError(`Error: ${err.message || 'Failed to apply optimized prices'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setOptimizationResults([]);
    setPriceSimulation(null);
  };

  const handleOptimizationTargetChange = (value) => {
    setOptimizationTarget(value);
  };

  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    
    // Find product in optimization results
    const product = optimizationResults.find(p => p.product_id === productId);
    if (product) {
      simulatePrice(productId, product.current_price);
    }
  };

  // Columns for the price optimization table
  const optimizationColumns = [
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
      title: 'Current Price',
      dataIndex: 'current_price',
      key: 'current_price',
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Optimized Price',
      dataIndex: 'optimized_price',
      key: 'optimized_price',
      render: (price, record) => {
        const diff = ((price - record.current_price) / record.current_price) * 100;
        const color = diff > 0 ? 'green' : diff < 0 ? 'red' : 'default';
        
        return (
          <span>
            <span style={{ color: diff > 0 ? 'green' : diff < 0 ? 'red' : 'inherit', fontWeight: 'bold' }}>
              ${price.toFixed(2)}
            </span>
            <Tag color={color} style={{ marginLeft: 8 }}>
              {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
            </Tag>
          </span>
        );
      },
    },
    {
      title: 'Expected Impact',
      key: 'impact',
      render: (_, record) => {
        const revenueDiff = ((record.expected_revenue - record.current_revenue) / record.current_revenue) * 100;
        const unitsDiff = ((record.expected_units - record.current_units) / record.current_units) * 100;
        
        return (
          <div>
            <div>
              <span style={{ marginRight: 8 }}>Revenue:</span>
              <Tag color={revenueDiff > 0 ? 'green' : 'red'}>
                {revenueDiff > 0 ? '+' : ''}{revenueDiff.toFixed(1)}%
              </Tag>
            </div>
            <div>
              <span style={{ marginRight: 8 }}>Units:</span>
              <Tag color={unitsDiff > 0 ? 'green' : 'red'}>
                {unitsDiff > 0 ? '+' : ''}{unitsDiff.toFixed(1)}%
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Price Elasticity',
      dataIndex: 'price_elasticity',
      key: 'price_elasticity',
      render: (elasticity) => {
        const absElasticity = Math.abs(elasticity);
        let description;
        let color;
        
        if (absElasticity < 0.5) {
          description = 'Inelastic';
          color = 'green';
        } else if (absElasticity < 1.0) {
          description = 'Moderately elastic';
          color = 'blue';
        } else if (absElasticity < 1.5) {
          description = 'Elastic';
          color = 'orange';
        } else {
          description = 'Highly elastic';
          color = 'red';
        }
        
        return (
          <Tooltip title={`${description}: Demand changes by ${absElasticity.toFixed(2)}% for each 1% change in price`}>
            <Tag color={color}>
              {elasticity.toFixed(2)}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleProductSelect(record.product_id)}>
          Simulate
        </Button>
      ),
    },
  ];

  // Prepare data for elasticity curve chart
  const prepareElasticityCurveData = (product) => {
    if (!product || !product.elasticity_curve) return [];
    
    return product.elasticity_curve.map(point => ({
      price: point.price,
      demand: point.expected_demand,
      revenue: point.price * point.expected_demand,
      profit: (point.price - product.cost) * point.expected_demand
    }));
  };

  return (
    <div className="price-optimization-page">
      <h1>Price Optimization</h1>
      
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
            <label>Optimization Target:</label>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={optimizationTarget}
              onChange={handleOptimizationTargetChange}
              disabled={loading}
            >
              <Option value="revenue">Maximize Revenue</Option>
              <Option value="profit">Maximize Profit</Option>
              <Option value="units">Maximize Units Sold</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6} lg={4}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={runPriceOptimization} 
              loading={loading}
              style={{ marginTop: 32 }}
            >
              Run Optimization
            </Button>
          </Col>
          {optimizationResults.length > 0 && (
            <Col xs={24} sm={8} md={6} lg={4}>
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                onClick={applyOptimizedPrices} 
                loading={loading}
                style={{ marginTop: 32 }}
              >
                Apply All Prices
              </Button>
            </Col>
          )}
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
          <p style={{ marginTop: 16 }}>Processing price optimization...</p>
        </Card>
      )}

      {!processingIndicator && optimizationResults.length > 0 && (
        <>
          <Card title="Price Optimization Results" style={{ marginTop: 16 }}>
            {optimizationMetadata && (
              <div className="optimization-summary" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Statistic
                      title="Potential Revenue Increase"
                      value={optimizationMetadata.total_revenue_increase_percentage}
                      precision={1}
                      valueStyle={{ color: '#3f8600' }}
                      prefix={<RiseOutlined />}
                      suffix="%"
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <Statistic
                      title="Potential Profit Increase"
                      value={optimizationMetadata.total_profit_increase_percentage}
                      precision={1}
                      valueStyle={{ color: '#3f8600' }}
                      prefix={<DollarOutlined />}
                      suffix="%"
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <Statistic
                      title="Average Price Change"
                      value={optimizationMetadata.average_price_change_percentage}
                      precision={1}
                      valueStyle={{ color: optimizationMetadata.average_price_change_percentage > 0 ? '#3f8600' : '#cf1322' }}
                      prefix={<PercentageOutlined />}
                      suffix="%"
                    />
                  </Col>
                </Row>
              </div>
            )}
            
            <Table
              columns={optimizationColumns}
              dataSource={optimizationResults}
              rowKey="product_id"
              pagination={{ pageSize: 10 }}
            />
          </Card>

          {selectedProduct && priceSimulation && (
            <Card title="Price Simulation" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Card type="inner" title="Price Elasticity Curve">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={prepareElasticityCurveData(priceSimulation)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="price" 
                          label={{ value: 'Price ($)', position: 'insideBottom', offset: -5 }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <YAxis 
                          yAxisId="left"
                          label={{ value: 'Demand (Units)', angle: -90, position: 'insideLeft' }}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight' }}
                        />
                        <RechartsTooltip formatter={(value, name) => {
                          if (name === 'demand') return [`${value} units`, 'Demand'];
                          if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                          if (name === 'profit') return [`$${value.toFixed(2)}`, 'Profit'];
                          return [value, name];
                        }} />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="demand" 
                          stroke="#8884d8" 
                          name="Demand"
                          dot={false}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#82ca9d" 
                          name="Revenue"
                          dot={false}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="profit" 
                          stroke="#ff7300" 
                          name="Profit"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card type="inner" title="Price Simulator">
                    <Form layout="vertical">
                      <Form.Item label="Product">
                        <strong>{priceSimulation.product_name}</strong>
                      </Form.Item>
                      <Form.Item label="Current Price">
                        <strong>${priceSimulation.current_price.toFixed(2)}</strong>
                      </Form.Item>
                      <Form.Item label="Optimized Price">
                        <strong>${priceSimulation.optimized_price.toFixed(2)}</strong>
                      </Form.Item>
                      <Form.Item label="Cost">
                        <strong>${priceSimulation.cost.toFixed(2)}</strong>
                      </Form.Item>
                      <Form.Item label="Price Elasticity">
                        <strong>{priceSimulation.price_elasticity.toFixed(2)}</strong>
                        <Tooltip title="Price elasticity measures how sensitive demand is to price changes. A value of -1.0 means a 1% price increase leads to a 1% demand decrease.">
                          <InfoCircleOutlined style={{ marginLeft: 8 }} />
                        </Tooltip>
                      </Form.Item>
                      <Form.Item label="Simulate Custom Price">
                        <Row gutter={16}>
                          <Col span={18}>
                            <Slider
                              min={Math.max(priceSimulation.cost, priceSimulation.current_price * 0.5)}
                              max={priceSimulation.current_price * 1.5}
                              step={0.01}
                              defaultValue={priceSimulation.current_price}
                              onChange={(value) => simulatePrice(selectedProduct, value)}
                              tipFormatter={(value) => `$${value.toFixed(2)}`}
                            />
                          </Col>
                          <Col span={6}>
                            <InputNumber
                              min={Math.max(priceSimulation.cost, priceSimulation.current_price * 0.5)}
                              max={priceSimulation.current_price * 1.5}
                              step={0.01}
                              value={priceSimulation.simulated_price}
                              onChange={(value) => simulatePrice(selectedProduct, value)}
                              formatter={(value) => `$ ${value}`}
                              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                              style={{ width: '100%' }}
                            />
                          </Col>
                        </Row>
                      </Form.Item>
                    </Form>
                    
                    <div className="simulation-results" style={{ marginTop: 24 }}>
                      <h4>Simulation Results</h4>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Statistic
                            title="Expected Demand"
                            value={priceSimulation.simulated_demand}
                            precision={0}
                            suffix="units"
                          />
                          <div style={{ marginTop: 8 }}>
                            <small>
                              vs. Current: {priceSimulation.current_demand} units
                              <Tag color={priceSimulation.simulated_demand > priceSimulation.current_demand ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                                {((priceSimulation.simulated_demand - priceSimulation.current_demand) / priceSimulation.current_demand * 100).toFixed(1)}%
                              </Tag>
                            </small>
                          </div>
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="Expected Revenue"
                            value={priceSimulation.simulated_revenue}
                            precision={2}
                            prefix="$"
                          />
                          <div style={{ marginTop: 8 }}>
                            <small>
                              vs. Current: ${priceSimulation.current_revenue.toFixed(2)}
                              <Tag color={priceSimulation.simulated_revenue > priceSimulation.current_revenue ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                                {((priceSimulation.simulated_revenue - priceSimulation.current_revenue) / priceSimulation.current_revenue * 100).toFixed(1)}%
                              </Tag>
                            </small>
                          </div>
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="Expected Profit"
                            value={priceSimulation.simulated_profit}
                            precision={2}
                            prefix="$"
                          />
                          <div style={{ marginTop: 8 }}>
                            <small>
                              vs. Current: ${priceSimulation.current_profit.toFixed(2)}
                              <Tag color={priceSimulation.simulated_profit > priceSimulation.current_profit ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                                {((priceSimulation.simulated_profit - priceSimulation.current_profit) / priceSimulation.current_profit * 100).toFixed(1)}%
                              </Tag>
                            </small>
                          </div>
                        </Col>
                      </Row>
                      
                      <div style={{ marginTop: 24 }}>
                        <Button 
                          type="primary"
                          onClick={() => {
                            // Apply this single price change
                            console.log(`Apply price ${priceSimulation.simulated_price} to product ${selectedProduct}`);
                          }}
                        >
                          Apply This Price
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
          )}
        </>
      )}
      
      {!processingIndicator && optimizationResults.length === 0 && !error && (
        <Card style={{ marginTop: 16, textAlign: 'center' }}>
          <p>Select a category and click "Run Optimization" to see price recommendations.</p>
        </Card>
      )}
    </div>
  );
};

export default PriceOptimization; 