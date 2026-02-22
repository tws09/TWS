# TWS Notification System

A comprehensive push and email notification system for the TWS platform, supporting real-time messaging notifications, smart batching, and user preference management.

## Features

### 🔔 Push Notifications
- **Firebase Cloud Messaging (FCM)** integration for web and mobile
- Support for silent and visible notifications
- Device token management with automatic cleanup
- Platform-specific notification formatting (iOS, Android, Web)

### 📧 Email Notifications
- **Multiple email providers**: SendGrid, AWS SES, SMTP
- **Smart batching**: Immediate, hourly, daily, weekly digests
- **Rich HTML templates** with responsive design
- **User preference management** per notification type

### 🧠 Smart Batching
- **Collapse repetitive notifications** (e.g., "3 new messages in X chat")
- **Batch similar notifications** to reduce notification fatigue
- **Priority-based processing** (urgent, high, normal, low)
- **Quiet hours support** with timezone awareness

### ⚙️ User Preferences
- **Granular control** over notification types
- **Chat-specific preferences** for different communication channels
- **Quiet hours configuration** with custom schedules
- **Frequency settings** (immediate, hourly, daily, weekly, off)

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   External      │
│                 │    │                  │    │   Services      │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • Device Token  │◄──►│ • FCM Service    │◄──►│ • Firebase      │
│ • Preferences   │    │ • Email Service  │    │ • SendGrid      │
│ • Notifications │    │ • Batching Logic │    │ • AWS SES       │
└─────────────────┘    │ • Queue Workers  │    └─────────────────┘
                       │ • Templates      │
                       └──────────────────┘
```

## Database Models

### DeviceToken
Stores FCM device tokens for push notifications:
```javascript
{
  userId: ObjectId,
  token: String (unique),
  platform: 'web' | 'android' | 'ios',
  deviceId: String,
  deviceInfo: Object,
  isActive: Boolean,
  lastUsed: Date,
  organization: ObjectId
}
```

### NotificationPreference
User notification preferences and settings:
```javascript
{
  userId: ObjectId (unique),
  organization: ObjectId,
  email: {
    enabled: Boolean,
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'off',
    types: Object, // per-type preferences
    digestSettings: Object
  },
  push: {
    enabled: Boolean,
    types: Object,
    silent: Boolean,
    sound: Boolean,
    vibration: Boolean
  },
  quietHours: Object,
  chatPreferences: Array // per-chat settings
}
```

### NotificationQueue
Queued notifications for processing:
```javascript
{
  userId: ObjectId,
  organization: ObjectId,
  type: 'email' | 'push' | 'sms',
  notificationType: String,
  title: String,
  message: String,
  data: Object,
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled',
  priority: 'low' | 'normal' | 'high' | 'urgent',
  scheduledFor: Date,
  attempts: Number,
  maxAttempts: Number
}
```

## API Endpoints

### Device Token Management
```http
POST /api/notifications/register
DELETE /api/notifications/unregister
GET /api/notifications/devices
```

### Notification Preferences
```http
GET /api/notifications/preferences
PUT /api/notifications/preferences
PUT /api/notifications/preferences/chat/:chatId
```

### Testing
```http
POST /api/notifications/test/push
POST /api/notifications/test/email
```

### Statistics & Management
```http
GET /api/notifications/stats
DELETE /api/notifications/cleanup
```

## Services

### PushNotificationService
Handles FCM push notifications:
- Device token management
- Notification payload formatting
- Platform-specific configurations
- Error handling and token cleanup

### EmailService
Manages email notifications:
- Multi-provider support (SendGrid, SES, SMTP)
- Template rendering
- Digest generation
- Delivery tracking

### NotificationBatchingService
Smart notification batching:
- Similar notification grouping
- Batch size optimization
- Digest scheduling
- Collapse logic

### MessagingNotificationService
Integration with messaging system:
- New message notifications
- Mention detection
- Reaction notifications
- Chat member notifications

## Workers

### BullMQ Workers
- **Push Notification Worker**: Processes push notification queue
- **Email Notification Worker**: Handles email delivery
- **Digest Worker**: Manages email digest scheduling

### Queue Management
- Automatic retry with exponential backoff
- Priority-based processing
- Dead letter queue for failed notifications
- Cleanup of completed jobs

## Email Templates

### Message Template
Rich HTML template for new message notifications with:
- Sender information
- Message content preview
- Chat context
- Direct action buttons

### Chat Invite Template
Welcome template for new chat members with:
- Chat information
- Inviter details
- Quick join action
- Help resources

### Digest Template
Comprehensive digest template with:
- Grouped notifications by type
- Collapsed similar notifications
- Unread counts
- Time-based organization

### Welcome Template
Onboarding template for new users with:
- Platform introduction
- Feature highlights
- Getting started guide
- Support resources

## Configuration

### Environment Variables

#### Firebase Configuration
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

#### Email Provider Configuration
```env
# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourcompany.com
FROM_NAME=Your Company

