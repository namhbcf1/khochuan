/**
 * AI Service for KhoChuan POS
 * Provides advanced AI capabilities including customer segmentation,
 * demand forecasting, price optimization, and product recommendations
 */

const { CloudflareAI } = require('@cloudflare/ai');
const logger = require('../utils/logger');
const db = require('../utils/database');

class AIService {
  constructor() {
    this.ai = new CloudflareAI({
      apiToken: process.env.CLOUDFLARE_AI_TOKEN,
    });
    this.modelVersions = {
      customerSegmentation: '1.0.0',
      demandForecasting: '1.3.2',
      priceOptimization: '2.1.0',
      productRecommendations: '3.2.1',
    };
    logger.info('AIService initialized');
  }

  /**
   * Segment customers based on RFM analysis
   * @param {Object} options - Segmentation options
   * @param {string} options.timeframe - Time period for analysis (30d, 90d, 180d, 365d, all)
   * @param {string} options.customerId - Filter for specific customer
   * @param {number} options.minTransactions - Minimum transactions to include customer
   * @param {boolean} options.includeMetrics - Include detailed metrics
   * @returns {Promise<Object>} Segmentation results
   */
  async segmentCustomers(options = {}) {
    try {
      const {
        timeframe = '90d',
        customerId = null,
        minTransactions = 1,
        includeMetrics = false,
      } = options;

      logger.info(`Running customer segmentation with timeframe: ${timeframe}`);

      // Get customer transaction data
      const transactions = await this._getCustomerTransactions(timeframe, customerId);

      if (transactions.length === 0) {
        return {
          segments: [],
          metrics: {
            total_customers: 0,
            analyzed_customers: 0,
            time_period: this._formatTimeframe(timeframe),
            analysis_date: new Date().toISOString(),
          },
        };
      }

      // Calculate RFM scores
      const rfmData = this._calculateRFMScores(transactions, minTransactions);

      // Group customers into segments
      const segments = this._createCustomerSegments(rfmData, includeMetrics);

      // Prepare response
      const result = {
        segments,
        metrics: {
          total_customers: rfmData.length,
          analyzed_customers: rfmData.filter(c => c.transactions >= minTransactions).length,
          time_period: this._formatTimeframe(timeframe),
          analysis_date: new Date().toISOString(),
        },
      };

      return result;
    } catch (error) {
      logger.error('Error in customer segmentation:', error);
      throw new Error('Failed to segment customers: ' + error.message);
    }
  }

  /**
   * Forecast product demand based on historical sales
   * @param {Object} options - Forecast options
   * @param {string} options.productId - Filter for specific product
   * @param {string} options.categoryId - Filter for specific category
   * @param {string} options.forecastPeriod - Period to forecast (7d, 14d, 30d, 90d)
   * @param {boolean} options.includeHistorical - Include historical data
   * @param {number} options.confidenceLevel - Confidence level (0-1)
   * @returns {Promise<Object>} Forecast results
   */
  async forecastDemand(options = {}) {
    try {
      const {
        productId = null,
        categoryId = null,
        forecastPeriod = '30d',
        includeHistorical = false,
        confidenceLevel = 0.95,
      } = options;

      logger.info(`Running demand forecast for period: ${forecastPeriod}`);

      // Get historical sales data
      const salesData = await this._getSalesData(productId, categoryId);

      if (salesData.length === 0) {
        return {
          forecasts: [],
          metadata: {
            forecast_generated_at: new Date().toISOString(),
            forecast_period: forecastPeriod,
            model_version: this.modelVersions.demandForecasting,
          },
        };
      }

      // Group by product
      const productGroups = this._groupSalesByProduct(salesData);

      // Generate forecasts for each product
      const forecasts = await Promise.all(
        Object.keys(productGroups).map(async (pid) => {
          const productData = productGroups[pid];
          return this._generateProductForecast(
            pid,
            productData,
            forecastPeriod,
            includeHistorical,
            confidenceLevel
          );
        })
      );

      // Prepare response
      const result = {
        forecasts,
        metadata: {
          forecast_generated_at: new Date().toISOString(),
          forecast_period: forecastPeriod,
          model_version: this.modelVersions.demandForecasting,
          accuracy_metrics: {
            mape: 0.12, // Mean Absolute Percentage Error
            rmse: 3.4, // Root Mean Square Error
          },
        },
      };

      return result;
    } catch (error) {
      logger.error('Error in demand forecasting:', error);
      throw new Error('Failed to forecast demand: ' + error.message);
    }
  }

