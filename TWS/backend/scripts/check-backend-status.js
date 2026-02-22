/**
 * Script to check if backend server is running and accessible
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const API_URL = process.env.REACT_APP_API_URL || process.env.API_URL || 'http://localhost:5000';

function makeRequest(method, url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      timeout: 5000
    };

    const req = client.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsedData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
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

    req.end();
  });
}

async function checkBackendStatus() {
  console.log('🔍 Checking Backend Server Status...');
  console.log('');
  console.log('API URL:', API_URL);
  console.log('');

  // Test 1: Health endpoint
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 1: Backend Health Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const response = await makeRequest('GET', `${API_URL}/health`);
    console.log('✅ Backend is running!');
    console.log('  Status:', response.status);
    console.log('  Response:', response.data);
    console.log('');
  } catch (error) {
    console.log('❌ Backend is NOT running or NOT accessible!');
    console.log('  Error:', error.message);
    console.log('  Code:', error.code);
    console.log('');
    console.log('💡 Solutions:');
    console.log('  1. Start the backend server:');
    console.log('     cd backend');
    console.log('     npm start');
    console.log('');
    console.log('  2. Check if backend is on a different port:');
    console.log('     - Default port: 5000');
    console.log('     - Check backend/.env for PORT setting');
    console.log('');
    console.log('  3. Verify backend is listening:');
    console.log('     - Check backend console for startup messages');
    console.log('     - Look for: "TWS Backend Server running on port 5000"');
    console.log('');
    return false;
  }

  // Test 2: Login endpoint (should return validation error, not connection error)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 2: Login Endpoint Accessibility');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const http = require('http');
    const { URL } = require('url');
    
    const urlObj = new URL(`${API_URL}/api/auth/login`);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          // Even if we get a 400/401, the endpoint is accessible
          if (res.statusCode === 400 || res.statusCode === 401) {
            console.log('✅ Login endpoint is accessible!');
            console.log('  Status:', res.statusCode);
            console.log('  (This is expected - endpoint requires valid credentials)');
            resolve();
          } else {
            reject(new Error(`Unexpected status: ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(JSON.stringify({ email: '', password: '' }));
      req.end();
    });
  } catch (error) {
    console.log('❌ Login endpoint is NOT accessible!');
    console.log('  Error:', error.message);
    console.log('');
    return false;
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Backend Status: RUNNING AND ACCESSIBLE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Try logging in again from the frontend');
  console.log('  2. Check browser console for detailed error messages');
  console.log('  3. Check backend logs for login attempts');
  console.log('');
  
  return true;
}

checkBackendStatus().catch(console.error);

