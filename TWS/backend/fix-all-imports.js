const fs = require('fs');
const path = require('path');

// Directory to search
const modulesDir = path.join(__dirname, 'src', 'modules');

// Files to fix
const filesToFix = [];

// Recursively find all JS files in modules directory
function findFiles(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath);
    } else if (file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file has incorrect imports (models or services)
      if ((content.includes("../models/") || content.includes("../services/")) && filePath.includes('/routes/')) {
        filesToFix.push(filePath);
      }
    }
  }
}

// Fix a single file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // From routes file: backend/src/modules/[module]/routes/file.js
  // To models: backend/src/models/
  // Path should be: ../../../models/
  
  // Replace incorrect model imports
  if (content.includes('../models/')) {
    content = content.replace(/require\(['"]\.\.\/models\//g, "require('../../../models/");
    modified = true;
  }
  
  // Replace incorrect service imports
  if (content.includes('../services/')) {
    content = content.replace(/require\(['"]\.\.\/services\//g, "require('../../../services/");
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
console.log('Finding files with incorrect model/service imports...');
findFiles(modulesDir);

console.log(`Found ${filesToFix.length} files to fix`);
console.log('');

let fixedCount = 0;
for (const file of filesToFix) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log('');
console.log(`Fixed ${fixedCount} files`);

