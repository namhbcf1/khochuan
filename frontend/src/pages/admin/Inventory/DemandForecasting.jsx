import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Select, Button, DatePicker, Spin, 
  Table, Tabs, Alert, Typography, Space, Statistic, 
  Divider, Tag, Empty, Tooltip
} from 'antd';
import { 
  LineChartOutlined, CalendarOutlined, 
  RiseOutlined, FallOutlined, ExclamationCircleOutlined,
  ReloadOutlined, DownloadOutlined
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import moment from 'moment';
import api from '../../../services/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const DemandForecasting = () => {
  const [loading, setLoading] = useState(false);
  const [forecasts, setForecasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'),
    moment().add(60, 'days')
  ]);
  const [forecastType, setForecastType] = useState('daily');
  const [error, setError] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    totalDemand: 0,
    growthRate: 0,
    confidenceScore: 0,
    stockoutRisk: 0
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/products/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load product categories');
      }
    };

    fetchCategories();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProducts = async () => {
      try {
        const response = await api.get(`/products?category_id=${selectedCategory}`);
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Fetch forecast data when product, date range or forecast type changes
  useEffect(() => {
    if (!selectedProduct) return;
    
    fetchForecastData();
  }, [selectedProduct, dateRange, forecastType]);

  const fetchForecastData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/ai/demand-forecast', {
        params: {
          product_id: selectedProduct,
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD'),
          interval: forecastType
        }
      });

      if (response.data && response.data.forecasts) {
        setForecasts(response.data.forecasts);
        
        // Calculate summary statistics
        const totalDemand = response.data.forecasts.reduce(
          (sum, item) => sum + item.forecast_quantity, 
          0
        );
        
        setSummaryStats({
          totalDemand,
          growthRate: response.data.metadata?.growth_rate || 0,
          confidenceScore: response.data.metadata?.confidence_score || 0,
          stockoutRisk: response.data.metadata?.stockout_risk || 0
        });
      } else {
        setError('Invalid forecast data received');
      }
    } catch (err) {
      console.error('Error fetching forecast data:', err);
      setError(`Error: ${err.message || 'Failed to load forecast data'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedProduct(null);
    setForecasts([]);
  };

  const handleProductChange = (value) => {
    setSelectedProduct(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleForecastTypeChange = (value) => {
    setForecastType(value);
  };

  const handleRefresh = () => {
    fetchForecastData();
  };

  const handleExport = () => {
    // Logic to export forecast data
    console.log('Exporting forecast data...');
    // Implement CSV export functionality
  };

  // Configure the line chart
  const lineConfig = {
    data: forecasts,
    xField: 'date',
    yField: 'forecast_quantity',
    seriesField: 'type',
    color: ({ type }) => {
      if (type === 'actual') return '#1890ff';
      if (type === 'forecast') return '#52c41a';
      return '#faad14';
    },
    lineStyle: ({ type }) => {
      if (type === 'forecast') {
        return {
          lineDash: [4, 4],
          opacity: 0.8,
        };
      }
      return {
        opacity: 1,
      };
    },
    point: {
      size: 4,
      shape: 'circle',
    },
    tooltip: {
      showMarkers: true,
    },
    interactions: [
      {
        type: 'marker-active',
      },
    ],
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    annotations: [
      {
        type: 'regionFilter',
        start: ['min', 'median'],
        end: ['max', '0'],
        color: 'rgba(0, 0, 255, 0.06)',
      },
    ],
  };

  // Table columns for forecast data
  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text) => moment(text).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (text) => {
        if (text === 'actual') return <Tag color="blue">Thực tế</Tag>;
        if (text === 'forecast') return <Tag color="green">Dự báo</Tag>;
        return <Tag color="orange">Dự đoán</Tag>;
      },
      filters: [
        { text: 'Thực tế', value: 'actual' },
        { text: 'Dự báo', value: 'forecast' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Số lượng',
      dataIndex: 'forecast_quantity',
      key: 'forecast_quantity',
      render: (text) => Math.round(text),
      sorter: (a, b) => a.forecast_quantity - b.forecast_quantity,
    },
    {
      title: 'Độ tin cậy',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (text) => {
        const confidence = text * 100;
        let color = 'red';
        if (confidence > 80) color = 'green';
        else if (confidence > 60) color = 'orange';
        
        return <Tag color={color}>{confidence.toFixed(1)}%</Tag>;
      },
      sorter: (a, b) => a.confidence - b.confidence,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (text) => text || '-',
    },
  ];

  const renderSummaryStats = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={12} sm={12} md={6} lg={6}>
        <Card>
          <Statistic 
            title="Tổng nhu cầu dự kiến" 
            value={summaryStats.totalDemand} 
            precision={0}
            prefix={<LineChartOutlined />}
          />
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6} lg={6}>
        <Card>
          <Statistic 
            title="Tốc độ tăng trưởng" 
            value={summaryStats.growthRate * 100} 
            precision={1}
            suffix="%" 
            valueStyle={{ 
              color: summaryStats.growthRate >= 0 ? '#3f8600' : '#cf1322' 
            }}
            prefix={summaryStats.growthRate >= 0 ? <RiseOutlined /> : <FallOutlined />}
          />
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6} lg={6}>
        <Card>
          <Statistic 
            title="Độ tin cậy" 
            value={summaryStats.confidenceScore * 100} 
            precision={1}
            suffix="%" 
            valueStyle={{ 
              color: summaryStats.confidenceScore > 0.7 ? '#3f8600' : 
                     summaryStats.confidenceScore > 0.5 ? '#faad14' : '#cf1322' 
            }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6} lg={6}>
        <Card>
          <Statistic 
            title="Rủi ro hết hàng" 
            value={summaryStats.stockoutRisk * 100} 
            precision={1}
            suffix="%" 
            valueStyle={{ 
              color: summaryStats.stockoutRisk < 0.3 ? '#3f8600' : 
                     summaryStats.stockoutRisk < 0.6 ? '#faad14' : '#cf1322' 
            }}
            prefix={<ExclamationCircleOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderFilters = () => (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6} lg={6}>
          <Text strong>Danh mục sản phẩm:</Text>
          <Select
            placeholder="Chọn danh mục"
            style={{ width: '100%', marginTop: 8 }}
            onChange={handleCategoryChange}
            value={selectedCategory}
            showSearch
            optionFilterProp="children"
          >
            {categories.map(category => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Text strong>Sản phẩm:</Text>
          <Select
            placeholder="Chọn sản phẩm"
            style={{ width: '100%', marginTop: 8 }}
            onChange={handleProductChange}
            value={selectedProduct}
            disabled={!selectedCategory}
            showSearch
            optionFilterProp="children"
          >
            {products.map(product => (
              <Select.Option key={product.id} value={product.id}>
                {product.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Text strong>Khoảng thời gian:</Text>
          <RangePicker
            style={{ width: '100%', marginTop: 8 }}
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Text strong>Loại dự báo:</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={forecastType}
            onChange={handleForecastTypeChange}
          >
            <Select.Option value="daily">Hàng ngày</Select.Option>
            <Select.Option value="weekly">Hàng tuần</Select.Option>
            <Select.Option value="monthly">Hàng tháng</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} style={{ textAlign: 'right' }}>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
              disabled={forecasts.length === 0}
            >
              Xuất dữ liệu
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  const renderContent = () => {
    if (error) {
      return (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }

    if (!selectedProduct) {
      return (
        <Empty 
          description="Vui lòng chọn sản phẩm để xem dự báo nhu cầu" 
          style={{ margin: '40px 0' }}
        />
      );
    }

    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải dữ liệu dự báo...</div>
        </div>
      );
    }

    if (forecasts.length === 0) {
      return (
        <Empty 
          description="Không có dữ liệu dự báo cho sản phẩm này" 
          style={{ margin: '40px 0' }}
        />
      );
    }

    return (
      <>
        {renderSummaryStats()}
        
        <Tabs defaultActiveKey="chart" style={{ marginBottom: 16 }}>
          <TabPane 
            tab={<span><LineChartOutlined /> Biểu đồ</span>}
            key="chart"
          >
            <Card>
              <div style={{ height: 400 }}>
                <Line {...lineConfig} />
              </div>
            </Card>
          </TabPane>
          <TabPane 
            tab={<span><CalendarOutlined /> Dữ liệu</span>}
            key="data"
          >
            <Card>
              <Table 
                dataSource={forecasts.map((item, index) => ({ ...item, key: index }))} 
                columns={columns} 
                pagination={{ pageSize: 10 }}
                size="middle"
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </TabPane>
        </Tabs>
        
        <Card title="Phân tích & Đề xuất">
          <div style={{ marginBottom: 16 }}>
            <Text strong>Phân tích xu hướng:</Text>
            <p>
              Dựa trên dữ liệu lịch sử và các yếu tố thị trường, hệ thống AI dự đoán nhu cầu 
              sản phẩm sẽ {summaryStats.growthRate >= 0 ? 'tăng' : 'giảm'} 
              {' '}{Math.abs(summaryStats.growthRate * 100).toFixed(1)}% trong thời gian tới.
            </p>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <Text strong>Đề xuất tồn kho:</Text>
            <p>
              Để đáp ứng nhu cầu dự kiến và tránh tình trạng hết hàng, bạn nên duy trì tồn kho 
              tối thiểu {Math.ceil(summaryStats.totalDemand * 0.2)} đơn vị.
            </p>
          </div>
          
          <div>
            <Text strong>Các yếu tố ảnh hưởng:</Text>
            <ul>
              <li>Xu hướng mùa vụ</li>
              <li>Hoạt động marketing</li>
              <li>Dữ liệu lịch sử bán hàng</li>
              <li>Các sự kiện thị trường</li>
            </ul>
          </div>
        </Card>
      </>
    );
  };

  return (
    <div className="demand-forecasting-page">
      <Title level={2}>
        <LineChartOutlined /> Dự báo nhu cầu
      </Title>
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
        Sử dụng AI để dự đoán nhu cầu sản phẩm và tối ưu hóa kế hoạch tồn kho
      </Text>
      
      <Divider />
      
      {renderFilters()}
      {renderContent()}
    </div>
  );
};

export default DemandForecasting; 