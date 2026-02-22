const os = require('os');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class StandaloneMonitoringService extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      system: {
        cpu: 0,
        memory: 0,
        disk: 0,
        network: 0,
        uptime: 0,
        loadAverage: [0, 0, 0],
        processes: 0,
        threads: 0
      },
      security: {
        failedLogins: 0,
        suspiciousActivity: 0,
        blockedIPs: 0,
        sslCertificates: [],
        firewallStatus: 'active',
        intrusionAttempts: 0,
        malwareScans: 0,
        vulnerabilityScans: 0
      },
      performance: {
        responseTime: 0,
        throughput: 0,
        errorRate: 0,
        activeConnections: 0,
        queueLength: 0,
        cacheHitRate: 0,
        databaseConnections: 0,
        apiCalls: 0
      },
      network: {
        bandwidth: 0,
        latency: 0,
        packetLoss: 0,
        dnsResolution: 0,
        sslHandshake: 0,
        connectionPool: 0,
        activeSessions: 0,
        dataTransfer: 0
      }
    };
    
    this.alerts = [];
    this.logs = [];
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 Standalone Monitoring Service Started');
    
    // Initial metrics collection
    this.collectMetrics();
    
    // Start periodic collection
    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, 2000); // Collect every 2 seconds
    
    // Emit initial data
    this.emit('metrics', this.metrics);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🛑 Standalone Monitoring Service Stopped');
  }

  collectMetrics() {
    try {
      // System metrics
      this.updateSystemMetrics();
      
      // Security metrics
      this.updateSecurityMetrics();
      
      // Performance metrics
      this.updatePerformanceMetrics();
      
      // Network metrics
      this.updateNetworkMetrics();
      
      // Generate alerts
      this.generateAlerts();
      
      // Emit updated metrics
      this.emit('metrics', this.metrics);
      
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  updateSystemMetrics() {
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce((acc, cpu) => acc + Object.values(cpu.times).reduce((a, b) => a + b, 0), 0);
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    
    this.metrics.system.cpu = Math.round(100 - ~~(100 * idle / total));
    this.metrics.system.memory = Math.round((1 - os.freemem() / os.totalmem()) * 100);
    this.metrics.system.uptime = Math.floor(os.uptime());
    this.metrics.system.loadAverage = os.loadavg();
    this.metrics.system.processes = os.cpus().length;
    this.metrics.system.threads = os.cpus().length * 2;
    
    // Disk usage (simulated)
    this.metrics.system.disk = Math.floor(Math.random() * 30) + 40;
  }

  updateSecurityMetrics() {
    // Simulate security metrics
    this.metrics.security.failedLogins = Math.floor(Math.random() * 5);
    this.metrics.security.suspiciousActivity = Math.floor(Math.random() * 3);
    this.metrics.security.blockedIPs = Math.floor(Math.random() * 10);
    this.metrics.security.intrusionAttempts = Math.floor(Math.random() * 2);
    this.metrics.security.malwareScans = Math.floor(Math.random() * 50) + 100;
    this.metrics.security.vulnerabilityScans = Math.floor(Math.random() * 20) + 50;
    
    // SSL certificates (simulated)
    this.metrics.security.sslCertificates = [
      { domain: 'localhost', expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), status: 'valid' },
      { domain: 'api.localhost', expires: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), status: 'valid' }
    ];
  }

  updatePerformanceMetrics() {
    // Response time (simulated)
    this.metrics.performance.responseTime = Math.floor(Math.random() * 100) + 50;
    
    // Throughput
    this.metrics.performance.throughput = Math.floor(Math.random() * 1000) + 500;
    
    // Error rate
    this.metrics.performance.errorRate = Math.random() * 2;
    
    // Active connections
    this.metrics.performance.activeConnections = Math.floor(Math.random() * 50) + 10;
    
    // Queue length
    this.metrics.performance.queueLength = Math.floor(Math.random() * 20);
    
    // Cache hit rate
    this.metrics.performance.cacheHitRate = Math.floor(Math.random() * 20) + 80;
    
    // Database connections (simulated)
    this.metrics.performance.databaseConnections = Math.floor(Math.random() * 20) + 5;
    
    // API calls
    this.metrics.performance.apiCalls = Math.floor(Math.random() * 1000) + 200;
  }

  updateNetworkMetrics() {
    // Network metrics (simulated)
    this.metrics.network.bandwidth = Math.floor(Math.random() * 1000) + 500;
    this.metrics.network.latency = Math.floor(Math.random() * 50) + 10;
    this.metrics.network.packetLoss = Math.random() * 0.1;
    this.metrics.network.dnsResolution = Math.floor(Math.random() * 20) + 5;
    this.metrics.network.sslHandshake = Math.floor(Math.random() * 30) + 10;
    this.metrics.network.connectionPool = Math.floor(Math.random() * 100) + 50;
    this.metrics.network.activeSessions = Math.floor(Math.random() * 200) + 100;
    this.metrics.network.dataTransfer = Math.floor(Math.random() * 10000) + 5000;
  }

  generateAlerts() {
    const now = new Date();
    
    // CPU alert
    if (this.metrics.system.cpu > 80) {
      this.addAlert('high', 'High CPU Usage', `CPU usage is at ${this.metrics.system.cpu}%`, 'system');
    }
    
    // Memory alert
    if (this.metrics.system.memory > 85) {
      this.addAlert('high', 'High Memory Usage', `Memory usage is at ${this.metrics.system.memory}%`, 'system');
    }
    
    // Security alerts
    if (this.metrics.security.failedLogins > 3) {
      this.addAlert('critical', 'Multiple Failed Logins', `${this.metrics.security.failedLogins} failed login attempts detected`, 'security');
    }
    
    if (this.metrics.security.intrusionAttempts > 0) {
      this.addAlert('critical', 'Intrusion Attempt', 'Potential intrusion attempt detected', 'security');
    }
    
    // Performance alerts
    if (this.metrics.performance.responseTime > 200) {
      this.addAlert('medium', 'High Response Time', `Response time is ${this.metrics.performance.responseTime}ms`, 'performance');
    }
    
    if (this.metrics.performance.errorRate > 1) {
      this.addAlert('high', 'High Error Rate', `Error rate is ${this.metrics.performance.errorRate}%`, 'performance');
    }
  }

  addAlert(severity, title, message, category) {
    const alert = {
      id: Date.now() + Math.random(),
      severity,
      title,
      message,
      category,
      timestamp: new Date(),
      acknowledged: false
    };
    
    this.alerts.unshift(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }
    
    this.emit('alert', alert);
  }

  getMetrics() {
    return this.metrics;
  }

  getAlerts() {
    return this.alerts;
  }

  getLogs() {
    return this.logs;
  }

  getSystemHealth() {
    const overallStatus = this.metrics.system.cpu < 80 && 
                         this.metrics.system.memory < 85 && 
                         this.metrics.performance.errorRate < 1 ? 'healthy' : 'warning';
    
    return {
      status: overallStatus,
      uptime: this.metrics.system.uptime,
      services: {
        database: {
          status: 'healthy',
          responseTime: Math.floor(Math.random() * 50) + 10,
          connections: this.metrics.performance.databaseConnections,
          maxConnections: 100
        },
        api: {
          status: 'healthy',
          responseTime: this.metrics.performance.responseTime,
          requestsPerMinute: this.metrics.performance.throughput,
          errorRate: this.metrics.performance.errorRate
        },
        redis: {
          status: 'healthy',
          memory: Math.floor(Math.random() * 100) + 50,
          connections: Math.floor(Math.random() * 20) + 5,
          hitRate: this.metrics.performance.cacheHitRate
        }
      }
    };
  }
}

module.exports = StandaloneMonitoringService;
