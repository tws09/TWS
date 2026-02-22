import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  InputNumber, 
  Switch, 
  DatePicker, 
  message, 
  Popconfirm, 
  Tooltip, 
  Badge, 
  Progress, 
  Statistic, 
  Tabs, 
  List, 
  Avatar, 
  Typography, 
  Divider,
  Alert,
  Timeline,
  Descriptions,
  Transfer,
  Checkbox,
  Radio
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  SettingOutlined, 
  UserOutlined, 
  DollarOutlined, 
  TeamOutlined, 
  DatabaseOutlined, 
  CloudOutlined, 
  SecurityScanOutlined, 
  BellOutlined, 
  TrophyOutlined, 
  RiseOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined,
  StopOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  UserSwitchOutlined,
  ApartmentOutlined,
  GlobalOutlined,
  MonitorOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import moment from 'moment';
import { get, post, del } from '../../../../../shared/utils/apiClient';
import { createLogger } from '../../../../../shared/utils/logger';
import { getStatusColor, getStatusIcon } from '../../../../../shared/utils/statusUtils';
import { TableSkeleton } from '../../../../../shared/components/ui/SkeletonLoader';

const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const logger = createLogger('SessionManagement');

const SessionManagement = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions');
  
  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [sessionDetailsModalVisible, setSessionDetailsModalVisible] = useState(false);
  
  // Department Access state
  const [departmentAccess, setDepartmentAccess] = useState([]);
  const [filteredDepartmentAccess, setFilteredDepartmentAccess] = useState([]);
  const [selectedAccess, setSelectedAccess] = useState(null);
  const [accessModalVisible, setAccessModalVisible] = useState(false);
  const [accessDetailsModalVisible, setAccessDetailsModalVisible] = useState(false);
  
  // Departments state
  const [departments, setDepartments] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);
  
  // Tenants state
  const [tenants, setTenants] = useState([]);
  
  // Filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  // Performance optimizations - debounce search text
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText || '');
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);
  
  // Forms
  const [sessionForm] = Form.useForm();
  const [accessForm] = Form.useForm();
  const [departmentForm] = Form.useForm();
  
  // Analytics
  const [sessionAnalytics, setSessionAnalytics] = useState({});
  const [departmentAnalytics, setDepartmentAnalytics] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTenants(),
        fetchSessions(),
        fetchDepartmentAccess(),
        fetchDepartments(),
        fetchAnalytics()
      ]);
    } catch (error) {
      message.error('Failed to fetch initial data');
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await get('/api/supra-admin/tenants');
      if (response.success && response.tenants) {
        setTenants(response.tenants);
        if (response.tenants.length > 0 && !selectedTenant) {
          setSelectedTenant(response.tenants[0]._id);
        }
      }
    } catch (error) {
      logger.error('Error fetching tenants', error);
      message.error('Failed to fetch tenants');
    }
  };

  const fetchSessions = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (tenantFilter !== 'all') params.append('tenantId', tenantFilter);
      
      const response = await get(`/api/supra-admin/sessions/sessions?${params.toString()}`);
      if (response.success && response.sessions) {
        // Transform sessions to match frontend expectations
        const transformedSessions = response.sessions.map(session => ({
          ...session,
          // Ensure userId is an object with expected structure
          userId: session.userId || {
            _id: session.userId?._id || session.userId,
            fullName: session.userId?.fullName || session.userName || 'Unknown',
            email: session.userId?.email || session.email || '',
            role: session.userId?.role || session.role || '',
            department: session.userId?.department || ''
          },
          // Ensure tenantId is an object
          tenantId: session.tenantId || {
            _id: session.tenantId?._id || session.tenantId,
            name: session.tenantId?.name || session.tenantName || 'Unknown',
            slug: session.tenantId?.slug || ''
          }
        }));
        setSessions(transformedSessions);
      }
    } catch (error) {
      logger.error('Error fetching sessions', error);
      message.error('Failed to fetch sessions');
      setSessions([]);
    }
  };

  const fetchDepartmentAccess = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (tenantFilter !== 'all') params.append('tenantId', tenantFilter);
      
      const response = await get(`/api/supra-admin/sessions/department-access?${params.toString()}`);
      if (response.success && response.departmentAccess) {
        // Transform to match frontend expectations
        const transformed = response.departmentAccess.map(access => ({
          ...access,
          userId: access.userId || {
            _id: access.userId?._id || access.userId,
            fullName: access.userId?.fullName || access.userName || 'Unknown',
            email: access.userId?.email || access.email || '',
            role: access.userId?.role || access.role || ''
          }
        }));
        setDepartmentAccess(transformed);
      }
    } catch (error) {
      logger.error('Error fetching department access', error);
      message.error('Failed to fetch department access records');
      setDepartmentAccess([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      if (selectedTenant) {
        const response = await get(`/api/supra-admin/sessions/departments?tenantId=${selectedTenant}`);
        if (response.success && response.departments) {
          setDepartments(response.departments);
        } else if (response.success) {
          setDepartments(response);
        }
      }
    } catch (error) {
      logger.error('Error fetching departments', error);
      message.error('Failed to fetch departments');
      setDepartments([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams();
      if (tenantFilter !== 'all') params.append('tenantId', tenantFilter);
      params.append('timeRange', '7d');
      
      const [sessionResponse, departmentResponse] = await Promise.all([
        get(`/api/supra-admin/sessions/analytics/sessions?${params.toString()}`),
        get(`/api/supra-admin/sessions/analytics/department-access?${params.toString()}`)
      ]);
      
      if (sessionResponse.success && sessionResponse.analytics) {
        setSessionAnalytics(sessionResponse.analytics);
      }
      
      if (departmentResponse.success && departmentResponse.analytics) {
        setDepartmentAnalytics(departmentResponse.analytics);
      }
    } catch (error) {
      logger.error('Error fetching analytics', error);
      message.error('Failed to fetch analytics data');
      setSessionAnalytics({});
      setDepartmentAnalytics([]);
    }
  };

  // Memoized filter function to prevent unnecessary recalculations
  const filterData = useCallback(() => {
    let filteredSessionsData = [...sessions];
    let filteredAccessData = [...departmentAccess];

    // Search filter with debounced text
    if (debouncedSearchText && typeof debouncedSearchText === 'string') {
      const searchLower = debouncedSearchText.toLowerCase();
      filteredSessionsData = filteredSessionsData.filter(session =>
        session.userId?.fullName?.toLowerCase().includes(searchLower) ||
        session.userId?.email?.toLowerCase().includes(searchLower) ||
        session.ipAddress?.toLowerCase().includes(searchLower)
      );
      
      filteredAccessData = filteredAccessData.filter(access =>
        access.userId?.fullName?.toLowerCase().includes(searchLower) ||
        access.userId?.email?.toLowerCase().includes(searchLower) ||
        access.department?.toLowerCase().includes(searchLower)
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filteredSessionsData = filteredSessionsData.filter(session =>
        session.departmentAccess?.some(da => da.department === departmentFilter && da.isActive)
      );
      filteredAccessData = filteredAccessData.filter(access => access.department === departmentFilter);
    }

    setFilteredSessions(filteredSessionsData);
    setFilteredDepartmentAccess(filteredAccessData);
  }, [sessions, departmentAccess, debouncedSearchText, departmentFilter]);

  // Apply filters when data or filters change
  useEffect(() => {
    filterData();
  }, [filterData]);

  const handleTerminateSession = async (sessionId) => {
    try {
      const response = await del(`/api/supra-admin/sessions/sessions/${sessionId}`, {
        reason: 'Terminated by SupraAdmin'
      });
      
      if (response.success) {
        message.success('Session terminated successfully');
        fetchSessions();
      } else {
        throw new Error(response.message || 'Failed to terminate session');
      }
    } catch (error) {
      logger.error('Failed to terminate session', error);
      message.error(error.message || 'Failed to terminate session');
    }
  };

  const handleGrantDepartmentAccess = async (values) => {
    try {
      const response = await post('/api/supra-admin/sessions/department-access', {
        ...values,
        tenantId: selectedTenant
      });
      
      if (response.success) {
        message.success('Department access granted successfully');
        setAccessModalVisible(false);
        accessForm.resetFields();
        fetchDepartmentAccess();
      } else {
        throw new Error(response.message || 'Failed to grant department access');
      }
    } catch (error) {
      logger.error('Failed to grant department access', error);
      message.error(error.message || 'Failed to grant department access');
    }
  };

  const handleRevokeDepartmentAccess = async (accessId) => {
    try {
      const response = await post(`/api/supra-admin/sessions/department-access/${accessId}/revoke`, {
        reason: 'Revoked by SupraAdmin'
      });
      
      if (response.success) {
        message.success('Department access revoked successfully');
        fetchDepartmentAccess();
      } else {
        throw new Error(response.message || 'Failed to revoke department access');
      }
    } catch (error) {
      logger.error('Failed to revoke department access', error);
      message.error(error.message || 'Failed to revoke department access');
    }
  };

  const handleCreateDepartment = async (values) => {
    try {
      const response = await post('/api/supra-admin/sessions/departments', {
        ...values,
        tenantId: selectedTenant
      });
      
      if (response.success) {
        message.success('Department created successfully');
        setDepartmentModalVisible(false);
        departmentForm.resetFields();
        fetchDepartments();
      } else {
        throw new Error(response.message || 'Failed to create department');
      }
    } catch (error) {
      logger.error('Failed to create department', error);
      message.error(error.message || 'Failed to create department');
    }
  };

  const getDeviceIcon = (userAgent) => {
    if (userAgent?.includes('Mobile')) return <MobileOutlined />;
    if (userAgent?.includes('Tablet')) return <TabletOutlined />;
    return <DesktopOutlined />;
  };

  const getAccessLevelColor = (level) => {
    const colors = {
      'viewer': 'blue',
      'contributor': 'cyan',
      'editor': 'orange',
      'admin': 'red',
      'owner': 'purple'
    };
    return colors[level] || 'default';
  };

  // Memoized responsive table columns with mobile optimization
  const sessionColumns = useMemo(() => [
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (user) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{user?.fullName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{user?.email}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>{user?.department}</div>
        </div>
      ),
      sorter: (a, b) => a.userId?.fullName?.localeCompare(b.userId?.fullName),
    },
    {
      title: 'Tenant',
      dataIndex: 'tenantId',
      key: 'tenantId',
      responsive: ['sm', 'md', 'lg', 'xl'],
      render: (tenant) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{tenant?.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>/{tenant?.slug}</div>
        </div>
      ),
    },
    {
      title: 'Device',
      dataIndex: 'userAgent',
      key: 'userAgent',
      responsive: ['md', 'lg', 'xl'],
      render: (userAgent) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getDeviceIcon(userAgent)}
          <span style={{ fontSize: '12px' }}>
            {userAgent?.includes('Chrome') ? 'Chrome' : 
             userAgent?.includes('Firefox') ? 'Firefox' : 
             userAgent?.includes('Safari') ? 'Safari' : 'Unknown'}
          </span>
        </div>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      responsive: ['lg', 'xl'],
      render: (ip) => <Text code style={{ fontSize: '12px' }}>{ip}</Text>,
    },
    {
      title: 'Department Access',
      dataIndex: 'departmentAccess',
      key: 'departmentAccess',
      responsive: ['md', 'lg', 'xl'],
      render: (access) => (
        <div>
          {access?.filter(da => da.isActive).map(da => (
            <Tag key={da.department} color="blue" size="small" style={{ marginBottom: '2px' }}>
              {da.department}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (status) => <Tag color={getStatusColor(status)} size="small">{(status || 'unknown').toUpperCase()}</Tag>,
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Suspended', value: 'suspended' },
        { text: 'Terminated', value: 'terminated' },
        { text: 'Expired', value: 'expired' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Last Activity',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      responsive: ['sm', 'md', 'lg', 'xl'],
      render: (date) => <span style={{ fontSize: '12px' }}>{moment(date).fromNow()}</span>,
      sorter: (a, b) => new Date(a.lastActivity) - new Date(b.lastActivity),
    },
    {
      title: 'Actions',
      key: 'actions',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              size="small"
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedSession(record);
                setSessionDetailsModalVisible(true);
              }}
              style={{ minWidth: '32px', height: '32px' }}
            />
          </Tooltip>
          {record.status === 'active' && (
            <Popconfirm
              title="Are you sure you want to terminate this session?"
              onConfirm={() => handleTerminateSession(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Terminate Session">
                <Button 
                  type="text" 
                  size="small"
                  danger 
                  icon={<StopOutlined />}
                  style={{ minWidth: '32px', height: '32px' }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ], []);

  const departmentAccessColumns = useMemo(() => [
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (user) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{user?.fullName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{user?.email}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>{user?.role}</div>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (department) => (
        <Tag icon={<ApartmentOutlined />} color="blue" size="small">
          {department}
        </Tag>
      ),
    },
    {
      title: 'Access Level',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      responsive: ['sm', 'md', 'lg', 'xl'],
      render: (level) => <Tag color={getAccessLevelColor(level)} size="small">{level.toUpperCase()}</Tag>,
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      responsive: ['md', 'lg', 'xl'],
      render: (permissions) => (
        <div>
          {permissions?.map(permission => (
            <Tag key={permission} size="small" style={{ marginBottom: '2px' }}>
              {permission}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (status) => <Tag color={getStatusColor(status)} size="small">{(status || 'unknown').toUpperCase()}</Tag>,
    },
    {
      title: 'Last Accessed',
      dataIndex: 'lastAccessed',
      key: 'lastAccessed',
      responsive: ['sm', 'md', 'lg', 'xl'],
      render: (date) => <span style={{ fontSize: '12px' }}>{moment(date).fromNow()}</span>,
      sorter: (a, b) => new Date(a.lastAccessed) - new Date(b.lastAccessed),
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      responsive: ['lg', 'xl'],
      render: (date) => <span style={{ fontSize: '12px' }}>{date ? moment(date).format('MMM DD, YYYY') : 'Never'}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              size="small"
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedAccess(record);
                setAccessDetailsModalVisible(true);
              }}
              style={{ minWidth: '32px', height: '32px' }}
            />
          </Tooltip>
          {record.status === 'active' && (
            <Popconfirm
              title="Are you sure you want to revoke this access?"
              onConfirm={() => handleRevokeDepartmentAccess(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Revoke Access">
                <Button 
                  type="text" 
                  size="small"
                  danger 
                  icon={<CloseCircleOutlined />}
                  style={{ minWidth: '32px', height: '32px' }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ], []);

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Session Management</Title>
          <Text type="secondary">Manage tenant sessions and department access control</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchInitialData}>
            Refresh
          </Button>
          <Button icon={<ExportOutlined />}>
            Export
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Sessions"
              value={sessionAnalytics.activeSessions || 0}
              prefix={<MonitorOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Sessions"
              value={sessionAnalytics.totalSessions || 0}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Unique Users"
              value={sessionAnalytics.uniqueUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Departments"
              value={departments.length}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={6}>
            <Search
              placeholder="Search users, emails, IPs..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="active">Active</Option>
              <Option value="suspended">Suspended</Option>
              <Option value="terminated">Terminated</Option>
              <Option value="expired">Expired</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Tenant"
              value={tenantFilter}
              onChange={setTenantFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Tenants</Option>
              {tenants.map(tenant => (
                <Option key={tenant._id} value={tenant._id}>{tenant.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Department"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Departments</Option>
              {departments.map(dept => (
                <Option key={dept._id} value={dept.name}>{dept.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Space>
              <Text type="secondary">
                Showing {activeTab === 'sessions' ? filteredSessions.length : filteredDepartmentAccess.length} records
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'sessions',
              label: 'Active Sessions',
              children: loading ? (
                <TableSkeleton columns={7} rows={5} />
              ) : (
                <Table
                  columns={sessionColumns}
                  dataSource={filteredSessions}
                  rowKey="_id"
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} sessions`,
                    responsive: true,
                    size: 'small'
                  }}
                  scroll={{ x: 800 }}
                  size="small"
                  responsive={true}
                  tableLayout="auto"
                />
              )
            },
            {
              key: 'department-access',
              label: 'Department Access',
              children: (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setAccessModalVisible(true)}
                    >
                      Grant Department Access
                    </Button>
                  </div>
                  {loading ? (
                    <TableSkeleton columns={8} rows={5} />
                  ) : (
                    <Table
                      columns={departmentAccessColumns}
                      dataSource={filteredDepartmentAccess}
                      rowKey="_id"
                      pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} access records`,
                        responsive: true,
                        size: 'small'
                      }}
                      scroll={{ x: 800 }}
                      size="small"
                      responsive={true}
                      tableLayout="auto"
                    />
                  )}
                </>
              )
            },
            {
              key: 'departments',
              label: 'Departments',
              children: (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setDepartmentModalVisible(true)}
                    >
                      Create Department
                    </Button>
                  </div>
                  <Row gutter={[16, 16]}>
                    {departments.map(department => (
                      <Col xs={24} sm={12} lg={8} key={department._id}>
                        <Card 
                          title={department.name}
                          extra={<Tag color="blue">{department.code}</Tag>}
                          actions={[
                            <Button type="text" icon={<EyeOutlined />}>View</Button>,
                            <Button type="text" icon={<EditOutlined />}>Edit</Button>
                          ]}
                        >
                          <p>{department.description}</p>
                          <div style={{ marginTop: '12px' }}>
                            <Text type="secondary">Users: </Text>
                            <Text strong>{department.stats?.totalUsers || 0}</Text>
                            <br />
                            <Text type="secondary">Status: </Text>
                            <Tag color={department.status === 'active' ? 'green' : 'red'}>
                              {department.status}
                            </Tag>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </>
              )
            },
            {
              key: 'analytics',
              label: 'Analytics',
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="Sessions by Department">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={Object.entries(sessionAnalytics.sessionsByDepartment || {}).map(([name, value]) => ({ name, value }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {Object.entries(sessionAnalytics.sessionsByDepartment || {}).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Hourly Session Distribution">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={sessionAnalytics.hourlyDistribution?.map((value, index) => ({ hour: index, sessions: value })) || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="sessions" fill="#1890ff" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>
              )
            }
          ]}
        />
      </Card>

      {/* Session Details Modal */}
      <Modal
        title={`Session Details - ${selectedSession?.userId?.fullName}`}
        open={sessionDetailsModalVisible}
        onCancel={() => {
          setSessionDetailsModalVisible(false);
          setSelectedSession(null);
        }}
        footer={null}
        width={800}
      >
        {selectedSession && (
          <Tabs 
            defaultActiveKey="overview"
            items={[
              {
                key: 'overview',
                label: 'Overview',
                children: (
                  <Descriptions column={2}>
                    <Descriptions.Item label="User">{selectedSession.userId?.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Email">{selectedSession.userId?.email}</Descriptions.Item>
                    <Descriptions.Item label="Tenant">{selectedSession.tenantId?.name}</Descriptions.Item>
                    <Descriptions.Item label="IP Address">{selectedSession.ipAddress}</Descriptions.Item>
                    <Descriptions.Item label="Device">{selectedSession.userAgent}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={getStatusColor(selectedSession.status)}>{selectedSession.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Login Time">{moment(selectedSession.loginTime).format('MMM DD, YYYY HH:mm')}</Descriptions.Item>
                    <Descriptions.Item label="Last Activity">{moment(selectedSession.lastActivity).fromNow()}</Descriptions.Item>
                  </Descriptions>
                )
              },
              {
                key: 'access',
                label: 'Department Access',
                children: (
                  <List
                    dataSource={selectedSession.departmentAccess}
                    renderItem={access => (
                      <List.Item>
                        <List.Item.Meta
                          title={access.department}
                          description={
                            <div>
                              <div>Permissions: {access.permissions.join(', ')}</div>
                              <div>Granted: {moment(access.grantedAt).format('MMM DD, YYYY')}</div>
                              {access.expiresAt && <div>Expires: {moment(access.expiresAt).format('MMM DD, YYYY')}</div>}
                            </div>
                          }
                        />
                        <Tag color={access.isActive ? 'green' : 'red'}>
                          {access.isActive ? 'Active' : 'Inactive'}
                        </Tag>
                      </List.Item>
                    )}
                  />
                )
              },
              {
                key: 'activity',
                label: 'Activity Log',
                children: (
                  <Timeline
                    items={selectedSession.activities?.map(activity => ({
                      children: (
                        <div>
                          <div><strong>{activity.action}</strong> - {activity.resource}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {moment(activity.timestamp).format('MMM DD, YYYY HH:mm')}
                          </div>
                        </div>
                      )
                    })) || []}
                  />
                )
              }
            ]}
          />
        )}
      </Modal>

      {/* Grant Department Access Modal */}
      <Modal
        title="Grant Department Access"
        open={accessModalVisible}
        onCancel={() => {
          setAccessModalVisible(false);
          accessForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={accessForm}
          layout="vertical"
          onFinish={handleGrantDepartmentAccess}
        >
          <Form.Item
            name="userId"
            label="User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select placeholder="Select user" showSearch>
              {/* This would be populated with users from the selected tenant */}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please select a department' }]}
          >
            <Select placeholder="Select department">
              {departments.map(dept => (
                <Option key={dept._id} value={dept.name}>{dept.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="accessLevel"
            label="Access Level"
            rules={[{ required: true, message: 'Please select access level' }]}
          >
            <Radio.Group>
              <Radio value="viewer">Viewer</Radio>
              <Radio value="contributor">Contributor</Radio>
              <Radio value="editor">Editor</Radio>
              <Radio value="admin">Admin</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[{ required: true, message: 'Please select permissions' }]}
          >
            <Checkbox.Group>
              <Checkbox value="read">Read</Checkbox>
              <Checkbox value="write">Write</Checkbox>
              <Checkbox value="admin">Admin</Checkbox>
              <Checkbox value="delete">Delete</Checkbox>
              <Checkbox value="manage_users">Manage Users</Checkbox>
              <Checkbox value="view_analytics">View Analytics</Checkbox>
              <Checkbox value="export_data">Export Data</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          
          <Form.Item
            name="expiresAt"
            label="Expiration Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Grant Access
              </Button>
              <Button onClick={() => {
                setAccessModalVisible(false);
                accessForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Department Modal */}
      <Modal
        title="Create Department"
        open={departmentModalVisible}
        onCancel={() => {
          setDepartmentModalVisible(false);
          departmentForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={departmentForm}
          layout="vertical"
          onFinish={handleCreateDepartment}
        >
          <Form.Item
            name="name"
            label="Department Name"
            rules={[{ required: true, message: 'Please enter department name' }]}
          >
            <Input placeholder="Enter department name" />
          </Form.Item>
          
          <Form.Item
            name="code"
            label="Department Code"
            rules={[{ required: true, message: 'Please enter department code' }]}
          >
            <Input placeholder="Enter department code" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Enter department description" rows={3} />
          </Form.Item>
          
          <Form.Item
            name="departmentHead"
            label="Department Head"
          >
            <Select placeholder="Select department head" allowClear>
              {/* This would be populated with users from the selected tenant */}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Department
              </Button>
              <Button onClick={() => {
                setDepartmentModalVisible(false);
                departmentForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SessionManagement;
