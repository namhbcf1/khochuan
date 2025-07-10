import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Button, Skeleton, Tag, Empty, Spin, message } from 'antd';
import { ShoppingCartOutlined, RiseOutlined, FireOutlined, LinkOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './styles.css';

const RecommendationTypes = {
  PERSONALIZED: 'personalized',
  TRENDING: 'trending',
  SIMILAR: 'similar',
  COMPLEMENTARY: 'complementary'
};

const typeIcons = {
  [RecommendationTypes.PERSONALIZED]: <ShoppingCartOutlined />,
  [RecommendationTypes.TRENDING]: <RiseOutlined />,
  [RecommendationTypes.SIMILAR]: <LinkOutlined />,
  [RecommendationTypes.COMPLEMENTARY]: <FireOutlined />
};

const typeColors = {
  [RecommendationTypes.PERSONALIZED]: 'blue',
  [RecommendationTypes.TRENDING]: 'red',
  [RecommendationTypes.SIMILAR]: 'purple',
  [RecommendationTypes.COMPLEMENTARY]: 'green'
};

const typeLabels = {
  [RecommendationTypes.PERSONALIZED]: 'Gợi ý cho bạn',
  [RecommendationTypes.TRENDING]: 'Sản phẩm hot',
  [RecommendationTypes.SIMILAR]: 'Sản phẩm tương tự',
  [RecommendationTypes.COMPLEMENTARY]: 'Thường mua cùng'
};

/**
 * AIRecommendations Component
 * 
 * @param {Object} props
 * @param {string} props.type - Type of recommendations (personalized, trending, similar, complementary)
 * @param {string} props.customerId - Optional customer ID for personalized recommendations
 * @param {string} props.productId - Optional product ID for similar/complementary recommendations
 * @param {number} props.limit - Number of recommendations to show
 * @param {Function} props.onProductSelect - Callback when product is selected
 * @param {Function} props.onAddToCart - Callback when add to cart button is clicked
 * @param {boolean} props.showAddToCart - Whether to show add to cart button
 * @param {string} props.title - Custom title for the recommendations card
 */
const AIRecommendations = ({
  type = RecommendationTypes.TRENDING,
  customerId,
  productId,
  limit = 4,
  onProductSelect,
  onAddToCart,
  showAddToCart = true,
  title
}) => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        let endpoint = '/ai/recommendations';
        let params = { limit };

        // Set appropriate parameters based on recommendation type
        switch (type) {
          case RecommendationTypes.PERSONALIZED:
            if (!customerId) {
              throw new Error('Customer ID is required for personalized recommendations');
            }
            params.customerId = customerId;
            params.strategy = 'personalized';
            break;
          case RecommendationTypes.TRENDING:
            params.strategy = 'trending';
            endpoint = '/ai/trending-products';
            break;
          case RecommendationTypes.SIMILAR:
            if (!productId) {
              throw new Error('Product ID is required for similar recommendations');
            }
            params.productId = productId;
            params.strategy = 'similar';
            endpoint = '/ai/similar-products';
            break;
          case RecommendationTypes.COMPLEMENTARY:
            if (!productId) {
              throw new Error('Product ID is required for complementary recommendations');
            }
            params.productId = productId;
            params.strategy = 'complementary';
            endpoint = '/ai/complementary-products';
            break;
          default:
            params.strategy = 'trending';
        }

        const response = await api.get(endpoint, { params });
        setRecommendations(response.data.products || []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        message.error('Không thể tải gợi ý sản phẩm');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [type, customerId, productId, limit]);

  const handleProductClick = (product) => {
    if (onProductSelect) {
      onProductSelect(product);
    } else {
      navigate(`/admin/products/edit/${product.id}`);
    }
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const cardTitle = title || (
    <div>
      <Tag color={typeColors[type]} icon={typeIcons[type]}>
        {typeLabels[type]}
      </Tag>
      <span style={{ marginLeft: 8 }}>
        {typeLabels[type]}
      </span>
    </div>
  );

  return (
    <Card 
      title={cardTitle}
      className="ai-recommendations-card"
      style={{ marginBottom: 16 }}
    >
      {loading ? (
        <div style={{ padding: '20px 0' }}>
          <Spin />
        </div>
      ) : recommendations.length > 0 ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
          dataSource={recommendations}
          renderItem={(item) => (
            <List.Item>
              <Card 
                hoverable
                size="small"
                onClick={() => handleProductClick(item)}
                cover={
                  <div style={{ height: 120, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    {item.image ? (
                      <img 
                        alt={item.name} 
                        src={item.image} 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <Avatar shape="square" size={64} style={{ backgroundColor: '#f0f0f0' }}>
                        {item.name ? item.name.charAt(0) : 'P'}
                      </Avatar>
                    )}
                  </div>
                }
              >
                <Skeleton loading={loading} active avatar>
                  <Card.Meta
                    title={item.name}
                    description={
                      <div>
                        <div>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</div>
                        {item.confidence && (
                          <Tag color="blue">{Math.round(item.confidence * 100)}% phù hợp</Tag>
                        )}
                        {showAddToCart && (
                          <Button 
                            type="primary" 
                            size="small" 
                            icon={<ShoppingCartOutlined />} 
                            style={{ marginTop: 8 }}
                            onClick={(e) => handleAddToCart(e, item)}
                          >
                            Thêm
                          </Button>
                        )}
                      </div>
                    }
                  />
                </Skeleton>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Không có gợi ý sản phẩm" />
      )}
    </Card>
  );
};

// Export component and types
export { RecommendationTypes };
export default AIRecommendations; 