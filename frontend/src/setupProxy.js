// Прокси для режима разработки (npm start): API и сокеты идут через тот же origin,
// что и страница. Благодаря этому сессионная cookie работает без CORS и без HTTPS,
// в том числе при открытии с телефона по IP компьютера в локальной сети.
const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function(app) {
    const target = process.env.BACKEND_URL || 'http://localhost:5000';

    app.use(createProxyMiddleware('/api', {target, changeOrigin: true}));
    app.use(createProxyMiddleware('/socket.io', {target, changeOrigin: true, ws: true}));
};
