/**
 * Recommendation Engine Module
 * 
 * This module implements AI-powered product recommendation algorithms:
 * 1. Personalized recommendations based on user purchase history and behavior
 * 2. Similar product recommendations based on product attributes
 * 3. Complementary product recommendations (frequently bought together)
 * 4. Trending product recommendations based on popularity and sales velocity
 */

const db = require('../services/dbService');
const logger = require('../utils/logger');
const { calculateSimilarity, normalizeVector } = require('../utils/calculations');

/**
 * Generate personalized recommendations for a specific customer
 * 
 * @param {number} customerId - The customer ID to generate recommendations for
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Promise<Array>} Array of recommended products
 */
async function getPersonalizedRecommendations(customerId, limit = 5) {
  try {
    logger.info(`Generating personalized recommendations for customer ${customerId}`);
    
    // Get customer purchase history
    const purchaseHistory = await db.query(
      `SELECT p.id, p.name, p.category_id, p.price, p.attributes, oi.quantity, oi.created_at
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.customer_id = ?
       ORDER BY oi.created_at DESC
       LIMIT 50`,
      [customerId]
    );
    
    if (!purchaseHistory.length) {
      logger.info(`No purchase history found for customer ${customerId}, returning trending products`);
      return getTrendingProducts(limit);
    }
    
    // Get customer view history
    const viewHistory = await db.query(
      `SELECT p.id, p.name, p.category_id, p.price, p.attributes, pv.viewed_at
       FROM product_views pv
       JOIN products p ON pv.product_id = p.id
       WHERE pv.customer_id = ?
       ORDER BY pv.viewed_at DESC
       LIMIT 50`,
      [customerId]
    );
    
    // Extract categories and attributes from purchase history
    const categoryFrequency = {};
    const attributePreferences = {};
    const priceRange = { min: Infinity, max: 0, avg: 0, count: 0 };
    
    // Process purchase history
    purchaseHistory.forEach(item => {
      // Count category frequency
      categoryFrequency[item.category_id] = (categoryFrequency[item.category_id] || 0) + item.quantity;
      
      // Track price preferences
      priceRange.min = Math.min(priceRange.min, item.price);
      priceRange.max = Math.max(priceRange.max, item.price);
      priceRange.avg += item.price * item.quantity;
      priceRange.count += item.quantity;
      
      // Process product attributes
      try {
        const attributes = typeof item.attributes === 'string' 
          ? JSON.parse(item.attributes) 
          : item.attributes;
          
        if (attributes && typeof attributes === 'object') {
          Object.entries(attributes).forEach(([key, value]) => {
            attributePreferences[key] = attributePreferences[key] || {};
            attributePreferences[key][value] = (attributePreferences[key][value] || 0) + item.quantity;
          });
        }
      } catch (err) {
        logger.error(`Error parsing attributes for product ${item.id}: ${err.message}`);
      }
    });
    
    // Calculate average price
    if (priceRange.count > 0) {
      priceRange.avg /= priceRange.count;
    }
    
    // Sort categories by frequency
    const preferredCategories = Object.entries(categoryFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => parseInt(id));
    
    // Get candidate products (not purchased before)
    const purchasedProductIds = purchaseHistory.map(item => item.id);
    const viewedProductIds = viewHistory.map(item => item.id);
    
    // Query for candidate products in preferred categories
    const candidateProducts = await db.query(
      `SELECT p.*, 
              c.name as category_name,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(r.id) as review_count
       FROM products p
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.id NOT IN (?)
         AND p.category_id IN (?)
         AND p.active = 1
         AND p.in_stock = 1
       GROUP BY p.id
       LIMIT 100`,
      [purchasedProductIds.length ? purchasedProductIds : [0], preferredCategories.length ? preferredCategories : [0]]
    );
    
    if (!candidateProducts.length) {
      logger.info(`No candidate products found for customer ${customerId}, returning trending products`);
      return getTrendingProducts(limit);
    }
    
    // Score candidate products based on customer preferences
    const scoredProducts = candidateProducts.map(product => {
      let score = 0;
      
      // Category preference score (0-40 points)
      const categoryIndex = preferredCategories.indexOf(product.category_id);
      if (categoryIndex !== -1) {
        score += Math.max(0, 40 - (categoryIndex * 10)); // Higher score for top categories
      }
      
      // Price preference score (0-20 points)
      const priceDiff = Math.abs(product.price - priceRange.avg);
      const priceRatio = priceDiff / (priceRange.avg || 1);
      score += Math.max(0, 20 - (priceRatio * 40)); // Higher score for prices close to average
      
      // Attribute preference score (0-20 points)
      try {
        const attributes = typeof product.attributes === 'string' 
          ? JSON.parse(product.attributes) 
          : product.attributes;
          
        if (attributes && typeof attributes === 'object') {
          let attrScore = 0;
          let attrCount = 0;
          
          Object.entries(attributes).forEach(([key, value]) => {
            if (attributePreferences[key] && attributePreferences[key][value]) {
              // Calculate how preferred this attribute value is
              const totalForKey = Object.values(attributePreferences[key]).reduce((sum, count) => sum + count, 0);
              const valuePreference = attributePreferences[key][value] / totalForKey;
              
              attrScore += valuePreference * 20; // Scale to 0-20 points
              attrCount++;
            }
          });
          
          if (attrCount > 0) {
            score += (attrScore / attrCount);
          }
        }
      } catch (err) {
        logger.error(`Error parsing attributes for candidate product ${product.id}: ${err.message}`);
      }
      
      // Rating score (0-10 points)
      score += (product.avg_rating / 5) * 10;
      
      // Recently viewed bonus (0-10 points)
      if (viewedProductIds.includes(product.id)) {
        const viewIndex = viewedProductIds.indexOf(product.id);
        score += Math.max(0, 10 - viewIndex); // Higher score for recently viewed products
      }
      
      return {
        ...product,
        score,
        recommendation_type: 'personalized',
        recommendation_reason: determineRecommendationReason(product, {
          categoryFrequency,
          attributePreferences,
          priceRange
        })
      };
    });
    
    // Sort by score and return top recommendations
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
      
  } catch (error) {
    logger.error(`Error generating personalized recommendations: ${error.message}`);
    throw error;
  }
}

