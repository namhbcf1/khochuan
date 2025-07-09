import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Badge,
  Typography,
  Tabs,
  Switch,
  Form,
  Input,
  Select,
  Upload,
  Divider,
  Row,
  Col,
  Modal,
  Steps,
  Alert,
  Tooltip,
  Skeleton,
  Popconfirm,
  Statistic,
  Empty
} from 'antd';
import {
  ShopOutlined,
  ApiOutlined,
  LinkOutlined,
  SyncOutlined,
  PlusOutlined,
  UploadOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

// Sample data for connected channels
const connectedChannels = [
  {
    id: 1,
    name: 'Shopee',
    logo: '/logos/shopee.png',
    status: 'active',
    products: 234,
    orders: 89,
    lastSync: '2023-10-06 14:35',
    autoSync: true
  },
  {
    id: 2,
    name: 'Lazada',
    logo: '/logos/lazada.png',
    status: 'active',
    products: 198,
    orders: 56,
    lastSync: '2023-10-06 12:20',
    autoSync: true
  },
  {
    id: 3,
    name: 'Tiki',
    logo: '/logos/tiki.png',
    status: 'error',
    products: 156,
    orders: 32,
    lastSync: '2023-10-05 09:15',
    autoSync: true,
    errorMessage: 'API authentication error'
  },
  {
    id: 4,
    name: 'Sendo',
    logo: '/logos/sendo.png',
    status: 'inactive',
    products: 85,
    orders: 18,
    lastSync: '2023-10-02 16:45',
    autoSync: false
  }
];

// Available channels for integration
const availableChannels = [
  {
    id: 'shopee',
    name: 'Shopee',
    logo: '/logos/shopee.png',
    description: 'Connect to Shopee marketplace to sync products and orders',
    status: 'connected'
  },
  {
    id: 'lazada',
    name: 'Lazada',
    logo: '/logos/lazada.png',
    description: 'Connect to Lazada marketplace to sync products and orders',
    status: 'connected'
  },
  {
    id: 'tiki',
    name: 'Tiki',
    logo: '/logos/tiki.png',
    description: 'Connect to Tiki marketplace to sync products and orders',
    status: 'connected'
  },
  {
    id: 'sendo',
    name: 'Sendo',
    logo: '/logos/sendo.png',
    description: 'Connect to Sendo marketplace to sync products and orders',
    status: 'connected'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '/logos/amazon.png',
    description: 'Connect to Amazon marketplace for international sales',
    status: 'available'
  },
  {
    id: 'tokopedia',
    name: 'Tokopedia',
    logo: '/logos/tokopedia.png',
    description: 'Connect to Tokopedia marketplace for Indonesian market',
    status: 'available'
  },
  {
    id: 'zalora',
    name: 'Zalora',
    logo: '/logos/zalora.png',
    description: 'Connect to Zalora fashion marketplace',
    status: 'available'
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    logo: '/logos/woocommerce.png',
    description: 'Connect to your WooCommerce website',
    status: 'available'
  }
];

// Order sync history
const syncHistory = [
  {
    id: 1,
    channel: 'Shopee',
    type: 'Products',
    startTime: '2023-10-06 14:35',
    endTime: '2023-10-06 14:38',
    status: 'success',
    items: 234,
    notes: 'All products synced successfully'
  },
  {
    id: 2,
    channel: 'Shopee',
    type: 'Orders',
    startTime: '2023-10-06 14:38',
    endTime: '2023-10-06 14:40',
    status: 'success',
    items: 18,
    notes: 'All orders synced successfully'
  },
  {
    id: 3,
    channel: 'Lazada',
    type: 'Products',
    startTime: '2023-10-06 12:20',
    endTime: '2023-10-06 12:25',
    status: 'success',
    items: 198,
    notes: 'All products synced successfully'
  },
  {
    id: 4,
    channel: 'Lazada',
    type: 'Orders',
    startTime: '2023-10-06 12:25',
    endTime: '2023-10-06 12:26',
    status: 'success',
    items: 12,
    notes: 'All orders synced successfully'
  },
  {
    id: 5,
    channel: 'Tiki',
    type: 'Products',
    startTime: '2023-10-05 09:15',
    endTime: '2023-10-05 09:18',
    status: 'error',
    items: 0,
    notes: 'API authentication error'
  }
];

const EcommerceChannels = () => {
  const [activeTab, setActiveTab] = useState('connected');
  const [syncingChannel, setSyncingChannel] = useState(null);
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [connectForm] = Form.useForm();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Reset form when modal closes
    if (!connectModalVisible) {
      connectForm.resetFields();
      setCurrentStep(0);
    }
  }, [connectModalVisible, connectForm]);
  
  const handleSyncNow = (channel) => {
    setSyncingChannel(channel.id);
    
    // Simulate API call
    setTimeout(() => {
      setSyncingChannel(null);
    }, 2500);
  };
  
  const handleToggleAutoSync = (checked, channel) => {
    console.log(`Auto sync for ${channel.name} set to ${checked}`);
    // Update state or API call here
  };
  
  const handleConnect = () => {
    setLoading(true);
    
    // Simulate API connection
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(currentStep + 1);
    }, 2000);
  };
  
  const handleFinishConnect = () => {
    setConnectModalVisible(false);
    // Would typically refresh channel list here
  };
  
  const showConnectModal = (channel) => {
    setSelectedChannel(channel);
    setConnectModalVisible(true);
  };
  
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const renderConnectSteps = () => {
    const steps = [
      {
        title: 'API Connection',
        content: (
          <Form
            form={connectForm}
            layout="vertical"
          >
            <Alert 
              message={`Connecting to ${selectedChannel?.name}`}
              description={`Follow these steps to connect your ${selectedChannel?.name} seller account with Trường Phát Computer.`}
              type="info" 
              showIcon 
              style={{ marginBottom: 24 }}
            />
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="API Key"
                  name="apiKey"
                  rules={[{ required: true, message: 'Please enter API key' }]}
                >
                  <Input.Password placeholder="Enter your API key" />
                </Form.Item>
                
                <Form.Item
                  label="API Secret"
                  name="apiSecret"
                  rules={[{ required: true, message: 'Please enter API secret' }]}
                >
                  <Input.Password placeholder="Enter your API secret" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="Store ID"
                  name="storeId"
                  rules={[{ required: true, message: 'Please enter store ID' }]}
                >
                  <Input placeholder="Enter your seller store ID" />
                </Form.Item>
                
                <Form.Item
                  label="Region"
                  name="region"
                  rules={[{ required: true, message: 'Please select a region' }]}
                  initialValue="vietnam"
                >
                  <Select placeholder="Select region">
                    <Option value="vietnam">Vietnam</Option>
                    <Option value="singapore">Singapore</Option>
                    <Option value="malaysia">Malaysia</Option>
                    <Option value="thailand">Thailand</Option>
                    <Option value="indonesia">Indonesia</Option>
                    <Option value="philippines">Philippines</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Divider />
            
            <Paragraph>
              <Text strong>Don't have API credentials?</Text>
            </Paragraph>
            <ul>
              <li>Log in to your {selectedChannel?.name} Seller Center</li>
              <li>Navigate to Settings &gt; API Management</li>
              <li>Generate new API key and secret</li>
              <li>Copy and paste them here</li>
            </ul>
            
            <Alert 
              message="Authentication Secure" 
              description="Your credentials are encrypted and securely stored. We use OAuth 2.0 for secure API authentication." 
              type="success" 
              showIcon 
              style={{ marginTop: 16 }}
            />
          </Form>
        )
      },
      {
        title: 'Configure Sync',
        content: (
          <Form layout="vertical">
            <Alert 
              message="Configure Synchronization Settings"
              description="Choose what data to sync between your store and the marketplace"
              type="info" 
              showIcon 
              style={{ marginBottom: 24 }}
            />
            
            <Row gutter={24}>
              <Col span={12}>
                <Title level={5}>Product Sync Settings</Title>
                
                <Form.Item
                  label="Product Sync"
                  name="productSync"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                </Form.Item>
                
                <Form.Item
                  label="Sync Direction"
                  name="productSyncDirection"
                  initialValue="bidirectional"
                >
                  <Select>
                    <Option value="bidirectional">Bidirectional (Both ways)</Option>
                    <Option value="export">Export (POS to Marketplace)</Option>
                    <Option value="import">Import (Marketplace to POS)</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  label="Product Categories"
                  name="productCategories"
                  initialValue={["all"]}
                >
                  <Select mode="multiple" placeholder="Select categories to sync">
                    <Option value="all">All Categories</Option>
                    <Option value="laptops">Laptops</Option>
                    <Option value="components">Components</Option>
                    <Option value="peripherals">Peripherals</Option>
                    <Option value="monitors">Monitors</Option>
                    <Option value="networking">Networking</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Title level={5}>Order Sync Settings</Title>
                
                <Form.Item
                  label="Order Sync"
                  name="orderSync"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                </Form.Item>
                
                <Form.Item
                  label="Auto-Sync Frequency"
                  name="syncFrequency"
                  initialValue="hourly"
                >
                  <Select>
                    <Option value="realtime">Real-time</Option>
                    <Option value="15min">Every 15 minutes</Option>
                    <Option value="hourly">Hourly</Option>
                    <Option value="daily">Daily</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  label="Inventory Update"
                  name="inventorySync"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                </Form.Item>
              </Col>
            </Row>
            
            <Divider />
            
            <Form.Item
              label="Error Notification Email"
              name="errorEmail"
            >
              <Input placeholder="Enter email for sync error notifications" />
            </Form.Item>
          </Form>
        )
      },
      {
        title: 'Test Connection',
        content: (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {loading ? (
              <div>
                <Spin size="large" />
                <div style={{ marginTop: 24 }}>
                  <Text>Testing connection to {selectedChannel?.name}...</Text>
                </div>
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Validating API credentials and permissions</Text>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }}>
                  <CheckCircleOutlined />
                </div>
                <Title level={4}>Connection Successful!</Title>
                <Paragraph>
                  Your {selectedChannel?.name} account has been successfully connected to Trường Phát Computer.
                </Paragraph>
                <div style={{ marginTop: 24 }}>
                  <Statistic title="Products Ready to Sync" value={156} />
                </div>
                <div style={{ marginTop: 24 }}>
                  <Button type="primary" onClick={handleFinishConnect}>
                    Finish Setup
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      }
    ];
    
    return steps[currentStep]?.content;
  };
  
  const connectedColumns = [
    {
      title: 'Channel',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.logo ? (
            <Avatar src={record.logo} />
          ) : (
            <Avatar icon={<ShopOutlined />} />
          )}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        if (status === 'active') {
          return <Badge status="success" text="Active" />;
        } else if (status === 'inactive') {
          return <Badge status="default" text="Inactive" />;
        } else if (status === 'error') {
          return (
            <Tooltip title={record.errorMessage}>
              <Badge status="error" text="Error" />
            </Tooltip>
          );
        }
        return <Badge status="processing" text="Connecting" />;
      },
    },
    {
      title: 'Products',
      dataIndex: 'products',
      key: 'products',
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      key: 'orders',
    },
    {
      title: 'Last Sync',
      dataIndex: 'lastSync',
      key: 'lastSync',
    },
    {
      title: 'Auto Sync',
      dataIndex: 'autoSync',
      key: 'autoSync',
      render: (autoSync, record) => (
        <Switch 
          checked={autoSync} 
          onChange={(checked) => handleToggleAutoSync(checked, record)} 
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<SyncOutlined spin={syncingChannel === record.id} />}
            onClick={() => handleSyncNow(record)}
            disabled={record.status === 'error' || record.status === 'inactive'}
          >
            Sync Now
          </Button>
          <Button
            icon={<SettingOutlined />}
          >
            Settings
          </Button>
          {record.status === 'error' && (
            <Button
              type="primary"
              danger
              icon={<ExclamationCircleOutlined />}
            >
              Fix
            </Button>
          )}
        </Space>
      ),
    },
  ];
  
  const historyColumns = [
    {
      title: 'Channel',
      dataIndex: 'channel',
      key: 'channel',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        type === 'Products' ? (
          <Tag color="blue">{type}</Tag>
        ) : (
          <Tag color="green">{type}</Tag>
        )
      ),
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'success') {
          return <Badge status="success" text="Success" />;
        } else if (status === 'error') {
          return <Badge status="error" text="Error" />;
        }
        return <Badge status="processing" text="Processing" />;
      },
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>
          <AppstoreOutlined /> Ecommerce Channels
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setActiveTab('available')}
        >
          Connect New Channel
        </Button>
      </div>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <LinkOutlined /> Connected Channels
              </span>
            } 
            key="connected"
          >
            <Table
              columns={connectedColumns}
              dataSource={connectedChannels}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <PlusOutlined /> Available Channels
              </span>
            } 
            key="available"
          >
            <Row gutter={[24, 24]}>
              {availableChannels.map(channel => (
                <Col xs={24} sm={12} md={8} lg={6} key={channel.id}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    actions={[
                      channel.status === 'connected' ? (
                        <Tooltip title="Already Connected">
                          <Button type="text" disabled icon={<CheckCircleOutlined />}>
                            Connected
                          </Button>
                        </Tooltip>
                      ) : (
                        <Button 
                          type="primary" 
                          icon={<LinkOutlined />} 
                          onClick={() => showConnectModal(channel)}
                        >
                          Connect
                        </Button>
                      )
                    ]}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
                      {channel.logo ? (
                        <Avatar size={64} src={channel.logo} style={{ marginBottom: 16 }} />
                      ) : (
                        <Avatar size={64} icon={<ShopOutlined />} style={{ marginBottom: 16 }} />
                      )}
                      <Title level={5}>{channel.name}</Title>
                      <Paragraph style={{ textAlign: 'center', marginBottom: 8 }}>
                        {channel.description}
                      </Paragraph>
                      {channel.status === 'connected' ? (
                        <Tag color="green">Connected</Tag>
                      ) : (
                        <Tag color="blue">Available</Tag>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SyncOutlined /> Sync History
              </span>
            } 
            key="history"
          >
            <Table
              columns={historyColumns}
              dataSource={syncHistory}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SettingOutlined /> Global Settings
              </span>
            } 
            key="settings"
          >
            <Form layout="vertical">
              <Row gutter={24}>
                <Col span={12}>
                  <Card title="Default Sync Settings" style={{ marginBottom: 24 }}>
                    <Form.Item
                      label="Default Sync Frequency"
                      name="defaultSyncFrequency"
                      initialValue="hourly"
                    >
                      <Select>
                        <Option value="15min">Every 15 minutes</Option>
                        <Option value="30min">Every 30 minutes</Option>
                        <Option value="hourly">Hourly</Option>
                        <Option value="daily">Daily</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      label="Inventory Buffer"
                      name="inventoryBuffer"
                      tooltip="Safety stock buffer to prevent overselling"
                      initialValue={5}
                    >
                      <Select>
                        <Option value={0}>No buffer</Option>
                        <Option value={5}>5%</Option>
                        <Option value={10}>10%</Option>
                        <Option value={15}>15%</Option>
                        <Option value={20}>20%</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      label="Price Adjustment"
                      name="priceAdjustment"
                      tooltip="Automatically adjust prices for different channels"
                      initialValue={0}
                    >
                      <Select>
                        <Option value={0}>No adjustment</Option>
                        <Option value={5}>+5%</Option>
                        <Option value={10}>+10%</Option>
                        <Option value={15}>+15%</Option>
                        <Option value={-5}>-5%</Option>
                        <Option value={-10}>-10%</Option>
                      </Select>
                    </Form.Item>
                  </Card>
                  
                  <Card title="Error Handling">
                    <Form.Item
                      label="Error Notifications"
                      name="errorNotifications"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>
                    
                    <Form.Item
                      label="Error Recipients"
                      name="errorRecipients"
                    >
                      <Select mode="tags" placeholder="Enter email addresses">
                        <Option value="admin@truongphat.com">admin@truongphat.com</Option>
                        <Option value="inventory@truongphat.com">inventory@truongphat.com</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      label="Auto-Retry Failed Syncs"
                      name="autoRetry"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card title="Product Export Settings" style={{ marginBottom: 24 }}>
                    <Form.Item
                      label="Default Product Status"
                      name="defaultProductStatus"
                      initialValue="active"
                    >
                      <Select>
                        <Option value="active">Active</Option>
                        <Option value="draft">Draft</Option>
                        <Option value="inactive">Inactive</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      label="Export Images"
                      name="exportImages"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>
                    
                    <Form.Item
                      label="Image Quality"
                      name="imageQuality"
                      initialValue="high"
                    >
                      <Select>
                        <Option value="original">Original</Option>
                        <Option value="high">High</Option>
                        <Option value="medium">Medium</Option>
                        <Option value="low">Low</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      label="Export Product Attributes"
                      name="exportAttributes"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>
                  </Card>
                  
                  <Card title="Order Import Settings">
                    <Form.Item
                      label="Auto-Accept Orders"
                      name="autoAcceptOrders"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>
                    
                    <Form.Item
                      label="Default Payment Status"
                      name="defaultPaymentStatus"
                      initialValue="paid"
                    >
                      <Select>
                        <Option value="paid">Paid</Option>
                        <Option value="pending">Pending</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      label="Order Notifications"
                      name="orderNotifications"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <Button type="primary">
                  Save Settings
                </Button>
              </div>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
      
      <Modal
        title={`Connect to ${selectedChannel?.name}`}
        visible={connectModalVisible}
        onCancel={() => setConnectModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setConnectModalVisible(false)}>
            Cancel
          </Button>,
          currentStep > 0 && (
            <Button key="prev" style={{ margin: '0 8px' }} onClick={prevStep}>
              Previous
            </Button>
          ),
          currentStep < 2 ? (
            <Button 
              key="next" 
              type="primary" 
              onClick={currentStep === 1 ? handleConnect : nextStep}
              loading={loading}
            >
              {currentStep === 1 ? 'Connect' : 'Next'}
            </Button>
          ) : null
        ]}
        width={800}
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="API Connection" />
          <Step title="Configure Sync" />
          <Step title="Test Connection" />
        </Steps>
        
        {renderConnectSteps()}
      </Modal>
    </div>
  );
};

export default EcommerceChannels; 