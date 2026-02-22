import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Alert, 
  Badge, 
  Tag, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Tabs, 
  List, 
  Avatar, 
  Timeline, 
  Switch,
  Select,
  Tooltip,
  Modal,
  Descriptions,
  Spin,
  notification,
  Drawer,
  Divider
} from 'antd';
import { 
  DatabaseOutlined, 
  CloudOutlined, 
  SecurityScanOutlined, 
  BellOutlined, 
  TrophyOutlined, 
  RiseOutlined, 
  TrendingDownOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  EyeOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  GlobalOutlined,
  CloudServerOutlined,
  ApiOutlined,
  HddOutlined,
  WifiOutlined,
  ShieldOutlined,
  LockOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  FireOutlined,
  BugOutlined,
  EyeInvisibleOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  MonitorOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
  DisconnectOutlined,
  WifiOutlined as WifiIcon,
  FileTextOutlined
} from '@ant-design/icons';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar
} from 'recharts';
import moment from 'moment';
import { get } from '../../../../../shared/utils/apiClient';
import { createLogger } from '../../../../../shared/utils/logger';
import { createSecureWebSocket, subscribeToChannels } from '../../../../../shared/utils/websocket';
import { getStatusColor, getStatusIcon, getSeverityColor, getLogLevelColor } from '../../../../../shared/utils/statusUtils';

const { Title, Text } = Typography;
const { Option } = Select;
const logger = createLogger('RealTimeSystemMonitoring');

