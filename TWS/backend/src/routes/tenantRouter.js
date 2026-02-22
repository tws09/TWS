/**
 * Tenant Router Base Controller
 * Provides base functionality for tenant-related controllers
 */
class TenantController {
  constructor() {
    this.model = null;
  }

  /**
   * Handle async operations with error handling
   */
  async handleAsync(asyncFn, req, res) {
    try {
      const result = await asyncFn();
      
      if (res && !res.headersSent) {
        res.json({
          success: true,
          data: result,
          message: result?.message || 'Operation successful'
        });
      }
      
      return result;
    } catch (error) {
      console.error('TenantController error:', error);
      
      if (res && !res.headersSent) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
          success: false,
          message: error.message || 'An error occurred',
          error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      
      throw error;
    }
  }

  /**
   * Require permission (placeholder - implement based on your permission system)
   */
  requirePermission(permission) {
    // This should be implemented based on your permission system
    // For now, it's a placeholder that always returns true
    // The actual permission checking should be done in route handlers
    return true;
  }

  /**
   * Generate tenant ID from company name (can be overridden by subclasses)
   */
  generateTenantId(companyName) {
    const base = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const timestamp = Date.now().toString(36);
    return `${base}-${timestamp}`;
  }

  /**
   * Generate slug from company name (can be overridden by subclasses)
   */
  generateSlug(companyName) {
    return companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

module.exports = { TenantController };
