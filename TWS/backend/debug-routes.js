const express = require('express');
const app = express();

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Test API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API test route working' });
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
