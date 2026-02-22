const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Remaining Syntax Errors');
console.log('============================================================');

// List of files with remaining syntax errors
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

function fixRemainingSyntaxErrors(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix 1: Mixed template literal patterns in fetch URLs
    // Pattern: '${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/...'
    // To: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/...'
    const mixedUrlPattern = /'`\$\{process\.env\.REACT_APP_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\}\/api\//g;
    const mixedUrlReplacement = "(process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/";
    
    if (mixedUrlPattern.test(content)) {
      content = content.replace(mixedUrlPattern, mixedUrlReplacement);
      modified = true;
      console.log(`✅ Fixed mixed URL pattern in: ${filePath}`);
    }

    // Fix 2: Template literal with single quote start
    // Pattern: '${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/...'
    // To: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/...'
    const singleQuoteTemplatePattern = /'`\$\{([^}]+)\}\/api\//g;
    const singleQuoteTemplateReplacement = "($1) + '/api/";
    
    if (singleQuoteTemplatePattern.test(content)) {
      content = content.replace(singleQuoteTemplatePattern, singleQuoteTemplateReplacement);
      modified = true;
      console.log(`✅ Fixed single quote template pattern in: ${filePath}`);
    }

    // Fix 3: Unterminated string constants with template literals
    // Pattern: '${variable}` -> ' + variable + '
    const unterminatedStringPattern = /'`\$\{([^}]+)\}`/g;
    const unterminatedStringReplacement = "' + $1 + '";
    
    if (unterminatedStringPattern.test(content)) {
      content = content.replace(unterminatedStringPattern, unterminatedStringReplacement);
      modified = true;
      console.log(`✅ Fixed unterminated string pattern in: ${filePath}`);
    }

    // Fix 4: Template literals in className
    // Pattern: className={'text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}'}
    // To: className={'text-sm ' + (isDarkMode ? 'text-gray-400' : 'text-gray-500')}
    const classNameTemplatePattern = /className=\{`([^`]*)\$\{([^}]+)\}([^`]*)`\}/g;
    const classNameTemplateReplacement = "className={'$1' + ($2) + '$3'}";
    
    if (classNameTemplatePattern.test(content)) {
      content = content.replace(classNameTemplatePattern, classNameTemplateReplacement);
      modified = true;
      console.log(`✅ Fixed className template pattern in: ${filePath}`);
    }

    // Fix 5: Template literals in object values
    // Pattern: value: '${stats.totalRevenue / 1000).toFixed(0)}K`
    // To: value: '$' + (stats.totalRevenue / 1000).toFixed(0) + 'K'
    const objectValueTemplatePattern = /value:\s*'`\$\{([^}]+)\}`/g;
    const objectValueTemplateReplacement = "value: '$' + ($1)";
    
    if (objectValueTemplatePattern.test(content)) {
      content = content.replace(objectValueTemplatePattern, objectValueTemplateReplacement);
      modified = true;
      console.log(`✅ Fixed object value template pattern in: ${filePath}`);
    }

    // Fix 6: Template literals in ternary expressions
    // Pattern: '/api/meetings/templates/${selectedTemplate._id}`
    // To: '/api/meetings/templates/' + selectedTemplate._id
    const ternaryTemplatePattern = /'\/api\/[^`]*\$\{([^}]+)\}`/g;
    const ternaryTemplateReplacement = "'/api/" + content.match(/'\/api\/([^`]*)\$\{/)?.[1] + "' + $1";
    
    if (ternaryTemplatePattern.test(content)) {
      content = content.replace(ternaryTemplatePattern, (match, variable) => {
        const apiPath = match.match(/'\/api\/([^`]*)\$\{/)?.[1] || '';
        return "'/api/" + apiPath + "' + " + variable;
      });
      modified = true;
      console.log(`✅ Fixed ternary template pattern in: ${filePath}`);
    }

    // Fix 7: Error message template literals
    // Pattern: throw new Error('Tenants API failed: ${tenantsResponse.status} - ${errorText}`)
    // To: throw new Error('Tenants API failed: ' + tenantsResponse.status + ' - ' + errorText)
    const errorTemplatePattern = /throw new Error\('`([^`]*)\$\{([^}]+)\}([^`]*)\$\{([^}]+)\}`\)/g;
    const errorTemplateReplacement = "throw new Error('$1' + $2 + '$3' + $4)";
    
    if (errorTemplatePattern.test(content)) {
      content = content.replace(errorTemplatePattern, errorTemplateReplacement);
      modified = true;
      console.log(`✅ Fixed error template pattern in: ${filePath}`);
    }

    // Fix 8: Object property template literals
    // Pattern: name: '${masterERP.name} Tenant`
    // To: name: masterERP.name + ' Tenant'
    const objectPropertyTemplatePattern = /name:\s*'`\$\{([^}]+)\}\s+([^`]+)`/g;
    const objectPropertyTemplateReplacement = "name: $1 + ' $2'";
    
    if (objectPropertyTemplatePattern.test(content)) {
      content = content.replace(objectPropertyTemplatePattern, objectPropertyTemplateReplacement);
      modified = true;
      console.log(`✅ Fixed object property template pattern in: ${filePath}`);
    }

    // Fix 9: Complex template literals with multiple variables
    // Pattern: '$${(stats.totalRevenue / 1000).toFixed(0)}K`
    // To: '$' + (stats.totalRevenue / 1000).toFixed(0) + 'K'
    const complexTemplatePattern = /'`\$\$\{([^}]+)\}([^`]+)`/g;
    const complexTemplateReplacement = "'$' + ($1) + '$2'";
    
    if (complexTemplatePattern.test(content)) {
      content = content.replace(complexTemplatePattern, complexTemplateReplacement);
      modified = true;
      console.log(`✅ Fixed complex template pattern in: ${filePath}`);
    }

    // Fix 10: Simple template literals
    // Pattern: '${stats.satisfactionScore}%`
    // To: stats.satisfactionScore + '%'
    const simpleTemplatePattern = /'`\$\{([^}]+)\}([^`]+)`/g;
    const simpleTemplateReplacement = "$1 + '$2'";
    
    if (simpleTemplatePattern.test(content)) {
      content = content.replace(simpleTemplatePattern, simpleTemplateReplacement);
      modified = true;
      console.log(`✅ Fixed simple template pattern in: ${filePath}`);
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

console.log('\n🔧 Fixing Remaining Syntax Errors');
console.log('============================================================');

let fixedCount = 0;
let totalCount = filesToFix.length;

filesToFix.forEach(filePath => {
  if (fixRemainingSyntaxErrors(filePath)) {
    fixedCount++;
  }
});

console.log('\n============================================================');
console.log('🔧 Remaining Syntax Errors Fix Summary');
console.log('============================================================');
console.log(`ℹ️  Files processed: ${totalCount}`);
console.log(`ℹ️  Files fixed: ${fixedCount}`);
console.log(`ℹ️  Files unchanged: ${totalCount - fixedCount}`);

if (fixedCount > 0) {
  console.log('\n✅ Remaining syntax errors fixed!');
  console.log('ℹ️  Next steps:');
  console.log('ℹ️  1. Restart the frontend development server');
  console.log('ℹ️  2. Check if compilation errors are resolved');
  console.log('ℹ️  3. Test the application functionality');
} else {
  console.log('\n⚠️  No remaining syntax errors found to fix.');
}

console.log('\n🎉 Remaining syntax errors fix completed!');
