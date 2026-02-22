const fs = require('fs');
const path = require('path');

// Directory to search
const modulesDir = path.join(__dirname, 'src', 'modules');

// Function to fix a file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix middleware imports: ../middleware/ -> ../../../middleware/
  if (content.includes('../middleware/')) {
    content = content.replace(/require\(['"]\.\.\/middleware\//g, "require('../../../middleware/");
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Recursively find and fix all route files
function findAndFixRoutes(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixedCount += findAndFixRoutes(filePath);
    } else if (file.endsWith('.js')) {
      // Check if file is in a routes directory
      const normalizedPath = filePath.replace(/\\/g, '/');
      if (normalizedPath.includes('/modules/') && normalizedPath.includes('/routes/')) {
        if (fixFile(filePath)) {
          console.log(`Fixed: ${filePath}`);
          fixedCount++;
        }
      }
    }
  }
  
  return fixedCount;
}

// Main execution
console.log('Fixing remaining middleware imports in route files...');
console.log('');

const fixedCount = findAndFixRoutes(modulesDir);

console.log('');
console.log(`Fixed ${fixedCount} files`);

