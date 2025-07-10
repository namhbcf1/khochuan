/**
 * KhoChuan POS - Analytics Service
 * Provides business insights and analytics data
 */

export class AnalyticsService {
  constructor(db, env) {
    this.db = db;
    this.env = env;
  }

  /**
   * Get dashboard overview data
   * @param {string} period - Time period (today, week, month, year)
   * @returns {Promise<Object>} - Dashboard overview data
   */
  async getDashboardOverview(period = 'today') {
    // Determine date range based on period
    let dateCondition;
    switch (period) {
      case 'week':
        dateCondition = `datetime('now', '-7 days')`;
        break;
      case 'month':
        dateCondition = `datetime('now', '-30 days')`;
        break;
      case 'year':
        dateCondition = `datetime('now', '-365 days')`;
        break;
      case 'today':
      default:
        dateCondition = `datetime('now', 'start of day')`;
        break;
    }

    // Get sales statistics
    const salesQuery = `
      SELECT 
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as avg_order_value,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM orders
      WHERE created_at >= ${dateCondition}
        AND order_status = 'completed'
    `;
    
    const salesStats = await this.db.queryOne(salesQuery);
    
    // Get inventory statistics
    const inventoryQuery = `
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN stock_quantity <= reorder_level THEN 1 END) as low_stock_count,
        SUM(stock_quantity * cost_price) as inventory_value
      FROM products
      WHERE is_active = 1
    `;
    
    const inventoryStats = await this.db.queryOne(inventoryQuery);
    
    // Get customer statistics
    const customerQuery = `
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN created_at >= ${dateCondition} THEN 1 END) as new_customers,
        COALESCE(AVG(total_spent), 0) as avg_customer_value
      FROM customers
      WHERE is_active = 1
    `;
    
    const customerStats = await this.db.queryOne(customerQuery);
    
    // Get top selling products
    const topProductsQuery = `
      SELECT 
        p.id, p.name, p.sku, p.price, p.image_url,
        SUM(oi.quantity) as quantity_sold,
        COALESCE(SUM(oi.subtotal), 0) as total_sales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= ${dateCondition}
        AND o.order_status = 'completed'
      GROUP BY p.id
      ORDER BY quantity_sold DESC
      LIMIT 5
    `;
    
    const topProducts = await this.db.query(topProductsQuery);
    
    // Get sales by payment method
    const paymentMethodQuery = `
      SELECT 
        payment_method,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as total
      FROM orders
      WHERE created_at >= ${dateCondition}
        AND order_status = 'completed'
      GROUP BY payment_method
    `;
    
    const paymentMethods = await this.db.query(paymentMethodQuery);
    
    // Return dashboard overview data
    return {
      period,
      sales: salesStats || {
        order_count: 0,
        total_revenue: 0,
        avg_order_value: 0,
        unique_customers: 0
      },
      inventory: inventoryStats || {
        total_products: 0,
        low_stock_count: 0,
        inventory_value: 0
      },
      customers: customerStats || {
        total_customers: 0,
        new_customers: 0,
        avg_customer_value: 0
      },
      top_products: topProducts.results || [],
      payment_methods: paymentMethods.results || []
    };
  }

  /**
   * Get sales trends data
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Sales trends data
   */
  async getSalesTrends(options = {}) {
    const { 
      start_date, 
      end_date, 
      group_by = 'day'
    } = options;
    
    // Validate dates
    if (!start_date || !end_date) {
      throw new Error('Start date and end date are required');
    }
    
    // Build group by clause
    let groupFormat;
    switch (group_by) {
      case 'day':
        groupFormat = '%Y-%m-%d';
        break;
      case 'week':
        groupFormat = '%Y-%W';
        break;
      case 'month':
        groupFormat = '%Y-%m';
        break;
      case 'year':
        groupFormat = '%Y';
        break;
      default:
        groupFormat = '%Y-%m-%d';
    }
    
    // Get sales trends
    const salesTrendsQuery = `
      SELECT 
        strftime('${groupFormat}', created_at) as period,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as avg_order_value
      FROM orders
      WHERE DATE(created_at) BETWEEN ? AND ?
        AND order_status = 'completed'
      GROUP BY period
      ORDER BY period
    `;
    
    const salesTrends = await this.db.query(salesTrendsQuery, [start_date, end_date]);
    
    // Get sales by product category
    const categorySalesQuery = `
      SELECT 
        c.id, c.name, c.color,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(oi.subtotal), 0) as total_sales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) BETWEEN ? AND ?
        AND o.order_status = 'completed'
      GROUP BY c.id
      ORDER BY total_sales DESC
    `;
    
    const categorySales = await this.db.query(categorySalesQuery, [start_date, end_date]);
    
    // Return sales trends data
    return {
      start_date,
      end_date,
      group_by,
      sales_trends: salesTrends.results || [],
      category_sales: categorySales.results || []
    };
  }

