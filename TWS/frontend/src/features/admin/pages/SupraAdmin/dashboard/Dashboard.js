import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, Select, DatePicker } from 'antd';
import { 
  UserOutlined, 
  MessageOutlined, 
  TeamOutlined, 
  FileOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [dateRange, setDateRange] = useState([moment().subtract(7, 'days'), moment()]);

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardResponse, messagesResponse, userActivityResponse] = await Promise.all([
        axios.get('/api/analytics/dashboard'),
        axios.get(`/api/analytics/messages-by-hour?days=7`),
        axios.get(`/api/analytics/user-activity?timeframe=${timeframe}`)
      ]);

      setDashboardData({
        dashboard: dashboardResponse.data.data,
        messages: messagesResponse.data.data,
        userActivity: userActivityResponse.data.data
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMessagesByHour = (messagesByHour) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
      const hourData = messagesByHour.find(item => item._id.hour === hour);
      return {
        hour: `${hour}:00`,
        count: hourData ? hourData.count : 0
      };
    });
  };

  const formatDailyMessages = (dailyMessages) => {
    return dailyMessages.map(item => ({
      date: `${item._id.month}/${item._id.day}`,
      count: item.count
    }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading dashboard data...</p>
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
      />
    );
  }

  const { dashboard, messages, userActivity } = dashboardData;

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard Overview</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Select
            value={timeframe}
            onChange={setTimeframe}
            style={{ width: 120 }}
          >
            <Option value="1h">Last Hour</Option>
            <Option value="24h">Last 24h</Option>
            <Option value="7d">Last 7 days</Option>
            <Option value="30d">Last 30 days</Option>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={dashboard.overview.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Chats"
              value={dashboard.overview.totalChats}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Messages"
              value={dashboard.overview.totalMessages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Users (24h)"
              value={dashboard.overview.activeUsers24h}
              prefix={<UserOutlined />}
              suffix={<ArrowUpOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Growth Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="New Users (7d)"
              value={dashboard.growth.newUsers7d}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="New Chats (7d)"
              value={dashboard.growth.newChats7d}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Messages (7d)"
              value={dashboard.growth.messages7d}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Messages by Hour (Last 24h)" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatMessagesByHour(messages.messagesByHour)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1890ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Daily Messages (Last 7 days)" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatDailyMessages(messages.dailyMessages)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* User Activity Summary */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="User Role Distribution">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={userActivity.userRoleDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#722ed1" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Most Active Users">
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {userActivity.mostActiveUsers.map((user, index) => (
                <div key={user._id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 0',
                  borderBottom: index < userActivity.mostActiveUsers.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <span>{user.name || user.email}</span>
                  <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                    {user.messageCount} messages
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
