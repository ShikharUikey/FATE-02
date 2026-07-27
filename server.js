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

        if (action === 'volume_mute') {
          exec(`osascript -e "set volume output muted true"`, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Master volume muted' }));
          });
          return;
        }

        if (action === 'volume_max') {
          exec(`osascript -e "set volume output volume 100"`, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Master volume set to 100%' }));
          });
          return;
        }

        if (action === 'brightness_up') {
          exec(`osascript -e 'tell application "System Events" to repeat 3 times' -e 'key code 144' -e 'end repeat'`, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Display brightness increased' }));
          });
          return;
        }

        if (action === 'brightness_down') {
          exec(`osascript -e 'tell application "System Events" to repeat 3 times' -e 'key code 145' -e 'end repeat'`, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Display brightness decreased' }));
          });
          return;
        }

        if (action === 'lock_screen') {
          exec(`pmset displaysleepnow`, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Display locked' }));
          });
          return;
        }

        if (action === 'sleep_mac') {
          exec(`osascript -e 'tell application "System Events" to sleep'`, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Mac put to sleep' }));
          });
          return;
        }

        if (action === 'open_app') {
          const rawApp = (payload.appName || 'Finder').trim();
          const lowerApp = rawApp.toLowerCase();

          // Intelligent Alias Mapping for macOS Applications
          const appAliases = {
            'chrome': 'Google Chrome',
            'google chrome': 'Google Chrome',
            'vscode': 'Visual Studio Code',
            'vs code': 'Visual Studio Code',
            'visual studio code': 'Visual Studio Code',
            'code': 'Visual Studio Code',
            'capcut': 'CapCut 2',
            'cap cut': 'CapCut 2',
            'capcut 2': 'CapCut 2',
            'chatgpt': 'ChatGPT Classic',
            'chat gpt': 'ChatGPT Classic',
            'chatgpt classic': 'ChatGPT Classic',
            'davinci': 'DaVinci Resolve',
            'davinci resolve': 'DaVinci Resolve',
            'camera': 'Photo Booth',
            'photo booth': 'Photo Booth',
            'facetime': 'FaceTime',
            'find my': 'Find My',
            'findmy': 'Find My',
            'image capture': 'Image Capture',
            'iphone mirroring': 'iPhone Mirroring',
            'mission control': 'Mission Control',
            'pdf reader': 'PDF Reader',
            'quicktime': 'QuickTime Player',
            'quicktime player': 'QuickTime Player',
            'settings': 'System Settings',
            'system settings': 'System Settings',
            'time machine': 'Time Machine',
            'voice memos': 'Voice Memos',
            'vlc player': 'VLC',
            'vlc': 'VLC',
            'whatsapp': 'WhatsApp',
            'whats app': 'WhatsApp',
            'app store': 'App Store',
            'font book': 'Font Book',
            'duplicate file finder': 'Duplicate File Finder'
          };

          const targetApp = appAliases[lowerApp] || rawApp;
          const safeApp = targetApp.replace(/"/g, '\\"');

          exec(`open -a "${safeApp}"`, (err) => {
            if (err) {
              console.warn(`Direct open -a failed for ${targetApp}, attempting Spotlight:`, err.message);
              exec(`mdfind "kMDItemKind == 'Application' && kMDItemDisplayName == '*${safeApp}*'" | head -n 1`, (spotErr, stdout) => {
                const foundPath = (stdout || '').trim();
                if (foundPath) {
                  exec(`open "${foundPath.replace(/"/g, '\\"')}"`, () => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: `Spotlight launched ${targetApp}`, path: foundPath }));
                  });
                } else {
                  res.writeHead(400).end(JSON.stringify({ error: `Could not launch ${targetApp}` }));
                }
              });
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: `Successfully launched ${targetApp}` }));
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

        if (action === 'open_url_in_chrome') {
          const rawUrl = (payload.url || 'https://www.google.com').trim();
          const safeUrl = rawUrl.replace(/"/g, '\\"');
          exec(`open -a "Google Chrome" "${safeUrl}"`, (err) => {
            if (err) {
              exec(`open "${safeUrl}"`);
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: `Opened ${rawUrl} in Chrome` }));
          });
          return;
        }

        if (action === 'open_path') {
          const rawTarget = (payload.targetPath || 'Downloads').trim();
          const userHome = process.env.HOME;

          let targetFullPath = '';
          const lower = rawTarget.toLowerCase();

          if (lower === 'downloads' || lower === 'download') targetFullPath = path.join(userHome, 'Downloads');
          else if (lower === 'desktop') targetFullPath = path.join(userHome, 'Desktop');
          else if (lower === 'documents' || lower === 'document') targetFullPath = path.join(userHome, 'Documents');
          else if (lower === 'pictures' || lower === 'photos') targetFullPath = path.join(userHome, 'Pictures');
          else if (lower === 'movies' || lower === 'videos') targetFullPath = path.join(userHome, 'Movies');
          else if (lower === 'music') targetFullPath = path.join(userHome, 'Music');
          else if (rawTarget.startsWith('/') || rawTarget.startsWith('~')) {
            targetFullPath = rawTarget.startsWith('~') ? path.join(userHome, rawTarget.slice(1)) : rawTarget;
          }

          if (targetFullPath && fs.existsSync(targetFullPath)) {
            const safePath = targetFullPath.replace(/"/g, '\\"');
            exec(`open "${safePath}"`, (err) => {
              if (err) return res.writeHead(400).end(JSON.stringify({ error: err.message }));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: `Opened ${targetFullPath}`, path: targetFullPath }));
            });
            return;
          }

          // Use macOS Spotlight search (mdfind) with shell sanitization
          const safeQuery = rawTarget.replace(/"/g, '\\"');
          exec(`mdfind -name "${safeQuery}" | head -n 1`, (err, stdout) => {
            const foundPath = (stdout || '').trim();
            if (foundPath && fs.existsSync(foundPath)) {
              const safeFound = foundPath.replace(/"/g, '\\"');
              exec(`open "${safeFound}"`, () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: `Spotlight found & opened ${foundPath}`, path: foundPath }));
              });
            } else {
              const defaultFolder = path.join(userHome, 'Downloads');
              exec(`open "${defaultFolder}"`, () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: `Opened Downloads folder` }));
              });
            }
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
