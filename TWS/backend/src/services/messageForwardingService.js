// Message and Chat models removed - messaging features have been removed
// const Message = require('../models/Message');
// const Chat = require('../models/Chat');
const User = require('../models/User');
const auditService = require('./compliance/audit.service');
const notificationService = require('./notifications/notification.service');

/**
 * Message Forwarding and Templates Service
 * NOTE: Messaging features have been removed - this service is now a stub
 */
class MessageForwardingService {
  constructor() {
    this.messageTemplates = new Map();
    this.quickReplies = new Map();
    this.forwardingHistory = [];
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default message templates
   */
  initializeDefaultTemplates() {
    const defaultTemplates = [
      {
        id: 'meeting_reminder',
        name: 'Meeting Reminder',
        category: 'meetings',
        content: 'Hi! Just a friendly reminder about our meeting at {time} today. Looking forward to seeing you!',
        variables: ['time'],
        isPublic: true
      },
      {
        id: 'task_assignment',
        name: 'Task Assignment',
        category: 'tasks',
        content: 'Hi {name}, I\'ve assigned you a new task: {task}. Please let me know if you have any questions.',
        variables: ['name', 'task'],
        isPublic: true
      },
      {
        id: 'status_update',
        name: 'Status Update',
        category: 'updates',
        content: 'Status update: {status}. Progress: {progress}%. Next steps: {nextSteps}',
        variables: ['status', 'progress', 'nextSteps'],
        isPublic: true
      },
      {
        id: 'welcome_message',
        name: 'Welcome Message',
        category: 'onboarding',
        content: 'Welcome to the team, {name}! We\'re excited to have you on board. Please don\'t hesitate to reach out if you need anything.',
        variables: ['name'],
        isPublic: true
      },
      {
        id: 'deadline_reminder',
        name: 'Deadline Reminder',
        category: 'deadlines',
        content: 'Reminder: {task} is due on {deadline}. Please make sure to complete it on time.',
        variables: ['task', 'deadline'],
        isPublic: true
      }
    ];

    defaultTemplates.forEach(template => {
      this.messageTemplates.set(template.id, template);
    });

    const defaultQuickReplies = [
      { id: 'thanks', text: 'Thanks!', category: 'general' },
      { id: 'ok', text: 'OK', category: 'general' },
      { id: 'sounds_good', text: 'Sounds good!', category: 'general' },
      { id: 'will_do', text: 'Will do!', category: 'general' },
      { id: 'on_it', text: 'On it!', category: 'tasks' },
      { id: 'need_help', text: 'I need help with this', category: 'support' },
      { id: 'done', text: 'Done!', category: 'tasks' },
      { id: 'in_progress', text: 'In progress...', category: 'tasks' },
      { id: 'blocked', text: 'I\'m blocked on this', category: 'tasks' },
      { id: 'meeting_confirmed', text: 'Meeting confirmed', category: 'meetings' },
      { id: 'meeting_declined', text: 'Can\'t make it to the meeting', category: 'meetings' },
      { id: 'lunch_break', text: 'Taking a lunch break', category: 'status' },
      { id: 'back_soon', text: 'Back soon', category: 'status' },
      { id: 'working_remotely', text: 'Working remotely today', category: 'status' }
    ];

    defaultQuickReplies.forEach(reply => {
      this.quickReplies.set(reply.id, reply);
    });
  }

  /**
   * Forward a message to another chat
   * NOTE: Messaging features removed - this method is now a no-op
   */
  async forwardMessage(messageId, targetChatId, userId, options = {}) {
    console.warn('⚠️ forwardMessage called but messaging features have been removed');
    throw new Error('Messaging features have been removed');
  }

  /**
   * Forward message to multiple chats
   * NOTE: Messaging features removed - this method is now a no-op
   */
  async forwardMessageToMultiple(messageId, targetChatIds, userId, options = {}) {
    console.warn('⚠️ forwardMessageToMultiple called but messaging features have been removed');
    throw new Error('Messaging features have been removed');
  }

  /**
   * Create a message template
   */
  async createTemplate(userId, templateData) {
    try {
      const {
        name,
        category = 'custom',
        content,
        variables = [],
        isPublic = false
      } = templateData;

      const template = {
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        category,
        content,
        variables,
        isPublic,
        createdBy: userId,
        createdAt: new Date(),
        usageCount: 0
      };

      this.messageTemplates.set(template.id, template);

      // Log template creation
      await auditService.logEvent({
        action: auditService.auditActions.MESSAGE_TEMPLATE_CREATED,
        performedBy: userId,
        details: {
          templateId: template.id,
          name,
          category,
          isPublic
        }
      });

      return {
        success: true,
        template
      };

    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  /**
   * Get available templates
   */
  getTemplates(userId, category = null) {
    const templates = Array.from(this.messageTemplates.values());
    
    let filteredTemplates = templates.filter(template => 
      template.isPublic || template.createdBy === userId
    );

    if (category) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.category === category
      );
    }

    return filteredTemplates.sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Use a message template
   */
  async useTemplate(templateId, variables = {}, userId = null) {
    try {
      const template = this.messageTemplates.get(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Increment usage count
      template.usageCount = (template.usageCount || 0) + 1;

      // Replace variables in content
      let content = template.content;
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{${key}}`;
        content = content.replace(new RegExp(placeholder, 'g'), value);
      }

      // Log template usage
      if (userId) {
        await auditService.logEvent({
          action: auditService.auditActions.MESSAGE_TEMPLATE_USED,
          performedBy: userId,
          details: {
            templateId,
            templateName: template.name,
            variables
          }
        });
      }

      return {
        success: true,
        content,
        template
      };

    } catch (error) {
      console.error('Failed to use template:', error);
      throw error;
    }
  }

  /**
   * Get quick replies
   */
  getQuickReplies(category = null) {
    const replies = Array.from(this.quickReplies.values());
    
    if (category) {
      return replies.filter(reply => reply.category === category);
    }

    return replies;
  }

  /**
   * Add custom quick reply
   */
  async addQuickReply(userId, replyData) {
    try {
      const { text, category = 'custom' } = replyData;

      const reply = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text,
        category,
        createdBy: userId,
        createdAt: new Date(),
        usageCount: 0
      };

      this.quickReplies.set(reply.id, reply);

      // Log quick reply creation
      await auditService.logEvent({
        action: auditService.auditActions.QUICK_REPLY_CREATED,
        performedBy: userId,
        details: {
          replyId: reply.id,
          text,
          category
        }
      });

      return {
        success: true,
        reply
      };

    } catch (error) {
      console.error('Failed to add quick reply:', error);
      throw error;
    }
  }

  /**
   * Use a quick reply
   */
  async useQuickReply(replyId, userId = null) {
    try {
      const reply = this.quickReplies.get(replyId);
      if (!reply) {
        throw new Error('Quick reply not found');
      }

      // Increment usage count
      reply.usageCount = (reply.usageCount || 0) + 1;

      // Log quick reply usage
      if (userId) {
        await auditService.logEvent({
          action: auditService.auditActions.QUICK_REPLY_USED,
          performedBy: userId,
          details: {
            replyId,
            text: reply.text,
            category: reply.category
          }
        });
      }

      return {
        success: true,
        text: reply.text,
        reply
      };

    } catch (error) {
      console.error('Failed to use quick reply:', error);
      throw error;
    }
  }

  /**
   * Get forwarding history
   */
  getForwardingHistory(userId, limit = 50) {
    return this.forwardingHistory
      .filter(entry => entry.forwardedBy === userId)
      .sort((a, b) => b.forwardedAt - a.forwardedAt)
      .slice(0, limit);
  }

  /**
   * Format forwarded message content
   */
  formatForwardedMessage(originalMessage, note = '') {
    // Messaging features removed - return empty string
    return '';
  }

  /**
   * Notify recipients of forwarded message
   * NOTE: Messaging features removed - this method is now a no-op
   */
  async notifyForwardedMessage(targetChat, forwardedMessage, forwardedBy) {
    console.warn('⚠️ notifyForwardedMessage called but messaging features have been removed');
    return;
  }

  /**
   * Get template categories
   */
  getTemplateCategories() {
    const categories = new Set();
    for (const template of this.messageTemplates.values()) {
      categories.add(template.category);
    }
    return Array.from(categories);
  }

  /**
   * Get quick reply categories
   */
  getQuickReplyCategories() {
    const categories = new Set();
    for (const reply of this.quickReplies.values()) {
      categories.add(reply.category);
    }
    return Array.from(categories);
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId, userId) {
    try {
      const template = this.messageTemplates.get(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      if (template.createdBy !== userId && !template.isPublic) {
        throw new Error('Access denied to delete template');
      }

      this.messageTemplates.delete(templateId);

      // Log template deletion
      await auditService.logEvent({
        action: auditService.auditActions.MESSAGE_TEMPLATE_DELETED,
        performedBy: userId,
        details: {
          templateId,
          templateName: template.name
        }
      });

      return {
        success: true
      };

    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  }

  /**
   * Delete a quick reply
   */
  async deleteQuickReply(replyId, userId) {
    try {
      const reply = this.quickReplies.get(replyId);
      if (!reply) {
        throw new Error('Quick reply not found');
      }

      if (reply.createdBy !== userId) {
        throw new Error('Access denied to delete quick reply');
      }

      this.quickReplies.delete(replyId);

      // Log quick reply deletion
      await auditService.logEvent({
        action: auditService.auditActions.QUICK_REPLY_DELETED,
        performedBy: userId,
        details: {
          replyId,
          text: reply.text
        }
      });

      return {
        success: true
      };

    } catch (error) {
      console.error('Failed to delete quick reply:', error);
      throw error;
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    const templates = Array.from(this.messageTemplates.values());
    const quickReplies = Array.from(this.quickReplies.values());

    return {
      templates: {
        total: templates.length,
        public: templates.filter(t => t.isPublic).length,
        private: templates.filter(t => !t.isPublic).length,
        categories: this.getTemplateCategories().length
      },
      quickReplies: {
        total: quickReplies.length,
        categories: this.getQuickReplyCategories().length
      },
      forwarding: {
        totalForwards: this.forwardingHistory.length
      }
    };
  }
}

// Create singleton instance
const messageForwardingService = new MessageForwardingService();

module.exports = messageForwardingService;
