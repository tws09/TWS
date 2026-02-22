const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Mixed Quote Syntax Errors');
console.log('============================================================');

// List of files with mixed quote syntax errors
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

function fixMixedQuoteSyntax(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix 1: Mixed quote pattern in fetch URLs
    // Pattern: '${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/...'
    // To: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/...'
    const mixedQuoteUrlPattern = /'`\$\{process\.env\.REACT_APP_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\}\/api\//g;
    const mixedQuoteUrlReplacement = "(process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/";
    
    if (mixedQuoteUrlPattern.test(content)) {
      content = content.replace(mixedQuoteUrlPattern, mixedQuoteUrlReplacement);
      modified = true;
      console.log(`✅ Fixed mixed quote URL pattern in: ${filePath}`);
    }

    // Fix 2: Mixed quote pattern in ternary URLs
    // Pattern: '${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/clients/${clientId}`
    // To: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/clients/' + clientId
    const mixedQuoteTernaryPattern = /'`\$\{process\.env\.REACT_APP_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\}\/api\/[^`]*\$\{([^}]+)\}`/g;
    const mixedQuoteTernaryReplacement = (match, variable) => {
      const apiPath = match.match(/'\/api\/([^`]*)\$\{/)?.[1] || '';
      return "(process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/" + apiPath + "' + " + variable;
    };
    
    if (mixedQuoteTernaryPattern.test(content)) {
      content = content.replace(mixedQuoteTernaryPattern, mixedQuoteTernaryReplacement);
      modified = true;
      console.log(`✅ Fixed mixed quote ternary pattern in: ${filePath}`);
    }

    // Fix 3: Mixed quote pattern in simple URLs
    // Pattern: '${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/...'
    // To: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/...'
    const mixedQuoteSimplePattern = /'`\$\{process\.env\.REACT_APP_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\}\/api\/([^`]+)`/g;
    const mixedQuoteSimpleReplacement = "(process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/$1'";
    
    if (mixedQuoteSimplePattern.test(content)) {
      content = content.replace(mixedQuoteSimplePattern, mixedQuoteSimpleReplacement);
      modified = true;
      console.log(`✅ Fixed mixed quote simple pattern in: ${filePath}`);
    }

    // Fix 4: Mixed quote pattern in template strings
    // Pattern: '/api/meetings/templates/${selectedTemplate._id}`
    // To: '/api/meetings/templates/' + selectedTemplate._id
    const mixedQuoteTemplatePattern = /'\/api\/[^`]*\$\{([^}]+)\}`/g;
    const mixedQuoteTemplateReplacement = (match, variable) => {
      const apiPath = match.match(/'\/api\/([^`]*)\$\{/)?.[1] || '';
      return "'/api/" + apiPath + "' + " + variable;
    };
    
    if (mixedQuoteTemplatePattern.test(content)) {
      content = content.replace(mixedQuoteTemplatePattern, mixedQuoteTemplateReplacement);
      modified = true;
      console.log(`✅ Fixed mixed quote template pattern in: ${filePath}`);
    }

    // Fix 5: Mixed quote pattern in className
    // Pattern: className={'text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}'}
    // To: className={'text-sm ' + (isDarkMode ? 'text-gray-400' : 'text-gray-500')}
    const mixedQuoteClassNamePattern = /className=\{`([^`]*)\$\{([^}]+)\}([^`]*)`\}/g;
    const mixedQuoteClassNameReplacement = "className={'$1' + ($2) + '$3'}";
    
    if (mixedQuoteClassNamePattern.test(content)) {
      content = content.replace(mixedQuoteClassNamePattern, mixedQuoteClassNameReplacement);
      modified = true;
      console.log(`✅ Fixed mixed quote className pattern in: ${filePath}`);
    }

    // Fix 6: Mixed quote pattern in error messages
    // Pattern: throw new Error('Tenants API failed: ${tenantsResponse.status} - ${errorText}`)
    // To: throw new Error('Tenants API failed: ' + tenantsResponse.status + ' - ' + errorText)
    const mixedQuoteErrorPattern = /throw new Error\('`([^`]*)\$\{([^}]+)\}([^`]*)\$\{([^}]+)\}`\)/g;
    const mixedQuoteErrorReplacement = "throw new Error('$1' + $2 + '$3' + $4)";
    
    if (mixedQuoteErrorPattern.test(content)) {
      content = content.replace(mixedQuoteErrorPattern, mixedQuoteErrorReplacement);
      modified = true;
      console.log(`✅ Fixed mixed quote error pattern in: ${filePath}`);
    }

    // Fix 7: Mixed quote pattern in object properties
    // Pattern: name: '${masterERP.name} Tenant`
    // To: name: masterERP.name + ' Tenant'
    const mixedQuoteObjectPattern = /name:\s*'`\$\{([^}]+)\}\s+([^`]+)`/g;
    const mixedQuoteObjectReplacement = "name: $1 + ' $2'";
    
    if (mixedQuoteObjectPattern.test(content)) {
      content = content.replace(mixedQuoteObjectPattern, mixedQuoteObjectReplacement);
      modified = true;
      console.log(`✅ Fixed mixed quote object pattern in: ${filePath}`);
    }

    // Fix 8: Mixed quote pattern in value properties
    // Pattern: value: '$${(stats.totalRevenue / 1000).toFixed(0)}K`
    // To: value: '$' + (stats.totalRevenue / 1000).toFixed(0) + 'K'
    const mixedQuoteValuePattern = /value:\s*'`\$\$\{([^}]+)\}([^`]+)`/g;
    const mixedQuoteValueReplacement = "value: '$' + ($1) + '$2'";
    
    if (mixedQuoteValuePattern.test(content)) {
      content = content.replace(mixedQuoteValuePattern, mixedQuoteValueReplacement);
      modified = true;
      console.log(`✅ Fixed mixed quote value pattern in: ${filePath}`);
    }

    // Fix 9: Mixed quote pattern in simple values
    // Pattern: value: '${stats.satisfactionScore}%`
    // To: value: stats.satisfactionScore + '%'
    const mixedQuoteSimpleValuePattern = /value:\s*'`\$\{([^}]+)\}([^`]+)`/g;
    const mixedQuoteSimpleValueReplacement = "value: $1 + '$2'";
    
    if (mixedQuoteSimpleValuePattern.test(content)) {
      content = content.replace(mixedQuoteSimpleValuePattern, mixedQuoteSimpleValueReplacement);
      modified = true;
      console.log(`✅ Fixed mixed quote simple value pattern in: ${filePath}`);
    }

    // Fix 10: Mixed quote pattern in complex conditionals
    // Pattern: className={`${communication.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
    // To: className={communication.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
    const mixedQuoteComplexPattern = /className=\{`\$\{([^}]+)\}`\}/g;
    const mixedQuoteComplexReplacement = "className={$1}";
    
    if (mixedQuoteComplexPattern.test(content)) {
      content = content.replace(mixedQuoteComplexPattern, mixedQuoteComplexReplacement);
      modified = true;
      console.log(`✅ Fixed mixed quote complex pattern in: ${filePath}`);
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

console.log('\n🔧 Fixing Mixed Quote Syntax Errors');
console.log('============================================================');

let fixedCount = 0;
let totalCount = filesToFix.length;

filesToFix.forEach(filePath => {
  if (fixMixedQuoteSyntax(filePath)) {
    fixedCount++;
  }
});

console.log('\n============================================================');
console.log('🔧 Mixed Quote Syntax Errors Fix Summary');
console.log('============================================================');
console.log(`ℹ️  Files processed: ${totalCount}`);
console.log(`ℹ️  Files fixed: ${fixedCount}`);
console.log(`ℹ️  Files unchanged: ${totalCount - fixedCount}`);

if (fixedCount > 0) {
  console.log('\n✅ Mixed quote syntax errors fixed!');
  console.log('ℹ️  Next steps:');
  console.log('ℹ️  1. Restart the frontend development server');
  console.log('ℹ️  2. Check if compilation errors are resolved');
  console.log('ℹ️  3. Test the application functionality');
} else {
  console.log('\n⚠️  No mixed quote syntax errors found to fix.');
}

console.log('\n🎉 Mixed quote syntax errors fix completed!');
