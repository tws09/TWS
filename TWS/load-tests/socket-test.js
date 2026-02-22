import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const connectionErrorRate = new Rate('connection_error_rate');
const messageLatency = new Trend('message_latency');
const connectionDuration = new Trend('connection_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 concurrent connections
    { duration: '3m', target: 50 },  // Stay at 50 connections
    { duration: '1m', target: 100 }, // Ramp up to 100 connections
    { duration: '3m', target: 100 }, // Stay at 100 connections
    { duration: '1m', target: 0 },   // Ramp down to 0 connections
  ],
  thresholds: {
    connection_error_rate: ['rate<0.05'], // Connection error rate below 5%
    message_latency: ['p(95)<100'],       // 95% of messages below 100ms latency
    connection_duration: ['p(95)<30000'], // 95% of connections last at least 30s
  },
};

const WS_URL = __ENV.WS_URL || 'ws://localhost:5000';
const API_BASE = __ENV.API_BASE || 'http://localhost:5000/api';

// Test data
const testUsers = [
  { email: 'socketuser1@test.com', password: 'password123' },
  { email: 'socketuser2@test.com', password: 'password123' },
  { email: 'socketuser3@test.com', password: 'password123' },
  { email: 'socketuser4@test.com', password: 'password123' },
  { email: 'socketuser5@test.com', password: 'password123' },
];

export function setup() {
  // Setup: Create test users and get auth tokens
  const tokens = [];
  
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    
    // Register user
    const registerResponse = http.post(`${API_BASE}/auth/register`, JSON.stringify({
      email: user.email,
      password: user.password,
      name: `Socket Test User ${i + 1}`
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    // Login
    const loginResponse = http.post(`${API_BASE}/auth/login`, JSON.stringify({
      email: user.email,
      password: user.password
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (loginResponse.status === 200) {
      tokens.push({
        token: loginResponse.json('token'),
        user: loginResponse.json('user')
      });
    }
  }
  
  // Create a test chat
  if (tokens.length > 0) {
    const chatResponse = http.post(`${API_BASE}/messaging/chats`, JSON.stringify({
      name: 'Socket Test Chat',
      type: 'group',
      members: tokens.map(t => t.user._id)
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens[0].token}`
      },
    });
    
    if (chatResponse.status === 201) {
      return {
        tokens,
        chatId: chatResponse.json('data._id')
      };
    }
  }
  
  return { tokens: [], chatId: null };
}

export default function(data) {
  if (data.tokens.length === 0 || !data.chatId) {
    console.log('Setup failed, skipping test');
    return;
  }
  
  // Select a random user
  const userData = data.tokens[Math.floor(Math.random() * data.tokens.length)];
  const startTime = Date.now();
  
  // Connect to WebSocket
  const url = `${WS_URL}?token=${userData.token}`;
  const res = ws.connect(url, {}, function (socket) {
    let messageCount = 0;
    const maxMessages = 10;
    
    socket.on('open', () => {
      console.log('WebSocket connection opened');
      
      // Join the test chat
      socket.send(JSON.stringify({
        type: 'join_chat',
        chatId: data.chatId
      }));
    });
    
    socket.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        messageCount++;
        
        // Measure message latency
        if (message.timestamp) {
          const latency = Date.now() - message.timestamp;
          messageLatency.add(latency);
        }
        
        // Send a response message occasionally
        if (Math.random() < 0.3 && messageCount < maxMessages) {
          const responseMessage = {
            type: 'send_message',
            chatId: data.chatId,
            content: `Response message ${messageCount}`,
            timestamp: Date.now()
          };
          
          socket.send(JSON.stringify(responseMessage));
        }
        
      } catch (e) {
        console.log('Error parsing message:', e);
      }
    });
    
    socket.on('error', (e) => {
      console.log('WebSocket error:', e);
      connectionErrorRate.add(1);
    });
    
    socket.on('close', () => {
      console.log('WebSocket connection closed');
      const duration = Date.now() - startTime;
      connectionDuration.add(duration);
    });
    
    // Keep connection alive and send periodic messages
    const interval = setInterval(() => {
      if (messageCount < maxMessages) {
        const message = {
          type: 'send_message',
          chatId: data.chatId,
          content: `Test message ${messageCount + 1}`,
          timestamp: Date.now()
        };
        
        socket.send(JSON.stringify(message));
        messageCount++;
      } else {
        clearInterval(interval);
        socket.close();
      }
    }, 2000);
    
    // Close connection after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      socket.close();
    }, 30000);
  });
  
  const success = check(res, {
    'WebSocket connection successful': (r) => r && r.status === 101,
    'Connection established quickly': (r) => r && r.timings.duration < 1000,
  });
  
  connectionErrorRate.add(!success);
  
  sleep(1);
}

export function teardown(data) {
  // Cleanup: Delete test chat and users
  if (data.tokens.length > 0) {
    const headers = {
      'Authorization': `Bearer ${data.tokens[0].token}`
    };
    
    // Delete test chat
    http.delete(`${API_BASE}/messaging/chats/${data.chatId}`, { headers });
  }
  
  console.log('Socket test completed');
}