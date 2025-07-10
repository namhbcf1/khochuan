import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Pagination, Spin, Empty, Button, Drawer, Tag, Slider, Checkbox, Divider } from 'antd';
import { ShoppingCartOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import AIRecommendations from '../components/features/AIRecommendations';

const { Search } = Input;
const { Option } = Select;
const { CheckboxGroup } = Checkbox;

const Products = () => {
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('popularity');
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    brands: [],
    tags: []
  });
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  
  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchTags();
  }, []);
  
  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, searchQuery, selectedCategory, priceRange, sortBy, selectedFilters]);
  
  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };
  
  const fetchBrands = async () => {
    try {
      const response = await api.get('/products/brands', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setAvailableBrands(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };
  
  const fetchTags = async () => {
    try {
      const response = await api.get('/products/tags', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setAvailableTags(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };
  
  const fetchProducts = async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', pageSize);
      params.append('sort_by', sortBy);
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (selectedCategory) {
        params.append('category_id', selectedCategory);
      }
      
      params.append('price_min', priceRange[0]);
      params.append('price_max', priceRange[1]);
      
      if (selectedFilters.brands.length > 0) {
        selectedFilters.brands.forEach(brand => {
          params.append('brands', brand);
        });
      }
      
      if (selectedFilters.tags.length > 0) {
        selectedFilters.tags.forEach(tag => {
          params.append('tags', tag);
        });
      }
      
      const response = await api.get(`/products?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setProducts(response.data.data);
        setTotalProducts(response.data.meta.total);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };
  
  const handleSortChange = (value) => {
    setSortBy(value);
  };
  
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };
  
  const handlePriceRangeChange = (value) => {
    setPriceRange(value);
  };
  
  const handleFilterChange = (type, values) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: values
    }));
    setCurrentPage(1);
  };
  
  const handleAddToCart = (product) => {
    // Add to cart logic here
    console.log('Add to cart:', product);
  };
  
  const handleProductClick = (product) => {
    // Navigate to product details
    console.log('View product details:', product);
  };
  
  const renderProductCard = (product) => (
    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
      <Card
        hoverable
        cover={
          <div style={{ height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              alt={product.name} 
              src={product.image_url || 'https://via.placeholder.com/300x300?text=Product'} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        }
        onClick={() => handleProductClick(product)}
      >
        <Card.Meta
          title={product.name}
          description={
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
                ${product.price.toFixed(2)}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                {product.tags && product.tags.map(tag => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </div>
              <div style={{ color: product.in_stock ? 'green' : 'red' }}>
                {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>
          }
        />
        <Button 
          type="primary" 
          icon={<ShoppingCartOutlined />} 
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(product);
          }}
          disabled={!product.in_stock}
          style={{ width: '100%', marginTop: '12px' }}
        >
          Add to Cart
        </Button>
      </Card>
    </Col>
  );
  
  return (
    <div className="products-page">
      <h1>Products</h1>
      
      {/* AI Recommendations Section */}
      <div className="recommendations-section" style={{ marginBottom: '32px' }}>
        <AIRecommendations 
          customerId={user?.id} 
          limit={4} 
          onProductClick={handleProductClick}
        />
      </div>
      
      <Card className="filter-card" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Search products"
              onSearch={handleSearch}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              placeholder="Category"
              style={{ width: '100%' }}
              onChange={handleCategoryChange}
              allowClear
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={6}>
            <Select
              placeholder="Sort by"
              style={{ width: '100%' }}
              defaultValue="popularity"
              onChange={handleSortChange}
            >
              <Option value="popularity">Popularity</Option>
              <Option value="price_asc">Price: Low to High</Option>
              <Option value="price_desc">Price: High to Low</Option>
              <Option value="newest">Newest First</Option>
              <Option value="rating">Customer Rating</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Button 
              type="primary" 
              icon={<FilterOutlined />}
              onClick={() => setFilterDrawerVisible(true)}
              style={{ width: '100%' }}
            >
              Filters
            </Button>
          </Col>
        </Row>
      </Card>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : products.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {products.map(product => renderProductCard(product))}
          </Row>
          
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalProducts}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `Total ${total} products`}
            />
          </div>
        </>
      ) : (
        <Empty 
          description="No products found" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      )}
      
      <Drawer
        title="Filter Products"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        width={320}
      >
        <div style={{ marginBottom: '24px' }}>
          <h3>Price Range</h3>
          <Slider
            range
            min={0}
            max={10000}
            value={priceRange}
            onChange={handlePriceRangeChange}
            tipFormatter={(value) => `$${value}`}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
        
        <Divider />
        
        <div style={{ marginBottom: '24px' }}>
          <h3>Brands</h3>
          <CheckboxGroup
            options={availableBrands.map(brand => ({ label: brand.name, value: brand.id }))}
            value={selectedFilters.brands}
            onChange={(values) => handleFilterChange('brands', values)}
          />
        </div>
        
        <Divider />
        
        <div style={{ marginBottom: '24px' }}>
          <h3>Tags</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {availableTags.map(tag => (
              <Tag.CheckableTag
                key={tag.id}
                checked={selectedFilters.tags.includes(tag.id)}
                onChange={(checked) => {
                  const newTags = checked
                    ? [...selectedFilters.tags, tag.id]
                    : selectedFilters.tags.filter(t => t !== tag.id);
                  handleFilterChange('tags', newTags);
                }}
              >
                {tag.name}
              </Tag.CheckableTag>
            ))}
          </div>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <Button 
            type="primary" 
            onClick={() => setFilterDrawerVisible(false)}
            style={{ marginRight: '8px' }}
          >
            Apply
          </Button>
          <Button 
            onClick={() => {
              setSelectedFilters({ brands: [], tags: [] });
              setPriceRange([0, 10000]);
            }}
          >
            Reset
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default Products;