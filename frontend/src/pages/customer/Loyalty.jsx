import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Table, 
  Tag, 
  Button, 
  Tabs, 
  Spin, 
  Empty, 
  List,
  Avatar,
  Divider,
  Modal,
  Form,
  Input,
  message,
  Tooltip,
  Alert
} from 'antd';
import { 
  TrophyOutlined, 
  GiftOutlined, 
  HistoryOutlined, 
  RiseOutlined, 
  CrownOutlined,
  ShoppingOutlined,
  QuestionCircleOutlined,
  StarOutlined,
  StarFilled,
  UpOutlined
} from '@ant-design/icons';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Loyalty = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [form] = Form.useForm();

  // Define membership tiers
  const membershipTiers = {
    Bronze: {
      minPoints: 0,
      maxPoints: 999,
      color: '#CD7F32',
      benefits: [
        'Tích điểm 3% trên mỗi đơn hàng',
        'Ưu đãi sinh nhật',
        'Thông báo khuyến mãi sớm'
      ]
    },
    Silver: {
      minPoints: 1000,
      maxPoints: 4999,
      color: '#C0C0C0',
      benefits: [
        'Tích điểm 5% trên mỗi đơn hàng',
        'Ưu đãi sinh nhật đặc biệt',
        'Thông báo khuyến mãi sớm',
        'Bảo hành ưu tiên',
        'Quà tặng hàng quý'
      ]
    },
    Gold: {
      minPoints: 5000,
      maxPoints: 9999,
      color: '#FFD700',
      benefits: [
        'Tích điểm 7% trên mỗi đơn hàng',
        'Ưu đãi sinh nhật VIP',
        'Thông báo khuyến mãi sớm',
        'Bảo hành ưu tiên cao cấp',
        'Quà tặng hàng tháng',
        'Tư vấn kỹ thuật riêng',
        'Giao hàng miễn phí'
      ]
    },
    Platinum: {
      minPoints: 10000,
      maxPoints: Infinity,
      color: '#E5E4E2',
      benefits: [
        'Tích điểm 10% trên mỗi đơn hàng',
        'Ưu đãi sinh nhật đặc biệt',
        'Thông báo khuyến mãi sớm nhất',
        'Bảo hành VIP',
        'Quà tặng hàng tháng cao cấp',
        'Tư vấn kỹ thuật riêng 24/7',
        'Giao hàng miễn phí',
        'Hỗ trợ kỹ thuật tận nhà',
        'Sự kiện VIP độc quyền'
      ]
    }
  };

  // Calculate current tier and next tier
  const calculateTierInfo = (points) => {
    let currentTier = 'Bronze';
    let nextTier = 'Silver';
    let progress = 0;
    
    if (points >= membershipTiers.Platinum.minPoints) {
      currentTier = 'Platinum';
      nextTier = null;
      progress = 100;
    } else if (points >= membershipTiers.Gold.minPoints) {
      currentTier = 'Gold';
      nextTier = 'Platinum';
      progress = ((points - membershipTiers.Gold.minPoints) / 
                 (membershipTiers.Platinum.minPoints - membershipTiers.Gold.minPoints)) * 100;
    } else if (points >= membershipTiers.Silver.minPoints) {
      currentTier = 'Silver';
      nextTier = 'Gold';
      progress = ((points - membershipTiers.Silver.minPoints) / 
                 (membershipTiers.Gold.minPoints - membershipTiers.Silver.minPoints)) * 100;
    } else {
      progress = (points / membershipTiers.Silver.minPoints) * 100;
    }
    
    return {
      currentTier,
      nextTier,
      progress: Math.min(100, Math.max(0, progress)),
      pointsToNext: nextTier ? membershipTiers[nextTier].minPoints - points : 0
    };
  };

  // Fetch loyalty data
  useEffect(() => {
    const fetchLoyaltyData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockPointsHistory = [
          {
            id: 'PH001',
            date: '2023-11-05',
            description: 'Mua hàng #ORD-2023-004',
            points: 50,
            type: 'earn',
          },
          {
            id: 'PH002',
            date: '2023-09-10',
            description: 'Mua hàng #ORD-2023-003',
            points: 160,
            type: 'earn',
          },
          {
            id: 'PH003',
            date: '2023-08-15',
            description: 'Đổi điểm lấy voucher giảm giá 100,000đ',
            points: -100,
            type: 'redeem',
          },
          {
            id: 'PH004',
            date: '2023-07-22',
            description: 'Mua hàng #ORD-2023-002',
            points: 90,
            type: 'earn',
          },
          {
            id: 'PH005',
            date: '2023-06-15',
            description: 'Mua hàng #ORD-2023-001',
            points: 125,
            type: 'earn',
          },
          {
            id: 'PH006',
            date: '2023-05-20',
            description: 'Điểm thưởng thành viên mới',
            points: 50,
            type: 'bonus',
          },
        ];
        
        const mockRewards = [
          {
            id: 'RW001',
            title: 'Voucher giảm giá 50,000đ',
            points: 50,
            description: 'Áp dụng cho đơn hàng từ 500,000đ',
            expiryDays: 30,
            type: 'voucher',
            image: 'https://via.placeholder.com/100',
          },
          {
            id: 'RW002',
            title: 'Voucher giảm giá 100,000đ',
            points: 100,
            description: 'Áp dụng cho đơn hàng từ 1,000,000đ',
            expiryDays: 30,
            type: 'voucher',
            image: 'https://via.placeholder.com/100',
          },
          {
            id: 'RW003',
            title: 'Voucher giảm giá 250,000đ',
            points: 200,
            description: 'Áp dụng cho đơn hàng từ 2,000,000đ',
            expiryDays: 45,
            type: 'voucher',
            image: 'https://via.placeholder.com/100',
          },
          {
            id: 'RW004',
            title: 'Bảo hành mở rộng 6 tháng',
            points: 300,
            description: 'Áp dụng cho 1 sản phẩm bất kỳ',
            expiryDays: 60,
            type: 'warranty',
            image: 'https://via.placeholder.com/100',
          },
          {
            id: 'RW005',
            title: 'Gói vệ sinh laptop miễn phí',
            points: 150,
            description: 'Vệ sinh toàn diện laptop',
            expiryDays: 60,
            type: 'service',
            image: 'https://via.placeholder.com/100',
          },
        ];
        
        setPointsHistory(mockPointsHistory);
        setAvailableRewards(mockRewards);
      } catch (error) {
        console.error('Error fetching loyalty data:', error);
        message.error('Không thể tải thông tin điểm thưởng');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoyaltyData();
  }, []);

  // Handle reward redemption
  const handleRedeemReward = async (values) => {
    setRedeemLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPoints = (user.loyaltyPoints || 0) - selectedReward.points;
      
      // Update user points
      updateUser({
        loyaltyPoints: newPoints
      });
      
      // Add to points history
      const newHistory = {
        id: `PH00${pointsHistory.length + 1}`,
        date: dayjs().format('YYYY-MM-DD'),
        description: `Đổi điểm lấy ${selectedReward.title}`,
        points: -selectedReward.points,
        type: 'redeem',
      };
      
      setPointsHistory([newHistory, ...pointsHistory]);
      
      message.success(`Đổi điểm thành công! Bạn đã nhận được ${selectedReward.title}`);
      setRedeemModalVisible(false);
      form.resetFields();
      
    } catch (error) {
      console.error('Error redeeming reward:', error);
      message.error('Không thể đổi điểm thưởng');
    } finally {
      setRedeemLoading(false);
    }
  };

  // Points history columns
  const historyColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: date => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hoạt động',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: type => {
        let color = 'green';
        let text = 'Tích điểm';
        let icon = <RiseOutlined />;
        
        if (type === 'redeem') {
          color = 'blue';
          text = 'Đổi điểm';
          icon = <GiftOutlined />;
        } else if (type === 'bonus') {
          color = 'gold';
          text = 'Thưởng';
          icon = <TrophyOutlined />;
        }
        
        return <Tag color={color} icon={icon}>{text}</Tag>;
      },
    },
    {
      title: 'Điểm',
      dataIndex: 'points',
      key: 'points',
      render: points => {
        const isPositive = points > 0;
        return (
          <Text style={{ color: isPositive ? '#52c41a' : '#1890ff' }}>
            {isPositive ? '+' : ''}{points}
          </Text>
        );
      },
    },
  ];

  const tierInfo = calculateTierInfo(user?.loyaltyPoints || 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
        <Text className="ml-2">Đang tải thông tin điểm thưởng...</Text>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Title level={2}>Điểm thưởng & Đặc quyền</Title>
      
      <Card className="mb-6">
        <Row gutter={24} align="middle">
          <Col xs={24} md={8} className="text-center">
            <div style={{ marginBottom: '16px' }}>
              <Avatar 
                size={80} 
                icon={<CrownOutlined />} 
                style={{ backgroundColor: membershipTiers[tierInfo.currentTier].color }}
              />
            </div>
            <Title level={3}>{tierInfo.currentTier}</Title>
            <Text>Thành viên từ {dayjs(user?.memberSince).format('DD/MM/YYYY')}</Text>
          </Col>
          
          <Col xs={24} md={16}>
            <Statistic 
              title="Điểm thưởng hiện tại" 
              value={user?.loyaltyPoints || 0} 
              prefix={<TrophyOutlined />} 
              valueStyle={{ color: '#722ed1' }}
            />
            
            {tierInfo.nextTier && (
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <Text>{tierInfo.currentTier}</Text>
                  <Text>{tierInfo.nextTier}</Text>
                </div>
                <Progress 
                  percent={tierInfo.progress} 
                  status="active" 
                  strokeColor={membershipTiers[tierInfo.nextTier].color}
                />
                <Text type="secondary">
                  Cần thêm <Text strong>{tierInfo.pointsToNext}</Text> điểm để đạt hạng {tierInfo.nextTier}
                </Text>
              </div>
            )}
          </Col>
        </Row>
      </Card>
      
      <Tabs defaultActiveKey="rewards">
        <TabPane 
          tab={
            <span>
              <GiftOutlined />
              Đổi điểm thưởng
            </span>
          } 
          key="rewards"
        >
          <Card>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
              dataSource={availableRewards}
              renderItem={item => (
                <List.Item>
                  <Card
                    hoverable
                    cover={<img alt={item.title} src={item.image} />}
                    actions={[
                      <Button 
                        type="primary" 
                        disabled={user?.loyaltyPoints < item.points}
                        onClick={() => {
                          setSelectedReward(item);
                          setRedeemModalVisible(true);
                        }}
                      >
                        Đổi {item.points} điểm
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={item.title}
                      description={
                        <>
                          <Text>{item.description}</Text>
                          <div className="mt-2">
                            <Tag color="purple" icon={<TrophyOutlined />}>
                              {item.points} điểm
                            </Tag>
                          </div>
                        </>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <HistoryOutlined />
              Lịch sử điểm
            </span>
          } 
          key="history"
        >
          <Card>
            <Table 
              columns={historyColumns} 
              dataSource={pointsHistory}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <CrownOutlined />
              Đặc quyền thành viên
            </span>
          } 
          key="benefits"
        >
          <Card>
            <Title level={4}>Đặc quyền thành viên {tierInfo.currentTier}</Title>
            
            <List
              itemLayout="horizontal"
              dataSource={membershipTiers[tierInfo.currentTier].benefits}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<StarFilled style={{ color: membershipTiers[tierInfo.currentTier].color, fontSize: '20px' }} />}
                    title={item}
                  />
                </List.Item>
              )}
            />
            
            {tierInfo.nextTier && (
              <>
                <Divider />
                <Title level={4}>
                  Đặc quyền tiếp theo ở hạng {tierInfo.nextTier}
                  <Tooltip title={`Cần thêm ${tierInfo.pointsToNext} điểm`}>
                    <QuestionCircleOutlined style={{ fontSize: '16px', marginLeft: '8px' }} />
                  </Tooltip>
                </Title>
                
                <List
                  itemLayout="horizontal"
                  dataSource={membershipTiers[tierInfo.nextTier].benefits.filter(
                    benefit => !membershipTiers[tierInfo.currentTier].benefits.includes(benefit)
                  )}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<StarOutlined style={{ color: '#d9d9d9', fontSize: '20px' }} />}
                        title={<Text type="secondary">{item}</Text>}
                      />
                    </List.Item>
                  )}
                />
              </>
            )}
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <QuestionCircleOutlined />
              Cách tích điểm
            </span>
          } 
          key="howto"
        >
          <Card>
            <Title level={4}>Cách tích điểm</Title>
            
            <List>
              <List.Item>
                <List.Item.Meta
                  avatar={<ShoppingOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                  title="Mua sắm tại cửa hàng"
                  description={`Tích điểm ${membershipTiers[tierInfo.currentTier].benefits[0].replace('Tích điểm ', '')}`}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<RiseOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
                  title="Viết đánh giá sản phẩm"
                  description="Nhận 5 điểm cho mỗi đánh giá có ích"
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<TrophyOutlined style={{ fontSize: '24px', color: '#faad14' }} />}
                  title="Giới thiệu bạn bè"
                  description="Nhận 50 điểm cho mỗi người bạn mua sắm thành công"
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<UpOutlined style={{ fontSize: '24px', color: '#722ed1' }} />}
                  title="Nâng cấp thành viên"
                  description="Nhận thêm điểm thưởng khi đạt hạng thành viên cao hơn"
                />
              </List.Item>
            </List>
            
            <Divider />
            
            <Title level={4}>Quy định chung</Title>
            <Paragraph>
              <ul>
                <li>Điểm thưởng có giá trị trong vòng 12 tháng kể từ ngày tích lũy</li>
                <li>Mỗi 1,000đ chi tiêu sẽ được tích lũy điểm theo cấp thành viên</li>
                <li>Điểm thưởng không được chuyển nhượng cho người khác</li>
                <li>Cấp thành viên được đánh giá lại vào ngày 1 hàng tháng</li>
                <li>Chương trình có thể thay đổi theo chính sách của cửa hàng</li>
              </ul>
            </Paragraph>
          </Card>
        </TabPane>
      </Tabs>
      
      {/* Redeem Modal */}
      <Modal
        title="Xác nhận đổi điểm"
        visible={redeemModalVisible}
        onCancel={() => setRedeemModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        {selectedReward && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleRedeemReward}
          >
            <div className="text-center mb-4">
              <img 
                src={selectedReward.image} 
                alt={selectedReward.title} 
                style={{ width: '100px', height: '100px', margin: '0 auto' }}
              />
              <Title level={4} className="mt-2">{selectedReward.title}</Title>
              <Text>{selectedReward.description}</Text>
              
              <div className="mt-2">
                <Tag color="purple" icon={<TrophyOutlined />}>
                  {selectedReward.points} điểm
                </Tag>
              </div>
            </div>
            
            <Alert
              message="Thông tin đổi điểm"
              description={
                <>
                  <div>Điểm hiện tại: <Text strong>{user?.loyaltyPoints || 0}</Text></div>
                  <div>Điểm sẽ dùng: <Text strong style={{ color: '#1890ff' }}>-{selectedReward.points}</Text></div>
                  <div>Điểm còn lại: <Text strong>{(user?.loyaltyPoints || 0) - selectedReward.points}</Text></div>
                  <div>Hạn sử dụng: <Text strong>{selectedReward.expiryDays} ngày</Text> kể từ ngày đổi</div>
                </>
              }
              type="info"
              showIcon
              className="mb-4"
            />
            
            {selectedReward.type === 'voucher' && (
              <Form.Item
                name="email"
                label="Email nhận voucher"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
                initialValue={user?.email}
              >
                <Input placeholder="Email nhận voucher" />
              </Form.Item>
            )}
            
            <div className="flex justify-end">
              <Button 
                className="mr-2" 
                onClick={() => setRedeemModalVisible(false)}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={redeemLoading}
                disabled={(user?.loyaltyPoints || 0) < selectedReward.points}
              >
                Xác nhận đổi điểm
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Loyalty; 