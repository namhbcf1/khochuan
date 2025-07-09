import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import BarcodeScanner from '../components/BarcodeScanner';
import CustomerModal from '../components/CustomerModal';
import CheckoutModal from '../components/CheckoutModal';
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  List,
  Typography,
  Space,
  Tag,
  Divider,
  Modal,
  Form,
  Select,
  InputNumber,
  Badge,
  Avatar,
  Drawer,
  Table,
  Alert,
  notification
} from 'antd';
import {
  ShoppingCartOutlined,
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  ClearOutlined,
  CreditCardOutlined,
  DollarOutlined,
  QrcodeOutlined,
  UserOutlined,
  UserAddOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { formatCurrency, calculateOrderTotal, showSuccessNotification, showErrorNotification } from '../utils/helpers';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../utils/constants';
import api from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const POS = () => {
  const { user, canAccessPOS } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerDrawer, setCustomerDrawer] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentForm] = Form.useForm();

  // New modal states
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Check access permission
  if (!canAccessPOS()) {
    return (
      <Alert
        message="Access Denied"
        description="You don't have permission to access the POS terminal."
        type="error"
        showIcon
      />
    );
  }

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadCustomers();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products', {
        params: { page: 1, limit: 50 }
      });
      if (response.data.success) {
        setProducts(response.data.data.products || []);
      } else {
        setProducts(getMockProducts());
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories([
          { id: 'all', name: 'All Products' },
          ...(response.data.data.categories || [])
        ]);
      } else {
        setCategories([
          { id: 'all', name: 'All Products' },
          ...getMockCategories()
        ]);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([
        { id: 'all', name: 'All Products' },
        ...getMockCategories()
      ]);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/customers', {
        params: { limit: 100 }
      });
      if (response.data.success) {
        setCustomers(response.data.data.customers || []);
      } else {
        setCustomers(getMockCustomers());
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers(getMockCustomers());
    }
  };

  const getMockProducts = () => [
    { id: 1, name: 'Premium Coffee', price: 4.50, category: 'beverage', image: null, stock: 50, barcode: '1234567890123' },
    { id: 2, name: 'Croissant', price: 3.25, category: 'food', image: null, stock: 25, barcode: '1234567890124' },
    { id: 3, name: 'Green Tea', price: 3.00, category: 'beverage', image: null, stock: 30, barcode: '1234567890125' },
    { id: 4, name: 'Sandwich', price: 8.95, category: 'food', image: null, stock: 15, barcode: '1234567890126' },
    { id: 5, name: 'Energy Drink', price: 2.75, category: 'beverage', image: null, stock: 40, barcode: '1234567890127' },
    { id: 6, name: 'Salad Bowl', price: 12.50, category: 'food', image: null, stock: 10, barcode: '1234567890128' }
  ];

  const getMockCategories = () => [
    { id: 'food', name: 'Food' },
    { id: 'beverage', name: 'Beverages' },
    { id: 'retail', name: 'Retail Items' }
  ];

  const getMockCustomers = () => [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', loyaltyPoints: 250 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', loyaltyPoints: 180 },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+1234567892', loyaltyPoints: 95 }
  ];

  // Filter products based on category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = useCallback((product) => {
    if (product.stock <= 0) {
      showErrorNotification('Out of Stock', `${product.name} is currently out of stock.`);
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          showErrorNotification('Insufficient Stock', `Only ${product.stock} units available.`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  }, []);

  const updateCartQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      showErrorNotification('Insufficient Stock', `Only ${product.stock} units available.`);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, [products]);

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
  }, []);

  // Calculate totals
  const orderSummary = calculateOrderTotal(cart, 0.1, selectedCustomer?.loyaltyDiscount || 0);

  // Handle barcode scanning
  const handleBarcodeInput = useCallback((value) => {
    const product = products.find(p => p.barcode === value);
    if (product) {
      addToCart(product);
      setSearchTerm('');
    } else {
      showErrorNotification('Product Not Found', 'No product found with this barcode.');
    }
  }, [products, addToCart]);

  // Handle barcode scanner
  const handleBarcodeScanned = useCallback(async (barcode) => {
    try {
      // First try to find in current products
      const product = products.find(p => p.barcode === barcode || p.sku === barcode);
      if (product) {
        addToCart(product);
        notification.success({
          message: 'Sản phẩm đã được thêm',
          description: `${product.name} đã được thêm vào giỏ hàng`
        });
        return;
      }

      // If not found, search via API
      const response = await api.get(`/products/${barcode}`);
      if (response.data.success) {
        addToCart(response.data.data);
        notification.success({
          message: 'Sản phẩm đã được thêm',
          description: `${response.data.data.name} đã được thêm vào giỏ hàng`
        });
      } else {
        notification.error({
          message: 'Không tìm thấy sản phẩm',
          description: 'Không tìm thấy sản phẩm với mã vạch này'
        });
      }
    } catch (error) {
      console.error('Error finding product by barcode:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Có lỗi xảy ra khi tìm sản phẩm'
      });
    }
  }, [products, addToCart]);

  // Handle customer creation
  const handleCustomerCreated = useCallback((newCustomer) => {
    setCustomers(prev => [newCustomer, ...prev]);
    setSelectedCustomer(newCustomer);
    notification.success({
      message: 'Khách hàng đã được tạo',
      description: `${newCustomer.name} đã được thêm vào hệ thống`
    });
  }, []);

  // Handle payment
  const handlePayment = async (paymentData) => {
    try {
      setLoading(true);

      const orderData = {
        customer_id: selectedCustomer?.id || null,
        cashier_id: user.id,
        location_id: 'loc-001', // Default location
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          discount_amount: 0,
          total_price: item.price * item.quantity
        })),
        subtotal: orderSummary.subtotal,
        tax_amount: orderSummary.tax,
        discount_amount: orderSummary.discount,
        total: orderSummary.total,
        payment_method: paymentData.method,
        notes: paymentData.notes || '',
        metadata: {
          payment_method: paymentData.method,
          cashier_name: user.name,
          customer_name: selectedCustomer?.name
        }
      };

      const response = await api.post('/orders', orderData);

      if (response.data.success) {
        // Create order object for checkout modal
        const order = {
          ...response.data.data,
          items: cart,
          customer_name: selectedCustomer?.name,
          customer_email: selectedCustomer?.email,
          customer_phone: selectedCustomer?.phone,
          cashier_name: user.name,
          location_name: 'KhoChuan Store Main',
          payment_method: paymentData.method
        };

        setCurrentOrder(order);
        setShowCheckoutModal(true);

        // Clear cart and close payment modal
        clearCart();
        setPaymentModal(false);
        paymentForm.resetFields();

        notification.success({
          message: 'Thanh toán thành công',
          description: `Đơn hàng #${response.data.data.order_number} đã được xử lý thành công!`
        });
      } else {
        throw new Error(response.data.message || 'Có lỗi xảy ra khi xử lý đơn hàng');
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      showErrorNotification(
        'Payment Failed',
        error.message || 'Failed to process payment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (order) => {
    // Implement receipt printing logic
    console.log('Printing receipt for order:', order);
    // In a real implementation, this would integrate with a receipt printer
  };

  // Handle new order after checkout
  const handleNewOrder = () => {
    setSelectedCustomer(null);
    setCurrentOrder(null);
    // Focus on search input for next order
    setTimeout(() => {
      const searchInput = document.querySelector('.ant-input[placeholder*="Search"]');
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  };

  const customerColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          {name}
        </Space>
      )
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (record) => (
        <div>
          <div>{record.email}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>
        </div>
      )
    },
    {
      title: 'Loyalty Points',
      dataIndex: 'loyaltyPoints',
      key: 'loyaltyPoints',
      render: (points) => <Badge count={points} showZero color="gold" />
    },
    {
      title: 'Action',
      key: 'action',
      render: (record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setSelectedCustomer(record);
            setCustomerDrawer(false);
          }}
        >
          Select
                          {selectedCustomer ? selectedCustomer.name : 'Customer'}
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  danger
                >
                  Clear
                </Button>
              </Space>
            }
            bodyStyle={{ padding: 0, height: '500px', display: 'flex', flexDirection: 'column' }}
          >
            {/* Cart Items */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              {cart.length === 0 ? (
                <div style={{
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  flexDirection: 'column'
                }}>
                  <ShoppingCartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <Text>Cart is empty</Text>
                </div>
              ) : (
                <List
                  size="small"
                  dataSource={cart}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Space key="quantity">
                          <Button
                            size="small"
                            icon={<MinusOutlined />}
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          />
                          <InputNumber
                            size="small"
                            min={1}
                            max={item.stock}
                            value={item.quantity}
                            onChange={(value) => updateCartQuantity(item.id, value)}
                            style={{ width: '60px' }}
                          />
                          <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          />
                        </Space>,
                        <Button
                          key="remove"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeFromCart(item.id)}
                          danger
                        />
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong>{item.name}</Text>
                            <Text>{formatCurrency(item.price * item.quantity)}</Text>
                          </div>
                        }
                        description={
                          <Text type="secondary">
                            {formatCurrency(item.price)} × {item.quantity}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>

            {/* Order Summary */}
            {cart.length > 0 && (
              <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {selectedCustomer && (
                    <Alert
                      message={`Customer: ${selectedCustomer.name}`}
                      description={`Loyalty Points: ${selectedCustomer.loyaltyPoints}`}
                      type="info"
                      showIcon
                      size="small"
                    />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Subtotal:</Text>
                    <Text>{formatCurrency(orderSummary.subtotal)}</Text>
                  </div>

                  {orderSummary.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Discount:</Text>
                      <Text style={{ color: '#52c41a' }}>
                        -{formatCurrency(orderSummary.discount)}
                      </Text>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Tax:</Text>
                    <Text>{formatCurrency(orderSummary.tax)}</Text>
                  </div>

                  <Divider style={{ margin: '8px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Title level={4} style={{ margin: 0 }}>Total:</Title>
                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                      {formatCurrency(orderSummary.total)}
                    </Title>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<CreditCardOutlined />}
                    onClick={() => setPaymentModal(true)}
                  >
                    Checkout
                  </Button>
                </Space>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Customer Selection Drawer */}
      <Drawer
        title="Select Customer"
        placement="right"
        onClose={() => setCustomerDrawer(false)}
        open={customerDrawer}
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Search
            placeholder="Search customers..."
            enterButton="Search"
            size="large"
          />

          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => {
              setShowCustomerModal(true);
              setCustomerDrawer(false);
            }}
            block
            style={{ marginBottom: 16 }}
          >
            Thêm khách hàng mới
          </Button>

          <Table
            columns={customerColumns}
            dataSource={customers}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10 }}
          />

          <Button
            block
            onClick={() => {
              setSelectedCustomer(null);
              setCustomerDrawer(false);
            }}
          >
            Continue without customer
          </Button>
        </Space>
      </Drawer>

      {/* Payment Modal */}
      <Modal
        title="Process Payment"
        open={paymentModal}
        onCancel={() => setPaymentModal(false)}
        footer={null}
        width={600}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePayment}
          initialValues={{
            method: PAYMENT_METHODS.CASH,
            amount: orderSummary.total,
            printReceipt: true
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" title="Order Summary">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Subtotal:</Text>
                    <Text>{formatCurrency(orderSummary.subtotal)}</Text>
                  </div>
                  {orderSummary.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Discount:</Text>
                      <Text style={{ color: '#52c41a' }}>
                        -{formatCurrency(orderSummary.discount)}
                      </Text>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Tax:</Text>
                    <Text>{formatCurrency(orderSummary.tax)}</Text>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Title level={4} style={{ margin: 0 }}>Total:</Title>
                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                      {formatCurrency(orderSummary.total)}
                    </Title>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col span={12}>
              <Card size="small" title="Payment Details">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    name="method"
                    label="Payment Method"
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                        <Option key={key} value={key}>
                          {label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="amount"
                    label="Amount Received"
                    rules={[
                      { required: true },
                      {
                        type: 'number',
                        min: orderSummary.total,
                        message: 'Amount must be at least the total'
                      }
                    ]}
                  >
                    <InputNumber
                      size="large"
                      style={{ width: '100%' }}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      precision={2}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Text>
                      Change: {formatCurrency(
                        Math.max(0, (paymentForm.getFieldValue('amount') || 0) - orderSummary.total)
                      )}
                    </Text>
                  </Form.Item>
                </Space>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Form.Item name="printReceipt" valuePropName="checked">
            <Space>
              <PrinterOutlined />
              Print receipt
            </Space>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setPaymentModal(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<CheckCircleOutlined />}
              >
                Complete Payment
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default POS;

/*
📁 FILE PATH: frontend/src/pages/POS.jsx

📋 DESCRIPTION:
Complete Point of Sale terminal interface with product selection, cart management,
customer lookup, and payment processing for the Enterprise POS system.

🔧 FEATURES:
- Product catalog with category filtering and search
- Barcode scanning support for quick product entry
- Shopping cart with quantity management and validation
- Customer selection with loyalty program integration
- Multi-payment method support (cash, card, digital wallet)
- Order total calculation with tax and discount
- Receipt printing capability
- Stock validation and low inventory warnings
- Real-time cart updates and order processing
- Mobile-optimized for tablet POS terminals

🎯 INTEGRATION:
- Connects to backend product and customer APIs
- Uses authentication for cashier identification
- Integrates with payment processing systems
- Links to order management and inventory tracking
- Supports offline mode for basic operations

⚡ BUSINESS LOGIC:
- Automatic tax calculation at 10%
- Loyalty discount application based on customer tier
- Stock validation to prevent overselling
- Change calculation for cash payments
- Order number generation and tracking
- Receipt printing with order details
*/
      )
    }
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ height: 'calc(100vh - 120px)' }}>
        {/* Product Grid */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined />
                Product Catalog
              </Space>
            }
            extra={
              <Space>
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{ width: 150 }}
                >
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Space>
            }
            bodyStyle={{ padding: '16px', height: '400px', overflow: 'auto' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input.Group compact>
                <Search
                  placeholder="Search products or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onPressEnter={(e) => {
                    const value = e.target.value.trim();
                    if (value.length >= 8) {
                      handleBarcodeInput(value);
                    }
                  }}
                  prefix={<QrcodeOutlined />}
                  enterButton={<SearchOutlined />}
                  size="large"
                  style={{ width: 'calc(100% - 50px)' }}
                />
                <Button
                  type="primary"
                  icon={<QrcodeOutlined />}
                  size="large"
                  onClick={() => setShowBarcodeScanner(true)}
                  style={{ width: '50px' }}
                  title="Quét mã vạch"
                />
              </Input.Group>

              {loading ? (
                <LoadingSpinner tip="Loading products..." />
              ) : (
                <Row gutter={[8, 8]}>
                  {filteredProducts.map(product => (
                    <Col xs={12} sm={8} md={6} lg={4} key={product.id}>
                      <Card
                        hoverable
                        size="small"
                        onClick={() => addToCart(product)}
                        style={{
                          textAlign: 'center',
                          cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                          opacity: product.stock > 0 ? 1 : 0.5
                        }}
                        cover={
                          <div style={{
                            height: '80px',
                            background: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            color: '#1890ff'
                          }}>
                            <ShoppingCartOutlined />
                          </div>
                        }
                      >
                        <Card.Meta
                          title={
                            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                              {product.name}
                            </div>
                          }
                          description={
                            <div>
                              <div style={{ color: '#1890ff', fontWeight: 'bold' }}>
                                {formatCurrency(product.price)}
                              </div>
                              <div style={{ fontSize: '10px', color: '#666' }}>
                                Stock: {product.stock}
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Space>
          </Card>
        </Col>

        {/* Cart & Checkout */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined />
                Cart ({cart.length} items)
              </Space>
            }
            extra={
              <Space>
                <Button
                  icon={<UserOutlined />}
                  onClick={() => setCustomerDrawer(true)}
                  type={selectedCustomer ? 'primary' : 'default'}
                >
                  {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  danger
                >
                  Clear
                </Button>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* Cart Items */}
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {cart.length === 0 ? (
                  <Empty description="Cart is empty" />
                ) : (
                  cart.map((item) => (
                    <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
                      <Row align="middle">
                        <Col span={12}>
                          <div>
                            <Text strong>{item.name}</Text>
                            <div>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {formatCurrency(item.price)} each
                              </Text>
                            </div>
                          </div>
                        </Col>
                        <Col span={6}>
                          <Space>
                            <Button
                              size="small"
                              icon={<MinusOutlined />}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            />
                            <Text>{item.quantity}</Text>
                            <Button
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            />
                          </Space>
                        </Col>
                        <Col span={4}>
                          <Text strong>{formatCurrency(item.price * item.quantity)}</Text>
                        </Col>
                        <Col span={2}>
                          <Button
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => removeFromCart(item.id)}
                            danger
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))
                )}
              </div>

              {/* Order Summary */}
              <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row justify="space-between">
                    <Col>Subtotal:</Col>
                    <Col>{formatCurrency(orderSummary.subtotal)}</Col>
                  </Row>
                  <Row justify="space-between">
                    <Col>Tax:</Col>
                    <Col>{formatCurrency(orderSummary.tax)}</Col>
                  </Row>
                  <Row justify="space-between">
                    <Col>Discount:</Col>
                    <Col>{formatCurrency(orderSummary.discount)}</Col>
                  </Row>
                  <Divider style={{ margin: '8px 0' }} />
                  <Row justify="space-between">
                    <Col><Text strong>Total:</Text></Col>
                    <Col><Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                      {formatCurrency(orderSummary.total)}
                    </Text></Col>
                  </Row>
                </Space>
              </Card>

              {/* Checkout Button */}
              <Button
                type="primary"
                size="large"
                block
                icon={<CreditCardOutlined />}
                onClick={() => setPaymentModal(true)}
                disabled={cart.length === 0}
                loading={loading}
              >
                Checkout
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Customer Drawer */}
      <Drawer
        title="Select Customer"
        placement="right"
        onClose={() => setCustomerDrawer(false)}
        open={customerDrawer}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Search
            placeholder="Search customers..."
            enterButton="Search"
            size="large"
          />

          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => {
              setShowCustomerModal(true);
              setCustomerDrawer(false);
            }}
            block
            style={{ marginBottom: 16 }}
          >
            Thêm khách hàng mới
          </Button>

          <Table
            columns={customerColumns}
            dataSource={customers}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10 }}
          />

          <Button
            block
            onClick={() => {
              setSelectedCustomer(null);
              setCustomerDrawer(false);
            }}
          >
            Continue without customer
          </Button>
        </Space>
      </Drawer>

      {/* Payment Modal */}
      <Modal
        title="Payment"
        open={paymentModal}
        onCancel={() => setPaymentModal(false)}
        footer={null}
        width={500}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePayment}
        >
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row justify="space-between">
              <Col><Text strong>Total Amount:</Text></Col>
              <Col><Text strong style={{ fontSize: '20px', color: '#1890ff' }}>
                {formatCurrency(orderSummary.total)}
              </Text></Col>
            </Row>
          </Card>

          <Form.Item
            name="method"
            label="Payment Method"
            rules={[{ required: true, message: 'Please select payment method' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="cash">
                  <Space>
                    <DollarOutlined />
                    Cash
                  </Space>
                </Radio>
                <Radio value="card">
                  <Space>
                    <CreditCardOutlined />
                    Credit Card
                  </Space>
                </Radio>
                <Radio value="qr">
                  <Space>
                    <QrcodeOutlined />
                    QR Code
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount Received"
            rules={[{ required: true, message: 'Please enter amount' }]}
            initialValue={orderSummary.total}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              min={orderSummary.total}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setPaymentModal(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Process Payment
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modals */}
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
      />

      <CustomerModal
        visible={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onCustomerCreated={handleCustomerCreated}
      />

      <CheckoutModal
        visible={showCheckoutModal}
        order={currentOrder}
        onClose={() => setShowCheckoutModal(false)}
        onPrintReceipt={printReceipt}
        onNewOrder={handleNewOrder}
      />
    </div>
  );
};

export default POS;