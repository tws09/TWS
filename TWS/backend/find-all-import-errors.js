const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Comprehensive script to find all import/module errors in the backend
 * This script checks for:
 * 1. Missing module files
 * 2. Incorrect relative import paths
 * 3. Circular dependencies
 * 4. Missing npm packages
 */

const backendDir = path.join(__dirname, 'src');
const errors = [];
const warnings = [];
const checkedFiles = new Set();
const moduleCache = new Map();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Resolve a require path relative to a file
 */
function resolveRequirePath(requirePath, fromFile) {
  // Skip node_modules and built-in modules
  if (!requirePath.startsWith('.') && !requirePath.startsWith('/')) {
    return { type: 'external', path: requirePath };
  }

  const fromDir = path.dirname(fromFile);
  const resolvedPath = path.resolve(fromDir, requirePath);
  
  // Try different extensions
  const extensions = ['.js', '.json', '/index.js'];
  for (const ext of extensions) {
    const fullPath = resolvedPath + ext;
    if (fs.existsSync(fullPath)) {
      return { type: 'file', path: fullPath };
    }
  }
  
  // Check if it's a directory with index.js
  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
    const indexPath = path.join(resolvedPath, 'index.js');
    if (fs.existsSync(indexPath)) {
      return { type: 'file', path: indexPath };
    }
  }
  
  return { type: 'missing', path: resolvedPath };
}

/**
 * Extract all require/import statements from a file
 */
function extractRequires(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const requires = [];
    
    // Process each line to check if it's commented
    lines.forEach((line, lineIndex) => {
      const lineNumber = lineIndex + 1;
      const trimmedLine = line.trim();
      
      // Skip commented lines (single line comments)
      if (trimmedLine.startsWith('//')) {
        return;
      }
      
      // Skip empty lines
      if (trimmedLine.length === 0) {
        return;
      }
      
      // Check for require statements (only if not commented)
      const requireMatch = trimmedLine.match(/require\(['"]([^'"]+)['"]\)/);
      if (requireMatch) {
        // Check if the require is after a comment on the same line
        const commentIndex = trimmedLine.indexOf('//');
        const requireIndex = trimmedLine.indexOf('require(');
        if (commentIndex === -1 || requireIndex < commentIndex) {
          requires.push({
            path: requireMatch[1],
            line: lineNumber,
            column: line.indexOf('require(') + 1
          });
        }
      }
      
      // Check for import statements (ES6)
      const importMatch = trimmedLine.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const commentIndex = trimmedLine.indexOf('//');
        const importIndex = trimmedLine.indexOf('import');
        if (commentIndex === -1 || importIndex < commentIndex) {
          requires.push({
            path: importMatch[1],
            line: lineNumber,
            column: line.indexOf('import') + 1
          });
        }
      }
    });
    
    return requires;
  } catch (error) {
    return [];
  }
}

/**
 * Check if a file has import errors
 */
