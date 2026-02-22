/**
 * Script to test login API endpoint directly
 * This simulates a real API call to the login endpoint
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');
const path = require('path');

// Load .env file from backend directory
const envPath = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

const CO_FOUNDER_EMAIL = '14modules@gmail.com';
const DEFAULT_PASSWORD = 'CoFounder@2024';

// Get API URL from environment or use default
const API_URL = process.env.REACT_APP_API_URL || process.env.API_URL || 'http://localhost:5000';

async function testLoginAPI() {
  try {
    console.log('🧪 Testing Login API Endpoint...');
    console.log('');
    console.log('API URL:', API_URL);
    console.log('Endpoint:', `${API_URL}/api/auth/login`);
    console.log('');

    // Test 1: Health check
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 1: Backend Health Check');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const healthResponse = await makeRequest('GET', `${API_URL}/health`);
      console.log('✅ Backend is running');
      console.log('  Status:', healthResponse.status);
      console.log('  Response:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend is not accessible');
      console.log('  Error:', error.message);
      if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
        console.log('');
        console.log('  💡 Backend server is not running!');
        console.log('  Please start the backend server:');
        console.log('    cd backend');
        console.log('    npm start');
      }
      console.log('');
      return;
    }
    console.log('');

    // Test 2: Login with correct credentials
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 2: Login with Correct Credentials');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', CO_FOUNDER_EMAIL);
    console.log('Password:', '*'.repeat(DEFAULT_PASSWORD.length));
    console.log('');

    try {
      const loginResponse = await makeRequest('POST', `${API_URL}/api/auth/login`, {
        email: CO_FOUNDER_EMAIL,
        password: DEFAULT_PASSWORD
      });

      console.log('✅ Login successful!');
      console.log('  Status:', loginResponse.status);
      console.log('  Success:', loginResponse.data.success);
      console.log('  Message:', loginResponse.data.message);
      
      if (loginResponse.data.data) {
        console.log('  User:', loginResponse.data.data.user?.email);
        console.log('  Role:', loginResponse.data.data.user?.role);
        console.log('  Has Access Token:', !!loginResponse.data.data.accessToken);
        console.log('  Has Refresh Token:', !!loginResponse.data.data.refreshToken);
      }
    } catch (error) {
      console.log('❌ Login failed!');
      console.log('  Status:', error.status);
      console.log('  Message:', error.data?.message || error.message);
      console.log('  Response:', JSON.stringify(error.data, null, 2));
      
      if (error.status === 401) {
        console.log('');
        console.log('  💡 Invalid credentials or user not found');
        console.log('  Check:');
        console.log('    1. User exists in database');
        console.log('    2. Password is correct');
        console.log('    3. User status is active');
      } else if (error.status === 400) {
        console.log('');
        console.log('  💡 Validation error');
        console.log('  Errors:', error.data?.errors);
      } else if (error.status === 503) {
        console.log('');
        console.log('  💡 Database connection error');
        console.log('  Check MongoDB connection');
      }
    }
    console.log('');

    // Test 3: Login with lowercase email
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 3: Login with Lowercase Email');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const loginResponse = await makeRequest('POST', `${API_URL}/api/auth/login`, {
        email: CO_FOUNDER_EMAIL.toLowerCase(),
        password: DEFAULT_PASSWORD
      });

      console.log('✅ Login successful with lowercase email!');
      console.log('  Status:', loginResponse.status);
    } catch (error) {
      console.log('❌ Login failed with lowercase email');
      console.log('  Status:', error.status);
      console.log('  Message:', error.data?.message);
    }
    console.log('');

    // Test 4: Login with wrong password
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 4: Login with Wrong Password (Expected to Fail)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const loginResponse = await makeRequest('POST', `${API_URL}/api/auth/login`, {
        email: CO_FOUNDER_EMAIL,
        password: 'WrongPassword123!'
      });

      console.log('⚠️  Login succeeded with wrong password (unexpected!)');
    } catch (error) {
      if (error.status === 401) {
        console.log('✅ Correctly rejected wrong password');
        console.log('  Status:', error.status);
        console.log('  Message:', error.data?.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Next steps:');
    console.log('  1. If backend is not running, start it: cd backend && npm start');
    console.log('  2. If login fails, check backend logs for detailed error messages');
    console.log('  3. Verify backend is running on the correct port');
    console.log('  4. Check CORS configuration if calling from frontend');
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Helper function to make HTTP requests
function makeRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    };

    const req = client.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              status: res.statusCode,
              data: parsedData
            });
          } else {
            reject({
              status: res.statusCode,
              data: parsedData,
              message: parsedData.message || 'Request failed'
            });
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              status: res.statusCode,
              data: responseData
            });
          } else {
            reject({
              status: res.statusCode,
              data: responseData,
              message: 'Failed to parse response'
            });
          }
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Run the test
testLoginAPI();

