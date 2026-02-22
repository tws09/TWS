import React from 'react';
import { Skeleton, Card, Row, Col, Statistic } from 'antd';

// Dashboard Skeleton Loader
export const DashboardSkeleton = () => (
  <div style={{ padding: '24px' }}>
    {/* Header Skeleton */}
    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Skeleton.Input active size="large" style={{ width: 300, marginBottom: '8px' }} />
        <Skeleton.Input active size="small" style={{ width: 200 }} />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Skeleton.Button active size="default" />
        <Skeleton.Button active size="default" />
        <Skeleton.Button active size="default" />
      </div>
    </div>

    {/* Real-time Metrics Skeleton */}
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={8}>
        <Card>
          <Skeleton active>
            <Statistic title="Loading..." value="..." />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Skeleton active>
            <Statistic title="Loading..." value="..." />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Skeleton active>
            <Statistic title="Loading..." value="..." />
          </Skeleton>
        </Card>
      </Col>
    </Row>

    {/* Key Metrics Skeleton */}
    <Row gutter={[12, 12]} style={{ marginBottom: '20px' }}>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Skeleton active>
            <Statistic title="Loading..." value="..." />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Skeleton active>
            <Statistic title="Loading..." value="..." />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Skeleton active>
            <Statistic title="Loading..." value="..." />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Skeleton active>
            <Statistic title="Loading..." value="..." />
          </Skeleton>
        </Card>
      </Col>
    </Row>

    {/* System Health and Recent Activity Skeleton */}
    <Row gutter={[12, 12]} style={{ marginBottom: '20px' }}>
      <Col xs={24} lg={12}>
        <Card size="small" title="System Health">
          <Skeleton active>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0f0f0', margin: '0 auto 8px' }} />
                <div>Uptime</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0f0f0', margin: '0 auto 8px' }} />
                <div>Reliability</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>Response Time</div>
              <div>CPU Usage</div>
              <div>Memory</div>
            </div>
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card size="small" title="Recent Activity">
          <Skeleton active>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0f0f0', marginRight: '12px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '16px', background: '#f0f0f0', marginBottom: '4px', borderRadius: '4px' }} />
                  <div style={{ height: '12px', background: '#f0f0f0', width: '60%', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </Skeleton>
        </Card>
      </Col>
    </Row>

    {/* Charts Skeleton */}
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} lg={16}>
        <Card title="Revenue Trend">
          <Skeleton active>
            <div style={{ height: '300px', background: '#f0f0f0', borderRadius: '4px' }} />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card title="Plan Distribution">
          <Skeleton active>
            <div style={{ height: '300px', background: '#f0f0f0', borderRadius: '50%', width: '200px', margin: '0 auto' }} />
          </Skeleton>
        </Card>
      </Col>
    </Row>

    {/* Top Tenants Skeleton */}
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} lg={12}>
        <Card title="Top Performing Tenants">
          <Skeleton active>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0f0f0', marginRight: '12px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '16px', background: '#f0f0f0', marginBottom: '4px', borderRadius: '4px' }} />
                  <div style={{ height: '12px', background: '#f0f0f0', width: '80%', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="Usage Analytics">
          <Skeleton active>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i}>
                  <div style={{ height: '16px', background: '#f0f0f0', marginBottom: '4px', borderRadius: '4px' }} />
                  <div style={{ height: '20px', background: '#f0f0f0', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          </Skeleton>
        </Card>
      </Col>
    </Row>

    {/* Tenants Table Skeleton */}
    <Card title="Tenant Management">
      <Skeleton active>
        <div style={{ height: '400px', background: '#f0f0f0', borderRadius: '4px' }} />
      </Skeleton>
    </Card>
  </div>
);

// Table Skeleton Loader
export const TableSkeleton = ({ columns = 5, rows = 5 }) => (
  <div>
    <Skeleton active>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ height: '40px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: '32px', background: '#f0f0f0', borderRadius: '4px', flex: 1 }} />
          ))}
        </div>
      </div>
    </Skeleton>
    
    <Skeleton active>
      <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px' }}>
        {/* Table Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', padding: '12px' }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: '16px', background: '#f0f0f0', margin: '0 8px', borderRadius: '4px' }} />
          ))}
        </div>
        
        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', padding: '12px' }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} style={{ flex: 1, height: '14px', background: '#f0f0f0', margin: '0 8px', borderRadius: '4px' }} />
            ))}
          </div>
        ))}
      </div>
    </Skeleton>
  </div>
);

// Card Skeleton Loader
export const CardSkeleton = ({ title = true, actions = false }) => (
  <Card 
    title={title ? <Skeleton.Input active size="small" style={{ width: 150 }} /> : null}
    actions={actions ? [
      <Skeleton.Button active size="small" />,
      <Skeleton.Button active size="small" />,
      <Skeleton.Button active size="small" />
    ] : null}
  >
    <Skeleton active>
      <div style={{ height: '200px', background: '#f0f0f0', borderRadius: '4px' }} />
    </Skeleton>
  </Card>
);

// Form Skeleton Loader
export const FormSkeleton = ({ fields = 4 }) => (
  <div>
    <Skeleton active>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ marginBottom: '16px' }}>
          <div style={{ height: '16px', background: '#f0f0f0', marginBottom: '8px', borderRadius: '4px', width: '30%' }} />
          <div style={{ height: '40px', background: '#f0f0f0', borderRadius: '4px' }} />
        </div>
      ))}
    </Skeleton>
    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
      <Skeleton.Button active size="default" />
      <Skeleton.Button active size="default" />
    </div>
  </div>
);

export default {
  DashboardSkeleton,
  TableSkeleton,
  CardSkeleton,
  FormSkeleton
};
