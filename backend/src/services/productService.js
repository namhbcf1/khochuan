/**
 * KhoChuan POS - Product Service
 * Handles product management, inventory, and categories
 */

export class ProductService {
  constructor(db, env) {
    this.db = db;
    this.env = env;
  }

  /**
   * Get all products with optional filtering
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} - List of products
   */
  async getProducts(filters = {}) {
    const {
      category_id,
      is_active,
      search,
      sort_by = 'name',
      sort_dir = 'asc',
      page = 1,
      limit = 20
    } = filters;

    // Build where clause
    let whereConditions = [];
    let params = [];

    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    }

    if (is_active !== undefined) {
      whereConditions.push('p.is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Build order clause
    const validSortColumns = ['name', 'price', 'stock_quantity', 'created_at'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'name';
    const sortDirection = sort_dir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const orderClause = `ORDER BY p.${sortColumn} ${sortDirection}`;

    // Build pagination
    const offset = (page - 1) * limit;
    const paginationClause = `LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute query
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderClause}
      ${paginationClause}
    `;

    const result = await this.db.query(query, params);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `;
    
    const countResult = await this.db.queryOne(countQuery, params.slice(0, -2));
    const total = countResult ? countResult.total : 0;
    
    return {
      products: result.results || [],
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} - Product object
   */
  async getProductById(id) {
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;

    const product = await this.db.queryOne(query, [id]);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  }

  /**
   * Get product by barcode
   * @param {string} barcode - Product barcode
   * @returns {Promise<Object>} - Product object
   */
  async getProductByBarcode(barcode) {
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.barcode = ? AND p.is_active = 1
    `;

    const product = await this.db.queryOne(query, [barcode]);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} - Created product
   */
  async createProduct(productData) {
    // Generate ID if not provided
    const id = productData.id || this.db.generateId();
    
    // Check if SKU already exists
    if (productData.sku) {
      const existingSku = await this.db.findByField('products', 'sku', productData.sku);
      if (existingSku) {
        throw new Error('SKU already exists');
      }
    }
    
    // Check if barcode already exists
    if (productData.barcode) {
      const existingBarcode = await this.db.findByField('products', 'barcode', productData.barcode);
      if (existingBarcode) {
        throw new Error('Barcode already exists');
      }
    }
    
    // Prepare product data
    const product = {
      id,
      sku: productData.sku,
      name: productData.name,
      description: productData.description || null,
      category_id: productData.category_id || null,
      price: productData.price,
      cost_price: productData.cost_price || null,
      stock_quantity: productData.stock_quantity || 0,
      reorder_level: productData.reorder_level || 10,
      barcode: productData.barcode || null,
      image_url: productData.image_url || null,
      is_active: productData.is_active !== undefined ? productData.is_active : true,
      weight: productData.weight || null,
      dimensions: productData.dimensions || null,
      tax_rate: productData.tax_rate || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert product
    await this.db.insert('products', product);
    
    // Return created product
    return this.getProductById(id);
  }

  /**
   * Update a product
   * @param {string} id - Product ID
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} - Updated product
   */
  async updateProduct(id, productData) {
    // Check if product exists
    const existingProduct = await this.db.findById('products', id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    
    // Check if SKU already exists (if changed)
    if (productData.sku && productData.sku !== existingProduct.sku) {
      const existingSku = await this.db.findByField('products', 'sku', productData.sku);
      if (existingSku && existingSku.id !== id) {
        throw new Error('SKU already exists');
      }
    }
    
    // Check if barcode already exists (if changed)
    if (productData.barcode && productData.barcode !== existingProduct.barcode) {
      const existingBarcode = await this.db.findByField('products', 'barcode', productData.barcode);
      if (existingBarcode && existingBarcode.id !== id) {
        throw new Error('Barcode already exists');
      }
    }
    
    // Prepare update data
    const updateData = {
      ...productData,
      updated_at: new Date().toISOString()
    };
    
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.created_at;
    
    // Update product
    await this.db.update('products', id, updateData);
    
    // Return updated product
    return this.getProductById(id);
  }

  /**
   * Delete a product
   * @param {string} id - Product ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteProduct(id) {
    // Check if product exists
    const existingProduct = await this.db.findById('products', id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    
    // Check if product is used in orders
    const orderItems = await this.db.query(
      'SELECT COUNT(*) as count FROM order_items WHERE product_id = ?',
      [id]
    );
    
    if (orderItems.results && orderItems.results[0].count > 0) {
      // Soft delete by setting is_active to false
      await this.db.update('products', id, {
        is_active: false,
        updated_at: new Date().toISOString()
      });
    } else {
      // Hard delete if not used in orders
      await this.db.delete('products', id);
    }
    
    return true;
  }

  /**
   * Update product stock
   * @param {string} id - Product ID
   * @param {number} quantity - New quantity
   * @param {string} userId - User ID making the change
   * @param {string} reason - Reason for stock change
   * @returns {Promise<Object>} - Updated product
   */
  async updateStock(id, quantity, userId, reason = 'manual_adjustment') {
    // Check if product exists
    const existingProduct = await this.db.findById('products', id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    
    // Calculate quantity change
    const previousQuantity = existingProduct.stock_quantity;
    const quantityChange = quantity - previousQuantity;
    
    // Update product stock
    await this.db.update('products', id, {
      stock_quantity: quantity,
      updated_at: new Date().toISOString()
    });
    
    // Log inventory change
    await this.db.insert('inventory_logs', {
      id: this.db.generateId(),
      product_id: id,
      user_id: userId,
      type: quantityChange > 0 ? 'restock' : 'adjustment',
      quantity_change: quantityChange,
      previous_quantity: previousQuantity,
      new_quantity: quantity,
      reason: reason,
      created_at: new Date().toISOString()
    });
    
    // Return updated product
    return this.getProductById(id);
  }

  /**
   * Get low stock products
   * @returns {Promise<Array>} - List of low stock products
   */
  async getLowStockProducts() {
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock_quantity <= p.reorder_level AND p.is_active = 1
      ORDER BY (p.stock_quantity * 1.0 / p.reorder_level) ASC
    `;

    const result = await this.db.query(query);
    return result.results || [];
  }

  /**
   * Get all categories
   * @returns {Promise<Array>} - List of categories
   */
  async getCategories() {
    const query = `
      SELECT * FROM categories
      ORDER BY sort_order ASC, name ASC
    `;

    const result = await this.db.query(query);
    return result.results || [];
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} - Created category
   */
  async createCategory(categoryData) {
    // Generate ID if not provided
    const id = categoryData.id || this.db.generateId();
    
    // Prepare category data
    const category = {
      id,
      name: categoryData.name,
      description: categoryData.description || null,
      icon: categoryData.icon || null,
      color: categoryData.color || '#1890ff',
      sort_order: categoryData.sort_order || 0,
      is_active: categoryData.is_active !== undefined ? categoryData.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert category
    await this.db.insert('categories', category);
    
    // Return created category
    return this.db.findById('categories', id);
  }

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} - Updated category
   */
  async updateCategory(id, categoryData) {
    // Check if category exists
    const existingCategory = await this.db.findById('categories', id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }
    
    // Prepare update data
    const updateData = {
      ...categoryData,
      updated_at: new Date().toISOString()
    };
    
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.created_at;
    
    // Update category
    await this.db.update('categories', id, updateData);
    
    // Return updated category
    return this.db.findById('categories', id);
  }

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteCategory(id) {
    // Check if category exists
    const existingCategory = await this.db.findById('categories', id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }
    
    // Check if category is used in products
    const products = await this.db.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id]
    );
    
    if (products.results && products.results[0].count > 0) {
      throw new Error('Cannot delete category with associated products');
    }
    
    // Delete category
    await this.db.delete('categories', id);
    
    return true;
  }

  /**
   * Get inventory logs for a product
   * @param {string} productId - Product ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - List of inventory logs
   */
  async getInventoryLogs(productId, options = {}) {
    const { page = 1, limit = 20 } = options;
    
    const query = `
      SELECT 
        il.*,
        u.name as user_name
      FROM inventory_logs il
      LEFT JOIN users u ON il.user_id = u.id
      WHERE il.product_id = ?
      ORDER BY il.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const offset = (page - 1) * limit;
    const result = await this.db.query(query, [productId, limit, offset]);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM inventory_logs
      WHERE product_id = ?
    `;
    
    const countResult = await this.db.queryOne(countQuery, [productId]);
    const total = countResult ? countResult.total : 0;
    
    return {
      logs: result.results || [],
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }
} 