// Chat and Message models removed - messaging features have been removed
// const Chat = require('../../models/Chat');
// const Message = require('../../models/Message');
const User = require('../../models/User');
// SIMPLIFIED: Removed notification queue system - use direct email sending
const emailService = require('./integrations/email.service');

class MessagingNotificationService {
  // NOTE: Messaging features have been removed - all methods are now no-ops
  
  // Send notifications for new message
  static async notifyNewMessage(message, chat) {
    console.warn('⚠️ notifyNewMessage called but messaging features have been removed');
    return;
  }

  // Send notifications for message reactions
  static async notifyMessageReaction(message, reaction, reactor) {
    console.warn('⚠️ notifyMessageReaction called but messaging features have been removed');
    return;
  }

  // Send notifications for new chat members
  static async notifyNewChatMember(chat, newMember, addedBy) {
    console.warn('⚠️ notifyNewChatMember called but messaging features have been removed');
    return;
  }

  // Send notifications for chat updates
  static async notifyChatUpdate(chat, updatedBy, changes) {
    console.warn('⚠️ notifyChatUpdate called but messaging features have been removed');
    return;
  }

  // Helper methods
  static extractMentions(content) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  }

  static async getMentionedUsers(mentions, organizationId) {
    if (mentions.length === 0) {
      return [];
    }

    // This is a simplified implementation
    // In a real app, you might want to search by username or email
    return await User.find({
      organization: organizationId,
      $or: [
        { fullName: { $in: mentions } },
        { email: { $in: mentions } }
      ]
    }).select('_id fullName email');
  }

  // REMOVED: createNotificationQueueItems - notification queue system removed
  // Use direct email sending instead

  static async sendImmediateMentionNotifications(mentionedUsers, chat, sender, message) {
    for (const user of mentionedUsers) {
      try {
        await pushNotificationService.sendPushNotification({
          userIds: [user._id],
          title: `Mentioned in ${chat.name}`,
          body: `${sender.fullName}: ${message.content.substring(0, 100)}...`,
          data: {
            chatId: chat._id,
            chatName: chat.name,
            messageId: message._id,
            senderId: sender._id,
            senderName: sender.fullName,
            organizationId: chat.organization
          },
          notificationType: 'mentions',
          priority: 'high'
        });
      } catch (error) {
        console.error(`Error sending immediate mention notification to ${user._id}:`, error);
      }
    }
  }

  // REMOVED: Push notification content generators (push notifications removed)

  static getEmailSubject(chat, sender, isMentioned) {
    if (isMentioned) {
      return `You were mentioned in ${chat.name}`;
    }
    return `New message in ${chat.name}`;
  }

  static generateMessageEmailHtml(chat, sender, message, isMentioned) {
    // Messaging features removed - return empty string
    return '';
  }

  static generateMessageEmailText(chat, sender, message, isMentioned) {
    // Messaging features removed - return empty string
    return '';
  }

  static generateChatInviteEmailHtml(chat, addedBy) {
    // Messaging features removed - return empty string
    return '';
  }

  static generateChatInviteEmailText(chat, addedBy) {
    // Messaging features removed - return empty string
    return '';
  }

  // REMOVED: Batch processing for offline users (notification queue removed)
  // Email notifications are sent directly when needed
}

module.exports = MessagingNotificationService;