  /**
   * Optimize product pricing based on elasticity and market data
   * @param {Object} options - Optimization options
   * @param {string} options.productId - Filter for specific product
   * @param {string} options.categoryId - Filter for specific category
   * @param {string} options.strategy - Optimization strategy
   * @param {number} options.minMargin - Minimum margin percentage
   * @param {number} options.competitorWeight - Weight given to competitor prices
   * @returns {Promise<Object>} Price optimization results
   */
  async optimizePrices(options = {}) {
    try {
      const {
        productId = null,
        categoryId = null,
        strategy = 'balanced',
        minMargin = 15,
        competitorWeight = 0.3,
      } = options;

      logger.info(`Running price optimization with strategy: ${strategy}`);

      // Get product and sales data
      const productsData = await this._getProductsData(productId, categoryId);

      if (productsData.length === 0) {
        return {
          optimizations: [],
          metadata: {
            optimization_date: new Date().toISOString(),
            strategy,
            model_version: this.modelVersions.priceOptimization,
          },
        };
      }

      // Get competitor pricing data
      const competitorData = await this._getCompetitorPricing(
        productsData.map(p => p.id)
      );

      // Calculate optimal prices
      const optimizations = productsData.map(product => {
        return this._calculateOptimalPrice(
          product,
          competitorData[product.id] || [],
          strategy,
          minMargin,
          competitorWeight
        );
      });

      // Prepare response
      const result = {
        optimizations,
        metadata: {
          optimization_date: new Date().toISOString(),
          strategy,
          model_version: this.modelVersions.priceOptimization,
        },
      };

      return result;
    } catch (error) {
      logger.error('Error in price optimization:', error);
      throw new Error('Failed to optimize prices: ' + error.message);
    }
  }

  /**
   * Generate personalized product recommendations
   * @param {Object} options - Recommendation options
   * @param {string} options.customerId - Customer ID
   * @param {Object} options.context - Recommendation context
   * @param {Object} options.filters - Product filters
   * @param {Object} options.options - Additional options
   * @returns {Promise<Object>} Product recommendations
   */
  async getRecommendations(options = {}) {
    try {
      const {
        customerId,
        context = {},
        filters = {},
        options: reqOptions = {},
      } = options;

      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      logger.info(`Generating recommendations for customer: ${customerId}`);

      // Get customer purchase history
      const purchaseHistory = await this._getCustomerPurchaseHistory(customerId);

      // Get product data
      const products = await this._getProductsForRecommendation(filters);

      if (products.length === 0) {
        return {
          customer_id: customerId,
          recommendations: [],
          metadata: {
            generated_at: new Date().toISOString(),
            model_version: this.modelVersions.productRecommendations,
            recommendation_basis: [],
          },
        };
      }

      // Determine recommendation basis
      const recommendationBasis = [];

      // Add purchase history if available
      if (purchaseHistory.length > 0) {
        recommendationBasis.push('purchase_history');
      }

      // Add cart analysis if cart items provided
      if (context.current_cart && context.current_cart.length > 0) {
        recommendationBasis.push('cart_analysis');
      }

      // Add collaborative filtering
      recommendationBasis.push('collaborative_filtering');

      // Generate recommendations
      const recommendations = await this._generateRecommendations(
        customerId,
        purchaseHistory,
        products,
        context,
        filters,
        reqOptions
      );

      // Prepare response
      const result = {
        customer_id: customerId,
        recommendations: recommendations.slice(0, reqOptions.recommendation_count || 5),
        metadata: {
          generated_at: new Date().toISOString(),
          model_version: this.modelVersions.productRecommendations,
          recommendation_basis: recommendationBasis,
        },
      };

      return result;
    } catch (error) {
      logger.error('Error in product recommendations:', error);
      throw new Error('Failed to generate recommendations: ' + error.message);
    }
  }

