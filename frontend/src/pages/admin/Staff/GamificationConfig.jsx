import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  Switch,
  Typography,
  Row,
  Col,
  Slider,
  InputNumber,
  Space,
  Table,
  Tag,
  Tooltip,
  Divider,
  Badge,
  Alert,
  Modal,
  message
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  RiseOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TeamOutlined,
  SaveOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Sample achievement data
const achievementsData = [
  {
    id: 1,
    name: 'Sales Rookie',
    description: 'Complete first 10 sales',
    pointsAwarded: 100,
    badgeImage: '🌟',
    criteria: 'sales_count >= 10',
    difficulty: 'easy',
    status: 'active'
  },
  {
    id: 2,
    name: 'Tech Wizard',
    description: 'Successfully resolve 50 technical issues',
    pointsAwarded: 250,
    badgeImage: '🔧',
    criteria: 'tech_issues_resolved >= 50',
    difficulty: 'medium',
    status: 'active'
  },
  {
    id: 3,
    name: 'Customer Champion',
    description: 'Receive 20 five-star customer ratings',
    pointsAwarded: 300,
    badgeImage: '⭐',
    criteria: 'five_star_ratings >= 20',
    difficulty: 'medium',
    status: 'active'
  },
  {
    id: 4,
    name: 'Sales Master',
    description: 'Achieve 100 million VND in sales within a month',
    pointsAwarded: 500,
    badgeImage: '🏆',
    criteria: 'monthly_sales >= 100000000',
    difficulty: 'hard',
    status: 'active'
  },
  {
    id: 5,
    name: 'Team Player',
    description: 'Help 10 colleagues with their tasks',
    pointsAwarded: 150,
    badgeImage: '🤝',
    criteria: 'colleague_assists >= 10',
    difficulty: 'easy',
    status: 'inactive'
  }
];

// Sample reward data
const rewardsData = [
  {
    id: 1,
    name: 'Extra Day Off',
    description: 'Get an additional day of paid leave',
    pointsCost: 1000,
    category: 'time_off',
    availability: 'unlimited',
    status: 'active'
  },
  {
    id: 2,
    name: 'Lunch Voucher',
    description: '200,000 VND voucher for lunch',
    pointsCost: 500,
    category: 'voucher',
    availability: '20',
    status: 'active'
  },
  {
    id: 3,
    name: 'Training Course',
    description: 'Access to premium online training course',
    pointsCost: 800,
    category: 'learning',
    availability: '10',
    status: 'active'
  },
  {
    id: 4,
    name: 'Team Dinner',
    description: 'Dinner treat for your team (up to 5 people)',
    pointsCost: 1500,
    category: 'experience',
    availability: '5',
    status: 'active'
  },
  {
    id: 5,
    name: 'Bonus Payment',
    description: '500,000 VND bonus added to salary',
    pointsCost: 2000,
    category: 'financial',
    availability: 'unlimited',
    status: 'inactive'
  }
];

// Sample level settings
const levelSettingsData = {
  basePoints: 100,
  pointsMultiplier: 1.5,
  maxLevel: 20,
  levelUpNotification: true,
  showLeaderboard: true,
  resetPointsPeriod: 'never'
};

