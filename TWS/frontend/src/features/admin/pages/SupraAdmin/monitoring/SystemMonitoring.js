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
  message
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
  UserOutlined
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
  GaugeChart,
  Gauge
} from 'recharts';
import moment from 'moment';
import { get } from '../../../../../shared/utils/apiClient';
import { createLogger } from '../../../../../shared/utils/logger';
import { getStatusColor, getStatusIcon, getLogLevelColor } from '../../../../../shared/utils/statusUtils';

const { Title, Text } = Typography;
const { Option } = Select;
const logger = createLogger('SystemMonitoring');

const SystemMonitoring = () => {
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    activeUsers: 0,
    requestsPerMinute: 0,
    errorRate: 0,
    responseTime: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Fetch system data with proper error handling
  const fetchSystemData = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      
      const [healthResponse, analyticsResponse, alertsResponse, logsResponse] = await Promise.all([
        get('/api/supra-admin/system-health', {
          signal: abortControllerRef.current.signal
        }),
        get('/api/supra-admin/analytics', {
          signal: abortControllerRef.current.signal
        }),
        get('/api/supra-admin/monitoring/alerts', {
          signal: abortControllerRef.current.signal
        }),
        get('/api/supra-admin/monitoring/logs', {
          signal: abortControllerRef.current.signal
        })
      ]);

      if (healthResponse.success && healthResponse.data) {
        setSystemHealth(healthResponse.data);
      }
      
      // Update real-time metrics with real data
      if (analyticsResponse.success && analyticsResponse.data) {
        const analytics = analyticsResponse.data;
        setRealTimeMetrics({
          cpu: analytics.systemMetrics?.cpu || 0,
          memory: analytics.systemMetrics?.memory || 0,
          disk: analytics.systemMetrics?.disk || 0,
          network: analytics.systemMetrics?.network || 0,
          activeUsers: analytics.activeUsers || 0,
          requestsPerMinute: analytics.requestsPerMinute || 0,
          errorRate: analytics.errorRate || 0,
          responseTime: analytics.responseTime || 0
        });
      }

      // Handle alerts response
      if (alertsResponse.success) {
        setAlerts(alertsResponse.alerts || alertsResponse.data || []);
      }

      // Handle logs response
      if (logsResponse.success) {
        setLogs(logsResponse.logs || logsResponse.data || []);
      }

      if (alertsResponse.success) {
        setAlerts(alertsResponse.alerts || alertsResponse.data || []);
      }

      if (logsResponse.success) {
        setLogs(logsResponse.logs || logsResponse.data || []);
      }

      logger.info('System monitoring data fetched successfully');

    } catch (error) {
      // Don't set error if request was aborted
      if (error.name === 'AbortError') {
        return;
      }
      
      const errorMessage = error.message || 'Failed to fetch system monitoring data. Please try again.';
      logger.error('Error fetching system data', error);
      message.error(errorMessage);
      
      // Set empty data on error
      setSystemHealth(null);
      setAlerts([]);
      setLogs([]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  // Start auto refresh with proper cleanup
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      fetchSystemData();
    }, refreshInterval * 1000);
  }, [refreshInterval, fetchSystemData]);

  useEffect(() => {
    fetchSystemData();
    if (autoRefresh) {
      startAutoRefresh();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSystemData, startAutoRefresh, autoRefresh]);

  // Memoized time series data generation
  const timeSeriesData = useMemo(() => {
    // Generate time series data from real metrics if available
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        cpu: realTimeMetrics.cpu || 0,
        memory: realTimeMetrics.memory || 0,
        disk: realTimeMetrics.disk || 0,
        network: realTimeMetrics.network || 0,
        requests: realTimeMetrics.requestsPerMinute || 0,
        errors: realTimeMetrics.errorRate || 0
      });
    }
    return data;
  }, [realTimeMetrics]);

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
        <Tag color={
          severity === 'high' ? 'red' :
          severity === 'medium' ? 'orange' : 'green'
        }>
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

  const logColumns = [
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color={getLogLevelColor(level)}>{level.toUpperCase()}</Tag>
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


  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>System Monitoring</Title>
          <Text type="secondary">Real-time system health and performance monitoring</Text>
        </div>
        <Space>
          <Text type="secondary">Auto Refresh:</Text>
          <Switch 
            checked={autoRefresh} 
            onChange={setAutoRefresh}
            checkedChildren="ON"
            unCheckedChildren="OFF"
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
          <Button icon={<ReloadOutlined />} onClick={fetchSystemData}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* Server Stats Notice */}
      <Alert
        message="Server Statistics"
        description="These metrics show the server's system resources (CPU, Memory, Disk, Network) where the backend is running, not your local machine. In development, this may show your local server stats. In production, this shows the actual production server statistics."
        type="info"
        showIcon
        icon={<CloudServerOutlined />}
        style={{ marginBottom: '24px' }}
        closable
      />

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
              <Text type="secondary">Uptime: {systemHealth?.uptime || 0}%</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={realTimeMetrics.activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Badge status="processing" text="Live" />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Requests/min"
              value={realTimeMetrics.requestsPerMinute}
              prefix={<ApiOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Badge status="processing" text="Live" />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Error Rate"
              value={realTimeMetrics.errorRate}
              suffix="%"
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: realTimeMetrics.errorRate > 2 ? '#ff4d4f' : '#52c41a' }}
            />
            <Badge status="processing" text="Live" />
          </Card>
        </Col>
      </Row>

      {/* Real-time Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card title="CPU Usage" extra={<CloudServerOutlined />}>
            <Progress
              type="circle"
              percent={realTimeMetrics.cpu}
              format={percent => `${percent}%`}
              strokeColor={realTimeMetrics.cpu > 80 ? '#ff4d4f' : realTimeMetrics.cpu > 60 ? '#faad14' : '#52c41a'}
            />
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <Text type="secondary">Current: {realTimeMetrics.cpu.toFixed(1)}%</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card title="Memory Usage" extra={<DatabaseOutlined />}>
            <Progress
              type="circle"
              percent={realTimeMetrics.memory}
              format={percent => `${percent}%`}
              strokeColor={realTimeMetrics.memory > 80 ? '#ff4d4f' : realTimeMetrics.memory > 60 ? '#faad14' : '#52c41a'}
            />
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <Text type="secondary">Current: {realTimeMetrics.memory.toFixed(1)}%</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card title="Disk Usage" extra={<HddOutlined />}>
            <Progress
              type="circle"
              percent={realTimeMetrics.disk}
              format={percent => `${percent}%`}
              strokeColor={realTimeMetrics.disk > 80 ? '#ff4d4f' : realTimeMetrics.disk > 60 ? '#faad14' : '#52c41a'}
            />
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <Text type="secondary">Current: {realTimeMetrics.disk.toFixed(1)}%</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card title="Network I/O" extra={<WifiOutlined />}>
            <Progress
              type="circle"
              percent={realTimeMetrics.network}
              format={percent => `${percent}%`}
              strokeColor={realTimeMetrics.network > 80 ? '#ff4d4f' : realTimeMetrics.network > 60 ? '#faad14' : '#52c41a'}
            />
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <Text type="secondary">Current: {realTimeMetrics.network.toFixed(1)}%</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Service Health */}
      {systemHealth && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Service Health">
              <List
                dataSource={Object.entries(systemHealth.services || {})}
                renderItem={([service, data]) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={
                            service === 'database' ? <DatabaseOutlined /> :
                            service === 'api' ? <ApiOutlined /> :
                            service === 'storage' ? <HddOutlined /> :
                            <CloudServerOutlined />
                          }
                          style={{ backgroundColor: getStatusColor(data.status) }}
                        />
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ textTransform: 'capitalize' }}>{service}</span>
                          <Tag color={getStatusColor(data.status)}>{data.status}</Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Text type="secondary">
                            Response Time: {data.responseTime}ms
                          </Text>
                          {service === 'database' && (
                            <div>
                              <Text type="secondary">
                                Connections: {data.connections}/{data.maxConnections}
                              </Text>
                            </div>
                          )}
                          {service === 'storage' && (
                            <div>
                              <Text type="secondary">
                                Used: {data.used}% of {data.total}GB
                              </Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Performance Metrics">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Avg Response Time"
                    value={realTimeMetrics.responseTime}
                    suffix="ms"
                    prefix={<RiseOutlined />}
                    valueStyle={{ 
                      color: realTimeMetrics.responseTime > 300 ? '#ff4d4f' : 
                             realTimeMetrics.responseTime > 200 ? '#faad14' : '#52c41a' 
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Throughput"
                    value={realTimeMetrics.requestsPerMinute}
                    suffix="req/min"
                    prefix={<BarChartOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Success Rate"
                    value={100 - realTimeMetrics.errorRate}
                    suffix="%"
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Active Sessions"
                    value={realTimeMetrics.activeUsers}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* Time Series Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="System Resources (24h)" extra={<LineChartOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
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
          <Card title="Request Volume (24h)" extra={<BarChartOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="requests" fill="#1890ff" name="Requests" />
                <Bar dataKey="errors" fill="#ff4d4f" name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Alerts and Logs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title="System Alerts" 
            extra={
              <Badge count={alerts.length} size="small">
                <BellOutlined />
              </Badge>
            }
          >
            <Table
              columns={alertColumns}
              dataSource={alerts}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Logs">
            <Table
              columns={logColumns}
              dataSource={logs}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SystemMonitoring;