  /**
   * Get customer insights
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Customer insights data
   */
  async getCustomerInsights(options = {}) {
    const { period = 'month' } = options;
    
    // Determine date range based on period
    let dateCondition;
    switch (period) {
      case 'week':
        dateCondition = `datetime('now', '-7 days')`;
        break;
      case 'month':
        dateCondition = `datetime('now', '-30 days')`;
        break;
      case 'year':
        dateCondition = `datetime('now', '-365 days')`;
        break;
      case 'all':
        dateCondition = `datetime('now', '-100 years')`;
        break;
      default:
        dateCondition = `datetime('now', '-30 days')`;
        break;
    }
    
    // Get customer segments
    const segmentsQuery = `
      SELECT 
        CASE 
          WHEN total_spent >= 10000 THEN 'VIP'
          WHEN total_spent >= 5000 THEN 'High Value'
          WHEN total_spent >= 1000 THEN 'Regular'
          ELSE 'New/Low Value'
        END as segment,
        COUNT(*) as customer_count,
        COALESCE(SUM(total_spent), 0) as total_spent,
        COALESCE(AVG(total_spent), 0) as avg_spent,
        COALESCE(AVG(visit_count), 0) as avg_visits
      FROM customers
      WHERE is_active = 1
      GROUP BY segment
      ORDER BY avg_spent DESC
    `;
    
    const segments = await this.db.query(segmentsQuery);
    
    // Get customer acquisition
    const acquisitionQuery = `
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as new_customers
      FROM customers
      WHERE created_at >= ${dateCondition}
      GROUP BY month
      ORDER BY month
    `;
    
    const acquisition = await this.db.query(acquisitionQuery);
    
    // Get customer retention (customers who made more than one purchase)
    const retentionQuery = `
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN visit_count > 1 THEN 1 END) as returning_customers,
        ROUND(COUNT(CASE WHEN visit_count > 1 THEN 1 END) * 100.0 / COUNT(*), 2) as retention_rate
      FROM customers
      WHERE created_at >= ${dateCondition}
        AND is_active = 1
    `;
    
    const retention = await this.db.queryOne(retentionQuery);
    
    // Get top customers
    const topCustomersQuery = `
      SELECT 
        c.id, c.name, c.email, c.phone,
        c.total_spent, c.visit_count, c.loyalty_points,
        MAX(o.created_at) as last_purchase_date
      FROM customers c
      JOIN orders o ON c.id = o.customer_id
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.total_spent DESC
      LIMIT 10
    `;
    
    const topCustomers = await this.db.query(topCustomersQuery);
    
    // Return customer insights data
    return {
      period,
      segments: segments.results || [],
      acquisition: acquisition.results || [],
      retention: retention || {
        total_customers: 0,
        returning_customers: 0,
        retention_rate: 0
      },
      top_customers: topCustomers.results || []
    };
  }

