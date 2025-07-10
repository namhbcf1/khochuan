/**
 * KhoChuan POS - Order Service
 * Handles order management, processing, and transactions
 */

export class OrderService {
  constructor(db, env) {
    this.db = db;
    this.env = env;
  }

  /**
   * Get all orders with optional filtering
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} - List of orders with pagination
   */
  async getOrders(filters = {}) {
    const {
      customer_id,
      cashier_id,
      payment_method,
      order_status,
      date_from,
      date_to,
      search,
      sort_by = 'created_at',
      sort_dir = 'desc',
      page = 1,
      limit = 20
    } = filters;

    // Build where clause
    let whereConditions = [];
    let params = [];

    if (customer_id) {
      whereConditions.push('o.customer_id = ?');
      params.push(customer_id);
    }

    if (cashier_id) {
      whereConditions.push('o.cashier_id = ?');
      params.push(cashier_id);
    }

    if (payment_method) {
      whereConditions.push('o.payment_method = ?');
      params.push(payment_method);
    }

    if (order_status) {
      whereConditions.push('o.order_status = ?');
      params.push(order_status);
    }

    if (date_from && date_to) {
      whereConditions.push('DATE(o.created_at) BETWEEN ? AND ?');
      params.push(date_from, date_to);
    }

    if (search) {
      whereConditions.push('(o.order_number LIKE ? OR c.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Build order clause
    const validSortColumns = ['created_at', 'total_amount', 'order_number'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_dir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const orderClause = `ORDER BY o.${sortColumn} ${sortDirection}`;

    // Build pagination
    const offset = (page - 1) * limit;
    const paginationClause = `LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute query
    const query = `
      SELECT 
        o.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        u.name as cashier_name,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.cashier_id = u.id
      ${whereClause}
      ${orderClause}
      ${paginationClause}
    `;

    const result = await this.db.query(query, params);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ${whereClause}
    `;
    
    const countResult = await this.db.queryOne(countQuery, params.slice(0, -2));
    const total = countResult ? countResult.total : 0;
    
    return {
      orders: result.results || [],
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} - Order object with items
   */
  async getOrderById(id) {
    // Get order
    const order = await this.db.queryOne(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        u.name as cashier_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.cashier_id = u.id
      WHERE o.id = ?
    `, [id]);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Get order items
    const items = await this.db.query(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.sku as product_sku,
        p.image_url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.created_at
    `, [id]);
    
    // Return order with items
    return {
      ...order,
      items: items.results || []
    };
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} - Created order
   */
  async createOrder(orderData) {
    // Generate ID if not provided
    const id = orderData.id || this.db.generateId();
    
    // Generate order number
    const orderNumber = orderData.order_number || this.generateOrderNumber();
    
    // Validate required fields
    if (!orderData.cashier_id) {
      throw new Error('Cashier ID is required');
    }
    
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    
    // Start transaction
    return await this.db.transaction(async (tx) => {
      // Check product stock
      for (const item of orderData.items) {
        const product = await this.db.findById('products', item.product_id);
        if (!product) {
          throw new Error(`Product not found: ${item.product_id}`);
        }
        
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }
      }
      
      // Create order
      const order = {
        id,
        order_number: orderNumber,
        customer_id: orderData.customer_id || null,
        cashier_id: orderData.cashier_id,
        subtotal: orderData.subtotal,
        tax_amount: orderData.tax_amount || 0,
        discount_amount: orderData.discount_amount || 0,
        total_amount: orderData.total_amount,
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_status || 'completed',
        order_status: orderData.order_status || 'completed',
        notes: orderData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await this.db.insert('orders', order);
      
      // Create order items
      for (const item of orderData.items) {
        const orderItem = {
          id: this.db.generateId(),
          order_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          discount_amount: item.discount_amount || 0,
          created_at: new Date().toISOString()
        };
        
        await this.db.insert('order_items', orderItem);
        
        // Update product stock
        const product = await this.db.findById('products', item.product_id);
        const newQuantity = product.stock_quantity - item.quantity;
        
        await this.db.update('products', item.product_id, {
          stock_quantity: newQuantity,
          updated_at: new Date().toISOString()
        });
        
        // Log inventory change
        await this.db.insert('inventory_logs', {
          id: this.db.generateId(),
          product_id: item.product_id,
          user_id: orderData.cashier_id,
          type: 'sale',
          quantity_change: -item.quantity,
          previous_quantity: product.stock_quantity,
          new_quantity: newQuantity,
          reason: `Order ${orderNumber}`,
          reference_id: id,
          created_at: new Date().toISOString()
        });
      }
      
      // Update customer stats if customer is specified
      if (orderData.customer_id) {
        const customer = await this.db.findById('customers', orderData.customer_id);
        if (customer) {
          // Calculate loyalty points (1 point per 10 currency units spent)
          const loyaltyPoints = Math.floor(orderData.total_amount / 10);
          
          await this.db.update('customers', orderData.customer_id, {
            total_spent: customer.total_spent + orderData.total_amount,
            visit_count: customer.visit_count + 1,
            loyalty_points: customer.loyalty_points + loyaltyPoints,
            last_visit: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
          // Log loyalty points transaction
          if (loyaltyPoints > 0) {
            await this.db.insert('loyalty_transactions', {
              id: this.db.generateId(),
              customer_id: orderData.customer_id,
              points: loyaltyPoints,
              type: 'earn',
              reason: `Order ${orderNumber}`,
              reference_id: id,
              created_at: new Date().toISOString()
            });
          }
        }
      }
      
      // Update staff stats
      const staffStats = await this.db.findByField('staff_stats', 'user_id', orderData.cashier_id);
      
      if (staffStats) {
        // Calculate staff points (1 point per 20 currency units sold)
        const staffPoints = Math.floor(orderData.total_amount / 20);
        
        await this.db.update('staff_stats', staffStats.id, {
          total_sales: staffStats.total_sales + orderData.total_amount,
          total_orders: staffStats.total_orders + 1,
          total_points: staffStats.total_points + staffPoints,
          last_sale: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new staff stats
        const staffPoints = Math.floor(orderData.total_amount / 20);
        
        await this.db.insert('staff_stats', {
          id: this.db.generateId(),
          user_id: orderData.cashier_id,
          total_sales: orderData.total_amount,
          total_orders: 1,
          total_points: staffPoints,
          current_streak: 1,
          level: 1,
          commission_earned: 0,
          last_sale: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      // Return created order
      return this.getOrderById(id);
    });
  }

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @param {string} userId - User ID making the change
   * @returns {Promise<Object>} - Updated order
   */
  async updateOrderStatus(id, status, userId) {
    // Check if order exists
    const order = await this.db.findById('orders', id);
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }
    
    // Update order
    await this.db.update('orders', id, {
      order_status: status,
      updated_at: new Date().toISOString()
    });
    
    // Log status change
    await this.db.insert('activity_logs', {
      id: this.db.generateId(),
      user_id: userId,
      action: 'order_status_update',
      entity_type: 'order',
      entity_id: id,
      old_values: JSON.stringify({ status: order.order_status }),
      new_values: JSON.stringify({ status }),
      created_at: new Date().toISOString()
    });
    
    // Return updated order
    return this.getOrderById(id);
  }

  /**
   * Process order refund
   * @param {string} id - Order ID
   * @param {Object} refundData - Refund data
   * @returns {Promise<Object>} - Updated order
   */
  async refundOrder(id, refundData) {
    // Check if order exists
    const order = await this.getOrderById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Check if order can be refunded
    if (order.order_status === 'refunded') {
      throw new Error('Order is already refunded');
    }
    
    if (order.order_status === 'cancelled') {
      throw new Error('Cancelled orders cannot be refunded');
    }
    
    // Start transaction
    return await this.db.transaction(async (tx) => {
      // Update order status
      await this.db.update('orders', id, {
        order_status: 'refunded',
        payment_status: 'refunded',
        notes: refundData.reason ? `${order.notes || ''} Refund: ${refundData.reason}` : order.notes,
        updated_at: new Date().toISOString()
      });
      
      // Process refund for each item if partial refund
      if (refundData.items && refundData.items.length > 0) {
        for (const refundItem of refundData.items) {
          const orderItem = order.items.find(item => item.id === refundItem.order_item_id);
          if (!orderItem) {
            throw new Error(`Order item not found: ${refundItem.order_item_id}`);
          }
          
          // Validate refund quantity
          if (refundItem.quantity > orderItem.quantity) {
            throw new Error(`Refund quantity exceeds ordered quantity for item: ${orderItem.product_name}`);
          }
          
          // Return stock to inventory
          const product = await this.db.findById('products', orderItem.product_id);
          if (product) {
            const newQuantity = product.stock_quantity + refundItem.quantity;
            
            await this.db.update('products', product.id, {
              stock_quantity: newQuantity,
              updated_at: new Date().toISOString()
            });
            
            // Log inventory change
            await this.db.insert('inventory_logs', {
              id: this.db.generateId(),
              product_id: product.id,
              user_id: refundData.user_id,
              type: 'refund',
              quantity_change: refundItem.quantity,
              previous_quantity: product.stock_quantity,
              new_quantity: newQuantity,
              reason: `Refund for order ${order.order_number}`,
              reference_id: id,
              created_at: new Date().toISOString()
            });
          }
        }
      } else {
        // Full refund - return all items to inventory
        for (const orderItem of order.items) {
          const product = await this.db.findById('products', orderItem.product_id);
          if (product) {
            const newQuantity = product.stock_quantity + orderItem.quantity;
            
            await this.db.update('products', product.id, {
              stock_quantity: newQuantity,
              updated_at: new Date().toISOString()
            });
            
            // Log inventory change
            await this.db.insert('inventory_logs', {
              id: this.db.generateId(),
              product_id: product.id,
              user_id: refundData.user_id,
              type: 'refund',
              quantity_change: orderItem.quantity,
              previous_quantity: product.stock_quantity,
              new_quantity: newQuantity,
              reason: `Refund for order ${order.order_number}`,
              reference_id: id,
              created_at: new Date().toISOString()
            });
          }
        }
      }
      
      // Adjust customer stats if customer exists
      if (order.customer_id) {
        const customer = await this.db.findById('customers', order.customer_id);
        if (customer) {
          // Calculate loyalty points to deduct
          const loyaltyPoints = Math.floor(order.total_amount / 10);
          
          await this.db.update('customers', order.customer_id, {
            total_spent: Math.max(0, customer.total_spent - order.total_amount),
            loyalty_points: Math.max(0, customer.loyalty_points - loyaltyPoints),
            updated_at: new Date().toISOString()
          });
          
          // Log loyalty points transaction
          if (loyaltyPoints > 0) {
            await this.db.insert('loyalty_transactions', {
              id: this.db.generateId(),
              customer_id: order.customer_id,
              points: -loyaltyPoints,
              type: 'refund',
              reason: `Refund for order ${order.order_number}`,
              reference_id: id,
              created_at: new Date().toISOString()
            });
          }
        }
      }
      
      // Log refund activity
      await this.db.insert('activity_logs', {
        id: this.db.generateId(),
        user_id: refundData.user_id,
        action: 'order_refund',
        entity_type: 'order',
        entity_id: id,
        new_values: JSON.stringify({ 
          reason: refundData.reason,
          amount: order.total_amount
        }),
        created_at: new Date().toISOString()
      });
      
      // Return updated order
      return this.getOrderById(id);
    });
  }

  /**
   * Generate order number
   * @returns {string} - Generated order number
   */
  generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `ORD-${year}${month}${day}-${random}`;
  }

  /**
   * Get daily sales summary
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} - Sales summary
   */
  async getDailySalesSummary(date) {
    // Get total sales
    const salesQuery = `
      SELECT 
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(AVG(total_amount), 0) as average_sale,
        COALESCE(MAX(total_amount), 0) as highest_sale
      FROM orders
      WHERE DATE(created_at) = ? AND order_status = 'completed'
    `;
    
    const salesResult = await this.db.queryOne(salesQuery, [date]);
    
    // Get payment method breakdown
    const paymentMethodQuery = `
      SELECT 
        payment_method,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as total
      FROM orders
      WHERE DATE(created_at) = ? AND order_status = 'completed'
      GROUP BY payment_method
    `;
    
    const paymentMethodResult = await this.db.query(paymentMethodQuery, [date]);
    
    // Get hourly sales
    const hourlyQuery = `
      SELECT 
        strftime('%H', created_at) as hour,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as total_sales
      FROM orders
      WHERE DATE(created_at) = ? AND order_status = 'completed'
      GROUP BY hour
      ORDER BY hour
    `;
    
    const hourlyResult = await this.db.query(hourlyQuery, [date]);
    
    // Get top selling products
    const topProductsQuery = `
      SELECT 
        p.id, p.name, p.sku,
        SUM(oi.quantity) as quantity_sold,
        COALESCE(SUM(oi.subtotal), 0) as total_sales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) = ? AND o.order_status = 'completed'
      GROUP BY p.id
      ORDER BY quantity_sold DESC
      LIMIT 10
    `;
    
    const topProductsResult = await this.db.query(topProductsQuery, [date]);
    
    // Return summary
    return {
      date,
      summary: salesResult || {
        order_count: 0,
        total_sales: 0,
        average_sale: 0,
        highest_sale: 0
      },
      payment_methods: paymentMethodResult.results || [],
      hourly_sales: hourlyResult.results || [],
      top_products: topProductsResult.results || []
    };
  }

  /**
   * Get sales report
   * @param {Object} options - Report options
   * @returns {Promise<Object>} - Sales report
   */
  async getSalesReport(options = {}) {
    const { 
      start_date, 
      end_date, 
      group_by = 'day',
      cashier_id = null
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
      default:
        groupFormat = '%Y-%m-%d';
    }
    
    // Build where clause
    let whereConditions = ['o.order_status = ?'];
    let params = ['completed'];
    
    whereConditions.push('DATE(o.created_at) BETWEEN ? AND ?');
    params.push(start_date, end_date);
    
    if (cashier_id) {
      whereConditions.push('o.cashier_id = ?');
      params.push(cashier_id);
    }
    
    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    
    // Get sales summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_sales,
        COALESCE(AVG(o.total_amount), 0) as average_sale,
        COUNT(DISTINCT o.customer_id) as unique_customers
      FROM orders o
      ${whereClause}
    `;
    
    const summaryResult = await this.db.queryOne(summaryQuery, params);
    
    // Get sales by period
    const periodQuery = `
      SELECT 
        strftime('${groupFormat}', o.created_at) as period,
        COUNT(*) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_sales,
        COALESCE(AVG(o.total_amount), 0) as average_sale
      FROM orders o
      ${whereClause}
      GROUP BY period
      ORDER BY period
    `;
    
    const periodResult = await this.db.query(periodQuery, params);
    
    // Get sales by payment method
    const paymentMethodQuery = `
      SELECT 
        o.payment_method,
        COUNT(*) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_sales
      FROM orders o
      ${whereClause}
      GROUP BY o.payment_method
      ORDER BY total_sales DESC
    `;
    
    const paymentMethodResult = await this.db.query(paymentMethodQuery, params);
    
    // Get sales by cashier
    const cashierQuery = `
      SELECT 
        u.id as cashier_id,
        u.name as cashier_name,
        COUNT(*) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_sales
      FROM orders o
      JOIN users u ON o.cashier_id = u.id
      ${whereClause}
      GROUP BY o.cashier_id
      ORDER BY total_sales DESC
    `;
    
    const cashierResult = await this.db.query(cashierQuery, params);
    
    // Get top selling products
    const productQuery = `
      SELECT 
        p.id, p.name, p.sku,
        SUM(oi.quantity) as quantity_sold,
        COALESCE(SUM(oi.subtotal), 0) as total_sales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY quantity_sold DESC
      LIMIT 10
    `;
    
    const productResult = await this.db.query(productQuery, params);
    
    // Return report
    return {
      start_date,
      end_date,
      group_by,
      summary: summaryResult || {
        order_count: 0,
        total_sales: 0,
        average_sale: 0,
        unique_customers: 0
      },
      sales_by_period: periodResult.results || [],
      sales_by_payment_method: paymentMethodResult.results || [],
      sales_by_cashier: cashierResult.results || [],
      top_products: productResult.results || []
    };
  }
} 