# AWS SES
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Redis Configuration
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

#### Application Configuration
```env
EMAIL_PROVIDER=sendgrid # sendgrid, ses, smtp
FRONTEND_URL=http://localhost:3000
```

## Usage Examples

### Register Device Token
```javascript
const response = await fetch('/api/notifications/register', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'fcm-device-token',
    platform: 'web',
    deviceId: 'unique-device-id',
    deviceInfo: {
      userAgent: navigator.userAgent,
      appVersion: '1.0.0'
    }
  })
});
```

### Update Notification Preferences
```javascript
const response = await fetch('/api/notifications/preferences', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: {
      enabled: true,
      frequency: 'daily',
      types: {
        messages: true,
        mentions: true,
        projectUpdates: false
      }
    },
    push: {
      enabled: true,
      silent: false,
      types: {
        messages: true,
        mentions: true
      }
    },
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      timezone: 'America/New_York'
    }
  })
});
```

### Send Test Notification
```javascript
const response = await fetch('/api/notifications/test/push', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Test Notification',
    body: 'This is a test push notification'
  })
});
```

## Testing

### Run Tests
```bash
npm test -- --testPathPattern=notificationSystem
```

### Test Coverage
The test suite covers:
- Device token registration and management
- Notification preference handling
- Push notification delivery
- Email notification processing
- Smart batching logic
- Integration with messaging system
- Error handling and edge cases

### Manual Testing
Use the test endpoints to verify functionality:
- `/api/notifications/test/push` - Test push notifications
- `/api/notifications/test/email` - Test email delivery

## Monitoring & Analytics

### Queue Statistics
```javascript
const stats = await NotificationQueueManager.getQueueStats();
console.log(stats);
// {
//   push: { waiting: 5, active: 2, completed: 100, failed: 3 },
//   email: { waiting: 10, active: 1, completed: 200, failed: 5 },
//   digest: { waiting: 0, active: 0, completed: 50, failed: 1 }
// }
```

### Notification Metrics
- Delivery success rates
- User engagement metrics
- Batching effectiveness
- Error rates by provider

## Deployment

### Prerequisites
1. **Firebase Project** with FCM enabled
2. **Email Provider** account (SendGrid/SES/SMTP)
3. **Redis Server** for queue management
4. **MongoDB** for data storage

### Migration
Run the notification system migration:
```bash
npm run migrate:up
```

### Worker Deployment
Start the notification workers:
```bash
npm run worker:notifications
```

### Environment Setup
1. Configure environment variables
2. Set up Firebase service account
3. Configure email provider
4. Initialize Redis connection
5. Run database migrations

## Best Practices

### Performance
- Use connection pooling for database operations
- Implement proper indexing for notification queries
- Batch database operations where possible
- Monitor queue processing times

### Reliability
- Implement proper error handling and retry logic
- Use dead letter queues for failed notifications
- Monitor service health and availability
- Implement circuit breakers for external services

### User Experience
- Respect user preferences and quiet hours
- Provide clear notification content
- Implement smart batching to reduce noise
- Allow easy preference management

### Security
- Validate all input data
- Use secure token storage
- Implement rate limiting
- Monitor for abuse patterns

## Troubleshooting

### Common Issues

#### Push Notifications Not Working
1. Check Firebase configuration
2. Verify device token registration
3. Check user notification preferences
4. Review FCM service logs

#### Email Delivery Issues
1. Verify email provider configuration
2. Check sender reputation
3. Review email templates
4. Monitor bounce rates

#### Queue Processing Problems
1. Check Redis connection
2. Monitor worker health
3. Review queue statistics
4. Check for dead letter queues

### Debug Mode
Enable debug logging:
```env
DEBUG=notification:*
NODE_ENV=development
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure backward compatibility
5. Test with multiple email providers

## License

This notification system is part of the TWS platform and follows the same licensing terms.
