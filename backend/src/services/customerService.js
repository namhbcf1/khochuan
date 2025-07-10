/**
 * KhoChuan POS - Customer Service
 * Handles customer management, loyalty points, and warranties
 */

export class CustomerService {
  constructor(db, env) {
    this.db = db;
    this.env = env;
  }

  /**
   * Get all customers with optional filtering
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} - List of customers with pagination
   */
  async getCustomers(filters = {}) {
    const {
      search,
      sort_by = 'name',
      sort_dir = 'asc',
      page = 1,
      limit = 20
    } = filters;

    // Build where clause
    let whereConditions = ['is_active = 1'];
    let params = [];

    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build order clause
    const validSortColumns = ['name', 'email', 'created_at', 'total_spent', 'loyalty_points'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'name';
    const sortDirection = sort_dir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const orderClause = `ORDER BY ${sortColumn} ${sortDirection}`;

    // Build pagination
    const offset = (page - 1) * limit;
    const paginationClause = `LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute query
    const query = `
      SELECT * FROM customers
      ${whereClause}
      ${orderClause}
      ${paginationClause}
    `;

    const result = await this.db.query(query, params);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM customers
      ${whereClause}
    `;
    
    const countResult = await this.db.queryOne(countQuery, params.slice(0, -2));
    const total = countResult ? countResult.total : 0;
    
    return {
      customers: result.results || [],
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get customer by ID
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} - Customer object
   */
  async getCustomerById(id) {
    const customer = await this.db.findById('customers', id);
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return customer;
  }

  /**
   * Get customer by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Customer object
   */
  async getCustomerByUserId(userId) {
    const customer = await this.db.findByField('customers', 'user_id', userId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return customer;
  }

  /**
   * Create a new customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} - Created customer
   */
  async createCustomer(customerData) {
    // Generate ID if not provided
    const id = customerData.id || this.db.generateId();
    
    // Check if email already exists
    if (customerData.email) {
      const existingEmail = await this.db.findByField('customers', 'email', customerData.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }
    
    // Check if phone already exists
    if (customerData.phone) {
      const existingPhone = await this.db.findByField('customers', 'phone', customerData.phone);
      if (existingPhone) {
        throw new Error('Phone number already exists');
      }
    }
    
    // Prepare customer data
    const customer = {
      id,
      user_id: customerData.user_id || null,
      name: customerData.name,
      email: customerData.email || null,
      phone: customerData.phone || null,
      address: customerData.address || null,
      city: customerData.city || null,
      postal_code: customerData.postal_code || null,
      date_of_birth: customerData.date_of_birth || null,
      total_spent: customerData.total_spent || 0,
      visit_count: customerData.visit_count || 0,
      loyalty_points: customerData.loyalty_points || 0,
      is_active: customerData.is_active !== undefined ? customerData.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert customer
    await this.db.insert('customers', customer);
    
    // Return created customer
    return this.getCustomerById(id);
  }

  /**
   * Update a customer
   * @param {string} id - Customer ID
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} - Updated customer
   */
  async updateCustomer(id, customerData) {
    // Check if customer exists
    const existingCustomer = await this.db.findById('customers', id);
    if (!existingCustomer) {
      throw new Error('Customer not found');
    }
    
    // Check if email already exists (if changed)
    if (customerData.email && customerData.email !== existingCustomer.email) {
      const existingEmail = await this.db.findByField('customers', 'email', customerData.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new Error('Email already exists');
      }
    }
    
    // Check if phone already exists (if changed)
    if (customerData.phone && customerData.phone !== existingCustomer.phone) {
      const existingPhone = await this.db.findByField('customers', 'phone', customerData.phone);
      if (existingPhone && existingPhone.id !== id) {
        throw new Error('Phone number already exists');
      }
    }
    
    // Prepare update data
    const updateData = {
      ...customerData,
      updated_at: new Date().toISOString()
    };
    
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.created_at;
    
    // Update customer
    await this.db.update('customers', id, updateData);
    
    // Return updated customer
    return this.getCustomerById(id);
  }

  /**
   * Delete a customer
   * @param {string} id - Customer ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteCustomer(id) {
    // Check if customer exists
    const existingCustomer = await this.db.findById('customers', id);
    if (!existingCustomer) {
      throw new Error('Customer not found');
    }
    
    // Check if customer has orders
    const orders = await this.db.query(
      'SELECT COUNT(*) as count FROM orders WHERE customer_id = ?',
      [id]
    );
    
    if (orders.results && orders.results[0].count > 0) {
      // Soft delete by setting is_active to false
      await this.db.update('customers', id, {
        is_active: false,
        updated_at: new Date().toISOString()
      });
    } else {
      // Hard delete if no orders
      await this.db.delete('customers', id);
    }
    
    return true;
  }

  /**
   * Get customer orders
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - List of orders with pagination
   */
  async getCustomerOrders(customerId, options = {}) {
    const { page = 1, limit = 20 } = options;
    
    // Check if customer exists
    const existingCustomer = await this.db.findById('customers', customerId);
    if (!existingCustomer) {
      throw new Error('Customer not found');
    }
    
    const query = `
      SELECT 
        o.*,
        u.name as cashier_name,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.cashier_id = u.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const offset = (page - 1) * limit;
    const result = await this.db.query(query, [customerId, limit, offset]);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders
      WHERE customer_id = ?
    `;
    
    const countResult = await this.db.queryOne(countQuery, [customerId]);
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
   * Add loyalty points to customer
   * @param {string} customerId - Customer ID
   * @param {number} points - Points to add
   * @param {string} reason - Reason for adding points
   * @param {string} referenceId - Reference ID (order ID, etc.)
   * @returns {Promise<Object>} - Updated customer
   */
  async addLoyaltyPoints(customerId, points, reason, referenceId = null) {
    // Check if customer exists
    const customer = await this.db.findById('customers', customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    // Calculate new points
    const newPoints = customer.loyalty_points + points;
    
    // Update customer
    await this.db.update('customers', customerId, {
      loyalty_points: newPoints,
      updated_at: new Date().toISOString()
    });
    
    // Log loyalty points transaction
    await this.db.insert('loyalty_transactions', {
      id: this.db.generateId(),
      customer_id: customerId,
      points: points,
      type: 'earn',
      reason: reason,
      reference_id: referenceId,
      created_at: new Date().toISOString()
    });
    
    // Return updated customer
    return this.getCustomerById(customerId);
  }

  /**
   * Redeem loyalty points
   * @param {string} customerId - Customer ID
   * @param {number} points - Points to redeem
   * @param {string} reason - Reason for redeeming points
   * @param {string} referenceId - Reference ID (order ID, etc.)
   * @returns {Promise<Object>} - Updated customer
   */
  async redeemLoyaltyPoints(customerId, points, reason, referenceId = null) {
    // Check if customer exists
    const customer = await this.db.findById('customers', customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    // Check if customer has enough points
    if (customer.loyalty_points < points) {
      throw new Error('Insufficient loyalty points');
    }
    
    // Calculate new points
    const newPoints = customer.loyalty_points - points;
    
    // Update customer
    await this.db.update('customers', customerId, {
      loyalty_points: newPoints,
      updated_at: new Date().toISOString()
    });
    
    // Log loyalty points transaction
    await this.db.insert('loyalty_transactions', {
      id: this.db.generateId(),
      customer_id: customerId,
      points: -points,
      type: 'redeem',
      reason: reason,
      reference_id: referenceId,
      created_at: new Date().toISOString()
    });
    
    // Return updated customer
    return this.getCustomerById(customerId);
  }

  /**
   * Get loyalty transactions for a customer
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - List of loyalty transactions with pagination
   */
  async getLoyaltyTransactions(customerId, options = {}) {
    const { page = 1, limit = 20 } = options;
    
    // Check if customer exists
    const existingCustomer = await this.db.findById('customers', customerId);
    if (!existingCustomer) {
      throw new Error('Customer not found');
    }
    
    const query = `
      SELECT *
      FROM loyalty_transactions
      WHERE customer_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const offset = (page - 1) * limit;
    const result = await this.db.query(query, [customerId, limit, offset]);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM loyalty_transactions
      WHERE customer_id = ?
    `;
    
    const countResult = await this.db.queryOne(countQuery, [customerId]);
    const total = countResult ? countResult.total : 0;
    
    return {
      transactions: result.results || [],
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Register a product warranty
   * @param {Object} warrantyData - Warranty data
   * @returns {Promise<Object>} - Created warranty
   */
  async registerWarranty(warrantyData) {
    // Generate ID if not provided
    const id = warrantyData.id || this.db.generateId();
    
    // Check if customer exists
    const customer = await this.db.findById('customers', warrantyData.customer_id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    // Check if product exists
    const product = await this.db.findById('products', warrantyData.product_id);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Prepare warranty data
    const warranty = {
      id,
      customer_id: warrantyData.customer_id,
      product_id: warrantyData.product_id,
      order_id: warrantyData.order_id || null,
      serial_number: warrantyData.serial_number || null,
      purchase_date: warrantyData.purchase_date || new Date().toISOString(),
      expiry_date: warrantyData.expiry_date,
      status: warrantyData.status || 'active',
      notes: warrantyData.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert warranty
    await this.db.insert('warranties', warranty);
    
    // Return created warranty with product details
    const createdWarranty = await this.db.queryOne(`
      SELECT 
        w.*,
        p.name as product_name,
        p.sku as product_sku,
        p.image_url as product_image
      FROM warranties w
      JOIN products p ON w.product_id = p.id
      WHERE w.id = ?
    `, [id]);
    
    return createdWarranty;
  }

  /**
   * Get customer warranties
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - List of warranties with pagination
   */
  async getCustomerWarranties(customerId, options = {}) {
    const { page = 1, limit = 20, status } = options;
    
    // Check if customer exists
    const existingCustomer = await this.db.findById('customers', customerId);
    if (!existingCustomer) {
      throw new Error('Customer not found');
    }
    
    // Build where clause
    let whereConditions = ['w.customer_id = ?'];
    let params = [customerId];
    
    if (status) {
      whereConditions.push('w.status = ?');
      params.push(status);
    }
    
    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    
    const query = `
      SELECT 
        w.*,
        p.name as product_name,
        p.sku as product_sku,
        p.image_url as product_image
      FROM warranties w
      JOIN products p ON w.product_id = p.id
      ${whereClause}
      ORDER BY w.purchase_date DESC
      LIMIT ? OFFSET ?
    `;
    
    const offset = (page - 1) * limit;
    params.push(limit, offset);
    
    const result = await this.db.query(query, params);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM warranties w
      ${whereClause}
    `;
    
    const countResult = await this.db.queryOne(countQuery, params.slice(0, -2));
    const total = countResult ? countResult.total : 0;
    
    return {
      warranties: result.results || [],
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Submit a warranty claim
   * @param {Object} claimData - Claim data
   * @returns {Promise<Object>} - Created claim
   */
  async submitWarrantyClaim(claimData) {
    // Generate ID if not provided
    const id = claimData.id || this.db.generateId();
    
    // Check if warranty exists
    const warranty = await this.db.findById('warranties', claimData.warranty_id);
    if (!warranty) {
      throw new Error('Warranty not found');
    }
    
    // Check if warranty is active
    if (warranty.status !== 'active') {
      throw new Error('Warranty is not active');
    }
    
    // Check if warranty is expired
    const expiryDate = new Date(warranty.expiry_date);
    const currentDate = new Date();
    if (expiryDate < currentDate) {
      throw new Error('Warranty has expired');
    }
    
    // Prepare claim data
    const claim = {
      id,
      warranty_id: claimData.warranty_id,
      customer_id: warranty.customer_id,
      issue_description: claimData.issue_description,
      status: 'pending',
      resolution: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert claim
    await this.db.insert('warranty_claims', claim);
    
    // Return created claim
    return this.db.queryOne(`
      SELECT 
        wc.*,
        w.product_id,
        p.name as product_name,
        p.sku as product_sku
      FROM warranty_claims wc
      JOIN warranties w ON wc.warranty_id = w.id
      JOIN products p ON w.product_id = p.id
      WHERE wc.id = ?
    `, [id]);
  }

  /**
   * Get warranty claims for a customer
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - List of claims with pagination
   */
  async getCustomerWarrantyClaims(customerId, options = {}) {
    const { page = 1, limit = 20, status } = options;
    
    // Check if customer exists
    const existingCustomer = await this.db.findById('customers', customerId);
    if (!existingCustomer) {
      throw new Error('Customer not found');
    }
    
    // Build where clause
    let whereConditions = ['wc.customer_id = ?'];
    let params = [customerId];
    
    if (status) {
      whereConditions.push('wc.status = ?');
      params.push(status);
    }
    
    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    
    const query = `
      SELECT 
        wc.*,
        w.product_id,
        p.name as product_name,
        p.sku as product_sku
      FROM warranty_claims wc
      JOIN warranties w ON wc.warranty_id = w.id
      JOIN products p ON w.product_id = p.id
      ${whereClause}
      ORDER BY wc.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const offset = (page - 1) * limit;
    params.push(limit, offset);
    
    const result = await this.db.query(query, params);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM warranty_claims wc
      JOIN warranties w ON wc.warranty_id = w.id
      ${whereClause}
    `;
    
    const countResult = await this.db.queryOne(countQuery, params.slice(0, -2));
    const total = countResult ? countResult.total : 0;
    
    return {
      claims: result.results || [],
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }
} 