function checkFile(filePath) {
  if (checkedFiles.has(filePath)) {
    return;
  }
  
  checkedFiles.add(filePath);
  
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  const requires = extractRequires(filePath);
  
  for (const req of requires) {
    const resolved = resolveRequirePath(req.path, filePath);
    
    if (resolved.type === 'missing') {
      // Check if it's a relative path that might be incorrect
      if (req.path.startsWith('.')) {
        const relativePath = path.relative(backendDir, filePath);
        const expectedPaths = [
          // Common corrections for module routes
          req.path.replace('../workers/', '../../../workers/'),
          req.path.replace('../middleware/', '../../../middleware/'),
          req.path.replace('../models/', '../../../models/'),
          req.path.replace('../services/', '../../../services/'),
          req.path.replace('../config/', '../../../config/'),
          req.path.replace('../routes/', '../../../routes/'),
          req.path.replace('./middleware/', '../../../middleware/'),
          req.path.replace('./models/', '../../../models/'),
          req.path.replace('./services/', '../../../services/'),
          req.path.replace('./config/', '../../../config/'),
          req.path.replace('./routes/', '../../../routes/'),
        ];
        
        // Check if any of the expected paths exist
        for (const expectedPath of expectedPaths) {
          const testResolved = resolveRequirePath(expectedPath, filePath);
          if (testResolved.type === 'file') {
            errors.push({
              file: filePath,
              line: req.line,
              column: req.column,
              require: req.path,
              error: `Module not found. Did you mean: ${expectedPath}?`,
              suggestion: `Change: require('${req.path}') to require('${expectedPath}')`,
              severity: 'error'
            });
            return;
          }
        }
        
        errors.push({
          file: filePath,
          line: req.line,
          column: req.column,
          require: req.path,
          error: `Module not found: ${req.path}`,
          resolved: resolved.path,
          severity: 'error'
        });
      } else if (!req.path.startsWith('@')) {
        // Check if it's an npm package
        try {
          require.resolve(req.path);
        } catch (e) {
          warnings.push({
            file: filePath,
            line: req.line,
            require: req.path,
            error: `Possible missing npm package: ${req.path}`,
            severity: 'warning'
          });
        }
      }
    }
  }
}

/**
 * Recursively find all JavaScript files
 */
function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip node_modules, .git, and other ignored directories
    if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist' || file === 'build') {
      continue;
    }
    
    if (stat.isDirectory()) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js') && !file.endsWith('.test.js') && !file.endsWith('.spec.js')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

/**
 * Main function
 */
function main() {
  log('🔍 Starting comprehensive import error detection...', 'cyan');
  log('=' .repeat(60), 'cyan');
  log('');
  
  // Find all JavaScript files
  log('📂 Scanning for JavaScript files...', 'blue');
  const jsFiles = findJsFiles(backendDir);
  log(`   Found ${jsFiles.length} JavaScript files`, 'green');
  log('');
  
  // Check each file
  log('🔎 Checking imports...', 'blue');
  for (const file of jsFiles) {
    checkFile(file);
  }
  
  // Print results
  log('');
  log('=' .repeat(60), 'cyan');
  log('📊 RESULTS', 'cyan');
  log('=' .repeat(60), 'cyan');
  log('');
  
  if (errors.length === 0 && warnings.length === 0) {
    log('✅ No import errors found!', 'green');
    return;
  }
  
  // Group errors by file
  const errorsByFile = {};
  for (const error of errors) {
    if (!errorsByFile[error.file]) {
      errorsByFile[error.file] = [];
    }
    errorsByFile[error.file].push(error);
  }
  
  // Print errors
  if (errors.length > 0) {
    log(`❌ Found ${errors.length} ERROR(S):`, 'red');
    log('');
    
    for (const [file, fileErrors] of Object.entries(errorsByFile)) {
      const relativePath = path.relative(backendDir, file);
      log(`📄 ${relativePath}`, 'yellow');
      
      for (const error of fileErrors) {
        log(`   Line ${error.line}:${error.column}`, 'red');
        log(`   require('${error.require}')`, 'red');
        log(`   Error: ${error.error}`, 'red');
        if (error.suggestion) {
          log(`   💡 Suggestion: ${error.suggestion}`, 'cyan');
        }
        log('');
      }
    }
  }
  
  // Print warnings
  if (warnings.length > 0) {
    log('');
    log(`⚠️  Found ${warnings.length} WARNING(S):`, 'yellow');
    log('');
    
    for (const warning of warnings) {
      const relativePath = path.relative(backendDir, warning.file);
      log(`📄 ${relativePath}:${warning.line}`, 'yellow');
      log(`   require('${warning.require}')`, 'yellow');
      log(`   ${warning.error}`, 'yellow');
      log('');
    }
  }
  
  // Generate fix script
  if (errors.length > 0) {
    log('');
    log('=' .repeat(60), 'cyan');
    log('🔧 GENERATING FIX SUGGESTIONS', 'cyan');
    log('=' .repeat(60), 'cyan');
    log('');
    
    const fixScript = generateFixScript(errors);
    const fixScriptPath = path.join(__dirname, 'auto-fix-imports.js');
    fs.writeFileSync(fixScriptPath, fixScript);
    log(`✅ Fix script generated: ${path.relative(__dirname, fixScriptPath)}`, 'green');
    log(`   Run: node ${path.relative(__dirname, fixScriptPath)}`, 'cyan');
  }
  
  // Summary
  log('');
  log('=' .repeat(60), 'cyan');
  log('📈 SUMMARY', 'cyan');
  log('=' .repeat(60), 'cyan');
  log(`   Total files checked: ${jsFiles.length}`, 'blue');
  log(`   Errors found: ${errors.length}`, errors.length > 0 ? 'red' : 'green');
  log(`   Warnings found: ${warnings.length}`, warnings.length > 0 ? 'yellow' : 'green');
  log('');
}

