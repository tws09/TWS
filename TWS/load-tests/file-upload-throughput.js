import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const fileUploadRate = new Rate('file_upload_success_rate');
const fileDownloadRate = new Rate('file_download_success_rate');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
    file_upload_success_rate: ['rate>0.95'], // 95% file upload success rate
    file_download_success_rate: ['rate>0.95'], // 95% file download success rate
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

// File sizes to test (in bytes)
const fileSizes = [
  1024,      // 1KB
  10240,     // 10KB
  102400,    // 100KB
  1048576,   // 1MB
  5242880,   // 5MB
];

// Global variables
let authTokens = {};
let uploadedFiles = [];

export function setup() {
  console.log('Setting up file upload throughput test...');
  
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
  
  return { authTokens };
}

export default function(data) {
  const userIndex = __VU % testUsers.length;
  const user = testUsers[userIndex];
  const token = data.authTokens[user.email];
  
  if (!token) {
    console.log(`User ${user.email} not authenticated`);
    return;
  }
  
  // Generate test file content
  const fileSize = fileSizes[__VU % fileSizes.length];
  const fileContent = 'A'.repeat(fileSize);
  const fileName = `test-file-${__VU}-${Date.now()}.txt`;
  
  // Create form data for file upload
  const boundary = '----WebKitFormBoundary' + Math.random().toString(16);
  const formData = `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: text/plain\r\n\r\n` +
    `${fileContent}\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="description"\r\n\r\n` +
    `Load test file upload from VU ${__VU}\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="tags"\r\n\r\n` +
    `load-test,test-file\r\n` +
    `--${boundary}--\r\n`;
  
  // Upload file
  const uploadResponse = http.post(`${API_URL}/files/upload`, formData, {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Authorization': `Bearer ${token}`
    },
  });
  
  const uploadSuccess = check(uploadResponse, {
    'file uploaded successfully': (r) => r.status === 201,
    'file upload response time < 2s': (r) => r.timings.duration < 2000,
    'file upload response time < 5s': (r) => r.timings.duration < 5000,
  });
  
  fileUploadRate.add(uploadSuccess);
  
  if (uploadSuccess && uploadResponse.status === 201) {
    const uploadData = JSON.parse(uploadResponse.body);
    const fileId = uploadData.data.file._id;
    uploadedFiles.push(fileId);
    
    // Download file (simulate file access)
    const downloadResponse = http.get(`${API_URL}/files/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    
    const downloadSuccess = check(downloadResponse, {
      'file downloaded successfully': (r) => r.status === 200,
      'file download response time < 1s': (r) => r.timings.duration < 1000,
    });
    
    fileDownloadRate.add(downloadSuccess);
    
    // Get file metadata
    const metadataResponse = http.get(`${API_URL}/files/${fileId}/metadata`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    
    check(metadataResponse, {
      'file metadata retrieved successfully': (r) => r.status === 200,
    });
  }
  
  // Simulate user activity
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

export function teardown(data) {
  console.log('Cleaning up file upload throughput test...');
  
  // Clean up uploaded files
  for (let fileId of uploadedFiles) {
    const user1Token = data.authTokens[testUsers[0].email];
    if (user1Token) {
      http.del(`${API_URL}/files/${fileId}`, null, {
        headers: {
          'Authorization': `Bearer ${user1Token}`
        },
      });
    }
  }
}
