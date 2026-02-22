const axios = require('axios');
const { TimeEntry, Project, User } = require('../../models/Finance');
const { IntegrationLog } = require('../../models/Integration');

class TimeTrackingService {
  constructor(integration) {
    this.integration = integration;
    this.provider = integration.provider;
    this.credentials = integration.credentials;
  }

  async syncTimeEntries(startDate, endDate) {
    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;

    try {
      let timeEntries = [];
      
      switch (this.provider) {
        case 'harvest':
          timeEntries = await this.syncFromHarvest(startDate, endDate);
          break;
        case 'clockify':
          timeEntries = await this.syncFromClockify(startDate, endDate);
          break;
        case 'toggl':
          timeEntries = await this.syncFromToggl(startDate, endDate);
          break;
        case 'jira_tempo':
          timeEntries = await this.syncFromJiraTempo(startDate, endDate);
          break;
        case 'asana':
          timeEntries = await this.syncFromAsana(startDate, endDate);
          break;
        default:
          throw new Error(`Unsupported time tracking provider: ${this.provider}`);
      }

      // Process each time entry
      for (const entry of timeEntries) {
        try {
          recordsProcessed++;
          
          // Find or create user mapping
          const userMapping = this.integration.userMappings.find(
            mapping => mapping.externalUserId === entry.userId
          );
          
          if (!userMapping) {
            recordsFailed++;
            continue;
          }

          // Find or create project mapping
          const projectMapping = this.integration.projectMappings.find(
            mapping => mapping.externalProjectId === entry.projectId
          );
          
          if (!projectMapping) {
            recordsFailed++;
            continue;
          }

          // Check if time entry already exists
          const existingEntry = await TimeEntry.findOne({
            orgId: this.integration.orgId,
            'integration.externalId': entry.externalId
          });

          const timeEntryData = {
            employeeId: userMapping.internalUserId,
            projectId: projectMapping.internalProjectId,
            clientId: entry.clientId,
            date: new Date(entry.date),
            hours: entry.hours,
            description: entry.description,
            hourlyRate: userMapping.hourlyRate || entry.hourlyRate,
            billable: entry.billable,
            status: 'approved', // Auto-approve imported entries
            integration: {
              provider: this.provider,
              externalId: entry.externalId,
              externalProjectId: entry.projectId,
              externalTaskId: entry.taskId
            },
            orgId: this.integration.orgId
          };

          if (existingEntry) {
            await TimeEntry.findByIdAndUpdate(existingEntry._id, timeEntryData);
            recordsUpdated++;
          } else {
            await TimeEntry.create(timeEntryData);
            recordsCreated++;
          }

        } catch (error) {
          recordsFailed++;
          console.error(`Failed to process time entry ${entry.externalId}:`, error);
        }
      }

      // Log the sync operation
      await this.logSyncOperation('sync', 'success', 
        `Synced ${recordsCreated} new and ${recordsUpdated} updated time entries`, 
        {
          recordsProcessed,
          recordsCreated,
          recordsUpdated,
          recordsFailed,
          duration: Date.now() - startTime
        }
      );

      return {
        success: true,
        recordsProcessed,
        recordsCreated,
        recordsUpdated,
        recordsFailed,
        duration: Date.now() - startTime
      };

    } catch (error) {
      await this.logSyncOperation('sync', 'error', 
        `Failed to sync time entries: ${error.message}`, 
        { error: error.message, duration: Date.now() - startTime }
      );
      
      throw error;
    }
  }