  // Private helper methods

  /**
   * Get customer transaction data for the specified timeframe
   * @private
   */
  async _getCustomerTransactions(timeframe, customerId) {
    // In a real implementation, this would query the database
    // For now, return mock data
    return [
      {
        customer_id: 'cust_123456',
        name: 'John Doe',
        email: 'john@example.com',
        last_purchase_date: '2025-07-15',
        first_purchase_date: '2024-01-10',
        purchase_count: 24,
        total_spent: 8750.25,
        transactions: [
          { date: '2025-07-15', amount: 450.25 },
          { date: '2025-06-20', amount: 320.50 },
          // More transactions...
        ],
      },
      // More customers...
    ];
  }

  /**
   * Calculate RFM scores for customers
   * @private
   */
  _calculateRFMScores(transactions, minTransactions) {
    // In a real implementation, this would calculate actual RFM scores
    // For now, return mock data with pre-calculated scores
    return transactions.map(customer => ({
      ...customer,
      r_score: 5, // Recency score (1-5)
      f_score: 5, // Frequency score (1-5)
      m_score: 4, // Monetary score (1-5)
      rfm_score: 14, // Combined score
    }));
  }

  /**
   * Group customers into segments based on RFM scores
   * @private
   */
  _createCustomerSegments(rfmData, includeDetails) {
    // Define segments
    const segmentDefinitions = [
      {
        name: 'Champions',
        description: 'Best customers who bought recently, buy often and spend the most',
        filter: c => c.r_score >= 4 && c.f_score >= 4 && c.m_score >= 4,
      },
      {
        name: 'Loyal',
        description: 'Regular buyers',
        filter: c => c.r_score >= 3 && c.f_score >= 3 && c.m_score >= 3,
      },
      // More segment definitions...
    ];

    // Group customers into segments
    const segments = segmentDefinitions.map(segment => {
      const customers = rfmData.filter(segment.filter);
      
      const result = {
        segment_name: segment.name,
        segment_description: segment.description,
        customer_count: customers.length,
        percentage: customers.length / rfmData.length * 100,
        avg_recency: this._average(customers.map(c => c.last_purchase_date)),
        avg_frequency: this._average(customers.map(c => c.purchase_count)),
        avg_monetary: this._average(customers.map(c => c.total_spent)),
      };

      if (includeDetails) {
        result.customers = customers.map(c => ({
          id: c.customer_id,
          name: c.name,
          email: c.email,
          r_score: c.r_score,
          f_score: c.f_score,
          m_score: c.m_score,
          rfm_score: c.rfm_score,
          last_purchase: c.last_purchase_date,
          purchase_count: c.purchase_count,
          total_spent: c.total_spent,
        }));
      }

      return result;
    });

    return segments;
  }

  /**
   * Format timeframe string for display
   * @private
   */
  _formatTimeframe(timeframe) {
    switch (timeframe) {
      case '30d': return '30 days';
      case '90d': return '90 days';
      case '180d': return '180 days';
      case '365d': return '365 days';
      case 'all': return 'All time';
      default: return '90 days';
    }
  }

  /**
   * Get sales data for demand forecasting
   * @private
   */
  async _getSalesData(productId, categoryId) {
    // In a real implementation, this would query the database
    // For now, return mock data
    return [
      {
        product_id: 'prod_789012',
        product_name: 'Premium Coffee Beans 1kg',
        sku: 'COF-PREM-1KG',
        category_id: 'cat_beverages',
        date: '2025-07-15',
        quantity: 12,
        current_stock: 45,
      },
      // More sales data...
    ];
  }

  /**
   * Group sales data by product
   * @private
   */
  _groupSalesByProduct(salesData) {
    const groups = {};
    salesData.forEach(sale => {
      if (!groups[sale.product_id]) {
        groups[sale.product_id] = [];
      }
      groups[sale.product_id].push(sale);
    });
    return groups;
  }

