// frontend/src/pages/cashier/POS/POSTerminal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Input, 
  Button, 
  Typography, 
  Space, 
  List, 
  Avatar, 
  Tag, 
  Divider,
  InputNumber,
  Modal,
  Select,
  message,
  Badge,
  Statistic,
  Tabs
} from 'antd';
import {
  ShoppingCartOutlined,
  ScanOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  CreditCardOutlined,
  DollarOutlined,
  UserOutlined,
  CalculatorOutlined,
  PrinterOutlined,
  SearchOutlined,
  BarcodeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const POSTerminal = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [customer, setCustomer] = useState(null);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const barcodeRef = useRef(null);

  // Demo products
  const demoProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      barcode: '123456789012',
      price: 29990000,
      stock: 15,
      category: 'Điện thoại',
      image: 'https://via.placeholder.com/60x60?text=IP15'
    },
    {
      id: 2,
      name: 'Samsung Galaxy S24',
      barcode: '123456789013',
      price: 25990000,
      stock: 8,
      category: 'Điện thoại',
      image: 'https://via.placeholder.com/60x60?text=S24'
    },
    {
      id: 3,
      name: 'MacBook Air M3',
      barcode: '123456789014',
      price: 34990000,
      stock: 5,
      category: 'Laptop',
      image: 'https://via.placeholder.com/60x60?text=MBA'
    },
    {
      id: 4,
      name: 'AirPods Pro',
      barcode: '123456789015',
      price: 6990000,
      stock: 25,
      category: 'Phụ kiện',
      image: 'https://via.placeholder.com/60x60?text=APP'
    },
    {
      id: 5,
      name: 'iPad Pro 11"',
      barcode: '123456789016',
      price: 24990000,
      stock: 12,
      category: 'Tablet',
      image: 'https://via.placeholder.com/60x60?text=IPD'
    }
  ];

  useEffect(() => {
    setProducts(demoProducts);
    // Focus on barcode input
    if (barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, []);

  const handleBarcodeScanned = (barcode) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
      message.success(`Đã thêm ${product.name} vào giỏ hàng`);
    } else {
      message.error('Không tìm thấy sản phẩm với mã vạch này');
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePayment = () => {
    setPaymentVisible(true);
  };

  const processPayment = async (paymentData) => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success('Thanh toán thành công!');
      setPaymentVisible(false);
      clearCart();
      
      // Print receipt
      printReceipt();
    } catch (error) {
      message.error('Thanh toán thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    message.info('Đang in hóa đơn...');
    // Implement receipt printing logic
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Card style={{ marginBottom: '16px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              🖥️ Trường Phát Computer
            </Title>
          </Col>
          <Col>
            <Space>
              <Badge count={getTotalItems()} showZero>
                <Button icon={<ShoppingCartOutlined />} size="large">
                  Giỏ hàng
                </Button>
              </Badge>
              <Button icon={<UserOutlined />} onClick={() => setCustomer(null)}>
                {customer ? customer.name : 'Khách lẻ'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ flex: 1 }}>
        {/* Left Side - Product Search & Barcode */}
        <Col xs={24} lg={14}>
          <Card style={{ height: '100%' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* Barcode Scanner */}
              <Card size="small" style={{ backgroundColor: '#f0f9ff' }}>
                <Row gutter={[8, 8]} align="middle">
                  <Col flex="auto">
                    <Input
                      ref={barcodeRef}
                      size="large"
                      placeholder="Quét mã vạch hoặc nhập mã sản phẩm..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onPressEnter={() => handleBarcodeScanned(barcodeInput)}
                      prefix={<BarcodeOutlined />}
                    />
                  </Col>
                  <Col>
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<ScanOutlined />}
                      onClick={() => handleBarcodeScanned(barcodeInput)}
                    >
                      Quét
                    </Button>
                  </Col>
                </Row>
              </Card>

              {/* Product Search */}
              <Input
                size="large"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
              />

              {/* Product Grid */}
              <div style={{ height: '400px', overflowY: 'auto' }}>
                <Row gutter={[8, 8]}>
                  {filteredProducts.map(product => (
                    <Col xs={12} sm={8} md={6} key={product.id}>
                      <Card
                        hoverable
                        size="small"
                        onClick={() => addToCart(product)}
                        style={{ textAlign: 'center' }}
                        cover={
                          <img 
                            alt={product.name} 
                            src={product.image} 
                            style={{ height: '60px', objectFit: 'cover' }}
                          />
                        }
                      >
                        <Card.Meta
                          title={
                            <Text ellipsis style={{ fontSize: '12px' }}>
                              {product.name}
                            </Text>
                          }
                          description={
                            <div>
                              <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                                {new Intl.NumberFormat('vi-VN', { 
                                  style: 'currency', 
                                  currency: 'VND',
                                  notation: 'compact'
                                }).format(product.price)}
                              </Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: '10px' }}>
                                Còn: {product.stock}
                              </Text>
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Right Side - Cart & Checkout */}
        <Col xs={24} lg={10}>
          <Card 
            title="🛒 Giỏ hàng"
            extra={
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Xóa tất cả
              </Button>
            }
            style={{ height: '100%' }}
          >
            <div style={{ height: '300px', overflowY: 'auto', marginBottom: '16px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <ShoppingCartOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  <p style={{ color: '#999', marginTop: '16px' }}>
                    Giỏ hàng trống
                  </p>
                </div>
              ) : (
                <List
                  dataSource={cart}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={item.image} />}
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text ellipsis style={{ maxWidth: '150px' }}>
                              {item.name}
                            </Text>
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => removeFromCart(item.id)}
                            />
                          </div>
                        }
                        description={
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong style={{ color: '#52c41a' }}>
                                {new Intl.NumberFormat('vi-VN', { 
                                  style: 'currency', 
                                  currency: 'VND',
                                  notation: 'compact'
                                }).format(item.price)}
                              </Text>
                              <Space>
                                <Button
                                  size="small"
                                  icon={<MinusOutlined />}
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                />
                                <InputNumber
                                  size="small"
                                  min={1}
                                  value={item.quantity}
                                  onChange={(value) => updateQuantity(item.id, value)}
                                  style={{ width: '60px' }}
                                />
                                <Button
                                  size="small"
                                  icon={<PlusOutlined />}
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                />
                              </Space>
                            </div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Thành tiền: {new Intl.NumberFormat('vi-VN', { 
                                style: 'currency', 
                                currency: 'VND'
                              }).format(item.price * item.quantity)}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>

            {/* Cart Summary */}
            <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Statistic
                    title="Tổng cộng"
                    value={getTotalAmount()}
                    suffix="VND"
                    valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                  />
                </Col>
                <Col>
                  <Text type="secondary">
                    {getTotalItems()} sản phẩm
                  </Text>
                </Col>
              </Row>
            </Card>

            {/* Checkout Buttons */}
            <div style={{ marginTop: '16px' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CreditCardOutlined />}
                  onClick={handlePayment}
                  disabled={cart.length === 0}
                >
                  Thanh toán
                </Button>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Button
                      block
                      icon={<CalculatorOutlined />}
                      disabled={cart.length === 0}
                    >
                      Tính tiền
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      block
                      icon={<PrinterOutlined />}
                      disabled={cart.length === 0}
                    >
                      In hóa đơn
                    </Button>
                  </Col>
                </Row>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Payment Modal */}
      <Modal
        title="💳 Thanh toán"
        open={paymentVisible}
        onCancel={() => setPaymentVisible(false)}
        footer={null}
        width={600}
      >
        <PaymentForm
          total={getTotalAmount()}
          onPayment={processPayment}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

// Payment Form Component
const PaymentForm = ({ total, onPayment, loading }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receivedAmount, setReceivedAmount] = useState(total);

  const handleSubmit = () => {
    onPayment({
      method: paymentMethod,
      amount: total,
      received: receivedAmount
    });
  };

  const getChangeAmount = () => {
    return Math.max(0, receivedAmount - total);
  };

  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Statistic
          title="Tổng tiền thanh toán"
          value={total}
          suffix="VND"
          valueStyle={{ color: '#52c41a', fontSize: '24px' }}
        />
      </Card>

      <Tabs defaultActiveKey="cash" onChange={setPaymentMethod}>
        <Tabs.TabPane tab="Tiền mặt" key="cash">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text>Số tiền nhận:</Text>
              <InputNumber
                size="large"
                value={receivedAmount}
                onChange={setReceivedAmount}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                style={{ width: '100%', marginTop: '8px' }}
              />
            </div>
            
            <Card size="small" style={{ backgroundColor: '#f0f9ff' }}>
              <Statistic
                title="Tiền thừa"
                value={getChangeAmount()}
                suffix="VND"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Space>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Thẻ" key="card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CreditCardOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <p style={{ marginTop: '16px' }}>
              Vui lòng quẹt thẻ hoặc chạm thẻ
            </p>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Chuyển khoản" key="transfer">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <DollarOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
            <p style={{ marginTop: '16px' }}>
              Quét mã QR để chuyển khoản
            </p>
          </div>
        </Tabs.TabPane>
      </Tabs>

      <div style={{ marginTop: '24px', textAlign: 'right' }}>
        <Space>
          <Button size="large">
            Hủy
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubmit}
            disabled={paymentMethod === 'cash' && receivedAmount < total}
          >
            Xác nhận thanh toán
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default POSTerminal;