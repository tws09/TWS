const mongoose = require('mongoose');
const Redis = require('ioredis');
const envConfig = require('../../config/environment');

/**
 * Connection Pool Service
 * Manages database and Redis connection pools for optimal performance
 */
class ConnectionPoolService {
  constructor() {
    this.mongoConnection = null;
    this.redisConnections = new Map();
    this.connectionStats = {
      mongo: { active: 0, idle: 0, total: 0 },
      redis: { active: 0, idle: 0, total: 0 }
    };
  }

  /**
   * Initialize MongoDB connection with optimized pooling
   */
  async initializeMongoDB() {
    try {
      const dbConfig = envConfig.getDatabaseConfig();
      
      // Enhanced connection options for production
      const options = {
        ...dbConfig.options,
        // Connection pool settings
        maxPoolSize: 20, // Maximum number of connections in the pool
        minPoolSize: 5,  // Minimum number of connections in the pool
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        serverSelectionTimeoutMS: 5000, // How long to try selecting a server
        socketTimeoutMS: 45000, // How long a send or receive on a socket can take
        connectTimeoutMS: 10000, // How long to wait for initial connection
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
        
        // Read preferences for better performance
        readPreference: 'secondaryPreferred',
        
        // Compression
        compressors: ['zlib'],
        
        // Retry settings
        retryWrites: true,
        retryReads: true,
        
        // Monitoring
        monitorCommands: process.env.NODE_ENV === 'development'
      };

      this.mongoConnection = await mongoose.connect(dbConfig.uri, options);

      // Set up connection event listeners
      mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB connected successfully');
        this.updateConnectionStats('mongo', 'connected');
      });

      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.updateConnectionStats('mongo', 'error');
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.updateConnectionStats('mongo', 'disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.updateConnectionStats('mongo', 'reconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', this.gracefulShutdown.bind(this));
      process.on('SIGTERM', this.gracefulShutdown.bind(this));

      return this.mongoConnection;

    } catch (error) {
      console.error('Failed to initialize MongoDB:', error);
      throw error;
    }
  }

  /**
   * Initialize Redis connection pools
   */
  async initializeRedis() {
    try {
      const redisConfig = envConfig.getRedisConfig();
      
      // Create different Redis connections for different purposes
      const connections = {
        // Main Redis connection for caching and sessions
        main: new Redis({
          ...redisConfig,
          lazyConnect: true,
          maxRetriesPerRequest: null,
          retryDelayOnFailover: 100,
          enableReadyCheck: true,
          maxLoadingTimeout: 5000,
          connectTimeout: 10000,
          commandTimeout: 5000,
          // Connection pool settings
          family: 4, // IPv4
          keepAlive: 30000,
          // Retry settings
          retryDelayOnClusterDown: 300,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: null,
          // Offline queue
          enableOfflineQueue: false
        }),

        // Redis connection for pub/sub
        pubsub: new Redis({
          ...redisConfig,
          lazyConnect: true,
          maxRetriesPerRequest: null,
          retryDelayOnFailover: 100,
          enableReadyCheck: true,
          maxLoadingTimeout: 5000,
          connectTimeout: 5000,
          commandTimeout: 5000,
          family: 4,
          keepAlive: 30000,
          retryDelayOnClusterDown: 300,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: null,
          enableOfflineQueue: false,
          retryStrategy: (times) => {
            if (times > 3) return null;
            return Math.min(times * 200, 2000);
          }
        }),

        // Redis connection for rate limiting
        rateLimit: new Redis({
          ...redisConfig,
          lazyConnect: true,
          maxRetriesPerRequest: null,
          retryDelayOnFailover: 100,
          enableReadyCheck: true,
          maxLoadingTimeout: 5000,
          connectTimeout: 5000,
          commandTimeout: 5000,
          family: 4,
          keepAlive: 30000,
          retryDelayOnClusterDown: 300,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: null,
          enableOfflineQueue: false,
          retryStrategy: (times) => {
            if (times > 3) return null;
            return Math.min(times * 200, 2000);
          }
        }),

        // Redis connection for sessions
        session: new Redis({
          ...redisConfig,
          lazyConnect: true,
          maxRetriesPerRequest: null,
          retryDelayOnFailover: 100,
          enableReadyCheck: true,
          maxLoadingTimeout: 5000,
          connectTimeout: 5000,
          commandTimeout: 5000,
          family: 4,
          keepAlive: 30000,
          retryDelayOnClusterDown: 300,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: null,
          enableOfflineQueue: false,
          retryStrategy: (times) => {
            if (times > 3) return null;
            return Math.min(times * 200, 2000);
          }
        })
      };

      // Set up event listeners for each connection
      const errorFlags = {}; // Track which connections have logged errors
      for (const [name, connection] of Object.entries(connections)) {
        errorFlags[name] = false;
        
        connection.on('connect', () => {
          console.log(`✅ Redis ${name} connected`);
          this.updateConnectionStats('redis', 'connected', name);
          errorFlags[name] = false; // Reset error flag on successful connection
        });

        connection.on('error', (error) => {
          // Suppress repeated ECONNREFUSED errors
          if (error.code === 'ECONNREFUSED' && errorFlags[name]) {
            return; // Already logged, suppress
          }
          if (error.code === 'ECONNREFUSED' && !errorFlags[name]) {
            // Log once per connection type
            console.warn(`⚠️  Redis ${name} not available (continuing without Redis)`);
            errorFlags[name] = true;
          } else if (!errorFlags[name]) {
            console.error(`❌ Redis ${name} error:`, error.message);
            errorFlags[name] = true;
          }
          this.updateConnectionStats('redis', 'error', name);
        });

        connection.on('close', () => {
          console.log(`⚠️ Redis ${name} closed`);
          this.updateConnectionStats('redis', 'closed', name);
        });

        connection.on('reconnecting', () => {
          console.log(`🔄 Redis ${name} reconnecting`);
          this.updateConnectionStats('redis', 'reconnecting', name);
        });

        // Connect the Redis instance
        await connection.connect();
        
        this.redisConnections.set(name, connection);
      }

      return this.redisConnections;

    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      throw error;
    }
  }

  /**
   * Get MongoDB connection
   */
  getMongoConnection() {
    return this.mongoConnection;
  }

  /**
   * Get Redis connection by name
   */
  getRedisConnection(name = 'main') {
    return this.redisConnections.get(name);
  }

  /**
   * Get all Redis connections
   */
  getAllRedisConnections() {
    return this.redisConnections;
  }

  /**
   * Check if connections are healthy
   */
  async checkHealth() {
    const health = {
      mongo: false,
      redis: {},
      timestamp: new Date()
    };

    try {
      // Check MongoDB health
      if (this.mongoConnection && mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping();
        health.mongo = true;
      }
    } catch (error) {
      console.error('MongoDB health check failed:', error);
    }

    // Check Redis health
    for (const [name, connection] of this.redisConnections) {
      try {
        if (connection.status === 'ready') {
          await connection.ping();
          health.redis[name] = true;
        } else {
          health.redis[name] = false;
        }
      } catch (error) {
        console.error(`Redis ${name} health check failed:`, error);
        health.redis[name] = false;
      }
    }

    return health;
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    const stats = {
      mongo: {
        ...this.connectionStats.mongo,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      },
      redis: {}
    };

    for (const [name, connection] of this.redisConnections) {
      stats.redis[name] = {
        status: connection.status,
        host: connection.options.host,
        port: connection.options.port,
        db: connection.options.db
      };
    }

    return stats;
  }

  /**
   * Update connection statistics
   */
  updateConnectionStats(type, event, name = null) {
    if (type === 'mongo') {
      switch (event) {
        case 'connected':
          this.connectionStats.mongo.active++;
          this.connectionStats.mongo.total++;
          break;
        case 'disconnected':
          this.connectionStats.mongo.active = Math.max(0, this.connectionStats.mongo.active - 1);
          break;
        case 'error':
          // Handle error state
          break;
      }
    } else if (type === 'redis' && name) {
      // Redis connection stats would be handled here
    }
  }

  /**
   * Optimize connection pools
   */
  async optimizePools() {
    try {
      // Optimize MongoDB connection pool
      if (this.mongoConnection) {
        const db = mongoose.connection.db;
        await db.admin().command({ setParameter: 1, maxIncomingConnections: 100 });
      }

      // Optimize Redis connections
      for (const [name, connection] of this.redisConnections) {
        // Set Redis-specific optimizations
        await connection.config('SET', 'tcp-keepalive', '60');
        await connection.config('SET', 'timeout', '300');
      }

      console.log('✅ Connection pools optimized');
    } catch (error) {
      console.error('Failed to optimize connection pools:', error);
    }
  }

  /**
   * Graceful shutdown
   */
  async gracefulShutdown() {
    console.log('🔄 Starting graceful shutdown...');

    try {
      // Close MongoDB connection
      if (this.mongoConnection) {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
      }

      // Close Redis connections
      for (const [name, connection] of this.redisConnections) {
        await connection.quit();
        console.log(`✅ Redis ${name} connection closed`);
      }

      console.log('✅ All connections closed gracefully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Monitor connection performance
   */
  startPerformanceMonitoring() {
    setInterval(async () => {
      try {
        const stats = this.getConnectionStats();
        const health = await this.checkHealth();

        // Log performance metrics
        console.log('📊 Connection Performance:', {
          mongo: {
            readyState: stats.mongo.readyState,
            active: stats.mongo.active
          },
          redis: Object.keys(stats.redis).reduce((acc, name) => {
            acc[name] = {
              status: stats.redis[name].status,
              healthy: health.redis[name]
            };
            return acc;
          }, {})
        });

        // Alert on unhealthy connections
        if (!health.mongo) {
          console.warn('⚠️ MongoDB connection is unhealthy');
        }

        for (const [name, healthy] of Object.entries(health.redis)) {
          if (!healthy) {
            console.warn(`⚠️ Redis ${name} connection is unhealthy`);
          }
        }

      } catch (error) {
        console.error('Performance monitoring error:', error);
      }
    }, 60000); // Check every minute
  }

  /**
   * Create connection pool for specific use case
   */
  createCustomPool(type, config) {
    switch (type) {
      case 'redis':
        const redisConnection = new Redis({
          ...envConfig.getRedisConfig(),
          ...config,
          lazyConnect: true
        });
        
        redisConnection.on('connect', () => {
          console.log(`✅ Custom Redis pool connected: ${config.name || 'unnamed'}`);
        });

        redisConnection.on('error', (error) => {
          console.error(`❌ Custom Redis pool error:`, error);
        });

        return redisConnection;

      default:
        throw new Error(`Unsupported pool type: ${type}`);
    }
  }

  /**
   * Get connection pool recommendations
   */
  getPoolRecommendations() {
    return {
      mongo: {
        maxPoolSize: 20,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000
      },
      redis: {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        connectTimeout: 10000,
        commandTimeout: 5000,
        keepAlive: 30000,
        enableOfflineQueue: false
      }
    };
  }
}

// Create singleton instance
const connectionPoolService = new ConnectionPoolService();

module.exports = connectionPoolService;
