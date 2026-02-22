import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const socketConnectionRate = new Rate('socket_connection_success_rate');
const messageDeliveryRate = new Rate('socket_message_delivery_rate');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 100 },  // Ramp up to 100 concurrent connections
    { duration: '3m', target: 100 },  // Stay at 100 connections
    { duration: '1m', target: 500 },  // Ramp up to 500 concurrent connections
    { duration: '3m', target: 500 },  // Stay at 500 connections
    { duration: '1m', target: 1000 }, // Ramp up to 1000 concurrent connections
    { duration: '3m', target: 1000 }, // Stay at 1000 connections
    { duration: '2m', target: 0 },    // Ramp down to 0 connections
  ],
  thresholds: {
    socket_connection_success_rate: ['rate>0.95'], // 95% connection success rate
    socket_message_delivery_rate: ['rate>0.95'],   // 95% message delivery success rate
    ws_connecting: ['p(95)<1000'],                 // 95% of connections establish in < 1s
    ws_msgs_received: ['count>1000'],              // Receive at least 1000 messages
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const WS_URL = BASE_URL.replace('http', 'ws');

// Test users
const testUsers = [
  { email: 'user1@test.com', password: 'password123' },
  { email: 'user2@test.com', password: 'password123' },
  { email: 'user3@test.com', password: 'user3@test.com' },
  { email: 'user4@test.com', password: 'password123' },
  { email: 'user5@test.com', password: 'password123' },
];

// Global variables
let authTokens = {};
let chatIds = [];

export function setup() {
  console.log('Setting up socket connections test...');
  
  // Login all test users and get auth tokens
  for (let user of testUsers) {
    const loginResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
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
  
  // Create test chat
  const user1Token = authTokens[testUsers[0].email];
  if (user1Token) {
    const chatResponse = http.post(`${BASE_URL}/api/messaging/chats`, JSON.stringify({
      name: `Socket Test Chat ${Date.now()}`,
      type: 'group',
      description: 'Socket load test chat',
      members: testUsers.map(u => u.email)
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
  
  // Connect to WebSocket
  const url = `${WS_URL}/socket.io/?EIO=4&transport=websocket&token=${token}`;
  
  const res = ws.connect(url, {}, function (socket) {
    const connectionSuccess = check(res, {
      'socket connected successfully': (r) => r && r.status === 101,
    });
    
    socketConnectionRate.add(connectionSuccess);
    
    if (connectionSuccess) {
      // Join chat room
      socket.send(JSON.stringify({
        type: 'join_chat',
        chatId: chatId
      }));
      
      // Send periodic messages
      let messageCount = 0;
      const maxMessages = 10;
      
      const messageInterval = setInterval(() => {
        if (messageCount >= maxMessages) {
          clearInterval(messageInterval);
          socket.close();
          return;
        }
        
        const message = {
          type: 'send_message',
          chatId: chatId,
          content: `Socket load test message ${messageCount} from VU ${__VU}`,
          timestamp: Date.now()
        };
        
        socket.send(JSON.stringify(message));
        messageCount++;
      }, 2000); // Send message every 2 seconds
      
      // Handle incoming messages
      socket.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          const deliverySuccess = check(message, {
            'message received successfully': (m) => m && m.type,
          });
          
          messageDeliveryRate.add(deliverySuccess);
        } catch (e) {
          console.log('Error parsing message:', e);
        }
      });
      
      // Handle connection close
      socket.on('close', () => {
        clearInterval(messageInterval);
      });
      
      // Keep connection alive for the test duration
      sleep(30); // Keep connection for 30 seconds
    }
  });
  
  // Wait a bit before next iteration
  sleep(1);
}

export function teardown(data) {
  console.log('Cleaning up socket connections test...');
  
  // Clean up test chat
  for (let chatId of data.chatIds) {
    const user1Token = data.authTokens[testUsers[0].email];
    if (user1Token) {
      http.del(`${BASE_URL}/api/messaging/chats/${chatId}`, null, {
        headers: {
          'Authorization': `Bearer ${user1Token}`
        },
      });
    }
  }
}
