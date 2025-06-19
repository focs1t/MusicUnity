const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Проксирование запросов к backend через ngrok
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://12a1-91-108-189-233.ngrok-free.app',
      changeOrigin: true,
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
  );
}; 