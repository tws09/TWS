const Redis = require('ioredis');

class RedisService {
  constructor() {
    this.pubClient = null;
    this.subClient = null;
    this.isConnected = false;
    this.errorLogged = false;
  }

  async connect() {
    // Check if Redis is disabled
    if (process.env.REDIS_DISABLED === 'true') {
      console.log('Redis is disabled via environment variable. Skipping Redis initialization.');
      this.pubClient = null;
      this.subClient = null;
      this.isConnected = false;
      return { pubClient: null, subClient: null };
    }

    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: null,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 5000,
        commandTimeout: 5000,
        retryDelayOnClusterDown: 300,
        enableOfflineQueue: false,
        maxLoadingTimeout: 5000,
        retryStrategy: (times) => {
          // Stop retrying after 3 attempts
          if (times > 3) {
            return null;
          }
          return Math.min(times * 200, 2000);
        }
      };

      // Create separate clients for pub/sub to avoid conflicts
      this.pubClient = new Redis(redisConfig);
      this.subClient = new Redis(redisConfig);

      // Handle connection events
      this.pubClient.on('connect', () => {
        console.log('Redis Pub Client connected');
        this.isConnected = true;
        this.errorLogged = false; // Reset on successful connection
      });

      this.subClient.on('connect', () => {
        console.log('Redis Sub Client connected');
        this.errorLogged = false; // Reset on successful connection
      });

      this.pubClient.on('error', (err) => {
        // Suppress repeated connection errors
        if (!this.errorLogged && err.code === 'ECONNREFUSED') {
          // Error already logged by main redis config, just mark as logged
          this.errorLogged = true;
        } else if (!this.errorLogged && err.code !== 'ECONNREFUSED') {
          console.error('Redis Pub Client error:', err.message);
          this.errorLogged = true;
        }
        this.isConnected = false;
      });

      this.subClient.on('error', (err) => {
        // Suppress repeated connection errors
        if (err.code === 'ECONNREFUSED') {
          // Suppress - already handled
          return;
        }
        if (!this.errorLogged) {
          console.error('Redis Sub Client error:', err.message);
          this.errorLogged = true;
        }
      });

      this.pubClient.on('close', () => {
        console.log('Redis Pub Client disconnected');
        this.isConnected = false;
      });

      this.subClient.on('close', () => {
        console.log('Redis Sub Client disconnected');
      });

      // Connect both clients
      await Promise.all([
        this.pubClient.connect(),
        this.subClient.connect()
      ]);

      console.log('Redis service initialized successfully');
      return { pubClient: this.pubClient, subClient: this.subClient };
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // In development, continue without Redis instead of crashing
      if (process.env.NODE_ENV === 'development') {
        console.log('Continuing in development mode without Redis...');
        this.pubClient = null;
        this.subClient = null;
        this.isConnected = false;
        return { pubClient: null, subClient: null };
      }
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.pubClient) {
        await this.pubClient.quit();
      }
      if (this.subClient) {
        await this.subClient.quit();
      }
      this.isConnected = false;
      console.log('Redis service disconnected');
    } catch (error) {
      console.error('Error disconnecting Redis:', error);
    }
  }

  getClients() {
    if (!this.pubClient || !this.subClient) {
      throw new Error('Redis clients not initialized');
    }
    return { pubClient: this.pubClient, subClient: this.subClient };
  }

  isHealthy() {
    return this.isConnected && this.pubClient && this.subClient;
  }
}

module.exports = new RedisService();
