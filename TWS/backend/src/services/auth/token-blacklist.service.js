const jwt = require('jsonwebtoken');

/**
 * Token Blacklist Service
 * Manages token revocation using Redis (or in-memory fallback)
 */
class TokenBlacklistService {
  constructor() {
    this.tokenBlacklist = new Map();
    if (process.env.REDIS_DISABLED === 'true') {
      this.useRedis = false;
      this.redisClient = null;
      return;
    }
    // Try to use Redis if available, otherwise use in-memory Map
    try {
      const redis = require('redis');
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      this.redisClient.on('error', (err) => {
        console.error('Redis connection error:', err);
        this.useRedis = false;
        this.tokenBlacklist = new Map();
      });
      this.redisClient.connect().then(() => {
        this.useRedis = true;
        console.log('✅ Token blacklist using Redis');
      }).catch(() => {
        this.useRedis = false;
        this.tokenBlacklist = new Map();
        console.log('⚠️ Redis not available, using in-memory token blacklist');
      });
    } catch (error) {
      this.useRedis = false;
      this.redisClient = null;
      console.log('⚠️ Redis not available, using in-memory token blacklist');
    }
  }

  /**
   * Blacklist a token
   * @param {string} token - The token to blacklist
   * @param {number} expiresIn - Expiration time in seconds (default: token's expiration)
   */
  async blacklistToken(token, expiresIn = null) {
    try {
      // Decode token to get expiration
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return false; // Invalid token
      }

      const expirationTime = decoded.exp;
      const now = Math.floor(Date.now() / 1000);
      
      // Only blacklist if token hasn't expired
      if (expirationTime <= now) {
        return false; // Token already expired
      }

      const ttl = expiresIn || (expirationTime - now);

      if (this.useRedis && this.redisClient) {
        // Use Redis with TTL
        await this.redisClient.setEx(`blacklist:${token}`, ttl, '1');
      } else {
        // Use in-memory Map with expiration tracking
        this.tokenBlacklist.set(token, {
          expiresAt: Date.now() + (ttl * 1000),
          blacklistedAt: Date.now()
        });
      }

      return true;
    } catch (error) {
      console.error('Error blacklisting token:', error);
      return false;
    }
  }

  /**
   * Check if token is blacklisted
   * @param {string} token - The token to check
   * @returns {boolean} - True if token is blacklisted
   */
  async isTokenBlacklisted(token) {
    try {
      if (this.useRedis && this.redisClient) {
        const result = await this.redisClient.get(`blacklist:${token}`);
        return result === '1';
      } else {
        const entry = this.tokenBlacklist.get(token);
        if (!entry) {
          return false;
        }
        
        // Check if entry has expired
        if (Date.now() > entry.expiresAt) {
          this.tokenBlacklist.delete(token);
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      return false; // Fail open - allow token if check fails
    }
  }

  /**
   * Blacklist refresh token by JTI
   * @param {string} jti - JWT ID of refresh token
   * @param {number} expiresIn - Expiration time in seconds
   */
  async blacklistRefreshToken(jti, expiresIn = 7 * 24 * 60 * 60) {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.setEx(`blacklist:refresh:${jti}`, expiresIn, '1');
      } else {
        this.tokenBlacklist.set(`refresh:${jti}`, {
          expiresAt: Date.now() + (expiresIn * 1000),
          blacklistedAt: Date.now()
        });
      }
      return true;
    } catch (error) {
      console.error('Error blacklisting refresh token:', error);
      return false;
    }
  }

  /**
   * Check if refresh token is blacklisted
   * @param {string} jti - JWT ID of refresh token
   * @returns {boolean} - True if refresh token is blacklisted
   */
  async isRefreshTokenBlacklisted(jti) {
    try {
      if (this.useRedis && this.redisClient) {
        const result = await this.redisClient.get(`blacklist:refresh:${jti}`);
        return result === '1';
      } else {
        const entry = this.tokenBlacklist.get(`refresh:${jti}`);
        if (!entry) {
          return false;
        }
        
        if (Date.now() > entry.expiresAt) {
          this.tokenBlacklist.delete(`refresh:${jti}`);
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error checking refresh token blacklist:', error);
      return false;
    }
  }

  /**
   * Clean up expired tokens from memory (Redis handles this automatically)
   */
  cleanupExpiredTokens() {
    if (!this.useRedis && this.tokenBlacklist) {
      const now = Date.now();
      for (const [token, entry] of this.tokenBlacklist.entries()) {
        if (now > entry.expiresAt) {
          this.tokenBlacklist.delete(token);
        }
      }
    }
  }
}

// Create singleton instance
const tokenBlacklistService = new TokenBlacklistService();

// Cleanup expired tokens every hour
setInterval(() => {
  tokenBlacklistService.cleanupExpiredTokens();
}, 60 * 60 * 1000);

module.exports = tokenBlacklistService;
