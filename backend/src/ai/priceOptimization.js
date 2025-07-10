/**
 * Price Optimization Module
 * Implements price elasticity modeling and competitor-based pricing strategies
 */

class PriceOptimization {
  /**
   * Create a new PriceOptimization instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      // Default pricing strategies
      strategies: {
        profit_max: {
          name: 'Profit Maximization',
          description: 'Maximize profit based on price elasticity',
          competitorWeight: 0.1
        },
        revenue_max: {
          name: 'Revenue Maximization',
          description: 'Maximize revenue based on price elasticity',
          competitorWeight: 0.2
        },
        market_share: {
          name: 'Market Share',
          description: 'Gain market share by undercutting competitors',
          competitorWeight: 0.8
        },
        balanced: {
          name: 'Balanced',
          description: 'Balance profit optimization with competitive positioning',
          competitorWeight: 0.3
        }
      },
      // Default minimum margin percentage
      defaultMinMargin: 15,
      // Default competitor weight
      defaultCompetitorWeight: 0.3,
      // Elasticity estimation parameters
      elasticityEstimation: {
        defaultElasticity: -1.5, // Default price elasticity if not enough data
        minDataPoints: 5, // Minimum data points to estimate elasticity
        maxElasticity: -0.1, // Maximum elasticity (least sensitive)
        minElasticity: -3.0 // Minimum elasticity (most sensitive)
      },
      ...options
    };
  }

  /**
   * Optimize prices for products
   * @param {Array} productsData - Product data with sales history
   * @param {Array} competitorData - Competitor pricing data
   * @param {Object} options - Optimization options
   * @returns {Object} Price optimization results
   */
  optimizePrices(productsData, competitorData, options = {}) {
    try {
      // Merge options
      const optimizationOptions = {
        ...this.options,
        ...options
      };

      // Get strategy
      const strategy = optimizationOptions.strategy || 'balanced';
      const strategyConfig = this.options.strategies[strategy] || this.options.strategies.balanced;
      
      // Get minimum margin
      const minMargin = optimizationOptions.minMargin || this.options.defaultMinMargin;
      
      // Get competitor weight
      const competitorWeight = optimizationOptions.competitorWeight || 
                              strategyConfig.competitorWeight ||
                              this.options.defaultCompetitorWeight;

      // Calculate optimal prices for each product
      const optimizations = productsData.map(product => {
        // Get competitor prices for this product
        const competitors = competitorData[product.id] || [];
        
        // Calculate optimal price
        return this._calculateOptimalPrice(
          product,
          competitors,
          strategy,
          minMargin,
          competitorWeight
        );
      });

      // Return results
      return {
        optimizations,
        metadata: {
          optimization_date: new Date().toISOString(),
          strategy,
          model_version: '2.1.0'
        }
      };
    } catch (error) {
      console.error('Error in price optimization:', error);
      throw new Error(`Price optimization failed: ${error.message}`);
    }
  }

  /**
   * Calculate optimal price for a product
   * @private
   */
  _calculateOptimalPrice(product, competitors, strategy, minMargin, competitorWeight) {
    // Calculate price elasticity
    const priceElasticity = this._estimatePriceElasticity(product);
    
    // Calculate average competitor price
    const avgCompetitorPrice = this._calculateAvgCompetitorPrice(competitors);
    
    // Calculate optimal price based on strategy
    let optimalPrice;
    let reason;
    
    switch (strategy) {
      case 'profit_max':
        // Profit maximization formula: p = c / (1 + 1/e)
        // where p = optimal price, c = cost, e = price elasticity
        optimalPrice = product.cost / (1 + 1/priceElasticity);
        reason = 'Maximizing profit based on price elasticity';
        break;
      
      case 'revenue_max':
        // Revenue maximization formula: p = c * (1 - 1/e)
        // where p = optimal price, c = cost, e = price elasticity
        optimalPrice = product.cost * (1 - priceElasticity);
        reason = 'Maximizing revenue based on price elasticity';
        break;
      
      case 'market_share':
        // Market share strategy: undercut competitors by 10%
        optimalPrice = avgCompetitorPrice * 0.9;
        reason = 'Undercutting competitors to gain market share';
        break;
      
      case 'balanced':
      default:
        // Balanced strategy: weighted average of profit-maximizing and competitor-based price
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
    
    // Determine price position relative to competitors
    let pricePosition;
    if (product.price < avgCompetitorPrice * 0.95) {
      pricePosition = 'below_market';
    } else if (product.price > avgCompetitorPrice * 1.05) {
      pricePosition = 'above_market';
    } else {
      pricePosition = 'at_market';
    }
    
    // Determine price sensitivity
    const priceSensitivity = Math.abs(priceElasticity) < 1.0 ? 'low' : 'high';
    
    // Prepare result
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
        price_sensitivity: priceSensitivity,
        reason: `Product has ${priceSensitivity} price elasticity and current price is ${pricePosition.replace('_', ' ')}, suggesting ${optimalPrice > product.price ? 'room for price increase' : 'need for price decrease'} without significant impact on demand.`,
      },
    };
  }

  /**
   * Estimate price elasticity for a product
   * @private
   */
  _estimatePriceElasticity(product) {
    // In a real implementation, this would use historical price and demand data
    // to estimate price elasticity using regression analysis
    
    // For now, return a mock value
    // Price elasticity is typically negative (demand decreases as price increases)
    // Values between -0.1 and -3.0 are common
    
    // Use product category to determine elasticity if available
    let baseElasticity;
    
    if (product.category_id) {
      // Different categories have different elasticities
      const categoryElasticities = {
        'cat_luxury': -0.5,  // Luxury goods are less elastic
        'cat_staples': -1.5, // Staple goods are more elastic
        'cat_beverages': -2.0, // Beverages tend to be elastic
        'cat_electronics': -1.8, // Electronics are fairly elastic
        'cat_clothing': -1.2  // Clothing is moderately elastic
      };
      
      baseElasticity = categoryElasticities[product.category_id] || this.options.elasticityEstimation.defaultElasticity;
    } else {
      baseElasticity = this.options.elasticityEstimation.defaultElasticity;
    }
    
    // Add some variation based on product margin
    // Higher margin products tend to be more elastic
    const marginFactor = product.margin / 50; // Normalize margin to 0-1 range (assuming 0-50% margins)
    const elasticity = baseElasticity * (1 + (marginFactor - 0.5) * 0.4);
    
    // Clamp to reasonable range
    return Math.max(
      this.options.elasticityEstimation.maxElasticity,
      Math.min(this.options.elasticityEstimation.minElasticity, elasticity)
    );
  }

  /**
   * Calculate average competitor price
   * @private
   */
  _calculateAvgCompetitorPrice(competitors) {
    if (!competitors || competitors.length === 0) {
      return 0;
    }
    
    const sum = competitors.reduce((total, competitor) => total + competitor.price, 0);
    return sum / competitors.length;
  }
}

module.exports = PriceOptimization; 