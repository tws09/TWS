#!/usr/bin/env node

/**
 * Comprehensive script to fix all import issues in route files
 */

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../src/routes');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix various import patterns
    const fixes = [
      // Fix old errorHandler imports
      {
        pattern: /const { asyncHandler } = require\('\.\.\/middleware\/errorHandler'\);/g,
        replacement: "const ErrorHandler = require('../middleware/errorHandler');"
      },
      {
        pattern: /const { handleValidationErrors } = require\('\.\.\/middleware\/errorHandler'\);/g,
        replacement: "const ValidationMiddleware = require('../middleware/validation');"
      },
      // Fix standalone asyncHandler usage
      {
        pattern: /(?<!ErrorHandler\.)asyncHandler\(/g,
        replacement: 'ErrorHandler.asyncHandler('
      },
      // Fix double ErrorHandler
      {
        pattern: /ErrorHandler\.ErrorHandler\./g,
        replacement: 'ErrorHandler.'
      }
    ];

    fixes.forEach(fix => {
      if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${path.basename(filePath)}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Comprehensive import fixes...\n');

  let fixedCount = 0;
  let totalCount = 0;

  // Get all .js files in routes directory
  const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

  files.forEach(fileName => {
    const filePath = path.join(routesDir, fileName);
    totalCount++;
    
    if (fixFile(filePath)) {
      fixedCount++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${totalCount}`);
  console.log(`   Files fixed: ${fixedCount}`);
  console.log(`   Files unchanged: ${totalCount - fixedCount}`);

  if (fixedCount > 0) {
    console.log('\n✅ Import fixes completed!');
  } else {
    console.log('\n⏭️  No fixes were needed.');
  }
}

main();
