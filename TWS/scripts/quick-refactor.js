#!/usr/bin/env node

/**
 * Quick Refactoring Script
 * Automates the "Quick Wins" refactoring tasks
 * 
 * Usage: node scripts/quick-refactor.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Quick Refactoring...\n');

// Task 1: Fix duplicate exports in modules/index.js
function fixDuplicateExports() {
  console.log('📝 Task 1: Fixing duplicate exports in modules/index.js...');
  
  const filePath = path.join(__dirname, '../backend/src/modules/index.js');
  
  if (!fs.existsSync(filePath)) {
    console.log('   ⚠️  File not found, skipping...');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Check if duplicate exports exist (lines 25-31)
  if (lines.length > 24 && lines[24].includes('// Named exports')) {
    // Remove duplicate exports (lines 25-31)
    const newLines = lines.slice(0, 24).concat(lines.slice(32));
    content = newLines.join('\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('   ✅ Removed duplicate exports (lines 25-31)');
  } else {
    console.log('   ℹ️  No duplicate exports found');
  }
}

// Task 2: Remove unused monitoring components
function removeUnusedMonitoring() {
  console.log('\n📝 Task 2: Removing unused monitoring components...');
  
  const monitoringFiles = [
    '../frontend/src/shared/pages/monitoring/StandaloneMonitoring.js',
    '../frontend/src/shared/pages/monitoring/SimpleMonitoring.js',
    '../frontend/src/shared/pages/monitoring/ErrorFreeMonitoring.js'
  ];
  
  let removed = 0;
  monitoringFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Removed ${path.basename(filePath)}`);
      removed++;
    }
  });
  
  if (removed === 0) {
    console.log('   ℹ️  No monitoring files to remove');
  }
  
  // Update App.js to remove imports
  const appJsPath = path.join(__dirname, '../frontend/src/App.js');
  if (fs.existsSync(appJsPath)) {
    let content = fs.readFileSync(appJsPath, 'utf8');
    
    // Remove imports
    content = content.replace(/import StandaloneMonitoring[^\n]*\n/g, '');
    content = content.replace(/import SimpleMonitoring[^\n]*\n/g, '');
    content = content.replace(/import ErrorFreeMonitoring[^\n]*\n/g, '');
    
    // Remove routes
    content = content.replace(/<Route path="\/standalone-monitoring"[^>]*\/>\s*\n/g, '');
    content = content.replace(/<Route path="\/simple-monitoring"[^>]*\/>\s*\n/g, '');
    content = content.replace(/<Route path="\/error-free-monitoring"[^>]*\/>\s*\n/g, '');
    
    fs.writeFileSync(appJsPath, content, 'utf8');
    console.log('   ✅ Updated App.js (removed imports and routes)');
  }
}

// Task 3: Check and optionally remove generateAdminPages.js
function checkTemplateGenerator() {
  console.log('\n📝 Task 3: Checking template generator usage...');
  
  const filePath = path.join(__dirname, '../frontend/src/shared/utils/generateAdminPages.js');
  
  if (!fs.existsSync(filePath)) {
    console.log('   ℹ️  File not found');
    return;
  }
  
  // Search for references
  const searchPath = path.join(__dirname, '../frontend/src');
  const searchTerm = 'generateAdminPages';
  
  function searchInFile(filePath, term) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.includes(term);
    } catch {
      return false;
    }
  }
  
  function findReferences(dir, term) {
    const results = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory() && !file.name.includes('node_modules')) {
        results.push(...findReferences(fullPath, term));
      } else if (file.isFile() && file.name.endsWith('.js')) {
        if (searchInFile(fullPath, term)) {
          results.push(fullPath);
        }
      }
    }
    return results;
  }
  
  const references = findReferences(searchPath, searchTerm);
  
  if (references.length === 0 || (references.length === 1 && references[0].includes('generateAdminPages.js'))) {
    console.log('   ⚠️  No references found. File appears unused.');
    console.log('   💡 Consider removing: frontend/src/shared/utils/generateAdminPages.js');
  } else {
    console.log(`   ℹ️  Found ${references.length} reference(s):`);
    references.forEach(ref => {
      console.log(`      - ${path.relative(searchPath, ref)}`);
    });
  }
}

// Task 4: List duplicate routes for manual review
function listDuplicateRoutes() {
  console.log('\n📝 Task 4: Analyzing route duplication...');
  
  const routesDir = path.join(__dirname, '../backend/src/routes');
  const modulesDir = path.join(__dirname, '../backend/src/modules');
  
  function findRouteFiles(dir) {
    const routes = [];
    if (!fs.existsSync(dir)) return routes;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        routes.push(...findRouteFiles(fullPath));
      } else if (file.name.endsWith('.js') && file.name.includes('route')) {
        routes.push(fullPath);
      }
    }
    return routes;
  }
  
  const routeFiles = findRouteFiles(routesDir);
  const moduleRouteFiles = findRouteFiles(modulesDir);
  
  console.log(`   📊 Found ${routeFiles.length} route files in /routes`);
  console.log(`   📊 Found ${moduleRouteFiles.length} route files in /modules`);
  
  // Find potential duplicates
  const routeNames = new Map();
  
  [...routeFiles, ...moduleRouteFiles].forEach(file => {
    const name = path.basename(file, '.js');
    if (!routeNames.has(name)) {
      routeNames.set(name, []);
    }
    routeNames.get(name).push(file);
  });
  
  const duplicates = Array.from(routeNames.entries())
    .filter(([name, files]) => files.length > 1);
  
  if (duplicates.length > 0) {
    console.log('\n   ⚠️  Potential duplicate routes found:');
    duplicates.forEach(([name, files]) => {
      console.log(`\n   📁 ${name}:`);
      files.forEach(file => {
        console.log(`      - ${path.relative(path.join(__dirname, '../backend/src'), file)}`);
      });
    });
  } else {
    console.log('   ✅ No obvious duplicates found');
  }
}

// Main execution
function main() {
  try {
    fixDuplicateExports();
    removeUnusedMonitoring();
    checkTemplateGenerator();
    listDuplicateRoutes();
    
    console.log('\n✅ Quick refactoring complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Review the duplicate routes listed above');
    console.log('   2. Test your application');
    console.log('   3. Proceed with REFACTORING_PLAN.md for full refactoring');
    console.log('\n⚠️  Remember to:');
    console.log('   - Create a git commit before running this script');
    console.log('   - Test thoroughly after changes');
    console.log('   - Review changes in git diff');
    
  } catch (error) {
    console.error('\n❌ Error during refactoring:', error.message);
    console.error('\n⚠️  Please review changes manually');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };

