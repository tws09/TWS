#!/usr/bin/env node

/**
 * Fix API URL Issues in Frontend
 * This script fixes the hardcoded API URLs that are pointing to the wrong port
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class APIURLFixer {
  constructor() {
    this.fixes = [];
    this.errors = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logSuccess(message) {
    this.log(`✅ ${message}`, 'green');
  }

  logWarning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  logError(message) {
    this.log(`❌ ${message}`, 'red');
  }

  logInfo(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  logSection(title) {
    console.log('\n' + '='.repeat(60));
    this.log(`🔧 ${title}`, 'cyan');
    console.log('='.repeat(60));
  }

  // Fix API URLs in a file
  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      const originalContent = content;

      // Fix hardcoded localhost:3000 API URLs
      const wrongApiUrl = 'http://localhost:3000/api/';
      const correctApiUrl = 'http://localhost:5000/api/';
      
      if (content.includes(wrongApiUrl)) {
        content = content.replace(new RegExp(wrongApiUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correctApiUrl);
        modified = true;
        this.logInfo(`Fixed hardcoded API URL in ${filePath}`);
      }

      // Fix relative API URLs that should use environment variable
      const relativeApiPattern = /fetch\s*\(\s*['"`]\/api\//g;
      if (relativeApiPattern.test(content)) {
        // Replace relative API calls with environment variable
        content = content.replace(
          /fetch\s*\(\s*['"`]\/api\//g,
          'fetch(`${process.env.REACT_APP_API_URL || \'http://localhost:5000\'}/api/'
        );
        modified = true;
        this.logInfo(`Fixed relative API URL in ${filePath}`);
      }

      // Fix axios calls with hardcoded URLs
      const axiosPattern = /axios\.get\s*\(\s*['"`]http:\/\/localhost:3000\/api\//g;
      if (axiosPattern.test(content)) {
        content = content.replace(
          /axios\.get\s*\(\s*['"`]http:\/\/localhost:3000\/api\//g,
          'axios.get(`${process.env.REACT_APP_API_URL || \'http://localhost:5000\'}/api/'
        );
        modified = true;
        this.logInfo(`Fixed axios API URL in ${filePath}`);
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        this.logSuccess(`Fixed API URLs in ${filePath}`);
        this.fixes.push(filePath);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to fix ${filePath}: ${error.message}`);
      this.errors.push({ file: filePath, error: error.message });
      return false;
    }
  }

  // Recursively find and fix all JavaScript files
  fixDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and build directories
        if (!['node_modules', 'build', '.git', 'coverage'].includes(item)) {
          this.fixDirectory(fullPath);
        }
      } else if (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx')) {
        this.fixFile(fullPath);
      }
    }
  }

  // Create API configuration file
  createAPIConfig() {
    this.logSection('Creating API Configuration');
    
    const apiConfigContent = `// API Configuration
// This file centralizes all API endpoints and configuration

const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      ME: '/api/auth/me',
      GTS_ADMIN_LOGIN: '/api/auth/gts-admin/login',
      SUPRA_ADMIN_LOGIN: '/api/auth/supra-admin/login'
    },
    
    // Supra Admin
    SUPRA_ADMIN: {
      DASHBOARD: '/api/supra-admin/dashboard',
      TENANTS: '/api/supra-admin/tenants',
      USERS: '/api/supra-admin/users',
      ANALYTICS: '/api/supra-admin/analytics'
    },
    
    // GTS Admin
    GTS_ADMIN: {
      DASHBOARD: '/api/gts-admin/dashboard',
      TENANTS: '/api/gts-admin/tenants',
      BILLING: '/api/gts-admin/billing',
      ANALYTICS: '/api/gts-admin/analytics'
    },
    
    // Master ERP
    MASTER_ERP: {
      BASE: '/api/master-erp',
      INDUSTRIES: '/api/master-erp/meta/industries',
      STATS: '/api/master-erp/stats/overview',
      TEMPLATES: '/api/master-erp/templates'
    },
    
    // Tenant Management
    TENANT: {
      AUTH: '/api/tenant-auth',
      DASHBOARD: '/api/tenant-dashboard',
      ORG: '/api/tenant'
    }
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return \`\${API_CONFIG.BASE_URL}\${endpoint}\`;
};

// Helper function for authenticated requests
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': \`Bearer \${token}\` }),
      ...options.headers
    }
  };
  
  const response = await fetch(buildApiUrl(endpoint), {
    ...defaultOptions,
    ...options
  });
  
  if (!response.ok) {
    throw new Error(\`API request failed: \${response.status} \${response.statusText}\`);
  }
  
  return response.json();
};

export default API_CONFIG;
`;

    try {
      const frontendSrcPath = path.join(__dirname, '..', '..', 'frontend', 'src');
      const configPath = path.join(frontendSrcPath, 'config', 'api.js');
      
      // Create config directory if it doesn't exist
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(configPath, apiConfigContent);
      this.logSuccess('API configuration file created: frontend/src/config/api.js');
      this.fixes.push('API configuration file created');
      return true;
    } catch (error) {
      this.logError(`Failed to create API config: ${error.message}`);
      this.errors.push({ file: 'api.js', error: error.message });
      return false;
    }
  }

  // Create environment file for frontend
  createFrontendEnv() {
    this.logSection('Creating Frontend Environment File');
    
    const envContent = `# Frontend Environment Configuration
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_FILE_UPLOAD=true

# Development Settings
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=info
`;

    try {
      const frontendPath = path.join(__dirname, '..', '..', 'frontend');
      const envPath = path.join(frontendPath, '.env');
      
      fs.writeFileSync(envPath, envContent);
      this.logSuccess('Frontend environment file created: frontend/.env');
      this.fixes.push('Frontend environment file created');
      return true;
    } catch (error) {
      this.logError(`Failed to create frontend env: ${error.message}`);
      this.errors.push({ file: '.env', error: error.message });
      return false;
    }
  }

  // Main fix function
  async run() {
    this.log('🚀 Starting API URL Fix', 'bright');
    this.log('=' .repeat(60), 'cyan');
    
    try {
      // Create API configuration
      this.createAPIConfig();
      
      // Create frontend environment file
      this.createFrontendEnv();
      
      // Fix frontend files
      this.logSection('Fixing Frontend API URLs');
      const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'src');
      
      if (fs.existsSync(frontendPath)) {
        this.fixDirectory(frontendPath);
      } else {
        this.logWarning('Frontend src directory not found');
      }
      
      // Summary
      this.logSection('API URL Fix Summary');
      
      this.logInfo('Fixes Applied:');
      this.fixes.forEach(fix => {
        this.logInfo(`  ✅ ${fix}`);
      });
      
      if (this.errors.length > 0) {
        this.logWarning('Errors encountered:');
        this.errors.forEach(error => {
          this.logWarning(`  ⚠️ ${error.file}: ${error.error}`);
        });
      }
      
      this.logInfo('\\nNext Steps:');
      this.logInfo('1. Restart the frontend development server');
      this.logInfo('2. Clear browser cache');
      this.logInfo('3. Test API calls');
      this.logInfo('4. Check browser network tab for correct URLs');
      
      this.logSuccess('🎉 API URL fix completed!');
      
    } catch (error) {
      this.logError(`API URL fix failed: ${error.message}`);
      console.error(error);
    }
  }
}

// Run the fixer if this script is executed directly
if (require.main === module) {
  const fixer = new APIURLFixer();
  fixer.run();
}

module.exports = APIURLFixer;
