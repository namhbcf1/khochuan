/**
 * KhoChuan POS - Settings Service
 * Handles system configuration and settings
 */

export class SettingsService {
  constructor(db, env) {
    this.db = db;
    this.env = env;
    this.cache = {};
    this.cacheExpiry = {};
    this.CACHE_TTL = 300000; // 5 minutes in milliseconds
  }

  /**
   * Get all settings
   * @param {string} group - Settings group (optional)
   * @returns {Promise<Array>} - List of settings
   */
  async getAllSettings(group = null) {
    const cacheKey = `settings_${group || 'all'}`;
    
    // Check cache
    if (this.cache[cacheKey] && this.cacheExpiry[cacheKey] > Date.now()) {
      return this.cache[cacheKey];
    }
    
    // Build query
    let query = 'SELECT * FROM settings';
    let params = [];
    
    if (group) {
      query += ' WHERE setting_group = ?';
      params.push(group);
    }
    
    query += ' ORDER BY setting_group, setting_key';
    
    // Execute query
    const result = await this.db.query(query, params);
    
    // Cache result
    this.cache[cacheKey] = result.results || [];
    this.cacheExpiry[cacheKey] = Date.now() + this.CACHE_TTL;
    
    return result.results || [];
  }

  /**
   * Get setting by key
   * @param {string} key - Setting key
   * @returns {Promise<Object>} - Setting object
   */
  async getSetting(key) {
    const cacheKey = `setting_${key}`;
    
    // Check cache
    if (this.cache[cacheKey] && this.cacheExpiry[cacheKey] > Date.now()) {
      return this.cache[cacheKey];
    }
    
    // Get setting
    const setting = await this.db.findByField('settings', 'setting_key', key);
    
    // Cache result
    this.cache[cacheKey] = setting;
    this.cacheExpiry[cacheKey] = Date.now() + this.CACHE_TTL;
    
    return setting;
  }

  /**
   * Get setting value by key
   * @param {string} key - Setting key
   * @param {any} defaultValue - Default value if setting not found
   * @returns {Promise<any>} - Setting value
   */
  async getSettingValue(key, defaultValue = null) {
    const setting = await this.getSetting(key);
    
    if (!setting) {
      return defaultValue;
    }
    
    // Parse value based on type
    switch (setting.value_type) {
      case 'number':
        return parseFloat(setting.setting_value);
      case 'boolean':
        return setting.setting_value === 'true';
      case 'json':
        try {
          return JSON.parse(setting.setting_value);
        } catch (error) {
          console.error(`Error parsing JSON setting ${key}:`, error);
          return defaultValue;
        }
      default:
        return setting.setting_value;
    }
  }

  /**
   * Update setting
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   * @param {string} userId - User ID making the change
   * @returns {Promise<Object>} - Updated setting
   */
  async updateSetting(key, value, userId) {
    // Get setting
    const setting = await this.db.findByField('settings', 'setting_key', key);
    
    if (!setting) {
      throw new Error(`Setting not found: ${key}`);
    }
    
    // Convert value to string based on type
    let stringValue;
    switch (setting.value_type) {
      case 'number':
        stringValue = value.toString();
        break;
      case 'boolean':
        stringValue = value ? 'true' : 'false';
        break;
      case 'json':
        stringValue = JSON.stringify(value);
        break;
      default:
        stringValue = value;
    }
    
    // Store old value for logging
    const oldValue = setting.setting_value;
    
    // Update setting
    await this.db.update('settings', setting.id, {
      setting_value: stringValue,
      updated_at: new Date().toISOString(),
      updated_by: userId
    });
    
    // Log setting change
    await this.db.insert('activity_logs', {
      id: this.db.generateId(),
      user_id: userId,
      action: 'setting_updated',
      entity_type: 'setting',
      entity_id: setting.id,
      old_values: JSON.stringify({ value: oldValue }),
      new_values: JSON.stringify({ value: stringValue }),
      created_at: new Date().toISOString()
    });
    
    // Clear cache
    this.clearCache(key);
    
    // Return updated setting
    return this.getSetting(key);
  }