const RealTimeSystemMonitoring = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [metrics, setMetrics] = useState({
    system: { cpu: 0, memory: 0, disk: 0, network: 0, uptime: 0, loadAverage: [0, 0, 0] },
    security: { failedLogins: 0, suspiciousActivity: 0, blockedIPs: 0, intrusionAttempts: 0, malwareScans: 0 },
    performance: { responseTime: 0, throughput: 0, errorRate: 0, activeConnections: 0, cacheHitRate: 0 },
    network: { bandwidth: 0, latency: 0, packetLoss: 0, dnsResolution: 0, sslHandshake: 0 }
  });
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [threats, setThreats] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [showThreatDetails, setShowThreatDetails] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState(null);
  
  // Refs for cleanup
  const wsConnectionRef = useRef(null);
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Secure WebSocket connection with authentication
  const connectWebSocket = useCallback(() => {
    try {
      // Close existing connection if any
      if (wsConnectionRef.current) {
        wsConnectionRef.current.close();
      }

      // Create secure WebSocket connection
      wsConnectionRef.current = createSecureWebSocket('/ws/monitoring', {
        onOpen: () => {
          logger.info('WebSocket connected to monitoring service');
          setConnected(true);
          
          // Subscribe to all monitoring channels
          subscribeToChannels(wsConnectionRef.current, [
            'system', 
            'security', 
            'performance', 
            'network', 
            'alerts', 
            'logs', 
            'threats'
          ]);
          
          notification.success({
            message: 'Real-time Monitoring Connected',
            description: 'Live system monitoring is now active',
            placement: 'topRight'
          });
        },
        onMessage: (data) => {
          handleWebSocketMessage(data);
        },
        onError: (error) => {
          logger.error('WebSocket error', error);
          setConnected(false);
          notification.error({
            message: 'Connection Error',
            description: 'Real-time monitoring connection failed. Using fallback mode.',
            placement: 'topRight'
          });
        },
        onClose: () => {
          logger.warn('WebSocket disconnected');
          setConnected(false);
          notification.warning({
            message: 'Connection Lost',
            description: 'Real-time monitoring disconnected. Using fallback polling.',
            placement: 'topRight'
          });
        },
        maxReconnectAttempts: 5,
        reconnectDelay: 1000
      });
      
    } catch (error) {
      logger.error('Failed to create WebSocket connection', error);
      setConnected(false);
      notification.error({
        message: 'Connection Failed',
        description: 'Unable to establish real-time monitoring connection',
        placement: 'topRight'
      });
    }
  }, []);

  // Handle WebSocket messages with validation
  const handleWebSocketMessage = useCallback((data) => {
    if (!data || typeof data !== 'object') {
      logger.warn('Invalid WebSocket message received', data);
      return;
    }

    try {
      switch (data.type) {
        case 'initialData':
          if (data.data) {
            setSystemHealth(data.data.systemHealth || null);
            setMetrics(data.data.metrics || {
              system: { cpu: 0, memory: 0, disk: 0, network: 0, uptime: 0, loadAverage: [0, 0, 0] },
              security: { failedLogins: 0, suspiciousActivity: 0, blockedIPs: 0, intrusionAttempts: 0, malwareScans: 0 },
              performance: { responseTime: 0, throughput: 0, errorRate: 0, activeConnections: 0, cacheHitRate: 0 },
              network: { bandwidth: 0, latency: 0, packetLoss: 0, dnsResolution: 0, sslHandshake: 0 }
            });
            setAlerts(Array.isArray(data.data.alerts) ? data.data.alerts : []);
            setLogs(Array.isArray(data.data.logs) ? data.data.logs : []);
            setThreats(Array.isArray(data.data.threats) ? data.data.threats : []);
          }
          break;
        case 'systemMetrics':
          if (data.data) {
            setMetrics(prev => ({ ...prev, system: data.data }));
            updateTimeSeriesData('system', data.data);
          }
          break;
        case 'securityMetrics':
          if (data.data) {
            setMetrics(prev => ({ ...prev, security: data.data }));
            updateTimeSeriesData('security', data.data);
          }
          break;
        case 'performanceMetrics':
          if (data.data) {
            setMetrics(prev => ({ ...prev, performance: data.data }));
            updateTimeSeriesData('performance', data.data);
          }
          break;
        case 'networkMetrics':
          if (data.data) {
            setMetrics(prev => ({ ...prev, network: data.data }));
            updateTimeSeriesData('network', data.data);
          }
          break;
        case 'alertGenerated':
          if (data.data) {
            setAlerts(prev => [data.data, ...prev.slice(0, 99)]); // Keep last 100 alerts
            showAlertNotification(data.data);
          }
          break;
        case 'threatDetected':
          if (data.data) {
            setThreats(prev => [data.data, ...prev.slice(0, 49)]); // Keep last 50 threats
            showThreatNotification(data.data);
          }
          break;
        case 'logsUpdated':
          if (Array.isArray(data.data)) {
            setLogs(prev => [...data.data, ...prev.slice(0, 950)]); // Keep last 1000 logs
          }
          break;
        case 'auth_response':
          // Authentication response handled by WebSocket utility
          if (!data.authenticated) {
            logger.error('WebSocket authentication failed');
            setConnected(false);
          }
          break;
        default:
          logger.debug('Unknown message type received', { type: data.type });
      }
    } catch (error) {
      logger.error('Error handling WebSocket message', error);
    }
  }, []);

  // Update time series data for charts
  const updateTimeSeriesData = useCallback((category, newData) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setTimeSeriesData(prev => {
      const updated = [...prev];
      const lastEntry = updated[updated.length - 1];
      
      if (lastEntry && lastEntry.timestamp === timestamp) {
        // Update existing entry
        lastEntry[category] = newData;
        return updated;
      } else {
        // Add new entry
        const newEntry = {
          timestamp,
          [category]: newData,
          ...(lastEntry ? {
            system: lastEntry.system || {},
            security: lastEntry.security || {},
            performance: lastEntry.performance || {},
            network: lastEntry.network || {}
          } : {})
        };
        newEntry[category] = newData;
        
        const result = [...updated, newEntry];
        return result.slice(-50); // Keep last 50 entries
      }
    });
  }, []);

  // Show alert notifications with validation
  const showAlertNotification = useCallback((alert) => {
    if (!alert || !alert.severity) {
      logger.warn('Invalid alert data received', alert);
      return;
    }

    const notificationType = alert.severity === 'critical' ? 'error' : 
                           alert.severity === 'high' ? 'error' : 
                           alert.severity === 'medium' ? 'warning' : 'info';
    
    notification[notificationType]({
      message: `${(alert.service || 'System').toUpperCase()} Alert`,
      description: alert.message || 'No message provided',
      duration: alert.severity === 'critical' ? 0 : 4.5,
      placement: 'topRight',
      icon: alert.severity === 'critical' ? <FireOutlined /> : 
            alert.severity === 'high' ? <WarningOutlined /> : 
            <InfoCircleOutlined />
    });
  }, []);

  // Show threat notifications with validation
  const showThreatNotification = useCallback((threat) => {
    if (!threat || !threat.type) {
      logger.warn('Invalid threat data received', threat);
      return;
    }

    notification.error({
      message: '🚨 Security Threat Detected',
      description: `${(threat.type || 'unknown').toUpperCase()}: ${threat.description || 'No description'}`,
      duration: 0, // Don't auto-close critical threats
      placement: 'topRight',
      icon: <ShieldOutlined />,
      onClick: () => {
        setSelectedThreat(threat);
        setShowThreatDetails(true);
      }
    });
  }, []);

  // Fetch initial data with proper error handling
  const fetchInitialData = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      
      const [healthResponse, metricsResponse, alertsResponse, logsResponse, threatsResponse] = await Promise.all([
        get('/api/supra-admin/system-health', {
          signal: abortControllerRef.current.signal
        }),
        get('/api/supra-admin/monitoring/metrics', {
          signal: abortControllerRef.current.signal
        }),
        get('/api/supra-admin/monitoring/alerts?limit=20', {
          signal: abortControllerRef.current.signal
        }),
        get('/api/supra-admin/monitoring/logs?limit=50', {
          signal: abortControllerRef.current.signal
        }),
        get('/api/supra-admin/monitoring/threats?limit=10', {
          signal: abortControllerRef.current.signal
        })
      ]);

      if (healthResponse.success && healthResponse.data) {
        setSystemHealth(healthResponse.data);
      }

      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data);
      }

      if (alertsResponse.success) {
        setAlerts(alertsResponse.alerts || alertsResponse.data || []);
      }

      if (logsResponse.success) {
        setLogs(logsResponse.logs || logsResponse.data || []);
      }

      if (threatsResponse.success) {
        setThreats(threatsResponse.threats || threatsResponse.data || []);
      }

      logger.info('Initial monitoring data fetched successfully');

    } catch (error) {
      // Don't set error if request was aborted
      if (error.name === 'AbortError') {
        return;
      }
      
      const errorMessage = error.message || 'Failed to fetch system monitoring information. Please try again.';
      logger.error('Error fetching initial monitoring data', error);
      notification.error({
        message: 'Failed to Load Monitoring Data',
        description: errorMessage,
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  // Auto refresh fallback
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (autoRefresh && !connected) {
      intervalRef.current = setInterval(() => {
        fetchInitialData();
      }, refreshInterval * 1000);
    }
  }, [autoRefresh, refreshInterval, connected, fetchInitialData]);

  // Effects
  useEffect(() => {
    fetchInitialData();
    connectWebSocket();
    startAutoRefresh();

    return () => {
      // Cleanup WebSocket connection
      if (wsConnectionRef.current) {
        wsConnectionRef.current.close();
        wsConnectionRef.current = null;
      }
      // Cleanup interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Cleanup abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [fetchInitialData, connectWebSocket, startAutoRefresh]);

  // Use shared utility functions instead of local ones

  const getThreatTypeIcon = (type) => {
    switch (type) {
      case 'brute_force': return <LockOutlined />;
      case 'suspicious_activity': return <EyeInvisibleOutlined />;
      case 'resource_exhaustion': return <ThunderboltOutlined />;
      case 'service_degradation': return <BugOutlined />;
      default: return <WarningOutlined />;
    }
  };

  // Chart data preparation with memoization
  const chartData = useMemo(() => {
    return timeSeriesData.map(entry => ({
      time: entry.timestamp,
      cpu: entry.system?.cpu || 0,
      memory: entry.system?.memory || 0,
      disk: entry.system?.disk || 0,
      responseTime: entry.performance?.responseTime || 0,
      errorRate: entry.performance?.errorRate || 0,
      failedLogins: entry.security?.failedLogins || 0,
      latency: entry.network?.latency || 0
    }));
  }, [timeSeriesData]);

  // Security risk assessment with null safety
  const securityRisk = useMemo(() => {
    let riskScore = 0;
    const security = metrics.security || {};
    
    if ((security.failedLogins || 0) > 10) riskScore += 30;
    if ((security.suspiciousActivity || 0) > 5) riskScore += 25;
    if ((security.intrusionAttempts || 0) > 0) riskScore += 40;
    if ((security.blockedIPs || 0) > 20) riskScore += 20;
    
    if (riskScore >= 70) return { level: 'high', color: '#ff4d4f', score: riskScore };
    if (riskScore >= 40) return { level: 'medium', color: '#faad14', score: riskScore };
    return { level: 'low', color: '#52c41a', score: riskScore };
  }, [metrics.security]);

  // Performance score calculation with null safety
  const performanceScore = useMemo(() => {
    let score = 100;
    const perf = metrics.performance || {};
    
    if ((perf.responseTime || 0) > 500) score -= 20;
    if ((perf.errorRate || 0) > 5) score -= 30;
    if ((perf.cacheHitRate || 0) < 80) score -= 15;
    
    return Math.max(0, score);
  }, [metrics.performance]);

  // Table columns
  const alertColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'error' ? 'red' : type === 'warning' ? 'orange' : 'blue'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
      render: (service) => (
        <Tag icon={<CloudServerOutlined />}>{service}</Tag>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => moment(timestamp).fromNow(),
    },
  ];

  const threatColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Space>
          {getThreatTypeIcon(type)}
          <Text strong>{type.replace('_', ' ').toUpperCase()}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => moment(timestamp).fromNow(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedThreat(record);
            setShowThreatDetails(true);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  const logColumns = [
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color={
          level === 'error' ? 'red' :
          level === 'warning' ? 'orange' :
          level === 'info' ? 'blue' : 'gray'
        }>
          {level.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => moment(timestamp).format('HH:mm:ss'),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Loading real-time monitoring data...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <MonitorOutlined /> Real-Time System Monitoring
          </Title>
          <Text type="secondary">
            Live system health, security, and performance monitoring
            <Badge 
              status={connected ? "processing" : "error"} 
              text={connected ? "Live" : "Disconnected"} 
              style={{ marginLeft: '8px' }}
            />
          </Text>
        </div>
        <Space>
          <Tooltip title="Connection Status">
            <Badge 
              status={connected ? "success" : "error"} 
              text={connected ? "Connected" : "Disconnected"}
            />
          </Tooltip>
          <Text type="secondary">Auto Refresh:</Text>
          <Switch 
            checked={autoRefresh} 
            onChange={setAutoRefresh}
            checkedChildren="ON"
            unCheckedChildren="OFF"
            disabled={connected}
          />
          <Select
            value={refreshInterval}
            onChange={setRefreshInterval}
            style={{ width: 100 }}
            disabled={connected || !autoRefresh}
          >
            <Option value={5}>5s</Option>
            <Option value={10}>10s</Option>
            <Option value={30}>30s</Option>
            <Option value={60}>1m</Option>
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchInitialData}
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => setShowSettings(true)}
          >
            Settings
          </Button>
        </Space>
      </div>

      {/* Connection Alert */}
      {!connected && (
        <Alert
          message="Real-time Connection Disabled"
          description="Using fallback polling mode. Some features may be limited."
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
          action={
                  <Button 
                    size="small" 
                    onClick={connectWebSocket}
                    disabled={connected}
                  >
                    Reconnect
                  </Button>
          }
        />
      )}

      {/* Main Content */}
      <Tabs 
        activeKey={selectedTab} 
        onChange={setSelectedTab}
        items={[
          {
            key: 'overview',
            label: <span><DashboardOutlined />Overview</span>,
            children: (
              <>
                {/* System Status Overview */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="System Status"
                        value={systemHealth?.status || 'Unknown'}
                        prefix={getStatusIcon(systemHealth?.status)}
                        valueStyle={{ color: getStatusColor(systemHealth?.status) }}
                      />
                      <div style={{ marginTop: '8px' }}>
                        <Text type="secondary">Uptime: {systemHealth?.uptime || 0} hours</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Security Risk"
                        value={securityRisk.level}
                        prefix={<ShieldOutlined />}
                        valueStyle={{ color: securityRisk.color }}
                      />
                      <div style={{ marginTop: '8px' }}>
                        <Text type="secondary">Score: {securityRisk.score}/100</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Performance Score"
                        value={performanceScore}
                        suffix="/100"
                        prefix={<TrophyOutlined />}
                        valueStyle={{ color: performanceScore > 80 ? '#52c41a' : performanceScore > 60 ? '#faad14' : '#ff4d4f' }}
                      />
                      <div style={{ marginTop: '8px' }}>
                        <Text type="secondary">Response: {metrics.performance?.responseTime || 0}ms</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Active Threats"
                        value={threats.length}
                        prefix={<WarningOutlined />}
                        valueStyle={{ color: threats.length > 0 ? '#ff4d4f' : '#52c41a' }}
                      />
                      <div style={{ marginTop: '8px' }}>
                        <Text type="secondary">Last 24h</Text>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* Real-time Metrics */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                  <Col xs={24} sm={6}>
                    <Card title="CPU Usage" extra={<CloudServerOutlined />}>
                      <Progress
                        type="circle"
                        percent={metrics.system.cpu}
                        format={percent => `${percent}%`}
                        strokeColor={metrics.system.cpu > 80 ? '#ff4d4f' : metrics.system.cpu > 60 ? '#faad14' : '#52c41a'}
                      />
                      <div style={{ marginTop: '8px', textAlign: 'center' }}>
                        <Text type="secondary">Load: {metrics.system.loadAverage[0].toFixed(2)}</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card title="Memory Usage" extra={<DatabaseOutlined />}>
                      <Progress
                        type="circle"
                        percent={metrics.system.memory}
                        format={percent => `${percent}%`}
                        strokeColor={metrics.system.memory > 80 ? '#ff4d4f' : metrics.system.memory > 60 ? '#faad14' : '#52c41a'}
                      />
                      <div style={{ marginTop: '8px', textAlign: 'center' }}>
                        <Text type="secondary">Available: {100 - metrics.system.memory}%</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card title="Network I/O" extra={<WifiIcon />}>
                      <Progress
                        type="circle"
                        percent={metrics.network.bandwidth}
                        format={percent => `${percent}%`}
                        strokeColor={metrics.network.bandwidth > 80 ? '#ff4d4f' : metrics.network.bandwidth > 60 ? '#faad14' : '#52c41a'}
                      />
                      <div style={{ marginTop: '8px', textAlign: 'center' }}>
                        <Text type="secondary">Latency: {metrics.network.latency}ms</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card title="Error Rate" extra={<ExclamationCircleOutlined />}>
                      <Progress
                        type="circle"
                        percent={metrics.performance.errorRate}
                        format={percent => `${percent.toFixed(1)}%`}
                        strokeColor={metrics.performance.errorRate > 5 ? '#ff4d4f' : metrics.performance.errorRate > 2 ? '#faad14' : '#52c41a'}
                      />
                      <div style={{ marginTop: '8px', textAlign: 'center' }}>
                        <Text type="secondary">Success: {(100 - metrics.performance.errorRate).toFixed(1)}%</Text>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* Real-time Charts */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                  <Col xs={24} lg={12}>
                    <Card title="System Resources (Live)" extra={<LineChartOutlined />}>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="cpu" stackId="1" stroke="#ff4d4f" fill="#ff4d4f" fillOpacity={0.3} />
                          <Area type="monotone" dataKey="memory" stackId="1" stroke="#faad14" fill="#faad14" fillOpacity={0.3} />
                          <Area type="monotone" dataKey="disk" stackId="1" stroke="#52c41a" fill="#52c41a" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Performance Metrics (Live)" extra={<BarChartOutlined />}>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="responseTime" stroke="#1890ff" strokeWidth={2} />
                          <Line type="monotone" dataKey="errorRate" stroke="#ff4d4f" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>
              </>
            )
          },
          {
            key: 'security',
            label: <span><SecurityScanOutlined />Security</span>,
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="Security Metrics" extra={<ShieldOutlined />}>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic
                          title="Failed Logins"
                          value={metrics.security?.failedLogins || 0}
                          prefix={<LockOutlined />}
                          valueStyle={{ color: metrics.security.failedLogins > 10 ? '#ff4d4f' : '#52c41a' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Suspicious Activity"
                          value={metrics.security?.suspiciousActivity || 0}
                          prefix={<EyeInvisibleOutlined />}
                          valueStyle={{ color: metrics.security.suspiciousActivity > 5 ? '#ff4d4f' : '#52c41a' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Blocked IPs"
                          value={metrics.security?.blockedIPs || 0}
                          prefix={<GlobalOutlined />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Intrusion Attempts"
                          value={metrics.security?.intrusionAttempts || 0}
                          prefix={<WarningOutlined />}
                          valueStyle={{ color: metrics.security.intrusionAttempts > 0 ? '#ff4d4f' : '#52c41a' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="Security Threats" extra={<Badge count={threats.length} size="small"><WarningOutlined /></Badge>}>
                    <Table
                      columns={threatColumns}
                      dataSource={threats}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      scroll={{ y: 300 }}
                    />
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'performance',
            label: <span><ThunderboltOutlined />Performance</span>,
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="Performance Metrics" extra={<BarChartOutlined />}>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic
                          title="Response Time"
                          value={metrics.performance?.responseTime || 0}
                          suffix="ms"
                          prefix={<ClockCircleOutlined />}
                          valueStyle={{ color: metrics.performance.responseTime > 500 ? '#ff4d4f' : metrics.performance.responseTime > 200 ? '#faad14' : '#52c41a' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Throughput"
                          value={metrics.performance?.throughput || 0}
                          suffix="req/min"
                          prefix={<ApiOutlined />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Active Connections"
                          value={metrics.performance?.activeConnections || 0}
                          prefix={<TeamOutlined />}
                          valueStyle={{ color: '#722ed1' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Cache Hit Rate"
                          value={metrics.performance?.cacheHitRate || 0}
                          suffix="%"
                          prefix={<DatabaseOutlined />}
                          valueStyle={{ color: metrics.performance.cacheHitRate > 80 ? '#52c41a' : '#faad14' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="Performance Trends" extra={<LineChartOutlined />}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="responseTime" stroke="#1890ff" strokeWidth={2} name="Response Time (ms)" />
                        <Line type="monotone" dataKey="errorRate" stroke="#ff4d4f" strokeWidth={2} name="Error Rate (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'alerts',
            label: <span><BellOutlined />Alerts</span>,
            children: (
              <Card title="System Alerts" extra={<Badge count={alerts.length} size="small"><BellOutlined /></Badge>}>
                <Table
                  columns={alertColumns}
                  dataSource={alerts}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              </Card>
            )
          },
          {
            key: 'logs',
            label: <span><FileTextOutlined />Logs</span>,
            children: (
              <Card title="System Logs">
                <Table
                  columns={logColumns}
                  dataSource={logs}
                  rowKey="id"
                  pagination={{ pageSize: 20 }}
                  size="small"
                />
              </Card>
            )
          }
        ]}
      />

      {/* Threat Details Drawer */}
      <Drawer
        title="Threat Details"
        placement="right"
        width={600}
        onClose={() => setShowThreatDetails(false)}
        open={showThreatDetails}
      >
        {selectedThreat && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Type">
                <Space>
                  {getThreatTypeIcon(selectedThreat.type)}
                  <Text strong>{selectedThreat.type.replace('_', ' ').toUpperCase()}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Severity">
                <Tag color={getSeverityColor(selectedThreat.severity)}>
                  {selectedThreat.severity.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedThreat.description}
              </Descriptions.Item>
              <Descriptions.Item label="Source">
                {selectedThreat.source}
              </Descriptions.Item>
              <Descriptions.Item label="Timestamp">
                {moment(selectedThreat.timestamp).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Recommendation">
                {selectedThreat.recommendation}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <div>
              <Title level={4}>Recommended Actions</Title>
              <List
                dataSource={[
                  'Review system logs for related events',
                  'Check firewall rules and access controls',
                  'Verify user authentication mechanisms',
                  'Update security policies if necessary',
                  'Monitor for similar patterns'
                ]}
                renderItem={item => (
                  <List.Item>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    {item}
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* Settings Modal */}
      <Modal
        title="Monitoring Settings"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        footer={null}
      >
        <div>
          <Title level={4}>Alert Thresholds</Title>
          <p>Configure alert thresholds for different metrics...</p>
          {/* Add threshold configuration UI here */}
        </div>
      </Modal>
    </div>
  );
};

export default RealTimeSystemMonitoring;
