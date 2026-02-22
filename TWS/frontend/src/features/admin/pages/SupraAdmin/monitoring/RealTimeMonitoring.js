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
  Button, 
  Space, 
  Typography, 
  Tabs, 
  List, 
  Switch,
  Select,
  notification,
  Spin
} from 'antd';
import { 
  SecurityScanOutlined, 
  BellOutlined, 
  ReloadOutlined,
  MonitorOutlined,
  LockOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  EyeInvisibleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  CloudServerOutlined,
  ApiOutlined,
  WifiOutlined,
  DisconnectOutlined
} from '@ant-design/icons';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area
} from 'recharts';
import moment from 'moment';
import { get } from '../../../../../shared/utils/apiClient';
import { createLogger } from '../../../../../shared/utils/logger';
import { getStatusColor, getStatusIcon, getPercentageColor, getSeverityColor, getLogLevelColor } from '../../../../../shared/utils/statusUtils';

const { Title, Text } = Typography;
const { Option } = Select;
const logger = createLogger('RealTimeMonitoring');

const MAX_TIME_SERIES_ENTRIES = 50;
const DEFAULT_REFRESH_INTERVAL = 5;

const RealTimeMonitoring = () => {
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
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Fetch initial data with proper error handling
  const fetchInitialData = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      
      // Fetch real data from API
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
        
        // Initialize time series data from metrics
        if (metricsResponse.data.timeline) {
          setTimeSeriesData(metricsResponse.data.timeline.slice(-MAX_TIME_SERIES_ENTRIES));
        }
      }

      if (alertsResponse.success && alertsResponse.data) {
        setAlerts(alertsResponse.data.alerts || []);
      }

      if (logsResponse.success && logsResponse.data) {
        setLogs(logsResponse.data.logs || []);
      }

      if (threatsResponse.success && threatsResponse.data) {
        setThreats(threatsResponse.data.threats || []);
      }

      logger.info('Initial monitoring data fetched successfully');
      
    } catch (error) {
      // Don't set error if request was aborted
      if (error.name === 'AbortError') {
        return;
      }
      
      const errorMessage = error.message || 'Failed to load monitoring data. Please try again.';
      logger.error('Failed to fetch initial monitoring data', error);
      notification.error({
        message: 'Data Loading Failed',
        description: errorMessage,
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  // Initialize component
  useEffect(() => {
    fetchInitialData();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchInitialData]);

  // Update metrics from API
  const updateMetrics = useCallback(async () => {
    try {
      const metricsResponse = await get('/api/supra-admin/monitoring/metrics');
      
      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data);
        
        // Update time series data
        if (metricsResponse.data.timeline) {
          setTimeSeriesData(prev => {
            const newData = [...prev, ...metricsResponse.data.timeline];
            return newData.slice(-MAX_TIME_SERIES_ENTRIES);
          });
        } else {
          // Create entry from current metrics
          const now = new Date();
          const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          setTimeSeriesData(prev => {
            const newEntry = {
              timestamp,
              cpu: metricsResponse.data.system?.cpu || 0,
              memory: metricsResponse.data.system?.memory || 0,
              network: metricsResponse.data.system?.network || 0,
              responseTime: metricsResponse.data.performance?.responseTime || 0
            };
            const newData = [...prev, newEntry];
            return newData.slice(-MAX_TIME_SERIES_ENTRIES);
          });
        }
      }
    } catch (error) {
      logger.error('Failed to update metrics', error);
      // Don't show notification for background updates
    }
  }, []);

  // Start auto refresh with proper cleanup
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      updateMetrics();
    }, refreshInterval * 1000);
  }, [refreshInterval, updateMetrics]);

  // Handle auto refresh toggle
  useEffect(() => {
    if (autoRefresh) {
      startAutoRefresh();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, startAutoRefresh]);

  // Render system overview
  const renderSystemOverview = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="CPU Usage"
            value={metrics.system?.cpu || 0}
            precision={1}
            suffix="%"
            valueStyle={{ color: getPercentageColor(metrics.system?.cpu || 0) }}
          />
          <Progress 
            percent={metrics.system?.cpu || 0} 
            strokeColor={getPercentageColor(metrics.system?.cpu || 0)}
            showInfo={false}
            size="small"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Memory Usage"
            value={metrics.system?.memory || 0}
            precision={1}
            suffix="%"
            valueStyle={{ color: getPercentageColor(metrics.system?.memory || 0) }}
          />
          <Progress 
            percent={metrics.system?.memory || 0} 
            strokeColor={getPercentageColor(metrics.system?.memory || 0)}
            showInfo={false}
            size="small"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Disk Usage"
            value={metrics.system?.disk || 0}
            precision={1}
            suffix="%"
            valueStyle={{ color: getPercentageColor(metrics.system?.disk || 0) }}
          />
          <Progress 
            percent={metrics.system?.disk || 0} 
            strokeColor={getPercentageColor(metrics.system?.disk || 0)}
            showInfo={false}
            size="small"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Network Usage"
            value={metrics.system?.network || 0}
            precision={1}
            suffix="%"
            valueStyle={{ color: getPercentageColor(metrics.system?.network || 0) }}
          />
          <Progress 
            percent={metrics.system?.network || 0} 
            strokeColor={getPercentageColor(metrics.system?.network || 0)}
            showInfo={false}
            size="small"
          />
        </Card>
      </Col>
    </Row>
  );

  // Render performance metrics
  const renderPerformanceMetrics = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
          <Card title="System Performance" extra={<MonitorOutlined />}>
            {timeSeriesData && timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                  <Line type="monotone" dataKey="network" stroke="#ffc658" name="Network %" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Text type="secondary">No time series data available</Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Response Time" extra={<ThunderboltOutlined />}>
            {timeSeriesData && timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="responseTime" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} name="Response Time (ms)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Text type="secondary">No time series data available</Text>
              </div>
            )}
          </Card>
      </Col>
    </Row>
  );

  // Render alerts
  const renderAlerts = () => (
    <Card title="System Alerts" extra={<BellOutlined />}>
      <List
        dataSource={alerts}
        renderItem={alert => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Badge 
                  status={alert.severity === 'critical' ? 'error' : 
                          alert.severity === 'high' ? 'error' :
                          alert.severity === 'medium' ? 'warning' : 'processing'}
                />
              }
              title={
                <Space>
                  <Text strong>{alert.service?.toUpperCase() || 'UNKNOWN'}</Text>
                  <Tag color={getSeverityColor(alert.severity)}>
                    {alert.severity?.toUpperCase() || 'UNKNOWN'}
                  </Tag>
                  {alert.resolved && <Tag color="green">Resolved</Tag>}
                </Space>
              }
              description={
                <div>
                  <Text>{alert.message || 'No message'}</Text>
                  <br />
                  <Text type="secondary">{alert.timestamp ? moment(alert.timestamp).fromNow() : 'Unknown time'}</Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <MonitorOutlined style={{ marginRight: '8px' }} />
            Real-Time System Monitoring
          </Title>
          <Text type="secondary">Live system performance and security monitoring</Text>
        </div>
        <Space>
          <Badge 
            status="processing" 
            text="Polling Mode" 
          />
          <Switch
            checked={autoRefresh}
            onChange={setAutoRefresh}
            checkedChildren="Auto"
            unCheckedChildren="Manual"
          />
          <Select
            value={refreshInterval}
            onChange={setRefreshInterval}
            style={{ width: 100 }}
            disabled={!autoRefresh}
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
            disabled={loading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* System Status Alert */}
      {systemHealth && (
        <Alert
          message={`System Status: ${(systemHealth.status || 'unknown').toUpperCase()}`}
          description={`Uptime: ${systemHealth.uptime || 'N/A'} | Last Check: ${systemHealth.lastCheck ? moment(systemHealth.lastCheck).fromNow() : 'N/A'}`}
          type={systemHealth.status === 'healthy' ? 'success' : 'warning'}
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Main Content */}
      <Tabs 
        activeKey={selectedTab} 
        onChange={setSelectedTab}
        items={[
          {
            key: 'overview',
            label: 'Overview',
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {renderSystemOverview()}
                {renderPerformanceMetrics()}
              </Space>
            )
          },
          {
            key: 'alerts',
            label: 'Alerts',
            children: renderAlerts()
          },
          {
            key: 'security',
            label: 'Security',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Failed Logins"
                      value={metrics.security?.failedLogins || 0}
                      prefix={<LockOutlined />}
                      valueStyle={{ color: (metrics.security?.failedLogins || 0) > 10 ? '#ff4d4f' : '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Blocked IPs"
                      value={metrics.security?.blockedIPs || 0}
                      prefix={<SecurityScanOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Intrusion Attempts"
                      value={metrics.security?.intrusionAttempts || 0}
                      prefix={<WarningOutlined />}
                      valueStyle={{ color: (metrics.security?.intrusionAttempts || 0) > 0 ? '#ff4d4f' : '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Suspicious Activity"
                      value={metrics.security?.suspiciousActivity || 0}
                      prefix={<EyeInvisibleOutlined />}
                      valueStyle={{ color: (metrics.security?.suspiciousActivity || 0) > 5 ? '#ff4d4f' : '#52c41a' }}
                    />
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'performance',
            label: 'Performance',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Response Time"
                      value={metrics.performance?.responseTime || 0}
                      precision={1}
                      suffix="ms"
                      prefix={<ThunderboltOutlined />}
                      valueStyle={{ color: (metrics.performance?.responseTime || 0) > 500 ? '#ff4d4f' : (metrics.performance?.responseTime || 0) > 200 ? '#faad14' : '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Throughput"
                      value={metrics.performance?.throughput || 0}
                      precision={0}
                      suffix="req/min"
                      prefix={<ApiOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Error Rate"
                      value={metrics.performance?.errorRate || 0}
                      precision={2}
                      suffix="%"
                      prefix={<WarningOutlined />}
                      valueStyle={{ color: (metrics.performance?.errorRate || 0) > 5 ? '#ff4d4f' : (metrics.performance?.errorRate || 0) > 2 ? '#faad14' : '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Active Connections"
                      value={metrics.performance?.activeConnections || 0}
                      prefix={<GlobalOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'network',
            label: 'Network',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Bandwidth Usage"
                      value={metrics.network?.bandwidth || 0}
                      precision={1}
                      suffix="%"
                      prefix={<WifiOutlined />}
                      valueStyle={{ color: getPercentageColor(metrics.network?.bandwidth || 0) }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Latency"
                      value={metrics.network?.latency || 0}
                      precision={1}
                      suffix="ms"
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: (metrics.network?.latency || 0) > 100 ? '#ff4d4f' : (metrics.network?.latency || 0) > 50 ? '#faad14' : '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Packet Loss"
                      value={metrics.network?.packetLoss || 0}
                      precision={2}
                      suffix="%"
                      prefix={<DisconnectOutlined />}
                      valueStyle={{ color: (metrics.network?.packetLoss || 0) > 1 ? '#ff4d4f' : '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="DNS Resolution"
                      value={metrics.network?.dnsResolution || 0}
                      precision={1}
                      suffix="ms"
                      prefix={<GlobalOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            )
          }
        ]}
      />
    </div>
  );
};

export default RealTimeMonitoring;