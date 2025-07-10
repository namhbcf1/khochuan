/**
 * Demand Forecasting Module
 * Implements time series analysis for inventory optimization
 */

class DemandForecasting {
  /**
   * Create a new DemandForecasting instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      // Default forecast periods in days
      forecastPeriods: {
        '7d': 7,
        '14d': 14,
        '30d': 30,
        '90d': 90
      },
      // Default confidence level for prediction intervals
      defaultConfidenceLevel: 0.95,
      // Minimum data points required for reliable forecasting
      minDataPoints: 14,
      // Seasonality detection parameters
      seasonalityDetection: {
        enabled: true,
        minPeriods: 2, // Minimum number of periods to detect seasonality
        maxLag: 7 // Maximum lag for autocorrelation (days)
      },
      // Safety stock calculation parameters
      safetyStock: {
        serviceLevel: 0.95, // Service level for safety stock calculation
        leadTime: 3 // Default lead time in days
      },
      ...options
    };
  }

  /**
   * Forecast demand for products
   * @param {Array} salesData - Historical sales data
   * @param {Object} options - Forecast options
   * @returns {Object} Forecast results
   */
  forecastDemand(salesData, options = {}) {
    try {
      // Merge options
      const forecastOptions = {
        ...this.options,
        ...options
      };

      // Get forecast period in days
      const forecastPeriod = forecastOptions.forecastPeriod || '30d';
      const days = forecastOptions.forecastPeriods[forecastPeriod] || 30;

      // Group sales data by product
      const productGroups = this._groupSalesByProduct(salesData);

      // Generate forecasts for each product
      const forecasts = Object.keys(productGroups).map(productId => {
        const productData = productGroups[productId];
        return this._generateProductForecast(
          productId,
          productData,
          days,
          forecastOptions.includeHistorical,
          forecastOptions.confidenceLevel || forecastOptions.defaultConfidenceLevel
        );
      });

      // Return results
      return {
        forecasts,
        metadata: {
          forecast_generated_at: new Date().toISOString(),
          forecast_period: forecastPeriod,
          model_version: '1.3.2',
          accuracy_metrics: {
            mape: this._calculateMAPE(forecasts),
            rmse: this._calculateRMSE(forecasts)
          }
        }
      };
    } catch (error) {
      console.error('Error in demand forecasting:', error);
      throw new Error(`Demand forecasting failed: ${error.message}`);
    }
  }

  /**
   * Group sales data by product
   * @private
   */
  _groupSalesByProduct(salesData) {
    const groups = {};
    
    salesData.forEach(sale => {
      const productId = sale.product_id;
      
      if (!groups[productId]) {
        groups[productId] = [];
      }
      
      groups[productId].push(sale);
    });
    
    return groups;
  }

  /**
   * Generate forecast for a specific product
   * @private
   */
  _generateProductForecast(productId, productData, days, includeHistorical, confidenceLevel) {
    // Get product details from first entry
    const productDetails = productData[0];
    
    // Prepare time series data
    const timeSeriesData = this._prepareTimeSeriesData(productData);
    
    // Check if we have enough data points
    if (timeSeriesData.length < this.options.minDataPoints) {
      // Use simple moving average if not enough data
      return this._generateSimpleForecast(productId, productDetails, timeSeriesData, days, confidenceLevel);
    }
    
    // Detect trend
    const trend = this._detectTrend(timeSeriesData);
    
    // Detect seasonality
    const seasonalFactors = this._detectSeasonality(timeSeriesData);
    
    // Generate daily forecast
    const forecast = this._generateDailyForecast(
      timeSeriesData,
      days,
      trend,
      seasonalFactors,
      confidenceLevel
    );
    
    // Calculate inventory recommendations
    const inventoryRecommendations = this._calculateInventoryRecommendations(
      forecast,
      productDetails.current_stock,
      this.options.safetyStock
    );
    
    // Prepare response
    return {
      product_id: productId,
      product_name: productDetails.product_name,
      sku: productDetails.sku,
      current_stock: productDetails.current_stock,
      forecast,
      summary: {
        total_predicted_demand: forecast.reduce((sum, day) => sum + day.predicted_demand, 0),
        avg_daily_demand: forecast.reduce((sum, day) => sum + day.predicted_demand, 0) / days,
        trend: trend.direction,
        seasonal_factors: seasonalFactors,
        stock_status: inventoryRecommendations.stockStatus,
        days_until_stockout: inventoryRecommendations.daysUntilStockout,
        reorder_recommendation: {
          should_reorder: inventoryRecommendations.shouldReorder,
          recommended_quantity: inventoryRecommendations.recommendedQuantity,
          optimal_order_date: inventoryRecommendations.optimalOrderDate
        }
      }
    };
  }

