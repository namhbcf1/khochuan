/**
 * KhoChuan POS - Gamification Service
 * Handles staff engagement features like badges, challenges, and rewards
 */

export class GamificationService {
  constructor(db, env) {
    this.db = db;
    this.env = env;
  }

  /**
   * Get staff stats
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Staff stats
   */
  async getStaffStats(userId) {
    // Get staff stats
    const stats = await this.db.findByField('staff_stats', 'user_id', userId);
    
    if (!stats) {
      // Create new stats if not found
      const newStats = {
        id: this.db.generateId(),
        user_id: userId,
        total_sales: 0,
        total_orders: 0,
        total_points: 0,
        current_streak: 0,
        level: 1,
        commission_earned: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await this.db.insert('staff_stats', newStats);
      return newStats;
    }
    
    // Get badges earned
    const badgesQuery = `
      SELECT b.*
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ?
      ORDER BY ub.earned_at DESC
    `;
    
    const badges = await this.db.query(badgesQuery, [userId]);
    
    // Get active challenges
    const challengesQuery = `
      SELECT 
        c.*,
        uc.progress,
        uc.completed_at,
        CASE 
          WHEN uc.completed_at IS NOT NULL THEN 1 
          ELSE 0 
        END as is_completed
      FROM challenges c
      LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = ?
      WHERE c.is_active = 1 AND (uc.user_id IS NULL OR uc.user_id = ?)
      ORDER BY c.end_date
    `;
    
    const challenges = await this.db.query(challengesQuery, [userId, userId]);
    
    // Return staff stats with badges and challenges
    return {
      ...stats,
      badges: badges.results || [],
      challenges: challenges.results || []
    };
  }

  /**
   * Award points to staff
   * @param {string} userId - User ID
   * @param {number} points - Points to award
   * @param {string} reason - Reason for points
   * @param {string} referenceId - Reference ID (order ID, etc.)
   * @returns {Promise<Object>} - Updated staff stats
   */
  async awardPoints(userId, points, reason, referenceId = null) {
    // Get staff stats
    const stats = await this.db.findByField('staff_stats', 'user_id', userId);
    
    if (!stats) {
      throw new Error('Staff stats not found');
    }
    
    // Update points
    const newPoints = stats.total_points + points;
    
    // Calculate new level (1 level per 100 points)
    const newLevel = Math.max(1, Math.floor(newPoints / 100) + 1);
    
    // Update stats
    await this.db.update('staff_stats', stats.id, {
      total_points: newPoints,
      level: newLevel,
      updated_at: new Date().toISOString()
    });
    
    // Log points transaction
    await this.db.insert('staff_points_log', {
      id: this.db.generateId(),
      user_id: userId,
      points: points,
      reason: reason,
      reference_id: referenceId,
      created_at: new Date().toISOString()
    });
    
    // Check for level up
    if (newLevel > stats.level) {
      // Log level up event
      await this.db.insert('activity_logs', {
        id: this.db.generateId(),
        user_id: userId,
        action: 'level_up',
        entity_type: 'staff',
        entity_id: userId,
        new_values: JSON.stringify({ 
          previous_level: stats.level,
          new_level: newLevel
        }),
        created_at: new Date().toISOString()
      });
      
      // Check for level badges
      await this.checkAndAwardLevelBadges(userId, newLevel);
    }
    
    // Check for challenges progress
    await this.updateChallengesProgress(userId, reason, points);
    
    // Return updated stats
    return this.getStaffStats(userId);
  }

  /**
   * Check and award level badges
   * @param {string} userId - User ID
   * @param {number} level - Current level
   * @returns {Promise<void>}
   */
  async checkAndAwardLevelBadges(userId, level) {
    // Get level badges
    const levelBadgesQuery = `
      SELECT *
      FROM badges
      WHERE badge_type = 'level' AND criteria <= ?
      AND id NOT IN (
        SELECT badge_id FROM user_badges WHERE user_id = ?
      )
    `;
    
    const levelBadges = await this.db.query(levelBadgesQuery, [level, userId]);
    
    // Award badges
    for (const badge of levelBadges.results || []) {
      await this.awardBadge(userId, badge.id);
    }
  }

  /**
   * Award badge to staff
   * @param {string} userId - User ID
   * @param {string} badgeId - Badge ID
   * @returns {Promise<Object>} - Awarded badge
   */
  async awardBadge(userId, badgeId) {
    // Check if badge exists
    const badge = await this.db.findById('badges', badgeId);
    if (!badge) {
      throw new Error('Badge not found');
    }
    
    // Check if user already has badge
    const existingBadge = await this.db.query(`
      SELECT * FROM user_badges
      WHERE user_id = ? AND badge_id = ?
    `, [userId, badgeId]);
    
    if (existingBadge.results && existingBadge.results.length > 0) {
      throw new Error('Badge already awarded');
    }
    
    // Award badge
    await this.db.insert('user_badges', {
      id: this.db.generateId(),
      user_id: userId,
      badge_id: badgeId,
      earned_at: new Date().toISOString()
    });
    
    // Log badge award
    await this.db.insert('activity_logs', {
      id: this.db.generateId(),
      user_id: userId,
      action: 'badge_earned',
      entity_type: 'badge',
      entity_id: badgeId,
      new_values: JSON.stringify({ 
        badge_name: badge.name,
        badge_description: badge.description
      }),
      created_at: new Date().toISOString()
    });
    
    // Return badge
    return badge;
  }

  /**
   * Update challenges progress
   * @param {string} userId - User ID
   * @param {string} action - Action performed
   * @param {number} value - Value related to action
   * @returns {Promise<Array>} - Completed challenges
   */
  async updateChallengesProgress(userId, action, value = 1) {
    // Get active challenges for the action
    const challengesQuery = `
      SELECT c.*
      FROM challenges c
      LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = ?
      WHERE c.is_active = 1 
        AND c.action_type = ?
        AND (uc.completed_at IS NULL OR uc.user_id IS NULL)
        AND c.end_date > datetime('now')
    `;
    
    const challenges = await this.db.query(challengesQuery, [userId, action]);
    
    const completedChallenges = [];
    
    // Update progress for each challenge
    for (const challenge of challenges.results || []) {
      // Get user challenge
      const userChallenge = await this.db.query(`
        SELECT * FROM user_challenges
        WHERE user_id = ? AND challenge_id = ?
      `, [userId, challenge.id]);
      
      let progress = 0;
      
      if (userChallenge.results && userChallenge.results.length > 0) {
        progress = userChallenge.results[0].progress + value;
        
        // Update progress
        await this.db.update('user_challenges', userChallenge.results[0].id, {
          progress: progress,
          updated_at: new Date().toISOString(),
          completed_at: progress >= challenge.target_value ? new Date().toISOString() : null
        });
      } else {
        // Create new user challenge
        progress = value;
        
        await this.db.insert('user_challenges', {
          id: this.db.generateId(),
          user_id: userId,
          challenge_id: challenge.id,
          progress: progress,
          updated_at: new Date().toISOString(),
          completed_at: progress >= challenge.target_value ? new Date().toISOString() : null
        });
      }
      
      // Check if challenge completed
      if (progress >= challenge.target_value) {
        completedChallenges.push(challenge);
        
        // Award points
        await this.awardPoints(userId, challenge.reward_points, `Challenge completed: ${challenge.name}`, challenge.id);
        
        // Log challenge completion
        await this.db.insert('activity_logs', {
          id: this.db.generateId(),
          user_id: userId,
          action: 'challenge_completed',
          entity_type: 'challenge',
          entity_id: challenge.id,
          new_values: JSON.stringify({ 
            challenge_name: challenge.name,
            reward_points: challenge.reward_points
          }),
          created_at: new Date().toISOString()
        });
      }
    }
    
    return completedChallenges;
  }

  /**
   * Get available badges
   * @returns {Promise<Array>} - List of badges
   */
  async getBadges() {
    const query = `
      SELECT * FROM badges
      WHERE is_active = 1
      ORDER BY badge_type, criteria
    `;
    
    const result = await this.db.query(query);
    return result.results || [];
  }

  /**
   * Get active challenges
   * @returns {Promise<Array>} - List of challenges
   */
  async getChallenges() {
    const query = `
      SELECT * FROM challenges
      WHERE is_active = 1 AND end_date > datetime('now')
      ORDER BY end_date
    `;
    
    const result = await this.db.query(query);
    return result.results || [];
  }

  /**
   * Create a new challenge
   * @param {Object} challengeData - Challenge data
   * @returns {Promise<Object>} - Created challenge
   */
  async createChallenge(challengeData) {
    // Generate ID if not provided
    const id = challengeData.id || this.db.generateId();
    
    // Prepare challenge data
    const challenge = {
      id,
      name: challengeData.name,
      description: challengeData.description,
      action_type: challengeData.action_type,
      target_value: challengeData.target_value,
      reward_points: challengeData.reward_points,
      start_date: challengeData.start_date || new Date().toISOString(),
      end_date: challengeData.end_date,
      is_active: challengeData.is_active !== undefined ? challengeData.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert challenge
    await this.db.insert('challenges', challenge);
    
    // Return created challenge
    return this.db.findById('challenges', id);
  }
} 