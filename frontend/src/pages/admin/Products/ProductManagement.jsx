import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Card, 
  Typography, 
  Tag, 
  Dropdown, 
  Tooltip, 
  Modal, 
  message, 
  Popconfirm,
  Badge,
  Select,
  Divider,
  Row,
  Col,
  Statistic,
  Menu,
  Avatar
} from 'antd';
import { 
  DownOutlined,
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  MoreOutlined, 
  ExportOutlined, 
  ImportOutlined, 
  FilterOutlined,
  SyncOutlined,
  BarChartOutlined,
  TagOutlined,
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const ProductManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // table or card
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Mock data for products
  const mockProducts = [
    {
      id: 1,
      name: 'Laptop Dell Inspiron 15',
      sku: 'DELL-INS-15',
      category: 'Laptop',
      price: 15000000,
      stock: 25,
      status: 'active',
      image: 'https://via.placeholder.com/150',
      description: 'Laptop Dell Inspiron 15 với cấu hình mạnh mẽ',
      createdAt: '2023-01-15',
      updatedAt: '2023-06-20',
    },
    {
      id: 2,
      name: 'Màn hình Dell 24"',
      sku: 'DELL-MON-24',
      category: 'Màn hình',
      price: 3500000,
      stock: 42,
      status: 'active',
      image: 'https://via.placeholder.com/150',
      description: 'Màn hình Dell 24 inch độ phân giải Full HD',
      createdAt: '2023-02-10',
      updatedAt: '2023-05-15',
    },
    {
      id: 3,
      name: 'Chuột không dây Logitech',
      sku: 'LOG-MOUSE-01',
      category: 'Phụ kiện',
      price: 450000,
      stock: 78,
      status: 'active',
      image: 'https://via.placeholder.com/150',
      description: 'Chuột không dây Logitech với độ chính xác cao',
      createdAt: '2023-03-05',
      updatedAt: '2023-04-20',
    },
    {
      id: 4,
      name: 'Bàn phím cơ AKKO',
      sku: 'AKKO-KB-01',
      category: 'Phụ kiện',
      price: 1200000,
      stock: 15,
      status: 'active',
      image: 'https://via.placeholder.com/150',
      description: 'Bàn phím cơ AKKO với switch Cherry MX Blue',
      createdAt: '2023-01-25',
      updatedAt: '2023-03-10',
    },
    {
      id: 5,
      name: 'Laptop Acer Nitro 5',
      sku: 'ACER-NIT-5',
      category: 'Laptop',
      price: 22000000,
      stock: 0,
      status: 'out_of_stock',
      image: 'https://via.placeholder.com/150',
      description: 'Laptop gaming Acer Nitro 5 với card đồ họa NVIDIA',
      createdAt: '2023-02-05',
      updatedAt: '2023-04-15',
    },
    {
      id: 6,
      name: 'Tai nghe Sony WH-1000XM4',
      sku: 'SONY-WH-1000',
      category: 'Âm thanh',
      price: 5500000,
      stock: 8,
      status: 'low_stock',
      image: 'https://via.placeholder.com/150',
      description: 'Tai nghe chống ồn Sony WH-1000XM4 cao cấp',
      createdAt: '2023-03-15',
      updatedAt: '2023-05-20',
    },
    {
      id: 7,
      name: 'Máy tính để bàn HP Pavilion',
      sku: 'HP-PAV-01',
      category: 'PC',
      price: 18000000,
      stock: 12,
      status: 'active',
      image: 'https://via.placeholder.com/150',
      description: 'Máy tính để bàn HP Pavilion cấu hình mạnh mẽ',
      createdAt: '2023-01-10',
      updatedAt: '2023-03-25',
    },
    {
      id: 8,
      name: 'Ổ cứng SSD Samsung 1TB',
      sku: 'SAM-SSD-1TB',
      category: 'Linh kiện',
      price: 2800000,
      stock: 35,
      status: 'active',
      image: 'https://via.placeholder.com/150',
      description: 'Ổ cứng SSD Samsung 1TB tốc độ cao',
      createdAt: '2023-02-20',
      updatedAt: '2023-04-05',
    },
    {
      id: 9,
      name: 'RAM Kingston 16GB DDR4',
      sku: 'KING-RAM-16',
      category: 'Linh kiện',
      price: 1500000,
      stock: 0,
      status: 'out_of_stock',
      image: 'https://via.placeholder.com/150',
      description: 'Bộ nhớ RAM Kingston 16GB DDR4 3200MHz',
      createdAt: '2023-03-10',
      updatedAt: '2023-05-05',
    },
    {
      id: 10,
      name: 'Card đồ họa NVIDIA RTX 3060',
      sku: 'NV-RTX-3060',
      category: 'Linh kiện',
      price: 9500000,
      stock: 5,
      status: 'low_stock',
      image: 'https://via.placeholder.com/150',
      description: 'Card đồ họa NVIDIA RTX 3060 12GB GDDR6',
      createdAt: '2023-01-05',
      updatedAt: '2023-06-10',
    },
  ];

  // Fetch products on component mount
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  // Apply filters when search text, category or status changes
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchText) {
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(searchText.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(product => product.status === statusFilter);
    }
    
    setFilteredProducts(result);
  }, [searchText, categoryFilter, statusFilter, products]);

  // Delete a product
  const handleDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalVisible(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productToDelete.id));
      message.success(`Sản phẩm "${productToDelete.name}" đã được xóa`);
      setIsDeleteModalVisible(false);
      setProductToDelete(null);
      setLoading(false);
    }, 1000);
  };

  // Bulk delete selected products
  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sản phẩm để xóa');
      return;
    }
    
    Modal.confirm({
      title: 'Xác nhận xóa nhiều sản phẩm',
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} sản phẩm đã chọn?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          setProducts(prevProducts => 
            prevProducts.filter(p => !selectedRowKeys.includes(p.id))
          );
          message.success(`Đã xóa ${selectedRowKeys.length} sản phẩm`);
          setSelectedRowKeys([]);
          setLoading(false);
        }, 1000);
      },
    });
  };

  // Toggle product status
  const toggleProductStatus = (product) => {
    setLoading(true);
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    
    // Simulate API call
    setTimeout(() => {
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === product.id ? { ...p, status: newStatus } : p
        )
      );
      
      message.success(
        `Sản phẩm "${product.name}" đã được ${
          newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'
        }`
      );
      setLoading(false);
    }, 1000);
  };

  // Render product status
  const renderStatus = (status) => {
    switch (status) {
      case 'active':
        return <Tag color="success">Đang bán</Tag>;
      case 'inactive':
        return <Tag color="error">Ngưng bán</Tag>;
      case 'out_of_stock':
        return <Tag color="warning">Hết hàng</Tag>;
      case 'low_stock':
        return <Tag color="warning">Sắp hết hàng</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Handle category filter change
  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
  };

  // Handle status filter change
  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchText('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  // Dropdown menu for actions
  const moreActions = (record) => (
    <Menu>
      <Menu.Item key="edit" onClick={() => navigate(`/admin/products/edit/${record.id}`)}>
        <EditOutlined /> Chỉnh sửa
      </Menu.Item>
      <Menu.Item key="view" onClick={() => navigate(`/admin/products/view/${record.id}`)}>
        <EyeOutlined /> Xem chi tiết
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="status" 
        onClick={() => toggleProductStatus(record)}
      >
        {record.status === 'active' ? (
          <>
            <CloseCircleOutlined /> Ngưng bán
          </>
        ) : (
          <>
            <CheckCircleOutlined /> Kích hoạt
          </>
        )}
      </Menu.Item>
      <Menu.Item key="delete" danger onClick={() => handleDelete(record)}>
        <DeleteOutlined /> Xóa
      </Menu.Item>
    </Menu>
  );

  // Table columns
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={record.image} 
            shape="square" 
            style={{ marginRight: '8px' }} 
            size={40}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <Text type="secondary">{record.sku}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      filters: [...new Set(mockProducts.map(p => p.category))].map(cat => ({
        text: cat,
        value: cat,
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price) => (
        <span style={{ fontWeight: 'bold' }}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(price)}
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a, b) => a.stock - b.stock,
      render: (stock, record) => {
        let color = 'green';
        if (stock === 0) color = 'red';
        else if (stock < 10) color = 'orange';
        return <Badge count={stock} showZero style={{ backgroundColor: color }} />;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatus(status),
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Dropdown overlay={moreActions(record)} trigger={['click']}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: keys => setSelectedRowKeys(keys),
  };

  // Get available categories for filter
  const categories = [...new Set(products.map(product => product.category))];

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const outOfStockProducts = products.filter(p => p.status === 'out_of_stock' || p.stock === 0).length;
  const lowStockProducts = products.filter(p => p.status === 'low_stock' || (p.stock > 0 && p.stock < 10)).length;

  // Handle bulk action for products
  const handleBulkAction = (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      switch (action) {
        case 'activate':
          setProducts(prevProducts =>
            prevProducts.map(p =>
              selectedRowKeys.includes(p.id) ? { ...p, status: 'active' } : p
            )
          );
          message.success(`Đã kích hoạt ${selectedRowKeys.length} sản phẩm`);
          break;
        case 'deactivate':
          setProducts(prevProducts =>
            prevProducts.map(p =>
              selectedRowKeys.includes(p.id) ? { ...p, status: 'inactive' } : p
            )
          );
          message.success(`Đã vô hiệu hóa ${selectedRowKeys.length} sản phẩm`);
          break;
        case 'delete':
          handleBulkDelete();
          return; // Return early as handleBulkDelete handles the loading state
        case 'export':
          message.success('Đã xuất danh sách sản phẩm đã chọn');
          break;
        default:
          break;
      }
      
      setSelectedRowKeys([]);
      setLoading(false);
    }, 1000);
  };

  // Dropdown menu for bulk actions
  const bulkActions = (
    <Menu>
      <Menu.Item key="activate" onClick={() => handleBulkAction('activate')}>
        <CheckCircleOutlined /> Kích hoạt đã chọn
      </Menu.Item>
      <Menu.Item key="deactivate" onClick={() => handleBulkAction('deactivate')}>
        <CloseCircleOutlined /> Vô hiệu hóa đã chọn
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="export" onClick={() => handleBulkAction('export')}>
        <ExportOutlined /> Xuất Excel
      </Menu.Item>
      <Menu.Item key="delete" danger onClick={() => handleBulkAction('delete')}>
        <DeleteOutlined /> Xóa đã chọn
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="product-management">
      <Card className="header-card">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={1}>Product Management</Title>
            <Text type="secondary">
              Quản lý sản phẩm, giá cả và tồn kho
            </Text>
          </Col>
          <Col xs={24} md={12}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/products/add')}
                className="add-product-btn"
              >
                Add Product
              </Button>
              <Button icon={<ImportOutlined />}>
                Import
              </Button>
              <Button icon={<ExportOutlined />}>
                Export
              </Button>
              <Button 
                icon={<SyncOutlined />} 
                loading={loading}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 1000);
                }}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ margin: '24px 0' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Products"
                value={totalProducts}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Products"
                value={activeProducts}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Out of Stock"
                value={outOfStockProducts}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Low Stock"
                value={lowStockProducts}
                valueStyle={{ color: '#faad14' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="Search products"
                value={searchText}
                onChange={handleSearch}
                prefix={<SearchOutlined />}
                allowClear
                className="product-search"
              />
            </Col>
            <Col xs={24} md={16}>
              <Space size="small" style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Select
                  style={{ width: 150 }}
                  placeholder="Category"
                  value={categoryFilter}
                  onChange={handleCategoryChange}
                >
                  <Option value="all">All Categories</Option>
                  {categories.map(category => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
                <Select
                  style={{ width: 150 }}
                  placeholder="Status"
                  value={statusFilter}
                  onChange={handleStatusChange}
                >
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="out_of_stock">Out of Stock</Option>
                  <Option value="low_stock">Low Stock</Option>
                </Select>
                
                {selectedRowKeys.length > 0 && (
                  <Dropdown overlay={bulkActions}>
                    <Button>
                      Actions <DownOutlined />
                    </Button>
                  </Dropdown>
                )}
                
                <Button 
                  icon={<FilterOutlined />} 
                  onClick={handleResetFilters}
                >
                  Clear Filters
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="product-table"
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        visible={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete the product <strong>{productToDelete?.name}</strong>?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default ProductManagement; 