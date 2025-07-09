import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Divider,
  Typography,
  Row,
  Col,
  Select,
  Switch,
  Tabs,
  message,
  Table,
  Tag,
  Popconfirm,
  Alert,
  List,
  Badge,
  Descriptions,
  Modal,
  Timeline,
  Empty
} from 'antd';
import {
  LockOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  MobileOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UserOutlined,
  HistoryOutlined,
  GlobalOutlined,
  SettingOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  ShieldOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  SaveOutlined,
  LoginOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Password } = Input;

const SecuritySettings = () => {
  const [activeTab, setActiveTab] = useState('password');
  const [passwordForm] = Form.useForm();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [sessionLimitDays, setSessionLimitDays] = useState(30);
  const [notifyOnNewLogin, setNotifyOnNewLogin] = useState(true);
  const [blockedIPs, setBlockedIPs] = useState([
    { id: 1, ip: '192.168.1.100', reason: 'Nhiều lần đăng nhập thất bại', blockedAt: '2023-08-15 14:30:22' },
    { id: 2, ip: '45.23.126.42', reason: 'Hoạt động đáng ngờ', blockedAt: '2023-09-02 09:15:40' }
  ]);
  
  // Mocked session data
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      device: 'Chrome / Windows 10',
      ip: '192.168.1.5',
      location: 'Hòa Bình, Vietnam',
      lastActive: '2023-10-12 10:30:45',
      current: true
    },
    {
      id: 2,
      device: 'Safari / MacOS',
      ip: '192.168.1.10',
      location: 'Hòa Bình, Vietnam',
      lastActive: '2023-10-11 16:45:22',
      current: false
    },
    {
      id: 3,
      device: 'Chrome / Android',
      ip: '115.72.45.120',
      location: 'Hà Nội, Vietnam',
      lastActive: '2023-10-10 09:15:33',
      current: false
    }
  ]);
  
  // Mocked security logs
  const [securityLogs, setSecurityLogs] = useState([
    { 
      id: 1, 
      action: 'Đăng nhập thành công', 
      user: 'admin', 
      ip: '192.168.1.5',
      device: 'Chrome / Windows 10',
      timestamp: '2023-10-12 10:30:45', 
      status: 'success' 
    },
    { 
      id: 2, 
      action: 'Thay đổi mật khẩu', 
      user: 'admin', 
      ip: '192.168.1.5',
      device: 'Chrome / Windows 10',
      timestamp: '2023-10-10 15:22:30', 
      status: 'success' 
    },
    { 
      id: 3, 
      action: 'Đăng nhập thất bại', 
      user: 'unknown', 
      ip: '45.23.126.42',
      device: 'Unknown',
      timestamp: '2023-09-02 09:15:40', 
      status: 'error' 
    },
    { 
      id: 4, 
      action: 'Thiết lập xác thực hai lớp', 
      user: 'admin', 
      ip: '192.168.1.5',
      device: 'Chrome / Windows 10',
      timestamp: '2023-08-25 11:10:15', 
      status: 'success' 
    },
    { 
      id: 5, 
      action: 'Tài khoản bị khóa', 
      user: 'staff1', 
      ip: '192.168.1.100',
      device: 'Firefox / Windows 10',
      timestamp: '2023-08-15 14:30:22', 
      status: 'warning' 
    }
  ]);
  
  // Handler functions
  const handlePasswordUpdate = (values) => {
    console.log('Password update values:', values);
    message.success('Mật khẩu đã được cập nhật thành công');
    passwordForm.resetFields();
  };
  
  const handle2FAToggle = (checked) => {
    if (checked) {
      setShowQRCode(true);
    } else {
      Modal.confirm({
        title: 'Xác nhận tắt xác thực hai lớp',
        content: 'Việc tắt xác thực hai lớp sẽ làm giảm bảo mật cho tài khoản của bạn. Bạn có chắc chắn muốn tiếp tục?',
        onOk: () => {
          setTwoFactorEnabled(false);
          message.warning('Xác thực hai lớp đã bị tắt');
        },
        onCancel: () => {
          setTwoFactorEnabled(true);
        }
      });
    }
  };
  
  const handleSetup2FA = () => {
    setTwoFactorEnabled(true);
    setShowQRCode(false);
    message.success('Xác thực hai lớp đã được thiết lập thành công');
  };
  
  const handleSessionTerminate = (sessionId) => {
    const updatedSessions = activeSessions.filter(session => session.id !== sessionId);
    setActiveSessions(updatedSessions);
    message.success('Phiên đăng nhập đã được kết thúc');
  };
  
  const handleTerminateAllSessions = () => {
    const currentSession = activeSessions.find(session => session.current);
    setActiveSessions(currentSession ? [currentSession] : []);
    message.success('Tất cả các phiên đăng nhập khác đã được kết thúc');
  };
  
  const handleUnblockIP = (ipId) => {
    const updatedBlockedIPs = blockedIPs.filter(ip => ip.id !== ipId);
    setBlockedIPs(updatedBlockedIPs);
    message.success('Địa chỉ IP đã được mở khóa');
  };
  
  // Table columns
  const sessionsColumns = [
    {
      title: 'Thiết bị',
      dataIndex: 'device',
      key: 'device',
      render: (text, record) => (
        <Space>
          {record.current ? <Badge status="processing" text={text + " (Thiết bị hiện tại)"} /> : text}
        </Space>
      )
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Hoạt động cuối',
      dataIndex: 'lastActive',
      key: 'lastActive',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        record.current ? 
        <Text type="secondary">Phiên hiện tại</Text> :
        <Popconfirm
          title="Bạn có chắc chắn muốn kết thúc phiên này?"
          onConfirm={() => handleSessionTerminate(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button danger size="small" icon={<LogoutOutlined />}>Kết thúc phiên</Button>
        </Popconfirm>
      ),
    },
  ];
  
  const blockedIPsColumns = [
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Thời gian khóa',
      dataIndex: 'blockedAt',
      key: 'blockedAt',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn mở khóa địa chỉ IP này?"
          onConfirm={() => handleUnblockIP(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button size="small">Mở khóa</Button>
        </Popconfirm>
      ),
    },
  ];
  
  const securityLogsColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => {
        const colorMap = {
          success: 'green',
          error: 'red',
          warning: 'orange'
        };
        return (
          <Tag color={colorMap[record.status]}>{text}</Tag>
        );
      }
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'Thiết bị',
      dataIndex: 'device',
      key: 'device',
    }
  ];
  
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>
          <ShieldOutlined /> Cài đặt bảo mật
        </Title>
        <Paragraph>
          Quản lý các cài đặt bảo mật, mật khẩu, xác thực hai lớp và theo dõi hoạt động đăng nhập.
        </Paragraph>
        
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <LockOutlined /> Mật khẩu
              </span>
            }
            key="password"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={16} lg={12}>
                <Card title="Đổi mật khẩu" bordered={false}>
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordUpdate}
                  >
                    <Form.Item
                      name="currentPassword"
                      label="Mật khẩu hiện tại"
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                    >
                      <Password
                        prefix={<LockOutlined />}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="newPassword"
                      label="Mật khẩu mới"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                        { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                        { pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/, 
                          message: 'Mật khẩu phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!' }
                      ]}
                      hasFeedback
                    >
                      <Password
                        prefix={<KeyOutlined />}
                        placeholder="Nhập mật khẩu mới"
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="confirmPassword"
                      label="Xác nhận mật khẩu mới"
                      dependencies={['newPassword']}
                      hasFeedback
                      rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Hai mật khẩu không khớp nhau!'));
                          },
                        }),
                      ]}
                    >
                      <Password
                        prefix={<KeyOutlined />}
                        placeholder="Xác nhận mật khẩu mới"
                      />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                        Cập nhật mật khẩu
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
              
              <Col xs={24} md={8} lg={12}>
                <Card title="Yêu cầu mật khẩu" bordered={false}>
                  <List
                    size="small"
                    dataSource={[
                      'Tối thiểu 8 ký tự',
                      'Có ít nhất một chữ hoa',
                      'Có ít nhất một chữ thường',
                      'Có ít nhất một chữ số',
                      'Có ít nhất một ký tự đặc biệt',
                      'Không giống với 3 mật khẩu gần nhất'
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <Text><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} /> {item}</Text>
                      </List.Item>
                    )}
                  />
                  
                  <Divider />
                  
                  <Paragraph>
                    <InfoCircleOutlined style={{ marginRight: 8 }} />
                    Hệ thống sẽ yêu cầu bạn đổi mật khẩu mỗi 90 ngày để đảm bảo an toàn cho tài khoản.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SafetyCertificateOutlined /> Xác thực hai lớp
              </span>
            }
            key="2fa"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card bordered={false}>
                  <Descriptions title="Trạng thái xác thực hai lớp" bordered column={1}>
                    <Descriptions.Item label="Trạng thái">
                      {twoFactorEnabled ? (
                        <Badge status="success" text="Đã kích hoạt" />
                      ) : (
                        <Badge status="error" text="Chưa kích hoạt" />
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức">
                      {twoFactorEnabled ? "Ứng dụng xác thực (Google Authenticator)" : "Không có"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Kích hoạt">
                      <Switch 
                        checked={twoFactorEnabled} 
                        onChange={handle2FAToggle} 
                        checkedChildren="Bật" 
                        unCheckedChildren="Tắt"
                      />
                    </Descriptions.Item>
                  </Descriptions>
                  
                  <Divider />
                  
                  <Paragraph>
                    <InfoCircleOutlined style={{ marginRight: 8 }} />
                    Xác thực hai lớp (2FA) giúp bảo vệ tài khoản của bạn bằng cách yêu cầu một mã xác thực thứ hai ngoài mật khẩu mỗi khi đăng nhập.
                  </Paragraph>
                </Card>
              </Col>
              
              {showQRCode && (
                <Col xs={24} md={12}>
                  <Card title="Thiết lập xác thực hai lớp" bordered={false}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <img 
                        src="https://via.placeholder.com/200x200?text=QR+Code" 
                        alt="QR Code" 
                        style={{ width: 200, height: 200 }}
                      />
                      <Paragraph>
                        Quét mã QR này bằng ứng dụng Google Authenticator trên điện thoại của bạn
                      </Paragraph>
                    </div>
                    
                    <Form layout="vertical" onFinish={handleSetup2FA}>
                      <Form.Item
                        name="verificationCode"
                        label="Nhập mã xác thực từ ứng dụng"
                        rules={[{ required: true, message: 'Vui lòng nhập mã xác thực!' }]}
                      >
                        <Input maxLength={6} placeholder="Nhập mã 6 số" />
                      </Form.Item>
                      
                      <Form.Item>
                        <Button type="primary" htmlType="submit">
                          Xác nhận thiết lập
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
              )}
              
              <Col xs={24}>
                <Card title="Mã khôi phục khẩn cấp" bordered={false}>
                  <Alert
                    message="Lưu trữ mã khôi phục ở nơi an toàn"
                    description="Nếu bạn mất thiết bị đã đăng ký xác thực hai lớp, bạn sẽ cần các mã khôi phục này để truy cập vào tài khoản của mình."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  
                  {twoFactorEnabled ? (
                    <div>
                      <Row gutter={[16, 16]}>
                        {['ABCD-EFGH-IJKL', 'MNOP-QRST-UVWX', 'YZAB-CDEF-GHIJ', 'KLMN-OPQR-STUV', 'WXYZ-1234-5678'].map((code, index) => (
                          <Col span={8} key={index}>
                            <Card size="small">
                              <Text code>{code}</Text>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                      <div style={{ marginTop: 16 }}>
                        <Button type="default" icon={<DownloadOutlined />}>
                          Tải xuống mã khôi phục
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Empty description="Mã khôi phục sẽ được tạo khi bạn kích hoạt xác thực hai lớp" />
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <HistoryOutlined /> Quản lý phiên
              </span>
            }
            key="sessions"
          >
            <Card 
              title="Phiên đăng nhập hiện tại" 
              bordered={false}
              extra={
                <Button 
                  danger 
                  onClick={handleTerminateAllSessions}
                  disabled={activeSessions.length <= 1}
                >
                  Kết thúc tất cả phiên khác
                </Button>
              }
            >
              <Paragraph>
                Danh sách các phiên đăng nhập hiện tại trên các thiết bị của bạn. Bạn có thể kết thúc bất kỳ phiên nào nếu phát hiện đáng ngờ.
              </Paragraph>
              
              <Table 
                columns={sessionsColumns} 
                dataSource={activeSessions}
                rowKey="id"
                pagination={false}
              />
              
              <Divider />
              
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="Giới hạn thời gian phiên đăng nhập"
                    tooltip="Phiên đăng nhập sẽ tự động hết hạn sau số ngày đã chọn"
                  >
                    <Select 
                      value={sessionLimitDays} 
                      onChange={setSessionLimitDays}
                      style={{ width: 200 }}
                    >
                      <Option value={1}>1 ngày</Option>
                      <Option value={7}>7 ngày</Option>
                      <Option value={14}>14 ngày</Option>
                      <Option value={30}>30 ngày</Option>
                      <Option value={90}>90 ngày</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Thông báo khi có đăng nhập mới"
                    tooltip="Gửi thông báo qua email khi phát hiện đăng nhập từ thiết bị mới"
                  >
                    <Switch 
                      checked={notifyOnNewLogin} 
                      onChange={setNotifyOnNewLogin}
                      checkedChildren="Bật" 
                      unCheckedChildren="Tắt"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <GlobalOutlined /> Quyền riêng tư & Bảo mật
              </span>
            }
            key="privacy"
          >
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card title="Địa chỉ IP bị chặn" bordered={false}>
                  <Table 
                    columns={blockedIPsColumns} 
                    dataSource={blockedIPs}
                    rowKey="id"
                    pagination={false}
                  />
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="Cài đặt quyền riêng tư" bordered={false}>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      {
                        title: 'Nhật ký hoạt động',
                        description: 'Lưu trữ thông tin về các hoạt động của bạn trong hệ thống',
                        defaultValue: true
                      },
                      {
                        title: 'Dữ liệu vị trí',
                        description: 'Thu thập thông tin về vị trí đăng nhập',
                        defaultValue: true
                      },
                      {
                        title: 'Thông tin thiết bị',
                        description: 'Thu thập thông tin về thiết bị đăng nhập',
                        defaultValue: true
                      },
                      {
                        title: 'Cookie phân tích',
                        description: 'Cho phép sử dụng cookie để phân tích hành vi sử dụng',
                        defaultValue: false
                      }
                    ]}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Switch defaultChecked={item.defaultValue} checkedChildren="Bật" unCheckedChildren="Tắt" />
                        ]}
                      >
                        <List.Item.Meta
                          title={item.title}
                          description={item.description}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <BellOutlined /> Nhật ký bảo mật
              </span>
            }
            key="logs"
          >
            <Card title="Nhật ký bảo mật gần đây" bordered={false}>
              <Table 
                columns={securityLogsColumns} 
                dataSource={securityLogs}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
            
            <div style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Thống kê hoạt động" bordered={false}>
                    <Descriptions column={1}>
                      <Descriptions.Item label="Tổng số đăng nhập thành công">
                        45
                      </Descriptions.Item>
                      <Descriptions.Item label="Tổng số đăng nhập thất bại">
                        3
                      </Descriptions.Item>
                      <Descriptions.Item label="Đăng nhập từ thiết bị lạ">
                        2
                      </Descriptions.Item>
                      <Descriptions.Item label="Thay đổi mật khẩu gần đây">
                        {dayjs().subtract(10, 'days').format('DD/MM/YYYY')}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Hoạt động đáng chú ý" bordered={false}>
                    <Timeline>
                      <Timeline.Item color="red">
                        <p><strong>Đăng nhập thất bại</strong> - từ IP lạ (45.23.126.42)</p>
                        <p><small>2023-09-02 09:15:40</small></p>
                      </Timeline.Item>
                      <Timeline.Item color="orange">
                        <p><strong>Nhiều lần đăng nhập thất bại</strong> - từ IP 192.168.1.100</p>
                        <p><small>2023-08-15 14:30:22</small></p>
                      </Timeline.Item>
                      <Timeline.Item color="green">
                        <p><strong>Thiết lập xác thực hai lớp</strong> thành công</p>
                        <p><small>2023-08-25 11:10:15</small></p>
                      </Timeline.Item>
                    </Timeline>
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SecuritySettings;