  /**
   * Get inventory analytics
   * @returns {Promise<Object>} - Inventory analytics data
   */
  async getInventoryAnalytics() {
    // Get inventory overview
    const overviewQuery = `
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN stock_quantity <= reorder_level THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock_count,
        COALESCE(SUM(stock_quantity * cost_price), 0) as inventory_value,
        COALESCE(AVG(stock_quantity), 0) as avg_stock_level
      FROM products
      WHERE is_active = 1
    `;
    
    const overview = await this.db.queryOne(overviewQuery);
    
    // Get inventory by category
    const categoryQuery = `
      SELECT 
        c.id, c.name, c.color,
        COUNT(p.id) as product_count,
        COALESCE(SUM(p.stock_quantity), 0) as total_stock,
        COALESCE(SUM(p.stock_quantity * p.cost_price), 0) as inventory_value
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
      GROUP BY c.id
      ORDER BY inventory_value DESC
    `;
    
    const categories = await this.db.query(categoryQuery);
    
    // Get low stock products
    const lowStockQuery = `
      SELECT 
        p.id, p.name, p.sku, p.stock_quantity, p.reorder_level,
        c.name as category_name,
        COALESCE(SUM(oi.quantity), 0) as quantity_sold_30days
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= datetime('now', '-30 days')
      WHERE p.is_active = 1 AND p.stock_quantity <= p.reorder_level
      GROUP BY p.id
      ORDER BY p.stock_quantity ASC
      LIMIT 20
    `;
    
    const lowStock = await this.db.query(lowStockQuery);
    
    // Get inventory turnover (sales velocity)
    const turnoverQuery = `
      SELECT 
        p.id, p.name, p.sku, p.stock_quantity,
        COALESCE(SUM(oi.quantity), 0) as quantity_sold_30days,
        CASE 
          WHEN p.stock_quantity > 0 THEN ROUND(COALESCE(SUM(oi.quantity), 0) * 30.0 / p.stock_quantity, 2)
          ELSE 0
        END as turnover_rate
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= datetime('now', '-30 days')
      WHERE p.is_active = 1
      GROUP BY p.id
      ORDER BY turnover_rate DESC
      LIMIT 20
    `;
    
    const turnover = await this.db.query(turnoverQuery);
    
    // Return inventory analytics data
    return {
      overview: overview || {
        total_products: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        inventory_value: 0,
        avg_stock_level: 0
      },
      categories: categories.results || [],
      low_stock: lowStock.results || [],
      turnover: turnover.results || []
    };
  }

  /**
   * Get staff performance analytics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Staff performance data
   */
  async getStaffPerformance(options = {}) {
    const { period = 'month' } = options;
    
    // Determine date range based on period
    let dateCondition;
    switch (period) {
      case 'week':
        dateCondition = `datetime('now', '-7 days')`;
        break;
      case 'month':
        dateCondition = `datetime('now', '-30 days')`;
        break;
      case 'year':
        dateCondition = `datetime('now', '-365 days')`;
        break;
      default:
        dateCondition = `datetime('now', '-30 days')`;
        break;
    }
    
    // Get staff sales performance
    const salesQuery = `
      SELECT 
        u.id, u.name, u.role, u.avatar_url,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_sales,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value,
        COUNT(DISTINCT o.customer_id) as unique_customers
      FROM users u
      LEFT JOIN orders o ON u.id = o.cashier_id AND o.created_at >= ${dateCondition}
      WHERE u.role IN ('cashier', 'staff')
        AND u.is_active = 1
      GROUP BY u.id
      ORDER BY total_sales DESC
    `;
    
    const salesPerformance = await this.db.query(salesQuery);
    
    // Get staff gamification stats
    const gamificationQuery = `
      SELECT 
        u.id, u.name,
        s.total_points, s.level, s.current_streak,
        s.commission_earned
      FROM staff_stats s
      JOIN users u ON s.user_id = u.id
      WHERE u.is_active = 1
      ORDER BY s.total_points DESC
    `;
    
    const gamificationStats = await this.db.query(gamificationQuery);
    
    // Get staff activity logs
    const activityQuery = `
      SELECT 
        u.id, u.name,
        COUNT(a.id) as activity_count,
        MAX(a.created_at) as last_activity
      FROM users u
      LEFT JOIN activity_logs a ON u.id = a.user_id AND a.created_at >= ${dateCondition}
      WHERE u.role IN ('cashier', 'staff', 'admin')
        AND u.is_active = 1
      GROUP BY u.id
      ORDER BY activity_count DESC
    `;
    
    const activityStats = await this.db.query(activityQuery);
    
    // Return staff performance data
    return {
      period,
      sales_performance: salesPerformance.results || [],
      gamification: gamificationStats.results || [],
      activity: activityStats.results || []
    };
  }
} 