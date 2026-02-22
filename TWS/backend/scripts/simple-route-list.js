#!/usr/bin/env node

/**
 * Simple route listing script that doesn't require full app initialization
 */

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../src/routes');

// Route categories
const routeCategories = {
  'Health & System': [],
  'Authentication': [],
  'Supra-Admin': [],
  'Tenant Management': [],
  'User Management': [],
  'Project Management': [],
  'File Management': [],
  'Analytics & Reports': [],
  'Infrastructure': [],
  'Other': []
};

// Common route patterns
const routePatterns = {
  'Health & System': ['/health', '/metrics'],
  'Authentication': ['/auth'],
  'Supra-Admin': ['/supra-admin'],
  'Tenant Management': ['/tenant'],
  'User Management': ['/users', '/employees'],
  'Project Management': ['/projects', '/tasks', '/boards', '/cards', '/lists'],
  'File Management': ['/files'],
  'Analytics & Reports': ['/analytics', '/reports'],
  'Infrastructure': ['/infrastructure', '/monitoring']
};

function analyzeRouteFile(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const routes = [];
    
    // Extract route definitions using regex
    const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = routeRegex.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const path = match[2];
      
      routes.push({
        method,
        path,
        file: fileName
      });
    }
    
    return routes;
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return [];
  }
}

function categorizeRoute(route) {
  const path = route.path.toLowerCase();
  
  for (const [category, patterns] of Object.entries(routePatterns)) {
    for (const pattern of patterns) {
      if (path.includes(pattern.toLowerCase())) {
        return category;
      }
    }
  }
  
  return 'Other';
}

function main() {
  console.log('🔍 Supra-Admin Backend Route Analysis (Simple)');
  console.log('==============================================\n');

  let totalRoutes = 0;
  const allRoutes = [];

  // Get all .js files in routes directory
  const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

  console.log(`📁 Analyzing ${files.length} route files...\n`);

  files.forEach(fileName => {
    const filePath = path.join(routesDir, fileName);
    const routes = analyzeRouteFile(filePath, fileName);
    
    if (routes.length > 0) {
      console.log(`📄 ${fileName}: ${routes.length} routes`);
      allRoutes.push(...routes);
      totalRoutes += routes.length;
    }
  });

  // Categorize routes
  allRoutes.forEach(route => {
    const category = categorizeRoute(route);
    routeCategories[category].push(route);
  });

  // Display routes by category
  console.log('\n📊 Routes by Category');
  console.log('=====================');

  Object.entries(routeCategories).forEach(([category, routes]) => {
    if (routes.length > 0) {
      console.log(`\n📁 ${category} (${routes.length} routes)`);
      console.log('─'.repeat(50));
      
      routes.forEach(route => {
        const method = route.method.padEnd(8);
        const file = `(${route.file})`.padEnd(20);
        console.log(`${method} ${route.path.padEnd(30)} ${file}`);
      });
    }
  });

  // Summary statistics
  console.log('\n📊 Route Summary');
  console.log('================');
  console.log(`Total Routes: ${totalRoutes}`);
  console.log(`Total Files: ${files.length}`);
  
  const methodCounts = {};
  allRoutes.forEach(route => {
    methodCounts[route.method] = (methodCounts[route.method] || 0) + 1;
  });
  
  Object.entries(methodCounts).forEach(([method, count]) => {
    console.log(`${method} Routes: ${count}`);
  });

  // Security analysis
  const authRoutes = allRoutes.filter(r => r.path.includes('/auth'));
  const protectedRoutes = allRoutes.filter(r => 
    !r.path.includes('/health') && 
    !r.path.includes('/auth') && 
    !r.path.includes('/metrics')
  );
  const publicRoutes = allRoutes.filter(r => 
    r.path.includes('/health') || 
    r.path.includes('/auth') || 
    r.path.includes('/metrics')
  );

  console.log('\n🔒 Security Analysis');
  console.log('===================');
  console.log(`Public Routes: ${publicRoutes.length}`);
  console.log(`Protected Routes: ${protectedRoutes.length}`);
  console.log(`Authentication Routes: ${authRoutes.length}`);

  // Supra-Admin specific analysis
  const supraAdminRoutes = allRoutes.filter(r => r.path.includes('/supra-admin'));
  console.log(`\n👑 Supra-Admin Routes: ${supraAdminRoutes.length}`);
  
  if (supraAdminRoutes.length > 0) {
    console.log('   Key Supra-Admin endpoints:');
    supraAdminRoutes.slice(0, 10).forEach(route => {
      console.log(`   ${route.method} ${route.path}`);
    });
    if (supraAdminRoutes.length > 10) {
      console.log(`   ... and ${supraAdminRoutes.length - 10} more`);
    }
  }

  // Export data
  const routeData = {
    timestamp: new Date().toISOString(),
    totalRoutes,
    totalFiles: files.length,
    categories: routeCategories,
    allRoutes,
    summary: {
      byMethod: methodCounts,
      security: {
        public: publicRoutes.length,
        protected: protectedRoutes.length,
        auth: authRoutes.length
      },
      supraAdmin: supraAdminRoutes.length
    }
  };

  fs.writeFileSync('simple-route-analysis.json', JSON.stringify(routeData, null, 2));
  console.log('\n💾 Route analysis saved to simple-route-analysis.json');

  console.log('\n✅ Route analysis complete!');
}

main();
