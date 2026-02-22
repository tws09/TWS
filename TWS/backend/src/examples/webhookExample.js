/**
 * Example: How to use the webhook system to post messages to channels
 * 
 * This file demonstrates how external applications can integrate with
 * the TWS messaging system using webhooks.
 */

const axios = require('axios');

// Example 1: Post a simple message to a channel
async function postMessageToChannel(apiKey, channelId, message, sender = null) {
  try {
    const response = await axios.post(`/api/webhooks/post/${apiKey}`, {
      message: message,
      sender: sender || {
        name: 'External App',
        avatar: 'https://example.com/bot-avatar.png'
      },
      metadata: {
        source: 'external-app',
        timestamp: new Date().toISOString()
      }
    });

    console.log('Message posted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to post message:', error.response?.data || error.message);
    throw error;
  }
}

// Example 2: Post a message with attachments
async function postMessageWithAttachments(apiKey, message, attachments) {
  try {
    const response = await axios.post(`/api/webhooks/post/${apiKey}`, {
      message: message,
      sender: {
        name: 'File Upload Bot',
        avatar: 'https://example.com/file-bot.png'
      },
      attachments: attachments.map(file => ({
        name: file.name,
        url: file.url,
        type: file.type,
        size: file.size
      })),
      metadata: {
        source: 'file-upload-service',
        uploadId: Date.now()
      }
    });

    console.log('Message with attachments posted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to post message with attachments:', error.response?.data || error.message);
    throw error;
  }
}

// Example 3: Post a formatted message with rich content
async function postRichMessage(apiKey, title, content, actions = []) {
  try {
    const richMessage = `
**${title}**

${content}

${actions.length > 0 ? '\n**Available Actions:**\n' + actions.map(action => `- ${action}`).join('\n') : ''}
    `.trim();

    const response = await axios.post(`/api/webhooks/post/${apiKey}`, {
      message: richMessage,
      sender: {
        name: 'Notification Bot',
        avatar: 'https://example.com/notification-bot.png'
      },
      metadata: {
        source: 'notification-service',
        type: 'rich-message',
        actions: actions,
        priority: 'normal'
      }
    });

    console.log('Rich message posted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to post rich message:', error.response?.data || error.message);
    throw error;
  }
}

// Example 4: Integration with CI/CD pipeline
async function notifyDeploymentStatus(apiKey, deployment) {
  const statusEmoji = deployment.status === 'success' ? '✅' : '❌';
  const message = `
${statusEmoji} **Deployment ${deployment.status.toUpperCase()}**

**Project:** ${deployment.project}
**Environment:** ${deployment.environment}
**Version:** ${deployment.version}
**Duration:** ${deployment.duration}
**Commit:** \`${deployment.commit}\`

${deployment.status === 'success' ? '🎉 Deployment completed successfully!' : '⚠️ Deployment failed. Check logs for details.'}
  `.trim();

  try {
    const response = await axios.post(`/api/webhooks/post/${apiKey}`, {
      message: message,
      sender: {
        name: 'CI/CD Bot',
        avatar: 'https://example.com/cicd-bot.png'
      },
      metadata: {
        source: 'ci-cd-pipeline',
        deploymentId: deployment.id,
        status: deployment.status,
        environment: deployment.environment,
        project: deployment.project
      }
    });

    console.log('Deployment notification sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send deployment notification:', error.response?.data || error.message);
    throw error;
  }
}

