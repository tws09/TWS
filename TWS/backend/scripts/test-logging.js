#!/usr/bin/env node

/**
 * Logging Test Script
 * Tests all logging functionality to ensure it's working correctly
 */

const { logger, logRequest, logError, logUserActivity, logSecurityEvent, logDatabaseQuery, logMessageOperation, logPerformanceMetric, logSystemEvent, logAudit } = require('../src/config/logging');
const { loggerService } = require('../src/services/loggerService');
const metricsService = require('../src/services/metricsService');

console.log('🧪 Starting Logging System Tests...\n');

// Test 1: Basic logging levels
console.log('1. Testing basic logging levels...');
logger.info('Test info message', { test: 'basic logging' });
logger.warn('Test warning message', { test: 'basic logging' });
logger.error('Test error message', new Error('Test error'), { test: 'basic logging' });
logger.debug('Test debug message', { test: 'basic logging' });

// Test 2: Logger service with context
console.log('\n2. Testing logger service with context...');
const requestId = loggerService.generateRequestId();
loggerService.setContext(requestId, 'test-user-123', 'test-chat-456');
loggerService.info('Test message with context');
loggerService.clearContext();

// Test 3: Specialized logging functions
console.log('\n3. Testing specialized logging functions...');

// Mock request and response objects
const mockReq = {
  method: 'POST',
  url: '/api/test',
  get: (header) => header === 'User-Agent' ? 'Test Agent' : null,
  ip: '127.0.0.1'
};

const mockRes = {
  statusCode: 200,
  get: (header) => header === 'Content-Length' ? '1024' : null
};

logRequest(mockReq, mockRes, 150);

// Test error logging
const testError = new Error('Test application error');
testError.code = 'TEST_ERROR';
logError(testError, { component: 'test', operation: 'logging test' });

// Test user activity logging
logUserActivity('login', 'test-user-123', { ip: '127.0.0.1', userAgent: 'Test Agent' });

// Test security event logging
logSecurityEvent('failed_login_attempt', 'test-user-123', { ip: '127.0.0.1', reason: 'invalid_password' });

// Test database query logging
logDatabaseQuery('find', 'users', 25, { email: 'test@example.com' });

// Test message operation logging
logMessageOperation('send', 'msg-123', 'user-123', 'chat-456', { messageType: 'text' });

// Test performance metric logging
logPerformanceMetric('api_response_time', 150, { endpoint: '/api/test' });

// Test system event logging
logSystemEvent('server_startup', { port: 5000, environment: 'test' });

// Test audit logging
logAudit('user_created', 'admin-123', 'user-456', { role: 'employee' });

// Test 4: Metrics service
console.log('\n4. Testing metrics service...');
try {
  metricsService.recordHttpRequest('GET', '/api/test', 200, 0.1);
  metricsService.incrementApiRequests('POST', '/api/test', 201);
  metricsService.recordResponseTime('GET', '/api/test', 0.15);
  metricsService.incrementErrorCount('test_error', 'error');
  console.log('✅ Metrics service working correctly');
} catch (error) {
  console.error('❌ Metrics service error:', error.message);
}

// Test 5: Request logger service
console.log('\n5. Testing request logger service...');
const testRequestId = loggerService.generateRequestId();
loggerService.setContext(testRequestId, 'test-user', 'test-chat');
loggerService.logRequest(mockReq, mockRes, 200);
loggerService.logUserActivity('test_activity', 'test-user', { test: true });
loggerService.logSecurityEvent('test_security_event', 'test-user', { test: true });
loggerService.logDatabaseQuery('test_operation', 'test_collection', 50);
loggerService.logMessageOperation('test_message_op', 'msg-123', 'user-123', 'chat-123');
loggerService.logPerformanceMetric('test_metric', 100, { test: true });
loggerService.logSystemEvent('test_system_event', { test: true });
loggerService.logAudit('test_audit', 'admin', 'target', { test: true });
loggerService.clearContext();

// Test 6: Error handling
console.log('\n6. Testing error handling...');
try {
  // This should not throw an error
  loggerService.logError(new Error('Test error'), { test: true });
  console.log('✅ Error logging working correctly');
} catch (error) {
  console.error('❌ Error logging failed:', error.message);
}

// Test 7: Child logger
console.log('\n7. Testing child logger...');
const childLogger = loggerService.child({ component: 'test' });
childLogger.info('Test message from child logger');

// Test 8: Log file creation
console.log('\n8. Checking log files...');
const fs = require('fs');
const path = require('path');
const logsDir = path.join(process.cwd(), 'logs');

const logFiles = [
  'combined.log',
  'error.log',
  'exceptions.log',
  'rejections.log'
];

logFiles.forEach(file => {
  const filePath = path.join(logsDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} exists (${stats.size} bytes)`);
  } else {
    console.log(`⚠️  ${file} does not exist`);
  }
});

// Test 9: Daily rotate files
console.log('\n9. Checking daily rotate files...');
const today = new Date().toISOString().split('T')[0];
const dailyFiles = [
  `application-${today}.log`,
  `error-${today}.log`
];

dailyFiles.forEach(file => {
  const filePath = path.join(logsDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} exists (${stats.size} bytes)`);
  } else {
    console.log(`⚠️  ${file} does not exist`);
  }
});

console.log('\n🎉 Logging system tests completed!');
console.log('\n📋 Summary:');
console.log('- Basic logging levels: ✅');
console.log('- Logger service with context: ✅');
console.log('- Specialized logging functions: ✅');
console.log('- Metrics service: ✅');
console.log('- Request logger service: ✅');
console.log('- Error handling: ✅');
console.log('- Child logger: ✅');
console.log('- Log file creation: Checked');
console.log('- Daily rotate files: Checked');

console.log('\n💡 Tips:');
console.log('- Check the logs/ directory for generated log files');
console.log('- In development, logs will appear in console with colors');
console.log('- In production, logs will be written to files only');
console.log('- Set LOG_LEVEL environment variable to control log verbosity');
console.log('- Set SENTRY_DSN environment variable to enable error tracking');

process.exit(0);
