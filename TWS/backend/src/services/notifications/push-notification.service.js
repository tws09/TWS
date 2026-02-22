const admin = require('firebase-admin');
const DeviceToken = require('../../models/DeviceToken');
const NotificationPreference = require('../../models/NotificationPreference');
const NotificationQueue = require('../../models/NotificationQueue');

class PushNotificationService {
  constructor() {
    this.initialized = false;
    this.initializeFirebase();
  }

  async initializeFirebase() {
    try {
      // Check if Firebase environment variables are set
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
        console.log('Firebase environment variables not set, skipping Firebase initialization');
        this.initialized = false;
        return;
      }

      if (!admin.apps.length) {
        // Initialize Firebase Admin SDK
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      }
      this.initialized = true;
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
      this.initialized = false;
    }
  }

  async sendPushNotification({
    userIds,
    title,
    body,
    data = {},
    notificationType = 'messages',
    relatedEntityType = null,
    relatedEntityId = null,
    silent = false,
    priority = 'normal'
  }) {
    if (!this.initialized) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    try {
      const userIdsArray = Array.isArray(userIds) ? userIds : [userIds];
      const results = [];

      for (const userId of userIdsArray) {
        // Get user's notification preferences
        const preferences = await NotificationPreference.getOrCreate(userId, data.organizationId);
        
        // Check if user wants push notifications for this type
        if (!preferences.shouldSendPush(notificationType, data.chatId)) {
          continue;
        }

        // Check quiet hours
        if (preferences.isQuietHours() && priority !== 'urgent') {
          // Queue for later delivery
          await this.queueNotification({
            userId,
            title,
            body,
            data,
            notificationType,
            relatedEntityType,
            relatedEntityId,
            silent,
            priority,
            scheduledFor: this.getNextAvailableTime(preferences.quietHours)
          });
          continue;
        }

        // Get user's device tokens
        const deviceTokens = await DeviceToken.findActiveTokensForUser(userId);
        
        if (deviceTokens.length === 0) {
          console.log(`No active device tokens found for user ${userId}`);
          continue;
        }

        // Prepare notification payload
        const payload = this.buildNotificationPayload({
          title,
          body,
          data,
          silent,
          preferences
        });

        // Send to all user's devices
        const deviceResults = await this.sendToDevices(deviceTokens, payload);
        results.push(...deviceResults);

        // Update device token last used
        await Promise.all(
          deviceTokens.map(token => token.updateLastUsed())
        );
      }

      return results;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  async sendToDevices(deviceTokens, payload) {
    const results = [];
    const tokens = deviceTokens.map(dt => dt.token);

    try {
      const response = await admin.messaging().sendMulticast({
        tokens,
        ...payload
      });

      // Process results
      response.responses.forEach((result, index) => {
        const deviceToken = deviceTokens[index];
        
        if (result.success) {
          results.push({
            success: true,
            token: deviceToken.token,
            messageId: result.messageId
          });
        } else {
          results.push({
            success: false,
            token: deviceToken.token,
            error: result.error
          });

          // Handle invalid tokens
          if (this.isInvalidTokenError(result.error)) {
            deviceToken.deactivate();
          }
        }
      });

      return results;
    } catch (error) {
      console.error('Error sending multicast message:', error);
      throw error;
    }
  }

  buildNotificationPayload({ title, body, data, silent, preferences }) {
    const payload = {
      data: {
        ...data,
        timestamp: Date.now().toString(),
        notificationType: data.notificationType || 'messages'
      }
    };

    if (silent || preferences.push.silent) {
      // Silent notification (data-only)
      payload.dataOnly = true;
    } else {
      // Visible notification
      payload.notification = {
        title,
        body,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        sound: preferences.push.sound ? 'default' : null,
        vibrate: preferences.push.vibration ? [200, 100, 200] : null
      };

      // Android-specific options
      payload.android = {
        priority: 'high',
        notification: {
          icon: 'ic_notification',
          color: '#2196F3',
          sound: preferences.push.sound ? 'default' : null,
          vibrate: preferences.push.vibration ? [200, 100, 200] : null,
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      };

      // iOS-specific options
      payload.apns = {
        payload: {
          aps: {
            sound: preferences.push.sound ? 'default' : null,
            badge: 1,
            'content-available': 1
          }
        }
      };
    }

    return payload;
  }

  async queueNotification({
    userId,
    title,
    body,
    data,
    notificationType,
    relatedEntityType,
    relatedEntityId,
    silent,
    priority,
    scheduledFor
  }) {
    const queueItem = new NotificationQueue({
      userId,
      organization: data.organizationId,
      type: 'push',
      notificationType,
      title,
      message: body,
      data,
      relatedEntityType,
      relatedEntityId,
      priority,
      scheduledFor
    });

    return await queueItem.save();
  }

  getNextAvailableTime(quietHours) {
    const now = new Date();
    const today = new Date(now);
    today.setHours(parseInt(quietHours.end.split(':')[0]), parseInt(quietHours.end.split(':')[1]), 0, 0);
    
    // If quiet hours end today, return that time
    if (today > now) {
      return today;
    }
    
    // Otherwise, return tomorrow at the end of quiet hours
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  isInvalidTokenError(error) {
    const invalidTokenErrors = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered'
    ];
    return invalidTokenErrors.includes(error?.code);
  }

  // Batch notification methods
  async sendBatchNotifications(notifications) {
    const results = [];
    
    for (const notification of notifications) {
      try {
        const result = await this.sendPushNotification(notification);
        results.push({ notification, result });
      } catch (error) {
        results.push({ notification, error: error.message });
      }
    }
    
    return results;
  }

  // Smart batching for similar notifications
  async batchSimilarNotifications(userId, notifications) {
    const batches = new Map();
    
    // Group notifications by type and related entity
    notifications.forEach(notification => {
      const batchKey = `${notification.notificationType}_${notification.data.chatId || 'general'}`;
      
      if (!batches.has(batchKey)) {
        batches.set(batchKey, []);
      }
      
      batches.get(batchKey).push(notification);
    });
    
    // Process each batch
    const results = [];
    for (const [batchKey, batchNotifications] of batches) {
      if (batchNotifications.length === 1) {
        // Single notification, send as is
        results.push(await this.sendPushNotification(batchNotifications[0]));
      } else {
        // Multiple notifications, create batched notification
        const batchedNotification = this.createBatchedNotification(batchNotifications);
        results.push(await this.sendPushNotification(batchedNotification));
      }
    }
    
    return results;
  }

  createBatchedNotification(notifications) {
    const firstNotification = notifications[0];
    const count = notifications.length;
    
    let title, body;
    
    if (firstNotification.notificationType === 'messages') {
      title = `${count} new messages`;
      body = `You have ${count} unread messages`;
    } else if (firstNotification.notificationType === 'mentions') {
      title = `${count} mentions`;
      body = `You were mentioned ${count} times`;
    } else {
      title = `${count} notifications`;
      body = `You have ${count} new notifications`;
    }
    
    return {
      ...firstNotification,
      title,
      body,
      data: {
        ...firstNotification.data,
        batchCount: count,
        isBatched: true
      }
    };
  }

  // Cleanup methods
  async cleanupInvalidTokens() {
    try {
      // This would typically be run as a scheduled job
      const result = await DeviceToken.cleanupOldTokens(30);
      console.log(`Cleaned up ${result.deletedCount} old device tokens`);
      return result;
    } catch (error) {
      console.error('Error cleaning up device tokens:', error);
      throw error;
    }
  }

  // Test method
  async sendTestNotification(userId, title = 'Test Notification', body = 'This is a test notification') {
    return await this.sendPushNotification({
      userIds: [userId],
      title,
      body,
      data: { test: true },
      notificationType: 'system',
      priority: 'normal'
    });
  }
}

module.exports = new PushNotificationService();