// Example 5: Integration with monitoring system
async function sendAlert(apiKey, alert) {
  const severityEmoji = {
    critical: '🚨',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const message = `
${severityEmoji[alert.severity]} **${alert.severity.toUpperCase()} Alert**

**Service:** ${alert.service}
**Message:** ${alert.message}
**Time:** ${new Date(alert.timestamp).toLocaleString()}
**Value:** ${alert.value}${alert.unit ? ` ${alert.unit}` : ''}

${alert.url ? `[View Details](${alert.url})` : ''}
  `.trim();

  try {
    const response = await axios.post(`/api/webhooks/post/${apiKey}`, {
      message: message,
      sender: {
        name: 'Monitoring Bot',
        avatar: 'https://example.com/monitoring-bot.png'
      },
      metadata: {
        source: 'monitoring-system',
        alertId: alert.id,
        severity: alert.severity,
        service: alert.service,
        timestamp: alert.timestamp
      }
    });

    console.log('Alert sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send alert:', error.response?.data || error.message);
    throw error;
  }
}

// Example 6: Integration with project management system
async function notifyTaskUpdate(apiKey, task) {
  const statusEmoji = {
    completed: '✅',
    in_progress: '🔄',
    pending: '⏳',
    blocked: '🚫'
  };

  const message = `
${statusEmoji[task.status]} **Task Updated**

**Title:** ${task.title}
**Status:** ${task.status.charAt(0).toUpperCase() + task.status.slice(1)}
**Assignee:** ${task.assignee}
**Priority:** ${task.priority}
**Due Date:** ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}

${task.description ? `\n**Description:**\n${task.description}` : ''}
  `.trim();

  try {
    const response = await axios.post(`/api/webhooks/post/${apiKey}`, {
      message: message,
      sender: {
        name: 'Project Bot',
        avatar: 'https://example.com/project-bot.png'
      },
      metadata: {
        source: 'project-management',
        taskId: task.id,
        status: task.status,
        assignee: task.assignee,
        priority: task.priority
      }
    });

    console.log('Task update notification sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send task update:', error.response?.data || error.message);
    throw error;
  }
}

// Example 7: Batch message posting
async function postBatchMessages(apiKey, messages) {
  const results = [];
  
  for (const messageData of messages) {
    try {
      const result = await postMessageToChannel(
        apiKey, 
        messageData.channelId, 
        messageData.message, 
        messageData.sender
      );
      results.push({ success: true, data: result });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
    
    // Add delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

// Example 8: Error handling and retry logic
async function postMessageWithRetry(apiKey, message, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(`/api/webhooks/post/${apiKey}`, {
        message: message,
        sender: {
          name: 'Retry Bot',
          avatar: 'https://example.com/retry-bot.png'
        },
        metadata: {
          source: 'retry-example',
          attempt: attempt,
          maxRetries: maxRetries
        }
      });
      
      console.log(`Message posted successfully on attempt ${attempt}`);
      return response.data;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error.response?.data || error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed to post message after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

// Example usage
async function exampleUsage() {
  const apiKey = 'your-webhook-api-key-here';
  
  try {
    // Simple message
    await postMessageToChannel(apiKey, null, 'Hello from external app!');
    
    // Message with attachments
    await postMessageWithAttachments(apiKey, 'Here are the files you requested:', [
      { name: 'report.pdf', url: 'https://example.com/report.pdf', type: 'application/pdf', size: 1024000 },
      { name: 'data.xlsx', url: 'https://example.com/data.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 512000 }
    ]);
    
    // Rich message
    await postRichMessage(apiKey, 'System Update', 'The system has been updated with new features.', [
      'View changelog',
      'Test new features',
      'Report issues'
    ]);
    
    // Deployment notification
    await notifyDeploymentStatus(apiKey, {
      id: 'deploy-123',
      project: 'MyApp',
      environment: 'production',
      version: 'v1.2.3',
      status: 'success',
      duration: '2m 30s',
      commit: 'abc123def'
    });
    
    // Alert notification
    await sendAlert(apiKey, {
      id: 'alert-456',
      service: 'Database',
      message: 'High CPU usage detected',
      severity: 'warning',
      value: 85,
      unit: '%',
      timestamp: new Date().toISOString(),
      url: 'https://monitoring.example.com/alerts/456'
    });
    
    // Task update
    await notifyTaskUpdate(apiKey, {
      id: 'task-789',
      title: 'Implement user authentication',
      status: 'completed',
      assignee: 'John Doe',
      priority: 'high',
      dueDate: new Date().toISOString(),
      description: 'Add JWT-based authentication to the API'
    });
    
    console.log('All examples completed successfully!');
  } catch (error) {
    console.error('Example failed:', error.message);
  }
}

module.exports = {
  postMessageToChannel,
  postMessageWithAttachments,
  postRichMessage,
  notifyDeploymentStatus,
  sendAlert,
  notifyTaskUpdate,
  postBatchMessages,
  postMessageWithRetry,
  exampleUsage
};
