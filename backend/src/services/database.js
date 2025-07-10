/**
 * KhoChuan POS - Database Service
 * Provides abstraction layer for Cloudflare D1 database operations
 */

export class DatabaseService {
  constructor(d1Database) {
    this.db = d1Database;
  }

  static initialize(env) {
    if (!env.DB) {
      throw new Error('Database binding not found in environment');
    }
    return new DatabaseService(env.DB);
  }

  /**
   * Execute a raw SQL query
   * @param {string} query - SQL query to execute
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} - Query result
   */
  async query(query, params = []) {
    try {
      const result = await this.db.prepare(query).bind(...params).all();
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error(`Database query error: ${error.message}`);
    }
  }

  /**
   * Execute a raw SQL query and return a single row
   * @param {string} query - SQL query to execute
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} - Single row result
   */
  async queryOne(query, params = []) {
    try {
      const result = await this.db.prepare(query).bind(...params).first();
      return result;
    } catch (error) {
      console.error('Database queryOne error:', error);
      throw new Error(`Database queryOne error: ${error.message}`);
    }
  }

  /**
   * Execute a raw SQL query that returns no data
   * @param {string} query - SQL query to execute
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} - Query result
   */
  async execute(query, params = []) {
    try {
      const result = await this.db.prepare(query).bind(...params).run();
      return result;
    } catch (error) {
      console.error('Database execute error:', error);
      throw new Error(`Database execute error: ${error.message}`);
    }
  }

  /**
   * Execute multiple queries in a transaction
   * @param {Function} callback - Transaction callback
   * @returns {Promise<any>} - Transaction result
   */
  async transaction(callback) {
    const tx = this.db.batch();
    try {
      const result = await callback(tx);
      await tx.commit();
      return result;
    } catch (error) {
      console.error('Transaction error:', error);
      throw new Error(`Transaction error: ${error.message}`);
    }
  }

  /**
   * Find all records from a table
   * @param {string} table - Table name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of records
   */
  async findAll(table, options = {}) {
    const {
      fields = '*',
      where = '',
      params = [],
      orderBy = '',
      limit = 0,
      offset = 0
    } = options;

    let query = `SELECT ${fields} FROM ${table}`;
    
    if (where) {
      query += ` WHERE ${where}`;
    }
    
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }
    
    if (limit > 0) {
      query += ` LIMIT ${limit}`;
    }
    
    if (offset > 0) {
      query += ` OFFSET ${offset}`;
    }
    
    return await this.query(query, params);
  }

  /**
   * Find a single record by ID
   * @param {string} table - Table name
   * @param {string} id - Record ID
   * @param {string} fields - Fields to select
   * @returns {Promise<Object>} - Record object
   */
  async findById(table, id, fields = '*') {
    const query = `SELECT ${fields} FROM ${table} WHERE id = ?`;
    return await this.queryOne(query, [id]);
  }

  /**
   * Find a single record by a field value
   * @param {string} table - Table name
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @param {string} fields - Fields to select
   * @returns {Promise<Object>} - Record object
   */
  async findByField(table, field, value, fields = '*') {
    const query = `SELECT ${fields} FROM ${table} WHERE ${field} = ?`;
    return await this.queryOne(query, [value]);
  }

  /**
   * Insert a new record
   * @param {string} table - Table name
   * @param {Object} data - Record data
   * @returns {Promise<Object>} - Insert result
   */
  async insert(table, data) {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const query = `INSERT INTO ${table} (${fields}) VALUES (${placeholders})`;
    
    return await this.execute(query, values);
  }

  /**
   * Update a record by ID
   * @param {string} table - Table name
   * @param {string} id - Record ID
   * @param {Object} data - Record data
   * @returns {Promise<Object>} - Update result
   */
  async update(table, id, data) {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    const query = `UPDATE ${table} SET ${fields} WHERE id = ?`;
    
    return await this.execute(query, values);
  }

  /**
   * Delete a record by ID
   * @param {string} table - Table name
   * @param {string} id - Record ID
   * @returns {Promise<Object>} - Delete result
   */
  async delete(table, id) {
    const query = `DELETE FROM ${table} WHERE id = ?`;
    return await this.execute(query, [id]);
  }

  /**
   * Count records in a table
   * @param {string} table - Table name
   * @param {string} where - Where clause
   * @param {Array} params - Query parameters
   * @returns {Promise<number>} - Record count
   */
  async count(table, where = '', params = []) {
    let query = `SELECT COUNT(*) as count FROM ${table}`;
    
    if (where) {
      query += ` WHERE ${where}`;
    }
    
    const result = await this.queryOne(query, params);
    return result ? result.count : 0;
  }

  /**
   * Check if a record exists
   * @param {string} table - Table name
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @returns {Promise<boolean>} - True if record exists
   */
  async exists(table, field, value) {
    const query = `SELECT 1 FROM ${table} WHERE ${field} = ? LIMIT 1`;
    const result = await this.queryOne(query, [value]);
    return !!result;
  }

  /**
   * Generate a UUID v4
   * @returns {string} - UUID v4
   */
  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Export singleton instance creator
export function createDatabaseService(env) {
  return DatabaseService.initialize(env);
}