/**
 * Get similar products to a specific product
 * 
 * @param {number} productId - The product ID to find similar products for
 * @param {number} limit - Maximum number of similar products to return
 * @returns {Promise<Array>} Array of similar products
 */
async function getSimilarProducts(productId, limit = 5) {
  try {
    logger.info(`Finding similar products for product ${productId}`);
    
    // Get source product details
    const [sourceProduct] = await db.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [productId]
    );
    
    if (!sourceProduct) {
      logger.error(`Product ${productId} not found`);
      throw new Error(`Product ${productId} not found`);
    }
    
    // Get candidate products in the same category
    const candidateProducts = await db.query(
      `SELECT p.*, 
              c.name as category_name,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(r.id) as review_count
       FROM products p
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.id != ?
         AND p.category_id = ?
         AND p.active = 1
         AND p.in_stock = 1
       GROUP BY p.id
       LIMIT 50`,
      [productId, sourceProduct.category_id]
    );
    
    if (!candidateProducts.length) {
      logger.info(`No candidate products found in the same category as product ${productId}`);
      return [];
    }
    
    // Calculate similarity scores
    const scoredProducts = candidateProducts.map(product => {
      let similarityScore = 0;
      
      // Price similarity (0-30 points)
      const priceRatio = Math.min(product.price, sourceProduct.price) / Math.max(product.price, sourceProduct.price);
      similarityScore += priceRatio * 30;
      
      // Attribute similarity (0-50 points)
      try {
        const sourceAttrs = typeof sourceProduct.attributes === 'string' 
          ? JSON.parse(sourceProduct.attributes) 
          : sourceProduct.attributes || {};
          
        const productAttrs = typeof product.attributes === 'string' 
          ? JSON.parse(product.attributes) 
          : product.attributes || {};
          
        if (typeof sourceAttrs === 'object' && typeof productAttrs === 'object') {
          const allKeys = new Set([...Object.keys(sourceAttrs), ...Object.keys(productAttrs)]);
          let matchCount = 0;
          let totalCount = 0;
          
          allKeys.forEach(key => {
            if (sourceAttrs[key] && productAttrs[key]) {
              if (sourceAttrs[key] === productAttrs[key]) {
                matchCount++;
              }
              totalCount++;
            }
          });
          
          if (totalCount > 0) {
            similarityScore += (matchCount / totalCount) * 50;
          }
        }
      } catch (err) {
        logger.error(`Error comparing attributes for products ${sourceProduct.id} and ${product.id}: ${err.message}`);
      }
      
      // Rating similarity (0-20 points)
      const ratingDiff = Math.abs((sourceProduct.avg_rating || 0) - (product.avg_rating || 0));
      similarityScore += Math.max(0, 20 - (ratingDiff * 4)); // Deduct points for rating difference
      
      return {
        ...product,
        score: similarityScore,
        recommendation_type: 'similar',
        recommendation_reason: `Similar to ${sourceProduct.name}`
      };
    });
    
    // Sort by similarity score and return top results
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
      
  } catch (error) {
    logger.error(`Error finding similar products: ${error.message}`);
    throw error;
  }
}

