#!/usr/bin/env node

/**
 * Script to fix all remaining asyncHandler references in route files
 */

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../src/routes');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix standalone asyncHandler references (not already prefixed)
    const asyncHandlerRegex = /(?<!ErrorHandler\.)asyncHandler\(/g;
    if (asyncHandlerRegex.test(content)) {
      content = content.replace(asyncHandlerRegex, 'ErrorHandler.asyncHandler(');
      modified = true;
    }

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
  console.log('🔧 Fixing all asyncHandler references...\n');

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
    console.log('\n✅ AsyncHandler fixes completed!');
  } else {
    console.log('\n⏭️  No fixes were needed.');
  }
}

main();
