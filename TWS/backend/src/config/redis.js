// Redis configuration with fallback for development
const Redis = require('ioredis');

let redis = null;
let redisErrorLogged = false;

// Check if Redis is disabled via environment variable
if (process.env.REDIS_DISABLED === 'true') {
  console.log('ℹ️  Redis disabled via REDIS_DISABLED=true');
} else {
  // Try to connect to Redis, but don't fail if it's not available
  try {
    redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: null, // Fix for BullMQ compatibility
    lazyConnect: true,
    connectTimeout: 5000,
    commandTimeout: 5000,
    retryDelayOnClusterDown: 300,
    enableOfflineQueue: false,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      // Stop retrying after 3 attempts to prevent spam
      if (times > 3) {
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    }
  });

  redis.on('error', (err) => {
    // Only log the error once to prevent spam
    if (!redisErrorLogged && err.code !== 'ECONNREFUSED') {
      console.warn('⚠️  Redis connection error (continuing without Redis):', err.message);
      redisErrorLogged = true;
    }
    // Suppress ECONNREFUSED errors - they're expected when Redis is not running
    if (err.code === 'ECONNREFUSED' && !redisErrorLogged) {
      console.warn('⚠️  Redis not available - continuing without Redis');
      console.warn('   To enable: Install and start Redis, or set REDIS_DISABLED=true');
      redisErrorLogged = true;
    }
    redis = null;
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
    redisErrorLogged = false; // Reset flag on successful connection
  });

  } catch (error) {
    if (!redisErrorLogged) {
      console.warn('⚠️  Redis not available (continuing without Redis):', error.message);
      redisErrorLogged = true;
    }
    redis = null;
  }
}

// Fallback functions when Redis is not available
const redisFallback = {
  get: async (key) => null,
  set: async (key, value) => 'OK',
  del: async (key) => 1,
  exists: async (key) => 0,
  expire: async (key, seconds) => 1,
  hget: async (key, field) => null,
  hset: async (key, field, value) => 1,
  hdel: async (key, field) => 1,
  hgetall: async (key) => ({}),
  sadd: async (key, member) => 1,
  srem: async (key, member) => 1,
  smembers: async (key) => [],
  publish: async (channel, message) => 0,
  subscribe: async (channel) => {},
  unsubscribe: async (channel) => {}
};

module.exports = {
  getRedis: () => redis || redisFallback,
  isRedisAvailable: () => redis !== null,
  
  // Helper functions
  async get(key) {
    const client = this.getRedis();
    return await client.get(key);
  },
  
  async set(key, value, expireSeconds = null) {
    const client = this.getRedis();
    if (expireSeconds) {
      return await client.setex(key, expireSeconds, value);
    }
    return await client.set(key, value);
  },
  
  async del(key) {
    const client = this.getRedis();
    return await client.del(key);
  },
  
  async exists(key) {
    const client = this.getRedis();
    return await client.exists(key);
  }
};