const GamificationConfig = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [achievements, setAchievements] = useState(achievementsData);
  const [rewards, setRewards] = useState(rewardsData);
  const [levelSettings, setLevelSettings] = useState(levelSettingsData);
  
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [currentReward, setCurrentReward] = useState(null);
  
  const [achievementForm] = Form.useForm();
  const [rewardForm] = Form.useForm();
  const [levelForm] = Form.useForm();

  // Handle showing achievement modal
  const showAchievementModal = (achievement = null) => {
    setCurrentAchievement(achievement);
    
    if (achievement) {
      achievementForm.setFieldsValue({
        name: achievement.name,
        description: achievement.description,
        pointsAwarded: achievement.pointsAwarded,
        badgeImage: achievement.badgeImage,
        criteria: achievement.criteria,
        difficulty: achievement.difficulty,
        status: achievement.status === 'active'
      });
    } else {
      achievementForm.resetFields();
      achievementForm.setFieldsValue({
        status: true,
        difficulty: 'medium',
        pointsAwarded: 100
      });
    }
    
    setAchievementModalVisible(true);
  };

  // Handle achievement form submission
  const handleAchievementSubmit = () => {
    achievementForm.validateFields()
      .then(values => {
        const formData = {
          ...values,
          status: values.status ? 'active' : 'inactive'
        };
        
        if (currentAchievement) {
          // Update existing achievement
          const updatedAchievements = achievements.map(item => 
            item.id === currentAchievement.id ? { ...item, ...formData } : item
          );
          setAchievements(updatedAchievements);
          message.success('Achievement updated successfully');
        } else {
          // Add new achievement
          const newAchievement = {
            id: achievements.length + 1,
            ...formData
          };
          setAchievements([...achievements, newAchievement]);
          message.success('Achievement added successfully');
        }
        
        setAchievementModalVisible(false);
      })
      .catch(error => {
        console.log('Validation error:', error);
      });
  };

  // Handle showing reward modal
  const showRewardModal = (reward = null) => {
    setCurrentReward(reward);
    
    if (reward) {
      rewardForm.setFieldsValue({
        name: reward.name,
        description: reward.description,
        pointsCost: reward.pointsCost,
        category: reward.category,
        availability: reward.availability,
        status: reward.status === 'active'
      });
    } else {
      rewardForm.resetFields();
      rewardForm.setFieldsValue({
        status: true,
        category: 'voucher',
        availability: 'unlimited'
      });
    }
    
    setRewardModalVisible(true);
  };

  // Handle reward form submission
  const handleRewardSubmit = () => {
    rewardForm.validateFields()
      .then(values => {
        const formData = {
          ...values,
          status: values.status ? 'active' : 'inactive'
        };
        
        if (currentReward) {
          // Update existing reward
          const updatedRewards = rewards.map(item => 
            item.id === currentReward.id ? { ...item, ...formData } : item
          );
          setRewards(updatedRewards);
          message.success('Reward updated successfully');
        } else {
          // Add new reward
          const newReward = {
            id: rewards.length + 1,
            ...formData
          };
          setRewards([...rewards, newReward]);
          message.success('Reward added successfully');
        }
        
        setRewardModalVisible(false);
      })
      .catch(error => {
        console.log('Validation error:', error);
      });
  };

  // Handle level settings submission
  const handleLevelSettingsSubmit = (values) => {
    setLevelSettings({
      ...levelSettings,
      ...values
    });
    message.success('Level settings updated successfully');
  };

  // Achievement columns for table
  const achievementColumns = [
    {
      title: 'Badge',
      dataIndex: 'badgeImage',
      key: 'badgeImage',
      render: badge => <span style={{ fontSize: '24px' }}>{badge}</span>
    },
    {
      title: 'Achievement',
      key: 'achievement',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{record.description}</div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Points',
      dataIndex: 'pointsAwarded',
      key: 'pointsAwarded',
      sorter: (a, b) => a.pointsAwarded - b.pointsAwarded
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: difficulty => {
        const color = 
          difficulty === 'easy' ? 'green' : 
          difficulty === 'medium' ? 'blue' : 'red';
        
        return <Tag color={color}>{difficulty.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Easy', value: 'easy' },
        { text: 'Medium', value: 'medium' },
        { text: 'Hard', value: 'hard' }
      ],
      onFilter: (value, record) => record.difficulty === value
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        status === 'active' ? 
          <Badge status="success" text="Active" /> : 
          <Badge status="error" text="Inactive" />
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showAchievementModal(record)} 
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setAchievements(achievements.filter(item => item.id !== record.id));
                message.success('Achievement deleted');
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Reward columns for table
  const rewardColumns = [
    {
      title: 'Reward',
      key: 'reward',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{record.description}</div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Points Cost',
      dataIndex: 'pointsCost',
      key: 'pointsCost',
      sorter: (a, b) => a.pointsCost - b.pointsCost
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: category => {
        const categoryMap = {
          'time_off': { color: 'purple', icon: '🕒' },
          'voucher': { color: 'green', icon: '🎫' },
          'learning': { color: 'blue', icon: '📚' },
          'experience': { color: 'magenta', icon: '🎭' },
          'financial': { color: 'gold', icon: '💰' }
        };
        
        return (
          <Tag color={categoryMap[category]?.color || 'default'}>
            {categoryMap[category]?.icon} {category.replace('_', ' ')}
          </Tag>
        );
      },
      filters: [
        { text: 'Time Off', value: 'time_off' },
        { text: 'Voucher', value: 'voucher' },
        { text: 'Learning', value: 'learning' },
        { text: 'Experience', value: 'experience' },
        { text: 'Financial', value: 'financial' }
      ],
      onFilter: (value, record) => record.category === value
    },
    {
      title: 'Availability',
      dataIndex: 'availability',
      key: 'availability',
      render: availability => (
        availability === 'unlimited' ? 
          <Tag color="green">Unlimited</Tag> : 
          <span>{availability} remaining</span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        status === 'active' ? 
          <Badge status="success" text="Active" /> : 
          <Badge status="error" text="Inactive" />
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showRewardModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setRewards(rewards.filter(item => item.id !== record.id));
                message.success('Reward deleted');
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="gamification-config-page">
      <h1>Gamification Configuration</h1>
      
      <Card>
        <Tabs defaultActiveKey="1" onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <TrophyOutlined /> Achievements
              </span>
            }
            key="1"
          >
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={4}>Configure Achievements</Title>
                <Text type="secondary">
                  Create and manage achievements that staff can earn through various activities
                </Text>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => showAchievementModal()}
                >
                  Create Achievement
                </Button>
              </Col>
            </Row>
            
            <Table
              dataSource={achievements}
              rowKey="id"
              columns={achievementColumns}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <StarOutlined /> Rewards
              </span>
            }
            key="2"
          >
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={4}>Rewards System</Title>
                <Text type="secondary">
                  Configure rewards that staff can redeem with their earned points
                </Text>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => showRewardModal()}
                >
                  Add Reward
                </Button>
              </Col>
            </Row>
            
            <Table
              dataSource={rewards}
              rowKey="id"
              columns={rewardColumns}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <SettingOutlined /> Level Settings
              </span>
            }
            key="3"
          >
            <Row>
              <Col span={16}>
                <Form
                  layout="vertical"
                  form={levelForm}
                  initialValues={levelSettings}
                  onFinish={handleLevelSettingsSubmit}
                >
                  <Title level={4}>Level System Configuration</Title>
                  <Paragraph type="secondary">
                    Configure how the leveling system works and point calculations
                  </Paragraph>
                  
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        label="Base Points for Level 1"
                        name="basePoints"
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item
                        label="Points Multiplier per Level"
                        name="pointsMultiplier"
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <InputNumber min={1} step={0.1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        label="Maximum Level"
                        name="maxLevel"
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <InputNumber min={5} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item
                        label="Reset Points Period"
                        name="resetPointsPeriod"
                      >
                        <Select>
                          <Option value="never">Never</Option>
                          <Option value="monthly">Monthly</Option>
                          <Option value="quarterly">Quarterly</Option>
                          <Option value="yearly">Yearly</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        name="levelUpNotification"
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="Level-up Notifications Enabled" unCheckedChildren="Notifications Disabled" />
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item
                        name="showLeaderboard"
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="Public Leaderboard Enabled" unCheckedChildren="Leaderboard Disabled" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Divider />
                  
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    Save Settings
                  </Button>
                </Form>
              </Col>
              <Col span={8}>
                <Card title="Leaderboard Settings">
                  <Form layout="vertical">
                    <Form.Item label="Leaderboard Type" name="leaderboard-type">
                      <Select defaultValue="sales">
                        <Option value="sales">Sales Performance</Option>
                        <Option value="customer">Customer Satisfaction</Option>
                        <Option value="points">Total Points</Option>
                        <Option value="achievements">Achievements</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item label="Time Period" name="time-period">
                      <Select defaultValue="weekly">
                        <Option value="daily">Daily</Option>
                        <Option value="weekly">Weekly</Option>
                        <Option value="monthly">Monthly</Option>
                        <Option value="quarterly">Quarterly</Option>
                        <Option value="yearly">Yearly</Option>
                        <Option value="all_time">All Time</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item label="Top Performers to Display" name="top-performers">
                      <InputNumber min={3} max={100} defaultValue={10} style={{ width: '100%' }} />
                    </Form.Item>
                    
                    <Button type="primary" icon={<SaveOutlined />}>
                      Save Settings
                    </Button>
                  </Form>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Achievement Modal */}
      <Modal
        title={currentAchievement ? "Edit Achievement" : "Create Achievement"}
        visible={achievementModalVisible}
        onCancel={() => setAchievementModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAchievementModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleAchievementSubmit}>
            Save Achievement
          </Button>
        ]}
        width={700}
      >
        <Form
          form={achievementForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                label="Achievement Name"
                name="name"
                rules={[{ required: true, message: 'Please enter achievement name' }]}
              >
                <Input placeholder="e.g. Sales Master" />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                label="Badge Image"
                name="badgeImage"
              >
                <Input placeholder="Emoji or URL" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea placeholder="Describe what the achievement represents" rows={3} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Points"
                name="pointsAwarded"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="50" />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                label="Difficulty"
                name="difficulty"
              >
                <Select>
                  <Option value="easy">Easy</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="hard">Hard</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                label="Active"
                name="status"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label={
              <span>
                Achievement Criteria 
                <Tooltip title="The condition that needs to be met to earn this achievement">
                  <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
            name="criteria"
            rules={[{ required: true, message: 'Please define criteria' }]}
          >
            <Input placeholder="e.g. sales_count >= 10" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Criteria Type" name="criteria-type">
                <Select placeholder="Select criteria type">
                  <Option value="sales-target">Sales Target</Option>
                  <Option value="customer-ratings">Customer Ratings</Option>
                  <Option value="login-streak">Login Streak</Option>
                  <Option value="order-count">Order Count</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Criteria Value" name="criteria-value">
                <InputNumber style={{ width: '100%' }} placeholder="Target value" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      
      {/* Reward Modal */}
      <Modal
        title={currentReward ? "Edit Reward" : "Add Reward"}
        visible={rewardModalVisible}
        onCancel={() => setRewardModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRewardModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleRewardSubmit}>
            Save Reward
          </Button>
        ]}
        width={600}
      >
        <Form
          form={rewardForm}
          layout="vertical"
        >
          <Form.Item
            label="Reward Name"
            name="name"
            rules={[{ required: true, message: 'Please enter reward name' }]}
          >
            <Input placeholder="e.g. Extra Day Off" />
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea placeholder="Describe what the reward provides" rows={3} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Points Cost"
                name="pointsCost"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="500" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
              >
                <Select>
                  <Option value="time_off">Time Off</Option>
                  <Option value="voucher">Voucher</Option>
                  <Option value="learning">Learning</Option>
                  <Option value="experience">Experience</Option>
                  <Option value="financial">Financial</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Availability"
                name="availability"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="Number or 'unlimited'" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Active"
                name="status"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Reward Type" name="reward-type">
                <Select placeholder="Select reward type">
                  <Option value="cash-bonus">Cash Bonus</Option>
                  <Option value="time-off">Time Off</Option>
                  <Option value="gift-card">Gift Card</Option>
                  <Option value="experience">Experience</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Reward Value" name="reward-value">
                <InputNumber style={{ width: '100%' }} placeholder="Value (if applicable)" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default GamificationConfig; 