/**
 * Get complementary products for a specific product (frequently bought together)
 * 
 * @param {number} productId - The product ID to find complementary products for
 * @param {number} limit - Maximum number of complementary products to return
 * @returns {Promise<Array>} Array of complementary products
 */
async function getComplementaryProducts(productId, limit = 5) {
  try {
    logger.info(`Finding complementary products for product ${productId}`);
    
    // Get source product details
    const [sourceProduct] = await db.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [productId]
    );
    
    if (!sourceProduct) {
      logger.error(`Product ${productId} not found`);
      throw new Error(`Product ${productId} not found`);
    }
    
    // Find products frequently bought together
    const complementaryProducts = await db.query(
      `SELECT p.*, 
              c.name as category_name,
              COUNT(oi2.id) as co_purchase_count,
              COALESCE(AVG(r.rating), 0) as avg_rating
       FROM order_items oi1
       JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi1.product_id != oi2.product_id
       JOIN products p ON oi2.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE oi1.product_id = ?
         AND p.active = 1
         AND p.in_stock = 1
       GROUP BY p.id
       ORDER BY co_purchase_count DESC
       LIMIT ?`,
      [productId, limit]
    );
    
    // If no co-purchase data, find products in complementary categories
    if (!complementaryProducts.length) {
      logger.info(`No co-purchase data found for product ${productId}, finding complementary categories`);
      
      // Define complementary category relationships (this would ideally be in a database table)
      const complementaryCategories = {
        1: [2, 5, 7],   // Example: Laptops -> Laptop bags, Mice, Keyboards
        2: [1, 7],      // Example: Laptop bags -> Laptops, Keyboards
        3: [4, 6],      // Example: Smartphones -> Phone cases, Chargers
        4: [3, 6],      // Example: Phone cases -> Smartphones, Chargers
        // Add more mappings as needed
      };
      
      const targetCategories = complementaryCategories[sourceProduct.category_id] || [];
      
      if (targetCategories.length) {
        const alternativeProducts = await db.query(
          `SELECT p.*, 
                  c.name as category_name,
                  COALESCE(AVG(r.rating), 0) as avg_rating,
                  COUNT(r.id) as review_count
           FROM products p
           JOIN categories c ON p.category_id = c.id
           LEFT JOIN reviews r ON p.id = r.product_id
           WHERE p.category_id IN (?)
             AND p.active = 1
             AND p.in_stock = 1
           GROUP BY p.id
           ORDER BY p.sales_count DESC
           LIMIT ?`,
          [targetCategories, limit]
        );
        
        return alternativeProducts.map(product => ({
          ...product,
          recommendation_type: 'complementary',
          recommendation_reason: `Great with ${sourceProduct.name}`
        }));
      }
      
      return [];
    }
    
    // Add recommendation type and reason
    return complementaryProducts.map(product => ({
      ...product,
      recommendation_type: 'complementary',
      recommendation_reason: `Frequently bought with ${sourceProduct.name}`
    }));
    
  } catch (error) {
    logger.error(`Error finding complementary products: ${error.message}`);
    throw error;
  }
}

/**
 * Get trending products based on recent sales and popularity
 * 
 * @param {number} limit - Maximum number of trending products to return
 * @param {number} categoryId - Optional category ID to filter by
 * @returns {Promise<Array>} Array of trending products
 */
