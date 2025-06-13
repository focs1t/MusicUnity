const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Проксирование запросов к backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  );
}; 