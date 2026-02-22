const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Template Literal Syntax Errors');
console.log('============================================================');

// List of files with template literal syntax errors
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

function fixTemplateLiterals(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix template literal syntax in fetch headers
    // Pattern: 'Authorization': `Bearer ${token}` -> 'Authorization': 'Bearer ' + token
    const templateLiteralPattern = /'Authorization':\s*`Bearer\s*\$\{([^}]+)\}`/g;
    const replacement = "'Authorization': 'Bearer ' + $1";
    
    if (templateLiteralPattern.test(content)) {
      content = content.replace(templateLiteralPattern, replacement);
      modified = true;
      console.log(`✅ Fixed template literal in: ${filePath}`);
    }

    // Fix other template literal patterns that might cause issues
    // Pattern: `Bearer ${localStorage.getItem('token')}` -> 'Bearer ' + localStorage.getItem('token')
    const bearerPattern = /`Bearer\s*\$\{([^}]+)\}`/g;
    const bearerReplacement = "'Bearer ' + $1";
    
    if (bearerPattern.test(content)) {
      content = content.replace(bearerPattern, bearerReplacement);
      modified = true;
      console.log(`✅ Fixed Bearer token template literal in: ${filePath}`);
    }

    // Fix template literal in className
    // Pattern: className={`min-h-screen...`} -> className={'min-h-screen...'}
    const classNamePattern = /className=\{`([^`]+)`\}/g;
    const classNameReplacement = "className={'$1'}";
    
    if (classNamePattern.test(content)) {
      content = content.replace(classNamePattern, classNameReplacement);
      modified = true;
      console.log(`✅ Fixed className template literal in: ${filePath}`);
    }

    // Fix template literal in error messages
    // Pattern: `Tenants API failed: ${tenantsResponse.status} - ${errorText}` -> 'Tenants API failed: ' + tenantsResponse.status + ' - ' + errorText
    const errorPattern = /`([^`]*\$\{[^}]+\}[^`]*)`/g;
    const errorReplacement = (match, template) => {
      // Replace ${variable} with + variable
      return "'" + template.replace(/\$\{([^}]+)\}/g, "' + $1 + '") + "'";
    };
    
    if (errorPattern.test(content)) {
      content = content.replace(errorPattern, errorReplacement);
      modified = true;
      console.log(`✅ Fixed error message template literal in: ${filePath}`);
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

console.log('\n🔧 Fixing Template Literal Syntax Errors');
console.log('============================================================');

let fixedCount = 0;
let totalCount = filesToFix.length;

filesToFix.forEach(filePath => {
  if (fixTemplateLiterals(filePath)) {
    fixedCount++;
  }
});

console.log('\n============================================================');
console.log('🔧 Template Literal Fix Summary');
console.log('============================================================');
console.log(`ℹ️  Files processed: ${totalCount}`);
console.log(`ℹ️  Files fixed: ${fixedCount}`);
console.log(`ℹ️  Files unchanged: ${totalCount - fixedCount}`);

if (fixedCount > 0) {
  console.log('\n✅ Template literal syntax errors fixed!');
  console.log('ℹ️  Next steps:');
  console.log('ℹ️  1. Restart the frontend development server');
  console.log('ℹ️  2. Check if compilation errors are resolved');
  console.log('ℹ️  3. Test the application functionality');
} else {
  console.log('\n⚠️  No template literal syntax errors found to fix.');
}

console.log('\n🎉 Template literal fix completed!');
