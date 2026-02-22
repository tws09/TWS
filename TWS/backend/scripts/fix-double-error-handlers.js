#!/usr/bin/env node

/**
 * Script to fix double ErrorHandler references
 */

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../src/routes');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix double ErrorHandler references
    if (content.includes('ErrorHandler.ErrorHandler.')) {
      content = content.replace(/ErrorHandler\.ErrorHandler\./g, 'ErrorHandler.');
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
  console.log('🔧 Fixing double ErrorHandler references...\n');

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
    console.log('\n✅ Double ErrorHandler fixes completed!');
  } else {
    console.log('\n⏭️  No fixes were needed.');
  }
}

main();