  /**
   * Create setting
   * @param {Object} settingData - Setting data
   * @param {string} userId - User ID making the change
   * @returns {Promise<Object>} - Created setting
   */
  async createSetting(settingData, userId) {
    // Generate ID if not provided
    const id = settingData.id || this.db.generateId();
    
    // Check if setting already exists
    const existingSetting = await this.db.findByField('settings', 'setting_key', settingData.setting_key);
    if (existingSetting) {
      throw new Error(`Setting already exists: ${settingData.setting_key}`);
    }
    
    // Prepare setting data
    const setting = {
      id,
      setting_key: settingData.setting_key,
      setting_value: settingData.setting_value,
      setting_group: settingData.setting_group || 'general',
      value_type: settingData.value_type || 'string',
      display_name: settingData.display_name || settingData.setting_key,
      description: settingData.description || null,
      is_public: settingData.is_public !== undefined ? settingData.is_public : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId,
      updated_by: userId
    };
    
    // Insert setting
    await this.db.insert('settings', setting);
    
    // Log setting creation
    await this.db.insert('activity_logs', {
      id: this.db.generateId(),
      user_id: userId,
      action: 'setting_created',
      entity_type: 'setting',
      entity_id: id,
      new_values: JSON.stringify({ 
        key: setting.setting_key,
        value: setting.setting_value
      }),
      created_at: new Date().toISOString()
    });
    
    // Clear cache
    this.clearCache();
    
    // Return created setting
    return this.db.findById('settings', id);
  }

  /**
   * Delete setting
   * @param {string} key - Setting key
   * @param {string} userId - User ID making the change
   * @returns {Promise<boolean>} - Success status
   */
  async deleteSetting(key, userId) {
    // Get setting
    const setting = await this.db.findByField('settings', 'setting_key', key);
    
    if (!setting) {
      throw new Error(`Setting not found: ${key}`);
    }
    
    // Delete setting
    await this.db.delete('settings', setting.id);
    
    // Log setting deletion
    await this.db.insert('activity_logs', {
      id: this.db.generateId(),
      user_id: userId,
      action: 'setting_deleted',
      entity_type: 'setting',
      entity_id: setting.id,
      old_values: JSON.stringify({ 
        key: setting.setting_key,
        value: setting.setting_value
      }),
      created_at: new Date().toISOString()
    });
    
    // Clear cache
    this.clearCache(key);
    
    return true;
  }

  /**
   * Clear settings cache
   * @param {string} key - Specific setting key to clear (optional)
   */
  clearCache(key = null) {
    if (key) {
      delete this.cache[`setting_${key}`];
      
      // Also clear group caches as they might contain this setting
      Object.keys(this.cache).forEach(cacheKey => {
        if (cacheKey.startsWith('settings_')) {
          delete this.cache[cacheKey];
        }
      });
    } else {
      // Clear all settings cache
      Object.keys(this.cache).forEach(cacheKey => {
        if (cacheKey.startsWith('setting_') || cacheKey.startsWith('settings_')) {
          delete this.cache[cacheKey];
        }
      });
    }
  }

  /**
   * Get company information
   * @returns {Promise<Object>} - Company information
   */
  async getCompanyInfo() {
    const companySettings = await this.getAllSettings('company');
    
    // Convert settings array to object
    const companyInfo = {};
    companySettings.forEach(setting => {
      const key = setting.setting_key.replace('company_', '');
      
      // Parse value based on type
      let value = setting.setting_value;
      switch (setting.value_type) {
        case 'number':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (error) {
            console.error(`Error parsing JSON setting ${setting.setting_key}:`, error);
          }
          break;
      }
      
      companyInfo[key] = value;
    });
    
    return companyInfo;
  }

  /**
   * Get system information
   * @returns {Promise<Object>} - System information
   */
  async getSystemInfo() {
    // Get system settings
    const systemSettings = await this.getAllSettings('system');
    
    // Get version from environment
    const version = this.env.API_VERSION || 'v1';
    
    // Get database stats
    const dbStats = await this.getDbStats();
    
    // Return system info
    return {
      version,
      environment: this.env.NODE_ENV || 'development',
      settings: systemSettings,
      database: dbStats
    };
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>} - Database statistics
   */
  async getDbStats() {
    // Get table counts
    const tableQueries = [
      { table: 'users', label: 'Users' },
      { table: 'products', label: 'Products' },
      { table: 'customers', label: 'Customers' },
      { table: 'orders', label: 'Orders' },
      { table: 'categories', label: 'Categories' }
    ];
    
    const counts = {};
    
    for (const query of tableQueries) {
      const result = await this.db.query(`SELECT COUNT(*) as count FROM ${query.table}`);
      counts[query.table] = result.results[0].count;
    }
    
    return {
      counts,
      last_updated: new Date().toISOString()
    };
  }
} 