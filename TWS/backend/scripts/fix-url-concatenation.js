const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing URL Concatenation Issues');
console.log('============================================================');

// List of files that might have URL concatenation issues
const filesToFix = [
  'frontend/src/components/Meeting/MeetingForm.js',
  'frontend/src/components/Meeting/MeetingTemplates.js',
  'frontend/src/pages/SupraAdminLogin.js',
  'frontend/src/pages/SupraAdmin/DepartmentAccess.js',
  'frontend/src/pages/SupraAdmin/IndustryTenantCreation.js',
  'frontend/src/pages/SupraAdmin/MasterERPManagement.js',
  'frontend/src/pages/TenantDashboard.js',
  'frontend/src/pages/clients/ClientsBilling.js',
  'frontend/src/pages/clients/ClientsCommunications.js',
  'frontend/src/pages/clients/ClientsContracts.js',
  'frontend/src/pages/clients/ClientsDashboard.js',
  'frontend/src/pages/clients/ClientsFeedback.js',
  'frontend/src/pages/clients/ClientsSupport.js'
];

function fixUrlConcatenation(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix URL concatenation issues
    // Pattern: '' + process.env.REACT_APP_API_URL || 'http://localhost:5000' + '/api/...'
    // To: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/...'
    const urlPattern = /''\s*\+\s*process\.env\.REACT_APP_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\s*\+\s*'/g;
    const urlReplacement = "(process.env.REACT_APP_API_URL || 'http://localhost:5000') + '";
    
    if (urlPattern.test(content)) {
      content = content.replace(urlPattern, urlReplacement);
      modified = true;
      console.log(`✅ Fixed URL concatenation in: ${filePath}`);
    }

    // Fix other URL patterns
    // Pattern: 'http://localhost:5000' + '/api/...'
    // To: 'http://localhost:5000/api/...'
    const simpleUrlPattern = /'http:\/\/localhost:5000'\s*\+\s*'/g;
    const simpleUrlReplacement = "'http://localhost:5000/";
    
    if (simpleUrlPattern.test(content)) {
      content = content.replace(simpleUrlPattern, simpleUrlReplacement);
      modified = true;
      console.log(`✅ Fixed simple URL concatenation in: ${filePath}`);
    }

    // Fix environment variable URL patterns
    // Pattern: process.env.REACT_APP_API_URL + '/api/...'
    // To: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/...'
    const envUrlPattern = /process\.env\.REACT_APP_API_URL\s*\+\s*'/g;
    const envUrlReplacement = "(process.env.REACT_APP_API_URL || 'http://localhost:5000') + '";
    
    if (envUrlPattern.test(content)) {
      content = content.replace(envUrlPattern, envUrlReplacement);
      modified = true;
      console.log(`✅ Fixed environment URL concatenation in: ${filePath}`);
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('\n🔧 Fixing URL Concatenation Issues');
console.log('============================================================');

let fixedCount = 0;
let totalCount = filesToFix.length;

filesToFix.forEach(filePath => {
  if (fixUrlConcatenation(filePath)) {
    fixedCount++;
  }
});

console.log('\n============================================================');
console.log('🔧 URL Concatenation Fix Summary');
console.log('============================================================');
console.log(`ℹ️  Files processed: ${totalCount}`);
console.log(`ℹ️  Files fixed: ${fixedCount}`);
console.log(`ℹ️  Files unchanged: ${totalCount - fixedCount}`);

if (fixedCount > 0) {
  console.log('\n✅ URL concatenation issues fixed!');
  console.log('ℹ️  Next steps:');
  console.log('ℹ️  1. Restart the frontend development server');
  console.log('ℹ️  2. Check if compilation errors are resolved');
  console.log('ℹ️  3. Test the application functionality');
} else {
  console.log('\n⚠️  No URL concatenation issues found to fix.');
}

console.log('\n🎉 URL concatenation fix completed!');
