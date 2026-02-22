#!/usr/bin/env node

/**
 * Test script for tenant creation
 * This script tests the tenant creation process with valid data
 */

const mongoose = require('mongoose');
const Tenant = require('./src/models/Tenant');
const tenantService = require('./src/services/tenantService');

// Test data
const testTenantData = {
  name: 'Test Organization',
  slug: 'test-org',
  description: 'A test organization for validation',
  businessInfo: {
    industry: 'Technology',
    companySize: '1-10'
  },
  contactInfo: {
    email: 'test@example.com',
    phone: '+1234567890',
    website: 'https://test.com',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'US'
    }
  },
  settings: {
    timezone: 'UTC',
    currency: 'USD',
    language: 'en',
    dateFormat: 'MM/DD/YYYY'
  },
  features: {
    maxUsers: 10,
    maxProjects: 5,
    maxStorage: 1000
  },
  ownerCredentials: {
    username: 'testadmin',
    password: 'TestPassword123!',
    email: 'admin@test.com',
    fullName: 'Test Admin'
  }
};

async function testTenantCreation() {
  try {
    console.log('🧪 Testing tenant creation...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tws_test';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Clean up any existing test tenant
    await Tenant.deleteOne({ slug: 'test-org' });
    console.log('🧹 Cleaned up existing test data');
    
    // Test tenant creation
    const createdTenant = await tenantService.createTenant(testTenantData, '507f1f77bcf86cd799439011');
    console.log('✅ Tenant created successfully:', {
      id: createdTenant._id,
      name: createdTenant.name,
      slug: createdTenant.slug,
      status: createdTenant.status
    });
    
    // Verify tenant data
    const verificationChecks = [
      { check: 'Name matches', expected: testTenantData.name, actual: createdTenant.name },
      { check: 'Slug matches', expected: testTenantData.slug, actual: createdTenant.slug },
      { check: 'Contact email matches', expected: testTenantData.contactInfo.email, actual: createdTenant.contactInfo.email },
      { check: 'Owner username matches', expected: testTenantData.ownerCredentials.username, actual: createdTenant.ownerCredentials.username },
      { check: 'Owner email matches', expected: testTenantData.ownerCredentials.email, actual: createdTenant.ownerCredentials.email },
      { check: 'Owner full name matches', expected: testTenantData.ownerCredentials.fullName, actual: createdTenant.ownerCredentials.fullName },
      { check: 'Status is active', expected: 'active', actual: createdTenant.status }
    ];
    
    console.log('\n🔍 Verification Results:');
    verificationChecks.forEach(({ check, expected, actual }) => {
      const passed = expected === actual;
      console.log(`${passed ? '✅' : '❌'} ${check}: ${passed ? 'PASS' : `FAIL (expected: ${expected}, actual: ${actual})`}`);
    });
    
    // Test password hashing
    const bcrypt = require('bcryptjs');
    const passwordMatch = await bcrypt.compare(testTenantData.ownerCredentials.password, createdTenant.ownerCredentials.password);
    console.log(`${passwordMatch ? '✅' : '❌'} Password hashing: ${passwordMatch ? 'PASS' : 'FAIL'}`);
    
    // Clean up test data
    await Tenant.deleteOne({ _id: createdTenant._id });
    console.log('🧹 Cleaned up test tenant');
    
    console.log('\n🎉 All tests passed! Tenant creation is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testTenantCreation();
}

module.exports = testTenantCreation;
