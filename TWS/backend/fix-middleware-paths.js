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
      
      // Check if file has incorrect middleware imports
      if (content.includes("../middleware/") && filePath.includes('/routes/')) {
        filesToFix.push(filePath);
      }
    }
  }
}

// Fix a single file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Count depth (how many ../ needed)
  const parts = filePath.split(path.sep);
  const routesIndex = parts.lastIndexOf('routes');
  const depth = parts.length - routesIndex - 2; // -2 for routes folder and file itself
  
  // Calculate correct path
  const correctPath = '../'.repeat(depth) + 'middleware/';
  
  // Replace incorrect paths
  // Pattern: ../middleware/ -> ../../../middleware/ (for routes files)
  if (content.includes('../middleware/')) {
    // Calculate relative path from routes file to src/middleware
    // From: backend/src/modules/admin/routes/file.js
    // To: backend/src/middleware/
    // Path: ../../../middleware/
    content = content.replace(/require\(['"]\.\.\/middleware\//g, "require('../../../middleware/");
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
console.log('Finding files with incorrect middleware paths...');
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

