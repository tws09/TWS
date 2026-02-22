# Security & Compliance Implementation

This document outlines the comprehensive security and compliance features implemented for the TWS messaging system.

## Overview

The security implementation includes:
- **Encryption**: AES-256 encryption with envelope keys for message content
- **Audit Logging**: Comprehensive audit trail for all security-relevant actions
- **Retention Policies**: Configurable message retention with automated cleanup
- **RBAC**: Role-based access control with granular permissions
- **Compliance**: Audit export and retention reporting capabilities
- **E2E Encryption**: Implementation plan for Signal-like end-to-end encryption

## Features Implemented

### 1. Encryption Service (`src/services/encryptionService.js`)

**Purpose**: Encrypt message content at rest using AES-256 with envelope encryption.

**Key Features**:
- AES-256-GCM encryption with per-organization envelope keys
- Content integrity verification with SHA-256 hashing
- Batch encryption/decryption support
- Key rotation capabilities
- Error handling for decryption failures

**Usage**:
```javascript
const encryptionService = require('./services/encryptionService');

// Encrypt content
const encryptedData = encryptionService.encryptContent('Hello World', orgId);

// Decrypt content
const decryptedContent = encryptionService.decryptContent(encryptedData, orgId);
```

### 2. Audit Service (`src/services/auditService.js`)

**Purpose**: Comprehensive audit logging for security and compliance.

**Key Features**:
- Logs all security-relevant actions (message operations, user actions, admin actions)
- Categorized audit logs (moderation, security, admin, user-specific)
- CSV export functionality for compliance reporting
- Audit statistics and analytics
- Automatic cleanup of old audit logs

**Usage**:
```javascript
const auditService = require('./services/auditService');

// Log an event
await auditService.logMessageEvent(
  auditService.auditActions.MESSAGE_DELETE,
  messageId,
  userId,
  orgId,
  { reason: 'Policy violation' }
);

// Export audit logs
const csvData = await auditService.exportAuditLogs(orgId, { format: 'csv' });
```

### 3. Retention Service (`src/services/retentionService.js`)

**Purpose**: Automated message retention policy enforcement.

**Key Features**:
- Configurable retention periods per organization
- Soft-delete and permanent purge workflows
- Automated cleanup jobs via BullMQ
- Retention statistics and reporting
- Policy change audit logging

**Usage**:
```javascript
const retentionService = require('./services/retentionService');

// Get retention policy
const policy = await retentionService.getRetentionPolicy(orgId);

// Update retention policy
await retentionService.updateRetentionPolicy(orgId, {
  messages: 365, // 1 year
  deletedMessages: 30 // 30 days
}, userId);

// Enforce retention policy
const result = await retentionService.enforceRetentionPolicy(orgId);
```

### 4. RBAC Middleware (`src/middleware/rbac.js`)

**Purpose**: Role-based access control with granular permissions.

**Key Features**:
- Role hierarchy with permission inheritance
- Resource-specific permissions (messages, chats, users, audit)
- Middleware for route protection
- Message and chat access validation
- Permission checking utilities

**Usage**:
```javascript
const { requireAdminAccess, requireMessageAccess } = require('./middleware/rbac');

// Protect admin routes
router.get('/admin/users', requireAdminAccess(), handler);

// Protect message access
router.get('/messages/:id', requireMessageAccess('read'), handler);
```

### 5. Compliance Routes (`src/routes/compliance.js`)

**Purpose**: API endpoints for compliance and security management.

**Endpoints**:
- `GET /api/compliance/audit-logs` - Retrieve audit logs with filtering
- `GET /api/compliance/audit-logs/export` - Export audit logs to CSV
- `GET /api/compliance/retention-policy` - Get retention policy
- `PUT /api/compliance/retention-policy` - Update retention policy
- `GET /api/compliance/retention-report` - Generate retention report
- `POST /api/compliance/retention-policy/enforce` - Manual retention enforcement

### 6. Retention Worker (`src/workers/retentionWorker.js`)

**Purpose**: Automated background processing for retention policies.

**Features**:
- Scheduled jobs for soft-delete and purge operations
- Per-organization job scheduling
- Job status monitoring
- Error handling and retry logic
- Audit logging for all operations

**Usage**:
```bash
# Start the retention worker
npm run worker:retention
```

### 7. Security Tests (`src/tests/security.test.js`)

**Purpose**: Comprehensive test suite for security features.

