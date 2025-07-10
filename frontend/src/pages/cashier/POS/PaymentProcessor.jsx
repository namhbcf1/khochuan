import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Steps, Form, Input, Select, Radio, Divider, Alert, Result, Spin, Tag, Modal } from 'antd';
import { ShoppingCartOutlined, CreditCardOutlined, CheckCircleOutlined, UserOutlined, GiftOutlined, BulbOutlined } from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import AIRecommendations from '../../../components/features/AIRecommendations';
import './POSTerminal.css';

const { Step } = Steps;
const { Option } = Select;

const PaymentProcessor = ({ cart, customer, onComplete, onCancel }) => {
  const { token } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [change, setChange] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendationsLoaded, setRecommendationsLoaded] = useState(false);
  
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  useEffect(() => {
    if (customer && currentStep === 0) {
      // Pre-load recommendations when a customer is identified
      setRecommendationsLoaded(true);
    }
  }, [customer, currentStep]);
  
  useEffect(() => {
    setPaymentAmount(totalAmount);
  }, [totalAmount]);
  
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };
  
  const handlePaymentAmountChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    setPaymentAmount(amount);
    setChange(Math.max(0, amount - totalAmount));
  };
  
  const handleNext = () => {
    if (currentStep === 0 && customer) {
      // Show recommendations before proceeding to payment
      setShowRecommendations(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleContinueToPayment = () => {
    setShowRecommendations(false);
    setCurrentStep(currentStep + 1);
  };
  
  const handleProductClick = (product) => {
    // Add product to cart
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      // Product already in cart, increment quantity
      onComplete({
        ...orderDetails,
        additionalItems: [{ ...product, quantity: 1 }]
      });
    } else {
      // New product
      onComplete({
        ...orderDetails,
        additionalItems: [{ ...product, quantity: 1 }]
      });
    }
    setShowRecommendations(false);
  };
  
  const processPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const orderData = {
        customer_id: customer ? customer.id : null,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        payment: {
          method: paymentMethod,
          amount: paymentAmount,
          change: change
        }
      };
      
      const response = await api.post('/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setOrderDetails(response.data.data);
        setOrderComplete(true);
        setCurrentStep(currentStep + 1);
      } else {
        setError('Failed to process payment');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(`Error: ${err.message || 'Failed to process payment'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const renderPaymentForm = () => {
    return (
      <Form layout="vertical">
        <Form.Item label="Payment Method">
          <Radio.Group value={paymentMethod} onChange={handlePaymentMethodChange}>
            <Radio.Button value="cash">Cash</Radio.Button>
            <Radio.Button value="card">Card</Radio.Button>
            <Radio.Button value="qr">QR Code</Radio.Button>
            <Radio.Button value="wallet">E-Wallet</Radio.Button>
          </Radio.Group>
        </Form.Item>
        
        {paymentMethod === 'cash' && (
          <>
            <Form.Item label="Amount Received">
              <Input 
                type="number" 
                value={paymentAmount}
                onChange={handlePaymentAmountChange}
                prefix="$"
                min={totalAmount}
                step="0.01"
              />
            </Form.Item>
            
            <Form.Item label="Change">
              <Input 
                value={change.toFixed(2)}
                prefix="$"
                disabled
              />
            </Form.Item>
          </>
        )}
        
        {paymentMethod === 'card' && (
          <>
            <Form.Item label="Card Type">
              <Select defaultValue="visa">
                <Option value="visa">Visa</Option>
                <Option value="mastercard">Mastercard</Option>
                <Option value="amex">American Express</Option>
                <Option value="discover">Discover</Option>
              </Select>
            </Form.Item>
            
            <Alert
              message="Please swipe card or insert chip"
              description="The card terminal is ready to accept payment."
              type="info"
              showIcon
            />
          </>
        )}
        
        {paymentMethod === 'qr' && (
          <div className="qr-payment">
            <div className="qr-code-container">
              <img 
                src="https://via.placeholder.com/200x200?text=QR+Code" 
                alt="Payment QR Code"
                className="qr-code-image"
              />
            </div>
            <Alert
              message="Scan QR Code to pay"
              description={`Please scan this QR code using your payment app to pay $${totalAmount.toFixed(2)}`}
              type="info"
              showIcon
            />
          </div>
        )}
        
        {paymentMethod === 'wallet' && (
          <>
            <Form.Item label="E-Wallet Provider">
              <Select defaultValue="applepay">
                <Option value="applepay">Apple Pay</Option>
                <Option value="googlepay">Google Pay</Option>
                <Option value="samsungpay">Samsung Pay</Option>
                <Option value="alipay">Alipay</Option>
              </Select>
            </Form.Item>
            
            <Alert
              message="Tap to pay"
              description="Please tap your device on the terminal to complete payment."
              type="info"
              showIcon
            />
          </>
        )}
      </Form>
    );
  };
  
  const renderCustomerDetails = () => {
    if (!customer) {
      return (
        <Alert
          message="Guest Customer"
          description="This sale will be processed as a guest transaction. No customer loyalty benefits will be applied."
          type="warning"
          showIcon
        />
      );
    }
    
    return (
      <Card className="customer-card">
        <div className="customer-info">
          <UserOutlined className="customer-icon" />
          <div className="customer-details">
            <h3>{customer.name}</h3>
            <p>{customer.email}</p>
            <p>Phone: {customer.phone}</p>
            {customer.loyalty_points && (
              <Tag color="gold">Loyalty Points: {customer.loyalty_points}</Tag>
            )}
            {customer.membership_level && (
              <Tag color="blue">{customer.membership_level} Member</Tag>
            )}
          </div>
        </div>
      </Card>
    );
  };
  
  const renderOrderSummary = () => {
    return (
      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="order-items">
          {cart.map(item => (
            <div key={item.id} className="order-item">
              <div className="item-name">{item.name}</div>
              <div className="item-quantity">x{item.quantity}</div>
              <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <Divider />
        <div className="order-total">
          <div className="total-label">Total</div>
          <div className="total-amount">${totalAmount.toFixed(2)}</div>
        </div>
      </div>
    );
  };
  
  const renderRecommendationsModal = () => {
    return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
            Personalized Recommendations
          </div>
        }
        open={showRecommendations}
        onCancel={handleContinueToPayment}
        footer={[
          <Button key="back" onClick={handleContinueToPayment}>
            Continue to Payment
          </Button>,
        ]}
        width={800}
      >
        <p>Based on this customer's purchase history, we recommend the following products:</p>
        <AIRecommendations 
          customerId={customer ? customer.id : null}
          limit={4}
          showTitle={false}
          onProductClick={handleProductClick}
          className="checkout-recommendations"
        />
      </Modal>
    );
  };
  
  const steps = [
    {
      title: 'Review',
      icon: <ShoppingCartOutlined />,
      content: (
        <Row gutter={16}>
          <Col xs={24} md={12}>
            {renderCustomerDetails()}
            {renderOrderSummary()}
          </Col>
          <Col xs={24} md={12}>
            {customer && recommendationsLoaded && (
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <GiftOutlined style={{ marginRight: 8 }} />
                    Recommended for this customer
                  </div>
                }
              >
                <Button 
                  type="primary" 
                  icon={<BulbOutlined />}
                  onClick={() => setShowRecommendations(true)}
                  style={{ width: '100%' }}
                >
                  View Personalized Recommendations
                </Button>
              </Card>
            )}
          </Col>
        </Row>
      )
    },
    {
      title: 'Payment',
      icon: <CreditCardOutlined />,
      content: (
        <Row gutter={16}>
          <Col xs={24} md={12}>
            {renderPaymentForm()}
          </Col>
          <Col xs={24} md={12}>
            {renderOrderSummary()}
          </Col>
        </Row>
      )
    },
    {
      title: 'Complete',
      icon: <CheckCircleOutlined />,
      content: (
        <Result
          status="success"
          title="Payment Successful!"
          subTitle={`Order number: ${orderDetails ? orderDetails.order_number : ''}`}
          extra={[
            <Button 
              type="primary" 
              key="new-sale"
              onClick={() => onComplete(orderDetails)}
            >
              New Sale
            </Button>,
            <Button 
              key="print-receipt"
              onClick={() => console.log('Print receipt')}
            >
              Print Receipt
            </Button>,
          ]}
        />
      )
    }
  ];
  
  return (
    <div className="payment-processor">
      <Steps current={currentStep} className="checkout-steps">
        {steps.map(step => (
          <Step key={step.title} title={step.title} icon={step.icon} />
        ))}
      </Steps>
      
      <div className="steps-content">
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <p>Processing payment...</p>
          </div>
        ) : (
          steps[currentStep].content
        )}
      </div>
      
      <div className="steps-action">
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <Button style={{ margin: '0 8px' }} onClick={handlePrevious}>
            Previous
          </Button>
        )}
        
        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={currentStep === 1 ? processPayment : handleNext}>
            {currentStep === 1 ? 'Process Payment' : 'Next'}
          </Button>
        )}
        
        <Button style={{ margin: '0 8px' }} onClick={onCancel}>
          Cancel
        </Button>
      </div>
      
      {renderRecommendationsModal()}
    </div>
  );
};

export default PaymentProcessor; 