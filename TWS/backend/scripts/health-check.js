#!/usr/bin/env node

const http = require('http');

const services = [
  { name: 'Frontend', url: 'http://localhost:3000' },
  { name: 'Backend', url: 'http://localhost:5000/health' },
  { name: 'Admin Dashboard', url: 'http://localhost:3001' },
  { name: 'Backend Alt', url: 'http://localhost:4000/health' }
];

async function checkService(service) {
  return new Promise((resolve) => {
    const req = http.get(service.url, (res) => {
      resolve({ name: service.name, status: res.statusCode, healthy: res.statusCode === 200 });
    });
    
    req.on('error', () => {
      resolve({ name: service.name, status: 'ERROR', healthy: false });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ name: service.name, status: 'TIMEOUT', healthy: false });
    });
  });
}

async function checkAllServices() {
  console.log('🔍 Checking TWS Services Health...\n');
  
  const results = await Promise.all(services.map(checkService));
  
  results.forEach(result => {
    const status = result.healthy ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.status}`);
  });
  
  const healthyCount = results.filter(r => r.healthy).length;
  const totalCount = results.length;
  
  console.log(`\n📊 Health Summary: ${healthyCount}/${totalCount} services healthy`);
  
  if (healthyCount === totalCount) {
    console.log('🎉 All services are healthy!');
    process.exit(0);
  } else {
    console.log('⚠️ Some services need attention.');
    process.exit(1);
  }
}

checkAllServices();
