const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Specific Syntax Errors');
console.log('============================================================');

// List of files with specific syntax errors
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

function fixSpecificSyntaxErrors(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix 1: Template literal with single quote start - specific pattern
    // Pattern: '${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/...'
    // To: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/...'
    const specificUrlPattern = /'`\$\{process\.env\.REACT_APP_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\}\/api\//g;
    const specificUrlReplacement = "(process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/";
    
    if (specificUrlPattern.test(content)) {
      content = content.replace(specificUrlPattern, specificUrlReplacement);
      modified = true;
      console.log(`✅ Fixed specific URL pattern in: ${filePath}`);
    }

    // Fix 2: Unterminated string with template literal
    // Pattern: '/api/meetings/templates/${selectedTemplate._id}`
    // To: '/api/meetings/templates/' + selectedTemplate._id
    const unterminatedTemplatePattern = /'\/api\/[^`]*\$\{([^}]+)\}`/g;
    const unterminatedTemplateReplacement = (match, variable) => {
      const apiPath = match.match(/'\/api\/([^`]*)\$\{/)?.[1] || '';
      return "'/api/" + apiPath + "' + " + variable;
    };
    
    if (unterminatedTemplatePattern.test(content)) {
      content = content.replace(unterminatedTemplatePattern, unterminatedTemplateReplacement);
      modified = true;
      console.log(`✅ Fixed unterminated template pattern in: ${filePath}`);
    }

    // Fix 3: Template literal in className
    // Pattern: className={'text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}'}
    // To: className={'text-sm ' + (isDarkMode ? 'text-gray-400' : 'text-gray-500')}
    const classNamePattern = /className=\{`([^`]*)\$\{([^}]+)\}([^`]*)`\}/g;
    const classNameReplacement = "className={'$1' + ($2) + '$3'}";
    
    if (classNamePattern.test(content)) {
      content = content.replace(classNamePattern, classNameReplacement);
      modified = true;
      console.log(`✅ Fixed className pattern in: ${filePath}`);
    }

    // Fix 4: Error message with template literal
    // Pattern: throw new Error('Tenants API failed: ${tenantsResponse.status} - ${errorText}`)
    // To: throw new Error('Tenants API failed: ' + tenantsResponse.status + ' - ' + errorText)
    const errorPattern = /throw new Error\('`([^`]*)\$\{([^}]+)\}([^`]*)\$\{([^}]+)\}`\)/g;
    const errorReplacement = "throw new Error('$1' + $2 + '$3' + $4)";
    
    if (errorPattern.test(content)) {
      content = content.replace(errorPattern, errorReplacement);
      modified = true;
      console.log(`✅ Fixed error pattern in: ${filePath}`);
    }

    // Fix 5: Object property with template literal
    // Pattern: name: '${masterERP.name} Tenant`
    // To: name: masterERP.name + ' Tenant'
    const objectPropertyPattern = /name:\s*'`\$\{([^}]+)\}\s+([^`]+)`/g;
    const objectPropertyReplacement = "name: $1 + ' $2'";
    
    if (objectPropertyPattern.test(content)) {
      content = content.replace(objectPropertyPattern, objectPropertyReplacement);
      modified = true;
      console.log(`✅ Fixed object property pattern in: ${filePath}`);
    }

    // Fix 6: Complex template literal with dollar sign
    // Pattern: value: '$${(stats.totalRevenue / 1000).toFixed(0)}K`
    // To: value: '$' + (stats.totalRevenue / 1000).toFixed(0) + 'K'
    const complexValuePattern = /value:\s*'`\$\$\{([^}]+)\}([^`]+)`/g;
    const complexValueReplacement = "value: '$' + ($1) + '$2'";
    
    if (complexValuePattern.test(content)) {
      content = content.replace(complexValuePattern, complexValueReplacement);
      modified = true;
      console.log(`✅ Fixed complex value pattern in: ${filePath}`);
    }

    // Fix 7: Simple template literal
    // Pattern: value: '${stats.satisfactionScore}%`
    // To: value: stats.satisfactionScore + '%'
    const simpleValuePattern = /value:\s*'`\$\{([^}]+)\}([^`]+)`/g;
    const simpleValueReplacement = "value: $1 + '$2'";
    
    if (simpleValuePattern.test(content)) {
      content = content.replace(simpleValuePattern, simpleValueReplacement);
      modified = true;
      console.log(`✅ Fixed simple value pattern in: ${filePath}`);
    }

    // Fix 8: Template literal in ternary expression
    // Pattern: '${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/clients/${clientId}`
    // To: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/clients/' + clientId
    const ternaryUrlPattern = /'`\$\{process\.env\.REACT_APP_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\}\/api\/[^`]*\$\{([^}]+)\}`/g;
    const ternaryUrlReplacement = (match, variable) => {
      const apiPath = match.match(/'\/api\/([^`]*)\$\{/)?.[1] || '';
      return "(process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/" + apiPath + "' + " + variable;
    };
    
    if (ternaryUrlPattern.test(content)) {
      content = content.replace(ternaryUrlPattern, ternaryUrlReplacement);
      modified = true;
      console.log(`✅ Fixed ternary URL pattern in: ${filePath}`);
    }

    // Fix 9: Template literal in conditional className
    // Pattern: className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50'} relative overflow-hidden`}
    // To: className={'min-h-screen transition-all duration-500 ' + (isDarkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50') + ' relative overflow-hidden'}
    const conditionalClassNamePattern = /className=\{`([^`]*)\$\{([^}]+)\}([^`]*)`\}/g;
    const conditionalClassNameReplacement = "className={'$1' + ($2) + '$3'}";
    
    if (conditionalClassNamePattern.test(content)) {
      content = content.replace(conditionalClassNamePattern, conditionalClassNameReplacement);
      modified = true;
      console.log(`✅ Fixed conditional className pattern in: ${filePath}`);
    }

    // Fix 10: Template literal in complex conditional
    // Pattern: className={`${communication.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
    // To: className={communication.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
    const complexConditionalPattern = /className=\{`\$\{([^}]+)\}`\}/g;
    const complexConditionalReplacement = "className={$1}";
    
    if (complexConditionalPattern.test(content)) {
      content = content.replace(complexConditionalPattern, complexConditionalReplacement);
      modified = true;
      console.log(`✅ Fixed complex conditional pattern in: ${filePath}`);
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

console.log('\n🔧 Fixing Specific Syntax Errors');
console.log('============================================================');

let fixedCount = 0;
let totalCount = filesToFix.length;

filesToFix.forEach(filePath => {
  if (fixSpecificSyntaxErrors(filePath)) {
    fixedCount++;
  }
});

console.log('\n============================================================');
console.log('🔧 Specific Syntax Errors Fix Summary');
console.log('============================================================');
console.log(`ℹ️  Files processed: ${totalCount}`);
console.log(`ℹ️  Files fixed: ${fixedCount}`);
console.log(`ℹ️  Files unchanged: ${totalCount - fixedCount}`);

if (fixedCount > 0) {
  console.log('\n✅ Specific syntax errors fixed!');
  console.log('ℹ️  Next steps:');
  console.log('ℹ️  1. Restart the frontend development server');
  console.log('ℹ️  2. Check if compilation errors are resolved');
  console.log('ℹ️  3. Test the application functionality');
} else {
  console.log('\n⚠️  No specific syntax errors found to fix.');
}

console.log('\n🎉 Specific syntax errors fix completed!');
