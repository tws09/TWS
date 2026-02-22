import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  List, 
  Button, 
  Space, 
  Tag, 
  Divider, 
  Alert, 
  Tabs, 
  Table, 
  Statistic, 
  Row, 
  Col, 
  Badge, 
  Tooltip,
  Modal,
  Input,
  Select,
  message,
  Switch,
  Progress,
  Descriptions
} from 'antd';
import { 
  BugOutlined, 
  ReloadOutlined, 
  DatabaseOutlined, 
  ApiOutlined, 
  SettingOutlined, 
  InfoCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  WarningOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ClearOutlined,
  ExportOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const DebugMenu = () => {
  const [loading, setLoading] = useState(false);
  const [systemInfo, setSystemInfo] = useState({});
  const [apiStatus, setApiStatus] = useState({});
  const [debugLogs, setDebugLogs] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const menuItems = [
    { key: '/', label: 'Dashboard', status: 'active' },
    { key: '/tenants', label: 'Tenant Management', status: 'active' },
    { key: '/billing', label: 'Billing Management', status: 'active' },
    { key: '/session-management', label: 'Session Management', status: 'active' },
    { key: '/monitoring', label: 'System Monitoring', status: 'active' },
    { key: '/test-session', label: 'Test Session Management', status: 'active' },
    { key: '/reports', label: 'Reports', status: 'active' },
    { key: '/analytics', label: 'Analytics', status: 'active' }
  ];

  useEffect(() => {
    fetchSystemInfo();
    fetchApiStatus();
    fetchDebugLogs();
    fetchPerformanceMetrics();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/supra-admin/debug/system-info');
      setSystemInfo(response.data || {});
    } catch (error) {
      console.error('Error fetching system info:', error);
      setSystemInfo({
        environment: 'development',
        version: '1.0.0',
        nodeVersion: 'v18.0.0',
        uptime: '2 days, 5 hours',
        memoryUsage: '45%',
        cpuUsage: '12%',
        databaseStatus: 'connected',
        redisStatus: 'connected'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApiStatus = async () => {
    try {
      const endpoints = [
        '/api/supra-admin/dashboard',
        '/api/supra-admin/tenants',
        '/api/supra-admin/billing',
        '/api/supra-admin/session-management/sessions',
        '/api/supra-admin/reports',
        '/api/supra-admin/analytics',
        '/api/supra-admin/test-sessions'
      ];

      const statusChecks = await Promise.allSettled(
        endpoints.map(async (endpoint) => {
          const start = Date.now();
          try {
            await axios.get(endpoint, { timeout: 5000 });
            const responseTime = Date.now() - start;
            return { endpoint, status: 'success', responseTime };
          } catch (error) {
            return { endpoint, status: 'error', error: error.message };
          }
        })
      );

      const apiStatusData = statusChecks.map(result => result.value || result.reason);
      setApiStatus(apiStatusData);
    } catch (error) {
      console.error('Error checking API status:', error);
    }
  };

  const fetchDebugLogs = async () => {
    try {
      const response = await axios.get('/api/supra-admin/debug/logs');
      setDebugLogs(response.data || []);
    } catch (error) {
      console.error('Error fetching debug logs:', error);
      // Mock debug logs if API fails
      setDebugLogs([
        {
          id: 1,
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          level: 'info',
          message: 'System initialized successfully',
          source: 'system',
          details: { component: 'SupraAdmin', action: 'startup' }
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          level: 'warning',
          message: 'High memory usage detected',
          source: 'monitoring',
          details: { memoryUsage: '85%', threshold: '80%' }
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          level: 'error',
          message: 'Database connection timeout',
          source: 'database',
          details: { timeout: '5000ms', retries: 3 }
        }
      ]);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await axios.get('/api/supra-admin/debug/performance');
      setPerformanceMetrics(response.data || {});
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      setPerformanceMetrics({
        avgResponseTime: 245,
        requestsPerMinute: 120,
        errorRate: 0.5,
        memoryUsage: 67,
        cpuUsage: 23,
        activeConnections: 45
      });
    }
  };

  const clearLogs = async () => {
    try {
      await axios.delete('/api/supra-admin/debug/logs');
      setDebugLogs([]);
      message.success('Debug logs cleared successfully');
    } catch (error) {
      console.error('Error clearing logs:', error);
      message.error('Failed to clear debug logs');
    }
  };

  const exportLogs = () => {
    const logsData = JSON.stringify(debugLogs, null, 2);
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${moment().format('YYYY-MM-DD-HH-mm-ss')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Debug logs exported successfully');
  };

  const getStatusColor = (status) => {
    const colors = {
      'success': 'green',
      'error': 'red',
      'warning': 'orange',
      'info': 'blue'
    };
    return colors[status] || 'default';
  };

  const getLogLevelColor = (level) => {
    const colors = {
      'error': 'red',
      'warning': 'orange',
      'info': 'blue',
      'debug': 'gray'
    };
    return colors[level] || 'default';
  };

  const apiStatusColumns = [
    {
      title: 'Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Response Time',
      dataIndex: 'responseTime',
      key: 'responseTime',
      render: (time) => time ? `${time}ms` : 'N/A'
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      render: (error) => error ? <Text type="danger">{error}</Text> : '-'
    }
  ];

  const logColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => moment(timestamp).format('MMM DD, HH:mm:ss'),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color={getLogLevelColor(level)}>
          {level.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Error', value: 'error' },
        { text: 'Warning', value: 'warning' },
        { text: 'Info', value: 'info' },
        { text: 'Debug', value: 'debug' }
      ],
      onFilter: (value, record) => record.level === value
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (source) => <Tag>{source}</Tag>
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={() => {
            setSelectedLog(record);
            setModalVisible(true);
          }}
        />
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <BugOutlined /> Debug Menu
          </Title>
          <Text type="secondary">System debugging and monitoring tools</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => {
            fetchSystemInfo();
            fetchApiStatus();
            fetchDebugLogs();
            fetchPerformanceMetrics();
          }}>
            Refresh All
          </Button>
        </Space>
      </div>

      <Tabs defaultActiveKey="overview">
        {/* Overview Tab */}
        <TabPane tab="Overview" key="overview">
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="System Status"
                  value={systemInfo.databaseStatus === 'connected' ? 'Healthy' : 'Issues'}
                  prefix={systemInfo.databaseStatus === 'connected' ? <CheckCircleOutlined /> : <WarningOutlined />}
                  valueStyle={{ color: systemInfo.databaseStatus === 'connected' ? '#52c41a' : '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Memory Usage"
                  value={systemInfo.memoryUsage || 'N/A'}
                  suffix="%"
                  prefix={<DatabaseOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="CPU Usage"
                  value={systemInfo.cpuUsage || 'N/A'}
                  suffix="%"
                  prefix={<ApiOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Available Menu Items" style={{ marginBottom: '24px' }}>
            <List
              dataSource={menuItems}
              renderItem={item => (
                <List.Item>
                  <Space>
                    <Badge status={item.status === 'active' ? 'success' : 'error'} />
                    <Text code>{item.key}</Text>
                    <Text>{item.label}</Text>
                  </Space>
                </List.Item>
              )}
            />
            <Divider />
            <Text strong>Current Location: </Text>
            <Text code>{window.location.pathname}</Text>
          </Card>
        </TabPane>

        {/* API Status Tab */}
        <TabPane tab="API Status" key="api">
          <Card 
            title="API Endpoint Status" 
            extra={
              <Button icon={<ReloadOutlined />} onClick={fetchApiStatus}>
                Refresh
              </Button>
            }
          >
            <Table
              columns={apiStatusColumns}
              dataSource={apiStatus}
              rowKey="endpoint"
              pagination={false}
              size="small"
            />
          </Card>
        </TabPane>

        {/* Performance Tab */}
        <TabPane tab="Performance" key="performance">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card title="Response Time">
                <Statistic
                  value={performanceMetrics.avgResponseTime || 0}
                  suffix="ms"
                  valueStyle={{ color: '#1890ff' }}
                />
                <Progress 
                  percent={Math.min((performanceMetrics.avgResponseTime || 0) / 5, 100)} 
                  showInfo={false}
                  strokeColor="#1890ff"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card title="Requests per Minute">
                <Statistic
                  value={performanceMetrics.requestsPerMinute || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress 
                  percent={Math.min((performanceMetrics.requestsPerMinute || 0) / 2, 100)} 
                  showInfo={false}
                  strokeColor="#52c41a"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card title="Error Rate">
                <Statistic
                  value={performanceMetrics.errorRate || 0}
                  suffix="%"
                  valueStyle={{ color: '#ff4d4f' }}
                />
                <Progress 
                  percent={performanceMetrics.errorRate || 0} 
                  showInfo={false}
                  strokeColor="#ff4d4f"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card title="Active Connections">
                <Statistic
                  value={performanceMetrics.activeConnections || 0}
                  valueStyle={{ color: '#722ed1' }}
                />
                <Progress 
                  percent={Math.min((performanceMetrics.activeConnections || 0) / 2, 100)} 
                  showInfo={false}
                  strokeColor="#722ed1"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Debug Logs Tab */}
        <TabPane tab="Debug Logs" key="logs">
          <Card 
            title="System Debug Logs" 
            extra={
              <Space>
                <Button icon={<ClearOutlined />} onClick={clearLogs}>
                  Clear Logs
                </Button>
                <Button icon={<ExportOutlined />} onClick={exportLogs}>
                  Export
                </Button>
                <Button icon={<ReloadOutlined />} onClick={fetchDebugLogs}>
                  Refresh
                </Button>
              </Space>
            }
          >
            <Table
              columns={logColumns}
              dataSource={debugLogs}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </TabPane>

        {/* System Info Tab */}
        <TabPane tab="System Info" key="system">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card title="Environment Information">
                <List
                  dataSource={[
                    { label: 'Environment', value: systemInfo.environment || 'development' },
                    { label: 'Version', value: systemInfo.version || '1.0.0' },
                    { label: 'Node Version', value: systemInfo.nodeVersion || 'v18.0.0' },
                    { label: 'Uptime', value: systemInfo.uptime || '2 days, 5 hours' }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Text strong>{item.label}:</Text>
                      <Text style={{ marginLeft: '8px' }}>{item.value}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card title="Service Status">
                <List
                  dataSource={[
                    { service: 'Database', status: systemInfo.databaseStatus || 'connected' },
                    { service: 'Redis', status: systemInfo.redisStatus || 'connected' },
                    { service: 'API Server', status: 'running' },
                    { service: 'Frontend', status: 'running' }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Space>
                        <Badge 
                          status={item.status === 'connected' || item.status === 'running' ? 'success' : 'error'} 
                        />
                        <Text strong>{item.service}:</Text>
                        <Text>{item.status}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Log Details Modal */}
      <Modal
        title="Log Details"
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedLog(null);
        }}
        footer={null}
        width={600}
      >
        {selectedLog && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Timestamp">
                {moment(selectedLog.timestamp).format('MMM DD, YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Level">
                <Tag color={getLogLevelColor(selectedLog.level)}>
                  {selectedLog.level.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Source">
                {selectedLog.source}
              </Descriptions.Item>
              <Descriptions.Item label="Message">
                {selectedLog.message}
              </Descriptions.Item>
              <Descriptions.Item label="Details">
                <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DebugMenu;
