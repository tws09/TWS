/**
 * Cache Service
 * Provides caching functionality with Redis support (fallback to in-memory)
 */
const redisConfig = require('../../config/redis');

class CacheService {
  constructor() {
    this.initialized = false;
    this.useRedis = false;
    this.cache = new Map(); // In-memory fallback
    this.ttlMap = new Map();
    this.redis = null;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (this.initialized) return;
    
    // Try to use Redis if available
    if (redisConfig.isRedisAvailable()) {
      try {
        this.redis = redisConfig.getRedis();
        this.useRedis = true;
        console.log('🗄️ Cache Service initialized with Redis');
      } catch (error) {
        console.warn('Redis not available, using in-memory cache:', error.message);
        this.useRedis = false;
      }
    } else {
      // Start TTL cleanup interval for in-memory cache
      this.cleanupInterval = setInterval(() => {
        this.cleanupExpired();
      }, 60000); // Clean up every minute
      console.log('🗄️ Cache Service initialized with in-memory cache');
    }

    this.initialized = true;
  }

  /**
   * Set cache value with optional TTL
   */
  async set(key, value, ttlSeconds = 3600) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useRedis && this.redis) {
        const serialized = JSON.stringify(value);
        if (ttlSeconds > 0) {
          await this.redis.setex(key, ttlSeconds, serialized);
        } else {
          await this.redis.set(key, serialized);
        }
        return true;
      } else {
        // In-memory cache
        this.cache.set(key, value);
        if (ttlSeconds > 0) {
          const expiresAt = Date.now() + (ttlSeconds * 1000);
          this.ttlMap.set(key, expiresAt);
        }
        return true;
      }
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Get cache value
   */
  async get(key) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useRedis && this.redis) {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        // In-memory cache
        if (this.ttlMap.has(key)) {
          const expiresAt = this.ttlMap.get(key);
          if (Date.now() > expiresAt) {
            this.delete(key);
            return null;
          }
        }
        return this.cache.get(key) || null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete cache value
   */
  async delete(key) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useRedis && this.redis) {
        await this.redis.del(key);
        return true;
      } else {
        this.cache.delete(key);
        this.ttlMap.delete(key);
        return true;
      }
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Invalidate cache by pattern (Redis only)
   */
  async invalidatePattern(pattern) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useRedis && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        return keys.length;
      } else {
        // In-memory: delete all keys matching pattern (simple regex)
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        let deleted = 0;
        for (const key of this.cache.keys()) {
          if (regex.test(key)) {
            this.cache.delete(key);
            this.ttlMap.delete(key);
            deleted++;
          }
        }
        return deleted;
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    if (!this.initialized) return false;

    this.cache.clear();
    this.ttlMap.clear();
    return true;
  }

  /**
   * Check if key exists
   */
  async has(key) {
    if (!this.initialized) return false;

    // Check if expired
    if (this.ttlMap.has(key)) {
      const expiresAt = this.ttlMap.get(key);
      if (Date.now() > expiresAt) {
        this.delete(key);
        return false;
      }
    }

    return this.cache.has(key);
  }

  /**
   * Clean up expired entries
   */
  cleanupExpired() {
    const now = Date.now();
    for (const [key, expiresAt] of this.ttlMap.entries()) {
      if (now > expiresAt) {
        this.cache.delete(key);
        this.ttlMap.delete(key);
      }
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.initialized;
  }

  /**
   * Get service metrics
   */
  async getMetrics() {
    return {
      status: 'active',
      initialized: this.initialized,
      cacheSize: this.cache.size,
      ttlEntries: this.ttlMap.size
    };
  }

  /**
   * Shutdown service
   */
  async shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    this.ttlMap.clear();
    this.initialized = false;
    console.log('🗄️ Cache Service shut down');
  }
}

module.exports = new CacheService();
