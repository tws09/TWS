// Message and Chat models removed - messaging features have been removed
// const Message = require('../models/Message');
// const Chat = require('../models/Chat');
const User = require('../models/User');
const redisService = require('./core/redis.service');
const auditService = require('./compliance/audit.service');

/**
 * Optimized Message Pagination Service
 * NOTE: Messaging features have been removed - this service is now a stub
 */
class MessagePaginationService {
  constructor() {
    this.cachePrefix = 'messages:';
    this.cacheTTL = 300; // 5 minutes
    this.maxCacheSize = 1000; // Max messages to cache per chat
    this.defaultPageSize = 50;
    this.maxPageSize = 100;
  }

  /**
   * Get messages with optimized pagination
   * NOTE: Messaging features removed - returns empty result
   */
  async getMessages(chatId, options = {}) {
    console.warn('⚠️ getMessages called but messaging features have been removed');
    return {
      messages: [],
      pagination: {
        page: options.page || 1,
        limit: options.limit || this.defaultPageSize,
        total: 0,
        pages: 0
      }
    };
  }

  /**
   * Get messages around a specific message (for jumping to message)
   * NOTE: Messaging features removed - returns empty result
   */
  async getMessagesAround(chatId, messageId, options = {}) {
    console.warn('⚠️ getMessagesAround called but messaging features have been removed');
    return {
      messages: [],
      total: 0,
      hasMore: false,
      hasPrevious: false,
      targetMessage: null
    };
  }

  /**
   * Get unread message count for a user in a chat
   * NOTE: Messaging features removed - returns 0
   */
  async getUnreadCount(chatId, userId) {
    console.warn('⚠️ getUnreadCount called but messaging features have been removed');
    return 0;
  }

  /**
   * Get message statistics for a chat
   * NOTE: Messaging features removed - returns empty stats
   */
  async getMessageStats(chatId, userId = null) {
    console.warn('⚠️ getMessageStats called but messaging features have been removed');
    return {
      totalMessages: 0,
      totalSize: 0,
      avgMessageLength: 0,
      messagesWithAttachments: 0,
      messagesWithReactions: 0
    };
  }

  /**
   * Search messages with pagination
   * NOTE: Messaging features removed - returns empty result
   */
  async searchMessages(chatId, searchQuery, options = {}) {
    console.warn('⚠️ searchMessages called but messaging features have been removed');
    return {
      messages: [],
      total: 0,
      page: options.page || 1,
      limit: options.limit || this.defaultPageSize,
      hasMore: false,
      searchQuery
    };
  }

  /**
   * Sanitize pagination options
   */
  sanitizeOptions(options) {
    return {
      page: Math.max(1, parseInt(options.page) || 1),
      limit: Math.min(this.maxPageSize, Math.max(1, parseInt(options.limit) || this.defaultPageSize)),
      before: options.before || null,
      after: options.after || null,
      includeDeleted: Boolean(options.includeDeleted),
      includeModerated: Boolean(options.includeModerated),
      sortBy: ['createdAt', 'updatedAt'].includes(options.sortBy) ? options.sortBy : 'createdAt',
      sortOrder: ['asc', 'desc'].includes(options.sortOrder) ? options.sortOrder : 'desc',
      userId: options.userId || null
    };
  }

  /**
   * Build message query
   */
  buildMessageQuery(chatId, options) {
    const query = { chatId };

    // Handle cursor-based pagination
    if (options.before) {
      query._id = { $lt: options.before };
    } else if (options.after) {
      query._id = { $gt: options.after };
    }

    // Filter deleted messages
    if (!options.includeDeleted) {
      query.deleted = false;
    }

    // Filter moderated messages
    if (!options.includeModerated) {
      query.moderationStatus = 'active';
    }

    return query;
  }

  /**
   * Execute optimized query
   * NOTE: Messaging features removed - returns empty result
   */
  async executeOptimizedQuery(query, options) {
    return {
      messages: [],
      total: 0,
      page: options.page,
      limit: options.limit,
      hasMore: false,
      hasPrevious: false
    };
  }

  /**
   * Get messages before a timestamp
   * NOTE: Messaging features removed - returns empty array
   */
  async getMessagesBefore(chatId, timestamp, limit) {
    return [];
  }

  /**
   * Get messages after a timestamp
   * NOTE: Messaging features removed - returns empty array
   */
  async getMessagesAfter(chatId, timestamp, limit) {
    return [];
  }

  /**
   * Check chat access
   * NOTE: Messaging features removed - returns false
   */
  async checkChatAccess(chatId, userId) {
    return false;
  }

  /**
   * Get cache key
   */
  getCacheKey(chatId, options) {
    const keyParts = [
      this.cachePrefix,
      chatId,
      options.page,
      options.limit,
      options.before || '',
      options.after || '',
      options.includeDeleted ? '1' : '0',
      options.includeModerated ? '1' : '0',
      options.sortBy,
      options.sortOrder
    ];
    return keyParts.join(':');
  }

  /**
   * Get from cache
   */
  async getFromCache(key) {
    try {
      const cached = await redisService.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cache
   */
  async setCache(key, data, ttl = this.cacheTTL) {
    try {
      await redisService.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Invalidate cache for a chat
   */
  async invalidateChatCache(chatId) {
    try {
      const pattern = `${this.cachePrefix}${chatId}:*`;
      const keys = await redisService.keys(pattern);
      if (keys.length > 0) {
        await redisService.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  /**
   * Clear all message caches
   */
  async clearAllCaches() {
    try {
      const pattern = `${this.cachePrefix}*`;
      const keys = await redisService.keys(pattern);
      if (keys.length > 0) {
        await redisService.del(...keys);
      }
    } catch (error) {
      console.error('Clear all caches error:', error);
    }
  }
}

// Create singleton instance
const messagePaginationService = new MessagePaginationService();

module.exports = messagePaginationService;