async function getTrendingProducts(limit = 5, categoryId = null) {
  try {
    logger.info(`Getting trending products${categoryId ? ` for category ${categoryId}` : ''}`);
    
    // Calculate trending score based on recent sales and views
    const query = `
      SELECT p.*,
             c.name as category_name,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count,
             (
               -- Recent sales (last 30 days)
               (SELECT COALESCE(SUM(oi.quantity), 0)
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.product_id = p.id
                AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) * 2
               +
               -- Recent views (last 7 days)
               (SELECT COUNT(*)
                FROM product_views pv
                WHERE pv.product_id = p.id
                AND pv.viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY))
               +
               -- Overall sales velocity
               (p.sales_count / GREATEST(1, DATEDIFF(NOW(), p.created_at)) * 10)
               +
               -- Rating factor
               (COALESCE(AVG(r.rating), 0) * 5)
             ) as trending_score
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.active = 1
        AND p.in_stock = 1
        ${categoryId ? 'AND p.category_id = ?' : ''}
      GROUP BY p.id
      ORDER BY trending_score DESC
      LIMIT ?
    `;
    
    const params = categoryId ? [categoryId, limit] : [limit];
    const trendingProducts = await db.query(query, params);
    
    // Add recommendation type and reason
    return trendingProducts.map(product => {
      // Determine why this product is trending
      let reason = 'Popular right now';
      
      if (product.avg_rating >= 4.5 && product.review_count >= 10) {
        reason = 'Highly rated by customers';
      } else if (product.trending_score > 100) {
        reason = 'Selling fast';
      } else if (product.discount_percentage >= 15) {
        reason = `${product.discount_percentage}% off`;
      }
      
      return {
        ...product,
        recommendation_type: 'trending',
        recommendation_reason: reason
      };
    });
    
  } catch (error) {
    logger.error(`Error getting trending products: ${error.message}`);
    throw error;
  }
}

/**
 * Get all recommendation types for a customer
 * 
 * @param {number} customerId - The customer ID to get recommendations for
 * @param {number} limit - Maximum number of recommendations per type
 * @returns {Promise<Object>} Object containing different recommendation types
 */
async function getAllRecommendations(customerId, limit = 5) {
  try {
    logger.info(`Getting all recommendation types for customer ${customerId}`);
    
    // Get customer's most recent viewed or purchased product
    const [recentProduct] = await db.query(
      `SELECT p.id
       FROM (
         SELECT product_id, created_at as timestamp
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE o.customer_id = ?
         UNION ALL
         SELECT product_id, viewed_at as timestamp
         FROM product_views
         WHERE customer_id = ?
       ) recent
       JOIN products p ON recent.product_id = p.id
       ORDER BY recent.timestamp DESC
       LIMIT 1`,
      [customerId, customerId]
    );
    
    // Get different recommendation types in parallel
    const [personalized, trending, similar, complementary] = await Promise.all([
      getPersonalizedRecommendations(customerId, limit),
      getTrendingProducts(limit),
      recentProduct ? getSimilarProducts(recentProduct.id, limit) : [],
      recentProduct ? getComplementaryProducts(recentProduct.id, limit) : []
    ]);
    
    return {
      personalized,
      trending,
      similar,
      complementary
    };
    
  } catch (error) {
    logger.error(`Error getting all recommendations: ${error.message}`);
    throw error;
  }
}

/**
 * Determine the reason for a personalized recommendation
 * 
 * @param {Object} product - The product being recommended
 * @param {Object} preferences - Customer preference data
 * @returns {string} The recommendation reason
 */
function determineRecommendationReason(product, preferences) {
  const { categoryFrequency, attributePreferences, priceRange } = preferences;
  
  // Check if this is from their top category
  const categories = Object.entries(categoryFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => parseInt(id));
    
  if (categories[0] === product.category_id) {
    return 'Based on your shopping history';
  }
  
  // Check if this matches their attribute preferences
  try {
    const attributes = typeof product.attributes === 'string' 
      ? JSON.parse(product.attributes) 
      : product.attributes;
      
    if (attributes && typeof attributes === 'object') {
      for (const [key, value] of Object.entries(attributes)) {
        if (attributePreferences[key] && attributePreferences[key][value]) {
          const totalForKey = Object.values(attributePreferences[key]).reduce((sum, count) => sum + count, 0);
          const valuePreference = attributePreferences[key][value] / totalForKey;
          
          if (valuePreference > 0.5) {
            return `Features you might like`;
          }
        }
      }
    }
  } catch (err) {
    logger.error(`Error parsing attributes for recommendation reason: ${err.message}`);
  }
  
  // Check if this is in their price range
  if (product.price >= priceRange.min && product.price <= priceRange.max) {
    return 'Similar to items you viewed';
  }
  
  return 'Recommended for you';
}

module.exports = {
  getPersonalizedRecommendations,
  getSimilarProducts,
  getComplementaryProducts,
  getTrendingProducts,
  getAllRecommendations
}; 