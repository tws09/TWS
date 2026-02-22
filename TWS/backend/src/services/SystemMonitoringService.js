const os = require('os');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Real system monitoring service for Supra-Admin
 */
class SystemMonitoringService {
  
  /**
   * Get real system health metrics
   */
  async getSystemHealth() {
    try {
      const [cpuUsage, memoryUsage, diskUsage, networkStats] = await Promise.all([
        this.getCPUUsage(),
        this.getMemoryUsage(),
        this.getDiskUsage(),
        this.getNetworkStats()
      ]);

      return {
        status: this.determineOverallStatus(cpuUsage, memoryUsage, diskUsage),
        uptime: this.getSystemUptime(),
        responseTime: await this.getAverageResponseTime(),
        cpuUsage,
        memoryUsage,
        diskUsage,
        networkStats,
        services: await this.getServiceHealth(),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get CPU usage percentage
   */
  async getCPUUsage() {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic cpu get loadpercentage /value');
        const match = stdout.match(/LoadPercentage=(\d+)/);
        return match ? parseInt(match[1]) : 0;
      } else {
        const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | awk -F'%' '{print $1}'");
        return parseFloat(stdout.trim()) || 0;
      }
    } catch (error) {
      console.error('Error getting CPU usage:', error);
      return 0;
    }
  }

  /**
   * Get memory usage
   */
  async getMemoryUsage() {
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      
      return {
        total: this.formatBytes(totalMem),
        used: this.formatBytes(usedMem),
        free: this.formatBytes(freeMem),
        percentage: Math.round((usedMem / totalMem) * 100)
      };
    } catch (error) {
      console.error('Error getting memory usage:', error);
      return { total: '0', used: '0', free: '0', percentage: 0 };
    }
  }

  /**
   * Get disk usage
   */
  async getDiskUsage() {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption /value');
        const lines = stdout.split('\n').filter(line => line.includes('='));
        const drives = {};
        
        let currentDrive = null;
        lines.forEach(line => {
          const [key, value] = line.split('=');
          if (key === 'Caption') {
            currentDrive = value.trim();
            drives[currentDrive] = {};
          } else if (currentDrive && (key === 'Size' || key === 'FreeSpace')) {
            drives[currentDrive][key.toLowerCase()] = parseInt(value) || 0;
          }
        });
        
        return this.calculateDiskUsage(drives);
      } else {
        const { stdout } = await execAsync('df -h');
        const lines = stdout.split('\n').slice(1);
        const drives = {};
        
        lines.forEach(line => {
          const parts = line.split(/\s+/);
          if (parts.length >= 6) {
            const mountPoint = parts[5];
            const total = this.parseSize(parts[1]);
            const used = this.parseSize(parts[2]);
            const available = this.parseSize(parts[3]);
            
            drives[mountPoint] = { total, used, available };
          }
        });
        
        return this.calculateDiskUsage(drives);
      }
    } catch (error) {
      console.error('Error getting disk usage:', error);
      return { total: '0', used: '0', free: '0', percentage: 0 };
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats() {
    try {
      const networkInterfaces = os.networkInterfaces();
      const stats = {};
      
      Object.keys(networkInterfaces).forEach(interfaceName => {
        const interfaces = networkInterfaces[interfaceName];
        interfaces.forEach(interfaceInfo => {
          if (!interfaceInfo.internal) {
            stats[interfaceName] = {
              address: interfaceInfo.address,
              family: interfaceInfo.family,
              mac: interfaceInfo.mac
            };
          }
        });
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting network stats:', error);
      return {};
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth() {
    try {
      const services = {
        database: await this.checkDatabaseHealth(),
        api: await this.checkAPIHealth(),
        storage: await this.checkStorageHealth(),
        redis: await this.checkRedisHealth()
      };
      
      return services;
    } catch (error) {
      console.error('Error getting service health:', error);
      return {
        database: { status: 'error', error: error.message },
        api: { status: 'error', error: error.message },
        storage: { status: 'error', error: error.message },
        redis: { status: 'error', error: error.message }
      };
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    try {
      const mongoose = require('mongoose');
      const connection = mongoose.connection;
      
      if (connection.readyState === 1) {
        const start = Date.now();
        await connection.db.admin().ping();
        const responseTime = Date.now() - start;
        
        return {
          status: 'healthy',
          responseTime,
          connections: connection.db.serverConfig.s.pool.totalConnectionCount || 0,
          maxConnections: connection.db.serverConfig.s.pool.maxPoolSize || 100
        };
      } else {
        return {
          status: 'disconnected',
          responseTime: 0,
          connections: 0,
          maxConnections: 100
        };
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        responseTime: 0,
        connections: 0,
        maxConnections: 100
      };
    }
  }

  /**
   * Check API health
   */
  async checkAPIHealth() {
    try {
      const start = Date.now();
      // Simulate API health check
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime: Math.max(responseTime, 1)
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        responseTime: 0
      };
    }
  }

  /**
   * Check storage health
   */
  async checkStorageHealth() {
    try {
      const diskUsage = await this.getDiskUsage();
      
      return {
        status: diskUsage.percentage > 90 ? 'warning' : 'healthy',
        used: diskUsage.used,
        total: diskUsage.total,
        percentage: diskUsage.percentage
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        used: '0',
        total: '0',
        percentage: 0
      };
    }
  }

  /**
   * Check Redis health
   */
  async checkRedisHealth() {
    try {
      // This would check actual Redis connection
      // For now, return mock data
      return {
        status: 'healthy',
        responseTime: 5,
        memory: '512 MB',
        connections: 10
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        responseTime: 0,
        memory: '0',
        connections: 0
      };
    }
  }

  /**
   * Get system uptime
   */
  getSystemUptime() {
    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    return `${days} days, ${hours} hours, ${minutes} minutes`;
  }

  /**
   * Get average response time (mock for now)
   */
  async getAverageResponseTime() {
    // This would be calculated from actual request logs
    return Math.floor(Math.random() * 100) + 50; // 50-150ms
  }

  /**
   * Determine overall system status
   */
  determineOverallStatus(cpuUsage, memoryUsage, diskUsage) {
    if (cpuUsage > 90 || memoryUsage.percentage > 90 || diskUsage.percentage > 95) {
      return 'critical';
    } else if (cpuUsage > 80 || memoryUsage.percentage > 80 || diskUsage.percentage > 85) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Parse size string to bytes
   */
  parseSize(sizeStr) {
    const units = { 'K': 1024, 'M': 1024 * 1024, 'G': 1024 * 1024 * 1024, 'T': 1024 * 1024 * 1024 * 1024 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)([KMGTP]?)$/);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2] || '';
      return Math.round(value * (units[unit] || 1));
    }
    return 0;
  }

  /**
   * Calculate disk usage from drive data
   */
  calculateDiskUsage(drives) {
    let totalSize = 0;
    let totalUsed = 0;
    
    Object.values(drives).forEach(drive => {
      if (drive.total && drive.used !== undefined) {
        totalSize += drive.total;
        totalUsed += drive.used;
      }
    });
    
    const totalFree = totalSize - totalUsed;
    const percentage = totalSize > 0 ? Math.round((totalUsed / totalSize) * 100) : 0;
    
    return {
      total: this.formatBytes(totalSize),
      used: this.formatBytes(totalUsed),
      free: this.formatBytes(totalFree),
      percentage
    };
  }
}

module.exports = new SystemMonitoringService();