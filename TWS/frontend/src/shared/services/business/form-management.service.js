// Form management service
const formManagementService = {
  // Get all form templates
  getFormTemplates: async () => {
    return [
      { id: 1, name: 'Employee Onboarding', fields: [] },
      { id: 2, name: 'Performance Review', fields: [] },
      { id: 3, name: 'Leave Request', fields: [] }
    ];
  },

  // Create new form template
  createFormTemplate: async (template) => {
    console.log('Creating form template:', template);
    return { id: Date.now(), ...template };
  },

  // Update form template
  updateFormTemplate: async (id, template) => {
    console.log('Updating form template:', id, template);
    return { id, ...template };
  },

  // Delete form template
  deleteFormTemplate: async (id) => {
    console.log('Deleting form template:', id);
    return { success: true };
  }
};

// Named export for backward compatibility
export const formTemplatesAPI = formManagementService;

export default formManagementService;