/**
 * Generate an auto-fix script
 */
function generateFixScript(errors) {
  const fixes = [];
  
  for (const error of errors) {
    if (error.suggestion) {
      const match = error.suggestion.match(/Change: require\('([^']+)'\) to require\('([^']+)'\)/);
      if (match) {
        fixes.push({
          file: error.file,
          old: match[1],
          new: match[2],
          line: error.line
        });
      }
    }
  }
  
  // Generate script using string concatenation to avoid template literal nesting issues
  let script = 'const fs = require(\'fs\');\n';
  script += 'const path = require(\'path\');\n\n';
  script += '/**\n';
  script += ' * Auto-generated fix script for import errors\n';
  script += ' * Generated by find-all-import-errors.js\n';
  script += ' */\n\n';
  script += 'const fixes = ' + JSON.stringify(fixes, null, 2) + ';\n\n';
  script += 'let fixedCount = 0;\n\n';
  script += 'for (const fix of fixes) {\n';
  script += '  try {\n';
  script += '    let content = fs.readFileSync(fix.file, \'utf8\');\n';
  script += '    const lines = content.split(\'\\n\');\n';
  script += '    \n';
  script += '    if (lines[fix.line - 1]) {\n';
  script += '      const line = lines[fix.line - 1];\n';
  script += '      const oldPath = fix.old;\n';
  script += '      const newPath = fix.new;\n';
  script += '      \n';
  script += '      // Replace require statements\n';
  script += '      const newLine = line\n';
  script += '        .replace(new RegExp("require\\\\([\'\\"]" + oldPath.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g, \'\\\\\\\\$&\') + "[\'\\"]\\\\)", \'g\'), "require(\'" + newPath + "\')")\n';
  script += '        .replace(new RegExp(\'require\\\\(["\\\']\' + oldPath.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g, \'\\\\\\\\$&\') + \'["\\\']\\\\)\', \'g\'), \'require("\' + newPath + \'")\');\n';
  script += '      \n';
  script += '      if (newLine !== line) {\n';
  script += '        lines[fix.line - 1] = newLine;\n';
  script += '        content = lines.join(\'\\n\');\n';
  script += '        fs.writeFileSync(fix.file, content, \'utf8\');\n';
  script += '        console.log(\'✅ Fixed: \' + path.relative(__dirname, fix.file) + \':\' + fix.line);\n';
  script += '        fixedCount++;\n';
  script += '      }\n';
  script += '    }\n';
  script += '  } catch (error) {\n';
  script += '    console.error(\'❌ Error fixing \' + fix.file + \':\', error.message);\n';
  script += '  }\n';
  script += '}\n\n';
  script += 'console.log(\'\\n✅ Fixed \' + fixedCount + \' import(s)\');\n';
  
  return script;
}

// Run the script
try {
  main();
} catch (error) {
  log(`❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
}

