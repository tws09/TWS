// k6 Load Testing Suite for Messaging Platform
// Comprehensive load testing scenarios for staging validation

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const messageResponseTime = new Trend('message_response_time');
const chatResponseTime = new Trend('chat_response_time');
const fileResponseTime = new Trend('file_response_time');
const messagesSent = new Counter('messages_sent');
const chatsCreated = new Counter('chats_created');
const filesUploaded = new Counter('files_uploaded');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'https://staging-api.yourdomain.com';
const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || 'loadtest@example.com';
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'loadtestpass';

// Global variables
let authToken = '';
let chatIds = [];

// Test scenarios configuration
export let options = {
  scenarios: {
    // Normal load scenario
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up to 50 users
        { duration: '5m', target: 50 },   // Stay at 50 users
        { duration: '2m', target: 100 },  // Ramp up to 100 users
        { duration: '5m', target: 100 },  // Stay at 100 users
        { duration: '2m', target: 0 },    // Ramp down
      ],
      exec: 'normalLoadTest',
    },
    
    // Stress test scenario
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '2m', target: 400 },
        { duration: '2m', target: 500 },
        { duration: '5m', target: 500 },
        { duration: '2m', target: 0 },
      ],
      exec: 'stressTest',
    },
    
    // Spike test scenario
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },   // Normal load
        { duration: '30s', target: 1000 }, // Spike to 1000 users
        { duration: '1m', target: 100 },   // Back to normal
        { duration: '30s', target: 1000 }, // Another spike
        { duration: '1m', target: 100 },   // Back to normal
      ],
      exec: 'spikeTest',
    },
  },
  
  thresholds: {
    // Response time thresholds
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    message_response_time: ['p(95)<300', 'p(99)<500'],
    chat_response_time: ['p(95)<200', 'p(99)<400'],
    file_response_time: ['p(95)<2000', 'p(99)<5000'],
    
    // Error rate thresholds
    http_req_failed: ['rate<0.01'], // Less than 1% error rate
    errors: ['rate<0.01'],
    
    // Throughput thresholds
    messages_sent: ['count>1000'],
    chats_created: ['count>100'],
    files_uploaded: ['count>50'],
  },
};

// Setup function - runs once at the beginning
export function setup() {
  console.log('🚀 Starting k6 load test setup...');
  
  // Login and get auth token
  const loginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (loginResponse.status === 200) {
    const data = JSON.parse(loginResponse.body);
    console.log('✅ Authentication successful');
    return data.data.token;
  } else {
    console.error('❌ Authentication failed:', loginResponse.body);
    return null;
  }
}

