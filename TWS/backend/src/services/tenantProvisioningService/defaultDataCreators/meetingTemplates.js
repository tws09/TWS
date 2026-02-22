const MeetingTemplate = require('../../../models/MeetingTemplate');

/**
 * Create default meeting templates
 * @param {Object} tenant - Tenant record
 * @param {Object} organization - Organization record
 * @param {Object} session - MongoDB session
 */
async function createDefaultMeetingTemplates(tenant, organization, session) {
  try {
    const templates = [
      {
        name: 'Daily Standup',
        description: 'Daily team standup meeting',
        orgId: organization._id,
        tenantId: tenant.tenantId,
        duration: 15,
        agenda: [
          'What did you accomplish yesterday?',
          'What will you work on today?',
          'Are there any blockers?'
        ],
        isDefault: true,
        status: 'active'
      },
      {
        name: 'Project Review',
        description: 'Weekly project review meeting',
        orgId: organization._id,
        tenantId: tenant.tenantId,
        duration: 60,
        agenda: [
          'Project status update',
          'Budget review',
          'Timeline assessment',
          'Risk identification',
          'Next week planning'
        ],
        isDefault: true,
        status: 'active'
      },
      {
        name: 'Client Meeting',
        description: 'Client consultation meeting',
        orgId: organization._id,
        tenantId: tenant.tenantId,
        duration: 90,
        agenda: [
          'Requirements discussion',
          'Project scope',
          'Timeline and budget',
          'Next steps'
        ],
        isDefault: true,
        status: 'active'
      }
    ];

    for (const templateData of templates) {
      const template = new MeetingTemplate(templateData);
      await template.save({ session });
    }
    
  } catch (error) {
    console.error('Error creating default meeting templates:', error);
    throw error;
  }
}

module.exports = {
  createDefaultMeetingTemplates
};

