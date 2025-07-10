import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Table, 
  Tag, 
  Button, 
  Input, 
  Space, 
  Spin, 
  Empty, 
  Tabs, 
  Alert, 
  Timeline,
  Tooltip,
  Progress,
  Modal,
  Form,
  Select,
  message
} from 'antd';
import { 
  SearchOutlined, 
  SafetyCertificateOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  WarningOutlined,
  FileTextOutlined,
  ToolOutlined,
  QuestionCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Warranty = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [warrantyData, setWarrantyData] = useState([]);
  const [warrantyHistory, setWarrantyHistory] = useState([]);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [claimForm] = Form.useForm();
  const [claimLoading, setClaimLoading] = useState(false);

  // Function to calculate warranty status and days remaining
  const calculateWarrantyStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'unknown', text: 'Không xác định' };
    
    const today = dayjs();
    const expiry = dayjs(expiryDate);
    const daysRemaining = expiry.diff(today, 'day');
    const totalDays = expiry.diff(expiry.subtract(12, 'month'), 'day');
    const percentRemaining = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));
    
    if (daysRemaining < 0) {
      return { 
        status: 'expired', 
        text: 'Hết hạn', 
        daysText: `Hết hạn ${Math.abs(daysRemaining)} ngày trước`,
        percent: 0
      };
    } else if (daysRemaining <= 30) {
      return { 
        status: 'expiring', 
        text: 'Sắp hết hạn', 
        daysText: `Còn ${daysRemaining} ngày`,
        percent: percentRemaining
      };
    } else {
      return { 
        status: 'active', 
        text: 'Còn hiệu lực', 
        daysText: `Còn ${daysRemaining} ngày`,
        percent: percentRemaining
      };
    }
  };

  // Fetch warranty data
  useEffect(() => {
    const fetchWarrantyData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockWarrantyData = [
          {
            id: 'WR001',
            productName: 'Laptop Dell XPS 13',
            serialNumber: 'DL13X9921',
            purchaseDate: '2023-06-15',
            warrantyPeriod: '12 tháng',
            expiryDate: '2024-06-15',
            status: 'active',
            retailer: 'Trường Phát Computer',
            category: 'Laptop',
          },
          {
            id: 'WR002',
            productName: 'Màn hình Dell U2720Q',
            serialNumber: 'DLM27U9823',
            purchaseDate: '2023-09-10',
            warrantyPeriod: '36 tháng',
            expiryDate: '2026-09-10',
            status: 'active',
            retailer: 'Trường Phát Computer',
            category: 'Màn hình',
          },
          {
            id: 'WR003',
            productName: 'Chuột Logitech MX Master 3',
            serialNumber: 'LG3MX8765',
            purchaseDate: '2023-02-20',
            warrantyPeriod: '12 tháng',
            expiryDate: '2024-02-20',
            status: 'expiring',
            retailer: 'Trường Phát Computer',
            category: 'Phụ kiện',
          },
          {
            id: 'WR004',
            productName: 'Bàn phím Keychron K2',
            serialNumber: 'KC2KB4567',
            purchaseDate: '2022-05-10',
            warrantyPeriod: '12 tháng',
            expiryDate: '2023-05-10',
            status: 'expired',
            retailer: 'Trường Phát Computer',
            category: 'Phụ kiện',
          },
        ];
        
        const mockWarrantyHistory = [
          {
            id: 'WH001',
            productName: 'Laptop Dell XPS 13',
            serialNumber: 'DL13X9921',
            claimDate: '2023-08-22',
            issue: 'Màn hình hiển thị lỗi',
            status: 'completed',
            resolution: 'Thay màn hình mới',
            completedDate: '2023-08-25',
          },
          {
            id: 'WH002',
            productName: 'Chuột Logitech MX Master 3',
            serialNumber: 'LG3MX8765',
            claimDate: '2023-10-15',
            issue: 'Nút click không hoạt động',
            status: 'processing',
            resolution: null,
            completedDate: null,
          },
        ];
        
        setWarrantyData(mockWarrantyData);
        setWarrantyHistory(mockWarrantyHistory);
      } catch (error) {
        console.error('Error fetching warranty data:', error);
        message.error('Không thể tải thông tin bảo hành');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWarrantyData();
  }, []);

  // Handle warranty claim submission
  const handleClaimSubmit = async (values) => {
    setClaimLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success('Đã gửi yêu cầu bảo hành thành công!');
      setClaimModalVisible(false);
      claimForm.resetFields();
      
      // Add to warranty history
      const newClaim = {
        id: `WH00${warrantyHistory.length + 1}`,
        productName: values.product.split(' - ')[0],
        serialNumber: values.product.split(' - ')[1],
        claimDate: dayjs().format('YYYY-MM-DD'),
        issue: values.issue,
        status: 'pending',
        resolution: null,
        completedDate: null,
      };
      
      setWarrantyHistory([newClaim, ...warrantyHistory]);
      
    } catch (error) {
      console.error('Error submitting warranty claim:', error);
      message.error('Không thể gửi yêu cầu bảo hành');
    } finally {
      setClaimLoading(false);
    }
  };

  // Filter warranty data based on search text
  const filteredWarrantyData = warrantyData.filter(item => {
    if (!searchText) return true;
    
    const searchLower = searchText.toLowerCase();
    return (
      item.productName.toLowerCase().includes(searchLower) ||
      item.serialNumber.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  });

  // Warranty columns
  const warrantyColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>SN: {record.serialNumber}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày mua',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: date => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Thời hạn',
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
      render: (status, record) => {
        const warranty = calculateWarrantyStatus(record.expiryDate);
        let color = 'green';
        let icon = <CheckCircleOutlined />;
        
        if (warranty.status === 'expired') {
          color = 'red';
          icon = <WarningOutlined />;
        } else if (warranty.status === 'expiring') {
          color = 'orange';
          icon = <ClockCircleOutlined />;
        }
        
        return (
          <div>
            <Tag color={color} icon={icon}>
              {warranty.text}
            </Tag>
            <div style={{ marginTop: '5px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {warranty.daysText}
              </Text>
            </div>
            {warranty.status !== 'expired' && (
              <Progress 
                percent={warranty.percent} 
                size="small" 
                status={warranty.status === 'expiring' ? 'exception' : 'active'} 
                showInfo={false}
                style={{ marginTop: '5px' }}
              />
            )}
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
        const warranty = calculateWarrantyStatus(record.expiryDate);
        
        return (
          <Space>
            <Button 
              type="primary" 
              size="small" 
              icon={<FileTextOutlined />}
              onClick={() => window.open(`/customer/warranty/${record.id}`, '_blank')}
            >
              Chi tiết
            </Button>
            {warranty.status !== 'expired' && (
              <Button 
                type="default" 
                size="small" 
                icon={<ToolOutlined />}
                onClick={() => {
                  claimForm.setFieldsValue({
                    product: `${record.productName} - ${record.serialNumber}`,
                  });
                  setClaimModalVisible(true);
                }}
              >
                Yêu cầu bảo hành
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  // Warranty history columns
  const historyColumns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>SN: {record.serialNumber}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'claimDate',
      key: 'claimDate',
      render: date => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Vấn đề',
      dataIndex: 'issue',
      key: 'issue',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'blue';
        let text = 'Đang xử lý';
        
        if (status === 'completed') {
          color = 'green';
          text = 'Hoàn thành';
        } else if (status === 'pending') {
          color = 'orange';
          text = 'Chờ xử lý';
        } else if (status === 'rejected') {
          color = 'red';
          text = 'Từ chối';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Kết quả',
      dataIndex: 'resolution',
      key: 'resolution',
      render: (text, record) => {
        if (record.status === 'completed') {
          return (
            <div>
              <Text>{text}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Hoàn thành: {dayjs(record.completedDate).format('DD/MM/YYYY')}
                </Text>
              </div>
            </div>
          );
        }
        return <Text type="secondary">Chưa có kết quả</Text>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<FileTextOutlined />}
          onClick={() => window.open(`/customer/warranty/claim/${record.id}`, '_blank')}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
        <Text className="ml-2">Đang tải thông tin bảo hành...</Text>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Title level={2}>Quản lý bảo hành</Title>
      
      <Tabs defaultActiveKey="active">
        <TabPane 
          tab={
            <span>
              <SafetyCertificateOutlined />
              Sản phẩm bảo hành
            </span>
          } 
          key="active"
        >
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <Input
                placeholder="Tìm kiếm sản phẩm, mã số..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setClaimModalVisible(true)}
              >
                Yêu cầu bảo hành
              </Button>
            </div>
            
            {filteredWarrantyData.length > 0 ? (
              <Table 
                columns={warrantyColumns} 
                dataSource={filteredWarrantyData}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <Empty 
                description="Không tìm thấy sản phẩm bảo hành" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
          
          <Card>
            <Title level={4}>Thông tin bảo hành</Title>
            <Alert
              message="Quy trình bảo hành"
              description={
                <Timeline>
                  <Timeline.Item color="blue">
                    <Text strong>Bước 1:</Text> Gửi yêu cầu bảo hành trực tuyến hoặc mang sản phẩm đến cửa hàng
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <Text strong>Bước 2:</Text> Nhân viên kỹ thuật kiểm tra và xác định lỗi
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <Text strong>Bước 3:</Text> Tiến hành sửa chữa hoặc thay thế
                  </Timeline.Item>
                  <Timeline.Item color="green">
                    <Text strong>Bước 4:</Text> Hoàn thành bảo hành và bàn giao sản phẩm
                  </Timeline.Item>
                </Timeline>
              }
              type="info"
              showIcon
            />
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <ClockCircleOutlined />
              Lịch sử bảo hành
            </span>
          } 
          key="history"
        >
          <Card>
            {warrantyHistory.length > 0 ? (
              <Table 
                columns={historyColumns} 
                dataSource={warrantyHistory}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <Empty 
                description="Không có lịch sử bảo hành" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </TabPane>
      </Tabs>
      
      {/* Warranty Claim Modal */}
      <Modal
        title="Yêu cầu bảo hành"
        visible={claimModalVisible}
        onCancel={() => setClaimModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={claimForm}
          layout="vertical"
          onFinish={handleClaimSubmit}
        >
          <Form.Item
            name="product"
            label="Sản phẩm"
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
          >
            <Select placeholder="Chọn sản phẩm">
              {warrantyData
                .filter(item => calculateWarrantyStatus(item.expiryDate).status !== 'expired')
                .map(item => (
                  <Option key={item.id} value={`${item.productName} - ${item.serialNumber}`}>
                    {item.productName} - {item.serialNumber}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="issue"
            label="Mô tả lỗi"
            rules={[{ required: true, message: 'Vui lòng mô tả lỗi sản phẩm' }]}
          >
            <Input.TextArea rows={4} placeholder="Mô tả chi tiết lỗi sản phẩm" />
          </Form.Item>
          
          <Form.Item
            name="contact"
            label="Số điện thoại liên hệ"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
            initialValue={user?.phone || ''}
          >
            <Input placeholder="Số điện thoại liên hệ" />
          </Form.Item>
          
          <Form.Item
            name="preferredMethod"
            label="Phương thức bảo hành ưu tiên"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức bảo hành' }]}
          >
            <Select placeholder="Chọn phương thức bảo hành">
              <Option value="store">Mang đến cửa hàng</Option>
              <Option value="pickup">Nhân viên đến lấy</Option>
              <Option value="ship">Gửi bưu điện</Option>
            </Select>
          </Form.Item>
          
          <div className="flex justify-end">
            <Button 
              className="mr-2" 
              onClick={() => setClaimModalVisible(false)}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={claimLoading}
            >
              Gửi yêu cầu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Warranty; 