const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const ALT_PORT = 3001;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

function getActiveTTSPort() {
  const activePortFile = path.join(__dirname, '.active_tts_port');
  if (fs.existsSync(activePortFile)) {
    try {
      const portStr = fs.readFileSync(activePortFile, 'utf8').trim();
      const p = parseInt(portStr);
      if (!isNaN(p)) return p;
    } catch (e) {}
  }
  return 5005;
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. macOS System Control API (/api/mac/command)
  if (req.url.startsWith('/api/mac/command') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const action = payload.action;

        if (action === 'screenshot') {
          const timestamp = Date.now();
          const targetPath = path.join(process.env.HOME, 'Desktop', `FATE_Screenshot_${timestamp}.png`);
          exec(`screencapture "${targetPath}"`, (err) => {
            if (err) return res.writeHead(500).end(JSON.stringify({ error: err.message }));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: `Screenshot saved to Desktop as FATE_Screenshot_${timestamp}.png`, path: targetPath }));
          });
          return;
        }

        if (action === 'volume_up') {
          exec(`osascript -e "set volume output volume ((output volume of (get volume settings)) + 15)"`, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Master volume increased by 15%' }));
          });
          return;
        }

        if (action === 'volume_down') {
          exec(`osascript -e "set volume output volume ((output volume of (get volume settings)) - 15)"`, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Master volume decreased by 15%' }));
          });
          return;
        }

        if (action === 'open_app') {
          const appName = payload.appName || 'Finder';
          exec(`open -a "${appName}"`, (err) => {
            if (err) return res.writeHead(400).end(JSON.stringify({ error: `Could not launch ${appName}` }));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: `Successfully launched ${appName}` }));
          });
          return;
        }

        if (action === 'battery') {
          exec(`pmset -g batt`, (err, stdout) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ output: stdout || 'Battery diagnostics unavailable' }));
          });
          return;
        }

        if (action === 'storage') {
          exec(`df -h /`, (err, stdout) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ output: stdout || 'Storage diagnostics unavailable' }));
          });
          return;
        }

        res.writeHead(400).end(JSON.stringify({ error: 'Unknown macOS system action' }));
      } catch (e) {
        res.writeHead(400).end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // 2. Proxy request to Python TTS server (/api/tts)
  if (req.url.startsWith('/api/tts')) {
    const ttsPort = getActiveTTSPort();
    const proxyReq = http.request({
      hostname: '127.0.0.1',
      port: ttsPort,
      path: req.url,
      method: req.method,
      headers: req.headers
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error(`Error connecting to Python TTS server on port ${ttsPort}:`, err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `TTS Python backend server not reachable on port ${ttsPort}.` }));
    });

    req.pipe(proxyReq, { end: true });
    return;
  }

  // 3. Static File Server
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(__dirname, 'index.html');
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end('500 Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/html' });
        res.end(content, 'utf-8');
      }
    });
  });
});

function listenOnPort(p) {
  server.listen(p, () => {
    console.log(`==================================================`);
    console.log(`⚡ FATE Core HTTP Server running at http://localhost:${p}`);
    console.log(`==================================================`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE' && p === PORT) {
      console.log(`Port ${PORT} busy, attempting fallback port ${ALT_PORT}...`);
      listenOnPort(ALT_PORT);
    } else {
      console.error('Server error:', err);
    }
  });
}

listenOnPort(PORT);
