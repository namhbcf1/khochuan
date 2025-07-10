/**
 * Customer Segmentation Module
 * Implements RFM (Recency, Frequency, Monetary) analysis to segment customers
 */

class CustomerSegmentation {
  /**
   * Create a new CustomerSegmentation instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      // Number of segments for each RFM dimension
      recencySegments: 5,
      frequencySegments: 5,
      monetarySegments: 5,
      // Weights for RFM dimensions (must sum to 1)
      recencyWeight: 0.35,
      frequencyWeight: 0.35,
      monetaryWeight: 0.3,
      // Default segment names and thresholds
      segmentDefinitions: [
        {
          name: 'Champions',
          description: 'Best customers who bought recently, buy often and spend the most',
          minScore: 4.5,
          maxScore: 5.0
        },
        {
          name: 'Loyal',
          description: 'Regular buyers',
          minScore: 3.5,
          maxScore: 4.5
        },
        {
          name: 'Potential Loyalists',
          description: 'Recent customers with average frequency',
          minScore: 3.0,
          maxScore: 3.5
        },
        {
          name: 'New Customers',
          description: 'First-time buyers',
          minScore: 2.5,
          maxScore: 3.0
        },
        {
          name: 'Promising',
          description: 'Recent customers with low frequency but good spending',
          minScore: 2.0,
          maxScore: 2.5
        },
        {
          name: 'Needs Attention',
          description: 'Above average recency/frequency but low monetary',
          minScore: 1.5,
          maxScore: 2.0
        },
        {
          name: 'At Risk',
          description: 'Previous loyal customers who haven\'t purchased recently',
          minScore: 1.0,
          maxScore: 1.5
        },
        {
          name: 'Can\'t Lose',
          description: 'Customers who spent big but a long time ago',
          minScore: 0.5,
          maxScore: 1.0
        },
        {
          name: 'Lost',
          description: 'Lowest scores in all categories',
          minScore: 0.0,
          maxScore: 0.5
        }
      ],
      ...options
    };
  }

  /**
   * Segment customers based on their transaction history
   * @param {Array} customers - Array of customer objects with transaction history
   * @param {Object} options - Additional segmentation options
   * @returns {Object} Segmentation results
   */
  segmentCustomers(customers, options = {}) {
    try {
      // Merge options
      const segmentationOptions = {
        ...this.options,
        ...options
      };

      // Calculate RFM scores
      const customersWithScores = this._calculateRFMScores(customers, segmentationOptions);

      // Group customers into segments
      const segments = this._createSegments(customersWithScores, segmentationOptions);

      // Return results
      return {
        segments,
        metrics: {
          total_customers: customers.length,
          analyzed_customers: customersWithScores.length,
          analysis_date: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error in customer segmentation:', error);
      throw new Error(`Customer segmentation failed: ${error.message}`);
    }
  }

  /**
   * Calculate RFM scores for each customer
   * @private
   */
  _calculateRFMScores(customers, options) {
    // Get current date for recency calculation
    const currentDate = new Date();

    // Extract RFM values
    const rfmValues = customers.map(customer => {
      // Calculate recency (days since last purchase)
      const lastPurchaseDate = new Date(customer.last_purchase_date);
      const recency = Math.max(0, Math.floor((currentDate - lastPurchaseDate) / (1000 * 60 * 60 * 24)));

      // Get frequency (number of purchases)
      const frequency = customer.purchase_count || 0;

      // Get monetary value (total spent)
      const monetary = customer.total_spent || 0;

      return {
        customer,
        recency,
        frequency,
        monetary
      };
    });

    // Find min/max values for normalization
    const recencyValues = rfmValues.map(c => c.recency);
    const frequencyValues = rfmValues.map(c => c.frequency);
    const monetaryValues = rfmValues.map(c => c.monetary);

    const recencyMin = Math.min(...recencyValues);
    const recencyMax = Math.max(...recencyValues);
    const frequencyMin = Math.min(...frequencyValues);
    const frequencyMax = Math.max(...frequencyValues);
    const monetaryMin = Math.min(...monetaryValues);
    const monetaryMax = Math.max(...monetaryValues);

    // Calculate scores
    return rfmValues.map(rfm => {
      // For recency, lower is better (more recent), so we invert the score
      const recencyScore = recencyMax === recencyMin ? 5 : 
        options.recencySegments - ((rfm.recency - recencyMin) / (recencyMax - recencyMin) * options.recencySegments) + 1;
      
      // For frequency and monetary, higher is better
      const frequencyScore = frequencyMax === frequencyMin ? 5 : 
        ((rfm.frequency - frequencyMin) / (frequencyMax - frequencyMin) * options.frequencySegments) + 1;
      
      const monetaryScore = monetaryMax === monetaryMin ? 5 : 
        ((rfm.monetary - monetaryMin) / (monetaryMax - monetaryMin) * options.monetarySegments) + 1;

      // Calculate combined RFM score (weighted average)
      const rfmScore = 
        (recencyScore * options.recencyWeight) + 
        (frequencyScore * options.frequencyWeight) + 
        (monetaryScore * options.monetaryWeight);

      return {
        ...rfm.customer,
        r_score: Math.min(5, Math.max(1, Math.round(recencyScore * 10) / 10)),
        f_score: Math.min(5, Math.max(1, Math.round(frequencyScore * 10) / 10)),
        m_score: Math.min(5, Math.max(1, Math.round(monetaryScore * 10) / 10)),
        rfm_score: Math.min(5, Math.max(0, Math.round(rfmScore * 100) / 100))
      };
    });
  }

  /**
   * Group customers into segments based on their RFM scores
   * @private
   */
  _createSegments(customersWithScores, options) {
    // Group customers into segments
    const segments = options.segmentDefinitions.map(segment => {
      const segmentCustomers = customersWithScores.filter(
        customer => customer.rfm_score >= segment.minScore && customer.rfm_score < segment.maxScore
      );

      return {
        segment_name: segment.name,
        segment_description: segment.description,
        customer_count: segmentCustomers.length,
        percentage: customersWithScores.length > 0 ? 
          (segmentCustomers.length / customersWithScores.length * 100).toFixed(1) : 0,
        avg_recency: this._average(segmentCustomers.map(c => c.r_score)),
        avg_frequency: this._average(segmentCustomers.map(c => c.f_score)),
        avg_monetary: this._average(segmentCustomers.map(c => c.m_score)),
        customers: segmentCustomers.map(c => ({
          id: c.customer_id,
          name: c.name,
          email: c.email,
          r_score: c.r_score,
          f_score: c.f_score,
          m_score: c.m_score,
          rfm_score: c.rfm_score,
          last_purchase: c.last_purchase_date,
          purchase_count: c.purchase_count,
          total_spent: c.total_spent
        }))
      };
    });

    // Sort segments by average RFM score (descending)
    return segments.sort((a, b) => {
      const aScore = (a.avg_recency + a.avg_frequency + a.avg_monetary) / 3;
      const bScore = (b.avg_recency + b.avg_frequency + b.avg_monetary) / 3;
      return bScore - aScore;
    });
  }

  /**
   * Calculate average of an array of numbers
   * @private
   */
  _average(arr) {
    if (!arr || arr.length === 0) return 0;
    return Math.round((arr.reduce((sum, val) => sum + val, 0) / arr.length) * 100) / 100;
  }
}

module.exports = CustomerSegmentation; 