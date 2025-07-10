import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tabs,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Avatar,
  Input,
  Select,
  DatePicker,
  Badge,
  Tooltip,
  Divider,
  Modal,
  Dropdown,
  Menu,
  message
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
  RiseOutlined,
  BarChartOutlined,
  StarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SyncOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  BellOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Column } from '@ant-design/plots';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * Main Staff page component
 * Provides staff management, performance tracking, and gamification features
 */
const Staff = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [staffStats, setStaffStats] = useState({
    total: 0,
    active: 0,
    new: 0,
    inactive: 0,
    topPerformers: 0,
    avgPerformance: 0
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [timeframeFilter, setTimeframeFilter] = useState('month');
  
  // Load staff data
  useEffect(() => {
    fetchStaffData();
  }, []);
  
  // Filter staff based on search and filters
  useEffect(() => {
    if (!staffData.length) return;
    
    let result = [...staffData];
    
    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(staff => 
        staff.name.toLowerCase().includes(searchLower) ||
        staff.role.toLowerCase().includes(searchLower) ||
        staff.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply department filter
    if (departmentFilter !== 'all') {
      result = result.filter(staff => staff.department === departmentFilter);
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(staff => staff.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(staff => staff.status === statusFilter);
    }
    
    setFilteredStaff(result);
  }, [staffData, searchText, departmentFilter, roleFilter, statusFilter]);
  
  // Fetch staff data from API (mock data for now)
  const fetchStaffData = async () => {
    setLoading(true);
    try {
      // In a real implementation, call your API
      // const response = await api.get('/staff');
      // const data = response.data;
      
      // For now, we'll use mock data
      setTimeout(() => {
        const mockData = generateMockStaff();
        setStaffData(mockData);
        setFilteredStaff(mockData);
        
        // Calculate staff statistics
        const stats = {
          total: mockData.length,
          active: mockData.filter(s => s.status === 'active').length,
          new: mockData.filter(s => dayjs(s.joinDate).isAfter(dayjs().subtract(30, 'day'))).length,
          inactive: mockData.filter(s => s.status === 'inactive').length,
          topPerformers: mockData.filter(s => s.performanceScore >= 90).length,
          avgPerformance: Math.round(mockData.reduce((sum, staff) => sum + staff.performanceScore, 0) / mockData.length)
        };
        
        setStaffStats(stats);
        
        // Generate performance chart data
        const perfData = generatePerformanceData();
        setPerformanceData(perfData);
        
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error fetching staff data:", error);
      message.error("Could not load staff data");
      setLoading(false);
    }
  };
  
  // Generate mock staff data
  const generateMockStaff = () => {
    const roles = ['Manager', 'Cashier', 'Sales Associate', 'Inventory Specialist', 'Technical Support'];
    const departments = ['Sales', 'Operations', 'Technical', 'Customer Service', 'Administration'];
    const statuses = ['active', 'inactive'];
    
    const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Đặng', 'Bùi'];
    const lastNames = ['Văn', 'Thị', 'Minh', 'Quang', 'Thanh', 'Hữu', 'Ngọc', 'Đức', 'Tuấn', 'Mai'];
    const names = ['An', 'Bình', 'Cường', 'Dũng', 'Em', 'Phương', 'Giang', 'Hà', 'Indra', 'Kim'];
    
    return Array.from({ length: 20 }, (_, i) => {
      const id = i + 1;
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      const fullName = `${firstName} ${lastName} ${name}`;
      
      const email = `${name.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      const role = roles[Math.floor(Math.random() * roles.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const joinDate = dayjs()
        .subtract(Math.floor(Math.random() * 1000), 'day')
        .format('YYYY-MM-DD');
        
      const performanceScore = Math.floor(Math.random() * 30) + 70; // 70-100
      const salesTarget = Math.floor((Math.random() * 20) + 90); // 90-110%
      const attendanceRate = Math.floor((Math.random() * 10) + 90); // 90-100%
      const customerRating = (Math.random() * 2) + 3; // 3-5
      
      const badges = [];
      if (performanceScore >= 95) badges.push('Top Performer');
      if (customerRating >= 4.8) badges.push('Customer Champion');
      if (salesTarget >= 105) badges.push('Target Crusher');
      if (attendanceRate >= 98) badges.push('Punctual Pro');
      
      return {
        id,
        name: fullName,
        email,
        phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
        role,
        department,
        status,
        joinDate,
        performanceScore,
        salesTarget,
        attendanceRate,
        customerRating,
        badges,
        key: id
      };
    });
  };
  
  // Generate performance data for chart
  const generatePerformanceData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = dayjs().month();
    
    // Last 6 months data
    return Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - 5 + i + 12) % 12; // Handle wrapping around the year
      return {
        month: months[monthIndex],
        sales: Math.floor(Math.random() * 10) + 85, // 85-95
        service: Math.floor(Math.random() * 10) + 80, // 80-90
        attendance: Math.floor(Math.random() * 5) + 95 // 95-100
      };
    });
  };
  
  // Calculate performance level text
  const getPerformanceLevel = (score) => {
    if (score >= 90) return { text: 'Outstanding', color: 'success' };
    if (score >= 80) return { text: 'Excellent', color: 'processing' };
    if (score >= 70) return { text: 'Good', color: 'warning' };
    return { text: 'Needs Improvement', color: 'error' };
  };
  
  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: keys => setSelectedRowKeys(keys)
  };
  
  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one staff member');
      return;
    }
    
    message.info(`${action} action on ${selectedRowKeys.length} staff members`);
    // In a real implementation, this would call your API
  };
  
  // Dropdown menu for bulk actions
  const bulkActionMenu = (
    <Menu>
      <Menu.Item key="email" onClick={() => handleBulkAction('Email')}>
        Send email
      </Menu.Item>
      <Menu.Item key="status" onClick={() => handleBulkAction('Change status')}>
        Change status
      </Menu.Item>
      <Menu.Item key="department" onClick={() => handleBulkAction('Move department')}>
        Move department
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" danger onClick={() => handleBulkAction('Delete')}>
        Delete selected
      </Menu.Item>
    </Menu>
  );
  
  // Staff table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
          <div>
            <div>{text}</div>
            <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{record.email}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      sorter: (a, b) => a.role.localeCompare(b.role),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      sorter: (a, b) => a.department.localeCompare(b.department),
    },
    {
      title: 'Performance',
      dataIndex: 'performanceScore',
      key: 'performanceScore',
      render: score => {
        const level = getPerformanceLevel(score);
        return (
          <div>
            <Progress 
              percent={score} 
              size="small" 
              status={level.color === 'error' ? 'exception' : undefined} 
              strokeColor={level.color === 'processing' ? '#1890ff' : level.color === 'warning' ? '#faad14' : undefined}
            />
            <Text type={level.color === 'error' ? 'danger' : undefined} style={{ fontSize: '12px' }}>
              {level.text}
            </Text>
          </div>
        );
      },
      sorter: (a, b) => a.performanceScore - b.performanceScore,
    },
    {
      title: 'Badges',
      dataIndex: 'badges',
      key: 'badges',
      render: badges => (
        <span>
          {badges && badges.map(badge => (
            <Tag color="blue" key={badge} style={{ marginBottom: '4px' }}>
              {badge}
            </Tag>
          ))}
          {(!badges || badges.length === 0) && <Text type="secondary">None</Text>}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Badge 
          status={status === 'active' ? 'success' : 'default'} 
          text={status === 'active' ? 'Active' : 'Inactive'} 
        />
      ),
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      sorter: (a, b) => dayjs(a.joinDate).unix() - dayjs(b.joinDate).unix(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/admin/staff/view/${record.id}`)} 
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/admin/staff/edit/${record.id}`)} 
            />
          </Tooltip>
          <Dropdown 
            overlay={
              <Menu>
                <Menu.Item key="performance" onClick={() => navigate(`/admin/staff/performance/${record.id}`)}>
                  View performance
                </Menu.Item>
                <Menu.Item key="schedule" onClick={() => navigate(`/admin/staff/schedule/${record.id}`)}>
                  Manage schedule
                </Menu.Item>
                <Menu.Item key="targets" onClick={() => navigate(`/admin/staff/targets/${record.id}`)}>
                  Set targets
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="deactivate" danger onClick={() => message.success(`${record.name} ${record.status === 'active' ? 'deactivated' : 'activated'}`)}>
                  {record.status === 'active' ? 'Deactivate' : 'Activate'}
                </Menu.Item>
              </Menu>
            } 
            trigger={['click']}
          >
            <Button type="text" icon={<EllipsisOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];
  
  // Performance chart configuration
  const performanceChartConfig = {
    data: performanceData,
    isGroup: true,
    xField: 'month',
    yField: 'value',
    seriesField: 'category',
    groupField: 'category',
    columnStyle: {
      radius: [5, 5, 0, 0],
    },
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    legend: {
      position: 'top-right',
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    yAxis: {
      min: 50,
      max: 100,
    },
  };

  // Performance chart data transformation
  const transformedPerformanceData = performanceData.flatMap(item => [
    { month: item.month, value: item.sales, category: 'Sales' },
    { month: item.month, value: item.service, category: 'Service' },
    { month: item.month, value: item.attendance, category: 'Attendance' },
  ]);
  
  // Render staff statistics cards
  const renderStaffStats = () => {
    return (
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Total Staff" 
              value={staffStats.total} 
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Active" 
              value={staffStats.active} 
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="New (30 Days)" 
              value={staffStats.new}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Inactive" 
              value={staffStats.inactive} 
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Top Performers" 
              value={staffStats.topPerformers} 
              valueStyle={{ color: '#722ed1' }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Avg Performance" 
              value={staffStats.avgPerformance} 
              suffix="%" 
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="staff-page">
      <Card bordered={false} className="header-card">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Title level={2}>Staff Management</Title>
            <Text type="secondary">
              Manage staff, track performance, and set up incentives
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => navigate('/admin/staff/add')}
              >
                Add Staff
              </Button>
              <Button 
                icon={<BarChartOutlined />} 
                onClick={() => navigate('/admin/staff/performance')}
              >
                Performance
              </Button>
              <Button 
                icon={<TrophyOutlined />}
                onClick={() => navigate('/admin/staff/gamification')}
              >
                Gamification
              </Button>
              <Button 
                icon={<SyncOutlined />} 
                loading={loading}
                onClick={fetchStaffData}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ margin: '24px 0' }}>
        {renderStaffStats()}
      </div>

      <Card 
        title="Performance Trends" 
        bordered={false}
        style={{ marginBottom: '24px' }}
        extra={
          <Select 
            value={timeframeFilter} 
            onChange={setTimeframeFilter}
            style={{ width: 120 }}
          >
            <Option value="month">6 Months</Option>
            <Option value="quarter">4 Quarters</Option>
            <Option value="year">Year</Option>
          </Select>
        }
      >
        <Column {...performanceChartConfig} data={transformedPerformanceData} height={300} />
      </Card>

      <Card bordered={false}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarExtraContent={
            <Space>
              <Search
                placeholder="Search staff"
                allowClear
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              <Select 
                style={{ width: 140 }} 
                value={departmentFilter} 
                onChange={setDepartmentFilter}
                placeholder="Department"
              >
                <Option value="all">All Departments</Option>
                <Option value="Sales">Sales</Option>
                <Option value="Operations">Operations</Option>
                <Option value="Technical">Technical</Option>
                <Option value="Customer Service">Customer Service</Option>
                <Option value="Administration">Administration</Option>
              </Select>
              <Select 
                style={{ width: 140 }} 
                value={roleFilter} 
                onChange={setRoleFilter}
                placeholder="Role"
              >
                <Option value="all">All Roles</Option>
                <Option value="Manager">Manager</Option>
                <Option value="Cashier">Cashier</Option>
                <Option value="Sales Associate">Sales Associate</Option>
                <Option value="Inventory Specialist">Inventory Specialist</Option>
                <Option value="Technical Support">Technical Support</Option>
              </Select>
              
              {selectedRowKeys.length > 0 && (
                <>
                  <Text type="secondary">
                    {selectedRowKeys.length} selected
                  </Text>
                  
                  <Dropdown overlay={bulkActionMenu}>
                    <Button>
                      Actions <DownOutlined />
                    </Button>
                  </Dropdown>
                </>
              )}
              
              <Button 
                icon={<FilterOutlined />}
                onClick={() => {
                  setSearchText('');
                  setDepartmentFilter('all');
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setActiveTab('overview');
                }}
              >
                Clear Filters
              </Button>
            </Space>
          }
        >
          <TabPane tab="All Staff" key="overview">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredStaff}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
              }}
            />
          </TabPane>
          <TabPane tab="Active" key="active">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredStaff.filter(s => s.status === 'active')}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
              }}
            />
          </TabPane>
          <TabPane tab="Inactive" key="inactive">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredStaff.filter(s => s.status === 'inactive')}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
              }}
            />
          </TabPane>
          <TabPane tab="Top Performers" key="top">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredStaff.filter(s => s.performanceScore >= 90)}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
              }}
            />
          </TabPane>
          <TabPane tab="New Staff" key="new">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredStaff.filter(s => dayjs(s.joinDate).isAfter(dayjs().subtract(30, 'day')))}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Staff; 