**Test Coverage**:
- Encryption/decryption functionality
- RBAC permission checking
- Audit logging
- Retention policy enforcement
- API security
- Data integrity
- Error handling

**Run Tests**:
```bash
npm test -- --testPathPattern=security.test.js
```

## E2E Encryption Implementation Plan

### Phase 1: Basic E2E Infrastructure (2-3 weeks)
- Implement key generation and storage
- Create pre-key bundle management
- Set up client-side encryption helpers
- Implement basic message encryption/decryption

### Phase 2: Double Ratchet Protocol (3-4 weeks)
- Implement X3DH key agreement
- Create Double Ratchet state management
- Add forward secrecy mechanisms
- Implement message key derivation

### Phase 3: Advanced Features (2-3 weeks)
- Add key verification and safety numbers
- Implement key rotation
- Add out-of-order message handling
- Create key backup and recovery

### Phase 4: Security Hardening (2-3 weeks)
- Implement perfect forward secrecy
- Add message authentication
- Create secure key storage
- Implement key escrow for compliance

## Security Considerations

### Key Management
- Store private keys securely on client devices
- Use hardware security modules where possible
- Implement secure key backup mechanisms
- Consider key escrow for legal compliance

### Protocol Security
- Use cryptographically secure random number generation
- Implement proper key derivation functions
- Ensure forward secrecy through key rotation
- Protect against replay attacks

### Implementation Security
- Use constant-time cryptographic operations
- Implement proper memory management for sensitive data
- Protect against timing attacks
- Use secure communication channels for key exchange

## Dependencies

### Client-Side
- `libsodium-wrappers` - Cryptographic operations
- `Web Crypto API` - Key generation
- `IndexedDB` - Secure key storage
- `Web Workers` - Background encryption

### Server-Side
- Enhanced message storage for encrypted blobs
- Pre-key bundle management system
- Key exchange coordination service
- Compliance and audit logging for E2E

## Configuration

### Environment Variables
```bash
# Encryption
ENCRYPTION_MASTER_KEY=your-master-key-here

# Redis (for retention worker)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT (for authentication)
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRE=7d
```

### Default Retention Policies
```javascript
{
  messages: 365,        // 1 year
  deletedMessages: 30,  // 30 days
  auditLogs: 2555,      // 7 years
  userData: 2555,       // 7 years
  chatData: 365         // 1 year
}
```

## API Usage Examples

### Get Audit Logs
```bash
curl -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/compliance/audit-logs?type=moderation&limit=50"
```

### Export Audit Logs
```bash
curl -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/compliance/audit-logs/export?format=csv&startDate=2024-01-01" \
  -o audit-logs.csv
```

### Update Retention Policy
```bash
curl -X PUT -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"policies": {"messages": 180, "deletedMessages": 15}}' \
  "https://api.example.com/api/compliance/retention-policy"
```

### Generate Retention Report
```bash
curl -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/compliance/retention-report?includeDetails=true"
```

## Monitoring and Maintenance

### Health Checks
- Monitor encryption service health
- Check retention worker status
- Verify audit log integrity
- Monitor key rotation schedules

### Regular Tasks
- Review audit logs for security events
- Update retention policies as needed
- Rotate encryption keys periodically
- Clean up old audit logs
- Test backup and recovery procedures

### Security Alerts
- Failed decryption attempts
- Unauthorized access attempts
- Retention policy violations
- Key rotation failures
- Audit log corruption

## Compliance Features

### GDPR Compliance
- Right to be forgotten (message deletion)
- Data portability (audit export)
- Data minimization (retention policies)
- Consent management (user preferences)

### SOX Compliance
- Immutable audit trails
- Access controls and segregation
- Data retention policies
- Regular compliance reporting

### HIPAA Compliance
- Encryption at rest and in transit
- Access logging and monitoring
- Data retention and disposal
- User authentication and authorization

## Troubleshooting

### Common Issues

1. **Decryption Failures**
   - Check organization ID consistency
   - Verify encryption keys
   - Review error logs

2. **Retention Job Failures**
   - Check Redis connection
   - Verify MongoDB access
   - Review job logs

3. **Audit Log Issues**
   - Check database permissions
   - Verify log format
   - Review storage space

### Debug Mode
```bash
NODE_ENV=development npm start
```

This enables detailed logging for security operations.

## Support

For security-related issues or questions:
1. Check the test suite for examples
2. Review the audit logs for errors
3. Consult the API documentation
4. Contact the security team

## License

This security implementation is part of the TWS project and follows the same licensing terms.
