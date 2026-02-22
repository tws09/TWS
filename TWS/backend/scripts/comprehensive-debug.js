#!/usr/bin/env node

/**
 * Comprehensive TWS Backend Debugging Script
 * This script performs a complete analysis of all server components
 */

const http = require('http');
const https = require('https');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class TWSDebugger {
  constructor() {
    this.results = {
      serverHealth: {},
      databaseConnectivity: {},
      apiEndpoints: {},
      configuration: {},
      performance: {},
      security: {},
      issues: [],
      recommendations: []
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logSection(title) {
    console.log('\n' + '='.repeat(60));
    this.log(`🔍 ${title}`, 'cyan');
    console.log('='.repeat(60));
  }

  logSuccess(message) {
    this.log(`✅ ${message}`, 'green');
  }

  logWarning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  logError(message) {
    this.log(`❌ ${message}`, 'red');
  }

  logInfo(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  // Test HTTP endpoint
  async testEndpoint(url, method = 'GET', headers = {}) {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'User-Agent': 'TWS-Debugger/1.0',
          ...headers
        },
        timeout: 5000
      };

      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          status: 0,
          error: error.message,
          success: false
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: 0,
          error: 'Request timeout',
          success: false
        });
      });

      req.end();
    });
  }

  // Test database connectivity
  async testDatabaseConnectivity() {
    this.logSection('Database Connectivity Tests');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tws-dev';
    this.logInfo(`Testing MongoDB connection: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
    
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false
      });
      
      this.logSuccess('MongoDB connection successful');
      
      // Test basic operations
      const collections = await mongoose.connection.db.listCollections().toArray();
      this.logInfo(`Found ${collections.length} collections`);
      
      // Test tenant isolation
      const User = mongoose.model('User', new mongoose.Schema({
        email: String,
        tenantId: String,
        role: String
      }));
      
      const userCount = await User.countDocuments();
      this.logInfo(`Total users in database: ${userCount}`);
      
      // Test tenant-specific queries
      const tenantUsers = await User.aggregate([
        { $group: { _id: '$tenantId', count: { $sum: 1 } } }
      ]);
      
      this.logInfo(`Tenant distribution:`);
      tenantUsers.forEach(tenant => {
        this.logInfo(`  Tenant ${tenant._id}: ${tenant.count} users`);
      });
      
      this.results.databaseConnectivity = {
        status: 'connected',
        collections: collections.length,
        totalUsers: userCount,
        tenantDistribution: tenantUsers
      };
      
    } catch (error) {
      this.logError(`MongoDB connection failed: ${error.message}`);
      this.results.databaseConnectivity = {
        status: 'failed',
        error: error.message
      };
      this.results.issues.push({
        type: 'database',
        severity: 'critical',
        message: `Database connection failed: ${error.message}`
      });
    } finally {
      await mongoose.disconnect();
    }
  }

  // Test server health endpoints
  async testServerHealth() {
    this.logSection('Server Health Tests');
    
    const endpoints = [
      { url: 'http://localhost:3000', name: 'Frontend (React)', expected: 200 },
      { url: 'http://localhost:5000/health', name: 'Backend Health', expected: 200 },
      { url: 'http://localhost:5000/api/health', name: 'API Health', expected: 200 },
      { url: 'http://localhost:3001', name: 'Admin Dashboard', expected: 200 },
      { url: 'http://localhost:4000/health', name: 'Backend Alt Port', expected: 200 }
    ];
    
    for (const endpoint of endpoints) {
      this.logInfo(`Testing ${endpoint.name}...`);
      const result = await this.testEndpoint(endpoint.url);
      
      if (result.success) {
        this.logSuccess(`${endpoint.name}: ${result.status} OK`);
        this.results.serverHealth[endpoint.name] = {
          status: 'healthy',
          responseTime: 'N/A',
          statusCode: result.status
        };
      } else {
        this.logError(`${endpoint.name}: ${result.status || 'Connection failed'} - ${result.error || 'Unknown error'}`);
        this.results.serverHealth[endpoint.name] = {
          status: 'unhealthy',
          error: result.error || `HTTP ${result.status}`,
          statusCode: result.status
        };
        this.results.issues.push({
          type: 'server',
          severity: result.status === 0 ? 'critical' : 'warning',
          message: `${endpoint.name} is not responding: ${result.error || `HTTP ${result.status}`}`
        });
      }
    }
  }

  // Test API endpoints
  async testAPIEndpoints() {
    this.logSection('API Endpoint Tests');
    
    const apiEndpoints = [
      { url: 'http://localhost:5000/api/auth/login', method: 'POST', name: 'Auth Login' },
      { url: 'http://localhost:5000/api/supra-admin/tenants', method: 'GET', name: 'Supra-Admin Tenants' },
      { url: 'http://localhost:5000/api/users', method: 'GET', name: 'Users API' },
      { url: 'http://localhost:5000/api/employees', method: 'GET', name: 'Employees API' },
      { url: 'http://localhost:5000/api/attendance', method: 'GET', name: 'Attendance API' }
    ];
    
    for (const endpoint of apiEndpoints) {
      this.logInfo(`Testing ${endpoint.name}...`);
      const result = await this.testEndpoint(endpoint.url, endpoint.method);
      
      if (result.status === 401) {
        this.logSuccess(`${endpoint.name}: 401 Unauthorized (Expected - Auth required)`);
        this.results.apiEndpoints[endpoint.name] = {
          status: 'protected',
          statusCode: 401,
          message: 'Authentication required'
        };
      } else if (result.success) {
        this.logSuccess(`${endpoint.name}: ${result.status} OK`);
        this.results.apiEndpoints[endpoint.name] = {
          status: 'accessible',
          statusCode: result.status
        };
      } else {
        this.logError(`${endpoint.name}: ${result.status} - ${result.error || 'Unknown error'}`);
        this.results.apiEndpoints[endpoint.name] = {
          status: 'error',
          statusCode: result.status,
          error: result.error
        };
        this.results.issues.push({
          type: 'api',
          severity: 'warning',
          message: `${endpoint.name} returned error: ${result.status} - ${result.error}`
        });
      }
    }
  }

  // Check configuration
  checkConfiguration() {
    this.logSection('Configuration Analysis');
    
    const config = {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '4000',
      mongoUri: process.env.MONGO_URI ? 'Set' : 'Not set',
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
      redisHost: process.env.REDIS_HOST || 'localhost',
      redisPort: process.env.REDIS_PORT || '6379',
      redisDisabled: process.env.REDIS_DISABLED === 'true',
      bullmqDisabled: process.env.BULLMQ_DISABLED === 'true',
      firebaseEnabled: !!process.env.FIREBASE_API_KEY
    };
    
    this.logInfo('Environment Configuration:');
    Object.entries(config).forEach(([key, value]) => {
      this.logInfo(`  ${key}: ${value}`);
    });
    
    // Check for security issues
    if (config.nodeEnv === 'production') {
      if (config.jwtSecret === 'Not set') {
        this.logError('JWT_SECRET not set in production!');
        this.results.issues.push({
          type: 'security',
          severity: 'critical',
          message: 'JWT_SECRET not set in production environment'
        });
      }
      
      if (config.mongoUri === 'Not set') {
        this.logError('MONGO_URI not set in production!');
        this.results.issues.push({
          type: 'security',
          severity: 'critical',
          message: 'MONGO_URI not set in production environment'
        });
      }
    }
    
    // Check Redis configuration
    if (!config.redisDisabled) {
      this.logInfo('Redis is enabled');
    } else {
      this.logWarning('Redis is disabled - some features may not work');
      this.results.issues.push({
        type: 'configuration',
        severity: 'warning',
        message: 'Redis is disabled - real-time features and caching may not work'
      });
    }
    
    this.results.configuration = config;
  }

  // Check file system and dependencies
  checkFileSystem() {
    this.logSection('File System & Dependencies');
    
    const criticalFiles = [
      'src/app.js',
      'server.js',
      'package.json',
      'src/middleware/auth.js',
      'src/middleware/errorHandler.js',
      'src/routes/supraAdmin.js'
    ];
    
    const missingFiles = [];
    
    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.logSuccess(`Found: ${file}`);
      } else {
        this.logError(`Missing: ${file}`);
        missingFiles.push(file);
      }
    });
    
    if (missingFiles.length > 0) {
      this.results.issues.push({
        type: 'filesystem',
        severity: 'critical',
        message: `Missing critical files: ${missingFiles.join(', ')}`
      });
    }
    
    // Check package.json
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      this.logInfo(`Package: ${packageJson.name} v${packageJson.version}`);
      this.logInfo(`Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
      this.logInfo(`Dev Dependencies: ${Object.keys(packageJson.devDependencies || {}).length}`);
    } catch (error) {
      this.logError(`Error reading package.json: ${error.message}`);
    }
  }

  // Performance analysis
  analyzePerformance() {
    this.logSection('Performance Analysis');
    
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    this.logInfo(`Memory Usage:`);
    this.logInfo(`  RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB`);
    this.logInfo(`  Heap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`);
    this.logInfo(`  Heap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`);
    this.logInfo(`  External: ${Math.round(memoryUsage.external / 1024 / 1024)} MB`);
    
    this.logInfo(`Uptime: ${Math.round(uptime)} seconds`);
    
    // Check for memory leaks
    if (memoryUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
      this.logWarning('High memory usage detected');
      this.results.issues.push({
        type: 'performance',
        severity: 'warning',
        message: 'High memory usage detected - potential memory leak'
      });
    }
    
    this.results.performance = {
      memoryUsage,
      uptime,
      nodeVersion: process.version,
      platform: process.platform
    };
  }

  // Generate recommendations
  generateRecommendations() {
    this.logSection('Recommendations');
    
    const recommendations = [];
    
    // Database recommendations
    if (this.results.databaseConnectivity.status === 'failed') {
      recommendations.push({
        priority: 'critical',
        category: 'database',
        message: 'Fix database connectivity issues immediately'
      });
    }
    
    // Redis recommendations
    if (this.results.configuration.redisDisabled) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        message: 'Enable Redis for better performance and real-time features'
      });
    }
    
    // Security recommendations
    if (this.results.configuration.nodeEnv === 'production') {
      recommendations.push({
        priority: 'high',
        category: 'security',
        message: 'Ensure all environment variables are properly set in production'
      });
    }
    
    // Server recommendations
    const unhealthyServers = Object.entries(this.results.serverHealth)
      .filter(([_, status]) => status.status === 'unhealthy')
      .map(([name, _]) => name);
    
    if (unhealthyServers.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'server',
        message: `Fix unhealthy servers: ${unhealthyServers.join(', ')}`
      });
    }
    
    recommendations.forEach(rec => {
      const priorityColor = rec.priority === 'critical' ? 'red' : 
                           rec.priority === 'high' ? 'yellow' : 'blue';
      this.log(`[${rec.priority.toUpperCase()}] ${rec.message}`, priorityColor);
    });
    
    this.results.recommendations = recommendations;
  }

  // Generate final report
  generateReport() {
    this.logSection('Final Debug Report');
    
    const totalIssues = this.results.issues.length;
    const criticalIssues = this.results.issues.filter(i => i.severity === 'critical').length;
    const warnings = this.results.issues.filter(i => i.severity === 'warning').length;
    
    this.log(`Total Issues Found: ${totalIssues}`, totalIssues > 0 ? 'red' : 'green');
    this.log(`Critical Issues: ${criticalIssues}`, criticalIssues > 0 ? 'red' : 'green');
    this.log(`Warnings: ${warnings}`, warnings > 0 ? 'yellow' : 'green');
    
    if (totalIssues === 0) {
      this.logSuccess('🎉 No critical issues found! System appears to be healthy.');
    } else {
      this.logError('⚠️ Issues found that need attention.');
    }
    
    // Save report to file
    const reportPath = path.join(__dirname, 'debug-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    this.logInfo(`Detailed report saved to: ${reportPath}`);
    
    return this.results;
  }

  // Main debugging function
  async run() {
    this.log('🚀 Starting TWS Backend Comprehensive Debug Analysis', 'bright');
    this.log('=' .repeat(60), 'cyan');
    
    try {
      await this.testServerHealth();
      await this.testDatabaseConnectivity();
      await this.testAPIEndpoints();
      this.checkConfiguration();
      this.checkFileSystem();
      this.analyzePerformance();
      this.generateRecommendations();
      
      return this.generateReport();
    } catch (error) {
      this.logError(`Debug analysis failed: ${error.message}`);
      console.error(error);
      return null;
    }
  }
}

// Run the debugger if this script is executed directly
if (require.main === module) {
  const twsDebugger = new TWSDebugger();
  twsDebugger.run().then(results => {
    if (results) {
      process.exit(results.issues.filter(i => i.severity === 'critical').length > 0 ? 1 : 0);
    } else {
      process.exit(1);
    }
  });
}

module.exports = TWSDebugger;
