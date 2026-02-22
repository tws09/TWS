import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Spin, 
  Alert, 
  Table, 
  Tag, 
  Button, 
  Progress,
  Tabs,
  List,
  Avatar,
  Tooltip,
  Space,
  Typography,
  Divider
} from 'antd';
import { 
  DatabaseOutlined, 
  TeamOutlined, 
  DollarOutlined, 
  ProjectOutlined,
  SettingOutlined,
  BarChartOutlined,
  FileTextOutlined,
  MessageOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  UserOutlined,
  BookOutlined,
  CarOutlined,
  HomeOutlined,
  CoffeeOutlined,
  TrophyOutlined,
  ShoppingCartOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  ScanOutlined,
  CreditCardOutlined,
  RocketOutlined,
  GiftOutlined,
  HeartOutlined,
  TruckOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import axiosInstance from '../../../../../shared/utils/axiosInstance';

const { Title, Text } = Typography;

const ERPManagement = () => {
  const { category } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [erpStats, setErpStats] = useState(null);
  const [tenantModules, setTenantModules] = useState([]);
  const [moduleUsage, setModuleUsage] = useState([]);
  const [erpCategories, setErpCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');

  useEffect(() => {
    fetchERPData();
  }, []);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  const fetchERPData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch data, but provide fallback if API fails
      try {
        const [statsResponse, tenantsResponse] = await Promise.all([
          axiosInstance.get('/api/supra-admin/erp/stats'),
          axiosInstance.get('/api/supra-admin/tenants?limit=100')
        ]);

        setErpStats(statsResponse.data);
        setTenantModules(tenantsResponse.data.tenants);
        
        // Calculate module usage
        const usage = calculateModuleUsage(tenantsResponse.data.tenants);
        setModuleUsage(usage);
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        // Fallback to mock data if API is not available
        const mockTenants = [
          { _id: '2', name: 'Sample Company', slug: 'sample-company', status: 'active', erpCategory: 'software_house' }
        ];
        setTenantModules(mockTenants);
        const usage = calculateModuleUsage(mockTenants);
        setModuleUsage(usage);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch ERP data');
      console.error('ERP Management error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getModuleSubModules = (moduleKey, categoryKey) => {
    const subModulesMap = {
      // Software House ERP
      software_house: {
        hr: ['Employee Management', 'Payroll', 'Attendance', 'Recruitment', 'Performance Reviews', 'Onboarding', 'Training', 'Leave Management', 'HR Analytics'],
        finance: ['Accounting', 'Invoicing', 'Expense Management', 'Budget Planning', 'Financial Reports', 'Tax Management', 'Payment Processing', 'Revenue Tracking', 'Cost Analysis', 'Billing Cycles'],
        projects: ['Project Planning', 'Task Management', 'Sprint Management', 'Resource Allocation', 'Project Timeline', 'Milestone Tracking', 'Project Analytics', 'Team Collaboration'],
        development_methodology: ['Agile Framework', 'Scrum Ceremonies', 'Kanban Boards', 'Sprint Planning', 'Retrospectives'],
        tech_stack: ['Frontend Technologies', 'Backend Technologies', 'Database Systems', 'Cloud Platforms'],
        project_types: ['Web Applications', 'Mobile Apps', 'API Development'],
        time_tracking: ['Time Logging', 'Billable Hours', 'Project Time', 'Resource Utilization', 'Time Reports', 'Billing Integration'],
        code_quality: ['Code Reviews', 'Testing Standards', 'Quality Metrics', 'Code Coverage'],
        client_portal: ['Client Dashboard', 'Project Updates', 'Invoice Access', 'Communication Hub', 'Document Sharing'],
        reports: ['Project Analytics', 'Team Performance', 'Financial Reports', 'Time Reports', 'Client Reports', 'Resource Reports', 'Quality Reports', 'Business Intelligence']
      }
    };

    return subModulesMap[categoryKey]?.[moduleKey] || [];
  };

  const getERPCategories = () => {
    return [
      {
        key: 'software_house',
        name: 'Software House ERP',
        description: 'Software development and IT company management',
        icon: <RocketOutlined />,
        color: '#722ed1',
        modules: [
          { key: 'hr', name: 'HR Management', icon: <TeamOutlined />, modules: 9 },
          { key: 'finance', name: 'Finance & Billing', icon: <DollarOutlined />, modules: 10 },
          { key: 'projects', name: 'Project Management', icon: <ProjectOutlined />, modules: 8 },
          { key: 'development_methodology', name: 'Development Methodology', icon: <SettingOutlined />, modules: 5 },
          { key: 'tech_stack', name: 'Technology Stack', icon: <DatabaseOutlined />, modules: 4 },
          { key: 'project_types', name: 'Project Types', icon: <FileTextOutlined />, modules: 3 },
          { key: 'time_tracking', name: 'Time Tracking', icon: <ClockCircleOutlined />, modules: 6 },
          { key: 'code_quality', name: 'Code Quality', icon: <SafetyOutlined />, modules: 4 },
          { key: 'client_portal', name: 'Client Portal', icon: <TeamOutlined />, modules: 5 },
          { key: 'reports', name: 'Analytics & Reports', icon: <BarChartOutlined />, modules: 8 }
        ]
      }
    ];
  };

  const calculateModuleUsage = (tenants) => {
    const categories = getERPCategories();
    
    return categories.map(category => {
      const categoryTenants = tenants.filter(tenant => 
        tenant.status === 'active' && tenant.erpCategory === category.key
      );
      
      const totalTenants = tenants.length;
      const usagePercent = totalTenants > 0 ? Math.round((categoryTenants.length / totalTenants) * 100) : 0;

      return {
        ...category,
        activeTenants: categoryTenants.length,
        totalTenants,
        usagePercent,
        totalModules: category.modules.reduce((sum, mod) => sum + mod.modules, 0)
      };
    });
  };

  const tenantColumns = [
    {
      title: 'Tenant',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.slug}</div>
        </div>
      ),
    },
    {
      title: 'ERP Category',
      dataIndex: 'erpCategory',
      key: 'erpCategory',
      render: (category) => {
        const categories = getERPCategories();
        const cat = categories.find(c => c.key === category) || categories[0];
        return (
          <Tag color={cat.color} icon={cat.icon}>
            {cat.name}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          'active': 'green',
          'trialing': 'orange',
          'suspended': 'red',
          'cancelled': 'gray'
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Modules',
      key: 'modules',
      render: (_, record) => {
        const categories = getERPCategories();
        const category = categories.find(c => c.key === record.erpCategory) || categories[0];
        const totalModules = category.totalModules;
        return (
          <div>
            <div>{totalModules} modules</div>
            <Progress 
              percent={100} 
              size="small" 
              showInfo={false}
              strokeColor={category.color}
            />
          </div>
        );
      },
    },
    {
      title: 'Last Activity',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Tenant Dashboard">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => window.open(`/${record.slug}/org/dashboard`, '_blank')}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
        action={
          <Button size="small" onClick={fetchERPData}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          ERP Management
          {category && (
            <span style={{ fontSize: '18px', color: '#666', marginLeft: '12px' }}>
              - {moduleUsage.find(cat => cat.key === category)?.name || category}
            </span>
          )}
        </Title>
        <Text type="secondary">
          {category 
            ? `Detailed view of ${moduleUsage.find(cat => cat.key === category)?.name || category} modules`
            : 'Overview of ERP modules across all tenants'
          }
        </Text>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Tenants"
              value={tenantModules.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Tenants"
              value={tenantModules.filter(t => t.status === 'active').length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="ERP Categories"
              value={moduleUsage.length}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Modules"
              value={moduleUsage.reduce((acc, cat) => acc + cat.totalModules, 0)}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs 
        defaultActiveKey={category ? "details" : "categories"}
        items={[
          {
            key: 'categories',
            label: 'ERP Categories',
            children: (
              <Row gutter={[16, 16]}>
                {moduleUsage.map((category) => (
                  <Col xs={24} sm={12} lg={8} key={category.key}>
                    <Card 
                      hoverable
                      style={{ height: '100%' }}
                      actions={[
                        <Button 
                          type="link" 
                          icon={<EyeOutlined />}
                          onClick={() => setSelectedCategory(category.key)}
                        >
                          View Details
                        </Button>
                      ]}
                    >
                      <Card.Meta
                        avatar={
                          <Avatar 
                            size="large"
                            style={{ backgroundColor: category.color }}
                            icon={category.icon}
                          />
                        }
                        title={category.name}
                        description={
                          <div>
                            <div style={{ marginBottom: '8px' }}>
                              <Text strong>{category.activeTenants}</Text> of <Text>{category.totalTenants}</Text> tenants
                            </div>
                            <Progress 
                              percent={category.usagePercent} 
                              strokeColor={category.color}
                              showInfo={false}
                            />
                            <div style={{ textAlign: 'center', marginTop: '4px' }}>
                              <Text type="secondary">{category.usagePercent}% adoption</Text>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '8px' }}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {category.totalModules} total modules
                              </Text>
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            )
          },
          {
            key: 'details',
            label: 'Category Details',
            children: selectedCategory !== 'all' ? (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  {(() => {
                    const category = moduleUsage.find(cat => cat.key === selectedCategory);
                    if (!category) return <div>Select a category to view details</div>;
                    
                    return (
                      <Card 
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Avatar 
                              size="large"
                              style={{ backgroundColor: category.color }}
                              icon={category.icon}
                            />
                            <div>
                              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{category.name}</div>
                              <div style={{ color: '#666' }}>{category.description}</div>
                            </div>
                          </div>
                        }
                        extra={
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: category.color }}>
                              {category.activeTenants}
                            </div>
                            <div style={{ color: '#666' }}>Active Tenants</div>
                          </div>
                        }
                      >
                        <Row gutter={[16, 16]}>
                          {category.modules.map((module) => {
                            const subModules = getModuleSubModules(module.key, category.key);
                            return (
                              <Col xs={24} sm={12} lg={8} key={module.key}>
                                <Card 
                                  size="small" 
                                  hoverable
                                  style={{ height: '100%' }}
                                >
                                  <Card.Meta
                                    avatar={
                                      <Avatar 
                                        style={{ backgroundColor: category.color + '20', color: category.color }}
                                        icon={module.icon}
                                      />
                                    }
                                    title={module.name}
                                    description={
                                      <div>
                                        <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
                                          {module.modules} sub-modules
                                        </div>
                                        {subModules.length > 0 && (
                                          <List
                                            size="small"
                                            dataSource={subModules}
                                            renderItem={(item) => (
                                              <List.Item style={{ padding: '4px 0', border: 'none' }}>
                                                <Text style={{ fontSize: '11px', color: '#888' }}>
                                                  • {item}
                                                </Text>
                                              </List.Item>
                                            )}
                                            style={{ maxHeight: '200px', overflowY: 'auto' }}
                                          />
                                        )}
                                      </div>
                                    }
                                  />
                                </Card>
                              </Col>
                            );
                          })}
                        </Row>
                      </Card>
                    );
                  })()}
                </Col>
              </Row>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">Select an ERP category to view detailed module information</Text>
              </div>
            )
          },
          {
            key: 'tenants',
            label: 'Tenant Overview',
            children: (
              <Card 
                title="Tenant ERP Module Status" 
                extra={
                  <Button icon={<ArrowRightOutlined />} onClick={fetchERPData}>
                    Refresh
                  </Button>
                }
              >
                <Table
                  columns={tenantColumns}
                  dataSource={tenantModules}
                  rowKey="_id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tenants`
                  }}
                />
              </Card>
            )
          }
        ]}
      />
    </div>
  );
};

export default ERPManagement;
