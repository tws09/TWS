const { Worker } = require('bullmq');
const retentionService = require('../services/compliance/retention.service');
const auditService = require('../../services/compliance/audit.service');
const Organization = require('../models/Organization');

/**
 * Retention Worker
 * Automatically enforces retention policies across all organizations
 */
class RetentionWorker {
  constructor() {
    this.worker = new Worker('retention-queue', this.processRetentionJob.bind(this), {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
      },
      concurrency: 1, // Process one organization at a time
      removeOnComplete: 10,
      removeOnFail: 5
    });

    this.setupEventHandlers();
  }

  /**
   * Process retention job for an organization
   */
  async processRetentionJob(job) {
    const { orgId, jobType } = job.data;
    
    try {
      console.log(`Processing retention job for organization: ${orgId}, type: ${jobType}`);
      
      let result;
      switch (jobType) {
        case 'soft_delete':
          result = await retentionService.softDeleteExpiredMessages(orgId);
          break;
        case 'purge':
          result = await retentionService.purgeDeletedMessages(orgId);
          break;
        case 'full_enforcement':
          result = await retentionService.enforceRetentionPolicy(orgId);
          break;
        default:
          throw new Error(`Unknown job type: ${jobType}`);
      }

      // Log successful completion
      await auditService.logAdminEvent(
        auditService.auditActions.DATA_PURGE,
        null, // System action
        orgId,
        {
          reason: `Automated retention job completed: ${jobType}`,
          details: {
            jobType,
            result,
            jobId: job.id
          }
        }
      );

      return result;
    } catch (error) {
      console.error(`Retention job failed for organization ${orgId}:`, error);
      
      // Log the failure
      await auditService.logAdminEvent(
        auditService.auditActions.DATA_PURGE,
        null, // System action
        orgId,
        {
          reason: `Automated retention job failed: ${jobType}`,
          details: {
            jobType,
            error: error.message,
            jobId: job.id
          },
          severity: 'error'
        }
      );

      throw error;
    }
  }

  /**
   * Setup event handlers for the worker
   */
  setupEventHandlers() {
    this.worker.on('completed', (job) => {
      console.log(`Retention job completed: ${job.id}`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Retention job failed: ${job.id}`, err);
    });

    this.worker.on('error', (err) => {
      console.error('Retention worker error:', err);
    });
  }

  /**
   * Schedule retention jobs for all organizations
   */
  async scheduleRetentionJobs() {
    try {
      const organizations = await Organization.find({ status: 'active' });
      
      for (const org of organizations) {
        // Schedule soft delete job (daily)
        await this.scheduleJob(org._id, 'soft_delete', {
          repeat: { cron: '0 2 * * *' }, // Daily at 2 AM
          jobId: `soft-delete-${org._id}`
        });

        // Schedule purge job (weekly)
        await this.scheduleJob(org._id, 'purge', {
          repeat: { cron: '0 3 * * 0' }, // Weekly on Sunday at 3 AM
          jobId: `purge-${org._id}`
        });

        // Schedule full enforcement job (monthly)
        await this.scheduleJob(org._id, 'full_enforcement', {
          repeat: { cron: '0 4 1 * *' }, // Monthly on 1st at 4 AM
          jobId: `full-enforcement-${org._id}`
        });
      }

      console.log(`Scheduled retention jobs for ${organizations.length} organizations`);
    } catch (error) {
      console.error('Failed to schedule retention jobs:', error);
    }
  }

  /**
   * Schedule a single retention job
   */
  async scheduleJob(orgId, jobType, options = {}) {
    const { Queue } = require('bullmq');
    
    const queue = new Queue('retention-queue', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
      }
    });

    await queue.add(
      `${jobType}-${orgId}`,
      { orgId, jobType },
      {
        ...options,
        removeOnComplete: 10,
        removeOnFail: 5
      }
    );
  }

  /**
   * Run immediate retention enforcement for an organization
   */
  async runImmediateEnforcement(orgId, jobType = 'full_enforcement') {
    const { Queue } = require('bullmq');
    
    const queue = new Queue('retention-queue', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
      }
    });

    const job = await queue.add(
      `immediate-${jobType}-${orgId}`,
      { orgId, jobType },
      {
        priority: 1, // High priority
        removeOnComplete: 10,
        removeOnFail: 5
      }
    );

    return job;
  }

  /**
   * Get retention job status
   */
  async getJobStatus(orgId, jobType) {
    const { Queue } = require('bullmq');
    
    const queue = new Queue('retention-queue', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
      }
    });

    const jobs = await queue.getJobs(['waiting', 'active', 'completed', 'failed']);
    const orgJobs = jobs.filter(job => 
      job.data.orgId.toString() === orgId.toString() && 
      job.data.jobType === jobType
    );

    const jobStatuses = await Promise.all(
      orgJobs.map(async job => ({
        id: job.id,
        name: job.name,
        data: job.data,
        state: await job.getState(),
        progress: job.progress,
        returnvalue: job.returnvalue,
        failedReason: job.failedReason,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn
      }))
    );
    
    return jobStatuses;
  }

  /**
   * Stop the worker
   */
  async stop() {
    await this.worker.close();
  }
}

// Create singleton instance
const retentionWorker = new RetentionWorker();

// Export the worker instance and utility functions
module.exports = {
  retentionWorker,
  scheduleRetentionJobs: () => retentionWorker.scheduleRetentionJobs(),
  runImmediateEnforcement: (orgId, jobType) => retentionWorker.runImmediateEnforcement(orgId, jobType),
  getJobStatus: (orgId, jobType) => retentionWorker.getJobStatus(orgId, jobType)
};
