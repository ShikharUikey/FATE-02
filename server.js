const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = parseInt(process.env.PORT, 10) || 3000;
const TTS_PORT = process.env.TTS_PORT || 5000;
const PUBLIC_DIR = path.join(__dirname);

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav'
};

function startServer(port) {
  const server = http.createServer((req, res) => {
    // 1. Proxy /api/tts to Python Coqui TTS Server
    if (req.url.startsWith('/api/tts') || req.url.startsWith('/api/status')) {
      const proxyReq = http.request({
        hostname: '127.0.0.1',
        port: TTS_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });

      proxyReq.on('error', () => {
        // Fallback if Coqui TTS server is not running
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Coqui TTS server offline on port 5000. Fallback to WebSpeech.' }));
      });

      req.pipe(proxyReq, { end: true });
      return;
    }

    // 2. Static File Serving
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1>', 'utf-8');
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use. Retrying on port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, () => {
    console.log(`\n==================================================`);
    console.log(`  🚀 FATE Local Server Active!`);
    console.log(`  🌐 URL: http://localhost:${port}`);
    console.log(`  🎙️ Coqui TTS Proxy Route: /api/tts`);
    console.log(`==================================================\n`);
  });
}

startServer(PORT);
