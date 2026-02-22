const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      timeout: 30000,
      onError: function (err, req, res) {
        console.log('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Proxy error: ' + err.message);
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('Proxying request:', req.method, req.url, '->', proxyReq.path);
      }
    })
  );
};