  /**
   * Prepare time series data from sales data
   * @private
   */
  _prepareTimeSeriesData(productData) {
    // Group by date
    const dateGroups = {};
    
    productData.forEach(sale => {
      const date = sale.date.split('T')[0]; // Extract YYYY-MM-DD
      
      if (!dateGroups[date]) {
        dateGroups[date] = 0;
      }
      
      dateGroups[date] += sale.quantity;
    });
    
    // Convert to array and sort by date
    return Object.keys(dateGroups)
      .map(date => ({
        date,
        quantity: dateGroups[date]
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Generate a simple forecast when not enough data is available
   * @private
   */
  _generateSimpleForecast(productId, productDetails, timeSeriesData, days, confidenceLevel) {
    // Calculate simple moving average
    const avgQuantity = timeSeriesData.length > 0
      ? timeSeriesData.reduce((sum, day) => sum + day.quantity, 0) / timeSeriesData.length
      : 0;
    
    // Generate forecast
    const forecast = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      // Add some random variation
      const variation = 0.2; // 20% variation
      const margin = avgQuantity * variation;
      const predicted = Math.max(0, Math.round(avgQuantity));
      
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        predicted_demand: predicted,
        lower_bound: Math.max(0, Math.round(predicted - margin)),
        upper_bound: Math.round(predicted + margin),
        confidence: confidenceLevel
      });
    }
    
    // Calculate inventory recommendations
    const inventoryRecommendations = this._calculateInventoryRecommendations(
      forecast,
      productDetails.current_stock,
      this.options.safetyStock
    );
    
    // Return forecast
    return {
      product_id: productId,
      product_name: productDetails.product_name,
      sku: productDetails.sku,
      current_stock: productDetails.current_stock,
      forecast,
      summary: {
        total_predicted_demand: forecast.reduce((sum, day) => sum + day.predicted_demand, 0),
        avg_daily_demand: avgQuantity,
        trend: 'stable',
        seasonal_factors: {
          monday: 1.0,
          tuesday: 1.0,
          wednesday: 1.0,
          thursday: 1.0,
          friday: 1.0,
          saturday: 1.0,
          sunday: 1.0
        },
        stock_status: inventoryRecommendations.stockStatus,
        days_until_stockout: inventoryRecommendations.daysUntilStockout,
        reorder_recommendation: {
          should_reorder: inventoryRecommendations.shouldReorder,
          recommended_quantity: inventoryRecommendations.recommendedQuantity,
          optimal_order_date: inventoryRecommendations.optimalOrderDate
        }
      }
    };
  }

  /**
   * Detect trend in time series data
   * @private
   */
  _detectTrend(timeSeriesData) {
    // Need at least 2 data points to detect trend
    if (timeSeriesData.length < 2) {
      return { slope: 0, direction: 'stable' };
    }
    
    // Simple linear regression
    const n = timeSeriesData.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = timeSeriesData.map(day => day.quantity);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Determine trend direction
    let direction;
    if (Math.abs(slope) < 0.05) {
      direction = 'stable';
    } else if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }
    
    return { slope, direction };
  }

  /**
   * Detect seasonality in time series data
   * @private
   */
  _detectSeasonality(timeSeriesData) {
    // Default seasonal factors (no seasonality)
    const defaultFactors = {
      monday: 1.0,
      tuesday: 1.0,
      wednesday: 1.0,
      thursday: 1.0,
      friday: 1.0,
      saturday: 1.0,
      sunday: 1.0
    };
    
    // Need enough data to detect seasonality
    if (!this.options.seasonalityDetection.enabled || 
        timeSeriesData.length < 7 * this.options.seasonalityDetection.minPeriods) {
      return defaultFactors;
    }
    
    // Group by day of week
    const dayGroups = {
      0: [], // Sunday
      1: [], // Monday
      2: [], // Tuesday
      3: [], // Wednesday
      4: [], // Thursday
      5: [], // Friday
      6: []  // Saturday
    };
    
    timeSeriesData.forEach(day => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      dayGroups[dayOfWeek].push(day.quantity);
    });
    
    // Calculate average for each day
    const dayAverages = {};
    let overallAverage = 0;
    let totalDays = 0;
    
    for (let day = 0; day < 7; day++) {
      if (dayGroups[day].length > 0) {
        const sum = dayGroups[day].reduce((a, b) => a + b, 0);
        dayAverages[day] = sum / dayGroups[day].length;
        overallAverage += sum;
        totalDays += dayGroups[day].length;
      } else {
        dayAverages[day] = 0;
      }
    }
    
    overallAverage = overallAverage / totalDays;
    
    // Calculate seasonal factors
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const seasonalFactors = {};
    
    for (let day = 0; day < 7; day++) {
      const factor = overallAverage > 0 ? dayAverages[day] / overallAverage : 1.0;
      seasonalFactors[dayNames[day]] = Math.round(factor * 10) / 10;
    }
    
