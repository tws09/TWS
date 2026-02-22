#!/usr/bin/env node

/**
 * Script to fix route import issues in all route files
 * Replaces incorrect errorHandler imports with proper ones
 */

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../src/routes');

// Files to fix
const filesToFix = [
  'calendarAttendance.js',
  'simpleAttendance.js', 
  'attendance.js',
  'adminAttendancePanel.js',
  'softwareHouseAttendance.js',
  'workspaces.js',
  'logs.js',
  'webhooks.js',
  'webrtc.js',
  'meetings.js',
  'security.js',
  'payroll.js',
  'integrations.js',
  'finance.js',
  'employees.js',
  'employee.js',
  'attendanceIntegration.js',
  'adminAttendance.js'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix the import statement
    const oldImport = "const { handleValidationErrors, asyncHandler } = require('../middleware/errorHandler');";
    const newImport = `const ErrorHandler = require('../middleware/errorHandler');
const ValidationMiddleware = require('../middleware/validation');`;

    if (content.includes(oldImport)) {
      content = content.replace(oldImport, newImport);
      modified = true;
    }

    // Fix usage patterns
    if (content.includes('handleValidationErrors, asyncHandler')) {
      content = content.replace(/handleValidationErrors, asyncHandler/g, 'ValidationMiddleware.handleValidationErrors, ErrorHandler.asyncHandler');
      modified = true;
    }

    if (content.includes('asyncHandler(') && !content.includes('ErrorHandler.asyncHandler(')) {
      content = content.replace(/asyncHandler\(/g, 'ErrorHandler.asyncHandler(');
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
  console.log('🔧 Fixing route import issues...\n');

  let fixedCount = 0;
  let totalCount = 0;

  filesToFix.forEach(fileName => {
    const filePath = path.join(routesDir, fileName);
    
    if (fs.existsSync(filePath)) {
      totalCount++;
      if (fixFile(filePath)) {
        fixedCount++;
      }
    } else {
      console.log(`⚠️  File not found: ${fileName}`);
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${totalCount}`);
  console.log(`   Files fixed: ${fixedCount}`);
  console.log(`   Files unchanged: ${totalCount - fixedCount}`);

  if (fixedCount > 0) {
    console.log('\n✅ Route import fixes completed!');
  } else {
    console.log('\n⏭️  No fixes were needed.');
  }
}

main();
