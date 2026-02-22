import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const messageSendRate = new Rate('message_send_success_rate');
const messageReceiveRate = new Rate('message_receive_success_rate');

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
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
    message_send_success_rate: ['rate>0.95'], // 95% message send success rate
    message_receive_success_rate: ['rate>0.95'], // 95% message receive success rate
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const API_URL = `${BASE_URL}/api`;

// Test users
const testUsers = [
  { email: 'user1@test.com', password: 'password123' },
  { email: 'user2@test.com', password: 'password123' },
  { email: 'user3@test.com', password: 'password123' },
  { email: 'user4@test.com', password: 'password123' },
  { email: 'user5@test.com', password: 'password123' },
];

// Global variables
let authTokens = {};
let chatIds = [];

export function setup() {
  console.log('Setting up message throughput test...');
  
  // Login all test users and get auth tokens
  for (let user of testUsers) {
    const loginResponse = http.post(`${API_URL}/auth/login`, JSON.stringify({
      email: user.email,
      password: user.password
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (loginResponse.status === 200) {
      const loginData = JSON.parse(loginResponse.body);
      authTokens[user.email] = loginData.data.accessToken;
    }
  }
  
  // Create test chats
  const user1Token = authTokens[testUsers[0].email];
  if (user1Token) {
    const chatResponse = http.post(`${API_URL}/messaging/chats`, JSON.stringify({
      name: `Load Test Chat ${Date.now()}`,
      type: 'group',
      description: 'Load test chat',
      members: [testUsers[1].email, testUsers[2].email, testUsers[3].email, testUsers[4].email]
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
    });
    
    if (chatResponse.status === 201) {
      const chatData = JSON.parse(chatResponse.body);
      chatIds.push(chatData.data.chat._id);
    }
  }
  
  return { authTokens, chatIds };
}

export default function(data) {
  const userIndex = __VU % testUsers.length;
  const user = testUsers[userIndex];
  const token = data.authTokens[user.email];
  const chatId = data.chatIds[0];
  
  if (!token || !chatId) {
    console.log(`User ${user.email} not authenticated or no chat available`);
    return;
  }
  
  // Send message
  const messagePayload = {
    content: `Load test message from VU ${__VU} at ${new Date().toISOString()}`,
    type: 'text'
  };
  
  const sendResponse = http.post(`${API_URL}/messaging/chats/${chatId}/messages`, 
    JSON.stringify(messagePayload), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  
  const sendSuccess = check(sendResponse, {
    'message sent successfully': (r) => r.status === 201,
    'message send response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  messageSendRate.add(sendSuccess);
  
  // Get messages (simulate receiving)
  const getResponse = http.get(`${API_URL}/messaging/chats/${chatId}/messages?limit=10`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  
  const receiveSuccess = check(getResponse, {
    'messages retrieved successfully': (r) => r.status === 200,
    'message receive response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  messageReceiveRate.add(receiveSuccess);
  
  // Simulate user reading time
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

export function teardown(data) {
  console.log('Cleaning up message throughput test...');
  
  // Clean up test chats
  for (let chatId of data.chatIds) {
    const user1Token = data.authTokens[testUsers[0].email];
    if (user1Token) {
      http.del(`${API_URL}/messaging/chats/${chatId}`, null, {
        headers: {
          'Authorization': `Bearer ${user1Token}`
        },
      });
    }
  }
}
