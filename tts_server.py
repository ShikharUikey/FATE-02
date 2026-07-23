#!/usr/bin/env python3
"""
FATE Coqui TTS Neural Voice Server
Exposes high-quality female neural speech synthesis via /api/tts?text=...
"""

import os
import sys
import tempfile
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = int(os.environ.get("TTS_PORT", 5000))
TTS_ENGINE = None

def init_tts():
    global TTS_ENGINE
    try:
        from TTS.api import TTS
        print("⚡ Initializing Coqui TTS Neural Model (ljspeech/vits)...")
        # Load high quality female neural voice model
        TTS_ENGINE = TTS(model_name="tts_models/en/ljspeech/vits", progress_bar=False, gpu=False)
        print("✅ Coqui TTS Model initialized successfully!")
    except ImportError:
        print("⚠️ Coqui TTS package not installed. Run: pip install TTS")
        TTS_ENGINE = None
    except Exception as e:
        print("⚠️ Error loading Coqui TTS model:", e)
        TTS_ENGINE = None

class CoquiTTSHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # CORS & Audio Headers
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

        if parsed.path == '/api/tts':
            params = urllib.parse.parse_qs(parsed.query)
            text = params.get('text', [''])[0].strip()

            if not text:
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b"Error: text parameter missing")
                return

            if TTS_ENGINE is None:
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b"Error: Coqui TTS engine not loaded on server")
                return

            try:
                # Generate audio file using Coqui TTS
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                    tmp_path = tmp.name

                TTS_ENGINE.tts_to_file(text=text, file_path=tmp_path)

                with open(tmp_path, 'rb') as f:
                    audio_data = f.read()

                os.remove(tmp_path)

                self.send_header('Content-Type', 'audio/wav')
                self.send_header('Content-Length', str(len(audio_data)))
                self.end_headers()
                self.wfile.write(audio_data)
                return
            except Exception as e:
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(f"TTS Generation Error: {e}".encode('utf-8'))
                return

        elif parsed.path == '/api/status':
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            status_json = '{"status": "online", "coqui_loaded": ' + ("true" if TTS_ENGINE else "false") + '}'
            self.wfile.write(status_json.encode('utf-8'))
            return
        else:
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b"FATE Coqui TTS Server Active. Query /api/tts?text=Hello")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server():
    init_tts()
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, CoquiTTSHandler)
    print(f"\n==================================================")
    print(f"  🎙️ FATE Coqui TTS Server Active on http://localhost:{PORT}")
    print(f"==================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Coqui TTS server...")

if __name__ == '__main__':
    run_server()
