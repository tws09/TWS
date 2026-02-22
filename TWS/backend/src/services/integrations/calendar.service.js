const { google } = require('googleapis');
const { Client } = require('@microsoft/microsoft-graph-client');
const User = require('../../models/User');
const Meeting = require('../../models/Meeting');

class CalendarService {
  constructor() {
    this.googleOAuth2Client = null;
    this.microsoftGraphClient = null;
  }

  // Google Calendar integration
  async initializeGoogleClient(userId) {
    const user = await User.findById(userId);
    if (!user || !user.googleAccessToken) {
      throw new Error('Google Calendar not connected for this user');
    }

    this.googleOAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.googleOAuth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      expiry_date: user.googleTokenExpiry
    });

    return google.calendar({ version: 'v3', auth: this.googleOAuth2Client });
  }

  // Microsoft Graph integration
  async initializeMicrosoftClient(userId) {
    const user = await User.findById(userId);
    if (!user || !user.microsoftAccessToken) {
      throw new Error('Microsoft Calendar not connected for this user');
    }

    this.microsoftGraphClient = Client.init({
      authProvider: {
        getAccessToken: async () => {
          // Check if token is expired and refresh if needed
          if (user.microsoftTokenExpiry && new Date() >= user.microsoftTokenExpiry) {
            await this.refreshMicrosoftToken(user);
          }
          return user.microsoftAccessToken;
        }
      }
    });

    return this.microsoftGraphClient;
  }

  // Create meeting in Google Calendar
  async createGoogleMeeting(userId, meetingData) {
    try {
      const calendar = await this.initializeGoogleClient(userId);
      
      const event = {
        summary: meetingData.title,
        description: meetingData.description,
        start: {
          dateTime: meetingData.startTime,
          timeZone: meetingData.timezone || 'UTC'
        },
        end: {
          dateTime: meetingData.endTime,
          timeZone: meetingData.timezone || 'UTC'
        },
        attendees: meetingData.attendees?.map(email => ({ email })) || [],
        conferenceData: {
          createRequest: {
            requestId: `meeting-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 }
          ]
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
      });

      return {
        success: true,
        eventId: response.data.id,
        meetingLink: response.data.conferenceData?.entryPoints?.[0]?.uri,
        calendarLink: response.data.htmlLink,
        data: response.data
      };
    } catch (error) {
      console.error('Google Calendar error:', error);
      throw new Error(`Failed to create Google Calendar meeting: ${error.message}`);
    }
  }

  // Create meeting in Microsoft Calendar
  async createMicrosoftMeeting(userId, meetingData) {
    try {
      const graphClient = await this.initializeMicrosoftClient(userId);
      
      const event = {
        subject: meetingData.title,
        body: {
          contentType: 'HTML',
          content: meetingData.description || ''
        },
        start: {
          dateTime: meetingData.startTime,
          timeZone: meetingData.timezone || 'UTC'
        },
        end: {
          dateTime: meetingData.endTime,
          timeZone: meetingData.timezone || 'UTC'
        },
        attendees: meetingData.attendees?.map(email => ({
          emailAddress: { address: email },
          type: 'required'
        })) || [],
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness'
      };

      const response = await graphClient
        .me
        .events
        .post(event);

      return {
        success: true,
        eventId: response.id,
        meetingLink: response.onlineMeeting?.joinUrl,
        calendarLink: response.webLink,
        data: response
      };
    } catch (error) {
      console.error('Microsoft Calendar error:', error);
      throw new Error(`Failed to create Microsoft Calendar meeting: ${error.message}`);
    }
  }

  // Get user's calendar events
  async getGoogleEvents(userId, timeMin, timeMax) {
    try {
      const calendar = await this.initializeGoogleClient(userId);
      
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Google Calendar fetch error:', error);
      throw new Error(`Failed to fetch Google Calendar events: ${error.message}`);
    }
  }

  // Get user's Microsoft events
  async getMicrosoftEvents(userId, startDateTime, endDateTime) {
    try {
      const graphClient = await this.initializeMicrosoftClient(userId);
      
      const response = await graphClient
        .me
        .calendar
        .events
        .get({
          queryParameters: {
            startDateTime: startDateTime || new Date().toISOString(),
            endDateTime: endDateTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        });

      return response.value || [];
    } catch (error) {
      console.error('Microsoft Calendar fetch error:', error);
      throw new Error(`Failed to fetch Microsoft Calendar events: ${error.message}`);
    }
  }

  // Check user's availability
  async checkAvailability(userId, startTime, endTime, calendarType = 'google') {
    try {
      let events = [];
      
      if (calendarType === 'google') {
        events = await this.getGoogleEvents(userId, startTime, endTime);
      } else if (calendarType === 'microsoft') {
        events = await this.getMicrosoftEvents(userId, startTime, endTime);
      }

      // Check for conflicts
      const conflicts = events.filter(event => {
        const eventStart = new Date(event.start?.dateTime || event.start?.date);
        const eventEnd = new Date(event.end?.dateTime || event.end?.date);
        const requestedStart = new Date(startTime);
        const requestedEnd = new Date(endTime);

        return (eventStart < requestedEnd && eventEnd > requestedStart);
      });

      return {
        available: conflicts.length === 0,
        conflicts: conflicts.map(event => ({
          title: event.summary || event.subject,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date
        }))
      };
    } catch (error) {
      console.error('Availability check error:', error);
      throw new Error(`Failed to check availability: ${error.message}`);
    }
  }

  // Schedule meeting with multiple attendees
  async scheduleMeeting(organizerId, meetingData) {
    try {
      const organizer = await User.findById(organizerId);
      if (!organizer) {
        throw new Error('Organizer not found');
      }

      // Check organizer's availability
      const organizerAvailability = await this.checkAvailability(
        organizerId, 
        meetingData.startTime, 
        meetingData.endTime,
        organizer.googleAccessToken ? 'google' : 'microsoft'
      );

      if (!organizerAvailability.available) {
        return {
          success: false,
          message: 'Organizer is not available at the requested time',
          conflicts: organizerAvailability.conflicts
        };
      }

      // Create meeting in organizer's calendar
      let calendarResult;
      if (organizer.googleAccessToken) {
        calendarResult = await this.createGoogleMeeting(organizerId, meetingData);
      } else if (organizer.microsoftAccessToken) {
        calendarResult = await this.createMicrosoftMeeting(organizerId, meetingData);
      } else {
        throw new Error('No calendar integration found for organizer');
      }

      // Save meeting to database
      const meeting = new Meeting({
        title: meetingData.title,
        description: meetingData.description,
        startTime: meetingData.startTime,
        endTime: meetingData.endTime,
        timezone: meetingData.timezone || 'UTC',
        organizerId,
        attendees: meetingData.attendees || [],
        meetingLink: calendarResult.meetingLink,
        calendarEventId: calendarResult.eventId,
        calendarType: organizer.googleAccessToken ? 'google' : 'microsoft',
        status: 'scheduled',
        workspaceId: meetingData.workspaceId,
        channelId: meetingData.channelId,
        organization: organizer.orgId
      });

      await meeting.save();

      return {
        success: true,
        meeting,
        calendarResult
      };
    } catch (error) {
      console.error('Meeting scheduling error:', error);
      throw new Error(`Failed to schedule meeting: ${error.message}`);
    }
  }

  // Refresh Microsoft token
  async refreshMicrosoftToken(user) {
    try {
      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET,
          refresh_token: user.microsoftRefreshToken,
          grant_type: 'refresh_token'
        })
      });

      const data = await response.json();
      
      if (data.access_token) {
        user.microsoftAccessToken = data.access_token;
        user.microsoftTokenExpiry = new Date(Date.now() + data.expires_in * 1000);
        await user.save();
      }
    } catch (error) {
      console.error('Microsoft token refresh error:', error);
      throw new Error('Failed to refresh Microsoft token');
    }
  }

  // Get meeting suggestions based on attendees' availability
  async getMeetingSuggestions(organizerId, attendees, duration, dateRange) {
    try {
      const suggestions = [];
      const { startDate, endDate } = dateRange;
      
      // Get availability for all attendees
      const availabilityPromises = attendees.map(async (attendeeId) => {
        const user = await User.findById(attendeeId);
        if (!user) return null;
        
        const calendarType = user.googleAccessToken ? 'google' : 'microsoft';
        return this.checkAvailability(attendeeId, startDate, endDate, calendarType);
      });

      const availabilityResults = await Promise.all(availabilityPromises);
      
      // Find common free time slots
      // This is a simplified implementation - in production, you'd want more sophisticated scheduling logic
      const start = new Date(startDate);
      const end = new Date(endDate);
      const interval = 30 * 60 * 1000; // 30 minutes
      
      for (let time = start.getTime(); time < end.getTime(); time += interval) {
        const slotStart = new Date(time);
        const slotEnd = new Date(time + duration * 60 * 1000);
        
        // Check if all attendees are available
        const allAvailable = availabilityResults.every(result => {
          if (!result) return false;
          return result.conflicts.every(conflict => {
            const conflictStart = new Date(conflict.start);
            const conflictEnd = new Date(conflict.end);
            return !(conflictStart < slotEnd && conflictEnd > slotStart);
          });
        });

        if (allAvailable) {
          suggestions.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            score: 1.0 // Could be calculated based on various factors
          });
        }
      }

      return suggestions.slice(0, 10); // Return top 10 suggestions
    } catch (error) {
      console.error('Meeting suggestions error:', error);
      throw new Error(`Failed to get meeting suggestions: ${error.message}`);
    }
  }
}

module.exports = new CalendarService();
