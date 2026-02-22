#!/usr/bin/env node

/**
 * Route health checker for Supra-Admin Backend
 * Tests critical endpoints to ensure they're responding correctly
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const TIMEOUT = 5000;

// Critical routes to test
const criticalRoutes = [
  { path: '/health', method: 'GET', expectedStatus: 200, description: 'Health Check' },
  { path: '/api/auth/login', method: 'POST', expectedStatus: 400, description: 'Auth Login (should require body)' },
  { path: '/api/supra-admin/tenants', method: 'GET', expectedStatus: 401, description: 'Supra-Admin Tenants (should require auth)' },
  { path: '/api/supra-admin/dashboard', method: 'GET', expectedStatus: 401, description: 'Supra-Admin Dashboard (should require auth)' },
  { path: '/api/supra-admin/system-health', method: 'GET', expectedStatus: 401, description: 'System Health (should require auth)' },
  { path: '/api/supra-admin/tenants/erp-access', method: 'GET', expectedStatus: 401, description: 'ERP Access (should require auth)' },
  { path: '/api/supra-admin/reports', method: 'GET', expectedStatus: 401, description: 'Reports (should require auth)' },
  { path: '/api/supra-admin/settings', method: 'GET', expectedStatus: 401, description: 'Settings (should require auth)' },
  { path: '/api/supra-admin/infrastructure/servers', method: 'GET', expectedStatus: 401, description: 'Infrastructure (should require auth)' },
  { path: '/api/supra-admin/debug/system-info', method: 'GET', expectedStatus: 401, description: 'Debug Info (should require auth)' }
];

// Test results storage
const results = {
  passed: 0,
  failed: 0,
  errors: [],
  details: []
};

/**
 * Test a single route
 */
async function testRoute(route) {
  try {
    const url = `${BASE_URL}${route.path}`;
    const config = {
      method: route.method,
      url: url,
      timeout: TIMEOUT,
      validateStatus: () => true // Don't throw on any status code
    };

    const startTime = Date.now();
    const response = await axios(config);
    const responseTime = Date.now() - startTime;

    const result = {
      route: route.path,
      method: route.method,
      description: route.description,
      expectedStatus: route.expectedStatus,
      actualStatus: response.status,
      responseTime: responseTime,
      success: response.status === route.expectedStatus,
      responseSize: JSON.stringify(response.data).length
    };

    if (result.success) {
      results.passed++;
      console.log(`✅ ${route.method} ${route.path} - ${response.status} (${responseTime}ms)`);
    } else {
      results.failed++;
      console.log(`❌ ${route.method} ${route.path} - Expected ${route.expectedStatus}, got ${response.status} (${responseTime}ms)`);
      results.errors.push({
        route: route.path,
        expected: route.expectedStatus,
        actual: response.status,
        response: response.data
      });
    }

    results.details.push(result);

  } catch (error) {
    results.failed++;
    console.log(`💥 ${route.method} ${route.path} - Error: ${error.message}`);
    results.errors.push({
      route: route.path,
      error: error.message,
      type: 'network_error'
    });
  }
}

/**
 * Test server connectivity
 */
async function testServerConnectivity() {
  console.log('🔍 Testing server connectivity...');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: TIMEOUT });
    if (response.status === 200) {
      console.log('✅ Server is running and responding');
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Environment: ${response.data.environment}`);
      console.log(`   Uptime: ${Math.round(response.data.uptime)}s`);
      return true;
    } else {
      console.log(`❌ Server responded with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`💥 Server connectivity failed: ${error.message}`);
    return false;
  }
}

/**
 * Test database connectivity
 */
async function testDatabaseConnectivity() {
  console.log('\n🔍 Testing database connectivity...');
  
  try {
    // Try to access a route that requires database
    const response = await axios.get(`${BASE_URL}/api/supra-admin/tenants`, { 
      timeout: TIMEOUT,
      validateStatus: () => true 
    });
    
    if (response.status === 401) {
      console.log('✅ Database connectivity appears healthy (auth required)');
      return true;
    } else if (response.status === 500) {
      console.log('❌ Database connectivity issue detected');
      return false;
    } else {
      console.log(`⚠️  Unexpected response: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`💥 Database test failed: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runHealthChecks() {
  console.log('🚀 Supra-Admin Backend Health Check');
  console.log('===================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Timeout: ${TIMEOUT}ms\n`);

  // Test server connectivity first
  const serverOk = await testServerConnectivity();
  if (!serverOk) {
    console.log('\n❌ Server connectivity failed. Aborting further tests.');
    process.exit(1);
  }

  // Test database connectivity
  const dbOk = await testDatabaseConnectivity();

  // Test all critical routes
  console.log('\n🔍 Testing critical routes...');
  console.log('==============================');

  for (const route of criticalRoutes) {
    await testRoute(route);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n📊 Health Check Summary');
  console.log('=======================');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.errors.forEach(error => {
      if (error.type === 'network_error') {
        console.log(`   ${error.route}: ${error.error}`);
      } else {
        console.log(`   ${error.route}: Expected ${error.expected}, got ${error.actual}`);
      }
    });
  }

  // Performance analysis
  const avgResponseTime = results.details.reduce((sum, r) => sum + r.responseTime, 0) / results.details.length;
  const slowRoutes = results.details.filter(r => r.responseTime > 1000);
  
  console.log(`\n⚡ Performance Analysis:`);
  console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`);
  console.log(`   Slow Routes (>1s): ${slowRoutes.length}`);
  
  if (slowRoutes.length > 0) {
    console.log('   Slow Routes:');
    slowRoutes.forEach(route => {
      console.log(`     ${route.route}: ${route.responseTime}ms`);
    });
  }

  // Save detailed results
  const fs = require('fs');
  const reportData = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    serverConnectivity: serverOk,
    databaseConnectivity: dbOk,
    summary: {
      total: results.passed + results.failed,
      passed: results.passed,
      failed: results.failed,
      successRate: Math.round((results.passed / (results.passed + results.failed)) * 100)
    },
    performance: {
      avgResponseTime: Math.round(avgResponseTime),
      slowRoutes: slowRoutes.length
    },
    details: results.details,
    errors: results.errors
  };

  fs.writeFileSync('health-check-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n💾 Detailed report saved to health-check-report.json');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the health checks
runHealthChecks().catch(error => {
  console.error('💥 Health check failed:', error);
  process.exit(1);
});
