const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testRoutes() {
  console.log('🧪 Testing TWS Backend Routes...\n');
  
  const tests = [
    {
      name: 'Health Check',
      url: '/health',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'System Metrics',
      url: '/metrics',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Auth Login (should require credentials)',
      url: '/api/auth/login',
      method: 'POST',
      expectedStatus: 401,
      data: { email: 'test@test.com', password: 'test' }
    },
    {
      name: 'Users API (should require auth)',
      url: '/api/users',
      method: 'GET',
      expectedStatus: 401
    },
    {
      name: 'System Monitoring Health',
      url: '/api/systemMonitoring/health',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'TWS Admin Dashboard (should require auth)',
      url: '/api/twsAdmin/dashboard',
      method: 'GET',
      expectedStatus: 401
    },
    {
      name: 'Master ERP Templates (should require auth)',
      url: '/api/masterERP',
      method: 'GET',
      expectedStatus: 401
    },
    {
      name: 'Portal Workspaces (should require auth)',
      url: '/api/portal/workspaces',
      method: 'GET',
      expectedStatus: 401
    },
    {
      name: 'Portal Analytics (should require auth)',
      url: '/api/portal/analytics/metrics/test-workspace',
      method: 'GET',
      expectedStatus: 401
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      
      const config = {
        method: test.method,
        url: `${BASE_URL}${test.url}`,
        timeout: 5000,
        validateStatus: () => true // Don't throw on any status
      };

      if (test.data) {
        config.data = test.data;
        config.headers = { 'Content-Type': 'application/json' };
      }

      const response = await axios(config);
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: Status ${response.status} (Expected: ${test.expectedStatus})`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: Status ${response.status} (Expected: ${test.expectedStatus})`);
        failed++;
      }
      
      // Show response data for successful endpoints
      if (response.status === 200 && test.url.includes('/health') || test.url.includes('/metrics')) {
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
      failed++;
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All routes are working correctly!');
  } else {
    console.log('\n⚠️ Some routes need attention.');
  }
}

// Run the tests
testRoutes().catch(console.error);
