const nodemailer = require('nodemailer');
// REMOVED: twilio and Expo (SMS and push notifications removed - email only)
const Meeting = require('../../models/Meeting');
const User = require('../../models/User');

class MeetingReminderService {
  constructor() {
    this.emailTransporter = this.initializeEmailTransporter();
    // REMOVED: Twilio and Expo initialization (SMS and push removed)
  }

  initializeEmailTransporter() {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // REMOVED: initializeTwilioClient (SMS notifications removed)

  // Send email reminder
  async sendEmailReminder(meeting, attendee, reminderType) {
    try {
      const subject = this.getEmailSubject(meeting, reminderType);
      const html = this.generateEmailTemplate(meeting, attendee, reminderType);

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@wolfstack.com',
        to: attendee.email,
        subject: subject,
        html: html
      });

      console.log(`Email reminder sent to ${attendee.email} for meeting: ${meeting.title}`);
      return true;
    } catch (error) {
      console.error('Error sending email reminder:', error);
      return false;
    }
  }

  // REMOVED: sendSMSReminder (SMS notifications removed - email only)
  
  // REMOVED: sendPushNotification (push notifications removed - email only)

  // Process all reminders for a meeting
  async processMeetingReminders(meetingId) {
    try {
      // SIMPLIFIED: Only populate email (phone and expoPushToken removed)
      const meeting = await Meeting.findById(meetingId)
        .populate('organizer', 'name email')
        .populate('attendees.user', 'name email');

      if (!meeting) {
        console.error('Meeting not found:', meetingId);
        return;
      }

      const now = new Date();
      const meetingStart = new Date(meeting.startTime);
      const timeUntilMeeting = meetingStart - now;

      // Process each reminder
      for (const reminder of meeting.reminders) {
        const reminderTime = reminder.timeBefore * 60 * 1000; // Convert minutes to milliseconds

        if (timeUntilMeeting <= reminderTime && timeUntilMeeting > 0 && !reminder.sent) {
          await this.sendReminderToAllAttendees(meeting, reminder);
          
          // Mark reminder as sent
          reminder.sent = true;
          reminder.sentAt = new Date();
        }
      }

      await meeting.save();
    } catch (error) {
      console.error('Error processing meeting reminders:', error);
    }
  }

  // Send reminder to all attendees
  async sendReminderToAllAttendees(meeting, reminder) {
    const allAttendees = [
      ...meeting.attendees.map(a => ({ ...a.user.toObject(), isInternal: true })),
      ...meeting.externalAttendees.map(a => ({ ...a, isInternal: false }))
    ];

    for (const attendee of allAttendees) {
      try {
        let sent = false;

        // SIMPLIFIED: Email only (SMS and push removed)
        if (reminder.type === 'email') {
          sent = await this.sendEmailReminder(meeting, attendee, 'reminder');
        }
        // REMOVED: SMS and push notification cases

        if (sent) {
          console.log(`Reminder sent successfully to ${attendee.email}`);
        }
      } catch (error) {
        console.error(`Error sending reminder to ${attendee.email}:`, error);
      }
    }
  }

  // Generate email subject
  getEmailSubject(meeting, reminderType) {
    const timeUntil = this.getTimeUntilMeeting(meeting.startTime);
    
    switch (reminderType) {
      case 'reminder':
        return `Meeting Reminder: ${meeting.title} in ${timeUntil}`;
      case 'starting_soon':
        return `Meeting Starting Soon: ${meeting.title}`;
      case 'cancelled':
        return `Meeting Cancelled: ${meeting.title}`;
      case 'rescheduled':
        return `Meeting Rescheduled: ${meeting.title}`;
      default:
        return `Meeting Update: ${meeting.title}`;
    }
  }

  // Generate email template
  generateEmailTemplate(meeting, attendee, reminderType) {
    const meetingDate = new Date(meeting.startTime).toLocaleDateString();
    const meetingTime = new Date(meeting.startTime).toLocaleTimeString();
    const meetingUrl = meeting.location.meetingUrl || '#';
    const platform = meeting.location.platform || 'virtual';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Meeting Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .meeting-details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Meeting Reminder</h1>
          </div>
          <div class="content">
            <p>Hello ${attendee.name},</p>
            <p>This is a reminder about your upcoming meeting:</p>
            
            <div class="meeting-details">
              <h2>${meeting.title}</h2>
              <p><strong>Date:</strong> ${meetingDate}</p>
              <p><strong>Time:</strong> ${meetingTime}</p>
              <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
              <p><strong>Platform:</strong> ${platform}</p>
              ${meeting.description ? `<p><strong>Description:</strong> ${meeting.description}</p>` : ''}
            </div>

            ${meeting.location.meetingUrl ? `
              <p style="text-align: center;">
                <a href="${meetingUrl}" class="button">Join Meeting</a>
              </p>
            ` : ''}

            ${meeting.agenda && meeting.agenda.length > 0 ? `
              <h3>Agenda:</h3>
              <ul>
                ${meeting.agenda.map(item => `<li>${item.item} (${item.duration} min)</li>`).join('')}
              </ul>
            ` : ''}

            <p>Best regards,<br>The Wolf Stack Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // REMOVED: generateSMSTemplate (SMS notifications removed)
  
  // REMOVED: generatePushTemplate (push notifications removed)

  // Get time until meeting in human readable format
  getTimeUntilMeeting(meetingStart) {
    const now = new Date();
    const diff = meetingStart - now;
    
    if (diff <= 0) return 'now';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  // Schedule reminder job
  scheduleReminder(meetingId, reminderTime) {
    // This would integrate with a job queue like Bull or Agenda
    // For now, we'll use setTimeout as a simple implementation
    const now = new Date();
    const meetingStart = new Date(reminderTime);
    const delay = meetingStart - now;

    if (delay > 0) {
      setTimeout(() => {
        this.processMeetingReminders(meetingId);
      }, delay);
    }
  }

  // Send meeting cancellation notice
  async sendCancellationNotice(meeting, reason) {
    const allAttendees = [
      ...meeting.attendees.map(a => ({ ...a.user.toObject(), isInternal: true })),
      ...meeting.externalAttendees.map(a => ({ ...a, isInternal: false }))
    ];

    for (const attendee of allAttendees) {
      try {
        // SIMPLIFIED: Email only (SMS and push removed)
        await this.sendEmailReminder(meeting, attendee, 'cancelled');
      } catch (error) {
        console.error(`Error sending cancellation notice to ${attendee.email}:`, error);
      }
    }
  }

  // Send meeting reschedule notice
  async sendRescheduleNotice(meeting, oldStartTime, oldEndTime) {
    const allAttendees = [
      ...meeting.attendees.map(a => ({ ...a.user.toObject(), isInternal: true })),
      ...meeting.externalAttendees.map(a => ({ ...a, isInternal: false }))
    ];

    for (const attendee of allAttendees) {
      try {
        // SIMPLIFIED: Email only (SMS and push removed)
        await this.sendEmailReminder(meeting, attendee, 'rescheduled');
      } catch (error) {
        console.error(`Error sending reschedule notice to ${attendee.email}:`, error);
      }
    }
  }
}

module.exports = new MeetingReminderService();
