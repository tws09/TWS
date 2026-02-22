const https = require('https');
const http = require('http');

function testSupraAdminLogin() {
  console.log('🧪 Testing SupraAdmin Login...');
  
  const postData = JSON.stringify({
    email: 'admin@gts.com',
    password: 'admin123456'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/gts-admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log('✅ Login successful!');
          console.log('User:', result.data.user);
          console.log('Token received:', !!result.data.accessToken);
        } else {
          console.log('❌ Login failed:', result.message);
        }
      } catch (error) {
        console.log('❌ Parse error:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Connection error:', error.message);
  });

  req.write(postData);
  req.end();
}

testSupraAdminLogin();