    return seasonalFactors;
  }

  /**
   * Generate daily forecast
   * @private
   */
  _generateDailyForecast(timeSeriesData, days, trend, seasonalFactors, confidenceLevel) {
    const forecast = [];
    const today = new Date();
    
    // Calculate base forecast (moving average)
    const recentDays = Math.min(timeSeriesData.length, 14); // Use last 14 days
    const recentData = timeSeriesData.slice(-recentDays);
    const baseValue = recentData.reduce((sum, day) => sum + day.quantity, 0) / recentDays;
    
    // Generate forecast for each day
    for (let i = 0; i < days; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      const dateStr = forecastDate.toISOString().split('T')[0];
      const dayOfWeek = forecastDate.getDay();
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
      
      // Apply trend and seasonality
      const trendFactor = 1 + (trend.slope * i);
      const seasonalFactor = seasonalFactors[dayName];
      
      // Calculate predicted demand
      const predicted = Math.max(0, Math.round(baseValue * trendFactor * seasonalFactor));
      
      // Calculate prediction interval
      const zScore = this._getZScore(confidenceLevel);
      const stdDev = this._estimateStdDev(timeSeriesData);
      const margin = Math.ceil(stdDev * zScore);
      
      forecast.push({
        date: dateStr,
        predicted_demand: predicted,
        lower_bound: Math.max(0, predicted - margin),
        upper_bound: predicted + margin,
        confidence: confidenceLevel
      });
    }
    
    return forecast;
  }

  /**
   * Calculate inventory recommendations
   * @private
   */
  _calculateInventoryRecommendations(forecast, currentStock, safetyStockOptions) {
    // Calculate days until stockout
    let cumulativeDemand = 0;
    let daysUntilStockout = forecast.length;
    
    for (let i = 0; i < forecast.length; i++) {
      cumulativeDemand += forecast[i].predicted_demand;
      
      if (cumulativeDemand > currentStock) {
        daysUntilStockout = i;
        break;
      }
    }
    
    // Determine stock status
    let stockStatus;
    if (daysUntilStockout < 7) {
      stockStatus = 'critical';
    } else if (daysUntilStockout < 14) {
      stockStatus = 'low';
    } else {
      stockStatus = 'adequate';
    }
    
    // Calculate safety stock
    const avgDailyDemand = forecast.reduce((sum, day) => sum + day.predicted_demand, 0) / forecast.length;
    const stdDevDemand = this._calculateStdDev(forecast.map(day => day.predicted_demand));
    const leadTime = safetyStockOptions.leadTime;
    const serviceLevel = safetyStockOptions.serviceLevel;
    const zScore = this._getZScore(serviceLevel);
    
    const safetyStock = Math.ceil(zScore * stdDevDemand * Math.sqrt(leadTime));
    
    // Calculate reorder point
    const reorderPoint = Math.ceil(avgDailyDemand * leadTime + safetyStock);
    
    // Calculate recommended order quantity
    const eoq = Math.ceil(Math.sqrt(2 * 30 * avgDailyDemand * 50 / (0.2 * avgDailyDemand)));
    const recommendedQuantity = Math.max(eoq, reorderPoint - currentStock + avgDailyDemand * 14);
    
    // Determine if reorder is needed
    const shouldReorder = currentStock <= reorderPoint;
    
    // Calculate optimal order date
    const optimalOrderDate = new Date();
    if (daysUntilStockout > leadTime) {
      optimalOrderDate.setDate(optimalOrderDate.getDate() + daysUntilStockout - leadTime);
    }
    
    return {
      stockStatus,
      daysUntilStockout,
      shouldReorder,
      recommendedQuantity: Math.round(recommendedQuantity),
      optimalOrderDate: optimalOrderDate.toISOString().split('T')[0]
    };
  }

  /**
   * Get Z-score for a given confidence level
   * @private
   */
  _getZScore(confidenceLevel) {
    // Common z-scores for confidence levels
    const zScores = {
      0.50: 0.67,
      0.75: 1.15,
      0.80: 1.28,
      0.85: 1.44,
      0.90: 1.64,
      0.95: 1.96,
      0.99: 2.58
    };
    
    // Find closest confidence level
    const levels = Object.keys(zScores).map(Number);
    const closest = levels.reduce((prev, curr) => 
      Math.abs(curr - confidenceLevel) < Math.abs(prev - confidenceLevel) ? curr : prev
    );
    
    return zScores[closest];
  }

  /**
   * Estimate standard deviation from historical data
   * @private
   */
  _estimateStdDev(timeSeriesData) {
    if (timeSeriesData.length < 2) return 1;
    
    const quantities = timeSeriesData.map(day => day.quantity);
    return this._calculateStdDev(quantities);
  }

  /**
   * Calculate standard deviation
   * @private
   */
  _calculateStdDev(values) {
    const n = values.length;
    if (n < 2) return 1;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate Mean Absolute Percentage Error (MAPE)
   * @private
   */
  _calculateMAPE(forecasts) {
    // In a real implementation, this would compare forecasts to actual values
    // For now, return a mock value
    return 0.12;
  }

  /**
   * Calculate Root Mean Square Error (RMSE)
   * @private
   */
  _calculateRMSE(forecasts) {
    // In a real implementation, this would compare forecasts to actual values
    // For now, return a mock value
    return 3.4;
  }
}

module.exports = DemandForecasting; 