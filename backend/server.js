require('dotenv').config({ path: __dirname + '/../.env' });
// Минимальный сервер на Node.js без сторонних библиотек
const { createServer } = require('http');
const { router } = require('./router');
const { parseEnv } = require('./utils/env');
const fs = require('fs');
const path = require('path');


const env = parseEnv(__dirname + '/../.env');

const server = createServer((req, res) => {
  // API-запросы только через /api
  if (req.url.startsWith('/api')) {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          req.body = JSON.parse(body || '{}');
        } catch (e) {
          req.body = {};
        }
        router(req, res, env, (err) => {
          res.writeHead(500);
          res.end('Internal server error');
        });
      });
    } else {
      router(req, res, env, (err) => {
        res.writeHead(500);
        res.end('Internal server error');
      });
    }
    return;
  }
  // Всё остальное — фронт (статика или index.html)
  const filePath = path.join(__dirname, '../frontend', req.url);
  fs.stat(filePath, (err, stat) => {
    let servePath = filePath;
    if (err || !stat.isFile()) {
      // Если файл не найден, отдаём index.html (SPA fallback)
      servePath = path.join(__dirname, '../frontend/index.html');
    }
    fs.readFile(servePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      // Определяем Content-Type
      let ext = path.extname(servePath).toLowerCase();
      let contentType = 'text/html';
      if (ext === '.js') contentType = 'application/javascript';
      if (ext === '.css') contentType = 'text/css';
      if (ext === '.json') contentType = 'application/json';
      if (ext === '.png') contentType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

const PORT = env.BACKEND_PORT ? parseInt(env.BACKEND_PORT) : 3000;
server.listen(PORT, () => {
  console.log('Server running on port', PORT);
}); 