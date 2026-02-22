const mongoose = require('mongoose');

const migration = {
  version: '003',
  name: 'notification-system',
  description: 'Add notification system models and indexes',
  
  async up(db) {
    console.log('Running migration: notification-system (up)');
    
    // Create DeviceToken collection
    const deviceTokenSchema = {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      token: { type: String, required: true, unique: true },
      platform: { type: String, enum: ['web', 'android', 'ios'], required: true },
      deviceId: { type: String, required: true },
      deviceInfo: {
        userAgent: String,
        appVersion: String,
        osVersion: String,
        deviceModel: String
      },
      isActive: { type: Boolean, default: true },
      lastUsed: { type: Date, default: Date.now },
      organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    };

    await db.createCollection('devicetokens');
    await db.collection('devicetokens').createIndex({ userId: 1, platform: 1 });
    await db.collection('devicetokens').createIndex({ token: 1 });
    await db.collection('devicetokens').createIndex({ isActive: 1 });
    await db.collection('devicetokens').createIndex({ lastUsed: -1 });

    // Create NotificationPreference collection
    const notificationPreferenceSchema = {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
      organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
      email: {
        enabled: { type: Boolean, default: true },
        frequency: { type: String, enum: ['immediate', 'hourly', 'daily', 'weekly', 'off'], default: 'immediate' },
        types: {
          messages: { type: Boolean, default: true },
          mentions: { type: Boolean, default: true },
          projectUpdates: { type: Boolean, default: true },
          taskAssignments: { type: Boolean, default: true },
          deadlineReminders: { type: Boolean, default: true },
          approvals: { type: Boolean, default: true },
          system: { type: Boolean, default: true }
        },
        digestSettings: {
          maxNotificationsPerDigest: { type: Number, default: 10 },
          collapseSimilar: { type: Boolean, default: true },
          includeUnreadCount: { type: Boolean, default: true }
        }
      },
      push: {
        enabled: { type: Boolean, default: true },
        types: {
          messages: { type: Boolean, default: true },
          mentions: { type: Boolean, default: true },
          projectUpdates: { type: Boolean, default: false },
          taskAssignments: { type: Boolean, default: true },
          deadlineReminders: { type: Boolean, default: true },
          approvals: { type: Boolean, default: true },
          system: { type: Boolean, default: true }
        },
        silent: { type: Boolean, default: false },
        sound: { type: Boolean, default: true },
        vibration: { type: Boolean, default: true }
      },
      sms: {
        enabled: { type: Boolean, default: false },
        phoneNumber: String,
        types: {
          urgent: { type: Boolean, default: true },
          deadlineReminders: { type: Boolean, default: false }
        }
      },
      quietHours: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '22:00' },
        end: { type: String, default: '08:00' },
        timezone: { type: String, default: 'UTC' },
        days: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }]
      },
      chatPreferences: [{
        chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true }
      }],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    };

    await db.createCollection('notificationpreferences');
    await db.collection('notificationpreferences').createIndex({ userId: 1 });
    await db.collection('notificationpreferences').createIndex({ organization: 1 });

    // Create NotificationQueue collection
    const notificationQueueSchema = {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
      type: { type: String, enum: ['email', 'push', 'sms'], required: true },
      notificationType: { type: String, enum: ['messages', 'mentions', 'projectUpdates', 'taskAssignments', 'deadlineReminders', 'approvals', 'system'], required: true },
      title: { type: String, required: true },
      message: { type: String, required: true },
      data: { type: mongoose.Schema.Types.Mixed, default: {} },
      relatedEntityType: { type: String, enum: ['chat', 'message', 'project', 'card', 'user', 'system'] },
      relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
      batchKey: { type: String },
      batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'NotificationBatch' },
      status: { type: String, enum: ['pending', 'processing', 'sent', 'failed', 'cancelled'], default: 'pending' },
      attempts: { type: Number, default: 0 },
      maxAttempts: { type: Number, default: 3 },
      scheduledFor: { type: Date, default: Date.now },
      sentAt: Date,
      failedAt: Date,
      errorMessage: String,
      priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
      retryDelay: { type: Number, default: 300000 },
      nextRetryAt: { type: Date },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    };

    await db.createCollection('notificationqueues');
    await db.collection('notificationqueues').createIndex({ status: 1, scheduledFor: 1 });
    await db.collection('notificationqueues').createIndex({ userId: 1, type: 1, status: 1 });
    await db.collection('notificationqueues').createIndex({ batchKey: 1, status: 1 });
    await db.collection('notificationqueues').createIndex({ nextRetryAt: 1 });
    await db.collection('notificationqueues').createIndex({ organization: 1, type: 1 });

    console.log('Notification system migration completed successfully');
  },

  async down(db) {
    console.log('Running migration: notification-system (down)');
    
    // Drop collections
    await db.collection('devicetokens').drop();
    await db.collection('notificationpreferences').drop();
    await db.collection('notificationqueues').drop();
    
    console.log('Notification system migration rolled back successfully');
  }
};

module.exports = migration;
