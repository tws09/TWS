const WebSocket = require('ws');
const SystemMonitoringService = require('./SystemMonitoringService');

class MonitoringWebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws/monitoring',
      verifyClient: this.verifyClient.bind(this)
    });
    
    this.monitoringService = new SystemMonitoringService();
    this.clients = new Map();
    this.setupEventListeners();
    this.setupWebSocketHandlers();
  }

  verifyClient(info) {
    // In a real implementation, you would verify JWT tokens here
    // For now, we'll allow all connections
    return true;
  }

  setupEventListeners() {
    // Listen to monitoring service events and broadcast to clients
    this.monitoringService.on('systemMetrics', (metrics) => {
      this.broadcastToClients('systemMetrics', metrics);
    });

    this.monitoringService.on('securityMetrics', (metrics) => {
      this.broadcastToClients('securityMetrics', metrics);
    });

    this.monitoringService.on('performanceMetrics', (metrics) => {
      this.broadcastToClients('performanceMetrics', metrics);
    });

    this.monitoringService.on('networkMetrics', (metrics) => {
      this.broadcastToClients('networkMetrics', metrics);
    });

    this.monitoringService.on('alertGenerated', (alert) => {
      this.broadcastToClients('alertGenerated', alert);
    });

    this.monitoringService.on('threatDetected', (threat) => {
      this.broadcastToClients('threatDetected', threat);
    });

    this.monitoringService.on('logsUpdated', (logs) => {
      this.broadcastToClients('logsUpdated', logs);
    });
  }

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      const clientInfo = {
        id: clientId,
        ws: ws,
        ip: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        connectedAt: new Date(),
        subscriptions: new Set()
      };

      this.clients.set(clientId, clientInfo);
      
      console.log(`[MonitoringWebSocket] Client connected: ${clientId} from ${clientInfo.ip}`);
      
      // Send initial data
      this.sendInitialData(ws);
      
      // Handle client messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(clientId, data);
        } catch (error) {
          console.error('[MonitoringWebSocket] Invalid message format:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log(`[MonitoringWebSocket] Client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`[MonitoringWebSocket] Client error for ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      // Send ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);

      ws.on('pong', () => {
        // Connection is alive
      });
    });
  }

  handleClientMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (data.type) {
      case 'subscribe':
        this.handleSubscription(client, data.channels);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(client, data.channels);
        break;
      case 'getMetrics':
        this.sendMetrics(client.ws);
        break;
      case 'getAlerts':
        this.sendAlerts(client.ws, data.limit);
        break;
      case 'getLogs':
        this.sendLogs(client.ws, data.limit);
        break;
      case 'getThreats':
        this.sendThreats(client.ws, data.limit);
        break;
      case 'updateThresholds':
        this.handleThresholdUpdate(client, data.thresholds);
        break;
      default:
        this.sendError(client.ws, 'Unknown message type');
    }
  }

  handleSubscription(client, channels) {
    if (!Array.isArray(channels)) {
      this.sendError(client.ws, 'Channels must be an array');
      return;
    }

    const validChannels = ['system', 'security', 'performance', 'network', 'alerts', 'logs', 'threats'];
    
    channels.forEach(channel => {
      if (validChannels.includes(channel)) {
        client.subscriptions.add(channel);
      }
    });

    this.sendSuccess(client.ws, 'Subscribed to channels', { channels: Array.from(client.subscriptions) });
  }

  handleUnsubscription(client, channels) {
    if (!Array.isArray(channels)) {
      this.sendError(client.ws, 'Channels must be an array');
      return;
    }

    channels.forEach(channel => {
      client.subscriptions.delete(channel);
    });

    this.sendSuccess(client.ws, 'Unsubscribed from channels', { channels: Array.from(client.subscriptions) });
  }

  handleThresholdUpdate(client, thresholds) {
    try {
      this.monitoringService.updateAlertThresholds(thresholds);
      this.sendSuccess(client.ws, 'Alert thresholds updated', { thresholds });
    } catch (error) {
      this.sendError(client.ws, 'Failed to update thresholds');
    }
  }

  sendInitialData(ws) {
    const initialData = {
      type: 'initialData',
      data: {
        metrics: this.monitoringService.getAllMetrics(),
        alerts: this.monitoringService.getAlerts(20),
        logs: this.monitoringService.getLogs(50),
        threats: this.monitoringService.getThreats(10),
        systemHealth: this.monitoringService.getSystemHealth(),
        timestamp: new Date()
      }
    };
    
    this.sendMessage(ws, initialData);
  }

  sendMetrics(ws) {
    const metrics = {
      type: 'metrics',
      data: {
        metrics: this.monitoringService.getAllMetrics(),
        timestamp: new Date()
      }
    };
    
    this.sendMessage(ws, metrics);
  }

  sendAlerts(ws, limit = 50) {
    const alerts = {
      type: 'alerts',
      data: {
        alerts: this.monitoringService.getAlerts(limit),
        timestamp: new Date()
      }
    };
    
    this.sendMessage(ws, alerts);
  }

  sendLogs(ws, limit = 100) {
    const logs = {
      type: 'logs',
      data: {
        logs: this.monitoringService.getLogs(limit),
        timestamp: new Date()
      }
    };
    
    this.sendMessage(ws, logs);
  }

  sendThreats(ws, limit = 20) {
    const threats = {
      type: 'threats',
      data: {
        threats: this.monitoringService.getThreats(limit),
        timestamp: new Date()
      }
    };
    
    this.sendMessage(ws, threats);
  }

  broadcastToClients(eventType, data) {
    const message = {
      type: eventType,
      data: data,
      timestamp: new Date()
    };

    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        // Check if client is subscribed to this event type
        if (this.isClientSubscribed(client, eventType)) {
          this.sendMessage(client.ws, message);
        }
      } else {
        // Remove disconnected clients
        this.clients.delete(clientId);
      }
    });
  }

  isClientSubscribed(client, eventType) {
    // Map event types to subscription channels
    const eventToChannel = {
      'systemMetrics': 'system',
      'securityMetrics': 'security',
      'performanceMetrics': 'performance',
      'networkMetrics': 'network',
      'alertGenerated': 'alerts',
      'threatDetected': 'threats',
      'logsUpdated': 'logs'
    };

    const channel = eventToChannel[eventType];
    return !channel || client.subscriptions.has(channel) || client.subscriptions.size === 0;
  }

  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('[MonitoringWebSocket] Failed to send message:', error);
      }
    }
  }

  sendError(ws, message) {
    this.sendMessage(ws, {
      type: 'error',
      message: message,
      timestamp: new Date()
    });
  }

  sendSuccess(ws, message, data = {}) {
    this.sendMessage(ws, {
      type: 'success',
      message: message,
      data: data,
      timestamp: new Date()
    });
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  getConnectedClients() {
    return Array.from(this.clients.values()).map(client => ({
      id: client.id,
      ip: client.ip,
      userAgent: client.userAgent,
      connectedAt: client.connectedAt,
      subscriptions: Array.from(client.subscriptions)
    }));
  }

  broadcastSystemMessage(message) {
    const systemMessage = {
      type: 'systemMessage',
      data: {
        message: message,
        timestamp: new Date()
      }
    };

    this.broadcastToClients('systemMessage', systemMessage.data);
  }

  // Method to get monitoring statistics
  getMonitoringStats() {
    return {
      connectedClients: this.clients.size,
      monitoringService: {
        isMonitoring: this.monitoringService.isMonitoring,
        metrics: Object.keys(this.monitoringService.metrics),
        alertCount: this.monitoringService.alerts.length,
        logCount: this.monitoringService.logs.length,
        threatCount: this.monitoringService.threats.length
      }
    };
  }
}

module.exports = MonitoringWebSocketService;
