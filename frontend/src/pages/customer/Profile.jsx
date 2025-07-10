import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Avatar, 
  Descriptions, 
  Button, 
  Form, 
  Input, 
  Divider, 
  Tabs, 
  Table, 
  Tag, 
  Spin, 
  message, 
  Row, 
  Col,
  Statistic
} from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  EditOutlined, 
  SaveOutlined, 
  TrophyOutlined,
  ShoppingOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user, form]);

  // Fetch purchase history
  useEffect(() => {
    if (user) {
      fetchPurchaseHistory();
    }
  }, [user]);

  const fetchPurchaseHistory = async () => {
    setHistoryLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockHistory = [
        {
          id: 'ORD-2023-001',
          date: '2023-06-15',
          total: 2500000,
          status: 'completed',
          items: 3,
        },
        {
          id: 'ORD-2023-002',
          date: '2023-07-22',
          total: 1800000,
          status: 'completed',
          items: 2,
        },
        {
          id: 'ORD-2023-003',
          date: '2023-09-10',
          total: 3200000,
          status: 'completed',
          items: 4,
        },
        {
          id: 'ORD-2023-004',
          date: '2023-11-05',
          total: 950000,
          status: 'completed',
          items: 1,
        },
      ];
      
      setPurchaseHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      message.error('Không thể tải lịch sử mua hàng');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to update the user profile
      // For now, we'll simulate a delay and update the local state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user in context
      updateUser({
        ...values
      });
      
      message.success('Cập nhật thông tin thành công!');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  // Purchase history columns
  const historyColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Ngày mua',
      dataIndex: 'date',
      key: 'date',
      render: date => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Số lượng sản phẩm',
      dataIndex: 'items',
      key: 'items',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: amount => `${amount.toLocaleString('vi-VN')} ₫`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'green';
        let text = 'Hoàn thành';
        
        if (status === 'pending') {
          color = 'orange';
          text = 'Đang xử lý';
        } else if (status === 'cancelled') {
          color = 'red';
          text = 'Đã hủy';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="link" href={`/customer/orders/${record.id}`}>
          Chi tiết
        </Button>
      ),
    },
  ];

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
        <Text className="ml-2">Đang tải thông tin...</Text>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Title level={2}>Hồ sơ cá nhân</Title>
      
      <Tabs defaultActiveKey="profile">
        <TabPane tab="Thông tin cá nhân" key="profile">
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
              <Avatar 
                size={96} 
                icon={<UserOutlined />} 
                className="mb-4 md:mb-0 md:mr-6"
              />
              <div>
                <Title level={3} className="mb-1">{user.name}</Title>
                <Text type="secondary">
                  Thành viên {user.membershipLevel} • Tham gia từ {dayjs(user.memberSince).format('DD/MM/YYYY')}
                </Text>
              </div>
            </div>
            
            <Row gutter={24} className="mb-6">
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Điểm thưởng" 
                  value={user.loyaltyPoints || 0} 
                  prefix={<TrophyOutlined />} 
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Đơn hàng" 
                  value={purchaseHistory.length} 
                  prefix={<ShoppingOutlined />} 
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Sản phẩm đang bảo hành" 
                  value={2} 
                  prefix={<SafetyCertificateOutlined />} 
                />
              </Col>
            </Row>
            
            {!editing ? (
              <>
                <Descriptions 
                  bordered 
                  column={{ xs: 1, sm: 2 }}
                  className="mb-4"
                >
                  <Descriptions.Item label="Họ tên">{user.name}</Descriptions.Item>
                  <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{user.phone || 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">{user.address || 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Cấp thành viên">{user.membershipLevel || 'Standard'}</Descriptions.Item>
                  <Descriptions.Item label="Điểm thưởng">{user.loyaltyPoints || 0} điểm</Descriptions.Item>
                </Descriptions>
                
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={() => setEditing(true)}
                >
                  Chỉnh sửa thông tin
                </Button>
              </>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  name: user.name,
                  email: user.email,
                  phone: user.phone || '',
                  address: user.address || '',
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="name"
                      label="Họ tên"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} disabled />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phone"
                      label="Số điện thoại"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                        { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                      ]}
                    >
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="address"
                      label="Địa chỉ"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                
                <div className="flex justify-end">
                  <Button 
                    className="mr-2" 
                    onClick={() => setEditing(false)}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />} 
                    loading={loading}
                  >
                    Lưu thông tin
                  </Button>
                </div>
              </Form>
            )}
          </Card>
        </TabPane>
        
        <TabPane tab="Lịch sử mua hàng" key="history">
          <Card>
            <Table 
              columns={historyColumns}
              dataSource={purchaseHistory}
              rowKey="id"
              loading={historyLoading}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="Bảo hành" key="warranty">
          <Card>
            <Title level={4}>Sản phẩm đang bảo hành</Title>
            <Table 
              columns={[
                {
                  title: 'Sản phẩm',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Ngày mua',
                  dataIndex: 'purchaseDate',
                  key: 'purchaseDate',
                  render: date => dayjs(date).format('DD/MM/YYYY'),
                },
                {
                  title: 'Thời hạn bảo hành',
                  dataIndex: 'warrantyPeriod',
                  key: 'warrantyPeriod',
                },
                {
                  title: 'Ngày hết hạn',
                  dataIndex: 'expiryDate',
                  key: 'expiryDate',
                  render: date => dayjs(date).format('DD/MM/YYYY'),
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: status => {
                    let color = 'green';
                    let text = 'Còn hạn';
                    
                    if (status === 'expiring') {
                      color = 'orange';
                      text = 'Sắp hết hạn';
                    }
                    
                    return <Tag color={color}>{text}</Tag>;
                  },
                },
              ]}
              dataSource={[
                {
                  key: '1',
                  name: 'Laptop Dell XPS 13',
                  purchaseDate: '2023-06-15',
                  warrantyPeriod: '12 tháng',
                  expiryDate: '2024-06-15',
                  status: 'active',
                },
                {
                  key: '2',
                  name: 'Màn hình Dell U2720Q',
                  purchaseDate: '2023-09-10',
                  warrantyPeriod: '36 tháng',
                  expiryDate: '2026-09-10',
                  status: 'active',
                },
              ]}
              pagination={false}
            />
            
            <Divider />
            
            <Button type="primary" href="/customer/warranty">
              Xem chi tiết bảo hành
            </Button>
          </Card>
        </TabPane>
        
        <TabPane tab="Điểm thưởng" key="loyalty">
          <Card>
            <div className="text-center mb-6">
              <Title level={3}>Điểm thưởng của bạn</Title>
              <div className="flex justify-center items-center">
                <TrophyOutlined style={{ fontSize: '32px', color: '#faad14', marginRight: '8px' }} />
                <Title level={2} style={{ margin: 0 }}>{user.loyaltyPoints || 0}</Title>
              </div>
              <Text type="secondary">Thành viên {user.membershipLevel || 'Standard'}</Text>
            </div>
            
            <Divider />
            
            <Title level={4}>Quyền lợi thành viên {user.membershipLevel}</Title>
            <ul className="pl-6 mb-6">
              <li>Tích điểm 5% trên mỗi đơn hàng</li>
              <li>Ưu đãi sinh nhật đặc biệt</li>
              <li>Bảo hành ưu tiên</li>
              <li>Tham gia các chương trình khuyến mãi đặc biệt</li>
            </ul>
            
            <Title level={4}>Lịch sử điểm thưởng</Title>
            <Table 
              columns={[
                {
                  title: 'Ngày',
                  dataIndex: 'date',
                  key: 'date',
                  render: date => dayjs(date).format('DD/MM/YYYY'),
                },
                {
                  title: 'Hoạt động',
                  dataIndex: 'activity',
                  key: 'activity',
                },
                {
                  title: 'Điểm',
                  dataIndex: 'points',
                  key: 'points',
                  render: points => {
                    const isPositive = points > 0;
                    return (
                      <Text style={{ color: isPositive ? '#52c41a' : '#f5222d' }}>
                        {isPositive ? '+' : ''}{points}
                      </Text>
                    );
                  },
                },
              ]}
              dataSource={[
                {
                  key: '1',
                  date: '2023-11-05',
                  activity: 'Mua hàng #ORD-2023-004',
                  points: 50,
                },
                {
                  key: '2',
                  date: '2023-09-10',
                  activity: 'Mua hàng #ORD-2023-003',
                  points: 160,
                },
                {
                  key: '3',
                  date: '2023-07-22',
                  activity: 'Mua hàng #ORD-2023-002',
                  points: 90,
                },
                {
                  key: '4',
                  date: '2023-06-15',
                  activity: 'Mua hàng #ORD-2023-001',
                  points: 125,
                },
                {
                  key: '5',
                  date: '2023-08-15',
                  activity: 'Đổi điểm lấy voucher giảm giá',
                  points: -100,
                },
              ]}
              pagination={false}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Profile; 