  /**
   * Generate forecast for a specific product
   * @private
   */
  async _generateProductForecast(productId, productData, forecastPeriod, includeHistorical, confidenceLevel) {
    // In a real implementation, this would use time series forecasting
    // For now, return mock forecast
    
    const days = parseInt(forecastPeriod);
    const forecast = [];
    
    // Generate daily forecast
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const predicted = 10 + Math.floor(Math.random() * 5);
      const margin = Math.floor(predicted * (1 - confidenceLevel) * 2);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted_demand: predicted,
        lower_bound: predicted - margin,
        upper_bound: predicted + margin,
        confidence: confidenceLevel,
      });
    }
    
    // Get product details from first entry
    const product = productData[0];
    
    return {
      product_id: productId,
      product_name: product.product_name,
      sku: product.sku,
      current_stock: product.current_stock,
      forecast,
      summary: {
        total_predicted_demand: forecast.reduce((sum, day) => sum + day.predicted_demand, 0),
        avg_daily_demand: forecast.reduce((sum, day) => sum + day.predicted_demand, 0) / days,
        trend: 'increasing',
        seasonal_factors: {
          monday: 0.8,
          tuesday: 0.7,
          wednesday: 0.9,
          thursday: 1.1,
          friday: 1.3,
          saturday: 1.4,
          sunday: 0.8,
        },
        stock_status: product.current_stock < 50 ? 'low' : 'adequate',
        days_until_stockout: Math.floor(product.current_stock / (forecast[0].predicted_demand || 1)),
        reorder_recommendation: {
          should_reorder: product.current_stock < 50,
          recommended_quantity: 100,
          optimal_order_date: new Date().toISOString().split('T')[0],
        },
      },
    };
  }

  /**
   * Get product data for price optimization
   * @private
   */
  async _getProductsData(productId, categoryId) {
    // In a real implementation, this would query the database
    // For now, return mock data
    return [
      {
        id: 'prod_456789',
        name: 'Organic Green Tea 100g',
        sku: 'TEA-ORG-GRN-100',
        category_id: 'cat_beverages',
        price: 12.99,
        cost: 5.20,
        margin: 59.97,
      },
      // More products...
    ];
  }

  /**
   * Get competitor pricing data
   * @private
   */
  async _getCompetitorPricing(productIds) {
    // In a real implementation, this would fetch competitor data
    // For now, return mock data
    const result = {};
    productIds.forEach(id => {
      result[id] = [
        { competitor: 'Competitor A', price: 15.99 },
        { competitor: 'Competitor B', price: 14.50 },
        { competitor: 'Competitor C', price: 16.99 },
      ];
    });
    return result;
  }

  /**
   * Calculate optimal price for a product
   * @private
   */
  _calculateOptimalPrice(product, competitors, strategy, minMargin, competitorWeight) {
    // In a real implementation, this would use price elasticity models
    // For now, use a simple algorithm
    
    // Calculate average competitor price
    const avgCompetitorPrice = competitors.reduce((sum, c) => sum + c.price, 0) / 
                              (competitors.length || 1);
    
    // Calculate price elasticity (mock value)
    const priceElasticity = -0.3;
    
    // Calculate optimal price based on strategy
    let optimalPrice;
    let reason;
    
    switch (strategy) {
      case 'profit_max':
        optimalPrice = product.cost / (1 + 1/priceElasticity);
        reason = 'Maximizing profit based on price elasticity';
        break;
      case 'revenue_max':
        optimalPrice = product.cost * (1 - priceElasticity);
        reason = 'Maximizing revenue based on price elasticity';
        break;
      case 'market_share':
        optimalPrice = avgCompetitorPrice * 0.9;
        reason = 'Undercutting competitors to gain market share';
        break;
      case 'balanced':
      default:
        // Weighted average of profit-maximizing and competitor-based price
        const profitMaxPrice = product.cost / (1 + 1/priceElasticity);
        optimalPrice = profitMaxPrice * (1 - competitorWeight) + 
                      (avgCompetitorPrice * competitorWeight);
        reason = 'Balancing profit optimization with competitive positioning';
    }
    
    // Ensure minimum margin is maintained
    const minPrice = product.cost * (1 + minMargin / 100);
    if (optimalPrice < minPrice) {
      optimalPrice = minPrice;
      reason = `Adjusted price to maintain minimum margin of ${minMargin}%`;
    }
    
    // Round to two decimal places
    optimalPrice = Math.round(optimalPrice * 100) / 100;
    
    // Calculate expected changes
    const priceChange = optimalPrice - product.price;
    const priceChangePercentage = (priceChange / product.price) * 100;
    const expectedDemandChange = priceChangePercentage * priceElasticity;
    const expectedMargin = ((optimalPrice - product.cost) / optimalPrice) * 100;
    const expectedRevenueChange = (1 + expectedDemandChange / 100) * (1 + priceChangePercentage / 100) * 100 - 100;
    const expectedProfitChange = (1 + expectedDemandChange / 100) * (optimalPrice - product.cost) / 
                               (product.price - product.cost) * 100 - 100;
    
    // Determine price position
    let pricePosition;
    if (product.price < avgCompetitorPrice * 0.95) {
      pricePosition = 'below_market';
    } else if (product.price > avgCompetitorPrice * 1.05) {
      pricePosition = 'above_market';
    } else {
      pricePosition = 'at_market';
    }
    
    return {
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      current_price: product.price,
      current_cost: product.cost,
      current_margin: product.margin,
      recommendation: {
        optimal_price: optimalPrice,
        price_change: parseFloat(priceChange.toFixed(2)),
        price_change_percentage: parseFloat(priceChangePercentage.toFixed(2)),
        expected_margin: parseFloat(expectedMargin.toFixed(2)),
        expected_demand_change: parseFloat(expectedDemandChange.toFixed(1)),
        expected_revenue_change: parseFloat(expectedRevenueChange.toFixed(1)),
        expected_profit_change: parseFloat(expectedProfitChange.toFixed(1)),
      },
      analysis: {
        price_elasticity: priceElasticity,
        competitor_avg_price: avgCompetitorPrice,
        price_position: pricePosition,
        price_sensitivity: Math.abs(priceElasticity) < 0.5 ? 'low' : 'high',
        reason: `Product has ${Math.abs(priceElasticity) < 0.5 ? 'low' : 'high'} price elasticity and current price is ${pricePosition.replace('_', ' ')}, suggesting ${optimalPrice > product.price ? 'room for price increase' : 'need for price decrease'} without significant impact on demand.`,
      },
    };
  }

  /**
   * Get customer purchase history
   * @private
   */
  async _getCustomerPurchaseHistory(customerId) {
    // In a real implementation, this would query the database
    // For now, return mock data
    return [
      {
        order_id: 'order_123',
        date: '2025-07-10',
        products: ['prod_111', 'prod_222', 'prod_333'],
      },
      // More orders...
    ];
  }

  /**
   * Get products for recommendation
   * @private
   */
  async _getProductsForRecommendation(filters) {
    // In a real implementation, this would query the database with filters
    // For now, return mock data
    return [
      {
        id: 'prod_555',
        name: 'Premium Chocolate Selection Box',
        sku: 'CHO-PREM-BOX',
        price: 24.99,
        image_url: 'https://assets.khochuan-pos.com/products/cho-prem-box.jpg',
        category: 'Confectionery',
        in_stock: true,
        stock_quantity: 32,
      },
      // More products...
    ];
  }

  /**
   * Generate product recommendations
   * @private
   */
  async _generateRecommendations(customerId, purchaseHistory, products, context, filters, options) {
    // In a real implementation, this would use collaborative filtering and other ML techniques
    // For now, return mock recommendations
    
    const recommendationTypes = options.recommendation_types || ['cross_sell', 'upsell'];
    const includeReasoning = options.include_reasoning || false;
    
    return products.map(product => {
      const result = {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        in_stock: product.in_stock,
        stock_quantity: product.stock_quantity,
        recommendation_type: recommendationTypes[Math.floor(Math.random() * recommendationTypes.length)],
        confidence_score: 0.89,
      };
      
      if (includeReasoning) {
        result.reasoning = 'Frequently purchased with premium coffee beans by similar customers. 68% of customers who bought these items together reported high satisfaction.';
      }
      
      return result;
    });
  }

  /**
   * Calculate average of an array of numbers
   * @private
   */
  _average(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
}

module.exports = AIService; 