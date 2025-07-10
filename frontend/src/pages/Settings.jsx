import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Upload,
  Space,
  Divider,
  Row,
  Col,
  Typography,
  message,
  List,
  Badge,
  Avatar,
  Menu,
  Tooltip,
  Timeline,
  Drawer,
  Tag,
  Descriptions,
  Alert,
  InputNumber
} from 'antd';
import {
  SettingOutlined,
  UserOutlined,
  LockOutlined,
  GlobalOutlined,
  MailOutlined,
  BellOutlined,
  CloudOutlined,
  DatabaseOutlined,
  ApiOutlined,
  ShopOutlined,
  TeamOutlined,
  SaveOutlined,
  UploadOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  BankOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  MobileOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  IdcardOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Password } = Input;

/**
 * Main Settings page component
 * Provides access to all system settings and configuration options
 */
const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('system');
  const [generalForm] = Form.useForm();
  const [companyForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [backupForm] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Mock roles data
  const roles = [
    { id: 1, name: 'Administrator', users: 2, description: 'Full system access and management' },
    { id: 2, name: 'Manager', users: 5, description: 'Store management, reporting, and staff supervision' },
    { id: 3, name: 'Cashier', users: 8, description: 'Point of sale operations and basic customer management' },
    { id: 4, name: 'Inventory', users: 3, description: 'Stock management and procurement' },
    { id: 5, name: 'Sales', users: 6, description: 'Sales activities and customer engagement' }
  ];
  
  // Mock users data
  const users = [
    { id: 1, name: 'Nguyen Admin', email: 'admin@example.com', role: 'Administrator', status: 'active', lastLogin: '2023-10-12 09:45:22' },
    { id: 2, name: 'Tran Manager', email: 'manager@example.com', role: 'Manager', status: 'active', lastLogin: '2023-10-11 14:30:15' },
    { id: 3, name: 'Le Cashier', email: 'cashier@example.com', role: 'Cashier', status: 'active', lastLogin: '2023-10-12 08:15:40' },
    { id: 4, name: 'Pham Inventory', email: 'inventory@example.com', role: 'Inventory', status: 'inactive', lastLogin: '2023-09-30 10:20:18' }
  ];
  
  // Mock backups data
  const backups = [
    { id: 1, name: 'Full System Backup', date: '2023-10-12 02:00:00', size: '256 MB', status: 'completed', type: 'automatic' },
    { id: 2, name: 'Database Backup', date: '2023-10-11 02:00:00', size: '120 MB', status: 'completed', type: 'automatic' },
    { id: 3, name: 'Manual Backup', date: '2023-10-10 15:30:42', size: '245 MB', status: 'completed', type: 'manual' },
    { id: 4, name: 'Pre-Update Backup', date: '2023-10-05 09:15:30', size: '240 MB', status: 'completed', type: 'manual' }
  ];
  
  // Handle form submissions
  const handleSaveGeneral = (values) => {
    setLoading(true);
    setTimeout(() => {
      console.log('General settings:', values);
      message.success('General settings saved successfully');
      setLoading(false);
    }, 1000);
  };
  
  const handleSaveCompany = (values) => {
    setLoading(true);
    setTimeout(() => {
      console.log('Company settings:', values);
      message.success('Company profile saved successfully');
      setLoading(false);
    }, 1000);
  };
  
  const handleSaveEmail = (values) => {
    setLoading(true);
    setTimeout(() => {
      console.log('Email settings:', values);
      message.success('Email settings saved successfully');
      setLoading(false);
    }, 1000);
  };
  
  const handleSaveSecurity = (values) => {
    setLoading(true);
    setTimeout(() => {
      console.log('Security settings:', values);
      message.success('Security settings saved successfully');
      setLoading(false);
    }, 1000);
  };
  
  const handleCreateBackup = (values) => {
    setBackupLoading(true);
    setTimeout(() => {
      console.log('Creating backup:', values);
      message.success('Backup created successfully');
      setBackupLoading(false);
    }, 2000);
  };
  
  const handleUserOperation = (user, action) => {
    if (action === 'edit') {
      navigate(`/admin/settings/users/edit/${user.id}`);
    } else if (action === 'delete') {
      message.success(`User ${user.name} deleted`);
    } else if (action === 'reset') {
      message.success(`Password reset link sent to ${user.email}`);
    }
  };
  
  const handleRoleOperation = (role, action) => {
    if (action === 'edit') {
      navigate(`/admin/settings/roles/edit/${role.id}`);
    } else if (action === 'delete') {
      message.success(`Role ${role.name} deleted`);
    } else if (action === 'view') {
      navigate(`/admin/settings/roles/view/${role.id}`);
    }
  };
  
  const handleTestEmail = () => {
    message.loading('Sending test email...', 1.5)
      .then(() => message.success('Test email sent successfully'));
  };
  
  const handleFactorStatusChange = (checked) => {
    setTwoFactorEnabled(checked);
    message.success(`Two-factor authentication ${checked ? 'enabled' : 'disabled'}`);
  };
  
  const handleBackupOperation = (backup, action) => {
    if (action === 'download') {
      message.success(`Downloading backup: ${backup.name}`);
    } else if (action === 'restore') {
      message.success(`Restoring from backup: ${backup.name}`);
    } else if (action === 'delete') {
      message.success(`Backup deleted: ${backup.name}`);
    }
  };

  // General Settings Form
  const renderGeneralSettings = () => {
    return (
      <Form
        form={generalForm}
        layout="vertical"
        onFinish={handleSaveGeneral}
        initialValues={{
          storeName: 'Trường Phát Computer',
          storePhone: '0836.768.597',
          storeEmail: 'contact@truongphat.com',
          receiptFooter: 'Thank you for shopping with us!',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: 'HH:mm:ss',
          timezone: 'Asia/Ho_Chi_Minh',
          language: 'vi',
          currency: 'VND',
          autoLogout: 30,
          maintenanceMode: false,
          debugMode: false
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="storeName"
              label="Store Name"
              rules={[{ required: true, message: 'Please enter store name' }]}
            >
              <Input prefix={<ShopOutlined />} />
            </Form.Item>
            
            <Form.Item
              name="storePhone"
              label="Store Phone"
              rules={[{ required: true, message: 'Please enter store phone' }]}
            >
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>
            
            <Form.Item
              name="storeEmail"
              label="Store Email"
              rules={[{ required: true, message: 'Please enter store email' }]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>
            
            <Form.Item
              name="language"
              label="Default Language"
            >
              <Select>
                <Option value="vi">Vietnamese</Option>
                <Option value="en">English</Option>
                <Option value="fr">French</Option>
                <Option value="ja">Japanese</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="timezone"
              label="Timezone"
            >
              <Select showSearch>
                <Option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</Option>
                <Option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</Option>
                <Option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</Option>
                <Option value="Europe/London">Europe/London (GMT+0)</Option>
                <Option value="America/New_York">America/New_York (GMT-5)</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="currency"
              label="Default Currency"
            >
              <Select>
                <Option value="VND">Vietnamese Dong (VND)</Option>
                <Option value="USD">US Dollar (USD)</Option>
                <Option value="EUR">Euro (EUR)</Option>
                <Option value="JPY">Japanese Yen (JPY)</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="dateFormat"
              label="Date Format"
            >
              <Select>
                <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                <Option value="DD-MM-YYYY">DD-MM-YYYY</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="timeFormat"
              label="Time Format"
            >
              <Select>
                <Option value="HH:mm:ss">24-hour (HH:mm:ss)</Option>
                <Option value="hh:mm:ss a">12-hour (hh:mm:ss a)</Option>
                <Option value="HH:mm">24-hour without seconds (HH:mm)</Option>
                <Option value="hh:mm a">12-hour without seconds (hh:mm a)</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="autoLogout"
              label="Auto Logout (minutes)"
              rules={[{ required: true, message: 'Please enter auto logout time' }]}
            >
              <InputNumber min={0} max={480} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="receiptFooter"
              label="Receipt Footer Text"
            >
              <TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider />
        
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="maintenanceMode"
              label="Maintenance Mode"
              valuePropName="checked"
              extra="When enabled, only administrators can access the system"
            >
              <Switch />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="debugMode"
              label="Debug Mode"
              valuePropName="checked"
              extra="Enable for additional logging and debugging information"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />} 
            loading={loading}
          >
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    );
  };
  
  // Company Profile Form
  const renderCompanyProfile = () => {
    return (
      <Form
        form={companyForm}
        layout="vertical"
        onFinish={handleSaveCompany}
        initialValues={{
          companyName: 'Trường Phát Computer',
          legalName: 'Công ty TNHH Trường Phát Computer',
          taxId: '0123456789',
          address: '123 Lê Lợi, Phường Phong Phú',
          city: 'Thành phố Hòa Bình',
          state: 'Hòa Bình',
          zipCode: '36000',
          country: 'Vietnam',
          industry: 'retail',
          website: 'www.truongphat.com',
          foundedYear: 2010
        }}
      >
        <Row gutter={24}>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Avatar size={120} src={logoUrl} alt="Company Logo" />
            <br /><br />
            <Upload 
              name="logo" 
              listType="picture"
              showUploadList={false}
              beforeUpload={(file) => {
                // Simulate upload
                const reader = new FileReader();
                reader.onload = (e) => {
                  setLogoUrl(e.target.result);
                };
                reader.readAsDataURL(file);
                message.success('Logo uploaded successfully');
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Logo</Button>
            </Upload>
          </Col>
          
          <Col span={16}>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="companyName"
                  label="Company Name"
                  rules={[{ required: true, message: 'Please enter company name' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="legalName"
                  label="Legal Name"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="taxId"
                  label="Tax ID / Business Registration"
                >
                  <Input />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="industry"
                  label="Industry"
                >
                  <Select>
                    <Option value="retail">Retail</Option>
                    <Option value="wholesale">Wholesale</Option>
                    <Option value="manufacturing">Manufacturing</Option>
                    <Option value="service">Service</Option>
                    <Option value="restaurant">Restaurant</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="address"
              label="Address"
            >
              <Input />
            </Form.Item>
            
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="city"
                  label="City"
                >
                  <Input />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item
                  name="state"
                  label="State/Province"
                >
                  <Input />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item
                  name="zipCode"
                  label="Postal/ZIP Code"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="country"
                  label="Country"
                >
                  <Select showSearch>
                    <Option value="Vietnam">Vietnam</Option>
                    <Option value="United States">United States</Option>
                    <Option value="China">China</Option>
                    <Option value="Japan">Japan</Option>
                    <Option value="Korea">Korea</Option>
                    <Option value="Thailand">Thailand</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item
                  name="website"
                  label="Website"
                >
                  <Input addonBefore="http://" />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item
                  name="foundedYear"
                  label="Founded Year"
                >
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        
        <Divider />
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />} 
            loading={loading}
          >
            Save Company Profile
          </Button>
        </Form.Item>
      </Form>
    );
  };
  
  // Email Settings Form
  const renderEmailSettings = () => {
    return (
      <Form
        form={emailForm}
        layout="vertical"
        onFinish={handleSaveEmail}
        initialValues={{
          provider: 'smtp',
          host: 'smtp.gmail.com',
          port: 587,
          encryption: 'tls',
          auth: true,
          senderName: 'Trường Phát Computer',
          senderEmail: 'noreply@truongphat.com'
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="provider"
              label="Email Provider"
            >
              <Select>
                <Option value="smtp">SMTP Server</Option>
                <Option value="sendgrid">SendGrid</Option>
                <Option value="mailgun">Mailgun</Option>
                <Option value="ses">Amazon SES</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="host"
              label="SMTP Host"
              rules={[{ required: true, message: 'Please enter SMTP host' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="port"
              label="SMTP Port"
              rules={[{ required: true, message: 'Please enter SMTP port' }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="encryption"
              label="Encryption"
            >
              <Select>
                <Option value="none">None</Option>
                <Option value="ssl">SSL</Option>
                <Option value="tls">TLS</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="auth"
              label="Requires Authentication"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="username"
              label="SMTP Username"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="password"
              label="SMTP Password"
            >
              <Input.Password />
            </Form.Item>
            
            <Divider />
            
            <Form.Item
              name="senderName"
              label="Default Sender Name"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="senderEmail"
              label="Default Sender Email"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider />
        
        <Row>
          <Col span={24}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />} 
                loading={loading}
              >
                Save Settings
              </Button>
              <Button 
                onClick={handleTestEmail} 
                icon={<MailOutlined />}
              >
                Send Test Email
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    );
  };
  
  // Security Settings Form
  const renderSecuritySettings = () => {
    return (
      <Form
        form={securityForm}
        layout="vertical"
        onFinish={handleSaveSecurity}
        initialValues={{
          passwordExpiry: 90,
          minPasswordLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecial: true,
          maxLoginAttempts: 5,
          lockoutDuration: 30,
          sessionTimeout: 30,
          enableTwoFactor: false,
          ipRestriction: false
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Title level={4}>Password Policy</Title>
            
            <Form.Item
              name="minPasswordLength"
              label="Minimum Password Length"
            >
              <InputNumber min={6} max={24} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="requireUppercase"
              label="Require Uppercase Letters"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="requireLowercase"
              label="Require Lowercase Letters"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="requireNumbers"
              label="Require Numbers"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="requireSpecial"
              label="Require Special Characters"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="passwordExpiry"
              label="Password Expiry (days, 0 = never)"
            >
              <InputNumber min={0} max={365} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Title level={4}>Login Security</Title>
            
            <Form.Item
              name="maxLoginAttempts"
              label="Max Failed Login Attempts"
            >
              <InputNumber min={1} max={10} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="lockoutDuration"
              label="Account Lockout Duration (minutes)"
            >
              <InputNumber min={5} max={1440} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="sessionTimeout"
              label="Session Timeout (minutes)"
            >
              <InputNumber min={5} max={1440} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="enableTwoFactor"
              label="Enable Two-Factor Authentication"
              valuePropName="checked"
            >
              <Switch onChange={handleFactorStatusChange} />
            </Form.Item>
            
            <Form.Item
              name="ipRestriction"
              label="Enable IP Restriction"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        
        {twoFactorEnabled && (
          <Alert
            message="Two-Factor Authentication Settings"
            description={
              <div>
                <p>Two-factor authentication is enabled. Each user will be required to set up 2FA on their next login.</p>
                <p>You can exempt specific user roles from 2FA in the User Roles section.</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}
        
        <Divider />
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />} 
            loading={loading}
          >
            Save Security Settings
          </Button>
        </Form.Item>
      </Form>
    );
  };
  
  // User Management
  const renderUserManagement = () => {
    return (
      <div>
        <Row style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Title level={4}>User Management</Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<UserOutlined />}
              onClick={() => navigate('/admin/settings/users/add')}
            >
              Add New User
            </Button>
          </Col>
        </Row>
        
        <List
          itemLayout="horizontal"
          dataSource={users}
          renderItem={user => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  icon={<EyeOutlined />} 
                  onClick={() => handleUserOperation(user, 'view')}
                >
                  View
                </Button>,
                <Button 
                  type="link" 
                  icon={<EditOutlined />} 
                  onClick={() => handleUserOperation(user, 'edit')}
                >
                  Edit
                </Button>,
                <Button 
                  type="link" 
                  icon={<KeyOutlined />} 
                  onClick={() => handleUserOperation(user, 'reset')}
                >
                  Reset Password
                </Button>,
                <Button 
                  type="link" 
                  danger
                  icon={<DeleteOutlined />} 
                  onClick={() => handleUserOperation(user, 'delete')}
                >
                  Delete
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Space>
                    {user.name}
                    <Badge 
                      status={user.status === 'active' ? 'success' : 'default'} 
                      text={user.status} 
                    />
                  </Space>
                }
                description={
                  <div>
                    <div>{user.email}</div>
                    <div>
                      <Tag color="blue">{user.role}</Tag>
                      <Text type="secondary">Last login: {user.lastLogin}</Text>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        
        <Divider />
        
        <Row style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Title level={4}>User Roles</Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<TeamOutlined />}
              onClick={() => navigate('/admin/settings/roles/add')}
            >
              Add New Role
            </Button>
          </Col>
        </Row>
        
        <List
          itemLayout="horizontal"
          dataSource={roles}
          renderItem={role => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  icon={<EyeOutlined />} 
                  onClick={() => handleRoleOperation(role, 'view')}
                >
                  View
                </Button>,
                <Button 
                  type="link" 
                  icon={<EditOutlined />} 
                  onClick={() => handleRoleOperation(role, 'edit')}
                >
                  Edit
                </Button>,
                <Button 
                  type="link" 
                  danger
                  icon={<DeleteOutlined />} 
                  onClick={() => handleRoleOperation(role, 'delete')}
                  disabled={role.name === 'Administrator'}
                >
                  Delete
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<TeamOutlined />} />}
                title={role.name}
                description={
                  <div>
                    <div>{role.description}</div>
                    <div><Tag color="green">{role.users} users</Tag></div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  };
  
  // Backup & Restore
  const renderBackupRestore = () => {
    return (
      <div>
        <Row gutter={24}>
          <Col span={16}>
            <Title level={4}>Backup System</Title>
            <Form
              form={backupForm}
              layout="vertical"
              onFinish={handleCreateBackup}
              initialValues={{
                backupType: 'full',
                includeFiles: true,
                includeDatabase: true,
                includeSettings: true,
                compress: true
              }}
            >
              <Form.Item
                name="backupType"
                label="Backup Type"
              >
                <Select>
                  <Option value="full">Full Backup</Option>
                  <Option value="database">Database Only</Option>
                  <Option value="files">Files Only</Option>
                  <Option value="settings">Settings Only</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="includeFiles"
                label="Include Files"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="includeDatabase"
                label="Include Database"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="includeSettings"
                label="Include Settings"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="compress"
                label="Compress Backup"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<CloudOutlined />} 
                  loading={backupLoading}
                >
                  Create Backup
                </Button>
              </Form.Item>
            </Form>
          </Col>
          
          <Col span={8}>
            <Card title="Automatic Backups" size="small">
              <Form layout="vertical">
                <Form.Item
                  name="enableAutoBackup"
                  label="Enable Automatic Backups"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="backupFrequency"
                  label="Backup Frequency"
                  initialValue="daily"
                >
                  <Select>
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="monthly">Monthly</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="backupTime"
                  label="Backup Time"
                  initialValue="02:00"
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="maxBackups"
                  label="Maximum Backups to Keep"
                  initialValue={10}
                >
                  <InputNumber min={1} max={50} style={{ width: '100%' }} />
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        <Title level={4}>Backup History</Title>
        <List
          itemLayout="horizontal"
          dataSource={backups}
          renderItem={backup => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  icon={<DownloadOutlined />} 
                  onClick={() => handleBackupOperation(backup, 'download')}
                >
                  Download
                </Button>,
                <Button 
                  type="link" 
                  icon={<SyncOutlined />} 
                  onClick={() => handleBackupOperation(backup, 'restore')}
                >
                  Restore
                </Button>,
                <Button 
                  type="link" 
                  danger
                  icon={<DeleteOutlined />} 
                  onClick={() => handleBackupOperation(backup, 'delete')}
                >
                  Delete
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<DatabaseOutlined />} />}
                title={backup.name}
                description={
                  <div>
                    <div>Date: {backup.date}</div>
                    <div>
                      <Space>
                        <Tag color="blue">{backup.size}</Tag>
                        <Tag color={backup.type === 'automatic' ? 'green' : 'volcano'}>
                          {backup.type}
                        </Tag>
                        <Tag color="success">{backup.status}</Tag>
                      </Space>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  };

  return (
    <div className="settings-page">
      <Card bordered={false} className="header-card">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Title level={2}>
              <SettingOutlined /> System Settings
            </Title>
            <Text type="secondary">
              Configure and manage system-wide settings
            </Text>
          </Col>
        </Row>
      </Card>
      
      <Card style={{ marginTop: 24 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabPosition="left">
          <TabPane 
            tab={<span><SettingOutlined /> General</span>} 
            key="system"
          >
            {renderGeneralSettings()}
          </TabPane>
          
          <TabPane 
            tab={<span><ShopOutlined /> Company Profile</span>} 
            key="company"
          >
            {renderCompanyProfile()}
          </TabPane>
          
          <TabPane 
            tab={<span><MailOutlined /> Email Settings</span>} 
            key="email"
          >
            {renderEmailSettings()}
          </TabPane>
          
          <TabPane 
            tab={<span><LockOutlined /> Security</span>} 
            key="security"
          >
            {renderSecuritySettings()}
          </TabPane>
          
          <TabPane 
            tab={<span><TeamOutlined /> Users & Roles</span>} 
            key="users"
          >
            {renderUserManagement()}
          </TabPane>
          
          <TabPane 
            tab={<span><CloudOutlined /> Backup & Restore</span>} 
            key="backup"
          >
            {renderBackupRestore()}
          </TabPane>
          
          <TabPane 
            tab={<span><ApiOutlined /> API & Integrations</span>} 
            key="api"
          >
            <Alert
              message="API Settings"
              description="Configure API access, permissions, and integration settings."
              type="info"
              showIcon
            />
            <Button 
              style={{ marginTop: 16 }} 
              type="primary" 
              onClick={() => navigate('/admin/integrations/api')}
            >
              Manage API Settings
            </Button>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings; 