#!/usr/bin/env node

/**
 * Tenant Isolation Validation Script
 * 
 * This script performs comprehensive validation of tenant isolation
 * to ensure no data leakage between tenants in the multi-tenant ERP system.
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import tenant-aware models
const TenantUser = require('../src/models/tenant-aware/TenantUser');
const TenantProject = require('../src/models/tenant-aware/TenantProject');
const TenantClient = require('../src/models/tenant-aware/TenantClient');
const { TenantTransaction, TenantInvoice, TenantAccount } = require('../src/models/tenant-aware/TenantFinance');
const { TenantEmployee, TenantPayroll } = require('../src/models/tenant-aware/TenantHR');

class TenantIsolationValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`Running test: ${testName}`, 'info');
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASSED' });
      this.log(`✅ ${testName} - PASSED`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'FAILED', error: error.message });
      this.log(`❌ ${testName} - FAILED: ${error.message}`, 'error');
    }
  }

  async validateUserIsolation() {
    const tenant1 = 'tenant-1';
    const tenant2 = 'tenant-2';
    const orgId1 = new mongoose.Types.ObjectId();
    const orgId2 = new mongoose.Types.ObjectId();

    // Create users for both tenants
    const user1 = await TenantUser.create({
      tenantId: tenant1,
      orgId: orgId1,
      email: 'user1@tenant1.com',
      password: 'password123',
      fullName: 'User 1',
      role: 'admin'
    });

    const user2 = await TenantUser.create({
      tenantId: tenant2,
      orgId: orgId2,
      email: 'user1@tenant2.com',
      password: 'password123',
      fullName: 'User 2',
      role: 'admin'
    });

    // Test tenant-specific queries
    const tenant1Users = await TenantUser.findByTenant(tenant1);
    const tenant2Users = await TenantUser.findByTenant(tenant2);

    if (tenant1Users.length !== 1 || tenant2Users.length !== 1) {
      throw new Error('Tenant-specific queries returned incorrect number of users');
    }

    if (tenant1Users[0].tenantId !== tenant1 || tenant2Users[0].tenantId !== tenant2) {
      throw new Error('Users returned for wrong tenant');
    }

    // Test cross-tenant update prevention
    const updateResult = await TenantUser.updateByTenant(tenant2, { _id: user1._id }, { fullName: 'Hacked' });
    if (updateResult.modifiedCount > 0) {
      throw new Error('Cross-tenant update was allowed');
    }

    // Test cross-tenant deletion prevention
    const deleteResult = await TenantUser.deleteByTenant(tenant2, { _id: user1._id }, new mongoose.Types.ObjectId());
    if (deleteResult.modifiedCount > 0) {
      throw new Error('Cross-tenant deletion was allowed');
    }

    // Verify user1 is unchanged
    const unchangedUser = await TenantUser.findById(user1._id);
    if (unchangedUser.fullName !== 'User 1') {
      throw new Error('User data was modified by cross-tenant operation');
    }
  }

  async validateProjectIsolation() {
    const tenant1 = 'tenant-1';
    const tenant2 = 'tenant-2';
    const orgId1 = new mongoose.Types.ObjectId();
    const orgId2 = new mongoose.Types.ObjectId();

    // Create projects for both tenants
    const project1 = await TenantProject.create({
      tenantId: tenant1,
      orgId: orgId1,
      name: 'Project 1',
      slug: 'project-1',
      description: 'Tenant 1 Project',
      status: 'in_progress',
      priority: 'high'
    });

    const project2 = await TenantProject.create({
      tenantId: tenant2,
      orgId: orgId2,
      name: 'Project 1',
      slug: 'project-1',
      description: 'Tenant 2 Project',
      status: 'completed',
      priority: 'low'
    });

    // Test tenant-specific queries
    const tenant1Projects = await TenantProject.findByTenant(tenant1);
    const tenant2Projects = await TenantProject.findByTenant(tenant2);

    if (tenant1Projects.length !== 1 || tenant2Projects.length !== 1) {
      throw new Error('Tenant-specific project queries returned incorrect number of projects');
    }

    // Test slug uniqueness within tenant
    try {
      await TenantProject.create({
        tenantId: tenant1,
        orgId: orgId1,
        name: 'Duplicate Project',
        slug: 'project-1', // Duplicate slug in same tenant
        description: 'This should fail',
        status: 'planning',
        priority: 'low'
      });
      throw new Error('Duplicate slug was allowed within tenant');
    } catch (error) {
      if (!error.message.includes('duplicate key')) {
        throw error;
      }
    }
  }

  async validateFinancialIsolation() {
    const tenant1 = 'tenant-1';
    const tenant2 = 'tenant-2';
    const orgId1 = new mongoose.Types.ObjectId();
    const orgId2 = new mongoose.Types.ObjectId();

    // Create transactions for both tenants
    const transaction1 = await TenantTransaction.create({
      tenantId: tenant1,
      orgId: orgId1,
      type: 'income',
      category: 'service_revenue',
      amount: 1000,
      description: 'Tenant 1 Revenue',
      accountId: new mongoose.Types.ObjectId()
    });

    const transaction2 = await TenantTransaction.create({
      tenantId: tenant2,
      orgId: orgId2,
      type: 'income',
      category: 'service_revenue',
      amount: 2000,
      description: 'Tenant 2 Revenue',
      accountId: new mongoose.Types.ObjectId()
    });

    // Test tenant-specific queries
    const tenant1Transactions = await TenantTransaction.findByTenant(tenant1);
    const tenant2Transactions = await TenantTransaction.findByTenant(tenant2);

    if (tenant1Transactions.length !== 1 || tenant2Transactions.length !== 1) {
      throw new Error('Tenant-specific transaction queries returned incorrect number of transactions');
    }

    // Test financial totals isolation
    const tenant1Total = tenant1Transactions.reduce((sum, t) => sum + t.amount, 0);
    const tenant2Total = tenant2Transactions.reduce((sum, t) => sum + t.amount, 0);

    if (tenant1Total !== 1000 || tenant2Total !== 2000) {
      throw new Error('Financial totals are not properly isolated between tenants');
    }
  }

  async validateClientIsolation() {
    const tenant1 = 'tenant-1';
    const tenant2 = 'tenant-2';
    const orgId1 = new mongoose.Types.ObjectId();
    const orgId2 = new mongoose.Types.ObjectId();

    // Create clients for both tenants
    const client1 = await TenantClient.create({
      tenantId: tenant1,
      orgId: orgId1,
      name: 'Client 1',
      type: 'small_business',
      contactInfo: {
        primaryEmail: 'contact1@client1.com'
      },
      primaryContact: {
        name: 'Contact 1'
      }
    });

    const client2 = await TenantClient.create({
      tenantId: tenant2,
      orgId: orgId2,
      name: 'Client 1', // Same name as tenant 1 client
      type: 'enterprise',
      contactInfo: {
        primaryEmail: 'contact1@client2.com'
      },
      primaryContact: {
        name: 'Contact 1'
      }
    });

    // Test tenant-specific queries
    const tenant1Clients = await TenantClient.findByTenant(tenant1);
    const tenant2Clients = await TenantClient.findByTenant(tenant2);

    if (tenant1Clients.length !== 1 || tenant2Clients.length !== 1) {
      throw new Error('Tenant-specific client queries returned incorrect number of clients');
    }

    // Test client code uniqueness within tenant
    if (client1.clientCode === client2.clientCode) {
      throw new Error('Client codes should be unique within tenant');
    }
  }

  async validateHrIsolation() {
    const tenant1 = 'tenant-1';
    const tenant2 = 'tenant-2';
    const orgId1 = new mongoose.Types.ObjectId();
    const orgId2 = new mongoose.Types.ObjectId();

    // Create employees for both tenants
    const employee1 = await TenantEmployee.create({
      tenantId: tenant1,
      orgId: orgId1,
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe'
      },
      contactInfo: {
        email: 'john@tenant1.com'
      },
      employment: {
        position: 'Developer',
        department: new mongoose.Types.ObjectId(),
        hireDate: new Date()
      }
    });

    const employee2 = await TenantEmployee.create({
      tenantId: tenant2,
      orgId: orgId2,
      personalInfo: {
        firstName: 'John', // Same first name
        lastName: 'Doe'    // Same last name
      },
      contactInfo: {
        email: 'john@tenant2.com'
      },
      employment: {
        position: 'Manager',
        department: new mongoose.Types.ObjectId(),
        hireDate: new Date()
      }
    });

    // Test tenant-specific queries
    const tenant1Employees = await TenantEmployee.findByTenant(tenant1);
    const tenant2Employees = await TenantEmployee.findByTenant(tenant2);

    if (tenant1Employees.length !== 1 || tenant2Employees.length !== 1) {
      throw new Error('Tenant-specific employee queries returned incorrect number of employees');
    }

    // Test employee ID uniqueness within tenant
    if (employee1.employeeId === employee2.employeeId) {
      throw new Error('Employee IDs should be unique within tenant');
    }
  }

  async validateSoftDeleteIsolation() {
    const tenant1 = 'tenant-1';
    const tenant2 = 'tenant-2';
    const orgId1 = new mongoose.Types.ObjectId();
    const orgId2 = new mongoose.Types.ObjectId();

    // Create users for both tenants
    const user1 = await TenantUser.create({
      tenantId: tenant1,
      orgId: orgId1,
      email: 'user1@tenant1.com',
      password: 'password123',
      fullName: 'User 1',
      role: 'admin'
    });

    const user2 = await TenantUser.create({
      tenantId: tenant2,
      orgId: orgId2,
      email: 'user1@tenant2.com',
      password: 'password123',
      fullName: 'User 2',
      role: 'admin'
    });

    // Soft delete user1
    await user1.softDelete(new mongoose.Types.ObjectId());

    // Test tenant queries exclude soft deleted records
    const tenant1Users = await TenantUser.findByTenant(tenant1);
    const tenant2Users = await TenantUser.findByTenant(tenant2);

    if (tenant1Users.length !== 0) {
      throw new Error('Soft deleted user should not appear in tenant queries');
    }

    if (tenant2Users.length !== 1) {
      throw new Error('User from other tenant should not be affected by soft delete');
    }
  }

  async validateStatisticsIsolation() {
    const tenant1 = 'tenant-1';
    const tenant2 = 'tenant-2';
    const orgId1 = new mongoose.Types.ObjectId();
    const orgId2 = new mongoose.Types.ObjectId();

    // Create multiple users for tenant 1
    for (let i = 1; i <= 5; i++) {
      await TenantUser.create({
        tenantId: tenant1,
        orgId: orgId1,
        email: `user${i}@tenant1.com`,
        password: 'password123',
        fullName: `User ${i}`,
        role: 'employee'
      });
    }

    // Create multiple users for tenant 2
    for (let i = 1; i <= 3; i++) {
      await TenantUser.create({
        tenantId: tenant2,
        orgId: orgId2,
        email: `user${i}@tenant2.com`,
        password: 'password123',
        fullName: `User ${i}`,
        role: 'employee'
      });
    }

    // Get statistics for each tenant
    const tenant1Stats = await TenantUser.getTenantStats(tenant1);
    const tenant2Stats = await TenantUser.getTenantStats(tenant2);

    if (tenant1Stats.total !== 5 || tenant2Stats.total !== 3) {
      throw new Error('Tenant statistics are not properly isolated');
    }

    if (tenant1Stats.total === tenant2Stats.total) {
      throw new Error('Tenant statistics should be different');
    }
  }

  async validatePerformance() {
    const startTime = Date.now();
    const tenant1 = 'tenant-1';
    const orgId1 = new mongoose.Types.ObjectId();

    // Create 1000 users
    const users = [];
    for (let i = 1; i <= 1000; i++) {
      users.push({
        tenantId: tenant1,
        orgId: orgId1,
        email: `user${i}@tenant1.com`,
        password: 'password123',
        fullName: `User ${i}`,
        role: 'employee'
      });
    }

    await TenantUser.insertMany(users);
    const insertTime = Date.now() - startTime;

    // Query all users for tenant
    const queryStartTime = Date.now();
    const retrievedUsers = await TenantUser.findByTenant(tenant1);
    const queryTime = Date.now() - queryStartTime;

    if (retrievedUsers.length !== 1000) {
      throw new Error(`Expected 1000 users, got ${retrievedUsers.length}`);
    }

    if (insertTime > 5000) {
      throw new Error(`Insert performance too slow: ${insertTime}ms`);
    }

    if (queryTime > 1000) {
      throw new Error(`Query performance too slow: ${queryTime}ms`);
    }

    this.log(`Performance: Inserted 1000 users in ${insertTime}ms, queried in ${queryTime}ms`, 'success');
  }

  async runAllTests() {
    this.log('🚀 Starting Tenant Isolation Validation...', 'info');
    this.log('=' * 60, 'info');

    await this.runTest('User Isolation', () => this.validateUserIsolation());
    await this.runTest('Project Isolation', () => this.validateProjectIsolation());
    await this.runTest('Financial Isolation', () => this.validateFinancialIsolation());
    await this.runTest('Client Isolation', () => this.validateClientIsolation());
    await this.runTest('HR Isolation', () => this.validateHrIsolation());
    await this.runTest('Soft Delete Isolation', () => this.validateSoftDeleteIsolation());
    await this.runTest('Statistics Isolation', () => this.validateStatisticsIsolation());
    await this.runTest('Performance Validation', () => this.validatePerformance());

    this.log('=' * 60, 'info');
    this.log(`📊 Validation Summary:`, 'info');
    this.log(`✅ Passed: ${this.results.passed}`, 'success');
    this.log(`❌ Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
    this.log(`📈 Total: ${this.results.passed + this.results.failed}`, 'info');

    if (this.results.failed === 0) {
      this.log('🎉 All tenant isolation tests passed!', 'success');
      this.log('🔒 Tenant data isolation is working correctly.', 'success');
    } else {
      this.log('⚠️  Some tests failed. Please review the results above.', 'error');
      this.log('🔍 Check for tenant isolation issues.', 'error');
    }

    return this.results;
  }
}

async function main() {
  let mongoServer;
  let connection;

  try {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    connection = await mongoose.connect(mongoUri);

    // Run validation
    const validator = new TenantIsolationValidator();
    const results = await validator.runAllTests();

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    if (connection) {
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = TenantIsolationValidator;
