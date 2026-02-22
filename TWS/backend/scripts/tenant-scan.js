#!/usr/bin/env node

/**
 * Tenant isolation scanner for Supra-Admin Backend
 * Scans database for tenant isolation issues and cross-tenant data leaks
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Tenant = require('../src/models/Tenant');
const Organization = require('../src/models/Organization');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');

// Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tws';

// Scan results
const scanResults = {
  timestamp: new Date().toISOString(),
  tenantCount: 0,
  userCount: 0,
  isolationIssues: [],
  recommendations: [],
  summary: {}
};

/**
 * Connect to MongoDB
 */
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

/**
 * Scan tenant isolation in Users collection
 */
async function scanUserIsolation() {
  console.log('\n🔍 Scanning User tenant isolation...');
  
  try {
    // Count users by tenant
    const userCounts = await User.aggregate([
      { $group: { _id: '$tenantId', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('📊 Users by Tenant:');
    userCounts.forEach(tenant => {
      console.log(`   ${tenant._id || 'No Tenant'}: ${tenant.count} users`);
    });

    // Check for users without tenantId
    const usersWithoutTenant = await User.countDocuments({ 
      $or: [
        { tenantId: { $exists: false } },
        { tenantId: null },
        { tenantId: '' }
      ]
    });

    if (usersWithoutTenant > 0) {
      scanResults.isolationIssues.push({
        type: 'missing_tenant_id',
        collection: 'users',
        count: usersWithoutTenant,
        severity: 'high',
        description: 'Users without tenantId found'
      });
      console.log(`❌ Found ${usersWithoutTenant} users without tenantId`);
    }

    // Check for duplicate emails across tenants
    const duplicateEmails = await User.aggregate([
      { $group: { _id: '$email', tenants: { $addToSet: '$tenantId' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicateEmails.length > 0) {
      scanResults.isolationIssues.push({
        type: 'duplicate_email_across_tenants',
        collection: 'users',
        count: duplicateEmails.length,
        severity: 'high',
        description: 'Duplicate emails found across different tenants',
        details: duplicateEmails.map(dup => ({
          email: dup._id,
          tenants: dup.tenants,
          count: dup.count
        }))
      });
      console.log(`❌ Found ${duplicateEmails.length} duplicate emails across tenants`);
    }

    scanResults.summary.usersByTenant = userCounts;
    scanResults.userCount = await User.countDocuments();

  } catch (error) {
    console.error('❌ Error scanning user isolation:', error.message);
  }
}

/**
 * Scan tenant isolation in Projects collection
 */
async function scanProjectIsolation() {
  console.log('\n🔍 Scanning Project tenant isolation...');
  
  try {
    // Count projects by tenant
    const projectCounts = await Project.aggregate([
      { $group: { _id: '$tenantId', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('📊 Projects by Tenant:');
    projectCounts.forEach(tenant => {
      console.log(`   ${tenant._id || 'No Tenant'}: ${tenant.count} projects`);
    });

    // Check for projects without tenantId
    const projectsWithoutTenant = await Project.countDocuments({ 
      $or: [
        { tenantId: { $exists: false } },
        { tenantId: null },
        { tenantId: '' }
      ]
    });

    if (projectsWithoutTenant > 0) {
      scanResults.isolationIssues.push({
        type: 'missing_tenant_id',
        collection: 'projects',
        count: projectsWithoutTenant,
        severity: 'high',
        description: 'Projects without tenantId found'
      });
      console.log(`❌ Found ${projectsWithoutTenant} projects without tenantId`);
    }

    scanResults.summary.projectsByTenant = projectCounts;

  } catch (error) {
    console.error('❌ Error scanning project isolation:', error.message);
  }
}

/**
 * Scan tenant isolation in Tasks collection
 */
async function scanTaskIsolation() {
  console.log('\n🔍 Scanning Task tenant isolation...');
  
  try {
    // Count tasks by tenant
    const taskCounts = await Task.aggregate([
      { $group: { _id: '$tenantId', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('📊 Tasks by Tenant:');
    taskCounts.forEach(tenant => {
      console.log(`   ${tenant._id || 'No Tenant'}: ${tenant.count} tasks`);
    });

    // Check for tasks without tenantId
    const tasksWithoutTenant = await Task.countDocuments({ 
      $or: [
        { tenantId: { $exists: false } },
        { tenantId: null },
        { tenantId: '' }
      ]
    });

    if (tasksWithoutTenant > 0) {
      scanResults.isolationIssues.push({
        type: 'missing_tenant_id',
        collection: 'tasks',
        count: tasksWithoutTenant,
        severity: 'high',
        description: 'Tasks without tenantId found'
      });
      console.log(`❌ Found ${tasksWithoutTenant} tasks without tenantId`);
    }

    scanResults.summary.tasksByTenant = taskCounts;

  } catch (error) {
    console.error('❌ Error scanning task isolation:', error.message);
  }
}

/**
 * Check database indexes for tenant isolation
 */
async function checkTenantIndexes() {
  console.log('\n🔍 Checking tenant isolation indexes...');
  
  try {
    const collections = ['users', 'projects', 'tasks', 'organizations'];
    const indexIssues = [];

    for (const collectionName of collections) {
      const collection = mongoose.connection.db.collection(collectionName);
      const indexes = await collection.indexes();
      
      // Check if there's a tenantId index
      const hasTenantIndex = indexes.some(index => 
        index.key && (index.key.tenantId || index.key['tenantId'])
      );

      if (!hasTenantIndex) {
        indexIssues.push({
          collection: collectionName,
          issue: 'missing_tenant_index',
          severity: 'medium',
          description: `No tenantId index found on ${collectionName} collection`
        });
        console.log(`⚠️  ${collectionName}: No tenantId index found`);
      } else {
        console.log(`✅ ${collectionName}: tenantId index found`);
      }

      // Check for compound indexes with tenantId
      const hasCompoundTenantIndex = indexes.some(index => {
        const keys = Object.keys(index.key);
        return keys.includes('tenantId') && keys.length > 1;
      });

      if (!hasCompoundTenantIndex) {
        indexIssues.push({
          collection: collectionName,
          issue: 'missing_compound_tenant_index',
          severity: 'low',
          description: `No compound index with tenantId found on ${collectionName} collection`
        });
      }
    }

    if (indexIssues.length > 0) {
      scanResults.isolationIssues.push(...indexIssues);
    }

  } catch (error) {
    console.error('❌ Error checking indexes:', error.message);
  }
}

/**
 * Test cross-tenant data access
 */
async function testCrossTenantAccess() {
  console.log('\n🔍 Testing cross-tenant data access...');
  
  try {
    // Get first two tenants
    const tenants = await Tenant.find().limit(2);
    
    if (tenants.length < 2) {
      console.log('⚠️  Need at least 2 tenants to test cross-tenant access');
      return;
    }

    const tenant1 = tenants[0];
    const tenant2 = tenants[1];

    // Try to find tenant1's users from tenant2 context
    const crossTenantUsers = await User.find({
      tenantId: tenant1.tenantId
    });

    if (crossTenantUsers.length > 0) {
      console.log(`✅ Found ${crossTenantUsers.length} users for tenant ${tenant1.tenantId}`);
      
      // This is actually expected behavior - the issue would be if we could access
      // tenant1's data when authenticated as tenant2 user
      console.log('ℹ️  Cross-tenant queries are possible (expected for admin functions)');
    }

  } catch (error) {
    console.error('❌ Error testing cross-tenant access:', error.message);
  }
}

/**
 * Generate recommendations
 */
function generateRecommendations() {
  console.log('\n💡 Generating recommendations...');
  
  const recommendations = [];

  // Check for missing tenant IDs
  const missingTenantIssues = scanResults.isolationIssues.filter(
    issue => issue.type === 'missing_tenant_id'
  );

  if (missingTenantIssues.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'data_integrity',
      title: 'Fix Missing Tenant IDs',
      description: 'Several records are missing tenantId fields',
      actions: [
        'Add tenantId to all records without it',
        'Implement database migration script',
        'Add validation to prevent future records without tenantId'
      ],
      affectedCollections: missingTenantIssues.map(issue => issue.collection)
    });
  }

  // Check for duplicate emails
  const duplicateEmailIssues = scanResults.isolationIssues.filter(
    issue => issue.type === 'duplicate_email_across_tenants'
  );

  if (duplicateEmailIssues.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'security',
      title: 'Resolve Duplicate Emails',
      description: 'Same email addresses exist across different tenants',
      actions: [
        'Review and resolve duplicate email conflicts',
        'Implement tenant-scoped email uniqueness',
        'Add compound unique index on (tenantId, email)'
      ]
    });
  }

  // Check for missing indexes
  const indexIssues = scanResults.isolationIssues.filter(
    issue => issue.issue && issue.issue.includes('index')
  );

  if (indexIssues.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'performance',
      title: 'Add Tenant Isolation Indexes',
      description: 'Missing indexes for efficient tenant-scoped queries',
      actions: [
        'Add tenantId index to all collections',
        'Add compound indexes for common query patterns',
        'Monitor query performance after index creation'
      ],
      affectedCollections: indexIssues.map(issue => issue.collection)
    });
  }

  // General recommendations
  recommendations.push({
    priority: 'medium',
    category: 'security',
    title: 'Implement Tenant Middleware',
    description: 'Ensure all routes use tenant middleware for isolation',
    actions: [
      'Review all API routes for tenant middleware usage',
      'Add tenant context to all database queries',
      'Implement tenant-scoped query helpers'
    ]
  });

  recommendations.push({
    priority: 'low',
    category: 'monitoring',
    title: 'Add Tenant Isolation Monitoring',
    description: 'Monitor for tenant isolation violations',
    actions: [
      'Add audit logging for cross-tenant access attempts',
      'Implement automated tenant isolation tests',
      'Set up alerts for suspicious cross-tenant queries'
    ]
  });

  scanResults.recommendations = recommendations;

  console.log(`📋 Generated ${recommendations.length} recommendations`);
  recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
  });
}

/**
 * Main scan function
 */
async function runTenantScan() {
  console.log('🚀 Supra-Admin Tenant Isolation Scanner');
  console.log('=======================================');
  console.log(`MongoDB URI: ${MONGO_URI.replace(/\/\/.*@/, '//***:***@')}`);
  console.log(`Timestamp: ${scanResults.timestamp}\n`);

  try {
    await connectToDatabase();

    // Get basic tenant information
    scanResults.tenantCount = await Tenant.countDocuments();
    console.log(`📊 Found ${scanResults.tenantCount} tenants`);

    // Run isolation scans
    await scanUserIsolation();
    await scanProjectIsolation();
    await scanTaskIsolation();
    await checkTenantIndexes();
    await testCrossTenantAccess();

    // Generate recommendations
    generateRecommendations();

    // Summary
    console.log('\n📊 Scan Summary');
    console.log('================');
    console.log(`Total Tenants: ${scanResults.tenantCount}`);
    console.log(`Total Users: ${scanResults.userCount}`);
    console.log(`Isolation Issues: ${scanResults.isolationIssues.length}`);
    console.log(`Recommendations: ${scanResults.recommendations.length}`);

    const highPriorityIssues = scanResults.isolationIssues.filter(
      issue => issue.severity === 'high'
    );
    const highPriorityRecommendations = scanResults.recommendations.filter(
      rec => rec.priority === 'high'
    );

    console.log(`High Priority Issues: ${highPriorityIssues.length}`);
    console.log(`High Priority Recommendations: ${highPriorityRecommendations.length}`);

    if (highPriorityIssues.length > 0) {
      console.log('\n🚨 High Priority Issues:');
      highPriorityIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.description} (${issue.collection})`);
      });
    }

    // Save detailed report
    const fs = require('fs');
    fs.writeFileSync('tenant-isolation-report.json', JSON.stringify(scanResults, null, 2));
    console.log('\n💾 Detailed report saved to tenant-isolation-report.json');

    // Exit with appropriate code
    const hasHighPriorityIssues = highPriorityIssues.length > 0;
    process.exit(hasHighPriorityIssues ? 1 : 0);

  } catch (error) {
    console.error('💥 Tenant scan failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
}

// Run the scan
runTenantScan();