// Normal load test scenario
export function normalLoadTest(token) {
  authToken = token;
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  // Test message sending
  const messageStartTime = Date.now();
  const messageResponse = http.post(`${BASE_URL}/api/messaging/chats/test-chat-id/messages`, 
    JSON.stringify({
      content: `Normal load test message ${Math.random()}`,
      type: 'text'
    }), { headers });
  
  const messageDuration = Date.now() - messageStartTime;
  messageResponseTime.add(messageDuration);
  
  const messageCheck = check(messageResponse, {
    'message sent successfully': (r) => r.status === 201,
    'message response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  if (messageCheck) {
    messagesSent.add(1);
  }
  errorRate.add(!messageCheck);

  // Test message retrieval
  const chatStartTime = Date.now();
  const messagesResponse = http.get(`${BASE_URL}/api/messaging/chats/test-chat-id/messages`, 
    { headers });
  
  const chatDuration = Date.now() - chatStartTime;
  chatResponseTime.add(chatDuration);
  
  const messagesCheck = check(messagesResponse, {
    'messages retrieved successfully': (r) => r.status === 200,
    'messages response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  errorRate.add(!messagesCheck);

  sleep(1);
}

// Stress test scenario
export function stressTest(token) {
  authToken = token;
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  // Test concurrent operations
  const responses = http.batch([
    ['POST', `${BASE_URL}/api/messaging/chats/stress-chat-1/messages`, 
     JSON.stringify({ content: 'Stress test message 1', type: 'text' }), { headers }],
    ['POST', `${BASE_URL}/api/messaging/chats/stress-chat-2/messages`, 
     JSON.stringify({ content: 'Stress test message 2', type: 'text' }), { headers }],
    ['GET', `${BASE_URL}/api/messaging/chats/stress-chat-1/messages`, null, { headers }],
    ['GET', `${BASE_URL}/api/messaging/chats/stress-chat-2/messages`, null, { headers }],
  ]);

  const checks = [
    check(responses[0], { 'stress message 1 sent': (r) => r.status === 201 }),
    check(responses[1], { 'stress message 2 sent': (r) => r.status === 201 }),
    check(responses[2], { 'stress messages 1 retrieved': (r) => r.status === 200 }),
    check(responses[3], { 'stress messages 2 retrieved': (r) => r.status === 200 }),
  ];

  // Count successful operations
  if (checks[0] && checks[1]) {
    messagesSent.add(2);
  }
  
  errorRate.add(!checks.every(c => c));

  sleep(0.5);
}

// Spike test scenario
export function spikeTest(token) {
  authToken = token;
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
  };

  // Test rapid chat listing during spikes
  const response = http.get(`${BASE_URL}/api/messaging/chats`, { headers });
  
  const checkResult = check(response, {
    'chats retrieved during spike': (r) => r.status === 200,
    'spike response time acceptable': (r) => r.timings.duration < 2000,
  });
  
  errorRate.add(!checkResult);

  sleep(0.1); // Very short sleep for spike testing
}

// File upload test
export function fileUploadTest(token) {
  authToken = token;
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
  };

  // Create a test file content
  const fileContent = `Test file content for load testing ${Math.random()}`;
  const fileName = `test-file-${Math.random()}.txt`;
  
  // Simulate file upload (in real scenario, you'd use FormData)
  const fileStartTime = Date.now();
  const uploadResponse = http.post(`${BASE_URL}/api/files/upload`, 
    JSON.stringify({
      filename: fileName,
      content: fileContent,
      chatId: 'test-chat-id'
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  
  const fileDuration = Date.now() - fileStartTime;
  fileResponseTime.add(fileDuration);
  
  const uploadCheck = check(uploadResponse, {
    'file uploaded successfully': (r) => r.status === 201,
    'file upload response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  
  if (uploadCheck) {
    filesUploaded.add(1);
  }
  errorRate.add(!uploadCheck);

  sleep(2);
}

// Chat creation test
export function chatCreationTest(token) {
  authToken = token;
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  const chatStartTime = Date.now();
  const chatResponse = http.post(`${BASE_URL}/api/messaging/chats`, 
    JSON.stringify({
      name: `Load Test Chat ${Math.random()}`,
      type: 'group',
      members: []
    }), { headers });
  
  const chatDuration = Date.now() - chatStartTime;
  chatResponseTime.add(chatDuration);
  
  const chatCheck = check(chatResponse, {
    'chat created successfully': (r) => r.status === 201,
    'chat creation response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  if (chatCheck) {
    chatsCreated.add(1);
    const chatData = JSON.parse(chatResponse.body);
    chatIds.push(chatData.data._id);
  }
  errorRate.add(!chatCheck);

  sleep(1);
}

// Message threading test
export function threadingTest(token) {
  authToken = token;
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  // First send a parent message
  const parentResponse = http.post(`${BASE_URL}/api/messaging/chats/test-chat-id/messages`, 
    JSON.stringify({
      content: `Parent message for threading test ${Math.random()}`,
      type: 'text'
    }), { headers });
  
  if (parentResponse.status === 201) {
    const parentData = JSON.parse(parentResponse.body);
    const parentMessageId = parentData.data._id;
    
    // Then reply to create a thread
    const threadResponse = http.post(`${BASE_URL}/api/messaging/messages/${parentMessageId}/reply`, 
      JSON.stringify({
        content: `Thread reply ${Math.random()}`,
        type: 'text'
      }), { headers });
    
    const threadCheck = check(threadResponse, {
      'thread reply created successfully': (r) => r.status === 201,
      'thread response time < 400ms': (r) => r.timings.duration < 400,
    });
    
    errorRate.add(!threadCheck);
  }

  sleep(1);
}

// Search functionality test
export function searchTest(token) {
  authToken = token;
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
  };

  const searchStartTime = Date.now();
  const searchResponse = http.get(`${BASE_URL}/api/messaging/search?q=test`, { headers });
  
  const searchDuration = Date.now() - searchStartTime;
  
  const searchCheck = check(searchResponse, {
    'search completed successfully': (r) => r.status === 200,
    'search response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(!searchCheck);

  sleep(2);
}

// Performance monitoring test
export function performanceMonitoringTest(token) {
  authToken = token;
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
  };

  // Test various endpoints for performance monitoring
  const endpoints = [
    '/api/messaging/chats',
    '/api/messaging/chats/test-chat-id/messages',
    '/api/files?chatId=test-chat-id',
    '/api/users/profile'
  ];

  endpoints.forEach(endpoint => {
    const startTime = Date.now();
    const response = http.get(`${BASE_URL}${endpoint}`, { headers });
    const duration = Date.now() - startTime;
    
    check(response, {
      [`${endpoint} performance check`]: (r) => r.status === 200 && duration < 1000,
    });
  });

  sleep(3);
}

// Teardown function - runs once at the end
export function teardown(data) {
  console.log('🏁 Load test completed');
  console.log(`📊 Final metrics:`);
  console.log(`- Messages sent: ${messagesSent.count}`);
  console.log(`- Chats created: ${chatsCreated.count}`);
  console.log(`- Files uploaded: ${filesUploaded.count}`);
  console.log(`- Error rate: ${errorRate.count}`);
}

// Utility functions for test data generation
function generateRandomMessage() {
  const messages = [
    'Hello, this is a load test message!',
    'Testing message delivery under load',
    'Load test message with random content',
    'Performance testing in progress',
    'Message for stress testing scenarios'
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

function generateRandomChatName() {
  const prefixes = ['Test', 'Load', 'Stress', 'Performance', 'Validation'];
  const suffixes = ['Chat', 'Room', 'Channel', 'Group', 'Team'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${suffix} ${Math.floor(Math.random() * 1000)}`;
}

// Export test scenarios for different environments
export const scenarios = {
  staging: {
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '2m', target: 10 },
        { duration: '1m', target: 0 },
      ],
      exec: 'normalLoadTest',
    }
  },
  
  production: {
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 100 },
        { duration: '10m', target: 100 },
        { duration: '5m', target: 0 },
      ],
      exec: 'normalLoadTest',
    }
  }
};