  async syncFromHarvest(startDate, endDate) {
    const response = await axios.get(`${this.credentials.baseUrl}/time_entries`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'Harvest-Account-ID': this.credentials.accountId,
        'User-Agent': 'Finance-Ecosystem/1.0'
      },
      params: {
        from: startDate,
        to: endDate,
        per_page: 100
      }
    });

    return response.data.time_entries.map(entry => ({
      externalId: entry.id.toString(),
      userId: entry.user.id.toString(),
      projectId: entry.project.id.toString(),
      taskId: entry.task.id.toString(),
      clientId: entry.client.id.toString(),
      date: entry.spent_date,
      hours: entry.hours,
      description: entry.notes,
      billable: entry.billable,
      hourlyRate: entry.hourly_rate
    }));
  }

  async syncFromClockify(startDate, endDate) {
    const response = await axios.get(`${this.credentials.baseUrl}/workspaces/${this.credentials.workspaceId}/time-entries`, {
      headers: {
        'X-Api-Key': this.credentials.apiKey
      },
      params: {
        start: startDate,
        end: endDate,
        pageSize: 1000
      }
    });

    return response.data.map(entry => ({
      externalId: entry.id,
      userId: entry.userId,
      projectId: entry.projectId,
      taskId: entry.taskId,
      clientId: entry.project?.clientId,
      date: entry.timeInterval.start.split('T')[0],
      hours: entry.timeInterval.duration / 3600, // Convert seconds to hours
      description: entry.description,
      billable: entry.billable,
      hourlyRate: null
    }));
  }

  async syncFromToggl(startDate, endDate) {
    const response = await axios.get(`${this.credentials.baseUrl}/time_entries`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.credentials.apiKey}:api_token`).toString('base64')}`
      },
      params: {
        start_date: startDate,
        end_date: endDate
      }
    });

    return response.data.map(entry => ({
      externalId: entry.id.toString(),
      userId: entry.user_id.toString(),
      projectId: entry.project_id?.toString(),
      taskId: entry.task_id?.toString(),
      clientId: entry.client_id?.toString(),
      date: entry.start.split('T')[0],
      hours: entry.duration / 3600, // Convert seconds to hours
      description: entry.description,
      billable: entry.billable,
      hourlyRate: null
    }));
  }

  async syncFromJiraTempo(startDate, endDate) {
    const response = await axios.get(`${this.credentials.baseUrl}/timesheet`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`
      },
      params: {
        from: startDate,
        to: endDate,
        limit: 1000
      }
    });

    const timeEntries = [];
    response.data.results.forEach(result => {
      result.worklogs.forEach(worklog => {
        timeEntries.push({
          externalId: worklog.tempoWorklogId.toString(),
          userId: worklog.author.accountId,
          projectId: worklog.issue.projectId.toString(),
          taskId: worklog.issue.id.toString(),
          clientId: null,
          date: worklog.startDate,
          hours: worklog.timeSpentSeconds / 3600, // Convert seconds to hours
          description: worklog.description,
          billable: true,
          hourlyRate: null
        });
      });
    });

    return timeEntries;
  }

  async syncFromAsana(startDate, endDate) {
    // Asana doesn't have direct time tracking, but we can sync task data
    // This would require a different approach or integration with Asana's time tracking apps
    throw new Error('Asana time tracking sync not implemented - requires third-party time tracking app integration');
  }

  async logSyncOperation(type, status, message, details = {}) {
    await IntegrationLog.create({
      integrationId: this.integration._id,
      type,
      status,
      message,
      details,
      recordsProcessed: details.recordsProcessed || 0,
      recordsCreated: details.recordsCreated || 0,
      recordsUpdated: details.recordsUpdated || 0,
      recordsFailed: details.recordsFailed || 0,
      duration: details.duration || 0,
      orgId: this.integration.orgId
    });
  }

  async testConnection() {
    try {
      switch (this.provider) {
        case 'harvest':
          await axios.get(`${this.credentials.baseUrl}/users/me`, {
            headers: {
              'Authorization': `Bearer ${this.credentials.accessToken}`,
              'Harvest-Account-ID': this.credentials.accountId
            }
          });
          break;
        case 'clockify':
          await axios.get(`${this.credentials.baseUrl}/user`, {
            headers: {
              'X-Api-Key': this.credentials.apiKey
            }
          });
          break;
        case 'toggl':
          await axios.get(`${this.credentials.baseUrl}/me`, {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${this.credentials.apiKey}:api_token`).toString('base64')}`
            }
          });
          break;
        default:
          throw new Error(`Connection test not implemented for ${this.provider}`);
      }
      
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = TimeTrackingService;
