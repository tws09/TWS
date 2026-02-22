import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const messageResponseTime = new Trend('message_response_time');
const fileUploadTime = new Trend('file_upload_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    error_rate: ['rate<0.05'],         // Custom error rate below 5%
    message_response_time: ['p(95)<1000'], // Message operations below 1s
    file_upload_time: ['p(95)<5000'],      // File uploads below 5s
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test users
const testUsers = [
  { email: 'user1@test.com', password: 'password123' },
  { email: 'user2@test.com', password: 'password123' },
  { email: 'user3@test.com', password: 'password123' },
  { email: 'user4@test.com', password: 'password123' },
  { email: 'user5@test.com', password: 'password123' },
];

// Global variables
let authToken = '';
let chatId = '';
let userId = '';

export function setup() {
  // Setup: Create test user and get auth token
  const user = testUsers[0];
  
  // Register user
  const registerResponse = http.post(`${API_BASE}/auth/register`, JSON.stringify({
    email: user.email,
    password: user.password,
    name: 'Test User'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (registerResponse.status !== 201) {
    console.log('User registration failed, trying login...');
  }
  
  // Login
  const loginResponse = http.post(`${API_BASE}/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(loginResponse, {
    'login successful': (r) => r.status === 200,
    'login returns token': (r) => r.json('token') !== undefined,
  });
  
  const token = loginResponse.json('token');
  const userData = loginResponse.json('user');
  
  // Create a test chat
  const chatResponse = http.post(`${API_BASE}/messaging/chats`, JSON.stringify({
    name: 'Performance Test Chat',
    type: 'group',
    members: [userData._id]
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  
  check(chatResponse, {
    'chat creation successful': (r) => r.status === 201,
  });
  
  return {
    token,
    chatId: chatResponse.json('data._id'),
    userId: userData._id
  };
}

export default function(data) {
  authToken = data.token;
  chatId = data.chatId;
  userId = data.userId;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };
  
  // Test 1: Send message
  testSendMessage(headers);
  sleep(1);
  
  // Test 2: Get messages
  testGetMessages(headers);
  sleep(1);
  
  // Test 3: Get chat list
  testGetChats(headers);
  sleep(1);
  
  // Test 4: Analytics endpoints (admin only)
  if (Math.random() < 0.1) { // 10% chance
    testAnalytics(headers);
    sleep(1);
  }
  
  // Test 5: File upload (occasionally)
  if (Math.random() < 0.05) { // 5% chance
    testFileUpload(headers);
    sleep(2);
  }
  
  // Test 6: Health check
  testHealthCheck();
  sleep(0.5);
}

function testSendMessage(headers) {
  const startTime = Date.now();
  
  const messageData = {
    content: `Performance test message ${Date.now()}`,
    type: 'text'
  };
  
  const response = http.post(
    `${API_BASE}/messaging/chats/${chatId}/messages`,
    JSON.stringify(messageData),
    { headers }
  );
  
  const duration = Date.now() - startTime;
  messageResponseTime.add(duration);
  
  const success = check(response, {
    'message sent successfully': (r) => r.status === 201,
    'message response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(!success);
}

function testGetMessages(headers) {
  const response = http.get(
    `${API_BASE}/messaging/chats/${chatId}/messages?limit=20`,
    { headers }
  );
  
  const success = check(response, {
    'messages retrieved successfully': (r) => r.status === 200,
    'messages response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!success);
}

function testGetChats(headers) {
  const response = http.get(`${API_BASE}/messaging/chats`, { headers });
  
  const success = check(response, {
    'chats retrieved successfully': (r) => r.status === 200,
    'chats response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  errorRate.add(!success);
}

function testAnalytics(headers) {
  const analyticsEndpoints = [
    '/analytics/dashboard',
    '/analytics/active-chats?timeframe=24h',
    '/analytics/user-activity?timeframe=24h',
    '/analytics/messages-by-hour?days=7'
  ];
  
  const endpoint = analyticsEndpoints[Math.floor(Math.random() * analyticsEndpoints.length)];
  const response = http.get(`${API_BASE}${endpoint}`, { headers });
  
  const success = check(response, {
    'analytics endpoint accessible': (r) => r.status === 200 || r.status === 403, // 403 is OK for non-admin users
    'analytics response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  errorRate.add(!success);
}

function testFileUpload(headers) {
  const startTime = Date.now();
  
  // Create a small test file
  const testFileContent = 'This is a test file for performance testing.';
  const boundary = '----WebKitFormBoundary' + Math.random().toString(16);
  
  const formData = `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="test.txt"\r\n` +
    `Content-Type: text/plain\r\n\r\n` +
    `${testFileContent}\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="chatId"\r\n\r\n` +
    `${chatId}\r\n` +
    `--${boundary}--\r\n`;
  
  const uploadHeaders = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': `multipart/form-data; boundary=${boundary}`
  };
  
  const response = http.post(
    `${API_BASE}/files/upload`,
    formData,
    { headers: uploadHeaders }
  );
  
  const duration = Date.now() - startTime;
  fileUploadTime.add(duration);
  
  const success = check(response, {
    'file upload successful': (r) => r.status === 201,
    'file upload time < 5s': (r) => r.timings.duration < 5000,
  });
  
  errorRate.add(!success);
}

function testHealthCheck() {
  const response = http.get(`${BASE_URL}/health`);
  
  const success = check(response, {
    'health check successful': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  errorRate.add(!success);
}

export function teardown(data) {
  // Cleanup: Delete test chat and user
  const headers = {
    'Authorization': `Bearer ${data.token}`
  };
  
  // Delete test chat
  http.delete(`${API_BASE}/messaging/chats/${data.chatId}`, { headers });
  
  console.log('Performance test completed');
}
