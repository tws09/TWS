#!/usr/bin/env node

require('dotenv').config();
const seedEmployees = require('./seedEmployees');

console.log('🚀 Starting WolfStack Employee Seeding Process...');
console.log('=====================================');

seedEmployees()
  .then(() => {
    console.log('🎉 Seeding process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  });
