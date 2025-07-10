/**
 * KhoChuan POS - Authentication Service
 * Handles user authentication, JWT tokens, and permission management
 */

import { SignJWT, jwtVerify } from 'jose';
import * as bcrypt from 'bcryptjs';

export class AuthService {
  constructor(db, env) {
    this.db = db;
    this.env = env;
    this.JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);
    this.JWT_EXPIRES_IN = env.JWT_EXPIRES_IN || '7d';
  }

  /**
   * Authenticate a user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Authentication result with token
   */
  async login(email, password) {
    // Find user by email
    const user = await this.db.findByField('users', 'email', email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is disabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = await this.generateToken(user);

    // Update last login timestamp
    await this.db.update('users', user.id, {
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Return user data and token
    return {
      user: this.sanitizeUser(user),
      token,
      permissions: await this.getUserPermissions(user.role)
    };
  }

  /**
   * Register a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  async register(userData) {
    // Check if email already exists
    const existingUser = await this.db.findByField('users', 'email', userData.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Generate user ID
    const userId = this.db.generateId();

    // Create user
    const user = {
      id: userId,
      email: userData.email,
      password_hash: hashedPassword,
      name: userData.name,
      role: userData.role || 'customer', // Default role is customer
      phone: userData.phone || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.db.insert('users', user);

    // Return created user (without password)
    return this.sanitizeUser(user);
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Decoded token payload
   */
  async verifyToken(token) {
    try {
      const { payload } = await jwtVerify(token, this.JWT_SECRET);
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {Promise<string>} - JWT token
   */
  async generateToken(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.JWT_EXPIRES_IN)
      .sign(this.JWT_SECRET);

    return token;
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User object
   */
  async getUserById(userId) {
    const user = await this.db.findById('users', userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Get user permissions based on role
   * @param {string} role - User role
   * @returns {Promise<Array>} - Array of permissions
   */
  async getUserPermissions(role) {
    // Role-based permissions
    const permissions = {
      admin: [
        'dashboard.view',
        'products.view', 'products.create', 'products.update', 'products.delete',
        'inventory.view', 'inventory.update',
        'orders.view', 'orders.create', 'orders.update', 'orders.delete',
        'customers.view', 'customers.create', 'customers.update', 'customers.delete',
        'staff.view', 'staff.create', 'staff.update', 'staff.delete',
        'reports.view', 'reports.create',
        'settings.view', 'settings.update',
        'pos.use',
      ],
      cashier: [
        'pos.use',
        'orders.view', 'orders.create',
        'customers.view', 'customers.create', 'customers.update',
        'products.view',
        'inventory.view',
      ],
      staff: [
        'dashboard.view',
        'products.view',
        'orders.view',
        'customers.view',
        'pos.use',
        'staff.view_own',
        'gamification.participate',
      ],
      customer: [
        'profile.view', 'profile.update',
        'orders.view_own',
        'loyalty.view', 'loyalty.redeem',
        'warranty.view', 'warranty.claim',
      ],
    };

    return permissions[role] || [];
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - Success status
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Get user
    const user = await this.db.findById('users', userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await this.db.update('users', userId, {
      password_hash: hashedPassword,
      updated_at: new Date().toISOString()
    });

    return true;
  }

  /**
   * Reset user password (admin function)
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - Success status
   */
  async resetPassword(userId, newPassword) {
    // Get user
    const user = await this.db.findById('users', userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await this.db.update('users', userId, {
      password_hash: hashedPassword,
      updated_at: new Date().toISOString()
    });

    return true;
  }

  /**
   * Remove sensitive data from user object
   * @param {Object} user - User object
   * @returns {Object} - Sanitized user object
   */
  sanitizeUser(user) {
    if (!user) return null;
    
    // Create a copy without the password hash
    const { password_hash, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Get users with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} - List of users with pagination
   */
  async getUsers(filters = {}) {
    const {
      role = [],
      search,
      sort_by = 'name',
      sort_dir = 'asc',
      page = 1,
      limit = 20,
      is_active = true
    } = filters;

    // Build where clause
    let whereConditions = [];
    let params = [];

    // Filter by active status
    if (is_active !== undefined) {
      whereConditions.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    // Filter by role
    if (role && role.length > 0) {
      if (Array.isArray(role)) {
        const placeholders = role.map(() => '?').join(',');
        whereConditions.push(`role IN (${placeholders})`);
        params = [...params, ...role];
      } else {
        whereConditions.push('role = ?');
        params.push(role);
      }
    }

    // Filter by search
    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build order clause
    const validSortColumns = ['name', 'email', 'role', 'created_at', 'last_login'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'name';
    const sortDirection = sort_dir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const orderClause = `ORDER BY ${sortColumn} ${sortDirection}`;

    // Build pagination
    const offset = (page - 1) * limit;
    const paginationClause = `LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute query
    const query = `
      SELECT * FROM users
      ${whereClause}
      ${orderClause}
      ${paginationClause}
    `;

    const result = await this.db.query(query, params);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      ${whereClause}
    `;
    
    const countResult = await this.db.queryOne(countQuery, params.slice(0, -2));
    const total = countResult ? countResult.total : 0;
    
    // Sanitize users
    const users = result.results ? result.results.map(user => this.sanitizeUser(user)) : [];
    
    return {
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  async createUser(userData) {
    // Check if email already exists
    const existingUser = await this.db.findByField('users', 'email', userData.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Generate user ID
    const userId = this.db.generateId();

    // Create user
    const user = {
      id: userId,
      email: userData.email,
      password_hash: hashedPassword,
      name: userData.name,
      role: userData.role,
      phone: userData.phone || null,
      avatar_url: userData.avatar_url || null,
      is_active: userData.is_active !== undefined ? userData.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.db.insert('users', user);

    // Return created user (without password)
    return this.sanitizeUser(user);
  }

  /**
   * Update a user
   * @param {string} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} - Updated user
   */
  async updateUser(userId, userData) {
    // Check if user exists
    const existingUser = await this.db.findById('users', userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Check if email already exists (if changed)
    if (userData.email && userData.email !== existingUser.email) {
      const existingEmail = await this.db.findByField('users', 'email', userData.email);
      if (existingEmail && existingEmail.id !== userId) {
        throw new Error('Email already in use');
      }
    }

    // Handle password update if provided
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password_hash = await bcrypt.hash(userData.password, salt);
      delete userData.password;
    }

    // Prepare update data
    const updateData = {
      ...userData,
      updated_at: new Date().toISOString()
    };

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.created_at;

    // Update user
    await this.db.update('users', userId, updateData);

    // Get updated user
    const updatedUser = await this.db.findById('users', userId);
    return this.sanitizeUser(updatedUser);
  }

  /**
   * Deactivate a user (soft delete)
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async deactivateUser(userId) {
    // Check if user exists
    const existingUser = await this.db.findById('users', userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Deactivate user
    await this.db.update('users', userId, {
      is_active: false,
      updated_at: new Date().toISOString()
    });

    return true;
  }
} 