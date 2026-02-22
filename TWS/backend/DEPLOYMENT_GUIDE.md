# Security & Compliance Deployment Guide

This guide provides step-by-step instructions for deploying the security and compliance features in your TWS messaging system.

## Prerequisites

- Node.js v18+ (tested with v24.8.0)
- MongoDB 4.4+
- Redis 6.0+ (for retention worker)
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

The following new dependencies have been added:
- `libsodium-wrappers` - For advanced cryptographic operations (E2E encryption)

### 2. Environment Configuration

Create or update your `.env` file with the following security-related variables:

```bash
# Security & Encryption Configuration
ENCRYPTION_MASTER_KEY=your-256-bit-encryption-master-key-here
ENCRYPTION_ENABLED=true
AUDIT_LOG_RETENTION_DAYS=2555
MESSAGE_RETENTION_DAYS=365
DELETED_MESSAGE_RETENTION_DAYS=30

# Redis Configuration (for retention worker)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRE=7d

# Compliance Features
COMPLIANCE_MODE=enabled
GDPR_COMPLIANCE=true
AUDIT_EXPORT_ENABLED=true
RETENTION_POLICY_ENABLED=true
```

### 3. Generate Encryption Master Key

**IMPORTANT**: Generate a secure 256-bit encryption key:

```bash
# Generate a secure master key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and set it as `ENCRYPTION_MASTER_KEY` in your `.env` file.

### 4. Database Migration

If you have existing messages, run the encryption migration:

```bash
# Check migration status
npm run migrate:encryption:status

# Run migration (encrypt existing messages)
npm run migrate:encryption

# If needed, rollback migration
npm run migrate:encryption:rollback
```

### 5. Start Services

#### Main Application
```bash
npm start
# or for development
npm run dev
```

#### Retention Worker (for automated cleanup)
```bash
npm run worker:retention
```

#### Notification Worker (existing)
```bash
npm run worker:notifications
```

## API Endpoints

### Compliance & Security Endpoints

All compliance endpoints are available under `/api/compliance/`:

#### Audit Logs
- `GET /api/compliance/audit-logs` - Retrieve audit logs with filtering
- `GET /api/compliance/audit-logs/export` - Export audit logs to CSV
- `GET /api/compliance/audit-logs/statistics` - Get audit statistics

#### Retention Management
- `GET /api/compliance/retention-policy` - Get retention policy
- `PUT /api/compliance/retention-policy` - Update retention policy
- `GET /api/compliance/retention-statistics` - Get retention statistics
- `GET /api/compliance/retention-report` - Generate retention report
- `POST /api/compliance/retention-policy/enforce` - Manual retention enforcement

#### User Audit Logs
- `GET /api/compliance/users/:userId/audit-logs` - Get user-specific audit logs

#### Compliance Dashboard
- `GET /api/compliance/dashboard` - Get compliance dashboard data

### Enhanced Messaging Endpoints

All existing messaging endpoints now include:
- **Automatic encryption** of message content
- **Audit logging** for all message operations
- **RBAC protection** for sensitive operations

## Security Features

### 1. Message Encryption
- **AES-256-CBC encryption** with per-organization keys
- **Automatic encryption** on message creation
- **Transparent decryption** for authorized users
- **Content integrity verification** with SHA-256 hashing

### 2. Role-Based Access Control (RBAC)
- **Granular permissions** for different user roles
- **Resource-specific access control** (messages, chats, users, audit)
- **Role hierarchy** with permission inheritance
- **Middleware protection** for all sensitive routes

### 3. Audit Logging
- **Comprehensive audit trail** for all security-relevant actions
- **Categorized logging** (moderation, security, admin, user-specific)
- **CSV export functionality** for compliance reporting
- **Automatic cleanup** of old audit logs

### 4. Retention Policies
- **Configurable retention periods** per organization
- **Automated cleanup jobs** via BullMQ worker
- **Soft-delete and permanent purge** workflows
- **Retention statistics** and reporting

## Testing

### Run Security Tests
```bash
# Run all security unit tests
npm test -- --testPathPattern=security-unit.test.js

# Run all tests
npm test
```

### Test Encryption
```bash
# Test encryption service directly
node -e "
const encryptionService = require('./src/services/encryptionService');
const testContent = 'Hello World';
const orgId = '507f1f77bcf86cd799439011';
const encrypted = encryptionService.encryptContent(testContent, orgId);
const decrypted = encryptionService.decryptContent(encrypted, orgId);
console.log('Original:', testContent);
console.log('Decrypted:', decrypted);
console.log('Success:', testContent === decrypted);
"
```

## Monitoring & Maintenance

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
Monitor for:
- Failed decryption attempts
- Unauthorized access attempts
- Retention policy violations
- Key rotation failures
- Audit log corruption

## Production Considerations

### Security Hardening
1. **Use strong encryption keys** (256-bit minimum)
2. **Enable HTTPS** for all communications
3. **Implement proper key rotation** procedures
4. **Monitor security events** regularly
5. **Keep dependencies updated**

### Performance Optimization
1. **Use Redis clustering** for high availability
2. **Implement connection pooling** for MongoDB
3. **Monitor encryption/decryption performance**
4. **Optimize audit log queries** with proper indexing

### Compliance Requirements
1. **GDPR**: Right to be forgotten, data portability
2. **SOX**: Immutable audit trails, access controls
3. **HIPAA**: Encryption at rest and in transit
4. **Industry-specific**: Customize retention policies

## Troubleshooting

### Common Issues

#### 1. Encryption Failures
```bash
# Check encryption service
node -e "console.log(require('./src/services/encryptionService'))"
```

#### 2. Retention Job Failures
```bash
# Check Redis connection
redis-cli ping

# Check retention worker logs
npm run worker:retention
```

#### 3. Audit Log Issues
```bash
# Check audit service
node -e "console.log(require('./src/services/auditService'))"
```

### Debug Mode
```bash
NODE_ENV=development npm start
```

This enables detailed logging for security operations.

## Backup & Recovery

### Backup Strategy
1. **Database backups** (MongoDB)
2. **Encryption key backups** (secure storage)
3. **Audit log exports** (compliance)
4. **Configuration backups** (environment files)

### Recovery Procedures
1. **Restore database** from latest backup
2. **Restore encryption keys** from secure storage
3. **Verify audit log integrity**
4. **Test encryption/decryption** functionality
5. **Run security tests** to verify system health

## Support

For security-related issues or questions:
1. Check the test suite for examples
2. Review the audit logs for errors
3. Consult the API documentation
4. Contact the security team

## Security Best Practices

### Development
- Never commit encryption keys to version control
- Use environment variables for sensitive configuration
- Implement proper error handling for security operations
- Test security features thoroughly

### Production
- Use hardware security modules (HSMs) for key storage
- Implement proper key rotation procedures
- Monitor security events in real-time
- Regular security audits and penetration testing

### Compliance
- Maintain detailed audit trails
- Implement data retention policies
- Provide data export capabilities
- Regular compliance reviews

## License

This security implementation is part of the TWS project and follows the same licensing terms.
